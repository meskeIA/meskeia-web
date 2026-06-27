'use client';

import { useMemo, useState } from 'react';
import styles from './DescongelacionSegura.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { METODOS_DESCONGELACION, calcularDescongelacion } from '@/lib/calculadoras/descongelacionSegura';

export default function DescongelacionSeguraPage() {
  const [metodoId, setMetodoId] = useState('nevera');
  const [peso, setPeso] = useState('1000');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularDescongelacion(metodoId, num(peso)), [metodoId, peso]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Descongelación segura</h1>
        <p className={styles.subtitle}>Cuánto tarda en descongelarse un alimento, por método seguro. Nunca a temperatura ambiente</p>
      </header>
      <LegalNotice />
      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Método de descongelación</p>
          <div className={styles.tipoBtns} role="group" aria-label="Método">
            {METODOS_DESCONGELACION.map((m) => (
              <button key={m.id} type="button" aria-pressed={metodoId === m.id}
                className={`${styles.tipoBtn} ${metodoId === m.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setMetodoId(m.id)}>
                <span className={styles.tipoBtnNombre}><span aria-hidden="true">{m.emoji}</span> {m.nombre}</span>
                <span className={styles.tipoBtnNota}>{m.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="peso" className={styles.label}>Peso del alimento (g)</label>
            <input id="peso" type="text" inputMode="numeric" className={styles.input}
              value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoBig} role="status" aria-live="polite">
              <span className={styles.resBigValor}>{resultado.tiempo}</span>
              <span className={styles.resBigTexto}>{resultado.inmediato ? 'cocina justo después' : 'tiempo aproximado de descongelación'}</span>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce el peso del alimento.</p>
          )}
          <p className={styles.notaBox}>
            <span aria-hidden="true">🚫</span> <strong>Nunca descongeles a temperatura ambiente.</strong> La superficie
            entra en la zona de peligro (4–60 °C) y las bacterias se multiplican antes de que el centro se descongele.
          </p>
        </section>

        <EducationalSection title="Descongelar sin riesgos" subtitle="Por qué importa el método y cómo elegirlo">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El método importa tanto como el tiempo</h2>
              <p>
                Descongelar parece trivial, pero es uno de los puntos donde más intoxicaciones se
                producen en casa. El motivo: si un alimento se descongela despacio al aire, su
                superficie pasa horas en la franja de temperatura en la que las bacterias se
                multiplican, mientras el interior sigue helado. Por eso hay que descongelar siempre
                en un entorno controlado: la nevera (lo más seguro), el agua fría con cambios
                frecuentes, o el microondas para cocinar al momento. Cada método tiene su tiempo y
                sus reglas.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Los tres métodos seguros</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Método</th><th scope="col">Velocidad</th><th scope="col">Clave</th></tr></thead>
                <tbody>
                  <tr><td>Nevera</td><td>Lento (~10 h/kg)</td><td>El más seguro; permite recongelar si cocinas</td></tr>
                  <tr><td>Agua fría</td><td>Medio (~1 h/kg)</td><td>Bolsa estanca; cambia el agua cada 30 min</td></tr>
                  <tr><td>Microondas</td><td>Inmediato</td><td>Cocina justo después</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Reglas de oro</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Jamás a temperatura ambiente.</strong> Ni en la encimera ni en agua caliente.</li>
                <li><strong>Agua fría y microondas: cocina ya.</strong> Parte del alimento puede haber salido del frío seguro.</li>
                <li><strong>Recongelar solo si cocinas.</strong> Lo descongelado en nevera y cocinado sí se puede volver a congelar.</li>
                <li><strong>Recoge el goteo.</strong> Pon un recipiente debajo para que no contamine otros alimentos.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('descongelacion-segura')} />
      <ShareCard appName="descongelacion-segura" />
      <Footer appName="descongelacion-segura" />
    </div>
  );
}
