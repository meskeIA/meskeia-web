import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Optimizador de Rentas 60+ — Estrategia IRPF para pensionistas | meskeIA',
  description: 'Planifica el orden óptimo de retirada de fondos (pensión pública, plan de pensiones, ahorro, alquiler) para minimizar el IRPF total. Herramienta de estrategia fiscal para mayores de 60 años.',
  keywords: 'optimizar rentas jubilacion, irpf pensionista plan pensiones, orden retirada fondos jubilacion, estrategia fiscal mayores 60, minimizar impuestos jubilacion, plan pensiones irpf retiro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Optimizador de Rentas 60+ | meskeIA',
    description: 'Estrategia fiscal para pensionistas: qué fondos retirar primero para pagar menos IRPF.',
    url: 'https://meskeia.com/optimizador-rentas-60/',
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
    title: 'Optimizador de Rentas 60+ | meskeIA',
    description: 'Minimiza el IRPF en la jubilación: orden óptimo de retirada de pensión, PP, ahorro y alquiler',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Optimizador Rentas 60 meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Optimizador de Rentas 60+",
  description: "Planifica el orden óptimo de retirada de fondos (pensión pública, plan de pensiones, ahorro, alquiler) para minimizar el IRPF total. Herramienta de estrategia fiscal para mayores de 60 años.",
  url: "https://meskeia.com/optimizador-rentas-60/",
  category: 'FinanceApplication',
  features: [],
});
