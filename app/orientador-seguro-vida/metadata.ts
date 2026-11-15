import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Seguro de Vida - meskeIA',
  description: 'Calcula cuánto seguro de vida necesitas para proteger a tu familia. Analiza ingresos, deudas, hipoteca y gastos futuros para determinar el capital óptimo.',
  keywords: 'calculadora seguro vida, cuanto seguro vida necesito, capital seguro vida, proteccion familiar, seguro vida familia, calcular seguro vida España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Seguro de Vida - meskeIA',
    description: 'Calcula cuánto seguro de vida necesitas para proteger a tu familia según tus ingresos, deudas y situación familiar.',
    url: 'https://meskeia.com/orientador-seguro-vida/',
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
    title: 'Orientador Seguro de Vida - meskeIA',
    description: 'Calcula cuánto seguro de vida necesitas para proteger a tu familia.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/orientador-seguro-vida/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Seguro de Vida",
  description: "Calcula cuánto seguro de vida necesitas para proteger a tu familia. Analiza ingresos, deudas, hipoteca y gastos futuros para determinar el capital óptimo.",
  url: "https://meskeia.com/orientador-seguro-vida/",
  category: 'FinanceApplication',
  features: [],
});

// Cabo C0570 (15/11/2026): el JSON-LD daba 150.000 € por 15-35 € al mes a los 35 años y la visible
// 200.000 € por 15-25 €, sin fuente ninguna de las dos. No hay precios públicos por perfil (UNESPA e
// ICEA publican volúmenes del sector, no primas por edad y capital) y la app no calcula primas: o se
// calcula o no hay cifra. Quedan los factores que mueven la prima, que es lo que la app explica.
export const RESPUESTA_FAQ_COSTE =
  'Depende sobre todo de la edad al contratar, del capital asegurado, del plazo de cobertura, del estado de salud y de si fumas: la prima sube con cada uno de ellos, y por eso contratar antes suele salir más barato. No hay un precio público de referencia por perfil, así que la forma fiable de saberlo es pedir presupuesto a varias aseguradoras con el mismo capital, plazo y coberturas, y comparar también las exclusiones.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto capital debería tener un seguro de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El capital necesario depende de varios factores: las deudas pendientes (hipoteca, préstamos), los años que tus beneficiarios necesitarían sustituir tus ingresos y los gastos futuros previstos como educación de los hijos. Una regla orientativa habitual es cubrir entre 5 y 10 veces los ingresos anuales netos, más el saldo de la hipoteca y otras deudas. Un cálculo personalizado tiene en cuenta también el patrimonio ya acumulado y los ingresos del otro cónyuge.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cubre un seguro de vida de fallecimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un seguro de vida de fallecimiento paga un capital o renta a los beneficiarios designados (habitualmente cónyuge e hijos) cuando el asegurado fallece durante la vigencia de la póliza. Algunas pólizas incluyen también invalidez permanente absoluta, gran invalidez o enfermedad grave. La mayoría de seguros vinculados a hipotecas solo cubren fallecimiento e invalidez, mientras que los seguros de vida individuales pueden configurarse con coberturas adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A quién le conviene contratar un seguro de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un seguro de vida es especialmente recomendable para personas con dependientes económicos (hijos, cónyuge sin ingresos propios o familiares a cargo), deudas importantes como una hipoteca, o ingresos que son la principal fuente de sustento familiar. También es útil para autónomos sin prestaciones de la Seguridad Social equivalentes a las de un trabajador por cuenta ajena. Si eres joven, soltero y sin deudas, su utilidad es menor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta un seguro de vida al mes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_FAQ_COSTE,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un seguro de vida temporal y uno de ahorro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El seguro de vida temporal (o de riesgo) cubre exclusivamente el fallecimiento durante un período determinado; si el asegurado sobrevive, no recupera las primas pagadas. El seguro de vida-ahorro (unit linked, PIAS o SIALP) combina protección con acumulación de capital, pero es más caro y tiene una rentabilidad que depende del fondo o mercado vinculado. Para proteger a la familia en caso de fallecimiento, el seguro temporal ofrece mayor capital asegurado por el mismo coste.',
      },
    },
  ],
};
