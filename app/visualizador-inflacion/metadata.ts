import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Inflación: Por Qué Suben los Precios | meskeIA',
  description: 'Las 3 causas mecánicas de la inflación (demanda, costes, monetaria), la espiral salarios-precios, los sesgos del IPC y cómo el BCE la controla. Educativo sobre macroeconomía, no calculadora.',
  keywords: ['por qué sube la inflación', 'inflación de demanda', 'inflación de costes', 'teoría cuantitativa dinero', 'espiral salarios precios', 'IPC sesgos', 'BCE tipos de interés inflación', 'hiperinflación causas'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Inflación: Por Qué Suben los Precios | meskeIA',
    description: 'La inflación tiene 3 causas distintas — y el BCE solo puede atacar una de ellas directamente.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-inflacion/',
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
    title: 'Inflación: Por Qué Suben los Precios | meskeIA',
    description: 'Las 3 causas de la inflación, la espiral salarios-precios y los sesgos del IPC explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Visualizador Inflación meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Inflación: Por Qué Suben los Precios',
  description: 'Explicador visual interactivo sobre los mecanismos de la inflación: causas (demanda, costes, monetaria), espiral salarios-precios, sesgos del IPC y política monetaria del BCE.',
  url: 'https://meskeia.com/visualizador-inflacion/',
  category: 'EducationalApplication',
  features: [
    'Las 3 causas mecánicas de la inflación con ejemplos históricos',
    'Diagrama de la espiral salarios-precios',
    'Sesgos del IPC y por qué puede no reflejar tu inflación real',
    'Tipos de inflación: deflación, moderada, hiperinflación',
    'Mecanismo de transmisión de la política monetaria del BCE',
    'Slider interactivo de tipos de interés',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 3 causas principales de la inflación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inflación tiene tres mecanismos distintos: inflación de demanda (cuando la demanda de bienes y servicios crece más rápido que la oferta), inflación de costes (cuando suben los costes de producción —energía, materias primas, salarios— y las empresas los trasladan al precio final) e inflación monetaria (cuando aumenta la cantidad de dinero en circulación sin un crecimiento equivalente de la producción). En la práctica, un episodio inflacionario suele combinar más de un mecanismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la espiral salarios-precios y por qué preocupa a los bancos centrales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La espiral salarios-precios ocurre cuando la inflación inicial lleva a los trabajadores a exigir subidas salariales para mantener su poder adquisitivo, lo que eleva los costes laborales de las empresas, que a su vez suben precios, generando más presión salarial en el siguiente ciclo. Este bucle puede hacer que la inflación sea autosostenida y muy difícil de controlar. Los bancos centrales la temen porque requiere subidas de tipos de interés más agresivas para romperla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el IPC puede no reflejar la inflación que sientes en tu vida diaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IPC es un promedio ponderado de una cesta de bienes representativa de un hogar tipo. Si tu gasto se concentra en categorías que suben más que la media (alquiler, energía, alimentación básica) tu inflación percibida será mayor. Además, el IPC incluye sustitución de productos, mejoras de calidad y no recoge bien los bienes de lujo ni la geografía local, por lo que puede diferir significativamente de la experiencia individual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo controla el BCE la inflación subiendo los tipos de interés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando el BCE sube el tipo de interés de referencia, encarece el crédito bancario: las hipotecas, los préstamos empresariales y el consumo financiado se vuelven más caros. Esto reduce la demanda agregada y frena la espiral salarial. Sin embargo, la transmisión tarda 12-18 meses en afectar plenamente a la economía real. Además, este mecanismo es eficaz contra la inflación de demanda y monetaria, pero poco eficaz contra la inflación de costes (como una crisis energética).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre deflación, inflación moderada e hiperinflación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deflación (caída generalizada de precios) puede parecer beneficiosa pero desincentiva el consumo e inversión al anticipar precios aún más bajos, y puede desencadenar recesiones. La inflación moderada (1-3%) se considera óptima porque facilita los ajustes de precios relativos y reduce la carga real de las deudas. La hiperinflación (generalmente >50% mensual) destruye el valor de la moneda, paraliza la economía y requiere reformas monetarias drásticas; los casos históricos más conocidos son la Alemania de Weimar (1923) y Zimbabwe (2008).',
      },
    },
  ],
};
