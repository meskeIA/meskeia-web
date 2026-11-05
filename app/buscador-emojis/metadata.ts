import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { AVISOS, INTENCIONES } from './intenciones';

// La demanda medida (Bing, 6 meses a 05/11/2026) es de COPIAR: «emojis copiar y pegar» 7.048
// impresiones, «emoticonos copiar y pegar» 1.541, «emoji corazón/risa/llorando» ~5.000 entre
// todas. Lo que la app hace distinto —buscar por lo que se quiere decir— no tiene keyword
// medible (la sonda solo admite una palabra), así que el título nombra la búsqueda con demanda y
// la descripción cuenta la diferencia. «Emoticonos» (España) y «emoticones» (buena parte de
// Latinoamérica) van los dos en keywords.
export const metadata: Metadata = {
  title: 'Emojis para Copiar y Pegar según lo que Quieres Decir | meskeIA',
  description:
    'Escribe lo que quieres expresar («me alegro», «lo siento», «ánimo») y copia el emoji adecuado. Con los emojis que pueden leerse al revés y molestar a quien lo recibe.',
  keywords:
    'emojis copiar y pegar, qué emoji usar, buscador de emojis, emoticonos copiar y pegar, emoticones, significado de los emojis, emoji para pedir perdón, emoji para dar el pésame, emoji para felicitar, emoji de alegría, emojis que se malinterpretan, emojis whatsapp',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Qué emoji pongo? Emojis según lo que quieres decir',
    description:
      'Escribe «me alegro», «lo siento» o «ánimo» y copia el emoji adecuado, con los que pueden leerse al revés.',
    url: 'https://meskeia.com/buscador-emojis/',
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
    title: '¿Qué emoji pongo?',
    description: 'Emojis para copiar según lo que quieres decir, y los que conviene evitar.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Buscador de Emojis por Intención meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Emojis para Copiar y Pegar según lo que Quieres Decir',
  description:
    'Buscador de emojis por intención: el usuario escribe lo que quiere expresar («me alegro», «lo siento», «ánimo», «feliz cumple») y recibe entre 3 y 6 emojis adecuados para copiar, con una nota de uso y los emojis que conviene evitar porque pueden leerse al revés.',
  url: 'https://meskeia.com/buscador-emojis/',
  category: 'UtilityApplication',
  features: [
    `Búsqueda por frases en ${INTENCIONES.length} intenciones redactadas a mano, con variantes de España y Latinoamérica`,
    'Entre 3 y 6 emojis por intención, cada uno con su nota de uso',
    'Apartado «Cuidado con» en cada intención: los emojis que pueden leerse al revés',
    `Significado de ${AVISOS.length} emojis con más de una lectura`,
    'Copiar con un clic y componer un mensaje con varios emojis',
    'Pega un emoji para ver dónde conviene usarlo y dónde no',
    'Funciona en el navegador, sin registro y sin enviar lo que escribes',
  ],
});

// FUENTE ÚNICA de la FAQ visible (page.tsx) y del FAQPage JSON-LD de abajo.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo encuentro el emoji adecuado para lo que quiero decir?',
    answer: `Escribe la frase tal como la dirías: «me alegro», «lo siento», «ánimo» o «feliz cumple». El buscador la compara con ${INTENCIONES.length} intenciones redactadas a mano, con variantes de España y de Latinoamérica, y te propone entre 3 y 6 emojis. Al pulsar uno se copia, listo para pegarlo en WhatsApp, Telegram, Instagram o un correo.`,
  },
  {
    question: '¿En qué se diferencia del buscador de emojis de Windows o del teclado del móvil?',
    answer:
      'Esos buscadores encuentran el emoji por su nombre oficial, como «cara sonriente» o «corazón». Si escribes «me alegro» o «qué bien», el panel de Windows (tecla Windows + punto) responde «No pudimos encontrarlo». Aquí se busca por lo que quieres expresar, y cada propuesta va con una nota de uso y con los emojis que conviene evitar en ese contexto.',
  },
  {
    question: '¿Por qué un emoji puede molestar a quien lo recibe?',
    answer:
      'Porque muchos tienen más de una lectura. La cara sonriente leve es amable para unos y fría o forzada para otros; la cara llorando a mares se usa tanto para el llanto como para la risa, y la calavera significa en redes «me muero de risa». Por eso cada intención incluye un apartado «Cuidado con» con los que pueden leerse al revés.',
  },
  {
    question: '¿Los emojis significan lo mismo en España y en Latinoamérica?',
    answer:
      'Los emojis casi siempre, pero no las palabras que los acompañan. «Me da pena» es vergüenza en buena parte de Latinoamérica y tristeza en España, y «qué padre», «qué guay», «chévere» o «bacán» dicen lo mismo en distintos países. El diccionario recoge esas variantes para que la búsqueda funcione escribas desde donde escribas.',
  },
  {
    question: '¿Puedo pegar un emoji para saber qué significa?',
    answer: `Sí. Si pegas un emoji en el buscador, la app te dice qué lecturas tiene cuando es uno de los ${AVISOS.length} que más se malinterpretan, en qué intenciones se recomienda y en cuáles conviene evitarlo.`,
  },
  {
    question: '¿Qué hago si veo un cuadrado en lugar del emoji?',
    answer:
      'El emoji lo dibuja tu sistema, no esta página. Los más recientes, como la cara derritiéndose o el saludo militar, no existen en sistemas antiguos y aparecen como un cuadrado o un signo de interrogación. Quien reciba tu mensaje con un sistema antiguo verá lo mismo, por eso se proponen sobre todo emojis veteranos.',
  },
  {
    question: '¿Se guarda lo que escribo?',
    answer:
      'No. La búsqueda se hace en tu navegador, sin enviar lo que escribes a ningún servidor, y el mensaje que compones se borra al cerrar la página.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
