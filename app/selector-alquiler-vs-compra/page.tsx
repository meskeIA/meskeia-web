'use client';

import React, { useState } from 'react';
import styles from './SelectorAlquilerVsCompra.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type VeredictoKey = 'alquila' | 'espera' | 'compra';

interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: { valor: string; etiqueta: string; descripcion: string; puntos: number }[];
}

interface Resultado {
  veredicto: VeredictoKey;
  puntuacion: number;
  respuestasPorCategoria: Record<string, string>;
}

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 'horizonte',
    categoria: 'Horizonte Temporal',
    icono: '📅',
    texto: '¿Cuánto tiempo prevés quedarte en esta ciudad o zona?',
    opciones: [
      { valor: 'corto', etiqueta: 'Menos de 3 años', descripcion: 'Situación temporal o en revisión', puntos: -4 },
      { valor: 'medio', etiqueta: 'Entre 3 y 7 años', descripcion: 'Probable, aunque puede cambiar', puntos: -1 },
      { valor: 'largo', etiqueta: 'Más de 7 años', descripcion: 'Tengo muy claro que me quedo', puntos: 3 },
      { valor: 'indefinido', etiqueta: 'Indefinidamente', descripcion: 'Esta es mi ciudad definitiva', puntos: 4 },
    ],
  },
  {
    id: 'laboral',
    categoria: 'Estabilidad Laboral',
    icono: '💼',
    texto: '¿Cuál es tu situación laboral actual?',
    opciones: [
      { valor: 'indefinido', etiqueta: 'Contrato indefinido o funcionario', descripcion: 'Estabilidad garantizada', puntos: 4 },
      { valor: 'temporal', etiqueta: 'Contrato temporal o en transición', descripcion: 'Incertidumbre a corto plazo', puntos: -3 },
      { valor: 'autonomo_consolidado', etiqueta: 'Autónomo consolidado (+3 años)', descripcion: 'Ingresos estables y predecibles', puntos: 2 },
      { valor: 'autonomo_reciente', etiqueta: 'Autónomo reciente o sin contrato', descripcion: 'Situación todavía en consolidación', puntos: -4 },
    ],
  },
  {
    id: 'ahorro',
    categoria: 'Capacidad de Entrada',
    icono: '💰',
    texto: '¿Cuánto ahorro tienes disponible para la entrada y gastos?',
    opciones: [
      { valor: 'bajo', etiqueta: 'Menos del 10% del precio buscado', descripcion: 'Entrada insuficiente en la mayoría de casos', puntos: -4 },
      { valor: 'justo', etiqueta: 'Entre el 10% y el 20%', descripcion: 'Lo mínimo, con poco margen', puntos: -1 },
      { valor: 'suficiente', etiqueta: 'Entre el 20% y el 30%', descripcion: 'Entrada cómoda con algo de colchón', puntos: 2 },
      { valor: 'holgado', etiqueta: 'Más del 30%', descripcion: 'Posición muy sólida para comprar', puntos: 4 },
    ],
  },
  {
    id: 'flexibilidad',
    categoria: 'Flexibilidad Geográfica',
    icono: '📍',
    texto: '¿Podrías tener que cambiar de ciudad por trabajo u otros motivos?',
    opciones: [
      { valor: 'alta', etiqueta: 'Sí, es bastante probable', descripcion: 'Movilidad laboral o personal alta', puntos: -4 },
      { valor: 'media', etiqueta: 'No descarto que ocurra', descripcion: 'Podría pasar, aunque no es seguro', puntos: -1 },
      { valor: 'baja', etiqueta: 'Muy improbable, estoy arraigado/a', descripcion: 'Mi vida está centrada aquí', puntos: 3 },
      { valor: 'remoto', etiqueta: 'Trabajo en remoto, tengo libertad total', descripcion: 'Puedo elegir sin depender del trabajo', puntos: 1 },
    ],
  },
  {
    id: 'familiar',
    categoria: 'Situación Personal',
    icono: '👨‍👩‍👧',
    texto: '¿Cómo es tu situación familiar actual y a corto plazo?',
    opciones: [
      { valor: 'solo', etiqueta: 'Vivo solo/a, sin planes inmediatos', descripcion: 'Necesidades de espacio pueden cambiar poco', puntos: -1 },
      { valor: 'pareja', etiqueta: 'En pareja, sin hijos aún', descripcion: 'Situación estable pero puede evolucionar', puntos: 1 },
      { valor: 'hijos', etiqueta: 'Con hijos o planificándolos', descripcion: 'La estabilidad residencial importa más', puntos: 3 },
      { valor: 'cambio', etiqueta: 'En transición (separación, nido vacío...)', descripcion: 'Mejor esperar a que se estabilice', puntos: -2 },
    ],
  },
  {
    id: 'mercado',
    categoria: 'Mercado Local',
    icono: '🏙️',
    texto: '¿Cómo describes el mercado inmobiliario de tu zona?',
    opciones: [
      { valor: 'compra_asequible', etiqueta: 'Alquiler caro, compra más razonable', descripcion: 'La compra tiene ventaja económica', puntos: 3 },
      { valor: 'compra_cara', etiqueta: 'Compra muy cara, alquiler razonable', descripcion: 'El alquiler es más eficiente aquí', puntos: -3 },
      { valor: 'ambos_caros', etiqueta: 'Ambos están muy caros', descripcion: 'Mercado tenso, difícil en cualquier opción', puntos: -2 },
      { valor: 'equilibrado', etiqueta: 'Equilibrado, sin grandes diferencias', descripcion: 'La decisión depende más de factores personales', puntos: 0 },
    ],
  },
  {
    id: 'deuda',
    categoria: 'Tolerancia a la Deuda',
    icono: '📊',
    texto: '¿Cómo te sientes respecto a tener una hipoteca?',
    opciones: [
      { valor: 'ansiedad', etiqueta: 'Me genera ansiedad, prefiero evitarla', descripcion: 'El peso psicológico importa', puntos: -3 },
      { valor: 'acepta', etiqueta: 'La acepto si los números tienen sentido', descripcion: 'Visión pragmática y razonada', puntos: 1 },
      { valor: 'normal', etiqueta: 'La veo como una herramienta normal', descripcion: 'Cómodo/a con el endeudamiento', puntos: 3 },
      { valor: 'liquidez', etiqueta: 'Prefiero mantener liquidez', descripcion: 'El ahorro accesible te da más tranquilidad', puntos: -2 },
    ],
  },
  {
    id: 'cargas',
    categoria: 'Cargas Económicas',
    icono: '⚖️',
    texto: '¿Tienes préstamos, deudas u otras cargas económicas significativas?',
    opciones: [
      { valor: 'sin_cargas', etiqueta: 'No, situación económica despejada', descripcion: 'Puedes destinar más capacidad a la hipoteca', puntos: 3 },
      { valor: 'prestamos', etiqueta: 'Sí, préstamos o deudas importantes', descripcion: 'La hipoteca se suma a una carga ya elevada', puntos: -3 },
      { valor: 'dependientes', etiqueta: 'Tengo dependientes a mi cargo', descripcion: 'Más gastos fijos, menos margen', puntos: -1 },
      { valor: 'leve', etiqueta: 'Solo algo menor (coche, tarjeta...)', descripcion: 'Manejable, no compromete la hipoteca', puntos: 1 },
    ],
  },
  {
    id: 'riesgo_venta',
    categoria: 'Riesgo de Venta Anticipada',
    icono: '🔄',
    texto: '¿Qué pasaría si tuvieras que vender la vivienda en 3-4 años?',
    opciones: [
      { valor: 'grave', etiqueta: 'Sería un problema grave', descripcion: 'No tienes colchón para absorber pérdidas', puntos: -3 },
      { valor: 'aceptable', etiqueta: 'Me generaría pérdidas asumibles', descripcion: 'Puedes permitirte ese riesgo', puntos: 0 },
      { valor: 'margen', etiqueta: 'Tengo margen, no me preocupa', descripcion: 'Posición económica sólida', puntos: 2 },
      { valor: 'no_quiero', etiqueta: 'No quiero asumir ese riesgo en ningún caso', descripcion: 'La aversión al riesgo también es válida', puntos: -2 },
    ],
  },
  {
    id: 'prioridad',
    categoria: 'Prioridad Personal',
    icono: '🎯',
    texto: '¿Qué es lo más importante para ti en esta decisión?',
    opciones: [
      { valor: 'patrimonio', etiqueta: 'Construir patrimonio a largo plazo', descripcion: 'La vivienda como inversión y activo', puntos: 3 },
      { valor: 'libertad', etiqueta: 'Flexibilidad y libertad de movimiento', descripcion: 'No atarse a un lugar', puntos: -3 },
      { valor: 'estabilidad', etiqueta: 'Estabilidad y echar raíces', descripcion: 'Un hogar propio donde construir vida', puntos: 2 },
      { valor: 'gasto', etiqueta: 'Optimizar el gasto mensual', descripcion: 'Lo que más compense financieramente mes a mes', puntos: 0 },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos de veredictos
// ─────────────────────────────────────────────

const VEREDICTOS: Record<VeredictoKey, {
  icono: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  razones: string[];
  proximosPasos: string[];
}> = {
  alquila: {
    icono: '🏠',
    etiqueta: 'Recomendación',
    titulo: 'Por ahora, mejor alquilar',
    descripcion: 'Tu situación actual tiene elementos de incertidumbre o inestabilidad que hacen más recomendable mantener la flexibilidad del alquiler. Esto no significa que nunca compres — simplemente que ahora no es el momento más adecuado.',
    razones: [
      'Tu horizonte temporal o estabilidad laboral no garantizan permanencia suficiente',
      'Comprar con prisa puede salir caro si tienes que vender antes de amortizar los gastos iniciales',
      'El alquiler te da flexibilidad para cambiar si cambia tu vida',
      'Puedes seguir ahorrando para estar en mejor posición cuando llegue el momento',
    ],
    proximosPasos: [
      'Define un plazo en el que revisarás esta decisión (1-2 años)',
      'Establece un objetivo de ahorro para la entrada',
      'Sigue el mercado de tu zona sin prisas',
      'Compara con la calculadora de alquiler vs compra cuando tengas datos concretos',
    ],
  },
  espera: {
    icono: '⏳',
    etiqueta: 'Recomendación',
    titulo: 'Espera antes de decidir',
    descripcion: 'Tienes elementos a favor y en contra que se compensan. No hay una respuesta clara en este momento: o bien tu situación está en transición, o bien el mercado no favorece claramente ninguna opción. Mejor esperar a que el panorama se aclare.',
    razones: [
      'Tu situación tiene factores ambivalentes que no permiten decantarse claramente',
      'Comprar ahora con dudas puede generar arrepentimiento',
      'Esperar no significa perder: el mercado fluctúa y tu situación puede mejorar',
      'Ganar claridad en los próximos meses te dará una decisión más firme',
    ],
    proximosPasos: [
      'Identifica los 1-2 factores que más te frenan y trabájalos',
      'Pon un plazo de revisión: en 6-12 meses repite este test',
      'Mientras tanto, ahorra activamente para mejorar tu posición',
      'Habla con un profesional inmobiliario o financiero sin compromiso',
    ],
  },
  compra: {
    icono: '🔑',
    etiqueta: 'Recomendación',
    titulo: 'Tu situación apunta a comprar',
    descripcion: 'Los factores clave — estabilidad laboral, horizonte temporal, capacidad económica y motivación personal — se alinean para que la compra tenga sentido en tu caso. No significa que sea fácil, pero es el momento adecuado para dar el paso.',
    razones: [
      'Tu estabilidad laboral y permanencia prevista justifican la inversión',
      'Tu capacidad económica te permite afrontar la entrada y los gastos iniciales',
      'El factor tiempo juega a tu favor: cuanto antes compres, antes amortizas',
      'Tu situación personal favorece tener un hogar propio y estable',
    ],
    proximosPasos: [
      'Usa la calculadora de alquiler vs compra para validar los números de tu caso concreto',
      'Consulta con una entidad financiera para conocer tu capacidad hipotecaria real',
      'Analiza el mercado de tu zona y define tu presupuesto máximo',
      'Plantéate contratar un seguro de hogar adecuado antes de escriturar',
    ],
  },
};

// ─────────────────────────────────────────────
// Lógica de resultado
// ─────────────────────────────────────────────

function calcularResultado(respuestas: Record<string, string>): Resultado {
  let puntuacion = 0;
  PREGUNTAS.forEach(p => {
    const respuesta = respuestas[p.id];
    const opcion = p.opciones.find(o => o.valor === respuesta);
    if (opcion) puntuacion += opcion.puntos;
  });

  let veredicto: VeredictoKey;
  if (puntuacion >= 8) veredicto = 'compra';
  else if (puntuacion <= -8) veredicto = 'alquila';
  else veredicto = 'espera';

  return { veredicto, puntuacion, respuestasPorCategoria: respuestas };
}

// ─────────────────────────────────────────────
// Helpers para mostrar etiqueta de respuesta
// ─────────────────────────────────────────────

function getEtiquetaRespuesta(preguntaId: string, valor: string): string {
  const pregunta = PREGUNTAS.find(p => p.id === preguntaId);
  if (!pregunta) return valor;
  const opcion = pregunta.opciones.find(o => o.valor === valor);
  return opcion ? opcion.etiqueta : valor;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'inicio' | 'test' | 'resultado';

export default function SelectorAlquilerVsCompra() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = ((paso + 1) / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      const res = calcularResultado(respuestas);
      setResultado(res);
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('inicio');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Alquilar o comprar?</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'inicio'
              ? 'Descubre qué opción se adapta mejor a tu situación vital real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu resultado</h1>
          <p className={styles.heroSubtitleSm}>
            {resultado ? VEREDICTOS[resultado.veredicto].titulo : ''}
          </p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="financial" severity="high" />

      {pantalla === 'inicio' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏠</span>
              <span className={styles.introIcon}>📋</span>
              <span className={styles.introIcon}>💰</span>
              <span className={styles.introIcon}>📍</span>
            </div>
            <h2 className={styles.introTitulo}>¿Alquilar o comprar?</h2>
            <p className={styles.introDesc}>
              Antes de mirar los números, hay algo más importante: ¿está tu vida en el punto adecuado
              para comprar? Este test analiza tu estabilidad laboral, horizonte temporal, situación
              familiar y mercado local para orientarte sin sesgos ni cálculos. Solo tú y tu contexto real.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás con el test">
              <li><span aria-hidden="true">✅</span> Veredicto claro: alquila, espera o compra</li>
              <li><span aria-hidden="true">✅</span> Análisis de tu estabilidad laboral y personal</li>
              <li><span aria-hidden="true">✅</span> Evaluación de tu horizonte temporal real</li>
              <li><span aria-hidden="true">✅</span> Consideración del mercado de tu zona</li>
              <li><span aria-hidden="true">✅</span> Sin registro ni datos personales</li>
            </ul>
            <button
              type="button"
              className={styles.btnStart}
              onClick={() => setPantalla('test')}
            >
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Progreso del test: pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso + 1}
              aria-valuemin={1}
              aria-valuemax={totalPreguntas}
            >
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.texto}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
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

      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          {/* Veredicto principal */}
          <div className={`${styles.veredictoCard} ${styles[`veredicto_${resultado.veredicto}`]}`}>
            <span className={styles.veredictoIcon} aria-hidden="true">
              {VEREDICTOS[resultado.veredicto].icono}
            </span>
            <p className={styles.veredictoLabel}>{VEREDICTOS[resultado.veredicto].etiqueta}</p>
            <p className={styles.veredictoValor}>{VEREDICTOS[resultado.veredicto].titulo}</p>
            <p className={styles.veredictoDesc}>{VEREDICTOS[resultado.veredicto].descripcion}</p>
          </div>

          {/* Grid de 4 factores clave */}
          <div className={styles.factoresGrid}>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}>📅 Horizonte temporal</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['horizonte']
                  ? getEtiquetaRespuesta('horizonte', resultado.respuestasPorCategoria['horizonte'])
                  : '—'}
              </p>
            </div>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}>💼 Estabilidad laboral</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['laboral']
                  ? getEtiquetaRespuesta('laboral', resultado.respuestasPorCategoria['laboral'])
                  : '—'}
              </p>
            </div>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}>💰 Capacidad de ahorro</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['ahorro']
                  ? getEtiquetaRespuesta('ahorro', resultado.respuestasPorCategoria['ahorro'])
                  : '—'}
              </p>
            </div>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}>🏙️ Mercado local</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['mercado']
                  ? getEtiquetaRespuesta('mercado', resultado.respuestasPorCategoria['mercado'])
                  : '—'}
              </p>
            </div>
          </div>

          {/* Razones del veredicto */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {VEREDICTOS[resultado.veredicto].razones.map((razon, i) => (
              <p key={i} className={styles.razonItem}>{razon}</p>
            ))}
          </div>

          {/* Próximos pasos */}
          <div className={styles.proximosSection}>
            <p className={styles.proximosTitulo}>Próximos pasos</p>
            {VEREDICTOS[resultado.veredicto].proximosPasos.map((paso, i) => (
              <p key={i} className={styles.proximoItem}>{paso}</p>
            ))}
          </div>

          <button
            type="button"
            className={styles.btnRepetir}
            onClick={reiniciar}
            aria-label="Repetir el test desde el principio"
          >
            ← Repetir el test
          </button>

          <EducationalSection
            title="Alquilar vs Comprar: lo que nadie te cuenta"
            subtitle="Más allá de los números, los factores que realmente importan"
            defaultOpen={false}
          >
            <h3>La regla del break-even: cuántos años necesitas</h3>
            <p>
              Comprar tiene costes iniciales muy elevados: entrada (20-30%), gastos notariales, impuestos
              (ITP o IVA, AJD) y tasación. En total, entre un 10% y un 15% adicional sobre el precio.
              Si tienes que vender antes de amortizarlos, perderás dinero casi con certeza. La regla
              general es que necesitas <strong>entre 5 y 8 años</strong> en la misma vivienda para que
              la compra compense frente al alquiler, dependiendo del mercado.
            </p>

            <h3>Costes ocultos de la compra que nadie menciona</h3>
            <p>
              Más allá de la hipoteca mensual, comprar tiene costes que los propietarios suelen olvidar:
            </p>
            <ul>
              <li><strong>IBI:</strong> impuesto anual que varía por municipio (200-1.500 €/año en pisos).</li>
              <li><strong>Comunidad de propietarios:</strong> cuotas mensuales, derramas y obras imprevistas.</li>
              <li><strong>Mantenimiento:</strong> reparaciones, electrodomésticos, instalaciones. Regla práctica: 1% del valor del inmueble al año.</li>
              <li><strong>Seguro del hogar:</strong> obligatorio con hipoteca (100-400 €/año).</li>
              <li><strong>Gastos de venta:</strong> si vendes, pagarás agencia (3-5%), plusvalía municipal e IRPF por la ganancia.</li>
            </ul>

            <h3>Las ventajas reales del alquiler</h3>
            <p>
              El alquiler no es tirar el dinero. Te ofrece cosas que la compra no puede darte:
            </p>
            <ul>
              <li><strong>Liquidez:</strong> el dinero de la entrada sigue siendo tuyo e invertible.</li>
              <li><strong>Flexibilidad:</strong> cambiar de ciudad, de zona o de tamaño sin penalizaciones.</li>
              <li><strong>Sin riesgo de depreciación:</strong> si el mercado cae, no te afecta como propietario.</li>
              <li><strong>Sin imprevistos costosos:</strong> las reparaciones estructurales son responsabilidad del propietario.</li>
            </ul>

            <h3>Cuándo comprar tiene sentido de verdad</h3>
            <p>
              La compra tiene más sentido cuando se dan varios de estos factores a la vez:
            </p>
            <ul>
              <li>Estabilidad laboral sólida (indefinido o autónomo consolidado +3 años).</li>
              <li>Horizonte temporal de más de 7-10 años en la misma zona.</li>
              <li>Ahorro suficiente para la entrada sin agotar el colchón de emergencia.</li>
              <li>Cuota hipotecaria por debajo del 35% de los ingresos netos.</li>
              <li>Mercado donde el alquiler es proporcionalmente más caro que la hipoteca equivalente.</li>
            </ul>

            <div className={styles.warningBox}>
              <strong>Recuerda:</strong> este test analiza factores cualitativos y vitales, no los números concretos
              de tu caso. Para una decisión informada, combina este resultado con una calculadora de alquiler
              vs compra que tenga en cuenta precios reales, tipos de interés actuales y tu situación fiscal específica.
            </div>
          </EducationalSection>

          <div className={styles.warningBox} role="note">
            Esta herramienta es orientativa y se basa exclusivamente en tus respuestas. No tiene en cuenta
            datos financieros concretos ni el mercado específico de tu zona. Para una decisión tan importante,
            consulta con un profesional inmobiliario o financiero.
          </div>

        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-alquiler-vs-compra')} />
      <ShareCard appName="selector-alquiler-vs-compra" />
      <Footer appName="selector-alquiler-vs-compra" />
    </div>
  );
}
