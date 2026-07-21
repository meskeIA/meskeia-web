'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './GlosarioTecnicas.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { TECNICAS, ETIQUETA_GRUPO, type Grupo } from '@/lib/guias/tecnicas-cocina';

const GRUPOS: Grupo[] = ['liquido', 'grasa', 'previa', 'acabado'];
const BADGE_GRUPO: Record<Grupo, string> = {
  liquido: styles.badgeLiquido,
  grasa: styles.badgeGrasa,
  previa: styles.badgePrevia,
  acabado: styles.badgeAcabado,
};

// Normaliza a minúsculas y sin acentos para buscar sin sensibilidad a tildes
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function GlosarioTecnicasCocinaPage() {
  const [filtro, setFiltro] = useState<Grupo | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const q = norm(busqueda.trim());
    return TECNICAS
      .filter((t) => (filtro ? t.grupo === filtro : true))
      .filter((t) => (q === '' ? true : norm(t.nombre).includes(q) || norm(t.definicion).includes(q)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }, [filtro, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Glosario de técnicas de cocina</h1>
        <p className={styles.subtitle}>Qué significan de verdad los verbos de las recetas: blanquear, pochar, bresar, confitar, desglasar y muchos más</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <div className={styles.filtroBar}>
          <p className={styles.filtroLabel}>Filtrar por tipo de técnica</p>
          <div className={styles.filtroBtns} role="group" aria-label="Tipo de técnica">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todas</button>
            {GRUPOS.map((g) => (
              <button key={g} type="button" aria-pressed={filtro === g}
                className={`${styles.filtroBtn} ${filtro === g ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltro(g)}>{ETIQUETA_GRUPO[g]}</button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <input
              type="search"
              className={styles.searchInput}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar técnica (blanquear, confitar, desglasar…)"
              aria-label="Buscar técnica"
            />
          </div>
        </div>

        <section className={styles.grid} aria-live="polite">
          {lista.map((t) => (
            <article key={t.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardNombre}>{t.nombre}</h2>
              </div>
              <div className={styles.cardBadges}>
                <span className={`${styles.badge} ${BADGE_GRUPO[t.grupo]}`}>{ETIQUETA_GRUPO[t.grupo]}</span>
              </div>
              <p className={styles.definicion}>{t.definicion}</p>
              <p className={styles.ejemplo}><strong>Ejemplo:</strong> {t.ejemplo}</p>
            </article>
          ))}
        </section>
        {lista.length === 0 && (
          <p className={styles.sinResultados}>No se ha encontrado ninguna técnica con esa búsqueda.</p>
        )}
        <p className={styles.fuenteNota}>Terminología culinaria de uso común; algunas técnicas se llaman distinto según la región.</p>

        <EducationalSection title="Entender las técnicas" subtitle="Calor húmedo o seco, la reacción de Maillard y errores frecuentes">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Calor húmedo y calor seco</h2>
              <p>
                El calor húmedo —agua, caldo o vapor— es suave, cuece de forma uniforme y mantiene el
                alimento jugoso, pero no dora: por más que hierva, la superficie no se tuesta. El calor
                seco —horno, sartén, parrilla o grasa caliente— alcanza temperaturas más altas, dora la
                superficie y crea aroma y sabor. Por eso muchos platos combinan los dos: primero se sella
                o se dora la pieza a fuego fuerte y después se termina de cocer despacio con líquido, como
                en un guiso o un braseado.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>La reacción de Maillard</h2>
              <p>
                Por encima de unos 140 °C, los azúcares y las proteínas del alimento reaccionan entre sí y
                producen el color dorado y el aroma tostado que asociamos a lo apetecible: la corteza del
                pan, la piel del pollo asado o la costra de una carne sellada. Es la reacción de Maillard, y
                explica por qué una carne dorada sabe mucho más que una hervida. En la cocción con agua no
                llega a producirse, porque el agua no pasa de 100 °C y no se alcanza la temperatura necesaria.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Los cuatro grupos, de un vistazo</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Grupo</th><th scope="col">Qué hace</th><th scope="col">Ejemplos</th></tr></thead>
                <tbody>
                  <tr><td>En líquido o vapor</td><td>Cuece con agua, caldo o vapor; suave y sin dorar</td><td>Hervir, escalfar, cocer al vapor, guisar</td></tr>
                  <tr><td>Con grasa o calor seco</td><td>Dora y crea sabor con grasa o calor alto</td><td>Freír, saltear, confitar, asar</td></tr>
                  <tr><td>Preparación previa</td><td>Prepara el alimento antes de cocinarlo</td><td>Marinar, empanar, bridar, tamizar</td></tr>
                  <tr><td>Ligar y acabar</td><td>Da cuerpo, textura o brillo al plato</td><td>Emulsionar, napar, desglasar, glasear</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Errores frecuentes</strong></div>
              <ul className={styles.warningList}>
                <li><strong>No sobrecargues la sartén al saltear.</strong> Demasiado alimento baja la temperatura y se cuece en su jugo en vez de dorarse.</li>
                <li><strong>Seca bien antes de sellar.</strong> La humedad de la superficie impide que se forme la costra: el alimento se cuece en lugar de dorar.</li>
                <li><strong>El aceite muy caliente humea.</strong> Cuando echa humo, se degrada; conviene conocer los puntos de humo de cada grasa.</li>
                <li><strong>Blanquear no es escaldar.</strong> Blanquear es hervir y cortar en agua con hielo; escaldar es sumergir solo unos segundos.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('glosario-tecnicas-cocina')} />
      <ShareCard appName="glosario-tecnicas-cocina" />
      <Footer appName="glosario-tecnicas-cocina" />
    </div>
  );
}
