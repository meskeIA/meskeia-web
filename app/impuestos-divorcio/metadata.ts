import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Impuestos en el Divorcio - Orientación Fiscal Personalizada | meskeIA',
  description: 'Calcula el impacto fiscal de tu divorcio en España: pensión compensatoria IRPF, mínimo por hijos, imputación de rentas por vivienda y deducción hipotecaria transitoria.',
  keywords: 'impuestos divorcio España, tributación pensión compensatoria IRPF, mínimo descendientes custodia, imputación rentas vivienda divorcio, deducción hipoteca divorcio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Impuestos en el Divorcio — Orientación Fiscal | meskeIA',
    description: 'Orientador fiscal personalizado para tu divorcio en España. Pensión compensatoria, hijos, vivienda e hipoteca.',
    url: 'https://meskeia.com/impuestos-divorcio',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Impuestos en el Divorcio — meskeIA',
    description: 'Conoce el impacto fiscal de tu divorcio: pensión compensatoria, hijos, vivienda e hipoteca.',
  },
  other: {
    'application-name': 'Impuestos en el Divorcio meskeIA',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo afecta la pensión compensatoria al IRPF en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión compensatoria que se paga al ex-cónyuge es deducible de la base imponible general del pagador en el IRPF, lo que puede suponer un ahorro fiscal significativo según su tramo marginal. Para el receptor, la pensión compensatoria tributa como rendimiento del trabajo y se integra en la base imponible general. Esta asimetría fiscal hace que sea importante negociar y cuantificar correctamente la pensión en el convenio regulador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se reparte el mínimo por descendientes cuando hay custodia compartida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En custodia compartida, cada progenitor aplica el 50% del mínimo por descendientes que corresponda a cada hijo en su declaración del IRPF. En custodia exclusiva, el progenitor custodio aplica el 100% del mínimo. Para el año 2025, el mínimo por el primer hijo menor de 25 años es de 2.400 €, por el segundo 2.700 €, por el tercero 4.000 € y por el cuarto y siguientes 4.500 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre con la deducción por hipoteca si me divorcio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si adquiriste la vivienda antes del 1 de enero de 2013 y venías aplicando la deducción por inversión en vivienda habitual, puedes seguir aplicándola aunque te divorcias, siempre que la vivienda siga constituyendo la residencia habitual de los hijos comunes o del cónyuge que no sea propietario. Esta es la llamada deducción hipotecaria transitoria y puede tener un impacto muy relevante en la decisión de quién se queda con el uso de la vivienda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La vivienda vacía tras el divorcio genera algún impuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Si eres propietario de la vivienda y esta no es tu residencia habitual ni está alquilada, el IRPF obliga a imputar una renta inmobiliaria del 2% del valor catastral (o el 1,1% si el valor ha sido revisado en los últimos 10 años). Esta imputación se produce desde el momento en que el cónyuge propietario deja de residir en ella, lo que suele ocurrir en el momento de la separación de hecho.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El reparto de bienes gananciales en el divorcio tributa en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general, la liquidación de la sociedad de gananciales no genera una ganancia o pérdida patrimonial en el IRPF siempre que cada cónyuge reciba bienes equivalentes al 50% de la masa ganancial. Sin embargo, si en la adjudicación hay un exceso de valor compensado en metálico (exceso de adjudicación), ese importe puede tributar como ganancia patrimonial. La situación se complica cuando hay plusvalías latentes en inmuebles o acciones.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Impuestos en el Divorcio',
  description: 'Orientador fiscal personalizado para procesos de divorcio en España. Calcula el impacto en el IRPF de la pensión compensatoria, el mínimo por descendientes según custodia, la imputación de rentas por la vivienda y la deducción hipotecaria transitoria.',
  url: 'https://meskeia.com/impuestos-divorcio/',
  category: 'FinanceApplication',
  features: [
    'Wizard paso a paso adaptado a tu situación',
    'Cálculo del ahorro o coste fiscal de la pensión compensatoria en IRPF',
    'Estimación del mínimo por descendientes según régimen de custodia',
    'Imputación de rentas por vivienda habitual (2% o 1,1% valor catastral)',
    'Impacto de la deducción hipotecaria transitoria pre-2013',
    'Orientación sobre liquidación de gananciales y declaración individual',
    'Sección explícita sobre qué NO cubre la herramienta',
    'Datos normativos IRPF 2025 actualizados',
  ],
});
