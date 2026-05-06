import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Pensamiento de Grupo - ¿Tu equipo debate o solo confirma? | meskeIA',
  description: 'Descubre si tu equipo sufre pensamiento de grupo (groupthink). Test de 10 preguntas basado en Irving Janis. Evalúa conformidad y disidencia constructiva. Gratuito y sin registro.',
  keywords: 'pensamiento de grupo, groupthink, Irving Janis, conformidad equipo, disidencia constructiva, toma decisiones grupo, consenso, debate equipo, sesgo grupo, decisiones colectivas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Pensamiento de Grupo | meskeIA',
    description: '¿Tu equipo debate o solo confirma? Test basado en Irving Janis (groupthink).',
    url: 'https://meskeia.com/test-pensamiento-grupo',
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
    title: 'Test de Pensamiento de Grupo | meskeIA',
    description: '¿Tu equipo sufre groupthink? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Pensamiento de Grupo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Pensamiento de Grupo',
  description: 'Herramienta interactiva de reflexión para detectar si tu equipo sufre pensamiento de grupo (groupthink). Basado en el trabajo de Irving Janis.',
  url: 'https://meskeia.com/test-pensamiento-grupo/',
  features: [
    'Test de 10 preguntas sobre conformidad y disidencia',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en Irving Janis (groupthink)',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
