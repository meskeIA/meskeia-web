import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Gasto Energético - Consumo Eléctrico del Hogar | meskeIA',
  description: 'Calcula el consumo eléctrico de tus electrodomésticos y el coste mensual en tu factura de luz. Precios PVPC actualizados, comparativa de tarifas y consejos de ahorro.',
  keywords: 'gasto energetico, consumo electrico, factura luz, electrodomesticos, kwh, pvpc, ahorro energia, precio electricidad, potencia contratada, calculadora luz',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Gasto Energético - meskeIA',
    description: 'Calcula cuánto consumen tus electrodomésticos y cuánto pagas en la factura de luz. Con precios actualizados.',
    url: 'https://meskeia.com/calculadora-gasto-energetico/',
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
    title: 'Calculadora de Gasto Energético - meskeIA',
    description: 'Descubre cuánto consumen tus electrodomésticos y ahorra en la factura de luz',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Gasto Energético meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Gasto Energético - Consumo Eléctrico del Hogar",
  description: "Calcula el consumo eléctrico de tus electrodomésticos y el coste mensual en tu factura de luz. Precios PVPC actualizados, comparativa de tarifas y consejos de ahorro.",
  url: 'https://meskeia.com/calculadora-gasto-energetico/',
  category: 'EducationalApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo calculo el consumo eléctrico de un electrodoméstico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multiplica la potencia del aparato (en vatios) por las horas de uso diario y divide entre 1.000 para obtener kWh. Por ejemplo, una lavadora de 2.000 W usada 1 hora al día consume 2 kWh. Multiplicado por el precio del kWh (aprox. 0,15-0,25 €) obtienes el coste diario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los electrodomésticos que más consumen electricidad en el hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El calentador eléctrico, el aire acondicionado y la lavadora/secadora son los mayores consumidores, con potencias de 1.500 a 3.000 W. Le siguen el horno eléctrico (2.000-2.500 W) y el lavavajillas (1.200-1.800 W). Los televisores y ordenadores consumen bastante menos (100-400 W).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el PVPC y cómo afecta a mi factura de luz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El PVPC (Precio Voluntario para el Pequeño Consumidor) es la tarifa regulada en España que varía cada hora según el mercado mayorista. Los hogares con tarifa PVPC pagan precios distintos según la franja horaria (punta, llano y valle), por lo que desplazar consumos a horas valle (generalmente de noche) puede reducir la factura hasta un 30%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta al mes tener el televisor encendido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un televisor moderno LED de 55 pulgadas consume entre 80 y 120 W. Con 4 horas de uso diario y un precio medio de 0,18 €/kWh, el coste mensual es de unos 1,75-2,60 €. Si se deja en standby toda la noche puede añadir 0,5-1 € adicional al mes, dependiendo del modelo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué medidas concretas reducen más la factura eléctrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las más eficaces son: usar la lavadora y el lavavajillas en horario valle (noche o fin de semana con tarifa PVPC), sustituir bombillas por LED (ahorra un 80% vs incandescente), desconectar aparatos en standby, ajustar el termostato del calentador a 55 °C y revisar la potencia contratada (cada kW contratado de más supone ~4-5 € al mes en el término fijo).',
      },
    },
  ],
};
