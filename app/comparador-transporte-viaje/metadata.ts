import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Transporte para Viajes — Avión, Tren, Bus o Coche | meskeIA',
  description: 'Compara avión, tren, autobús y coche para tu trayecto: coste total, tiempo de viaje, emisiones CO₂ y equipaje. Elige el transporte más adecuado según tu presupuesto y preferencias.',
  keywords: [
    'comparar transporte viaje',
    'avión o tren España',
    'cuánto cuesta ir en tren vs avión',
    'autobús interurbano precio',
    'viaje en coche o avión',
    'coste transporte por persona',
    'CO2 transporte viaje',
    'comparar medios transporte',
    'tren AVE vs vuelo',
    'presupuesto transporte vacaciones',
  ],
  openGraph: {
    title: '¿Avión, tren, bus o coche? Compara transporte para tu viaje | meskeIA',
    description: 'Introduce la distancia y el número de personas y compara al instante coste, tiempo y emisiones de cada medio de transporte.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/comparador-transporte-viaje/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparador de transporte para viajes | meskeIA',
    description: 'Avión vs tren vs bus vs coche: coste, tiempo y CO₂ para tu trayecto.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/comparador-transporte-viaje/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Comparador de Transporte para Viajes',
      description: 'Compara avión, tren, autobús y coche para cualquier trayecto según distancia, número de personas y equipaje. Muestra coste estimado, tiempo, emisiones CO₂ y características de equipaje.',
      url: 'https://meskeia.com/comparador-transporte-viaje/',
      features: [
        'Comparativa de 4 medios: avión, tren, autobús y coche',
        'Coste total y por persona según número de viajeros',
        'Tiempo de viaje estimado incluyendo traslados',
        'Emisiones CO₂ por persona y total',
        'Presets de rutas populares españolas',
        '100% en el navegador, sin registro',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador de Transporte para Viajes",
  description: "Compara avión, tren, autobús y coche para tu trayecto: coste total, tiempo de viaje, emisiones CO₂ y equipaje. Elige el transporte más adecuado según tu presupuesto y preferencias.",
  url: "https://meskeia.com/comparador-transporte-viaje/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo comparo avión, tren y coche para un viaje?',
      acceptedAnswer: { '@type': 'Answer', text: 'Introduce la distancia del trayecto y el número de personas. La herramienta calcula automáticamente el coste estimado, el tiempo total de desplazamiento (incluyendo traslados al aeropuerto o estación) y las emisiones de CO₂ para avión, tren, autobús y coche, permitiéndote elegir según tu prioridad: precio, tiempo o impacto ambiental.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el medio de transporte más barato para viajar en España?',
      acceptedAnswer: { '@type': 'Answer', text: 'Depende de la distancia y el número de viajeros. Para trayectos cortos (<200 km), el autobús interurbano suele ser la opción más económica. Para distancias medias (200–600 km), el AVE puede ser competitivo en precio si se reserva con antelación. El coche propio resulta rentable cuando viajan 3 o más personas, ya que el coste se divide entre todos.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué medio de transporte emite menos CO₂?',
      acceptedAnswer: { '@type': 'Answer', text: 'El tren eléctrico es el medio de transporte de largo recorrido con menor huella de carbono por pasajero-kilómetro: entre 6 y 14 g CO₂/km. El autobús de larga distancia emite entre 25 y 35 g CO₂/km por pasajero. El avión emite entre 100 y 200 g CO₂/km, y el coche particular entre 70 y 120 g CO₂/km dependiendo del número de ocupantes.' },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena el tren frente al avión para trayectos de 400–600 km?',
      acceptedAnswer: { '@type': 'Answer', text: 'En muchos casos, sí. Para trayectos como Madrid–Barcelona (~600 km), el AVE tarda 2,5 horas puerta a puerta desde el centro de la ciudad, mientras que el avión puede superar las 3–4 horas si se suma el desplazamiento al aeropuerto, el control de seguridad y la espera de equipaje. El precio suele ser similar si se reserva con antelación.' },
    },
    {
      '@type': 'Question',
      name: '¿Para cuántas personas es útil el comparador de transporte?',
      acceptedAnswer: { '@type': 'Answer', text: 'El comparador permite introducir el número exacto de viajeros. Esto es especialmente útil para grupos familiares o de amigos, donde el coche suele ser la opción más barata por el reparto del coste de combustible y peajes. A partir de 4 personas, el coche compite directamente en precio con el autobús o incluso el tren en muchas rutas.' },
    },
  ],
};
