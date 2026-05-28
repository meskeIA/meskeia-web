import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Turnos - Organiza Horarios de Trabajo | meskeIA',
  description: 'Planifica turnos de trabajo para tu equipo. Gestiona empleados, franjas horarias personalizables, disponibilidad y genera horarios automáticamente. Ideal para restaurantes, tiendas y pequeños negocios.',
  keywords: 'planificador turnos, horarios trabajo, cuadrante turnos, gestión empleados, turnos restaurante, horarios tienda, planificación laboral, turnos rotativos, calendario trabajo, asignación turnos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Turnos - Organiza Horarios de Trabajo',
    description: 'Planifica turnos de trabajo para tu equipo. Gestiona empleados, franjas horarias y genera horarios automáticamente.',
    url: 'https://meskeia.com/planificador-turnos/',
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
    title: 'Planificador de Turnos - meskeIA',
    description: 'Planifica turnos de trabajo para tu equipo. Gestiona empleados, franjas horarias y genera horarios automáticamente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador de Turnos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Turnos",
  description: "Planifica turnos de trabajo para tu equipo. Gestiona empleados, franjas horarias personalizables, disponibilidad y genera horarios automáticamente. Ideal para restaurantes, tiendas y pequeños negocios",
  url: "https://meskeia.com/planificador-turnos/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un planificador de turnos de trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un planificador de turnos de trabajo es una herramienta que permite organizar los horarios laborales de un equipo, asignando a cada empleado sus días y franjas horarias de manera visual y estructurada. Facilita la gestión de la disponibilidad, evita solapamientos y garantiza una cobertura equilibrada durante toda la semana o el período planificado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se hace un cuadrante de turnos para empleados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para hacer un cuadrante de turnos, primero define los empleados disponibles y las franjas horarias necesarias (mañana, tarde, noche, etc.). Luego asigna turnos respetando los descansos obligatorios, la disponibilidad de cada persona y las necesidades del negocio en cada día. Con un planificador digital, este proceso se automatiza: introduces los datos y el sistema sugiere o genera la distribución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de negocios es útil un planificador de turnos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil en sectores con horarios variables o cobertura continuada: restaurantes y hostelería, tiendas de retail, supermercados, clínicas y centros de salud, hoteles, centros de atención al cliente y cualquier pyme con turnos rotativos. También resulta práctico para autónomos que gestionan un pequeño equipo y necesitan organizar la semana sin software complejo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos días de descanso entre turnos exige la ley?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, el Estatuto de los Trabajadores establece un descanso mínimo de 12 horas entre jornadas y un descanso semanal de al menos día y medio ininterrumpido (generalmente sábado tarde y domingo, o equivalente). Para turnos nocturnos y otros casos específicos pueden aplicarse condiciones adicionales según convenio colectivo. Siempre conviene verificar el convenio del sector para cumplir los tiempos exactos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un planificador de turnos de una hoja de Excel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una hoja de Excel requiere configurar manualmente filas, fórmulas y colores para visualizar el cuadrante, y no avisa cuando hay conflictos de disponibilidad o turnos incompletos. Un planificador especializado ofrece una interfaz lista para usar, detecta automáticamente solapamientos o franjas sin cubrir, y permite exportar o compartir el horario con el equipo de forma directa, ahorrando tiempo y reduciendo errores.',
      },
    },
  ],
};
