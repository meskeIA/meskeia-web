import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador IRPF Pensionista 2026 - Cuánto pagas de renta | meskeIA',
  description: 'Estima el IRPF que pagas como pensionista: reducción por rendimientos del trabajo, mínimo personal por edad y cuota orientativa. Pensión neta mensual real.',
  keywords: 'irpf pensionista, declaracion renta jubilado, cuanto paga de irpf un pensionista, reduccion rendimientos trabajo pension, minimo personal 65 años, pension neta mensual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador IRPF Pensionista 2026 | meskeIA',
    description: 'Cuánto IRPF pagas como pensionista y cuál es tu pensión neta mensual real.',
    url: 'https://meskeia.com/estimador-irpf-pensionista/',
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
    title: 'Estimador IRPF Pensionista 2026 | meskeIA',
    description: 'Renta del pensionista orientativa: cuota IRPF y pensión neta mensual 2026',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador IRPF Pensionista meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador IRPF Pensionista",
  description: "Estima el IRPF que pagas como pensionista: reducción por rendimientos del trabajo, mínimo personal por edad y cuota orientativa. Pensión neta mensual real.",
  url: "https://meskeia.com/estimador-irpf-pensionista/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto IRPF paga un pensionista en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del importe de la pensión. Las pensiones tributan como rendimientos del trabajo y se les aplica la escala general del IRPF. En 2026 existe una reducción por rendimientos del trabajo para rendimientos netos inferiores a 16.825 € anuales (reducción máxima de 6.498 € para rentas ≤13.115 €), y también se aplica el mínimo personal de 5.550 € (6.700 € a partir de 65 años y 8.100 € a partir de 75 años). Con la pensión mínima de jubilación (~9.000 €/año) la cuota suele ser cero o muy reducida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la reducción por rendimientos del trabajo para pensionistas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una minoración en la base imponible del IRPF que beneficia a trabajadores y pensionistas con ingresos del trabajo relativamente bajos. En 2026, si los rendimientos netos del trabajo no superan 13.115 € anuales la reducción máxima es de 6.498 €; se reduce progresivamente hasta los 16.825 €, donde la reducción mínima es de 2.364 €. Esto puede traducirse en una cuota de IRPF cero o muy baja para pensiones modestas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene que hacer la declaración de la renta un jubilado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No siempre. En 2026, un pensionista con un único pagador (la Seguridad Social) y pensión inferior a 22.000 € brutos anuales no está obligado a declarar, aunque puede hacerlo voluntariamente si espera devolución. Si percibe pensión de más de un pagador (por ejemplo, también de una mutualidad), el límite baja a 15.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la pensión neta mensual de un jubilado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión neta mensual se obtiene restando a la pensión bruta las retenciones de IRPF que aplica la Seguridad Social. Esas retenciones dependen de la pensión anual y de las circunstancias personales (edad, discapacidad, etc.). A diferencia de los trabajadores, los pensionistas no pagan cotizaciones a la Seguridad Social, salvo la aportación de asistencia sanitaria del 1,59 % en algunos casos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El mínimo personal por edad reduce el IRPF del pensionista?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El mínimo personal exento es de 5.550 € anuales con carácter general, pero sube a 6.700 € para mayores de 65 años y a 8.100 € para mayores de 75 años. Este importe se aplica al tipo más bajo de la escala, lo que equivale en la práctica a un descuento en la cuota íntegra de hasta 1.215 € para mayores de 75 años.',
      },
    },
  ],
};
