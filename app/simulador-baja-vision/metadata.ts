import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Baja Visión | meskeIA',
  description: 'Simula cómo ven las personas con cataratas, miopía severa, glaucoma, degeneración macular y daltonismo. Herramienta para diseñadores y desarrolladores.',
  keywords: [
    'simulador baja visión',
    'accesibilidad visual',
    'daltonismo simulador',
    'cataratas diseño',
    'glaucoma UX',
    'discapacidad visual',
    'diseño accesible',
    'WCAG accesibilidad',
    'protanopia deuteranopia',
  ],
  openGraph: {
    title: 'Simulador de Baja Visión | meskeIA',
    description: 'Simula cómo ven las personas con distintas condiciones visuales. Ideal para diseñadores y desarrolladores.',
    url: 'https://meskeia.com/simulador-baja-vision/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/simulador-baja-vision/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador de Baja Visión",
  description: "Simula cómo ven las personas con cataratas, miopía severa, glaucoma, degeneración macular y daltonismo. Herramienta para diseñadores y desarrolladores.",
  url: "https://meskeia.com/simulador-baja-vision/",
  category: 'UtilityApplication',
  features: [
    'Simula 8 condiciones sobre una interfaz de ejemplo: cataratas, miopía severa, glaucoma, degeneración macular, baja visión general y tres tipos de daltonismo (protanopia, deuteranopia y tritanopia), más la visión normal como referencia',
    'Control de intensidad de simulación del 10 % al 100 % para condiciones con gradación',
    'Filtros SVG de daltonismo con las matrices del modelo de Machado, Oliveira y Fernandes (2009)',
    'Vista simulada sobre una interfaz de ejemplo para evaluar legibilidad',
    'Tabla de prevalencia, con fuente y población, e impacto UX por condición',
    'Guía de claves WCAG AA/AAA con ratios de contraste mínimos integrada',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la baja visión y cuántas personas la tienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Bourne et al., Lancet Glob Health 2017 (datos de 2015), resumen en PubMed: 36,0 M de
        // ciegos, 216,6 M con discapacidad moderada o grave (2,95 %) y 188,5 M con leve. Los
        // «253 millones» se llamaban «algún grado» y eran solo ciegos + moderada o grave; los
        // 2.200 millones son de la OMS, Informe mundial sobre la visión 2019 (hallazgo 2770).
        text: 'La baja visión es una pérdida de agudeza o campo visual que no puede corregirse totalmente con gafas, lentes de contacto o cirugía. Según la revisión de Bourne et al. (Lancet Global Health, 2017), en 2015 había en el mundo unos 36 millones de personas ciegas y 216,6 millones con discapacidad visual moderada o grave, el 2,95 % de la población, además de 188,5 millones con discapacidad visual leve. La Organización Mundial de la Salud, en su Informe mundial sobre la visión (2019), cifra en al menos 2.200 millones las personas con alguna deficiencia de la visión de cerca o de lejos. Entre sus causas están los errores de refracción sin corregir, las cataratas, el glaucoma y la degeneración macular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un simulador de baja visión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un simulador de baja visión aplica filtros gráficos sobre una imagen o texto para reproducir los efectos visuales de distintas condiciones oculares. Por ejemplo, simula el desenfoque progresivo de las cataratas, el campo visual reducido del glaucoma, la mancha central de la degeneración macular o la distorsión de la miopía severa. El resultado ayuda a comprender de forma intuitiva las dificultades de lectura y navegación que experimentan estas personas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve simular la baja visión en el proceso de diseño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Permite a diseñadores y desarrolladores detectar problemas de legibilidad y usabilidad antes de publicar un producto. Al ver cómo se percibe la interfaz con distintas condiciones visuales, es más fácil tomar decisiones sobre tamaño de fuente, contraste, densidad de información y estructura de navegación. Es una práctica habitual del diseño centrado en el usuario, que complementa la comprobación de las pautas WCAG sin sustituirla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre baja visión y daltonismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La baja visión implica una reducción general de la agudeza o el campo visual debida a condiciones como glaucoma, cataratas o degeneración macular. El daltonismo, en cambio, es una alteración en la percepción de determinados colores causada por diferencias en los fotorreceptores del ojo (conos), sin que necesariamente disminuya la nitidez de la visión. Ambas condiciones son independientes aunque pueden coexistir en la misma persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué condiciones visuales simula esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta simula las condiciones visuales más prevalentes: cataratas (desenfoque y pérdida de contraste), miopía severa (visión borrosa a distancia), glaucoma (pérdida del campo periférico con visión en túnel), degeneración macular (mancha central que dificulta la lectura), baja visión general, y los tres tipos de daltonismo dicromático (protanopia, deuteranopia y tritanopia). Cada simulación refleja los efectos típicos de cada condición para facilitar la empatía con los usuarios afectados.',
      },
    },
  ],
};
