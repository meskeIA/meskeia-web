'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TimeTracker.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="time-tracker-disclaimer"
      />

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
          {/* Secciones originales preservadas */}
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

          {/* 1. Tabla Comparativa de Métodos */}
          <section className={styles.eduSection}>
            <h2>Comparativa de métodos de registro de tiempo</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Método</th>
                    <th>Precisión</th>
                    <th>Esfuerzo de uso</th>
                    <th>Ideal para</th>
                    <th>Granularidad</th>
                    <th>Uso en facturación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Time Tracker manual</strong> (este)</td>
                    <td>Alta (±5%)</td>
                    <td>Bajo — un clic</td>
                    <td>Freelancers que facturan por horas</td>
                    <td>Por tarea/proyecto</td>
                    <td>Directo — exportar CSV</td>
                  </tr>
                  <tr>
                    <td><strong>Seguimiento automático</strong></td>
                    <td>Muy alta (±1%)</td>
                    <td>Ninguno</td>
                    <td>Desarrolladores, diseñadores</td>
                    <td>Por aplicación/URL</td>
                    <td>Requiere filtrado manual</td>
                  </tr>
                  <tr>
                    <td><strong>Técnica Pomodoro</strong></td>
                    <td>Media (±15%)</td>
                    <td>Medio</td>
                    <td>Trabajo en bloque de concentración</td>
                    <td>Intervalos de 25 min</td>
                    <td>Aproximado — no recomendado</td>
                  </tr>
                  <tr>
                    <td><strong>Timeboxing</strong></td>
                    <td>Media (±20%)</td>
                    <td>Medio-alto</td>
                    <td>Gestores de proyectos</td>
                    <td>Por bloque de agenda</td>
                    <td>Solo como referencia</td>
                  </tr>
                  <tr>
                    <td><strong>Estimación por proyecto</strong></td>
                    <td>Baja (±40%)</td>
                    <td>Muy bajo</td>
                    <td>Presupuestos iniciales</td>
                    <td>Global por proyecto</td>
                    <td>No recomendado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de Uso */}
          <section className={styles.eduSection}>
            <h2>¿Para quién es útil el time tracking?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                  <strong>Freelancer / Autónomo</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Factura a varios clientes por horas. Necesita justificar cada hora en la factura y
                  demostrar el trabajo realizado.
                </p>
                <p className={styles.escenarioTip}>
                  <strong>Clave:</strong> Registrar tiempo facturable vs. no facturable (gestiones,
                  formación, administración). Los freelancers subestiman tareas un 40% de media.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                  <strong>Empleado en teletrabajo</strong>
                </div>
                <p className={styles.escenarioExample}>
                  El RD 8/2019 obliga a todas las empresas españolas a registrar la jornada diaria.
                  En teletrabajo, este registro es responsabilidad del trabajador.
                </p>
                <p className={styles.escenarioTip}>
                  <strong>Clave:</strong> Guardar el historial exportado como evidencia. La Inspección
                  de Trabajo puede requerir registros de hasta 4 años atrás.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                  <strong>Gestor de proyectos</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Controla que el equipo no supera el presupuesto de horas acordado con el cliente.
                  Detecta desviaciones antes de que sean críticas.
                </p>
                <p className={styles.escenarioTip}>
                  <strong>Clave:</strong> Comparar tiempo estimado vs. real por sprint o fase.
                  La revisión semanal mejora la precisión de estimaciones futuras un 25%.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                  <strong>Emprendedor</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Analiza en qué tareas gasta su tiempo y si esas tareas generan ingresos reales.
                  Decide qué delegar o eliminar.
                </p>
                <p className={styles.escenarioTip}>
                  <strong>Clave:</strong> Calcular el coste real de cada actividad (tiempo × tarifa
                  alternativa). Si registrar facturas le cuesta 3h/semana, valorar externalizar.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.eduSection}>
            <h2>Preguntas frecuentes sobre time tracking</h2>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt>¿Para qué sirve el time tracking?</dt>
                <dd>
                  El time tracking registra el tiempo real dedicado a cada tarea, proyecto o cliente.
                  Sirve para facturar con precisión, mejorar estimaciones, identificar tareas ineficientes
                  y justificar el trabajo ante clientes o empleadores.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cuál es la diferencia entre tiempo estimado y tiempo real?</dt>
                <dd>
                  El tiempo estimado es lo que crees que tardará una tarea antes de hacerla. El tiempo
                  real es lo que has tardado de verdad. Los estudios muestran que las personas subestiman
                  las tareas entre un 20% y un 50% (sesgo de planificación). El time tracking es la única
                  forma de corregir este sesgo con datos objetivos.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cuánto mejora la productividad con time tracking?</dt>
                <dd>
                  Según estudios de gestión del tiempo, quienes registran su jornada identifican en
                  promedio un 20-30% de tiempo desperdiciado que no eran conscientes de perder. Además,
                  el simple hecho de saber que el tiempo está siendo registrado (efecto Hawthorne)
                  puede aumentar la concentración hasta un 15%.
                </dd>
                <dd className={styles.faqTip}>Consejo: revisa tus registros cada viernes durante 4 semanas y verás patrones claros.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cómo registro las interrupciones?</dt>
                <dd>
                  Detén el timer cuando hay una interrupción significativa (llamada, reunión no
                  planificada, gestión administrativa). Para interrupciones cortas de menos de 2 minutos,
                  no merece la pena parar. Crea una categoría específica como &ldquo;Reuniones internas&rdquo; o
                  &ldquo;Interrupciones&rdquo; para hacer visible este coste oculto.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Obliga la ley española a registrar el tiempo de trabajo?</dt>
                <dd>
                  Sí. El <strong>Real Decreto-ley 8/2019</strong> modificó el Estatuto de los Trabajadores
                  (art. 34.9) y obliga a todas las empresas a garantizar el registro diario de la jornada
                  de trabajo. La empresa debe conservar los registros durante 4 años. El incumplimiento
                  puede acarrear sanciones de hasta 6.250€ por infracción grave.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cómo usar el registro de tiempo para mejorar presupuestos futuros?</dt>
                <dd>
                  Exporta el CSV y agrupa por tipo de tarea. Calcula el tiempo medio real de tareas
                  similares. Cuando presupuestes un nuevo proyecto, usa esos datos históricos en lugar de
                  estimaciones intuitivas. Con 3-6 meses de datos, tus presupuestos mejorarán un 25-40%
                  en precisión.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué diferencia hay entre tiempo de trabajo y tiempo productivo?</dt>
                <dd>
                  El tiempo de trabajo es todo el tiempo que estás &ldquo;trabajando&rdquo; (incluyendo correos,
                  reuniones, gestiones). El tiempo productivo es el tiempo dedicado a tareas que generan
                  valor directo. La mayoría de profesionales tienen entre 3 y 5 horas de trabajo
                  productivo real en una jornada de 8 horas. El resto son tareas necesarias pero no
                  directamente productivas.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cómo facturar por horas correctamente en España como autónomo?</dt>
                <dd>
                  La factura debe incluir: número de horas trabajadas, descripción del trabajo realizado,
                  tarifa por hora acordada y el total. Al ser autónomo, debes añadir IVA (generalmente 21%)
                  y aplicar retención de IRPF si el cliente es empresa o profesional (15%, o 7% el primer
                  año). Guarda siempre el CSV de time tracking como documentación de soporte de la factura.
                </dd>
                <dd className={styles.faqTip}>Importante: el CSV exportado de esta herramienta puede servir como anexo justificativo de horas en tu factura.</dd>
              </div>
            </dl>
          </section>

          {/* 4. Guía Paso a Paso */}
          <section className={styles.eduSection}>
            <h2>Cómo implementar time tracking efectivo en 7 pasos</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <strong>Define tus categorías de proyecto antes de empezar</strong>
                  <p>
                    Crea proyectos con nombres claros y consistentes: cliente + tipo de trabajo
                    (ej: &ldquo;ClienteABC - Desarrollo&rdquo;, &ldquo;ClienteABC - Reuniones&rdquo;). Separa siempre
                    tiempo facturable de no facturable desde el inicio.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <strong>Establece la tarifa correcta para cada proyecto</strong>
                  <p>
                    Introduce la tarifa acordada con el cliente en €/hora. Esto permite calcular
                    automáticamente el valor económico de cada sesión de trabajo y el total facturado.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <strong>Activa el timer al inicio de cada tarea, no al final</strong>
                  <p>
                    El error más común es registrar el tiempo de memoria al final del día. Esto introduce
                    errores de hasta el 50%. Haz del clic en &ldquo;Iniciar&rdquo; un hábito automático antes de
                    comenzar cualquier tarea.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <strong>Añade una descripción breve en cada registro</strong>
                  <p>
                    Una descripción de 3-5 palabras (&ldquo;Maquetación página home&rdquo;, &ldquo;Revisión feedback cliente&rdquo;)
                    es suficiente. Te permitirá entender los registros semanas después y justificar
                    las horas ante el cliente si lo pide.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <strong>Para el timer en interrupciones de más de 2 minutos</strong>
                  <p>
                    Llamadas, reuniones espontáneas, gestiones bancarias: detén el timer y crea
                    una entrada nueva para esa actividad. Así tendrás datos reales sobre cuánto
                    tiempo te roban las interrupciones.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">6</span>
                <div className={styles.stepContent}>
                  <strong>Exporta el CSV al final de cada semana</strong>
                  <p>
                    Descarga el CSV cada viernes y guárdalo en una carpeta por mes. Estos archivos
                    son tu documentación de trabajo: útiles para facturar, para resolución de disputas
                    con clientes y como respaldo ante Hacienda.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">7</span>
                <div className={styles.stepContent}>
                  <strong>Revisa y aprende de tus datos cada semana</strong>
                  <p>
                    Dedica 15 minutos cada lunes a revisar la semana anterior. Pregúntate: ¿qué tareas
                    tardaron más de lo esperado? ¿Cuánto tiempo facturable vs. no facturable? Esta revisión,
                    constante durante 4 semanas, mejora la precisión de tus estimaciones futuras un 25%.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* 5. Mejores Prácticas */}
          <section className={styles.eduSection}>
            <h2>6 mejores prácticas para un time tracking eficaz</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚡</span>
                <strong>Registra en tiempo real</strong>
                <p>
                  Nunca registres el tiempo de memoria al final del día. Los estudios muestran
                  errores de hasta el 50% en el registro retroactivo. El timer en tiempo real
                  es la única fuente fiable de datos.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
                <strong>Mantén categorías claras y pocas</strong>
                <p>
                  Entre 3 y 8 proyectos activos es el rango óptimo. Más de 10 categorías provoca
                  parálisis de decisión y hace que el registro sea menos consistente. Agrupa
                  clientes pequeños bajo &ldquo;Varios&rdquo; si hay poca facturación.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📅</span>
                <strong>Revisión semanal obligatoria</strong>
                <p>
                  15 minutos cada lunes revisando la semana anterior. Compara tiempo estimado vs.
                  real. Identifica el proyecto que más tiempo consumió vs. el que más ingresos generó.
                  La revisión semanal mejora la precisión de estimaciones un 25%.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
                <strong>Regla de los 15 minutos para microgestión</strong>
                <p>
                  No registres tareas de menos de 15 minutos de forma individual: agrúpalas en
                  &ldquo;Gestiones&rdquo; o &ldquo;Administración&rdquo;. Registrar cada email de 3 minutos es agotador
                  y crea un historial demasiado granular para ser útil.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💶</span>
                <strong>Separa tiempo facturable de no facturable</strong>
                <p>
                  Usa proyectos separados: &ldquo;ClienteABC - Trabajo&rdquo; (facturable) y &ldquo;Admin general&rdquo;
                  (no facturable). Esto te permite ver tu ratio real de eficiencia y qué porcentaje
                  de tu jornada se traduce en ingresos reales.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <strong>Exporta y analiza mensualmente</strong>
                <p>
                  El CSV exportado contiene todos tus datos de tiempo e importes. Ábrelo en Excel
                  o Google Sheets para crear tablas dinámicas: ingresos por cliente, horas por
                  categoría, tendencias mensuales. Son datos de oro para negociar tarifas.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Warning Box */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>6 errores comunes que debes evitar</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Registrar el tiempo retroactivamente:</strong> Hacerlo de memoria al final
                  del día introduce errores de hasta el 50%. Es el error más frecuente y el más
                  dañino para la precisión de tu facturación.
                </li>
                <li>
                  <strong>Crear demasiadas categorías:</strong> Más de 10 proyectos activos provoca
                  parálisis de decisión cada vez que activas el timer. Resultado: dejas de registrar.
                  Empieza con pocas categorías y amplía solo si es necesario.
                </li>
                <li>
                  <strong>No revisar los datos acumulados:</strong> Registrar sin revisar es como
                  llevar un diario que nunca relees. Sin revisión semanal, los datos no se traducen
                  en mejoras de estimación ni en optimización de tu negocio.
                </li>
                <li>
                  <strong>Confundir tiempo trabajado con tiempo productivo:</strong> 8 horas de
                  jornada no equivalen a 8 horas facturables. Las reuniones, los correos y las
                  gestiones son trabajo, pero no siempre son facturables. Mide ambos por separado.
                </li>
                <li>
                  <strong>No registrar reuniones y correos en el registro:</strong> Las reuniones
                  con clientes, las llamadas de seguimiento y la revisión de correos son tiempo
                  de trabajo real. Si no los registras, estás regalando horas y distorsionando
                  tu tarifa efectiva real.
                </li>
                <li>
                  <strong>Ignorar el tiempo de administración en freelance:</strong> Emitir facturas,
                  gestionar el alta en Hacienda, contabilidad, búsqueda de clientes... Los freelancers
                  dedican entre 10% y 20% de su jornada a tareas administrativas no facturables.
                  Si no las contabilizas, tu tarifa efectiva real es mucho menor de lo que crees.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('time-tracker')} />

      <ShareCard appName="time-tracker" />
      <Footer appName="time-tracker" />
    </div>
  );
}
