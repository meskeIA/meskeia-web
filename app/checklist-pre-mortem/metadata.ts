import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Pre-Mortem - ¿Por qué podría fallar tu proyecto? | meskeIA',
  description: 'Evalúa si anticipas riesgos y actúas sobre ellos antes de lanzar un proyecto. Test de 10 preguntas basado en el análisis pre-mortem de Gary Klein. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'pre-mortem, Gary Klein, análisis de riesgos, gestión de proyectos, anticipar fallos, plan B, mitigación riesgos, lanzamiento proyecto, prevención fallos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Pre-Mortem | meskeIA',
    description: 'Antes de lanzar algo: ¿por qué podría fallar? Test interactivo basado en Gary Klein.',
    url: 'https://meskeia.com/checklist-pre-mortem/',
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
    title: 'Checklist Pre-Mortem | meskeIA',
    description: '¿Anticipas riesgos o confías en que todo saldrá bien? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Checklist Pre-Mortem meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist Pre-Mortem',
  description: 'Herramienta interactiva de reflexión basada en el análisis pre-mortem de Gary Klein. 10 preguntas para evaluar si anticipas riesgos y actúas sobre ellos antes de lanzar un proyecto. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/checklist-pre-mortem/',
  features: [
    'Test de 10 preguntas sobre cómo gestionas riesgos antes de lanzar',
    'Diagnóstico visual con mapa bidimensional',
    'Basado en el análisis pre-mortem de Gary Klein',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar la anticipación de fallos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
