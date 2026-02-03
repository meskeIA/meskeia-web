'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function EnigmaGuerraPage() {
  return (
    <ChapterPage chapterId="enigma-guerra">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En el ajedrez de la Segunda Guerra Mundial, la criptografía no era solo una herramienta tecnológica, sino un arma decisiva que podía cambiar el curso de los acontecimientos. La máquina Enigma alemana representa uno de los capítulos más fascinantes de la historia de la seguridad y los códigos secretos, donde matemáticos e ingenieros se convirtieron en héroes silenciosos.</p>
      </section>

        {/* Sección: La Máquina Enigma: Un Laberinto de Secretos */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>La Máquina Enigma: Un Laberinto de Secretos</h2>
          </div>
          <p>La máquina Enigma fue desarrollada por Arthur Scherbius en Alemania a principios del siglo XX. Su funcionamiento era increíblemente complejo: un sistema de rotores electromecánicos que permitía generar millones de combinaciones diferentes para cifrar mensajes. Cada vez que se presionaba una tecla, los rotores giraban, cambiando la configuración de codificación, lo que hacía prácticamente imposible descifrar el mensaje sin conocer la configuración exacta.</p>
          <p>El ejército alemán utilizaba Enigma para comunicar instrucciones estratégicas, movimientos de tropas y planes militares. Cada día, los operadores cambiaban la configuración de los rotores siguiendo un protocolo extremadamente riguroso, lo que añadía capas adicionales de complejidad al cifrado.</p>
          <p>La verdadera genialidad de Enigma residía en su capacidad para transformar un mensaje simple en una secuencia aparentemente aleatoria de letras, que solo podía descifrarse con la máquina correctamente configurada.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Imagina un candado que cambia su combinación cada vez que lo abres, pero solo tú conoces el mecanismo exacto para hacerlo. Así funcionaba Enigma: un código que se reconfiguraba constantemente.</p>
          </div>
        </section>

        {/* Sección: Alan Turing: El Genio que Desafió lo Imposible */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Alan Turing: El Genio que Desafió lo Imposible</h2>
          </div>
          <p>Alan Turing, un matemático británico, fue el cerebro detrás del descifrado de Enigma. Trabajando en Bletchley Park, un centro secreto de inteligencia británica, Turing desarrolló la máquina computadora 'Bombe', diseñada específicamente para romper los códigos alemanes.</p>
          <p>Su método revolucionario se basaba en identificar patrones y probabilidades, utilizando técnicas matemáticas avanzadas y una comprensión profunda de la lógica de los rotores. Turing no solo descifraba códigos, sino que básicamente inventó las bases de la computación moderna.</p>
          <p>Su trabajo fue tan crucial que se estima que acortó la Segunda Guerra Mundial entre dos y cuatro años, salvando potencialmente millones de vidas.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Como un detective que descubre el patrón en un rompecabezas aparentemente imposible, Turing desentrañó los secretos de Enigma.</p>
          </div>
        </section>

        {/* Sección: Impacto en la Historia Mundial */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Impacto en la Historia Mundial</h2>
          </div>
          <p>El trabajo de descifrar Enigma fue mantenido en secreto durante décadas. Los aliados no solo descifraban mensajes, sino que debían hacerlo de manera estratégica para no revelar que habían roto el código.</p>
          <p>La criptografía demostró ser un arma tan poderosa como los tanques o los aviones. La información secreta podía cambiar el resultado de batallas enteras, convirtiendo el conocimiento en un recurso estratégico supremo.</p>
          <p>Después de la guerra, estos avances sentaron las bases para la revolución computacional y de comunicaciones que vendríamos a conocer décadas después.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Como un espía invisible que puede leer los planes del enemigo antes de que se ejecuten, la criptografía se convirtió en un arma decisiva.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Enigma era un sistema de cifrado extremadamente complejo</li>
            <li>Alan Turing fue fundamental para descifrar los códigos alemanes</li>
            <li>La criptografía puede cambiar el curso de conflictos históricos</li>
            <li>Los avances en códigos secretos impulsaron la computación moderna</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo crees que la tecnología actual hereda principios de la criptografía de guerra?</li>
            <li>¿Qué implicaciones éticas tiene descifrar comunicaciones secretas?</li>
            <li>¿De qué manera la información puede ser más poderosa que las armas?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Alan Turing fue perseguido y procesado por su homosexualidad años después de salvar a su país, siendo indultado oficialmente hasta 2013, décadas después de su muerte.</p>
      </div>
    </ChapterPage>
  );
}
