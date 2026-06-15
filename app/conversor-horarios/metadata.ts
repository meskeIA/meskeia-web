import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Conversor de Horarios Mundial - Zonas Horarias | meskeIA',
  description: 'Convierte horarios entre diferentes zonas horarias del mundo. Compara la hora actual en múltiples ciudades. Herramienta gratuita y sin registro.',
  keywords: 'conversor horarios, zonas horarias, hora mundial, time zone converter, diferencia horaria, hora ciudades, GMT, UTC, reloj mundial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Horarios Mundial',
    description: 'Convierte horarios entre zonas horarias. Compara la hora en diferentes ciudades.',
    url: 'https://meskeia.com/conversor-horarios/',
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
    title: 'Conversor de Horarios | meskeIA',
    description: 'Convierte horarios entre zonas horarias del mundo',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Conversor de Horarios meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Horarios Mundial - Zonas Horarias",
  description: "Convierte horarios entre diferentes zonas horarias del mundo. Compara la hora actual en múltiples ciudades. Herramienta gratuita y sin registro.",
  url: 'https://meskeia.com/conversor-horarios/',
  category: 'UtilityApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo convierto un horario de un país a otro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la zona horaria de origen y escribe la hora que quieres convertir. A continuación elige la zona horaria de destino y la herramienta mostrará la hora equivalente al instante. Por ejemplo, para saber qué hora es en Ciudad de México cuando en Madrid son las 18:00, selecciona Europe/Madrid como origen y America/Mexico_City como destino.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre UTC, GMT y una zona horaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'UTC (Tiempo Universal Coordinado) es el estándar de referencia global y no cambia con el horario de verano. GMT (Greenwich Mean Time) es equivalente a UTC+0 y se usa como referencia en el Reino Unido. Las zonas horarias son desplazamientos respecto a UTC: por ejemplo, Madrid en verano es UTC+2 (CEST) y en invierno UTC+1 (CET).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué dos ciudades del mismo país pueden tener diferente hora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunos países de gran extensión geográfica tienen varias zonas horarias. Estados Unidos, por ejemplo, tiene cuatro zonas continentales (Eastern, Central, Mountain y Pacific). En Brasil, la diferencia entre el este y el extremo oeste puede ser de hasta cuatro horas. El conversor de horarios muestra la zona exacta de cada ciudad para evitar confusiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo cambia el horario de verano y cómo afecta a las reuniones internacionales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Europa cambia al horario de verano el último domingo de marzo y vuelve al de invierno el último domingo de octubre. En Estados Unidos el cambio ocurre el segundo domingo de marzo y el primer domingo de noviembre. Durante las semanas de transición, la diferencia entre zonas puede cambiar en una hora, lo que puede desplazar reuniones internacionales. El conversor siempre usa la hora vigente en el momento de la consulta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un conversor de zonas horarias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es imprescindible para coordinar reuniones virtuales entre equipos de distintos países, programar llamadas con familiares en el extranjero, seguir eventos en vivo como lanzamientos de productos o deportes, y planificar vuelos con escala. Evita errores de cálculo manual que pueden provocar llegar tarde o perderse un evento importante.',
      },
    },
  ],
};
