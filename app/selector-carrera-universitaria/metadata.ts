import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Carrera Universitaria — ¿Qué estudios te convienen? | meskeIA',
  description: 'Test de 10 preguntas para saber qué rama de estudios universitarios se adapta mejor a tu perfil: ciencias/ingeniería, salud, humanidades/sociales, tecnología/informática o arte/diseño. Sin mencionar universidades concretas.',
  keywords: [
    'qué estudiar en la universidad',
    'carrera universitaria según perfil',
    'ingeniería o informática',
    'medicina o ciencias de la salud',
    'humanidades o ciencias sociales',
    'diseño o bellas artes',
    'qué carrera elegir España',
    'orientación universitaria',
    'estudios con más salidas laborales',
    'qué estudiar según vocación',
  ],
  openGraph: {
    title: '¿Qué carrera universitaria te conviene? Test orientativo | meskeIA',
    description: 'Descubre qué rama de estudios se adapta mejor a tu perfil, habilidades y objetivos profesionales.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-carrera-universitaria/',
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
    title: '¿Qué carrera estudiar? Test orientativo | meskeIA',
    description: 'Test de 10 preguntas para elegir entre ciencias, salud, humanidades, tecnología o arte.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-carrera-universitaria/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Carrera Universitaria',
        description:
          'Test orientativo para descubrir qué rama universitaria (ciencias/ingeniería, salud, humanidades, tecnología o arte/diseño) se adapta mejor al perfil y vocación.',
        url: 'https://meskeia.com/selector-carrera-universitaria/',
        features: [
          'Test de 10 preguntas sobre habilidades y vocación',
          '5 ramas: ciencias/ingeniería, salud, humanidades/sociales, tecnología, arte/diseño',
          'Análisis de habilidades, intereses y salidas laborales',
          'Orientación sin mencionar universidades concretas',
          '100% en el navegador, gratuito, en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Carrera Universitaria",
  description: "Test de 10 preguntas para saber qué rama de estudios universitarios se adapta mejor a tu perfil: ciencias/ingeniería, salud, humanidades/sociales, tecnología/informática o arte/diseño. Sin mencionar u",
  url: "https://meskeia.com/selector-carrera-universitaria/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo saber qué carrera universitaria estudiar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La elección de carrera depende de tres factores clave: tus habilidades naturales, tus intereses y las salidas laborales de cada rama. Un test orientativo de 10 preguntas sobre estas dimensiones puede darte una primera dirección objetiva. Es recomendable complementarlo con información sobre el mercado laboral y, si es posible, con charlas con profesionales del sector.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué carrera tiene más salidas laborales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las ramas de tecnología e informática y ciencias de la salud lideran consistentemente las listas de empleabilidad en los últimos años, con tasas de paro inferiores al 5%. Sin embargo, la salida laboral también depende del país, la especialidad concreta y las competencias adquiridas durante los estudios, no solo del título.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un test de orientación universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de educación secundaria o bachillerato que están a punto de elegir carrera, para jóvenes que han terminado un grado y quieren reorientarse, y para adultos que valoran un cambio de rumbo profesional. El test identifica qué rama de conocimiento se alinea mejor con tu perfil sin que necesites saber de antemano qué quieres estudiar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este test de un orientador vocacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un orientador vocacional es un profesional que trabaja de forma personalizada durante varias sesiones, con pruebas psicométricas y entrevistas en profundidad. Un test online es una herramienta de autoconocimiento rápida y gratuita que señala tendencias generales. Ambos son complementarios: el test puede ser un buen punto de partida antes de consultar con un orientador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ramas universitarias evalúa el test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test cubre cinco grandes ramas: ciencias e ingeniería (matemáticas, física, química, ingenierías), ciencias de la salud (medicina, enfermería, farmacia, fisioterapia), humanidades y ciencias sociales (derecho, psicología, historia, economía), tecnología e informática (desarrollo de software, ciberseguridad, inteligencia artificial) y arte y diseño (arquitectura, diseño gráfico, bellas artes).',
      },
    },
  ],
};
