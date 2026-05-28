import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Oferta, Demanda y por qué Suben los Precios - Economía Visual | meskeIA',
  description: 'Entiende las curvas de oferta y demanda con ejemplos interactivos. 5 escenarios reales: petróleo, sequía, iPhone, tipos de interés y subvenciones. Visualiza cómo se desplazan las curvas y cambia el precio de equilibrio.',
  keywords: 'oferta demanda, curvas oferta demanda, precio equilibrio, economía bachillerato, precio petróleo, subida precios, tipos de interés, subvención, mercado, microeconomía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Oferta, Demanda y por qué Suben los Precios',
    description: '5 escenarios reales que explican cómo funcionan los mercados y por qué cambian los precios.',
    url: 'https://meskeia.com/visualizador-oferta-demanda/',
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
    title: 'Oferta, Demanda y por qué Suben los Precios',
    description: 'Visualiza cómo las curvas de oferta y demanda determinan los precios con ejemplos reales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Oferta Demanda meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Oferta, Demanda y por qué Suben los Precios',
  description: 'Explicador visual interactivo de las curvas de oferta y demanda con 5 escenarios reales: subida del petróleo, sequía en la fruta, lanzamiento del iPhone, subida de tipos de interés y subvención gubernamental. Muestra el desplazamiento de curvas y el nuevo precio de equilibrio mediante visualizaciones CSS.',
  url: 'https://meskeia.com/visualizador-oferta-demanda/',
  category: 'EducationalApplication',
  features: [
    '5 escenarios económicos reales y clickables',
    'Visualización del desplazamiento de curvas de oferta y demanda',
    'Precio y cantidad de equilibrio antes y después del shock',
    'Explicación intuitiva de cada mecanismo económico',
    'Sin gráficos externos — visualización CSS pura',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
  keywords: [
    'oferta demanda', 'curvas oferta demanda', 'precio equilibrio',
    'economía bachillerato', 'microeconomía', 'mercados', 'precio petróleo',
    'tipos de interés', 'subvención', 'sequía precios',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las curvas de oferta y demanda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las curvas de oferta y demanda son representaciones gráficas de cuánto están dispuestos a comprar los consumidores (demanda) y cuánto están dispuestos a vender los productores (oferta) a cada precio. El punto donde ambas curvas se cruzan se llama precio de equilibrio, y es el precio al que el mercado se estabiliza de forma natural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué sube el precio del petróleo cuando hay conflictos geopolíticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando hay conflictos en países productores, la oferta de petróleo se reduce: los productores pueden suministrar menos cantidad a cada precio. Esa contracción de la curva de oferta hacia la izquierda desplaza el precio de equilibrio hacia arriba. Aunque la demanda no cambie, la escasez de oferta es suficiente para encarecer el producto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta una subvención gubernamental al precio de un producto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una subvención reduce el coste de producción, lo que incentiva a los productores a ofrecer más cantidad a cada precio. Esto desplaza la curva de oferta hacia la derecha, bajando el precio de equilibrio y aumentando la cantidad intercambiada en el mercado. Es el mecanismo que usan los gobiernos para abaratar bienes esenciales como alimentos o energía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve entender la ley de oferta y demanda en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comprender este mecanismo ayuda a interpretar por qué suben los precios de la vivienda, los alimentos o los combustibles. También permite anticipar el efecto de políticas como congelaciones de precios, impuestos o subvenciones. Es uno de los conceptos fundamentales de economía que explica el comportamiento de los mercados libres.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa con los precios cuando sube el tipo de interés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando el banco central sube los tipos de interés, el crédito se encarece y los consumidores y empresas piden menos préstamos. Esto reduce la demanda de bienes como viviendas o coches, desplazando la curva de demanda hacia la izquierda y bajando el precio de equilibrio. Es precisamente el mecanismo que usan los bancos centrales para controlar la inflación.',
      },
    },
  ],
};
