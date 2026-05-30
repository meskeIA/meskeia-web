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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la planificación de procesos en sistemas operativos y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La planificación de procesos (CPU scheduling) es la función del sistema operativo que decide qué proceso ocupa la CPU en cada momento cuando varios procesos están listos para ejecutarse. Su objetivo es maximizar el uso de la CPU, minimizar los tiempos de espera y respuesta, y garantizar equidad. Sin un planificador eficiente, la CPU quedaría ociosa mientras los procesos esperan, o algunos procesos sufrirían inanición indefinida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre FCFS, SJF y Round Robin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FCFS (First Come, First Served) ejecuta los procesos por orden de llegada, sin interrupciones; es simple pero provoca el efecto convoy si un proceso largo bloquea a otros cortos. SJF (Shortest Job First) ejecuta primero el proceso con menor ráfaga de CPU, minimizando el tiempo medio de espera pero pudiendo causar inanición. Round Robin asigna un cuanto de tiempo fijo a cada proceso en turno rotativo, garantizando equidad a costa de mayor sobrecarga por cambios de contexto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la inanición (starvation) y cómo se evita en planificación por prioridad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inanición ocurre cuando un proceso de baja prioridad no llega a ejecutarse nunca porque continuamente llegan procesos de mayor prioridad. La solución más habitual es el envejecimiento (aging): la prioridad de un proceso aumenta gradualmente cuanto más tiempo lleva esperando, garantizando que eventualmente obtendrá la CPU. Algoritmos como Round Robin no sufren inanición por diseño.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el tiempo de espera, turnaround y tiempo de respuesta de un proceso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo de turnaround es el tiempo total desde que el proceso llega hasta que termina (completion time − arrival time). El tiempo de espera es el tiempo que el proceso pasa en la cola de listos sin ejecutarse (turnaround − burst time). El tiempo de respuesta es el tiempo desde la llegada hasta que el proceso recibe la CPU por primera vez. Los planificadores intentan minimizar los promedios de estas métricas en el conjunto de procesos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es mejor SRTF que SJF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SRTF (Shortest Remaining Time First) es la versión apropiativa de SJF: si llega un proceso nuevo con ráfaga menor que el tiempo restante del proceso en ejecución, el planificador lo interrumpe. SRTF minimiza el tiempo medio de espera mejor que SJF no apropiativo cuando hay llegadas frecuentes de procesos cortos durante la ejecución de un proceso largo, aunque genera más cambios de contexto y requiere conocer o estimar las ráfagas restantes.',
      },
    },
  ],
};
