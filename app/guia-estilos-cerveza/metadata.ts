import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Estilos de Cerveza - IBU, ABV, maridaje y temperatura | meskeIA',
  description: 'Guía de 47 estilos de cerveza: IPA, NEIPA, Stout, Pilsner, Weizen, Saison, Mexican Lager, Quadrupel... IBU, ABV, temperatura de servicio y maridaje. Filtros por tipo, color y amargor.',
  keywords: 'estilos de cerveza, IPA, NEIPA, hazy, stout, pilsner, weizen, craft beer, IBU, ABV, maridaje, cerveza artesanal, mexican lager, quadrupel, altbier, flanders red, tipos de cerveza, cata de cerveza',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Estilos de Cerveza | meskeIA',
    description: '47 estilos de cerveza con IBU, ABV, temperatura de servicio, notas de sabor y maridaje. Incluye NEIPA, Quadrupel y Mexican Lager.',
    url: 'https://meskeia.com/guia-estilos-cerveza',
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
    title: 'Guía de Estilos de Cerveza | meskeIA',
    description: '47 estilos de cerveza: IPA, NEIPA, Stout, Pilsner, Weizen, Mexican Lager. IBU, ABV y maridaje.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Estilos de Cerveza meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Estilos de Cerveza',
  description: 'Directorio de 47 estilos de cerveza del mundo con tipo, fermentación, IBU, ABV, temperatura de servicio, notas de sabor, maridaje y marcas destacadas. Incluye Ales, Lagers, Híbridas y Silvestres. Cobertura completa: estilos clásicos europeos, craft americano (NEIPA, Double IPA), trapenses (Quadrupel) y Mexican Lager. Filtros por tipo, color EBC, fermentación y nivel de amargor.',
  url: 'https://meskeia.com/guia-estilos-cerveza/',
  features: [
    '47 estilos de cerveza con ficha completa',
    'Cobertura craft moderna: NEIPA, Double IPA, Belgian Strong Golden Ale',
    'Estilos trapenses completos: Tripel, Dubbel, Quadrupel',
    'Mexican Lager y estilos no europeos',
    'Filtros por tipo (Ale/Lager/Híbrida/Silvestre), color EBC, fermentación y amargor',
    'Búsqueda por nombre, notas de sabor y maridaje',
    'IBU, ABV y temperatura de servicio para cada estilo',
    'Marcas destacadas y curiosidades históricas',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});
