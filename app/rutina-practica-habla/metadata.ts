import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Rutina Guiada de Práctica del Habla y la Voz - Sesiones de 10, 20 o 30 Minutos | meskeIA',
  description: 'Elige qué quieres practicar (fluidez, voz, articulación o lectura en voz alta) y de cuánto tiempo dispones: la rutina reparte los minutos en bloques, lleva el temporizador y enlaza en cada paso la herramienta que necesitas. Sin registro y sin datos personales.',
  keywords: 'practica del habla, ejercicios de voz, rutina de dicción, lectura en voz alta, fluidez del habla, articulación, sesión guiada, temporizador de práctica, logopedia apoyo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Rutina Guiada de Práctica del Habla y la Voz',
    description: 'Sesiones de 10, 20 o 30 minutos repartidas en bloques, con temporizador y con cada herramienta enlazada donde toca.',
    url: 'https://meskeia.com/rutina-practica-habla/',
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
    title: 'Rutina Guiada de Práctica del Habla y la Voz',
    description: 'Practica fluidez, voz, articulación o lectura en voz alta con una sesión organizada por bloques.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Rutina Guiada de Práctica del Habla meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Rutina Guiada de Práctica del Habla y la Voz',
  description: 'Organiza una sesión de práctica del habla en bloques temporizados según el área elegida (fluidez, voz y proyección, articulación o lectura en voz alta) y los minutos disponibles. Cada bloque enlaza la herramienta correspondiente con sus ajustes. Incluye un contador de sesiones que se guarda solo en el navegador de quien practica.',
  url: 'https://meskeia.com/rutina-practica-habla/',
  category: 'EducationalApplication',
  features: [
    'Cuatro áreas de práctica: fluidez, voz y proyección, articulación y lectura en voz alta',
    'Sesiones de 10, 20 o 30 minutos repartidas automáticamente en bloques',
    'Temporizador por bloque con aviso sonoro opcional al cambiar',
    'Cada bloque enlaza la herramienta meskeIA que lo soporta con sus ajustes sugeridos',
    'Contador de sesiones, minutos y racha guardado solo en el navegador',
    'Sin nombres, sin cuentas y sin envío de datos a ningún servidor',
    'Pensado para practicar por cuenta propia o como guion de sesión acompañada',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo conviene practicar el habla en cada sesión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No hay una cifra que valga para todo el mundo: depende del motivo por el que se practica y de la indicación profesional que se tenga, si la hay. Lo que sí sostiene el hábito es la regularidad frente a la duración, por eso la rutina ofrece sesiones cortas de 10 minutos además de las de 20 y 30. Si aparece molestia, tensión o cansancio en la garganta, lo indicado es parar, no terminar la sesión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sustituye esta rutina a la logopedia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Es un organizador de la práctica, no un tratamiento ni un programa terapéutico: reparte el tiempo en bloques y abre en cada uno la herramienta que corresponde, pero no evalúa, no diagnostica y no adapta nada al caso concreto. Quien tiene un diagnóstico o está en tratamiento debe seguir la pauta que le marque su logopeda, que es quien puede decidir qué ejercicios convienen y cuáles no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué se guarda y dónde se guarda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solo tres cifras anónimas —número de sesiones, minutos acumulados y días seguidos— y se guardan en el almacenamiento local del propio navegador. No hay nombres, ni cuentas, ni ficheros, ni envío a ningún servidor: si se borran los datos de navegación o se cambia de dispositivo, ese contador desaparece. Existe además un botón para borrarlo en cualquier momento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede un logopeda usarla en consulta o recomendarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puede usarla como guion para ordenar el tiempo de una sesión o recomendarla para la práctica entre citas, sin instalar nada ni crear cuentas para el paciente. Conviene indicar qué área trabajar y qué bloques omitir, porque la rutina es genérica por diseño: no conoce el caso ni puede adaptarse a él. Al no recoger ningún dato personal, tampoco genera obligaciones de tratamiento de datos de salud.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre practicar la fluidez y practicar la articulación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fluidez tiene que ver con el flujo del habla: los bloqueos, las repeticiones y el ritmo con el que salen las palabras. La articulación tiene que ver con la precisión de cada sonido: que las sílabas y los finales de palabra se entiendan. Son cosas distintas y se trabajan con herramientas distintas, por eso la rutina las separa en áreas: la fluidez se apoya en el ritmo y en oír la propia voz, mientras que la articulación trabaja sílaba a sílaba.',
      },
    },
  ],
};
