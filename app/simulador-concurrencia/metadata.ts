import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Concurrencia: Semáforos, Productor-Consumidor y Deadlock | meskeIA',
  description:
    'Simula la concurrencia paso a paso: ejecuta hilos manualmente, observa los semáforos, provoca condiciones de carrera en la sección crítica y reproduce el interbloqueo (deadlock) de los filósofos comensales. Tres escenarios clásicos de sistemas operativos con detección automática de deadlock.',
  keywords:
    'concurrencia, semáforos, mutex, sección crítica, condición de carrera, race condition, productor consumidor, deadlock interbloqueo, filósofos comensales, exclusión mutua, sistemas operativos, hilos threads, sincronización, FP informática, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-concurrencia/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Concurrencia: Semáforos y Deadlock | meskeIA',
    description: 'Ejecuta hilos paso a paso, provoca carreras y reproduce el interbloqueo de los filósofos',
    url: 'https://meskeia.com/simulador-concurrencia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Concurrencia: Semáforos y Deadlock | meskeIA',
    description: 'Sincronización de hilos, condiciones de carrera e interbloqueo, paso a paso',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Concurrencia (Semáforos y Deadlock)',
  description:
    'Simulador interactivo de concurrencia y sincronización de hilos. Permite ejecutar hilos paso a paso para controlar el interleaving, ver el valor de los semáforos y sus colas, provocar condiciones de carrera en la sección crítica, resolver el problema del productor-consumidor con un buffer acotado y reproducir el interbloqueo (deadlock) de los filósofos comensales, con detección automática.',
  url: 'https://meskeia.com/simulador-concurrencia/',
  category: 'EducationalApplication',
  features: [
    'Ejecución manual de hilos para controlar el interleaving',
    'Semáforos con valor, cola de bloqueados y propietario',
    'Escenario de sección crítica con y sin mutex',
    'Productor-consumidor con buffer acotado',
    'Filósofos comensales con detección de deadlock',
    'Detección automática de condiciones de carrera e interbloqueo',
    'Historial de pasos detallado',
    'En español',
  ],
  keywords: ['concurrencia', 'semáforos', 'deadlock', 'productor-consumidor', 'sistemas operativos'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una condición de carrera (race condition)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una condición de carrera ocurre cuando dos o más hilos acceden a un recurso compartido a la vez y el resultado depende del orden exacto en que se intercalan sus instrucciones. Como ese orden no es predecible, el programa produce resultados distintos en ejecuciones diferentes y los fallos son difíciles de reproducir. En el simulador puedes provocar una carrera ejecutando dos hilos en la sección crítica sin mutex y ver cómo ambos entran a la vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un semáforo y cómo funcionan wait y signal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un semáforo es una variable entera con dos operaciones atómicas. wait (o P) intenta decrementarlo: si el valor es mayor que cero lo baja y el hilo continúa; si es cero, el hilo se bloquea y se encola. signal (o V) lo incrementa: si hay hilos esperando, despierta a uno en lugar de subir el valor. Un semáforo inicializado a 1 funciona como un mutex (exclusión mutua); inicializado a N permite hasta N accesos simultáneos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un interbloqueo (deadlock) y cuándo se produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un deadlock es una situación en la que un grupo de hilos se queda bloqueado para siempre porque cada uno espera un recurso que tiene otro del grupo. Se necesitan cuatro condiciones simultáneas (Coffman): exclusión mutua, retención y espera, no apropiación y espera circular. El ejemplo clásico es el de los filósofos comensales: si todos cogen primero el tenedor de su izquierda, ninguno puede coger el de la derecha y todos quedan bloqueados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se resuelve el problema del productor-consumidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con un buffer acotado y tres semáforos: uno cuenta los huecos vacíos (inicializado a la capacidad), otro cuenta los elementos disponibles (inicializado a cero) y un mutex protege el acceso al buffer. El productor hace wait sobre los huecos antes de añadir y signal sobre los elementos después; el consumidor hace lo contrario. Así el productor se bloquea si el buffer está lleno y el consumidor si está vacío, sin que se pierdan ni dupliquen datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se puede prevenir un deadlock?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basta con romper una de las cuatro condiciones de Coffman. La técnica más habitual es imponer un orden total de adquisición de recursos: si todos los hilos piden los recursos siempre en el mismo orden, no puede formarse la espera circular. En los filósofos comensales se consigue haciendo que uno de ellos coja los tenedores en orden inverso al resto. Otras opciones son usar tiempos de espera (timeouts), la apropiación de recursos o algoritmos de evitación como el del banquero.',
      },
    },
  ],
};
