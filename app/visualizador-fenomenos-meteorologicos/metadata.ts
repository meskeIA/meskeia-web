import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas | meskeIA',
  description: 'Explicador visual interactivo de meteorologia: tipos de nubes por altitud, como se forma la lluvia, nieve y granizo, rayos, huracanes, tornados y DANA. Datos fascinantes.',
  keywords: 'tipos de nubes, meteorologia, precipitaciones, lluvia, nieve, granizo, rayos, huracanes, tornados, DANA, gota fria, fenomenos meteorologicos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas',
    description: 'Descubre que cuentan las nubes, como se forma la lluvia o la nieve, por que caen rayos y como nacen los huracanes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-fenomenos-meteorologicos/',
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
    title: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas',
    description: 'Un rayo alcanza 30.000 grados C — 5 veces la superficie del Sol. Explicador visual interactivo de meteorologia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fenomenos Meteorologicos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas',
  description: 'Explicador visual interactivo de meteorologia: 10 tipos de nubes clasificados por altitud, formacion de lluvia, nieve y granizo, rayos, huracanes, tornados y DANA. Datos y curiosidades atmosfericas.',
  url: 'https://meskeia.com/visualizador-fenomenos-meteorologicos/',
  features: [
    'Clasificacion de 10 tipos de nubes por altitud con diagrama SVG',
    'Formacion de lluvia, nieve, granizo y niebla explicada paso a paso',
    'Rayos, huracanes, tornados y DANA con datos reales',
    'Datos y curiosidades meteorologicas fascinantes',
    'Disponible en espanol',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se clasifican los tipos de nubes por altitud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las nubes se dividen en tres pisos según su base: nubes altas (cirros, cirrocúmulos y cirrostratos, entre 6.000 y 12.000 m), nubes medias (altocúmulos y altostratos, entre 2.000 y 6.000 m) y nubes bajas (estratocúmulos, estratos y nimboestratos, por debajo de 2.000 m). Además existen nubes de desarrollo vertical como el cúmulo y el cumulonimbo, que pueden abarcar varios pisos a la vez y son las responsables de tormentas eléctricas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué cae lluvia y no nieve aunque haga frío?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La precipitación cae como nieve cuando la temperatura es inferior a 0 °C en toda la columna de aire desde la nube hasta el suelo. Si hay una capa de aire más cálido cerca del suelo, los copos se derriten antes de llegar y caen como lluvia. El granizo se forma en cumulonimbos con fuertes corrientes ascendentes que mantienen las partículas de hielo en suspensión mientras se recubren de capas sucesivas hasta que pesan lo suficiente para caer.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una DANA y por qué provoca lluvias torrenciales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una DANA (Depresión Aislada en Niveles Altos), conocida popularmente como "gota fría", es una masa de aire frío que se desprende de la corriente en chorro y queda aislada en altura sobre una zona. Al interactuar con aire cálido y húmedo del Mediterráneo, genera inestabilidad intensa y precipitaciones muy localizadas que pueden superar los 200 litros por metro cuadrado en pocas horas. Es el fenómeno meteorológico más peligroso del Mediterráneo occidental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se forma un rayo y por qué el trueno llega después?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un cumulonimbo, el choque entre partículas de hielo y agua genera una separación de cargas: positivas en la parte superior y negativas en la base. Cuando la diferencia de potencial supera los 100 millones de voltios, se produce una descarga eléctrica (el rayo) que alcanza entre 20.000 y 30.000 °C, cinco veces más caliente que la superficie del Sol. El trueno es la onda de choque producida por esa expansión brusca del aire, que viaja a 340 m/s; por eso llega segundos después de ver el relámpago.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un huracán, un tifón y un ciclón tropical?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son el mismo fenómeno meteorológico: una tormenta tropical organizada con vientos sostenidos superiores a 119 km/h que gira en torno a un centro de baja presión (ojo). El nombre cambia según la cuenca oceánica: se llama huracán en el Atlántico y el Pacífico este, tifón en el Pacífico noroeste, y ciclón tropical en el Índico y el Pacífico sur. Todos se forman sobre aguas cálidas (>26 °C) y se debilitan al tocar tierra o aguas más frías.',
      },
    },
  ],
};
