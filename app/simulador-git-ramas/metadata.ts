import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Git: Ramas, Commits y Merge Visual | meskeIA',
  description:
    'Visualiza cómo funciona Git: crea commits, abre ramas, cambia de rama y fúsionalas observando cómo crece el grafo de commits en tiempo real. Entiende HEAD, los punteros de rama y los merges con un commit de fusión, sin tocar la terminal.',
  keywords:
    'git, ramas git, commit, merge, fusión, grafo de commits, HEAD, control de versiones, branch, checkout, git visual, DAG, flujo de trabajo git, FP informática, desarrollo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-git-ramas/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Git: ramas y merge visual | meskeIA',
    description: 'Crea commits, ramas y fusiones y mira crecer el grafo de Git en tiempo real',
    url: 'https://meskeia.com/simulador-git-ramas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Git: ramas y merge visual | meskeIA',
    description: 'Entiende ramas, HEAD y merges viendo crecer el grafo de commits',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Git (ramas y merge)',
  description:
    'Simulador visual de Git para entender el control de versiones. Permite crear commits, abrir y cambiar de ramas y fusionarlas, mostrando en tiempo real el grafo de commits, los punteros de cada rama y el HEAD. Pensado para comprender qué ocurre por debajo de los comandos git commit, git branch, git checkout y git merge sin usar la terminal.',
  url: 'https://meskeia.com/simulador-git-ramas/',
  category: 'EducationalApplication',
  features: [
    'Crea commits y observa crecer el grafo',
    'Abre ramas y cambia entre ellas (checkout)',
    'Fusiona ramas con commit de merge',
    'Visualiza HEAD y los punteros de cada rama',
    'Escenario de ejemplo con rama de característica',
    'Historial de comandos equivalentes de Git',
    'En español',
  ],
  keywords: ['git', 'ramas', 'merge', 'control de versiones', 'commits'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un commit en Git?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un commit es una instantánea del estado de tu proyecto en un momento dado, con un identificador único, un mensaje y una referencia a su commit (o commits) padre. Los commits forman una cadena: cada uno apunta al anterior, creando la historia del proyecto. En el simulador, cada commit es un nodo del grafo enlazado con su padre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una rama (branch) y qué es HEAD?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una rama es simplemente un puntero móvil que señala a un commit; al hacer un nuevo commit, la rama avanza para apuntar a él. HEAD es un puntero especial que indica en qué rama (y por tanto en qué commit) estás trabajando ahora mismo. Crear una rama en Git es una operación instantánea y barata, porque solo se crea un puntero nuevo, no una copia de los archivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre al hacer un merge (fusión)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al fusionar una rama en otra, Git combina sus historias. Si las dos ramas han avanzado por separado, crea un commit de fusión (merge commit) especial que tiene dos padres: el último commit de cada rama. Si la rama de destino no ha cambiado desde que se separó, Git hace un "fast-forward" y simplemente mueve el puntero hacia delante, sin crear un commit nuevo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se dice que las ramas en Git son baratas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque una rama es solo un puntero de 40 caracteres a un commit, no una copia del código. Crear una rama no duplica archivos ni ocupa apenas espacio, a diferencia de sistemas más antiguos. Esto anima a usar muchas ramas: una por cada característica o corrección, que luego se fusionan. Es la base de flujos de trabajo como Git Flow o GitHub Flow.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre merge y rebase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Merge une dos ramas creando un commit de fusión y conserva la historia real, con sus bifurcaciones. Rebase, en cambio, reescribe la historia colocando tus commits encima de otra rama, como si los hubieras hecho a partir de ella, lo que produce una historia lineal y más limpia pero cambia los identificadores de los commits. La regla de oro es no hacer rebase de commits que ya hayas compartido con otras personas.',
      },
    },
  ],
};
