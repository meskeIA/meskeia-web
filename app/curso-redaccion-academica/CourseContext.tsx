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

// Estructura del curso - 12 capítulos + Glosario
export const COURSE_MODULES: Module[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    chapters: [
      {
        id: 'que-es-texto-academico',
        title: 'Fundamentos del Texto Académico',
        topics: ['Qué es un texto académico', 'Tipos de textos académicos', 'El rigor académico', 'Errores comunes a evitar'],
        duration: 12
      }
    ]
  },
  {
    id: 'planificacion',
    title: 'Planificación',
    chapters: [
      {
        id: 'antes-de-escribir',
        title: 'Planificación y Estructura',
        topics: ['Las tres fases de la escritura', 'Delimitar tu tema', 'Crear un esquema de trabajo', 'Gestión del tiempo'],
        duration: 14
      }
    ]
  },
  {
    id: 'introduccion',
    title: 'Introducción',
    chapters: [
      {
        id: 'como-empezar',
        title: 'La Introducción Perfecta',
        topics: ['Componentes esenciales', 'Estrategias de apertura', 'Presentar el problema', 'Definir objetivos'],
        duration: 13
      }
    ]
  },
  {
    id: 'desarrollo',
    title: 'Desarrollo',
    chapters: [
      {
        id: 'cuerpo-argumentacion',
        title: 'Desarrollo y Argumentación',
        topics: ['Estructura del párrafo', 'Tipos de argumentos', 'Conectores del discurso', 'Progresión temática'],
        duration: 15
      }
    ]
  },
  {
    id: 'conclusiones',
    title: 'Conclusiones',
    chapters: [
      {
        id: 'cerrar-bien',
        title: 'Conclusiones Efectivas',
        topics: ['Qué debe contener', 'Resumen vs conclusión', 'Tipos de cierre', 'Abrir nuevas líneas'],
        duration: 11
      }
    ]
  },
  {
    id: 'citas',
    title: 'Citas y Referencias',
    chapters: [
      {
        id: 'citar-correctamente',
        title: 'Citas y Referencias',
        topics: ['Por qué citar', 'Cita textual vs paráfrasis', 'Sistemas de citación', 'Herramientas bibliográficas'],
        duration: 16
      }
    ]
  },
  {
    id: 'resumen',
    title: 'Resumen',
    chapters: [
      {
        id: 'sintesis-abstract',
        title: 'El Resumen Académico',
        topics: ['Qué es un abstract', 'Estructura del resumen', 'Técnicas de síntesis', 'Palabras clave'],
        duration: 12
      }
    ]
  },
  {
    id: 'resena',
    title: 'Reseña',
    chapters: [
      {
        id: 'analizar-textos',
        title: 'La Reseña Crítica',
        topics: ['Qué es una reseña', 'Estructura de la reseña', 'Análisis crítico', 'Objetividad y opinión'],
        duration: 13
      }
    ]
  },
  {
    id: 'coherencia',
    title: 'Coherencia',
    chapters: [
      {
        id: 'fluir-bien',
        title: 'Coherencia y Cohesión',
        topics: ['Unidad temática', 'Mecanismos de cohesión', 'Tipos de conectores', 'Detectar problemas'],
        duration: 14
      }
    ]
  },
  {
    id: 'estilo',
    title: 'Estilo',
    chapters: [
      {
        id: 'tono-academico',
        title: 'Estilo y Registro Académico',
        topics: ['Registro formal', 'Objetividad e impersonalidad', 'Precisión léxica', 'Errores frecuentes'],
        duration: 13
      }
    ]
  },
  {
    id: 'revision',
    title: 'Revisión',
    chapters: [
      {
        id: 'pulir-texto',
        title: 'Revisión y Edición',
        topics: ['Importancia de la revisión', 'Estrategias de autorrevisión', 'Checklist de revisión', 'Incorporar feedback'],
        duration: 12
      }
    ]
  },
  {
    id: 'proyecto-final',
    title: 'Proyecto Final',
    chapters: [
      {
        id: 'tu-primer-texto',
        title: 'Tu Primer Texto Académico',
        topics: ['Checklist antes de entregar', 'Formato y presentación', 'Los últimos retoques', 'Recursos adicionales'],
        duration: 10
      }
    ]
  },
  {
    id: 'glosario',
    title: 'Glosario',
    chapters: [
      {
        id: 'terminos-clave',
        title: 'Glosario de Términos Académicos',
        topics: ['Términos de estructura', 'Términos de citación', 'Términos de coherencia', 'Términos de estilo'],
        duration: 8
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-curso-redaccion-academica';

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
