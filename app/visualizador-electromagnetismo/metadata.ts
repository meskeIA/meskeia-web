import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Electromagnetismo - Campo Eléctrico, Magnético e Inducción | meskeIA',
  description: 'Visualiza el electromagnetismo: campo eléctrico de cargas, dipolo magnético, inducción de Faraday y espectro EM completo. Física interactiva sin ecuaciones complejas.',
  keywords: [
    'electromagnetismo',
    'campo electrico',
    'campo magnetico',
    'ley faraday',
    'induccion electromagnetica',
    'espectro electromagnetico',
    'ley lenz',
    'ondas electromagneticas',
    'fisica bachillerato',
  ],
  openGraph: {
    title: 'Electromagnetismo | meskeIA',
    description: 'Campo eléctrico, magnético, inducción y espectro EM con visualizaciones interactivas',
    url: 'https://meskeia.com/visualizador-electromagnetismo/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Electromagnetismo - Campo Eléctrico, Magnético e Inducción",
  description: "Visualiza el electromagnetismo: campo eléctrico de cargas, dipolo magnético, inducción de Faraday y espectro EM completo. Física interactiva sin ecuaciones complejas.",
  url: "https://meskeia.com/visualizador-electromagnetismo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el electromagnetismo y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El electromagnetismo es la rama de la física que estudia la interacción entre cargas eléctricas y campos magnéticos. Es uno de los cuatro fundamentos de la física moderna y explica desde el funcionamiento de los motores eléctricos hasta la propagación de la luz. Sin él no existirían la radio, los teléfonos, los ordenadores ni la red eléctrica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la inducción electromagnética de Faraday?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley de Faraday establece que un campo magnético variable en el tiempo genera una corriente eléctrica en un conductor cercano. Este principio es la base de los generadores eléctricos y los transformadores. Cuanto más rápido cambia el flujo magnético, mayor es la fuerza electromotriz inducida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre campo eléctrico y campo magnético?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El campo eléctrico es producido por cargas eléctricas en reposo y actúa sobre otras cargas independientemente de su movimiento. El campo magnético, en cambio, lo generan cargas en movimiento (corrientes) y solo ejerce fuerza sobre cargas que también se mueven. Ambos campos están íntimamente relacionados: un campo variable en el tiempo genera el otro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la visualización del espectro electromagnético?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El espectro electromagnético abarca desde las ondas de radio (frecuencias de kilohercios) hasta los rayos gamma (frecuencias de exahercios). Visualizarlo ayuda a comprender en qué rango opera cada tecnología —WiFi, microondas, luz visible, rayos X— y por qué algunas radiaciones son ionizantes y potencialmente peligrosas a partir de cierta energía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es útil este visualizador para estudiar física de bachillerato o universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El visualizador cubre los cuatro conceptos principales del temario de electromagnetismo: campo eléctrico de cargas puntuales, dipolo magnético, inducción de Faraday-Lenz y espectro EM. Las simulaciones interactivas permiten modificar parámetros y observar el efecto en tiempo real, lo que facilita la comprensión conceptual antes de abordar las ecuaciones de Maxwell.',
      },
    },
  ],
};
