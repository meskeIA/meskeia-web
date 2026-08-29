import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo del Carbono Completo: Reservorios y Flujos | meskeIA',
  description:
    'Los 5 grandes reservorios de carbono en la Tierra (atmósfera, océanos, biota terrestre, suelos, litosfera) y todos los flujos en Gt C/año. La perturbación humana: +10 Gt C/año extra y sus consecuencias en el sistema climático.',
  keywords: [
    'ciclo del carbono',
    'reservorios carbono',
    'flujos carbono Gt',
    'carbono océanos',
    'fotosíntesis carbono',
    'emisiones CO2',
    'sumideros carbono',
    'perturbación antropogénica carbono',
  ],
  openGraph: {
    title: 'Ciclo del Carbono: Reservorios y Flujos | meskeIA',
    description:
      'Por qué los océanos absorben el 30% de nuestras emisiones y qué pasa cuando ese sumidero se satura.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciclo del Carbono: Reservorios y Flujos | meskeIA',
    description: 'Por qué los océanos absorben el 30% de nuestras emisiones y qué pasa cuando ese sumidero se satura.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Ciclo del Carbono Completo: Reservorios y Flujos",
  description: "Los 5 grandes reservorios de carbono en la Tierra (atmósfera, océanos, biota terrestre, suelos, litosfera) y todos los flujos en Gt C/año. La perturbación humana: +10 Gt C/año extra y sus consecuencia",
  url: "https://meskeia.com/visualizador-ciclo-carbono-completo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ciclo del carbono y por qué es importante para el clima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo del carbono es el conjunto de procesos por los que el carbono se mueve entre los cinco grandes reservorios terrestres: atmósfera, océanos, biota terrestre (plantas y animales), suelos y litosfera (rocas y combustibles fósiles). Es el regulador del CO₂ atmosférico y, por tanto, del efecto invernadero y la temperatura media del planeta. Sin él, la Tierra tendría temperaturas extremas incompatibles con la vida tal como la conocemos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto carbono almacenan los océanos comparado con la atmósfera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los océanos almacenan aproximadamente 38.000 Gt de carbono (gigatoneladas), unas 50 veces más que la atmósfera, que contiene en torno a 870 Gt C. Además, los océanos actúan como sumidero neto y absorben alrededor del 30% de las emisiones de CO₂ humanas cada año (unos 3 Gt C/año). El problema es que esta absorción acidifica el agua marina, con efectos negativos sobre corales y organismos con esqueleto calcáreo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué efecto tienen las actividades humanas sobre el ciclo del carbono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las actividades humanas añaden aproximadamente 10 Gt C/año al ciclo natural: unos 8 Gt C/año provienen de la quema de combustibles fósiles y 2 Gt C/año del cambio de uso del suelo (deforestación). El ciclo natural estaba en equilibrio durante miles de años; esta entrada extra no puede ser absorbida completamente por océanos y vegetación, por lo que el CO₂ atmosférico crece a razón de unos 4-5 Gt C/año, causando el calentamiento global observado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo absorben las plantas el carbono y por qué la deforestación lo agrava?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas fijan carbono mediante la fotosíntesis: utilizan la energía solar para transformar CO₂ atmosférico y agua en glucosa y oxígeno. La biota terrestre absorbe unos 120 Gt C/año y devuelve una cantidad similar mediante la respiración, con un flujo neto de absorción de unos 2-3 Gt C/año. Cuando se tala un bosque, el carbono almacenado en la madera se libera rápidamente (quema, descomposición) y se pierde la capacidad futura de absorción, convirtiendo el sumidero en fuente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los sumideros de carbono y cuáles son los principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un sumidero de carbono es cualquier sistema que absorbe más carbono del que emite, reduciendo la concentración de CO₂ en la atmósfera. Los tres sumideros naturales principales son los océanos (~2,9 Gt C/año), los bosques tropicales y boreales (~1,5 Gt C/año) y los suelos con alta materia orgánica. Los sumideros tecnológicos en desarrollo (captura y almacenamiento de carbono, CCS) aún operan a escala muy pequeña, por debajo de 0,05 Gt C/año globalmente.',
      },
    },
  ],
};
