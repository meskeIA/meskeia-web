import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Balance de Blancos: 2500K-10000K | meskeIA',
  description: 'Aprende balance de blancos moviendo la temperatura de color (2500K a 10000K) sobre 3 escenas con luz distinta. Indicador visual de WB correcto y guía completa con presets de cámara.',
  keywords: 'simulador balance de blancos, temperatura color Kelvin, WB cámara, tungsteno fluorescente sol nublado, corrección de color fotografía, dominante de color, RAW JPEG balance, color naranja azul foto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Balance de Blancos',
    description: 'Mueve el slider de temperatura sobre 3 escenas con luz distinta y aprende cuándo aciertas el balance correcto.',
    url: 'https://meskeia.com/simulador-balance-blancos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Balance de Blancos',
    description: 'Aprende balance de blancos con un slider Kelvin sobre 3 escenas distintas.',
  },
  other: {
    'application-name': 'Simulador de Balance de Blancos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Balance de Blancos',
  description: 'Herramienta interactiva para aprender el balance de blancos de la cámara. Slider de temperatura de color (2500K a 10000K) aplicado sobre 3 escenas con luz dominante distinta (tungsteno interior, día nublado, atardecer). Indica visualmente cuándo aciertas el balance correcto.',
  url: 'https://meskeia.com/simulador-balance-blancos/',
  category: 'EducationalApplication',
  features: [
    'Slider de temperatura de color de 2500K a 10000K en escala Kelvin',
    '3 escenas con luz dominante distinta: interior tungsteno, día nublado, atardecer',
    'Visualización inmediata del tinte aplicado sobre la escena (cálido o frío)',
    'Indicador visual de WB correcto para cada escena',
    'Mensajes contextuales: demasiado cálido, demasiado frío, balance correcto',
    'Guía completa con presets de cámara (Tungsteno, Fluorescente, Sol, Nublado, Sombra)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el balance de blancos en fotografía y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El balance de blancos (WB, White Balance) es el ajuste de la cámara que compensa la dominante de color de la fuente de luz para que los blancos aparezcan neutros en la imagen. Cada fuente de luz tiene una temperatura de color diferente medida en Kelvin: una vela emite unos 1.800K (luz muy cálida y anaranjada), mientras que un cielo despejado puede llegar a 10.000K (luz muy fría y azulada). Sin el ajuste correcto, las fotos de interior con bombillas incandescentes quedan con dominante naranja y las tomadas en sombra quedan con dominante azul.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la temperatura de color de la luz solar directa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La luz solar directa a mediodía ronda los 5.500-5.600K, que es la referencia estándar de "luz neutra" en fotografía. Por eso el preset "Sol" de las cámaras suele fijarse entre 5.200K y 5.600K. Al amanecer o al atardecer la temperatura baja a 2.500-3.500K (tonos muy cálidos y dorados), y en un día nublado sube a 6.000-7.000K (tonos más fríos y azulados).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué mis fotos de interior con luz artificial salen con tono naranja?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las bombillas incandescentes (tungsteno) tienen una temperatura de color de unos 2.700-3.200K, muy inferior a la luz del día. Si la cámara está configurada en automático o en el preset de "Sol" (5.500K), no compensa correctamente esa dominante cálida y la imagen queda con un tono naranja o amarillo. La solución es seleccionar el preset "Tungsteno" o "Incandescente" en la cámara, o establecer manualmente el WB entre 2.700K y 3.200K.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor corregir el balance de blancos en cámara o en postproceso con RAW?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si disparas en RAW, el balance de blancos no está "horneado" en el archivo y puede corregirse sin pérdida de calidad en Lightroom, Capture One o cualquier editor RAW. Si disparas en JPEG, la corrección en cámara es preferible porque el procesado posterior degrada la imagen. Para eventos o situaciones sin tiempo de postproceso, acertar el WB en cámara siempre facilita el flujo de trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene usar un balance de blancos incorrecto de forma intencionada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usar un WB "incorrecto" de forma creativa es una técnica válida. Bajar la temperatura (valores más fríos) crea atmósferas nocturnas, melancólicas o de ciencia ficción. Subir la temperatura (valores más cálidos) potencia la sensación de luz dorada en retratos o paisajes de atardecer. También se usa en fotografía de producto para evocar calidez o frialdad según la marca.',
      },
    },
  ],
};
