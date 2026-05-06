import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía Pensar Mejor — Herramientas de reflexión profesional | meskeIA',
  description: '14 herramientas interactivas de reflexión para profesionales. Conócete, decide mejor y emprende con criterio. Tests basados en frameworks académicos (Kahneman, Csikszentmihalyi, Bezos, Osterwalder). Gratuitas y sin registro.',
  keywords: 'reflexión profesional, pensar mejor, herramientas reflexión, sesgos cognitivos, síndrome impostor, modelo negocio, decisiones, productividad, emprendimiento, carrera profesional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía Pensar Mejor — Reflexión Profesional | meskeIA',
    description: '14 herramientas interactivas para pensar mejor sobre tu carrera, tus decisiones y tu negocio.',
    url: 'https://meskeia.com/guia/pensar-mejor',
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
    title: 'Guía Pensar Mejor | meskeIA',
    description: 'Herramientas de reflexión profesional: carrera, decisiones y emprendimiento.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Pensar Mejor meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía Pensar Mejor — Herramientas de reflexión profesional',
  description: 'Guía con 14 herramientas interactivas de reflexión organizadas en 3 capítulos: conócete profesionalmente, decide mejor y emprende con criterio. Basadas en frameworks académicos reconocidos.',
  url: 'https://meskeia.com/guia/pensar-mejor/',
  features: [
    '14 herramientas de reflexión organizadas en 3 capítulos',
    'Capítulo 1: Conócete profesionalmente (estancamiento, habilidades, impostor, energía, compromisos)',
    'Capítulo 2: Decide mejor (sesgos, reversibilidad, groupthink, segunda opinión, pre-mortem)',
    'Capítulo 3: Emprende con criterio (validación, modelo, propuesta de valor, riesgo)',
    'Basadas en Kahneman, Csikszentmihalyi, Bezos, Osterwalder y otros',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
