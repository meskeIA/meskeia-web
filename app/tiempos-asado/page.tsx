'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './TiemposAsado.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { TIPOS_ASADO, calcularAsado, formatearMin } from '@/lib/calculadoras/tiemposAsado';

export default function TiemposAsadoPage() {
  const [tipoId, setTipoId] = useState('pollo');
  const [peso, setPeso] = useState('1.5');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularAsado(tipoId, num(peso)), [tipoId, peso]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Tiempos de asado al horno</h1>
        <p className={styles.subtitle}>Cuánto asar cada carne según el peso, con la temperatura del horno y la interna objetivo</p>
      </header>
      <LegalNotice />
      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>¿Qué vas a asar?</p>
          <div className={styles.tipoBtns} role="group" aria-label="Tipo de carne">
            {TIPOS_ASADO.map((t) => (
              <button key={t.id} type="button" aria-pressed={tipoId === t.id}
                className={`${styles.tipoBtn} ${tipoId === t.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setTipoId(t.id)}>
                <span className={styles.tipoBtnNombre}><span aria-hidden="true">{t.emoji}</span> {t.nombre}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="peso" className={styles.label}>Peso de la pieza (kg)</label>
            <input id="peso" type="text" inputMode="decimal" className={styles.input}
              value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>

          {resultado ? (
            <>
              <div className={styles.resultadoBig} role="status" aria-live="polite">
                <span className={styles.resBigValor}>{formatearMin(resultado.tiempoMin)}</span>
                <span className={styles.resBigTexto}>
                  a {resultado.tempHornoC} °C · interior a {resultado.tempInternaC} °C · reposo {resultado.reposoMin} min
                </span>
              </div>
              <p className={styles.notaBox}>{resultado.nota}</p>
            </>
          ) : (
            <p className={styles.placeholder}>Introduce el peso de la pieza.</p>
          )}
          <p className={styles.fuenteNota}>
            Tiempos orientativos. Confirma siempre la cocción con la{' '}
            <Link href="/temperatura-coccion-carne/" className={styles.celTemp}>temperatura interna segura</Link>: el reloj no basta.
          </p>
        </section>

        <EducationalSection title="Clavar el asado" subtitle="Por qué manda el peso y cómo asegurar el punto">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El peso marca el tiempo; el termómetro, el punto</h2>
              <p>
                El tiempo que tarda un asado depende sobre todo del peso de la pieza, por eso se
                calcula en minutos por kilo más un tiempo base. Pero ese cálculo es solo una guía
                para planificar (saber a qué hora meter el pavo de Navidad): la forma de la pieza, el
                horno y la temperatura de partida cambian el resultado. La única manera segura de
                saber que la carne está en su punto —y, en aves y cerdo, que es segura— es medir la
                temperatura interna con un termómetro en la parte más gruesa.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Referencias por pieza</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Pieza</th><th scope="col">Min/kg</th><th scope="col">Horno</th><th scope="col">Interior</th></tr></thead>
                <tbody>
                  <tr><td>Pollo entero</td><td>45</td><td>190 °C</td><td>74 °C</td></tr>
                  <tr><td>Pavo</td><td>40</td><td>180 °C</td><td>74 °C</td></tr>
                  <tr><td>Cordero (al punto)</td><td>30</td><td>190 °C</td><td>63 °C</td></tr>
                  <tr><td>Cerdo</td><td>40</td><td>180 °C</td><td>71 °C</td></tr>
                  <tr><td>Ternera (al punto)</td><td>25</td><td>200 °C</td><td>57 °C</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para que salga perfecto y seguro</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Mide la temperatura interna.</strong> Es lo único que garantiza el punto y la seguridad; el tiempo es orientativo.</li>
                <li><strong>Saca la carne de la nevera antes.</strong> Atemperar 30-60 min ayuda a un asado más uniforme.</li>
                <li><strong>No abras el horno a cada rato.</strong> Cada apertura baja la temperatura y alarga el tiempo.</li>
                <li><strong>Reposa antes de cortar.</strong> 15-20 min en piezas grandes: más jugosa y mejor cortada.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('tiempos-asado')} />
      <ShareCard appName="tiempos-asado" />
      <Footer appName="tiempos-asado" />
    </div>
  );
}
