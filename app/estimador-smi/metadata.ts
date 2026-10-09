import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_SMI_META, COTIZACIONES_SS_2026, SMI_2026 } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

// Cotización del trabajador y neto del FAQ, derivados de los mismos datos que la app (cabo
// C0015): decía «6,35 %» (sin el MEI) y «1.060-1.080 euros netos», cuando la app da 6,50 % y
// 1.141,64 €/mes en 14 pagas (CASO de tests/apps/estimador-smi.spec.ts). Con el SMI la cuota
// de IRPF queda en cero (lo comprueba ese mismo caso): si un SMI futuro la hiciera positiva, el
// spec dejaría de cuadrar con esta cuenta.
const TIPO_SS_TRABAJADOR = COTIZACIONES_SS_2026.contingenciasComunes + COTIZACIONES_SS_2026.desempleo
  + COTIZACIONES_SS_2026.formacionProfesional + COTIZACIONES_SS_2026.mef;
const NETO_ANUAL_SMI = SMI_2026.anual * (1 - TIPO_SS_TRABAJADOR / 100);

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_SMI_META.vigencia;

export const metadata: Metadata = {
  title: `Estimador SMI ${anio} — Neto, Atrasos y Comparativa Provincial | meskeIA`,
  description: 'Calcula tu sueldo neto con el SMI 2026 (1.221 €/mes × 14 pagas), los atrasos retroactivos desde enero y compara el SMI con el salario medio de tu provincia.',
  keywords: 'SMI 2026, salario mínimo interprofesional, SMI neto, atrasos SMI, SMI por provincia, 1221 euros, salario mínimo España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Estimador SMI ${anio} — Neto, atrasos y comparativa provincial`,
    description: 'SMI 2026: 1.221 €/mes. Calcula tu neto, los atrasos retroactivos y compara con el sueldo medio de tu provincia.',
    url: 'https://meskeia.com/estimador-smi/',
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
    title: `Estimador SMI ${anio} — ¿Cuánto cobras neto?`,
    description: 'Calcula tu neto con el nuevo SMI, los atrasos retroactivos y compara con tu provincia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador SMI meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimador SMI 2026',
  description: 'Herramienta completa del Salario Mínimo Interprofesional 2026 en España. Calcula tu sueldo neto mensual con el SMI (1.221 € × 14 pagas), estima los atrasos retroactivos desde enero y compara el SMI con el salario medio de las 52 provincias españolas.',
  url: 'https://meskeia.com/estimador-smi/',
  features: [
    'Cálculo de sueldo neto con SMI 2026 (IRPF + Seguridad Social)',
    'Estimación de atrasos retroactivos (SMI 2026 vs SMI 2025)',
    'Comparativa SMI vs salario medio en las 52 provincias',
    'Datos oficiales: BOE RD 126/2026 + AEAT 2023',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto es el SMI en 2026 en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Salario Mínimo Interprofesional (SMI) para 2026 se fijó en 1.221 euros brutos al mes en 14 pagas, lo que equivale a 17.094 euros brutos anuales. Este importe fue aprobado mediante el Real Decreto 126/2026 y representa un incremento respecto al SMI de 2025 (1.184 €/mes). El SMI se aplica a todos los trabajadores por cuenta ajena en España, con independencia de su sector o categoría profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se cobra neto con el SMI 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El importe neto del SMI 2026 depende de la situación personal del trabajador (estado civil, hijos a cargo, discapacidad), pero como referencia orientativa, una persona soltera sin hijos cobraría unos ${formatNumber(NETO_ANUAL_SMI / 14, 0)} euros netos al mes en 14 pagas (${formatNumber(NETO_ANUAL_SMI / 12, 0)} en 12). La cuota de IRPF queda en cero a este nivel salarial; lo que se descuenta es la cotización a la Seguridad Social del trabajador (${formatNumber(TIPO_SS_TRABAJADOR, 2)}\u00A0% sobre el salario bruto).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los atrasos del SMI y cómo se calculan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los atrasos del SMI son las diferencias salariales entre el SMI anterior y el nuevo, correspondientes a los meses transcurridos desde enero hasta la fecha de publicación del Real Decreto que fija el nuevo importe. Si en 2026 se cobró 1.184 €/mes de enero a marzo y el nuevo SMI (1.221 €) se aprueba en abril, la empresa debe abonar la diferencia (37 € × 3 meses = 111 €) en concepto de atrasos. Estos atrasos tributan como rendimientos del trabajo en el IRPF del año en que se perciben.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El SMI es igual en todas las provincias de España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SMI es una cifra nacional uniforme que aplica igual en todas las comunidades autónomas y provincias. Sin embargo, la comparación con el coste de vida o el salario medio varía mucho por territorio: el SMI representa un porcentaje mayor del salario medio en provincias como Jaén o Badajoz (donde el salario medio está más próximo al SMI) que en Madrid o País Vasco, donde el salario medio es considerablemente más alto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A quién se aplica el SMI y hay excepciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SMI se aplica a todos los trabajadores por cuenta ajena mayores de 18 años, con independencia del convenio colectivo o del tipo de contrato (indefinido, temporal, a tiempo parcial). En contratos a tiempo parcial, el SMI se prorratea proporcionalmente a las horas trabajadas. Los trabajadores menores de 18 años pueden percibir un SMI reducido, y los empleados del hogar y algunos colectivos especiales tienen regulaciones específicas.',
      },
    },
  ],
};
