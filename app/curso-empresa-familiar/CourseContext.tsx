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

// Estructura del curso - 6 módulos con 2 capítulos cada uno
export const COURSE_MODULES: Module[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos de la Empresa Familiar',
    chapters: [
      {
        id: 'que-es-empresa-familiar',
        title: '¿Qué es una Empresa Familiar?',
        topics: ['Definición y características', 'Importancia económica', 'El modelo de los Tres Círculos', 'Fortalezas y desafíos'],
        duration: 20
      },
      {
        id: 'complejidad-empresa-familiar',
        title: 'Complejidad y Evolución',
        topics: ['Familia vs empresa', 'Crecimiento generacional', 'De la 1ª a la 3ª generación', 'Factores de supervivencia'],
        duration: 18
      }
    ]
  },
  {
    id: 'gobierno',
    title: 'Gobierno y Órganos de Decisión',
    chapters: [
      {
        id: 'organos-gobierno',
        title: 'Instituciones de Gobierno Familiar',
        topics: ['Consejo de Familia', 'Consejo de Administración', 'Comité de Dirección', 'Junta vs Consejo de Familia'],
        duration: 22
      },
      {
        id: 'protocolo-familiar',
        title: 'El Protocolo Familiar',
        topics: ['Qué es y para qué sirve', 'Contenido típico', 'Proceso de elaboración', 'Errores comunes'],
        duration: 18
      }
    ]
  },
  {
    id: 'profesionalizacion',
    title: 'Profesionalización y Diferenciación',
    chapters: [
      {
        id: 'diferenciacion-familia-empresa',
        title: 'Separar Familia y Empresa',
        topics: ['Diferenciación laboral', 'Política de acceso', 'Legitimación profesional', 'Profesionales externos'],
        duration: 20
      },
      {
        id: 'practicas-gestion',
        title: 'Profesionalización de la Gestión',
        topics: ['Sistemas de información', 'Planificación estratégica', 'Gestión del talento', 'Indicadores clave'],
        duration: 18
      }
    ]
  },
  {
    id: 'modelos',
    title: 'Modelos de Empresa Familiar',
    chapters: [
      {
        id: 'modelo-mental',
        title: 'El Modelo Mental: Cómo Pensamos la Empresa',
        topics: ['Pensar vs hacer', 'Familia gestora vs propietaria', 'Creencias limitantes', 'Cambio generacional'],
        duration: 20
      },
      {
        id: 'tipologias',
        title: 'Tipologías de Empresa Familiar',
        topics: ['Modelo Capitán', 'Modelo Emperador', 'Modelo Equipo Familiar', 'Familia Profesional', 'Modelo Corporación'],
        duration: 25
      }
    ]
  },
  {
    id: 'gestion-modelos',
    title: 'Gestión según el Modelo',
    chapters: [
      {
        id: 'gestion-modelos-simples',
        title: 'Gestión en Modelos Unipersonales',
        topics: ['Capitán y Emperador', 'Fortalezas clave', 'Riesgos principales', 'Cuándo evolucionar'],
        duration: 20
      },
      {
        id: 'gestion-modelos-complejos',
        title: 'Gestión en Modelos Profesionalizados',
        topics: ['Familia Profesional', 'Corporación', 'Grupo de Inversión', 'Transiciones entre modelos'],
        duration: 22
      }
    ]
  },
  {
    id: 'sucesion',
    title: 'Sucesión y Continuidad',
    chapters: [
      {
        id: 'planificacion-sucesion',
        title: 'Planificación de la Sucesión',
        topics: ['Sucesión como proceso', 'Tres dimensiones', 'Preparación del sucesor', 'Errores comunes'],
        duration: 22
      },
      {
        id: 'continuidad-transformacion',
        title: 'Continuidad y Transformación',
        topics: ['Triángulo de gestión', 'Cuándo cambiar de modelo', 'Comunicación familiar', 'El legado'],
        duration: 18
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-curso-empresa-familiar';

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
