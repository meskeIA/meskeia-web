'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de los módulos del curso
export const MODULES = [
  {
    id: 1,
    slug: 'antiguedad',
    title: 'Antigüedad Clásica',
    subtitle: 'Los fundamentos del pensamiento político',
    icon: '🏛️',
    color: '#8B7355',
  },
  {
    id: 2,
    slug: 'modernidad',
    title: 'Modernidad',
    subtitle: 'El nacimiento del Estado moderno',
    icon: '⚔️',
    color: '#2E86AB',
  },
  {
    id: 3,
    slug: 'ilustracion',
    title: 'Ilustración',
    subtitle: 'Razón, libertad y contrato social',
    icon: '💡',
    color: '#F4A261',
  },
  {
    id: 4,
    slug: 'contemporaneo',
    title: 'Pensamiento Contemporáneo',
    subtitle: 'Crítica, justicia y democracia',
    icon: '🌍',
    color: '#48A9A6',
  },
];

// Definición de los capítulos del curso
export const CHAPTERS = [
  // Módulo 1: Antigüedad
  {
    id: 1,
    module: 'antiguedad',
    slug: 'platon',
    title: 'Platón',
    subtitle: 'La República y la justicia',
    icon: '📜',
    duration: '20 min',
    description: 'El diseño del Estado ideal, el gobierno de los filósofos y la búsqueda de la justicia perfecta.',
    topics: ['La República', 'El filósofo-rey', 'Justicia', 'Clases sociales', 'Mito de la caverna'],
  },
  {
    id: 2,
    module: 'antiguedad',
    slug: 'aristoteles',
    title: 'Aristóteles',
    subtitle: 'La Política y el ciudadano',
    icon: '🎓',
    duration: '20 min',
    description: 'El hombre como animal político, la clasificación de regímenes y la búsqueda del bien común.',
    topics: ['Animal político', 'Polis', 'Ciudadanía', 'Tipos de gobierno', 'Constitución mixta'],
  },
  // Módulo 2: Modernidad
  {
    id: 3,
    module: 'modernidad',
    slug: 'maquiavelo',
    title: 'Maquiavelo',
    subtitle: 'El Príncipe y el realismo político',
    icon: '🦊',
    duration: '18 min',
    description: 'La separación entre ética y política, el arte de gobernar y la razón de Estado.',
    topics: ['El Príncipe', 'Virtù y fortuna', 'Realismo político', 'Razón de Estado', 'Republicanismo'],
  },
  {
    id: 4,
    module: 'modernidad',
    slug: 'hobbes',
    title: 'Thomas Hobbes',
    subtitle: 'El Leviatán y el contrato social',
    icon: '🐉',
    duration: '20 min',
    description: 'El estado de naturaleza, el miedo como motor político y la justificación del poder absoluto.',
    topics: ['Leviatán', 'Estado de naturaleza', 'Contrato social', 'Soberanía absoluta', 'Seguridad'],
  },
  {
    id: 5,
    module: 'modernidad',
    slug: 'locke',
    title: 'John Locke',
    subtitle: 'Liberalismo y propiedad',
    icon: '🔐',
    duration: '18 min',
    description: 'Los derechos naturales, el gobierno limitado y el derecho a la revolución.',
    topics: ['Derechos naturales', 'Propiedad', 'Gobierno limitado', 'Tolerancia', 'Derecho a la rebelión'],
  },
  {
    id: 6,
    module: 'modernidad',
    slug: 'montesquieu',
    title: 'Montesquieu',
    subtitle: 'La división de poderes',
    icon: '⚖️',
    duration: '15 min',
    description: 'La separación de poderes, el espíritu de las leyes y la prevención del despotismo.',
    topics: ['División de poderes', 'El espíritu de las leyes', 'Despotismo', 'Libertad política', 'Clima y leyes'],
  },
  // Módulo 3: Ilustración
  {
    id: 7,
    module: 'ilustracion',
    slug: 'rousseau',
    title: 'Jean-Jacques Rousseau',
    subtitle: 'El contrato social y la voluntad general',
    icon: '🌿',
    duration: '20 min',
    description: 'La crítica a la civilización, la soberanía popular y la voluntad general.',
    topics: ['Contrato social', 'Voluntad general', 'Soberanía popular', 'Buen salvaje', 'Desigualdad'],
  },
  // Módulo 4: Contemporáneo
  {
    id: 8,
    module: 'contemporaneo',
    slug: 'marx',
    title: 'Karl Marx',
    subtitle: 'Materialismo histórico y lucha de clases',
    icon: '⚙️',
    duration: '20 min',
    description: 'La crítica al capitalismo, la lucha de clases y la visión de una sociedad sin Estado.',
    topics: ['Materialismo histórico', 'Lucha de clases', 'Plusvalía', 'Alienación', 'Comunismo'],
  },
  {
    id: 9,
    module: 'contemporaneo',
    slug: 'rawls',
    title: 'John Rawls',
    subtitle: 'Teoría de la justicia',
    icon: '📊',
    duration: '18 min',
    description: 'El velo de ignorancia, los principios de justicia y la equidad como fundamento político.',
    topics: ['Velo de ignorancia', 'Posición original', 'Principios de justicia', 'Equidad', 'Liberalismo político'],
  },
];

// Recursos adicionales
export const RESOURCES = [
  {
    id: 'documento-completo',
    name: 'Documento Completo',
    icon: '📚',
    description: 'Descarga el curso completo en PDF con los 31 capítulos',
    href: '/curso-teoria-politica/recursos/documento-completo',
  },
  {
    id: 'glosario',
    name: 'Glosario',
    icon: '📖',
    description: 'Términos clave de la teoría política',
    href: '/curso-teoria-politica/recursos/glosario',
  },
];

// Funciones auxiliares
export function getChaptersByModule(moduleSlug: string) {
  return CHAPTERS.filter((chapter) => chapter.module === moduleSlug);
}

export function getTotalDuration() {
  return CHAPTERS.reduce((total, chapter) => {
    const minutes = parseInt(chapter.duration.replace(' min', ''));
    return total + minutes;
  }, 0);
}

export function getChapterBySlug(moduleSlug: string, chapterSlug: string) {
  return CHAPTERS.find(
    (chapter) => chapter.module === moduleSlug && chapter.slug === chapterSlug
  );
}

export function getNextChapter(currentChapterId: number) {
  const currentIndex = CHAPTERS.findIndex((ch) => ch.id === currentChapterId);
  if (currentIndex < CHAPTERS.length - 1) {
    return CHAPTERS[currentIndex + 1];
  }
  return null;
}

export function getPreviousChapter(currentChapterId: number) {
  const currentIndex = CHAPTERS.findIndex((ch) => ch.id === currentChapterId);
  if (currentIndex > 0) {
    return CHAPTERS[currentIndex - 1];
  }
  return null;
}

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
    const saved = localStorage.getItem('meskeia-curso-teoria-politica');
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
      localStorage.setItem('meskeia-curso-teoria-politica', JSON.stringify(updated));
    }
  }, [progress, isLoaded]);

  const markChapterComplete = (chapterId: number) => {
    setProgress((prev) => {
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
