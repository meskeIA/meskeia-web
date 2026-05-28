import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fases de la Luna y Eclipses - La Danza Sol-Tierra-Luna | meskeIA',
  description: 'Explora las fases lunares, eclipses solares y lunares, y mareas con diagramas interactivos. Geometría Sol-Tierra-Luna animada. Explicador visual.',
  keywords: 'fases luna, eclipse solar, eclipse lunar, mareas, luna llena, luna nueva, cuarto creciente, cuarto menguante, luna de sangre, astronomía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fases de la Luna y Eclipses - La Danza Sol-Tierra-Luna',
    description: 'Fases lunares, eclipses solares y lunares, mareas y datos fascinantes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-fases-luna-eclipses/',
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
    title: 'Fases de la Luna y Eclipses - Explicador Visual',
    description: 'Explora la danza Sol-Tierra-Luna: fases, eclipses, mareas y curiosidades cósmicas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fases Luna meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fases de la Luna y Eclipses - La Danza Sol-Tierra-Luna',
  description: 'Explicador visual interactivo sobre las fases lunares, eclipses solares y lunares, mareas y datos fascinantes sobre la relación Sol-Tierra-Luna.',
  url: 'https://meskeia.com/visualizador-fases-luna-eclipses/',
  category: 'EducationalApplication',
  features: [
    'Diagrama orbital interactivo con 8 fases lunares clickables',
    'Eclipses solares y lunares con conos de sombra visuales',
    'Mareas: por qué hay 2 al día, mareas vivas y muertas',
    'Datos fascinantes sobre la Luna y su relación con la Tierra',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funcionan las fases de la Luna?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las fases lunares ocurren porque la Luna orbita la Tierra y, según su posición relativa al Sol, vemos iluminada una porción distinta de su superficie. Cuando el Sol, la Tierra y la Luna se alinean con la Luna en el lado opuesto al Sol, vemos la cara completamente iluminada (luna llena). Cuando la Luna está entre la Tierra y el Sol, el lado iluminado mira hacia el Sol y no hacia nosotros (luna nueva). Las posiciones intermedias producen los cuartos creciente y menguante, así como las fases gibbosa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dura el ciclo lunar completo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo lunar sinódico, que va de luna nueva a luna nueva, dura aproximadamente 29 días, 12 horas y 44 minutos (unos 29,5 días). Este es el período que se usa en los calendarios lunares. Existe también el mes sidéreo, de unos 27,3 días, que es el tiempo que tarda la Luna en completar una órbita respecto a las estrellas fijas, sin tener en cuenta el movimiento de la Tierra alrededor del Sol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un eclipse solar y un eclipse lunar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un eclipse solar ocurre cuando la Luna se interpone entre el Sol y la Tierra, proyectando su sombra sobre la superficie terrestre. Solo es visible desde las zonas donde cae esa sombra. Un eclipse lunar ocurre cuando la Tierra se interpone entre el Sol y la Luna, y la sombra de la Tierra cubre total o parcialmente la Luna. Los eclipses lunares son visibles desde cualquier lugar de la Tierra donde sea de noche en ese momento, por lo que son mucho más frecuentes de observar que los solares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se predicen los eclipses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los eclipses se predicen gracias a dos ciclos conocidos desde la antigüedad. El ciclo de Saros, de aproximadamente 18 años, 11 días y 8 horas, determina la repetición de eclipses con geometría similar. Además, los astrónomos calculan con precisión las órbitas de la Tierra y la Luna mediante mecánica orbital y efemérides astronómicas. Los eclipses no ocurren en cada luna nueva o llena porque la órbita lunar está inclinada unos 5° respecto a la eclíptica, por lo que la alineación perfecta solo se produce cuando la Luna cruza el plano orbital de la Tierra (los nodos orbitales).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las fases de la Luna afectan a las mareas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, las fases lunares están directamente relacionadas con las mareas. La gravedad de la Luna atrae el agua de los océanos, creando bulges de agua en el lado más cercano y en el lado opuesto de la Tierra, lo que produce dos mareas altas y dos mareas bajas cada día. Durante luna llena y luna nueva, el Sol, la Tierra y la Luna se alinean, y las fuerzas gravitacionales del Sol y la Luna se suman, produciendo las mareas vivas (de mayor amplitud). En los cuartos creciente y menguante, el Sol y la Luna forman un ángulo recto respecto a la Tierra, y sus efectos se atenúan mutuamente, originando las mareas muertas (de menor amplitud).',
      },
    },
  ],
};
