import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Divisas | meskeIA',
  description: 'Convierte entre más de 30 divisas con tipos de cambio actualizados diariamente por el Banco Central Europeo. Orientativo, no apto para trading.',
  keywords: ['conversor divisas', 'tipo de cambio', 'euro', 'dólar', 'libra', 'yen', 'cambio moneda', 'divisas viaje'],
  openGraph: {
    title: 'Conversor de Divisas - meskeIA',
    description: 'Convierte entre más de 30 divisas. Tipos de cambio del BCE actualizados a diario.',
    url: 'https://meskeia.com/conversor-divisas/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Conversor de Divisas meskeIA',
  description: 'Convierte entre más de 30 divisas con tipos de cambio diarios del Banco Central Europeo',
  url: 'https://meskeia.com/conversor-divisas/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de cambio usa el conversor de divisas?',
      acceptedAnswer: { '@type': 'Answer', text: 'El conversor utiliza los tipos de cambio de referencia publicados diariamente por el Banco Central Europeo (BCE). Estos tipos son indicativos y se actualizan cada día laborable a las 16:00 CET. No reflejan comisiones bancarias ni el tipo que aplicará tu banco o cambio de divisa.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas divisas puedo convertir?',
      acceptedAnswer: { '@type': 'Answer', text: 'La herramienta permite convertir entre más de 30 divisas principales, incluyendo euro, dólar estadounidense, libra esterlina, yen japonés, franco suizo, dólar canadiense, peso mexicano, real brasileño y muchas más. Cubre las monedas más habituales para viajes e intercambios internacionales.' },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable el tipo de cambio para saber cuánto llevar de viaje?',
      acceptedAnswer: { '@type': 'Answer', text: 'El tipo del BCE es una referencia orientativa excelente para estimar cuánto dinero llevar de viaje o calcular presupuestos aproximados. Sin embargo, al cambiar dinero en efectivo o usar la tarjeta en el extranjero, tu banco o el cajero puede aplicar un diferencial de entre el 1 % y el 4 % respecto a este tipo de referencia, además de comisiones fijas.' },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un conversor de divisas frente a buscar en Google?',
      acceptedAnswer: { '@type': 'Answer', text: 'Un conversor dedicado permite convertir varios importes seguidos, comparar múltiples pares de divisas en una misma pantalla y entender mejor la relación entre monedas sin resultados patrocinados ni distracciones. También es útil offline o cuando se quiere calcular un presupuesto de viaje con varias divisas involucradas.' },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia se actualiza el tipo de cambio euro-dólar?',
      acceptedAnswer: { '@type': 'Answer', text: 'El Banco Central Europeo publica los tipos de referencia cada día laborable. El par EUR/USD es el más negociado del mundo y puede moverse entre un 0,5 % y un 1 % en una jornada normal, o más en días de alta volatilidad. Para operaciones financieras importantes conviene consultar un bróker o entidad bancaria con tipos en tiempo real.' },
    },
  ],
};
