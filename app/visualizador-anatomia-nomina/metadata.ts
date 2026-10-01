import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatCurrency, formatPercentage } from '@/lib';
import { ANIO_NOMINA, TIPOS_EMPRESA, TIPOS_TRABAJADOR, aCentimos } from './motor';

// Tipos del FAQPage: los mismos de la nómina de ejemplo, importados de @/data/fiscal vía
// motor.ts. Nada se teclea aquí (hallazgos 2525, 2529 y 2531, 01/10/2026).
const pct = (tipo: number): string => formatPercentage(tipo / 100, 2);
const T = TIPOS_TRABAJADOR;
const E = TIPOS_EMPRESA;
const tipoEmpresa = aCentimos(
  E.contingenciasComunes + E.desempleoIndefinido + E.fogasa + E.formacionProfesional + E.mei,
);
const BASE_EJEMPLO = 2000;

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
        text: `Al salario bruto se le restan dos tipos de deducciones. Las cotizaciones a la Seguridad Social a cargo del trabajador (en ${ANIO_NOMINA}: contingencias comunes ${pct(T.contingenciasComunes)}, desempleo ${pct(T.desempleo)} en un contrato indefinido, formación profesional ${pct(T.formacionProfesional)} y Mecanismo de Equidad Intergeneracional ${pct(T.mef)}), que financian las pensiones, el paro y las bajas. Y la retención del IRPF, un pago a cuenta del impuesto cuyo porcentaje depende de los ingresos anuales y de la situación personal y familiar, y que se ajusta en la declaración de la renta.`,
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
        text: 'El tipo de retención lo calcula la empresa, que es quien paga y retiene, con el procedimiento del Reglamento del IRPF: parte de las retribuciones anuales previstas, les resta las cotizaciones a la Seguridad Social y otras reducciones, tiene en cuenta los mínimos personales y familiares (hijos, discapacidad, situación familiar) y obtiene un porcentaje. Ese porcentaje se aplica después a la cuantía total de lo que se cobra en cada nómina. En la declaración de la renta se regulariza: si se ha retenido de más, Hacienda devuelve; si de menos, el trabajador paga la diferencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la nómina que paga la empresa y lo que recibe el trabajador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El coste real para la empresa es mayor que el salario bruto del trabajador: la empresa paga sus propias cuotas a la Seguridad Social, que en ${ANIO_NOMINA} suman un ${pct(tipoEmpresa)} sobre la base de cotización (contingencias comunes ${pct(E.contingenciasComunes)}, desempleo ${pct(E.desempleoIndefinido)} en un contrato indefinido, FOGASA ${pct(E.fogasa)}, formación profesional ${pct(E.formacionProfesional)} y Mecanismo de Equidad Intergeneracional ${pct(E.mei)}), más la tarifa de accidentes de trabajo, que depende de la actividad. Por ejemplo, con una base de ${formatCurrency(BASE_EJEMPLO)} al mes, la empresa paga ${formatCurrency(aCentimos((BASE_EJEMPLO * tipoEmpresa) / 100))} más esa tarifa. El trabajador solo ve en su nómina la parte a su cargo.`,
      },
    },
  ],
};
