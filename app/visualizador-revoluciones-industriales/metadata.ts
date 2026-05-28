import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Revoluciones Industriales | Cronología Visual | meskeIA',
  description: 'Visualiza las revoluciones industriales: de la máquina de vapor a la IA y la Industria 4.0. Cronología interactiva de fases, inventos y transformaciones económicas.',
  keywords: ['revoluciones industriales', 'industria 4.0', 'máquina de vapor', 'fordismo', 'automatización', 'IA industrial', 'cronología economía'],
  openGraph: {
    title: 'Revoluciones Industriales | Cronología Visual | meskeIA',
    description: 'Visualiza las revoluciones industriales: de la máquina de vapor a la IA y la Industria 4.0.',
    url: 'https://meskeia.com/visualizador-revoluciones-industriales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-revoluciones-industriales/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Revoluciones Industriales — Cronología Visual',
  description: 'Cronología interactiva de las revoluciones industriales: de la manufactura preindustrial a la IA y la Industria 4.0.',
  url: 'https://meskeia.com/visualizador-revoluciones-industriales/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  inLanguage: 'es',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas revoluciones industriales ha habido y cuáles son?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se identifican cuatro revoluciones industriales. La primera (1760-1840) introdujo la máquina de vapor y la producción textil mecanizada en Reino Unido. La segunda (1870-1914) trajo la electricidad, el acero y la producción en masa. La tercera (desde 1970) impulsó la electrónica y la automatización. La cuarta o Industria 4.0 (desde 2010) integra inteligencia artificial, robótica avanzada e Internet de las Cosas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué fue la Industria 4.0 y en qué se diferencia de las anteriores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Industria 4.0 es la cuarta revolución industrial, caracterizada por la convergencia del mundo físico y digital: fábricas inteligentes, inteligencia artificial, gemelos digitales e Internet de las Cosas. A diferencia de las anteriores, no se basa en una sola tecnología motriz sino en la interconexión de múltiples tecnologías que permiten sistemas de producción autónomos y adaptativos en tiempo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál fue el impacto social de la primera revolución industrial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La primera revolución industrial transformó radicalmente la estructura social: aceleró la urbanización masiva, creó la clase obrera industrial y deterioró las condiciones laborales con jornadas de 14-16 horas, incluyendo trabajo infantil. Al mismo tiempo, impulsó el surgimiento del movimiento sindical y sentó las bases del capitalismo moderno. La productividad agrícola se disparó gracias a maquinaria como la trilladora mecánica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué inventos clave marcaron la segunda revolución industrial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La segunda revolución industrial (1870-1914) estuvo marcada por el motor de combustión interna, el teléfono (Bell, 1876), la bombilla eléctrica (Edison, 1879) y la cadena de montaje de Ford (1913). El acero Bessemer permitió construir rascacielos y puentes metálicos. Estos avances convirtieron a Alemania y Estados Unidos en potencias industriales que superaron a Reino Unido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la inteligencia artificial a la revolución industrial actual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inteligencia artificial es uno de los pilares de la Industria 4.0: permite automatizar tareas cognitivas, optimizar cadenas de suministro en tiempo real y personalizar la producción a escala. A diferencia de la automatización mecánica de la tercera revolución, la IA puede adaptarse y aprender, lo que plantea debates sobre el futuro del trabajo cualificado. Estimaciones del Foro Económico Mundial sugieren que la IA desplazará ciertos empleos pero también creará nuevas categorías profesionales.',
      },
    },
  ],
};
