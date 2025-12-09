'use client';

import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function PrevencionParasitosPage() {
  return (
    <ChapterPage chapterId="prevencion-parasitos">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>¿Has notado que tu peludo compañero se rasca más de lo normal o parece menos animado? Los parásitos son como huéspedes no invitados que pueden incomodar a tu mascota, pero aquí tienes buenas noticias: protegerlos es más fácil de lo que piensas. Te explico todo de manera súper sencilla.</p>
      </section>

      {/* Secciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Tipos de Antiparasitarios: Encuentra el Ideal para Tu Peludo</h2>
        </div>
        <p>Piensa en los antiparasitarios como los guardianes de tu mascota. Tienes tres opciones principales: las pastillas (como Drontal o Milbemax) que se dan por la boca y eliminan lombrices intestinales, las pipetas (como Nexgard) que se aplican en el cuello y protegen contra pulgas y garrapatas, y los collares (como Seresto) que actúan por varios meses. ¿Tu mascota es un cachorro o gatito? Necesitarán protección cada 15 días hasta los 3 meses, después una vez al mes hasta los 6 meses. Si ya es adulto, cada 3 meses está perfecto. Los perritos que pasean mucho por parques pueden necesitarlo un poco más seguido.</p>
        <div className={styles.tipBox}>
          <p>💡 Tu veterinario conoce a tu mascota mejor que nadie, siempre pregúntale cuál es el mejor para tu caso</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitleText}>Cómo Saber si Tu Mascota Tiene Parásitos</h2>
        </div>
        <p>Tu peludo no puede decirte 'me siento mal', pero su cuerpo te da pistas claras. Si notas que come igual pero baja de peso, su pelo se ve sin brillo, tiene diarrea o vómitos frecuentes, su pancita se ve hinchada, está más decaído que de costumbre o se rasca muchísimo, es momento de actuar. Los perros suelen ser más evidentes (como ese amigo dramático que todos tenemos), mientras que los gatos son más reservados y disimulan mejor. Un truco infalible: revisa su popó. Si ves gusanitos blancos como granos de arroz o algo raro, ¡bingo!</p>
        <div className={styles.tipBox}>
          <p>💡 Una mascota feliz corre, juega y tiene buen apetito. Si algo cambió, investiga</p>
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
            <p>Lava la camita y mantitas de tu mascota cada semana</p>
          </div>
          <div className={styles.quickTip}>
            <p>Aspira bien los lugares donde más le gusta estar</p>
          </div>
          <div className={styles.quickTip}>
            <p>Si tienes varios peludos en casa, desparasita a todos el mismo día</p>
          </div>
          <div className={styles.quickTip}>
            <p>Haz una revisión rápida cada semana: pelo, piel y comportamiento</p>
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
            <p>¿Tu perrito es aventurero y le encanta el parque? Los que salen mucho necesitan desparasitación cada 2-3 meses</p>
          </div>
          <div className={`${styles.petTip} ${styles.cat}`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>¿Tu gatito caza ratoncitos o sale al jardín? Estos pequeños cazadores necesitan control antiparasitario más frecuente</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="/calculadora-medicamentos-mascotas/" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>Calculadora de Medicamentos</span>
        </div>
        <p>Te ayuda a calcular la dosis exacta de antiparasitario según el peso y edad de tu mascota. ¡Súper fácil de usar!</p>
      </Link>
    </ChapterPage>
  );
}
