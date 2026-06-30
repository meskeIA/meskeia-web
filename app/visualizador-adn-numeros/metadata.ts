import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu ADN en Números — Biología del Genoma Humano | meskeIA',
  description: 'Cifras fascinantes sobre el ADN humano: 3.200 millones de pares de bases, 99,9% idéntico entre humanos, 60% compartido con el plátano. Explicador visual interactivo para estudiantes de Bachillerato, preparatoria y secundaria.',
  keywords: 'ADN números, genoma humano, pares de bases, genes, similitud genética, biología bachillerato, biología preparatoria, biología secundaria, explicador visual, cromosomas, secuencia genética',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu ADN en Números — Biología del Genoma Humano',
    description: '3.200 millones de pares de bases, 74.000 millones de km de ADN en tu cuerpo, 96% compartido con el chimpancé. Datos asombrosos sobre la biología humana.',
    url: 'https://meskeia.com/visualizador-adn-numeros/',
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
    title: 'Tu ADN en Números',
    description: 'Cifras fascinantes sobre el genoma humano explicadas de forma visual e interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'ADN en Números meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu ADN en Números',
  description: 'Explicador visual interactivo sobre las cifras más fascinantes del ADN humano. Bloques clickables con datos sobre el genoma, similitud genética con otros organismos y la escala real del ADN en el cuerpo humano.',
  url: 'https://meskeia.com/visualizador-adn-numeros/',
  features: [
    'Bloques visuales interactivos con 7 cifras clave del ADN humano',
    'Barra de similitud genética comparada con 6 organismos',
    'Escala visual del ADN: desde la célula hasta el Sistema Solar',
    'Contenido educativo orientado a Bachillerato, preparatoria y educación media (Selectividad / examen de admisión)',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos pares de bases tiene el ADN humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El genoma humano haploide contiene aproximadamente 3.200 millones de pares de bases (3,2 × 10⁹ pb), distribuidos en 23 cromosomas. En una célula diploide normal hay dos copias de cada cromosoma, por lo que el total asciende a unos 6.400 millones de pares de bases. Esta secuencia fue descifrada por el Proyecto Genoma Humano, finalizado en 2003.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué compartimos el 60 % del ADN con el plátano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Humanos y plátanos (Musa acuminata) comparten genes relacionados con funciones celulares básicas y universales: replicación del ADN, metabolismo energético y síntesis de proteínas fundamentales. Estos genes han permanecido casi sin cambios a lo largo de más de mil millones de años de evolución porque cualquier mutación suele ser letal. El porcentaje de similitud hace referencia a genes homólogos con función conservada, no a que la mayor parte de nuestro genoma sea idéntica al del plátano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto ADN hay en el cuerpo humano si se estirara en línea recta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si se estiraran todas las hebras de ADN de las aproximadamente 37 billones de células del cuerpo humano, la longitud total alcanzaría unos 74.000 millones de kilómetros, equivalente a unas 490 veces la distancia de la Tierra al Sol. Esto es posible porque cada célula contiene unos 2 metros de ADN enrollado en un espacio de tan solo 6 micrómetros de diámetro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencian genéticamente dos personas cualquiera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dos humanos cualesquiera comparten el 99,9 % de su secuencia de ADN. El 0,1 % restante equivale a unos 3 millones de variantes, conocidas principalmente como polimorfismos de nucleótido simple (SNPs). Esas diferencias son las que determinan características como el color de ojos, la predisposición a ciertas enfermedades o la respuesta a determinados fármacos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos genes tiene el ser humano y cuánto ADN es realmente codificante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El genoma humano contiene entre 20.000 y 25.000 genes codificantes de proteínas, una cifra sorprendentemente similar a la de organismos mucho más simples como el gusano Caenorhabditis elegans. Solo el 1,5-2 % del ADN total corresponde a regiones codificantes de proteínas; el resto incluye intrones, regiones reguladoras, ARN no codificantes y secuencias repetitivas cuya función se sigue investigando.',
      },
    },
  ],
};
