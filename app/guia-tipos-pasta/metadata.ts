import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Pasta Italiana: 40 Formas y sus Nombres (Guía) | meskeIA',
  description:
    'Guía de referencia de 40 tipos de pasta: spaghetti, penne, fusilli, ravioli y más. Forma, región, tiempo de cocción y salsa ideal.',
  keywords: [
    'tipos de pasta',
    'pasta italiana',
    'spaghetti penne fusilli',
    'ravioli tortellini',
    'salsa pasta',
    'cocinar pasta',
    'regiones italia',
  ],
  openGraph: {
    title: 'Tipos de Pasta Italiana: 40 Formas y sus Nombres',
    description:
      'Descubre 40 tipos de pasta italiana: forma, región, tiempo de cocción y salsa ideal. La guía definitiva para cocinar pasta.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tipos de Pasta Italiana: 40 Formas y sus Nombres',
    description:
      'Descubre 40 tipos de pasta italiana: forma, región, tiempo de cocción y salsa ideal.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-tipos-pasta/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía de Tipos de Pasta",
  description: "Guía de referencia de 40 tipos de pasta: spaghetti, penne, fusilli, ravioli y más. Forma, región, tiempo de cocción y salsa ideal.",
  url: "https://meskeia.com/guia-tipos-pasta/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre pasta corta y pasta larga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende también del grosor. La pasta larga y fina (spaghetti, linguine, capellini) va mejor con salsas ligeras de aceite, marisco o tomate, que se reparten por toda la hebra. La pasta larga y plana al huevo (tagliatelle, pappardelle) aguanta salsas de carne como el ragù. La pasta corta (penne, fusilli, rigatoni) atrapa las salsas espesas con trocitos en sus canales y ranuras. En general, a mayor textura exterior de la pasta, mejor agarra la salsa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo se tarda en cocer la pasta al dente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo varía según el tipo y el grosor. La pasta seca muy fina (capellini o cabello de ángel) necesita 2-3 minutos; la pasta seca estándar (spaghetti, penne) entre 8 y 12 minutos; la pasta fresca al huevo, entre 3 y 7 minutos (las rellenas, de 3 a 6), y las frescas más gruesas, como los pici o las orecchiette, de 6 a 12 minutos. El punto al dente se alcanza cuando el interior conserva una ligera resistencia al morder. Siempre guíate por el paquete y prueba antes de escurrir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasta se usa para la carbonara auténtica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la receta tradicional romana se usan spaghetti o rigatoni. Los spaghetti son la opción más clásica, pero los rigatoni permiten que la salsa cremosa de huevo y pecorino entre en el tubo, concentrando el sabor en cada bocado. Lo importante es que la pasta tenga una superficie que retenga bien la emulsión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la pasta con más proteína?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pasta elaborada con sémola de trigo duro contiene en torno a 12-13 g de proteína por cada 100 g en seco. Las variantes de pasta a base de legumbres (lentejas, garbanzos, guisantes) pueden superar los 20-25 g de proteína por 100 g en seco, convirtiéndose en una opción significativamente más rica en proteína que la pasta de trigo convencional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una guía de tipos de pasta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una guía de tipos de pasta ayuda a elegir el formato correcto para cada receta, conocer el tiempo de cocción exacto y descubrir de qué región italiana procede cada variedad. Con más de 40 formatos distintos — desde spaghetti y penne hasta orecchiette o bucatini — es fácil confundirlos o usar una pasta inadecuada para una salsa concreta. La guía también es útil para sustituir un formato cuando no se encuentra en el supermercado.',
      },
    },
  ],
};
