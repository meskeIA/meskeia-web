import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calendario Fiscal del Emprendedor - Fechas y Modelos Tributarios | meskeIA',
  description: 'Calendario fiscal 2026 para autónomos y sociedades en España. Fechas límite de declaraciones, modelos tributarios (303, 130, 111, 200), recordatorios y estimador de pagos.',
  keywords: 'calendario fiscal, fechas declaraciones, modelo 303, modelo 130, modelo 111, modelo 200, IVA trimestral, IRPF, impuesto sociedades, autónomo, pyme, obligaciones fiscales, hacienda, AEAT, plazos tributarios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calendario Fiscal del Emprendedor - meskeIA',
    description: 'Calendario fiscal completo para autónomos y sociedades. Fechas límite, modelos tributarios y recordatorios.',
    url: 'https://meskeia.com/calendario-fiscal-emprendedor/',
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
    title: 'Calendario Fiscal del Emprendedor - meskeIA',
    description: 'Todas las fechas fiscales para autónomos y sociedades en España. No te pierdas ninguna declaración.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calendario Fiscal meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calendario Fiscal Emprendedor",
  description: "Calendario fiscal 2025 para autónomos y sociedades en España. Fechas límite de declaraciones, modelos tributarios (303, 130, 111, 200), recordatorios y estimador de pagos.",
  url: "https://meskeia.com/calendario-fiscal-emprendedor/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo hay que presentar el IVA trimestral en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo 303 de IVA trimestral se presenta cuatro veces al año: del 1 al 20 de abril (1T), del 1 al 20 de julio (2T), del 1 al 20 de octubre (3T) y del 1 al 30 de enero del año siguiente (4T y resumen anual modelo 390). Si el día 20 cae en festivo o fin de semana, el plazo se amplía al siguiente día hábil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué modelos fiscales debe presentar un autónomo cada trimestre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un autónomo en estimación directa debe presentar habitualmente el modelo 303 (IVA), el modelo 130 (pago fraccionado IRPF) y, si tiene empleados, el modelo 111 (retenciones de nóminas) y el modelo 115 (retenciones de alquiler si aplica). En estimación objetiva (módulos) se sustituye el 130 por el modelo 131.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si me olvido de presentar una declaración fiscal a tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Presentar fuera de plazo sin requerimiento previo de Hacienda genera un recargo por declaración extemporánea: 1% más 1% por cada mes completo de retraso hasta 12 meses, y a partir del año el recargo es del 15% más intereses de demora. Si Hacienda requiere primero, se aplica sanción formal que puede llegar al 50%-150% de la cuota. Conviene regularizar lo antes posible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el modelo 130 y el modelo 131 para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo 130 corresponde al pago fraccionado de IRPF en estimación directa (normal o simplificada): se calcula sobre el rendimiento neto real acumulado del año. El modelo 131 es para autónomos en estimación objetiva (módulos): el pago se calcula sobre índices fijos según la actividad, independientemente del beneficio real obtenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tienen las sociedades las mismas fechas fiscales que los autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las sociedades comparten el IVA trimestral (modelo 303) y las retenciones (modelos 111 y 115) con los autónomos. Sin embargo, en lugar del IRPF presentan el Impuesto sobre Sociedades (modelo 200) una vez al año, en los 25 días naturales siguientes a los 6 meses del cierre del ejercicio —normalmente del 1 al 25 de julio para ejercicios cerrados en diciembre—. También deben presentar pagos fraccionados (modelo 202) en abril, octubre y diciembre.',
      },
    },
  ],
};
