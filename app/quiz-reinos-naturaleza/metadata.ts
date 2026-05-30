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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos reinos de la naturaleza existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sistemas de clasificación modernos reconocen entre 5 y 8 reinos según el criterio utilizado. El más extendido en la enseñanza secundaria distingue cinco: Animalia, Plantae, Fungi, Protista y Monera (bacterias). Clasificaciones más recientes dividen Monera en Bacteria y Archaea, llegando a seis dominios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es el coral un animal o una planta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coral es un animal del filo Cnidaria, el mismo grupo que las medusas y las anémonas. Aunque parece inmóvil y tiene aspecto vegetal, está formado por pólipos —pequeños animales— que segregan un esqueleto calcáreo. Su apariencia de planta se debe a las algas simbióticas (zooxantelas) que viven en sus tejidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los virus son seres vivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los virus no se consideran seres vivos según la definición clásica porque no tienen metabolismo propio ni pueden reproducirse de forma autónoma: necesitan infectar una célula huésped. No pertenecen a ninguno de los reinos biológicos. Son entidades en el límite entre la química y la biología.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un hongo y una planta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hongos pertenecen al reino Fungi y los distingue de las plantas que no realizan fotosíntesis: obtienen energía descomponiendo materia orgánica o como parásitos. Además, su pared celular está hecha de quitina (como el exoesqueleto de los insectos), no de celulosa como en las plantas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es adecuado este quiz de biología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz está diseñado para estudiantes de secundaria (12-16 años) y bachillerato (16-18 años), pero resulta desafiante también para adultos. Incluye tres niveles de dificultad y cubre organismos que suelen generar confusión, como el liquen (simbiosis hongo-alga), la esponja (animal) o la levadura (hongo). Es útil para repasar clasificación biológica de forma autónoma.',
      },
    },
  ],
};
