import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transportador de Ángulos Online y para Imprimir - Mide sobre tu Imagen - meskeIA',
  description:
    'Mide ángulos sobre una captura, un plano o un esquema arrastrando tres puntos: amplitud en grados, tipo de ángulo y notación en grados, minutos y segundos. Incluye un transportador imprimible a escala real. Gratis y sin subir la imagen a ningún servidor.',
  keywords:
    'transportador de angulos, transportador online, medidor de angulos, medir angulos, semicirculo graduado, goniometro online, transportador para imprimir, transportador de angulos imprimible, angulo agudo obtuso recto, grados minutos segundos, geometria, protractor online',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Transportador de Ángulos Online y para Imprimir',
    description:
      'Mide ángulos sobre una imagen arrastrando tres puntos y descarga un transportador a escala real para imprimir.',
    url: 'https://meskeia.com/transportador-angulos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transportador de Ángulos Online y para Imprimir',
    description:
      'Mide ángulos sobre una imagen arrastrando tres puntos. Incluye transportador imprimible a escala real.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Transportador de Ángulos meskeIA',
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Transportador de Ángulos Online',
  description:
    'Herramienta para medir ángulos sobre una imagen plana (captura de pantalla, plano, esquema o fotografía frontal) arrastrando el vértice y los dos brazos. Da la amplitud en grados con decimales, el ángulo reflejo, el complementario y el suplementario, la notación en grados-minutos-segundos y el tipo de ángulo. Incluye además un transportador de 180 grados imprimible a escala real con barra de calibración.',
  url: 'https://meskeia.com/transportador-angulos/',
  features: [
    'Mide ángulos sobre una imagen propia arrastrando tres puntos',
    'Amplitud en grados decimales y en grados, minutos y segundos',
    'Ángulo reflejo, complementario y suplementario calculados a la vez',
    'Clasifica el ángulo en agudo, recto, obtuso o llano',
    'Transportador de 180 grados imprimible a escala real, con barra de calibración',
    'Rejilla milimetrada de apoyo cuando no se carga ninguna imagen',
    'La imagen no sale del navegador: no se sube a ningún servidor',
    'Funciona con ratón, con el dedo y con el teclado',
  ],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/transportador-angulos/',
  mainEntity: [
    {
      question: '¿Cómo se mide un ángulo en una imagen sin transportador?',
      answer:
        'Se marcan tres puntos: el vértice del ángulo y un punto sobre cada uno de sus dos lados. El ángulo es el que forman los dos segmentos que salen del vértice, y se calcula con la relación entre ellos, sin necesidad de alinear ningún instrumento físico. Basta con que los dos puntos de los brazos caigan sobre las líneas, tan lejos del vértice como se pueda: cuanto más largos sean los brazos, menos afecta un pequeño temblor al arrastrarlos.',
    },
    {
      question: '¿Puedo medir un ángulo sobre una foto hecha con el móvil?',
      answer:
        'Solo si la foto es frontal, es decir, si la cámara estaba paralela al plano donde está el ángulo. La perspectiva deforma los ángulos: la esquina de una mesa rectangular mide 90 grados, pero en una foto tomada de lado puede aparecer como 70 o como 110. Sobre capturas de pantalla, planos, PDF y esquemas la medida es exacta, porque esas imágenes ya son planas y no tienen proyección.',
    },
    {
      question: '¿Qué diferencia hay entre el ángulo y su reflejo?',
      answer:
        'Cualquier par de semirrectas define dos ángulos que suman 360 grados: el menor y el mayor. Un transportador da siempre el menor, pero a veces el que interesa es el otro, como la esquina entrante de una habitación en un plano. Esta herramienta muestra los dos a la vez, de modo que no hay que restar de 360 a mano.',
    },
    {
      question: '¿Para qué sirve la notación en grados, minutos y segundos?',
      answer:
        'Es la forma de escribir ángulos en topografía, en náutica, en astronomía y en muchos enunciados de trigonometría. Un grado son 60 minutos de arco y un minuto son 60 segundos, igual que en las horas. Convertir 30,5 grados a 30 grados y 30 minutos es fácil, pero 12,3456 grados ya no, y ahí es donde suele colarse el error.',
    },
    {
      question: '¿Por qué imprimir un transportador si ya lo mido en pantalla?',
      answer:
        'Porque no todo el trabajo está en pantalla: un ejercicio en papel, un patrón de costura o un corte en madera se miden sobre el objeto real. La hoja imprimible reproduce un transportador de 180 grados a tamaño real, e incluye una barra de calibración de 100 milímetros para comprobar que la impresora no ha escalado la hoja, que es el fallo habitual al imprimir plantillas.',
    },
    {
      question: '¿Se sube mi imagen a algún servidor?',
      answer:
        'No. La imagen se lee en el propio navegador y no viaja a ninguna parte: no hay subida, ni almacenamiento, ni copia en un servidor. Al cerrar o recargar la página desaparece. Por eso se puede usar con planos de trabajo o documentos que no conviene enviar fuera.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);
