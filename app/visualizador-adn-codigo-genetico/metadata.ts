import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'ADN y Código Genético - Del Gen a la Proteína | meskeIA',
  description: 'Explora el dogma central de la biología molecular: ADN → ARN → Proteína. Doble hélice, transcripción, traducción, codones y mutaciones en un explicador visual interactivo.',
  keywords: 'ADN, ARN, código genético, codones, transcripción, traducción, dogma central, biología molecular, aminoácidos, mutaciones, CRISPR, epigenética',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'ADN y Código Genético - Del Gen a la Proteína',
    description: 'El dogma central de la biología: cómo tu ADN se convierte en proteínas. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-adn-codigo-genetico/',
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
    title: 'ADN y Código Genético - Explicador Visual Interactivo',
    description: '3.200 millones de letras forman tu libro de instrucciones. Descubre cómo se leen.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'ADN y Código Genético meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'ADN y Código Genético - Del Gen a la Proteína',
  description: 'Explicador visual interactivo sobre el dogma central de la biología molecular: estructura del ADN, transcripción, traducción, tabla de codones, mutaciones y CRISPR. Desde la doble hélice hasta la proteína.',
  url: 'https://meskeia.com/visualizador-adn-codigo-genetico/',
  category: 'EducationalApplication',
  features: [
    'Estructura de la doble hélice con bases complementarias interactivas',
    'Proceso de transcripción ADN → ARN paso a paso',
    'Tabla completa de 64 codones con 20 aminoácidos',
    'Mutaciones, epigenética y CRISPR explicados visualmente',
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
      name: '¿Qué es el código genético y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El código genético es el conjunto de reglas que traducen la secuencia de bases del ARN mensajero en aminoácidos para formar proteínas. Está formado por 64 codones (tripletes de bases) que codifican los 20 aminoácidos estándar más señales de inicio y parada. Es casi universal en todos los organismos vivos, lo que evidencia un origen evolutivo común.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre ADN y ARN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ADN (ácido desoxirribonucleico) es la molécula de doble hélice que almacena la información genética en el núcleo celular y usa la base timina (T). El ARN (ácido ribonucleico) es de cadena simple, contiene uracilo (U) en lugar de timina, y actúa como mensajero temporal que lleva la información del ADN a los ribosomas para fabricar proteínas. El ADN es permanente; el ARN es transitorio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre durante la transcripción y la traducción del ADN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la transcripción, la enzima ARN polimerasa lee el ADN y sintetiza una cadena de ARN mensajero complementaria dentro del núcleo. En la traducción, los ribosomas leen ese ARNm de tres en tres bases (codones) y los ARN de transferencia aportan el aminoácido correspondiente, encadenándolos hasta formar una proteína funcional. Este proceso se denomina dogma central de la biología molecular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de mutaciones del ADN existen y qué consecuencias tienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las mutaciones más comunes son: sustitución puntual (un nucleótido cambia por otro), inserción (se añade un nucleótido) y deleción (se elimina uno). Las inserciones y deleciones provocan un cambio de marco de lectura que altera toda la proteína resultante. Algunas mutaciones son silenciosas (no cambian el aminoácido), otras causan enfermedades como la anemia falciforme, y otras son la base de la evolución y la variabilidad genética.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es CRISPR y cómo edita el ADN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CRISPR-Cas9 es un sistema de edición genética derivado del sistema inmune bacteriano. Utiliza una guía de ARN para llevar la proteína Cas9 (una nucleasa) hasta una secuencia de ADN concreta, donde realiza un corte de doble hebra. Después, los mecanismos de reparación celular pueden eliminar, corregir o insertar secuencias. Su precisión, bajo coste y facilidad de uso lo han convertido en la herramienta de biotecnología más utilizada desde 2012.',
      },
    },
  ],
};
