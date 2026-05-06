import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador SMI 2026 — Neto, Atrasos y Comparativa Provincial | meskeIA',
  description: 'Calcula tu sueldo neto con el SMI 2026 (1.221 €/mes × 14 pagas), los atrasos retroactivos desde enero y compara el SMI con el salario medio de tu provincia.',
  keywords: 'SMI 2026, salario mínimo interprofesional, SMI neto, atrasos SMI, SMI por provincia, 1221 euros, salario mínimo España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador SMI 2026 — Neto, atrasos y comparativa provincial',
    description: 'SMI 2026: 1.221 €/mes. Calcula tu neto, los atrasos retroactivos y compara con el sueldo medio de tu provincia.',
    url: 'https://meskeia.com/estimador-smi',
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
    title: 'Estimador SMI 2026 — ¿Cuánto cobras neto?',
    description: 'Calcula tu neto con el nuevo SMI, los atrasos retroactivos y compara con tu provincia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador SMI meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimador SMI 2026',
  description: 'Herramienta completa del Salario Mínimo Interprofesional 2026 en España. Calcula tu sueldo neto mensual con el SMI (1.221 € × 14 pagas), estima los atrasos retroactivos desde enero y compara el SMI con el salario medio de las 52 provincias españolas.',
  url: 'https://meskeia.com/estimador-smi/',
  features: [
    'Cálculo de sueldo neto con SMI 2026 (IRPF + Seguridad Social)',
    'Estimación de atrasos retroactivos (SMI 2026 vs SMI 2025)',
    'Comparativa SMI vs salario medio en las 52 provincias',
    'Datos oficiales: BOE RD 126/2026 + AEAT 2023',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
