import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Economía Circular - De lo Lineal a los Ciclos Cerrados | meskeIA',
  description: 'Visualiza la economía circular: diferencias con el modelo lineal, las 7 estrategias (reducir, reutilizar, reparar, reciclar), flujos de residuos en España y casos de éxito.',
  keywords: ['economia circular', 'reciclaje', 'residuos', 'sostenibilidad', 'derecho a reparar', 'reutilizar', 'reducir', 'tasa reciclaje españa', 'modelo circular', 'ecodiseno'],
  openGraph: {
    title: 'Economía Circular | meskeIA',
    description: 'Del modelo lineal a los ciclos cerrados: estrategias, datos de España y casos reales',
    url: 'https://meskeia.com/visualizador-economia-circular/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Economía Circular - De Lineal a Circular",
  description: "Visualiza la economía circular: diferencias con el modelo lineal, las 7 estrategias (reducir, reutilizar, reparar, reciclar), flujos de residuos en España y casos de éxito.",
  url: "https://meskeia.com/visualizador-economia-circular/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la economía circular y en qué se diferencia del modelo lineal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La economía circular es un modelo de producción y consumo que busca eliminar los residuos manteniendo los materiales en uso el mayor tiempo posible. A diferencia del modelo lineal "extraer-fabricar-desechar", el modelo circular diseña productos para que sus materiales puedan reutilizarse, repararse o reciclarse de forma continua, cerrando el ciclo de vida de los recursos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las 7 estrategias de la economía circular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las 7 estrategias principales son: Reducir (consumir menos desde el origen), Reutilizar (usar el producto más veces sin transformarlo), Reparar (alargar la vida útil), Renovar (actualizar componentes), Remanufacturar (reconstruir al nivel del original), Reusar (cambiar el uso del producto) y Reciclar (transformar el material en otro producto). Esta jerarquía prioriza las opciones que conservan más valor del material.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la tasa de reciclaje de España comparada con la media europea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'España recicla alrededor del 36% de sus residuos municipales, por debajo de la media de la UE (cercana al 48%) y muy lejos de líderes como Alemania o los Países Bajos, que superan el 65%. La normativa europea obliga a alcanzar el 55% de reciclaje de residuos municipales en 2025 y el 65% en 2035.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el derecho a reparar y cómo afecta a los consumidores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El derecho a reparar es una regulación europea (en vigor desde 2024) que obliga a los fabricantes a facilitar piezas de repuesto, herramientas y manuales de reparación a precios razonables durante al menos diez años. Para el consumidor, supone poder reparar electrodomésticos, smartphones y otros productos sin depender de servicios oficiales exclusivos, reduciendo tanto el gasto como la generación de residuos electrónicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ejemplos reales de economía circular existen en empresas españolas o europeas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunos casos destacados incluyen: Renault, que fabrica piezas de automoción con materiales remanufacturados ahorrando un 80% de energía respecto a la producción nueva; Patagonia, con su programa de reparación y venta de segunda mano de ropa técnica; y en España, empresas como Ecoembes gestionando el reciclaje de envases con tasas de recuperación superiores al 80% en plásticos de botellas PET.',
      },
    },
  ],
};
