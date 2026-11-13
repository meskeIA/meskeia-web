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

// La pregunta está también en la FAQ visible («¿Cuánto tiempo debo conservar las facturas?»): una sola
// respuesta para las dos (check:faq-unica, C0570, 13/11/2026). El JSON-LD callaba los 6 años del Código
// de Comercio y atribuía los 10 años al Impuesto sobre Sociedades «si hay activos amortizables»; la
// visible callaba los 10. Cotejado en el BOE el 13/11/2026: LGT art. 66 (prescripción, cuatro años),
// art. 66 bis.2 (comprobar bases o cuotas compensadas o pendientes y deducciones pendientes, diez años)
// y Código de Comercio art. 30.1 (seis años a partir del último asiento realizado en los libros).
export const RESPUESTA_FAQ_CONSERVAR_FACTURAS =
  'En España, como mínimo 4 años, que es el plazo de prescripción tributaria de la Ley General Tributaria (art. 66). El Código de Comercio (art. 30) obliga además a los empresarios a conservar la documentación y los justificantes de su negocio durante 6 años desde el último asiento de los libros, así que la recomendación práctica es guardarlas 6 años. Si una factura sirve para justificar bases imponibles negativas, cuotas pendientes de compensar o deducciones pendientes de aplicar, la Administración puede comprobarlas durante 10 años (art. 66 bis de la LGT), así que conviene conservarla hasta entonces. Guarda siempre tanto la factura como el justificante de pago.';

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
        text: RESPUESTA_FAQ_CONSERVAR_FACTURAS,
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
