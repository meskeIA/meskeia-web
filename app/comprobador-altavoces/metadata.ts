import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// 🌎 Término-núcleo con variantes a ambos lados del Atlántico:
// altavoces → bocinas (MX) / parlantes (AR, CL) · auriculares → audífonos (LATAM).
// Van en title, H1 y keywords de forma aditiva, nunca sustituyendo la variante de España.

export const metadata: Metadata = {
  title: 'Test de Altavoces, Bocinas y Auriculares: Canal L/R, Fase y Graves - meskeIA',
  description:
    'Comprueba tus altavoces, bocinas, parlantes o auriculares: canal izquierdo y derecho por separado, prueba de fase, barrido de 20 Hz a 20 kHz y tonos de graves. Detecta un canal mudo o los cables cruzados.',
  keywords:
    'test de altavoces, probar altavoces online, test auriculares izquierda derecha, comprobar bocinas, test parlantes, probar audifonos, test de fase altavoces, barrido de frecuencias, tonos de prueba subwoofer, canal izquierdo derecho, cables cruzados altavoces, test de sonido estereo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Altavoces, Bocinas y Auriculares Online',
    description:
      'Canal izquierdo y derecho por separado, prueba de fase, barrido de 20 Hz a 20 kHz y tonos de graves. Diagnostica el equipo, no el oído.',
    url: 'https://meskeia.com/comprobador-altavoces',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Altavoces, Bocinas y Auriculares Online',
    description:
      'Comprueba canales, fase, graves y respuesta en frecuencia de tus altavoces o auriculares desde el navegador.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Comprobador de Altavoces meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Comprobador de Altavoces y Auriculares',
  description:
    'Banco de pruebas de audio en el navegador para diagnosticar altavoces, bocinas, parlantes y auriculares: aísla el canal izquierdo y el derecho para detectar un canal mudo o cables cruzados, compara la señal en fase y en contrafase, recorre el espectro de 20 Hz a 20 kHz y emite tonos de graves por tercios de octava. Mide el equipo de sonido, no la audición de la persona.',
  url: 'https://meskeia.com/comprobador-altavoces/',
  category: 'UtilityApplication',
  features: [
    'Canal izquierdo y derecho aislados con diagnóstico de canal mudo o cables cruzados',
    'Prueba de fase: misma señal en fase y en contrafase para detectar un altavoz mal conectado',
    'Barrido continuo de 20 Hz a 20 kHz con la frecuencia en pantalla',
    'Tonos de graves por tercios de octava (20 a 100 Hz) para subwoofer',
    'Bandas de octava de 63 Hz a 16 kHz una por una',
    'Barrido estéreo continuo de izquierda a derecha',
    'Señal seleccionable: tono puro o ruido rosa',
    'Funciona 100% en el navegador con Web Audio API, sin registro ni instalación',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si mis auriculares tienen los canales cambiados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reproduce una señal solo por el canal izquierdo y comprueba por qué lado la oyes. Si suena por el oído derecho, los canales están intercambiados: puede ser por llevar los auriculares al revés, por un cable soldado al revés o por un ajuste de balance del sistema. Repite la prueba con el canal derecho para confirmarlo: si ambas pruebas salen cruzadas, el problema es del equipo; si solo falla una, lo más probable es un canal averiado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la prueba de fase y qué debo escuchar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Consiste en emitir la misma señal por los dos canales, primero igual en ambos (en fase) y después con uno de ellos invertido (en contrafase). En fase el sonido se percibe compacto y centrado entre los dos altavoces; en contrafase se vuelve difuso, sin centro definido, y los graves pierden cuerpo porque las ondas se cancelan. Si las dos versiones te suenan casi idénticas, es muy probable que uno de los altavoces tenga los cables de polaridad invertidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hasta qué frecuencia deberían llegar unos altavoces normales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del tamaño del altavoz. Un altavoz de portátil o de móvil rara vez produce nada audible por debajo de 150-200 Hz, y por eso los tonos de 20 a 60 Hz suelen no oírse o convertirse en un chasquido. Unos monitores de escritorio de 4-5 pulgadas suelen bajar hasta 60-80 Hz, y un subwoofer doméstico llega a 30-40 Hz. En agudos, la mayoría de equipos reproducen hasta 18-20 kHz aunque la audición adulta rara vez pasa de 15-17 kHz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede este tipo de prueba dañar los altavoces?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, si se usa a volumen alto. Los tonos graves sostenidos y los barridos exigen mucho más a un altavoz pequeño que la música, porque concentran toda la energía en una frecuencia y no dan tregua a la bobina. La regla es empezar siempre con el volumen bajo y subirlo poco a poco: si aparece un zumbido, un chasquido o una vibración áspera, hay que bajar de inmediato, porque eso ya es distorsión y no respuesta del altavoz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sirve para saber si oigo bien?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Lo que se mide aquí es el equipo de sonido, no la audición. Un navegador, una tarjeta de sonido doméstica y unos auriculares sin calibrar no permiten saber a qué volumen real llega cada frecuencia al oído, así que no puede deducirse nada sobre la capacidad auditiva de una persona. Para eso existe la audiometría, que se hace con equipos calibrados y en cabina. Si notas que oyes peor por un oído, la prueba que corresponde es la de un profesional sanitario.',
      },
    },
  ],
};
