import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sonómetro Online - Medidor de Decibelios Gratis | meskeIA',
  description: 'Mide el nivel de ruido en decibelios (dB) con tu micrófono. Sonómetro digital gratuito para documentar ruido, medir ambientes de trabajo o verificar niveles sonoros.',
  keywords: 'sonómetro, medidor decibelios, medir ruido, dB, nivel sonoro, contaminación acústica, ruido vecinos, medidor ruido online',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sonómetro Online - Medidor de Decibelios',
    description: 'Mide el nivel de ruido en decibelios con tu micrófono. Gratis y sin instalación.',
    url: 'https://meskeia.com/sonometro/',
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
    title: 'Sonómetro Online - Medidor de Decibelios',
    description: 'Mide el nivel de ruido en decibelios con tu micrófono. Gratis y sin instalación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Sonómetro / Decibelímetro",
  description: "Mide el nivel de ruido en decibelios (dB) con tu micrófono. Sonómetro digital gratuito para documentar ruido, medir ambientes de trabajo o verificar niveles sonoros.",
  url: "https://meskeia.com/sonometro/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué nivel de decibelios se considera ruido excesivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Organización Mundial de la Salud recomienda no superar 65 dB en entornos urbanos durante el día y 55 dB por la noche. En muchos países la normativa de ruidos de vecindad fija límites entre 30-40 dB para el interior de viviendas en horario nocturno. Lecturas sostenidas por encima de 85 dB pueden causar daño auditivo progresivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un sonómetro online con el micrófono del dispositivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El navegador solicita permiso para acceder al micrófono. Una vez concedido, la Web Audio API procesa la señal de audio en tiempo real y calcula el nivel de presión sonora en decibelios (dBFS y dB SPL estimado). Todo ocurre localmente; el audio no se graba ni se envía a ningún servidor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es tan preciso como un sonómetro profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Los micrófonos integrados de smartphones y portátiles no están calibrados para medición acústica certificada. Un sonómetro de clase 1 o 2 cumple normas IEC 61672 con precisión de ±1-2 dB. Este tipo de herramienta es útil para estimaciones orientativas y documentación informal, no para informes periciales o de cumplimiento normativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar el sonómetro para documentar ruido de vecinos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes tomar capturas o anotaciones de los niveles medidos como referencia personal. Para una reclamación formal ante el ayuntamiento o en un procedimiento judicial generalmente se requiere un informe de un técnico acreditado con un equipo calibrado. Aun así, las mediciones orientativas pueden servir de punto de partida para valorar si el problema justifica una queja formal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los niveles de dB de sonidos cotidianos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Susurro: ~30 dB. Conversación normal: ~60 dB. Tráfico urbano: ~70-80 dB. Aspiradora: ~75 dB. Concierto de música amplificada: ~100-110 dB. Despegue de avión a 100 m: ~120 dB. La escala es logarítmica: 10 dB más representa el doble de intensidad percibida.',
      },
    },
  ],
};
