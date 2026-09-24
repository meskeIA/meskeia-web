import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  RANGO_AJD_OTROS,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
} from '@/data/itp-ccaa';
import { PORCENTAJES_IVA } from '@/data/fiscal';

/** Un rango es un dato DERIVADO de la tabla de CCAA: escrito a mano envejece en silencio. */
const pct = (n: number) => `${String(n).replace('.', ',')}%`;

/**
 * IVA del solar: el tipo GENERAL del art. 90 LIVA, la MISMA constante con la que calcula
 * page.tsx (`IVA_SOLAR = PORCENTAJES_IVA.general`, hallazgo 734). Hasta el 23/09/2026 este
 * fichero derivaba el FAQPage del tipo del LOCAL COMERCIAL de `IVA_INMUEBLES_2025`,
 * y escribía el «21%» a mano en la description, los features y dos respuestas (hallazgo 1275).
 */
const IVA_SOLAR = pct(PORCENTAJES_IVA.general);

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Solar / Terreno Edificable - IVA o ITP | meskeIA',
  // La plusvalía municipal del vendedor NO se calcula: la página la da como recordatorio y lo
  // dice en «Limitaciones». La description, que es lo que enseña el buscador, prometía
  // calcularla (hallazgo 1598); la del JSON-LD ya lo decía bien.
  description: `Calcula los gastos de compra de un solar o terreno edificable en España: IVA ${IVA_SOLAR} + AJD si vende un promotor, ITP por comunidad autónoma si vende un particular, notaría y registro, con un recordatorio de la plusvalía municipal que paga el vendedor. Gratis y sin registro.`,
  keywords: 'simulador gastos compra solar, gastos compraventa terreno edificable, iva solar, itp solar, comprar parcela urbana impuestos, comprar terreno para construir impuestos, calculadora solar españa, autopromotor terreno, escriturar solar, cuanto cuesta escriturar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-solar/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compra Solar / Terreno Edificable | meskeIA',
    description: `Calcula el IVA ${IVA_SOLAR}, ITP, AJD, notaría y registro de la compra de un solar o terreno edificable en España.`,
    url: 'https://meskeia.com/simulador-gastos-compraventa-solar/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Solar / Terreno Edificable | meskeIA',
    description: `IVA ${IVA_SOLAR} o ITP según el vendedor, AJD, notaría y registro al comprar un solar en España. Calcula gratis.`,
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Solar / Terreno Edificable',
  description: `Calculadora de gastos de compra de un solar o terreno edificable en España. Incluye IVA ${IVA_SOLAR} más AJD cuando el vendedor es promotor o empresario, ITP por comunidad autónoma cuando el vendedor es un particular, gastos de notaría y registro, y nota sobre la plusvalía municipal del vendedor.`,
  url: 'https://meskeia.com/simulador-gastos-compraventa-solar/',
  category: 'FinanceApplication',
  features: [
    `IVA ${IVA_SOLAR} + AJD cuando el vendedor es promotor o empresario`,
    'ITP por comunidad autónoma cuando el vendedor es un particular',
    'Recordatorio de la plusvalía municipal del vendedor (suelo urbano; no se calcula)',
    'Gastos de notaría y registro de la propiedad',
    'Útil para autopromotores y compra de parcela para construir',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos solar', 'IVA solar', 'ITP terreno edificable', 'comprar parcela urbana', 'autopromotor', 'España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: preguntaEscriturar(CASOS_ESCRITURAR.solar.inmueble),
      acceptedAnswer: {
        '@type': 'Answer',
        text: respuestaEscriturar(CASOS_ESCRITURAR.solar),
      },
    },
    {
      '@type': 'Question',
      name: '¿Se paga IVA o ITP al comprar un solar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Depende de quién venda. Si el vendedor es un promotor o empresario que actúa en su actividad, la entrega del solar está sujeta a IVA al ${IVA_SOLAR} más AJD, que va del ${pct(RANGO_AJD_OTROS.min)} al ${pct(RANGO_AJD_OTROS.max)} según la comunidad autónoma (en Ceuta y Melilla la cuota se bonifica al ${pct(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)}, art. 57 bis.1 TRLITPAJD). Si el vendedor es un particular, la compra tributa por ITP al tipo general de la comunidad. No coinciden IVA e ITP en la misma operación. En Canarias, Ceuta y Melilla no rige el IVA: la operación tributa por IGIC o IPSI, con sus propios tipos.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un solar de empresario lleva IVA y no ITP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Porque los terrenos edificables (solares) están excluidos de la exención de IVA que sí se aplica al suelo rústico. Cuando un empresario o promotor entrega un solar en el ejercicio de su actividad, la operación está sujeta y no exenta de IVA al ${IVA_SOLAR}, y la escritura tributa además por Actos Jurídicos Documentados (AJD).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay plusvalía municipal al vender un solar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El solar es suelo de naturaleza urbana, por lo que su transmisión genera plusvalía municipal (IIVTNU) para el vendedor, calculada sobre el incremento de valor del terreno durante el tiempo de tenencia. Si no ha habido incremento real de valor, la transmisión no está sujeta al impuesto (art. 104.5 TRLRHL, redacción del RDL 26/2021): hay que declararlo y acreditarlo con las escrituras de compra y venta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo deducir el IVA de la compra de un solar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si eres promotor, empresario o autónomo y afectas el solar a una actividad económica sujeta y no exenta de IVA, puedes deducir el IVA soportado en el modelo 303. En cambio, un particular que compra un solar para autopromover su vivienda no puede deducir el IVA, que se convierte en un mayor coste de la parcela.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre comprar un solar y una finca rústica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La fiscalidad es distinta. El solar edificable tributa por IVA ${IVA_SOLAR} más AJD si vende un empresario, o por ITP si vende un particular, y al ser suelo urbano está sujeto a la plusvalía municipal cuando hay incremento real del valor del terreno (sin incremento, la transmisión no está sujeta: art. 104.5 TRLRHL). La finca rústica no edificable está exenta de IVA (tributa por ITP incluso vendiéndola un empresario) y no genera plusvalía municipal. Por eso conviene identificar bien el tipo de suelo antes de comprar.`,
      },
    },
  ],
};
