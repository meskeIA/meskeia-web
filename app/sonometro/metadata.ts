import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sonómetro Online - Medidor de Decibelios Gratis | meskeIA',
  description: 'Mide el nivel de ruido en decibelios (dB) con tu micrófono. Sonómetro y decibelímetro online gratuito para documentar ruido, medir ambientes de trabajo o verificar niveles sonoros.',
  keywords: 'sonómetro, decibelímetro, medidor decibelios, medidor de decibeles, medir decibeles, medir ruido, dB, nivel sonoro, contaminación acústica, ruido vecinos, medidor ruido online',
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
  description: "Mide el nivel de ruido en decibelios (dB) con tu micrófono. Sonómetro y decibelímetro online gratuito para documentar ruido, medir ambientes de trabajo o verificar niveles sonoros.",
  url: "https://meskeia.com/sonometro/",
  category: 'UtilityApplication',
  features: [
    'Medición del nivel sonoro en tiempo real con el micrófono del dispositivo',
    'LAeq (nivel continuo equivalente) calculado como promedio energético de la sesión',
    'Valores mínimo, máximo y duración acumulada de la medición',
    'Calibración manual ajustable (60-120 dB) que se recuerda en el navegador',
    'Escala visual con aguja y código de color por franja de ruido',
    'Tabla de referencia de niveles con ejemplos cotidianos',
    'Procesamiento local: el audio no se graba ni se envía a ningún servidor',
  ],
});

/**
 * Respuestas que salen en la FAQ visible Y en el FAQPage: una sola constante que importan las dos
 * bocas (hallazgo 3547), como en app/simulador-gastos-compraventa-garaje. Escritas dos veces,
 * divergían: la del decibelímetro con otra redacción, y la de la precisión callaba en el FAQPage
 * el margen de ±3 a ±6 dB del móvil que da la página.
 */
export const RESPUESTA_DECIBELIMETRO =
  'Sí: es el mismo instrumento con dos nombres. «Decibelímetro» (o medidor de decibeles) es la forma habitual en gran parte de América y «sonómetro» la más extendida en España. Si buscas un equipo profesional lo encontrarás casi siempre como «sonómetro de clase 1» o «clase 2», porque así lo denomina la norma internacional IEC 61672 que fija su precisión.';

export const RESPUESTA_PRECISION =
  'Un sonómetro de móvil tiene un margen de error de ±3 a ±6 dB respecto a un aparato de clase 1 o 2 homologado. Es útil para tener una orientación, detectar problemas evidentes y documentar tendencias, pero no tiene validez legal ni metrológica para procedimientos oficiales.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué nivel de decibelios se considera ruido excesivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgo 1705: atribuía a la OMS 65 dB de día, que no es suyo. Cifras de la OMS: Guidelines
        // for Community Noise (1999) y Night Noise Guidelines for Europe (2009), las mismas de la página.
        text: 'Como referencia de salud, la Organización Mundial de la Salud sitúa en 50 dB la molestia moderada y en 55 dB la molestia seria en exteriores durante el día (Guidelines for Community Noise, 1999), y propone no superar 40 dB en el exterior de la vivienda por la noche (Night Noise Guidelines, 2009). Los límites legales los fija cada país y municipio: en España, el objetivo nocturno en el interior de una vivienda es de 30 dB en dormitorios y 35 dB en estancias. Lecturas sostenidas por encima de 85 dB pueden causar daño auditivo progresivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un sonómetro online con el micrófono del dispositivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgo 3548: decía «(dBFS y dB SPL estimado)». La app no enseña dBFS en ningún sitio, y lo
        // que enseña es un nivel PONDERADO A —su lectura, su subtítulo y sus estadísticas dicen dB(A)—.
        text: 'El navegador solicita permiso para acceder al micrófono. Una vez concedido, la Web Audio API procesa la señal de audio en tiempo real y calcula el nivel sonoro en decibelios con ponderación A, dB(A), la que usan las normativas de ruido. Como el micrófono no trae una sensibilidad conocida, el valor absoluto depende de un desplazamiento de calibración que se puede ajustar. Todo ocurre localmente; el audio no se graba ni se envía a ningún servidor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es tan preciso como un sonómetro profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_PRECISION,
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar el sonómetro para documentar ruido de vecinos?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgo 3549: mandaba «tomar capturas», cuando la app guarda cada medición en un registro
        // con fecha y hora que se descarga en CSV o se imprime como parte.
        text: 'Sí, como documentación orientativa. Cada vez que pulsas «Detener y guardar», la medición queda en el registro de la página con su fecha, su hora, su duración y su LAeq; puedes anotar dónde mediste, descargar el registro en CSV o imprimirlo como parte. Lo que sostiene una queja es un patrón que se repite en distintos días y horarios. Para una reclamación formal ante el ayuntamiento o en un procedimiento judicial generalmente se requiere además un informe de un técnico acreditado con un equipo calibrado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo un decibelímetro que un sonómetro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_DECIBELIMETRO,
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
