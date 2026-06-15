import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Huesos del Cuerpo Humano - Guía Completa del Esqueleto | meskeIA',
  description: 'Explora los 206 huesos del esqueleto humano: nombre, función, articulaciones y curiosidades. Guía interactiva para estudiantes de medicina, enfermería y anatomía.',
  keywords: 'huesos, esqueleto humano, anatomía, cráneo, columna vertebral, costillas, fémur, húmero, vértebras, medicina, enfermería, fisioterapia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Huesos del Cuerpo Humano - Guía Completa del Esqueleto',
    description: 'Explora los 206 huesos del esqueleto humano con información detallada sobre función, articulaciones y curiosidades.',
    url: 'https://meskeia.com/huesos-cuerpo-humano/',
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
    title: 'Huesos del Cuerpo Humano - Guía Anatómica',
    description: 'Explora los 206 huesos del esqueleto humano con información detallada.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Huesos del Cuerpo Humano meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Huesos del Cuerpo Humano",
  description: "Explora los 206 huesos del esqueleto humano: nombre, función, articulaciones y curiosidades. Guía interactiva para estudiantes de medicina, enfermería y anatomía.",
  url: "https://meskeia.com/huesos-cuerpo-humano/",
  category: 'EducationalApplication',
  features: [
    'Catálogo de los 206 huesos del esqueleto adulto con nombre en latín',
    'Filtros por región anatómica: cráneo, columna vertebral, tórax, extremidades superiores e inferiores',
    'Filtros por tipo de hueso: largo, corto, plano, irregular y sesamoideo',
    'Articulaciones, función biomecánica y datos curiosos por hueso',
    'Buscador por nombre, función o articulación entre los 206 huesos',
    'Contador de resultados dinámico con combinación de filtros',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos huesos tiene el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El esqueleto adulto tiene 206 huesos. Al nacer, los bebés tienen alrededor de 270-300 piezas óseas, muchas de las cuales se fusionan durante el crecimiento. Esta fusión se completa hacia los 25 años, cuando el esqueleto alcanza su configuración definitiva de 206 huesos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el hueso más largo del cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El fémur, el hueso del muslo, es el más largo del cuerpo humano. En un adulto de estatura media mide aproximadamente 45-50 cm y representa alrededor del 27% de la altura total de la persona. También es el hueso más resistente: puede soportar fuerzas de compresión de hasta 1.700 kg.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el hueso más pequeño del cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estribo, uno de los tres huesecillos del oído medio, es el hueso más pequeño del cuerpo humano. Mide aproximadamente 3 mm de longitud. Los tres osículos del oído (martillo, yunque y estribo) transmiten las vibraciones sonoras desde el tímpano hasta el oído interno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar la anatomía ósea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El conocimiento del esqueleto es fundamental en medicina, enfermería, fisioterapia, osteopatía y ciencias del deporte. Permite interpretar radiografías, comprender lesiones, planificar cirugías y entender el movimiento corporal. También es materia obligatoria en oposiciones sanitarias y en el examen MIR, donde la anatomía musculoesquelética representa una parte relevante del temario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos huesos tiene la columna vertebral?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La columna vertebral está formada por 33 vértebras distribuidas en cinco regiones: 7 cervicales, 12 torácicas, 5 lumbares, 5 sacras (fusionadas en el sacro) y 4 coccígeas (fusionadas en el cóccix). En el adulto, las vértebras sacras y coccígeas fusionadas reducen el número de piezas independientes a 26.',
      },
    },
  ],
};
