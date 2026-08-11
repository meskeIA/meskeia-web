import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Frigorías y BTU - Potencia de Aire Acondicionado y Calefacción | meskeIA',
  description:
    'Calcula las frigorías, los BTU y los vatios que necesita una habitación para climatizarla: superficie, altura, aislamiento, orientación, acristalamiento, ocupantes y equipos. Con el desglose de la carga y el tamaño de equipo equivalente.',
  keywords:
    'frigorías, BTU, calculadora frigorías, cuántas frigorías necesito, potencia aire acondicionado, dimensionar aire acondicionado, BTU habitación, vatios climatización, carga térmica, potencia calefacción, kW calefacción, frigorías por metro cuadrado',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-frigorias-btu/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Frigorías y BTU | meskeIA',
    description:
      'Cuánta potencia de frío y de calor necesita cada estancia, con el desglose de la carga térmica',
    url: 'https://meskeia.com/calculadora-frigorias-btu/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Frigorías y BTU | meskeIA',
    description: 'Frigorías, BTU y vatios que pide tu estancia, con el desglose de dónde sale cada uno',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Frigorías y BTU',
  description:
    'Calculadora de potencia de climatización para viviendas y locales pequeños. Estima la carga térmica de refrigeración y de calefacción de una estancia a partir de su superficie y altura, el nivel de aislamiento, la exposición solar, la superficie acristalada, la posición bajo cubierta, el número de ocupantes y los equipos que desprenden calor. Devuelve el resultado en frigorías por hora, BTU por hora y vatios, con el desglose de cada sumando, el tamaño de equipo equivalente en BTU y el consumo eléctrico aproximado.',
  url: 'https://meskeia.com/calculadora-frigorias-btu/',
  category: 'UtilityApplication',
  features: [
    'Potencia de refrigeración en frigorías/h, BTU/h y vatios',
    'Potencia de calefacción estimada para la misma estancia',
    'Desglose de la carga: volumen, aislamiento, sol, cristal, cubierta, personas y equipos',
    'Tamaño de equipo equivalente en BTU y aviso de sobredimensionado',
    'Consumo eléctrico aproximado según el rango de eficiencia habitual',
    'Conversión entre frigorías, BTU, kcal/h y vatios',
    'Válida para cualquier país: el clima se elige por severidad, no por región',
    'En español',
  ],
  keywords: ['frigorías', 'BTU', 'potencia aire acondicionado', 'carga térmica', 'climatización'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas frigorías necesito por metro cuadrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla rápida más extendida es de 80 a 100 frigorías/h por metro cuadrado en clima templado y de 100 a 130 en clima cálido, pero es una aproximación que solo sirve para estancias normales de 2,5 metros de altura. El cálculo correcto parte del volumen, no de la superficie: una habitación de 20 m² con techos de 3,2 metros pide casi un 30 % más de potencia que la misma con techos de 2,5. A eso se suman el aislamiento, el sol que recibe, el cristal, si está bajo cubierta, las personas y los aparatos encendidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos BTU son una frigoría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una frigoría/h equivale a 3,968 BTU/h, y en la práctica se redondea a 4. Una frigoría/h es lo mismo que una kilocaloría/h de frío y equivale a 1,163 vatios. Por eso un equipo de 3.000 frigorías se anuncia como 12.000 BTU y son unos 3,5 kW: son tres formas de decir la misma potencia. Las frigorías se usan en España y parte de Latinoamérica; los BTU, en el etiquetado internacional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si el aire acondicionado tiene más potencia de la necesaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enfría antes, pero peor. Un equipo sobredimensionado alcanza la temperatura de consigna en pocos minutos y se para, así que arranca y se detiene continuamente. Ese ciclado corto deshumidifica mal —el aire queda frío y húmedo, la sensación desagradable típica—, desgasta el compresor y hace que el consumo real se aleje del que promete la etiqueta, porque los arranques son el momento de menor rendimiento. Un margen del 10 al 15 % sobre la carga calculada es razonable; el doble de potencia no lo es.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La potencia de calefacción es la misma que la de refrigeración?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, y casi nunca coinciden. La carga de frío depende sobre todo del sol, el cristal y el calor que generan personas y aparatos; la de calor depende de la diferencia de temperatura entre interior y exterior a través de los cerramientos, y las personas y los aparatos juegan a favor en vez de en contra. En clima suave la potencia de calefacción suele quedar por debajo de la de refrigeración, y en clima frío bastante por encima. Si un mismo equipo va a hacer las dos cosas, manda la mayor de las dos cifras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué influye estar en la última planta o tener mucha cristalera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque son las dos entradas de calor más grandes del verano. Una cubierta expuesta al sol puede sumar en torno a un 10 % a la carga de la estancia respecto a una planta intermedia con vecinos arriba. El vidrio pesa aún más: un metro cuadrado de ventana deja pasar varias veces más calor que un metro cuadrado de pared, y una cristalera orientada al oeste recibe el sol justo en las horas de más calor. Por eso dos habitaciones idénticas en tamaño pueden necesitar potencias muy distintas según a dónde miren.',
      },
    },
  ],
};
