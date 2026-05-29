import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Habilidades vs Mercado - ¿Lo que sabes es lo que se necesita? | meskeIA',
  description: 'Descubre si tus habilidades profesionales están alineadas con lo que el mercado demanda. Test de 10 preguntas sobre relevancia y actualización de competencias. Gratuito y sin registro.',
  keywords: 'habilidades vs mercado, gap analysis profesional, competencias laborales, actualización profesional, demanda laboral, skills gap, empleabilidad, formación continua, mercado laboral, obsolescencia profesional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Habilidades vs Mercado | meskeIA',
    description: '¿Lo que sabes hacer es lo que el mercado necesita? Test interactivo de gap analysis profesional.',
    url: 'https://meskeia.com/auditoria-habilidades-mercado/',
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
    title: 'Auditoría de Habilidades vs Mercado | meskeIA',
    description: '¿Tus competencias están al día? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Auditoría de Habilidades vs Mercado meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Habilidades vs Mercado',
  description: 'Herramienta interactiva de reflexión para evaluar si tus habilidades profesionales están alineadas con la demanda del mercado. Gap analysis profesional con 10 preguntas, resultado visual y acciones concretas.',
  url: 'https://meskeia.com/auditoria-habilidades-mercado/',
  features: [
    'Test de 10 preguntas sobre tus competencias y el mercado',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en gap analysis profesional',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si mis habilidades profesionales están quedando obsoletas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Señales de obsolescencia profesional incluyen: dificultad para encontrar ofertas de trabajo que encajen con tu perfil actual, percepción de que las tecnologías o metodologías que dominas ya no aparecen en las descripciones de puestos relevantes, o que compañeros más jóvenes son más solicitados para ciertos proyectos. La velocidad de cambio varía mucho por sector: en tecnología, un conocimiento puede quedar desfasado en 2-3 años; en otros ámbitos el ciclo puede ser más largo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un gap analysis de competencias y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un gap analysis de competencias (análisis de brechas) es una metodología que compara las habilidades que posees actualmente con las que requiere el mercado o un rol objetivo. El resultado es un mapa de qué competencias hay que desarrollar, cuáles mantener y cuáles pueden tener menos relevancia futura. Es una herramienta de planificación de carrera muy utilizada en gestión del talento y en procesos de desarrollo profesional individual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es más útil hacer una auditoría de habilidades vs mercado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para profesionales con 5 o más años de experiencia que sienten que su perfil ha dejado de evolucionar, para personas en proceso de cambio de sector o rol, y para quienes vuelven al mercado laboral tras un periodo de inactividad. También es valioso para cualquiera que quiera tomar decisiones de formación basadas en demanda real y no solo en interés personal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre habilidades duras y habilidades blandas en el mercado laboral actual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las habilidades duras (hard skills) son competencias técnicas medibles: programar en Python, gestionar un presupuesto, hablar inglés a nivel C1. Las habilidades blandas (soft skills) son capacidades relacionales y cognitivas: comunicación, adaptabilidad, pensamiento crítico. Aunque históricamente las habilidades técnicas determinaban la empleabilidad, estudios recientes de empresas como LinkedIn y el World Economic Forum señalan que las soft skills son cada vez más diferenciadoras, especialmente en puestos donde la automatización sustituye tareas rutinarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva normalmente cerrar una brecha de habilidades relevante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la brecha y del punto de partida. Actualizar una competencia técnica ya conocida (por ejemplo, aprender una versión nueva de un framework que ya usas) puede llevar semanas. Adquirir una habilidad nueva desde cero —como aprender análisis de datos siendo profesional de marketing— puede llevar entre 6 meses y 2 años de práctica sostenida, dependiendo de la intensidad de la formación y de las oportunidades de aplicación real. La constancia en pequeñas sesiones de aprendizaje diario supera en efectividad a los cursos intensivos sin continuidad.',
      },
    },
  ],
};
