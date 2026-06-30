'use client';

import React, { useState } from 'react';
import styles from './SelectorPortatil.module.css';
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

type FormatoKey = 'portatil' | 'sobremesa' | 'dos-en-uno' | 'mini-pc';
type OSKey = 'windows' | 'mac' | 'linux' | 'chromeos';
type GamaKey = 'basica' | 'media' | 'alta' | 'pro';

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

interface ModeloRef {
  nombre: string;
  precio: string;
  nota: string;
  icon: string;
}

interface GamaInfo {
  nombre: string;
  icon: string;
  precioOrientativo: string;
  descripcion: string;
}

interface FormatoInfo {
  nombre: string;
  icon: string;
  descripcion: string;
}

interface OSInfo {
  nombre: string;
  icon: string;
  descripcion: string;
}

interface Resultado {
  formato: FormatoKey;
  os: OSKey;
  gama: GamaKey;
  razones: string[];
  consejos: string[];
  modelos: ModeloRef[];
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const FORMATOS: Record<FormatoKey, FormatoInfo> = {
  portatil: {
    nombre: 'Portátil',
    icon: '💻',
    descripcion: 'Movilidad total, batería integrada y pantalla incluida. La opción más versátil para la mayoría de usuarios.',
  },
  sobremesa: {
    nombre: 'Sobremesa + Monitor',
    icon: '🖥️',
    descripcion: 'Mejor rendimiento por euro, pantalla grande y ergonomía superior. Ideal si siempre trabajas en el mismo sitio.',
  },
  'dos-en-uno': {
    nombre: '2 en 1 (portátil/tablet)',
    icon: '📱',
    descripcion: 'Pantalla táctil y stylus para tomar notas o dibujar. Perfecto para estudiantes y creativos en movimiento.',
  },
  'mini-pc': {
    nombre: 'Mini PC',
    icon: '🔲',
    descripcion: 'Tamaño compacto con rendimiento de sobremesa. Necesita monitor, teclado y ratón. Ideal para un escritorio limpio.',
  },
};

const OS_INFO: Record<OSKey, OSInfo> = {
  windows: {
    nombre: 'Windows',
    icon: '🪟',
    descripcion: 'Mayor compatibilidad de software, especialmente para gaming, ingeniería y herramientas de empresa. Mayor variedad de precios y modelos.',
  },
  mac: {
    nombre: 'macOS (Apple)',
    icon: '🍎',
    descripcion: 'Excelente integración con iPhone/iPad, autonomía destacada en MacBook y rendimiento eficiente con chip Apple Silicon. Ideal para creativos.',
  },
  linux: {
    nombre: 'Linux',
    icon: '🐧',
    descripcion: 'Máxima personalización, ideal para programación y servidores. Requiere más conocimiento técnico. Software de ofimática y diseño más limitado.',
  },
  chromeos: {
    nombre: 'ChromeOS',
    icon: '🌐',
    descripcion: 'Ligero y seguro, perfecto para navegación web, Google Workspace y educación. No es compatible con software de escritorio tradicional.',
  },
};

const GAMAS: Record<GamaKey, GamaInfo> = {
  basica: {
    nombre: 'Gama de entrada',
    icon: '📗',
    precioOrientativo: '300 – 600 €',
    descripcion: 'Navegar, ofimática, videoconferencias y tareas cotidianas sin pretensiones. Rendimiento suficiente, sin lujos.',
  },
  media: {
    nombre: 'Gama media',
    icon: '📘',
    precioOrientativo: '600 – 1.100 €',
    descripcion: 'El punto dulce del mercado. Rendimiento fluido para multitarea, edición de fotos ligera y juegos casuales.',
  },
  alta: {
    nombre: 'Gama alta',
    icon: '📙',
    precioOrientativo: '1.100 – 1.800 €',
    descripcion: 'Procesadores potentes, pantallas de calidad y construcción premium. Para edición de vídeo, diseño o trabajo intensivo.',
  },
  pro: {
    nombre: 'Workstation / Pro',
    icon: '🏆',
    precioOrientativo: '1.800 – 4.000+ €',
    descripcion: 'Rendimiento máximo para CAD, renderizado 3D, IA, edición de vídeo 4K o gaming de alto nivel.',
  },
};

// Modelos por OS × Gama
const MODELOS: Record<OSKey, Record<GamaKey, ModeloRef[]>> = {
  windows: {
    basica: [
      { nombre: 'Lenovo IdeaPad 3', precio: '~400 €', nota: 'Fiable para ofimática y estudio', icon: '💻' },
      { nombre: 'HP 15s-fq', precio: '~450 €', nota: 'Buena pantalla, teclado cómodo', icon: '💻' },
      { nombre: 'Acer Aspire 3', precio: '~380 €', nota: 'El más económico con garantía', icon: '💻' },
    ],
    media: [
      { nombre: 'Lenovo IdeaPad 5', precio: '~750 €', nota: 'OLED disponible, muy equilibrado', icon: '💻' },
      { nombre: 'ASUS VivoBook 16X', precio: '~800 €', nota: 'Pantalla grande, buena autonomía', icon: '💻' },
      { nombre: 'HP Pavilion Plus 14', precio: '~850 €', nota: 'Pantalla OLED, compacto', icon: '💻' },
    ],
    alta: [
      { nombre: 'Dell XPS 15', precio: '~1.500 €', nota: 'Pantalla OLED, construcción excelente', icon: '💻' },
      { nombre: 'Lenovo ThinkPad X1 Carbon', precio: '~1.600 €', nota: 'El referente empresarial', icon: '💻' },
      { nombre: 'ASUS ProArt Studiobook', precio: '~1.400 €', nota: 'Ideal para diseño y color', icon: '💻' },
    ],
    pro: [
      { nombre: 'Dell XPS 17', precio: '~2.200 €', nota: 'Workstation portátil de referencia', icon: '🏆' },
      { nombre: 'Lenovo ThinkPad P16', precio: '~2.500 €', nota: 'GPU profesional certificada', icon: '🏆' },
    ],
  },
  mac: {
    basica: [
      { nombre: 'MacBook Air M2 (reacondicionado)', precio: '~900 €', nota: 'El mejor portátil básico si el presupuesto lo permite', icon: '💻' },
    ],
    media: [
      { nombre: 'MacBook Air M3 13"', precio: '~1.299 €', nota: 'Silencioso, ligero, batería excepcional', icon: '💻' },
      { nombre: 'MacBook Air M3 15"', precio: '~1.499 €', nota: 'Pantalla grande sin ventilador', icon: '💻' },
    ],
    alta: [
      { nombre: 'MacBook Pro 14" M4', precio: '~1.999 €', nota: 'Pantalla Liquid Retina XDR, potente y eficiente', icon: '💻' },
      { nombre: 'Mac mini M4', precio: '~699 €', nota: 'Sobremesa Apple más asequible, increíble rendimiento', icon: '🖥️' },
    ],
    pro: [
      { nombre: 'MacBook Pro 16" M4 Pro', precio: '~2.999 €', nota: 'Referencia en edición de vídeo y audio', icon: '🏆' },
      { nombre: 'Mac Studio M4 Max', precio: '~2.299 €', nota: 'Workstation de sobremesa compacta', icon: '🏆' },
    ],
  },
  linux: {
    basica: [
      { nombre: 'Lenovo ThinkPad E14 (Linux)', precio: '~550 €', nota: 'Excelente compatibilidad con Linux', icon: '💻' },
      { nombre: 'System76 Lemur Pro', precio: '~700 €', nota: 'Certificado para Linux, autonomía récord', icon: '💻' },
    ],
    media: [
      { nombre: 'Framework Laptop 13', precio: '~850 €', nota: 'Modular, reparable, ideal para Linux', icon: '💻' },
      { nombre: 'Lenovo ThinkPad X1 Carbon (Linux)', precio: '~1.100 €', nota: 'Referente de compatibilidad Linux', icon: '💻' },
    ],
    alta: [
      { nombre: 'System76 Gazelle', precio: '~1.400 €', nota: 'Vendido con Ubuntu o Pop!_OS', icon: '💻' },
      { nombre: 'Framework Laptop 16', precio: '~1.300 €', nota: 'Modular con GPU intercambiable', icon: '💻' },
    ],
    pro: [
      { nombre: 'System76 Thelio (sobremesa)', precio: '~1.800 €', nota: 'Workstation Linux de alto rendimiento', icon: '🏆' },
      { nombre: 'Lenovo ThinkStation P360 Ultra', precio: '~2.200 €', nota: 'Workstation compacta con soporte Linux', icon: '🏆' },
    ],
  },
  chromeos: {
    basica: [
      { nombre: 'Lenovo Chromebook Duet 3', precio: '~280 €', nota: 'Tablet + teclado, portátil y ligero', icon: '💻' },
      { nombre: 'HP Chromebook 14a', precio: '~320 €', nota: 'Buena pantalla, duradero', icon: '💻' },
    ],
    media: [
      { nombre: 'ASUS Chromebook Plus CX34', precio: '~480 €', nota: 'Certificado para IA, buena potencia', icon: '💻' },
      { nombre: 'Lenovo Chromebook Plus 5i', precio: '~550 €', nota: 'Excelente para Google Workspace', icon: '💻' },
    ],
    alta: [
      { nombre: 'Google Pixelbook Go', precio: '~700 €', nota: 'El Chromebook premium de referencia', icon: '💻' },
    ],
    pro: [
      { nombre: 'ASUS Chromebook Flip CX5', precio: '~900 €', nota: '2 en 1 premium con stylus incluido', icon: '🏆' },
    ],
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    categoria: 'Tu uso',
    pregunta: '¿Para qué usas principalmente el ordenador?',
    icon: '💻',
    opciones: [
      { valor: 'basico', etiqueta: 'Uso básico', desc: 'Navegar, email, redes sociales, YouTube' },
      { valor: 'ofimática', etiqueta: 'Ofimática y trabajo de oficina', desc: 'Word, Excel, videoconferencias, CRM' },
      { valor: 'creativo', etiqueta: 'Diseño, foto o vídeo', desc: 'Photoshop, Premiere, Illustrator, Lightroom' },
      { valor: 'dev', etiqueta: 'Programación o ciencia de datos', desc: 'Código, servidores, análisis, IA' },
    ],
  },
  {
    id: 2,
    categoria: 'Tu uso',
    pregunta: '¿Juegas a videojuegos en el ordenador?',
    icon: '🎮',
    opciones: [
      { valor: 'no', etiqueta: 'No juego', desc: 'El gaming no es para mí' },
      { valor: 'casual', etiqueta: 'Juegos ligeros', desc: 'Indie, estrategia, juegos poco exigentes' },
      { valor: 'medio', etiqueta: 'Juego bastante', desc: 'Títulos actuales en calidad media-alta' },
      { valor: 'alto', etiqueta: 'Gaming exigente', desc: 'AAA en máxima calidad, 1080p/1440p/4K' },
    ],
  },
  {
    id: 3,
    categoria: 'Tu movilidad',
    pregunta: '¿Necesitas llevarte el ordenador fuera de casa con frecuencia?',
    icon: '🎒',
    opciones: [
      { valor: 'siempre', etiqueta: 'Sí, a diario', desc: 'Trabajo híbrido, estudio, viajes frecuentes' },
      { valor: 'aveces', etiqueta: 'A veces', desc: 'Ocasionalmente fuera de casa' },
      { valor: 'nunca', etiqueta: 'No, siempre en casa', desc: 'Uso exclusivamente en un sitio fijo' },
    ],
  },
  {
    id: 4,
    categoria: 'Tu movilidad',
    pregunta: '¿Qué tamaño de pantalla prefieres?',
    icon: '📐',
    opciones: [
      { valor: 'pequena', etiqueta: 'Compacto (13-14")', desc: 'Ligero y fácil de llevar' },
      { valor: 'medio', etiqueta: 'Estándar (15-16")', desc: 'Equilibrio entre portabilidad y pantalla' },
      { valor: 'grande', etiqueta: 'Grande (17" o más)', desc: 'Máxima superficie de trabajo' },
      { valor: 'da_igual', etiqueta: 'Me da igual', desc: 'No es prioritario para mí' },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación',
    pregunta: '¿Tienes ya dispositivos Apple (iPhone, iPad…)?',
    icon: '🍎',
    opciones: [
      { valor: 'si_muchos', etiqueta: 'Sí, uso el ecosistema Apple', desc: 'iPhone, iPad, AirPods… todo Apple' },
      { valor: 'alguno', etiqueta: 'Alguno', desc: 'Tengo algún dispositivo Apple' },
      { valor: 'no', etiqueta: 'No, ninguno', desc: 'Uso Android o no tengo móvil Apple' },
    ],
  },
  {
    id: 6,
    categoria: 'Tu situación',
    pregunta: '¿Necesitas software específico para tu trabajo o estudios?',
    icon: '🔧',
    opciones: [
      { valor: 'windows_only', etiqueta: 'Sí, solo disponible en Windows', desc: 'AutoCAD, SolidWorks, software empresarial…' },
      { valor: 'adobe', etiqueta: 'Suite Adobe principalmente', desc: 'Photoshop, Premiere, After Effects, XD…' },
      { valor: 'google', etiqueta: 'Solo herramientas web y Google', desc: 'Docs, Sheets, Gmail, Meet…' },
      { valor: 'sin_requisitos', etiqueta: 'Sin requisitos específicos', desc: 'Cualquier plataforma me sirve' },
    ],
  },
  {
    id: 7,
    categoria: 'Tu uso',
    pregunta: '¿Cuántas horas al día usas el ordenador aproximadamente?',
    icon: '⏱️',
    opciones: [
      { valor: 'poco', etiqueta: 'Menos de 3 horas', desc: 'Uso muy moderado' },
      { valor: 'medio', etiqueta: '3 – 6 horas', desc: 'Uso normal' },
      { valor: 'mucho', etiqueta: '6 – 10 horas', desc: 'Jornada laboral completa' },
      { valor: 'extremo', etiqueta: 'Más de 10 horas', desc: 'Ordenador encendido casi todo el día' },
    ],
  },
  {
    id: 8,
    categoria: 'Tus prioridades',
    pregunta: '¿Cuánto tiempo planeas usar este ordenador?',
    icon: '📅',
    opciones: [
      { valor: 'corto', etiqueta: '2 – 3 años', desc: 'Me gusta renovar con frecuencia' },
      { valor: 'medio', etiqueta: '4 – 5 años', desc: 'Lo habitual' },
      { valor: 'largo', etiqueta: '6 años o más', desc: 'Quiero que dure lo máximo posible' },
    ],
  },
  {
    id: 9,
    categoria: 'Tu presupuesto',
    pregunta: '¿Cuál es tu presupuesto aproximado?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Hasta 600 €', desc: 'Lo esencial sin grandes pretensiones' },
      { valor: 'medio', etiqueta: '600 – 1.100 €', desc: 'Buena relación calidad-precio' },
      { valor: 'alto', etiqueta: '1.100 – 1.800 €', desc: 'Calidad premium' },
      { valor: 'premium', etiqueta: 'Más de 1.800 €', desc: 'Workstation o lo mejor disponible' },
    ],
  },
  {
    id: 10,
    categoria: 'Tu presupuesto',
    pregunta: '¿Considerarías comprar un ordenador reacondicionado certificado?',
    icon: '♻️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, con garantía', desc: 'Si tiene garantía y buen estado, perfecto' },
      { valor: 'quizas', etiqueta: 'Dependería de la oferta', desc: 'Solo si es una muy buena oportunidad' },
      { valor: 'no', etiqueta: 'Prefiero nuevo siempre', desc: 'No me interesa la segunda mano' },
    ],
  },
];

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

function calcularResultado(r: Record<number, string>): Resultado {
  let puntosPortatil = 0;
  let puntosSobremesa = 0;
  let puntosDosEnUno = 0;
  let puntosMiniPC = 0;
  let puntosMac = 0;
  let puntosLinux = 0;
  let puntosChrome = 0;
  let puntosGamaAlta = 0;
  const razones: string[] = [];
  const consejos: string[] = [];

  // Formato
  if (r[3] === 'siempre') { puntosPortatil += 4; puntosDosEnUno += 2; }
  if (r[3] === 'aveces') { puntosPortatil += 2; }
  if (r[3] === 'nunca') { puntosSobremesa += 3; puntosMiniPC += 2; }
  if (r[4] === 'grande') { puntosSobremesa += 2; }
  if (r[4] === 'pequena') { puntosPortatil += 1; puntosDosEnUno += 1; }
  if (r[1] === 'creativo') { puntosDosEnUno += 1; }

  // OS
  if (r[5] === 'si_muchos') { puntosMac += 3; }
  if (r[5] === 'alguno') { puntosMac += 1; }
  if (r[6] === 'windows_only') { puntosMac -= 3; puntosLinux -= 2; puntosChrome -= 4; }
  if (r[6] === 'adobe') { puntosMac += 2; }
  if (r[6] === 'google') { puntosChrome += 3; }
  if (r[1] === 'dev') { puntosLinux += 2; puntosMac += 1; }
  if (r[1] === 'basico') { puntosChrome += 2; }

  // Gama
  if (r[1] === 'creativo') { puntosGamaAlta += 3; }
  if (r[1] === 'dev') { puntosGamaAlta += 2; }
  if (r[2] === 'alto') { puntosGamaAlta += 3; }
  if (r[2] === 'medio') { puntosGamaAlta += 1; }
  if (r[7] === 'extremo' || r[7] === 'mucho') { puntosGamaAlta += 2; }
  if (r[8] === 'largo') { puntosGamaAlta += 2; }
  if (r[9] === 'alto') { puntosGamaAlta += 2; }
  if (r[9] === 'premium') { puntosGamaAlta += 4; }
  if (r[9] === 'bajo') { puntosGamaAlta -= 3; }

  // Determinar formato
  const fScores: [FormatoKey, number][] = [
    ['portatil', puntosPortatil],
    ['sobremesa', puntosSobremesa],
    ['dos-en-uno', puntosDosEnUno],
    ['mini-pc', puntosMiniPC],
  ];
  fScores.sort((a, b) => b[1] - a[1]);
  const formato = fScores[0][0];

  // Determinar OS
  let os: OSKey = 'windows';
  if (puntosMac >= 3 && r[6] !== 'windows_only') os = 'mac';
  else if (puntosLinux >= 3 && r[6] === 'sin_requisitos') os = 'linux';
  else if (puntosChrome >= 3 && r[1] === 'basico') os = 'chromeos';
  if (r[9] === 'bajo' && os === 'mac') os = 'windows'; // Mac no es viable con presupuesto bajo

  // Determinar gama
  let gama: GamaKey;
  if (puntosGamaAlta >= 7) gama = 'pro';
  else if (puntosGamaAlta >= 4) gama = 'alta';
  else if (puntosGamaAlta >= 1) gama = 'media';
  else gama = 'basica';
  if (r[9] === 'bajo') gama = 'basica';
  if (r[9] === 'premium' && gama !== 'pro') gama = 'pro';

  // Razones
  if (formato === 'sobremesa') {
    razones.push('Trabajar siempre en el mismo sitio hace que un sobremesa + monitor sea la opción más rentable: más potencia por el mismo precio.');
  } else if (formato === 'portatil') {
    razones.push('Tu necesidad de movilidad hace del portátil la opción natural. Puedes complementarlo con una pantalla externa en casa.');
  } else if (formato === 'dos-en-uno') {
    razones.push('Un 2 en 1 con pantalla táctil y stylus te da la flexibilidad de portátil y tablet en un solo dispositivo.');
  } else {
    razones.push('Un mini PC con monitor dedicado te da rendimiento de sobremesa con un perfil muy compacto y silencioso.');
  }

  if (os === 'mac') {
    razones.push('Con tu ecosistema Apple ya establecido, un Mac se integra de forma nativa: Handoff, AirDrop, iMessage y Continuity funcionan sin configuración.');
    razones.push('El chip Apple Silicon (M3, M4) ofrece la mejor autonomía y rendimiento por vatio del mercado en 2025.');
  } else if (os === 'linux') {
    razones.push('Para programación y servidores, Linux es el entorno nativo: bash, Docker, WSL y herramientas de desarrollo funcionan mejor que en otros sistemas.');
  } else if (os === 'chromeos') {
    razones.push('Para un uso centrado en la web y Google Workspace, ChromeOS es más ligero, seguro y fácil de mantener que Windows.');
  } else {
    razones.push('Windows sigue siendo el sistema con mayor compatibilidad de software, especialmente para herramientas empresariales y gaming.');
  }

  if (gama === 'pro' || gama === 'alta') {
    razones.push('Tu uso intensivo o creativo justifica invertir en un procesador potente que no limitará tu trabajo durante años.');
  }

  // Consejos
  if (r[10] === 'si' || r[10] === 'quizas') {
    consejos.push('💡 Un portátil reacondicionado certificado (Amazon Renewed, Back Market, tiendas oficiales Apple) puede ahorrarte un 25-40% con garantía de 12 meses.');
  }
  if (r[8] === 'largo') {
    consejos.push('📅 Si buscas durabilidad, prioriza marcas con buen soporte técnico: Lenovo ThinkPad, Dell XPS y Apple tienen reputación de 5-7 años de vida útil.');
  }
  if (r[3] === 'siempre') {
    consejos.push('🔋 Para uso diario fuera de casa, comprueba la autonomía real (no la especificada): busca reseñas con prueba de batería en uso real.');
  }
  if (formato === 'sobremesa' || formato === 'mini-pc') {
    consejos.push('🖥️ Invierte en un buen monitor: pasarás más horas mirándolo que al propio ordenador. Un panel IPS o OLED de 24-27" mejora mucho la experiencia.');
  }
  consejos.push('🛒 Los mejores momentos para comprar: septiembre (vuelta al cole), Black Friday y Amazon Prime Day. Para Apple, justo después de que anuncien nuevos modelos.');

  const modelos = MODELOS[os][gama];

  return { formato, os, gama, razones, consejos, modelos };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorPortatil() {
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
          <h1 className={styles.heroTitle}><span aria-hidden="true">💻</span> Asesor de Portátil, Laptop o Notebook</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro'
              ? '10 preguntas para saber qué computadora te conviene de verdad: portátil (laptop), sobremesa, Mac o Windows'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu ordenador ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu perfil y uso</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="technical" severity="medium" />

      {/* ── INTRO ── */}
      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>💻</span>
              <span className={styles.introIcon}>🍎</span>
              <span className={styles.introIcon}>🪟</span>
              <span className={styles.introIcon}>🐧</span>
            </div>
            <h2 className={styles.introTitulo}>¿Portátil (laptop), sobremesa, Mac o Windows?</h2>
            <p className={styles.introDesc}>
              El mercado de computadoras tiene más opciones que nunca: chips Apple Silicon, portátiles (laptops y
              notebooks) ultraligeros, mini PCs, 2 en 1 táctiles… y una brecha enorme entre la oferta de entrada y la
              gama pro. Este test te orienta hacia el formato, sistema operativo y gama que mejor encajan con tu uso real.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Formato recomendado (portátil, sobremesa, 2 en 1…)</li>
              <li><span aria-hidden="true">✅</span> Sistema operativo según tu perfil</li>
              <li><span aria-hidden="true">✅</span> Gama con precio orientativo</li>
              <li><span aria-hidden="true">✅</span> Modelos de referencia concretos</li>
              <li><span aria-hidden="true">✅</span> Consejos de compra personalizados</li>
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

          {/* 3 tarjetas de recomendación */}
          <div className={styles.recomendacionGrid}>
            <div className={styles.recomendacionCard}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{FORMATOS[resultado.formato].icon}</span>
              <p className={styles.recomendacionLabel}>Formato</p>
              <p className={styles.recomendacionValor}>{FORMATOS[resultado.formato].nombre}</p>
              <p className={styles.recomendacionDesc}>{FORMATOS[resultado.formato].descripcion}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardOS}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{OS_INFO[resultado.os].icon}</span>
              <p className={styles.recomendacionLabel}>Sistema operativo</p>
              <p className={styles.recomendacionValor}>{OS_INFO[resultado.os].nombre}</p>
              <p className={styles.recomendacionDesc}>{OS_INFO[resultado.os].descripcion}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardGama}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{GAMAS[resultado.gama].icon}</span>
              <p className={styles.recomendacionLabel}>Gama</p>
              <p className={styles.recomendacionValor}>{GAMAS[resultado.gama].nombre}</p>
              <p className={styles.recomendacionDesc}>
                {GAMAS[resultado.gama].descripcion}
                <br /><strong>{GAMAS[resultado.gama].precioOrientativo}</strong>
              </p>
            </div>
          </div>

          {/* Razones */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => (
              <p key={i} className={styles.razonItem}>{r}</p>
            ))}
          </div>

          {/* Modelos */}
          <div className={styles.modelosSection}>
            <p className={styles.modelosTitulo}>
              Modelos de referencia — {OS_INFO[resultado.os].nombre} · {GAMAS[resultado.gama].nombre}
            </p>
            <p className={styles.modelosNota}>Orientativo. Los precios varían según tienda y configuración.</p>
            <div className={styles.modelosGrid}>
              {resultado.modelos.map((m, i) => (
                <div key={i} className={styles.modeloItem}>
                  <span className={styles.modeloIcon} aria-hidden="true">{m.icon}</span>
                  <div className={styles.modeloInfo}>
                    <p className={styles.modeloNombre}>{m.nombre} · {m.precio}</p>
                    <p className={styles.modeloDesc}>{m.nota}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de comprar</p>
            {resultado.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>{c}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          <EducationalSection
            title="Guía completa: cómo elegir ordenador en 2025"
            subtitle="Formato, OS, gama, qué especificaciones importan y cuándo comprar"
            defaultOpen={false}
          >
            <h3>Portátil (laptop o notebook) vs sobremesa: la primera decisión</h3>
            <p>
              Un <strong>portátil</strong> —conocido como <strong>laptop</strong> o <strong>notebook</strong> en
              gran parte de Latinoamérica— es la elección correcta si te mueves con frecuencia, estudias o trabajas en
              distintos lugares. A igual precio, un sobremesa (computadora de escritorio) ofrece más rendimiento, mejor
              ergonomía y es más fácil de actualizar. Si siempre trabajas en casa u oficina, el sobremesa + monitor
              externo es más rentable.
            </p>
            <p>
              Los <strong>2 en 1</strong> (bisagra 360° con pantalla táctil) son ideales para estudiantes que toman
              notas a mano o creativos que usan stylus. No son los más potentes por euro, pero ofrecen versatilidad real.
              Los <strong>mini PC</strong> son una opción emergente: muy compactos, silenciosos y con buen rendimiento a
              precios razonables (Beelink, Intel NUC, Mac mini).
            </p>

            <h3>Windows, macOS, Linux o ChromeOS</h3>
            <p>
              <strong>Windows</strong> tiene la mayor compatibilidad de software: es obligatorio si usas AutoCAD, SolidWorks,
              software de empresa o quieres gaming serio. La variedad de modelos y precios es enorme.
            </p>
            <p>
              <strong>macOS</strong> es la mejor opción si ya usas iPhone y quieres integración perfecta (AirDrop, iMessage,
              Continuity Camera). El chip Apple Silicon (M3, M4) es excepcionalmente eficiente: mejor autonomía y
              rendimiento por vatio que cualquier chip Intel/AMD equivalente. La Suite Adobe, Final Cut Pro y Logic Pro
              funcionan mejor que en cualquier otra plataforma.
            </p>
            <p>
              <strong>Linux</strong> es la opción de los desarrolladores y administradores de sistemas. Máxima
              personalización, excelente para programación, servidores y ciencia de datos. Requiere cierta curva de
              aprendizaje y algunos programas populares no tienen versión nativa.
            </p>
            <p>
              <strong>ChromeOS</strong> es ligero, seguro y perfecto para tareas en la nube y Google Workspace.
              Ideal para perfiles básicos, estudiantes de educación y entornos corporativos con Google.
            </p>

            <h3>Qué especificaciones importan de verdad</h3>
            <ul>
              <li><strong>Procesador (CPU):</strong> para ofimática, cualquier Intel Core i5/Ryzen 5 actual es suficiente. Para edición de vídeo o IA, busca i7/Ryzen 7 o el M3 Pro/M4 Pro de Apple.</li>
              <li><strong>RAM:</strong> 8 GB es el mínimo para 2025. Con 16 GB irás cómodo para multitarea. 32 GB si editas vídeo o usas máquinas virtuales.</li>
              <li><strong>Almacenamiento:</strong> SSD NVMe obligatorio. 256 GB es justo; 512 GB es lo recomendable; 1 TB si guardas muchos archivos localmente.</li>
              <li><strong>Pantalla:</strong> resolución mínima Full HD (1920×1080). Un panel IPS da mejores colores que TN. OLED es excelente para creativos pero más caro y con riesgo de burn-in.</li>
              <li><strong>Batería:</strong> los fabricantes mienten. Busca reseñas con prueba de batería real en Notebookcheck o YouTube.</li>
            </ul>
            <div className={styles.warningBox}>
              <strong>Truco de compra:</strong> la generación del procesador importa más que el número de serie.
              Un Intel Core Ultra 5 (13ª-14ª gen) supera claramente a un Core i7 de 10ª generación. Comprueba siempre
              el año del chip, no solo el modelo.
            </div>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-portatil')} />
      <ShareCard appName="selector-portatil" />
      <Footer appName="selector-portatil" />
    </div>
  );
}
