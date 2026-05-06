import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Cambio de Régimen Autónomo — De Módulos a Estimación Directa | meskeIA',
  description: 'Checklist interactivo para autónomos que quieren cambiar del régimen de módulos (estimación objetiva) a estimación directa simplificada. Plazos, modelos y pasos legales en España 2025.',
  keywords: 'cambio módulos estimación directa, renunciar módulos IRPF, modelo 036 renuncia módulos, cuándo dejar módulos autónomo, estimación directa simplificada ventajas, checklist cambio régimen fiscal autónomo, plazo renuncia módulos noviembre',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Cambio de Régimen Autónomo — Módulos a Estimación Directa | meskeIA',
    description: 'Guía y checklist paso a paso para renunciar a módulos y cambiar a estimación directa simplificada. Plazos legales, modelo 036/037, obligaciones y consejos.',
    url: 'https://meskeia.com/checklist-cambio-regimen-autonomo/',
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
    title: 'Cambiar de Módulos a Estimación Directa — Checklist 2025 | meskeIA',
    description: 'Checklist interactivo para autónomos: pasos, plazos y modelos para cambiar de régimen fiscal en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Checklist Cambio Régimen Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist Cambio de Régimen Autónomo — Módulos a Estimación Directa',
  description: 'Checklist interactivo para autónomos que quieren cambiar del régimen de estimación objetiva (módulos) a estimación directa simplificada o normal en España. Incluye evaluación previa, gestión de la renuncia y adaptación al nuevo régimen, con plazos, modelos fiscales y obligaciones legales.',
  url: 'https://meskeia.com/checklist-cambio-regimen-autonomo/',
  features: [
    'Checklist en 3 fases: evaluar, renunciar y adaptarse',
    'Orientador: ¿cuándo conviene el cambio?',
    'Plazos legales actualizados (noviembre-diciembre)',
    'Modelos 036/037, 130 y 303',
    'Progreso guardado en sessionStorage',
    'Tabla comparativa de regímenes fiscales',
    'Gratuito y sin registro',
    'Disponible en español',
  ],
});
