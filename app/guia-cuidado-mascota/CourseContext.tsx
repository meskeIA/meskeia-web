'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de tipos
export interface Chapter {
  id: string;
  title: string;
  topics: string[];
  duration: number;
  relatedApp?: string; // App relacionada de meskeIA
  relatedAppUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  chapters: Chapter[];
}

interface CourseProgress {
  [chapterId: string]: boolean;
}

interface CourseContextType {
  modules: Module[];
  progress: CourseProgress;
  markAsCompleted: (chapterId: string) => void;
  markAsIncomplete: (chapterId: string) => void;
  isCompleted: (chapterId: string) => boolean;
  getProgressPercentage: () => number;
  getCompletedCount: () => number;
  getTotalChapters: () => number;
  getTotalDuration: () => number;
}

// Estructura de la guía - 8 capítulos ligeros y cercanos
export const COURSE_MODULES: Module[] = [
  {
    id: 'preparacion',
    title: 'Preparación',
    icon: '🏠',
    chapters: [
      {
        id: 'antes-de-adoptar',
        title: 'Antes de Adoptar',
        topics: [
          '¿Perro o gato? Cuál es mejor para ti',
          'Lo que necesitas tener en casa',
          'Presupuesto realista mensual',
          'Elegir veterinario de confianza'
        ],
        duration: 8,
        relatedApp: 'Planificador de Mascota',
        relatedAppUrl: '/planificador-mascota/'
      }
    ]
  },
  {
    id: 'alimentacion',
    title: 'Alimentación',
    icon: '🍖',
    chapters: [
      {
        id: 'nutricion-basica',
        title: 'Nutrición Básica',
        topics: [
          'Cuánto debe comer según su peso',
          'Alimentos prohibidos (tóxicos)',
          'Cómo cambiar de pienso sin problemas',
          'Señales de buena alimentación'
        ],
        duration: 10,
        relatedApp: 'Calculadora de Alimentación',
        relatedAppUrl: '/calculadora-alimentacion-mascotas/'
      }
    ]
  },
  {
    id: 'salud',
    title: 'Salud',
    icon: '💊',
    chapters: [
      {
        id: 'prevencion-parasitos',
        title: 'Prevención de Parásitos',
        topics: [
          'Antiparasitarios: cuál usar y cuándo',
          'Calendario de desparasitación',
          'Señales de que tiene parásitos',
          'Proteger a toda la familia'
        ],
        duration: 9,
        relatedApp: 'Calculadora de Medicamentos',
        relatedAppUrl: '/calculadora-medicamentos-mascotas/'
      }
    ]
  },
  {
    id: 'crecimiento',
    title: 'Crecimiento',
    icon: '📏',
    chapters: [
      {
        id: 'desarrollo-cachorro',
        title: 'Desarrollo del Cachorro',
        topics: [
          '¿Cuánto va a pesar de adulto?',
          'Etapas de crecimiento',
          'Alimentación según la edad',
          'Cuándo deja de crecer'
        ],
        duration: 8,
        relatedApp: 'Calculadora de Tamaño Adulto',
        relatedAppUrl: '/calculadora-tamano-adulto-perro/'
      }
    ]
  },
  {
    id: 'etapas',
    title: 'Etapas de Vida',
    icon: '🎂',
    chapters: [
      {
        id: 'edad-y-cuidados',
        title: 'Edad y Cuidados',
        topics: [
          '¿Cuántos años tiene en edad humana?',
          'Cachorro, adulto o senior',
          'Cuidados según la etapa',
          'Expectativa de vida'
        ],
        duration: 7,
        relatedApp: 'Calculadora de Edad',
        relatedAppUrl: '/calculadora-edad-mascotas/'
      }
    ]
  },
  {
    id: 'convivencia',
    title: 'Convivencia',
    icon: '🏡',
    chapters: [
      {
        id: 'primeros-meses',
        title: 'Los Primeros Meses',
        topics: [
          'La primera noche en casa',
          'Rutinas diarias básicas',
          'Socialización temprana',
          'Educación sin castigos'
        ],
        duration: 10,
        relatedApp: 'Planificador de Mascota',
        relatedAppUrl: '/planificador-mascota/'
      }
    ]
  },
  {
    id: 'emergencias',
    title: 'Emergencias',
    icon: '🚨',
    chapters: [
      {
        id: 'cuando-ir-veterinario',
        title: '¿Cuándo Ir al Veterinario?',
        topics: [
          'Señales de alarma urgentes',
          'Botiquín básico en casa',
          'Primeros auxilios simples',
          'Qué hacer si come algo tóxico'
        ],
        duration: 8,
        relatedApp: 'Calculadora de Medicamentos',
        relatedAppUrl: '/calculadora-medicamentos-mascotas/'
      }
    ]
  },
  {
    id: 'recursos',
    title: 'Recursos',
    icon: '🧰',
    chapters: [
      {
        id: 'herramientas',
        title: 'Herramientas Útiles',
        topics: [
          'Todas nuestras calculadoras',
          'Checklist del buen dueño',
          'Calendario de vacunas',
          'Resumen de la guía'
        ],
        duration: 5,
        relatedApp: 'Planificador de Mascota',
        relatedAppUrl: '/planificador-mascota/'
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-guia-cuidado-mascota';

export function CourseProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<CourseProgress>({});

  // Cargar progreso desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  const markAsCompleted = (chapterId: string) => {
    setProgress(prev => ({ ...prev, [chapterId]: true }));
  };

  const markAsIncomplete = (chapterId: string) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[chapterId];
      return newProgress;
    });
  };

  const isCompleted = (chapterId: string) => !!progress[chapterId];

  const getTotalChapters = () => {
    return COURSE_MODULES.reduce((acc, m) => acc + m.chapters.length, 0);
  };

  const getCompletedCount = () => {
    return Object.values(progress).filter(Boolean).length;
  };

  const getProgressPercentage = () => {
    const total = getTotalChapters();
    if (total === 0) return 0;
    return Math.round((getCompletedCount() / total) * 100);
  };

  const getTotalDuration = () => {
    return COURSE_MODULES.reduce((acc, m) =>
      acc + m.chapters.reduce((chAcc, ch) => chAcc + ch.duration, 0), 0
    );
  };

  return (
    <CourseContext.Provider value={{
      modules: COURSE_MODULES,
      progress,
      markAsCompleted,
      markAsIncomplete,
      isCompleted,
      getProgressPercentage,
      getCompletedCount,
      getTotalChapters,
      getTotalDuration
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within CourseProvider');
  }
  return context;
}

// Helpers para navegación entre capítulos
export function getChapterById(chapterId: string): { chapter: Chapter; module: Module } | null {
  for (const module of COURSE_MODULES) {
    const chapter = module.chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      return { chapter, module };
    }
  }
  return null;
}

export function getNextChapter(currentChapterId: string): { chapter: Chapter; module: Module } | null {
  const allChapters: { chapter: Chapter; module: Module }[] = [];
  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      allChapters.push({ chapter, module });
    }
  }

  const currentIndex = allChapters.findIndex(item => item.chapter.id === currentChapterId);
  if (currentIndex === -1 || currentIndex === allChapters.length - 1) {
    return null;
  }
  return allChapters[currentIndex + 1];
}

export function getPreviousChapter(currentChapterId: string): { chapter: Chapter; module: Module } | null {
  const allChapters: { chapter: Chapter; module: Module }[] = [];
  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      allChapters.push({ chapter, module });
    }
  }

  const currentIndex = allChapters.findIndex(item => item.chapter.id === currentChapterId);
  if (currentIndex <= 0) {
    return null;
  }
  return allChapters[currentIndex - 1];
}
