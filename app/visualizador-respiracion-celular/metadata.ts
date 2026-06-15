import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Respiración Celular - La Central Energética de tus Células | meskeIA',
  description: 'Descubre cómo las células obtienen energía de la glucosa: glucólisis, ciclo de Krebs, cadena de transporte de electrones y la mitocondria. Explicador visual interactivo.',
  keywords: 'respiración celular, mitocondria, ATP, glucólisis, ciclo de Krebs, cadena de electrones, NADH, biología, energía celular, metabolismo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Respiración Celular - La Central Energética de tus Células',
    description: 'Cómo las células convierten glucosa en energía: el proceso inverso a la fotosíntesis, explicado visualmente.',
    url: 'https://meskeia.com/visualizador-respiracion-celular/',
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
    title: 'Respiración Celular - Explicador Visual',
    description: 'De una molécula de glucosa a 38 ATP: la respiración celular como nunca la habías visto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Respiración Celular Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Respiración Celular - La Central Energética de tus Células',
  description: 'Explicador visual interactivo sobre la respiración celular: glucólisis, ciclo de Krebs, cadena de transporte de electrones, estructura de la mitocondria y datos fascinantes sobre el metabolismo energético.',
  url: 'https://meskeia.com/visualizador-respiracion-celular/',
  category: 'EducationalApplication',
  features: [
    'Proceso completo de respiración celular paso a paso',
    'Las 3 fases: glucólisis, Krebs y cadena de electrones',
    'Diagrama interactivo de la mitocondria con partes clickables',
    'Comparativa visual con la fotosíntesis',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la respiración celular y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La respiración celular es el proceso mediante el cual las células descomponen glucosa y oxígeno para producir energía en forma de ATP (adenosín trifosfato). Este proceso ocurre principalmente en las mitocondrias y es fundamental para todas las funciones vitales: movimiento, crecimiento, mantenimiento y reproducción celular. Sin ATP, las células no podrían llevar a cabo ninguna de sus actividades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las fases de la respiración celular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La respiración celular aeróbica tiene tres fases principales. Primero, la glucólisis ocurre en el citoplasma y descompone la glucosa en dos moléculas de piruvato, generando 2 ATP netos. Después, el ciclo de Krebs (o ciclo del ácido cítrico) tiene lugar en la matriz mitocondrial y produce NADH y FADH₂ como portadores de electrones. Finalmente, la cadena de transporte de electrones en la membrana interna mitocondrial genera la mayor parte de la energía: entre 32 y 34 moléculas de ATP.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas moléculas de ATP produce una molécula de glucosa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La oxidación completa de una molécula de glucosa produce aproximadamente 36-38 moléculas de ATP en condiciones ideales. De estas, solo 2 proceden de la glucólisis, 2 del ciclo de Krebs y las 32-34 restantes de la fosforilación oxidativa en la cadena de transporte de electrones. En la práctica, la eficiencia real en células vivas es algo menor debido a pérdidas por gradiente y otros factores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre respiración aeróbica y anaeróbica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La respiración aeróbica requiere oxígeno y produce hasta 38 ATP por glucosa, siendo mucho más eficiente. La respiración anaeróbica ocurre sin oxígeno y genera solo 2 ATP, produciendo como subproducto ácido láctico (en músculo) o etanol y CO₂ (en levaduras). Las células recurren a la vía anaeróbica cuando el aporte de oxígeno es insuficiente, como ocurre durante ejercicio intenso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el papel de la mitocondria en la respiración celular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mitocondria es el orgánulo donde ocurren las dos últimas fases de la respiración aeróbica: el ciclo de Krebs en su matriz interna y la cadena de transporte de electrones en su membrana interna (con sus crestas). Su doble membrana crea un gradiente de protoness que permite a la ATP sintasa generar la mayor parte del ATP celular. Por eso se la conoce como la "central energética" de la célula.',
      },
    },
  ],
};
