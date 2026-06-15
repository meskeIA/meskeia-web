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
    url: 'https://meskeia.com/guia-estilos-cerveza/',
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
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una IPA y una NEIPA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La IPA (India Pale Ale) clásica es una cerveza amarga, transparente, con lúpulo protagonista y notas cítricas o resinosas; su IBU suele oscilar entre 40 y 70. La NEIPA (New England IPA o Hazy IPA) surgió en torno a 2011 en Nueva Inglaterra (EE. UU.) y se caracteriza por su aspecto turbio o "brumoso", baja amargor perceptible a pesar de un alto contenido de lúpulo, y aromas intensos a frutas tropicales como mango, maracuyá o melocotón. La diferencia técnica está en el momento de adición del lúpulo: la NEIPA usa dry-hopping masivo y harina de avena que le da esa textura sedosa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el IBU en la cerveza y cómo afecta al sabor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IBU son las siglas de International Bitterness Units (Unidades Internacionales de Amargor), una escala que mide la concentración de iso-alfa-ácidos del lúpulo en la cerveza. A efectos prácticos: menos de 20 IBU es suave (Pilsner, Weizen), entre 20-40 es equilibrado (Pale Ale, Amber), entre 40-60 es notablemente amargo (IPA), y por encima de 70 resulta muy intenso (Double IPA, Imperial Stout con lúpulo). Sin embargo, el IBU por sí solo no define el amargor percibido: la dulzura residual del malte puede compensarlo; una cerveza con 60 IBU puede parecer menos amarga que una con 40 si tiene más malta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cerveza va bien con pizza o comida italiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con pizza, especialmente las de tomate y queso, funcionan bien las cervezas con buena acidez y carbonatación que refrescan el paladar: una Pilsner italiana o checa, una Pale Ale americana o una Witbier belga. Para pizzas con embutidos curados (chorizo, salami) también es buena opción una Amber Ale o una Märzen, cuya malta caramelizada complementa los sabores ahumados y grasos. Las IPAs muy amargas pueden chocar con la acidez del tomate si no tienen suficiente cuerpo malteado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una cerveza Ale y una Lager?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La distinción fundamental es el tipo de levadura y la temperatura de fermentación. Las Ales utilizan levaduras de alta fermentación (Saccharomyces cerevisiae) que trabajan a 15-24 °C y producen aromas frutales y especiados más pronunciados. Las Lagers emplean levaduras de baja fermentación (Saccharomyces pastorianus) a 4-12 °C, lo que genera cervezas más limpias, suaves y con menos ésteres. Históricamente las Lagers se asocian al centro de Europa (Alemania, República Checa) y las Ales al norte (Reino Unido, Bélgica), aunque hoy se elaboran en todo el mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las cervezas trapenses y en qué se diferencian del resto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cervezas trapenses son elaboradas dentro de monasterios trapenses (Orden Cisterciense de la Estricta Observancia) bajo supervisión de los monjes, con el objetivo principal de financiar la vida monástica y obras de caridad. Actualmente existen 14 productores con la certificación oficial "Authentic Trappist Product" en Bélgica, Países Bajos, Austria, Italia, Países Bajos, EE. UU. y España. Los estilos más representativos son Dubbel (tostada, 6-8% ABV), Tripel (dorada, 8-10% ABV) y Quadrupel (oscura, 10-12% ABV). Su complejidad aromática, refermentación en botella y baja producción las convierten en referentes del mundo craft.',
      },
    },
  ],
};
