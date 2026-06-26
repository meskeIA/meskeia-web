'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraCremaPastelera.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { TIPOS_CREMA, TIPO_CREMA_POR_ID, calcularCrema } from '@/lib/calculadoras/cremaPastelera';

export default function CalculadoraCremaPasteleraPage() {
  const [tipoId, setTipoId] = useState('pastelera');
  const [leche, setLeche] = useState('500');

  const tipo = TIPO_CREMA_POR_ID[tipoId];
  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularCrema(tipoId, num(leche)), [tipoId, leche]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de crema pastelera</h1>
        <p className={styles.subtitle}>Yemas, azúcar y maicena según la leche que uses, para crema pastelera o inglesa</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Tipo de crema</p>
          <div className={styles.tipoBtns} role="group" aria-label="Tipo de crema">
            {TIPOS_CREMA.map((t) => (
              <button key={t.id} type="button" aria-pressed={tipoId === t.id}
                className={`${styles.tipoBtn} ${tipoId === t.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setTipoId(t.id)}>
                <span className={styles.tipoBtnNombre}>{t.nombre}</span>
                <span className={styles.tipoBtnNota}>{t.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="leche" className={styles.label}>Leche (ml)</label>
            <input id="leche" type="text" inputMode="numeric" className={styles.input}
              value={leche} onChange={(e) => setLeche(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.ingredientesBox} role="status" aria-live="polite">
              {resultado.ingredientes.map((ing) => (
                <div key={ing.nombre} className={styles.ingRow}>
                  <span className={styles.ingNombre}>{ing.nombre}</span>
                  <span className={styles.ingCantidad}>{ing.cantidad}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce los mililitros de leche.</p>
          )}
        </section>

        <EducationalSection title="La crema, en su punto" subtitle="Pastelera o inglesa, y cómo que salga sedosa">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Yemas, azúcar y (a veces) almidón</h2>
              <p>
                Las cremas de pastelería parten de la misma idea: leche infusionada, yemas y azúcar
                que se cuajan con el calor. La diferencia está en el espesante. La crema pastelera
                añade almidón (maicena), que la vuelve firme y segura de cocer, perfecta para
                rellenar. La crema inglesa prescinde del almidón y se cuaja solo con las yemas,
                quedando como una salsa fina pero más delicada, porque si pasa de 85 °C se corta.
                Saber la proporción correcta es lo que separa una crema sedosa de una con grumos o
                demasiado líquida.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Proporciones por litro de leche</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Crema</th><th scope="col">Yemas</th><th scope="col">Azúcar</th><th scope="col">Maicena</th></tr></thead>
                <tbody>
                  <tr><td>Pastelera</td><td>8</td><td>250 g</td><td>90 g</td></tr>
                  <tr><td>Pastelera ligera</td><td>6</td><td>200 g</td><td>70 g</td></tr>
                  <tr><td>Inglesa</td><td>9</td><td>200 g</td><td>—</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para que salga perfecta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Templa las yemas.</strong> Añade un poco de leche caliente a la mezcla de yemas antes de juntar todo, para que no cuajen de golpe.</li>
                <li><strong>Remueve sin parar.</strong> La pastelera, hasta que espese y hierva un minuto; la inglesa, sin que pase de 85 °C.</li>
                <li><strong>Film a piel.</strong> Cubre la superficie con film tocándola para que no forme costra al enfriar.</li>
                <li><strong>Consúmela pronto.</strong> Lleva huevo y leche: 2-3 días en nevera, bien tapada.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-crema-pastelera')} />
      <ShareCard appName="calculadora-crema-pastelera" />
      <Footer appName="calculadora-crema-pastelera" />
    </div>
  );
}
