import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Aspirina, Paracetamol e Ibuprofeno: Diferencias | meskeIA',
  description:
    'Comparativa de los 3 analgésicos más usados: mecanismos distintos, órganos de riesgo distintos y cuándo es mejor cada uno. Solo el ibuprofeno y la aspirina son antiinflamatorios.',
  keywords: [
    'aspirina paracetamol ibuprofeno diferencias',
    'cual analgesico tomar',
    'paracetamol vs ibuprofeno vs aspirina',
    'analgesicos mecanismo',
    'antiinflamatorio paracetamol',
    'aspirina antiagregante',
    'ibuprofeno estomago',
  ],
  openGraph: {
    title: 'Aspirina vs Paracetamol vs Ibuprofeno: Tres Mecanismos Distintos',
    description:
      'Solo uno es antiagregante. Solo uno actúa en el SNC. Solo uno es seguro con estómago vacío. Conoce la diferencia.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Aspirina, Paracetamol e Ibuprofeno: Comparativa de los 3 Analgésicos",
  description: "Comparativa de los 3 analgésicos más usados: mecanismos distintos, órganos de riesgo distintos y cuándo es mejor cada uno. Solo el ibuprofeno y la aspirina son antiinflamatorios.",
  url: "https://meskeia.com/visualizador-analgesicos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre paracetamol, ibuprofeno y aspirina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres son analgésicos y antipiréticos, pero actúan de forma distinta. El paracetamol actúa principalmente en el sistema nervioso central modulando los umbrales del dolor y no es antiinflamatorio periférico. El ibuprofeno y la aspirina inhiben las enzimas COX-1 y COX-2, reduciendo la síntesis de prostaglandinas; ambos son antiinflamatorios y analgésicos periféricos. Además, la aspirina inhibe irreversiblemente las plaquetas, efecto que el ibuprofeno no tiene de forma sostenida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es mejor tomar ibuprofeno en lugar de paracetamol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ibuprofeno es preferible cuando existe componente inflamatorio: dolor muscular post-ejercicio, artritis, lesiones con hinchazón, dismenorrea o dolor dental con inflamación. También es más eficaz en la fiebre de instauración rápida. Sin embargo, debe evitarse con el estómago vacío, en personas con úlcera o gastritis, en insuficiencia renal, durante el embarazo (especialmente en el tercer trimestre) y en mayores polimedicados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el paracetamol es peligroso en sobredosis si es tan seguro en dosis normales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En dosis normales, el paracetamol se metaboliza principalmente en el hígado por glucuronidación y sulfatación. Solo una pequeña fracción genera NAPQI, un metabolito hepatotóxico que el glutatión hepático neutraliza. En sobredosis, las vías principales se saturan, se produce mucho más NAPQI y el glutatión se agota, causando necrosis hepática grave. La dosis tóxica puede ser tan baja como 7,5-10 g en adultos sanos, y menos en personas con daño hepático previo o que consumen alcohol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede combinar paracetamol con ibuprofeno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la combinación alternada de paracetamol e ibuprofeno está documentada y puede ser más eficaz para el control del dolor agudo que cualquiera de los dos por separado, ya que actúan por vías distintas. Algunos hospitales la utilizan para el postoperatorio. No obstante, combinarlos simultáneamente a dosis máximas aumenta el riesgo de efectos adversos; lo habitual es alternarlos cada 4-6 horas bajo indicación médica o farmacéutica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se toma la aspirina a dosis bajas si no es para el dolor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A dosis de 75-100 mg/día, la aspirina se usa como antiagregante plaquetario para reducir el riesgo de infarto de miocardio y accidente cerebrovascular en pacientes con enfermedad cardiovascular establecida (prevención secundaria). Inhibe irreversiblemente la COX-1 plaquetaria, bloqueando la producción de tromboxano A2 y reduciendo la tendencia de las plaquetas a agregarse. No se recomienda en prevención primaria (sin antecedentes cardiovasculares) en la mayoría de adultos por el riesgo de hemorragia gastrointestinal.',
      },
    },
  ],
};
