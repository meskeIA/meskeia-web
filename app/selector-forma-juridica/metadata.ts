import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Forma Jurídica — ¿Autónomo o Sociedad Limitada? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene trabajar como autónomo o constituir una Sociedad Limitada (SL). Análisis según ingresos, riesgo, socios y proyección de negocio en España.',
  keywords: [
    'autónomo o sociedad limitada',
    'SL o autónomo',
    'cuándo crear una SL',
    'forma jurídica empresa España',
    'diferencia autónomo y SL',
    'ventajas SL vs autónomo',
    'constituir sociedad limitada',
    'autónomo freelance o empresa',
    'cuándo conviene SL',
    'responsabilidad autónomo o SL',
  ],
  openGraph: {
    title: '¿Autónomo o Sociedad Limitada? Test en 10 preguntas | meskeIA',
    description:
      'Descubre qué forma jurídica se adapta mejor a tu proyecto según ingresos esperados, riesgo, socios y complejidad administrativa.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-forma-juridica/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Autónomo o SL? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir la forma jurídica ideal: autónomo, Sociedad Limitada o esperar.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-forma-juridica/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Forma Jurídica',
        description:
          'Test orientativo para saber si conviene operar como autónomo o constituir una Sociedad Limitada según ingresos, riesgo patrimonial, socios y proyección.',
        url: 'https://meskeia.com/selector-forma-juridica/',
        features: [
          'Test de 10 preguntas sobre negocio y perfil',
          '3 recomendaciones: autónomo, SL, valorar más factores',
          'Análisis de responsabilidad patrimonial',
          'Consideración de carga fiscal comparativa',
          'Alertas sobre coste de constitución y gestión',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Forma Jurídica",
  description: "Test de 10 preguntas para saber si te conviene trabajar como autónomo o constituir una Sociedad Limitada (SL). Análisis según ingresos, riesgo, socios y proyección de negocio en España.",
  url: "https://meskeia.com/selector-forma-juridica/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo conviene constituir una Sociedad Limitada en lugar de ser autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Generalmente conviene plantearse la SL cuando los beneficios netos superan los 40.000-50.000 € anuales, ya que el tipo del Impuesto sobre Sociedades (25 % general, o 19-21 % en escala progresiva para empresas con cifra de negocio inferior a 1 millón de euros) puede ser inferior al IRPF marginal. También es recomendable si el proyecto implica varios socios, necesita financiación externa o presenta un riesgo patrimonial elevado, dado que la SL limita la responsabilidad al capital aportado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia principal entre autónomo y Sociedad Limitada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia clave es la responsabilidad patrimonial: el autónomo responde con todos sus bienes personales ante las deudas del negocio, mientras que en la SL la responsabilidad queda limitada al capital social aportado (mínimo 1 €). En cuanto a fiscalidad, el autónomo tributa por IRPF (escala hasta 47 %) y la SL por Impuesto sobre Sociedades (25 % general). La SL exige mayor carga administrativa y contable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta constituir una Sociedad Limitada en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una constitución estándar de SL oscila entre 300 y 600 €, incluyendo notaría, Registro Mercantil y tramitación. Desde 2023 es posible constituirla telemáticamente por unos 60 € si se usa el Documento Único Electrónico (DUE) a través del CIRCE. A estos costes hay que añadir la gestoría recurrente (entre 80 y 150 €/mes), que resulta obligatoria en la práctica por la mayor complejidad contable y fiscal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede una persona ser a la vez autónomo y socio de una SL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Es posible ser autónomo societario (administrador o socio trabajador de una SL) y darse de alta en el RETA simultáneamente. En ese caso, se cotiza como autónomo y también se tributan los rendimientos del trabajo o del capital mobiliario que genere la SL. Esta estructura es habitual en profesionales que trabajan a través de su propia sociedad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué forma jurídica es mejor para un freelance que empieza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para quien empieza con ingresos inciertos, el alta como autónomo es la opción más sencilla y económica: sin capital mínimo, sin gestión mercantil y con la tarifa plana de cuota reducida durante el primer año. La SL tiene sentido cuando el negocio ya genera beneficios regulares superiores a 40.000-50.000 € anuales o cuando sea necesario separar legalmente el patrimonio personal del profesional.',
      },
    },
  ],
};
