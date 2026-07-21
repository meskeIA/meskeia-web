'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './PuntosHumo.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { ACEITES, ETIQUETA_BANDA, type Banda } from '@/lib/guias/puntos-humo';

const BANDAS: Banda[] = ['crudo', 'media', 'alta'];
const BADGE_BANDA: Record<Banda, string> = {
  crudo: styles.badgeCrudo, media: styles.badgeMedia, alta: styles.badgeAlta,
};

// Normaliza texto para búsqueda: minúsculas y sin acentos
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function PuntosHumoAceitesPage() {
  const [filtro, setFiltro] = useState<Banda | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const q = norm(busqueda.trim());
    return ACEITES
      .filter((a) => (filtro ? a.banda === filtro : true))
      .filter((a) => (q ? norm(a.nombre).includes(q) : true))
      .slice()
      .sort((x, y) => y.puntoC - x.puntoC);
  }, [filtro, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Puntos de humo de los aceites</h1>
        <p className={styles.subtitle}>Qué aceite aguanta cada temperatura: del aliño en crudo a la fritura, con el punto de humo de cada grasa</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <div className={styles.filtroBar}>
          <p className={styles.filtroLabel}>Filtrar por uso según el calor</p>
          <div className={styles.filtroBtns} role="group" aria-label="Uso según el calor">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todos</button>
            {BANDAS.map((b) => (
              <button key={b} type="button" aria-pressed={filtro === b}
                className={`${styles.filtroBtn} ${filtro === b ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltro(b)}>{ETIQUETA_BANDA[b]}</button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <input
              type="search"
              className={styles.searchInput}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar aceite o grasa…"
              aria-label="Buscar aceite o grasa"
            />
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
                <span className={styles.badge}>{a.puntoC} °C</span>
                <span className={`${styles.badge} ${BADGE_BANDA[a.banda]}`}>{ETIQUETA_BANDA[a.banda]}</span>
                {a.refinado !== '—' && (
                  <span className={`${styles.badge} ${styles.badgeSec}`}>{a.refinado}</span>
                )}
              </div>
              <p className={styles.cardUso}>{a.uso}</p>
            </article>
          ))}
        </section>

        {lista.length === 0 && (
          <p className={styles.sinResultados}>No hay aceites que coincidan con tu búsqueda.</p>
        )}

        <p className={styles.fuenteNota}>El punto de humo es orientativo: varía según el refinado, la calidad y la antigüedad del aceite. Un mismo aceite refinado aguanta bastante más que sin refinar.</p>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Buenas prácticas al freír</strong></div>
          <ul className={styles.warningList}>
            <li><strong>No pases del punto de humo.</strong> La grasa se degrada y libera acroleína, ese humo azulado que irrita ojos y garganta.</li>
            <li><strong>Reutiliza con cabeza.</strong> No uses el mismo aceite de fritura muchas veces; se oxida con cada uso.</li>
            <li><strong>Descártalo a tiempo.</strong> Si humea antes de tiempo, huele a rancio o está muy oscuro, tíralo.</li>
            <li><strong>Nunca por el fregadero.</strong> El aceite usado no va por el desagüe; llévalo a un punto de reciclaje.</li>
          </ul>
        </div>

        <EducationalSection title="Entender el punto de humo" subtitle="Qué temperatura aguanta cada grasa y por qué el refinado manda">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Qué es el punto de humo</h2>
              <p>
                El punto de humo es la temperatura a la que una grasa empieza a humear y degradarse.
                Por encima de ese umbral, el aceite cambia de sabor (se vuelve amargo), pierde parte
                de sus propiedades y empieza a generar compuestos indeseables. Ese hilillo de humo que
                sube de la sartén es la señal de que te has pasado de temperatura: conviene retirar el
                aceite del fuego antes de llegar ahí, no después.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>El refinado importa más que el tipo</h2>
              <p>
                Un mismo aceite refinado aguanta mucho más calor que sin refinar, porque el refinado
                elimina las impurezas y compuestos que se queman antes. Por eso el mito de «no freír
                con oliva» es matizable: el aceite de oliva suave o refinado va perfecto para fritura,
                y hasta el virgen extra (AOVE) aguanta plancha y fritura moderada, aunque pierda parte
                de sus matices. Lo que nunca debe calentarse son los aceites delicados sin refinar,
                como el de lino o el de nuez.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Qué aceite para cada cosa</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Para qué</th><th scope="col">Punto de humo</th><th scope="col">Ejemplos</th></tr></thead>
                <tbody>
                  <tr><td>Aliñar en crudo</td><td>≤150 °C</td><td>Lino, nuez, sésamo tostado</td></tr>
                  <tr><td>Saltear y plancha</td><td>~175–200 °C</td><td>Mantequilla, coco, AOVE</td></tr>
                  <tr><td>Freír y wok</td><td>≥210 °C</td><td>Girasol, cacahuete, ghee, aguacate</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('puntos-humo-aceites')} />
      <ShareCard appName="puntos-humo-aceites" />
      <Footer appName="puntos-humo-aceites" />
    </div>
  );
}
