import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estructura de Costes del Autónomo - Explicador Visual | meskeIA',
  description: 'Visualiza cómo se descomponen los ingresos de un autónomo español: cuota RETA, IVA, IRPF, gastos profesionales y neto real. Cascada interactiva con sliders.',
  keywords: 'autónomo, costes autónomo, cuota RETA, IVA, IRPF, gastos profesionales, neto autónomo, freelance España, estructura costes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estructura de Costes del Autónomo - Explicador Visual',
    description: 'De lo que facturas a lo que te queda: visualiza cada euro como autónomo. IVA, RETA, IRPF, gastos y neto real.',
    url: 'https://meskeia.com/visualizador-estructura-costes-autonomo/',
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
    title: 'Estructura de Costes del Autónomo - Explicador Visual',
    description: 'De lo que facturas a lo que te queda: cascada interactiva con IVA, RETA, IRPF y gastos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Estructura Costes Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estructura de Costes del Autónomo',
  description: 'Explicador visual interactivo que muestra cómo se descomponen los ingresos brutos de un autónomo español: IVA repercutido, cuota RETA, IRPF estimado, gastos profesionales y neto real. Cascada con sliders.',
  url: 'https://meskeia.com/visualizador-estructura-costes-autonomo/',
  features: [
    'Cascada waterfall interactiva de ingresos a neto',
    'Sliders para ajustar facturación y gastos en tiempo real',
    'Desglose visual: IVA, RETA, IRPF, gastos profesionales y personales',
    'Bloques expandibles con explicaciones detalladas',
    'Resumen "de cada 100 € facturados, te quedan X €"',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se queda realmente un autónomo de lo que factura en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la facturación, el tipo de IRPF y los gastos deducibles, pero como orientación general: de cada 100 € facturados, el autónomo debe apartar en torno al 21 % de IVA (que no es suyo), pagar la cuota RETA (entre 200 y 590 € mensuales según ingresos reales desde 2023), retener el IRPF a cuenta y cubrir gastos profesionales. En muchos casos el neto disponible ronda el 40-55 % de lo facturado, pero puede variar significativamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cuota RETA y cuánto se paga en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota RETA (Régimen Especial de Trabajadores Autónomos) es la cotización a la Seguridad Social que paga mensualmente un trabajador por cuenta propia en España. Desde 2023 el sistema es por ingresos reales: los tramos van desde 200 € al mes para rendimientos netos inferiores a 670 € hasta 590 € al mes para rendimientos superiores a 6.000 €. En 2025 los tramos y cuotas están actualizados en la normativa de la Seguridad Social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el IVA repercutido y el IVA soportado para un autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IVA repercutido es el que el autónomo cobra a sus clientes al emitir facturas (habitualmente el 21 %). El IVA soportado es el que el autónomo paga en sus compras y gastos profesionales. Cada trimestre se declara la diferencia: si el repercutido supera al soportado, se ingresa a Hacienda; si es menor, se puede compensar o solicitar devolución. El IVA no es un ingreso del autónomo, es un impuesto que actúa como recaudador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos puede deducirse un autónomo para reducir el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los gastos deducibles más habituales son: seguridad social (cuota RETA), alquiler o amortización de local afecto, suministros del hogar (hasta el 30 % de la parte proporcional si trabaja en casa), material de oficina, equipos informáticos, formación profesional, seguros relacionados con la actividad, kilometraje de vehículo si se justifica, y dietas con requisitos específicos. Es imprescindible que los gastos estén directamente vinculados a la actividad y estén correctamente documentados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el régimen de estimación directa simplificada y la estimación objetiva (módulos)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En estimación directa simplificada el rendimiento neto se calcula sobre ingresos reales menos gastos reales (con limitación del 5 % en gastos de difícil justificación). En módulos (estimación objetiva) el rendimiento se estima según parámetros fijos como personal empleado, superficie o potencia instalada, independientemente de los ingresos reales. Los módulos suelen ser ventajosos en actividades con alto volumen pero están disponibles solo para ciertos epígrafes y tienen límites de facturación.',
      },
    },
  ],
};
