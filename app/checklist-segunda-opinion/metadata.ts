import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist de Segunda Opinión - ¿Has buscado razones para NO hacerlo? | meskeIA',
  description: 'Antes de decidir: ¿has buscado activamente razones para NO hacerlo? Test de 10 preguntas sobre certeza y cuestionamiento basado en el principio de red team. Gratuito y sin registro.',
  keywords: 'segunda opinión, red team, abogado del diablo, cuestionar decisiones, certeza, pensamiento crítico, contraargumentos, decisiones mejores, sesgo confirmación, adversario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist de Segunda Opinión | meskeIA',
    description: '¿Has buscado razones para NO hacerlo? Test basado en el principio de red team.',
    url: 'https://meskeia.com/checklist-segunda-opinion/',
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
    title: 'Checklist de Segunda Opinión | meskeIA',
    description: '¿Cuestionas tus propias decisiones antes de actuar? Descúbrelo gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Checklist de Segunda Opinión meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist de Segunda Opinión',
  description: 'Herramienta interactiva de reflexión para evaluar si cuestionas suficientemente tus decisiones antes de actuar. Basado en el principio de red team y abogado del diablo.',
  url: 'https://meskeia.com/checklist-segunda-opinion/',
  features: [
    'Test de 10 preguntas sobre certeza y cuestionamiento',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el principio de red team (adversario)',
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
      name: '¿Qué es una segunda opinión en la toma de decisiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una segunda opinión en la toma de decisiones consiste en buscar activamente argumentos, evidencias o perspectivas que contradigan la opción que ya tenemos en mente. No se trata solo de consultar a otra persona, sino de construir intencionalmente el caso contrario antes de decidir, para reducir el sesgo de confirmación y mejorar la calidad de la decisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el checklist de segunda opinión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El checklist plantea 10 preguntas que cubren distintas dimensiones del cuestionamiento previo a una decisión: ¿has buscado datos que la contradigan?, ¿has consultado a alguien con opinión distinta a la tuya?, ¿has imaginado el peor escenario?, entre otras. Al final obtienes un perfil sobre tu nivel de certeza frente a tu nivel de cuestionamiento real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el principio de red team y cómo se aplica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El red team es una técnica de análisis de decisiones en la que un grupo (o individuo) asume el rol de adversario y trata de refutar o socavar el plan principal. Se usa en seguridad, estrategia militar y gestión empresarial para detectar puntos débiles antes de que los detecte la realidad. Aplicarlo de forma individual implica preguntarte: ¿qué haría alguien que quiere que esto falle?',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de decisiones es más útil este checklist?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil ante decisiones irreversibles o de alto coste: cambio de trabajo, inversión significativa, cierre de un contrato, adoptar una tecnología nueva, o cualquier elección donde el error tenga consecuencias duraderas. Para decisiones cotidianas de bajo riesgo, el nivel de cuestionamiento necesario es mucho menor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre ser prudente y caer en la parálisis por análisis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prudencia implica buscar información suficiente para tomar una decisión informada dentro de un plazo razonable. La parálisis por análisis ocurre cuando la búsqueda de certeza se convierte en un fin en sí mismo y bloquea la acción indefinidamente. Una señal práctica: si llevas más tiempo analizando que el plazo disponible para decidir, es probable que estés en parálisis.',
      },
    },
  ],
};
