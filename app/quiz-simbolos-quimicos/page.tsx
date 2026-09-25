'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './QuizSimbolosQuimicos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, ShareCard, LegalNotice, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatPercentage } from '@/lib';
import { ELEMENTOS, TOTAL_ELEMENTOS, type Elemento } from '@/data/elementos-quimicos';

type Modo = 'simbolo-nombre' | 'nombre-simbolo';
type Dificultad = 'facil' | 'medio' | 'dificil';
type Fase = 'inicio' | 'jugando' | 'respondida' | 'fin';

interface Pregunta {
  elemento: Elemento;
  opciones: string[];
  correcta: string;
}

const DIFICULTAD_CONFIG: Record<Dificultad, { label: string; emoji: string; preguntas: number; categorias: Elemento['categoria'][] }> = {
  facil:   { label: 'Fácil',   emoji: '🟢', preguntas: 10, categorias: ['comun'] },
  medio:   { label: 'Medio',   emoji: '🟡', preguntas: 15, categorias: ['comun', 'conocido'] },
  dificil: { label: 'Difícil', emoji: '🔴', preguntas: 20, categorias: ['comun', 'conocido', 'avanzado'] },
};

const MODO_CONFIG: Record<Modo, { label: string; icon: string; desc: string }> = {
  'simbolo-nombre': { label: 'Símbolo → Nombre', icon: '⚗️', desc: 'Ve el símbolo, adivina el elemento' },
  'nombre-simbolo': { label: 'Nombre → Símbolo', icon: '🔬', desc: 'Lee el nombre, elige el símbolo' },
};

const LETRAS = ['A', 'B', 'C', 'D'];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarPreguntas(modo: Modo, dificultad: Dificultad): Pregunta[] {
  const cfg = DIFICULTAD_CONFIG[dificultad];
  const pool = ELEMENTOS.filter(e => cfg.categorias.includes(e.categoria));
  const seleccionados = mezclar(pool).slice(0, cfg.preguntas);

  // pool completo para distractores
  const todoPool = ELEMENTOS.filter(e => cfg.categorias.includes(e.categoria));

  return seleccionados.map(elemento => {
    const correcta = modo === 'simbolo-nombre' ? elemento.nombre : elemento.simbolo;
    const opcionesPool = todoPool
      .filter(e => e.simbolo !== elemento.simbolo)
      .map(e => modo === 'simbolo-nombre' ? e.nombre : e.simbolo);
    const incorrectas = mezclar(opcionesPool).slice(0, 3);
    return {
      elemento,
      opciones: mezclar([correcta, ...incorrectas]),
      correcta,
    };
  });
}

/**
 * Medalla según la proporción de aciertos (hallazgo 1815). Antes rotulaba «Bien» desde el 40 %:
 * «Bien» es una nota de la escala escolar española (un 6), y aquí se daba a un 4 y a un 5, con
 * un azar que ya acierta 1 de cada 4 (P(≥ 4 de 10 a ciegas) = 22,4 %). Ahora ningún rótulo es
 * el nombre de una nota de ningún país, el primer escalón pide la mitad de aciertos (a ciegas,
 * P(≥ 5 de 10) = 7,8 %) y la escala se explica en la propia pantalla del resultado.
 * Se compara con enteros (aciertos·10 frente a total·n) para que 13 de 15 (86,7 %) no se
 * redondee hacia arriba a oro.
 */
function calcularMedalla(aciertos: number, total: number): { emoji: string; texto: string } {
  if (total > 0 && aciertos === total) return { emoji: '🏆', texto: '¡Perfecto!' };
  if (aciertos * 10 >= total * 9) return { emoji: '🥇', texto: '¡Excelente!' };
  if (aciertos * 10 >= total * 7) return { emoji: '🥈', texto: '¡Muy bien!' };
  if (aciertos * 10 >= total * 5) return { emoji: '🥉', texto: 'Vas por buen camino' };
  return { emoji: '📚', texto: 'Sigue practicando' };
}

/** Hueco que deja arriba la barra del logo fijo; igual que el scroll-margin-top del CSS. */
const MARGEN_LOGO = 88;

/**
 * Lleva `bloque` al principio de la pantalla (respetando su scroll-margin-top) solo si `clave`
 * no se ve entera: tapada por el logo fijo, por encima del borde o por debajo del final.
 * Mismo patrón que quiz-literatura-universal y quiz-biologia-molecular.
 */
function traerALaVista(bloque: HTMLElement | null, clave: HTMLElement | null) {
  if (!bloque || !clave) return;
  const r = clave.getBoundingClientRect();
  if (r.top >= MARGEN_LOGO && r.bottom <= window.innerHeight) return;
  bloque.scrollIntoView({ block: 'start', behavior: 'auto' });
}

export default function QuizSimbolosQuimicosPage() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [modo, setModo] = useState<Modo>('simbolo-nombre');
  const [dificultad, setDificultad] = useState<Dificultad>('facil');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [rachaActual, setRachaActual] = useState(0);
  const [rachMax, setRachMax] = useState(0);
  const [erroresDetalle, setErroresDetalle] = useState<{ simbolo: string; nombre: string; respuesta: string }[]>([]);

  const preguntaActual = preguntas[indice] ?? null;

  /**
   * Foco y vista (hallazgos 1812 y 1813, la forma del 1676/1675 de quiz-tabla-periodica).
   * · Al responder, la opción pulsada queda `disabled` y el navegador soltaba el foco al
   *   <body>: se lleva a «Siguiente», la única acción que queda.
   * · Al pulsar «Siguiente» ese botón se desmonta con el feedback y el foco caía al <body>,
   *   DETRÁS de las opciones nuevas (el primer Tab salía del quiz). Ahora va a la tarjeta de la
   *   pregunta nueva, y el Tab siguiente cae en la opción A.
   * · Al pulsar «¡Empezar quiz!» en móvil, el panel de configuración (largo) se sustituía por el
   *   quiz sin mover la vista y la pregunta quedaba por encima del borde: si la tarjeta de la
   *   pregunta no se ve entera bajo el logo fijo, la vista sube al principio del quiz. Igual con
   *   el resultado, que además recibe el foco para que el lector de pantalla lo lea.
   * · Al volver a la configuración desde el resultado, el foco va a su primer título.
   */
  const quizPanelRef = useRef<HTMLDivElement>(null);
  const preguntaRef = useRef<HTMLDivElement>(null);
  const botonSiguienteRef = useRef<HTMLButtonElement>(null);
  const finPanelRef = useRef<HTMLDivElement>(null);
  const tituloInicioRef = useRef<HTMLHeadingElement>(null);
  const vieneDelResultado = useRef(false);

  useEffect(() => {
    if (fase === 'respondida') {
      botonSiguienteRef.current?.focus();
    } else if (fase === 'jugando') {
      traerALaVista(quizPanelRef.current, preguntaRef.current);
      preguntaRef.current?.focus({ preventScroll: true });
    } else if (fase === 'fin') {
      traerALaVista(finPanelRef.current, finPanelRef.current);
      finPanelRef.current?.focus({ preventScroll: true });
    } else if (fase === 'inicio' && vieneDelResultado.current) {
      vieneDelResultado.current = false;
      tituloInicioRef.current?.focus();
    }
  }, [fase, indice]);

  const iniciarQuiz = useCallback(() => {
    const qs = generarPreguntas(modo, dificultad);
    setPreguntas(qs);
    setIndice(0);
    setSeleccionada(null);
    setAciertos(0);
    setRachaActual(0);
    setRachMax(0);
    setErroresDetalle([]);
    setFase('jugando');
  }, [modo, dificultad]);

  const responder = useCallback((opcion: string) => {
    if (!preguntaActual || seleccionada !== null) return;
    setSeleccionada(opcion);

    const esCorrecta = opcion === preguntaActual.correcta;
    if (esCorrecta) {
      setAciertos(a => a + 1);
      setRachaActual(r => {
        const nueva = r + 1;
        setRachMax(m => Math.max(m, nueva));
        return nueva;
      });
    } else {
      setRachaActual(0);
      setErroresDetalle(prev => [
        ...prev,
        {
          simbolo: preguntaActual.elemento.simbolo,
          nombre: preguntaActual.elemento.nombre,
          respuesta: opcion,
        },
      ]);
    }
    setFase('respondida');
  }, [preguntaActual, seleccionada]);

  const siguiente = useCallback(() => {
    const siguienteIndice = indice + 1;
    if (siguienteIndice >= preguntas.length) {
      setFase('fin');
    } else {
      setIndice(siguienteIndice);
      setSeleccionada(null);
      setFase('jugando');
    }
  }, [indice, preguntas.length]);

  // «50 %» con espacio duro (formato español, CLAUDE.md §2; hallazgo 1816)
  const porcentaje = formatPercentage(preguntas.length > 0 ? aciertos / preguntas.length : 0, 0);
  const medalla = calcularMedalla(aciertos, preguntas.length);
  // La barra se rotula «Preguntas respondidas»: cuenta la actual en cuanto se responde, y así
  // llega a 10 de 10 (antes contaba el índice y se quedaba en 9; hallazgo 1820).
  const respondidas = indice + (fase === 'respondida' ? 1 : 0);

  const preguntaLabel = useMemo(() => {
    if (!preguntaActual) return '';
    return modo === 'simbolo-nombre'
      ? '¿Cuál es el nombre de este elemento?'
      : '¿Cuál es el símbolo de este elemento?';
  }, [modo, preguntaActual]);

  const preguntaDisplay = useMemo(() => {
    if (!preguntaActual) return '';
    return modo === 'simbolo-nombre'
      ? preguntaActual.elemento.simbolo
      : preguntaActual.elemento.nombre;
  }, [modo, preguntaActual]);

  const estadoOpcion = (opcion: string): 'correcta' | 'incorrecta' | 'seleccionada-mal' | 'neutral' => {
    if (seleccionada === null) return 'neutral';
    if (opcion === preguntaActual?.correcta) return 'correcta';
    if (opcion === seleccionada) return 'seleccionada-mal';
    return 'neutral';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">⚗️</div>
        <h1 className={styles.title}>Quiz Símbolos Químicos</h1>
        <p className={styles.subtitle}>Pon a prueba tus conocimientos de la tabla periódica</p>
        <div className={styles.heroBadges}>
          <span>{TOTAL_ELEMENTOS} elementos</span>
          <span>3 dificultades</span>
          <span>2 modos de juego</span>
        </div>
      </header>

      <LegalNotice />

      {/* ── INICIO ── */}
      {fase === 'inicio' && (
        <div className={styles.inicioPanel}>
          <section className={styles.configSection}>
            <h2 className={styles.configTitulo} ref={tituloInicioRef} tabIndex={-1}>Elige el modo de juego</h2>
            <div className={styles.modoGrid}>
              {(Object.entries(MODO_CONFIG) as [Modo, typeof MODO_CONFIG[Modo]][]).map(([key, cfg]) => (
                <button type="button"
                  key={key}
                  className={`${styles.modoCard} ${modo === key ? styles.modoActivo : ''}`}
                  onClick={() => setModo(key)}
                  aria-pressed={modo === key}
                >
                  <span className={styles.modoIcono} aria-hidden="true">{cfg.icon}</span>
                  <strong>{cfg.label}</strong>
                  <span>{cfg.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.configSection}>
            <h2 className={styles.configTitulo}>Elige la dificultad</h2>
            <div className={styles.difGrid}>
              {(Object.entries(DIFICULTAD_CONFIG) as [Dificultad, typeof DIFICULTAD_CONFIG[Dificultad]][]).map(([key, cfg]) => (
                <button type="button"
                  key={key}
                  className={`${styles.difCard} ${dificultad === key ? styles.difActivo : ''}`}
                  onClick={() => setDificultad(key)}
                  aria-pressed={dificultad === key}
                >
                  <span className={styles.difEmoji} aria-hidden="true">{cfg.emoji}</span>
                  <strong>{cfg.label}</strong>
                  <span>{cfg.preguntas} preguntas · {cfg.categorias.length === 1 ? 'Elementos comunes' : cfg.categorias.length === 2 ? 'Más variedad' : 'Elementos avanzados'}</span>
                </button>
              ))}
            </div>
          </section>

          <button type="button" className={styles.btnIniciar} onClick={iniciarQuiz}>
            ¡Empezar quiz!
          </button>
        </div>
      )}

      {/* ── JUGANDO / RESPONDIDA ── */}
      {(fase === 'jugando' || fase === 'respondida') && preguntaActual && (
        <div className={styles.quizPanel} ref={quizPanelRef}>
          {/* Barra de progreso */}
          <div className={styles.progresoBarra}>
            <div className={styles.progresoInfo}>
              <span>Pregunta {indice + 1} / {preguntas.length}</span>
              {/* Al envolver los emojis en aria-hidden (hallazgo 249) el número de aciertos se
                  quedó sin rótulo: el emoji era su única etiqueta, y un lector de pantalla
                  oía «10 · Racha: 10» después de cada respuesta. El aria-label da la frase
                  completa sin cambiar lo que se ve (hallazgo 284). */}
              <span
                role="status"
                aria-live="polite"
                aria-label={`Aciertos: ${aciertos}. Racha: ${rachaActual}.`}
              >
                <span aria-hidden="true">✅</span> {aciertos} · <span aria-hidden="true">🔥</span> Racha:{' '}
                {rachaActual}
              </span>
            </div>
            <div className={styles.progresoTrack}>
              <div
                className={styles.progresoFill}
                style={{ width: `${(respondidas / preguntas.length) * 100}%` }}
                role="progressbar"
                aria-label="Preguntas respondidas"
                aria-valuemin={0}
                aria-valuenow={respondidas}
                aria-valuemax={preguntas.length}
                aria-valuetext={`${respondidas} de ${preguntas.length} preguntas respondidas`}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.preguntaCard} ref={preguntaRef} tabIndex={-1}>
            <p className={styles.preguntaLabel}>{preguntaLabel}</p>
            <div className={styles.elementoDisplay}>
              <span className={styles.elementoTexto}>{preguntaDisplay}</span>
              {modo === 'simbolo-nombre' && (
                <span className={styles.elementoZ}>Z = {preguntaActual.elemento.z}</span>
              )}
            </div>
          </div>

          {/* Opciones.
              SIN aria-pressed: es el atributo de un botón conmutador, y esto es elegir entre
              alternativas. Un lector de pantalla anunciaba las cuatro como «botón de
              alternar, no pulsado» antes de contestar, y una vez elegida una ya no se podía
              «despulsar» porque las cuatro quedan disabled. El CLAUDE.md §5 exime justamente
              a este patrón, y avisa de que un aria-pressed en un botón de acción es una
              regresión y no una mejora (hallazgo 285). Tampoco se usa role="radio": estos
              botones no preseleccionan nada, ejecutan la respuesta al pulsarlos. */}
          <div className={styles.opcionesGrid} role="group" aria-label="Opciones de respuesta">
            {preguntaActual.opciones.map((opcion, i) => {
              const estado = estadoOpcion(opcion);
              return (
                <button type="button"
                  key={opcion}
                  className={`${styles.opcionBtn} ${styles[`opcion-${estado}`]}`}
                  onClick={() => responder(opcion)}
                  disabled={seleccionada !== null}
                >
                  <span className={styles.opcionLetra} aria-hidden="true">{LETRAS[i]}</span>
                  <span className={styles.opcionTexto}>{opcion}</span>
                  {estado === 'correcta' && <span aria-hidden="true">✅</span>}
                  {estado === 'seleccionada-mal' && <span aria-hidden="true">❌</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback + siguiente */}
          {fase === 'respondida' && (
            <div className={styles.feedbackPanel}>
              <div role="alert" className={`${styles.feedbackMensaje} ${seleccionada === preguntaActual.correcta ? styles.feedbackOk : styles.feedbackFail}`}>
                {seleccionada === preguntaActual.correcta ? (
                  <><span aria-hidden="true">✅</span> ¡Correcto! <strong>{preguntaActual.elemento.nombre}</strong> · símbolo <strong>{preguntaActual.elemento.simbolo}</strong> · Z={preguntaActual.elemento.z}</>
                ) : (
                  <><span aria-hidden="true">❌</span> La respuesta correcta era: <strong>{preguntaActual.correcta}</strong> ({modo === 'simbolo-nombre' ? `símbolo ${preguntaActual.elemento.simbolo}` : `nombre: ${preguntaActual.elemento.nombre}`})</>
                )}
              </div>
              <button type="button" ref={botonSiguienteRef} className={styles.btnSiguiente} onClick={siguiente}>
                {indice + 1 < preguntas.length ? 'Siguiente pregunta →' : 'Ver resultados'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FIN ── */}
      {fase === 'fin' && (
        <div className={styles.finPanel} ref={finPanelRef} tabIndex={-1}>
          <div className={styles.medallaIcon} aria-hidden="true">{medalla.emoji}</div>
          <h2 className={styles.finTitulo}>{medalla.texto}</h2>
          <p className={styles.finSubtitulo}>
            Has acertado <strong>{aciertos}</strong> de <strong>{preguntas.length}</strong> ({porcentaje})
          </p>
          <p className={styles.escalaNota}>
            Medallas: bronce desde la mitad de aciertos, plata desde el 70{' '}%, oro desde el
            90{' '}% y copa con todas. Contestando al azar se acierta, de media, 1 de cada 4.
          </p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{aciertos}</span>
              <span className={styles.statLabel}>Aciertos</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{preguntas.length - aciertos}</span>
              <span className={styles.statLabel}>Errores</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{rachMax}</span>
              <span className={styles.statLabel}>Racha máxima</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{porcentaje}</span>
              <span className={styles.statLabel}>Precisión</span>
            </div>
          </div>

          {erroresDetalle.length > 0 && (
            <div className={styles.erroresSection}>
              <h3 className={styles.erroresTitulo}>Elementos a repasar ({erroresDetalle.length})</h3>
              <div className={styles.erroresGrid}>
                {erroresDetalle.map((err, i) => (
                  <div key={i} className={styles.errorItem}>
                    <span className={styles.errorSimbolo}>{err.simbolo}</span>
                    <span className={styles.errorNombre}>{err.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.finBotones}>
            <button type="button" className={styles.btnIniciar} onClick={iniciarQuiz}>
              <span aria-hidden="true">🔄</span> Repetir quiz
            </button>
            <button type="button"
              className={styles.btnSecundario}
              onClick={() => {
                vieneDelResultado.current = true;
                setFase('inicio');
              }}
            >
              <span aria-hidden="true">⚙️</span> Cambiar configuración
            </button>
          </div>
        </div>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Todo sobre la tabla periódica"
        subtitle="Historia, curiosidades y datos de los elementos químicos"
      >
        {/* Tabla comparativa por grupos */}
        <section className={styles.guideSection}>
          <h2>Grupos de la tabla periódica</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Características</th>
                  <th>Ejemplos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Metales alcalinos</td>
                  <td>Muy reactivos, blandos, baja densidad</td>
                  <td>Li, Na, K, Rb, Cs</td>
                </tr>
                <tr>
                  <td>Metales alcalinotérreos</td>
                  <td>Reactivos, más duros que alcalinos</td>
                  <td>Be, Mg, Ca, Sr, Ba, Ra</td>
                </tr>
                <tr>
                  <td>Metales de transición</td>
                  <td>Buenos conductores, alta densidad</td>
                  <td>Fe, Cu, Ag, Au, Pt, Hg</td>
                </tr>
                <tr>
                  <td>Halógenos</td>
                  <td>Muy reactivos, forman sales</td>
                  <td>F, Cl, Br, I</td>
                </tr>
                <tr>
                  <td>Gases nobles</td>
                  <td>Muy estables, casi no reaccionan</td>
                  <td>He, Ne, Ar, Kr, Xe, Rn</td>
                </tr>
                <tr>
                  <td>Lantánidos</td>
                  <td>Tierras raras, propiedades similares</td>
                  <td>La, Ce, Nd, Eu, Gd</td>
                </tr>
                <tr>
                  <td>Actínidos</td>
                  <td>Radiactivos, mayoría artificiales</td>
                  <td>Th, U, Pu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios de uso */}
        <section className={styles.guideSection}>
          <h2>¿Para qué sirve aprender los símbolos químicos?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎓</span>
              <h3>Estudios de química</h3>
              <p>En bachillerato, universidad y ciclos de laboratorio es imprescindible conocer los símbolos para leer fórmulas, ecuaciones y reacciones sin ambigüedad.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">💊</span>
              <h3>Farmacia y medicina</h3>
              <p>Na, K, Ca, Mg, Fe, I... Los profesionales de la salud trabajan constantemente con elementos que forman parte de medicamentos, sueros y análisis clínicos.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏭</span>
              <h3>Industria y materiales</h3>
              <p>Ingenieros, metalúrgicos y técnicos de materiales necesitan identificar Al (aluminio), Ti (titanio), W (wolframio) y otros metales usados en fabricación.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧩</span>
              <h3>Cultura general</h3>
              <p>Saber que Ag es plata, Au es oro o Hg es mercurio forma parte de la cultura científica básica. Los símbolos a menudo provienen del latín y tienen historia fascinante.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre los símbolos químicos</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Por qué el oro es Au y no Go?</h3>
              <p>El símbolo Au proviene del latín <em>aurum</em>, nombre clásico del oro. Muchos elementos cuyo símbolo no coincide con su nombre en español tienen origen latino o griego: Fe (ferrum = hierro), Pb (plumbum = plomo), Hg (hydrargyrum = mercurio).</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuántos elementos tiene la tabla periódica?</h3>
              <p>Actualmente la tabla periódica oficial de la IUPAC tiene 118 elementos, del hidrógeno (Z=1) al oganesón (Z=118). Los elementos del 1 al 94 se encuentran en la naturaleza; los restantes son artificiales.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Por qué el wolframio se llama así en español pero su símbolo es W?</h3>
              <p>El símbolo W viene del alemán <em>Wolfram</em>, nombre original del mineral wolframita del que se obtiene. En inglés se llama tungsten, pero el símbolo W se mantiene internacionalmente por tradición histórica.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué elementos tienen un solo carácter en su símbolo?</h3>
              <p>Hay 14 elementos con símbolo de una sola letra: H, B, C, N, O, F, P, S, K, V, Y, I, W y U. Son generalmente los más conocidos o los que se descubrieron antes de que se estableciera el sistema de dos letras.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué elemento es el más abundante en la Tierra?</h3>
              <p>En la corteza terrestre, el oxígeno (O) es el más abundante (~46{' '}%), seguido del silicio (Si, ~28{' '}%), el aluminio (Al, ~8{' '}%), el hierro (Fe, ~5{' '}%) y el calcio (Ca, ~4{' '}%).</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Hay elementos que se llaman igual en todos los idiomas?</h3>
              <p>Los elementos descubiertos más recientemente (del 104 en adelante) tienen nombres más uniformes internacionalmente. Pero los clásicos varían mucho: el wolframio en inglés es tungsten, el oro en inglés es gold (símbolo Au del latín aurum).</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuál es el elemento más pesado que existe en la naturaleza?</h3>
              <p>El plutonio (Pu, Z=94) es el elemento más pesado que se puede encontrar en la naturaleza (en trazas). El uranio (U, Z=92) es el más pesado que se halla de forma abundante. A partir del Z=95 todos son artificiales.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo se nombran los nuevos elementos?</h3>
              <p>La IUPAC (Unión Internacional de Química Pura y Aplicada) es la autoridad que aprueba los nombres. Normalmente se nombran en honor a lugares (germanio, americio), científicos (curio, einstenio) o propiedades del elemento.</p>
            </div>
          </div>
        </section>

        {/* Guía de estudio */}
        <section className={styles.guideSection}>
          <h2>Cómo memorizar los símbolos químicos: 6 estrategias</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>1</div>
              <h3>Empieza por los obvios</h3>
              <p>Aprende primero los que coinciden con su nombre: Ca (calcio), Ar (argón), Cr (cromo), Mn (manganeso). Son fáciles y construyen confianza.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>2</div>
              <h3>Estudia los "engañosos"</h3>
              <p>Memoriza los que no coinciden con su nombre español: Fe (hierro), Cu (cobre), Ag (plata), Au (oro), Hg (mercurio), Pb (plomo), Sn (estaño), K (potasio), Na (sodio), W (wolframio).</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>3</div>
              <h3>Usa el latín como guía</h3>
              <p>Aprender el nombre latino del elemento revela el origen del símbolo: Ferrum→Fe, Cuprum→Cu, Argentum→Ag, Aurum→Au, Hydrargyrum→Hg, Plumbum→Pb.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>4</div>
              <h3>Agrupa por familias</h3>
              <p>Estudia los grupos juntos: los halógenos (F, Cl, Br, I), los gases nobles (He, Ne, Ar, Kr, Xe), los metales alcalinos (Li, Na, K, Rb, Cs). Las familias comparten propiedades y es más fácil recordarlos en conjunto.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>5</div>
              <h3>Practica con quizzes diariamente</h3>
              <p>La repetición espaciada es la técnica más efectiva. 5-10 minutos al día durante una semana son más eficaces que estudiar 2 horas un único día.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>6</div>
              <h3>Revisa los errores</h3>
              <p>Al terminar cada quiz, revisa los elementos que has fallado. La app los muestra al final. Céntrate en esos hasta dominarlos antes de avanzar al siguiente nivel.</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 curiosidades fascinantes de los elementos</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💧</span>
              <h3>El mercurio es líquido</h3>
              <p>El mercurio (Hg) es el único metal que es líquido a temperatura ambiente. Su nombre latín <em>hydrargyrum</em> significa "plata líquida".</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔋</span>
              <h3>El litio en tu bolsillo</h3>
              <p>El litio (Li) está en la batería de tu teléfono, portátil y coche eléctrico. Es el metal sólido más ligero de la tabla periódica.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <h3>El wolframio aguanta el calor</h3>
              <p>El wolframio (W) tiene el punto de fusión más alto de todos los metales: 3422 °C. Por eso se usa en filamentos de bombillas y electrodos de soldadura.</p>
            </div>
            {/* Esta tarjeta hablaba OTRA VEZ del mercurio —misma etimología y misma liquidez
                que la primera— bajo un icono de radiactividad, que el mercurio no es, y con
                un titular sobre el dios y el planeta que su cuerpo no mencionaba. Se sustituye
                por lo que el quiz pregunta de verdad: los símbolos que no se parecen a su
                nombre en español (hallazgo 287 del Inspector). */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📜</span>
              <h3>Los símbolos que no se parecen al nombre</h3>
              {/* «Diez elementos…» era la cuenta de los símbolos que no casan con el nombre INGLÉS;
                  en español son más (azufre S y fósforo P, del nivel Fácil, también), y «son los
                  que más se fallan» no lo sostenía ningún dato: la app no registra fallos (1819). */}
              <p>Varios elementos llevan la inicial de su nombre en latín, no en español: sodio es Na (<em>natrium</em>), potasio K (<em>kalium</em>), hierro Fe (<em>ferrum</em>), cobre Cu (<em>cuprum</em>), plata Ag (<em>argentum</em>), oro Au (<em>aurum</em>), plomo Pb (<em>plumbum</em>) y estaño Sn (<em>stannum</em>). Hasta el azufre y el fósforo esconden el suyo: S de <em>sulfur</em> y P de <em>phosphorus</em>.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <h3>El helio se descubrió en el Sol</h3>
              <p>El helio (He) se descubrió primero en el Sol que en la Tierra: su nombre viene de <em>Helios</em> (dios griego del Sol). Es el segundo elemento más abundante del universo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪙</span>
              <h3>El oro no reacciona</h3>
              <p>El oro (Au) es uno de los metales menos reactivos. No se oxida, no se corroe y resiste casi cualquier ácido (excepto el agua regia). Por eso se ha usado como dinero durante milenios.</p>
            </div>
          </div>
        </section>

        {/* Warning box — errores comunes */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> 6 errores típicos al estudiar la tabla periódica</h2>
          <div className={styles.warningGrid}>
            <div className={styles.warningItem}>
              <strong>1. Confundir Na con N</strong>
              <p>N es nitrógeno (Z=7). Na es sodio (Z=11). Son muy diferentes: el primero es un gas esencial en el aire; el segundo, un metal alcalino que reacciona violentamente con el agua.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>2. Asumir que el símbolo siempre viene del nombre en español</strong>
              <p>Muchos símbolos vienen del latín o el alemán. Fe no tiene nada que ver con "hierro" en español, sino con <em>ferrum</em>. Conocer el origen ayuda a no equivocarse.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>3. Confundir Co (cobalto) con CO (monóxido de carbono)</strong>
              <p>Co (mayúscula y minúscula) es el símbolo del cobalto, un elemento. CO (dos mayúsculas: C de carbono y O de oxígeno) es la fórmula del monóxido de carbono, un compuesto. La segunda letra de un símbolo va siempre en minúscula: una mayúscula de más convierte un elemento en dos.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>4. Olvidar que K es potasio</strong>
              <p>K viene de <em>Kalium</em> (latín). Es uno de los más confusos porque "potasio" no da ninguna pista sobre la K. Se necesita memorización específica.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>5. Creer que todos los gases son nobles</strong>
              <p>H, N, O, F y Cl son gases a temperatura ambiente sin ser gases nobles; el bromo (Br) ni siquiera es un gas: funde a −7,2 °C y hierve a 58,8 °C, así que a 25 °C es LÍQUIDO, uno de los dos únicos que lo son junto con el mercurio. Los gases nobles (He, Ne, Ar, Kr, Xe, Rn) son el grupo 18.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>6. Estudiar sin contexto</strong>
              <p>Aprender símbolos de memoria sin saber para qué sirve el elemento hace que se olviden rápido. Asociar cada elemento a un uso cotidiano (Fe=hierro de construcción, Cu=cables eléctricos) mejora la retención.</p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-simbolos-quimicos')} />
      <ShareCard appName="quiz-simbolos-quimicos" />
      <Footer appName="quiz-simbolos-quimicos" />
    </div>
  );
}
