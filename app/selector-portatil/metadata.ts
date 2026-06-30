import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Portátil, Laptop o Notebook — ¿Cuál me conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué computadora te conviene: portátil (laptop o notebook) o sobremesa, Windows o Mac, gama de rendimiento y modelos de referencia actualizados para 2025.',
  keywords: [
    'qué portátil comprar',
    'qué laptop comprar',
    'mejor notebook',
    'selector portátil',
    'Windows o Mac',
    'mejor ordenador 2025',
    'mejor computadora 2025',
    'portátil para trabajo',
    'laptop gaming',
    'portátil gaming',
    'Mac o PC',
    'cuál es el mejor portátil para mí',
    'qué computadora portátil comprar',
    'ordenador para diseño',
  ],
  openGraph: {
    title: '¿Qué portátil, laptop o notebook te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre la computadora ideal para tu perfil: portátil (laptop/notebook) o sobremesa, sistema operativo, rendimiento y modelos de referencia. Sin marcas patrocinadas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-portatil/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Windows, Mac o Linux? Test para elegir portátil o laptop | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu portátil (laptop o notebook) o PC ideal según uso, presupuesto y prioridades.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-portatil/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Portátil, Laptop o Notebook',
        description:
          'Test orientativo de 10 preguntas para descubrir qué computadora (portátil —laptop o notebook— o sobremesa, Windows, Mac o Linux, y gama de rendimiento) se adapta mejor a tu uso, presupuesto y prioridades. Incluye modelos de referencia actualizados.',
        url: 'https://meskeia.com/selector-portatil/',
        features: [
          'Test de 10 preguntas sobre uso y prioridades',
          'Recomendación de formato (portátil / sobremesa / 2 en 1)',
          'Recomendación de sistema operativo (Windows / Mac / Linux)',
          'Gama de rendimiento recomendada',
          'Modelos de referencia actualizados por perfil',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Portátil, Laptop o Notebook",
  description: "Test de 10 preguntas para saber qué computadora te conviene: portátil (laptop o notebook) o sobremesa, Windows o Mac, gama de rendimiento y modelos de referencia actualizados para 2025.",
  url: "https://meskeia.com/selector-portatil/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si necesito un portátil o un ordenador de sobremesa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El portátil (también llamado laptop o notebook en Latinoamérica) es la opción más práctica si te mueves frecuentemente entre casa, la oficina u otros lugares. Si trabajas siempre en el mismo sitio y priorizas el rendimiento máximo por el precio, un sobremesa ofrece más potencia por el mismo presupuesto. Los 2 en 1 (convertibles) son una tercera opción para quienes necesitan flexibilidad y no exigen máximo rendimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre Windows, Mac y Linux para uso cotidiano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Windows es el sistema más extendido, compatible con la mayoría de software empresarial y juegos. macOS es la opción habitual en diseño, edición de vídeo y desarrollo iOS/macOS; está integrado con el ecosistema Apple. Linux es gratuito, muy personalizable y preferido en programación y servidores, aunque tiene menos compatibilidad con software comercial. Para uso general o de oficina, Windows cubre prácticamente todos los casos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué procesador es suficiente para trabajar con documentos y videoconferencias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para tareas ofimáticas, navegación web y videoconferencias (Zoom, Teams) es suficiente con un procesador de gama media-baja: Intel Core i5 de última generación, AMD Ryzen 5 o Apple M1/M2. Lo más importante es acompañarlo de al menos 8 GB de RAM y un almacenamiento SSD para que el sistema responda con fluidez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta RAM necesito en un ordenador en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '8 GB de RAM es el mínimo razonable para uso cotidiano. 16 GB es lo recomendable si tienes muchas pestañas abiertas, usas aplicaciones de edición o desarrollo. 32 GB o más solo tiene sentido para edición de vídeo profesional, modelado 3D o máquinas virtuales. En portátiles con RAM soldada (como algunos Mac o ultrabooks), elegir bien desde el inicio es crucial porque no se puede ampliar después.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de usuario está pensado un portátil gaming?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los portátiles gaming incorporan una tarjeta gráfica dedicada (GPU) que los hace adecuados no solo para jugar, sino también para edición de vídeo, renderizado 3D y ciertas tareas de inteligencia artificial. Su inconveniente es el peso (habitualmente 2-2,5 kg), la autonomía reducida (3-5 horas) y el precio más elevado respecto a portátiles sin GPU dedicada. Si no juegas ni editas vídeo, no merece la pena su sobrecoste.',
      },
    },
  ],
};
