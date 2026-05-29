import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector Régimen Fiscal Autónomo | ¿Módulos, Directa o SL? | meskeIA',
  description: 'Test de 10 preguntas para orientarte sobre qué régimen fiscal puede encajar mejor con tu actividad como autónomo: estimación objetiva (módulos), directa simplificada, directa normal o constituir una SL.',
  keywords: [
    'régimen fiscal autónomo España',
    'módulos o estimación directa',
    'estimación directa simplificada',
    'autónomo sociedad limitada',
    'qué régimen tributario autónomo',
    'IRPF autónomo España',
    'cuando constituir SL autónomo',
    'fiscalidad autónomo España',
    'módulos autónomo ventajas',
    'estimación objetiva autónomos',
  ],
  openGraph: {
    title: 'Selector Régimen Fiscal Autónomo — ¿Módulos, Directa o SL?',
    description: 'Orientación sobre qué régimen fiscal puede encajar mejor con tu actividad en 10 preguntas.',
    url: 'https://meskeia.com/selector-regimen-fiscal-autonomo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector Régimen Fiscal Autónomo",
  description: "Test de 10 preguntas para orientarte sobre qué régimen fiscal puede encajar mejor con tu actividad como autónomo: estimación objetiva (módulos), directa simplificada, directa normal o constituir una S",
  url: "https://meskeia.com/selector-regimen-fiscal-autonomo/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre módulos y estimación directa para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En estimación objetiva (módulos) el rendimiento se calcula mediante parámetros fijos fijados por Hacienda (personal empleado, superficie, potencia eléctrica…), independientemente de los ingresos y gastos reales. En estimación directa, el rendimiento se calcula como ingresos menos gastos deducibles reales. Los módulos dan previsibilidad fiscal pero pueden ser perjudiciales si el negocio tiene pocos gastos o si los ingresos son muy variables.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué autónomos pueden acogerse a módulos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para poder tributar en módulos, la actividad debe estar incluida en la Orden Ministerial anual que los regula (hostelería, comercio minorista, transporte, construcción, entre otras), el volumen de ingresos del año anterior no puede superar 250.000 € (150.000 € si hay operaciones con empresas) y el volumen de compras no debe superar 250.000 €. Además, la actividad no puede realizarse fuera del ámbito de aplicación del sistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene constituir una Sociedad Limitada en lugar de seguir como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Crear una SL suele ser ventajoso cuando el beneficio neto supera aproximadamente 40.000-50.000 € anuales, ya que el Impuesto de Sociedades (25%) puede resultar inferior al IRPF marginal que pagaría un autónomo persona física. También es recomendable cuando hay varios socios, se quiere limitar la responsabilidad patrimonial personal o se necesita atraer inversores. La SL implica más costes de gestión (asesoría, auditoría en ciertos casos, depósito de cuentas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la estimación directa simplificada y en qué se diferencia de la normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estimación directa simplificada aplica a autónomos con cifra de negocio inferior a 600.000 € y que no hayan renunciado a ella. Su principal ventaja es que permite deducir las amortizaciones mediante tablas simplificadas y aplicar una deducción del 5% en concepto de gastos de difícil justificación. La estimación directa normal no tiene límite de ingresos y exige una contabilidad más rigurosa ajustada al Código de Comercio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo cambiar de régimen fiscal como autónomo cada año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, pero con restricciones. La renuncia o exclusión de módulos supone quedar en estimación directa durante al menos tres años. Lo mismo aplica al cambio entre estimación directa simplificada y normal. Las opciones se ejercen en el mes de diciembre del año anterior o al inicio de la actividad. Es recomendable consultar con un asesor fiscal antes de cambiar de régimen para valorar el impacto en la carga tributaria total.',
      },
    },
  ],
};
