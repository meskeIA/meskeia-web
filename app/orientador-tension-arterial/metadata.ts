import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Tensión Arterial - Clasifica tu Presión según ESH/ESC | meskeIA',
  description: 'Introduce tu tensión arterial sistólica y diastólica y obtén tu clasificación según las guías europeas ESH/ESC 2018. Calcula TAM, presión de pulso y guarda tu historial.',
  keywords: 'calculadora tension arterial, presion arterial, hipertension, clasificacion tension, sistolica, diastolica, TAM, ESH, ESC, hipertension grado 1, hipotension, tension alta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Tensión Arterial | meskeIA',
    description: 'Clasifica tu presión arterial según las guías ESH/ESC 2018 y guarda tu historial de mediciones.',
    url: 'https://meskeia.com/orientador-tension-arterial/',
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
    title: 'Orientador Tensión Arterial | meskeIA',
    description: 'Clasifica tu presión arterial según guías europeas ESH/ESC. Historial de mediciones incluido.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Tensión Arterial meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Tensión Arterial",
  description: "Introduce tu tensión arterial sistólica y diastólica y obtén tu clasificación según las guías europeas ESH/ESC 2018. Calcula TAM, presión de pulso y guarda tu historial.",
  url: "https://meskeia.com/orientador-tension-arterial/",
  category: 'FinanceApplication',
  features: [],
});
