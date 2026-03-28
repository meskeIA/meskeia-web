'use client';

import { useState } from 'react';
import styles from './SelectorRegimenFiscalAutonomo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ==========================================
// TIPOS
// ==========================================

type RegimenId = 'modulos' | 'directa_simplificada' | 'directa_normal' | 'sociedad_limitada';

interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<RegimenId, number>>;
}

interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: Opcion[];
}

// ==========================================
// PREGUNTAS
// ==========================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    icono: '🏷️',
    texto: '¿Tu actividad está incluida en el listado de epígrafes que pueden acogerse a módulos (estimación objetiva)?',
    opciones: [
      {
        texto: 'Sí, mi actividad está en el listado (p. ej. transporte, hostelería, comercio minorista, albañilería...)',
        icono: '✅',
        pesos: { modulos: 3 },
      },
      {
        texto: 'No, mi actividad es profesional o no aparece en el listado (p. ej. consultoría, marketing, diseño...)',
        icono: '❌',
        pesos: { directa_simplificada: 2, directa_normal: 1 },
      },
      {
        texto: 'No estoy seguro / necesito comprobarlo',
        icono: '🤔',
        pesos: { directa_simplificada: 1 },
      },
    ],
  },
  {
    id: 2,
    icono: '📊',
    texto: '¿Cuál es tu facturación anual estimada (ingresos brutos)?',
    opciones: [
      {
        texto: 'Menos de 150.000 € al año',
        icono: '🟢',
        pesos: { modulos: 2, directa_simplificada: 2 },
      },
      {
        texto: 'Entre 150.000 € y 600.000 € al año',
        icono: '🟡',
        pesos: { directa_simplificada: 3, directa_normal: 1 },
      },
      {
        texto: 'Más de 600.000 € al año',
        icono: '🔴',
        pesos: { directa_normal: 4, sociedad_limitada: 2 },
      },
    ],
  },
  {
    id: 3,
    icono: '💸',
    texto: '¿Cuánto representan tus gastos reales (materiales, suministros, salarios, alquiler...) respecto a tus ingresos?',
    opciones: [
      {
        texto: 'Pocos gastos: mis márgenes son muy altos (gastos < 20% de ingresos)',
        icono: '📈',
        pesos: { modulos: 3 },
      },
      {
        texto: 'Gastos moderados (20–50% de ingresos)',
        icono: '⚖️',
        pesos: { directa_simplificada: 2, modulos: 1 },
      },
      {
        texto: 'Muchos gastos: mis márgenes son bajos (gastos > 50% de ingresos)',
        icono: '📉',
        pesos: { directa_simplificada: 2, directa_normal: 2 },
      },
    ],
  },
  {
    id: 4,
    icono: '🏢',
    texto: '¿Facturas principalmente a empresas o profesionales que te aplican retención del IRPF?',
    opciones: [
      {
        texto: 'Sí, casi todos mis clientes son empresas y me retienen el IRPF (7% o 15%)',
        icono: '🏭',
        pesos: { directa_simplificada: 2, directa_normal: 1 },
      },
      {
        texto: 'No, mis clientes son principalmente particulares (sin retención)',
        icono: '👥',
        pesos: { modulos: 2, directa_simplificada: 1 },
      },
      {
        texto: 'Mixto: tengo clientes tanto empresas como particulares',
        icono: '🔀',
        pesos: { directa_simplificada: 2 },
      },
    ],
  },
  {
    id: 5,
    icono: '👷',
    texto: '¿Tienes o prevés tener empleados a tu cargo?',
    opciones: [
      {
        texto: 'No, trabajo solo/a sin empleados',
        icono: '🧑',
        pesos: { modulos: 1, directa_simplificada: 2 },
      },
      {
        texto: 'Sí, tengo o voy a tener 1–5 empleados',
        icono: '👨‍👩‍👧',
        pesos: { directa_simplificada: 2, directa_normal: 1, sociedad_limitada: 1 },
      },
      {
        texto: 'Sí, más de 5 empleados o crecimiento rápido previsto',
        icono: '🏗️',
        pesos: { directa_normal: 2, sociedad_limitada: 3 },
      },
    ],
  },
  {
    id: 6,
    icono: '🚀',
    texto: '¿Prevés un crecimiento rápido del negocio o captación de inversión en los próximos 3 años?',
    opciones: [
      {
        texto: 'No, quiero mantenerme como autónomo independiente con crecimiento estable',
        icono: '🌱',
        pesos: { modulos: 1, directa_simplificada: 2 },
      },
      {
        texto: 'Puede que crezca, pero sin prisa ni necesidad de inversión externa',
        icono: '📈',
        pesos: { directa_simplificada: 1, directa_normal: 1 },
      },
      {
        texto: 'Sí, espero crecer rápido o necesitar socios/inversores',
        icono: '🏆',
        pesos: { sociedad_limitada: 4, directa_normal: 1 },
      },
    ],
  },
  {
    id: 7,
    icono: '🛡️',
    texto: '¿Te preocupa separar tu patrimonio personal del riesgo empresarial?',
    opciones: [
      {
        texto: 'No especialmente, mi actividad tiene poco riesgo patrimonial',
        icono: '😌',
        pesos: { modulos: 1, directa_simplificada: 2 },
      },
      {
        texto: 'Me gustaría separarlo pero no es urgente',
        icono: '🤔',
        pesos: { directa_simplificada: 1, sociedad_limitada: 1 },
      },
      {
        texto: 'Sí, es importante para mí proteger mi patrimonio personal',
        icono: '🔒',
        pesos: { sociedad_limitada: 4 },
      },
    ],
  },
  {
    id: 8,
    icono: '🌍',
    texto: '¿Trabajas o prevés trabajar con clientes o proveedores internacionales (fuera de España)?',
    opciones: [
      {
        texto: 'No, solo clientes nacionales',
        icono: '🇪🇸',
        pesos: { modulos: 1, directa_simplificada: 1 },
      },
      {
        texto: 'Algún cliente internacional ocasional',
        icono: '✈️',
        pesos: { directa_simplificada: 2 },
      },
      {
        texto: 'Sí, una parte importante de mi negocio es internacional',
        icono: '🌐',
        pesos: { directa_normal: 2, sociedad_limitada: 2 },
      },
    ],
  },
  {
    id: 9,
    icono: '📋',
    texto: '¿Qué nivel de complejidad contable y administrativa puedes o quieres asumir?',
    opciones: [
      {
        texto: 'Quiero la gestión más sencilla posible, aunque pague más',
        icono: '🟢',
        pesos: { modulos: 3 },
      },
      {
        texto: 'Puedo llevar una contabilidad básica de ingresos y gastos',
        icono: '🟡',
        pesos: { directa_simplificada: 3 },
      },
      {
        texto: 'No me importa la complejidad si optimizo la fiscalidad',
        icono: '🔴',
        pesos: { directa_normal: 2, sociedad_limitada: 2 },
      },
    ],
  },
  {
    id: 10,
    icono: '⚠️',
    texto: '¿Ya superaste o estás cerca del límite de rendimientos para permanecer en módulos (150.000 € ingresos o 150.000 € compras)?',
    opciones: [
      {
        texto: 'No, estoy muy por debajo de los límites',
        icono: '✅',
        pesos: { modulos: 3 },
      },
      {
        texto: 'Estoy cerca o podría superarlo este año',
        icono: '🔔',
        pesos: { directa_simplificada: 3, modulos: -2 },
      },
      {
        texto: 'Ya los supero, he sido excluido o renuncié a módulos',
        icono: '🚫',
        pesos: { directa_simplificada: 3, directa_normal: 2, modulos: -5 },
      },
    ],
  },
];

// ==========================================
// RECOMENDACIONES
// ==========================================

interface Recomendacion {
  id: RegimenId;
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  consideraciones: string[];
}

const RECOMENDACIONES: Record<RegimenId, Recomendacion> = {
  modulos: {
    id: 'modulos',
    icono: '📦',
    titulo: 'Estimación Objetiva (Módulos)',
    subtitulo: 'Tributas por parámetros fijos, no por ingresos reales',
    descripcion:
      'Tu perfil sugiere que la estimación objetiva (módulos) podría ser una opción favorable. Este régimen calcula el rendimiento neto mediante parámetros objetivos (personal, superficie, potencia instalada...) independientemente de tus ingresos reales. Es especialmente ventajoso si tus ingresos reales superan significativamente lo que dicta el módulo, ya que solo tributa por el rendimiento estimado. Solo disponible para actividades específicas incluidas en la Orden ministerial anual, y con límites de facturación y compras.',
    ventajas: [
      'Gestión administrativa muy sencilla',
      'Tributación predecible y estable',
      'Ventajoso si ingresos reales > módulos',
      'No obligatorio libros de ingresos y gastos (salvo excepciones)',
    ],
    consideraciones: [
      'Solo disponible para actividades específicas',
      'Límites: 150.000 € ingresos y 150.000 € compras',
      'Puede ser desventajoso si el negocio va mal',
      'Exclusión automática si superas los límites',
    ],
  },
  directa_simplificada: {
    id: 'directa_simplificada',
    icono: '📝',
    titulo: 'Estimación Directa Simplificada',
    subtitulo: 'Tributas por ingresos reales menos gastos deducibles',
    descripcion:
      'Tu perfil apunta a la estimación directa simplificada como régimen más adecuado. Tributas por la diferencia real entre ingresos y gastos deducibles. La versión simplificada aplica una reducción adicional del 5% en concepto de gastos de difícil justificación, en sustitución del conjunto de provisiones deducibles. Es la opción más habitual para profesionales y autónomos con facturación inferior a 600.000 €/año que no puedan o no quieran acogerse a módulos.',
    ventajas: [
      'Deduces gastos reales del negocio',
      'Reducción 5% gastos de difícil justificación',
      'Gestión relativamente sencilla',
      'Válida para cualquier actividad (profesional o empresarial)',
    ],
    consideraciones: [
      'Obligatorio llevar libros de ingresos, gastos e inversiones',
      'Pagos fraccionados trimestrales (modelo 130 o 131)',
      'Si superas 600.000 €, pasas a directa normal',
      'Declaración de IVA trimestral (si corresponde)',
    ],
  },
  directa_normal: {
    id: 'directa_normal',
    icono: '🗂️',
    titulo: 'Estimación Directa Normal',
    subtitulo: 'Contabilidad completa según el Plan General Contable',
    descripcion:
      'Tu perfil sugiere la estimación directa normal, bien por necesidad (facturación superior a 600.000 €/año o renuncia voluntaria a la simplificada) o por conveniencia dado el volumen y complejidad de tu negocio. Requiere llevar contabilidad completa ajustada al Plan General Contable (PGC). Permite deducir todo tipo de gastos y provisiones, con mayor precisión fiscal pero también mayor carga administrativa. A estos niveles de facturación, puede ser útil valorar la constitución de una SL.',
    ventajas: [
      'Deduces todos los gastos y provisiones',
      'Mayor precisión fiscal',
      'Sin límites de facturación',
      'Permite contabilidad analítica avanzada',
    ],
    consideraciones: [
      'Obligatorio llevar contabilidad completa (PGC)',
      'Mayor complejidad y coste de gestoría',
      'Obligatorio si facturas > 600.000 €/año',
      'Valorar si una SL sería más eficiente fiscalmente',
    ],
  },
  sociedad_limitada: {
    id: 'sociedad_limitada',
    icono: '🏛️',
    titulo: 'Constituir una Sociedad Limitada (SL)',
    subtitulo: 'Tributación por Impuesto de Sociedades (IS) al 25%',
    descripcion:
      'Tu perfil indica que podrías beneficiarte de constituir una Sociedad Limitada. A partir de ciertos niveles de beneficio (generalmente a partir de 40.000–60.000 € netos anuales), tributar al tipo del Impuesto de Sociedades (25%, o 15% los dos primeros años para nuevas entidades) puede ser más eficiente que el IRPF como autónomo, que puede llegar al 47%. Además, la SL separa el patrimonio personal del empresarial, facilita la captación de socios e inversores y da una imagen más profesional ante clientes empresariales.',
    ventajas: [
      'Tipo IS 25% (o 15% nuevas empresas los 2 primeros años)',
      'Separación patrimonio personal del empresarial',
      'Facilita incorporación de socios e inversores',
      'Mayor imagen corporativa y credibilidad',
    ],
    consideraciones: [
      'Costes de constitución: ~1.000–3.000 €',
      'Obligatorio gestoría/asesor: mayor coste mensual',
      'Contabilidad completa obligatoria (depósito de cuentas)',
      'El dinero de la empresa no es tuyo directamente (vía nómina o dividendos)',
    ],
  },
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function SelectorRegimenFiscalAutonomo() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(PREGUNTAS.length).fill(null));
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);
  const [recomendacion, setRecomendacion] = useState<RegimenId | null>(null);

  // Calcular recomendación mediante sistema de pesos
  const calcularRecomendacion = (respuestasFinales: (number | null)[]): RegimenId => {
    const puntuaciones: Record<RegimenId, number> = {
      modulos: 0,
      directa_simplificada: 0,
      directa_normal: 0,
      sociedad_limitada: 0,
    };

    PREGUNTAS.forEach((pregunta, iPregunta) => {
      const iOpcion = respuestasFinales[iPregunta];
      if (iOpcion === null) return;
      const opcion = pregunta.opciones[iOpcion];
      const pesos = opcion.pesos as Partial<Record<RegimenId, number>>;
      (Object.keys(pesos) as RegimenId[]).forEach((regimen) => {
        const peso = pesos[regimen];
        if (peso !== undefined) {
          puntuaciones[regimen] += peso;
        }
      });
    });

    // Ganador por mayor puntuación (mínimo 0)
    let ganador: RegimenId = 'directa_simplificada';
    let maxPuntos = -Infinity;
    (Object.keys(puntuaciones) as RegimenId[]).forEach((id) => {
      if (puntuaciones[id] > maxPuntos) {
        maxPuntos = puntuaciones[id];
        ganador = id;
      }
    });

    return ganador;
  };

  const seleccionarOpcion = (iOpcion: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = iOpcion;
    setRespuestas(nuevasRespuestas);
  };

  const siguientePregunta = () => {
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      // Última pregunta: calcular resultado
      const resultado = calcularRecomendacion(respuestas);
      setRecomendacion(resultado);
      setMostrarResultado(true);
    }
  };

  const preguntaAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const reiniciarTest = () => {
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setMostrarResultado(false);
    setRecomendacion(null);
  };

  const pregunta = PREGUNTAS[preguntaActual];
  const opcionSeleccionada = respuestas[preguntaActual];
  const porcentajeProgreso = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  const rec = recomendacion ? RECOMENDACIONES[recomendacion] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🧾</span>
        <h1 className={styles.title}>¿Qué régimen fiscal te conviene como autónomo?</h1>
        <p className={styles.subtitle}>
          10 preguntas para orientarte sobre si te conviene módulos, estimación directa simplificada, directa normal o constituir una SL.
        </p>
      </header>

      <LegalNotice />

      {/* QUIZ O RESULTADO */}
      {!mostrarResultado ? (
        <section className={styles.quiz} aria-label="Test de selección de régimen fiscal">
          {/* Barra de progreso */}
          <div className={styles.progreso}>
            <span className={styles.progresoTexto} aria-live="polite">
              Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
            </span>
            <div className={styles.barraProgreso} role="progressbar" aria-valuenow={Math.round(porcentajeProgreso)} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={styles.barraRelleno}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta} key={preguntaActual}>
            <div className={styles.preguntaEncabezado}>
              <span className={styles.preguntaIcono} aria-hidden="true">{pregunta.icono}</span>
              <p className={styles.preguntaTexto}>{pregunta.texto}</p>
            </div>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((opcion, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === i ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(i)}
                  aria-pressed={opcionSeleccionada === i}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                  {opcion.texto}
                </button>
              ))}
            </div>

            {/* Navegación */}
            <div className={styles.navQuiz}>
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={preguntaAnterior}
                disabled={preguntaActual === 0}
                aria-label="Pregunta anterior"
              >
                ← Anterior
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={siguientePregunta}
                disabled={opcionSeleccionada === null}
                aria-label={preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente pregunta' : 'Ver resultado'}
              >
                {preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente →' : 'Ver orientación →'}
              </button>
            </div>
          </div>
        </section>
      ) : rec !== null ? (
        <section className={styles.resultado} aria-label="Resultado orientativo">
          {/* Disclaimer CRÍTICO — nivel 1: no colapsable, materia fiscal */}
          <DisclaimerCard variant="financial" severity="critical" />

          <div className={styles.warningBox} role="alert">
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <p>
              <strong>Orientación, no asesoramiento fiscal.</strong> Este test es una herramienta orientativa basada en criterios generales.
              El régimen fiscal óptimo depende de tu situación concreta, actividad, CCAA y circunstancias personales.
              Consulta siempre con un <strong>gestor o asesor fiscal</strong> antes de tomar ninguna decisión.
              La Agencia Tributaria es el organismo oficial de referencia.
            </p>
          </div>

          <div className={styles.resultadoCard}>
            <span className={styles.resultadoEmoji} aria-hidden="true">{rec.icono}</span>
            <h2 className={styles.resultadoTitulo}>{rec.titulo}</h2>
            <p className={styles.resultadoSubtitulo}>{rec.subtitulo}</p>
            <p className={styles.resultadoDescripcion}>{rec.descripcion}</p>

            <div className={styles.ventajasGrid}>
              <div className={styles.ventajasBloque}>
                <p className={`${styles.ventajasTitulo} ${styles.verde}`}>✅ Ventajas</p>
                <ul className={styles.ventajasList}>
                  {rec.ventajas.map((v, i) => (
                    <li key={i}>• {v}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.ventajasBloque}>
                <p className={`${styles.ventajasTitulo} ${styles.naranja}`}>⚠️ A tener en cuenta</p>
                <ul className={styles.ventajasList}>
                  {rec.consideraciones.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.accionesFinal}>
            <button
              type="button"
              className={styles.btnReset}
              onClick={reiniciarTest}
              aria-label="Repetir el test desde el inicio"
            >
              🔄 Repetir test
            </button>
          </div>
        </section>
      ) : null}

      {/* SECCIÓN EDUCATIVA */}
      <EducationalSection
        title="Regímenes fiscales para autónomos en España"
        subtitle="Entiende las diferencias antes de elegir"
      >
        <h3>¿Qué es la estimación objetiva (módulos)?</h3>
        <p>
          La estimación objetiva o por módulos calcula el rendimiento neto del negocio mediante parámetros
          objetivos establecidos por la Agencia Tributaria (número de empleados, superficie del local, potencia
          eléctrica instalada, etc.), con independencia de los ingresos reales obtenidos. Solo está disponible
          para actividades empresariales específicas recogidas en la Orden HAC anual, y sujeta a límites de
          facturación (150.000 €/año en ingresos y 150.000 €/año en compras a empresarios).
        </p>
        <p>
          Es ventajosa cuando los ingresos reales superan el rendimiento estimado por los módulos, ya que
          tributas por menos de lo que realmente ganas. Por el contrario, si el negocio va mal, puedes acabar
          pagando más de lo que te correspondería. También excluye la posibilidad de deducir gastos reales.
        </p>

        <h3>Estimación directa simplificada</h3>
        <p>
          Es el régimen más habitual para autónomos. Tributas por la diferencia real entre ingresos y gastos
          deducibles. La versión simplificada aplica adicionalmente una reducción del 5% sobre el rendimiento
          neto positivo (máximo 2.000 €) en concepto de gastos de difícil justificación, como sustitución del
          conjunto de provisiones deducibles. Aplicable a actividades con facturación inferior a 600.000 €/año.
        </p>

        <h3>Estimación directa normal</h3>
        <p>
          Obligatoria si la cifra de negocios supera los 600.000 €/año o si el autónomo renuncia voluntariamente
          a la modalidad simplificada. Requiere llevar contabilidad completa ajustada al Plan General Contable
          (PGC), pero permite deducir todos los gastos empresariales y provisiones de forma más amplia y precisa.
          Es la opción para negocios maduros de mayor volumen.
        </p>

        <h3>¿Cuándo plantearse constituir una SL?</h3>
        <p>
          Cuando el beneficio neto supera de forma sostenida los 40.000–60.000 € anuales, el Impuesto de
          Sociedades (tipo general 25%, o 15% los dos primeros ejercicios para nuevas entidades) puede resultar
          más eficiente que el IRPF como autónomo, cuyo tipo marginal puede llegar al 47% en los tramos más
          altos. Además, la SL ofrece separación del patrimonio personal, mayor credibilidad ante terceros y
          facilita la incorporación de socios e inversores. Sin embargo, implica mayores costes de constitución
          y administrativos.
        </p>

        <h3>¿Puedo cambiar de régimen?</h3>
        <p>
          Sí, aunque con restricciones. La renuncia a módulos debe hacerse en el mes de diciembre del año
          anterior (o en los 30 días naturales siguientes al inicio de la actividad) y tiene efecto vinculante
          durante al menos 3 años. La exclusión de módulos se produce automáticamente al superar los límites.
          El cambio entre simplificada y normal se produce de forma automática al cruzar el umbral de 600.000 €.
        </p>

        <div className={styles.warningBox}>
          <span className={styles.warningIcono} aria-hidden="true">📌</span>
          <p>
            <strong>Recuerda:</strong> Este selector ofrece una orientación inicial basada en criterios generales.
            Antes de elegir o cambiar tu régimen fiscal, consulta siempre con un gestor o asesor fiscal colegiado
            que conozca tu situación concreta. Una elección incorrecta puede suponer un coste fiscal innecesario
            durante varios años.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-regimen-fiscal-autonomo')} />
      <ShareCard appName="selector-regimen-fiscal-autonomo" />
      <Footer appName="selector-regimen-fiscal-autonomo" />
    </div>
  );
}
