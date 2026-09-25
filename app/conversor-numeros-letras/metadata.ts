import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Números a Letras: escribir cantidades e importes en palabras - meskeIA',
  description: 'Convierte cifras a letras con las reglas del español: veintiún euros, doscientas una libras, cien mil. Para cheques, pagarés, contratos y facturas. Con 17 monedas y formato 00/100.',
  keywords: 'numeros a letras, cantidades en letras, importe en letras, escribir numeros con letras, cifras a texto, numero a palabras, cantidad en letra cheque, pagare importe en letras, monto en letras, conversor numeros letras',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/conversor-numeros-letras/',
  },
  openGraph: {
    type: 'website',
    title: 'Números a Letras: cantidades e importes escritos en palabras',
    description: 'Escribe cualquier cifra en letras con las reglas del español. Para cheques, pagarés y contratos, con 17 monedas y formato 00/100.',
    url: 'https://meskeia.com/conversor-numeros-letras/',
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
    title: 'Números a Letras: cantidades en palabras',
    description: 'De 3.847,50 € a «tres mil ochocientos cuarenta y siete euros con cincuenta céntimos». Con las reglas del español bien aplicadas.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de Números a Letras',
  description: 'Escribe cifras e importes en letras aplicando las reglas del español: apócope (veintiún euros), concordancia de género (doscientas una libras), cien frente a ciento y escala larga (mil millones, no un billón). Admite 17 monedas de España y Latinoamérica y el formato 00/100 de cheques y facturas.',
  url: 'https://meskeia.com/conversor-numeros-letras/',
  category: 'UtilityApplication',
  features: [
    'Apócope y concordancia de género resueltas según la moneda',
    'Cien frente a ciento y escala larga del español (10⁹ es mil millones)',
    '17 monedas de España y Latinoamérica, con su subunidad correcta',
    'Formato 00/100 para cheques y facturas, y opción de omitir decimales',
    'Salida en mayúsculas conservando las tildes',
    'Modo número suelto, con los decimales leídos cifra a cifra',
    'Copiar el resultado con un clic y ejemplos listos para probar',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Se escribe veintiún euros o veintiuno euros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Veintiún euros. Cuando el numeral va delante del sustantivo, «uno» se apocopa: un euro, veintiún euros, treinta y un euros. La forma plena «veintiuno» solo aparece cuando el número se dice suelto, sin nada detrás. Y si el sustantivo es femenino, concuerda con él: veintiuna libras, treinta y una pesetas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se escribe cien y cuándo ciento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cien cuando son exactamente 100 o cuando multiplica: cien euros, cien mil, cien millones. Ciento cuando le sigue otro número menor: ciento uno, ciento veinte, ciento cincuenta. El error habitual es escribir «cien veinte» o «ciento mil», ninguno de los dos es correcto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué 1.000.000.000 se escribe mil millones y no un billón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el español usa la escala larga: un billón son un millón de millones, es decir 10¹². Lo que en inglés se llama «billion» (10⁹) en español son mil millones. Es una fuente clásica de errores al traducir cifras de prensa económica anglosajona, donde un «billion» multiplicado por mil no equivale a nuestro billón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se escribe un importe en letras en un cheque o un pagaré?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se escribe la cantidad entera en letras seguida de la moneda, y los decimales o bien en letras («con cincuenta céntimos») o bien como fracción sobre cien («con 50/100»), forma muy extendida en Latinoamérica. Si la cifra en números y la escrita en letras no coinciden, la legislación mercantil suele dar preferencia a la escrita en letras, que es precisamente la razón de que se pida por duplicado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Lleva tilde el importe escrito en mayúsculas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Las mayúsculas se acentúan igual que las minúsculas: VEINTIÚN EUROS, DIECISÉIS, TRESCIENTOS VEINTIDÓS. La idea de que las mayúsculas no llevan tilde viene de las limitaciones de las máquinas de escribir y de las primeras imprentas, no de ninguna norma ortográfica.',
      },
    },
    {
      '@type': 'Question',
      // Hallazgo 1707 (25/09/2026): negaba «tres coma cuarenta y cinco» y daba solo la lectura
      // cifra a cifra. DPD, s. v. «números» §3.4. Mismo texto que la FAQ visible de page.tsx.
      name: '¿Cómo se escribe 3,45 en letras: «tres coma cuarenta y cinco» o «tres coma cuatro cinco»?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un documento, con la parte entera y después la decimal como número, unidas por «con» o por «y»: «tres con cuarenta y cinco centésimas», que es la forma que da el Diccionario panhispánico de dudas. Leer la coma, sea «tres coma cuarenta y cinco» o «tres coma cuatro cinco», es frecuente y admisible al hablar, pero no apropiado en textos técnicos, administrativos o contables. Si es dinero, los céntimos forman número: 3,45 € son «tres euros con cuarenta y cinco céntimos».',
      },
    },
  ],
};
