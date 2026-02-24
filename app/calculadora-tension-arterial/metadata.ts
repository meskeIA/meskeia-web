import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Tensión Arterial - Clasifica tu Presión según ESH/ESC | meskeIA',
  description: 'Introduce tu tensión arterial sistólica y diastólica y obtén tu clasificación según las guías europeas ESH/ESC 2018. Calcula TAM, presión de pulso y guarda tu historial.',
  keywords: 'calculadora tension arterial, presion arterial, hipertension, clasificacion tension, sistolica, diastolica, TAM, ESH, ESC, hipertension grado 1, hipotension, tension alta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Tensión Arterial | meskeIA',
    description: 'Clasifica tu presión arterial según las guías ESH/ESC 2018 y guarda tu historial de mediciones.',
    url: 'https://meskeia.com/calculadora-tension-arterial',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Tensión Arterial | meskeIA',
    description: 'Clasifica tu presión arterial según guías europeas ESH/ESC. Historial de mediciones incluido.',
  },
  other: {
    'application-name': 'Calculadora Tensión Arterial meskeIA',
  },
};
