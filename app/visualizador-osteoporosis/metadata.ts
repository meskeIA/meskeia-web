import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Osteoporosis — El Ciclo de Remodelado Óseo | meskeIA',
  description: 'Visualizador educativo del remodelado óseo: osteoblastos vs osteoclastos, las 4 fases del ciclo, evolución de la densidad ósea con la edad, factores de riesgo modificables y no modificables.',
  keywords: 'osteoporosis, remodelado óseo, osteoblastos, osteoclastos, densidad ósea, calcio, vitamina D, menopausia huesos, masa ósea, fractura osteoporótica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Osteoporosis — El Ciclo de Remodelado Óseo',
    description: 'El hueso que se renueva constantemente: osteoblastos, osteoclastos, densidad ósea y factores de riesgo. Visualizador educativo interactivo.',
    url: 'https://meskeia.com/visualizador-osteoporosis/',
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
    title: 'Osteoporosis — El Ciclo de Remodelado Óseo',
    description: 'El hueso pierde densidad en silencio. Entiende cómo y por qué con este explicador visual interactivo.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-osteoporosis/' },
  other: { 'application-name': 'Osteoporosis Visualizador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Osteoporosis — El Hueso que se Renueva',
  description: 'Visualizador educativo del ciclo de remodelado óseo: las 4 fases (activación, resorción, transición, formación), balance osteoblastos vs osteoclastos, evolución de la densidad ósea por edad y sexo, y factores de riesgo modificables y no modificables.',
  url: 'https://meskeia.com/visualizador-osteoporosis/',
  category: 'EducationalApplication',
  features: [
    'Las 4 fases del ciclo de remodelado óseo con stepper interactivo',
    'Balance osteoblastos vs osteoclastos en 3 etapas de la vida',
    'Factores de riesgo modificables y no modificables',
    'Curva de densidad ósea femenina vs masculina',
    'Umbrales de osteopenia y osteoporosis explicados',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});
