import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Método de Estudio | ¿Cómo Estudias Mejor? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué método de estudio se adapta mejor a tu forma de aprender: repetición espaciada, mapas mentales, proyectos prácticos, Pomodoro con libros o clases particulares.',
  keywords: [
    'qué método de estudio usar',
    'cómo estudiar mejor',
    'repetición espaciada o mapas mentales',
    'Pomodoro para estudiar',
    'clases particulares o autoaprendizaje',
    'técnica estudio efectiva',
    'aprendizaje activo o pasivo',
    'memorización eficiente',
    'método estudio oposiciones',
    'cómo mejorar rendimiento académico',
  ],
  openGraph: {
    title: 'Selector de Método de Estudio — ¿Cómo Aprendes Mejor?',
    description:
      'Descubre qué método de estudio se adapta mejor a tu forma de aprender en 10 preguntas.',
    url: 'https://meskeia.com/selector-metodo-estudio/',
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
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Método de Estudio",
  description: "Test de 10 preguntas para saber qué método de estudio se adapta mejor a tu forma de aprender: repetición espaciada, mapas mentales, proyectos prácticos, Pomodoro con libros o clases particulares.",
  url: "https://meskeia.com/selector-metodo-estudio/",
  category: 'EducationalApplication',
  features: [],
});
