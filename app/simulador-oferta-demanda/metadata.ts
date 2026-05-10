import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Oferta y Demanda — Equilibrio, Excedente y Controles de Precio | meskeIA',
  description:
    'Visualiza en tiempo real las curvas de oferta y demanda, el punto de equilibrio, el excedente del consumidor y del productor. Experimenta con desplazadores y controles de precio. Ideal para Bachillerato, universitarios y curiosos de la economía.',
  keywords:
    'oferta y demanda, equilibrio de mercado, precio de equilibrio, excedente del consumidor, excedente del productor, desplazadores demanda, precio máximo, precio mínimo, curva de demanda, curva de oferta, economía, Bachillerato, EBAU, bienestar social',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Oferta y Demanda | meskeIA',
    description:
      'Mueve los desplazadores de oferta y demanda para ver el equilibrio en tiempo real. Experimenta con precios máximos y mínimos.',
    url: 'https://meskeia.com/simulador-oferta-demanda',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Oferta y Demanda | meskeIA',
    description:
      'Visualiza curvas de oferta y demanda, equilibrio, excedentes y controles de precio en tiempo real.',
  },
  other: {
    'application-name': 'Simulador de Oferta y Demanda meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Oferta y Demanda',
  description:
    'Simulador interactivo de oferta y demanda para Bachillerato y universidad. Mueve desplazadores (renta, costes, tecnología) y controla precios máximos y mínimos para observar el efecto sobre el equilibrio, el excedente del consumidor y del productor.',
  url: 'https://meskeia.com/simulador-oferta-demanda/',
  category: 'EducationalApplication',
  features: [
    'Visualización en tiempo real de curvas de oferta y demanda en canvas 2D',
    'Cálculo automático del precio y cantidad de equilibrio',
    'Excedente del consumidor, excedente del productor y bienestar total',
    'Desplazadores de demanda: renta, bienes sustitutivos y preferencias',
    'Desplazadores de oferta: costes, tecnología y número de productores',
    'Modos de precio controlado: precio máximo (techo) y precio mínimo (suelo)',
    'Indicador de escasez o excedente bajo control de precios',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
  keywords: [
    'oferta y demanda',
    'equilibrio de mercado',
    'precio de equilibrio',
    'excedente consumidor',
    'economía Bachillerato',
    'EBAU economía',
    'precio máximo',
    'precio mínimo',
    'desplazadores demanda',
  ],
});
