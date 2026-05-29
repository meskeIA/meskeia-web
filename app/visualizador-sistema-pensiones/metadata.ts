import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sistema de Pensiones: Reparto, Demografía y Reformas — meskeIA',
  description: 'Visualizador del sistema de pensiones español. Reparto vs capitalización, ratio trabajadores/pensionistas (1975-2050), gasto en pensiones, timeline de reformas y proyecciones AIREF.',
  keywords: [
    'sistema pensiones España',
    'reparto vs capitalización pensiones',
    'ratio trabajadores pensionistas',
    'reforma pensiones 2023 Escrivá',
    'AIREF proyecciones pensiones',
    'fondo reserva pensiones',
    'pacto de Toledo',
    'sostenibilidad pensiones demografía',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Sistema de Pensiones: Reparto, Demografía y Reformas — meskeIA',
    description: 'Cómo funciona el sistema de pensiones español y por qué está bajo presión demográfica.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-sistema-pensiones/',
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
    title: 'Sistema de Pensiones Español — Visualizador',
    description: 'Reparto vs capitalización, ratio trabajadores/pensionistas, reformas y proyecciones AIREF.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema de Pensiones meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sistema de Pensiones: Reparto, Demografía y Reformas',
  description: 'Visualizador educativo del sistema de pensiones español. Muestra cómo funciona el reparto, la presión demográfica (1975-2050), el gasto histórico, el timeline de reformas y las proyecciones AIREF hasta 2050.',
  url: 'https://meskeia.com/visualizador-sistema-pensiones/',
  features: [
    'Comparativa reparto vs capitalización con visualización SVG',
    'Slider interactivo del ratio trabajadores/pensionistas (1975-2050)',
    'Datos clave del gasto en pensiones 2024',
    'Timeline de reformas del sistema (1995-2027)',
    'Proyecciones de gasto AIREF hasta 2050',
    'Evolución del Fondo de Reserva (hucha de las pensiones)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el sistema de pensiones de reparto en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el sistema de reparto, las cotizaciones sociales que pagan los trabajadores activos financian directamente las pensiones de los jubilados actuales. No existe un fondo acumulado para cada persona: es una transferencia intergeneracional. España usa este modelo desde 1963 y en 2024 destina alrededor del 13% del PIB al pago de pensiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué está bajo presión el sistema de pensiones español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El envejecimiento demográfico es la causa principal. En 1975 había 6 trabajadores por cada pensionista; en 2024 la ratio es de aproximadamente 2,3 y en 2050 podría caer a 1,7 según proyecciones AIREF. Menos cotizantes y más pensionistas durante más años generan un desequilibrio financiero creciente que requiere reformas o mayor financiación pública.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre reparto y capitalización en pensiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el sistema de capitalización cada trabajador acumula en una cuenta individual sus aportaciones más los rendimientos de su inversión. Al jubilarse cobra su propio fondo, no el de otros. Países como Chile o Suecia (parcialmente) usan este modelo. El reparto es más redistributivo y protege frente a crisis financieras, pero depende del equilibrio demográfico; la capitalización es más predecible individualmente, pero expone al riesgo de mercado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cambios introdujo la reforma de pensiones de 2023 en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La reforma Escrivá (Ley 21/2021 y modificaciones 2023) subió gradualmente la cotización máxima mediante la "Cuota de Solidaridad" para bases altas, amplió el período de cómputo para el cálculo de la pensión a 25 años opcionalmente, e indexó las pensiones al IPC. También reforzó el Fondo de Reserva (hucha de las pensiones) con el Mecanismo de Equidad Intergeneracional (MEI), un recargo del 0,6% sobre las cotizaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto gasta España en pensiones y qué proyecta la AIREF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2024 el gasto en pensiones contributivas supera los 190.000 millones de euros, cerca del 13% del PIB. La Autoridad Independiente de Responsabilidad Fiscal (AIREF) proyecta que el gasto podría alcanzar entre el 15% y el 17% del PIB hacia 2050 si no se adoptan medidas adicionales, principalmente por el efecto de la jubilación de la generación del baby boom español (nacidos entre 1957 y 1977).',
      },
    },
  ],
};
