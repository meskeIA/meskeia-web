import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Financiación Empresarial - Préstamo vs Leasing vs Capital - meskeIA',
  description: 'Compara préstamo bancario, leasing y ampliación de capital para una inversión. Analiza coste neto, escudo fiscal, impacto en tesorería y dilución de propiedad.',
  keywords: 'financiacion empresarial, prestamo vs leasing, ampliacion de capital, escudo fiscal, coste de financiacion, leasing financiero, dilucion socios, financiar inversion empresa, deuda vs capital, coste fondos propios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Financiación Empresarial - meskeIA',
    description: 'Préstamo bancario, leasing o ampliación de capital: compara coste, tesorería, escudo fiscal y dilución para tu próxima inversión empresarial.',
    url: 'https://meskeia.com/simulador-financiacion-empresarial/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Financiación Empresarial - meskeIA',
    description: 'Compara préstamo, leasing y ampliación de capital para financiar una inversión: coste neto, escudo fiscal, tesorería y dilución en una pantalla.',
  },
  other: {
    'application-name': 'Simulador de Financiación Empresarial meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Financiación Empresarial',
  description: 'Herramienta para comparar tres vías de financiación de una inversión empresarial: préstamo bancario, leasing (arrendamiento financiero) y ampliación de capital. Calcula el coste financiero neto después del escudo fiscal del Impuesto de Sociedades, el impacto en la tesorería, la cuota mensual, la dilución de propiedad y el efecto sobre el endeudamiento, ofreciendo un veredicto según la prioridad del usuario (coste, tesorería o control).',
  url: 'https://meskeia.com/simulador-financiacion-empresarial/',
  category: 'FinanceApplication',
  features: [
    'Compara préstamo bancario, leasing y ampliación de capital en una sola pantalla',
    'Cálculo del escudo fiscal según el tipo marginal del Impuesto de Sociedades (15%, 21% o 25%)',
    'Cuota mensual por sistema francés con valor residual para el leasing',
    'Análisis del impacto en tesorería y de la dilución de propiedad',
    'Veredicto por prioridad: menor coste, mejor tesorería o mantener el control',
    'Gráfico de coste neto comparado después de impuestos',
    'Datos del Impuesto de Sociedades 2026 (Ley 7/2024)',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es mejor para financiar una inversión: préstamo, leasing o ampliación de capital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No hay una respuesta universal: depende de tu prioridad. El préstamo bancario suele ser la opción de menor coste cuando tu nivel de endeudamiento es razonable y mantienes el 100% del control. El leasing es ideal para maquinaria y vehículos por la amortización acelerada y la recuperación del IVA. La ampliación de capital evita drenar la tesorería con cuotas, pero es la más cara a largo plazo porque cedes propiedad y el socio participa de todos los beneficios futuros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el escudo fiscal en la financiación empresarial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El escudo fiscal es el ahorro en el Impuesto de Sociedades que generan los gastos deducibles de la financiación. Los intereses de un préstamo y las cuotas de un leasing reducen la base imponible, de modo que Hacienda «devuelve» ese gasto al tipo marginal de la sociedad (15%, 21% o 25%). La ampliación de capital no genera escudo fiscal porque los dividendos no son un gasto deducible. Por eso, comparar deuda y capital sin descontar el escudo fiscal distorsiona la decisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la ampliación de capital es más cara si no hay que devolverla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque ceder una parte de un negocio rentable suele salir más caro que pagar intereses. El socio que entra espera una rentabilidad anual (habitualmente entre el 12% y el 20%) y participará de todos los beneficios futuros mientras siga siendo accionista, no solo durante el plazo de la inversión. La deuda, en cambio, se extingue cuando terminas de pagarla. Por eso el coste de los fondos propios casi siempre supera al de la deuda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja fiscal tiene el leasing frente a un préstamo bancario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El leasing financiero permite la amortización acelerada: puedes deducir la recuperación del coste del bien hasta el doble (o el triple en pymes de reducida dimensión) del coeficiente de amortización lineal. No deduces más en total, sino antes, lo que mejora la tesorería de los primeros años. Además, el IVA de las cuotas se recupera en cada declaración trimestral. A cambio, el tipo de interés del leasing suele ser algo superior al de un préstamo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Aumentar la deuda perjudica el balance de la empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del nivel de endeudamiento actual. Un ratio de endeudamiento equilibrado (deuda sobre patrimonio neto en torno a 1-1,5) es saludable, y el escudo fiscal hace la deuda atractiva. Pero si la empresa ya está muy apalancada, más deuda encarece la financiación, aumenta el riesgo financiero y puede cerrar el acceso a futuros préstamos. En ese punto, la ampliación de capital reequilibra el balance y mejora la solvencia.',
      },
    },
  ],
};
