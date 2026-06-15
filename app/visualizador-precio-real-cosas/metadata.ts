import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Precio Real de las Cosas - En Horas de tu Vida | meskeIA',
  description: 'Descubre cuántas horas de trabajo cuesta realmente cada compra. Traduce precios a horas de vida laboral con tu sueldo real.',
  keywords: 'precio real horas trabajo, coste oportunidad, horas de vida, sueldo hora, consumo consciente, explicador visual, finanzas personales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Precio Real de las Cosas - En Horas de tu Vida',
    description: '¿Cuántas horas de trabajo cuesta un café, un móvil o unas vacaciones? Cambia tu perspectiva sobre el dinero.',
    url: 'https://meskeia.com/visualizador-precio-real-cosas/',
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
    title: 'El Precio Real de las Cosas',
    description: 'Traduce precios a horas de trabajo. Cambia tu perspectiva sobre el consumo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Precio Real Cosas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Precio Real de las Cosas',
  description: 'Explicador visual que traduce el precio de objetos y servicios cotidianos a horas de trabajo reales. Slider de sueldo y visualización interactiva de compras cotidianas.',
  url: 'https://meskeia.com/visualizador-precio-real-cosas/',
  features: [
    'Traduce precios a horas de trabajo según tu sueldo',
    '15+ objetos y servicios cotidianos',
    'Slider de sueldo neto para personalizar',
    'Visualización en barras de horas de vida laboral',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el precio real de una compra en horas de trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio real en horas de trabajo expresa cuánto tiempo de vida laboral cuesta un bien o servicio, en lugar de expresarlo solo en dinero. Se calcula dividiendo el precio del producto entre el sueldo neto por hora. Este enfoque, popularizado por el libro "Tu dinero o tu vida", ayuda a evaluar si una compra merece el esfuerzo invertido antes de realizarla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el sueldo neto por hora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se divide el sueldo neto mensual entre el número de horas trabajadas al mes. Por ejemplo, con un sueldo neto de 1.500 € y una jornada de 160 horas mensuales, el sueldo real es 9,38 €/hora. Si se añaden desplazamientos o gastos laborales, el coste real por hora baja aún más, haciendo que las compras "caras" parezcan todavía más costosas en términos de tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve pensar en los precios como horas de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Transformar precios en horas activa una perspectiva más visceral sobre el valor del dinero. Un smartphone de 800 € equivale a más de 85 horas de trabajo al salario mínimo español (2024). Esta visión favorece el consumo consciente, reduce las compras impulsivas y facilita priorizar gastos alineados con lo que realmente importa a cada persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre precio nominal y coste de oportunidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio nominal es la cifra en euros que aparece en la etiqueta. El coste de oportunidad incluye también lo que se renuncia al gastar ese dinero: otras compras, ahorro o inversión. Pensar en horas de trabajo añade una tercera dimensión: el tiempo irreversible invertido para conseguir ese dinero, que no se puede recuperar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas de trabajo cuesta un café diario a lo largo de un año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un café de 1,50 € al día supone 547,50 € al año. Con un sueldo neto de 1.500 €/mes (≈9,38 €/h), ese hábito cuesta casi 58 horas anuales de trabajo, equivalente a más de 7 jornadas laborales completas. Visualizar el impacto acumulado de gastos pequeños pero frecuentes es uno de los ejercicios más útiles de finanzas personales.',
      },
    },
  ],
};
