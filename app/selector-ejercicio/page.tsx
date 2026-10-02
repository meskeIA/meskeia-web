'use client';

import React, { useEffect, useRef, useState, type MouseEvent } from 'react';
import styles from './SelectorEjercicio.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularResultado, PREGUNTAS, EJERCICIOS, CON_ARTICULO, type Resultado } from './motor';

// Las preguntas con sus pesos, las fichas de cada actividad y la lógica viven en ./motor.ts.

type Pantalla = 'inicio' | 'test' | 'resultado';

/** Hueco que deja arriba la barra fija del logo; igual que el scroll-margin-top del CSS. */
const MARGEN_LOGO = 80;

/**
 * Lleva `bloque` al principio de la pantalla (respetando su scroll-margin-top) solo si `clave`
 * no se ve entera: tapada por la barra del logo, por encima del borde o por debajo del final.
 * Mismo criterio que quiz-literatura-universal (hallazgo 2507).
 */
function traerALaVista(bloque: HTMLElement | null, clave: HTMLElement | null) {
  if (!bloque || !clave) return;
  const r = clave.getBoundingClientRect();
  if (r.top >= MARGEN_LOGO && r.bottom <= window.innerHeight) return;
  bloque.scrollIntoView({ block: 'start', behavior: 'auto' });
}

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorEjercicio() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const cabeceraResultado = useRef<HTMLElement>(null);
  const bloqueTest = useRef<HTMLDivElement>(null);
  const enunciado = useRef<HTMLHeadingElement>(null);
  const bloqueInicio = useRef<HTMLDivElement>(null);
  const tituloInicio = useRef<HTMLHeadingElement>(null);
  /** Solo al VOLVER a la intro («Repetir el test»): en la carga de la página el foco no se toca. */
  const volviendoRef = useRef(false);

  // Al cambiar de pantalla o de pregunta se desmonta o se desactiva el botón que tenía el foco
  // («Empezar», «Siguiente» ante la pregunta nueva sin responder, «Anterior» en la 1, «Ver
  // resultado», «Repetir»), y el foco caía a <body>: el Tab siguiente salía del cuestionario y,
  // en móvil, la página se quedaba donde estaba el botón, con el enunciado nuevo fuera de la
  // vista o bajo la barra del logo (hallazgo 2684, la forma del 1680 de selector-smartphone).
  // Se lleva al enunciado de la pregunta, al encabezado del resultado o al título de la intro,
  // y si no se ve entero se desplaza su bloque bajo la barra.
  useEffect(() => {
    if (pantalla === 'resultado') {
      traerALaVista(cabeceraResultado.current, tituloResultado.current);
      tituloResultado.current?.focus({ preventScroll: true });
    } else if (pantalla === 'test') {
      traerALaVista(bloqueTest.current, enunciado.current);
      enunciado.current?.focus({ preventScroll: true });
    } else if (volviendoRef.current) {
      volviendoRef.current = false;
      traerALaVista(bloqueInicio.current, tituloInicio.current);
      tituloInicio.current?.focus({ preventScroll: true });
    }
  }, [pantalla, paso]);

  /**
   * Doble clic y dos toques seguidos (hallazgos 2682 y 2683; receta de quiz-literatura-universal,
   * 2507). «Empezar», «Siguiente», «Anterior», «Ver resultado» y «Repetir» cambian la pantalla en
   * el primer toque; la pregunta nueva tiene otro número de opciones (7, 4, 3…), la tarjeta
   * cambia de alto bajo el dedo y el segundo toque caía sobre lo que hubiera debajo: contestaba
   * la pregunta siguiente, devolvía a la anterior o abría una app relacionada y se perdía todo lo
   * respondido. Un doble clic es UNA intención, así que un clic se ignora cuando cumple dos cosas:
   *   · es el 2.º (o 3.º…) de una ráfaga: `detail` > 1. Lo cuenta el navegador (clics seguidos en
   *     el mismo sitio), no un temporizador de la app; con teclado o lector de pantalla es 0;
   *   · y el clic ANTERIOR aceptado en la página cambió de pantalla. Sin esta condición, marcar
   *     una opción y tocar «Siguiente» deprisa —dos toques cercanos, que Chrome también cuenta
   *     como ráfaga— se comería el «Siguiente», que sí era una intención nueva.
   * Se escucha en `window`, en captura, y no solo en cada botón: el segundo toque podía caer en
   * un ENLACE (las apps relacionadas), que no pasa por ningún manejador de la app. El clic
   * ignorado no toca el registro: el 3.º de una ráfaga se ignora igual que el 2.º.
   */
  const ultimoCambioPantallaRef = useRef(false);
  useEffect(() => {
    const filtrar = (e: globalThis.MouseEvent) => {
      if (e.detail > 1 && ultimoCambioPantallaRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      // Clic aceptado: si cambia de pantalla, su manejador lo anota justo después.
      ultimoCambioPantallaRef.current = false;
    };
    window.addEventListener('click', filtrar, true);
    return () => window.removeEventListener('click', filtrar, true);
  }, []);
  const anotarCambioPantalla = () => {
    ultimoCambioPantallaRef.current = true;
  };

  const totalPreguntas = PREGUNTAS.length;
  const preguntaActual = PREGUNTAS[paso];
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  /**
   * Teclado del patrón de radios (WAI-ARIA APG): las flechas mueven el foco a la opción vecina y
   * la marcan, con vuelta al principio, e Inicio/Fin van a los extremos. El grupo es UNA parada de
   * Tab (tabindex itinerante). Antes cada opción era una parada y las flechas no hacían nada
   * (hallazgo 2685, la forma del 1681 de selector-smartphone).
   */
  function teclaEnOpcion(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = preguntaActual.opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = total - 1;
    else return;
    e.preventDefault();
    seleccionarOpcion(preguntaActual.opciones[destino].valor);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  }

  function empezar() {
    anotarCambioPantalla();
    setPantalla('test');
  }

  // Avanza a la pregunta SIGUIENTE A LA PULSADA (`paso + 1` del render, no `p => p + 1`) y solo
  // si esta está respondida: dos clics antes de repintar no saltan una pregunta.
  function avanzar(e: MouseEvent<HTMLButtonElement>) {
    if (!respuestas[preguntaActual.id] || e.currentTarget.disabled) return;
    anotarCambioPantalla();
    if (paso < totalPreguntas - 1) {
      setPaso(paso + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso === 0) return;
    anotarCambioPantalla();
    setPaso(paso - 1);
  }

  function reiniciar() {
    anotarCambioPantalla();
    volviendoRef.current = true;
    setPantalla('inicio');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  /**
   * Las situaciones que aconsejan pasar por el médico ANTES de empezar. El test no pregunta por
   * ninguna, así que el aviso no puede vivir solo dentro de la guía, que nace plegada (hallazgo
   * 2691; CLAUDE.md: nunca ocultar una advertencia de responsabilidad en <EducationalSection>).
   * Se ve al empezar y junto al resultado.
   */
  const avisoMedico = (
    <div className={styles.warningBox} role="note">
      <strong>Consulta con un médico antes de iniciar ejercicio si:</strong> llevas más de 2 años
      sin actividad física regular, tienes más de 45 años y no has hecho ejercicio recientemente,
      tienes diagnóstico de hipertensión, diabetes, problemas cardíacos o articulares, has sufrido
      una lesión en el último año, o sientes dolores en el pecho, mareos o falta de aliento durante
      actividades cotidianas. El test no pregunta por ninguna de estas situaciones, así que su
      orientación no las tiene en cuenta.
    </div>
  );

  const ejercicioActual = resultado ? EJERCICIOS[resultado.ejercicio] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué ejercicio te conviene?</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'inicio'
              ? 'Encuentra el deporte que encaja con tu cuerpo, tiempo y motivación'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados} ref={cabeceraResultado}>
          <h1 className={styles.heroTitleSm} ref={tituloResultado} tabIndex={-1}>Tu ejercicio recomendado</h1>
          <p className={styles.heroSubtitleSm}>{ejercicioActual?.nombre ?? ''}</p>
        </header>
      )}

      {/* Costes y tramos de presupuesto en euros: la metodología es universal, los datos de
          referencia son de España (hallazgo 1387; selector-mascota, 1340). */}
      <RegionBadge variant="es-data" />

      <LegalNotice />
      <DisclaimerCard variant="medical" severity="high" />

      {/* ── Pantalla de inicio ── */}
      {pantalla === 'inicio' && (
        <div className={styles.introContainer} ref={bloqueInicio}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏃</span>
              <span className={styles.introIcon}>🏋️</span>
              <span className={styles.introIcon}>🏊</span>
              <span className={styles.introIcon}>🚴</span>
            </div>
            <h2 className={styles.introTitulo} ref={tituloInicio} tabIndex={-1}>Encuentra tu deporte ideal</h2>
            <p className={styles.introDesc}>
              El que encaja con tu cuerpo, tu tiempo y tu motivación. Este test analiza tus objetivos,
              disponibilidad, condición física y presupuesto para orientarte hacia el ejercicio
              que puedas mantener a largo plazo, no solo el que suena bien en teoría.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Tipo de ejercicio recomendado con perfil concreto</li>
              <li><span aria-hidden="true">✅</span> Frecuencia, coste y cómo empezar</li>
              <li><span aria-hidden="true">✅</span> Beneficios clave y equipamiento necesario</li>
              <li><span aria-hidden="true">✅</span> Consejos prácticos para mantener la constancia</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={empezar}>
              Empezar el test →
            </button>
          </div>
          {avisoMedico}
        </div>
      )}

      {/* ── Pantalla de test ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer} ref={bloqueTest}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Progreso del test: pregunta ${paso + 1} de ${totalPreguntas}`}
              // Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS
              // (paso / total). aria-valuenow era el número de pregunta con mínimo 1, y un
              // lector de pantalla anunciaba otra fracción que la que se veía (mismo defecto
              // y misma reparación que selector-smartphone, hallazgo 951).
              aria-valuenow={paso}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto} ref={enunciado} tabIndex={-1}>{preguntaActual.texto}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map((op, indice) => (
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
                  // Tabindex itinerante: la marcada, o la primera si no hay ninguna (2685).
                  tabIndex={
                    respuestas[preguntaActual.id]
                      ? respuestas[preguntaActual.id] === op.valor ? 0 : -1
                      : indice === 0 ? 0 : -1
                  }
                  onKeyDown={e => teclaEnOpcion(e, indice)}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={retroceder}
              disabled={paso === 0}
              aria-label="Pregunta anterior"
            >
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

      {/* ── Pantalla de resultado ── */}
      {pantalla === 'resultado' && resultado && ejercicioActual && (
        <div className={styles.resultadosContainer}>

          {/* Tarjeta principal */}
          <div className={styles.recomendacionCard}>
            <span className={styles.recomendacionIcon} aria-hidden="true">{ejercicioActual.icono}</span>
            <p className={styles.recomendacionLabel}>Tu ejercicio recomendado</p>
            <p className={styles.recomendacionValor}>{ejercicioActual.nombre}</p>
            <p className={styles.recomendacionPerfil}>{ejercicioActual.perfil}</p>
            <p className={styles.recomendacionDesc}>{ejercicioActual.descripcion}</p>
          </div>

          {/* Lo declarado como límite, dicho a la cara: la limitación física, «En casa, sin
              salir», el presupuesto o el tiempo han apartado a las que iban por delante
              (hallazgos 1378-1382). */}
          {resultado.avisosDescarte.length > 0 && (
            <div className={styles.avisoRecorte} role="note">
              <p className={styles.avisoRecorteTitulo}>
                <span aria-hidden="true">⚠️</span> Ajustado a lo que has declarado
              </p>
              {resultado.avisosDescarte.map(a => (
                <p key={a} className={styles.avisoRecorteItem}>{a}</p>
              ))}
            </div>
          )}

          {/* Un empate no se resuelve en silencio por el orden del objeto: antes lo ganaba
              siempre el gimnasio, que era el primero. Pasa en uno de cada cuatro perfiles. */}
          {resultado.empatados.length > 0 && (
            <p className={styles.avisoEmpate} role="note">
              <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
              {enumerar([resultado.ejercicio, ...resultado.empatados].map(k => CON_ARTICULO[k]))}{' '}
              encajan exactamente igual; {resultado.criterioDesempate}.
            </p>
          )}

          {resultado.aTenerEnCuenta.length > 0 && (
            <div className={styles.aTenerSection}>
              <p className={styles.aTenerTitulo}>A tener en cuenta con tus respuestas</p>
              {resultado.aTenerEnCuenta.map(t => (
                <p key={t} className={styles.aTenerItem}>{t}</p>
              ))}
            </div>
          )}

          {/* Stats grid: frecuencia, inicio, coste */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Frecuencia</p>
              <p className={styles.statValor}>{ejercicioActual.frecuencia}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Cómo empezar</p>
              <p className={styles.statValor}>{ejercicioActual.inicio}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Coste estimado</p>
              <p className={styles.statValor}>{ejercicioActual.coste}</p>
            </div>
          </div>

          {/* Sección de beneficios */}
          <div className={styles.beneficiosSection}>
            <p className={styles.beneficiosTitulo}>Beneficios clave</p>
            {ejercicioActual.beneficios.map((b, i) => (
              <p key={i} className={styles.beneficioItem}>{b}</p>
            ))}
          </div>

          {/* Sección de equipamiento */}
          <div className={styles.equipoSection}>
            <p className={styles.equipoTitulo}>Equipamiento necesario</p>
            {ejercicioActual.equipo.map((e, i) => (
              <p key={i} className={styles.equipoItem}>{e}</p>
            ))}
          </div>

          {/* Sección de consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Consejos para empezar bien</p>
            {ejercicioActual.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>{c}</p>
            ))}
          </div>

          {/* Aviso de salud, a la vista (2691) */}
          {avisoMedico}
          <div className={styles.warningBox}>
            Esta herramienta es orientativa. Si tienes otras condiciones de salud o lesiones previas, consulta
            con un médico o fisioterapeuta antes de iniciar cualquier programa deportivo.
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>
        </div>
      )}

      {/* Sección educativa v2.0: montada en TODAS las pantallas, para que esté en el HTML servido
          y la vea también quien no termina el test (hallazgo 2688). */}
      <div className={styles.guiaContainer}>
        <EducationalSection
          title="Guía completa: ejercicio físico para adultos en España"
          subtitle="Beneficios, hábito deportivo, constancia y cuándo consultar con un profesional"
          defaultOpen={false}
        >
          <h3>Beneficios del ejercicio regular para la salud</h3>
          <p>
            La actividad física regular reduce significativamente el riesgo de enfermedades cardiovasculares,
            diabetes tipo 2, obesidad, ciertos tipos de cáncer y problemas de salud mental. La OMS recomienda
            al menos 150-300 minutos de actividad moderada a la semana para adultos. No es necesario llegar
            al rendimiento de un atleta: cualquier movimiento regular aporta beneficios demostrados.
          </p>

          <h3>Cómo crear el hábito deportivo</h3>
          <p>
            El mayor obstáculo no es la falta de tiempo ni de dinero: es la formación del hábito. Un estudio que
            siguió a 96 personas durante 12 semanas (Lally y colaboradores, European Journal of Social Psychology,
            2010) estimó que una conducta nueva repetida a diario tardaba en volverse automática en torno a 66 días,
            con enormes diferencias entre personas: de 18 a 254 días. Las conductas de ejercicio tardaron más que las
            de comer o beber, y saltarse un día suelto no cambió el proceso. Cada participante repetía su conducta en
            un mismo contexto (por ejemplo, «después del desayuno»), y los autores propusieron que es esa repetición
            en un contexto estable la que la vuelve automática: de ahí la idea de vincular el ejercicio a algo que ya
            haces cada día (despertarte, ducharte, volver del trabajo).
          </p>
          <p>
            Empieza con sesiones más cortas de lo que crees necesario. Es mejor entrenar 15 minutos todos los días
            que planificar 1 hora y no presentarte. El objetivo en los primeros 3 meses es instalar el hábito, no
            obtener el máximo rendimiento.
          </p>

          <h3>Por qué la constancia importa más que la intensidad</h3>
          {/* «La sobreexigencia al inicio es la principal causa de abandono y lesión» se retiró: no
              tenía fuente y contradecía las que cita la ficha de running (hallazgo 2693). */}
          <p>
            El cuerpo humano responde mucho mejor a estímulos regulares y moderados que a esfuerzos esporádicos
            y extremos. Entrenar al 70 % de tu capacidad cinco días a la semana produce adaptaciones fisiológicas
            superiores a entrenar al 100 % una vez por semana. Si vienes de una lesión, la prudencia del
            principio cuenta todavía más: en la carrera, haber tenido otra lesión en los últimos 12 meses es el
            factor de riesgo que más se repite en los estudios de seguimiento (Saragiotto et al., 2014).
          </p>
          <p>
            El descanso forma parte del entrenamiento: es durante la recuperación cuando el músculo crece y el
            sistema cardiovascular se adapta. Respetar los días de descanso no es pereza, es entrenamiento inteligente.
          </p>

          <h3>Combinaciones de ejercicio recomendadas</h3>
          <p>
            Los profesionales de la salud recomiendan combinar tres tipos de actividad: ejercicio cardiovascular
            (mejora corazón y resistencia), entrenamiento de fuerza (masa muscular y metabolismo basal) y
            trabajo de flexibilidad/movilidad (prevención de lesiones y calidad de vida). No es necesario
            practicar tres deportes distintos: muchas actividades cubren varios aspectos a la vez, como la
            natación o el entrenamiento funcional.
          </p>
          <p>
            Una combinación práctica para la mayoría de adultos: 2-3 sesiones de cardio + 2 sesiones de fuerza
            + estiramientos al acabar cada sesión. Esto cabe en 4-5 horas semanales y cubre prácticamente todas
            las recomendaciones de salud.
          </p>

          <h3>Cuándo consultar con un médico antes de empezar</h3>
          <p>
            Las situaciones que aconsejan pasar antes por consulta (mucho tiempo sin actividad, un diagnóstico
            cardíaco, de hipertensión, diabetes o articular, una lesión reciente, o dolor en el pecho, mareos o
            falta de aliento en la vida diaria) están en el aviso que acompaña al principio del test y a su resultado.
          </p>
          <p>
            Un médico puede indicarte qué tipos de ejercicio son adecuados para tu situación, establecer
            límites de frecuencia cardíaca y derivarte a un fisioterapeuta o preparador físico especializado
            si lo necesitas. Esta inversión inicial previene lesiones graves y te permite progresar con seguridad.
          </p>
        </EducationalSection>
      </div>

      <ShareCard appName="selector-ejercicio" />
      <RelatedApps apps={getRelatedApps('selector-ejercicio')} />
      <Footer appName="selector-ejercicio" />
    </div>
  );
}
