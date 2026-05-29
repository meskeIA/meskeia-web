import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-reino-animal';
const TITLE = 'Reino Animal: Vertebrados, Invertebrados y Filogenia - meskeIA';
const DESCRIPTION =
  'Explora el árbol filogenético del reino Animalia: 5 clases de vertebrados, phyla de invertebrados, comparativa de sistemas circulatorio/reproductor/excretor y adaptaciones por entorno.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'reino animal',
    'vertebrados',
    'invertebrados',
    'árbol filogenético animalia',
    'clases de vertebrados',
    'phyla invertebrados',
    'peces anfibios reptiles aves mamíferos',
    'artrópodos moluscos',
    'biología animal',
    'taxonomía animal',
    'evolución animal',
    'sistema circulatorio vertebrados',
    'filogenia molecular',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      '5 clases de vertebrados con detalles interactivos',
      '7 phyla de invertebrados',
      'Tabla comparativa de sistemas biológicos',
      'Árbol filogenético interactivo del reino Animalia',
      'SVG del corazón por número de cámaras',
    ],
    category: 'EducationalApplication',
  });
}

export const jsonLd = generateWebAppSchema({
  name: "Reino Animal: Vertebrados, Invertebrados y Árbol Filogenético",
  description: "Visualizador interactivo del reino animal. Árbol filogenético clicable, 5 clases de vertebrados con SVG del corazón por cámaras (pez 2, anfibio 3, reptil 3-4, ave 4, mamífero 4), 7 phyla de invertebra",
  url: "https://meskeia.com/visualizador-reino-animal/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos animales existen en el planeta y cómo se clasifican?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se han descrito aproximadamente 1,5 millones de especies animales, aunque las estimaciones de especies totales (incluyendo las no descubiertas) oscilan entre 8 y 10 millones. El reino Animalia se organiza en dos grandes grupos: los vertebrados (con columna vertebral), que incluyen peces, anfibios, reptiles, aves y mamíferos, y los invertebrados, que agrupan más del 95% de las especies conocidas en fila como artrópodos, moluscos, anélidos, equinodermos y poríferos, entre otros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre vertebrados e invertebrados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los vertebrados poseen un esqueleto interno con columna vertebral (notocordio en las fases embrionarias) y cráneo que protege el encéfalo. Los invertebrados carecen de esta estructura; algunos tienen exoesqueleto (artrópodos), concha (moluscos), espículas (esponjas) o endoesqueleto calcáreo (equinodermos). Aunque los vertebrados son los más estudiados, los invertebrados representan la inmensa mayoría de la diversidad animal y ocupan prácticamente todos los ecosistemas del planeta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la filogenia y para qué sirve en biología animal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La filogenia es el estudio de las relaciones evolutivas entre organismos. Un árbol filogenético representa esas relaciones como ramas que comparten un ancestro común: cuanto más cercana es la bifurcación, más reciente es el ancestro compartido. En zoología, la filogenia molecular (comparación de secuencias de ADN y ARN) ha revisado muchas clasificaciones tradicionales basadas en morfología; por ejemplo, ha confirmado que las aves son dinosaurios terópodos y que los cocodrilos están más emparentados con las aves que con los lagartos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los mamíferos tienen cuatro cámaras en el corazón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El corazón de cuatro cámaras (dos aurículas + dos ventrículos) separa completamente la sangre oxigenada de la desoxigenada, permitiendo una circulación doble completamente dividida. Esto suministra oxígeno a los tejidos con mayor eficiencia, lo que sostiene el alto metabolismo de mamíferos y aves. Los peces tienen dos cámaras (circulación simple), los anfibios tres (mezcla parcial de sangre), y la mayoría de reptiles también tres, aunque cocodrilos y aves comparten el modelo de cuatro cámaras, lo que refleja su origen evolutivo común.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué filo animal es el más diverso en número de especies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los artrópodos (filo Arthropoda) son con diferencia el filo más diverso: se han descrito más de un millón de especies, de las cuales unos 900.000 son insectos. Los insectos representan alrededor del 60% de todas las especies animales conocidas. Dentro de los insectos, el orden Coleoptera (escarabajos) es el más numeroso, con unas 400.000 especies descritas, lo que llevó al biólogo J.B.S. Haldane a su famosa observación sobre el "extraordinario gusto de Dios por los escarabajos".',
      },
    },
  ],
};
