import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el Clima - Efecto Invernadero, Corrientes y Calentamiento Global | meskeIA',
  description: 'Entiende la ciencia del clima: diferencia entre tiempo y clima, efecto invernadero, corrientes oceánicas y consecuencias del calentamiento global a +1°C, +2°C y +4°C. Explicador visual interactivo.',
  keywords: 'clima, efecto invernadero, calentamiento global, CO2, corrientes oceánicas, Gulf Stream, El Niño, cambio climático, temperatura global, París 2015',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el Clima - Efecto Invernadero y Calentamiento Global',
    description: 'La ciencia del clima explicada visualmente: efecto invernadero, corrientes oceánicas y qué pasa a +1°C, +2°C y +4°C de calentamiento.',
    url: 'https://meskeia.com/visualizador-clima/',
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
    title: 'Cómo Funciona el Clima - Explicador Visual',
    description: 'Efecto invernadero, corrientes oceánicas y calentamiento global explicados con datos y visualizaciones.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Clima meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el Clima - Efecto Invernadero y Calentamiento Global',
  description: 'Explicador visual interactivo sobre la ciencia del clima: diferencia entre tiempo y clima, cómo funciona el efecto invernadero, el papel de las corrientes oceánicas, y las consecuencias del calentamiento global a distintos niveles de temperatura.',
  url: 'https://meskeia.com/visualizador-clima/',
  category: 'EducationalApplication',
  features: [
    'Diferencia visual entre tiempo meteorológico y clima',
    'Diagrama del efecto invernadero y balance energético de la Tierra',
    'Evolución histórica del CO2 atmosférico (280 → 425 ppm)',
    'Corrientes oceánicas: Gulf Stream, El Niño/La Niña',
    'Slider de calentamiento: consecuencias a +1°C, +2°C y +4°C',
    'Simulador del ciclo del agua: evaporación, condensación y precipitación',
    'Fenómenos extremos: olas de calor, inundaciones y sequías por nivel de calentamiento',
    'Glosario interactivo de términos climatológicos esenciales',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre tiempo atmosférico y clima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo atmosférico describe las condiciones de la atmósfera en un lugar concreto en un momento dado: temperatura, lluvia, viento, nubes. El clima es el patrón estadístico de esas condiciones a lo largo de décadas (normalmente 30 años o más). Una ola de calor puntual es "tiempo"; que las temperaturas medias de un país hayan subido 1,5°C en un siglo es "cambio climático". La frase habitual es: el tiempo es lo que te pones hoy, el clima es lo que tienes en el armario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el efecto invernadero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sol emite radiación de onda corta que atraviesa la atmósfera y calienta la superficie terrestre. La Tierra reemite ese calor como radiación infrarroja de onda larga. Ciertos gases —vapor de agua, CO₂, metano, óxido nitroso— absorben esa radiación infrarroja y la reenvían hacia la superficie, actuando como una manta que retiene calor. Sin efecto invernadero natural, la temperatura media de la Tierra sería de −18°C en vez de los +15°C actuales. El problema es la intensificación artificial de este efecto por las emisiones humanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juegan las corrientes oceánicas en el clima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las corrientes oceánicas redistribuyen el calor alrededor del planeta. El Gulf Stream, por ejemplo, lleva agua cálida tropical hacia el norte de Europa, haciendo que ciudades como Londres o Dublín tengan inviernos mucho más suaves de lo que correspondería a su latitud. El fenómeno El Niño altera las corrientes del Pacífico tropical cada 3–7 años, provocando sequías e inundaciones en distintas regiones. El calentamiento global amenaza con debilitar estas corrientes al alterar la salinidad y temperatura del agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué consecuencias tiene un calentamiento global de 2°C?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A +2°C respecto a niveles preindustriales, los modelos climáticos estiman: desaparición del 99% de los arrecifes de coral, aumento del nivel del mar de 40–60 cm, olas de calor que antes ocurrían cada 50 años pasarán a ocurrir cada 5, pérdida de hasta el 18% de las especies evaluadas y riesgo elevado de escasez hídrica para cientos de millones de personas. El Acuerdo de París de 2015 fija como límite "seguro" los +1,5°C, aunque los compromisos actuales de los países apuntan a +2,5–3°C para finales de siglo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo ha evolucionado el CO₂ atmosférico desde la industrialización?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Antes de la Revolución Industrial (siglo XVIII) la concentración de CO₂ era de unas 280 partes por millón (ppm). En 2024 se superaron por primera vez las 425 ppm de media anual, el nivel más alto en al menos 3 millones de años según registros de núcleos de hielo. Este aumento se debe principalmente a la quema de combustibles fósiles (carbón, petróleo, gas), la deforestación y la industria cementera. El CO₂ permanece en la atmósfera entre 300 y 1.000 años.',
      },
    },
  ],
};
