import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de masa de pizza: harina, agua, sal y levadura | meskeIA',
  description:
    'Calcula los gramos exactos de harina, agua, sal, levadura y aceite para tu masa de pizza según el número de bolas, su peso y el estilo (napolitana, romana, americana). Con porcentaje del panadero. Gratis y en español.',
  keywords:
    'calculadora masa pizza, masa pizza napolitana proporciones, cuanta harina para pizza, hidratacion masa pizza, bolas de masa pizza gramos, receta masa pizza casera, porcentaje panadero pizza',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de masa de pizza',
    description:
      'Los gramos exactos de harina, agua, sal, levadura y aceite para tus bolas de masa, según el estilo de pizza.',
    url: 'https://meskeia.com/calculadora-masa-pizza',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de masa de pizza',
    description:
      'Harina, agua, sal, levadura y aceite para tu pizza con porcentaje del panadero y estilos predefinidos.',
  },
  other: {
    'application-name': 'Calculadora masa de pizza meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/calculadora-masa-pizza/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de masa de pizza',
  description:
    'Calcula los ingredientes de la masa de pizza (harina, agua, sal, levadura y aceite) en gramos a partir del número de bolas, el peso por bola y el estilo de pizza, usando el sistema de porcentaje del panadero. Incluye estilos napolitano, romano, americano y al estilo pan.',
  url: 'https://meskeia.com/calculadora-masa-pizza/',
  features: [
    'Estilos predefinidos: napolitana, romana, americana y focaccia',
    'Cálculo por porcentaje del panadero',
    'Ajusta número de bolas, peso, hidratación, sal, levadura y aceite',
    'Resultado en gramos exactos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánta harina necesito para una pizza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una bola de masa para una pizza individual suele pesar entre 200 y 280 gramos, de los cuales la harina es algo más del 60%. Para una bola napolitana de 250 gramos salen unos 155 gramos de harina y 96 de agua. La calculadora te da los gramos exactos según el número de bolas y el estilo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hidratación lleva la masa de pizza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hidratación es el porcentaje de agua respecto a la harina. La napolitana ronda el 60-65%, la romana fina baja al 55-58% para quedar crujiente, y las masas tipo pan o focaccia suben al 70-75%. A más hidratación, miga más abierta pero masa más difícil de manejar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el porcentaje del panadero en la pizza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un sistema en el que la harina es siempre el 100% y el resto de ingredientes se expresan como porcentaje de ella. Así, "65% de hidratación y 2,5% de sal" significa 65 gramos de agua y 2,5 de sal por cada 100 de harina. Permite escalar la receta a cualquier cantidad manteniendo las proporciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta levadura lleva la masa de pizza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Muy poca: entre el 0,3 y el 0,6% de levadura seca respecto a la harina, sobre todo si haces fermentaciones largas. Cuanto más tiempo y más temperatura, menos levadura necesitas. Para levados de 24 horas o más en nevera, basta con un 0,2-0,3%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debe pesar cada bola de masa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del tamaño y el estilo: unos 250 gramos para una napolitana de unos 30 cm, 200 para una romana fina y 280 o más para una americana o de molde. Para una pizza familiar grande puedes subir a 350-400 gramos por bola.',
      },
    },
  ],
};
