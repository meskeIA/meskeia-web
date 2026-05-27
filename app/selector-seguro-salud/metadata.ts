import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Salud — ¿Me conviene el privado? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene contratar un seguro de salud privado en España, qué cobertura necesitas y en qué situaciones tiene más sentido.',
  keywords: [
    'seguro de salud privado',
    'me conviene seguro privado',
    'seguro médico privado España',
    'selector seguro salud',
    'sanidad pública o privada',
    'cobertura seguro médico',
    'precio seguro salud España',
    'seguro dental privado',
    'cuándo contratar seguro médico',
    'mutua privada España',
  ],
  openGraph: {
    title: '¿Te conviene un seguro de salud privado? Test gratuito | meskeIA',
    description:
      'Descubre si el seguro médico privado tiene sentido para tu situación, qué cobertura necesitas y cuánto te costaría aproximadamente.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-seguro-salud/',
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
    title: '¿Seguro médico privado o sanidad pública? Test | meskeIA',
    description:
      'Test de 10 preguntas para saber si un seguro de salud privado te aporta valor real según tu situación.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-seguro-salud/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Seguro de Salud',
        description:
          'Test orientativo de 10 preguntas para saber si un seguro de salud privado tiene sentido según tu situación, uso médico habitual, CCAA de residencia y presupuesto. Incluye recomendación de cobertura y coste orientativo.',
        url: 'https://meskeia.com/selector-seguro-salud/',
        features: [
          'Test de 10 preguntas sobre uso médico y situación',
          'Recomendación: sanidad pública, seguro complementario o seguro completo',
          'Cobertura recomendada según perfil',
          'Rango de precio orientativo en España',
          'Cuándo compensa y cuándo no',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Seguro de Salud",
  description: "Test de 10 preguntas para saber si te conviene contratar un seguro de salud privado en España, qué cobertura necesitas y en qué situaciones tiene más sentido.",
  url: "https://meskeia.com/selector-seguro-salud/",
  category: 'FinanceApplication',
  features: [],
});
