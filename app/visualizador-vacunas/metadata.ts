import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona una Vacuna - Sistema Inmune y Tipos | meskeIA',
  description: 'Entiende cómo funcionan las vacunas: sistema inmune, tipos (ARNm, vector, atenuada), inmunidad de rebaño y la historia de la vacunación.',
  keywords: 'vacunas, sistema inmune, inmunidad rebaño, ARNm, anticuerpos, historia vacunacion, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona una Vacuna',
    description: 'Vacunas y sistema inmune explicados visualmente.',
    url: 'https://meskeia.com/visualizador-vacunas/',
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
    title: 'Cómo Funciona una Vacuna',
    description: 'Sistema inmune, tipos de vacunas e inmunidad de rebaño.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Vacunas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona una Vacuna',
  description: 'Explicador visual del sistema inmune, tipos de vacunas (ARNm, vector viral, atenuada), inmunidad de rebaño con simulación y la historia de la vacunación.',
  url: 'https://meskeia.com/visualizador-vacunas/',
  category: 'EducationalApplication',
  features: [
    'Sistema inmune explicado paso a paso',
    'Comparación de 5 tipos de vacunas',
    'Simulador visual de inmunidad de rebaño',
    'Timeline histórica de la vacunación',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona una vacuna en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una vacuna introduce en el organismo una versión inofensiva del patógeno (virus atenuado, proteína de su superficie o instrucciones de ARNm) para que el sistema inmune aprenda a reconocerlo sin sufrir la enfermedad. El cuerpo produce anticuerpos específicos y linfocitos de memoria que quedan activos durante años. Si la persona entra en contacto real con el patógeno después, el sistema inmune responde de forma rápida y eficaz antes de que la infección pueda desarrollarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una vacuna ARNm y una vacuna tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las vacunas tradicionales usan el patógeno entero (atenuado o inactivado) o proteínas purificadas de su superficie. Las vacunas de ARNm (como las de Pfizer y Moderna contra la COVID-19) introducen instrucciones genéticas para que las propias células del receptor produzcan temporalmente una proteína viral inocua, que desencadena la respuesta inmune. El ARNm se degrada en días y nunca entra en el núcleo celular ni interactúa con el ADN.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la inmunidad de rebaño y cuántas personas deben vacunarse para alcanzarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inmunidad de rebaño (o colectiva) ocurre cuando una proporción suficiente de la población es inmune a una enfermedad, de modo que el patógeno no puede propagarse de forma sostenida y protege incluso a quienes no pueden vacunarse. El umbral varía según la transmisibilidad de cada enfermedad: para el sarampión (muy contagioso) se necesita alrededor del 95 % de la población inmunizada; para la polio alrededor del 80-85 %; para la gripe estacional puede ser suficiente con el 50-60 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se inventó la primera vacuna?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La primera vacuna moderna fue desarrollada por Edward Jenner en 1796, cuando demostró que inocular el virus de la viruela bovina (vaccinia) protegía contra la viruela humana, una enfermedad que mataba al 30 % de los infectados. El término "vacuna" deriva precisamente de "vacca" (vaca en latín). Un siglo después, Louis Pasteur extendió el principio a otras enfermedades (cólera de las gallinas, ántrax, rabia) y estableció las bases científicas de la inmunología.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son seguras las vacunas? ¿Qué efectos secundarios pueden tener?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las vacunas autorizadas han superado extensos ensayos clínicos que evalúan su seguridad y eficacia. Los efectos secundarios más comunes son leves y transitorios: dolor en el punto de inyección, enrojecimiento, fiebre moderada o fatiga durante 1-2 días, señales de que el sistema inmune está respondiendo. Los efectos graves son muy infrecuentes (menos de 1 por 100.000 dosis en la mayoría de vacunas). Los organismos reguladores como la EMA y la FDA monitorean continuamente su seguridad una vez en el mercado.',
      },
    },
  ],
};
