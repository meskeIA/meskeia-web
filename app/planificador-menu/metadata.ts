import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Menú Semanal - Organiza tus Comidas | meskeIA',
  description: 'Planifica tu menú semanal de forma equilibrada. Genera estructura de comidas saludables para toda la semana con sugerencias mediterráneas. Gratis y sin registro.',
  keywords: 'planificador menú, menú semanal, planificar comidas, dieta mediterránea, organizar alimentación, menú saludable, batch cooking',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Menú Semanal - meskeIA',
    description: 'Organiza tu alimentación semanal de forma equilibrada con nuestro planificador gratuito.',
    url: 'https://meskeia.com/planificador-menu/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planificador de Menú Semanal - meskeIA',
    description: 'Organiza tu alimentación semanal de forma equilibrada.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Menú Semanal",
  description: "Planifica tu menú semanal de forma equilibrada. Genera estructura de comidas saludables para toda la semana con sugerencias mediterráneas. Gratis y sin registro.",
  url: "https://meskeia.com/planificador-menu/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se planifica un menú semanal equilibrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un menú semanal equilibrado incluye una fuente de proteína (legumbres, pescado, carne o huevos) en cada comida principal, verdura en almuerzo y cena, cereales integrales como base de energía y fruta en desayunos y meriendas. Se recomienda alternar las fuentes de proteína a lo largo de la semana: al menos 2-3 días con pescado, 2-3 días con legumbres y limitar la carne roja a 1-2 veces.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el batch cooking y cómo se integra en el planificador de menú?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El batch cooking consiste en preparar grandes cantidades de ingredientes base (arroz, legumbres cocidas, verduras asadas, proteínas) en una sesión de cocina semanal, normalmente el domingo, para montar comidas rápidas durante los días laborables. Un planificador de menú semanal ayuda a identificar qué ingredientes se repiten para maximizar la eficiencia de esa sesión y reducir el desperdicio alimentario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas calorías debo planificar por día en mi menú?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las necesidades calóricas dependen del sexo, la edad, el peso y el nivel de actividad física. Como referencia general, una mujer adulta con actividad moderada necesita entre 1.800 y 2.200 kcal/día, y un hombre entre 2.200 y 2.800 kcal/día. Sin embargo, un planificador de menú orientado a la calidad nutricional (variedad, densidad de nutrientes) es más útil que contar calorías de forma estricta para la mayoría de las personas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el planificador de menú de una dieta prescrita por un dietista?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un planificador de menú web ofrece una estructura de referencia basada en principios de alimentación saludable (como la dieta mediterránea), pero no tiene en cuenta patologías concretas, alergias, intolerancias ni objetivos terapéuticos específicos. Un dietista-nutricionista colegiado realiza una valoración individualizada y puede prescribir pautas ajustadas a condiciones de salud particulares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo ahorra planificar el menú semanal con antelación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Varios estudios sobre gestión del hogar estiman que planificar el menú semanalmente reduce el tiempo de decisión diaria en 15-20 minutos y disminuye las compras impulsivas, lo que puede suponer un ahorro económico del 10-15 % en la factura de alimentación. Además, reduce el desperdicio de alimentos porque la lista de la compra se ajusta exactamente a lo que se va a cocinar.',
      },
    },
  ],
};
