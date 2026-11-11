'use client';
// @disclaimer: exempt

import { useEffect, useRef, useState } from 'react';
import styles from './TestEstiloParental.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { enfocarALaVista } from '@/lib';
import { ESTILOS_PARENTALES } from '@/data/estilos-parentales';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'control' | 'afecto';
  polaridad: 'positivo' | 'negativo'; // positivo = alto, negativo = bajo
}

// ─── Preguntas del test ────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  // Control/Exigencia (8 preguntas)
  { id: 1, texto: 'Cuando mi hijo/a no cumple una norma, siempre hay una consecuencia clara', dimension: 'control', polaridad: 'positivo' },
  { id: 2, texto: 'Establezco horarios fijos para comer, dormir y hacer deberes', dimension: 'control', polaridad: 'positivo' },
  { id: 3, texto: 'Si mi hijo/a quiere algo que no es adecuado, le explico por qué no puede ser', dimension: 'control', polaridad: 'positivo' },
  { id: 4, texto: 'Creo que los niños necesitan normas firmes para sentirse seguros', dimension: 'control', polaridad: 'positivo' },
  { id: 5, texto: 'Dejo que mi hijo/a decida cosas que aún no le corresponden por su edad', dimension: 'control', polaridad: 'negativo' },
  { id: 6, texto: 'Prefiero evitar los conflictos y cedo con frecuencia', dimension: 'control', polaridad: 'negativo' },
  { id: 7, texto: 'No suelo insistir mucho si mi hijo/a se niega a hacer algo', dimension: 'control', polaridad: 'negativo' },
  { id: 8, texto: 'Las rutinas en casa son bastante flexibles y cambian según el día', dimension: 'control', polaridad: 'negativo' },

  // Afecto/Responsividad (8 preguntas)
  { id: 9, texto: 'Dedico tiempo cada día a hablar con mi hijo/a sobre cómo le ha ido', dimension: 'afecto', polaridad: 'positivo' },
  { id: 10, texto: 'Cuando mi hijo/a llora o se enfada, intento entender qué siente antes de actuar', dimension: 'afecto', polaridad: 'positivo' },
  { id: 11, texto: 'Le digo a mi hijo/a con frecuencia que le quiero', dimension: 'afecto', polaridad: 'positivo' },
  { id: 12, texto: 'Celebro sus logros, por pequeños que sean', dimension: 'afecto', polaridad: 'positivo' },
  { id: 13, texto: 'Me cuesta mostrar cariño con gestos (abrazos, caricias)', dimension: 'afecto', polaridad: 'negativo' },
  { id: 14, texto: 'Me resulta difícil expresar mis emociones abiertamente', dimension: 'afecto', polaridad: 'negativo' },
  { id: 15, texto: 'Cuando mi hijo/a me cuenta un problema, tiendo a quitarle importancia', dimension: 'afecto', polaridad: 'negativo' },
  { id: 16, texto: 'Creo que los niños se espabilan solos si les dejas', dimension: 'afecto', polaridad: 'negativo' },
];

const OPCIONES_LIKERT = [
  { valor: 1, texto: 'Muy en desacuerdo' },
  { valor: 2, texto: 'En desacuerdo' },
  { valor: 3, texto: 'Neutral' },
  { valor: 4, texto: 'De acuerdo' },
  { valor: 5, texto: 'Muy de acuerdo' },
];

// ─── Funciones de cálculo ──────────────────────────────────────────────────────

/**
 * Cada dimensión es la suma de sus cuatro ítems positivos menos la de los cuatro negativos (las dos
 * van de 4 a 20) más 16: de 0 a 32, con el punto medio en 16. Hasta el 11/11/2026 se sumaba 20 y
 * se mostraba «sobre 40», aunque la escala iba de 4 a 36 (hallazgo 4492).
 */
const ESCALA = 32;
const MEDIO = 16;

function calcularPuntuaciones(respuestas: Record<number, number>): { control: number; afecto: number } {
  const controlPositivo = (respuestas[1] ?? 0) + (respuestas[2] ?? 0) + (respuestas[3] ?? 0) + (respuestas[4] ?? 0);
  const controlNegativo = (respuestas[5] ?? 0) + (respuestas[6] ?? 0) + (respuestas[7] ?? 0) + (respuestas[8] ?? 0);
  const control = controlPositivo - controlNegativo + MEDIO;

  const afectoPositivo = (respuestas[9] ?? 0) + (respuestas[10] ?? 0) + (respuestas[11] ?? 0) + (respuestas[12] ?? 0);
  const afectoNegativo = (respuestas[13] ?? 0) + (respuestas[14] ?? 0) + (respuestas[15] ?? 0) + (respuestas[16] ?? 0);
  const afecto = afectoPositivo - afectoNegativo + MEDIO;

  return { control, afecto };
}

type Nivel = 'alto' | 'bajo';

/**
 * El punto medio exacto no es ni alto ni bajo: no se asigna. Hasta el 11/11/2026 contaba como
 * «bajo», y contestar lo mismo a las 16 preguntas daba «Negligente», con su recomendación de acudir
 * a servicios sociales (hallazgo 4491).
 */
function nivelDe(valor: number): Nivel | null {
  if (valor > MEDIO) return 'alto';
  if (valor < MEDIO) return 'bajo';
  return null;
}

function estiloDe(control: Nivel, afecto: Nivel): string {
  if (control === 'alto') return afecto === 'alto' ? 'democratico' : 'autoritario';
  return afecto === 'alto' ? 'permisivo' : 'negligente';
}

/** Los estilos posibles: uno solo, o los dos (o cuatro) entre los que queda un punto medio. */
function estilosPosibles(control: number, afecto: number): string[] {
  const nc = nivelDe(control);
  const na = nivelDe(afecto);
  const niveles: Nivel[] = ['alto', 'bajo'];
  const controles = nc ? [nc] : niveles;
  const afectos = na ? [na] : niveles;
  return controles.flatMap((c) => afectos.map((a) => estiloDe(c, a)));
}

const NOMBRE_CORTO: Record<string, string> = {
  democratico: 'Democrático',
  autoritario: 'Autoritario',
  permisivo: 'Permisivo',
  negligente: 'Negligente',
};

// ─── Componente principal ──────────────────────────────────────────────────────

export default function TestEstiloParentalPage(): React.JSX.Element {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  // Adónde va el foco tras «Ver mi resultado» o «Repetir test»: el botón pulsado se desmonta, y sin
  // esto el foco caía a <body> y la vista volvía al principio de la página (hallazgos 4498 y 4501).
  const [destinoFoco, setDestinoFoco] = useState<{ a: 'resultado' | 'test'; n: number } | null>(null);
  const resultadoRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!destinoFoco) return;
    enfocarALaVista(destinoFoco.a === 'resultado' ? resultadoRef.current : introRef.current);
  }, [destinoFoco]);

  const totalRespondidas = Object.keys(respuestas).length;
  const todasRespondidas = totalRespondidas === 16;
  const faltan = 16 - totalRespondidas;
  const textoBoton = todasRespondidas
    ? 'Ver mi resultado'
    : faltan === 1
      ? 'Responde la pregunta que falta'
      : `Responde las ${faltan} preguntas restantes`;

  const handleRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  const handleVerResultado = () => {
    if (todasRespondidas) {
      setMostrarResultado(true);
      setDestinoFoco((previo) => ({ a: 'resultado', n: (previo?.n ?? 0) + 1 }));
    }
  };

  const handleRepetir = () => {
    setRespuestas({});
    setMostrarResultado(false);
    setDestinoFoco((previo) => ({ a: 'test', n: (previo?.n ?? 0) + 1 }));
  };

  // Calcular puntuaciones
  const { control, afecto } = calcularPuntuaciones(respuestas);
  const posibles = estilosPosibles(control, afecto);
  const estiloData = posibles.length === 1 ? ESTILOS_PARENTALES.find((e) => e.id === posibles[0]) : undefined;
  const nombrePerfil = estiloData
    ? estiloData.nombre
    : posibles.length === 4
      ? 'Sin tendencia predominante'
      : `Entre ${NOMBRE_CORTO[posibles[0]]} y ${NOMBRE_CORTO[posibles[1]]}`;
  const dimensionesEnMedio = [
    control === MEDIO ? 'control' : null,
    afecto === MEDIO ? 'afecto' : null,
  ].filter((d): d is string => d !== null);

  // Posición del punto en el cuadrante, en la misma escala de 0 a 32 que las cifras: 0 → 5 %,
  // 16 → 50 % (el centro), 32 → 95 %. El margen del 5 % deja un extremo dentro de su cuadrante,
  // en vez de partido por la esquina (el contenedor recorta lo que sale).
  const posicion = (valor: number) => 5 + (Math.min(ESCALA, Math.max(0, valor)) / ESCALA) * 90;
  const dotX = posicion(control);
  const dotY = 100 - posicion(afecto); // invertido: Y alto = arriba

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">👨‍👩‍👧‍👦</span> Test de Estilo Parental
          </h1>
          <p className={styles.subtitle}>
            Descubre tu tendencia educativa con este test de autoconocimiento
          </p>
        </header>

      {/* «global», no «es-data»: la app no usa ningún dato de España (hallazgo 4495). */}
      <RegionBadge variant="global" />


        <LegalNotice />


        {/* ─── RESULTADO ─── */}
        {mostrarResultado && (
          <div className={styles.resultScreen}>
            <div className={styles.resultHeader}>
              <div className={styles.resultIcon} aria-hidden="true">{estiloData ? estiloData.icono : '⚖️'}</div>
              <h2 className={styles.resultTitle} ref={resultadoRef} tabIndex={-1}>Tu tendencia predominante</h2>
              <p className={styles.resultProfile}>{nombrePerfil}</p>
            </div>

            {/* Cuadrante 2D: derecha = más control, arriba = más afecto. Hasta el 11/11/2026 los
                rótulos Autoritario y Permisivo estaban intercambiados (hallazgo 4490). */}
            <div className={styles.quadrantWrapper}>
              <div className={styles.axisLabelY}>Alto afecto</div>
              <div className={styles.quadrantContainer}>
                <div className={`${styles.quadrant} ${styles.quadrantPermisivo}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">🫶</span>
                    <span className={styles.quadrantName}>Permisivo</span>
                  </div>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantDemocratico}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">🤝</span>
                    <span className={styles.quadrantName}>Democrático</span>
                  </div>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantNegligente}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">😶</span>
                    <span className={styles.quadrantName}>Negligente</span>
                  </div>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantAutoritario}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">👊</span>
                    <span className={styles.quadrantName}>Autoritario</span>
                  </div>
                </div>

                <div className={styles.axisX} />
                <div className={styles.axisY} />

                <div
                  className={styles.userDot}
                  style={{ left: `${dotX}%`, top: `${dotY}%` }}
                  role="img"
                  aria-label={`Tu posición: Control ${control} de ${ESCALA}, Afecto ${afecto} de ${ESCALA}`}
                />
              </div>
              <div className={styles.axisLabelY}>Bajo afecto</div>
              <div className={styles.axisLabelX}>
                <span>Bajo control</span>
                <span>Alto control</span>
              </div>
            </div>

            {/* Puntuaciones */}
            <div className={styles.scoresRow}>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>Control / Exigencia</span>
                <span className={styles.scoreValue}>{control}/{ESCALA}</span>
              </div>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>Afecto / Responsividad</span>
                <span className={styles.scoreValue}>{afecto}/{ESCALA}</span>
              </div>
            </div>

            {!estiloData && (
              <div className={styles.styleCard}>
                <p>
                  Tu puntuación de {dimensionesEnMedio.join(' y de ')} está justo en el punto medio de la
                  escala ({MEDIO} de {ESCALA}): el test no puede decir si tiende a alta o a baja, así que no
                  te asigna un estilo. Puede que combines rasgos de varios estilos, o que tus respuestas
                  dependan mucho de la situación.
                </p>
              </div>
            )}

            {/* Tarjeta del estilo */}
            {estiloData && (
            <div className={styles.styleCard}>
              <h3><span aria-hidden="true">{estiloData.icono}</span> {estiloData.nombre}</h3>
              <p>{estiloData.descripcion}</p>

              <h4 className={styles.characteristicsTitle}>Características</h4>
              <ul className={styles.characteristicsList}>
                {estiloData.caracteristicas.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>

              <div className={styles.impactBox}>
                <h4>Impacto en los hijos</h4>
                <p>{estiloData.impactoHijos}</p>
              </div>

              <div className={styles.recommendationBox}>
                <h4>Recomendación</h4>
                <p>{estiloData.recomendacion}</p>
              </div>
            </div>
            )}

            <div className={styles.noteBox}>
              La mayoría de padres y madres combinan elementos de varios estilos.
              Este resultado refleja tu <strong>tendencia predominante</strong>, no una etiqueta fija.
            </div>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleRepetir}
            >
              Repetir test
            </button>
          </div>
        )}

        {/* ─── TEST ─── */}
        {!mostrarResultado && (
          <>
            <p className={styles.introText} ref={introRef} tabIndex={-1}>
              No hay respuestas correctas ni incorrectas. Responde según lo que realmente haces,
              no lo que crees que deberías hacer.
            </p>

            {/* Progreso */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(totalRespondidas / 16) * 100}%` }}
              />
            </div>
            <p className={styles.progressText}>{totalRespondidas} de 16 preguntas respondidas</p>

            {/* Preguntas */}
            {PREGUNTAS.map((pregunta) => (
              <div key={pregunta.id} className={styles.questionCard}>
                <span className={styles.questionNumber} id={`pregunta-${pregunta.id}-numero`}>
                  Pregunta {pregunta.id} de 16
                </span>
                <p className={styles.questionText} id={`pregunta-${pregunta.id}-texto`}>{pregunta.texto}</p>
                {/* El grupo se nombra con el número y el enunciado: con solo «Pregunta N», quien llegaba
                    con Tab no oía la afirmación que valora (hallazgo 4497). */}
                <div
                  className={styles.likertScale}
                  role="radiogroup"
                  aria-labelledby={`pregunta-${pregunta.id}-numero pregunta-${pregunta.id}-texto`}
                >
                  {OPCIONES_LIKERT.map((opcion) => (
                    <button
                      type="button"
                      key={opcion.valor}
                      className={`${styles.likertOption} ${respuestas[pregunta.id] === opcion.valor ? styles.selected : ''}`}
                      onClick={() => handleRespuesta(pregunta.id, opcion.valor)}
                      role="radio"
                      aria-checked={respuestas[pregunta.id] === opcion.valor ? 'true' : 'false'}
                      aria-label={opcion.texto}
                    >
                      {opcion.texto}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Botón ver resultado */}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleVerResultado}
              disabled={!todasRespondidas}
            >
              {textoBoton}
            </button>
          </>
        )}

        {/* ─── CONTENIDO EDUCATIVO v2.0 ─── */}
        <EducationalSection
          title="Los 4 estilos parentales: guía completa"
          subtitle="Modelo de Baumrind (1966) y Maccoby & Martin (1983)"
        >
          {/* Los 4 estilos explicados */}
          <section className={styles.guideSection}>
            <h2>Los 4 estilos parentales</h2>
            <div className={styles.contentGrid}>
              {ESTILOS_PARENTALES.map((estilo) => (
                <div key={estilo.id} className={styles.contentCard}>
                  <h4><span aria-hidden="true">{estilo.icono}</span> {estilo.nombre}</h4>
                  <p>
                    <strong>Control:</strong> {estilo.control === 'alto' ? 'Alto' : 'Bajo'} |{' '}
                    <strong>Afecto:</strong> {estilo.afecto === 'alto' ? 'Alto' : 'Bajo'}
                  </p>
                  <p>{estilo.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tabla comparativa */}
          <section className={styles.comparativaSection}>
            <h2>Comparativa de los 4 estilos</h2>
            <p className={styles.comparativaSubtitle}>
              Resumen de las diferencias clave entre cada estilo parental
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th><span aria-hidden="true">🤝</span> Democrático</th>
                    <th><span aria-hidden="true">👊</span> Autoritario</th>
                    <th><span aria-hidden="true">🫶</span> Permisivo</th>
                    <th><span aria-hidden="true">😶</span> Negligente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Control</strong></td>
                    <td>Alto (flexible)</td>
                    <td>Alto (rígido)</td>
                    <td>Bajo</td>
                    <td>Bajo</td>
                  </tr>
                  <tr>
                    <td><strong>Afecto</strong></td>
                    <td>Alto</td>
                    <td>Bajo</td>
                    <td>Alto</td>
                    <td>Bajo</td>
                  </tr>
                  <tr>
                    <td><strong>Comunicación</strong></td>
                    <td>Bidireccional</td>
                    <td>Unidireccional</td>
                    <td>Permisiva</td>
                    <td>Escasa</td>
                  </tr>
                  <tr>
                    <td><strong>Normas</strong></td>
                    <td>Claras con explicación</td>
                    <td>Rígidas sin negociación</td>
                    <td>Pocas o inconsistentes</td>
                    <td>Ausentes</td>
                  </tr>
                  <tr>
                    <td><strong>Impacto en autoestima</strong></td>
                    <td>Positivo</td>
                    <td>Puede ser negativo</td>
                    <td>Variable</td>
                    <td>Negativo</td>
                  </tr>
                  <tr>
                    <td><strong>Recomendación</strong></td>
                    <td>Mantener coherencia</td>
                    <td>Incorporar escucha</td>
                    <td>Añadir límites claros</td>
                    <td>Buscar apoyo profesional</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios reales */}
          <section className={styles.escenariosSection}>
            <h2>Escenarios de la vida real</h2>
            <p className={styles.escenariosSubtitle}>
              Cómo influye el contexto familiar en el estilo parental
            </p>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                  <h3>Padres que trabajan a jornada completa</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Ambos progenitores trabajan. Poco tiempo entre semana. Cansancio acumulado. A veces cuesta sostener las normas al final del día.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Qué ayuda:</strong> Tener poco tiempo no define un estilo: el afecto y las normas se
                  pueden sostener también con horarios largos o con el cuidado compartido con otras personas.
                  Establecer 3-4 normas clave (no negociables) y ser consistente ayuda más que intentar controlar todo.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💔</span>
                  <h3>Padres separados</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Custodia compartida. Normas diferentes en cada casa. El niño aprende a "negociar" entre ambos.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Clave:</strong> Intentar acordar normas básicas comunes (horarios, pantallas, deberes).
                  No compensar con permisividad el tiempo que no se pasa con el hijo. La coherencia entre casas es más valiosa que cualquier regalo.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
                  <h3>Abuelos como cuidadores principales</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Los abuelos cuidan al niño muchas horas. Su estilo puede diferir del de los padres. El niño recibe mensajes contradictorios.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Agradecer su implicación y pactar las normas más importantes. Los abuelos tienen
                  un papel afectivo valioso, pero conviene que refuercen las mismas reglas básicas que los padres.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👶</span>
                  <h3>Padres primerizos</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Primer hijo. Mucha información contradictoria. Inseguridad sobre qué estilo es el "correcto". Presión social.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Tranquilidad:</strong> No existe el padre perfecto. Los niños necesitan padres
                  suficientemente buenos, no perfectos. Confiar en el sentido común, pedir ayuda cuando
                  sea necesario y recordar que el vínculo afectivo es la base de todo.
                </p>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿Puedo cambiar mi estilo parental?</summary>
                <p>
                  Sí, absolutamente. El estilo parental no es un rasgo fijo de personalidad, sino un conjunto de
                  hábitos que se pueden modificar con consciencia y práctica. Muchos padres evolucionan desde un
                  estilo autoritario (heredado de su propia crianza) hacia uno más democrático al informarse y
                  reflexionar. El primer paso es precisamente este: ser consciente de tu tendencia actual.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué pasa si los dos progenitores tienen estilos diferentes?</summary>
                <p>
                  Es muy común y no tiene por qué ser un problema si las diferencias son pequeñas. Lo importante
                  es acordar las normas fundamentales (horarios, pantallas, educación). Pequeñas diferencias en
                  el estilo pueden incluso enriquecer al niño. Lo perjudicial es la contradicción abierta
                  (un progenitor permite lo que el otro prohíbe sistemáticamente).
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿La cultura influye en el estilo parental?</summary>
                <p>
                  Sí. Lo que se considera "autoritario" en Escandinavia puede ser la norma en otras culturas.
                  El modelo de Baumrind se formuló y se estudió sobre todo con familias de EE. UU. Varios
                  estudios en otros países sugieren que la combinación de afecto y estructura (estilo
                  democrático) se asocia a buenos resultados en muchos contextos, pero ningún estilo funciona
                  igual en todas las culturas ni en todas las familias.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿El estilo debe cambiar según la edad del hijo?</summary>
                <p>
                  Sí. Con niños pequeños (0-6) es normal más control directo. En la preadolescencia (9-12)
                  conviene ir cediendo autonomía progresivamente. En la adolescencia (13-18) el estilo
                  democrático funciona especialmente bien: mantener las normas importantes pero negociar
                  y explicar, dando cada vez más espacio para sus propias decisiones.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Ser democrático significa no castigar nunca?</summary>
                <p>
                  No. El estilo democrático incluye consecuencias, pero estas son proporcionales, coherentes
                  y se explican. La diferencia con el autoritario es que aquí el niño entiende el porqué
                  de la consecuencia y tiene oportunidad de expresar su punto de vista. No se trata de
                  ausencia de límites, sino de límites con explicación y afecto.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Este test es válido científicamente?</summary>
                <p>
                  Este test es una herramienta de autoconocimiento orientativa basada en el modelo
                  científico de Diana Baumrind (1966), ampliado por Maccoby y Martin (1983). No es un
                  instrumento clínico validado. Para una evaluación profesional del estilo parental,
                  consulta con un psicólogo especializado en familia.
                </p>
              </details>
            </div>
          </section>

          {/* Consejos para acercarse al estilo democrático */}
          <section className={styles.tipsSection}>
            <h2>Claves para un estilo más democrático</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">👂</span>
                <h3>Escucha activa</h3>
                <p>
                  Antes de responder, repite lo que tu hijo ha dicho con tus propias palabras.
                  Sentirse escuchado reduce conflictos y fortalece el vínculo.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📋</span>
                <h3>Normas claras y pocas</h3>
                <p>
                  Mejor 5 normas firmes y consistentes que 20 normas que nadie recuerda.
                  Escríbelas y ponlas en un lugar visible.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💬</span>
                <h3>Explica el porqué</h3>
                <p>
                  "Porque lo digo yo" genera obediencia a corto plazo pero resentimiento.
                  Explicar la razón enseña a pensar y a interiorizar valores.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🤗</span>
                <h3>Afecto visible</h3>
                <p>
                  Di "te quiero" a diario. Los niños necesitan oírlo aunque "ya lo sepan".
                  El afecto explícito es la base de la seguridad emocional.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <h3>Consecuencias, no castigos</h3>
                <p>
                  La consecuencia es lógica y proporcional ("no recoges, no puedes jugar").
                  El castigo es arbitrario ("te quedas sin postre porque sí").
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <h3>Coherencia entre adultos</h3>
                <p>
                  Si los adultos se contradicen, el niño aprende a manipular.
                  Acordar las normas básicas entre todos los cuidadores es esencial.
                </p>
              </div>
            </div>
          </section>

          {/* Warning Box - Mitos */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Mitos sobre la crianza que conviene desterrar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>"Ser estricto es mejor que ser blando".</strong> Buena parte de la investigación
                sobre este modelo asocia la combinación de firmeza y afecto (estilo democrático) a
                mejores resultados que la rigidez pura o la permisividad. No se trata de elegir entre ser duro o blando, sino de
                encontrar el equilibrio.
              </li>
              <li>
                <strong>"Los niños necesitan mano dura".</strong> Los niños necesitan límites, pero
                los límites funcionan mejor cuando se explican y se aplican con respeto. La "mano dura"
                genera obediencia por miedo, no por comprensión.
              </li>
              <li>
                <strong>"Si le doy muchos abrazos, será débil".</strong> Exactamente al contrario.
                Los niños con apego seguro (mucho afecto) desarrollan mayor resiliencia,
                independencia y capacidad para afrontar adversidades.
              </li>
              <li>
                <strong>"Mi padre me educó así y yo salí bien".</strong> Cada generación tiene más
                conocimiento sobre desarrollo infantil. Que algo "funcionara" no significa que fuera
                óptimo. Siempre se puede mejorar sin juzgar cómo nos educaron a nosotros.
              </li>
              <li>
                <strong>"El estilo parental no importa, es genética".</strong> La genética influye
                en el temperamento, y el ambiente familiar también influye en las habilidades
                sociales, la regulación emocional y el rendimiento académico. Ambos factores interactúan.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="test-estilo-parental" />
        <Footer appName="test-estilo-parental" />
    </div>
  );
}
