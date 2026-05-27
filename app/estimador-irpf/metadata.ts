import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador IRPF 2025 - Orientación Declaración Renta | meskeIA',
  description: 'Estima orientativamente tu cuota de IRPF 2025. Calcula la cuota íntegra, retenciones y si saldrá a pagar o devolver según tu situación personal y familiar.',
  keywords: 'estimador irpf, declaracion renta 2025, cuota irpf, tramos irpf, minimo personal familiar, retencion irpf, a pagar devolver hacienda',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador IRPF 2025 - Orientación Declaración Renta',
    description: 'Estima orientativamente tu cuota de IRPF 2025: cuota íntegra, retenciones y resultado final.',
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
    title: 'Estimador IRPF 2025 | meskeIA',
    description: 'Estima orientativamente tu declaración de la renta 2025',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador IRPF meskeIA',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los tramos del IRPF en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IRPF estatal 2025 tiene 5 tramos: hasta 12.450 € tributa al 9,5%; de 12.450 a 20.200 € al 12%; de 20.200 a 35.200 € al 15%; de 35.200 a 60.000 € al 18,5%; y más de 60.000 € al 22,5%. A estos tipos se suman los tramos autonómicos, que varían por comunidad. El tipo efectivo real suele ser muy inferior al marginal porque cada tramo solo aplica a la renta que le corresponde.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el mínimo personal y familiar en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la parte de la renta que no tributa porque se considera necesaria para cubrir las necesidades vitales básicas. En 2025 el mínimo personal general es de 5.550 €. Se incrementa por edad (1.150 € si tienes más de 65 años, 1.400 € si tienes más de 75) y por descendientes, ascendientes o discapacidad a tu cargo. Reduce directamente la cuota íntegra, no la base imponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo sale a devolver la declaración de la renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La declaración sale a devolver cuando las retenciones practicadas por tu pagador a lo largo del año superan la cuota diferencial calculada. Esto ocurre habitualmente si has tenido múltiples pagadores, variaciones salariales a mitad de año, hijos nacidos en el ejercicio, deducciones autonómicas o situaciones que reducen tu cuota como hipoteca pre-2013 o aportaciones a planes de pensiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre tipo marginal y tipo efectivo del IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo marginal es el porcentaje que aplica al último euro de renta ganada (el tramo en que te encuentras). El tipo efectivo es el porcentaje real de impuestos pagados sobre el total de la renta: siempre es inferior al marginal porque los primeros tramos tributan a tipos menores. Con 40.000 € de base, el marginal puede ser el 22,5% pero el efectivo total ronda el 14-16%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cuota íntegra del IRPF y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota íntegra es el resultado de aplicar la tarifa del IRPF (tramos estatales + autonómicos) a la base liquidable general y a la base del ahorro. Sobre ella se aplican después las deducciones (mínimo personal y familiar, por doble imposición, por maternidad...) para obtener la cuota líquida. La diferencia entre cuota líquida y retenciones ya practicadas es el resultado final: a pagar o a devolver.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Están obligados a declarar todos los contribuyentes en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. En general, no están obligados a declarar quienes obtienen rentas del trabajo inferiores a 22.000 € anuales de un solo pagador, o inferiores a 15.876 € de dos o más pagadores cuando el segundo pagador supera 1.500 € al año. Hay excepciones: obtener rentas del capital o actividades económicas superiores a 1.600 €, o imputaciones de renta superiores a 1.000 €, obligan a declarar.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador IRPF",
  description: "Estima orientativamente tu cuota de IRPF 2025. Calcula la cuota íntegra, retenciones y si saldrá a pagar o devolver según tu situación personal y familiar.",
  url: "https://meskeia.com/estimador-irpf/",
  category: 'FinanceApplication',
  features: [],
});
