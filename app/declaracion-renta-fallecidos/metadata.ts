import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Declaración de la Renta de Persona Fallecida - Guía para Herederos | meskeIA',
  description: 'Guía interactiva para herederos: cómo presentar la declaración IRPF de una persona fallecida, documentación necesaria, plazos y solicitud de devolución.',
  keywords: 'renta fallecido, IRPF fallecido, declaración renta persona fallecida, herederos renta, modelo H-100, devolución herederos, campaña renta fallecido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Declaración de la Renta de Persona Fallecida | meskeIA',
    description: 'Guía paso a paso para herederos: obligación de declarar, acceso al borrador, documentación y devoluciones.',
    url: 'https://meskeia.com/declaracion-renta-fallecidos/',
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
    title: 'Declaración Renta Fallecidos - Guía Herederos | meskeIA',
    description: 'Todo lo que necesitas saber para presentar la declaración IRPF de una persona fallecida en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Declaración Renta Fallecidos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Declaración de la Renta de Persona Fallecida',
  description: 'Guía interactiva para herederos que deben presentar la declaración de IRPF de una persona fallecida. Verifica la obligación de declarar, indica la documentación necesaria según el importe de la devolución y guía paso a paso en el proceso completo.',
  url: 'https://meskeia.com/declaracion-renta-fallecidos/',
  features: [
    'Verificador de obligación de declarar del fallecido',
    'Guía paso a paso para acceder al borrador como heredero',
    'Checklist de documentación según importe de devolución',
    'Información sobre Modelo H-100 y procedimiento de devolución',
    'Casos especiales: fallecimiento 31/dic, varios herederos, renuncia',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Quién está obligado a presentar la declaración de la renta de una persona fallecida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los herederos están obligados a presentar la declaración del IRPF del fallecido si este hubiera tenido obligación de declararla. La obligación se da, entre otros casos, cuando los rendimientos del trabajo superaron los 22.000 € anuales con un solo pagador o los 15.000 € con más de un pagador. Los herederos responden con la masa hereditaria, no con su patrimonio personal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo pueden los herederos acceder al borrador de la renta del fallecido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los herederos pueden acceder al borrador y los datos fiscales del fallecido identificándose en la sede electrónica de la Agencia Tributaria mediante certificado digital, Cl@ve PIN o número de referencia. Es necesario acreditar la condición de heredero mediante escritura de aceptación de herencia o testamento. Si el fallecido no tenía certificado digital propio, los herederos actúan en su nombre presentando la documentación que justifica la representación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué documentación se necesita para solicitar la devolución de la renta a nombre de un fallecido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para solicitar la devolución del IRPF de un fallecido hay que presentar el Modelo H-100 en la Agencia Tributaria. La documentación exigida varía según el importe: para devoluciones de hasta 2.000 € solo se requiere el certificado de defunción y el libro de familia o testamento; para importes superiores se añade el certificado del Registro de Últimas Voluntades y, en algunos casos, la escritura de partición de herencia o el acuerdo notarial de todos los herederos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sucede si el fallecido murió el 31 de diciembre? ¿Hay que presentar la declaración de ese año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El periodo impositivo del IRPF se cierra en el momento del fallecimiento, independientemente de la fecha. Si la persona falleció el 31 de diciembre, el periodo impositivo comprende todo el año natural completo (del 1 de enero al 31 de diciembre), y los herederos deben presentar la declaración si existe obligación de hacerlo, dentro de los plazos habituales de la campaña de renta del año siguiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué plazo tienen los herederos para presentar la renta del fallecido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los herederos deben presentar la declaración de renta del fallecido dentro del mismo plazo que rige para el resto de contribuyentes, es decir, durante la campaña de renta del ejercicio correspondiente (generalmente de abril a finales de junio del año siguiente al fallecimiento). No existe un plazo especial por causa de fallecimiento, salvo para la presentación del Modelo H-100 de solicitud de devolución, que puede presentarse en cualquier momento tras el inicio de la campaña.',
      },
    },
  ],
};
