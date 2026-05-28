import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test: ¿Estoy obligado a declarar la Renta 2025? | meskeIA',
  description: 'Descubre en 2 minutos si estás obligado a presentar la declaración de la Renta 2025-2026. Umbrales actualizados: 22.000 €, 15.876 €, varios pagadores, desempleo, IMV.',
  keywords: 'obligado declarar renta 2025, declaración renta obligatoria, límite renta 2025, varios pagadores IRPF, campaña renta 2026, AEAT',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Estoy obligado a declarar la Renta 2025? — Test rápido',
    description: 'Test interactivo para saber si debes presentar la declaración de IRPF 2025. Umbrales actualizados, desempleo, IMV y más.',
    url: 'https://meskeia.com/test-obligado-declarar-renta/',
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
    title: '¿Estoy obligado a declarar la Renta 2025?',
    description: 'Test rápido con los umbrales actualizados de la campaña 2026.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test Obligación Declarar Renta meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test: ¿Estoy obligado a declarar la Renta 2025?',
  description: 'Test interactivo que evalúa tu situación fiscal para determinar si estás obligado a presentar la declaración de la Renta 2025 en la campaña 2026. Incluye umbrales por rendimientos del trabajo, capital mobiliario, varios pagadores, desempleo, IMV y deducciones.',
  url: 'https://meskeia.com/test-obligado-declarar-renta/',
  features: [
    'Evaluación personalizada en 7 preguntas',
    'Umbrales IRPF 2025 actualizados (22.000 € / 15.876 €)',
    'Contempla desempleo, IMV, varios pagadores y deducciones',
    'Resultado inmediato con explicación detallada',
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
      name: '¿Cuánto hay que ganar para estar obligado a declarar la Renta en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la campaña de la Renta 2025 (ejercicio fiscal 2024, que se presenta en 2026) el límite general para rendimientos del trabajo con un único pagador es de 22.000 € brutos anuales. Si se tienen dos o más pagadores y el segundo pagador superó los 1.500 €, el umbral baja a 15.876 €. Estos límites son orientativos porque existen otras circunstancias que pueden generar obligación independientemente del importe.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tengo que declarar si he cobrado el paro o el Ingreso Mínimo Vital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación por desempleo (paro) tiene la consideración de rendimiento del trabajo y puede generar obligación de declarar, especialmente si junto con otros ingresos superas los umbrales establecidos. El Ingreso Mínimo Vital (IMV) está exento de IRPF hasta 11.279,39 € anuales, pero debe consignarse igualmente en la declaración; además, los beneficiarios del IMV están obligados a declarar con independencia de su nivel de ingresos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si no estoy obligado pero quiero presentar la declaración igualmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Presentar la declaración de forma voluntaria cuando no existe obligación es completamente legal y en muchos casos resulta beneficioso. Si la declaración te sale a devolver (por retenciones en exceso, deducciones autonómicas, deducción por maternidad, etc.) solo podrás recuperar esas cantidades si la presentas. La Agencia Tributaria no devuelve automáticamente retenciones practicadas de más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo empieza y acaba la campaña de la Renta 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La campaña de la Renta 2025 (declaración del ejercicio 2024) se inicia habitualmente en abril de 2026 con la apertura de Renta WEB de la AEAT, y el plazo ordinario de presentación finaliza el 30 de junio de 2026. El plazo para declaraciones con resultado a ingresar domiciliadas en cuenta concluye antes, normalmente el 25 de junio. Las fechas exactas las publica la AEAT cada año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si estoy obligado y no presento la declaración de la Renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No presentar la declaración cuando existe obligación puede acarrear sanciones de la Agencia Tributaria. Si la declaración salía a devolver, la sanción es de 200 € fijos. Si salía a pagar, la sanción oscila entre el 50% y el 150% de la cuota dejada de ingresar, a lo que se suman los recargos e intereses de demora. Presentar de forma extemporánea pero voluntaria (antes de requerimiento de la AEAT) reduce significativamente las penalizaciones.',
      },
    },
  ],
};
