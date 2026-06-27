'use client';

import { useMemo, useState } from 'react';
import styles from './EscaladoCocteles.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { COCTELES, COCTEL_POR_ID, escalarCoctel } from '@/lib/calculadoras/escaladoCocteles';
import { formatNumber } from '@/lib/formatters';

export default function EscaladoCoctelesPage() {
  const [coctelId, setCoctelId] = useState('negroni');
  const [copas, setCopas] = useState('6');

  const coctel = COCTEL_POR_ID[coctelId];
  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => escalarCoctel(coctelId, num(copas)), [coctelId, copas]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Escalado de cócteles</h1>
        <p className={styles.subtitle}>Escala un cóctel a las copas que necesites y calcula la graduación de la mezcla</p>
      </header>
      <LegalNotice />
      <DisclaimerCard variant="alcohol" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Cóctel</p>
          <div className={styles.chipGrid} role="group" aria-label="Cóctel">
            {COCTELES.map((c) => (
              <button key={c.id} type="button" aria-pressed={coctelId === c.id}
                className={`${styles.chip} ${coctelId === c.id ? styles.chipActivo : ''}`}
                onClick={() => setCoctelId(c.id)}><span aria-hidden="true">{c.emoji}</span> {c.nombre}</button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="copas" className={styles.label}>Número de copas</label>
            <input id="copas" type="text" inputMode="numeric" className={styles.input}
              value={copas} onChange={(e) => setCopas(e.target.value)} />
          </div>

          {resultado ? (
            <>
              <div className={styles.ingredientesBox} role="status" aria-live="polite">
                {resultado.ingredientes.map((i) => (
                  <div key={i.nombre} className={styles.ingRow}><span className={styles.ingNombre}>{i.nombre}</span><span className={styles.ingCantidad}>{formatNumber(i.ml, 0)} ml</span></div>
                ))}
              </div>
              <p className={styles.notaBox}>
                <span aria-hidden="true">🍸</span> Graduación estimada de la mezcla (con dilución del hielo):{' '}
                <strong>{formatNumber(resultado.abvFinal, 1)}% vol</strong> · ~{resultado.volumenPorCopa} ml por copa.
              </p>
            </>
          ) : (
            <p className={styles.placeholder}>Elige un cóctel y el número de copas.</p>
          )}
        </section>

        <EducationalSection title="Cócteles a escala" subtitle="Cómo multiplicar recetas y entender la graduación">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Escalar bien para no improvisar</h2>
              <p>
                Preparar cócteles para un grupo no es servir más fuerte, sino multiplicar la receta
                manteniendo las proporciones. Un cóctel equilibrado lo está gracias a una relación
                concreta entre licores, cítricos, dulce y dilución; si esa relación se rompe, el
                resultado decepciona. Por eso conviene escalar con números y, para muchas personas,
                preparar la base por adelantado y reservar el hielo y lo gaseoso para el momento de
                servir, de forma que no se aguen ni pierdan el gas.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>El papel de la dilución</h2>
              <p>
                El hielo no solo enfría: al removerlo o agitarlo, se derrite un poco y añade agua que
                rebaja la graduación y redondea el sabor. Un cóctel sin esa dilución resulta áspero y
                demasiado fuerte. Por eso la graduación final de la mezcla siempre es menor que la
                suma de los licores, y por eso un mismo cóctel sabe distinto recién hecho que reposado.
                La cantidad de dilución depende del método: se diluye más agitando que removiendo.
              </p>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Consumo responsable</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Solo para mayores de edad.</strong> El alcohol no es apto para menores ni durante el embarazo.</li>
                <li><strong>Bebe con moderación.</strong> Ofrece siempre agua y opciones sin alcohol.</li>
                <li><strong>Nunca al volante.</strong> Si vas a conducir, no bebas.</li>
                <li><strong>Las cantidades son orientativas.</strong> La graduación real depende de las marcas y del hielo.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('escalado-cocteles')} />
      <ShareCard appName="escalado-cocteles" />
      <Footer appName="escalado-cocteles" />
    </div>
  );
}
