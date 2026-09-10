import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  REDUCCION_VIVIENDA_MAX_IS,
  REDUCCION_VIVIENDA_MAX_CATALUNA_IS,
  BONIFICACIONES_CCAA_IS,
} from '@/data/fiscal';
import { calcularSucesion } from '@/lib/calculadoras/sucesiones';

/**
 * La escala de la base del ahorro que sirve el FAQPage se DERIVA de `data/fiscal`.
 *
 * ── Por qué (27/08/2026, hallazgo 463) ────────────────────────────────────────
 * Escrita a mano se había quedado en CUATRO tramos con el último abierto («27% por
 * encima»), cuando `TRAMOS_GANANCIAS_PATRIMONIALES_2025` tiene CINCO (27 % hasta 300.000 €
 * y 30 % en adelante) y tanto el bloque educativo como el panel de resultados de esta misma
 * página los enumeran bien. En una ganancia de 1.793.195,95 € la diferencia entre lo que
 * promete el texto y lo que cobra la app son 44.795,88 €. Y este bloque es el que leen Bing
 * Copilot, ChatGPT, Perplexity y Gemini, donde ya no va acompañado del disclaimer.
 */
const euros = (n: number) => `${n.toLocaleString('es-ES')} €`;
const ESCALA_AHORRO = TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t, i, todos) => {
  const desde = i === 0 ? 0 : todos[i - 1].hasta;
  if (t.hasta === Infinity) return `${t.tipo}% a partir de ${euros(desde)}`;
  return i === 0 ? `${t.tipo}% hasta ${euros(t.hasta)}` : `${t.tipo}% de ${euros(desde)} a ${euros(t.hasta)}`;
}).join(', ');

/**
 * La comparativa Madrid–Cataluña, calculada con el MOTOR de la propia página.
 *
 * ── Por qué (10/09/2026, hallazgos 693 y 694) ─────────────────────────────────
 * Esta respuesta —la que contesta «¿me conviene una comunidad u otra?», y la que leen Bing
 * Copilot, ChatGPT, Perplexity y Gemini sin el disclaimer al lado— prometía una diferencia
 * «que puede superar los 20.000 €» que el motor de la página no alcanza ni en su escenario
 * más extremo (el máximo son 10.047,59 €, menos de la mitad), y que además CAMBIA DE SIGNO
 * cuando la vivienda era la habitual del fallecido: ahí Cataluña sale más barata. Es la
 * forma exacta del hallazgo 275: la prosa contando una versión que el motor no calcula.
 *
 * Y decía que «Cataluña tiene reducciones más limitadas», que es la imagen ANTERIOR a la
 * reparación del 08/09/2026 (f6c0650a, verificada contra la Agència Tributària): las
 * reducciones catalanas son 6 y 4 veces MAYORES que las estatales. Lo que Cataluña tiene
 * más limitado es la BONIFICACIÓN EN CUOTA. La corrección llegó a data/fiscal y al motor, y
 * no había llegado a este canal.
 *
 * Derivarlo del motor, y no corregir el número, es lo que impide que vuelva a separarse.
 */
const EJEMPLO_COMPARATIVA = { valor: 300000, edad: 45 };
const isdDe = (ccaa: string, viviendaHabitual: boolean) =>
  calcularSucesion({
    baseImponible: EJEMPLO_COMPARATIVA.valor,
    ccaa,
    grupo: 'II',
    edadHeredero: EJEMPLO_COMPARATIVA.edad,
    ...(viviendaHabitual ? { viviendaHabitual: EJEMPLO_COMPARATIVA.valor } : {}),
  }).cuotaFinal;
const DIFERENCIA_MADRID_CATALUNA = Math.round(
  Math.abs(isdDe('cataluna', false) - isdDe('madrid', false)),
);
const BONIFICACION_MADRID_PCT = Math.round(
  (BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['I-descendiente']?.porcentaje ?? 0) * 100,
);

export const metadata: Metadata = {
  title: 'Simulador Heredar Vivienda - ISD + Plusvalía + IRPF | meskeIA',
  description:
    'Calcula orientativamente el coste fiscal total de heredar una vivienda y venderla en España: Impuesto de Sucesiones (ISD), plusvalía municipal (IIVTNU) e IRPF al vender. 17 CCAA, parentesco, vivienda habitual.',
  keywords:
    'heredar vivienda España impuestos, ISD herencia vivienda, plusvalía municipal herencia, IRPF venta vivienda heredada, impuesto sucesiones vivienda, IIVTNU coeficientes, ganancia patrimonial herencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-heredar-vivienda/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Heredar Vivienda | meskeIA',
    description: 'Calcula ISD + plusvalía + IRPF al heredar y vender vivienda',
    url: 'https://meskeia.com/simulador-heredar-vivienda/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Heredar Vivienda | meskeIA',
    description: 'Coste fiscal de heredar y vender vivienda',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Coste Fiscal de Heredar y Vender Vivienda',
  description:
    'Calculadora orientativa del coste fiscal completo al heredar una vivienda y venderla en España: Impuesto de Sucesiones (ISD) según CCAA y parentesco, plusvalía municipal (IIVTNU) por método objetivo o real, e IRPF de la ganancia patrimonial al vender.',
  url: 'https://meskeia.com/simulador-heredar-vivienda/',
  category: 'FinanceApplication',
  features: [
    'Cálculo en cadena de los 3 impuestos: ISD + IIVTNU + IRPF',
    'Soporte 17 CCAA con bonificaciones específicas',
    'Reducción por parentesco y vivienda habitual',
    'Plusvalía municipal: método objetivo y real, elige el menor',
    'Ganancia patrimonial al vender, ajustada por impuestos pagados',
    '4 casos preconfigurados con CCAA distintas',
    'Datos basados en Ley 29/1987 ISD y RDL 26/2021 plusvalía',
    'Solo orientativo — consulta con notario y asesor fiscal',
    'En español',
  ],
  keywords: ['ISD', 'plusvalía municipal', 'IRPF herencia', 'heredar vivienda España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué impuestos hay que pagar al heredar una vivienda en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al heredar una vivienda en España se pagan hasta tres impuestos: el Impuesto de Sucesiones y Donaciones (ISD), la plusvalía municipal (IIVTNU) y, si se vende posteriormente, el IRPF por la ganancia patrimonial. El ISD varía mucho según la comunidad autónoma y el grado de parentesco; algunas CCAA como Madrid o Extremadura aplican bonificaciones del 99% para familiares directos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la plusvalía municipal al heredar una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La plusvalía municipal (IIVTNU) grava el incremento del valor del terreno urbano desde la última transmisión. Desde 2021 el contribuyente puede elegir entre el método objetivo (valor catastral × coeficiente × tipo) y el método real (diferencia entre valores de adquisición y transmisión × % del terreno). El ayuntamiento aplica el que resulte menor. Si no hay incremento real, se puede impugnar la liquidación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto IRPF se paga al vender una vivienda heredada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La ganancia patrimonial se calcula como la diferencia entre el precio de venta y el valor declarado en la herencia (que actúa como precio de adquisición). Ese beneficio tributa en la base del ahorro del IRPF: ${ESCALA_AHORRO}. Las exenciones del IRPF miran la vivienda habitual DEL QUE VENDE, no la del fallecido: el mayor de 65 años que transmite SU vivienda habitual (art. 33.4.b LIRPF) y la reinversión en la propia vivienda habitual (art. 38 LIRPF). Que la casa fuera la habitual del fallecido es el requisito de la reducción del Impuesto de Sucesiones (art. 20.2.c LISD), que es otro impuesto: para el heredero que vende una casa que no habita, la ganancia tributa entera.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este simulador de heredar vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para herederos que quieren estimar el coste fiscal total antes de tomar decisiones: aceptar la herencia, vender inmediatamente, esperar o acordar con otros herederos. También sirve para comparar el impacto según la comunidad autónoma donde radica el inmueble. Los resultados son orientativos y no sustituyen a un asesor fiscal o notario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre heredar en Madrid y en Cataluña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La diferencia puede ser significativa, aunque menor de lo que suele decirse. Madrid aplica una bonificación del ${BONIFICACION_MADRID_PCT}% en la cuota del ISD para cónyuge, descendientes y ascendientes, lo que lo reduce casi a cero. Cataluña, al contrario de lo que se repite, tiene reducciones de parentesco y de vivienda habitual MAYORES que las estatales (${euros(REDUCCIONES_PARENTESCO_CATALUNA_IS['II'])} y hasta ${euros(REDUCCION_VIVIENDA_MAX_CATALUNA_IS)}, frente a ${euros(Math.round(REDUCCIONES_PARENTESCO_IS['II']))} y ${euros(Math.round(REDUCCION_VIVIENDA_MAX_IS))}); lo que tiene más limitado es la BONIFICACIÓN EN CUOTA, que es una escala ponderada (art. 58 bis de la Ley 19/2010) en vez del ${BONIFICACION_MADRID_PCT}% fijo de Madrid. Para una vivienda de ${euros(EJEMPLO_COMPARATIVA.valor)} heredada por un hijo, la diferencia que calcula este simulador es de ${euros(DIFERENCIA_MADRID_CATALUNA)} si no era la vivienda habitual del fallecido. Si lo era, la reducción catalana es tan amplia que el ISD sale a 0 € y es Cataluña la más barata de las dos.`,
      },
    },
  ],
};
