import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Oferta, Demanda y por qué Suben los Precios - Economía Visual | meskeIA',
  description: 'Entiende las curvas de oferta y demanda con ejemplos interactivos. 5 escenarios reales: petróleo, sequía, iPhone, tipos de interés y subvenciones. Visualiza cómo se desplazan las curvas y cambia el precio de equilibrio.',
  keywords: 'oferta demanda, curvas oferta demanda, precio equilibrio, economía bachillerato, precio petróleo, subida precios, tipos de interés, subvención, mercado, microeconomía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Oferta, Demanda y por qué Suben los Precios',
    description: '5 escenarios reales que explican cómo funcionan los mercados y por qué cambian los precios.',
    url: 'https://meskeia.com/visualizador-oferta-demanda/',
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
    title: 'Oferta, Demanda y por qué Suben los Precios',
    description: 'Visualiza cómo las curvas de oferta y demanda determinan los precios con ejemplos reales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Oferta Demanda meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Oferta, Demanda y por qué Suben los Precios',
  description: 'Explicador visual interactivo de las curvas de oferta y demanda con 5 escenarios reales: subida del petróleo, sequía en la fruta, lanzamiento del iPhone, subida de tipos de interés y subvención gubernamental. Muestra el desplazamiento de curvas y el nuevo precio de equilibrio mediante visualizaciones CSS.',
  url: 'https://meskeia.com/visualizador-oferta-demanda/',
  category: 'EducationalApplication',
  features: [
    '5 escenarios económicos reales y clickables',
    'Visualización del desplazamiento de curvas de oferta y demanda',
    'Precio y cantidad de equilibrio antes y después del shock',
    'Explicación intuitiva de cada mecanismo económico',
    'Sin gráficos externos — visualización CSS pura',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
  keywords: [
    'oferta demanda', 'curvas oferta demanda', 'precio equilibrio',
    'economía bachillerato', 'microeconomía', 'mercados', 'precio petróleo',
    'tipos de interés', 'subvención', 'sequía precios',
  ],
});
