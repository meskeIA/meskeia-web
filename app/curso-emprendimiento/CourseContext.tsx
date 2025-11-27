'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de los capítulos del curso
export const CHAPTERS = [
  {
    id: 1,
    slug: 'pensar',
    title: 'Pensar',
    subtitle: 'Identificar oportunidades',
    icon: '💡',
    duration: '20 min',
    description: 'Aprende a identificar oportunidades de negocio usando las 7 fuentes de innovación de Peter Drucker.',
    topics: ['Fuentes de innovación', 'Tendencias de mercado', 'Necesidades no cubiertas', 'Casos reales'],
  },
  {
    id: 2,
    slug: 'escuchar',
    title: 'Escuchar',
    subtitle: 'Conocer al cliente',
    icon: '👂',
    duration: '25 min',
    description: 'Descubre técnicas para conocer profundamente a tus clientes y validar tus hipótesis.',
    topics: ['Customer Discovery', 'Entrevistas', 'Jobs to be Done', 'Buyer Persona'],
  },
  {
    id: 3,
    slug: 'planear',
    title: 'Planear',
    subtitle: 'Diseñar el modelo',
    icon: '📋',
    duration: '30 min',
    description: 'Utiliza el Business Model Canvas para diseñar y visualizar tu modelo de negocio.',
    topics: ['Business Model Canvas', '9 bloques', 'Propuesta de valor', 'Canales'],
  },
  {
    id: 4,
    slug: 'clarificar',
    title: 'Clarificar',
    subtitle: 'Comunicar tu idea',
    icon: '🎯',
    duration: '20 min',
    description: 'Aprende a comunicar tu idea de negocio de forma clara y convincente.',
    topics: ['Elevator Pitch', 'Storytelling', 'Propuesta de valor', 'Presentaciones'],
  },
  {
    id: 5,
    slug: 'respaldar',
    title: 'Respaldar',
    subtitle: 'Validar con números',
    icon: '📊',
    duration: '25 min',
    description: 'Valida tu modelo con métricas clave y análisis financiero básico.',
    topics: ['Métricas clave', 'Unit Economics', 'Break-even', 'Proyecciones'],
  },
  {
    id: 6,
    slug: 'iterar',
    title: 'Iterar',
    subtitle: 'Pivotar y mejorar',
    icon: '🔄',
    duration: '20 min',
    description: 'Aprende a pivotar cuando sea necesario y mejorar continuamente tu modelo.',
    topics: ['Lean Startup', 'MVP', 'Pivote', 'Mejora continua'],
  },
];

// Herramientas interactivas
export const TOOLS = [
  {
    id: 'business-model-canvas',
    name: 'Business Model Canvas',
    icon: '🎨',
    description: 'Diseña tu modelo de negocio de forma visual',
    href: '/curso-emprendimiento/herramientas/business-model-canvas',
  },
  {
    id: 'dafo',
    name: 'Análisis DAFO',
    icon: '⚖️',
    description: 'Analiza Debilidades, Amenazas, Fortalezas y Oportunidades',
    href: '/curso-emprendimiento/herramientas/dafo',
  },
  {
    id: 'elevator-pitch',
    name: 'Generador Elevator Pitch',
    icon: '🎤',
    description: 'Crea tu pitch perfecto en 60 segundos',
    href: '/curso-emprendimiento/herramientas/elevator-pitch',
  },
];

// Tipo para el estado del progreso
interface CourseProgress {
  completedChapters: number[];
  currentChapter: number;
  startedAt: string | null;
  lastAccessedAt: string | null;
}

// Contexto
interface CourseContextType {
  progress: CourseProgress;
  markChapterComplete: (chapterId: number) => void;
  isChapterCompleted: (chapterId: number) => boolean;
  getProgressPercentage: () => number;
  resetProgress: () => void;
}

const defaultProgress: CourseProgress = {
  completedChapters: [],
  currentChapter: 1,
  startedAt: null,
  lastAccessedAt: null,
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Provider
export function CourseProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<CourseProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar progreso de localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-curso-emprendimiento');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
      } catch {
        setProgress(defaultProgress);
      }
    } else {
      // Primera visita
      setProgress({
        ...defaultProgress,
        startedAt: new Date().toISOString(),
      });
    }
    setIsLoaded(true);
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (isLoaded) {
      const updated = {
        ...progress,
        lastAccessedAt: new Date().toISOString(),
      };
      localStorage.setItem('meskeia-curso-emprendimiento', JSON.stringify(updated));
    }
  }, [progress, isLoaded]);

  const markChapterComplete = (chapterId: number) => {
    setProgress(prev => {
      if (prev.completedChapters.includes(chapterId)) {
        return prev;
      }
      const newCompleted = [...prev.completedChapters, chapterId].sort((a, b) => a - b);
      const nextChapter = Math.min(chapterId + 1, CHAPTERS.length);
      return {
        ...prev,
        completedChapters: newCompleted,
        currentChapter: Math.max(prev.currentChapter, nextChapter),
      };
    });
  };

  const isChapterCompleted = (chapterId: number) => {
    return progress.completedChapters.includes(chapterId);
  };

  const getProgressPercentage = () => {
    return Math.round((progress.completedChapters.length / CHAPTERS.length) * 100);
  };

  const resetProgress = () => {
    setProgress({
      ...defaultProgress,
      startedAt: new Date().toISOString(),
    });
  };

  return (
    <CourseContext.Provider
      value={{
        progress,
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

// Hook para usar el contexto
export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse debe usarse dentro de CourseProvider');
  }
  return context;
}
