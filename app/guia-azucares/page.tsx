'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './GuiaCard.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { AZUCARES, ETIQUETA_TIPO_AZUCAR, type TipoAzucar } from '@/lib/guias/azucares';

const TIPOS: TipoAzucar[] = ['azucar', 'natural', 'edulcorante'];

export default function GuiaAzucaresPage() {
  const [filtro, setFiltro] = useState<TipoAzucar | null>(null);
  const lista = useMemo(() => (filtro ? AZUCARES.filter((a) => a.tipo === filtro) : AZUCARES), [filtro]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Guía de azúcares y endulzantes</h1>
        <p className={styles.subtitle}>Más allá del azúcar blanco: tipos de endulzante, su poder dulce y sus usos</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <div className={styles.filtroBar}>
          <p className={styles.filtroLabel}>Filtrar por tipo</p>
          <div className={styles.filtroBtns} role="group" aria-label="Tipo de endulzante">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todos</button>
            {TIPOS.map((t) => (
              <button key={t} type="button" aria-pressed={filtro === t}
                className={`${styles.filtroBtn} ${filtro === t ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltro(t)}>{ETIQUETA_TIPO_AZUCAR[t]}</button>
            ))}
          </div>
        </div>

        <section className={styles.grid} aria-live="polite">
          {lista.map((a) => (
            <article key={a.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{a.emoji}</span>
                <h2 className={styles.cardNombre}>{a.nombre}</h2>
              </div>
              <div className={styles.cardBadges}>
                <span className={`${styles.badge} ${styles.badgeSec}`}>{ETIQUETA_TIPO_AZUCAR[a.tipo]}</span>
                <span className={styles.badge}>{a.poder}</span>
              </div>
              <p className={styles.cardUso}><strong>Uso:</strong> {a.uso}</p>
              <p className={styles.cardNota}>{a.nota}</p>
            </article>
          ))}
        </section>

        <EducationalSection title="Endulzar con criterio" subtitle="Qué aporta cada azúcar y cómo sustituir uno por otro">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El azúcar hace más que endulzar</h2>
              <p>
                En repostería, el azúcar no solo aporta dulzor: también da humedad, estructura,
                volumen y ese dorado dorado de los bizcochos. Por eso sustituirlo no es tan sencillo
                como cambiar una cantidad por otra. Los endulzantes líquidos como la miel o los
                siropes aportan agua y endulzan más, así que obligan a reajustar la receta; los
                edulcorantes intensos endulzan muchísimo pero no dan cuerpo. Conocer el poder
                endulzante de cada uno y lo que aporta a la masa es la clave para reducir azúcar o
                cambiar de endulzante sin estropear el resultado.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Tres familias</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Familia</th><th scope="col">Ejemplos</th></tr></thead>
                <tbody>
                  <tr><td>Azúcares</td><td>Blanco, moreno, glas, panela, invertido</td></tr>
                  <tr><td>Endulzantes naturales</td><td>Miel, arce, agave, melaza</td></tr>
                  <tr><td>Edulcorantes</td><td>Eritritol, estevia, sucralosa</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Al sustituir endulzantes</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Líquidos: ajusta el resto.</strong> Miel y siropes aportan agua; reduce líquidos y baja el horno.</li>
                <li><strong>Ojo al poder dulce.</strong> La estevia endulza cientos de veces más; basta una pizca.</li>
                <li><strong>Edulcorantes no dan cuerpo.</strong> No caramelizan ni doran igual; la textura cambia.</li>
                <li><strong>Con moderación.</strong> Sea cual sea, conviene moderar el consumo total de azúcares.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-azucares')} />
      <ShareCard appName="guia-azucares" />
      <Footer appName="guia-azucares" />
    </div>
  );
}
