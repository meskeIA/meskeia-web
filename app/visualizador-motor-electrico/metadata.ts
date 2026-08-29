import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Motor Eléctrico: Cómo Funciona | meskeIA',
  description: 'Visualiza el motor eléctrico: campo magnético rotante, estátor y rotor, inversor trifásico, frenado regenerativo y ventajas termodinámicas frente al motor de combustión. Aplicado al coche eléctrico (carro o auto eléctrico).',
  keywords: ['motor eléctrico', 'campo magnético', 'estátor', 'rotor', 'inversor', 'regeneración', 'coche eléctrico', 'carro eléctrico', 'auto eléctrico'],
  openGraph: {
    title: 'Motor Eléctrico: Cómo Funciona | meskeIA',
    description: 'Del campo magnético rotante al frenado regenerativo: todos los principios del motor eléctrico visualizados.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motor Eléctrico: Cómo Funciona | meskeIA',
    description: 'Del campo magnético rotante al frenado regenerativo: todos los principios del motor eléctrico visualizados.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Motor Eléctrico: Campo Magnético Rotante y Regeneración",
  description: "Visualiza el motor eléctrico: campo magnético rotante, estátor y rotor, inversor trifásico, frenado regenerativo y ventajas termodinámicas frente al motor de combustión.",
  url: "https://meskeia.com/visualizador-motor-electrico/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona un motor eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un motor eléctrico convierte energía eléctrica en movimiento mecánico mediante la interacción entre campos magnéticos. El estátor genera un campo magnético rotante al recibir corriente alterna trifásica, y el rotor sigue ese campo por inducción electromagnética. La velocidad de giro es proporcional a la frecuencia de la corriente aplicada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el frenado regenerativo en un coche eléctrico (carro o auto eléctrico)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El frenado regenerativo invierte el papel del motor: en lugar de consumir electricidad para mover el vehículo, usa la inercia del vehículo para generar electricidad y recargar la batería. Este proceso puede recuperar hasta el 20-30% de la energía cinética que de otro modo se perdería como calor en los frenos convencionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el motor eléctrico y el motor de combustión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El motor eléctrico alcanza eficiencias del 85-95%, frente al 25-40% del motor de combustión interna. Además, el motor eléctrico entrega par máximo desde cero revoluciones, no necesita caja de cambios y tiene muchas menos piezas móviles, lo que reduce el mantenimiento. El motor de combustión requiere explosiones controladas de combustible para generar movimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el inversor trifásico en un vehículo eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El inversor convierte la corriente continua (DC) almacenada en la batería en corriente alterna trifásica (AC) para alimentar el motor. También controla la frecuencia y amplitud de esa corriente para regular la velocidad y el par del motor. Sin el inversor, la batería no podría alimentar directamente al motor de inducción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el campo magnético rotante y por qué es clave en el motor eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El campo magnético rotante es el campo resultante que genera el estátor cuando se le aplican tres corrientes alternas desfasadas 120°. Este campo gira de forma continua y arrastra al rotor por inducción, creando el movimiento. Es el principio físico central del motor de inducción, inventado por Nikola Tesla en 1887.',
      },
    },
  ],
};
