import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Consumo de Combustible - Litros/100km y Coste | meskeIA',
  description: 'Calcula el consumo de combustible de tu coche, carro o auto en L/100km. Conoce el coste por kilómetro y el gasto de gasolina de tus viajes con precisión.',
  keywords: 'calculadora consumo combustible, litros 100km, coste por kilómetro, consumo coche, consumo carro, consumo auto, gasolina, diesel, gasto de gasolina, calculadora viaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Consumo de Combustible - meskeIA',
    description: 'Calcula el consumo de tu coche, carro o auto y el coste de tus viajes',
    url: 'https://meskeia.com/calculadora-combustible/',
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
    title: 'Calculadora de Consumo de Combustible - meskeIA',
    description: 'Calcula el consumo de tu coche, carro o auto y el coste de tus viajes',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Consumo Combustible",
  description: "Calcula el consumo de combustible de tu coche, carro o auto en L/100km. Conoce el coste por kilómetro y el gasto de gasolina de tus viajes con precisión.",
  url: "https://meskeia.com/calculadora-combustible/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el consumo de combustible en litros cada 100 km?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para calcular el consumo en L/100km se divide la cantidad de combustible consumido (en litros) entre la distancia recorrida (en km) y se multiplica por 100. Por ejemplo, si gastas 45 litros en 500 km, el consumo es (45 / 500) × 100 = 9 L/100km. Es la unidad más habitual en Europa para comparar la eficiencia de vehículos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el consumo medio de un coche en carretera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un turismo gasolina moderno consume entre 5 y 7 L/100km en carretera a velocidad constante. Los diésel suelen estar entre 4 y 6 L/100km, y los SUV o vehículos grandes pueden superar los 8 L/100km. En ciudad el consumo sube notablemente, entre un 30% y un 60% más, debido a las aceleraciones y frenadas frecuentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo el coste de un viaje en coche (carro o auto) con gasolina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multiplica la distancia del viaje (en km) por el consumo de tu coche, carro o auto (L/100km) y divide entre 100 para obtener los litros necesarios. Luego multiplica por el precio del combustible por litro. Por ejemplo, 600 km × 7 L/100km / 100 × 1,65 €/L = 69,30 € de gasto de gasolina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre consumo urbano, extraurbano y mixto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El consumo urbano mide el gasto en conducción por ciudad (semáforos, atascos, velocidades bajas) y es el más elevado. El extraurbano refleja autopista o carretera a velocidad sostenida y es el más bajo. El consumo mixto es una media ponderada de ambos que sirve como referencia general y aparece en las fichas técnicas de los vehículos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer el consumo real de mi coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer el consumo real permite planificar el presupuesto de viajes largos, detectar si el vehículo está consumiendo más de lo habitual (posible indicador de avería o neumáticos en mal estado) y comparar entre distintos vehículos antes de comprar. También ayuda a estimar la autonomía restante con el depósito actual.',
      },
    },
  ],
};
