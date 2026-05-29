import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Vacaciones para Autónomos | meskeIA',
  description: 'Calcula el impacto económico de tus vacaciones como autónomo. Cuánto dejas de facturar, cuánto compensar y las mejores épocas para descansar.',
  keywords: 'vacaciones autónomo, planificar vacaciones freelance, impacto económico vacaciones, descanso autónomo, facturación, cuota RETA vacaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Vacaciones para Autónomos | meskeIA',
    description: 'Calcula el impacto económico real de tomarte vacaciones como autónomo. Facturación perdida, compensación necesaria y mejores épocas.',
    url: 'https://meskeia.com/planificador-vacaciones-autonomo/',
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
    title: 'Planificador de Vacaciones para Autónomos | meskeIA',
    description: 'Calcula el impacto económico real de tomarte vacaciones como autónomo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Vacaciones Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Vacaciones para Autónomos',
  description: 'Herramienta gratuita para que autónomos y freelancers calculen el impacto económico real de sus vacaciones. Incluye facturación perdida, gastos fijos que siguen corriendo, compensación necesaria y las mejores épocas según sector.',
  url: 'https://meskeia.com/planificador-vacaciones-autonomo/',
  category: 'BusinessApplication',
  features: [
    'Calcula la facturación que dejas de percibir durante las vacaciones',
    'Estima los gastos fijos que siguen corriendo (RETA, alquiler, seguros)',
    'Calcula cuánto necesitas facturar de más para compensar',
    'Sugiere ahorro mensual preventivo para cubrir vacaciones',
    'Tabla de estacionalidad por tipo de freelance',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto dinero pierde un autónomo durante las vacaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la tarifa diaria y los días que se ausente. Un autónomo con una facturación mensual de 3.000 € que tome 15 días de vacaciones deja de ingresar aproximadamente 1.500 € brutos. A eso hay que sumarle los gastos fijos que siguen corriendo: cuota RETA, seguros, herramientas y, en su caso, alquiler de oficina o espacio de trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene que pagar el autónomo la cuota RETA durante las vacaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La cuota de autónomos (RETA) se paga mensualmente independientemente de si se trabaja o no ese mes. No existe una "baja por vacaciones" para autónomos que suspenda la cotización. Por eso es importante planificar las vacaciones con antelación y reservar con anticipación el dinero necesario para cubrir esos gastos fijos sin ingresos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería ahorrar cada mes un freelance para poder permitirse vacaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una regla práctica es dividir el coste total de las vacaciones (facturación perdida + gastos fijos del periodo) entre los meses que quedan hasta la fecha prevista. Si planeas tomar 20 días en agosto y tu coste total asciende a 2.400 €, deberías reservar 200 € mensuales durante 12 meses. Un planificador de vacaciones te calcula esta cifra automáticamente en función de tus datos reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las mejores épocas del año para que un autónomo se tome vacaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del sector. Los profesionales de diseño y tecnología suelen tener menos demanda en agosto y entre Navidad y Reyes, que son buen momento para descansar sin perder muchos clientes. Los autónomos en turismo o eventos tienen sus picos precisamente en verano. En general, conviene analizar los meses de menor facturación histórica propia: esos son los más baratos para desconectar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre planificar vacaciones siendo autónomo y siendo asalariado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un asalariado cobra su sueldo íntegro durante las vacaciones porque están incluidas en el convenio laboral. Un autónomo, en cambio, no factura mientras descansa y sus gastos fijos no se detienen. Esto obliga a planificar con mayor antelación: calcular la pérdida real de ingresos, compensarla facturando más el resto del año o acumulando un ahorro específico para vacaciones.',
      },
    },
  ],
};
