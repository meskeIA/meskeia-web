import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Forma Jurídica — ¿Autónomo o Sociedad Limitada? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene trabajar como autónomo o constituir una Sociedad Limitada (SL). Análisis según ingresos, riesgo, socios y proyección de negocio en España.',
  keywords: [
    'autónomo o sociedad limitada',
    'SL o autónomo',
    'cuándo crear una SL',
    'forma jurídica empresa España',
    'diferencia autónomo y SL',
    'ventajas SL vs autónomo',
    'constituir sociedad limitada',
    'autónomo freelance o empresa',
    'cuándo conviene SL',
    'responsabilidad autónomo o SL',
  ],
  openGraph: {
    title: '¿Autónomo o Sociedad Limitada? Test en 10 preguntas | meskeIA',
    description:
      'Descubre qué forma jurídica se adapta mejor a tu proyecto según ingresos esperados, riesgo, socios y complejidad administrativa.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-forma-juridica/',
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
    title: '¿Autónomo o SL? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir la forma jurídica ideal: autónomo, Sociedad Limitada o esperar.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-forma-juridica/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Forma Jurídica',
        description:
          'Test orientativo para saber si conviene operar como autónomo o constituir una Sociedad Limitada según ingresos, riesgo patrimonial, socios y proyección.',
        url: 'https://meskeia.com/selector-forma-juridica/',
        features: [
          'Test de 10 preguntas sobre negocio y perfil',
          '3 recomendaciones: autónomo, SL, valorar más factores',
          'Análisis de responsabilidad patrimonial',
          'Consideración de carga fiscal comparativa',
          'Alertas sobre coste de constitución y gestión',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
