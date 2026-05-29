import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Vida — ¿Necesitas uno y qué cobertura? | meskeIA',
  description: 'Test de 10 preguntas para saber si necesitas un seguro de vida, qué tipo te conviene (temporal, ahorro o mixto) y qué capital asegurado necesitas. Análisis según cargas familiares, hipoteca y situación económica.',
  keywords: ['necesito seguro de vida', 'cuánto seguro de vida necesito', 'seguro vida temporal o ahorro', 'seguro vida hipoteca España', 'seguro vida con hijos', 'capital asegurado seguro vida', 'seguro vida autónomo', 'cuándo contratar seguro de vida', 'seguro vida o no', 'tipos seguro de vida España'],
  openGraph: {
    title: '¿Necesitas seguro de vida? Test orientativo | meskeIA',
    description: 'Descubre si necesitas un seguro de vida y qué tipo te conviene según tus cargas familiares, hipoteca y situación económica.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-seguro-vida/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Seguro de vida sí o no? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para saber si necesitas seguro de vida y qué cobertura te conviene.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-seguro-vida/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Seguro de Vida',
      description: 'Test orientativo para saber si se necesita seguro de vida y qué tipo conviene (temporal, ahorro, mixto o ninguno) según cargas familiares, hipoteca y situación.',
      url: 'https://meskeia.com/selector-seguro-vida/',
      features: [
        'Test de 10 preguntas sobre situación familiar y económica',
        '4 opciones: temporal, ahorro/vida entera, mixto, ninguno por ahora',
        'Análisis de cargas familiares e hipoteca',
        'Orientación de capital asegurado necesario',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Seguro de Vida",
  description: "Test de 10 preguntas para saber si necesitas un seguro de vida, qué tipo te conviene (temporal, ahorro o mixto) y qué capital asegurado necesitas. Análisis según cargas familiares, hipoteca y situació",
  url: "https://meskeia.com/selector-seguro-vida/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo es necesario contratar un seguro de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un seguro de vida tiene sentido cuando otras personas dependen económicamente de tus ingresos: hijos menores a cargo, pareja sin ingresos propios suficientes o padres dependientes. También es recomendable si tienes una hipoteca importante, ya que cubre la deuda pendiente en caso de fallecimiento y evita que la carga recaiga sobre los herederos. Si eres soltero sin dependientes y sin deudas significativas, la necesidad es mucho menor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un seguro de vida temporal y uno de vida entera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El seguro de vida temporal cubre un período concreto (5, 10, 20 o 30 años) y paga el capital solo si el asegurado fallece dentro de ese plazo; es más barato y es el más habitual para cubrir hipotecas o la crianza de hijos. El seguro de vida entera o ahorro garantiza el pago del capital en cualquier momento (fallecimiento o supervivencia a una edad determinada) y tiene un componente de ahorro; su prima es más elevada. Para la mayoría de situaciones de protección familiar, el temporal ofrece mejor relación coste-beneficio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto capital asegurado necesito en un seguro de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una regla orientativa habitual es cubrir entre 5 y 10 veces los ingresos anuales netos del asegurado, más el capital pendiente de la hipoteca si la hay. Por ejemplo, con 30.000 € netos anuales, 2 hijos y 100.000 € de hipoteca pendiente, el capital recomendado estaría entre 250.000 y 400.000 €. El cálculo exacto depende de los gastos fijos del hogar, el patrimonio acumulado y los años que los dependientes necesitarán apoyo económico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El banco puede obligarme a contratar un seguro de vida vinculado a la hipoteca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Desde la Ley de Contratos de Crédito Inmobiliario de 2019, los bancos no pueden obligar a contratar el seguro de vida con ellos ni con una entidad vinculada. Pueden ofrecer bonificaciones en el tipo de interés a cambio de domiciliar el seguro, pero debes poder presentar una póliza equivalente de cualquier aseguradora de tu elección. Contratar el seguro de forma independiente puede suponer un ahorro de hasta el 40-60% respecto a las pólizas bancarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la edad y el estado de salud al precio del seguro de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La edad es el factor que más influye en la prima: contratar a los 30 años cuesta aproximadamente la mitad que hacerlo a los 45, para el mismo capital asegurado. El estado de salud se declara mediante un cuestionario médico; enfermedades crónicas, tabaquismo o historial familiar de ciertas patologías pueden encarecer la prima o generar exclusiones. Por ello, contratar pronto y cuando se está sano es la estrategia más económica a largo plazo.',
      },
    },
  ],
};
