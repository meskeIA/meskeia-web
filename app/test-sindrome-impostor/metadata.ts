import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Síndrome del Impostor - ¿Subestimas tu competencia real? | meskeIA',
  description: 'Descubre si el síndrome del impostor está afectando tu carrera. Test de 10 preguntas basado en la Escala de Clance adaptada. Evalúa autoexigencia y reconocimiento de logros. Gratuito y sin registro.',
  keywords: 'síndrome del impostor, test impostor, escala Clance, autoexigencia, inseguridad profesional, competencia profesional, logros, autoestima laboral, impostor syndrome, subestimar capacidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Síndrome del Impostor | meskeIA',
    description: '¿Subestimas tu competencia real? Test interactivo basado en la Escala de Clance.',
    url: 'https://meskeia.com/test-sindrome-impostor/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Síndrome del Impostor | meskeIA',
    description: '¿Sientes que no mereces tus logros? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Síndrome del Impostor meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Síndrome del Impostor',
  description: 'Herramienta interactiva de reflexión para evaluar si el síndrome del impostor está afectando tu carrera profesional. Basado en la Escala de Clance adaptada. 10 preguntas, resultado visual con perfil y acciones concretas.',
  url: 'https://meskeia.com/test-sindrome-impostor/',
  features: [
    'Test de 10 preguntas sobre autoexigencia y reconocimiento',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en la Escala de Clance (Impostor Phenomenon)',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el síndrome del impostor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El síndrome del impostor es un patrón psicológico en el que una persona duda de sus propios logros y teme ser descubierta como un fraude, a pesar de tener evidencia objetiva de su competencia. Fue identificado por las psicólogas Pauline Clance y Suzanne Imes en 1978 y afecta especialmente a personas de alto rendimiento en entornos competitivos. No es un diagnóstico clínico, sino un conjunto de creencias y comportamientos aprendidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si tengo síndrome del impostor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales más comunes son atribuir tus éxitos a la suerte o a errores ajenos, sentir que "pronto te descubrirán", sobreprepararte por miedo a fallar y restar importancia a tus logros aunque los demás los reconozcan. Este test evalúa esas dimensiones mediante 10 preguntas y te da un resultado visual con tu perfil específico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se basa este test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test está basado en la Escala del Fenómeno del Impostor de Clance (CIPS), el instrumento de referencia más utilizado en investigación para medir la intensidad de este patrón. Las preguntas evalúan cuatro dimensiones: miedo al fracaso, necesidad de éxito, negación de la competencia y descuento de los elogios. El resultado se presenta como un mapa 2D que refleja tu posición en esas dimensiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente relevante para profesionales en entornos de alta exigencia, personas que acaban de cambiar de rol o empresa, estudiantes universitarios y de posgrado, y cualquiera que sienta que su rendimiento no se corresponde con la imagen que los demás tienen de él. No requiere ningún conocimiento previo de psicología.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre síndrome del impostor y baja autoestima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La baja autoestima implica una valoración negativa general de uno mismo, mientras que el síndrome del impostor puede coexistir con una autoestima razonablemente alta. La diferencia clave es contextual: quien lo experimenta suele sentirse capaz en otros ámbitos, pero atribuye sus logros profesionales o académicos a factores externos como la suerte, el momento o el error ajeno, no a su propio mérito.',
      },
    },
  ],
};
