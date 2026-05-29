import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist VeriFactu — Prepara tu Negocio para la Facturación Electrónica | meskeIA',
  description: 'Checklist interactivo para preparar tu negocio para VeriFactu (facturación electrónica obligatoria en 2027). Requisitos, plazos, software certificado y sanciones.',
  keywords: 'verifactu, facturación electrónica, factura electrónica España, checklist verifactu, autónomo verifactu, obligaciones fiscales 2027, RD 1007/2023',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist VeriFactu — Facturación Electrónica 2027 | meskeIA',
    description: 'Prepara tu negocio para VeriFactu: requisitos técnicos, software certificado, formatos de factura, plazos y sanciones.',
    url: 'https://meskeia.com/checklist-preparar-verifactu/',
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
    title: 'Checklist VeriFactu 2027 | meskeIA',
    description: 'Prepara tu negocio para la facturación electrónica obligatoria. Requisitos, plazos, software y sanciones.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Checklist VeriFactu meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist VeriFactu — Prepara tu Negocio',
  description: 'Checklist interactivo para preparar tu negocio para VeriFactu, el sistema de facturación electrónica obligatorio en España desde enero 2027. Cubre requisitos técnicos, software certificado, formatos de factura, plazos y sanciones.',
  url: 'https://meskeia.com/checklist-preparar-verifactu/',
  features: [
    'Checklist de 14 puntos organizados en 4 secciones',
    'Progreso guardado automáticamente en el navegador',
    'Información detallada sobre cada requisito VeriFactu',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es VeriFactu y cuándo es obligatorio en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VeriFactu es el sistema de facturación electrónica verificable regulado por el Real Decreto 1007/2023. Obliga a los autónomos y empresas sujetos al IRPF o IS a usar software certificado que registre y envíe en tiempo real cada factura a la Agencia Tributaria. La entrada en vigor está prevista para enero de 2027 para la mayoría de empresas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sanciones hay por no cumplir con VeriFactu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El incumplimiento puede acarrear multas de hasta 50.000 € por ejercicio, con infracciones graves si el software utilizado no está homologado por la AEAT o si se altera el registro de facturas. Además, la falta de trazabilidad puede derivar en inspecciones tributarias por incoherencias contables.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre VeriFactu y la facturación electrónica de la Ley Crea y Crece?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son dos obligaciones distintas. La Ley Crea y Crece exige factura electrónica entre empresas (B2B) para evitar la morosidad. VeriFactu (RD 1007/2023) afecta al software contable y obliga a enviar registros de facturas a la AEAT en tiempo real, incluyendo también operaciones con particulares. Pueden coexistir en el mismo software certificado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Todos los autónomos están obligados a usar VeriFactu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Están obligados los autónomos en estimación directa (IRPF) y las sociedades sujetas al Impuesto sobre Sociedades que usen software de facturación. Quedan excluidos quienes tributan en módulos (estimación objetiva), así como determinadas operaciones exentas. Es recomendable verificar el caso concreto con un asesor fiscal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi software de facturación está certificado para VeriFactu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La AEAT publicará el registro oficial de software certificado. Mientras tanto, debes preguntar directamente a tu proveedor si tiene o prevé obtener la homologación VeriFactu antes de enero de 2027. Los programas deben generar el fichero de registro de facturas en el formato técnico exigido y disponer de firma electrónica cualificada.',
      },
    },
  ],
};
