import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Seguimiento Ciclo Menstrual y Fertilidad - Calculadora Ovulación | meskeIA',
  description: 'Calcula tu ventana fértil, predicción de ovulación y próximas fechas de menstruación. Todo se calcula en tu navegador: ningún dato se envía a servidores.',
  keywords: 'ciclo menstrual, ovulacion, fertilidad, ventana fertil, periodo, calculadora ovulacion, calendario menstrual, dias fertiles, prediccion periodo, seguimiento ciclo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Seguimiento Ciclo Menstrual y Fertilidad - meskeIA',
    description: 'Predicción de ovulación, ventana fértil y próximas menstruaciones. Privacidad total: cálculo 100% local.',
    url: 'https://meskeia.com/seguimiento-ciclo-menstrual/',
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
    title: 'Calculadora Ciclo Menstrual y Ovulación - meskeIA',
    description: 'Conoce tu ventana fértil y próximas fechas. Privacidad garantizada.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Seguimiento Ciclo Menstrual y Fertilidad",
  description: "Calcula tu ventana fértil, predicción de ovulación y próximas fechas de menstruación. Todo se calcula en tu navegador: ningún dato se envía a servidores.",
  url: "https://meskeia.com/seguimiento-ciclo-menstrual/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la ventana fértil del ciclo menstrual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ventana fértil se calcula a partir del día de ovulación, que en un ciclo de 28 días suele ocurrir alrededor del día 14. Como los espermatozoides pueden sobrevivir hasta 5 días en el útero, la ventana fértil abarca aproximadamente los 5 días previos a la ovulación más el día de la ovulación. Para ciclos irregulares, la fecha de ovulación se estima restando 14 días a la duración del ciclo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos días dura un ciclo menstrual normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un ciclo menstrual se considera normal cuando dura entre 21 y 35 días, siendo 28 días el promedio más citado. La duración de la menstruación en sí suele ser de 3 a 7 días. La variabilidad entre ciclos de ±2 o 3 días también es completamente normal y no indica ningún problema de salud.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una calculadora de ciclo menstrual y una app de seguimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una calculadora usa la duración media del ciclo para estimar fechas futuras mediante fórmulas estándar, sin almacenar datos históricos. Una app de seguimiento acumula varios ciclos reales para afinar las predicciones y detectar patrones. La calculadora es más rápida para una estimación puntual; la app es más precisa a largo plazo si se registran los datos con regularidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro para la privacidad usar esta herramienta de seguimiento menstrual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Todos los cálculos se realizan en el propio navegador: ningún dato de ciclo, fecha ni información personal se envía a ningún servidor. Los datos permanecen únicamente en tu dispositivo mientras usas la herramienta y no se guardan al cerrar la página.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede usarse el seguimiento del ciclo como método anticonceptivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los métodos basados en el ciclo menstrual (método del ritmo, Sintotérmico, etc.) tienen tasas de fallo considerablemente más altas que los métodos anticonceptivos médicos, especialmente en ciclos irregulares. Esta herramienta es informativa y útil para conocer mejor el ciclo, pero no sustituye el asesoramiento de un profesional sanitario para la planificación familiar.',
      },
    },
  ],
};
