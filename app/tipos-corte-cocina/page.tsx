'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './TiposCorte.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { CORTES, ETIQUETA_FORMA, type FormaCorte } from '@/lib/guias/cortes-cocina';

const FORMAS: FormaCorte[] = ['dados', 'tiras', 'laminas', 'otros'];
const BADGE_FORMA: Record<FormaCorte, string> = {
  dados: styles.badgeDados, tiras: styles.badgeTiras, laminas: styles.badgeLaminas, otros: styles.badgeOtros,
};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function TiposCorteCocinaPage() {
  const [filtro, setFiltro] = useState<FormaCorte | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const q = norm(busqueda.trim());
    return CORTES.filter((c) => {
      const coincideForma = filtro ? c.forma === filtro : true;
      const coincideTexto = q ? norm(c.nombre).includes(q) || norm(c.uso).includes(q) : true;
      return coincideForma && coincideTexto;
    });
  }, [filtro, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Tipos de corte en cocina</h1>
        <p className={styles.subtitle}>Brunoise, juliana, mirepoix, bastón, chiffonade… qué mide cada corte y para qué plato se usa</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <div className={styles.searchWrap}>
          <input
            type="search"
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar corte (brunoise, juliana, tomate…)"
            aria-label="Buscar corte"
          />
        </div>

        <div className={styles.filtroBar}>
          <p className={styles.filtroLabel}>Filtrar por forma</p>
          <div className={styles.filtroBtns} role="group" aria-label="Forma del corte">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todos</button>
            {FORMAS.map((f) => (
              <button key={f} type="button" aria-pressed={filtro === f}
                className={`${styles.filtroBtn} ${filtro === f ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltro(f)}>{ETIQUETA_FORMA[f]}</button>
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
                <span className={`${styles.badge} ${styles.badgeDim}`}>{c.dimension}</span>
                <span className={`${styles.badge} ${BADGE_FORMA[c.forma]}`}>{ETIQUETA_FORMA[c.forma]}</span>
              </div>
              <p className={styles.cardUso}>{c.uso}</p>
            </article>
          ))}
        </section>
        {lista.length === 0 && (
          <p className={styles.sinResultados}>No hay cortes que coincidan con tu búsqueda.</p>
        )}
        <p className={styles.fuenteNota}>Dimensiones orientativas de la cocina clásica; el nombre y el tamaño exacto pueden variar entre escuelas y regiones.</p>

        <EducationalSection title="Por qué importa el corte" subtitle="El tamaño de cada pieza decide cómo y cuándo se cocina">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El tamaño manda en la cocción</h2>
              <p>
                Piezas del mismo tamaño se cocinan por igual: cuando todo mide lo mismo, todo llega a
                su punto a la vez, sin trozos crudos junto a otros deshechos. Por eso un buen corte no
                es una cuestión de estética, sino de que el plato entero esté en su punto en el mismo
                momento. Y hay una regla sencilla detrás: cuanto más fino es el corte, antes se cocina;
                cuanto más grande, más tiempo aguanta al fuego sin deshacerse.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Cada corte para su plato</h2>
              <p>
                Los cortes finos, como el brunoise o la juliana, están pensados para cocciones rápidas
                y sofritos, donde interesa que la verdura se haga en seguida y casi desaparezca en la
                salsa. Los cortes grandes, como el cubo o el parmentier, son para guisos largos, que
                necesitan piezas que resistan horas de cocción. Y el mirepoix, ese corte irregular de
                verdura, no se busca comerlo: da sabor al caldo y luego se retira o se tritura.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Familias de corte, de un vistazo</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Familia</th><th scope="col">Ejemplos</th><th scope="col">Para qué</th></tr></thead>
                <tbody>
                  <tr><td>Dados</td><td>Brunoise, macedonia, parmentier</td><td>Sofritos y guisos</td></tr>
                  <tr><td>Tiras</td><td>Juliana, bastón, chiffonade</td><td>Salteados y frituras</td></tr>
                  <tr><td>Láminas</td><td>Rodaja, paisana, emincé</td><td>Sopas y guarniciones</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">🔪</span><strong>Cortar con seguridad</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Cuchillo bien afilado.</strong> Uno romo resbala y obliga a apretar; es más peligroso que uno afilado.</li>
                <li><strong>La mano en garra.</strong> La mano que sujeta va con los dedos recogidos y los nudillos guiando la hoja.</li>
                <li><strong>Tabla estable.</strong> Un paño húmedo debajo evita que se deslice mientras cortas.</li>
                <li><strong>Base plana primero.</strong> Corta un lado plano para que el alimento no ruede sobre la tabla.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('tipos-corte-cocina')} />
      <ShareCard appName="tipos-corte-cocina" />
      <Footer appName="tipos-corte-cocina" />
    </div>
  );
}
