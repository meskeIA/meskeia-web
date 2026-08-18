import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Volúmenes 3D - Calculadora Geométrica Interactiva - meskeIA',
  description: 'Calcula y visualiza en 3D los volúmenes de esfera, cubo, cilindro, cono y pirámide. Cambia las dimensiones con sliders y ve la figura cambiar en tiempo real con su fórmula matemática.',
  keywords: 'volumen figuras geométricas, calculadora volumen 3D, esfera cilindro cono pirámide cubo, fórmula volumen, geometría visual, matemáticas visualizador',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Volúmenes 3D - meskeIA',
    description: 'Explora y calcula volúmenes de esfera, cubo, cilindro, cono y pirámide con visualización 3D interactiva y fórmulas en tiempo real.',
    url: 'https://meskeia.com/visualizador-volumenes/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Volúmenes 3D - meskeIA',
    description: 'Calcula y visualiza volúmenes geométricos en 3D con sliders interactivos. Esfera, cubo, cilindro, cono y pirámide.',
  },
  other: {
    'application-name': 'Visualizador Volúmenes 3D - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Volúmenes 3D',
  description: 'Herramienta interactiva para calcular y visualizar en 3D los volúmenes de esfera, paralelepípedo, cilindro, cono y pirámide. Mueve los sliders y la figura se redibuja en tiempo real con su fórmula matemática.',
  url: 'https://meskeia.com/visualizador-volumenes/',
  category: 'EducationalApplication',
  features: [
    'Visualización SVG isométrica en tiempo real de 5 figuras geométricas',
    'Sliders interactivos para cada dimensión (radio, altura, lado, anchura)',
    'Cálculo instantáneo del volumen con la fórmula matemática',
    'Etiquetas de dimensiones sobre la figura 3D',
    'Tabla comparativa de fórmulas de volumen',
    'Guía educativa con casos de uso, FAQ y errores frecuentes',
    'Relación demostrable 1/3 entre el volumen del cono y el cilindro equivalente',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la fórmula del volumen de una esfera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El volumen de una esfera es V = (4/3) × π × r³, donde r es el radio. Por ejemplo, una esfera de radio 5 cm tiene un volumen de (4/3) × π × 125 ≈ 523,6 cm³. Al duplicar el radio, el volumen se multiplica por 8, ya que el radio aparece elevado al cubo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el volumen de un cilindro y en qué se diferencia del cono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cilindro tiene volumen V = π × r² × h (área de la base circular por la altura). El cono tiene la misma base pero su volumen es exactamente un tercio del cilindro: V = (1/3) × π × r² × h. Un cono cabe tres veces dentro de un cilindro con el mismo radio y la misma altura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve calcular el volumen de figuras geométricas en la vida real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cálculo de volúmenes tiene multitud de aplicaciones: en arquitectura y construcción (cantidad de hormigón, capacidad de depósitos), en alimentación y packaging (contenido de envases cilíndricos o cónicos), en medicina (volumen de órganos o tumores), y en ingeniería (diseño de piezas mecánicas y depósitos de almacenamiento).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la fórmula del volumen de una pirámide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El volumen de una pirámide de base cuadrada es V = (1/3) × a² × h, donde a es el lado de la base y h es la altura perpendicular al suelo. Al igual que el cono, el factor 1/3 surge porque tres pirámides iguales llenan exactamente un prisma de la misma base y altura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué figura geométrica tiene el mayor volumen con la menor superficie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La esfera es la figura que maximiza el volumen para una superficie dada. Este principio se llama isoperimetría esférica y tiene aplicaciones en la naturaleza: las burbujas de jabón adoptan forma esférica precisamente porque minimizan la tensión superficial. No todo lo redondo sigue esa regla: los glóbulos rojos tienen forma de disco bicóncavo, optimizada para maximizar el intercambio de oxígeno y no el volumen interior.',
      },
    },
  ],
};
