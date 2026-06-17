import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Microeconomía Visual: 6 Conceptos Clave Explicados | meskeIA',
  description: 'Recorrido visual e interactivo por la microeconomía: escasez y coste de oportunidad, oferta y demanda, elasticidad, costes de la empresa, estructuras de mercado y fallos de mercado. Con ejemplos cotidianos y actuales.',
  keywords: 'microeconomía, coste de oportunidad, escasez, oferta y demanda, elasticidad, economías de escala, estructuras de mercado, monopolio, oligopolio, fallos de mercado, externalidades, economía fácil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Microeconomía Visual: 6 Conceptos Clave',
    description: 'Entiende cómo deciden personas y empresas: escasez, elasticidad, costes, mercados y sus fallos. Visuales interactivos y ejemplos reales.',
    url: 'https://meskeia.com/visualizador-microeconomia/',
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
    title: 'Microeconomía Visual: 6 Conceptos Clave',
    description: 'Escasez, oferta y demanda, elasticidad, costes, estructuras de mercado y fallos de mercado, con visuales interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Microeconomía meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Microeconomía Visual: 6 Conceptos Clave',
  description: 'Explicador visual e interactivo de los conceptos fundamentales de la microeconomía: escasez y coste de oportunidad, oferta y demanda, elasticidad de la demanda, costes de producción y economías de escala, estructuras de mercado (de la competencia perfecta al monopolio) y fallos de mercado. Cada concepto incluye un visual interactivo, un ejemplo cotidiano y un caso de actualidad.',
  url: 'https://meskeia.com/visualizador-microeconomia/',
  category: 'EducationalApplication',
  features: [
    '6 conceptos clave de microeconomía explicados visualmente',
    'Frontera de posibilidades interactiva para entender el coste de oportunidad',
    'Comparador de demanda elástica frente a inelástica',
    'Curva de economías de escala con control deslizante',
    'Espectro de estructuras de mercado, de la competencia perfecta al monopolio',
    'Ejemplos cotidianos y casos de actualidad en cada concepto',
  ],
  keywords: [
    'microeconomía', 'coste de oportunidad', 'escasez', 'oferta y demanda',
    'elasticidad', 'economías de escala', 'estructuras de mercado', 'monopolio',
    'oligopolio', 'fallos de mercado', 'externalidades',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué estudia la microeconomía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La microeconomía estudia las decisiones de los agentes individuales de la economía: cómo elige un consumidor en qué gastar su dinero, cómo fija precios y produce una empresa, y cómo se comporta un mercado concreto. Se centra en el detalle (un producto, una empresa, un sector) frente a la macroeconomía, que analiza el conjunto de un país.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el coste de oportunidad con un ejemplo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de oportunidad es el valor de aquello a lo que renuncias al tomar una decisión. Por ejemplo, si dedicas una tarde a estudiar, su coste de oportunidad es la tarde con amigos que dejas de tener. No es solo el dinero o el esfuerzo: es la mejor alternativa que descartas. Es uno de los conceptos más útiles de la economía porque obliga a comparar opciones reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un bien elástico y uno inelástico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un bien es inelástico cuando seguimos comprándolo casi igual aunque suba mucho de precio, porque lo necesitamos y tiene pocos sustitutos (la gasolina, las medicinas). Es elástico cuando una pequeña subida de precio hace que dejemos de comprarlo y busquemos alternativas (un refresco de marca, una suscripción prescindible). La elasticidad mide esa sensibilidad de la demanda al precio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las grandes empresas pueden vender más barato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por las economías de escala. Una empresa tiene costes fijos (instalaciones, maquinaria) que no dependen de cuánto produzca. Al repartir esos costes fijos entre muchas más unidades, el coste de cada unidad baja. Por eso un gran distribuidor que mueve millones de pedidos tiene un coste por paquete mucho menor que una tienda pequeña, y puede ofrecer precios más bajos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un fallo de mercado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un fallo de mercado es una situación en la que el mercado, por sí solo, produce un resultado malo para el conjunto de la sociedad. Ocurre cuando el precio no refleja todos los costes o beneficios reales: contaminación que paga la sociedad y no quien la genera (externalidades), bienes útiles que nadie puede cobrar individualmente (bienes públicos), información que solo una parte conoce o empresas con demasiado poder. Suelen justificar la intervención pública mediante impuestos, regulación o provisión directa.',
      },
    },
  ],
};
