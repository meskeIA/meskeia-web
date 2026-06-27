'use client';
// @disclaimer: exempt

import styles from './GuiaCard.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { HARINAS } from '@/lib/guias/harinas';

export default function GuiaHarinasPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Guía de harinas</h1>
        <p className={styles.subtitle}>Qué harina usar para cada cosa, con su fuerza (W), su proteína y sus mejores usos</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.grid} style={{ marginTop: '24px' }}>
          {HARINAS.map((h) => (
            <article key={h.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{h.emoji}</span>
                <h2 className={styles.cardNombre}>{h.nombre}</h2>
              </div>
              <div className={styles.cardBadges}>
                <span className={styles.badge}>{h.w}</span>
                <span className={`${styles.badge} ${styles.badgeSec}`}>{h.proteina} proteína</span>
              </div>
              <p className={styles.cardUso}><strong>Usos:</strong> {h.usos}</p>
              <p className={styles.cardNota}>{h.nota}</p>
            </article>
          ))}
        </section>

        <EducationalSection title="La fuerza de la harina" subtitle="Por qué no todas las harinas valen para todo">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Gluten, fuerza y para qué sirve cada una</h2>
              <p>
                Lo que diferencia a una harina de otra es, sobre todo, su capacidad para formar
                gluten, la red elástica que atrapa el gas de la fermentación y da estructura a las
                masas. Esa capacidad se mide con el valor W —la fuerza— y se intuye por el porcentaje
                de proteína del paquete. Una harina floja, con poco gluten, da migas tiernas ideales
                para bizcochos y galletas; una de fuerza aguanta masas con mucha grasa y azúcar como
                el brioche; y la gran fuerza permite fermentaciones larguísimas. Elegir bien la
                harina es la diferencia entre un pan que sube y otro que se queda plano.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Guía rápida</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Si haces…</th><th scope="col">Usa…</th></tr></thead>
                <tbody>
                  <tr><td>Bizcochos, galletas</td><td>Floja / repostería</td></tr>
                  <tr><td>Pan común</td><td>Panificable / media fuerza</td></tr>
                  <tr><td>Brioche, roscón</td><td>De fuerza</td></tr>
                  <tr><td>Panettone, masas muy largas</td><td>Gran fuerza / Manitoba</td></tr>
                  <tr><td>Pasta fresca</td><td>Sémola de trigo duro</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>A tener en cuenta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>"Todo uso" no es todo uso.</strong> Para masas exigentes, una harina específica marca la diferencia.</li>
                <li><strong>Mira la proteína del paquete.</strong> Es la pista más fácil de la fuerza si no aparece el W.</li>
                <li><strong>Mezcla integrales.</strong> Con harina de fuerza ganan volumen sin perder fibra.</li>
                <li><strong>Sin gluten, con apoyos.</strong> Esas harinas necesitan almidones y gomas para panificar.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-harinas')} />
      <ShareCard appName="guia-harinas" />
      <Footer appName="guia-harinas" />
    </div>
  );
}
