import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Ahorro con Placas Solares - Autoconsumo España | meskeIA',
  description:
    'Calcula el ahorro anual con placas solares en España. Estima producción fotovoltaica, período de amortización, excedentes y reducción de CO2 según tu zona y consumo.',
  keywords:
    'placas solares, simulador fotovoltaica, autoconsumo solar España, ahorro placas solares, energía solar vivienda, amortización paneles solares, excedentes compensación, instalación fotovoltaica, kWp, irradiación solar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Ahorro con Placas Solares - Autoconsumo España',
    description:
      'Estima cuánto puedes ahorrar con una instalación fotovoltaica. Producción, amortización, excedentes y CO2 evitado según tu zona geográfica.',
    url: 'https://meskeia.com/simulador-placas-solares/',
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
    title: 'Simulador de Ahorro con Placas Solares',
    description:
      'Calcula tu ahorro con autoconsumo fotovoltaico en España. Producción, amortización y CO2 evitado gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador Placas Solares meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Ahorro con Placas Solares',
  description:
    'Simulador que estima el ahorro anual de una instalación fotovoltaica en España. Calcula producción solar, período de amortización, compensación de excedentes y reducción de CO2 según zona geográfica, consumo y orientación del tejado.',
  url: 'https://meskeia.com/simulador-placas-solares/',
  features: [
    'Estimación de producción solar por zona geográfica española',
    'Cálculo de ahorro anual y período de amortización',
    'Comparativa con y sin batería de almacenamiento',
    'Compensación de excedentes vertidos a red',
    'Reducción de CO2 estimada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se puede ahorrar con placas solares en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorro anual con paneles fotovoltaicos en España varía según la zona geográfica, el consumo del hogar y el tamaño de la instalación. En una vivienda típica con consumo de 4.000-5.000 kWh al año y una instalación de 3-5 kWp, el ahorro puede situarse entre 400 y 900 € anuales. Las comunidades del sur (Andalucía, Murcia, Extremadura) obtienen mayor producción por su mayor irradiación solar, con hasta un 20-30% más de energía generada que en el norte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En cuántos años se amortizan las placas solares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El período de amortización de una instalación fotovoltaica residencial en España se sitúa habitualmente entre 6 y 12 años, dependiendo del coste de la instalación, el precio de la electricidad y el nivel de autoconsumo. Con los precios actuales de la luz y las ayudas del Plan de Recuperación (que pueden cubrir hasta el 40-50% del coste en algunas comunidades autónomas), los plazos se han reducido considerablemente. Los paneles tienen una vida útil garantizada de 25-30 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los excedentes solares y cómo se compensan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los excedentes solares son la energía que generan los paneles y que el hogar no consume en ese momento, que se vierte a la red eléctrica. En España, desde 2019 existe el mecanismo de compensación simplificada: la comercializadora descuenta el valor de los excedentes directamente en la factura de la luz, a un precio acordado (generalmente el precio horario del mercado). Esta compensación no puede superar el importe del consumo de red en el mismo período.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Vale la pena instalar una batería de almacenamiento junto a las placas solares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La batería de almacenamiento permite guardar la energía solar generada durante el día para usarla por la noche o en momentos de baja producción, aumentando el autoconsumo del 30-40% típico sin batería a un 70-80%. Sin embargo, el coste de las baterías (entre 3.000 y 8.000 € según capacidad) hace que el período de amortización conjunto sea mayor. En hogares con consumo nocturno elevado o con tarifa con discriminación horaria, la rentabilidad mejora significativamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué potencia de instalación fotovoltaica necesito para mi vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La potencia recomendada depende del consumo anual de electricidad y de la superficie disponible en el tejado. Como referencia, un hogar con consumo de 3.500 kWh/año en zona de irradiación media necesita aproximadamente 3 kWp, que equivalen a 8-10 paneles de 380-400 W. Para cubrir el 70-80% del consumo anual suele ser suficiente con instalaciones de 3 a 6 kWp en la mayoría de las viviendas unifamiliares españolas.',
      },
    },
  ],
};
