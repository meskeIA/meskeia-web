'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function AesEstandarPage() {
  return (
    <ChapterPage chapterId="aes-estandar">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagina que tienes un tesoro digital que necesitas proteger de miradas indiscretas. AES (Advanced Encryption Standard) es como una caja fuerte ultrasegura para tus datos más valiosos, utilizada por gobiernos, bancos y empresas tecnológicas en todo el mundo para blindar información confidencial.</p>
      </section>

        {/* Sección: ¿Qué es AES y por qué es tan importante? */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>¿Qué es AES y por qué es tan importante?</h2>
          </div>
          <p>AES es un algoritmo de cifrado simétrico desarrollado por el Instituto Nacional de Estándares y Tecnología (NIST) de Estados Unidos en 2001. Su objetivo principal es convertir información legible en un código completamente ilegible que solo puede ser descifrado con una clave específica. A diferencia de sus predecesores, AES representa un salto cualitativo en seguridad digital, ofreciendo una protección robusta contra intentos de hackeo y interceptación de datos.</p>
          <p>La fortaleza de AES radica en su diseño matemático complejo, que utiliza una serie de transformaciones y sustituciones que hacen extremadamente difícil romper su código. Podríamos compararlo con un laberinto digital donde cada dato pasa por múltiples capas de seguridad antes de ser completamente transformado.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando envías un mensaje por WhatsApp o realizas una compra online, AES está trabajando en segundo plano para garantizar que nadie más pueda leer tu información personal.</p>
          </div>
        </section>

        {/* Sección: Tamaños de Clave: La Fortaleza de AES */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Tamaños de Clave: La Fortaleza de AES</h2>
          </div>
          <p>AES opera con tres tamaños de clave principales: 128, 192 y 256 bits. Cada incremento representa un aumento exponencial en la complejidad y seguridad del cifrado. Para ponerlo en perspectiva, una clave AES de 256 bits es tan compleja que intentar romperla mediante fuerza bruta tomaría más tiempo que la edad del universo.</p>
          <p>El proceso de cifrado implica múltiples rondas de transformaciones donde los datos originales se mezclan, sustituyen y reorganizan de manera pseudoaleatoria. Cuantos más bits tenga la clave, más rondas de transformación se realizarán, incrementando la seguridad del proceso.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Es como tener una puerta con diferentes números de cerraduras: cuantas más cerraduras añadas, más difícil será abrirla sin la llave correcta.</p>
          </div>
        </section>

        {/* Sección: Modos de Operación: Versatilidad de AES */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Modos de Operación: Versatilidad de AES</h2>
          </div>
          <p>AES no es un algoritmo rígido, sino que puede adaptarse a diferentes escenarios mediante sus modos de operación. Los más destacados son CBC (Cipher Block Chaining) y GCM (Galois/Counter Mode). CBC encadena bloques de datos añadiendo aleatoriedad entre ellos, mientras que GCM ofrece tanto confidencialidad como integridad de los datos.</p>
          <p>Cada modo tiene sus fortalezas específicas: CBC es más tradicional y robusto, mientras que GCM es más moderno y eficiente, especialmente en entornos que requieren alta velocidad de procesamiento.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Es como tener diferentes tipos de candados para distintas situaciones: uno para una maleta, otro para una caja fuerte, cada uno con su mecanismo específico.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>AES es el estándar mundial de cifrado</li>
            <li>Ofrece tres niveles de seguridad (128, 192 y 256 bits)</li>
            <li>Utilizado en comunicaciones bancarias, gubernamentales y tecnológicas</li>
            <li>Protege datos en reposo y en tránsito</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Qué datos tuyos necesitarían estar protegidos con AES?</li>
            <li>¿Cómo afectaría a tu vida diaria un hackeo de información?</li>
            <li>¿Qué otras tecnologías de seguridad conoces?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El algoritmo AES fue seleccionado mediante un concurso público donde criptógrafos de todo el mundo compitieron por desarrollar el mejor método de cifrado, algo similar a una &apos;olimpiada&apos; de la seguridad informática.</p>
      </div>

      {/* Herramienta Vinculada */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Prueba el cifrado AES</h4>
        <p>Cifra y descifra mensajes usando el estándar mundial de seguridad con nuestra herramienta interactiva.</p>
        <a href="/cifrado-aes/" className={styles.toolLinkButton}>
          Abrir Cifrado AES →
        </a>
      </div>
    </ChapterPage>
  );
}
