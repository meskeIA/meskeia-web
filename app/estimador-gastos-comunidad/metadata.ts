import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Gastos de Comunidad - Reparto por Cuotas | meskeIA',
  description: 'Calcula y reparte los gastos de la comunidad de propietarios: cuota mensual, derramas, reparto por coeficiente o partes iguales. Gestiona los presupuestos de tu comunidad.',
  keywords: 'gastos comunidad, cuota comunidad, derrama comunidad, comunidad propietarios, reparto gastos, coeficiente participacion, presupuesto comunidad, vecinos gastos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Gastos de Comunidad - meskeIA',
    description: 'Reparte los gastos de tu comunidad de propietarios de forma justa y transparente',
    url: 'https://meskeia.com/estimador-gastos-comunidad/',
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
    title: 'Estimador Gastos de Comunidad - meskeIA',
    description: 'Calcula cuánto paga cada vecino según coeficiente o partes iguales',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Gastos de Comunidad",
  description: "Calcula y reparte los gastos de la comunidad de propietarios: cuota mensual, derramas, reparto por coeficiente o partes iguales. Gestiona los presupuestos de tu comunidad.",
  url: "https://meskeia.com/estimador-gastos-comunidad/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calculan los gastos de comunidad de propietarios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los gastos de comunidad se calculan sumando todos los gastos comunes del edificio (limpieza, mantenimiento, seguro, suministros, administrador...) y repartiendo el total entre los propietarios. El reparto puede hacerse a partes iguales o según el coeficiente de participación de cada vivienda, que está fijado en la escritura de división horizontal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el coeficiente de participación en una comunidad de vecinos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coeficiente de participación es un porcentaje asignado a cada piso o local que refleja su proporción en el total del edificio. Lo determina el promotor en la escritura de división horizontal y tiene en cuenta la superficie útil, la altura y la ubicación del inmueble. Se usa para calcular cuánto paga cada propietario en las derramas y, generalmente, también en la cuota ordinaria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una cuota ordinaria y una derrama?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota ordinaria es el pago periódico (mensual o trimestral) que cubre los gastos habituales del edificio. La derrama es un cobro extraordinario aprobado en junta para hacer frente a un gasto puntual no previsto en el presupuesto ordinario, como una reparación de la fachada o la instalación de un ascensor. Las derramas superiores a tres mensualidades ordinarias requieren acuerdo de la junta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede un propietario negarse a pagar los gastos de comunidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Según la Ley de Propiedad Horizontal (art. 9), todos los propietarios están obligados a contribuir a los gastos generales. El impago puede dar lugar a un procedimiento monitorio o a la privación del derecho de voto en la junta si la deuda es vigente. Además, la deuda puede quedar afecta al piso, afectando a futuros compradores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto suelen costar los gastos de comunidad en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El importe varía mucho según el tamaño y los servicios del edificio. En un bloque de viviendas sin portero ni piscina, la cuota media se sitúa entre 30 y 80 € al mes por vivienda. En urbanizaciones con piscina, jardín y conserjería, puede superar los 150-200 €. La mejor forma de conocer el importe exacto es revisar el presupuesto anual aprobado en junta y dividirlo entre los coeficientes de participación.',
      },
    },
  ],
};
