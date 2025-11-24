import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Divisas - Tipos de Cambio en Tiempo Real | meskeIA',
  description: '¿Cuánto vale el euro en dólares hoy? Conversor de divisas con tipos de cambio oficiales del BCE en tiempo real. Convierte entre 33 monedas internacionales.',
  keywords: [
    'conversor divisas',
    'cambio divisas',
    'euro dolar',
    'EUR USD',
    'tipos cambio',
    'convertidor moneda',
    'calculadora divisas',
    'exchange rate',
    'forex',
    'libra esterlina',
    'yen japones',
    'banco central europeo',
    'cambio euro dolar',
    'cotizacion divisas',
    'meskeIA'
  ],
  authors: [{ name: 'meskeIA', url: 'https://meskeia.com' }],
  openGraph: {
    type: 'website',
    title: 'Conversor de Divisas - Tipos de Cambio en Tiempo Real',
    description: 'Convierte entre 33 divisas con datos oficiales del Banco Central Europeo. EUR, USD, GBP, JPY y más.',
    url: 'https://meskeia.com/beta/conversor-divisas',
    siteName: 'meskeIA',
    locale: 'es_ES'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de Divisas - meskeIA',
    description: 'Tipos de cambio actualizados del BCE. Convierte entre 33 divisas internacionales.'
  },
  alternates: {
    canonical: 'https://meskeia.com/beta/conversor-divisas'
  },
  robots: {
    index: true,
    follow: true
  }
};
