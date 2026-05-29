import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de tu Dinero Mensual - ¿Adónde va tu sueldo? | meskeIA',
  description: 'Visualiza cómo se reparte el sueldo medio español: vivienda, alimentación, transporte, ocio, seguros y ahorro. Bloques interactivos con slider de sueldo.',
  keywords: 'reparto sueldo mensual, gastos mensuales, presupuesto personal, vivienda transporte alimentación, finanzas personales, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de tu Dinero Mensual',
    description: '¿Adónde va tu sueldo? Visualiza el reparto mensual medio en España.',
    url: 'https://meskeia.com/visualizador-mapa-dinero-mensual/',
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
    title: 'El Mapa de tu Dinero Mensual',
    description: 'Vivienda, comida, transporte... ¿adónde va tu sueldo cada mes?',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa Dinero Mensual meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de tu Dinero Mensual',
  description: 'Explicador visual del reparto mensual del sueldo en España: vivienda, alimentación, transporte, suministros, ocio, seguros, ropa y ahorro. Slider de sueldo personalizable.',
  url: 'https://meskeia.com/visualizador-mapa-dinero-mensual/',
  features: [
    'Reparto del sueldo en 10 categorías de gasto',
    'Slider de sueldo neto personalizable',
    'Bloques clickables con explicación y dato INE',
    'Barra de reparto proporcional visual',
    'Gráfico doughnut de composición',
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
      name: '¿En qué se gasta el sueldo medio en España cada mes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según los datos de la Encuesta de Presupuestos Familiares del INE, la vivienda (alquiler o hipoteca) es la mayor partida y absorbe alrededor del 30 % del presupuesto familiar. Le siguen alimentación (~15 %), transporte (~12 %), suministros (~6 %), ocio y restauración (~7 %) y seguros (~4 %). El porcentaje destinado al ahorro varía enormemente según el nivel de ingresos, pero la media se sitúa por debajo del 10 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se destina a vivienda del sueldo mensual en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación financiera habitual es no superar el 30 % del ingreso neto en vivienda (alquiler o hipoteca más suministros). Sin embargo, en ciudades como Madrid o Barcelona el alquiler medio supera ese umbral para muchos perfiles de sueldo medio. El Banco de España considera que una familia con un esfuerzo hipotecario superior al 35 % tiene dificultades para cubrir el resto de necesidades básicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el sueldo medio neto en España en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El salario medio bruto en España ronda los 27.000-28.000 € anuales según la Encuesta de Estructura Salarial del INE (últimos datos publicados). Tras aplicar las retenciones de IRPF y la cotización a la Seguridad Social, el neto mensual de un trabajador con ese salario se sitúa aproximadamente entre 1.400 € y 1.600 € netos al mes, dependiendo de la situación personal y la comunidad autónoma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se diferencia este visualizador de un presupuesto personal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este explicador muestra porcentajes medios basados en datos estadísticos nacionales, no en las finanzas individuales del usuario. Un presupuesto personal registra ingresos y gastos reales propios. El visualizador sirve para entender cómo se compara el reparto propio con la media española y detectar categorías donde el gasto puede diferir significativamente de la norma estadística.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje del sueldo se recomienda ahorrar cada mes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una cifra universal aplicable a todas las situaciones. Una referencia divulgativa frecuente es destinar entre el 10 % y el 20 % del ingreso neto al ahorro, ajustando en función de deudas, gastos fijos y objetivos. Con ingresos bajos o altos costes de vivienda, alcanzar ese rango puede ser inviable. Lo más relevante es identificar qué categorías de gasto tienen margen de ajuste en la propia situación.',
      },
    },
  ],
};
