import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de tubérculos y raíces de Latinoamérica | meskeIA',
  description:
    'Yuca, boniato, malanga, ñame, papas andinas, oca, olluco, jícama y plátano macho: qué son, de dónde vienen y cómo cocinar los tubérculos y raíces de América. Gratis y en español.',
  keywords:
    'tuberculos latinoamerica, yuca mandioca, malanga yautia, ñame, papas andinas, jicama, platano macho, raices comestibles america, como cocinar yuca',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Tubérculos y raíces de Latinoamérica', description: 'Qué son y cómo cocinar la yuca, el boniato, la malanga, las papas andinas y más.', url: 'https://meskeia.com/guia-tuberculos-latam', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Tubérculos de Latinoamérica', description: 'Yuca, boniato, malanga, papas andinas y más.' },
  other: { 'application-name': 'Tubérculos LATAM meskeIA' },
  alternates: { canonical: 'https://meskeia.com/guia-tuberculos-latam/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de tubérculos y raíces de Latinoamérica',
  description:
    'Guía de los tubérculos y raíces comestibles de Latinoamérica —yuca o mandioca, boniato, malanga, ñame, papas andinas, oca, olluco, jícama y plátano macho— con su origen, su carácter y cómo se cocinan, incluyendo avisos de seguridad como el de la yuca, que debe consumirse siempre cocida.',
  url: 'https://meskeia.com/guia-tuberculos-latam/',
  category: 'EducationalApplication',
  features: [
    'Tubérculos y raíces de América con su uso',
    'Origen y carácter de cada uno',
    'Cómo cocinarlos',
    'Avisos de seguridad (yuca)',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Se puede comer la yuca cruda?', acceptedAnswer: { '@type': 'Answer', text: 'No. La yuca (mandioca) contiene compuestos cianogénicos que liberan cianuro, por lo que debe consumirse siempre bien cocida, nunca cruda. Al hervirla o freírla, esos compuestos se eliminan y queda segura. También conviene retirar la fibra central dura antes de cocinarla.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre el boniato y el ñame?', acceptedAnswer: { '@type': 'Answer', text: 'Aunque a veces se confunden, son plantas distintas. El boniato (batata o camote) es de carne dulce y suele tener piel y pulpa anaranjadas o blancas; el ñame es más grande, de piel rugosa y carne firme y almidonosa, menos dulce. Se cocinan de forma parecida, hervidos o en puré, pero el sabor cambia bastante.' } },
    { '@type': 'Question', name: '¿Cómo se cocina la yuca?', acceptedAnswer: { '@type': 'Answer', text: 'Lo más común es pelarla, retirar la fibra central y hervirla en agua con sal hasta que esté tierna, momento en el que se puede comer así, en puré o freír para que quede dorada por fuera. También se usa para hacer casabe (un pan plano) y, en forma de almidón, tapioca.' } },
    { '@type': 'Question', name: '¿La jícama se come cruda?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, la jícama se suele comer cruda: es crujiente, jugosa y ligeramente dulce, ideal en ensaladas o cortada en bastones con chile y limón, muy típica en México. Solo se come el bulbo pelado; el resto de la planta no es comestible. Aporta frescura y textura sin apenas calorías.' } },
    { '@type': 'Question', name: '¿Por qué hay tantas variedades de papa en los Andes?', acceptedAnswer: { '@type': 'Answer', text: 'Porque los Andes son la cuna de la patata, domesticada allí hace miles de años. Se cultivan miles de variedades nativas de distintos colores, formas y texturas, adaptadas a las distintas altitudes y climas. Esa diversidad es un tesoro agrícola y la base de platos como la causa o la papa a la huancaína.' } },
  ],
};
