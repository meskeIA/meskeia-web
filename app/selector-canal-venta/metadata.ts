import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Canal de Venta | ¿Marketplace, Tienda Propia o Redes Sociales? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué canal de venta se adapta mejor a tu negocio: marketplace generalista, plataforma sectorial, tienda online propia, venta por redes sociales o venta directa local.',
  keywords: [
    'qué canal de venta elegir',
    'marketplace o tienda propia',
    'vender en redes sociales',
    'plataforma sectorial venta',
    'tienda online o marketplace',
    'venta directa o digital',
    'canal distribución online España',
    'cómo vender por internet',
    'estrategia venta online pequeño negocio',
    'marketplace sectorial España',
  ],
  openGraph: {
    title: 'Selector de Canal de Venta — ¿Marketplace, Tienda Propia o Redes Sociales?',
    description:
      'Descubre qué canal de venta se adapta mejor a tu negocio en 10 preguntas.',
    url: 'https://meskeia.com/selector-canal-venta/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Canal de Venta",
  description: "Test de 10 preguntas para saber qué canal de venta se adapta mejor a tu negocio: marketplace generalista, plataforma sectorial, tienda online propia, venta por redes sociales o venta directa local.",
  url: "https://meskeia.com/selector-canal-venta/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre vender en un marketplace y tener tienda online propia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un marketplace (como Amazon, Etsy o Wallapop) accedes a una base de compradores ya existente pero pagas comisiones por venta (habitualmente entre el 5 % y el 15 %) y compites directamente con otros vendedores en el mismo escaparate. Con una tienda propia (Shopify, WooCommerce, Prestashop) controlas la experiencia de compra, los datos del cliente y el margen, pero debes invertir en atraer tráfico desde cero. La elección depende del volumen de ventas esperado, el margen del producto y el tiempo disponible para gestión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una plataforma sectorial y cuándo conviene usarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una plataforma sectorial es un marketplace especializado en una categoría concreta: Booking y Airbnb para alojamiento, Idealista y Fotocasa para inmuebles, Infojobs para empleo, Habitissimo para reformas, etc. Convienen cuando el comprador busca específicamente en esa categoría y la plataforma tiene autoridad de marca en el sector. Suelen cobrar menos comisión que los marketplaces generalistas y el tráfico es más cualificado, aunque el alcance total es menor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Vender en redes sociales es viable para un negocio pequeño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, especialmente en Instagram Shopping, TikTok Shop y Facebook Marketplace para productos visuales, artesanía, moda o decoración. Las redes sociales permiten construir comunidad y vender directamente sin comisiones de marketplace, pero requieren una estrategia de contenido constante. Es un canal adecuado cuando el producto tiene alto componente visual o aspiracional, el precio unitario justifica el tiempo de gestión y el público objetivo es activo en redes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es mejor la venta directa local o presencial frente a la venta online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La venta directa local (mercados, ferias, tienda física, reparto a domicilio en la zona) es más rentable cuando el producto es perecedero o de gran volumen (alimentos, plantas, materiales), cuando el cliente valora el trato personal, o cuando la logística de envío nacional encarecería el precio hasta hacerlo inviable. También es una buena opción inicial para validar la demanda antes de invertir en plataforma digital.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo vender en varios canales a la vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la estrategia multicanal (o incluso omnicanal) es habitual en negocios con cierta madurez, pero conlleva complejidad operativa: gestión de stock sincronizado, atención al cliente fragmentada y mayor carga administrativa. Para empezar se recomienda dominar un solo canal principal hasta alcanzar un volumen estable, y solo entonces añadir canales secundarios que complementen sin duplicar costes.',
      },
    },
  ],
};
