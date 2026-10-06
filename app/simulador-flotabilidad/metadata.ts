import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Flotabilidad: Principio de Arquímedes y Densidad | meskeIA',
  description: 'Elige el material, el volumen y el líquido y comprueba con el principio de Arquímedes si el cuerpo flota o se hunde: peso, empuje, porcentaje sumergido y peso aparente, con el dibujo del recipiente a escala.',
  keywords: 'principio de arquimedes, empuje, flotabilidad, densidad, peso aparente, simulador, simulador de flotabilidad, por qué flota un barco, iceberg, fuerza de empuje, física, secundaria, preparatoria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-flotabilidad/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Flotabilidad: Principio de Arquímedes | meskeIA',
    description: '¿Flota o se hunde? Peso, empuje, fracción sumergida y peso aparente según el material y el líquido.',
    url: 'https://meskeia.com/simulador-flotabilidad/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Flotabilidad | meskeIA',
    description: 'Principio de Arquímedes: ¿flota o se hunde? Peso, empuje y porcentaje sumergido',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Flotabilidad — Principio de Arquímedes y Densidad',
  description: 'Simulador interactivo del principio de Arquímedes. Elige el material del cuerpo (corcho, madera, hielo, aluminio, hierro, oro u otra densidad), su volumen y el líquido (agua dulce, agua de mar, aceite, alcohol, glicerina, mercurio u otra densidad) y obtén el peso, el empuje, si flota o se hunde, el porcentaje sumergido y el peso aparente.',
  url: 'https://meskeia.com/simulador-flotabilidad/',
  category: 'EducationalApplication',
  features: [
    'Seis materiales y seis líquidos de referencia, más densidad personalizada',
    'Veredicto flota, se hunde o equilibrio indiferente comparando densidades',
    'Peso P = ρc·V·g y empuje E = ρl·V·g en newtons',
    'Fracción sumergida f = ρc/ρl cuando el cuerpo flota',
    'Peso aparente (lo que marcaría un dinamómetro) cuando se hunde',
    'Dibujo del recipiente con el cuerpo en su línea de flotación real y flechas de fuerza proporcionales',
    'Fórmulas que cambian según el veredicto',
  ],
  keywords: ['principio de Arquímedes', 'empuje', 'flotabilidad', 'densidad', 'peso aparente', 'simulador de física'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice el principio de Arquímedes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Todo cuerpo sumergido total o parcialmente en un fluido recibe una fuerza vertical hacia arriba, el empuje, igual al peso del fluido que desaloja: E = ρ_líquido·V_sumergido·g. Un bloque de 1 litro totalmente sumergido en agua dulce recibe un empuje de unos 9,81 N, sea de madera o de hierro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se sabe si un objeto flota o se hunde?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basta comparar densidades. Si la densidad del cuerpo es menor que la del líquido, flota; si es mayor, se hunde; si son iguales, queda en equilibrio indiferente a cualquier profundidad. Por eso el hierro (7870 kg/m³) se hunde en agua (1000 kg/m³) pero flota en mercurio (13.534 kg/m³).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué parte de un cuerpo que flota queda bajo el líquido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fracción sumergida es el cociente de densidades: f = ρ_cuerpo/ρ_líquido. Un bloque de pino de 500 kg/m³ en agua dulce se sumerge la mitad. El hielo (917 kg/m³) en agua de mar (unos 1025 kg/m³) queda sumergido en torno al 89,5 %, de ahí la expresión «la punta del iceberg».',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el peso aparente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es lo que marca un dinamómetro cuando el cuerpo cuelga sumergido en un líquido: el peso real menos el empuje, P − E. Una pieza de hierro de 100 cm³ pesa 7,72 N en el aire, recibe 0,98 N de empuje en agua y marca un peso aparente de 6,74 N.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué flota un barco de acero si el acero es más denso que el agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque lo que cuenta es la densidad media del barco, casco de acero más todo el aire de su interior, no la del acero. El casco hueco desaloja un volumen de agua cuyo peso iguala el del barco antes de que el agua alcance la cubierta. Si se inunda, la densidad media supera la del agua y se hunde.',
      },
    },
  ],
};
