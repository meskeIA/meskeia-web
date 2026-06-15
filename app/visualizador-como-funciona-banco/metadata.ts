import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona un Banco (de Verdad) - Explicador Visual | meskeIA',
  description: 'Entiende de dónde sale el dinero que presta el banco: depósitos, reserva fraccionaria, multiplicador bancario, tipos de interés BCE. Explicador interactivo.',
  keywords: 'cómo funciona banco, reserva fraccionaria, multiplicador bancario, tipos interés BCE, creación dinero, sistema financiero, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona un Banco (de Verdad)',
    description: 'De dónde sale el dinero que presta el banco. Reserva fraccionaria y multiplicador bancario explicados.',
    url: 'https://meskeia.com/visualizador-como-funciona-banco/',
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
    title: 'Cómo Funciona un Banco (de Verdad)',
    description: 'El sistema bancario explicado de forma visual: depósitos, préstamos y creación de dinero.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cómo Funciona Banco meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona un Banco (de Verdad)',
  description: 'Explicador visual interactivo del sistema bancario: cómo los bancos crean dinero a partir de depósitos, la reserva fraccionaria, el multiplicador bancario, los tipos de interés del BCE y el papel del banco central.',
  url: 'https://meskeia.com/visualizador-como-funciona-banco/',
  features: [
    'Simulación visual del multiplicador bancario',
    'Slider de coeficiente de reserva interactivo',
    'Ciclo depósito → préstamo → nuevo depósito explicado',
    'Papel del BCE y los tipos de interés',
    'Qué pasa cuando todos quieren su dinero a la vez',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo gana dinero un banco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un banco gana dinero principalmente por la diferencia entre los intereses que paga a los depositantes (por ejemplo, un 1% anual en una cuenta de ahorro) y los intereses que cobra a los prestatarios (por ejemplo, un 5% en una hipoteca). Esa diferencia se llama margen de intermediación o spread. También obtienen ingresos por comisiones de servicios, tarjetas y operaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la reserva fraccionaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La reserva fraccionaria es el sistema por el cual los bancos solo guardan una fracción del dinero depositado como reserva y prestan el resto. Por ejemplo, con un coeficiente de reserva del 10%, si depositas 1.000€, el banco guarda 100€ y puede prestar 900€. Esos 900€ prestados acaban en otro banco, que a su vez guarda 90€ y presta 810€, y así sucesivamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los bancos crean dinero de la nada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En cierto sentido sí. Cuando un banco concede un préstamo, no entrega billetes físicos de su caja fuerte: crea un nuevo depósito a nombre del prestatario en su cuenta. Este proceso, llamado creación de dinero bancario o dinero-crédito, multiplica la cantidad de dinero en circulación muy por encima de las reservas reales. Los bancos centrales regulan este proceso mediante el coeficiente de reservas y los tipos de interés.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel tiene el BCE en el sistema bancario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Banco Central Europeo (BCE) actúa como banco de los bancos en la eurozona. Fija el tipo de interés de referencia al que presta dinero a los bancos comerciales, lo que influye directamente en el coste del crédito para empresas y familias. También supervisa la estabilidad financiera, puede inyectar liquidez en una crisis y establece los requisitos mínimos de reservas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si todos los clientes retiran su dinero a la vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ese fenómeno se llama pánico bancario o bank run. Como los bancos solo guardan una fracción de los depósitos, no podrían devolver todo el dinero simultáneamente. Para prevenirlo, en la Unión Europea el Fondo de Garantía de Depósitos (FGD) cubre hasta 100.000€ por titular y entidad. En casos extremos, el banco central puede actuar como prestamista de última instancia.',
      },
    },
  ],
};
