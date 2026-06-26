'use client';

import { useState } from 'react';
import styles from './SousVide.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { ALIMENTOS_SOUSVIDE, ALIMENTO_SOUSVIDE_POR_ID } from '@/lib/calculadoras/sousVide';

export default function SousVidePage() {
  const [alimentoId, setAlimentoId] = useState('vacuno');
  const alimento = ALIMENTO_SOUSVIDE_POR_ID[alimentoId];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Sous-vide: temperaturas y tiempos</h1>
        <p className={styles.subtitle}>La cocción al vacío a baja temperatura, alimento por alimento y punto por punto</p>
      </header>
      <LegalNotice />
      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Alimento">
          <p className={styles.bloqueLabel}>Elige el alimento</p>
          <div className={styles.chipGrid} role="group" aria-label="Alimento">
            {ALIMENTOS_SOUSVIDE.map((a) => (
              <button key={a.id} type="button" aria-pressed={alimentoId === a.id}
                className={`${styles.chip} ${alimentoId === a.id ? styles.chipActivo : ''}`}
                onClick={() => setAlimentoId(a.id)}>
                <span aria-hidden="true">{a.emoji}</span> {a.nombre.split(' (')[0]}
              </button>
            ))}
          </div>

          <div aria-live="polite">
            <h2 className={styles.seccionTitulo}><span aria-hidden="true">{alimento.emoji}</span> {alimento.nombre}</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.tabla}>
                <thead><tr><th scope="col">Punto</th><th scope="col">°C</th><th scope="col">°F</th></tr></thead>
                <tbody>
                  {alimento.puntos.map((p) => (
                    <tr key={p.nombre}>
                      <td className={styles.celNombre}>{p.nombre}</td>
                      <td className={styles.celTemp}>{p.tempC} °C</td>
                      <td>{p.tempF} °F</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.notaBox}><strong>Tiempo (grosor ~2-3 cm):</strong> {alimento.tiempo}. {alimento.nota}</p>
          </div>
          <p className={styles.fuenteNota}>
            Tiempos para grosor estándar; piezas más gruesas necesitan más. En aves y cerdo, el
            tiempo a temperatura baja es lo que pasteuriza: no lo acortes.
          </p>
        </section>

        <EducationalSection title="Entender el sous-vide" subtitle="Temperatura precisa, tiempo según grosor y seguridad">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>La temperatura es el punto; el tiempo, la seguridad</h2>
              <p>
                En sous-vide el agua está exactamente a la temperatura del punto que buscas, así que
                la carne no se pasa: un filete a 57 °C se queda al punto aunque se alargue. El tiempo
                cumple dos funciones: que el centro de la pieza llegue a esa temperatura (depende del
                grosor) y, en aves y cerdo, pasteurizar para que sea seguro. Por eso, a diferencia de
                un asado, aquí pasarse un poco de tiempo no estropea la carne, pero quedarse corto a
                temperaturas bajas sí compromete la seguridad. Después se sella en sartén para dar
                color y costra.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Temperaturas de referencia</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Alimento</th><th scope="col">Temp.</th><th scope="col">Tiempo</th></tr></thead>
                <tbody>
                  <tr><td>Vacuno al punto</td><td>57 °C</td><td>1–2 h</td></tr>
                  <tr><td>Cerdo jugoso</td><td>60 °C</td><td>1–3 h</td></tr>
                  <tr><td>Pollo seguro</td><td>63 °C</td><td>1–2 h</td></tr>
                  <tr><td>Pescado meloso</td><td>50 °C</td><td>30–45 min</td></tr>
                  <tr><td>Huevo cremoso</td><td>63 °C</td><td>45–60 min</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Seguridad y técnica</strong></div>
              <ul className={styles.warningList}>
                <li><strong>No acortes el tiempo en aves y cerdo.</strong> A temperaturas bajas, el tiempo es lo que pasteuriza y hace seguro el alimento.</li>
                <li><strong>Sella al sacarlo.</strong> Un dorado rápido en sartén muy caliente da costra y sabor sin recocer.</li>
                <li><strong>Enfría rápido si no lo comes ya.</strong> Si guardas la pieza, enfríala en agua con hielo y refrigérala.</li>
                <li><strong>Usa bolsas aptas.</strong> Envasado al vacío o bolsas de cocción seguras a esas temperaturas.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('sous-vide')} />
      <ShareCard appName="sous-vide" />
      <Footer appName="sous-vide" />
    </div>
  );
}
