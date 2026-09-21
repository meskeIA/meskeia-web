import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const DESCRIPCION =
  'Afinador cromático online gratuito para guitarra, bajo, violín, viola, ukelele, bandurria, laúd, vihuela, trompeta, clarinete, saxo, flauta y piano. Con los instrumentos transpositores te dice además qué nota estás leyendo tú.';

export const metadata: Metadata = {
  title: 'Afinador Cromático Online Gratis: Cuerda y Viento | meskeIA',
  description: DESCRIPCION,
  keywords:
    'afinador online, afinador cromático, afinador gratis, afinador de instrumentos, afinador guitarra, afinador bajo, afinador violín, afinador viola, afinador ukelele, afinador bandurria, afinador laúd, afinador vihuela, afinador trompeta, afinador clarinete, afinador saxo, afinador flauta, afinador piano, instrumentos transpositores, tuner online, afinar instrumento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Afinador Cromático Online Gratis: Cuerda y Viento',
    description: 'Afina guitarra, bandurria, trompeta, clarinete o saxo. Con los transpositores, también la nota que lees tú.',
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
    title: 'Afinador Cromático Online Gratis: Cuerda y Viento',
    description: 'Afina guitarra, bandurria, trompeta, clarinete o saxo. Con los transpositores, también la nota que lees tú.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Afinador de Instrumentos",
  description: DESCRIPCION,
  url: "https://meskeia.com/afinador-instrumentos/",
  category: 'EducationalApplication',
  features: [
    'Afinador cromático por micrófono con desviación en cents',
    'Afinaciones al aire de guitarra, bajo, violín, viola, ukelele, bandurria, laúd español y vihuela mexicana',
    'Instrumentos de viento: trompeta, clarinete, saxo alto, saxo tenor, flauta y trombón',
    'Traducción de la nota que suena a la nota escrita en instrumentos transpositores',
    'La de referencia ajustable de 420 a 460 Hz (440 estándar, 442 orquesta, 432)',
    'Las frecuencias de cada cuerda se recalculan con el La de referencia elegido',
    'Funciona en el navegador, sin instalar nada y sin enviar el audio a ningún servidor',
  ],
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
        text: 'El afinador captura el sonido con el micrófono del dispositivo y busca el periodo que se repite en la onda (autocorrelación en el dominio del tiempo) para deducir la frecuencia fundamental. Después la compara con la nota temperada más cercana y muestra la desviación en cents, que son centésimas de semitono: por debajo de 5 cents se considera afinado. El La de referencia es ajustable entre 420 y 460 Hz, así que sirve tanto para los 440 Hz estándar como para los 442 Hz habituales en orquesta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué instrumentos sirve el afinador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trae las afinaciones al aire de guitarra, bajo de 4 cuerdas, violín, viola, ukelele, bandurria, laúd español y vihuela mexicana, y las notas de afinación de trompeta, clarinete, saxo alto, saxo tenor, flauta travesera, trombón y piano. Al ser cromático funciona además con cualquier instrumento que emita una nota clara y sostenida, aunque no aparezca en la lista: chelo, mandolina, banjo, oboe o acordeón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el afinador marca si bemol si estoy tocando un do con la trompeta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la trompeta y el clarinete corrientes están en si bemol: son instrumentos transpositores y suenan un tono por debajo de lo que está escrito en su partitura. Tu do escrito hace sonar un si bemol real de 233,1 Hz, y el afinador nombra siempre lo que suena. El saxo alto está en mi bemol y suena una sexta mayor por debajo; el saxo tenor, una novena mayor. Al seleccionar tu instrumento, la herramienta añade debajo la nota que tú estás leyendo, para que no tengas que hacer la cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia de un afinador de clip o un pedal afinador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los afinadores de clip funcionan por vibración, así que ignoran el ruido ambiental y son más precisos en un escenario o en un aula llena. Este usa el micrófono, por lo que rinde mejor en un sitio tranquilo. A cambio siempre lo tienes disponible sin llevar nada encima, y añade dos cosas que un clip no suele dar: la traducción para instrumentos transpositores y las afinaciones completas de instrumentos de púa como la bandurria o el laúd.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sirve para afinar un piano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sirve para comprobar cuánto se ha desviado una tecla concreta, expresado en cents, pero no para afinar el instrumento. Un piano tiene más de 200 cuerdas a una tensión conjunta de varias toneladas, se afina con llave sobre las clavijas y requiere además templar las octavas por batidos: es trabajo de un técnico afinador. Lo mismo vale para el resto de instrumentos: la herramienta mide, la decisión de tocar la tensión es de quien toca.',
      },
    },
  ],
};
