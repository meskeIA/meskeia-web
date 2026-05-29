import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Gastos del Primer Año del Bebé - Presupuesto España | meskeIA',
  description:
    'Estima cuánto cuesta el primer año de un bebé en España. 10 categorías de gasto con niveles ajustado, medio y confortable. Planifica tu presupuesto familiar.',
  keywords:
    'cuanto cuesta bebe primer año, gastos bebe España, presupuesto bebe, coste primer año hijo, pañales bebe coste anual, gastos recien nacido, planificador bebe',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Gastos del Primer Año del Bebé | meskeIA',
    description:
      'Calcula cuánto cuesta el primer año de un bebé en España. 10 categorías, 3 niveles de gasto y resumen mensual/anual.',
    url: 'https://meskeia.com/planificador-gastos-bebe/',
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
    title: 'Planificador de Gastos del Primer Año del Bebé | meskeIA',
    description:
      'Estima el coste del primer año de tu bebé en España. 10 categorías con niveles ajustado, medio y confortable.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Gastos Bebé meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Gastos del Primer Año del Bebé',
  description:
    'Herramienta interactiva para estimar el coste del primer año de un bebé en España. Incluye 10 categorías de gasto (pañales, alimentación, ropa, guardería, pediatra...) con tres niveles: ajustado, medio y confortable. Muestra el total anual, mensual y la distribución por categoría.',
  url: 'https://meskeia.com/planificador-gastos-bebe/',
  features: [
    'Estimación de gastos en 10 categorías del primer año del bebé',
    'Tres niveles de gasto: ajustado, medio y confortable',
    'Selector global y ajuste individual por categoría',
    'Resumen con total anual, mensual y distribución visual',
    'Datos orientativos para España 2025',
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
      name: '¿Cuánto cuesta el primer año de un bebé en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste del primer año varía mucho según el nivel de gasto y las circunstancias familiares. En un nivel ajustado puede situarse en torno a 5.000-7.000 euros anuales; en un nivel medio, entre 8.000 y 12.000 euros; y en un nivel confortable puede superar los 15.000 euros si se incluye guardería privada y artículos de mayor precio. Las partidas más importantes son la guardería, la alimentación (especialmente leche de fórmula) y el material de movilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se gasta en pañales durante el primer año del bebé?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un bebé puede usar entre 6 y 10 pañales al día durante los primeros meses. Con pañales de marca media (talla 1-3), el gasto anual se sitúa aproximadamente entre 500 y 900 euros dependiendo de la marca elegida y si se usan pañales de tela en algún momento. Comprar en packs grandes o en oferta reduce significativamente este coste.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta la guardería en España para un bebé menor de un año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio de la guardería pública subvencionada en España oscila entre 200 y 500 euros al mes, aunque hay listas de espera en muchas ciudades. La guardería privada puede costar entre 400 y 900 euros mensuales. Las comunidades autónomas tienen ayudas y cheques guardería distintos. La guardería es habitualmente la partida de mayor peso en el presupuesto del primer año si ambos progenitores trabajan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es más barato dar el pecho que usar leche de fórmula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La lactancia materna exclusiva elimina el gasto en leche artificial, que puede suponer entre 80 y 200 euros al mes en los primeros meses. En cambio, la lactancia materna tiene costes indirectos: sacaleches (alquiler o compra, 50-300 euros), bolsas de conservación, y en algunos casos consultas con una matrona o asesora de lactancia. Aun así, el ahorro frente a la fórmula es considerable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ayudas económicas existen en España por tener un bebé?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España existen varias prestaciones: la baja por nacimiento (16 semanas retribuidas al 100% del salario base para cada progenitor), la deducción por maternidad en el IRPF (1.200 euros anuales por hijo menor de 3 años para madres trabajadoras), el cheque bebé de algunas comunidades autónomas, y ayudas municipales variables. Algunas familias también pueden acceder a la prestación por nacimiento del IMSERSO si cumplen requisitos de renta.',
      },
    },
  ],
};
