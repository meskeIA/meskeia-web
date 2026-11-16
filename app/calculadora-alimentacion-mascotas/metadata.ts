import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Alimentación para Perros y Gatos | meskeIA',
  description: 'Calcula la cantidad diaria de comida para tu perro o gato según peso, edad y actividad. Incluye lista de alimentos tóxicos y guía de transición de pienso.',
  keywords: 'alimentación perro, comida gato, cantidad pienso, gramos diarios, ración perro, dieta mascota, alimentos tóxicos perros, chocolate perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Alimentación para Perros y Gatos',
    description: 'Calcula cuánto debe comer tu mascota según su peso, edad y nivel de actividad',
    url: 'https://meskeia.com/calculadora-alimentacion-mascotas/',
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
    title: 'Calculadora de Alimentación para Mascotas',
    description: 'Calcula la ración diaria ideal para tu perro o gato',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Alimentación Mascotas",
  description: "Calcula la cantidad diaria de comida para tu perro o gato según peso, edad y actividad. Incluye lista de alimentos tóxicos y guía de transición de pienso.",
  url: "https://meskeia.com/calculadora-alimentacion-mascotas/",
  category: 'UtilityApplication',
  features: [
    'Calcula las kcal diarias de perro o gato con RER = 70 · peso^0,75 y factores de actividad, etapa de vida y esterilización',
    'Convierte las kcal en gramos de pienso al día, con el rango para piensos de 350-400 kcal por 100 g',
    'Ajusta la ración al peso de referencia según la condición corporal en escala de 9 puntos',
    'Reparte la ración en 2 tomas diarias (3 o 4 en cachorros) con los gramos de cada toma',
    'Pauta de pérdida de peso, nunca por encima de la ración de mantenimiento, con las semanas estimadas a un ritmo seguro',
    'Lista de 12 alimentos tóxicos para mascotas con sus síntomas',
    'Guía de cambio de pienso en 7 días con la proporción de cada etapa',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos gramos de pienso debe comer un perro al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cantidad de pienso diaria depende del peso del perro, su edad y su nivel de actividad. Como referencia, un perro adulto de 10 kg, en su peso, entero y con actividad moderada necesita unas 550 kcal, entre 138 y 157 g al día de un pienso seco de 350 a 400 kcal por 100 g (el cálculo parte de la energía en reposo, 70 · peso^0,75, multiplicada por 1,4). Los cachorros requieren raciones más frecuentes y los perros senior suelen necesitar menos calorías. Siempre hay que consultar también las tablas del fabricante del pienso concreto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debe comer un gato adulto al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un gato adulto de tamaño medio (4-5 kg), en su peso, entero y con actividad normal necesita unos 74-87 g de pienso seco al día, para un pienso de unas 375 kcal por 100 g (entre 280 y 330 kcal). Los gatos esterilizados gastan menos energía y tienden a engordar: la calculadora les reduce la ración un 20 %, lo que deja al mismo gato en unos 59-70 g. Con comida húmeda la cantidad en gramos es mucho mayor: hay que mirar las kcal del envase.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué alimentos son tóxicos para los perros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los alimentos más peligrosos para los perros son el chocolate (contiene teobromina), las uvas y las pasas, la cebolla y el ajo, el xilitol (edulcorante presente en chicles y productos light), el aguacate y el alcohol. Incluso pequeñas cantidades de algunos de estos alimentos pueden causar insuficiencia renal o fallo hepático. Ante cualquier ingestión accidental, consultar al veterinario de inmediato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se hace la transición de un pienso a otro sin que la mascota tenga problemas digestivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cambio de pienso debe ser gradual, en un período de 7 a 10 días. Se comienza mezclando un 25 % del pienso nuevo con un 75 % del antiguo los primeros días, se aumenta progresivamente hasta llegar al 100 % del nuevo pienso al final del proceso. Un cambio brusco puede provocar diarrea, vómitos o rechazo del alimento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Debo cambiar la alimentación de mi mascota cuando envejece?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Las necesidades nutricionales cambian con la edad. Los perros y gatos senior (a partir de los 7-8 años según la raza) necesitan piensos con menor contenido calórico, más fibra y nutrientes específicos para articulaciones y función renal. Existen gamas de pienso formuladas específicamente para cada etapa vital. El veterinario puede orientar sobre el momento adecuado para hacer el cambio.',
      },
    },
  ],
};
