'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de la estructura del curso
export const COURSE_MODULES = [
  {
    id: 'fundamentos',
    title: 'Fundamentos Atemporales',
    chapters: [
      { id: 'que-es-estrategia', title: '¿Qué es Estrategia Realmente?', duration: 12, topics: ['Definición honesta de estrategia', 'Misión y valores como brújula', 'Decisiones coherentes a largo plazo', 'Estrategia vs. táctica vs. operaciones'] },
      { id: 'analisis-entorno', title: 'Análisis del Entorno: De Porter a la Complejidad', duration: 14, topics: ['Las 5 Fuerzas de Porter: utilidad y limitaciones', 'Análisis del ciclo de vida competitivo', 'Dinámicas no lineales y cisnes negros', 'Escenarios vs. predicciones'] },
      { id: 'recursos-capacidades', title: 'Recursos y Capacidades: Lo Que Sí Puedes Controlar', duration: 12, topics: ['Análisis interno honesto', 'Capacidades distintivas reales', 'Core competencies: qué son realmente', 'Build vs. buy vs. partner'] },
    ],
  },
  {
    id: 'cambios',
    title: 'Lo Que Ha Cambiado',
    chapters: [
      { id: 'fracaso-excelentes', title: 'Por Qué Fracasaron las Empresas \'Excelentes\'', duration: 14, topics: ['El mito de \'In Search of Excellence\'', 'Kodak: la maldición del éxito', 'Nokia: de líder a irrelevante en 5 años', 'Blockbuster vs. Netflix: la ceguera estratégica', 'Lecciones para no repetir errores'] },
      { id: 'nuevos-moats', title: 'Los Nuevos \'Moats\': Ventajas Competitivas del Siglo XXI', duration: 12, topics: ['De barreras de entrada a data loops', 'Efectos de red en la era digital', 'Distribución como ventaja', 'Loops de aprendizaje y velocidad de iteración', 'Por qué los moats tradicionales se erosionan'] },
      { id: 'entornos-hiperdinamicos', title: 'Estrategia en Entornos Hiperdinámicos', duration: 14, topics: ['Qué hace diferente al entorno actual', 'La IA como factor de disrupción continua', 'Estrategia cuando la planificación es imposible', 'Antifragilidad empresarial', 'Optionalidad estratégica'] },
    ],
  },
  {
    id: 'herramientas',
    title: 'Herramientas del Siglo XXI',
    chapters: [
      { id: 'analisis-opciones', title: 'De SWOT a Análisis de Opciones Estratégicas', duration: 12, topics: ['Limitaciones del SWOT tradicional', 'Pensamiento en opciones reales', 'Matriz de decisiones bajo incertidumbre', 'Análisis de escenarios práctico', 'Herramientas para PYMEs y emprendedores'] },
      { id: 'experimentacion-rapida', title: 'Experimentación Rápida vs. Planificación Detallada', duration: 12, topics: ['El mito del plan de negocio perfecto', 'Lean Strategy: hipótesis y validación', 'MVPs estratégicos', 'Fail fast, learn faster', 'Cuándo sí planificar en detalle'] },
      { id: 'estrategia-emergente', title: 'Estrategia Emergente: Aprender Haciendo', duration: 12, topics: ['Mintzberg y la estrategia emergente', 'Patrones que emergen de la acción', 'Feedback loops y adaptación continua', 'Decisiones reversibles vs. irreversibles', 'Construir capacidad de pivote'] },
    ],
  },
  {
    id: 'aplicacion',
    title: 'Aplicación Práctica',
    chapters: [
      { id: 'casos-actuales', title: 'Casos Actuales: Estrategia en Acción', duration: 16, topics: ['OpenAI vs. Anthropic: dos filosofías estratégicas', 'Tesla vs. fabricantes tradicionales: disrupción desde fuera', 'Amazon: la estrategia del \'Day 1\'', 'Empresas españolas: Inditex y su modelo único', 'Tu propia estrategia: framework de síntesis'] },
    ],
  },
];

interface CourseContextType {
  completedChapters: string[];
  isCompleted: (chapterId: string) => boolean;
  markAsCompleted: (chapterId: string) => void;
  markAsIncomplete: (chapterId: string) => void;
  getProgressPercentage: () => number;
  getCompletedCount: () => number;
  getTotalChapters: () => number;
  getTotalDuration: () => number;
  modules: typeof COURSE_MODULES;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'curso-estrategia-empresarial-progress';

export function CourseProvider({ children }: { children: ReactNode }) {
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar progreso desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCompletedChapters(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedChapters));
    }
  }, [completedChapters, isHydrated]);

  const isCompleted = (chapterId: string) => completedChapters.includes(chapterId);

  const markAsCompleted = (chapterId: string) => {
    if (!completedChapters.includes(chapterId)) {
      setCompletedChapters([...completedChapters, chapterId]);
    }
  };

  const markAsIncomplete = (chapterId: string) => {
    setCompletedChapters(completedChapters.filter((id) => id !== chapterId));
  };

  const getTotalChapters = () => {
    return COURSE_MODULES.reduce((acc, module) => acc + module.chapters.length, 0);
  };

  const getCompletedCount = () => completedChapters.length;

  const getProgressPercentage = () => {
    const total = getTotalChapters();
    return total === 0 ? 0 : Math.round((completedChapters.length / total) * 100);
  };

  const getTotalDuration = () => {
    return COURSE_MODULES.reduce(
      (acc, module) => acc + module.chapters.reduce((sum, ch) => sum + ch.duration, 0),
      0
    );
  };

  return (
    <CourseContext.Provider
      value={{
        completedChapters,
        isCompleted,
        markAsCompleted,
        markAsIncomplete,
        getProgressPercentage,
        getCompletedCount,
        getTotalChapters,
        getTotalDuration,
        modules: COURSE_MODULES,
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

// Helper functions for chapter navigation
export function getChapterById(chapterId: string) {
  for (const module of COURSE_MODULES) {
    const chapter = module.chapters.find((ch) => ch.id === chapterId);
    if (chapter) {
      return { chapter, module };
    }
  }
  return null;
}

export function getNextChapter(currentChapterId: string) {
  const allChapters: { chapter: typeof COURSE_MODULES[0]['chapters'][0]; module: typeof COURSE_MODULES[0] }[] = [];

  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      allChapters.push({ chapter, module });
    }
  }

  const currentIndex = allChapters.findIndex((item) => item.chapter.id === currentChapterId);
  if (currentIndex === -1 || currentIndex === allChapters.length - 1) {
    return null;
  }

  return allChapters[currentIndex + 1];
}

export function getPreviousChapter(currentChapterId: string) {
  const allChapters: { chapter: typeof COURSE_MODULES[0]['chapters'][0]; module: typeof COURSE_MODULES[0] }[] = [];

  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      allChapters.push({ chapter, module });
    }
  }

  const currentIndex = allChapters.findIndex((item) => item.chapter.id === currentChapterId);
  if (currentIndex <= 0) {
    return null;
  }

  return allChapters[currentIndex - 1];
}
