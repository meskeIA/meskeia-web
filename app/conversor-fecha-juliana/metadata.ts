import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// S0271 (12/11/2026). «fecha juliana» se teclea tal cual (Bing, 6 meses: «fecha juliana» 65,
// «fecha juliana 2026» 33, «fecha juliana hoy» 8) y nombra DOS cosas: el día del año que la
// industria imprime en los lotes (26316) y el día juliano de los astrónomos (2.451.545,0). El
// título nombra la búsqueda y las dos lecturas; calculadora-fechas no la atendía y está muerta.
export const metadata: Metadata = {
  title: 'Fecha Juliana: Convertir Fecha, Día del Año, Código de Lote y Día Juliano | meskeIA',
  description:
    'Convierte una fecha en fecha juliana (día del año y código de lote AADDD, AAAADDD o ADDD) y al revés, y calcula el día juliano astronómico (JD y MJD) de cualquier fecha y hora.',
  keywords:
    'fecha juliana, fecha juliana hoy, fecha juliana 2026, convertir fecha juliana, codigo juliano, codigo de lote juliano, dia del año, numero de dia del año, dia juliano, julian date, JD, MJD, fecha ordinal ISO 8601',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fecha Juliana: Día del Año, Código de Lote y Día Juliano',
    description:
      'De la fecha al código juliano y del código a la fecha (26316 = 12/11/2026), más el día juliano astronómico de cualquier fecha y hora.',
    url: 'https://meskeia.com/conversor-fecha-juliana/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fecha Juliana: Conversor',
    description: 'Día del año, código de lote (AADDD, ADDD) y día juliano astronómico, en los dos sentidos.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Conversor de Fecha Juliana meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de Fecha Juliana',
  description:
    'Convierte fechas en fecha juliana —el día del año y los códigos de lote AADDD, AAAADDD y ADDD— y descifra esos códigos de vuelta a la fecha. Calcula además el día juliano astronómico (JD) y el modificado (MJD) de una fecha y hora en tiempo universal, con el cambio del calendario juliano al gregoriano de 1582.',
  url: 'https://meskeia.com/conversor-fecha-juliana/',
  category: 'UtilityApplication',
  features: [
    'Día del año y días que faltan para terminarlo',
    'Códigos de lote AADDD, AAAADDD y ADDD, y fecha ordinal ISO 8601 (AAAA-DDD)',
    'Lectura de un código juliano de 3, 4, 5 o 7 cifras, con las otras décadas o siglos posibles',
    'Día juliano astronómico (JD) y modificado (MJD) de una fecha y hora en tiempo universal',
    'Del día juliano a la fecha, la hora y el día de la semana',
    'Calendario juliano hasta el 4/10/1582 y gregoriano desde el 15/10/1582, como en astronomía',
  ],
});

// FAQ — fuente única de la FAQ visible (page.tsx la importa y la pinta) y del FAQPage de abajo.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué es la fecha juliana?',
    answer:
      'Con ese nombre se llaman dos cosas distintas. En la industria, la alimentación y la logística, la fecha juliana es el número de día del año: el 1 de enero es el 001 y el 31 de diciembre, el 365 (366 en año bisiesto), y se imprime en los lotes junto al año, como 26316 para el 12/11/2026. En astronomía, el día juliano (JD) es la cuenta continua de días desde el mediodía del 1 de enero del 4713 a. C., con decimales para la hora: el 1/1/2000 a las 12:00 en tiempo universal es el 2.451.545,0.',
  },
  {
    question: '¿Cómo se lee el código juliano de un lote?',
    answer:
      'Las tres últimas cifras son el día del año y las de delante, el año. 26316 (AADDD) es el día 316 de 2026, el 12 de noviembre; 2026316 (AAAADDD) es la misma fecha con el año entero; y 6316 (ADDD) lleva solo la última cifra del año, así que podría ser 2026, 2016 o 2036. Por eso, con códigos de 4 y 5 cifras, la app toma el año más probable y enseña las otras lecturas posibles.',
  },
  {
    question: '¿El código juliano de un envase es la fecha de caducidad?',
    answer:
      'Normalmente no. Suele indicar el día de fabricación o de envasado, y cada fabricante elige su formato, que a veces añade letras de planta o de turno. La fecha que vale para consumir un producto es la de consumo preferente o de caducidad impresa como tal. El código juliano sirve para saber cuándo se hizo un lote, por ejemplo para identificar uno retirado del mercado.',
  },
  {
    question: '¿Qué número de día del año es hoy?',
    answer:
      'La app lo calcula al abrirla con la fecha de tu dispositivo. Como referencia, el 1 de febrero es el día 032, el 1 de marzo es el 060 en un año normal y el 061 en uno bisiesto, el 1 de julio es el 182 (183 en bisiesto) y el 31 de diciembre, el 365 o el 366. Los años bisiestos son los divisibles entre 4, salvo los de siglo que no lo son entre 400: 2000 lo fue y 1900, no.',
  },
  {
    question: '¿Para qué sirve el día juliano astronómico (JD)?',
    answer:
      'Para restar fechas sin tropezar con meses de distinta longitud, años bisiestos ni cambios de calendario: el tiempo entre dos observaciones es la resta de sus JD. Lo usan la astronomía, la geodesia y la programación de órbitas. El día juliano modificado (MJD) es el JD menos 2.400.000,5, que empieza a medianoche y da números más cortos: el 1/1/1970 a las 0:00 es el MJD 40.587.',
  },
  {
    question: '¿Por qué el día juliano empieza a mediodía?',
    answer:
      'Porque se pensó para astrónomos que observan de noche: si el día cambiara a medianoche, una misma sesión de observación quedaría repartida entre dos fechas. La cuenta la propuso John Herschel en el siglo XIX a partir del periodo juliano de 7.980 años que había definido Joseph Scaliger en 1583, que empieza el 1 de enero del 4713 a. C. El nombre viene del calendario juliano, no de la fecha juliana de los lotes.',
  },
  {
    question: '¿Qué pasa con las fechas anteriores a 1582?',
    answer:
      'Para el día juliano, la app usa el calendario juliano hasta el jueves 4 de octubre de 1582 y el gregoriano desde el viernes 15, que fue el día siguiente: los días 5 a 14 de ese mes no existieron y se rechazan. Es el convenio de la astronomía. Muchos países adoptaron el calendario gregoriano más tarde (el Reino Unido en 1752, Rusia en 1918), así que una fecha histórica de esos lugares puede estar escrita en el calendario antiguo.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
