import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Estilos de Cerveza - IBU, ABV, maridaje y temperatura | meskeIA',
  description: 'Guía de referencia de 40 estilos de cerveza: IPA, Stout, Pilsner, Weizen, Saison... IBU, ABV, temperatura de servicio y maridaje. Filtros por tipo, color y amargor.',
  keywords: 'estilos de cerveza, IPA, stout, pilsner, weizen, craft beer, IBU, ABV, maridaje, cerveza artesanal, tipos de cerveza, cata de cerveza',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Estilos de Cerveza | meskeIA',
    description: '40 estilos de cerveza con IBU, ABV, temperatura de servicio, notas de sabor y maridaje.',
    url: 'https://meskeia.com/guia-estilos-cerveza',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Estilos de Cerveza | meskeIA',
    description: '40 estilos de cerveza: IPA, Stout, Pilsner, Weizen y más. IBU, ABV y maridaje.',
  },
  other: {
    'application-name': 'Guía de Estilos de Cerveza meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Estilos de Cerveza',
  description: 'Directorio de 40 estilos de cerveza del mundo con tipo, fermentación, IBU, ABV, temperatura de servicio, notas de sabor, maridaje y marcas destacadas. Incluye Ales, Lagers e Híbridas. Filtros por tipo, color EBC, fermentación y nivel de amargor.',
  url: 'https://meskeia.com/guia-estilos-cerveza/',
  features: [
    '40 estilos de cerveza con ficha completa',
    'Filtros por tipo (Ale/Lager/Híbrida/Silvestre), color EBC, fermentación y amargor',
    'Búsqueda por nombre, notas de sabor y maridaje',
    'IBU, ABV y temperatura de servicio para cada estilo',
    'Marcas destacadas y curiosidades históricas',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});
