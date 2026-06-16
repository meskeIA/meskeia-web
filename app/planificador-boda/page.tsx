'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './PlanificadorBoda.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  months: string; // "12-6", "6-3", "3-1", "ultimo-mes", "dia-d"
}

interface BudgetItem {
  id: string;
  category: string;
  estimated: number;
  actual: number;
  paid: boolean;
  notes: string;
}

interface TimelineEvent {
  id: string;
  time: string;
  event: string;
  duration: number; // en minutos
  notes: string;
}

// Datos iniciales del checklist
const initialChecklist: ChecklistItem[] = [
  // 12-6 meses antes
  { id: '1', text: 'Definir presupuesto total aproximado', completed: false, category: 'Presupuesto', months: '12-6' },
  { id: '2', text: 'Elegir fecha y época del año', completed: false, category: 'Planificación', months: '12-6' },
  { id: '3', text: 'Crear lista de invitados preliminar', completed: false, category: 'Invitados', months: '12-6' },
  { id: '4', text: 'Visitar y reservar el lugar de la ceremonia', completed: false, category: 'Ceremonia', months: '12-6' },
  { id: '5', text: 'Visitar y reservar el lugar del banquete', completed: false, category: 'Banquete', months: '12-6' },
  { id: '6', text: 'Buscar y contratar fotógrafo/videógrafo', completed: false, category: 'Proveedores', months: '12-6' },
  { id: '7', text: 'Elegir testigos y padrinos', completed: false, category: 'Ceremonia', months: '12-6' },
  { id: '8', text: 'Comenzar a buscar vestido/traje de novia', completed: false, category: 'Vestuario', months: '12-6' },
  { id: '9', text: 'Reservar DJ o grupo musical', completed: false, category: 'Entretenimiento', months: '12-6' },
  { id: '10', text: 'Planificar luna de miel (destino y fechas)', completed: false, category: 'Luna de miel', months: '12-6' },

  // 6-3 meses antes
  { id: '11', text: 'Enviar Save the Date a invitados', completed: false, category: 'Invitados', months: '6-3' },
  { id: '12', text: 'Elegir y encargar invitaciones', completed: false, category: 'Papelería', months: '6-3' },
  { id: '13', text: 'Contratar catering o confirmar menú', completed: false, category: 'Banquete', months: '6-3' },
  { id: '14', text: 'Buscar y reservar floristería', completed: false, category: 'Decoración', months: '6-3' },
  { id: '15', text: 'Elegir pastel/tarta de boda', completed: false, category: 'Banquete', months: '6-3' },
  { id: '16', text: 'Comprar alianzas', completed: false, category: 'Accesorios', months: '6-3' },
  { id: '17', text: 'Organizar despedidas de soltero/a', completed: false, category: 'Celebraciones', months: '6-3' },
  { id: '18', text: 'Contratar transporte (novios e invitados)', completed: false, category: 'Logística', months: '6-3' },
  { id: '19', text: 'Primera prueba del vestido/traje', completed: false, category: 'Vestuario', months: '6-3' },
  { id: '20', text: 'Elegir vestuario de damas de honor/padrinos', completed: false, category: 'Vestuario', months: '6-3' },
  { id: '21', text: 'Reservar alojamiento para invitados de fuera', completed: false, category: 'Logística', months: '6-3' },
  { id: '22', text: 'Comenzar clases de baile (si lo desean)', completed: false, category: 'Entretenimiento', months: '6-3' },
  { id: '23', text: 'Tramitar documentación legal/religiosa', completed: false, category: 'Legal', months: '6-3' },

  // 3-1 mes antes
  { id: '24', text: 'Enviar invitaciones oficiales', completed: false, category: 'Invitados', months: '3-1' },
  { id: '25', text: 'Segunda prueba del vestido/traje', completed: false, category: 'Vestuario', months: '3-1' },
  { id: '26', text: 'Confirmar todos los proveedores', completed: false, category: 'Proveedores', months: '3-1' },
  { id: '27', text: 'Elegir lecturas y música para ceremonia', completed: false, category: 'Ceremonia', months: '3-1' },
  { id: '28', text: 'Crear lista de canciones para DJ', completed: false, category: 'Entretenimiento', months: '3-1' },
  { id: '29', text: 'Comprar zapatos y accesorios', completed: false, category: 'Accesorios', months: '3-1' },
  { id: '30', text: 'Planificar seating (distribución de mesas)', completed: false, category: 'Banquete', months: '3-1' },
  { id: '31', text: 'Organizar ensayo general de ceremonia', completed: false, category: 'Ceremonia', months: '3-1' },
  { id: '32', text: 'Contratar maquillaje y peluquería', completed: false, category: 'Belleza', months: '3-1' },
  { id: '33', text: 'Confirmar luna de miel y documentación', completed: false, category: 'Luna de miel', months: '3-1' },
  { id: '34', text: 'Recoger confirmaciones de asistencia', completed: false, category: 'Invitados', months: '3-1' },
  { id: '35', text: 'Preparar detalles/recuerdos para invitados', completed: false, category: 'Detalles', months: '3-1' },

  // Último mes
  { id: '36', text: 'Prueba final del vestido/traje', completed: false, category: 'Vestuario', months: 'ultimo-mes' },
  { id: '37', text: 'Confirmar número final de invitados al catering', completed: false, category: 'Banquete', months: 'ultimo-mes' },
  { id: '38', text: 'Entregar seating al lugar del banquete', completed: false, category: 'Banquete', months: 'ultimo-mes' },
  { id: '39', text: 'Reunión final con fotógrafo y videógrafo', completed: false, category: 'Proveedores', months: 'ultimo-mes' },
  { id: '40', text: 'Recoger alianzas grabadas', completed: false, category: 'Accesorios', months: 'ultimo-mes' },
  { id: '41', text: 'Preparar discursos/votos matrimoniales', completed: false, category: 'Ceremonia', months: 'ultimo-mes' },
  { id: '42', text: 'Hacer maleta de luna de miel', completed: false, category: 'Luna de miel', months: 'ultimo-mes' },
  { id: '43', text: 'Prueba de maquillaje y peinado', completed: false, category: 'Belleza', months: 'ultimo-mes' },
  { id: '44', text: 'Confirmar horarios con todos los proveedores', completed: false, category: 'Proveedores', months: 'ultimo-mes' },
  { id: '45', text: 'Preparar sobres/pagos para proveedores', completed: false, category: 'Presupuesto', months: 'ultimo-mes' },
  { id: '46', text: 'Ensayo general de ceremonia', completed: false, category: 'Ceremonia', months: 'ultimo-mes' },
  { id: '47', text: 'Manicura y tratamientos de belleza', completed: false, category: 'Belleza', months: 'ultimo-mes' },

  // Día D
  { id: '48', text: 'Desayunar bien y mantenerse hidratado/a', completed: false, category: 'Bienestar', months: 'dia-d' },
  { id: '49', text: 'Sesión de maquillaje y peluquería', completed: false, category: 'Belleza', months: 'dia-d' },
  { id: '50', text: 'Vestirse con tiempo suficiente', completed: false, category: 'Vestuario', months: 'dia-d' },
  { id: '51', text: 'Tener alianzas preparadas (entregar a testigo)', completed: false, category: 'Ceremonia', months: 'dia-d' },
  { id: '52', text: 'Kit de emergencia: pañuelos, tiritas, etc.', completed: false, category: 'Logística', months: 'dia-d' },
  { id: '53', text: 'Documentación y DNI para firmar', completed: false, category: 'Legal', months: 'dia-d' },
  { id: '54', text: 'Móvil cargado al 100%', completed: false, category: 'Logística', months: 'dia-d' },
  { id: '55', text: 'Disfrutar del día', completed: false, category: 'Bienestar', months: 'dia-d' },
];

// Categorías de presupuesto con porcentajes típicos
const budgetCategories = [
  { name: 'Banquete y catering', percentage: 40, icon: '🍽️' },
  { name: 'Lugar/Venue', percentage: 15, icon: '🏰' },
  { name: 'Fotografía y vídeo', percentage: 10, icon: '📸' },
  { name: 'Música y entretenimiento', percentage: 7, icon: '🎵' },
  { name: 'Vestido/traje novia', percentage: 6, icon: '👗' },
  { name: 'Flores y decoración', percentage: 5, icon: '💐' },
  { name: 'Traje novio', percentage: 3, icon: '🤵' },
  { name: 'Invitaciones y papelería', percentage: 2, icon: '💌' },
  { name: 'Alianzas', percentage: 2, icon: '💍' },
  { name: 'Transporte', percentage: 2, icon: '🚗' },
  { name: 'Tarta', percentage: 2, icon: '🎂' },
  { name: 'Belleza (maquillaje/pelo)', percentage: 2, icon: '💄' },
  { name: 'Imprevistos', percentage: 4, icon: '🔧' },
];

// Timeline por defecto
const defaultTimeline: TimelineEvent[] = [
  { id: 't1', time: '11:00', event: 'Inicio maquillaje y peluquería', duration: 120, notes: '' },
  { id: 't2', time: '13:00', event: 'Vestirse', duration: 60, notes: '' },
  { id: 't3', time: '14:00', event: 'Fotos preparativos', duration: 30, notes: '' },
  { id: 't4', time: '14:30', event: 'Salida hacia ceremonia', duration: 30, notes: '' },
  { id: 't5', time: '15:00', event: 'Ceremonia', duration: 45, notes: '' },
  { id: 't6', time: '15:45', event: 'Fotos de grupo', duration: 30, notes: '' },
  { id: 't7', time: '16:15', event: 'Traslado al banquete', duration: 15, notes: '' },
  { id: 't8', time: '16:30', event: 'Cóctel de bienvenida', duration: 90, notes: '' },
  { id: 't9', time: '18:00', event: 'Entrada al salón', duration: 15, notes: '' },
  { id: 't10', time: '18:15', event: 'Banquete', duration: 120, notes: '' },
  { id: 't11', time: '20:15', event: 'Corte de tarta', duration: 15, notes: '' },
  { id: 't12', time: '20:30', event: 'Primer baile', duration: 10, notes: '' },
  { id: 't13', time: '20:40', event: 'Baile y fiesta', duration: 180, notes: '' },
  { id: 't14', time: '23:40', event: 'Barra libre', duration: 120, notes: '' },
  { id: 't15', time: '01:40', event: 'Despedida', duration: 20, notes: '' },
];

type ActiveTab = 'checklist' | 'presupuesto' | 'timeline';
type MonthsFilter = 'all' | '12-6' | '6-3' | '3-1' | 'ultimo-mes' | 'dia-d';

export default function PlanificadorBodaPage() {
  // Estados principales
  const [activeTab, setActiveTab] = useState<ActiveTab>('checklist');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [monthsFilter, setMonthsFilter] = useState<MonthsFilter>('all');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // Estados de presupuesto
  const [totalBudget, setTotalBudget] = useState('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [numInvitados, setNumInvitados] = useState('');

  // Estados de timeline
  const [timeline, setTimeline] = useState<TimelineEvent[]>(defaultTimeline);
  const [weddingDate, setWeddingDate] = useState('');

  // Cargar datos del localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem('meskeia-boda-checklist');
    const savedBudget = localStorage.getItem('meskeia-boda-budget');
    const savedTotalBudget = localStorage.getItem('meskeia-boda-total-budget');
    const savedNumInvitados = localStorage.getItem('meskeia-boda-invitados');
    const savedTimeline = localStorage.getItem('meskeia-boda-timeline');
    const savedDate = localStorage.getItem('meskeia-boda-date');

    if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
    if (savedBudget) setBudgetItems(JSON.parse(savedBudget));
    if (savedTotalBudget) setTotalBudget(savedTotalBudget);
    if (savedNumInvitados) setNumInvitados(savedNumInvitados);
    if (savedTimeline) setTimeline(JSON.parse(savedTimeline));
    if (savedDate) setWeddingDate(savedDate);
  }, []);

  // Guardar checklist
  useEffect(() => {
    localStorage.setItem('meskeia-boda-checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Guardar presupuesto
  useEffect(() => {
    if (budgetItems.length > 0) {
      localStorage.setItem('meskeia-boda-budget', JSON.stringify(budgetItems));
    }
  }, [budgetItems]);

  useEffect(() => {
    if (totalBudget) {
      localStorage.setItem('meskeia-boda-total-budget', totalBudget);
    }
  }, [totalBudget]);

  useEffect(() => {
    if (numInvitados) {
      localStorage.setItem('meskeia-boda-invitados', numInvitados);
    }
  }, [numInvitados]);

  // Guardar timeline
  useEffect(() => {
    localStorage.setItem('meskeia-boda-timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    if (weddingDate) {
      localStorage.setItem('meskeia-boda-date', weddingDate);
    }
  }, [weddingDate]);

  // Inicializar presupuesto cuando cambia el total
  const initializeBudget = useCallback(() => {
    const total = parseSpanishNumber(totalBudget);
    if (total > 0) {
      const newItems: BudgetItem[] = budgetCategories.map((cat, index) => ({
        id: `budget-${index}`,
        category: cat.name,
        estimated: Math.round(total * cat.percentage / 100),
        actual: 0,
        paid: false,
        notes: '',
      }));
      setBudgetItems(newItems);
    }
  }, [totalBudget]);

  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Actualizar item de presupuesto
  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: number | boolean | string) => {
    setBudgetItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Actualizar evento del timeline
  const updateTimelineEvent = (id: string, field: keyof TimelineEvent, value: string | number) => {
    setTimeline(prev => prev.map(event =>
      event.id === id ? { ...event, [field]: value } : event
    ));
  };

  // Calcular progreso del checklist
  const getChecklistProgress = () => {
    const filtered = monthsFilter === 'all'
      ? checklist
      : checklist.filter(item => item.months === monthsFilter);
    const completed = filtered.filter(item => item.completed).length;
    return {
      completed,
      total: filtered.length,
      percentage: filtered.length > 0 ? Math.round((completed / filtered.length) * 100) : 0
    };
  };

  // Calcular totales del presupuesto
  const getBudgetTotals = () => {
    const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimated, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actual, 0);
    const totalPaid = budgetItems.filter(item => item.paid).reduce((sum, item) => sum + item.actual, 0);
    const difference = totalEstimated - totalActual;
    return { totalEstimated, totalActual, totalPaid, difference };
  };

  // Calcular días hasta la boda
  const getDaysUntilWedding = () => {
    if (!weddingDate) return null;
    const wedding = new Date(weddingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    wedding.setHours(0, 0, 0, 0);
    const diff = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Coste por invitado
  const getCostPerGuest = () => {
    const invitados = parseSpanishNumber(numInvitados);
    const total = parseSpanishNumber(totalBudget);
    if (invitados > 0 && total > 0) {
      return total / invitados;
    }
    return 0;
  };

  // Filtrar checklist
  const filteredChecklist = checklist.filter(item => {
    const monthMatch = monthsFilter === 'all' || item.months === monthsFilter;
    const pendingMatch = !showOnlyPending || !item.completed;
    return monthMatch && pendingMatch;
  });

  // Agrupar checklist por categoría
  const groupedChecklist = filteredChecklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const progress = getChecklistProgress();
  const budgetTotals = getBudgetTotals();
  const daysUntil = getDaysUntilWedding();

  // Resetear todo
  const resetAll = () => {
    if (confirm('¿Seguro que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
      setChecklist(initialChecklist);
      setBudgetItems([]);
      setTotalBudget('');
      setNumInvitados('');
      setTimeline(defaultTimeline);
      setWeddingDate('');
      localStorage.removeItem('meskeia-boda-checklist');
      localStorage.removeItem('meskeia-boda-budget');
      localStorage.removeItem('meskeia-boda-total-budget');
      localStorage.removeItem('meskeia-boda-invitados');
      localStorage.removeItem('meskeia-boda-timeline');
      localStorage.removeItem('meskeia-boda-date');
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">💒</span> Planificador de Boda</h1>
        <p className={styles.subtitle}>
          Tu wedding planner digital: checklist, presupuesto y timeline
        </p>
        {weddingDate && daysUntil !== null && (
          <div className={styles.countdown}>
            {daysUntil > 0 ? (
              <>
                <span className={styles.countdownNumber}>{daysUntil}</span>
                <span className={styles.countdownText}>días para el gran día</span>
              </>
            ) : daysUntil === 0 ? (
              <span className={styles.countdownText}>¡Hoy es el gran día!</span>
            ) : (
              <span className={styles.countdownText}>¡Feliz matrimonio!</span>
            )}
          </div>
        )}
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Fecha de boda */}
      <div className={styles.dateSection}>
        <label className={styles.dateLabel}>
          <span aria-hidden="true">📅</span> Fecha de la boda:
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className={styles.dateInput}
          />
        </label>
      </div>

      {/* Tabs de navegación */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'checklist' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('checklist')}
          aria-pressed={activeTab === 'checklist'}
        >
          <span aria-hidden="true">✅</span> Checklist
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'presupuesto' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('presupuesto')}
          aria-pressed={activeTab === 'presupuesto'}
        >
          <span aria-hidden="true">💰</span> Presupuesto
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('timeline')}
          aria-pressed={activeTab === 'timeline'}
        >
          <span aria-hidden="true">⏰</span> Timeline
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div className={styles.mainContent}>

        {/* TAB: CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className={styles.checklistSection}>
            {/* Barra de progreso */}
            <div className={styles.progressBar}>
              <div className={styles.progressInfo}>
                <span>{progress.completed} de {progress.total} tareas completadas</span>
                <span className={styles.progressPercent}>{progress.percentage}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Filtros */}
            <div className={styles.filters}>
              <div className={styles.monthsFilter}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${monthsFilter === 'all' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('all')}
                  aria-pressed={monthsFilter === 'all'}
                >
                  Todas
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${monthsFilter === '12-6' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('12-6')}
                  aria-pressed={monthsFilter === '12-6'}
                >
                  12-6 meses
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${monthsFilter === '6-3' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('6-3')}
                  aria-pressed={monthsFilter === '6-3'}
                >
                  6-3 meses
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${monthsFilter === '3-1' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('3-1')}
                  aria-pressed={monthsFilter === '3-1'}
                >
                  3-1 mes
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${monthsFilter === 'ultimo-mes' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('ultimo-mes')}
                  aria-pressed={monthsFilter === 'ultimo-mes'}
                >
                  Último mes
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${monthsFilter === 'dia-d' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('dia-d')}
                  aria-pressed={monthsFilter === 'dia-d'}
                >
                  Día D
                </button>
              </div>
              <label className={styles.pendingToggle}>
                <input
                  type="checkbox"
                  checked={showOnlyPending}
                  onChange={(e) => setShowOnlyPending(e.target.checked)}
                />
                Solo pendientes
              </label>
            </div>

            {/* Lista agrupada */}
            <div className={styles.checklistGroups}>
              {Object.entries(groupedChecklist).map(([category, items]) => (
                <div key={category} className={styles.checklistGroup}>
                  <h3 className={styles.categoryTitle}>{category}</h3>
                  <ul className={styles.checklistItems}>
                    {items.map(item => (
                      <li
                        key={item.id}
                        className={`${styles.checklistItem} ${item.completed ? styles.completed : ''}`}
                      >
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(item.id)}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkmark} />
                          <span className={styles.itemText}>{item.text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PRESUPUESTO */}
        {activeTab === 'presupuesto' && (
          <div className={styles.budgetSection}>
            {/* Configuración inicial */}
            <div className={styles.budgetConfig}>
              <div className={styles.budgetInputs}>
                <NumberInput
                  value={totalBudget}
                  onChange={setTotalBudget}
                  label="Presupuesto total"
                  placeholder="25000"
                  helperText="Cantidad total para la boda"
                />
                <NumberInput
                  value={numInvitados}
                  onChange={setNumInvitados}
                  label="Número de invitados"
                  placeholder="100"
                  helperText="Estimación de invitados"
                />
                <button
                  type="button"
                  onClick={initializeBudget}
                  className={styles.btnPrimary}
                  disabled={!totalBudget}
                >
                  Calcular distribución
                </button>
              </div>

              {parseSpanishNumber(totalBudget) > 0 && (
                <div className={styles.budgetSummary}>
                  <ResultCard
                    title="Presupuesto Total"
                    value={formatCurrency(parseSpanishNumber(totalBudget))}
                    variant="highlight"
                    icon="💰"
                  />
                  {parseSpanishNumber(numInvitados) > 0 && (
                    <ResultCard
                      title="Coste por invitado"
                      value={formatCurrency(getCostPerGuest())}
                      variant="info"
                      icon="👥"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Tabla de presupuesto */}
            {budgetItems.length > 0 && (
              <>
                <div className={styles.budgetTableContainer}>
                  <table className={styles.budgetTable}>
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Estimado</th>
                        <th>Real</th>
                        <th>Pagado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>
                            <span className={styles.categoryIcon}>
                              {budgetCategories[index]?.icon}
                            </span>
                            {item.category}
                          </td>
                          <td>
                            <input
                              type="text"
                              value={formatNumber(item.estimated, 0)}
                              onChange={(e) => {
                                const val = parseSpanishNumber(e.target.value);
                                updateBudgetItem(item.id, 'estimated', val);
                              }}
                              className={styles.budgetInput}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.actual > 0 ? formatNumber(item.actual, 0) : ''}
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseSpanishNumber(e.target.value);
                                updateBudgetItem(item.id, 'actual', val);
                              }}
                              className={styles.budgetInput}
                            />
                          </td>
                          <td className={styles.paidCell}>
                            <input
                              type="checkbox"
                              checked={item.paid}
                              onChange={(e) => updateBudgetItem(item.id, 'paid', e.target.checked)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={styles.totalsRow}>
                        <td><strong>TOTALES</strong></td>
                        <td><strong>{formatCurrency(budgetTotals.totalEstimated)}</strong></td>
                        <td><strong>{formatCurrency(budgetTotals.totalActual)}</strong></td>
                        <td><strong>{formatCurrency(budgetTotals.totalPaid)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Resumen del presupuesto */}
                <div className={styles.budgetResults}>
                  <ResultCard
                    title="Gastado hasta ahora"
                    value={formatCurrency(budgetTotals.totalActual)}
                    variant={budgetTotals.totalActual > budgetTotals.totalEstimated ? 'warning' : 'default'}
                    icon="💸"
                  />
                  <ResultCard
                    title="Ya pagado"
                    value={formatCurrency(budgetTotals.totalPaid)}
                    variant="success"
                    icon="✅"
                  />
                  <ResultCard
                    title={budgetTotals.difference >= 0 ? 'Disponible' : 'Excedido'}
                    value={formatCurrency(Math.abs(budgetTotals.difference))}
                    variant={budgetTotals.difference >= 0 ? 'info' : 'warning'}
                    icon={budgetTotals.difference >= 0 ? '💵' : '⚠️'}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className={styles.timelineSection}>
            <p className={styles.timelineIntro}>
              Planifica el horario de tu gran día. Puedes editar las horas y eventos.
            </p>

            <div className={styles.timelineList}>
              {timeline.map((event, index) => (
                <div key={event.id} className={styles.timelineEvent}>
                  <div className={styles.timelineDot}>
                    <span className={styles.eventNumber}>{index + 1}</span>
                  </div>
                  <div className={styles.eventContent}>
                    <input
                      type="time"
                      value={event.time}
                      onChange={(e) => updateTimelineEvent(event.id, 'time', e.target.value)}
                      className={styles.timeInput}
                    />
                    <input
                      type="text"
                      value={event.event}
                      onChange={(e) => updateTimelineEvent(event.id, 'event', e.target.value)}
                      className={styles.eventInput}
                      placeholder="Nombre del evento"
                    />
                    <div className={styles.durationWrapper}>
                      <input
                        type="number"
                        value={event.duration}
                        onChange={(e) => updateTimelineEvent(event.id, 'duration', parseInt(e.target.value) || 0)}
                        className={styles.durationInput}
                        min="0"
                      />
                      <span className={styles.durationLabel}>min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTimeline([...timeline, {
                id: `t${Date.now()}`,
                time: '00:00',
                event: 'Nuevo evento',
                duration: 30,
                notes: ''
              }])}
              className={styles.btnSecondary}
            >
              + Añadir evento
            </button>
          </div>
        )}
      </div>

      {/* Botón resetear */}
      <div className={styles.resetSection}>
        <button type="button" onClick={resetAll} className={styles.btnDanger}>
          <span aria-hidden="true">🗑️</span> Borrar todos los datos
        </button>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="general"
        severity="critical"
        context="planificador-boda"
        collapsible={false}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres consejos de wedding planner?"
        subtitle="Tips profesionales para organizar tu boda perfecta"
        icon="💒"
      >
        <section className={styles.guideSection}>
          <h2>Consejos de Expertos para tu Boda</h2>

          <div className={styles.tipGrid}>
            <div className={styles.tipCard}>
              <h4>📅 Elige bien la fecha</h4>
              <p>
                <strong>Temporada alta</strong>: mayo-octubre (precios más altos).
                <strong>Temporada baja</strong>: noviembre-abril (hasta 30% más económico).
                Los viernes y domingos suelen ser más baratos que los sábados.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>💰 El 10% extra</h4>
              <p>
                Siempre reserva un 10-15% del presupuesto para imprevistos.
                Surgirán gastos que no habías contemplado: extras del menú,
                detalles de última hora, propinas, etc.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>👥 Confirma pronto</h4>
              <p>
                Pide confirmación de asistencia al menos 3 semanas antes.
                Calcula un 10-15% de ausencias sobre los confirmados.
                Algunos invitados no avisan que no pueden asistir.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>📸 Reserva con tiempo</h4>
              <p>
                Los buenos fotógrafos y lugares se reservan con 12-18 meses de
                antelación. Si tienes una fecha fija, empieza a buscar
                proveedores cuanto antes.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>🍽️ El banquete es clave</h4>
              <p>
                El catering representa el 40-50% del presupuesto. Pide degustación
                antes de contratar. Negocia el precio del menú infantil y las
                bebidas incluidas.
              </p>
            </div>

            <div className={styles.tipCard}>
              <h4>📝 Todo por escrito</h4>
              <p>
                Firma contratos con todos los proveedores. Incluye fecha, hora,
                servicios detallados, precio total, forma de pago y política
                de cancelación.
              </p>
            </div>
          </div>

          <h3>Distribución típica del presupuesto</h3>
          <div className={styles.budgetDistribution}>
            {budgetCategories.slice(0, 8).map(cat => (
              <div key={cat.name} className={styles.budgetDistItem}>
                <span className={styles.distIcon}>{cat.icon}</span>
                <span className={styles.distName}>{cat.name}</span>
                <span className={styles.distPercent}>{cat.percentage}%</span>
              </div>
            ))}
          </div>

          <h3>Errores comunes a evitar</h3>
          <ul className={styles.errorList}>
            <li>❌ No tener un presupuesto claro desde el principio</li>
            <li>❌ Invitar a más personas de las que puedes permitirte</li>
            <li>❌ No leer la letra pequeña de los contratos</li>
            <li>❌ Dejar todo para última hora</li>
            <li>❌ No designar un coordinador para el día de la boda</li>
            <li>❌ Olvidar propinas para proveedores</li>
            <li>❌ No tener plan B para bodas al aire libre</li>
          </ul>
        </section>

        {/* ── SECCIÓN 1: TABLA COMPARATIVA ── */}
        <section className={styles.guideSection}>
          <h2>Tipos de Boda por Presupuesto Total</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            En España, el coste medio de una boda en 2025 es de aproximadamente <strong>20.000 €</strong>.
            El rango real oscila entre los 5.000 € de una ceremonia íntima y los 80.000 €+ de una boda de lujo.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de Boda</th>
                  <th>Presupuesto Total</th>
                  <th>Invitados típicos</th>
                  <th>Partidas principales</th>
                  <th>Ventajas</th>
                  <th>Desventajas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Íntima</strong></td>
                  <td>&lt; 10.000 €</td>
                  <td>20–40 personas</td>
                  <td>Restaurante privado, fotógrafo básico, flores sencillas</td>
                  <td>Trato cercano, ambiente exclusivo, menos estrés logístico</td>
                  <td>Lista de invitados muy reducida, puede generar conflictos familiares</td>
                </tr>
                <tr>
                  <td><strong>Media</strong></td>
                  <td>15.000–25.000 €</td>
                  <td>80–130 personas</td>
                  <td>Salón de bodas, catering 75–100 €/persona, DJ, fotógrafo profesional</td>
                  <td>Equilibrio calidad-precio, opciones de personalización, amplia variedad de venues</td>
                  <td>Requiere negociación con varios proveedores, planificación de 12+ meses</td>
                </tr>
                <tr>
                  <td><strong>Grande</strong></td>
                  <td>30.000–50.000 €</td>
                  <td>150–250 personas</td>
                  <td>Finca o palacio, catering 100–130 €/persona, orquesta en directo, wedding planner</td>
                  <td>Experiencia memorable, amplia personalización, impacto visual alto</td>
                  <td>Gestión compleja, mayor riesgo de imprevistos, necesita coordinador dedicado</td>
                </tr>
                <tr>
                  <td><strong>De lujo</strong></td>
                  <td>&gt; 60.000 €</td>
                  <td>100–300 personas</td>
                  <td>Venue exclusivo, menú degustación &gt;150 €/persona, artistas en directo, diseñador de modas</td>
                  <td>Experiencia única e irrepetible, servicio premium, todo a medida</td>
                  <td>Coste elevado, requiere wedding planner profesional, gran presión de planificación</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: CASOS DE USO (4 PERFILES) ── */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso: 4 Perfiles de Pareja</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💸</span>
                <h3>Pareja con presupuesto ajustado</h3>
              </div>
              <p className={styles.escenarioExample}>
                Objetivo: boda digna por menos de 10.000 €. Optan por ceremonia civil en el ayuntamiento (gratuita),
                cena en restaurante con menú cerrado a 55 €/persona para 40 invitados, fotógrafo autónomo por 800 €
                y música con Spotify en altavoces Bluetooth. Total estimado: 7.500 €.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: invitar menos es la palanca más potente para reducir coste. Cada invitado añadido suma
                entre 100 y 150 € al presupuesto final.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
                <h3>Boda destino en el extranjero</h3>
              </div>
              <p className={styles.escenarioExample}>
                Pareja que organiza su boda en Italia o Portugal para 50 invitados cercanos. Presupuesto: 35.000–45.000 €.
                Deben contratar un wedding planner local (1.500–3.000 €), gestionar el trámite consular de matrimonio
                en el extranjero y coordinar alojamiento para los invitados. Vuelos y traslados representan el 15–20%
                del presupuesto total de los invitados.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: reservar con 18 meses de antelación mínimo. En destinos populares, los venues se agotan
                dos temporadas antes.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧‍👦</span>
                <h3>Lista larga de invitados (150+)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Familia numerosa o entorno social amplio. Con 180 invitados a 85 €/persona de menú más venue y extras,
                el presupuesto mínimo viable es de 28.000–35.000 €. Necesitan salón con aforo suficiente, catering
                con experiencia en grandes eventos, y al menos un coordinador de sala el día de la boda.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: negociar el precio por persona con catering para grupos grandes puede suponer un descuento
                del 8–12%. Pide siempre precio para distintas horquillas de invitados (100, 150, 200).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🥂</span>
                <h3>Boda íntima civil con cena en restaurante</h3>
              </div>
              <p className={styles.escenarioExample}>
                20–30 personas, ceremonia civil en el registro o sala privada municipal, cena en restaurante
                con menú a 70–90 €/persona. Sin DJ ni pista de baile. Fotógrafo 4–6 horas: 600–900 €.
                Flores: ramo de novia y centro de mesa, 300–500 €. Total: 5.000–8.000 €.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: los jueves y viernes muchos restaurantes ofrecen el salón privado sin coste adicional
                si el gasto mínimo en menú se supera.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Bodas en España</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Con cuánta antelación reservar el venue?</strong>
              <p>
                Como mínimo 12 meses. Los sábados de temporada alta (mayo–octubre) en fincas y palacios
                populares se reservan con 18–24 meses de antelación. Si tienes fecha fija, empieza a buscar
                venue antes que ningún otro proveedor.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuánto cuesta una boda media en España en 2025?</strong>
              <p>
                El coste medio en 2025 es de <strong>~20.000 €</strong> para unos 100 invitados. El rango
                habitual oscila entre 12.000 € (boda sencilla) y 35.000 € (boda con todos los extras).
                El mayor gasto siempre es el banquete y catering (40–45% del total).
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué partidas se pueden ahorrar sin que se note?</strong>
              <p>
                Invitaciones digitales (ahorra 400–800 €), música con DJ amateur o amigo en lugar de orquesta
                (ahorra 2.000–4.000 €), decoración floral minimalista (ahorra 1.000–2.000 €), y cóctel con
                solo canapés en lugar de bufet amplio (ahorra 10–15 €/persona).
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo gestionar el catering por persona?</strong>
              <p>
                El precio de menú estándar en 2025 está entre <strong>60 y 120 €/persona</strong>.
                Incluye normalmente: cóctel de bienvenida, primer plato, segundo plato, postre y bebidas.
                Confirma siempre qué bebidas están incluidas y si hay suplemento por menú infantil o vegetariano.
                Negocia la señal (máximo 20%) y paga el resto a 30 días del evento.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Lista de invitados: cómo decir no sin conflictos?</strong>
              <p>
                Establece criterios objetivos desde el principio: solo familia directa y amigos íntimos,
                o todos los compañeros de trabajo o ninguno. Comunícalo de forma uniforme. Una norma
                útil: &ldquo;si no hemos quedado en los últimos dos años, no está en la lista&rdquo;.
                Evita las excepciones porque crean agravios comparativos.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Boda en jueves/viernes: ventajas de precio?</strong>
              <p>
                Los jueves y viernes pueden suponer un ahorro del <strong>20–35%</strong> sobre el precio
                de sábado en venues y catering. Muchos caterings aplican tarifa reducida. Desventaja:
                algunos invitados no podrán asistir por trabajo. Ideal si tienes muchos amigos con
                flexibilidad horaria o si valoras el ahorro sobre la asistencia masiva.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo funciona la financiación de bodas?</strong>
              <p>
                Algunos bancos y financieras ofrecen préstamos personales específicos para bodas
                a 3–5 años. TAE habitual: 6–10%. Para una boda de 20.000 €, la cuota mensual a 4 años
                es de ~460–480 €. Alternativa: pedir a familiares cercanos que participen en el coste
                como regalo. Muchas parejas usan listas de boda para cubrir el banquete o el viaje de novios.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué seguro de boda existe en España?</strong>
              <p>
                El seguro de cancelación de bodas cubre la devolución de señales y pagos anticipados
                si la boda se cancela por causa justificada (enfermedad grave, fallecimiento, siniestro
                en el venue). Precio habitual: 150–400 € para una boda de 20.000 €. Compañías como
                Mapfre, AXA o Berkley ofrecen este producto. Es especialmente recomendable si pagas
                señales superiores a 2.000 € en un mismo proveedor.
              </p>
              <p className={styles.faqTip}>
                Revisar siempre las exclusiones: muchas pólizas no cubren cancelación por &ldquo;cambio de opinión&rdquo;
                ni las consecuencias económicas de una boda en el extranjero.
              </p>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: GUÍA PASO A PASO ── */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Del Sí Quiero a la Boda</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>18–12 meses antes: Decisiones fundacionales</h4>
                <p>
                  Define el presupuesto máximo real (no el que quisieras, sino el que tienes disponible).
                  Establece el número aproximado de invitados —esta cifra determina todo lo demás—.
                  Elige el estilo de boda: íntima, clásica, al aire libre, destino. Empieza a visitar venues
                  sin compromiso. Reserva venue y fotógrafo en cuanto decidas la fecha: son los proveedores
                  con menos disponibilidad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>12–9 meses antes: Reservas principales</h4>
                <p>
                  Firma contrato con venue y catering. Reserva fotógrafo y videógrafo con señal.
                  Empieza la búsqueda del vestido (los pedidos tardan 4–6 meses en llegar).
                  Reserva DJ u orquesta. Si es boda religiosa, habla con el párroco para reservar fecha.
                  Plantilla de presupuesto en el planificador con estimaciones reales.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>9–6 meses antes: Decisiones de estilo</h4>
                <p>
                  Envía Save the Date (físico o digital). Elige floristería y estilo floral.
                  Primera prueba del vestido o traje. Reserva maquillaje y peluquería para el día D.
                  Organiza alojamiento para invitados de fuera. Tramita documentación legal
                  (registro civil, expediente matrimonial o dispensa religiosa).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>6–3 meses antes: Detalles y confirmaciones</h4>
                <p>
                  Envía invitaciones oficiales con RSVP. Cierra el menú definitivo con el catering.
                  Segunda prueba del vestido. Elige la tarta nupcial y la mesa dulce. Compra alianzas
                  (calcula 6–8 semanas para grabado). Empieza las clases de baile si queréis primer baile.
                  Diseña el seating (distribución de mesas) con los confirmados.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>3–1 mes antes: Confirmaciones finales</h4>
                <p>
                  Cierra la lista definitiva de invitados y comunica el número exacto al catering.
                  Reúnete con fotógrafo para planificar reportaje y momentos clave.
                  Confirma horarios con todos los proveedores por escrito. Prepara sobres con pagos
                  para el día de la boda (propinas incluidas). Ensayo general de ceremonia.
                  Prueba de maquillaje y peinado para validar el look.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h4>Última semana: Detalles finales</h4>
                <p>
                  Recoge vestido/traje de la tienda. Prepara maleta de luna de miel y documenta el pasaporte
                  si es viaje internacional. Entrega seating definitivo al responsable del venue.
                  Designa a una persona de confianza (no de la pareja) como coordinadora del día:
                  será el interlocutor con todos los proveedores.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">7</div>
              <div className={styles.stepContent}>
                <h4>El día de la boda: Disfrutar es la prioridad</h4>
                <p>
                  Desayuna bien. Empieza maquillaje y peluquería con 3 horas de margen.
                  El coordinador del día gestiona los imprevistos —tú no tienes que saber nada—.
                  Lleva un kit de emergencia: agua, tiritas, costurero, pañuelos, analgésico.
                  Tómate un momento a solas con tu pareja durante el cóctel para asimilar el día.
                  Todo lo que salga diferente a lo planeado formará parte del recuerdo. Disfruta.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 5: MEJORES PRÁCTICAS ── */}
        <section className={styles.guideSection}>
          <h2>6 Mejores Prácticas para Ahorrar sin Renunciar a Nada</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <h4>Negocia paquetes cerrados</h4>
              <p>
                Muchos venues incluyen catering, menaje y personal en un paquete integral.
                Negociar el paquete completo suele ser 10–15% más barato que contratar cada
                servicio por separado. Pide siempre comparativa desglosada.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>Elige días entre semana</h4>
              <p>
                Jueves y viernes ofrecen descuentos de 20–35% sobre el precio de sábado en
                la mayoría de venues y caterings. Si tu entorno tiene flexibilidad laboral,
                es el ahorro más sencillo sin sacrificar calidad.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">❄️</span>
              <h4>Temporada baja (noviembre–marzo)</h4>
              <p>
                Los meses de invierno, excepto diciembre, son hasta un 30% más económicos.
                Las flores de temporada bajan de precio. El riesgo de calor extremo desaparece
                para bodas al aire libre. La disponibilidad de proveedores es mucho mayor.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <h4>Contrata seguro de cancelación</h4>
              <p>
                Por 150–400 € proteges las señales y pagos anticipados (que pueden superar
                5.000–8.000 €) ante cancelación por enfermedad grave o siniestro en el venue.
                Contrata nada más reservar el primer proveedor, no el mes anterior.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h4>Lista definitiva antes de reservar</h4>
              <p>
                Cierra la lista de invitados antes de firmar ningún contrato con el catering
                o el venue. Añadir invitados después de firmado supone coste extra o
                conflictos de aforo. El número de invitados es la variable que más impacta
                en el presupuesto total.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💬</span>
              <h4>Pide degustación y referencias</h4>
              <p>
                Exige siempre una degustación de menú antes de contratar el catering y
                pide referencias de bodas anteriores. Un proveedor con buenas referencias
                verificables reduce enormemente el riesgo de decepción el día de la boda.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: WARNING BOX — ERRORES QUE DISPARAN EL PRESUPUESTO ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 Errores que Disparan el Presupuesto de tu Boda</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No tener contrato escrito con cada proveedor.</strong> Sin contrato no hay
                garantía de servicio, precio ni condiciones de cancelación. Exige siempre documento
                firmado con todos los detalles: fecha, hora, lugar, servicios incluidos, precio total y
                forma de pago.
              </li>
              <li>
                <strong>Pagar señales sin contrato firmado.</strong> Pagar una reserva verbal sin
                contrato puede suponer perder esa cantidad si el proveedor desaparece o cambia
                las condiciones. La señal máxima razonable es el 20–30% del total pactado.
              </li>
              <li>
                <strong>No incluir propinas en el presupuesto.</strong> Las propinas al equipo de
                catering, DJ, fotógrafo y conductor son habituales en España: 50–100 € por
                proveedor. Para una boda media con 5–6 proveedores supone 300–600 € que
                no suelen estar contemplados.
              </li>
              <li>
                <strong>Olvidar los gastos de luna de miel en el presupuesto total.</strong> El viaje
                de novios se presupuesta por separado pero sale del mismo dinero. Una luna de miel
                media cuesta entre 3.000 y 8.000 €. Si no lo incluyes en el presupuesto global,
                el gasto total real será muy superior al planificado.
              </li>
              <li>
                <strong>No preguntar qué está incluido exactamente en el menú.</strong> El precio
                por persona puede variar 20–40 € según si incluye o no cóctel, bebidas, barra libre
                o animación. Compara siempre con el mismo desglose para no llevarte sorpresas en
                la factura final.
              </li>
              <li>
                <strong>Dejar la coordinación del día sin asignar.</strong> Sin una persona responsable
                de coordinar proveedores el día de la boda, los problemas logísticos recaen sobre
                la pareja. Nombra a alguien de confianza (o contrata un coordinador de día: 500–1.000 €)
                para que tú puedas disfrutar sin gestionar.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-boda')} />

      <ShareCard appName="planificador-boda" />
      <Footer appName="planificador-boda" />
    </div>
  );
}
