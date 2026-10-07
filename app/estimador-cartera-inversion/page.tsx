'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './EstimadorCartera.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============ TIPOS ============

interface AssetClass {
  id: string;
  nombre: string;
  rentabilidadMedia: number; // Anual esperada
  volatilidad: number; // Desviación estándar anual
  color: string;
  descripcion: string;
}

interface CarteraConfig {
  rv: number; // Renta Variable %
  rf: number; // Renta Fija %
  liq: number; // Liquidez %
  alt: number; // Alternativos %
}

interface SimulacionResultado {
  años: number[];
  percentil10: number[];
  percentil25: number[];
  percentil50: number[];
  percentil75: number[];
  percentil90: number[];
  escenarios: number[][]; // Todos los escenarios para análisis
  /** Caída máxima MEDIANA medida sobre las 1.000 trayectorias (fracción) */
  caidaMaximaMediana: number;
  /** Caída máxima del escenario que deja peor al 95 % de los demás (fracción) */
  caidaMaximaP95: number;
  /** Rentabilidad real (Fisher) con la que se ha proyectado (fracción) */
  rentabilidadRealUsada: number;
}

interface MetricasCartera {
  /** Rentabilidad NOMINAL media ponderada de la cartera (%) */
  rentabilidadEsperada: number;
  /** Rentabilidad REAL con la que proyecta el motor, por Fisher (%) */
  rentabilidadRealEsperada: number;
  volatilidadCartera: number;
  sharpeRatio: number;
  /** Caída máxima mediana medida sobre las trayectorias simuladas (%) */
  maxDrawdownEsperado: number;
  /** Caída máxima del percentil 95 de escenarios (%) */
  maxDrawdownP95: number;
  probabilidadObjetivo: number;
  capitalFinalMediano: number;
  capitalFinalPeor: number;
  capitalFinalMejor: number;
}

// ============ CONSTANTES ============

const ASSET_CLASSES: AssetClass[] = [
  {
    id: 'rv',
    nombre: 'Renta Variable',
    rentabilidadMedia: 0.07, // 7% anual
    volatilidad: 0.16, // 16% desviación
    color: '#2E86AB',
    descripcion: 'Acciones globales (MSCI World)',
  },
  {
    id: 'rf',
    nombre: 'Renta Fija',
    rentabilidadMedia: 0.03, // 3% anual
    volatilidad: 0.05, // 5% desviación
    color: '#48A9A6',
    descripcion: 'Bonos gubernamentales y corporativos',
  },
  {
    id: 'liq',
    nombre: 'Liquidez',
    rentabilidadMedia: 0.015, // 1.5% anual
    volatilidad: 0.005, // 0.5% desviación
    color: '#10B981',
    descripcion: 'Fondos monetarios y depósitos',
  },
  {
    id: 'alt',
    nombre: 'Alternativos',
    rentabilidadMedia: 0.05, // 5% anual
    volatilidad: 0.12, // 12% desviación
    color: '#F59E0B',
    descripcion: 'REITs, materias primas, oro',
  },
];

const PERFILES_PREDEFINIDOS: Record<string, { nombre: string; cartera: CarteraConfig }> = {
  conservador: { nombre: 'Conservador', cartera: { rv: 15, rf: 60, liq: 20, alt: 5 } },
  moderado: { nombre: 'Moderado', cartera: { rv: 30, rf: 50, liq: 15, alt: 5 } },
  equilibrado: { nombre: 'Equilibrado', cartera: { rv: 50, rf: 35, liq: 10, alt: 5 } },
  dinamico: { nombre: 'Dinámico', cartera: { rv: 70, rf: 20, liq: 5, alt: 5 } },
  agresivo: { nombre: 'Agresivo', cartera: { rv: 90, rf: 5, liq: 0, alt: 5 } },
};

/** Horizonte y encaje orientativos de cada perfil, para la tabla del bloque educativo. */
const HORIZONTE_PERFIL: Record<string, string> = {
  conservador: 'Corto plazo (menos de 5 años)',
  moderado: '5-10 años',
  equilibrado: '10-15 años',
  dinamico: 'Más de 15 años',
  agresivo: 'Más de 15 años',
};

const ENCAJE_PERFIL: Record<string, string> = {
  conservador: 'Preservar capital, baja tolerancia a las caídas',
  moderado: 'Algo de crecimiento con caídas contenidas',
  equilibrado: 'Equilibrio entre crecimiento y estabilidad',
  dinamico: 'Crecimiento, aceptando caídas notables',
  agresivo: 'Máximo crecimiento, alta tolerancia a las caídas',
};

/**
 * Ejemplo del TER: 50.000 € a 20 años con un 6 % bruto. Calculado, no tecleado: el texto daba
 * ~157.000 y ~139.000 € (18.000 de diferencia) cuando es 154.413 y 120.586 € (hallazgo 2972).
 */
const EJEMPLO_TER = {
  barato: 50_000 * Math.pow(1 + 0.06 - 0.002, 20),
  caro: 50_000 * Math.pow(1 + 0.06 - 0.015, 20),
};

const NUM_SIMULACIONES = 1000;

/**
 * Tasa libre de riesgo por omisión del ratio de Sharpe.
 *
 * ⚠️ 2026-09-21 (hallazgo 1140 del Inspector): estaba fijada en el código sin fuente ni
 *    fecha, no se mostraba en pantalla y no se podía cambiar, aunque el usuario sí podía
 *    mover la inflación. Con carteras conservadoras decide el SIGNO del indicador: al 100 %
 *    de liquidez, (1,5 − 2) / 0,5 = −1,00, y ese −1 depende por entero de un 2 % que la app
 *    no declaraba. Ahora es un campo más, con su valor por omisión a la vista.
 */
const TASA_LIBRE_RIESGO_POR_OMISION = 2;

// ============ FUNCIONES DE SIMULACIÓN ============

// Generador de números aleatorios con distribución normal (Box-Muller)
function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Calcular rentabilidad y volatilidad de la cartera
function calcularParametrosCartera(cartera: CarteraConfig): { rentabilidad: number; volatilidad: number } {
  const pesos = [cartera.rv / 100, cartera.rf / 100, cartera.liq / 100, cartera.alt / 100];

  // Rentabilidad ponderada
  let rentabilidad = 0;
  ASSET_CLASSES.forEach((asset, i) => {
    rentabilidad += pesos[i] * asset.rentabilidadMedia;
  });

  // Volatilidad con matriz de correlaciones simplificada (Markowitz)
  // σ_p² = Σ w_i²·σ_i² + 2·Σ_{i<j} w_i·w_j·σ_i·σ_j·ρ_ij
  // Correlaciones aproximadas: RV-RF=0.25, RV-LIQ=0.1, RV-ALT=0.4, RF-LIQ=0.05, RF-ALT=0.15, LIQ-ALT=0.05
  const correlaciones = [
    [1.00, 0.25, 0.10, 0.40],
    [0.25, 1.00, 0.05, 0.15],
    [0.10, 0.05, 1.00, 0.05],
    [0.40, 0.15, 0.05, 1.00],
  ];
  let varianza = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      varianza += pesos[i] * pesos[j] * ASSET_CLASSES[i].volatilidad * ASSET_CLASSES[j].volatilidad * correlaciones[i][j];
    }
  }

  return {
    rentabilidad,
    volatilidad: Math.sqrt(varianza),
  };
}

// Simulación Monte Carlo
/**
 * Rentabilidad REAL por la ecuación de Fisher: (1 + nominal) / (1 + inflación) − 1.
 *
 * ⚠️ 2026-09-21 (hallazgo 1130): se restaba a secas. La diferencia por año es pequeña
 *    —4,70 % frente a 4,6078 % con un 6,70 % nominal y un 2 % de inflación— pero se
 *    compone durante todo el horizonte: unos 3.000 € sobre 160.000 € a 20 años.
 */
function rentabilidadRealFisher(nominal: number, inflacion: number): number {
  return (1 + nominal) / (1 + inflacion) - 1;
}

function simularCartera(
  capitalInicial: number,
  aportacionMensual: number,
  años: number,
  cartera: CarteraConfig,
  inflacion: number
): SimulacionResultado {
  const { rentabilidad, volatilidad } = calcularParametrosCartera(cartera);
  const rentabilidadReal = rentabilidadRealFisher(rentabilidad, inflacion);

  const escenarios: number[][] = [];
  const caidasMaximas: number[] = [];
  const meses = años * 12;

  // Generar N simulaciones
  for (let sim = 0; sim < NUM_SIMULACIONES; sim++) {
    const evolucion: number[] = [capitalInicial];
    let capital = capitalInicial;

    // ⚠️ 2026-09-21 (hallazgo 1132): el «max drawdown» era volatilidad × 2,5, una regla
    //    empírica que no dependía de ningún escenario simulado —mover horizonte, capital o
    //    aportación no lo cambiaba ni un decimal— mientras la tarjeta educativa lo define
    //    como «la máxima caída desde un pico hasta el siguiente mínimo». Se mide aquí, sobre
    //    un índice de rentabilidad SIN aportaciones: con aportaciones periódicas el saldo
    //    puede subir en plena caída del mercado y la caída quedaría enmascarada.
    let indice = 1;
    let maximoIndice = 1;
    let caidaMaxima = 0;

    for (let mes = 1; mes <= meses; mes++) {
      // Rentabilidad mensual con variación aleatoria
      const rentabilidadMensual = rentabilidadReal / 12;
      const volatilidadMensual = volatilidad / Math.sqrt(12);
      const retornoMensual = rentabilidadMensual + volatilidadMensual * randomNormal();

      capital = capital * (1 + retornoMensual) + aportacionMensual;

      indice = indice * (1 + retornoMensual);
      if (indice > maximoIndice) maximoIndice = indice;
      const caida = maximoIndice > 0 ? (maximoIndice - indice) / maximoIndice : 0;
      if (caida > caidaMaxima) caidaMaxima = caida;

      // Guardar solo valores anuales para el gráfico
      if (mes % 12 === 0) {
        evolucion.push(Math.max(0, capital));
      }
    }

    escenarios.push(evolucion);
    caidasMaximas.push(caidaMaxima);
  }

  // Calcular percentiles por año
  const añosArray = Array.from({ length: años + 1 }, (_, i) => i);
  const percentil10: number[] = [];
  const percentil25: number[] = [];
  const percentil50: number[] = [];
  const percentil75: number[] = [];
  const percentil90: number[] = [];

  for (let año = 0; año <= años; año++) {
    const valoresAño = escenarios.map(e => e[año]).sort((a, b) => a - b);
    percentil10.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.10)]);
    percentil25.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.25)]);
    percentil50.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.50)]);
    percentil75.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.75)]);
    percentil90.push(valoresAño[Math.floor(NUM_SIMULACIONES * 0.90)]);
  }

  const caidasOrdenadas = [...caidasMaximas].sort((a, b) => a - b);

  return {
    años: añosArray,
    percentil10,
    percentil25,
    percentil50,
    percentil75,
    percentil90,
    escenarios,
    /** Caída máxima MEDIANA de los 1.000 escenarios (fracción, no %) */
    caidaMaximaMediana: caidasOrdenadas[Math.floor(NUM_SIMULACIONES * 0.50)],
    /** Caída máxima del escenario que deja peor al 95 % de los demás */
    caidaMaximaP95: caidasOrdenadas[Math.floor(NUM_SIMULACIONES * 0.95)],
    /** Rentabilidad real (Fisher) con la que se ha proyectado */
    rentabilidadRealUsada: rentabilidadReal,
  };
}

// Calcular métricas de la cartera
function calcularMetricas(
  resultado: SimulacionResultado,
  cartera: CarteraConfig,
  objetivo: number,
  tasaLibreRiesgo: number,
  inflacion: number
): MetricasCartera {
  const { rentabilidad, volatilidad } = calcularParametrosCartera(cartera);
  const sharpe = (rentabilidad - tasaLibreRiesgo) / volatilidad;

  // Medido sobre las 1.000 trayectorias, no estimado con una regla del pulgar.
  const maxDrawdownEsperado = resultado.caidaMaximaMediana;

  // Probabilidad de alcanzar objetivo
  const valoresFinales = resultado.escenarios.map(e => e[e.length - 1]);
  const exitosos = valoresFinales.filter(v => v >= objetivo).length;
  const probabilidad = (exitosos / NUM_SIMULACIONES) * 100;

  // Valores finales
  const ordenados = [...valoresFinales].sort((a, b) => a - b);

  return {
    rentabilidadEsperada: rentabilidad * 100,
    rentabilidadRealEsperada: rentabilidadRealFisher(rentabilidad, inflacion) * 100,
    volatilidadCartera: volatilidad * 100,
    sharpeRatio: sharpe,
    maxDrawdownEsperado: maxDrawdownEsperado * 100,
    maxDrawdownP95: resultado.caidaMaximaP95 * 100,
    probabilidadObjetivo: probabilidad,
    capitalFinalMediano: ordenados[Math.floor(NUM_SIMULACIONES * 0.50)],
    capitalFinalPeor: ordenados[Math.floor(NUM_SIMULACIONES * 0.05)],
    capitalFinalMejor: ordenados[Math.floor(NUM_SIMULACIONES * 0.95)],
  };
}

/**
 * Reparto de enteros que suman exactamente 100 por el método del mayor resto: antes cada peso se
 * redondeaba por separado y «Normalizar a 100%» podía dejar 101 % o 99 % (hallazgo 2973).
 */
function normalizarA100(cartera: CarteraConfig): CarteraConfig {
  const claves: (keyof CarteraConfig)[] = ['rv', 'rf', 'liq', 'alt'];
  const total = claves.reduce((s, k) => s + cartera[k], 0);
  if (total === 0) return { rv: 25, rf: 25, liq: 25, alt: 25 };
  const exactos = claves.map((k) => (cartera[k] * 100) / total);
  const enteros = exactos.map(Math.floor);
  let faltan = 100 - enteros.reduce((s, v) => s + v, 0);
  const porResto = exactos
    .map((v, i) => ({ i, resto: v - Math.floor(v) }))
    .sort((a, b) => b.resto - a.resto || a.i - b.i);
  for (const { i } of porResto) {
    if (faltan <= 0) break;
    enteros[i] += 1;
    faltan -= 1;
  }
  return { rv: enteros[0], rf: enteros[1], liq: enteros[2], alt: enteros[3] };
}

/** «60 % RV · 30 % RF · 5 % liquidez · 5 % alternativos» (sin los ceros). */
function composicionTexto(c: CarteraConfig): string {
  const partes: [number, string][] = [[c.rv, 'RV'], [c.rf, 'RF'], [c.liq, 'liquidez'], [c.alt, 'alternativos']];
  return partes.filter(([v]) => v > 0).map(([v, n]) => `${v}${NB}% ${n}`).join(' · ');
}

const NB = '\u00a0';

/**
 * Lee ?perfil= (lo envía el test de perfil inversor). Vive aparte y dentro de <Suspense> porque
 * useSearchParams en el componente principal hacía que la página ENTERA, layout incluido, se
 * sirviera como el fallback de carga: sin JavaScript no llegaban el <h1>, la herramienta ni los
 * dos JSON-LD (hallazgo 2970).
 */
function LectorPerfilURL({ onPerfil }: { onPerfil: (perfil: string) => void }) {
  const searchParams = useSearchParams();
  const perfil = searchParams.get('perfil');
  useEffect(() => {
    if (perfil) onPerfil(perfil);
  }, [perfil, onPerfil]);
  return null;
}

/** Parámetros con los que se hizo la última simulación: el panel se rotula con ellos (2969). */
interface ParametrosSimulados {
  objetivo: number;
  inflacion: number;
  años: number;
  tasaLibreRiesgo: number;
  totalAportado: number;
  cartera: CarteraConfig;
  capitalInicial: number;
  aportacionMensual: number;
}

// ============ COMPONENTE PRINCIPAL ============

export default function SimuladorCarteraPage() {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Perfil que llega del test por ?perfil= (lo aplica LectorPerfilURL tras hidratar)
  const [perfilURL, setPerfilURL] = useState<string | null>(null);
  const perfilInicial: CarteraConfig = { rv: 50, rf: 35, liq: 10, alt: 5 };

  /**
   * ⚠️ 2026-09-21 (hallazgo 1128 del Inspector): los cinco campos eran `type="number"`
   *    leídos con `parseInt(e.target.value)` / `parseFloat(...)`. Teclear el separador
   *    español devolvía OTRO número, en silencio y sin NaN en pantalla porque
   *    `Math.max(0, … || 0)` lo tapaba: «1.500» → 500 €, «1.234,56» → 2.346 €,
   *    «250,50» → 2.500 €/mes. La proyección entera salía de una cifra que el usuario
   *    nunca introdujo. Y el campo no se podía vaciar: al borrarlo saltaba a 0.
   *    Ahora el estado es TEXTO, se parsea con el parser canónico y lo inválido se dice.
   */
  const [capitalTexto, setCapitalTexto] = useState('10.000');
  const [aportacionTexto, setAportacionTexto] = useState('200');
  const [anosTexto, setAnosTexto] = useState('20');
  const [inflacionTexto, setInflacionTexto] = useState('2');
  const [objetivoTexto, setObjetivoTexto] = useState('100.000');
  const [tasaLibreTexto, setTasaLibreTexto] = useState(String(TASA_LIBRE_RIESGO_POR_OMISION));
  const [cartera, setCartera] = useState<CarteraConfig>(perfilInicial);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<string>('');

  const aplicarPerfilURL = useCallback((perfil: string) => {
    if (!PERFILES_PREDEFINIDOS[perfil]) return;
    setPerfilURL(perfil);
    setPerfilSeleccionado(perfil);
    setCartera(PERFILES_PREDEFINIDOS[perfil].cartera);
  }, []);

  /** Lee un campo con el parser canónico y lo acota; `null` si no es un número válido. */
  const leer = useCallback((texto: string, min: number, max: number, entero: boolean): number | null => {
    if (texto.trim() === '') return null;
    const n = parseSpanishNumber(texto);
    if (Number.isNaN(n) || n < min || n > max) return null;
    return entero ? Math.round(n) : n;
  }, []);

  const capitalInicial = useMemo(() => leer(capitalTexto, 0, 100_000_000, false), [capitalTexto, leer]);
  const aportacionMensual = useMemo(() => leer(aportacionTexto, 0, 1_000_000, false), [aportacionTexto, leer]);
  const años = useMemo(() => leer(anosTexto, 1, 50, true), [anosTexto, leer]);
  const inflacion = useMemo(() => leer(inflacionTexto, 0, 20, false), [inflacionTexto, leer]);
  const objetivo = useMemo(() => leer(objetivoTexto, 0, 100_000_000, false), [objetivoTexto, leer]);
  const tasaLibreRiesgo = useMemo(() => leer(tasaLibreTexto, 0, 20, false), [tasaLibreTexto, leer]);

  const camposInvalidos = useMemo(() => {
    const fallos: string[] = [];
    if (capitalInicial === null) fallos.push('capital inicial (0 – 100.000.000 €)');
    if (aportacionMensual === null) fallos.push('aportación mensual (0 – 1.000.000 €)');
    if (años === null) fallos.push('horizonte (1 – 50 años)');
    if (inflacion === null) fallos.push('inflación (0 – 20 %)');
    if (objetivo === null) fallos.push('objetivo (0 – 100.000.000 €)');
    if (tasaLibreRiesgo === null) fallos.push('tasa libre de riesgo (0 – 20 %)');
    return fallos;
  }, [capitalInicial, aportacionMensual, años, inflacion, objetivo, tasaLibreRiesgo]);

  // Lo aportado va con los parámetros SIMULADOS (simulado.totalAportado), en la MISMA moneda que
  // la proyección: euros de hoy. Vale sumar las mensualidades sin inflar porque la app supone que
  // la aportación se actualiza cada año con la inflación, y así lo dice el campo.

  // Estado de resultados
  const [resultado, setResultado] = useState<SimulacionResultado | null>(null);
  const [metricas, setMetricas] = useState<MetricasCartera | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [simulado, setSimulado] = useState<ParametrosSimulados | null>(null);

  // Actualizar cartera al seleccionar perfil
  const handlePerfilChange = (perfil: string) => {
    setPerfilSeleccionado(perfil);
    if (perfil && PERFILES_PREDEFINIDOS[perfil]) {
      setCartera(PERFILES_PREDEFINIDOS[perfil].cartera);
    }
  };

  // Actualizar peso de un activo
  const handlePesoChange = (activo: keyof CarteraConfig, valor: number) => {
    setPerfilSeleccionado(''); // Deseleccionar perfil predefinido
    setCartera(prev => ({ ...prev, [activo]: valor }));
  };

  // Normalizar pesos para que sumen 100
  const normalizarPesos = useCallback(() => {
    setCartera(normalizarA100(cartera));
  }, [cartera]);

  // Ejecutar simulación
  const ejecutarSimulacion = useCallback(() => {
    if (
      capitalInicial === null || aportacionMensual === null || años === null ||
      inflacion === null || objetivo === null || tasaLibreRiesgo === null
    ) return;
    setSimulando(true);

    // Usar setTimeout para no bloquear UI
    setTimeout(() => {
      const res = simularCartera(
        capitalInicial,
        aportacionMensual,
        años,
        cartera,
        inflacion / 100
      );
      setResultado(res);

      const met = calcularMetricas(res, cartera, objetivo, tasaLibreRiesgo / 100, inflacion / 100);
      setMetricas(met);
      setSimulado({
        objetivo,
        inflacion,
        años,
        tasaLibreRiesgo,
        totalAportado: capitalInicial + aportacionMensual * años * 12,
        cartera,
        capitalInicial,
        aportacionMensual,
      });

      setSimulando(false);
    }, 100);
  }, [capitalInicial, aportacionMensual, años, cartera, inflacion, objetivo, tasaLibreRiesgo]);

  // ¿Han cambiado los datos desde la última simulación? Entonces el panel lo dice.
  const desfasado =
    simulado !== null &&
    (simulado.objetivo !== objetivo ||
      simulado.inflacion !== inflacion ||
      simulado.años !== años ||
      simulado.tasaLibreRiesgo !== tasaLibreRiesgo ||
      simulado.capitalInicial !== capitalInicial ||
      simulado.aportacionMensual !== aportacionMensual ||
      simulado.cartera.rv !== cartera.rv ||
      simulado.cartera.rf !== cartera.rf ||
      simulado.cartera.liq !== cartera.liq ||
      simulado.cartera.alt !== cartera.alt);

  // Total de pesos
  const totalPesos = cartera.rv + cartera.rf + cartera.liq + cartera.alt;

  // Datos para el gráfico
  const chartData = useMemo(() => {
    if (!resultado) return null;

    return {
      labels: resultado.años.map(a => `Año ${a}`),
      datasets: [
        {
          label: 'Percentil 90',
          data: resultado.percentil90,
          borderColor: 'rgba(16, 185, 129, 0.8)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [5, 5],
        },
        {
          label: 'Percentil 75',
          data: resultado.percentil75,
          borderColor: 'rgba(72, 169, 166, 0.6)',
          backgroundColor: 'rgba(72, 169, 166, 0.15)',
          fill: '+1',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Mediana (Esperado)',
          data: resultado.percentil50,
          borderColor: '#2E86AB',
          backgroundColor: 'rgba(46, 134, 171, 0.2)',
          fill: false,
          tension: 0.3,
          pointRadius: 2,
          borderWidth: 3,
        },
        {
          label: 'Percentil 25',
          data: resultado.percentil25,
          borderColor: 'rgba(245, 158, 11, 0.6)',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          fill: '-1',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Percentil 10',
          data: resultado.percentil10,
          borderColor: 'rgba(239, 68, 68, 0.8)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [5, 5],
        },
      ],
    };
  }, [resultado]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: { dataset: { label: string }; parsed: { y: number } }) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estimador de Cartera de Inversión</h1>
        <p className={styles.subtitle}>
          Proyecta la evolución de tu patrimonio con simulación Monte Carlo
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <Suspense fallback={null}>
        <LectorPerfilURL onPerfil={aplicarPerfilURL} />
      </Suspense>

      {/* Banner si viene del test */}
      {perfilURL && PERFILES_PREDEFINIDOS[perfilURL] && (
        <div className={styles.perfilBanner}>
          <span className={styles.perfilBannerIcon} aria-hidden="true">🎯</span>
          <span>
            Simulando con tu perfil <strong>{PERFILES_PREDEFINIDOS[perfilURL].nombre}</strong> del test
          </span>
          <Link href="/test-perfil-inversor/" className={styles.perfilBannerLink}>
            Repetir test →
          </Link>
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">⚙️</span> Configuración
          </h2>

          {/* Capital y Aportaciones */}
          <div className={styles.inputGroup}>
            <label htmlFor="capitalInicial" className={styles.inputLabel}>Capital inicial</label>
            <div className={styles.inputWithUnit}>
              <input
                id="capitalInicial"
                type="text"
                className={styles.input}
                value={capitalTexto}
                onChange={e => setCapitalTexto(e.target.value)}
                inputMode="decimal"
              />
              <span className={styles.inputUnit}>€</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="aportacionMensual" className={styles.inputLabel}>Aportación mensual</label>
            <div className={styles.inputWithUnit}>
              <input
                id="aportacionMensual"
                type="text"
                className={styles.input}
                value={aportacionTexto}
                onChange={e => setAportacionTexto(e.target.value)}
                inputMode="decimal"
              />
              <span className={styles.inputUnit}>€/mes</span>
            </div>
          </div>
          <p className={styles.notaCampo}>
            En euros de HOY. La simulación supone que la actualizas cada año con la inflación:
            si la dejas fija en euros corrientes, su capacidad de compra irá bajando y el
            resultado real será menor.
          </p>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="horizonte" className={styles.inputLabel}>Horizonte</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="horizonte"
                  type="text"
                  className={styles.input}
                  value={anosTexto}
                  onChange={e => setAnosTexto(e.target.value)}
                  inputMode="numeric"
                />
                <span className={styles.inputUnit}>años</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="inflacion" className={styles.inputLabel}>Inflación</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="inflacion"
                  type="text"
                  className={styles.input}
                  value={inflacionTexto}
                  onChange={e => setInflacionTexto(e.target.value)}
                  inputMode="decimal"
                />
                <span className={styles.inputUnit}>%</span>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="objetivo" className={styles.inputLabel}>Objetivo de patrimonio</label>
            <div className={styles.inputWithUnit}>
              <input
                id="objetivo"
                type="text"
                className={styles.input}
                value={objetivoTexto}
                onChange={e => setObjetivoTexto(e.target.value)}
                inputMode="decimal"
              />
              <span className={styles.inputUnit}>€</span>
            </div>
          </div>
          <p className={styles.notaCampo}>
            También en euros de hoy: la probabilidad de alcanzarlo se calcula sobre una
            proyección ya descontada de inflación, no sobre el saldo nominal de la cuenta.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor="tasaLibre" className={styles.inputLabel}>Tasa libre de riesgo (ratio de Sharpe)</label>
            <div className={styles.inputWithUnit}>
              <input
                id="tasaLibre"
                type="text"
                className={styles.input}
                value={tasaLibreTexto}
                onChange={e => setTasaLibreTexto(e.target.value)}
                inputMode="decimal"
              />
              <span className={styles.inputUnit}>%</span>
            </div>
          </div>
          <p className={styles.notaCampo}>
            Es la rentabilidad que se obtendría sin asumir riesgo y el listón contra el que el
            ratio de Sharpe mide la cartera. No hay un valor «correcto»: cambia con los tipos de
            interés, así que se deja a la vista y se puede ajustar.
          </p>

          {camposInvalidos.length > 0 && (
            <div role="alert" aria-live="assertive" className={styles.avisoCampos}>
              <span aria-hidden="true">⚠️</span> Revisa estos datos antes de simular:{' '}
              {camposInvalidos.join(' · ')}.
            </div>
          )}

          {/* Distribución de Cartera */}
          <div className={styles.carteraSection}>
            <h3 className={styles.subsectionTitle}>
              <span aria-hidden="true">📊</span> Distribución de Cartera
            </h3>

            {/* Selector de perfil predefinido */}
            <div className={styles.perfilesGrid}>
              {Object.entries(PERFILES_PREDEFINIDOS).map(([key, { nombre }]) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.perfilBtn} ${perfilSeleccionado === key ? styles.perfilBtnActive : ''}`}
                  onClick={() => handlePerfilChange(key)}
                  aria-pressed={perfilSeleccionado === key}
                >
                  {nombre}
                </button>
              ))}
            </div>

            {/* Sliders de peso */}
            <div className={styles.pesosGrid}>
              {ASSET_CLASSES.map(asset => (
                <div key={asset.id} className={styles.pesoItem}>
                  <div className={styles.pesoHeader}>
                    <div
                      className={styles.pesoColor}
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className={styles.pesoNombre}>{asset.nombre}</span>
                    <span className={styles.pesoValor}>
                      {cartera[asset.id as keyof CarteraConfig]}&nbsp;%
                    </span>
                  </div>
                  <input
                    type="range"
                    className={styles.slider}
                    min={0}
                    max={100}
                    value={cartera[asset.id as keyof CarteraConfig]}
                    onChange={e => handlePesoChange(
                      asset.id as keyof CarteraConfig,
                      parseInt(e.target.value)
                    )}
                    aria-label={`Peso de ${asset.nombre}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={cartera[asset.id as keyof CarteraConfig]}
                    aria-valuetext={`${cartera[asset.id as keyof CarteraConfig]} %`}
                    style={{
                      background: `linear-gradient(to right, ${asset.color} 0%, ${asset.color} ${cartera[asset.id as keyof CarteraConfig]}%, #E5E5E5 ${cartera[asset.id as keyof CarteraConfig]}%, #E5E5E5 100%)`
                    }}
                  />
                  <div className={styles.pesoMeta}>
                    <span>Rent: {formatNumber(asset.rentabilidadMedia * 100, 1)}&nbsp;%</span>
                    <span>Vol: {formatNumber(asset.volatilidad * 100, 1)}&nbsp;%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total. ⚠️ 2026-09-21 (hallazgo 1137): la única señal de que los pesos no
                sumaban 100 era el COLOR y un botón deshabilitado en silencio. Quien navega
                con lector de pantalla movía un deslizador y se quedaba sin saber por qué el
                botón dejaba de funcionar. */}
            <div className={`${styles.totalPesos} ${totalPesos !== 100 ? styles.totalError : ''}`}>
              <span>Total:</span>
              <span>{totalPesos}&nbsp;%</span>
              {totalPesos !== 100 && (
                <button
                  type="button"
                  className={styles.normalizarBtn}
                  onClick={normalizarPesos}
                >
                  Normalizar a 100&nbsp;%
                </button>
              )}
            </div>
            {totalPesos !== 100 && (
              <p className={styles.avisoPesos} role="alert" aria-live="assertive">
                <span aria-hidden="true">⚠️</span> Los pesos suman {totalPesos} %: para
                simular tienen que sumar exactamente 100 %. Ajusta los deslizadores o pulsa
                «Normalizar a 100&nbsp;%».
              </p>
            )}
          </div>

          {/* Botón simular */}
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={ejecutarSimulacion}
            disabled={totalPesos !== 100 || simulando || camposInvalidos.length > 0}
            aria-disabled={totalPesos !== 100 || simulando || camposInvalidos.length > 0}
          >
            {simulando ? (
              <>
                <span className={styles.spinner}></span>
                Simulando {NUM_SIMULACIONES} escenarios...
              </>
            ) : (
              <>
                <span aria-hidden="true">🎲</span> Simular Cartera
              </>
            )}
          </button>

          <p className={styles.simulacionInfo}>
            {NUM_SIMULACIONES} escenarios Monte Carlo
          </p>

          <p style={{ marginTop: '0.75rem', fontSize: '0.8em', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
            <strong>Nota sobre rentabilidad esperada:</strong> El motor usa para la renta variable una rentabilidad
            esperada del {formatNumber(ASSET_CLASSES[0].rentabilidadMedia * 100, 0)}&nbsp;% nominal, que con una inflación
            del {formatNumber(inflacion ?? 0, 1)}&nbsp;% es un {formatNumber(rentabilidadRealFisher(ASSET_CLASSES[0].rentabilidadMedia, (inflacion ?? 0) / 100) * 100, 1)}&nbsp;% real:
            una hipótesis basada en el histórico del MSCI World en USD, no una promesa. Las previsiones a largo plazo
            que publican las gestoras cambian cada año con los tipos de interés y las valoraciones, y pueden ser menores.
          </p>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultadosPanel} role="status" aria-live="polite" aria-atomic="false">
          {resultado && metricas && simulado ? (
            <>
              {desfasado && (
                <p className={styles.avisoPesos}>
                  <span aria-hidden="true">🔄</span> Has cambiado datos desde la última simulación: estos
                  resultados son de la anterior. Pulsa «Simular Cartera» para actualizarlos.
                </p>
              )}
              {/* Gráfico */}
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}><span aria-hidden="true">📈</span> Evolución del Patrimonio</h3>
                <div className={styles.chartWrapper} role="img" aria-label="Gráfico de evolución del patrimonio con percentiles 10, 25, 50, 75 y 90">
                  {chartData && (
                    <Line
                      ref={chartRef}
                      data={chartData}
                      options={chartOptions as never}
                    />
                  )}
                </div>
              </div>

              {/* Métricas principales */}
              <div className={styles.metricasGrid}>
                <div className={`${styles.metricaCard} ${styles.destacada}`}>
                  <div className={styles.metricaIcono} aria-hidden="true">💰</div>
                  <div className={styles.metricaValor}>
                    {formatCurrency(metricas.capitalFinalMediano)}
                  </div>
                  <div className={styles.metricaLabel}>Capital final (mediana, en euros de hoy)</div>
                </div>

                <div className={styles.metricaCard}>
                  <div className={styles.metricaIcono} aria-hidden="true">🎯</div>
                  <div className={styles.metricaValor}>
                    {formatNumber(metricas.probabilidadObjetivo, 1)}&nbsp;%
                  </div>
                  <div className={styles.metricaLabel}>
                    Prob. alcanzar {formatCurrency(simulado.objetivo)} de hoy
                  </div>
                </div>

                <div className={styles.metricaCard}>
                  <div className={styles.metricaIcono} aria-hidden="true">📊</div>
                  <div className={styles.metricaValor}>
                    {formatNumber(metricas.sharpeRatio, 2)}
                  </div>
                  <div className={styles.metricaLabel}>Ratio de Sharpe</div>
                </div>

                <div className={styles.metricaCard}>
                  <div className={styles.metricaIcono} aria-hidden="true">📉</div>
                  <div className={styles.metricaValor}>
                    -{formatNumber(metricas.maxDrawdownEsperado, 1)}&nbsp;%
                  </div>
                  <div className={styles.metricaLabel}>
                    Caída máxima mediana
                    <span className={styles.metricaNota}>
                      Medida en los {NUM_SIMULACIONES} escenarios. En el 5 % peor llega
                      a −{formatNumber(metricas.maxDrawdownP95, 1)} %.
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className={styles.detallesSection}>
                <h3 className={styles.subsectionTitle}>
                  <span aria-hidden="true">📋</span> Detalles de la Simulación
                </h3>

                <div className={styles.detallesGrid}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Rentabilidad nominal esperada</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(metricas.rentabilidadEsperada, 2)}&nbsp;% anual
                    </span>
                  </div>
                  {/* ⚠️ 2026-09-21 (hallazgo 1129): la tarjeta enseñaba la NOMINAL y el
                      motor proyectaba con la real, sin que nada en pantalla lo dijera. */}
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Rentabilidad real (la que proyecta)</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(metricas.rentabilidadRealEsperada, 2)}&nbsp;% anual
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Volatilidad cartera</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(metricas.volatilidadCartera, 2)}&nbsp;% anual
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Escenario pesimista (percentil 5)</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(metricas.capitalFinalPeor)}
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Escenario optimista (percentil 95)</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(metricas.capitalFinalMejor)}
                    </span>
                  </div>
                  {/* ⚠️ 2026-09-21 (hallazgo 1131): «Ganancia esperada» restaba magnitudes de
                      distinta naturaleza —mediana deflactada menos aportaciones nominales— y el
                      resultado no era ni una ganancia real ni una nominal. Ahora las dos
                      cifras están en euros de hoy, que es en lo que proyecta el motor. */}
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Total aportado (euros de hoy)</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(simulado.totalAportado)}
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Ganancia esperada (euros de hoy)</span>
                    <span className={styles.detalleValor}>
                      {formatCurrency(metricas.capitalFinalMediano - simulado.totalAportado)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interpretación */}
              <div className={styles.interpretacion}>
                <h4><span aria-hidden="true">💡</span> Interpretación</h4>
                <ul>
                  <li>
                    <strong>Mediana:</strong> En el 50% de los escenarios, tu patrimonio superará {formatCurrency(metricas.capitalFinalMediano)}
                  </li>
                  <li>
                    <strong>Rango probable:</strong> En el 80&nbsp;% de los casos (entre los percentiles 10 y 90), terminarás entre {formatCurrency(resultado.percentil10[resultado.percentil10.length - 1])} y {formatCurrency(resultado.percentil90[resultado.percentil90.length - 1])}
                  </li>
                  <li>
                    <strong>Sharpe Ratio:</strong> relación rentabilidad/riesgo{' '}
                    {metricas.sharpeRatio >= 2
                      ? 'excelente'
                      : metricas.sharpeRatio >= 1
                        ? 'buena'
                        : metricas.sharpeRatio >= 0.5
                          ? 'aceptable'
                          : 'baja'}{' '}
                    (0,5 o más es aceptable; 1 o más, buena; 2 o más, excelente)
                  </li>
                  <li>
                    <strong>Objetivo:</strong> Tienes un {formatNumber(metricas.probabilidadObjetivo, 0)}&nbsp;% de probabilidad de alcanzar {formatCurrency(simulado.objetivo)} <strong>de poder adquisitivo de hoy</strong>
                  </li>
                  <li>
                    <strong>En qué moneda está todo esto:</strong> la proyección descuenta una
                    inflación del {formatNumber(simulado.inflacion, 2)}&nbsp;% anual, así que todas las
                    cifras están en euros de hoy. El saldo que verás en tu cuenta dentro de{' '}
                    {simulado.años} {simulado.años === 1 ? 'año' : 'años'} será mayor en euros corrientes, pero comprará lo mismo.
                  </li>
                  <li>
                    <strong>Ratio de Sharpe:</strong> calculado con una tasa libre de riesgo
                    del {formatNumber(simulado.tasaLibreRiesgo, 2)}&nbsp;%, que puedes cambiar arriba.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden="true">📊</div>
              <h3 className={styles.emptyTitle}>Configura tu simulación</h3>
              <p className={styles.emptyText}>
                Ajusta los parámetros de tu cartera y pulsa &quot;Simular&quot; para ver
                la proyección de tu patrimonio con {NUM_SIMULACIONES} escenarios posibles.
              </p>
              <div className={styles.emptyFeatures}>
                <div className={styles.emptyFeature}>
                  <span aria-hidden="true">🎲</span>
                  <span>Simulación Monte Carlo</span>
                </div>
                <div className={styles.emptyFeature}>
                  <span aria-hidden="true">📈</span>
                  <span>Bandas de confianza</span>
                </div>
                <div className={styles.emptyFeature}>
                  <span aria-hidden="true">📊</span>
                  <span>Métricas financieras</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-cartera-inversion"
        collapsible={false}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor la simulación?"
        subtitle="Aprende sobre Monte Carlo, Sharpe ratio y conceptos clave de inversión"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Clave</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🎲</span> ¿Qué es Monte Carlo?</h4>
              <p>
                Es una técnica que genera miles de escenarios posibles usando números aleatorios.
                En lugar de predecir UN resultado, te muestra la distribución de posibles resultados,
                ayudándote a entender el rango de lo que podría pasar.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📊</span> Ratio de Sharpe</h4>
              <p>
                Mide cuánta rentabilidad extra obtienes por cada unidad de riesgo.
                Un Sharpe de 0,5 o más es aceptable; de 1 o más, bueno, y de 2 o más, excelente.
                Te ayuda a comparar carteras considerando el riesgo asumido.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📉</span> Max Drawdown</h4>
              <p>
                Es la máxima caída desde un pico hasta el siguiente mínimo.
                Te indica cuánto podrías llegar a perder temporalmente en el peor momento.
                Importante para saber si podrás aguantar psicológicamente las caídas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📈</span> Percentiles</h4>
              <p>
                El percentil 50 (mediana) es el resultado típico. El percentil 10 deja por
                debajo solo el 10{NB}% de los escenarios, y el 90 deja por encima otro 10{NB}%:
                son las bandas del gráfico. En «Detalles», el escenario pesimista es el
                percentil 5 y el optimista, el 95.
              </p>
            </div>
          </div>
        </section>

        {/* ========== TABLA COMPARATIVA: PERFILES DE INVERSOR ========== */}
        <section className={styles.comparativaSection}>
          <h2><span aria-hidden="true">⚖️</span> Perfiles de Inversor: ¿Cuál es el tuyo?</h2>
          <p className={styles.comparativaSubtitle}>
            Descubre qué estrategia de cartera se adapta mejor a tu situación personal
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Perfil (botón de arriba)</th>
                  <th>Composición</th>
                  <th>Rentabilidad nominal esperada</th>
                  <th>Volatilidad</th>
                  <th>Horizonte orientativo</th>
                  <th>Encaja con...</th>
                </tr>
              </thead>
              <tbody>
                {/* Sale de PERFILES_PREDEFINIDOS y del mismo motor que la simulación: antes la
                    tabla usaba los mismos nombres con otras carteras y otras cifras (2971) */}
                {Object.entries(PERFILES_PREDEFINIDOS).map(([clave, { nombre, cartera: c }]) => {
                  const { rentabilidad, volatilidad } = calcularParametrosCartera(c);
                  return (
                    <tr key={clave}>
                      <td><strong>{nombre}</strong></td>
                      <td>{composicionTexto(c)}</td>
                      <td>{formatNumber(rentabilidad * 100, 2)}{NB}% anual</td>
                      <td>{formatNumber(volatilidad * 100, 2)}{NB}%</td>
                      <td>{HORIZONTE_PERFIL[clave]}</td>
                      <td>{ENCAJE_PERFIL[clave]}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={6} style={{ fontSize: '0.85em', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    Rentabilidad y volatilidad con las hipótesis de este simulador (antes de inflación). La
                    caída máxima de cada perfil la mide la propia simulación: tarjeta «Caída máxima mediana».
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.comparativaConsejo}>
            <strong><span aria-hidden="true">💡</span> Una regla del pulgar, no una ley:</strong> circulan dos versiones de la
            misma heurística anglosajona —«100 − edad» y «120 − edad» en renta variable— y la
            diferencia entre ellas son 20 puntos de cartera, lo que ya dice cuánta precisión
            tienen. Nació con esperanzas de vida y tipos de interés distintos de los de hoy.
            Úsala para orientarte, no para decidir: lo que manda es cuánto puedes perder sin
            vender y cuándo vas a necesitar el dinero.
          </div>
        </section>

        {/* ========== CASOS DE USO: PERFILES REALES ========== */}
        <section className={styles.escenariosSection}>
          <h2><span aria-hidden="true">💼</span> Perfiles de inversores y estrategias reales</h2>
          <p className={styles.escenariosSubtitle}>
            Ejemplos de carteras según edad, objetivos y situación personal
          </p>

          <div className={styles.escenariosGrid}>
            {/* Caso 1: Joven inversor */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍💻</span>
                <h3>Joven inversor (28 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 10.000 €<br />
                Aportación mensual: 300 €<br />
                Horizonte: 30 años (jubilación)<br />
                Tolerancia al riesgo: Alta</p>
                <p><strong>Cartera:</strong> 80% RV, 15% RF, 5% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Con 30 años por delante, puede aguantar volatilidad y beneficiarse del interés compuesto.
                Las caídas temporales son oportunidades de compra. Capital final esperado con este simulador (mediana, en euros de hoy): ~213.000 €.
              </p>
            </div>

            {/* Caso 2: Familia mediana edad */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
                <h3>Familia (45 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 50.000 €<br />
                Aportación mensual: 500 €<br />
                Horizonte: 15 años (estudios hijos)<br />
                Tolerancia al riesgo: Moderada</p>
                <p><strong>Cartera:</strong> 60% RV, 35% RF, 5% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Equilibrio entre crecimiento y estabilidad. Suficiente RF para suavizar caídas.
                A medida que se acerque el objetivo (año 10-15), reducir RV progresivamente. Capital final esperado con este simulador (mediana, en euros de hoy): ~188.000 €.
              </p>
            </div>

            {/* Caso 3: Pre-jubilado */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏖️</span>
                <h3>Pre-jubilado (60 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 150.000 €<br />
                Aportación mensual: 0 € (ya no trabaja)<br />
                Horizonte: 5 años (preservar capital)<br />
                Tolerancia al riesgo: Baja</p>
                <p><strong>Cartera:</strong> 30% RV, 60% RF, 10% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Prioridad en preservar capital y generar renta estable. Algo de RV (30%) para mantener poder adquisitivo vs inflación.
                A los 65, reducir RV al 20{NB}%. Capital tras 5 años con este simulador (mediana, en euros de hoy): ~164.000 €.
              </p>
            </div>

            {/* Caso 4: Inversor conservador */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛡️</span>
                <h3>Inversor conservador (35 años)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <p>Capital inicial: 30.000 €<br />
                Aportación mensual: 400 €<br />
                Horizonte: 10 años (entrada vivienda)<br />
                Tolerancia al riesgo: Muy baja</p>
                <p><strong>Cartera:</strong> 35% RV, 55% RF, 10% Liquidez</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Objetivo a medio plazo con fecha concreta (compra vivienda). No puede permitirse gran caída en año 8-9.
                RF proporciona estabilidad. Poco RV (35{NB}%) para algo de crecimiento. Capital tras 10 años con este simulador (mediana, en euros de hoy): ~90.000 €.
              </p>
            </div>
          </div>
        </section>

        {/* ========== FAQ AMPLIADO ========== */}
        <section className={styles.faqSection}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre inversión en carteras</h2>

          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuánto dinero necesito para empezar a invertir?</h4>
              <p>
                No hay un mínimo universal. Con fondos indexados se puede empezar con importes pequeños, porque la diversificación la da el propio fondo y no el tamaño de la aportación; lo que sí conviene mirar antes son las comisiones fijas, que pesan mucho sobre importes bajos.
                Con menos de 1.000 €, los costes de transacción (comisiones de fondos/ETFs, custodia) pueden comerse una parte significativa de la rentabilidad.
              </p>
              <p>
                <strong>Alternativa si tienes poco capital:</strong> Empieza con fondos indexados de acumulación (sin reparto de dividendos)
                y ve aportando mensualmente (50-200 €/mes). Muchos brokers permiten aportaciones automáticas sin comisiones.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Debo rebalancear mi cartera? ¿Con qué frecuencia?</h4>
              <p>
                <strong>Sí, el rebalanceo es clave.</strong> Si tu cartera objetivo es 60% RV / 40% RF, y tras un año de subidas la RV pasa a ser 70%,
                debes vender RV y comprar RF para volver al 60/40. Esto te obliga a <strong>vender caro y comprar barato</strong> de forma disciplinada.
              </p>
              <p>
                <strong>Frecuencia recomendada:</strong> 1-2 veces al año (junio y diciembre) o cuando una clase de activo se desvíe más del 5% de su objetivo.
                No rebalancees en pánico durante caídas de mercado; hazlo según calendario fijo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué porcentaje de mi patrimonio debo invertir?</h4>
              <p>
                <strong>Regla general:</strong> Invierte solo el dinero que NO necesites en los próximos 5-10 años. Antes de invertir, asegúrate de tener:
              </p>
              <p>
                1. <strong>Fondo de emergencia:</strong> 3-6 meses de gastos en cuenta corriente/ahorro líquido<br />
                2. <strong>Deudas de alto interés pagadas:</strong> Tarjetas de crédito, préstamos personales (&gt;5% TAE)<br />
                3. <strong>Objetivos a corto plazo cubiertos:</strong> Vacaciones, reparaciones del coche, etc.
              </p>
              <p>
                Solo entonces, invierte el excedente. Si tienes 50.000 € ahorrados, quizás 10.000 € sean fondo emergencia y 40.000 € invertibles.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es mejor invertir todo de golpe o poco a poco (DCA)?</h4>
              <p>
                Depende de tu psicología y el momento de mercado. Dos estrategias:
              </p>
              <p>
                <strong>Lump Sum (todo de golpe):</strong> en los estudios que comparan las dos formas sobre series históricas de EE. UU. y Reino Unido —el más citado es el de Vanguard de 2012— invertir de golpe sale mejor en torno a dos de cada tres periodos, sencillamente porque el mercado sube más a menudo de lo que baja.
                Si tienes una suma grande (ej: herencia, bonus), invertirla de golpe suele ser óptimo <strong>si puedes dormir tranquilo</strong>.
              </p>
              <p>
                <strong>DCA (Dollar Cost Averaging):</strong> Inviertes cantidades fijas periódicamente (ej: 500 €/mes durante 20 meses si tienes 10.000 €).
                Reduce el riesgo psicológico de invertir justo antes de una caída. <strong>Mejor para inversores nerviosos</strong> o si estás empezando.
              </p>
              <p>
                <strong>Consejo:</strong> Si tienes una suma grande y dudas, compromiso intermedio: invierte 50% ahora y el otro 50% en 6 cuotas mensuales.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Dónde invierto? ¿Fondos indexados o ETFs?</h4>
              <p>
                Ambos son vehículos de inversión pasiva excelentes. La elección depende de tu situación:
              </p>
              <p>
                <strong>Fondos indexados:</strong> se contratan a través de un banco, una gestora o un comercializador.
                Sin comisiones de compra/venta en muchos casos. Ideal si haces aportaciones pequeñas frecuentes (100-200 €/mes).
                Fiscalidad: Traspasables sin tributar (solo pagas cuando vendes definitivamente).
              </p>
              <p>
                <strong>ETFs:</strong> Se compran en bolsa como acciones (necesitas broker). Más flexibilidad (puedes vender en cualquier momento durante mercado abierto).
                Pagas comisión de compra/venta (0,5-1 € por operación en brokers baratos). Ideal si inviertes sumas mayores de forma esporádica (1.000+ €).
                Fiscalidad: Cada venta tributa (aunque vendas para traspasar).
              </p>
              <p>
                <strong>En resumen:</strong> los fondos indexados encajan mejor con aportaciones pequeñas y frecuentes y con el traspaso sin tributar; los ETF, con sumas mayores y esporádicas y con quien quiera operar en mercado abierto. Ninguna de las dos opciones es mejor en abstracto.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si necesito el dinero antes de tiempo?</h4>
              <p>
                Puedes vender en cualquier momento (liquidez diaria en fondos/ETFs), pero <strong>asumir consecuencias:</strong>
              </p>
              <p>
                1. <strong>Riesgo de vender en pérdidas:</strong> Si el mercado ha caído un 20% y vendes, cristalizas esas pérdidas.
                Si hubieras esperado 2-3 años, probablemente se habría recuperado.<br />
                2. <strong>Impacto fiscal:</strong> Pagas impuestos sobre las ganancias (las tasas varían según país: en España la base del ahorro va del 19 % al 30 % por tramos desde 2025, 10-20% en México con CETES, 15-35% en Argentina, etc.). En muchos países puedes compensar pérdidas con ganancias futuras durante varios años. Consulta tu normativa fiscal.<br />
                3. <strong>Coste de oportunidad:</strong> Pierdes el potencial de crecimiento futuro del capital retirado.
              </p>
              <p>
                <strong>Solución:</strong> Por eso es clave tener fondo de emergencia separado. Solo invierte dinero que sepas que no necesitarás en 5+ años.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo debo vender? ¿Cómo saber si es buen momento?</h4>
              <p>
                <strong>NO vendas intentando "adivinar el mercado"</strong> (market timing). Incluso profesionales fallan. En su lugar, vende cuando:
              </p>
              <p>
                1. <strong>Alcanzas tu objetivo:</strong> Necesitas el dinero para el fin previsto (comprar casa, jubilación, estudios).<br />
                2. <strong>Cambia tu situación:</strong> Pérdida de empleo, enfermedad grave, cambio radical de tolerancia al riesgo.<br />
                3. <strong>Rebalanceo programado:</strong> Vender RV automáticamente cuando supera tu % objetivo (disciplina, no emoción).
              </p>
              <p>
                <strong>NUNCA vendas por:</strong> Noticias alarmistas, caídas del 10-20% (normales), miedo al crash (imposible predecir),
                consejos de familiares/amigos sin formación financiera.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es seguro invertir? ¿Puedo perder todo mi dinero?</h4>
              <p>
                <strong>Depende de cómo inviertas.</strong> Con diversificación adecuada (fondos indexados globales), es extremadamente improbable perder TODO:
              </p>
              <p>
                • <strong>Fondos indexados globales (MSCI World):</strong> Invierten en 1.500+ empresas de 23 países. Para perder todo,
                todas las empresas del mundo tendrían que quebrar (escenario apocalíptico).<br />
                • <strong>Caídas de referencia:</strong> la mayor de la historia moderna fue 1929-1932, del orden de un −86 % en la bolsa estadounidense, y el Nasdaq cayó cerca de un −78 % entre 2000 y 2002. La de 2008-2009, en torno al −55 %, es la más reciente de gran tamaño: quien aguantó recuperó en 3-4 años. Una cartera diversificada cae menos que la bolsa sola, pero conviene calibrar con la cifra grande, no con la cómoda.<br />
                • <strong>Renta Fija:</strong> Mucho más estable. Bonos gubernamentales de países desarrollados casi nunca quiebran.
              </p>
              <p>
                <strong>Riesgos REALES:</strong><br />
                1. Vender en pánico durante caídas (pérdidas cristalizadas).<br />
                2. Invertir en productos complejos sin entenderlos (CFDs, opciones, criptos sin conocimiento).<br />
                3. Concentración excesiva (todo en 2-3 acciones individuales, todo en un sector/país).
              </p>
              <p>
                <strong>Solución:</strong> Diversifica (fondos indexados), ten horizonte largo (5+ años), no vendas en pánico, edúcate antes de invertir.
              </p>
            </div>
          </div>
        </section>

        {/* ========== GUÍA PASO A PASO ========== */}
        <section className={styles.guideSection}>
          <h2><span aria-hidden="true">📋</span> Guía paso a paso: Cómo construir tu cartera de inversión</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Define tus objetivos y horizonte temporal</h4>
                <p>
                  Antes de invertir, responde: <strong>¿Para qué inviertes?</strong> (jubilación, comprar casa, estudios hijos) y{' '}
                  <strong>¿cuándo lo necesitas?</strong> (5, 10, 20 años). Tu horizonte determina cuánto riesgo puedes asumir:
                </p>
                <p>
                  • Menos de 3 años: NO inviertas en RV (mucha volatilidad), usa depósitos/RF.<br />
                  • 3-10 años: Cartera moderada (40-60% RV).<br />
                  • Más de 10 años: Cartera agresiva (60-80% RV) es viable.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Evalúa tu tolerancia al riesgo (test real)</h4>
                <p>
                  Pregúntate: <strong>Si tu cartera cayera un 30% en 6 meses, ¿qué harías?</strong>
                </p>
                <p>
                  A) Vendería todo de inmediato (pánico) → <strong>Perfil conservador</strong> (máx 30-40% RV)<br />
                  B) Me preocuparía pero no vendería → <strong>Perfil moderado</strong> (50-60% RV)<br />
                  C) Aprovecharía para comprar más (oportunidad) → <strong>Perfil agresivo</strong> (70-80% RV)
                </p>
                <p>
                  <strong>Consejo:</strong> Es mejor ser conservador y cumplir el plan que ser agresivo y vender en pánico a pérdidas.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Selecciona tus activos (fondos indexados simples)</h4>
                <p>
                  Para empezar, <strong>menos es más</strong>. Una cartera de 2-3 fondos es suficiente:
                </p>
                <p>
                  • <strong>Renta Variable:</strong> 1 fondo indexado global (por ejemplo, uno que replique el MSCI World o un índice mundial equivalente).<br />
                  • <strong>Renta Fija:</strong> 1 fondo de bonos agregados (gubernamentales + corporativos).<br />
                  • <strong>Liquidez:</strong> Fondo monetario o depósito a corto plazo (reserva accesible).
                </p>
                <p>
                  <strong>Evita:</strong> Fondos de gestión activa con comisiones &gt;1% anual. Busca TER (Total Expense Ratio) &lt;0,3{NB}%.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Decide tu asset allocation (distribución de activos)</h4>
                <p>
                  Basándote en tu perfil de riesgo (paso 2) y horizonte (paso 1), define los % de cada activo:
                </p>
                <p>
                  {Object.entries(PERFILES_PREDEFINIDOS).map(([clave, { nombre, cartera: c }]) => (
                    <span key={clave}>• <strong>{nombre}:</strong> {composicionTexto(c)}<br /></span>
                  ))}
                </p>
                <p>
                  <strong>Heurística orientativa anglosajona (no aplicable mecánicamente):</strong> % RV ≈ 100-edad.
                  Ej: 40 años → 60% RV. No sustituye la evaluación profesional MiFID II de tu situación.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Abre cuenta en un broker/plataforma de bajo coste</h4>
                <p>
                  Compara brokers por: <strong>comisiones de compra/venta, custodia anual, variedad de fondos/ETFs</strong>.
                </p>
                <p>
                  <strong>Qué mirar al comparar, sin fijarse en el nombre:</strong><br />
                  • <strong>Que esté registrado</strong> en el supervisor de tu país y cubierto por su fondo de garantía de inversiones.<br />
                  • <strong>Comisiones</strong>: de compra y venta, de custodia anual y de cambio de divisa, que es la que más se olvida.<br />
                  • <strong>Catálogo</strong>: que tenga los fondos o ETF que quieres, no solo los suyos.<br />
                  • <strong>Fiscalidad</strong>: si practica retención e informa a la administración de tu país, o si tendrás que declararlo por tu cuenta.<br />
                  • <strong>Traspasos</strong>: si permite mover fondos sin vender, donde la normativa lo prevea.
                </p>
                <p>
                  <strong>Documentación necesaria habitual:</strong> documento de identidad, justificante de domicilio, número de cuenta bancaria.
                  Proceso 100% online en la mayoría de brokers (10-20 minutos).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Haz tu primera inversión y configura aportaciones</h4>
                <p>
                  Invierte tu capital inicial según los % definidos. Si tienes 10.000 € y perfil 60/40:
                </p>
                <p>
                  • Compra 6.000 € de fondo RV (60%)<br />
                  • Compra 4.000 € de fondo RF (40%)
                </p>
                <p>
                  <strong>Aportaciones automáticas:</strong> Configura transferencias mensuales automáticas desde tu nómina
                  (ej: 300 €/mes) para seguir invirtiendo sin pensar. El broker puede reinvertir automáticamente en tus fondos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Rebalancea periódicamente y revisa anualmente</h4>
                <p>
                  <strong>Rebalanceo (cada 6-12 meses):</strong> Si tu cartera 60/40 ahora es 70/30 porque RV subió mucho,
                  vende 10% de RV y compra 10% de RF para volver a 60/40. Esto te obliga a <strong>vender caro y comprar barato</strong>.
                </p>
                <p>
                  <strong>Revisión anual:</strong> Cada enero, revisa si tu situación cambió (nueva edad, cambio de objetivos, cambio de tolerancia).
                  Ajusta tu asset allocation si es necesario (ej: a los 50 años, reduces RV del 70% al 60%).
                </p>
                <p>
                  <strong>Lo que NO debes hacer:</strong> Revisar tu cartera cada día/semana. Míralas solo 2-4 veces al año (menos ansiedad, mejores resultados).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== MEJORES PRÁCTICAS ========== */}
        <section className={styles.tipsSection}>
          <h2><span aria-hidden="true">✅</span> Mejores prácticas para inversores a largo plazo</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Diversifica siempre: nunca todo en un solo activo</h4>
              <p>
                No pongas más del 5-10% de tu cartera en una sola empresa o sector. Usa fondos indexados que invierten en
                cientos/miles de empresas automáticamente. La diversificación es el único "almuerzo gratis" en finanzas.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Invierte regular y automáticamente (olvídate del timing)</h4>
              <p>
                No intentes adivinar cuándo el mercado está "barato". Configura aportaciones mensuales automáticas (DCA: Dollar Cost Averaging).
                Comprarás a veces caro, a veces barato, pero eliminas la emoción y el estrés de decidir "cuándo entrar".
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Minimiza costes: busca TER &lt; 0,3{NB}% anual</h4>
              <p>
                Un fondo con TER 0,2{NB}% frente a uno con 1,5{NB}% puede costarte decenas de miles de euros en 20 años. Ejemplo: 50.000 € a 20 años con un 6{NB}% bruto
                → con TER 0,2{NB}% (5,8{NB}% neto) acabas con ~{formatNumber(EJEMPLO_TER.barato, 0)} €; con TER 1,5{NB}% (4,5{NB}% neto), con ~{formatNumber(EJEMPLO_TER.caro, 0)} €: unos {formatNumber(EJEMPLO_TER.barato - EJEMPLO_TER.caro, 0)} € de diferencia solo en comisiones, casi un tercio de la ganancia (suponiendo una rentabilidad constante teórica del 6{NB}%; los mercados reales tienen volatilidad).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Rebalancea sin emoción: vende caro y compra barato</h4>
              <p>
                Si tu cartera 60/40 se convierte en 75/25 tras una subida de RV, rebalancea vendiendo RV y comprando RF. Te obligas a vender en máximos
                y comprar en mínimos relativos. Hazlo por calendario (junio/diciembre), no por "sensaciones" del mercado.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Edúcate continuamente: lee libros y blogs de referencia</h4>
              <p>
                Libros recomendados: "El inversor inteligente" (Benjamin Graham), "Un paseo aleatorio por Wall Street" (Burton Malkiel),
                "The Bogleheads' Guide to Investing". Blogs: Bogleheads.org, The White Coat Investor. Evita "gurús" que prometen rentabilidades del 20%+ anual.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Mantén un fondo de emergencia fuera de la inversión</h4>
              <p>
                Antes de invertir, ten 3-6 meses de gastos en cuenta corriente/ahorro líquido. Esto evita que tengas que vender inversiones con pérdidas
                ante imprevistos (avería coche, despido, enfermedad). El fondo de emergencia es tu colchón de seguridad psicológica.
              </p>
            </div>
          </div>
        </section>

        {/* ========== WARNING BOX: ERRORES COMUNES ========== */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores costosos que cometen inversores principiantes</h3>
          </div>

          <ul className={styles.warningList}>
            <li>
              <strong>Vender en pánico durante caídas del mercado:</strong> Las caídas del 20-30% son normales cada 5-10 años.
              Quien vendió en marzo 2020 (COVID) con -35% perdió la recuperación más rápida de la historia (en 6 meses ya estaba en máximos).{' '}
              <strong>Solución:</strong> No mires tu cartera durante crisis, mantén el plan. Si no puedes aguantar psicológicamente caídas del 30%,
              reduce tu % de RV ANTES de que ocurran.
            </li>
            <li>
              <strong>Intentar hacer market timing (adivinar cuándo comprar/vender):</strong> Incluso gestores profesionales fallan en predecir máximos y mínimos.
              Las series de «mejores días» que circulan —perderse los 10 mejores días recorta la rentabilidad a la mitad— salen de la bolsa estadounidense y esconden que los mejores días suelen estar pegados a los peores, así que quien sale para evitar unos se pierde los otros. <strong>La conclusión sí se sostiene:</strong> acertar el momento de entrar y salir es muy difícil, y salir y volver cuesta más de lo que parece.
              Invierte regularmente sin intentar "esperar el mejor momento".
            </li>
            <li>
              <strong>Concentración excesiva en pocas acciones o sectores:</strong> "Poner todos los huevos en la misma cesta". Si inviertes todo en tecnología
              y el sector cae 50%, tu cartera cae 50%. <strong>Solución:</strong> Diversificación global con fondos indexados que cubran miles de empresas y sectores.
            </li>
            <li>
              <strong>Perseguir rentabilidades pasadas ("performance chasing"):</strong> Ver que un fondo subió 40% el año pasado y comprarlo.
              Problema: lo que sube rápido suele caer rápido (reversión a la media). <strong>Solución:</strong> Invierte en fondos con estrategia consistente
              (indexación), no en los "ganadores del año pasado".
            </li>
            <li>
              <strong>Pagar comisiones altas por gestión activa sin valor añadido:</strong> Fondos de gestión activa con TER 1,5-2{NB}% rara vez baten al mercado
              tras costes. En 20 años, esas comisiones se comen el 30-40{NB}% de tu rentabilidad final. <strong>Solución:</strong> Fondos indexados pasivos con TER &lt;0,3{NB}%.
            </li>
            <li>
              <strong>No tener un plan escrito y dejarse llevar por emociones:</strong> Invertir sin estrategia clara lleva a decisiones impulsivas (comprar en euforia,
              vender en pánico). <strong>Solución:</strong> Escribe tu plan de inversión (objetivos, asset allocation, reglas de rebalanceo) y cúmplelo mecánicamente.
              La disciplina vence a la inteligencia en inversión.
            </li>
            <li>
              <strong>Ignorar la fiscalidad e impuestos sobre ganancias:</strong> Cada vez que vendes, pagas impuestos sobre las ganancias (la tasa depende de tu país; consulta tu normativa). Si haces muchas compra/ventas,
              pagas impuestos cada año. <strong>Solución:</strong> Buy and hold (compra y mantén), aprovecha traspasos sin tributar entre fondos cuando tu legislación lo permita, minimiza rotación.
              Vende solo cuando necesites el dinero o rebalancees (1-2 veces/año máx).
            </li>
            <li>
              <strong>Invertir dinero que necesitas a corto plazo:</strong> Invertir el ahorro para la entrada del piso que compras en 1 año es un error enorme.
              Si el mercado cae 20% ese año, te falta el 20% de la entrada. <strong>Solución:</strong> Solo invierte dinero que NO necesites en los próximos 5+ años.
              Objetivos a corto plazo (&lt;3 años) van a depósitos/RF estable, no a RV.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-cartera-inversion')} />

      <ShareCard appName="estimador-cartera-inversion" />
      <Footer appName="estimador-cartera-inversion" />
    </div>
  );
}
