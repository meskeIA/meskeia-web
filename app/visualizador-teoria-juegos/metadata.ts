import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Teoría de Juegos: Dilema del Prisionero y Equilibrio de Nash | meskeIA',
  description:
    'Juega al Dilema del Prisionero y descubre el Equilibrio de Nash. Visualizador interactivo de teoría de juegos: suma cero, cooperativos, tragedia de los comunes y aplicaciones reales.',
  keywords: [
    'teoría de juegos',
    'dilema del prisionero',
    'equilibrio de Nash',
    'tragedia de los comunes',
    'juegos suma cero',
    'tit-for-tat',
    'Von Neumann',
    'Nash Nobel',
  ],
  openGraph: {
    title: 'Teoría de Juegos: Dilema del Prisionero y Equilibrio de Nash',
    description:
      '¿Cooperarías o delatarías? Juega el dilema que explica desde la Guerra Fría hasta el cambio climático.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Teoría de Juegos: Dilema del Prisionero y Nash",
  description: "Juega al Dilema del Prisionero y descubre el Equilibrio de Nash. Visualizador interactivo de teoría de juegos: suma cero, cooperativos, tragedia de los comunes y aplicaciones reales.",
  url: "https://meskeia.com/visualizador-teoria-juegos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Dilema del Prisionero y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Dilema del Prisionero es un juego en el que dos jugadores deben elegir simultáneamente entre cooperar o traicionar sin conocer la decisión del otro. Si ambos cooperan, obtienen la mejor recompensa colectiva; si ambos traicionan, el peor resultado conjunto; si uno traiciona y el otro coopera, el traidor gana al máximo y el cooperador pierde. Es importante porque modela dilemas reales como las carreras armamentísticas, la evasión fiscal o los acuerdos comerciales: la lógica individual empuja a traicionar aunque la cooperación sería mejor para todos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Equilibrio de Nash y qué implica en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un Equilibrio de Nash es una combinación de estrategias en la que ningún jugador puede mejorar su resultado cambiando unilateralmente su decisión, dado lo que hacen los demás. John Nash demostró que todo juego finito tiene al menos un equilibrio de este tipo. En la práctica, identifica situaciones de bloqueo estable: mercados oligopólicos, guerras de precios o elecciones en las que todos están atrapados aunque exista una solución mejor para todos si pudieran coordinarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la estrategia Tit-for-Tat y por qué ganó los torneos de Axelrod?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tit-for-Tat (ojo por ojo) consiste en cooperar en la primera ronda y luego replicar exactamente lo que hizo el rival en la ronda anterior. Robert Axelrod organizó torneos de Dilema del Prisionero iterado en los años 80 y esta estrategia ganó sistemáticamente por ser amistosa (empieza cooperando), retaliativa (no deja pasar traiciones) y perdonadora (vuelve a cooperar en cuanto el rival lo hace). Es una de las bases evolutivas de la cooperación en poblaciones donde los individuos se encuentran repetidamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un juego de suma cero y uno de suma no cero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un juego de suma cero lo que gana un jugador lo pierde otro (póker, ajedrez, negociaciones distributivas). En un juego de suma no cero los pagos totales pueden variar: ambos jugadores pueden ganar más cooperando (comercio internacional, acuerdos medioambientales) o ambos perder más compitiendo. La mayoría de situaciones económicas y sociales reales son de suma no cero, lo que significa que hay margen para crear valor colectivo a través de la cooperación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo explica la teoría de juegos la tragedia de los comunes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tragedia de los comunes describe cómo un recurso compartido se sobreexplota cuando cada individuo actúa racionalmente en su propio interés. Modelada como un juego n-jugadores, cada participante tiene incentivos para usar más del recurso antes que los otros, aunque el resultado colectivo sea la destrucción del bien común (pesquerías, acuíferos, atmósfera). Las soluciones identificadas por la teoría de juegos incluyen la regulación pública, la privatización o los acuerdos de cooperación vinculantes, como demostró Elinor Ostrom (Nobel 2009).',
      },
    },
  ],
};
