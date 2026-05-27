import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Gastos Deducibles Autónomos - Ahorro IRPF e IVA | meskeIA',
  description: 'Calcula tu ahorro fiscal con gastos deducibles como autónomo. Descubre qué puedes deducir (100%, 50%, 30%) y optimiza tu declaración de IRPF e IVA. Actualizado 2025.',
  keywords: 'gastos deducibles, autonomo, irpf, iva, ahorro fiscal, deduccion, hacienda, autonomos españa, impuestos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Gastos Deducibles Autónomos | meskeIA',
    description: 'Descubre qué gastos puedes deducir como autónomo y calcula tu ahorro fiscal real en IRPF e IVA.',
    url: 'https://meskeia.com/orientador-gastos-deducibles/',
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
    title: 'Orientador Gastos Deducibles Autónomos | meskeIA',
    description: 'Herramienta gratuita para calcular el ahorro fiscal de autónomos con gastos deducibles.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador de Gastos Deducibles",
  description: "Calcula tu ahorro fiscal con gastos deducibles como autónomo. Descubre qué puedes deducir (100%, 50%, 30%) y optimiza tu declaración de IRPF e IVA. Actualizado 2025.",
  url: "https://meskeia.com/orientador-gastos-deducibles/",
  category: 'FinanceApplication',
  features: [],
});
