import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Alquiler o Compra — ¿Qué te conviene? | meskeIA',
  description: 'Test de 10 preguntas para saber si te conviene más alquilar o comprar vivienda según tu situación personal, laboral y vital. Sin cálculos, solo tu contexto real.',
  keywords: [
    'alquilar o comprar vivienda',
    'me conviene comprar piso',
    'test alquiler vs compra',
    'cuándo comprar casa España',
    'es mejor alquilar o comprar',
    'selector alquiler compra',
    'comprar piso o seguir alquilando',
    'decidir comprar vivienda',
    'estabilidad para comprar piso',
    'alquiler vs hipoteca España',
  ],
  openGraph: {
    title: '¿Alquilar o comprar? Test en 10 preguntas | meskeIA',
    description: 'Antes de los números, analiza tu situación vital real. Estabilidad laboral, horizonte temporal, mercado local y más. Resultado: alquila, compra o espera.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-alquiler-vs-compra/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Alquilar o comprar casa? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para saber si estás en el momento vital adecuado para comprar o si es mejor seguir alquilando.',
  },
  alternates: { canonical: 'https://meskeia.com/selector-alquiler-vs-compra/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Alquiler o Compra',
      description: 'Test orientativo para saber si conviene más alquilar o comprar vivienda según situación laboral, personal y del mercado. Sin cálculos financieros, análisis de situación vital.',
      url: 'https://meskeia.com/selector-alquiler-vs-compra/',
      features: [
        'Test de 10 preguntas sobre situación vital',
        'Análisis de estabilidad laboral y personal',
        'Evaluación del horizonte temporal',
        'Consideración del mercado local',
        'Resultado: alquila, compra o espera',
        '100% en el navegador, sin registro',
        'Gratuito y sin publicidad',
        'En español',
      ],
    })),
  },
};
