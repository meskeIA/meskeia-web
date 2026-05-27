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
