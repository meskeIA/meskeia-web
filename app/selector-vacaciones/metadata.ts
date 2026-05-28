import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Vacaciones — ¿Qué tipo de viaje te conviene? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de vacaciones se adapta mejor a ti: playa, montaña, ciudad cultural, aventura o viaje organizado. Análisis según presupuesto, compañía, descanso y actividad.',
  keywords: [
    'qué tipo de vacaciones elegir',
    'playa o montaña',
    'vacaciones en familia España',
    'viaje cultural o de descanso',
    'destino vacaciones perfecto',
    'vacaciones activas o relajadas',
    'viaje de aventura',
    'viaje organizado o libre',
    'turismo rural España',
    'mejor destino vacacional',
  ],
  openGraph: {
    title: '¿Playa, montaña o ciudad? Test de vacaciones ideal | meskeIA',
    description: 'Descubre qué tipo de viaje se adapta mejor a tu perfil, presupuesto y compañía con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-vacaciones/',
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
    title: '¿Qué vacaciones te convienen? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para descubrir tu tipo de vacaciones ideal.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-vacaciones/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Vacaciones',
      description: 'Test orientativo para descubrir qué tipo de vacaciones (playa, montaña, ciudad cultural, aventura o viaje organizado) se adapta mejor al perfil y preferencias.',
      url: 'https://meskeia.com/selector-vacaciones/',
      features: [
        'Test de 10 preguntas sobre perfil viajero',
        '5 tipos: playa, montaña/rural, ciudad cultural, aventura, organizado',
        'Análisis de presupuesto, compañía y nivel de actividad',
        'Consejos prácticos por tipo de viaje',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Vacaciones",
  description: "Test de 10 preguntas para saber qué tipo de vacaciones se adapta mejor a ti: playa, montaña, ciudad cultural, aventura o viaje organizado. Análisis según presupuesto, compañía, descanso y actividad.",
  url: "https://meskeia.com/selector-vacaciones/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo saber qué tipo de vacaciones me convienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La elección depende de factores como tu presupuesto, con quién viajas, si buscas descanso o actividad, y cuánto tiempo tienes. Un test de perfil viajero analiza estas variables y te orienta hacia el tipo de viaje más adecuado: playa, montaña, ciudad cultural, aventura o viaje organizado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los tipos de vacaciones más habituales en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cinco perfiles más frecuentes son: vacaciones de playa (sol y mar, principalmente en julio y agosto), escapadas de montaña o turismo rural, viajes a ciudades con oferta cultural, aventura activa (senderismo, deportes al aire libre) y viajes organizados con todo incluido. Cada perfil tiene necesidades distintas de presupuesto y planificación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué vacaciones son mejores para familias con niños pequeños?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las familias con niños pequeños suelen adaptarse mejor a destinos de playa con oferta de animación, a zonas rurales tranquilas o a viajes organizados que resuelven la logística. La clave es priorizar la accesibilidad, la seguridad y la flexibilidad horaria, evitando itinerarios demasiado intensos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta de media unas vacaciones en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según datos del INE, el gasto medio de los españoles en vacaciones oscila entre 600 y 1.200 € por persona en viajes nacionales de una semana, y entre 1.200 y 2.500 € en destinos internacionales. El coste varía enormemente según el tipo de alojamiento, la temporada y si el viaje incluye vuelos o se hace en coche.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un viaje organizado de uno independiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un viaje organizado incluye traslados, alojamiento y actividades contratadas de antemano a través de una agencia; ofrece comodidad y seguridad, pero menos flexibilidad. El viaje independiente lo planifica el propio viajero, lo que permite personalizar cada detalle y a menudo resulta más económico, aunque requiere más tiempo de gestión.',
      },
    },
  ],
};
