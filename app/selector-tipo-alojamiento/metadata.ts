import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Alojamiento | ¿Hotel, Apartamento o Camping? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de alojamiento se adapta mejor a tu viaje: hotel, apartamento turístico, hostel o B&B, camping o glamping, o casa rural.',
  keywords: ['qué alojamiento elegir viaje', 'hotel o apartamento turístico', 'hostel o hotel', 'camping o glamping', 'casa rural vs hotel', 'tipo alojamiento según viaje', 'alojamiento para familias España', 'alojamiento barato viaje', 'mejor tipo alojamiento vacaciones', 'apartamento turístico vs hotel'],
  openGraph: {
    title: 'Selector de Tipo de Alojamiento — ¿Hotel, Apartamento o Camping?',
    description: 'Descubre qué tipo de alojamiento se adapta mejor a tu viaje en 10 preguntas.',
    url: 'https://meskeia.com/selector-tipo-alojamiento/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Alojamiento",
  description: "Test de 10 preguntas para saber qué tipo de alojamiento se adapta mejor a tu viaje: hotel, apartamento turístico, hostel o B&B, camping o glamping, o casa rural.",
  url: "https://meskeia.com/selector-tipo-alojamiento/",
  category: 'EducationalApplication',
  features: [],
});
