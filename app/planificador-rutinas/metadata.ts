import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Planificador Visual de Rutinas - Agenda Visual del Día | meskeIA',
  description: 'Crea rutinas diarias con pictogramas visuales. Ideal para personas con autismo, TDAH, discapacidad intelectual o cualquier persona que se beneficie de una agenda visual estructurada. Sin registro, funciona sin conexión.',
  keywords: 'planificador rutinas visual, agenda visual autismo, rutinas autismo, pictogramas rutinas, TDAH organizacion, agenda diaria pictogramas, rutinas discapacidad cognitiva, horario visual, apoyo conductual positivo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador Visual de Rutinas | meskeIA',
    description: 'Crea y sigue rutinas diarias con pictogramas visuales. Para autismo, TDAH y discapacidad cognitiva.',
    url: 'https://meskeia.com/planificador-rutinas/',
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
    title: 'Planificador Visual de Rutinas | meskeIA',
    description: 'Agenda visual con pictogramas para estructurar el día. Ideal para autismo y TDAH.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador Visual de Rutinas - Agenda Visual del Día",
  description: "Crea rutinas diarias con pictogramas visuales. Ideal para personas con autismo, TDAH, discapacidad intelectual o cualquier persona que se beneficie de una agenda visual estructurada. Sin registro, funciona sin conexión.",
  url: 'https://meskeia.com/planificador-rutinas/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
