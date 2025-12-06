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

// Estructura del curso
export const COURSE_MODULES: Module[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos de la Ciencia',
    chapters: [
      { id: 'que-es-ciencia', title: '¿Qué es la Ciencia?', topics: ['Definición y características', 'Diferencia con otras formas de conocimiento', 'Los cuatro pilares'], duration: 15 },
      { id: 'historia-ciencia', title: 'Breve Historia del Pensamiento Científico', topics: ['De la Antigüedad al Renacimiento', 'La Revolución Científica', 'La ciencia moderna'], duration: 20 }
    ]
  },
  {
    id: 'verdad',
    title: 'La Búsqueda de la Verdad',
    chapters: [
      { id: 'que-es-verdad', title: '¿Qué es la Verdad?', topics: ['Teorías de la verdad', 'Verdad objetiva vs subjetiva', 'El papel del contexto'], duration: 15 },
      { id: 'verdad-lenguaje', title: 'Verdad, Lenguaje y Lógica', topics: ['El lenguaje moldea el pensamiento', 'Falacias lógicas', 'Pensamiento crítico'], duration: 18 }
    ]
  },
  {
    id: 'metodos',
    title: 'Métodos Científicos',
    chapters: [
      { id: 'metodo-cientifico', title: 'El Método Científico', topics: ['Observación, hipótesis, experimentación', 'Empirismo vs racionalismo', 'Falsabilidad de Popper'], duration: 20 },
      { id: 'paradigmas', title: 'Paradigmas y Revoluciones Científicas', topics: ['Thomas Kuhn y los paradigmas', 'Ciencia normal vs revoluciones', 'Pensamiento sistémico'], duration: 18 }
    ]
  },
  {
    id: 'aplicaciones',
    title: 'Ciencia en la Vida Cotidiana',
    chapters: [
      { id: 'decisiones', title: 'Tomar Mejores Decisiones', topics: ['Sesgos cognitivos', 'Pensamiento probabilístico', 'Evaluación de evidencia'], duration: 20 },
      { id: 'ciencia-diaria', title: 'Aplicando el Pensamiento Científico', topics: ['En la salud', 'En finanzas personales', 'En relaciones'], duration: 15 }
    ]
  },
  {
    id: 'propagacion',
    title: 'Cómo se Propagan las Ideas',
    chapters: [
      { id: 'difusion-ideas', title: 'La Difusión del Conocimiento', topics: ['Redes sociales y viralidad', 'Sesgos de confirmación', 'Cámaras de eco'], duration: 15 },
      { id: 'pseudociencia', title: 'Ciencia vs Pseudociencia', topics: ['Identificar pseudociencia', 'Teorías conspirativas', 'Pensamiento crítico'], duration: 18 }
    ]
  },
  {
    id: 'limites',
    title: 'Los Límites de la Ciencia',
    chapters: [
      { id: 'limites-etica', title: 'Límites y Ética en la Ciencia', topics: ['Lo que la ciencia no puede responder', 'Dilemas éticos', 'Responsabilidad científica'], duration: 18 },
      { id: 'ciencia-sociedad', title: 'Ciencia, Sociedad y Futuro', topics: ['Ciencia en la sociedad', 'Ciencia y democracia', 'Desafíos del siglo XXI'], duration: 15 }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-curso-pensamiento-cientifico';

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
    throw new Error('useCourse debe usarse dentro de CourseProvider');
  }
  return context;
}

// Funciones helper
export function getChapterById(chapterId: string): { chapter: Chapter; module: Module } | null {
  for (const module of COURSE_MODULES) {
    const chapter = module.chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      return { chapter, module };
    }
  }
  return null;
}

export function getNextChapter(currentId: string): { chapter: Chapter; module: Module } | null {
  let foundCurrent = false;
  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      if (foundCurrent) {
        return { chapter, module };
      }
      if (chapter.id === currentId) {
        foundCurrent = true;
      }
    }
  }
  return null;
}

export function getPreviousChapter(currentId: string): { chapter: Chapter; module: Module } | null {
  let prevChapter: { chapter: Chapter; module: Module } | null = null;
  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      if (chapter.id === currentId) {
        return prevChapter;
      }
      prevChapter = { chapter, module };
    }
  }
  return null;
}
