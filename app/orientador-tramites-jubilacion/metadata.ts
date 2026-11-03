import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Trámites de Jubilación | meskeIA',
  description:
    'Guía orientativa para llegar a la jubilación: cómo y cuándo solicitar la pensión, calcula tu cuantía, revisa los complementos a mínimos y por brecha de género, la tributación IRPF y los servicios para mayores, con enlaces a las calculadoras y organismos oficiales.',
  keywords:
    'tramites jubilacion, solicitar pension jubilacion, como pedir la jubilacion, complemento a minimos, complemento brecha de genero, irpf pensionista, tu seguridad social, jubilacion activa, servicios para mayores',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-tramites-jubilacion/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador de Trámites de Jubilación',
    description:
      '¿Qué trámites, complementos y servicios debes conocer al jubilarte? Responde unas preguntas y descubre las categorías que pueden encajar contigo, con enlaces a calculadoras y organismos oficiales.',
    url: 'https://meskeia.com/orientador-tramites-jubilacion/',
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
    title: 'Orientador de Trámites de Jubilación',
    description:
      'Solicitud de la pensión, cuantía estimada, complementos, IRPF y servicios para mayores. Descubre qué trámites te corresponden y dónde gestionarlos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Trámites de Jubilación',
  description: 'Orientador interactivo que, según tu situación (próximo a jubilarte, ya jubilado o cuidando a un familiar mayor), muestra qué trámites, complementos y servicios relacionados con la jubilación pueden corresponderte, con enlaces a las calculadoras meskeIA específicas y a los organismos oficiales.',
  url: 'https://meskeia.com/orientador-tramites-jubilacion/',
  category: 'UtilityApplication',
  features: [
    'Wizard de perfil: situación, trámite que necesitas y circunstancias personales',
    'Catálogo de 11 categorías: solicitud de la pensión, cuantía, complementos, IRPF, viudedad y servicios para mayores',
    'Cómo y cuándo solicitar la pensión de jubilación en la Seguridad Social',
    'Enlaces directos a las calculadoras meskeIA de cuantía, ahorro, complementos e IRPF pensionista',
    'Complemento a mínimos y complemento por brecha de género',
    'Servicios para mayores: teleasistencia, ayuda a domicilio, dependencia y descuentos IMSERSO',
    'Sin importes ni promesas: solo orientación y enlaces a calculadoras y organismos oficiales',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['tramites jubilacion', 'solicitar pension jubilacion', 'complemento a minimos', 'irpf pensionista', 'tu seguridad social'],
});

// Una sola fuente para el FAQPage y la FAQ visible de page.tsx (check:faq-unica, cabo C0570,
// 03/11/2026). Las dos copias divergían en dos respuestas:
//   · IRPF: la visible decía que el mínimo personal «reduce la base imponible», el error que vigila
//     check:minimo-irpf; se quedó la del JSON-LD (tipo cero, art. 63.1.2.º LIRPF).
//   · Complementos: una decía «compatibles con la pensión de jubilación, viudedad o incapacidad» y
//     la otra «compatibles entre sí». Las dos son ciertas por el art. 60 LGSS (texto consolidado
//     del BOE, consultado el 03/11/2026): apdo. 1, el de brecha se reconoce en esas tres pensiones
//     contributivas; apdo. 3.e, no cuenta como ingreso para el de mínimos y se suma a la cuantía mínima.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuándo y cómo debo solicitar la pensión de jubilación?',
    answer: 'La pensión de jubilación hay que solicitarla, no se concede automáticamente. Se recomienda iniciar el trámite con 1-3 meses de antelación a la fecha en la que dejarás de trabajar, ya que los efectos económicos retroactivos suelen estar limitados a los meses previos a la solicitud. Puedes solicitarla de forma telemática en la Sede Electrónica de la Seguridad Social (con certificado digital, Cl@ve o usuario y contraseña) o mediante cita previa presencial.',
  },
  {
    question: '¿Cómo sé cuánto voy a cobrar de pensión?',
    answer: 'La cuantía depende de tu edad de jubilación, los años cotizados y tu base reguladora, calculada a partir de tus últimas bases de cotización. El Simulador de Jubilación Pública de meskeIA da una estimación orientativa con estos datos, incluyendo los coeficientes reductores de la jubilación anticipada. Para una cifra oficial con tus datos reales, usa el simulador de «Tu Seguridad Social» en la sede electrónica.',
  },
  {
    question: '¿Qué son el complemento a mínimos y el complemento por brecha de género?',
    answer: 'El complemento a mínimos eleva tu pensión hasta el importe mínimo garantizado si tu cuantía calculada queda por debajo y el conjunto de tus rentas no supera ciertos límites anuales. El complemento por brecha de género es un importe adicional por cada hijo o hija (hasta un máximo) para compensar el impacto de la maternidad o paternidad en la cotización; tras la sentencia del TJUE de 2025 puede solicitarlo tanto la madre como el padre. El de brecha se reconoce en las pensiones contributivas de jubilación, incapacidad permanente o viudedad, y es compatible con el de mínimos: no cuenta como ingreso para acceder a él y se suma a la cuantía mínima.',
  },
  {
    question: '¿Cómo tributa la pensión en el IRPF?',
    answer: 'Las pensiones públicas tributan como rendimientos del trabajo en el IRPF, pero existen un mínimo personal incrementado a partir de los 65 y los 75 años y la reducción general por rendimientos del trabajo. La reducción sí baja la base imponible; el mínimo no, se grava a tipo cero por la vía del artículo 63.1.2º de la Ley del IRPF, de modo que vale lo mismo cualquiera que sea la pensión. El Estimador IRPF Pensionista de meskeIA calcula de forma orientativa la retención y el IRPF anual aproximado a partir de tu pensión y tu edad.',
  },
  {
    question: '¿Qué servicios existen para mayores que necesitan ayuda en el día a día?',
    answer: 'Existen servicios como la teleasistencia, la ayuda a domicilio, los centros de día y las prestaciones económicas del Sistema para la Autonomía y Atención a la Dependencia (SAAD), gestionados por cada Comunidad Autónoma. La mayoría requieren el reconocimiento previo de un grado de dependencia mediante el Baremo de Valoración de la Dependencia (BVD). Además, los pensionistas pueden acceder a programas de turismo social del IMSERSO, la Tarjeta Dorada de Renfe y descuentos en museos y transporte.',
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
