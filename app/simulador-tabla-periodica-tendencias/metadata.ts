import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tendencias de la Tabla Periódica: Heatmap Interactivo | meskeIA',
  description: 'Explora las tendencias periódicas con un heatmap visual: radio atómico, electronegatividad, energía de ionización, afinidad electrónica y punto de fusión para los 118 elementos. Ideal para Bachillerato, EBAU, preparatoria y secundaria.',
  keywords: 'tabla periódica, electronegatividad, radio atómico, energía de ionización, afinidad electrónica, punto de fusión, tendencias periódicas, Bachillerato, EBAU, preparatoria, secundaria, química, heatmap, elementos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-tabla-periodica-tendencias/',
  },
  openGraph: {
    type: 'website',
    title: 'Tendencias de la Tabla Periódica: Heatmap Interactivo | meskeIA',
    description: 'Visualiza con colores las tendencias periódicas de los 118 elementos: radio atómico, electronegatividad, energía de ionización, afinidad electrónica y punto de fusión.',
    url: 'https://meskeia.com/simulador-tabla-periodica-tendencias/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA - Tendencias de la Tabla Periódica',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tendencias de la Tabla Periódica: Heatmap Interactivo | meskeIA',
    description: 'Selecciona una propiedad y observa cómo varía el color en los 118 elementos según sus tendencias periódicas.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tendencias de la Tabla Periódica: Heatmap Interactivo',
  description: 'Simulador visual que muestra las tendencias periódicas mediante un mapa de calor (heatmap) sobre los 118 elementos de la tabla periódica. Selecciona entre 5 propiedades: radio atómico (pm), electronegatividad Pauling, primera energía de ionización (kJ/mol), afinidad electrónica (kJ/mol) y punto de fusión (°C). Cada celda se colorea automáticamente de azul frío a rojo caliente según el valor de la propiedad. Incluye flechas de tendencia, leyenda de color, tooltip detallado por elemento y sección educativa con explicaciones de carga nuclear efectiva, apantallamiento y excepciones notables. Ideal para Bachillerato y EBAU (España), preparatoria y secundaria (Latinoamérica), y primer año de Universidad.',
  url: 'https://meskeia.com/simulador-tabla-periodica-tendencias/',
  category: 'EducationalApplication',
  features: [
    'Heatmap interactivo de los 118 elementos con 5 propiedades seleccionables',
    'Coloreado automático azul→amarillo→rojo según valor de la propiedad',
    'Flechas de tendencia que muestran la dirección de aumento en grupo y período',
    'Leyenda de color con valores mínimo y máximo de la propiedad',
    'Tooltip flotante al hacer hover con nombre, Z, categoría y valor exacto',
    'Lantánidos y actínidos en filas separadas con posición marcada en tabla principal',
    'Sección educativa v2.0 con FAQ, escenarios reales y errores frecuentes',
    'Compatible con modo oscuro, gratuito y 100% en el navegador',
  ],
  keywords: ['tabla periódica', 'electronegatividad', 'radio atómico', 'energía de ionización', 'afinidad electrónica', 'tendencias periódicas', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria', 'química'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo varía la electronegatividad a lo largo de la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La electronegatividad aumenta de izquierda a derecha en un período (al crecer la carga nuclear efectiva) y disminuye de arriba abajo en un grupo (al aumentar el radio atómico y el apantallamiento). El flúor (F) es el elemento más electronegativo con un valor de 3,98 en la escala de Pauling, y el cesio (Cs) uno de los menos electronegativos con 0,79.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué disminuye el radio atómico al avanzar en un período?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al avanzar de izquierda a derecha en un período, se añaden protones al núcleo sin cambiar el nivel de energía principal de los electrones de valencia. La mayor carga nuclear efectiva atrae con más fuerza la nube electrónica hacia el núcleo, comprimiendo el átomo. Por eso el radio atómico disminuye dentro de un mismo período.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la energía de ionización y cómo se relaciona con la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía de primera ionización es la energía necesaria para arrancar el electrón más externo de un átomo gaseoso en estado fundamental. Aumenta de izquierda a derecha en un período (electrones más retenidos por mayor Z efectivo) y disminuye al bajar en un grupo (electrones más alejados del núcleo). Existen excepciones notables en Be-B y N-O debidas a la configuración electrónica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un heatmap de tendencias periódicas frente a una tabla de valores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El heatmap codifica los valores numéricos en colores (de azul frío a rojo caliente), lo que permite detectar de un vistazo los patrones de aumento y disminución en grupos y períodos. Una tabla de 118 números requiere leerlos uno a uno; el mapa de calor revela la tendencia global y las anomalías como el hidrógeno o los lantánidos en segundos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué propiedad de la tabla periódica es más importante para Bachillerato y selectividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cinco propiedades más frecuentes en exámenes de admisión universitaria (selectividad/EBAU/EVAU en España, y los exámenes de preparatoria y secundaria en Latinoamérica) son radio atómico, electronegatividad, primera energía de ionización, afinidad electrónica y punto de fusión. La electronegatividad y la energía de ionización suelen aparecer en preguntas de razonamiento sobre tipo de enlace y reactividad, mientras que el radio atómico es clave para explicar variaciones de tamaño y densidad.',
      },
    },
  ],
};
