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
  // Lo que la app hace (hallazgo 5002): 47 fichas, no 206, porque carpo, tarso, vértebras,
  // costillas y falanges van agrupados
  features: [
    '47 fichas que agrupan los 206 huesos del esqueleto adulto, con nombre latino, tipo, región y cantidad',
    'Filtros por región: cráneo, cara, oído medio, cuello, columna, tórax, cinturas y extremidades',
    'Filtro por tipo de hueso: largo, corto, plano, irregular y sesamoideo',
    'Buscador por nombre, nombre latino, función o articulación, también sin tildes',
    'Ficha desplegable con articulaciones, función y curiosidad',
    'Contador de entradas y de huesos que cambia con los filtros',
  ],
});

// La pregunta está también en la FAQ visible («¿Cuántos huesos tiene la columna vertebral exactamente?»):
// una sola respuesta para las dos (check:faq-unica, C0570, 13/11/2026). El JSON-LD fijaba 4 coccígeas
// y 33 vértebras; la visible, de 3 a 5 y 33-34, que es la variación anatómica real: se queda esa.
export const RESPUESTA_FAQ_HUESOS_COLUMNA =
  'Al nacer, la columna vertebral tiene 33 o 34 vértebras: 7 cervicales (C1-C7), 12 torácicas (T1-T12), 5 lumbares (L1-L5), 5 sacras y de 3 a 5 coccígeas. En el adulto, las sacras se fusionan en el sacro y las coccígeas en el cóccix, así que quedan 26 huesos independientes. La regla mnemotécnica clásica: 7-12-5 son las horas de las comidas (desayuno a las 7, comida a las 12, cena a las 5).';

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
        text: 'El fémur, el hueso del muslo, es el más largo del cuerpo humano. En un adulto de estatura media mide aproximadamente 45-50 cm y representa alrededor del 27% de la altura total de la persona. También es el hueso más resistente del cuerpo: al caminar, correr o saltar soporta cargas de varias veces el peso corporal.',
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
        text: RESPUESTA_FAQ_HUESOS_COLUMNA,
      },
    },
  ],
};
