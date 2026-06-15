import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador Trimestral para Autónomos | meskeIA',
  description:
    'Planifica tus 4 trimestres: ingresos, gastos, fechas de modelos fiscales y meses críticos. Vista anual con semáforo de cumplimiento.',
  keywords:
    'planificador trimestral, autónomo, modelo 303, modelo 130, trimestres fiscales, freelance España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador Trimestral para Autónomos | meskeIA',
    description:
      'Planifica tus 4 trimestres fiscales como autónomo en España. Ingresos, gastos, modelos 303/130 y alertas de meses críticos.',
    url: 'https://meskeia.com/planificador-trimestres-freelance/',
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
    title: 'Planificador Trimestral para Autónomos | meskeIA',
    description:
      'Planifica tus 4 trimestres fiscales: ingresos, gastos, fechas de modelos y meses críticos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Trimestral meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador Trimestral para Autónomos',
  description:
    'Planificador visual de los 4 trimestres del año para autónomos españoles. Muestra ingresos, gastos, fechas de presentación de modelos fiscales (303, 130, 390, 190) y alertas de meses críticos como agosto y diciembre.',
  url: 'https://meskeia.com/planificador-trimestres-freelance/',
  category: 'BusinessApplication',
  features: [
    'Vista anual con 12 meses y semáforo de cumplimiento por trimestre',
    'Fechas de presentación de modelos fiscales (303, 130, 390, 190)',
    'Alertas de meses críticos: agosto y diciembre',
    'Reparto equitativo de objetivos con un clic',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve un planificador trimestral como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un planificador trimestral ayuda a los autónomos a tener una visión global del año fiscal: cuándo presentar los modelos 303 (IVA), 130 (IRPF fraccionado), 390 y 190, y cuánto dinero reservar en cada trimestre. Permite anticipar meses de mayor carga fiscal como enero, abril, julio y octubre, y evitar sorpresas de tesorería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay que presentar el modelo 303 y el modelo 130?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los modelos 303 (IVA) y 130 (pago fraccionado de IRPF) se presentan trimestralmente: entre el 1 y el 20 de abril, julio y octubre, y entre el 1 y el 30 de enero para el cuarto trimestre. El mes de agosto es crítico porque el tercer trimestre vence el 20 de octubre, coincidiendo con el fin del verano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué diciembre y agosto son meses críticos para un autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Agosto y diciembre son meses de menor actividad comercial para muchos autónomos, pero con obligaciones fiscales próximas. En agosto hay que preparar el tercer trimestre (modelo 303/130 que vence en octubre). En diciembre termina el año fiscal: hay que revisar si el IRPF fraccionado cubre la facturación real y prever la declaración de enero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debo reservar de mis ingresos para los impuestos como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación habitual es reservar entre el 25 % y el 35 % de cada ingreso bruto para cubrir IRPF e IVA. El porcentaje exacto depende de tu tramo de IRPF estimado y del tipo de IVA aplicable a tus servicios. El planificador trimestral permite introducir tus objetivos de ingresos y gastos por trimestre para calcular las reservas necesarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el modelo 130 y el modelo 131 para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo 130 es el pago fraccionado de IRPF para autónomos en estimación directa (normal o simplificada). El modelo 131 corresponde a autónomos en estimación objetiva (módulos). La mayoría de los freelancers y autónomos de servicios utilizan el modelo 130, calculando el 20 % del beneficio neto acumulado en el trimestre menos los pagos ya realizados.',
      },
    },
  ],
};
