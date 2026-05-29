import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Plantas de Interior - Cuidados, luz y toxicidad | meskeIA',
  description: '40 plantas de interior: nivel de luz, frecuencia de riego, humedad, toxicidad para mascotas y cuidados específicos. Filtros por luz, dificultad y aptitud para mascotas.',
  keywords: 'plantas de interior, cuidado de plantas, luz para plantas, riego plantas interior, plantas aptas mascotas, plantas tóxicas gatos, plantas fáciles, decoración con plantas, plantas para principiantes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Plantas de Interior - meskeIA',
    description: '40 plantas de interior con cuidados detallados, toxicidad para mascotas y filtros por luz y dificultad.',
    url: 'https://meskeia.com/guia-plantas-interior/',
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
    title: 'Guía de Plantas de Interior',
    description: '40 plantas con nivel de luz, riego, toxicidad para mascotas y consejos de cuidado.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-plantas-interior/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía de Plantas de Interior",
  description: "40 plantas de interior: nivel de luz, frecuencia de riego, humedad, toxicidad para mascotas y cuidados específicos. Filtros por luz, dificultad y aptitud para mascotas.",
  url: "https://meskeia.com/guia-plantas-interior/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué plantas de interior son seguras si tengo gatos o perros en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunas plantas de interior populares son tóxicas para perros y gatos: la Pothos, el Lirio de la paz, el Philodendron, la Difenbaquia y el Aloe Vera pueden causar irritación o problemas gastrointestinales. Entre las opciones seguras se encuentran la Areca (palmera), el Helecho de Boston, la Calatea, el Bambú y la Hierba gatera. Si tienes mascotas, es recomendable verificar siempre la toxicidad antes de adquirir una planta nueva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las plantas de interior más fáciles de cuidar para principiantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas más resistentes para quienes se inician son la Pothos (tolera poca luz y olvidos de riego), el Sansevieria o lengua de suegra (aguanta la sequía y la sombra), el Cactus (mínimo riego), el ZZ plant o Zamioculcas (casi indestructible) y el Tradescantia. Estas variedades soportan bien los errores más comunes: exceso de riego, poca luz y temperaturas variables.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia hay que regar las plantas de interior?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una frecuencia universal: depende de la especie, el tamaño de la maceta, el sustrato, la temperatura y la estación. La regla más útil es comprobar el sustrato antes de regar: si los 2-3 cm superiores están secos, es momento de regar. Las plantas tropicales de hoja grande (Monstera, Calatea) suelen necesitar riego cada 7-10 días en verano; los cactus y suculentas, cada 2-4 semanas. El exceso de riego es la causa principal de muerte de plantas de interior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué plantas de interior aguantan bien la poca luz o habitaciones sin ventanas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunas plantas toleran bien la sombra o la luz indirecta baja: el Sansevieria (planta de serpiente), el Pothos, el Aglaonema, la Aspidistra (llamada "planta de hierro") y el ZZ plant son opciones resistentes en condiciones de poca luz. Ninguna planta vive sin luz artificial o natural de ningún tipo, pero estas especies se adaptan bien a habitaciones con luz limitada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una planta de exterior y una de interior?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas de interior suelen ser originarias de zonas tropicales o subtropicales donde crecen bajo el dosel de árboles, por lo que están adaptadas a luz indirecta, temperaturas estables y mayor humedad ambiental. Las plantas de exterior están adaptadas a luz solar directa, cambios de temperatura y lluvia. Muchas plantas de exterior sobrevivirían en interiores con mucha luz, pero las plantas de interior raramente toleran el sol directo y las heladas del exterior.',
      },
    },
  ],
};
