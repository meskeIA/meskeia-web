import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist VeriFactu: prepara tu software de facturación para 2027 (RD 1007/2023) | meskeIA',
  description: 'Checklist interactivo para preparar tu negocio para VeriFactu (obligatorio en 2027). Requisitos, plazos, software adaptado y sanciones.',
  keywords: 'verifactu, checklist verifactu, software de facturación, sistemas informáticos de facturación, autónomo verifactu, obligaciones fiscales 2027, RD 1007/2023',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist VeriFactu: prepara tu software de facturación para 2027 (RD 1007/2023) | meskeIA',
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
    title: 'Checklist VeriFactu: prepara tu software de facturación para 2027 (RD 1007/2023) | meskeIA',
    description: 'Prepara tu software de facturación para VeriFactu (RD 1007/2023). Requisitos, plazos, software y sanciones.',
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
        text: 'VeriFactu es el nombre con que se conoce el reglamento de los sistemas informáticos de facturación, el Real Decreto 1007/2023 (no es la factura electrónica entre empresas). Obliga a los autónomos y empresas sujetos al IRPF o IS a usar un software de facturación adaptado al reglamento, que el fabricante acredita con una declaración responsable (no hay homologación de la AEAT). Las sociedades deben tenerlo antes del 1 de enero de 2027 y el resto, autónomos incluidos, antes del 1 de julio de 2027 (disposición final 4.ª, en la redacción del RDL 15/2025).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sanciones hay por no cumplir con VeriFactu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tener un programa de facturación que no cumple el reglamento, o alterado, se sanciona con una multa fija de 50.000 € por cada ejercicio (art. 201 bis de la Ley General Tributaria); no hay una sanción por cada factura. A quien fabrica o vende esos programas, 150.000 € por ejercicio y por cada tipo de programa, y 1.000 € por cada uno vendido sin la certificación exigida. La facturación fraudulenta puede ser además delito fiscal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre VeriFactu y la facturación electrónica de la Ley Crea y Crece?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son dos obligaciones distintas. La Ley Crea y Crece exige factura electrónica entre empresas (B2B) para evitar la morosidad. VeriFactu (RD 1007/2023) afecta al programa con el que se factura, también a particulares: debe generar un registro encadenado e inalterable de cada factura, que se remite a la AEAT al emitirla solo si se elige la modalidad VERI*FACTU, voluntaria; si no, se conserva firmado en el propio sistema. Pueden coexistir en el mismo software certificado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Todos los autónomos están obligados a usar VeriFactu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Están obligados los autónomos con actividades económicas en el IRPF, también en estimación objetiva (módulos), y las sociedades del Impuesto sobre Sociedades, siempre que facturen con un programa informático (art. 3.1 del RD 1007/2023). Quedan fuera quienes llevan los libros registro por el SII (art. 3.3), las entidades exentas del Impuesto sobre Sociedades y algunas operaciones concretas (art. 4). Es recomendable verificar el caso concreto con un asesor fiscal.',
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
