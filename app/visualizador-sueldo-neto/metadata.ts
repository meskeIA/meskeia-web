import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatCurrency, formatNumber } from '@/lib';
import { FISCAL_IRPF_META, COTIZACIONES_SS_2026, BASES_SS_2026 } from '@/data/fiscal';
import { TIPO_SS_TRABAJADOR, BRUTO_TOPE_SS, SS_MAXIMA_ANUAL, ESCALA_RESUMEN } from './motor';

/**
 * Ejercicio que se calcula (hallazgo 1895, la forma del 1653 de estimador-sueldo-neto): el
 * motor usa COTIZACIONES_SS_2026, BASES_SS_2026 y la DA 61.ª de 2026, y la description, la
 * featureList y el FAQPage decían «2025».
 */
const EJERCICIO = FISCAL_IRPF_META.vigencia;

/** Porcentaje con espacio duro (U+00A0) entre cifra y signo (CLAUDE.md global §2). */
const pct = (n: number, decimales = 2) => `${formatNumber(n, decimales)} %`;

export const metadata: Metadata = {
  title: 'Tu Sueldo al Desnudo - Visualizador de Bruto a Neto | meskeIA',
  description: `Visualiza cómo se transforma tu sueldo bruto en neto. Cascada interactiva con cotizaciones SS, IRPF por tramos y deducciones. Datos ${EJERCICIO}.`,
  keywords: 'sueldo bruto neto, IRPF tramos, cotización seguridad social, nómina, retención, explicador visual, cascada salarial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Sueldo al Desnudo - De Bruto a Neto Visual',
    description: 'Visualiza cada euro que se descuenta de tu sueldo: SS, IRPF, desempleo y formación. Gráfico cascada interactivo.',
    url: 'https://meskeia.com/visualizador-sueldo-neto/',
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
    title: 'Tu Sueldo al Desnudo - Explicador Visual',
    description: 'De bruto a neto: visualiza cada descuento de tu sueldo con gráficos interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Sueldo Neto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Sueldo al Desnudo',
  description: 'Explicador visual interactivo que muestra cómo se transforma un sueldo bruto en neto. Visualización tipo cascada con cotizaciones a la Seguridad Social, IRPF por tramos y deducciones.',
  url: 'https://meskeia.com/visualizador-sueldo-neto/',
  features: [
    'Visualización cascada de bruto a neto',
    `Desglose IRPF por tramos con datos ${EJERCICIO}`,
    'Cotizaciones SS: contingencias comunes, desempleo, formación, MEI',
    'Slider interactivo de sueldo bruto',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre sueldo bruto y sueldo neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgo 1894: decía «entre un 6,35% y 6,50% del bruto». El 6,35 % es la suma sin el
        // MEI, y por encima del tope la cotización ni siquiera cae en esa horquilla.
        text: `El sueldo bruto es la cantidad total acordada con la empresa antes de cualquier descuento. El sueldo neto es lo que realmente recibes, tras descontar la cotización del trabajador a la Seguridad Social (en ${EJERCICIO}, el ${pct(TIPO_SS_TRABAJADOR)} de la base de cotización, que deja de crecer al llegar al tope de ${formatCurrency(BASES_SS_2026.maxima)} al mes: a partir de ${formatCurrency(BRUTO_TOPE_SS)} brutos al año la cotización se queda en ${formatCurrency(SS_MAXIMA_ANUAL)}) y el IRPF, que varía según el salario anual y la situación personal.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje se descuenta del sueldo para la Seguridad Social en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `En ${EJERCICIO}, el trabajador cotiza a la Seguridad Social el ${pct(TIPO_SS_TRABAJADOR)} de su base de cotización, distribuido en: contingencias comunes (${pct(COTIZACIONES_SS_2026.contingenciasComunes)}), desempleo (${pct(COTIZACIONES_SS_2026.desempleo)}), formación profesional (${pct(COTIZACIONES_SS_2026.formacionProfesional)}) y la cuota del Mecanismo de Equidad Intergeneracional (${pct(COTIZACIONES_SS_2026.mef)}). La base de cotización es el salario mensual con la parte proporcional de las pagas extra, con un tope de ${formatCurrency(BASES_SS_2026.maxima)} al mes. La empresa cotiza aparte por el mismo trabajador, algo más del 30 % de la base según la actividad.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan los tramos del IRPF en la retención de la nómina?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgos 1895 («En 2025») y 1900 (el tipo máximo no empieza en 60.000 €). La
        // retención no es el impuesto anual entre las pagas: sale de los arts. 80-86 RIRPF.
        text: `El IRPF es progresivo: cada tramo de la base tributa a un tipo diferente, no todo el salario al tipo marginal. La escala general, sumando la parte estatal y la autonómica, va del ${pct(ESCALA_RESUMEN.tipoMinimo, 0)} (hasta ${formatCurrency(ESCALA_RESUMEN.hastaPrimerTramo)}) al ${pct(ESCALA_RESUMEN.tipoMaximo, 0)} (a partir de ${formatCurrency(ESCALA_RESUMEN.desdeTipoMaximo)}), y cada comunidad autónoma fija su propia parte. El mínimo personal y familiar se grava a tipo cero. La retención de cada nómina no es el impuesto anual dividido entre las pagas: la empresa la calcula con el procedimiento de los artículos 80 a 86 del Reglamento del IRPF, y la diferencia con el impuesto del año se regulariza en la declaración de la renta.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un visualizador de sueldo bruto a neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sirve para entender exactamente qué parte de tu sueldo bruto va a cotizaciones sociales, qué parte a IRPF y qué queda como neto. Es útil al negociar una oferta laboral, comparar salarios entre países o simplemente entender tu nómina sin necesidad de conocimientos fiscales previos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la base de cotización y cómo afecta al sueldo neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base de cotización es el importe sobre el que se calculan las cotizaciones a la Seguridad Social. En general coincide con el salario bruto mensual más las pagas extraordinarias prorrateadas, aunque existen bases mínimas y máximas fijadas cada año. A mayor base de cotización, mayores descuentos y menor sueldo neto, pero también mayores prestaciones futuras como pensión o baja por enfermedad.',
      },
    },
  ],
};
