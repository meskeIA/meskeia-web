import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Jubilación Pública 2026 — Edad, pensión y anticipada | meskeIA',
  description: 'Simula tu jubilación pública completa: edad de jubilación, pensión estimada (sistema dual 2026), jubilación anticipada con coeficientes reductores y jubilación parcial. Todo en una sola herramienta.',
  keywords: 'simulador jubilacion, edad jubilacion 2026, pension publica, jubilacion anticipada, jubilacion parcial, seguridad social pension, sistema dual 2026, coeficientes reductores, cuando me jubilo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Jubilación Pública 2026 | meskeIA',
    description: 'Edad de jubilación, pensión estimada, anticipada y parcial. Todo en una herramienta.',
    url: 'https://meskeia.com/simulador-jubilacion-publica/',
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
    title: 'Simulador de Jubilación Pública 2026 | meskeIA',
    description: 'Simula tu jubilación completa: edad, pensión, anticipada y parcial.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador Jubilación Pública meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Jubilación Pública',
  description: 'Simulador completo de jubilación pública española: calcula tu edad de jubilación según año de nacimiento y cotización, estima tu pensión con el sistema dual 2026, analiza la jubilación anticipada (voluntaria e involuntaria) con coeficientes reductores, y orienta sobre la jubilación parcial.',
  url: 'https://meskeia.com/simulador-jubilacion-publica/',
  features: [
    'Edad de jubilación personalizada por año de nacimiento',
    'Estimación de pensión con sistema dual 2026',
    'Análisis de jubilación anticipada (voluntaria e involuntaria)',
    'Orientación sobre jubilación parcial con contrato de relevo',
    'Tabla progresiva de edad de jubilación 2024-2027',
    'Aviso de tope máximo de pensión y de complemento a mínimos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A qué edad me puedo jubilar en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026, la edad ordinaria de jubilación en España es de 66 años y 10 meses si tienes menos de 38 años y 3 meses cotizados, o de 65 años si superas esa cotización. La edad se incrementa progresivamente hasta alcanzar los 67 años en 2027 para quienes tengan menos de 38 años y 6 meses cotizados. El año de nacimiento y los años cotizados son los dos factores determinantes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la pensión pública de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión se calcula aplicando a la base reguladora un porcentaje que depende de los años cotizados: el 50% con los 15 años mínimos, más un 0,21% por cada uno de los 49 meses siguientes y un 0,19% por cada uno de los 209 posteriores, hasta el 100% a los 36 años y 6 meses en 2026. La base reguladora clásica es la suma de las últimas 300 bases de cotización dividida entre 350. Desde 2026 convive con la fórmula ampliada (las 302 mejores bases de un periodo de 304 meses, divididas entre 352,33) y la Seguridad Social aplica de oficio la más favorable, sin que haya que elegir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se reduce la pensión por jubilarse antes de tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La jubilación anticipada voluntaria aplica coeficientes reductores permanentes sobre la pensión. Jubilarse 2 años antes son 8 trimestres, y la reducción va del 13,04% al 16,00% según los años cotizados: el 16% le corresponde a quien tiene menos de 38 años y 6 meses cotizados, es decir, a quien menos ha cotizado. La jubilación anticipada involuntaria (despido colectivo, cierre de empresa, etc.) permite anticipar hasta 4 años y aplica coeficientes algo menos penalizadores, del 1,50% al 1,875% por trimestre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la jubilación parcial y quién puede solicitarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La jubilación parcial permite reducir la jornada laboral entre un 25% y un 75% y cobrar simultáneamente la parte proporcional de la pensión, siempre que la empresa contrate a un trabajador sustituto mediante un contrato de relevo. Desde el RDL 11/2024, con efectos del 1 de abril de 2025, no hay una edad fija: puede anticiparse como máximo 3 años sobre la edad ordinaria que corresponda, de modo que en 2026 son 62 años con la cotización suficiente acreditada o 63 años y 10 meses sin ella. Se exigen además 33 años cotizados (25 con discapacidad igual o superior al 33%), 6 años de antigüedad en la empresa y acuerdo con ella.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la pensión máxima de jubilación en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión máxima de jubilación de la Seguridad Social en 2026 es de 3.359,60 € al mes (en 14 pagas), que se revisa anualmente según el IPC. Esta cifra actúa como techo independientemente de la base reguladora calculada. Por abajo existen cuantías mínimas —1.256,60 € al mes con cónyuge a cargo, 936,20 € en unidad unipersonal y 888,70 € con cónyuge no a cargo—, pero no se aplican solas: el complemento a mínimos exige que las rentas anuales distintas de la pensión no superen 9.442 €, u 11.013 € contando al cónyuge a cargo.',
      },
    },
  ],
};
