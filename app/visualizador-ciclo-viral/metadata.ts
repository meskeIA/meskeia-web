import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo de Replicación Viral: Cómo se Reproducen los Virus — meskeIA',
  description:
    'Visualizador del ciclo viral completo: 6 etapas de replicación, virus ADN vs ARN, retrovirus, latencia y mecanismos de evasión inmune. Biología molecular pura.',
  keywords: [
    'ciclo replicación viral',
    'cómo se reproducen los virus',
    'virus ADN ARN retrovirus',
    'VIH replicación ciclo',
    'latencia viral herpes',
    'variación antigénica influenza',
    'tropismo viral receptor celular',
    'ensamblaje virión gemación lisis',
  ],
  openGraph: {
    title: 'Ciclo de Replicación Viral: Cómo se Reproducen los Virus — meskeIA',
    description:
      'Las 6 etapas del ciclo viral, estrategias ADN vs ARN y mecanismos de evasión inmune.',
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
  name: "Ciclo de Replicación Viral: Cómo se Reproducen los Virus",
  description: "Visualizador del ciclo viral completo: 6 etapas de replicación, virus ADN vs ARN, retrovirus, latencia y mecanismos de evasión inmune. Biología molecular pura.",
  url: "https://meskeia.com/visualizador-ciclo-viral/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se reproducen los virus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los virus no se reproducen por sí solos: necesitan infectar una célula huésped y secuestrar su maquinaria molecular. El ciclo de replicación viral tiene 6 etapas principales: adsorción (unión al receptor celular), penetración, desnudamiento del material genético, replicación y síntesis de proteínas virales, ensamblaje de nuevos viriones y, finalmente, liberación por lisis celular o gemación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre virus ADN y virus ARN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los virus ADN (como el herpesvirus o el adenovirus) almacenan su información genética en ADN bicatenario y suelen replicarse en el núcleo celular, siendo generalmente más estables y con menor tasa de mutación. Los virus ARN (como influenza o SARS-CoV-2) usan ARN como material genético, se replican en el citoplasma y tienen tasas de mutación mucho más altas debido a la menor fidelidad de las ARN polimerasas, lo que facilita su evolución rápida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un retrovirus y cómo funciona el VIH?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un retrovirus es un virus ARN que utiliza la enzima transcriptasa inversa para convertir su ARN en ADN y luego integrarse en el genoma de la célula huésped como un provirus. El VIH sigue este ciclo: infecta linfocitos T CD4+, integra su ADN en el cromosoma celular y puede permanecer latente durante años antes de reactivarse. Esta integración en el genoma es la principal razón por la que el VIH no puede eliminarse completamente con los tratamientos actuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la latencia viral?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La latencia viral es un estado en el que el virus persiste en la célula huésped sin producir nuevas partículas virales ni causar síntomas. El herpesvirus (VHS) es el ejemplo más conocido: tras la infección primaria, el virus permanece latente en las neuronas de los ganglios sensoriales y puede reactivarse por estrés, fiebre o inmunosupresión para causar nuevos brotes. El virus no desaparece del organismo, simplemente queda "silenciado".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo evaden los virus el sistema inmune?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los virus han desarrollado múltiples estrategias para escapar de las defensas del organismo. La variación antigénica consiste en mutar rápidamente las proteínas de superficie para no ser reconocidos por anticuerpos previos (estrategia clave de la gripe). Otros inhiben la presentación de antígenos por el MHC-I para ocultarse de los linfocitos T citotóxicos, bloquean la señalización del interferón o secuestran el sistema del complemento. Esta capacidad de evasión es uno de los principales retos para el desarrollo de vacunas universales.',
      },
    },
  ],
};
