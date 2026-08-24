'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de capítulos del curso
export const CHAPTERS = [
  {
    id: 1,
    slug: 'conceptos-basicos',
    title: 'Conceptos Básicos',
    subtitle: 'Fundamentos de inversión',
    icon: '📚',
    duration: '25 min',
    description: 'Aprende los fundamentos esenciales: qué es invertir, cómo funcionan los mercados y por qué es importante para tu patrimonio.',
    topics: ['Mercados financieros', 'Rentabilidad vs riesgo', 'Financiación empresarial', 'Primeros pasos'],
  },
  {
    id: 2,
    slug: 'productos-financieros',
    title: 'Productos Financieros',
    subtitle: 'Instrumentos de inversión',
    icon: '💳',
    duration: '35 min',
    description: 'Conoce los diferentes vehículos de inversión: acciones, bonos, ETFs, fondos de inversión y criptomonedas.',
    topics: ['Acciones', 'Bonos', 'ETFs', 'Fondos de inversión', 'Criptomonedas'],
  },
  {
    id: 3,
    slug: 'estrategias-inversion',
    title: 'Estrategias de Inversión',
    subtitle: 'Métodos probados',
    icon: '🎯',
    duration: '30 min',
    description: 'Descubre las estrategias más efectivas: value investing, growth, dividend investing y gestión pasiva con ETFs.',
    topics: ['Value investing', 'Growth investing', 'Dividend investing', 'Gestión pasiva', 'DCA'],
  },
  {
    id: 4,
    slug: 'gestion-riesgo',
    title: 'Gestión del Riesgo',
    subtitle: 'Protege tu capital',
    icon: '⚖️',
    duration: '30 min',
    description: 'Aprende a medir, gestionar y mitigar el riesgo en tus inversiones. Diversificación, correlación y volatilidad.',
    topics: ['Volatilidad', 'Diversificación', 'Correlación', 'Beta', 'Drawdown'],
  },
  {
    id: 5,
    slug: 'psicologia-inversor',
    title: 'Psicología del Inversor',
    subtitle: 'Controla tus emociones',
    icon: '🧠',
    duration: '25 min',
    description: 'Los sesgos cognitivos que afectan tus decisiones y cómo desarrollar disciplina emocional para invertir mejor.',
    topics: ['Sesgos cognitivos', 'FOMO y pánico', 'Disciplina', 'Errores comunes'],
  },
  {
    id: 6,
    slug: 'asset-allocation',
    title: 'Asset Allocation',
    subtitle: 'Distribución de cartera',
    icon: '🥧',
    duration: '20 min',
    description: 'La decisión más importante: cómo distribuir tu capital entre diferentes clases de activos según tu perfil.',
    topics: ['Clases de activos', 'Perfiles de riesgo', 'Carteras modelo', 'Rebalanceo'],
  },
  {
    id: 7,
    slug: 'guia-brokers',
    title: 'Guía de Brokers',
    subtitle: 'Elige tu plataforma',
    icon: '🏦',
    duration: '25 min',
    description: 'Cómo elegir el broker adecuado: comisiones, regulación, plataformas y comparativa de opciones en España.',
    topics: ['Tipos de brokers', 'Comisiones', 'Regulación', 'Comparativa España'],
  },
  {
    id: 8,
    slug: 'aspectos-fiscales',
    title: 'Aspectos Fiscales',
    subtitle: 'Impuestos en España',
    icon: '📋',
    duration: '30 min',
    description: 'Todo sobre la fiscalidad de las inversiones en España: IRPF, plusvalías, dividendos y optimización fiscal.',
    topics: ['IRPF inversiones', 'Plusvalías', 'Dividendos', 'Compensación pérdidas'],
  },
  {
    id: 9,
    slug: 'casos-practicos',
    title: 'Casos Prácticos',
    subtitle: 'Ejemplos reales',
    icon: '📊',
    duration: '20 min',
    description: 'Análisis de casos reales de inversión: decisiones, resultados y lecciones aprendidas.',
    topics: ['Caso conservador', 'Caso moderado', 'Caso agresivo', 'Errores reales'],
  },
  {
    id: 10,
    slug: 'mantenimiento-cartera',
    title: 'Mantenimiento de Cartera',
    subtitle: 'Gestión continua',
    icon: '🔧',
    duration: '20 min',
    description: 'Cómo mantener y ajustar tu cartera: rebalanceo, seguimiento, cuándo vender y revisión periódica.',
    topics: ['Rebalanceo', 'Seguimiento', 'Cuándo vender', 'Revisión anual'],
  },
];

// Herramientas recomendadas (enlaces externos)
export const TOOLS = [
  {
    id: 'interes-compuesto',
    name: 'Estimador de Interés Compuesto',
    description: 'Calcula el crecimiento de tus inversiones con el poder del interés compuesto',
    icon: '📈',
    href: '/estimador-interes-compuesto/',
    available: true,
  },
  {
    id: 'perfil-riesgo',
    name: 'Test de Perfil Inversor',
    description: 'Descubre tu tolerancia al riesgo y recibe recomendaciones personalizadas',
    icon: '🎯',
    href: '/test-perfil-inversor/',
    available: true,
  },
  {
    id: 'calculadora-inversiones',
    name: 'Estimador de Inversiones',
    description: 'Diseña tu cartera según tu perfil de riesgo y visualiza la distribución de activos',
    icon: '💼',
    href: '/estimador-inversiones/',
    available: true,
  },
];

// Recursos del curso
export const RESOURCES = [
  {
    id: 'glosario',
    name: 'Glosario Financiero',
    description: 'Más de 100 términos financieros explicados de forma clara',
    icon: '📖',
    href: '/curso-decisiones-inversion/recursos/glosario',
  },
  {
    id: 'bibliografia',
    name: 'Bibliografía',
    description: 'Libros y recursos recomendados para profundizar',
    icon: '📚',
    href: '/curso-decisiones-inversion/recursos/bibliografia',
  },
  {
    id: 'enlaces-utiles',
    name: 'Enlaces Útiles',
    description: 'Webs, plataformas y herramientas recomendadas',
    icon: '🔗',
    href: '/curso-decisiones-inversion/recursos/enlaces-utiles',
  },
];

// Contexto del curso
interface CourseContextType {
  completedChapters: number[];
  markChapterComplete: (chapterId: number) => void;
  isChapterCompleted: (chapterId: number) => boolean;
  getProgressPercentage: () => number;
  resetProgress: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'curso-decisiones-inversion-progress';

export function CourseProvider({ children }: { children: ReactNode }) {
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar progreso desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCompletedChapters(JSON.parse(saved));
      } catch {
        setCompletedChapters([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedChapters));
    }
  }, [completedChapters, isLoaded]);

  const markChapterComplete = (chapterId: number) => {
    setCompletedChapters((prev) => {
      if (prev.includes(chapterId)) return prev;
      return [...prev, chapterId];
    });
  };

  const isChapterCompleted = (chapterId: number) => {
    return completedChapters.includes(chapterId);
  };

  const getProgressPercentage = () => {
    return Math.round((completedChapters.length / CHAPTERS.length) * 100);
  };

  const resetProgress = () => {
    setCompletedChapters([]);
  };

  return (
    <CourseContext.Provider
      value={{
        completedChapters,
        markChapterComplete,
        isChapterCompleted,
        getProgressPercentage,
        resetProgress,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
