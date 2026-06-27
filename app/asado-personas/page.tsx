'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './AsadoPersonas.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { NIVELES_APETITO, calcularAsado } from '@/lib/calculadoras/asadoPersonas';
import { formatNumber } from '@/lib/formatters';

export default function AsadoPersonasPage() {
  const [nivelId, setNivelId] = useState('normal');
  const [personas, setPersonas] = useState('8');
  const [conGuarnicion, setConGuarnicion] = useState(false);

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularAsado(nivelId, num(personas), conGuarnicion), [nivelId, personas, conGuarnicion]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Cuánta carne para un asado</h1>
        <p className={styles.subtitle}>La carne a comprar para tu asado o barbacoa según las personas y el apetito</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Nivel de apetito</p>
          <div className={styles.tipoBtns} role="group" aria-label="Nivel de apetito">
            {NIVELES_APETITO.map((n) => (
              <button key={n.id} type="button" aria-pressed={nivelId === n.id}
                className={`${styles.tipoBtn} ${nivelId === n.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setNivelId(n.id)}>
                <span className={styles.tipoBtnNombre}>{n.nombre} · {n.gramosBase} g/persona</span>
                <span className={styles.tipoBtnNota}>{n.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="personas" className={styles.label}>Número de personas</label>
            <input id="personas" type="text" inputMode="numeric" className={styles.input}
              value={personas} onChange={(e) => setPersonas(e.target.value)} />
          </div>
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={conGuarnicion} onChange={(e) => setConGuarnicion(e.target.checked)} />
            Hay guarniciones abundantes (ensaladas, patatas, pan…)
          </label>

          {resultado ? (
            <>
              <div className={styles.resultadoBig} role="status" aria-live="polite">
                <span className={styles.resBigValor}>{formatNumber(resultado.totalKg, 2)} kg</span>
                <span className={styles.resBigTexto}>de carne cruda en total ({resultado.porPersonaG} g por persona)</span>
              </div>
              <div className={styles.ingredientesBox}>
                {resultado.desglose.map((d) => (
                  <div key={d.tipo} className={styles.ingRow}><span className={styles.ingNombre}>{d.tipo}</span><span className={styles.ingCantidad}>{d.cantidad}</span></div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.placeholder}>Indica el número de personas.</p>
          )}
          <p className={styles.fuenteNota}>Cantidades de carne cruda (pierde 20-30% al cocinarse). El desglose por tipo es orientativo; ajústalo a tu gusto y al de tus invitados.</p>
        </section>

        <EducationalSection title="Calcular el asado" subtitle="Cuánta carne comprar y cómo repartirla">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Ni quedarse corto ni pasarse</h2>
              <p>
                Calcular la carne de un asado es de las cosas que más quebraderos de cabeza dan: ni
                que falte ni acabar con kilos de sobra. La referencia para una barbacoa, donde la
                carne es la estrella, ronda los 400 gramos de carne cruda por persona, que se quedan
                en unos 300 ya hechos porque pierde agua y grasa al cocinarse. Esa cifra sube si el
                grupo es de buen comer y baja si hay muchas guarniciones que llenan. Repartir entre
                varios tipos de carne da variedad y permite contentar a todos.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Un reparto equilibrado</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Tipo</th><th scope="col">Proporción</th></tr></thead>
                <tbody>
                  <tr><td>Res / vacuno</td><td>~50%</td></tr>
                  <tr><td>Cerdo (costilla, panceta)</td><td>~25%</td></tr>
                  <tr><td>Embutido (chorizo, morcilla)</td><td>~15%</td></tr>
                  <tr><td>Pollo</td><td>~10%</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">💡</span><strong>Consejos de asador</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Cuenta el peso crudo.</strong> La carne encoge al asarse; calcula sobre lo que compras.</li>
                <li><strong>Empieza por lo que tarda.</strong> Embutidos y piezas grandes primero; lo fino, al final.</li>
                <li><strong>Confirma el punto con termómetro.</strong> Sobre todo en pollo y cerdo, por seguridad.</li>
                <li><strong>No olvides el resto.</strong> Pan, ensaladas, salsas y bebida completan el asado.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('asado-personas')} />
      <ShareCard appName="asado-personas" />
      <Footer appName="asado-personas" />
    </div>
  );
}
