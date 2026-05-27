import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Países y Capitales del Mundo - Adivina la Capital | meskeIA',
  description: 'Pon a prueba tus conocimientos de geografía: adivina las capitales del mundo, identifica países por su bandera y mucho más. 195 países, 3 modos de juego, 5 dificultades.',
  keywords: 'quiz paises capitales, adivinar capital, quiz geografia, capitales mundo, banderas paises, quiz banderas, juego geografia, aprender capitales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Países y Capitales del Mundo | meskeIA',
    description: 'Adivina capitales, identifica banderas y demuestra tus conocimientos de geografía. 195 países, sin registro.',
    url: 'https://meskeia.com/quiz-paises-capitales/',
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
    title: 'Quiz Países y Capitales del Mundo | meskeIA',
    description: 'Pon a prueba tu geografía: capitales, banderas y más. 195 países, sin publicidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Países y Capitales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Países y Capitales",
  description: "Pon a prueba tus conocimientos de geografía: adivina las capitales del mundo, identifica países por su bandera y mucho más. 195 países, 3 modos de juego, 5 dificultades.",
  url: "https://meskeia.com/quiz-paises-capitales/",
  category: 'EducationalApplication',
  features: [],
});
