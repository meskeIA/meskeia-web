import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las Estaciones del Año - Por qué la Inclinación de 23,5° lo Cambia Todo | meskeIA',
  description: 'Explora por qué existen las estaciones: inclinación de 23,5°, solsticios, equinoccios, horas de luz por latitud y mitos comunes. Explicador visual interactivo.',
  keywords: 'estaciones del año, inclinación eje terrestre, 23.5 grados, solsticio, equinoccio, horas de luz, latitud, órbita terrestre, perihelio, afelio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las Estaciones del Año - Por qué la Inclinación de 23,5° lo Cambia Todo',
    description: 'La Tierra no está más cerca del Sol en verano. La clave son 23,5° de inclinación. Explora la órbita, horas de luz y mitos.',
    url: 'https://meskeia.com/visualizador-estaciones-ano/',
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
    title: 'Las Estaciones del Año - Explicador Visual Interactivo',
    description: 'Por qué 23,5° de inclinación explican las estaciones. Solsticios, equinoccios, horas de luz y mitos desmontados.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estaciones del Año meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las Estaciones del Año - Por qué la Inclinación de 23,5° lo Cambia Todo',
  description: 'Explicador visual interactivo sobre las estaciones: la inclinación del eje terrestre de 23,5°, la órbita en 4 posiciones clave, horas de luz por latitud, solsticios y equinoccios, y mitos desmontados como que estamos más cerca del Sol en verano.',
  url: 'https://meskeia.com/visualizador-estaciones-ano/',
  category: 'EducationalApplication',
  features: [
    'Diagrama SVG de la órbita terrestre con las 4 posiciones clave (solsticios y equinoccios)',
    'Slider de latitud: horas de luz desde el ecuador hasta los polos en cada estación',
    'Fechas exactas de solsticios y equinoccios con explicación de cada fenómeno',
    'Mitos desmontados: perihelio en enero, afelio en julio, estaciones en otros planetas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué hay estaciones del año si la distancia al Sol varía poco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las estaciones no se deben a la distancia entre la Tierra y el Sol, sino a la inclinación del eje terrestre, que es de 23,5° respecto a la vertical de su órbita. Esta inclinación hace que, según la posición en la órbita, cada hemisferio reciba los rayos solares con un ángulo diferente y durante más o menos horas. En enero, la Tierra está en el punto más cercano al Sol (perihelio), pero el hemisferio norte tiene invierno porque el Sol incide de forma oblicua y con menos horas de luz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo ocurren los solsticios y los equinoccios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los solsticios se producen aproximadamente el 21 de junio (solsticio de verano en el hemisferio norte, con el día más largo del año) y el 21 de diciembre (solsticio de invierno, con el día más corto). Los equinoccios ocurren alrededor del 20 de marzo y del 22 de septiembre, cuando el eje terrestre no apunta hacia ni desde el Sol y la duración del día y la noche es casi idéntica en todo el planeta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las horas de luz son iguales en todo el mundo durante cada estación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Las horas de luz dependen de la latitud. En el ecuador la diferencia entre estaciones es mínima, con aproximadamente 12 horas de luz todo el año. A medida que nos alejamos hacia los polos, la diferencia se hace más extrema: en latitudes altas (por encima de 60-65°) puede haber varios días de oscuridad total en invierno o de luz continua en verano (sol de medianoche). En España, por ejemplo, la diferencia entre el día más largo y el más corto supera las 6 horas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el solsticio de verano y el día más caluroso del año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El solsticio de verano (en torno al 21 de junio en el hemisferio norte) es el día con más horas de luz solar, pero no suele coincidir con el día más caluroso. El calor máximo llega varias semanas después, generalmente a finales de julio o en agosto, porque los océanos y la superficie terrestre necesitan tiempo para acumular la energía recibida y elevar la temperatura ambiente. Este desfase se conoce como "inercia térmica".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Todos los planetas tienen estaciones como la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No todos. Las estaciones dependen de la inclinación axial de cada planeta. Marte tiene una inclinación similar a la terrestre (25,2°) y por tanto también tiene estaciones, aunque más largas porque su año dura casi el doble. Júpiter, con apenas 3° de inclinación, prácticamente no tiene estaciones. Urano es el caso extremo: su eje está inclinado 98°, lo que provoca que cada polo pase décadas en luz continua y luego en oscuridad total.',
      },
    },
  ],
};
