import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Declaración de la Renta 2026 — Documentos y Fechas | meskeIA',
  description: 'Lista de documentos para hacer la renta 2025 (ejercicio 2024). Adaptada a tu perfil: asalariado, autónomo, pensionista, inversor o arrendador. Fechas clave, deducciones y guía paso a paso.',
  keywords: 'checklist declaración renta 2026, documentos renta 2025, qué documentos necesito para la renta, fechas declaración renta, deducciones irpf, borrador renta, renta web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Declaración de la Renta 2026 | meskeIA',
    description: 'Todos los documentos que necesitas para hacer la renta, organizados por perfil: asalariado, autónomo, pensionista, inversor y propietario.',
    url: 'https://meskeia.com/checklist-declaracion-renta/',
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
    title: 'Checklist Declaración Renta 2026 | meskeIA',
    description: 'Todos los documentos que necesitas para la renta, por perfil. Asalariado, autónomo, pensionista, inversor, arrendador.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Checklist Declaración de la Renta 2026",
  description: "Lista de documentos para hacer la renta 2025 (ejercicio 2024). Adaptada a tu perfil: asalariado, autónomo, pensionista, inversor o arrendador. Fechas clave, deducciones y guía paso a paso.",
  url: "https://meskeia.com/checklist-declaracion-renta/",
  category: 'FinanceApplication',
  features: [],
});
