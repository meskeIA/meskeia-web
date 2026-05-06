import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Curso de Marketing Digital 2025 - Estrategias que Funcionan | meskeIA',
  description: 'Aprende marketing digital desde cero: branding, SEO, redes sociales, publicidad online, automatización e IA. 30 capítulos prácticos con ejemplos reales.',
  keywords: 'marketing digital, curso marketing, seo, redes sociales, publicidad online, branding, customer centricity, meta ads, google ads, email marketing, automatizacion, ia marketing',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Marketing Digital 2025 - meskeIA',
    description: 'Domina el marketing digital: desde fundamentos hasta IA y automatización. 30 capítulos prácticos.',
    url: 'https://meskeia.com/curso-marketing-digital/',
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
    title: 'Curso de Marketing Digital 2025',
    description: 'Aprende marketing digital con estrategias actualizadas a 2025. Curso gratuito de meskeIA.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Marketing Digital 2025 - Estrategias que Funcionan",
  description: "Aprende marketing digital desde cero: branding, SEO, redes sociales, publicidad online, automatización e IA. 30 capítulos prácticos con ejemplos reales.",
  url: 'https://meskeia.com/curso-marketing-digital/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
