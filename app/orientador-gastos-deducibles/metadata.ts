import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Gastos Deducibles Autónomos - Ahorro IRPF e IVA | meskeIA',
  description: 'Calcula tu ahorro fiscal con gastos deducibles como autónomo. Descubre qué puedes deducir (100%, 50%, 30%) y optimiza tu declaración de IRPF e IVA. Actualizado 2025.',
  keywords: 'gastos deducibles, autonomo, irpf, iva, ahorro fiscal, deduccion, hacienda, autonomos españa, impuestos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Gastos Deducibles Autónomos | meskeIA',
    description: 'Descubre qué gastos puedes deducir como autónomo y calcula tu ahorro fiscal real en IRPF e IVA.',
    url: 'https://meskeia.com/orientador-gastos-deducibles/',
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
    title: 'Orientador Gastos Deducibles Autónomos | meskeIA',
    description: 'Herramienta gratuita para calcular el ahorro fiscal de autónomos con gastos deducibles.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador de Gastos Deducibles",
  description: "Calcula tu ahorro fiscal con gastos deducibles como autónomo. Descubre qué puedes deducir (100%, 50%, 30%) y optimiza tu declaración de IRPF e IVA. Actualizado 2025.",
  url: "https://meskeia.com/orientador-gastos-deducibles/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué gastos puede deducirse un autónomo en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un autónomo puede deducir todos los gastos necesarios para la actividad económica: cuotas de la Seguridad Social, suministros del local de trabajo (al 100%), dietas y desplazamientos profesionales, seguros relacionados con la actividad y amortizaciones de equipos. La deducción puede ser del 100%, 50% o 30% según el grado de afectación a la actividad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo deducir el móvil y el ordenador como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, pero con matices. El ordenador o móvil afectado exclusivamente a la actividad profesional es deducible al 100%. Si también se usa de forma privada, Hacienda admite normalmente una deducción del 50%. Es recomendable conservar facturas y poder justificar el uso profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje del alquiler puede deducir un autónomo que trabaja desde casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El autónomo que trabaja desde casa puede deducir el 30% de los gastos de suministros (luz, agua, internet, gas) proporcionales a la parte del domicilio afecta a la actividad. Para el alquiler de la vivienda habitual, la deducción es más limitada y requiere que el inmueble esté dado de alta en el IAE como local afecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son deducibles las dietas y comidas de negocios para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las dietas en desplazamientos por trabajo son deducibles con límites: 26,67 €/día en España y 48,08 €/día en el extranjero si no se pernocta, el doble si hay pernoctación. Las comidas de negocios son deducibles al 100% si están justificadas (factura con nombres de los asistentes y propósito comercial) y se realizan en establecimientos de restauración.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre gastos deducibles en IRPF e IVA para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En IRPF se deducen los gastos que reducen el rendimiento neto (base imponible), mientras que en IVA se recupera el impuesto soportado en las compras afectas a la actividad. No todos los gastos deducibles en IRPF generan IVA deducible: por ejemplo, las nóminas o la Seguridad Social no llevan IVA. La afectación a la actividad debe ser la misma en ambos impuestos.',
      },
    },
  ],
};
