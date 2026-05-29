import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Magnesio: 300 Reacciones Enzimáticas y Deficiencia Silenciosa | meskeIA',
  description:
    'Cofactor del ATP, equilibrio calcio/magnesio en músculos, bloqueador del receptor NMDA y síntomas de la deficiencia más infradiagnosticada.',
  keywords: [
    'magnesio como funciona',
    'magnesio deficiencia síntomas',
    'magnesio calambres',
    'magnesio ATP',
    'magnesio NMDA',
    'magnesio ansiedad',
    'magnesio migraña',
    'magnesio suplemento cual tomar',
  ],
  openGraph: {
    title: 'El Magnesio: 300 Reacciones Enzimáticas y Deficiencia Silenciosa',
    description: 'ATP, músculo, NMDA y la deficiencia infradiagnosticada',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "El Magnesio: 300 Reacciones Enzimáticas y Déficit Silencioso",
  description: "Cofactor del ATP, equilibrio calcio/magnesio en músculos, bloqueador del receptor NMDA y síntomas de la deficiencia más infradiagnosticada.",
  url: "https://meskeia.com/visualizador-magnesio/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve el magnesio en el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El magnesio es cofactor de más de 300 reacciones enzimáticas y es imprescindible para la producción de energía (síntesis de ATP), la síntesis de proteínas y ADN, la conducción nerviosa y la contracción muscular. También actúa como bloqueador del canal del receptor NMDA de glutamato, modulando la excitabilidad neuronal. Es el cuarto mineral más abundante del cuerpo y el segundo intracelular más frecuente después del potasio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué síntomas produce la deficiencia de magnesio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deficiencia leve o moderada de magnesio es muy frecuente y a menudo no se diagnostica porque los niveles séricos no reflejan bien las reservas celulares. Los síntomas más comunes son calambres musculares, fatiga, irritabilidad, dificultad para dormir, palpitaciones y cefaleas. La deficiencia crónica se ha asociado con mayor riesgo de hipertensión, arritmias, resistencia a la insulina y mayor frecuencia de migrañas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el magnesio puede ayudar con los calambres musculares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El magnesio compite con el calcio en el mecanismo de contracción muscular: el calcio activa la contracción y el magnesio la inhibe y permite la relajación. Cuando los niveles de magnesio son insuficientes, el músculo tiende a la hiperexcitabilidad y a contracciones no controladas (calambres). Aunque la evidencia para el tratamiento de calambres nocturnos no es concluyente en la población general, el déficit documentado de magnesio sí responde bien a la suplementación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre los distintos tipos de suplementos de magnesio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las formas orgánicas (glicinato, malato, taurato, L-treonato) tienen mejor biodisponibilidad y tolerancia digestiva que las inorgánicas. El glicinato se usa para relajación y sueño; el malato para energía y fatiga muscular; el L-treonato atraviesa mejor la barrera hematoencefálica y se investiga para función cognitiva. El óxido de magnesio es la forma más barata y común, pero tiene la menor absorción (4-5%) y puede causar efecto laxante. El citrato tiene biodisponibilidad intermedia y es ampliamente disponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los alimentos más ricos en magnesio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las fuentes alimentarias más ricas en magnesio son las semillas de calabaza (550 mg/100g), el cacao puro y el chocolate negro (>70%), las almendras y los frutos secos en general, las legumbres (especialmente alubias negras y edamame), los cereales integrales, las espinacas y otras verduras de hoja verde, y el aguacate. El procesado industrial reduce significativamente el contenido de magnesio en los cereales al eliminar el germen y el salvado.',
      },
    },
  ],
};
