import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Edad de Jubilación — ¿Cuándo me jubilo? 2026 | meskeIA',
  description: 'Descubre a qué edad puedes jubilarte según tu año de nacimiento y años cotizados. Tabla actualizada 2024-2027: desde 66 años y 6 meses hasta 67 años (definitivo).',
  keywords: 'edad jubilación 2026, cuándo me jubilo, jubilación por año nacimiento, 66 años 10 meses, 67 años jubilación, edad legal jubilación España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Cuándo me jubilo? — Edad de jubilación por año de nacimiento',
    description: 'Tabla actualizada 2024-2027. Descubre tu edad de jubilación según años cotizados.',
    url: 'https://meskeia.com/orientador-edad-jubilacion',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Cuándo me jubilo? — España 2026',
    description: 'Edad de jubilación por año de nacimiento y años cotizados.',
  },
  other: {
    'application-name': 'Orientador Edad Jubilación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Edad de Jubilación',
  description: 'Descubre a qué edad puedes jubilarte en España según tu año de nacimiento y años cotizados. Tabla progresiva actualizada 2024-2027: desde 66 años y 6 meses hasta 67 años (definitivo). Incluye el efecto de cotización larga (jubilación a los 65).',
  url: 'https://meskeia.com/orientador-edad-jubilacion/',
  features: [
    'Cálculo personalizado por año de nacimiento',
    'Tabla progresiva 2024-2027 (Ley 27/2011 + Ley 21/2021)',
    'Cotización necesaria para jubilarse a los 65',
    'Compatible con sistema dual de pensiones 2026',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
