'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './GeneradorHorarios.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
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
}

type DisponibilidadMatrix = boolean[][];

// Constantes
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

const DURACIONES_DESCANSO = [
  { valor: 5, nombre: '5 min' },
  { valor: 10, nombre: '10 min' },
  { valor: 15, nombre: '15 min' },
];

const COLORES_ASIGNATURA = [
  '#2E86AB', '#48A9A6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
];

// Estado inicial de disponibilidad (L-V mañana y tarde activos)
const crearDisponibilidadInicial = (): DisponibilidadMatrix => {
  return FRANJAS.map((_, franjaIdx) =>
    DIAS.map((_, diaIdx) => {
      // Por defecto: L-V mañana y tarde activos
      if (diaIdx < 5 && franjaIdx < 2) return true;
      return false;
    })
  );
};

export default function GeneradorHorariosPage() {
  // Estado
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([
    { id: '1', nombre: 'Matemáticas', horasSemana: 5, prioridad: 5, color: COLORES_ASIGNATURA[0] },
    { id: '2', nombre: 'Física', horasSemana: 4, prioridad: 4, color: COLORES_ASIGNATURA[1] },
    { id: '3', nombre: 'Inglés', horasSemana: 3, prioridad: 3, color: COLORES_ASIGNATURA[2] },
  ]);

  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadMatrix>(crearDisponibilidadInicial);
  const [duracionSesion, setDuracionSesion] = useState(50);
  const [duracionDescanso, setDuracionDescanso] = useState(10);
  const [horarioGenerado, setHorarioGenerado] = useState<SesionEstudio[]>([]);

  // Cargar datos de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-horarios-estudio');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.asignaturas) setAsignaturas(data.asignaturas);
        if (data.disponibilidad) setDisponibilidad(data.disponibilidad);
        if (data.duracionSesion) setDuracionSesion(data.duracionSesion);
        if (data.duracionDescanso) setDuracionDescanso(data.duracionDescanso);
        if (data.horarioGenerado) setHorarioGenerado(data.horarioGenerado);
      } catch (e) {
        console.error('Error cargando horarios:', e);
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('meskeia-horarios-estudio', JSON.stringify({
      asignaturas,
      disponibilidad,
      duracionSesion,
      duracionDescanso,
      horarioGenerado,
    }));
  }, [asignaturas, disponibilidad, duracionSesion, duracionDescanso, horarioGenerado]);

  // Funciones para asignaturas
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
    }
  };

  const actualizarAsignatura = (id: string, campo: keyof Asignatura, valor: string | number) => {
    setAsignaturas(asignaturas.map(a =>
      a.id === id ? { ...a, [campo]: valor } : a
    ));
  };

  // Funciones para disponibilidad
  const toggleDisponibilidad = (franjaIdx: number, diaIdx: number) => {
    const nueva = disponibilidad.map((franja, fIdx) =>
      franja.map((activo, dIdx) =>
        fIdx === franjaIdx && dIdx === diaIdx ? !activo : activo
      )
    );
    setDisponibilidad(nueva);
  };

  // Calcular slots disponibles
  const slotsDisponibles = useMemo(() => {
    let total = 0;
    disponibilidad.forEach(franja => {
      franja.forEach(activo => {
        if (activo) total++;
      });
    });
    return total;
  }, [disponibilidad]);

  // Calcular horas totales necesarias
  const horasTotales = useMemo(() => {
    return asignaturas.reduce((acc, a) => acc + a.horasSemana, 0);
  }, [asignaturas]);

  // Generar horario
  const generarHorario = useCallback(() => {
    // Crear lista de slots disponibles
    const slots: { dia: number; franja: number }[] = [];
    disponibilidad.forEach((franja, franjaIdx) => {
      franja.forEach((activo, diaIdx) => {
        if (activo) {
          slots.push({ dia: diaIdx, franja: franjaIdx });
        }
      });
    });

    if (slots.length === 0) {
      alert('No hay slots de disponibilidad seleccionados');
      return;
    }

    // Ordenar asignaturas por prioridad (mayor a menor)
    const asignaturasOrdenadas = [...asignaturas].sort((a, b) => b.prioridad - a.prioridad);

    // Calcular sesiones por asignatura
    const sesionesPorHora = 60 / duracionSesion; // Sesiones que caben en 1 hora
    const sesiones: SesionEstudio[] = [];

    // Distribuir sesiones
    let slotIndex = 0;

    asignaturasOrdenadas.forEach(asig => {
      const sesionesNecesarias = Math.ceil(asig.horasSemana * sesionesPorHora);

      for (let i = 0; i < sesionesNecesarias && slotIndex < slots.length; i++) {
        const slot = slots[slotIndex % slots.length];
        sesiones.push({
          asignaturaId: asig.id,
          asignaturaNombre: asig.nombre,
          dia: slot.dia,
          franja: slot.franja,
          prioridad: asig.prioridad,
        });
        slotIndex++;
      }
    });

    // Mezclar un poco para no tener todo el mismo día seguido
    sesiones.sort((a, b) => {
      if (a.dia !== b.dia) return a.dia - b.dia;
      if (a.franja !== b.franja) return a.franja - b.franja;
      return 0;
    });

    setHorarioGenerado(sesiones);
  }, [asignaturas, disponibilidad, duracionSesion]);

  // Obtener sesiones por día y franja
  const getSesiones = (dia: number, franja: number): SesionEstudio[] => {
    return horarioGenerado.filter(s => s.dia === dia && s.franja === franja);
  };

  // Obtener clase de prioridad
  const getPrioridadClase = (prioridad: number): string => {
    if (prioridad >= 4) return 'alta';
    if (prioridad >= 2) return 'media';
    return 'baja';
  };

  // Resumen
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

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Horarios de Estudio</h1>
        <p className={styles.subtitle}>
          Añade asignaturas, configura tu disponibilidad y genera un plan semanal optimizado
        </p>
      </header>

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
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>h/sem</span>
                  </div>
                  <button
                    className={styles.btnEliminar}
                    onClick={() => eliminarAsignatura(asig.id)}
                    disabled={asignaturas.length <= 1}
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
                        className={`${styles.estrella} ${n <= asig.prioridad ? styles.activa : ''}`}
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

            <div className={styles.disponibilidadGrid}>
              {/* Headers días */}
              <div></div>
              {DIAS.map(dia => (
                <div key={dia} className={styles.disponibilidadHeader}>{dia}</div>
              ))}

              {/* Franjas */}
              {FRANJAS.map((franja, franjaIdx) => (
                <>
                  <div key={`label-${franjaIdx}`} className={styles.disponibilidadFranja}>
                    {franja.nombre}
                  </div>
                  {DIAS.map((_, diaIdx) => (
                    <button
                      key={`${franjaIdx}-${diaIdx}`}
                      className={`${styles.disponibilidadSlot} ${
                        disponibilidad[franjaIdx]?.[diaIdx] ? styles.activo : ''
                      }`}
                      onClick={() => toggleDisponibilidad(franjaIdx, diaIdx)}
                      title={`${DIAS_COMPLETOS[diaIdx]} - ${franja.nombre}`}
                    />
                  ))}
                </>
              ))}
            </div>
          </div>

          {/* Preferencias */}
          <div className={styles.preferenciasSection}>
            <h2 className={styles.sectionTitle}>
              <span>⚙️</span> Preferencias
            </h2>

            <div className={styles.preferenciasGrid}>
              <div className={styles.preferenciaItem}>
                <label className={styles.preferenciaLabel}>Duración sesión</label>
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

              <div className={styles.preferenciaItem}>
                <label className={styles.preferenciaLabel}>Descanso entre sesiones</label>
                <select
                  className={styles.select}
                  value={duracionDescanso}
                  onChange={e => setDuracionDescanso(parseInt(e.target.value))}
                >
                  {DURACIONES_DESCANSO.map(d => (
                    <option key={d.valor} value={d.valor}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button className={styles.btnPrimary} onClick={generarHorario}>
            <span>⚡</span> Generar Horario
          </button>

          {/* Info */}
          <div style={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            background: 'var(--hover)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <strong>Resumen:</strong><br/>
            {asignaturas.length} asignaturas • {horasTotales}h/semana<br/>
            {slotsDisponibles} slots disponibles
          </div>
        </div>

        {/* Panel del calendario */}
        <div className={styles.calendarioPanel}>
          <div className={styles.calendarioHeader}>
            <h2 className={styles.calendarioTitulo}>
              {horarioGenerado.length > 0 ? 'Tu Horario Semanal' : 'Vista Previa'}
            </h2>
          </div>

          {/* Leyenda */}
          <div className={styles.leyenda}>
            <div className={styles.leyendaItem}>
              <div className={`${styles.leyendaColor} ${styles.alta}`}></div>
              <span>Alta prioridad</span>
            </div>
            <div className={styles.leyendaItem}>
              <div className={`${styles.leyendaColor} ${styles.media}`}></div>
              <span>Media prioridad</span>
            </div>
            <div className={styles.leyendaItem}>
              <div className={`${styles.leyendaColor} ${styles.baja}`}></div>
              <span>Baja prioridad</span>
            </div>
          </div>

          {horarioGenerado.length > 0 ? (
            <>
              {/* Calendario Grid (desktop) */}
              <div className={styles.calendarioGrid}>
                {/* Headers */}
                <div className={styles.calendarioHeaderCelda}></div>
                {DIAS.map(dia => (
                  <div key={dia} className={styles.calendarioHeaderCelda}>{dia}</div>
                ))}

                {/* Franjas */}
                {FRANJAS.map((franja, franjaIdx) => (
                  <>
                    <div key={`hora-${franjaIdx}`} className={styles.calendarioHoraCelda}>
                      {franja.inicio}<br/>-<br/>{franja.fin}
                    </div>
                    {DIAS.map((_, diaIdx) => (
                      <div key={`celda-${franjaIdx}-${diaIdx}`} className={styles.calendarioCelda}>
                        {getSesiones(diaIdx, franjaIdx).map((sesion, idx) => (
                          <div
                            key={idx}
                            className={`${styles.sesionEstudio} ${styles[getPrioridadClase(sesion.prioridad)]}`}
                            title={`${sesion.asignaturaNombre} - ${duracionSesion} min`}
                          >
                            {sesion.asignaturaNombre}
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
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
                            className={`${styles.sesionMobile} ${styles[getPrioridadClase(sesion.prioridad)]}`}
                          >
                            <span className={styles.sesionMobileNombre}>{sesion.asignaturaNombre}</span>
                            <span className={styles.sesionMobileHora}>
                              {FRANJAS[sesion.franja].nombre}
                            </span>
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
                Configura tus asignaturas y disponibilidad,<br/>
                luego pulsa &quot;Generar Horario&quot; para crear tu plan semanal.
              </p>
            </div>
          )}
        </div>
      </div>

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
              <h4>Técnica Pomodoro</h4>
              <p>
                Estudia en bloques de 25 minutos con descansos de 5 minutos.
                Cada 4 pomodoros, toma un descanso más largo de 15-30 minutos.
                Esta técnica combate la procrastinación y mantiene la concentración.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Bloques de 90 minutos</h4>
              <p>
                El cerebro funciona en ciclos ultradianos de aproximadamente 90 minutos.
                Estudiar en bloques de esta duración, seguidos de descansos de 20 minutos,
                puede maximizar el aprendizaje profundo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Intercalado de materias</h4>
              <p>
                Alterna entre diferentes asignaturas en lugar de estudiar una sola
                durante horas. Esto mejora la retención y evita la fatiga mental
                asociada a una sola materia.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo Usar Este Generador</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>1. Añade tus asignaturas</h4>
              <p>
                Introduce cada materia con las horas semanales que necesitas dedicarle.
                Asigna una prioridad del 1 al 5 según la dificultad o importancia.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>2. Configura disponibilidad</h4>
              <p>
                Marca los bloques horarios en los que puedes estudiar.
                Sé realista: excluye comidas, transporte, actividades fijas, etc.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>3. Ajusta preferencias</h4>
              <p>
                Elige la duración de las sesiones según tu capacidad de concentración.
                El Pomodoro es ideal para empezar; sesiones más largas para trabajo profundo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>4. Genera y adapta</h4>
              <p>
                El horario generado es una guía inicial. Adáptalo según tus ritmos
                personales y ajústalo semana a semana según tus necesidades reales.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos de Productividad</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Respeta los descansos</h4>
              <p>
                Los descansos no son tiempo perdido. Son esenciales para que el cerebro
                consolide información y recupere capacidad de concentración.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Estudia lo difícil primero</h4>
              <p>
                Aprovecha las primeras horas del día o tus momentos de mayor energía
                para las asignaturas más exigentes o que menos te gustan.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Prepara el entorno</h4>
              <p>
                Un espacio ordenado, buena iluminación, y ausencia de distracciones
                (móvil en silencio) multiplicarán tu productividad.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('generador-horarios-estudio')}
        title="Mejora tu rendimiento académico"
        icon="📚"
      />

      <Footer appName="generador-horarios-estudio" />
    </div>
  );
}
