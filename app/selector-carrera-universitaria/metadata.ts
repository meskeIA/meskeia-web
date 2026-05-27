import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Carrera Universitaria — ¿Qué estudios te convienen? | meskeIA',
  description: 'Test de 10 preguntas para saber qué rama de estudios universitarios se adapta mejor a tu perfil: ciencias/ingeniería, salud, humanidades/sociales, tecnología/informática o arte/diseño. Sin mencionar universidades concretas.',
  keywords: [
    'qué estudiar en la universidad',
    'carrera universitaria según perfil',
    'ingeniería o informática',
    'medicina o ciencias de la salud',
    'humanidades o ciencias sociales',
    'diseño o bellas artes',
    'qué carrera elegir España',
    'orientación universitaria',
    'estudios con más salidas laborales',
    'qué estudiar según vocación',
  ],
  openGraph: {
    title: '¿Qué carrera universitaria te conviene? Test orientativo | meskeIA',
    description: 'Descubre qué rama de estudios se adapta mejor a tu perfil, habilidades y objetivos profesionales.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-carrera-universitaria/',
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
    title: '¿Qué carrera estudiar? Test orientativo | meskeIA',
    description: 'Test de 10 preguntas para elegir entre ciencias, salud, humanidades, tecnología o arte.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-carrera-universitaria/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Carrera Universitaria',
        description:
          'Test orientativo para descubrir qué rama universitaria (ciencias/ingeniería, salud, humanidades, tecnología o arte/diseño) se adapta mejor al perfil y vocación.',
        url: 'https://meskeia.com/selector-carrera-universitaria/',
        features: [
          'Test de 10 preguntas sobre habilidades y vocación',
          '5 ramas: ciencias/ingeniería, salud, humanidades/sociales, tecnología, arte/diseño',
          'Análisis de habilidades, intereses y salidas laborales',
          'Orientación sin mencionar universidades concretas',
          '100% en el navegador, gratuito, en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Carrera Universitaria",
  description: "Test de 10 preguntas para saber qué rama de estudios universitarios se adapta mejor a tu perfil: ciencias/ingeniería, salud, humanidades/sociales, tecnología/informática o arte/diseño. Sin mencionar u",
  url: "https://meskeia.com/selector-carrera-universitaria/",
  category: 'EducationalApplication',
  features: [],
});
