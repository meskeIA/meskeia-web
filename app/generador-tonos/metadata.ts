import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Frecuencias Hz y Tonos Online (20-20.000 Hz)',
  description: 'Genera tonos puros y frecuencias de audio entre 20 Hz y 20.000 Hz, y mide con el micrófono cuántos hercios tiene un sonido. Ondas senoidal, cuadrada, triangular y sierra.',
  keywords: 'generador de tonos, generador de frecuencias, medidor de frecuencia, medidor de hz, test de audio, frecuencia Hz, onda senoidal, calibración altavoces, tono puro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-tonos/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Frecuencias Hz y Tonos Online (20-20.000 Hz)',
    description: 'Tonos puros entre 20 Hz y 20.000 Hz. Ondas senoidal, cuadrada, triangular y sierra. Test de oído orientativo, calibrar altavoces y medir los hercios de un sonido.',
    url: 'https://meskeia.com/generador-tonos/',
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
    title: 'Generador de Frecuencias Hz y Tonos Online',
    description: '20 Hz a 20.000 Hz. Test de oído orientativo, calibrar altavoces y medir los hercios de un sonido.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Tonos',
  // Prometía «ejercicios de tinnitus» que la página no tiene (hallazgo 3295)
  description: 'Generador online de tonos y frecuencias de audio entre 20 Hz y 20.000 Hz, con medidor de la frecuencia de un sonido por el micrófono. Útil para tests de audio orientativos, calibración de altavoces y auriculares y experimentos acústicos.',
  url: 'https://meskeia.com/generador-tonos/',
  category: 'UtilityApplication',
  features: [
    'Generación de tonos puros entre 20 Hz y 20.000 Hz',
    'Cuatro formas de onda: senoidal, cuadrada, triangular, sierra',
    'Control fino de frecuencia y volumen',
    'Medidor de frecuencia con el micrófono: hercios y nota musical del sonido que más destaca',
    'Medida de la respuesta en frecuencia con el micrófono, en tercios de octava (ISO 266)',
    'Comparación A/B de dos posiciones o dos altavoces en decibelios relativos',
    'Útil para tests de audio y calibración',
  ],
  keywords: ['generador tonos', 'frecuencias audio', 'medidor de frecuencia', 'test audio', 'calibración altavoces', 'tinnitus'],
});

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

/*
 * Las dos preguntas que están en las DOS bocas: la FAQ visible de la guía (page.tsx) y el FAQPage
 * de abajo, que leen buscadores e IAs. Salen de aquí las dos, para que no vuelvan a divergir
 * (hallazgo 3283: cada boca tenía su texto, y el FAQPage resumía, añadía y quitaba frases). Texto
 * plano: el JSON-LD no admite marcado.
 */
export const FAQ_MEDIR_HERCIOS: PreguntaFrecuente = {
  pregunta: '¿Cómo mido cuántos hercios tiene un sonido?',
  respuesta:
    'Con el medidor de esta misma página: pulsa «Medir la frecuencia», da permiso al micrófono y acerca el aparato al sonido. La app analiza el audio con una transformada de Fourier, busca el pico que más destaca y lo afina entre los puntos del análisis, así que con un tono limpio y sostenido la cifra queda a menos de un hercio. Además dice a qué nota musical corresponde y cuántos cents se desvía de ella. Ojo con las voces y los instrumentos: el pico más fuerte puede ser un armónico (el doble o el triple de la nota que oyes); para afinar, un afinador busca la fundamental. El audio se analiza en el propio navegador y no se envía a ningún sitio.',
};

export const FAQ_TIPOS_ONDA: PreguntaFrecuente = {
  pregunta: '¿Qué diferencia hay entre onda senoidal, cuadrada, triangular y sierra?',
  respuesta:
    'La onda senoidal es el tono más puro: un solo armónico, la frecuencia fundamental. Es la más suave y menos agresiva al oído. La onda cuadrada contiene la fundamental más todos los armónicos impares (3.º, 5.º, 7.º...) con amplitud 1/n. Suena más "metálica" y brillante; es la base de los sintetizadores clásicos (Moog). La onda sierra contiene todos los armónicos (pares e impares), dando el timbre más rico y "rasgado". La onda triangular tiene solo armónicos impares pero con caída mucho más rápida (1/n²), sonando más suave que la cuadrada pero más brillante que la senoidal. Para tests de oído y calibración conviene la senoidal.',
};

const preguntaLd = (f: PreguntaFrecuente) => ({
  '@type': 'Question',
  name: f.pregunta,
  acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve un generador de tonos online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de tonos produce frecuencias de audio puras, con la misma señal en los dos oídos, que puedes usar para varias pruebas: comprobar de forma orientativa hasta qué frecuencia escuchas, calibrar altavoces y auriculares con tonos sueltos o con un barrido, afinar un instrumento con una nota de referencia o enseñar en clase cómo suenan las ondas senoidal, cuadrada, triangular y sierra. También permite medir, con el micrófono del propio aparato, cómo cambia la respuesta de un altavoz entre dos posiciones.',
      },
    },
    preguntaLd(FAQ_MEDIR_HERCIOS),
    {
      '@type': 'Question',
      name: '¿Qué rango de frecuencias puede oír el ser humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El oído humano adulto percibe sonidos en el rango de aproximadamente 20 Hz a 20.000 Hz (20 kHz). Con la edad, la capacidad de escuchar frecuencias altas disminuye: la mayoría de adultos mayores de 40 años ya no perciben con claridad por encima de 15.000-16.000 Hz. Los niños y adolescentes pueden escuchar con más facilidad frecuencias cerca de los 20.000 Hz.',
      },
    },
    preguntaLd(FAQ_TIPOS_ONDA),
    {
      '@type': 'Question',
      name: '¿Cómo uso el generador de tonos para hacer un test de audición básico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la onda senoidal, ajusta el volumen a un nivel moderado con auriculares y barre las frecuencias desde 20 Hz hasta 20.000 Hz. Anota la frecuencia más alta que puedes escuchar claramente. Si no percibes tonos por encima de 8.000-10.000 Hz, puede indicar pérdida auditiva en agudos. Este test es orientativo y no sustituye a una audiometría clínica: para un diagnóstico, consulta a un audiólogo o a un médico otorrinolaringólogo (ORL).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo para usar el generador de tonos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El generador funciona completamente en el navegador mediante la Web Audio API, sin necesidad de descargar ni instalar ninguna aplicación. Es compatible con Chrome, Firefox, Safari y Edge en ordenadores y móviles. Solo necesitas unos auriculares o altavoces y tener el volumen activado en tu dispositivo.',
      },
    },
  ],
};
