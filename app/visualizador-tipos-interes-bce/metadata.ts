import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Interés BCE - Cómo Afectan a Hipotecas, Bolsa y Ahorro | meskeIA',
  description:
    'Entiende cómo el BCE sube o baja tipos y la cadena de transmisión monetaria: hipotecas variables, crédito, bolsa y ahorro. Diagrama interactivo.',
  keywords: [
    'tipos interes BCE',
    'banco central europeo',
    'euribor',
    'politica monetaria',
    'hipotecas',
    'transmision monetaria',
    'inflacion BCE',
  ],
  openGraph: {
    title: 'Tipos de Interés BCE | meskeIA',
    description:
      'Cómo el BCE sube tipos y afecta a hipotecas, bolsa, crédito y economía real',
    url: 'https://meskeia.com/visualizador-tipos-interes-bce/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Tipos de Interés BCE - Transmisión Monetaria",
  description: "Entiende cómo el BCE sube o baja tipos y la cadena de transmisión monetaria: hipotecas variables, crédito, bolsa y ahorro. Diagrama interactivo.",
  url: "https://meskeia.com/visualizador-tipos-interes-bce/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los tipos de interés del BCE y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Banco Central Europeo (BCE) fija tres tipos de interés oficiales que determinan el coste al que los bancos comerciales pueden pedir o depositar dinero en el banco central. El más relevante es el tipo de las operaciones principales de financiación (MRO). Cuando el BCE los sube, encarece el crédito para frenar la inflación; cuando los baja, abarata la financiación para estimular la economía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta una subida de tipos del BCE a mi hipoteca variable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las hipotecas a tipo variable en la eurozona suelen referenciarse al Euríbor a 12 meses, que sigue de cerca las decisiones del BCE. Cuando el BCE sube tipos, el Euríbor sube y la cuota mensual de la hipoteca variable aumenta en la siguiente revisión anual o semestral. Por ejemplo, una subida de 1 punto porcentual en el Euríbor equivale a unos 50-60 € más al mes por cada 100.000 € de hipoteca pendiente a 20 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tienen los tipos de interés del BCE con la bolsa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tipos más altos reducen el atractivo relativo de las acciones frente a los bonos (que ofrecen más rentabilidad), encarecen la deuda corporativa y comprimen los márgenes de las empresas muy endeudadas, lo que suele presionar a la baja las cotizaciones bursátiles. Por el contrario, bajadas de tipos suelen impulsar la renta variable al abaratar el capital y aumentar el valor presente de los flujos futuros de las empresas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la transmisión monetaria y por qué tarda en notarse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La transmisión monetaria es el proceso por el que las decisiones de tipos del BCE se trasladan a la economía real a través de varios canales: tipos bancarios, crédito disponible, tipos de cambio y expectativas. Este proceso tiene retardos de entre 12 y 24 meses, ya que los contratos crediticios se revisan periódicamente, las empresas ajustan inversiones gradualmente y los efectos sobre precios tardan en materializarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál fue el ciclo de subidas de tipos del BCE más reciente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El BCE inició en julio de 2022 el ciclo de subidas más rápido de su historia para combatir la inflación que alcanzó el 10,6% en octubre de 2022. En diez subidas consecutivas entre julio 2022 y septiembre 2023 elevó el tipo de depósito del -0,5% al 4%, máximo histórico. En junio de 2024 comenzó a recortar tipos, situándolos en el 2,5% en marzo de 2025.',
      },
    },
  ],
};
