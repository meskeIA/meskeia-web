import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lista de Tareas - Organiza tu Día | meskeIA',
  description: 'Lista de tareas online con prioridades, fechas límite y categorías. Guarda tus tareas en el navegador. Gratis, privado y sin registro.',
  keywords: 'lista tareas, todo list, organizador tareas, gestión tareas, productividad, checklist, pendientes, to do, planificador',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lista de Tareas - Organiza tu Productividad',
    description: 'Gestiona tus tareas con prioridades y fechas. Sin registro, 100% privado.',
    url: 'https://meskeia.com/lista-tareas/',
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
    title: 'Lista de Tareas | meskeIA',
    description: 'Organiza tus tareas con prioridades y fechas límite',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Lista de Tareas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Lista de Tareas",
  description: "Lista de tareas online con prioridades, fechas límite y categorías. Guarda tus tareas en el navegador. Gratis, privado y sin registro.",
  url: "https://meskeia.com/lista-tareas/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Las tareas se guardan aunque cierre el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Las tareas se guardan automáticamente en el almacenamiento local del navegador (localStorage), por lo que persisten aunque cierres la pestaña o el navegador. No necesitas crear una cuenta ni conectarte a ningún servidor. La información queda solo en tu dispositivo y no se envía a ningún sitio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo asignar prioridades y fechas límite a las tareas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Cada tarea puede tener una prioridad (alta, media o baja) y una fecha límite opcional. Las tareas con fecha próxima o vencida se destacan visualmente para que puedas identificar fácilmente qué requiere atención inmediata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre esta lista de tareas y otras apps como Todoist o TickTick?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La principal diferencia es la privacidad y la sencillez: esta herramienta no requiere registro, no almacena tus datos en servidores externos y no tiene suscripciones de pago. Es ideal si necesitas una lista rápida y privada sin depender de una cuenta en la nube. Para equipos, gestión de proyectos complejos o sincronización entre dispositivos, las apps especializadas ofrecen más funciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo organizar las tareas por categorías?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, puedes agrupar las tareas por categorías personalizadas para separar, por ejemplo, trabajo, estudio y recados personales. Esto facilita el enfoque cuando quieres trabajar en un área específica sin ver el resto de pendientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si borro los datos del navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si limpias el historial o los datos de sitio en tu navegador, se borrarán también las tareas guardadas en localStorage. Para evitar perder información importante, puedes copiar el contenido manualmente antes de limpiar el navegador. Si necesitas sincronización entre dispositivos o copias de seguridad automáticas, una app en la nube sería más adecuada para tu caso.',
      },
    },
  ],
};
