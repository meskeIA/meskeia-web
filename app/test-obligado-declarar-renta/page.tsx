'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './TestObligadoDeclararRenta.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { OBLIGACION_DECLARAR_2025, FISCAL_IRPF_META } from '@/data/fiscal';
import { formatCurrency } from '@/lib';
import { jsonLd } from './metadata';

// ──────────────────────────────────────────
// TIPOS Y DATOS
// ──────────────────────────────────────────

interface Pregunta {
  id: string;
  texto: string;
  hint?: string;
  opciones: { valor: string; texto: string; icono: string }[];
}

type Respuestas = Record<string, string>;

type ResultadoTipo = 'obligado' | 'no-obligado' | 'recomendado';

interface Resultado {
  tipo: ResultadoTipo;
  titulo: string;
  icono: string;
  explicacion: string;
  razones: { icono: string; titulo: string; detalle: string }[];
}

const PREGUNTAS: Pregunta[] = [
  {
    id: 'tipo_renta',
    texto: '¿Cuál fue tu principal fuente de ingresos en 2025?',
    opciones: [
      { valor: 'trabajo', texto: 'Trabajo por cuenta ajena (nómina)', icono: '👔' },
      { valor: 'autonomo', texto: 'Actividad económica (autónomo)', icono: '🧾' },
      { valor: 'pension', texto: 'Pensión o prestación de la Seguridad Social', icono: '🏦' },
      { valor: 'desempleo', texto: 'Prestación por desempleo (SEPE)', icono: '📋' },
      { valor: 'sin_ingresos', texto: 'Sin ingresos relevantes / IMV', icono: '🏠' },
    ],
  },
  {
    id: 'importe_bruto',
    texto: '¿Cuánto cobraste en total (bruto) en 2025?',
    hint: 'Suma todos los rendimientos del trabajo, incluido desempleo si lo cobraste.',
    opciones: [
      { valor: 'menos_15876', texto: `Menos de ${formatCurrency(15876).replace(',00', '')}`, icono: '💰' },
      { valor: 'entre_15876_22000', texto: `Entre ${formatCurrency(15876).replace(',00', '')} y ${formatCurrency(22000).replace(',00', '')}`, icono: '💵' },
      { valor: 'mas_22000', texto: `Más de ${formatCurrency(22000).replace(',00', '')}`, icono: '💎' },
    ],
  },
  {
    id: 'pagadores',
    texto: '¿Cuántos pagadores tuviste en 2025?',
    hint: 'Cuenta como pagador cada empresa, el SEPE, la Seguridad Social, etc.',
    opciones: [
      { valor: 'uno', texto: 'Solo 1 pagador', icono: '1️⃣' },
      { valor: 'varios_bajo', texto: `2 o más, pero del 2.º en adelante cobré ≤ ${formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador).replace(',00', '')}`, icono: '2️⃣' },
      { valor: 'varios_alto', texto: `2 o más, y del 2.º en adelante cobré > ${formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador).replace(',00', '')}`, icono: '🔢' },
    ],
  },
  {
    id: 'capital_mobiliario',
    texto: '¿Obtuviste rendimientos del capital mobiliario en 2025?',
    hint: 'Intereses de cuentas, dividendos, letras del Tesoro, fondos de inversión...',
    opciones: [
      { valor: 'no', texto: 'No, o menos de 200 €', icono: '❌' },
      { valor: 'hasta_1600', texto: `Sí, hasta ${formatCurrency(OBLIGACION_DECLARAR_2025.capitalMobiliario.limite).replace(',00', '')}`, icono: '📊' },
      { valor: 'mas_1600', texto: `Sí, más de ${formatCurrency(OBLIGACION_DECLARAR_2025.capitalMobiliario.limite).replace(',00', '')}`, icono: '📈' },
    ],
  },
  {
    id: 'rentas_imputadas',
    texto: '¿Tienes un segundo inmueble (no alquilado) o recibiste subvenciones para vivienda?',
    hint: 'Hacienda imputa una renta ficticia por inmuebles urbanos no alquilados distintos de la vivienda habitual.',
    opciones: [
      { valor: 'no', texto: 'No', icono: '❌' },
      { valor: 'si_bajo', texto: `Sí, pero el importe total es menor de ${formatCurrency(OBLIGACION_DECLARAR_2025.rentasImputadas.limite).replace(',00', '')}`, icono: '🏘️' },
      { valor: 'si_alto', texto: `Sí, y supera ${formatCurrency(OBLIGACION_DECLARAR_2025.rentasImputadas.limite).replace(',00', '')}`, icono: '🏢' },
    ],
  },
  {
    id: 'deducciones',
    texto: '¿Quieres aplicar alguna de estas deducciones o reducciones?',
    hint: 'Si aplicas alguna, estás obligado a declarar para poder beneficiarte.',
    opciones: [
      { valor: 'no', texto: 'No, ninguna', icono: '❌' },
      { valor: 'vivienda', texto: 'Deducción por inversión en vivienda habitual (comprada antes de 2013)', icono: '🏠' },
      { valor: 'plan_pensiones', texto: 'Aportación a plan de pensiones / plan de previsión', icono: '🏦' },
      { valor: 'doble_imposicion', texto: 'Deducción por doble imposición internacional', icono: '🌍' },
      { valor: 'devolucion', texto: 'Quiero solicitar devolución (me retuvieron de más)', icono: '💸' },
    ],
  },
  {
    id: 'imv',
    texto: '¿Eres perceptor del Ingreso Mínimo Vital (IMV)?',
    opciones: [
      { valor: 'no', texto: 'No', icono: '❌' },
      { valor: 'si', texto: 'Sí, cobro el IMV', icono: '✅' },
    ],
  },
];

// ──────────────────────────────────────────
// LÓGICA DE EVALUACIÓN
// ──────────────────────────────────────────

function evaluarObligacion(respuestas: Respuestas): Resultado {
  const razones: Resultado['razones'] = [];
  let obligado = false;
  let recomendado = false;

  const umbrales = OBLIGACION_DECLARAR_2025;

  // 1. IMV → siempre obligado
  if (respuestas.imv === 'si') {
    obligado = true;
    razones.push({
      icono: '⚠️',
      titulo: 'Perceptor de IMV',
      detalle: 'Los perceptores del Ingreso Mínimo Vital están obligados a presentar la declaración, independientemente del importe.',
    });
  }

  // 2. Deducciones → siempre obligado
  if (respuestas.deducciones && respuestas.deducciones !== 'no') {
    obligado = true;
    const mapa: Record<string, string> = {
      vivienda: 'deducción por inversión en vivienda habitual',
      plan_pensiones: 'reducción por aportaciones a planes de pensiones',
      doble_imposicion: 'deducción por doble imposición internacional',
      devolucion: 'solicitar devolución derivada de la normativa del tributo',
    };
    razones.push({
      icono: '📋',
      titulo: 'Deducciones o devolución solicitada',
      detalle: `Para aplicar ${mapa[respuestas.deducciones] ?? 'esta deducción'} debes presentar la declaración obligatoriamente.`,
    });
  }

  // 3. Autónomo → siempre obligado
  if (respuestas.tipo_renta === 'autonomo') {
    obligado = true;
    razones.push({
      icono: '🧾',
      titulo: 'Actividad económica propia',
      detalle: 'Los autónomos con rendimientos de actividades económicas están obligados a declarar en todos los casos.',
    });
  }

  // 4. Rendimientos del trabajo
  if (['trabajo', 'pension', 'desempleo'].includes(respuestas.tipo_renta ?? '')) {
    const variosPagadores = respuestas.pagadores === 'varios_alto';
    const umbral = variosPagadores
      ? umbrales.trabajo.variosPagadores
      : umbrales.trabajo.unPagador;

    if (respuestas.importe_bruto === 'mas_22000') {
      obligado = true;
      razones.push({
        icono: '💰',
        titulo: `Rendimientos del trabajo > ${formatCurrency(22000).replace(',00', '')}`,
        detalle: 'Con rendimientos del trabajo superiores a 22.000 € estás obligado a declarar, independientemente del número de pagadores.',
      });
    } else if (respuestas.importe_bruto === 'entre_15876_22000') {
      if (variosPagadores) {
        obligado = true;
        razones.push({
          icono: '🔢',
          titulo: `Varios pagadores con umbral de ${formatCurrency(umbral).replace(',00', '')}`,
          detalle: `Con 2 o más pagadores (y el 2.º o siguientes supera ${formatCurrency(umbrales.trabajo.limiteSegundoPagador).replace(',00', '')}), el umbral baja a ${formatCurrency(umbrales.trabajo.variosPagadores).replace(',00', '')}. Tus ingresos superan ese límite.`,
        });
      } else {
        razones.push({
          icono: '✅',
          titulo: `Rendimientos del trabajo < ${formatCurrency(umbrales.trabajo.unPagador).replace(',00', '')}`,
          detalle: `Con un solo pagador (o varios pero el 2.º ≤ ${formatCurrency(umbrales.trabajo.limiteSegundoPagador).replace(',00', '')}), el umbral es ${formatCurrency(umbrales.trabajo.unPagador).replace(',00', '')}. No estarías obligado por este concepto.`,
        });
      }
    } else {
      // Menos de 15.876 €
      razones.push({
        icono: '✅',
        titulo: `Rendimientos del trabajo < ${formatCurrency(umbrales.trabajo.variosPagadores).replace(',00', '')}`,
        detalle: 'Tus rendimientos del trabajo están por debajo del umbral mínimo. No estarías obligado por este concepto.',
      });
    }

    // Tip desempleo
    if (respuestas.tipo_renta === 'desempleo') {
      razones.push({
        icono: 'ℹ️',
        titulo: 'Desempleo = rendimiento del trabajo',
        detalle: 'La prestación por desempleo tributa como rendimiento del trabajo. El SEPE actúa como segundo pagador si también cobraste de una empresa.',
      });
    }
  }

  // 5. Capital mobiliario > 1.600 €
  if (respuestas.capital_mobiliario === 'mas_1600') {
    obligado = true;
    razones.push({
      icono: '📈',
      titulo: `Capital mobiliario > ${formatCurrency(umbrales.capitalMobiliario.limite).replace(',00', '')}`,
      detalle: `Los rendimientos del capital mobiliario sujetos a retención que superen ${formatCurrency(umbrales.capitalMobiliario.limite).replace(',00', '')} obligan a presentar la declaración.`,
    });
  } else if (respuestas.capital_mobiliario === 'hasta_1600') {
    razones.push({
      icono: '✅',
      titulo: `Capital mobiliario ≤ ${formatCurrency(umbrales.capitalMobiliario.limite).replace(',00', '')}`,
      detalle: 'No superan el umbral de obligación por este concepto.',
    });
  }

  // 6. Rentas imputadas > 1.000 €
  if (respuestas.rentas_imputadas === 'si_alto') {
    obligado = true;
    razones.push({
      icono: '🏢',
      titulo: `Rentas imputadas > ${formatCurrency(umbrales.rentasImputadas.limite).replace(',00', '')}`,
      detalle: `Las rentas inmobiliarias imputadas, subvenciones para vivienda o letras del Tesoro que superen ${formatCurrency(umbrales.rentasImputadas.limite).replace(',00', '')} en conjunto obligan a declarar.`,
    });
  }

  // 7. Sin ingresos / solo IMV
  if (respuestas.tipo_renta === 'sin_ingresos' && !obligado) {
    razones.push({
      icono: '✅',
      titulo: 'Sin rentas relevantes',
      detalle: 'Sin ingresos del trabajo ni de actividades económicas, no existe obligación de declarar por este concepto.',
    });
  }

  // Recomendación de declarar aunque no sea obligatorio
  if (!obligado && respuestas.importe_bruto !== 'mas_22000') {
    recomendado = true;
  }

  const tipo: ResultadoTipo = obligado ? 'obligado' : recomendado ? 'recomendado' : 'no-obligado';

  const titulos: Record<ResultadoTipo, string> = {
    'obligado': 'Sí, estás obligado a declarar',
    'no-obligado': 'No estás obligado a declarar',
    'recomendado': 'No estás obligado, pero te puede interesar declarar',
  };

  const iconos: Record<ResultadoTipo, string> = {
    'obligado': '📋',
    'no-obligado': '✅',
    'recomendado': '💡',
  };

  const explicaciones: Record<ResultadoTipo, string> = {
    'obligado': 'Según los datos que has indicado, estás obligado a presentar la declaración de la Renta 2025. La campaña está abierta desde el 8 de abril de 2026 hasta el 30 de junio de 2026.',
    'no-obligado': 'Según los datos que has indicado, no estarías obligado a presentar la declaración de la Renta 2025. Sin embargo, revisa siempre tu borrador en la AEAT por si te corresponde devolución.',
    'recomendado': 'No estás obligado a presentar la declaración, pero podría interesarte hacerlo. Muchos contribuyentes no obligados tienen derecho a devolución porque les retuvieron de más durante el año. Consulta tu borrador en Renta Web para comprobarlo.',
  };

  return {
    tipo,
    titulo: titulos[tipo],
    icono: iconos[tipo],
    explicacion: explicaciones[tipo],
    razones,
  };
}

// ──────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────

export default function TestObligadoDeclararRentaPage() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = mostrarResultado ? 100 : Math.round((paso / totalPreguntas) * 100);

  const responder = useCallback((valor: string) => {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }, [preguntaActual]);

  const siguiente = useCallback(() => {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      setMostrarResultado(true);
    }
  }, [paso, totalPreguntas]);

  const anterior = useCallback(() => {
    if (mostrarResultado) {
      setMostrarResultado(false);
    } else if (paso > 0) {
      setPaso(p => p - 1);
    }
  }, [paso, mostrarResultado]);

  const reiniciar = useCallback(() => {
    setPaso(0);
    setRespuestas({});
    setMostrarResultado(false);
  }, []);

  const resultado = useMemo(() => {
    if (!mostrarResultado) return null;
    return evaluarObligacion(respuestas);
  }, [mostrarResultado, respuestas]);

  const respuestaActual = preguntaActual ? respuestas[preguntaActual.id] : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">📋</span> ¿Estoy obligado a declarar la Renta 2025?
          </h1>
          <p className={styles.subtitle}>
            Responde 7 preguntas y descubre si debes presentar la declaración en la campaña 2026
          </p>
          <div className={styles.fechasClave}>
            <span className={styles.fechaTag}>8 abr — Apertura online</span>
            <span className={styles.fechaTag}>30 jun — Fin del plazo</span>
          </div>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="financial"
          severity="critical"
          context="test-obligado-declarar-renta"
        />
        <DataReference
          normativa="IRPF 2025 — Obligación de declarar"
          fuente={FISCAL_IRPF_META.fuente}
          verificado={FISCAL_IRPF_META.verificado}
          urlOficial={FISCAL_IRPF_META.urlOficial}
        />

        {/* Barra de progreso */}
        <div className={styles.progressBar}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progreso}%` }}
              role="progressbar"
              aria-valuenow={progreso}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso del test: ${progreso}%`}
            />
          </div>
          <p className={styles.progressText}>
            {mostrarResultado
              ? 'Resultado'
              : `Pregunta ${paso + 1} de ${totalPreguntas}`
            }
          </p>
        </div>

        {/* Pregunta actual */}
        {!mostrarResultado && preguntaActual && (
          <div className={styles.questionCard}>
            <p className={styles.questionNumber}>Pregunta {paso + 1}</p>
            <h2 className={styles.questionText}>{preguntaActual.texto}</h2>
            {preguntaActual.hint && (
              <p className={styles.questionHint}>{preguntaActual.hint}</p>
            )}

            <div className={styles.options} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  className={`${styles.option} ${respuestaActual === opcion.valor ? styles.optionSelected : ''}`}
                  onClick={() => responder(opcion.valor)}
                  role="radio"
                  aria-checked={respuestaActual === opcion.valor}
                >
                  <span className={styles.optionIcon} aria-hidden="true">{opcion.icono}</span>
                  <span className={styles.optionText}>{opcion.texto}</span>
                </button>
              ))}
            </div>

            <div className={styles.navigation}>
              {paso > 0 && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={anterior}
                >
                  Anterior
                </button>
              )}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={siguiente}
                disabled={!respuestaActual}
              >
                {paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente'}
              </button>
            </div>
          </div>
        )}

        {/* Resultado */}
        {mostrarResultado && resultado && (
          <>
            <div
              className={`${styles.resultCard} ${
                resultado.tipo === 'obligado' ? styles.resultObligado :
                resultado.tipo === 'no-obligado' ? styles.resultNoObligado :
                styles.resultRecomendado
              }`}
              role="alert"
              aria-live="polite"
            >
              <div className={styles.resultIconWrapper} aria-hidden="true">
                {resultado.icono}
              </div>
              <h2 className={styles.resultTitle}>{resultado.titulo}</h2>
              <p className={styles.resultExplanation}>{resultado.explicacion}</p>
            </div>

            {/* Desglose de razones */}
            {resultado.razones.length > 0 && (
              <div className={styles.breakdown}>
                <h3 className={styles.breakdownTitle}>
                  <span aria-hidden="true">🔍</span> Desglose de tu situación
                </h3>
                {resultado.razones.map((razon, i) => (
                  <div key={i} className={styles.breakdownItem}>
                    <span className={styles.breakdownIcon} aria-hidden="true">{razon.icono}</span>
                    <div className={styles.breakdownText}>
                      <p className={styles.breakdownLabel}>{razon.titulo}</p>
                      <p className={styles.breakdownValue}>{razon.detalle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tip */}
            <div className={styles.tipBox}>
              <p>
                <strong>Consejo:</strong> Aunque no estés obligado, consulta siempre tu borrador en{' '}
                <a
                  href="https://sede.agenciatributaria.gob.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.aeatLink}
                >
                  Renta Web (AEAT)
                </a>
                . Muchos contribuyentes no obligados tienen derecho a devolución.
              </p>
            </div>

            <div className={styles.navigation}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={anterior}
              >
                Revisar respuestas
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={reiniciar}
              >
                Repetir test
              </button>
            </div>
          </>
        )}

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre la obligación de declarar"
          subtitle="Umbrales, excepciones y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">📊</span> Tabla de umbrales IRPF 2025</h2>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Tipo de renta</th>
                  <th>Umbral</th>
                  <th>Condición</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Trabajo (1 pagador)</td>
                  <td>{formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.unPagador).replace(',00', '')}</td>
                  <td>1 pagador, o varios si el 2.º ≤ 1.500 €</td>
                </tr>
                <tr>
                  <td>Trabajo (varios pagadores)</td>
                  <td>{formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores).replace(',00', '')}</td>
                  <td>2+ pagadores y el 2.º {'>'} 1.500 €</td>
                </tr>
                <tr>
                  <td>Capital mobiliario</td>
                  <td>{formatCurrency(OBLIGACION_DECLARAR_2025.capitalMobiliario.limite).replace(',00', '')}</td>
                  <td>Intereses, dividendos, fondos con retención</td>
                </tr>
                <tr>
                  <td>Rentas imputadas</td>
                  <td>{formatCurrency(OBLIGACION_DECLARAR_2025.rentasImputadas.limite).replace(',00', '')}</td>
                  <td>Inmuebles no alquilados + subvenciones vivienda + letras</td>
                </tr>
                <tr>
                  <td>Ganancias patrimoniales sin retención</td>
                  <td>{formatCurrency(OBLIGACION_DECLARAR_2025.rentasImputadas.limite).replace(',00', '')}</td>
                  <td>Ventas de inmuebles, acciones sin retención</td>
                </tr>
              </tbody>
            </table>

            <h2><span aria-hidden="true">🎯</span> 4 casos frecuentes</h2>
            <h3>1. Cambié de empresa en 2025</h3>
            <p>Si cobraste de 2 empresas, cada una actúa como pagador. Si del segundo pagador cobraste más de 1.500 €, tu umbral baja a 15.876 €. Esto incluye el finiquito de la empresa anterior.</p>

            <h3>2. Cobré desempleo y luego encontré trabajo</h3>
            <p>El SEPE es un segundo pagador. Si la prestación superó 1.500 €, aplica el umbral reducido de 15.876 €. Es uno de los casos más habituales de obligación inesperada.</p>

            <h3>3. Soy pensionista con un plan de pensiones</h3>
            <p>La pensión tributa como rendimiento del trabajo. Si además rescataste un plan de pensiones, tendrás dos pagadores (SS + gestora del plan). Aplica el umbral de varios pagadores si el segundo supera 1.500 €.</p>

            <h3>4. Cobro el IMV</h3>
            <p>Los perceptores del Ingreso Mínimo Vital están obligados a declarar siempre, aunque el IMV en sí esté exento de tributación. La obligación existe para que Hacienda verifique la situación económica.</p>

            <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>

            <h3>¿Las indemnizaciones por despido tributan?</h3>
            <p>La indemnización por despido improcedente está exenta hasta el límite legal (33 días/año, máximo 24 mensualidades). El exceso tributa como rendimiento del trabajo.</p>

            <h3>¿Qué pasa si no declaro estando obligado?</h3>
            <p>Si el resultado hubiera sido a ingresar: recargo del 1% por mes de retraso (hasta el 15%), más intereses de demora. Si es a devolver: pierdes la devolución pasados 4 años.</p>

            <h3>¿Puedo declarar aunque no esté obligado?</h3>
            <p>Sí, siempre puedes presentar la declaración voluntariamente. Es recomendable si te retuvieron de más y te corresponde devolución.</p>

            <h3>¿Cuándo puedo presentar la declaración?</h3>
            <p>Desde el 8 de abril de 2026 (online) hasta el 30 de junio de 2026. Por teléfono desde el 6 de mayo y presencial desde el 1 de junio.</p>

            <h3>¿Las letras del Tesoro obligan a declarar?</h3>
            <p>Las letras del Tesoro se incluyen en el grupo de rentas imputadas. Si junto con otros rendimientos de este grupo superan 1.000 €, obligan a declarar.</p>

            <h3>¿Cómo sé cuántos pagadores he tenido?</h3>
            <p>Revisa tu borrador en Renta Web. Allí aparecen todos los pagadores que informaron a Hacienda. También puedes consultar tu vida laboral en la Seguridad Social.</p>

            <h3>¿El bono cultural cuenta como ingreso?</h3>
            <p>No, el Bono Cultural Joven no tributa en IRPF. Está exento por disposición legal.</p>

            <h3>¿Y las becas?</h3>
            <p>Las becas públicas para estudios reglados están exentas. Las becas de entidades privadas o las de investigación pueden tributar. Consulta el art. 7.j de la Ley del IRPF.</p>

            <h2><span aria-hidden="true">📝</span> Guía paso a paso para presentar la Renta</h2>
            <ol>
              <li><strong>Prepara tu acceso:</strong> Activa Cl@ve PIN, certificado digital o DNI electrónico antes de la campaña.</li>
              <li><strong>Revisa el borrador:</strong> Entra en Renta Web desde el 8 de abril y comprueba que los datos son correctos.</li>
              <li><strong>Corrige errores:</strong> Si faltan ingresos, deducciones o datos personales, modifícalos antes de confirmar.</li>
              <li><strong>Aplica deducciones:</strong> Vivienda (pre-2013), planes de pensiones, donativos, maternidad, familia numerosa...</li>
              <li><strong>Confirma y presenta:</strong> Si estás conforme, confirma el borrador. Recibirás un PDF de justificante.</li>
              <li><strong>Domicilia el pago:</strong> Si sale a pagar, puedes domiciliar hasta el 25 de junio o fraccionar en dos pagos (60% + 40%).</li>
            </ol>

            <h2><span aria-hidden="true">💡</span> Consejos prácticos</h2>
            <ul>
              <li>Consulta siempre el borrador aunque creas que no estás obligado: podrías tener devolución.</li>
              <li>Si cambiaste de trabajo, ten en cuenta que cada empresa retiene como si fuera tu único pagador. Esto genera retenciones insuficientes.</li>
              <li>Las declaraciones conjuntas solo interesan si uno de los cónyuges tiene ingresos bajos o nulos.</li>
              <li>Guarda justificantes de deducciones durante 4 años (plazo de prescripción).</li>
              <li>Si tienes dudas, pide cita telefónica gratuita con la AEAT (desde el 6 de mayo).</li>
              <li>No esperes al último día: los servidores de la AEAT se saturan en las últimas jornadas.</li>
            </ul>

            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Errores frecuentes</h3>
              <ul>
                <li>No declarar al tener 2 pagadores pensando que el umbral es siempre 22.000 €</li>
                <li>Olvidar que el SEPE cuenta como segundo pagador</li>
                <li>No incluir rendimientos del capital mobiliario (intereses bancarios, dividendos)</li>
                <li>Confundir ingresos brutos con netos al comparar con los umbrales</li>
                <li>No declarar estando obligado y perder el derecho a devolución</li>
                <li>Presentar fuera de plazo sin motivo: genera recargo automático</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-obligado-declarar-renta')} />
        <ShareCard appName="test-obligado-declarar-renta" />
        <Footer appName="test-obligado-declarar-renta" />
      </div>
    </>
  );
}
