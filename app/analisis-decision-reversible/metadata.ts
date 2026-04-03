import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Análisis Decisión Reversible vs Irreversible - Puertas tipo 1 y tipo 2 | meskeIA',
  description: 'Descubre si das demasiadas vueltas a decisiones que podrías probar. Test de 10 preguntas basado en el marco de Jeff Bezos (puertas tipo 1 y 2). Gratuito y sin registro.',
  keywords: 'decisión reversible irreversible, puertas tipo 1 tipo 2, Jeff Bezos, parálisis análisis, toma decisiones, decisión rápida, decisión importante, indecisión, framework decisiones, two-way doors',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Análisis Decisión Reversible vs Irreversible | meskeIA',
    description: '¿Das vueltas a decisiones que podrías probar sin riesgo? Test basado en Jeff Bezos.',
    url: 'https://meskeia.com/analisis-decision-reversible',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Análisis Decisión Reversible vs Irreversible | meskeIA',
    description: '¿Distingues decisiones tipo 1 de tipo 2? Descúbrelo con este test gratuito.',
  },
  other: {
    'application-name': 'Análisis Decisión Reversible vs Irreversible meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Análisis Decisión Reversible vs Irreversible',
  description: 'Herramienta interactiva de reflexión para evaluar si distingues bien entre decisiones reversibles e irreversibles. Basado en el marco de Jeff Bezos (puertas tipo 1 y tipo 2).',
  url: 'https://meskeia.com/analisis-decision-reversible/',
  features: [
    'Test de 10 preguntas sobre parálisis y prudencia decisional',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el marco de Jeff Bezos: puertas tipo 1 y tipo 2',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
