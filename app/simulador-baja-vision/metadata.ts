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
  features: [],
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
        text: 'La baja visión es una pérdida de agudeza o campo visual que no puede corregirse totalmente con gafas, lentes de contacto o cirugía. La Organización Mundial de la Salud estima que más de 253 millones de personas en el mundo tienen algún grado de discapacidad visual, de las cuales alrededor de 217 millones presentan baja visión moderada o grave. Las causas más frecuentes son las cataratas, el glaucoma y la degeneración macular.',
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
        text: 'Permite a diseñadores y desarrolladores detectar problemas de legibilidad y usabilidad antes de publicar un producto. Al ver cómo se percibe la interfaz con distintas condiciones visuales, es más fácil tomar decisiones sobre tamaño de fuente, contraste, densidad de información y estructura de navegación. Es una práctica recomendada por los estándares WCAG y por metodologías de diseño centrado en el usuario.',
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
        text: 'La herramienta simula las condiciones visuales más prevalentes: cataratas (desenfoque y pérdida de contraste), miopía severa (visión borrosa a distancia), glaucoma (pérdida del campo periférico con visión en túnel), degeneración macular (mancha central que dificulta la lectura), y algunas formas de daltonismo (protanopia, deuteranopia). Cada simulación refleja los efectos típicos de cada condición para facilitar la empatía con los usuarios afectados.',
      },
    },
  ],
};
