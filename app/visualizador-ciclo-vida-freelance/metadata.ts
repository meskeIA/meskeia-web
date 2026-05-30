import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Ciclo de Vida de un Proyecto Freelance - Explicador Visual | meskeIA',
  description: 'Visualiza las 7 fases de un proyecto freelance: captacion, propuesta, negociacion, ejecucion, entrega, facturacion y cobro. Tiempos reales, tiempo no facturable y cuellos de botella.',
  keywords: 'freelance, proyecto freelance, fases proyecto, tiempo facturable, gestion proyectos, autonomo, ciclo vida, cobro freelance, propuesta freelance',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Ciclo de Vida de un Proyecto Freelance - Explicador Visual',
    description: 'Las 7 fases de un proyecto freelance explicadas visualmente: donde se pierde dinero, cuellos de botella y tiempos reales.',
    url: 'https://meskeia.com/visualizador-ciclo-vida-freelance/',
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
    title: 'Ciclo de Vida de un Proyecto Freelance - Explicador Visual',
    description: 'Solo el 40-60% del tiempo de un freelance es facturable. Descubre donde se pierde el resto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Ciclo Vida Freelance meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Ciclo de Vida de un Proyecto Freelance',
  description: 'Explicador visual interactivo sobre las 7 fases de un proyecto freelance: captacion, propuesta, negociacion, ejecucion, entrega, facturacion y cobro. Incluye tiempos medios, tiempo no facturable, cuellos de botella y calculo del coste real por hora.',
  url: 'https://meskeia.com/visualizador-ciclo-vida-freelance/',
  category: 'EducationalApplication',
  features: [
    'Timeline visual de las 7 fases con duracion proporcional',
    'Codigo de colores: facturable vs no facturable',
    'Cuellos de botella y tips para cada fase',
    'Calculo del coste real por hora contando tiempo no facturable',
    'Estadisticas de morosidad en Espana (plazo medio 82 dias)',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las fases de un proyecto freelance de principio a fin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un proyecto freelance pasa por siete fases: captación del cliente (búsqueda y primer contacto), elaboración de la propuesta, negociación de condiciones, ejecución del trabajo, entrega y revisiones, facturación y, finalmente, cobro. La duración real varía mucho según el sector, pero la fase de cobro es habitualmente la más larga e impredecible, con un plazo medio de 82 días en España según datos de morosidad empresarial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje del tiempo de un freelance es realmente facturable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general, entre el 40 % y el 60 % del tiempo de trabajo de un freelance es facturable directamente. El resto se destina a tareas no facturables: buscar clientes, redactar propuestas, gestionar correos y facturas, formación continua, contabilidad y administración. Este dato es clave para calcular la tarifa hora real: si tu coste mensual es de 3.000 € y solo facturar 80 horas de las 160 que trabajas, tu tarifa mínima debe cubrir las 160 horas reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo mi tarifa hora real como freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tarifa hora real se calcula dividiendo todos tus costes (personales, fiscales, herramientas, formación, seguros) entre las horas que realmente puedes facturar al mes, no entre las horas totales que trabajas. Por ejemplo, si tienes 2.500 € de costes mensuales y puedes facturar 100 horas al mes, tu tarifa mínima es 25 €/h. A ese mínimo debes añadir un margen de beneficio y un fondo para periodos sin proyectos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el mayor cuello de botella en un proyecto freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cuellos de botella más frecuentes son dos: la fase de aprobación de propuesta (el cliente tarda en responder o pide varias rondas de ajuste) y la fase de cobro (facturas con 60-90 días de demora o impagos). La fase de revisiones tras la entrega también puede extenderse indefinidamente si no se ha pactado un número máximo de rondas en el contrato. Definir estos límites por escrito antes de empezar reduce significativamente estos bloqueos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia a un freelance organizado de uno que trabaja sin estructura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un freelance organizado documenta cada fase del proyecto con hitos y entregables claros, usa contratos escritos con plazos de pago y número de revisiones acordadas, emite facturas el mismo día de la entrega y hace seguimiento sistemático de cobros. Sin esta estructura, es habitual subestimar el tiempo invertido, aceptar revisiones ilimitadas y tener problemas de tesorería por cobros tardíos. La diferencia en ingresos reales puede superar el 30-40 % a igualdad de horas trabajadas.',
      },
    },
  ],
};
