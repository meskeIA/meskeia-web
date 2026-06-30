import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Macroeconomía Visual: 6 Conceptos Clave Explicados | meskeIA',
  description: 'Recorrido visual e interactivo por la macroeconomía: PIB y crecimiento, inflación, empleo y desempleo, política monetaria, política fiscal y ciclo económico. Con ejemplos cotidianos y actuales.',
  keywords: 'macroeconomía, PIB, inflación, desempleo, tasa de paro, política monetaria, tipos de interés, tasas de interés, banco central, política fiscal, déficit público, deuda pública, ciclo económico, economía fácil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Macroeconomía Visual: 6 Conceptos Clave',
    description: 'Entiende cómo funciona la economía de un país: PIB, inflación, empleo, tipos de interés (tasas de interés), gasto público y ciclo económico. Visuales interactivos y ejemplos reales.',
    url: 'https://meskeia.com/visualizador-macroeconomia/',
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
    title: 'Macroeconomía Visual: 6 Conceptos Clave',
    description: 'PIB, inflación, empleo, política monetaria, política fiscal y ciclo económico, con visuales interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Macroeconomía meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Macroeconomía Visual: 6 Conceptos Clave',
  description: 'Explicador visual e interactivo de los conceptos fundamentales de la macroeconomía: PIB y crecimiento económico, inflación y poder adquisitivo, empleo y desempleo, política monetaria y tipos de interés, política fiscal (ingresos, gasto y déficit) y ciclo económico. Cada concepto incluye un visual interactivo, un ejemplo cotidiano y un caso de actualidad.',
  url: 'https://meskeia.com/visualizador-macroeconomia/',
  category: 'EducationalApplication',
  features: [
    '6 conceptos clave de macroeconomía explicados visualmente',
    'Composición del PIB en sus cuatro grandes componentes',
    'Simulador de pérdida de poder adquisitivo por la inflación',
    'Calculadora visual de la tasa de paro sobre la población activa',
    'Termostato de tipos de interés y su efecto sobre crédito e inflación',
    'Balanza de ingresos y gastos públicos con déficit o superávit',
    'Ciclo económico con enfoques keynesiano y monetarista contrastados',
  ],
  keywords: [
    'macroeconomía', 'PIB', 'inflación', 'desempleo', 'política monetaria',
    'tipos de interés', 'tasas de interés', 'banco central', 'política fiscal', 'déficit público',
    'ciclo económico',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el PIB y qué mide exactamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Producto Interior Bruto (PIB) es el valor de todos los bienes y servicios que produce un país en un año. Se calcula como la suma del consumo de los hogares, la inversión, el gasto público y las exportaciones menos las importaciones. Mide el tamaño y el crecimiento de la economía, pero no el bienestar: no recoge el trabajo no remunerado, la desigualdad ni el impacto ambiental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué mi dinero compra menos cada año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por la inflación, que es la subida generalizada y sostenida de los precios. Si la inflación es del 3 % anual, lo que costaba 100 € pasa a costar 103 € al año siguiente, así que con el mismo dinero compras menos. El efecto se acumula: con una inflación del 3 % mantenida, en diez años el poder de compra de tus ahorros guardados sin rendir cae alrededor de un 26 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la tasa de paro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tasa de paro es el número de personas desempleadas dividido entre la población activa (quienes trabajan más quienes buscan trabajo activamente), multiplicado por cien. No incluye a quienes no buscan empleo, como estudiantes o jubilados. Por eso mide la proporción de personas que, queriendo y pudiendo trabajar, no encuentran empleo, no el total de personas sin trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve que el banco central suba o baje los tipos de interés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tipos de interés (también llamados tasas de interés en Latinoamérica) son la principal herramienta de la política monetaria. Cuando el banco central los sube, el crédito se encarece, familias y empresas gastan e invierten menos, y eso reduce la presión sobre los precios: sirve para frenar la inflación. Cuando los baja, el crédito se abarata y la economía se estimula. Es como un termostato para regular la temperatura de la economía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre política monetaria y política fiscal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son las dos grandes palancas de la política económica, pero las manejan instituciones distintas. La política monetaria la controla el banco central a través de los tipos de interés y la cantidad de dinero. La política fiscal la controla el Gobierno mediante los impuestos que recauda y el gasto público que realiza. Si el Estado gasta más de lo que ingresa, incurre en déficit y aumenta la deuda pública.',
      },
    },
  ],
};
