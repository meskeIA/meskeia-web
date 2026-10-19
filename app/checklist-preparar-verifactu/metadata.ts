import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist VeriFactu — Prepara tu Negocio para la Facturación Electrónica | meskeIA',
  description: 'Checklist interactivo para preparar tu negocio para VeriFactu (obligatorio en 2027). Requisitos, plazos, software adaptado y sanciones.',
  keywords: 'verifactu, facturación electrónica, factura electrónica España, checklist verifactu, autónomo verifactu, obligaciones fiscales 2027, RD 1007/2023',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist VeriFactu — Facturación Electrónica 2027 | meskeIA',
    description: 'Prepara tu negocio para VeriFactu: requisitos técnicos, software adaptado, formatos de factura, plazos y sanciones.',
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
  description: 'Checklist interactivo para preparar tu negocio para VeriFactu, los requisitos del software de facturación obligatorios en España antes de enero de 2027 para las sociedades y antes de julio de 2027 para los autónomos. Cubre requisitos técnicos, software adaptado, formatos de factura, plazos y sanciones.',
  url: 'https://meskeia.com/checklist-preparar-verifactu/',
  features: [
    'Checklist de 14 puntos organizados en 4 secciones',
    'Progreso guardado automáticamente en el navegador',
    'Información detallada sobre cada requisito VeriFactu',
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
        text: 'VeriFactu es el sistema de facturación electrónica verificable regulado por el Real Decreto 1007/2023. Obliga a los autónomos y empresas sujetos al IRPF o IS a usar un software de facturación adaptado al reglamento, que el fabricante acredita con una declaración responsable (no hay homologación de la AEAT). Las sociedades deben tenerlo antes del 1 de enero de 2027 y el resto, autónomos incluidos, antes del 1 de julio de 2027 (disposición final 4.ª, en la redacción del RDL 15/2025).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sanciones hay por no cumplir con VeriFactu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El incumplimiento puede acarrear multas de hasta 50.000 € por ejercicio, con infracciones graves si el software utilizado no cumple los requisitos del reglamento o si se altera el registro de facturas. Además, la falta de trazabilidad puede derivar en inspecciones tributarias por incoherencias contables.',
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
      name: '¿Cómo sé si mi software de facturación cumple VeriFactu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No hay homologación de la AEAT: el fabricante declara bajo su responsabilidad que el programa cumple el reglamento, y esa declaración responsable debe constar por escrito y a la vista en el propio programa (art. 13 del RD 1007/2023). Pídesela a tu proveedor, o la fecha en que la tendrá, antes de tu fecha límite: el 1 de enero de 2027 si eres una sociedad y el 1 de julio de 2027 si eres autónomo.',
      },
    },
  ],
};
