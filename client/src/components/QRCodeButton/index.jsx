import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiX, FiDownload, FiShare2 } from 'react-icons/fi';
import styles from './QRCodeButton.module.css';

function QRCodeButton({ url, title = 'Compartir', size = 200 }) {
    const [showModal, setShowModal] = useState(false);
    const qrRef = useRef(null);

    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

    const handleDownload = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = size + 40;
        canvas.height = size + 80;

        img.onload = () => {
            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // QR code
            ctx.drawImage(img, 20, 20);

            // Title
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(title, canvas.width / 2, size + 50);

            // Download
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Mira ${title} en ClickNGo`,
                    url: fullUrl
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(fullUrl);
            alert('Link copiado al portapapeles!');
        }
    };

    return (
        <>
            <button
                className={styles.qrButton}
                onClick={() => setShowModal(true)}
                title="Generar QR Code"
            >
                📱 QR
            </button>

            {showModal && (
                <div className={styles.overlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setShowModal(false)}
                        >
                            <FiX />
                        </button>

                        <h2>📱 Código QR</h2>
                        <p className={styles.title}>{title}</p>

                        <div className={styles.qrContainer} ref={qrRef}>
                            <QRCodeSVG
                                value={fullUrl}
                                size={size}
                                level="H"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        </div>

                        <p className={styles.urlText}>{fullUrl}</p>

                        <div className={styles.actions}>
                            <button onClick={handleDownload} className={styles.actionBtn}>
                                <FiDownload /> Descargar
                            </button>
                            <button onClick={handleShare} className={styles.actionBtn}>
                                <FiShare2 /> Compartir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default QRCodeButton;
