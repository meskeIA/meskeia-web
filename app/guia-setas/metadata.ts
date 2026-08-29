import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Setas - Identificación, comestibilidad y temporadas | meskeIA',
  description: '40 setas: comestibilidad, hábitat, temporada, identificación, especies confusas y avisos de seguridad. España y Europa. Advertencia: nunca consumir sin confirmación de experto.',
  keywords: 'guía setas, identificación setas, setas comestibles, setas tóxicas, boletus edulis, rebozuelo, níscalo, amanita phalloides, recolección setas, micología, hongos silvestres, setas España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Setas - Identificación, comestibilidad y temporadas',
    description: '40 setas con ficha completa: comestibilidad, hábitat, temporada, láminas, olor, especies confusas y aviso de seguridad. Gratis y sin registro.',
    url: 'https://meskeia.com/guia-setas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Setas - Identificación y comestibilidad',
    description: '40 setas con ficha completa: comestibilidad, hábitat, temporada, especies confusas y avisos de seguridad. Micología para todos.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  other: { 'application-name': 'Guía de Setas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Setas',
  description: 'Guía de identificación de 40 setas silvestres: comestibilidad, hábitat, temporada, descripción morfológica (sombrero, láminas, pie, olor), especies confusas, avisos de seguridad y curiosidades. Orientada al recolector responsable en España y Europa.',
  url: 'https://meskeia.com/guia-setas/',
  category: 'EducationalApplication',
  features: [
    '40 setas con ficha completa de identificación',
    'Filtro por comestibilidad: comestible, con precaución, tóxica, mortal',
    'Filtro por hábitat: bosque, prados, zonas húmedas, urbano',
    'Descripción morfológica: sombrero, láminas, pie, olor',
    'Especies confusas y avisos de seguridad por seta',
    'Temporadas de recolección y distribución geográfica',
    'Curiosidades y usos culinarios',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo saber si una seta es comestible o tóxica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La única forma segura de determinar si una seta es comestible es la identificación exacta de la especie por un experto o micólogo. Existen características orientativas como el color de las láminas, el olor, la presencia de volva o anillo, pero ninguna regla popular es fiable al 100%. Nunca consumas una seta si tienes la menor duda: algunas especies mortales como la Amanita phalloides se parecen a setas comestibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la época del año para recolectar setas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temporada principal de setas en España y Europa es el otoño (septiembre-noviembre), cuando las lluvias y la temperatura fresca favorecen la fructificación. Sin embargo, muchas especies tienen temporadas distintas: los níscalos aparecen en otoño, los perrechicos en primavera, y algunas trompetas de la muerte en verano-otoño. La temperatura y la humedad del suelo son los factores determinantes más que el mes del calendario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un hongo y una seta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hongos son el reino biológico completo (Fungi), que incluye levaduras, mohos y organismos multicelulares. Las setas son el cuerpo fructífero visible de ciertos hongos, es decir, la parte que emerge del suelo o del sustrato para reproducirse mediante esporas. Popularmente se usa "seta" para las especies silvestres recolectables y "hongo" para el organismo completo, aunque en botánica y micología ambos términos se usan de forma más técnica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las setas más peligrosas de Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Amanita phalloides (oronja verde o cicuta) es responsable de la mayoría de las muertes por intoxicación fúngica en Europa: contiene amatoxinas que destruyen el hígado y no tienen antídoto eficaz. Otras especies muy peligrosas son Amanita virosa, Galerina marginata (mortal y confundible con setas comestibles en madera muerta) y Cortinarius orellanus, que provoca insuficiencia renal con síntomas retardados de 2 a 3 semanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el boletus edulis y dónde se encuentra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Boletus edulis, conocido como porcini, cep o seta de pino, es una de las setas comestibles más valoradas gastronómicamente en el mundo. Crece asociado en simbiosis con raíces de pinos, hayas, robles y abetos, principalmente en bosques de montaña de Europa, Asia y Norteamérica. En España aparece entre verano y otoño en zonas húmedas de montaña. Se distingue por su sombrero marrón, pie grueso con retícula blanca y tubos blancos que amarillean con la madurez.',
      },
    },
  ],
};
