import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tiempo de fermentación según la temperatura | meskeIA',
  description:
    'Tu masa fermenta más rápido en verano y más lento en invierno. Calcula cuánto tarda el levado a la temperatura real de tu masa a partir del tiempo de la receta. Para pan y masas. Gratis y en español.',
  keywords:
    'tiempo fermentacion masa, fermentacion pan temperatura, cuanto tarda levar masa, levado segun temperatura, masa madre tiempo fermentacion, retardo en frio nevera, fermentacion verano invierno',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tiempo de fermentación según la temperatura',
    description:
      'Calcula cuánto tarda en fermentar tu masa según su temperatura real, a partir del tiempo de la receta.',
    url: 'https://meskeia.com/fermentacion-temperatura',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiempo de fermentación según la temperatura',
    description:
      'La temperatura manda en el levado: calcula el tiempo real de fermentación de tu masa.',
  },
  other: {
    'application-name': 'Fermentación según temperatura meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/fermentacion-temperatura/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tiempo de fermentación según la temperatura',
  description:
    'Calcula cuánto tarda en fermentar una masa de pan a la temperatura real a la que está, partiendo del tiempo y la temperatura de referencia de la receta. Aplica la regla de que la actividad de la levadura se duplica aproximadamente cada 10 °C.',
  url: 'https://meskeia.com/fermentacion-temperatura/',
  features: [
    'Ajusta el tiempo de levado a la temperatura de tu masa',
    'Indica si fermenta más rápido o más lento que la receta',
    'Tabla de referencia de temperaturas de fermentación',
    'Útil para pan, pizza y masa madre',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué mi masa fermenta más rápido en verano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la levadura es más activa cuanto más calor hace. Como regla práctica, su velocidad se duplica por cada 10 °C de aumento, así que el tiempo de fermentación se reduce a la mitad. Una masa que tarda 3 horas a 20 °C puede estar lista en hora y media a 30 °C, por eso en verano hay que vigilarla más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la temperatura ideal para fermentar pan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para la mayoría de masas, entre 24 y 27 °C es el punto dulce: la levadura trabaja ágil sin estresarse. Por debajo de 18 °C el levado es lento pero da más sabor, y por encima de 32 °C la levadura sufre y pueden aparecer sabores ácidos o avinagrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el retardo en frío de la masa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es meter la masa en la nevera (unos 4 °C) para que fermente muy despacio durante varias horas o días. La fermentación lenta desarrolla más aroma y sabor y hace el pan más digestivo, además de darte flexibilidad para hornear cuando te venga bien.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si la masa ya ha fermentado lo suficiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo es solo una guía: lo que manda es el volumen y el tacto. La masa debe haber crecido visiblemente (casi al doble en el primer levado) y, al presionarla con un dedo, recuperar la forma despacio. Por eso conviene fiarse de la masa más que del reloj, sobre todo si la temperatura cambia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Esta regla vale para la masa madre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, como aproximación. La masa madre también acelera con el calor y se ralentiza con el frío siguiendo la misma lógica, aunque sus tiempos base son más largos que con levadura comercial y dependen también de la fuerza del fermento. Úsala como orientación y ajusta según veas crecer la masa.',
      },
    },
  ],
};
