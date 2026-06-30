import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Efecto Doppler: Visualizador Interactivo | meskeIA',
  description: 'Visualiza el efecto Doppler: ondas sonoras comprimidas y expandidas, fórmula matemática, radar de velocidad, ecografía Doppler y redshift de galaxias.',
  keywords: ['efecto Doppler', 'ondas sonoras', 'frecuencia', 'redshift', 'radar velocidad', 'radar de velocidad de carros', 'velocidad de autos', 'ecografía Doppler', 'física'],
  openGraph: {
    title: 'Efecto Doppler: Visualizador Interactivo | meskeIA',
    description: 'Por qué suenan diferente las sirenas cuando se acercan y se alejan — y cómo esto mide galaxias.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Efecto Doppler: De las Sirenas al Redshift de Galaxias",
  description: "Visualiza el efecto Doppler: ondas sonoras comprimidas y expandidas, fórmula matemática, radar de velocidad, ecografía Doppler y redshift de galaxias.",
  url: "https://meskeia.com/visualizador-efecto-doppler/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el efecto Doppler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto Doppler es el cambio aparente en la frecuencia de una onda (sonido, luz, radio) cuando la fuente y el observador se mueven el uno respecto al otro. Cuando la fuente se acerca, las ondas se comprimen y la frecuencia percibida aumenta; cuando se aleja, las ondas se expanden y la frecuencia disminuye. Fue descrito por el físico austriaco Christian Doppler en 1842.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué cambia el sonido de una sirena cuando pasa a tu lado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando la ambulancia se acerca, las ondas sonoras se comprimen entre el vehículo y el oyente, resultando en un tono más agudo. En el momento en que pasa y comienza a alejarse, las ondas se estiran y el tono baja de forma perceptible. Este cambio brusco de tono es la manifestación más cotidiana del efecto Doppler.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo usa la policía el efecto Doppler para medir la velocidad de los coches (carros o autos)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los radares de velocidad emiten microondas y miden el cambio de frecuencia de la señal reflejada por el vehículo. Aplicando la fórmula Doppler, el radar calcula con precisión la velocidad a la que se mueve el coche (carro o auto). La velocidad se obtiene de la diferencia entre la frecuencia emitida y la frecuencia reflejada recibida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el redshift y cómo se relaciona con el efecto Doppler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El redshift (desplazamiento al rojo) es el efecto Doppler aplicado a la luz: cuando una galaxia se aleja de la Tierra, su luz se desplaza hacia longitudes de onda más largas (el rojo del espectro visible). Edwin Hubble usó este principio en 1929 para demostrar que el universo se expande, ya que casi todas las galaxias muestran redshift.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el efecto Doppler en medicina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ecografía Doppler mide la velocidad del flujo sanguíneo analizando el cambio de frecuencia del ultrasonido reflejado por los glóbulos rojos en movimiento. Permite detectar obstrucciones arteriales, evaluar válvulas cardíacas y monitorizar el flujo en el cordón umbilical durante el embarazo, todo sin radiación ni cirugía.',
      },
    },
  ],
};
