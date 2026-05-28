import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Comparador de Formas Jurídicas - Autónomo vs SL vs Cooperativa | meskeIA',
  description: 'Compara las diferentes formas jurídicas para emprender en España: autónomo, sociedad limitada, cooperativa, asociación, comunidad de bienes. Capital, fiscalidad, responsabilidad y trámites.',
  keywords: 'formas juridicas, autonomo vs sl, comparador empresas, sociedad limitada, cooperativa, asociacion, comunidad de bienes, emprender, constituir empresa, responsabilidad limitada, capital social, fiscalidad autonomo, irpf, impuesto sociedades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Formas Jurídicas - meskeIA',
    description: 'Descubre qué forma jurídica te conviene más: autónomo, SL, cooperativa o asociación. Comparativa completa.',
    url: 'https://meskeia.com/comparador-formas-juridicas/',
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
    title: 'Comparador de Formas Jurídicas - meskeIA',
    description: 'Autónomo vs SL vs Cooperativa: encuentra la mejor opción para tu negocio.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador Formas Jurídicas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador de Formas Jurídicas - Autónomo vs SL vs Cooperativa",
  description: "Compara las diferentes formas jurídicas para emprender en España: autónomo, sociedad limitada, cooperativa, asociación, comunidad de bienes. Capital, fiscalidad, responsabilidad y trámites.",
  url: 'https://meskeia.com/comparador-formas-juridicas/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre ser autónomo y montar una sociedad limitada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El autónomo tributa por IRPF (tipo progresivo hasta el 47 %) y responde con su patrimonio personal ante deudas. La sociedad limitada tributa por Impuesto de Sociedades (tipo general 25 %) y limita la responsabilidad al capital aportado, que puede ser desde 1 euro desde 2023. La SL implica más trámites de constitución y obligaciones contables, pero protege el patrimonio personal del socio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué forma jurídica me conviene si empiezo a facturar poco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si los ingresos netos previstos son bajos (por debajo de 40.000-50.000 € al año), el régimen de autónomo suele ser más sencillo y económico: menos costes de constitución, contabilidad simplificada y sin obligación de auditoría. La SL empieza a ser ventajosa fiscalmente cuando el beneficio supera ese umbral, ya que el tipo del IS (25 %) puede ser inferior a los tramos altos del IRPF.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué capital mínimo se necesita para constituir una sociedad limitada en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde la reforma de la Ley de Startups (Ley 28/2022), el capital mínimo de una SL es de 1 euro, aunque durante los dos primeros ejercicios se debe reservar el 20 % de los beneficios hasta alcanzar 3.000 €. Las Sociedades Anónimas siguen requiriendo un mínimo de 60.000 € y al menos el 25 % desembolsado en el momento de la constitución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventajas tiene una cooperativa frente a una SL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cooperativas ofrecen beneficios fiscales relevantes: las cooperativas protegidas tributan al 20 % en IS (frente al 25 % general), y las especialmente protegidas al 10 %. Además, facilitan la participación democrática de los socios-trabajadores y pueden acceder a subvenciones específicas. La principal desventaja es una mayor complejidad normativa y la obligación de destinar parte de los excedentes a fondos obligatorios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede una persona sola constituir una sociedad limitada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, existe la figura de la Sociedad Limitada Unipersonal (SLU), que permite que un único socio, persona física o jurídica, sea el titular del 100 % del capital social. Debe hacerse constar en el Registro Mercantil y en toda la documentación que la sociedad es unipersonal, y el socio único no puede contratar con la SLU en su propio nombre sin cumplir ciertos requisitos formales.',
      },
    },
  ],
};
