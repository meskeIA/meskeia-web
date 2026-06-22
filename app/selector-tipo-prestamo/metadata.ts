import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Préstamo — ¿Qué financiación te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de préstamo o financiación te conviene: personal, hipotecario, de consumo, línea de crédito o microcrédito. Análisis según finalidad, importe, garantías y situación económica.',
  keywords: [
    'qué préstamo pedir',
    'préstamo personal o hipotecario',
    'crédito al consumo',
    'financiación sin aval',
    'línea de crédito o préstamo',
    'microcrédito autónomo',
    'préstamo para coche, auto o reforma',
    'cómo financiar un proyecto',
    'tipos de préstamos',
    'tasa de interés préstamo',
    'tipo de interés préstamo',
    'cuánto préstamo puedo pedir',
  ],
  openGraph: {
    title: '¿Préstamo personal, hipotecario o línea de crédito? | meskeIA',
    description:
      'Descubre qué tipo de financiación se adapta mejor a tu situación, finalidad e importe necesario.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-prestamo/',
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
    title: '¿Qué tipo de préstamo te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir entre préstamo personal, hipotecario, consumo, línea de crédito o microcrédito.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-tipo-prestamo/' },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Préstamo',
        description:
          'Test orientativo para saber qué tipo de financiación (personal, hipotecario, consumo, línea de crédito o microcrédito) se adapta mejor a la situación y necesidades.',
        url: 'https://meskeia.com/selector-tipo-prestamo/',
        features: [
          'Test de 10 preguntas sobre situación financiera',
          '5 opciones: personal, hipotecario, consumo, línea crédito, microcrédito',
          'Análisis de importe, garantías y capacidad de pago',
          'Alertas sobre sobreendeudamiento',
          '100% en el navegador, gratuito, en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Préstamo",
  description: "Test de 10 preguntas para saber qué tipo de préstamo o financiación te conviene: personal, hipotecario, de consumo, línea de crédito o microcrédito. Análisis según finalidad, importe, garantías, tasa de interés (tipo de interés) y situación económica.",
  url: "https://meskeia.com/selector-tipo-prestamo/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un préstamo personal y un crédito al consumo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un préstamo personal entrega el dinero completo de una vez y se devuelve en cuotas fijas durante un plazo acordado; es adecuado cuando conoces el importe exacto que necesitas. Un crédito al consumo es una línea de crédito rotativa (como una tarjeta) que puedes usar parcialmente y donde solo pagas intereses por el importe dispuesto. El crédito al consumo tiene más flexibilidad pero suele conllevar tipos de interés más altos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene un préstamo hipotecario frente a un préstamo personal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El préstamo hipotecario está diseñado para importes elevados (generalmente desde 50.000-80.000 €) con plazos largos (hasta 30 años) y tipos de interés bajos, porque la garantía es el inmueble. Un préstamo personal es más rápido de tramitar, no requiere garantía real y es adecuado para importes de 3.000 a 50.000 € con plazos de 1 a 10 años, aunque con intereses más altos. Para una reforma de 15.000 €, el préstamo personal es casi siempre la opción más adecuada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un microcrédito y para quién está pensado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un microcrédito es un préstamo de pequeño importe (habitualmente entre 500 y 25.000 €) destinado a personas con acceso limitado a la banca tradicional: autónomos que inician actividad, personas en situación de exclusión financiera o emprendedores sin historial crediticio. En España los gestiona principalmente el ICO (Instituto de Crédito Oficial) junto a entidades colaboradoras. Los tipos de interés son moderados pero la documentación requerida es menor que en préstamos convencionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores determinan el tipo de interés que me ofrecerá el banco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales factores son: historial crediticio (si apareces en ficheros de morosos como ASNEF el acceso es muy limitado), nivel de ingresos estables y su origen (nómina, autónomo, pensión), importe solicitado en relación a tus ingresos (ratio de endeudamiento), plazo de devolución (a más plazo, más riesgo para el banco), y si aportas garantías adicionales (aval, hipoteca). Comparar entre varias entidades puede suponer diferencias de 2-4 puntos porcentuales en el TAE.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa TAE y por qué es más importante que el TIN al comparar préstamos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El TIN (Tipo de Interés Nominal) es el tipo base del préstamo, mientras que el TAE (Tasa Anual Equivalente) incluye además las comisiones, gastos de apertura y otros costes, expresando el coste real anual del préstamo. La ley española obliga a comunicar la TAE en toda publicidad de préstamos. Siempre hay que comparar préstamos usando la TAE, no el TIN, para obtener una comparativa justa del coste total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo "tipo de interés" que "tasa de interés"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, son el mismo concepto: el porcentaje que cobra el banco por prestarte dinero. "Tipo de interés" es la forma habitual en España y "tasa de interés" la más usada en Hispanoamérica. En ambos casos conviene fijarse en la tasa anual equivalente (TAE), que refleja el coste real del préstamo incluyendo comisiones, y no solo en el tipo o tasa nominal (TIN).',
      },
    },
  ],
};
