import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Pathfinding A* - Búsqueda de Caminos en Videojuegos | meskeIA',
  description:
    'Simula cómo los enemigos y NPCs encuentran el camino en un videojuego. Algoritmo A* (A estrella), Dijkstra y BFS paso a paso sobre una rejilla: pinta muros y terreno costoso, marca inicio y meta, y observa qué casillas explora cada algoritmo. Con diagonales opcionales.',
  keywords:
    'pathfinding, algoritmo A estrella, A* videojuegos, búsqueda de caminos, IA videojuegos, cómo persiguen los enemigos, Dijkstra rejilla, BFS, búsqueda en cuadrícula, heurística, programación de videojuegos, navmesh, NPC pathfinding',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-pathfinding/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Pathfinding A* - Búsqueda de Caminos en Videojuegos | meskeIA',
    description:
      'Cómo encuentran el camino los enemigos de un videojuego: A*, Dijkstra y BFS paso a paso sobre una rejilla con muros y terreno costoso.',
    url: 'https://meskeia.com/simulador-pathfinding/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Pathfinding A* | meskeIA',
    description: 'Aprende cómo los videojuegos calculan el camino con A*, Dijkstra y BFS',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Pathfinding A* (Búsqueda de Caminos)',
  description:
    'Simulador interactivo de búsqueda de caminos sobre una rejilla, como el que usan los videojuegos para mover enemigos y NPCs. Compara A* (A estrella), Dijkstra y BFS paso a paso: pinta muros y terreno costoso, marca inicio y meta, activa el movimiento en diagonal y observa qué casillas explora cada algoritmo hasta encontrar la ruta.',
  url: 'https://meskeia.com/simulador-pathfinding/',
  category: 'EducationalApplication',
  features: [
    '3 algoritmos: A*, Dijkstra y BFS',
    'Rejilla editable: pinta muros y terreno costoso (barro)',
    'Marca inicio y meta con un clic',
    'Movimiento en 4 u 8 direcciones (diagonales)',
    'Animación paso a paso con velocidad ajustable',
    'Métricas: casillas exploradas, longitud y coste del camino',
    'Casos de uso reales en videojuegos',
    'En español',
  ],
  keywords: ['pathfinding', 'algoritmo A estrella', 'videojuegos', 'búsqueda de caminos', 'Dijkstra'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el algoritmo A* (A estrella) y por qué se usa en videojuegos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A* es un algoritmo de búsqueda de caminos que encuentra la ruta más corta entre dos puntos sobre una rejilla o grafo. Combina el coste real recorrido (g) con una estimación de lo que falta hasta la meta (heurística h), priorizando las casillas con menor f = g + h. Gracias a esa estimación explora muchas menos casillas que Dijkstra, por lo que es el estándar para mover enemigos y NPCs en videojuegos: es rápido y, si la heurística es admisible, garantiza el camino óptimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre A*, Dijkstra y BFS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BFS (búsqueda en anchura) explora en oleadas y encuentra el camino con menos casillas, pero ignora que unos terrenos cuesten más que otros. Dijkstra sí tiene en cuenta el coste del terreno y halla siempre la ruta más barata, aunque explora en todas direcciones por igual. A* es Dijkstra más una heurística que orienta la búsqueda hacia la meta: encuentra la misma ruta óptima que Dijkstra pero visitando muchas menos casillas. En este simulador puedes ver las tres sobre el mismo mapa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una heurística admisible en pathfinding?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una heurística es una estimación del coste que falta desde una casilla hasta la meta. Se dice que es admisible cuando nunca sobreestima ese coste real. En rejillas se usan la distancia Manhattan (movimiento en 4 direcciones) o la distancia octil/Chebyshov (con diagonales). Que la heurística sea admisible es la condición que garantiza que A* devuelva siempre el camino óptimo; si sobreestima, A* es más rápido pero puede dar una ruta no óptima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo persiguen los enemigos al jugador en un videojuego?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de juegos dividen el escenario en una rejilla de casillas o en una malla de navegación (navmesh) y aplican A* para calcular la ruta desde el enemigo hasta el jugador, esquivando muros y prefiriendo el terreno más barato. El camino se recalcula cuando el jugador se mueve o cambia el escenario. En juegos por turnos también se usa BFS para resaltar las casillas alcanzables en un número dado de pasos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve poner terreno costoso o diagonales en el mapa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El terreno costoso (por ejemplo barro o agua) simula zonas por las que es más lento moverse: entrar en ellas suma más coste, así que un buen algoritmo intentará rodearlas. Es justo donde se nota la diferencia entre BFS (que las atraviesa porque solo cuenta casillas) y Dijkstra o A* (que las evitan si compensa). Activar las diagonales permite moverse en 8 direcciones con coste 1,41 (raíz de 2) por paso diagonal, lo que produce rutas más naturales y obliga a usar una heurística distinta.',
      },
    },
  ],
};
