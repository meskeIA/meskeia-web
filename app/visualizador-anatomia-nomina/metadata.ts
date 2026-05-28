import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de una Nómina - Explicador Visual Interactivo | meskeIA',
  description: 'Entiende cada línea de tu nómina española. Nómina ficticia interactiva: haz clic en cada concepto y descubre qué significa y por qué se descuenta.',
  keywords: 'nómina española, entender nómina, devengos, deducciones, base cotización, IRPF nómina, explicador visual, conceptos nómina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de una Nómina - Explicador Visual',
    description: 'Nómina ficticia interactiva: cada línea explicada. Devengos, deducciones, bases de cotización.',
    url: 'https://meskeia.com/visualizador-anatomia-nomina/',
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
    title: 'Anatomía de una Nómina - Explicador Visual',
    description: 'Haz clic en cada línea de la nómina y descubre qué significa.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Anatomía Nómina meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de una Nómina',
  description: 'Explicador visual interactivo de una nómina española. Cada concepto (devengos, deducciones, bases de cotización, IRPF) es clickable y despliega una explicación clara de qué es, cómo se calcula y por qué importa.',
  url: 'https://meskeia.com/visualizador-anatomia-nomina/',
  features: [
    'Nómina ficticia interactiva con datos de ejemplo',
    'Explicación de cada concepto al hacer clic',
    'Secciones: devengos, deducciones, bases de cotización, líquido',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los devengos en una nómina española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los devengos son todas las cantidades que el empleado tiene derecho a percibir: salario base, complementos salariales (antigüedad, nocturnidad, productividad), horas extra y pagas extraordinarias prorrateadas. La suma de todos los devengos forma el salario bruto antes de aplicar deducciones. Es la parte positiva de la nómina, lo que la empresa te aporta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el salario neto es menor que el bruto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al salario bruto se le restan dos tipos de deducciones: las cotizaciones a la Seguridad Social a cargo del trabajador (contingencias comunes ~4,7%, desempleo ~1,55%, formación ~0,1%) y la retención del IRPF, cuyo porcentaje varía según los ingresos anuales y la situación familiar. Estas deducciones no son un descuento sino anticipos del trabajador para financiar pensiones, desempleo y la declaración de la renta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la base de cotización y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base de cotización es el importe sobre el que se calculan las cuotas de la Seguridad Social. Se obtiene sumando el salario mensual más la parte proporcional de las pagas extra, y está sujeta a un mínimo y un máximo que actualiza el Gobierno cada año. Determina la cuantía futura de prestaciones como la pensión de jubilación, la baja por enfermedad o la prestación por desempleo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la retención del IRPF en la nómina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La empresa aplica un porcentaje de retención a cuenta del IRPF sobre el salario bruto menos las cotizaciones sociales del trabajador. Ese porcentaje lo calcula Hacienda en función de los ingresos anuales previstos, las circunstancias personales (hijos, discapacidad, situación familiar) y las deducciones aplicables. Al hacer la declaración de la renta, si se ha retenido de más, Hacienda devuelve; si es de menos, el trabajador paga la diferencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la nómina que paga la empresa y lo que recibe el trabajador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste real para la empresa es mayor que el salario bruto del trabajador: la empresa también paga cuotas patronales a la Seguridad Social (contingencias comunes ~23,6%, desempleo ~5,5%, FOGASA, formación…), lo que supone en torno al 30-33% adicional sobre el bruto. Por ejemplo, si tu bruto son 2.000 €/mes, la empresa puede estar pagando unos 2.600-2.700 € en total. El trabajador solo ve en su nómina la parte a su cargo.',
      },
    },
  ],
};
