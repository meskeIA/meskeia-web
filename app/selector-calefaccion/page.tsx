'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorCalefaccion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularResultado,
  SISTEMAS,
  PREGUNTAS,
  RENDIMIENTO_AEROTERMIA,
  FUENTE_RENDIMIENTO,
  SIN_AYUDAS_CALDERAS_FOSILES,
  AYUDAS_RENOVABLES,
  AYUDAS_PROGRAMA_2021,
  AYUDAS_DONDE_MIRAR,
  type Resultado,
} from './motor';

// Los sistemas, las preguntas con sus pesos y la lógica de recomendación viven en ./motor.ts.

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorCalefaccion() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);

  // Al pulsar «Ver resultado» la sección del test se desmonta con el botón que tenía el foco, y
  // el foco caía a <body>: se lleva al encabezado del resultado (familia de selectores, forma g).
  useEffect(() => {
    if (pantalla === 'resultado') tituloResultado.current?.focus();
  }, [pantalla]);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('intro');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">🏠</span> Asesor de Calefacción</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro'
              ? '10 preguntas para saber qué sistema de calefacción te conviene'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm} ref={tituloResultado} tabIndex={-1}>Tu sistema de calefacción ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu vivienda y situación</p>
        </header>
      )}

      {/* Costes en euros, ayudas que convocan las comunidades autónomas y normativa europea:
          la metodología es universal, los datos de referencia son de España (hallazgo 1400). */}
      <RegionBadge variant="es-data" />

      <LegalNotice />
      <DisclaimerCard variant="financial" severity="critical" />

      {/* ── INTRO ── */}
      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🌡️</span>
              <span className={styles.introIcon}>⚡</span>
              <span className={styles.introIcon}>🔥</span>
              <span className={styles.introIcon}>🪵</span>
            </div>
            <h2 className={styles.introTitulo}>¿Aerotermia, gas o bomba de calor?</h2>
            <p className={styles.introDesc}>
              Elegir el sistema de calefacción es una decisión que afecta a tu confort y a tu factura durante muchos
              años. Este test analiza tu vivienda y tu situación real para orientarte entre cinco sistemas: aerotermia,
              bomba de calor (split), caldera de gas, pellet y radiadores eléctricos.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Sistema principal recomendado con alternativa</li>
              <li><span aria-hidden="true">✅</span> Coste de instalación y coste anual orientativo</li>
              <li><span aria-hidden="true">✅</span> Ventajas e inconvenientes del sistema recomendado y de la alternativa</li>
              <li><span aria-hidden="true">✅</span> Información sobre ayudas públicas y normativa europea</li>
              <li><span aria-hidden="true">✅</span> Consejos personalizados según tu situación</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── TEST ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              // Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS
              // (paso / total). aria-valuenow era el número de pregunta con mínimo 1, y un
              // lector de pantalla anunciaba otra fracción que la que se veía (mismo defecto
              // y misma reparación que selector-smartphone, hallazgo 951).
              aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={respuestas[preguntaActual.id] === op.valor}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={avanzar}
              disabled={!respuestas[preguntaActual.id]}
              aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
            >
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTADO ── */}
      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          {/* Recomendaciones */}
          <div className={`${styles.recomendacionGrid} ${resultado.sistemaAlternativa ? '' : styles.recomendacionGridUna}`}>
            <div className={styles.recomendacionCard}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{SISTEMAS[resultado.sistemaPrincipal].icon}</span>
              <p className={styles.recomendacionLabel}>
                {resultado.planificarSustitucion ? 'Para cuando sustituyas tu caldera' : 'Tu mejor opción'}
              </p>
              <p className={styles.recomendacionValor}>{SISTEMAS[resultado.sistemaPrincipal].nombre}</p>
              <p className={styles.recomendacionDesc}>{SISTEMAS[resultado.sistemaPrincipal].descripcion}</p>
            </div>
            {resultado.sistemaAlternativa && (
              <div className={`${styles.recomendacionCard} ${styles.recomendacionCardAlt}`}>
                <span className={styles.recomendacionIcon} aria-hidden="true">{SISTEMAS[resultado.sistemaAlternativa].icon}</span>
                <p className={styles.recomendacionLabel}>Alternativa a considerar</p>
                <p className={styles.recomendacionValor}>{SISTEMAS[resultado.sistemaAlternativa].nombre}</p>
                <p className={styles.recomendacionDesc}>{SISTEMAS[resultado.sistemaAlternativa].descripcion}</p>
              </div>
            )}
          </div>

          {/* Caldera de menos de 5 años: el sistema que gana es para cuando toque sustituirla, no
              una obra para ya; antes salía «Tu mejor opción» junto a «no tiene sentido cambiarla
              ahora» (hallazgo 1392). */}
          {resultado.planificarSustitucion && (
            <p className={styles.avisoRecorte} role="note">
              <span aria-hidden="true">🔄</span> Tu caldera de gas tiene menos de 5 años: lo habitual es
              conservarla mientras funcione bien. {SISTEMAS[resultado.sistemaPrincipal].nombre} es el sistema
              que mejor encaja con tu vivienda para cuando llegue el momento de sustituirla.
            </p>
          )}

          {/* Lo declarado como límite, dicho a la cara: presupuesto, unidad exterior o gas han
              apartado a los que iban por delante (hallazgos 1389, 1390 y 1391). */}
          {resultado.avisosDescarte.length > 0 && (
            <div className={styles.avisoRecorte} role="note">
              <p className={styles.avisoRecorteTitulo}>
                <span aria-hidden="true">⚠️</span> Ajustado a lo que has declarado
              </p>
              {resultado.avisosDescarte.map((a) => (
                <p key={a} className={styles.avisoRecorteItem}>{a}</p>
              ))}
            </div>
          )}

          {/* Un empate no se resuelve en silencio por el orden del código: antes lo ganaba
              siempre la aerotermia, que era la primera del array de puntuaciones. */}
          {resultado.empatados.length > 0 && (
            <p className={styles.avisoEmpate} role="note">
              <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
              {enumerar([resultado.sistemaPrincipal, ...resultado.empatados].map(k => SISTEMAS[k].conArticulo))}{' '}
              encajan exactamente igual; {resultado.criterioDesempate}.
            </p>
          )}

          {/* Costes */}
          <div className={styles.costesSection}>
            <p className={styles.costesTitulo}>Costes orientativos — {SISTEMAS[resultado.sistemaPrincipal].nombre}</p>
            <p className={styles.costesNota}>Horquillas orientativas para España (estimación de meskeIA). Varían según el equipo, el tamaño de la vivienda y el instalador.</p>
            <div className={styles.costesGrid}>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Instalación</p>
                <p className={styles.costeValor}>{SISTEMAS[resultado.sistemaPrincipal].costeInstalacion}</p>
              </div>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Coste anual</p>
                <p className={styles.costeValor}>{SISTEMAS[resultado.sistemaPrincipal].costeAnual}</p>
              </div>
              {/* Antes: «Vida útil 15 – 25 años», la misma cifra para los cinco sistemas y sin
                  fuente (hallazgo 1401). La refrigeración sí es propia de cada sistema. */}
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Refrigeración</p>
                <p className={styles.costeValor}>{SISTEMAS[resultado.sistemaPrincipal].refrigera ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Razones */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => (
              <p key={i} className={styles.razonItem}>{r}</p>
            ))}
          </div>

          {/* Ventajas e inconvenientes: la intro y la metadata los prometían y el motor los
              tenía, pero la pantalla no los pintaba (hallazgo 1393). */}
          <div className={styles.prosContrasGrid}>
            {[resultado.sistemaPrincipal, ...(resultado.sistemaAlternativa ? [resultado.sistemaAlternativa] : [])].map(k => (
              <div key={k} className={styles.prosContrasCard}>
                <h2 className={styles.prosContrasTitulo}>{SISTEMAS[k].nombre}</h2>
                <p className={styles.prosContrasSub}>Ventajas</p>
                <ul className={styles.prosLista}>
                  {SISTEMAS[k].pros.map(p => <li key={p}>{p}</li>)}
                </ul>
                <p className={styles.prosContrasSub}>Inconvenientes</p>
                <ul className={styles.contrasLista}>
                  {SISTEMAS[k].contras.map(c => <li key={c}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Ayudas: sin programas que no financian calefacción (MOVES, un «PERTE Industria
              Verde» inexistente), sin porcentajes sin fuente y sin anclar a 2025 (hallazgos
              1396 y 1398). El texto sale de las constantes del motor, las mismas del FAQPage. */}
          {resultado.subvenciones && (
            <div className={styles.subvencionesSection}>
              <p className={styles.subvencionesTitulo}><span aria-hidden="true">🏛️</span> Ayudas públicas</p>
              <p className={styles.subvencionesDesc}>
                {AYUDAS_RENOVABLES} {AYUDAS_PROGRAMA_2021} {AYUDAS_DONDE_MIRAR}
              </p>
              <p className={styles.subvencionesDesc}>
                Para una caldera de gas nueva no hay ayudas: {SIN_AYUDAS_CALDERAS_FOSILES}.
              </p>
            </div>
          )}

          {/* Consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de decidirte</p>
            {resultado.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>{c}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          <EducationalSection
            title="Guía completa: sistemas de calefacción en España"
            subtitle="Aerotermia, bomba de calor, gas, pellet y eléctrico explicados"
            defaultOpen={false}
          >
            <h3>El mapa de tecnologías</h3>
            <p>
              La calefacción en España está viviendo una transición acelerada. La normativa europea (Directiva de Eficiencia
              Energética de Edificios) obliga a que las nuevas instalaciones sean cada vez más eficientes, y desde 2025 ya no
              permite subvencionar calderas independientes de combustibles fósiles.
            </p>

            <h3>Aerotermia: la gran protagonista</h3>
            <p>
              La aerotermia es una bomba de calor aire-agua: extrae calor del aire exterior (incluso a temperaturas negativas)
              y lo transfiere al agua del circuito de calefacción. Rinde {RENDIMIENTO_AEROTERMIA} ({FUENTE_RENDIMIENTO}),
              algo menos cuanto más frío hace fuera y cuanto más caliente tiene que salir el agua. Puede alimentar
              radiadores, suelo radiante y producir agua caliente sanitaria.
            </p>
            <p>
              Su principal ventaja frente al gas es que el coste de la electricidad puede bajar aprovechando las horas más
              baratas de la tarifa y el autoconsumo solar, mientras que el gas natural está sujeto a la volatilidad de los
              mercados internacionales.
            </p>

            <h3>Bomba de calor (split): la opción intermedia</h3>
            <p>
              Los equipos de aire acondicionado invertido (splits) también funcionan como calefacción con buena eficiencia.
              Son más baratos de instalar que la aerotermia y no requieren conexión a radiadores. Ideales en zonas cálidas
              o como complemento en pisos donde no hay caldera.
            </p>

            <h3>Gas natural: cuándo tiene sentido mantenerlo</h3>
            <p>
              Si tu caldera de gas es reciente (menos de 5 años) y funciona bien, cambiarla ahora rara vez compensa. Lo
              sensato es planificar con qué la sustituirás cuando llegue el momento y comprobar entonces qué ayudas hay
              para ese sistema.
            </p>
            {/* Antes decía que la UE exige «mezcla con hidrógeno o biogás» a las calderas nuevas
                desde 2025 y que el gas tiene «menor apoyo de subvenciones». No existe esa
                obligación, y el apoyo no es menor: es nulo (hallazgo 1397). */}
            <div className={styles.warningBox}>
              <strong>Normativa europea:</strong> {SIN_AYUDAS_CALDERAS_FOSILES}, salvo las seleccionadas para inversión
              antes de 2025. La directiva no prohíbe instalarlas, pero pide a los Estados que vayan sustituyéndolas con
              planes nacionales. Sí pueden recibir ayudas, en proporción a su parte renovable, los sistemas híbridos, como
              una caldera combinada con una bomba de calor o con energía solar térmica (Comunicación de la Comisión
              Europea de octubre de 2024).
            </div>

            <h3>Pellet: la renovable más económica en zonas sin gas</h3>
            <p>
              En zonas rurales sin acceso a gas natural, el pellet es la opción renovable con menor coste energético por kWh.
              El pellet de madera tiene un precio estable y su producción es mayoritariamente nacional. Las calderas modernas
              tienen alimentación automática y rendimientos superiores al 90%.
            </p>

            {/* Antes: «Next Generation EU</strong>» y, en la línea siguiente, «canalizados»: el
                salto de línea de JSX se comía el espacio (hallazgo 1402). Ahora es una sola cadena. */}
            <h3>Cómo buscar ayudas públicas</h3>
            <p>
              {AYUDAS_RENOVABLES} {AYUDAS_PROGRAMA_2021} {AYUDAS_DONDE_MIRAR}
            </p>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-calefaccion')} />
      <ShareCard appName="selector-calefaccion" />
      <Footer appName="selector-calefaccion" />
    </div>
  );
}
