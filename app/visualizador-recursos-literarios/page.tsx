'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorRecursosLiterarios.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import { figurasRetorica, FiguraRetorica, GrupoFigura, NivelFigura } from '@/data/figuras-retoricas';

type FiltroNivel = NivelFigura | 'todos';
type FiltroGrupo = GrupoFigura | 'todos';

const NIVEL_LABEL: Record<NivelFigura, string> = {
  basico:      'ESO',
  intermedio:  'Bachillerato',
  avanzado:    'Selectividad',
};

const NIVEL_COLOR: Record<NivelFigura, string> = {
  basico:     '#27AE60',
  intermedio: '#E67E22',
  avanzado:   '#E74C3C',
};

const GRUPO_LABEL: Record<GrupoFigura, string> = {
  imagen:        '🖼️ Imagen',
  repeticion:    '🔁 Repetición',
  contraste:     '⚡ Contraste',
  enfasis:       '📢 Énfasis',
  sintaxis:      '🔧 Sintaxis',
  'contigüidad': '🔗 Contigüidad',
};

const GRUPO_COLOR: Record<GrupoFigura, string> = {
  imagen:        '#2E86AB',
  repeticion:    '#8E44AD',
  contraste:     '#E67E22',
  enfasis:       '#E74C3C',
  sintaxis:      '#27AE60',
  'contigüidad': '#16A085',
};

interface ParConfundido {
  figuraA: string;
  figuraB: string;
  diferencia: string;
  claveA: string;
  claveB: string;
}

const PARES_CONFUNDIDOS: ParConfundido[] = [
  {
    figuraA: 'Metáfora',
    figuraB: 'Símil',
    diferencia: 'El símil siempre usa un nexo comparativo explícito ("como", "igual que"). La metáfora lo omite y une directamente los dos términos.',
    claveA: '"Tus ojos son estrellas" → sin nexo',
    claveB: '"Tus ojos son como estrellas" → nexo "como"',
  },
  {
    figuraA: 'Antítesis',
    figuraB: 'Oxímoron',
    diferencia: 'En la antítesis, los opuestos aparecen en expresiones separadas. En el oxímoron, los contrarios se funden en una única expresión brevísima.',
    claveA: '"Es corto el amor / largo el olvido" → dos frases',
    claveB: '"Silencio ensordecedor" → una sola expresión',
  },
  {
    figuraA: 'Elipsis',
    figuraB: 'Asíndeton',
    diferencia: 'El asíndeton omite específicamente conjunciones entre elementos de una enumeración. La elipsis omite cualquier elemento sobreentendido por contexto.',
    claveA: '"Yo fui al cine; ella, al teatro" → omite verbo',
    claveB: '"Reía, lloraba, gritaba" → omite conjunciones "y"',
  },
  {
    figuraA: 'Metonimia',
    figuraB: 'Sinécdoque',
    diferencia: 'La sinécdoque es un tipo específico de metonimia: la relación es siempre parte/todo o singular/plural. La metonimia abarca cualquier relación de contigüidad.',
    claveA: '"Leer a Cervantes" (autor por obra) → contigüidad',
    claveB: '"Cuatro bocas que alimentar" (parte por todo) → parte/todo',
  },
  {
    figuraA: 'Paradoja',
    figuraB: 'Oxímoron',
    diferencia: 'La paradoja es una idea elaborada que esconde una verdad profunda. El oxímoron es una expresión brevísima que une dos contrarios en pocas palabras.',
    claveA: '"Muero porque no muero" → idea filosófica desarrollada',
    claveB: '"Oscura claridad" → dos palabras contradictorias',
  },
  {
    figuraA: 'Eufemismo',
    figuraB: 'Perífrasis',
    diferencia: 'El eufemismo siempre suaviza algo negativo o tabú. La perífrasis puede ser un rodeo estilístico sin necesidad de atenuar nada negativo.',
    claveA: '"Pasó a mejor vida" → suaviza "murió"',
    claveB: '"El astro rey" → rodeo elegante para "el sol"',
  },
];

export default function VisualizadorRecursosLiterariosPage() {
  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>('todos');
  const [filtroGrupo, setFiltroGrupo] = useState<FiltroGrupo>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [figuraActiva, setFiguraActiva] = useState<FiguraRetorica | null>(null);

  const figurasFiltradas = useMemo(() => {
    return figurasRetorica.filter(f => {
      const coincideNivel = filtroNivel === 'todos' || f.nivel === filtroNivel;
      const coincideGrupo = filtroGrupo === 'todos' || f.grupo === filtroGrupo;
      const coincideBusqueda = f.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return coincideNivel && coincideGrupo && coincideBusqueda;
    });
  }, [filtroNivel, filtroGrupo, busqueda]);

  const gruposDisponibles = useMemo(() => {
    const pool = filtroNivel === 'todos' ? figurasRetorica : figurasRetorica.filter(f => f.nivel === filtroNivel);
    const grupos = new Set(pool.map(f => f.grupo));
    return Array.from(grupos) as GrupoFigura[];
  }, [filtroNivel]);

  const totalPorNivel = useMemo(() => {
    return {
      basico: figurasRetorica.filter(f => f.nivel === 'basico').length,
      intermedio: figurasRetorica.filter(f => f.nivel === 'intermedio').length,
      avanzado: figurasRetorica.filter(f => f.nivel === 'avanzado').length,
    };
  }, []);

  function abrirDetalle(figura: FiguraRetorica) {
    setFiguraActiva(figura);
  }

  function cerrarDetalle() {
    setFiguraActiva(null);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Recursos Literarios</h1>
        <p className={styles.heroSubtitle}>
          27 figuras retóricas con definición, ejemplos reales y cómo distinguirlas entre sí
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Estadísticas rápidas ── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>27</span>
            <span className={styles.statLabel}>figuras totales</span>
          </div>
          <div className={styles.statCard} style={{ borderColor: NIVEL_COLOR.basico }}>
            <span className={styles.statNum} style={{ color: NIVEL_COLOR.basico }}>{totalPorNivel.basico}</span>
            <span className={styles.statLabel}>nivel ESO</span>
          </div>
          <div className={styles.statCard} style={{ borderColor: NIVEL_COLOR.intermedio }}>
            <span className={styles.statNum} style={{ color: NIVEL_COLOR.intermedio }}>{totalPorNivel.intermedio}</span>
            <span className={styles.statLabel}>Bachillerato</span>
          </div>
          <div className={styles.statCard} style={{ borderColor: NIVEL_COLOR.avanzado }}>
            <span className={styles.statNum} style={{ color: NIVEL_COLOR.avanzado }}>{totalPorNivel.avanzado}</span>
            <span className={styles.statLabel}>Selectividad</span>
          </div>
        </div>

        {/* ── Filtros y buscador ── */}
        <div className={styles.filtrosBox}>
          <input
            type="search"
            className={styles.buscador}
            placeholder="Buscar figura... (ej: metáfora, ironía)"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            aria-label="Buscar figura retórica"
          />

          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Nivel:</span>
            <div className={styles.filtrosBotones}>
              {(['todos', 'basico', 'intermedio', 'avanzado'] as FiltroNivel[]).map(n => (
                <button
                  type="button"
                  key={n}
                  aria-pressed={filtroNivel === n}
                  className={`${styles.filtroBtn} ${filtroNivel === n ? styles.filtroBtnActivo : ''}`}
                  onClick={() => { setFiltroNivel(n); setFiltroGrupo('todos'); }}
                  style={filtroNivel === n && n !== 'todos' ? { background: NIVEL_COLOR[n as NivelFigura], borderColor: NIVEL_COLOR[n as NivelFigura] } : {}}
                >
                  {n === 'todos' ? 'Todos' : NIVEL_LABEL[n as NivelFigura]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Grupo:</span>
            <div className={styles.filtrosBotones}>
              <button
                type="button"
                aria-pressed={filtroGrupo === 'todos'}
                className={`${styles.filtroBtn} ${filtroGrupo === 'todos' ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltroGrupo('todos')}
              >
                Todos
              </button>
              {gruposDisponibles.map(g => (
                <button
                  type="button"
                  key={g}
                  aria-pressed={filtroGrupo === g}
                  className={`${styles.filtroBtn} ${filtroGrupo === g ? styles.filtroBtnActivo : ''}`}
                  onClick={() => setFiltroGrupo(g)}
                  style={filtroGrupo === g ? { background: GRUPO_COLOR[g], borderColor: GRUPO_COLOR[g] } : {}}
                >
                  {GRUPO_LABEL[g]}
                </button>
              ))}
            </div>
          </div>

          <p className={styles.resultadosInfo}>
            {figurasFiltradas.length === figurasRetorica.length
              ? `Mostrando las ${figurasRetorica.length} figuras`
              : `${figurasFiltradas.length} figura${figurasFiltradas.length !== 1 ? 's' : ''} encontrada${figurasFiltradas.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* ── Galería de figuras ── */}
        {figurasFiltradas.length > 0 ? (
          <div className={styles.galeriaGrid}>
            {figurasFiltradas.map(figura => (
              <button
                type="button"
                key={figura.id}
                className={styles.figuraCard}
                onClick={() => abrirDetalle(figura)}
                aria-label={`Ver detalle de ${figura.nombre}`}
              >
                <div className={styles.figuraCardHeader}>
                  <span className={styles.figuraNombre}>{figura.nombre}</span>
                  <div className={styles.figuraBadges}>
                    <span
                      className={styles.badgeNivel}
                      style={{ background: NIVEL_COLOR[figura.nivel] }}
                    >
                      {NIVEL_LABEL[figura.nivel]}
                    </span>
                    <span
                      className={styles.badgeGrupo}
                      style={{ color: GRUPO_COLOR[figura.grupo], borderColor: GRUPO_COLOR[figura.grupo] }}
                    >
                      {GRUPO_LABEL[figura.grupo]}
                    </span>
                  </div>
                </div>
                <p className={styles.figuraDefinicionPreview}>
                  {figura.definicion.length > 100 ? figura.definicion.slice(0, 100) + '…' : figura.definicion}
                </p>
                <p className={styles.figuraEjemploPreview}>
                  <em>"{figura.ejemplos[0]}"</em>
                </p>
                <span className={styles.figuraVerMas}>Ver detalle →</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.sinResultados}>
            <p>No se encontraron figuras con ese criterio.</p>
            <button type="button" className={styles.btnReset} onClick={() => { setBusqueda(''); setFiltroNivel('todos'); setFiltroGrupo('todos'); }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* ── Modal de detalle ── */}
        {figuraActiva && (
          <div className={styles.modalOverlay} onClick={cerrarDetalle} role="dialog" aria-modal="true" aria-label={`Detalle de ${figuraActiva.nombre}`}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button type="button" className={styles.modalCerrar} onClick={cerrarDetalle} aria-label="Cerrar detalle">✕</button>

              <div className={styles.modalHeader} style={{ borderColor: GRUPO_COLOR[figuraActiva.grupo] }}>
                <h2 className={styles.modalNombre}>{figuraActiva.nombre}</h2>
                <div className={styles.modalBadges}>
                  <span className={styles.badgeNivel} style={{ background: NIVEL_COLOR[figuraActiva.nivel] }}>
                    {NIVEL_LABEL[figuraActiva.nivel]}
                  </span>
                  <span className={styles.badgeGrupo} style={{ color: GRUPO_COLOR[figuraActiva.grupo], borderColor: GRUPO_COLOR[figuraActiva.grupo] }}>
                    {GRUPO_LABEL[figuraActiva.grupo]}
                  </span>
                </div>
              </div>

              <div className={styles.modalBody}>
                <section className={styles.modalSeccion}>
                  <h3 className={styles.modalSeccionTitle}>Definición</h3>
                  <p className={styles.modalTexto}>{figuraActiva.definicion}</p>
                </section>

                <section className={styles.modalSeccion}>
                  <h3 className={styles.modalSeccionTitle}>⚠️ Cómo no confundirla</h3>
                  <p className={styles.modalDistincion}>{figuraActiva.distincion}</p>
                </section>

                <section className={styles.modalSeccion}>
                  <h3 className={styles.modalSeccionTitle}>Ejemplos</h3>
                  <ul className={styles.ejemplosList}>
                    {figuraActiva.ejemplos.map((ej, i) => (
                      <li key={i} className={styles.ejemploItem}>
                        <span className={styles.ejemploComilla} style={{ color: GRUPO_COLOR[figuraActiva.grupo] }}>"</span>
                        {ej}
                        <span className={styles.ejemploComilla} style={{ color: GRUPO_COLOR[figuraActiva.grupo] }}>"</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className={styles.modalFooter}>
                <a
                  href="/quiz-figuras-retoricas/"
                  className={styles.btnQuiz}
                  style={{ background: GRUPO_COLOR[figuraActiva.grupo] }}
                >
                  ¿La dominas? Prueba el quiz →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Pares frecuentemente confundidos ── */}
        <section className={styles.paresSection}>
          <h2 className={styles.paresTitulo}>Pares frecuentemente confundidos</h2>
          <p className={styles.paresSubtitulo}>Las 6 confusiones más comunes y cómo distinguirlas de un vistazo</p>
          <div className={styles.paresGrid}>
            {PARES_CONFUNDIDOS.map((par, i) => (
              <div key={i} className={styles.parCard}>
                <div className={styles.parHeader}>
                  <button
                    type="button"
                    className={styles.parFiguraBtn}
                    onClick={() => {
                      const fig = figurasRetorica.find(f => f.nombre === par.figuraA);
                      if (fig) abrirDetalle(fig);
                    }}
                  >
                    {par.figuraA}
                  </button>
                  <span className={styles.parVs}>vs</span>
                  <button
                    type="button"
                    className={styles.parFiguraBtn}
                    onClick={() => {
                      const fig = figurasRetorica.find(f => f.nombre === par.figuraB);
                      if (fig) abrirDetalle(fig);
                    }}
                  >
                    {par.figuraB}
                  </button>
                </div>
                <p className={styles.parDiferencia}>{par.diferencia}</p>
                <div className={styles.parClaves}>
                  <div className={styles.parClave}>
                    <span className={styles.parClaveLabel}>{par.figuraA}:</span>
                    <span className={styles.parClaveTexto}>{par.claveA}</span>
                  </div>
                  <div className={styles.parClave}>
                    <span className={styles.parClaveLabel}>{par.figuraB}:</span>
                    <span className={styles.parClaveTexto}>{par.claveB}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Quiz ── */}
        <div className={styles.ctaBox}>
          <div className={styles.ctaTexto}>
            <h2 className={styles.ctaTitulo}>¿Ya las conoces bien?</h2>
            <p className={styles.ctaDesc}>Pon a prueba tu capacidad de reconocer figuras retóricas en contexto real</p>
          </div>
          <a href="/quiz-figuras-retoricas/" className={styles.ctaBtn}>
            Hacer el quiz →
          </a>
        </div>

        {/* ── Educational Section ── */}
        <EducationalSection
          title="Sobre las figuras retóricas"
          subtitle="Qué son, para qué sirven y cómo usarlas en el estudio y en la escritura"
        >
          <div className={styles.guideSection}>

            <h3>¿Qué son las figuras retóricas?</h3>
            <p>Las figuras retóricas son recursos del lenguaje que los escritores y oradores usan para expresarse de forma más vívida, bella o persuasiva. No son adornos decorativos: cada figura produce un efecto específico en el lector, y reconocerlas es esencial tanto para comentar textos literarios como para escribir con mayor precisión y riqueza.</p>

            {/* Tabla comparativa */}
            <h3>Los 6 grupos de figuras</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Qué hace</th>
                    <th>Figuras principales</th>
                    <th>Efecto en el lector</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>🖼️ Imagen</td><td>Crea comparaciones o representaciones visuales</td><td>Metáfora, Símil, Personificación, Alegoría</td><td>Visualizar ideas abstractas</td></tr>
                  <tr><td>🔁 Repetición</td><td>Repite sonidos, palabras o estructuras</td><td>Anáfora, Aliteración, Polisíndeton, Paronomasia</td><td>Ritmo, énfasis y musicalidad</td></tr>
                  <tr><td>⚡ Contraste</td><td>Opone ideas o términos contrarios</td><td>Antítesis, Oxímoron, Paradoja, Ironía</td><td>Tensión y profundidad de significado</td></tr>
                  <tr><td>📢 Énfasis</td><td>Intensifica o atenúa una idea</td><td>Hipérbole, Epíteto, Gradación, Lítotes, Eufemismo</td><td>Impacto emocional o suavización</td></tr>
                  <tr><td>🔧 Sintaxis</td><td>Altera el orden o la estructura gramatical</td><td>Hipérbaton, Elipsis, Asíndeton, Zeugma, Quiasmo</td><td>Agilidad, solemnidad o sorpresa</td></tr>
                  <tr><td>🔗 Contigüidad</td><td>Sustituye un término por otro relacionado</td><td>Metonimia, Sinécdoque, Perífrasis</td><td>Elegancia y sugerencia indirecta</td></tr>
                </tbody>
              </table>
            </div>

            {/* Casos de uso */}
            <h3>¿Quién usa esta guía?</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>📖</span>
                  <h4>Estudiante de ESO</h4>
                </div>
                <p>Repasa las 10 figuras básicas (metáfora, símil, hipérbole, personificación, anáfora, antítesis, ironía, epíteto, aliteración, hipérbaton) antes de un examen de Lengua y Literatura.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🎓</span>
                  <h4>Estudiante de Bachillerato</h4>
                </div>
                <p>Amplía con las 10 figuras de nivel intermedio (oxímoron, paradoja, gradación, elipsis, polisíndeton, asíndeton, eufemismo, perífrasis, metonimia, sinécdoque) para el comentario de texto.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🏆</span>
                  <h4>Preparando Selectividad</h4>
                </div>
                <p>Domina las 7 figuras avanzadas (alegoría, apóstrofe, lítotes, quiasmo, paronomasia, zeugma) y repasa los pares confundidos que más aparecen en los exámenes.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>✍️</span>
                  <h4>Escritor o creador</h4>
                </div>
                <p>Usa las figuras de forma deliberada en tus textos: saber qué efecto produce cada una (ritmo, contraste, imagen) permite elegir la figura adecuada para cada momento.</p>
              </div>
            </div>

            {/* FAQ */}
            <h3>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Cuántas figuras retóricas existen en total?</h4>
                <p>La retórica clásica cataloga más de 200 figuras, pero en la práctica educativa española se trabajan entre 20 y 30. Esta guía cubre las 27 más frecuentes en los currículos de ESO, Bachillerato y Selectividad.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cuál es la diferencia entre figura retórica y recurso literario?</h4>
                <p>"Figura retórica" y "recurso literario" se usan a menudo como sinónimos, aunque en sentido estricto los recursos literarios incluyen también elementos métricos y estilísticos que no alteran el lenguaje (versificación, ritmo, etc.). Para uso escolar, son equivalentes.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Por qué los exámenes preguntan tanto metáfora vs. símil?</h4>
                <p>Porque es la confusión más frecuente y la más fácil de evaluar. La clave es mecánica: ¿hay nexo comparativo ("como", "igual que")? Sí → símil. No → metáfora. Practicarlo con ejemplos es la mejor forma de automatizarlo.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo se identifican figuras retóricas en un texto de examen?</h4>
                <p>El proceso más fiable: (1) leer el fragmento buscando anomalías en el lenguaje normal (comparaciones, exageraciones, repeticiones, inversiones de orden), (2) identificar qué tipo de alteración es, (3) buscar la figura que corresponde a ese mecanismo específico.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué figuras aparecen más en Selectividad?</h4>
                <p>Varía por comunidad autónoma, pero las más frecuentes son: metáfora, hipérbole, anáfora, personificación, antítesis y oxímoron. Las figuras avanzadas (alegoría, apóstrofe, lítotes, quiasmo) aparecen especialmente en textos poéticos del Siglo de Oro y el Romanticismo.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Puede una frase contener varias figuras a la vez?</h4>
                <p>Sí, es muy habitual. "Tus cabellos de oro brillan como el sol" combina metáfora (cabellos de oro), símil (como el sol) y epíteto (si "brillantes" fuera una cualidad obvia). Los textos poéticos acumulan figuras con frecuencia.</p>
              </div>
            </div>

            {/* Guía paso a paso */}
            <h3>Cómo estudiar las figuras retóricas</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Empieza por el nivel básico (10 figuras)</h4>
                  <p>Filtra por "ESO" y estudia las 10 figuras esenciales. Son las que aparecen en el 80% de los textos literarios y en todos los niveles educativos.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Lee el campo "Cómo no confundirla"</h4>
                  <p>Cada tarjeta de detalle incluye la distinción clave respecto a figuras similares. Es el apartado más importante para el examen: los correctores valoran la precisión.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Estudia los pares confundidos</h4>
                  <p>Revisa la sección de pares (metáfora/símil, antítesis/oxímoron, etc.) antes del examen. Son las confusiones que más puntos cuestan.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Practica con el quiz</h4>
                  <p>El quiz de figuras retóricas muestra un ejemplo real y pide identificar la figura. Es el paso de la teoría a la práctica, que es lo que evalúan los exámenes.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Amplía con el nivel intermedio y avanzado</h4>
                  <p>Una vez dominadas las básicas, filtra por "Bachillerato" y "Selectividad" para completar el repertorio. Las figuras avanzadas son menos frecuentes pero muy valoradas en el comentario de texto.</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <h3>Claves para el comentario de texto</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🎯</span>
                <h4>Nombra y explica</h4>
                <p>En el examen no basta con decir "hay una metáfora": explica qué compara, qué término real sustituye y qué efecto produce en el lector.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>📍</span>
                <h4>Ubica en el texto</h4>
                <p>Cita el fragmento exacto donde aparece la figura antes de analizarla. Los correctores necesitan saber a qué parte del texto te refieres.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🔗</span>
                <h4>Relaciona con el tema</h4>
                <p>Las mejores respuestas conectan la figura con el tema o la intención del autor. Una hipérbole en un poema de amor intensifica el sentimiento central.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>⚡</span>
                <h4>Agrupa por función</h4>
                <p>Si hay varias figuras del mismo grupo (imagen, repetición, contraste), analízalas juntas: "el autor usa recursos de repetición (anáfora y aliteración) para crear musicalidad".</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🧩</span>
                <h4>Aprende el mecanismo, no la definición</h4>
                <p>Lo importante no es memorizar la definición de diccionario sino entender el mecanismo: ¿qué hace exactamente esta figura con las palabras o las ideas?</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>📚</span>
                <h4>Lee poesía en voz alta</h4>
                <p>Muchas figuras (aliteración, anáfora, gradación) se detectan más fácilmente oyendo el texto que leyéndolo en silencio. Leer en voz alta activa el oído retórico.</p>
              </div>
            </div>

            {/* Warning Box */}
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono}>⚠️</span>
                <h4>Errores frecuentes en el examen</h4>
              </div>
              <ul className={styles.warningList}>
                <li>Confundir metáfora y símil: recordar que el símil siempre lleva "como" o equivalente; la metáfora nunca.</li>
                <li>Llamar "metáfora" a cualquier imagen o comparación sin distinguir el mecanismo exacto.</li>
                <li>Confundir antítesis (dos frases separadas) con oxímoron (dos contrarios en una sola expresión).</li>
                <li>Identificar elipsis como asíndeton: la elipsis omite cualquier elemento, el asíndeton omite solo conjunciones.</li>
                <li>Ignorar el campo "cómo no confundirla": es la información más útil para evitar errores en el comentario.</li>
                <li>Analizar las figuras de forma aislada sin conectarlas con el tema o la intención del autor.</li>
              </ul>
            </div>

          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-recursos-literarios')} />
        <ShareCard appName="visualizador-recursos-literarios" />
      </main>

      <Footer appName="visualizador-recursos-literarios" />
    </div>
  );
}
