import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Boids - Comportamiento de Bandada (Flocking) | meskeIA',
  description:
    'Simula en tiempo real cómo se mueve una bandada con el algoritmo de boids de Craig Reynolds (1986). Ajusta separación, alineación y cohesión y observa el comportamiento emergente: el movimiento colectivo surge de tres reglas locales, sin ningún líder. Ideal para entender la IA de movimiento en videojuegos.',
  keywords:
    'boids, comportamiento de bandada, flocking, sistemas emergentes, Craig Reynolds, IA videojuegos, simulación de enjambre, comportamiento emergente, separación alineación cohesión, swarm, movimiento de multitudes, programación de videojuegos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-boids/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Boids - Comportamiento de Bandada (Flocking) | meskeIA',
    description:
      'Cómo una bandada se mueve coordinada sin líder: separación, alineación y cohesión, las tres reglas de los boids de Craig Reynolds, en una simulación animada.',
    url: 'https://meskeia.com/simulador-boids/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Boids (Comportamiento de Bandada) | meskeIA',
    description:
      'Tres reglas locales, movimiento colectivo emergente: la simulación de boids de Craig Reynolds en tu navegador',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Boids (Comportamiento de Bandada)',
  description:
    'Simulador interactivo del algoritmo de boids de Craig Reynolds (1986). Una bandada de agentes se mueve en pantalla aplicando tres reglas locales —separación, alineación y cohesión—, de las que surge un movimiento colectivo realista sin ningún líder. Ajusta el número de boids, el radio de percepción, la velocidad máxima y el peso de cada regla, y observa en directo cómo cambia el comportamiento emergente.',
  url: 'https://meskeia.com/simulador-boids/',
  category: 'EducationalApplication',
  features: [
    'Simulación animada en tiempo real con requestAnimationFrame',
    'Las 3 reglas clásicas: separación, alineación y cohesión',
    'Peso ajustable de cada regla con sliders',
    'Número de boids, radio de percepción y velocidad máxima configurables',
    'Pausar, reanudar y reiniciar la bandada',
    'Respeta la preferencia de movimiento reducido',
    'Casos de uso reales: videojuegos, cine, drones y multitudes',
    'En español',
  ],
  keywords: ['boids', 'comportamiento de bandada', 'flocking', 'sistemas emergentes', 'Craig Reynolds'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un boid y quién inventó el algoritmo de bandada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un boid (de "bird-oid object", objeto similar a un pájaro) es un agente artificial que imita a un ave dentro de una bandada. El modelo lo creó Craig Reynolds en 1986 y lo presentó en 1987 en la conferencia SIGGRAPH. Cada boid sigue solo tres reglas locales mirando a sus vecinos cercanos; de esas reglas simples emerge un movimiento de bandada complejo y realista, sin que ningún boid dirija al grupo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las tres reglas de los boids?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Separación: alejarse de los vecinos demasiado próximos para no chocar. Alineación: ajustar la propia velocidad hacia la velocidad media de los vecinos, de modo que todos vayan en una dirección parecida. Cohesión: dirigirse hacia el centro de masa (la posición media) de los vecinos para mantenerse unidos. Cada regla aporta un pequeño empuje y la suma ponderada de las tres determina hacia dónde gira cada boid en cada fotograma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el comportamiento emergente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es cuando un patrón global y organizado surge de muchas interacciones locales simples, sin un control central que lo planifique. En los boids nadie programa la forma de la bandada ni elige un líder: cada agente solo reacciona a sus vecinos, y aun así el grupo se mueve, se divide y se reagrupa de forma coordinada. Es el mismo principio que explica los bancos de peces, los enjambres de insectos o las bandadas de estorninos reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usan los boids en videojuegos y cine?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sirven para animar grupos grandes de personajes sin moverlos uno a uno: bandadas de aves, bancos de peces, multitudes o enjambres. En cine se usaron de forma pionera en los murciélagos y pingüinos de Batman Returns (1992) y en muchas escenas de masas posteriores. En videojuegos dan vida a fauna ambiental y a enemigos que se mueven en grupo, y son la base de la "IA de movimiento" o steering behaviors.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la simulación de boids puede volverse lenta con muchos agentes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la versión básica, cada boid compara su posición con la de todos los demás para saber quiénes son sus vecinos, lo que da un coste de orden O(n²): al doblar el número de boids, el trabajo se cuadruplica. Por eso una bandada pequeña va fluida y una muy grande puede ralentizar el navegador. En aplicaciones reales se acelera dividiendo el espacio en una rejilla o usando estructuras como árboles para consultar solo los vecinos próximos.',
      },
    },
  ],
};
