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
    'Comparativa fórmula clásica vs ampliada (sistema dual)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
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
        text: 'En 2026, la edad ordinaria de jubilación en España es de 66 años y 8 meses si tienes menos de 38 años y 3 meses cotizados, o de 65 años si superas esa cotización. La edad se incrementa progresivamente hasta alcanzar los 67 años en 2027 para quienes tengan menos de 38 años y 6 meses cotizados. El año de nacimiento y los años cotizados son los dos factores determinantes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la pensión pública de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión se calcula dividiendo la base reguladora (promedio de las bases de cotización de los últimos 25 años, con correctores de inflación) entre el número de meses del período de cálculo, y aplicando un porcentaje según los años cotizados. Con el sistema dual 2026, puedes elegir entre la fórmula clásica (últimos 25 años) y la ampliada (toda la vida laboral con descarte de los peores años), aplicándose la más favorable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se reduce la pensión por jubilarse antes de tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La jubilación anticipada voluntaria aplica coeficientes reductores permanentes sobre la pensión. Si te jubilas 2 años antes, la reducción es de entre el 13% y el 14% dependiendo de los años cotizados. Cuanto menos se haya cotizado y más se anticipe la jubilación, mayor es la penalización. La jubilación anticipada involuntaria (por despido colectivo, enfermedad, etc.) aplica coeficientes algo menos penalizadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la jubilación parcial y quién puede solicitarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La jubilación parcial permite reducir la jornada laboral (entre un 25% y un 50%) y cobrar simultáneamente una parte proporcional de la pensión, siempre que la empresa contrate a un trabajador sustituto mediante un contrato de relevo. Para solicitarla se requieren al menos 33 años cotizados (en algunos casos 25), tener al menos 60 años (con coeficientes reductores si es antes de la ordinaria) y un acuerdo con la empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la pensión máxima de jubilación en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión máxima de jubilación de la Seguridad Social en 2026 es de 3.267,60 € al mes (en 14 pagas), que se revisa anualmente según el IPC. Esta cifra actúa como techo independientemente de la base reguladora calculada. La pensión mínima garantizada para un pensionista con cónyuge a cargo supera los 900 € mensuales en 2026.',
      },
    },
  ],
};
