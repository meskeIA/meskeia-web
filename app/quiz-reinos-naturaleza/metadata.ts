import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Reinos de la Naturaleza - ¿Animal, Planta, Hongo o Bacteria? | meskeIA',
  description: 'Descubre a qué grupo pertenecen 43 organismos sorprendentes: murciélago (mamífero), coral (animal), liquen (simbiosis), virus (¿ser vivo?). Quiz de biología con curiosidades. Sin registro.',
  keywords: 'reinos de la naturaleza, quiz biologia, clasificacion seres vivos, animales sorprendentes, hongos plantas algas, virus bacteria diferencia, biologia ESO bachillerato, clasificacion biologica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Reinos de la Naturaleza | meskeIA',
    description: '¿Sabes que el coral es un animal y el liquen no es una planta? 43 organismos sorprendentes con sus curiosidades. ESO, Bachillerato y más.',
    url: 'https://meskeia.com/quiz-reinos-naturaleza/',
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
    title: 'Quiz Reinos de la Naturaleza | meskeIA',
    description: 'Clasifica organismos sorprendentes: desde murciélagos hasta virus. 43 casos, 3 niveles, con curiosidades científicas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Reinos de la Naturaleza meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Reinos de la Naturaleza",
  description: "Descubre a qué grupo pertenecen 43 organismos sorprendentes: murciélago (mamífero), coral (animal), liquen (simbiosis), virus (¿ser vivo?). Quiz de biología con curiosidades. Sin registro.",
  url: "https://meskeia.com/quiz-reinos-naturaleza/",
  category: 'EducationalApplication',
  features: [],
});
