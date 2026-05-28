import { Metadata } from 'next';

const title = 'Orientador de Tipo de Oposición — ¿Qué oposición encaja contigo? | meskeIA';
const description = 'Test orientativo de 8 preguntas para descubrir qué tipo de oposición se adapta a tu perfil: nivel de estudios, ámbito preferido, disponibilidad de tiempo y objetivos profesionales.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'que oposicion hacer, orientador oposiciones, test oposicion perfil, elegir oposicion, tipos oposiciones españa, oposiciones por estudios, que opositar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Tipo de Oposición | meskeIA',
    description,
    url: 'https://meskeia.com/orientador-tipo-oposicion/',
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
    title: 'Orientador de Tipo de Oposición | meskeIA',
    description: 'Test: ¿qué tipo de oposición encaja con tu perfil?',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Orientador de Tipo de Oposición',
  description,
  url: 'https://meskeia.com/orientador-tipo-oposicion/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de oposiciones existen en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España las oposiciones se clasifican principalmente por administración (Estado, comunidades autónomas, corporaciones locales) y por grupo de titulación: A1 (grado universitario), A2 (diplomatura o grado de 3 años), C1 (bachillerato o equivalente) y C2 (graduado escolar o ESO). Existen cuerpos generalistas como la Administración General del Estado, Fuerzas y Cuerpos de Seguridad, docentes, sanitarios, judiciales y muchos cuerpos especiales con requisitos propios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo hay que estudiar para preparar una oposición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo varía enormemente según el cuerpo y el punto de partida del candidato. Oposiciones de grupo C1-C2 (auxiliar administrativo, policía local) pueden prepararse en 6-18 meses. Las de grupo A (inspectores, magistrados, registradores) suelen requerir entre 3 y 7 años de preparación intensiva. La dedicación diaria recomendada oscila entre 6 y 10 horas para preparaciones serias a tiempo completo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué oposición puedo hacer sin carrera universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con el título de Bachillerato o equivalente (grupo C1) puedes opositar a cuerpos como Agente de Policía Nacional, Guardia Civil, técnico de Hacienda (escala ejecutiva), suboficial de las Fuerzas Armadas o administrativo del Estado. Con la ESO o el graduado escolar (grupo C2) tienes acceso a plazas de auxiliar administrativo en todas las administraciones, operario o celador en instituciones penitenciarias y sanitarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre oposición libre y concurso-oposición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la oposición libre el acceso se basa exclusivamente en las pruebas teóricas y prácticas convocadas; no se valoran méritos previos. En el concurso-oposición se suman puntos por experiencia laboral previa, formación específica u otros méritos antes de las pruebas, o bien después de superarlas para ordenar la bolsa definitiva. Muchas plazas de interinidad y estabilización de empleo público utilizan el sistema de concurso-oposición.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena opositar o es mejor buscar empleo en la empresa privada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del perfil y las prioridades de cada persona. La función pública ofrece estabilidad laboral (puesto vitalicio una vez superado el período de prácticas), sueldo fijo con trienios, jornada predecible y conciliación facilitada. La empresa privada suele ofrecer mayor variedad de proyectos, progresión salarial más rápida y menor tiempo hasta el primer empleo. La decisión óptima depende de la tolerancia al riesgo, los años disponibles para preparación y el sector profesional.',
      },
    },
  ],
};
