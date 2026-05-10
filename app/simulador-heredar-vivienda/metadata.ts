import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Heredar Vivienda - ISD + Plusvalía + IRPF | meskeIA',
  description:
    'Calcula orientativamente el coste fiscal total de heredar una vivienda y venderla en España: Impuesto de Sucesiones (ISD), plusvalía municipal (IIVTNU) e IRPF al vender. 17 CCAA, parentesco, vivienda habitual.',
  keywords:
    'heredar vivienda España impuestos, ISD herencia vivienda, plusvalía municipal herencia, IRPF venta vivienda heredada, impuesto sucesiones vivienda, IIVTNU coeficientes, ganancia patrimonial herencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-heredar-vivienda/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Heredar Vivienda | meskeIA',
    description: 'Calcula ISD + plusvalía + IRPF al heredar y vender vivienda',
    url: 'https://meskeia.com/simulador-heredar-vivienda/',
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
    title: 'Simulador Heredar Vivienda | meskeIA',
    description: 'Coste fiscal de heredar y vender vivienda',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Coste Fiscal de Heredar y Vender Vivienda',
  description:
    'Calculadora orientativa del coste fiscal completo al heredar una vivienda y venderla en España: Impuesto de Sucesiones (ISD) según CCAA y parentesco, plusvalía municipal (IIVTNU) por método objetivo o real, e IRPF de la ganancia patrimonial al vender.',
  url: 'https://meskeia.com/simulador-heredar-vivienda/',
  category: 'FinanceApplication',
  features: [
    'Cálculo en cadena de los 3 impuestos: ISD + IIVTNU + IRPF',
    'Soporte 17 CCAA con bonificaciones específicas',
    'Reducción por parentesco y vivienda habitual',
    'Plusvalía municipal: método objetivo y real, elige el menor',
    'Ganancia patrimonial al vender, ajustada por impuestos pagados',
    '4 casos preconfigurados con CCAA distintas',
    'Datos basados en Ley 29/1987 ISD y RDL 26/2021 plusvalía',
    'Solo orientativo — consulta con notario y asesor fiscal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['ISD', 'plusvalía municipal', 'IRPF herencia', 'heredar vivienda España'],
});
