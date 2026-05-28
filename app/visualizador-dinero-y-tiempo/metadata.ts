import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Dinero y el Tiempo - Explicador Visual Interactivo | meskeIA',
  description: 'Visualiza cómo funciona una hipoteca, el interés compuesto, la inflación y la amortización anticipada. Explicaciones interactivas con gráficos animados.',
  keywords: 'interés compuesto, hipoteca visual, inflación poder adquisitivo, amortización anticipada, educación financiera, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Dinero y el Tiempo - Explicador Visual Interactivo',
    description: 'Visualiza cómo funciona una hipoteca, el interés compuesto, la inflación y la amortización anticipada con gráficos interactivos.',
    url: 'https://meskeia.com/visualizador-dinero-y-tiempo/',
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
    title: 'El Dinero y el Tiempo - Explicador Visual',
    description: 'Entiende las finanzas de forma visual: hipoteca, interés compuesto, inflación y amortización.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Dinero y Tiempo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Dinero y el Tiempo',
  description: 'Explicador visual interactivo sobre conceptos financieros fundamentales: cómo se reparte una cuota de hipoteca, cómo crece el interés compuesto, cómo la inflación erosiona tu dinero y cuándo conviene amortizar hipoteca.',
  url: 'https://meskeia.com/visualizador-dinero-y-tiempo/',
  features: [
    'Visualización interactiva de cuotas hipotecarias mes a mes',
    'Gráfico animado de interés compuesto vs simple vs sin interés',
    'Simulación visual de la erosión del poder adquisitivo por inflación',
    'Comparativa visual: amortizar hipoteca vs invertir',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el interés compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés compuesto es el proceso por el cual los intereses generados se suman al capital inicial y a su vez generan nuevos intereses. A diferencia del interés simple, que solo aplica sobre el capital original, el compuesto crece de forma exponencial con el tiempo. Por ejemplo, 10.000 € al 5% anual durante 30 años se convierten en más de 43.000 € con interés compuesto, frente a los 25.000 € del interés simple.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué parte de la cuota hipotecaria va a intereses y cuál amortiza capital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al principio de una hipoteca la mayor parte de la cuota mensual son intereses: en los primeros años puede superar el 70-80% de la cuota. Esto se debe al sistema francés de amortización, el más común en España, donde la cuota es constante pero la proporción intereses/capital se invierte gradualmente. Al final del préstamo casi toda la cuota amortiza capital y los intereses son mínimos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la inflación y cómo afecta al poder adquisitivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inflación es el aumento sostenido del nivel general de precios. Si la inflación anual es del 3%, los mismos 1.000 € de hoy solo comprarán el equivalente a 744 € dentro de 10 años. Por eso tener dinero parado en una cuenta sin rentabilidad supone perder poder adquisitivo cada año. Para preservar el valor real del dinero, la rentabilidad obtenida debe superar la tasa de inflación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene amortizar hipoteca anticipadamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Amortizar hipoteca reduce la deuda pendiente y los intereses futuros, pero hay que compararlo con la alternativa de invertir ese dinero. Si el tipo de interés de tu hipoteca es inferior a la rentabilidad esperada de una inversión diversificada (históricamente entre el 5% y el 8% anual en renta variable a largo plazo), matemáticamente suele ser mejor invertir. Si el tipo es alto o tienes aversión al riesgo, amortizar puede ser la opción más adecuada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil entender estos conceptos financieros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cualquier persona que tenga o vaya a contratar una hipoteca, esté valorando invertir sus ahorros o quiera comprender cómo la inflación afecta a su patrimonio se beneficia de estos conceptos. No se necesitan conocimientos previos de economía: los visualizadores interactivos muestran el efecto del tiempo sobre el dinero con gráficos animados y ejemplos con cifras reales que facilitan la comprensión intuitiva.',
      },
    },
  ],
};
