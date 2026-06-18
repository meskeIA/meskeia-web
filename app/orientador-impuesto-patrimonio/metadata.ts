import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador del Impuesto sobre el Patrimonio: cómo valorar tus bienes y si declaras - meskeIA',
  description:
    'Valora tus bienes según los criterios del Impuesto sobre el Patrimonio (cuentas, acciones, fondos, inmuebles) y averigua si estás obligado a declarar. Mínimo exento por comunidad, exención de vivienda habitual y planes de pensiones.',
  keywords:
    'impuesto sobre el patrimonio, declaración de patrimonio, valoración de bienes, mínimo exento, vivienda habitual, obligación de declarar patrimonio, valor catastral, saldo medio cuarto trimestre, cotización media, planes de pensiones patrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador del Impuesto sobre el Patrimonio — valora tus bienes y comprueba si declaras',
    description:
      'Aplica los criterios de valoración del Impuesto sobre el Patrimonio a cuentas, acciones, fondos e inmuebles, y comprueba si estás obligado a declarar según tu comunidad.',
    url: 'https://meskeia.com/orientador-impuesto-patrimonio/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orientador del Impuesto sobre el Patrimonio',
    description:
      'Cómo se valora cada bien en el Impuesto sobre el Patrimonio y si estás obligado a declarar.',
  },
  other: {
    'application-name': 'Orientador Impuesto Patrimonio meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Orientador del Impuesto sobre el Patrimonio',
  description:
    'Herramienta de orientación que aplica los criterios de valoración del Impuesto sobre el Patrimonio (cuentas, acciones cotizadas, fondos, seguros e inmuebles) y comprueba si el contribuyente está obligado a declarar, teniendo en cuenta el mínimo exento de su comunidad autónoma y la exención de la vivienda habitual.',
  url: 'https://meskeia.com/orientador-impuesto-patrimonio/',
  category: 'FinanceApplication',
  features: [
    'Valora cada bien según los criterios oficiales del Impuesto sobre el Patrimonio',
    'Cuentas: el mayor entre el saldo a 31/12 y el saldo medio del último trimestre',
    'Inmuebles: el mayor entre valor catastral, comprobado y de adquisición con gastos',
    'Exención de la vivienda habitual hasta 300.000 €',
    'Comprueba la obligación de declarar (umbral de 2.000.000 € y mínimo exento por CCAA)',
    'Escala estatal orientativa del 0,2 % al 3,5 %',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se valora un inmueble en el Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por el mayor de tres valores: el valor catastral, el comprobado por la Administración a efectos de otros tributos, o el valor de adquisición. Ojo: no es el valor de referencia (ese es del ITP y de Sucesiones), ni el valor catastral que Hacienda precarga en el IRPF. El valor de adquisición incluye el precio de compra más los gastos e impuestos de la operación (ITP o IVA, notaría, registro).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué valor de las cuentas bancarias se declara en el Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mayor entre el saldo a 31 de diciembre y el saldo medio del último trimestre del año. No basta con el saldo de fin de año: si vaciaste la cuenta en diciembre, prevalece el saldo medio del trimestre. La única excepción es si retiraste dinero para comprar otro bien que ya declaras, para no contarlo dos veces.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay obligación de declarar el Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En dos casos: si la cuota sale a ingresar, o si el valor bruto de tus bienes y derechos supera 2.000.000 € (en este caso debes declarar aunque no pagues nada). El mínimo exento general es de 700.000 €, pero algunas comunidades lo reducen: Cataluña, Comunidad Valenciana y Extremadura a 500.000 €, y Aragón a 400.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La vivienda habitual tributa en el Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La vivienda habitual está exenta hasta 300.000 € por contribuyente. Solo tributa el valor que exceda de esa cantidad. La parte de la hipoteca vinculada al importe exento tampoco resta como deuda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los planes de pensiones cuentan en el Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Los derechos consolidados en planes de pensiones están exentos y no se incluyen en la declaración del Impuesto sobre el Patrimonio. Es una confusión frecuente: a diferencia de los fondos de inversión, los planes de pensiones no computan.',
      },
    },
  ],
};
