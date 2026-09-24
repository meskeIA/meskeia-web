import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FORMACIONES } from './motor';

export const metadata: Metadata = {
  title: 'Selector de Formación Postgrado | ¿Máster, FP, Bootcamp u Oposiciones? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de formación postgrado se adapta mejor a tu perfil: máster universitario, FP de grado superior, bootcamp online, oposiciones o certificación profesional.',
  keywords: ['qué estudiar después del grado', 'máster o FP superior', 'bootcamp o máster', 'oposiciones o estudiar', 'formación postgrado España', 'certificación profesional', 'qué hacer después de la carrera', 'FP dual o universidad', 'máster universitario España', 'formación continua adultos'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Selector de Formación Postgrado — ¿Máster, FP, Bootcamp u Oposiciones?',
    description: 'Descubre qué tipo de formación postgrado se adapta mejor a tu perfil en 10 preguntas.',
    url: 'https://meskeia.com/selector-formacion-postgrado/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selector de Formación Postgrado — ¿Máster, FP, Bootcamp u Oposiciones?',
    description: 'Descubre qué tipo de formación postgrado se adapta mejor a tu perfil en 10 preguntas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Formación Postgrado",
  description: "Test de 10 preguntas para saber qué tipo de formación postgrado se adapta mejor a tu perfil: máster universitario, FP de grado superior, bootcamp online, oposiciones o certificación profesional.",
  url: "https://meskeia.com/selector-formacion-postgrado/",
  category: 'EducationalApplication',
  // Antes vacío (familia selector-*, forma e): lo que la app hace de verdad.
  features: [
    'Test de 10 preguntas sobre motivación, tiempo, presupuesto, experiencia y objetivos',
    'Compara cinco vías: máster universitario, FP de grado superior, bootcamp, oposiciones y certificación profesional',
    'Respeta tus límites de presupuesto, tiempo, urgencia y título, y avisa si ninguna vía los cumple todos',
    'Razones sacadas de tus respuestas y comparativa de afinidad con cada vía',
    'Duración y coste orientativos de cada vía',
    'Guía con la normativa de másteres habilitantes, acceso a cuerpos docentes y créditos ECTS',
  ],
});

const { master, fp_superior: fp, bootcamp, oposiciones, certificacion } = FORMACIONES;

/**
 * Las duraciones y las vías salen de FORMACIONES, las mismas constantes que la pantalla: el FAQ
 * daba «3-9 meses» al bootcamp y «1-4 años» a las oposiciones, y la primera respuesta olvidaba la
 * FP (hallazgo 1452; familia selector-*, forma h). Las cifras que no tenían fuente (la tasa de
 * aprobados, «un 8 % superior según el INE») se han retirado o sustituido por la fuente.
 */
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué hacer después de terminar la carrera universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Las opciones principales son: un máster universitario (${master.duracion}) para especializarte o acceder al doctorado, una FP de grado superior (${fp.duracion}) si buscas formación práctica orientada al empleo, un bootcamp (${bootcamp.duracion}) para adquirir habilidades técnicas en poco tiempo, oposiciones (${oposiciones.duracion}) para acceder a empleo público estable, una certificación profesional (${certificacion.duracion.toLowerCase()}) reconocida por el sector o directamente la entrada al mercado laboral. La mejor opción depende de tus objetivos, del tiempo del que dispones y de tu presupuesto.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Vale la pena hacer un máster universitario?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Máster habilitantes: Ley 34/2006 (abogacía y procura), Ley 33/2011 DA 7.ª (psicología
        // general sanitaria), LOE arts. 94-95 (profesorado). Medicina no: se ejerce con el grado
        // (Orden ECI/332/2008) y la especialidad es por residencia MIR (hallazgo 1449). Empleo: INE,
        // Encuesta de Inserción Laboral de Titulados Universitarios 2019, publicada el 29/10/2020, la
        // última edición en INEbase (hallazgo 1451; antes decía «un 8 % superior»).
        text: 'Depende del objetivo. Es obligatorio para ejercer las profesiones reguladas con máster habilitante, como la abogacía y la procura, la psicología general sanitaria o el profesorado de secundaria, y es la vía general de acceso al doctorado. Medicina, en cambio, se ejerce con el grado, y sus especialidades se obtienen por residencia (MIR), no por un máster. Según la Encuesta de Inserción Laboral de Titulados Universitarios del INE (2019), la tasa de empleo en 2019 de los graduados universitarios del curso 2013-2014 era del 86,1 %, y la de los titulados de máster, del 87,3 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un bootcamp de un máster?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Un bootcamp es una formación intensiva (${bootcamp.duracion}) centrada en habilidades prácticas y empleabilidad inmediata, principalmente en tecnología; da un certificado propio, no un título oficial. Un máster universitario dura ${master.duracion}, otorga una titulación oficial reconocida por el sistema universitario y combina teoría y práctica. El bootcamp es más rápido; el máster da un título oficial y es la vía general de acceso al doctorado.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién son recomendables las oposiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Las oposiciones son adecuadas para personas que valoran la estabilidad laboral a largo plazo, toleran bien el estudio memorístico y estructurado durante un periodo largo (${oposiciones.duracion}) y pueden sostener ese tiempo de preparación. Son especialmente competitivas en cuerpos como la Administración General del Estado, la judicatura o la docencia.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una certificación profesional y cuándo tiene sentido hacerla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Una certificación profesional es un título emitido por una organización o empresa reconocida en un sector (PMP en gestión de proyectos, AWS en la nube, CFA en finanzas, CISSP en ciberseguridad). Se obtiene en ${certificacion.duracion.toLowerCase()} y tiene sentido cuando ya tienes experiencia en el área y necesitas acreditar tus competencias de forma reconocida internacionalmente. Suele ser más rápida que un máster, pero no es un título universitario oficial.`,
      },
    },
  ],
};
