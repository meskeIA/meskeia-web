import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Automatización Personal - ¿Qué tareas automatizar y cuáles proteger? | meskeIA',
  description: 'Evalúa si automatizas las tareas correctas y proteges las que te hacen valioso. Test de 10 preguntas sobre automatización inteligente y protección de habilidades clave. Gratuito y sin registro.',
  keywords: 'automatización personal, qué automatizar, tareas rutinarias vs creativas, automatización inteligente, proteger habilidades, delegar a IA, productividad automatización, tareas de alto valor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Automatización Personal | meskeIA',
    description: '¿Automatizas lo correcto o estás delegando lo que te hace valioso? Test interactivo.',
    url: 'https://meskeia.com/mapa-automatizacion-personal/',
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
    title: 'Mapa de Automatización Personal | meskeIA',
    description: '¿Qué tareas deberías automatizar y cuáles proteger? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Mapa de Automatización Personal meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Automatización Personal',
  description: 'Herramienta interactiva de reflexión sobre automatización de tareas. 10 preguntas para evaluar si automatizas lo rutinario y proteges lo creativo. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/mapa-automatizacion-personal/',
  features: [
    'Test de 10 preguntas sobre cómo gestionas la automatización',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa automatización de lo rutinario y protección de lo creativo',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para automatizar mejor',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
