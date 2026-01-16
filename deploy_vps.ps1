$ErrorActionPreference = "Stop"

# =====================================================
# CLICKNGO VPS DEPLOYMENT SCRIPT
# =====================================================
# Deploys frontend (client) and backend (server) to VPS
# VPS: root@142.93.66.228
# Path: /var/www/clickngo
# =====================================================

$VPS_HOST = "root@142.93.66.228"
$VPS_PATH = "/var/www/clickngo"

# --- STEP 1: PRE-CLEANUP & LINT CHECK ---
Write-Host "`n[SHIELD] Scanning code for critical errors..." -ForegroundColor Cyan

# Clean temp artifacts that might cause lint errors
if (Test-Path "client\temp_check") { Remove-Item "client\temp_check" -Recurse -Force -ErrorAction SilentlyContinue }

Push-Location client
try {
    # Run lint and capture exit code
    npm run lint -- --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[SHIELD] CRITICAL ERROR FOUND. Deployment Aborted." -ForegroundColor Red
        Write-Host "Please fix the lint errors above before deploying." -ForegroundColor Yellow
        Pop-Location
        exit 1
    }
    Write-Host "[SHIELD] Integrity Check Passed." -ForegroundColor Green
}
catch {
    # If npm run lint fails to execute (e.g. script missing), warns but continues
    # But if it executed and returned error code, the block above handles it.
    # Here we catch execution errors.
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[SHIELD] CRITICAL ERROR FOUND during lint execution." -ForegroundColor Red
        Pop-Location
        exit 1
    }
}
Pop-Location

# --- STEP 2: BUILD FRONTEND ---
Write-Host "`n[BUILD] Building Frontend..." -ForegroundColor Cyan
Push-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "[BUILD] Frontend built successfully" -ForegroundColor Green

# --- STEP 3: PACKAGE FOR DEPLOYMENT ---
Write-Host "`n[PACKAGE] Creating deployment archive..." -ForegroundColor Cyan

# Create temp folder for packaging
$tempDir = "deploy_temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy dist (frontend) to temp/client/dist to match Nginx legacy path
New-Item -ItemType Directory -Path "$tempDir\client" | Out-Null
Copy-Item -Path "client\dist" -Destination "$tempDir\client\dist" -Recurse

# Copy server folder (excluding node_modules)
New-Item -ItemType Directory -Path "$tempDir\server" | Out-Null
Copy-Item -Path "server\src" -Destination "$tempDir\server\src" -Recurse
Copy-Item -Path "server\prisma" -Destination "$tempDir\server\prisma" -Recurse
Copy-Item -Path "server\package.json" -Destination "$tempDir\server\"
Copy-Item -Path "server\package-lock.json" -Destination "$tempDir\server\" -ErrorAction SilentlyContinue
if (Test-Path "server\firebase-service-account.json") {
    Copy-Item -Path "server\firebase-service-account.json" -Destination "$tempDir\server\"
}
if (Test-Path "server\.env.production") {
    Copy-Item -Path "server\.env.production" -Destination "$tempDir\server\.env"
}

# Create tar archive
Push-Location $tempDir
tar -czf "..\deploy_update.tar.gz" *
Pop-Location

# Clean temp folder
Remove-Item $tempDir -Recurse -Force

if (-not (Test-Path "deploy_update.tar.gz")) {
    Write-Host "[ERROR] Failed to create archive" -ForegroundColor Red
    exit 1
}

$archiveSize = (Get-Item "deploy_update.tar.gz").Length / 1MB
Write-Host "[PACKAGE] Archive created: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Green

# --- STEP 4: UPLOAD TO VPS ---
Write-Host "`n[UPLOAD] Uploading to VPS..." -ForegroundColor Cyan
scp deploy_update.tar.gz "${VPS_HOST}:${VPS_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Upload failed" -ForegroundColor Red
    exit 1
}
Write-Host "[UPLOAD] Upload complete" -ForegroundColor Green

# --- STEP 5: EXTRACT AND RESTART ON VPS ---
Write-Host "`n[DEPLOY] Extracting and restarting on VPS..." -ForegroundColor Cyan

# Single line command to avoid CRLF issues
# Using ./node_modules/.bin/prisma specifically to avoid version mismatch
$remoteCommand = "cd $VPS_PATH && echo '[CLEANUP] Cleaning old version...' && rm -rf client/dist && tar -xzf deploy_update.tar.gz && echo '[DEPS] Installing server dependencies...' && cd server && npm install --legacy-peer-deps && echo '[DB] Pushing Prisma schema...' && ./node_modules/.bin/prisma db push --accept-data-loss && ./node_modules/.bin/prisma generate && cd .. && echo '[PM2] Restarting API...' && pm2 restart clickngo-api && echo '[CLEANUP] Removing archive...' && rm -f deploy_update.tar.gz && echo '[SUCCESS] Deployment complete!'"

ssh $VPS_HOST $remoteCommand
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Remote deployment failed" -ForegroundColor Red
    exit 1
}

# --- STEP 6: CLEANUP LOCAL ---
Write-Host "`n[CLEANUP] Cleaning up local files..." -ForegroundColor Cyan
Remove-Item "deploy_update.tar.gz" -Force -ErrorAction SilentlyContinue

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "VPS: $VPS_HOST"
Write-Host "Path: $VPS_PATH"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
