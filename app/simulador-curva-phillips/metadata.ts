import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de la Curva de Phillips: Inflación y Desempleo | meskeIA',
  description: 'Visualiza el trade-off inflación-desempleo con la curva de Phillips aumentada con expectativas. Ajusta desempleo, inflación esperada y shocks de oferta. Modela estanflación, recesión y equilibrio.',
  keywords: 'curva de Phillips, inflación, desempleo, NAIRU, estanflación, expectativas adaptativas, política monetaria, macroeconomía, Bachillerato, economía, Friedman, Phelps',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-curva-phillips/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de la Curva de Phillips | meskeIA',
    description: 'El trade-off inflación-desempleo en directo. Modela la estanflación de los 70, la Gran Moderación y la inflación post-COVID.',
    url: 'https://meskeia.com/simulador-curva-phillips/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de la Curva de Phillips | meskeIA',
    description: 'Inflación vs desempleo en tiempo real. NAIRU, expectativas de Friedman, shocks de oferta OPEP.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de la Curva de Phillips',
  description: 'Simulador interactivo de la Curva de Phillips aumentada con expectativas (modelo Friedman-Phelps). Permite ajustar la tasa de desempleo, la inflación esperada y el shock de oferta para visualizar el trade-off inflación-desempleo en tiempo real. Muestra la curva de corto plazo, la curva de largo plazo (NAIRU) y clasifica la economía en cuadrantes: recesión, estanflación, sobrecalentamiento o equilibrio ideal. Incluye 4 episodios históricos de referencia: estanflación OPEP 1973, España 2013, EEUU post-COVID 2022 y Eurozona 2019.',
  url: 'https://meskeia.com/simulador-curva-phillips/',
  category: 'EducationalApplication',
  features: [
    'Curva de Phillips a corto y largo plazo (NAIRU) en tiempo real',
    'Sliders de desempleo, inflación esperada y shock de oferta',
    'Clasificación automática del cuadrante económico (recesión, estanflación, equilibrio)',
    'Desplazamiento de la curva por expectativas y shocks de oferta',
    '4 episodios históricos de referencia con coordenadas reales',
    'Zonas sombreadas de estanflación y equilibrio ideal',
    'Toggle corto plazo / largo plazo',
  ],
  keywords: ['curva de Phillips', 'inflación', 'desempleo', 'NAIRU', 'estanflación', 'macroeconomía', 'Bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la curva de Phillips y qué relación establece?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La curva de Phillips describe una relación inversa entre la tasa de inflación y la tasa de desempleo a corto plazo: cuando el desempleo baja, la mayor actividad económica tiende a presionar los precios al alza; cuando el desempleo sube, la inflación suele moderarse. Fue formulada por A.W. Phillips en 1958 a partir de datos del Reino Unido 1861-1957.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el NAIRU y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El NAIRU (Non-Accelerating Inflation Rate of Unemployment) es la tasa de desempleo a la que la inflación se mantiene estable, sin acelerarse ni desacelerarse. Si el desempleo real cae por debajo del NAIRU, la inflación tiende a subir; por encima, tiende a bajar. Es un concepto central para los bancos centrales al calibrar la política monetaria, aunque no es directamente observable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la estanflación de los 70 "rompió" la curva de Phillips?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En los años 70, los shocks del petróleo de la OPEP (1973 y 1979) provocaron alta inflación y alto desempleo simultáneamente, algo que la curva de Phillips original no preveía. Este fenómeno, la estanflación, mostró que los shocks de oferta pueden desplazar la curva, haciendo que para cada nivel de desempleo la inflación sea mayor. Friedman y Phelps ya habían advertido en 1968 que las expectativas adaptativas limitaban la validez de la curva a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afectan las expectativas de inflación a la curva de Phillips?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el modelo de Friedman-Phelps, si los trabajadores y empresas esperan más inflación, la negocian en salarios y contratos, desplazando hacia arriba la curva de corto plazo. Así, una política monetaria expansiva puede reducir el desempleo a corto plazo, pero a largo plazo solo genera más inflación sin reducción permanente del paro. La curva de largo plazo es vertical en el NAIRU.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve este simulador en la preparación de un examen de economía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Permite visualizar de forma interactiva los cuatro cuadrantes económicos (recesión, estanflación, sobrecalentamiento y equilibrio ideal), mover los sliders de desempleo e inflación esperada y reproducir episodios históricos reales como la estanflación de 1973 o la crisis española de 2013. Facilita entender de forma intuitiva conceptos abstractos del temario de macroeconomía de Bachillerato y universidad.',
      },
    },
  ],
};
