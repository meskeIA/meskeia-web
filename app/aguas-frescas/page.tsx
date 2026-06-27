'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './AguasFrescas.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { AGUAS_FRESCAS, AGUA_FRESCA_POR_ID, calcularAguaFresca } from '@/lib/calculadoras/aguasFrescas';

export default function AguasFrescasPage() {
  const [tipoId, setTipoId] = useState('limonada');
  const [litros, setLitros] = useState('2');

  const tipo = AGUA_FRESCA_POR_ID[tipoId];
  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularAguaFresca(tipoId, num(litros)), [tipoId, litros]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Aguas frescas y limonada</h1>
        <p className={styles.subtitle}>Las proporciones para tus bebidas refrescantes según los litros que prepares</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Bebida</p>
          <div className={styles.tipoBtns} role="group" aria-label="Tipo de bebida">
            {AGUAS_FRESCAS.map((a) => (
              <button key={a.id} type="button" aria-pressed={tipoId === a.id}
                className={`${styles.tipoBtn} ${tipoId === a.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setTipoId(a.id)}>
                <span className={styles.tipoBtnNombre}><span aria-hidden="true">{a.emoji}</span> {a.nombre}</span>
                <span className={styles.tipoBtnNota}>{a.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="litros" className={styles.label}>Litros a preparar</label>
            <input id="litros" type="text" inputMode="decimal" className={styles.input}
              value={litros} onChange={(e) => setLitros(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.ingredientesBox} role="status" aria-live="polite">
              {resultado.map((i) => (
                <div key={i.nombre} className={styles.ingRow}><span className={styles.ingNombre}>{i.nombre}</span><span className={styles.ingCantidad}>{i.cantidad}</span></div>
              ))}
            </div>
          ) : (
            <p className={styles.placeholder}>Elige una bebida y los litros.</p>
          )}
          <p className={styles.fuenteNota}>El azúcar es al gusto: ajústalo según lo dulce que esté la fruta y tu preferencia. Sirve bien frío, con hielo.</p>
        </section>

        <EducationalSection title="Aguas frescas caseras" subtitle="Bebidas refrescantes del mundo, sin alcohol">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Refrescar con poco</h2>
              <p>
                Las aguas frescas son la respuesta de medio mundo al calor: agua, algo de fruta,
                flores o semillas, y un toque de azúcar. Son baratas, fáciles y mucho más
                interesantes que un refresco industrial, porque controlas el azúcar y el sabor. Cada
                cultura tiene las suyas —la jamaica y la horchata en México, las limonadas por todas
                partes, las aguas de fruta en verano— y casi todas se basan en una proporción sencilla
                que solo hay que escalar a la cantidad que quieras preparar.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Algunas clásicas</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Bebida</th><th scope="col">Base</th></tr></thead>
                <tbody>
                  <tr><td>Limonada</td><td>Agua, zumo de limón y azúcar</td></tr>
                  <tr><td>Agua de jamaica</td><td>Flor de hibisco infusionada y endulzada</td></tr>
                  <tr><td>Horchata de arroz</td><td>Arroz triturado con canela, colado</td></tr>
                  <tr><td>Agua de fruta</td><td>Fruta triturada con agua y azúcar</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">💡</span><strong>Para que salgan ricas</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Disuelve el azúcar en caliente</strong> o como almíbar, para que no quede en el fondo.</li>
                <li><strong>Cuela bien</strong> las de semilla o flor (horchata, jamaica) para una textura limpia.</li>
                <li><strong>Sírvelas muy frías.</strong> Ganan mucho con hielo y un toque de hierbabuena o cítrico.</li>
                <li><strong>Consúmelas el día.</strong> Sin conservantes, aguantan poco; guárdalas en la nevera.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('aguas-frescas')} />
      <ShareCard appName="aguas-frescas" />
      <Footer appName="aguas-frescas" />
    </div>
  );
}
