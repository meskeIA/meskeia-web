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

// Estructura del curso - 9 capítulos sobre tramitación de herencias
export const COURSE_MODULES: Module[] = [
  {
    id: 'primeros-pasos',
    title: 'Primeros Pasos',
    chapters: [
      {
        id: 'que-hacer-primero',
        title: '¿Qué Hacer en los Primeros Días?',
        topics: ['Las primeras 48 horas', 'Documentos urgentes', 'Certificado de defunción', 'A quién avisar'],
        duration: 10
      },
      {
        id: 'existe-testamento',
        title: '¿Existe Testamento?',
        topics: ['Certificado de últimas voluntades', 'Tipos de testamento', 'Herencia sin testamento'],
        duration: 12
      }
    ]
  },
  {
    id: 'herederos',
    title: 'Los Herederos',
    chapters: [
      {
        id: 'quienes-heredan',
        title: '¿Quiénes Son los Herederos?',
        topics: ['Con testamento vs sin testamento', 'Orden de sucesión', 'La legítima', 'Derechos del cónyuge viudo'],
        duration: 12
      },
      {
        id: 'aceptar-renunciar',
        title: 'Aceptar o Renunciar a la Herencia',
        topics: ['Diferencias entre opciones', 'Beneficio de inventario', 'Cuándo renunciar', 'Plazos'],
        duration: 10
      }
    ]
  },
  {
    id: 'inventario',
    title: 'El Inventario',
    chapters: [
      {
        id: 'bienes-deudas',
        title: 'Inventario de Bienes y Deudas',
        topics: ['Qué incluir', 'Valoración de bienes', 'Investigar deudas', 'Ajuar doméstico'],
        duration: 12
      }
    ]
  },
  {
    id: 'impuestos',
    title: 'Los Impuestos',
    chapters: [
      {
        id: 'impuesto-sucesiones',
        title: 'El Impuesto de Sucesiones',
        topics: ['Qué es y cuándo se paga', 'Los 6 meses críticos', 'Diferencias por CCAA', 'Bonificaciones'],
        duration: 15
      },
      {
        id: 'plusvalia-otros',
        title: 'Plusvalía Municipal y Otros Gastos',
        topics: ['Qué es la plusvalía', 'Costes de notaría', 'Gastos de registro', 'Gestoría'],
        duration: 12
      }
    ]
  },
  {
    id: 'tramites-finales',
    title: 'Trámites Finales',
    chapters: [
      {
        id: 'escritura-registro',
        title: 'La Escritura y el Registro',
        topics: ['Escritura de adjudicación', 'Documentos necesarios', 'Registro de la Propiedad', 'Cambio de titularidad'],
        duration: 12
      }
    ]
  },
  {
    id: 'glosario',
    title: 'Glosario y Recursos',
    chapters: [
      {
        id: 'glosario-herencias',
        title: 'Glosario de Términos',
        topics: ['Términos legales', 'Documentos habituales', 'Preguntas frecuentes', 'Herramientas útiles'],
        duration: 10
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-herencias-paso-a-paso';

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
