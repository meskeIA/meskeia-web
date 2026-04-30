import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-crispr-cas9';
const TITLE = 'CRISPR-Cas9: Edición Génica Paso a Paso';
const DESCRIPTION =
  'Visualiza el mecanismo completo de CRISPR-Cas9: ARN guía, búsqueda del PAM, corte de doble hebra, reparación por NHEJ o HDR, aplicaciones terapéuticas y el debate bioético.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
  },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Mecanismo CRISPR-Cas9 paso a paso con animación SVG',
      'Comparativa NHEJ vs HDR con tabla interactiva',
      'Aplicaciones terapéuticas aprobadas y en ensayos clínicos',
      'Debate bioético estructurado: caso He Jiankui y líneas rojas',
    ],
    category: 'EducationalApplication',
  });
}
