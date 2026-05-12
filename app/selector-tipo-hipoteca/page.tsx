'use client';

import React, { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorTipoHipoteca.module.css';

// ==========================================
// TIPOS
// ==========================================

type RecomendacionKey = 'fija' | 'variable' | 'mixta' | 'verde';

interface OpcionPregunta {
  texto: string;
  icono: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  icono: string;
  opciones: OpcionPregunta[];
}

interface Recomendacion {
  key: RecomendacionKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  caracteristicas: string[];
  alertas: string[];
}

// ==========================================
// DATOS DEL TEST
// ==========================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cómo reaccionarías si tu cuota mensual subiera 150-200 € en los próximos años?',
    icono: '📈',
    opciones: [
      {
        texto: 'Me generaría mucho estrés, prefiero saber siempre cuánto pago',
        icono: '😟',
        pesos: { fija: 5 },
      },
      {
        texto: 'Lo toleraría si al principio las condiciones fueran mejores',
        icono: '🤔',
        pesos: { mixta: 3, variable: 2 },
      },
      {
        texto: 'No me preocuparía, puedo absorber la variación sin problemas',
        icono: '📊',
        pesos: { variable: 5 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿A cuántos años tienes previsto contratar la hipoteca?',
    icono: '📅',
    opciones: [
      {
        texto: 'Menos de 15 años',
        icono: '⏱️',
        pesos: { fija: 3, variable: 2 },
      },
      {
        texto: 'Entre 15 y 25 años',
        icono: '📆',
        pesos: { fija: 3, mixta: 2 },
      },
      {
        texto: 'Más de 25 años',
        icono: '🗓️',
        pesos: { variable: 3, mixta: 3 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿Cómo describirías tu situación laboral e ingresos actuales?',
    icono: '💼',
    opciones: [
      {
        texto: 'Contrato indefinido con ingresos estables desde hace varios años',
        icono: '✅',
        pesos: { fija: 3, mixta: 2 },
      },
      {
        texto: 'Ingresos variables, comisiones o situación de autónomo/a',
        icono: '📊',
        pesos: { variable: 3, mixta: 2 },
      },
      {
        texto: 'Doble ingreso familiar estable (pareja con nómina)',
        icono: '👫',
        pesos: { variable: 4, mixta: 2 },
      },
      {
        texto: 'Contrato temporal o ingresos recientes',
        icono: '⚠️',
        pesos: { fija: 4 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿La vivienda que vas a hipotecar tiene certificado energético A o B?',
    icono: '🌿',
    opciones: [
      {
        texto: 'Sí, tiene calificación energética A o B (o me lo van a confirmar)',
        icono: '🏡',
        pesos: { verde: 6 },
      },
      {
        texto: 'No lo sé todavía, pero la vivienda es de obra nueva',
        icono: '🏗️',
        pesos: { verde: 3, fija: 1 },
      },
      {
        texto: 'No, es una vivienda de segunda mano sin certificado eficiente',
        icono: '🏠',
        pesos: { fija: 2, variable: 2, mixta: 2 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Dispones de ahorros suficientes para realizar amortizaciones anticipadas?',
    icono: '💰',
    opciones: [
      {
        texto: 'Sí, podría amortizar capital de forma anticipada regularmente',
        icono: '💸',
        pesos: { variable: 4, mixta: 2 },
      },
      {
        texto: 'Quizás de forma puntual, pero no de manera habitual',
        icono: '🪙',
        pesos: { mixta: 3, fija: 1 },
      },
      {
        texto: 'No, mis ahorros son justos para la entrada y gastos iniciales',
        icono: '🏦',
        pesos: { fija: 4 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Tienes previsto vender o cambiar de vivienda antes de 10 años?',
    icono: '🔄',
    opciones: [
      {
        texto: 'Sí, es probable que venda o me cambie antes de esa fecha',
        icono: '🚚',
        pesos: { variable: 4, mixta: 2 },
      },
      {
        texto: 'No lo sé, dependerá de cómo evolucione mi situación',
        icono: '🤷',
        pesos: { mixta: 3, variable: 1 },
      },
      {
        texto: 'No, esta es mi vivienda habitual a largo plazo',
        icono: '🏠',
        pesos: { fija: 4, mixta: 1 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Qué prefieres al planificar tu presupuesto mensual?',
    icono: '📋',
    opciones: [
      {
        texto: 'Cuota fija e invariable: saber siempre exactamente cuánto pagaré',
        icono: '📌',
        pesos: { fija: 5 },
      },
      {
        texto: 'Prefiero una cuota fija los primeros años y luego más flexible',
        icono: '⚖️',
        pesos: { mixta: 5 },
      },
      {
        texto: 'Acepto variaciones si el tipo medio puede ser más bajo a largo plazo',
        icono: '📉',
        pesos: { variable: 5 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿El importe del préstamo es elevado en relación con tus ingresos anuales?',
    icono: '⚖️',
    opciones: [
      {
        texto: 'Sí, el préstamo supera 5-6 veces mis ingresos anuales brutos',
        icono: '📐',
        pesos: { fija: 4 },
      },
      {
        texto: 'Moderado, entre 3 y 5 veces mis ingresos anuales',
        icono: '📏',
        pesos: { fija: 2, mixta: 2 },
      },
      {
        texto: 'Bajo, menos de 3 veces mis ingresos anuales',
        icono: '✅',
        pesos: { variable: 3, mixta: 2 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Es tu primera vivienda o vas a hipotecar una inversión/segunda residencia?',
    icono: '🏡',
    opciones: [
      {
        texto: 'Primera vivienda habitual, es donde voy a vivir',
        icono: '🏠',
        pesos: { fija: 3, mixta: 2 },
      },
      {
        texto: 'Segunda residencia o vivienda vacacional',
        icono: '🏖️',
        pesos: { variable: 3, mixta: 2 },
      },
      {
        texto: 'Inversión para alquilar o rentabilizar',
        icono: '📈',
        pesos: { variable: 4, mixta: 2 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Tienes pareja con ingresos propios estables que también firmará la hipoteca?',
    icono: '👥',
    opciones: [
      {
        texto: 'Sí, somos dos titulares con ingresos estables',
        icono: '👫',
        pesos: { variable: 3, mixta: 3 },
      },
      {
        texto: 'Sí, pero solo uno de los dos tiene ingresos regulares',
        icono: '👤',
        pesos: { fija: 3, mixta: 1 },
      },
      {
        texto: 'No, soy el único titular',
        icono: '🙋',
        pesos: { fija: 3, mixta: 1 },
      },
    ],
  },
];

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  fija: {
    key: 'fija',
    titulo: 'Hipoteca a Tipo Fijo',
    subtitulo: 'Cuota estable durante toda la vida del préstamo, ideal si priorizas la seguridad',
    descripcion:
      'La hipoteca a tipo fijo mantiene el mismo interés —y por tanto la misma cuota— durante todos los años del préstamo, independientemente de cómo evolucione el euríbor. Es la opción preferida por quienes valoran la tranquilidad y la certeza en su planificación financiera. Aunque el tipo inicial suele ser algo más alto que el variable, elimina completamente el riesgo de subidas futuras.',
    caracteristicas: [
      'Cuota mensual invariable siempre',
      'Tipo de interés no referenciado al euríbor',
      'Ideal para plazos largos (20-30 años)',
      'Mayor seguridad ante subidas de tipos',
      'TIN fijo de referencia: 3 % – 4,5 %',
      'Comisión por amortización anticipada posible',
    ],
    alertas: [
      'El tipo fijo inicial suele ser superior al variable; compara el coste total con escenarios de euríbor',
      'Si los tipos bajan significativamente, no te beneficiarás de esa reducción',
      'Verifica la comisión por amortización anticipada (máx. 2 % primeros 10 años, Ley 5/2019)',
      'Compara el TAE entre entidades, no solo el TIN',
    ],
  },
  variable: {
    key: 'variable',
    titulo: 'Hipoteca a Tipo Variable',
    subtitulo:
      'Referenciada al euríbor; puede ser más barata si los tipos bajan, para perfiles con tolerancia al riesgo',
    descripcion:
      'La hipoteca variable está referenciada habitualmente al euríbor a 12 meses, más un diferencial fijo pactado con el banco. La cuota se revisa periódicamente (cada 6 o 12 meses), lo que significa que puede subir o bajar según la evolución del mercado. Históricamente ha resultado más barata en ciclos de tipos bajos, pero implica asumir el riesgo de incrementos de cuota.',
    caracteristicas: [
      'Cuota revisada cada 6 o 12 meses',
      'Índice de referencia: euríbor a 12 meses',
      'Diferencial fijo + euríbor variable',
      'Tipo inicial más bajo que el fijo',
      'Beneficia si el euríbor baja',
      'Mayor riesgo ante subidas del euríbor',
    ],
    alertas: [
      'Simula tu cuota con euríbor al 4 % o 5 % para evaluar el peor escenario',
      'Comprueba el diferencial: la suma euríbor + diferencial es el tipo real que pagarás',
      'Las revisiones de cuota pueden implicar variaciones de cientos de euros al mes',
      'La Ley 5/2019 obliga al banco a entregarte la FEIN y la FIAE antes de firmar',
    ],
  },
  mixta: {
    key: 'mixta',
    titulo: 'Hipoteca Mixta',
    subtitulo:
      'Tipo fijo los primeros años (5-10) y variable el resto; equilibrio entre seguridad y ahorro',
    descripcion:
      'La hipoteca mixta combina un período inicial a tipo fijo —habitualmente entre 5 y 10 años— con el resto del plazo a tipo variable referenciado al euríbor. Ofrece estabilidad en la fase inicial, cuando el capital pendiente es mayor y la cuota es más alta, y mayor flexibilidad en la segunda etapa. Es una opción equilibrada para quienes no quieren renunciar del todo a la seguridad ni al ahorro potencial.',
    caracteristicas: [
      'Fase fija inicial: 5, 7 o 10 años habitualmente',
      'Fase variable: euríbor + diferencial',
      'Equilibrio entre previsibilidad y coste',
      'Buena opción si planeas amortizar al inicio',
      'Ideal para plazos de 20-30 años',
      'Menor cuota inicial que la pura fija',
    ],
    alertas: [
      'Revisa exactamente cuántos años dura la fase fija y en qué condiciones pasa a variable',
      'Si vendes antes de que termine el período fijo, habrás pagado un diferencial más alto sin aprovecharlo',
      'La fase variable puede encarecer mucho la hipoteca si el euríbor sube al final del plazo',
      'Compara siempre el coste total (TAE) con una fija y una variable puras',
    ],
  },
  verde: {
    key: 'verde',
    titulo: 'Hipoteca Verde',
    subtitulo:
      'Bonificación en el tipo si la vivienda tiene certificado energético A o B; para viviendas eficientes',
    descripcion:
      'La hipoteca verde o ecológica ofrece condiciones especiales —tipo de interés bonificado, mejores diferenciales o comisiones reducidas— a quienes compran o rehabilitan viviendas con certificado de eficiencia energética A o B. La mayoría de entidades financieras en España la ofrecen como una variante de su hipoteca fija, variable o mixta, con un descuento adicional por el compromiso ambiental.',
    caracteristicas: [
      'Bonificación sobre el tipo por eficiencia energética',
      'Requiere certificado energético A o B',
      'Aplica en obra nueva y grandes rehabilitaciones',
      'Disponible como fija, variable o mixta',
      'Algunas entidades exigen justificación posterior',
      'Ahorro en cuota y en consumo energético',
    ],
    alertas: [
      'Verifica que la bonificación verde compensa frente a la hipoteca estándar equivalente',
      'El certificado energético debe estar emitido por técnico competente e inscrito en el registro autonómico',
      'Algunas hipotecas verdes exigen revisión de la calificación energética al cabo de X años',
      'Comprueba si la bonificación es permanente o solo durante los primeros años',
    ],
  },
};

// ==========================================
// LÓGICA DE PUNTUACIÓN
// ==========================================

type Respuestas = Record<number, number>;

function calcularResultado(respuestas: Respuestas): {
  ganador: RecomendacionKey;
  puntuaciones: Record<RecomendacionKey, number>;
} {
  const puntuaciones: Record<RecomendacionKey, number> = {
    fija: 0,
    variable: 0,
    mixta: 0,
    verde: 0,
  };

  Object.entries(respuestas).forEach(([preguntaId, opcionIdx]) => {
    const pregunta = PREGUNTAS.find((p) => p.id === Number(preguntaId));
    if (!pregunta) return;
    const opcion = pregunta.opciones[opcionIdx];
    if (!opcion) return;
    (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
      puntuaciones[key] += opcion.pesos[key] ?? 0;
    });
  });

  const ganador = (Object.keys(puntuaciones) as RecomendacionKey[]).reduce((a, b) =>
    puntuaciones[a] >= puntuaciones[b] ? a : b
  );

  return { ganador, puntuaciones };
}

const ETIQUETAS: Record<RecomendacionKey, string> = {
  fija: 'Tipo fijo',
  variable: 'Tipo variable',
  mixta: 'Mixta',
  verde: 'Hipoteca verde',
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function SelectorTipoHipotecaPage() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const pregunta = PREGUNTAS[preguntaActual];
  const totalPreguntas = PREGUNTAS.length;
  const porcentaje = Math.round(((preguntaActual + 1) / totalPreguntas) * 100);
  const respuestaActual = respuestas[pregunta.id];
  const haRespondido = respuestaActual !== undefined;

  function seleccionarOpcion(idx: number) {
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: idx }));
  }

  function irAnterior() {
    if (preguntaActual > 0) setPreguntaActual((p) => p - 1);
  }

  function irSiguiente() {
    if (haRespondido && preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    }
  }

  function verResultado() {
    if (haRespondido) setMostrarResultado(true);
  }

  function reiniciar() {
    setRespuestas({});
    setPreguntaActual(0);
    setMostrarResultado(false);
  }

  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;

  // ---- Resultado ----
  let resultado: {
    ganador: RecomendacionKey;
    puntuaciones: Record<RecomendacionKey, number>;
  } | null = null;
  if (mostrarResultado) {
    resultado = calcularResultado(respuestas);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          🏠 ¿Qué tipo de hipoteca te conviene?
        </h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para encontrar la hipoteca adecuada a tu perfil: fija, variable,
          mixta o verde para vivienda eficiente.
        </p>
      </header>

      <LegalNotice />

      {/* ==================== TEST ==================== */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de tipo de hipoteca">
          {/* Progreso */}
          <div className={styles.progreso} role="status" aria-live="polite">
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-valuenow={porcentaje}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso: pregunta ${preguntaActual + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoFill} style={{ width: `${porcentaje}%` }} />
            </div>
            <p className={styles.progresoTexto}>
              Pregunta {preguntaActual + 1} de {totalPreguntas}
            </p>
          </div>

          {/* Tarjeta de pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero} aria-hidden="true">
              <span aria-hidden="true">{pregunta.icono}</span> Pregunta {pregunta.id}
            </p>
            <p className={styles.preguntaTexto} id={`pregunta-${pregunta.id}`}>
              {pregunta.texto}
            </p>

            <div
              className={styles.opciones}
              role="group"
              aria-labelledby={`pregunta-${pregunta.id}`}
            >
              {pregunta.opciones.map((opcion, idx) => {
                const seleccionada = respuestaActual === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.opcionBtn} ${seleccionada ? styles.selected : ''}`}
                    aria-pressed={seleccionada}
                    onClick={() => seleccionarOpcion(idx)}
                  >
                    <span aria-hidden="true">{opcion.icono}</span> {opcion.texto}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>

            {!esUltimaPregunta ? (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={!haRespondido}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={!haRespondido}
                aria-label="Ver mi resultado"
              >
                Ver resultado
              </button>
            )}
          </div>
        </section>
      )}

      {/* ==================== RESULTADO ==================== */}
      {mostrarResultado && resultado && (
        <section
          className={styles.resultadoSection}
          aria-label="Resultado del test"
          role="region"
        >
          {(() => {
            const rec = RECOMENDACIONES[resultado.ganador];
            const cardClass =
              styles[`recomendacion_${resultado.ganador}` as keyof typeof styles];
            const otrosTipos = (
              Object.keys(resultado.puntuaciones) as RecomendacionKey[]
            )
              .filter((k) => k !== resultado.ganador)
              .sort((a, b) => resultado.puntuaciones[b] - resultado.puntuaciones[a]);

            return (
              <div className={`${styles.resultadoCard} ${cardClass}`} role="alert">
                <span className={styles.recomendacionBadge} aria-hidden="true">
                  Hipoteca recomendada
                </span>
                <h2 className={styles.recomendacionTitulo}>{rec.titulo}</h2>
                <p className={styles.recomendacionSubtitulo}>{rec.subtitulo}</p>
                <p className={styles.recomendacionDesc}>{rec.descripcion}</p>

                {/* Características */}
                <div
                  className={styles.caracteristicasGrid}
                  aria-label="Características principales"
                >
                  {rec.caracteristicas.map((c, i) => (
                    <div key={i} className={styles.caracteristicaCard}>
                      {c}
                    </div>
                  ))}
                </div>

                {/* Alertas */}
                {rec.alertas.length > 0 && (
                  <div className={styles.alertasSection} role="note">
                    <p className={styles.alertasTitulo}>
                      <span aria-hidden="true">⚠️</span> Ten en cuenta
                    </p>
                    <ul className={styles.alertasLista}>
                      {rec.alertas.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Puntuaciones secundarias */}
                <div className={styles.puntuacionesSecundarias}>
                  <p className={styles.puntuacionesTitulo}>Otras opciones que podrían encajarte</p>
                  <div className={styles.puntuacionesLista}>
                    {otrosTipos
                      .filter((k) => resultado.puntuaciones[k] > 0)
                      .map((k) => (
                        <span key={k} className={styles.puntuacionItem}>
                          {ETIQUETAS[k]} ({resultado.puntuaciones[k]} pt)
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })()}

          <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
            Repetir el test
          </button>
        </section>
      )}

      {/* ==================== DISCLAIMER (visible, no colapsable) ==================== */}
      <DisclaimerCard variant="financial" severity="critical" />

      {/* ==================== SECCIÓN EDUCATIVA ==================== */}
      <EducationalSection
        title="Tipos de hipoteca en España"
        subtitle="Todo lo que necesitas saber antes de firmar"
      >
        <h3>Hipoteca fija: máxima previsibilidad</h3>
        <p>
          La <strong>hipoteca a tipo fijo</strong> garantiza la misma cuota durante toda la vida
          del préstamo. Su principal ventaja es la certeza: ni el euríbor ni ningún otro índice
          externo afecta a lo que pagas cada mes. Históricamente era más cara que la variable,
          pero tras el ciclo de subidas de tipos iniciado en 2022, muchas entidades han ajustado
          sus tipos fijos a niveles más competitivos. Es la opción preferida por quienes valoran
          la estabilidad de la cuota frente a la posibilidad de un menor coste medio.
        </p>

        <h3>Hipoteca variable: vinculada al euríbor</h3>
        <p>
          La <strong>hipoteca variable</strong> está referenciada al euríbor a 12 meses más un
          diferencial fijo negociado con el banco. La cuota sube o baja según la revisión
          periódica (semestral o anual). En ciclos de tipos bajos puede suponer un ahorro
          significativo frente a la fija, pero cuando el euríbor sube —como ocurrió entre
          2022 y 2024—, las cuotas pueden aumentar cientos de euros al mes. Es adecuada para
          perfiles con colchón financiero, horizonte corto o intención de amortizar
          anticipadamente.
        </p>

        <h3>Hipoteca mixta: lo mejor de dos mundos</h3>
        <p>
          La <strong>hipoteca mixta</strong> combina un tramo inicial a tipo fijo (normalmente
          5, 7 o 10 años) con el resto del plazo a tipo variable. Ofrece seguridad en la fase
          inicial, cuando el capital pendiente es mayor y la cuota más pesada, y mayor
          flexibilidad posterior. Es una buena solución para quienes prevén mejorar sus ingresos
          con el tiempo o piensan amortizar anticipadamente en los primeros años.
        </p>

        <h3>Hipoteca verde: bonificación por eficiencia energética</h3>
        <p>
          La <strong>hipoteca verde o ecológica</strong> premia la compra o rehabilitación de
          viviendas con certificado energético A o B mediante un descuento sobre el tipo de
          interés habitual. Muchos bancos en España la ofrecen como variante de sus hipotecas
          fija, variable o mixta. Además del ahorro financiero, una vivienda eficiente reduce
          la factura energética y puede incrementar su valor de mercado. Requiere que el
          certificado esté emitido por técnico competente e inscrito en el registro autonómico
          correspondiente.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>La Ley 5/2019 te protege:</strong> antes de firmar cualquier hipoteca, el
          banco está obligado a entregarte la FIPRE (Ficha de Información Precontractual), la
          FEIN (Ficha Europea de Información Normalizada) y la FIAE (Ficha de Advertencias
          Estandarizadas). Tienes al menos 10 días para estudiarlas antes de la firma ante
          notario. El notario también debe darte asesoramiento gratuito e imparcial. No firmes
          bajo presión y consulta siempre con un asesor independiente si tienes dudas.
        </div>

        <h3>¿Cómo funciona el euríbor?</h3>
        <p>
          El <strong>euríbor (Euro Interbank Offered Rate)</strong> es el tipo al que los
          principales bancos europeos se prestan dinero entre sí. Es el índice de referencia
          más usado en las hipotecas variables de España. Se publica diariamente y el euríbor
          a 12 meses es el más habitual en las revisiones hipotecarias. Depende de la política
          monetaria del Banco Central Europeo (BCE): cuando el BCE sube los tipos para controlar
          la inflación, el euríbor tiende a subir, encareciendo las hipotecas variables.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-tipo-hipoteca')} />
      <ShareCard appName="selector-tipo-hipoteca" />
      <Footer appName="selector-tipo-hipoteca" />
    </div>
  );
}
