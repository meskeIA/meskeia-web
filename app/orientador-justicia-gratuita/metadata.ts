import { Metadata } from 'next';

const title = 'Orientador de Justicia Gratuita 2026 — ¿Tienes derecho a abogado gratis? | meskeIA';
const description = 'Comprueba si cumples los requisitos para acceder a justicia gratuita en España. Test según ingresos, IPREM 2026, situación familiar y prestaciones cubiertas.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'justicia gratuita españa requisitos, abogado gratis, abogado de oficio requisitos, IPREM justicia gratuita 2026, como pedir justicia gratuita, turno de oficio, asistencia juridica gratuita',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Justicia Gratuita 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/orientador-justicia-gratuita/',
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
    title: 'Orientador de Justicia Gratuita 2026 | meskeIA',
    description: 'Test: ¿tienes derecho a abogado y procurador de oficio en España?',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Orientador de Justicia Gratuita 2026',
  description,
  url: 'https://meskeia.com/orientador-justicia-gratuita/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la justicia gratuita y qué cubre en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La justicia gratuita es el derecho a obtener asistencia jurídica sin coste para quienes carecen de recursos económicos suficientes, regulado por la Ley 1/1996. Cubre la designación de abogado y procurador de oficio, la exención de tasas judiciales, la obtención gratuita de copias y certificados del proceso, los honorarios de peritos y, en algunos casos, la inserción de anuncios en diarios oficiales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos de ingresos para acceder a justicia gratuita en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con carácter general, se reconoce el derecho a justicia gratuita cuando los ingresos brutos anuales del solicitante y su unidad familiar no superen el doble del IPREM (para personas solas) o el triple del IPREM para familias. El IPREM para 2026 es de 600,53 € al mes (7.200,60 € anuales). Existen umbrales ampliados (hasta cuatro veces el IPREM) para víctimas de violencia de género, trata de personas y personas con discapacidad reconocida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se solicita el abogado de oficio o el turno de oficio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La solicitud se presenta ante el Colegio de Abogados del lugar donde se va a tramitar el procedimiento, mediante el formulario oficial de la Comisión de Asistencia Jurídica Gratuita. Hay que aportar documentación acreditativa de ingresos (declaración de IRPF, certificado del SEPE, vida laboral, etc.). El reconocimiento puede ser provisional mientras se tramita la solicitud, para que el proceso no quede paralizado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La justicia gratuita cubre también el turno de guardia en comisaría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La asistencia letrada al detenido en dependencias policiales o ante el juzgado de guardia está cubierta por el servicio de guardia de los Colegios de Abogados, con independencia del nivel económico del detenido. Este servicio es gratuito para todos, ya que el objetivo es garantizar el derecho a no declarar sin asistencia letrada recogido en la Constitución. Si posteriormente no se acreditan recursos insuficientes, pueden repercutirse los honorarios al asistido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo elegir abogado si tengo justicia gratuita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No libremente. Con justicia gratuita, el abogado te es asignado por el Colegio de Abogados entre los letrados inscritos en el turno de oficio. Sin embargo, puedes designar un abogado de tu confianza inscrito en dicho turno y solicitar que se le encargue tu defensa, aunque la aceptación queda a criterio del letrado y del Colegio. El abogado de oficio asignado tiene los mismos deberes deontológicos y de diligencia que cualquier abogado de libre elección.',
      },
    },
  ],
};
