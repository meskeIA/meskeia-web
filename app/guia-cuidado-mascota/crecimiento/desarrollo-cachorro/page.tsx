'use client';

import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function DesarrolloCachorroPage() {
  return (
    <ChapterPage chapterId="desarrollo-cachorro">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>¿Te has preguntado cómo será tu pequeño peludo cuando crezca? Cada cachorro y gatito tiene su propia historia de crecimiento, y conocer estas etapas te ayudará a cuidarlo mejor en cada momento. ¡Es como ser testigo de una increíble transformación!</p>
      </section>

      {/* Secciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Las Etapas de Crecimiento: Como Ver Crecer a un Niño</h2>
        </div>
        <p>El crecimiento de tu mascota es como ver crecer a un hijo. Al principio (primeras 8 semanas), tu pequeño depende totalmente de mamá para todo. Entre las 8 y 16 semanas viene la etapa más divertida: la socialización. Es cuando tu cachorro o gatito se convierte en una esponjita que absorbe todo - nuevos sonidos, olores, personas. Luego llega la 'adolescencia' (6 a 18 meses): crecen como maleza, prueban límites y desarrollan su personalidad única. Los perros pequeños como un Yorkshire crecen súper rápido y ya están casi listos a los 10 meses, mientras que los grandotes como un Labrador siguen creciendo hasta los 18 meses. Los gatos son más parejos: la mayoría está listo alrededor del año.</p>
        <div className={styles.tipBox}>
          <p>💡 Toma una foto mensual junto al mismo objeto (como tu zapato) - ¡te sorprenderás de lo rápido que crecen!</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitleText}>Alimentación: La Gasolina Premium de tu Mascota</h2>
        </div>
        <p>Piensa en la comida como la gasolina premium de tu auto deportivo. Los cachorros y gatitos queman energía como locos, así que necesitan 'combustible' especial: más proteína y calorías que los adultos. Un cachorro pequeño (como un Pug) necesita comer 3-4 veces al día hasta los 6 meses - imagínate como un bebé que come cada pocas horas. Los grandotes (como un Golden) comen menos veces pero porciones más grandes. Los gatitos son similares: 3-4 comidas hasta los 6 meses. La clave está en buscar la bolsa que diga 'cachorro' o 'kitten' - no es marketing, realmente tienen la fórmula que necesitan para crecer fuertes y sanos.</p>
        <div className={styles.tipBox}>
          <p>💡 Si cambias de comida, hazlo gradualmente mezclando la nueva con la vieja durante una semana</p>
        </div>
      </section>

      {/* Tips Rápidos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✅</span>
          <h2 className={styles.sectionTitleText}>Tips Rápidos</h2>
        </div>
        <div className={styles.quickTipsGrid}>
          <div className={styles.quickTip}>
            <p>Pésalo una vez al mes - usa tu báscula casera para los pequeños</p>
          </div>
          <div className={styles.quickTip}>
            <p>Entre los 2-4 meses es el momento perfecto para presentarle nuevas experiencias</p>
          </div>
          <div className={styles.quickTip}>
            <p>No le des comida de adulto hasta que pare de crecer - sería como darle comida dietética a un niño</p>
          </div>
          <div className={styles.quickTip}>
            <p>Su tamaño final ya está 'programado' en sus genes, pero tu cuidado marca la diferencia en su salud</p>
          </div>
        </div>
      </section>

      {/* Consejos para Perros y Gatos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🐾</span>
          <h2 className={styles.sectionTitleText}>Consejos Específicos</h2>
        </div>
        <div className={styles.petTips}>
          <div className={`${styles.petTip} ${styles.dog}`}>
            <div className={styles.petTipHeader}>
              <span>🐕</span> Para Perros
            </div>
            <p>Mantén al día sus vacunas y desparasitaciones - es como construir su sistema de defensa mientras crece</p>
          </div>
          <div className={`${styles.petTip} ${styles.cat}`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>Dale juguetes que pueda 'cazar' y lugares altos donde trepar - necesita estimular sus instintos naturales</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="/calculadora-tamano-adulto-perro/" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>Calculadora de Tamaño Adulto</span>
        </div>
        <p>¿Curioso sobre el tamaño final de tu cachorro? Nuestra calculadora te da una idea aproximada</p>
      </Link>
    </ChapterPage>
  );
}
