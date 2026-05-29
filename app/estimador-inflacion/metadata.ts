import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Inflación - Poder Adquisitivo Histórico | meskeIA',
  description: 'Calcula cómo la inflación afecta tu dinero. Datos del IPC del INE desde 1961. Descubre cuánto valían tus euros en el pasado y cuánto necesitas hoy.',
  keywords: 'inflacion, ipc, poder adquisitivo, ine, precios, coste vida, devaluacion, calculadora inflacion, españa, historico',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Inflación - meskeIA',
    description: 'Calcula el impacto de la inflación en tu dinero con datos históricos del INE desde 1961',
    url: 'https://meskeia.com/estimador-inflacion/',
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
    title: 'Estimador de Inflación - meskeIA',
    description: 'Descubre cómo la inflación afecta tu poder adquisitivo con datos del INE',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Inflación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Inflación",
  description: "Calcula cómo la inflación afecta tu dinero. Datos del IPC del INE desde 1961. Descubre cuánto valían tus euros en el pasado y cuánto necesitas hoy.",
  url: "https://meskeia.com/estimador-inflacion/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la inflación y cómo afecta al poder adquisitivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inflación es el aumento generalizado y sostenido de los precios de bienes y servicios en una economía. Cuando los precios suben, cada euro compra menos cosas que antes: eso es la pérdida de poder adquisitivo. Por ejemplo, con una inflación media del 3% anual, 1.000 € de hoy equivalen aproximadamente a 744 € en términos de capacidad de compra dentro de diez años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el IPC y por qué se usa para medir la inflación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Índice de Precios al Consumo (IPC) es el indicador oficial que mide la variación de precios de una cesta representativa de bienes y servicios que compran los hogares: alimentación, vivienda, transporte, ocio, etc. En España lo publica el INE (Instituto Nacional de Estadística) mensualmente. Es el indicador más utilizado para medir la inflación porque refleja directamente el impacto en el coste de vida de las familias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto ha subido el precio de vida en España desde los años 80 o 90?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según los datos históricos del IPC del INE, los precios en España se han multiplicado aproximadamente por 4 desde 1985 y por 2,5 desde 1995. Esto significa que algo que costaba 100 € en 1985 cuesta hoy en torno a 400 €. La inflación acumulada fue especialmente intensa en los años 70-80 (llegó al 25% anual) y mucho más moderada desde la entrada en el euro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo calcular el equivalente de una cantidad de dinero en otro año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula es: importe ajustado = importe original × (IPC año destino / IPC año origen). La calculadora aplica esta fórmula automáticamente usando los datos oficiales del INE desde 1961 hasta el año más reciente disponible. Solo tienes que introducir la cantidad, el año de origen y el año de destino para obtener el equivalente en poder adquisitivo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué mis ahorros en el banco pierden valor si la inflación supera al tipo de interés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando la inflación es mayor que la rentabilidad de tu depósito o cuenta, el rendimiento real es negativo: aunque el saldo nominal crece, la capacidad de compra de ese dinero disminuye. Por ejemplo, si tienes un depósito al 1% pero la inflación es del 4%, pierdes en términos reales un 3% de poder adquisitivo cada año. Por eso los ahorradores buscan inversiones con rendimiento real positivo (por encima de la inflación).',
      },
    },
  ],
};
