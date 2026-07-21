import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Los 14 alérgenos alimentarios de declaración obligatoria (UE) | meskeIA',
  description:
    'Los 14 alérgenos de declaración obligatoria en la UE según el Reglamento (UE) nº 1169/2011 (Anexo II): gluten, crustáceos, huevos, pescado, cacahuetes, soja, leche, frutos de cáscara, apio, mostaza, sésamo, sulfitos, altramuces y moluscos. Con ejemplos y dónde se esconden en platos y productos. Gratis y en español.',
  keywords:
    '14 alergenos, alergenos alimentarios, alergenos obligatorios, reglamento 1169/2011, lista de alergenos, alergenos restaurante, donde se esconde el gluten, alergenos de declaracion obligatoria, trazas alergenos, alergia e intolerancia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Los 14 alérgenos alimentarios de declaración obligatoria', description: 'Los 14 alérgenos obligatorios en la UE, con ejemplos y dónde se esconden en los platos y productos.', url: 'https://meskeia.com/alergenos-alimentarios', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Los 14 alérgenos alimentarios', description: 'Los alérgenos de declaración obligatoria en la UE, con ejemplos y fuentes ocultas.' },
  other: { 'application-name': 'Alérgenos alimentarios meskeIA' },
  alternates: { canonical: 'https://meskeia.com/alergenos-alimentarios/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Los 14 alérgenos alimentarios',
  description:
    'Tabla de consulta de los 14 alérgenos alimentarios de declaración obligatoria en la Unión Europea (Reglamento (UE) nº 1169/2011, Anexo II), con buscador, filtros por tipo, ejemplos de cada alérgeno y las fuentes ocultas donde se esconden en platos y productos procesados.',
  url: 'https://meskeia.com/alergenos-alimentarios/',
  category: 'EducationalApplication',
  features: [
    'Los 14 alérgenos de declaración obligatoria en la UE',
    'Buscador por nombre, ejemplo o alimento',
    'Filtro por tipo (animal, vegetal o aditivo)',
    'Dónde se esconde cada alérgeno (fuentes ocultas y trazas)',
    'Diferencia entre alergia e intolerancia',
    'Basado en el Reglamento (UE) nº 1169/2011',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuáles son los 14 alérgenos de declaración obligatoria?', acceptedAnswer: { '@type': 'Answer', text: 'Son cereales con gluten, crustáceos, huevos, pescado, cacahuetes, soja, leche, frutos de cáscara, apio, mostaza, granos de sésamo, dióxido de azufre y sulfitos, altramuces y moluscos. Esta lista está fijada en el Anexo II del Reglamento (UE) nº 1169/2011 y es la misma en toda la Unión Europea. Estos 14 grupos deben declararse siempre en los alimentos.' } },
    { '@type': 'Question', name: '¿Es obligatorio informar de los alérgenos en un restaurante?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. Los bares, restaurantes y comedores están obligados a facilitar al cliente la información sobre los 14 alérgenos de cada plato. Puede darse por escrito (carta, ficha o cartel) o de palabra, pero en ese caso debe existir además un soporte escrito que respalde la información. El cliente tiene derecho a preguntarla antes de pedir.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre alergia e intolerancia?', acceptedAnswer: { '@type': 'Answer', text: 'La alergia implica al sistema inmunitario y una cantidad mínima del alérgeno puede desencadenar una reacción, que a veces es grave (anafilaxia). La intolerancia es un problema digestivo o enzimático que depende de la dosis y suele causar molestias, pero no pone en riesgo la vida. La alergia a los frutos secos es un ejemplo de alergia; la intolerancia a la lactosa, de intolerancia.' } },
    { '@type': 'Question', name: '¿Qué significa "puede contener trazas"?', acceptedAnswer: { '@type': 'Answer', text: 'Es un aviso voluntario del fabricante que indica que un alérgeno podría haber llegado al producto de forma involuntaria, por ejemplo por contaminación cruzada al elaborarse en la misma fábrica o maquinaria que otro alimento. No forma parte de la receta, pero para una persona con alergia grave conviene tomárselo en serio, porque una cantidad muy pequeña puede bastar para provocar una reacción.' } },
    { '@type': 'Question', name: '¿El gluten es un alérgeno?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. Los cereales con gluten (trigo, centeno, cebada, avena, espelta y kamut) son el primero de los 14 alérgenos de declaración obligatoria en la UE. El gluten se esconde en muchos productos procesados: rebozados, salsas espesadas, embutidos, cerveza, salsa de soja o el regaliz, por lo que conviene revisar siempre la etiqueta.' } },
  ],
};
