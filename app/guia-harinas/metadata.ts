import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de harinas: fuerza (W), proteína y usos | meskeIA',
  description:
    'Qué harina usar para cada cosa: floja, panificable, de fuerza, gran fuerza, integral, sémola, espelta, centeno, maíz, arroz, garbanzo y almendra, con su fuerza (W), proteína y usos. Gratis y en español.',
  keywords:
    'guia de harinas, fuerza de la harina, harina de fuerza w, que harina para pan, harina floja reposteria, proteina harina, harina manitoba, tipos de harina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Guía de harinas (fuerza W y usos)', description: 'Qué harina usar para cada cosa, con su fuerza, proteína y usos.', url: 'https://meskeia.com/guia-harinas', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Guía de harinas', description: 'Fuerza (W), proteína y usos de cada harina.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Guía de harinas meskeIA' },
  alternates: { canonical: 'https://meskeia.com/guia-harinas/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de harinas',
  description:
    'Guía de los tipos de harina para cocina y panadería, con su fuerza (valor W), su contenido de proteína y sus usos recomendados: desde la harina floja de repostería hasta la gran fuerza, pasando por integrales, sémola y harinas sin gluten.',
  url: 'https://meskeia.com/guia-harinas/',
  category: 'EducationalApplication',
  features: [
    'Harinas con su fuerza (W) y proteína',
    'Usos recomendados de cada una',
    'De repostería a gran fuerza',
    'Harinas con y sin gluten',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es la fuerza de una harina (valor W)?', acceptedAnswer: { '@type': 'Answer', text: 'La fuerza, medida con el valor W, indica la capacidad de la harina para formar gluten y retener gas durante la fermentación. Una harina floja (W menor de 160) da migas tiernas para repostería; una de fuerza (W 250-350) aguanta masas enriquecidas como el brioche; y la gran fuerza (W mayor de 350) se usa para fermentaciones muy largas como el panettone.' } },
    { '@type': 'Question', name: '¿Qué harina uso para hacer pan?', acceptedAnswer: { '@type': 'Answer', text: 'Para pan común va bien una harina panificable o de media fuerza (W 160-250, en torno al 11% de proteína). Para panes de fermentación más larga o masas enriquecidas conviene subir a una harina de fuerza. La harina de repostería, demasiado floja, daría un pan que no aguanta y queda apelmazado.' } },
    { '@type': 'Question', name: '¿En qué se diferencia la proteína de la harina?', acceptedAnswer: { '@type': 'Answer', text: 'El porcentaje de proteína que aparece en el paquete es un buen indicador de la fuerza: más proteína, más gluten potencial y más fuerza. Las de repostería rondan el 8-9%, las panificables el 10-11% y las de fuerza el 12-14%. Por eso, sin tener el valor W, puedes guiarte por la proteína del etiquetado.' } },
    { '@type': 'Question', name: '¿La harina integral es más fuerte?', acceptedAnswer: { '@type': 'Answer', text: 'No necesariamente: aunque suele tener bastante proteína, el salvado de la harina integral "corta" las hebras de gluten, por lo que los panes integrales tienden a ser más densos y suben menos. A menudo se mezcla con harina blanca de fuerza para conseguir mejor volumen sin renunciar al sabor y la fibra.' } },
    { '@type': 'Question', name: '¿Qué harinas no tienen gluten?', acceptedAnswer: { '@type': 'Answer', text: 'No tienen gluten las harinas de maíz, arroz, garbanzo, almendra, trigo sarraceno (alforfón) o teff, entre otras. Al carecer de gluten no dan estructura por sí solas en panadería, por lo que suelen combinarse con almidones y gomas (como la xantana). Sí funcionan bien en rebozados, repostería específica y panes adaptados.' } },
  ],
};
