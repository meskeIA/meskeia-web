import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comercio Internacional - Ventaja Comparativa, Balanza Comercial y Aranceles | meskeIA',
  description:
    'Visualiza el comercio internacional: ventaja comparativa de Ricardo, balanza comercial de España, tipos de cambio y su efecto en exportaciones, y simulador de aranceles.',
  keywords: [
    'comercio internacional',
    'ventaja comparativa',
    'balanza comercial',
    'tipos de cambio',
    'aranceles',
    'proteccionismo',
    'exportaciones',
    'importaciones',
    'OMC',
    'libre comercio',
    'economia bachillerato',
  ],
  openGraph: {
    title: 'Comercio Internacional | meskeIA',
    description:
      'Ventaja comparativa, balanza comercial, tipos de cambio y aranceles explicados visualmente',
    url: 'https://meskeia.com/visualizador-comercio-internacional/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comercio Internacional - Ventaja Comparativa y Aranceles",
  description: "Visualiza el comercio internacional: ventaja comparativa de Ricardo, balanza comercial de España, tipos de cambio y su efecto en exportaciones, y simulador de aranceles.",
  url: "https://meskeia.com/visualizador-comercio-internacional/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la ventaja comparativa y por qué explica el comercio internacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ventaja comparativa, formulada por David Ricardo en 1817, establece que un país se beneficia de especializarse en producir los bienes en los que tiene un menor coste de oportunidad relativo, aunque otro país sea más eficiente en todo. Por eso Portugal exporta vino y Reino Unido exportaba paño incluso si Portugal podía producir ambos con menos trabajo: especializarse y comerciar es más eficiente que la autarquía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el tipo de cambio a las exportaciones de un país?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando la moneda de un país se deprecia, sus exportaciones se abaratan para los compradores extranjeros, lo que normalmente aumenta el volumen exportado. A la vez, las importaciones se encarecen para los nacionales. Un euro más débil frente al dólar, por ejemplo, favorece a los exportadores europeos pero encarece las materias primas y la energía que se cotizan en dólares. El efecto neto en la balanza comercial suele tardar entre 12 y 18 meses en materializarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la balanza comercial y cuándo es deficitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La balanza comercial recoge la diferencia entre el valor de las exportaciones y las importaciones de un país durante un período. Si las exportaciones superan a las importaciones, el saldo es superavitario; si ocurre lo contrario, es deficitario. Un déficit crónico puede indicar pérdida de competitividad o exceso de demanda interna, aunque países como EE. UU. mantienen déficits estructurales durante décadas sin que ello implique necesariamente una crisis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan los aranceles y qué efectos tienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un arancel es un impuesto que el país importador cobra sobre las mercancías extranjeras al cruzar la frontera. Encarece el producto importado, protegiendo a los productores nacionales de la competencia exterior, pero a costa de que los consumidores paguen precios más altos. Los aranceles también pueden desencadenar represalias comerciales del país afectado. La OMC regula los límites arancelarios entre sus 164 países miembros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este visualizador de comercio internacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El visualizador está diseñado para estudiantes de economía de bachillerato y primeros cursos universitarios, así como para cualquier persona que quiera entender los conceptos básicos del comercio global sin necesidad de conocimientos previos avanzados. Los cuatro módulos (ventaja comparativa, balanza comercial, tipos de cambio y aranceles) cubren los contenidos habituales del temario de Economía de 2.º de Bachillerato.',
      },
    },
  ],
};
