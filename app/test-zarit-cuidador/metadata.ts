import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Zarit - Sobrecarga del Cuidador | meskeIA',
  description: 'Test de Zarit validado en español para evaluar la sobrecarga del cuidador. 22 preguntas con puntuación e interpretación orientativa. Recursos de ayuda incluidos.',
  keywords: 'test zarit, escala zarit, sobrecarga cuidador, burnout cuidador, test cuidador dependencia, carga del cuidador, zarit español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Zarit - Sobrecarga del Cuidador | meskeIA',
    description: 'Evalúa tu nivel de sobrecarga como cuidador con la escala Zarit validada en español.',
    url: 'https://meskeia.com/test-zarit-cuidador/',
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
    title: 'Test de Zarit - Sobrecarga del Cuidador | meskeIA',
    description: 'Escala Zarit: evalúa la sobrecarga del cuidador familiar',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Test Zarit Cuidador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Zarit - Sobrecarga del Cuidador',
  description: 'Escala Zarit validada en español para evaluar la sobrecarga del cuidador de personas dependientes. 22 preguntas con puntuación, interpretación orientativa y recursos de ayuda.',
  url: 'https://meskeia.com/test-zarit-cuidador/',
  features: [
    'Escala Zarit completa de 22 ítems validada en español',
    'Puntuación con 3 niveles de sobrecarga',
    'Recursos de ayuda y teléfonos de atención',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la escala Zarit y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala Zarit es un cuestionario de 22 ítems diseñado por Steven Zarit para medir la sobrecarga subjetiva del cuidador principal de personas dependientes. Evalúa el impacto del cuidado en la salud física, la vida social, la economía y el bienestar emocional del cuidador. Es una de las herramientas más utilizadas en investigación clínica y en la práctica de los servicios sociales para detectar riesgo de agotamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué puntuación indica sobrecarga intensa en el test de Zarit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la versión de 22 ítems con puntuación de 0 a 88, una puntuación igual o superior a 47 indica sobrecarga intensa. Entre 46 y 47 se considera sobrecarga leve o moderada, y por debajo de 46 se interpreta como ausencia de sobrecarga. Estas umbrales son orientativos: la interpretación definitiva debe realizarla un profesional de salud o servicios sociales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable el test de Zarit para detectar el agotamiento del cuidador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala Zarit ha sido validada en numerosos estudios internacionales, incluidos varios en población española, y muestra buena consistencia interna y validez de constructo para detectar sobrecarga en cuidadores de personas mayores y con demencia. Sin embargo, ningún cuestionario reemplaza una evaluación clínica completa: el resultado orienta, pero no diagnostica ni determina el tratamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué cuidadores va dirigida la escala Zarit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala Zarit fue diseñada originalmente para cuidadores principales de personas con demencia, pero se utiliza ampliamente con cuidadores de cualquier persona dependiente: mayores con deterioro funcional, personas con discapacidad física o intelectual, y pacientes con enfermedad crónica avanzada. Es especialmente útil cuando el cuidador lleva meses o años en esa función sin apoyo suficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el test de Zarit y otras escalas de sobrecarga del cuidador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala Zarit es la más extendida y con mayor respaldo bibliográfico. Existen versiones reducidas de 7 y 12 ítems para uso rápido en consulta. Otras herramientas como el Caregiver Strain Index (CSI) o la escala COPE miden aspectos distintos o complementarios. La versión completa de 22 ítems ofrece una visión más detallada de las distintas dimensiones de la carga que las versiones abreviadas.',
      },
    },
  ],
};
