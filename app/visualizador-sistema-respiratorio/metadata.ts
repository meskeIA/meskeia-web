import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Respiratorio - Del Aire al Oxígeno | meskeIA',
  description: 'Entiende cómo funcionan tus pulmones: anatomía del aparato respiratorio, intercambio gaseoso en los alvéolos, volúmenes pulmonares y espirometría visual.',
  keywords: 'sistema respiratorio, pulmones, alvéolos, diafragma, intercambio gaseoso, espirometría, volúmenes pulmonares, O2, CO2, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Respiratorio - Del Aire al Oxígeno',
    description: 'Anatomía pulmonar, intercambio O₂/CO₂, espirometría y enfermedades respiratorias explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-sistema-respiratorio',
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
    title: 'El Sistema Respiratorio - Del Aire al Oxígeno',
    description: 'Pulmones, alvéolos, diafragma, intercambio gaseoso y espirometría visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Respiratorio meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Respiratorio - Del Aire al Oxígeno',
  description: 'Explicador visual interactivo del aparato respiratorio humano: anatomía pulmonar, intercambio gaseoso O₂/CO₂ en los alvéolos, volúmenes pulmonares con espirometría visual, y datos sobre enfermedades respiratorias.',
  url: 'https://meskeia.com/visualizador-sistema-respiratorio/',
  category: 'EducationalApplication',
  features: [
    'Anatomía interactiva del aparato respiratorio',
    'Intercambio gaseoso O₂/CO₂ en alvéolos con diagrama SVG',
    'Espirometría visual con volúmenes pulmonares',
    'Enfermedades respiratorias: asma, EPOC, neumotórax',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
