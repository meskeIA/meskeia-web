import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Visual IRPF Tramos 2025 - "¿Qué pasa si subo X €?" | meskeIA',
  description: 'Visualiza los 6 tramos del IRPF español de forma interactiva. Mueve el slider y observa cómo cambia tu cuota. Vista por tramos, escalera de tipos y comparativa "qué pasa si subo X €". Datos 2025.',
  keywords: 'simulador IRPF tramos visual, tramos IRPF 2025, escalera IRPF, tipo marginal medio, base liquidable, cuota íntegra, AEAT, qué pasa si subo sueldo IRPF, gráfico IRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-irpf-tramos/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Visual IRPF Tramos 2025 | meskeIA',
    description: 'Visualiza los tramos del IRPF y cómo afectan a tu cuota — interactivo y didáctico',
    url: 'https://meskeia.com/simulador-irpf-tramos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Visual IRPF Tramos | meskeIA',
    description: 'Cómo funcionan los tramos del IRPF español — visual e interactivo',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Visual de Tramos IRPF 2025',
  description: 'Simulador visual e interactivo de los 6 tramos del IRPF español 2025. Visualiza cómo se aplica cada tramo, el tipo marginal vs medio, y qué pasa con tu cuota si tu base liquidable cambia.',
  url: 'https://meskeia.com/simulador-irpf-tramos/',
  category: 'FinanceApplication',
  features: [
    'Vista interactiva de los 6 tramos del IRPF 2025',
    'Slider "qué pasa si subo X €"',
    '3 modos: por tramos, escalera de tipos, comparativa',
    'Cálculo de tipo marginal y tipo medio efectivo',
    'Datos basados en Ley 35/2006 y LPGE 2025',
    'Solo orientativo — verifica con la AEAT',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['IRPF', 'tramos IRPF', 'tipo marginal', 'AEAT', 'fiscal España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funcionan los tramos del IRPF en España en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IRPF español es un impuesto progresivo dividido en 6 tramos para 2025: 19% hasta 12.450 €, 24% de 12.450 € a 20.200 €, 30% de 20.200 € a 35.200 €, 37% de 35.200 € a 60.000 €, 45% de 60.000 € a 300.000 €, y 47% por encima de 300.000 €. Cada tipo solo se aplica a la parte de renta que cae dentro de ese tramo, no a la totalidad del salario. Estos son los tipos del tramo estatal; las comunidades autónomas aplican sus propios tipos adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el tipo marginal y el tipo medio del IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo marginal es el porcentaje que se aplica al último euro ganado, es decir, el tipo del tramo más alto en que se encuentra tu renta. El tipo medio es el porcentaje efectivo que pagas sobre la totalidad de tu base liquidable: cuota total dividida entre base. Siempre es menor que el marginal porque los tramos inferiores tributan a tipos más bajos. Por ejemplo, con 40.000 € de base, el tipo marginal es el 37% pero el tipo medio puede rondar el 20%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa con mi cuota si subo de tramo IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al cruzar un tramo, el tipo más alto solo se aplica a la parte de renta que supera el límite del tramo anterior, no a toda tu renta. Por tanto, ganar más siempre deja más neto en tu bolsillo, aunque el incremento tributa al tipo superior. Este es un malentendido muy frecuente: "subir de tramo" no implica pagar más en total, sino que el exceso sobre el umbral queda sujeto al tipo siguiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Estos datos del simulador son válidos para todas las comunidades autónomas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este simulador muestra exclusivamente los tramos estatales del IRPF, que son iguales para toda España. Sin embargo, la cuota total del IRPF incluye también la parte autonómica, cuyos tipos varían según la comunidad autónoma de residencia. Para conocer tu cuota completa con los tipos de tu comunidad, debes consultar la tabla IRPF completa (estatal + autonómica) de tu comunidad o usar el simulador de la AEAT.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la base liquidable y sobre qué se calculan los tramos del IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base liquidable es la cantidad sobre la que se aplican los tramos del IRPF. Se obtiene restando al rendimiento neto del trabajo o renta los mínimos personales, familiares y otras deducciones previstas en la ley (mínimo del contribuyente 5.550 €, más reducciones por hijos, mayores, discapacidad, aportaciones a planes de pensiones, etc.). No es lo mismo que el salario bruto: la base liquidable suele ser significativamente inferior.',
      },
    },
  ],
};
