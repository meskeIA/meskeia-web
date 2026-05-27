import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía: ¿Cuándo Reclamar al Seguro del Coche? | meskeIA',
  description: 'Guía completa para decidir cuándo reclamar al seguro del coche. Siniestros menores, asistencia en carretera, atropello de animales, rotura de lunas y más.',
  keywords: 'reclamar seguro coche, cuándo usar seguro auto, siniestro menor coche, asistencia carretera, kilómetro cero, atropello animal seguro, rotura luna seguro, bonus malus',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía: ¿Cuándo Reclamar al Seguro del Coche? | meskeIA',
    description: 'Guía completa para decidir cuándo reclamar al seguro del coche en diferentes situaciones.',
    url: 'https://meskeia.com/guia-reclamar-seguro-coche/',
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
    title: 'Guía Reclamar Seguro Coche - meskeIA',
    description: 'Guía completa para decidir cuándo reclamar al seguro del coche.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-reclamar-seguro-coche/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía Reclamar Seguro Coche",
  description: "Guía completa para decidir cuándo reclamar al seguro del coche. Siniestros menores, asistencia en carretera, atropello de animales, rotura de lunas y más.",
  url: "https://meskeia.com/guia-reclamar-seguro-coche/",
  category: 'FinanceApplication',
  features: [],
});
