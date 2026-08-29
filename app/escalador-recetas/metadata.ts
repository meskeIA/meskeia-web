import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Escalador de Recetas — Ajusta las Cantidades para más o menos Personas | meskeIA',
  description: 'Escala cualquier receta para más o menos raciones al instante. Ajusta automáticamente levadura, sal y especias de forma no lineal. Incluye notas sobre el horno y advertencias prácticas.',
  keywords: 'escalador recetas, ajustar receta porciones, multiplicar receta, dividir receta, cambiar raciones receta, levadura no lineal, proporciones cocina, calculadora recetas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/escalador-recetas/',
  },
  openGraph: {
    type: 'website',
    title: 'Escalador de Recetas - Ajusta Cantidades para más o menos Personas',
    description: 'Escala cualquier receta con ajuste inteligente de levadura, sal y especias para el número de raciones que necesites.',
    url: 'https://meskeia.com/escalador-recetas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escalador de Recetas | meskeIA',
    description: 'Multiplica o divide cualquier receta con ajuste inteligente de levadura, sal y especias.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Escalador de Recetas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Escalador de Recetas',
  description: 'Herramienta para escalar recetas de cocina: introduce las raciones originales y las deseadas, añade los ingredientes con su categoría, y obtén las cantidades ajustadas con correcciones inteligentes para levadura, sal y especias.',
  url: 'https://meskeia.com/escalador-recetas/',
  category: 'UtilityApplication',
  features: [
    'Escalado de ingredientes para cualquier número de raciones',
    'Ajuste no lineal para levadura, impulsores, sal y especias',
    'Advertencias para factores extremos (mayor de 4× o menor de 1/4×)',
    'Nota automática sobre tiempo y temperatura del horno',
    'Redondeo práctico de cantidades (g, ml, cucharadas, etc.)',
    'En español',
  ],
  keywords: ['escalador recetas', 'ajustar porciones', 'multiplicar receta', 'levadura no lineal', 'cocina'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se escala una receta para más o menos personas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma básica es calcular el factor de escala dividiendo las raciones deseadas entre las originales. Por ejemplo, si la receta es para 4 y necesitas 10, el factor es 2,5 y multiplicas cada ingrediente por ese valor. La mayoría de ingredientes escalan de forma lineal, aunque algunos como la levadura, la sal o las especias requieren un ajuste menor para evitar sabores desequilibrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la levadura no escala de forma proporcional al multiplicar una receta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La levadura actúa de forma exponencial: si doblas la cantidad, la fermentación se acelera mucho más de lo esperado, lo que puede provocar sobre-fermentación, sabores ácidos o gases excesivos. Para factores de escala superiores a 2, se recomienda aumentar la levadura entre un 75% y un 80% del factor lineal, y ajustar también el tiempo de fermentación observando la masa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cambia el tiempo de horno al escalar una receta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo de horno no escala de forma lineal. Lo que determina el tiempo es el grosor de la pieza, no la cantidad total. Si haces porciones del mismo tamaño, el tiempo es idéntico. Si horneas en un molde mayor con más masa, el tiempo aumenta, pero menos de lo que sugiere el factor de escala. La temperatura generalmente se mantiene igual y se comprueba el punto de cocción con palillo o termómetro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si escalo una receta por un factor muy alto, como 5× o 10×?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para factores extremos (superiores a 4×), además del ajuste no lineal de levadura y sal, pueden aparecer problemas de emulsión en masas con grasa, tiempos de cocción impredecibles y cambios en la textura final. Se recomienda hacer una prueba con la mitad del factor antes de ejecutar una producción grande, especialmente en repostería donde las proporciones son críticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La sal y las especias también se ajustan de forma diferente al escalar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La sal y las especias fuertes se perciben con mayor intensidad cuando se aumenta la cantidad, por lo que se recomienda añadir entre un 60% y un 80% del factor lineal y rectificar al final. Al reducir una receta, en cambio, hay que tener cuidado de no quedarse con una cantidad de sal demasiado pequeña para que el plato tenga sabor.',
      },
    },
  ],
};
