'use client';

import { useState, useEffect } from 'react';
import styles from './MatrizEisenhower.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('matriz-eisenhower')} />
      <Footer appName="matriz-eisenhower" />
    </div>
  );
}
