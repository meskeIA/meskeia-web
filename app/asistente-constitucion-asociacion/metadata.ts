import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Asistente Constitución de Asociación - Genera Acta y Estatutos | meskeIA',
  description: 'Asistente paso a paso para constituir una asociación sin ánimo de lucro en España. Genera Acta Fundacional, Estatutos y documentos necesarios para el Registro.',
  keywords: 'constituir asociacion, asociacion sin animo lucro, acta fundacional, estatutos asociacion, registro asociaciones, ley 49/2002, ong, fundadores asociacion, junta directiva',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente Constitución de Asociación - Genera Documentos',
    description: 'Constituye tu asociación sin ánimo de lucro paso a paso. Genera Acta Fundacional y Estatutos personalizados.',
    url: 'https://meskeia.com/asistente-constitucion-asociacion/',
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
    title: 'Asistente Constitución de Asociación',
    description: 'Genera todos los documentos necesarios para constituir tu asociación en España',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Asistente Constitución Asociación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Asistente Constitución Asociación",
  description: "Asistente paso a paso para constituir una asociación sin ánimo de lucro en España. Genera Acta Fundacional, Estatutos y documentos necesarios para el Registro.",
  url: "https://meskeia.com/asistente-constitucion-asociacion/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué documentos son necesarios para constituir una asociación en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para registrar una asociación se necesitan tres documentos principales: el Acta Fundacional (firmada por todos los socios fundadores), los Estatutos de la asociación y el impreso oficial de solicitud de inscripción. Además, hay que abonar una tasa administrativa y aportar copia del DNI de los firmantes. El registro se realiza ante el Registro Nacional de Asociaciones o el autonómico correspondiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos socios hacen falta mínimo para crear una asociación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Ley Orgánica 1/2002 reguladora del Derecho de Asociación exige un mínimo de tres personas físicas o jurídicas para constituir una asociación en España. No existe un máximo de socios fundadores. Todos deben firmar el Acta Fundacional y aceptar los Estatutos en el momento de la constitución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en inscribirse una asociación en el Registro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plazo legal de resolución es de tres meses desde la presentación de la solicitud completa. En la práctica, el Registro Nacional de Asociaciones suele tardar entre 4 y 8 semanas si la documentación está correcta. Los registros autonómicos tienen plazos similares, aunque pueden variar según la comunidad. Si transcurre el plazo sin respuesta, se entiende inscrita por silencio administrativo positivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene que pagar impuestos una asociación sin ánimo de lucro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las asociaciones sin ánimo de lucro están exentas de muchos impuestos, pero no de todos. Tributan por Impuesto de Sociedades solo sobre las rentas no exentas (actividades económicas ajenas a su objeto social). Si se acogen al régimen fiscal especial de la Ley 49/2002, pueden disfrutar de exenciones más amplias, incluida la exención total en IS para rentas derivadas de su objeto social. El IVA sí puede aplicar en determinadas actividades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una asociación y una fundación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La asociación se basa en la unión de personas con un fin común y su gobierno es democrático (los socios deciden). La fundación, en cambio, se constituye mediante la afectación de un patrimonio a un fin de interés general; su órgano rector es un patronato y no hay socios. Las fundaciones requieren un patrimonio fundacional mínimo (generalmente 30.000 €) y están sujetas a supervisión del Protectorado, mientras que las asociaciones no requieren capital inicial.',
      },
    },
  ],
};
