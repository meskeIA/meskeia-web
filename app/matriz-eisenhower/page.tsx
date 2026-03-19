'use client';

import { useState, useEffect } from 'react';
import styles from './MatrizEisenhower.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type Quadrant = 'hacer' | 'planificar' | 'delegar' | 'eliminar';

interface Task {
  id: string;
  text: string;
  quadrant: Quadrant;
  createdAt: number;
}

// Configuración de cuadrantes
const QUADRANTS: Record<Quadrant, { title: string; subtitle: string; icon: string; color: string; action: string }> = {
  hacer: {
    title: 'Hacer',
    subtitle: 'Urgente + Importante',
    icon: '🔥',
    color: '#e74c3c',
    action: 'Hazlo ahora mismo. Son crisis, plazos inmediatos o problemas críticos.',
  },
  planificar: {
    title: 'Planificar',
    subtitle: 'No Urgente + Importante',
    icon: '📅',
    color: '#2E86AB',
    action: 'Agenda tiempo específico. Son metas, proyectos estratégicos y desarrollo personal.',
  },
  delegar: {
    title: 'Delegar',
    subtitle: 'Urgente + No Importante',
    icon: '👥',
    color: '#f39c12',
    action: 'Delega si puedes. Son interrupciones, algunas llamadas y emails urgentes de otros.',
  },
  eliminar: {
    title: 'Eliminar',
    subtitle: 'No Urgente + No Importante',
    icon: '🗑️',
    color: '#95a5a6',
    action: 'Elimina o minimiza. Son distracciones, tiempo perdido y actividades sin valor.',
  },
};

const STORAGE_KEY = 'meskeia-matriz-eisenhower';

export default function MatrizEisenhowerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('hacer');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tareas de localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        // Si hay error, empezar vacío
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar tareas en localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  // Añadir tarea
  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      quadrant: selectedQuadrant,
      createdAt: Date.now(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  // Eliminar tarea
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Mover tarea a otro cuadrante
  const moveTask = (taskId: string, newQuadrant: Quadrant) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, quadrant: newQuadrant } : t
    ));
  };

  // Drag & Drop handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (quadrant: Quadrant) => {
    if (draggedTask && draggedTask.quadrant !== quadrant) {
      moveTask(draggedTask.id, quadrant);
    }
    setDraggedTask(null);
  };

  // Obtener tareas por cuadrante
  const getTasksByQuadrant = (quadrant: Quadrant) =>
    tasks.filter(t => t.quadrant === quadrant);

  // Limpiar todas las tareas
  const clearAll = () => {
    if (confirm('¿Eliminar todas las tareas? Esta acción no se puede deshacer.')) {
      setTasks([]);
    }
  };

  // Contar tareas
  const totalTasks = tasks.length;
  const tasksByQuadrant = {
    hacer: getTasksByQuadrant('hacer').length,
    planificar: getTasksByQuadrant('planificar').length,
    delegar: getTasksByQuadrant('delegar').length,
    eliminar: getTasksByQuadrant('eliminar').length,
  };

  // Manejar Enter en input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📊</span>
        <h1 className={styles.title}>Matriz Eisenhower</h1>
        <p className={styles.subtitle}>
          Prioriza tus tareas clasificándolas por urgencia e importancia.
          Decide qué hacer, planificar, delegar o eliminar.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="matriz-eisenhower-disclaimer"
      />

      {/* Input para nueva tarea */}
      <div className={styles.inputSection}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe una tarea..."
            className={styles.taskInput}
            aria-label="Nueva tarea"
          />
          <select
            value={selectedQuadrant}
            onChange={(e) => setSelectedQuadrant(e.target.value as Quadrant)}
            className={styles.quadrantSelect}
            aria-label="Seleccionar cuadrante"
          >
            <option value="hacer">🔥 Hacer (Urgente + Importante)</option>
            <option value="planificar">📅 Planificar (Importante)</option>
            <option value="delegar">👥 Delegar (Urgente)</option>
            <option value="eliminar">🗑️ Eliminar (Ninguno)</option>
          </select>
          <button onClick={addTask} className={styles.addButton} aria-label="Añadir tarea">
            Añadir
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {totalTasks > 0 && (
        <div className={styles.statsBar}>
          <span className={styles.statItem}>
            <strong>{totalTasks}</strong> tareas totales
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem} style={{ color: QUADRANTS.hacer.color }}>
            🔥 {tasksByQuadrant.hacer}
          </span>
          <span className={styles.statItem} style={{ color: QUADRANTS.planificar.color }}>
            📅 {tasksByQuadrant.planificar}
          </span>
          <span className={styles.statItem} style={{ color: QUADRANTS.delegar.color }}>
            👥 {tasksByQuadrant.delegar}
          </span>
          <span className={styles.statItem} style={{ color: QUADRANTS.eliminar.color }}>
            🗑️ {tasksByQuadrant.eliminar}
          </span>
          <button onClick={clearAll} className={styles.clearButton} aria-label="Limpiar todo">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Matriz de 4 cuadrantes */}
      <div className={styles.matrix}>
        {/* Eje Y - Importancia */}
        <div className={styles.axisY}>
          <span className={styles.axisLabel}>IMPORTANTE</span>
          <div className={styles.axisArrow}>↑</div>
          <span className={styles.axisLabel}>NO IMPORTANTE</span>
        </div>

        {/* Eje X - Urgencia */}
        <div className={styles.axisX}>
          <span className={styles.axisLabel}>URGENTE</span>
          <div className={styles.axisArrow}>→</div>
          <span className={styles.axisLabel}>NO URGENTE</span>
        </div>

        {/* Cuadrantes */}
        <div className={styles.quadrantsGrid}>
          {(['hacer', 'planificar', 'delegar', 'eliminar'] as Quadrant[]).map((quadrant) => (
            <div
              key={quadrant}
              className={`${styles.quadrant} ${styles[`quadrant_${quadrant}`]} ${draggedTask ? styles.dropTarget : ''}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(quadrant)}
              style={{ '--quadrant-color': QUADRANTS[quadrant].color } as React.CSSProperties}
            >
              <div className={styles.quadrantHeader}>
                <span className={styles.quadrantIcon}>{QUADRANTS[quadrant].icon}</span>
                <div>
                  <h3 className={styles.quadrantTitle}>{QUADRANTS[quadrant].title}</h3>
                  <span className={styles.quadrantSubtitle}>{QUADRANTS[quadrant].subtitle}</span>
                </div>
              </div>
              <p className={styles.quadrantAction}>{QUADRANTS[quadrant].action}</p>

              <div className={styles.taskList}>
                {getTasksByQuadrant(quadrant).map((task) => (
                  <div
                    key={task.id}
                    className={styles.taskItem}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={() => setDraggedTask(null)}
                  >
                    <span className={styles.taskText}>{task.text}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={styles.deleteTaskButton}
                      aria-label={`Eliminar tarea: ${task.text}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {getTasksByQuadrant(quadrant).length === 0 && (
                  <div className={styles.emptyQuadrant}>
                    Arrastra tareas aquí o añade nuevas
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo usar la Matriz Eisenhower?"
        subtitle="Aprende a priorizar como un presidente"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es la Matriz Eisenhower?</h2>
          <p className={styles.introParagraph}>
            La Matriz Eisenhower (también llamada Matriz Urgente-Importante) es un método de
            gestión del tiempo atribuido a Dwight D. Eisenhower, 34º presidente de EE.UU.
            y General del Ejército. Su famosa cita: <em>&quot;Lo que es importante rara vez es urgente,
            y lo que es urgente rara vez es importante&quot;</em>.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔥 Cuadrante 1: Hacer</h4>
              <p><strong>Urgente + Importante</strong></p>
              <p>Crisis, plazos inminentes, problemas que requieren atención inmediata.
              Estas tareas no pueden esperar y tienen consecuencias significativas.</p>
              <p><em>Ejemplos: Entrega de proyecto mañana, cliente enfadado, avería crítica.</em></p>
            </div>
            <div className={styles.contentCard}>
              <h4>📅 Cuadrante 2: Planificar</h4>
              <p><strong>No Urgente + Importante</strong></p>
              <p>El cuadrante más valioso. Aquí están las actividades que te hacen crecer:
              planificación, formación, relaciones, prevención.</p>
              <p><em>Ejemplos: Aprender una habilidad, ejercicio, planificar el trimestre.</em></p>
            </div>
            <div className={styles.contentCard}>
              <h4>👥 Cuadrante 3: Delegar</h4>
              <p><strong>Urgente + No Importante</strong></p>
              <p>Tareas que parecen urgentes pero no contribuyen a tus objetivos.
              Suelen ser urgencias de otros. Delega si puedes.</p>
              <p><em>Ejemplos: Algunas llamadas, emails &quot;urgentes&quot;, reuniones innecesarias.</em></p>
            </div>
            <div className={styles.contentCard}>
              <h4>🗑️ Cuadrante 4: Eliminar</h4>
              <p><strong>No Urgente + No Importante</strong></p>
              <p>Actividades que no aportan valor. Distracciones y pérdidas de tiempo
              que deberías minimizar o eliminar.</p>
              <p><em>Ejemplos: Scroll infinito en redes, ver TV sin propósito, chismorreos.</em></p>
            </div>
          </div>

          <h3>Consejos para usar la matriz</h3>
          <ul className={styles.tipsList}>
            <li><strong>Revisa diariamente:</strong> Dedica 5 minutos cada mañana a clasificar tus tareas.</li>
            <li><strong>Prioriza el Cuadrante 2:</strong> Las personas productivas pasan más tiempo aquí, previniendo crisis.</li>
            <li><strong>Cuestiona el Cuadrante 3:</strong> Pregúntate si realmente es urgente o solo lo parece.</li>
            <li><strong>Sé honesto con el Cuadrante 4:</strong> Reconoce qué actividades son solo distracciones.</li>
            <li><strong>Arrastra para reorganizar:</strong> Puedes mover tareas entre cuadrantes arrastrándolas.</li>
          </ul>
        </section>

        {/* ===== SECCIÓN 1: TABLA COMPARATIVA ===== */}
        <section className={styles.eduComparativaSection}>
          <h3>⚖️ Comparativa de los 4 Cuadrantes</h3>
          <p className={styles.eduComparativaSubtitle}>Guía rápida para clasificar correctamente cada tarea</p>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTablaComparativa}>
              <thead>
                <tr>
                  <th>Cuadrante</th>
                  <th>Urgencia</th>
                  <th>Importancia</th>
                  <th>Tiempo semanal ideal</th>
                  <th>¿Quién lo hace?</th>
                  <th>Ejemplo real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🔥 Hacer (C1)</td>
                  <td>Alta</td>
                  <td>Alta</td>
                  <td>20-25%</td>
                  <td>Tú ahora mismo</td>
                  <td>Entrega proyecto en 2h, avería crítica en producción</td>
                </tr>
                <tr>
                  <td>📅 Planificar (C2)</td>
                  <td>Baja</td>
                  <td>Alta</td>
                  <td>60-65%</td>
                  <td>Tú, con agenda</td>
                  <td>Formación, estrategia, ejercicio físico, relaciones clave</td>
                </tr>
                <tr>
                  <td>👥 Delegar (C3)</td>
                  <td>Alta</td>
                  <td>Baja</td>
                  <td>10-15%</td>
                  <td>Otra persona</td>
                  <td>Reunión sin valor para ti, tarea rutinaria urgente de otro</td>
                </tr>
                <tr>
                  <td>🗑️ Eliminar (C4)</td>
                  <td>Baja</td>
                  <td>Baja</td>
                  <td>Mínimo (0-5%)</td>
                  <td>Nadie (eliminar)</td>
                  <td>Scroll redes sociales, reuniones sin propósito claro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== SECCIÓN 2: CASOS DE USO POR PERFIL ===== */}
        <section className={styles.eduEscenariosSection}>
          <h3>💼 Casos de Uso por Perfil</h3>
          <p className={styles.eduEscenariosSubtitle}>Cómo aplica la Matriz Eisenhower según tu rol</p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">🚀</span>
                <h4>Emprendedor / Fundador</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                <strong>C1:</strong> Bug crítico en producción.<br />
                <strong>C2:</strong> Definir estrategia Q2, construir red de clientes clave.<br />
                <strong>C3:</strong> Gestión de redes sociales (delegar a community manager).<br />
                <strong>C4:</strong> Leer noticias no relacionadas con el negocio.
              </p>
              <p className={styles.eduEscenarioTip}>
                Por qué funciona: Los emprendedores tienden a vivir en el C1 (apagando fuegos). La Matriz les obliga a invertir en el C2 para prevenir futuras crisis.
              </p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">👔</span>
                <h4>Manager / Directivo</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                <strong>C1:</strong> Presentación al CEO en 3h, conflicto entre dos empleados.<br />
                <strong>C2:</strong> Desarrollar talento del equipo, planificación anual, relaciones con stakeholders.<br />
                <strong>C3:</strong> Responder emails urgentes de otros departamentos (delegar a asistente).<br />
                <strong>C4:</strong> Reuniones de estado sin decisiones (eliminar o reducir frecuencia).
              </p>
              <p className={styles.eduEscenarioTip}>
                Por qué funciona: Los managers efectivos pasan &gt;60% del tiempo en el C2. Su trabajo principal es prevenir crisis, no gestionarlas.
              </p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">💻</span>
                <h4>Freelance / Autónomo</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                <strong>C1:</strong> Cliente necesita cambio urgente, factura vencida hoy.<br />
                <strong>C2:</strong> Prospectar nuevos clientes, mejorar portfolio, formación técnica.<br />
                <strong>C3:</strong> Gestiones administrativas básicas (gestoría), tareas técnicas repetitivas.<br />
                <strong>C4:</strong> Revisar emails de spam, reuniones de &quot;puesta al día&quot; sin agenda.
              </p>
              <p className={styles.eduEscenarioTip}>
                Por qué funciona: Los freelancers sin equipo tienen tentación de hacer todo solos. La Matriz identifica qué externalizar para ganar tiempo facturable.
              </p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">🎓</span>
                <h4>Estudiante / Opositor</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                <strong>C1:</strong> Examen mañana, TFG con fecha límite inminente.<br />
                <strong>C2:</strong> Estudio regular, comprender conceptos difíciles, tutorías con profesores.<br />
                <strong>C3:</strong> Organizar apuntes de otros (delegar colaborativamente).<br />
                <strong>C4:</strong> Ver series entre semana de exámenes, grupos de WhatsApp de clase.
              </p>
              <p className={styles.eduEscenarioTip}>
                Por qué funciona: Los estudiantes procrastinan el C2 (estudio profundo) hasta que se convierte en C1 (pánico). La Matriz rompe ese patrón.
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 3: FAQ AMPLIADO ===== */}
        <section className={styles.eduFaqSection}>
          <h3>❓ Preguntas Frecuentes sobre la Matriz Eisenhower</h3>
          <p className={styles.eduFaqSubtitle}>Resuelve las dudas más comunes al implementar este método</p>
          <div className={styles.eduFaqList}>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo distingo entre urgente e importante?</h4>
              <p>Urgente significa que requiere atención inmediata o tiene una fecha límite próxima. Importante significa que contribuye directamente a tus objetivos a largo plazo. La confusión más común: las notificaciones del móvil se sienten urgentes pero rara vez son importantes. Un truco: pregúntate &quot;¿Qué pasa si no lo hago HOY?&quot; (urgencia) y &quot;¿Contribuye esto a mis metas del año?&quot; (importancia). 💡 Consejo: Si no sabes qué cuadrante asignar, pon la tarea en el C3 durante una semana y observa si tiene consecuencias reales.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuánto tiempo debo pasar en cada cuadrante?</h4>
              <p>Eisenhower y Covey recomiendan: C1: 20-25% (crisis inevitables), C2: 60-65% (zona de crecimiento), C3: 10-15% (lo que puedas delegar), C4: 0-5% (máximo). Si pasas &gt;40% en C1, estás en modo reactivo. Si pasas &gt;30% en C3, no estás delegando correctamente. El objetivo es migrar tareas del C1 al C2 (planificar para prevenir crisis). 💡 Consejo: Audita cómo usas el tiempo durante 1 semana anotando cada tarea y su cuadrante. Los resultados suelen ser sorprendentes.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿El Cuadrante 2 realmente puede eliminar el Cuadrante 1?</h4>
              <p>Sí, parcialmente. Muchas crisis del C1 son consecuencia de no haber planificado el C2. Ejemplo: un proyecto se convierte en crisis (C1) porque no dedicaste tiempo a planificar bien el alcance (C2). Los estudios de productividad muestran que personas que invierten en el C2 tienen un 30-40% menos de tareas en el C1. 💡 Consejo: Cada vez que gestiones una crisis del C1, anota qué acción del C2 la habría prevenido. Eso te dirá dónde invertir tiempo.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué hago si no puedo delegar (soy freelance o trabajo solo)?</h4>
              <p>El Cuadrante 3 sigue siendo útil aunque trabajes solo. &quot;Delegar&quot; puede significar: externalizar (gestoría, diseñador, asistente virtual), automatizar (herramientas como Zapier, software contable), eliminar directamente si no hay nadie a quien delegar, o agrupar tareas similares para reducir tiempo total. 💡 Consejo: Si eres freelance, el C3 identificado durante 1 mes puede revelar qué vale la pena contratar externamente. Con 2-3h/semana liberadas, se paga solo.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Con qué frecuencia debo revisar y reorganizar la matriz?</h4>
              <p>Revisión diaria (5 min): Confirma las tareas del C1 para hoy y ajusta si algo cambió. Revisión semanal (15 min): Reorganiza el C2, evalúa qué tareas del C3 pudiste delegar, elimina del C4. Revisión mensual (30 min): Evalúa patrones: ¿sigues en modo reactivo? ¿Las tareas del C2 avanzan? 💡 Consejo: El mejor momento para la revisión diaria es la noche anterior, no la mañana del día. Así empiezas el día con claridad total.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo manejo tareas que parecen cambiar de cuadrante continuamente?</h4>
              <p>Es normal. Una tarea del C2 (preparar presentación anual) se convierte en C1 si la procrastinas. Solución: asigna fechas límite artificiales a las tareas del C2, al menos 3-5 días antes del plazo real. Otra causa: interrupciones externas que aumentan artificialmente la urgencia. Aprende a decir no a peticiones del C3 disfrazadas de C1. 💡 Consejo: Si una tarea migra continuamente al C1, es señal de que no le estás asignando suficiente tiempo en el C2.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿La Matriz funciona para proyectos largos o solo para tareas diarias?</h4>
              <p>Funciona para ambos niveles. Para proyectos largos: descompón el proyecto en tareas y clasifica cada una. Las tareas de planificación, investigación y revisión pertenecen al C2. Los hitos inminentes son C1. Para planificación estratégica: las iniciativas del año van al C2 y se van desglosando semana a semana. 💡 Consejo: Usa la Matriz a dos niveles: macro (proyectos del trimestre) y micro (tareas de la semana). Asegúrate de que el tiempo dedicado a cada nivel refleja las prioridades reales.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué herramientas complementan mejor la Matriz Eisenhower?</h4>
              <p>La Matriz es un framework de clasificación, no una herramienta de gestión. Se complementa con: GTD (Getting Things Done) para capturar y procesar tareas, Notion/Trello/Asana para ejecutar el C2, Calendario bloqueado para proteger tiempo del C2, Técnica Pomodoro para ejecutar tareas del C1 sin agotamiento. 💡 Consejo: Empieza simple: papel y bolígrafo o esta herramienta digital. Añade complejidad solo cuando el sistema básico sea un hábito consolidado (mínimo 3 semanas).</p>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 4: GUÍA PASO A PASO ===== */}
        <section className={styles.eduStepSection}>
          <h3>📋 Guía: Implementa la Matriz Eisenhower</h3>
          <p className={styles.eduStepSubtitle}>6 pasos para pasar del caos al control de tu tiempo</p>
          <div className={styles.eduStepGuide}>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>1</span>
              <div className={styles.eduStepContent}>
                <h4>Vuelca TODO lo que tienes en mente</h4>
                <p>Dedica 10-15 minutos a escribir absolutamente todas las tareas pendientes sin clasificar. Proyectos, compromisos, tareas recurrentes, ideas. Este vaciado mental es el primer paso y uno de los más liberadores. No filtres ni priorices aún.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>2</span>
              <div className={styles.eduStepContent}>
                <h4>Clasifica cada tarea con una sola pregunta doble</h4>
                <p>Para cada tarea: ¿Es urgente? (¿hay consecuencias si no lo hago hoy?) + ¿Es importante? (¿contribuye a mis objetivos reales?). Si tienes dudas, asigna el cuadrante más conservador y revisa en 48h. Usa la herramienta de esta página para organizar visualmente.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>3</span>
              <div className={styles.eduStepContent}>
                <h4>Planifica tu C1 para hoy mismo</h4>
                <p>Las tareas del C1 no pueden esperar. Identifica las 3 más críticas y gestiónalas esta mañana, antes de abrir email o redes sociales. Usar la mañana para el C1 te da sensación de control el resto del día.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>4</span>
              <div className={styles.eduStepContent}>
                <h4>Bloquea tiempo sagrado para el C2</h4>
                <p>Reserva 2-3 bloques de 90 minutos semanales exclusivamente para el C2. Ponlos en el calendario como reuniones inamovibles. El C2 es la única zona donde creces: si no lo proteges activamente, siempre será desplazado por urgencias.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>5</span>
              <div className={styles.eduStepContent}>
                <h4>Delega o automatiza el C3 esta semana</h4>
                <p>Elige 2-3 tareas del C3 y delégalas, automatízalas o agrúpalas. Si tardas más en explicar la tarea que en hacerla tú mismo, primero crea un proceso estándar (SOP) y luego delega. La primera delegación siempre toma más tiempo, pero escala.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>6</span>
              <div className={styles.eduStepContent}>
                <h4>Elimina el C4 sin culpa</h4>
                <p>Las tareas del C4 no deben estar en tu sistema. Elimínalas de la lista, desactiva notificaciones que las generan, y establece límites de tiempo para actividades de ocio. No es productivo estar disponible 24/7: el descanso real va aquí también, pero de forma intencionada.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 5: MEJORES PRÁCTICAS ===== */}
        <section className={styles.eduTipsSection}>
          <h3>✅ 6 Hábitos del Gestor de Tiempo Eficaz</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">🧠</span>
              <h4>El C2 es tu zona de crecimiento</h4>
              <p>El 80% de las personas exitosas tienen en común una cosa: protegen activamente el tiempo del Cuadrante 2 cada semana.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">📵</span>
              <h4>Apaga las notificaciones del C4</h4>
              <p>Cada notificación de redes sociales o app no crítica es una interrupción del C2. Configura el modo &quot;No molestar&quot; durante bloques de trabajo profundo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">🗓️</span>
              <h4>Time-blocking para el C2</h4>
              <p>Sin bloques reservados en el calendario, el C2 nunca ocurre. Trata esos bloques como una reunión con tu mejor cliente: inamovibles.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">🤝</span>
              <h4>Delega proceso, no solo tarea</h4>
              <p>Al delegar C3, no solo delegues la tarea: documenta el proceso. Así la próxima vez requiere cero intervención tuya.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">✋</span>
              <h4>Aprende a decir no al C3 ajeno</h4>
              <p>Muchas tareas del C3 vienen de urgencias de otros que no son tus responsabilidades reales. &quot;Ahora mismo no puedo&quot; es una respuesta válida.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">📊</span>
              <h4>Mide tu distribución de tiempo</h4>
              <p>Una vez al mes, calcula el % de tiempo en cada cuadrante. Si el C1 supera el 30%, algo estructural necesita cambiar.</p>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 6: WARNING BOX - ERRORES COMUNES ===== */}
        <div className={styles.eduWarningBox} role="alert">
          <div className={styles.eduWarningHeader}>
            <span className={styles.eduWarningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores que Convierten la Matriz en un Sistema Inútil</h3>
          </div>
          <ul className={styles.eduWarningList}>
            <li><strong>Poner TODO en el Cuadrante 1:</strong> Si tienes más de 5-7 tareas en el C1, estás sobre-clasificando. El C1 real debe ser el 20-25% de tus tareas. Si todo parece urgente e importante, nada lo es realmente.</li>
            <li><strong>Ignorar el Cuadrante 2 por falta de tiempo:</strong> La paradoja del C2: nunca hay tiempo para él porque no haces el C2. Romper este ciclo requiere reservar tiempo aunque parezca &quot;mal momento&quot;. Siempre lo es.</li>
            <li><strong>No revisar la matriz regularmente:</strong> Una matriz estática pierde valor en 48h. Las prioridades cambian constantemente. Sin revisión diaria (5 min), la herramienta se convierte en lista de tareas desordenada.</li>
            <li><strong>Confundir lo urgente de otros con lo urgente propio:</strong> Los WhatsApps, emails y llamadas urgentes de compañeros suelen ser urgencias del C3 (urgente para ellos, no importante para ti). Aprende a filtrar antes de reaccionar.</li>
            <li><strong>Usar la matriz para listas de compras:</strong> La Matriz Eisenhower es para tareas con implicaciones en tus objetivos vitales/profesionales. Para gestión cotidiana (hacer la compra, recoger a los niños), usa una simple lista to-do.</li>
            <li><strong>Abandonar tras la primera semana:</strong> Los beneficios de la Matriz se acumulan con el tiempo. Las primeras 2 semanas son las más difíciles (cambio de hábito). Los estudios de productividad muestran que se necesitan 21-66 días para que un nuevo sistema de gestión de tiempo se automatice.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('matriz-eisenhower')} />
      <ShareCard appName="matriz-eisenhower" />
      <Footer appName="matriz-eisenhower" />
    </div>
  );
}
