import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Sueldo Neto a Bruto y Bruto a Neto 2025 | meskeIA',
  description: 'Calcula tu sueldo neto desde el bruto o al revés. Estimación de IRPF, cotizaciones a la Seguridad Social y deducciones aplicables en España 2025. Orientativo.',
  keywords: 'estimador sueldo neto, sueldo bruto a neto, calcular neto, calcular bruto, IRPF, seguridad social, nómina, salario neto, salario bruto, España 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Sueldo Neto ↔ Bruto 2025 | meskeIA',
    description: 'Oriéntate sobre tu sueldo bruto a neto o neto a bruto. Incluye IRPF y Seguridad Social actualizados.',
    url: 'https://meskeia.com/estimador-sueldo-neto/',
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
    title: 'Estimador Sueldo Neto ↔ Bruto 2025',
    description: 'Oriéntate sobre tu sueldo bruto a neto o neto a bruto. IRPF y SS actualizados.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Sueldo Neto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Sueldo Neto",
  description: "Calcula tu sueldo neto desde el bruto o al revés. Estimación de IRPF, cotizaciones a la Seguridad Social y deducciones aplicables en España 2025. Orientativo.",
  url: "https://meskeia.com/estimador-sueldo-neto/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el sueldo neto a partir del bruto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para pasar del salario bruto al neto hay que restar dos retenciones principales: la cotización a la Seguridad Social del trabajador (aproximadamente el 6,35 % del salario bruto: 4,70 % contingencias comunes + 1,55 % desempleo + 0,10 % formación) y la retención de IRPF, cuyo porcentaje varía según el salario anual y la situación personal (entre el 0 % para sueldos bajos y el 47 % para los tramos más altos). El resultado es el salario neto mensual que recibes en cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto IRPF se retiene de una nómina en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La retención de IRPF en nómina depende del salario bruto anual y de la situación personal del trabajador (hijos, discapacidad, estado civil). Como referencia orientativa: con 20.000 € brutos/año la retención es de aproximadamente el 5-8 %; con 30.000 €, el 12-15 %; con 50.000 €, el 20-22 %; y con 80.000 €, alrededor del 28-32 %. Son estimaciones: el porcentaje exacto lo calcula la empresa mediante el modelo oficial de la AEAT.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre salario bruto y salario neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El salario bruto es el importe pactado en el contrato antes de cualquier deducción. El salario neto es lo que el trabajador recibe realmente en su cuenta bancaria, tras descontar la cotización a la Seguridad Social a cargo del trabajador y la retención a cuenta del IRPF. La diferencia entre ambos puede suponer entre el 15 % y el 35 % del bruto, dependiendo del nivel salarial y las circunstancias personales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo calcular el bruto si sé cuánto quiero cobrar neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el cálculo inverso (neto a bruto) es útil al negociar un salario. Si sabes el neto deseado, el estimador aplica el proceso a la inversa: divide el neto objetivo entre (1 − tipo efectivo de SS − tipo efectivo de IRPF). Ten en cuenta que el resultado es orientativo, porque el tipo de IRPF depende del bruto final, lo que crea una dependencia circular que los estimadores resuelven por iteración o aproximación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El coste para la empresa es el mismo que el salario bruto del trabajador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El coste total para la empresa (coste empresa o coste laboral) es mayor que el bruto del trabajador porque la empresa paga adicionalmente las cotizaciones empresariales a la Seguridad Social, que en 2025 suponen aproximadamente el 30-32 % adicional sobre el salario bruto (23,60 % contingencias comunes + cuotas de desempleo, FOGASA y formación). Así, un trabajador con 30.000 € brutos le cuesta a la empresa alrededor de 39.000-40.000 € anuales.',
      },
    },
  ],
};
