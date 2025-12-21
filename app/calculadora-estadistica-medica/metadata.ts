import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Estadística Médica - Sensibilidad, Especificidad, VPP, VPN | meskeIA',
  description: 'Calcula sensibilidad, especificidad, valores predictivos (VPP/VPN), razones de verosimilitud, odds ratio, riesgo relativo y NNT. Herramienta gratuita para estudiantes de medicina y epidemiología.',
  keywords: 'estadística médica, sensibilidad, especificidad, valor predictivo positivo, VPP, valor predictivo negativo, VPN, odds ratio, riesgo relativo, NNT, razón verosimilitud, epidemiología, pruebas diagnósticas, tabla 2x2, medicina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Estadística Médica | meskeIA',
    description: 'Sensibilidad, especificidad, VPP, VPN, odds ratio, riesgo relativo y NNT. Para estudiantes de medicina y epidemiología.',
    url: 'https://meskeia.com/calculadora-estadistica-medica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Estadística Médica | meskeIA',
    description: 'Calcula métricas de pruebas diagnósticas y estudios epidemiológicos.',
  },
};
