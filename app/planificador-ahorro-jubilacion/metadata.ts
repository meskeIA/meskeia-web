import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_PLAN_PENSIONES_META, TRAMOS_IRPF_2025, TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_PLAN_PENSIONES_META.vigencia;

/**
 * Los extremos de las dos escalas del FAQPage, de data/fiscal. Hasta el 19/10/2026 iban
 * tecleados, y el del ahorro decía «entre 19% y 28%», el máximo de 2023-2024: desde el
 * 1/1/2025 acaba en el 30 % (Ley 7/2024). Cabo C0036, la misma forma que el C0092 de
 * comparador-autonomo-vs-sl.
 */
const pct = (n: number) => `${formatNumber(n, 0)} %`;
const extremos = (escala: { tipo: number }[]) =>
  `entre el ${pct(escala[0].tipo)} y el ${pct(escala[escala.length - 1].tipo)}`;

export const metadata: Metadata = {
  title: `Planificador de Ahorro para la Jubilación ${anio} — Brecha, ahorro y plan de pensiones | meskeIA`,
  description: 'Calcula tu brecha de jubilación, cuánto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones y la proyección de capital acumulado por escenarios.',
  keywords: 'brecha jubilacion, ahorro jubilacion, plan de pensiones, diferencia pension sueldo, cuanto ahorrar jubilacion, deduccion irpf plan pensiones, pension complementaria, proyeccion capital jubilacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Planificador de Ahorro para la Jubilación ${anio} | meskeIA`,
    description: 'Brecha, ahorro necesario, ventaja fiscal del plan de pensiones y proyección de capital.',
    url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
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
    title: `Planificador de Ahorro para la Jubilación ${anio} | meskeIA`,
    description: 'Brecha, ahorro, plan de pensiones y proyección de capital para tu jubilación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Ahorro Jubilación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Ahorro para la Jubilación',
  description: 'Planificador completo de ahorro para la jubilación: calcula tu brecha entre sueldo y pensión, cuánto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones (deducción IRPF) y la proyección de capital acumulado por escenarios (conservador, moderado, agresivo).',
  url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
  features: [
    'Cálculo de brecha entre sueldo y pensión',
    'Ahorro mensual necesario para cubrir la diferencia',
    'Ventaja fiscal del plan de pensiones (IRPF 2026)',
    'Proyección de capital por 3 escenarios de rentabilidad',
    'Pensión complementaria estimada',
  ],
});

// Cabo C0570 (15/11/2026): el JSON-LD daba una tasa de reemplazo del 74 % sin fuente y la visible solo
// el ejemplo. Cifra de la OCDE, Pensions at a Glance 2023, ficha de España (p. 5): tasa de reemplazo
// bruta del 80,4 % (neta 86,5 %) para el salario medio, carrera completa desde los 22 años en 2022 y
// jubilación a los 65; media de la OCDE para el mismo perfil, 50,7 %. La proyección ya aplica las
// reglas legisladas, así que no se añade que «podría reducirse».
export const RESPUESTA_FAQ_BRECHA =
  'Es la diferencia entre tu sueldo y tu pensión pública futura: si cobras 3.000 € al mes y tu pensión será de 1.800 €, la brecha es de 1.200 € al mes. En España la pensión pública cubre una parte del sueldo mayor que en la mayoría de países: según la OCDE (Pensions at a Glance 2023), quien cobre el salario medio y cotice una carrera completa, de los 22 a los 65 años, recibiría el 80,4\u00A0% de su sueldo bruto, frente al 50,7\u00A0% de media en la OCDE. Es una proyección: con una carrera más corta, lagunas de cotización o un sueldo por encima de la base máxima, la brecha es mayor, y por eso conviene calcular tu caso.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A qué edad se jubila normalmente en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026, la edad ordinaria de jubilación en España es de 66 años y 10 meses si se tienen menos de 38 años y 3 meses cotizados. Para quienes acrediten 38 años y 3 meses o más de cotización, la edad de jubilación ordinaria se mantiene en 65 años. La edad de jubilación ordinaria seguirá aumentando hasta alcanzar los 67 años en 2027.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos años hay que cotizar para recibir el 100% de la pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para percibir el 100% de la base reguladora se necesitan en 2026 un total de 36 años y 6 meses cotizados (36,5 años), un periodo transitorio fijado por la Ley 21/2021 que aumenta escalón a escalón hasta los 37 años de 2027. Con menos años cotizados se aplican porcentajes reductores: entre 15 y 36 años, la pensión oscila entre el 50% y el 98,86%. El mínimo para acceder a la jubilación ordinaria es 15 años cotizados, de los cuales 2 deben estar en los últimos 15 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la brecha de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_FAQ_BRECHA,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta deducción fiscal tiene un plan de pensiones en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aportaciones a planes de pensiones individuales se deducen de la base imponible del IRPF con un límite de 1.500 € anuales (o el 30% de los rendimientos del trabajo y actividades económicas, si es menor). Con un tipo marginal del 37% y aportación de 1.500 €, el ahorro fiscal es de 555 € anuales. Los planes de empresa tienen límites adicionales más altos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un plan de pensiones y un fondo de inversión para la jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El plan de pensiones ofrece deducción fiscal en la aportación pero tributa como rendimiento del trabajo en el rescate (tipo ${extremos(TRAMOS_IRPF_2025)}) y es ilíquido hasta la jubilación salvo supuestos excepcionales. El fondo de inversión no da deducción en la aportación pero tributa como ganancia patrimonial en el rescate (tipo ${extremos(TRAMOS_GANANCIAS_PATRIMONIALES_2025)}) y es líquido en cualquier momento. Para rentas altas en activo con tramo marginal alto, el plan de pensiones suele ser más eficiente fiscalmente.`,
      },
    },
  ],
};
