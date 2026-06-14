import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Contraste de Colores - Verificador WCAG AA/AAA | meskeIA',
  description: 'Verifica la accesibilidad del contraste entre colores según WCAG 2.1. Calcula ratio de contraste, cumplimiento AA/AAA para texto normal y grande.',
  keywords: 'contraste colores, WCAG, accesibilidad web, ratio contraste, AA, AAA, color contrast checker',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Contraste de Colores WCAG - meskeIA',
    description: 'Verifica la accesibilidad del contraste entre colores según WCAG 2.1',
    url: 'https://meskeia.com/contraste-colores/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Contraste de Colores - Verificador WCAG AA/AAA",
  description: "Verifica la accesibilidad del contraste entre colores según WCAG 2.1. Calcula ratio de contraste, cumplimiento AA/AAA para texto normal y grande.",
  url: 'https://meskeia.com/contraste-colores/',
  category: 'UtilityApplication',
  features: [
      "Cálculo del ratio de contraste WCAG 2.1 en tiempo real al modificar los colores",
      "Verificación de cumplimiento en 4 niveles: Texto Normal AA/AAA y Texto Grande AA/AAA",
      "8 combinaciones predefinidas (presets) con estilos habituales en diseño web",
      "Vista previa en vivo del contraste con ejemplos de texto normal y grande",
      "Generación de código CSS con variables validadas listas para copiar y usar",
      "Gratuito, sin registro ni instalación",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ratio de contraste de colores y por qué importa en diseño web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio de contraste mide la diferencia de luminosidad entre dos colores, como el texto y su fondo. Un contraste insuficiente dificulta la lectura a personas con baja visión o en condiciones de luz intensa. Las guías WCAG 2.1 establecen umbrales mínimos para garantizar que el contenido sea legible por la mayor cantidad de usuarios posible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el nivel WCAG AA y el nivel AAA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WCAG AA requiere un ratio mínimo de 4,5:1 para texto normal y 3:1 para texto grande (18pt o 14pt en negrita). Es el estándar exigido en la mayoría de proyectos públicos y legislaciones de accesibilidad. WCAG AAA eleva los umbrales a 7:1 y 4,5:1 respectivamente, y se recomienda cuando el público incluye personas con discapacidad visual severa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el ratio de contraste entre dos colores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se calcula dividiendo la luminancia relativa del color más claro entre la del más oscuro, sumando 0,05 a ambas para evitar la división por cero. La luminancia relativa se obtiene transformando los valores RGB al espacio lineal. El resultado va de 1:1 (sin contraste) a 21:1 (negro sobre blanco).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un verificador de contraste de colores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para diseñadores de interfaces, desarrolladores front-end y equipos de UX que necesitan validar que sus combinaciones de colores cumplen los estándares de accesibilidad. También lo usan equipos de calidad web, auditores de accesibilidad y cualquier persona que quiera asegurarse de que sus materiales digitales son legibles para todos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe alguna norma legal que obligue a cumplir el estándar WCAG en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, el Real Decreto 1112/2018 transpone la Directiva Europea 2016/2102 y obliga a los sitios web y aplicaciones del sector público a cumplir al menos el nivel WCAG 2.1 AA. Para el sector privado no existe una obligación legal general, aunque la normativa europea de accesibilidad (European Accessibility Act) extiende requisitos a empresas privadas en determinados servicios digitales a partir de junio de 2025.',
      },
    },
  ],
};
