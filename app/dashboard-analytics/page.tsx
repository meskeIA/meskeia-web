'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './DashboardAnalytics.module.css';
import { MeskeiaLogo, LegalNotice } from '@/components';
import { trpc } from '@/lib/trpc';

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
    por_compartir: number;
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
    modo: string | null;
    datos_adicionales?: any;
  }>;
}

interface IPConfig {
  ip_actual: string;
  ip_excluida: string;
  activo: boolean;
}

const NOMBRES_PAIS: Record<string, string> = {
  AD: 'Andorra', AE: 'Emiratos Árabes', AF: 'Afganistán', AL: 'Albania',
  AR: 'Argentina', AT: 'Austria', AU: 'Australia', AZ: 'Azerbaiyán',
  BA: 'Bosnia-Herzegovina', BE: 'Bélgica', BG: 'Bulgaria', BO: 'Bolivia',
  BR: 'Brasil', BY: 'Bielorrusia', CA: 'Canadá', CH: 'Suiza',
  CL: 'Chile', CN: 'China', CO: 'Colombia', CR: 'Costa Rica',
  CU: 'Cuba', CZ: 'Chequia', DE: 'Alemania', DK: 'Dinamarca',
  DO: 'Rep. Dominicana', DZ: 'Argelia', EC: 'Ecuador', EE: 'Estonia',
  EG: 'Egipto', ES: 'España', FI: 'Finlandia', FR: 'Francia',
  GB: 'Reino Unido', GR: 'Grecia', GT: 'Guatemala', HK: 'Hong Kong',
  HN: 'Honduras', HR: 'Croacia', HU: 'Hungría', ID: 'Indonesia',
  IE: 'Irlanda', IL: 'Israel', IN: 'India', IQ: 'Irak',
  IR: 'Irán', IT: 'Italia', JP: 'Japón', KR: 'Corea del Sur',
  KZ: 'Kazajistán', LT: 'Lituania', LU: 'Luxemburgo', LV: 'Letonia',
  MA: 'Marruecos', MX: 'México', MY: 'Malasia', NI: 'Nicaragua',
  NL: 'Países Bajos', NO: 'Noruega', NZ: 'Nueva Zelanda', PA: 'Panamá',
  PE: 'Perú', PH: 'Filipinas', PK: 'Pakistán', PL: 'Polonia',
  PR: 'Puerto Rico', PT: 'Portugal', PY: 'Paraguay', RO: 'Rumanía',
  RS: 'Serbia', RU: 'Rusia', SA: 'Arabia Saudí', SE: 'Suecia',
  SG: 'Singapur', SK: 'Eslovaquia', SV: 'El Salvador', TH: 'Tailandia',
  TR: 'Türkiye', TW: 'Taiwán', UA: 'Ucrania', US: 'Estados Unidos',
  UY: 'Uruguay', UZ: 'Uzbekistán', VE: 'Venezuela', VN: 'Vietnam',
  ZA: 'Sudáfrica',
};

export default function DashboardAnalyticsPage() {
  const [tabActiva, setTabActiva] = useState<'general' | 'tecnico' | 'ranking' | 'aplicacion' | 'registros' | 'resumen' | 'navegacion'>('general');
  const [appSeleccionada, setAppSeleccionada] = useState<string>('');
  const [filtroApp, setFiltroApp] = useState('');
  const [filtroIPActivo, setFiltroIPActivo] = useState(true);
  const [filtroModo, setFiltroModo] = useState<'todos' | 'web' | 'referral-ia' | 'chatgpt' | 'mcp' | 'bot'>('todos');

  // Ref para control de inicialización
  const iniciado = useRef(false);

  // tRPC: Obtener estadísticas (con refetch manual)
  const statsQuery = trpc.analytics.getStats.useQuery(
    { limite: 500, excluir_mi_ip: filtroIPActivo },
    { enabled: true } // Siempre habilitado
  );

  // tRPC: Estadísticas por app (sin límite de 500 registros)
  const appStatsQuery = trpc.analytics.getAppStats.useQuery(
    { aplicacion: appSeleccionada, excluir_mi_ip: filtroIPActivo },
    { enabled: !!appSeleccionada }
  );

  // tRPC: Tendencia de uso últimos 30 días (calculada en DB)
  const tendencia30Query = trpc.analytics.getTendencia30Dias.useQuery(
    { excluir_mi_ip: filtroIPActivo },
    { enabled: true }
  );

  // tRPC: Resumen por origen (nueva pestaña)
  const resumenQuery = trpc.analytics.getResumen.useQuery({});

  // tRPC: Navegación (apps por sesión, pares from→to, apps puente)
  const navegacionQuery = trpc.analytics.getNavegacion.useQuery({ dias: 14 });

  // tRPC: Tendencias históricas (mensual 2026, canales, LATAM)
  const tendenciasQuery = trpc.analytics.getTendencias.useQuery({ excluir_mi_ip: filtroIPActivo });

  // tRPC: Distribución de duraciones de visita
  const distribucionQuery = trpc.analytics.getDistribucionDuraciones.useQuery({ excluir_mi_ip: filtroIPActivo });

  // tRPC: Obtener configuración de IP
  const ipConfigQuery = trpc.analytics.getIPConfig.useQuery(
    { ip_actual: typeof window !== 'undefined' ? window.location.hostname : 'unknown' },
    { enabled: typeof window !== 'undefined' }
  );

  // tRPC: Mutation para actualizar IP
  const updateIPMutation = trpc.analytics.updateIPFilter.useMutation({
    onSuccess: (data) => {
      alert(`✅ IP guardada: ${data.data.ip_excluida}\n\nTus pruebas ya no se registrarán.`);
      statsQuery.refetch();
      tendencia30Query.refetch();
    },
    onError: () => {
      alert('❌ Error al guardar IP');
    },
  });

  // Variables derivadas de los queries
  const datos = statsQuery.data || null;
  const loading = statsQuery.isLoading || statsQuery.isFetching || resumenQuery.isFetching || tendencia30Query.isFetching;
  const error = statsQuery.error?.message || null;
  const ipConfig = ipConfigQuery.data?.data || null;
  const actualizandoIP = updateIPMutation.isPending;

  // Última actualización
  const ultimaActualizacion = statsQuery.dataUpdatedAt
    ? new Date(statsQuery.dataUpdatedAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  // Guardar IP actual como excluida
  const guardarMiIP = () => {
    updateIPMutation.mutate({
      ip_actual: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      activo: filtroIPActivo,
    });
  };

  // Toggle filtro IP
  const toggleFiltroIP = () => {
    const nuevoEstado = !filtroIPActivo;
    setFiltroIPActivo(nuevoEstado);
    localStorage.setItem('filtroMiIPActivo', nuevoEstado.toString());
    // El query se refetcheará automáticamente cuando cambien los inputs
  };

  // Efecto de inicialización (solo una vez)
  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    // Cargar preferencia de localStorage
    const prefLocal = localStorage.getItem('filtroMiIPActivo');
    if (prefLocal !== null) {
      setFiltroIPActivo(prefLocal === 'true');
    }
  }, []);

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

  // Datos para gráfico de tendencia (últimos 30 días) — calculados en DB
  const getTendenciaData = () => {
    const dias = tendencia30Query.data?.dias;
    if (!dias) return null;

    return {
      labels: dias.map((d) => d.fecha),
      datasets: [
        {
          label: 'Usos por Día',
          data: dias.map((d) => d.usos),
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
    datos.data.forEach((registro: any) => {
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
    datos.data.forEach((registro: any) => {
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
    datos.data.forEach((registro: any) => {
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

      <LegalNotice />
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
          <button onClick={() => statsQuery.refetch()} className={styles.btnPrimary}>
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
            onClick={() => { statsQuery.refetch(); resumenQuery.refetch(); }}
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
          className={`${styles.tabButton} ${tabActiva === 'resumen' ? styles.active : ''}`}
          onClick={() => setTabActiva('resumen')}
        >
          📈 Resumen IA
        </button>
        <button
          className={`${styles.tabButton} ${tabActiva === 'registros' ? styles.active : ''}`}
          onClick={() => setTabActiva('registros')}
        >
          📋 Últimos Registros
        </button>
        <button
          className={`${styles.tabButton} ${tabActiva === 'navegacion' ? styles.active : ''}`}
          onClick={() => setTabActiva('navegacion')}
        >
          🧭 Navegación
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

              {/* Segunda fila: apps distintas por período */}
              <div className={styles.appsDistintasGrid}>
                <div className={styles.appsDistintasCard}>
                  <span className={styles.appsDistintasIcono}>🧩</span>
                  <span className={styles.appsDistintasValor}>{formatearNumero(datos.comparativa.hoy.apps_distintas ?? 0)}</span>
                  <span className={styles.appsDistintasLabel}>apps distintas hoy</span>
                </div>
                <div className={styles.appsDistintasCard}>
                  <span className={styles.appsDistintasIcono}>🧩</span>
                  <span className={styles.appsDistintasValor}>{formatearNumero(datos.comparativa.ayer.apps_distintas ?? 0)}</span>
                  <span className={styles.appsDistintasLabel}>apps distintas ayer</span>
                </div>
                <div className={styles.appsDistintasCard}>
                  <span className={styles.appsDistintasIcono}>🧩</span>
                  <span className={styles.appsDistintasValor}>{formatearNumero(datos.comparativa.semana.apps_distintas ?? 0)}</span>
                  <span className={styles.appsDistintasLabel}>apps distintas 7 días</span>
                </div>
                <div className={styles.appsDistintasCard}>
                  <span className={styles.appsDistintasIcono}>🧩</span>
                  <span className={styles.appsDistintasValor}>{formatearNumero(datos.comparativa.mes.apps_distintas ?? 0)}</span>
                  <span className={styles.appsDistintasLabel}>apps distintas este mes</span>
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

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔗</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.por_compartir ?? 0)}</h3>
                <p>Llegaron por Compartir</p>
              </div>
            </div>
          </section>

          {/* Evolución mensual 2026 */}
          {tendenciasQuery.data && tendenciasQuery.data.mensual.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📊 Evolución Mensual {new Date().getFullYear()}</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--primary)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)' }}>Mes</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)' }}>Visitas</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)' }}>Sesiones</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)' }}>Países</th>
                      <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)' }}>Tendencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tendenciasQuery.data.mensual.map((fila, idx) => {
                      const prev = tendenciasQuery.data!.mensual[idx - 1];
                      const pct = prev && prev.visitas > 0
                        ? Math.round(((fila.visitas - prev.visitas) / prev.visitas) * 100)
                        : null;
                      const max = Math.max(...tendenciasQuery.data!.mensual.map(m => m.visitas));
                      const barWidth = Math.round((fila.visitas / max) * 100);
                      return (
                        <tr key={fila.mes} style={{ borderBottom: '1px solid var(--bg-primary)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{fila.mes}</td>
                          <td style={{ textAlign: 'right', padding: '8px 12px' }}>{fila.visitas.toLocaleString('es-ES')}</td>
                          <td style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)' }}>{fila.sesiones.toLocaleString('es-ES')}</td>
                          <td style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)' }}>{fila.paises}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', minWidth: '60px' }}>
                                <div style={{ width: `${barWidth}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                              </div>
                              {pct !== null && (
                                <span style={{ fontSize: '0.8rem', color: pct >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600, minWidth: '45px' }}>
                                  {pct >= 0 ? '+' : '-'}{Math.abs(pct)}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Canal de tráfico + LATAM */}
          {tendenciasQuery.data && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📡 Canal de Tráfico y Alcance LATAM</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Canal de tráfico */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--bg-primary)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Origen de visitas (mes actual)
                  </h3>
                  {(() => {
                    const canales = tendenciasQuery.data!.canales;
                    const total = Object.values(canales).reduce((a, b) => a + b, 0);
                    const items = [
                      { key: 'web', label: 'Orgánico / Directo', icon: '🌐' },
                      { key: 'ia', label: 'IAs (ChatGPT, Copilot…)', icon: '🤖' },
                      { key: 'social', label: 'Redes sociales (X, etc.)', icon: '📱' },
                      { key: 'pwa', label: 'PWA instalada', icon: '📲' },
                    ];
                    return items.map(({ key, label, icon }) => {
                      const v = canales[key] ?? 0;
                      const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                      return (
                        <div key={key} style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.85rem' }}>
                            <span>{icon} {label}</span>
                            <span style={{ fontWeight: 700 }}>{v.toLocaleString('es-ES')} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({pct}%)</span></span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* LATAM */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--bg-primary)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Alcance LATAM
                  </h3>
                  {tendenciasQuery.data!.latam.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin datos</p>
                  ) : (
                    tendenciasQuery.data!.latam.map(fila => (
                      <div key={fila.mes} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>{fila.mes}</span>
                          <span style={{ fontWeight: 700, color: fila.pct >= 30 ? '#22c55e' : 'var(--primary)' }}>
                            {fila.pct}% LATAM
                          </span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                          <div style={{ width: `${fila.pct}%`, height: '100%', background: fila.pct >= 30 ? '#22c55e' : 'var(--primary)', borderRadius: '4px' }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {fila.latam.toLocaleString('es-ES')} de {fila.total.toLocaleString('es-ES')} visitas
                        </div>
                      </div>
                    ))
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Objetivo reposicionamiento: ≥30% LATAM
                  </p>
                </div>
              </div>
            </section>
          )}

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
              <div className={styles.geoGrid}>
                <div className={styles.geoList}>
                  {datos.estadisticas.geografia.paises.slice(0, 10).map((p: { pais: string; total: number }, idx) => (
                    <div key={String(p.pais)} className={styles.geoItem}>
                      <span className={styles.geoRank}>#{idx + 1}</span>
                      <span className={styles.geoName}>{NOMBRES_PAIS[p.pais] ?? p.pais}</span>
                      <span className={styles.geoCount}>{formatearNumero(Number(p.total))}</span>
                    </div>
                  ))}
                </div>
                {datos.estadisticas.geografia.paises.length > 10 && (
                  <div className={styles.geoList}>
                    {datos.estadisticas.geografia.paises.slice(10, 20).map((p: { pais: string; total: number }, idx) => (
                      <div key={String(p.pais)} className={styles.geoItem}>
                        <span className={styles.geoRank}>#{idx + 11}</span>
                        <span className={styles.geoName}>{NOMBRES_PAIS[p.pais] ?? p.pais}</span>
                        <span className={styles.geoCount}>{formatearNumero(Number(p.total))}</span>
                      </div>
                    ))}
                  </div>
                )}
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

          {/* Distribución de duraciones */}
          {distribucionQuery.data && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>⏱️ Distribución de Duración de Visitas</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Total: <strong>{formatearNumero(distribucionQuery.data.total)}</strong> visitas —{' '}
                <strong style={{ color: '#10b981' }}>
                  {distribucionQuery.data.buckets.slice(2).reduce((s, b) => s + b.pct, 0).toFixed(1)}%
                </strong>{' '}
                con duración registrada ≥ 30s
              </p>

              {/* Barras horizontales por bucket */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {distribucionQuery.data.buckets.map(b => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '110px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
                      {b.label}
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                      <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: '4px', minWidth: b.valor > 0 ? '4px' : '0' }} />
                    </div>
                    <div style={{ width: '48px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: b.color, flexShrink: 0 }}>
                      {b.pct}%
                    </div>
                    <div style={{ width: '70px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatearNumero(b.valor)} vis.
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {b.descripcion}
                    </div>
                  </div>
                ))}
              </div>

              {/* Top apps por duración media */}
              {distribucionQuery.data.topPorDuracion.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    🏅 Apps con mayor tiempo medio de uso
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Aplicación</th>
                          <th>Usos totales</th>
                          <th>Con duración</th>
                          <th>Tiempo medio</th>
                          <th>Tiempo máx.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distribucionQuery.data.topPorDuracion.map((app, idx) => {
                          const fmtSeg = (s: number) => {
                            if (!s) return '-';
                            if (s < 60) return `${s}s`;
                            const m = Math.floor(s / 60);
                            const r = s % 60;
                            return r > 0 ? `${m}m ${r}s` : `${m}m`;
                          };
                          return (
                            <tr key={app.aplicacion}>
                              <td>{idx + 1}</td>
                              <td><strong>{app.aplicacion}</strong></td>
                              <td>{formatearNumero(app.totalUsos)}</td>
                              <td>{formatearNumero(app.conDuracion)}</td>
                              <td style={{ fontWeight: 700, color: '#10b981' }}>{fmtSeg(app.duracionMedia)}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{fmtSeg(app.duracionMax)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}
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
                  {datos.ranking_aplicaciones.map((app: any, idx) => (
                    <tr key={String(app.aplicacion)}>
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

            {/* Selector de aplicación con búsqueda */}
            <div className={styles.appSelector}>
              <label>Selecciona una aplicación:</label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtroApp}
                onChange={(e) => setFiltroApp(e.target.value)}
                className={styles.searchApp}
              />
              <select
                value={appSeleccionada}
                onChange={(e) => { setAppSeleccionada(e.target.value); setFiltroApp(''); }}
                className={styles.selectApp}
              >
                <option value="">-- Selecciona una aplicación --</option>
                {datos.ranking_aplicaciones
                  .filter((app: any) =>
                    !filtroApp || String(app.aplicacion).toLowerCase().includes(filtroApp.toLowerCase())
                  )
                  .map((app: any) => (
                    <option key={String(app.aplicacion)} value={String(app.aplicacion)}>
                      {app.aplicacion} ({app.total_usos} usos)
                    </option>
                  ))}
              </select>
            </div>

            {/* Estadísticas de la app seleccionada */}
            {appSeleccionada ? (
              <>
                {(() => {
                  const appData = datos.ranking_aplicaciones.find((a: any) => a.aplicacion === appSeleccionada);
                  const appStats = appStatsQuery.data;
                  const registrosApp = appStats?.registros ?? [];
                  const usosHoy = appStats?.usos_hoy ?? 0;
                  const dispositivosApp = {
                    movil: appStats?.dispositivos.movil ?? 0,
                    escritorio: appStats?.dispositivos.escritorio ?? 0,
                  };
                  const totalDispositivos = dispositivosApp.movil + dispositivosApp.escritorio;

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
                            <h3>{formatearNumero(usosHoy)}</h3>
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
                            <h3>{appData?.ultimo_uso ? String(appData.ultimo_uso).split(', ')[0] : '-'}</h3>
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
                            <span>Móvil ({totalDispositivos > 0 ? Math.round((dispositivosApp.movil / totalDispositivos) * 100) : 0}%)</span>
                          </div>
                          <div
                            className={styles.progressBar}
                            style={{ '--progress': `${totalDispositivos > 0 ? (dispositivosApp.movil / totalDispositivos) * 100 : 0}%` } as React.CSSProperties}
                          ></div>
                        </div>
                        <div className={styles.deviceCard}>
                          <span className={styles.deviceIcon}>🖥️</span>
                          <div>
                            <strong>{formatearNumero(dispositivosApp.escritorio)}</strong>
                            <span>Escritorio ({totalDispositivos > 0 ? Math.round((dispositivosApp.escritorio / totalDispositivos) * 100) : 0}%)</span>
                          </div>
                          <div
                            className={styles.progressBar}
                            style={{ '--progress': `${totalDispositivos > 0 ? (dispositivosApp.escritorio / totalDispositivos) * 100 : 0}%` } as React.CSSProperties}
                          ></div>
                        </div>
                      </div>

                      {/* Últimos registros de esta app */}
                      <h3 className={styles.appRegistrosTitle}>📋 Últimos 100 registros de {appSeleccionada}</h3>
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
                            {registrosApp.map((registro: any) => (
                              <tr key={String(registro.id)}>
                                <td>{String(registro.id)}</td>
                                <td>{String(registro.timestamp)}</td>
                                <td>
                                  {registro.duracion_segundos
                                    ? `${Math.floor(Number(registro.duracion_segundos) / 60)}m ${Number(registro.duracion_segundos) % 60}s`
                                    : '-'}
                                </td>
                                <td>{String(registro.pais || '-')}</td>
                                <td>{String(registro.ciudad || '-')}</td>
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
            <div className={styles.registrosHeader}>
              <h2>📋 Últimos 100 Registros</h2>
              <div className={styles.filtroModoGroup}>
                <button
                  type="button"
                  className={`${styles.filtroModoBtn} ${filtroModo === 'todos' ? styles.filtroModoActivo : ''}`}
                  onClick={() => setFiltroModo('todos')}
                >
                  Todos ({datos.data.length})
                </button>
                <button
                  type="button"
                  className={`${styles.filtroModoBtn} ${filtroModo === 'web' ? styles.filtroModoActivo : ''}`}
                  onClick={() => setFiltroModo('web')}
                >
                  🌐 Web ({datos.data.filter((r: any) => r.modo !== 'mcp' && r.modo !== 'referral-ia' && r.modo !== 'bot' && r.modo !== 'chatgpt').length})
                </button>
                <button
                  type="button"
                  className={`${styles.filtroModoBtn} ${filtroModo === 'referral-ia' ? styles.filtroModoActivoReferral : ''}`}
                  onClick={() => setFiltroModo('referral-ia')}
                >
                  🔗 Desde IA ({datos.data.filter((r: any) => r.modo === 'referral-ia').length})
                </button>
                <button
                  type="button"
                  className={`${styles.filtroModoBtn} ${filtroModo === 'chatgpt' ? styles.filtroModoActivoChatGPT : ''}`}
                  onClick={() => setFiltroModo('chatgpt')}
                >
                  💬 ChatGPT ({datos.data.filter((r: any) => r.modo === 'chatgpt').length})
                </button>
                <button
                  type="button"
                  className={`${styles.filtroModoBtn} ${filtroModo === 'mcp' ? styles.filtroModoActivoMCP : ''}`}
                  onClick={() => setFiltroModo('mcp')}
                >
                  🤖 IA / MCP ({datos.data.filter((r: any) => r.modo === 'mcp').length})
                </button>
                <button
                  type="button"
                  className={`${styles.filtroModoBtn} ${filtroModo === 'bot' ? styles.filtroModoActivoBot : ''}`}
                  onClick={() => setFiltroModo('bot')}
                >
                  🕷️ Bots ({datos.data.filter((r: any) => r.modo === 'bot').length})
                </button>
              </div>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Aplicación</th>
                    <th>Origen</th>
                    <th>Fecha/Hora</th>
                    <th>Duración</th>
                    <th>País</th>
                    <th>Dispositivo</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.data
                    .filter((r: any) => {
                      if (filtroModo === 'web') return r.modo !== 'mcp' && r.modo !== 'referral-ia' && r.modo !== 'bot' && r.modo !== 'chatgpt';
                      if (filtroModo === 'referral-ia') return r.modo === 'referral-ia';
                      if (filtroModo === 'chatgpt') return r.modo === 'chatgpt';
                      if (filtroModo === 'mcp') return r.modo === 'mcp';
                      if (filtroModo === 'bot') return r.modo === 'bot';
                      return true;
                    })
                    .slice(0, 100)
                    .map((registro: any) => (
                      <tr key={registro.id} className={
                        registro.modo === 'mcp' ? styles.rowMCP :
                        registro.modo === 'chatgpt' ? styles.rowChatGPT :
                        registro.modo === 'referral-ia' ? styles.rowReferral :
                        registro.modo === 'bot' ? styles.rowBot : ''
                      }>
                        <td>{registro.id}</td>
                        <td><strong>{registro.aplicacion}</strong></td>
                        <td>
                          {registro.modo === 'mcp'
                            ? <span className={styles.badgeMCP}>🤖 MCP</span>
                            : registro.modo === 'chatgpt'
                            ? <span className={styles.badgeChatGPT}>💬 ChatGPT</span>
                            : registro.modo === 'referral-ia'
                            ? <span className={styles.badgeReferral}>🔗 Desde IA</span>
                            : registro.modo === 'bot'
                            ? <span className={styles.badgeBot}>🕷️ Bot</span>
                            : <span className={styles.badgeWeb}>🌐 Web</span>}
                        </td>
                        <td>{registro.timestamp}</td>
                        <td>
                          {registro.duracion_segundos
                            ? `${Math.floor(registro.duracion_segundos / 60)}m ${registro.duracion_segundos % 60}s`
                            : '-'}
                        </td>
                        <td>{registro.pais || '-'}</td>
                        <td>{registro.tipo_dispositivo === 'movil' ? '📱' : '🖥️'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Tab: Resumen IA */}
      {tabActiva === 'resumen' && (
        <div className={styles.tabContent}>
          <section className={styles.section}>
            <h2>📈 Resumen por Origen</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Desglose completo de visitas por origen y período. Total Real excluye Bots y Mi IP.
            </p>

            {resumenQuery.isLoading && <p>Cargando resumen...</p>}
            {resumenQuery.error && <p style={{ color: 'red' }}>Error al cargar resumen</p>}

            {resumenQuery.data && (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Origen</th>
                      <th style={{ textAlign: 'center' }}>Hoy</th>
                      <th style={{ textAlign: 'center' }}>Ayer</th>
                      <th style={{ textAlign: 'center' }}>7 días</th>
                      <th style={{ textAlign: 'center' }}>Este mes</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenQuery.data.filas.map((fila) => {
                      const esCero = fila.total === 0;
                      const esGrupoIA = fila.grupo === 'ia';
                      const esBot = fila.grupo === 'bot';
                      const esMiIP = fila.grupo === 'miip';
                      const rowStyle: React.CSSProperties = {
                        opacity: esCero ? 0.4 : 1,
                        backgroundColor: esGrupoIA
                          ? 'rgba(72, 169, 166, 0.05)'
                          : esBot || esMiIP
                          ? 'rgba(0,0,0,0.03)'
                          : undefined,
                      };
                      return (
                        <tr key={fila.origen} style={rowStyle}>
                          <td>
                            <span style={{ marginRight: '0.4rem' }}>{fila.icono}</span>
                            {fila.origen}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: fila.hoy > 0 ? 600 : 400 }}>
                            {fila.hoy > 0 ? fila.hoy : '–'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {fila.ayer > 0 ? fila.ayer : '–'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {fila.semana > 0 ? fila.semana : '–'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {fila.mes > 0 ? fila.mes : '–'}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: fila.total > 0 ? 600 : 400 }}>
                            {fila.total > 0 ? fila.total : '–'}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Fila Total Real */}
                    <tr style={{ borderTop: '2px solid var(--primary)', fontWeight: 700 }}>
                      <td>✅ TOTAL REAL</td>
                      <td style={{ textAlign: 'center' }}>{resumenQuery.data.totalReal.hoy || '–'}</td>
                      <td style={{ textAlign: 'center' }}>{resumenQuery.data.totalReal.ayer || '–'}</td>
                      <td style={{ textAlign: 'center' }}>{resumenQuery.data.totalReal.semana || '–'}</td>
                      <td style={{ textAlign: 'center' }}>{resumenQuery.data.totalReal.mes || '–'}</td>
                      <td style={{ textAlign: 'center' }}>{resumenQuery.data.totalReal.total || '–'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
              * Las visitas anteriores al 20/03/2026 aparecen en &quot;IA sin detalle&quot; (datos no disponibles antes de esa fecha).
            </p>
          </section>
        </div>
      )}

      {/* Tab: Navegación */}
      {tabActiva === 'navegacion' && (
        <div className={styles.tabContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🧭 Navegación entre apps</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Análisis del recorrido de los usuarios por sesión. Ventana: últimos {navegacionQuery.data?.ventanaDias ?? 14} días.
              Excluye bots, MCP y Mi IP. Para ver el origen exacto del clic (RelatedApps, home, búsqueda, catálogo, sidebar)
              hay que esperar 3-5 días tras el deploy del tracking <code>?from=</code>.
            </p>

            {navegacionQuery.isLoading && <p>⏳ Cargando análisis de navegación…</p>}
            {navegacionQuery.error && <p style={{ color: '#dc2626' }}>Error: {navegacionQuery.error.message}</p>}
            {navegacionQuery.data && (
              <>
                {/* KPIs */}
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statContent}>
                      <h3>Sesiones únicas</h3>
                      <p>{navegacionQuery.data.kpis.totalSesiones}</p>
                      <small style={{ color: 'var(--text-muted)' }}>{navegacionQuery.data.kpis.totalVisitas} visitas totales</small>
                    </div>
                  </div>
                  <div className={`${styles.statCard} ${styles.highlight}`}>
                    <div className={styles.statContent}>
                      <h3>Apps por sesión (medio)</h3>
                      <p>{navegacionQuery.data.kpis.appsPorSesionMedio}</p>
                      <small>Objetivo REPOSICIONAMIENTO: 2,0+</small>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statContent}>
                      <h3>Sesiones single-app</h3>
                      <p>{navegacionQuery.data.kpis.pctSingleApp}%</p>
                      <small style={{ color: 'var(--text-muted)' }}>Entran a 1 app y se van</small>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statContent}>
                      <h3>Sesiones multi-app</h3>
                      <p>{navegacionQuery.data.kpis.pctMultiApp}%</p>
                      <small style={{ color: 'var(--text-muted)' }}>Visitan 2+ apps en la misma pestaña</small>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statContent}>
                      <h3>Empieza por home</h3>
                      <p>{navegacionQuery.data.kpis.pctOrigenHome}%</p>
                      <small style={{ color: 'var(--text-muted)' }}>Resto: directo desde Google/IA</small>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statContent}>
                      <h3>Pasa por home</h3>
                      <p>{navegacionQuery.data.kpis.pctConHome}%</p>
                      <small style={{ color: 'var(--text-muted)' }}>En algún momento de la sesión</small>
                    </div>
                  </div>
                </div>

                {/* Distribución longitud de sesión */}
                <h3 style={{ marginTop: '2rem', fontSize: '1.05rem' }}>
                  Distribución de longitud de sesión
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Apps únicas en la sesión</th>
                        <th style={{ textAlign: 'right' }}>Sesiones</th>
                        <th style={{ textAlign: 'right' }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(['1', '2', '3', '4-5', '6+'] as const).map((bucket) => {
                        const c = navegacionQuery.data!.distribucionLongitud[bucket] || 0;
                        const total = navegacionQuery.data!.kpis.totalSesiones;
                        const pct = total > 0 ? (c / total) * 100 : 0;
                        return (
                          <tr key={bucket}>
                            <td><strong>{bucket}</strong></td>
                            <td style={{ textAlign: 'right' }}>{c}</td>
                            <td style={{ textAlign: 'right' }}>{pct.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Top pares from→to */}
                <h3 style={{ marginTop: '2rem', fontSize: '1.05rem' }}>
                  Top transiciones (origen → destino)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  Origen explícito: <code>related-…</code> (RelatedApps), <code>home-daily</code>, <code>search</code>, <code>catalog</code>,
                  <code>sidebar-recent</code>. Si el origen es <code>prev:slug</code>, es una transición sin atributo <code>?from=</code>
                  inferida por orden temporal en la misma sesión.
                </p>
                {navegacionQuery.data.topPares.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Aún no hay transiciones registradas en esta ventana.</p>
                ) : (
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Origen</th>
                          <th>Destino</th>
                          <th style={{ textAlign: 'right' }}>Veces</th>
                        </tr>
                      </thead>
                      <tbody>
                        {navegacionQuery.data.topPares.map((par, i) => (
                          <tr key={`${par.origen}-${par.destino}-${i}`}>
                            <td><code>{par.origen}</code></td>
                            <td><code>{par.destino}</code></td>
                            <td style={{ textAlign: 'right' }}><strong>{par.count}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Apps puente vs puerta */}
                <h3 style={{ marginTop: '2rem', fontSize: '1.05rem' }}>
                  Apps puente vs puerta (top 20 por apariciones)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <strong>Ratio de continuación</strong> = % de visitas a esa app que continúan a otra app distinta dentro de la misma sesión.
                  Alto = app &quot;puente&quot; (conduce a más exploración). Bajo = app &quot;puerta&quot; (los usuarios entran y salen).
                  Mínimo 3 apariciones para aparecer en la tabla.
                </p>
                {navegacionQuery.data.tablaPuente.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Sin datos suficientes en la ventana.</p>
                ) : (
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>App</th>
                          <th style={{ textAlign: 'right' }}>Apariciones</th>
                          <th style={{ textAlign: 'right' }}>Continuaciones</th>
                          <th style={{ textAlign: 'right' }}>Ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {navegacionQuery.data.tablaPuente.map((row) => (
                          <tr key={row.app}>
                            <td><code>{row.app}</code></td>
                            <td style={{ textAlign: 'right' }}>{row.apariciones}</td>
                            <td style={{ textAlign: 'right' }}>{row.continuaciones}</td>
                            <td style={{
                              textAlign: 'right',
                              color: row.ratio >= 0.5 ? '#16a34a' : row.ratio >= 0.25 ? '#f59e0b' : '#dc2626',
                              fontWeight: 700,
                            }}>
                              {(row.ratio * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                  💡 La métrica clave del REPOSICIONAMIENTO es <strong>apps por sesión ≥ 2,0</strong>. Si está por debajo,
                  las palancas son: cross-linking en RelatedApps, descubrimiento desde home y búsqueda interna.
                </p>
              </>
            )}
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
