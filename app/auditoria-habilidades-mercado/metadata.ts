import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Habilidades vs Mercado - ¿Lo que sabes es lo que se necesita? | meskeIA',
  description: 'Descubre si tus habilidades profesionales están alineadas con lo que el mercado demanda. Test de 10 preguntas sobre relevancia y actualización de competencias. Gratuito y sin registro.',
  keywords: 'habilidades vs mercado, gap analysis profesional, competencias laborales, actualización profesional, demanda laboral, skills gap, empleabilidad, formación continua, mercado laboral, obsolescencia profesional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Habilidades vs Mercado | meskeIA',
    description: '¿Lo que sabes hacer es lo que el mercado necesita? Test interactivo de gap analysis profesional.',
    url: 'https://meskeia.com/auditoria-habilidades-mercado/',
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
    title: 'Auditoría de Habilidades vs Mercado | meskeIA',
    description: '¿Tus competencias están al día? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Auditoría de Habilidades vs Mercado meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Habilidades vs Mercado',
  description: 'Herramienta interactiva de reflexión para evaluar si tus habilidades profesionales están alineadas con la demanda del mercado. Gap analysis profesional con 10 preguntas, resultado visual y acciones concretas.',
  url: 'https://meskeia.com/auditoria-habilidades-mercado/',
  features: [
    'Test de 10 preguntas sobre tus competencias y el mercado',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en gap analysis profesional',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
