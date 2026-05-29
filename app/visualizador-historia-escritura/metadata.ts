import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Evolución de la Escritura - De las Cuevas al Emoji | meskeIA',
  description: 'Recorre 40.000 años de historia de la escritura: pinturas rupestres, cuneiforme, jeroglíficos, el alfabeto, la imprenta de Gutenberg y los emojis. Explicador visual interactivo.',
  keywords: 'historia escritura, cuneiforme, jeroglíficos, alfabeto fenicio, Gutenberg, imprenta, emojis, evolución escritura, papiro, pergamino, papel',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Evolución de la Escritura',
    description: 'De las pinturas rupestres a los emojis: 40.000 años de historia de la comunicación escrita. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-historia-escritura/',
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
    title: 'La Evolución de la Escritura',
    description: '40.000 años de escritura: cuevas, cuneiforme, alfabetos, Gutenberg y emojis. ¿Estamos volviendo a los pictogramas?',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Historia de la Escritura meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Evolución de la Escritura',
  description: 'Explicador visual interactivo sobre la historia de la escritura: desde la tradición oral y las pinturas rupestres hasta los emojis y la IA generativa. Cuneiforme, jeroglíficos, el alfabeto fenicio, la imprenta de Gutenberg y la revolución digital.',
  url: 'https://meskeia.com/visualizador-historia-escritura/',
  features: [
    'Línea temporal desde las pinturas rupestres (40.000 a.C.) hasta los emojis',
    'Grandes sistemas de escritura: cuneiforme, jeroglíficos, caracteres chinos, alfabeto',
    'La revolución del papel: papiro, pergamino, imprenta, era digital',
    'El futuro de escribir: emojis, IA, voz — ¿volvemos a los pictogramas?',
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
      name: '¿Cuándo se inventó la escritura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escritura cuneiforme sumeria, considerada el primer sistema de escritura propiamente dicho, surgió en Mesopotamia (actual Iraq) hacia el 3100-3200 a.C. Sin embargo, las pinturas rupestres y marcas simbólicas en hueso se remontan a hace unos 40.000 años. La escritura nació principalmente para llevar registros contables y administrativos, no para literatura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre escritura cuneiforme y jeroglíficos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuneiforme mesopotámico usaba marcas en forma de cuña trazadas en tablillas de arcilla, y evolucionó de pictogramas a signos silábicos y luego a signos fonéticos. Los jeroglíficos egipcios, desarrollados hacia el 3100 a.C., combinaban logogramas (signos de palabras) con fonogramas (signos de sonidos). Ambos sistemas surgieron de forma paralela, aunque los jeroglíficos mantuvieron siempre un componente pictórico más visible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo revolucionó la imprenta de Gutenberg la historia de la escritura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Johannes Gutenberg desarrolló la imprenta de tipos móviles hacia 1450, lo que permitió reproducir textos a gran escala de forma rápida y económica. Antes, copiar un libro tardaba meses. La imprenta aceleró la alfabetización, permitió la Reforma Protestante, estandarizó los idiomas nacionales y democratizó el acceso al conocimiento en Europa, cambiando el curso de la historia occidental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿De dónde viene el alfabeto que usamos hoy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alfabeto latino que usamos hoy desciende del alfabeto fenicio (siglo XI a.C.), que fue el primero en representar solo consonantes con signos individuales. Los griegos lo adoptaron hacia el 800 a.C. añadiendo vocales. De los griegos lo tomaron los romanos, que crearon el alfabeto latino y lo extendieron por Europa con el Imperio Romano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los emojis son una nueva forma de escritura pictográfica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los emojis tienen similitudes formales con los pictogramas: son imágenes que representan conceptos o emociones directamente, sin mediación fonética. Sin embargo, no forman un sistema de escritura completo porque no pueden representar el lenguaje con precisión gramatical ni fonológica. Algunos lingüistas los interpretan como un retorno parcial a la comunicación visual, complementaria al texto alfabético, no sustituta.',
      },
    },
  ],
};
