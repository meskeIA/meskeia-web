'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './GeneradorActas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Asistente {
  id: string;
  nombre: string;
  cargo: string;
  presente: boolean;
}

interface PuntoOrdenDia {
  id: string;
  titulo: string;
  descripcion: string;
  desarrollo: string;
  acuerdos: string;
}

interface Tarea {
  id: string;
  descripcion: string;
  responsable: string;
  fechaLimite: string;
  prioridad: 'alta' | 'media' | 'baja';
}

interface Acta {
  id: string;
  tipo: string;
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  convocante: string;
  secretario: string;
  asistentes: Asistente[];
  puntosOrdenDia: PuntoOrdenDia[];
  tareas: Tarea[];
  observaciones: string;
  proximaReunion: string;
  createdAt: string;
}

type Step = 'info' | 'asistentes' | 'orden' | 'tareas' | 'preview';

// Plantillas predefinidas
const PLANTILLAS = [
  { id: 'equipo', nombre: 'Reunión de Equipo', icon: '👥' },
  { id: 'junta', nombre: 'Junta Directiva', icon: '🏛️' },
  { id: 'comite', nombre: 'Comité', icon: '📋' },
  { id: 'kickoff', nombre: 'Kick-off Proyecto', icon: '🚀' },
  { id: 'seguimiento', nombre: 'Seguimiento de Proyecto', icon: '📊' },
  { id: 'cliente', nombre: 'Reunión con Cliente', icon: '🤝' },
];

const STORAGE_KEY = 'meskeia_actas_drafts';
const HISTORY_KEY = 'meskeia_actas_history';

// Generar ID único
const generateId = () => Math.random().toString(36).substring(2, 11);

// Formatear fecha para mostrar
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function GeneradorActasPage() {
  // Estado del acta actual
  const [acta, setActa] = useState<Acta>({
    id: generateId(),
    tipo: 'equipo',
    titulo: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    horaFin: '10:00',
    lugar: '',
    modalidad: 'presencial',
    convocante: '',
    secretario: '',
    asistentes: [],
    puntosOrdenDia: [],
    tareas: [],
    observaciones: '',
    proximaReunion: '',
    createdAt: new Date().toISOString(),
  });

  // Estado de la UI
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [drafts, setDrafts] = useState<Acta[]>([]);
  const [history, setHistory] = useState<Acta[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Refs
  const printRef = useRef<HTMLDivElement>(null);

  // Cargar datos del localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);

    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error('Error al cargar borradores:', e);
      }
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error al cargar historial:', e);
      }
    }
  }, []);

  // Guardar borrador
  const saveDraft = () => {
    const updatedDrafts = drafts.filter(d => d.id !== acta.id);
    const newDrafts = [{ ...acta, createdAt: new Date().toISOString() }, ...updatedDrafts].slice(0, 10);
    setDrafts(newDrafts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDrafts));
    alert('Borrador guardado correctamente');
  };

  // Cargar borrador
  const loadDraft = (draft: Acta) => {
    setActa(draft);
    setShowDrafts(false);
    setCurrentStep('info');
  };

  // Eliminar borrador
  const deleteDraft = (id: string) => {
    const newDrafts = drafts.filter(d => d.id !== id);
    setDrafts(newDrafts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDrafts));
  };

  // Guardar en historial
  const saveToHistory = () => {
    const newHistory = [{ ...acta, createdAt: new Date().toISOString() }, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // Cargar desde historial
  const loadFromHistory = (item: Acta) => {
    setActa({ ...item, id: generateId(), createdAt: new Date().toISOString() });
    setShowHistory(false);
    setCurrentStep('info');
  };

  // Nueva acta
  const newActa = () => {
    setActa({
      id: generateId(),
      tipo: 'equipo',
      titulo: '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFin: '10:00',
      lugar: '',
      modalidad: 'presencial',
      convocante: '',
      secretario: '',
      asistentes: [],
      puntosOrdenDia: [],
      tareas: [],
      observaciones: '',
      proximaReunion: '',
      createdAt: new Date().toISOString(),
    });
    setCurrentStep('info');
  };

  // Añadir asistente
  const addAsistente = () => {
    setActa({
      ...acta,
      asistentes: [
        ...acta.asistentes,
        { id: generateId(), nombre: '', cargo: '', presente: true }
      ]
    });
  };

  // Actualizar asistente
  const updateAsistente = (id: string, field: keyof Asistente, value: string | boolean) => {
    setActa({
      ...acta,
      asistentes: acta.asistentes.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    });
  };

  // Eliminar asistente
  const removeAsistente = (id: string) => {
    setActa({
      ...acta,
      asistentes: acta.asistentes.filter(a => a.id !== id)
    });
  };

  // Añadir punto del orden del día
  const addPuntoOrdenDia = () => {
    setActa({
      ...acta,
      puntosOrdenDia: [
        ...acta.puntosOrdenDia,
        { id: generateId(), titulo: '', descripcion: '', desarrollo: '', acuerdos: '' }
      ]
    });
  };

  // Actualizar punto del orden del día
  const updatePuntoOrdenDia = (id: string, field: keyof PuntoOrdenDia, value: string) => {
    setActa({
      ...acta,
      puntosOrdenDia: acta.puntosOrdenDia.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  // Eliminar punto del orden del día
  const removePuntoOrdenDia = (id: string) => {
    setActa({
      ...acta,
      puntosOrdenDia: acta.puntosOrdenDia.filter(p => p.id !== id)
    });
  };

  // Añadir tarea
  const addTarea = () => {
    setActa({
      ...acta,
      tareas: [
        ...acta.tareas,
        { id: generateId(), descripcion: '', responsable: '', fechaLimite: '', prioridad: 'media' }
      ]
    });
  };

  // Actualizar tarea
  const updateTarea = (id: string, field: keyof Tarea, value: string) => {
    setActa({
      ...acta,
      tareas: acta.tareas.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    });
  };

  // Eliminar tarea
  const removeTarea = (id: string) => {
    setActa({
      ...acta,
      tareas: acta.tareas.filter(t => t.id !== id)
    });
  };

  // Imprimir / Exportar PDF
  const handlePrint = () => {
    saveToHistory();
    window.print();
  };

  // Obtener plantilla actual
  const currentTemplate = PLANTILLAS.find(p => p.id === acta.tipo) || PLANTILLAS[0];

  // Pasos del formulario
  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'info', label: 'Información', icon: '📝' },
    { id: 'asistentes', label: 'Asistentes', icon: '👥' },
    { id: 'orden', label: 'Orden del Día', icon: '📋' },
    { id: 'tareas', label: 'Tareas', icon: '✅' },
    { id: 'preview', label: 'Vista Previa', icon: '👁️' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section - Solo visible en pantalla */}
      <header className={`${styles.hero} ${styles.noPrint}`}>
        <span className={styles.heroIcon}>📋</span>
        <h1 className={styles.title}>Generador de Actas de Reunión</h1>
        <p className={styles.subtitle}>
          Crea actas profesionales con plantillas predefinidas, gestión de asistentes y seguimiento de tareas
        </p>
      </header>

      {/* Barra de acciones - Solo visible en pantalla */}
      <div className={`${styles.actionsBar} ${styles.noPrint}`}>
        <div className={styles.actionsLeft}>
          <button onClick={newActa} className={styles.btnAction}>
            ➕ Nueva Acta
          </button>
          <button onClick={saveDraft} className={styles.btnAction}>
            💾 Guardar Borrador
          </button>
        </div>
        <div className={styles.actionsRight}>
          <button
            onClick={() => setShowDrafts(!showDrafts)}
            className={`${styles.btnAction} ${showDrafts ? styles.active : ''}`}
          >
            📁 Borradores ({drafts.length})
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`${styles.btnAction} ${showHistory ? styles.active : ''}`}
          >
            📜 Historial ({history.length})
          </button>
        </div>
      </div>

      {/* Panel de borradores */}
      {showDrafts && (
        <div className={`${styles.draftsPanel} ${styles.noPrint}`}>
          <h3>📁 Borradores guardados</h3>
          {drafts.length === 0 ? (
            <p className={styles.emptyMessage}>No hay borradores guardados</p>
          ) : (
            <div className={styles.draftsList}>
              {drafts.map(draft => (
                <div key={draft.id} className={styles.draftItem}>
                  <div className={styles.draftInfo}>
                    <strong>{draft.titulo || 'Sin título'}</strong>
                    <span>{formatDate(draft.fecha)}</span>
                  </div>
                  <div className={styles.draftActions}>
                    <button onClick={() => loadDraft(draft)} className={styles.btnSmall}>
                      Cargar
                    </button>
                    <button onClick={() => deleteDraft(draft.id)} className={styles.btnSmallDanger}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel de historial */}
      {showHistory && (
        <div className={`${styles.draftsPanel} ${styles.noPrint}`}>
          <h3>📜 Actas generadas anteriormente</h3>
          {history.length === 0 ? (
            <p className={styles.emptyMessage}>No hay actas en el historial</p>
          ) : (
            <div className={styles.draftsList}>
              {history.map(item => (
                <div key={item.id} className={styles.draftItem}>
                  <div className={styles.draftInfo}>
                    <strong>{item.titulo || 'Sin título'}</strong>
                    <span>{formatDate(item.fecha)}</span>
                  </div>
                  <div className={styles.draftActions}>
                    <button onClick={() => loadFromHistory(item)} className={styles.btnSmall}>
                      Reutilizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Steps - Solo visible en pantalla cuando NO es preview */}
      {currentStep !== 'preview' && (
        <div className={`${styles.stepsContainer} ${styles.noPrint}`}>
          {steps.map((step, index) => (
            <button
              key={step.id}
              className={`${styles.stepButton} ${currentStep === step.id ? styles.stepActive : ''} ${index < currentStepIndex ? styles.stepCompleted : ''}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <span className={styles.stepIcon}>{step.icon}</span>
              <span className={styles.stepLabel}>{step.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* PASO 1: Información General */}
        {currentStep === 'info' && (
          <div className={`${styles.formSection} ${styles.noPrint}`}>
            <h2 className={styles.sectionTitle}>📝 Información de la Reunión</h2>

            {/* Selección de plantilla */}
            <div className={styles.templateSelector}>
              <label className={styles.label}>Tipo de reunión</label>
              <div className={styles.templateGrid}>
                {PLANTILLAS.map(plantilla => (
                  <button
                    key={plantilla.id}
                    className={`${styles.templateCard} ${acta.tipo === plantilla.id ? styles.templateActive : ''}`}
                    onClick={() => setActa({ ...acta, tipo: plantilla.id })}
                  >
                    <span className={styles.templateIcon}>{plantilla.icon}</span>
                    <span className={styles.templateName}>{plantilla.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Título del acta *</label>
                <input
                  type="text"
                  value={acta.titulo}
                  onChange={(e) => setActa({ ...acta, titulo: e.target.value })}
                  placeholder={`Acta de ${currentTemplate.nombre}`}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Fecha *</label>
                <input
                  type="date"
                  value={acta.fecha}
                  onChange={(e) => setActa({ ...acta, fecha: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Hora de inicio</label>
                <input
                  type="time"
                  value={acta.horaInicio}
                  onChange={(e) => setActa({ ...acta, horaInicio: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Hora de fin</label>
                <input
                  type="time"
                  value={acta.horaFin}
                  onChange={(e) => setActa({ ...acta, horaFin: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Lugar / Enlace</label>
                <input
                  type="text"
                  value={acta.lugar}
                  onChange={(e) => setActa({ ...acta, lugar: e.target.value })}
                  placeholder="Sala de reuniones / URL de videollamada"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Modalidad</label>
                <select
                  value={acta.modalidad}
                  onChange={(e) => setActa({ ...acta, modalidad: e.target.value as 'presencial' | 'virtual' | 'hibrida' })}
                  className={styles.select}
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrida">Híbrida</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Convocante</label>
                <input
                  type="text"
                  value={acta.convocante}
                  onChange={(e) => setActa({ ...acta, convocante: e.target.value })}
                  placeholder="Nombre del convocante"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Secretario/a (redactor del acta)</label>
                <input
                  type="text"
                  value={acta.secretario}
                  onChange={(e) => setActa({ ...acta, secretario: e.target.value })}
                  placeholder="Nombre del secretario"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.navigationButtons}>
              <div></div>
              <button onClick={() => setCurrentStep('asistentes')} className={styles.btnPrimary}>
                Siguiente: Asistentes →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Asistentes */}
        {currentStep === 'asistentes' && (
          <div className={`${styles.formSection} ${styles.noPrint}`}>
            <h2 className={styles.sectionTitle}>👥 Asistentes a la Reunión</h2>

            <div className={styles.asistentesHeader}>
              <p className={styles.helperText}>
                Añade los participantes de la reunión. Marca como "Ausente" a quienes fueron convocados pero no asistieron.
              </p>
              <button onClick={addAsistente} className={styles.btnAdd}>
                ➕ Añadir Asistente
              </button>
            </div>

            {acta.asistentes.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>👤</span>
                <p>No hay asistentes añadidos</p>
                <button onClick={addAsistente} className={styles.btnPrimary}>
                  Añadir primer asistente
                </button>
              </div>
            ) : (
              <div className={styles.asistentesList}>
                {acta.asistentes.map((asistente, index) => (
                  <div key={asistente.id} className={styles.asistenteCard}>
                    <div className={styles.asistenteNumber}>{index + 1}</div>
                    <div className={styles.asistenteFields}>
                      <input
                        type="text"
                        value={asistente.nombre}
                        onChange={(e) => updateAsistente(asistente.id, 'nombre', e.target.value)}
                        placeholder="Nombre completo"
                        className={styles.input}
                      />
                      <input
                        type="text"
                        value={asistente.cargo}
                        onChange={(e) => updateAsistente(asistente.id, 'cargo', e.target.value)}
                        placeholder="Cargo / Rol"
                        className={styles.input}
                      />
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={asistente.presente}
                          onChange={(e) => updateAsistente(asistente.id, 'presente', e.target.checked)}
                          className={styles.checkbox}
                        />
                        <span className={asistente.presente ? styles.presente : styles.ausente}>
                          {asistente.presente ? '✅ Presente' : '❌ Ausente'}
                        </span>
                      </label>
                    </div>
                    <button
                      onClick={() => removeAsistente(asistente.id)}
                      className={styles.btnRemove}
                      title="Eliminar asistente"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.navigationButtons}>
              <button onClick={() => setCurrentStep('info')} className={styles.btnSecondary}>
                ← Anterior
              </button>
              <button onClick={() => setCurrentStep('orden')} className={styles.btnPrimary}>
                Siguiente: Orden del Día →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Orden del Día */}
        {currentStep === 'orden' && (
          <div className={`${styles.formSection} ${styles.noPrint}`}>
            <h2 className={styles.sectionTitle}>📋 Orden del Día</h2>

            <div className={styles.asistentesHeader}>
              <p className={styles.helperText}>
                Define los puntos tratados en la reunión. Incluye el desarrollo de cada punto y los acuerdos alcanzados.
              </p>
              <button onClick={addPuntoOrdenDia} className={styles.btnAdd}>
                ➕ Añadir Punto
              </button>
            </div>

            {acta.puntosOrdenDia.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📝</span>
                <p>No hay puntos en el orden del día</p>
                <button onClick={addPuntoOrdenDia} className={styles.btnPrimary}>
                  Añadir primer punto
                </button>
              </div>
            ) : (
              <div className={styles.puntosList}>
                {acta.puntosOrdenDia.map((punto, index) => (
                  <div key={punto.id} className={styles.puntoCard}>
                    <div className={styles.puntoHeader}>
                      <span className={styles.puntoNumber}>Punto {index + 1}</span>
                      <button
                        onClick={() => removePuntoOrdenDia(punto.id)}
                        className={styles.btnRemove}
                        title="Eliminar punto"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className={styles.puntoFields}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Título del punto *</label>
                        <input
                          type="text"
                          value={punto.titulo}
                          onChange={(e) => updatePuntoOrdenDia(punto.id, 'titulo', e.target.value)}
                          placeholder="Ej: Revisión de objetivos del trimestre"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Descripción breve</label>
                        <input
                          type="text"
                          value={punto.descripcion}
                          onChange={(e) => updatePuntoOrdenDia(punto.id, 'descripcion', e.target.value)}
                          placeholder="Breve descripción del tema"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Desarrollo / Discusión</label>
                        <textarea
                          value={punto.desarrollo}
                          onChange={(e) => updatePuntoOrdenDia(punto.id, 'desarrollo', e.target.value)}
                          placeholder="Resumen de lo tratado, intervenciones relevantes..."
                          className={styles.textarea}
                          rows={3}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Acuerdos / Decisiones</label>
                        <textarea
                          value={punto.acuerdos}
                          onChange={(e) => updatePuntoOrdenDia(punto.id, 'acuerdos', e.target.value)}
                          placeholder="Decisiones tomadas, acuerdos alcanzados..."
                          className={styles.textarea}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.navigationButtons}>
              <button onClick={() => setCurrentStep('asistentes')} className={styles.btnSecondary}>
                ← Anterior
              </button>
              <button onClick={() => setCurrentStep('tareas')} className={styles.btnPrimary}>
                Siguiente: Tareas →
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: Tareas */}
        {currentStep === 'tareas' && (
          <div className={`${styles.formSection} ${styles.noPrint}`}>
            <h2 className={styles.sectionTitle}>✅ Tareas y Acciones</h2>

            <div className={styles.asistentesHeader}>
              <p className={styles.helperText}>
                Define las tareas asignadas durante la reunión con responsable y fecha límite.
              </p>
              <button onClick={addTarea} className={styles.btnAdd}>
                ➕ Añadir Tarea
              </button>
            </div>

            {acta.tareas.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>✅</span>
                <p>No hay tareas asignadas</p>
                <button onClick={addTarea} className={styles.btnPrimary}>
                  Añadir primera tarea
                </button>
              </div>
            ) : (
              <div className={styles.tareasList}>
                {acta.tareas.map((tarea, index) => (
                  <div key={tarea.id} className={styles.tareaCard}>
                    <div className={styles.tareaHeader}>
                      <span className={styles.tareaNumber}>Tarea {index + 1}</span>
                      <button
                        onClick={() => removeTarea(tarea.id)}
                        className={styles.btnRemove}
                        title="Eliminar tarea"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className={styles.tareaFields}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Descripción de la tarea *</label>
                        <textarea
                          value={tarea.descripcion}
                          onChange={(e) => updateTarea(tarea.id, 'descripcion', e.target.value)}
                          placeholder="Descripción detallada de la tarea..."
                          className={styles.textarea}
                          rows={2}
                        />
                      </div>
                      <div className={styles.tareaRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Responsable</label>
                          <input
                            type="text"
                            value={tarea.responsable}
                            onChange={(e) => updateTarea(tarea.id, 'responsable', e.target.value)}
                            placeholder="Nombre del responsable"
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Fecha límite</label>
                          <input
                            type="date"
                            value={tarea.fechaLimite}
                            onChange={(e) => updateTarea(tarea.id, 'fechaLimite', e.target.value)}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Prioridad</label>
                          <select
                            value={tarea.prioridad}
                            onChange={(e) => updateTarea(tarea.id, 'prioridad', e.target.value)}
                            className={styles.select}
                          >
                            <option value="alta">🔴 Alta</option>
                            <option value="media">🟡 Media</option>
                            <option value="baja">🟢 Baja</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Observaciones y próxima reunión */}
            <div className={styles.extraFields}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Observaciones generales</label>
                <textarea
                  value={acta.observaciones}
                  onChange={(e) => setActa({ ...acta, observaciones: e.target.value })}
                  placeholder="Notas adicionales, comentarios..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Próxima reunión (fecha/hora tentativa)</label>
                <input
                  type="text"
                  value={acta.proximaReunion}
                  onChange={(e) => setActa({ ...acta, proximaReunion: e.target.value })}
                  placeholder="Ej: Jueves 25 de enero a las 10:00"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.navigationButtons}>
              <button onClick={() => setCurrentStep('orden')} className={styles.btnSecondary}>
                ← Anterior
              </button>
              <button onClick={() => setCurrentStep('preview')} className={styles.btnPrimary}>
                Ver Vista Previa 👁️
              </button>
            </div>
          </div>
        )}

        {/* PASO 5: Vista Previa / Impresión */}
        {currentStep === 'preview' && (
          <>
            {/* Botones de acción - Solo visibles en pantalla */}
            <div className={`${styles.previewActions} ${styles.noPrint}`}>
              <button onClick={() => setCurrentStep('tareas')} className={styles.btnSecondary}>
                ← Volver a editar
              </button>
              <button onClick={handlePrint} className={styles.btnPrimary}>
                🖨️ Imprimir / Exportar PDF
              </button>
            </div>

            {/* Documento del acta - Visible en impresión */}
            <div className={styles.actaDocument} ref={printRef}>
              {/* Cabecera del acta */}
              <header className={styles.actaHeader}>
                <div className={styles.actaLogo}>
                  <span className={styles.actaLogoIcon}>{currentTemplate.icon}</span>
                </div>
                <h1 className={styles.actaTitle}>
                  {acta.titulo || `Acta de ${currentTemplate.nombre}`}
                </h1>
                <p className={styles.actaSubtitle}>{currentTemplate.nombre}</p>
              </header>

              {/* Información general */}
              <section className={styles.actaSection}>
                <h2 className={styles.actaSectionTitle}>📌 Información de la Reunión</h2>
                <div className={styles.actaInfoGrid}>
                  <div className={styles.actaInfoItem}>
                    <strong>Fecha:</strong>
                    <span>{formatDate(acta.fecha)}</span>
                  </div>
                  <div className={styles.actaInfoItem}>
                    <strong>Horario:</strong>
                    <span>{acta.horaInicio} - {acta.horaFin}</span>
                  </div>
                  <div className={styles.actaInfoItem}>
                    <strong>Lugar:</strong>
                    <span>{acta.lugar || 'No especificado'}</span>
                  </div>
                  <div className={styles.actaInfoItem}>
                    <strong>Modalidad:</strong>
                    <span style={{ textTransform: 'capitalize' }}>{acta.modalidad}</span>
                  </div>
                  {acta.convocante && (
                    <div className={styles.actaInfoItem}>
                      <strong>Convocante:</strong>
                      <span>{acta.convocante}</span>
                    </div>
                  )}
                  {acta.secretario && (
                    <div className={styles.actaInfoItem}>
                      <strong>Secretario/a:</strong>
                      <span>{acta.secretario}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Asistentes */}
              {acta.asistentes.length > 0 && (
                <section className={styles.actaSection}>
                  <h2 className={styles.actaSectionTitle}>👥 Asistentes</h2>
                  <table className={styles.actaTable}>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Cargo / Rol</th>
                        <th>Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acta.asistentes.map(asistente => (
                        <tr key={asistente.id}>
                          <td>{asistente.nombre || '-'}</td>
                          <td>{asistente.cargo || '-'}</td>
                          <td className={asistente.presente ? styles.presente : styles.ausente}>
                            {asistente.presente ? '✅ Presente' : '❌ Ausente'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Orden del día */}
              {acta.puntosOrdenDia.length > 0 && (
                <section className={styles.actaSection}>
                  <h2 className={styles.actaSectionTitle}>📋 Orden del Día</h2>
                  {acta.puntosOrdenDia.map((punto, index) => (
                    <div key={punto.id} className={styles.actaPunto}>
                      <h3 className={styles.actaPuntoTitle}>
                        {index + 1}. {punto.titulo || 'Sin título'}
                      </h3>
                      {punto.descripcion && (
                        <p className={styles.actaPuntoDesc}>{punto.descripcion}</p>
                      )}
                      {punto.desarrollo && (
                        <div className={styles.actaPuntoContent}>
                          <strong>Desarrollo:</strong>
                          <p>{punto.desarrollo}</p>
                        </div>
                      )}
                      {punto.acuerdos && (
                        <div className={styles.actaPuntoContent}>
                          <strong>Acuerdos:</strong>
                          <p>{punto.acuerdos}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Tareas */}
              {acta.tareas.length > 0 && (
                <section className={styles.actaSection}>
                  <h2 className={styles.actaSectionTitle}>✅ Tareas Asignadas</h2>
                  <table className={styles.actaTable}>
                    <thead>
                      <tr>
                        <th>Tarea</th>
                        <th>Responsable</th>
                        <th>Fecha Límite</th>
                        <th>Prioridad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acta.tareas.map(tarea => (
                        <tr key={tarea.id}>
                          <td>{tarea.descripcion || '-'}</td>
                          <td>{tarea.responsable || '-'}</td>
                          <td>{tarea.fechaLimite ? formatDate(tarea.fechaLimite) : '-'}</td>
                          <td className={styles[`prioridad${tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}`]}>
                            {tarea.prioridad === 'alta' ? '🔴 Alta' : tarea.prioridad === 'media' ? '🟡 Media' : '🟢 Baja'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Observaciones */}
              {acta.observaciones && (
                <section className={styles.actaSection}>
                  <h2 className={styles.actaSectionTitle}>📝 Observaciones</h2>
                  <p className={styles.actaObservaciones}>{acta.observaciones}</p>
                </section>
              )}

              {/* Próxima reunión */}
              {acta.proximaReunion && (
                <section className={styles.actaSection}>
                  <h2 className={styles.actaSectionTitle}>📅 Próxima Reunión</h2>
                  <p className={styles.actaProxima}>{acta.proximaReunion}</p>
                </section>
              )}

              {/* Pie del acta */}
              <footer className={styles.actaFooter}>
                <div className={styles.actaSignatures}>
                  {acta.convocante && (
                    <div className={styles.actaSignature}>
                      <div className={styles.signatureLine}></div>
                      <p>{acta.convocante}</p>
                      <small>Convocante</small>
                    </div>
                  )}
                  {acta.secretario && (
                    <div className={styles.actaSignature}>
                      <div className={styles.signatureLine}></div>
                      <p>{acta.secretario}</p>
                      <small>Secretario/a</small>
                    </div>
                  )}
                </div>
                <p className={styles.actaGeneratedBy}>
                  Acta generada con meskeIA - {new Date().toLocaleDateString('es-ES')}
                </p>
              </footer>
            </div>
          </>
        )}
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre actas de reunión?"
        subtitle="Descubre cómo redactar actas efectivas y gestionar reuniones productivas"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es un Acta de Reunión?</h2>
          <p className={styles.introParagraph}>
            Un acta de reunión es un documento formal que recoge los puntos tratados,
            las decisiones tomadas y las tareas asignadas durante una reunión. Sirve como
            registro oficial y herramienta de seguimiento para todos los participantes.
          </p>

          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>📋</span>
              <h4>Registro Oficial</h4>
              <p>Documenta formalmente lo acordado para futuras referencias y seguimiento.</p>
            </div>
            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>✅</span>
              <h4>Seguimiento de Tareas</h4>
              <p>Permite dar seguimiento a las acciones asignadas con responsables y plazos.</p>
            </div>
            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>🤝</span>
              <h4>Compromiso</h4>
              <p>Genera compromiso al dejar por escrito las responsabilidades de cada participante.</p>
            </div>
            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>📊</span>
              <h4>Transparencia</h4>
              <p>Mantiene informados a quienes no pudieron asistir sobre lo tratado.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Estructura de un Acta Efectiva</h2>
          <div className={styles.structureList}>
            <div className={styles.structureItem}>
              <span className={styles.structureNumber}>1</span>
              <div>
                <h4>Encabezado</h4>
                <p>Tipo de reunión, fecha, hora, lugar, convocante y asistentes.</p>
              </div>
            </div>
            <div className={styles.structureItem}>
              <span className={styles.structureNumber}>2</span>
              <div>
                <h4>Orden del Día</h4>
                <p>Lista de temas a tratar, idealmente definidos antes de la reunión.</p>
              </div>
            </div>
            <div className={styles.structureItem}>
              <span className={styles.structureNumber}>3</span>
              <div>
                <h4>Desarrollo</h4>
                <p>Resumen de lo discutido en cada punto, sin transcribir palabra por palabra.</p>
              </div>
            </div>
            <div className={styles.structureItem}>
              <span className={styles.structureNumber}>4</span>
              <div>
                <h4>Acuerdos y Decisiones</h4>
                <p>Conclusiones claras de cada punto tratado.</p>
              </div>
            </div>
            <div className={styles.structureItem}>
              <span className={styles.structureNumber}>5</span>
              <div>
                <h4>Tareas</h4>
                <p>Acciones a realizar con responsable, fecha límite y prioridad.</p>
              </div>
            </div>
            <div className={styles.structureItem}>
              <span className={styles.structureNumber}>6</span>
              <div>
                <h4>Próxima Reunión</h4>
                <p>Fecha tentativa para dar seguimiento a los temas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos para Reuniones Productivas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <h4>⏰ Define duración máxima</h4>
              <p>Las reuniones más efectivas duran entre 30 y 60 minutos. Respeta el tiempo de todos.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>📝 Envía agenda previa</h4>
              <p>Comparte el orden del día antes de la reunión para que los asistentes se preparen.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>🎯 Un tema, una decisión</h4>
              <p>Cada punto debe terminar con una decisión clara o una tarea asignada.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>📤 Envía el acta en 24h</h4>
              <p>Distribuye el acta rápidamente mientras la información está fresca.</p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-actas')} />

      <Footer appName="generador-actas" />
    </div>
  );
}
