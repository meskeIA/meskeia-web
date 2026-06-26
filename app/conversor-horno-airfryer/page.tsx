'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './ConversorHornoAirfryer.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { convertirAAirfryer, REFERENCIAS_AIRFRYER } from '@/lib/calculadoras/hornoAirfryer';
import { formatNumber } from '@/lib/formatters';

export default function ConversorHornoAirfryerPage() {
  const [tempHorno, setTempHorno] = useState('200');
  const [tiempoHorno, setTiempoHorno] = useState('25');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(
    () => convertirAAirfryer(num(tempHorno), num(tiempoHorno)),
    [tempHorno, tiempoHorno],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Horno → freidora de aire</h1>
        <p className={styles.subtitle}>
          Adapta cualquier receta de horno a la air fryer: baja la temperatura y reduce el tiempo,
          con la conversión exacta
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Conversor">
          <div className={styles.entradaFila}>
            <div className={styles.campo}>
              <label htmlFor="temp" className={styles.label}>Temperatura del horno (°C)</label>
              <input id="temp" type="text" inputMode="numeric" className={styles.input}
                value={tempHorno} onChange={(e) => setTempHorno(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="tiempo" className={styles.label}>Tiempo del horno (min)</label>
              <input id="tiempo" type="text" inputMode="numeric" className={styles.input}
                value={tiempoHorno} onChange={(e) => setTiempoHorno(e.target.value)} />
            </div>
          </div>

          {resultado ? (
            <div className={styles.resultadoGrid} role="status" aria-live="polite">
              <div className={styles.resCard}>
                <span className={styles.resValor}>{resultado.tempC} °C</span>
                <span className={styles.resLabel}>en la freidora de aire ({resultado.tempF} °F)</span>
              </div>
              <div className={styles.resCard}>
                <span className={styles.resValor}>{resultado.tiempoMin} min</span>
                <span className={styles.resLabel}>tiempo aproximado</span>
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce la temperatura y el tiempo del horno.</p>
          )}
          <p className={styles.regla}>
            Regla: −20 °C de temperatura y −20% de tiempo. Vigila y sacude o gira a media cocción.
          </p>
        </section>

        <section className={styles.tablaSection} aria-labelledby="tabla-titulo">
          <h2 id="tabla-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">📋</span> Alimentos habituales en air fryer
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr><th scope="col">Alimento</th><th scope="col">Temp.</th><th scope="col">Tiempo</th><th scope="col">Nota</th></tr>
              </thead>
              <tbody>
                {REFERENCIAS_AIRFRYER.map((r) => (
                  <tr key={r.alimento}>
                    <td className={styles.celNombre}><span aria-hidden="true">{r.emoji}</span> {r.alimento}</td>
                    <td className={styles.celTemp}>{r.tempC} °C</td>
                    <td>{r.tiempo}</td>
                    <td className={styles.celNota}>{r.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <EducationalSection
          title="Cocinar con freidora de aire"
          subtitle="Cómo adaptar recetas del horno y sacarle el máximo partido"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Un horno de convección en pequeño</h2>
              <p>
                La freidora de aire no fríe: es un horno de convección compacto. Un ventilador hace
                circular el aire muy caliente alrededor de la comida en un espacio reducido, de modo
                que cocina más rápido y más por igual que un horno grande, y deja los alimentos
                crujientes con muy poco aceite. Por eso, para adaptar una receta pensada para horno
                convencional, se baja la temperatura unos 20 °C y se reduce el tiempo en torno a un
                20%. Como cada modelo y cada alimento se comportan distinto, lo mejor es usar la
                conversión como punto de partida y vigilar.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Trucos para que salga bien</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🌬️</span>
                  <h4>No amontones</h4>
                  <p>El aire tiene que circular: reparte en una sola capa y, si hay mucho, cocina en tandas.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                  <h4>Sacude a media cocción</h4>
                  <p>Mueve la cesta o da la vuelta a los alimentos para que doren por todos lados.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">💧</span>
                  <h4>Un poco de aceite</h4>
                  <p>Una fina capa en espray ayuda a dorar y a quedar crujiente sin freír.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
                  <h4>Carne, al termómetro</h4>
                  <p>Para pollo y carnes, comprueba la temperatura interna segura, no solo el tiempo.</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Usar la temperatura del horno tal cual.</strong> Sin bajarla, los alimentos se doran de más por fuera y quedan crudos por dentro.</li>
                <li><strong>Llenar demasiado la cesta.</strong> Si el aire no circula, la comida se cuece al vapor en vez de quedar crujiente.</li>
                <li><strong>Masas líquidas sin molde.</strong> Un bizcocho necesita molde; una masa suelta se cuela por la rejilla.</li>
                <li><strong>No vigilar la primera vez.</strong> Cada freidora calienta distinto; la primera tanda es siempre una prueba.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('conversor-horno-airfryer')} />
      <ShareCard appName="conversor-horno-airfryer" />
      <Footer appName="conversor-horno-airfryer" />
    </div>
  );
}
