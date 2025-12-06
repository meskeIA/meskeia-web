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

// Estructura del curso - 4 módulos con 3 capítulos cada uno = 12 capítulos
export const COURSE_MODULES: Module[] = [
  {
    id: 'preparacion',
    title: 'Preparación y Análisis',
    chapters: [
      {
        id: 'fundamentos-negociacion',
        title: 'Fundamentos de la Negociación',
        topics: ['Qué es negociar y por qué es esencial', 'Negociación posicional vs basada en intereses', 'Tipos de negociación', 'El mito del pastel fijo'],
        duration: 18
      },
      {
        id: 'analisis-negociacion',
        title: 'Análisis de la Negociación',
        topics: ['El concepto BATNA', 'Precio de reserva y meta ambiciosa', 'La Zona de Acuerdo Potencial (ZOPA)', 'Árboles de decisión'],
        duration: 22
      },
      {
        id: 'preparacion-estrategica',
        title: 'Preparación Estratégica',
        topics: ['Investigar a la otra parte', 'Definir objetivos e intereses', 'Anticipar objeciones', 'El checklist del negociador'],
        duration: 18
      }
    ]
  },
  {
    id: 'psicologia',
    title: 'Psicología y Tácticas',
    chapters: [
      {
        id: 'poder-negociacion',
        title: 'El Poder en la Negociación',
        topics: ['Fuentes de poder', 'Cómo aumentar tu poder negociador', 'El poder de la primera oferta', 'Cuándo mostrar fortaleza o flexibilidad'],
        duration: 20
      },
      {
        id: 'sesgos-cognitivos',
        title: 'Sesgos Cognitivos y Heurísticas',
        topics: ['El anclaje', 'Aversión a la pérdida', 'Exceso de confianza', 'Disponibilidad y reciprocidad'],
        duration: 22
      },
      {
        id: 'tacticas-persuasion',
        title: 'Tácticas de Persuasión',
        topics: ['Los 6 principios de Cialdini', 'Preguntas estratégicas y escucha activa', 'Cómo hacer concesiones efectivas', 'Gestionar emociones'],
        duration: 20
      }
    ]
  },
  {
    id: 'cierre',
    title: 'Cierre y Acuerdos',
    chapters: [
      {
        id: 'tecnicas-cierre',
        title: 'Técnicas de Cierre',
        topics: ['Señales de que es momento de cerrar', 'Técnicas: resumen, alternativa, urgencia', 'Superar objeciones de último momento', 'Saber cuándo retirarse'],
        duration: 18
      },
      {
        id: 'contratos-acuerdos',
        title: 'Contratos y Acuerdos',
        topics: ['Elementos de un contrato válido', 'De la negociación al acuerdo escrito', 'Cláusulas importantes', 'Errores legales comunes'],
        duration: 20
      },
      {
        id: 'negociacion-multicultural',
        title: 'Negociación Multicultural',
        topics: ['Diferencias culturales en negociación', 'Culturas de alto y bajo contexto', 'Etiqueta internacional', 'Casos: EEUU, Europa, Asia, Latinoamérica'],
        duration: 18
      }
    ]
  },
  {
    id: 'conflictos',
    title: 'Resolución de Conflictos',
    chapters: [
      {
        id: 'prevencion-conflictos',
        title: 'Prevención de Conflictos',
        topics: ['Identificar señales tempranas', 'Comunicación preventiva', 'Cláusulas de resolución', 'Construir relaciones antes de necesitarlas'],
        duration: 16
      },
      {
        id: 'mediacion-arbitraje',
        title: 'Mediación y Arbitraje',
        topics: ['Resolución Alternativa de Conflictos (RAC)', 'Cuándo usar mediación vs arbitraje', 'El proceso de mediación', 'Ventajas y desventajas'],
        duration: 20
      },
      {
        id: 'etica-negociacion',
        title: 'Ética en la Negociación',
        topics: ['Líneas rojas: mentir, manipular, coaccionar', 'Dilemas éticos comunes', 'Construir reputación a largo plazo', 'El juego infinito'],
        duration: 18
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-curso-negociacion';

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
