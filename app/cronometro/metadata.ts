import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cronómetro y Temporizador Online | meskeIA',
  description: 'Cronómetro online con vueltas, temporizador de cuenta atrás y alarma. Herramienta gratuita para medir tiempo en el móvil (celular), tableta u ordenador: entrenamientos, cocina y productividad.',
  keywords: 'cronometro online, temporizador, cuenta atras, stopwatch, timer, alarma, vueltas, laps, reloj, medidor tiempo, cronometro movil, cronometro celular',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cronómetro y Temporizador Online',
    description: 'Mide el tiempo con precisión. Cronómetro con vueltas y temporizador con alarma.',
    url: 'https://meskeia.com/cronometro/',
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
    title: 'Cronómetro y Temporizador | meskeIA',
    description: 'Cronómetro con vueltas y temporizador de cuenta atrás',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Cronómetro meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cronómetro y Temporizador",
  description: "Cronómetro online con vueltas, temporizador de cuenta atrás y alarma. Herramienta gratuita para medir tiempo desde el móvil (celular), tableta u ordenador: entrenamientos, cocina y productividad.",
  url: "https://meskeia.com/cronometro/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un cronómetro y un temporizador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cronómetro mide el tiempo transcurrido desde que pulsas inicio, útil para medir la duración de una actividad. Un temporizador cuenta hacia atrás desde un tiempo fijado y emite una alarma al llegar a cero. Ambas funciones son complementarias y se usan en contextos diferentes: el cronómetro para entrenamientos o carreras, el temporizador para cocina o técnica Pomodoro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve registrar vueltas en un cronómetro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La función de vueltas (laps) permite guardar tiempos parciales sin detener el cronómetro general. Es especialmente útil en atletismo, natación o ciclismo para comparar el rendimiento vuelta a vuelta. También se usa en tests de productividad para medir cuánto tarda cada tarea dentro de una sesión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El cronómetro online es preciso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La precisión depende del navegador y del hardware del dispositivo. Los navegadores modernos utilizan la API de alta resolución (performance.now()) con precisión de milisegundos. Para actividades de alta competición donde se requieren fracciones de segundo exactas, es preferible un cronómetro físico certificado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar el cronómetro en el móvil o celular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la herramienta funciona en cualquier dispositivo con navegador web moderno: móvil (celular), tableta u ordenador. No requiere instalación ni registro. En el móvil o celular, mantén la pantalla activa para evitar que el sistema operativo pause el contador en segundo plano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué técnica Pomodoro recomienda usar el temporizador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La técnica Pomodoro estándar usa intervalos de 25 minutos de trabajo seguidos de 5 minutos de descanso. Tras cuatro ciclos se hace una pausa larga de 15-30 minutos. Configura el temporizador en 25 minutos, empieza a trabajar y descansa cuando suene la alarma. Esta estructura mejora la concentración y reduce la fatiga mental.',
      },
    },
  ],
};
