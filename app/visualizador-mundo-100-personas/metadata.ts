import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mundo en 100 Personas - Estadísticas Globales Visuales | meskeIA',
  description: 'Si el mundo fuera un pueblo de 100 habitantes: cuántos tendrían agua potable, smartphone, educación universitaria. Visualización interactiva con datos reales.',
  keywords: 'mundo 100 personas, estadísticas globales, desigualdad mundial, agua potable, acceso internet, educación mundial, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mundo en 100 Personas',
    description: 'Si el mundo fuera un pueblo de 100 habitantes. Estadísticas que sorprenden.',
    url: 'https://meskeia.com/visualizador-mundo-100-personas/',
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
    title: 'El Mundo en 100 Personas',
    description: 'El planeta reducido a 100 personas. ¿Cuántas tendrían agua potable?',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mundo 100 Personas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mundo en 100 Personas',
  description: 'Explicador visual que reduce la población mundial a 100 personas para hacer comprensibles las estadísticas globales: acceso a agua, educación, tecnología, riqueza, salud y más.',
  url: 'https://meskeia.com/visualizador-mundo-100-personas/',
  features: [
    'Mundo reducido a 100 personas con datos reales',
    '8 categorías: geografía, idiomas, agua, educación, tecnología, riqueza, salud, alimentación',
    'Barras de personas visuales e interactivas',
    'Fuentes: ONU, Banco Mundial, UNESCO, OMS',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la visualización "el mundo en 100 personas"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una forma de hacer comprensibles las estadísticas globales reduciendo la población mundial (más de 8.000 millones de personas) a un pueblo imaginario de 100 habitantes. Así resulta inmediato entender, por ejemplo, que si el mundo fuera 100 personas, solo 13 tendrían educación universitaria o que 74 tendrían acceso a internet. Los datos proceden de fuentes como la ONU, el Banco Mundial y la OMS.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas personas de las 100 tienen acceso a agua potable segura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según datos del Banco Mundial y la OMS, aproximadamente 74 de cada 100 personas en el mundo disponen de acceso a agua potable gestionada de forma segura. El resto — unos 26 de cada 100 — depende de fuentes sin garantías de salubridad, principalmente en África subsahariana y partes de Asia meridional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve reducir el mundo a 100 personas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando se habla de millones o miles de millones de personas el cerebro humano tiene dificultades para captar la magnitud real de las diferencias. Reducir la escala a 100 convierte porcentajes abstractos en cifras concretas y fáciles de imaginar, lo que facilita la comprensión de la desigualdad global en educación, salud, riqueza y acceso a recursos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué categorías de datos se incluyen en el visualizador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El visualizador cubre 8 categorías: distribución geográfica (continentes), idiomas más hablados, acceso a agua potable, nivel de educación, acceso a tecnología e internet, distribución de la riqueza, indicadores de salud y situación alimentaria. Cada categoría muestra barras visuales que representan a personas concretas dentro del grupo de 100.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta riqueza concentran las personas más ricas si el mundo fueran 100?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De acuerdo con datos del Banco Mundial y Oxfam, si el mundo fuera 100 personas, las 10 más ricas acumularían más riqueza que los otros 90 juntos. La desigualdad económica es una de las estadísticas más llamativas del ejercicio: un único "habitante" del pueblo podría representar ingresos equivalentes a decenas de los más pobres.',
      },
    },
  ],
};
