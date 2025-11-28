'use client';

import { useState } from 'react';
import styles from './PlanificadorMenu.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
type MealType = 'desayuno' | 'almuerzo' | 'cena';

interface MealOption {
  name: string;
  icon: string;
  category: string;
}

interface DayMenu {
  desayuno: string;
  almuerzo: string;
  cena: string;
}

type WeekMenu = Record<DayOfWeek, DayMenu>;

const DAYS: { id: DayOfWeek; name: string; short: string }[] = [
  { id: 'lunes', name: 'Lunes', short: 'Lun' },
  { id: 'martes', name: 'Martes', short: 'Mar' },
  { id: 'miercoles', name: 'Miércoles', short: 'Mié' },
  { id: 'jueves', name: 'Jueves', short: 'Jue' },
  { id: 'viernes', name: 'Viernes', short: 'Vie' },
  { id: 'sabado', name: 'Sábado', short: 'Sáb' },
  { id: 'domingo', name: 'Domingo', short: 'Dom' },
];

const MEAL_OPTIONS: Record<MealType, MealOption[]> = {
  desayuno: [
    { name: 'Tostadas integrales con tomate y aceite', icon: '🍞', category: 'Mediterráneo' },
    { name: 'Yogur natural con fruta y avena', icon: '🥣', category: 'Lácteo' },
    { name: 'Tortilla francesa con pan integral', icon: '🍳', category: 'Proteico' },
    { name: 'Porridge de avena con frutos rojos', icon: '🫐', category: 'Cereal' },
    { name: 'Tostada de aguacate con huevo', icon: '🥑', category: 'Completo' },
    { name: 'Fruta de temporada con frutos secos', icon: '🍎', category: 'Ligero' },
    { name: 'Batido de plátano, avena y leche', icon: '🥛', category: 'Rápido' },
    { name: 'Pan con queso fresco y miel', icon: '🧀', category: 'Dulce' },
  ],
  almuerzo: [
    { name: 'Ensalada mediterránea con atún', icon: '🥗', category: 'Ligero' },
    { name: 'Pollo a la plancha con verduras', icon: '🍗', category: 'Proteico' },
    { name: 'Lentejas estofadas con verduras', icon: '🍲', category: 'Legumbre' },
    { name: 'Pasta integral con salsa de tomate', icon: '🍝', category: 'Pasta' },
    { name: 'Salmón al horno con patatas', icon: '🐟', category: 'Pescado' },
    { name: 'Arroz con verduras salteadas', icon: '🍚', category: 'Arroz' },
    { name: 'Garbanzos con espinacas', icon: '🥬', category: 'Legumbre' },
    { name: 'Merluza con ensalada verde', icon: '🐠', category: 'Pescado' },
    { name: 'Pechuga de pavo con quinoa', icon: '🦃', category: 'Proteico' },
    { name: 'Judías verdes con jamón y huevo', icon: '🥚', category: 'Tradicional' },
  ],
  cena: [
    { name: 'Crema de verduras casera', icon: '🥣', category: 'Ligero' },
    { name: 'Tortilla de calabacín', icon: '🍳', category: 'Huevo' },
    { name: 'Ensalada templada de pollo', icon: '🥗', category: 'Proteico' },
    { name: 'Pescado blanco al vapor', icon: '🐟', category: 'Pescado' },
    { name: 'Revuelto de champiñones', icon: '🍄', category: 'Huevo' },
    { name: 'Sopa de verduras con fideos', icon: '🍜', category: 'Sopa' },
    { name: 'Pimientos rellenos de arroz', icon: '🫑', category: 'Verdura' },
    { name: 'Hummus con crudités de verduras', icon: '🥕', category: 'Ligero' },
    { name: 'Sardinas con ensalada', icon: '🐠', category: 'Pescado' },
    { name: 'Calabacín relleno de carne', icon: '🥒', category: 'Completo' },
  ],
};

const EMPTY_MENU: WeekMenu = {
  lunes: { desayuno: '', almuerzo: '', cena: '' },
  martes: { desayuno: '', almuerzo: '', cena: '' },
  miercoles: { desayuno: '', almuerzo: '', cena: '' },
  jueves: { desayuno: '', almuerzo: '', cena: '' },
  viernes: { desayuno: '', almuerzo: '', cena: '' },
  sabado: { desayuno: '', almuerzo: '', cena: '' },
  domingo: { desayuno: '', almuerzo: '', cena: '' },
};

export default function PlanificadorMenuPage() {
  const [menu, setMenu] = useState<WeekMenu>(EMPTY_MENU);
  const [showSuggestions, setShowSuggestions] = useState<{ day: DayOfWeek; meal: MealType } | null>(null);
  const [menuGenerated, setMenuGenerated] = useState(false);

  const getRandomOption = (options: MealOption[]): string => {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex].name;
  };

  const generateRandomMenu = () => {
    const newMenu: WeekMenu = { ...EMPTY_MENU };

    // Para evitar repeticiones excesivas
    const usedAlmuerzos: string[] = [];
    const usedCenas: string[] = [];

    DAYS.forEach(day => {
      // Desayunos pueden repetirse más
      newMenu[day.id].desayuno = getRandomOption(MEAL_OPTIONS.desayuno);

      // Almuerzos: intentar no repetir
      let almuerzo = getRandomOption(MEAL_OPTIONS.almuerzo);
      let attempts = 0;
      while (usedAlmuerzos.includes(almuerzo) && attempts < 5) {
        almuerzo = getRandomOption(MEAL_OPTIONS.almuerzo);
        attempts++;
      }
      newMenu[day.id].almuerzo = almuerzo;
      usedAlmuerzos.push(almuerzo);

      // Cenas: intentar no repetir
      let cena = getRandomOption(MEAL_OPTIONS.cena);
      attempts = 0;
      while (usedCenas.includes(cena) && attempts < 5) {
        cena = getRandomOption(MEAL_OPTIONS.cena);
        attempts++;
      }
      newMenu[day.id].cena = cena;
      usedCenas.push(cena);
    });

    setMenu(newMenu);
    setMenuGenerated(true);
  };

  const selectMeal = (day: DayOfWeek, meal: MealType, value: string) => {
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value,
      },
    }));
    setShowSuggestions(null);
  };

  const clearMenu = () => {
    setMenu(EMPTY_MENU);
    setMenuGenerated(false);
  };

  const getMealIcon = (mealName: string, mealType: MealType): string => {
    const option = MEAL_OPTIONS[mealType].find(o => o.name === mealName);
    return option?.icon || '🍽️';
  };

  const countFilledMeals = (): number => {
    let count = 0;
    DAYS.forEach(day => {
      if (menu[day.id].desayuno) count++;
      if (menu[day.id].almuerzo) count++;
      if (menu[day.id].cena) count++;
    });
    return count;
  };

  const generateShoppingTips = (): string[] => {
    const tips: string[] = [];
    const meals = DAYS.flatMap(day => [
      menu[day.id].almuerzo,
      menu[day.id].cena,
    ]).filter(Boolean);

    const hasLegumbres = meals.some(m => m.toLowerCase().includes('lentejas') || m.toLowerCase().includes('garbanzos'));
    const hasPescado = meals.some(m => m.toLowerCase().includes('salmón') || m.toLowerCase().includes('merluza') || m.toLowerCase().includes('pescado') || m.toLowerCase().includes('sardinas'));
    const hasPollo = meals.some(m => m.toLowerCase().includes('pollo') || m.toLowerCase().includes('pavo'));
    const hasVerduras = meals.some(m => m.toLowerCase().includes('verdura') || m.toLowerCase().includes('ensalada') || m.toLowerCase().includes('calabacín'));

    if (hasLegumbres) tips.push('🫘 Legumbres: Puedes cocinarlas en lote y conservar en nevera 4-5 días');
    if (hasPescado) tips.push('🐟 Pescado: Compra fresco para consumir en 2 días o congelado');
    if (hasPollo) tips.push('🍗 Pollo/Pavo: Puedes marinar y congelar en porciones');
    if (hasVerduras) tips.push('🥬 Verduras: Compra de temporada para mejor precio y sabor');

    tips.push('🧄 Básicos: Ten siempre ajo, cebolla, aceite de oliva y especias');
    tips.push('🥚 Huevos: Versátiles para cualquier comida del día');

    return tips;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📅 Planificador de Menú Semanal</h1>
        <p className={styles.subtitle}>
          Organiza tus comidas de la semana de forma equilibrada y saludable
        </p>
      </header>

      {/* Controles */}
      <div className={styles.controls}>
        <button onClick={generateRandomMenu} className={styles.btnPrimary}>
          🎲 Generar Menú Aleatorio
        </button>
        <button onClick={clearMenu} className={styles.btnSecondary}>
          🗑️ Limpiar Todo
        </button>
      </div>

      {/* Contador de progreso */}
      <div className={styles.progressBar}>
        <div className={styles.progressInfo}>
          <span>Comidas planificadas: {countFilledMeals()} / 21</span>
          <span className={styles.progressPercent}>
            {Math.round((countFilledMeals() / 21) * 100)}%
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(countFilledMeals() / 21) * 100}%` }}
          />
        </div>
      </div>

      {/* Tabla del menú */}
      <div className={styles.menuWrapper}>
        <table className={styles.menuTable}>
          <thead>
            <tr>
              <th className={styles.mealHeader}></th>
              {DAYS.map(day => (
                <th key={day.id} className={styles.dayHeader}>
                  <span className={styles.dayFull}>{day.name}</span>
                  <span className={styles.dayShort}>{day.short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['desayuno', 'almuerzo', 'cena'] as MealType[]).map(mealType => (
              <tr key={mealType}>
                <td className={styles.mealLabel}>
                  {mealType === 'desayuno' && '🌅 Desayuno'}
                  {mealType === 'almuerzo' && '☀️ Almuerzo'}
                  {mealType === 'cena' && '🌙 Cena'}
                </td>
                {DAYS.map(day => (
                  <td key={`${day.id}-${mealType}`} className={styles.mealCell}>
                    <div
                      className={`${styles.mealContent} ${menu[day.id][mealType] ? styles.filled : ''}`}
                      onClick={() => setShowSuggestions({ day: day.id, meal: mealType })}
                    >
                      {menu[day.id][mealType] ? (
                        <>
                          <span className={styles.mealIcon}>
                            {getMealIcon(menu[day.id][mealType], mealType)}
                          </span>
                          <span className={styles.mealText}>
                            {menu[day.id][mealType]}
                          </span>
                        </>
                      ) : (
                        <span className={styles.addMeal}>+ Añadir</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de sugerencias */}
      {showSuggestions && (
        <div className={styles.modalOverlay} onClick={() => setShowSuggestions(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                Selecciona {showSuggestions.meal} para{' '}
                {DAYS.find(d => d.id === showSuggestions.day)?.name}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowSuggestions(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.suggestionsGrid}>
              {MEAL_OPTIONS[showSuggestions.meal].map((option, idx) => (
                <button
                  key={idx}
                  className={styles.suggestionCard}
                  onClick={() => selectMeal(showSuggestions.day, showSuggestions.meal, option.name)}
                >
                  <span className={styles.suggestionIcon}>{option.icon}</span>
                  <span className={styles.suggestionName}>{option.name}</span>
                  <span className={styles.suggestionCategory}>{option.category}</span>
                </button>
              ))}
            </div>
            <button
              className={styles.btnClear}
              onClick={() => selectMeal(showSuggestions.day, showSuggestions.meal, '')}
            >
              Dejar vacío
            </button>
          </div>
        </div>
      )}

      {/* Tips de compra */}
      {menuGenerated && countFilledMeals() > 10 && (
        <div className={styles.shoppingTips}>
          <h3>🛒 Consejos para la Compra</h3>
          <ul>
            {generateShoppingTips().map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Principios del menú equilibrado */}
      <div className={styles.principles}>
        <h3>💡 Principios de un Menú Equilibrado</h3>
        <div className={styles.principlesGrid}>
          <div className={styles.principleCard}>
            <span className={styles.principleIcon}>🥗</span>
            <h4>Variedad</h4>
            <p>Incluye diferentes grupos de alimentos cada día</p>
          </div>
          <div className={styles.principleCard}>
            <span className={styles.principleIcon}>🐟</span>
            <h4>Pescado 2-3x</h4>
            <p>Al menos 2-3 raciones de pescado por semana</p>
          </div>
          <div className={styles.principleCard}>
            <span className={styles.principleIcon}>🫘</span>
            <h4>Legumbres 2-3x</h4>
            <p>Incluye legumbres varias veces por semana</p>
          </div>
          <div className={styles.principleCard}>
            <span className={styles.principleIcon}>🥬</span>
            <h4>Verduras diarias</h4>
            <p>Verduras en almuerzo y cena cada día</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>📋 Información</h3>
        <p>
          Este planificador ofrece sugerencias generales basadas en la dieta mediterránea.
          Las opciones son orientativas y pueden adaptarse a tus preferencias y necesidades.
          Para planes nutricionales específicos, consulta con un profesional de la nutrición.
        </p>
      </div>

      <Footer appName="planificador-menu" />
    </div>
  );
}
