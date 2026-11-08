import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cara o Cruz - Lanzar Moneda Online con Estadísticas | meskeIA',
  description: 'Lanza una moneda virtual con animación realista. Incluye historial de lanzamientos, estadísticas de probabilidad y visualización de la ley de grandes números. Perfecto para tomar decisiones.',
  keywords: 'cara o cruz, lanzar moneda, coin flip, moneda virtual, decisiones aleatorias, probabilidad, estadísticas, ley grandes números, azar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cara o Cruz - Lanzar Moneda Online | meskeIA',
    description: 'Lanza una moneda virtual con animación y estadísticas de probabilidad.',
    url: 'https://meskeia.com/cara-o-cruz/',
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
    title: 'Cara o Cruz | meskeIA',
    description: 'Moneda virtual con animación realista y estadísticas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cara o Cruz",
  description: "Lanza una moneda virtual con animación realista. Incluye historial de lanzamientos, estadísticas de probabilidad y visualización de la ley de grandes números. Perfecto para tomar decisiones.",
  url: "https://meskeia.com/cara-o-cruz/",
  category: 'UtilityApplication',
  features: [
    'Lanzamiento de moneda virtual con animación de giro',
    'Probabilidad 1/2 de cara o cruz en cada lanzamiento',
    'Contador de caras y cruces con su porcentaje',
    'Barra de distribución entre cara y cruz',
    'Racha actual y mejor racha de cara y de cruz',
    'Historial de los últimos 20 lanzamientos',
    'Botón para reiniciar las estadísticas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es lanzar cara o cruz online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lanzar cara o cruz online es la versión digital del clásico lanzamiento de moneda. Una herramienta genera un resultado aleatorio entre dos opciones con igual probabilidad (50 % cada una), igual que una moneda física bien equilibrada. Es útil para tomar decisiones rápidas, resolver disputas o simplemente probar la suerte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es realmente aleatorio el resultado de una moneda virtual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La mayoría de lanzadores de moneda online utilizan generadores de números pseudoaleatorios criptográficamente seguros (CSPRNG) o las funciones Math.random() del navegador, que producen resultados estadísticamente impredecibles. A largo plazo, la proporción cara/cruz se aproxima al 50 % / 50 % según la ley de los grandes números.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el historial de lanzamientos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El historial permite ver la secuencia de resultados anteriores y las estadísticas acumuladas: cuántas caras y cruces han salido, el porcentaje de cada opción y cómo evoluciona la proporción con el número de lanzamientos. Es una forma visual de observar la ley de los grandes números en acción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar cara o cruz online para tomar decisiones importantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No es lo recomendable. El cara o cruz sirve para decidir entre dos opciones equivalentes donde no hay preferencia clara, como quién empieza un juego, qué restaurante elegir o quién realiza una tarea menor. Para decisiones irreversibles o con consecuencias importantes (económicas, laborales, legales o de salud) conviene analizar las opciones con detenimiento en lugar de dejarlas al azar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre lanzar una moneda física y una virtual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una moneda física puede tener pequeñas imperfecciones de fabricación que sesguen mínimamente el resultado, aunque en la práctica es despreciable. Una moneda virtual es matemáticamente perfecta en su aleatoriedad: la probabilidad es exactamente 50 % en cada lanzamiento, independientemente de los resultados anteriores.',
      },
    },
  ],
};
