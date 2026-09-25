import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatNumber } from '@/lib/formatters';
import {
  TRAMOS_IRPF_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  MINIMOS_IRPF_2025,
  OBLIGACION_DECLARAR_2025,
  calcularCuotaIntegraGeneral,
} from '@/data/fiscal';
import { EJERCICIO } from './motor';

export const metadata: Metadata = {
  title: `Estimador IRPF ${EJERCICIO} - Orientación Declaración Renta | meskeIA`,
  description: `Estima orientativamente tu cuota de IRPF ${EJERCICIO}. Calcula la cuota íntegra, retenciones y si saldrá a pagar o devolver según tu situación personal y familiar.`,
  keywords: `estimador irpf, declaracion renta ${EJERCICIO}, cuota irpf, tramos irpf, minimo personal familiar, retencion irpf, a pagar devolver hacienda`,
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Estimador IRPF ${EJERCICIO} - Orientación Declaración Renta`,
    description: `Estima orientativamente tu cuota de IRPF ${EJERCICIO}: cuota íntegra, retenciones y resultado final.`,
    url: 'https://meskeia.com/estimador-irpf/',
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
    title: `Estimador IRPF ${EJERCICIO} | meskeIA`,
    description: `Estima orientativamente tu declaración de la renta ${EJERCICIO}`,
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador IRPF meskeIA',
  },
};

// ─── Cifras del FAQ: salen de data/fiscal, no se escriben a mano ──────────────
//
// Hasta el 24/09/2026 el FAQ daba la escala estatal en «5 tramos… más de 60.000 € al 22,5 %»,
// omitía el tramo de más de 300.000 € y decía que con 40.000 € de base el marginal era el
// 22,5 %, mientras la app aplicaba la escala combinada del 19 al 47 % (hallazgo 1316).

const eur = (n: number): string => `${formatNumber(n, Number.isInteger(n) ? 0 : 2)} €`;
// Espacio duro (U+00A0) entre la cifra y el %, como en la página (RAE 2010; 25/09/2026).
const pct = (n: number): string => `${formatNumber(n, n % 1 === 0 ? 0 : 2)}\u00A0%`;

function describirEscala(escala: { hasta: number; tipo: number }[]): string {
  return escala
    .map((t, i) => {
      const desde = i === 0 ? 0 : escala[i - 1].hasta;
      if (i === 0) return `hasta ${eur(t.hasta)} al ${pct(t.tipo)}`;
      if (t.hasta === Infinity) return `más de ${eur(desde)} al ${pct(t.tipo)}`;
      return `de ${eur(desde)} a ${eur(t.hasta)} al ${pct(t.tipo)}`;
    })
    .join('; ');
}

const BASE_EJEMPLO = 40000;
const MARGINAL_EJEMPLO = TRAMOS_IRPF_2025.find((t) => BASE_EJEMPLO <= t.hasta)?.tipo ?? 0;
const EFECTIVO_EJEMPLO = (calcularCuotaIntegraGeneral(BASE_EJEMPLO, MINIMOS_IRPF_2025.personal) / BASE_EJEMPLO) * 100;
const OBLIGACION = OBLIGACION_DECLARAR_2025;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `¿Cuáles son los tramos del IRPF en ${EJERCICIO}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La escala general (tarifa estatal + autonómica media) que aplica este estimador tiene ${TRAMOS_IRPF_2025.length} tramos: ${describirEscala(TRAMOS_IRPF_2025)}. Cada comunidad autónoma aprueba su propia tarifa, así que el tipo real varía por región. Los dividendos e intereses no van a esta escala sino a la del ahorro: ${describirEscala(TRAMOS_GANANCIAS_PATRIMONIALES_2025)}.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el mínimo personal y familiar en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Es la parte de la renta que no tributa porque se considera necesaria para cubrir las necesidades vitales básicas. En ${EJERCICIO} el mínimo del contribuyente es de ${eur(MINIMOS_IRPF_2025.personal)} (${eur(MINIMOS_IRPF_2025.personal_65)} desde los 65 años y ${eur(MINIMOS_IRPF_2025.personal_75)} desde los 75), más los mínimos por descendientes, ascendientes o discapacidad. No reduce la base imponible: se grava a tipo cero. La escala se aplica a la base entera y también al mínimo, y la segunda cuota se resta de la primera (art. 63.1.2.º de la Ley del IRPF).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo sale a devolver la declaración de la renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La declaración sale a devolver cuando las retenciones y pagos a cuenta practicados a lo largo del año superan la cuota resultante. Esto ocurre habitualmente si has tenido variaciones salariales a mitad de año, hijos nacidos en el ejercicio, deducciones autonómicas o situaciones que reducen tu cuota como la deducción por vivienda anterior a 2013 o las aportaciones a planes de pensiones. Con varios pagadores suele ocurrir lo contrario: sale a pagar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre tipo marginal y tipo efectivo del IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El tipo marginal es el porcentaje que se aplica al último euro de renta (el del tramo en que te encuentras). El tipo efectivo es el porcentaje real de impuestos pagados sobre el total de la base: siempre es inferior al marginal porque los primeros tramos tributan a tipos menores y el mínimo personal tributa a tipo cero. Con ${eur(BASE_EJEMPLO)} de base, el marginal es el ${pct(MARGINAL_EJEMPLO)} y el efectivo, con el mínimo de ${eur(MINIMOS_IRPF_2025.personal)}, el ${pct(EFECTIVO_EJEMPLO)}.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cuota íntegra del IRPF y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota íntegra es el resultado de aplicar la escala general (estatal + autonómica) a la base liquidable general y la escala del ahorro a la base liquidable del ahorro, restando en cada una la cuota que corresponde al mínimo personal y familiar, que así tributa a tipo cero. Después se restan las deducciones (autonómicas, por donativos, por vivienda del régimen transitorio...) para obtener la cuota líquida, y de ella las retenciones y pagos a cuenta: el resultado es la cantidad a pagar o a devolver.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Están obligados a declarar todos los contribuyentes en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `No. En general, no están obligados a declarar quienes obtienen rendimientos del trabajo de hasta ${eur(OBLIGACION.trabajo.unPagador)} anuales de un solo pagador, o de hasta ${eur(OBLIGACION.trabajo.variosPagadores)} con dos o más pagadores cuando del segundo y siguientes se reciben más de ${eur(OBLIGACION.trabajo.limiteSegundoPagador)} al año. Hay excepciones: los rendimientos del capital mobiliario y las ganancias patrimoniales sujetos a retención de más de ${eur(OBLIGACION.capitalMobiliario.limite)}, o las rentas inmobiliarias imputadas de más de ${eur(OBLIGACION.rentasImputadas.limite)}, obligan a declarar.`,
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador IRPF",
  description: `Estima orientativamente tu cuota de IRPF ${EJERCICIO}. Calcula la cuota íntegra, retenciones y si saldrá a pagar o devolver según tu situación personal y familiar.`,
  url: "https://meskeia.com/estimador-irpf/",
  category: 'FinanceApplication',
  features: [
    'Cuota íntegra con la escala general y la del ahorro',
    'Mínimo personal y familiar gravado a tipo cero (art. 63.1.2.º)',
    'Reducción por rendimientos del trabajo y gastos deducibles',
    'Reducción por tributación conjunta y familia monoparental',
    'Resultado a pagar o a devolver frente a las retenciones',
    'Desglose por tramos',
  ],
});
