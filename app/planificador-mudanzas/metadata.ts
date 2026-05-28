import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Mudanzas - Organiza tu Mudanza Paso a Paso | meskeIA',
  description: 'Planifica tu mudanza con checklist de tareas, inventario de objetos por habitación y control de presupuesto. Herramienta gratuita para organizar mudanzas sin estrés.',
  keywords: 'planificador mudanzas, checklist mudanza, inventario mudanza, presupuesto mudanza, organizar mudanza, lista tareas mudanza, calculadora mudanza',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Mudanzas - Organiza tu Mudanza | meskeIA',
    description: 'Checklist de tareas, inventario por habitación y control de presupuesto para tu mudanza. Herramienta gratuita online.',
    url: 'https://meskeia.com/planificador-mudanzas/',
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
    title: 'Planificador de Mudanzas | meskeIA',
    description: 'Organiza tu mudanza paso a paso: tareas, inventario y presupuesto en una sola herramienta.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador de Mudanzas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Mudanzas",
  description: "Planifica tu mudanza con checklist de tareas, inventario de objetos por habitación y control de presupuesto. Herramienta gratuita para organizar mudanzas sin estrés.",
  url: "https://meskeia.com/planificador-mudanzas/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta una mudanza en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio de una mudanza en España varía entre 300 y 3.000 € según la distancia, el volumen de enseres y si se contrata embalaje profesional. Una mudanza local en la misma ciudad para un piso de dos habitaciones suele estar entre 300 y 700 €. Las mudanzas interprovinciales o internacionales pueden superar fácilmente los 1.500 €. Solicitar al menos tres presupuestos es imprescindible para comparar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con cuánta antelación hay que empezar a organizar una mudanza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo ideal es empezar a planificar con 4-8 semanas de antelación para mudanzas locales y con 2-3 meses para mudanzas de larga distancia o internacionales. Las primeras tareas son contratar la empresa de mudanzas (se reservan rápido en verano y fin de mes), gestionar el cambio de domicilio en organismos oficiales y comenzar a clasificar y empaquetar los objetos que menos se usan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tareas hay que hacer antes de una mudanza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tareas principales incluyen: contratar la empresa de mudanzas y reservar el ascensor o zona de carga, comunicar el cambio de domicilio a la administración, banco, seguro médico y proveedores de suministros, hacer un inventario de objetos por habitación, clasificar lo que se dona o descarta, y empaquetar con cajas etiquetadas por estancia. Cancelar servicios del domicilio anterior (luz, gas, internet) también es clave para evitar cargos innecesarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo abaratar el coste de mi mudanza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales formas de reducir el coste son realizar el embalaje uno mismo (ahorra entre un 20% y un 40%), elegir fechas entre semana o a mediados de mes (más demanda los viernes y fines de mes), deshacerse de objetos grandes que no se usen antes de la mudanza para reducir el volumen, y conseguir cajas gratuitas en supermercados o tiendas locales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve hacer un inventario de objetos antes de mudarse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un inventario por habitación permite saber qué se lleva, qué se vende o dona y qué se descarta, evitando trasladar objetos innecesarios que encarecen la mudanza. También facilita la colocación rápida en el nuevo domicilio al etiquetar cada caja con su destino, y es fundamental para presentar reclamaciones si algún objeto llega dañado a la empresa de mudanzas.',
      },
    },
  ],
};
