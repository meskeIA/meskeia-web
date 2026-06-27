'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './GuiaCard.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { CHILES, ETIQUETA_NIVEL, type NivelPicante } from '@/lib/guias/chiles';
import { formatNumber } from '@/lib/formatters';

const NIVELES: NivelPicante[] = ['suave', 'medio', 'picante', 'muy-picante', 'extremo'];
const BADGE_NIVEL: Record<NivelPicante, string> = {
  suave: styles.badgeSuave, medio: styles.badgeMedio, picante: styles.badgePicante,
  'muy-picante': styles.badgeMuy, extremo: styles.badgeExtremo,
};

export default function GuiaChilesPage() {
  const [filtro, setFiltro] = useState<NivelPicante | null>(null);
  const lista = useMemo(
    () => (filtro ? CHILES.filter((c) => c.nivel === filtro) : CHILES),
    [filtro],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Guía de chiles y pimientos</h1>
        <p className={styles.subtitle}>Del pimiento dulce al Carolina Reaper: el picor en la escala Scoville, el origen y los usos de cada chile</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <div className={styles.filtroBar}>
          <p className={styles.filtroLabel}>Filtrar por nivel de picante</p>
          <div className={styles.filtroBtns} role="group" aria-label="Nivel de picante">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todos</button>
            {NIVELES.map((n) => (
              <button key={n} type="button" aria-pressed={filtro === n}
                className={`${styles.filtroBtn} ${filtro === n ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltro(n)}>{ETIQUETA_NIVEL[n]}</button>
            ))}
          </div>
        </div>

        <section className={styles.grid} aria-live="polite">
          {lista.map((c) => (
            <article key={c.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{c.emoji}</span>
                <h2 className={styles.cardNombre}>{c.nombre}</h2>
              </div>
              <div className={styles.cardBadges}>
                <span className={`${styles.badge} ${BADGE_NIVEL[c.nivel]}`}>{ETIQUETA_NIVEL[c.nivel]}</span>
                <span className={styles.badge}>
                  {c.shuMax === 0 ? '0 SHU' : `${formatNumber(c.shuMin, 0)}–${formatNumber(c.shuMax, 0)} SHU`}
                </span>
              </div>
              <p className={styles.datoRow}><strong>Origen:</strong> {c.origen}</p>
              <p className={styles.cardUso}>{c.uso}</p>
            </article>
          ))}
        </section>
        <p className={styles.fuenteNota}>Valores Scoville (SHU) orientativos: varían mucho según la variedad, el cultivo y la madurez.</p>

        <EducationalSection title="Entender el picante" subtitle="Qué mide la escala Scoville y cómo manejar los chiles">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El picor tiene su medida</h2>
              <p>
                El picante no es un sabor, sino una sensación de calor que provoca la capsaicina, una
                sustancia concentrada sobre todo en las venas y semillas del chile. La escala Scoville
                pone número a esa intensidad: del 0 de un pimiento al más de un millón de los chiles
                extremos. Pero el chile no es solo picor: cada variedad aporta un sabor propio
                —afrutado, ahumado, terroso—, y por eso en cocinas como la mexicana se eligen tanto
                por su gusto como por su fuego. Retirar venas y semillas es la forma más fácil de
                rebajar el picante sin perder el sabor.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Niveles de picor, de un vistazo</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Nivel</th><th scope="col">Scoville</th><th scope="col">Ejemplo</th></tr></thead>
                <tbody>
                  <tr><td>Suave</td><td>0–2.500</td><td>Pimiento, poblano</td></tr>
                  <tr><td>Medio</td><td>2.500–10.000</td><td>Jalapeño, guajillo</td></tr>
                  <tr><td>Picante</td><td>10.000–30.000</td><td>Serrano, chile de árbol</td></tr>
                  <tr><td>Muy picante</td><td>30.000–100.000</td><td>Cayena</td></tr>
                  <tr><td>Extremo</td><td>+100.000</td><td>Habanero, Carolina Reaper</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Manejar chiles con cabeza</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Guantes con los muy picantes.</strong> La capsaicina se queda en las manos y arde en ojos y piel.</li>
                <li><strong>El agua no calma.</strong> Para el ardor, mejor lácteos, algo graso o pan; el agua lo extiende.</li>
                <li><strong>Empieza con poco.</strong> Siempre puedes añadir más picante, pero no quitarlo del plato.</li>
                <li><strong>Venas y semillas.</strong> Ahí está la mayor parte del picor; retíralas para suavizar.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-chiles')} />
      <ShareCard appName="guia-chiles" />
      <Footer appName="guia-chiles" />
    </div>
  );
}
