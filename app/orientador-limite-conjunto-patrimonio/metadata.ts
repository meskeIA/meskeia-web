import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Límite Conjunto IRPF-Patrimonio (Art. 31) | meskeIA',
  description: '¿Puedes reducir tu cuota del Impuesto sobre el Patrimonio gracias al límite conjunto del Art. 31? Orientador rápido que detecta si quedas excluido o si conviene consultar a tu asesor fiscal. España 2025.',
  keywords: 'limite conjunto IRPF Patrimonio, art 31 ley 19/1991, reduccion cuota Patrimonio, declaracion conjunta Patrimonio, 60 por ciento base imponible IRPF, bonificacion CCAA Patrimonio, ITSGF grandes fortunas, modelo 714, asesor fiscal Patrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-limite-conjunto-patrimonio/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador Límite Conjunto IRPF-Patrimonio | meskeIA',
    description: 'Comprueba en 1 minuto si puedes beneficiarte de la reducción del Art. 31 Ley 19/1991 sobre la cuota del Impuesto de Patrimonio.',
    url: 'https://meskeia.com/orientador-limite-conjunto-patrimonio',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reducción Límite Conjunto IRPF-Patrimonio | meskeIA',
    description: 'Orientador para saber si puedes pagar menos Patrimonio por el Art. 31',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador del Límite Conjunto IRPF-Patrimonio',
  description: 'Orientador fiscal que indica si un contribuyente puede beneficiarse de la reducción del límite conjunto IRPF-Patrimonio (Art. 31 de la Ley 19/1991), una posibilidad poco conocida que puede reducir la cuota del Impuesto sobre el Patrimonio. No es una calculadora exacta: determina si te conviene acudir a un asesor fiscal o si quedas descartado.',
  url: 'https://meskeia.com/orientador-limite-conjunto-patrimonio/',
  category: 'FinanceApplication',
  features: [
    'Detecta automáticamente bonificaciones autonómicas en el Impuesto sobre el Patrimonio',
    'Comprueba si la suma IRPF + Patrimonio supera el 60% de tu base imponible',
    'Estima orientativamente la reducción aplicable según el Art. 31',
    'Avisa del posible ITSGF (Impuesto de Solidaridad de las Grandes Fortunas) en patrimonios superiores a 3M€',
    'Distingue tres resultados claros: descarte por CCAA, descarte por límite, posible beneficio',
    'Datos basados en Ley 19/1991 actualizados a 2025',
    'Solo orientativo — siempre deriva al asesor fiscal',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
  keywords: ['Patrimonio España', 'límite conjunto IRPF', 'Art. 31 Ley 19/1991', 'reducción cuota Patrimonio', 'fiscal España'],
});
