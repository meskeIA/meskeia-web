'use client';

import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function PrimerosMesesPage() {
  return (
    <ChapterPage chapterId="primeros-meses">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>¡Felicidades por tu nueva mascota! Estás a punto de iniciar una aventura increíble llena de amor, travesuras y momentos únicos. Los primeros días juntos serán clave para construir una amistad sólida y establecer las bases de una convivencia súper feliz.</p>
      </section>

      {/* Secciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>La Primera Noche: Sin Dramas ni Lágrimas</h2>
        </div>
        <p>La primera noche puede ser intensa para ambos, ¡pero no te preocupes! Prepara un espacio súper acogedor donde se sienta seguro. Para perros: una esquina con su mantita o transportadora abierta. Para gatos: un rincón con su camita y algún juguete suave. Pon temperatura agradable y evita ruidos fuertes (nada de TV a todo volumen). Mantente relajado y transmite buena vibra. No lo agobies queriendo consolarlo cada 5 minutos: déjalo que curiosee y se vaya sintiendo como en casa. Es normal que se sienta un poco perdido al principio.</p>
        <div className={styles.tipBox}>
          <p>💡 Un rincón tranquilo y siempre igual le da mucha seguridad durante la adaptación</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitleText}>Rutinas Diarias: Tu Mejor Aliado</h2>
        </div>
        <p>Las mascotas aman saber qué viene después. Crea horarios sencillos para comida, paseos, juegos y siesta. Con perros: paseo mañanero para hacer sus necesidades y uno nocturno para relajarse. Con gatos: sesiones de juego de 10-15 minutos cuando estén más activos (usually al amanecer o atardecer). Mantén estos horarios lo más parecidos posible cada día. Esta rutina les da tranquilidad y les ayuda a entender cómo funciona su nuevo hogar. Premia con caricias o su snack favorito cuando hagan las cosas bien.</p>
        <div className={styles.tipBox}>
          <p>💡 Ser constante es más importante que ser perfecto todos los días</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Socialización: Preparándolo para el Mundo Real</h2>
        </div>
        <p>Los primeros meses son oro puro para que tu mascota aprenda a llevarse bien con todo y todos. Preséntale poco a poco diferentes personas, sonidos, lugares y situaciones. Con perros: paseos cortitos y encuentros amigables con otros perritos (siempre supervisados). Con gatos: juegos que despierten su curiosidad y le permitan explorar sin sustos. La meta es tener una mascota sociable, confiada y adaptable. Evita exponerlo a cosas que lo estresen mucho o le den miedo real.</p>
        <div className={styles.tipBox}>
          <p>💡 Cada experiencia nueva es como una clase que lo prepara para ser más feliz</p>
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
            <p>La paciencia es tu superpoder durante la adaptación</p>
          </div>
          <div className={styles.quickTip}>
            <p>Mantente tranquilo: tu mascota lee tus emociones como un libro</p>
          </div>
          <div className={styles.quickTip}>
            <p>Pon límites con mucho amor y siempre igual</p>
          </div>
          <div className={styles.quickTip}>
            <p>Celebra cada pequeño logro como si fuera enorme</p>
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
            <p>Desde el día uno, enséñale a caminar contigo sin convertir el paseo en un remolcador</p>
          </div>
          <div className={`${styles.petTip} ${styles.cat}`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>Prepara varios rincones cómodos por la casa para que elija su spot favorito para las siestas</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="/planificador-mascota/" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>Planificador de Mascota</span>
        </div>
        <p>Nuestra app te ayuda a crear y seguir las rutinas perfectas para que tu nueva mascota se sienta como en casa</p>
      </Link>
    </ChapterPage>
  );
}
