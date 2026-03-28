'use client';

import { useState } from 'react';
import styles from './SelectorGestionEstres.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos ──────────────────────────────────────────────────────────────────
type MetodoEstres =
  | 'meditacion'
  | 'ejercicio'
  | 'terapia'
  | 'hobbies'
  | 'desconexion_digital';

type Pesos = Record<MetodoEstres, number>;

interface Opcion {
  texto: string;
  icono: string;
  pesos: Pesos;
}

interface Pregunta {
  id: number;
  enunciado: string;
  opciones: Opcion[];
}

// ── Datos del test ─────────────────────────────────────────────────────────
const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    enunciado: '¿Cuál es la principal fuente de tu estrés?',
    opciones: [
      {
        texto: 'El trabajo: plazos, responsabilidades o la carga laboral',
        icono: '💼',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 2, hobbies: 1, desconexion_digital: 1 },
      },
      {
        texto: 'Asuntos personales o familiares (conflictos, duelos, cambios)',
        icono: '👨‍👩‍👧',
        pesos: { meditacion: 2, ejercicio: 1, terapia: 3, hobbies: 2, desconexion_digital: 0 },
      },
      {
        texto: 'Las interacciones sociales, la presión del entorno o las redes sociales',
        icono: '📱',
        pesos: { meditacion: 2, ejercicio: 1, terapia: 2, hobbies: 2, desconexion_digital: 3 },
      },
      {
        texto: 'La sensación de que todo pasa muy rápido y no paro nunca',
        icono: '⏱️',
        pesos: { meditacion: 3, ejercicio: 2, terapia: 1, hobbies: 1, desconexion_digital: 2 },
      },
    ],
  },
  {
    id: 2,
    enunciado: '¿Cuál de estos síntomas reconoces más en ti cuando estás estresado/a?',
    opciones: [
      {
        texto: 'Insomnio o dificultad para desconectar por la noche',
        icono: '😴',
        pesos: { meditacion: 3, ejercicio: 2, terapia: 1, hobbies: 2, desconexion_digital: 3 },
      },
      {
        texto: 'Tensión muscular, dolor de cabeza o contracturas',
        icono: '🤕',
        pesos: { meditacion: 2, ejercicio: 3, terapia: 1, hobbies: 1, desconexion_digital: 1 },
      },
      {
        texto: 'Irritabilidad, impaciencia o cambios de humor frecuentes',
        icono: '😤',
        pesos: { meditacion: 2, ejercicio: 3, terapia: 2, hobbies: 2, desconexion_digital: 1 },
      },
      {
        texto: 'Pensamientos repetitivos o preocupaciones que no puedo parar',
        icono: '🌀',
        pesos: { meditacion: 3, ejercicio: 1, terapia: 3, hobbies: 2, desconexion_digital: 1 },
      },
    ],
  },
  {
    id: 3,
    enunciado: '¿De cuánto tiempo dispones al día para dedicarte a gestionar el estrés?',
    opciones: [
      {
        texto: 'Menos de 15 minutos: el tiempo es muy limitado',
        icono: '⚡',
        pesos: { meditacion: 3, ejercicio: 1, terapia: 0, hobbies: 1, desconexion_digital: 2 },
      },
      {
        texto: 'Entre 15 y 30 minutos',
        icono: '🕐',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 1, hobbies: 2, desconexion_digital: 2 },
      },
      {
        texto: 'Entre 30 y 60 minutos',
        icono: '🕑',
        pesos: { meditacion: 2, ejercicio: 3, terapia: 2, hobbies: 3, desconexion_digital: 2 },
      },
      {
        texto: 'Más de una hora: puedo reservar tiempo real para esto',
        icono: '🕒',
        pesos: { meditacion: 2, ejercicio: 3, terapia: 3, hobbies: 3, desconexion_digital: 3 },
      },
    ],
  },
  {
    id: 4,
    enunciado: '¿Ya practicas algún método para reducir el estrés?',
    opciones: [
      {
        texto: 'Sí, hago ejercicio o deporte regularmente',
        icono: '🏃',
        pesos: { meditacion: 2, ejercicio: 1, terapia: 1, hobbies: 2, desconexion_digital: 2 },
      },
      {
        texto: 'Sí, medito o practico respiración consciente',
        icono: '🧘',
        pesos: { meditacion: 1, ejercicio: 2, terapia: 1, hobbies: 2, desconexion_digital: 2 },
      },
      {
        texto: 'Lo intento, pero no me funciona bien o lo abandono',
        icono: '🔄',
        pesos: { meditacion: 1, ejercicio: 1, terapia: 3, hobbies: 2, desconexion_digital: 1 },
      },
      {
        texto: 'No, no tengo ningún método establecido',
        icono: '❓',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 2, hobbies: 2, desconexion_digital: 2 },
      },
    ],
  },
  {
    id: 5,
    enunciado: 'Cuando te sientes estresado/a, ¿qué te apetece más instintivamente?',
    opciones: [
      {
        texto: 'Salir a caminar, correr o moverme físicamente',
        icono: '🚶',
        pesos: { meditacion: 1, ejercicio: 3, terapia: 0, hobbies: 1, desconexion_digital: 2 },
      },
      {
        texto: 'Sentarme en silencio, respirar o simplemente no hacer nada',
        icono: '😮‍💨',
        pesos: { meditacion: 3, ejercicio: 0, terapia: 1, hobbies: 1, desconexion_digital: 2 },
      },
      {
        texto: 'Hablar con alguien de confianza o un profesional',
        icono: '🗣️',
        pesos: { meditacion: 0, ejercicio: 0, terapia: 3, hobbies: 1, desconexion_digital: 0 },
      },
      {
        texto: 'Ponerme a hacer algo con las manos: cocinar, dibujar, construir',
        icono: '🎨',
        pesos: { meditacion: 1, ejercicio: 1, terapia: 0, hobbies: 3, desconexion_digital: 2 },
      },
    ],
  },
  {
    id: 6,
    enunciado: '¿Te cuesta apagar la mente cuando intentas descansar?',
    opciones: [
      {
        texto: 'Mucho: los pensamientos no paran y me cuesta relajarme',
        icono: '🌪️',
        pesos: { meditacion: 3, ejercicio: 2, terapia: 2, hobbies: 1, desconexion_digital: 1 },
      },
      {
        texto: 'Bastante, sobre todo si estoy con el móvil o la pantalla',
        icono: '📲',
        pesos: { meditacion: 2, ejercicio: 1, terapia: 1, hobbies: 2, desconexion_digital: 3 },
      },
      {
        texto: 'Un poco, pero lo controlo con alguna rutina',
        icono: '😌',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 0, hobbies: 2, desconexion_digital: 1 },
      },
      {
        texto: 'No especialmente, el problema es más físico o emocional',
        icono: '💪',
        pesos: { meditacion: 1, ejercicio: 3, terapia: 2, hobbies: 2, desconexion_digital: 0 },
      },
    ],
  },
  {
    id: 7,
    enunciado: '¿Te resulta difícil hablar de tus emociones o pedir ayuda?',
    opciones: [
      {
        texto: 'Sí, me cuesta mucho abrirme con los demás',
        icono: '🔒',
        pesos: { meditacion: 3, ejercicio: 2, terapia: 2, hobbies: 2, desconexion_digital: 1 },
      },
      {
        texto: 'Con personas cercanas sí, con un profesional podría intentarlo',
        icono: '🤝',
        pesos: { meditacion: 1, ejercicio: 1, terapia: 3, hobbies: 1, desconexion_digital: 1 },
      },
      {
        texto: 'No me cuesta, pero prefiero procesarlo de forma autónoma',
        icono: '🧩',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 0, hobbies: 3, desconexion_digital: 2 },
      },
      {
        texto: 'Me resulta fácil y ya tengo apoyo social o terapéutico',
        icono: '💬',
        pesos: { meditacion: 1, ejercicio: 2, terapia: 1, hobbies: 2, desconexion_digital: 2 },
      },
    ],
  },
  {
    id: 8,
    enunciado: 'Cuando tienes estrés, ¿te bloquea o te activa en exceso?',
    opciones: [
      {
        texto: 'Me bloquea: me paralizo, procrastino o me aíslo',
        icono: '🧊',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 3, hobbies: 2, desconexion_digital: 1 },
      },
      {
        texto: 'Me activa demasiado: hiperactivo/a, ansioso/a, no puedo parar',
        icono: '🔥',
        pesos: { meditacion: 3, ejercicio: 2, terapia: 2, hobbies: 1, desconexion_digital: 2 },
      },
      {
        texto: 'Depende: a veces me bloquea y otras me activa sin control',
        icono: '🔄',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 3, hobbies: 2, desconexion_digital: 1 },
      },
      {
        texto: 'Lo gestiono con cierta eficacia, pero quiero mejorarlo',
        icono: '📈',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 1, hobbies: 3, desconexion_digital: 2 },
      },
    ],
  },
  {
    id: 9,
    enunciado: '¿Disfrutas de actividades creativas o manuales?',
    opciones: [
      {
        texto: 'Mucho: me encanta dibujar, cocinar, tejer, hacer música o manualidades',
        icono: '🎭',
        pesos: { meditacion: 1, ejercicio: 0, terapia: 0, hobbies: 3, desconexion_digital: 2 },
      },
      {
        texto: 'Me gusta pero no lo suelo practicar por falta de tiempo',
        icono: '😅',
        pesos: { meditacion: 1, ejercicio: 1, terapia: 1, hobbies: 3, desconexion_digital: 1 },
      },
      {
        texto: 'Prefiero actividades más físicas que creativas',
        icono: '⚽',
        pesos: { meditacion: 1, ejercicio: 3, terapia: 0, hobbies: 1, desconexion_digital: 1 },
      },
      {
        texto: 'No especialmente, pero estoy abierto/a a probar cosas nuevas',
        icono: '🌱',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 2, hobbies: 1, desconexion_digital: 2 },
      },
    ],
  },
  {
    id: 10,
    enunciado: '¿Cuánto tiempo pasas de media con pantallas (móvil, ordenador, TV) fuera del trabajo?',
    opciones: [
      {
        texto: 'Más de 4 horas al día: estoy constantemente conectado/a',
        icono: '📺',
        pesos: { meditacion: 1, ejercicio: 1, terapia: 1, hobbies: 2, desconexion_digital: 3 },
      },
      {
        texto: 'Entre 2 y 4 horas: bastante tiempo aunque intento limitarlo',
        icono: '💻',
        pesos: { meditacion: 2, ejercicio: 1, terapia: 1, hobbies: 2, desconexion_digital: 2 },
      },
      {
        texto: 'Menos de 2 horas: tengo bastante control del uso digital',
        icono: '📵',
        pesos: { meditacion: 2, ejercicio: 2, terapia: 2, hobbies: 2, desconexion_digital: 1 },
      },
      {
        texto: 'No lo sé con exactitud, pero noto que me afecta negativamente',
        icono: '🤔',
        pesos: { meditacion: 1, ejercicio: 1, terapia: 1, hobbies: 2, desconexion_digital: 3 },
      },
    ],
  },
];

// ── Datos de resultados ────────────────────────────────────────────────────
const RESULTADOS: Record<
  MetodoEstres,
  { emoji: string; titulo: string; descripcion: string; consejos: string[] }
> = {
  meditacion: {
    emoji: '🧘',
    titulo: 'Meditación y Mindfulness',
    descripcion:
      'Tu perfil apunta a que la clave está en calmar la mente: aprender a observar los pensamientos sin engancharte a ellos, cultivar la respiración consciente y desarrollar una mayor tolerancia a la incertidumbre. El mindfulness puede ayudarte a romper el ciclo de la rumia y a recuperar perspectiva.',
    consejos: [
      'Empieza con 5-10 minutos al día de respiración diafragmática',
      'Prueba apps guiadas como Insight Timer o Calm (hay versiones gratuitas)',
      'Incorpora el "body scan" antes de dormir para mejorar el insomnio',
      'La meditación en movimiento (yoga, tai chi) es válida si no toleras el silencio',
    ],
  },
  ejercicio: {
    emoji: '🏃',
    titulo: 'Ejercicio Físico',
    descripcion:
      'Tu cuerpo acumula el estrés como tensión física y necesita liberarlo con movimiento. El ejercicio aeróbico activa la liberación de endorfinas y regula el cortisol. No hace falta ir al gimnasio: caminar 30 minutos al día tiene efectos demostrables sobre el estado de ánimo y la ansiedad.',
    consejos: [
      'Elige una actividad que disfrutes: no tienes que correr si lo odias',
      'El ejercicio en la naturaleza (senderismo, running al aire libre) potencia el efecto',
      'La constancia importa más que la intensidad: mejor 4 días de 30 min que 1 de 2h',
      'Combina cardio con fuerza para optimizar la respuesta al estrés',
    ],
  },
  terapia: {
    emoji: '🛋️',
    titulo: 'Terapia Psicológica',
    descripcion:
      'Tu perfil sugiere que las técnicas de autoayuda pueden no ser suficientes y que hay algo más profundo que necesita atención. Un profesional puede ayudarte a identificar los patrones que alimentan tu estrés, desarrollar herramientas específicas y trabajar desde la raíz, no solo los síntomas.',
    consejos: [
      'La terapia cognitivo-conductual (TCC) es especialmente eficaz para el estrés y la ansiedad',
      'En España puedes consultar el Colegio Oficial de Psicólogos para encontrar profesionales',
      'La terapia de aceptación y compromiso (ACT) es una alternativa muy efectiva',
      'No esperes a estar "muy mal": la terapia también es prevención',
    ],
  },
  hobbies: {
    emoji: '🎨',
    titulo: 'Hobbies y Actividades Creativas',
    descripcion:
      'Necesitas un espacio propio donde desconectar haciendo algo que disfrutes sin presión de resultados. Las actividades creativas o lúdicas activan el "estado de flujo", que es uno de los antídotos más eficaces contra el estrés porque absorben la atención de forma placentera.',
    consejos: [
      'Reserva al menos 2-3 horas semanales para tu hobby sin negociar esa agenda',
      'Si no tienes un hobby claro, prueba algo nuevo: cerámica, jardinería, fotografía, cocina',
      'Lo importante es que no tenga "obligación de resultado": hazlo por el proceso',
      'Los hobbies sociales (grupos de lectura, teatro amateur) suman el componente de conexión',
    ],
  },
  desconexion_digital: {
    emoji: '🌿',
    titulo: 'Desconexión Digital y Naturaleza',
    descripcion:
      'El exceso de estímulos digitales es una fuente de estrés crónico muy subestimada. Tu perfil apunta a que reducir el tiempo de pantallas y conectar con entornos naturales puede ser lo que más te ayude. El "baño de bosque" (shinrin-yoku) y los periodos de desconexión tienen evidencia científica detrás.',
    consejos: [
      'Establece horarios sin móvil: mínimo 1 hora antes de dormir y durante las comidas',
      'Activa el modo "No molestar" en bloques de trabajo o descanso',
      'Intenta pasar tiempo en parques o espacios naturales al menos 2 veces por semana',
      'Revisa las notificaciones activas en el móvil: elimina las no esenciales',
    ],
  },
};

// ── Componente principal ───────────────────────────────────────────────────
export default function SelectorGestionEstresPage() {
  // Estado: respuestas seleccionadas (índice de opción por pregunta)
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [puntuaciones, setPuntuaciones] = useState<Pesos | null>(null);

  const totalPreguntas = PREGUNTAS.length;
  const respondidas = Object.keys(respuestas).length;

  // Calcular puntuaciones acumuladas
  const calcularResultado = () => {
    const acumulado: Pesos = {
      meditacion: 0,
      ejercicio: 0,
      terapia: 0,
      hobbies: 0,
      desconexion_digital: 0,
    };

    PREGUNTAS.forEach((pregunta) => {
      const idxOpcion = respuestas[pregunta.id];
      if (idxOpcion !== undefined) {
        const opcion = pregunta.opciones[idxOpcion];
        (Object.keys(opcion.pesos) as MetodoEstres[]).forEach((metodo) => {
          acumulado[metodo] += opcion.pesos[metodo];
        });
      }
    });

    setPuntuaciones(acumulado);
    setMostrarResultado(true);
    // Desplazar al resultado
    setTimeout(() => {
      document.getElementById('resultado-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setPuntuaciones(null);
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Método ganador
  const metodoGanador: MetodoEstres | null = puntuaciones
    ? (Object.entries(puntuaciones).sort(([, a], [, b]) => b - a)[0][0] as MetodoEstres)
    : null;

  // Ordenar métodos para mostrar en la barra
  const metodosOrdenados: [MetodoEstres, number][] = puntuaciones
    ? (Object.entries(puntuaciones) as [MetodoEstres, number][]).sort(([, a], [, b]) => b - a)
    : [];

  const nombresMetodos: Record<MetodoEstres, string> = {
    meditacion: 'Meditación',
    ejercicio: 'Ejercicio',
    terapia: 'Terapia',
    hobbies: 'Hobbies',
    desconexion_digital: 'Desconexión',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1>🧠 Selector de Gestión del Estrés</h1>
        <p>
          10 preguntas para descubrir qué método de gestión del estrés se adapta mejor a tu perfil
          y estilo de vida.
        </p>
      </header>

      <LegalNotice />

      {/* Disclaimer nivel ALTO (salud mental) — siempre visible */}
      <DisclaimerCard variant="medical" severity="high" />

      {/* Quiz */}
      {!mostrarResultado && (
        <section className={styles.quiz} aria-label="Test de gestión del estrés">
          {/* Barra de progreso */}
          <div>
            <div className={styles.progresoTexto} aria-live="polite">
              {respondidas} de {totalPreguntas} preguntas respondidas
            </div>
            <div
              className={styles.progreso}
              role="progressbar"
              aria-valuenow={respondidas}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-label={`Progreso: ${respondidas} de ${totalPreguntas} preguntas`}
            >
              <div
                className={styles.progresoRelleno}
                style={{ width: `${(respondidas / totalPreguntas) * 100}%` }}
              />
            </div>
          </div>

          {PREGUNTAS.map((pregunta) => (
            <div key={pregunta.id} className={styles.pregunta}>
              <span className={styles.numeroPregunta}>Pregunta {pregunta.id}</span>
              <h2>{pregunta.enunciado}</h2>
              <div className={styles.opciones} role="group" aria-label={pregunta.enunciado}>
                {pregunta.opciones.map((opcion, idx) => {
                  const seleccionada = respuestas[pregunta.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.opcion} ${seleccionada ? styles.seleccionada : ''}`}
                      onClick={() =>
                        setRespuestas((prev) => ({ ...prev, [pregunta.id]: idx }))
                      }
                      aria-pressed={seleccionada}
                    >
                      <span className={styles.opcionIcono} aria-hidden="true">
                        {opcion.icono}
                      </span>
                      {opcion.texto}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={calcularResultado}
            disabled={respondidas < totalPreguntas}
            aria-disabled={respondidas < totalPreguntas}
          >
            {respondidas < totalPreguntas
              ? `Responde ${totalPreguntas - respondidas} pregunta${totalPreguntas - respondidas !== 1 ? 's' : ''} más`
              : 'Ver mi resultado →'}
          </button>
        </section>
      )}

      {/* Resultado */}
      {mostrarResultado && metodoGanador && puntuaciones && (
        <section
          id="resultado-section"
          className={styles.resultado}
          aria-label="Resultado del test"
          aria-live="polite"
        >
          <div className={styles.resultadoCard}>
            <span className={styles.resultadoEmoji} aria-hidden="true">
              {RESULTADOS[metodoGanador].emoji}
            </span>
            <h2 className={styles.resultadoTitulo}>
              Tu método recomendado: {RESULTADOS[metodoGanador].titulo}
            </h2>
            <p className={styles.resultadoDescripcion}>
              {RESULTADOS[metodoGanador].descripcion}
            </p>

            <div className={styles.warningBox} role="note">
              <strong>Consejos prácticos para empezar:</strong>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                {RESULTADOS[metodoGanador].consejos.map((consejo, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem', lineHeight: 1.5 }}>
                    {consejo}
                  </li>
                ))}
              </ul>
            </div>

            {/* Puntuaciones de todos los métodos */}
            <div className={styles.metodos} aria-label="Puntuación por método">
              {metodosOrdenados.map(([metodo, pts]) => (
                <div
                  key={metodo}
                  className={`${styles.metodoBar} ${metodo === metodoGanador ? styles.destacado : ''}`}
                >
                  <span className={styles.metodoNombre}>
                    {metodo === metodoGanador ? '★ ' : ''}
                    {nombresMetodos[metodo]}
                  </span>
                  <span className={styles.metodoPuntos}>{pts} pts</span>
                </div>
              ))}
            </div>

            <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
              Repetir el test
            </button>
          </div>
        </section>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="📚 Todo sobre la gestión del estrés"
        subtitle="Qué es, por qué importa y cómo cada método actúa en el organismo"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el estrés y por qué gestionarlo importa?</h2>
          <p>
            El estrés es una respuesta fisiológica y psicológica ante situaciones percibidas como
            amenazas o exigencias. En dosis pequeñas y puntuales puede ser útil (nos activa y nos
            hace rendir), pero cuando se vuelve crónico deteriora la salud física, mental y
            relacional. En España, según el IV Barómetro del COP, el 59% de la población afirma
            sentir estrés con frecuencia.
          </p>
          <p>
            La clave no es eliminar el estrés, sino gestionarlo: desarrollar recursos propios para
            que no nos supere. Y el primer paso es encontrar el método que encaja con tu personalidad,
            tus síntomas y tu ritmo de vida.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Los 5 métodos explicados</h2>

          <h3>🧘 Meditación y Mindfulness</h3>
          <p>
            El mindfulness entrena la atención para estar en el presente sin juzgar. Reduce la
            actividad de la amígdala (centro del miedo), mejora el sueño y disminuye la rumia. Con
            solo 8 semanas de práctica regular hay cambios medibles en el cerebro (programa MBSR,
            Kabat-Zinn). Ideal para quienes tienen muchos pensamientos intrusivos o insomnio.
          </p>

          <h3>🏃 Ejercicio Físico</h3>
          <p>
            El movimiento libera endorfinas, serotonina y BDNF (factor neurotrófico que protege las
            neuronas). Reduce el cortisol acumulado y mejora la calidad del sueño. Estudios del
            Journal of Psychiatry muestran que 30 minutos de cardio moderado 3 veces por semana son
            tan eficaces como un antidepresivo de baja dosis para la ansiedad leve-moderada.
          </p>

          <h3>🛋️ Terapia Psicológica</h3>
          <p>
            Cuando el estrés tiene raíces más profundas (traumas, patrones cognitivos distorsionados,
            dificultades de regulación emocional), la autoayuda puede quedarse corta. La terapia
            cognitivo-conductual (TCC) tiene el mayor respaldo científico para el trastorno de
            ansiedad generalizada y el estrés crónico. La ACT (Terapia de Aceptación y Compromiso)
            es una segunda línea muy eficaz.
          </p>

          <h3>🎨 Hobbies y Actividades Creativas</h3>
          <p>
            El "estado de flujo" (Csikszentmihalyi) ocurre cuando hacemos algo que nos absorbe
            completamente. Durante ese estado el cortisol baja y el sistema nervioso entra en
            reposo activo. Las actividades manuales (cerámica, cocina, jardinería) tienen el efecto
            añadido de involucrar el cuerpo, lo que ancla la atención en el presente.
          </p>

          <h3>🌿 Desconexión Digital y Naturaleza</h3>
          <p>
            El exceso de notificaciones, información y comparación social en redes mantiene el sistema
            nervioso en alerta constante. Investigaciones de la Universidad de Sussex muestran que
            pasar 20 minutos en un entorno natural reduce los marcadores biológicos de estrés. El
            concepto japonés "shinrin-yoku" (baño de bosque) tiene protocolo médico en Japón y
            Corea del Sur.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Puedo combinar varios métodos?</h2>
          <p>
            Absolutamente. Los métodos no son excluyentes. De hecho, la combinación de ejercicio +
            mindfulness, o de terapia + hobbies, suele ser más efectiva que cualquier técnica
            aislada. El test señala el punto de partida más adecuado para ti, pero a medida que
            vayas incorporando hábitos puedes añadir otros elementos.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Cuándo buscar ayuda profesional sin esperar</h2>
          <ul>
            <li>Si el estrés interfiere significativamente con el trabajo, las relaciones o el sueño durante más de 2-3 semanas.</li>
            <li>Si aparecen pensamientos de desesperanza, inutilidad o deseos de no existir.</li>
            <li>Si recurres al alcohol, sustancias u otros comportamientos de evitación para gestionar el malestar.</li>
            <li>Si ya has probado varios métodos sin mejora perceptible.</li>
          </ul>
          <p>
            En estos casos, consultar con un psicólogo o médico de cabecera es el camino más
            responsable. El Colegio Oficial de Psicólogos de España (cop.es) tiene un buscador de
            profesionales por especialidad y provincia.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-gestion-estres')} />
      <ShareCard appName="selector-gestion-estres" />
      <Footer appName="selector-gestion-estres" />
    </div>
  );
}
