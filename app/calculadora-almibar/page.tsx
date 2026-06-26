'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraAlmibar.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { USOS_ALMIBAR, USO_ALMIBAR_POR_ID, calcularAlmibar } from '@/lib/calculadoras/almibar';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraAlmibarPage() {
  const [usoId, setUsoId] = useState('medio');
  const [cantidad, setCantidad] = useState('300');

  const uso = USO_ALMIBAR_POR_ID[usoId];
  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(
    () => calcularAlmibar(uso.azucar, uso.agua, num(cantidad)),
    [uso, cantidad],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de almíbar</h1>
        <p className={styles.subtitle}>Azúcar y agua para tu almíbar según el uso, con el °Brix resultante</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>¿Para qué lo quieres?</p>
          <div className={styles.tipoBtns} role="group" aria-label="Uso del almíbar">
            {USOS_ALMIBAR.map((u) => (
              <button key={u.id} type="button" aria-pressed={usoId === u.id}
                className={`${styles.tipoBtn} ${usoId === u.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setUsoId(u.id)}>
                <span className={styles.tipoBtnNombre}>{u.nombre}</span>
                <span className={styles.tipoBtnNota}>{u.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="cantidad" className={styles.label}>Almíbar a preparar (g, aprox.)</label>
            <input id="cantidad" type="text" inputMode="numeric" className={styles.input}
              value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoGrid} role="status" aria-live="polite">
              <div className={`${styles.resCard} ${styles.resCardDestacado}`}>
                <span className={styles.resValor}>{formatNumber(resultado.azucar_g, 0)} g</span>
                <span className={styles.resLabel}>azúcar</span>
              </div>
              <div className={`${styles.resCard} ${styles.resCardDestacado}`}>
                <span className={styles.resValor}>{formatNumber(resultado.agua_g, 0)} g</span>
                <span className={styles.resLabel}>agua</span>
              </div>
              <div className={styles.resCard}>
                <span className={styles.resValor}>{resultado.brix} °Bx</span>
                <span className={styles.resLabel}>concentración (ratio {resultado.ratio})</span>
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce la cantidad de almíbar.</p>
          )}
        </section>

        <EducationalSection title="El almíbar, al detalle" subtitle="Qué densidad usar para cada cosa y cómo prepararlo">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Densidad según el uso</h2>
              <p>
                El almíbar no es siempre igual: lo que cambia es la proporción de azúcar respecto al
                agua, y con ella su densidad. Un almíbar muy ligero cala los bizcochos sin
                empalagar; uno a partes iguales es el todoterreno de sorbetes y macedonias; y uno
                cargado de azúcar (sirope) aguanta en coctelería y ayuda a conservar la fruta porque
                el azúcar retiene el agua y frena a los microorganismos. El °Brix —el porcentaje de
                azúcar— resume esa densidad en un número.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Usos y proporciones</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Uso</th><th scope="col">Azúcar:agua</th><th scope="col">°Brix aprox.</th></tr></thead>
                <tbody>
                  <tr><td>Emborrachar bizcochos</td><td>1:2</td><td>33</td></tr>
                  <tr><td>Sorbetes y macerar</td><td>1:1</td><td>50</td></tr>
                  <tr><td>Cócteles y conservar</td><td>2:1</td><td>66</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>A tener en cuenta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Disuelve bien el azúcar.</strong> Remueve hasta que el líquido quede transparente; si quedan cristales, pueden agarrar.</li>
                <li><strong>No lo hiervas de más</strong> si lo quieres ligero: cuanto más cuece, más se concentra y sube el °Brix.</li>
                <li><strong>Deja enfriar antes de calar.</strong> El almíbar caliente reseca el bizcocho en vez de dar jugosidad.</li>
                <li><strong>Para puntos como bola o caramelo,</strong> usa la calculadora de puntos del azúcar: ahí manda la temperatura, no solo la proporción.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-almibar')} />
      <ShareCard appName="calculadora-almibar" />
      <Footer appName="calculadora-almibar" />
    </div>
  );
}
