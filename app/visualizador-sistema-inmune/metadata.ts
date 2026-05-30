import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'El Sistema Inmune - Defensas, Anticuerpos y Vacunas | meskeIA',
  description:
    'Explora el sistema inmune: 3 líneas de defensa, células guardianas, anticuerpos en Y, tipos de vacunas e inmunidad de rebaño. Visual e interactivo.',
  keywords: [
    'sistema inmune',
    'anticuerpos',
    'vacunas',
    'linfocitos',
    'inmunidad innata',
    'inmunidad adaptativa',
    'biología',
  ],
  openGraph: {
    title: 'El Sistema Inmune — Defensas, Anticuerpos y Vacunas | meskeIA',
    description:
      'Visualizador interactivo del sistema inmune: 3 líneas de defensa, 6 células guardianas, anticuerpos IgG-IgA-IgM-IgE-IgD, 5 tipos de vacunas e inmunidad de rebaño.',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Sistema Inmune',
  description:
    'Explora el sistema inmune de forma interactiva: las 3 líneas de defensa (barrera física, inmunidad innata e inmunidad adaptativa), las 6 células guardianas, la estructura del anticuerpo en Y con los 5 isotipos y los 5 tipos de vacunas.',
  url: 'https://meskeia.com/visualizador-sistema-inmune/',
  category: 'EducationalApplication',
  features: [
    '3 líneas de defensa: barrera, inmunidad innata e inmunidad adaptativa',
    '6 células guardianas: neutrófilos, macrófagos, NK, linfocitos T y B',
    'Estructura del anticuerpo en Y y los 5 isotipos (IgG, IgA, IgM, IgE, IgD)',
    '5 tipos de vacunas: ARNm, atenuadas, inactivadas, subunitarias, vectoriales',
    'Inmunidad de rebaño: umbrales por enfermedad',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 3 líneas de defensa del sistema inmune?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La primera línea son las barreras físicas y químicas: la piel, las mucosas, las lágrimas y el moco que impiden la entrada de patógenos. La segunda línea es la inmunidad innata, una respuesta rápida y no específica donde neutrófilos, macrófagos y células NK atacan a cualquier invasor extraño. La tercera línea es la inmunidad adaptativa, una respuesta lenta pero precisa donde los linfocitos T y B reconocen antígenos específicos y generan memoria inmunológica para futuras infecciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un linfocito T y un linfocito B?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los linfocitos B producen anticuerpos que circulan en la sangre y neutralizan patógenos extracelulares. Los linfocitos T tienen varias funciones: los T citotóxicos (CD8+) destruyen directamente las células infectadas o cancerosas, mientras que los T helper (CD4+) coordinan la respuesta inmune activando a los linfocitos B y a otros T. Ambos tipos se originan en la médula ósea, pero los T maduran en el timo (de ahí su nombre).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan las vacunas de ARNm como las de la COVID-19?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las vacunas de ARNm introducen instrucciones genéticas temporales en nuestras células para que fabriquen una proteína del patógeno (como la proteína espícula del SARS-CoV-2). El sistema inmune reconoce esa proteína como extraña, monta una respuesta y genera memoria. El ARNm no entra en el núcleo celular ni modifica el ADN, y se degrada en pocas horas. Esta tecnología permite fabricar vacunas en semanas frente a los meses que requieren las vacunas tradicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la inmunidad de rebaño y a partir de qué porcentaje se alcanza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inmunidad de rebaño ocurre cuando una proporción suficiente de la población es inmune (por infección previa o vacunación), lo que interrumpe la cadena de transmisión y protege también a quienes no pueden vacunarse. El umbral varía según la contagiosidad de la enfermedad: para el sarampión se necesita vacunar al ~95% de la población, para la polio al ~80-85%, y para la gripe estacional al ~33-44%. Enfermedades más contagiosas requieren umbrales más altos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos tipos de anticuerpos existen y para qué sirve cada uno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen 5 isotipos de anticuerpos (inmunoglobulinas): IgG (el más abundante en sangre, protección a largo plazo y memoria), IgA (presente en mucosas, saliva y leche materna, primera defensa en mucosas), IgM (primera en producirse ante una infección nueva), IgE (implicada en alergias y defensa contra parásitos) e IgD (función reguladora poco conocida, en superficie de linfocitos B inmaduros). Todos tienen la misma estructura en Y pero regiones constantes distintas que determinan su función.',
      },
    },
  ],
};
