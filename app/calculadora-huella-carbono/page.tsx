'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CalculadoraHuellaCarbono.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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
  // Vuelos (kg CO2 por vuelo ida y vuelta)
  vueloCorto: 250, // < 1500 km
  vueloMedio: 600, // 1500-4000 km
  vueloLargo: 1800, // > 4000 km
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

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>estimación orientativa</strong> basada en factores de emisión medios.
          Los valores reales pueden variar según tu ubicación, proveedor de energía y hábitos específicos.
          Para un cálculo más preciso, consulta con expertos en sostenibilidad.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre la huella de carbono?"
        subtitle="Descubre qué es, cómo se calcula y las mejores estrategias para reducirla"
        icon="🌿"
      >
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-huella-carbono')} />
      <ShareCard appName="calculadora-huella-carbono" />
      <Footer appName="calculadora-huella-carbono" />
    </div>
  );
}
