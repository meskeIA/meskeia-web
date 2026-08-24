'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './GeneradorActas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatDate as formatDateCorto } from '@/lib';

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

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="generador-actas-disclaimer"
      />

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
          <button type="button" onClick={newActa} className={styles.btnAction}>
            <span aria-hidden="true">➕</span> Nueva Acta
          </button>
          <button type="button" onClick={saveDraft} className={styles.btnAction}>
            <span aria-hidden="true">💾</span> Guardar Borrador
          </button>
        </div>
        <div className={styles.actionsRight}>
          <button
            type="button"
            onClick={() => setShowDrafts(!showDrafts)}
            className={`${styles.btnAction} ${showDrafts ? styles.active : ''}`}
            aria-pressed={showDrafts}
          >
            <span aria-hidden="true">📁</span> Borradores ({drafts.length})
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`${styles.btnAction} ${showHistory ? styles.active : ''}`}
            aria-pressed={showHistory}
          >
            <span aria-hidden="true">📜</span> Historial ({history.length})
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
                    <button type="button" onClick={() => loadDraft(draft)} className={styles.btnSmall}>
                      Cargar
                    </button>
                    <button type="button" onClick={() => deleteDraft(draft.id)} className={styles.btnSmallDanger}>
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
                    <button type="button" onClick={() => loadFromHistory(item)} className={styles.btnSmall}>
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
              type="button"
              className={`${styles.stepButton} ${currentStep === step.id ? styles.stepActive : ''} ${index < currentStepIndex ? styles.stepCompleted : ''}`}
              onClick={() => setCurrentStep(step.id)}
              aria-pressed={currentStep === step.id}
            >
              <span className={styles.stepIcon} aria-hidden="true">{step.icon}</span>
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
                    type="button"
                    className={`${styles.templateCard} ${acta.tipo === plantilla.id ? styles.templateActive : ''}`}
                    onClick={() => setActa({ ...acta, tipo: plantilla.id })}
                    aria-pressed={acta.tipo === plantilla.id}
                  >
                    <span className={styles.templateIcon} aria-hidden="true">{plantilla.icon}</span>
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
              <button type="button" onClick={() => setCurrentStep('asistentes')} className={styles.btnPrimary}>
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
              <button type="button" onClick={addAsistente} className={styles.btnAdd}>
                <span aria-hidden="true">➕</span> Añadir Asistente
              </button>
            </div>

            {acta.asistentes.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>👤</span>
                <p>No hay asistentes añadidos</p>
                <button type="button" onClick={addAsistente} className={styles.btnPrimary}>
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
                      type="button"
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
              <button type="button" onClick={() => setCurrentStep('info')} className={styles.btnSecondary}>
                ← Anterior
              </button>
              <button type="button" onClick={() => setCurrentStep('orden')} className={styles.btnPrimary}>
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
              <button type="button" onClick={addPuntoOrdenDia} className={styles.btnAdd}>
                <span aria-hidden="true">➕</span> Añadir Punto
              </button>
            </div>

            {acta.puntosOrdenDia.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📝</span>
                <p>No hay puntos en el orden del día</p>
                <button type="button" onClick={addPuntoOrdenDia} className={styles.btnPrimary}>
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
                        type="button"
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
              <button type="button" onClick={() => setCurrentStep('asistentes')} className={styles.btnSecondary}>
                ← Anterior
              </button>
              <button type="button" onClick={() => setCurrentStep('tareas')} className={styles.btnPrimary}>
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
              <button type="button" onClick={addTarea} className={styles.btnAdd}>
                <span aria-hidden="true">➕</span> Añadir Tarea
              </button>
            </div>

            {acta.tareas.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>✅</span>
                <p>No hay tareas asignadas</p>
                <button type="button" onClick={addTarea} className={styles.btnPrimary}>
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
                        type="button"
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
              <button type="button" onClick={() => setCurrentStep('orden')} className={styles.btnSecondary}>
                ← Anterior
              </button>
              <button type="button" onClick={() => setCurrentStep('preview')} className={styles.btnPrimary}>
                Ver Vista Previa <span aria-hidden="true">👁️</span>
              </button>
            </div>
          </div>
        )}

        {/* PASO 5: Vista Previa / Impresión */}
        {currentStep === 'preview' && (
          <>
            {/* Botones de acción - Solo visibles en pantalla */}
            <div className={`${styles.previewActions} ${styles.noPrint}`}>
              <button type="button" onClick={() => setCurrentStep('tareas')} className={styles.btnSecondary}>
                ← Volver a editar
              </button>
              <button type="button" onClick={handlePrint} className={styles.btnPrimary}>
                <span aria-hidden="true">🖨️</span> Imprimir / Exportar PDF
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
                  Acta generada con meskeIA - {formatDateCorto(new Date())}
                </p>
              </footer>
            </div>
          </>
        )}
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre actas de reunión?"
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

        {/* ── SECCIÓN 1: Tabla Comparativa de tipos de actas ── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de Tipos de Actas</h2>
          <p className={styles.introParagraph}>
            No todas las actas son iguales. El nivel de formalidad, las obligaciones legales y quién debe firmarlas
            varían según el tipo de organización. Elige el formato adecuado para evitar problemas jurídicos.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Acta de equipo interno</th>
                  <th>Acta de junta directiva</th>
                  <th>Acta de comunidad de propietarios</th>
                  <th>Acta notarial</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Obligatoriedad legal</strong></td>
                  <td>No obligatoria</td>
                  <td>Obligatoria (Ley de Sociedades de Capital, art. 97–99)</td>
                  <td>Obligatoria (LPH, art. 19)</td>
                  <td>Voluntaria u obligatoria según estatutos</td>
                </tr>
                <tr>
                  <td><strong>Quién la firma</strong></td>
                  <td>Opcional — responsable de reunión</td>
                  <td>Presidente y Secretario del consejo</td>
                  <td>Presidente y Secretario de la comunidad</td>
                  <td>Notario público + partes</td>
                </tr>
                <tr>
                  <td><strong>Dónde se archiva</strong></td>
                  <td>Carpeta de equipo / herramienta de gestión</td>
                  <td>Libro de Actas societario (Registro Mercantil)</td>
                  <td>Libro de Actas de la comunidad</td>
                  <td>Protocolo notarial</td>
                </tr>
                <tr>
                  <td><strong>Validez jurídica</strong></td>
                  <td>Valor probatorio limitado</td>
                  <td>Alta — impugnable en 40 días (art. 204 LSC)</td>
                  <td>Alta — impugnable en 3 meses (art. 18 LPH)</td>
                  <td>Máxima — fe pública notarial</td>
                </tr>
                <tr>
                  <td><strong>Nivel de formalidad</strong></td>
                  <td>Bajo</td>
                  <td>Alto</td>
                  <td>Alto</td>
                  <td>Máximo</td>
                </tr>
                <tr>
                  <td><strong>Cuándo se usa</strong></td>
                  <td>Equipos de proyecto, reuniones internas de empresa</td>
                  <td>SA, SL, cooperativas, fundaciones con consejo</td>
                  <td>Juntas de propietarios de comunidades</td>
                  <td>Acuerdos societarios críticos, ampliaciones de capital</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Quién Necesita Actas y Para Qué?</h2>
          <p className={styles.introParagraph}>
            Las actas sirven a organizaciones muy diferentes. Estos son los cuatro perfiles más habituales en España
            y cómo pueden sacar partido a un generador de actas profesional.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👥</span>
                <h3>Equipo de proyecto interno</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Un equipo de desarrollo documenta las decisiones de su sprint review
                semanal para que quede constancia de los cambios de alcance acordados con el cliente.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Aunque no hay obligación legal, tener registro escrito evita conflictos
                sobre qué se acordó. Incluir siempre los acuerdos y las tareas asignadas con fechas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏘️</span>
                <h3>Comunidad de propietarios</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> El secretario de una comunidad levanta acta de la junta anual donde
                se aprueban las cuotas de mantenimiento y se acuerda la reparación del tejado.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> La LPH (art. 19) obliga a que el acta se remita a los propietarios
                en un plazo máximo de 10 días. Debe recoger el quórum y el sentido del voto de cada propietario.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h3>Pyme con consejo de administración</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Una SL con tres socios documenta en acta los acuerdos del consejo
                para aprobar el presupuesto anual y nombrar un nuevo apoderado.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> La Ley de Sociedades de Capital (art. 97–99) exige libro de actas
                legalizado. Los acuerdos sin acta válida pueden ser impugnados judicialmente hasta 1 año después
                si son contrarios a la ley.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🤝</span>
                <h3>ONG y asociaciones</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> La junta directiva de una ONG registra en acta las decisiones
                sobre captación de fondos, proyectos aprobados y cambios de estatutos.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> La Ley Orgánica 1/2002 de asociaciones exige documentar los acuerdos
                de la asamblea general. Las actas son necesarias para tramitar subvenciones públicas y
                acreditar decisiones ante notarios y registros.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Actas</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Es obligatorio redactar actas de reunión?</h4>
              <p>
                Depende del tipo de organización. Para SA y SL es obligatorio por la Ley de Sociedades de Capital
                (arts. 97–99 LSC). Para comunidades de propietarios lo exige el artículo 19 de la LPH.
                Para equipos de trabajo internos no existe obligación legal, pero es una buena práctica.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la diferencia entre un acta y una minuta?</h4>
              <p>
                El acta es el documento formal y definitivo que recoge los acuerdos adoptados; tiene valor
                probatorio. La minuta es el borrador previo, un resumen informal de lo tratado que se
                circula para revisión antes de aprobar el acta oficial.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Quién debe firmar un acta?</h4>
              <p>
                En juntas de SA/SL la firma el presidente y el secretario del consejo o junta. En comunidades
                de propietarios, el presidente y el secretario. En reuniones de equipo sin régimen legal
                específico basta con que la firme quien la redacta; aunque todos los asistentes pueden
                firmar para mayor validez.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto tiempo hay que conservar las actas?</h4>
              <p>
                La legislación mercantil española (Código de Comercio, art. 30) exige conservar los libros
                y documentos de empresa durante un mínimo de <strong>6 años</strong> desde el último asiento.
                Para SA y SL la recomendación práctica es conservarlas indefinidamente, ya que los acuerdos
                societarios pueden ser revisados décadas después.
              </p>
              <p className={styles.faqTip}>
                Consejo: guarda las actas en formato PDF/A firmado digitalmente para garantizar la integridad
                a largo plazo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Tiene validez un acta sin notario?</h4>
              <p>
                Sí, en la mayoría de los casos. Un acta interna firmada por presidente y secretario tiene
                plena validez para acuerdos ordinarios. Solo es obligatoria la intervención notarial
                en supuestos específicos como ampliaciones de capital, modificación de estatutos en SA o
                cuando los propios estatutos lo exijan.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué ocurre si alguien no firma el acta?</h4>
              <p>
                El acta sigue siendo válida si la firman al menos el presidente y el secretario. El desacuerdo
                de un asistente se puede hacer constar en el propio documento como voto particular o
                discrepancia expresa. No firmar no anula el acuerdo adoptado por mayoría.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo se rectifica un acta incorrecta?</h4>
              <p>
                Se redacta un acta de corrección o diligencia de subsanación que haga referencia expresa
                al acta original (indicando fecha y número), describe el error y establece el texto correcto.
                En SA/SL esta corrección debe aprobarse en la siguiente reunión del órgano correspondiente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Las actas en formato digital tienen validez legal?</h4>
              <p>
                Sí, siempre que cumplan los requisitos del Reglamento eIDAS (UE 910/2014) y la legislación
                española. Una firma electrónica cualificada otorga al documento digital la misma validez
                que la firma manuscrita. El libro de actas electrónico es válido para SA/SL si está
                legalizado telemáticamente en el Registro Mercantil.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Cómo Redactar un Acta Profesional</h2>
          <p className={styles.introParagraph}>
            Sigue estos 7 pasos para redactar actas que sean claras, completas y con valor jurídico.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Prepara el orden del día con antelación</h4>
                <p>
                  Envía la convocatoria con al menos 48–72 horas de antelación incluyendo el orden del día,
                  la fecha, la hora y el lugar. Para juntas de SA/SL la LSC exige plazos mínimos según estatutos.
                  Un orden del día claro facilita enormemente la redacción posterior del acta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Documenta asistencia y quórum</h4>
                <p>
                  Al inicio, registra a todos los asistentes (nombre, cargo y si están presentes o representados).
                  Verifica que se cumple el quórum necesario para tomar acuerdos válidos. En juntas de
                  comunidades es imprescindible anotar la cuota de participación de cada propietario.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Toma notas durante la reunión, no después</h4>
                <p>
                  Designa a un secretario que tome notas en tiempo real. No intentes transcribir todo:
                  anota los puntos clave debatidos, las posturas relevantes y, sobre todo, los acuerdos
                  adoptados con el resultado de la votación si la hubiera.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Numera y describe cada acuerdo</h4>
                <p>
                  Cada decisión adoptada debe quedar numerada correlativamente (Acuerdo 1, Acuerdo 2...).
                  Incluye el texto exacto de lo aprobado, los votos a favor, en contra y abstenciones.
                  Esta numeración es esencial para futuras referencias y para impugnar acuerdos si fuera necesario.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Registra las tareas con responsable y plazo</h4>
                <p>
                  Cada compromiso adquirido debe ir acompañado del nombre de la persona responsable y
                  una fecha límite concreta. Sin responsable y sin fecha, las tareas raramente se ejecutan.
                  Este apartado es la base del seguimiento en la próxima reunión.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Obtén las firmas y aprobación</h4>
                <p>
                  El acta debe ser firmada por el presidente y el secretario. Para mayor seguridad,
                  puede aprobarse en la misma reunión ("aprobación del acta anterior") o al inicio
                  de la siguiente. En entornos digitales, usa firma electrónica cualificada.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Distribuye y archiva en menos de 24 horas</h4>
                <p>
                  Envía el acta a todos los asistentes y a los ausentes que deban estar informados.
                  Archiva el original en el libro de actas (físico o electrónico legalizado) y guarda
                  una copia en PDF/A. La LPH exige que las actas de comunidades se remitan en 10 días.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>6 Mejores Prácticas para Actas Profesionales</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏱️</span>
              <h4>Redacta en tiempo real</h4>
              <p>
                Toma notas durante la reunión, no horas después. Los detalles se olvidan rápidamente
                y redactar a posteriori aumenta el riesgo de imprecisiones o sesgos involuntarios.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Solo acuerdos, no transcripciones</h4>
              <p>
                El acta recoge decisiones y acuerdos, no una transcripción literal del debate.
                Un acta concisa es más útil y tiene mayor claridad jurídica que una larga y detallada.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <h4>Cabecera completa siempre</h4>
              <p>
                Incluye sin excepción: fecha, hora de inicio y fin, lugar o plataforma virtual,
                asistentes con cargo, convocante y secretario. Un acta sin cabecera completa pierde
                valor probatorio.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔢</span>
              <h4>Numera los acuerdos</h4>
              <p>
                Numera cada acuerdo correlativamente dentro del acta y usa una numeración anual para
                las propias actas (Acta 001/2025, Acta 002/2025...). Facilita las referencias cruzadas
                y el archivo sistemático.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📤</span>
              <h4>Borrador en menos de 24 horas</h4>
              <p>
                Envía un borrador del acta a los asistentes dentro de las 24 horas siguientes a la
                reunión. La aprobación rápida reduce discrepancias y garantiza que todos tienen la
                misma versión de lo acordado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔒</span>
              <h4>Archiva con firma digital</h4>
              <p>
                Guarda las actas en PDF/A con firma electrónica cualificada. Este formato garantiza
                la integridad del documento a largo plazo y cumple con los requisitos del Reglamento
                eIDAS para validez legal en la UE.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box — Errores Comunes ── */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>6 Errores que Pueden Invalidar tu Acta</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>No levantar acta de decisiones importantes.</strong> En SA y SL, los acuerdos del
              consejo sin acta válida carecen de prueba suficiente y pueden ser impugnados o declarados nulos.
            </li>
            <li>
              <strong>Acta sin firmas ni fecha.</strong> Un documento sin fecha y sin la firma del secretario
              y presidente pierde su valor probatorio. Los juzgados lo consideran un simple borrador sin efecto legal.
            </li>
            <li>
              <strong>Redactar el acta semanas después.</strong> Esperar días o semanas aumenta el riesgo
              de errores, lagunas y versiones contradictorias entre los asistentes. La legislación societaria
              insta a aprobar el acta "en la misma sesión o en la siguiente".
            </li>
            <li>
              <strong>Mezclar opiniones con acuerdos.</strong> El acta debe reflejar los acuerdos adoptados,
              no los debates. Incluir interpretaciones subjetivas o comentarios personales puede generar
              controversias y debilitar el valor jurídico del documento.
            </li>
            <li>
              <strong>No distribuir el acta a los participantes.</strong> En comunidades de propietarios,
              no enviar el acta en el plazo de 10 días establecido por la LPH puede acarrear reclamaciones.
              En SA/SL, no notificar a los socios ausentes limita su derecho de impugnación.
            </li>
            <li>
              <strong>No numerar ni correlacionar las actas.</strong> Un libro de actas sin numeración
              correlativa dificulta la búsqueda de antecedentes y puede generar problemas en auditorías,
              inspecciones de Hacienda o procedimientos ante el Registro Mercantil.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-actas')} />

      <ShareCard appName="generador-actas" />
      <Footer appName="generador-actas" />
    </div>
  );
}
