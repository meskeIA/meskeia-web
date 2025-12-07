'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de tipos
export interface Chapter {
  id: string;
  title: string;
  topics: string[];
  duration: number;
}

export interface Module {
  id: string;
  title: string;
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

// Estructura del curso - 4 módulos, 20 capítulos sobre Pensamiento Sistémico
export const COURSE_MODULES: Module[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos del Pensamiento Sistémico',
    chapters: [
      {
        id: 'que-es-pensamiento-sistemico',
        title: '¿Qué es el Pensamiento Sistémico?',
        topics: ['Definición y origen', 'Pensamiento lineal vs. sistémico', 'El todo y las partes', 'Por qué importa hoy'],
        duration: 12
      },
      {
        id: 'historia-sistemas',
        title: 'Breve Historia del Pensamiento Sistémico',
        topics: ['De Aristóteles al holismo', 'Bertalanffy y la TGS', 'La cibernética', 'Pensamiento complejo'],
        duration: 15
      },
      {
        id: 'reduccionismo-vs-holismo',
        title: 'Reduccionismo vs. Holismo',
        topics: ['Método reduccionista', 'Problemas no descomponibles', 'Enfoque holístico', 'Cuándo usar cada uno'],
        duration: 12
      },
      {
        id: 'relevancia-siglo-xxi',
        title: 'Relevancia en el Siglo XXI',
        topics: ['Globalización', 'Crisis sistémicas', 'Hiperconectividad', 'Era de la complejidad'],
        duration: 14
      }
    ]
  },
  {
    id: 'conceptos-clave',
    title: 'Conceptos Clave',
    chapters: [
      {
        id: 'elementos-sistemas',
        title: 'Elementos de un Sistema',
        topics: ['Componentes y relaciones', 'Subsistemas y metasistemas', 'Escalas micro/meso/macro', 'Identificar sistemas'],
        duration: 14
      },
      {
        id: 'redes-conexiones',
        title: 'Redes y Conexiones',
        topics: ['Teoría de redes', 'Nodos y enlaces', 'Redes de mundo pequeño', 'El poder de los hubs'],
        duration: 15
      },
      {
        id: 'retroalimentacion',
        title: 'Retroalimentación y Dinámica',
        topics: ['Bucles positivos y negativos', 'Amplificación y estabilización', 'Puntos de inflexión', 'Ejemplos prácticos'],
        duration: 16
      },
      {
        id: 'emergencia-autoorganizacion',
        title: 'Emergencia y Autoorganización',
        topics: ['Propiedades emergentes', 'Inteligencia colectiva', 'Autoorganización', 'Emergencia en sistemas'],
        duration: 14
      },
      {
        id: 'informacion-complejidad',
        title: 'Información y Complejidad',
        topics: ['Información como cambio', 'Qué es la complejidad', 'Complejo vs. complicado', 'Gestionar incertidumbre'],
        duration: 13
      },
      {
        id: 'fragilidad-antifragilidad',
        title: 'Fragilidad, Robustez y Antifragilidad',
        topics: ['Sistemas frágiles', 'Sistemas robustos', 'Sistemas antifrágiles', 'Diseñar para el estrés'],
        duration: 15
      }
    ]
  },
  {
    id: 'sistemas-accion',
    title: 'Sistemas en Acción',
    chapters: [
      {
        id: 'sistemas-biologicos',
        title: 'Sistemas Biológicos',
        topics: ['El cuerpo como sistema', 'Microbioma y salud', 'Ecosistemas', 'La mente extendida'],
        duration: 14
      },
      {
        id: 'organizaciones-empresas',
        title: 'Organizaciones y Empresas',
        topics: ['Empresa adaptativa', 'Cultura emergente', 'Jerarquías vs. redes', 'Tragedia de los comunes'],
        duration: 16
      },
      {
        id: 'economia-mercados',
        title: 'Economía y Mercados',
        topics: ['Mercados complejos', 'Crisis financieras', 'Criptoeconomías', 'Economía circular'],
        duration: 15
      },
      {
        id: 'ciudades-sociedades',
        title: 'Ciudades y Sociedades',
        topics: ['Ciudad como organismo', 'Ciudades inteligentes', 'Dinámicas sociales', 'Lecciones del COVID-19'],
        duration: 15
      },
      {
        id: 'tecnologia-ia',
        title: 'Tecnología e Inteligencia Artificial',
        topics: ['Internet como sistema', 'Emergencia en IA', 'Sistemas sociotécnicos', 'Riesgos sistémicos'],
        duration: 14
      },
      {
        id: 'cambio-climatico',
        title: 'Cambio Climático: El Reto Sistémico Global',
        topics: ['Clima como sistema', 'Puntos de inflexión', 'Interconexión de sistemas', 'Soluciones sistémicas'],
        duration: 14
      }
    ]
  },
  {
    id: 'aplicacion-practica',
    title: 'Pensamiento Sistémico Aplicado',
    chapters: [
      {
        id: 'herramientas-analisis',
        title: 'Herramientas de Análisis Sistémico',
        topics: ['Diagramas causales', 'Identificar bucles', 'Arquetipos sistémicos', 'Simulación básica'],
        duration: 16
      },
      {
        id: 'toma-decisiones',
        title: 'Toma de Decisiones Sistémica',
        topics: ['Evitar soluciones problema', 'Puntos de apalancamiento', 'Consecuencias de segundo orden', 'Decidir bajo incertidumbre'],
        duration: 15
      },
      {
        id: 'liderazgo-sistemico',
        title: 'Liderazgo y Cambio Sistémico',
        topics: ['Líder como facilitador', 'Cambiar las reglas', 'Cooperación vs. competencia', 'Gestionar sin control'],
        duration: 14
      },
      {
        id: 'pensamiento-sistemico-vida',
        title: 'Pensamiento Sistémico en tu Vida',
        topics: ['Tu vida como sistema', 'Todo está conectado', 'Pequeños cambios, grandes efectos', 'Mentalidad sistémica'],
        duration: 12
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-curso-pensamiento-sistemico';

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
