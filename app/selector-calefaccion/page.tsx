'use client';

import React, { useState } from 'react';
import styles from './SelectorCalefaccion.module.css';
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

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type SistemaKey = 'aerotermia' | 'bomba-calor' | 'caldera-gas' | 'pellet' | 'electrico';

interface Opcion {
  valor: string;
  etiqueta: string;
  desc: string;
}

interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
}

interface SistemaInfo {
  nombre: string;
  icon: string;
  costeInstalacion: string;
  costeAnual: string;
  descripcion: string;
  pros: string[];
  contras: string[];
}

interface Resultado {
  sistemaPrincipal: SistemaKey;
  sistemaAlternativa: SistemaKey;
  razones: string[];
  consejos: string[];
  subvenciones: boolean;
}

// ─────────────────────────────────────────────
// Datos de sistemas
// ─────────────────────────────────────────────

const SISTEMAS: Record<SistemaKey, SistemaInfo> = {
  aerotermia: {
    nombre: 'Aerotermia',
    icon: '🌡️',
    costeInstalacion: '8.000 – 15.000 €',
    costeAnual: '600 – 1.100 €',
    descripcion: 'Sistema de bomba de calor aire-agua que calienta, enfría y produce ACS. Alta eficiencia: por cada kWh eléctrico genera 3-4 kWh de calor.',
    pros: ['Calefacción + refrigeración + ACS en un solo equipo', 'COP 3-4: muy eficiente', 'Subvenciones de hasta el 40-60%', 'Ideal con tarifa supervalle nocturna'],
    contras: ['Inversión inicial alta', 'Requiere espacio exterior para la unidad', 'Rendimiento menor con frío extremo'],
  },
  'bomba-calor': {
    nombre: 'Bomba de Calor (split)',
    icon: '❄️',
    costeInstalacion: '2.000 – 5.000 €',
    costeAnual: '500 – 900 €',
    descripcion: 'Equipos de aire acondicionado con función calefacción. Sin obras, instalación rápida. Ideal para pisos o casas con radiadores eléctricos.',
    pros: ['Menor inversión inicial', 'Sin obras importantes', 'Calefacción y refrigeración', 'Instalación rápida (días)'],
    contras: ['Sin ACS integrado', 'Calor por convección (menos confort que suelo radiante)', 'Menos subvenciones que aerotermia'],
  },
  'caldera-gas': {
    nombre: 'Caldera de Gas',
    icon: '🔥',
    costeInstalacion: '2.500 – 5.000 €',
    costeAnual: '900 – 1.600 €',
    descripcion: 'Sistema consolidado, instalación sencilla y amplia red de servicio técnico. En declive por normativa europea de eficiencia energética.',
    pros: ['Inversión inicial moderada', 'Red de técnicos muy amplia', 'Calor instantáneo', 'Compatible con instalaciones existentes'],
    contras: ['Gas sujeto a volatilidad de precios', 'Normativa europea restrictiva desde 2025', 'Huella de carbono mayor', 'Sin refrigeración'],
  },
  pellet: {
    nombre: 'Caldera o Estufa de Pellet',
    icon: '🪵',
    costeInstalacion: '5.000 – 12.000 €',
    costeAnual: '700 – 1.200 €',
    descripcion: 'Combustible renovable de bajo coste. Muy eficiente en zonas rurales con acceso a pellet a buen precio. Requiere almacenamiento.',
    pros: ['Combustible renovable y barato', 'Alta autonomía con tolva grande', 'Subvenciones disponibles', 'Buena alternativa sin gas natural'],
    contras: ['Necesita espacio de almacenamiento', 'Mantenimiento más frecuente', 'Requiere suministro regular de pellet', 'Sin refrigeración'],
  },
  electrico: {
    nombre: 'Radiadores Eléctricos de Bajo Consumo',
    icon: '⚡',
    costeInstalacion: '800 – 2.500 €',
    costeAnual: '1.000 – 2.000 €',
    descripcion: 'Solución sin obras ni instalación de gas. Ideal para uso puntual o complementario. Coste energético más alto, pero inversión mínima.',
    pros: ['Sin obras ni instalación compleja', 'Coste inicial muy bajo', 'Control independiente por estancia', 'Sin mantenimiento'],
    contras: ['Coste eléctrico más alto', 'Sin refrigeración ni ACS', 'No recomendado como sistema principal en climas fríos'],
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    categoria: 'Tu vivienda',
    pregunta: '¿Qué tipo de vivienda tienes?',
    icon: '🏠',
    opciones: [
      { valor: 'piso', etiqueta: 'Piso en bloque', desc: 'Apartamento o piso en edificio' },
      { valor: 'chalet', etiqueta: 'Casa unifamiliar o chalet', desc: 'Vivienda independiente con exterior' },
      { valor: 'adosado', etiqueta: 'Adosado o semidetachado', desc: 'Casa con vecinos en pared medianera' },
      { valor: 'rural', etiqueta: 'Casa rural o de campo', desc: 'Vivienda aislada fuera de la ciudad' },
    ],
  },
  {
    id: 2,
    categoria: 'Tu vivienda',
    pregunta: '¿Cuántos metros cuadrados tiene tu vivienda aproximadamente?',
    icon: '📐',
    opciones: [
      { valor: 'pequena', etiqueta: 'Menos de 60 m²', desc: 'Estudio o piso pequeño' },
      { valor: 'media', etiqueta: '60 – 100 m²', desc: 'Piso o casa mediana' },
      { valor: 'grande', etiqueta: '100 – 180 m²', desc: 'Casa grande o chalet' },
      { valor: 'muygrande', etiqueta: 'Más de 180 m²', desc: 'Vivienda muy amplia' },
    ],
  },
  {
    id: 3,
    categoria: 'Tu vivienda',
    pregunta: '¿Qué sistema de distribución de calor tienes instalado?',
    icon: '🔧',
    opciones: [
      { valor: 'radiadores', etiqueta: 'Radiadores de agua', desc: 'Los radiadores clásicos conectados a caldera' },
      { valor: 'suelo', etiqueta: 'Suelo radiante', desc: 'Calefacción por el suelo' },
      { valor: 'fancoils', etiqueta: 'Fan-coils o conductos', desc: 'Sistema de aire forzado' },
      { valor: 'ninguno', etiqueta: 'Ninguno instalado aún', desc: 'Instalación nueva o primera vez' },
    ],
  },
  {
    id: 4,
    categoria: 'Tu vivienda',
    pregunta: '¿Cuál es el clima de tu zona?',
    icon: '🌤️',
    opciones: [
      { valor: 'frio', etiqueta: 'Frío o muy frío', desc: 'Inviernos largos, nieve ocasional (interior, norte)' },
      { valor: 'templado', etiqueta: 'Templado', desc: 'Inviernos suaves, veranos cálidos' },
      { valor: 'caluroso', etiqueta: 'Cálido o mediterráneo', desc: 'Inviernos cortos, veranos muy calurosos' },
      { valor: 'canarias', etiqueta: 'Clima muy suave', desc: 'Canarias o costa sur sin frío real' },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación actual',
    pregunta: '¿Tienes actualmente caldera de gas natural?',
    icon: '⛽',
    opciones: [
      { valor: 'si_reciente', etiqueta: 'Sí, menos de 5 años', desc: 'Caldera nueva, en buen estado' },
      { valor: 'si_vieja', etiqueta: 'Sí, más de 10 años', desc: 'Caldera antigua, próxima a renovación' },
      { valor: 'no_gas', etiqueta: 'No, sin gas natural', desc: 'No hay acometida de gas en mi zona' },
      { valor: 'otro', etiqueta: 'Otro sistema', desc: 'Gasoil, propano, eléctrico…' },
    ],
  },
  {
    id: 6,
    categoria: 'Tu uso',
    pregunta: '¿Necesitas también refrigeración en verano?',
    icon: '🌞',
    opciones: [
      { valor: 'imprescindible', etiqueta: 'Sí, imprescindible', desc: 'Veranos muy calurosos, sin aire sería imposible' },
      { valor: 'util', etiqueta: 'Sí, me sería muy útil', desc: 'Caluroso pero me las arreglaba sin él' },
      { valor: 'poco', etiqueta: 'Poco o nada', desc: 'Mi zona no lo requiere' },
    ],
  },
  {
    id: 7,
    categoria: 'Tu uso',
    pregunta: '¿Cuántos meses al año usas la calefacción?',
    icon: '📅',
    opciones: [
      { valor: 'pocos', etiqueta: '2 – 3 meses', desc: 'Inviernos cortos y suaves' },
      { valor: 'medio', etiqueta: '4 – 5 meses', desc: 'Invierno estándar' },
      { valor: 'mucho', etiqueta: '6 o más meses', desc: 'Clima frío, uso muy prolongado' },
    ],
  },
  {
    id: 8,
    categoria: 'Tu situación actual',
    pregunta: '¿Tienes o puedes instalar una unidad exterior (compresor)?',
    icon: '🏗️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, tengo espacio exterior', desc: 'Terraza, jardín o fachada exterior' },
      { valor: 'comunidad', etiqueta: 'Depende de la comunidad', desc: 'Piso en bloque, necesito permiso' },
      { valor: 'no', etiqueta: 'No tengo espacio', desc: 'Sin posibilidad de instalar unidad exterior' },
    ],
  },
  {
    id: 9,
    categoria: 'Tu presupuesto',
    pregunta: '¿Cuál es tu presupuesto para la instalación?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Menos de 3.000 €', desc: 'Inversión mínima' },
      { valor: 'medio', etiqueta: '3.000 – 8.000 €', desc: 'Inversión moderada' },
      { valor: 'alto', etiqueta: '8.000 – 15.000 €', desc: 'Dispuesto a invertir con vista al largo plazo' },
      { valor: 'premium', etiqueta: 'Más de 15.000 €', desc: 'Quiero la mejor solución posible' },
    ],
  },
  {
    id: 10,
    categoria: 'Tu presupuesto',
    pregunta: '¿Te interesan las subvenciones disponibles (Next Generation EU, PERTE)?',
    icon: '🏛️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, quiero aprovecharlas', desc: 'Dispuesto a hacer los trámites necesarios' },
      { valor: 'quizas', etiqueta: 'Si no son muy complicadas', desc: 'Solo si el proceso es sencillo' },
      { valor: 'no', etiqueta: 'Prefiero no complicarme', desc: 'Prefiero una solución directa sin trámites' },
    ],
  },
];

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

function calcularResultado(r: Record<number, string>): Resultado {
  let puntoAerotermia = 0;
  let puntoBombaSplit = 0;
  let puntoCalderas = 0;
  let puntoPellet = 0;
  let puntoElectrico = 0;
  const razones: string[] = [];
  const consejos: string[] = [];

  // Tipo de vivienda
  if (r[1] === 'chalet' || r[1] === 'adosado') { puntoAerotermia += 2; puntoPellet += 1; }
  if (r[1] === 'rural') { puntoPellet += 3; puntoAerotermia += 1; }
  if (r[1] === 'piso') { puntoBombaSplit += 2; puntoElectrico += 1; }

  // Tamaño
  if (r[2] === 'grande' || r[2] === 'muygrande') { puntoAerotermia += 2; puntoPellet += 1; }
  if (r[2] === 'pequena') { puntoBombaSplit += 2; puntoElectrico += 2; }

  // Sistema de distribución actual
  if (r[3] === 'radiadores') { puntoCalderas += 2; puntoAerotermia += 1; }
  if (r[3] === 'suelo') { puntoAerotermia += 3; }
  if (r[3] === 'ninguno') { puntoAerotermia += 2; puntoBombaSplit += 1; }

  // Clima
  if (r[4] === 'frio') { puntoAerotermia += 1; puntoPellet += 2; puntoCalderas += 1; }
  if (r[4] === 'caluroso' || r[4] === 'canarias') { puntoBombaSplit += 3; puntoAerotermia += 1; }
  if (r[4] === 'templado') { puntoAerotermia += 2; puntoBombaSplit += 1; }

  // Gas actual
  if (r[5] === 'si_reciente') { puntoCalderas += 4; }
  if (r[5] === 'si_vieja') { puntoAerotermia += 2; puntoBombaSplit += 1; }
  if (r[5] === 'no_gas') { puntoAerotermia += 2; puntoPellet += 1; puntoBombaSplit += 1; }

  // Refrigeración
  if (r[6] === 'imprescindible') { puntoBombaSplit += 3; puntoAerotermia += 2; }
  if (r[6] === 'util') { puntoBombaSplit += 1; puntoAerotermia += 1; }

  // Meses de uso
  if (r[7] === 'mucho') { puntoAerotermia += 2; puntoPellet += 1; }
  if (r[7] === 'pocos') { puntoBombaSplit += 2; puntoElectrico += 1; }

  // Unidad exterior
  if (r[8] === 'no') { puntoCalderas += 2; puntoElectrico += 2; }
  if (r[8] === 'comunidad') { puntoBombaSplit += 1; puntoElectrico += 1; }
  if (r[8] === 'si') { puntoAerotermia += 2; puntoBombaSplit += 2; }

  // Presupuesto
  if (r[9] === 'bajo') { puntoElectrico += 4; puntoBombaSplit += 2; }
  if (r[9] === 'medio') { puntoBombaSplit += 2; puntoCalderas += 1; puntoPellet += 1; }
  if (r[9] === 'alto') { puntoAerotermia += 3; }
  if (r[9] === 'premium') { puntoAerotermia += 4; }

  // Subvenciones
  const subvenciones = r[10] === 'si' || r[10] === 'quizas';
  if (subvenciones) { puntoAerotermia += 2; puntoPellet += 1; }

  // Ordenar por puntuación
  const scores: [SistemaKey, number][] = [
    ['aerotermia', puntoAerotermia],
    ['bomba-calor', puntoBombaSplit],
    ['caldera-gas', puntoCalderas],
    ['pellet', puntoPellet],
    ['electrico', puntoElectrico],
  ];
  scores.sort((a, b) => b[1] - a[1]);

  const sistemaPrincipal = scores[0][0];
  const sistemaAlternativa = scores[1][0];

  // Razones
  if (sistemaPrincipal === 'aerotermia') {
    razones.push('La aerotermia es la opción más eficiente y subvencionada en 2025: calienta, enfría y produce ACS en un solo equipo.');
    if (r[3] === 'suelo') razones.push('Tu suelo radiante es ideal para aerotermia: trabaja a baja temperatura y maximiza la eficiencia del sistema.');
    if (subvenciones) razones.push('Con las subvenciones Next Generation EU puedes cubrir hasta el 40-60% del coste de instalación.');
  }
  if (sistemaPrincipal === 'bomba-calor') {
    razones.push('Una bomba de calor tipo split es la solución más equilibrada: menor inversión inicial, sin obras mayores y con refrigeración incluida.');
    if (r[6] === 'imprescindible') razones.push('Al necesitar también refrigeración en verano, un equipo que hace ambas cosas es la opción más rentable.');
  }
  if (sistemaPrincipal === 'caldera-gas') {
    razones.push('Con una caldera reciente en buen estado, mantenerla es la decisión económicamente más sensata a corto plazo.');
    razones.push('Considera planificar la transición a bomba de calor o aerotermia cuando la caldera llegue al final de su vida útil (10-15 años).');
  }
  if (sistemaPrincipal === 'pellet') {
    razones.push('En tu zona rural o sin gas natural, el pellet ofrece el coste energético más bajo con combustible renovable de producción nacional.');
    razones.push('Las calderas de pellet modernas tienen alta autonomía y rendimiento superior al 95%.');
  }
  if (sistemaPrincipal === 'electrico') {
    razones.push('Para tu situación (presupuesto ajustado o uso reducido), los radiadores eléctricos de bajo consumo son la opción más práctica sin obras.');
    razones.push('A largo plazo, considera una bomba de calor cuando puedas invertir: el ahorro en factura lo amortiza en pocos años.');
  }

  // Consejos
  if (r[5] === 'si_reciente') {
    consejos.push('💡 Tu caldera es reciente: no tiene sentido cambiarla ahora. Espera a que llegue a los 10-12 años para planificar la transición a sistemas renovables.');
  }
  if (subvenciones) {
    consejos.push('🏛️ Las subvenciones del programa PERTE Industria Verde y Next Generation EU para renovables se solicitan a través de tu comunidad autónoma. Consulta la web del IDAE (idae.es).');
  }
  if (r[4] === 'frio' && (sistemaPrincipal === 'aerotermia' || sistemaPrincipal === 'bomba-calor')) {
    consejos.push('🌡️ En climas muy fríos, elige equipos con COP garantizado por debajo de -10°C. Las marcas japonesas (Mitsubishi, Daikin, Fujitsu) son referencia en este aspecto.');
  }
  consejos.push('🔧 Pide siempre al menos 3 presupuestos de instaladores certificados. La calidad de la instalación es tan importante como el equipo elegido.');
  if (r[3] === 'radiadores' && sistemaPrincipal === 'aerotermia') {
    consejos.push('📊 Con radiadores existentes, una aerotermia de alta temperatura (hasta 65°C) funciona perfectamente. Es más cara pero evita cambiar todos los radiadores.');
  }

  return { sistemaPrincipal, sistemaAlternativa, razones, consejos, subvenciones };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorCalefaccion() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('intro');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">🏠</span> Asesor de Calefacción</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro'
              ? '10 preguntas para saber qué sistema de calefacción te conviene'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu sistema de calefacción ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu vivienda y situación</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="financial" severity="critical" />

      {/* ── INTRO ── */}
      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🌡️</span>
              <span className={styles.introIcon}>⚡</span>
              <span className={styles.introIcon}>🔥</span>
              <span className={styles.introIcon}>🪵</span>
            </div>
            <h2 className={styles.introTitulo}>¿Aerotermia, gas o bomba de calor?</h2>
            <p className={styles.introDesc}>
              Elegir el sistema de calefacción es una decisión que afecta a tu confort y a tu factura durante 15-20 años.
              El mercado ha cambiado mucho: las bombas de calor y la aerotermia están desbancando al gas gracias a las
              subvenciones y a su mayor eficiencia. Este test analiza tu vivienda y situación real para orientarte.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Sistema principal recomendado con alternativa</li>
              <li><span aria-hidden="true">✅</span> Coste de instalación y coste anual orientativo</li>
              <li><span aria-hidden="true">✅</span> Pros y contras de cada tecnología</li>
              <li><span aria-hidden="true">✅</span> Información sobre subvenciones disponibles</li>
              <li><span aria-hidden="true">✅</span> Consejos personalizados según tu situación</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── TEST ── */}
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
              aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso + 1}
              aria-valuemin={1}
              aria-valuemax={totalPreguntas}
            >
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">
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

      {/* ── RESULTADO ── */}
      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          {/* Recomendaciones */}
          <div className={styles.recomendacionGrid}>
            <div className={styles.recomendacionCard}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{SISTEMAS[resultado.sistemaPrincipal].icon}</span>
              <p className={styles.recomendacionLabel}>Tu mejor opción</p>
              <p className={styles.recomendacionValor}>{SISTEMAS[resultado.sistemaPrincipal].nombre}</p>
              <p className={styles.recomendacionDesc}>{SISTEMAS[resultado.sistemaPrincipal].descripcion}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardAlt}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{SISTEMAS[resultado.sistemaAlternativa].icon}</span>
              <p className={styles.recomendacionLabel}>Alternativa a considerar</p>
              <p className={styles.recomendacionValor}>{SISTEMAS[resultado.sistemaAlternativa].nombre}</p>
              <p className={styles.recomendacionDesc}>{SISTEMAS[resultado.sistemaAlternativa].descripcion}</p>
            </div>
          </div>

          {/* Costes */}
          <div className={styles.costesSection}>
            <p className={styles.costesTitulo}>Costes orientativos — {SISTEMAS[resultado.sistemaPrincipal].nombre}</p>
            <p className={styles.costesNota}>Estimaciones aproximadas. Varían según marca, tamaño de vivienda e instalador.</p>
            <div className={styles.costesGrid}>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Instalación</p>
                <p className={styles.costeValor}>{SISTEMAS[resultado.sistemaPrincipal].costeInstalacion}</p>
              </div>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Coste anual</p>
                <p className={styles.costeValor}>{SISTEMAS[resultado.sistemaPrincipal].costeAnual}</p>
              </div>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Vida útil</p>
                <p className={styles.costeValor}>15 – 25 años</p>
              </div>
            </div>
          </div>

          {/* Razones */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => (
              <p key={i} className={styles.razonItem}>{r}</p>
            ))}
          </div>

          {/* Subvenciones */}
          {resultado.subvenciones && (
            <div className={styles.subvencionesSection}>
              <p className={styles.subvencionesTitulo}><span aria-hidden="true">🏛️</span> Subvenciones disponibles en 2025</p>
              <p className={styles.subvencionesDesc}>
                El programa <strong>Next Generation EU</strong> y el <strong>PERTE Industria Verde</strong> ofrecen ayudas
                de hasta el <strong>40-60% del coste</strong> para instalación de bombas de calor, aerotermia y sistemas
                de energía renovable. Se tramitan a través de cada comunidad autónoma. Consulta el portal del{' '}
                <strong>IDAE (idae.es)</strong> o tu ayuntamiento para los programas vigentes en tu zona.
              </p>
            </div>
          )}

          {/* Consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de decidirte</p>
            {resultado.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>{c}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          <EducationalSection
            title="Guía completa: sistemas de calefacción en España 2025"
            subtitle="Aerotermia, bomba de calor, gas, pellet y eléctrico explicados"
            defaultOpen={false}
          >
            <h3>El mapa de tecnologías en 2025</h3>
            <p>
              La calefacción en España está viviendo una transición acelerada. La normativa europea (Directiva de Eficiencia
              Energética de Edificios) obliga a que las nuevas instalaciones sean cada vez más eficientes, y las subvenciones
              públicas están haciendo que la aerotermia y las bombas de calor sean la opción más rentable a largo plazo.
            </p>

            <h3>Aerotermia: la gran protagonista</h3>
            <p>
              La aerotermia es una bomba de calor aire-agua: extrae calor del aire exterior (incluso a temperaturas negativas)
              y lo transfiere al agua del circuito de calefacción. Un equipo estándar produce 3-4 kWh de calor por cada kWh
              eléctrico consumido (COP 3-4). Puede alimentar radiadores, suelo radiante y producir agua caliente sanitaria.
            </p>
            <p>
              Su principal ventaja frente al gas es que el precio de la electricidad puede estabilizarse con tarifa supervalle
              y paneles solares, mientras que el gas natural está sujeto a volatilidad de mercados internacionales.
            </p>

            <h3>Bomba de calor (split): la opción intermedia</h3>
            <p>
              Los equipos de aire acondicionado invertido (splits) también funcionan como calefacción con buena eficiencia.
              Son más baratos de instalar que la aerotermia y no requieren conexión a radiadores. Ideales en zonas cálidas
              o como complemento en pisos donde no hay caldera.
            </p>

            <h3>Gas natural: cuándo tiene sentido mantenerlo</h3>
            <p>
              Si tienes una caldera de gas reciente (menos de 7 años) en buen estado, cambiarla ahora no es rentable.
              La vida útil de una buena caldera es de 15-20 años. La estrategia más sensata es planificar la sustitución
              por aerotermia cuando llegue al final de su vida útil, aprovechando entonces las subvenciones disponibles.
            </p>
            <div className={styles.warningBox}>
              <strong>Normativa 2025:</strong> La UE ha establecido que a partir de 2025 las calderas de gas nuevas
              deben cumplir requisitos de mezcla con hidrógeno o biogás. En nuevas construcciones, la tendencia es
              hacia sistemas totalmente libres de combustibles fósiles. Para rehabilitaciones, el gas sigue siendo
              una opción legal pero con menor apoyo de subvenciones.
            </div>

            <h3>Pellet: la renovable más económica en zonas sin gas</h3>
            <p>
              En zonas rurales sin acceso a gas natural, el pellet es la opción renovable con menor coste energético por kWh.
              El pellet de madera tiene un precio estable y su producción es mayoritariamente nacional. Las calderas modernas
              tienen alimentación automática y rendimientos superiores al 90%.
            </p>

            <h3>Cómo aprovechar las subvenciones</h3>
            <p>
              Las ayudas del plan <strong>MOVES</strong>, <strong>PERTE</strong> y los fondos <strong>Next Generation EU</strong>
              canalizados por las comunidades autónomas pueden cubrir entre el 40% y el 70% del coste en el caso de
              instalaciones renovables (aerotermia, geotermia, biomasa). Los plazos y condiciones varían por CCAA.
              El portal <strong>idae.es</strong> mantiene un buscador de ayudas actualizado.
            </p>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-calefaccion')} />
      <ShareCard appName="selector-calefaccion" />
      <Footer appName="selector-calefaccion" />
    </div>
  );
}
