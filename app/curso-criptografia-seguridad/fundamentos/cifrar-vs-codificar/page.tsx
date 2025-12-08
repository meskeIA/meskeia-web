'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function CifrarVsCodificarPage() {
  return (
    <ChapterPage chapterId="cifrar-vs-codificar">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En el mundo digital actual, proteger la información es más crucial que nunca. Pero antes de aprender a proteger datos, necesitamos entender dos conceptos fundamentales que muchos confunden: cifrar y codificar. ¿Son lo mismo? La respuesta corta es no, y en este capítulo descubrirás por qué esta distinción puede marcar la diferencia entre la seguridad y la vulnerabilidad.</p>
      </section>

        {/* Sección: ¿Qué significa cifrar? */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>¿Qué significa cifrar?</h2>
          </div>
          <p>Cifrar es un proceso de transformación de información utilizando una clave secreta específica, con el objetivo de hacerla completamente ilegible para cualquier persona que no tenga dicha clave. Es como crear un mensaje secreto que solo puede ser descifrado por alguien que conoce el método exacto de desencriptación. Un ejemplo clásico es el cifrado AES (Advanced Encryption Standard), utilizado por bancos, gobiernos y sistemas de seguridad críticos.</p>
          <p>Las características principales del cifrado son:\n- Requiere una clave secreta\n- La transformación es matemáticamente compleja\n- Sin la clave, el mensaje es prácticamente imposible de leer\n- Busca proteger la confidencialidad de la información</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Imagina que escribes una carta a tu mejor amigo y la envuelves en un código que solo él puede descifrar usando una clave secreta previamente acordada. Nadie más podrá leer el contenido sin esa clave específica.</p>
          </div>
        </section>

        {/* Sección: ¿Qué significa codificar? */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>¿Qué significa codificar?</h2>
          </div>
          <p>Codificar es un proceso de transformación de datos que permite una conversión reversible y predecible. A diferencia del cifrado, la codificación no busca ocultar información, sino representarla de una manera diferente que facilite su transmisión o almacenamiento. Los sistemas de codificación son públicos y conocidos, como Base64, que permite convertir datos binarios en texto legible.</p>
          <p>Las características principales de la codificación son:\n- No requiere una clave secreta\n- La transformación es simple y reversible\n- Cualquiera con conocimiento del método puede decodificar\n- Busca facilitar la transmisión de datos</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Base64 es como traducir un texto del español al inglés. Cualquiera que conozca ambos idiomas puede hacer la traducción de ida y vuelta sin problema.</p>
          </div>
        </section>

        {/* Sección: Base64: Un ejemplo de codificación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Base64: Un ejemplo de codificación</h2>
          </div>
          <p>Base64 es un método de codificación que convierte datos binarios en una representación de texto usando 64 caracteres posibles. Se usa frecuentemente para enviar archivos adjuntos por correo electrónico o incrustar pequeños recursos en páginas web. No ofrece seguridad, solo representación.</p>
          <p>Por ejemplo, la palabra 'Hola' en Base64 se convierte en 'SG9sYQ=='.</p>
          <p>Importante: Base64 NO es un método de cifrado y no protege la información de miradas no autorizadas.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En aplicaciones web, Base64 permite enviar imágenes pequeñas directamente en el código HTML, facilitando la transmisión de datos.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Cifrar requiere una clave secreta y busca proteger la información</li>
            <li>Codificar es una transformación reversible y pública</li>
            <li>Base64 es un método de codificación, NO de cifrado</li>
            <li>La seguridad depende de entender estas diferencias</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Por qué no deberías usar codificación cuando necesitas seguridad?</li>
            <li>¿Qué sucedería si compartes tu clave de cifrado?</li>
            <li>¿Cómo afecta la elección entre cifrar y codificar a la protección de datos?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El primer método de cifrado documentado fue el Cifrado de César, usado por Julio César para comunicaciones militares, donde cada letra se desplazaba 3 posiciones en el alfabeto.</p>
      </div>

      {/* Herramienta Vinculada */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Practica la diferencia</h4>
        <p>Experimenta con Base64 para ver cómo la codificación es completamente reversible sin clave secreta.</p>
        <a href="/codificador-base64/" className={styles.toolLinkButton}>
          Abrir Codificador Base64 →
        </a>
      </div>
    </ChapterPage>
  );
}
