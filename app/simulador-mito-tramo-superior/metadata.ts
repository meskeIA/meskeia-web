import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '¿Subir de Tramo IRPF te Quita MÁS? - Simulador Anti-Mito | meskeIA',
  description: 'El mito de "si subo de tramo, me quitan más" desmontado con números reales. Ajusta tu bruto y aumento, ve cómo el sistema progresivo SIEMPRE deja más en tu bolsillo. IRPF España 2025.',
  keywords: 'mito tramo IRPF, no me sube el sueldo IRPF, sistema progresivo tramos, cuanto me quitan del aumento, marginal vs medio, ascenso sueldo IRPF, sistema tramos IRPF España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-mito-tramo-superior/',
  },
  openGraph: {
    type: 'website',
    title: '¿Subir de Tramo IRPF te Quita MÁS? | meskeIA',
    description: 'Demuestra con números que el mito es falso',
    url: 'https://meskeia.com/simulador-mito-tramo-superior/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Mito del Tramo Superior IRPF | meskeIA',
    description: 'Aprende cómo funciona realmente el IRPF progresivo',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Mito del Tramo Superior IRPF',
  description: 'Aplicación educativa que demuestra con cálculos reales que el mito popular "si subo de tramo IRPF, me quitan más en total" es matemáticamente falso. Ajusta tu bruto y un aumento, observa que tu neto siempre sube.',
  url: 'https://meskeia.com/simulador-mito-tramo-superior/',
  category: 'FinanceApplication',
  features: [
    'Comparativa antes/después/diferencia de un aumento de sueldo',
    'Gráfico de neto vs bruto con marcadores de tramos',
    '4 casos clásicos del mito (cruzando cada frontera)',
    'Mensaje educativo claro con números reales',
    'Datos basados en LPGE 2025 y Ley 35/2006',
    'Solo orientativo — verifica con la AEAT',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['mito IRPF', 'tramos IRPF', 'tipo marginal', 'fiscal España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Es verdad que si subo de tramo IRPF me quitan más dinero en total?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Este es un mito muy extendido pero matemáticamente falso. En España el IRPF es un impuesto de tramos marginales: al cruzar un umbral, el tipo más alto solo se aplica a los euros que superan ese límite, no a toda la renta. Por tanto, ganar más siempre incrementa el neto que recibes, aunque el porcentaje sobre el exceso sea mayor. Nunca es posible que un aumento de sueldo resulte en menos dinero tras impuestos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué tanta gente cree que subir de tramo sale perjudicial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La confusión surge al mezclar el concepto de tipo marginal con el de tipo medio. Cuando se dice "si ganas 60.001 € tributas al 45%", se entiende erróneamente que ese 45% se aplica a todos los ingresos, cuando en realidad solo afecta al euro que supera los 60.000 €. El tipo medio siempre es menor que el marginal. La percepción también se ve reforzada por el efecto psicológico del cambio en la nómina cuando se revisa la retención al inicio del año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los tramos del IRPF estatal en España para 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tramos estatales del IRPF para 2025 son: 19% hasta 12.450 €, 24% entre 12.450 € y 20.200 €, 30% entre 20.200 € y 35.200 €, 37% entre 35.200 € y 60.000 €, 45% entre 60.000 € y 300.000 €, y 47% por encima de 300.000 €. A estos tipos hay que sumar los tramos autonómicos, que varían según la comunidad de residencia. La base sobre la que se aplican es la base liquidable, no el salario bruto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta realmente una subida de sueldo a mi neto después de impuestos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Siempre de forma positiva. Si una subida te lleva a un tramo superior, solo pagarás el tipo más alto sobre el tramo que superas el umbral. Por ejemplo, si estás justo en el límite de 35.200 € y recibes 1.000 € de aumento, los primeros euros hasta 35.200 € tributan al 30% y el resto al 37%. El neto adicional en el tramo 37% sería aproximadamente 630 € de los 1.000 €, lo que siempre es mejor que los 0 € que recibirías sin subida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede ser que una subida de sueldo me quite dinero neto alguna vez en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el sistema de tramos del IRPF español, una subida de renta nunca reduce el neto. Sin embargo, hay situaciones puntuales relacionadas con otros factores donde la renta adicional puede afectar a beneficios ligados a umbrales de renta, como ayudas públicas, becas o prestaciones condicionadas a no superar cierto ingreso. En esos casos no es el impuesto quien penaliza, sino la pérdida de la ayuda al superar el límite establecido para recibirla.',
      },
    },
  ],
};
