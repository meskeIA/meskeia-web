import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Ayudas y Prestaciones para Personas y Familias | meskeIA',
  description:
    'Descubre qué tipos de ayudas y prestaciones sociales existen en España según tu situación: Ingreso Mínimo Vital, prestación por desempleo, bono social eléctrico, deducciones familiares, dependencia y discapacidad, con enlaces a los organismos oficiales.',
  keywords:
    'ingreso minimo vital, IMV, prestacion desempleo, subsidio paro, bono social electrico, deducciones familiares irpf, ayudas familias, pensiones no contributivas, ayudas personas, prestaciones sociales españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-ayudas-personas-familias/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador de Ayudas y Prestaciones para Personas y Familias',
    description:
      '¿Qué ayudas y prestaciones sociales puedes consultar según tu situación personal o familiar? Responde unas preguntas y descubre las categorías que encajan contigo.',
    url: 'https://meskeia.com/orientador-ayudas-personas-familias/',
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
    title: 'Orientador de Ayudas y Prestaciones para Personas y Familias',
    description:
      'IMV, prestación por desempleo, bono social eléctrico, deducciones familiares, dependencia, discapacidad... Descubre qué tipos de ayuda encajan con tu situación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Ayudas y Prestaciones para Personas y Familias',
  description: 'Orientador interactivo que, según tu situación personal (desempleo, bajos ingresos, familia con hijos, jubilación, emancipación o dependencia/discapacidad) y tus necesidades, muestra qué tipos de ayudas y prestaciones sociales españolas pueden aplicarte, con enlaces a los organismos oficiales y a otras herramientas meskeIA relacionadas.',
  url: 'https://meskeia.com/orientador-ayudas-personas-familias/',
  category: 'UtilityApplication',
  features: [
    'Wizard de perfil: situación personal, necesidad y características familiares',
    'Catálogo de 13 categorías de ayudas y prestaciones sociales',
    'Ingreso Mínimo Vital, prestación y subsidio por desempleo, bono social eléctrico',
    'Deducciones familiares del IRPF y pensiones no contributivas',
    'Enlaces a otras herramientas meskeIA: discapacidad, dependencia, vivienda, alquiler joven',
    'Enlaces directos a organismos oficiales (Seguridad Social, SEPE, AEAT, IMSERSO, BDNS...)',
    'Sin importes ni promesas de elegibilidad: solo orientación y enlaces a simuladores oficiales',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['ingreso mínimo vital', 'prestación desempleo', 'bono social eléctrico', 'deducciones familiares', 'ayudas familias', 'BDNS'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Ingreso Mínimo Vital y quién puede solicitarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Ingreso Mínimo Vital (IMV) es una prestación mensual del INSS para hogares con ingresos y patrimonio por debajo de determinados umbrales, que varían según el número de personas que conviven en el hogar y su composición (menores, monoparentalidad, discapacidad...). No existe una cifra única: cada solicitud se valora de forma individual. El simulador oficial en imv.seg-social.es permite hacer una primera estimación con tus datos reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si tengo derecho a la prestación o al subsidio por desempleo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación contributiva exige haber cotizado un mínimo de días en los últimos años y encontrarte en situación legal de desempleo (despido, fin de contrato, etc.). Si no cumples ese mínimo, existen subsidios para colectivos concretos: mayores de 45 años con cargas familiares, quienes agotan la prestación contributiva o quienes nunca llegaron al periodo mínimo cotizado. El SEPE dispone de un simulador que calcula tu situación a partir de tu vida laboral.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el bono social eléctrico y cómo se solicita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bono social eléctrico es un descuento sobre el precio de la luz para hogares vulnerables, que se solicita ante la comercializadora de referencia con contrato PVPC. El porcentaje de descuento depende del nivel de renta del hogar (medido en múltiplos del IPREM) y de la composición familiar, con condiciones reforzadas para familias numerosas, monoparentales o con personas con discapacidad o dependencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué deducciones fiscales existen por tener hijos o familiares a cargo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Agencia Tributaria reconoce deducciones por familia numerosa, por ascendiente o descendiente con discapacidad a cargo y por cada hijo menor de 3 años. Pueden cobrarse de forma anticipada cada mes solicitando el modelo 143, o aplicarse directamente en la declaración de la Renta. Son compatibles entre sí cuando se cumple más de un requisito a la vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde puedo pedir ayuda si mi situación económica es urgente y no encaja en ninguna de estas categorías?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los Servicios Sociales de tu ayuntamiento son el punto de partida recomendado para situaciones urgentes: gestionan ayudas de emergencia social, suministros básicos, alquiler o comedor escolar, con requisitos propios de cada municipio y comunidad autónoma. También puedes consultar el buscador oficial BDNS (infosubvenciones.es) para ver qué convocatorias están abiertas en tu zona.',
      },
    },
  ],
};
