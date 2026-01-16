import styles from './Legal.module.css';

function Privacy() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1>Política de Privacidad</h1>
                <p className={styles.updated}>Última actualización: Diciembre 2024</p>

                <section className={styles.section}>
                    <h2>1. Información que Recopilamos</h2>
                    <p>En ClickNGo recopilamos la siguiente información cuando usas nuestra aplicación:</p>
                    <ul>
                        <li><strong>Datos de cuenta:</strong> Nombre, correo electrónico y contraseña cuando te registras.</li>
                        <li><strong>Datos de perfil de vendedor:</strong> Nombre del negocio, categoría, descripción y ubicación (ciudad/provincia).</li>
                        <li><strong>Contenido:</strong> Fotos de productos, descripciones, precios y promociones que publiques.</li>
                        <li><strong>Ubicación:</strong> Solo si das permiso, para mostrar vendedores cerca de ti.</li>
                        <li><strong>Comunicaciones:</strong> Mensajes enviados a través del chat de la aplicación.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>2. Cómo Usamos la Información</h2>
                    <p>Usamos tus datos para:</p>
                    <ul>
                        <li>Crear y mantener tu cuenta</li>
                        <li>Mostrar tu perfil y productos a potenciales clientes</li>
                        <li>Facilitar la comunicación entre compradores y vendedores</li>
                        <li>Mejorar la experiencia de la aplicación</li>
                        <li>Enviar notificaciones relevantes (nuevos mensajes, reseñas, etc.)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>3. Compartición de Datos</h2>
                    <p><strong>NO vendemos tu información personal.</strong></p>
                    <p>Compartimos datos solo en estos casos:</p>
                    <ul>
                        <li><strong>Perfil público:</strong> Tu nombre de negocio, categoría, descripción, ciudad y productos son visibles públicamente.</li>
                        <li><strong>Otros usuarios:</strong> Cuando inicias un chat, el otro usuario ve tu nombre.</li>
                        <li><strong>Obligación legal:</strong> Si la ley lo requiere.</li>
                    </ul>
                    <p><strong>Protección especial:</strong> Tu número de teléfono personal NUNCA se comparte públicamente.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. Almacenamiento y Seguridad</h2>
                    <ul>
                        <li>Tus datos se almacenan en servidores seguros</li>
                        <li>Las contraseñas se guardan encriptadas (hash + salt)</li>
                        <li>Usamos HTTPS para todas las comunicaciones</li>
                        <li>No almacenamos datos de pago (no procesamos pagos)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>5. Tus Derechos</h2>
                    <p>Tenés derecho a:</p>
                    <ul>
                        <li><strong>Acceder</strong> a tu información personal</li>
                        <li><strong>Modificar</strong> tus datos desde tu perfil</li>
                        <li><strong>Eliminar</strong> tu cuenta y todos tus datos</li>
                        <li><strong>Revocar</strong> permisos de ubicación desde la configuración de tu dispositivo</li>
                    </ul>
                    <p>Para ejercer estos derechos, contactanos por: <a href="https://m.me/61584957903862" target="_blank" rel="noopener noreferrer">Messenger de Facebook</a></p>
                </section>

                <section className={styles.section}>
                    <h2>6. Cookies y Almacenamiento Local</h2>
                    <p>Usamos almacenamiento local del navegador/app para:</p>
                    <ul>
                        <li>Mantener tu sesión iniciada</li>
                        <li>Recordar tus preferencias</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>7. Menores de Edad</h2>
                    <p>ClickNGo está destinado a mayores de 18 años. No recopilamos intencionalmente datos de menores.</p>
                </section>

                <section className={styles.section}>
                    <h2>8. Cambios a esta Política</h2>
                    <p>Podemos actualizar esta política. Te notificaremos cambios importantes a través de la aplicación.</p>
                </section>

                <section className={styles.section}>
                    <h2>9. Contacto</h2>
                    <p>Para consultas sobre privacidad:</p>
                    <ul>
                        <li>Messenger: <a href="https://m.me/61584957903862" target="_blank" rel="noopener noreferrer">Página de Facebook</a></li>
                        <li>Web: <a href="https://clickngo.bdsmbefree.com">clickngo.bdsmbefree.com</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

export default Privacy;
