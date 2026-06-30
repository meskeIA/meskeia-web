'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraMerengue.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { TIPOS_MERENGUE, calcularMerengue } from '@/lib/calculadoras/merengue';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraMerenguePage() {
  const [tipoId, setTipoId] = useState('frances');
  const [claras, setClaras] = useState('3');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularMerengue(tipoId, num(claras)), [tipoId, claras]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de merengue</h1>
        <p className={styles.subtitle}>Las claras y el azúcar exactos según el tipo de merengue</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Tipo de merengue</p>
          <div className={styles.tipoBtns} role="group" aria-label="Tipo de merengue">
            {TIPOS_MERENGUE.map((t) => (
              <button key={t.id} type="button" aria-pressed={tipoId === t.id}
                className={`${styles.tipoBtn} ${tipoId === t.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setTipoId(t.id)}>
                <span className={styles.tipoBtnNombre}>{t.nombre}</span>
                <span className={styles.tipoBtnNota}>{t.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="claras" className={styles.label}>Número de claras (≈ 33 g cada una)</label>
            <input id="claras" type="text" inputMode="decimal" className={styles.input}
              value={claras} onChange={(e) => setClaras(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoGrid} role="status" aria-live="polite">
              <div className={styles.resCard}>
                <span className={styles.resValor}>{formatNumber(resultado.claras_g, 0)} g</span>
                <span className={styles.resLabel}>claras</span>
              </div>
              <div className={`${styles.resCard} ${styles.resCardDestacado}`}>
                <span className={styles.resValor}>{formatNumber(resultado.azucar_g, 0)} g</span>
                <span className={styles.resLabel}>azúcar</span>
              </div>
              {resultado.aguaAlmibar_g !== null && (
                <div className={styles.resCard}>
                  <span className={styles.resValor}>{formatNumber(resultado.aguaAlmibar_g, 0)} g</span>
                  <span className={styles.resLabel}>agua del almíbar (a 118 °C)</span>
                </div>
              )}
              <div className={styles.resCard}>
                <span className={styles.resValor}>{formatNumber(resultado.cremaTartaro_g, 1)} g</span>
                <span className={styles.resLabel}>crémor tártaro (opcional)</span>
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce el número de claras.</p>
          )}
        </section>

        <EducationalSection title="Dominar el merengue" subtitle="Los tres tipos, la proporción y por qué a veces falla">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Tres formas de montar claras con azúcar</h2>
              <p>
                El merengue es aire atrapado en una red de proteínas de la clara, sostenido por el
                azúcar. Lo que distingue a los tres tipos es cómo se incorpora ese azúcar. El
                francés lo hace en frío y es el más delicado; el suizo calienta la mezcla al baño
                maría, lo que lo vuelve más denso y estable; y el italiano cuece las claras con un
                almíbar caliente, dando el merengue más resistente de todos. En los tres, la
                proporción de referencia es el doble de azúcar que de claras. Es la base ideal
                para cubrir o decorar una tarta (torta o pastel), hacer suspiros o coronar un
                postre.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Cuál usar para qué</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Tipo</th><th scope="col">Estabilidad</th><th scope="col">Uso típico</th></tr></thead>
                <tbody>
                  <tr><td>Francés</td><td>Baja</td><td>Hornear: suspiros, macarons</td></tr>
                  <tr><td>Suizo</td><td>Media</td><td>Coberturas de tarta (torta o pastel) y buttercream</td></tr>
                  <tr><td>Italiano</td><td>Alta</td><td>Mousses, decoración, flamear</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para que monte y no se baje</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Cero grasa.</strong> Bol y varillas limpios y secos; ni rastro de yema en las claras.</li>
                <li><strong>Azúcar poco a poco.</strong> Añádelo en hilo cuando las claras empiecen a espumar, no de golpe.</li>
                <li><strong>Estabiliza.</strong> Una pizca de crémor tártaro o unas gotas de limón ayudan a sostener el merengue.</li>
                <li><strong>Italiano: cuida el almíbar.</strong> A 118 °C exactos; pásate y queda duro, quédate corto y no cuaja.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-merengue')} />
      <ShareCard appName="calculadora-merengue" />
      <Footer appName="calculadora-merengue" />
    </div>
  );
}
