import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  RANGO_ITP_OTROS,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
} from '@/data/itp-ccaa';
import { PORCENTAJES_IVA } from '@/data/fiscal';

/** Un rango es un dato DERIVADO de la tabla de CCAA: escrito a mano envejece en silencio. */
const pct = (n: number) => `${String(n).replace('.', ',')}\u00A0%`;

/**
 * Las cuatro preguntas que la FAQ visible y el FAQPage hacían por separado, con dos respuestas
 * escritas aparte (hallazgo 3095, 08/10/2026): cada boca callaba lo que daba la otra. UNA
 * constante por pregunta, que importan las dos, como en app/simulador-gastos-compraventa-garaje.
 */
export const PREGUNTA_IVA_O_ITP = '¿Se paga IVA o ITP al comprar una finca rústica?';
export const RESPUESTA_IVA_O_ITP = `Por regla general, ITP. La transmisión de un terreno rústico no edificable está exenta de IVA (art. 20.Uno.20.º de la Ley del IVA), incluso cuando el vendedor es empresario, así que se paga ITP (Impuesto de Transmisiones Patrimoniales) al tipo general de la comunidad autónoma, que va del ${pct(RANGO_ITP_OTROS.min)} al ${pct(RANGO_ITP_OTROS.max)} contando el tramo más alto de las comunidades con escala progresiva. En Ceuta y Melilla la cuota se bonifica al ${pct(BONIFICACION_CUOTA_CEUTA_MELILLA * 100)} (art. 57 bis del TRLITPAJD), lo que deja el tipo efectivo por debajo de ese mínimo. Solo se paga IVA si hay renuncia a la exención entre profesionales con derecho a deducción, y en Canarias, Ceuta y Melilla ni siquiera entonces: allí rige el IGIC o el IPSI. En Canarias la renuncia es a la exención del IGIC (art. 50.Cinco de la Ley canaria 4/2012), que esta calculadora no cifra; en Ceuta y Melilla el IPSI no la admite (Ley 8/1991, arts. 7 y 20.3), así que allí se paga siempre ITP.`;
export const PREGUNTA_PLUSVALIA = '¿Se paga plusvalía municipal al comprar o vender una finca rústica?';
export const RESPUESTA_PLUSVALIA = 'No. La plusvalía municipal (IIVTNU) solo grava el incremento de valor de los terrenos de naturaleza urbana: el suelo rústico queda fuera del hecho imponible, así que la venta de una finca rústica no genera este impuesto. Otra cosa es la ganancia patrimonial en el IRPF del vendedor, que sí puede tributar.';
export const PREGUNTA_RENUNCIA = '¿Qué es la renuncia a la exención de IVA en tierras rústicas?';
export const RESPUESTA_RENUNCIA = `Es la opción (art. 20.Dos de la Ley del IVA) por la que el vendedor renuncia a la exención y la operación pasa a tributar por IVA al ${pct(PORCENTAJES_IVA.general)} en lugar de ITP, con inversión del sujeto pasivo: el comprador lo autoliquida y lo deduce en el modelo 303. Solo cabe entre empresarios o profesionales con derecho a deducir el IVA; interesa cuando el comprador puede deducirlo y así evita un ITP no recuperable. En Canarias, Ceuta y Melilla no hay IVA al que renunciar: allí la operación va por IGIC o IPSI. El IGIC tiene su propia renuncia, con las mismas condiciones y también con inversión del sujeto pasivo (art. 50.Cinco de la Ley canaria 4/2012), que la calculadora no cifra; el IPSI no tiene ninguna (Ley 8/1991, arts. 7 y 20.3), así que en Ceuta y Melilla se paga siempre ITP.`;
export const PREGUNTA_REDUCCIONES = '¿Qué reducciones de ITP existen para explotaciones agrarias?';
export const RESPUESTA_REDUCCIONES = 'La Ley 19/1995 de Modernización de Explotaciones Agrarias prevé reducciones en la base imponible del impuesto para la adquisición de fincas por titulares de explotaciones prioritarias y por jóvenes agricultores que se instalan por primera vez. Además, algunas comunidades autónomas aplican tipos reducidos propios. Los porcentajes y requisitos varían, así que conviene confirmarlos con la normativa de cada comunidad.';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Finca Rústica - ITP, Notaría y Registro | meskeIA',
  description: 'Calcula los gastos de compra de una finca o terreno rústico en España: ITP por comunidad autónoma, notaría y registro. Sin plusvalía municipal (suelo rústico) y con opción de renuncia a la exención de IVA entre profesionales. Gratis y sin registro.',
  keywords: 'simulador gastos compra finca rustica, gastos compraventa terreno rustico, itp finca rustica, comprar terreno agricola impuestos, impuestos finca rustica, calculadora finca rustica españa, renuncia exencion iva terreno, escriturar finca rustica, cuanto cuesta escriturar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-terreno-rustico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compra Finca Rústica | meskeIA',
    description: 'Calcula el ITP, notaría y registro de la compra de una finca o terreno rústico en España. Sin plusvalía municipal.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-terreno-rustico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Finca Rústica | meskeIA',
    description: 'ITP, notaría y registro en la compra de una finca o terreno rústico en España. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Finca Rústica',
  description: 'Calculadora de gastos de compra de finca o terreno rústico en España. Incluye ITP por comunidad autónoma, notaría y registro, sin plusvalía municipal al tratarse de suelo rústico, y la opción de renuncia a la exención de IVA entre profesionales con inversión del sujeto pasivo.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-terreno-rustico/',
  category: 'FinanceApplication',
  features: [
    'ITP por comunidad autónoma en la compra de finca rústica',
    'Sin plusvalía municipal (suelo rústico)',
    'Renuncia a la exención de IVA entre profesionales (inversión del sujeto pasivo)',
    'Gastos de notaría y registro de la propiedad',
    'Nota sobre reducciones para explotaciones agrarias y jóvenes agricultores',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos finca rústica', 'ITP terreno rústico', 'comprar finca agrícola', 'renuncia exención IVA', 'compraventa terreno rústico', 'España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: preguntaEscriturar(CASOS_ESCRITURAR.rustica.inmueble),
      acceptedAnswer: {
        '@type': 'Answer',
        text: respuestaEscriturar(CASOS_ESCRITURAR.rustica),
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
      name: PREGUNTA_PLUSVALIA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_PLUSVALIA,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_RENUNCIA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_RENUNCIA,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_REDUCCIONES,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_REDUCCIONES,
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia comprar una finca rústica de comprar un solar edificable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La fiscalidad cambia. El terreno rústico no edificable está exento de IVA, tributa por ITP y no genera plusvalía municipal. En cambio, un solar o terreno edificable vendido por un promotor o empresario tributa por IVA al ${pct(PORCENTAJES_IVA.general)} más AJD, y al ser suelo urbano está sujeto a la plusvalía municipal del vendedor cuando hay incremento real del valor del terreno (sin incremento, la transmisión no está sujeta: art. 104.5 TRLRHL). Son dos operaciones distintas con impuestos distintos. En Canarias, Ceuta y Melilla el IVA de esa segunda operación se sustituye por el IGIC o el IPSI.`,
      },
    },
  ],
};
