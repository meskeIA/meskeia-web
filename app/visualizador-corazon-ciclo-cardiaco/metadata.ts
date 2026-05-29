import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo Cardíaco - Sístole, Diástole, Válvulas y ECG | meskeIA',
  description:
    'Visualiza el ciclo cardíaco: sístole y diástole, las 4 válvulas del corazón, trazado ECG interactivo y cálculo de gasto cardíaco. Aprende cómo late tu corazón.',
  keywords: [
    'ciclo cardiaco',
    'sistole',
    'diastole',
    'valvulas corazon',
    'ECG electrocardiograma',
    'gasto cardiaco',
    'frecuencia cardiaca',
    'anatomia corazon',
    'fisiologia cardiaca',
  ],
  openGraph: {
    title: 'Ciclo Cardíaco | meskeIA',
    description: 'Sístole, diástole, válvulas y ECG con animaciones interactivas',
    url: 'https://meskeia.com/visualizador-corazon-ciclo-cardiaco/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Ciclo Cardíaco - Sístole, Diástole y ECG",
  description: "Visualiza el ciclo cardíaco: sístole y diástole, las 4 válvulas del corazón, trazado ECG interactivo y cálculo de gasto cardíaco. Aprende cómo late tu corazón.",
  url: "https://meskeia.com/visualizador-corazon-ciclo-cardiaco/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ciclo cardíaco y cuánto dura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo cardíaco es la secuencia completa de contracciones y relajaciones que el corazón realiza en cada latido. Se divide en dos fases principales: sístole (contracción y expulsión de sangre) y diástole (relajación y llenado de las cámaras). A una frecuencia de 70 latidos por minuto, un ciclo completo dura aproximadamente 0,85 segundos, de los cuales unos 0,3 corresponden a la sístole ventricular y el resto a la diástole.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre sístole y diástole en el corazón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sístole es la fase de contracción: los ventrículos se comprimen y expulsan sangre hacia la aorta (ventrículo izquierdo) y la arteria pulmonar (ventrículo derecho). La diástole es la fase de relajación: los ventrículos se rellenan de sangre procedente de las aurículas. La presión arterial que medimos con el tensiómetro refleja precisamente estos dos momentos: el número alto (sistólica) y el bajo (diastólica).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven las 4 válvulas del corazón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las válvulas cardíacas actúan como compuertas unidireccionales que aseguran que la sangre fluya siempre en la dirección correcta. Las válvulas mitral y tricúspide (auriculoventriculares) separan aurículas de ventrículos. Las válvulas aórtica y pulmonar (semilunares) evitan que la sangre regrese a los ventrículos tras ser expulsada. Un soplo cardíaco suele indicar que una válvula no cierra o no abre correctamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide un electrocardiograma (ECG) y qué son las ondas P, QRS y T?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ECG registra la actividad eléctrica del corazón mediante electrodos en la piel. La onda P representa la despolarización (activación) de las aurículas, el complejo QRS la despolarización de los ventrículos (el evento más intenso del ciclo) y la onda T la repolarización ventricular (recuperación para el siguiente latido). Alteraciones en forma, duración o distancia entre estas ondas permiten detectar arritmias, infartos o hipertrofia cardíaca.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el gasto cardíaco y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El gasto cardíaco es la cantidad de sangre que el corazón bombea por minuto y se calcula multiplicando el volumen sistólico (sangre expulsada por latido, normalmente 70 ml en reposo) por la frecuencia cardíaca. En reposo ronda los 4,9 litros por minuto; durante ejercicio intenso puede superar los 20-25 litros. Es un indicador clave de la función cardíaca: valores bajos pueden indicar insuficiencia cardíaca, mientras que el entrenamiento de resistencia lo mejora aumentando el volumen sistólico.',
      },
    },
  ],
};
