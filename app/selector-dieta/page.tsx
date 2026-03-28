'use client';

import React, { useState } from 'react';
import styles from './SelectorDieta.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type DietaKey = 'mediterranea' | 'vegetariana' | 'vegana' | 'cetogenica' | 'dash' | 'ayuno-intermitente';
type Pantalla = 'inicio' | 'test' | 'resultado';

interface PesosOpcion {
  mediterranea: number;
  vegetariana: number;
  vegana: number;
  cetogenica: number;
  dash: number;
  'ayuno-intermitente': number;
}

interface OpcionPregunta {
  valor: string;
  etiqueta: string;
  descripcion: string;
  pesos: PesosOpcion;
}

interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

interface DietaInfo {
  icono: string;
  nombre: string;
  perfil: string;
  descripcion: string;
  macros: string;
  dificultad: string;
  coste: string;
  alimentosClave: string[];
  aLimitar: string[];
  consejos: string[];
}

interface ResultadoCalculo {
  dieta: DietaKey;
  puntos: Record<DietaKey, number>;
}

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 'objetivo',
    categoria: 'Objetivo Principal',
    icono: '🎯',
    texto: '¿Cuál es tu objetivo principal con el cambio de alimentación?',
    opciones: [
      { valor: 'perder_peso', etiqueta: 'Perder peso y grasa corporal', descripcion: 'Reducir talla y mejorar composición', pesos: { mediterranea: 1, vegetariana: 1, vegana: 1, cetogenica: 3, dash: 1, 'ayuno-intermitente': 3 } },
      { valor: 'masa_muscular', etiqueta: 'Ganar músculo o mejorar rendimiento', descripcion: 'Más proteína y energía para entrenar', pesos: { mediterranea: 2, vegetariana: 1, vegana: 0, cetogenica: 2, dash: 0, 'ayuno-intermitente': 1 } },
      { valor: 'salud_general', etiqueta: 'Mejorar la salud general y longevidad', descripcion: 'Comer mejor a largo plazo', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 1, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'energia', etiqueta: 'Más energía y menos bajones', descripcion: 'Estabilidad a lo largo del día', pesos: { mediterranea: 3, vegetariana: 2, vegana: 1, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'restricciones',
    categoria: 'Restricciones Alimentarias',
    icono: '🚫',
    texto: '¿Tienes alguna restricción o preferencia alimentaria?',
    opciones: [
      { valor: 'ninguna', etiqueta: 'Ninguna, como de todo', descripcion: 'Sin limitaciones conocidas', pesos: { mediterranea: 3, vegetariana: 2, vegana: 1, cetogenica: 3, dash: 3, 'ayuno-intermitente': 3 } },
      { valor: 'vegetariano', etiqueta: 'Vegetariano/a (sin carne ni pescado)', descripcion: 'Evito carne y pescado', pesos: { mediterranea: 1, vegetariana: 3, vegana: 1, cetogenica: 0, dash: 1, 'ayuno-intermitente': 2 } },
      { valor: 'vegano', etiqueta: 'Vegano/a (sin productos animales)', descripcion: 'Dieta 100% vegetal', pesos: { mediterranea: 0, vegetariana: 1, vegana: 3, cetogenica: 0, dash: 0, 'ayuno-intermitente': 1 } },
      { valor: 'sin_gluten', etiqueta: 'Sin gluten (celiaquía o sensibilidad)', descripcion: 'Evito el trigo y derivados', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 3, dash: 1, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'actividad',
    categoria: 'Nivel de Actividad',
    icono: '🏃',
    texto: '¿Cómo describirías tu nivel de actividad física diaria?',
    opciones: [
      { valor: 'sedentario', etiqueta: 'Sedentario (trabajo sentado, poco ejercicio)', descripcion: 'Menos de 30 min de actividad al día', pesos: { mediterranea: 2, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 3, 'ayuno-intermitente': 3 } },
      { valor: 'moderado', etiqueta: 'Moderado (camino mucho, algo de deporte)', descripcion: 'Actividad ligera-moderada', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'activo', etiqueta: 'Activo (deporte 3-4 veces/semana)', descripcion: 'Entrenamiento regular', pesos: { mediterranea: 3, vegetariana: 2, vegana: 1, cetogenica: 1, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'muy_activo', etiqueta: 'Muy activo (deporte intenso casi diario)', descripcion: 'Alto rendimiento o trabajo físico', pesos: { mediterranea: 2, vegetariana: 1, vegana: 0, cetogenica: 1, dash: 1, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'salud',
    categoria: 'Condición de Salud',
    icono: '🏥',
    texto: '¿Tienes alguna condición de salud diagnosticada?',
    opciones: [
      { valor: 'ninguna', etiqueta: 'No, estoy en buen estado de salud', descripcion: 'Sin condiciones relevantes', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'diabetes', etiqueta: 'Diabetes o prediabetes', descripcion: 'Control del azúcar en sangre prioritario', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 3, dash: 3, 'ayuno-intermitente': 2 } },
      { valor: 'cardiovascular', etiqueta: 'Colesterol alto o hipertensión', descripcion: 'Salud cardiovascular prioritaria', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 0, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'digestiva', etiqueta: 'Problemas digestivos crónicos', descripcion: 'Colon irritable, reflujo, etc.', pesos: { mediterranea: 2, vegetariana: 2, vegana: 1, cetogenica: 1, dash: 2, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'cocina',
    categoria: 'Tiempo para Cocinar',
    icono: '👨‍🍳',
    texto: '¿Cuánto tiempo dedicas o quieres dedicar a cocinar?',
    opciones: [
      { valor: 'minimo', etiqueta: 'Mínimo, prefiero cosas rápidas', descripcion: 'Menos de 20 min por comida', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 2, dash: 1, 'ayuno-intermitente': 3 } },
      { valor: 'basico', etiqueta: 'Cocino básico, recetas sencillas', descripcion: 'Tiempo justo, sin complicaciones', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'normal', etiqueta: 'Me gusta cocinar, tengo tiempo', descripcion: 'Disfruto preparando comida', pesos: { mediterranea: 3, vegetariana: 3, vegana: 3, cetogenica: 2, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'mucho', etiqueta: 'Disfruto cocinando sin restricción', descripcion: 'La cocina es un placer', pesos: { mediterranea: 3, vegetariana: 3, vegana: 3, cetogenica: 2, dash: 3, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'presupuesto',
    categoria: 'Presupuesto Alimentario',
    icono: '💶',
    texto: '¿Cuál es tu presupuesto mensual para la alimentación?',
    opciones: [
      { valor: 'ajustado', etiqueta: 'Muy ajustado, busco economía', descripcion: 'Menos de 150 €/mes por persona', pesos: { mediterranea: 3, vegetariana: 3, vegana: 2, cetogenica: 1, dash: 2, 'ayuno-intermitente': 3 } },
      { valor: 'normal', etiqueta: 'Normal, sin grandes excesos', descripcion: 'Entre 150 y 300 €/mes', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 3, 'ayuno-intermitente': 2 } },
      { valor: 'holgado', etiqueta: 'Holgado, calidad primero', descripcion: 'Más de 300 €/mes sin problema', pesos: { mediterranea: 2, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 1 } },
    ],
  },
  {
    id: 'relacion_comida',
    categoria: 'Relación con la Comida',
    icono: '🧠',
    texto: '¿Cómo describirías tu relación con la comida?',
    opciones: [
      { valor: 'equilibrada', etiqueta: 'Como de todo sin problema', descripcion: 'Relación sana y sin obsesiones', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 3, 'ayuno-intermitente': 2 } },
      { valor: 'selectivo', etiqueta: 'Soy bastante selectivo/a con lo que como', descripcion: 'Tengo gustos definidos', pesos: { mediterranea: 2, vegetariana: 2, vegana: 1, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'ansiedad', etiqueta: 'A veces uso la comida para gestionar emociones', descripcion: 'La relación es compleja a veces', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 1, dash: 2, 'ayuno-intermitente': 1 } },
      { valor: 'irregular', etiqueta: 'Como fuera o con horarios muy irregulares', descripcion: 'Lifestyle dinámico sin rutina fija', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 1, dash: 1, 'ayuno-intermitente': 3 } },
    ],
  },
  {
    id: 'sostenibilidad',
    categoria: 'Valores Medioambientales',
    icono: '🌍',
    texto: '¿El impacto ambiental de tu alimentación influye en tus decisiones?',
    opciones: [
      { valor: 'muy_importante', etiqueta: 'Sí, es un criterio fundamental', descripcion: 'Busco reducir mi huella activamente', pesos: { mediterranea: 2, vegetariana: 3, vegana: 3, cetogenica: 0, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'algo', etiqueta: 'Me importa, aunque no es prioritario', descripcion: 'Lo considero entre otros factores', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 1, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'no', etiqueta: 'No especialmente, me centro en la salud', descripcion: 'Otros factores son más importantes', pesos: { mediterranea: 2, vegetariana: 1, vegana: 1, cetogenica: 2, dash: 3, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'plazo',
    categoria: 'Sostenibilidad del Cambio',
    icono: '📅',
    texto: '¿Cuánto tiempo estás dispuesto/a a mantener el cambio de hábitos?',
    opciones: [
      { valor: 'corto', etiqueta: 'Resultados rápidos (1-3 meses)', descripcion: 'Quiero ver cambios pronto', pesos: { mediterranea: 1, vegetariana: 1, vegana: 0, cetogenica: 3, dash: 1, 'ayuno-intermitente': 3 } },
      { valor: 'medio', etiqueta: 'Puedo mantenerlo 6-12 meses', descripcion: 'Tengo paciencia y constancia', pesos: { mediterranea: 2, vegetariana: 2, vegana: 1, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'largo', etiqueta: 'Busco un cambio permanente de estilo de vida', descripcion: 'Quiero que sea mi forma de comer para siempre', pesos: { mediterranea: 3, vegetariana: 3, vegana: 3, cetogenica: 1, dash: 3, 'ayuno-intermitente': 2 } },
    ],
  },
  {
    id: 'variedad',
    categoria: 'Preferencia Culinaria',
    icono: '🍽️',
    texto: '¿Qué describes mejor tu relación con la variedad de alimentos?',
    opciones: [
      { valor: 'mucha_variedad', etiqueta: 'Me encanta probar cosas nuevas', descripcion: 'La variedad es esencial para mí', pesos: { mediterranea: 3, vegetariana: 3, vegana: 2, cetogenica: 1, dash: 3, 'ayuno-intermitente': 1 } },
      { valor: 'moderada', etiqueta: 'Variedad moderada, sin complicarme', descripcion: 'Equilibrio entre variedad y rutina', pesos: { mediterranea: 3, vegetariana: 2, vegana: 2, cetogenica: 2, dash: 2, 'ayuno-intermitente': 2 } },
      { valor: 'poca', etiqueta: 'Prefiero pocas cosas pero que me gusten', descripcion: 'La simplicidad me va bien', pesos: { mediterranea: 2, vegetariana: 2, vegana: 2, cetogenica: 3, dash: 1, 'ayuno-intermitente': 3 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos de dietas
// ─────────────────────────────────────────────

const DIETAS: Record<DietaKey, DietaInfo> = {
  mediterranea: {
    icono: '🫒',
    nombre: 'Dieta Mediterránea',
    perfil: 'Equilibrada · Sostenible · Probada científicamente',
    descripcion: 'El patrón alimentario más estudiado y respaldado. Rica en aceite de oliva, verduras, legumbres, pescado y cereales integrales. Flexible, sabrosa y culturalmente alineada con España.',
    macros: '45-55% carbohidratos · 25-35% grasas saludables · 15-20% proteínas',
    dificultad: 'Fácil — puedes empezar mañana',
    coste: 'Económica — muchos alimentos locales y de temporada',
    alimentosClave: ['Aceite de oliva virgen extra', 'Verduras y hortalizas de temporada', 'Legumbres (lentejas, garbanzos, alubias)', 'Pescado azul 2-3 veces/semana', 'Cereales integrales', 'Frutos secos y frutas'],
    aLimitar: ['Carnes rojas y procesadas', 'Azúcares refinados y bollería', 'Aceites vegetales refinados', 'Precocinados y ultraprocesados'],
    consejos: ['Cocina con aceite de oliva virgen extra como base', 'Incluye legumbres al menos 3 veces por semana', 'Sustituye el pan blanco por integral', 'Bebe agua como bebida principal', 'Come en compañía cuando puedas — también es parte de la dieta mediterránea'],
  },
  vegetariana: {
    icono: '🥦',
    nombre: 'Dieta Vegetariana',
    perfil: 'Ética · Sostenible · Completa con planificación',
    descripcion: 'Excluye carne y pescado pero incluye huevos y lácteos. Muy completa si se planifica bien. Alta en fibra, antioxidantes y vitaminas. Reducción significativa del impacto ambiental.',
    macros: '50-60% carbohidratos complejos · 20-25% proteínas vegetales · 20-25% grasas',
    dificultad: 'Media — requiere aprender nuevas combinaciones',
    coste: 'Económica a moderada',
    alimentosClave: ['Legumbres (base proteica principal)', 'Huevos y lácteos de calidad', 'Tofu y tempeh', 'Cereales integrales', 'Frutos secos y semillas', 'Verduras de hoja verde'],
    aLimitar: ['Carne y pescado', 'Procesados vegetarianos ultra-elaborados', 'Exceso de lácteos grasos', 'Azúcares añadidos'],
    consejos: ['Combina legumbres + cereal en la misma comida para proteína completa', 'Vigila vitamina B12 (suplementación recomendable)', 'El hierro vegetal se absorbe mejor con vitamina C', 'No caigas en el error de sustituir carne por más queso'],
  },
  vegana: {
    icono: '🌱',
    nombre: 'Dieta Vegana',
    perfil: '100% vegetal · Ética ambiental · Requiere planificación',
    descripcion: 'Excluye todos los productos de origen animal. El patrón con menor huella ambiental. Requiere planificación cuidadosa y suplementación para ser nutricionalmente completa.',
    macros: '55-65% carbohidratos · 15-20% proteínas vegetales · 20-25% grasas vegetales',
    dificultad: 'Alta — suplementación necesaria y planificación constante',
    coste: 'Variable — puede ser económica o cara según las elecciones',
    alimentosClave: ['Legumbres en todas sus formas', 'Tofu, tempeh y edamame', 'Cereales integrales y pseudocereales (quinoa, amaranto)', 'Frutos secos y semillas (base de grasas)', 'Verduras de hoja verde abundantes', 'Algas (fuente de yodo)'],
    aLimitar: ['Todos los productos de origen animal', 'Procesados veganos ultrarefinados', 'Exceso de aceites vegetales', 'Alimentos con azúcar añadida'],
    consejos: ['Suplementa B12 sin excepción (no negociable)', 'Vigila omega-3, vitamina D, calcio, zinc y hierro', 'Consulta con un dietista-nutricionista al inicio', 'Lee etiquetas: muchos productos llevan derivados animales ocultos'],
  },
  cetogenica: {
    icono: '🥩',
    nombre: 'Dieta Cetogénica',
    perfil: 'Baja en carbohidratos · Rápida en resultados · Restrictiva',
    descripcion: 'Muy baja en carbohidratos (< 50g/día), alta en grasas. Pone al cuerpo en cetosis, usando grasa como combustible. Muy eficaz para pérdida de peso rápida y control glucémico, pero exigente.',
    macros: '70-75% grasas · 20-25% proteínas · 5% carbohidratos',
    dificultad: 'Alta — exige contar carbohidratos con precisión',
    coste: 'Moderada a alta — carne, pescado y grasas de calidad',
    alimentosClave: ['Carnes y pescados grasos', 'Huevos (sin límite en cetogénica)', 'Aguacate y aceite de oliva', 'Quesos curados y mantequilla', 'Verduras de hoja verde (bajas en carbohidratos)', 'Frutos secos (con moderación)'],
    aLimitar: ['Todos los cereales y pan', 'Frutas (excepto frutos rojos en pequeña cantidad)', 'Legumbres', 'Azúcares y dulces', 'Alcohol', 'Tubérculos (patata, boniato)'],
    consejos: ['Los primeros 5-7 días pueden ser duros ("gripe ceto") — es normal', 'Hidratación y electrolitos son fundamentales', 'No es adecuada sin supervisión médica si tienes diabetes tipo 1', 'Planifica antes de salir a comer fuera, es más restrictiva socialmente'],
  },
  dash: {
    icono: '❤️',
    nombre: 'Dieta DASH',
    perfil: 'Cardiovascular · Clínicamente validada · Equilibrada',
    descripcion: 'Diseñada para reducir la hipertensión. Muy baja en sodio, rica en potasio, magnesio y calcio. Excelente para la salud cardiovascular y metabólica a largo plazo.',
    macros: '55% carbohidratos complejos · 18% proteínas · 27% grasas saludables',
    dificultad: 'Media — principalmente reducir sal y procesados',
    coste: 'Económica a moderada',
    alimentosClave: ['Frutas y verduras abundantes (10 raciones/día)', 'Lácteos desnatados', 'Cereales integrales', 'Carnes magras y pescado', 'Legumbres y frutos secos', 'Aceite de oliva'],
    aLimitar: ['Sal añadida (< 2g/día en versión estricta)', 'Carnes rojas y procesadas', 'Grasas saturadas', 'Dulces y bebidas azucaradas', 'Alcohol'],
    consejos: ['Reduce la sal gradualmente — el paladar se adapta en 2-3 semanas', 'Lee etiquetas: el sodio oculto está en muchos procesados', 'Combínala con ejercicio aeróbico para mayor efecto cardiovascular', 'Consulta a tu médico si tomas medicación antihipertensiva'],
  },
  'ayuno-intermitente': {
    icono: '⏱️',
    nombre: 'Ayuno Intermitente',
    perfil: 'Flexible en ventana · Eficaz para peso · Encaja con horarios irregulares',
    descripcion: 'No es una dieta por sí misma sino un patrón de comidas. Las más populares: 16/8 (ayuno 16h, comer en 8h) y 5:2 (5 días normal, 2 días muy baja ingesta). Permite comer con cierta libertad dentro de la ventana.',
    macros: 'Depende de lo que comas — combínalo con alimentación saludable',
    dificultad: 'Media — la restricción es temporal, no de alimentos',
    coste: 'Económico — en general se come menos',
    alimentosClave: ['Cualquier alimento saludable dentro de la ventana', 'Proteínas saciantes para aguantar el ayuno', 'Verduras y fibra para controlar el hambre', 'Agua, café e infusiones (sin azúcar) en el ayuno', 'Grasas saludables para la saciedad'],
    aLimitar: ['Calorías fuera de la ventana de alimentación', 'Ultraprocesados (derrotan el propósito)', 'Bebidas calóricas durante el ayuno', 'Exceso de comida compulsiva al romper el ayuno'],
    consejos: ['Empieza con 12h de ayuno y aumenta gradualmente', 'El café solo o té sin azúcar no rompe el ayuno metabólicamente', 'No es adecuado si tienes historial de trastornos alimentarios', 'Mantén la calidad de lo que comes dentro de la ventana'],
  },
};

// ─────────────────────────────────────────────
// Lógica de resultado
// ─────────────────────────────────────────────

function calcularResultado(respuestas: Record<string, string>): ResultadoCalculo {
  const puntos: Record<DietaKey, number> = {
    mediterranea: 0,
    vegetariana: 0,
    vegana: 0,
    cetogenica: 0,
    dash: 0,
    'ayuno-intermitente': 0,
  };

  PREGUNTAS.forEach((p) => {
    const respuesta = respuestas[p.id];
    const opcion = p.opciones.find((o) => o.valor === respuesta);
    if (opcion) {
      (Object.keys(opcion.pesos) as DietaKey[]).forEach((dieta) => {
        puntos[dieta] += opcion.pesos[dieta];
      });
    }
  });

  const ganadora = (Object.entries(puntos) as [DietaKey, number][])
    .sort(([, a], [, b]) => b - a)[0][0];

  return { dieta: ganadora, puntos };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorDieta() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  const preguntaActual = PREGUNTAS[indicePregunta];
  const totalPreguntas = PREGUNTAS.length;
  const porcentajeProgreso = ((indicePregunta + 1) / totalPreguntas) * 100;

  const handleEmpezar = () => {
    setPantalla('test');
    setIndicePregunta(0);
    setRespuestas({});
    setResultado(null);
  };

  const handleSeleccionarOpcion = (valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaActual.id]: valor }));
  };

  const handleSiguiente = () => {
    if (indicePregunta < totalPreguntas - 1) {
      setIndicePregunta((i) => i + 1);
    } else {
      const calc = calcularResultado(respuestas);
      setResultado(calc);
      setPantalla('resultado');
    }
  };

  const handleAnterior = () => {
    if (indicePregunta > 0) {
      setIndicePregunta((i) => i - 1);
    } else {
      setPantalla('inicio');
    }
  };

  const handleRepetir = () => {
    setPantalla('inicio');
    setIndicePregunta(0);
    setRespuestas({});
    setResultado(null);
  };

  const dietaInfo = resultado ? DIETAS[resultado.dieta] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ─────────────────────────────────── */}
      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué alimentación te conviene?</h1>
          <p className={styles.heroSubtitle}>Más allá de las modas: el patrón que encaja con tu vida real</p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <p className={styles.heroTitleSm}>Tu patrón alimentario</p>
          <p className={styles.heroSubtitleSm}>{dietaInfo?.nombre ?? ''}</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="medical" severity="high" />

      {/* ── Pantalla inicio ──────────────────────── */}
      {pantalla === 'inicio' && (
        <main className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🥗</span>
              <span className={styles.introIcon}>🥑</span>
              <span className={styles.introIcon}>🐟</span>
              <span className={styles.introIcon}>🌿</span>
            </div>
            <h2 className={styles.introTitulo}>Encuentra tu patrón alimentario ideal</h2>
            <p className={styles.introDesc}>
              10 preguntas sobre tus objetivos, salud, estilo de vida y valores para descubrir qué dieta
              se adapta realmente a ti — no a las tendencias del momento.
            </p>
            <ul className={styles.introFeatures}>
              <li><span aria-hidden="true">🎯</span> 6 patrones alimentarios analizados</li>
              <li><span aria-hidden="true">⏱️</span> Solo 2-3 minutos</li>
              <li><span aria-hidden="true">🔒</span> Sin registro ni datos personales</li>
              <li><span aria-hidden="true">🇪🇸</span> Adaptado al contexto español</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={handleEmpezar}>
              Comenzar el test
            </button>
          </div>
        </main>
      )}

      {/* ── Pantalla test ────────────────────────── */}
      {pantalla === 'test' && (
        <main className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>
                Pregunta {indicePregunta + 1} de {totalPreguntas}
              </span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-valuenow={indicePregunta + 1}
              aria-valuemin={1}
              aria-valuemax={totalPreguntas}
              aria-label={`Progreso del test: pregunta ${indicePregunta + 1} de ${totalPreguntas}`}
            >
              <div
                className={styles.progresoRelleno}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.texto}</h2>
            <div className={styles.opcionesGrid} role="group" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map((op) => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => handleSeleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={handleAnterior}>
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={handleSiguiente}
              disabled={!respuestas[preguntaActual.id]}
            >
              {indicePregunta < totalPreguntas - 1 ? 'Siguiente →' : 'Ver resultado'}
            </button>
          </div>
        </main>
      )}

      {/* ── Pantalla resultado ───────────────────── */}
      {pantalla === 'resultado' && resultado && dietaInfo && (
        <main className={styles.resultadosContainer}>
          {/* Tarjeta principal */}
          <div className={styles.recomendacionCard}>
            <span className={styles.recomendacionIcon} aria-hidden="true">{dietaInfo.icono}</span>
            <p className={styles.recomendacionLabel}>Tu patrón recomendado</p>
            <p className={styles.recomendacionValor}>{dietaInfo.nombre}</p>
            <p className={styles.recomendacionPerfil}>{dietaInfo.perfil}</p>
            <p className={styles.recomendacionDesc}>{dietaInfo.descripcion}</p>
          </div>

          {/* Stats: macros / dificultad / coste */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Macros orientativos</p>
              <p className={styles.statValor}>{dietaInfo.macros}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Dificultad de transición</p>
              <p className={styles.statValor}>{dietaInfo.dificultad}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Coste estimado</p>
              <p className={styles.statValor}>{dietaInfo.coste}</p>
            </div>
          </div>

          {/* Alimentos clave */}
          <section className={styles.alimentosSection} aria-label="Alimentos clave de esta dieta">
            <p className={styles.alimentosTitulo}>✅ Alimentos clave</p>
            {dietaInfo.alimentosClave.map((alimento) => (
              <p key={alimento} className={styles.alimentoItem}>{alimento}</p>
            ))}
          </section>

          {/* Alimentos a limitar */}
          <section className={styles.limitarSection} aria-label="Alimentos a limitar en esta dieta">
            <p className={styles.limitarTitulo}>↓ Reducir o evitar</p>
            {dietaInfo.aLimitar.map((alimento) => (
              <p key={alimento} className={styles.limitarItem}>{alimento}</p>
            ))}
          </section>

          {/* Consejos prácticos */}
          <section className={styles.consejosSection} aria-label="Consejos prácticos de transición">
            <p className={styles.consejosTitulo}>💡 Consejos para empezar</p>
            {dietaInfo.consejos.map((consejo) => (
              <p key={consejo} className={styles.consejoItem}>{consejo}</p>
            ))}
          </section>

          {/* Contenido educativo */}
          <EducationalSection
            title="¿Qué debes saber sobre los patrones alimentarios?"
            subtitle="Claves para entender la nutrición más allá de las modas"
            defaultOpen={false}
          >
            <h3>Diferencia entre dieta y patrón alimentario</h3>
            <p>
              Una <strong>dieta</strong> suele asociarse a restricciones temporales con un objetivo puntual (perder
              peso para el verano). Un <strong>patrón alimentario</strong> es la forma habitual de comer a largo
              plazo: qué alimentos predominan, en qué proporciones y con qué frecuencia. La evidencia científica
              apoya los patrones sostenibles sobre las dietas restrictivas de corta duración.
            </p>

            <h3>Por qué la mediterránea es la más respaldada</h3>
            <p>
              La dieta mediterránea cuenta con décadas de investigación y es el patrón más recomendado por
              organismos como la OMS y la EFSA. El estudio PREDIMED (realizado en España) demostró una reducción
              del 30% en eventos cardiovasculares mayores. Su ventaja clave: es sostenible culturalmente en
              España, variada y sin prohibiciones absolutas.
            </p>

            <h3>Cómo hacer la transición sin fracasar</h3>
            <p>
              Los cambios drásticos e inmediatos suelen revertirse. La estrategia más eficaz es la <strong>
              sustitución gradual</strong>: en lugar de eliminar, sustituye un alimento cada semana. Ejemplo:
              pan blanco → integral en semana 1; leche entera → semidesnatada en semana 2. El cerebro
              necesita entre 3 y 8 semanas para consolidar un nuevo hábito.
            </p>

            <h3>La importancia de la adherencia a largo plazo</h3>
            <p>
              La mejor dieta es la que puedes mantener. Un patrón alimentario con adherencia del 80% durante
              2 años produce mejores resultados que una dieta perfecta seguida durante 3 meses. Por eso, la
              flexibilidad y el placer al comer no son enemigos de la salud: son aliados de la consistencia.
            </p>

            <h3>Cuándo consultar con un dietista-nutricionista</h3>
            <p>
              Esta herramienta es orientativa. Consulta con un profesional colegiado si: tienes una condición
              de salud diagnosticada (diabetes, enfermedad renal, cardiovascular), estás embarazada o en período
              de lactancia, tienes menos de 18 o más de 70 años, o si quieres adoptar una dieta vegana o
              cetogénica estricta. El Colegio Oficial de Dietistas-Nutricionistas de España (CODINUA) ofrece
              un buscador de profesionales en su web oficial.
            </p>
          </EducationalSection>

          {/* Aviso legal */}
          <div className={styles.warningBox} role="note">
            <strong>Aviso importante:</strong> Esta herramienta es orientativa y no sustituye el consejo de
            un dietista-nutricionista o médico. Si tienes condiciones de salud diagnosticadas, consulta siempre
            con un profesional antes de cambiar tu alimentación.
          </div>

          {/* Repetir test */}
          <button type="button" className={styles.btnRepetir} onClick={handleRepetir}>
            🔄 Repetir el test
          </button>

        </main>
      )}

      <ShareCard appName="selector-dieta" />
      <RelatedApps apps={getRelatedApps('selector-dieta')} />
      <Footer appName="selector-dieta" />
    </div>
  );
}
