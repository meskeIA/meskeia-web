'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraMermelada.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { NIVELES_MERMELADA, calcularMermelada } from '@/lib/calculadoras/mermelada';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraMermeladaPage() {
  const [nivelId, setNivelId] = useState('equilibrada');
  const [fruta, setFruta] = useState('1000');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularMermelada(nivelId, num(fruta)), [nivelId, fruta]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de mermelada</h1>
        <p className={styles.subtitle}>Azúcar y limón para tu mermelada según la fruta y el dulzor que quieras</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Nivel de azúcar</p>
          <div className={styles.tipoBtns} role="group" aria-label="Nivel de azúcar">
            {NIVELES_MERMELADA.map((n) => (
              <button key={n.id} type="button" aria-pressed={nivelId === n.id}
                className={`${styles.tipoBtn} ${nivelId === n.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setNivelId(n.id)}>
                <span className={styles.tipoBtnNombre}>{n.nombre}</span>
                <span className={styles.tipoBtnNota}>{n.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="fruta" className={styles.label}>Fruta ya limpia (g)</label>
            <input id="fruta" type="text" inputMode="numeric" className={styles.input}
              value={fruta} onChange={(e) => setFruta(e.target.value)} />
          </div>

          {resultado ? (
            <>
              <div className={styles.resultadoGrid} role="status" aria-live="polite">
                <div className={styles.resCard}><span className={styles.resValor}>{formatNumber(resultado.fruta_g, 0)} g</span><span className={styles.resLabel}>fruta</span></div>
                <div className={`${styles.resCard} ${styles.resCardDestacado}`}><span className={styles.resValor}>{formatNumber(resultado.azucar_g, 0)} g</span><span className={styles.resLabel}>azúcar</span></div>
                <div className={styles.resCard}><span className={styles.resValor}>{formatNumber(resultado.limon_ml, 0)} ml</span><span className={styles.resLabel}>zumo de limón</span></div>
              </div>
              {resultado.necesitaPectina && (
                <p className={styles.notaBox}><span aria-hidden="true">💡</span> Con tan poca azúcar conviene añadir pectina (o usar fruta rica en ella, como manzana o cítricos) para que cuaje, y guardarla en la nevera.</p>
              )}
            </>
          ) : (
            <p className={styles.placeholder}>Introduce el peso de la fruta.</p>
          )}
        </section>

        <EducationalSection title="Mermelada casera" subtitle="El papel del azúcar, el limón y el punto de cuajado">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Azúcar, acidez y pectina</h2>
              <p>
                Una mermelada cuaja cuando se juntan tres cosas: azúcar, acidez y pectina. El azúcar
                no solo endulza, también conserva y ayuda a la textura; la acidez (el limón) y la
                pectina (natural de la fruta o añadida) son las que hacen que el conjunto gelifique al
                enfriar. Por eso, cuanto menos azúcar uses, más importante es compensar con pectina y
                acidez, y más corta será la conservación. Encontrar tu proporción favorita es cuestión
                de equilibrar dulzor, sabor de la fruta y textura.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Niveles de azúcar</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Nivel</th><th scope="col">Azúcar</th><th scope="col">Conservación</th></tr></thead>
                <tbody>
                  <tr><td>Tradicional</td><td>100% de la fruta</td><td>Larga; cuaja sola</td></tr>
                  <tr><td>Equilibrada</td><td>70%</td><td>Media; sabor a fruta</td></tr>
                  <tr><td>Ligera</td><td>50%</td><td>Corta; necesita pectina</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para que salga y se conserve</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Prueba del plato frío.</strong> Si la gota se arruga al empujarla, está en su punto (104-105 °C).</li>
                <li><strong>Esteriliza los tarros.</strong> Para guardarla fuera de la nevera; llénalos en caliente y crea el vacío.</li>
                <li><strong>Poca azúcar, a la nevera.</strong> Las mermeladas ligeras duran menos; refrigéralas o congélalas.</li>
                <li><strong>No la dejes sin remover.</strong> Espesa rápido al final y se pega con facilidad.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-mermelada')} />
      <ShareCard appName="calculadora-mermelada" />
      <Footer appName="calculadora-mermelada" />
    </div>
  );
}
