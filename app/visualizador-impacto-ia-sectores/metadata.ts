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
