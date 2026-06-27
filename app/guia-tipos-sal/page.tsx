'use client';
// @disclaimer: exempt

import styles from './GuiaCard.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { SALES } from '@/lib/guias/sales';

export default function GuiaTiposSalPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Guía de tipos de sal</h1>
        <p className={styles.subtitle}>De la sal fina a la flor de sal: texturas, usos y diferencias para acertar con cada una</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.grid} style={{ marginTop: '24px' }}>
          {SALES.map((s) => (
            <article key={s.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{s.emoji}</span>
                <h2 className={styles.cardNombre}>{s.nombre}</h2>
              </div>
              <div className={styles.cardBadges}>
                <span className={`${styles.badge} ${styles.badgeSec}`}>{s.textura}</span>
              </div>
              <p className={styles.cardUso}><strong>Uso:</strong> {s.uso}</p>
              <p className={styles.cardNota}>{s.nota}</p>
            </article>
          ))}
        </section>

        <EducationalSection title="La sal, más allá del salero" subtitle="Por qué hay tantas y cuándo usar cada una">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Casi la misma sal, distintos momentos</h2>
              <p>
                Casi toda la sal es cloruro sódico, así que las diferencias de sabor entre unas y
                otras son más sutiles de lo que parece. Lo que de verdad cambia es la textura del
                cristal, los minerales que la acompañan y, sobre todo, el momento en que se usa. Una
                sal fina sazona por igual mientras cocinas; una sal en escamas o flor de sal se
                reserva para el final, porque aporta un crujido y un punto de sal que se nota en
                cada bocado. Conocer esa diferencia entre sal de cocinar y sal de acabado es lo que
                más cambia el resultado.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Cocinar o acabar</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Momento</th><th scope="col">Sales</th></tr></thead>
                <tbody>
                  <tr><td>Sazonar al cocinar</td><td>Fina de mesa, marina, yodada</td></tr>
                  <tr><td>Agua de cocción y costras</td><td>Gorda / gruesa</td></tr>
                  <tr><td>Acabado en el plato</td><td>Flor de sal, escamas (Maldon)</td></tr>
                  <tr><td>Dar sabor especial</td><td>Ahumada, negra (kala namak)</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Buenas prácticas</strong></div>
              <ul className={styles.warningList}>
                <li><strong>No todas salan igual por volumen.</strong> Una cucharada de sal en escamas sala menos que una de fina; ajusta a ojo.</li>
                <li><strong>Reserva las caras para el final.</strong> Cocinar con flor de sal es desperdiciar su textura.</li>
                <li><strong>La sal especial, con tino.</strong> La ahumada y la negra son muy potentes.</li>
                <li><strong>Sal con moderación.</strong> Más allá del tipo, el consumo de sal conviene mantenerlo bajo control.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-tipos-sal')} />
      <ShareCard appName="guia-tipos-sal" />
      <Footer appName="guia-tipos-sal" />
    </div>
  );
}
