'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './DashboardAnalytics.module.css';
import { MeskeiaLogo } from '@/components';

// Importar Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ComparativaItem {
  usos: number;
  comparacion: {
    porcentaje: number;
    tendencia: 'up' | 'down' | 'neutral';
  };
  etiqueta: string;
  fecha?: string;
}

interface EstadisticasData {
  status: string;
  version: string;
  filtros: {
    excluir_mi_ip: boolean;
    ip_excluida: string | null;
  };
  estadisticas: {
    total_usos: number;
    total_aplicaciones: number;
    primer_uso: string | null;
    ultimo_uso: string | null;
    duracion_promedio_formato: string;
    dispositivos: {
      movil: { total: number; porcentaje: number };
      escritorio: { total: number; porcentaje: number };
    };
    usuarios: {
      nuevos: { total: number; porcentaje: number };
      recurrentes: { total: number; porcentaje: number };
    };
    geografia: {
      paises: Array<{ pais: string; total: number }>;
      ciudades: Array<{ ciudad: string; total: number }>;
    };
  };
  comparativa?: {
    hoy: ComparativaItem;
    ayer: ComparativaItem;
    semana: ComparativaItem;
    mes: ComparativaItem;
    detalles: {
      ayer: number;
      anteayer: number;
      semanaAnterior: number;
      mesAnterior: number;
    };
  };
  ranking_aplicaciones: Array<{
    aplicacion: string;
    total_usos: number;
    ultimo_uso: string;
    duracion_promedio_formato: string;
    estado: string;
  }>;
  data: Array<{
    id: number;
    aplicacion: string;
    timestamp: string;
    duracion_segundos: number | null;
    pais: string | null;
    ciudad: string | null;
    tipo_dispositivo: string | null;
    navegador: string | null;
    sistema_operativo: string | null;
    resolucion: string | null;
  }>;
}

interface IPConfig {
  ip_actual: string;
  ip_excluida: string;
  activo: boolean;
}

export default function DashboardAnalyticsPage() {
  const [datos, setDatos] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');
  const [tabActiva, setTabActiva] = useState<'general' | 'tecnico' | 'ranking' | 'aplicacion' | 'registros'>('general');
  const [appSeleccionada, setAppSeleccionada] = useState<string>('');

  // Estado para filtro de IP
  const [filtroIPActivo, setFiltroIPActivo] = useState(true);
  const [ipConfig, setIPConfig] = useState<IPConfig | null>(null);
  const [actualizandoIP, setActualizandoIP] = useState(false);

  // Ref para evitar múltiples cargas iniciales
  const iniciado = useRef(false);
  const filtroIPRef = useRef(filtroIPActivo);

  // Mantener ref sincronizada
  useEffect(() => {
    filtroIPRef.current = filtroIPActivo;
  }, [filtroIPActivo]);

  // Función para cargar datos (usa ref para evitar dependencias)
  const cargarDatos = useCallback(async (excluirIP?: boolean) => {
    setLoading(true);
    setError(null);

    const usarFiltro = excluirIP !== undefined ? excluirIP : filtroIPRef.current;

    try {
      const url = `/api/analytics/stats?limite=500${usarFiltro ? '&excluir_mi_ip=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      setDatos(data);
      setUltimaActualizacion(
        new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar configuración de IP
  const cargarConfigIP = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/ip-filter');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setIPConfig(data.data);
          // Solo actualizar si es diferente para evitar renders
          if (data.data.activo !== filtroIPRef.current) {
            setFiltroIPActivo(data.data.activo);
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar config IP:', err);
    }
  }, []);

  // Guardar IP actual como excluida
  const guardarMiIP = async () => {
    setActualizandoIP(true);
    try {
      const response = await fetch('/api/analytics/ip-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: filtroIPActivo }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setIPConfig((prev) => prev ? { ...prev, ip_excluida: data.data.ip_excluida } : null);
        alert(`✅ IP guardada: ${data.data.ip_excluida}\n\nTus pruebas ya no se registrarán.`);
        // Recargar datos con el nuevo filtro
        cargarDatos(filtroIPActivo);
      }
    } catch {
      alert('❌ Error al guardar IP');
    } finally {
      setActualizandoIP(false);
    }
  };

  // Toggle filtro IP
  const toggleFiltroIP = () => {
    const nuevoEstado = !filtroIPActivo;
    setFiltroIPActivo(nuevoEstado);
    // Guardar preferencia y recargar
    localStorage.setItem('filtroMiIPActivo', nuevoEstado.toString());
    cargarDatos(nuevoEstado);
  };

  // Efecto de inicialización (solo una vez)
  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    // Cargar preferencia de localStorage
    const prefLocal = localStorage.getItem('filtroMiIPActivo');
    if (prefLocal !== null) {
      const prefValue = prefLocal === 'true';
      setFiltroIPActivo(prefValue);
      filtroIPRef.current = prefValue;
    }

    // Cargar config IP y datos
    cargarConfigIP();
    cargarDatos();
  }, [cargarConfigIP, cargarDatos]);

  // Función helper para parsear timestamp español (DD/MM/YYYY, HH:MM:SS)
  const parsearTimestamp = (timestamp: string): Date | null => {
    const fechaMatch = timestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!fechaMatch) return null;

    const [, dia, mes, anio] = fechaMatch;
    return new Date(
      parseInt(anio, 10),
      parseInt(mes, 10) - 1,
      parseInt(dia, 10)
    );
  };

  const formatearNumero = (num: number) => {
    return num.toLocaleString('es-ES');
  };

  // Extraer navegador del User Agent
  const extraerNavegador = (userAgent: string | null): string => {
    if (!userAgent) return 'Desconocido';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Otro';
  };

  // Extraer SO
  const extraerSO = (platform: string | null): string => {
    if (!platform) return 'Desconocido';
    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'macOS';
    if (platform.includes('Linux')) return 'Linux';
    if (platform.includes('Android')) return 'Android';
    if (platform.includes('iPhone') || platform.includes('iPad')) return 'iOS';
    return 'Otro';
  };

  // Datos para gráfico de tendencia (últimos 30 días)
  const getTendenciaData = () => {
    if (!datos?.data) return null;

    const hoy = new Date();
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hoy.getDate() - 30);

    const usosPorDia: { [key: string]: number } = {};

    datos.data.forEach((registro) => {
      const fechaObj = parsearTimestamp(registro.timestamp || '');
      if (!fechaObj) return;

      if (fechaObj >= hace30Dias) {
        const diaKey = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        usosPorDia[diaKey] = (usosPorDia[diaKey] || 0) + 1;
      }
    });

    // Generar array de últimos 30 días
    const labels: string[] = [];
    const valores: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const dia = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      labels.push(dia);
      valores.push(usosPorDia[dia] || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Usos por Día',
          data: valores,
          borderColor: '#2E86AB',
          backgroundColor: 'rgba(46, 134, 171, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  // Datos para gráfico de navegadores
  const getNavegadoresData = () => {
    if (!datos?.data) return null;

    const navegadores: { [key: string]: number } = {};
    datos.data.forEach((registro) => {
      const nav = extraerNavegador(registro.navegador);
      navegadores[nav] = (navegadores[nav] || 0) + 1;
    });

    const sorted = Object.entries(navegadores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sorted.map(([nombre]) => nombre),
      datasets: [
        {
          data: sorted.map(([, count]) => count),
          backgroundColor: ['#2E86AB', '#48A9A6', '#7FB3D3', '#A6D4E0', '#C6E5ED'],
        },
      ],
    };
  };

  // Datos para gráfico de SO
  const getSOData = () => {
    if (!datos?.data) return null;

    const sistemas: { [key: string]: number } = {};
    datos.data.forEach((registro) => {
      const so = extraerSO(registro.sistema_operativo);
      sistemas[so] = (sistemas[so] || 0) + 1;
    });

    const sorted = Object.entries(sistemas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sorted.map(([nombre]) => nombre),
      datasets: [
        {
          data: sorted.map(([, count]) => count),
          backgroundColor: ['#2E86AB', '#48A9A6', '#7FB3D3', '#A6D4E0', '#C6E5ED'],
        },
      ],
    };
  };

  // Datos para gráfico de resoluciones
  const getResolucionesData = () => {
    if (!datos?.data) return null;

    const resoluciones: { [key: string]: number } = {};
    datos.data.forEach((registro) => {
      if (registro.resolucion) {
        resoluciones[registro.resolucion] = (resoluciones[registro.resolucion] || 0) + 1;
      }
    });

    const sorted = Object.entries(resoluciones)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sorted.map(([res]) => res),
      datasets: [
        {
          label: 'Usos',
          data: sorted.map(([, count]) => count),
          backgroundColor: 'rgba(72, 169, 166, 0.7)',
          borderColor: '#48A9A6',
          borderWidth: 2,
        },
      ],
    };
  };

  // Datos para gráfico de dispositivos
  const getDispositivosData = () => {
    if (!datos?.estadisticas) return null;

    const { dispositivos } = datos.estadisticas;
    const data = [];
    const labels = [];
    const colors = [];

    if (dispositivos.movil.total > 0) {
      labels.push('Móvil');
      data.push(dispositivos.movil.total);
      colors.push('#2E86AB');
    }
    if (dispositivos.escritorio.total > 0) {
      labels.push('Escritorio');
      data.push(dispositivos.escritorio.total);
      colors.push('#48A9A6');
    }

    return {
      labels,
      datasets: [{ data, backgroundColor: colors }],
    };
  };

  if (loading && !datos) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error && !datos) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>❌</span>
          <h2>Error al cargar datos</h2>
          <p>{error}</p>
          <button onClick={() => cargarDatos()} className={styles.btnPrimary}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tendenciaData = getTendenciaData();
  const navegadoresData = getNavegadoresData();
  const soData = getSOData();
  const resolucionesData = getResolucionesData();
  const dispositivosData = getDispositivosData();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          Dashboard meskeIA Analytics
          <span className={styles.versionBadge}>v3.0 Turso</span>
        </h1>
        <p className={styles.subtitle}>Sistema de métricas de uso de aplicaciones web</p>

        <div className={styles.headerControls}>
          <button
            onClick={() => cargarDatos()}
            className={styles.btnRefresh}
            disabled={loading}
          >
            <span className={loading ? styles.spinning : ''}>↻</span>
            {loading ? 'Actualizando...' : 'Actualizar Datos'}
          </button>

          {/* Filtro de IP */}
          <div className={styles.ipFilter}>
            <label className={styles.filterToggle}>
              <input
                type="checkbox"
                checked={filtroIPActivo}
                onChange={toggleFiltroIP}
              />
              <span>🧪 Excluir mi IP de desarrollo</span>
            </label>
            <div className={styles.ipInfo}>
              <span className={styles.ipText}>
                {ipConfig?.ip_excluida
                  ? `IP: ${ipConfig.ip_excluida.substring(0, 15)}${ipConfig.ip_excluida.length > 15 ? '...' : ''}`
                  : ipConfig?.ip_actual
                  ? `Tu IP: ${ipConfig.ip_actual.substring(0, 15)}...`
                  : 'IP: No configurada'}
              </span>
              <button
                onClick={guardarMiIP}
                className={styles.btnUpdateIP}
                disabled={actualizandoIP}
                title="Guardar mi IP actual para excluirla"
              >
                {actualizandoIP ? '...' : '🔄 Actualizar IP'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${tabActiva === 'general' ? styles.active : ''}`}
          onClick={() => setTabActiva('general')}
        >
          📊 Visión General
        </button>
        <button
          className={`${styles.tabButton} ${tabActiva === 'tecnico' ? styles.active : ''}`}
          onClick={() => setTabActiva('tecnico')}
        >
          💻 Análisis Técnico
        </button>
        <button
          className={`${styles.tabButton} ${tabActiva === 'ranking' ? styles.active : ''}`}
          onClick={() => setTabActiva('ranking')}
        >
          🏆 Ranking Apps
        </button>
        <button
          className={`${styles.tabButton} ${tabActiva === 'aplicacion' ? styles.active : ''}`}
          onClick={() => setTabActiva('aplicacion')}
        >
          🔍 Por Aplicación
        </button>
        <button
          className={`${styles.tabButton} ${tabActiva === 'registros' ? styles.active : ''}`}
          onClick={() => setTabActiva('registros')}
        >
          📋 Últimos Registros
        </button>
      </nav>

      {/* Tab: Visión General */}
      {tabActiva === 'general' && datos && (
        <div className={styles.tabContent}>
          {/* Comparativa Temporal con Alertas Visuales */}
          {datos.comparativa && (
            <section className={styles.comparativaSection}>
              <h2 className={styles.sectionTitle}>📈 Comparativa Temporal</h2>
              <div className={styles.comparativaGrid}>
                {/* Hoy vs Ayer */}
                <div className={`${styles.comparativaCard} ${styles.cardHoy}`}>
                  <div className={styles.comparativaHeader}>
                    <span className={styles.comparativaIcon}>🔥</span>
                    <span className={styles.comparativaLabel}>Hoy</span>
                  </div>
                  <div className={styles.comparativaValor}>
                    {formatearNumero(datos.comparativa.hoy.usos)}
                  </div>
                  <div className={`${styles.comparativaTendencia} ${styles[datos.comparativa.hoy.comparacion.tendencia]}`}>
                    <span className={styles.tendenciaIcono}>
                      {datos.comparativa.hoy.comparacion.tendencia === 'up' ? '↑' : datos.comparativa.hoy.comparacion.tendencia === 'down' ? '↓' : '→'}
                    </span>
                    <span className={styles.tendenciaPorcentaje}>
                      {datos.comparativa.hoy.comparacion.porcentaje}%
                    </span>
                    <span className={styles.tendenciaEtiqueta}>
                      {datos.comparativa.hoy.etiqueta}
                    </span>
                  </div>
                  <div className={styles.comparativaDetalle}>
                    Ayer: {formatearNumero(datos.comparativa.detalles.ayer)}
                  </div>
                </div>

                {/* Ayer vs Anteayer - NUEVA CARD */}
                <div className={`${styles.comparativaCard} ${styles.cardAyer}`}>
                  <div className={styles.comparativaHeader}>
                    <span className={styles.comparativaIcon}>📅</span>
                    <span className={styles.comparativaLabel}>Ayer</span>
                    {datos.comparativa.ayer.fecha && (
                      <span className={styles.comparativaFecha}>({datos.comparativa.ayer.fecha})</span>
                    )}
                  </div>
                  <div className={styles.comparativaValor}>
                    {formatearNumero(datos.comparativa.ayer.usos)}
                  </div>
                  <div className={`${styles.comparativaTendencia} ${styles[datos.comparativa.ayer.comparacion.tendencia]}`}>
                    <span className={styles.tendenciaIcono}>
                      {datos.comparativa.ayer.comparacion.tendencia === 'up' ? '↑' : datos.comparativa.ayer.comparacion.tendencia === 'down' ? '↓' : '→'}
                    </span>
                    <span className={styles.tendenciaPorcentaje}>
                      {datos.comparativa.ayer.comparacion.porcentaje}%
                    </span>
                    <span className={styles.tendenciaEtiqueta}>
                      {datos.comparativa.ayer.etiqueta}
                    </span>
                  </div>
                  <div className={styles.comparativaDetalle}>
                    Anteayer: {formatearNumero(datos.comparativa.detalles.anteayer)}
                  </div>
                </div>

                {/* Esta semana vs Semana anterior */}
                <div className={`${styles.comparativaCard} ${styles.cardSemana}`}>
                  <div className={styles.comparativaHeader}>
                    <span className={styles.comparativaIcon}>📅</span>
                    <span className={styles.comparativaLabel}>Últimos 7 días</span>
                  </div>
                  <div className={styles.comparativaValor}>
                    {formatearNumero(datos.comparativa.semana.usos)}
                  </div>
                  <div className={`${styles.comparativaTendencia} ${styles[datos.comparativa.semana.comparacion.tendencia]}`}>
                    <span className={styles.tendenciaIcono}>
                      {datos.comparativa.semana.comparacion.tendencia === 'up' ? '↑' : datos.comparativa.semana.comparacion.tendencia === 'down' ? '↓' : '→'}
                    </span>
                    <span className={styles.tendenciaPorcentaje}>
                      {datos.comparativa.semana.comparacion.porcentaje}%
                    </span>
                    <span className={styles.tendenciaEtiqueta}>
                      {datos.comparativa.semana.etiqueta}
                    </span>
                  </div>
                  <div className={styles.comparativaDetalle}>
                    Semana anterior: {formatearNumero(datos.comparativa.detalles.semanaAnterior)}
                  </div>
                </div>

                {/* Este mes vs Mes anterior */}
                <div className={`${styles.comparativaCard} ${styles.cardMes}`}>
                  <div className={styles.comparativaHeader}>
                    <span className={styles.comparativaIcon}>📆</span>
                    <span className={styles.comparativaLabel}>Este mes</span>
                  </div>
                  <div className={styles.comparativaValor}>
                    {formatearNumero(datos.comparativa.mes.usos)}
                  </div>
                  <div className={`${styles.comparativaTendencia} ${styles[datos.comparativa.mes.comparacion.tendencia]}`}>
                    <span className={styles.tendenciaIcono}>
                      {datos.comparativa.mes.comparacion.tendencia === 'up' ? '↑' : datos.comparativa.mes.comparacion.tendencia === 'down' ? '↓' : '→'}
                    </span>
                    <span className={styles.tendenciaPorcentaje}>
                      {datos.comparativa.mes.comparacion.porcentaje}%
                    </span>
                    <span className={styles.tendenciaEtiqueta}>
                      {datos.comparativa.mes.etiqueta}
                    </span>
                  </div>
                  <div className={styles.comparativaDetalle}>
                    Mes anterior: {formatearNumero(datos.comparativa.detalles.mesAnterior)}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Stats Cards (métricas generales) */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.total_usos)}</h3>
                <p>Total de Usos</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏱️</div>
              <div className={styles.statContent}>
                <h3>{datos.estadisticas.duracion_promedio_formato}</h3>
                <p>Duración Promedio</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🚀</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.total_aplicaciones)}</h3>
                <p>Apps Registradas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔄</div>
              <div className={styles.statContent}>
                <h3>{datos.estadisticas.usuarios.recurrentes.porcentaje}%</h3>
                <p>Usuarios Recurrentes</p>
              </div>
            </div>
          </section>

          {/* Gráfico de Tendencia */}
          {tendenciaData && (
            <section className={styles.section}>
              <h2>📈 Tendencia de Uso (Últimos 30 Días)</h2>
              <div className={styles.chartContainer}>
                <Line
                  data={tendenciaData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  }}
                />
              </div>
            </section>
          )}

          {/* Dispositivos */}
          <section className={styles.section}>
            <h2>📱 Distribución por Dispositivo</h2>
            <div className={styles.deviceStats}>
              <div className={styles.deviceCard}>
                <span className={styles.deviceIcon}>📱</span>
                <div>
                  <strong>{formatearNumero(datos.estadisticas.dispositivos.movil.total)}</strong>
                  <span>Móvil ({datos.estadisticas.dispositivos.movil.porcentaje}%)</span>
                </div>
                <div
                  className={styles.progressBar}
                  style={{ '--progress': `${datos.estadisticas.dispositivos.movil.porcentaje}%` } as React.CSSProperties}
                ></div>
              </div>
              <div className={styles.deviceCard}>
                <span className={styles.deviceIcon}>🖥️</span>
                <div>
                  <strong>{formatearNumero(datos.estadisticas.dispositivos.escritorio.total)}</strong>
                  <span>Escritorio ({datos.estadisticas.dispositivos.escritorio.porcentaje}%)</span>
                </div>
                <div
                  className={styles.progressBar}
                  style={{ '--progress': `${datos.estadisticas.dispositivos.escritorio.porcentaje}%` } as React.CSSProperties}
                ></div>
              </div>
            </div>
          </section>

          {/* Geografía */}
          {datos.estadisticas.geografia.paises.length > 0 && (
            <section className={styles.section}>
              <h2>🌍 Top Países</h2>
              <div className={styles.geoList}>
                {datos.estadisticas.geografia.paises.slice(0, 5).map((pais, idx) => (
                  <div key={pais.pais} className={styles.geoItem}>
                    <span className={styles.geoRank}>#{idx + 1}</span>
                    <span className={styles.geoName}>{pais.pais}</span>
                    <span className={styles.geoCount}>{formatearNumero(Number(pais.total))}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab: Análisis Técnico */}
      {tabActiva === 'tecnico' && datos && (
        <div className={styles.tabContent}>
          {/* Stats de dispositivos */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📱</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.dispositivos.movil.total)}</h3>
                <p>Móvil ({datos.estadisticas.dispositivos.movil.porcentaje}%)</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🖥️</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.dispositivos.escritorio.total)}</h3>
                <p>Escritorio ({datos.estadisticas.dispositivos.escritorio.porcentaje}%)</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🆕</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.usuarios.nuevos.total)}</h3>
                <p>Nuevos Usuarios</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔁</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.usuarios.recurrentes.total)}</h3>
                <p>Usuarios Recurrentes</p>
              </div>
            </div>
          </section>

          {/* Gráficos técnicos */}
          <div className={styles.chartsGrid}>
            {dispositivosData && (
              <section className={styles.chartSection}>
                <h2>📱 Tipo de Dispositivo</h2>
                <div className={styles.chartContainerSmall}>
                  <Doughnut
                    data={dispositivosData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              </section>
            )}

            {navegadoresData && (
              <section className={styles.chartSection}>
                <h2>🌐 Navegadores</h2>
                <div className={styles.chartContainerSmall}>
                  <Doughnut
                    data={navegadoresData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              </section>
            )}

            {soData && (
              <section className={styles.chartSection}>
                <h2>💻 Sistemas Operativos</h2>
                <div className={styles.chartContainerSmall}>
                  <Doughnut
                    data={soData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              </section>
            )}

            {resolucionesData && (
              <section className={styles.chartSection}>
                <h2>📐 Resoluciones</h2>
                <div className={styles.chartContainerSmall}>
                  <Bar
                    data={resolucionesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    }}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* Tab: Ranking */}
      {tabActiva === 'ranking' && datos && (
        <div className={styles.tabContent}>
          <section className={styles.section}>
            <h2>🏆 Ranking de Aplicaciones</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Aplicación</th>
                    <th>Usos</th>
                    <th>Último Uso</th>
                    <th>Tiempo Promedio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.ranking_aplicaciones.map((app, idx) => (
                    <tr key={app.aplicacion}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{app.aplicacion}</strong>
                      </td>
                      <td>{formatearNumero(app.total_usos)}</td>
                      <td>{app.ultimo_uso?.split(' ')[0] || '-'}</td>
                      <td>{app.duracion_promedio_formato}</td>
                      <td>
                        <span className={styles.statusBadge}>{app.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Tab: Por Aplicación */}
      {tabActiva === 'aplicacion' && datos && (
        <div className={styles.tabContent}>
          <section className={styles.section}>
            <h2>🔍 Estadísticas por Aplicación</h2>

            {/* Selector de aplicación */}
            <div className={styles.appSelector}>
              <label htmlFor="app-select">Selecciona una aplicación:</label>
              <select
                id="app-select"
                value={appSeleccionada}
                onChange={(e) => setAppSeleccionada(e.target.value)}
                className={styles.selectApp}
              >
                <option value="">-- Todas las aplicaciones --</option>
                {datos.ranking_aplicaciones.map((app) => (
                  <option key={app.aplicacion} value={app.aplicacion}>
                    {app.aplicacion} ({app.total_usos} usos)
                  </option>
                ))}
              </select>
            </div>

            {/* Estadísticas de la app seleccionada */}
            {appSeleccionada ? (
              <>
                {(() => {
                  const appData = datos.ranking_aplicaciones.find(a => a.aplicacion === appSeleccionada);
                  const registrosApp = datos.data.filter(r => r.aplicacion === appSeleccionada);
                  const registrosHoy = registrosApp.filter(r => {
                    const partes = r.timestamp.split(' ');
                    if (partes.length !== 2) return false;
                    const [fecha] = partes;
                    const [dia, mes, anio] = fecha.split('/');
                    const fechaRegistro = new Date(`${anio}-${mes}-${dia}`);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    return fechaRegistro >= hoy;
                  });

                  const dispositivosApp = {
                    movil: registrosApp.filter(r => r.tipo_dispositivo === 'movil').length,
                    escritorio: registrosApp.filter(r => r.tipo_dispositivo === 'escritorio').length,
                  };

                  return (
                    <>
                      <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>📊</div>
                          <div className={styles.statContent}>
                            <h3>{formatearNumero(appData?.total_usos || 0)}</h3>
                            <p>Total de Usos</p>
                          </div>
                        </div>
                        <div className={`${styles.statCard} ${styles.highlight}`}>
                          <div className={styles.statIcon}>🔥</div>
                          <div className={styles.statContent}>
                            <h3>{formatearNumero(registrosHoy.length)}</h3>
                            <p>Usos de Hoy</p>
                          </div>
                        </div>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>⏱️</div>
                          <div className={styles.statContent}>
                            <h3>{appData?.duracion_promedio_formato || '0s'}</h3>
                            <p>Duración Promedio</p>
                          </div>
                        </div>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>📅</div>
                          <div className={styles.statContent}>
                            <h3>{appData?.ultimo_uso?.split(' ')[0] || '-'}</h3>
                            <p>Último Uso</p>
                          </div>
                        </div>
                      </div>

                      {/* Dispositivos para esta app */}
                      <div className={styles.deviceStats}>
                        <div className={styles.deviceCard}>
                          <span className={styles.deviceIcon}>📱</span>
                          <div>
                            <strong>{formatearNumero(dispositivosApp.movil)}</strong>
                            <span>Móvil ({registrosApp.length > 0 ? Math.round((dispositivosApp.movil / registrosApp.length) * 100) : 0}%)</span>
                          </div>
                          <div
                            className={styles.progressBar}
                            style={{ '--progress': `${registrosApp.length > 0 ? (dispositivosApp.movil / registrosApp.length) * 100 : 0}%` } as React.CSSProperties}
                          ></div>
                        </div>
                        <div className={styles.deviceCard}>
                          <span className={styles.deviceIcon}>🖥️</span>
                          <div>
                            <strong>{formatearNumero(dispositivosApp.escritorio)}</strong>
                            <span>Escritorio ({registrosApp.length > 0 ? Math.round((dispositivosApp.escritorio / registrosApp.length) * 100) : 0}%)</span>
                          </div>
                          <div
                            className={styles.progressBar}
                            style={{ '--progress': `${registrosApp.length > 0 ? (dispositivosApp.escritorio / registrosApp.length) * 100 : 0}%` } as React.CSSProperties}
                          ></div>
                        </div>
                      </div>

                      {/* Últimos registros de esta app */}
                      <h3 className={styles.appRegistrosTitle}>📋 Últimos 20 registros de {appSeleccionada}</h3>
                      <div className={styles.tableContainer}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Fecha/Hora</th>
                              <th>Duración</th>
                              <th>País</th>
                              <th>Ciudad</th>
                              <th>Dispositivo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {registrosApp.slice(0, 20).map((registro) => (
                              <tr key={registro.id}>
                                <td>{registro.id}</td>
                                <td>{registro.timestamp}</td>
                                <td>
                                  {registro.duracion_segundos
                                    ? `${Math.floor(registro.duracion_segundos / 60)}m ${registro.duracion_segundos % 60}s`
                                    : '-'}
                                </td>
                                <td>{registro.pais || '-'}</td>
                                <td>{registro.ciudad || '-'}</td>
                                <td>{registro.tipo_dispositivo === 'movil' ? '📱' : '🖥️'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <div className={styles.noAppSelected}>
                <p>👆 Selecciona una aplicación del menú para ver sus estadísticas detalladas.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab: Últimos Registros */}
      {tabActiva === 'registros' && datos && (
        <div className={styles.tabContent}>
          <section className={styles.section}>
            <h2>📋 Últimos 100 Registros</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Aplicación</th>
                    <th>Fecha/Hora</th>
                    <th>Duración</th>
                    <th>País</th>
                    <th>Ciudad</th>
                    <th>Dispositivo</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.data.slice(0, 100).map((registro) => (
                    <tr key={registro.id}>
                      <td>{registro.id}</td>
                      <td>
                        <strong>{registro.aplicacion}</strong>
                      </td>
                      <td>{registro.timestamp}</td>
                      <td>
                        {registro.duracion_segundos
                          ? `${Math.floor(registro.duracion_segundos / 60)}m ${registro.duracion_segundos % 60}s`
                          : '-'}
                      </td>
                      <td>{registro.pais || '-'}</td>
                      <td>{registro.ciudad || '-'}</td>
                      <td>{registro.tipo_dispositivo === 'movil' ? '📱' : '🖥️'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <span className={loading ? styles.statusLoading : styles.statusSuccess}>
          {loading ? '⏳ Cargando...' : '✅ Conectado'}
        </span>
        {filtroIPActivo && ipConfig?.ip_excluida && (
          <span className={styles.filterActive}>🧪 Filtro IP activo</span>
        )}
        <span className={styles.lastUpdate}>
          Última actualización: {ultimaActualizacion || '-'}
        </span>
      </div>
    </div>
  );
}
