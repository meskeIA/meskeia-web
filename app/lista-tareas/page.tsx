'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './ListaTareas.module.css';
import { MeskeiaLogo, Footer } from '@/components';

// ==================== TIPOS ====================

type Prioridad = 'alta' | 'media' | 'baja';
type FiltroEstado = 'todas' | 'pendientes' | 'completadas';

interface Tarea {
  id: string;
  texto: string;
  completada: boolean;
  prioridad: Prioridad;
  fechaLimite: string | null;
  fechaCreacion: string;
  categoria: string;
}

// ==================== DATOS ====================

const categoriasDefault = [
  { id: 'personal', nombre: 'Personal', emoji: '🏠' },
  { id: 'trabajo', nombre: 'Trabajo', emoji: '💼' },
  { id: 'estudios', nombre: 'Estudios', emoji: '📚' },
  { id: 'compras', nombre: 'Compras', emoji: '🛒' },
  { id: 'salud', nombre: 'Salud', emoji: '🏥' },
  { id: 'otros', nombre: 'Otros', emoji: '📌' },
];

const prioridadConfig = {
  alta: { nombre: 'Alta', color: '#ef4444', emoji: '🔴' },
  media: { nombre: 'Media', color: '#f59e0b', emoji: '🟡' },
  baja: { nombre: 'Baja', color: '#22c55e', emoji: '🟢' },
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function ListaTareasPage() {
  // Estado principal
  const [tareas, setTareas] = useState<Tarea[]>([]);

  // Estado del formulario
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState<Prioridad>('media');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('personal');

  // Estado de filtros
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [ordenarPor, setOrdenarPor] = useState<'fecha' | 'prioridad' | 'creacion'>('creacion');

  // Cargar tareas de localStorage
  useEffect(() => {
    const tareasStorage = localStorage.getItem('meskeia_lista_tareas');
    if (tareasStorage) {
      setTareas(JSON.parse(tareasStorage));
    }
  }, []);

  // Guardar tareas en localStorage
  useEffect(() => {
    localStorage.setItem('meskeia_lista_tareas', JSON.stringify(tareas));
  }, [tareas]);

  // ==================== FUNCIONES ====================

  const agregarTarea = () => {
    if (!nuevoTexto.trim()) return;

    const nuevaTarea: Tarea = {
      id: Date.now().toString(),
      texto: nuevoTexto.trim(),
      completada: false,
      prioridad: nuevaPrioridad,
      fechaLimite: nuevaFecha || null,
      fechaCreacion: new Date().toISOString(),
      categoria: nuevaCategoria,
    };

    setTareas([nuevaTarea, ...tareas]);
    setNuevoTexto('');
    setNuevaFecha('');
  };

  const toggleCompletada = (id: string) => {
    setTareas(tareas.map(t =>
      t.id === id ? { ...t, completada: !t.completada } : t
    ));
  };

  const eliminarTarea = (id: string) => {
    setTareas(tareas.filter(t => t.id !== id));
  };

  const limpiarCompletadas = () => {
    setTareas(tareas.filter(t => !t.completada));
  };

  const limpiarTodas = () => {
    if (confirm('¿Seguro que quieres eliminar todas las tareas?')) {
      setTareas([]);
    }
  };

  // Filtrar y ordenar tareas
  const tareasFiltradas = useMemo(() => {
    let resultado = [...tareas];

    // Filtrar por estado
    if (filtroEstado === 'pendientes') {
      resultado = resultado.filter(t => !t.completada);
    } else if (filtroEstado === 'completadas') {
      resultado = resultado.filter(t => t.completada);
    }

    // Filtrar por categoría
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(t => t.categoria === filtroCategoria);
    }

    // Ordenar
    resultado.sort((a, b) => {
      if (ordenarPor === 'prioridad') {
        const prioridadOrden = { alta: 0, media: 1, baja: 2 };
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      } else if (ordenarPor === 'fecha') {
        if (!a.fechaLimite) return 1;
        if (!b.fechaLimite) return -1;
        return new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime();
      }
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    });

    return resultado;
  }, [tareas, filtroEstado, filtroCategoria, ordenarPor]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada).length;
    const pendientes = total - completadas;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return { total, completadas, pendientes, porcentaje };
  }, [tareas]);

  // Verificar si fecha está vencida
  const estaVencida = (fechaLimite: string | null): boolean => {
    if (!fechaLimite) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(fechaLimite) < hoy;
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string): string => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Lista de Tareas</h1>
        <p className={styles.subtitle}>
          Organiza tu día con prioridades y fechas límite
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de añadir tarea */}
        <section className={styles.addPanel}>
          <div className={styles.addForm}>
            <input
              type="text"
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && agregarTarea()}
              placeholder="¿Qué necesitas hacer?"
              className={styles.inputTarea}
            />
            <div className={styles.addOptions}>
              <select
                value={nuevaPrioridad}
                onChange={(e) => setNuevaPrioridad(e.target.value as Prioridad)}
                className={styles.selectPrioridad}
              >
                <option value="alta">{prioridadConfig.alta.emoji} Alta</option>
                <option value="media">{prioridadConfig.media.emoji} Media</option>
                <option value="baja">{prioridadConfig.baja.emoji} Baja</option>
              </select>
              <select
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className={styles.selectCategoria}
              >
                {categoriasDefault.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.nombre}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                className={styles.inputFecha}
              />
              <button onClick={agregarTarea} className={styles.btnAgregar}>
                + Añadir
              </button>
            </div>
          </div>
        </section>

        {/* Panel de estadísticas */}
        {tareas.length > 0 && (
          <section className={styles.statsPanel}>
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{estadisticas.total}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{estadisticas.pendientes}</span>
                <span className={styles.statLabel}>Pendientes</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{estadisticas.completadas}</span>
                <span className={styles.statLabel}>Completadas</span>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${estadisticas.porcentaje}%` }}
                  />
                </div>
                <span className={styles.progressText}>{estadisticas.porcentaje}%</span>
              </div>
            </div>
          </section>
        )}

        {/* Panel de filtros */}
        <section className={styles.filtrosPanel}>
          <div className={styles.filtrosGrupo}>
            <button
              className={`${styles.filtroBtn} ${filtroEstado === 'todas' ? styles.activo : ''}`}
              onClick={() => setFiltroEstado('todas')}
            >
              Todas
            </button>
            <button
              className={`${styles.filtroBtn} ${filtroEstado === 'pendientes' ? styles.activo : ''}`}
              onClick={() => setFiltroEstado('pendientes')}
            >
              Pendientes
            </button>
            <button
              className={`${styles.filtroBtn} ${filtroEstado === 'completadas' ? styles.activo : ''}`}
              onClick={() => setFiltroEstado('completadas')}
            >
              Completadas
            </button>
          </div>
          <div className={styles.filtrosGrupo}>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={styles.selectFiltro}
            >
              <option value="todas">Todas las categorías</option>
              {categoriasDefault.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.nombre}
                </option>
              ))}
            </select>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value as typeof ordenarPor)}
              className={styles.selectFiltro}
            >
              <option value="creacion">Más recientes</option>
              <option value="prioridad">Por prioridad</option>
              <option value="fecha">Por fecha límite</option>
            </select>
          </div>
        </section>

        {/* Lista de tareas */}
        <section className={styles.listaPanel}>
          {tareasFiltradas.length === 0 ? (
            <div className={styles.listaVacia}>
              <span className={styles.iconVacio}>✅</span>
              <p>{tareas.length === 0 ? 'No tienes tareas todavía' : 'No hay tareas con estos filtros'}</p>
              {tareas.length === 0 && (
                <p className={styles.hint}>Añade tu primera tarea usando el formulario de arriba</p>
              )}
            </div>
          ) : (
            <ul className={styles.listaTareas}>
              {tareasFiltradas.map(tarea => {
                const categoria = categoriasDefault.find(c => c.id === tarea.categoria);
                const vencida = !tarea.completada && estaVencida(tarea.fechaLimite);

                return (
                  <li
                    key={tarea.id}
                    className={`${styles.tareaItem} ${tarea.completada ? styles.completada : ''} ${vencida ? styles.vencida : ''}`}
                  >
                    <button
                      onClick={() => toggleCompletada(tarea.id)}
                      className={styles.checkBtn}
                    >
                      {tarea.completada ? '✓' : '○'}
                    </button>

                    <span
                      className={styles.prioridadIndicador}
                      style={{ backgroundColor: prioridadConfig[tarea.prioridad].color }}
                      title={`Prioridad ${prioridadConfig[tarea.prioridad].nombre}`}
                    />

                    <div className={styles.tareaContenido}>
                      <span className={styles.tareaTexto}>{tarea.texto}</span>
                      <div className={styles.tareaMeta}>
                        <span className={styles.tareaCategoria}>
                          {categoria?.emoji} {categoria?.nombre}
                        </span>
                        {tarea.fechaLimite && (
                          <span className={`${styles.tareaFecha} ${vencida ? styles.fechaVencida : ''}`}>
                            📅 {formatearFecha(tarea.fechaLimite)}
                            {vencida && ' (vencida)'}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => eliminarTarea(tarea.id)}
                      className={styles.deleteBtn}
                      title="Eliminar tarea"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Acciones */}
        {tareas.length > 0 && (
          <section className={styles.accionesPanel}>
            <button onClick={limpiarCompletadas} className={styles.btnAccion}>
              🗑️ Limpiar completadas
            </button>
            <button onClick={limpiarTodas} className={styles.btnAccionDanger}>
              ❌ Eliminar todas
            </button>
          </section>
        )}
      </div>

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔒</span>
            <div>
              <strong>100% Privado</strong>
              <p>Tus tareas se guardan solo en tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <strong>Organización</strong>
              <p>Prioridades, categorías y fechas límite</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⚡</span>
            <div>
              <strong>Sin registro</strong>
              <p>Empieza a usar inmediatamente</p>
            </div>
          </div>
        </div>
      </section>

      <Footer appName="lista-tareas" />
    </div>
  );
}
