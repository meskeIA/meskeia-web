import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Notas Académicas - Media Ponderada y EvAU | meskeIA',
  description: 'Calcula tu media ponderada con créditos ECTS, simula tu nota de EvAU, convierte entre escalas de calificación y descubre qué nota necesitas para aprobar.',
  keywords: 'calculadora notas, media ponderada, ECTS, EvAU, selectividad, GPA, conversor notas, expediente académico, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-notas/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Notas Académicas | meskeIA',
    description: 'Calcula tu media ponderada, simula EvAU y convierte entre escalas de calificación.',
    url: 'https://meskeia.com/calculadora-notas/',
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
    title: 'Calculadora de Notas Académicas | meskeIA',
    description: 'Media ponderada ECTS, simulador EvAU y conversor de escalas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Notas Académicas',
  description: 'Calculadora de notas académicas para estudiantes hispanohablantes. Calcula media ponderada por créditos, simulador EvAU (España), y conversiones entre escalas de calificación de México, Argentina, Chile, Colombia, Perú y Venezuela.',
  url: 'https://meskeia.com/calculadora-notas/',
  category: 'EducationalApplication',
  features: [
    'Calculadora de media ponderada con créditos ECTS',
    'Simulador de nota EvAU (selectividad España)',
    'Conversión entre 6+ escalas de calificación de Latam',
    'Calculadora de "qué nota necesitas para aprobar"',
    'Tabla de equivalencias entre sistemas educativos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['calculadora notas', 'media ponderada', 'ECTS', 'EvAU', 'GPA', 'conversor notas', 'estudiantes'],
});
