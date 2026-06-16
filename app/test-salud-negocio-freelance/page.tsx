'use client';
// @disclaimer: exempt

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './TestSaludNegocioFreelance.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import Chart from 'chart.js/auto';

// ============================================================================
// TIPOS
// ============================================================================

type Dimension = 'finanzas' | 'clientes' | 'eficiencia' | 'equilibrio' | 'crecimiento';

interface Opcion {
  texto: string;
  puntos: number;
}

interface Pregunta {
  id: number;
  texto: string;
  dimension: Dimension;
  opciones: Opcion[];
}

interface Recomendacion {
  texto: string;
  enlace: string;
  nombreApp: string;
}

interface DimensionInfo {
  nombre: string;
  emoji: string;
  color: string;
  recomendaciones: Recomendacion[];
}

// ============================================================================
// DATOS
// ============================================================================

const DIMENSIONES: Record<Dimension, DimensionInfo> = {
  finanzas: {
    nombre: 'Estabilidad Financiera',
    emoji: '💰',
    color: '#2E86AB',
    recomendaciones: [
      { texto: 'Planifica tu flujo de caja mensual', enlace: '/planificador-cashflow/', nombreApp: 'Planificador Cashflow' },
      { texto: 'Calcula tu punto de equilibrio', enlace: '/estimador-break-even/', nombreApp: 'Estimador Break-Even' },
    ],
  },
  clientes: {
    nombre: 'Diversificación de Clientes',
    emoji: '👥',
    color: '#48A9A6',
    recomendaciones: [
      { texto: 'Analiza tu dependencia de clientes', enlace: '/mapa-dependencia-clientes/', nombreApp: 'Mapa Dependencia Clientes' },
      { texto: 'Conoce los tipos de cliente freelance', enlace: '/visualizador-tipos-cliente-freelance/', nombreApp: 'Tipos de Cliente Freelance' },
    ],
  },
  eficiencia: {
    nombre: 'Eficiencia Operativa',
    emoji: '⚡',
    color: '#F4A261',
    recomendaciones: [
      { texto: 'Comprende el ciclo de vida freelance', enlace: '/visualizador-ciclo-vida-freelance/', nombreApp: 'Ciclo Vida Freelance' },
      { texto: 'Controla tu tiempo con Pomodoro', enlace: '/temporizador-pomodoro/', nombreApp: 'Temporizador Pomodoro' },
    ],
  },
  equilibrio: {
    nombre: 'Equilibrio Vida-Trabajo',
    emoji: '⚖️',
    color: '#E76F51',
    recomendaciones: [
      { texto: 'Gestiona tu tiempo con Pomodoro', enlace: '/temporizador-pomodoro/', nombreApp: 'Temporizador Pomodoro' },
      { texto: 'Haz seguimiento de tus hábitos', enlace: '/seguimiento-habitos/', nombreApp: 'Seguimiento de Hábitos' },
    ],
  },
  crecimiento: {
    nombre: 'Crecimiento Profesional',
    emoji: '📈',
    color: '#7FB3D3',
    recomendaciones: [
      { texto: 'Orienta tus tarifas correctamente', enlace: '/orientador-tarifa-freelance/', nombreApp: 'Orientador Tarifa Freelance' },
      { texto: 'Conoce tu estructura de costes', enlace: '/visualizador-estructura-costes-autonomo/', nombreApp: 'Estructura Costes Autónomo' },
    ],
  },
};

const PREGUNTAS: Pregunta[] = [
  // Estabilidad Financiera
  {
    id: 1, texto: '¿Tienes un colchón de emergencia que cubra al menos 3 meses de gastos?', dimension: 'finanzas',
    opciones: [
      { texto: 'Sí, 6+ meses', puntos: 10 },
      { texto: 'Sí, 3-5 meses', puntos: 7 },
      { texto: 'Menos de 3 meses', puntos: 4 },
      { texto: 'No tengo colchón', puntos: 1 },
    ],
  },
  {
    id: 2, texto: '¿Facturas de forma regular o tienes meses "en blanco"?', dimension: 'finanzas',
    opciones: [
      { texto: 'Facturación constante todo el año', puntos: 10 },
      { texto: 'Algunos meses bajan pero cubro gastos', puntos: 7 },
      { texto: 'Meses buenos y malos muy desiguales', puntos: 4 },
      { texto: 'Muchos meses sin facturar', puntos: 1 },
    ],
  },
  {
    id: 3, texto: '¿Separas cuenta personal y profesional?', dimension: 'finanzas',
    opciones: [
      { texto: 'Sí, cuentas separadas y contabilidad al día', puntos: 10 },
      { texto: 'Separadas pero no controlo bien', puntos: 6 },
      { texto: 'Todo en la misma cuenta', puntos: 2 },
    ],
  },
  // Diversificación de Clientes
  {
    id: 4, texto: '¿Qué porcentaje de tus ingresos depende de un solo cliente?', dimension: 'clientes',
    opciones: [
      { texto: 'Menos del 25%', puntos: 10 },
      { texto: '25-50%', puntos: 7 },
      { texto: '50-75%', puntos: 4 },
      { texto: 'Más del 75%', puntos: 1 },
    ],
  },
  {
    id: 5, texto: '¿De cuántos clientes activos tienes ingresos regulares?', dimension: 'clientes',
    opciones: [
      { texto: '5 o más', puntos: 10 },
      { texto: '3-4', puntos: 7 },
      { texto: '2', puntos: 4 },
      { texto: '1', puntos: 1 },
    ],
  },
  {
    id: 6, texto: '¿Tienes un canal activo de captación de nuevos clientes?', dimension: 'clientes',
    opciones: [
      { texto: 'Sí, varios canales funcionando', puntos: 10 },
      { texto: 'Sí, al menos uno', puntos: 7 },
      { texto: 'Solo el boca a boca', puntos: 4 },
      { texto: 'No, espero a que lleguen', puntos: 1 },
    ],
  },
  // Eficiencia Operativa
  {
    id: 7, texto: '¿Qué porcentaje de tu tiempo de trabajo es facturable (genera ingresos directos)?', dimension: 'eficiencia',
    opciones: [
      { texto: 'Más del 70%', puntos: 10 },
      { texto: '50-70%', puntos: 7 },
      { texto: '30-50%', puntos: 4 },
      { texto: 'Menos del 30%', puntos: 1 },
    ],
  },
  {
    id: 8, texto: '¿Tienes procesos estandarizados (plantillas, contratos, presupuestos tipo)?', dimension: 'eficiencia',
    opciones: [
      { texto: 'Sí, para casi todo', puntos: 10 },
      { texto: 'Algunos', puntos: 6 },
      { texto: 'Muy pocos o ninguno', puntos: 2 },
    ],
  },
  {
    id: 9, texto: '¿Cuánto tardas desde que entregas un trabajo hasta que facturas?', dimension: 'eficiencia',
    opciones: [
      { texto: 'El mismo día', puntos: 10 },
      { texto: 'Menos de una semana', puntos: 7 },
      { texto: 'Varias semanas', puntos: 3 },
      { texto: 'A veces se me olvida', puntos: 1 },
    ],
  },
  // Equilibrio Vida-Trabajo
  {
    id: 10, texto: '¿Cuántos días de vacaciones tomas al año?', dimension: 'equilibrio',
    opciones: [
      { texto: '20+ días', puntos: 10 },
      { texto: '10-19 días', puntos: 7 },
      { texto: '1-9 días', puntos: 4 },
      { texto: 'Ninguno', puntos: 1 },
    ],
  },
  {
    id: 11, texto: '¿Trabajas habitualmente más de 8 horas al día?', dimension: 'equilibrio',
    opciones: [
      { texto: 'Rara vez', puntos: 10 },
      { texto: 'A veces, en picos de trabajo', puntos: 7 },
      { texto: 'Frecuentemente', puntos: 4 },
      { texto: 'Casi siempre, incluidos fines de semana', puntos: 1 },
    ],
  },
  {
    id: 12, texto: '¿Puedes desconectar del trabajo al final del día?', dimension: 'equilibrio',
    opciones: [
      { texto: 'Sí, sin problema', puntos: 10 },
      { texto: 'Generalmente sí', puntos: 7 },
      { texto: 'Me cuesta bastante', puntos: 4 },
      { texto: 'Estoy siempre conectado', puntos: 1 },
    ],
  },
  // Crecimiento Profesional
  {
    id: 13, texto: '¿Has subido tus tarifas en los últimos 12 meses?', dimension: 'crecimiento',
    opciones: [
      { texto: 'Sí, significativamente', puntos: 10 },
      { texto: 'Sí, algo', puntos: 7 },
      { texto: 'No, las mantengo', puntos: 3 },
      { texto: 'Las he bajado', puntos: 1 },
    ],
  },
  {
    id: 14, texto: '¿Inviertes en formación o herramientas para mejorar tu trabajo?', dimension: 'crecimiento',
    opciones: [
      { texto: 'Regularmente', puntos: 10 },
      { texto: 'De vez en cuando', puntos: 6 },
      { texto: 'Casi nunca', puntos: 2 },
    ],
  },
  {
    id: 15, texto: '¿Tienes un plan de hacia dónde quieres llevar tu negocio en 1-2 años?', dimension: 'crecimiento',
    opciones: [
      { texto: 'Sí, con objetivos claros', puntos: 10 },
      { texto: 'Más o menos', puntos: 6 },
      { texto: 'No, voy sobre la marcha', puntos: 2 },
    ],
  },
];

function obtenerEtiqueta(puntuacion: number): { texto: string; clase: string } {
  if (puntuacion >= 80) return { texto: 'Excelente', clase: 'excelente' };
  if (puntuacion >= 60) return { texto: 'Bueno', clase: 'bueno' };
  if (puntuacion >= 40) return { texto: 'Mejorable', clase: 'mejorable' };
  return { texto: 'Crítico', clase: 'critico' };
}

function obtenerAnalisis(dimension: Dimension, media: number): string {
  const analisis: Record<Dimension, Record<string, string>> = {
    finanzas: {
      alto: 'Tienes una base financiera sólida. Tu colchón de emergencia y facturación regular te dan tranquilidad para tomar buenas decisiones.',
      medio: 'Tu situación financiera es aceptable pero tiene margen de mejora. Trabaja en estabilizar tu facturación y separar cuentas.',
      bajo: 'Tu estabilidad financiera necesita atención urgente. Sin un colchón y con ingresos irregulares, cualquier imprevisto puede ser crítico.',
    },
    clientes: {
      alto: 'Excelente diversificación. Tener múltiples clientes y canales de captación te protege frente a la pérdida de cualquiera de ellos.',
      medio: 'Tu cartera de clientes tiene cierta diversificación pero depender mucho de pocos clientes es arriesgado. Busca nuevos canales.',
      bajo: 'Tu dependencia de uno o pocos clientes es peligrosa. Si pierdes a tu cliente principal, tu negocio puede colapsar.',
    },
    eficiencia: {
      alto: 'Tu operativa es eficiente. Aprovechas bien tu tiempo facturable y tienes procesos que te ahorran trabajo repetitivo.',
      medio: 'Hay margen para mejorar tu eficiencia. Estandarizar procesos y facturar más rápido puede marcar una gran diferencia.',
      bajo: 'Dedicas demasiado tiempo a tareas no facturables. Necesitas urgentemente crear procesos y plantillas para ser más productivo.',
    },
    equilibrio: {
      alto: 'Gestionas muy bien el equilibrio entre trabajo y vida personal. Esto es clave para la sostenibilidad a largo plazo.',
      medio: 'Tu equilibrio vida-trabajo tiene áreas de mejora. Intenta establecer límites más claros y tomarte vacaciones regularmente.',
      bajo: 'Tu equilibrio está muy desequilibrado. Trabajar sin descanso lleva al burnout y afecta la calidad de tu trabajo.',
    },
    crecimiento: {
      alto: 'Tu negocio tiene una trayectoria de crecimiento clara. Subes tarifas, inviertes en formación y tienes visión a futuro.',
      medio: 'Tu crecimiento es moderado. Considera subir tarifas e invertir más en formación para no quedarte estancado.',
      bajo: 'Tu negocio está estancado o retrocediendo. Sin subir tarifas ni invertir en mejora, es difícil progresar.',
    },
  };

  if (media >= 7) return analisis[dimension].alto;
  if (media >= 4) return analisis[dimension].medio;
  return analisis[dimension].bajo;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function TestSaludNegocioFreelance() {
  const [fase, setFase] = useState<'intro' | 'test' | 'resultado'>('intro');
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const totalPreguntas = PREGUNTAS.length;

  const calcularResultados = useCallback(() => {
    const puntosPorDimension: Record<Dimension, number[]> = {
      finanzas: [], clientes: [], eficiencia: [], equilibrio: [], crecimiento: [],
    };

    PREGUNTAS.forEach((p) => {
      const puntos = respuestas[p.id];
      if (puntos !== undefined) {
        puntosPorDimension[p.dimension].push(puntos);
      }
    });

    const medias: Record<Dimension, number> = {
      finanzas: 0, clientes: 0, eficiencia: 0, equilibrio: 0, crecimiento: 0,
    };

    const dimensiones: Dimension[] = ['finanzas', 'clientes', 'eficiencia', 'equilibrio', 'crecimiento'];
    dimensiones.forEach((dim) => {
      const arr = puntosPorDimension[dim];
      medias[dim] = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    });

    const total = Math.round(dimensiones.reduce((sum, dim) => sum + medias[dim], 0) * 2);

    return { medias, total };
  }, [respuestas]);

  // Renderizar radar chart
  useEffect(() => {
    if (fase !== 'resultado' || !chartRef.current) return;

    const { medias } = calcularResultados();
    const dimensiones: Dimension[] = ['finanzas', 'clientes', 'eficiencia', 'equilibrio', 'crecimiento'];

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'radar',
      data: {
        labels: dimensiones.map((d) => DIMENSIONES[d].nombre),
        datasets: [{
          label: 'Tu negocio',
          data: dimensiones.map((d) => Math.round(medias[d] * 10) / 10),
          backgroundColor: 'rgba(46, 134, 171, 0.2)',
          borderColor: '#2E86AB',
          pointBackgroundColor: '#2E86AB',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#2E86AB',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: { stepSize: 2, display: true },
            pointLabels: { font: { size: 12 } },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [fase, calcularResultados]);

  const seleccionarRespuesta = (preguntaId: number, puntos: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: puntos }));

    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((prev) => prev + 1);
    } else {
      setFase('resultado');
    }
  };

  const reiniciarTest = () => {
    setRespuestas({});
    setPreguntaActual(0);
    setFase('intro');
  };

  const pregunta = PREGUNTAS[preguntaActual];
  const progreso = ((preguntaActual + (fase === 'resultado' ? 1 : 0)) / totalPreguntas) * 100;

  const dimensiones: Dimension[] = ['finanzas', 'clientes', 'eficiencia', 'equilibrio', 'crecimiento'];

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🩺</span> Test de Salud de tu Negocio Freelance</h1>
          <p className={styles.subtitle}>Evalúa 5 dimensiones clave y descubre dónde mejorar</p>
        </header>

        <LegalNotice />

        {/* FASE: INTRODUCCIÓN */}
        {fase === 'intro' && (
          <div className={styles.introCard}>
            <h2 className={styles.introTitle}>¿Cómo de sano está tu negocio freelance?</h2>
            <p className={styles.introText}>
              Este test evalúa tu negocio en <strong>5 dimensiones clave</strong>:
            </p>
            <div className={styles.dimensionGrid}>
              {dimensiones.map((dim) => (
                <div key={dim} className={styles.dimensionPreview}>
                  <span className={styles.dimensionEmoji} aria-hidden="true">{DIMENSIONES[dim].emoji}</span>
                  <span className={styles.dimensionName}>{DIMENSIONES[dim].nombre}</span>
                </div>
              ))}
            </div>
            <p className={styles.introText}>
              Son <strong>15 preguntas</strong> que tardarás unos 3 minutos en responder.
              Al final recibirás un <strong>radar chart</strong> con tu puntuación y
              recomendaciones personalizadas con herramientas de meskeIA.
            </p>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setFase('test')}
              aria-label="Empezar el test de salud de negocio freelance"
            >
              Empezar test
            </button>
          </div>
        )}

        {/* FASE: TEST */}
        {fase === 'test' && pregunta && (
          <div className={styles.testCard}>
            <div className={styles.progressContainer}>
              <div className={styles.progressInfo}>
                <span>Pregunta {preguntaActual + 1} de {totalPreguntas}</span>
                <span>{Math.round(progreso)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progreso}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(progreso)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso del test: ${Math.round(progreso)}%`}
                />
              </div>
            </div>

            <div className={styles.dimensionBadge} style={{ borderColor: DIMENSIONES[pregunta.dimension].color }}>
              <span aria-hidden="true">{DIMENSIONES[pregunta.dimension].emoji}</span>
              {DIMENSIONES[pregunta.dimension].nombre}
            </div>

            <h2 className={styles.questionText}>{pregunta.texto}</h2>

            <div className={styles.optionsGrid}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.optionBtn}
                  onClick={() => seleccionarRespuesta(pregunta.id, opcion.puntos)}
                  aria-label={`${opcion.texto} - Opción ${idx + 1} de ${pregunta.opciones.length}`}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FASE: RESULTADOS */}
        {fase === 'resultado' && (() => {
          const { medias, total } = calcularResultados();
          const etiqueta = obtenerEtiqueta(total);

          return (
            <div className={styles.resultadosContainer}>
              <div className={styles.scoreCard}>
                <h2 className={styles.scoreTitle}>Tu puntuación global</h2>
                <div className={`${styles.scoreValue} ${styles[etiqueta.clase]}`}>
                  {total}<span className={styles.scoreMax}>/100</span>
                </div>
                <div className={`${styles.scoreBadge} ${styles[etiqueta.clase]}`}>
                  {etiqueta.texto}
                </div>
              </div>

              <div className={styles.chartCard}>
                <h2 className={styles.chartTitle}>Tu radar freelance</h2>
                <div className={styles.chartWrapper}>
                  <canvas ref={chartRef} aria-label="Gráfico radar con puntuaciones por dimensión" role="img" />
                </div>
              </div>

              <div className={styles.dimensionResults}>
                {dimensiones.map((dim) => {
                  const media = medias[dim];
                  const info = DIMENSIONES[dim];
                  const porcentaje = Math.round(media * 10);

                  return (
                    <div
                      key={dim}
                      className={styles.dimensionCard}
                      style={{ borderLeftColor: info.color }}
                    >
                      <div className={styles.dimensionHeader}>
                        <span className={styles.dimensionCardEmoji} aria-hidden="true">{info.emoji}</span>
                        <h3 className={styles.dimensionCardTitle}>{info.nombre}</h3>
                        <span
                          className={styles.dimensionScore}
                          style={{ color: info.color }}
                        >
                          {Math.round(media * 10) / 10}/10
                        </span>
                      </div>

                      <div className={styles.dimensionBarContainer}>
                        <div
                          className={styles.dimensionBar}
                          style={{ width: `${porcentaje}%`, backgroundColor: info.color }}
                        />
                      </div>

                      <p className={styles.dimensionAnalysis}>
                        {obtenerAnalisis(dim, media)}
                      </p>

                      {media < 7 && (
                        <div className={styles.recomendaciones}>
                          <p className={styles.recomendacionesTitulo}>
                            <span aria-hidden="true">💡</span> Herramientas recomendadas:
                          </p>
                          {info.recomendaciones.map((rec, idx) => (
                            <Link key={idx} href={rec.enlace} className={styles.recomendacionLink}>
                              <span className={styles.recomendacionTexto}>{rec.texto}</span>
                              <span className={styles.recomendacionApp}>{rec.nombreApp} →</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={reiniciarTest}
                aria-label="Repetir el test desde el principio"
              >
                <span aria-hidden="true">🔄</span> Repetir test
              </button>
            </div>
          );
        })()}

        <EducationalSection
          title="📚 Las 5 dimensiones de un negocio freelance sano"
          subtitle="Entiende qué evalúa cada dimensión y cómo mejorar"
        >
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">💰</span> Estabilidad Financiera</h2>
            <p>
              La base de cualquier negocio sostenible. Incluye tener un colchón de emergencia
              (mínimo 3 meses de gastos), facturar de forma constante y separar las finanzas
              personales de las profesionales. Sin estabilidad financiera, cada decisión se
              toma desde la urgencia en lugar de la estrategia.
            </p>
            <p>
              <strong>Consejo clave</strong>: Antes de buscar más clientes, asegúrate de que
              tu estructura financiera aguanta meses malos. Un freelance con 6 meses de colchón
              negocia mejor que uno que necesita el dinero mañana.
            </p>

            <h2><span aria-hidden="true">👥</span> Diversificación de Clientes</h2>
            <p>
              Depender de un solo cliente es el riesgo más común del freelance. Si ese cliente
              desaparece, tu negocio se hunde. Lo ideal es que ningún cliente represente más
              del 25% de tus ingresos y tener al menos 3-5 clientes activos. Hay modelos viables
              (mantenimiento estable, exclusividades pactadas) donde tener un cliente principal
              es una elección razonable. Lo importante es que sea consciente y, si es posible,
              contractualmente protegido.
            </p>
            <p>
              <strong>Consejo clave</strong>: No esperes a perder un cliente para buscar más.
              Dedica al menos un 10% de tu tiempo a actividades de captación, aunque tengas
              la agenda llena.
            </p>

            <h2><span aria-hidden="true">⚡</span> Eficiencia Operativa</h2>
            <p>
              Tu tiempo es tu único recurso. La eficiencia operativa mide cuánto de ese tiempo
              genera ingresos reales frente a tareas administrativas. Tener plantillas, contratos
              tipo y un proceso de facturación rápido puede liberar horas cada semana.
            </p>
            <p>
              <strong>Consejo clave</strong>: Automatiza todo lo que hagas más de 3 veces.
              Una plantilla de presupuesto que tardas 1 hora en crear te ahorrará 10 horas
              al año.
            </p>

            <h2><span aria-hidden="true">⚖️</span> Equilibrio Vida-Trabajo</h2>
            <p>
              Trabajar muchas horas en fase de arranque o en sectores intensivos es normal. La pregunta
              sobre horas no diagnostica si <strong>es bueno o malo en absoluto</strong>, sino si
              a estas alturas es sostenible para ti.
            </p>
            <p>
              El freelance ofrece libertad horaria, pero muchos acaban trabajando más que
              como empleados. Trabajar muchas horas durante semanas o meses puntuales es habitual y
              manejable. El problema aparece cuando es la norma todo el año durante años: el
              agotamiento crónico afecta la calidad del trabajo, la salud y, eventualmente, la
              viabilidad del negocio.
            </p>
            <p>
              <strong>Consejo clave</strong>: Planifica tus vacaciones como planificas los
              proyectos de clientes: ponlas en el calendario y respétalas. Tu productividad
              después será mucho mayor.
            </p>

            <h2><span aria-hidden="true">📈</span> Crecimiento Profesional</h2>
            <p>
              Actualizar tarifas al menos con la inflación es importante para no perder poder
              adquisitivo. Si tu modelo es de crecimiento, también es razonable subirlas algo
              más cada año. Si tu modelo es de estabilidad (carga de trabajo constante, vida
              que ya te encaja), basta con seguir la inflación.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-salud-negocio-freelance')} />
        <ShareCard appName="test-salud-negocio-freelance" />
        <Footer appName="test-salud-negocio-freelance" />
    </div>
  );
}
