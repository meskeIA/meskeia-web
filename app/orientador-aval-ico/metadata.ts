import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Aval ICO Vivienda — Comprar sin el 20% de Entrada | meskeIA',
  description:
    'Oriéntate sobre el aval ICO para comprar tu primera vivienda sin el 20% de entrada. Requisitos, proceso paso a paso y documentación necesaria para jóvenes menores de 35 años y familias con menores.',
  keywords:
    'aval ico vivienda, aval ico jóvenes, comprar piso sin entrada, ico jóvenes hipoteca, aval gobierno primera vivienda, requisitos aval ico, hipoteca 100%, garantía ico vivienda 2026',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-aval-ico/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador Aval ICO Vivienda — Comprar sin el 20% de Entrada',
    description:
      '¿Quieres comprar una vivienda pero no tienes el 20% de entrada? Conoce el programa de avales del ICO para jóvenes y familias.',
    url: 'https://meskeia.com/orientador-aval-ico/',
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
    title: 'Orientador Aval ICO Vivienda',
    description:
      'El gobierno avala hasta el 20% de tu hipoteca si tienes menos de 35 años. Descubre cómo funciona y si puedes solicitarlo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Aval ICO Vivienda',
  description: 'Comprueba si puedes acceder al Aval ICO para comprar tu primera vivienda sin el 20% de entrada. Orientador de requisitos para jóvenes menores de 35 años y familias con hijos menores a cargo.',
  url: 'https://meskeia.com/orientador-aval-ico/',
  category: 'FinanceApplication',
  features: [
    'Comprobación de requisitos del Aval ICO paso a paso',
    'Perfil jóvenes (menores de 35 años) y familias con menores',
    'Resultado orientativo inmediato: apto / parcial / no apto',
    'Proceso de solicitud explicado paso a paso',
    'Documentación necesaria detallada',
    'Comparativa con compra sin aval ICO',
    'Preguntas frecuentes sobre el programa ICO',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['aval ICO', 'primera vivienda', 'hipoteca 100%', 'jóvenes vivienda', 'ICO', 'comprar sin entrada'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Aval ICO para la vivienda y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Aval ICO es un programa del gobierno de España gestionado por el Instituto de Crédito Oficial (ICO) que actúa como garante de hasta el 20% del préstamo hipotecario. Permite a los compradores acceder a una hipoteca del 100% del valor de la vivienda sin necesidad de disponer del ahorro previo habitual del 20%, que suele ser la principal barrera para acceder a la primera vivienda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién puede solicitar el Aval ICO para comprar una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pueden solicitarlo dos perfiles: jóvenes menores de 35 años que vayan a comprar su primera vivienda habitual, y familias con menores a cargo independientemente de la edad. En ambos casos se requiere residencia legal en España, que la vivienda sea la residencia habitual y permanente, y que los ingresos anuales no superen ciertos límites establecidos por el programa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el límite de ingresos para acceder al Aval ICO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El límite general es de 37.800 euros brutos anuales por solicitante (4,5 veces el IPREM). En el caso de compra en pareja, el límite se aplica individualmente a cada persona. Para familias con hijos o personas con discapacidad, el límite puede incrementarse. El orientador calcula automáticamente si tus ingresos están dentro del umbral según tu situación familiar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Aval ICO es un préstamo o una subvención? ¿Hay que devolverlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Aval ICO no es un préstamo ni una subvención: es una garantía. El ICO actúa como avalista ante el banco, lo que permite al comprador acceder a una hipoteca mayor. No hay que devolver nada al ICO directamente; la deuda es únicamente con el banco que concede la hipoteca. Sin embargo, si se produce un impago, el ICO respondería ante el banco y podría reclamar posteriormente al comprador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué documentación se necesita para solicitar el Aval ICO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La documentación básica incluye: DNI o NIE en vigor, última declaración de la renta o certificado de imputaciones de la AEAT, vida laboral y contrato de trabajo o autónomo, libro de familia si se tiene hijos menores, y nota simple registral de la vivienda a comprar. La solicitud se tramita a través de las entidades bancarias adheridas al programa, no directamente ante el ICO.',
      },
    },
  ],
};
