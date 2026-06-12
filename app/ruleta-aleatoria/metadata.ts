import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ruleta Aleatoria Online - Sorteos y Decisiones | meskeIA',
  description: 'Ruleta aleatoria personalizable para sorteos, decisiones y selección al azar. Añade tus propias opciones, personaliza colores y gira. Gratis y sin registro.',
  keywords: 'ruleta aleatoria, sorteo online, ruleta de nombres, elegir al azar, wheel of names, ruleta personalizada, sorteo gratis, decisiones, girar ruleta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ruleta Aleatoria Online - Sorteos y Decisiones',
    description: 'Crea tu ruleta personalizada para sorteos y decisiones al azar. Gratis y sin registro.',
    url: 'https://meskeia.com/ruleta-aleatoria/',
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
    title: 'Ruleta Aleatoria Online',
    description: 'Sorteos y decisiones al azar con tu ruleta personalizada',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Ruleta Aleatoria",
  description: "Ruleta aleatoria personalizable para sorteos, decisiones y selección al azar. Añade tus propias opciones, personaliza colores y gira. Gratis y sin registro.",
  url: "https://meskeia.com/ruleta-aleatoria/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve una ruleta aleatoria online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una ruleta aleatoria online sirve para tomar decisiones o realizar sorteos de forma imparcial. Puedes usarla para elegir a un ganador entre varios participantes, decidir qué actividad o tarea hacer primero, o simplemente dejar al azar cualquier elección con múltiples opciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo añado mis propias opciones a la ruleta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Escribe una opción en el campo de texto y pulsa "+ Añadir" (o la tecla Enter) para incorporarla a la ruleta. Repite el proceso para cada opción adicional: la ruleta se actualiza automáticamente con un nuevo segmento por cada una. Si prefieres algo más rápido, puedes cargar una plantilla predefinida (Sí/No, Números, Días de la semana, Comida o Colores) con un clic y luego editarla a tu gusto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los resultados de la ruleta son verdaderamente aleatorios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La ruleta utiliza el generador de números pseudoaleatorios del navegador (Math.random), que produce resultados estadísticamente uniformes. Cada opción tiene exactamente la misma probabilidad de salir si los segmentos son del mismo tamaño, garantizando imparcialidad en los sorteos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar la ruleta para sorteos en clase o en el trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, es una herramienta muy usada por profesores para elegir alumnos al azar, por equipos para asignar tareas o turnos, y en dinámicas de grupo o presentaciones. No requiere registro ni instalación; basta con abrir la página y empezar a usarla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre esta ruleta y "Wheel of Names"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '"Wheel of Names" es una herramienta popular en inglés con funciones avanzadas de guardado en la nube. Esta ruleta está pensada para el público hispanohablante, funciona completamente en español, no requiere cuenta ni almacena datos, y es totalmente gratuita sin límites de uso.',
      },
    },
  ],
};
