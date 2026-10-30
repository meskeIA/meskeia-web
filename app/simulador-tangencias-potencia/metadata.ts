import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tangencias y Potencia de un Punto: Simulador de Dibujo Técnico | meskeIA',
  description:
    'Simulador de dibujo técnico: potencia de un punto, eje y centro radical, rectas tangentes y circunferencias tangentes por potencia, paso a paso y con 12 casos.',
  keywords:
    'tangencias, potencia de un punto, eje radical, centro radical, dibujo técnico, rectas tangentes a una circunferencia, tangentes comunes, circunferencias tangentes, problemas de Apolonio, PPR, PPC, geometría plana, construcciones con regla y compás, bachillerato, preparatoria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-tangencias-potencia/',
  },
  openGraph: {
    type: 'website',
    title: 'Tangencias y Potencia de un Punto: Simulador de Dibujo Técnico',
    description:
      'Arrastra puntos y circunferencias y mira rehacerse la construcción paso a paso: potencia, eje radical, tangentes y circunferencias tangentes por potencia.',
    url: 'https://meskeia.com/simulador-tangencias-potencia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tangencias y Potencia de un Punto | meskeIA',
    description: 'Construcciones de dibujo técnico paso a paso: potencia, eje radical, tangentes y circunferencias tangentes.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Tangencias y Potencia meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Tangencias y Potencia de un Punto (Dibujo Técnico)',
  description:
    'Simulador interactivo de geometría plana para Dibujo Técnico. Arrastra los datos y la construcción con regla y compás se rehace paso a paso: potencia de un punto respecto de una circunferencia, eje radical y centro radical, rectas tangentes desde un punto, tangentes comunes exteriores e interiores a dos circunferencias, y circunferencias tangentes por el método de la potencia (por dos puntos y tangente a una recta o a una circunferencia). Incluye 12 casos numerados con corrección y un modo práctica.',
  url: 'https://meskeia.com/simulador-tangencias-potencia/',
  category: 'EducationalApplication',
  features: [
    'Potencia de un punto con secante giratoria: PA · PB siempre igual a d² − r²',
    'Eje radical y centro radical de dos o tres circunferencias, con el método de la circunferencia auxiliar',
    'Rectas tangentes desde un punto exterior por el arco capaz de 90°',
    'Tangentes comunes exteriores e interiores a dos circunferencias',
    'Circunferencias tangentes por potencia: casos PPR y PPC de Apolonio',
    'Construcción paso a paso con datos arrastrables con ratón, dedo o teclado',
    '12 casos numerados iguales para toda la clase, con corrección y solución razonada',
    'Funciona en el navegador, sin registro ni instalación',
  ],
});

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué es la potencia de un punto respecto de una circunferencia?',
    answer:
      'Es el número d² − r², donde d es la distancia del punto al centro y r el radio. Es positiva si el punto está fuera, cero si está sobre la circunferencia y negativa si está dentro. Su propiedad clave es que, para cualquier recta que pase por el punto y corte a la circunferencia en A y B, el producto PA · PB vale siempre lo mismo: la potencia.',
  },
  {
    question: '¿Qué relación hay entre la potencia y la longitud de la tangente?',
    answer:
      'Desde un punto exterior, el cuadrado del segmento de tangencia es exactamente la potencia: PT² = d² − r². Sale de Pitágoras, porque el radio es perpendicular a la tangente en el punto de contacto. Por ejemplo, a 13 cm del centro de una circunferencia de 5 cm de radio la tangente mide √(169 − 25) = 12 cm.',
  },
  {
    question: '¿Qué es el eje radical y cómo se traza?',
    answer:
      'Es el lugar de los puntos que tienen la misma potencia respecto de dos circunferencias, y siempre es una recta perpendicular a la línea de centros. Si las circunferencias se cortan, es la recta que une los puntos de corte. Si no, se traza una circunferencia auxiliar que corte a las dos: sus dos cuerdas comunes se cortan en un punto del eje, y por él se traza la perpendicular a la línea de centros.',
  },
  {
    question: '¿Para qué sirve el centro radical?',
    answer:
      'El centro radical es el punto donde se cortan los tres ejes radicales de tres circunferencias, y tiene la misma potencia respecto de las tres. Es la herramienta que resuelve los problemas de tangencias de Apolonio: en el caso de una circunferencia que pase por dos puntos y sea tangente a una recta, el centro radical es el corte de la recta AB con la recta dada.',
  },
  {
    question: '¿Cómo se trazan las tangentes comunes a dos circunferencias?',
    answer:
      'Se reduce el problema a trazar tangentes desde un punto. Para las exteriores se dibuja una circunferencia auxiliar concéntrica con la mayor y radio la diferencia de radios; para las interiores, con radio la suma. Las tangentes desde el centro de la menor a esa auxiliar dan la dirección de los radios de contacto. Dos circunferencias exteriores tienen 4 tangentes comunes; si se cortan, solo 2.',
  },
  {
    question: '¿Cómo se construye una circunferencia que pase por dos puntos y sea tangente a una recta?',
    answer:
      'Es el caso PPR de Apolonio. La recta AB corta a la recta r en M, que tiene la misma potencia MA · MB respecto de todas las circunferencias que pasan por A y B. Por eso el punto de tangencia T cumple MT² = MA · MB: se halla la media proporcional MT y se lleva sobre r a los dos lados de M. Hay dos soluciones, cuyos centros están en la mediatriz de AB.',
  },
  {
    question: '¿En qué curso se estudian las tangencias y la potencia?',
    answer:
      'Las tangencias básicas (rectas tangentes y enlaces) aparecen en la educación secundaria, en asignaturas de dibujo o educación plástica. La potencia, el eje radical y los problemas de Apolonio son temario de Dibujo Técnico de bachillerato o preparatoria, y de geometría descriptiva en los primeros cursos de arquitectura e ingeniería.',
  },
  {
    question: '¿Puedo usarlo con mi clase?',
    answer:
      'Sí. La pestaña de casos tiene 12 ejercicios numerados que son iguales para todo el mundo, así que se puede mandar resolver «los casos 3, 8 y 12». Cada uno corrige la respuesta, nombra los errores típicos (dar la potencia en lugar de su raíz, medir el eje desde el otro centro) y muestra la solución razonada. Hay además un modo práctica con ejercicios aleatorios.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
