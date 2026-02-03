'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function FuturoCriptografiaPage() {
  return (
    <ChapterPage chapterId="futuro-criptografia">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagina un mundo donde las contraseñas y sistemas de seguridad que consideramos inquebrantables pueden desmoronarse en segundos. La llegada de los computadores cuánticos representa una revolución silenciosa que podría transformar radicalmente la seguridad digital tal como la conocemos.</p>
      </section>

        {/* Sección: La Amenaza Cuántica: Un Nuevo Horizonte de Riesgo */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>La Amenaza Cuántica: Un Nuevo Horizonte de Riesgo</h2>
          </div>
          <p>Los computadores cuánticos no son simples máquinas más rápidas, sino dispositivos fundamentalmente diferentes que operan bajo principios de la mecánica cuántica. A diferencia de los ordenadores tradicionales que utilizan bits (0 o 1), los computadores cuánticos usan qubits, que pueden existir simultáneamente en múltiples estados. Esta capacidad les permite resolver problemas matemáticos complejos a una velocidad vertiginosa, especialmente aquellos relacionados con factorización numérica.</p>
          <p>Los algoritmos de criptografía actuales como RSA o ECC se basan en la dificultad computacional de resolver ciertos problemas matemáticos. Un computador cuántico podría desencriptar en minutos lo que a un ordenador clásico le tomaría miles de años. Esto significa que protocolos de seguridad que consideramos seguros hoy podrían volverse completamente vulnerables en un futuro cercano.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Es como si tuvieras una caja fuerte con un candado que requiere probar millones de combinaciones. Un ladrón tradicional tardaría años, pero un ladrón con una máquina mágica podría abrirla instantáneamente.</p>
          </div>
        </section>

        {/* Sección: Algoritmos Post-Cuánticos: La Nueva Generación de Seguridad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Algoritmos Post-Cuánticos: La Nueva Generación de Seguridad</h2>
          </div>
          <p>La comunidad criptográfica ya está desarrollando algoritmos diseñados específicamente para resistir ataques cuánticos. Estas nuevas estrategias se basan en problemas matemáticos que incluso los computadores cuánticos encontrarían extremadamente difíciles de resolver.</p>
          <p>Las principales familias de algoritmos post-cuánticos incluyen:\n1. Criptografía basada en retículas\n2. Sistemas de firma multivariable\n3. Códigos hash\n4. Algoritmos basados en problemas matemáticos no resolubles con computación cuántica</p>
          <p>Organismos como el NIST (Instituto Nacional de Estándares y Tecnología de Estados Unidos) ya están evaluando y estandarizando estas nuevas técnicas de seguridad.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Es similar a cambiar las reglas de un juego para que un jugador con habilidades especiales no pueda ganar fácilmente.</p>
          </div>
        </section>

        {/* Sección: Preparación Estratégica */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Preparación Estratégica</h2>
          </div>
          <p>Aunque la amenaza cuántica aún no es inmediata, las organizaciones y profesionales de seguridad deben comenzar a prepararse. Las estrategias incluyen:</p>
          <p>- Realizar auditorías de infraestructura criptográfica\n- Implementar algoritmos híbridos que combinen métodos clásicos y post-cuánticos\n- Mantener actualizados los sistemas de seguridad\n- Capacitar equipos técnicos en nuevas tecnologías</p>
          <p>La transición será gradual, pero requiere una planificación proactiva.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Como renovar las defensas de un castillo antes de que llegue un nuevo tipo de armamento.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Los computadores cuánticos representan una amenaza real para la criptografía actual</li>
            <li>Existen algoritmos post-cuánticos en desarrollo para contrarrestar estos riesgos</li>
            <li>La preparación temprana es crucial para la seguridad digital</li>
            <li>La transición será gradual pero inevitable</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo podría afectar un ataque cuántico a mi organización?</li>
            <li>¿Estoy preparando a mi equipo para estos cambios tecnológicos?</li>
            <li>¿Qué medidas puedo implementar hoy para protegerme?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El primer computador cuántico comercialmente viable podría estar disponible en menos de una década, según estimaciones de IBM y Google.</p>
      </div>
    </ChapterPage>
  );
}
