import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de la Deuda Pública | Bonos, Prima de Riesgo y Sostenibilidad | meskeIA',
  description:
    'Cómo funciona la deuda soberana: emisión de bonos (Letras, Bonos, Obligaciones), prima de riesgo, quién financia la deuda española y sostenibilidad (ratio r vs g).',
  keywords: [
    'deuda publica',
    'bonos soberanos',
    'prima de riesgo',
    'bono español',
    'yield',
    'Tesoro Publico',
    'sostenibilidad deuda',
    'deficit publico',
  ],
  openGraph: {
    title: 'Visualizador de la Deuda Pública | meskeIA',
    description:
      'Deuda soberana explicada: bonos, prima de riesgo, quién la financia y sostenibilidad.',
    url: 'https://meskeia.com/visualizador-deuda-publica/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Deuda Pública - Bonos, Prima de Riesgo y Sostenibilidad",
  description: "Cómo funciona la deuda soberana: emisión de bonos (Letras, Bonos, Obligaciones), prima de riesgo, quién financia la deuda española y sostenibilidad (ratio r vs g).",
  url: "https://meskeia.com/visualizador-deuda-publica/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la deuda pública y cómo la emite un Estado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deuda pública es el conjunto de obligaciones financieras que un Estado contrae al pedir prestado dinero para financiar su gasto cuando los ingresos tributarios no son suficientes. Se emite mediante subastas de títulos de renta fija: Letras del Tesoro (hasta 12 meses), Bonos del Estado (2-5 años) y Obligaciones del Estado (10-50 años). Los inversores prestan dinero al Estado a cambio de un tipo de interés (cupón) y la devolución del principal al vencimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la prima de riesgo y cómo se interpreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prima de riesgo es la diferencia entre el tipo de interés que paga un país por sus bonos a 10 años y el que paga Alemania (considerado el referente de máxima solvencia en la zona euro). Se mide en puntos básicos (100 pb = 1%). Una prima alta indica que los mercados perciben mayor riesgo de impago; durante la crisis de deuda europea (2012), la prima española llegó a superar los 600 pb.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién financia la deuda pública española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deuda española está en manos de una combinación de tenedores: inversores extranjeros (bancos, fondos de pensiones y aseguradoras internacionales), el Banco de España (por las compras del programa del BCE), entidades financieras españolas y, en menor medida, inversores minoristas a través de Letras del Tesoro. El porcentaje en manos externas ronda el 40-50% del total, según datos del Tesoro Público.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es sostenible la deuda pública según el ratio r vs g?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio r vs g compara el tipo de interés real de la deuda (r) con el crecimiento real de la economía (g). Si r < g, la economía crece más rápido que el coste de la deuda y el ratio deuda/PIB tiende a reducirse de forma natural, haciendo la deuda sostenible. Si r > g, el peso de la deuda crece aunque haya equilibrio presupuestario. Este principio, popularizado por el economista Olivier Blanchard, fundamenta los debates actuales sobre política fiscal en la zona euro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre déficit público y deuda pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El déficit público es el desequilibrio anual entre los ingresos y gastos del Estado en un ejercicio: si el Estado gasta más de lo que ingresa, incurre en déficit ese año. La deuda pública es el stock acumulado de todos los déficits pasados pendientes de devolver. Un país puede tener déficit cero en un año y aun así mantener una deuda elevada por los préstamos acumulados en ejercicios anteriores.',
      },
    },
  ],
};
