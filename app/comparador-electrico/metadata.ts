import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Coche, Carro o Auto Eléctrico vs Gasolina: ¿Cuándo Compensa? Calculadora | meskeIA',
  description: 'Calcula el punto de equilibrio entre un coche (carro o auto) eléctrico y uno de gasolina. Introduce los precios, km anuales, consumos y subsidio MOVES III. Muestra el año en que el eléctrico empieza a ser más barato.',
  keywords: [
    'eléctrico vs gasolina',
    'cuando compensa el eléctrico',
    'punto de equilibrio coche eléctrico',
    'carro eléctrico vs gasolina',
    'auto eléctrico vs gasolina',
    'cuando compensa el carro eléctrico',
    'cuando compensa el auto eléctrico',
    'MOVES III subsidio',
    'ahorro coche eléctrico',
    'comparador eléctrico gasolina diesel',
    'coste eléctrico por kilómetro',
    'break even coche eléctrico España',
  ],
  openGraph: {
    title: '¿Cuándo compensa el eléctrico? Calculadora de break-even | meskeIA',
    description: 'Compara el coste total de un eléctrico vs gasolina en tu situación real. Incluye MOVES III, cargador doméstico y proyección a 10 años.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/comparador-electrico/',
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
    title: '¿Cuándo compensa el eléctrico? | meskeIA',
    description: 'Calcula el año exacto en que el coche eléctrico empieza a salirte más barato que la gasolina.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-electrico/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Comparador Eléctrico vs Combustión',
        description: 'Calculadora de punto de equilibrio entre un vehículo (coche, carro o auto) eléctrico y de combustión. Compara costes reales incluyendo precio de compra, subsidios MOVES III, consumo eléctrico, precio de gasolina, cargador doméstico y proyección a N años.',
        url: 'https://meskeia.com/comparador-electrico/',
        features: [
          'Cálculo del año de break-even (punto de equilibrio)',
          'Proyección de ahorro acumulado a 5, 8, 10 y 15 años',
          'Integración del subsidio MOVES III (0 / 4.500 € / 7.000 €)',
          'Coste de instalación de cargador doméstico',
          'Tabla comparativa año a año',
          'Coste por kilómetro de cada opción',
          '100% en el navegador, sin registro',
          'Gratuito y en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador Eléctrico vs Combustión",
  description: "Calcula el punto de equilibrio entre un coche (carro o auto) eléctrico y uno de gasolina. Introduce los precios, km anuales, consumos y subsidio MOVES III. Muestra el año en que el eléctrico empieza a ser más barato",
  url: "https://meskeia.com/comparador-electrico/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo es más barato un coche (carro o auto) eléctrico que uno de gasolina en total?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El punto de equilibrio (break-even) entre un eléctrico y un equivalente de gasolina depende fundamentalmente de tres variables: la diferencia de precio de compra, los kilómetros anuales recorridos y el coste de la electricidad doméstica frente al precio de la gasolina. En condiciones típicas españolas (precio eléctrico nocturno ~0,10-0,12 €/kWh, gasolina ~1,60 €/litro, 15.000 km anuales), el break-even suele producirse entre los 5 y 9 años si se aplica el subsidio MOVES III. Con más kilómetros anuales o precios de combustible altos, el plazo se acorta significativamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el plan MOVES III y cuánto subsidio ofrece al comprar un eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MOVES III es el programa de ayudas del Gobierno de España para la adquisición de vehículos de energías alternativas. En su última convocatoria, ofrece hasta 4.500 € para personas físicas que compren un vehículo eléctrico de batería (BEV) o de pila de combustible, y hasta 7.000 € si se achata un vehículo con más de 7 años de antigüedad. Las ayudas pueden ampliarse con bonificaciones adicionales de comunidades autónomas. El subsidio reduce directamente el precio de adquisición y, por tanto, acorta el tiempo de amortización frente a un vehículo de combustión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta recargar un coche eléctrico en casa comparado con repostar gasolina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un coche eléctrico con una autonomía de 400 km y un consumo de 15 kWh/100 km necesita unos 60 kWh para una carga completa. Recargando en tarifa nocturna (0,10 €/kWh), el coste es de 6 € por cada 400 km, lo que equivale a 1,5 €/100 km. Un vehículo de gasolina que consume 6 litros/100 km a 1,60 €/litro supone un coste de 9,60 €/100 km. El ahorro en combustible ronda los 8 €/100 km, lo que para 15.000 km anuales se traduce en unos 1.200 € de ahorro al año solo en energía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los coches eléctricos tienen menos gastos de mantenimiento que los de gasolina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, de forma significativa. Los vehículos eléctricos no requieren cambios de aceite, filtros de aceite ni de combustible, correa de distribución, embrague ni catalizador. Los frenos también duran más tiempo gracias al frenado regenerativo, que recupera energía y reduce el desgaste de pastillas. Según estimaciones del sector, el coste de mantenimiento de un eléctrico es entre un 30% y un 40% inferior al de un equivalente de combustión a lo largo de 10 años, lo que contribuye adicionalmente a su ventaja económica total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena instalar un cargador doméstico para el coche eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la mayoría de casos sí. Un cargador doméstico de Nivel 2 (7,4 kW) cuesta entre 600 y 1.200 € instalado, incluyendo el Wallbox y la instalación eléctrica. Permite cargar un vehículo eléctrico medio en 6-8 horas aprovechando las tarifas nocturnas más baratas, frente a los 20-40 horas de una toma de corriente convencional. La amortización frente al uso exclusivo de cargadores públicos (0,35-0,65 €/kWh) se consigue habitualmente en 2-4 años para un conductor que realiza 15.000 km anuales. Sin plaza de garaje propia, la viabilidad depende del acceso a carga en el trabajo o en la vía pública.',
      },
    },
  ],
};
