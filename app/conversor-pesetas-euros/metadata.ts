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
    // Espacio duro antes del % (CLAUDE.md global §2; hallazgo 3578)
    'Funciona 100 % en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

/**
 * Las preguntas frecuentes, UNA sola vez: las pinta page.tsx y de aquí sale el FAQPage.
 *
 * Hallazgo 3575 (27/10/2026): la FAQ visible y el FAQPage respondían por separado a las mismas
 * cinco preguntas con textos distintos (la visible de los datos callaba por qué no se usa el año
 * en curso). La pregunta de los decimales (hallazgo 3576) entra también en el FAQPage.
 */
export const PREGUNTAS_FRECUENTES: {
  pregunta: string;
  respuesta: string;
  nota: { etiqueta: string; texto: string };
}[] = [
  {
    pregunta: '¿Cuál es el tipo de cambio oficial de pesetas a euros?',
    respuesta:
      'El tipo de cambio oficial es 1 euro = 166,386 pesetas, fijado de forma irrevocable por el Reglamento (CE) 2866/98 del Consejo de la Unión Europea, de 31 de diciembre de 1998. No es un tipo de mercado: es una equivalencia legal fija que nunca ha fluctuado ni lo hará.',
    nota: { etiqueta: 'Tip', texto: 'Para pasar de pesetas a euros, divide entre 166,386. Para el camino inverso, multiplica.' },
  },
  {
    pregunta: '¿Qué diferencia hay entre convertir pesetas a euros y calcular su valor real hoy?',
    respuesta:
      'Convertir es solo cambiar de unidad monetaria al tipo fijo (166,386 ptas/€): 100.000 pesetas son siempre 601,01 €, sin importar el año. Pero esos 601,01 € de 1985 no compraban lo mismo que 601,01 € de hoy. El "valor real hoy" añade el efecto de la inflación acumulada desde ese año usando el IPC del INE, y por eso da una cifra distinta y mucho mayor.',
    nota: {
      etiqueta: 'Ejemplo',
      texto: '100.000 pesetas de 1970 son siempre 601,01 € al cambio oficial, pero representaban un poder adquisitivo muy superior al de 601,01 € actuales.',
    },
  },
  {
    pregunta: '¿Todavía se pueden cambiar pesetas físicas por euros?',
    respuesta:
      'No. El plazo de canje de billetes y monedas de peseta en el Banco de España terminó el 30 de junio de 2021. Hasta el 30 de junio de 2002 se podía cambiar también en cualquier entidad bancaria. Las pesetas físicas que queden hoy ya no tienen valor liberatorio, aunque algunas piezas raras pueden tener valor numismático para coleccionistas.',
    nota: {
      etiqueta: 'Alternativa',
      texto: 'Si son billetes o monedas antiguas, poco comunes o en buen estado, un numismático puede valorarlas por su interés de colección, al margen de su valor facial.',
    },
  },
  {
    pregunta: '¿Hasta cuándo se pagó en pesetas en España?',
    respuesta:
      'El euro y la peseta circularon a la vez del 1 de enero al 28 de febrero de 2002. Desde el 1 de marzo de 2002, el euro es la única moneda de curso legal en España. El tipo de cambio fijo, sin embargo, ya estaba establecido desde el 1 de enero de 1999, así que los precios se venían mostrando en las dos monedas antes del cambio físico.',
    nota: {
      etiqueta: 'Dato',
      texto: 'Esos tres años de doble indicación de precios (1999-2002) sirvieron para que el público se familiarizara con la nueva moneda antes de su circulación física.',
    },
  },
  {
    pregunta: '¿De dónde salen los datos para calcular el valor real hoy?',
    respuesta:
      'De la misma serie histórica del Índice de Precios al Consumo (IPC) del INE que usa el Estimador de Inflación de meskeIA, disponible desde 1961. La fórmula es: valor hoy = (pesetas ÷ 166,386) × (IPC del último año cerrado ÷ IPC del año de referencia). Se usa el último año cerrado y no el corriente porque el índice del año en curso todavía no tiene media anual publicada.',
    nota: {
      etiqueta: 'Relacionado',
      texto: 'Si quieres comparar dos años cualquiera en euros (sin pesetas de por medio), usa el Estimador de Inflación.',
    },
  },
  {
    // Hallazgo 3576: lo atribuía al valor de mercado frente al ECU. El número de cifras lo fija
    // la norma: art. 4.1 del Reglamento (CE) 1103/97, consultado en boe.es (DOUE-L-1997-81104)
    // el 27/10/2026: «Se adoptarán con seis cifras significativas».
    pregunta: '¿Por qué el tipo de cambio tiene tantos decimales (166,386)?',
    respuesta:
      'Porque lo manda la norma: el artículo 4.1 del Reglamento (CE) 1103/97 dispone que los tipos de conversión se adopten como un euro expresado en cada moneda nacional y «con seis cifras significativas». La peseta tiene tres cifras enteras (166), así que le quedan tres decimales; una moneda con una sola cifra entera lleva cinco.',
    nota: {
      etiqueta: 'Comparación',
      texto: 'El franco francés se fijó en 6,55957 francos por euro y el marco alemán en 1,95583 marcos por euro: una cifra entera y cinco decimales, seis cifras significativas, como los 166,386 de la peseta.',
    },
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map(({ pregunta, respuesta }) => ({
    '@type': 'Question',
    name: pregunta,
    acceptedAnswer: { '@type': 'Answer', text: respuesta },
  })),
};
