import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Titulación Ácido-Base | meskeIA',
  description: 'Titula gota a gota ácidos fuertes/débiles con bases fuertes/débiles. Curva de pH en tiempo real, punto de equivalencia, pKa, indicadores y zona tampón. Química Bachillerato.',
  keywords: 'titulación ácido base, valoración ácido base, curva de pH, punto de equivalencia, indicador fenolftaleína, pKa, Henderson-Hasselbalch, química bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-titulacion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Titulación Ácido-Base | meskeIA',
    description: 'Titula gota a gota con curva de pH en tiempo real',
    url: 'https://meskeia.com/simulador-titulacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Titulación Ácido-Base | meskeIA',
    description: 'Aprende valoraciones con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Simulador de Titulación Ácido-Base',
  description: 'Simulador interactivo de valoración ácido-base. Configura ácido y base fuertes o débiles, titula gota a gota, observa la curva de pH en tiempo real, el punto de equivalencia y el viraje del indicador.',
  url: 'https://meskeia.com/simulador-titulacion/',
  category: 'EducationalApplication',
  features: [
    '4 tipos de titulación: AF+BF, AD+BF, AF+BD, AD+BD',
    'Bureta animada con goteo controlado',
    'Curva de pH en tiempo real',
    '4 indicadores con su rango de viraje',
    'Cálculo automático del punto de equivalencia',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['titulación', 'valoración', 'pH', 'química bachillerato'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/simulador-titulacion/',
  mainEntity: [
    {
      question: '¿Cuál es la diferencia entre punto de equivalencia y punto final?',
      answer: 'El punto de equivalencia es el punto teórico donde los moles de ácido y base son iguales. El punto final es el punto experimental donde el indicador cambia de color. La diferencia entre ambos es el error de titulación; un indicador bien elegido los hace prácticamente coincidentes.',
    },
    {
      question: '¿Por qué el punto de equivalencia no es pH=7 en ácido débil + base fuerte?',
      answer: 'Porque la sal formada (ej. acetato de sodio) sufre hidrólisis: el ion acetato es básico y eleva el pH por encima de 7. En cambio, en ácido fuerte + base débil la sal es ácida y el punto de equivalencia queda por debajo de 7.',
    },
    {
      question: '¿Qué es la zona tampón en una titulación?',
      answer: 'Es la región plana antes de la equivalencia (en titulaciones de ácido débil) donde coexisten ácido y su base conjugada. El pH cambia poco al añadir titulante; en el punto medio, pH = pKa. Esta zona se rige por la ecuación de Henderson-Hasselbalch.',
    },
    {
      question: '¿Cómo elijo el indicador correcto?',
      answer: 'El rango de viraje del indicador debe quedar dentro del salto vertical de la curva. Si la curva tiene salto entre pH 4 y 10 (AF+BF), casi cualquier indicador funciona; si el salto es estrecho (AD+BD), hay que elegir uno cuyo viraje caiga en el rango exacto.',
    },
    {
      question: '¿Por qué la curva tiene un salto brusco?',
      answer: 'Cerca de la equivalencia hay muy poco ácido o base sin reaccionar, por lo que añadir una gota más cambia drásticamente el pH. El salto es mayor cuando ambos reactivos son fuertes y concentrados, y menor en titulaciones de débiles diluidos.',
    },
    {
      question: '¿Por qué se sigue añadiendo titulante después de la equivalencia?',
      answer: 'Para confirmar que hemos pasado el punto final y observar el plateau característico. En la práctica, basta con detectar el cambio de color y registrar el volumen.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);
