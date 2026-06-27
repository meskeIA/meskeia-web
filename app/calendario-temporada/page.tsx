'use client';
// @disclaimer: exempt

import { useEffect, useState } from 'react';
import styles from './CalendarioTemporada.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { MESES_TEMPORADA, MES_TEMPORADA_POR_ID } from '@/lib/calculadoras/calendarioTemporada';

export default function CalendarioTemporadaPage() {
  // Empieza en enero en SSR y pasa al mes actual tras montar (evita mismatch).
  const [mesId, setMesId] = useState(1);
  useEffect(() => { setMesId(new Date().getMonth() + 1); }, []);

  const mes = MES_TEMPORADA_POR_ID[mesId];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Frutas y verduras de temporada</h1>
        <p className={styles.subtitle}>Qué está en su mejor momento cada mes del año (hemisferio norte)</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Mes">
          <p className={styles.bloqueLabel}>Elige el mes</p>
          <div className={styles.chipGrid} role="group" aria-label="Mes">
            {MESES_TEMPORADA.map((m) => (
              <button key={m.id} type="button" aria-pressed={mesId === m.id}
                className={`${styles.chip} ${mesId === m.id ? styles.chipActivo : ''}`}
                onClick={() => setMesId(m.id)}>{m.nombre}</button>
            ))}
          </div>

          <div className={styles.maridajeGrid} aria-live="polite">
            <div className={styles.maridajeCard}>
              <span className={styles.maridajeIcon} aria-hidden="true">🍑</span>
              <span className={styles.maridajeTipo}>Frutas de {mes.nombre.toLowerCase()}</span>
              <ul className={styles.listaTemporada}>
                {mes.frutas.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
            <div className={styles.maridajeCard}>
              <span className={styles.maridajeIcon} aria-hidden="true">🥦</span>
              <span className={styles.maridajeTipo}>Verduras de {mes.nombre.toLowerCase()}</span>
              <ul className={styles.listaTemporada}>
                {mes.verduras.map((v) => <li key={v}>{v}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <EducationalSection title="Comer de temporada" subtitle="Por qué importa y cómo aprovecharlo">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Lo de temporada, mejor en todo</h2>
              <p>
                Comprar fruta y verdura de temporada no es solo una moda: es la forma más sensata de
                comer bien. Un producto recogido en su momento tiene más sabor y más nutrientes que
                uno forzado fuera de temporada, suele costar menos porque hay abundancia, y deja una
                huella ambiental mucho menor al no necesitar invernaderos intensivos ni viajes
                larguísimos. Además, seguir el calendario da variedad: cada mes trae algo nuevo, lo
                que hace la cocina más rica y evita la monotonía de comer siempre lo mismo.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>A grandes rasgos</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Estación</th><th scope="col">Protagonistas</th></tr></thead>
                <tbody>
                  <tr><td>Primavera</td><td>Fresa, cereza, espárrago, guisante, habas</td></tr>
                  <tr><td>Verano</td><td>Melocotón, sandía, melón, tomate, pimiento</td></tr>
                  <tr><td>Otoño</td><td>Uva, granada, caqui, calabaza, setas</td></tr>
                  <tr><td>Invierno</td><td>Cítricos, kiwi, brócoli, coliflor, alcachofa</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">💡</span><strong>Cómo aprovecharlo</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Es orientativo.</strong> El clima y la zona adelantan o retrasan cada producto.</li>
                <li><strong>Hemisferio sur, al revés.</strong> En Sudamérica las estaciones van invertidas.</li>
                <li><strong>Aprovecha los excedentes.</strong> Lo barato de temporada se puede congelar o hacer conserva.</li>
                <li><strong>Compra local.</strong> Lo de cerca y de temporada es lo más fresco y sostenible.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calendario-temporada')} />
      <ShareCard appName="calendario-temporada" />
      <Footer appName="calendario-temporada" />
    </div>
  );
}
