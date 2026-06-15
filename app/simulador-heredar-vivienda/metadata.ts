import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
        text: 'La ganancia patrimonial se calcula como la diferencia entre el precio de venta y el valor declarado en la herencia (que actúa como precio de adquisición). Ese beneficio tributa en la base del ahorro del IRPF: 19% hasta 6.000 €, 21% de 6.000 a 50.000 €, 23% de 50.000 a 200.000 € y 27% por encima. Si la vivienda era habitual del fallecido y el heredero es mayor de 65 años o la reinvierte en su propia vivienda habitual, puede quedar exenta.',
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
        text: 'La diferencia puede ser muy significativa. Madrid aplica una bonificación del 99% en el ISD para cónyuge, descendientes y ascendientes, lo que reduce el impuesto de sucesiones casi a cero. Cataluña tiene reducciones más limitadas y tipos efectivos más altos para importes elevados. Para una vivienda de 300.000 € heredada por un hijo, la diferencia de ISD entre ambas comunidades puede superar los 20.000 €.',
      },
    },
  ],
};
