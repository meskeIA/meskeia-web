import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Residencia vs Cuidado en Casa - Comparativa de costes | meskeIA',
  description: 'Compara los costes orientativos de residencia privada, servicio de ayuda a domicilio (SAD) y cuidador en casa para elegir la opción de cuidado más adecuada.',
  keywords: 'residencia mayores coste, cuidador en casa precio, sad servicio ayuda domicilio, residencia vs domicilio, cuanto cuesta residencia mayores españa, comparativa cuidado mayores',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Residencia vs Cuidado en Casa | meskeIA',
    description: 'Comparativa de costes: residencia privada, SAD y cuidador en casa.',
    url: 'https://meskeia.com/residencia-vs-cuidado-en-casa/',
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
    title: 'Residencia vs Cuidado en Casa | meskeIA',
    description: 'Comparativa de opciones de cuidado para mayores: costes y factores clave',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Residencia vs Cuidado en Casa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Residencia vs Cuidado en Casa",
  description: "Compara los costes orientativos de residencia privada, servicio de ayuda a domicilio (SAD) y cuidador en casa para elegir la opción de cuidado más adecuada.",
  url: "https://meskeia.com/residencia-vs-cuidado-en-casa/",
  category: 'FinanceApplication',
  features: [],
});
