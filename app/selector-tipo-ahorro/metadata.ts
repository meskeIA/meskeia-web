import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Ahorro — ¿Cuenta, depósito o fondo indexado? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué vehículo de ahorro te conviene: cuenta remunerada, depósito a plazo fijo, fondo indexado o una combinación. Análisis según liquidez, horizonte y perfil de riesgo.',
  keywords: [
    'cuenta remunerada o depósito',
    'fondo indexado o depósito',
    'dónde poner mis ahorros',
    'mejor forma de ahorrar España',
    'ahorro sin riesgo España',
    'depósito a plazo fijo 2025',
    'fondo indexado para principiantes',
    'rentabilidad ahorro conservador',
    'dónde invertir ahorros pequeños',
    'ahorro a corto o largo plazo',
  ],
  openGraph: {
    title: '¿Cuenta, depósito o fondo indexado? Test de ahorro | meskeIA',
    description:
      'Descubre qué vehículo de ahorro se adapta mejor a tu perfil de riesgo, horizonte temporal y necesidades de liquidez.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-ahorro/',
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
    title: '¿Dónde poner mis ahorros? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para saber si te conviene una cuenta remunerada, depósito a plazo o fondo indexado.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-tipo-ahorro/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Ahorro',
        description:
          'Test orientativo para descubrir qué vehículo de ahorro (cuenta remunerada, depósito, fondo indexado o combinación) se adapta mejor al perfil y necesidades.',
        url: 'https://meskeia.com/selector-tipo-ahorro/',
        features: [
          'Test de 10 preguntas sobre perfil y objetivos',
          '4 opciones: cuenta remunerada, depósito, fondo indexado, combinación',
          'Análisis de liquidez, horizonte y tolerancia al riesgo',
          'Explicación fiscal de cada vehículo',
          'Sin mención de entidades o productos comerciales concretos',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Ahorro",
  description: "Test de 10 preguntas para saber qué vehículo de ahorro te conviene: cuenta remunerada, depósito a plazo fijo, fondo indexado o una combinación. Análisis según liquidez, horizonte y perfil de riesgo.",
  url: "https://meskeia.com/selector-tipo-ahorro/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una cuenta remunerada y un depósito a plazo fijo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuenta remunerada permite disponer del dinero en cualquier momento (alta liquidez) y suele ofrecer entre un 2 y un 3 % TAE. El depósito a plazo fijo inmoviliza el dinero durante un período pactado (3, 6, 12 meses o más) a cambio de una rentabilidad algo mayor, que en 2024-2025 ha llegado al 3-4 % TAE en las mejores ofertas. Si necesitas acceso rápido al capital, la cuenta remunerada es más adecuada; si puedes esperar, el depósito suele dar más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un fondo indexado y para quién es adecuado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un fondo indexado replica la evolución de un índice bursátil (por ejemplo, el MSCI World o el S&P 500) con comisiones muy bajas, habitualmente entre el 0,10 % y el 0,30 % anual. Es adecuado para personas con un horizonte de inversión de al menos 5-10 años que puedan tolerar fluctuaciones en el valor de su cartera. Históricamente, los índices globales han ofrecido rentabilidades anualizadas del 7-10 % a largo plazo, aunque rentabilidades pasadas no garantizan resultados futuros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo tributan las cuentas remuneradas, los depósitos y los fondos indexados en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los intereses de cuentas remuneradas y depósitos se incluyen en las rentas del ahorro del IRPF: 19 % hasta 6.000 €, 21 % entre 6.000 y 50.000 €, 23 % entre 50.000 y 200.000 €, y 27 % a partir de 200.000 €. Los fondos indexados tienen una ventaja fiscal: no tributan hasta que se reembolsa (vende) el fondo, y además permiten traspasos entre fondos sin peaje fiscal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero debo tener en un fondo de emergencia antes de invertir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación habitual es disponer de un colchón de liquidez que cubra entre 3 y 6 meses de gastos esenciales antes de destinar dinero a productos de menor liquidez como depósitos o fondos. Este fondo de emergencia debería estar en un vehículo accesible al momento, como una cuenta remunerada o una cuenta corriente, para poder afrontar imprevistos sin necesidad de vender inversiones en mal momento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor un depósito a plazo fijo o un fondo indexado en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del horizonte temporal y la tolerancia al riesgo. Si el dinero se necesita en menos de 2-3 años, el depósito ofrece rentabilidad garantizada sin riesgo de pérdida. Si el horizonte es de 5 o más años y se acepta volatilidad a corto plazo, los fondos indexados tienen potencial de rentabilidad mayor a largo plazo. Muchos perfiles combinan ambas opciones: liquidez de corto plazo en depósito o cuenta remunerada e inversión de largo plazo en fondo indexado.',
      },
    },
  ],
};
