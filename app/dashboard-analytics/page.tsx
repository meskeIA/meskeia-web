'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import type { inferRouterOutputs } from '@trpc/server';
import styles from './DashboardAnalytics.module.css';
import { MeskeiaLogo, LegalNotice } from '@/components';
import { trpc } from '@/lib/trpc';
import type { AppRouter } from '@/server/routers/_app';

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

// Tipos inferidos del router tRPC: una sola fuente de verdad (server/routers/analytics.ts).
// Las antiguas interfaces locales estaban muertas y habían divergido del servidor.
type RouterOutputs = inferRouterOutputs<AppRouter>;
type StatsData = RouterOutputs['analytics']['getStats'];

// Modos que NO cuentan como visita web "pura" (deben coincidir con el modelo
// unificado de orígenes del servidor: clasificarOrigenReal en analytics-rollup.ts)
const MODOS_NO_WEB = ['mcp', 'referral-ia', 'chatgpt', 'bot', 'share-emit', 'pwa', 'referral-social'];
const esModoWeb = (modo: string | null) => !MODOS_NO_WEB.includes(modo ?? 'web');

// Filtro de la pestaña Últimos Registros. 'redes' agrupa el modo 'referral-social'.
type FiltroModo = 'todos' | 'web' | 'referral-ia' | 'chatgpt' | 'mcp' | 'pwa' | 'redes' | 'bot' | 'share-emit';
const coincideFiltroModo = (r: { modo: string | null }, filtro: FiltroModo): boolean => {
  if (filtro === 'todos') return true;
  if (filtro === 'web') return esModoWeb(r.modo);
  if (filtro === 'redes') return r.modo === 'referral-social';
  return r.modo === filtro;
};

// "YYYYMMDD" → "DD/MM/YYYY" (formato de las claves fecha_ord del rollup)
const formatearOrd = (ord: string): string =>
  ord.length === 8 ? `${ord.slice(6, 8)}/${ord.slice(4, 6)}/${ord.slice(0, 4)}` : ord;

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

// Clave con la que se guarda el acceso en el navegador del propietario
const STORAGE_KEY = 'meskeia_analytics_key';

/**
 * Puerta de entrada al dashboard. Pide la clave de acceso una sola vez por
 * navegador; se guarda en localStorage y viaja en cada petición tRPC como
 * cabecera x-analytics-key. Sin cookies ni cuentas.
 */
function AnalyticsGate({ onUnlock }: { onUnlock: () => void }) {
  const [valor, setValor] = useState('');

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    const clave = valor.trim();
    if (!clave) return;
    localStorage.setItem(STORAGE_KEY, clave);
    onUnlock();
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <div className={styles.gateContainer}>
        <h1 className={styles.gateTitle}>
          <span aria-hidden="true">🔒</span> Panel privado
        </h1>
        <p className={styles.gateText}>
          Este panel muestra datos internos de uso. Introduce la clave de acceso para continuar.
        </p>
        <form onSubmit={entrar} className={styles.gateForm}>
          <label htmlFor="clave-analytics" className={styles.gateLabel}>
            Clave de acceso
          </label>
          <input
            id="clave-analytics"
            type="password"
            autoComplete="current-password"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className={styles.gateInput}
            autoFocus
          />
          <button type="submit" className={styles.btnPrimary}>
            Entrar
          </button>
        </form>
      </div>
      <LegalNotice />
    </div>
  );
}

/**
 * Componente raíz de la ruta. Decide entre la puerta de entrada y el
 * dashboard según haya o no clave guardada en este navegador.
 */
export default function DashboardAnalyticsPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [comprobado, setComprobado] = useState(false);

  useEffect(() => {
    // localStorage solo existe en cliente: leerlo en el initializer de useState
    // provocaría hydration mismatch. Este efecto corre una única vez al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutenticado(!!localStorage.getItem(STORAGE_KEY));
    setComprobado(true);
  }, []);

  // Si el servidor rechaza la clave (inválida/ausente), volver a la puerta
  const salirPorClaveInvalida = useCallback(() => setAutenticado(false), []);

  // Evita el parpadeo hasta saber si hay clave (localStorage solo en cliente)
  if (!comprobado) return null;

  if (!autenticado) {
    return <AnalyticsGate onUnlock={() => setAutenticado(true)} />;
  }

  return <DashboardContent onAuthError={salirPorClaveInvalida} />;
}

// Pestañas del dashboard (id + icono decorativo + etiqueta)
const TABS = [
  { id: 'general', icono: '📊', label: 'Visión General' },
  { id: 'tecnico', icono: '💻', label: 'Análisis Técnico' },
  { id: 'ranking', icono: '🏆', label: 'Ranking Apps' },
  { id: 'aplicacion', icono: '🔍', label: 'Por Aplicación' },
  { id: 'resumen', icono: '📈', label: 'Resumen IA' },
  { id: 'registros', icono: '📋', label: 'Últimos Registros' },
  { id: 'navegacion', icono: '🧭', label: 'Navegación' },
  { id: 'dominios', icono: '🌐', label: 'Dominios' },
] as const;
type TabId = (typeof TABS)[number]['id'];

function DashboardContent({ onAuthError }: { onAuthError: () => void }) {
  const [tabActiva, setTabActiva] = useState<TabId>('general');
  const [appSeleccionada, setAppSeleccionada] = useState<string>('');
  const [filtroApp, setFiltroApp] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const [filtroIPActivo, setFiltroIPActivo] = useState(true);
  const [filtroModo, setFiltroModo] = useState<FiltroModo>('todos');

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

  // tRPC: Resumen por origen — lazy: solo carga cuando el tab está activo
  const resumenQuery = trpc.analytics.getResumen.useQuery(
    {},
    { enabled: tabActiva === 'resumen' }
  );

  // tRPC: Navegación — lazy: solo carga cuando el tab está activo
  const navegacionQuery = trpc.analytics.getNavegacion.useQuery(
    { dias: 14 },
    { enabled: tabActiva === 'navegacion' }
  );

  // tRPC: Tráfico por dominio (verticales) — lazy: solo cuando el tab está activo
  const dominiosQuery = trpc.analytics.getPorDominio.useQuery(
    {},
    { enabled: tabActiva === 'dominios' }
  );

  // Modelo fusionado de la pestaña "Tráfico por dominio": una sola tabla por TEMA.
  // Cada vertical = 2 líneas (bajo meskeia.com + bajo su dominio propio) + subtotal.
  // El % portal vive en la línea del dominio propio; el TOTAL ecosistema reconcilia
  // con los subtotales y se desglosa en dos memos (bajo meskeia.com / dominios propios).
  // Rediseño 2026-07-24: elimina el cruce mental entre las dos cards antiguas.
  const dominioFusion = useMemo(() => {
    const data = dominiosQuery.data;
    if (!data || !data.subdivision || data.filas.length === 0) return null;

    const porHost = new Map(data.filas.map((f) => [f.host, f]));
    const cero = { hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 };

    // Un grupo por tema adjudicado (todo menos "resto"), en el orden del servidor.
    const temas = data.subdivision.filas
      .filter((s) => s.key !== 'resto')
      .map((s) => {
        const dom = (s.portalHost ? porHost.get(s.portalHost) : null) || null;
        const propio = dom ?? cero;
        return {
          key: s.key,
          label: s.label,
          icono: s.icono,
          portalHost: s.portalHost,
          propioLabel: dom?.label ?? s.label,
          meskeia: { hoy: s.hoy, ayer: s.ayer, semana: s.semana, mes: s.mes, total: s.total },
          propio,
          subtotal: {
            hoy: s.hoy + propio.hoy,
            ayer: s.ayer + propio.ayer,
            semana: s.semana + propio.semana,
            mes: s.mes + propio.mes,
            total: s.total + propio.total,
          },
          pctPortal: s.pctPortal,
        };
      });

    const resto = data.subdivision.filas.find((s) => s.key === 'resto') ?? null;

    // Dominios con tráfico pero sin tema adjudicado (p.ej. hosts de preview). Se
    // muestran aparte para que el TOTAL ecosistema siga cuadrando con lo visible.
    const usados = new Set(
      temas.map((t) => t.portalHost).filter((h): h is string => Boolean(h))
    );
    const huerfanos = data.filas.filter(
      (f) => f.host !== 'meskeia.com' && !usados.has(f.host)
    );

    // Recap del tráfico de PORTALES (excluye meskeia-resto) según su vía de entrada:
    // por la marca madre (meskeia.com) vs ya por su dominio propio. Su % es el
    // termómetro de migración: agregado ponderado de los % portal por tema.
    const accesoMeskeia = temas.reduce(
      (a, t) => ({
        hoy: a.hoy + t.meskeia.hoy, ayer: a.ayer + t.meskeia.ayer,
        semana: a.semana + t.meskeia.semana, mes: a.mes + t.meskeia.mes, total: a.total + t.meskeia.total,
      }),
      { hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 }
    );
    const accesoPropios = temas.reduce(
      (a, t) => ({
        hoy: a.hoy + t.propio.hoy, ayer: a.ayer + t.propio.ayer,
        semana: a.semana + t.propio.semana, mes: a.mes + t.propio.mes, total: a.total + t.propio.total,
      }),
      { hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 }
    );
    const totalPortales = accesoMeskeia.total + accesoPropios.total;
    const pctPortalGlobal = totalPortales > 0
      ? Math.round((accesoPropios.total / totalPortales) * 1000) / 10
      : null;

    return { temas, resto, huerfanos, totalEco: data.total, accesoMeskeia, accesoPropios, pctPortalGlobal, desde: data.desde };
  }, [dominiosQuery.data]);

  // tRPC: Tendencias históricas (mensual 2026, canales, LATAM).
  // Sin input: siempre excluye tráfico propio y bots (el toggle de IP no le aplica)
  const tendenciasQuery = trpc.analytics.getTendencias.useQuery(undefined);

  // tRPC: Distribución de duraciones — lazy: solo carga cuando el tab está activo
  const distribucionQuery = trpc.analytics.getDistribucionDuraciones.useQuery(
    { excluir_mi_ip: filtroIPActivo },
    { enabled: tabActiva === 'tecnico' }
  );

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
  const datos: StatsData | null = statsQuery.data || null;
  const loading = statsQuery.isLoading || statsQuery.isFetching || tendencia30Query.isFetching;
  const error = statsQuery.error?.message || null;
  const ipConfig = ipConfigQuery.data?.data || null;
  const actualizandoIP = updateIPMutation.isPending;

  // Si la clave es inválida o falta, el servidor responde UNAUTHORIZED:
  // borramos la clave guardada y volvemos a la puerta de entrada.
  useEffect(() => {
    if (statsQuery.error?.data?.code === 'UNAUTHORIZED') {
      localStorage.removeItem(STORAGE_KEY);
      onAuthError();
    }
  }, [statsQuery.error, onAuthError]);

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

    // Cargar preferencia de localStorage (solo cliente; una vez al montar —
    // el initializer de useState no puede leerla sin hydration mismatch)
    const prefLocal = localStorage.getItem('filtroMiIPActivo');
    if (prefLocal !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiltroIPActivo(prefLocal === 'true');
    }
  }, []);

  // Cerrar dropdown al hacer clic fuera del combobox
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setMostrarDropdown(false);
        if (!appSeleccionada) setFiltroApp('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [appSeleccionada]);

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
          <button type="button" onClick={() => statsQuery.refetch()} className={styles.btnPrimary}>
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
          <span className={styles.versionBadge}>{datos?.version ?? 'v4-rollup'}</span>
        </h1>
        <p className={styles.subtitle}>Sistema de métricas de uso de aplicaciones web</p>

        <div className={styles.headerControls}>
          <button
            type="button"
            onClick={() => { statsQuery.refetch(); resumenQuery.refetch(); }}
            className={styles.btnRefresh}
            disabled={loading}
          >
            <span className={loading ? styles.spinning : ''} aria-hidden="true">↻</span>
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
              <span><span aria-hidden="true">🧪</span> Excluir mi IP de desarrollo</span>
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
                type="button"
                onClick={guardarMiIP}
                className={styles.btnUpdateIP}
                disabled={actualizandoIP}
                title="Guardar mi IP actual para excluirla"
              >
                {actualizandoIP ? '...' : '🔄 Actualizar IP'}
              </button>
            </div>
          </div>

          {/* Aviso: la IP actual no coincide con la excluida (IP dinámica que cambió).
              Sin este aviso, el toggle "Excluir mi IP" da falsa sensación de datos
              limpios mientras las visitas propias se cuentan como tráfico real. */}
          {ipConfig?.ip_excluida &&
            ipConfig?.ip_actual &&
            !['unknown', 'anonymous'].includes(ipConfig.ip_actual) &&
            ipConfig.ip_actual !== ipConfig.ip_excluida && (
            <div className={styles.ipMismatch} role="alert">
              <span aria-hidden="true">⚠️</span> <strong>Tu IP actual ({ipConfig.ip_actual}) no coincide
              con la excluida ({ipConfig.ip_excluida}).</strong> Tus visitas se están contando como tráfico
              real desde el cambio de IP — pulsa «Actualizar IP» para corregirlo.
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className={styles.tabs}>
        {TABS.map(({ id, icono, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tabActiva === id}
            className={`${styles.tabButton} ${tabActiva === id ? styles.active : ''}`}
            onClick={() => setTabActiva(id)}
          >
            <span aria-hidden="true">{icono}</span> {label}
          </button>
        ))}
      </nav>

      {/* Tab: Visión General */}
      {tabActiva === 'general' && datos && (
        <div className={styles.tabContent}>
          {/* Comparativa Temporal con Alertas Visuales */}
          {datos.comparativa && (
            <section className={styles.comparativaSection}>
              <h2 className={styles.sectionTitle}><span aria-hidden="true">📈</span> Comparativa Temporal</h2>
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
              <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Evolución Mensual {new Date().getFullYear()}</h2>
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
                      // Mes en curso: la tendencia se calcula PRO-RATA (proyección a mes
                      // completo según los días transcurridos). Comparar el parcial contra
                      // un mes completo mostraba una falsa caída hasta fin de mes.
                      const ahora = new Date();
                      const mesActualStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
                      const esMesEnCurso = fila.mes === mesActualStr;
                      const diasDelMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
                      const visitasComparables = esMesEnCurso && ahora.getDate() > 0
                        ? (fila.visitas / ahora.getDate()) * diasDelMes
                        : fila.visitas;
                      const pct = prev && prev.visitas > 0
                        ? Math.round(((visitasComparables - prev.visitas) / prev.visitas) * 100)
                        : null;
                      const max = Math.max(...tendenciasQuery.data!.mensual.map(m => m.visitas));
                      const barWidth = Math.round((fila.visitas / max) * 100);
                      return (
                        <tr key={fila.mes} style={{ borderBottom: '1px solid var(--bg-primary)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                            {fila.mes}
                            {esMesEnCurso && (
                              <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}> (en curso)</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px 12px' }}>{fila.visitas.toLocaleString('es-ES')}</td>
                          <td style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)' }}>{fila.sesiones.toLocaleString('es-ES')}</td>
                          <td style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)' }}>{fila.paises}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', minWidth: '60px' }}>
                                <div style={{ width: `${barWidth}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                              </div>
                              {pct !== null && (
                                <span
                                  style={{ fontSize: '0.8rem', color: pct >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600, minWidth: '45px' }}
                                  title={esMesEnCurso ? 'Proyección pro-rata del mes en curso' : undefined}
                                >
                                  {esMesEnCurso ? '≈' : ''}{pct >= 0 ? '+' : '-'}{Math.abs(pct)}%
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                * El mes en curso muestra sus visitas reales (parciales); su tendencia (≈) es una
                proyección proporcional a los días transcurridos.
              </p>
            </section>
          )}

          {/* Canal de tráfico + LATAM */}
          {tendenciasQuery.data && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}><span aria-hidden="true">📡</span> Canal de Tráfico y Alcance LATAM</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Canal de tráfico */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--bg-primary)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Origen de visitas (mes actual)
                  </h3>
                  {(() => {
                    const canales = tendenciasQuery.data!.canales;
                    const total = Object.values(canales).reduce((a, b) => a + b, 0);
                    const items: { key: keyof typeof canales; label: string; icon: string }[] = [
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
              <h2><span aria-hidden="true">📈</span> Tendencia de Uso (Últimos 30 Días)</h2>
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
            <h2><span aria-hidden="true">📱</span> Distribución por Dispositivo</h2>
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
              <h2><span aria-hidden="true">🌍</span> Top Países</h2>
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
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            Las tarjetas superiores son totales históricos. Los gráficos siguientes (dispositivo,
            navegadores, sistemas y resoluciones) se calculan sobre la <strong>muestra de los
            últimos 500 registros</strong>, no sobre el histórico completo.
          </p>
          <div className={styles.chartsGrid}>
            {dispositivosData && (
              <section className={styles.chartSection}>
                <h2><span aria-hidden="true">📱</span> Tipo de Dispositivo</h2>
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
                <h2><span aria-hidden="true">🌐</span> Navegadores</h2>
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
                <h2><span aria-hidden="true">💻</span> Sistemas Operativos</h2>
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
                <h2><span aria-hidden="true">📐</span> Resoluciones</h2>
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
              <h2 className={styles.sectionTitle}><span aria-hidden="true">⏱️</span> Distribución de Duración de Visitas</h2>
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
            <h2><span aria-hidden="true">🏆</span> Ranking de Aplicaciones</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
              El <strong>Estado</strong> se calcula sobre los usos de los últimos 30 días (✅ ≥ 10 ·
              ⚠️ 1–9 · 💤 sin uso), no sobre el total histórico: refleja qué apps están vivas ahora.
            </p>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Aplicación</th>
                    <th>Usos</th>
                    <th>Usos 30d</th>
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
                      <td style={{ fontWeight: app.usos_30d > 0 ? 600 : 400 }}>
                        {app.usos_30d > 0 ? formatearNumero(app.usos_30d) : '–'}
                      </td>
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
            <h2><span aria-hidden="true">🔍</span> Estadísticas por Aplicación</h2>

            {/* Combobox con búsqueda integrada */}
            <div className={styles.appSelector}>
              <label>Selecciona una aplicación:</label>
              <div className={styles.combobox} ref={comboboxRef}>
                <input
                  type="text"
                  placeholder={appSeleccionada || 'Buscar o selecciona una app...'}
                  value={filtroApp}
                  onChange={(e) => { setFiltroApp(e.target.value); setMostrarDropdown(true); }}
                  onFocus={() => setMostrarDropdown(true)}
                  className={styles.comboboxInput}
                  autoComplete="off"
                />
                {appSeleccionada && !filtroApp && (
                  <button
                    type="button"
                    className={styles.comboboxClear}
                    onClick={() => { setAppSeleccionada(''); setFiltroApp(''); }}
                    aria-label="Limpiar selección"
                  >✕</button>
                )}
                {mostrarDropdown && (
                  <div className={styles.comboboxDropdown}>
                    {datos.ranking_aplicaciones
                      .filter((app) =>
                        !filtroApp || String(app.aplicacion).toLowerCase().includes(filtroApp.toLowerCase())
                      )
                      .slice(0, 50)
                      .map((app) => (
                        <div
                          key={String(app.aplicacion)}
                          className={`${styles.comboboxOption} ${appSeleccionada === app.aplicacion ? styles.comboboxOptionActive : ''}`}
                          onMouseDown={() => {
                            setAppSeleccionada(String(app.aplicacion));
                            setFiltroApp('');
                            setMostrarDropdown(false);
                          }}
                        >
                          <span className={styles.comboboxOptionName}>{app.aplicacion}</span>
                          <span className={styles.comboboxOptionUsos}>{app.total_usos} usos</span>
                        </div>
                      ))}
                    {datos.ranking_aplicaciones.filter((app) =>
                      !filtroApp || String(app.aplicacion).toLowerCase().includes(filtroApp.toLowerCase())
                    ).length === 0 && (
                      <div className={styles.comboboxEmpty}>Sin resultados para &ldquo;{filtroApp}&rdquo;</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas de la app seleccionada */}
            {appSeleccionada ? (
              <>
                {(() => {
                  const appData = datos.ranking_aplicaciones.find((a) => a.aplicacion === appSeleccionada);
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
                      <h3 className={styles.appRegistrosTitle}><span aria-hidden="true">📋</span> Últimos 100 registros de {appSeleccionada}</h3>
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
                            {registrosApp.map((registro) => (
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
            <div className={styles.registrosHeader}>
              <h2><span aria-hidden="true">📋</span> Últimos 100 Registros</h2>
              <div className={styles.filtroModoGroup}>
                {([
                  { id: 'todos', etiqueta: 'Todos', claseActiva: styles.filtroModoActivo },
                  { id: 'web', etiqueta: '🌐 Web', claseActiva: styles.filtroModoActivo },
                  { id: 'referral-ia', etiqueta: '🔗 Desde IA', claseActiva: styles.filtroModoActivoReferral },
                  { id: 'chatgpt', etiqueta: '💬 ChatGPT', claseActiva: styles.filtroModoActivoChatGPT },
                  { id: 'mcp', etiqueta: '🤖 IA / MCP', claseActiva: styles.filtroModoActivoMCP },
                  { id: 'pwa', etiqueta: '📲 PWA', claseActiva: styles.filtroModoActivoPWA },
                  { id: 'redes', etiqueta: '📣 Redes', claseActiva: styles.filtroModoActivoRedes },
                  { id: 'bot', etiqueta: '🕷️ Bots', claseActiva: styles.filtroModoActivoBot },
                  { id: 'share-emit', etiqueta: '🔗 Compartido', claseActiva: styles.filtroModoActivoShare },
                ] as Array<{ id: FiltroModo; etiqueta: string; claseActiva: string }>).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={filtroModo === f.id}
                    className={`${styles.filtroModoBtn} ${filtroModo === f.id ? f.claseActiva : ''}`}
                    onClick={() => setFiltroModo(f.id)}
                  >
                    {f.etiqueta} ({datos.data.filter((r) => coincideFiltroModo(r, f.id)).length})
                  </button>
                ))}
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
                    .filter((r) => coincideFiltroModo(r, filtroModo))
                    .slice(0, 100)
                    .map((registro) => (
                      <tr key={registro.id} className={
                        registro.modo === 'mcp' ? styles.rowMCP :
                        registro.modo === 'chatgpt' ? styles.rowChatGPT :
                        registro.modo === 'referral-ia' ? styles.rowReferral :
                        registro.modo === 'bot' ? styles.rowBot :
                        registro.modo === 'share-emit' ? styles.rowShare : ''
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
                            : registro.modo === 'pwa'
                            ? <span className={styles.badgePWA}>📲 PWA</span>
                            : registro.modo === 'referral-social'
                            ? <span className={styles.badgeRedes}>📣 Redes</span>
                            : registro.modo === 'bot'
                            ? <span className={styles.badgeBot}>🕷️ Bot</span>
                            : registro.modo === 'share-emit'
                            ? <span className={styles.badgeShare}>🔗 Compartido{registro.datos_adicionales?.share_emit ? ` · ${registro.datos_adicionales.share_emit}` : ''}</span>
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
            <h2><span aria-hidden="true">📈</span> Resumen por Origen</h2>
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
                      const esGris = fila.grupo === 'bot' || fila.grupo === 'miip';
                      return (
                        <tr
                          key={fila.origen}
                          className={esGrupoIA ? styles.rowGrupoIA : esGris ? styles.rowGrupoGris : undefined}
                          style={{ opacity: esCero ? 0.4 : 1 }}
                        >
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
              * Las visitas anteriores al 20/03/2026 no tienen plataforma IA identificada
              (la captura del referrer se activó en esa fecha) y se agrupan en &quot;IA · Otras&quot;.
            </p>
          </section>
        </div>
      )}

      {/* Tab: Tráfico por dominio (verticales) */}
      {tabActiva === 'dominios' && (
        <div className={styles.tabContent}>
          <section className={styles.section}>
            <h2><span aria-hidden="true">🌐</span> Tráfico por dominio</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Todo el tráfico del ecosistema en una tabla, organizado por tema. Cada vertical tiene dos
              líneas —servido bajo meskeia.com (la marca madre) y bajo su dominio propio— más un subtotal.
              El <strong>% portal</strong>, en la línea del dominio propio, es cuánto del tráfico de ese
              tema entra ya por su dominio; sube si el portal gana autoridad y Google empieza a servir su
              versión. El <strong>TOTAL ecosistema</strong> (al final) reconcilia con los subtotales;
              encima, dos líneas reparten el tráfico de portales según entre por meskeia.com o ya por su
              dominio propio. Excluye bots y tu propia IP.
            </p>

            {dominiosQuery.isLoading && <p>Cargando tráfico por dominio...</p>}
            {dominiosQuery.error && <p style={{ color: 'red' }}>Error al cargar el desglose por dominio</p>}

            {dominiosQuery.data && (
              <>
                {dominioFusion === null ? (
                  <p style={{ color: 'var(--text-muted)' }}>
                    Aún no hay visitas registradas con dominio. Los datos empiezan a acumularse
                    tras el despliegue (la captura del dominio se activó el {dominiosQuery.data.desde}).
                  </p>
                ) : (
                  <>
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left' }}>Tema / línea</th>
                            <th style={{ textAlign: 'center' }}>Hoy</th>
                            <th style={{ textAlign: 'center' }}>Ayer</th>
                            <th style={{ textAlign: 'center' }}>7 días</th>
                            <th style={{ textAlign: 'center' }}>Este mes</th>
                            <th style={{ textAlign: 'center' }}>Total</th>
                            <th style={{ textAlign: 'center' }}>% portal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dominioFusion.temas.map((t) => (
                            <Fragment key={t.key}>
                              {/* Línea 1 — tráfico del tema servido bajo meskeia.com */}
                              <tr style={{ opacity: t.subtotal.total === 0 ? 0.4 : 1 }}>
                                <td style={{ paddingLeft: '1.75rem' }}>
                                  <span style={{ marginRight: '0.4rem' }} aria-hidden="true">{t.icono}</span>
                                  meskeia-{t.key}
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                    ↔ {t.portalHost}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>{t.meskeia.hoy > 0 ? t.meskeia.hoy : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.meskeia.ayer > 0 ? t.meskeia.ayer : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.meskeia.semana > 0 ? t.meskeia.semana : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.meskeia.mes > 0 ? t.meskeia.mes : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.meskeia.total > 0 ? t.meskeia.total : '–'}</td>
                                <td></td>
                              </tr>
                              {/* Línea 2 — tráfico del tema servido bajo su dominio propio (+ % portal) */}
                              <tr style={{ opacity: t.subtotal.total === 0 ? 0.4 : 1 }}>
                                <td style={{ paddingLeft: '1.75rem' }}>
                                  <span style={{ marginRight: '0.4rem' }} aria-hidden="true">{t.icono}</span>
                                  {t.propioLabel}
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                    {t.portalHost}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>{t.propio.hoy > 0 ? t.propio.hoy : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.propio.ayer > 0 ? t.propio.ayer : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.propio.semana > 0 ? t.propio.semana : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.propio.mes > 0 ? t.propio.mes : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.propio.total > 0 ? t.propio.total : '–'}</td>
                                <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>
                                  {t.pctPortal == null ? '–' : `${t.pctPortal.toLocaleString('es-ES')}%`}
                                </td>
                              </tr>
                              {/* Línea 3 — subtotal del tema (suma de las dos anteriores) */}
                              <tr style={{ background: 'var(--focus)', fontWeight: 600 }}>
                                <td>Total {t.label}</td>
                                <td style={{ textAlign: 'center' }}>{t.subtotal.hoy > 0 ? t.subtotal.hoy : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.subtotal.ayer > 0 ? t.subtotal.ayer : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.subtotal.semana > 0 ? t.subtotal.semana : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.subtotal.mes > 0 ? t.subtotal.mes : '–'}</td>
                                <td style={{ textAlign: 'center' }}>{t.subtotal.total > 0 ? t.subtotal.total : '–'}</td>
                                <td></td>
                              </tr>
                            </Fragment>
                          ))}

                          {/* Resto meskeIA — apps propias sin vertical, solo bajo meskeia.com */}
                          {dominioFusion.resto && (
                            <tr style={{ opacity: dominioFusion.resto.total === 0 ? 0.4 : 1 }}>
                              <td>
                                <span style={{ marginRight: '0.4rem' }} aria-hidden="true">{dominioFusion.resto.icono}</span>
                                meskeia-resto
                              </td>
                              <td style={{ textAlign: 'center' }}>{dominioFusion.resto.hoy > 0 ? dominioFusion.resto.hoy : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{dominioFusion.resto.ayer > 0 ? dominioFusion.resto.ayer : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{dominioFusion.resto.semana > 0 ? dominioFusion.resto.semana : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{dominioFusion.resto.mes > 0 ? dominioFusion.resto.mes : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{dominioFusion.resto.total > 0 ? dominioFusion.resto.total : '–'}</td>
                              <td style={{ textAlign: 'center' }}>–</td>
                            </tr>
                          )}

                          {/* Dominios con tráfico pero sin tema adjudicado (raro; mantiene la reconciliación) */}
                          {dominioFusion.huerfanos.map((h) => (
                            <tr key={h.host} style={{ opacity: h.total === 0 ? 0.4 : 1 }}>
                              <td>
                                <span style={{ marginRight: '0.4rem' }} aria-hidden="true">{h.icono}</span>
                                {h.label}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                  {h.host}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>{h.hoy > 0 ? h.hoy : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{h.ayer > 0 ? h.ayer : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{h.semana > 0 ? h.semana : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{h.mes > 0 ? h.mes : '–'}</td>
                              <td style={{ textAlign: 'center' }}>{h.total > 0 ? h.total : '–'}</td>
                              <td style={{ textAlign: 'center' }}>–</td>
                            </tr>
                          ))}

                          {/* Recap del tráfico de portales por vía de entrada (reparto de los subtotales) */}
                          <tr style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <td style={{ paddingLeft: '1.75rem' }}>↳ Acceso a portales desde meskeia.com</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoMeskeia.hoy || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoMeskeia.ayer || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoMeskeia.semana || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoMeskeia.mes || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoMeskeia.total || '–'}</td>
                            <td></td>
                          </tr>
                          <tr style={{ color: 'var(--text-secondary)' }}>
                            <td style={{ paddingLeft: '1.75rem' }}>↳ Acceso a portales desde dominios propios</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoPropios.hoy || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoPropios.ayer || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoPropios.semana || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoPropios.mes || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.accesoPropios.total || '–'}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                              {dominioFusion.pctPortalGlobal == null ? '–' : `${dominioFusion.pctPortalGlobal.toLocaleString('es-ES')}%`}
                            </td>
                          </tr>
                          {/* TOTAL ecosistema — al final; = subtotales de tema + resto (+ huérfanos) */}
                          <tr style={{ borderTop: '2px solid var(--primary)', fontWeight: 700 }}>
                            <td>✅ TOTAL ecosistema</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.totalEco.hoy || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.totalEco.ayer || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.totalEco.semana || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.totalEco.mes || '–'}</td>
                            <td style={{ textAlign: 'center' }}>{dominioFusion.totalEco.total || '–'}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                      Las dos líneas «Acceso a portales» reparten el tráfico de portales (la suma de los
                      cuatro subtotales, sin meskeia-resto) según su vía de entrada; su <strong>% portal</strong>{' '}
                      global es el termómetro de migración a dominios propios, agregado ponderado de los % por
                      tema. Captura de dominio activa desde el {dominioFusion.desde}; las visitas anteriores no
                      tienen dominio asignado y no se contabilizan. Adjudicación (1 app = 1 vertical):
                      Cronicum = cronologías; Stemum/Coquinum = apps de su portal; Delegum = apps de su
                      página de Soluciones.
                    </p>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {/* Tab: Navegación */}
      {tabActiva === 'navegacion' && (
        <div className={styles.tabContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">🧭</span> Motor de descubrimiento interno</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Lo que esta página mide y ninguna otra: los clics <code>?from=</code> de navegación entre apps
              (descubrimiento interno) y los saltos cross-dominio meskeIA ↔ verticales. Es la <strong>única palanca de
              crecimiento endógena</strong> — la que sí controlas, frente a Google/Bing/IA que son exógenos.
              Ventana: últimos {navegacionQuery.data?.ventanaDias ?? 14} días. Excluye bots, MCP y Mi IP.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', background: 'var(--bg-primary)', borderLeft: '3px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '0 6px 6px 0' }}>
              <strong>Por qué el clic <code>?from=</code> y no «apps por sesión».</strong> El <code>sesion_id</code> no
              sobrevive a los saltos en webviews in-app (app de Google, ChatGPT, redes) ni a las aperturas en pestaña nueva,
              así que las métricas de sesión <strong>infravaloran</strong> el descubrimiento. El clic <code>?from=</code> lo
              cuenta directo, sobreviva o no la sesión. Se lee en <strong>absoluto y tendencia, sin suelos</strong>.
            </p>

            {navegacionQuery.isLoading && <p>⏳ Cargando análisis de navegación…</p>}
            {navegacionQuery.error && <p style={{ color: '#dc2626' }}>Error: {navegacionQuery.error.message}</p>}
            {navegacionQuery.data && (
              <>
                {/* KPIs — Descubrimiento interno protagonista + Contexto refundido */}
                <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                  {/* Card protagonista — pulso en 3 ventanas */}
                  <div className={`${styles.statCard} ${styles.highlight}`}>
                    <div className={styles.statContent} style={{ width: '100%' }}>
                      <h3 style={{ marginBottom: '2px' }}><span aria-hidden="true">🎯</span> Descubrimiento interno</h3>
                      <small style={{ opacity: 0.9 }}>clics <code>?from=</code> que llevan a una 2ª app · % = de las visitas de esa ventana</small>
                      <div style={{ display: 'flex', gap: '8px', margin: '14px 0 10px' }}>
                        {([
                          { label: 'Hoy (24 h)', w: navegacionQuery.data.descubrimientoInterno.ventanas.hoy },
                          { label: '7 días', w: navegacionQuery.data.descubrimientoInterno.ventanas.semana },
                          { label: '14 días', w: navegacionQuery.data.descubrimientoInterno.ventanas.quincena, ref: true },
                        ]).map((v) => (
                          <div key={v.label} style={{
                            flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: '10px',
                            background: v.ref ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
                          }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', opacity: 0.9 }}>{v.label}</div>
                            <div style={{ fontSize: '2.1rem', fontWeight: 700, lineHeight: 1.1, margin: '2px 0' }}>{v.w.pct}%</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{v.w.clics} clics</div>
                          </div>
                        ))}
                      </div>
                      <small style={{ opacity: 0.9 }}>
                        Tasa = clics de descubrimiento ÷ visitas de la ventana. Se lee la <strong>dirección</strong> (14 días = referencia), sin suelos ni alarmas.
                      </small>
                    </div>
                  </div>

                  {/* Card contexto — refunde las 5 métricas heredadas */}
                  <div className={styles.statCard}>
                    <div style={{ width: '100%' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Composición del descubrimiento (14 días)
                      </div>
                      {[
                        { label: 'Visitas de la ventana', value: navegacionQuery.data.kpis.totalVisitas.toLocaleString('es-ES'), sub: 'denominador' },
                        { label: 'Clics de descubrimiento', value: navegacionQuery.data.descubrimientoInterno.total.toLocaleString('es-ES'), sub: `${navegacionQuery.data.descubrimientoInterno.pctDeVisitas}% de las visitas` },
                        { label: '— vía RelatedApps', value: (navegacionQuery.data.descubrimientoInterno.porCategoria['related'] || 0).toLocaleString('es-ES'), sub: 'palanca que curas a mano' },
                        { label: '— meskeIA → verticales', value: (navegacionQuery.data.descubrimientoInterno.porCategoria['a-vertical'] || 0).toLocaleString('es-ES'), sub: 'marca madre empujando' },
                        { label: '— verticales → meskeIA', value: (navegacionQuery.data.descubrimientoInterno.porCategoria['portal-a-meskeia'] || 0).toLocaleString('es-ES'), sub: 'retorno de los portales' },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{row.label}<span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.sub}</span></span>
                          <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{row.value}</strong>
                        </div>
                      ))}
                      <small style={{ display: 'block', marginTop: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Todo en <strong>absoluto</strong>. El cross-dominio (meskeIA ↔ verticales) no aparece en ninguna otra pestaña:
                        es el termómetro de si la marca madre alimenta a los portales por dentro.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Desglose del descubrimiento interno por origen */}
                <h3 style={{ marginTop: '2rem', fontSize: '1.05rem' }}>
                  Descubrimiento interno por origen del clic
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  De dónde salió cada clic que llevó a una segunda app: <code>related</code> (RelatedApps),
                  <code>sidebar-recent</code>, <code>home-daily</code>, <code>catalog</code>, <code>search</code>.
                  Y los saltos cross-dominio: <code>meskeIA → vertical</code> (marca madre empujando a los portales)
                  y <code>portal → meskeIA</code>. El cajón <code>otro</code> queda ya como residual (bots / <code>from=</code> espurios).
                </p>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Origen del clic</th>
                        <th style={{ textAlign: 'right' }}>Clics</th>
                        <th style={{ textAlign: 'right' }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(navegacionQuery.data.descubrimientoInterno.porCategoria)
                        .sort((a, b) => b[1] - a[1])
                        .map(([origen, clics]) => {
                          const tot = navegacionQuery.data!.descubrimientoInterno.total;
                          const pct = tot > 0 ? (clics / tot) * 100 : 0;
                          const ETIQUETAS_ORIGEN: Record<string, string> = {
                            'a-vertical': 'meskeIA → vertical',
                            'portal-a-meskeia': 'portal → meskeIA',
                          };
                          const etiqueta = ETIQUETAS_ORIGEN[origen] || origen;
                          return (
                            <tr key={origen}>
                              <td><code>{etiqueta}</code></td>
                              <td style={{ textAlign: 'right' }}><strong>{clics}</strong></td>
                              <td style={{ textAlign: 'right' }}>{pct.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Detalle forense (plegado): material de contraste con GSC/BWT, no señal de vistazo diario.
                    Se apoya en el orden dentro de la sesión, que los webviews fragmentan → tomar con pinzas. */}
                <details style={{ marginTop: '2rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '1.05rem', fontWeight: 700 }}>
                    Detalle forense: transiciones y apps puente (top 10)
                  </summary>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.75rem 0 1.25rem' }}>
                    Plegado a propósito: es material de contraste (cruce con GSC/BWT), no señal de vistazo diario. Las
                    transiciones y el ratio puente/puerta se apoyan en el orden dentro de la sesión, que los webviews fragmentan.
                  </p>

                  <h3 style={{ fontSize: '1rem' }}>Top 10 transiciones (origen → destino)</h3>
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
                          {navegacionQuery.data.topPares.slice(0, 10).map((par, i) => (
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

                  <h3 style={{ fontSize: '1rem', marginTop: '1.5rem' }}>Top 10 apps puente vs puerta</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <strong>Ratio de continuación</strong> = % de visitas a esa app que siguen a otra app en la misma sesión.
                    Alto = «puente» (conduce a explorar); bajo = «puerta» (entran y salen). Mínimo 3 apariciones.
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
                          {navegacionQuery.data.tablaPuente.slice(0, 10).map((row) => (
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
                </details>
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
        {/* Estado del rollup: hasta qué día están los agregados. Si va por detrás
            de anteayer, el cron ha fallado y conviene saberlo (los números de días
            cerrados podrían estar incompletos hasta el on-demand defensivo). */}
        {datos?.rollup && (
          <span className={datos.rollup.hasta && datos.rollup.hasta >= datos.rollup.esperado ? styles.lastUpdate : styles.rollupWarn}>
            {datos.rollup.hasta && datos.rollup.hasta >= datos.rollup.esperado
              ? `📦 Agregados al día (hasta ${formatearOrd(datos.rollup.hasta)})`
              : `⚠️ Rollup atrasado (hasta ${datos.rollup.hasta ? formatearOrd(datos.rollup.hasta) : 'nunca'}, esperado ${formatearOrd(datos.rollup.esperado)})`}
          </span>
        )}
        <span className={styles.lastUpdate}>
          Última actualización: {ultimaActualizacion || '-'}
        </span>
      </div>
    </div>
  );
}
