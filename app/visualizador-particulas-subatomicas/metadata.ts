import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Partículas Subatómicas y Modelo Estándar - Quarks, Leptones, Bosones | meskeIA',
  description:
    'Explora el Modelo Estándar de la física de partículas: quarks, leptones y bosones. Mecanismo de Higgs, las 4 fuerzas fundamentales, el LHC y por qué existe más materia que antimateria.',
  keywords: [
    'modelo estandar',
    'particulas subatomicas',
    'quarks',
    'leptones',
    'bosones',
    'higgs',
    'LHC',
    'fuerzas fundamentales',
    'fisica de particulas',
    'gluon',
    'foton',
    'antimateria',
    'mecanismo de higgs',
  ],
  openGraph: {
    title: 'Partículas Subatómicas | meskeIA',
    description:
      'Modelo Estándar completo: quarks, leptones, bosones y las 4 fuerzas fundamentales con visualizaciones interactivas',
    url: 'https://meskeia.com/visualizador-particulas-subatomicas/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Partículas Subatómicas y Modelo Estándar',
  description:
    'Explora el Modelo Estándar de la física de partículas: quarks, leptones y bosones. Mecanismo de Higgs, las 4 fuerzas fundamentales, el LHC y por qué existe más materia que antimateria.',
  url: 'https://meskeia.com/visualizador-particulas-subatomicas/',
  features: [
    'Tabla interactiva del Modelo Estándar con 17 partículas fundamentales',
    'Panel de detalles de cada partícula: masa, carga, spin, descubrimiento',
    'Toggle de antipartículas',
    'Badges Nobel para partículas con premio Nobel',
    'Las 4 fuerzas fundamentales y sus portadores',
    'Diagramas de Feynman simplificados',
    'Animación del mecanismo de Higgs',
    'Línea de tiempo del descubrimiento del bosón de Higgs',
    'Visualización del LHC y sus detectores',
    'Explicación de la asimetría materia-antimateria',
  ],
  category: 'EducationalApplication',
  keywords: [
    'modelo estandar',
    'quarks',
    'leptones',
    'bosones',
    'higgs',
    'LHC',
    'fuerzas fundamentales',
    'fisica particulas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Modelo Estándar de la física de partículas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Modelo Estándar es la teoría que describe los componentes fundamentales de la materia y las fuerzas que actúan entre ellos. Clasifica 17 partículas elementales: 6 quarks, 6 leptones (entre ellos el electrón) y 5 bosones portadores de fuerza. Ha sido verificado con extraordinaria precisión a lo largo de décadas de experimentos y es uno de los logros más exitosos de la física teórica, aunque no incluye la gravedad ni la materia oscura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre quarks, leptones y bosones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los quarks son los constituyentes de los protones y neutrones; se combinan en grupos de dos o tres y nunca se observan aislados. Los leptones, como el electrón y el neutrino, no están sujetos a la fuerza fuerte y pueden existir libres. Los bosones son las partículas portadoras de fuerza: el fotón transmite el electromagnetismo, los bosones W y Z la fuerza débil, el gluón la fuerza fuerte y el bosón de Higgs da masa a las partículas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el Large Hadron Collider (LHC) del CERN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El LHC es el acelerador de partículas más grande del mundo, con 27 km de circunferencia bajo la frontera franco-suiza. Acelera protones casi hasta la velocidad de la luz y los hace colisionar para recrear condiciones similares a las del Big Bang. Sus detectores (ATLAS, CMS, ALICE, LHCb) registran millones de colisiones por segundo. En 2012 confirmó la existencia del bosón de Higgs, la última partícula predicha por el Modelo Estándar aún no descubierta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el mecanismo de Higgs y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mecanismo de Higgs explica por qué las partículas elementales tienen masa. Postula la existencia de un campo de Higgs que permea todo el universo; las partículas que interactúan con él adquieren masa de forma proporcional a esa interacción (el fotón, que no interactúa, no tiene masa en reposo). El bosón de Higgs es la excitación cuántica de ese campo y su descubrimiento experimental en el LHC en 2012 fue reconocido con el Premio Nobel de Física en 2013.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué existe más materia que antimateria en el universo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el Big Bang se crearon cantidades casi iguales de materia y antimateria. Cuando materia y antimateria se encuentran se aniquilan mutuamente, pero parece que hubo una pequeña asimetría: por cada 10.000 millones de pares materia-antimateria, sobraba una partícula de materia. Ese pequeño exceso es todo lo que existe hoy como universo visible. La causa exacta de esa asimetría, denominada violación CP, es uno de los grandes problemas abiertos de la física actual.',
      },
    },
  ],
};
