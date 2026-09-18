import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Luxómetro Online - Mide la Intensidad de Luz con tu Móvil o Celular | meskeIA',
  description: 'Estima la luz de una escena con la cámara trasera de tu móvil o celular: nivel relativo, y lux si lo calibras con un luxómetro de referencia. Para fotógrafos, con recomendaciones de ISO, apertura y velocidad.',
  keywords: 'luxometro, luxometro celular, fotometro, medir luz, intensidad luminosa, lux, luxometro movil, fotografia, exposicion, iso, apertura, velocidad obturacion, iluminacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Luxómetro Online - Mide la Intensidad de Luz con tu Móvil o Celular',
    description: 'Mide la luz ambiente con tu móvil o celular. Recomendaciones fotográficas incluidas.',
    url: 'https://meskeia.com/luxometro/',
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
    title: 'Luxómetro Online - meskeIA',
    description: 'Mide la intensidad de luz con tu móvil o celular y obtén recomendaciones para fotografía.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Luxómetro meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Luxómetro / Fotómetro",
  description: "Estima la luz de una escena con la cámara de tu dispositivo. Publica un nivel relativo y, una vez calibrada con un luxómetro de referencia, la lectura en lux. Para fotógrafos, con recomendaciones de ISO, apertura y velocidad.",
  url: "https://meskeia.com/luxometro/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un luxómetro y para qué sirve?',
      acceptedAnswer: { '@type': 'Answer', text: 'Un luxómetro es un instrumento que mide la iluminancia, es decir, la cantidad de luz que incide sobre una superficie, expresada en lux (lx). Se usa para evaluar si la iluminación de un espacio es adecuada para actividades como fotografía, lectura, trabajo de oficina o plantas de interior. En interiores se recomiendan entre 300 y 500 lux para trabajar cómodamente; en exteriores con sol directo se pueden superar los 100.000 lux.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un luxómetro online?',
      acceptedAnswer: { '@type': 'Answer', text: 'Analiza el brillo medio de los fotogramas de la cámara. Eso tiene un límite que conviene conocer: la cámara ajusta sola la exposición y la ganancia, así que lleva cualquier escena hacia el gris medio y el brillo del fotograma no basta para deducir cuánta luz hay. Por eso, sin calibrar, una medición honesta solo puede dar un nivel relativo; para obtener lux hay que anclar la escala con el valor de un luxómetro de referencia medido en esa misma escena. La API de sensor de luz ambiente daría la iluminancia directamente, pero ningún navegador de uso común la expone hoy.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué valores de lux son normales en diferentes situaciones?',
      acceptedAnswer: { '@type': 'Answer', text: 'Los valores orientativos más habituales son: habitación poco iluminada 50-100 lux, oficina estándar 300-500 lux, estudio fotográfico 1.000-5.000 lux, día nublado en exterior 1.000-10.000 lux y sol directo más de 50.000-100.000 lux. Conocer el nivel de luz ayuda a ajustar la configuración de la cámara y a garantizar condiciones adecuadas de trabajo o estudio.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usan los lux para ajustar los parámetros de una cámara fotográfica?',
      acceptedAnswer: { '@type': 'Answer', text: 'Conociendo los lux ambientales puedes estimar la exposición adecuada. Con poca luz (menos de 200 lux) conviene subir el ISO (800-3200), abrir el diafragma (f/1,8-f/2,8) y reducir la velocidad de obturación. Con luz abundante (más de 10.000 lux) se puede usar ISO 100, diafragma cerrado (f/8-f/11) y velocidades rápidas (1/500-1/2000 s). La relación entre lux y EV (valor de exposición) permite calcular la configuración óptima.' },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable un luxómetro de móvil o celular frente a uno profesional?',
      acceptedAnswer: { '@type': 'Answer', text: 'No es el mismo instrumento. Un luxómetro tiene un fotodiodo con respuesta espectral corregida y ganancia fija; un móvil mide con una cámara que reajusta la exposición sola, y ese reajuste es justo lo que impide deducir la iluminancia del brillo de la imagen. Calibrado contra una referencia y sin mover el encuadre sirve para comparar puntos de una misma estancia; para acreditar el cumplimiento de una norma de iluminación en un puesto de trabajo hace falta un aparato con certificado de trazabilidad.' },
    },
  ],
};
