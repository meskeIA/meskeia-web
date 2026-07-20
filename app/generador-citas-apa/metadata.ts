import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Citas APA, ISO 690, Vancouver e ICONTEC - Referencias | meskeIA',
  description:
    'Genera citas y referencias en normas APA 7, ISO 690, Vancouver e ICONTEC: libros, artículos, páginas web, tesis y leyes, con la cita en el texto incluida.',
  keywords:
    'generador apa, normas apa, citas apa, formato apa, generador de referencias, normas icontec, citar pagina web, norma iso 690, estilo vancouver, referencias bibliograficas, bibliografia apa, citar libro apa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de citas y referencias: APA, ISO 690, Vancouver e ICONTEC',
    description:
      'Rellena los datos de tu fuente y obtén la referencia bibliográfica y la cita en el texto con el formato exacto de cada norma. Gratis y sin registro.',
    url: 'https://meskeia.com/generador-citas-apa',
    siteName: 'meskeIA',
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de citas APA, ISO 690, Vancouver e ICONTEC',
    description:
      'Referencias bibliográficas y citas en el texto con formato exacto, cursivas incluidas. Libros, artículos, webs, tesis, leyes y redes.',
  },
  other: {
    'application-name': 'Generador de Citas y Bibliografía meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Citas y Bibliografía (APA, ISO 690, Vancouver, ICONTEC)',
  description:
    'Herramienta gratuita para estudiantes e investigadores que genera referencias bibliográficas y citas dentro del texto en normas APA 7.ª edición, ISO 690, Vancouver e ICONTEC, a partir de los datos de la fuente: libros, capítulos, artículos de revista con DOI, páginas web, tesis, informes, videos, leyes y publicaciones en redes sociales.',
  url: 'https://meskeia.com/generador-citas-apa/',
  category: 'EducationalApplication',
  features: [
    'Cuatro normas: APA 7.ª edición, ISO 690, Vancouver e ICONTEC',
    'Nueve tipos de fuente: libro, capítulo, artículo con DOI, página web, tesis, informe, video, ley y redes sociales',
    'Cita en el texto en sus dos formas: parentética y narrativa',
    'Reglas reales de varios autores, autor corporativo, obra sin autor y fuente sin fecha',
    'Lista de referencias ordenada alfabéticamente y con sangría francesa',
    'Exportación en texto plano, con cursivas o en archivo .txt',
    'La lista se guarda en el propio navegador entre sesiones',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una cita y una referencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cita es la marca breve que va dentro del párrafo, en el punto exacto donde usas la idea ajena, por ejemplo (Restrepo, 2021). La referencia es la entrada completa que aparece al final del trabajo, con autor, año, título, editorial y enlace. Toda cita del texto debe tener su referencia final, y toda referencia debe estar citada al menos una vez en el texto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se cita una página web en normas APA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El formato APA 7 para una página web es: Apellido, A. A. (Año, día de mes). Título de la página en cursiva. Nombre del sitio. URL. Si no hay autor personal, el sitio actúa como autor corporativo; si no hay fecha, se escribe s.f. en el lugar del año. Cuando el autor y el nombre del sitio coinciden, el nombre del sitio no se repite.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos autores se escriben en APA 7 y cuándo se usa et al.?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la lista de referencias se escriben hasta 20 autores; con 21 o más se listan los 19 primeros, puntos suspensivos y el último. En la cita dentro del texto la regla es distinta: con tres o más autores se abrevia con et al. desde la primera cita, y solo con dos se nombran ambos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué norma de citación usa cada país o disciplina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'APA domina las ciencias sociales, la educación y la psicología en casi toda Latinoamérica. En España es habitual ISO 690, sobre todo en universidades públicas. Vancouver es el estándar en medicina y ciencias de la salud en todo el mundo. ICONTEC (NTC 1486 y NTC 5613) es la norma colombiana para trabajos escritos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay que poner el número de página en la cita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Siempre que reproduzcas las palabras exactas del autor: en toda cita directa el número de página es obligatorio, tanto si va entrecomillada (menos de 40 palabras) como si va en bloque aparte (40 o más). Al parafrasear, APA no lo exige pero lo recomienda cuando la idea procede de un punto concreto de un texto extenso.',
      },
    },
  ],
};
