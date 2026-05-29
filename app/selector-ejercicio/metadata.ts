import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Ejercicio — ¿Qué deporte te conviene? | meskeIA',
  description: 'Test de 10 preguntas para descubrir qué tipo de ejercicio o deporte se adapta mejor a tus objetivos, disponibilidad, presupuesto y condición física actual.',
  keywords: [
    'qué deporte hacer',
    'selector ejercicio',
    'qué ejercicio me conviene',
    'deporte para mi estilo de vida',
    'gimnasio o running',
    'ejercicio para perder peso',
    'deporte principiantes España',
    'actividad física recomendada',
    'qué deporte empezar',
    'ejercicio según condición física',
  ],
  openGraph: {
    title: '¿Qué ejercicio te conviene? Test en 10 preguntas | meskeIA',
    description: 'Encuentra el deporte que encaja con tu cuerpo, tu tiempo y tu motivación. Objetivos, presupuesto, condición física y mucho más.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-ejercicio/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué deporte te conviene? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para encontrar el ejercicio que más encaja contigo según objetivos, tiempo disponible y condición física.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-ejercicio/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Ejercicio',
      description: 'Test orientativo para descubrir qué tipo de ejercicio o deporte se adapta mejor al perfil, objetivos, disponibilidad y condición física del usuario.',
      url: 'https://meskeia.com/selector-ejercicio/',
      features: [
        'Test de 10 preguntas sobre perfil deportivo',
        '6 tipos de ejercicio analizados',
        'Consideración de limitaciones físicas',
        'Análisis de presupuesto y disponibilidad',
        'Plan orientativo de inicio',
        '100% en el navegador, sin registro',
        'Gratuito y sin publicidad',
        'En español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Ejercicio",
  description: "Test de 10 preguntas para descubrir qué tipo de ejercicio o deporte se adapta mejor a tus objetivos, disponibilidad, presupuesto y condición física actual.",
  url: "https://meskeia.com/selector-ejercicio/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué ejercicio me conviene si soy principiante y tengo poco tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para principiantes con agenda ajustada, las actividades de baja complejidad técnica y alta eficiencia son las más adecuadas: caminar rápido, ciclismo o entrenamientos HIIT de 20-30 minutos. Lo más importante es la constancia; incluso 3 sesiones semanales de 30 minutos producen mejoras cardiovasculares y de fuerza en pocas semanas. Elegir una actividad que encaje con tu horario real reduce el riesgo de abandono.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre entrenamiento en gimnasio y ejercicio al aire libre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El gimnasio ofrece equipamiento específico, climatización y posibilidad de trabajo con pesas, lo que facilita la progresión en fuerza muscular. El ejercicio al aire libre (running, ciclismo, senderismo) añade beneficios psicológicos del contacto con la naturaleza, mayor variedad de terrenos y coste reducido. La elección depende del objetivo principal: hipertrofia muscular → gimnasio; bienestar general, resistencia cardiovascular o bajo presupuesto → exterior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué deporte es mejor para perder peso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un único deporte "mejor" para perder peso; lo que determina el resultado es el déficit calórico total y la adherencia al ejercicio. Actividades de alta intensidad (running, ciclismo, natación) queman más calorías por sesión, pero el entrenamiento de fuerza aumenta el metabolismo basal a largo plazo. La combinación de cardio y fuerza es la estrategia más eficaz según la evidencia, siempre acompañada de una alimentación adecuada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ejercicio puedo hacer si tengo problemas de rodilla o espalda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ante problemas articulares, las actividades de bajo impacto son las más seguras: natación, acuagym, ciclismo estático o yoga. Estas modalidades mantienen la movilidad y fortalecen la musculatura de soporte sin sobrecargar las articulaciones. Siempre es recomendable consultar con un fisioterapeuta o médico deportivo antes de iniciar cualquier programa si existen lesiones previas, para personalizar la carga y la progresión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia hay que hacer ejercicio para notar resultados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Organización Mundial de la Salud recomienda al menos 150-300 minutos semanales de actividad aeróbica moderada o 75-150 minutos de actividad intensa para adultos, combinados con 2 días de entrenamiento de fuerza. Para notar mejoras de resistencia se necesitan unas 4-6 semanas; los cambios de composición corporal son visibles a partir de las 8-12 semanas con constancia. La clave es distribuir las sesiones a lo largo de la semana y respetar el descanso entre entrenamientos.',
      },
    },
  ],
};
