import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Impuestos en el Divorcio - Orientación Fiscal Personalizada | meskeIA',
  description: 'Calcula el impacto fiscal de tu divorcio en España: pensión compensatoria IRPF, mínimo por hijos, imputación de rentas por vivienda y deducción hipotecaria transitoria.',
  keywords: 'impuestos divorcio España, tributación pensión compensatoria IRPF, mínimo descendientes custodia, imputación rentas vivienda divorcio, deducción hipoteca divorcio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Impuestos en el Divorcio — Orientación Fiscal | meskeIA',
    description: 'Orientador fiscal personalizado para tu divorcio en España. Pensión compensatoria, hijos, vivienda e hipoteca.',
    url: 'https://meskeia.com/impuestos-divorcio',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Impuestos en el Divorcio — meskeIA',
    description: 'Conoce el impacto fiscal de tu divorcio: pensión compensatoria, hijos, vivienda e hipoteca.',
  },
  other: {
    'application-name': 'Impuestos en el Divorcio meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Impuestos en el Divorcio',
  description: 'Orientador fiscal personalizado para procesos de divorcio en España. Calcula el impacto en el IRPF de la pensión compensatoria, el mínimo por descendientes según custodia, la imputación de rentas por la vivienda y la deducción hipotecaria transitoria.',
  url: 'https://meskeia.com/impuestos-divorcio/',
  category: 'FinanceApplication',
  features: [
    'Wizard paso a paso adaptado a tu situación',
    'Cálculo del ahorro o coste fiscal de la pensión compensatoria en IRPF',
    'Estimación del mínimo por descendientes según régimen de custodia',
    'Imputación de rentas por vivienda habitual (2% o 1,1% valor catastral)',
    'Impacto de la deducción hipotecaria transitoria pre-2013',
    'Orientación sobre liquidación de gananciales y declaración individual',
    'Sección explícita sobre qué NO cubre la herramienta',
    'Datos normativos IRPF 2025 actualizados',
  ],
});
