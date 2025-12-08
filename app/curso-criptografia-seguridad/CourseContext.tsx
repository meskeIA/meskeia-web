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

// Estructura del curso - 15 capítulos sobre Criptografía y Seguridad
export const COURSE_MODULES: Module[] = [
  {
    id: 'historia',
    title: 'Historia de la Criptografía',
    chapters: [
      {
        id: 'origenes-cifrado',
        title: 'Los Orígenes del Cifrado',
        topics: ['Qué es la criptografía y por qué existe', 'La escítala espartana y primeros métodos', 'El cifrado César', 'Criptografía en la antigüedad'],
        duration: 12
      },
      {
        id: 'cifrados-medievales',
        title: 'Cifrados de la Edad Media al Renacimiento',
        topics: ['La sustitución polialfabética', 'El cifrado Vigenère', 'El cifrado Playfair y las matrices', 'Transposición vs Sustitución'],
        duration: 15
      },
      {
        id: 'enigma-guerra',
        title: 'Enigma y la Criptografía en la Guerra',
        topics: ['La máquina Enigma alemana', 'Alan Turing y el descifrado', 'Impacto en la Segunda Guerra Mundial', 'La transición a la era digital'],
        duration: 14
      }
    ]
  },
  {
    id: 'fundamentos',
    title: 'Fundamentos de Criptografía Moderna',
    chapters: [
      {
        id: 'cifrar-vs-codificar',
        title: 'Cifrar vs Codificar: La Diferencia Crucial',
        topics: ['Qué significa cifrar (con clave secreta)', 'Qué significa codificar (transformación reversible)', 'Base64: codificación, no cifrado', 'Por qué la distinción importa'],
        duration: 10
      },
      {
        id: 'simetrico-asimetrico',
        title: 'Cifrado Simétrico vs Asimétrico',
        topics: ['Cifrado simétrico: una clave para todo', 'El problema del intercambio de claves', 'Cifrado asimétrico: claves pública y privada', 'Casos de uso de cada tipo'],
        duration: 15
      },
      {
        id: 'aes-estandar',
        title: 'AES: El Estándar de Oro del Cifrado',
        topics: ['Qué es AES y por qué es el estándar mundial', 'Tamaños de clave: 128, 192 y 256 bits', 'Modos de operación (CBC, GCM)', 'Aplicaciones prácticas de AES'],
        duration: 18
      }
    ]
  },
  {
    id: 'hashes',
    title: 'Funciones Hash y Verificación',
    chapters: [
      {
        id: 'que-es-hash',
        title: '¿Qué es un Hash y Para Qué Sirve?',
        topics: ['Concepto de función hash (huella digital)', 'Propiedades: determinismo, irreversibilidad, efecto avalancha', 'Hash no es cifrado: no se puede revertir', 'Usos comunes: verificación, contraseñas'],
        duration: 12
      },
      {
        id: 'algoritmos-hash',
        title: 'MD5, SHA-1, SHA-256: Comparativa',
        topics: ['MD5: historia y vulnerabilidades', 'SHA-1: el sucesor comprometido', 'SHA-256 y SHA-512: el estándar actual', 'Cuándo usar cada algoritmo'],
        duration: 14
      },
      {
        id: 'hashes-practica',
        title: 'Hashes en la Práctica: Verificación de Archivos',
        topics: ['Verificar integridad de descargas', 'Checksums en distribuciones de software', 'Detectar archivos modificados', 'Herramientas de línea de comandos'],
        duration: 10
      }
    ]
  },
  {
    id: 'contrasenas',
    title: 'Seguridad de Contraseñas',
    chapters: [
      {
        id: 'anatomia-contrasena',
        title: 'Anatomía de una Contraseña Segura',
        topics: ['Por qué fallan las contraseñas comunes', 'Longitud vs complejidad: qué importa más', 'Entropía: midiendo la fuerza real', 'El mito de los caracteres especiales'],
        duration: 12
      },
      {
        id: 'ataques-contrasenas',
        title: 'Cómo se Atacan las Contraseñas',
        topics: ['Ataques de fuerza bruta', 'Ataques de diccionario', 'Rainbow tables y por qué importa el salt', 'Credential stuffing y filtraciones'],
        duration: 15
      },
      {
        id: 'gestores-contrasenas',
        title: 'Gestores de Contraseñas: Tu Mejor Aliado',
        topics: ['Qué es un gestor de contraseñas', 'Ventajas: una contraseña maestra, miles únicas', 'Comparativa de gestores populares', 'Buenas prácticas de uso'],
        duration: 12
      }
    ]
  },
  {
    id: 'seguridad-avanzada',
    title: 'Seguridad Digital Avanzada',
    chapters: [
      {
        id: 'https-certificados',
        title: 'HTTPS y Certificados Digitales',
        topics: ['Qué es HTTPS y por qué importa', 'Cómo funcionan los certificados SSL/TLS', 'El candado verde del navegador', 'Let\'s Encrypt y la democratización'],
        duration: 14
      },
      {
        id: 'autenticacion-2fa',
        title: 'Autenticación de Dos Factores (2FA)',
        topics: ['Los tres factores: algo que sabes, tienes, eres', 'SMS vs Apps autenticadoras vs Llaves físicas', 'TOTP: cómo funcionan los códigos', 'Configurar 2FA en servicios importantes'],
        duration: 12
      },
      {
        id: 'futuro-criptografia',
        title: 'El Futuro: Criptografía Post-Cuántica',
        topics: ['La amenaza de los ordenadores cuánticos', 'Por qué la criptografía actual podría romperse', 'Algoritmos post-cuánticos en desarrollo', 'Qué puedes hacer hoy para prepararte'],
        duration: 15
      }
    ]
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEY = 'meskeia-curso-criptografia-seguridad';

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
