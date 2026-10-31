import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// «Amigo invisible» es el término de España y «amigo secreto» el de Latinoamérica: los dos van
// en el title y el H1 los nombra a los dos (regla 1.bis, término-núcleo).

export const metadata: Metadata = {
  title: 'Sorteo de Amigo Invisible o Amigo Secreto Online con Exclusiones - meskeIA',
  description: 'Sorteo de amigo invisible (amigo secreto) gratis y sin registro: excluye parejas, evita regalos mutuos y envía a cada persona su enlace privado. El organizador no ve el resultado.',
  keywords: 'amigo invisible, sorteo amigo invisible, amigo secreto, sorteo amigo secreto, amigo invisible online, sortear amigo invisible, amigo invisible con exclusiones, amigo invisible por whatsapp, intercambio de regalos navidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/sorteo-amigo-invisible/',
  },
  openGraph: {
    type: 'website',
    title: 'Sorteo de Amigo Invisible o Amigo Secreto',
    description: 'Sortea el amigo invisible con exclusiones de parejas y un enlace privado para cada persona. Sin registro y sin que el organizador vea el resultado.',
    url: 'https://meskeia.com/sorteo-amigo-invisible/',
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
    title: 'Sorteo de Amigo Invisible o Amigo Secreto',
    description: 'Exclusiones de parejas, sin regalos mutuos y un enlace privado para cada participante.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Sorteo de Amigo Invisible meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sorteo de Amigo Invisible (Amigo Secreto)',
  description: 'Sorteo de amigo invisible o amigo secreto con exclusiones (parejas, el año pasado), opción de evitar regalos mutuos y un enlace privado por participante, o un modo para pasar el móvil por turnos. El organizador no ve el resultado en pantalla y todo se procesa en el navegador.',
  url: 'https://meskeia.com/sorteo-amigo-invisible/',
  category: 'UtilityApplication',
  features: [
    'Exclusiones en un sentido o en los dos, para parejas o para repetir del año pasado',
    'Opción para que nadie se regale mutuamente (sin parejas A y B que se toquen entre sí)',
    'Avisa de qué persona se ha quedado sin opciones cuando las exclusiones no dejan reparto',
    'Un enlace privado por participante, con presupuesto y fecha del intercambio',
    'Modo «pasar el móvil» para revelar por turnos cuando el grupo está junto',
    'El organizador no ve el resultado en pantalla y el sorteo usa el azar criptográfico del navegador',
    'Sin registro ni correo: la lista se guarda solo en el navegador de quien organiza',
  ],
});

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo se hace el sorteo del amigo invisible sin que el organizador sepa a quién le toca a cada uno?',
    answer: 'Escribe los nombres, pulsa «Hacer el sorteo» y envía a cada persona su enlace por un chat privado. El resultado no aparece en la pantalla del organizador: cada enlace solo muestra a quién le regala su dueño. Si el organizador abre un enlace que no es el suyo, sí lo verá, así que basta con copiarlos sin abrirlos.',
  },
  {
    question: '¿Se puede hacer que las parejas no se regalen entre sí?',
    answer: 'Sí. En «Quién no puede regalar a quién» eliges a una persona y a su pareja y marcas «Y al revés», de modo que ninguno de los dos puede tocarle al otro. Sirve también para que a nadie le toque la misma persona que el año pasado. Si las exclusiones no dejan ningún reparto posible, la app dice qué persona se ha quedado sin opciones.',
  },
  {
    question: '¿Qué es un regalo mutuo y por qué evitarlo?',
    answer: 'Es cuando a Ana le toca Luis y a Luis le toca Ana. En grupos pequeños resta sorpresa, porque cada uno puede deducir quién le regala. Activando «Sin regalos mutuos» el sorteo forma solo cadenas de tres o más personas. Con 4 participantes, por ejemplo, hay 9 repartos posibles y 6 de ellos no tienen ningún regalo mutuo.',
  },
  {
    question: '¿Cuántas personas hacen falta y cuántas caben?',
    answer: 'Hacen falta al menos 3: con 2, cada una sabría a quién le toca la otra. Caben hasta 100 por sorteo. Si dos personas se llaman igual, conviene añadir la inicial del apellido, porque la lista cuenta los nombres repetidos una sola vez.',
  },
  {
    question: '¿Se guardan los nombres en algún servidor o hace falta registrarse?',
    answer: 'No. No hay registro ni correo electrónico: el sorteo se hace en el navegador y la lista se guarda solo en el del organizador, para que pueda volver a copiar los enlaces. El resultado de cada persona viaja dentro de su propio enlace, en una parte de la dirección que el navegador no envía al servidor.',
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
