'use client';

import { useState } from 'react';
import styles from './SelectorModalidadTrabajo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================================
// TIPOS
// ============================================================

type ModalidadId =
  | 'presencial'
  | 'remoto_total'
  | 'hibrido'
  | 'coworking'
  | 'nomada_digital';

interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<ModalidadId, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  icono: string;
  opciones: Opcion[];
}

interface Modalidad {
  id: ModalidadId;
  titulo: string;
  icono: string;
  descripcion: string;
  detalles: string[];
}

// ============================================================
// DATOS
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cómo rindes mejor en cuanto a interacción social?',
    icono: '🤝',
    opciones: [
      {
        texto: 'Necesito ver a mis compañeros a diario para sentirme motivado',
        icono: '👥',
        pesos: { presencial: 3, hibrido: 1 },
      },
      {
        texto: 'Me va bien combinar días con gente y días de silencio total',
        icono: '⚖️',
        pesos: { hibrido: 3, coworking: 1 },
      },
      {
        texto: 'Prefiero el contacto social esporádico, principalmente digital',
        icono: '💻',
        pesos: { remoto_total: 2, coworking: 2, nomada_digital: 1 },
      },
      {
        texto: 'Soy muy autónomo y el entorno físico me es indiferente',
        icono: '🧭',
        pesos: { remoto_total: 2, nomada_digital: 3 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿Cómo describirías mejor tu tipo de trabajo diario?',
    icono: '💼',
    opciones: [
      {
        texto: 'Muy colaborativo: reuniones, coordinación constante con equipo',
        icono: '🗣️',
        pesos: { presencial: 3, hibrido: 2 },
      },
      {
        texto: 'Mixto: algunas reuniones pero también bloques de trabajo individual',
        icono: '🔀',
        pesos: { hibrido: 3, remoto_total: 1 },
      },
      {
        texto: 'Principalmente individual con comunicación asíncrona',
        icono: '🖥️',
        pesos: { remoto_total: 3, nomada_digital: 2 },
      },
      {
        texto: 'Trabajo por proyectos con diferentes clientes o equipos puntuales',
        icono: '📋',
        pesos: { coworking: 3, nomada_digital: 2, remoto_total: 1 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿Cuentas con un espacio adecuado en casa para trabajar?',
    icono: '🏠',
    opciones: [
      {
        texto: 'Sí, tengo despacho propio con buena conexión y silencio garantizado',
        icono: '✅',
        pesos: { remoto_total: 3, nomada_digital: 1 },
      },
      {
        texto: 'Tengo un rincón de trabajo, pero no siempre es ideal',
        icono: '🪑',
        pesos: { hibrido: 2, coworking: 2 },
      },
      {
        texto: 'No, mi casa no permite trabajar cómodamente',
        icono: '❌',
        pesos: { presencial: 2, coworking: 3 },
      },
      {
        texto: 'Prefiero no depender de un espacio fijo en absoluto',
        icono: '🌍',
        pesos: { nomada_digital: 3, coworking: 1 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Hay otras personas en casa durante tu jornada laboral?',
    icono: '👨‍👩‍👧',
    opciones: [
      {
        texto: 'Sí, pareja y/o hijos en casa todo el día, mucho ruido',
        icono: '🔊',
        pesos: { presencial: 3, coworking: 3 },
      },
      {
        texto: 'A veces, pero tengo cierto control sobre el entorno',
        icono: '🎚️',
        pesos: { hibrido: 2, coworking: 1 },
      },
      {
        texto: 'Generalmente estoy solo/a en casa durante el día',
        icono: '🤫',
        pesos: { remoto_total: 3, nomada_digital: 1 },
      },
      {
        texto: 'Mi entorno doméstico varía constantemente (viajes, cambios)',
        icono: '✈️',
        pesos: { nomada_digital: 3, coworking: 2 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Qué importancia le das a separar el espacio de trabajo del hogar?',
    icono: '🚪',
    opciones: [
      {
        texto: 'Fundamental: necesito salir de casa para "entrar en modo trabajo"',
        icono: '🏢',
        pesos: { presencial: 3, coworking: 2 },
      },
      {
        texto: 'Importante, pero con rutinas puedo gestionarlo en casa',
        icono: '⏰',
        pesos: { hibrido: 2, remoto_total: 2 },
      },
      {
        texto: 'No me afecta especialmente, trabajo igual en cualquier entorno',
        icono: '🧘',
        pesos: { remoto_total: 2, nomada_digital: 3 },
      },
      {
        texto: 'Prefiero un espacio neutro fuera de casa pero sin oficina fija',
        icono: '☕',
        pesos: { coworking: 3, nomada_digital: 2 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Estarías dispuesto/a a cambiar de ciudad o viajar frecuentemente?',
    icono: '🗺️',
    opciones: [
      {
        texto: 'No, tengo raíces claras y no quiero moverme',
        icono: '🏡',
        pesos: { presencial: 3, remoto_total: 2 },
      },
      {
        texto: 'Podría hacer algún viaje puntual pero con base fija',
        icono: '🧳',
        pesos: { hibrido: 2, coworking: 2 },
      },
      {
        texto: 'Me gustaría tener flexibilidad geográfica dentro de España',
        icono: '🇪🇸',
        pesos: { remoto_total: 2, coworking: 2, nomada_digital: 1 },
      },
      {
        texto: 'Sí, quiero trabajar desde distintos países sin ataduras',
        icono: '🌐',
        pesos: { nomada_digital: 4, remoto_total: 1 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Tu trabajo requiere presencia física en instalaciones concretas?',
    icono: '🔬',
    opciones: [
      {
        texto: 'Sí, necesito hardware, laboratorio, maquinaria o atención directa',
        icono: '🛠️',
        pesos: { presencial: 5 },
      },
      {
        texto: 'A veces, para reuniones clave o uso puntual de instalaciones',
        icono: '📅',
        pesos: { hibrido: 4, presencial: 1 },
      },
      {
        texto: 'Raramente, solo para actos presenciales muy ocasionales',
        icono: '🗓️',
        pesos: { remoto_total: 2, nomada_digital: 2 },
      },
      {
        texto: 'No, todo mi trabajo es digital y se hace en cualquier lugar',
        icono: '☁️',
        pesos: { remoto_total: 3, nomada_digital: 3, coworking: 1 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿Qué importancia tiene la flexibilidad horaria para ti?',
    icono: '🕐',
    opciones: [
      {
        texto: 'Prefiero horario fijo: me ayuda a estructurar el día',
        icono: '📌',
        pesos: { presencial: 3, hibrido: 1 },
      },
      {
        texto: 'Me va bien tener cierta flexibilidad dentro de un horario amplio',
        icono: '📊',
        pesos: { hibrido: 3, remoto_total: 1 },
      },
      {
        texto: 'Valoro mucho la flexibilidad: trabajo cuando soy más productivo/a',
        icono: '🌅',
        pesos: { remoto_total: 3, nomada_digital: 2, coworking: 1 },
      },
      {
        texto: 'Necesito flexibilidad total, incluyendo zonas horarias distintas',
        icono: '🌏',
        pesos: { nomada_digital: 4, remoto_total: 2 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Cómo valoras tu nivel de autodisciplina para trabajar sin supervisión?',
    icono: '🧠',
    opciones: [
      {
        texto: 'Bajo: me cuesta concentrarme si nadie supervisa el progreso',
        icono: '😓',
        pesos: { presencial: 4 },
      },
      {
        texto: 'Medio: funciono bien con objetivos claros pero necesito estructura',
        icono: '📝',
        pesos: { hibrido: 3, presencial: 1 },
      },
      {
        texto: 'Alto: me organizo solo/a, cumplo plazos sin necesitar control externo',
        icono: '💪',
        pesos: { remoto_total: 3, coworking: 2 },
      },
      {
        texto: 'Muy alto: soy completamente autónomo/a y gestiono mis propios proyectos',
        icono: '🚀',
        pesos: { nomada_digital: 4, remoto_total: 2, coworking: 1 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Cuánta importancia tiene el networking presencial en tu sector?',
    icono: '🤜',
    opciones: [
      {
        texto: 'Crítico: mi carrera depende de relaciones construidas en persona',
        icono: '🌟',
        pesos: { presencial: 3, hibrido: 2 },
      },
      {
        texto: 'Importante, asisto a eventos y reuniones pero no es diario',
        icono: '📆',
        pesos: { hibrido: 3, coworking: 2 },
      },
      {
        texto: 'Moderado: combino contactos digitales con algún encuentro puntual',
        icono: '📱',
        pesos: { remoto_total: 2, coworking: 2, nomada_digital: 1 },
      },
      {
        texto: 'Bajo: trabajo en nichos digitales donde el networking es mayormente online',
        icono: '💬',
        pesos: { remoto_total: 2, nomada_digital: 3 },
      },
    ],
  },
];

const MODALIDADES: Record<ModalidadId, Modalidad> = {
  presencial: {
    id: 'presencial',
    titulo: 'Trabajo Presencial en Oficina',
    icono: '🏢',
    descripcion:
      'Tu perfil indica que rindes mejor con estructura externa, interacción constante y una separación clara entre vida personal y profesional. La oficina te da el ambiente de trabajo que necesitas para mantenerte enfocado/a y conectado/a con tu equipo.',
    detalles: [
      'Alta interacción social y trabajo colaborativo',
      'Necesitas separación física entre hogar y trabajo',
      'Tu autodisciplina mejora con estructura y supervisión',
      'El networking presencial es clave en tu trayectoria',
    ],
  },
  remoto_total: {
    id: 'remoto_total',
    titulo: 'Teletrabajo Total',
    icono: '🏡',
    descripcion:
      'Tu perfil encaja con la máxima flexibilidad y autonomía. Tienes alta autodisciplina, un espacio adecuado en casa y tu trabajo es principalmente individual o asíncrono. El teletrabajo total te permite optimizar tu rendimiento en el entorno que tú eliges.',
    detalles: [
      'Alta autonomía y autodisciplina demostrada',
      'Trabajo individual o asíncrono predominante',
      'Espacio doméstico adecuado para trabajar',
      'Flexibilidad horaria como valor prioritario',
    ],
  },
  hibrido: {
    id: 'hibrido',
    titulo: 'Modelo Híbrido',
    icono: '🔀',
    descripcion:
      'Lo mejor de los dos mundos: presencia en la oficina cuando la colaboración importa, teletrabajo cuando necesitas concentración. Tu perfil equilibra la necesidad de interacción social con la productividad individual, haciendo del híbrido tu modalidad natural.',
    detalles: [
      'Equilibrio entre trabajo colaborativo e individual',
      'Valoras la flexibilidad sin renunciar al contacto social',
      'Puedes trabajar desde casa pero también necesitas la oficina',
      'Combinas networking presencial con productividad remota',
    ],
  },
  coworking: {
    id: 'coworking',
    titulo: 'Coworking',
    icono: '☕',
    descripcion:
      'Ambiente de trabajo profesional fuera de casa sin atarte a una empresa. El coworking es ideal para freelances, autónomos y trabajadores remotos que necesitan separar el hogar del trabajo, disfrutar de comunidad esporádica y tener una base fija desde la que operar.',
    detalles: [
      'Necesitas salir de casa para rendir pero no quieres oficina corporativa',
      'Perfil freelance, autónomo o trabajador remoto con empresa',
      'Valoras la comunidad de otros profesionales independientes',
      'Base geográfica fija con flexibilidad horaria',
    ],
  },
  nomada_digital: {
    id: 'nomada_digital',
    titulo: 'Nómada Digital',
    icono: '🌍',
    descripcion:
      'La libertad geográfica total es tu prioridad. Tu trabajo es completamente digital, tienes una autodisciplina muy alta y el entorno físico no limita tu productividad. El estilo de vida nómada digital te permite trabajar desde cualquier lugar del mundo mientras exploras nuevos destinos.',
    detalles: [
      'Trabajo 100 % digital sin requisito de presencia física',
      'Máxima autodisciplina y gestión de proyectos propia',
      'Disposición real a cambiar de entorno y zona horaria',
      'Flexibilidad total como valor de vida, no solo laboral',
    ],
  },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SelectorModalidadTrabajoPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [puntuaciones, setPuntuaciones] = useState<Record<ModalidadId, number>>({
    presencial: 0,
    remoto_total: 0,
    hibrido: 0,
    coworking: 0,
    nomada_digital: 0,
  });

  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaActual = respuestas[preguntaActual];
  const progresoPorcentaje = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  // Seleccionar una opción
  const seleccionarOpcion = (indiceOpcion: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = indiceOpcion;
    setRespuestas(nuevasRespuestas);
  };

  // Siguiente pregunta
  const siguientePregunta = () => {
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      calcularResultado();
    }
  };

  // Pregunta anterior
  const preguntaAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  // Calcular resultado
  const calcularResultado = () => {
    const pts: Record<ModalidadId, number> = {
      presencial: 0,
      remoto_total: 0,
      hibrido: 0,
      coworking: 0,
      nomada_digital: 0,
    };

    respuestas.forEach((indiceRespuesta, indicePregunta) => {
      if (indiceRespuesta === null) return;
      const opcion = PREGUNTAS[indicePregunta].opciones[indiceRespuesta];
      (Object.entries(opcion.pesos) as [ModalidadId, number][]).forEach(([modalidad, peso]) => {
        pts[modalidad] += peso;
      });
    });

    setPuntuaciones(pts);
    setMostrarResultado(true);
  };

  // Reiniciar
  const reiniciar = () => {
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setMostrarResultado(false);
    setPuntuaciones({
      presencial: 0,
      remoto_total: 0,
      hibrido: 0,
      coworking: 0,
      nomada_digital: 0,
    });
  };

  // Obtener modalidad ganadora
  const modalidadGanadora = (): ModalidadId => {
    return (Object.entries(puntuaciones) as [ModalidadId, number][]).reduce(
      (max, [id, pts]) => (pts > puntuaciones[max] ? id : max),
      'presencial' as ModalidadId
    );
  };

  // Puntuación máxima para normalizar barras
  const maxPuntuacion = Math.max(...Object.values(puntuaciones), 1);

  // Nombres cortos para las barras
  const nombresCortos: Record<ModalidadId, string> = {
    presencial: 'Presencial',
    remoto_total: 'Remoto',
    hibrido: 'Híbrido',
    coworking: 'Coworking',
    nomada_digital: 'Nómada',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🖥️</span> Selector de Modalidad de Trabajo</h1>
        <p>
          Responde 10 preguntas y descubre si tu perfil encaja mejor con el trabajo presencial,
          teletrabajo, modelo híbrido, coworking o estilo de vida nómada digital.
        </p>
      </header>

      <LegalNotice />

      {!mostrarResultado ? (
        /* ---- QUIZ ---- */
        <div className={styles.quiz}>
          <div className={styles.progresoBar} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={PREGUNTAS.length} aria-label="Progreso del test">
            <div
              className={styles.progresoRelleno}
              style={{ width: `${progresoPorcentaje}%` }}
            />
          </div>

          <p className={styles.contadorPreguntas}>
            Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
          </p>

          <div className={styles.pregunta}>
            <p className={styles.preguntaTexto}>
              <span className={styles.preguntaIcono} aria-hidden="true">{pregunta.icono}</span>
              {pregunta.texto}
            </p>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${respuestaActual === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={respuestaActual === idx}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                  <span className={styles.opcionTexto}>{opcion.texto}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            {preguntaActual > 0 ? (
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={preguntaAnterior}
              >
                ← Anterior
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={siguientePregunta}
              disabled={respuestaActual === null}
            >
              {preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente →' : 'Ver mi modalidad ideal'}
            </button>
          </div>
        </div>
      ) : (
        /* ---- RESULTADO ---- */
        <div className={styles.resultado}>
          <div className={styles.resultadoCard} role="region" aria-label="Tu resultado">
            <span className={styles.resultadoIcono} aria-hidden="true">
              {MODALIDADES[modalidadGanadora()].icono}
            </span>
            <h2 className={styles.resultadoTitulo}>
              {MODALIDADES[modalidadGanadora()].titulo}
            </h2>
            <p className={styles.resultadoDescripcion}>
              {MODALIDADES[modalidadGanadora()].descripcion}
            </p>

            <ul style={{ textAlign: 'left', maxWidth: '480px', margin: '0 auto', paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              {MODALIDADES[modalidadGanadora()].detalles.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>

            {/* Barras de puntuación */}
            <div className={styles.puntuacionesGrid} aria-label="Puntuaciones por modalidad">
              {(Object.entries(puntuaciones) as [ModalidadId, number][]).map(([id, pts]) => {
                const esGanadora = id === modalidadGanadora();
                return (
                  <div
                    key={id}
                    className={`${styles.puntuacionItem} ${esGanadora ? styles.puntuacionItemDestacado : ''}`}
                  >
                    <p className={`${styles.puntuacionLabel} ${esGanadora ? styles.puntuacionLabelDestacado : ''}`}>
                      <span aria-hidden="true">{MODALIDADES[id].icono}</span> {nombresCortos[id]}
                    </p>
                    <div className={styles.puntuacionBarra}>
                      <div
                        className={styles.puntuacionRelleno}
                        style={{ width: `${(pts / maxPuntuacion) * 100}%` }}
                      />
                    </div>
                    <p className={styles.puntuacionValor}>{pts} pts</p>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
            >
              Repetir el test
            </button>
          </div>
        </div>
      )}

      <DisclaimerCard variant="general" severity="high" />

      <EducationalSection
        title="Modalidades de trabajo en España"
        subtitle="Encuentra el equilibrio entre productividad y bienestar"
      >
        <section className={styles.seccionEducativa}>
          <h2>Las 5 modalidades de trabajo en España</h2>
          <p>
            El mercado laboral español ha experimentado una transformación profunda desde 2020.
            La Ley del Teletrabajo (Ley 10/2021) reguló el trabajo a distancia y reconoció el
            derecho de los trabajadores a solicitar acuerdos de teletrabajo. Hoy conviven cinco
            modalidades principales, cada una con ventajas y retos distintos.
          </p>

          <div className={styles.tarjetasComparacion}>
            <div className={styles.tarjetaModalidad}>
              <h4><span aria-hidden="true">🏢</span> Presencial</h4>
              <p>Asistencia diaria a la oficina. Máxima interacción y estructura. Ideal cuando el trabajo requiere colaboración física o acceso a instalaciones.</p>
            </div>
            <div className={styles.tarjetaModalidad}>
              <h4><span aria-hidden="true">🏡</span> Remoto total</h4>
              <p>100 % desde casa u otros espacios. Requiere alta autodisciplina y entorno doméstico adecuado. Máxima flexibilidad geográfica y horaria.</p>
            </div>
            <div className={styles.tarjetaModalidad}>
              <h4><span aria-hidden="true">🔀</span> Híbrido</h4>
              <p>Combinación de días en oficina y días en remoto. El modelo más extendido en grandes empresas españolas tras la pandemia.</p>
            </div>
            <div className={styles.tarjetaModalidad}>
              <h4><span aria-hidden="true">☕</span> Coworking</h4>
              <p>Espacio compartido de trabajo fuera de casa y de la empresa. Popular entre freelances, autónomos y trabajadores remotos que necesitan ambiente profesional.</p>
            </div>
            <div className={styles.tarjetaModalidad}>
              <h4><span aria-hidden="true">🌍</span> Nómada digital</h4>
              <p>Trabajo desde distintos países o ciudades de forma periódica. Requiere trabajo 100 % digital, autonomía total y planificación fiscal específica.</p>
            </div>
          </div>
        </section>

        <section className={styles.seccionEducativa}>
          <h2>Factores clave para elegir tu modalidad</h2>

          <h3>1. Perfil de trabajo</h3>
          <p>
            El tipo de tareas que realizas es el factor más determinante. Si tu trabajo requiere
            acceso a maquinaria, atención directa a clientes o colaboración en tiempo real, la
            modalidad presencial o híbrida es prácticamente obligatoria. Si tu trabajo es
            completamente digital —programación, diseño, redacción, consultoría— tienes libertad
            para elegir cualquier modalidad.
          </p>

          <h3>2. Entorno doméstico</h3>
          <p>
            Un despacho propio con silencio garantizado facilita el teletrabajo total. Si en tu
            casa hay ruido, interrupciones frecuentes o espacio insuficiente, el coworking o el
            modelo híbrido pueden compensar estas limitaciones sin renunciar a la flexibilidad.
          </p>

          <h3>3. Autodisciplina y organización personal</h3>
          <p>
            El teletrabajo y la vida nómada requieren alta capacidad de autogestión. Sin la
            estructura que impone el entorno de oficina, es necesario establecer rutinas sólidas,
            técnicas de gestión del tiempo (Pomodoro, time-blocking) y límites claros entre
            vida laboral y personal.
          </p>

          <h3>4. Aspectos legales y fiscales</h3>
          <p>
            Los trabajadores por cuenta ajena en teletrabajo tienen derecho a compensación de
            gastos (art. 12 Ley 10/2021). Los nómadas digitales en España pueden acogerse al
            régimen especial de residentes internacionales (Ley Beckham modificada en 2023).
            Los autónomos en coworking pueden deducir el gasto como oficina de trabajo.
          </p>

          <div className={styles.warningBox}>
            <p>
              <strong>Nota importante:</strong> Para decisiones laborales con implicaciones
              contractuales, fiscales o de Seguridad Social, consulta siempre con un asesor
              laboral o gestor especializado. La normativa sobre teletrabajo y nómadas digitales
              evoluciona con frecuencia.
            </p>
          </div>
        </section>

        <section className={styles.seccionEducativa}>
          <h2>El modelo híbrido: el más extendido en España</h2>
          <p>
            Según datos de IESE y Randstad, más del 60 % de las empresas españolas con más de
            50 empleados aplica alguna forma de modelo híbrido desde 2022. La tendencia más
            habitual es de 2-3 días en oficina y 2-3 días en remoto por semana.
          </p>
          <p>
            Las empresas valoran la presencia para cultura corporativa, formación de equipos y
            reuniones estratégicas. Los empleados priorizan el teletrabajo para tareas de
            concentración y conciliación familiar. El híbrido permite a ambas partes obtener
            lo que más valoran.
          </p>

          <h3>Claves para el éxito en el modelo híbrido</h3>
          <ul>
            <li>Define qué tipos de tareas haces en casa y cuáles en oficina</li>
            <li>Establece rituales de entrada y salida del trabajo en casa</li>
            <li>Comunica tu disponibilidad con claridad al equipo</li>
            <li>Aprovecha los días de oficina para reuniones y colaboración</li>
            <li>Reserva los días remotos para trabajo de alta concentración</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-modalidad-trabajo')} />
      <ShareCard appName="selector-modalidad-trabajo" />
      <Footer appName="selector-modalidad-trabajo" />
    </div>
  );
}
