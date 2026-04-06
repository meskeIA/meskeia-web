'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './GeneradorHorarios.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============ TIPOS ============

interface Asignatura {
  id: string;
  nombre: string;
  horasSemana: number;
  prioridad: number; // 1-5
  color: string;
}

interface SesionEstudio {
  asignaturaId: string;
  asignaturaNombre: string;
  dia: number;
  franja: number;
  prioridad: number;
  color: string;
}

interface Entrega {
  id: string;
  titulo: string;
  asignaturaId: string;
  asignaturaNombre: string;
  tipo: 'examen' | 'trabajo' | 'practica' | 'otro';
  fechaEntrega: string; // ISO date
  descripcion: string;
  completada: boolean;
  prioridad: number; // 1-3
}

type DisponibilidadMatrix = boolean[][];
type TabType = 'horario' | 'entregas';

// ============ CONSTANTES ============

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_COMPLETOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const FRANJAS = [
  { nombre: 'Mañana', inicio: '09:00', fin: '14:00' },
  { nombre: 'Tarde', inicio: '15:00', fin: '20:00' },
  { nombre: 'Noche', inicio: '21:00', fin: '23:00' },
];

const DURACIONES_SESION = [
  { valor: 25, nombre: '25 min (Pomodoro)' },
  { valor: 50, nombre: '50 min (Estándar)' },
  { valor: 90, nombre: '90 min (Intensiva)' },
];

const TIPOS_ENTREGA = [
  { valor: 'examen', nombre: '📝 Examen', emoji: '📝' },
  { valor: 'trabajo', nombre: '📄 Trabajo', emoji: '📄' },
  { valor: 'practica', nombre: '💻 Práctica', emoji: '💻' },
  { valor: 'otro', nombre: '📌 Otro', emoji: '📌' },
];

const COLORES_ASIGNATURA = [
  '#2E86AB', '#48A9A6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
];

const STORAGE_KEY = 'meskeia-horarios-estudio-v2';

// ============ UTILIDADES ============

const crearDisponibilidadInicial = (): DisponibilidadMatrix => {
  return FRANJAS.map((_, franjaIdx) =>
    DIAS.map((_, diaIdx) => diaIdx < 5 && franjaIdx < 2)
  );
};

const formatearFecha = (fecha: string): string => {
  const d = new Date(fecha);
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  };
  return d.toLocaleDateString('es-ES', opciones);
};

const diasHastaEntrega = (fecha: string): number => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const entrega = new Date(fecha);
  entrega.setHours(0, 0, 0, 0);
  return Math.ceil((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

const getUrgenciaClase = (dias: number): string => {
  if (dias < 0) return 'vencida';
  if (dias <= 2) return 'urgente';
  if (dias <= 7) return 'proxima';
  return 'normal';
};

// ============ COMPONENTE PRINCIPAL ============

export default function GeneradorHorariosPage() {
  // Estado de navegación
  const [activeTab, setActiveTab] = useState<TabType>('horario');

  // Estado de asignaturas
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([
    { id: '1', nombre: 'Matemáticas', horasSemana: 5, prioridad: 5, color: COLORES_ASIGNATURA[0] },
    { id: '2', nombre: 'Física', horasSemana: 4, prioridad: 4, color: COLORES_ASIGNATURA[1] },
    { id: '3', nombre: 'Inglés', horasSemana: 3, prioridad: 3, color: COLORES_ASIGNATURA[2] },
  ]);

  // Estado de horario
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadMatrix>(crearDisponibilidadInicial);
  const [duracionSesion, setDuracionSesion] = useState(50);
  const [horarioGenerado, setHorarioGenerado] = useState<SesionEstudio[]>([]);

  // Estado de entregas
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [mostrarFormEntrega, setMostrarFormEntrega] = useState(false);
  const [editandoEntrega, setEditandoEntrega] = useState<Entrega | null>(null);
  const [formEntrega, setFormEntrega] = useState({
    titulo: '',
    asignaturaId: '',
    tipo: 'trabajo' as Entrega['tipo'],
    fechaEntrega: '',
    descripcion: '',
    prioridad: 2,
  });

  // ============ PERSISTENCIA ============

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.asignaturas) setAsignaturas(data.asignaturas);
        if (data.disponibilidad) setDisponibilidad(data.disponibilidad);
        if (data.duracionSesion) setDuracionSesion(data.duracionSesion);
        if (data.horarioGenerado) setHorarioGenerado(data.horarioGenerado);
        if (data.entregas) setEntregas(data.entregas);
      } catch (e) {
        console.error('Error cargando datos:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      asignaturas,
      disponibilidad,
      duracionSesion,
      horarioGenerado,
      entregas,
    }));
  }, [asignaturas, disponibilidad, duracionSesion, horarioGenerado, entregas]);

  // ============ FUNCIONES ASIGNATURAS ============

  const agregarAsignatura = () => {
    const colorIndex = asignaturas.length % COLORES_ASIGNATURA.length;
    const nueva: Asignatura = {
      id: Date.now().toString(),
      nombre: `Asignatura ${asignaturas.length + 1}`,
      horasSemana: 3,
      prioridad: 3,
      color: COLORES_ASIGNATURA[colorIndex],
    };
    setAsignaturas([...asignaturas, nueva]);
  };

  const eliminarAsignatura = (id: string) => {
    if (asignaturas.length > 1) {
      setAsignaturas(asignaturas.filter(a => a.id !== id));
      // Limpiar entregas huérfanas
      setEntregas(entregas.filter(e => e.asignaturaId !== id));
    }
  };

  const actualizarAsignatura = (id: string, campo: keyof Asignatura, valor: string | number) => {
    setAsignaturas(asignaturas.map(a =>
      a.id === id ? { ...a, [campo]: valor } : a
    ));
  };

  // ============ FUNCIONES DISPONIBILIDAD ============

  const toggleDisponibilidad = (franjaIdx: number, diaIdx: number) => {
    const nueva = disponibilidad.map((franja, fIdx) =>
      franja.map((activo, dIdx) =>
        fIdx === franjaIdx && dIdx === diaIdx ? !activo : activo
      )
    );
    setDisponibilidad(nueva);
  };

  // ============ CÁLCULOS ============

  const slotsDisponibles = useMemo(() => {
    let total = 0;
    disponibilidad.forEach(franja => {
      franja.forEach(activo => { if (activo) total++; });
    });
    return total;
  }, [disponibilidad]);

  const horasTotales = useMemo(() => {
    return asignaturas.reduce((acc, a) => acc + a.horasSemana, 0);
  }, [asignaturas]);

  const entregasProximas = useMemo(() => {
    return entregas
      .filter(e => !e.completada)
      .sort((a, b) => new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime())
      .slice(0, 5);
  }, [entregas]);

  const alertasUrgentes = useMemo(() => {
    return entregas.filter(e => {
      if (e.completada) return false;
      const dias = diasHastaEntrega(e.fechaEntrega);
      return dias <= 3 && dias >= 0;
    }).length;
  }, [entregas]);

  // ============ GENERADOR DE HORARIO MEJORADO ============

  const generarHorario = useCallback(() => {
    // Crear lista de slots disponibles
    const slots: { dia: number; franja: number; usado: boolean }[] = [];
    disponibilidad.forEach((franja, franjaIdx) => {
      franja.forEach((activo, diaIdx) => {
        if (activo) {
          slots.push({ dia: diaIdx, franja: franjaIdx, usado: false });
        }
      });
    });

    if (slots.length === 0) {
      alert('Selecciona al menos un slot de disponibilidad');
      return;
    }

    // Calcular sesiones necesarias por asignatura
    const sesionesPorHora = 60 / duracionSesion;
    const asignaturasConSesiones = asignaturas.map(asig => ({
      ...asig,
      sesionesNecesarias: Math.ceil(asig.horasSemana * sesionesPorHora),
      sesionesAsignadas: 0,
    }));

    // Ordenar por prioridad (mayor primero)
    asignaturasConSesiones.sort((a, b) => b.prioridad - a.prioridad);

    const sesiones: SesionEstudio[] = [];

    // ALGORITMO MEJORADO: Distribución equilibrada por días
    // Paso 1: Calcular cuántas sesiones por día idealmente
    const diasConSlots = new Set(slots.map(s => s.dia)).size;

    // Paso 2: Asignar sesiones distribuyendo por días
    let ronda = 0;
    const maxRondas = 100; // Prevenir bucle infinito

    while (ronda < maxRondas) {
      let asignacionEnRonda = false;

      for (const asig of asignaturasConSesiones) {
        if (asig.sesionesAsignadas >= asig.sesionesNecesarias) continue;

        // Buscar el día con menos sesiones de esta asignatura
        const sesionesPorDia: Record<number, number> = {};
        DIAS.forEach((_, idx) => { sesionesPorDia[idx] = 0; });
        sesiones.filter(s => s.asignaturaId === asig.id).forEach(s => {
          sesionesPorDia[s.dia]++;
        });

        // Encontrar slot disponible en el día con menos sesiones
        const slotsLibres = slots.filter(s => !s.usado);
        if (slotsLibres.length === 0) break;

        // Ordenar slots por: día con menos sesiones de esta asignatura
        slotsLibres.sort((a, b) => {
          const countA = sesionesPorDia[a.dia];
          const countB = sesionesPorDia[b.dia];
          if (countA !== countB) return countA - countB;
          // Desempate: franja (mañana primero)
          return a.franja - b.franja;
        });

        const slotElegido = slotsLibres[0];
        slotElegido.usado = true;

        sesiones.push({
          asignaturaId: asig.id,
          asignaturaNombre: asig.nombre,
          dia: slotElegido.dia,
          franja: slotElegido.franja,
          prioridad: asig.prioridad,
          color: asig.color,
        });

        asig.sesionesAsignadas++;
        asignacionEnRonda = true;
      }

      if (!asignacionEnRonda) break;
      ronda++;
    }

    // Ordenar por día y franja para visualización
    sesiones.sort((a, b) => {
      if (a.dia !== b.dia) return a.dia - b.dia;
      return a.franja - b.franja;
    });

    setHorarioGenerado(sesiones);

    // Feedback al usuario
    const totalNecesarias = asignaturasConSesiones.reduce((acc, a) => acc + a.sesionesNecesarias, 0);
    if (sesiones.length < totalNecesarias) {
      alert(`Se generaron ${sesiones.length} de ${totalNecesarias} sesiones necesarias. Añade más slots de disponibilidad para cubrir todas las horas.`);
    }
  }, [asignaturas, disponibilidad, duracionSesion]);

  // ============ FUNCIONES ENTREGAS ============

  const guardarEntrega = () => {
    if (!formEntrega.titulo.trim() || !formEntrega.asignaturaId || !formEntrega.fechaEntrega) {
      alert('Completa los campos obligatorios: título, asignatura y fecha');
      return;
    }

    const asignatura = asignaturas.find(a => a.id === formEntrega.asignaturaId);

    if (editandoEntrega) {
      setEntregas(entregas.map(e =>
        e.id === editandoEntrega.id
          ? {
              ...e,
              titulo: formEntrega.titulo.trim(),
              asignaturaId: formEntrega.asignaturaId,
              asignaturaNombre: asignatura?.nombre || '',
              tipo: formEntrega.tipo,
              fechaEntrega: formEntrega.fechaEntrega,
              descripcion: formEntrega.descripcion.trim(),
              prioridad: formEntrega.prioridad,
            }
          : e
      ));
    } else {
      const nueva: Entrega = {
        id: Date.now().toString(),
        titulo: formEntrega.titulo.trim(),
        asignaturaId: formEntrega.asignaturaId,
        asignaturaNombre: asignatura?.nombre || '',
        tipo: formEntrega.tipo,
        fechaEntrega: formEntrega.fechaEntrega,
        descripcion: formEntrega.descripcion.trim(),
        completada: false,
        prioridad: formEntrega.prioridad,
      };
      setEntregas([...entregas, nueva]);
    }

    resetFormEntrega();
  };

  const resetFormEntrega = () => {
    setFormEntrega({
      titulo: '',
      asignaturaId: asignaturas[0]?.id || '',
      tipo: 'trabajo',
      fechaEntrega: '',
      descripcion: '',
      prioridad: 2,
    });
    setEditandoEntrega(null);
    setMostrarFormEntrega(false);
  };

  const editarEntrega = (entrega: Entrega) => {
    setFormEntrega({
      titulo: entrega.titulo,
      asignaturaId: entrega.asignaturaId,
      tipo: entrega.tipo,
      fechaEntrega: entrega.fechaEntrega,
      descripcion: entrega.descripcion,
      prioridad: entrega.prioridad,
    });
    setEditandoEntrega(entrega);
    setMostrarFormEntrega(true);
  };

  const eliminarEntrega = (id: string) => {
    if (confirm('¿Eliminar esta entrega?')) {
      setEntregas(entregas.filter(e => e.id !== id));
    }
  };

  const toggleCompletada = (id: string) => {
    setEntregas(entregas.map(e =>
      e.id === id ? { ...e, completada: !e.completada } : e
    ));
  };

  // ============ FUNCIONES AUXILIARES ============

  const getSesiones = (dia: number, franja: number): SesionEstudio[] => {
    return horarioGenerado.filter(s => s.dia === dia && s.franja === franja);
  };

  const getPrioridadClase = (prioridad: number): string => {
    if (prioridad >= 4) return 'alta';
    if (prioridad >= 2) return 'media';
    return 'baja';
  };

  const resumen = useMemo(() => {
    const sesionesTotales = horarioGenerado.length;
    const horasEstudio = (sesionesTotales * duracionSesion) / 60;
    const diasActivos = new Set(horarioGenerado.map(s => s.dia)).size;

    return {
      sesionesTotales,
      horasEstudio: horasEstudio.toFixed(1),
      diasActivos,
      promedioSesionesDia: diasActivos > 0 ? (sesionesTotales / diasActivos).toFixed(1) : '0',
    };
  }, [horarioGenerado, duracionSesion]);

  // ============ RENDER ============

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Horarios de Estudio</h1>
        <p className={styles.subtitle}>
          Planifica tus sesiones de estudio y organiza tus trabajos y exámenes
        </p>
      </header>

      <LegalNotice />

      {/* Alertas de entregas urgentes */}
      {alertasUrgentes > 0 && (
        <div className={styles.alertaBanner} onClick={() => setActiveTab('entregas')}>
          <span className={styles.alertaIcono}>⚠️</span>
          <span>Tienes <strong>{alertasUrgentes}</strong> {alertasUrgentes === 1 ? 'entrega' : 'entregas'} en los próximos 3 días</span>
          <span className={styles.alertaFlecha}>→</span>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'horario' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('horario')}
        >
          📅 Horario Semanal
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'entregas' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('entregas')}
        >
          📋 Trabajos y Exámenes
          {entregas.filter(e => !e.completada).length > 0 && (
            <span className={styles.tabBadge}>{entregas.filter(e => !e.completada).length}</span>
          )}
        </button>
      </div>

      {/* ========== TAB HORARIO ========== */}
      {activeTab === 'horario' && (
        <div className={styles.mainContent}>
          {/* Panel de configuración */}
          <div className={styles.configPanel}>
            {/* Asignaturas */}
            <h2 className={styles.sectionTitle}>
              <span>📚</span> Mis Asignaturas
            </h2>

            <div className={styles.asignaturasList}>
              {asignaturas.map(asig => (
                <div
                  key={asig.id}
                  className={styles.asignaturaItem}
                  style={{ borderLeftColor: asig.color }}
                >
                  <div className={styles.asignaturaHeader}>
                    <div className={styles.asignaturaInputs}>
                      <input
                        type="text"
                        className={styles.inputNombre}
                        value={asig.nombre}
                        onChange={e => actualizarAsignatura(asig.id, 'nombre', e.target.value)}
                        placeholder="Nombre"
                      />
                      <input
                        type="number"
                        className={styles.inputHoras}
                        value={asig.horasSemana}
                        onChange={e => actualizarAsignatura(asig.id, 'horasSemana', parseInt(e.target.value) || 0)}
                        min={1}
                        max={20}
                      />
                      <span className={styles.horasLabel}>h/sem</span>
                    </div>
                    <button
                      className={styles.btnEliminar}
                      onClick={() => eliminarAsignatura(asig.id)}
                      disabled={asignaturas.length <= 1}
                      title="Eliminar asignatura"
                    >
                      ×
                    </button>
                  </div>

                  <div className={styles.prioridadContainer}>
                    <span className={styles.prioridadLabel}>Prioridad:</span>
                    <div className={styles.estrellas}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span
                          key={n}
                          className={`${styles.estrella} ${n <= asig.prioridad ? styles.estrellaActiva : ''}`}
                          onClick={() => actualizarAsignatura(asig.id, 'prioridad', n)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.btnAnadir} onClick={agregarAsignatura}>
              <span>+</span> Añadir asignatura
            </button>

            {/* Disponibilidad */}
            <div className={styles.disponibilidadSection}>
              <h2 className={styles.sectionTitle}>
                <span>📅</span> Mi Disponibilidad
              </h2>
              <p className={styles.disponibilidadHint}>Haz clic en las celdas para activar/desactivar</p>

              <div className={styles.disponibilidadGrid}>
                <div className={styles.disponibilidadCorner}></div>
                {DIAS.map(dia => (
                  <div key={dia} className={styles.disponibilidadHeaderDia}>{dia}</div>
                ))}

                {FRANJAS.map((franja, franjaIdx) => (
                  <div key={franjaIdx} className={styles.disponibilidadRow}>
                    <div className={styles.disponibilidadFranjaLabel}>{franja.nombre}</div>
                    {DIAS.map((_, diaIdx) => (
                      <button
                        key={diaIdx}
                        className={`${styles.disponibilidadSlot} ${
                          disponibilidad[franjaIdx]?.[diaIdx] ? styles.slotActivo : ''
                        }`}
                        onClick={() => toggleDisponibilidad(franjaIdx, diaIdx)}
                        title={`${DIAS_COMPLETOS[diaIdx]} - ${franja.nombre}`}
                      >
                        {disponibilidad[franjaIdx]?.[diaIdx] && '✓'}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Preferencias */}
            <div className={styles.preferenciasSection}>
              <h2 className={styles.sectionTitle}>
                <span>⚙️</span> Preferencias
              </h2>

              <div className={styles.preferenciaItem}>
                <label className={styles.preferenciaLabel}>Duración de cada sesión</label>
                <select
                  className={styles.select}
                  value={duracionSesion}
                  onChange={e => setDuracionSesion(parseInt(e.target.value))}
                >
                  {DURACIONES_SESION.map(d => (
                    <option key={d.valor} value={d.valor}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className={styles.btnPrimary} onClick={generarHorario}>
              <span>⚡</span> Generar Horario
            </button>

            {/* Resumen rápido */}
            <div className={styles.resumenRapido}>
              <div className={styles.resumenItem}>
                <span className={styles.resumenValorPeq}>{asignaturas.length}</span>
                <span className={styles.resumenLabelPeq}>asignaturas</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenValorPeq}>{horasTotales}h</span>
                <span className={styles.resumenLabelPeq}>semanales</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenValorPeq}>{slotsDisponibles}</span>
                <span className={styles.resumenLabelPeq}>slots</span>
              </div>
            </div>
          </div>

          {/* Panel del calendario */}
          <div className={styles.calendarioPanel}>
            <div className={styles.calendarioHeader}>
              <h2 className={styles.calendarioTitulo}>
                {horarioGenerado.length > 0 ? '📆 Tu Horario Semanal' : '📆 Vista Previa'}
              </h2>
            </div>

            {/* Leyenda */}
            <div className={styles.leyenda}>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.colorAlta}`}></div>
                <span>Alta prioridad</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.colorMedia}`}></div>
                <span>Media</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.colorBaja}`}></div>
                <span>Baja</span>
              </div>
            </div>

            {horarioGenerado.length > 0 ? (
              <>
                {/* Calendario Grid Desktop */}
                <div className={styles.calendarioGrid}>
                  {/* Header */}
                  <div className={styles.calendarioCorner}></div>
                  {DIAS.map(dia => (
                    <div key={dia} className={styles.calendarioHeaderCelda}>{dia}</div>
                  ))}

                  {/* Filas */}
                  {FRANJAS.map((franja, franjaIdx) => (
                    <div key={franjaIdx} className={styles.calendarioFila}>
                      <div className={styles.calendarioHoraCelda}>
                        <span className={styles.franjaHora}>{franja.inicio}</span>
                        <span className={styles.franjaNombre}>{franja.nombre}</span>
                      </div>
                      {DIAS.map((_, diaIdx) => (
                        <div key={diaIdx} className={styles.calendarioCelda}>
                          {getSesiones(diaIdx, franjaIdx).map((sesion, idx) => (
                            <div
                              key={idx}
                              className={`${styles.sesionEstudio} ${styles[getPrioridadClase(sesion.prioridad)]}`}
                              style={{ backgroundColor: sesion.color }}
                              title={`${sesion.asignaturaNombre} - ${duracionSesion} min`}
                            >
                              {sesion.asignaturaNombre}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Vista móvil */}
                <div className={styles.calendarioMobile}>
                  {DIAS_COMPLETOS.map((dia, diaIdx) => {
                    const sesionesDia = horarioGenerado.filter(s => s.dia === diaIdx);
                    if (sesionesDia.length === 0) return null;

                    return (
                      <div key={dia} className={styles.diaCard}>
                        <div className={styles.diaCardTitulo}>{dia}</div>
                        <div className={styles.diaCardSesiones}>
                          {sesionesDia.map((sesion, idx) => (
                            <div
                              key={idx}
                              className={styles.sesionMobile}
                              style={{ borderLeftColor: sesion.color }}
                            >
                              <span className={styles.sesionMobileNombre}>{sesion.asignaturaNombre}</span>
                              <span className={styles.sesionMobileHora}>{FRANJAS[sesion.franja].nombre}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumen */}
                <div className={styles.resumenSection}>
                  <h3 className={styles.sectionTitle}>
                    <span>📊</span> Resumen del Plan
                  </h3>
                  <div className={styles.resumenGrid}>
                    <div className={styles.resumenCard}>
                      <div className={styles.resumenValor}>{resumen.sesionesTotales}</div>
                      <div className={styles.resumenLabel}>Sesiones/semana</div>
                    </div>
                    <div className={styles.resumenCard}>
                      <div className={styles.resumenValor}>{resumen.horasEstudio}h</div>
                      <div className={styles.resumenLabel}>Horas de estudio</div>
                    </div>
                    <div className={styles.resumenCard}>
                      <div className={styles.resumenValor}>{resumen.diasActivos}</div>
                      <div className={styles.resumenLabel}>Días activos</div>
                    </div>
                    <div className={styles.resumenCard}>
                      <div className={styles.resumenValor}>{resumen.promedioSesionesDia}</div>
                      <div className={styles.resumenLabel}>Sesiones/día</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📆</div>
                <p className={styles.emptyTitle}>No hay horario generado</p>
                <p className={styles.emptyText}>
                  Configura tus asignaturas y disponibilidad,<br />
                  luego pulsa &quot;Generar Horario&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== TAB ENTREGAS ========== */}
      {activeTab === 'entregas' && (
        <div className={styles.entregasContent}>
          <div className={styles.entregasHeader}>
            <h2 className={styles.sectionTitle}>
              <span>📋</span> Trabajos y Exámenes
            </h2>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                resetFormEntrega();
                setMostrarFormEntrega(true);
              }}
              style={{ width: 'auto', marginTop: 0 }}
            >
              + Nueva entrega
            </button>
          </div>

          {/* Formulario de entrega */}
          {mostrarFormEntrega && (
            <div className={styles.formEntrega}>
              <h3>{editandoEntrega ? 'Editar entrega' : 'Nueva entrega'}</h3>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Título *</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formEntrega.titulo}
                    onChange={e => setFormEntrega({ ...formEntrega, titulo: e.target.value })}
                    placeholder="Ej: Examen parcial de Matemáticas"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Asignatura *</label>
                  <select
                    className={styles.select}
                    value={formEntrega.asignaturaId}
                    onChange={e => setFormEntrega({ ...formEntrega, asignaturaId: e.target.value })}
                  >
                    <option value="">Selecciona...</option>
                    {asignaturas.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tipo</label>
                  <select
                    className={styles.select}
                    value={formEntrega.tipo}
                    onChange={e => setFormEntrega({ ...formEntrega, tipo: e.target.value as Entrega['tipo'] })}
                  >
                    {TIPOS_ENTREGA.map(t => (
                      <option key={t.valor} value={t.valor}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Fecha de entrega *</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={formEntrega.fechaEntrega}
                    onChange={e => setFormEntrega({ ...formEntrega, fechaEntrega: e.target.value })}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label>Descripción (opcional)</label>
                  <textarea
                    className={styles.textarea}
                    value={formEntrega.descripcion}
                    onChange={e => setFormEntrega({ ...formEntrega, descripcion: e.target.value })}
                    placeholder="Notas adicionales..."
                    rows={2}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Importancia</label>
                  <div className={styles.importanciaButtons}>
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.importanciaBtn} ${formEntrega.prioridad === n ? styles.importanciaBtnActive : ''}`}
                        onClick={() => setFormEntrega({ ...formEntrega, prioridad: n })}
                      >
                        {n === 1 ? '🟢 Baja' : n === 2 ? '🟡 Media' : '🔴 Alta'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={resetFormEntrega}>
                  Cancelar
                </button>
                <button className={styles.btnPrimary} onClick={guardarEntrega} style={{ width: 'auto', marginTop: 0 }}>
                  {editandoEntrega ? 'Guardar cambios' : 'Añadir entrega'}
                </button>
              </div>
            </div>
          )}

          {/* Próximas entregas */}
          {entregasProximas.length > 0 && (
            <div className={styles.proximasSection}>
              <h3 className={styles.subsectionTitle}>⏰ Próximas entregas</h3>
              <div className={styles.entregasList}>
                {entregasProximas.map(entrega => {
                  const dias = diasHastaEntrega(entrega.fechaEntrega);
                  const urgencia = getUrgenciaClase(dias);
                  const tipoInfo = TIPOS_ENTREGA.find(t => t.valor === entrega.tipo);

                  return (
                    <div key={entrega.id} className={`${styles.entregaCard} ${styles[urgencia]}`}>
                      <div className={styles.entregaCheck}>
                        <input
                          type="checkbox"
                          checked={entrega.completada}
                          onChange={() => toggleCompletada(entrega.id)}
                          className={styles.checkbox}
                        />
                      </div>
                      <div className={styles.entregaInfo}>
                        <div className={styles.entregaTitulo}>
                          <span className={styles.entregaTipo}>{tipoInfo?.emoji}</span>
                          {entrega.titulo}
                        </div>
                        <div className={styles.entregaMeta}>
                          <span className={styles.entregaAsignatura}>{entrega.asignaturaNombre}</span>
                          <span className={styles.entregaFecha}>
                            {formatearFecha(entrega.fechaEntrega)}
                            {dias === 0 && <span className={styles.badgeHoy}>HOY</span>}
                            {dias === 1 && <span className={styles.badgeManana}>MAÑANA</span>}
                            {dias > 1 && dias <= 7 && <span className={styles.badgeDias}>{dias} días</span>}
                          </span>
                        </div>
                        {entrega.descripcion && (
                          <div className={styles.entregaDescripcion}>{entrega.descripcion}</div>
                        )}
                      </div>
                      <div className={styles.entregaActions}>
                        <button
                          className={styles.btnIconSmall}
                          onClick={() => editarEntrega(entrega)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.btnIconSmall}
                          onClick={() => eliminarEntrega(entrega.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Todas las entregas */}
          <div className={styles.todasSection}>
            <h3 className={styles.subsectionTitle}>📋 Todas las entregas</h3>

            {entregas.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <p className={styles.emptyTitle}>No hay entregas registradas</p>
                <p className={styles.emptyText}>
                  Añade tus trabajos y exámenes para no olvidar ninguna fecha importante
                </p>
              </div>
            ) : (
              <div className={styles.entregasTabla}>
                {/* Pendientes */}
                {entregas.filter(e => !e.completada).length > 0 && (
                  <div className={styles.entregasGrupo}>
                    <div className={styles.grupoTitulo}>Pendientes ({entregas.filter(e => !e.completada).length})</div>
                    {entregas
                      .filter(e => !e.completada)
                      .sort((a, b) => new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime())
                      .map(entrega => {
                        const dias = diasHastaEntrega(entrega.fechaEntrega);
                        const urgencia = getUrgenciaClase(dias);
                        const tipoInfo = TIPOS_ENTREGA.find(t => t.valor === entrega.tipo);

                        return (
                          <div key={entrega.id} className={`${styles.entregaRow} ${styles[urgencia]}`}>
                            <input
                              type="checkbox"
                              checked={entrega.completada}
                              onChange={() => toggleCompletada(entrega.id)}
                              className={styles.checkbox}
                            />
                            <span className={styles.rowTipo}>{tipoInfo?.emoji}</span>
                            <span className={styles.rowTitulo}>{entrega.titulo}</span>
                            <span className={styles.rowAsignatura}>{entrega.asignaturaNombre}</span>
                            <span className={styles.rowFecha}>{formatearFecha(entrega.fechaEntrega)}</span>
                            <div className={styles.rowActions}>
                              <button onClick={() => editarEntrega(entrega)}>✏️</button>
                              <button onClick={() => eliminarEntrega(entrega.id)}>🗑️</button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Completadas */}
                {entregas.filter(e => e.completada).length > 0 && (
                  <div className={styles.entregasGrupo}>
                    <div className={styles.grupoTitulo}>Completadas ({entregas.filter(e => e.completada).length})</div>
                    {entregas
                      .filter(e => e.completada)
                      .map(entrega => {
                        const tipoInfo = TIPOS_ENTREGA.find(t => t.valor === entrega.tipo);

                        return (
                          <div key={entrega.id} className={`${styles.entregaRow} ${styles.completada}`}>
                            <input
                              type="checkbox"
                              checked={entrega.completada}
                              onChange={() => toggleCompletada(entrega.id)}
                              className={styles.checkbox}
                            />
                            <span className={styles.rowTipo}>{tipoInfo?.emoji}</span>
                            <span className={styles.rowTitulo}>{entrega.titulo}</span>
                            <span className={styles.rowAsignatura}>{entrega.asignaturaNombre}</span>
                            <span className={styles.rowFecha}>{formatearFecha(entrega.fechaEntrega)}</span>
                            <div className={styles.rowActions}>
                              <button onClick={() => eliminarEntrega(entrega.id)}>🗑️</button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres optimizar tu tiempo de estudio?"
        subtitle="Aprende técnicas de planificación y productividad académica"
      >
        <section className={styles.guideSection}>
          <h2>Técnicas de Estudio Efectivas</h2>
          <p className={styles.introParagraph}>
            Un buen horario de estudio no solo organiza tu tiempo, sino que también
            aprovecha los principios científicos del aprendizaje para maximizar
            tu rendimiento académico.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🍅 Técnica Pomodoro</h4>
              <p>
                Estudia en bloques de 25 minutos con descansos de 5 minutos.
                Cada 4 pomodoros, toma un descanso más largo de 15-30 minutos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Prioriza por urgencia</h4>
              <p>
                Usa la sección de entregas para identificar qué es más urgente.
                Dedica más tiempo a las asignaturas con exámenes próximos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔄 Intercala materias</h4>
              <p>
                Alterna entre diferentes asignaturas para mejorar la retención
                y evitar la fatiga mental de una sola materia.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📅 Planifica con antelación</h4>
              <p>
                Registra todos tus exámenes y trabajos en cuanto los conozcas.
                Así podrás ajustar tu horario de estudio según las fechas.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla Comparativa de Perfiles */}
        <section className={styles.guideSection}>
          <h2>Perfiles de Estudiante: Horas y Estrategias</h2>
          <p className={styles.introParagraph}>
            Cada tipo de estudiante tiene necesidades distintas. Identifica tu perfil
            y aplica las recomendaciones más adecuadas a tu situación.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Horas diarias</th>
                  <th>Distribución sesiones</th>
                  <th>Descansos</th>
                  <th>Técnica más efectiva</th>
                  <th>Riesgo principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Opositor a tiempo completo</strong></td>
                  <td>8–10 h</td>
                  <td>4–5 bloques de 90 min</td>
                  <td>20 min cada bloque + 1 h a mediodía</td>
                  <td>Bloques intensivos + repaso activo</td>
                  <td>Burnout y abandono por exceso</td>
                </tr>
                <tr>
                  <td><strong>Universitario con trabajo</strong></td>
                  <td>3–5 h</td>
                  <td>2–3 bloques de 60–90 min</td>
                  <td>15 min entre bloques</td>
                  <td>Pomodoro para fragmentar tiempo</td>
                  <td>Acumulación de materia sin repasar</td>
                </tr>
                <tr>
                  <td><strong>Estudiante de bachillerato</strong></td>
                  <td>4–6 h</td>
                  <td>3–4 bloques de 50 min</td>
                  <td>10–15 min entre bloques</td>
                  <td>Intercalado de materias distintas</td>
                  <td>Dedicar todo el tiempo a una sola asignatura</td>
                </tr>
                <tr>
                  <td><strong>Preparador de idiomas</strong></td>
                  <td>2–3 h</td>
                  <td>2 bloques de 60 min</td>
                  <td>15 min de descanso activo</td>
                  <td>Práctica espaciada diaria</td>
                  <td>Estudiar solo cuando "hay ganas"</td>
                </tr>
                <tr>
                  <td><strong>Estudiante de FP</strong></td>
                  <td>3–4 h</td>
                  <td>2–3 bloques de 60 min</td>
                  <td>15 min entre bloques</td>
                  <td>Práctica activa + proyectos</td>
                  <td>Dejar prácticas para la última semana</td>
                </tr>
                <tr>
                  <td><strong>Autodidacta</strong></td>
                  <td>1–3 h</td>
                  <td>1–2 bloques de 45–60 min</td>
                  <td>10 min entre bloques</td>
                  <td>Objetivos semanales concretos</td>
                  <td>Falta de estructura y compromiso externo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso Reales</h2>
          <p className={styles.introParagraph}>
            Situaciones concretas en las que esta herramienta puede ayudarte a organizar
            tu estudio de forma eficiente.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏛️</span>
                <h4>Opositor con 8 meses para el examen</h4>
              </div>
              <p className={styles.escenarioExample}>
                Necesitas organizar un temario extenso de forma progresiva, asegurándote
                de cubrir todos los bloques temáticos antes de la fecha del examen.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Consejo:</strong> Divide el temario en bloques mensuales y usa la sección
                de entregas para marcar fechas de repaso parcial cada 3–4 semanas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📚</span>
                <h4>Universitario con exámenes en 3 semanas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Tienes varias asignaturas con fechas distintas y necesitas distribuir
                el tiempo de preparación sin descuidar ninguna materia.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Consejo:</strong> Asigna mayor prioridad y horas semanales a las asignaturas
                con examen más próximo, y añade todas las fechas en la sección de entregas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌍</span>
                <h4>Estudiante de idiomas con trabajo y academia</h4>
              </div>
              <p className={styles.escenarioExample}>
                Compatibilizas el trabajo a jornada completa con clases de idiomas
                por las tardes y necesitas aprovechar al máximo los huecos disponibles.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Consejo:</strong> Marca solo los slots reales de disponibilidad (noches y
                fines de semana) y configura sesiones cortas de 25–50 minutos para no sobrecargar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h4>Adolescente de bachillerato con 8 asignaturas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Gestionas simultáneamente 8 materias con entregas, trabajos y exámenes
                distribuidos a lo largo del trimestre.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Consejo:</strong> Añade todas las asignaturas con su peso real y usa la
                sección de entregas para no olvidar ninguna fecha importante del trimestre.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Horarios de Estudio</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuántas horas al día es lo máximo que se puede estudiar eficientemente?</h4>
              <p>
                La mayoría de los expertos en neurociencia del aprendizaje sitúan el límite
                en torno a 6 horas de estudio real y concentrado. A partir de la 5ª hora
                consecutiva, el rendimiento cae significativamente. Lo importante no es el
                número de horas, sino la calidad de la concentración en cada sesión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Es mejor estudiar por las mañanas o por las noches?</h4>
              <p>
                Depende de tu cronotipo personal, pero en general las mañanas favorecen la
                memorización y el aprendizaje de contenido nuevo, ya que el cerebro está
                más descansado. Las noches son útiles para repasar y consolidar lo ya
                estudiado. Estudiar de madrugada sacrificando sueño siempre es
                contraproducente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto tiempo de descanso debo tomar entre sesiones de estudio?</h4>
              <p>
                Para sesiones de 25 min (Pomodoro): 5 min de pausa. Para sesiones de
                50 min: 10–15 min. Para bloques de 90 min: 20–25 min. Cada 3–4 horas
                de estudio, toma un descanso más largo de 30–60 minutos para que el
                cerebro consolide la información adquirida.
              </p>
              <p className={styles.faqTip}>
                Usa el descanso de forma activa: camina, estira, toma agua. Evita las pantallas
                durante los descansos cortos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo distribuyo el tiempo entre asignaturas difíciles y fáciles?</h4>
              <p>
                Dedica más tiempo a las asignaturas difíciles o con mayor peso en la
                calificación final, pero no abandones las fáciles. Una regla práctica:
                asigna el doble de horas a las materias que te cuestan más. Empieza siempre
                la sesión de estudio con la asignatura más exigente, cuando la mente
                está más fresca.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es la técnica Pomodoro y funciona de verdad?</h4>
              <p>
                La técnica Pomodoro consiste en estudiar en bloques de 25 minutos de
                concentración total, seguidos de 5 minutos de descanso. Cada 4 bloques
                se toma un descanso largo de 15–30 minutos. Está respaldada por la
                psicología cognitiva: reduce la procrastinación, mejora el enfoque y
                evita la fatiga mental al dividir el trabajo en partes manejables.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo estudiar los fines de semana?</h4>
              <p>
                Sí, pero con moderación. Los fines de semana son ideales para repasar
                lo estudiado durante la semana y planificar la semana siguiente. Reservar
                al menos un día de descanso mental completo mejora el rendimiento del
                resto de la semana y previene el agotamiento a largo plazo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo recupero el horario si me atraso?</h4>
              <p>
                No intentes recuperar todo el tiempo perdido de golpe, ya que agrava el
                problema. Reedita el horario: reduce las horas de las asignaturas en las
                que estás al día y redistributiye ese tiempo a las que están atrasadas.
                Acepta que puede ser necesario reajustar los objetivos semanales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuántos días antes del examen debo empezar a repasar?</h4>
              <p>
                Para un examen parcial normal: 7–10 días de repaso activo. Para un examen
                final importante: 2–3 semanas. El error más común es dejar el repaso para
                los últimos 2 días. La memoria a largo plazo se consolida con repasos
                distribuidos en el tiempo, no con atracones de estudio de última hora.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo Crear tu Horario de Estudio Paso a Paso</h2>
          <p className={styles.introParagraph}>
            Sigue esta secuencia para construir un plan de estudio sólido y realista
            que puedas cumplir semana a semana.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Lista todas las materias y sus fechas de examen</h4>
                <p>
                  Antes de planificar nada, reúne toda la información: asignaturas,
                  peso en la nota, fecha del examen o entrega y nivel de dificultad
                  percibido. Añádelas en la sección de entregas del generador.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Calcula las horas disponibles por semana</h4>
                <p>
                  Identifica con honestidad qué franjas horarias tienes realmente libres
                  y con energía para estudiar. Marca tu disponibilidad en la rejilla
                  del generador, siendo realista sobre las semanas de mayor carga.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Prioriza las asignaturas por dificultad y peso</h4>
                <p>
                  Asigna mayor prioridad (4–5 estrellas) a las materias más difíciles
                  o con mayor peso en la calificación. El generador distribuirá más
                  sesiones a las asignaturas con mayor prioridad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Asigna bloques de 45–90 min con descansos de 15 min</h4>
                <p>
                  Genera el horario y revisa que las sesiones estén distribuidas de forma
                  equilibrada entre los días. Evita poner más de 3 bloques seguidos sin
                  un descanso significativo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Reserva un 20% del tiempo para imprevistos</h4>
                <p>
                  No llenes al 100% tu disponibilidad horaria. Deja siempre un margen
                  para enfermedad, compromisos inesperados o días en los que la concentración
                  simplemente no acompaña.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Establece un repaso semanal de lo estudiado</h4>
                <p>
                  Dedica una sesión semanal (preferiblemente el fin de semana) a repasar
                  brevemente todo lo trabajado en la semana. Este repaso de consolidación
                  es fundamental para retener la información a largo plazo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Ajusta el horario según el avance real cada semana</h4>
                <p>
                  Al inicio de cada semana, revisa el plan: ¿cumpliste los objetivos?
                  ¿Necesitas más horas en alguna asignatura? Un buen horario es un
                  documento vivo que se actualiza según la realidad, no un contrato inamovible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas para Estudiar Eficientemente</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>⏱️</div>
              <h4>Sesiones de 45–90 min</h4>
              <p>
                Es el rango óptimo de duración para el máximo rendimiento cognitivo.
                Sesiones más cortas no permiten entrar en estado de flujo; sesiones
                más largas acaban con el rendimiento cayendo drásticamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🧠</div>
              <h4>La materia difícil, con la mente descansada</h4>
              <p>
                Estudia siempre la asignatura más exigente al inicio de la sesión,
                cuando la capacidad de concentración y la memoria de trabajo están
                en su punto más alto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔀</div>
              <h4>Alterna asignaturas distintas</h4>
              <p>
                Cambiar de materia entre sesiones reduce la fatiga mental y mejora
                la retención. No estudies la misma asignatura durante más de 2 horas
                seguidas sin un cambio de tema.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔁</div>
              <h4>10 minutos de repaso inicial</h4>
              <p>
                Comienza cada sesión repasando brevemente lo estudiado el día anterior.
                Este micro-repaso activa la memoria a largo plazo y facilita la conexión
                con el nuevo contenido.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>😴</div>
              <h4>Duerme mínimo 7–8 horas</h4>
              <p>
                El sueño es cuando el cerebro consolida la memoria. Dormir menos para
                estudiar más es siempre contraproducente: reduce la capacidad de retención
                y el rendimiento cognitivo del día siguiente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📆</div>
              <h4>Deja días libres para imprevistos</h4>
              <p>
                Un horario sin margen es un horario que se incumple en la primera
                semana. Reserva al menos un día sin estudio planificado para descanso
                mental y para absorber contratiempos.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores frecuentes que arruinan el horario de estudio</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Estudiar más de 6 horas seguidas sin descanso</strong> — El rendimiento
                cae al 40% a partir de la 5ª hora. Más tiempo no significa más aprendizaje.
              </li>
              <li>
                <strong>Crear un horario perfecto que nunca se cumple</strong> — Un plan demasiado
                ambicioso genera frustración y abandono. Es mejor un horario modesto que se cumpla
                al 90% que uno ideal que se abandona en 3 días.
              </li>
              <li>
                <strong>Estudiar de madrugada sacrificando horas de sueño</strong> — El sueño no
                es tiempo perdido: es cuando el cerebro graba la información en la memoria a largo
                plazo. Sin dormir, el estudio nocturno es prácticamente inútil.
              </li>
              <li>
                <strong>No reservar tiempo para repasos</strong> — Estudiar contenido nuevo sin
                revisar lo anterior genera una acumulación de materia olvidada que se convierte
                en una deuda imposible de pagar antes del examen.
              </li>
              <li>
                <strong>Estudiar solo cuando se tiene ganas</strong> — Esperar a la motivación
                para empezar garantiza el fracaso. La consistencia diaria, aunque sea en sesiones
                cortas, supera siempre a los maratones esporádicos.
              </li>
              <li>
                <strong>Dejar todo para la última semana</strong> — La memoria necesita tiempo y
                repetición para consolidarse. Estudiar de golpe antes del examen solo permite
                retención a corto plazo que desaparece en días.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('generador-horarios-estudio')}
        title="Mejora tu rendimiento académico"
        icon="📚"
      />

      <ShareCard appName="generador-horarios-estudio" />
      <Footer appName="generador-horarios-estudio" />
    </div>
  );
}
