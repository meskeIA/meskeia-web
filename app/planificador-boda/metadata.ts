import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Boda - Checklist y Presupuesto Gratis | meskeIA',
  description: 'Organiza tu boda paso a paso con nuestra herramienta gratuita. Checklist por meses, calculadora de presupuesto, timeline del día y consejos de wedding planner.',
  keywords: 'planificador boda, wedding planner, checklist boda, presupuesto boda, organizar boda, lista tareas boda, calculadora boda, timeline boda, preparativos boda, matrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Boda Gratis - Tu Wedding Planner Digital',
    description: 'Checklist completo, calculadora de presupuesto y timeline para organizar tu boda perfecta. Todo gratis y sin registro.',
    url: 'https://meskeia.com/planificador-boda/',
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
    title: 'Planificador de Boda - Checklist y Presupuesto | meskeIA',
    description: 'Organiza tu boda paso a paso: checklist por meses, presupuesto y timeline del día.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador de Boda meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Boda",
  description: "Organiza tu boda paso a paso con nuestra herramienta gratuita. Checklist por meses, calculadora de presupuesto, timeline del día y consejos de wedding planner.",
  url: "https://meskeia.com/planificador-boda/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta de media una boda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El presupuesto medio de una boda en España ronda los 20.000–30.000 €, aunque varía enormemente según el número de invitados, la comunidad autónoma y las opciones elegidas. Las tres partidas que más peso tienen son el catering (40-50% del total), el local o espacio y la fotografía/vídeo. Una boda íntima de 30-50 personas puede realizarse desde 8.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con cuánta antelación hay que empezar a organizar una boda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo recomendable es comenzar los preparativos entre 12 y 18 meses antes, especialmente para reservar el espacio y el catering, que suelen tener listas de espera largas en temporada alta (mayo a octubre). Con 6 meses es posible organizarla, pero la elección de proveedores queda más limitada. Las tareas urgentes iniciales son fijar la fecha, el presupuesto y el número de invitados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué incluye un checklist completo para organizar una boda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un checklist de boda organizado por fases incluye: reserva de espacio y catering (12-18 meses antes), contratación de fotógrafo, música y florista (9-12 meses), envío de invitaciones y elección de vestido (6-9 meses), confirmación de asistencia y detalles de protocolo (3-6 meses), y los preparativos del día anterior y la semana de la boda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un wedding planner y usar una herramienta de planificación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un wedding planner profesional gestiona activamente los proveedores, negocia precios y resuelve imprevistos el día de la boda; su coste suele estar entre 1.500 y 5.000 €. Una herramienta digital de planificación ofrece checklists, control de presupuesto y timelines para gestionar tú mismo la organización sin coste adicional, siendo ideal para parejas que quieren control directo sobre cada decisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo reducir el presupuesto de mi boda sin renunciar a lo esencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las mayores palancas de ahorro son reducir el número de invitados (el ahorro por persona en catering suele ser de 60-120 €), elegir temporada baja (noviembre-febrero) o día entre semana, optar por bufé en lugar de menú servido y prescindir del wedding planner gestionando tú la organización. También ayuda comparar al menos tres presupuestos por cada proveedor.',
      },
    },
  ],
};
