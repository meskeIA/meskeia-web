'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalendarioFiscal.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type TipoContribuyente = 'autonomo' | 'sociedad' | 'ambos';
type Trimestre = 1 | 2 | 3 | 4;

interface ModeloFiscal {
  id: string;
  nombre: string;
  descripcion: string;
  aplicaA: ('autonomo' | 'sociedad')[];
  periodicidad: 'trimestral' | 'anual' | 'mensual';
  fechasTrimestre: { [key: number]: string }; // Trimestre -> Fecha límite
  fechaAnual?: string;
  icon: string;
  importante: boolean;
}

interface FechaFiscal {
  fecha: Date;
  modelo: ModeloFiscal;
  trimestre?: Trimestre;
  esAnual: boolean;
  descripcionPeriodo: string;
}

// Base de datos de modelos fiscales 2025
const MODELOS_FISCALES: ModeloFiscal[] = [
  {
    id: '303',
    nombre: 'Modelo 303',
    descripcion: 'Autoliquidación IVA trimestral',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21', // 1T: hasta 20 abril (21 por festivo)
      2: '2025-07-21', // 2T: hasta 20 julio
      3: '2025-10-20', // 3T: hasta 20 octubre
      4: '2026-01-30', // 4T: hasta 30 enero año siguiente
    },
    icon: '📊',
    importante: true,
  },
  {
    id: '130',
    nombre: 'Modelo 130',
    descripcion: 'Pago fraccionado IRPF (estimación directa)',
    aplicaA: ['autonomo'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21',
      2: '2025-07-21',
      3: '2025-10-20',
      4: '2026-01-30',
    },
    icon: '💰',
    importante: true,
  },
  {
    id: '131',
    nombre: 'Modelo 131',
    descripcion: 'Pago fraccionado IRPF (estimación objetiva/módulos)',
    aplicaA: ['autonomo'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21',
      2: '2025-07-21',
      3: '2025-10-20',
      4: '2026-01-30',
    },
    icon: '📋',
    importante: false,
  },
  {
    id: '111',
    nombre: 'Modelo 111',
    descripcion: 'Retenciones e ingresos a cuenta IRPF (trabajadores, profesionales)',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21',
      2: '2025-07-21',
      3: '2025-10-20',
      4: '2026-01-20',
    },
    icon: '👥',
    importante: true,
  },
  {
    id: '115',
    nombre: 'Modelo 115',
    descripcion: 'Retenciones por alquiler de inmuebles',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21',
      2: '2025-07-21',
      3: '2025-10-20',
      4: '2026-01-20',
    },
    icon: '🏢',
    importante: false,
  },
  {
    id: '123',
    nombre: 'Modelo 123',
    descripcion: 'Retenciones sobre rendimientos de capital mobiliario',
    aplicaA: ['sociedad'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21',
      2: '2025-07-21',
      3: '2025-10-20',
      4: '2026-01-20',
    },
    icon: '📈',
    importante: false,
  },
  {
    id: '202',
    nombre: 'Modelo 202',
    descripcion: 'Pago fraccionado Impuesto de Sociedades',
    aplicaA: ['sociedad'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21', // Abril
      2: '2025-10-20', // Octubre
      3: '2025-12-22', // Diciembre
    },
    icon: '🏛️',
    importante: true,
  },
  {
    id: '349',
    nombre: 'Modelo 349',
    descripcion: 'Declaración recapitulativa de operaciones intracomunitarias',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'trimestral',
    fechasTrimestre: {
      1: '2025-04-21',
      2: '2025-07-21',
      3: '2025-10-20',
      4: '2026-01-30',
    },
    icon: '🇪🇺',
    importante: false,
  },
  // Anuales
  {
    id: '390',
    nombre: 'Modelo 390',
    descripcion: 'Resumen anual IVA',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    fechasTrimestre: {},
    fechaAnual: '2026-01-30',
    icon: '📊',
    importante: true,
  },
  {
    id: '180',
    nombre: 'Modelo 180',
    descripcion: 'Resumen anual retenciones alquiler inmuebles',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    fechasTrimestre: {},
    fechaAnual: '2026-01-31',
    icon: '🏠',
    importante: false,
  },
  {
    id: '190',
    nombre: 'Modelo 190',
    descripcion: 'Resumen anual retenciones trabajo y actividades profesionales',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    fechasTrimestre: {},
    fechaAnual: '2026-01-31',
    icon: '👥',
    importante: true,
  },
  {
    id: '347',
    nombre: 'Modelo 347',
    descripcion: 'Declaración anual de operaciones con terceros (>3.005,06€)',
    aplicaA: ['autonomo', 'sociedad'],
    periodicidad: 'anual',
    fechasTrimestre: {},
    fechaAnual: '2025-02-28',
    icon: '🤝',
    importante: true,
  },
  {
    id: '100',
    nombre: 'Renta (IRPF)',
    descripcion: 'Declaración anual de la Renta',
    aplicaA: ['autonomo'],
    periodicidad: 'anual',
    fechasTrimestre: {},
    fechaAnual: '2025-07-01',
    icon: '📝',
    importante: true,
  },
  {
    id: '200',
    nombre: 'Modelo 200',
    descripcion: 'Impuesto sobre Sociedades anual',
    aplicaA: ['sociedad'],
    periodicidad: 'anual',
    fechasTrimestre: {},
    fechaAnual: '2025-07-25', // 25 días naturales tras 6 meses del cierre ejercicio
    icon: '🏛️',
    importante: true,
  },
];

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

  // Filtrar modelos según tipo de contribuyente
  const modelosFiltrados = useMemo(() => {
    return MODELOS_FISCALES.filter(modelo => {
      if (tipoContribuyente === 'ambos') return true;
      return modelo.aplicaA.includes(tipoContribuyente);
    });
  }, [tipoContribuyente]);

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
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este calendario es una guía orientativa basada en los plazos generales de la AEAT.
          Las fechas pueden variar por festivos locales o cambios normativos.
          Para información oficial y actualizada, consulta siempre la <a href="https://sede.agenciatributaria.gob.es" target="_blank" rel="noopener noreferrer">Sede Electrónica de la AEAT</a>.
          Los cálculos del estimador son aproximados y no sustituyen el asesoramiento profesional.
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calendario-fiscal-emprendedor')} />
      <Footer appName="calendario-fiscal-emprendedor" />
    </div>
  );
}
