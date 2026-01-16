# 🚀 Guía de Despliegue: clickngo.bdsmbefree.com

## Paso 1: Configurar DNS en DigitalOcean

1. Ir a **Networking** → **Domains** → `bdsmbefree.com`
2. Agregar registro:
   - **Type**: `A`
   - **Hostname**: `clickngo`
   - **Will Direct To**: `(tu droplet o IP)`
   - **TTL**: 3600

⏱️ Esperar ~5-10 minutos para propagación DNS.

---

## Paso 2: Crear Directorio en el VPS

```bash
# Conectar al VPS
ssh root@TU_IP_DEL_DROPLET

# Crear directorio para ClickNGo
sudo mkdir -p /var/www/clickngo
sudo chown -R $USER:$USER /var/www/clickngo
```

---

## Paso 3: Configurar Nginx

```bash
# Crear configuración del subdominio
sudo nano /etc/nginx/sites-available/clickngo
```

Contenido del archivo:
```nginx
server {
    listen 80;
    server_name clickngo.bdsmbefree.com;

    # Frontend (React build estático)
    location / {
        root /var/www/clickngo/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/clickngo /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## Paso 4: Configurar SSL con Certbot

```bash
sudo certbot --nginx -d clickngo.bdsmbefree.com
```

Seleccionar "redirect HTTP to HTTPS" cuando pregunte.

---

## Paso 5: Clonar y Desplegar el Proyecto

```bash
cd /var/www/clickngo

# Clonar repositorio (cuando esté listo en GitHub)
git clone https://github.com/TU_USUARIO/clickngo.git .

# Instalar dependencias
npm run install:all

# Build del frontend
npm run build

# Configurar variables de entorno del servidor
cp server/.env.example server/.env
nano server/.env
```

---

## Paso 6: Configurar PM2

```bash
# Iniciar el servidor backend
cd /var/www/clickngo/server
pm2 start npm --name "clickngo-api" -- start

# Guardar configuración PM2
pm2 save

# Ver logs
pm2 logs clickngo-api
```

---

## 📝 Puertos Sugeridos

| Proyecto | Puerto Backend |
|----------|----------------|
| BDSMPortal | 3001 (o el actual) |
| ClickNGo | 3002 |

---

## ✅ Verificación

1. Abrir https://clickngo.bdsmbefree.com
2. Verificar que el SSL funciona (candado verde)
3. Probar endpoint API: https://clickngo.bdsmbefree.com/api/health
