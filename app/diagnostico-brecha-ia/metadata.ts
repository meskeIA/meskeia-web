import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Brecha IA - ¿Usas la IA para pensar mejor o para dejar de pensar? | meskeIA',
  description: 'Evalúa si usas la inteligencia artificial como amplificador de tu pensamiento o como sustituto. Test de 10 preguntas sobre criterio propio y aprovechamiento de la IA. Gratuito y sin registro.',
  keywords: 'brecha IA, uso inteligente IA, dependencia inteligencia artificial, pensamiento crítico IA, amplificador IA, ChatGPT dependencia, criterio propio IA, automatización vs pensamiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Brecha IA | meskeIA',
    description: '¿Usas la IA para pensar mejor o para dejar de pensar? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/diagnostico-brecha-ia',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diagnóstico de Brecha IA | meskeIA',
    description: '¿La IA te hace mejor o te hace dependiente? Descúbrelo con este test gratuito.',
  },
  other: {
    'application-name': 'Diagnóstico de Brecha IA meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Brecha IA',
  description: 'Herramienta interactiva de reflexión sobre el uso de la inteligencia artificial. 10 preguntas para evaluar si mantienes tu criterio propio mientras aprovechas la IA. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/diagnostico-brecha-ia/',
  features: [
    'Test de 10 preguntas sobre cómo usas la IA en tu trabajo',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa criterio propio y aprovechamiento de la IA',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para un uso más inteligente de la IA',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
