import styles from './Legal.module.css';

function Terms() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1>Términos y Condiciones</h1>
                <p className={styles.updated}>Última actualización: Diciembre 2024</p>

                <section className={styles.section}>
                    <h2>1. Aceptación de los Términos</h2>
                    <p>Al usar ClickNGo, aceptás estos términos y condiciones. Si no estás de acuerdo, no uses la aplicación.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. Descripción del Servicio</h2>
                    <p>ClickNGo es una plataforma que conecta vendedores ambulantes y emprendedores locales con compradores. Nosotros:</p>
                    <ul>
                        <li>Facilitamos la publicación de productos y servicios</li>
                        <li>Proporcionamos herramientas de comunicación entre usuarios</li>
                        <li>NO intervenimos en las transacciones comerciales</li>
                        <li>NO procesamos pagos ni garantizamos entregas</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>3. Registro y Cuentas</h2>
                    <ul>
                        <li>Debés ser mayor de 18 años para registrarte</li>
                        <li>La información proporcionada debe ser veraz</li>
                        <li>Sos responsable de mantener la seguridad de tu cuenta</li>
                        <li>Una persona o negocio puede tener solo una cuenta</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>4. Reglas para Vendedores</h2>
                    <p>Como vendedor, te comprometés a:</p>
                    <ul>
                        <li>Publicar información veraz sobre tus productos/servicios</li>
                        <li>Usar fotos propias y reales de tus productos</li>
                        <li>Mantener precios actualizados</li>
                        <li>Responder a los clientes de forma respetuosa</li>
                        <li>Cumplir con las leyes locales de comercio y facturación</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>5. Contenido Prohibido</h2>
                    <p>Está prohibido publicar:</p>
                    <ul>
                        <li>Productos ilegales o robados</li>
                        <li>Armas, drogas o sustancias controladas</li>
                        <li>Productos falsificados o piratas</li>
                        <li>Contenido ofensivo, discriminatorio o que incite al odio</li>
                        <li>Servicios sexuales o de escort</li>
                        <li>Información falsa o engañosa</li>
                        <li>Spam o publicidad no relacionada</li>
                    </ul>
                    <p>Nos reservamos el derecho de eliminar contenido y suspender cuentas que violen estas reglas.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. Reglas para Compradores</h2>
                    <ul>
                        <li>Comunicarse de forma respetuosa con los vendedores</li>
                        <li>No realizar reseñas falsas o malintencionadas</li>
                        <li>Las transacciones se realizan directamente con el vendedor</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>7. Responsabilidad Limitada</h2>
                    <p>ClickNGo actúa únicamente como intermediario. <strong>NO somos responsables de:</strong></p>
                    <ul>
                        <li>La calidad de los productos o servicios ofrecidos</li>
                        <li>Disputas entre compradores y vendedores</li>
                        <li>Pagos, entregas o devoluciones</li>
                        <li>Pérdidas económicas derivadas del uso de la plataforma</li>
                        <li>Daños causados por terceros</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>8. Propiedad Intelectual</h2>
                    <ul>
                        <li>ClickNGo y su diseño son propiedad de sus creadores</li>
                        <li>Los vendedores retienen los derechos de su contenido</li>
                        <li>Al publicar, nos otorgás licencia para mostrar tu contenido en la plataforma</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>9. Suscripciones Premium</h2>
                    <p>Las suscripciones premium:</p>
                    <ul>
                        <li>Ofrecen beneficios adicionales (más productos, destacados, etc.)</li>
                        <li>Se renuevan según el plan elegido</li>
                        <li>Pueden cancelarse en cualquier momento</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>10. Modificaciones</h2>
                    <p>Podemos modificar estos términos. Los cambios serán notificados a través de la aplicación. El uso continuado implica aceptación de los cambios.</p>
                </section>

                <section className={styles.section}>
                    <h2>11. Terminación</h2>
                    <p>Podemos suspender o cancelar tu cuenta si:</p>
                    <ul>
                        <li>Violás estos términos</li>
                        <li>Recibimos múltiples denuncias</li>
                        <li>Detectamos actividad fraudulenta</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>12. Ley Aplicable</h2>
                    <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta en los tribunales competentes de la Ciudad de Buenos Aires.</p>
                </section>

                <section className={styles.section}>
                    <h2>13. Contacto</h2>
                    <p>Para consultas:</p>
                    <ul>
                        <li>Messenger: <a href="https://m.me/61584957903862" target="_blank" rel="noopener noreferrer">Página de Facebook</a></li>
                        <li>Web: <a href="https://clickngo.bdsmbefree.com">clickngo.bdsmbefree.com</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

export default Terms;
