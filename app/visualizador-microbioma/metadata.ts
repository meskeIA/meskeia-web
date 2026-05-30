import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Microbioma — Billones de Aliados en tu Interior | meskeIA',
  description: 'Descubre el ecosistema bacteriano del cuerpo humano: intestino, piel, boca y pulmones. Eje intestino-cerebro, serotonina, factores que alteran la microbiota.',
  keywords: 'microbioma, microbiota intestinal, bacterias intestinales, eje intestino-cerebro, serotonina, probióticos, Firmicutes, Bacteroidetes, diversidad microbiana',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Microbioma — Billones de Aliados en tu Interior | meskeIA',
    description: 'Descubre el ecosistema bacteriano del cuerpo humano: intestino, piel, boca y pulmones. Eje intestino-cerebro, serotonina, factores que alteran la microbiota.',
    url: 'https://meskeia.com/visualizador-microbioma/',
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
    title: 'El Microbioma — Billones de Aliados en tu Interior',
    description: 'Descubre el ecosistema bacteriano del cuerpo humano: intestino, piel, boca y pulmones. Eje intestino-cerebro y factores que alteran la microbiota.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/visualizador-microbioma/',
  },
  other: {
    'application-name': 'Visualizador Microbioma meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Microbioma — Billones de Aliados en tu Interior',
  description: 'Visualizador interactivo del microbioma humano: explora el ecosistema bacteriano del intestino, piel, boca y pulmones, el eje intestino-cerebro y los factores que modifican la microbiota.',
  url: 'https://meskeia.com/visualizador-microbioma/',
  features: [
    'Explorador de 4 zonas del cuerpo con datos sobre microorganismos',
    'Visualización del eje intestino-cerebro bidireccional',
    'Selector interactivo de 5 factores que alteran el microbioma',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el microbioma humano y cuántas bacterias lo forman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El microbioma humano es el conjunto de microorganismos (bacterias, hongos, virus y arqueas) que viven en y sobre el cuerpo. Se estima que el intestino alberga entre 38 y 100 billones de bacterias de más de 1.000 especies distintas. Su peso total en el intestino adulto ronda los 200 gramos, comparable al de algunos órganos sólidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el eje intestino-cerebro y cómo influye en el estado de ánimo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El eje intestino-cerebro es una comunicación bidireccional entre el sistema nervioso central y el entérico, mediada por el nervio vago, hormonas y metabolitos bacterianos. Aproximadamente el 90 % de la serotonina del organismo se produce en el intestino, y la microbiota influye en su síntesis. Alteraciones en la composición bacteriana se han asociado a mayor prevalencia de ansiedad y depresión en estudios observacionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores alteran negativamente el microbioma intestinal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales factores que reducen la diversidad microbiana son: el uso de antibióticos de amplio espectro, una dieta baja en fibra y alta en ultraprocesados, el estrés crónico, la falta de sueño y el parto por cesárea (que priva al recién nacido de la exposición a bacterias vaginales de la madre). La recuperación tras un ciclo de antibióticos puede tardar entre semanas y varios meses según la persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre probióticos y prebióticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los probióticos son microorganismos vivos que, al ingerirse en cantidades adecuadas, aportan un beneficio al huésped; se encuentran en yogur, kéfir, kimchi y suplementos. Los prebióticos son fibras no digestibles que sirven de alimento a las bacterias beneficiosas ya presentes en el intestino; están en ajo, cebolla, plátano, legumbres y avena. Usar ambos de forma combinada se denomina estrategia simbiótica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El microbioma de la piel y el de los pulmones funcionan igual que el intestinal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No exactamente. El intestino tiene la mayor densidad y diversidad bacteriana del cuerpo. La piel alberga comunidades distintas según la zona (grasa, húmeda o seca) y actúa como barrera frente a patógenos; el Staphylococcus epidermidis es su residente más frecuente. El microbioma pulmonar es mucho más escaso y su papel está siendo investigado en relación con el asma y la EPOC. Cada nicho tiene composición y funciones propias.',
      },
    },
  ],
};
