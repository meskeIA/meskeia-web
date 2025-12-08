'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function HashesPracticaPage() {
  return (
    <ChapterPage chapterId="hashes-practica">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagina que descargas un archivo importante y quieres estar completamente seguro de que no ha sido modificado durante su transferencia. Las funciones hash son tu herramienta secreta para verificar la integridad de cualquier archivo digital, como un guardián invisible que detecta hasta el más mínimo cambio.</p>
      </section>

        {/* Sección: ¿Qué es un Hash y por qué es importante? */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>¿Qué es un Hash y por qué es importante?</h2>
          </div>
          <p>Un hash es como una huella digital única para archivos digitales. Es un código alfanumérico generado mediante un algoritmo matemático que transforma cualquier archivo o dato en una cadena de caracteres de longitud fija. Lo fascinante es que si cambias aunque sea un solo bit del archivo original, el hash cambiará completamente.</p>
          <p>Los algoritmos hash más populares incluyen MD5, SHA-1, SHA-256 y SHA-512. Cada uno tiene diferentes características de seguridad y longitud. Por ejemplo, SHA-256 genera un hash de 64 caracteres que es considerado muy seguro para la mayoría de los usos actuales.</p>
          <p>La función principal de un hash es garantizar que un archivo no ha sido alterado o corrompido durante su transmisión o almacenamiento. Es como un sello de autenticidad digital que permite verificar instantáneamente si un archivo es exactamente igual al original.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Si descargas Ubuntu 20.04 desde su sitio oficial, encontrarás un hash SHA-256 junto al enlace de descarga. Puedes verificar que tu archivo descargado coincide exactamente con el original generando su hash y comparándolo.</p>
          </div>
        </section>

        {/* Sección: Verificación de Integridad Paso a Paso */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Verificación de Integridad Paso a Paso</h2>
          </div>
          <p>El proceso de verificación de hash es simple pero poderoso. Primero, necesitas conocer el hash oficial del archivo, generalmente proporcionado por el sitio web o el distribuidor del software. Luego, utilizas herramientas específicas para generar el hash de tu archivo descargado y compararlo.</p>
          <p>En sistemas Unix/Linux, puedes usar comandos como 'shasum' o 'md5sum'. En Windows, existen herramientas como HashCalc o las utilidades integradas de PowerShell. El proceso es similar: introduces el archivo y obtienes su hash único.</p>
          <p>Algunos consejos importantes: siempre verifica el hash antes de instalar software, especialmente si lo descargas de fuentes externas. Un cambio en el hash podría indicar que el archivo ha sido manipulado, posiblemente para incluir malware.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Comando en Linux para verificar un archivo: 'sha256sum archivo.iso' generará el hash que puedes comparar con el oficial.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Los hashes son como huellas digitales únicas para archivos</li>
            <li>Un cambio mínimo altera completamente el hash</li>
            <li>La verificación de hash protege contra descargas corruptas o maliciosas</li>
            <li>Existen múltiples algoritmos de hash con diferentes niveles de seguridad</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo podrías explicar un hash a alguien que no conoce tecnología?</li>
            <li>¿Qué riesgos existen al no verificar la integridad de un archivo descargado?</li>
            <li>¿Cómo elegirías el algoritmo hash más adecuado para diferentes escenarios?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El primer algoritmo hash criptográfico, MD5, fue desarrollado en 1991 por Ron Rivest. Hoy se considera inseguro para propósitos de seguridad, pero sigue siendo útil para detectar errores de transmisión.</p>
      </div>
    </ChapterPage>
  );
}
