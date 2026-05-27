import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Historias Sociales Visuales - Creador para Autismo y TDAH | meskeIA',
  description: 'Crea historias sociales visuales personalizadas para preparar situaciones nuevas o difíciles. Técnica de Carol Gray adaptada para autismo, TDAH y discapacidad cognitiva. Sin registro, 100% local.',
  keywords: 'historias sociales, historias sociales autismo, social stories, Carol Gray, preparacion situaciones nuevas, autismo situaciones, TDAH rutinas, pictogramas historia, secuencia visual, narrativa social',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Historias Sociales Visuales | meskeIA',
    description: 'Crea historias sociales visuales para preparar situaciones nuevas. Para autismo, TDAH y discapacidad cognitiva.',
    url: 'https://meskeia.com/historias-sociales/',
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
    title: 'Historias Sociales Visuales | meskeIA',
    description: 'Crea historias sociales visuales para preparar situaciones nuevas. Para autismo, TDAH y discapacidad cognitiva.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Historias Sociales Visuales - Creador para Autismo y TDAH',
  description: 'Crea historias sociales visuales personalizadas para preparar situaciones nuevas o difíciles. Técnica de Carol Gray adaptada para autismo, TDAH y discapacidad cognitiva. Sin registro, 100% local.',
  url: 'https://meskeia.com/historias-sociales/',
  category: 'UtilityApplication',
  features: [
    'Creación de historias sociales personalizadas con imágenes y texto',
    'Basado en la técnica de Carol Gray para la preparación de situaciones',
    'Para preparar situaciones nuevas o difíciles (visitas médicas, cambios de rutina, conflictos sociales)',
    'Descargable e imprimible en formato PDF',
    'Funciona sin conexión y sin registro',
  ],
});

export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/historias-sociales/',
  mainEntity: [
    {
      question: '¿Qué es una historia social?',
      answer: 'Una historia social es una herramienta de comunicación y apoyo visual creada para ayudar a personas con dificultades en la comprensión de situaciones sociales. Consiste en una narración breve y estructurada que describe una situación cotidiana o nueva desde la perspectiva de la persona, explicando qué ocurre, por qué ocurre y cómo se puede responder de forma adecuada. Las historias sociales están especialmente diseñadas para personas con autismo, TDAH, discapacidad cognitiva u otras necesidades de apoyo socioemocional, aunque pueden beneficiar a cualquier persona que necesite prepararse emocionalmente para un acontecimiento desafiante o desconocido.',
    },
    {
      question: '¿Quién creó las historias sociales y cuál es su base científica?',
      answer: 'Las historias sociales fueron desarrolladas por Carol Gray en 1991 mientras trabajaba como consultora de educación especial en Michigan (EE. UU.). Gray observó que muchos alumnos con autismo tenían dificultades para comprender el contexto y las expectativas implícitas de las situaciones sociales. Diseñó un formato narrativo específico, con oraciones descriptivas, de perspectiva, de orientación y de control, que permite a la persona entender una situación antes de vivirla. Desde entonces, se han publicado cientos de estudios que avalan su eficacia, y la técnica ha sido actualizada y formalizada en múltiples guías por la propia Carol Gray. En España es ampliamente utilizada en centros de educación especial, servicios de orientación y familias.',
    },
    {
      question: '¿Para qué situaciones son útiles las historias sociales?',
      answer: 'Las historias sociales resultan especialmente útiles en cualquier situación que represente un reto social, sensorial o de cambio de rutina para la persona. Algunos ejemplos frecuentes son: visitas al médico, dentista u hospital; cambios de centro escolar o de aula; situaciones de conflicto entre iguales; participar en una excursión o actividad nueva; aprender a pedir ayuda o expresar emociones; afrontar imprevistos como la cancelación de una actividad favorita; o entender normas sociales implícitas como respetar el turno de palabra o saludar. También se usan para preparar eventos importantes como una entrevista de trabajo, una boda familiar o el inicio de un nuevo trabajo. La clave está en adaptarlas a la situación concreta y a la persona.',
    },
    {
      question: '¿Cómo se redacta correctamente una historia social?',
      answer: 'Para redactar una historia social efectiva según la metodología de Carol Gray, hay que seguir varias pautas esenciales. En primer lugar, la historia debe escribirse desde la primera persona del singular ("Cuando voy al médico...") para que la persona se identifique con el relato. El tono debe ser positivo, tranquilizador y descriptivo, evitando el lenguaje prescriptivo o imperativo. La estructura recomendada incluye una introducción que contextualice la situación, una parte central que explique qué sucede y por qué, y una conclusión que indique cómo puede responder la persona. La longitud adecuada suele ser de 2 a 10 frases. Es recomendable acompañar el texto de imágenes o pictogramas que refuercen la comprensión. Antes de usar la historia, conviene revisarla junto con un profesional (psicólogo, pedagogo, logopeda) para asegurar que se adapta correctamente a la persona.',
    },
    {
      question: '¿En qué se diferencia una historia social de un cuento terapéutico?',
      answer: 'Aunque ambos son herramientas narrativas con función de apoyo emocional, tienen objetivos y estructuras distintas. Un cuento terapéutico es una narración generalmente en tercera persona, con personajes ficticios o metafóricos, que aborda un conflicto emocional de forma indirecta para que el niño o adulto pueda identificarse sin sentirse señalado. Se utiliza mucho en psicoterapia infantil y trabaja principalmente la dimensión emocional y simbólica. Una historia social, en cambio, es directa, concreta y personalizada: describe la situación real que vivirá la persona, con su nombre o en primera persona, explicando los hechos de forma literal y predictiva. Su objetivo principal no es procesar emociones pasadas, sino preparar cognitiva y conductualmente para una situación futura. El cuento terapéutico trabaja el pasado o el presente; la historia social trabaja el futuro inmediato.',
    },
  ],
});
