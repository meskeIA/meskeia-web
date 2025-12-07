'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de la estructura del curso
export const COURSE_MODULES = [
  {
    id: 'fundamentos',
    title: 'Fundamentos del Marketing Moderno',
    chapters: [
      { id: 'evolucion-marketing', title: 'La Evolución del Marketing: Del Producto al Propósito', duration: 14, topics: ['Del marketing de producto al marketing centrado en el cliente', 'La era del propósito: marcas con significado', 'Product-centric vs Customer-centric', 'El marketing en la era de la desconfianza'] },
      { id: 'nuevas-4p', title: 'Las Nuevas 4P del Marketing Digital', duration: 15, topics: ['Producto: de físico a experiencia', 'Precio: estrategias dinámicas', 'Plaza: omnicanalidad real', 'La cuarta P: Personalización'] },
      { id: 'segmentacion-moderna', title: 'Segmentación en la Era de la Privacidad', duration: 14, topics: ['El fin de las cookies de terceros', 'First-party y zero-party data', 'Segmentación contextual vs comportamental', 'Construir audiencias propias'] },
      { id: 'customer-journey', title: 'El Customer Journey Moderno', duration: 13, topics: ['Del embudo lineal al journey circular', 'Touchpoints digitales y físicos', 'Momentos de la verdad', 'Mapear el viaje del cliente'] },
    ],
  },
  {
    id: 'branding',
    title: 'Branding y Posicionamiento',
    chapters: [
      { id: 'construccion-marca', title: 'Construcción de Marca: Identidad y Personalidad', duration: 15, topics: ['Qué es realmente una marca', 'Arquetipos de marca', 'Brand personality', 'Coherencia visual y verbal'] },
      { id: 'posicionamiento', title: 'Posicionamiento: Ser Único en la Mente del Cliente', duration: 14, topics: ['La batalla por la mente', 'Estrategias de posicionamiento', 'Propuesta de valor única', 'El brand mantra'] },
      { id: 'storytelling', title: 'Storytelling: El Poder de las Historias', duration: 13, topics: ['Por qué las historias venden', 'El viaje del héroe', 'Tu cliente es el héroe', 'Casos de storytelling efectivo'] },
      { id: 'marca-personal', title: 'Marca Personal para Profesionales', duration: 12, topics: ['Por qué necesitas marca personal', 'LinkedIn como plataforma', 'Contenido que construye credibilidad', 'De empleado a referente'] },
    ],
  },
  {
    id: 'customer-centricity',
    title: 'Customer Centricity y Datos',
    chapters: [
      { id: 'clv-customer-lifetime-value', title: 'Customer Lifetime Value: El Valor Real de un Cliente', duration: 15, topics: ['Qué es el CLV', 'Cómo calcular el CLV', 'Adquisición vs retención', 'Estrategias para aumentar el CLV'] },
      { id: 'data-driven-marketing', title: 'Marketing Basado en Datos', duration: 14, topics: ['Métricas que importan', 'Google Analytics 4', 'Dashboards simples', 'Datos e intuición'] },
      { id: 'personalizacion', title: 'Personalización a Escala', duration: 13, topics: ['De segmentación a personalización 1:1', 'Email marketing personalizado', 'Recomendaciones dinámicas', 'Privacidad y personalización'] },
    ],
  },
  {
    id: 'contenidos-seo',
    title: 'Marketing de Contenidos y SEO',
    chapters: [
      { id: 'estrategia-contenidos', title: 'Estrategia de Contenidos: Más Allá del Blog', duration: 14, topics: ['El funnel de contenidos', 'Formatos para cada etapa', 'Calendario editorial', 'Repurposing'] },
      { id: 'seo-fundamentos', title: 'SEO: Fundamentos que Siguen Funcionando', duration: 16, topics: ['Cómo funciona Google', 'Keywords: investigación y selección', 'SEO on-page', 'SEO técnico básico'] },
      { id: 'seo-contenidos', title: 'SEO de Contenidos: Escribir para Humanos y Algoritmos', duration: 14, topics: ['E-E-A-T', 'Intención de búsqueda', 'Estructura de contenido', 'Featured snippets'] },
      { id: 'geo-aeo', title: 'GEO y AEO: Optimización para IAs', duration: 13, topics: ['Qué es GEO', 'Cómo eligen fuentes las IAs', 'Estructura para ser citado', 'El futuro híbrido del SEO'] },
    ],
  },
  {
    id: 'redes-sociales',
    title: 'Redes Sociales y Comunidades',
    chapters: [
      { id: 'estrategia-redes', title: 'Estrategia de Redes Sociales: No Estar en Todas', duration: 13, topics: ['Elegir las plataformas correctas', 'Objetivos de redes', 'Frecuencia y consistencia', 'Métricas que importan'] },
      { id: 'plataformas-2025', title: 'Las Plataformas en 2025: Qué Funciona Dónde', duration: 16, topics: ['Instagram: Reels y Stories', 'TikTok: viralidad y autenticidad', 'LinkedIn: B2B y thought leadership', 'YouTube: long-form y Shorts'] },
      { id: 'influencer-marketing', title: 'Influencer Marketing: De Celebrities a Micro-Influencers', duration: 14, topics: ['El espectro de influencers', 'Por qué los micro convierten más', 'UGC como estrategia', 'Cómo colaborar con influencers'] },
      { id: 'community-building', title: 'Community Building: De Seguidores a Comunidad', duration: 13, topics: ['Audiencia vs comunidad', 'Plataformas de comunidad', 'Engagement genuino', 'Clientes embajadores'] },
    ],
  },
  {
    id: 'publicidad-digital',
    title: 'Publicidad Digital',
    chapters: [
      { id: 'fundamentos-paid', title: 'Publicidad Digital: Conceptos Fundamentales', duration: 14, topics: ['CPM, CPC, CPA, ROAS', 'Orgánico vs Paid', 'El embudo de paid media', 'Presupuestos según fase'] },
      { id: 'meta-ads', title: 'Meta Ads: Facebook e Instagram', duration: 16, topics: ['Estructura de campañas', 'Audiencias', 'Creatividades que convierten', 'Optimización y escalado'] },
      { id: 'google-ads', title: 'Google Ads: Search, Display y Shopping', duration: 15, topics: ['Search ads', 'Display y remarketing', 'Performance Max', 'Google vs Meta'] },
      { id: 'atribucion-medicion', title: 'Atribución y Medición de Resultados', duration: 13, topics: ['El problema de la atribución', 'Modelos de atribución', 'UTMs y tracking', 'Dashboards de rendimiento'] },
    ],
  },
  {
    id: 'automatizacion-ia',
    title: 'Automatización e Inteligencia Artificial',
    chapters: [
      { id: 'marketing-automation', title: 'Marketing Automation: Más Allá del Email', duration: 14, topics: ['Qué es marketing automation', 'Flujos automatizados', 'Lead scoring', 'Herramientas'] },
      { id: 'ia-generativa-marketing', title: 'IA Generativa en Marketing: Uso Práctico', duration: 15, topics: ['ChatGPT, Claude, Gemini', 'Casos de uso', 'Prompts efectivos', 'Limitaciones de la IA'] },
      { id: 'futuro-marketing', title: 'El Futuro del Marketing Digital', duration: 12, topics: ['Tendencias 2025-2027', 'Privacy-first marketing', 'Convergencia de canales', 'Skills del futuro'] },
    ],
  },
  {
    id: 'aplicacion-practica',
    title: 'Aplicación Práctica',
    chapters: [
      { id: 'plan-marketing', title: 'Cómo Crear tu Plan de Marketing Digital', duration: 15, topics: ['Análisis DAFO digital', 'Objetivos SMART', 'Canales y tácticas', 'Presupuesto y recursos'] },
      { id: 'campana-integral', title: 'Tu Primera Campaña Integral', duration: 14, topics: ['Define tu público', 'Crea contenido optimizado', 'Produce material visual', 'Mide y optimiza'] },
      { id: 'errores-evitar', title: '10 Errores de Marketing que Debes Evitar', duration: 12, topics: ['Errores de estrategia', 'Errores de ejecución', 'Errores de medición', 'Errores de presupuesto'] },
      { id: 'recursos-herramientas', title: 'Kit de Herramientas del Marketer 2025', duration: 11, topics: ['Herramientas gratuitas', 'Stack según presupuesto', 'Recursos de formación', 'Mejora continua'] },
    ],
  },
];

interface CourseContextType {
  completedChapters: string[];
  isCompleted: (chapterId: string) => boolean;
  markAsCompleted: (chapterId: string) => void;
  markAsIncomplete: (chapterId: string) => void;
  getProgressPercentage: () => number;
  getCompletedCount: () => number;
  getTotalChapters: () => number;
  getTotalDuration: () => number;
  modules: typeof COURSE_MODULES;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'curso-marketing-digital-progress';

export function CourseProvider({ children }: { children: ReactNode }) {
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar progreso desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCompletedChapters(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedChapters));
    }
  }, [completedChapters, isHydrated]);

  const isCompleted = (chapterId: string) => completedChapters.includes(chapterId);

  const markAsCompleted = (chapterId: string) => {
    if (!completedChapters.includes(chapterId)) {
      setCompletedChapters([...completedChapters, chapterId]);
    }
  };

  const markAsIncomplete = (chapterId: string) => {
    setCompletedChapters(completedChapters.filter((id) => id !== chapterId));
  };

  const getTotalChapters = () => {
    return COURSE_MODULES.reduce((acc, module) => acc + module.chapters.length, 0);
  };

  const getCompletedCount = () => completedChapters.length;

  const getProgressPercentage = () => {
    const total = getTotalChapters();
    return total === 0 ? 0 : Math.round((completedChapters.length / total) * 100);
  };

  const getTotalDuration = () => {
    return COURSE_MODULES.reduce(
      (acc, module) => acc + module.chapters.reduce((sum, ch) => sum + ch.duration, 0),
      0
    );
  };

  return (
    <CourseContext.Provider
      value={{
        completedChapters,
        isCompleted,
        markAsCompleted,
        markAsIncomplete,
        getProgressPercentage,
        getCompletedCount,
        getTotalChapters,
        getTotalDuration,
        modules: COURSE_MODULES,
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

// Helper functions for chapter navigation
export function getChapterById(chapterId: string) {
  for (const module of COURSE_MODULES) {
    const chapter = module.chapters.find((ch) => ch.id === chapterId);
    if (chapter) {
      return { chapter, module };
    }
  }
  return null;
}

export function getNextChapter(currentChapterId: string) {
  const allChapters: { chapter: typeof COURSE_MODULES[0]['chapters'][0]; module: typeof COURSE_MODULES[0] }[] = [];

  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      allChapters.push({ chapter, module });
    }
  }

  const currentIndex = allChapters.findIndex((item) => item.chapter.id === currentChapterId);
  if (currentIndex === -1 || currentIndex === allChapters.length - 1) {
    return null;
  }

  return allChapters[currentIndex + 1];
}

export function getPreviousChapter(currentChapterId: string) {
  const allChapters: { chapter: typeof COURSE_MODULES[0]['chapters'][0]; module: typeof COURSE_MODULES[0] }[] = [];

  for (const module of COURSE_MODULES) {
    for (const chapter of module.chapters) {
      allChapters.push({ chapter, module });
    }
  }

  const currentIndex = allChapters.findIndex((item) => item.chapter.id === currentChapterId);
  if (currentIndex <= 0) {
    return null;
  }

  return allChapters[currentIndex - 1];
}
