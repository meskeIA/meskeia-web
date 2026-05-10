import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Planificación de Procesos - FCFS SJF Round Robin | meskeIA',
  description: 'Simula los algoritmos de planificación de CPU: FCFS, SJF, SRTF, Round Robin y Priority. Define procesos, observa el diagrama de Gantt, tiempo medio de espera y respuesta. Sistemas Operativos.',
  keywords: 'planificación procesos, scheduler CPU, FCFS SJF SRTF, Round Robin, diagrama de Gantt, sistemas operativos, tiempo medio espera, turnaround time, planificador procesos universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-planificador-procesos/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Planificación de Procesos | meskeIA',
    description: 'FCFS, SJF, SRTF, Round Robin y Priority con diagrama de Gantt interactivo',
    url: 'https://meskeia.com/simulador-planificador-procesos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Planificación de Procesos | meskeIA',
    description: 'Aprende sistemas operativos con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Planificación de Procesos en CPU',
  description: 'Simulador interactivo de algoritmos de planificación de CPU. Define una lista de procesos con tiempo de llegada, ráfaga y prioridad, elige FCFS, SJF, SRTF, Round Robin o Priority, y observa el diagrama de Gantt con métricas de rendimiento.',
  url: 'https://meskeia.com/simulador-planificador-procesos/',
  category: 'EducationalApplication',
  features: [
    '5 algoritmos: FCFS, SJF no apropiativo, SRTF, Round Robin, Priority',
    'Diagrama de Gantt animado con colores por proceso',
    'Cálculo de tiempos de espera, respuesta y turnaround',
    'Métricas globales: throughput, utilización CPU, inanición',
    '4 ejemplos clásicos preconfigurados (convoy effect, inanición, etc.)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['planificación procesos', 'CPU scheduling', 'sistemas operativos', 'informática universidad'],
});
