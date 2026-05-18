import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'El Reino Fungi - Clasificación y Biología de los Hongos | meskeIA',
  description:
    'Explora el reino Fungi: ascomicetos, basidiomicetos, cigomicetos y deuteromicetos. Diferencias con plantas, ciclos de vida y rol ecológico. Visual e interactivo.',
  keywords: [
    'reino fungi',
    'hongos clasificación',
    'ascomycota basidiomycota',
    'zygomycota deuteromycota',
    'biología hongos',
    'importancia ecológica hongos',
    'micología bachillerato',
  ],
  openGraph: {
    title: 'El Reino Fungi — Clasificación Interactiva de los Hongos | meskeIA',
    description:
      'Visualizador interactivo del reino Fungi: 4 divisiones, diferencias con plantas, ciclo de vida y rol ecológico. Para estudiantes y curiosos.',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Reino Fungi',
  description:
    'Explorador interactivo del reino Fungi: clasificación en Ascomycota, Basidiomycota, Zygomycota y Deuteromycota, comparativa con plantas, ciclo de vida del hongo y su importancia ecológica.',
  url: 'https://meskeia.com/visualizador-reino-fungi/',
  category: 'EducationalApplication',
  features: [
    '4 divisiones del reino Fungi con ejemplos cotidianos',
    'Comparativa planta vs hongo: quitina, heterotrofia y sin fotosíntesis',
    'Ciclo de vida del hongo: micelio, esporas y germinación',
    'Importancia ecológica: descomponedores, micorrizas y antibióticos',
    'Gratuito, sin registro, 100% en el navegador',
    'Disponible en español',
  ],
});
