import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatCurrency, formatPercentage } from '@/lib';
import {
  PLAZO_ISD,
  TARIFA_ESTATAL_IS,
  BONIFICACIONES_CCAA_IS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCION_EDAD_MENOR_21_IS,
  REDUCCION_EDAD_MENOR_21_MAX_IS,
  REDUCCION_VIVIENDA_PORC_IS,
} from '@/data/fiscal';

/**
 * Las cifras normativas del JSON-LD, derivadas de `data/fiscal` como las de la página.
 *
 * ⚠️ 25/09/2026 (hallazgo 1826) — la respuesta de las reducciones por parentesco daba la del
 * Grupo I SIN su tope: «15.956,87 € más 3.990,72 € por cada año por debajo de 21», sin «sin
 * que la reducción pueda exceder de 47.858,59 euros» (art. 20.2.a LISD). Leída así, un recién
 * nacido reduciría 99.761,99 €, el doble del máximo: el error que se reparó en el cálculo el
 * 08/09/2026, vivo en el canal que leen las IAs. Las cifras iban tecleadas; ahora salen de
 * las mismas constantes que liquida la herramienta.
 */
const eur = (n: number) => formatCurrency(n);
const tipoMin = formatPercentage(TARIFA_ESTATAL_IS[0].tipo / 100, 2);
const tipoMax = formatPercentage(TARIFA_ESTATAL_IS[TARIFA_ESTATAL_IS.length - 1].tipo / 100, 0);
const umbralTipoMax = eur(TARIFA_ESTATAL_IS[TARIFA_ESTATAL_IS.length - 2].hasta);
const bonifMadrid = formatPercentage(BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['II']?.porcentaje ?? 0, 0);
const reduccionAsturias = eur(BONIFICACIONES_CCAA_IS['asturias'].bonificaciones['II']?.reduccionBase ?? 0);
const porcVivienda = formatPercentage(REDUCCION_VIVIENDA_PORC_IS, 0);

export const metadata: Metadata = {
  title: 'Estimador del Impuesto de Sucesiones 2025 | meskeIA',
  description: 'Estima el Impuesto de Sucesiones (ISD) en las 17 comunidades autónomas de España. Tarifa estatal, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.',
  keywords: 'impuesto sucesiones, herencias España, ISD 2025, calculadora sucesiones, CCAA sucesiones, estimador herencias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador del Impuesto de Sucesiones 2025 — meskeIA',
    description: 'Estima el ISD en las 17 CCAA de España antes de hablar con tu asesor fiscal.',
    url: 'https://meskeia.com/estimador-impuesto-sucesiones/',
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
    title: 'Estimador del Impuesto de Sucesiones 2025',
    description: 'Estima el ISD en las 17 comunidades autónomas. Orientación fiscal antes de acudir al asesor.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Impuesto de Sucesiones",
  description: "Estima el Impuesto de Sucesiones (ISD) en las 17 comunidades autónomas de España. Tarifa estatal, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.",
  url: "https://meskeia.com/estimador-impuesto-sucesiones/",
  category: 'FinanceApplication',
  features: [
    'Estimación del ISD en las 17 comunidades autónomas, con sus bonificaciones propias',
    'Tarifa estatal del art. 21.2 LISD y tarifa propia de Cataluña',
    `Reducciones por parentesco, edad, discapacidad, seguro de vida y vivienda habitual (${porcVivienda})`,
    'Coeficiente multiplicador por grupo de parentesco y patrimonio preexistente',
    'Usufructo y nuda propiedad por la regla del 89 menos la edad',
    'Reparto por porcentaje de herencia cuando hay varios herederos',
    'Desglose completo: masa hereditaria, ajuar, base liquidable, cuota íntegra y cuota final',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Impuesto de Sucesiones y quién debe pagarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto sobre Sucesiones y Donaciones (ISD) es un tributo que grava la adquisición de bienes y derechos por herencia o legado. Lo paga el heredero o legatario, no el fallecido. En España, la gestión corresponde a las comunidades autónomas, que tienen amplias competencias para establecer bonificaciones y reducciones propias, por lo que la cuota puede variar enormemente según dónde resida el fallecido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga por el Impuesto de Sucesiones en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La cuota depende de cuatro factores: el valor neto heredado, el grado de parentesco, el patrimonio previo del heredero y la comunidad autónoma. La tarifa estatal oscila entre el ${tipoMin} para los primeros tramos y el ${tipoMax} para bases liquidables superiores a ${umbralTipoMax}. Sobre esa cuota, cada comunidad aplica su propio beneficio, y no todas por la misma vía: Madrid o Andalucía bonifican el ${bonifMadrid} de la CUOTA para cónyuge e hijos, mientras Asturias actúa antes, con una reducción de ${reduccionAsturias} en la BASE de esos mismos grupos. Los dos caminos pueden acabar en cero, así que cuál resulta más barata depende del importe heredado y del parentesco: conviene calcular el caso concreto en vez de guiarse por la fama de cada comunidad.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué reducciones existen por parentesco en el Impuesto de Sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La normativa estatal (art. 20.2.a de la Ley 29/1987) establece cuatro grupos de parentesco. El Grupo I (descendientes y adoptados menores de 21 años) tiene una reducción de ${eur(REDUCCIONES_PARENTESCO_IS['I-descendiente'])} más ${eur(REDUCCION_EDAD_MENOR_21_IS)} por cada año por debajo de 21, sin que el total pueda exceder de ${eur(REDUCCION_EDAD_MENOR_21_MAX_IS)}. El Grupo II (descendientes de 21 años o más, cónyuge y ascendientes) tiene ${eur(REDUCCIONES_PARENTESCO_IS['II'])}. El Grupo III (hermanos, tíos, sobrinos y afines) tiene ${eur(REDUCCIONES_PARENTESCO_IS['III'])}. El Grupo IV (primos y extraños) no tiene reducción estatal. Muchas CCAA mejoran estas reducciones de forma notable.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay que pagar el Impuesto de Sucesiones y en qué plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        // ⚠️ El plazo para PEDIR la prórroga no es el mismo que el de presentación: son los
        // cinco primeros meses (art. 68.1 RISD), no los seis. Esta respuesta decía «antes de
        // que venza el primer plazo» mientras la página visible decía bien «antes de que
        // expiren los primeros 5 meses» tres veces, incluida su lista de errores caros («Si
        // esperas al mes 6, ya no es posible»). Quien siguiera la versión del JSON-LD perdía
        // la prórroga y entraba en recargo (hallazgo 817, la forma exacta del 795). Las dos
        // bocas leen ya la misma constante sellada.
        text: `El plazo general para presentar y liquidar el impuesto es de ${PLAZO_ISD.mesesPresentacion} meses desde el fallecimiento. Puede solicitarse una prórroga de otros ${PLAZO_ISD.mesesProrroga} meses, pero hay que pedirla dentro de los ${PLAZO_ISD.mesesParaPedirProrroga} primeros meses: pasado ese momento ya no es posible. La prórroga devenga intereses de demora por los meses adicionales. Pasado el plazo sin presentar la declaración, la Administración puede iniciar un expediente sancionador además de liquidar recargos e intereses (${PLAZO_ISD.norma}).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué comunidad autónoma se paga el Impuesto de Sucesiones, la del fallecido o la del heredero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El impuesto se liquida en la comunidad autónoma donde el causante (fallecido) tenía su residencia habitual durante los cinco años anteriores a su muerte, concretamente en la CCAA donde haya residido más tiempo en ese período. No es relevante dónde viva el heredero. Esto es importante porque la diferencia de cuota entre comunidades puede ser muy elevada para el mismo patrimonio heredado.',
      },
    },
  ],
};
