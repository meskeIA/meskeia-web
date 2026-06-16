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
        <h1 className={styles.title}><span aria-hidden="true">📅</span> Planificador de Menú Semanal</h1>
        <p className={styles.subtitle}>
          Organiza tus comidas de la semana de forma equilibrada y saludable
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Controles */}
      <div className={styles.controls}>
        <button type="button" onClick={generateRandomMenu} className={styles.btnPrimary}>
          <span aria-hidden="true">🎲</span> Generar Menú Aleatorio
        </button>
        <button type="button" onClick={clearMenu} className={styles.btnSecondary}>
          <span aria-hidden="true">🗑️</span> Limpiar Todo
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
                  {mealType === 'desayuno' && <><span aria-hidden="true">🌅</span> Desayuno</>}
                  {mealType === 'almuerzo' && <><span aria-hidden="true">☀️</span> Almuerzo</>}
                  {mealType === 'cena' && <><span aria-hidden="true">🌙</span> Cena</>}
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
                type="button"
                className={styles.modalClose}
                onClick={() => setShowSuggestions(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className={styles.suggestionsGrid}>
              {MEAL_OPTIONS[showSuggestions.meal].map((option, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={styles.suggestionCard}
                  onClick={() => selectMeal(showSuggestions.day, showSuggestions.meal, option.name)}
                >
                  <span className={styles.suggestionIcon} aria-hidden="true">{option.icon}</span>
                  <span className={styles.suggestionName}>{option.name}</span>
                  <span className={styles.suggestionCategory}>{option.category}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
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
          <h3><span aria-hidden="true">🛒</span> Consejos para la Compra</h3>
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
            <li><strong>De forma ocasional y en cantidades moderadas</strong>: Ultraprocesados, azúcares añadidos, bollería industrial, refrescos azucarados.</li>
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
            <li><strong>🌅 Desayuno</strong>: si tienes hambre al despertar, prioriza proteína (huevo, yogur), hidratos complejos (avena, pan integral) y fruta. Saltar el desayuno no es perjudicial si tu ingesta total y calidad del día son adecuadas.</li>
            <li><strong>☀️ Almuerzo (la comida principal)</strong>: En España, el almuerzo es la ingesta más importante del día. Debe ser completa: proteína + verduras + hidratos. Algunos estudios preliminares sugieren que adelantar la comida principal puede ayudar al control glucémico en algunas personas.</li>
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

        {/* SECCIÓN 1: Tabla Comparativa */}
        <section>
          <h4>Comparativa de tipos de planificación de menú</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Tiempo preparación</th>
                  <th>Ahorro estimado</th>
                  <th>Variedad</th>
                  <th>Facilidad compra</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Semanal estándar</strong></td>
                  <td>30–45 min/semana</td>
                  <td>15–25 €/semana</td>
                  <td>Alta</td>
                  <td>Muy fácil</td>
                  <td>Familias con rutina estable</td>
                </tr>
                <tr>
                  <td><strong>Batch cooking</strong></td>
                  <td>2–3 h un día</td>
                  <td>20–35 €/semana</td>
                  <td>Media</td>
                  <td>Fácil (lista única)</td>
                  <td>Personas ocupadas entre semana</td>
                </tr>
                <tr>
                  <td><strong>Dieta específica</strong></td>
                  <td>45–60 min/semana</td>
                  <td>10–20 €/semana</td>
                  <td>Media</td>
                  <td>Requiere más atención</td>
                  <td>Control de macros, intolerancias</td>
                </tr>
                <tr>
                  <td><strong>Familia con niños</strong></td>
                  <td>45 min/semana</td>
                  <td>20–30 €/semana</td>
                  <td>Alta</td>
                  <td>Fácil con plantilla fija</td>
                  <td>Hogares con menores</td>
                </tr>
                <tr>
                  <td><strong>Deportista</strong></td>
                  <td>60–90 min/semana</td>
                  <td>15–25 €/semana</td>
                  <td>Media</td>
                  <td>Moderada</td>
                  <td>Personas con objetivos físicos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso */}
        <section>
          <h4>Casos de uso: 4 perfiles reales</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧‍👦</span>
                <strong>Familia con dos adultos y dos niños</strong>
              </div>
              <p className={styles.escenarioExample}>
                Cocinan los domingos en familia: los niños ayudan a elegir platos del menú, lo que reduce rechazos a la hora de cenar. Preparan en lote las legumbres y los cereales para toda la semana.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Tener 2–3 platos que gusten a todos para los días de más agobio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍳</span>
                <strong>Persona que hace batch cooking</strong>
              </div>
              <p className={styles.escenarioExample}>
                Dedica 2,5 horas cada domingo: cuece legumbres, asa verduras, prepara proteínas marinadas y congela raciones individuales. Entre semana solo ensambla y calienta.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Cocinar bases versátiles (arroz, lentejas, pechuga) que sirvan para varios platos distintos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏋️</span>
                <strong>Deportista que ajusta macros</strong>
              </div>
              <p className={styles.escenarioExample}>
                Planifica cada comida según el día de entrenamiento: más carbohidratos antes y después del ejercicio, más proteína en días de fuerza, cenas ligeras en días de descanso.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Calcular las raciones por peso corporal (1,6–2,2 g proteína/kg) y ajustar semanalmente según objetivos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧓</span>
                <strong>Persona mayor que cocina para uno o dos</strong>
              </div>
              <p className={styles.escenarioExample}>
                Planifica menús con porciones pequeñas pero completas nutricionalmente. Aprovecha los guisos para hacer el doble y congelar. Prioriza alimentos blandos y fáciles de masticar.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Las conservas de calidad (sardinillas, atún al natural, legumbres) son aliadas perfectas para cocinar para uno.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section>
          <h4>Preguntas frecuentes sobre planificación de menú</h4>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Cuánto se ahorra planificando el menú semanal?</strong>
              <p>Entre 15 y 35 euros semanales de media, según el tamaño del hogar. El ahorro viene de comprar solo lo necesario, reducir el desperdicio (los españoles tiramos unos 31 kg de alimentos por persona al año) y evitar compras impulsivas o pedidos a domicilio de urgencia.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es el batch cooking?</strong>
              <p>Consiste en dedicar 2–3 horas un día a la semana (normalmente el domingo) para cocinar en lote las bases de todas las comidas: cereales, legumbres, proteínas marinadas y verduras asadas. El resto de la semana solo ensamblas los platos en 10 minutos.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo evitar el desperdicio de alimentos?</strong>
              <p>Primero revisa siempre la nevera y despensa antes de planificar, para usar lo que ya tienes. Planifica los alimentos más perecederos (pescado fresco, hoja verde) para los primeros días de la semana, y los más duraderos (huevos, conservas, congelados) para el final.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo planificar menús variados sin repetir?</strong>
              <p>Aplica la regla de rotación: un día legumbre, un día pescado azul, un día aves, un día huevos, un día pescado blanco, un día carne magra. Cambia la técnica de cocción (plancha, horno, vapor, guiso) para que el mismo ingrediente resulte diferente.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué alimentos duran más en la nevera una vez cocinados?</strong>
              <p>Las legumbres cocidas aguantan 4–5 días. Los cereales (arroz, quinoa, pasta) 3–4 días. Las carnes y pescados cocinados, 2–3 días. Las sopas y cremas, 3–4 días. Para todo lo demás, el congelador a –18 °C mantiene la calidad hasta 3 meses.</p>
              <p className={styles.faqTip}>Consejo: etiqueta siempre los tuppers con la fecha de preparación.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo planificar menús saludables con poco presupuesto?</strong>
              <p>Las legumbres son la proteína más económica (menos de 1 €/ración). Los huevos, el atún en lata y el pollo congelado también son opciones baratas y nutritivas. Compra fruta y verdura de temporada y en mercado, donde es entre un 30 y 50 % más barata que en grandes superficies.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuántas raciones preparar de cada plato?</strong>
              <p>Para batch cooking de una persona: 3–4 raciones de cada preparación base. Para una familia de cuatro: duplica siempre las recetas. Una olla de legumbres (400 g en seco) da aproximadamente 8 raciones de guarnición o 6 de plato principal.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo adaptar el menú a intolerancias?</strong>
              <p>Identifica primero los grupos problemáticos (gluten, lactosa, frutos secos, huevo) y sus alternativas equivalentes. El arroz, la quinoa y las patatas sustituyen al trigo. Las bebidas vegetales y el yogur de coco sustituyen a los lácteos. Prepara siempre las versiones sin alérgeno antes de las versiones con alérgeno para evitar contaminación cruzada.</p>
            </li>
          </ul>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section>
          <h4>Cómo planificar el menú semanal: guía paso a paso</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Revisa nevera y despensa</strong>
                <p>Antes de planificar nada, comprueba qué tienes. Usa primero los alimentos próximos a caducar o los más perecederos. Anota lo que falta de básicos (aceite, especias, conservas).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Consulta el calendario de la semana</strong>
                <p>¿Hay días con poco tiempo para cocinar? ¿Alguna cena fuera de casa? ¿Niños con actividades extraescolares? Asigna platos rápidos (&lt;20 min) a los días más ocupados y platos elaborados al fin de semana.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Elige los platos principales de almuerzo</strong>
                <p>Aplica la rotación semanal: legumbre, pescado azul, aves, huevos, pescado blanco, carne magra, libre. Busca variedad de colores y técnicas de cocción para garantizar diversidad nutricional.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Planifica las cenas (ligeras y complementarias)</strong>
                <p>Si el almuerzo fue de carne, cena verduras o pescado. Si el almuerzo fue contundente, opta por una crema de verduras o una ensalada proteica. Las cenas deben equilibrar, no repetir, el almuerzo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Completa los desayunos</strong>
                <p>Planifica 2–3 opciones de desayuno que rotes durante la semana. No es necesario variar cada día: simplificar los desayunos reduce la carga mental y facilita la compra.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Identifica qué puedes cocinar en lote</strong>
                <p>Marca los platos que se prestan a batch cooking: legumbres, cereales, caldos, salsas base, verduras asadas. Planifica cocinarlos en una sesión el fin de semana para ganar tiempo entre semana.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Genera la lista de compra optimizada</strong>
                <p>Agrupa los ingredientes por categorías: frutas y verduras, carnes y pescados, lácteos y huevos, legumbres y cereales, conservas y básicos. Verifica cantidades exactas para evitar comprar de más o de menos.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section>
          <h4>6 claves para una planificación eficaz</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥬</span>
              <strong>Planifica los perecederos primero</strong>
              <p>Asigna el pescado fresco, la hoja verde y los lácteos naturales a los primeros días de la semana. Deja los congelados, huevos y conservas para el jueves y viernes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍚</span>
              <strong>Prepara bases versátiles</strong>
              <p>Un lote de arroz integral, lentejas cocidas y garbanzos puede transformarse en ensalada, guiso, wrap o salteado según el día. La versatilidad reduce el aburrimiento sin aumentar el trabajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧊</span>
              <strong>Usa el congelador estratégicamente</strong>
              <p>Congela en raciones individuales: porciones de caldo, guisos listos, proteínas marinadas y frutas maduras para batidos. El congelador es tu seguro contra días caóticos y contra el desperdicio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <strong>Mantén recetas comodín rápidas</strong>
              <p>Ten siempre en mente 3–4 recetas que se hacen en menos de 15 minutos: tortilla, atún con ensalada, sardinas con tostada, huevos revueltos con champiñones. Son tu salvavidas para los días imprevistos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛒</span>
              <strong>Compra una vez a la semana</strong>
              <p>La compra semanal única reduce el gasto impulsivo hasta un 30 %. Si necesitas reposición, limítala a frescos imprescindibles (pan, fruta) y evita pasillos que no estaban en tu lista.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <strong>Guarda tu menú favorito</strong>
              <p>Cuando encuentres una combinación que funcione bien para tu familia, guárdala como plantilla. Rotarla cada 3–4 semanas te ahorra tiempo de planificación y garantiza aceptación en casa.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores que generan desperdicio y gasto extra</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Planificar sin revisar la nevera primero.</strong> Comprar ingredientes que ya tienes o que están a punto de caducar es la causa número uno de desperdicio. Dedica 5 minutos a revisar antes de empezar.
              </li>
              <li>
                <strong>No tener en cuenta las cenas fuera de casa.</strong> Si no anotas que el miércoles cenas fuera, acabas comprando ingredientes que no se usan y se estropean. Consulta el calendario antes de planificar.
              </li>
              <li>
                <strong>Cocinar demasiado de platos que no se congelan bien.</strong> Las ensaladas, las patatas cocidas, los platos con mayonesa y las salsas emulsionadas pierden textura al congelar. Calcula solo las raciones que se van a consumir en fresco.
              </li>
              <li>
                <strong>Ignorar las promociones del supermercado.</strong> Planificar sin mirar los folletos de oferta hace que pierdas ahorros del 20–40 % en proteínas y conservas. Ajusta el menú a las ofertas de proteínas una vez a la semana.
              </li>
              <li>
                <strong>Planificar platos demasiado elaborados para los días laborables.</strong> Un menú ambicioso que no se ejecuta es peor que uno sencillo que sí se cumple. Reserva las recetas complejas para el fin de semana.
              </li>
              <li>
                <strong>No contar los desayunos ni las meriendas en la lista de compra.</strong> Olvidar estos momentos del día lleva a compras de urgencia (más caras) o a recurrir a ultraprocesados por falta de opciones saludables disponibles.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="general"
        severity="critical"
        context="planificador-menu"
        collapsible={false}
      />

      

      <RelatedApps apps={getRelatedApps('planificador-menu')} />
      <ShareCard appName="planificador-menu" />
      <Footer appName="planificador-menu" />
    </div>
  );
}
