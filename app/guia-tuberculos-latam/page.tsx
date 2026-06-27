'use client';
// @disclaimer: exempt

import styles from './GuiaCard.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { TUBERCULOS } from '@/lib/guias/tuberculosLatam';

export default function GuiaTuberculosLatamPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Tubérculos y raíces de Latinoamérica</h1>
        <p className={styles.subtitle}>Más allá de la patata: yuca, boniato, malanga, papas andinas y más, qué son y cómo cocinarlos</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.grid} style={{ marginTop: '24px' }}>
          {TUBERCULOS.map((t) => (
            <article key={t.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{t.emoji}</span>
                <h2 className={styles.cardNombre}>{t.nombre}</h2>
              </div>
              <div className={styles.cardBadges}>
                <span className={`${styles.badge} ${styles.badgeSec}`}>{t.origen}</span>
              </div>
              <p className={styles.datoRow}><strong>Carácter:</strong> {t.caracter}</p>
              <p className={styles.cardUso}><strong>Uso:</strong> {t.uso}</p>
              <p className={styles.cardNota}>{t.nota}</p>
            </article>
          ))}
        </section>

        <EducationalSection title="La despensa de raíces de América" subtitle="Variedad, sabor y cómo cocinarlas con seguridad">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Mucho más que patatas</h2>
              <p>
                América regaló al mundo la patata, pero su despensa de tubérculos y raíces va mucho
                más allá. La yuca, el boniato, la malanga, el ñame o las papas andinas son la base de
                infinidad de platos en Latinoamérica y, cada vez más, en cocinas de todo el mundo.
                Aportan texturas y sabores que la patata no tiene: la cremosidad de la malanga, el
                dulzor del boniato, el crujiente de la jícama. Conocerlos abre un mundo de
                posibilidades en la cocina, siempre teniendo en cuenta cómo se preparan, porque
                algunos —como la yuca— requieren cocción para ser seguros.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Cómo se comen</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Cómo</th><th scope="col">Ejemplos</th></tr></thead>
                <tbody>
                  <tr><td>Hervidos o en puré</td><td>Yuca, ñame, malanga, papa andina</td></tr>
                  <tr><td>Fritos</td><td>Yuca, plátano macho (tostones), boniato</td></tr>
                  <tr><td>Crudos</td><td>Jícama (en ensalada)</td></tr>
                  <tr><td>En dulces</td><td>Boniato, oca asoleada</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Seguridad y manejo</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Yuca siempre cocida.</strong> Cruda contiene compuestos que liberan cianuro; nunca se come sin cocinar.</li>
                <li><strong>Retira la fibra central</strong> de la yuca antes de cocinarla.</li>
                <li><strong>Pela la malanga bajo el grifo.</strong> Su savia puede irritar la piel.</li>
                <li><strong>Solo el bulbo de la jícama.</strong> El resto de la planta no es comestible.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-tuberculos-latam')} />
      <ShareCard appName="guia-tuberculos-latam" />
      <Footer appName="guia-tuberculos-latam" />
    </div>
  );
}
