import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estrategia Empresarial Visual: 6 Módulos Clave | meskeIA',
  description: 'Recorrido visual e interactivo por la estrategia empresarial: análisis del entorno (5 fuerzas de Porter), mirada interna (VRIO), ventaja competitiva y moats, modelo de negocio, crecimiento (matriz de Ansoff) y ejecución ágil. Del clásico Porter a la era de las plataformas y la IA.',
  keywords: 'estrategia empresarial, 5 fuerzas de Porter, ventaja competitiva, moats, VRIO, matriz de Ansoff, modelo de negocio, business model canvas, efectos de red, plataformas, océano azul, planificación estratégica, estrategia ágil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estrategia Empresarial Visual: 6 Módulos Clave',
    description: 'Dónde competir, con qué ventaja y cómo crecer. Los 6 módulos de la estrategia, del clásico Porter a las plataformas y la IA, con visuales interactivos.',
    url: 'https://meskeia.com/visualizador-estrategia-empresarial/',
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
    title: 'Estrategia Empresarial Visual: 6 Módulos Clave',
    description: 'Entorno, recursos, ventaja competitiva, modelo de negocio, crecimiento y ejecución, con visuales interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estrategia Empresarial meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estrategia Empresarial Visual: 6 Módulos Clave',
  description: 'Explicador visual e interactivo de los módulos fundamentales de la estrategia empresarial: análisis del entorno con las 5 fuerzas de Porter, mirada interna con el modelo VRIO, ventaja competitiva y moats (efectos de red, costes de cambio, escala), modelo de negocio (lineal, plataforma, suscripción, freemium), crecimiento con la matriz de Ansoff y ejecución entre planificación y experimentación. Cada módulo contrasta el enfoque clásico con su evolución moderna, de los conglomerados de los años 70-80 a las plataformas y la IA.',
  url: 'https://meskeia.com/visualizador-estrategia-empresarial/',
  category: 'BusinessApplication',
  features: [
    '6 módulos clave de estrategia empresarial explicados visualmente',
    'Las 5 fuerzas de Porter con presets por sector',
    'Test VRIO interactivo para detectar ventajas sostenibles',
    'Tipos de foso competitivo (moat) con su capacidad de protección',
    'Matriz de Ansoff interactiva para las estrategias de crecimiento',
    'Equilibrio entre planificar y experimentar según la incertidumbre',
    'Cronología del pensamiento estratégico, del clásico Porter a la era de la IA',
  ],
  keywords: [
    'estrategia empresarial', '5 fuerzas de Porter', 'ventaja competitiva',
    'moats', 'VRIO', 'matriz de Ansoff', 'modelo de negocio',
    'efectos de red', 'planificación estratégica', 'estrategia ágil',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la estrategia empresarial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estrategia empresarial es el conjunto de decisiones sobre dónde competir, con qué ventaja y cómo crecer para alcanzar los objetivos de una empresa de forma sostenible. Abarca el análisis del entorno y de los recursos propios, la construcción de una ventaja competitiva, la definición del modelo de negocio, las vías de crecimiento y la forma de ejecutar y adaptar los planes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las 5 fuerzas de Porter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son un marco que propuso Michael Porter para analizar la rentabilidad de un sector a partir de cinco fuerzas: la rivalidad entre competidores, la amenaza de nuevos entrantes, el poder de negociación de los proveedores, el poder de los clientes y la amenaza de productos sustitutos. Cuanto más intensas son esas fuerzas, más se aprietan los márgenes de todas las empresas del sector.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un moat o foso competitivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un moat (foso) es una ventaja estructural que protege a una empresa de la competencia y le permite mantener su posición en el tiempo. Los principales tipos son los efectos de red (cada usuario hace el producto más valioso), los costes de cambio (irse a la competencia es caro o engorroso), las economías de escala y de datos, y la marca. Un buen producto se copia con facilidad; un buen foso, no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la matriz de Ansoff?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La matriz de Ansoff ayuda a elegir cómo crecer cruzando dos ejes: productos (actuales o nuevos) y mercados (actuales o nuevos). De ahí salen cuatro estrategias: penetración de mercado (riesgo bajo), desarrollo de producto, desarrollo de mercado (riesgo medio) y diversificación (riesgo alto). Cuanto más te alejas de lo que ya conoces, mayor es el riesgo de la apuesta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo ha cambiado la estrategia empresarial desde los años 70-80 hasta hoy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En los años 70-80 dominaba la planificación de cartera de los grandes conglomerados, con matrices como la BCG para repartir la inversión entre negocios. Después llegaron el posicionamiento competitivo de Porter, la visión basada en recursos, la disrupción y, en las últimas décadas, las plataformas, los efectos de red, los datos y la estrategia ágil y experimental. La estrategia de un conglomerado industrial clásico poco tiene que ver con la de una plataforma digital o de IA actual.',
      },
    },
  ],
};
