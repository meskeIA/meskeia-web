'use client';
// @disclaimer: exempt

import styles from './GuiaCard.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { MAICES } from '@/lib/guias/maices';

export default function GuiaMaicesPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Guía de maíces y nixtamal</h1>
        <p className={styles.subtitle}>Tipos de maíz y sus derivados, sus usos y qué es la nixtamalización</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.grid} style={{ marginTop: '24px' }}>
          {MAICES.map((m) => (
            <article key={m.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{m.emoji}</span>
                <h2 className={styles.cardNombre}>{m.nombre}</h2>
              </div>
              <p className={styles.cardUso}><strong>Uso:</strong> {m.uso}</p>
              <p className={styles.cardNota}>{m.nota}</p>
            </article>
          ))}
        </section>

        <EducationalSection title="El maíz, grano por grano" subtitle="La nixtamalización y los muchos usos del maíz">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Un grano, muchas cocinas</h2>
              <p>
                El maíz, domesticado en Mesoamérica hace miles de años, es uno de los cereales más
                versátiles del mundo. Según la variedad y la forma de prepararlo da resultados muy
                distintos: tortillas, arepas, tamales, polenta, palomitas o un simple elote asado.
                La clave de buena parte de la cocina mexicana es la nixtamalización, un proceso que
                transforma el grano duro en una masa moldeable y nutritiva. Entender qué maíz y qué
                derivado usar evita confusiones tan comunes como mezclar la masa harina mexicana con
                la harina de arepa, que no son lo mismo.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Para qué cada uno</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Si quieres…</th><th scope="col">Usa…</th></tr></thead>
                <tbody>
                  <tr><td>Tortillas mexicanas</td><td>Masa nixtamalizada o masa harina</td></tr>
                  <tr><td>Arepas</td><td>Harina de maíz precocida</td></tr>
                  <tr><td>Pozole</td><td>Maíz cacahuazintle (pozolero)</td></tr>
                  <tr><td>Espesar una salsa</td><td>Maicena</td></tr>
                  <tr><td>Polenta</td><td>Sémola de maíz</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">💡</span><strong>A tener en cuenta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Masa harina ≠ harina de arepa.</strong> Una es nixtamalizada (México), la otra no (Venezuela/Colombia).</li>
                <li><strong>Maicena ≠ harina de maíz.</strong> La maicena es solo almidón, para espesar.</li>
                <li><strong>El maíz de palomitas es especial.</strong> Solo esa variedad revienta bien.</li>
                <li><strong>El maíz no tiene gluten.</strong> Útil en cocina sin gluten, pero no panifica solo.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-maices')} />
      <ShareCard appName="guia-maices" />
      <Footer appName="guia-maices" />
    </div>
  );
}
