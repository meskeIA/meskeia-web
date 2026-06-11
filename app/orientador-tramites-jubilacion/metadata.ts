import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo y cómo debo solicitar la pensión de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión de jubilación hay que solicitarla, no se concede automáticamente. Se recomienda iniciar el trámite con 1-3 meses de antelación a la fecha en la que dejarás de trabajar, ya que los efectos económicos retroactivos suelen estar limitados a los meses previos a la solicitud. Puedes solicitarla de forma telemática en la Sede Electrónica de la Seguridad Social (con certificado digital, Cl@ve o usuario y contraseña) o mediante cita previa presencial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé cuánto voy a cobrar de pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuantía depende de tu edad de jubilación, los años cotizados y tu base reguladora, calculada a partir de tus últimas bases de cotización. El Simulador de Jubilación Pública de meskeIA da una estimación orientativa con estos datos, incluyendo los coeficientes reductores de la jubilación anticipada. Para una cifra oficial con tus datos reales, usa el simulador de "Tu Seguridad Social" en la sede electrónica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son el complemento a mínimos y el complemento por brecha de género?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El complemento a mínimos eleva tu pensión hasta el importe mínimo garantizado si tu cuantía calculada queda por debajo y el conjunto de tus rentas no supera ciertos límites anuales. El complemento por brecha de género es un importe adicional por cada hijo o hija (hasta un máximo) para compensar el impacto de la maternidad o paternidad en la cotización; tras la sentencia del TJUE de 2025 puede solicitarlo tanto la madre como el padre. Ambos son compatibles con la pensión de jubilación, viudedad o incapacidad permanente que cumpla los requisitos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo tributa la pensión en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las pensiones públicas tributan como rendimientos del trabajo en el IRPF, pero existen un mínimo personal incrementado a partir de los 65 y los 75 años, y la reducción general por rendimientos del trabajo, que reducen la base imponible. El Estimador IRPF Pensionista de meskeIA calcula de forma orientativa la retención y el IRPF anual aproximado a partir de tu pensión y tu edad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué servicios existen para mayores que necesitan ayuda en el día a día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen servicios como la teleasistencia, la ayuda a domicilio, los centros de día y las prestaciones económicas del Sistema para la Autonomía y Atención a la Dependencia (SAAD), gestionados por cada Comunidad Autónoma. La mayoría requieren el reconocimiento previo de un grado de dependencia mediante el Baremo de Valoración de la Dependencia (BVD). Además, los pensionistas pueden acceder a programas de turismo social del IMSERSO, la Tarjeta Dorada de Renfe y descuentos en museos y transporte.',
      },
    },
  ],
};
