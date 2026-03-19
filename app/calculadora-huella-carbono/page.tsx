'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CalculadoraHuellaCarbono.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Factores de emisión (kg CO2 por unidad) - Fuentes: MITECO, IPCC, estudios europeos
const FACTORES = {
  // Transporte (kg CO2 por km)
  cocheGasolina: 0.21,
  cocheDiesel: 0.17,
  cocheHibrido: 0.12,
  cocheElectrico: 0.05,
  moto: 0.1,
  bus: 0.089,
  metro: 0.033,
  tren: 0.041,
  // Vuelos (kg CO2 por vuelo ida y vuelta, incl. factor forzamiento radiativo)
  // Fuente: ICAO Carbon Calculator, ADEME 2024
  vueloCorto: 350,  // < 1500 km — ej. Madrid-París i/v ≈ 350 kg CO2
  vueloMedio: 900,  // 1500-4000 km — ej. Madrid-Estambul i/v ≈ 900 kg CO2
  vueloLargo: 2500, // > 4000 km — ej. Madrid-Nueva York i/v ≈ 2.500 kg CO2
  // Hogar
  electricidad: 0.25, // kg CO2 por kWh (mix español 2024)
  gasNatural: 2.0, // kg CO2 por m³
  butano: 2.96, // kg CO2 por kg
  // Alimentación (kg CO2 por año según dieta)
  dietaAlta: 3300, // Mucha carne roja
  dietaMedia: 2500, // Omnívora equilibrada
  dietaBaja: 1700, // Flexitariana
  dietaVegetariana: 1200,
  dietaVegana: 900,
  // Consumo
  ropaUnidad: 25, // kg CO2 por prenda
  movil: 70, // kg CO2 por dispositivo
  ordenador: 300, // kg CO2 por dispositivo
  reciclaje: 0.8, // Factor multiplicador si recicla bien
};

// Media española y objetivo sostenible (toneladas CO2/año)
const MEDIA_ESPANA = 7.5;
const OBJETIVO_SOSTENIBLE = 2.0;

interface DatosTransporte {
  kmCoche: string;
  tipoCoche: 'gasolina' | 'diesel' | 'hibrido' | 'electrico' | 'ninguno';
  kmMoto: string;
  kmBus: string;
  kmMetro: string;
  kmTren: string;
  vuelosCortos: string;
  vuelosMedios: string;
  vuelosLargos: string;
}

interface DatosHogar {
  electricidadMensual: string;
  gasNatural: string;
  butanoKg: string;
  personasHogar: string;
}

interface DatosAlimentacion {
  tipoDieta: 'alta' | 'media' | 'baja' | 'vegetariana' | 'vegana';
  productosLocales: boolean;
}

interface DatosConsumo {
  ropaNueva: string;
  movilesAnio: string;
  ordenadoresAnio: string;
  recicla: boolean;
}

interface Resultados {
  transporte: number;
  hogar: number;
  alimentacion: number;
  consumo: number;
  total: number;
}

export default function CalculadoraHuellaCarbono() {
  const [seccionActiva, setSeccionActiva] = useState<number>(0);
  const [calculado, setCalculado] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const [transporte, setTransporte] = useState<DatosTransporte>({
    kmCoche: '',
    tipoCoche: 'gasolina',
    kmMoto: '',
    kmBus: '',
    kmMetro: '',
    kmTren: '',
    vuelosCortos: '',
    vuelosMedios: '',
    vuelosLargos: '',
  });

  const [hogar, setHogar] = useState<DatosHogar>({
    electricidadMensual: '',
    gasNatural: '',
    butanoKg: '',
    personasHogar: '1',
  });

  const [alimentacion, setAlimentacion] = useState<DatosAlimentacion>({
    tipoDieta: 'media',
    productosLocales: false,
  });

  const [consumo, setConsumo] = useState<DatosConsumo>({
    ropaNueva: '',
    movilesAnio: '',
    ordenadoresAnio: '',
    recicla: false,
  });

  const [resultados, setResultados] = useState<Resultados | null>(null);

  const secciones = ['Transporte', 'Hogar', 'Alimentación', 'Consumo'];

  const parseNum = (val: string): number => {
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const calcularHuella = () => {
    // Transporte
    let co2Transporte = 0;
    const factorCoche = {
      gasolina: FACTORES.cocheGasolina,
      diesel: FACTORES.cocheDiesel,
      hibrido: FACTORES.cocheHibrido,
      electrico: FACTORES.cocheElectrico,
      ninguno: 0,
    };
    co2Transporte += parseNum(transporte.kmCoche) * factorCoche[transporte.tipoCoche];
    co2Transporte += parseNum(transporte.kmMoto) * FACTORES.moto;
    co2Transporte += parseNum(transporte.kmBus) * FACTORES.bus;
    co2Transporte += parseNum(transporte.kmMetro) * FACTORES.metro;
    co2Transporte += parseNum(transporte.kmTren) * FACTORES.tren;
    co2Transporte += parseNum(transporte.vuelosCortos) * FACTORES.vueloCorto;
    co2Transporte += parseNum(transporte.vuelosMedios) * FACTORES.vueloMedio;
    co2Transporte += parseNum(transporte.vuelosLargos) * FACTORES.vueloLargo;

    // Hogar
    let co2Hogar = 0;
    const personas = Math.max(1, parseNum(hogar.personasHogar));
    co2Hogar += (parseNum(hogar.electricidadMensual) * 12 * FACTORES.electricidad) / personas;
    co2Hogar += (parseNum(hogar.gasNatural) * 12 * FACTORES.gasNatural) / personas;
    co2Hogar += (parseNum(hogar.butanoKg) * 12 * FACTORES.butano) / personas;

    // Alimentación
    let co2Alimentacion = 0;
    const factoresDieta = {
      alta: FACTORES.dietaAlta,
      media: FACTORES.dietaMedia,
      baja: FACTORES.dietaBaja,
      vegetariana: FACTORES.dietaVegetariana,
      vegana: FACTORES.dietaVegana,
    };
    co2Alimentacion = factoresDieta[alimentacion.tipoDieta];
    if (alimentacion.productosLocales) {
      co2Alimentacion *= 0.85; // 15% menos si consume local
    }

    // Consumo
    let co2Consumo = 0;
    co2Consumo += parseNum(consumo.ropaNueva) * FACTORES.ropaUnidad;
    co2Consumo += parseNum(consumo.movilesAnio) * FACTORES.movil;
    co2Consumo += parseNum(consumo.ordenadoresAnio) * FACTORES.ordenador;
    if (consumo.recicla) {
      co2Consumo *= FACTORES.reciclaje;
    }

    // Convertir a toneladas
    const total = (co2Transporte + co2Hogar + co2Alimentacion + co2Consumo) / 1000;

    setResultados({
      transporte: co2Transporte / 1000,
      hogar: co2Hogar / 1000,
      alimentacion: co2Alimentacion / 1000,
      consumo: co2Consumo / 1000,
      total,
    });
    setCalculado(true);
  };

  useEffect(() => {
    if (calculado && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [calculado]);

  const getComparacion = (total: number): { texto: string; clase: string } => {
    if (total <= OBJETIVO_SOSTENIBLE) {
      return { texto: 'Excelente - Nivel sostenible', clase: styles.excelente };
    } else if (total <= MEDIA_ESPANA * 0.7) {
      return { texto: 'Muy bien - Por debajo de la media', clase: styles.muyBien };
    } else if (total <= MEDIA_ESPANA) {
      return { texto: 'Normal - Cerca de la media española', clase: styles.normal };
    } else {
      return { texto: 'Alto - Por encima de la media', clase: styles.alto };
    }
  };

  const getRecomendaciones = (): string[] => {
    if (!resultados) return [];
    const recs: string[] = [];

    // Ordenar categorías por impacto
    const categorias = [
      { nombre: 'transporte', valor: resultados.transporte },
      { nombre: 'hogar', valor: resultados.hogar },
      { nombre: 'alimentacion', valor: resultados.alimentacion },
      { nombre: 'consumo', valor: resultados.consumo },
    ].sort((a, b) => b.valor - a.valor);

    // Recomendaciones según categoría con más impacto
    if (categorias[0].nombre === 'transporte' && resultados.transporte > 1) {
      recs.push('Considera usar más transporte público o bicicleta para trayectos cortos');
      if (parseNum(transporte.vuelosCortos) + parseNum(transporte.vuelosMedios) > 2) {
        recs.push('Reduce los vuelos cuando sea posible, el tren es una alternativa con mucha menos huella');
      }
    }
    if (categorias[0].nombre === 'hogar' && resultados.hogar > 1) {
      recs.push('Mejora el aislamiento de tu hogar y usa electrodomésticos eficientes (A+++)');
      recs.push('Considera cambiar a energía renovable con tu compañía eléctrica');
    }
    if (categorias[0].nombre === 'alimentacion' && alimentacion.tipoDieta === 'alta') {
      recs.push('Reducir el consumo de carne roja tiene un gran impacto positivo');
    }
    if (!alimentacion.productosLocales) {
      recs.push('Prioriza productos locales y de temporada');
    }
    if (!consumo.recicla) {
      recs.push('Reciclar correctamente puede reducir tu huella de consumo hasta un 20%');
    }
    if (parseNum(consumo.ropaNueva) > 20) {
      recs.push('Considera comprar ropa de segunda mano o reducir compras impulsivas');
    }

    return recs.slice(0, 4);
  };

  const chartData = resultados ? {
    labels: ['Transporte', 'Hogar', 'Alimentación', 'Consumo'],
    datasets: [{
      data: [
        resultados.transporte,
        resultados.hogar,
        resultados.alimentacion,
        resultados.consumo,
      ],
      backgroundColor: [
        '#2E86AB',
        '#48A9A6',
        '#7FB3D3',
        '#A3D5D3',
      ],
      borderWidth: 0,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { label: string; raw: number }) => {
            return `${context.label}: ${formatNumber(context.raw, 2)} t CO₂`;
          },
        },
      },
    },
  };

  const barData = {
    labels: ['Tu huella', 'Media España', 'Objetivo sostenible'],
    datasets: [{
      data: [resultados?.total || 0, MEDIA_ESPANA, OBJETIVO_SOSTENIBLE],
      backgroundColor: ['#2E86AB', '#999999', '#48A9A6'],
      borderRadius: 8,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { raw: number }) => `${formatNumber(context.raw, 2)} t CO₂/año`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(10, (resultados?.total || 0) * 1.2),
        title: { display: true, text: 'Toneladas CO₂/año' },
      },
    },
  };

  const reiniciar = () => {
    setTransporte({
      kmCoche: '',
      tipoCoche: 'gasolina',
      kmMoto: '',
      kmBus: '',
      kmMetro: '',
      kmTren: '',
      vuelosCortos: '',
      vuelosMedios: '',
      vuelosLargos: '',
    });
    setHogar({
      electricidadMensual: '',
      gasNatural: '',
      butanoKg: '',
      personasHogar: '1',
    });
    setAlimentacion({
      tipoDieta: 'media',
      productosLocales: false,
    });
    setConsumo({
      ropaNueva: '',
      movilesAnio: '',
      ordenadoresAnio: '',
      recicla: false,
    });
    setResultados(null);
    setCalculado(false);
    setSeccionActiva(0);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🌍</span>
        <h1 className={styles.title}>Calculadora de Huella de Carbono</h1>
        <p className={styles.subtitle}>
          Descubre cuánto CO₂ generas al año y cómo reducir tu impacto ambiental
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Navegación de secciones */}
        <div className={styles.seccionNav}>
          {secciones.map((seccion, index) => (
            <button
              key={seccion}
              className={`${styles.seccionBtn} ${seccionActiva === index ? styles.seccionActiva : ''}`}
              onClick={() => setSeccionActiva(index)}
            >
              <span className={styles.seccionNumero}>{index + 1}</span>
              {seccion}
            </button>
          ))}
        </div>

        {/* Sección Transporte */}
        {seccionActiva === 0 && (
          <div className={styles.seccionPanel}>
            <h2 className={styles.seccionTitulo}>🚗 Transporte</h2>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Kilómetros en coche al año</label>
              <div className={styles.inputRow}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={transporte.kmCoche}
                  onChange={(e) => setTransporte({ ...transporte, kmCoche: e.target.value })}
                  placeholder="0"
                />
                <select
                  className={styles.select}
                  value={transporte.tipoCoche}
                  onChange={(e) => setTransporte({ ...transporte, tipoCoche: e.target.value as DatosTransporte['tipoCoche'] })}
                >
                  <option value="ninguno">No tengo coche</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="diesel">Diésel</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="electrico">Eléctrico</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Kilómetros en moto al año</label>
              <input
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={transporte.kmMoto}
                onChange={(e) => setTransporte({ ...transporte, kmMoto: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Km en bus/año</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={transporte.kmBus}
                  onChange={(e) => setTransporte({ ...transporte, kmBus: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Km en metro/año</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={transporte.kmMetro}
                  onChange={(e) => setTransporte({ ...transporte, kmMetro: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Km en tren/año</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={transporte.kmTren}
                  onChange={(e) => setTransporte({ ...transporte, kmTren: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <h3 className={styles.subtitulo}>✈️ Vuelos (ida y vuelta)</h3>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Cortos (&lt;1500km)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={transporte.vuelosCortos}
                  onChange={(e) => setTransporte({ ...transporte, vuelosCortos: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Medios (1500-4000km)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={transporte.vuelosMedios}
                  onChange={(e) => setTransporte({ ...transporte, vuelosMedios: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Largos (&gt;4000km)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={transporte.vuelosLargos}
                  onChange={(e) => setTransporte({ ...transporte, vuelosLargos: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sección Hogar */}
        {seccionActiva === 1 && (
          <div className={styles.seccionPanel}>
            <h2 className={styles.seccionTitulo}>🏠 Hogar</h2>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Consumo eléctrico mensual (kWh)</label>
              <input
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={hogar.electricidadMensual}
                onChange={(e) => setHogar({ ...hogar, electricidadMensual: e.target.value })}
                placeholder="Ej: 250"
              />
              <span className={styles.helperText}>Consulta tu factura de la luz</span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Gas natural mensual (m³)</label>
              <input
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={hogar.gasNatural}
                onChange={(e) => setHogar({ ...hogar, gasNatural: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Butano mensual (kg)</label>
              <input
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={hogar.butanoKg}
                onChange={(e) => setHogar({ ...hogar, butanoKg: e.target.value })}
                placeholder="0"
              />
              <span className={styles.helperText}>Una bombona estándar = 12,5 kg</span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Personas en el hogar</label>
              <select
                className={styles.select}
                value={hogar.personasHogar}
                onChange={(e) => setHogar({ ...hogar, personasHogar: e.target.value })}
              >
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
                <option value="5">5+ personas</option>
              </select>
              <span className={styles.helperText}>El consumo del hogar se divide entre los habitantes</span>
            </div>
          </div>
        )}

        {/* Sección Alimentación */}
        {seccionActiva === 2 && (
          <div className={styles.seccionPanel}>
            <h2 className={styles.seccionTitulo}>🍽️ Alimentación</h2>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Tipo de dieta</label>
              <select
                className={styles.select}
                value={alimentacion.tipoDieta}
                onChange={(e) => setAlimentacion({ ...alimentacion, tipoDieta: e.target.value as DatosAlimentacion['tipoDieta'] })}
              >
                <option value="alta">Alta en carne (carne roja casi a diario)</option>
                <option value="media">Omnívora equilibrada (carne 3-4 veces/semana)</option>
                <option value="baja">Flexitariana (poca carne, 1-2 veces/semana)</option>
                <option value="vegetariana">Vegetariana</option>
                <option value="vegana">Vegana</option>
              </select>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={alimentacion.productosLocales}
                  onChange={(e) => setAlimentacion({ ...alimentacion, productosLocales: e.target.checked })}
                />
                <span className={styles.checkmark}></span>
                Consumo principalmente productos locales y de temporada
              </label>
            </div>

            <div className={styles.infoBox}>
              <p>La producción de alimentos representa aproximadamente el 25% de las emisiones globales de CO₂. La carne de vacuno tiene el mayor impacto.</p>
            </div>
          </div>
        )}

        {/* Sección Consumo */}
        {seccionActiva === 3 && (
          <div className={styles.seccionPanel}>
            <h2 className={styles.seccionTitulo}>🛒 Consumo</h2>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Prendas de ropa nuevas al año</label>
              <input
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={consumo.ropaNueva}
                onChange={(e) => setConsumo({ ...consumo, ropaNueva: e.target.value })}
                placeholder="Ej: 20"
              />
            </div>

            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Móviles nuevos/año</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={consumo.movilesAnio}
                  onChange={(e) => setConsumo({ ...consumo, movilesAnio: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Ordenadores nuevos/año</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={consumo.ordenadoresAnio}
                  onChange={(e) => setConsumo({ ...consumo, ordenadoresAnio: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={consumo.recicla}
                  onChange={(e) => setConsumo({ ...consumo, recicla: e.target.checked })}
                />
                <span className={styles.checkmark}></span>
                Reciclo correctamente (papel, vidrio, plástico, orgánico)
              </label>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className={styles.botonesNav}>
          {seccionActiva > 0 && (
            <button
              className={styles.btnSecondary}
              onClick={() => setSeccionActiva(seccionActiva - 1)}
            >
              ← Anterior
            </button>
          )}
          {seccionActiva < 3 ? (
            <button
              className={styles.btnPrimary}
              onClick={() => setSeccionActiva(seccionActiva + 1)}
            >
              Siguiente →
            </button>
          ) : (
            <button
              className={styles.btnPrimary}
              onClick={calcularHuella}
            >
              🌍 Calcular mi huella
            </button>
          )}
        </div>

        {/* Resultados */}
        {resultados && (
          <div className={styles.resultados} ref={chartRef}>
            <h2 className={styles.resultadosTitulo}>Tu Huella de Carbono</h2>

            <div className={styles.totalCard}>
              <div className={styles.totalValor}>
                {formatNumber(resultados.total, 2)}
              </div>
              <div className={styles.totalUnidad}>toneladas CO₂/año</div>
              <div className={`${styles.totalComparacion} ${getComparacion(resultados.total).clase}`}>
                {getComparacion(resultados.total).texto}
              </div>
            </div>

            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <h3>Desglose por categoría</h3>
                <div className={styles.chartWrapper}>
                  {chartData && <Doughnut data={chartData} options={chartOptions as never} />}
                </div>
              </div>
              <div className={styles.chartCard}>
                <h3>Comparativa</h3>
                <div className={styles.chartWrapperBar}>
                  <Bar data={barData} options={barOptions as never} />
                </div>
              </div>
            </div>

            <div className={styles.desgloseCards}>
              <div className={styles.desgloseCard}>
                <span className={styles.desgloseIcon}>🚗</span>
                <span className={styles.desgloseCategoria}>Transporte</span>
                <span className={styles.desgloseValor}>{formatNumber(resultados.transporte, 2)} t</span>
              </div>
              <div className={styles.desgloseCard}>
                <span className={styles.desgloseIcon}>🏠</span>
                <span className={styles.desgloseCategoria}>Hogar</span>
                <span className={styles.desgloseValor}>{formatNumber(resultados.hogar, 2)} t</span>
              </div>
              <div className={styles.desgloseCard}>
                <span className={styles.desgloseIcon}>🍽️</span>
                <span className={styles.desgloseCategoria}>Alimentación</span>
                <span className={styles.desgloseValor}>{formatNumber(resultados.alimentacion, 2)} t</span>
              </div>
              <div className={styles.desgloseCard}>
                <span className={styles.desgloseIcon}>🛒</span>
                <span className={styles.desgloseCategoria}>Consumo</span>
                <span className={styles.desgloseValor}>{formatNumber(resultados.consumo, 2)} t</span>
              </div>
            </div>

            {getRecomendaciones().length > 0 && (
              <div className={styles.recomendaciones}>
                <h3>💡 Recomendaciones personalizadas</h3>
                <ul>
                  {getRecomendaciones().map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className={styles.btnReiniciar} onClick={reiniciar}>
              🔄 Calcular de nuevo
            </button>
          </div>
        )}
      </div>

      <DisclaimerCard
        variant="educational"
        severity="critical"
        context="calculadora-huella-carbono"
        collapsible={false}
      >
        <p>Esta calculadora proporciona una <strong>estimación orientativa</strong> basada en factores de emisión medios (fuentes: MITECO, ICAO, ADEME). Los valores reales varían según tu ubicación, proveedor de energía y hábitos específicos.</p>
      </DisclaimerCard>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre la huella de carbono?"
        subtitle="Descubre qué es, cómo se calcula y las mejores estrategias para reducirla"
        icon="🌿"
      >
        {/* ── SECCIÓN 1: TABLA COMPARATIVA ── */}
        <section>
          <h3>📊 Comparativa de Emisiones por Actividad y Categoría</h3>
          <p>Datos reales para entender qué opciones tienen mayor impacto en tu huella de carbono:</p>

          <h4 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🚗 Transporte (kg CO₂ por km recorrido)</h4>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Medio de transporte</th>
                  <th>kg CO₂/km</th>
                  <th>Equivalente anual (15.000 km)</th>
                  <th>Índice vs. coche gasolina</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>✈️ Avión (corto, &lt;1.500 km)</td>
                  <td>0,255 kg</td>
                  <td>3.825 kg</td>
                  <td>121% más</td>
                </tr>
                <tr>
                  <td>🚗 Coche diésel</td>
                  <td>0,170 kg</td>
                  <td>2.550 kg</td>
                  <td>19% menos</td>
                </tr>
                <tr>
                  <td>🚗 Coche gasolina</td>
                  <td>0,210 kg</td>
                  <td>3.150 kg</td>
                  <td>referencia</td>
                </tr>
                <tr>
                  <td>🚗 Coche híbrido</td>
                  <td>0,120 kg</td>
                  <td>1.800 kg</td>
                  <td>43% menos</td>
                </tr>
                <tr>
                  <td>⚡ Coche eléctrico (mix ES 2024)</td>
                  <td>0,050 kg</td>
                  <td>750 kg</td>
                  <td>76% menos</td>
                </tr>
                <tr>
                  <td>🚌 Autobús interurbano</td>
                  <td>0,089 kg</td>
                  <td>1.335 kg</td>
                  <td>58% menos</td>
                </tr>
                <tr>
                  <td>🚄 Tren AVE/Cercanías</td>
                  <td>0,041 kg</td>
                  <td>615 kg</td>
                  <td>80% menos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🥗 Alimentación (t CO₂ por persona y año)</h4>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Tipo de dieta</th>
                  <th>t CO₂/año</th>
                  <th>% de la huella media española</th>
                  <th>Ahorro vs. omnívora alta</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🥩 Omnívora alta en carne roja</td>
                  <td>3,3 t</td>
                  <td>44% de 7,5 t</td>
                  <td>referencia</td>
                </tr>
                <tr>
                  <td>🍽️ Omnívora equilibrada</td>
                  <td>2,5 t</td>
                  <td>33%</td>
                  <td>−24%</td>
                </tr>
                <tr>
                  <td>🐟 Flexitariana (menos carne)</td>
                  <td>1,7 t</td>
                  <td>23%</td>
                  <td>−48%</td>
                </tr>
                <tr>
                  <td>🥦 Vegetariana</td>
                  <td>1,2 t</td>
                  <td>16%</td>
                  <td>−64%</td>
                </tr>
                <tr>
                  <td>🌱 Vegana</td>
                  <td>0,9 t</td>
                  <td>12%</td>
                  <td>−73%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🏠 Calefacción del hogar (kg CO₂ por kWh térmico producido)</h4>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Sistema de calefacción</th>
                  <th>kg CO₂/kWh térmico</th>
                  <th>Coste energético relativo</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🔥 Caldera de gas natural</td>
                  <td>0,202 kg</td>
                  <td>medio</td>
                  <td>Rendimiento ~98% (condensación)</td>
                </tr>
                <tr>
                  <td>🛢️ Gasoil / Gasóleo C</td>
                  <td>0,287 kg</td>
                  <td>variable (precio petróleo)</td>
                  <td>En desuso en zonas urbanas</td>
                </tr>
                <tr>
                  <td>⚡ Resistencia eléctrica</td>
                  <td>0,250 kg</td>
                  <td>alto (precio kWh)</td>
                  <td>Rendimiento 100% → COP 1</td>
                </tr>
                <tr>
                  <td>♨️ Bomba de calor aerotérmica</td>
                  <td>0,062 kg</td>
                  <td>bajo (COP 3-4)</td>
                  <td>Por cada kWh eléctrico produce 3-4 kWh calor</td>
                </tr>
                <tr>
                  <td>🌞 Aerotermia + energía solar</td>
                  <td>~0 kg</td>
                  <td>mínimo (amortización paneles)</td>
                  <td>Combinación óptima actual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: CASOS DE USO (4 PERFILES) ── */}
        <section>
          <h3>👥 Casos de Uso: 4 Perfiles Reales</h3>
          <p>Situaciones concretas en las que esta calculadora aporta valor accionable:</p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🚗</span>
              <h4>Familia con dos coches</h4>
              <p><strong>Situación:</strong> Matrimonio con dos hijos, dos coches de gasolina, 25.000 km/año entre ambos. Quieren reducir su huella.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted, #999)' }}><strong>Qué descubren:</strong> Cambiar uno de los coches a eléctrico ahorra ~1,6 t CO₂/año. Sustituir un viaje en avión de vacaciones por tren ahorra otras 0,5-0,9 t. Con dos cambios concretos reducen su huella familiar un 20-25%.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>✈️</span>
              <h4>Profesional viajero</h4>
              <p><strong>Situación:</strong> Consultor que vuela 8-10 veces/año por trabajo (4 vuelos cortos, 3 medios, 2 largos). Su empresa quiere calcular la huella corporativa.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted, #999)' }}><strong>Qué descubren:</strong> Solo en vuelos emite ~9,5 t CO₂/año — más que la media española entera. Sustituir 3 vuelos cortos por reuniones telemáticas ahorra ~1 t. Para el resto, compensación con Gold Standard: ~190€/año.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🥗</span>
              <h4>Persona evaluando cambio de dieta</h4>
              <p><strong>Situación:</strong> Persona con dieta omnívora alta en carne que considera reducir su consumo por razones medioambientales, sin saber si tiene impacto real.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted, #999)' }}><strong>Qué descubren:</strong> Pasar de 3,3 t a 1,7 t CO₂/año (dieta flexitariana) ahorra más que no conducir durante 7-8 meses. Eliminar carne de vacuno 4 días/semana ya reduce la huella alimentaria un 35%.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🏢</span>
              <h4>Empresa buscando compensar</h4>
              <p><strong>Situación:</strong> Pyme de 15 empleados que quiere calcular su huella corporativa Scope 1+2 para compensarla y comunicarlo a clientes.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted, #999)' }}><strong>Qué descubren:</strong> Huella media por empleado ~5-8 t. Total empresa: 75-120 t CO₂/año. Compensación certificada: 1.500-3.600€/año. Primero: reducir electricidad con renovables y optimizar desplazamientos (reducción del 30-40% antes de compensar).</p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ (8 PREGUNTAS) ── */}
        <section>
          <h3>❓ Preguntas Frecuentes (FAQ) — Huella de Carbono</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es la huella de carbono media de un español?</summary>
              <p className={styles.eduFaqAnswer}>La huella media por persona en España es de <strong>7-8 toneladas de CO₂ equivalente al año</strong> (dato 2024, Ministerio para la Transición Ecológica — MITECO). Incluye transporte, hogar, alimentación y consumo. Esta cifra es significativamente superior al objetivo de sostenibilidad climática de 2 t/persona/año marcado por el IPCC para 2050. España se sitúa ligeramente por encima de la media europea (6,4 t), principalmente por el mayor peso del transporte y el turismo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué actividad individual tiene más impacto en la huella personal?</summary>
              <p className={styles.eduFaqAnswer}>Para la mayoría de españoles, <strong>el transporte aéreo</strong> es la actividad individual de mayor impacto cuando se realiza. Un solo vuelo Madrid-Nueva York (i/v) emite ~2.500 kg CO₂e — el 33% de la huella anual media. Sin embargo, para quienes no vuelan, <strong>el tipo de dieta</strong> suele ser el factor más relevante: pasar de dieta omnívora alta en carne a flexitariana ahorra 1,6 t/año. El transporte en coche ocupa el tercer lugar en impacto per cápita.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es la compensación de carbono y realmente funciona?</summary>
              <p className={styles.eduFaqAnswer}>La <strong>compensación de carbono</strong> (carbon offsetting) consiste en financiar proyectos que capturan o evitan emisiones equivalentes a las que no puedes reducir. Funciona cuando los proyectos son verificados por estándares independientes como <strong>Gold Standard, VCS (Verra) o Plan Vivo</strong>. No funciona bien con proyectos de baja calidad (reforestación de monocultivos, proyectos que habrían ocurrido de todas formas). La secuencia correcta es: primero medir, luego reducir todo lo posible, finalmente compensar lo que no se puede reducir. Compensar sin reducir es greenwashing.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es la diferencia entre huella de carbono y huella ecológica?</summary>
              <p className={styles.eduFaqAnswer}>La <strong>huella de carbono</strong> mide exclusivamente las emisiones de gases de efecto invernadero (GEI), expresadas en kg o toneladas de CO₂ equivalente. La <strong>huella ecológica</strong> es un concepto más amplio que mide cuánta superficie productiva de la Tierra (en hectáreas globales, gha) se necesita para sostener el estilo de vida de una persona, incluyendo uso de agua, suelo, biodiversidad y absorción de residuos. Un español tiene una huella ecológica de ~4,4 gha/persona, cuando solo hay disponibles ~1,6 gha por persona en el planeta.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cómo reduce la huella cambiar a un coche eléctrico en España?</summary>
              <p className={styles.eduFaqAnswer}>Con el mix eléctrico español de 2024 (intensidad media ~0,25 kg CO₂/kWh), un coche eléctrico emite <strong>unos 50 g CO₂/km</strong>, frente a los ~120-210 g/km de un gasolina compacto. Esto supone una reducción del 60-75% en emisiones de uso. Para 15.000 km/año: pasar de ~3.150 kg CO₂ (gasolina) a ~750 kg CO₂ (eléctrico) = ahorro de 2.400 kg/año. Además, a medida que la red eléctrica española incorpora más renovables (objetivo 81% en 2030), el eléctrico mejora automáticamente sin cambiar el vehículo. La huella de fabricación de la batería (~8-12 t) se amortiza en 3-4 años de uso.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿El avión es siempre más contaminante que el tren?</summary>
              <p className={styles.eduFaqAnswer}>En prácticamente todos los trayectos con alternativa ferroviaria, <strong>sí</strong>. Madrid-Barcelona: avión ~90 kg CO₂/pasajero vs. AVE ~6 kg (15 veces menos). Madrid-París: avión ~200 kg vs. tren de noche ~45 kg. La diferencia se amplía cuando consideramos el <strong>efecto radiativo de las contrails</strong> (estelas de condensación) del avión, que multiplican su impacto climático ×2-3 a efectos de calentamiento global, aunque esto no siempre se refleja en los cálculos de CO₂ puro. Solo en trayectos sin alternativa ferroviaria viable (más de 6-7 horas de tren) la elección es más difícil.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué significa ser &quot;neutro en carbono&quot;?</summary>
              <p className={styles.eduFaqAnswer}>Una persona, empresa o producto es <strong>neutro en carbono</strong> (carbon neutral) cuando sus emisiones netas de CO₂ equivalente son cero. Esto se puede lograr de dos formas: eliminando completamente todas las emisiones (muy difícil en la práctica) o combinando <strong>reducciones máximas de emisiones</strong> con <strong>compensación certificada del resto</strong>. Existe también el concepto más exigente de <strong>&quot;net zero&quot;</strong> (emisiones netas cero según ISO 14068), que requiere reducir al menos el 90% antes de compensar. &quot;Carbono negativo&quot; significa absorber más CO₂ del que se emite.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuántos árboles compensan 1 tonelada de CO₂?</summary>
              <p className={styles.eduFaqAnswer}>Un árbol adulto en crecimiento activo absorbe entre <strong>10 y 40 kg de CO₂ al año</strong> (dependiendo de especie, clima y suelo). Un pino adulto en España absorbe ~20 kg/año. Para compensar 1 tonelada de CO₂ en 1 año harían falta unos <strong>50 árboles</strong> absorbiendo simultáneamente. Para compensar la huella media española (7,5 t) necesitarías ~375 árboles durante un año completo, o equivalentemente plantar un bosque de ~1.500 m². La reforestación es necesaria pero insuficiente a escala global: no puede absorber el ritmo actual de emisiones, por eso la reducción directa es imprescindible.</p>
            </details>
          </div>
        </section>

        {/* ── SECCIÓN 4: GUÍA PASO A PASO (7 PASOS) ── */}
        <section>
          <h3>📋 Cómo Reducir tu Huella un 30-50% en 12 Meses (7 Pasos)</h3>
          <ol className={styles.eduStepsList}>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>1</span>
              <div>
                <strong>Calcula tu huella actual (línea de base)</strong>
                <p>Usa esta calculadora completando todas las secciones honestamente. Anota el resultado desglosado por categoría. Sin línea de base, no puedes medir el progreso. Guarda el PDF o los datos para comparar en 6 y 12 meses.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>2</span>
              <div>
                <strong>Identifica tus 2-3 mayores focos de emisión</strong>
                <p>Usa el gráfico circular de resultados. Para la mayoría de españoles el ranking es: 1.º vuelos (si vuela), 2.º coche, 3.º alimentación. Concentra el esfuerzo donde el impacto es mayor — el 20% de las fuentes explica el 80% de la huella.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>3</span>
              <div>
                <strong>Elimina o sustituye el mayor foco (meses 1-3)</strong>
                <p>Un vuelo menos de larga distancia = −2.500 kg. Cambiar un coche gasolina por eléctrico = −2.400 kg/año. Estos son los cambios de mayor palanca. Si el cambio no es posible inmediatamente, planifícalo (cambio de coche en próxima renovación, alternativa tren en próximas vacaciones).</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>4</span>
              <div>
                <strong>Reduce la huella del hogar (meses 2-4)</strong>
                <p>Cambia a tarifa eléctrica de origen 100% renovable (mismo coste, distinto contrato — busca comercializadoras con Garantía de Origen). Ajusta el termostato: 20°C en invierno y 26°C en verano. Cada grado de diferencia ahorra un 7% de energía. Considera bomba de calor al renovar la caldera.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>5</span>
              <div>
                <strong>Ajusta la dieta progresivamente (meses 3-6)</strong>
                <p>Objetivo mínimo impactante: reducir carne de vacuno a 1-2 veces/semana (en lugar de diaria). Esto solo ya supone −600 a −800 kg CO₂/año. En meses siguientes añade: 3 días sin carne a la semana (dieta flexitariana). No es necesario el veganismo para un impacto significativo.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>6</span>
              <div>
                <strong>Calcula lo que no puedes reducir y compénsalo</strong>
                <p>Para emisiones inevitables (vuelo laboral ineludible, calefacción en invierno extremo, desplazamientos sin alternativa), calcula el CO₂ equivalente y compénsalo con proyectos certificados. Precio justo: 10-30 €/tonelada. Para 7,5 t/año = 75-225 €/año. Busca: Atmosfair, ClimateTrade, South Pole (todos con certificaciones verificadas).</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>7</span>
              <div>
                <strong>Mide de nuevo y ajusta el plan (mes 12)</strong>
                <p>Repite el cálculo con los hábitos actuales. Compara con la línea de base. Una reducción del 30-50% en 12 meses es realista si has actuado sobre los dos principales focos. Establece el siguiente objetivo: muchas personas que alcanzan −30% descubren que −50% es posible al año siguiente con cambios adicionales ya normalizados.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: MEJORES PRÁCTICAS (6 TIPS) ── */}
        <section>
          <h3>💡 6 Cambios de Alto Impacto (Accionables Hoy)</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>✈️</span>
              <h4>Sustituye vuelos por tren</h4>
              <p>En trayectos de hasta 4-5 horas, el tren es 10-20 veces menos contaminante. Madrid-Barcelona en AVE: 6 kg CO₂ vs. 90 kg en avión. Madrid-París en tren nocturno: 45 kg vs. 200 kg. Ahorro: 80-90% por viaje.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🥩</span>
              <h4>Dieta plant-based 3 días/semana</h4>
              <p>No hace falta ser vegetariano. Solo reducir carne de vacuno a 2 días/semana ya ahorra ~600 kg CO₂/año. 3 días sin carne = dieta flexitariana = −1.600 kg CO₂/año vs. dieta alta en carne. Más impacto que no conducir 4 meses.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌡️</span>
              <h4>Ajusta el termostato 1-2°C</h4>
              <p>Bajar de 22°C a 20°C en invierno reduce el consumo de calefacción un 14%. En verano, subir de 24°C a 26°C ahorra un 14% de aire acondicionado. Con caldera de gas de consumo medio: −120 a −200 kg CO₂/año.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>⚡</span>
              <h4>Cambia a proveedor de energía verde</h4>
              <p>Contratar electricidad con Garantía de Origen renovable tiene un coste similar a la tarifa convencional. Reduce la huella eléctrica del hogar hasta un 90%. Busca comercializadoras como Holaluz, Naturgy Verde, Iberdrola con GdO certificado por CNMC.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🚗</span>
              <h4>Comparte el coche o usa transporte público</h4>
              <p>Compartir coche (carpool) con 2 personas divide la huella por 2 sin cambiar de vehículo. Si es factible, transporte público en desplazamientos diarios: el metro emite 33 g CO₂/km vs. 210 g del coche gasolina. Ahorro anual (30 km/día, 220 días): −1.140 kg CO₂.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>♻️</span>
              <h4>Extiende la vida útil de dispositivos</h4>
              <p>Usar un smartphone 1 año más reduce su huella total un 25% (la fabricación es el 70% de su huella de ciclo de vida). Un portátil dura idealmente 5-7 años. Comprar de segunda mano evita ~300-500 kg CO₂ de huella embebida de fabricación.</p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: WARNING BOX — ERRORES COMUNES ── */}
        <section>
          <div className={styles.eduWarningBox}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <div>
              <strong>6 Errores que Dan una Falsa Sensación de Sostenibilidad</strong>
              <ul>
                <li><strong>Calcular la huella sin incluir los vuelos:</strong> Los vuelos pueden representar el 30-60% de la huella personal. Omitirlos da una imagen irreal y lleva a priorizar acciones de mucho menor impacto (reciclaje, bolsas reutilizables) mientras se ignora la fuente principal.</li>
                <li><strong>Compensar sin reducir primero:</strong> Pagar compensaciones sin haber reducido emisiones es la definición de greenwashing personal. La jerarquía correcta es siempre: medir → reducir al máximo → compensar solo lo residual inevitable.</li>
                <li><strong>Confundir reciclaje con impacto real en CO₂:</strong> El reciclaje tiene un impacto del 1-5% en la huella total. Es importante, pero no compensa vuelos, dieta cárnica alta o calefacción con gas. Priorizar reciclaje sobre cambios de dieta o transporte es un error de proporciones frecuente.</li>
                <li><strong>Comprar productos &quot;eco&quot; sin verificar:</strong> El greenwashing existe en todos los sectores. Un producto &quot;neutro en carbono&quot; sin certificación verificable de terceros (Gold Standard, VCS, Carbon Footprint) no garantiza nada. Exige documentación antes de pagar extra por sostenibilidad.</li>
                <li><strong>Ignorar la huella embebida de los productos:</strong> La calculadora mide emisiones operacionales, no la huella embebida (fabricación de tu ropa, muebles, coche, electrodomésticos). El consumismo —comprar más cosas nuevas innecesarias— tiene un impacto enorme que no aparece en el cálculo de hábitos cotidianos.</li>
                <li><strong>Pensar que el impacto individual no importa:</strong> El argumento &quot;yo solo no cambio nada&quot; ignora el efecto agregado y la influencia en decisiones de compra, voto y norma social. La descarbonización de la economía requiere tanto cambios sistémicos como cambios en la demanda individual que los impulsa.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CONTENIDO ORIGINAL ── */}
        <section className={styles.guideSection}>
          <h2>¿Qué es la huella de carbono?</h2>
          <p className={styles.introParagraph}>
            La huella de carbono es la cantidad total de gases de efecto invernadero (GEI) que se emiten directa o indirectamente
            por nuestras actividades cotidianas. Se mide en toneladas de CO₂ equivalente (t CO₂e) e incluye no solo el dióxido
            de carbono, sino también otros gases como el metano (CH₄) y el óxido nitroso (N₂O).
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🌡️ ¿Por qué importa?</h4>
              <p>
                El exceso de GEI en la atmósfera provoca el calentamiento global. Para limitar el aumento de temperatura
                a 1,5°C, cada persona debería emitir máximo 2 toneladas de CO₂ al año. La media española actual es de 7,5 toneladas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Principales fuentes</h4>
              <p>
                En España, el transporte representa el 27% de las emisiones, seguido del sector industrial (24%),
                generación eléctrica (17%), agricultura (12%) y sector residencial (10%).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 Objetivo 2030</h4>
              <p>
                La Unión Europea se ha comprometido a reducir sus emisiones un 55% para 2030 respecto a 1990,
                y alcanzar la neutralidad climática para 2050.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🌱 Acciones individuales</h4>
              <p>
                Aunque las grandes empresas son responsables de la mayoría de emisiones, las acciones individuales
                suman y pueden influir en políticas y mercados a través de la demanda.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Factores de emisión utilizados</h2>
          <p>Esta calculadora utiliza factores de emisión de fuentes oficiales españolas y europeas:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.factoresTable}>
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Factor de emisión</th>
                  <th>Origen</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Coche gasolina</td>
                  <td>0,21 kg CO₂/km</td>
                  <td>MITECO</td>
                </tr>
                <tr>
                  <td>Coche eléctrico</td>
                  <td>0,05 kg CO₂/km</td>
                  <td>Mix eléctrico España</td>
                </tr>
                <tr>
                  <td>Vuelo largo</td>
                  <td>1.800 kg CO₂/viaje</td>
                  <td>IPCC</td>
                </tr>
                <tr>
                  <td>Electricidad</td>
                  <td>0,25 kg CO₂/kWh</td>
                  <td>REE 2024</td>
                </tr>
                <tr>
                  <td>Gas natural</td>
                  <td>2,0 kg CO₂/m³</td>
                  <td>MITECO</td>
                </tr>
                <tr>
                  <td>Dieta omnívora</td>
                  <td>2.500 kg CO₂/año</td>
                  <td>Estudios europeos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Es preciso este cálculo?</h4>
              <p>
                Es una estimación basada en promedios. Tu huella real depende de factores específicos como
                el origen de tu electricidad, la eficiencia de tu vehículo o el tipo exacto de alimentos que consumes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué puedo hacer para compensar mis emisiones?</h4>
              <p>
                Primero, reduce lo que puedas. Después, puedes participar en programas de compensación de carbono
                que financian proyectos de reforestación o energías renovables. Asegúrate de que estén certificados.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué no incluís otras categorías?</h4>
              <p>
                Hemos incluido las principales fuentes de emisión personal. Otros factores como servicios públicos,
                infraestructuras o productos específicos son más difíciles de atribuir individualmente.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>🌍 Huella de Carbono por País: Comparativa Mundial</h3>
          <p>Perspectiva global de emisiones per cápita para contextualizar tu resultado:</p>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>País / Región</th>
                  <th>t CO₂/persona/año</th>
                  <th>Vs. objetivo 2°C</th>
                  <th>Principal fuente</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🇶🇦 Qatar</strong></td>
                  <td>35,6 t</td>
                  <td>18× el límite</td>
                  <td>Industria petrolífera</td>
                  <td>↑ Creciendo</td>
                </tr>
                <tr>
                  <td><strong>🇺🇸 EE.UU.</strong></td>
                  <td>14,4 t</td>
                  <td>7× el límite</td>
                  <td>Transporte + industria</td>
                  <td>↓ Bajando lento</td>
                </tr>
                <tr>
                  <td><strong>🇪🇺 Unión Europea</strong></td>
                  <td>6,4 t</td>
                  <td>3,2× el límite</td>
                  <td>Transporte + calefacción</td>
                  <td>↓ Bajando</td>
                </tr>
                <tr>
                  <td><strong>🇪🇸 España</strong></td>
                  <td>7,5 t</td>
                  <td>3,75× el límite</td>
                  <td>Transporte + turismo</td>
                  <td>↓ Bajando</td>
                </tr>
                <tr>
                  <td><strong>🇨🇳 China</strong></td>
                  <td>8,2 t</td>
                  <td>4,1× el límite</td>
                  <td>Carbón + industria</td>
                  <td>→ Estable/alto</td>
                </tr>
                <tr>
                  <td><strong>🌍 Media mundial</strong></td>
                  <td>4,7 t</td>
                  <td>2,35× el límite</td>
                  <td>Varía por región</td>
                  <td>→ Muy lento descenso</td>
                </tr>
                <tr>
                  <td><strong>🎯 Objetivo 2°C</strong></td>
                  <td>2,0 t</td>
                  <td>✓ Sostenible</td>
                  <td>—</td>
                  <td>Objetivo 2050</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 ¿Quién Usa las Calculadoras de Huella de Carbono?</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>👤</span>
              <h4>Ciudadanos y Familias</h4>
              <p>Identificar qué hábitos tienen más impacto para priorizar cambios. Muchas personas descubren que un vuelo transatlántico equivale a meses de uso del coche, o que cambiar la dieta tiene más impacto que el reciclaje.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🏢</span>
              <h4>Empresas y Pymes</h4>
              <p>Regulación europea de reporte de emisiones (CSRD) obliga a empresas a medir y publicar su huella desde 2025. Las calculadoras de Scope 1, 2 y 3 son el punto de partida para planes de descarbonización.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎓</span>
              <h4>Educación Ambiental</h4>
              <p>Profesores de secundaria y universidad usan calculadoras para que los estudiantes visualicen el impacto concreto de sus hábitos. Es más efectivo que hablar de &quot;millones de toneladas globales&quot; en abstracto.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🌿</span>
              <h4>Compensación y Offsets</h4>
              <p>Servicios como Atmosfair, Gold Standard o ClimateTrade usan calculadoras para determinar cuánto CO₂ compensar. Primero: medir. Segundo: reducir. Tercero: compensar el resto inevitable con proyectos verificados.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre Huella de Carbono</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es el CO₂ equivalente (CO₂e)?</summary>
              <p className={styles.eduFaqAnswer}>El <strong>CO₂ equivalente</strong> es una unidad que permite comparar el impacto climático de distintos gases de efecto invernadero usando el dióxido de carbono como referencia. El metano (CH₄) tiene un potencial de calentamiento 28 veces mayor que el CO₂ en 100 años (GWP100). El óxido nitroso (N₂O), 265 veces. Así, 1 kg de metano = 28 kg CO₂e. Esto permite sumar todos los GEI en una sola cifra comparable.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿La compensación de carbono (carbon offsets) realmente funciona?</summary>
              <p className={styles.eduFaqAnswer}>Depende mucho del proyecto. Los offsets de <strong>calidad certificada</strong> (Gold Standard, VCS, Plan Vivo) que financian reforestación con comunidades locales, energías renovables en países en desarrollo o captura de metano tienen impacto real. Los offsets de baja calidad (reforestación de monocultivos, proyectos que habrían ocurrido igualmente) son criticados como &quot;greenwashing&quot;. La regla: primero reducir, luego compensar solo lo que no se puede reducir.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué son los Scopes 1, 2 y 3 de emisiones?</summary>
              <p className={styles.eduFaqAnswer}>Es el estándar GHG Protocol para empresas: <strong>Scope 1</strong> = emisiones directas propias (combustión en instalaciones, flota de vehículos propia). <strong>Scope 2</strong> = emisiones indirectas de energía comprada (electricidad, calor, vapor). <strong>Scope 3</strong> = todas las demás emisiones de la cadena de valor (proveedores, transporte de empleados, uso del producto, fin de vida). El Scope 3 suele ser el 70-80% de la huella total de una empresa.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué impacto tiene realmente un vuelo?</summary>
              <p className={styles.eduFaqAnswer}>Un vuelo Madrid-Nueva York (ida y vuelta, ~11.000 km) emite aproximadamente <strong>1,8 toneladas de CO₂e por pasajero</strong>, incluyendo el efecto radiativo del vapor de agua en altura (que multiplica el impacto climático ×2-3 vs. emisiones en suelo). Esto equivale a conducir un coche de gasolina durante ~9.000 km o a la huella anual de alimentación de una persona vegana. Un vuelo largo puede representar el 30-50% de la huella anual de un español medio.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuánto CO₂ absorbe un árbol al año?</summary>
              <p className={styles.eduFaqAnswer}>Un árbol adulto en crecimiento activo absorbe entre <strong>10 y 40 kg de CO₂ al año</strong>, dependiendo de la especie, clima y condiciones de crecimiento. Un pino adulto en España absorbe ~20 kg/año. Para compensar 7,5 toneladas (huella media española) harían falta ~375 árboles absorbiendo durante 1 año. La reforestación es necesaria pero insuficiente por sí sola: no puede absorber el ritmo actual de emisiones globales.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Es el reciclaje realmente efectivo para reducir la huella?</summary>
              <p className={styles.eduFaqAnswer}>El reciclaje tiene impacto real pero <strong>menor de lo que mucha gente cree</strong>. Reciclar aluminio ahorra el 95% de la energía vs. aluminio virgen. Reciclar papel ahorra ~40%. Sin embargo, en el contexto de la huella personal total, el reciclaje suele representar solo un 1-5% del impacto. Los cambios más efectivos son: reducir vuelos, cambiar a coche eléctrico/transporte público y reducir consumo de carne roja — estos pueden reducir la huella un 20-50%.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es la &quot;huella embebida&quot; de los productos?</summary>
              <p className={styles.eduFaqAnswer}>La <strong>huella embebida</strong> (o huella del ciclo de vida) incluye todas las emisiones necesarias para fabricar un producto: extracción de materias primas, manufactura, transporte, distribución y fin de vida. Un smartphone tiene una huella embebida de ~70 kg CO₂e. Un coche eléctrico, ~8-12 toneladas en fabricación (que luego compensa en uso vs. gasolina). Esta calculadora solo cubre la huella operacional directa, no la huella embebida de todos los productos que consumimos.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuándo alcanzaremos la neutralidad climática en España?</summary>
              <p className={styles.eduFaqAnswer}>La <strong>Ley de Cambio Climático española (2021)</strong> establece neutralidad climática para 2050 y reducción del 23% de emisiones para 2030 vs. 1990. La UE apunta a -55% para 2030. A ritmo actual, España redujo ~20% sus emisiones entre 2005 y 2022, pero el ritmo necesario para 2030 requiere acelerarse significativamente. Los sectores con mayor reto: transporte (electrificación), agricultura (metano del ganado) y procesos industriales (acero, cemento).</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Plan de Acción para Reducir tu Huella de Carbono</h3>
          <ol className={styles.eduStepsList}>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>1</span>
              <div>
                <strong>Identifica tu mayor fuente de emisiones</strong>
                <p>Usa los gráficos de resultados para ver qué categoría pesa más en tu huella personal. Para la mayoría de españoles, el transporte (especialmente vuelos y coche) o la alimentación suelen ser las categorías dominantes.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>2</span>
              <div>
                <strong>Establece un objetivo realista a 12 meses</strong>
                <p>No intentes reducir todo a la vez. Elige 1-2 cambios de alto impacto: ¿puedes sustituir un vuelo por tren? ¿Reducir consumo de carne roja a 1 vez/semana? ¿Cambiar a tarifa de energía 100% renovable? Cada uno puede reducir tu huella un 10-20%.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>3</span>
              <div>
                <strong>Optimiza el transporte (mayor impacto)</strong>
                <p>Orden de impacto descendente: eliminar vuelos de ocio &gt; cambiar coche gasolina/diesel por eléctrico &gt; usar más transporte público &gt; teletrabajar &gt; compartir coche. Un vuelo transatlántico puede equivaler a 6 meses de conducción diaria.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>4</span>
              <div>
                <strong>Reduce la huella del hogar</strong>
                <p>Cambia a tarifa eléctrica de origen renovable (misma red, distinto contrato). Mejora el aislamiento térmico (subvenciones del PREE disponibles). Sustituye calderas de gas por bomba de calor aerotérmica (COP 3-4: por cada kWh eléctrico produce 3-4 kWh de calor).</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>5</span>
              <div>
                <strong>Ajusta la dieta de forma progresiva</strong>
                <p>No hace falta volverse vegano para tener impacto significativo. Pasar de dieta &quot;alta en carne&quot; a &quot;omnívora equilibrada&quot; (carne 3-4 veces/semana en vez de diaria) reduce la huella alimentaria un 24%. Sustituir carne roja por pollo o pescado también ayuda (vacuno emite 20× más que pollo por proteína).</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>6</span>
              <div>
                <strong>Compensa lo que no puedas reducir</strong>
                <p>Para emisiones inevitables (vuelo por trabajo, calefacción en invierno extremo), busca proyectos de compensación certificados con estándares Gold Standard o VCS. El precio justo de compensación es de 10-30€/tonelada CO₂. Para 7,5 t/año = 75-225€/año en offsets de calidad.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Hábitos de Alto Impacto para Reducir Emisiones</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>✈️</span>
              <h4>El tren vs. avión</h4>
              <p>Madrid-Barcelona en AVE emite ~6 kg CO₂/pasajero. En avión, ~90 kg. El tren es 15 veces menos contaminante en este trayecto y tarda solo 30 minutos más puerta a puerta.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🥩</span>
              <h4>La dieta importa más que el reciclaje</h4>
              <p>Eliminar la carne de vacuno de tu dieta reduce más emisiones que dejar de conducir durante 6 meses. 1 kg de carne de vacuno emite ~27 kg CO₂e vs. 2 kg CO₂e de lentejas.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>⚡</span>
              <h4>Energía renovable en casa</h4>
              <p>Cambiar a tarifa de electricidad 100% renovable tiene coste similar a convencional y reduce la huella del hogar hasta un 90% en la parte eléctrica. Busca comercializadoras con certificado de garantía de origen.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🚗</span>
              <h4>Coche eléctrico en España</h4>
              <p>Con el mix eléctrico español (2024), un coche eléctrico emite ~5 g CO₂/km vs. ~120 g de un gasolina compacto. A medida que la red se descarboniza, el eléctrico mejora automáticamente sin cambiar el vehículo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌡️</span>
              <h4>Ajusta el termostato</h4>
              <p>Bajar 1°C el termostato en invierno reduce el consumo de calefacción un 7%. De 22°C a 20°C = -14% de consumo. Subir 1°C el aire acondicionado en verano tiene el mismo efecto.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📱</span>
              <h4>Vida útil de dispositivos</h4>
              <p>Extender la vida de un smartphone 1 año más reduce su huella total un 25%. Comprar de segunda mano evita la huella embebida de fabricación (~70 kg CO₂e para un móvil, ~300 kg para un portátil).</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.eduWarningBox}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <div>
              <strong>Limitaciones de esta calculadora y errores comunes</strong>
              <ul>
                <li><strong>Es una estimación orientativa</strong>: Los factores de emisión reales varían según tu proveedor eléctrico, ruta específica de vuelo, eficiencia de tu vehículo y origen de los alimentos. La precisión real es de ±20-30%.</li>
                <li><strong>No incluye huella embebida</strong>: No se contabiliza el CO₂ necesario para fabricar tu ropa, muebles, electrodomésticos o infraestructura. La huella real de consumo es mayor que lo calculado.</li>
                <li><strong>Confundir CO₂ con CO₂e</strong>: Los vuelos tienen un impacto climático real 2-3 veces mayor que sus emisiones de CO₂ puro, por el efecto de contrails y vapor de agua en altitud. Esta calculadora usa factores que intentan aproximar CO₂e.</li>
                <li><strong>El greenwashing existe</strong>: No todos los productos &quot;neutros en carbono&quot; o &quot;compensados&quot; tienen el mismo rigor. Exige certificaciones de terceros (Gold Standard, VCS, Plan Vivo) antes de pagar por offsets.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-huella-carbono')} />
      <ShareCard appName="calculadora-huella-carbono" />
      <Footer appName="calculadora-huella-carbono" />
    </div>
  );
}
