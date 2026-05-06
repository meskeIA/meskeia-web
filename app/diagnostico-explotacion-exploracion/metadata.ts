import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico Explotación vs Exploración - ¿Tu empresa innova o solo optimiza? | meskeIA',
  description: 'Descubre si tu organización equilibra bien la eficiencia operativa con la innovación. Test interactivo basado en el modelo de James G. March (1991). Gratuito y sin registro.',
  keywords: 'explotación exploración, March, innovación empresa, diagnóstico organizacional, management, balance estratégico, eficiencia vs innovación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico Explotación vs Exploración | meskeIA',
    description: '¿Tu organización está demasiado centrada en el corto plazo? Test interactivo basado en James G. March.',
    url: 'https://meskeia.com/diagnostico-explotacion-exploracion',
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
    title: 'Diagnóstico Explotación vs Exploración | meskeIA',
    description: '¿Tu organización equilibra eficiencia e innovación? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico Explotación vs Exploración meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico Explotación vs Exploración',
  description: 'Herramienta interactiva de reflexión para evaluar si tu organización equilibra la eficiencia operativa (explotación) con la innovación y el aprendizaje (exploración). Basado en el modelo académico de James G. March (1991).',
  url: 'https://meskeia.com/diagnostico-explotacion-exploracion/',
  features: [
    'Test de 10 preguntas sobre tu organización o equipo',
    'Diagnóstico visual con perfil personalizado',
    'Basado en el modelo académico de James G. March (1991)',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
