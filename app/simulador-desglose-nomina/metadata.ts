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
