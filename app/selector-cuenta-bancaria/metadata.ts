import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Cuenta Bancaria | ¿Qué Tipo de Cuenta Necesitas? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de cuenta bancaria se adapta mejor a tu situación: cuenta corriente estándar, cuenta nómina, cuenta joven, cuenta de ahorro remunerada o mantener la actual.',
  keywords: ['qué cuenta bancaria elegir', 'cuenta nómina o corriente', 'cuenta joven banco España', 'cuenta ahorro remunerada', 'cambiar de banco España', 'cuenta sin comisiones España', 'mejor tipo de cuenta bancaria', 'cuenta bancaria según perfil', 'banco digital o tradicional', 'cuenta bancaria para jóvenes España'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Selector de Cuenta Bancaria — ¿Qué Tipo de Cuenta Necesitas?',
    description: 'Descubre qué tipo de cuenta bancaria se adapta mejor a tu situación en 10 preguntas.',
    url: 'https://meskeia.com/selector-cuenta-bancaria/',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Selector de Cuenta Bancaria — ¿Qué Tipo de Cuenta Necesitas?',
    description: 'Test de 10 preguntas para saber qué tipo de cuenta bancaria se adapta mejor a tu perfil.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Cuenta Bancaria",
  description: "Test de 10 preguntas para saber qué tipo de cuenta bancaria se adapta mejor a tu situación: cuenta corriente estándar, cuenta nómina, cuenta joven, cuenta de ahorro remunerada o mantener la actual.",
  url: "https://meskeia.com/selector-cuenta-bancaria/",
  category: 'FinanceApplication',
  features: [],
});
