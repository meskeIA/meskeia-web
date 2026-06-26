'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraSalmuera.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { NIVELES_SALMUERA, NIVEL_SALMUERA_POR_ID, calcularSalmuera, TIEMPOS_SALMUERA } from '@/lib/calculadoras/salmuera';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraSalmueraPage() {
  const [nivelId, setNivelId] = useState('media');
  const [agua, setAgua] = useState('1000');

  const nivel = NIVEL_SALMUERA_POR_ID[nivelId];
  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularSalmuera(nivelId, num(agua)), [nivelId, agua]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de salmuera</h1>
        <p className={styles.subtitle}>La sal y el agua para tu salmuera, con los tiempos según la pieza</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Concentración</p>
          <div className={styles.tipoBtns} role="group" aria-label="Concentración de salmuera">
            {NIVELES_SALMUERA.map((n) => (
              <button key={n.id} type="button" aria-pressed={nivelId === n.id}
                className={`${styles.tipoBtn} ${nivelId === n.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setNivelId(n.id)}>
                <span className={styles.tipoBtnNombre}>{n.nombre}</span>
                <span className={styles.tipoBtnNota}>{n.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="agua" className={styles.label}>Agua (ml)</label>
            <input id="agua" type="text" inputMode="numeric" className={styles.input}
              value={agua} onChange={(e) => setAgua(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoGrid} role="status" aria-live="polite">
              <div className={`${styles.resCard} ${styles.resCardDestacado}`}>
                <span className={styles.resValor}>{formatNumber(resultado.sal_g, 0)} g</span>
                <span className={styles.resLabel}>sal ({resultado.porcentaje}%)</span>
              </div>
              <div className={styles.resCard}>
                <span className={styles.resValor}>{formatNumber(resultado.azucar_g, 0)} g</span>
                <span className={styles.resLabel}>azúcar (opcional)</span>
              </div>
              <div className={styles.resCard}>
                <span className={styles.resValor}>{formatNumber(resultado.agua_ml, 0)} ml</span>
                <span className={styles.resLabel}>agua</span>
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce los mililitros de agua.</p>
          )}
        </section>

        <section className={styles.tablaSection} aria-labelledby="tiempos-titulo">
          <h2 id="tiempos-titulo" className={styles.seccionTitulo}><span aria-hidden="true">⏱️</span> Tiempos orientativos por pieza</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tabla}>
              <thead><tr><th scope="col">Pieza</th><th scope="col">Tiempo</th></tr></thead>
              <tbody>
                {TIEMPOS_SALMUERA.map((t) => (
                  <tr key={t.pieza}><td className={styles.celNombre}><span aria-hidden="true">{t.emoji}</span> {t.pieza}</td><td className={styles.celTemp}>{t.tiempo}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <EducationalSection title="La salmuera, paso a paso" subtitle="Por qué da jugosidad y cómo no pasarse de sal">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Sal que da jugosidad</h2>
              <p>
                Sumergir una carne magra en agua con sal antes de cocinarla hace que retenga más
                humedad y se sazone por dentro, no solo por fuera. La sal modifica las proteínas para
                que aguanten mejor el calor sin secarse, por eso una pechuga o un lomo quedan mucho
                más jugosos tras una salmuera. La concentración y el tiempo son las dos variables que
                hay que controlar: más sal actúa más rápido, pero también satura antes, así que
                conviene ajustar el tiempo a la pieza.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Concentraciones</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Salmuera</th><th scope="col">Sal por litro</th><th scope="col">Uso</th></tr></thead>
                <tbody>
                  <tr><td>Ligera (4%)</td><td>40 g</td><td>Piezas finas o tiempos largos</td></tr>
                  <tr><td>Media (6%)</td><td>60 g</td><td>Uso general</td></tr>
                  <tr><td>Intensa (8%)</td><td>80 g</td><td>Rápida y sabrosa, con cuidado</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para que no quede salado</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Respeta el tiempo.</strong> Pasarse satura la carne de sal y le da textura curada.</li>
                <li><strong>Disuelve bien la sal.</strong> Si usas agua templada, deja enfriar antes de meter la carne.</li>
                <li><strong>Salmuera en frío.</strong> Mantén la pieza en la nevera mientras está en salmuera.</li>
                <li><strong>Seca antes de cocinar.</strong> Escurre y seca la pieza para que dore bien.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-salmuera')} />
      <ShareCard appName="calculadora-salmuera" />
      <Footer appName="calculadora-salmuera" />
    </div>
  );
}
