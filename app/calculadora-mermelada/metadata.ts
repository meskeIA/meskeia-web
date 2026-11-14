import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { UMBRAL_PECTINA } from '@/lib/calculadoras/mermelada';

/** «70 %» con espacio duro (CLAUDE.md §2; hallazgo 4650). */
const pct = (n: number): string => `${n} %`;

export const metadata: Metadata = {
  title: 'Calculadora de mermelada: fruta, azúcar y limón | meskeIA',
  description:
    'Calcula el azúcar y el limón para tu mermelada según el peso de la fruta y el dulzor: tradicional (1:1), equilibrada o ligera. Te avisa si necesita pectina. Gratis y en español.',
  keywords:
    'calculadora mermelada, proporcion fruta azucar mermelada, cuanto azucar para mermelada, mermelada casera ratio, confitura azucar, mermelada poca azucar pectina, mermelada 1 kg fruta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de mermelada', description: 'Azúcar y limón para tu mermelada según el peso de la fruta y el dulzor que quieras.', url: 'https://meskeia.com/calculadora-mermelada', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Calculadora de mermelada', description: 'Azúcar y limón para tu mermelada casera según el peso de la fruta.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Calculadora de mermelada meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-mermelada/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de mermelada y confitura',
  description:
    'Calcula los gramos de azúcar y el zumo de limón para preparar mermelada casera según el peso de la fruta y el nivel de dulzor elegido (tradicional 1:1, equilibrada o ligera), e indica cuándo conviene añadir pectina.',
  url: 'https://meskeia.com/calculadora-mermelada/',
  features: [
    'Azúcar y limón según el peso de la fruta y el dulzor',
    'Niveles tradicional, equilibrado y ligero',
    'Aviso de cuándo necesita pectina añadida',
    'Proporciones sobre la fruta ya limpia',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

/**
 * Una sola fuente para la FAQ visible de page.tsx y el FAQPage (hallazgo 4646, check:faq-unica):
 * hasta el 14/11/2026 el FAQPage tenía cinco preguntas que la página no enseñaba, y daba otro
 * umbral de pectina que el motor.
 */
export const PREGUNTAS_FRECUENTES: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: '¿Cuánta azúcar lleva la mermelada?',
    respuesta: `La proporción tradicional es 1:1 (mismo peso de azúcar que de fruta), que se conserva mucho y cuaja con facilidad si la fruta tiene pectina, aunque resulta muy dulce. Hoy lo más habitual es una mermelada equilibrada con un ${pct(70)} de azúcar respecto a la fruta, que sabe más a fruta sin empalagar. Por debajo del ${pct(Math.round(UMBRAL_PECTINA * 100))}, como en la ligera (${pct(50)}), conviene añadir pectina o usar fruta rica en ella.`,
  },
  {
    pregunta: '¿Para qué sirve el limón en la mermelada?',
    respuesta: 'El zumo de limón aporta acidez y pectina natural, dos cosas que ayudan a que la mermelada cuaje, además de realzar el sabor de la fruta y mantener el color. Por eso casi todas las recetas llevan un chorro de limón, sobre todo con frutas poco ácidas o pobres en pectina.',
  },
  {
    pregunta: '¿Cómo sé que la mermelada está en su punto?',
    respuesta: 'La prueba del plato frío: pon una cucharadita en un plato que has tenido en el congelador, espera unos segundos y pasa el dedo; si la superficie se arruga y no se vuelve a juntar, está lista. Con termómetro, el punto de gelificación ronda los 104-105 °C.',
  },
  {
    pregunta: '¿La mermelada con poca azúcar se conserva igual?',
    respuesta: 'No: el azúcar es un conservante natural, así que una mermelada ligera dura menos y conviene guardarla en la nevera y consumirla en pocas semanas, o congelarla. Las mermeladas muy azucaradas y bien esterilizadas en tarro aguantan meses en la despensa.',
  },
  {
    pregunta: '¿Hay que esterilizar los tarros?',
    respuesta: 'Sí, para conservar la mermelada fuera de la nevera conviene usar tarros limpios y esterilizados, llenarlos en caliente y voltearlos o hacer un baño maría para crear el vacío. Para consumo rápido y guardando en nevera, basta con tarros bien limpios.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((p) => ({
    '@type': 'Question',
    name: p.pregunta,
    acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
  })),
};
