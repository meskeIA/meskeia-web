import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomia de un Vuelo - Como Vuela un Avion Explicado | meskeIA',
  description: 'Entiende por que vuelan los aviones: principio de Bernoulli, las 7 fases del vuelo, datos reales Madrid-Londres y como funciona la cabina. Explicador visual interactivo.',
  keywords: 'como vuela un avion, principio de Bernoulli, fases del vuelo, sustentacion, aerodinamica, cabina piloto, altimetro, vuelo Madrid Londres, aviacion, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomia de un Vuelo - Como Vuela un Avion Explicado',
    description: 'Aerodinamica, fases del vuelo, datos reales y la cabina del piloto explicados visualmente.',
    url: 'https://meskeia.com/visualizador-anatomia-vuelo/',
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
    title: 'Anatomia de un Vuelo - Explicador Visual',
    description: 'Por que vuelan los aviones, las 7 fases de un vuelo y datos reales de un Madrid-Londres.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Anatomia Vuelo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomia de un Vuelo - Como Vuela un Avion Explicado',
  description: 'Explicador visual interactivo sobre como funcionan los aviones: principio de Bernoulli, las 4 fuerzas del vuelo, las 7 fases de despegue a aterrizaje, datos reales de un Madrid-Londres y los instrumentos de la cabina.',
  url: 'https://meskeia.com/visualizador-anatomia-vuelo/',
  category: 'EducationalApplication',
  features: [
    'Diagrama interactivo de las 4 fuerzas del vuelo (sustentacion, peso, empuje, resistencia)',
    'Las 7 fases del vuelo con perfil de altitud y velocidades reales',
    'Datos reales del vuelo Madrid-Londres: distancia, combustible, CO2, comparativas',
    'Instrumentos de cabina explicados: altimetro, horizonte artificial, velocimetro',
    'Comparativa ambiental: CO2 por pasajero en avión, tren, coche y autobús en el trayecto Madrid-Londres',
    'Curiosidades de cabina: por qué se tapan los oídos, por qué la comida sabe diferente y por qué las ventanillas son redondas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué vuelan los aviones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los aviones vuelan gracias a cuatro fuerzas que actúan simultáneamente: la sustentación generada por las alas, el empuje producido por los motores, el peso (gravedad) y la resistencia aerodinámica. La sustentación se explica por el principio de Bernoulli: la forma del ala hace que el aire viaje más rápido por la parte superior, creando una presión menor que "eleva" el avión. Para despegar, la velocidad debe ser suficiente para que la sustentación supere el peso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las fases de un vuelo comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un vuelo comercial tiene 7 fases principales: rodaje en tierra, despegue (rotación a ~280 km/h), ascenso inicial, crucero a altitud de vuelo (normalmente entre 10.000 y 12.500 metros), descenso, aproximación final con tren de aterrizaje desplegado y flaps extendidos, y aterrizaje. Cada fase tiene velocidades, altitudes y configuraciones de la aeronave muy concretas dictadas por procedimientos de seguridad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué altitud vuelan los aviones comerciales y por qué?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los aviones comerciales vuelan habitualmente entre 10.000 y 12.500 metros de altitud (33.000–41.000 pies). A esa altura el aire es mucho menos denso, lo que reduce la resistencia aerodinámica y permite consumir hasta un 30% menos de combustible que a baja altitud. Además, los aviones evitan la mayor parte del mal tiempo, que se concentra en la troposfera baja.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto combustible consume un vuelo Madrid–Londres?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un vuelo Madrid–Londres (unos 1.260 km) en un Airbus A320 consume aproximadamente 3.500–4.000 litros de combustible. Eso equivale a unas 9–10 toneladas de CO₂ emitidas por la aeronave completa. Repartido entre los ~180 pasajeros, supone alrededor de 50–55 kg de CO₂ por persona, comparable a un trayecto en coche de similar distancia pero con mucha más velocidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué instrumentos usa el piloto para navegar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los instrumentos básicos de la cabina son el altímetro (mide la altitud por presión barométrica), el velocímetro o anemómetro (velocidad aerodinámica), el horizonte artificial (posición del avión respecto al horizonte real), el variómetro (tasa de ascenso o descenso) y el indicador de rumbo. En aviones modernos estos datos se presentan en pantallas digitales llamadas EFIS, que integran también el sistema de navegación y el aviso de tráfico TCAS.',
      },
    },
  ],
};
