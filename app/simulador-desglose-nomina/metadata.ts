import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Desglose de Nómina - Bruto a Neto Paso a Paso 2025 | meskeIA',
  description:
    'Visualiza tu nómina paso a paso: bruto anual → cotizaciones Seguridad Social → IRPF → neto. Animación didáctica con cada deducción explicada. Datos 2025.',
  keywords:
    'desglose nómina, bruto neto España, calculadora nómina, cotizaciones seguridad social, IRPF retención, salario neto mensual, paga prorrateada, pagas extra',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-desglose-nomina/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Desglose de Nómina | meskeIA',
    description: 'Bruto a neto paso a paso animado: SS y IRPF',
    url: 'https://meskeia.com/simulador-desglose-nomina/',
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
    title: 'Simulador Desglose de Nómina | meskeIA',
    description: 'Aprende qué te descuentan en la nómina',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Desglose de Nómina (Bruto a Neto)',
  description:
    'Simulador visual del desglose de una nómina española paso a paso. Desde el salario bruto anual a través de cotizaciones a la Seguridad Social, gastos deducibles, reducciones y cuota IRPF, hasta el salario neto mensual.',
  url: 'https://meskeia.com/simulador-desglose-nomina/',
  category: 'FinanceApplication',
  features: [
    'Desglose paso a paso con animación',
    'Cotizaciones SS detalladas (CC, desempleo, FP, MEI)',
    'Cálculo IRPF por tramos con mínimos personales',
    'Modo simple (agrupado) y detallado',
    '4 ejemplos preconfigurados (mileurista, mediano, alto, directivo)',
    'Soporte 12, 14 o 15 pagas',
    'Datos basados en LPGE 2025 y Orden PJC/51/2025',
    'Solo orientativo — no sustituye al asesor fiscal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['nómina', 'bruto neto', 'IRPF', 'cotizaciones', 'fiscal España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se descuenta por Seguridad Social en la nómina en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026, el trabajador cotiza: 4,7% por contingencias comunes, 1,55% por desempleo, 0,1% por formación profesional y 0,15% por el MEI (Mecanismo de Equidad Intergeneracional). El total aproximado es el 6,50% del salario bruto, aunque varía según el tipo de contrato. El empleador paga además alrededor del 30% adicional que no aparece en la nómina del trabajador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la retención del IRPF en la nómina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La empresa calcula una retención estimada para que al final del año el trabajador no tenga que pagar una cantidad grande en la declaración. Se basa en el salario bruto anual proyectado, el número de pagadores, la situación familiar y las deducciones aplicables. El porcentaje resultante se aplica mensualmente. Puedes cambiarlo presentando un modelo 145 a tu empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre salario bruto y salario neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El salario bruto es el coste laboral antes de descuentos. El neto es lo que realmente ingresas en cuenta: bruto menos cotizaciones a la Seguridad Social (aprox. 6,50%) menos retención del IRPF (variable según tu situación, desde 0% hasta más del 35%). Con un salario bruto de 30.000 €, el neto habitual ronda los 23.000-24.500 € anuales, entre 1.900 y 2.000 € mensuales con 12 pagas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el MEI en la nómina y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El MEI (Mecanismo de Equidad Intergeneracional) es una cotización solidaria creada en 2023 para reforzar la sostenibilidad del sistema de pensiones. En 2025 el trabajador paga el 0,12% y la empresa el 0,58% del salario. Estos fondos se destinan al Fondo de Reserva de la Seguridad Social, no a la pensión individual del cotizante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las pagas extras y cómo afectan al salario mensual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las empresas están obligadas a pagar al menos dos pagas extraordinarias al año (normalmente en junio y diciembre), salvo que el convenio colectivo las prorratee en los 12 meses. Si se prorratean, el salario mensual incluye la parte proporcional. Si no se prorratean, el salario mensual ordinario es menor pero hay dos meses con ingresos adicionales. El IRPF se retiene igual en ambos casos.',
      },
    },
  ],
};
