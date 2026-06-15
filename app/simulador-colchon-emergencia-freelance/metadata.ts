import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Colchon de Emergencia Freelance | meskeIA',
  description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual. Proyeccion mes a mes con semaforo de riesgo para autonomos en Espana.',
  keywords: 'colchon emergencia, fondo emergencia freelance, ahorro autonomo, meses sin ingresos, supervivencia financiera, RETA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Colchon de Emergencia Freelance | meskeIA',
    description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual. Semaforo de riesgo y objetivos de ahorro.',
    url: 'https://meskeia.com/simulador-colchon-emergencia-freelance/',
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
    title: 'Simulador de Colchon de Emergencia Freelance | meskeIA',
    description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Colchon Emergencia Freelance meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Colchon de Emergencia Freelance',
  description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual. Introduce tus gastos fijos, cuota RETA, gastos profesionales y ahorro disponible para ver una proyeccion mes a mes con semaforo de riesgo.',
  url: 'https://meskeia.com/simulador-colchon-emergencia-freelance/',
  category: 'FinanceApplication',
  features: [
    'Calculo de meses de supervivencia sin ingresos',
    'Semaforo de riesgo con 5 niveles',
    'Proyeccion mes a mes con barras visuales',
    'Desglose porcentual de gastos con donut CSS',
    'Objetivos de ahorro a 3 y 6 meses',
    'Disponible en espanol',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos meses de ahorro debería tener un freelance como colchón de emergencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación habitual para autónomos es acumular entre 3 y 6 meses de gastos totales (personales + profesionales + cuota RETA). Tres meses cubre imprevistos cortos: una baja, un cliente que no paga o un mes sin contratos. Seis meses proporciona margen para una reestructuración de negocio o una crisis de demanda más prolongada. A mayor variabilidad en los ingresos, más conveniente es apuntar a 6 meses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos hay que incluir al calcular el colchón de emergencia de un autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El colchón debe cubrir todos los gastos que seguirán existiendo sin ingresos: alquiler o hipoteca, alimentación, suministros, seguros personales, cuota RETA, suscripciones de herramientas profesionales (software, dominio, hosting), y si aplica, salario de empleados o colaboradores fijos. Un error frecuente es calcular solo los gastos personales y olvidar la parte profesional fija.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el colchón de emergencia del fondo de vacaciones de un autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El colchón de emergencia cubre situaciones no planificadas: enfermedad, pérdida de cliente principal, crisis económica o avería importante. El fondo de vacaciones, en cambio, es un ahorro planificado para descansar sin incurrir en deudas. Idealmente un autónomo gestiona ambos por separado, porque mezclarlos deja al descubierto uno de los dos objetivos cuando hay que usar el dinero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la cuota RETA al cálculo del colchón de emergencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota de autónomos se paga mensualmente aunque no haya ingresos, lo que la convierte en uno de los gastos más relevantes del colchón. En 2025, la cuota mínima RETA ronda los 200-300 € al mes según la base elegida. Al simular el colchón de emergencia, hay que incluirla como gasto fijo mensual junto al resto, ya que no se puede interrumpir la cotización sin darse de baja como autónomo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo se tarda en construir un colchón de emergencia de 6 meses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la capacidad de ahorro mensual. Si los gastos totales son 2.000 € al mes, el objetivo a 6 meses es 12.000 €. Ahorrando 300 € mensuales se alcanza en 40 meses; con 500 € mensuales, en 24 meses. La clave es empezar con una aportación fija automatizada y revisarla al alza cada vez que los ingresos aumenten, antes de elevar el gasto personal.',
      },
    },
  ],
};
