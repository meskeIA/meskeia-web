import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Afinador de Instrumentos Online Gratis - Cromático | meskeIA',
  description: 'Afinador cromático online gratuito para guitarra, bajo, violín, ukelele y más. Detecta automáticamente la nota y muestra si está afinada con precisión.',
  keywords: 'afinador online, afinador guitarra, afinador cromático, afinador gratis, tuner online, afinar instrumento, afinador bajo, afinador violín, afinador ukelele',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Afinador de Instrumentos Online Gratis - Cromático',
    description: 'Afinador cromático online gratuito. Detecta automáticamente la nota con precisión.',
    url: 'https://meskeia.com/afinador-instrumentos/',
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
    title: 'Afinador de Instrumentos Online Gratis',
    description: 'Afinador cromático online gratuito. Detecta automáticamente la nota con precisión.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Afinador de Instrumentos",
  description: "Afinador cromático online gratuito para guitarra, bajo, violín, ukelele y más. Detecta automáticamente la nota y muestra si está afinada con precisión.",
  url: "https://meskeia.com/afinador-instrumentos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona un afinador cromático online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El afinador usa el micrófono del dispositivo para capturar el sonido del instrumento, aplica análisis de frecuencia (FFT) para detectar la nota fundamental y la compara con la frecuencia de referencia estándar (La = 440 Hz). Muestra la nota más cercana y un indicador que te dice si estás por encima (sharp) o por debajo (flat) del tono correcto, con precisión en centésimas de semitono.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué instrumentos sirve el afinador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al ser cromático, funciona con cualquier instrumento de afinación estándar: guitarra acústica y eléctrica, bajo, violín, viola, chelo, ukelele, mandolina, banjo, flauta, trompeta o cualquier instrumento que emita una nota clara y sostenida. No está limitado a instrumentos concretos como los afinadores de clip específicos para guitarra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo para usar el afinador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, funciona directamente en el navegador sin instalar apps ni plugins. Solo requiere un navegador moderno con soporte para la Web Audio API (Chrome, Firefox, Safari o Edge actualizados) y conceder permiso de acceso al micrófono cuando la herramienta lo solicite. Es completamente gratuito y no requiere registro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia de un afinador de clip o un pedal afinador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los afinadores de clip funcionan por vibración (no necesitan micrófono, ignoran el ruido ambiental) y son más precisos en entornos ruidosos. El afinador online usa el micrófono, por lo que funciona mejor en espacios tranquilos. La ventaja principal es que siempre lo tienes disponible sin llevar hardware extra, ideal para afinar en casa, en clase o de forma espontánea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo cambiar el La de referencia de 440 Hz a otro valor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunos músicos prefieren afinaciones alternativas como 432 Hz (usada en ciertos contextos) o 442-443 Hz (habitual en orquestas clásicas europeas). La mayoría de afinadores cromáticos online permiten ajustar la frecuencia de referencia. Si necesitas afinar en concierto o ensamblar con otros músicos, asegúrate de que todos uséis el mismo La de referencia para mantener la afinación conjunta.',
      },
    },
  ],
};
