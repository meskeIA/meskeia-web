import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Dopamina - El Sistema de Recompensa del Cerebro | meskeIA',
  description: 'Cómo funciona la dopamina: el circuito de recompensa mesolímbico, el ciclo deseo-anticipación-recompensa, su papel en redes sociales y adicciones, y cómo modular el sistema de forma natural.',
  keywords: ['dopamina', 'sistema de recompensa', 'dopamina adiccion', 'dopamina redes sociales', 'circuito mesolimbico', 'neurotransmisor dopamina', 'dopamina motivacion', 'parkinson dopamina', 'dopamina habitos'],
  openGraph: {
    title: 'Dopamina - El Sistema de Recompensa | meskeIA',
    description: 'Cómo la dopamina controla la motivación, el placer y la conducta.',
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
  name: "Dopamina - El Sistema de Recompensa del Cerebro",
  description: "Cómo funciona la dopamina: el circuito de recompensa mesolímbico, el ciclo deseo-anticipación-recompensa, su papel en redes sociales y adicciones, y cómo modular el sistema de forma natural.",
  url: "https://meskeia.com/visualizador-dopamina/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la dopamina y para qué sirve en el cerebro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dopamina es un neurotransmisor producido principalmente en el área tegmental ventral (ATV) y en la sustancia negra. Su función principal no es producir placer directamente, sino señalizar la anticipación de una recompensa y motivar la conducta para obtenerla. También participa en el control del movimiento voluntario, la memoria de trabajo y la regulación del estado de ánimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el circuito de recompensa mesolímbico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El circuito mesolímbico conecta el ATV con el núcleo accumbens, la corteza prefrontal y otras estructuras límbicas. Cuando anticipamos o recibimos una recompensa (comida, reconocimiento social, logro), las neuronas dopaminérgicas disparan y refuerzan el comportamiento que llevó a esa recompensa. La clave es que la dopamina se libera ante la señal predictora de la recompensa, no solo ante la recompensa en sí.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las redes sociales generan tanta dopamina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las notificaciones, los "me gusta" y el scroll infinito explotan el ciclo dopaminérgico porque ofrecen recompensas impredecibles y de frecuencia variable, el mismo mecanismo que hace adictivas las máquinas tragaperras. La incertidumbre sobre cuándo llegará el siguiente estímulo positivo mantiene el sistema dopaminérgico en estado de alerta continua, dificultando la desconexión voluntaria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tiene la dopamina con el Parkinson?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La enfermedad de Parkinson se produce por la degeneración progresiva de las neuronas dopaminérgicas de la sustancia negra, que controlan el movimiento voluntario a través de la vía nigroestriada. La pérdida del 70-80% de estas neuronas provoca los síntomas motores clásicos: temblor en reposo, rigidez muscular, bradicinesia y problemas de equilibrio. El tratamiento con levodopa busca reponer los niveles de dopamina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se puede regular el sistema dopaminérgico de forma natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ejercicio aeróbico regular, el sueño de calidad, la exposición a la luz solar matutina y completar tareas con objetivos claros y alcanzables favorecen una actividad dopaminérgica saludable. Reducir la estimulación digital impredecible (notificaciones, scroll) y espaciar las recompensas instantáneas ayuda a restaurar la sensibilidad de los receptores. Alimentos ricos en tirosina (huevos, legumbres, frutos secos) aportan el precursor para la síntesis de dopamina.',
      },
    },
  ],
};
