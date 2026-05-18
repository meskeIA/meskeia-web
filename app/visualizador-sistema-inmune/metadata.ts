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
