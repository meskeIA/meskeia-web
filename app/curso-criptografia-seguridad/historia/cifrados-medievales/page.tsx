'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function CifradosMedievalesPage() {
  return (
    <ChapterPage chapterId="cifrados-medievales">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La criptografía es un arte tan antiguo como la necesidad humana de proteger información confidencial. Entre los siglos XV y XVII, se produjo una revolución en las técnicas de cifrado que transformaría para siempre la forma de comunicar mensajes secretos, convirtiendo la simple sustitución alfabética en complejos sistemas de codificación que desafiaban la inteligencia de los criptógrafos de la época.</p>
      </section>

        {/* Sección: De la Sustitución Simple a la Polialfabética */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>De la Sustitución Simple a la Polialfabética</h2>
          </div>
          <p>En los primeros cifrados, cada letra del alfabeto se reemplazaba sistemáticamente por otra letra o símbolo. Sin embargo, este método presentaba vulnerabilidades evidentes. Los análisis de frecuencia podían desvelar rápidamente el patrón de codificación. Imagine un código donde 'A' siempre se reemplaza por 'X'. Un criptoanalista experto puede detectar rápidamente estas regularidades.</p>
          <p>La sustitución polialfabética surgió como una solución revolucionaria. En lugar de usar un único alfabeto de reemplazo, se comenzaron a utilizar múltiples alfabetos que cambiaban según una regla específica. Esto hacía extremadamente más complejo romper el cifrado, ya que la frecuencia de las letras se volvía mucho menos predecible.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Pensemos en una conversación entre dos comerciantes medievales. Con un cifrado simple, 'BARCELONA' siempre se codificaría igual. Pero con un método polialfabético, cada 'B' podría representar letras diferentes dependiendo de su posición en el mensaje.</p>
          </div>
        </section>

        {/* Sección: El Cifrado de Vigenère: Un Salto Cualitativo */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>El Cifrado de Vigenère: Un Salto Cualitativo</h2>
          </div>
          <p>Blaise de Vigenère desarrolló un método que durante siglos se consideró inviolable. Su sistema utilizaba una clave que determinaba cómo se desplazarían las letras del mensaje original. Cada letra de la clave indicaba un desplazamiento diferente en el alfabeto.</p>
          <p>El proceso era complejo: se repetía la clave sobre el mensaje original, y cada letra se desplazaba según la posición correspondiente. Esto generaba un cifrado mucho más robusto que cualquier método anterior. De hecho, se le llamó el 'cifrado indescifrable' durante casi 300 años.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Si la palabra clave es 'CLAVE' y el mensaje es 'SECRETO', el algoritmo aplicaría desplazamientos variables que hacían prácticamente imposible su decodificación sin conocer la clave exacta.</p>
          </div>
        </section>

        {/* Sección: El Cifrado Playfair: Matrices y Complejidad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>El Cifrado Playfair: Matrices y Complejidad</h2>
          </div>
          <p>Charles Wheatstone diseñó el cifrado Playfair en 1854, introduciendo una matriz de 5x5 como método de codificación. Este sistema agrupaba las letras en pares, lo que aumentaba significativamente la complejidad del cifrado. La matriz se construía con una palabra clave, lo que permitía múltiples configuraciones.</p>
          <p>La gran ventaja de Playfair era que no operaba letra por letra, sino por pares de letras, lo que eliminaba muchas debilidades de los cifrados anteriores. Cada par de letras se transformaba según reglas geométricas dentro de la matriz, creando un sistema mucho más robusto.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La palabra 'SEGURIDAD' en una matriz Playfair se fragmentaría y reemplazaría de manera completamente diferente a un cifrado tradicional.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La sustitución polialfabética revolucionó la criptografía</li>
            <li>Vigenère creó un método considerado inviolable durante siglos</li>
            <li>Los cifrados evolucionaron para ser cada vez más complejos</li>
            <li>La clave secreta es fundamental en todo sistema criptográfico</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo crees que la complejidad de los cifrados ha evolucionado hasta la criptografía moderna?</li>
            <li>¿Qué desafíos enfrentarían los criptógrafos para romper estos cifrados sin computadoras?</li>
            <li>¿Qué importancia tienen estos métodos históricos para la seguridad digital actual?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El cifrado de Vigenère se consideró inviolable hasta 1863, cuando el criptoanalista prusiano Friedrich Kasiski desarrolló un método sistemático para romperlo, demostrando que ningún cifrado es realmente &apos;indescifrable&apos;.</p>
      </div>

      {/* Herramientas Vinculadas */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Practica los cifrados históricos</h4>
        <p>Experimenta con los tres métodos que hemos estudiado usando nuestras herramientas interactivas.</p>
        <div className={styles.toolLinkButtons}>
          <a href="/cifrado-vigenere/" className={styles.toolLinkButton}>
            Cifrado Vigenère →
          </a>
          <a href="/cifrado-playfair/" className={styles.toolLinkButton}>
            Cifrado Playfair →
          </a>
          <a href="/cifrado-transposicion/" className={styles.toolLinkButton}>
            Transposición →
          </a>
        </div>
      </div>
    </ChapterPage>
  );
}
