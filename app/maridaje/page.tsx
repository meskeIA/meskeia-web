'use client';

import { useState } from 'react';
import styles from './Maridaje.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { MARIDAJES, MARIDAJE_POR_ID } from '@/lib/calculadoras/maridaje';

export default function MaridajePage() {
  const [platoId, setPlatoId] = useState('carne-roja');
  const m = MARIDAJE_POR_ID[platoId];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Maridaje de comida</h1>
        <p className={styles.subtitle}>Qué vino y qué cerveza van mejor con cada plato, y por qué</p>
      </header>
      <LegalNotice />
      <DisclaimerCard variant="alcohol" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Selector">
          <p className={styles.bloqueLabel}>¿Qué vas a comer?</p>
          <div className={styles.chipGrid} role="group" aria-label="Tipo de plato">
            {MARIDAJES.map((x) => (
              <button key={x.id} type="button" aria-pressed={platoId === x.id}
                className={`${styles.chip} ${platoId === x.id ? styles.chipActivo : ''}`}
                onClick={() => setPlatoId(x.id)}><span aria-hidden="true">{x.emoji}</span> {x.plato}</button>
            ))}
          </div>

          <div aria-live="polite">
            <div className={styles.maridajeGrid}>
              <div className={styles.maridajeCard}>
                <span className={styles.maridajeIcon} aria-hidden="true">🍷</span>
                <span className={styles.maridajeTipo}>Vino</span>
                <span className={styles.maridajeTexto}>{m.vino}</span>
              </div>
              <div className={styles.maridajeCard}>
                <span className={styles.maridajeIcon} aria-hidden="true">🍺</span>
                <span className={styles.maridajeTipo}>Cerveza</span>
                <span className={styles.maridajeTexto}>{m.cerveza}</span>
              </div>
            </div>
            <p className={styles.maridajePorque}><strong>Por qué:</strong> {m.porque}</p>
          </div>
        </section>

        <EducationalSection title="El arte del maridaje" subtitle="Cómo se realzan la comida y la bebida">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Que se realcen, no que compitan</h2>
              <p>
                Maridar es buscar que el plato y la bebida se potencien en lugar de taparse. Hay dos
                caminos: por afinidad (sabores que van en la misma dirección, como un postre dulce
                con un vino dulce) o por contraste (sabores opuestos que se equilibran, como un queso
                graso con un vino ácido). Funcionan ideas sencillas: la intensidad de la bebida debe
                ir acorde con la del plato, la acidez corta la grasa, el dulzor calma el picante y las
                burbujas limpian el paladar. A partir de ahí, manda tu gusto.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Ideas que casi siempre funcionan</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Si el plato es…</th><th scope="col">Busca…</th></tr></thead>
                <tbody>
                  <tr><td>Graso o intenso</td><td>Acidez o taninos que lo corten</td></tr>
                  <tr><td>Delicado</td><td>Bebida ligera que no lo tape</td></tr>
                  <tr><td>Picante</td><td>Dulzor y mucho frío</td></tr>
                  <tr><td>Dulce</td><td>Bebida igual o más dulce</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Consumo responsable</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Solo para mayores de edad.</strong> El alcohol no es apto para menores ni durante el embarazo.</li>
                <li><strong>Con moderación.</strong> Disfrutar un buen maridaje no es beber mucho, sino beber bien.</li>
                <li><strong>Nunca al volante.</strong> Si conduces, no bebas.</li>
                <li><strong>Es una orientación.</strong> El mejor maridaje es el que a ti te gusta.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('maridaje')} />
      <ShareCard appName="maridaje" />
      <Footer appName="maridaje" />
    </div>
  );
}
