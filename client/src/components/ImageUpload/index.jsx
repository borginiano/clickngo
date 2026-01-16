import { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiCamera } from 'react-icons/fi';
import { uploadAPI, BASE_URL } from '../../api';
import toast from 'react-hot-toast';
import styles from './ImageUpload.module.css';

function ImageUpload({
    value = [],
    onChange,
    maxFiles = 3,
    accept = 'image/jpeg,image/png,image/webp',
    single = false
}) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);
    const cameraRef = useRef(null);

    const images = Array.isArray(value) ? value : (value ? [value] : []);

    const handleFiles = async (files) => {
        const fileList = Array.from(files);

        if (single && fileList.length > 1) {
            toast.error('Solo puedes subir una imagen');
            return;
        }

        if (!single && images.length + fileList.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} imágenes`);
            return;
        }

        setUploading(true);
        try {
            if (single) {
                const { data } = await uploadAPI.uploadImage(fileList[0]);
                onChange(data.url);
                toast.success('Imagen subida');
            } else {
                const newUrls = [];
                for (const file of fileList) {
                    const { data } = await uploadAPI.uploadImage(file);
                    newUrls.push(data.url);
                }
                onChange([...images, ...newUrls]);
                toast.success(`${newUrls.length} imagen(es) subida(s)`);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const handleRemove = (index) => {
        if (single) {
            onChange(null);
        } else {
            const newImages = images.filter((_, i) => i !== index);
            onChange(newImages);
        }
    };

    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    const canUploadMore = single ? !images.length : images.length < maxFiles;

    return (
        <div className={styles.container}>
            {canUploadMore && (
                <>
                    <div className={styles.uploadButtons}>
                        <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => inputRef.current?.click()}
                        >
                            <FiUploadCloud />
                            <span>Galería</span>
                        </button>
                        <button
                            type="button"
                            className={styles.cameraBtn}
                            onClick={() => cameraRef.current?.click()}
                        >
                            <FiCamera />
                            <span>Cámara</span>
                        </button>
                    </div>

                    <div
                        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
                        onClick={() => inputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <FiUploadCloud className={styles.dropzoneIcon} />
                        <p className={styles.dropzoneText}>
                            Arrastra imágenes aquí
                        </p>
                        <p className={styles.dropzoneHint}>
                            {single ? 'JPG, PNG o WebP, máx 5MB' : `Hasta ${maxFiles} imágenes, máx 5MB c/u`}
                        </p>
                    </div>

                    {/* Hidden file inputs */}
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        multiple={!single}
                        onChange={(e) => handleFiles(e.target.files)}
                        style={{ display: 'none' }}
                    />
                    {/* Camera input for mobile */}
                    <input
                        ref={cameraRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFiles(e.target.files)}
                        style={{ display: 'none' }}
                    />
                </>
            )}

            {images.length > 0 && (
                single ? (
                    <div className={styles.avatarPreview}>
                        <img src={getFullUrl(images[0])} alt="Preview" />
                        <div className={styles.avatarOverlay} onClick={() => inputRef.current?.click()}>
                            <span>Cambiar</span>
                        </div>
                        {uploading && <div className={styles.uploading}>Subiendo...</div>}
                    </div>
                ) : (
                    <div className={styles.previewGrid}>
                        {images.map((url, index) => (
                            <div key={index} className={styles.previewItem}>
                                <img src={getFullUrl(url)} alt={`Preview ${index + 1}`} />
                                <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => handleRemove(index)}
                                >
                                    <FiX />
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}

            {uploading && !single && <p style={{ color: 'var(--text-muted)' }}>Subiendo...</p>}
        </div>
    );
}

export default ImageUpload;
