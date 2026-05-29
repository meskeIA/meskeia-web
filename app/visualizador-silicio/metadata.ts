import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Silicio: De la Arena al Chip y la Ley de Moore | meskeIA',
  description: 'Cómo un semiconductor se convierte en el cerebro de todos los ordenadores. Dopado N/P, unión P-N, fabricación de chips y los límites cuánticos de la Ley de Moore.',
  keywords: ['silicio semiconductor', 'como funciona un chip', 'ley de moore', 'dopado semiconductor', 'union PN diodo', 'fabricacion chips', 'de la arena al chip', 'transistor como funciona'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'El Silicio: De la Arena al Chip',
    description: 'Cómo un semiconductor dopado con fósforo y boro hace posible toda la computación moderna',
    type: 'website',
    url: 'https://meskeia.com/visualizador-silicio/',
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
    title: 'El Silicio: De la Arena al Chip',
    description: 'Dopado N/P, unión P-N, fabricación de chips y los límites cuánticos de la Ley de Moore.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Silicio Semiconductor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Silicio: De la Arena al Chip',
  description: 'Visualizador interactivo del semiconductor más importante: bandas de energía, dopado N y P, la unión P-N (diodo), fabricación de chips en 7 pasos y la evolución de la Ley de Moore hasta sus límites cuánticos.',
  url: 'https://meskeia.com/visualizador-silicio/',
  category: 'EducationalApplication',
  features: [
    'Diagrama de bandas de energía: conductor, semiconductor y aislante',
    'Animación interactiva del dopado tipo N (fósforo) y tipo P (boro)',
    'Diagrama de la unión P-N con slider de voltaje de polarización',
    'Infografía del proceso de fabricación: de la arena al chip en 7 pasos',
    'Gráfico de la Ley de Moore en escala logarítmica con datos históricos',
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
      name: '¿Por qué el silicio es el material base de todos los chips y procesadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El silicio es un semiconductor: su conductividad eléctrica puede controlarse con precisión añadiendo pequeñas impurezas en un proceso llamado dopado. Además, es el segundo elemento más abundante en la corteza terrestre y forma una capa de óxido (SiO₂) estable que actúa como aislante perfecto en los transistores. Esta combinación de abundancia, controlabilidad y compatibilidad con procesos industriales consolidados lo convirtió en el material dominante de la microelectrónica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que un chip sea de 3 nm o 5 nm?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El número de nanómetros hace referencia al nodo tecnológico del proceso de fabricación, que históricamente se relacionaba con el tamaño del transistor. Hoy es más un nombre de marketing que una medida literal: un "chip de 3 nm" no tiene transistores de 3 nm de tamaño exacto, sino que usa ese término para indicar que pertenece a una generación más avanzada que los de 5 nm. Menos nanómetros implica transistores más pequeños, mayor densidad, menor consumo energético y mayor velocidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la Ley de Moore y sigue siendo válida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gordon Moore observó en 1965 que el número de transistores en un chip se duplicaba aproximadamente cada dos años, manteniendo el coste constante. Esta observación se cumplió con notable precisión durante décadas y guió la planificación de toda la industria. En la actualidad, los avances se han ralentizado por los límites físicos del silicio: cuando los transistores se acercan al tamaño de unos pocos átomos, los efectos cuánticos causan fugas de corriente incontrolables. La industria busca alternativas como el galio-nitruro, los chips 3D o la computación cuántica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se fabrica un chip de silicio a partir de arena?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso comienza purificando dióxido de silicio (arena) hasta obtener silicio de pureza 99,9999999 %. Ese silicio se funde y se cristaliza en lingotes cilíndricos que se cortan en obleas finas (wafers). Sobre cada oblea se aplican sucesivas capas de materiales mediante fotolitografía: la luz ultravioleta extrema (EUV) proyecta el patrón del circuito sobre una resina sensible, grabando estructuras de apenas unos nanómetros. Tras decenas o cientos de capas, las obleas se cortan en los dados individuales que se ensamblan en los chips.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un semiconductor tipo N y uno tipo P?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El dopado consiste en añadir impurezas al silicio puro para modificar su conducción. El tipo N (negativo) usa átomos como el fósforo, que aportan un electrón libre extra, aumentando los portadores de carga negativa. El tipo P (positivo) usa átomos como el boro, que crean "huecos" o ausencias de electrón que actúan como cargas positivas móviles. Al unir una capa N con una P se forma la unión P-N, que es la base de diodos, transistores y celdas fotovoltaicas.',
      },
    },
  ],
};
