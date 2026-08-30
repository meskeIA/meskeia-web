import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Pesetas a Euros - Valor Real Hoy | meskeIA',
  description: 'Convierte pesetas a euros al tipo de cambio oficial (166,386 ptas/€) y descubre cuánto valdría esa cantidad hoy según la inflación acumulada desde 1961.',
  keywords: 'conversor pesetas a euros, pesetas a euros, cuanto es en euros, tipo de cambio peseta, 166386, cuanto valdria hoy, pesetas euros calculadora, moneda española antigua',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Pesetas a Euros - meskeIA',
    description: 'Conversión oficial pesetas/euros y valor real hoy ajustado por inflación desde 1961',
    url: 'https://meskeia.com/conversor-pesetas-euros/',
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
    title: 'Conversor de Pesetas a Euros - meskeIA',
    description: 'Conversión oficial y valor real hoy de cantidades en pesetas',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Conversor Pesetas Euros meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de Pesetas a Euros',
  description: 'Convierte pesetas a euros al tipo de cambio oficial fijo (166,386 ptas/€) en ambas direcciones, y calcula cuánto valdría hoy una cantidad en pesetas de un año concreto según la inflación acumulada del IPC del INE.',
  url: 'https://meskeia.com/conversor-pesetas-euros/',
  category: 'FinanceApplication',
  features: [
    'Conversión oficial pesetas ↔ euros al tipo fijo legal (166,386 ptas/€)',
    'Cálculo del valor real hoy de una cantidad en pesetas de cualquier año desde 1961',
    'Datos de inflación del IPC del INE',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es el tipo de cambio oficial de pesetas a euros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo de cambio oficial es 1 euro = 166,386 pesetas, fijado de forma irrevocable por el Reglamento (CE) 2866/98 del Consejo de la Unión Europea el 31 de diciembre de 1998. No es un tipo de mercado que fluctúe: es una equivalencia legal fija que nunca ha cambiado ni cambiará.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre convertir pesetas a euros y calcular su valor real hoy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Convertir es solo cambiar de unidad monetaria al tipo fijo (166,386 ptas/€): 100.000 pesetas son siempre 601,01 €, sin importar el año. Pero esos 601,01 € de 1985 no compraban lo mismo que 601,01 € de hoy. El "valor real hoy" añade el efecto de la inflación acumulada desde ese año usando el IPC del INE, y por eso da una cifra distinta y mucho mayor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Todavía se pueden cambiar pesetas físicas por euros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El plazo de canje de billetes y monedas de peseta en el Banco de España terminó el 30 de junio de 2021. Hasta el 30 de junio de 2002 se podía cambiar también en cualquier entidad bancaria. Las pesetas físicas que queden hoy ya no tienen valor liberatorio, aunque algunas piezas raras pueden tener valor numismático para coleccionistas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hasta cuándo se pagó en pesetas en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El euro y la peseta circularon a la vez del 1 de enero al 28 de febrero de 2002. Desde el 1 de marzo de 2002, el euro es la única moneda de curso legal en España. El tipo de cambio fijo, sin embargo, ya estaba establecido desde el 1 de enero de 1999.',
      },
    },
    {
      '@type': 'Question',
      name: '¿De dónde salen los datos para calcular el valor real hoy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De la misma serie histórica del Índice de Precios al Consumo (IPC) del INE que usa el Estimador de Inflación de meskeIA, disponible desde 1961. La fórmula es: valor hoy = (pesetas ÷ 166,386) × (IPC del año actual ÷ IPC del año de referencia).',
      },
    },
  ],
};
