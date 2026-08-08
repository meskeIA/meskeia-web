import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Gastos Compartidos - Quién Debe a Quién en un Grupo',
  description: 'Reparte los gastos de un viaje, una cena, un regalo conjunto o el piso compartido y calcula quién paga a quién con el menor número de transferencias. Céntimos exactos, sin registro y sin enviar datos a ningún servidor.',
  keywords: 'gastos compartidos, dividir gastos, repartir gastos viaje, quien debe a quien, gastos en grupo, dividir cuenta cena, piso compartido, regalo conjunto, liquidar cuentas amigos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-gastos-compartidos/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Gastos Compartidos - Quién Debe a Quién',
    description: 'Reparte gastos de un viaje, una cena, un regalo o el piso y calcula quién paga a quién con el menor número de transferencias.',
    url: 'https://meskeia.com/calculadora-gastos-compartidos/',
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
    title: 'Calculadora de Gastos Compartidos - meskeIA',
    description: 'Quién debe a quién tras un viaje, una cena o el mes en el piso, con los mínimos pagos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Gastos Compartidos',
  description: 'Herramienta para repartir gastos entre varias personas (viaje en grupo, cena, regalo conjunto o piso compartido) y calcular quién paga a quién con el menor número de transferencias posible.',
  url: 'https://meskeia.com/calculadora-gastos-compartidos/',
  category: 'FinanceApplication',
  features: [
    'Calcula quién paga a quién con el mínimo número de transferencias',
    'Cuatro tipos de grupo: viaje, cena o evento, regalo conjunto y piso compartido',
    'Cada gasto se reparte solo entre quienes participan en él',
    'Reparto en céntimos exactos: la suma de las partes coincide con el total',
    'Saldo individual de cada persona (lo que ha adelantado y lo que le corresponde)',
    'Resumen de la liquidación copiable para mandarlo al chat del grupo',
    'Los datos se guardan solo en el navegador, sin registro ni servidor',
  ],
  keywords: ['gastos compartidos', 'dividir gastos', 'quien debe a quien', 'viaje en grupo', 'piso compartido', 'liquidar cuentas'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula quién debe a quién después de un viaje en grupo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Primero se calcula el saldo de cada persona: lo que ha adelantado menos la parte que le corresponde de los gastos en los que participa. Quien tiene saldo positivo debe recibir dinero y quien lo tiene negativo debe pagarlo. Después se emparejan unos con otros buscando el menor número de pagos posible. Con saldos ya calculados, el número de transferencias nunca supera el de personas con saldo menos una, y suele ser menor cuando algunos subgrupos se saldan entre ellos sin tocar al resto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se reparten los céntimos cuando la división no es exacta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Repartir 10 € entre tres personas da 3,333… € por cabeza. Si se redondea cada parte a 3,33 €, la suma es 9,99 € y falta un céntimo: es el error habitual al hacerlo a mano o en una hoja de cálculo. La forma correcta es trabajar en céntimos enteros y asignar el sobrante a una de las partes, rotando de un gasto a otro para que no recaiga siempre en la misma persona. Así la suma de las partes coincide exactamente con el total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué se hace con un gasto en el que no participaron todos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada gasto debe llevar su propia lista de participantes en lugar de aplicar una regla única a todo el grupo. Si tres de las seis personas de un viaje fueron al museo, ese gasto se reparte solo entre esas tres y el saldo de las otras no cambia. Este detalle es lo que hace que el resultado se perciba como justo y evita la discusión sobre el reparto en el momento de pagar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la mejor forma de dividir la cuenta de una cena entre amigos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dividir el total a partes iguales es lo más rápido y funciona cuando todos han consumido algo parecido. Cuando no es así (dos personas no bebieron, alguien no compartió los entrantes), lo práctico no es desglosar plato a plato sino separar los conceptos claramente distintos —la bebida, por ejemplo— como gastos aparte con sus propios participantes. Se resuelve en dos apuntes y evita tener que negociar importes en la mesa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro usar una herramienta online para las cuentas del grupo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de dónde se procesen los datos. Una herramienta que funciona íntegramente en el navegador no envía los nombres ni los importes a ningún servidor, no requiere registro y no crea una cuenta con datos personales. La contrapartida es que la información no se sincroniza sola entre los miembros del grupo: lo habitual es que una persona lleve el registro y comparta el resumen de la liquidación por el canal que ya use el grupo.',
      },
    },
  ],
};
