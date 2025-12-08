'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function HttpsCertificadosPage() {
  return (
    <ChapterPage chapterId="https-certificados">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Cada vez que escribes un correo, compras online o accedes a tu cuenta bancaria, existe un guardián digital invisible protegiendo tu información. Ese guardián se llama HTTPS, un protocolo de seguridad que funciona como un escudo invisible contra los ciberdelincuentes. En este capítulo, descubrirás cómo este protocolo transforma internet en un espacio más seguro.</p>
      </section>

        {/* Sección: ¿Qué es HTTPS y por qué importa? */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>¿Qué es HTTPS y por qué importa?</h2>
          </div>
          <p>HTTPS (Hypertext Transfer Protocol Secure) es una versión segura del protocolo HTTP tradicional. Mientras HTTP envía información como una postal abierta que cualquiera puede leer, HTTPS funciona como un sobre cerrado con un sello de seguridad. Cuando visitas un sitio web con HTTPS, todos los datos que envías y recibes se encriptan, impidiendo que terceros no autorizados puedan interceptar o manipular tu información.</p>
          <p>La diferencia fundamental radica en la capa de seguridad adicional proporcionada por los certificados SSL/TLS, que establecen una conexión cifrada entre tu navegador y el servidor web. Esta conexión garantiza tres aspectos fundamentales: confidencialidad (nadie más puede leer los datos), integridad (los datos no pueden ser modificados durante la transmisión) y autenticación (verificas que estás conectándote al sitio web correcto).</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Imagina que HTTPS es como un mensajero diplomático que transporta documentos confidenciales. Así como el diplomático tiene un maletín sellado que nadie más puede abrir, HTTPS protege tu información con candados digitales.</p>
          </div>
        </section>

        {/* Sección: Certificados SSL/TLS: El Pasaporte Digital de los Sitios Web */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Certificados SSL/TLS: El Pasaporte Digital de los Sitios Web</h2>
          </div>
          <p>Los certificados SSL/TLS son como pasaportes digitales que identifican y validan la identidad de un sitio web. Emitidos por Autoridades de Certificación (CA), estos documentos digitales contienen información crucial: la identidad del sitio web, su clave pública y la firma digital que garantiza su autenticidad.</p>
          <p>Cuando tu navegador se conecta a un sitio web seguro, ocurre un proceso llamado 'handshake' o apretón de manos digital. Este proceso es similar a una conversación secreta donde el navegador y el servidor intercambian claves de forma que nadie más pueda entender su comunicación.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Es como cuando dos agentes secretos se encuentran y verifican sus credenciales antes de comenzar una conversación confidencial. El certificado SSL es la credencial que permite iniciar esa comunicación segura.</p>
          </div>
        </section>

        {/* Sección: El Candado Verde: Señal de Seguridad Digital */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>El Candado Verde: Señal de Seguridad Digital</h2>
          </div>
          <p>El candado verde en tu navegador no es solo un símbolo decorativo, es una señal importante de seguridad. Cuando lo ves, significa que el sitio web ha sido verificado y que tu conexión está protegida. Este pequeño icono representa que el sitio tiene un certificado SSL válido y que tus datos están siendo transmitidos de forma segura.</p>
          <p>Los certificados pueden ser de diferentes tipos: Domain Validation (DV), Organization Validation (OV) y Extended Validation (EV), siendo este último el más riguroso y el que muestra el candado verde más distintivo.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Es como un sello de calidad en un producto: no solo indica que es seguro, sino que ha pasado por un proceso de verificación exhaustivo.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>HTTPS transforma la comunicación web en un canal seguro y cifrado</li>
            <li>Los certificados SSL son pasaportes digitales que garantizan la identidad de un sitio web</li>
            <li>El candado verde es una señal visual de conexión segura</li>
            <li>La encriptación protege tu información de miradas no autorizadas</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo puedes identificar si un sitio web es seguro?</li>
            <li>¿Qué riesgos existen al navegar en sitios sin HTTPS?</li>
            <li>¿Cómo afecta HTTPS a tu seguridad digital cotidiana?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En 2018, Google comenzó a marcar todos los sitios sin HTTPS como 'No seguros' en Chrome, impulsando una adopción masiva de este protocolo de seguridad.</p>
      </div>
    </ChapterPage>
  );
}
