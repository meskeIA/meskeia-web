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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué los hongos no son plantas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hongos pertenecen a su propio reino (Fungi) y se diferencian de las plantas en tres aspectos fundamentales: no realizan fotosíntesis (son heterótrofos), sus paredes celulares están formadas por quitina en lugar de celulosa, y obtienen nutrientes por absorción externa de materia orgánica en descomposición o a partir de un huésped. Filogenéticamente, los hongos están más emparentados con los animales que con las plantas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales divisiones del reino Fungi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cuatro grandes divisiones son: Ascomycota (levaduras, trufas, Penicillium), que producen esporas en sacos llamados ascas; Basidiomycota (setas comestibles, Amanita, Boletus), que forman esporas en basidios; Zygomycota (moho del pan Rhizopus), que producen zigosporas resistentes; y Deuteromycota o "hongos imperfectos", categoría práctica para especies cuya reproducción sexual no se ha descrito aún.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el micelio y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El micelio es la estructura vegetativa del hongo, formada por una red de filamentos microscópicos llamados hifas. Es la parte que permanece bajo tierra o dentro del sustrato y tiene la función de absorber nutrientes mediante la secreción de enzimas digestivas al exterior. La seta que vemos sobre el suelo es solo el cuerpo fructífero reproductor; el verdadero organismo es el micelio, que puede extenderse varios metros cuadrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué importancia ecológica tienen los hongos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hongos cumplen tres roles ecológicos esenciales: como descomponedores, desintegran la materia orgánica muerta (madera, hojas) y reciclan nutrientes al suelo; como micorrizas, forman simbiosis con las raíces de la mayoría de plantas terrestres mejorando su absorción de agua y minerales; y como parásitos o patógenos, regulan poblaciones de plantas, animales e insectos. Además, la penicilina (descubierta en Penicillium chrysogenum) revolucionó la medicina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se reproducen los hongos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hongos pueden reproducirse de forma asexual (por fragmentación del micelio o producción de conidios) o sexual (mediante la fusión de hifas compatibles que genera esporas con variación genética). Las esporas son las unidades de dispersión: son microscópicas, muy ligeras y resistentes a condiciones adversas. Un solo carpóforo (seta) puede liberar miles de millones de esporas. El ciclo completo pasa por germinación de espora → micelio primario → micelio secundario → cuerpo fructífero → esporas.',
      },
    },
  ],
};
