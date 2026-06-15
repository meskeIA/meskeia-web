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
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los estados de un proceso en un sistema operativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un proceso pasa por cinco estados a lo largo de su vida: Nuevo (se está creando), Listo (espera turno de CPU en la cola de preparados), En ejecución (ocupa la CPU), Bloqueado o en espera (aguarda un evento externo como entrada/salida) y Terminado (ha concluido y libera recursos). El planificador del sistema operativo gestiona las transiciones entre estos estados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre los algoritmos Round Robin, FIFO y SJF para planificación de CPU?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FIFO (First In, First Out) ejecuta los procesos en orden de llegada sin preempción, lo que puede causar el "efecto convoy". SJF (Shortest Job First) elige siempre el proceso con menor tiempo de ráfaga restante, minimizando el tiempo medio de espera, pero puede causar inanición en procesos largos. Round Robin asigna un quantum de tiempo fijo a cada proceso de forma circular, garantizando equidad y tiempos de respuesta bajos para sistemas interactivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un page fault y cómo lo gestiona el sistema operativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un page fault ocurre cuando un proceso intenta acceder a una página virtual que no está cargada en memoria física (RAM). El sistema operativo interrumpe el proceso, localiza la página en el disco (swap), la carga en un marco libre de RAM (o reemplaza una página existente usando algoritmos como LRU o FIFO) y actualiza la tabla de páginas. Demasiados page faults consecutivos provocan thrashing, degradando el rendimiento del sistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre FAT32, NTFS y ext4?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FAT32 es compatible con casi todos los dispositivos pero limita el tamaño de archivo a 4 GB y no soporta permisos ni journaling. NTFS (Windows) admite archivos de hasta 16 TB, control de acceso granular, cifrado y journaling transaccional. ext4 (Linux) ofrece journaling, soporte de grandes volúmenes, extents para almacenamiento contiguo y mejor rendimiento en cargas de trabajo de servidor. Para dispositivos USB se suele usar FAT32 o exFAT por su compatibilidad universal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué estudiantes es útil este visualizador de sistemas operativos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de ingeniería informática o ciclos formativos de administración de sistemas que estudian la asignatura de Sistemas Operativos. Las animaciones del diagrama de Gantt y la simulación de paginación permiten comprender de forma visual conceptos que resultan abstractos solo con texto. También sirve como repaso rápido antes de exámenes o entrevistas técnicas.',
      },
    },
  ],
};
