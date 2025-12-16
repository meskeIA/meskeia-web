'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './PlanificadorBoda.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps} from '@/components';
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
        <h1 className={styles.title}>💒 Planificador de Boda</h1>
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

      {/* Fecha de boda */}
      <div className={styles.dateSection}>
        <label className={styles.dateLabel}>
          📅 Fecha de la boda:
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
          className={`${styles.tab} ${activeTab === 'checklist' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          ✅ Checklist
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'presupuesto' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('presupuesto')}
        >
          💰 Presupuesto
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          ⏰ Timeline
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
                  className={`${styles.filterBtn} ${monthsFilter === 'all' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('all')}
                >
                  Todas
                </button>
                <button
                  className={`${styles.filterBtn} ${monthsFilter === '12-6' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('12-6')}
                >
                  12-6 meses
                </button>
                <button
                  className={`${styles.filterBtn} ${monthsFilter === '6-3' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('6-3')}
                >
                  6-3 meses
                </button>
                <button
                  className={`${styles.filterBtn} ${monthsFilter === '3-1' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('3-1')}
                >
                  3-1 mes
                </button>
                <button
                  className={`${styles.filterBtn} ${monthsFilter === 'ultimo-mes' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('ultimo-mes')}
                >
                  Último mes
                </button>
                <button
                  className={`${styles.filterBtn} ${monthsFilter === 'dia-d' ? styles.activeFilter : ''}`}
                  onClick={() => setMonthsFilter('dia-d')}
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
        <button onClick={resetAll} className={styles.btnDanger}>
          🗑️ Borrar todos los datos
        </button>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>💡 Información</h3>
        <p>
          Este planificador es una guía orientativa. Los porcentajes de presupuesto son aproximados
          y pueden variar según la zona geográfica, tipo de celebración y preferencias personales.
          Te recomendamos consultar con profesionales del sector para presupuestos detallados.
        </p>
      </div>

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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-boda')} />

      <Footer appName="planificador-boda" />
    </div>
  );
}
