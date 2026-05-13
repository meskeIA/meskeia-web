import { Metadata } from 'next';

const title = 'Verificador del Complemento por Brecha de Género 2026 — ¿Te corresponde? | meskeIA';
const description = 'Comprueba si tienes derecho al complemento por brecha de género en tu pensión. 36,90 €/mes por hijo en 2026 (máximo 4). Incluye los cambios tras la sentencia TJUE 2025 que iguala el trato a hombres y mujeres.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'complemento brecha género 2026, complemento maternidad pensión, art 60 LGSS, sentencia TJUE complemento, reclamación complemento hombres, pensión jubilación viudedad complemento, 36.90 euros hijo pensión',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Verificador del Complemento por Brecha de Género 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/verificador-complemento-brecha-genero/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verificador del Complemento por Brecha de Género 2026 | meskeIA',
    description: '5 preguntas para saber si te corresponde el complemento de 36,90 €/mes por hijo en tu pensión.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Verificador Complemento Brecha de Género meskeIA',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Verificador del Complemento por Brecha de Género 2026',
  description,
  url: 'https://meskeia.com/verificador-complemento-brecha-genero/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
  featureList: [
    'Checklist de 5 preguntas alineadas con el art. 60 LGSS',
    'Cálculo del importe mensual y anual (36,90 €/hijo, máx. 4)',
    'Considera la doctrina TJUE 2025 e igualdad de trato H/M',
    'Detecta casos de reclamación retroactiva (denegaciones previas)',
    'Datos normativos 2026 verificados con fuente oficial',
    'Sin registro, gratuito y 100% en el navegador',
  ],
};
