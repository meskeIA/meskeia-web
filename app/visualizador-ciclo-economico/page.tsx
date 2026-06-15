'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './VisualizadorCicloEconomico.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type FaseId = 'expansion' | 'pico' | 'recesion' | 'valle';
type CurvaEstado = 'normal' | 'plana' | 'invertida';
type TipoIndicador = 'leading' | 'coincident' | 'lagging';
type FiltroRegion = 'espana' | 'eurozona';

interface Fase {
  id: FaseId;
  nombre: string;
  icono: string;
  color: string;
  duracionMedia: string;
  pib: string;
  empleo: string;
  inflacion: string;
  descripcion: string;
  ejemploEspana: string;
  ejemploGlobal: string;
}

interface Indicador {
  id: string;
  nombre: string;
  tipo: TipoIndicador;
  icono: string;
  descripcion: string;
  porQue: string;
  datoEspana: string;
  datoEurozona: string;
}

interface PreguntaSimulador {
  id: number;
  pregunta: string;
  descripcion: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos estáticos
// ─────────────────────────────────────────────────────────────────────────────

const FASES: Fase[] = [
  {
    id: 'expansion',
    nombre: 'Expansión',
    icono: '📈',
    color: '#22c55e',
    duracionMedia: '~5 años de media (ciclo largo)',
    pib: 'Crecimiento positivo, >2% anual',
    empleo: 'Creación de empleo, paro en caída',
    inflacion: 'Inflación moderada, tendencia al alza',
    descripcion:
      'La economía crece con fuerza. Las empresas contratan, el crédito fluye, el consumo sube. La confianza es elevada y las inversiones se multiplican. Es la fase más larga del ciclo.',
    ejemploEspana: 'España 2014–2019: creación de 2,5 millones de empleos, PIB +3% anual, boom turístico.',
    ejemploGlobal: 'EEUU 2009–2020: expansión más larga de la historia (128 meses), impulsada por tecnología.',
  },
  {
    id: 'pico',
    nombre: 'Pico',
    icono: '⛰️',
    color: '#eab308',
    duracionMedia: 'Punto de inflexión (semanas/meses)',
    pib: 'Máximo del ciclo, crecimiento se ralentiza',
    empleo: 'Pleno empleo, escasez de mano de obra',
    inflacion: 'Inflación alta, bancos centrales suben tipos',
    descripcion:
      'La economía está en su punto máximo. Pleno empleo, precios al alza, tipos de interés subiendo. Los desequilibrios acumulados (deuda, burbujas) comienzan a ser evidentes. El ciclo está a punto de girar.',
    ejemploEspana: 'España finales 2007: construcción en máximos, paro al 8%, precios inmobiliarios record.',
    ejemploGlobal: 'EEUU Q4 2019: desempleo al 3,5% (50 años de mínimo), mercados en máximos históricos.',
  },
  {
    id: 'recesion',
    nombre: 'Recesión',
    icono: '📉',
    color: '#ef4444',
    duracionMedia: '~1 año de media (puede ser más intensa)',
    pib: 'PIB negativo 2+ trimestres consecutivos',
    empleo: 'Destrucción de empleo, paro en alza',
    inflacion: 'Inflación cae (o deflación), tipos bajan',
    descripcion:
      'La economía se contrae. El consumo y la inversión caen, el desempleo sube y el crédito se restringe. Técnicamente: dos trimestres consecutivos de PIB negativo. Puede ser suave o una gran crisis.',
    ejemploEspana:
      'Crisis 2008–2009: PIB −3,8%, destrucción de 1,8M empleos. COVID 2020: PIB −10,8% en un solo año.',
    ejemploGlobal: 'Gran Recesión 2008: crisis bancaria global, PIB EEUU −4,3%, desempleo al 10%.',
  },
  {
    id: 'valle',
    nombre: 'Valle / Recuperación',
    icono: '🌱',
    color: '#3b82f6',
    duracionMedia: 'Variable: 6 meses a 2 años',
    pib: 'PIB toca fondo, primeros síntomas de rebote',
    empleo: 'Paro en máximos, pero empieza a estabilizarse',
    inflacion: 'Inflación muy baja, tipos en mínimos',
    descripcion:
      'La economía toca fondo y comienza a recuperarse. El banco central ha bajado tipos al mínimo para estimular. Los estímulos fiscales y monetarios hacen efecto. La confianza vuelve gradualmente.',
    ejemploEspana:
      'España 2013: PIB dejó de caer, paro en 26% (máximo). Inicio de la recuperación 2014 con reformas y QE del BCE.',
    ejemploGlobal: 'EEUU 2009: la Fed compró activos (QE) y bajó tipos al 0%. La bolsa tocó fondo en marzo 2009.',
  },
];

const INDICADORES: Indicador[] = [
  // LEADING
  {
    id: 'pmi',
    nombre: 'PMI Manufacturero',
    tipo: 'leading',
    icono: '🏭',
    descripcion:
      'Índice de directores de compras. Mide si las empresas esperan más o menos pedidos. Más de 50 = expansión.',
    porQue:
      'Es leading porque las empresas ajustan sus planes de producción antes de que los datos oficiales de PIB reflejen el cambio. Un PMI que cae por debajo de 50 suele anticipar en 3-6 meses una desaceleración.',
    datoEspana: 'PMI industria España (abr. 2024): 51,4 (expansión)',
    datoEurozona: 'PMI industria Eurozona (abr. 2024): 45,7 (contracción)',
  },
  {
    id: 'permisos',
    nombre: 'Permisos de Construcción',
    tipo: 'leading',
    icono: '🏗️',
    descripcion:
      'Número de permisos concedidos para nuevas obras. Indica la confianza de promotores en la demanda futura.',
    porQue:
      'La construcción es una de las primeras actividades en acelerar cuando la economía mejora y en frenar cuando empeora. Un desplome de permisos anticipó la crisis inmobiliaria española de 2008 con 1-2 años de antelación.',
    datoEspana: 'Permisos vivienda España 2023: 109.000 (+12% vs 2022)',
    datoEurozona: 'Producción construcción Eurozona (feb. 2024): −1,8% interanual',
  },
  {
    id: 'confianza',
    nombre: 'Confianza del Consumidor',
    tipo: 'leading',
    icono: '😊',
    descripcion:
      'Encuesta sobre expectativas de la economía y situación personal. El consumidor gasta antes si se siente optimista.',
    porQue:
      'El consumo privado es ~55% del PIB en España. Cuando la confianza cae, el gasto cae antes de que el PIB lo refleje. Es un predictor de comportamiento futuro, no de actividad presente.',
    datoEspana: 'Índice de Confianza Consumidor España (abr. 2024): −7,5',
    datoEurozona: 'Confianza consumidor Eurozona (abr. 2024): −14,7',
  },
  {
    id: 'bolsa',
    nombre: 'Bolsa de Valores',
    tipo: 'leading',
    icono: '📊',
    descripcion:
      'Los mercados descuentan en el precio las expectativas de beneficios futuros. Anticipan cambios en la economía real.',
    porQue:
      'Históricamente, la bolsa cae 6-12 meses antes de que una recesión sea oficial. Los inversores reaccionan a señales anticipadas: PMI, confianza, curva de rendimientos. Però tiene "falsos positivos": ha predicho 9 de las últimas 5 recesiones.',
    datoEspana: 'IBEX 35 (abr. 2024): ~10.850 puntos (+7% en el año)',
    datoEurozona: 'Eurostoxx 50 (abr. 2024): ~5.000 puntos (+12% en el año)',
  },
  {
    id: 'yieldcurve',
    nombre: 'Curva de Rendimientos',
    tipo: 'leading',
    icono: '📐',
    descripcion:
      'La diferencia entre los tipos de bonos a 10 años y a 2 años. Si se invierte (2 años > 10 años), señal de alerta.',
    porQue:
      'Cuando los inversores exigen más rentabilidad a corto que a largo plazo, anticipan que los tipos bajarán (porque vendrá una recesión). Todas las recesiones de EEUU desde 1970 fueron precedidas por inversión de la curva 2a-10a.',
    datoEspana: 'Diferencial Bono España 10a - 2a (abr. 2024): +0,35% (positivo)',
    datoEurozona: 'Diferencial Bund Alemania 10a - 2a (abr. 2024): +0,12% (casi plana)',
  },
  // COINCIDENT
  {
    id: 'pib',
    nombre: 'PIB Trimestral',
    tipo: 'coincident',
    icono: '🗺️',
    descripcion:
      'Producto Interior Bruto: suma de todos los bienes y servicios producidos en un país. El indicador económico más completo.',
    porQue:
      'Es coincident porque mide lo que ocurre en el trimestre actual (con 1-2 meses de retraso en su publicación). No predice: confirma. Dos trimestres de PIB negativo = recesión técnica oficial.',
    datoEspana: 'PIB España Q1 2024: +0,7% trimestral (+2,4% interanual)',
    datoEurozona: 'PIB Eurozona Q1 2024: +0,3% trimestral (+0,4% interanual)',
  },
  {
    id: 'produccion',
    nombre: 'Producción Industrial',
    tipo: 'coincident',
    icono: '⚙️',
    descripcion:
      'Volumen de producción de fábricas y plantas industriales. Refleja la actividad manufacturera en tiempo casi real.',
    porQue:
      'La producción industrial se mueve a la par con el ciclo económico. Sube cuando la demanda crece y cae cuando la economía se contrae. Es más rápido de publicar que el PIB (mensual vs trimestral).',
    datoEspana: 'Producción industrial España (feb. 2024): +1,1% interanual',
    datoEurozona: 'Producción industrial Eurozona (feb. 2024): −6,4% interanual',
  },
  {
    id: 'ventas',
    nombre: 'Ventas al por Menor',
    tipo: 'coincident',
    icono: '🛒',
    descripcion:
      'Volumen de ventas en comercio minorista. Mide el consumo de los hogares en tiempo casi real.',
    porQue:
      'El consumo privado es la parte más estable del PIB pero también la que mejor refleja la confianza actual. Las ventas caen cuando el empleo y los salarios flaquean, confirmando la fase del ciclo.',
    datoEspana: 'Ventas comercio minorista España (feb. 2024): +1,8% interanual',
    datoEurozona: 'Ventas al por menor Eurozona (feb. 2024): −0,5% interanual',
  },
  {
    id: 'empleo-coincident',
    nombre: 'Empleo y Afiliaciones',
    tipo: 'coincident',
    icono: '👷',
    descripcion:
      'Número de afiliados a la Seguridad Social y variación mensual del empleo. Dato más inmediato del mercado laboral.',
    porQue:
      'Las afiliaciones suben cuando la economía crece y bajan al inicio de una recesión. Es coincident porque las empresas contratan o despiden al ritmo de la economía actual, sin mucho lag.',
    datoEspana: 'Afiliados SS España (abr. 2024): 21,2 millones (+3,1% interanual)',
    datoEurozona: 'Empleo Eurozona Q4 2023: +0,3% trimestral',
  },
  // LAGGING
  {
    id: 'paro',
    nombre: 'Tasa de Desempleo',
    tipo: 'lagging',
    icono: '👥',
    descripcion:
      'Porcentaje de población activa que busca trabajo pero no lo encuentra. Dato mensual de la EPA o Eurostat.',
    porQue:
      'El paro es el indicador más rezagado: las empresas despiden tarde (cuando ya es inevitable) y contratan tarde (cuando la recuperación es sólida). El paro puede seguir subiendo meses después de que la economía haya tocado fondo.',
    datoEspana: 'Tasa paro España Q1 2024: 12,3% (EPA)',
    datoEurozona: 'Tasa paro Eurozona (feb. 2024): 6,5% (mínimo histórico)',
  },
  {
    id: 'credito',
    nombre: 'Crédito Bancario',
    tipo: 'lagging',
    icono: '🏦',
    descripcion:
      'Volumen de préstamos concedidos por el sistema bancario a hogares y empresas. Refleja el acceso al crédito.',
    porQue:
      'Los bancos endurecen las condiciones de crédito durante la recesión (cuando el riesgo ya es evidente) y los relajan cuando la recuperación está avanzada. El crédito sigue al ciclo, no lo lidera.',
    datoEspana: 'Crédito al sector privado España: −3,5% interanual (2024)',
    datoEurozona: 'Crédito hogares Eurozona (feb. 2024): +0,2% interanual',
  },
  {
    id: 'deuda',
    nombre: 'Deuda Empresarial',
    tipo: 'lagging',
    icono: '📋',
    descripcion:
      'Nivel de endeudamiento de las empresas. Sube durante la expansión (crédito fácil) y tarda en desaparecer.',
    porQue:
      'Las empresas se endeudan al final de la expansión (confianza alta) y tardan años en desapalancar. La deuda corporativa alta confirma que estamos en recesión, pero no la predice.',
    datoEspana: 'Deuda empresas no financieras / PIB España: 74% (2023)',
    datoEurozona: 'Deuda sector privado / PIB Eurozona: 156% (2023)',
  },
  {
    id: 'tipos-lagging',
    nombre: 'Tipos de Interés Oficiales',
    tipo: 'lagging',
    icono: '🏛️',
    descripcion:
      'Los tipos que fija el banco central (BCE, Fed). Suben para frenar la inflación y bajan para estimular la economía.',
    porQue:
      'Los bancos centrales actúan después de ver datos confirmados de inflación o recesión. En 2022, el BCE tardó meses en subir tipos pese a que la inflación llevaba trimestres disparada. La política monetaria es lagging por diseño.',
    datoEspana: 'Tipo refinanciación BCE (abr. 2024): 4,50% (iniciando bajadas)',
    datoEurozona: 'Fed Funds rate (abr. 2024): 5,25-5,50% (tipos máximos desde 2001)',
  },
];

const PREGUNTAS_SIMULADOR: PreguntaSimulador[] = [
  {
    id: 1,
    pregunta: '¿El PIB creció en los últimos 2 trimestres?',
    descripcion: 'Mira los datos del INE o Eurostat para los dos últimos trimestres publicados.',
  },
  {
    id: 2,
    pregunta: '¿La tasa de paro está bajando?',
    descripcion: 'Compara el último dato de paro con el de hace 6 meses.',
  },
  {
    id: 3,
    pregunta: '¿La inflación está por encima del 3%?',
    descripcion: 'Comprueba el IPC general (no subyacente) del último mes publicado.',
  },
  {
    id: 4,
    pregunta: '¿Los tipos de interés del BCE están subiendo?',
    descripcion: 'El BCE comunica sus decisiones en sus reuniones de política monetaria.',
  },
  {
    id: 5,
    pregunta: '¿El PMI manufacturero está por encima de 50?',
    descripcion: 'S&P Global publica el PMI mensualmente. Más de 50 = expansión.',
  },
  {
    id: 6,
    pregunta: '¿La curva de rendimientos (2a-10a) está invertida?',
    descripcion: 'Compara el bono a 10 años con el de 2 años de Alemania o España.',
  },
];

// Datos de la yield curve para cada estado
const YIELD_CURVE_DATA: Record<CurvaEstado, number[]> = {
  normal: [2.0, 2.8, 3.2, 3.6, 3.9, 4.2],
  plana: [3.4, 3.5, 3.5, 3.5, 3.5, 3.5],
  invertida: [5.0, 4.5, 4.0, 3.7, 3.5, 3.3],
};

const YIELD_LABELS = ['3m', '1a', '2a', '5a', '10a', '30a'];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: SVG ciclo económico
// ─────────────────────────────────────────────────────────────────────────────

const SVG_W = 700;
const SVG_H = 220;
const PADDING = 40;

function generarPuntosSinusoide(): { x: number; y: number }[] {
  const puntos: { x: number; y: number }[] = [];
  const n = 200;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = PADDING + t * (SVG_W - 2 * PADDING);
    // Sinusoide: 1,25 ciclos para mostrar todas las fases de forma clara
    const y = SVG_H / 2 - Math.sin(t * Math.PI * 2.5) * 70;
    puntos.push({ x, y });
  }
  return puntos;
}

function puntosAPath(puntos: { x: number; y: number }[]): string {
  return puntos.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
}

function interpolarPunto(t: number): { x: number; y: number } {
  const x = PADDING + t * (SVG_W - 2 * PADDING);
  const y = SVG_H / 2 - Math.sin(t * Math.PI * 2.5) * 70;
  return { x, y };
}

// Zonas por fase (rangos en t: 0-1)
const ZONAS_FASE: Record<FaseId, { inicio: number; fin: number }> = {
  expansion: { inicio: 0, fin: 0.35 },
  pico: { inicio: 0.35, fin: 0.5 },
  recesion: { inicio: 0.5, fin: 0.75 },
  valle: { inicio: 0.75, fin: 1.0 },
};

function faseDesdeT(t: number): FaseId {
  if (t < 0.35) return 'expansion';
  if (t < 0.5) return 'pico';
  if (t < 0.75) return 'recesion';
  return 'valle';
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: yield curve SVG
// ─────────────────────────────────────────────────────────────────────────────

const YC_W = 500;
const YC_H = 200;
const YC_PAD_L = 55;
const YC_PAD_B = 35;
const YC_PAD_T = 20;
const YC_PAD_R = 20;

function yieldCurvePath(datos: number[]): string {
  const minY = 0;
  const maxY = 6;
  const n = datos.length;
  return datos.reduce((acc, v, i) => {
    const x = YC_PAD_L + (i / (n - 1)) * (YC_W - YC_PAD_L - YC_PAD_R);
    const y = YC_PAD_T + (1 - (v - minY) / (maxY - minY)) * (YC_H - YC_PAD_T - YC_PAD_B);
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: simulador
// ─────────────────────────────────────────────────────────────────────────────

type RespuestaSimulador = 'si' | 'no' | null;

function interpretarRespuestas(respuestas: RespuestaSimulador[]): {
  fase: string;
  icono: string;
  descripcion: string;
  siguiente: string;
} | null {
  const [pibCrecio, paroBaja, inflacionAlta, tiposSuben, pmiAlto, curvaInvertida] = respuestas;
  if (respuestas.some((r) => r === null)) return null;

  const puntos = {
    expansion: 0,
    pico: 0,
    recesion: 0,
    valle: 0,
  };

  if (pibCrecio === 'si') { puntos.expansion += 2; puntos.pico += 1; }
  if (pibCrecio === 'no') { puntos.recesion += 2; puntos.valle += 1; }
  if (paroBaja === 'si') { puntos.expansion += 2; puntos.pico += 1; }
  if (paroBaja === 'no') { puntos.recesion += 1; puntos.valle += 1; }
  if (inflacionAlta === 'si') { puntos.pico += 2; puntos.recesion += 1; }
  if (inflacionAlta === 'no') { puntos.expansion += 1; puntos.valle += 2; }
  if (tiposSuben === 'si') { puntos.pico += 2; }
  if (tiposSuben === 'no') { puntos.expansion += 1; puntos.valle += 2; }
  if (pmiAlto === 'si') { puntos.expansion += 2; }
  if (pmiAlto === 'no') { puntos.recesion += 2; puntos.valle += 1; }
  if (curvaInvertida === 'si') { puntos.recesion += 3; puntos.pico += 1; }
  if (curvaInvertida === 'no') { puntos.expansion += 1; puntos.valle += 1; }

  const entries = Object.entries(puntos) as [FaseId, number][];
  const mejor = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const faseId = mejor[0];
  const fase = FASES.find((f) => f.id === faseId);
  if (!fase) return null;

  const siguientes: Record<FaseId, string> = {
    expansion: 'Lo más probable es que la economía esté avanzando hacia el pico del ciclo. La inflación podría subir y los bancos centrales podrían endurecer la política monetaria.',
    pico: 'La economía está cerca del máximo. Las señales de desaceleración son posibles: inflación alta, tipos al alza. Una recesión puede estar próxima en 6-18 meses.',
    recesion: 'La economía se está contrayendo. Los bancos centrales suelen bajar tipos para estimular. Si los estímulos funcionan, el valle y la recuperación pueden llegar en 6-12 meses.',
    valle: 'La economía está tocando fondo o iniciando la recuperación. Los tipos están bajos, el crédito empieza a fluir. La fase de expansión puede comenzar a consolidarse.',
  };

  return {
    fase: fase.nombre,
    icono: fase.icono,
    descripcion: fase.descripcion,
    siguiente: siguientes[faseId],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function VisualizadorCicloEconomicoPage() {
  // Sección 1: ciclo
  const [faseActiva, setFaseActiva] = useState<FaseId>('expansion');
  const [animando, setAnimando] = useState(true);
  const [tAnim, setTAnim] = useState(0);
  const animRef = useRef<number | null>(null);
  const tRef = useRef(0);

  // Sección 2: indicadores
  const [indicadorActivo, setIndicadorActivo] = useState<string | null>(null);
  const [filtroRegion, setFiltroRegion] = useState<FiltroRegion>('espana');

  // Sección 3: yield curve
  const [curvaEstado, setCurvaEstado] = useState<CurvaEstado>('normal');

  // Sección 4: simulador
  const [respuestas, setRespuestas] = useState<RespuestaSimulador[]>(Array(6).fill(null));

  const puntosSinusoide = generarPuntosSinusoide();
  const pathCiclo = puntosAPath(puntosSinusoide);
  const puntoAnimado = interpolarPunto(tAnim);

  // Animación del punto
  useEffect(() => {
    if (!animando) {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      return;
    }
    const velocidad = 0.0008;
    const tick = () => {
      tRef.current = (tRef.current + velocidad) % 1;
      setTAnim(tRef.current);
      setFaseActiva(faseDesdeT(tRef.current));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [animando]);

  const handleFaseClick = useCallback((faseId: FaseId) => {
    setAnimando(false);
    setFaseActiva(faseId);
    // Posicionar el punto en el centro de la zona
    const zona = ZONAS_FASE[faseId];
    const tCentro = (zona.inicio + zona.fin) / 2;
    tRef.current = tCentro;
    setTAnim(tCentro);
  }, []);

  const faseData = FASES.find((f) => f.id === faseActiva) ?? FASES[0];
  const indicadorData = INDICADORES.find((i) => i.id === indicadorActivo);

  const indicadoresPorTipo = (tipo: TipoIndicador) =>
    INDICADORES.filter((i) => i.tipo === tipo);

  const curvaActual = YIELD_CURVE_DATA[curvaEstado];
  const pathYieldCurve = yieldCurvePath(curvaActual);

  const handleRespuesta = (idx: number, valor: 'si' | 'no') => {
    setRespuestas((prev) => {
      const nuevo = [...prev];
      nuevo[idx] = prev[idx] === valor ? null : valor;
      return nuevo;
    });
  };

  const resultadoSimulador = interpretarRespuestas(respuestas);

  const coloresCurva: Record<CurvaEstado, string> = {
    normal: '#22c55e',
    plana: '#eab308',
    invertida: '#ef4444',
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* ── Hero ── */}
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>📊 Economía Visual</div>
            <h1 className={styles.heroTitle}>Ciclo Económico</h1>
            <p className={styles.heroSubtitle}>
              Expansión, pico, recesión y recuperación — indicadores leading/lagging y la curva de rendimientos como predictor de recesión
            </p>
          </div>
        </header>

        <LegalNotice />

        {/* ── SECCIÓN 1: Las 4 fases del ciclo ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔄</span>
            <div>
              <h2 className={styles.sectionTitle}>Las 4 fases del ciclo económico</h2>
              <p className={styles.sectionSubtitle}>
                Haz clic en una fase o en la curva para explorar sus características
              </p>
            </div>
          </div>

          {/* SVG animado */}
          <div className={styles.cicloSvgWrapper}>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className={styles.cicloSvg}
              role="img"
              aria-label="Curva sinusoidal del ciclo económico con las cuatro fases"
            >
              {/* Línea base */}
              <line
                x1={PADDING}
                y1={SVG_H / 2}
                x2={SVG_W - PADDING}
                y2={SVG_H / 2}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Etiquetas del eje */}
              <text x={PADDING} y={SVG_H / 2 - 78} fontSize="10" fill="#9ca3af" textAnchor="middle">Pico</text>
              <text x={PADDING} y={SVG_H / 2 + 88} fontSize="10" fill="#9ca3af" textAnchor="middle">Valle</text>

              {/* Curva del ciclo */}
              <path
                d={pathCiclo}
                fill="none"
                stroke="#2E86AB"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Zonas de color */}
              {(Object.entries(ZONAS_FASE) as [FaseId, { inicio: number; fin: number }][]).map(([faseId, zona]) => {
                const fase = FASES.find((f) => f.id === faseId);
                if (!fase) return null;
                const ptsZona = puntosSinusoide.filter(
                  (_, idx) => idx / puntosSinusoide.length >= zona.inicio && idx / puntosSinusoide.length <= zona.fin
                );
                if (ptsZona.length < 2) return null;
                const pathZona = ptsZona.reduce(
                  (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
                  ''
                );
                return (
                  <path
                    key={faseId}
                    d={pathZona}
                    fill="none"
                    stroke={faseActiva === faseId ? fase.color : `${fase.color}55`}
                    strokeWidth={faseActiva === faseId ? 5 : 3}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'stroke 0.3s, stroke-width 0.3s' }}
                    onClick={() => handleFaseClick(faseId)}
                    role="button"
                    aria-label={`Fase: ${fase.nombre}`}
                  />
                );
              })}

              {/* Punto animado */}
              <circle
                cx={puntoAnimado.x}
                cy={puntoAnimado.y}
                r="8"
                fill={faseData.color}
                stroke="white"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />

              {/* Etiquetas de fase sobre la curva */}
              <text x={110} y={60} fontSize="11" fill="#22c55e" fontWeight="600" textAnchor="middle">Expansión</text>
              <text x={265} y={45} fontSize="11" fill="#eab308" fontWeight="600" textAnchor="middle">Pico</text>
              <text x={420} y={185} fontSize="11" fill="#ef4444" fontWeight="600" textAnchor="middle">Recesión</text>
              <text x={570} y={90} fontSize="11" fill="#3b82f6" fontWeight="600" textAnchor="middle">Valle</text>
            </svg>

            <button
              className={styles.btnPausarAnim}
              onClick={() => setAnimando((a) => !a)}
              aria-label={animando ? 'Pausar animación' : 'Reanudar animación'}
            >
              {animando ? '⏸ Pausar' : '▶ Reanudar'}
            </button>
          </div>

          {/* Tarjetas de fase */}
          <div className={styles.fasesGrid}>
            {FASES.map((fase) => (
              <button
                key={fase.id}
                className={`${styles.faseCard} ${faseActiva === fase.id ? styles.faseCardActiva : ''}`}
                onClick={() => handleFaseClick(fase.id)}
                style={faseActiva === fase.id ? { borderColor: fase.color, backgroundColor: `${fase.color}12` } : {}}
                aria-pressed={faseActiva === fase.id}
              >
                <span className={styles.faseCardIcono} aria-hidden="true">{fase.icono}</span>
                <span className={styles.faseCardNombre}>{fase.nombre}</span>
              </button>
            ))}
          </div>

          {/* Detalle de la fase activa */}
          <div
            className={styles.faseDetalle}
            style={{ borderLeftColor: faseData.color }}
            role="region"
            aria-label={`Detalle de la fase: ${faseData.nombre}`}
          >
            <div className={styles.faseDetalleTitulo}>
              <span aria-hidden="true">{faseData.icono}</span>
              <h3>{faseData.nombre}</h3>
              <span className={styles.faseDuracion}>{faseData.duracionMedia}</span>
            </div>

            <p className={styles.faseDetalleDesc}>{faseData.descripcion}</p>

            <div className={styles.faseIndicadoresGrid}>
              <div className={styles.faseIndicador}>
                <span className={styles.faseIndicadorLabel}>📊 PIB</span>
                <span className={styles.faseIndicadorValor}>{faseData.pib}</span>
              </div>
              <div className={styles.faseIndicador}>
                <span className={styles.faseIndicadorLabel}>👷 Empleo</span>
                <span className={styles.faseIndicadorValor}>{faseData.empleo}</span>
              </div>
              <div className={styles.faseIndicador}>
                <span className={styles.faseIndicadorLabel}>💰 Inflación</span>
                <span className={styles.faseIndicadorValor}>{faseData.inflacion}</span>
              </div>
            </div>

            <div className={styles.faseEjemplos}>
              <div className={styles.faseEjemplo}>
                <span className={styles.faseEjemploFlag}>🇪🇸</span>
                <span>{faseData.ejemploEspana}</span>
              </div>
              <div className={styles.faseEjemplo}>
                <span className={styles.faseEjemploFlag}>🌍</span>
                <span>{faseData.ejemploGlobal}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 2: Indicadores ── */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <div>
              <h2 className={styles.sectionTitle}>Indicadores leading, coincident y lagging</h2>
              <p className={styles.sectionSubtitle}>
                Haz clic en un indicador para ver por qué es de ese tipo y los datos actuales
              </p>
            </div>
          </div>

          {/* Toggle región */}
          <div className={styles.regionToggle}>
            <button
              className={`${styles.btnToggle} ${filtroRegion === 'espana' ? styles.btnToggleActivo : ''}`}
              onClick={() => setFiltroRegion('espana')}
            >
              🇪🇸 Ver solo España
            </button>
            <button
              className={`${styles.btnToggle} ${filtroRegion === 'eurozona' ? styles.btnToggleActivo : ''}`}
              onClick={() => setFiltroRegion('eurozona')}
            >
              🇪🇺 Ver Eurozona
            </button>
          </div>

          {/* Columnas de indicadores */}
          <div className={styles.indicadoresColumnas}>
            {(['leading', 'coincident', 'lagging'] as TipoIndicador[]).map((tipo) => (
              <div key={tipo} className={styles.indicadoresColumna}>
                <div className={`${styles.indicadoresColHeader} ${styles[`colHeader_${tipo}`]}`}>
                  <span className={styles.indicadoresColIcono}>
                    {tipo === 'leading' ? '⏩' : tipo === 'coincident' ? '⏺' : '⏪'}
                  </span>
                  <div>
                    <div className={styles.indicadoresColTipo}>
                      {tipo === 'leading' ? 'Leading' : tipo === 'coincident' ? 'Coincident' : 'Lagging'}
                    </div>
                    <div className={styles.indicadoresColDesc}>
                      {tipo === 'leading'
                        ? 'Adelantados — predicen'
                        : tipo === 'coincident'
                        ? 'Simultáneos — confirman'
                        : 'Rezagados — confirman después'}
                    </div>
                  </div>
                </div>

                {indicadoresPorTipo(tipo).map((ind) => (
                  <button
                    key={ind.id}
                    className={`${styles.indicadorCard} ${indicadorActivo === ind.id ? styles.indicadorCardActivo : ''}`}
                    onClick={() => setIndicadorActivo(indicadorActivo === ind.id ? null : ind.id)}
                    aria-expanded={indicadorActivo === ind.id}
                  >
                    <span className={styles.indicadorIcono} aria-hidden="true">{ind.icono}</span>
                    <span className={styles.indicadorNombre}>{ind.nombre}</span>
                    <span className={styles.indicadorChevron} aria-hidden="true">
                      {indicadorActivo === ind.id ? '▲' : '▼'}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Panel de detalle del indicador */}
          {indicadorData && (
            <div
              className={`${styles.indicadorDetalle} ${styles[`indDetalle_${indicadorData.tipo}`]}`}
              role="region"
              aria-label={`Detalle: ${indicadorData.nombre}`}
            >
              <h3 className={styles.indicadorDetalleTitulo}>
                <span aria-hidden="true">{indicadorData.icono}</span>
                {indicadorData.nombre}
                <span className={`${styles.indicadorTipoBadge} ${styles[`tipoBadge_${indicadorData.tipo}`]}`}>
                  {indicadorData.tipo === 'leading' ? 'Adelantado' : indicadorData.tipo === 'coincident' ? 'Simultáneo' : 'Rezagado'}
                </span>
              </h3>
              <p>{indicadorData.descripcion}</p>
              <div className={styles.porQueBox}>
                <strong>¿Por qué es de este tipo?</strong>
                <p>{indicadorData.porQue}</p>
              </div>
              <div className={styles.datosActualesRow}>
                <div className={`${styles.datoActual} ${filtroRegion === 'espana' ? styles.datoActualResaltado : ''}`}>
                  <span>🇪🇸 España</span>
                  <strong>{indicadorData.datoEspana}</strong>
                </div>
                <div className={`${styles.datoActual} ${filtroRegion === 'eurozona' ? styles.datoActualResaltado : ''}`}>
                  <span>🇪🇺 Eurozona</span>
                  <strong>{indicadorData.datoEurozona}</strong>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── SECCIÓN 3: Curva de rendimientos ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📐</span>
            <div>
              <h2 className={styles.sectionTitle}>La curva de rendimientos (yield curve)</h2>
              <p className={styles.sectionSubtitle}>
                El predictor más fiable de recesiones — invierte 6-24 meses antes
              </p>
            </div>
          </div>

          {/* Botones de estado */}
          <div className={styles.curvaEstadoBtns}>
            {(['normal', 'plana', 'invertida'] as CurvaEstado[]).map((estado) => (
              <button
                key={estado}
                className={`${styles.btnPrimario} ${curvaEstado === estado ? styles.btnPrimarioActivo : styles.btnSecundario}`}
                onClick={() => setCurvaEstado(estado)}
                style={curvaEstado === estado ? { background: coloresCurva[estado] } : {}}
              >
                {estado === 'normal' ? '✅ Normal' : estado === 'plana' ? '⚠️ Plana' : '🚨 Invertida'}
              </button>
            ))}
          </div>

          {/* Gráfico SVG de la yield curve */}
          <div className={styles.yieldCurveWrapper}>
            <svg
              viewBox={`0 0 ${YC_W} ${YC_H}`}
              className={styles.yieldCurve}
              role="img"
              aria-label={`Curva de rendimientos en estado ${curvaEstado}`}
            >
              {/* Ejes */}
              <line x1={YC_PAD_L} y1={YC_PAD_T} x2={YC_PAD_L} y2={YC_H - YC_PAD_B} stroke="#d1d5db" strokeWidth="1.5" />
              <line x1={YC_PAD_L} y1={YC_H - YC_PAD_B} x2={YC_W - YC_PAD_R} y2={YC_H - YC_PAD_B} stroke="#d1d5db" strokeWidth="1.5" />

              {/* Líneas de referencia Y */}
              {[0, 1, 2, 3, 4, 5, 6].map((v) => {
                const y = YC_PAD_T + (1 - v / 6) * (YC_H - YC_PAD_T - YC_PAD_B);
                return (
                  <g key={v}>
                    <line x1={YC_PAD_L} y1={y} x2={YC_W - YC_PAD_R} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                    <text x={YC_PAD_L - 5} y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}%</text>
                  </g>
                );
              })}

              {/* Etiquetas X */}
              {YIELD_LABELS.map((label, i) => {
                const x = YC_PAD_L + (i / (YIELD_LABELS.length - 1)) * (YC_W - YC_PAD_L - YC_PAD_R);
                return (
                  <text key={label} x={x} y={YC_H - YC_PAD_B + 16} fontSize="9" fill="#9ca3af" textAnchor="middle">
                    {label}
                  </text>
                );
              })}

              {/* Puntos de datos */}
              {curvaActual.map((v, i) => {
                const x = YC_PAD_L + (i / (curvaActual.length - 1)) * (YC_W - YC_PAD_L - YC_PAD_R);
                const y = YC_PAD_T + (1 - v / 6) * (YC_H - YC_PAD_T - YC_PAD_B);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill={coloresCurva[curvaEstado]} stroke="white" strokeWidth="1.5" />
                    <text x={x} y={y - 9} fontSize="9" fill={coloresCurva[curvaEstado]} textAnchor="middle" fontWeight="600">
                      {v.toFixed(1)}%
                    </text>
                  </g>
                );
              })}

              {/* Curva principal */}
              <path
                d={pathYieldCurve}
                fill="none"
                stroke={coloresCurva[curvaEstado]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'd 0.5s ease' }}
              />
            </svg>

            {/* Interpretación */}
            <div className={styles.yieldInterpretacion} style={{ borderColor: coloresCurva[curvaEstado] }}>
              {curvaEstado === 'normal' && (
                <>
                  <h4>✅ Curva con pendiente positiva — economía sana</h4>
                  <p>
                    Los tipos a largo plazo son mayores que los de corto plazo. Los inversores exigen más rentabilidad
                    por prestar durante más tiempo, lo que es normal cuando la economía crece y la inflación es moderada.
                    Señal de confianza en el futuro.
                  </p>
                </>
              )}
              {curvaEstado === 'plana' && (
                <>
                  <h4>⚠️ Curva plana — señal de alerta</h4>
                  <p>
                    Los tipos a corto y largo plazo convergen. Los inversores no ven diferencia significativa entre
                    prestar a 3 meses y a 10 años. Puede preceder a una inversión. Históricamente aparece antes de
                    desaceleraciones económicas. El BCE y la Fed suelen monitorizar este momento con atención.
                  </p>
                </>
              )}
              {curvaEstado === 'invertida' && (
                <>
                  <h4>🚨 Curva invertida — predictor de recesión</h4>
                  <p>
                    Los tipos a corto plazo superan a los de largo plazo. Los inversores anticipan que los bancos
                    centrales tendrán que bajar tipos (porque vendrá una recesión). <strong>Dato clave:</strong> la curva
                    2a-10a de EEUU se invirtió en julio 2022. Todas las recesiones de EEUU desde 1970 fueron precedidas
                    por inversión de la curva con 6-24 meses de antelación.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Historial de inversiones */}
          <div className={styles.warningBox}>
            <strong>📜 Historial de inversiones de la curva 2a-10a en EEUU:</strong>
            <ul className={styles.historialLista}>
              <li>1978: inversión → Recesión 1980</li>
              <li>1989: inversión → Recesión 1990-91</li>
              <li>2000: inversión → Recesión 2001 (dot-com)</li>
              <li>2006: inversión → Recesión 2008-09 (Gran Recesión)</li>
              <li>2019: inversión → Recesión 2020 (COVID)</li>
              <li>Julio 2022: inversión → Desaceleración 2023 (recesión técnica en Eurozona)</li>
            </ul>
            <p className={styles.warningBoxNota}>
              La curva 2a-10a de EEUU, que se invirtió en julio 2022, mostró el spread negativo más profundo desde 1981.
            </p>
          </div>
        </section>

        {/* ── SECCIÓN 4: Simulador ── */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <div>
              <h2 className={styles.sectionTitle}>Simulador: ¿En qué fase estamos?</h2>
              <p className={styles.sectionSubtitle}>
                Responde 6 preguntas sobre indicadores actuales para estimar la fase económica
              </p>
            </div>
          </div>

          <div className={styles.simuladorAviso} role="alert">
            Este es un ejercicio educativo. No constituye asesoramiento financiero.
          </div>

          <div className={styles.preguntasGrid}>
            {PREGUNTAS_SIMULADOR.map((preg, idx) => (
              <div key={preg.id} className={styles.preguntaCard}>
                <p className={styles.preguntaTexto}>
                  <span className={styles.preguntaNum}>{preg.id}.</span> {preg.pregunta}
                </p>
                <p className={styles.preguntaDesc}>{preg.descripcion}</p>
                <div className={styles.preguntaBtns}>
                  <button
                    className={`${styles.btnRespuesta} ${respuestas[idx] === 'si' ? styles.btnRespuestaSi : ''}`}
                    onClick={() => handleRespuesta(idx, 'si')}
                    aria-pressed={respuestas[idx] === 'si'}
                  >
                    ✅ Sí
                  </button>
                  <button
                    className={`${styles.btnRespuesta} ${respuestas[idx] === 'no' ? styles.btnRespuestaNo : ''}`}
                    onClick={() => handleRespuesta(idx, 'no')}
                    aria-pressed={respuestas[idx] === 'no'}
                  >
                    ❌ No
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resultado del simulador */}
          {resultadoSimulador && (
            <div
              className={styles.simuladorResultado}
              role="region"
              aria-live="polite"
              aria-label="Resultado del simulador"
            >
              <div className={styles.simuladorResultadoHeader}>
                <span className={styles.simuladorResultadoIcono} aria-hidden="true">
                  {resultadoSimulador.icono}
                </span>
                <h3>Fase estimada: <strong>{resultadoSimulador.fase}</strong></h3>
              </div>
              <p>{resultadoSimulador.descripcion}</p>
              <div className={styles.simuladorSiguiente}>
                <strong>¿Qué puede ocurrir a continuación?</strong>
                <p>{resultadoSimulador.siguiente}</p>
              </div>
              <p className={styles.simuladorDisclaimer}>
                ⚠️ Este resultado es una estimación educativa basada en señales generales. Los ciclos económicos son
                complejos y requieren análisis professional.
              </p>
            </div>
          )}
        </section>

        {/* ── Sección Educativa ── */}
        <EducationalSection
          title="El ciclo económico: historia, teorías y mecanismos"
          subtitle="Por qué las economías oscilan y cómo influyen los bancos centrales"
        >
          <h3>¿Qué es el ciclo económico?</h3>
          <p>
            El ciclo económico es la alternancia recurrente de períodos de crecimiento y contracción en la
            actividad económica de un país. No es un patrón perfectamente regular —cada ciclo tiene duración e
            intensidad distintas— pero sí una tendencia estructural que se repite en todas las economías de mercado.
          </p>

          <h3>Historia y teorías principales</h3>
          <p>Los economistas han debatido las causas de los ciclos durante siglos:</p>
          <ul>
            <li>
              <strong>John Maynard Keynes (1936):</strong> Los ciclos se deben a cambios en la demanda agregada.
              El «espíritu animal» —la confianza de empresarios y consumidores— amplifica las fluctuaciones.
              Propone la intervención fiscal para suavizarlos.
            </li>
            <li>
              <strong>Joseph Schumpeter (1939):</strong> Los ciclos son el resultado de la «destrucción creativa»:
              las innovaciones tecnológicas impulsan expansiones, que generan burbujas que eventualmente colapsan.
              Identificó ciclos cortos (Kitchin, 3-5 años), medios (Juglar, 7-11 años) y largos (Kondratiev, 45-60 años).
            </li>
            <li>
              <strong>Ciclos de Kondratiev:</strong> Ondas largas de 45-60 años asociadas a grandes innovaciones
              tecnológicas: máquina de vapor (1780), ferrocarriles (1850), electricidad (1900), petroquímica (1950),
              tecnología digital (1990). Estamos potencialmente en un nuevo ciclo Kondratiev con la IA.
            </li>
            <li>
              <strong>Teoría austríaca (Hayek):</strong> Los ciclos se deben a la expansión artificial del crédito
              por parte de los bancos centrales. Los tipos bajos generan «malinversión» que debe corregirse mediante
              una recesión inevitable.
            </li>
          </ul>

          <h3>Duración media de las fases</h3>
          <p>
            Según el NBER (National Bureau of Economic Research), que data los ciclos de EEUU desde 1854:
          </p>
          <ul>
            <li><strong>Expansión media:</strong> ~5 años (60 meses). La más larga: 128 meses (2009-2020).</li>
            <li><strong>Recesión media:</strong> ~11 meses. La más larga en tiempos modernos: 18 meses (Gran Recesión, 2007-2009).</li>
            <li><strong>Tendencia secular:</strong> Las recesiones son cada vez más cortas y las expansiones más largas gracias a mejores políticas monetarias y fiscales.</li>
          </ul>

          <h3>¿Por qué se producen los ciclos?</h3>
          <p>No hay una sola causa; los ciclos son multifactoriales:</p>
          <ul>
            <li><strong>Exceso de crédito:</strong> Los bancos conceden préstamos fáciles durante la expansión. Las burbujas de deuda (inmobiliaria, dot-com, subprime) son la causa más común de recesiones profundas.</li>
            <li><strong>Shocks externos:</strong> Crisis del petróleo (1973, 1979), pandemia COVID (2020), guerra en Ucrania (2022). Perturbaciones inesperadas que rompen el ciclo.</li>
            <li><strong>Política monetaria tardía:</strong> Los bancos centrales suelen subir tipos demasiado tarde (cuando la inflación ya es alta) y los bajan también tarde (cuando la recesión ya es profunda).</li>
            <li><strong>Shocks tecnológicos:</strong> Las innovaciones crean destrucción creativa: sectores enteros desaparecen mientras emergen otros. La transición genera volatilidad.</li>
          </ul>

          <h3>El papel del BCE y la Fed</h3>
          <p>
            Los bancos centrales modernos intentan «suavizar» el ciclo (no eliminarlo, que es imposible):
          </p>
          <ul>
            <li>En expansión: suben tipos para evitar burbujas e inflación.</li>
            <li>En recesión: bajan tipos y compran activos (QE) para estimular la economía.</li>
            <li><strong>Límite del 0%:</strong> Cuando los tipos llegan al 0% (o negativos), el banco central pierde potencia. Recurre a QE, forward guidance y otros instrumentos.</li>
            <li><strong>Retardos de transmisión:</strong> Los efectos de las subidas de tipos tardan 12-24 meses en notarse en la economía real. Por eso los bancos centrales deben actuar anticipando el futuro.</li>
          </ul>

          <h3>Recesión técnica vs. recesión oficial</h3>
          <p>
            En Europa, se habla de <strong>recesión técnica</strong> cuando hay dos trimestres consecutivos de PIB
            negativo. En EEUU, el NBER define oficialmente las recesiones con un criterio más amplio: caída
            significativa de la actividad durante varios meses en múltiples sectores. Por eso en 2022-2023 la
            Eurozona tuvo recesión técnica pero no "oficial" según muchos economistas.
          </p>

          <div className={styles.warningBox}>
            <strong>🔗 Para profundizar:</strong> Conecta este visualizador con el{' '}
            <strong>Visualizador de Tipos de Interés del BCE</strong> para ver cómo la política monetaria
            interactúa con el ciclo económico. Los tipos son la principal palanca con la que el BCE intenta
            gestionar las fases del ciclo.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ciclo-economico')} />
        <ShareCard appName="visualizador-ciclo-economico" />
        <Footer appName="visualizador-ciclo-economico" />
    </div>
  );
}
