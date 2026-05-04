'use client';

import { useState } from 'react';
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
import styles from './TestToleranciaRiesgo.module.css';

type Fase = 'inicio' | 'test' | 'resultado';

interface Opcion {
  texto: string;
  valor: number;
}

interface Pregunta {
  id: number;
  dimension: number;
  texto: string;
  opciones: Opcion[];
}

interface Perfil {
  nombre: string;
  descripcion: string;
  rf: number;
  rv: number;
  detalle: string;
  recomendaciones: string[];
}

const DIMENSIONES = [
  { icono: '⏱️', nombre: 'Horizonte Temporal' },
  { icono: '💰', nombre: 'Capacidad Financiera' },
  { icono: '🧠', nombre: 'Reacción Emocional' },
  { icono: '📚', nombre: 'Conocimiento y Experiencia' },
  { icono: '🎯', nombre: 'Objetivos y Expectativas' },
];

const PREGUNTAS: Pregunta[] = [
  // Dimensión 0 — Horizonte Temporal
  {
    id: 1, dimension: 0,
    texto: '¿Cuándo prevés necesitar acceder al dinero que vas a invertir?',
    opciones: [
      { texto: 'En menos de 1 año', valor: 1 },
      { texto: 'Entre 1 y 3 años', valor: 2 },
      { texto: 'Entre 3 y 10 años', valor: 3 },
      { texto: 'Más de 10 años, o no lo sé aún', valor: 4 },
    ],
  },
  {
    id: 2, dimension: 0,
    texto: 'Si tu inversión cayera un 20% el primer año, ¿qué harías?',
    opciones: [
      { texto: 'Vendería para evitar más pérdidas', valor: 1 },
      { texto: 'Esperaría algunos meses, pero me preocuparía', valor: 2 },
      { texto: 'Lo mantendría 1-2 años sin problema', valor: 3 },
      { texto: 'Podría esperar todo el tiempo necesario', valor: 4 },
    ],
  },
  {
    id: 3, dimension: 0,
    texto: '¿Tienes un fondo de emergencia separado del dinero que vas a invertir?',
    opciones: [
      { texto: 'No tengo nada reservado', valor: 1 },
      { texto: 'Menos de 3 meses de gastos', valor: 2 },
      { texto: 'Entre 3 y 6 meses de gastos', valor: 3 },
      { texto: 'Más de 6 meses de gastos', valor: 4 },
    ],
  },
  {
    id: 4, dimension: 0,
    texto: '¿En qué etapa de vida te encuentras?',
    opciones: [
      { texto: 'Cerca de la jubilación (menos de 10 años)', valor: 1 },
      { texto: 'Adulto maduro (35-50 años, compromisos familiares)', valor: 2 },
      { texto: 'Adulto joven (25-35 años, inicio de carrera)', valor: 3 },
      { texto: 'Muy joven (menos de 25 años, empezando)', valor: 4 },
    ],
  },

  // Dimensión 1 — Capacidad Financiera
  {
    id: 5, dimension: 1,
    texto: '¿Qué porcentaje de tus ingresos mensuales netos representa el dinero que invertirías?',
    opciones: [
      { texto: 'Más del 30%', valor: 1 },
      { texto: 'Entre el 15% y el 30%', valor: 2 },
      { texto: 'Entre el 5% y el 15%', valor: 3 },
      { texto: 'Menos del 5%', valor: 4 },
    ],
  },
  {
    id: 6, dimension: 1,
    texto: '¿Cómo describirías tu situación laboral o de ingresos?',
    opciones: [
      { texto: 'Inestable o muy variable (freelance sin base fija)', valor: 1 },
      { texto: 'Variable con base (comisiones + fijo pequeño)', valor: 2 },
      { texto: 'Estable (asalariado por cuenta ajena)', valor: 3 },
      { texto: 'Muy estable (funcionario o ingresos pasivos suficientes)', valor: 4 },
    ],
  },
  {
    id: 7, dimension: 1,
    texto: '¿Cuál es tu situación de deuda actual?',
    opciones: [
      { texto: 'Hipoteca + varios préstamos o tarjetas', valor: 1 },
      { texto: 'Solo hipoteca o una deuda grande', valor: 2 },
      { texto: 'Deuda pequeña (coche o tarjeta al día)', valor: 3 },
      { texto: 'Sin deudas relevantes', valor: 4 },
    ],
  },
  {
    id: 8, dimension: 1,
    texto: 'Si perdieras el 30% de tu inversión, ¿afectaría tu nivel de vida?',
    opciones: [
      { texto: 'Sería un problema grave para mi economía', valor: 1 },
      { texto: 'Me afectaría bastante, tendría que ajustar gastos', valor: 2 },
      { texto: 'Me molestaría pero podría asumir la pérdida', valor: 3 },
      { texto: 'No afectaría mi vida diaria en absoluto', valor: 4 },
    ],
  },

  // Dimensión 2 — Reacción Emocional
  {
    id: 9, dimension: 2,
    texto: 'Tu cartera cae un 15% en un solo mes. ¿Qué haces?',
    opciones: [
      { texto: 'Vendo todo para evitar más pérdidas', valor: 1 },
      { texto: 'Vendo una parte para reducir la exposición', valor: 2 },
      { texto: 'No hago nada, espero la recuperación', valor: 3 },
      { texto: 'Compro más aprovechando los precios bajos', valor: 4 },
    ],
  },
  {
    id: 10, dimension: 2,
    texto: '¿Con qué frecuencia revisas (o revisarías) tus inversiones?',
    opciones: [
      { texto: 'Varias veces al día, estoy pendiente siempre', valor: 1 },
      { texto: 'Cada día o casi cada día', valor: 2 },
      { texto: 'Una vez a la semana o al mes', valor: 3 },
      { texto: 'Solo una vez al trimestre o menos', valor: 4 },
    ],
  },
  {
    id: 11, dimension: 2,
    texto: 'Lees que los analistas prevén que el mercado podría caer otro 20%. ¿Cómo reaccionas?',
    opciones: [
      { texto: 'Pánico: quiero recuperar mi dinero de inmediato', valor: 1 },
      { texto: 'Preocupación: valoraría reducir posiciones', valor: 2 },
      { texto: 'Calma: sé que los mercados se recuperan a largo plazo', valor: 3 },
      { texto: 'Oportunidad: pensaría en aumentar mi posición', valor: 4 },
    ],
  },
  {
    id: 12, dimension: 2,
    texto: 'En general, cuando tomas decisiones financieras importantes, ¿cómo te sientes?',
    opciones: [
      { texto: 'Muy nervioso; prefiero siempre la opción más segura', valor: 1 },
      { texto: 'Algo nervioso, pero puedo tomar la decisión', valor: 2 },
      { texto: 'Relativamente tranquilo y confiado en mi análisis', valor: 3 },
      { texto: 'Decidido y orientado a resultados, sin paralizarme', valor: 4 },
    ],
  },

  // Dimensión 3 — Conocimiento y Experiencia
  {
    id: 13, dimension: 3,
    texto: '¿Cuántos años llevas invirtiendo en mercados financieros?',
    opciones: [
      { texto: 'Nunca he invertido', valor: 1 },
      { texto: 'Menos de 2 años', valor: 2 },
      { texto: 'Entre 2 y 10 años', valor: 3 },
      { texto: 'Más de 10 años', valor: 4 },
    ],
  },
  {
    id: 14, dimension: 3,
    texto: '¿Con qué tipo de instrumentos has invertido alguna vez?',
    opciones: [
      { texto: 'Solo cuentas de ahorro o depósitos bancarios', valor: 1 },
      { texto: 'Fondos de inversión o ETFs de renta fija', valor: 2 },
      { texto: 'Fondos mixtos, ETFs de bolsa o acciones individuales', valor: 3 },
      { texto: 'Opciones, futuros, apalancamiento u otros derivados', valor: 4 },
    ],
  },
  {
    id: 15, dimension: 3,
    texto: '¿Cómo describirías tu nivel de conocimiento sobre inversiones?',
    opciones: [
      { texto: 'Básico: sé que la bolsa sube y baja', valor: 1 },
      { texto: 'Elemental: conozco conceptos como ETF, acción, fondo', valor: 2 },
      { texto: 'Intermedio: entiendo diversificación, correlación, riesgo-retorno', valor: 3 },
      { texto: 'Avanzado: analizo ratios, gestión activa vs pasiva, métricas de riesgo', valor: 4 },
    ],
  },
  {
    id: 16, dimension: 3,
    texto: '¿Has vivido una crisis de mercado importante (2008, 2020) con dinero invertido?',
    opciones: [
      { texto: 'No, nunca he tenido dinero en mercados durante una crisis', valor: 1 },
      { texto: 'Sí, pero vendí pronto para detener las pérdidas', valor: 2 },
      { texto: 'Sí, mantuve la posición aunque fue difícil emocionalmente', valor: 3 },
      { texto: 'Sí, aproveché para invertir más durante la caída', valor: 4 },
    ],
  },

  // Dimensión 4 — Objetivos y Expectativas
  {
    id: 17, dimension: 4,
    texto: '¿Cuál es tu principal objetivo al invertir?',
    opciones: [
      { texto: 'No perder lo invertido, aunque la rentabilidad sea mínima', valor: 1 },
      { texto: 'Superar la inflación con un riesgo muy bajo', valor: 2 },
      { texto: 'Crecer a largo plazo asumiendo volatilidad moderada', valor: 3 },
      { texto: 'Maximizar la rentabilidad aunque implique grandes fluctuaciones', valor: 4 },
    ],
  },
  {
    id: 18, dimension: 4,
    texto: '¿Qué caída anual máxima podrías asumir sin perder el sueño?',
    opciones: [
      { texto: 'Hasta un 5%', valor: 1 },
      { texto: 'Hasta un 15%', valor: 2 },
      { texto: 'Hasta un 30%', valor: 3 },
      { texto: 'Más del 30% si es necesario para maximizar el retorno', valor: 4 },
    ],
  },
  {
    id: 19, dimension: 4,
    texto: '¿Qué rentabilidad media anual esperas de tu inversión?',
    opciones: [
      { texto: 'Entre 1% y 3% (depósito seguro)', valor: 1 },
      { texto: 'Entre 3% y 5% (ligeramente por encima de la inflación)', valor: 2 },
      { texto: 'Entre 5% y 8% (rentabilidad histórica del mercado)', valor: 3 },
      { texto: 'Más del 8% anual (acepto más riesgo)', valor: 4 },
    ],
  },
  {
    id: 20, dimension: 4,
    texto: '¿Cómo sería la inversión perfecta para ti?',
    opciones: [
      { texto: 'Capital garantizado, aunque crezca muy poco', valor: 1 },
      { texto: 'Ganancias modestas y seguras, mínima volatilidad', valor: 2 },
      { texto: 'Buen retorno a largo plazo con volatilidad controlada', valor: 3 },
      { texto: 'Máximo potencial aunque pueda caer mucho en el camino', valor: 4 },
    ],
  },
];

const PERFILES: Perfil[] = [
  {
    nombre: 'Conservador',
    descripcion: 'Priorizas la seguridad del capital por encima de la rentabilidad. Te incomoda la volatilidad y prefieres instrumentos con rentabilidad predecible, aunque sea menor.',
    rf: 85, rv: 15,
    detalle: 'Depósitos, letras del Tesoro, fondos monetarios (80-85%) + ETF de renta variable de baja volatilidad (15%).',
    recomendaciones: [
      'Fondos monetarios y depósitos garantizados como núcleo de la cartera.',
      'ETFs de renta fija de corto plazo para algo más de rentabilidad sin gran riesgo.',
      'Una pequeña exposición (10-15%) a renta variable de baja volatilidad como diversificación.',
      'Revisa tu perfil cada 2-3 años: los objetivos cambian con el tiempo.',
    ],
  },
  {
    nombre: 'Moderado-Conservador',
    descripcion: 'Aceptas cierta volatilidad a cambio de más rentabilidad, pero la seguridad sigue siendo prioritaria. Buscas un equilibrio con predominancia de renta fija.',
    rf: 65, rv: 35,
    detalle: 'Fondos de renta fija y mixtos conservadores (60-65%) + ETFs de renta variable global (35%).',
    recomendaciones: [
      'Fondos mixtos conservadores o una cartera 60/40 de renta fija y variable.',
      'ETFs indexados globales para la parte de renta variable (diversificación máxima).',
      'Diversifica geográficamente: no concentres en un solo mercado.',
      'Automatiza aportaciones periódicas para reducir el impacto del momento de entrada.',
    ],
  },
  {
    nombre: 'Moderado',
    descripcion: 'Tienes un equilibrio sano entre tolerancia al riesgo y prudencia. Aceptas volatilidad temporal con la expectativa de mejores rendimientos a largo plazo.',
    rf: 40, rv: 60,
    detalle: 'Renta variable global (55-60%) + renta fija diversificada (40%) como amortiguador en caídas.',
    recomendaciones: [
      'Una cartera 60/40 de renta variable/fija es el punto de partida ideal.',
      'ETFs de índices globales (MSCI World, S&P 500) para la parte de renta variable.',
      'Mantén el rumbo en caídas: no cambies tu estrategia en plena corrección de mercado.',
      'Rebalancea la cartera una vez al año para mantener la asignación objetivo.',
    ],
  },
  {
    nombre: 'Moderado-Agresivo',
    descripcion: 'Tienes alta tolerancia al riesgo y priorizas el crecimiento a largo plazo. Puedes soportar caídas significativas sabiendo que el horizonte temporal trabaja a tu favor.',
    rf: 20, rv: 80,
    detalle: 'Renta variable diversificada (75-80%) con ETFs globales, emergentes y small caps + algo de renta fija como colchón (20%).',
    recomendaciones: [
      'ETFs de renta variable global como núcleo (MSCI World, S&P 500, ETFs temáticos).',
      'Incluye exposición a mercados emergentes (10-15%) para mayor diversificación y potencial.',
      'Mantén un pequeño colchón de renta fija para rebalancear oportunistamente en caídas.',
      'Acepta las correcciones como parte del proceso; históricamente el mercado siempre se recuperó.',
    ],
  },
  {
    nombre: 'Agresivo',
    descripcion: 'Buscas máxima rentabilidad a largo plazo y tienes alta capacidad financiera y emocional para soportar caídas severas. Entiendes que la volatilidad es el precio de los mejores retornos.',
    rf: 5, rv: 95,
    detalle: 'Renta variable concentrada (90-95%) con índices globales, emergentes, small caps y posiblemente activos alternativos. Mínimo de liquidez o renta fija (5-10%).',
    recomendaciones: [
      'Cartera casi 100% en renta variable con amplia diversificación geográfica y sectorial.',
      'Considera una estrategia de aportación periódica (DCA) para mitigar la volatilidad de entrada.',
      'Acepta que podrás ver caídas del 40-50% en crisis extremas — es parte de la estrategia.',
      'Revisa tus sesgos cognitivos regularmente: el exceso de confianza es el mayor enemigo del inversor agresivo.',
    ],
  },
];

const UMBRAL_PERFILES = [32, 44, 56, 68];

function obtenerPerfil(puntuacion: number): Perfil {
  if (puntuacion <= UMBRAL_PERFILES[0]) return PERFILES[0];
  if (puntuacion <= UMBRAL_PERFILES[1]) return PERFILES[1];
  if (puntuacion <= UMBRAL_PERFILES[2]) return PERFILES[2];
  if (puntuacion <= UMBRAL_PERFILES[3]) return PERFILES[3];
  return PERFILES[4];
}

function nivelDimension(pct: number): string {
  if (pct < 40) return 'Bajo';
  if (pct < 70) return 'Medio';
  return 'Alto';
}

export default function TestToleranciaRiesgoDetallado() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [errorCalc, setErrorCalc] = useState('');

  const totalPreguntas = PREGUNTAS.length;
  const respondidas = Object.keys(respuestas).length;

  function seleccionar(preguntaId: number, valor: number) {
    setRespuestas(prev => ({ ...prev, [preguntaId]: valor }));
    setErrorCalc('');
  }

  function calcular() {
    const sinResponder = PREGUNTAS.filter(p => respuestas[p.id] === undefined);
    if (sinResponder.length > 0) {
      setErrorCalc(`Faltan ${sinResponder.length} pregunta${sinResponder.length > 1 ? 's' : ''} por responder.`);
      return;
    }
    setFase('resultado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reiniciar() {
    setRespuestas({});
    setErrorCalc('');
    setFase('inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const puntuacionTotal = Object.values(respuestas).reduce((a, b) => a + b, 0);
  const perfil = obtenerPerfil(puntuacionTotal);

  const puntuacionesDimension = DIMENSIONES.map((_, di) => {
    const pregsDim = PREGUNTAS.filter(p => p.dimension === di);
    const sumDim = pregsDim.reduce((acc, p) => acc + (respuestas[p.id] ?? 0), 0);
    const maxDim = pregsDim.length * 4;
    return { suma: sumDim, max: maxDim, pct: maxDim > 0 ? (sumDim / maxDim) * 100 : 0 };
  });

  const maxBarWidth = 260;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Test de Tolerancia al Riesgo</h1>
        <p>Evaluación detallada en 5 dimensiones — 20 preguntas, 5 perfiles de inversor</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <DisclaimerCard
          variant="financial"
          severity="high"
          collapsible={false}
          context="Los resultados de este test son orientativos y tienen fines exclusivamente educativos. No constituyen asesoramiento financiero personalizado. Consulta a un asesor financiero certificado antes de tomar decisiones de inversión."
        />

        {/* INICIO */}
        {fase === 'inicio' && (
          <div className={styles.inicioBox}>
            <h2>¿Cuánto riesgo estás realmente dispuesto a asumir?</h2>
            <p>
              Muchos inversores sobreestiman su tolerancia al riesgo en momentos de calma y la subestiman en
              plena caída. Este test evalúa 5 dimensiones clave para darte un perfil más preciso y realista
              que un cuestionario básico de 5 preguntas.
            </p>
            <div className={styles.dimensionesGrid}>
              {DIMENSIONES.map((d, i) => (
                <div key={i} className={styles.dimensionPill}>
                  <strong>{d.icono} {d.nombre}</strong>
                  4 preguntas
                </div>
              ))}
            </div>
            <button className={styles.startBtn} onClick={() => setFase('test')}>
              Comenzar el test →
            </button>
          </div>
        )}

        {/* TEST */}
        {fase === 'test' && (
          <div>
            <p className={styles.progressText}>{respondidas} / {totalPreguntas} preguntas respondidas</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(respondidas / totalPreguntas) * 100}%` }}
                role="progressbar"
                aria-valuenow={respondidas}
                aria-valuemin={0}
                aria-valuemax={totalPreguntas}
              />
            </div>

            {DIMENSIONES.map((dim, di) => (
              <div key={di} className={styles.dimensionBlock}>
                <div className={styles.dimensionHeader}>
                  <span className={styles.dimensionIcon} aria-hidden="true">{dim.icono}</span>
                  <h3>{dim.nombre}</h3>
                </div>
                {PREGUNTAS.filter(p => p.dimension === di).map(p => (
                  <div key={p.id} className={styles.preguntaCard}>
                    <p className={styles.preguntaNumero}>Pregunta {p.id} de {totalPreguntas}</p>
                    <p className={styles.preguntaTexto}>{p.texto}</p>
                    <div className={styles.opcionesGrid} role="radiogroup" aria-label={p.texto}>
                      {p.opciones.map((op, oi) => (
                        <label
                          key={oi}
                          className={`${styles.opcionLabel} ${respuestas[p.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                        >
                          <input
                            type="radio"
                            name={`pregunta-${p.id}`}
                            value={op.valor}
                            checked={respuestas[p.id] === op.valor}
                            onChange={() => seleccionar(p.id, op.valor)}
                          />
                          {op.texto}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className={styles.calcularBox}>
              {errorCalc && <p className={styles.errorMsg}>{errorCalc}</p>}
              <button className={styles.calcularBtn} onClick={calcular}>
                Ver mi perfil de riesgo →
              </button>
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {fase === 'resultado' && (
          <div>
            <div className={styles.resultadoHero}>
              <div className={styles.perfilBadge}>Tu perfil</div>
              <h2 className={styles.perfilNombre}>{perfil.nombre}</h2>
              <p className={styles.perfilDescripcion}>{perfil.descripcion}</p>
              <p className={styles.puntuacionTotal}>
                Puntuación: <strong>{puntuacionTotal}</strong> / 80
              </p>
            </div>

            {/* Desglose por dimensiones */}
            <div className={styles.dimensionesResultado}>
              <h3>Desglose por dimensión</h3>
              {DIMENSIONES.map((dim, di) => {
                const { pct, suma, max } = puntuacionesDimension[di];
                const nivel = nivelDimension(pct);
                const fillClass = pct < 40 ? styles.dimBarFillLow : pct < 70 ? styles.dimBarFillMid : styles.dimBarFillHigh;
                return (
                  <div key={di} className={styles.dimRow}>
                    <div className={styles.dimRowHeader}>
                      <span className={styles.dimRowLabel}>{dim.icono} {dim.nombre}</span>
                      <span className={styles.dimRowScore}>{nivel} ({suma}/{max})</span>
                    </div>
                    <div className={styles.dimBarTrack}>
                      <div
                        className={`${styles.dimBarFill} ${fillClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Asignación de activos */}
            <div className={styles.asignacionBox}>
              <h3>Asignación de activos sugerida</h3>
              <div className={styles.asignacionBarras}>
                <div className={styles.asignacionFila}>
                  <span className={styles.asignacionEtiqueta}>Renta Fija</span>
                  <div
                    className={`${styles.asignacionBar} ${styles.barRF}`}
                    style={{ width: `${(perfil.rf / 100) * maxBarWidth}px` }}
                    aria-label={`Renta fija: ${perfil.rf}%`}
                  />
                  <span className={styles.asignacionPct}>{perfil.rf}%</span>
                </div>
                <div className={styles.asignacionFila}>
                  <span className={styles.asignacionEtiqueta}>Renta Variable</span>
                  <div
                    className={`${styles.asignacionBar} ${styles.barRV}`}
                    style={{ width: `${(perfil.rv / 100) * maxBarWidth}px` }}
                    aria-label={`Renta variable: ${perfil.rv}%`}
                  />
                  <span className={styles.asignacionPct}>{perfil.rv}%</span>
                </div>
              </div>
              <p className={styles.asignacionDetalle}>{perfil.detalle}</p>
            </div>

            {/* Recomendaciones */}
            <div className={styles.recomendacionesBox}>
              <h3>Recomendaciones para tu perfil</h3>
              <ul className={styles.recomendacionesList}>
                {perfil.recomendaciones.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className={styles.repetirBtn} onClick={reiniciar}>
                Repetir el test
              </button>
            </div>
          </div>
        )}

        <EducationalSection
          title="Guía sobre Tolerancia al Riesgo"
          subtitle="Por qué importa conocer tu perfil inversor real antes de invertir"
        >
          {/* Tabla comparativa */}
          <h3>Los 5 Perfiles de Inversor</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>RF / RV</th>
                  <th>Pérdida máx. tolerable</th>
                  <th>Horizonte recomendado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Conservador</strong></td>
                  <td>85% / 15%</td>
                  <td>~5%</td>
                  <td>Cualquiera</td>
                </tr>
                <tr>
                  <td><strong>Moderado-Conservador</strong></td>
                  <td>65% / 35%</td>
                  <td>~15%</td>
                  <td>3+ años</td>
                </tr>
                <tr>
                  <td><strong>Moderado</strong></td>
                  <td>40% / 60%</td>
                  <td>~25%</td>
                  <td>5+ años</td>
                </tr>
                <tr>
                  <td><strong>Moderado-Agresivo</strong></td>
                  <td>20% / 80%</td>
                  <td>~40%</td>
                  <td>7+ años</td>
                </tr>
                <tr>
                  <td><strong>Agresivo</strong></td>
                  <td>5% / 95%</td>
                  <td>+50%</td>
                  <td>10+ años</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Casos de uso */}
          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>El ahorrador de 55 años</h4>
              <p>Con la jubilación a 10 años vista y sin experiencia inversora, el test normalmente arroja perfil conservador o moderado-conservador. Prioridad: preservar capital y batir la inflación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>El joven con ingresos estables</h4>
              <p>25 años, contrato indefinido, sin deudas y un fondo de emergencia sólido. El test suele dar perfil agresivo o moderado-agresivo: el tiempo juega a su favor.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>El autónomo variable</h4>
              <p>Sus ingresos fluctúan mucho. Aunque mentalmente tolera el riesgo, la dimensión de Capacidad Financiera reduce su perfil real: moderado suele ser más apropiado.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>La pareja con hipoteca reciente</h4>
              <p>Deuda alta y compromisos familiares reducen la capacidad de asumir pérdidas. El perfil real suele ser un nivel más conservador de lo que intuyen.</p>
            </div>
          </div>

          {/* FAQ */}
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué mi perfil «real» puede diferir del que yo creía tener?</strong>
              <p>En momentos tranquilos todos nos creemos más valientes. El test lo corrige evaluando tu situación financiera objetiva, no solo tu tolerancia emocional declarada.</p>
              <p className={styles.faqTip}>La dimensión Capacidad Financiera suele sorprender: puedes tolerar el riesgo emocionalmente pero no económicamente.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Con qué frecuencia debería repetir el test?</strong>
              <p>Al menos cada 2-3 años, o ante cambios vitales significativos: nuevo empleo, matrimonio, hijos, herencia, cambio de deuda. Tu perfil evoluciona con tu vida.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué son la renta fija y la renta variable?</strong>
              <p>Renta fija (bonos, depósitos): rentabilidad predecible y menor volatilidad. Renta variable (acciones, ETFs): mayor rentabilidad potencial a largo plazo pero mayor volatilidad a corto.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puedo tener un perfil diferente para distintos objetivos?</strong>
              <p>Sí. Muchos inversores tienen dos «bolsillos»: uno conservador para el dinero que necesitan en 3-5 años, y uno agresivo para el dinero a largo plazo. Es una estrategia válida y recomendable.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿La asignación de activos sugerida es una recomendación de inversión?</strong>
              <p>No. Es una referencia orientativa basada en modelos académicos estándar. Un asesor financiero certificado debe ajustarla a tu situación fiscal, patrimonio y objetivos concretos.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el horizonte temporal importa tanto?</strong>
              <p>El tiempo amortiza la volatilidad. Con 20 años de horizonte, una caída del 40% se convierte en una oportunidad. Con 1 año, puede ser catastrófica. El tiempo es el mejor aliado del inversor en renta variable.</p>
            </div>
          </div>

          {/* Guía paso a paso */}
          <h3>Cómo Usar tu Perfil para Invertir — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Anota tu perfil y puntuación por dimensión</strong>
                <p>Guarda los resultados. Las dimensiones con puntuación baja son tus puntos de atención: ¿es la capacidad financiera? ¿El conocimiento? Eso determina por dónde empezar a mejorar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Define tu asignación de activos objetivo</strong>
                <p>Parte de la asignación sugerida como referencia y ajústala con un profesional según tu situación fiscal y patrimonio total (inmuebles, planes de pensiones, etc.).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Elige instrumentos acordes a tu perfil</strong>
                <p>Conservador → fondos monetarios y renta fija. Moderado → ETFs mixtos y carteras indexadas. Agresivo → ETFs de renta variable global con amplia diversificación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Automatiza y no mires a diario</strong>
                <p>Configura aportaciones periódicas automáticas (DCA). Revisar la cartera a diario aumenta la ansiedad y la probabilidad de tomar malas decisiones emocionales.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Rebalancea anualmente y repite el test</strong>
                <p>Una vez al año comprueba que la asignación de activos sigue siendo la objetivo (el mercado la habrá desplazado). Y repite el test si cambia tu situación vital.</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <h3>Mejores Prácticas del Inversor Consciente</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <div>
                <strong>Diversifica siempre</strong>
                <p>Nunca concentres más del 5-10% en un solo activo. La diversificación es la única estrategia gratuita de reducción de riesgo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <div>
                <strong>Piensa en décadas</strong>
                <p>El mercado de valores ha subido el 100% de los periodos de 20 años históricos. El tiempo es tu aliado más poderoso.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧘</span>
              <div>
                <strong>Controla los sesgos cognitivos</strong>
                <p>Aversión a pérdidas, efecto manada, exceso de confianza. Conocerlos es el primer paso para no caer en ellos.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💸</span>
              <div>
                <strong>Los costes importan más de lo que crees</strong>
                <p>Un 1% extra de comisión anual puede reducir tu patrimonio final un 25% en 30 años. Prefiere fondos indexados de bajo coste.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Adapta el perfil a tu edad</strong>
                <p>Regla clásica: porcentaje en renta fija ≈ tu edad. Con 30 años: 30% RF. Con 60: 60% RF. Es una simplificación, pero útil como guía.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <div>
                <strong>Asegura el fondo de emergencia primero</strong>
                <p>Nunca inviertas dinero que puedas necesitar en menos de 12 meses. Sin colchón, cualquier imprevisto te forzará a vender en el peor momento.</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Más Frecuentes del Inversor Particular
            </div>
            <ul className={styles.warningList}>
              <li>Sobreestimar la tolerancia al riesgo en mercados alcistas — y vender en pánico en la primera corrección.</li>
              <li>Invertir dinero que se puede necesitar a corto plazo: fuerza ventas en el peor momento.</li>
              <li>Concentrar en acciones de una sola empresa o sector creyendo «conocerlas bien».</li>
              <li>Ignorar los costes de fondos: las comisiones de gestión elevadas destruyen rentabilidad a largo plazo.</li>
              <li>Cambiar de estrategia constantemente persiguiendo la rentabilidad del año anterior.</li>
              <li>No revisar el perfil cuando cambia la situación vital: un inversor agresivo a los 25 no debería serlo a los 60.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-tolerancia-riesgo-detallado')} />
        <ShareCard appName="test-tolerancia-riesgo-detallado" />
      </main>

      <Footer appName="test-tolerancia-riesgo-detallado" />
    </div>
  );
}
