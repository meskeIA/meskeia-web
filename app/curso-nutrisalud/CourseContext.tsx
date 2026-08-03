'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de módulos del curso
export const MODULES = [
  {
    id: 1,
    slug: 'fundamentos',
    title: 'Fundamentos Esenciales',
    subtitle: 'Las bases científicas de la nutrición',
    icon: '🧬',
    description: 'Comprende las bases científicas de la nutrición más allá de los conceptos básicos.',
    color: '#F39C12',
  },
  {
    id: 2,
    slug: 'interacciones',
    title: 'Interacciones y Sinergias',
    subtitle: 'Cómo los alimentos interactúan',
    icon: '⚡',
    description: 'Descubre cómo los alimentos se potencian o inhiben mutuamente.',
    color: '#27AE60',
  },
  {
    id: 3,
    slug: 'organos',
    title: 'Efectos en Órganos',
    subtitle: 'Nutrición por sistemas',
    icon: '❤️',
    description: 'Entiende cómo los alimentos afectan a cada sistema de tu cuerpo.',
    color: '#E74C3C',
  },
  {
    id: 4,
    slug: 'aplicacion',
    title: 'Aplicación Práctica',
    subtitle: 'Conocimiento en acción',
    icon: '🎯',
    description: 'Herramientas para aplicar este conocimiento en tu día a día.',
    color: '#3498DB',
  },
];

// Definición de capítulos del curso
export const CHAPTERS = [
  // Módulo 1: Fundamentos Esenciales
  {
    id: 1,
    slug: 'comer-vs-nutrirse',
    module: 'fundamentos',
    title: 'Diferencia entre Comer y Nutrirse',
    subtitle: 'El concepto que cambia todo',
    icon: '🍽️',
    duration: '20 min',
    description: 'Comprende por qué puedes estar lleno de calorías pero hambriento de nutrientes.',
    topics: ['Comer vs nutrirse', 'Densidad nutricional', 'Paradoja moderna', 'Transición práctica'],
  },
  {
    id: 2,
    slug: 'macronutrientes',
    module: 'fundamentos',
    title: 'Macronutrientes en Profundidad',
    subtitle: 'Calidad sobre cantidad',
    icon: '🌾',
    duration: '30 min',
    description: 'Más allá de carbohidratos, proteínas y grasas: las diferencias cualitativas.',
    topics: ['Carbohidratos', 'Proteínas', 'Grasas', 'Índice glucémico', 'Aminoácidos'],
  },
  {
    id: 3,
    slug: 'micronutrientes',
    module: 'fundamentos',
    title: 'Micronutrientes y Biodisponibilidad',
    subtitle: 'Los detalles que importan',
    icon: '💊',
    duration: '25 min',
    description: 'Vitaminas, minerales y antioxidantes: por qué no basta con consumirlos.',
    topics: ['Vitaminas', 'Minerales', 'Antioxidantes', 'Biodisponibilidad', 'Factores de absorción'],
  },
  {
    id: 4,
    slug: 'sistema-digestivo',
    module: 'fundamentos',
    title: 'Tu Sistema Digestivo como Laboratorio',
    subtitle: 'El proceso de la digestión',
    icon: '🔬',
    duration: '25 min',
    description: 'Cómo tu cuerpo procesa y transforma los alimentos en nutrientes utilizables.',
    topics: ['Proceso digestivo', 'Enzimas', 'Absorción intestinal', 'pH digestivo', 'Tiempo de tránsito'],
  },

  // Módulo 2: Interacciones y Sinergias
  {
    id: 5,
    slug: 'combinaciones-positivas',
    module: 'interacciones',
    title: 'Combinaciones que Potencian la Absorción',
    subtitle: 'Sinergias nutricionales',
    icon: '✅',
    duration: '25 min',
    description: 'Combinaciones de alimentos que multiplican la absorción de nutrientes.',
    topics: ['Vitamina C + Hierro', 'Vitamina D + Calcio', 'Grasas + Vitaminas liposolubles', 'Sinergias probadas'],
  },
  {
    id: 6,
    slug: 'combinaciones-negativas',
    module: 'interacciones',
    title: 'Combinaciones que Inhiben la Absorción',
    subtitle: 'Antinutrientes y bloqueos',
    icon: '⛔',
    duration: '20 min',
    description: 'Qué evitar combinar y por qué ciertos nutrientes compiten entre sí.',
    topics: ['Fitatos y minerales', 'Calcio y hierro', 'Taninos', 'Oxalatos', 'Cómo minimizar efectos'],
  },
  {
    id: 7,
    slug: 'timing-nutricional',
    module: 'interacciones',
    title: 'Timing Nutricional Óptimo',
    subtitle: 'Cuándo importa tanto como qué',
    icon: '⏰',
    duration: '20 min',
    description: 'El momento del día y la secuencia en que comes afecta la absorción.',
    topics: ['Ritmos circadianos', 'Ventana anabólica', 'Ayuno intermitente', 'Secuencia de comidas'],
  },
  {
    id: 8,
    slug: 'matriz-alimentaria',
    module: 'interacciones',
    title: 'La Matriz Alimentaria Importa',
    subtitle: 'El alimento completo vs nutrientes aislados',
    icon: '🧩',
    duration: '20 min',
    description: 'Por qué un alimento completo es más que la suma de sus nutrientes.',
    topics: ['Efecto matriz', 'Suplementos vs alimentos', 'Procesamiento', 'Fibra como ejemplo'],
  },

  // Módulo 3: Efectos en Órganos y Sistemas
  {
    id: 9,
    slug: 'higado',
    module: 'organos',
    title: 'Hígado y Metabolismo',
    subtitle: 'El laboratorio central',
    icon: '🫀',
    duration: '25 min',
    description: 'Cómo la alimentación afecta la función hepática y el metabolismo.',
    topics: ['Función hepática', 'Desintoxicación', 'Metabolismo de grasas', 'Alimentos hepatoprotectores'],
  },
  {
    id: 10,
    slug: 'intestino',
    module: 'organos',
    title: 'Intestino y Microbiota',
    subtitle: 'Tu segundo cerebro',
    icon: '🦠',
    duration: '30 min',
    description: 'La microbiota intestinal y su impacto en la salud global.',
    topics: ['Microbiota', 'Prebióticos', 'Probióticos', 'Eje intestino-cerebro', 'Permeabilidad intestinal'],
  },
  {
    id: 11,
    slug: 'cardiovascular',
    module: 'organos',
    title: 'Sistema Cardiovascular',
    subtitle: 'Nutrición para el corazón',
    icon: '💓',
    duration: '25 min',
    description: 'Alimentos que protegen o dañan tu sistema cardiovascular.',
    topics: ['Colesterol real', 'Inflamación', 'Presión arterial', 'Alimentos cardioprotectores'],
  },
  {
    id: 12,
    slug: 'cerebro',
    module: 'organos',
    title: 'Cerebro y Neurotransmisores',
    subtitle: 'Alimenta tu mente',
    icon: '🧠',
    duration: '25 min',
    description: 'Cómo la nutrición afecta la función cognitiva y el estado de ánimo.',
    topics: ['Neurotransmisores', 'Omega-3 y cerebro', 'Glucosa cerebral', 'Nootrópicos naturales'],
  },

  // Módulo 4: Aplicación Práctica
  {
    id: 13,
    slug: 'lectura-etiquetas',
    module: 'aplicacion',
    title: 'Lectura Crítica de Etiquetas',
    subtitle: 'Descifra la información real',
    icon: '🏷️',
    duration: '25 min',
    description: 'Cómo interpretar correctamente las etiquetas nutricionales.',
    topics: ['Lista de ingredientes', 'Claims de marketing', 'Azúcares ocultos', 'Aditivos a evitar'],
  },
  {
    id: 14,
    slug: 'mitos-nutricionales',
    module: 'aplicacion',
    title: 'Mitos Nutricionales Desmontados',
    subtitle: 'Separando hechos de ficción',
    icon: '🔍',
    duration: '30 min',
    description: 'Análisis científico de los mitos más extendidos sobre nutrición.',
    topics: ['Mitos del colesterol', 'Mitos de las grasas', 'Mitos de los carbohidratos', 'Detox y otros'],
  },
  {
    id: 15,
    slug: 'planificacion',
    module: 'aplicacion',
    title: 'Planificación Personalizada',
    subtitle: 'Tu plan nutricional',
    icon: '📋',
    duration: '25 min',
    description: 'Cómo crear un plan nutricional adaptado a tus necesidades.',
    topics: ['Autoevaluación', 'Objetivos realistas', 'Planificación semanal', 'Ajustes y seguimiento'],
  },
];

// Recursos del curso
export const RESOURCES = [
  {
    id: 'glosario',
    name: 'Glosario Nutricional',
    description: 'Términos y conceptos clave de nutrición explicados',
    icon: '📖',
    href: '/curso-nutrisalud/recursos/glosario',
  },
];

// Contexto del curso
interface CourseContextType {
  completedChapters: number[];
  markChapterComplete: (chapterId: number) => void;
  isChapterCompleted: (chapterId: number) => boolean;
  getProgressPercentage: () => number;
  resetProgress: () => void;
  hasAcceptedConsent: boolean;
  /**
   * false hasta que se ha leído localStorage. Imprescindible antes de decidir
   * nada sobre el consentimiento: en el primer render `hasAcceptedConsent` es
   * `false` incluso para quien sí aceptó, porque la lectura ocurre en un efecto.
   */
  isLoaded: boolean;
  acceptConsent: () => void;
  declineConsent: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'curso-nutrisalud-progress';
const CONSENT_KEY = 'curso-nutrisalud-consent';

export function CourseProvider({ children }: { children: ReactNode }) {
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar progreso y consentimiento desde localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        setCompletedChapters(JSON.parse(savedProgress));
      } catch {
        setCompletedChapters([]);
      }
    }

    // Verificar consentimiento (válido por 24 horas)
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (savedConsent) {
      try {
        const consentData = JSON.parse(savedConsent);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - consentData.timestamp < oneDay) {
          setHasAcceptedConsent(true);
        }
      } catch {
        setHasAcceptedConsent(false);
      }
    }

    setIsLoaded(true);
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedChapters));
    }
  }, [completedChapters, isLoaded]);

  const markChapterComplete = (chapterId: number) => {
    setCompletedChapters((prev) => {
      if (prev.includes(chapterId)) return prev;
      return [...prev, chapterId];
    });
  };

  const isChapterCompleted = (chapterId: number) => {
    return completedChapters.includes(chapterId);
  };

  const getProgressPercentage = () => {
    return Math.round((completedChapters.length / CHAPTERS.length) * 100);
  };

  const resetProgress = () => {
    setCompletedChapters([]);
  };

  const acceptConsent = () => {
    const consentData = {
      timestamp: Date.now(),
      version: '1.0',
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    setHasAcceptedConsent(true);
  };

  const declineConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
    setHasAcceptedConsent(false);
    // Redirigir a meskeIA
    window.location.href = '/';
  };

  return (
    <CourseContext.Provider
      value={{
        completedChapters,
        markChapterComplete,
        isChapterCompleted,
        getProgressPercentage,
        resetProgress,
        hasAcceptedConsent,
        isLoaded,
        acceptConsent,
        declineConsent,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

// Helper para obtener capítulos por módulo
export function getChaptersByModule(moduleSlug: string) {
  return CHAPTERS.filter((ch) => ch.module === moduleSlug);
}

// Helper para calcular duración total
export function getTotalDuration() {
  return CHAPTERS.reduce((total, ch) => {
    const minutes = parseInt(ch.duration.replace(' min', ''));
    return total + minutes;
  }, 0);
}
