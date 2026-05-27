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
