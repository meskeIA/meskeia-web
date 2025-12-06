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

// Estructura del curso - 6 capítulos sobre GEO/AEO
export const COURSE_MODULES: Module[] = [
  {
    id: 'paradigma',
    title: 'El Nuevo Paradigma Digital',
    chapters: [
      {
        id: 'seo-a-geo',
        title: 'De SEO a GEO/AEO: El Cambio de Era',
        topics: ['Qué es GEO (Generative Engine Optimization)', 'Qué es AEO (Answer Engine Optimization)', 'Por qué el SEO tradicional ya no es suficiente', 'El auge de las búsquedas conversacionales'],
        duration: 18
      }
    ]
  },
  {
    id: 'como-piensan',
    title: 'Cómo Funcionan las IAs',
    chapters: [
      {
        id: 'llms-rag',
        title: 'LLMs, RAG y Citaciones: Cómo "Piensan" las IAs',
        topics: ['Qué son los Large Language Models (LLMs)', 'Retrieval-Augmented Generation (RAG)', 'El proceso de citación', 'Diferencias entre ChatGPT, Perplexity, Gemini y Claude'],
        duration: 22
      }
    ]
  },
  {
    id: 'eeat',
    title: 'E-E-A-T para IAs',
    chapters: [
      {
        id: 'autoridad-confianza',
        title: 'E-E-A-T: Experiencia, Expertise, Autoridad y Confianza',
        topics: ['Qué es E-E-A-T y por qué importa', 'Experiencia de primera mano', 'Expertise y credenciales', 'Autoridad y confianza para IAs'],
        duration: 20
      }
    ]
  },
  {
    id: 'optimizacion',
    title: 'Optimización Práctica',
    chapters: [
      {
        id: 'estructura-schema',
        title: 'Estructura, Schema Markup y Entidades',
        topics: ['Estructura de contenido para IAs', 'Schema.org y datos estructurados', 'Entidades y Knowledge Graph', 'FAQ y HowTo Schema'],
        duration: 25
      }
    ]
  },
  {
    id: 'plataformas',
    title: 'Las Plataformas de IA',
    chapters: [
      {
        id: 'chatgpt-perplexity',
        title: 'ChatGPT, Perplexity, Gemini y AI Overviews',
        topics: ['ChatGPT con navegación', 'Perplexity AI', 'Google AI Overviews (SGE)', 'Estrategias específicas por plataforma'],
        duration: 22
      }
    ]
  },
  {
    id: 'medicion',
    title: 'Medición y Seguimiento',
    chapters: [
      {
        id: 'medir-citaciones',
        title: 'Cómo Saber si las IAs te Citan',
        topics: ['El reto de medir visibilidad en IAs', 'Herramientas de monitorización', 'Métricas proxy y KPIs', 'El futuro de la analítica'],
        duration: 20
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-curso-optimizacion-ia';

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
