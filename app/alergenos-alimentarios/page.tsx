'use client';

import { useMemo, useState } from 'react';
import styles from './Alergenos.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { ALERGENOS, ETIQUETA_GRUPO, type GrupoAlergeno } from '@/lib/guias/alergenos';

const GRUPOS: GrupoAlergeno[] = ['animal', 'vegetal', 'aditivo'];
const BADGE_GRUPO: Record<GrupoAlergeno, string> = {
  animal: styles.badgeAnimal,
  vegetal: styles.badgeVegetal,
  aditivo: styles.badgeAditivo,
};

// Normaliza a minúsculas y elimina los acentos para una búsqueda tolerante.
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function AlergenosAlimentariosPage() {
  const [filtro, setFiltro] = useState<GrupoAlergeno | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const q = norm(busqueda.trim());
    return ALERGENOS.filter((a) => {
      const coincideGrupo = filtro ? a.grupo === filtro : true;
      const coincideTexto = q
        ? norm(`${a.nombre} ${a.ejemplos} ${a.oculto}`).includes(q)
        : true;
      return coincideGrupo && coincideTexto;
    });
  }, [filtro, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Los 14 alérgenos alimentarios</h1>
        <p className={styles.subtitle}>Los alérgenos de declaración obligatoria en la UE, con ejemplos y dónde se esconden en los platos y productos</p>
      </header>
      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" collapsible={false}>
        <p>
          Esta tabla es informativa y <strong>no sustituye la lectura de la etiqueta</strong> ni el
          consejo médico. Sirve para orientarte sobre qué son los 14 alérgenos de declaración
          obligatoria y dónde suelen esconderse, pero no reemplaza en ningún caso la información
          oficial del producto.
        </p>
        <p>
          Ante una alergia o intolerancia diagnosticada hay que verificar <strong>siempre</strong> el
          etiquetado y la información del fabricante o del establecimiento, porque las trazas y la
          contaminación cruzada no siempre se declaran de la misma forma y las recetas pueden cambiar
          sin previo aviso.
        </p>
        <p>
          Ante una <strong>reacción alérgica grave</strong> (dificultad para respirar, hinchazón de
          labios o garganta, mareo), llama de inmediato al <strong>112</strong>.
        </p>
      </DisclaimerCard>

      <main className={styles.mainContent}>
        <div className={styles.filtroBar}>
          <p className={styles.filtroLabel}>Filtrar por tipo de alérgeno</p>
          <div className={styles.filtroBtns} role="group" aria-label="Tipo de alérgeno">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todos</button>
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
              aria-label="Buscar alérgeno"
              placeholder="Buscar: gluten, marisco, salsa de soja…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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
                <span className={`${styles.badge} ${BADGE_GRUPO[a.grupo]}`}>{ETIQUETA_GRUPO[a.grupo]}</span>
              </div>
              <p className={styles.cardUso}>{a.ejemplos}</p>
              <p className={styles.cardNota}>
                <span className={styles.ocultoLabel}>Dónde se esconde:</span> {a.oculto}
              </p>
            </article>
          ))}
        </section>
        {lista.length === 0 && (
          <p className={styles.sinResultados}>No hay alérgenos que coincidan con tu búsqueda.</p>
        )}
        <p className={styles.fuenteNota}>Lista de declaración obligatoria según el Reglamento (UE) nº 1169/2011 (Anexo II). Actualizado 2026.</p>

        <EducationalSection title="Entender los alérgenos" subtitle="Qué obliga la ley, qué son las trazas y la diferencia entre alergia e intolerancia">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Qué obliga la ley</h2>
              <p>
                Los 14 alérgenos de la lista deben declararse siempre y destacarse dentro de la lista
                de ingredientes, de modo que se distingan del resto: en negrita, en mayúsculas o
                subrayados. En bares y restaurantes la información sobre alérgenos también es
                obligatoria y debe estar disponible para el cliente, aunque sea de palabra o en un
                soporte aparte (una carta, una ficha o un cartel). Si te la dan de palabra, tienes
                derecho a que además exista un registro escrito que la respalde.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Trazas y contaminación cruzada</h2>
              <p>
                El aviso «puede contener trazas de…» es una advertencia <em>voluntaria</em> del
                fabricante por el riesgo de que un alérgeno acabe en el producto de forma involuntaria,
                por ejemplo porque se elabora en la misma fábrica o con la misma maquinaria que otro
                alimento que sí lo lleva. No forma parte de la receta, pero para una persona con
                alergia grave hay que tomárselo en serio: una cantidad mínima puede bastar para
                desencadenar una reacción.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Alergia frente a intolerancia</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Rasgo</th><th scope="col">Alergia</th><th scope="col">Intolerancia</th></tr></thead>
                <tbody>
                  <tr><td>Sistema implicado</td><td>Inmunitario (defensas)</td><td>Digestivo / enzimático</td></tr>
                  <tr><td>Cantidad que la desencadena</td><td>Mínima; a veces una traza</td><td>Depende de la dosis</td></tr>
                  <tr><td>Gravedad</td><td>Puede ser grave (anafilaxia)</td><td>Molesta, pero no mortal</td></tr>
                  <tr><td>Ejemplo típico</td><td>Alergia a los frutos secos</td><td>Intolerancia a la lactosa</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>En caso de alergia</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Lee siempre la etiqueta completa</strong>, aunque sea un producto de siempre: las recetas cambian sin avisar.</li>
                <li><strong>Pregunta en el restaurante sin vergüenza.</strong> Están obligados a informarte de los alérgenos de cada plato.</li>
                <li><strong>Cuidado con lo que va a granel</strong> o sin etiquetar: repostería suelta, frutos secos, salsas caseras.</li>
                <li><strong>Lleva tu medicación de rescate</strong> si te la han prescrito (por ejemplo, autoinyector de adrenalina).</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('alergenos-alimentarios')} />
      <ShareCard appName="alergenos-alimentarios" />
      <Footer appName="alergenos-alimentarios" />
    </div>
  );
}
