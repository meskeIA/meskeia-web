import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Energía Semanal - ¿Dónde gastas energía sin retorno? | meskeIA',
  description: 'Descubre dónde pierdes energía y cómo la recuperas. Test de 10 preguntas basado en el modelo de gestión de energía de Loehr y Schwartz. Diagnóstico visual con perfil y acciones. Gratuito.',
  keywords: 'energía semanal, gestión energía, Loehr Schwartz, desgaste laboral, recarga energía, productividad energía, burnout prevención, rendimiento sostenible, energía personal, fatiga laboral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Energía Semanal | meskeIA',
    description: '¿Dónde gastas energía sin retorno? Test interactivo de gestión de energía.',
    url: 'https://meskeia.com/auditoria-energia-semanal/',
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
    title: 'Auditoría de Energía Semanal | meskeIA',
    description: '¿Tu energía está bien gestionada? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Auditoría de Energía Semanal meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Energía Semanal',
  description: 'Herramienta interactiva de reflexión para evaluar cómo gestionas tu energía semanal. Basado en el modelo de gestión de energía de Loehr y Schwartz.',
  url: 'https://meskeia.com/auditoria-energia-semanal/',
  features: [
    'Test de 10 preguntas sobre desgaste y recarga de energía',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el modelo de Loehr y Schwartz',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
