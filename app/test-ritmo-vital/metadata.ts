import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Ritmo Vital - ¿Vives en modo urgencia permanente? | meskeIA',
  description: 'Descubre si vives acelerado o si has encontrado un ritmo vital sostenible. Test de 10 preguntas sobre urgencia y presencia. Basado en el concepto kletskassa y cronobiología. Gratuito.',
  keywords: 'ritmo vital, urgencia permanente, slow life, kletskassa, cronobiología, estrés velocidad, presencia, mindfulness, desacelerar, ritmo de vida',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Ritmo Vital | meskeIA',
    description: '¿Vives en modo urgencia permanente? Test interactivo sobre tu ritmo de vida.',
    url: 'https://meskeia.com/test-ritmo-vital/',
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
    title: 'Test de Ritmo Vital | meskeIA',
    description: '¿Tu ritmo de vida es sostenible? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Ritmo Vital meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Ritmo Vital',
  description: 'Herramienta interactiva de reflexión para evaluar si tu ritmo de vida es sostenible o si vives en modo urgencia permanente. Basado en el concepto kletskassa y cronobiología.',
  url: 'https://meskeia.com/test-ritmo-vital/',
  features: [
    'Test de 10 preguntas sobre tu ritmo de vida',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el concepto kletskassa y cronobiología',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
