'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TimeTracker.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import EducationalSection from '@/components/EducationalSection';
import { formatNumber, formatCurrency } from '@/lib';

interface TimeEntry {
  id: string;
  proyecto: string;
  cliente: string;
  descripcion: string;
  inicio: number;
  fin: number | null;
  duracion: number; // en segundos
  tarifa: number;
}

interface Proyecto {
  nombre: string;
  cliente: string;
  tarifa: number;
  color: string;
}

const COLORES_PROYECTO = [
  '#2E86AB', '#48A9A6', '#E76F51', '#F4A261', '#2A9D8F',
  '#E9C46A', '#264653', '#A8DADC', '#457B9D', '#1D3557',
];

const STORAGE_KEY = 'meskeia_time_tracker';

export default function TimeTrackerPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Formulario nueva entrada
  const [proyecto, setProyecto] = useState('');
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tarifa, setTarifa] = useState('30');
  const [nuevoProyecto, setNuevoProyecto] = useState(false);

  // Filtros
  const [filtroProyecto, setFiltroProyecto] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('semana');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos de localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setEntries(data.entries || []);
      setProyectos(data.proyectos || []);

      // Restaurar tracking activo si lo había
      const activeEntry = (data.entries || []).find((e: TimeEntry) => e.fin === null);
      if (activeEntry) {
        setCurrentEntry(activeEntry);
        setIsTracking(true);
        setProyecto(activeEntry.proyecto);
        setCliente(activeEntry.cliente);
        setDescripcion(activeEntry.descripcion);
        setTarifa(String(activeEntry.tarifa));
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, proyectos }));
  }, [entries, proyectos]);

  // Timer
  useEffect(() => {
    if (isTracking && currentEntry) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentEntry.inicio) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, currentEntry]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHoursMinutes = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins}min`;
    return `${hrs}h ${mins}min`;
  };

  const startTracking = () => {
    if (!proyecto.trim()) {
      alert('Por favor, introduce un nombre de proyecto');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      proyecto: proyecto.trim(),
      cliente: cliente.trim() || 'Sin cliente',
      descripcion: descripcion.trim(),
      inicio: Date.now(),
      fin: null,
      duracion: 0,
      tarifa: parseFloat(tarifa) || 0,
    };

    // Añadir proyecto si es nuevo
    if (!proyectos.find(p => p.nombre === proyecto.trim())) {
      const nuevoP: Proyecto = {
        nombre: proyecto.trim(),
        cliente: cliente.trim() || 'Sin cliente',
        tarifa: parseFloat(tarifa) || 0,
        color: COLORES_PROYECTO[proyectos.length % COLORES_PROYECTO.length],
      };
      setProyectos([...proyectos, nuevoP]);
    }

    setCurrentEntry(newEntry);
    setEntries([newEntry, ...entries]);
    setIsTracking(true);
    setElapsedTime(0);
  };

  const stopTracking = () => {
    if (!currentEntry) return;

    const fin = Date.now();
    const duracion = Math.floor((fin - currentEntry.inicio) / 1000);

    const updatedEntry: TimeEntry = {
      ...currentEntry,
      fin,
      duracion,
    };

    setEntries(entries.map(e => e.id === currentEntry.id ? updatedEntry : e));
    setCurrentEntry(null);
    setIsTracking(false);
    setElapsedTime(0);
    setDescripcion('');
  };

  const deleteEntry = (id: string) => {
    if (confirm('¿Eliminar este registro?')) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const selectProyecto = (p: Proyecto) => {
    setProyecto(p.nombre);
    setCliente(p.cliente);
    setTarifa(String(p.tarifa));
    setNuevoProyecto(false);
  };

  // Filtrar entradas
  const entriesFiltradas = entries.filter(e => {
    if (e.fin === null) return false; // No mostrar el activo en la lista

    // Filtro por proyecto
    if (filtroProyecto !== 'todos' && e.proyecto !== filtroProyecto) return false;

    // Filtro por periodo
    const ahora = Date.now();
    const inicio = e.inicio;

    switch (filtroPeriodo) {
      case 'hoy':
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return inicio >= hoy.getTime();
      case 'semana':
        const semana = ahora - (7 * 24 * 60 * 60 * 1000);
        return inicio >= semana;
      case 'mes':
        const mes = ahora - (30 * 24 * 60 * 60 * 1000);
        return inicio >= mes;
      default:
        return true;
    }
  });

  // Calcular estadísticas
  const stats = {
    totalTiempo: entriesFiltradas.reduce((sum, e) => sum + e.duracion, 0),
    totalGanado: entriesFiltradas.reduce((sum, e) => sum + (e.duracion / 3600) * e.tarifa, 0),
    numEntradas: entriesFiltradas.length,
    proyectosUnicos: [...new Set(entriesFiltradas.map(e => e.proyecto))].length,
  };

  // Agrupar por proyecto
  const porProyecto = entriesFiltradas.reduce((acc, e) => {
    if (!acc[e.proyecto]) {
      acc[e.proyecto] = { tiempo: 0, ganado: 0, color: '', entradas: 0 };
    }
    acc[e.proyecto].tiempo += e.duracion;
    acc[e.proyecto].ganado += (e.duracion / 3600) * e.tarifa;
    acc[e.proyecto].entradas += 1;
    const proy = proyectos.find(p => p.nombre === e.proyecto);
    acc[e.proyecto].color = proy?.color || '#2E86AB';
    return acc;
  }, {} as Record<string, { tiempo: number; ganado: number; color: string; entradas: number }>);

  const exportarCSV = () => {
    const headers = ['Fecha', 'Proyecto', 'Cliente', 'Descripción', 'Duración (h)', 'Tarifa (€/h)', 'Total (€)'];
    const rows = entriesFiltradas.map(e => [
      new Date(e.inicio).toLocaleDateString('es-ES'),
      e.proyecto,
      e.cliente,
      e.descripcion,
      formatNumber(e.duracion / 3600, 2),
      formatNumber(e.tarifa, 2),
      formatNumber((e.duracion / 3600) * e.tarifa, 2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⏱️ Time Tracker</h1>
        <p className={styles.subtitle}>
          Registra el tiempo dedicado a cada proyecto y cliente
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de tracking */}
        <div className={styles.trackerPanel}>
          <div className={styles.timerDisplay}>
            <div className={`${styles.timerValue} ${isTracking ? styles.active : ''}`}>
              {formatTime(isTracking ? elapsedTime : 0)}
            </div>
            {isTracking && currentEntry && (
              <div className={styles.timerProject}>
                {currentEntry.proyecto}
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className={styles.trackerForm}>
            {/* Proyectos guardados */}
            {proyectos.length > 0 && !isTracking && (
              <div className={styles.proyectosGuardados}>
                <label className={styles.label}>Proyectos recientes</label>
                <div className={styles.proyectosTags}>
                  {proyectos.slice(0, 5).map(p => (
                    <button
                      key={p.nombre}
                      onClick={() => selectProyecto(p)}
                      className={`${styles.proyectoTag} ${proyecto === p.nombre ? styles.active : ''}`}
                      style={{ borderColor: p.color }}
                    >
                      <span className={styles.proyectoColor} style={{ background: p.color }} />
                      {p.nombre}
                    </button>
                  ))}
                  <button
                    onClick={() => setNuevoProyecto(true)}
                    className={styles.nuevoProyectoBtn}
                  >
                    + Nuevo
                  </button>
                </div>
              </div>
            )}

            {(proyectos.length === 0 || nuevoProyecto || isTracking) && (
              <>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Proyecto *</label>
                    <input
                      type="text"
                      value={proyecto}
                      onChange={(e) => setProyecto(e.target.value)}
                      placeholder="Nombre del proyecto"
                      className={styles.input}
                      disabled={isTracking}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Cliente</label>
                    <input
                      type="text"
                      value={cliente}
                      onChange={(e) => setCliente(e.target.value)}
                      placeholder="Nombre del cliente"
                      className={styles.input}
                      disabled={isTracking}
                    />
                  </div>
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroupFull}>
                    <label className={styles.label}>Descripción (opcional)</label>
                    <input
                      type="text"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="¿En qué estás trabajando?"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroupSmall}>
                    <label className={styles.label}>€/hora</label>
                    <input
                      type="number"
                      value={tarifa}
                      onChange={(e) => setTarifa(e.target.value)}
                      placeholder="30"
                      className={styles.input}
                      min="0"
                      disabled={isTracking}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`${styles.trackButton} ${isTracking ? styles.stop : styles.start}`}
            >
              {isTracking ? '⏹ Detener' : '▶ Iniciar'}
            </button>
          </div>
        </div>

        {/* Panel de estadísticas */}
        <div className={styles.statsPanel}>
          <div className={styles.statsHeader}>
            <h2 className={styles.panelTitle}>📊 Resumen</h2>
            <div className={styles.filters}>
              <select
                value={filtroProyecto}
                onChange={(e) => setFiltroProyecto(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos los proyectos</option>
                {proyectos.map(p => (
                  <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Últimos 7 días</option>
                <option value="mes">Últimos 30 días</option>
                <option value="todo">Todo</option>
              </select>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏰</div>
              <div className={styles.statValue}>{formatHoursMinutes(stats.totalTiempo)}</div>
              <div className={styles.statLabel}>Tiempo total</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💶</div>
              <div className={styles.statValue}>{formatCurrency(stats.totalGanado)}</div>
              <div className={styles.statLabel}>Total ganado</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📋</div>
              <div className={styles.statValue}>{stats.numEntradas}</div>
              <div className={styles.statLabel}>Registros</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📁</div>
              <div className={styles.statValue}>{stats.proyectosUnicos}</div>
              <div className={styles.statLabel}>Proyectos</div>
            </div>
          </div>

          {/* Desglose por proyecto */}
          {Object.keys(porProyecto).length > 0 && (
            <div className={styles.projectBreakdown}>
              <h3 className={styles.breakdownTitle}>Por proyecto</h3>
              {Object.entries(porProyecto)
                .sort((a, b) => b[1].tiempo - a[1].tiempo)
                .map(([nombre, data]) => (
                  <div key={nombre} className={styles.projectItem}>
                    <div className={styles.projectColor} style={{ background: data.color }} />
                    <div className={styles.projectInfo}>
                      <span className={styles.projectName}>{nombre}</span>
                      <span className={styles.projectStats}>
                        {formatHoursMinutes(data.tiempo)} · {formatCurrency(data.ganado)}
                      </span>
                    </div>
                    <div
                      className={styles.projectBar}
                      style={{
                        width: `${(data.tiempo / stats.totalTiempo) * 100}%`,
                        background: data.color,
                      }}
                    />
                  </div>
                ))}
            </div>
          )}

          {entriesFiltradas.length > 0 && (
            <button onClick={exportarCSV} className={styles.exportBtn}>
              📥 Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* Historial */}
      {entriesFiltradas.length > 0 && (
        <div className={styles.historySection}>
          <h2 className={styles.sectionTitle}>📜 Historial de registros</h2>
          <div className={styles.entriesList}>
            {entriesFiltradas.slice(0, 20).map(entry => {
              const proy = proyectos.find(p => p.nombre === entry.proyecto);
              return (
                <div key={entry.id} className={styles.entryItem}>
                  <div className={styles.entryColor} style={{ background: proy?.color || '#2E86AB' }} />
                  <div className={styles.entryMain}>
                    <div className={styles.entryHeader}>
                      <span className={styles.entryProject}>{entry.proyecto}</span>
                      <span className={styles.entryClient}>{entry.cliente}</span>
                    </div>
                    {entry.descripcion && (
                      <div className={styles.entryDesc}>{entry.descripcion}</div>
                    )}
                  </div>
                  <div className={styles.entryMeta}>
                    <div className={styles.entryDate}>
                      {new Date(entry.inicio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className={styles.entryDuration}>{formatHoursMinutes(entry.duracion)}</div>
                    <div className={styles.entryAmount}>
                      {formatCurrency((entry.duracion / 3600) * entry.tarifa)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className={styles.deleteBtn}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 Guía de Gestión del Tiempo para Freelancers"
        subtitle="Mejora tu productividad y facturación con estos consejos"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Por qué registrar el tiempo?</h2>
            <p>
              El registro de tiempo es esencial para freelancers y autónomos. Te permite conocer
              exactamente cuánto tiempo dedicas a cada cliente, facturar con precisión, identificar
              tareas que consumen más tiempo del esperado y mejorar tus estimaciones futuras.
            </p>
          </section>

          <section className={styles.eduSection}>
            <h2>Mejores prácticas</h2>
            <ul className={styles.tipsList}>
              <li><strong>Registra en tiempo real:</strong> Inicia el timer cuando empiezas, no estimes después</li>
              <li><strong>Sé específico:</strong> Añade descripciones breves de qué estás haciendo</li>
              <li><strong>Revisa semanalmente:</strong> Analiza dónde va tu tiempo y ajusta si es necesario</li>
              <li><strong>Define tarifas realistas:</strong> Considera impuestos, vacaciones y gastos</li>
              <li><strong>Exporta para facturar:</strong> Usa el CSV como base para tus facturas</li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2>Cálculo de tarifa para freelancers</h2>
            <p>
              Tu tarifa por hora debe cubrir: salario neto deseado + impuestos (~30-40% IRPF/IVA) +
              Seguridad Social (~300€/mes) + gastos operativos + vacaciones (divide entre 11 meses, no 12).
            </p>
            <div className={styles.tarifaExample}>
              <strong>Ejemplo:</strong> Si quieres ganar 2.000€ netos/mes trabajando 30h/semana:
              <br />
              2.000€ + 800€ (impuestos) + 300€ (SS) + 200€ (gastos) = 3.300€/mes
              <br />
              3.300€ ÷ 120h = <strong>27,50€/hora mínimo</strong>
            </div>
          </section>
        </div>
      </EducationalSection>

      <Footer appName="time-tracker" />
    </div>
  );
}
