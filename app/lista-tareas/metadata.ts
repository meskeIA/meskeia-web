import { Metadata } from 'next';

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
    url: 'https://next.meskeia.com/lista-tareas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lista de Tareas | meskeIA',
    description: 'Organiza tus tareas con prioridades y fechas límite',
  },
  other: {
    'application-name': 'Lista de Tareas meskeIA',
  },
};
