'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function QueEsHashPage() {
  return (
    <ChapterPage chapterId="que-es-hash">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagina que tienes una huella digital única que identifica solo a una persona en todo el mundo. En el universo de la criptografía, las funciones hash funcionan de manera similar: son 'huellas digitales' únicas para datos digitales que nos permiten verificar su integridad y autenticidad sin revelar su contenido original.</p>
      </section>

        {/* Sección: Definición de Función Hash: La Huella Digital Digital */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Definición de Función Hash: La Huella Digital Digital</h2>
          </div>
          <p>Una función hash es un algoritmo matemático que transforma cualquier dato de entrada (texto, archivo, contraseña) en una cadena de longitud fija y aparentemente aleatoria. Esta transformación tiene características únicas: sin importar el tamaño de los datos de entrada, siempre generará una salida de longitud constante.</p>
          <p>Piensa en una función hash como una máquina que recibe un documento y produce un código único e irreconocible. Si cambias una sola letra en el documento original, el código hash cambiará completamente, lo que permite detectar incluso las modificaciones más pequeñas.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Por ejemplo, el hash de 'Hola Mundo' será completamente diferente al hash de 'hola Mundo' (nótese la diferencia de mayúscula)</p>
          </div>
        </section>

        {/* Sección: Propiedades Fundamentales de las Funciones Hash */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Propiedades Fundamentales de las Funciones Hash</h2>
          </div>
          <p>Las funciones hash tienen cuatro propiedades cruciales que las hacen herramientas poderosas en seguridad informática:</p>
          <p>1. Determinismo: Mismo input, mismo output\n2. Irreversibilidad: No se puede reconstruir el dato original a partir del hash\n3. Efecto Avalancha: Pequeños cambios generan hashes radicalmente diferentes\n4. Resistencia a Colisiones: Es prácticamente imposible encontrar dos inputs diferentes con el mismo hash</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Si hasheas 'Buenos Aires' y luego hasheas 'Buenos aires', el resultado será completamente distinto</p>
          </div>
        </section>

        {/* Sección: Usos Prácticos de las Funciones Hash */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Usos Prácticos de las Funciones Hash</h2>
          </div>
          <p>Las funciones hash tienen múltiples aplicaciones en tecnología y seguridad:</p>
          <p>- Almacenamiento seguro de contraseñas\n- Verificación de integridad de archivos\n- Firma digital de documentos\n- Blockchain y criptomonedas\n- Sistemas de autenticación</p>
          <p>En cada caso, el hash actúa como un testigo confiable que garantiza que la información no ha sido manipulada.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando descargas un programa, puedes comparar su hash para verificar que no ha sido modificado</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Las funciones hash son 'huellas digitales' para datos digitales</li>
            <li>Un hash siempre tiene longitud fija, independiente del input</li>
            <li>Es imposible reconstruir el dato original a partir de su hash</li>
            <li>Cualquier modificación mínima genera un hash completamente diferente</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Por qué es importante que un hash no pueda revertirse?</li>
            <li>¿Cómo protegen los hashes la integridad de la información?</li>
            <li>¿En qué situaciones cotidianas podrías utilizar una función hash?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El algoritmo MD5, uno de los primeros hashes populares, ahora se considera inseguro y se desaconseja su uso por vulnerabilidades encontradas.</p>
      </div>

      {/* Herramienta Vinculada */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Genera tus propios hashes</h4>
        <p>Experimenta con diferentes algoritmos (MD5, SHA-1, SHA-256, SHA-512) y observa el efecto avalancha en tiempo real.</p>
        <a href="/generador-hashes/" className={styles.toolLinkButton}>
          Abrir Generador de Hashes →
        </a>
      </div>
    </ChapterPage>
  );
}
