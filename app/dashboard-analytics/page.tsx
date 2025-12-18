'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './DashboardAnalytics.module.css';
import { MeskeiaLogo } from '@/components';

interface EstadisticasData {
  status: string;
  version: string;
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
  }>;
}

export default function DashboardAnalyticsPage() {
  const [datos, setDatos] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');
  const [tabActiva, setTabActiva] = useState<'general' | 'ranking' | 'registros'>('general');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/stats?limite=100');
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

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Calcular usos de hoy
  const calcularUsosHoy = () => {
    if (!datos?.data) return 0;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return datos.data.filter((registro) => {
      // Parsear fecha española DD/MM/YYYY HH:MM:SS
      const partes = registro.timestamp.split(' ');
      if (partes.length !== 2) return false;

      const [fecha] = partes;
      const [dia, mes, anio] = fecha.split('/');
      const fechaRegistro = new Date(`${anio}-${mes}-${dia}`);

      return fechaRegistro >= hoy;
    }).length;
  };

  const formatearNumero = (num: number) => {
    return num.toLocaleString('es-ES');
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
          <button onClick={cargarDatos} className={styles.btnPrimary}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
            onClick={cargarDatos}
            className={styles.btnRefresh}
            disabled={loading}
          >
            <span className={loading ? styles.spinning : ''}>↻</span>
            {loading ? 'Actualizando...' : 'Actualizar Datos'}
          </button>
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
          className={`${styles.tabButton} ${tabActiva === 'ranking' ? styles.active : ''}`}
          onClick={() => setTabActiva('ranking')}
        >
          🏆 Ranking Apps
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
          {/* Stats Cards */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(datos.estadisticas.total_usos)}</h3>
                <p>Total de Usos</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.highlight}`}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statContent}>
                <h3>{formatearNumero(calcularUsosHoy())}</h3>
                <p>Usos de Hoy</p>
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
                    <th>Dispositivo</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.data.map((registro) => (
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
        <span className={styles.lastUpdate}>
          Última actualización: {ultimaActualizacion || '-'}
        </span>
      </div>
    </div>
  );
}
