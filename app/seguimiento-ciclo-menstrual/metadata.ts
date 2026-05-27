import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Seguimiento Ciclo Menstrual y Fertilidad - Calculadora Ovulación | meskeIA',
  description: 'Calcula tu ventana fértil, predicción de ovulación y próximas fechas de menstruación. Todo se calcula en tu navegador: ningún dato se envía a servidores.',
  keywords: 'ciclo menstrual, ovulacion, fertilidad, ventana fertil, periodo, calculadora ovulacion, calendario menstrual, dias fertiles, prediccion periodo, seguimiento ciclo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Seguimiento Ciclo Menstrual y Fertilidad - meskeIA',
    description: 'Predicción de ovulación, ventana fértil y próximas menstruaciones. Privacidad total: cálculo 100% local.',
    url: 'https://meskeia.com/seguimiento-ciclo-menstrual/',
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
    title: 'Calculadora Ciclo Menstrual y Ovulación - meskeIA',
    description: 'Conoce tu ventana fértil y próximas fechas. Privacidad garantizada.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Seguimiento Ciclo Menstrual y Fertilidad",
  description: "Calcula tu ventana fértil, predicción de ovulación y próximas fechas de menstruación. Todo se calcula en tu navegador: ningún dato se envía a servidores.",
  url: "https://meskeia.com/seguimiento-ciclo-menstrual/",
  category: 'UtilityApplication',
  features: [],
});
