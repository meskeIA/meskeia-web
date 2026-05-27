import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Ejercicio — ¿Qué deporte te conviene? | meskeIA',
  description: 'Test de 10 preguntas para descubrir qué tipo de ejercicio o deporte se adapta mejor a tus objetivos, disponibilidad, presupuesto y condición física actual.',
  keywords: [
    'qué deporte hacer',
    'selector ejercicio',
    'qué ejercicio me conviene',
    'deporte para mi estilo de vida',
    'gimnasio o running',
    'ejercicio para perder peso',
    'deporte principiantes España',
    'actividad física recomendada',
    'qué deporte empezar',
    'ejercicio según condición física',
  ],
  openGraph: {
    title: '¿Qué ejercicio te conviene? Test en 10 preguntas | meskeIA',
    description: 'Encuentra el deporte que encaja con tu cuerpo, tu tiempo y tu motivación. Objetivos, presupuesto, condición física y mucho más.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-ejercicio/',
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
    title: '¿Qué deporte te conviene? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para encontrar el ejercicio que más encaja contigo según objetivos, tiempo disponible y condición física.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-ejercicio/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Ejercicio',
      description: 'Test orientativo para descubrir qué tipo de ejercicio o deporte se adapta mejor al perfil, objetivos, disponibilidad y condición física del usuario.',
      url: 'https://meskeia.com/selector-ejercicio/',
      features: [
        'Test de 10 preguntas sobre perfil deportivo',
        '6 tipos de ejercicio analizados',
        'Consideración de limitaciones físicas',
        'Análisis de presupuesto y disponibilidad',
        'Plan orientativo de inicio',
        '100% en el navegador, sin registro',
        'Gratuito y sin publicidad',
        'En español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Ejercicio",
  description: "Test de 10 preguntas para descubrir qué tipo de ejercicio o deporte se adapta mejor a tus objetivos, disponibilidad, presupuesto y condición física actual.",
  url: "https://meskeia.com/selector-ejercicio/",
  category: 'UtilityApplication',
  features: [],
});
