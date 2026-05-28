import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Facturas - Crea Facturas Profesionales Gratis | meskeIA',
  description: 'Genera facturas profesionales para autónomos y pequeñas empresas. IVA automático (21%, 10%, 4%), retención IRPF, múltiples líneas, exporta a PDF. Gratis y sin registro.',
  keywords: 'factura, generador facturas, autonomo, facturar, iva, irpf, pdf, plantilla factura, factura gratis, pequeña empresa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Facturas - meskeIA',
    description: 'Crea facturas profesionales gratis con IVA automático y exportación a PDF',
    url: 'https://meskeia.com/generador-facturas/',
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
    title: 'Generador de Facturas - meskeIA',
    description: 'Genera facturas profesionales para autónomos. Gratis y sin registro',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Facturas",
  description: "Genera facturas profesionales para autónomos y pequeñas empresas. IVA automático (21%, 10%, 4%), retención IRPF, múltiples líneas, exporta a PDF. Gratis y sin registro.",
  url: "https://meskeia.com/generador-facturas/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué debe incluir una factura para ser válida legalmente en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una factura válida en España debe incluir número de factura correlativo, fecha de emisión, datos completos del emisor y receptor (nombre, dirección y NIF), descripción de los servicios o bienes, base imponible, tipo de IVA aplicado y cuota resultante. En el caso de autónomos que facturan a empresas, también es habitual incluir la retención de IRPF (normalmente el 15%, o el 7% en los primeros tres años de actividad).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el IVA en una factura de autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IVA se calcula aplicando el tipo correspondiente sobre la base imponible. En España existen tres tipos principales: el 21% general (servicios y productos estándar), el 10% reducido (hostelería, construcción, algunos alimentos) y el 4% superreducido (libros, medicamentos, alimentos básicos). El total a pagar por el cliente es la suma de la base imponible más la cuota de IVA, menos la retención de IRPF si aplica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo descargar la factura en PDF de forma gratuita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el generador permite exportar la factura completa en formato PDF sin coste alguno y sin necesidad de crear una cuenta. Una vez completados los datos del emisor, receptor y las líneas de concepto, puedes descargar el documento directamente desde el navegador con un solo clic.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo debo conservar las facturas emitidas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España la normativa fiscal obliga a conservar las facturas durante un mínimo de 4 años, que es el plazo de prescripción tributaria general. Sin embargo, para el Impuesto de Sociedades el plazo puede extenderse hasta 10 años si las facturas están relacionadas con activos amortizables. Se recomienda guardar siempre tanto la factura original como el justificante de pago.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una factura ordinaria y una factura simplificada (ticket)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La factura ordinaria incluye todos los datos del cliente y permite deducir el IVA soportado, por lo que es obligatoria cuando el destinatario es una empresa o autónomo. La factura simplificada (equivalente al antiguo ticket) solo es válida para operaciones con consumidores finales hasta 400 € (o 3.000 € en determinados sectores) y no permite al receptor deducir el IVA. Para cualquier operación entre profesionales siempre se debe emitir factura ordinaria completa.',
      },
    },
  ],
};
