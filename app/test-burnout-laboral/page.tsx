'use client';

import { useState } from 'react';
import styles from './TestBurnoutLaboral.module.css';
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

// ===================================================
// PREGUNTAS DEL TEST
// Basadas en investigación sobre burnout laboral
// (no denominado Maslach MBI para evitar copyright)
// ===================================================

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'agotamiento' | 'cinismo' | 'realizacion';
  inversa?: boolean; // Si true, la puntuación se invierte al calcular
}

const PREGUNTAS: Pregunta[] = [
  // DIMENSIÓN 1: Agotamiento Emocional (5 preguntas)
  {
    id: 1,
    texto: 'Me siento emocionalmente agotado/a por mi trabajo.',
    dimension: 'agotamiento',
  },
  {
    id: 2,
    texto: 'Al final de mi jornada laboral me siento vacío/a de energía.',
    dimension: 'agotamiento',
  },
  {
    id: 3,
    texto: 'Me siento cansado/a cuando me levanto por la mañana y tengo que enfrentarme a otro día de trabajo.',
    dimension: 'agotamiento',
  },
  {
    id: 4,
    texto: 'Trabajar todo el día es realmente un esfuerzo para mí.',
    dimension: 'agotamiento',
  },
  {
    id: 5,
    texto: 'Siento que estoy al límite de mis posibilidades en el trabajo.',
    dimension: 'agotamiento',
  },

  // DIMENSIÓN 2: Cinismo / Despersonalización (5 preguntas)
  {
    id: 6,
    texto: 'Me he vuelto más indiferente con las personas de mi entorno laboral desde que empecé este trabajo.',
    dimension: 'cinismo',
  },
  {
    id: 7,
    texto: 'Me preocupa que este trabajo me esté endureciendo emocionalmente.',
    dimension: 'cinismo',
  },
  {
    id: 8,
    texto: 'No me importa realmente lo que les ocurra a algunas personas que tengo que tratar en el trabajo.',
    dimension: 'cinismo',
  },
  {
    id: 9,
    texto: 'Siento que los clientes, compañeros o usuarios me culpan de algunos de sus problemas.',
    dimension: 'cinismo',
  },
  {
    id: 10,
    texto: 'He perdido el entusiasmo por mi trabajo o por el sector en el que trabajo.',
    dimension: 'cinismo',
  },

  // DIMENSIÓN 3: Realización Personal (5 preguntas — puntuación inversa)
  {
    id: 11,
    texto: 'Puedo entender con facilidad cómo se sienten las personas con las que me relaciono en mi trabajo.',
    dimension: 'realizacion',
    inversa: true,
  },
  {
    id: 12,
    texto: 'Creo que trato de forma positiva los problemas que surgen en mi trabajo.',
    dimension: 'realizacion',
    inversa: true,
  },
  {
    id: 13,
    texto: 'Siento que estoy influyendo positivamente con mi trabajo en las personas que me rodean.',
    dimension: 'realizacion',
    inversa: true,
  },
  {
    id: 14,
    texto: 'Me siento con mucha energía en mi trabajo.',
    dimension: 'realizacion',
    inversa: true,
  },
  {
    id: 15,
    texto: 'En mi trabajo consigo satisfactoriamente muchas cosas valiosas.',
    dimension: 'realizacion',
    inversa: true,
  },
];

const OPCIONES = [
  { valor: 0, etiqueta: 'Nunca' },
  { valor: 1, etiqueta: 'Rara vez' },
  { valor: 2, etiqueta: 'A veces' },
  { valor: 3, etiqueta: 'Con frecuencia' },
  { valor: 4, etiqueta: 'Siempre' },
];

// Umbrales orientativos por dimensión
interface NivelInfo {
  nivel: string;
  clase: string;
  descripcion: string;
  recomendacion: string;
}

function getNivelAgotamiento(puntuacion: number): NivelInfo {
  if (puntuacion <= 6) {
    return {
      nivel: 'Bajo',
      clase: styles.nivelBajo,
      descripcion: 'Tu nivel de agotamiento emocional es bajo.',
      recomendacion: 'Mantén tus hábitos actuales de autocuidado y gestión del estrés.',
    };
  } else if (puntuacion <= 12) {
    return {
      nivel: 'Moderado',
      clase: styles.nivelModerado,
      descripcion: 'Hay señales moderadas de agotamiento emocional.',
      recomendacion: 'Considera incorporar estrategias de descanso y recuperación energética.',
    };
  } else {
    return {
      nivel: 'Alto',
      clase: styles.nivelAlto,
      descripcion: 'Tu nivel de agotamiento emocional es elevado.',
      recomendacion: 'Es recomendable consultar con un profesional de salud mental.',
    };
  }
}

function getNivelCinismo(puntuacion: number): NivelInfo {
  if (puntuacion <= 5) {
    return {
      nivel: 'Bajo',
      clase: styles.nivelBajo,
      descripcion: 'Tu nivel de cinismo/despersonalización es bajo.',
      recomendacion: 'Sigues manteniendo una conexión emocional saludable con tu trabajo.',
    };
  } else if (puntuacion <= 10) {
    return {
      nivel: 'Moderado',
      clase: styles.nivelModerado,
      descripcion: 'Se observan señales moderadas de distanciamiento emocional.',
      recomendacion: 'Reflexiona sobre las fuentes de insatisfacción en tu entorno laboral.',
    };
  } else {
    return {
      nivel: 'Alto',
      clase: styles.nivelAlto,
      descripcion: 'Existe un distanciamiento emocional significativo hacia el trabajo.',
      recomendacion: 'Considera apoyo profesional para trabajar esta dimensión.',
    };
  }
}

function getNivelRealizacion(puntuacion: number): NivelInfo {
  // Puntuación INVERSA: menor puntuación = mayor problema de realización
  if (puntuacion >= 14) {
    return {
      nivel: 'Alta',
      clase: styles.nivelBajo,
      descripcion: 'Tienes un buen nivel de realización personal en el trabajo.',
      recomendacion: 'Tu percepción de logro y competencia profesional es saludable.',
    };
  } else if (puntuacion >= 8) {
    return {
      nivel: 'Moderada',
      clase: styles.nivelModerado,
      descripcion: 'Tu nivel de realización personal es moderado.',
      recomendacion: 'Identifica qué aspectos de tu trabajo te generan mayor satisfacción.',
    };
  } else {
    return {
      nivel: 'Baja',
      clase: styles.nivelAlto,
      descripcion: 'Tu percepción de realización personal en el trabajo es baja.',
      recomendacion: 'Esto puede ser un indicador relevante. Considera apoyo profesional.',
    };
  }
}

function getNivelGeneral(agot: number, cini: number, real: number): NivelInfo {
  // Puntuación compuesta: agotamiento + cinismo + (20 - realizacion)
  const puntuacionTotal = agot + cini + (20 - real);
  if (puntuacionTotal <= 16) {
    return {
      nivel: 'Sin indicadores significativos',
      clase: styles.nivelBajo,
      descripcion: 'No se detectan indicadores significativos de burnout en este momento.',
      recomendacion: 'Sigue cuidando tu bienestar laboral con hábitos saludables.',
    };
  } else if (puntuacionTotal <= 32) {
    return {
      nivel: 'Riesgo moderado',
      clase: styles.nivelModerado,
      descripcion: 'Existen indicadores moderados que merecen atención.',
      recomendacion:
        'Revisa tus hábitos de descanso y considera hablar con alguien de confianza o un profesional.',
    };
  } else {
    return {
      nivel: 'Riesgo elevado',
      clase: styles.nivelAlto,
      descripcion: 'Los indicadores sugieren un nivel elevado de burnout laboral.',
      recomendacion:
        'Se recomienda encarecidamente consultar con un profesional de salud mental lo antes posible.',
    };
  }
}

// ===================================================
// COMPONENTE PRINCIPAL
// ===================================================

export default function TestBurnoutLaboralPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0); // índice 0..14

  const totalPreguntas = PREGUNTAS.length;
  const respondidas = Object.keys(respuestas).length;
  const progreso = Math.round((respondidas / totalPreguntas) * 100);

  const handleRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: valor }));
    // Avanzar automáticamente a la siguiente pregunta
    if (preguntaActual < totalPreguntas - 1) {
      setTimeout(() => setPreguntaActual(prev => prev + 1), 400);
    }
  };

  const calcularResultados = () => {
    if (respondidas < totalPreguntas) return;
    setMostrarResultados(true);
    setTimeout(() => {
      const el = document.getElementById('resultados');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setMostrarResultados(false);
    setPreguntaActual(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular puntuaciones
  const puntuacionAgotamiento = PREGUNTAS.filter(p => p.dimension === 'agotamiento').reduce(
    (sum, p) => sum + (respuestas[p.id] ?? 0),
    0,
  );
  const puntuacionCinismo = PREGUNTAS.filter(p => p.dimension === 'cinismo').reduce(
    (sum, p) => sum + (respuestas[p.id] ?? 0),
    0,
  );
  const puntuacionRealizacion = PREGUNTAS.filter(p => p.dimension === 'realizacion').reduce(
    (sum, p) => sum + (respuestas[p.id] ?? 0),
    0,
  );

  const nivelAgot = getNivelAgotamiento(puntuacionAgotamiento);
  const nivelCini = getNivelCinismo(puntuacionCinismo);
  const nivelReal = getNivelRealizacion(puntuacionRealizacion);
  const nivelGeneral = getNivelGeneral(puntuacionAgotamiento, puntuacionCinismo, puntuacionRealizacion);

  const pregunta = PREGUNTAS[preguntaActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}><span aria-hidden="true">🔥</span> Test de Burnout Laboral</h1>
        <p className={styles.heroSubtitle}>
          Evaluación orientativa del síndrome de desgaste profesional · 15 preguntas · 3 dimensiones
        </p>
      </header>

      {/* DISCLAIMER MÉDICO — SIEMPRE VISIBLE */}
      <DisclaimerCard variant="medical" severity="high" />

      <LegalNotice />

      {/* NAVEGACIÓN DE PREGUNTAS */}
      {!mostrarResultados && (
        <section className={styles.testSection}>
          <div className={styles.progresoWrapper}>
            <div className={styles.progresoInfo}>
              <span>
                Pregunta {preguntaActual + 1} de {totalPreguntas}
              </span>
              <span>{progreso}% completado</span>
            </div>
            <div className={styles.barraProgreso} role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.barraProgresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          {/* MAPA DE PREGUNTAS */}
          <div className={styles.mapaPreguntas} aria-label="Mapa de preguntas">
            {PREGUNTAS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                className={[
                  styles.mapaBurbuja,
                  respuestas[p.id] !== undefined ? styles.mapaBurbujaRespondida : '',
                  idx === preguntaActual ? styles.mapaBurbujaActual : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setPreguntaActual(idx)}
                aria-label={`Ir a pregunta ${idx + 1}`}
                aria-current={idx === preguntaActual ? 'true' : undefined}
                aria-pressed={idx === preguntaActual}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* PREGUNTA ACTUAL */}
          <div className={styles.tarjetaPregunta}>
            <div className={styles.dimensionBadge}>
              {pregunta.dimension === 'agotamiento' && <><span aria-hidden="true">💫</span> Agotamiento emocional</>}
              {pregunta.dimension === 'cinismo' && <><span aria-hidden="true">🧊</span> Cinismo / Despersonalización</>}
              {pregunta.dimension === 'realizacion' && <><span aria-hidden="true">⭐</span> Realización personal</>}
            </div>
            <p className={styles.textoPregunta}>{pregunta.texto}</p>

            <div className={styles.opcionesGrid}>
              {OPCIONES.map(opcion => (
                <button
                  key={opcion.valor}
                  type="button"
                  className={[
                    styles.opcionBtn,
                    respuestas[pregunta.id] === opcion.valor ? styles.opcionSeleccionada : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleRespuesta(pregunta.id, opcion.valor)}
                  aria-pressed={respuestas[pregunta.id] === opcion.valor}
                >
                  <span className={styles.opcionValor}>{opcion.valor}</span>
                  <span className={styles.opcionEtiqueta}>{opcion.etiqueta}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CONTROLES DE NAVEGACIÓN */}
          <div className={styles.navegacionBtns}>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))}
              disabled={preguntaActual === 0}
            >
              ← Anterior
            </button>
            {preguntaActual < totalPreguntas - 1 ? (
              <button
                type="button"
                className={styles.btnPrimario}
                onClick={() => setPreguntaActual(prev => prev + 1)}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnCalcular}
                onClick={calcularResultados}
                disabled={respondidas < totalPreguntas}
              >
                {respondidas < totalPreguntas
                  ? `Responde ${totalPreguntas - respondidas} pregunta${totalPreguntas - respondidas > 1 ? 's' : ''} más`
                  : 'Ver resultados'}
              </button>
            )}
          </div>

          {respondidas < totalPreguntas && respondidas > 0 && (
            <p className={styles.faltanInfo}>
              Te faltan {totalPreguntas - respondidas} pregunta{totalPreguntas - respondidas > 1 ? 's' : ''} por responder.
              Puedes navegar libremente usando los botones numerados.
            </p>
          )}
        </section>
      )}

      {/* RESULTADOS */}
      {mostrarResultados && (
        <section id="resultados" className={styles.resultadosSection}>
          <h2 className={styles.resultadosTitulo}><span aria-hidden="true">📊</span> Tus Resultados</h2>
          <p className={styles.resultadosSubtitulo}>
            Recuerda: esta evaluación es <strong>orientativa</strong>. Solo un profesional de salud mental
            puede realizar un diagnóstico.
          </p>

          {/* NIVEL GENERAL */}
          <div className={[styles.tarjetaGeneral, nivelGeneral.clase].join(' ')}>
            <div className={styles.generalHeader}>
              <span className={styles.generalIcono} aria-hidden="true">
                {nivelGeneral.nivel === 'Sin indicadores significativos' ? '✅' : nivelGeneral.nivel === 'Riesgo moderado' ? '⚠️' : '🚨'}
              </span>
              <div>
                <h3 className={styles.generalNivel}>{nivelGeneral.nivel}</h3>
                <p className={styles.generalDescripcion}>{nivelGeneral.descripcion}</p>
              </div>
            </div>
            <p className={styles.generalRecomendacion}>{nivelGeneral.recomendacion}</p>
          </div>

          {/* TRES DIMENSIONES */}
          <div className={styles.dimensionesGrid}>
            {/* Agotamiento */}
            <div className={[styles.tarjetaDimension, nivelAgot.clase].join(' ')}>
              <div className={styles.dimHeader}>
                <span aria-hidden="true">💫</span>
                <h3>Agotamiento emocional</h3>
              </div>
              <div className={styles.dimPuntuacion}>
                <span className={styles.dimNumero}>{puntuacionAgotamiento}</span>
                <span className={styles.dimMax}>/20</span>
              </div>
              <div className={styles.dimBarra}>
                <div
                  className={styles.dimBarraRelleno}
                  style={{ width: `${(puntuacionAgotamiento / 20) * 100}%` }}
                />
              </div>
              <span className={[styles.dimNivel, nivelAgot.clase].join(' ')}>{nivelAgot.nivel}</span>
              <p className={styles.dimDescripcion}>{nivelAgot.descripcion}</p>
              <p className={styles.dimRecomendacion}>{nivelAgot.recomendacion}</p>
            </div>

            {/* Cinismo */}
            <div className={[styles.tarjetaDimension, nivelCini.clase].join(' ')}>
              <div className={styles.dimHeader}>
                <span aria-hidden="true">🧊</span>
                <h3>Cinismo / Despersonalización</h3>
              </div>
              <div className={styles.dimPuntuacion}>
                <span className={styles.dimNumero}>{puntuacionCinismo}</span>
                <span className={styles.dimMax}>/20</span>
              </div>
              <div className={styles.dimBarra}>
                <div
                  className={styles.dimBarraRelleno}
                  style={{ width: `${(puntuacionCinismo / 20) * 100}%` }}
                />
              </div>
              <span className={[styles.dimNivel, nivelCini.clase].join(' ')}>{nivelCini.nivel}</span>
              <p className={styles.dimDescripcion}>{nivelCini.descripcion}</p>
              <p className={styles.dimRecomendacion}>{nivelCini.recomendacion}</p>
            </div>

            {/* Realización */}
            <div className={[styles.tarjetaDimension, nivelReal.clase].join(' ')}>
              <div className={styles.dimHeader}>
                <span aria-hidden="true">⭐</span>
                <h3>Realización personal</h3>
              </div>
              <div className={styles.dimPuntuacion}>
                <span className={styles.dimNumero}>{puntuacionRealizacion}</span>
                <span className={styles.dimMax}>/20</span>
              </div>
              <div className={styles.dimBarra}>
                <div
                  className={styles.dimBarraRelleno}
                  style={{ width: `${(puntuacionRealizacion / 20) * 100}%` }}
                />
              </div>
              <span className={[styles.dimNivel, nivelReal.clase].join(' ')}>{nivelReal.nivel}</span>
              <p className={styles.dimDescripcion}>{nivelReal.descripcion}</p>
              <p className={styles.dimRecomendacion}>{nivelReal.recomendacion}</p>
            </div>
          </div>

          <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
            <span aria-hidden="true">🔄</span> Repetir el test
          </button>
        </section>
      )}

      {/* SECCIÓN EDUCATIVA V2.0 */}
      <EducationalSection
        title="¿Qué es el Burnout Laboral?"
        subtitle="Entiende el síndrome de desgaste profesional"
      >
        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSection}>
          <h2>¿Qué es el síndrome de burnout?</h2>
          <p>
            El <strong>burnout laboral</strong> o síndrome de desgaste profesional es un estado de agotamiento
            físico, emocional y mental causado por el estrés crónico en el trabajo. La Organización Mundial de
            la Salud (OMS) lo reconoció oficialmente en 2019 como un fenómeno ocupacional en la CIE-11.
          </p>
          <p>
            No es lo mismo que el estrés puntual: el burnout es el resultado de una exposición prolongada a
            situaciones laborales que superan los recursos del trabajador, sin recuperación suficiente.
          </p>

          <h2>Las 3 dimensiones del burnout</h2>
          <div className={styles.dimensionesList}>
            <div className={styles.dimensionItem}>
              <h3><span aria-hidden="true">💫</span> Agotamiento emocional</h3>
              <p>
                Sensación de estar al límite de las propias fuerzas, de haber consumido todos los recursos
                emocionales. La persona siente que no puede dar más de sí misma.
              </p>
            </div>
            <div className={styles.dimensionItem}>
              <h3><span aria-hidden="true">🧊</span> Cinismo / Despersonalización</h3>
              <p>
                Actitudes negativas, distantes o frías hacia las personas del entorno laboral (clientes,
                compañeros, superiores). Pérdida de implicación y entusiasmo por el trabajo.
              </p>
            </div>
            <div className={styles.dimensionItem}>
              <h3><span aria-hidden="true">⭐</span> Reducción de la realización personal</h3>
              <p>
                Sentimiento de incompetencia, ineficacia y pérdida de confianza en uno mismo. La persona siente
                que su trabajo no tiene valor ni impacto positivo.
              </p>
            </div>
          </div>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.comparativaSection}>
          <h2>Burnout vs Estrés: ¿cuál es la diferencia?</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Estrés</th>
                  <th>Burnout</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Duración</td>
                  <td>Temporal, situacional</td>
                  <td>Crónico, prolongado</td>
                </tr>
                <tr>
                  <td>Emociones dominantes</td>
                  <td>Urgencia, ansiedad</td>
                  <td>Vacío, desilusión</td>
                </tr>
                <tr>
                  <td>Motivación</td>
                  <td>Puede mantenerse alta</td>
                  <td>Muy reducida o nula</td>
                </tr>
                <tr>
                  <td>Recuperación</td>
                  <td>Con descanso</td>
                  <td>Requiere intervención</td>
                </tr>
                <tr>
                  <td>Impacto físico</td>
                  <td>Tensión muscular, insomnio</td>
                  <td>Enfermedades, absentismo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4 ESCENARIOS */}
        <section className={styles.escenariosSection}>
          <h2>¿Quién tiene mayor riesgo de burnout?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🩺</span>
              <h3>Profesionales sanitarios</h3>
              <p>
                Médicos, enfermeros, psicólogos y cuidadores están entre los colectivos con mayor prevalencia
                de burnout por la carga emocional constante.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🎓</span>
              <h3>Docentes y educadores</h3>
              <p>
                Alta presión entre responsabilidad, alumnado con necesidades diversas y escasos recursos genera
                desgaste progresivo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">💼</span>
              <h3>Trabajadores con alta exigencia</h3>
              <p>
                Perfiles directivos, comerciales con objetivos, o trabajadores con poco control sobre su jornada
                y decisiones laborales.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🌐</span>
              <h3>Teletrabajo sin límites</h3>
              <p>
                La difuminación del límite hogar-trabajo, la hiperconectividad y el aislamiento social aumentan
                el riesgo en entornos remotos.
              </p>
            </div>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES */}
        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes sobre el burnout</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿El burnout tiene tratamiento?</h3>
              <p>
                Sí. El burnout responde bien a la psicoterapia (especialmente cognitivo-conductual), a intervenciones
                organizacionales y a la reestructuración laboral. Las técnicas de mindfulness pueden ser un complemento
                útil. Cuando hay depresión o ansiedad asociadas, el tratamiento farmacológico pautado por un profesional
                puede ser parte importante del abordaje. Es fundamental acudir a un profesional de salud mental.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo tener baja laboral por burnout?</h3>
              <p>
                En España el burnout puede dar lugar a una baja laboral por contingencias comunes (enfermedad
                psiquiátrica o trastorno adaptativo). El diagnóstico lo realiza el médico de atención primaria
                o el especialista en salud mental.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Este test es clínicamente válido?</h3>
              <p>
                No. Este test es una herramienta orientativa de autoevaluación. No sustituye un diagnóstico
                clínico profesional. Si tus resultados te preocupan, consulta con un profesional de salud mental.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tiempo tarda en recuperarse alguien con burnout?</h3>
              <p>
                Depende de la gravedad y el tratamiento. Puede variar desde semanas en casos leves hasta meses
                en casos avanzados. La recuperación requiere cambios tanto personales como, idealmente, en el
                entorno laboral.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El burnout afecta solo a profesionales de ayuda?</h3>
              <p>
                No. Aunque inicialmente se estudió en ese ámbito, el burnout puede afectar a cualquier trabajador
                en cualquier sector, incluso a autónomos y emprendedores.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo puedo prevenir el burnout?</h3>
              <p>
                Establecer límites claros entre trabajo y vida personal, practicar actividad física regularmente,
                mantener relaciones sociales de calidad, aprender a delegar y comunicar necesidades en el trabajo,
                y buscar apoyo profesional de forma preventiva son estrategias eficaces.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué diferencia hay entre burnout y depresión?</h3>
              <p>
                El burnout es específico del contexto laboral. La depresión afecta a todos los ámbitos de la
                vida. Sin embargo, el burnout no tratado puede evolucionar hacia un trastorno depresivo, por
                lo que es importante abordarlo a tiempo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El empleador tiene responsabilidad en el burnout?</h3>
              <p>
                Sí. La prevención de riesgos psicosociales es una obligación legal del empleador en España (Ley
                31/1995 de Prevención de Riesgos Laborales). Los trabajadores pueden exigir evaluaciones de
                riesgos psicosociales en su empresa.
              </p>
            </div>
          </div>
        </section>

        {/* GUÍA: CUÁNDO BUSCAR AYUDA */}
        <section className={styles.guiaSection}>
          <h2>Señales de alerta: cuándo buscar ayuda profesional</h2>
          <ol className={styles.pasosList}>
            <li>
              <strong>Agotamiento persistente</strong> — Si llevas semanas o meses sintiéndote vacío/a de
              energía incluso tras el descanso.
            </li>
            <li>
              <strong>Insomnio o hipersomnia</strong> — Dificultad para dormir o necesidad de dormir en exceso
              relacionada con preocupaciones laborales.
            </li>
            <li>
              <strong>Síntomas físicos inexplicables</strong> — Dolores de cabeza frecuentes, problemas digestivos,
              tensión muscular crónica.
            </li>
            <li>
              <strong>Dificultades de concentración</strong> — Incapacidad para mantener el foco en tareas que
              antes realizabas con facilidad.
            </li>
            <li>
              <strong>Aislamiento social</strong> — Deseo de evitar el contacto con compañeros, amigos o familia.
            </li>
            <li>
              <strong>Pensamientos negativos persistentes</strong> — Sensación de inutilidad, desesperanza o
              pensamientos intrusivos relacionados con el trabajo.
            </li>
          </ol>
        </section>

        {/* CONSEJOS DE BIENESTAR */}
        <section className={styles.consejosSection}>
          <h2><span aria-hidden="true">💡</span> Estrategias de prevención del burnout</h2>
          <div className={styles.consejosGrid}>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">⏰</span>
              <h3>Establece límites temporales</h3>
              <p>Define un horario de fin de jornada y respétalo. Desactiva notificaciones laborales fuera de ese horario.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🏃</span>
              <h3>Mueve el cuerpo</h3>
              <p>La actividad física regular es uno de los mejores reguladores del estrés. 30 minutos al día marcan la diferencia.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🗣️</span>
              <h3>Habla de cómo te sientes</h3>
              <p>Verbalizar el malestar con personas de confianza o un profesional reduce la carga emocional significativamente.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🎯</span>
              <h3>Identifica lo que controlas</h3>
              <p>Enfoca tu energía en lo que puedes cambiar y aprende a soltar lo que está fuera de tu control.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🌿</span>
              <h3>Recarga fuera del trabajo</h3>
              <p>Dedica tiempo a actividades que te nutran emocionalmente: naturaleza, creatividad, ocio sin pantallas.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">📋</span>
              <h3>Pide apoyo profesional</h3>
              <p>Un psicólogo o terapeuta puede ayudarte a desarrollar estrategias personalizadas antes de llegar al límite.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🏢</span>
              <h3>Identifica las condiciones laborales que generan desgaste</h3>
              <p>Si la carga de trabajo, la falta de autonomía o el trato son la fuente principal, las estrategias individuales no bastan. Documenta lo que ocurre, habla con representantes sindicales o RRHH y, si procede, solicita evaluación de riesgos psicosociales (Ley 31/1995).</p>
            </div>
          </div>
        </section>

        {/* CAJA DE ADVERTENCIA — indicador v2.0 */}
        <div className={styles.warningBox}>
          <strong><span aria-hidden="true">⚠️</span> Recuerda:</strong> Este test no es un instrumento diagnóstico clínico. Si te
          preocupan tus resultados o llevas tiempo sintiéndote desbordado/a por el trabajo, busca apoyo
          de un profesional de salud mental. <strong>Pedir ayuda es un acto de valentía, no de debilidad.</strong>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-burnout-laboral')} />
      <ShareCard appName="test-burnout-laboral" />
      <Footer appName="test-burnout-laboral" />
    </div>
  );
}
