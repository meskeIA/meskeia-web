import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Impacto de la IA en los Sectores - Automatización y Empleos | meskeIA',
  description: 'Visualiza cómo la IA transforma cada sector económico: empleos en riesgo de automatización, nuevos roles emergentes, timeline de adopción y habilidades del futuro.',
  keywords: ['impacto ia sectores', 'automatizacion empleo', 'empleos en riesgo ia', 'futuro trabajo ia', 'empleos emergentes ia', 'ia y trabajo', 'automatizacion laboral', 'habilidades futuro', 'ia industria'],
  openGraph: {
    title: 'Impacto de la IA en los Sectores | meskeIA',
    description: 'Automatización por sector, empleos en riesgo y emergentes, y el futuro del trabajo con IA.',
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
  name: "Impacto de la IA en los Sectores - Automatización y Empleos",
  description: "Visualiza cómo la IA transforma cada sector económico: empleos en riesgo de automatización, nuevos roles emergentes, timeline de adopción y habilidades del futuro.",
  url: "https://meskeia.com/visualizador-impacto-ia-sectores/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué empleos tienen mayor riesgo de automatización por la IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los empleos con mayor riesgo de automatización son aquellos que implican tareas rutinarias, repetitivas y bien definidas. Según estudios de Oxford, McKinsey y el Foro Económico Mundial, los sectores más expuestos incluyen el transporte y logística (conductores, repartidores), la manufactura básica, el procesamiento de datos administrativos, la atención al cliente mediante formularios y el trabajo contable rutinario. En cambio, los roles que combinan creatividad, empatía o juicio complejo tienen menor riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué nuevos empleos crea la inteligencia artificial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La IA genera nuevos roles que no existían hace una década: ingenieros de prompts, especialistas en ética de IA, entrenadores de modelos, auditores de algoritmos y gestores de datos de entrenamiento. También amplía la demanda de perfiles híbridos que combinan conocimiento de dominio con competencias digitales, como médicos que interpretan diagnósticos de IA o abogados especializados en regulación tecnológica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sectores económicos se verán más afectados por la IA en los próximos años?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sectores con mayor transformación prevista para 2025-2030 son: servicios financieros (análisis de riesgo, trading, atención al cliente), salud (diagnóstico por imagen, drug discovery, gestión clínica), educación (tutorías personalizadas), medios y publicidad (generación de contenidos) y transporte (conducción autónoma). Los sectores con alta componente artesanal, cuidados personales y construcción compleja tienen una adopción más lenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué habilidades serán más valoradas en el mercado laboral con la IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Foro Económico Mundial y LinkedIn identifican como habilidades clave para 2030 el pensamiento crítico y la resolución de problemas complejos, la inteligencia emocional y la capacidad de colaboración, la alfabetización en datos e IA (no necesariamente programar, sino entender cómo funcionan los modelos y sus limitaciones), la creatividad aplicada y la adaptabilidad ante el cambio tecnológico continuo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La IA destruirá más empleos de los que crea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las estimaciones varían según la metodología. El Foro Económico Mundial estima que para 2025 la IA y la automatización desplazarán 85 millones de puestos pero crearán 97 millones nuevos, con un saldo neto positivo. Sin embargo, la transición no es inmediata ni geográficamente uniforme: los trabajadores en empleos rutinarios de regiones con menor reconversión industrial son quienes afrontan mayor incertidumbre en el corto plazo.',
      },
    },
  ],
};
