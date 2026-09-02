import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador Lotería: Primitiva, Euromillones, Bonoloto | meskeIA',
  description: 'Genera números aleatorios para Primitiva, Euromillones, Bonoloto, El Gordo de la Primitiva y Lototurf. Combinaciones al azar, historial y estadísticas. Gratis y sin registro.',
  keywords: 'generador loteria, numeros primitiva, euromillones, bonoloto, el gordo, lototurf, numeros aleatorios, combinaciones loteria, numeros suerte',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-loteria/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Números de Lotería - Primitiva, Euromillones, Bonoloto',
    description: 'Genera combinaciones aleatorias para las principales loterías españolas. Gratis y sin registro.',
    url: 'https://meskeia.com/generador-loteria/',
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
    title: 'Generador de Números de Lotería',
    description: 'Genera números para Primitiva, Euromillones, Bonoloto y más',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Números de Lotería',
  description: 'Generador de combinaciones aleatorias para loterías españolas: Primitiva, Euromillones, Bonoloto, El Gordo de la Primitiva y Lototurf. Genera números al azar con historial y estadísticas.',
  url: 'https://meskeia.com/generador-loteria/',
  category: 'UtilityApplication',
  features: [
    'Generador de números aleatorios para 5 loterías españolas',
    'Primitiva, Euromillones, Bonoloto, El Gordo de la Primitiva, Lototurf',
    'Múltiples combinaciones por sorteo',
    'Historial de combinaciones generadas',
    'Estadísticas básicas de los números generados',
  ],
  keywords: ['lotería', 'números aleatorios', 'Primitiva', 'Euromillones', 'Bonoloto'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos números hay que elegir en la Primitiva y en el Euromillones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la Primitiva se eligen 6 números del 1 al 49 y el Reintegro, un número del 0 al 9. El número complementario no lo elige el jugador: lo determina el propio sorteo entre las bolas no premiadas. En el Euromillones se eligen 5 números del 1 al 50 y 2 estrellas del 1 al 12. El generador produce automáticamente combinaciones válidas para cada modalidad respetando estos rangos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Genera números realmente aleatorios o usa algún patrón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los números se generan mediante algoritmos pseudoaleatorios del navegador, sin ningún patrón predefinido. Cada combinación es independiente de las anteriores. Ningún método de generación aleatoria puede predecir ni influir en los sorteos oficiales, que son completamente independientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve guardar el historial de combinaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El historial permite ver todas las combinaciones generadas en la sesión actual y evitar repetirlas si juegas varias apuestas distintas. También es útil para comparar tus boletos con los resultados del sorteo. El historial se borra al cerrar o recargar la página.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Usar un generador aleatorio mejora mis probabilidades en la lotería?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. En los sorteos de lotería todos los números tienen exactamente la misma probabilidad de salir, independientemente de cómo se elijan. Un generador aleatorio no mejora ni empeora las probabilidades: sirve para ahorrar tiempo y evitar sesgos inconscientes al elegir los números.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se genera una combinación de Euromillones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una combinación de Euromillones son 5 números del 1 al 50 más 2 estrellas del 1 al 12, y los dos bloques se sortean por separado. El generador produce ambos a la vez sin repetir números dentro de cada bloque. Acertar los 5 números y las 2 estrellas tiene una probabilidad de 1 entre 139.838.160, la más baja de las cinco loterías disponibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencian Bonoloto y La Primitiva al generar números?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En nada desde el punto de vista de la combinación: ambas son 6 números del 1 al 49 más el Reintegro, con la misma probabilidad de acertar los 6 (1 entre 13.983.816). Las diferencias están fuera del bombo: la Bonoloto se sortea de lunes a sábado y la apuesta cuesta 0,50 €, mientras que La Primitiva se sortea jueves y sábados a 1,00 € la apuesta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo generar combinaciones para Lototurf con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El generador incluye Lototurf, que consiste en 6 números del 1 al 31 más un caballo ganador del 1 al 12. Selecciona esta modalidad en el listado de loterías y genera tantas combinaciones aleatorias como necesites, igual que con el resto de loterías disponibles.',
      },
    },
  ],
};
