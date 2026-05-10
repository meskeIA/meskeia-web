import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sistemas Operativos: Procesos, Scheduling, Memoria Virtual y Ficheros | meskeIA',
  description:
    'Visualizador interactivo de sistemas operativos. Estados de proceso SVG, planificación Round Robin/FIFO/SJF con Gantt animado, paginación con page faults y sistema de ficheros con inodos.',
  keywords: [
    'sistemas operativos procesos hilos threads',
    'planificación CPU Round Robin FIFO SJF',
    'memoria virtual paginación page fault',
    'sistema ficheros inodos journaling',
    'scheduling diagrama Gantt animado',
    'FAT32 NTFS ext4 comparativa',
    'estados proceso nuevo listo ejecucion bloqueado',
    'round robin quantum scheduler',
    'tabla de páginas marcos físicos',
    'permisos unix rwx inodo',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sistemas Operativos Interactivo: Procesos, CPU, Memoria y Ficheros',
    description:
      'Visualiza estados de proceso, algoritmos de planificación con Gantt animado, paginación y sistema de ficheros. Interactivo y gratuito.',
    url: 'https://meskeia.com/visualizador-sistemas-operativos/',
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
    title: 'Sistemas Operativos Interactivo | meskeIA',
    description:
      'Estados de proceso SVG, Gantt de scheduling, paginación y sistema de ficheros. Aprende cómo funciona un SO.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Sistemas Operativos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador Sistemas Operativos',
  description:
    'Visualizador interactivo de sistemas operativos con diagramas SVG de estados de proceso, planificación de CPU con Gantt animado (FIFO, Round Robin, SJF, Prioridad), simulación de memoria virtual y paginación, y explorador de sistema de ficheros con inodos y journaling.',
  url: 'https://meskeia.com/visualizador-sistemas-operativos/',
  features: [
    'Diagrama SVG interactivo de estados del proceso (Nuevo → Listo → Ejecución → Bloqueado → Terminado)',
    'Planificación de CPU: FIFO, Round Robin con quantum, Prioridad y SJF con Gantt animado',
    'Memoria virtual: tabla de páginas, page faults y comparativa Belady vs LRU vs FIFO',
    'Sistema de ficheros: árbol Unix, inodos, journaling y comparativa FAT32/NTFS/ext4/APFS',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
