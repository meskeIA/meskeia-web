import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparador de Coste de Vida entre Ciudades del Mundo | meskeIA',
  description: 'Compara el coste de vida entre más de 55 ciudades: alquiler, restaurantes, supermercado, transporte e internet. Datos de referencia 2024-2025.',
  keywords: [
    'coste de vida',
    'comparador ciudades',
    'vivir en el extranjero',
    'alquiler ciudad',
    'precio vida mundo',
    'nómada digital',
    'mudarse al extranjero',
    'cities cost of living',
    'presupuesto expatriado',
  ],
  openGraph: {
    title: 'Comparador de Coste de Vida | meskeIA',
    description: 'Alquiler, comida, transporte e internet en 55+ ciudades del mundo. Compara y decide dónde vivir.',
    url: 'https://meskeia.com/comparador-coste-vida/',
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-coste-vida/',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Comparador de Coste de Vida entre Ciudades',
  description: 'Compara el coste de vida entre más de 55 ciudades del mundo: alquiler, restaurantes, supermercado, transporte e internet.',
  url: 'https://meskeia.com/comparador-coste-vida/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  provider: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la ciudad más barata para vivir en Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre las ciudades europeas más asequibles destacan Bucarest (Rumanía), Budapest (Hungría) y Estambul (Turquía), donde el coste mensual de vida para una persona puede situarse entre 800 y 1.200 €, incluyendo alquiler en zona céntrica. En contraste, Zúrich, Ginebra o Londres superan fácilmente los 3.000 € al mes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se compara el coste de vida en España con el de otros países?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'España se sitúa en un nivel medio-bajo dentro de Europa occidental. Madrid y Barcelona tienen costes similares a ciudades como Berlín o Amsterdam, con alquileres de 1.000-1.800 € por un piso de un dormitorio en zona céntrica. Ciudades medianas españolas como Valencia, Sevilla o Zaragoza son notablemente más baratas, con alquileres desde 700 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ciudades tienen mejor relación entre salario y coste de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La relación calidad-precio depende del perfil profesional. Para nómadas digitales con ingresos en euros o dólares, ciudades como Lisboa, Tallín, Cracovia, Ciudad de México o Medellín ofrecen excelente calidad de vida a bajo coste. Para profesionales locales, países nórdicos como Noruega o Suiza, pese a su alto coste, ofrecen salarios proporcionales y alta calidad de servicios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta vivir en Ciudad de México, Buenos Aires o Bogotá?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En Ciudad de México, el coste de vida para un expatriado ronda los 900-1.400 € al mes. Buenos Aires ha experimentado variaciones importantes por la inflación, pero su coste en dólares o euros sigue siendo bajo (600-1.000 €). Bogotá y Medellín se sitúan entre 700 y 1.100 € mensuales. Los tres destinos ofrecen oferta cultural y gastronómica destacada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué partidas pesan más en el coste de vida de una ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alquiler suele representar entre el 30% y el 50% del presupuesto mensual en la mayoría de grandes ciudades. Le siguen la alimentación (15-25%), el transporte (5-15%) y el ocio. En ciudades asiáticas como Tokio o Seúl, el transporte público es muy eficiente y barato; en ciudades norteamericanas, el coche propio puede añadir 400-600 € al mes en gastos.',
      },
    },
  ],
};
