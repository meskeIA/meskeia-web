import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';

export const jsonLd = generateWebAppSchema({
  name: 'Semáforo Emocional',
  description: 'Herramienta visual de regulación emocional con tres estados (rojo/amarillo/verde) y estrategias adaptadas. Para personas con autismo, TDAH, ansiedad y dificultades de regulación emocional. Gratis y sin registro.',
  url: 'https://meskeia.com/semaforo-emocional/',
  category: 'UtilityApplication',
  features: [
    'Tres zonas emocionales con estrategias específicas',
    'Estrategias visuales de regulación emocional',
    'Identificación del estado emocional actual',
    'Técnicas de calma adaptadas por zona',
    'Historial del día: registra hasta 8 estados con marca de hora',
  ],
});

export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/semaforo-emocional/',
  mainEntity: [
    {
      question: '¿Qué es el semáforo emocional y para qué sirve?',
      answer: 'El semáforo emocional es una herramienta visual de regulación emocional inspirada en el sistema de zonas de regulación. Utiliza los tres colores del semáforo —rojo, amarillo y verde— para representar distintos estados de activación emocional. La zona verde indica calma y bienestar, la zona amarilla refleja cierta tensión o alerta moderada, y la zona roja señala un estado de alta activación o desbordamiento emocional. Sirve para que la persona identifique cómo se siente en cada momento y acceda de forma rápida a estrategias concretas que le ayuden a regularse. Es especialmente útil en entornos educativos, terapéuticos y en el hogar para fomentar la conciencia emocional.',
    },
    {
      question: '¿Cómo ayuda el semáforo emocional a personas con autismo o TDAH?',
      answer: 'Las personas con autismo o TDAH suelen tener dificultades para identificar, nombrar y gestionar sus propias emociones, lo que se conoce como dificultades en la interoceptión o regulación emocional. El semáforo emocional ofrece un sistema visual claro y concreto que reduce la ambigüedad: en lugar de describir estados emocionales con vocabulario abstracto, utiliza colores intuitivos que muchas personas ya conocen. Además, asocia a cada zona estrategias específicas y adaptadas, lo que elimina la necesidad de improvisar en momentos de tensión —precisamente cuando resulta más difícil tomar decisiones—. Esta estructura predecible y visual reduce la ansiedad y facilita la autorregulación de forma autónoma.',
    },
    {
      question: '¿Cuál es la diferencia entre estar en zona roja y zona amarilla?',
      answer: 'La zona amarilla representa un estado de alerta moderada: la persona puede estar nerviosa, frustrada, preocupada o ligeramente irritable, pero todavía conserva cierta capacidad de razonamiento y autocontrol. En este estado es posible aplicar estrategias de regulación preventivas antes de que la situación escale. La zona roja, en cambio, indica un estado de alta activación o desbordamiento emocional: la persona puede sentir rabia intensa, pánico, agobio extremo o pérdida del control. En zona roja la capacidad cognitiva para pensar con claridad está muy reducida, por lo que las estrategias necesarias son más intensas y enfocadas en reducir la activación fisiológica antes de intentar resolver el problema original que desencadenó la reacción.',
    },
    {
      question: '¿Qué estrategias de regulación emocional propone la herramienta?',
      answer: 'El semáforo emocional ofrece estrategias diferenciadas según la zona en la que se encuentre la persona. Para la zona verde, propone actividades de mantenimiento del bienestar como ejercicio suave, actividades creativas o socialización. Para la zona amarilla sugiere técnicas de reducción del estrés como la respiración profunda, contar hasta diez, escuchar música calmante o dar un paseo corto. Para la zona roja, donde el desbordamiento es mayor, recomienda técnicas de regulación fisiológica más intensas como la respiración diafragmática prolongada, el movimiento físico intenso, el uso de objetos sensoriales o el alejamiento temporal del estímulo. Todas las estrategias están pensadas para ser accesibles y aplicables de manera inmediata sin necesidad de ayuda externa.',
    },
    {
      question: '¿Cómo puedo enseñar el semáforo emocional a niños o personas con discapacidad intelectual?',
      answer: 'Para enseñar el semáforo emocional a niños o a personas con discapacidad intelectual es recomendable introducirlo en momentos de calma, nunca en situaciones de alta activación emocional. El primer paso es familiarizar a la persona con los tres colores y sus significados mediante ejemplos concretos y situaciones cotidianas que ella pueda reconocer. Practicar regularmente identificando el propio estado emocional en momentos neutros ayuda a interiorizar el sistema. Usar el semáforo de forma visual —impreso en papel o en pantalla— durante las rutinas diarias facilita la generalización. Los cuidadores y educadores pueden modelar el uso describiendo su propio estado emocional en voz alta. Con el tiempo y la práctica repetida, la persona aprende a reconocer sus señales internas y a aplicar las estrategias de forma más autónoma.',
    },
  ],
});

export const metadata: Metadata = {
  title: 'Semáforo Emocional - Regulación Emocional Visual | meskeIA',
  description: 'Herramienta visual de regulación emocional con tres estados y estrategias adaptadas. Para personas con autismo, TDAH, ansiedad y dificultades de regulación emocional. Gratis y sin registro.',
  keywords: 'semáforo emocional, regulación emocional, autismo, TDAH, ansiedad, educación emocional, zonas de regulación, estrategias calma, accesibilidad, herramienta emocional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Semáforo Emocional | meskeIA',
    description: 'Identifica tu estado emocional y accede a estrategias visuales de regulación. Para autismo, TDAH y ansiedad.',
    url: 'https://meskeia.com/semaforo-emocional/',
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
    title: 'Semáforo Emocional | meskeIA',
    description: 'Herramienta visual de regulación emocional con estrategias adaptadas para cada estado. Gratis, sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};
