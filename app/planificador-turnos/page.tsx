'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './PlanificadorTurnos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
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

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="planificador-turnos-disclaimer"
      />

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

        {/* Sección 1: Tabla Comparativa de tipos de turno */}
        <section className={styles.guideSection}>
          <h2>Tipos de turno laboral en España: comparativa completa</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de turno</th>
                  <th>Horario</th>
                  <th>Plus económico típico</th>
                  <th>Sectores principales</th>
                  <th>Descanso recomendado</th>
                  <th>Regulación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Mañana</strong></td>
                  <td>06:00 – 14:00</td>
                  <td>Sin plus específico</td>
                  <td>Hostelería, manufactura, comercio</td>
                  <td>8 horas antes del siguiente turno</td>
                  <td>ET art. 34; convenio colectivo</td>
                </tr>
                <tr>
                  <td><strong>Tarde</strong></td>
                  <td>14:00 – 22:00</td>
                  <td>5–15 % s/salario base (convenio)</td>
                  <td>Comercio, atención al cliente, logística</td>
                  <td>12 horas de descanso mínimo</td>
                  <td>ET art. 34; convenio colectivo</td>
                </tr>
                <tr>
                  <td><strong>Noche</strong></td>
                  <td>22:00 – 06:00</td>
                  <td>25–40 % s/salario base (ET mínimo)</td>
                  <td>Sanidad, seguridad, transporte, industria</td>
                  <td>12 horas + límite 8h/día nocturnas</td>
                  <td>ET art. 36.2; máx. 8h/día promedio</td>
                </tr>
                <tr>
                  <td><strong>Rotativo</strong></td>
                  <td>Ciclos semana a semana</td>
                  <td>Plus rotatividad (convenio variable)</td>
                  <td>Sanidad, fábricas, servicios 24h</td>
                  <td>12h; adaptación biológica en rotación</td>
                  <td>ET art. 36.3; prioridad a trabajadores nocturnos voluntarios</td>
                </tr>
                <tr>
                  <td><strong>Partido</strong></td>
                  <td>Mañana + tarde (ej. 9-13 / 16-20)</td>
                  <td>Sin plus legal; posible en convenio</td>
                  <td>Comercio, hostelería, servicios</td>
                  <td>Descanso mínimo 1h entre partes</td>
                  <td>ET art. 34; acuerdo empresa–trabajador</td>
                </tr>
                <tr>
                  <td><strong>Guardia 12h</strong></td>
                  <td>12 horas continuas (ej. 8-20)</td>
                  <td>Plus guardia o complemento específico</td>
                  <td>Sanidad, seguridad, emergencias</td>
                  <td>12h de descanso obligatorio post-guardia</td>
                  <td>ET art. 34; estatuto sanitario para personal sanitario</td>
                </tr>
                <tr>
                  <td><strong>Guardia 24h</strong></td>
                  <td>24 horas continuas</td>
                  <td>Plus guardia; días libres compensatorios</td>
                  <td>Sanidad rural, policía, bomberos</td>
                  <td>24h descanso post-guardia (mínimo legal)</td>
                  <td>ET art. 34 + convenio específico de sector</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de uso — 4 perfiles */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa el planificador de turnos? Casos reales</h2>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏥</span>
                <h3>Enfermero/a con turnos rotativos de 12h</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> María trabaja en urgencias con ciclos de 3 turnos de día
                (7-19h) y 3 turnos de noche (19-7h), seguidos de 6 días libres. Necesita visualizar
                semanas completas y verificar que no supera las 8h nocturnas de promedio.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo ayuda la herramienta:</strong> Configura dos franjas (día 07:00-19:00 y
                noche 19:00-07:00), añade a todos los enfermeros del servicio y usa la generación
                automática para distribuir turnos equilibradamente. Las alertas avisarán si alguien
                supera su máximo semanal.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏭</span>
                <h3>Trabajador de fábrica con turno fijo de noche</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Carlos trabaja siempre de 22:00 a 06:00 en una planta
                de producción. Su empresa necesita planificar las coberturas de los 15 operarios
                del turno nocturno para evitar huecos en la cadena de montaje.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo ayuda la herramienta:</strong> Crea una única franja nocturna (22:00-06:00),
                añade a todos los operarios y marca las disponibilidades. El planificador genera el
                cuadrante respetando el límite de 40h semanales y muestra las coberturas por día.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛍️</span>
                <h3>Empleado de comercio con turno partido</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Ana trabaja en una tienda con jornada partida:
                10:00-14:00 y 17:00-21:00. Algunos días tiene solo un tramo. Necesita que el
                responsable vea de un vistazo qué tramos están cubiertos cada día de la semana.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo ayuda la herramienta:</strong> Define dos franjas (Mañana 10-14 y
                Tarde 17-21). Configura disponibilidad diferente por franja para cada empleado.
                El cuadro semanal muestra cada tramo como celda independiente, facilitando
                la gestión visual del cuadrante.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📋</span>
                <h3>Responsable de RRHH con 20 personas</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Javier gestiona el cuadrante semanal de un call center
                con 20 agentes repartidos en 3 turnos (mañana, tarde, noche). Debe garantizar
                cobertura mínima de 6 personas por turno y respetar las preferencias individuales.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo ayuda la herramienta:</strong> Añade los 20 agentes con sus horas
                máximas y disponibilidades. Usa "Generar automático" como punto de partida y ajusta
                manualmente. La barra de progreso de cada empleado y las alertas de exceso de horas
                evitan errores legales antes de publicar el cuadrante.
              </p>
            </div>

          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre turnos laborales en España</h2>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h3>¿Cuánto es el plus de nocturnidad en España?</h3>
              <p>
                No existe un porcentaje legalmente fijado a nivel estatal. El Estatuto de los
                Trabajadores (art. 36.2) reconoce el derecho a una retribución específica por
                trabajo nocturno, pero remite a la negociación colectiva. La mayoría de convenios
                establecen un plus de entre el 25 % y el 40 % del salario base por hora nocturna
                trabajada (22:00 a 06:00). Algunos convenios optan por días libres compensatorios
                en lugar de plus económico.
              </p>
              <p className={styles.faqTip}>
                Consulta tu convenio colectivo sectorial o de empresa para conocer el porcentaje exacto aplicable.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuántas horas de descanso son obligatorias entre turnos?</h3>
              <p>
                El ET (art. 34.3) establece un descanso mínimo de <strong>12 horas</strong> entre
                el final de una jornada y el inicio de la siguiente. Este es el mínimo legal
                inderogable; algunos convenios amplían este período a 12–16 horas, especialmente
                en sanidad y trabajos de especial penosidad. Reducir este descanso sin amparo
                convencional constituye una infracción grave (LISOS art. 7).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué derechos tiene un trabajador con turno rotativo?</h3>
              <p>
                El ET (art. 36.3) reconoce a los trabajadores a turnos el derecho a: conocer el
                calendario de turnos con antelación suficiente, solicitar el cambio a turno fijo
                cuando exista vacante y el trabajador lleve más de 18 meses en turno nocturno,
                recibir la misma protección en materia de prevención de riesgos que el resto de
                la plantilla, y a que se tenga en cuenta su situación en la distribución de
                vacaciones. Los menores de 18 años tienen prohibido el trabajo nocturno.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo afecta el turno de noche a la salud?</h3>
              <p>
                El trabajo nocturno continuado puede provocar trastornos del sueño (insomnio,
                somnolencia diurna), alteraciones metabólicas y mayor riesgo cardiovascular a
                largo plazo. La OMS clasifica el trabajo nocturno por turnos como probable
                carcinógeno (Grupo 2A). Para mitigar el impacto: mantener rotaciones en sentido
                horario (mañana → tarde → noche), garantizar al menos 48h de recuperación tras
                una serie de noches, y evitar más de 3–4 noches consecutivas cuando sea posible.
              </p>
              <p className={styles.faqTip}>
                El servicio de prevención de la empresa debe evaluar los riesgos específicos del trabajo nocturno (RD 39/1997).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Puede el empleador cambiar el turno unilateralmente?</h3>
              <p>
                No sin limitaciones. Un cambio de turno que altere las condiciones sustanciales
                del contrato (ej. pasar de turno fijo a rotativo, o de diurno a nocturno) requiere
                seguir el procedimiento de modificación sustancial de condiciones de trabajo del
                ET (art. 41): preaviso de 15 días, posibilidad de impugnación judicial y, si el
                trabajador no acepta, derecho a rescisión indemnizada (20 días/año, máx. 9 meses).
                Los pequeños ajustes horarios dentro del mismo turno sí pueden realizarse con
                el poder de dirección ordinario.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué es el trabajo a turnos según el Estatuto de los Trabajadores?</h3>
              <p>
                El ET (art. 36.3) define el trabajo a turnos como "toda forma de organización
                del trabajo en equipo según la cual los trabajadores ocupan sucesivamente los
                mismos puestos de trabajo, según un cierto ritmo, continuo o discontinuo,
                implicando para el trabajador la necesidad de prestar sus servicios en horas
                diferentes en un período determinado de días o de semanas". Requiere que distintas
                personas cubran el mismo puesto en horarios diferentes, no se aplica a cambios
                de horario individuales esporádicos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuántos festivos se compensan en turno de noche?</h3>
              <p>
                Los festivos trabajados en turno de noche generan dos obligaciones independientes:
                la compensación por festivo trabajado (descanso compensatorio o plus económico
                equivalente según convenio, sobre la base del ET art. 37) y el plus de nocturnidad
                (ET art. 36.2). Ambos conceptos son acumulables salvo que el convenio los haya
                unificado en un único complemento. La mayoría de convenios establecen un recargo
                del 50–100 % sobre la hora ordinaria para festivos nocturnos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo calcular el plus de festivo trabajado?</h3>
              <p>
                La fórmula habitual es: <strong>valor hora ordinaria × (1 + % plus festivo)</strong>.
                Si el salario bruto mensual es 1.800 € y la jornada es 40h/semana (173,33h/mes),
                el valor hora ordinaria es 1.800 / 173,33 = 10,38 €/h. Con un convenio que
                establece el 75 % de plus: 10,38 × 1,75 = <strong>18,17 €/h</strong> en festivo.
                Si además es nocturna, se suma el plus de nocturnidad del convenio sobre el
                valor de la hora ordinaria (no sobre la hora festiva ya incrementada, salvo que
                el convenio lo indique expresamente).
              </p>
              <p className={styles.faqTip}>
                Verifica siempre si tu convenio usa base salarial fija o salario real para el cálculo.
              </p>
            </div>

          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo planificar un cuadrante de turnos justo y legal: guía paso a paso</h2>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Define la estructura de turnos necesaria</h3>
                <p>
                  Antes de asignar personas, determina cuántos turnos necesitas cubrir cada día
                  (mañana, tarde, noche…), las horas de cada franja y el nivel mínimo de cobertura
                  por turno. Este análisis de necesidades operativas es la base de cualquier
                  cuadrante legal y eficiente.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Recoge las disponibilidades y restricciones del equipo</h3>
                <p>
                  Antes de generar el cuadrante, obtén por escrito las disponibilidades de cada
                  trabajador, las restricciones médicas documentadas y las peticiones de libre
                  preestablecidas (vacaciones, asuntos propios). Guarda estos registros: son clave
                  en caso de conflicto laboral.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Configura el planificador con todos los datos</h3>
                <p>
                  Añade a cada empleado con su jornada máxima semanal (según contrato y convenio)
                  y marca su disponibilidad por franja y día. Define todas las franjas con horas
                  de inicio y fin exactas para que el cálculo de horas sea automático y preciso.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Genera el cuadrante inicial y revisa las alertas</h3>
                <p>
                  Usa la función de generación automática como punto de partida. El sistema
                  asigna priorizando a quien tiene menos horas acumuladas. Revisa las alertas
                  de exceso de horas y ajusta manualmente los casos donde la asignación
                  automática no sea óptima.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Verifica el cumplimiento legal antes de publicar</h3>
                <p>
                  Comprueba que ningún trabajador supera las 40h semanales de media, que los
                  descansos entre jornadas son de al menos 12 horas (ET art. 34.3), que el
                  descanso semanal es de día y medio ininterrumpido y que la distribución de
                  festivos es equitativa entre la plantilla según el convenio aplicable.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Publica el cuadrante con al menos 5 días de antelación</h3>
                <p>
                  La comunicación anticipada es clave para la conciliación. Publica el horario
                  de la semana siguiente antes del miércoles de la semana anterior como mínimo.
                  Muchos convenios exigen plazos mayores (1–2 semanas). Usa un canal oficial y
                  guarda constancia del envío.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Registra la jornada y archiva los cuadrantes</h3>
                <p>
                  Desde mayo de 2019 el registro diario de jornada es obligatorio para todas
                  las empresas (ET art. 34.9, reforma RDL 8/2019). Conserva los registros
                  durante 4 años. El incumplimiento puede suponer multas de hasta 6.250 €
                  por infracción grave (LISOS art. 7.5).
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para gestionar cuadrantes de turnos</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <h3>Publica con 5+ días de antelación</h3>
              <p>
                Publicar el cuadrante con al menos 5 días de antelación permite a los empleados
                organizar su vida personal y reduce las peticiones de cambio de última hora.
                Los convenios de hostelería, sanidad y comercio suelen exigir entre 7 y 15 días.
                Establece una fecha fija semanal para la publicación (ej. cada miércoles para
                la semana siguiente).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏱️</span>
              <h3>Respeta siempre las 12h de descanso mínimo</h3>
              <p>
                El descanso entre jornadas (ET art. 34.3) es un derecho inderogable. No asignes
                un turno de mañana (ej. 07:00) inmediatamente después de un turno de noche que
                finalice a las 23:00 del día anterior. Usa las alertas del planificador como
                segunda verificación, pero haz siempre la comprobación visual antes de publicar.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎉</span>
              <h3>Distribuye festivos de forma equitativa</h3>
              <p>
                Lleva un registro acumulado anual de festivos trabajados por cada empleado y
                úsalo como criterio principal de asignación. Una diferencia de más de 2 festivos
                entre compañeros con el mismo contrato puede generar conflictos o reclamaciones.
                El convenio suele marcar el procedimiento de adjudicación de festivos preferentes
                (Navidades, Semana Santa).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎨</span>
              <h3>Usa colores por tipo de turno</h3>
              <p>
                Asigna colores distintivos a cada franja horaria: verde para mañana, naranja para
                tarde, azul oscuro para noche y rojo para guardia. Esto permite detectar de un
                vistazo desequilibrios en la distribución o semanas con excesiva carga nocturna
                para un mismo trabajador. El planificador asigna automáticamente colores por empleado.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h3>Planifica rotaciones en sentido horario</h3>
              <p>
                Desde la perspectiva de la salud laboral, el orden mañana → tarde → noche es
                menos agresivo para el organismo que el sentido antihorario (noche → tarde → mañana),
                porque respeta mejor el ciclo circadiano. Aplica este principio siempre que la
                operativa del negocio lo permita y documéntalo en el protocolo de prevención de riesgos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h3>Revisa las estadísticas semanales antes de cerrar</h3>
              <p>
                Antes de dar por cerrado el cuadrante, verifica que la cobertura de turnos es
                del 100 % (sin celdas vacías en turnos críticos), que ningún empleado supera
                su máximo semanal y que la distribución de horas entre compañeros con la misma
                categoría no difiere más de un 10–15 %. Pequeños desequilibrios acumulados
                semana a semana generan agravios comparativos.
              </p>
            </div>

          </div>
        </section>

        {/* Sección 6: Warning Box — errores legales y de gestión */}
        <section className={styles.guideSection}>
          <h2>Errores frecuentes al planificar turnos (y cómo evitarlos)</h2>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores legales y de gestión que debes conocer</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No respetar las 11–12h de descanso entre jornadas.</strong> El ET fija
                12h de descanso mínimo entre jornadas (art. 34.3). Infringirlo es una falta grave
                sancionable con multas de 626 a 6.250 € por trabajador afectado (LISOS art. 7).
                Revisa siempre el cruce de turno de noche con el turno de mañana del día siguiente.
              </li>
              <li>
                <strong>Superar las 9h ordinarias sin amparo en convenio.</strong> El ET (art. 34.3)
                limita la jornada ordinaria a 9 horas diarias salvo que el convenio colectivo o
                acuerdo de empresa establezca otra distribución. Programar turnos de 10h sin
                cobertura convencional expone a la empresa a reclamaciones por horas extraordinarias.
              </li>
              <li>
                <strong>Olvidar compensar los festivos trabajados.</strong> Todo festivo trabajado
                genera derecho a descanso compensatorio o plus económico (ET art. 37.1–37.2). No
                registrar ni compensar los festivos es una infracción que puede originar reclamaciones
                de cantidad y sanciones administrativas en inspección de trabajo.
              </li>
              <li>
                <strong>No llevar registro de jornada — obligatorio desde 2019.</strong> El RDL 8/2019
                (en vigor desde el 12 de mayo de 2019) obliga a todas las empresas a registrar
                diariamente el inicio y fin de la jornada de cada trabajador. La ausencia de
                registro es infracción grave. Conserva los registros 4 años y ponlos a disposición
                de trabajadores, representantes sindicales e Inspección de Trabajo cuando lo soliciten.
              </li>
              <li>
                <strong>Modificar el turno sin seguir el procedimiento del ET art. 41.</strong>
                Cambiar las condiciones sustanciales de trabajo (pasar de turno fijo a rotativo,
                de diurno a nocturno) sin respetar el procedimiento de modificación sustancial —
                preaviso, consultas, derecho de impugnación — puede declararse nulo por los
                tribunales laborales y obligar a reintegrar al trabajador en sus condiciones originales.
              </li>
              <li>
                <strong>Publicar el cuadrante con menos de 48h de antelación.</strong> Aunque la
                ley no fija plazo general, publicar el horario con menos de 2 días de antelación
                vulnera el principio de buena fe contractual y puede considerarse incumplimiento
                empresarial. Además, la mayoría de convenios sectoriales establecen plazos de
                entre 5 y 15 días; incumplirlos puede ser sancionado por la representación legal
                de los trabajadores o dar lugar a reclamaciones individuales.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-turnos')} />
      <ShareCard appName="planificador-turnos" />
      <Footer appName="planificador-turnos" />
    </div>
  );
}
