import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Vitamina D: La Vitamina que Actúa como Hormona | meskeIA',
  description:
    'Síntesis solar paso a paso, receptores VDR en 37 tejidos, niveles óptimos y la paradoja de la deficiencia en España a pesar del sol.',
  keywords: [
    'vitamina d como funciona',
    'vitamina d deficiencia',
    'vitamina d sintesis solar',
    'VDR receptor vitamina d',
    'vitamina d calcio',
    'vitamina d inmunidad',
    'vitamina d niveles normales',
    'calcitriol calciferol',
    'vitamina d españa',
  ],
  openGraph: {
    title: 'Vitamina D: La Vitamina que Actúa como Hormona',
    description:
      'Síntesis solar paso a paso, receptores VDR en 37 tejidos y niveles óptimos',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Vitamina D: La Vitamina que Actúa como Hormona",
  description: "Síntesis solar paso a paso, receptores VDR en 37 tejidos, niveles óptimos y la paradoja de la deficiencia en España a pesar del sol.",
  url: "https://meskeia.com/visualizador-vitamina-d/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué la vitamina D se considera una hormona y no solo una vitamina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La vitamina D actúa como una hormona esteroide porque, tras su síntesis en la piel o su ingesta, se convierte en calcitriol, que se une a receptores nucleares (VDR) presentes en más de 37 tejidos distintos, desde el intestino y los huesos hasta el sistema inmunitario y el cerebro. A diferencia de las vitaminas clásicas, el cuerpo la produce en cantidades significativas a partir de la radiación UVB solar, y regula la expresión de cientos de genes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo de sol se necesita para producir vitamina D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la latitud, la estación, el tipo de piel y la hora del día. En latitudes mediterráneas, durante los meses de primavera y verano, entre 10 y 20 minutos de exposición de brazos y cara al mediodía solar suelen ser suficientes para sintetizar entre 1.000 y 2.000 UI. En invierno o por encima de los 40° de latitud, la radiación UVB es insuficiente la mayor parte del año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los niveles óptimos de vitamina D en sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se mide como 25-hidroxivitamina D [25(OH)D] en sangre. La mayoría de guías clínicas consideran deficiencia los valores por debajo de 20 ng/mL (50 nmol/L) e insuficiencia entre 20 y 30 ng/mL. El rango óptimo generalmente aceptado se sitúa entre 30 y 60 ng/mL. Concentraciones superiores a 100 ng/mL pueden indicar toxicidad, especialmente con suplementación no supervisada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quiénes tienen mayor riesgo de deficiencia de vitamina D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los grupos con mayor riesgo son personas mayores (menor capacidad de síntesis cutánea), personas con piel oscura (mayor cantidad de melanina reduce la producción), personas con obesidad (el tejido adiposo secuestra la vitamina), personas con enfermedades de malabsorción intestinal como celiaquía o enfermedad de Crohn, y quienes tienen escasa exposición solar por trabajo en interiores o uso de protección solar muy alta de forma continua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La vitamina D refuerza el sistema inmunitario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el calcitriol modula la respuesta inmunitaria innata y adaptativa. Estimula la producción de péptidos antimicrobianos como la catelicidina, regula la diferenciación de linfocitos T y reduce la inflamación excesiva. La deficiencia se ha asociado con mayor susceptibilidad a infecciones respiratorias y con enfermedades autoinmunes. Sin embargo, los beneficios de la suplementación son más claros en personas con deficiencia real que en personas con niveles ya normales.',
      },
    },
  ],
};
