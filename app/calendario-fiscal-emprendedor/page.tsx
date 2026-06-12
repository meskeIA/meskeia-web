'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalendarioFiscal.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type TipoContribuyente = 'autonomo' | 'sociedad' | 'ambos';
type Trimestre = 1 | 2 | 3 | 4;

// Tipo de plazo trimestral
type TipoPlazoTrimestral = 'dia20' | 'dia30' | 'dia20_4t_enero' | 'dia20_4t_enero30' | 'modelo202';

// Tipo de plazo anual
type TipoPlazoAnual = 'enero30' | 'enero31' | 'febrero28' | 'julio1' | 'julio25';

interface ModeloFiscalConfig {
  id: string;
  nombre: string;
  descripcion: string;
  aplicaA: ('autonomo' | 'sociedad')[];
  periodicidad: 'trimestral' | 'anual';
  tipoPlazoTrimestral?: TipoPlazoTrimestral;
  tipoPlazoAnual?: TipoPlazoAnual;
  icon: string;
  importante: boolean;
}

interface ModeloFiscal extends ModeloFiscalConfig {
  fechasTrimestre: { [key: number]: string };
  fechaAnual?: string;
}

interface FechaFiscal {
  fecha: Date;
  modelo: ModeloFiscal;
  trimestre?: Trimestre;
  esAnual: boolean;
  descripcionPeriodo: string;
}

// ============================================
// FUNCIONES DE CÁLCULO DINÁMICO DE FECHAS
// ============================================

/**
 * Festivos nacionales fijos en España (se repiten cada año)
 * No incluimos festivos autonómicos/locales - el usuario debe verificar
 */
const FESTIVOS_NACIONALES_FIJOS = [
  { mes: 0, dia: 1 },   // 1 enero - Año Nuevo
  { mes: 0, dia: 6 },   // 6 enero - Reyes
  { mes: 4, dia: 1 },   // 1 mayo - Día del Trabajo
  { mes: 7, dia: 15 },  // 15 agosto - Asunción
  { mes: 9, dia: 12 },  // 12 octubre - Fiesta Nacional
  { mes: 10, dia: 1 },  // 1 noviembre - Todos los Santos
  { mes: 11, dia: 6 },  // 6 diciembre - Constitución
  { mes: 11, dia: 8 },  // 8 diciembre - Inmaculada
  { mes: 11, dia: 25 }, // 25 diciembre - Navidad
];

/**
 * Verifica si una fecha es fin de semana
 */
const esFinDeSemana = (fecha: Date): boolean => {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6; // Domingo = 0, Sábado = 6
};

/**
 * Verifica si una fecha es festivo nacional fijo
 */
const esFestivoNacional = (fecha: Date): boolean => {
  return FESTIVOS_NACIONALES_FIJOS.some(
    f => f.mes === fecha.getMonth() && f.dia === fecha.getDate()
  );
};

/**
 * Ajusta una fecha al siguiente día hábil si cae en fin de semana o festivo
 */
const ajustarADiaHabil = (fecha: Date): Date => {
  const resultado = new Date(fecha);
  while (esFinDeSemana(resultado) || esFestivoNacional(resultado)) {
    resultado.setDate(resultado.getDate() + 1);
  }
  return resultado;
};

/**
 * Calcula la fecha límite para un trimestre dado según el tipo de plazo
 * @param anio - Año fiscal del trimestre
 * @param trimestre - Número de trimestre (1-4)
 * @param tipoPlazo - Tipo de plazo aplicable
 */
const calcularFechaTrimestre = (
  anio: number,
  trimestre: Trimestre,
  tipoPlazo: TipoPlazoTrimestral
): Date => {
  let fecha: Date;

  switch (tipoPlazo) {
    case 'dia20':
      // Día 20 del mes siguiente al trimestre
      // 1T -> 20 abril, 2T -> 20 julio, 3T -> 20 octubre, 4T -> 20 enero (año+1)
      const mesesDia20 = [3, 6, 9, 0]; // abril=3, julio=6, octubre=9, enero=0
      const anioTrimestre = trimestre === 4 ? anio + 1 : anio;
      fecha = new Date(anioTrimestre, mesesDia20[trimestre - 1], 20);
      break;

    case 'dia30':
      // Día 30 del mes siguiente al trimestre
      // 1T -> 30 abril, 2T -> 30 julio, 3T -> 30 octubre, 4T -> 30 enero (año+1)
      const mesesDia30 = [3, 6, 9, 0];
      const anioTrimestre30 = trimestre === 4 ? anio + 1 : anio;
      fecha = new Date(anioTrimestre30, mesesDia30[trimestre - 1], 30);
      break;

    case 'dia20_4t_enero':
      // Día 20 para 1T-3T, día 20 enero para 4T (retenciones: 111, 115, 123)
      if (trimestre === 4) {
        fecha = new Date(anio + 1, 0, 20); // 20 enero año siguiente
      } else {
        const meses = [3, 6, 9];
        fecha = new Date(anio, meses[trimestre - 1], 20);
      }
      break;

    case 'dia20_4t_enero30':
      // Día 20 para 1T-3T, día 30 enero para 4T (IVA: 303, intracomunitarias: 349)
      if (trimestre === 4) {
        fecha = new Date(anio + 1, 0, 30); // 30 enero año siguiente
      } else {
        const meses303 = [3, 6, 9];
        fecha = new Date(anio, meses303[trimestre - 1], 20);
      }
      break;

    case 'modelo202':
      // Modelo 202: Abril (20), Octubre (20), Diciembre (20)
      // Solo tiene 3 plazos, no 4
      const meses202 = [3, 9, 11]; // abril, octubre, diciembre
      if (trimestre <= 3) {
        fecha = new Date(anio, meses202[trimestre - 1], 20);
      } else {
        // El 4T del 202 no existe, devolvemos fecha inválida que se filtrará
        fecha = new Date(NaN);
      }
      break;

    default:
      fecha = new Date(anio, 3, 20); // Por defecto abril 20
  }

  return ajustarADiaHabil(fecha);
};

/**
 * Calcula la fecha límite para una declaración anual
 * @param anioEjercicio - Año del ejercicio fiscal que se declara
 * @param tipoPlazo - Tipo de plazo aplicable
 */
const calcularFechaAnual = (anioEjercicio: number, tipoPlazo: TipoPlazoAnual): Date => {
  let fecha: Date;
  const anioPresentacion = anioEjercicio + 1; // Se presenta al año siguiente

  switch (tipoPlazo) {
    case 'enero30':
      fecha = new Date(anioPresentacion, 0, 30);
      break;
    case 'enero31':
      fecha = new Date(anioPresentacion, 0, 31);
      break;
    case 'febrero28':
      // Último día de febrero (puede ser 28 o 29 en bisiesto)
      fecha = new Date(anioPresentacion, 2, 0); // Día 0 de marzo = último de febrero
      break;
    case 'julio1':
      fecha = new Date(anioPresentacion, 6, 1);
      break;
    case 'julio25':
      fecha = new Date(anioPresentacion, 6, 25);
      break;
    default:
      fecha = new Date(anioPresentacion, 0, 30);
  }

  return ajustarADiaHabil(fecha);
};

/**
 * Formato de fecha ISO (YYYY-MM-DD)
 */
const formatoISO = (fecha: Date): string => {
  if (isNaN(fecha.getTime())) return '';
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

// ============================================
// CONFIGURACIÓN DE MODELOS FISCALES
// ============================================

const MODELOS_CONFIG: ModeloFiscalConfig[] = [
  // TRIMESTRALES
  {
    id: '303',
    nombre: 'Modelo 303',
    descripcion: 'Autoliquidación IVA trimestral',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'dia20_4t_enero30', // 1T-3T día 20, 4T día 30 enero
    icon: '📊',
    importante: true,
  },
  {
    id: '130',
    nombre: 'Modelo 130',
    descripcion: 'Pago fraccionado IRPF (estimación directa)',
    aplicaA: ['autonomo'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'dia20',
    icon: '💰',
    importante: true,
  },
  {
    id: '131',
    nombre: 'Modelo 131',
    descripcion: 'Pago fraccionado IRPF (estimación objetiva/módulos)',
    aplicaA: ['autonomo'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'dia20',
    icon: '📋',
    importante: false,
  },
  {
    id: '111',
    nombre: 'Modelo 111',
    descripcion: 'Retenciones e ingresos a cuenta IRPF (trabajadores, profesionales)',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'dia20_4t_enero',
    icon: '👥',
    importante: true,
  },
  {
    id: '115',
    nombre: 'Modelo 115',
    descripcion: 'Retenciones por alquiler de inmuebles',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'dia20_4t_enero',
    icon: '🏢',
    importante: false,
  },
  {
    id: '123',
    nombre: 'Modelo 123',
    descripcion: 'Retenciones sobre rendimientos de capital mobiliario',
    aplicaA: ['sociedad'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'dia20_4t_enero',
    icon: '📈',
    importante: false,
  },
  {
    id: '202',
    nombre: 'Modelo 202',
    descripcion: 'Pago fraccionado Impuesto de Sociedades',
    aplicaA: ['sociedad'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'modelo202',
    icon: '🏛️',
    importante: true,
  },
  {
    id: '349',
    nombre: 'Modelo 349',
    descripcion: 'Declaración recapitulativa de operaciones intracomunitarias',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    tipoPlazoTrimestral: 'dia20_4t_enero30', // 1T-3T día 20, 4T día 30 enero
    icon: '🇪🇺',
    importante: false,
  },
  // ANUALES
  {
    id: '390',
    nombre: 'Modelo 390',
    descripcion: 'Resumen anual IVA',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    tipoPlazoAnual: 'enero30',
    icon: '📊',
    importante: true,
  },
  {
    id: '180',
    nombre: 'Modelo 180',
    descripcion: 'Resumen anual retenciones alquiler inmuebles',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    tipoPlazoAnual: 'enero31',
    icon: '🏠',
    importante: false,
  },
  {
    id: '190',
    nombre: 'Modelo 190',
    descripcion: 'Resumen anual retenciones trabajo y actividades profesionales',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    tipoPlazoAnual: 'enero31',
    icon: '👥',
    importante: true,
  },
  {
    id: '347',
    nombre: 'Modelo 347',
    descripcion: 'Declaración anual de operaciones con terceros (>3.005,06€)',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    tipoPlazoAnual: 'febrero28',
    icon: '🤝',
    importante: true,
  },
  {
    id: '100',
    nombre: 'Renta (IRPF)',
    descripcion: 'Declaración anual de la Renta',
    aplicaA: ['autonomo'],
    periodicidad: 'anual',
    tipoPlazoAnual: 'julio1',
    icon: '📝',
    importante: true,
  },
  {
    id: '200',
    nombre: 'Modelo 200',
    descripcion: 'Impuesto sobre Sociedades anual',
    aplicaA: ['sociedad'],
    periodicidad: 'anual',
    tipoPlazoAnual: 'julio25',
    icon: '🏛️',
    importante: true,
  },
];

/**
 * Genera los modelos fiscales con fechas calculadas dinámicamente para un año
 */
const generarModelosFiscales = (anioActual: number): ModeloFiscal[] => {
  return MODELOS_CONFIG.map(config => {
    const modelo: ModeloFiscal = {
      ...config,
      fechasTrimestre: {},
      fechaAnual: undefined,
    };

    if (config.periodicidad === 'trimestral' && config.tipoPlazoTrimestral) {
      // Generar fechas para cada trimestre
      for (let t = 1; t <= 4; t++) {
        const fecha = calcularFechaTrimestre(anioActual, t as Trimestre, config.tipoPlazoTrimestral);
        if (!isNaN(fecha.getTime())) {
          modelo.fechasTrimestre[t] = formatoISO(fecha);
        }
      }
    } else if (config.periodicidad === 'anual' && config.tipoPlazoAnual) {
      // Generar fecha anual (para el ejercicio del año anterior)
      const fecha = calcularFechaAnual(anioActual - 1, config.tipoPlazoAnual);
      modelo.fechaAnual = formatoISO(fecha);
    }

    return modelo;
  });
};

// Nombres de los meses
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Almacenamiento local
const STORAGE_KEY = 'meskeia-calendario-fiscal';

export default function CalendarioFiscalPage() {
  // Estado
  const [tipoContribuyente, setTipoContribuyente] = useState<TipoContribuyente>('autonomo');
  const [mesActual, setMesActual] = useState(() => new Date().getMonth());
  const [anioActual, setAnioActual] = useState(() => new Date().getFullYear());
  const [pestanaActiva, setPestanaActiva] = useState<'calendario' | 'modelos' | 'estimador'>('calendario');
  const [modelosExpandidos, setModelosExpandidos] = useState<string[]>([]);

  // Estado para estimador
  const [baseImponibleIVA, setBaseImponibleIVA] = useState('');
  const [ivaRepercutido, setIvaRepercutido] = useState('');
  const [ivaSoportado, setIvaSoportado] = useState('');
  const [beneficioTrimestral, setBeneficioTrimestral] = useState('');
  const [retencionesRecibidas, setRetencionesRecibidas] = useState('');

  // Cargar preferencias
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const datos = JSON.parse(guardado);
        if (datos.tipoContribuyente) setTipoContribuyente(datos.tipoContribuyente);
      }
    } catch {
      // Mantener valores por defecto
    }
  }, []);

  // Guardar preferencias
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tipoContribuyente }));
  }, [tipoContribuyente]);

  // Generar modelos fiscales con fechas dinámicas para el año actual
  const modelosFiscales = useMemo(() => {
    return generarModelosFiscales(anioActual);
  }, [anioActual]);

  // Filtrar modelos según tipo de contribuyente
  const modelosFiltrados = useMemo(() => {
    return modelosFiscales.filter(modelo => {
      if (tipoContribuyente === 'ambos') return true;
      return modelo.aplicaA.includes(tipoContribuyente);
    });
  }, [tipoContribuyente, modelosFiscales]);

  // Generar fechas fiscales para el año
  const fechasFiscales = useMemo((): FechaFiscal[] => {
    const fechas: FechaFiscal[] = [];

    modelosFiltrados.forEach(modelo => {
      if (modelo.periodicidad === 'trimestral') {
        Object.entries(modelo.fechasTrimestre).forEach(([trimestre, fechaStr]) => {
          const fecha = new Date(fechaStr);
          fechas.push({
            fecha,
            modelo,
            trimestre: parseInt(trimestre) as Trimestre,
            esAnual: false,
            descripcionPeriodo: `${trimestre}T ${fecha.getFullYear() === anioActual ? anioActual : anioActual - 1}`,
          });
        });
      } else if (modelo.fechaAnual) {
        const fecha = new Date(modelo.fechaAnual);
        fechas.push({
          fecha,
          modelo,
          esAnual: true,
          descripcionPeriodo: `Ejercicio ${fecha.getFullYear() - 1}`,
        });
      }
    });

    return fechas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [modelosFiltrados, anioActual]);

  // Obtener fechas del mes seleccionado
  const fechasDelMes = useMemo(() => {
    return fechasFiscales.filter(f =>
      f.fecha.getMonth() === mesActual &&
      f.fecha.getFullYear() === anioActual
    );
  }, [fechasFiscales, mesActual, anioActual]);

  // Próximas fechas (siguientes 90 días)
  const proximasFechas = useMemo(() => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + 90);

    return fechasFiscales
      .filter(f => f.fecha >= hoy && f.fecha <= limite)
      .slice(0, 10);
  }, [fechasFiscales]);

  // Días hasta una fecha
  const diasHasta = (fecha: Date): number => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const target = new Date(fecha);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Clase de urgencia
  const getUrgenciaClass = (dias: number): string => {
    if (dias < 0) return styles.pasado;
    if (dias <= 7) return styles.urgente;
    if (dias <= 15) return styles.proximo;
    return styles.normal;
  };

  // Generar días del calendario
  const diasCalendario = useMemo(() => {
    const primerDia = new Date(anioActual, mesActual, 1);
    const ultimoDia = new Date(anioActual, mesActual + 1, 0);

    // Ajustar para que la semana empiece en lunes (0 = lunes, 6 = domingo)
    let diaInicio = primerDia.getDay() - 1;
    if (diaInicio < 0) diaInicio = 6;

    const dias: (number | null)[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < diaInicio; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(i);
    }

    return dias;
  }, [mesActual, anioActual]);

  // Obtener fechas de un día específico
  const getFechasDia = (dia: number): FechaFiscal[] => {
    return fechasDelMes.filter(f => f.fecha.getDate() === dia);
  };

  // Toggle modelo expandido
  const toggleModelo = (id: string) => {
    setModelosExpandidos(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Navegación de meses
  const mesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual(prev => prev - 1);
    } else {
      setMesActual(prev => prev - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual(prev => prev + 1);
    } else {
      setMesActual(prev => prev + 1);
    }
  };

  // Cálculos del estimador
  const calcularIVA = (): number => {
    const repercutido = parseFloat(ivaRepercutido.replace(',', '.')) || 0;
    const soportado = parseFloat(ivaSoportado.replace(',', '.')) || 0;
    return repercutido - soportado;
  };

  const calcularPagoFraccionado = (): number => {
    const beneficio = parseFloat(beneficioTrimestral.replace(',', '.')) || 0;
    const retenciones = parseFloat(retencionesRecibidas.replace(',', '.')) || 0;
    // 20% del beneficio menos retenciones ya practicadas
    const pagoBase = beneficio * 0.20;
    return Math.max(0, pagoBase - retenciones);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📅</span>
        <h1 className={styles.title}>Calendario Fiscal del Emprendedor</h1>
        <p className={styles.subtitle}>
          Todas las fechas y modelos tributarios para autónomos y sociedades en España
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial" severity="critical" />

      {/* Selector de tipo */}
      <div className={styles.selectorTipo}>
        <button
          className={`${styles.btnTipo} ${tipoContribuyente === 'autonomo' ? styles.activo : ''}`}
          onClick={() => setTipoContribuyente('autonomo')}
        >
          <span className={styles.btnIcon}>💼</span>
          Autónomo
        </button>
        <button
          className={`${styles.btnTipo} ${tipoContribuyente === 'sociedad' ? styles.activo : ''}`}
          onClick={() => setTipoContribuyente('sociedad')}
        >
          <span className={styles.btnIcon}>🏢</span>
          Sociedad
        </button>
        <button
          className={`${styles.btnTipo} ${tipoContribuyente === 'ambos' ? styles.activo : ''}`}
          onClick={() => setTipoContribuyente('ambos')}
        >
          <span className={styles.btnIcon}>📋</span>
          Ver todos
        </button>
      </div>

      {/* Pestañas */}
      <div className={styles.pestanas}>
        <button
          className={`${styles.pestana} ${pestanaActiva === 'calendario' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('calendario')}
        >
          📅 Calendario
        </button>
        <button
          className={`${styles.pestana} ${pestanaActiva === 'modelos' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('modelos')}
        >
          📋 Modelos
        </button>
        <button
          className={`${styles.pestana} ${pestanaActiva === 'estimador' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('estimador')}
        >
          🧮 Estimador
        </button>
      </div>

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* CALENDARIO */}
        {pestanaActiva === 'calendario' && (
          <div className={styles.calendarioContainer}>
            {/* Próximas fechas */}
            <div className={styles.proximasFechas}>
              <h2 className={styles.seccionTitulo}>⏰ Próximos vencimientos</h2>
              {proximasFechas.length === 0 ? (
                <p className={styles.sinFechas}>No hay vencimientos próximos</p>
              ) : (
                <div className={styles.listaProximas}>
                  {proximasFechas.map((f, idx) => {
                    const dias = diasHasta(f.fecha);
                    return (
                      <div key={idx} className={`${styles.fechaProxima} ${getUrgenciaClass(dias)}`}>
                        <div className={styles.fechaInfo}>
                          <span className={styles.fechaIcon}>{f.modelo.icon}</span>
                          <div className={styles.fechaDetalles}>
                            <strong>{f.modelo.nombre}</strong>
                            <span className={styles.fechaPeriodo}>{f.descripcionPeriodo}</span>
                          </div>
                        </div>
                        <div className={styles.fechaDias}>
                          <span className={styles.diasNumero}>
                            {dias === 0 ? '¡HOY!' : dias === 1 ? 'Mañana' : `${dias} días`}
                          </span>
                          <span className={styles.fechaLimite}>
                            {f.fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calendario mensual */}
            <div className={styles.calendarioMes}>
              <div className={styles.navegacionMes}>
                <button onClick={mesAnterior} className={styles.btnNav}>◀</button>
                <h3 className={styles.tituloMes}>{MESES[mesActual]} {anioActual}</h3>
                <button onClick={mesSiguiente} className={styles.btnNav}>▶</button>
              </div>

              <div className={styles.calendarioGrid}>
                {/* Cabecera días semana */}
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
                  <div key={dia} className={styles.diaSemana}>{dia}</div>
                ))}

                {/* Días */}
                {diasCalendario.map((dia, idx) => {
                  if (dia === null) {
                    return <div key={idx} className={styles.diaVacio}></div>;
                  }

                  const fechasDia = getFechasDia(dia);
                  const tieneFechas = fechasDia.length > 0;
                  const esHoy = new Date().getDate() === dia &&
                                new Date().getMonth() === mesActual &&
                                new Date().getFullYear() === anioActual;

                  return (
                    <div
                      key={idx}
                      className={`${styles.diaMes} ${tieneFechas ? styles.diaConFecha : ''} ${esHoy ? styles.diaHoy : ''}`}
                    >
                      <span className={styles.diaNumero}>{dia}</span>
                      {tieneFechas && (
                        <div className={styles.indicadores}>
                          {fechasDia.slice(0, 3).map((f, i) => (
                            <span key={i} className={styles.indicador} title={f.modelo.nombre}>
                              {f.modelo.icon}
                            </span>
                          ))}
                          {fechasDia.length > 3 && (
                            <span className={styles.indicadorMas}>+{fechasDia.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className={styles.leyenda}>
                <div className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.urgente}`}></span>
                  Menos de 7 días
                </div>
                <div className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.proximo}`}></span>
                  7-15 días
                </div>
                <div className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.normal}`}></span>
                  Más de 15 días
                </div>
              </div>
            </div>

            {/* Detalle del mes */}
            {fechasDelMes.length > 0 && (
              <div className={styles.detalleMes}>
                <h3 className={styles.seccionTitulo}>
                  📋 Obligaciones de {MESES[mesActual]}
                </h3>
                <div className={styles.listaDetalle}>
                  {fechasDelMes.map((f, idx) => (
                    <div key={idx} className={styles.detalleItem}>
                      <div className={styles.detalleFecha}>
                        <span className={styles.detalleDia}>{f.fecha.getDate()}</span>
                        <span className={styles.detalleMesCorto}>
                          {MESES[f.fecha.getMonth()].substring(0, 3)}
                        </span>
                      </div>
                      <div className={styles.detalleInfo}>
                        <div className={styles.detalleModelo}>
                          <span>{f.modelo.icon}</span>
                          <strong>{f.modelo.nombre}</strong>
                          {f.modelo.importante && <span className={styles.badgeImportante}>Importante</span>}
                        </div>
                        <p className={styles.detalleDesc}>{f.modelo.descripcion}</p>
                        <span className={styles.detallePeriodo}>{f.descripcionPeriodo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODELOS */}
        {pestanaActiva === 'modelos' && (
          <div className={styles.modelosContainer}>
            <h2 className={styles.seccionTitulo}>📋 Modelos Tributarios</h2>
            <p className={styles.modelosIntro}>
              Resumen de los principales modelos fiscales para {
                tipoContribuyente === 'autonomo' ? 'autónomos' :
                tipoContribuyente === 'sociedad' ? 'sociedades' : 'autónomos y sociedades'
              }
            </p>

            {/* Trimestrales */}
            <div className={styles.grupoModelos}>
              <h3 className={styles.grupoTitulo}>📆 Trimestrales</h3>
              <div className={styles.listaModelos}>
                {modelosFiltrados
                  .filter(m => m.periodicidad === 'trimestral')
                  .map(modelo => (
                    <div key={modelo.id} className={styles.modeloCard}>
                      <div
                        className={styles.modeloHeader}
                        onClick={() => toggleModelo(modelo.id)}
                      >
                        <div className={styles.modeloTitulo}>
                          <span className={styles.modeloIcon}>{modelo.icon}</span>
                          <div>
                            <strong>{modelo.nombre}</strong>
                            {modelo.importante && <span className={styles.badgeImportante}>★</span>}
                          </div>
                        </div>
                        <span className={styles.expandir}>
                          {modelosExpandidos.includes(modelo.id) ? '▲' : '▼'}
                        </span>
                      </div>

                      {modelosExpandidos.includes(modelo.id) && (
                        <div className={styles.modeloContenido}>
                          <p className={styles.modeloDesc}>{modelo.descripcion}</p>
                          <div className={styles.modeloAplica}>
                            <strong>Aplica a: </strong>
                            {modelo.aplicaA.map(t => t === 'autonomo' ? '💼 Autónomo' : '🏢 Sociedad').join(', ')}
                          </div>
                          <div className={styles.modeloFechas}>
                            <strong>Fechas límite:</strong>
                            <ul>
                              {Object.entries(modelo.fechasTrimestre).map(([t, fecha]) => (
                                <li key={t}>
                                  {t}T: {new Date(fecha).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Anuales */}
            <div className={styles.grupoModelos}>
              <h3 className={styles.grupoTitulo}>📅 Anuales</h3>
              <div className={styles.listaModelos}>
                {modelosFiltrados
                  .filter(m => m.periodicidad === 'anual')
                  .map(modelo => (
                    <div key={modelo.id} className={styles.modeloCard}>
                      <div
                        className={styles.modeloHeader}
                        onClick={() => toggleModelo(modelo.id)}
                      >
                        <div className={styles.modeloTitulo}>
                          <span className={styles.modeloIcon}>{modelo.icon}</span>
                          <div>
                            <strong>{modelo.nombre}</strong>
                            {modelo.importante && <span className={styles.badgeImportante}>★</span>}
                          </div>
                        </div>
                        <span className={styles.expandir}>
                          {modelosExpandidos.includes(modelo.id) ? '▲' : '▼'}
                        </span>
                      </div>

                      {modelosExpandidos.includes(modelo.id) && (
                        <div className={styles.modeloContenido}>
                          <p className={styles.modeloDesc}>{modelo.descripcion}</p>
                          <div className={styles.modeloAplica}>
                            <strong>Aplica a: </strong>
                            {modelo.aplicaA.map(t => t === 'autonomo' ? '💼 Autónomo' : '🏢 Sociedad').join(', ')}
                          </div>
                          <div className={styles.modeloFechas}>
                            <strong>Fecha límite: </strong>
                            {modelo.fechaAnual && new Date(modelo.fechaAnual).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ESTIMADOR */}
        {pestanaActiva === 'estimador' && (
          <div className={styles.estimadorContainer}>
            <h2 className={styles.seccionTitulo}>🧮 Estimador de Pagos</h2>
            <p className={styles.estimadorIntro}>
              Calcula una estimación aproximada de tus pagos trimestrales
            </p>

            {/* Estimador IVA */}
            <div className={styles.estimadorCard}>
              <h3 className={styles.estimadorTitulo}>
                <span>📊</span> Modelo 303 - IVA Trimestral
              </h3>
              <div className={styles.estimadorForm}>
                <div className={styles.formGroup}>
                  <label>IVA repercutido (cobrado)</label>
                  <div className={styles.inputConUnidad}>
                    <input
                      type="text"
                      value={ivaRepercutido}
                      onChange={(e) => setIvaRepercutido(e.target.value)}
                      placeholder="0"
                      className={styles.input}
                    />
                    <span className={styles.unidad}>€</span>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>IVA soportado (pagado)</label>
                  <div className={styles.inputConUnidad}>
                    <input
                      type="text"
                      value={ivaSoportado}
                      onChange={(e) => setIvaSoportado(e.target.value)}
                      placeholder="0"
                      className={styles.input}
                    />
                    <span className={styles.unidad}>€</span>
                  </div>
                </div>
                <div className={styles.resultadoEstimador}>
                  <span>IVA a ingresar/devolver:</span>
                  <strong className={calcularIVA() >= 0 ? styles.positivo : styles.negativo}>
                    {formatCurrency(calcularIVA())}
                  </strong>
                </div>
              </div>
            </div>

            {/* Estimador IRPF */}
            {(tipoContribuyente === 'autonomo' || tipoContribuyente === 'ambos') && (
              <div className={styles.estimadorCard}>
                <h3 className={styles.estimadorTitulo}>
                  <span>💰</span> Modelo 130 - Pago Fraccionado IRPF
                </h3>
                <div className={styles.estimadorForm}>
                  <div className={styles.formGroup}>
                    <label>Beneficio del trimestre (ingresos - gastos)</label>
                    <div className={styles.inputConUnidad}>
                      <input
                        type="text"
                        value={beneficioTrimestral}
                        onChange={(e) => setBeneficioTrimestral(e.target.value)}
                        placeholder="0"
                        className={styles.input}
                      />
                      <span className={styles.unidad}>€</span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Retenciones recibidas en facturas</label>
                    <div className={styles.inputConUnidad}>
                      <input
                        type="text"
                        value={retencionesRecibidas}
                        onChange={(e) => setRetencionesRecibidas(e.target.value)}
                        placeholder="0"
                        className={styles.input}
                      />
                      <span className={styles.unidad}>€</span>
                    </div>
                  </div>
                  <div className={styles.resultadoEstimador}>
                    <span>Pago fraccionado (20%):</span>
                    <strong className={styles.positivo}>
                      {formatCurrency(calcularPagoFraccionado())}
                    </strong>
                  </div>
                  <p className={styles.notaEstimador}>
                    * El 20% del beneficio menos las retenciones ya practicadas por tus clientes
                  </p>
                </div>
              </div>
            )}

            {/* Resumen trimestral */}
            <div className={styles.resumenTrimestral}>
              <h3>📋 Resumen estimado del trimestre</h3>
              <div className={styles.resumenGrid}>
                <div className={styles.resumenItem}>
                  <span>IVA (303)</span>
                  <strong>{formatCurrency(calcularIVA())}</strong>
                </div>
                {(tipoContribuyente === 'autonomo' || tipoContribuyente === 'ambos') && (
                  <div className={styles.resumenItem}>
                    <span>IRPF (130)</span>
                    <strong>{formatCurrency(calcularPagoFraccionado())}</strong>
                  </div>
                )}
                <div className={`${styles.resumenItem} ${styles.resumenTotal}`}>
                  <span>Total a pagar</span>
                  <strong>
                    {formatCurrency(
                      Math.max(0, calcularIVA()) +
                      ((tipoContribuyente === 'autonomo' || tipoContribuyente === 'ambos') ? calcularPagoFraccionado() : 0)
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Herramienta de Orientación — No es asesoramiento profesional</h3>
        <p>
          Este calendario es una <strong>guía orientativa</strong> basada en los plazos generales de la AEAT para 2026.
          Las fechas pueden variar por festivos locales o cambios normativos posteriores a la elaboración de esta herramienta.
          Para información oficial y actualizada, consulta siempre la{' '}
          <a href="https://sede.agenciatributaria.gob.es" target="_blank" rel="noopener noreferrer">
            Sede Electrónica de la AEAT
          </a>.
          Los cálculos son orientativos y <strong>no sustituyen el asesoramiento de un profesional fiscal</strong>.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor tus obligaciones fiscales?"
        subtitle="Aprende sobre los modelos tributarios y cómo planificar tus pagos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Guía Rápida de Obligaciones Fiscales</h2>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>📆 Obligaciones Trimestrales</h4>
              <p>
                Cada trimestre debes presentar varias declaraciones. Las más comunes son:
              </p>
              <ul>
                <li><strong>Modelo 303</strong>: IVA trimestral (todos)</li>
                <li><strong>Modelo 130</strong>: Pago a cuenta IRPF (autónomos en estimación directa)</li>
                <li><strong>Modelo 111</strong>: Retenciones a trabajadores/profesionales (si tienes empleados o pagas a otros autónomos)</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>📅 Plazos Generales</h4>
              <p>
                Los plazos habituales para las declaraciones trimestrales son:
              </p>
              <ul>
                <li><strong>1T</strong>: Del 1 al 20 de abril</li>
                <li><strong>2T</strong>: Del 1 al 20 de julio</li>
                <li><strong>3T</strong>: Del 1 al 20 de octubre</li>
                <li><strong>4T</strong>: Del 1 al 30 de enero del año siguiente</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>💡 Consejos Prácticos</h4>
              <ul>
                <li>Reserva un 25-30% de tus ingresos para impuestos</li>
                <li>Lleva la contabilidad al día, no lo dejes para el final</li>
                <li>Guarda todas las facturas (ingresos y gastos)</li>
                <li>Usa domiciliación bancaria para evitar olvidos</li>
                <li>Considera un asesor fiscal si tu actividad es compleja</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>⚠️ Sanciones por Retraso</h4>
              <p>
                Presentar fuera de plazo tiene consecuencias:
              </p>
              <ul>
                <li><strong>Sin requerimiento</strong>: Recargo del 1% + 1% adicional por mes (hasta 12 meses)</li>
                <li><strong>Con requerimiento</strong>: Sanción del 50-150% de la cuota</li>
                <li><strong>Intereses de demora</strong>: Se añaden sobre la cuota</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 1. TABLA COMPARATIVA DE MODELOS ── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de Modelos Fiscales</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>¿Quién lo presenta?</th>
                  <th>Periodicidad</th>
                  <th>Plazo</th>
                  <th>Importe aprox.</th>
                  <th>Si no presentas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>303</strong> — IVA</td>
                  <td>Autónomos y sociedades con actividad sujeta a IVA</td>
                  <td>Trimestral</td>
                  <td>1T-3T: hasta el 20; 4T: hasta el 30 de enero</td>
                  <td>IVA repercutido − IVA soportado</td>
                  <td>Sanción formal + recargo del 1 % mensual</td>
                </tr>
                <tr>
                  <td><strong>130</strong> — Pago fracc. IRPF</td>
                  <td>Autónomos en estimación directa (normal o simplificada)</td>
                  <td>Trimestral</td>
                  <td>Hasta el 20 de abril, julio, octubre y enero</td>
                  <td>20 % del beneficio acumulado − retenciones</td>
                  <td>Sanción formal 200 € aunque el resultado sea cero</td>
                </tr>
                <tr>
                  <td><strong>111</strong> — Retenciones IRPF</td>
                  <td>Autónomos/SL con empleados o que pagan a profesionales con retención</td>
                  <td>Trimestral</td>
                  <td>Hasta el 20 (4T: hasta el 20 de enero)</td>
                  <td>Retenciones practicadas en nóminas y facturas</td>
                  <td>Recargo + sanción por ingreso fuera de plazo</td>
                </tr>
                <tr>
                  <td><strong>115</strong> — Retenciones alquiler</td>
                  <td>Quien paga alquiler de local afecto a actividad</td>
                  <td>Trimestral</td>
                  <td>Hasta el 20 (4T: hasta el 20 de enero)</td>
                  <td>19 % de la renta del alquiler</td>
                  <td>Sanción + intereses de demora al arrendador</td>
                </tr>
                <tr>
                  <td><strong>390</strong> — Resumen anual IVA</td>
                  <td>Todos los que presentan el 303</td>
                  <td>Anual</td>
                  <td>Hasta el 30 de enero del año siguiente</td>
                  <td>Solo informativo (no implica pago adicional)</td>
                  <td>Sanción formal de 200 € por no presentar</td>
                </tr>
                <tr>
                  <td><strong>347</strong> — Operaciones con terceros</td>
                  <td>Autónomos y SL con operaciones {">"} 3.005,06 € anuales con un mismo tercero</td>
                  <td>Anual</td>
                  <td>Hasta el último día de febrero</td>
                  <td>Solo informativo</td>
                  <td>Sanción de 20 € por dato omitido (mínimo 300 €)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. CASOS DE USO / PERFILES ── */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso: ¿Qué modelos me corresponden?</h2>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <h4>Autónomo en estimación directa, sin empleados, con alquiler de local</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>Trimestrales:</strong>
                <ul>
                  <li><strong>303</strong> — IVA (hasta el 20 o 30 de enero en 4T)</li>
                  <li><strong>130</strong> — Pago fraccionado IRPF (hasta el 20)</li>
                  <li><strong>115</strong> — Retención por alquiler del local (hasta el 20)</li>
                </ul>
                <strong>Anuales:</strong>
                <ul>
                  <li><strong>390</strong> — Resumen IVA (hasta 30 enero)</li>
                  <li><strong>180</strong> — Resumen retenciones alquiler (hasta 31 enero)</li>
                  <li><strong>100</strong> — Renta IRPF (hasta 1 julio)</li>
                </ul>
              </div>
              <p className={styles.escenarioTip}>
                Si el 347 supera 3.005,06 € con algún cliente o proveedor, también presentas ese modelo en febrero.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👥</span>
                <h4>Autónomo con 2 empleados</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>Además de los modelos anteriores, añade:</strong>
                <ul>
                  <li><strong>111</strong> — Retenciones nóminas y profesionales (trimestral, hasta el 20)</li>
                  <li><strong>190</strong> — Resumen anual retenciones (hasta 31 enero)</li>
                </ul>
                <strong>Resumen trimestral completo:</strong> 303 + 130 + 111 (+ 115 si hay local en alquiler)
              </div>
              <p className={styles.escenarioTip}>
                El modelo 111 se presenta aunque los importes sean bajos; nunca se puede omitir si has practicado retenciones ese trimestre.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h4>SL unipersonal con administrador autónomo</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>La sociedad presenta:</strong>
                <ul>
                  <li><strong>303</strong> — IVA trimestral</li>
                  <li><strong>202</strong> — Pago fraccionado IS (abril, octubre, diciembre)</li>
                  <li><strong>111</strong> — Retenciones sobre la nómina/retribución del administrador</li>
                  <li><strong>390</strong> — Resumen IVA anual</li>
                  <li><strong>200</strong> — IS anual (hasta 25 julio)</li>
                </ul>
              </div>
              <p className={styles.escenarioTip}>
                La SL no presenta el modelo 130 (ese es exclusivo de autónomos personas físicas). El administrador, como persona física, presenta su propia renta (100) si tiene otros ingresos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🩺</span>
                <h4>Freelance exento de IVA (psicólogo, médico, profesor)</h4>
              </div>
              <div className={styles.escenarioExample}>
                <strong>Solo presenta:</strong>
                <ul>
                  <li><strong>130</strong> — Pago fraccionado IRPF trimestral</li>
                  <li><strong>100</strong> — Renta anual (hasta 1 julio)</li>
                </ul>
                <strong>No presenta:</strong> 303 ni 390 (actividad exenta de IVA por ley)
              </div>
              <p className={styles.escenarioTip}>
                Si además alquilas consulta o tienes empleados, sí deberás presentar 115 y/o 111. La exención de IVA no exime de retenciones.
              </p>
            </div>

          </div>
        </section>

        {/* ── 3. FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Obligaciones Fiscales</h2>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si presento el modelo 303 un día tarde?</h4>
              <p>
                Si lo presentas <strong>sin requerimiento previo de la AEAT</strong>, se aplica un recargo por presentación extemporánea: 1 % + 1 % adicional por cada mes completo de retraso, hasta un máximo del 15 % a partir del mes 12. A partir de ese punto, se aplica una sanción del 50 % más intereses de demora. Si la AEAT te lo ha requerido antes, la sanción mínima asciende al 50 % de la cuota.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo presentar a cero el modelo 303 si no he facturado nada en el trimestre?</h4>
              <p>
                Sí. Si has estado dado de alta como autónomo durante ese trimestre y tu actividad está sujeta a IVA, debes presentar el 303 aunque el resultado sea cero. No presentarlo te expone a una sanción formal de 200 €. Solo puedes evitar la presentación si solicitaste previamente la baja en el Censo de Empresarios (modelo 036) antes de que comenzara el trimestre.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿El modelo 347 es obligatorio si facturo menos de 3.005 € a un cliente?</h4>
              <p>
                No. El modelo 347 solo es obligatorio cuando el volumen de operaciones con un mismo cliente o proveedor <strong>supera los 3.005,06 € en el año natural</strong>. Si todas tus operaciones individuales se quedan por debajo de ese umbral, no tienes obligación de presentarlo. Eso sí, debes tener controlado el acumulado de cada tercero durante el año.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Tengo que presentar el modelo 130 si tengo retenciones suficientes del 15 %?</h4>
              <p>
                Hay una <strong>exoneración</strong>: puedes no presentar el 130 si en el año anterior más del 70 % de tus ingresos procedió de clientes que te aplicaron retención del 15 % (retención de profesionales). En ese caso, marcas la casilla de exoneración en el modelo 036/037. No obstante, si en algún trimestre la situación cambia y tienes ingresos sin retención, deberás presentarlo. Consulta con tu gestor si puedes aplicar esta exoneración.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el régimen de módulos y quién puede acogerse?</h4>
              <p>
                El régimen de <strong>estimación objetiva (módulos)</strong> permite calcular el beneficio —y por tanto el IRPF a pagar— en función de parámetros objetivos (metros del local, empleados, potencia instalada, etc.) en lugar del beneficio real. Solo pueden acogerse actividades incluidas en la Orden de Módulos vigente y que no superen ciertos límites de facturación (en general, 250.000 € de ingresos y 250.000 € de compras). Los autónomos en módulos presentan el modelo 131 (no el 130).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo aplazar el pago del IRPF si no tengo liquidez?</h4>
              <p>
                Sí. La AEAT permite solicitar aplazamiento o fraccionamiento de deudas tributarias (incluido el 130) mediante la Sede Electrónica. Para deudas inferiores a 30.000 € no se exige garantía. Si la deuda es superior, puede exigirse aval bancario o garantía hipotecaria. Los aplazamientos devengan intereses de demora (actualmente el 4,0625 % anual). El aplazamiento debe solicitarse dentro del plazo voluntario de presentación.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo afecta el SII (Suministro Inmediato de Información) a mis obligaciones?</h4>
              <p>
                El <strong>SII</strong> obliga a llevar los libros de IVA de forma electrónica a través de la Sede AEAT, enviando cada factura emitida y recibida en un plazo máximo de 4 días hábiles. Están obligados quienes facturen más de 6.010.121,04 € anuales, los grupos de IVA y quienes opten voluntariamente. Si estás en SII, quedas exonerado de presentar los modelos 347, 340 y 390.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre estimación directa normal y simplificada?</h4>
              <p>
                La <strong>estimación directa normal</strong> exige contabilidad completa ajustada al Código de Comercio. La <strong>simplificada</strong> aplica a autónomos con facturación inferior a 600.000 € y permite llevar solo libros registro de ventas, compras y bienes de inversión. En ambas, el beneficio es ingresos menos gastos reales deducibles. La principal diferencia práctica es la amortización: en simplificada se aplican tablas simplificadas con porcentajes fijos.
              </p>
            </div>

          </div>
        </section>

        {/* ── 4. GUÍA PASO A PASO ── */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Cómo No Perder Ningún Plazo Fiscal</h2>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica tus modelos obligatorios</h4>
                <p>
                  Revisa tu situación: ¿eres autónomo o SL? ¿Tienes empleados? ¿Alquilas local? ¿Tu actividad está exenta de IVA? Con esas cuatro preguntas puedes determinar qué modelos debes presentar cada trimestre. Anótalos en una lista y consúltala cada vez que empiece un período.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Crea un calendario fiscal personalizado con alertas</h4>
                <p>
                  Añade todas las fechas límite a Google Calendar, Outlook o cualquier herramienta que uses. Configura recordatorios con <strong>15 días de antelación</strong> para tener margen real de reacción. Usa eventos recurrentes para los trimestrales y anuales — así no tienes que crearlos cada año.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Mantén contabilidad mensual</h4>
                <p>
                  No esperes al fin del trimestre para revisar facturas y gastos. Dedica una hora al mes a cuadrar tus registros: facturas emitidas, facturas recibidas y extracto bancario. Al llegar la declaración trimestral, tendrás los datos listos en minutos en lugar de días.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Revisa las liquidaciones con tu gestor 5 días antes del plazo</h4>
                <p>
                  Envía a tu asesor fiscal toda la documentación del trimestre con al menos 5 días hábiles de margen. Esto permite revisar errores, incluir facturas olvidadas y corregir discrepancias antes de presentar. Un error en el borrador presentado requiere una declaración complementaria — evítalo con revisión previa.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Domicilia los pagos en cuenta bancaria</h4>
                <p>
                  La AEAT permite domiciliar el pago de la mayoría de modelos. La domiciliación evita que olvides transferir el importe el día límite y garantiza que el cargo se efectúa en la fecha correcta. Asegúrate de tener saldo suficiente en la cuenta domiciliada antes del cargo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Guarda copia con número de referencia de cada presentación</h4>
                <p>
                  Tras cada presentación, descarga el justificante con número de referencia o CSV (Código Seguro de Verificación). Guárdalos organizados por año y modelo en una carpeta en la nube. Ese justificante es la prueba de que presentaste en plazo si la AEAT te reclama posteriormente.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Cierra el ejercicio anual en enero</h4>
                <p>
                  En enero debes presentar el 303 del 4T (hasta el 30), el 390 (hasta el 30), el 111 y 115 del 4T (hasta el 20) y el 190/180 (hasta el 31). Además, verifica si tienes operación con terceros superior a 3.005,06 € para preparar el modelo 347 (hasta finales de febrero). Enero es el mes fiscal más intenso del año — planifícalo con antelación.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── 5. MEJORES PRÁCTICAS ── */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas para Gestionar tus Impuestos</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <p>
                El pago del modelo 303 puede domiciliarse hasta el día anterior al fin del plazo: 19 de abril, 19 de julio, 19 de octubre y 29 de enero. No esperes al último día para iniciar la presentación.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>↩️</span>
              <p>
                Si el resultado del 303 es <strong>negativo</strong> (más IVA soportado que repercutido), tienes dos opciones: pedir devolución en el 4T o compensar el saldo en los trimestres siguientes. La compensación es más rápida, pero la devolución puede ser conveniente si el importe es elevado.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧮</span>
              <p>
                El modelo 130 en estimación directa simplificada se calcula sobre el <strong>beneficio acumulado desde el 1 de enero</strong> al trimestre correspondiente, aplicando el 20 %, y restando lo ya pagado en trimestres anteriores. No se calcula sobre el beneficio del trimestre aislado.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💻</span>
              <p>
                Pide a tu gestor acceso al sistema <strong>Cl@ve PIN</strong> o activa tu certificado digital para consultar tus presentaciones en la Sede Electrónica de la AEAT. Así puedes verificar en cualquier momento si todas tus declaraciones están registradas correctamente.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📬</span>
              <p>
                Las notificaciones de Hacienda llegan por <strong>Dirección Electrónica Habilitada (DEH)</strong>. Actívala y revísala cada semana. Si una notificación electrónica no se abre en 10 días, se da por recibida automáticamente — con las consecuencias legales que ello conlleva.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <p>
                Reserva el <strong>25-30 % de cada cobro</strong> en una cuenta separada destinada exclusivamente al pago de impuestos. Nunca uses ese dinero para gastos corrientes. Esta práctica elimina la angustia al llegar los trimestres y evita problemas de liquidez.
              </p>
            </div>

          </div>
        </section>

        {/* ── 6. WARNING BOX — ERRORES COMUNES ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Frecuentes que Generan Sanciones</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Presentar el 303 sin incluir todas las facturas del trimestre.</strong>{' '}
                Si Hacienda detecta la discrepancia mediante cruce de datos con proveedores, aplicará sanción más intereses sobre la diferencia no declarada.
              </li>
              <li>
                <strong>No presentar el modelo 130 aunque el resultado sea cero.</strong>{' '}
                La obligación formal existe independientemente del importe. Omitir la presentación, aunque no haya cuota a ingresar, supone una sanción formal de 200 €.
              </li>
              <li>
                <strong>Olvidar incluir en el modelo 347 a clientes o proveedores que superan 3.005,06 €.</strong>{' '}
                La sanción es de 20 € por cada dato o conjunto de datos omitido, con un mínimo de 300 € y un máximo del 2 % del volumen de operaciones declarado.
              </li>
              <li>
                <strong>Compensar IVA negativo sin solicitarlo correctamente.</strong>{' '}
                El saldo negativo de IVA no se traslada automáticamente al siguiente trimestre: debes marcarlo expresamente en la casilla de compensación del 303. Si no lo haces, el saldo se pierde para ese período.
              </li>
              <li>
                <strong>No actualizar el domicilio fiscal cuando cambias de dirección.</strong>{' '}
                Las notificaciones de la AEAT se envían al domicilio fiscal declarado. Si no las recibes porque está desactualizado, se dan por notificadas igualmente, y los plazos para recurrir corren desde esa fecha.
              </li>
              <li>
                <strong>Presentar el IVA del 4T fuera de plazo (31 de enero).</strong>{' '}
                Este plazo es el menos conocido y el más olvidado: mientras los trimestres 1T-3T vencen el día 20 del mes siguiente, el 4T vence el <strong>30 de enero</strong>. Perdérselo es el error más frecuente entre autónomos que gestionan sus impuestos sin asesor.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calendario-fiscal-emprendedor')} />
      <ShareCard appName="calendario-fiscal-emprendedor" />
      <Footer appName="calendario-fiscal-emprendedor" />
    </div>
  );
}
