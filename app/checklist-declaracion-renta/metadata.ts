import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Declaración de la Renta 2026 — Documentos y Fechas | meskeIA',
  description: 'Lista de documentos para hacer la renta 2025 (ejercicio 2024). Adaptada a tu perfil: asalariado, autónomo, pensionista, inversor o arrendador. Fechas clave, deducciones y guía paso a paso.',
  keywords: 'checklist declaración renta 2026, documentos renta 2025, qué documentos necesito para la renta, fechas declaración renta, deducciones irpf, borrador renta, renta web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Declaración de la Renta 2026 | meskeIA',
    description: 'Todos los documentos que necesitas para hacer la renta, organizados por perfil: asalariado, autónomo, pensionista, inversor y propietario.',
    url: 'https://meskeia.com/checklist-declaracion-renta/',
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
    title: 'Checklist Declaración Renta 2026 | meskeIA',
    description: 'Todos los documentos que necesitas para la renta, por perfil. Asalariado, autónomo, pensionista, inversor, arrendador.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Checklist Declaración de la Renta 2026",
  description: "Lista de documentos para hacer la renta 2025 (ejercicio 2024). Adaptada a tu perfil: asalariado, autónomo, pensionista, inversor o arrendador. Fechas clave, deducciones y guía paso a paso.",
  url: "https://meskeia.com/checklist-declaracion-renta/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué documentos necesito para hacer la declaración de la Renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los documentos básicos para cualquier perfil son el DNI o NIE, los datos bancarios de la cuenta donde quieres recibir la devolución o realizar el pago, y el número de referencia o Cl@ve PIN para acceder a Renta WEB. Según tu situación, necesitarás además: el certificado de retenciones de tu empresa (asalariados), los libros de ingresos y gastos (autónomos), los estados de posición de cuentas e inversiones (inversores), o los contratos y recibos de alquiler (arrendadores).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo obtengo el borrador de la Renta 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El borrador de la Renta se obtiene accediendo a Renta WEB en la sede electrónica de la Agencia Tributaria (agenciatributaria.gob.es) con Cl@ve PIN, certificado electrónico, DNI electrónico o el número de referencia que te proporciona la propia AEAT. La AEAT cruza datos de pagadores, bancos y administraciones, pero no incluye automáticamente todas las deducciones ni ingresos que no le hayan sido comunicados, por lo que conviene revisar el borrador antes de confirmarlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué deducciones puedo aplicarme en la Renta como asalariado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los trabajadores por cuenta ajena pueden aplicar, entre otras: la reducción por rendimientos del trabajo (hasta 7.302 € según nivel de ingresos), la deducción por inversión en vivienda habitual si adquirieron antes de 2013, la deducción por maternidad (hasta 1.200 € por hijo menor de 3 años), las deducciones por familia numerosa o discapacidad, y las deducciones autonómicas variables según comunidad de residencia. Es recomendable revisar las deducciones disponibles en tu comunidad autónoma, ya que pueden suponer varios cientos de euros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene hacer la declaración conjunta en lugar de individual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La declaración conjunta puede resultar ventajosa para matrimonios o parejas de hecho legalmente reconocidas donde uno de los cónyuges no tiene ingresos o los tiene muy reducidos, ya que permite aplicar una reducción adicional de 3.400 € sobre la base imponible. Sin embargo, cuando ambos miembros tienen ingresos similares, suele ser más conveniente la declaración individual. El simulador de la AEAT permite comparar ambas opciones antes de decidir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué documentos necesita un autónomo para hacer la Renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un trabajador autónomo en estimación directa debe reunir: el libro de facturas emitidas y recibidas, el libro de bienes de inversión si tiene inmovilizado amortizable, los justificantes de gastos deducibles (suministros, material, cuotas de autónomo, seguros profesionales, etc.), los modelos trimestrales presentados (130 o 131) y los certificados de retenciones si algún cliente le practicó retención del 15%. Si cotizó en el régimen de estimación objetiva (módulos), necesitará el resumen anual del modelo 131.',
      },
    },
  ],
};
