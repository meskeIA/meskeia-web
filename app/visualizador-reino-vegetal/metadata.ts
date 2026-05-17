import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'El Reino Vegetal: de las Algas a las Angiospermas | meskeIA',
  description:
    'Visualizador interactivo del reino vegetal. Árbol de clasificación clicable: Criptógamas (algas, briófitos, pteridófitos) y Fanerógamas (gimnospermas, angiospermas). Tabla comparativa y ciclos de vida.',
  keywords: [
    'reino vegetal',
    'criptógamas fanerógamas',
    'angiospermas gimnospermas',
    'briófitos pteridófitos',
    'clasificación plantas',
    'biología bachillerato',
  ],
  openGraph: {
    title: 'El Reino Vegetal — Clasificación Interactiva | meskeIA',
    description:
      'Árbol interactivo del reino vegetal: algas, briófitos, pteridófitos, gimnospermas y angiospermas. Para estudiantes de ESO y Bachillerato.',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Reino Vegetal',
  description:
    'Árbol interactivo de clasificación del reino vegetal: criptógamas (algas, briófitos, pteridófitos, líquenes) y fanerógamas (gimnospermas y angiospermas con monocotiledóneas y dicotiledóneas). Tabla comparativa, características diagnósticas y ciclos de vida.',
  url: 'https://meskeia.com/visualizador-reino-vegetal/',
  category: 'EducationalApplication',
  features: [
    'Árbol jerárquico interactivo de clasificación vegetal',
    'Detalle de cada grupo: características, reproducción y ejemplos',
    'Tabla comparativa de 7 grupos por vasculatura, semilla y flor',
    'Ciclos de vida: briófitos, pteridófitos y fanerógamas',
    'Guía de identificación paso a paso',
  ],
});
