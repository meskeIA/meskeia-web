import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Enlaces UTM - Trackea tus Campañas | meskeIA',
  description: 'Genera enlaces UTM para Google Analytics. Crea URLs con parámetros utm_source, utm_medium, utm_campaign para medir el ROI de tus campañas de marketing.',
  keywords: 'utm, enlaces utm, google analytics, tracking, utm_source, utm_medium, utm_campaign, marketing digital, roi',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Enlaces UTM',
    description: 'Genera enlaces UTM para trackear tus campañas de marketing en Google Analytics.',
    url: 'https://meskeia.com/generador-utm/',
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
    title: 'Generador de Enlaces UTM',
    description: 'Crea URLs con parámetros UTM para analytics.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Enlaces UTM",
  description: "Genera enlaces UTM para Google Analytics. Crea URLs con parámetros utm_source, utm_medium, utm_campaign para medir el ROI de tus campañas de marketing.",
  url: "https://meskeia.com/generador-utm/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los parámetros UTM y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los parámetros UTM (Urchin Tracking Module) son etiquetas que se añaden al final de una URL para identificar el origen del tráfico en herramientas de analítica como Google Analytics. Permiten saber desde qué canal, campaña o anuncio llegan los usuarios a tu sitio web. Existen cinco parámetros estándar: utm_source, utm_medium, utm_campaign, utm_term y utm_content.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se crea un enlace UTM correctamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se añaden los parámetros al final de la URL de destino usando el símbolo ? antes del primer parámetro y & para separar los siguientes. Por ejemplo: https://ejemplo.com/?utm_source=newsletter&utm_medium=email&utm_campaign=oferta-mayo. Es recomendable usar minúsculas y guiones en lugar de espacios para evitar problemas de seguimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre utm_source y utm_medium?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'utm_source identifica el origen específico del tráfico (por ejemplo: google, facebook, newsletter). utm_medium indica el tipo de canal o medio de marketing (por ejemplo: cpc, email, social, organic). Juntos forman una jerarquía: el medio es el tipo de canal y la fuente es la plataforma concreta dentro de ese canal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los parámetros UTM afectan al posicionamiento SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No directamente. Los parámetros UTM son ignorados por los algoritmos de posicionamiento de Google cuando se usan correctamente. Sin embargo, si Google indexa URLs con UTM, puede generar contenido duplicado. Para evitarlo se recomienda añadir la URL canónica sin UTM mediante la etiqueta <link rel="canonical"> en el HTML de la página de destino.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar UTM en campañas de redes sociales además de Google Ads?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los parámetros UTM son independientes de la plataforma y funcionan con cualquier herramienta de analítica web. Se pueden usar en publicaciones de Instagram, Facebook Ads, LinkedIn, correos electrónicos, QR codes, colaboraciones con influencers o cualquier canal desde el que lleguen usuarios a tu sitio. El requisito es tener instalado Google Analytics u otra herramienta que los procese.',
      },
    },
  ],
};
