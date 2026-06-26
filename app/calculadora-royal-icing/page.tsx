'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraRoyalIcing.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { CONSISTENCIAS_ICING, CONSISTENCIA_ICING_POR_ID, calcularIcing } from '@/lib/calculadoras/royalIcing';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraRoyalIcingPage() {
  const [consistenciaId, setConsistenciaId] = useState('media');
  const [claras, setClaras] = useState('1');

  const consistencia = CONSISTENCIA_ICING_POR_ID[consistenciaId];
  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularIcing(consistenciaId, num(claras)), [consistenciaId, claras]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Glaseado real (royal icing)</h1>
        <p className={styles.subtitle}>Azúcar glas y claras para tu glasa según la consistencia que necesites</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Consistencia</p>
          <div className={styles.tipoBtns} role="group" aria-label="Consistencia de la glasa">
            {CONSISTENCIAS_ICING.map((c) => (
              <button key={c.id} type="button" aria-pressed={consistenciaId === c.id}
                className={`${styles.tipoBtn} ${consistenciaId === c.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setConsistenciaId(c.id)}>
                <span className={styles.tipoBtnNombre}>{c.nombre}</span>
                <span className={styles.tipoBtnNota}>{c.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="claras" className={styles.label}>Número de claras (o 5 g de albúmina + 30 ml agua c/u)</label>
            <input id="claras" type="text" inputMode="decimal" className={styles.input}
              value={claras} onChange={(e) => setClaras(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.ingredientesBox} role="status" aria-live="polite">
              <div className={styles.ingRow}><span className={styles.ingNombre}>Azúcar glas</span><span className={styles.ingCantidad}>{formatNumber(resultado.glas_g, 0)} g</span></div>
              <div className={styles.ingRow}><span className={styles.ingNombre}>Claras (o albúmina)</span><span className={styles.ingCantidad}>{formatNumber(resultado.claras_g, 0)} g</span></div>
              <div className={styles.ingRow}><span className={styles.ingNombre}>Zumo de limón</span><span className={styles.ingCantidad}>{resultado.limonGotas} gotas</span></div>
              <div className={styles.ingRow}><span className={styles.ingNombre}>Agua extra</span><span className={styles.ingCantidad}>{resultado.aguaExtra}</span></div>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce el número de claras.</p>
          )}
        </section>

        <EducationalSection title="Decorar con glasa" subtitle="Las consistencias, el secado y los trucos de acabado">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Una glasa, varias consistencias</h2>
              <p>
                El glaseado real es azúcar glas y clara batidos hasta una pasta que endurece al
                secar. Lo mágico es que, con la misma base, ajustando la cantidad de azúcar y unas
                gotas de agua, obtienes consistencias muy distintas: una rígida que mantiene el pico
                para hacer contornos, letras y flores, y una fluida de relleno que se alisa sola para
                cubrir la galleta. Dominar esas consistencias es la base de la decoración de
                galletas. Si prefieres evitar el huevo crudo, la albúmina en polvo hace el mismo
                papel que la clara.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Las consistencias</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Consistencia</th><th scope="col">Para qué</th></tr></thead>
                <tbody>
                  <tr><td>Rígida</td><td>Contornos, letras, flores, pegar piezas</td></tr>
                  <tr><td>Media</td><td>Bordes y detalles que no se caen</td></tr>
                  <tr><td>Relleno (flood)</td><td>Cubrir superficies; se cierra en 10-15 s</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Trucos de acabado</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Tamiza el azúcar glas.</strong> Cualquier grumo tapona la boquilla; tamizar evita disgustos.</li>
                <li><strong>Tapa la glasa.</strong> Se seca enseguida al aire; cúbrela con film a piel mientras trabajas.</li>
                <li><strong>Primero el contorno.</strong> Haz el borde con glasa rígida y rellena después con la fluida.</li>
                <li><strong>Seca del todo.</strong> Deja secar varias horas (mejor toda la noche) para un acabado duro y brillante.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-royal-icing')} />
      <ShareCard appName="calculadora-royal-icing" />
      <Footer appName="calculadora-royal-icing" />
    </div>
  );
}
