'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './ListaTareas.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice />

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

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía completa de gestión de tareas"
        subtitle="Métodos, consejos y buenas prácticas para organizar tu trabajo con eficacia"
        icon="✅"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Métodos de organización de tareas: comparativa</h2>
          <p className={styles.introParagraph}>
            No existe un único método perfecto. Conocer las opciones te permite elegir el que mejor encaja con tu forma de trabajar y el volumen de tareas que gestionas.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Complejidad de uso</th>
                  <th>Ideal para</th>
                  <th>Tareas gestionables</th>
                  <th>Herramienta necesaria</th>
                  <th>Curva de aprendizaje</th>
                  <th>Cuándo usar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lista simple</strong></td>
                  <td>Muy baja</td>
                  <td>Tareas cotidianas, recados</td>
                  <td>5–15 tareas</td>
                  <td>Papel, cualquier app</td>
                  <td>Ninguna — inmediato</td>
                  <td>Empezar desde cero, tareas sin dependencias</td>
                </tr>
                <tr>
                  <td><strong>MIT (Most Important Tasks)</strong></td>
                  <td>Baja</td>
                  <td>Personas con foco limitado</td>
                  <td>3 tareas prioritarias/día</td>
                  <td>Papel o app básica</td>
                  <td>Muy baja — 1 día</td>
                  <td>Cuando todo parece urgente y necesitas claridad</td>
                </tr>
                <tr>
                  <td><strong>Kanban</strong></td>
                  <td>Media</td>
                  <td>Proyectos con estados visuales</td>
                  <td>10–30 tareas activas</td>
                  <td>Trello, Notion, tablero físico</td>
                  <td>Baja — 2–3 días</td>
                  <td>Equipos o proyectos con flujo de trabajo definido</td>
                </tr>
                <tr>
                  <td><strong>Matriz Eisenhower</strong></td>
                  <td>Media</td>
                  <td>Profesionales con muchas demandas</td>
                  <td>15–25 tareas</td>
                  <td>Cuadrante 2x2 (papel o app)</td>
                  <td>Media — 1 semana</td>
                  <td>Cuando tienes dificultad para distinguir urgente de importante</td>
                </tr>
                <tr>
                  <td><strong>GTD (David Allen)</strong></td>
                  <td>Alta</td>
                  <td>Profesionales con alta carga cognitiva</td>
                  <td>50–200+ tareas</td>
                  <td>OmniFocus, Things 3, Todoist</td>
                  <td>Alta — varias semanas</td>
                  <td>Cuando la lista simple ya no escala y necesitas un sistema completo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso según tu perfil</h2>
          <p className={styles.introParagraph}>
            La gestión de tareas no es igual para todos. Aquí cuatro perfiles reales con estrategias concretas.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h3>Estudiante con múltiples asignaturas</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> 5 asignaturas simultáneas, trabajos, exámenes y fechas solapadas.
              </p>
              <p>
                Usa una categoría por asignatura y añade siempre la fecha límite. El método MIT funciona muy bien aquí: cada mañana elige las 3 tareas académicas más importantes del día y completa esas antes de las demás. Limita la lista a un máximo de 20 tareas activas: si crece más, hay que dividir o eliminar.
              </p>
              <p className={styles.escenarioTip}>
                Tip: Usa la prioridad alta solo para entregas con fecha límite en menos de 48 horas. Así la lista roja no pierde sentido.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <h3>Profesional con varios proyectos simultáneos</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> 3–5 proyectos activos, reuniones frecuentes y entregables continuos.
              </p>
              <p>
                Usa una categoría por proyecto. Filtra por categoría al inicio de cada bloque de trabajo para no mezclar contextos mentales. La revisión diaria de 5 minutos es crítica: sin ella, las tareas antiguas se acumulan y la lista pierde utilidad. Considera combinar esta app con un gestor de proyectos para las dependencias complejas.
              </p>
              <p className={styles.escenarioTip}>
                Tip: Dedica los primeros 10 minutos del día a revisar la lista, marcar completadas del día anterior y decidir tus 3 MIT del día.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                <h3>Emprendedor separando urgente de importante</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Muchas tareas «urgentes», dificultad para avanzar en lo estratégico.
              </p>
              <p>
                Aplica la Matriz Eisenhower con las prioridades: alta = urgente+importante, media = importante pero no urgente, baja = urgente pero no importante. Las tareas de prioridad media son las más valiosas a largo plazo y las que más se posponen. Bloquea tiempo específico cada semana solo para ellas antes de atender urgencias.
              </p>
              <p className={styles.escenarioTip}>
                Tip: Si más del 60% de tus tareas son de prioridad alta, el sistema ha perdido calibración. Revisa y rebaja prioridades regularmente.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <h3>Gestión de tareas personales del hogar</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Recados, mantenimiento, compras, citas médicas, gestiones administrativas.
              </p>
              <p>
                La categoría «Personal» y «Compras» cubre la mayor parte. Las tareas del hogar suelen ser recurrentes: apunta los plazos reales (revisión caldera, ITV, cita médica anual) con fecha límite para no olvidarlos. Una lista de 10–15 tareas personales activas es perfectamente manejable sin sistema complejo.
              </p>
              <p className={styles.escenarioTip}>
                Tip: Limpiar completadas una vez a la semana mantiene la lista fresca y da sensación real de progreso.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre gestión de tareas</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuántas tareas es manejable tener en una lista?</dt>
              <dd>
                La investigación sobre carga cognitiva sugiere que una lista de más de <strong>20–25 tareas activas</strong> empieza a paralizar en lugar de ayudar. El cerebro percibe la lista larga como una amenaza, no como una herramienta. Si superas ese umbral, es señal de que estás mezclando proyectos con tareas, o que no estás eliminando/posponiendo lo que ya no es relevante. Revisa y reduce antes de seguir añadiendo.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo priorizar cuando todo parece urgente?</dt>
              <dd>
                Cuando todo es urgente, nada lo es realmente. Aplica el método <strong>MIT (Most Important Tasks)</strong> de Leo Babauta: elige cada mañana las 3 tareas que, si solo pudieras hacer 3 cosas hoy, elegirías completar. Esas son tu prioridad alta real. El resto son media o baja. Esta limitación forzada obliga a tomar decisiones que de otro modo se evitan.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuál es la diferencia entre una tarea y un proyecto?</dt>
              <dd>
                Una <strong>tarea</strong> es una acción concreta que se puede completar en una sola sesión: &ldquo;Llamar a la gestoría&rdquo;, &ldquo;Revisar presupuesto de enero&rdquo;. Un <strong>proyecto</strong> es un resultado que requiere múltiples acciones: &ldquo;Lanzar nueva web&rdquo;, &ldquo;Preparar mudanza&rdquo;. Mezclarlos en la misma lista es uno de los errores más comunes. En una lista de tareas, los proyectos deben descomponerse en acciones individuales con verbo concreto.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo gestionar tareas recurrentes?</dt>
              <dd>
                Esta app no tiene recurrencia automática, por lo que la mejor práctica es usar la fecha límite para las recurrentes importantes. Cuando la completes, añade inmediatamente la próxima ocurrencia con nueva fecha. Para tareas muy frecuentes (diarias, semanales), considera si realmente necesitan estar en la lista o si es más eficiente convertirlas en hábito con otra herramienta como un rastreador de hábitos.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuándo revisar la lista de tareas?</dt>
              <dd>
                Lo mínimo recomendado es una <strong>revisión diaria de 5 minutos</strong> (al inicio o al final del día) para marcar completadas, ajustar prioridades y añadir las novedades del día. Una revisión semanal más profunda (15–20 min) permite identificar tareas que llevan semanas sin moverse — señal de que están mal definidas, son en realidad proyectos, o ya no son relevantes.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo evitar que la lista crezca sin fin?</dt>
              <dd>
                Aplica la regla de las tres puertas antes de añadir una tarea: ¿es accionable ahora? ¿tiene un plazo real? ¿vale la pena el espacio mental que ocupa? Si la respuesta a las tres es no, no la añadas o ponla en una lista separada de &ldquo;algún día/quizás&rdquo;. Archivar o eliminar completadas regularmente y limitar la lista a <strong>20–25 tareas activas máximo</strong> son los dos hábitos más efectivos para mantener la lista útil.
              </dd>
            </div>
          </dl>
          <p className={styles.faqTip}>
            La gestión de tareas es una habilidad que mejora con la práctica. Lo más importante no es el sistema perfecto, sino la consistencia en revisarlo y mantenerlo actualizado.
          </p>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo empezar un sistema de tareas efectivo: guía paso a paso</h2>
          <p className={styles.introParagraph}>
            Estos 5 pasos te llevan desde una lista caótica hasta un sistema de organización personal que realmente funciona.
          </p>
          <ol className={styles.stepGuide} aria-label="Pasos para implementar un sistema de tareas efectivo">
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <h4>Captura todo lo que tienes en mente</h4>
                <p>Dedica 15–20 minutos a vaciar tu cabeza: anota absolutamente todo lo que sientes que tienes pendiente, sin filtrar ni ordenar. Tareas del trabajo, del hogar, recados, cosas que quieres hacer, compromisos informales. Esta &ldquo;captura masiva&rdquo; inicial libera carga mental inmediata y te da una visión real de tu situación. Muchas personas descubren que la lista es más manejable de lo que imaginaban.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <h4>Convierte cada elemento en una tarea accionable con verbo</h4>
                <p>Revisa la lista capturada y reformula cada elemento para que empiece con un verbo concreto: &ldquo;Informe trimestral&rdquo; → &ldquo;Redactar el resumen ejecutivo del informe trimestral&rdquo;. Las tareas vagas generan procrastinación porque el cerebro no sabe por dónde empezar. Si un elemento requiere más de una acción, es un proyecto: desglósalo en tareas individuales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <h4>Asigna prioridad y fecha límite a cada tarea</h4>
                <p>Para cada tarea, decide: ¿es alta, media o baja prioridad? ¿tiene una fecha límite real? La prioridad alta debe reservarse para lo verdaderamente importante o urgente — si todo es alta, nada lo es. Añade fecha límite solo cuando exista una real: poner fechas artificiales a todo genera ansiedad sin beneficio. El objetivo es que la lista te ayude a decidir, no que te agobie.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <h4>Establece una revisión diaria de 5 minutos</h4>
                <p>Elige un momento fijo del día (primera hora de la mañana o al final de la jornada) para revisar la lista: marca completadas, añade las nuevas del día y elige tus 3 MIT del día siguiente. Esta revisión de 5 minutos es el hábito más importante del sistema. Sin ella, la lista se convierte en un cementerio de tareas olvidadas en pocas semanas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <h4>Haz una revisión semanal para limpiar y replantear</h4>
                <p>Una vez a la semana (muchos prefieren el viernes tarde o el domingo), dedica 15–20 minutos a una limpieza más profunda: elimina tareas que ya no son relevantes, revisa si alguna tarea lleva más de 2 semanas sin moverse (señal de que está mal definida o no es una prioridad real), y planifica las tareas importantes de la semana siguiente antes de que lleguen las urgencias.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para gestionar tareas con eficacia</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>Captura inmediata: nunca confíes en la memoria</h4>
              <p>Cuando surja una tarea, anótala en el momento. Intentar recordarla después consume energía mental y genera ansiedad de fondo. Tener siempre un lugar único donde capturar es el primer principio de cualquier sistema de productividad efectivo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✍️</span>
              <h4>Escribe tareas accionables que empiecen con verbo</h4>
              <p>«Dentista» no es una tarea. «Pedir cita con el dentista para revisión anual» sí lo es. Las tareas con verbo concreto tienen un inicio claro y eliminan la fricción de decidir por dónde empezar. Es la diferencia entre procrastinar y actuar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📥</span>
              <h4>Una sola bandeja de entrada para todas las tareas</h4>
              <p>Mezclar listas en papel, notas del móvil, correos marcados y una app crea fragmentación mental. Consolida todo en un único lugar de captura. Esta app puede ser tu bandeja de entrada única si la usas de forma consistente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h4>Revisión diaria de 5 minutos sin excepción</h4>
              <p>La revisión diaria es el hábito que mantiene el sistema vivo. Sin ella, la lista envejece rápido y pierde credibilidad. 5 minutos cada día equivale a 30 horas al año de claridad mental — una inversión con retorno inmediato.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>No más de 3 tareas MIT al día</h4>
              <p>El método MIT (Most Important Tasks) de Leo Babauta limita a 3 las tareas prioritarias diarias. Esta restricción forzada obliga a decidir qué importa realmente. Completar 3 tareas importantes es más valioso que empezar 10 y no terminar ninguna.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <h4>Archiva completadas regularmente</h4>
              <p>Limpiar las tareas completadas una vez a la semana mantiene la lista corta y da una sensación real de progreso. Ver una lista llena de tareas completadas es también una fuente de motivación y muestra el avance real a lo largo del tiempo.</p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores comunes que inutilizan la lista de tareas</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Lista demasiado larga que paraliza.</strong> Una lista de 50 o 100 tareas no es un sistema de productividad: es una fuente de ansiedad. Cuando la lista supera las 25 tareas activas, el cerebro percibe que nunca podrás terminar y deja de usarla como guía. La solución es separar proyectos de tareas, eliminar lo irrelevante y mantener el límite de tareas activas por debajo de 25.
              </li>
              <li>
                <strong>Mezclar proyectos con tareas.</strong> «Organizar la mudanza» no es una tarea, es un proyecto de 30 acciones. Añadirlo como una sola entrada hace que nunca avance porque no hay un primer paso claro. Cada elemento de la lista debe ser una acción concreta que se puede completar en una sola sesión de trabajo.
              </li>
              <li>
                <strong>No revisar la lista regularmente.</strong> Una lista que no se revisa pierde utilidad en días. Las tareas se acumulan sin completarse, las prioridades quedan desactualizadas y la lista deja de reflejar la realidad. La revisión diaria de 5 minutos no es opcional: es lo que separa un sistema vivo de un repositorio olvidado.
              </li>
              <li>
                <strong>Añadir tareas vagas sin verbo de acción.</strong> «Trabajo», «Salud», «Proyecto X» no son tareas, son categorías. Sin un verbo concreto que indique qué hay que hacer exactamente, la tarea genera bloqueo cada vez que la ves. Antes de añadir cualquier elemento, asegúrate de que empieza con un verbo de acción: llamar, enviar, revisar, preparar, comprar.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('lista-tareas')} />
      <ShareCard appName="lista-tareas" />
      <Footer appName="lista-tareas" />
    </div>
  );
}
