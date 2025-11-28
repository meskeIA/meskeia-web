'use client';

import { useState } from 'react';
import styles from './CalculadoraPorciones.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

interface PortionMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  equivalent: string;
  image: string;
}

interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  foods: FoodItem[];
}

interface FoodItem {
  name: string;
  portion: string;
  method: string;
  grams: string;
  tip?: string;
}

const HAND_METHODS: PortionMethod[] = [
  {
    id: 'fist',
    name: 'Puño cerrado',
    icon: '✊',
    description: 'El tamaño de tu puño cerrado',
    equivalent: '≈ 1 taza (240ml) o 150-200g',
    image: 'Para carbohidratos y frutas',
  },
  {
    id: 'palm',
    name: 'Palma de la mano',
    icon: '🤚',
    description: 'Tu palma sin los dedos, con el grosor de un mazo de cartas',
    equivalent: '≈ 85-115g de proteína',
    image: 'Para carnes, pescado, tofu',
  },
  {
    id: 'handful',
    name: 'Puñado',
    icon: '🫳',
    description: 'Lo que cabe en tu mano ahuecada',
    equivalent: '≈ 30g de frutos secos',
    image: 'Para snacks y frutos secos',
  },
  {
    id: 'thumb',
    name: 'Pulgar',
    icon: '👍',
    description: 'El tamaño de tu dedo pulgar',
    equivalent: '≈ 1 cucharada (15ml/15g)',
    image: 'Para grasas y aceites',
  },
  {
    id: 'fingertip',
    name: 'Punta del dedo',
    icon: '☝️',
    description: 'La primera falange del dedo índice',
    equivalent: '≈ 1 cucharadita (5ml/5g)',
    image: 'Para mantequilla, mayonesa',
  },
  {
    id: 'two-hands',
    name: 'Dos manos juntas',
    icon: '🙌',
    description: 'Ambas manos juntas formando un cuenco',
    equivalent: '≈ 2 tazas o porción de ensalada',
    image: 'Para verduras y ensaladas',
  },
];

const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: 'proteins',
    name: 'Proteínas',
    icon: '🥩',
    color: '#E74C3C',
    foods: [
      { name: 'Pechuga de pollo', portion: '1 palma', method: 'palm', grams: '100-120g', tip: 'Grosor de un mazo de cartas' },
      { name: 'Filete de ternera', portion: '1 palma', method: 'palm', grams: '100-120g' },
      { name: 'Pescado (filete)', portion: '1 palma', method: 'palm', grams: '100-150g', tip: 'Puede ser ligeramente más grande' },
      { name: 'Huevos', portion: '2 unidades', method: 'palm', grams: '100g', tip: 'Equivale a una palma de proteína' },
      { name: 'Tofu', portion: '1 palma', method: 'palm', grams: '100-120g' },
      { name: 'Legumbres cocidas', portion: '1 puño', method: 'fist', grams: '150-180g' },
    ],
  },
  {
    id: 'carbs',
    name: 'Carbohidratos',
    icon: '🍚',
    color: '#F39C12',
    foods: [
      { name: 'Arroz cocido', portion: '1 puño', method: 'fist', grams: '150-180g' },
      { name: 'Pasta cocida', portion: '1 puño', method: 'fist', grams: '150-180g' },
      { name: 'Patata', portion: '1 puño', method: 'fist', grams: '150-200g' },
      { name: 'Pan', portion: '1 palma', method: 'palm', grams: '40-50g', tip: '1-2 rebanadas según grosor' },
      { name: 'Cereales', portion: '1 puño', method: 'fist', grams: '30-40g secos' },
      { name: 'Avena', portion: '1 puño', method: 'fist', grams: '40g secos' },
    ],
  },
  {
    id: 'vegetables',
    name: 'Verduras',
    icon: '🥗',
    color: '#27AE60',
    foods: [
      { name: 'Ensalada de hojas', portion: '2 manos', method: 'two-hands', grams: '80-100g', tip: 'Puedes repetir sin problema' },
      { name: 'Verduras cocidas', portion: '1 puño', method: 'fist', grams: '150-200g' },
      { name: 'Verduras crudas', portion: '2 manos', method: 'two-hands', grams: '100-150g' },
      { name: 'Brócoli/Coliflor', portion: '1 puño', method: 'fist', grams: '150g' },
      { name: 'Zanahorias', portion: '1 puño', method: 'fist', grams: '100-120g' },
      { name: 'Tomate', portion: '1 puño', method: 'fist', grams: '150-180g' },
    ],
  },
  {
    id: 'fruits',
    name: 'Frutas',
    icon: '🍎',
    color: '#9B59B6',
    foods: [
      { name: 'Manzana/Pera', portion: '1 puño', method: 'fist', grams: '150-180g', tip: '1 pieza mediana' },
      { name: 'Plátano', portion: '1 unidad', method: 'fist', grams: '100-120g', tip: 'Tamaño medio' },
      { name: 'Frutos rojos', portion: '1 puño', method: 'fist', grams: '100-150g' },
      { name: 'Uvas', portion: '1 puño', method: 'fist', grams: '100-120g', tip: 'Aproximadamente 15-20 uvas' },
      { name: 'Naranja', portion: '1 puño', method: 'fist', grams: '150-200g' },
      { name: 'Sandía/Melón', portion: '2 puños', method: 'fist', grams: '200-250g' },
    ],
  },
  {
    id: 'fats',
    name: 'Grasas',
    icon: '🥑',
    color: '#2E86AB',
    foods: [
      { name: 'Aceite de oliva', portion: '1 pulgar', method: 'thumb', grams: '10-15ml', tip: '1 cucharada sopera' },
      { name: 'Aguacate', portion: '1/4 unidad', method: 'thumb', grams: '30-40g', tip: 'O 2 pulgares' },
      { name: 'Frutos secos', portion: '1 puñado', method: 'handful', grams: '25-30g', tip: 'Unas 15-20 almendras' },
      { name: 'Mantequilla', portion: '1 punta dedo', method: 'fingertip', grams: '5-10g' },
      { name: 'Queso curado', portion: '2 pulgares', method: 'thumb', grams: '30-40g' },
      { name: 'Semillas', portion: '1 cucharada', method: 'thumb', grams: '10-15g' },
    ],
  },
  {
    id: 'dairy',
    name: 'Lácteos',
    icon: '🥛',
    color: '#48A9A6',
    foods: [
      { name: 'Leche', portion: '1 vaso', method: 'fist', grams: '200-250ml' },
      { name: 'Yogur', portion: '1 unidad', method: 'fist', grams: '125g' },
      { name: 'Queso fresco', portion: '1 palma', method: 'palm', grams: '80-100g' },
      { name: 'Queso rallado', portion: '1 puñado', method: 'handful', grams: '20-30g' },
      { name: 'Requesón', portion: '1 puño', method: 'fist', grams: '100-150g' },
      { name: 'Kéfir', portion: '1 vaso', method: 'fist', grams: '200ml' },
    ],
  },
];

export default function CalculadoraPorcionesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('proteins');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const currentCategory = FOOD_CATEGORIES.find(c => c.id === selectedCategory);
  const currentMethod = selectedMethod ? HAND_METHODS.find(m => m.id === selectedMethod) : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>✋ Calculadora de Porciones</h1>
        <p className={styles.subtitle}>
          Aprende a medir las porciones de alimentos usando tu mano como referencia
        </p>
      </header>

      {/* Métodos de medición con la mano */}
      <section className={styles.methodsSection}>
        <h2 className={styles.sectionTitle}>🤚 Tu Mano como Herramienta de Medición</h2>
        <p className={styles.sectionDescription}>
          Tu mano es proporcional a tu cuerpo, lo que hace que sea una referencia personalizada perfecta
        </p>

        <div className={styles.methodsGrid}>
          {HAND_METHODS.map(method => (
            <div
              key={method.id}
              className={`${styles.methodCard} ${selectedMethod === method.id ? styles.methodSelected : ''}`}
              onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
            >
              <span className={styles.methodIcon}>{method.icon}</span>
              <h3 className={styles.methodName}>{method.name}</h3>
              <p className={styles.methodDescription}>{method.description}</p>
              <div className={styles.methodEquivalent}>{method.equivalent}</div>
              <span className={styles.methodUse}>{method.image}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Detalle del método seleccionado */}
      {currentMethod && (
        <div className={styles.methodDetail}>
          <div className={styles.methodDetailIcon}>{currentMethod.icon}</div>
          <div className={styles.methodDetailContent}>
            <h3>{currentMethod.name}</h3>
            <p>{currentMethod.description}</p>
            <p className={styles.methodDetailEquiv}><strong>Equivale a:</strong> {currentMethod.equivalent}</p>
            <p className={styles.methodDetailUse}><strong>Usar para:</strong> {currentMethod.image}</p>
          </div>
        </div>
      )}

      {/* Selector de categorías */}
      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>🍽️ Porciones por Tipo de Alimento</h2>

        <div className={styles.categoryTabs}>
          {FOOD_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryTab} ${selectedCategory === category.id ? styles.categoryTabActive : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                '--category-color': category.color
              } as React.CSSProperties}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Tabla de alimentos */}
        {currentCategory && (
          <div className={styles.foodsTable}>
            <div
              className={styles.tableHeader}
              style={{ backgroundColor: currentCategory.color }}
            >
              <span>{currentCategory.icon} {currentCategory.name}</span>
            </div>

            <div className={styles.foodsList}>
              {currentCategory.foods.map((food, idx) => {
                const method = HAND_METHODS.find(m => m.id === food.method);
                return (
                  <div key={idx} className={styles.foodItem}>
                    <div className={styles.foodMain}>
                      <span className={styles.foodName}>{food.name}</span>
                      <div className={styles.foodPortion}>
                        <span className={styles.portionIcon}>{method?.icon}</span>
                        <span className={styles.portionText}>{food.portion}</span>
                      </div>
                    </div>
                    <div className={styles.foodDetails}>
                      <span className={styles.foodGrams}>{food.grams}</span>
                      {food.tip && <span className={styles.foodTip}>💡 {food.tip}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Guía del plato equilibrado */}
      <section className={styles.plateSection}>
        <h2 className={styles.sectionTitle}>🍽️ El Plato Equilibrado</h2>
        <div className={styles.plateGuide}>
          <div className={styles.plateVisual}>
            <div className={styles.plateCircle}>
              <div className={styles.plateHalf} style={{ backgroundColor: '#27AE60' }}>
                <span>🥗</span>
                <p>50%</p>
                <small>Verduras</small>
              </div>
              <div className={styles.plateQuarter} style={{ backgroundColor: '#E74C3C' }}>
                <span>🍗</span>
                <p>25%</p>
                <small>Proteína</small>
              </div>
              <div className={styles.plateQuarter} style={{ backgroundColor: '#F39C12' }}>
                <span>🍚</span>
                <p>25%</p>
                <small>Carbos</small>
              </div>
            </div>
            <div className={styles.plateSide}>
              <div className={styles.plateFat}>
                <span>🫒</span>
                <small>+ Grasa saludable (1 pulgar)</small>
              </div>
            </div>
          </div>
          <div className={styles.plateDescription}>
            <h3>Composición ideal de cada comida principal:</h3>
            <ul>
              <li><span style={{ color: '#27AE60' }}>●</span> <strong>50% Verduras:</strong> 2 manos juntas de ensalada o 1 puño de verdura cocida</li>
              <li><span style={{ color: '#E74C3C' }}>●</span> <strong>25% Proteína:</strong> 1 palma de carne, pescado o legumbres</li>
              <li><span style={{ color: '#F39C12' }}>●</span> <strong>25% Carbohidratos:</strong> 1 puño de arroz, pasta o patata</li>
              <li><span style={{ color: '#2E86AB' }}>●</span> <strong>+ Grasa:</strong> 1 pulgar de aceite de oliva</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className={styles.tipsSection}>
        <h2 className={styles.sectionTitle}>💡 Consejos Prácticos</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📏</span>
            <h4>Tu mano = Tu porción</h4>
            <p>Las personas más grandes tienen manos más grandes, así que las porciones se ajustan automáticamente a tu tamaño corporal.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔄</span>
            <h4>Flexibilidad</h4>
            <p>Estas son guías orientativas. Puedes ajustar según tu actividad física, objetivos y sensación de saciedad.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🥬</span>
            <h4>Verduras libres</h4>
            <p>Con las verduras no proteicas (lechuga, pepino, tomate...) puedes ser más generoso. ¡Repite sin problema!</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⚖️</span>
            <h4>Sin obsesionarse</h4>
            <p>No necesitas medir todo. Usa este método como referencia visual para desarrollar intuición sobre las porciones.</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>📋 Información</h3>
        <p>
          Este método de porciones es una guía visual general basada en recomendaciones nutricionales estándar.
          Las necesidades individuales varían según edad, sexo, actividad física y objetivos personales.
          Para un plan nutricional personalizado, consulta con un dietista-nutricionista.
        </p>
      </div>

      <Footer appName="calculadora-porciones" />
    </div>
  );
}
