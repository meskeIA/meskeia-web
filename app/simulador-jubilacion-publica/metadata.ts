import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_PENSIONES_META } from '@/data/fiscal';
// Las cifras del FAQPage salen de data/fiscal vía ./textos (hallazgo 2873).
import { RESPUESTA_EDAD, RESPUESTA_CALCULO, RESPUESTA_ANTICIPADA_FAQPAGE, RESPUESTA_PARCIAL_FAQPAGE, RESPUESTA_LIMITES } from './textos';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_PENSIONES_META.vigencia;

export const metadata: Metadata = {
  title: `Simulador de Jubilación Pública ${anio} — Edad, pensión y anticipada | meskeIA`,
  description: 'Simula tu jubilación pública completa: edad de jubilación, pensión estimada (sistema dual 2026), jubilación anticipada con coeficientes reductores y jubilación parcial. Todo en una sola herramienta.',
  keywords: 'simulador jubilacion, edad jubilacion 2026, pension publica, jubilacion anticipada, jubilacion parcial, seguridad social pension, sistema dual 2026, coeficientes reductores, cuando me jubilo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Simulador de Jubilación Pública ${anio} | meskeIA`,
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
    title: `Simulador de Jubilación Pública ${anio} | meskeIA`,
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
        text: RESPUESTA_EDAD,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la pensión pública de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_CALCULO,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se reduce la pensión por jubilarse antes de tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_ANTICIPADA_FAQPAGE,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la jubilación parcial y quién puede solicitarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_PARCIAL_FAQPAGE,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la pensión máxima de jubilación en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_LIMITES,
      },
    },
  ],
};
