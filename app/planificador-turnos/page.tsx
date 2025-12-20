'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './PlanificadorTurnos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============ TIPOS ============

interface Empleado {
  id: string;
  nombre: string;
  horasMaxSemana: number;
  color: string;
  disponibilidad: boolean[][]; // [franjaIdx][diaIdx]
}

interface FranjaHoraria {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  duracionHoras: number;
}

interface Asignacion {
  franjaId: string;
  diaIdx: number;
  empleadoId: string | null;
  semana: string;
}

type TabType = 'empleados' | 'franjas' | 'planificacion';

// ============ CONSTANTES ============

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_COMPLETOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const COLORES_EMPLEADOS = [
  '#2E86AB', '#48A9A6', '#E07A5F', '#81B29A', '#F4A261',
  '#9C6644', '#6D597A', '#355070', '#B56576', '#EAAC8B'
];

const FRANJAS_INICIALES: FranjaHoraria[] = [
  { id: '1', nombre: 'Mañana', horaInicio: '08:00', horaFin: '14:00', duracionHoras: 6 },
  { id: '2', nombre: 'Tarde', horaInicio: '14:00', horaFin: '20:00', duracionHoras: 6 },
];

const STORAGE_KEY = 'meskeia_planificador_turnos';

// ============ UTILIDADES ============

const calcularDuracion = (inicio: string, fin: string): number => {
  const [hInicio, mInicio] = inicio.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);
  let minutos = (hFin * 60 + mFin) - (hInicio * 60 + mInicio);
  if (minutos < 0) minutos += 24 * 60; // Turno nocturno
  return minutos / 60;
};

const getSemanaActual = (): string => {
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), 0, 1);
  const dias = Math.floor((hoy.getTime() - primerDia.getTime()) / 86400000);
  const semana = Math.ceil((dias + primerDia.getDay() + 1) / 7);
  return `${hoy.getFullYear()}-W${semana.toString().padStart(2, '0')}`;
};

const getFechasDeSemana = (semanaStr: string): Date[] => {
  const [year, week] = semanaStr.split('-W').map(Number);
  const primerDiaAno = new Date(year, 0, 1);
  const diasHastaPrimerLunes = (8 - primerDiaAno.getDay()) % 7;
  const primerLunes = new Date(year, 0, 1 + diasHastaPrimerLunes + (week - 1) * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(primerLunes);
    fecha.setDate(primerLunes.getDate() + i);
    return fecha;
  });
};

const formatearFechaSemana = (semanaStr: string): string => {
  const fechas = getFechasDeSemana(semanaStr);
  const inicio = fechas[0];
  const fin = fechas[6];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${inicio.getDate()} ${meses[inicio.getMonth()]} - ${fin.getDate()} ${meses[fin.getMonth()]} ${fin.getFullYear()}`;
};

const cambiarSemana = (semanaStr: string, delta: number): string => {
  const [year, week] = semanaStr.split('-W').map(Number);
  let nuevoWeek = week + delta;
  let nuevoYear = year;

  if (nuevoWeek < 1) {
    nuevoYear--;
    nuevoWeek = 52;
  } else if (nuevoWeek > 52) {
    nuevoYear++;
    nuevoWeek = 1;
  }

  return `${nuevoYear}-W${nuevoWeek.toString().padStart(2, '0')}`;
};

// ============ COMPONENTE PRINCIPAL ============

export default function PlanificadorTurnosPage() {
  // Estado principal
  const [activeTab, setActiveTab] = useState<TabType>('empleados');
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [franjas, setFranjas] = useState<FranjaHoraria[]>(FRANJAS_INICIALES);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [semanaActual, setSemanaActual] = useState(getSemanaActual());

  // Estado de UI
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string | null>(null);
  const [mostrarFormEmpleado, setMostrarFormEmpleado] = useState(false);
  const [mostrarFormFranja, setMostrarFormFranja] = useState(false);
  const [editandoEmpleado, setEditandoEmpleado] = useState<Empleado | null>(null);
  const [editandoFranja, setEditandoFranja] = useState<FranjaHoraria | null>(null);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<{ franjaId: string; diaIdx: number } | null>(null);

  // Formularios
  const [formEmpleado, setFormEmpleado] = useState({ nombre: '', horasMaxSemana: '40' });
  const [formFranja, setFormFranja] = useState({ nombre: '', horaInicio: '08:00', horaFin: '14:00' });

  // ============ PERSISTENCIA ============

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.empleados) setEmpleados(data.empleados);
        if (data.franjas) setFranjas(data.franjas);
        if (data.asignaciones) setAsignaciones(data.asignaciones);
      } catch (e) {
        console.error('Error al cargar datos:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      empleados,
      franjas,
      asignaciones
    }));
  }, [empleados, franjas, asignaciones]);

  // ============ CÁLCULOS ============

  const asignacionesSemana = useMemo(() => {
    return asignaciones.filter(a => a.semana === semanaActual);
  }, [asignaciones, semanaActual]);

  const horasPorEmpleado = useMemo(() => {
    const horas: Record<string, number> = {};
    empleados.forEach(e => { horas[e.id] = 0; });

    asignacionesSemana.forEach(a => {
      if (a.empleadoId) {
        const franja = franjas.find(f => f.id === a.franjaId);
        if (franja) {
          horas[a.empleadoId] = (horas[a.empleadoId] || 0) + franja.duracionHoras;
        }
      }
    });

    return horas;
  }, [asignacionesSemana, franjas, empleados]);

  const alertas = useMemo(() => {
    const alerts: string[] = [];

    empleados.forEach(emp => {
      const horas = horasPorEmpleado[emp.id] || 0;
      if (horas > emp.horasMaxSemana) {
        alerts.push(`${emp.nombre}: ${horas}h asignadas (máx ${emp.horasMaxSemana}h)`);
      }
    });

    return alerts;
  }, [empleados, horasPorEmpleado]);

  const cobertura = useMemo(() => {
    const totalTurnos = franjas.length * 7;
    const turnosCubiertos = asignacionesSemana.filter(a => a.empleadoId !== null).length;
    return { cubiertos: turnosCubiertos, total: totalTurnos };
  }, [franjas, asignacionesSemana]);

  // ============ FUNCIONES EMPLEADOS ============

  const crearDisponibilidadInicial = useCallback((): boolean[][] => {
    return franjas.map(() => DIAS.map((_, diaIdx) => diaIdx < 5)); // L-V disponible
  }, [franjas]);

  const agregarEmpleado = () => {
    if (!formEmpleado.nombre.trim()) return;

    const nuevoEmpleado: Empleado = {
      id: Date.now().toString(),
      nombre: formEmpleado.nombre.trim(),
      horasMaxSemana: parseInt(formEmpleado.horasMaxSemana) || 40,
      color: COLORES_EMPLEADOS[empleados.length % COLORES_EMPLEADOS.length],
      disponibilidad: crearDisponibilidadInicial()
    };

    setEmpleados([...empleados, nuevoEmpleado]);
    setFormEmpleado({ nombre: '', horasMaxSemana: '40' });
    setMostrarFormEmpleado(false);
  };

  const actualizarEmpleado = () => {
    if (!editandoEmpleado || !formEmpleado.nombre.trim()) return;

    setEmpleados(empleados.map(e =>
      e.id === editandoEmpleado.id
        ? { ...e, nombre: formEmpleado.nombre.trim(), horasMaxSemana: parseInt(formEmpleado.horasMaxSemana) || 40 }
        : e
    ));

    setEditandoEmpleado(null);
    setFormEmpleado({ nombre: '', horasMaxSemana: '40' });
    setMostrarFormEmpleado(false);
  };

  const eliminarEmpleado = (id: string) => {
    if (!confirm('¿Eliminar este empleado? Se borrarán sus asignaciones.')) return;
    setEmpleados(empleados.filter(e => e.id !== id));
    setAsignaciones(asignaciones.filter(a => a.empleadoId !== id));
    if (empleadoSeleccionado === id) setEmpleadoSeleccionado(null);
  };

  const toggleDisponibilidad = (empleadoId: string, franjaIdx: number, diaIdx: number) => {
    setEmpleados(empleados.map(emp => {
      if (emp.id !== empleadoId) return emp;

      const nuevaDisp = emp.disponibilidad.map((franja, fIdx) =>
        franja.map((activo, dIdx) =>
          fIdx === franjaIdx && dIdx === diaIdx ? !activo : activo
        )
      );

      return { ...emp, disponibilidad: nuevaDisp };
    }));
  };

  // Sincronizar disponibilidad cuando cambian las franjas
  useEffect(() => {
    if (franjas.length === 0) return;

    setEmpleados(prev => prev.map(emp => {
      // Si hay más franjas que filas de disponibilidad, añadir
      if (emp.disponibilidad.length < franjas.length) {
        const nuevasFilas = Array.from(
          { length: franjas.length - emp.disponibilidad.length },
          () => DIAS.map((_, diaIdx) => diaIdx < 5)
        );
        return { ...emp, disponibilidad: [...emp.disponibilidad, ...nuevasFilas] };
      }
      // Si hay menos franjas, recortar
      if (emp.disponibilidad.length > franjas.length) {
        return { ...emp, disponibilidad: emp.disponibilidad.slice(0, franjas.length) };
      }
      return emp;
    }));
  }, [franjas.length]);

  // ============ FUNCIONES FRANJAS ============

  const agregarFranja = () => {
    if (!formFranja.nombre.trim()) return;

    const duracion = calcularDuracion(formFranja.horaInicio, formFranja.horaFin);

    const nuevaFranja: FranjaHoraria = {
      id: Date.now().toString(),
      nombre: formFranja.nombre.trim(),
      horaInicio: formFranja.horaInicio,
      horaFin: formFranja.horaFin,
      duracionHoras: duracion
    };

    setFranjas([...franjas, nuevaFranja]);
    setFormFranja({ nombre: '', horaInicio: '08:00', horaFin: '14:00' });
    setMostrarFormFranja(false);
  };

  const actualizarFranja = () => {
    if (!editandoFranja || !formFranja.nombre.trim()) return;

    const duracion = calcularDuracion(formFranja.horaInicio, formFranja.horaFin);

    setFranjas(franjas.map(f =>
      f.id === editandoFranja.id
        ? { ...f, nombre: formFranja.nombre.trim(), horaInicio: formFranja.horaInicio, horaFin: formFranja.horaFin, duracionHoras: duracion }
        : f
    ));

    setEditandoFranja(null);
    setFormFranja({ nombre: '', horaInicio: '08:00', horaFin: '14:00' });
    setMostrarFormFranja(false);
  };

  const eliminarFranja = (id: string) => {
    if (franjas.length <= 1) {
      alert('Debe haber al menos una franja horaria.');
      return;
    }
    if (!confirm('¿Eliminar esta franja? Se borrarán las asignaciones asociadas.')) return;
    setFranjas(franjas.filter(f => f.id !== id));
    setAsignaciones(asignaciones.filter(a => a.franjaId !== id));
  };

  // ============ FUNCIONES ASIGNACIONES ============

  const getAsignacion = (franjaId: string, diaIdx: number): Asignacion | undefined => {
    return asignacionesSemana.find(a => a.franjaId === franjaId && a.diaIdx === diaIdx);
  };

  const asignarEmpleado = (franjaId: string, diaIdx: number, empleadoId: string | null) => {
    const existe = asignaciones.findIndex(
      a => a.franjaId === franjaId && a.diaIdx === diaIdx && a.semana === semanaActual
    );

    if (existe >= 0) {
      if (empleadoId === null) {
        // Eliminar asignación
        setAsignaciones(asignaciones.filter((_, i) => i !== existe));
      } else {
        // Actualizar asignación
        setAsignaciones(asignaciones.map((a, i) =>
          i === existe ? { ...a, empleadoId } : a
        ));
      }
    } else if (empleadoId !== null) {
      // Nueva asignación
      setAsignaciones([...asignaciones, { franjaId, diaIdx, empleadoId, semana: semanaActual }]);
    }

    setCeldaSeleccionada(null);
  };

  const empleadosDisponibles = (franjaId: string, diaIdx: number): Empleado[] => {
    const franjaIdx = franjas.findIndex(f => f.id === franjaId);
    if (franjaIdx < 0) return [];

    return empleados.filter(emp => {
      // Verificar disponibilidad
      if (!emp.disponibilidad[franjaIdx]?.[diaIdx]) return false;

      // Verificar si ya está asignado en esta franja/día
      const yaAsignado = asignacionesSemana.some(
        a => a.franjaId === franjaId && a.diaIdx === diaIdx && a.empleadoId === emp.id
      );
      if (yaAsignado) return true; // Mostrar el actual

      return true;
    });
  };

  // ============ GENERACIÓN AUTOMÁTICA ============

  const generarAutomatico = () => {
    if (empleados.length === 0) {
      alert('Añade al menos un empleado primero.');
      return;
    }

    if (!confirm('¿Generar horario automático? Se sobrescribirán las asignaciones actuales de esta semana.')) return;

    // Limpiar asignaciones de la semana actual
    const nuevasAsignaciones = asignaciones.filter(a => a.semana !== semanaActual);

    // Para cada turno (franja × día)
    franjas.forEach((franja, franjaIdx) => {
      DIAS.forEach((_, diaIdx) => {
        // Obtener empleados disponibles para este slot
        const disponibles = empleados.filter(emp => {
          // Verificar disponibilidad
          if (!emp.disponibilidad[franjaIdx]?.[diaIdx]) return false;
          return true;
        });

        if (disponibles.length === 0) return;

        // Calcular horas actuales de cada empleado disponible
        const horasActuales: Record<string, number> = {};
        disponibles.forEach(emp => {
          horasActuales[emp.id] = 0;
          nuevasAsignaciones
            .filter(a => a.empleadoId === emp.id && a.semana === semanaActual)
            .forEach(a => {
              const f = franjas.find(fr => fr.id === a.franjaId);
              if (f) horasActuales[emp.id] += f.duracionHoras;
            });
        });

        // Ordenar por menos horas asignadas
        const ordenados = [...disponibles].sort((a, b) =>
          (horasActuales[a.id] || 0) - (horasActuales[b.id] || 0)
        );

        // Intentar asignar al primero que pueda
        for (const emp of ordenados) {
          const horasTras = (horasActuales[emp.id] || 0) + franja.duracionHoras;
          if (horasTras <= emp.horasMaxSemana) {
            nuevasAsignaciones.push({
              franjaId: franja.id,
              diaIdx,
              empleadoId: emp.id,
              semana: semanaActual
            });
            horasActuales[emp.id] = horasTras;
            break;
          }
        }
      });
    });

    setAsignaciones(nuevasAsignaciones);
  };

  const limpiarSemana = () => {
    if (!confirm('¿Limpiar todas las asignaciones de esta semana?')) return;
    setAsignaciones(asignaciones.filter(a => a.semana !== semanaActual));
  };

  // ============ RENDER ============

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📅</span>
        <h1 className={styles.title}>Planificador de Turnos</h1>
        <p className={styles.subtitle}>
          Organiza los horarios de trabajo de tu equipo de forma sencilla
        </p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'empleados' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('empleados')}
        >
          👥 Empleados ({empleados.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'franjas' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('franjas')}
        >
          ⏰ Franjas ({franjas.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'planificacion' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('planificacion')}
        >
          📋 Planificación
        </button>
      </div>

      {/* Tab Empleados */}
      {activeTab === 'empleados' && (
        <div className={styles.tabContent}>
          <div className={styles.sectionHeader}>
            <h2>Gestión de Empleados</h2>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setEditandoEmpleado(null);
                setFormEmpleado({ nombre: '', horasMaxSemana: '40' });
                setMostrarFormEmpleado(true);
              }}
            >
              + Añadir empleado
            </button>
          </div>

          {mostrarFormEmpleado && (
            <div className={styles.formCard}>
              <h3>{editandoEmpleado ? 'Editar empleado' : 'Nuevo empleado'}</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={formEmpleado.nombre}
                    onChange={e => setFormEmpleado({ ...formEmpleado, nombre: e.target.value })}
                    placeholder="Ej: María García"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Horas máx/semana</label>
                  <input
                    type="number"
                    value={formEmpleado.horasMaxSemana}
                    onChange={e => setFormEmpleado({ ...formEmpleado, horasMaxSemana: e.target.value })}
                    min="1"
                    max="168"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={() => setMostrarFormEmpleado(false)}>
                  Cancelar
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={editandoEmpleado ? actualizarEmpleado : agregarEmpleado}
                >
                  {editandoEmpleado ? 'Guardar cambios' : 'Añadir'}
                </button>
              </div>
            </div>
          )}

          {empleados.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>👥</span>
              <p>No hay empleados registrados</p>
              <p className={styles.emptyHint}>Añade empleados para comenzar a planificar turnos</p>
            </div>
          ) : (
            <>
              <div className={styles.empleadosGrid}>
                {empleados.map(emp => (
                  <div
                    key={emp.id}
                    className={`${styles.empleadoCard} ${empleadoSeleccionado === emp.id ? styles.empleadoCardSelected : ''}`}
                    style={{ borderLeftColor: emp.color }}
                    onClick={() => setEmpleadoSeleccionado(empleadoSeleccionado === emp.id ? null : emp.id)}
                  >
                    <div className={styles.empleadoHeader}>
                      <div className={styles.empleadoColor} style={{ backgroundColor: emp.color }} />
                      <div className={styles.empleadoInfo}>
                        <span className={styles.empleadoNombre}>{emp.nombre}</span>
                        <span className={styles.empleadoHoras}>
                          {horasPorEmpleado[emp.id] || 0}/{emp.horasMaxSemana}h
                        </span>
                      </div>
                    </div>
                    <div className={styles.empleadoActions}>
                      <button
                        className={styles.btnIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditandoEmpleado(emp);
                          setFormEmpleado({ nombre: emp.nombre, horasMaxSemana: emp.horasMaxSemana.toString() });
                          setMostrarFormEmpleado(true);
                        }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.btnIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarEmpleado(emp.id);
                        }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {empleadoSeleccionado && (
                <div className={styles.disponibilidadPanel}>
                  <h3>
                    Disponibilidad de {empleados.find(e => e.id === empleadoSeleccionado)?.nombre}
                  </h3>
                  <p className={styles.disponibilidadHint}>
                    Haz clic en las celdas para marcar/desmarcar disponibilidad
                  </p>
                  <div className={styles.disponibilidadGrid}>
                    <div className={styles.disponibilidadHeader}>
                      <div className={styles.disponibilidadCorner}></div>
                      {DIAS.map(dia => (
                        <div key={dia} className={styles.disponibilidadDia}>{dia}</div>
                      ))}
                    </div>
                    {franjas.map((franja, franjaIdx) => {
                      const emp = empleados.find(e => e.id === empleadoSeleccionado);
                      if (!emp) return null;

                      return (
                        <div key={franja.id} className={styles.disponibilidadRow}>
                          <div className={styles.disponibilidadFranja}>{franja.nombre}</div>
                          {DIAS.map((_, diaIdx) => {
                            const disponible = emp.disponibilidad[franjaIdx]?.[diaIdx] ?? false;
                            return (
                              <div
                                key={diaIdx}
                                className={`${styles.disponibilidadCelda} ${disponible ? styles.disponibilidadActiva : ''}`}
                                onClick={() => toggleDisponibilidad(empleadoSeleccionado, franjaIdx, diaIdx)}
                              >
                                {disponible ? '✓' : ''}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab Franjas */}
      {activeTab === 'franjas' && (
        <div className={styles.tabContent}>
          <div className={styles.sectionHeader}>
            <h2>Franjas Horarias</h2>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setEditandoFranja(null);
                setFormFranja({ nombre: '', horaInicio: '08:00', horaFin: '14:00' });
                setMostrarFormFranja(true);
              }}
            >
              + Añadir franja
            </button>
          </div>

          {mostrarFormFranja && (
            <div className={styles.formCard}>
              <h3>{editandoFranja ? 'Editar franja' : 'Nueva franja horaria'}</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={formFranja.nombre}
                    onChange={e => setFormFranja({ ...formFranja, nombre: e.target.value })}
                    placeholder="Ej: Turno mañana"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Hora inicio</label>
                  <input
                    type="time"
                    value={formFranja.horaInicio}
                    onChange={e => setFormFranja({ ...formFranja, horaInicio: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Hora fin</label>
                  <input
                    type="time"
                    value={formFranja.horaFin}
                    onChange={e => setFormFranja({ ...formFranja, horaFin: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={() => setMostrarFormFranja(false)}>
                  Cancelar
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={editandoFranja ? actualizarFranja : agregarFranja}
                >
                  {editandoFranja ? 'Guardar cambios' : 'Añadir'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.franjasLista}>
            {franjas.map(franja => (
              <div key={franja.id} className={styles.franjaItem}>
                <div className={styles.franjaInfo}>
                  <span className={styles.franjaNombre}>{franja.nombre}</span>
                  <span className={styles.franjaHorario}>
                    {franja.horaInicio} - {franja.horaFin} ({franja.duracionHoras}h)
                  </span>
                </div>
                <div className={styles.franjaActions}>
                  <button
                    className={styles.btnIcon}
                    onClick={() => {
                      setEditandoFranja(franja);
                      setFormFranja({
                        nombre: franja.nombre,
                        horaInicio: franja.horaInicio,
                        horaFin: franja.horaFin
                      });
                      setMostrarFormFranja(true);
                    }}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className={styles.btnIcon}
                    onClick={() => eliminarFranja(franja.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Planificación */}
      {activeTab === 'planificacion' && (
        <div className={styles.tabContent}>
          <div className={styles.planificacionHeader}>
            <div className={styles.semanaNav}>
              <button
                className={styles.btnNav}
                onClick={() => setSemanaActual(cambiarSemana(semanaActual, -1))}
              >
                ◀
              </button>
              <span className={styles.semanaLabel}>
                {formatearFechaSemana(semanaActual)}
              </span>
              <button
                className={styles.btnNav}
                onClick={() => setSemanaActual(cambiarSemana(semanaActual, 1))}
              >
                ▶
              </button>
            </div>
            <div className={styles.planificacionActions}>
              <button className={styles.btnSecondary} onClick={limpiarSemana}>
                🗑️ Limpiar
              </button>
              <button className={styles.btnPrimary} onClick={generarAutomatico}>
                ⚡ Generar automático
              </button>
            </div>
          </div>

          {empleados.length === 0 || franjas.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📋</span>
              <p>Configura empleados y franjas primero</p>
              <p className={styles.emptyHint}>
                Ve a las pestañas Empleados y Franjas para añadir la información necesaria
              </p>
            </div>
          ) : (
            <>
              <div className={styles.calendarioWrapper}>
                <table className={styles.calendario}>
                  <thead>
                    <tr>
                      <th className={styles.calendarioCorner}>Franja</th>
                      {DIAS_COMPLETOS.map((dia, idx) => {
                        const fechas = getFechasDeSemana(semanaActual);
                        return (
                          <th key={dia} className={styles.calendarioDia}>
                            <span className={styles.diaNombre}>{DIAS[idx]}</span>
                            <span className={styles.diaFecha}>{fechas[idx].getDate()}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {franjas.map(franja => (
                      <tr key={franja.id}>
                        <td className={styles.calendarioFranja}>
                          <span className={styles.franjaNombreCell}>{franja.nombre}</span>
                          <span className={styles.franjaHorarioCell}>
                            {franja.horaInicio}-{franja.horaFin}
                          </span>
                        </td>
                        {DIAS.map((_, diaIdx) => {
                          const asig = getAsignacion(franja.id, diaIdx);
                          const empleado = asig?.empleadoId
                            ? empleados.find(e => e.id === asig.empleadoId)
                            : null;
                          const esCeldaActiva = celdaSeleccionada?.franjaId === franja.id &&
                                                celdaSeleccionada?.diaIdx === diaIdx;

                          return (
                            <td
                              key={diaIdx}
                              className={`${styles.calendarioCelda} ${empleado ? styles.celdaAsignada : ''} ${esCeldaActiva ? styles.celdaActiva : ''}`}
                              style={empleado ? { backgroundColor: empleado.color + '20', borderColor: empleado.color } : {}}
                              onClick={() => setCeldaSeleccionada(esCeldaActiva ? null : { franjaId: franja.id, diaIdx })}
                            >
                              {empleado ? (
                                <div className={styles.asignacionChip} style={{ backgroundColor: empleado.color }}>
                                  {empleado.nombre.split(' ')[0]}
                                </div>
                              ) : (
                                <span className={styles.celdaVacia}>—</span>
                              )}

                              {esCeldaActiva && (
                                <div className={styles.dropdownAsignacion}>
                                  <div className={styles.dropdownHeader}>Asignar a:</div>
                                  {empleadosDisponibles(franja.id, diaIdx).length === 0 ? (
                                    <div className={styles.dropdownEmpty}>
                                      No hay empleados disponibles
                                    </div>
                                  ) : (
                                    <>
                                      {empleadosDisponibles(franja.id, diaIdx).map(emp => (
                                        <button
                                          key={emp.id}
                                          className={`${styles.dropdownItem} ${asig?.empleadoId === emp.id ? styles.dropdownItemActive : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            asignarEmpleado(franja.id, diaIdx, emp.id);
                                          }}
                                        >
                                          <div className={styles.dropdownColor} style={{ backgroundColor: emp.color }} />
                                          <span>{emp.nombre}</span>
                                          <span className={styles.dropdownHoras}>
                                            {horasPorEmpleado[emp.id] || 0}/{emp.horasMaxSemana}h
                                          </span>
                                        </button>
                                      ))}
                                    </>
                                  )}
                                  {asig?.empleadoId && (
                                    <button
                                      className={`${styles.dropdownItem} ${styles.dropdownItemRemove}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        asignarEmpleado(franja.id, diaIdx, null);
                                      }}
                                    >
                                      ✕ Quitar asignación
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Alertas */}
              {alertas.length > 0 && (
                <div className={styles.alertasPanel}>
                  <h4>⚠️ Alertas</h4>
                  <ul>
                    {alertas.map((alerta, idx) => (
                      <li key={idx}>{alerta}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Estadísticas (siempre visible) */}
      {empleados.length > 0 && (
        <div className={styles.estadisticasPanel}>
          <h3>📊 Estadísticas de la semana</h3>
          <div className={styles.estadisticasGrid}>
            {empleados.map(emp => {
              const horas = horasPorEmpleado[emp.id] || 0;
              const porcentaje = Math.min((horas / emp.horasMaxSemana) * 100, 100);
              const excedido = horas > emp.horasMaxSemana;

              return (
                <div key={emp.id} className={styles.estadisticaItem}>
                  <div className={styles.estadisticaHeader}>
                    <div className={styles.empleadoColor} style={{ backgroundColor: emp.color }} />
                    <span className={styles.estadisticaNombre}>{emp.nombre}</span>
                    <span className={`${styles.estadisticaHoras} ${excedido ? styles.horasExcedidas : ''}`}>
                      {horas}/{emp.horasMaxSemana}h {excedido && '⚠️'}
                    </span>
                  </div>
                  <div className={styles.barraProgreso}>
                    <div
                      className={`${styles.barraRelleno} ${excedido ? styles.barraExcedida : ''}`}
                      style={{ width: `${Math.min(porcentaje, 100)}%`, backgroundColor: emp.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.coberturaInfo}>
            <span>Cobertura de turnos:</span>
            <strong>{cobertura.cubiertos}/{cobertura.total}</strong>
            <span>({cobertura.total > 0 ? Math.round((cobertura.cubiertos / cobertura.total) * 100) : 0}%)</span>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este planificador es una herramienta de apoyo. Verifica siempre que los horarios
          cumplan con la legislación laboral vigente en tu país (horas máximas, descansos
          obligatorios, convenios colectivos, etc.).
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres saber más sobre gestión de turnos?"
        subtitle="Descubre buenas prácticas para planificar horarios de trabajo"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Consejos para una buena planificación de turnos</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>⏰ Descanso entre turnos</h4>
              <p>
                La legislación española establece un mínimo de 12 horas entre el fin de una
                jornada y el inicio de la siguiente. Planifica con margen suficiente.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📅 Distribución equitativa</h4>
              <p>
                Intenta repartir los turnos menos deseados (noches, fines de semana) de forma
                rotativa entre todos los empleados para mantener la motivación.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔄 Rotación predecible</h4>
              <p>
                Los horarios rotativos predecibles ayudan a los empleados a planificar su
                vida personal. Evita cambios de última hora siempre que sea posible.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>💬 Comunicación</h4>
              <p>
                Publica los horarios con al menos 2 semanas de antelación. Esto da tiempo
                a los empleados para organizarse y solicitar cambios si es necesario.
              </p>
            </div>
          </div>

          <h3>Normativa básica en España</h3>
          <ul className={styles.legalList}>
            <li>Jornada máxima: 40 horas semanales de media anual</li>
            <li>Descanso entre jornadas: mínimo 12 horas</li>
            <li>Descanso semanal: día y medio ininterrumpido</li>
            <li>Horas extraordinarias: máximo 80 al año</li>
            <li>Trabajo nocturno: entre las 22:00 y las 06:00</li>
          </ul>
          <p className={styles.legalNote}>
            * Esta información es orientativa. Consulta siempre el convenio colectivo
            aplicable y la legislación vigente.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-turnos')} />
      <Footer appName="planificador-turnos" />
    </div>
  );
}
