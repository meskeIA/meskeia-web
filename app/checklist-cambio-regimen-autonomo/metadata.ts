import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Cambio de Régimen Autónomo — De Módulos a Estimación Directa | meskeIA',
  description: 'Checklist interactivo para autónomos que quieren cambiar del régimen de módulos (estimación objetiva) a estimación directa simplificada. Plazos, modelos y pasos legales en España 2025.',
  keywords: 'cambio módulos estimación directa, renunciar módulos IRPF, modelo 036 renuncia módulos, cuándo dejar módulos autónomo, estimación directa simplificada ventajas, checklist cambio régimen fiscal autónomo, plazo renuncia módulos noviembre',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Cambio de Régimen Autónomo — Módulos a Estimación Directa | meskeIA',
    description: 'Guía y checklist paso a paso para renunciar a módulos y cambiar a estimación directa simplificada. Plazos legales, modelo 036/037, obligaciones y consejos.',
    url: 'https://meskeia.com/checklist-cambio-regimen-autonomo/',
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
    title: 'Cambiar de Módulos a Estimación Directa — Checklist 2025 | meskeIA',
    description: 'Checklist interactivo para autónomos: pasos, plazos y modelos para cambiar de régimen fiscal en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Checklist Cambio Régimen Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist Cambio de Régimen Autónomo — Módulos a Estimación Directa',
  description: 'Checklist interactivo para autónomos que quieren cambiar del régimen de estimación objetiva (módulos) a estimación directa simplificada o normal en España. Incluye evaluación previa, gestión de la renuncia y adaptación al nuevo régimen, con plazos, modelos fiscales y obligaciones legales.',
  url: 'https://meskeia.com/checklist-cambio-regimen-autonomo/',
  features: [
    'Checklist en 3 fases: evaluar, renunciar y adaptarse',
    'Orientador: ¿cuándo conviene el cambio?',
    'Plazos legales actualizados (noviembre-diciembre)',
    'Modelos 036/037, 130 y 303',
    'Progreso guardado en sessionStorage',
    'Tabla comparativa de regímenes fiscales',
    'Gratuito y sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo conviene cambiar de módulos a estimación directa como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cambio suele resultar ventajoso cuando los gastos reales superan el rendimiento neto calculado por módulos, es decir, cuando la actividad genera menos beneficio del que Hacienda le asigna mediante índices. También conviene analizar el cambio si el volumen de negocio ha crecido mucho (en 2025 el límite para módulos es de 250.000 € de ingresos anuales), si se quieren compensar pérdidas de ejercicios anteriores, o si los clientes exigen facturas con IVA deducible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el plazo para renunciar a módulos y cambiar de régimen fiscal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La renuncia al régimen de módulos (estimación objetiva) debe presentarse durante el mes de diciembre del año anterior a aquel en que se quiere que surta efecto, mediante el modelo 036 o 037 marcando la casilla correspondiente. Si se inicia una actividad nueva, la renuncia puede hacerse en el momento de la declaración censal de inicio. La renuncia tiene efectos mínimos de tres años, salvo que se produzca un cambio de actividad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué obligaciones contables nuevas implica pasar a estimación directa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En estimación directa simplificada hay que llevar libro registro de ingresos, gastos, bienes de inversión y provisiones. En estimación directa normal (ingresos superiores a 600.000 €) la contabilidad debe ajustarse al Plan General Contable. En ambos casos se pasa a presentar el modelo 130 de pagos fraccionados del IRPF (en lugar del 131 de módulos) y, si corresponde, el modelo 303 de IVA trimestral.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo volver a módulos después de haber renunciado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, pero hay un período mínimo de permanencia de tres años en estimación directa antes de poder revocar la renuncia y solicitar volver a módulos. La revocación debe presentarse igualmente en diciembre del año anterior al que se quiere aplicar, con el modelo 036/037. Además, la actividad debe seguir cumpliendo los requisitos de módulos vigentes en ese momento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre estimación directa simplificada y estimación directa normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estimación directa simplificada aplica a autónomos cuyo volumen de negocio no supera los 600.000 € anuales y que no han renunciado expresamente a ella; permite amortizar por tablas simplificadas y deducir un 5% del rendimiento neto como gastos de difícil justificación. La estimación directa normal obliga a contabilidad completa según el PGC y ofrece mayor flexibilidad para deducir gastos reales, pero con más carga administrativa.',
      },
    },
  ],
};
