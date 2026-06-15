import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Historia de la Humanidad en un Reloj - Explicador Visual | meskeIA',
  description: '300.000 años de historia humana comprimidos en 24 horas: agricultura a las 23:52, escritura a las 23:56, Imperio Romano a las 23:58, internet a las 23:59:59. 15 hitos clickables.',
  keywords: 'historia humanidad reloj, perspectiva histórica, homo sapiens, agricultura neolítico, escritura cuneiforme, Imperio Romano, revolución industrial, internet, bachillerato historia, escala temporal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Historia de la Humanidad en un Reloj',
    description: 'Si los 300.000 años del Homo sapiens fueran un día de 24 horas, internet llegó en el último segundo.',
    url: 'https://meskeia.com/visualizador-historia-reloj/',
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
    title: 'La Historia de la Humanidad en un Reloj',
    description: 'Toda la historia humana en 24 horas. Los últimos 200 años: solo el último minuto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Historia Reloj meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Historia de la Humanidad en un Reloj',
  description: 'Visualizador interactivo que comprime 300.000 años de historia del Homo sapiens en un reloj de 24 horas. 15 hitos históricos clickables con su hora exacta, año real, explicación y dato sorprendente. Ideal para Bachillerato e Historia Universal.',
  url: 'https://meskeia.com/visualizador-historia-reloj/',
  features: [
    '15 hitos históricos desde el Homo sapiens hasta internet',
    'Reloj visual con marcas de posición de cada evento',
    'Hora exacta en el reloj de 24 horas para cada hito',
    'Año real + explicación + dato sorprendente para cada evento',
    'Perspectiva temporal de la brevedad de la civilización moderna',
    'Gratuito, en español, ideal para Bachillerato e Historia',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la historia de la humanidad en un reloj?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una metáfora visual que comprime los 300.000 años de existencia del Homo sapiens en un reloj de 24 horas. Con esta escala, cada hora equivale a unos 12.500 años. Permite ver de golpe cuánto tiempo dominamos la caza y la recolección frente a lo reciente que es la agricultura, la escritura o la tecnología moderna.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué hora del reloj aparece la agricultura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La revolución agrícola neolítica, que comenzó hace aproximadamente 10.000 años, aparece a las 23:52 en el reloj de 24 horas. Esto significa que durante casi todo el día (23 horas y 52 minutos) el ser humano vivió como cazador-recolector, sin cultivos ni ganadería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo aparece internet en la escala del reloj?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Internet aparece a las 23:59:59, es decir, en el último segundo del día. La World Wide Web se popularizó en la década de 1990, hace apenas 30 años, lo que en una escala de 300.000 años representa un instante casi imperceptible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es útil este visualizador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de secundaria y bachillerato en asignaturas de Historia Universal, Geografía e Historia o Ciencias Sociales. También resulta valioso para cualquier persona adulta que quiera desarrollar perspectiva sobre la brevedad de la civilización humana respecto a nuestra historia total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre esta representación y otras líneas de tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las líneas de tiempo clásicas suelen comenzar con la escritura o las primeras civilizaciones, omitiendo el 97% de la historia humana. El formato de reloj de 24 horas obliga a incluir toda la existencia del Homo sapiens, haciendo visualmente obvio que la civilización tal como la conocemos ocupa menos del 1% de nuestro tiempo en la Tierra.',
      },
    },
  ],
};
