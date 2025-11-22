// Configuración centralizada de metadata para SEO
import { Metadata } from 'next';

// Configuración base del sitio
export const siteConfig = {
  name: 'meskeIA',
  title: 'meskeIA - Herramientas Web Gratuitas con Inteligencia Artificial',
  description:
    'Descubre 85+ herramientas web gratuitas potenciadas por IA: calculadoras avanzadas, conversores, generadores, juegos educativos y utilidades para mejorar tu productividad. Todo en español y sin registro.',
  url: 'https://meskeia.com',
  ogImage: 'https://meskeia.com/og-image.png',
  author: 'meskeIA',
  keywords: [
    'herramientas online',
    'calculadoras gratis',
    'inteligencia artificial',
    'utilidades web',
    'conversores online',
    'generadores',
    'herramientas educativas',
    'productividad',
    'español',
    'sin registro',
  ],
  locale: 'es_ES',
  type: 'website',
};

// Generar metadata base
export function generateBaseMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: '@meskeia',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'google-site-verification-code', // TODO: Añadir código real
    },
    ...overrides,
  };
}

// Metadata para la página de inicio
export function generateHomeMetadata(): Metadata {
  return generateBaseMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
  });
}

// Metadata para páginas de guías
export function generateGuideMetadata(guideTitle: string, guideSlug: string, category: string): Metadata {
  const title = `Guía: ${guideTitle}`;
  const description = `Aprende a usar ${guideTitle} con nuestra guía completa. Tutoriales paso a paso, ejemplos prácticos, casos de uso reales y mejores prácticas. 100% gratis y en español.`;
  const url = `${siteConfig.url}/guias/${category}/${guideSlug}`;

  return generateBaseMetadata({
    title,
    description,
    keywords: [
      ...siteConfig.keywords,
      guideTitle,
      'tutorial',
      'guía',
      'cómo usar',
      'paso a paso',
      category,
    ],
    openGraph: {
      type: 'article',
      locale: siteConfig.locale,
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: guideTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
      creator: '@meskeia',
    },
  });
}

// Metadata para la página de todas las guías
export function generateGuidesIndexMetadata(totalGuides: number): Metadata {
  const title = 'Guías Educativas - Tutoriales Completos';
  const description = `Explora ${totalGuides} guías educativas completas con tutoriales paso a paso, ejemplos prácticos y mejores prácticas. Aprende a usar todas nuestras herramientas de forma efectiva.`;

  return generateBaseMetadata({
    title,
    description,
    keywords: [
      ...siteConfig.keywords,
      'guías educativas',
      'tutoriales',
      'aprender',
      'formación',
      'documentación',
    ],
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: `${siteConfig.url}/guias`,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: 'Guías Educativas meskeIA',
        },
      ],
    },
  });
}

// Metadata para páginas legales
export function generateLegalMetadata(
  pageTitle: string,
  pageDescription: string,
  slug: string
): Metadata {
  const title = pageTitle;
  const url = `${siteConfig.url}/${slug}`;

  return generateBaseMetadata({
    title,
    description: pageDescription,
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url,
      title,
      description: pageDescription,
      siteName: siteConfig.name,
    },
    robots: {
      index: true,
      follow: true,
    },
  });
}

// Metadata para página de herramientas
export function generateToolsMetadata(): Metadata {
  const title = 'Catálogo Completo de Herramientas';
  const description =
    'Explora nuestro catálogo completo de 85+ herramientas web gratuitas organizadas por categorías: calculadoras, conversores, generadores, juegos educativos y más. Todo en español.';

  return generateBaseMetadata({
    title,
    description,
    keywords: [
      ...siteConfig.keywords,
      'catálogo',
      'herramientas completas',
      'lista de herramientas',
      'categorías',
    ],
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: `${siteConfig.url}/herramientas`,
      title,
      description,
      siteName: siteConfig.name,
    },
  });
}
