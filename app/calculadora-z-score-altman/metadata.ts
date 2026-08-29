import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora del Z-Score de Altman - Riesgo de Quiebra - meskeIA',
  description: 'Calcula el Z-Score de Altman de una empresa a partir de su balance y predice su riesgo de insolvencia. Tres modelos: cotizada, pyme industrial y servicios.',
  keywords: 'z-score altman, riesgo de quiebra, prediccion insolvencia, analisis de balance, solvencia empresa, modelo altman, salud financiera empresa, ratios financieros, z-score pyme, insolvencia empresarial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora del Z-Score de Altman - meskeIA',
    description: 'Mide el riesgo de insolvencia de una empresa con el Z-Score de Altman. Zona segura, gris o de insolvencia, con los tres modelos según el tipo de empresa.',
    url: 'https://meskeia.com/calculadora-z-score-altman/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora del Z-Score de Altman - meskeIA',
    description: 'Introduce el balance de una empresa y obtén su Z-Score de Altman: zona segura, gris o de insolvencia. Tres modelos según el tipo de empresa.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora del Z-Score de Altman meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora del Z-Score de Altman',
  description: 'Herramienta para calcular el Z-Score de Altman de una empresa a partir de las magnitudes de su balance y cuenta de resultados, estimando su riesgo de insolvencia a dos años. Incluye los tres modelos de Altman (Z original para cotizadas, Z\' para pymes industriales y Z\'\' para empresas de servicios), clasifica la empresa en zona segura, gris o de insolvencia y muestra el desglose de la contribución de cada ratio a la puntuación.',
  url: 'https://meskeia.com/calculadora-z-score-altman/',
  category: 'FinanceApplication',
  features: [
    'Tres modelos de Altman: Z (cotizadas), Z\' (pymes industriales) y Z\'\' (servicios)',
    'Clasificación automática en zona segura, gris o de insolvencia',
    'Desglose visual de la contribución de cada uno de los cinco ratios',
    'Barra de zonas con marcador de la puntuación obtenida',
    'Datos de empresa de ejemplo precargados',
    'Coeficientes y umbrales que se ajustan automáticamente al modelo elegido',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Z-Score de Altman y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Z-Score de Altman es un modelo estadístico creado por el profesor Edward Altman en 1968 que combina cinco ratios del balance en una única puntuación para estimar la probabilidad de que una empresa entre en insolvencia en los dos años siguientes. Cuanto más alta es la puntuación, más sólida es la empresa. Se usa en banca, análisis de crédito y due diligence en todo el mundo como señal de alerta temprana de dificultades financieras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué modelo de Z-Score debo usar para mi empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del tipo de empresa. Si cotiza en bolsa y es industrial, se usa el modelo original (Z, 1968), que necesita el valor de mercado de las acciones. Si es una pyme industrial que no cotiza, el modelo Z\' (1983), el más habitual, que sustituye ese dato por el valor contable del patrimonio neto. Si es una empresa de servicios o comercio, el modelo Z\'\' (1995), que elimina la rotación de activos porque varía mucho entre sectores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significan las zonas segura, gris y de insolvencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Z-Score sitúa a la empresa en tres zonas. La zona segura indica baja probabilidad de insolvencia (por ejemplo, Z\' superior a 2,90). La zona gris es un rango intermedio donde el modelo no puede clasificar con fiabilidad y recomienda vigilancia. La zona de insolvencia (por ejemplo, Z\' inferior a 1,23) señala una probabilidad elevada de dificultades financieras graves a dos años. Los umbrales exactos cambian según el modelo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable el Z-Score para una empresa española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo fue calibrado con empresas estadounidenses del siglo XX, por lo que sus umbrales no son una ley universal: pueden no ajustarse a sectores muy intensivos en capital, empresas tecnológicas o realidades contables distintas. Es una herramienta de cribado muy útil para detectar señales de alerta, pero no un veredicto. Debe complementarse con el análisis del flujo de caja, el sector y la calidad de la gestión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué datos necesito para calcular el Z-Score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las magnitudes del balance y la cuenta de resultados: activo corriente y total, pasivo corriente y total, reservas (beneficios retenidos), resultado de explotación (EBIT) y cifra de negocio. En los modelos Z\' y Z\'\' se usa el patrimonio neto contable; en el modelo original, el valor de mercado de las acciones. Para empresas españolas, las cuentas anuales depositadas en el Registro Mercantil contienen todos estos datos.',
      },
    },
  ],
};
