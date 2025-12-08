'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function AnatomiaContrasenaPage() {
  return (
    <ChapterPage chapterId="anatomia-contrasena">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Las contraseñas son la primera línea de defensa en nuestra seguridad digital, pero paradójicamente suelen ser nuestro eslabón más débil. En este capítulo, desentrañaremos los mitos y revelaciones sobre qué hace realmente segura a una contraseña, más allá de los lugares comunes y consejos repetidos hasta la saciedad.</p>
      </section>

        {/* Sección: Por qué fallan las contraseñas tradicionales */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Por qué fallan las contraseñas tradicionales</h2>
          </div>
          <p>Las contraseñas convencionales siguen patrones predecibles que las hacen vulnerables. Los atacantes utilizan diccionarios de contraseñas, herramientas de fuerza bruta y técnicas de ingeniería social para romper sistemas de seguridad. Una contraseña como 'Febrero2024!' parece segura, pero en realidad es extremadamente predecible: usa una palabra común, un mes, un año actual y un signo de exclamación, cumpliendo reglas básicas que los sistemas de hacking pueden descifrar rápidamente.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Imagina tu contraseña como una cerradura. Una contraseña débil es como una cerradura de supermercado, mientras que una fuerte es como la caja fuerte de un banco.</p>
          </div>
        </section>

        {/* Sección: Longitud vs Complejidad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Longitud vs Complejidad</h2>
          </div>
          <p>Contrario a la creencia popular, la longitud de una contraseña importa más que su complejidad aparente. Una frase larga y memorable como 'elcaballoazulcomebananasenlacocina' es significativamente más segura que 'P@ssw0rd!'. La extensión aumenta exponencialmente las combinaciones posibles, haciendo casi imposible su descifrado mediante fuerza bruta.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Una contraseña de 20 caracteres tiene billones de combinaciones posibles, comparada con una de 8 caracteres que puede ser crackeada en minutos.</p>
          </div>
        </section>

        {/* Sección: Entropía: La verdadera medida de seguridad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Entropía: La verdadera medida de seguridad</h2>
          </div>
          <p>La entropía en ciberseguridad mide la imprevisibilidad y aleatoriedad de una contraseña. No se trata solo de caracteres especiales, sino de cuán difícil es predecir la siguiente letra o símbolo. Una contraseña con alta entropía genera verdadera impredecibilidad, desafiando los algoritmos de descifrado.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Es como crear una melodía musical completamente impredecible, donde cada nota sorprende al oyente.</p>
          </div>
        </section>

        {/* Sección: El mito de los caracteres especiales */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>El mito de los caracteres especiales</h2>
          </div>
          <p>Muchos sistemas exigen caracteres especiales, pero esto no garantiza seguridad. Un método más efectivo es crear contraseñas basadas en frases personales únicas, con alteraciones que solo tú recuerdes. La personalización y la longitud son más importantes que seguir reglas rígidas de complejidad.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En lugar de 'Casa2024!', podrías usar 'MiPerroRayadugoMuyFelizEnElParque'.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La longitud de la contraseña importa más que su complejidad aparente</li>
            <li>La entropía mide la verdadera seguridad de una contraseña</li>
            <li>Las frases personales son más seguras que combinaciones aleatorias</li>
            <li>Los caracteres especiales no garantizan protección</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cuántas de tus contraseñas actuales seguirían siendo seguras después de este capítulo?</li>
            <li>¿Cómo podrías transformar tus contraseñas actuales en versiones más robustas?</li>
            <li>¿Qué recuerdos o frases personales podrías usar para crear contraseñas únicas?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El famoso comic XKCD popularizó la idea de las contraseñas de frase con su viñeta &apos;Contraseña Segura&apos;, demostrando matemáticamente que una frase como &apos;correct horse battery staple&apos; es más segura que contraseñas aparentemente complejas.</p>
      </div>

      {/* Herramienta Vinculada */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Genera contraseñas seguras</h4>
        <p>Crea contraseñas con alta entropía personalizando longitud, caracteres especiales y más.</p>
        <a href="/generador-contrasenas/" className={styles.toolLinkButton}>
          Abrir Generador de Contraseñas →
        </a>
      </div>
    </ChapterPage>
  );
}
