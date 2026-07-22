import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'DAF: Retroalimentación Auditiva Retardada para la Fluidez del Habla | meskeIA',
  description: 'Herramienta gratuita de retroalimentación auditiva retardada (DAF): oye tu propia voz con un pequeño retardo ajustable a través de auriculares, una técnica de apoyo a la fluidez del habla usada en tartamudez. Funciona en el navegador, el audio nunca sale de tu dispositivo. Apoyo, no tratamiento: consulta con un logopeda.',
  keywords: 'daf, retroalimentacion auditiva retardada, retardo auditivo, fluidez del habla, app tartamudez, tartamudeo, disfemia, logopedia, fonoaudiologia, hablar con eco, retardo voz auriculares',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'DAF: Retroalimentación Auditiva Retardada | meskeIA',
    description: 'Oye tu voz con un retardo ajustable por auriculares: técnica DAF de apoyo a la fluidez del habla. Gratis, en el navegador y con el audio 100% en tu dispositivo.',
    url: 'https://meskeia.com/daf-retroalimentacion-auditiva/',
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
    title: 'DAF: Retroalimentación Auditiva Retardada | meskeIA',
    description: 'Técnica DAF de apoyo a la fluidez del habla: tu voz con un retardo ajustable por auriculares. Privacidad total: el audio nunca sale del dispositivo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "DAF - Retroalimentación Auditiva Retardada para la Fluidez del Habla",
  description: "Herramienta de retroalimentación auditiva retardada (Delayed Auditory Feedback) que reproduce la propia voz del usuario con un pequeño retardo ajustable a través de auriculares. Es una técnica de apoyo a la fluidez del habla empleada en la tartamudez. Funciona íntegramente en el navegador mediante la Web Audio API, sin enviar ni grabar el audio. Es una herramienta de apoyo, no un tratamiento médico.",
  url: 'https://meskeia.com/daf-retroalimentacion-auditiva/',
  category: 'EducationalApplication',
  features: [
    'Retardo auditivo ajustable de 40 a 250 milisegundos con control deslizante',
    'Procesamiento en tiempo real con la Web Audio API del navegador',
    'Medidor visual del nivel de entrada del micrófono',
    'Sonido de enmascaramiento opcional como técnica alternativa de habla alterada',
    'Textos de práctica para leer en voz alta mientras se usa la técnica',
    'Aviso de uso obligatorio de auriculares para evitar acoplamiento acústico',
    'Audio procesado 100% en el dispositivo: la voz nunca se graba ni se envía a servidores',
  ],
  keywords: ['daf', 'retroalimentacion auditiva retardada', 'fluidez del habla', 'tartamudez', 'logopedia'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la retroalimentación auditiva retardada (DAF)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La DAF (Delayed Auditory Feedback, retroalimentación auditiva retardada) consiste en oír la propia voz con un pequeño retardo, normalmente de entre 50 y 200 milisegundos, a través de unos auriculares mientras se habla. Ese desfase altera el circuito habitual de control del habla y, en muchas personas que tartamudean, se asocia a un habla más fluida y pausada mientras se aplica. Es una de las técnicas de "habla alterada" más conocidas y se usa como apoyo, junto al trabajo con un logopeda o fonoaudiólogo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito auriculares para usar la herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los auriculares son imprescindibles. La técnica requiere que solo tú oigas tu voz retardada; además, si el sonido saliera por el altavoz, el micrófono lo volvería a captar y se produciría un acoplamiento acústico (efecto Larsen), es decir, un pitido o eco creciente muy molesto. Con auriculares, el micrófono no recoge el sonido de vuelta y la experiencia es limpia. Por eso la herramienta pide confirmar que llevas auriculares antes de empezar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La DAF cura la tartamudez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La DAF no es un tratamiento curativo ni un sustituto de la terapia logopédica. La evidencia científica sobre su eficacia es desigual: a algunas personas les ayuda a hablar con más fluidez mientras la usan, pero el efecto puede reducirse con el tiempo por adaptación y no todas las personas responden igual. Debe entenderse como una herramienta de apoyo y exploración personal. Para abordar la tartamudez de forma seria conviene acudir a un logopeda o fonoaudiólogo, que puede valorar si integrar la DAF en un plan más amplio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué valor de retardo debo usar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No hay un valor único: la respuesta es muy individual. Los estudios y los dispositivos comerciales suelen trabajar en torno a 50-200 milisegundos, y muchas personas encuentran su punto óptimo cerca de los 75-150 ms. Lo recomendable es empezar por un valor intermedio (unos 120 ms), leer un texto en voz alta y ajustar el deslizador arriba y abajo hasta notar cuál te resulta más cómodo y natural. Un retardo demasiado corto apenas se percibe; uno demasiado largo puede entorpecer el habla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se graba o se envía mi voz a algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Todo el procesamiento de audio ocurre en tu navegador mediante la Web Audio API: la voz entra por el micrófono, se retarda y se devuelve a tus auriculares en tiempo real, sin grabarse ni transmitirse a ningún servidor. Cuando detienes la sesión o cierras la pestaña, no queda ningún registro. El permiso de micrófono que solicita el navegador es únicamente para procesar el audio en local y puedes revocarlo cuando quieras.',
      },
    },
  ],
};
