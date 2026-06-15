import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Endocrino - Glándulas, Hormonas y Feedback | meskeIA',
  description: 'Glándulas endocrinas clickables, 10 hormonas clave, feedback negativo interactivo y el eje del estrés HPA. Explicador visual.',
  keywords: 'sistema endocrino, hormonas, glandulas, insulina, cortisol, tiroides, feedback negativo, hipofisis, pancreas, suprarrenales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Endocrino - Glándulas, Hormonas y Feedback',
    description: 'Glándulas, hormonas y feedback negativo explicados visualmente.',
    url: 'https://meskeia.com/visualizador-sistema-endocrino/',
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
    title: 'El Sistema Endocrino - Explicador Visual',
    description: 'De la insulina al cortisol: el sistema endocrino paso a paso.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Endocrino meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Endocrino - Glándulas, Hormonas y Feedback',
  description: 'Explicador visual interactivo del sistema endocrino: silueta SVG con glándulas clickables, 10 hormonas clave, feedback negativo con slider de glucosa y eje HPA del estrés.',
  url: 'https://meskeia.com/visualizador-sistema-endocrino/',
  category: 'EducationalApplication',
  features: [
    'Silueta SVG con glándulas clickables en posición anatómica',
    '10 hormonas clave con función y datos curiosos',
    'Feedback negativo interactivo (tiroides, glucosa)',
    'Eje HPA del estrés explicado visualmente',
    'Slider de glucosa con respuesta insulina/glucagón',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el sistema endocrino y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema endocrino es la red de glándulas que producen hormonas y las vierten directamente al torrente sanguíneo para regular funciones como el metabolismo, el crecimiento, la reproducción y la respuesta al estrés. A diferencia del sistema nervioso, actúa de forma más lenta pero con efectos más duraderos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el feedback negativo hormonal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El feedback negativo es el mecanismo por el que el propio nivel de una hormona inhibe su producción para evitar el exceso. Un ejemplo clásico: cuando la glucosa en sangre sube, el páncreas secreta insulina; cuando baja, se frena la insulina y se activa el glucagón. Este equilibrio se llama homeostasis hormonal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hormonas produce la glándula tiroides?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tiroides produce T3 (triyodotironina) y T4 (tiroxina), que regulan el metabolismo basal, la temperatura corporal y el desarrollo neurológico. Su producción está controlada por la TSH hipofisaria. Cuando la tiroides produce en exceso (hipertiroidismo) o en defecto (hipotiroidismo), el metabolismo se acelera o ralentiza con síntomas muy variados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el eje HPA y por qué se activa con el estrés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El eje hipotálamo-hipófisis-suprarrenal (HPA) es el circuito que regula la respuesta al estrés. Ante una amenaza, el hipotálamo libera CRH, que estimula a la hipófisis para secretar ACTH, que a su vez activa las glándulas suprarrenales para producir cortisol. El cortisol aumenta la glucosa disponible y suprime procesos no urgentes como la digestión o el sistema inmune.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este explicador del sistema endocrino?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de Biología, Medicina o Enfermería que necesitan entender la regulación hormonal de forma visual e interactiva. También es apropiado para cualquier persona curiosa que quiera comprender cómo funcionan la insulina, el cortisol o las hormonas tiroideas sin necesidad de conocimientos previos.',
      },
    },
  ],
};
