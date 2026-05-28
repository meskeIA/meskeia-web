import { Metadata } from 'next';

const title = 'Diario Emocional Visual — Registra cómo te sientes cada día | meskeIA';
const description = 'Herramienta de autoconocimiento: registra tu estado de ánimo diario con emojis, añade notas y descubre patrones emocionales a lo largo del tiempo. Privado y sin registro.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'diario emocional, registro emociones, estado de animo diario, autoconocimiento emocional, patrones emocionales, como me siento hoy, diario bienestar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diario Emocional Visual | meskeIA',
    description,
    url: 'https://meskeia.com/diario-emocional/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diario Emocional Visual | meskeIA',
    description: 'Registra tu estado de ánimo diario y descubre patrones emocionales',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Diario Emocional Visual',
  description,
  url: 'https://meskeia.com/diario-emocional/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve llevar un diario emocional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un diario emocional permite identificar patrones en el estado de ánimo a lo largo del tiempo: qué situaciones generan bienestar, qué factores disparan el estrés o la tristeza, y cómo evolucionan las emociones en diferentes períodos. Con registro regular, muchas personas descubren ciclos recurrentes (semanales, mensuales) que no percibían conscientemente. Es una herramienta de autoconocimiento, no un sustituto de atención psicológica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el registro de emociones con emojis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada día se elige un emoji que represente el estado de ánimo predominante (desde muy bien hasta muy mal, con opciones intermedias como cansado, ansioso o tranquilo). Opcionalmente se puede añadir una nota breve de texto libre. Los registros se almacenan localmente en el navegador, sin enviarse a ningún servidor, y se visualizan en un calendario de color para ver la evolución de un vistazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Mis datos emocionales son privados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Todos los registros se guardan únicamente en el almacenamiento local del navegador (localStorage) del dispositivo que utilices. No se envían a ningún servidor externo, no requieren crear una cuenta y no se comparten con terceros. Si borras los datos del navegador o cambias de dispositivo, los registros se perderán, ya que no hay sincronización en la nube.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia debo registrar mis emociones para que sea útil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El registro diario es lo ideal para detectar patrones fiables, aunque con tres o cuatro registros por semana ya se pueden ver tendencias. La constancia importa más que la frecuencia: un registro honesto cada dos días durante un mes es más valioso que registros diarios durante una semana. Se recomienda hacerlo siempre a la misma hora (por ejemplo, por la noche) para mantener coherencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un diario emocional de una app de mindfulness o meditación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las apps de mindfulness y meditación ofrecen ejercicios activos de regulación emocional (respiración, escaneo corporal, meditaciones guiadas). Un diario emocional es pasivo y retrospectivo: registra cómo te has sentido en lugar de enseñarte a cambiar ese estado. Ambos enfoques son complementarios; el diario aporta el autoconocimiento y los datos necesarios para saber cuándo y por qué se necesitan las técnicas de regulación.',
      },
    },
  ],
};
