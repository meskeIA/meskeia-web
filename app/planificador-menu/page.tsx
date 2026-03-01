'use client';

import { useState } from 'react';
import styles from './PlanificadorMenu.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice lastUpdated="2026-02-02" />

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

      <EducationalSection
        title="Guía de Nutrición y Planificación Semanal"
        subtitle="La dieta mediterránea, grupos alimentarios, frecuencias recomendadas y consejos de meal prep"
        icon="🥗"
      >
        <section>
          <h4>La Dieta Mediterránea: el estándar de referencia</h4>
          <p>La dieta mediterránea es el patrón alimentario con mayor evidencia científica sobre beneficios para la salud cardiovascular, longevidad y prevención de enfermedades crónicas. La <strong>pirámide mediterránea</strong> recomienda:</p>
          <ul>
            <li><strong>Base diaria</strong>: Verduras (2+ raciones), frutas (3+ piezas), legumbres (al menos 2x/semana), cereales integrales, aceite de oliva virgen extra, agua.</li>
            <li><strong>Varias veces a la semana</strong>: Pescado (2-3x), aves sin piel (2x), huevos (2-4 unidades), lácteos fermentados (yogur, queso en moderación).</li>
            <li><strong>Ocasionalmente</strong>: Carne roja (máx. 2x/semana), embutidos curados con moderación.</li>
            <li><strong>Mínimo o nada</strong>: Ultraprocesados, azúcares añadidos, bollería industrial, refrescos azucarados.</li>
          </ul>
        </section>

        <section>
          <h4>Frecuencias recomendadas por grupo alimentario</h4>
          <ul>
            <li><strong>🥗 Verduras y hortalizas</strong>: Al menos 2 raciones diarias. Una en almuerzo y otra en cena. Variadas y de temporada.</li>
            <li><strong>🐟 Pescado</strong>: 2-3 veces por semana. Alterna blanco (merluza, dorada) y azul (salmón, sardinas, atún). El pescado azul aporta omega-3.</li>
            <li><strong>🫘 Legumbres</strong>: 2-4 veces por semana. Lentejas, garbanzos, alubias y guisantes son proteína vegetal económica y con alto contenido en fibra.</li>
            <li><strong>🍗 Aves</strong>: 2-3 veces por semana. Pollo y pavo sin piel son proteínas magras con bajo contenido en grasas saturadas.</li>
            <li><strong>🥩 Carne roja</strong>: Máximo 2 veces por semana y en raciones moderadas (&lt;150g). Preferir carnes magras (lomo, ternera magra).</li>
            <li><strong>🥚 Huevos</strong>: 3-5 unidades por semana. Completos nutricionalmente y muy versátiles en cocina.</li>
          </ul>
        </section>

        <section>
          <h4>Estructura de las comidas: la importancia del horario</h4>
          <ul>
            <li><strong>🌅 Desayuno</strong>: No saltarlo. Activa el metabolismo. Aportar proteína (huevo, yogur) + hidratos complejos (avena, pan integral) + fruta. Evitar azúcares simples en ayunas.</li>
            <li><strong>☀️ Almuerzo (la comida principal)</strong>: En España, el almuerzo es la ingesta más importante del día. Debe ser completa: proteína + verduras + hidratos. Comer antes de las 15h mejora el control glucémico.</li>
            <li><strong>🌙 Cena (ligera y temprana)</strong>: Cenar ligero y al menos 2h antes de acostarse. Priorizar verduras, huevos y pescado blanco sobre carnes pesadas o pasta abundante.</li>
          </ul>
        </section>

        <section>
          <h4>Meal prep: cocinar en lote para ahorrar tiempo</h4>
          <ul>
            <li><strong>Legumbres</strong>: Cocínalas en grandes cantidades y congela en porciones. Una vez cocidas aguantan 4-5 días en nevera.</li>
            <li><strong>Cereales</strong>: Quinoa, arroz o pasta integral cocinados en lote se conservan 3-4 días en nevera y son base para múltiples platos.</li>
            <li><strong>Proteínas</strong>: El pollo marinado congelado en porciones individuales permite descongelar solo lo necesario.</li>
            <li><strong>Verduras asadas</strong>: Una bandeja de verduras de temporada al horno (calabacín, pimiento, berenjena, cebolla) dura varios días y combina con cualquier proteína.</li>
            <li><strong>Caldos caseros</strong>: Aprovecha recortes de verduras para hacer caldo base. Congelado en cubiteras es útil para cualquier guiso.</li>
          </ul>
        </section>

        <section>
          <h4>Compra eficiente y de temporada</h4>
          <ul>
            <li><strong>Productos de temporada</strong>: Son más baratos, más nutritivos y tienen mejor sabor. En invierno: espinacas, coliflor, alcachofas, naranjas. En verano: tomates, pimientos, calabacín, melocotones.</li>
            <li><strong>Congelados</strong>: Guisantes, espinacas, judías verdes y pescado congelado son tan nutritivos como frescos y reducen el desperdicio alimentario.</li>
            <li><strong>Legumbres en bote</strong>: Los garbanzos o lentejas en conserva (enjuagados) son igualmente válidos y ahorran tiempo de cocción.</li>
            <li><strong>Lista estructurada</strong>: Organiza la lista por secciones del supermercado: frescos (frutas/verduras → carnes/pescados → lácteos) + secos/conservas. Reduce tiempo y compras impulsivas.</li>
          </ul>
        </section>
      </EducationalSection>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="general"
        severity="low"
        context="planificador-menu"
        collapsible={true}
      />

      

      <RelatedApps apps={getRelatedApps('planificador-menu')} />
      <ShareCard appName="planificador-menu" />
      <Footer appName="planificador-menu" />
    </div>
  );
}
