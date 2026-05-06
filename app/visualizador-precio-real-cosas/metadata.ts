import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Precio Real de las Cosas - En Horas de tu Vida | meskeIA',
  description: 'Descubre cuántas horas de trabajo cuesta realmente cada compra. Traduce precios a horas de vida laboral con tu sueldo real.',
  keywords: 'precio real horas trabajo, coste oportunidad, horas de vida, sueldo hora, consumo consciente, explicador visual, finanzas personales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Precio Real de las Cosas - En Horas de tu Vida',
    description: '¿Cuántas horas de trabajo cuesta un café, un móvil o unas vacaciones? Cambia tu perspectiva sobre el dinero.',
    url: 'https://meskeia.com/visualizador-precio-real-cosas',
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
    title: 'El Precio Real de las Cosas',
    description: 'Traduce precios a horas de trabajo. Cambia tu perspectiva sobre el consumo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Precio Real Cosas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Precio Real de las Cosas',
  description: 'Explicador visual que traduce el precio de objetos y servicios cotidianos a horas de trabajo reales. Slider de sueldo y visualización interactiva de compras cotidianas.',
  url: 'https://meskeia.com/visualizador-precio-real-cosas/',
  features: [
    'Traduce precios a horas de trabajo según tu sueldo',
    '15+ objetos y servicios cotidianos',
    'Slider de sueldo neto para personalizar',
    'Visualización en barras de horas de vida laboral',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
