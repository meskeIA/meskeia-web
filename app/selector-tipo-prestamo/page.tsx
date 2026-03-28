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
import styles from './SelectorTipoPrestamo.module.css';

// ==========================================
// TIPOS
// ==========================================

type RecomendacionKey =
  | 'personal'
  | 'hipotecario'
  | 'consumo'
  | 'linea_credito'
  | 'microcredito';

interface OpcionPregunta {
  texto: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
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
    texto: '¿Para qué necesitas la financiación?',
    opciones: [
      { texto: 'Comprar o reformar una vivienda', pesos: { hipotecario: 5 } },
      { texto: 'Comprar un coche o moto', pesos: { personal: 3, consumo: 2 } },
      { texto: 'Gastos corrientes o imprevistos', pesos: { linea_credito: 3, consumo: 2 } },
      { texto: 'Montar un negocio o proyecto', pesos: { microcredito: 3, personal: 2 } },
      { texto: 'Consolidar deudas existentes', pesos: { personal: 3 } },
    ],
  },
  {
    id: 2,
    texto: '¿Qué importe necesitas aproximadamente?',
    opciones: [
      { texto: 'Menos de 3.000 €', pesos: { microcredito: 4, consumo: 3 } },
      { texto: 'Entre 3.000 € y 15.000 €', pesos: { personal: 4, consumo: 2 } },
      { texto: 'Entre 15.000 € y 60.000 €', pesos: { personal: 3, linea_credito: 2 } },
      { texto: 'Más de 60.000 €', pesos: { hipotecario: 5 } },
    ],
  },
  {
    id: 3,
    texto: '¿En cuánto tiempo podrías devolver el dinero?',
    opciones: [
      { texto: 'Menos de 1 año', pesos: { linea_credito: 3, consumo: 3 } },
      { texto: 'Entre 1 y 5 años', pesos: { personal: 4, consumo: 2 } },
      { texto: 'Entre 5 y 15 años', pesos: { personal: 2, hipotecario: 2 } },
      { texto: 'Más de 15 años', pesos: { hipotecario: 5 } },
    ],
  },
  {
    id: 4,
    texto: '¿Tienes un bien que puedas dar como garantía (aval)?',
    opciones: [
      { texto: 'Sí, tengo propiedad inmobiliaria', pesos: { hipotecario: 4 } },
      { texto: 'Tengo algún bien pero no inmueble', pesos: { personal: 1 } },
      { texto: 'No tengo garantías reales', pesos: { microcredito: 2, consumo: 2, personal: 1 } },
      { texto: 'Prefiero no dar garantías', pesos: { linea_credito: 2, consumo: 2 } },
    ],
  },
  {
    id: 5,
    texto: '¿Cómo es tu situación laboral y de ingresos?',
    opciones: [
      {
        texto: 'Empleado con contrato indefinido y nómina estable',
        pesos: { hipotecario: 3, personal: 3 },
      },
      {
        texto: 'Empleado temporal o con ingresos variables',
        pesos: { personal: 2, consumo: 2 },
      },
      { texto: 'Autónomo o freelance', pesos: { microcredito: 3, personal: 2 } },
      {
        texto: 'Sin ingresos fijos o en transición laboral',
        pesos: { microcredito: 3, consumo: 1 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Con qué urgencia necesitas el dinero?',
    opciones: [
      { texto: 'Urgente, en pocos días', pesos: { consumo: 4, linea_credito: 4 } },
      { texto: 'Relativamente pronto, en 2-4 semanas', pesos: { personal: 3 } },
      { texto: 'Puedo esperar 1-2 meses', pesos: { personal: 2, hipotecario: 2 } },
      { texto: 'Sin prisa, puedo planificarlo bien', pesos: { hipotecario: 3 } },
    ],
  },
  {
    id: 7,
    texto: '¿Tienes ya deudas o préstamos activos?',
    opciones: [
      { texto: 'No, sería el primero', pesos: { hipotecario: 2, personal: 2 } },
      { texto: 'Sí, uno o dos y los gestiono bien', pesos: { personal: 2 } },
      {
        texto: 'Varios, me está costando gestionarlos',
        pesos: { personal: 2, linea_credito: 1 },
      },
      { texto: 'Muchos, quiero consolidarlos en uno solo', pesos: { personal: 3 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cómo valoras la flexibilidad de uso del dinero?',
    opciones: [
      {
        texto: 'Necesito disposición flexible, no sé exactamente qué gastaré',
        pesos: { linea_credito: 5 },
      },
      {
        texto: 'El importe está claro y es fijo',
        pesos: { personal: 3, hipotecario: 3 },
      },
      {
        texto: 'Pequeñas cantidades según necesidad puntual',
        pesos: { microcredito: 3, consumo: 2 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Tienes buen historial crediticio?',
    opciones: [
      { texto: 'Sí, sin incidencias ni retrasos', pesos: { hipotecario: 3, personal: 3 } },
      {
        texto: 'Desconozco mi historial o tuve algún retraso menor',
        pesos: { personal: 2, consumo: 2 },
      },
      {
        texto: 'Tengo incidencias en ficheros de morosidad (ASNEF…)',
        pesos: { microcredito: 3, consumo: 1 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿La financiación está relacionada con un proyecto profesional o de negocio?',
    opciones: [
      {
        texto: 'Sí, es para emprender o para mi negocio',
        pesos: { microcredito: 4, personal: 2 },
      },
      {
        texto: 'Parcialmente, tiene componente profesional',
        pesos: { personal: 2 },
      },
      {
        texto: 'No, es exclusivamente para uso personal',
        pesos: { personal: 2, consumo: 2, hipotecario: 1 },
      },
    ],
  },
];

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  personal: {
    key: 'personal',
    titulo: 'Préstamo Personal',
    subtitulo: 'La opción más versátil para importes medios sin garantía inmobiliaria',
    descripcion:
      'El préstamo personal es la solución más habitual para financiar proyectos de importe medio sin necesidad de aportar garantías inmobiliarias. Los bancos y financieras valoran principalmente tu nómina, historial crediticio y nivel de endeudamiento. Ofrece plazos razonables y un proceso de aprobación más ágil que el hipotecario.',
    caracteristicas: [
      'TAE típica: 6 % – 15 %',
      'Plazos habituales: 1 a 8 años',
      'Sin garantía inmobiliaria',
      'Aprobación en días',
      'Importe: 3.000 € – 60.000 €',
      'Cuota fija mensual (sistema francés)',
    ],
    alertas: [
      'Compara el TAE entre entidades, no solo la cuota mensual',
      'Las comisiones de apertura y cancelación anticipada elevan el coste real',
      'Asegúrate de que la cuota mensual no supere el 30-35 % de tus ingresos netos',
    ],
  },
  hipotecario: {
    key: 'hipotecario',
    titulo: 'Préstamo Hipotecario',
    subtitulo: 'Para importes elevados con garantía inmobiliaria y mejores condiciones',
    descripcion:
      'El préstamo hipotecario está diseñado para financiar importes elevados respaldados por un bien inmueble como garantía. Ofrece las mejores condiciones del mercado en cuanto a TAE y plazos, pero el proceso es más largo y exige documentación extensa. Es la opción habitual para la compra, rehabilitación o ampliación de vivienda.',
    caracteristicas: [
      'TAE típica: 3 % – 5 %',
      'Plazos de hasta 30 años',
      'Requiere tasación del inmueble',
      'Proceso de 1-3 meses',
      'Importe superior a 60.000 €',
      'Fijo, variable o mixto',
    ],
    alertas: [
      'La FIPRE, FEIN y FIAE son documentos obligatorios que debes leer antes de firmar',
      'Evalúa la hipoteca variable con escenarios de tipos altos (euríbor +3 %)',
      'Los seguros vinculados pueden encarecer el producto total',
      'El Banco de España ofrece simuladores y guías hipotecarias gratuitas',
    ],
  },
  consumo: {
    key: 'consumo',
    titulo: 'Crédito al Consumo',
    subtitulo: 'Rápido para importes pequeños, pero con coste más elevado',
    descripcion:
      'El crédito al consumo cubre importes reducidos para compras concretas (electrodomésticos, viajes, electrónica…). Su principal ventaja es la rapidez de aprobación, a veces en minutos, y los pocos requisitos. Sin embargo, el TAE suele ser significativamente más alto que el de un préstamo personal, por lo que conviene comparar antes de aceptar.',
    caracteristicas: [
      'TAE típica: 12 % – 25 %',
      'Plazos: 6 meses a 5 años',
      'Aprobación inmediata o en horas',
      'Importe: hasta 15.000 €',
      'Disponible en tiendas y financieras',
      'Pocos requisitos documentales',
    ],
    alertas: [
      'El TAE en créditos al consumo puede superar el 20 %; compara siempre',
      'Evita renovaciones automáticas de líneas revolving, que generan deuda crónica',
      'El coste total puede doblar o triplicar el importe solicitado a largo plazo',
    ],
  },
  linea_credito: {
    key: 'linea_credito',
    titulo: 'Línea de Crédito',
    subtitulo: 'Máxima flexibilidad: pagas intereses solo por lo que usas',
    descripcion:
      'La línea de crédito te da acceso a un límite máximo del que puedes disponer parcial o totalmente según necesidad, y solo pagas intereses por el importe efectivamente utilizado. Es ideal cuando no sabes exactamente cuánto necesitarás o cuándo, o si tus necesidades de liquidez son recurrentes y variables. Muy usada por autónomos y pymes.',
    caracteristicas: [
      'Pagas intereses solo por lo dispuesto',
      'Disponibilidad inmediata de fondos',
      'Límite renovable al devolver',
      'Plazos anuales renovables',
      'TAE variable según entidad',
      'Comisión de disponibilidad habitual',
    ],
    alertas: [
      'Ojo con la comisión de disponibilidad sobre el tramo no dispuesto',
      'La renovación anual no está garantizada; el banco puede cancelarla',
      'Usar la línea para gastos estructurales (no puntuales) puede generar dependencia',
    ],
  },
  microcredito: {
    key: 'microcredito',
    titulo: 'Microcrédito o Préstamo para Autónomos',
    subtitulo: 'Para emprendedores y quienes no acceden a la banca tradicional',
    descripcion:
      'Los microcréditos y préstamos especializados para autónomos o emprendedores cubren importes pequeños con requisitos más flexibles. Entidades como ICO, ENISA, Triodos, Cofides o MicroBank ofrecen productos adaptados a quienes inician un negocio, tienen ingresos irregulares o presentan dificultades para acceder a la banca convencional.',
    caracteristicas: [
      'Importe: generalmente hasta 25.000 €',
      'Requisitos más flexibles que banca tradicional',
      'ICO, ENISA, MicroBank, Triodos…',
      'Finalidad: emprendimiento o autónomos',
      'Plazos: 1 a 5 años habitualmente',
      'A veces acompañados de asesoramiento',
    ],
    alertas: [
      'El TAE puede ser alto en entidades privadas no bancarias; compara condiciones',
      'ICO y ENISA tienen convocatorias periódicas con cupos limitados',
      'Verifica si cumples los requisitos de cada programa antes de solicitarlo',
      'Algunas entidades exigen plan de negocio detallado',
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
    personal: 0,
    hipotecario: 0,
    consumo: 0,
    linea_credito: 0,
    microcredito: 0,
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
  personal: 'Préstamo personal',
  hipotecario: 'Hipotecario',
  consumo: 'Crédito consumo',
  linea_credito: 'Línea de crédito',
  microcredito: 'Microcrédito',
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function SelectorTipoPrestamoPage() {
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
  let resultado: { ganador: RecomendacionKey; puntuaciones: Record<RecomendacionKey, number> } | null =
    null;
  if (mostrarResultado) {
    resultado = calcularResultado(respuestas);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué tipo de préstamo te conviene?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para encontrar la financiación adecuada a tu situación: préstamo
          personal, hipotecario, crédito al consumo, línea de crédito o microcrédito.
        </p>
      </header>

      <LegalNotice />

      {/* ==================== TEST ==================== */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de tipo de préstamo">
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
              Pregunta {pregunta.id}
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
                    aria-pressed={seleccionada ? true : false}
                    onClick={() => seleccionarOpcion(idx)}
                  >
                    {opcion.texto}
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
                  Financiación recomendada
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
      <DisclaimerCard variant="financial" severity="high" />

      {/* ==================== SECCIÓN EDUCATIVA ==================== */}
      <EducationalSection
        title="Guía de préstamos y financiación en España"
        subtitle="Tipos, características y cuándo usar cada uno"
      >
        <h3>¿Qué diferencia hay entre un préstamo y un crédito?</h3>
        <p>
          Un <strong>préstamo</strong> es un contrato por el que la entidad financiera entrega una
          cantidad fija de dinero y el cliente devuelve el capital más intereses en cuotas
          periódicas. Un <strong>crédito</strong> (como la línea de crédito) es un límite máximo
          del que el cliente puede disponer parcial o totalmente según necesidad, pagando
          intereses solo por lo utilizado. Ambos son deuda, pero con estructuras y usos muy
          distintos.
        </p>

        <h3>¿Qué es el TAE y por qué es mejor comparador que el TIN?</h3>
        <p>
          El <strong>TIN (Tipo de Interés Nominal)</strong> es el precio básico del dinero
          prestado, sin incluir comisiones ni otros gastos. El <strong>TAE (Tasa Anual
          Equivalente)</strong> incorpora todos los costes asociados: comisiones de apertura,
          seguros obligatorios vinculados y la frecuencia de liquidación. La ley obliga a las
          entidades a publicar el TAE, lo que lo convierte en el indicador correcto para comparar
          productos entre distintos bancos. Un préstamo con TIN bajo puede tener un TAE alto si
          acumula comisiones.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Regla del 30-35 %:</strong> antes de pedir cualquier préstamo, verifica que la
          cuota mensual total de todas tus deudas no supere el 30-35 % de tus ingresos netos
          mensuales. El sobreendeudamiento es uno de los principales problemas financieros en
          España. Si ya superas ese umbral, considera primero consolidar deudas o negociar
          condiciones antes de contratar nueva financiación.
        </div>

        <h3>Ficheros de morosidad (ASNEF) y cómo afectan a la concesión</h3>
        <p>
          Los ficheros de morosidad como <strong>ASNEF</strong> (Asociación Nacional de
          Establecimientos Financieros de Crédito) recopilan información sobre impagos. Estar
          incluido en ASNEF dificulta o impide el acceso a préstamos de banca tradicional, aunque
          algunas entidades alternativas sí conceden financiación con incidencias, habitualmente
          a tipos más elevados. Puedes comprobar si figuras en ASNEF solicitándolo directamente
          al fichero; si el dato es incorrecto, puedes reclamar su cancelación. La LOPD y el
          RGPD regulan los derechos de acceso, rectificación y supresión.
        </p>

        <h3>Préstamos ICO para autónomos y pymes</h3>
        <p>
          El <strong>Instituto de Crédito Oficial (ICO)</strong> ofrece líneas de financiación
          destinadas a autónomos, pymes y emprendedores a través de entidades financieras
          colaboradoras. Las condiciones (tipos, plazos, importes) son habitualmente más
          favorables que las de mercado. También existe <strong>ENISA</strong>, dependiente del
          Ministerio de Industria, que ofrece préstamos participativos para startups y proyectos
          innovadores. Ambas opciones requieren cumplir requisitos específicos y presentar un
          plan de negocio sólido. Consulta los programas vigentes en{' '}
          <strong>ico.es</strong> y <strong>enisa.es</strong>.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-tipo-prestamo')} />
      <ShareCard appName="selector-tipo-prestamo" />
      <Footer appName="selector-tipo-prestamo" />
    </div>
  );
}
