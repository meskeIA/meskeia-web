import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Pre-Mortem - ¿Por qué podría fallar tu proyecto? | meskeIA',
  description: 'Evalúa si anticipas riesgos y actúas sobre ellos antes de lanzar un proyecto. Test de 10 preguntas basado en el análisis pre-mortem de Gary Klein. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'pre-mortem, Gary Klein, análisis de riesgos, gestión de proyectos, anticipar fallos, plan B, mitigación riesgos, lanzamiento proyecto, prevención fallos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Pre-Mortem | meskeIA',
    description: 'Antes de lanzar algo: ¿por qué podría fallar? Test interactivo basado en Gary Klein.',
    url: 'https://meskeia.com/checklist-pre-mortem/',
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
    title: 'Checklist Pre-Mortem | meskeIA',
    description: '¿Anticipas riesgos o confías en que todo saldrá bien? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Checklist Pre-Mortem meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist Pre-Mortem',
  description: 'Herramienta interactiva de reflexión basada en el análisis pre-mortem de Gary Klein. 10 preguntas para evaluar si anticipas riesgos y actúas sobre ellos antes de lanzar un proyecto. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/checklist-pre-mortem/',
  features: [
    'Test de 10 preguntas sobre cómo gestionas riesgos antes de lanzar',
    'Diagnóstico visual con mapa bidimensional',
    'Basado en el análisis pre-mortem de Gary Klein',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar la anticipación de fallos',
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
      name: '¿Qué es un análisis pre-mortem y en qué se diferencia de un post-mortem?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un post-mortem analiza por qué algo falló después de que ocurrió. Un pre-mortem hace lo mismo antes de que el proyecto empiece: imagina que el proyecto ha fracasado y trabaja hacia atrás para identificar las causas probables. La técnica fue propuesta por el psicólogo Gary Klein y reduce el sesgo de optimismo que lleva a subestimar riesgos antes de lanzar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se realiza un pre-mortem paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte de un supuesto: "Imaginemos que han pasado seis meses y el proyecto ha fracasado por completo. ¿Qué salió mal?". Cada participante escribe individualmente las razones de ese fracaso imaginado, se ponen en común y se priorizan. Después se diseñan medidas de mitigación para los riesgos más probables. El proceso puede hacerse en solitario o en equipo y suele durar entre 30 y 90 minutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de proyectos es útil el análisis pre-mortem?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es aplicable a cualquier proyecto con consecuencias relevantes si falla: lanzamiento de un producto, cambio de empleo, apertura de negocio, gran inversión, mudanza o decisión personal con impacto duradero. No está pensado para tareas rutinarias de bajo riesgo. Cuanto mayor sea la inversión de tiempo o recursos, más rentable resulta dedicar 30 minutos a anticipar fallos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los equipos suelen saltarse el análisis de riesgos antes de lanzar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La causa principal es el sesgo de optimismo: tendemos a sobrevalorar la probabilidad de éxito y a infravalorar los obstáculos, especialmente cuando estamos emocionalmente comprometidos con la idea. También influyen la presión de tiempo, el pensamiento de grupo (groupthink) y la cultura que penaliza señalar problemas. El pre-mortem reduce ese sesgo al dar permiso explícito para imaginar el peor escenario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un análisis de riesgos tradicional y un pre-mortem?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El análisis de riesgos tradicional lista amenazas en abstracto y asigna probabilidades. El pre-mortem parte de un fracaso ya asumido como real, lo que activa otro tipo de razonamiento: en lugar de evaluar posibilidades, buscamos causas concretas de algo que "ya pasó". Esa diferencia de enfoque genera una lista de riesgos más variada y más honesta, según los estudios de Klein.',
      },
    },
  ],
};
