import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Inversiones — ¿Fondos indexados, acciones, renta fija o inmobiliario? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de inversión se adapta mejor a tu perfil: fondos indexados, acciones directas, renta fija, inversión inmobiliaria o plan de pensiones/PPI. Análisis según horizonte, riesgo y conocimiento.',
  keywords: ['qué inversión elegir', 'fondos indexados o acciones', 'renta fija o variable', 'invertir en inmobiliario', 'perfil inversor España', 'inversión para principiantes', 'dónde invertir ahorros', 'plan de pensiones vs fondos', 'inversión a largo plazo', 'cartera de inversión España'],
  openGraph: {
    title: '¿Fondos indexados, acciones o inmobiliario? Test de inversión | meskeIA',
    description: 'Descubre qué tipo de inversión se adapta mejor a tu perfil de riesgo, horizonte y conocimiento financiero.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-inversiones/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Dónde invertir? Test de perfil inversor | meskeIA',
    description: 'Test de 10 preguntas para elegir entre fondos indexados, acciones, renta fija, inmobiliario o pensiones.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-inversiones/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Tipo de Inversión',
      description: 'Test orientativo para saber qué vehículo de inversión (fondos indexados, acciones, renta fija, inmobiliario o PPI) se adapta mejor al perfil de riesgo y objetivos.',
      url: 'https://meskeia.com/selector-inversiones/',
      features: [
        'Test de 10 preguntas sobre perfil inversor',
        '5 opciones: fondos indexados, acciones directas, renta fija, inmobiliario, pensiones/PPI',
        'Análisis de horizonte, riesgo y conocimiento',
        'Orientación sin mencionar productos concretos',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Inversión",
  description: "Test de 10 preguntas para saber qué tipo de inversión se adapta mejor a tu perfil: fondos indexados, acciones directas, renta fija, inversión inmobiliaria o plan de pensiones/PPI. Análisis según horiz",
  url: "https://meskeia.com/selector-inversiones/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipo de inversión es mejor para un principiante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para quien empieza a invertir, los fondos indexados de bajo coste (como los que replican el MSCI World o el S&P 500) suelen ser el punto de partida más recomendado, porque diversifican automáticamente y no requieren seleccionar empresas individuales. Aportan exposición global con comisiones muy bajas, lo que mejora el rendimiento neto a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencian los fondos indexados de las acciones directas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un fondo indexado compra una cesta de centenares o miles de empresas replicando un índice, por lo que el riesgo está muy diversificado. Las acciones directas implican seleccionar empresas concretas, lo que puede dar rendimientos superiores pero también pérdidas mayores si la empresa va mal. Los fondos indexados tienen además comisiones de gestión más bajas que los fondos activos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene elegir renta fija en lugar de renta variable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La renta fija (bonos, letras del Tesoro, depósitos) es preferible cuando el horizonte de inversión es corto (menos de 3-5 años) o cuando se necesita preservar el capital con baja volatilidad. A partir de 2022, con los tipos de interés más altos, la renta fija de corto plazo recuperó su atractivo y ofrece rentabilidades del 3-4% anual con riesgo limitado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un test de perfil inversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que disponga de ahorros y no sepa bien qué vehículo de inversión encaja con su situación. El test tiene en cuenta variables clave como la tolerancia al riesgo, el horizonte temporal, los objetivos financieros y el conocimiento previo. El resultado orienta, aunque no sustituye al asesoramiento financiero profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventajas fiscales tiene un plan de pensiones frente a un fondo de inversión en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aportaciones a planes de pensiones individuales reducen la base imponible del IRPF hasta 1.500 € al año (límite general en 2024), lo que supone un ahorro fiscal inmediato. Los fondos de inversión no tienen esa ventaja de aportación, pero permiten traspasos sin tributar y tienen mayor liquidez. Al rescatar el plan de pensiones se tributa como rendimiento del trabajo, lo que puede resultar desventajoso si la pensión pública ya es alta.',
      },
    },
  ],
};
