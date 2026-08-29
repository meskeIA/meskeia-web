import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador del IVA en España: qué IVA aplicar en cada operación - meskeIA',
  description:
    'Aprende qué IVA aplicar según la operación: nacional, intracomunitaria, exportación o importación. Simulador de factura con IVA repercutido, soportado, exenciones e inversión del sujeto pasivo.',
  keywords:
    'iva, iva intracomunitario, iva repercutido, iva soportado, exportación, importación, inversión sujeto pasivo, autónomo, modelo 303, modelo 349, VIES, OSS',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador del IVA en España — qué IVA aplicar en cada operación',
    description:
      'Simulador visual para autónomos y nuevas empresas: descubre qué IVA corresponde a cada operación (nacional, UE, exportación, importación) y cómo queda la factura.',
    url: 'https://meskeia.com/orientador-iva-espana/',
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
    title: 'Orientador del IVA en España',
    description:
      'Qué IVA aplicar en cada operación: nacional, intracomunitario, exportación e importación. Con simulador de factura.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Orientador del IVA meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Orientador del IVA en España',
  description:
    'Herramienta de orientación para autónomos y nuevas empresas que explica qué IVA aplicar en cada tipo de operación (interior, intracomunitaria, exportación, importación) y simula cómo queda la factura, incluyendo exenciones e inversión del sujeto pasivo.',
  url: 'https://meskeia.com/orientador-iva-espana/',
  category: 'FinanceApplication',
  features: [
    'Simulador de factura según el tipo de operación',
    'IVA repercutido, soportado, exenciones e inversión del sujeto pasivo',
    'Operaciones nacionales, intracomunitarias, exportaciones e importaciones',
    'Comparativa del mismo importe en distintos ámbitos',
    'Indica los modelos tributarios aplicables (303, 349, 369)',
    'Tipos de IVA español 21%, 10% y 4% con ejemplos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre IVA repercutido y IVA soportado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IVA repercutido es el que cobras a tus clientes en tus facturas de venta y debes ingresar en Hacienda. El IVA soportado es el que pagas en tus compras y gastos de la actividad, y es deducible. En el modelo 303 ingresas la diferencia: IVA repercutido menos IVA soportado deducible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tengo que poner IVA si facturo a una empresa de otro país de la UE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, si se cumplen los requisitos. En una entrega intracomunitaria de bienes o un servicio B2B a otra empresa de la UE facturas sin IVA y el cliente autorrepercute el IVA en su país (inversión del sujeto pasivo). Para ello el cliente debe tener un NIF-IVA válido en el censo VIES y tú debes estar dado de alta en el ROI y presentar el modelo 349.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las exportaciones llevan IVA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Las exportaciones de bienes fuera de la Unión Europea están exentas de IVA (art. 21 de la Ley del IVA). Es una exención plena: facturas sin IVA pero conservas el derecho a deducir el IVA soportado. Necesitas el DUA o documento aduanero que pruebe la salida de la mercancía. Vender a Canarias, Ceuta o Melilla también se considera exportación a efectos de IVA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la inversión del sujeto pasivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un mecanismo por el que quien declara el IVA no es el vendedor, sino el comprador. El vendedor factura sin IVA y el comprador lo "autorrepercute": lo declara a la vez como IVA devengado y soportado. Se aplica en adquisiciones intracomunitarias, servicios recibidos de empresas extranjeras y algunas operaciones interiores como ejecuciones de obra o chatarra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién está exento de aplicar IVA en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Determinadas actividades están exentas por el art. 20 de la Ley del IVA: sanidad, educación reglada, operaciones financieras y de seguros, alquiler de vivienda habitual y servicios postales. Es una exención limitada: no se repercute IVA pero tampoco se puede deducir el IVA soportado. No debe confundirse con las exportaciones, que sí permiten deducir.',
      },
    },
  ],
};
