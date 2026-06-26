'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './HuevoPerfecto.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { PUNTOS_HUEVO, TAMANOS_HUEVO, calcularHuevo } from '@/lib/calculadoras/huevoPerfecto';
import { formatNumber } from '@/lib/formatters';

export default function HuevoPerfectoPage() {
  const [puntoId, setPuntoId] = useState('mollet');
  const [tamanoId, setTamanoId] = useState('m');
  const [desdeNevera, setDesdeNevera] = useState(true);

  const resultado = useMemo(() => calcularHuevo(puntoId, tamanoId, desdeNevera), [puntoId, tamanoId, desdeNevera]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>El huevo perfecto</h1>
        <p className={styles.subtitle}>El tiempo exacto para el huevo en su punto, según el tamaño y si está frío</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>¿Cómo lo quieres?</p>
          <div className={styles.tipoBtns} role="group" aria-label="Punto del huevo">
            {PUNTOS_HUEVO.map((p) => (
              <button key={p.id} type="button" aria-pressed={puntoId === p.id}
                className={`${styles.tipoBtn} ${puntoId === p.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setPuntoId(p.id)}>
                <span className={styles.tipoBtnNombre}>{p.nombre}</span>
                <span className={styles.tipoBtnNota}>{p.descripcion}</span>
              </button>
            ))}
          </div>

          <p className={styles.bloqueLabel}>Tamaño del huevo</p>
          <div className={styles.chipGrid} role="group" aria-label="Tamaño del huevo">
            {TAMANOS_HUEVO.map((t) => (
              <button key={t.id} type="button" aria-pressed={tamanoId === t.id}
                className={`${styles.chip} ${tamanoId === t.id ? styles.chipActivo : ''}`}
                onClick={() => setTamanoId(t.id)}>{t.nombre}</button>
            ))}
          </div>

          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={desdeNevera} onChange={(e) => setDesdeNevera(e.target.checked)} />
            El huevo sale de la nevera (frío)
          </label>

          {resultado ? (
            <div className={styles.resultadoBig} role="status" aria-live="polite">
              <span className={styles.resBigValor}>{formatNumber(resultado.tiempoMin, resultado.tiempoMin % 1 === 0 ? 0 : 1)} min</span>
              <span className={styles.resBigTexto}>desde que el agua hierve · {resultado.descripcion}</span>
            </div>
          ) : (
            <p className={styles.placeholder}>Elige el punto del huevo.</p>
          )}
        </section>

        <EducationalSection title="Clavar el huevo cocido" subtitle="De qué depende el punto y los trucos para que salga y pele bien">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Cuestión de minutos</h2>
              <p>
                La diferencia entre un huevo pasado por agua, uno mollet y uno duro son apenas unos
                minutos de cocción contados desde que el agua hierve. Influyen también el tamaño del
                huevo (uno XL tarda algo más que uno S) y su temperatura de partida: uno recién
                sacado de la nevera necesita cerca de un minuto más que uno a temperatura ambiente.
                Por eso, para acertar el punto cada vez, conviene cronometrar y ajustar a esas dos
                variables, en lugar de ir a ojo.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Los puntos del huevo</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Punto</th><th scope="col">Tiempo (M, ambiente)</th><th scope="col">Cómo queda</th></tr></thead>
                <tbody>
                  <tr><td>Pasado por agua</td><td>3–4 min</td><td>Clara apenas cuajada, yema líquida</td></tr>
                  <tr><td>Mollet</td><td>6 min</td><td>Clara firme, yema cremosa</td></tr>
                  <tr><td>Yema tierna</td><td>8 min</td><td>Yema cuajada pero jugosa</td></tr>
                  <tr><td>Duro</td><td>11 min</td><td>Yema firme</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Trucos para que salga perfecto</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Cuenta desde el hervor.</strong> No desde que enciendes el fuego; arranca el cronómetro cuando el agua hierva.</li>
                <li><strong>Hervor suave.</strong> Un borboteo fuerte golpea los huevos y los rompe.</li>
                <li><strong>Choque de frío.</strong> Pásalos a agua con hielo al sacarlos: cortan la cocción y pelan mejor.</li>
                <li><strong>Para pelar fácil,</strong> usa huevos no demasiado frescos y pélalos bajo el grifo.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('huevo-perfecto')} />
      <ShareCard appName="huevo-perfecto" />
      <Footer appName="huevo-perfecto" />
    </div>
  );
}
