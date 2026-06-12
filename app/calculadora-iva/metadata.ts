import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de IVA Online - Calcula IVA 21%, 10%, 4% | meskeIA',
  description: 'Calculadora de IVA española gratuita. Añade o quita IVA al 21%, 10% o 4%. Calcula base imponible, cuota de IVA y total con un clic.',
  keywords: 'calculadora iva, calcular iva, quitar iva, añadir iva, iva 21, iva 10, iva 4, base imponible, impuestos españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de IVA Online - meskeIA',
    description: 'Calcula el IVA español fácilmente. Añade o quita IVA al 21%, 10% o 4%.',
    url: 'https://meskeia.com/calculadora-iva/',
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
    title: 'Calculadora de IVA Online',
    description: 'Calcula el IVA español fácilmente. Añade o quita IVA al 21%, 10% o 4%.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de IVA Online - Calcula IVA 21%, 10%, 4%",
  description: "Calculadora de IVA española gratuita. Añade o quita IVA al 21%, 10% o 4%. Calcula base imponible, cuota de IVA y total con un clic.",
  url: 'https://meskeia.com/calculadora-iva/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los tipos de IVA en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'España tiene tres tipos de IVA: el general del 21%, que aplica a la mayoría de bienes y servicios; el reducido del 10%, para alimentos sin elaborar, hostelería, transporte de viajeros y vivienda nueva; y el superreducido del 4%, para alimentos básicos como pan, leche, huevos, frutas, verduras y legumbres, así como medicamentos y libros. Existen también exenciones para servicios como educación reglada, sanidad y operaciones financieras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre añadir IVA y quitar IVA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Añadir IVA: el precio que tienes es la base imponible sin impuesto y quieres saber el precio final al consumidor. Fórmula: precio final = base × (1 + tipo). Por ejemplo: 100 € × 1,21 = 121 €. Quitar IVA: el precio que tienes ya incluye el IVA y quieres obtener la base imponible. Fórmula: base = precio con IVA / (1 + tipo). Por ejemplo: 121 € / 1,21 = 100 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la base imponible de una factura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base imponible es el precio del bien o servicio antes de impuestos. Sobre ella se aplica el tipo de IVA para obtener la cuota tributaria. La suma de ambas es el total de la factura. Por ejemplo: base 500 € + IVA 21% (105 €) = total 605 €. En facturas simplificadas o tickets, el total ya incluye el IVA y hay que dividir para obtener la base.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué bienes y servicios tienen IVA al 10%?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo reducido del 10% aplica a: alimentos no básicos como carne, pescado, aceite y pasta; bebidas no alcohólicas; hostelería y restauración; transporte de viajeros; vivienda nueva o rehabilitación de uso residencial; flores y plantas ornamentales; espectáculos en directo y entradas a museos y zoológicos; y servicios de asistencia sanitaria no exenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Están los autónomos y empresas obligados a cobrar IVA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general sí, cuando realizan actividades empresariales o profesionales sujetas y no exentas de IVA. El autónomo repercute el IVA en sus facturas, lo declara trimestralmente con el modelo 303 y puede deducir el IVA soportado en sus gastos de actividad. Algunas actividades están exentas como la medicina, la enseñanza, los seguros y las operaciones financieras, y no repercuten ni deducen IVA.',
      },
    },
  ],
};
