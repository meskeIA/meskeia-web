import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tirador de Dados Online | Dados Virtuales para Rol y Juegos de Mesa | meskeIA',
  description: 'Lanza dados virtuales online: D4, D6, D8, D10, D12, D20 y D100. Perfecto para D&D, Pathfinder, juegos de mesa y rol. Historial, suma automática y múltiples dados.',
  keywords: 'tirador de dados, dados online, dados virtuales, D20, D6, dungeons and dragons, pathfinder, juegos de rol, RPG, dados para juegos de mesa, generador dados aleatorios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tirador de Dados Online - Dados Virtuales',
    description: 'Lanza dados virtuales para juegos de rol y mesa. D4, D6, D8, D10, D12, D20 y D100 con historial y suma automática.',
    url: 'https://meskeia.com/tirador-dados/',
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
    title: 'Tirador de Dados Online',
    description: 'Dados virtuales para D&D, Pathfinder y juegos de mesa. Múltiples tipos de dados con historial.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Tirador de Dados meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Tirador de Dados",
  description: "Lanza dados virtuales online: D4, D6, D8, D10, D12, D20 y D100. Perfecto para D&D, Pathfinder, juegos de mesa y rol. Historial, suma automática y múltiples dados.",
  url: "https://meskeia.com/tirador-dados/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de dados puedo lanzar online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tiradores de dados online suelen incluir los tipos estándar de juegos de rol: D4 (4 caras), D6 (6 caras, el dado clásico de mesa), D8 (8 caras), D10 (10 caras), D12 (12 caras), D20 (20 caras, fundamental en D&D y Pathfinder) y D100 (porcentual, usado para tiradas de habilidad). También permiten lanzar varios dados a la vez y sumar los resultados automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué juegos de rol sirve un tirador de dados online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un tirador de dados online es compatible con la mayoría de juegos de rol de mesa: Dungeons & Dragons (D&D 5e), Pathfinder, Warhammer Fantasy Roleplay, Call of Cthulhu, Vampire: The Masquerade y muchos otros. Cada sistema utiliza combinaciones distintas de dados (ej. D&D usa principalmente D20 para acciones y D6/D8/D10/D12 para daño).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es realmente aleatorio un tirador de dados virtual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los tiradores de dados online emplean generadores de números pseudoaleatorios del navegador o del servidor, que producen distribuciones estadísticamente uniformes. Cada cara de un dado tiene la misma probabilidad de salir: 1/6 en un D6, 1/20 en un D20, etc. El resultado de cada lanzamiento es independiente de los anteriores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo lanzar múltiples dados a la vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La mayoría de tiradores permiten seleccionar cuántos dados del mismo tipo se lanzan simultáneamente y muestran el resultado individual de cada dado junto con la suma total. Esto es especialmente útil para tiradas de daño en juegos de rol (ej. 2D6+3 o 4D8) o para juegos de mesa que requieren varios dados a la vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja tiene un dado virtual frente a uno físico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los dados virtuales son matemáticamente perfectos: no se pueden cargar ni desgastar con el uso, siempre producen probabilidades exactas. Además permiten lanzar tipos de dado poco comunes (D4, D100) sin necesidad de tenerlos físicamente, guardar historial de tiradas, lanzar muchos dados a la vez y usarlos en partidas online o en movimiento desde el móvil.',
      },
    },
  ],
};
