'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function SimetricoAsimetricoPage() {
  return (
    <ChapterPage chapterId="simetrico-asimetrico">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La criptografía es el arte de proteger la información, y sus métodos han evolucionado dramáticamente desde los antiguos cifrados hasta las complejas técnicas modernas. En este capítulo, exploraremos dos estrategias fundamentales para mantener nuestros datos seguros: el cifrado simétrico y el asimétrico, descubriendo cómo cada uno protege nuestra información de miradas indiscretas.</p>
      </section>

        {/* Sección: Cifrado Simétrico: Una Llave para Todo */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Cifrado Simétrico: Una Llave para Todo</h2>
          </div>
          <p>El cifrado simétrico funciona como una caja fuerte con una única llave. Tanto el emisor como el receptor utilizan exactamente la mismo clave para cifrar y descifrar el mensaje. Es como tener un candado donde todos los que necesitan abrir tienen una copia idéntica de la llave. Este método es rápido, computacionalmente eficiente y ideal para grandes volúmenes de datos.</p>
          <p>Los algoritmos simétricos más conocidos incluyen DES (Data Encryption Standard), 3DES y AES (Advanced Encryption Standard). AES, por ejemplo, usa claves de 128, 192 o 256 bits, ofreciendo diferentes niveles de seguridad según la longitud de la clave.</p>
          <p>Su principal desventaja es el problema del intercambio seguro de la clave inicial: ¿cómo compartes la llave sin que alguien más la pueda interceptar?</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Imagina que quieres enviar un mensaje secreto a tu mejor amigo. Ambos tienen una copia de una llave especial. Con esa llave, pueden bloquear y desbloquear el mensaje, pero si un extraño la consigue, todo el sistema de seguridad se rompe.</p>
          </div>
        </section>

        {/* Sección: Cifrado Asimétrico: Dos Llaves Complementarias */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Cifrado Asimétrico: Dos Llaves Complementarias</h2>
          </div>
          <p>El cifrado asimétrico, también conocido como criptografía de clave pública, resuelve el problema del intercambio de claves mediante un sistema de dos llaves complementarias: una pública y otra privada. Es como un buzón postal donde cualquiera puede depositar cartas (usar la llave pública), pero solo el dueño del buzón puede abrirlo (con su llave privada).</p>
          <p>Algoritmos como RSA permiten generar estas parejas de claves matemáticamente vinculadas pero imposibles de deducir una de la otra. La clave pública se puede compartir abiertamente, mientras que la privada se mantiene en secreto.</p>
          <p>Este método es más lento que el simétrico, por lo que generalmente se usa para intercambiar claves simétricas o firmar digitalmente documentos, no para cifrar grandes volúmenes de información.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando realizas una compra online y ingresas tus datos de tarjeta, estás usando la llave pública del sitio web para proteger esa información durante la transmisión.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>El cifrado simétrico usa una única llave para cifrar y descifrar</li>
            <li>El cifrado asimétrico usa dos llaves complementarias</li>
            <li>La seguridad depende de mantener secreta la clave privada</li>
            <li>Cada método tiene casos de uso específicos</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Por qué es importante tener diferentes métodos de cifrado?</li>
            <li>¿Cómo protegerías tu llave privada en un sistema de cifrado asimétrico?</li>
            <li>¿En qué situaciones cotidianas usamos criptografía sin darnos cuenta?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El primer sistema de cifrado asimétrico, RSA, fue desarrollado en 1977 por Ron Rivest, Adi Shamir y Leonard Adleman en el MIT, revolucionando completamente la seguridad informática.</p>
      </div>
    </ChapterPage>
  );
}
