'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './RatioCafe.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  METODOS_CAFE,
  METODO_CAFE_POR_ID,
  calcularCafe,
  type ModoCafe,
} from '@/lib/calculadoras/ratioCafe';
import { formatNumber } from '@/lib/formatters';

const MODOS: { id: ModoCafe; etiqueta: string }[] = [
  { id: 'por-tazas', etiqueta: 'Por tazas' },
  { id: 'por-agua', etiqueta: 'Por agua (ml)' },
  { id: 'por-cafe', etiqueta: 'Por café (g)' },
];

export default function RatioCafePage() {
  const [metodoId, setMetodoId] = useState('v60');
  const [modo, setModo] = useState<ModoCafe>('por-tazas');
  const [valor, setValor] = useState('2');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const metodo = METODO_CAFE_POR_ID[metodoId];
  const resultado = useMemo(
    () => calcularCafe(metodoId, modo, num(valor)),
    [metodoId, modo, valor],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de ratio de café</h1>
        <p className={styles.subtitle}>
          Los gramos de café y el agua exactos para cada método de preparación
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <div className={styles.campo}>
            <label htmlFor="metodo" className={styles.label}>Método</label>
            <select id="metodo" className={styles.select} value={metodoId} onChange={(e) => setMetodoId(e.target.value)}>
              {METODOS_CAFE.map((m) => (
                <option key={m.id} value={m.id}>{m.emoji} {m.nombre} (1:{m.ratio})</option>
              ))}
            </select>
            <p className={styles.metodoNota}>{metodo.nota}</p>
          </div>

          <div className={styles.modoTabs} role="tablist" aria-label="Qué dato introduces">
            {MODOS.map((m) => (
              <button key={m.id} type="button" role="tab" aria-selected={modo === m.id}
                className={`${styles.modoTab} ${modo === m.id ? styles.modoTabActivo : ''}`}
                onClick={() => setModo(m.id)}>{m.etiqueta}</button>
            ))}
          </div>

          <div className={styles.campo}>
            <label htmlFor="valor" className={styles.label}>
              {modo === 'por-tazas' ? 'Número de tazas (200 ml)' : modo === 'por-agua' ? 'Agua (ml)' : 'Café (g)'}
            </label>
            <input id="valor" type="text" inputMode="decimal" className={styles.input}
              value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoGrid} role="status" aria-live="polite">
              <div className={`${styles.resCard} ${styles.resCardDestacado}`}>
                <span className={styles.resValor}>{formatNumber(resultado.cafe_g, 1)} g</span>
                <span className={styles.resLabel}>de café molido</span>
              </div>
              <div className={styles.resCard}>
                <span className={styles.resValor}>{formatNumber(resultado.agua_g, 0)} g/ml</span>
                <span className={styles.resLabel}>de agua</span>
              </div>
              <div className={styles.resCard}>
                <span className={styles.resValor}>{formatNumber(resultado.tazas, 1)}</span>
                <span className={styles.resLabel}>tazas (200 ml)</span>
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce una cantidad para calcular.</p>
          )}
        </section>

        <EducationalSection
          title="El café, en su punto"
          subtitle="Cómo afinar la intensidad con el ratio y la molienda"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El ratio manda en la intensidad</h2>
              <p>
                La proporción entre café y agua —el ratio— es lo que más influye en lo cargado que
                sale el café. Se expresa como 1:X: un gramo de café por X de agua. Un 1:15 da un café
                con cuerpo; un 1:17, uno más ligero. Cada método tiene su ratio habitual porque la
                forma de extraer es distinta: el filtro necesita más agua por gramo que un espresso,
                y el cold brew se hace muy concentrado porque luego se diluye. A partir de ahí, ajusta
                a tu gusto: subir o bajar un punto el ratio es la palanca más fácil.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>La molienda de cada método</h2>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr><th scope="col">Método</th><th scope="col">Ratio</th><th scope="col">Molienda</th></tr>
                </thead>
                <tbody>
                  <tr><td>Espresso</td><td>1:2</td><td>Muy fina</td></tr>
                  <tr><td>Moka</td><td>1:10</td><td>Fina-media</td></tr>
                  <tr><td>AeroPress</td><td>1:14</td><td>Media</td></tr>
                  <tr><td>V60 / goteo</td><td>1:16</td><td>Media-fina</td></tr>
                  <tr><td>Prensa francesa</td><td>1:15</td><td>Gruesa</td></tr>
                  <tr><td>Cold brew</td><td>1:8</td><td>Gruesa</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Para que no salga ni aguado ni amargo</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Pesa el café.</strong> Las cucharadas varían mucho; una báscula da resultados repetibles.</li>
                <li><strong>Ajusta la molienda al método.</strong> Demasiado fina amarga; demasiado gruesa deja el café aguado.</li>
                <li><strong>Cuida la temperatura del agua.</strong> Entre 90 y 96 °C; agua hirviendo a borbotones quema el café.</li>
                <li><strong>Usa café recién molido.</strong> Pierde aroma muy rápido tras molerlo; muele justo antes.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('ratio-cafe')} />
      <ShareCard appName="ratio-cafe" />
      <Footer appName="ratio-cafe" />
    </div>
  );
}
