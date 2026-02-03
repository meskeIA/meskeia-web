'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function AlgoritmosHashPage() {
  return (
    <ChapterPage chapterId="algoritmos-hash">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Las funciones hash son como el ADN digital de cualquier archivo o dato, creando una huella única e irreconocible a partir de su contenido original. En este capítulo, exploraremos tres algoritmos fundamentales que han marcado la historia de la criptografía moderna: MD5, SHA-1 y SHA-256, desentrañando sus secretos, evolución y aplicaciones actuales.</p>
      </section>

        {/* Sección: MD5: El pionero con días contados */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>MD5: El pionero con días contados</h2>
          </div>
          <p>MD5 (Message Digest algorithm 5) fue desarrollado en 1991 por Ronald Rivest como una mejora del algoritmo MD4. Originalmente concebido para generar hashes criptográficos seguros, pronto mostró vulnerabilidades críticas que lo descalificaron para propósitos de seguridad. Su función principal era crear una representación única de 128 bits para cualquier archivo o mensaje, actuando como una especie de 'huella digital' digital. Sin embargo, investigadores demostraron que era posible generar colisiones (dos archivos diferentes con el mismo hash), lo que representa un riesgo de seguridad significativo.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Por ejemplo, un desarrollador de software podría usar MD5 para verificar la integridad de archivos descargados, pero NO para proteger contraseñas o datos sensibles.</p>
          </div>
        </section>

        {/* Sección: SHA-1: El sucesor comprometido */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>SHA-1: El sucesor comprometido</h2>
          </div>
          <p>Desarrollado por la NSA en 1995, SHA-1 (Secure Hash Algorithm 1) fue diseñado para superar las limitaciones de MD5. Generaba hashes de 160 bits, ofreciendo aparentemente mayor seguridad. No obstante, en 2005 se revelaron vulnerabilidades importantes que lo hicieron poco recomendable para protección criptográfica. A pesar de sus debilidades, SHA-1 siguió siendo utilizado en diversos protocolos como Git y certificados SSL hasta su deprecación oficial.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Un caso práctico sería un sistema de control de versiones que aún use SHA-1, pero que debería migrar a versiones más recientes por seguridad.</p>
          </div>
        </section>

        {/* Sección: SHA-256 y SHA-512: El estándar actual */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>SHA-256 y SHA-512: El estándar actual</h2>
          </div>
          <p>Pertenecientes a la familia SHA-2, estos algoritmos representan el estado del arte en funciones hash. SHA-256 genera hashes de 256 bits, mientras SHA-512 produce hashes de 512 bits. Su diseño resistente a colisiones y su capacidad para manejar grandes volúmenes de datos los han convertido en el estándar para aplicaciones que requieren alta seguridad. Se utilizan extensamente en blockchain, certificados digitales, almacenamiento de contraseñas y protocolos de seguridad.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Bitcoin utiliza SHA-256 para crear las direcciones de cartera y en el proceso de minado, demonstrando su robustez en sistemas críticos.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Las funciones hash son irreversibles</li>
            <li>No toda función hash es segura para criptografía</li>
            <li>La longitud del hash impacta directamente en su seguridad</li>
            <li>La evolución de los algoritmos responde a descubrimientos de vulnerabilidades</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo afecta la longitud de un hash a su seguridad?</li>
            <li>¿Por qué es importante que una función hash sea resistente a colisiones?</li>
            <li>¿Qué consecuencias puede tener usar un algoritmo hash obsoleto?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El primer ataque exitoso a MD5 fue realizado por un grupo de investigadores chinos en 2004, generando dos certificados digitales diferentes con el mismo hash, lo que revolucionó la comprensión de la seguridad en funciones hash.</p>
      </div>
    </ChapterPage>
  );
}
