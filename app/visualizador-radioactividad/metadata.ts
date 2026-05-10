import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Radioactividad: Desintegración, Vida Media y Datación — meskeIA',
  description: 'Visualiza los tipos de radiación α/β/γ, la ley de desintegración exponencial, datación por carbono-14 y efectos biológicos de la radiación ionizante.',
  keywords: [
    'radioactividad física nuclear',
    'desintegración radiactiva ley exponencial',
    'vida media isótopo radiactivo',
    'radiación alfa beta gamma neutrones',
    'datación carbono 14 arqueología',
    'dosis radiación sievert gray',
    'penetración radiación materiales',
    'radiación ionizante efectos biológicos',
    'desintegración nuclear visualizador',
    'física nuclear bachillerato',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Radioactividad: Desintegración, Vida Media y Datación — meskeIA',
    description: 'Explora la ley de desintegración exponencial, tipos de radiación α/β/γ, datación por C-14 y efectos biológicos de la radiación. Visualizador interactivo con gráficas SVG.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-radioactividad/',
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
    title: 'Radioactividad: Tipos de Radiación y Vida Media',
    description: 'Visualizador interactivo de física nuclear: desintegración exponencial, datación C-14, dosis de radiación y efectos biológicos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Visualizador Radioactividad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Radioactividad: Desintegración, Vida Media y Datación',
  description: 'Visualizador interactivo de física nuclear. Explora los tipos de radiación α/β/γ y neutrones, la ley de desintegración exponencial N(t) = N₀·e^(-λt), datación radiométrica por carbono-14 y efectos biológicos de la radiación ionizante con unidades Gray y Sievert.',
  url: 'https://meskeia.com/visualizador-radioactividad/',
  category: 'EducationalApplication',
  features: [
    'Tabla comparativa interactiva de radiación α, β⁻, β⁺, γ y neutrones con propiedades y ejemplos',
    'SVG de penetración de radiación a través de papel, aluminio, plomo y hormigón',
    'Calculadora de desintegración exponencial N(t) = N₀·e^(-λt) con slider de tiempo',
    'Gráfica SVG de la curva de desintegración con marcas en t½, 2t½ y 3t½',
    'Presets de isótopos reales: C-14, I-131, Tc-99m, Ra-226, U-238',
    'Calculadora de datación por carbono-14 con ejemplos arqueológicos famosos',
    'Límite del método C-14 y calibración con dendrocronología',
    'Tabla de dosis de radiación natural y comparativa con actividades humanas',
    'Efectos biológicos por nivel de dosis (mSv/Sv) con umbrales',
    'Gratuito, sin registro, disponible en español',
  ],
});
