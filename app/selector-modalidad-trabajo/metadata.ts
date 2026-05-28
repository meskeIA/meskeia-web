import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Modalidad de Trabajo | ¿Presencial, Remoto o Híbrido? | meskeIA',
  description: 'Test de 10 preguntas para saber qué modalidad de trabajo se adapta mejor a tu perfil: presencial en oficina, teletrabajo total, modelo híbrido, coworking o nómada digital.',
  keywords: ['presencial o teletrabajo', 'trabajo remoto o híbrido', 'teletrabajo total España', 'nómada digital', 'coworking o oficina', 'modalidad de trabajo según perfil', 'trabajo desde casa o oficina', 'híbrido teletrabajo empresa', 'ventajas teletrabajo España', 'qué modalidad trabajo elegir'],
  openGraph: {
    title: 'Selector de Modalidad de Trabajo — ¿Presencial, Remoto o Híbrido?',
    description: 'Descubre qué modalidad de trabajo se adapta mejor a tu perfil en 10 preguntas.',
    url: 'https://meskeia.com/selector-modalidad-trabajo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
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
  name: "Selector de Modalidad de Trabajo",
  description: "Test de 10 preguntas para saber qué modalidad de trabajo se adapta mejor a tu perfil: presencial en oficina, teletrabajo total, modelo híbrido, coworking o nómada digital.",
  url: "https://meskeia.com/selector-modalidad-trabajo/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre trabajo remoto, híbrido y presencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El trabajo presencial implica acudir físicamente a la oficina todos los días. El teletrabajo total o trabajo remoto se realiza íntegramente desde casa u otro lugar fuera de las instalaciones de la empresa. El modelo híbrido combina ambos, con una distribución de días acordada entre la empresa y el empleado, habitualmente entre dos y tres días en oficina por semana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las ventajas del teletrabajo frente al trabajo en oficina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El teletrabajo elimina el tiempo y el coste del desplazamiento, permite mayor flexibilidad en la organización de la jornada y facilita la conciliación familiar. Sin embargo, puede dificultar la desconexión digital, el trabajo colaborativo en tiempo real y el acceso a espacios de trabajo adecuados si no se dispone de un lugar habilitado en casa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué perfil de trabajador se adapta mejor al modelo híbrido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo híbrido encaja bien con perfiles que necesitan colaboración presencial periódica pero también requieren concentración para tareas de mayor profundidad. Es especialmente valorado por empleados con responsabilidades de equipo que deben combinar reuniones presenciales con trabajo autónomo. También resulta adecuado para quienes viven lejos de la oficina pero no quieren renunciar al contacto con los compañeros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el coworking y en qué se diferencia del teletrabajo desde casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coworking es un espacio de trabajo compartido fuera de la empresa donde distintos profesionales trabajan de forma independiente. A diferencia del teletrabajo en casa, ofrece un entorno profesional con red estable, zonas de reunión y separación física entre vida personal y laboral. Es una opción habitual entre autónomos, freelances y trabajadores remotos que prefieren no trabajar en casa de forma continuada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un nómada digital y qué requisitos suele necesitar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un nómada digital es un trabajador que realiza su actividad de forma completamente remota y cambia con frecuencia su lugar de residencia o trabajo, a menudo viajando entre países. Requiere una conexión a internet estable, trabajo 100 % digitalizable, independencia de horario o flexibilidad de zona horaria y, en muchos casos, una estructura jurídica adecuada para facturar desde el extranjero. Desde 2023 España dispone de un visado específico para nómadas digitales.',
      },
    },
  ],
};
