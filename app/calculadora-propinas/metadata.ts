import type { Metadata } from 'next';
import { generateCalculatorSchema } from '@/lib/schema-templates';
import { formatCurrency } from '@/lib/formatters';
import { SMI_2026 } from '@/data/fiscal';

export const metadata: Metadata = {
  title: 'Calculadora de Propinas - Calcula la propina perfecta | meskeIA',
  description:
    '¿Cuánto dejar de propina en un restaurante? Calculadora automática con diferentes porcentajes (5%, 10%, 15%). Divide la cuenta entre personas fácilmente.',
  keywords: [
    'calculadora propinas',
    'calcular propina',
    'porcentaje propina',
    'propina camarero',
    'tip calculator',
    'propinas español',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Propinas - meskeIA',
    description:
      'Calcula propinas automáticamente con diferentes porcentajes. Gratis, sin registro, 100% offline.',
    url: 'https://meskeia.com/calculadora-propinas/',
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
    title: 'Calculadora de Propinas - meskeIA',
    description: 'Calcula propinas automáticamente. Sin publicidad, funciona offline.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-propinas/',
  },
};

/** Pregunta de la FAQ; `consejo`, si lo hay, va aparte en la visible y detrás en el JSON-LD. */
export interface PreguntaFrecuente {
  question: string;
  answer: string;
  consejo?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// UNA sola FAQ (hallazgos 4615 y 4616, 16/11/2026): tres preguntas estaban a la vez en el
// FAQPage y en la FAQ visible con respuestas distintas, y la de los impuestos se contradecía
// (el FAQPage pedía declarar las propinas «si son habituales y cuantificables»; la visible, que
// el empleado las comunicara a la empresa «para su inclusión en nómina»). Ninguna de las dos
// condiciones está en el art. 17.1 LIRPF, y la cotización a la Seguridad Social, que el FAQPage
// preguntaba sin contestar, sale de la pregunta. La FAQ visible y el FAQPage leen esta lista.
// ─────────────────────────────────────────────────────────────────────────
export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    question: '¿Cuánto se deja de propina en un restaurante en España?',
    answer:
      'La propina es voluntaria y no hay un porcentaje fijo. Lo habitual es dejar entre un 5 % y un 10 % de la cuenta si el servicio ha sido satisfactorio: para una cena de 50 € entre dos personas, entre 2,50 € y 5 €. Si el servicio fue excepcional, puedes llegar al 10-15 %. En bares de barrio y menús del día no suele esperarse.',
  },
  {
    question: '¿Cómo se calcula el 15 % de propina sobre una cuenta?',
    answer:
      'Multiplica el importe total de la cuenta por 0,15. Por ejemplo, si la cuenta es 48 €, la propina del 15 % sería 48 × 0,15 = 7,20 €. Esta calculadora lo hace automáticamente y también divide el importe entre los comensales.',
  },
  {
    question: '¿Cómo se divide la cuenta de un restaurante entre varias personas con propina incluida?',
    answer:
      'Primero calcula el importe total con la propina (cuenta + propina) y luego divide ese total entre el número de personas. Por ejemplo, una cuenta de 60 € con un 10 % de propina suma 66 €; entre 4 personas corresponde pagar 16,50 € cada una.',
  },
  {
    question: '¿Cuánto se deja de propina en Estados Unidos frente a España?',
    answer: `En Estados Unidos la propina es prácticamente obligatoria por convención social (15-20 % en restaurantes), porque el salario mínimo federal para camareros que reciben propinas puede ser de solo 2,13 $/hora. En España el SMI en 2026 es de ${formatCurrency(SMI_2026.mensual14)}/mes (14 pagas) y se aplica a todos los trabajadores, así que la propina es voluntaria: un 5-10 % se considera generoso.`,
  },
  {
    question: '¿Las propinas tributan en el IRPF?',
    answer:
      'Sí. El art. 17.1 de la Ley del IRPF considera rendimientos íntegros del trabajo «todas las contraprestaciones o utilidades, cualquiera que sea su denominación o naturaleza, dinerarias o en especie, que deriven, directa o indirectamente, del trabajo personal». No pone condición de habitualidad ni de importe mínimo: también las pequeñas en efectivo son rendimiento del trabajo de quien las recibe, y se declaran en su Renta.',
    consejo: 'Referencia: art. 17.1 de la Ley 35/2006 del IRPF (BOE-A-2006-20764).',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.consejo ? `${f.answer} ${f.consejo}` : f.answer,
    },
  })),
};

// Schema.org JSON-LD con template reutilizable
export const jsonLd = generateCalculatorSchema({
  name: 'Calculadora de Propinas',
  description:
    'Calculadora online gratuita para calcular propinas automáticamente con diferentes porcentajes. Divide la cuenta entre personas, selecciona país/contexto y guarda preferencias.',
  url: 'https://meskeia.com/calculadora-propinas/',
  calculationType: 'Propinas',
  features: [
    'Cálculo automático de propinas con múltiples porcentajes',
    'Porcentajes predefinidos por país (España, USA, México, UK, Francia, Alemania, Japón)',
    'División de cuenta entre múltiples personas',
    'Porcentaje personalizado configurable',
    'Guarda preferencias en el navegador',
    'Formato español (números con coma decimal)',
    'Responsive y optimizado para móviles',
  ],
});
