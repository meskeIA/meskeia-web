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
const pct = (n: number) => `${String(n).replace('.', ',')}\u00A0%`;

/**
 * IVA del solar: el tipo GENERAL del art. 90 LIVA, la MISMA constante con la que calcula
 * page.tsx (`IVA_SOLAR = PORCENTAJES_IVA.general`, hallazgo 734). Hasta el 23/09/2026 este
 * fichero derivaba el FAQPage del tipo del LOCAL COMERCIAL de `IVA_INMUEBLES_2025`,
 * y escribía el «21%» a mano en la description, los features y dos respuestas (hallazgo 1275).
 */
const IVA_SOLAR = pct(PORCENTAJES_IVA.general);

/**
 * Las cuatro preguntas que la FAQ visible y el FAQPage hacían por separado, con dos respuestas
 * escritas aparte (hallazgo 3090, 08/10/2026): cada boca callaba lo que daba la otra, y la visible
 * del IVA deducible omitía «no exenta» (3089). UNA constante por pregunta, que importan las dos,
 * como en app/simulador-gastos-compraventa-garaje.
 */
export const PREGUNTA_IVA_O_ITP = '¿Se paga IVA o ITP al comprar un solar?';
export const RESPUESTA_IVA_O_ITP = `Depende de quién venda. Si el vendedor es un promotor o empresario que actúa en su actividad, la entrega del solar está sujeta a IVA al ${IVA_SOLAR} más AJD, que va del ${pct(RANGO_AJD_OTROS.min)} al ${pct(RANGO_AJD_OTROS.max)} según la comunidad autónoma (en Ceuta y Melilla la cuota se bonifica al ${pct(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)}, art. 57 bis.1 TRLITPAJD). Si el vendedor es un particular, la compra tributa por ITP al tipo general de la comunidad, salvo los tipos reducidos que alguna comunidad liga a la actividad económica del comprador (Aragón, por ejemplo, para un inmueble con el que se inicia una actividad). Nunca se pagan IVA e ITP a la vez. En Canarias, Ceuta y Melilla no rige el IVA: la operación tributa por IGIC o IPSI, con sus propios tipos.`;
export const PREGUNTA_SOLAR_NO_EXENTO = '¿Por qué el solar no está exento de IVA como la finca rústica?';
export const RESPUESTA_SOLAR_NO_EXENTO = `Porque la exención de IVA alcanza al terreno rústico y no edificable, y los solares y terrenos edificables quedan expresamente excluidos de ella. Cuando un empresario o promotor entrega un solar en el ejercicio de su actividad, la operación está sujeta y no exenta de IVA al ${IVA_SOLAR} —o de IGIC o IPSI en Canarias, Ceuta y Melilla, donde no rige el IVA—, y la escritura tributa además por Actos Jurídicos Documentados (AJD).`;
export const PREGUNTA_IVA_DEDUCIBLE = '¿Puedo deducir el IVA de la compra de un solar?';
export const RESPUESTA_IVA_DEDUCIBLE = 'Si eres promotor, empresario o autónomo y afectas el solar a una actividad económica sujeta y no exenta de IVA, puedes deducir el IVA soportado en el modelo 303. Si la actividad está exenta, no: es el caso de quien levanta en él viviendas para alquilarlas, porque ese arrendamiento está exento (art. 20.Uno.23.º de la Ley del IVA). Y un particular que compra un solar para autopromover su vivienda no actúa como empresario, así que tampoco lo deduce: el IVA soportado se convierte en un mayor coste de la parcela.';
export const PREGUNTA_PLUSVALIA = '¿Hay plusvalía municipal al comprar o vender un solar?';
export const RESPUESTA_PLUSVALIA = 'Sí, pero la paga el vendedor, no el comprador. El solar es suelo de naturaleza urbana, así que su transmisión genera plusvalía municipal (IIVTNU) sobre el incremento de valor del terreno durante el tiempo de tenencia. Si no ha habido incremento real de valor, la transmisión no está sujeta al impuesto (art. 104.5 TRLRHL, redacción del RDL 26/2021): hay que declararlo y acreditarlo con las escrituras de compra y venta.';

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
      name: PREGUNTA_IVA_O_ITP,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_IVA_O_ITP,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_SOLAR_NO_EXENTO,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_SOLAR_NO_EXENTO,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_PLUSVALIA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_PLUSVALIA,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_IVA_DEDUCIBLE,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_IVA_DEDUCIBLE,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre comprar un solar y una finca rústica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La fiscalidad es distinta. El solar edificable tributa por IVA ${IVA_SOLAR} más AJD si vende un empresario (IGIC o IPSI en Canarias, Ceuta y Melilla), o por ITP si vende un particular, y al ser suelo urbano está sujeto a la plusvalía municipal cuando hay incremento real del valor del terreno (sin incremento, la transmisión no está sujeta: art. 104.5 TRLRHL). La finca rústica no edificable está exenta de IVA (tributa por ITP incluso vendiéndola un empresario) y no genera plusvalía municipal. Por eso conviene identificar bien el tipo de suelo antes de comprar.`,
      },
    },
  ],
};
