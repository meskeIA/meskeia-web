import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Testosterona - Cómo Funciona la Hormona del Rendimiento | meskeIA',
  description: 'Entiende la testosterona: su producción en hombres y mujeres, evolución a lo largo de la vida, efectos en músculo, hueso, humor y cognición, y los factores que influyen en sus niveles.',
  keywords: ['testosterona como funciona', 'testosterona hombres mujeres', 'testosterona y musculo', 'testosterona edad', 'andropenia', 'testosterona hueso', 'testosterona mood', 'DHEA testosterona', 'eje HPG testosterona'],
  openGraph: {
    title: 'Testosterona - La Hormona del Rendimiento | meskeIA',
    description: 'Fisiología de la testosterona: producción, efectos y moduladores naturales.',
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
  name: "Testosterona - La Hormona del Rendimiento",
  description: "Entiende la testosterona: su producción en hombres y mujeres, evolución a lo largo de la vida, efectos en músculo, hueso, humor y cognición, y los factores que influyen en sus niveles.",
  url: "https://meskeia.com/visualizador-testosterona/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Solo los hombres producen testosterona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Tanto hombres como mujeres producen testosterona, aunque en cantidades muy distintas. En hombres adultos los niveles oscilan entre 300 y 1000 ng/dL, producida principalmente en los testículos. En mujeres los niveles son entre 10 y 70 ng/dL, producida en los ovarios y las glándulas suprarrenales. En las mujeres la testosterona desempeña un papel relevante en la libido, la masa ósea, la energía y el estado de ánimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo cambian los niveles de testosterona con la edad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En hombres, la testosterona alcanza su pico máximo alrededor de los 20 años y disminuye aproximadamente un 1-2% anual a partir de los 30-35. Este declive gradual se denomina andropenia o hipogonadismo tardío. A los 70 años la mayoría de los hombres tiene niveles un 30-50% menores que a los 25. En mujeres, los niveles descienden de forma progresiva desde la treintena y caen de manera más pronunciada en la perimenopausia, cuando los ovarios reducen su producción hormonal general.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores del estilo de vida afectan a los niveles de testosterona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Varios factores modificables influyen significativamente. El sueño insuficiente (menos de 6 horas) puede reducir los niveles hasta un 15% en pocos días. El ejercicio de fuerza y los sprints estimulan la producción, mientras que el sedentarismo la deprime. La obesidad, especialmente la abdominal, aumenta la conversión de testosterona en estrógenos vía aromatasa. El estrés crónico eleva el cortisol, que compite con la vía de síntesis de testosterona. La deficiencia de zinc y vitamina D también se asocia con niveles más bajos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el eje HPG y cómo regula la producción de testosterona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El eje hipotalámico-pituitario-gonadal (HPG) es el sistema de control hormonal. El hipotálamo libera GnRH en pulsos, lo que estimula a la hipófisis para secretar LH y FSH. La LH actúa sobre las células de Leydig en los testículos ordenándoles producir testosterona. Cuando los niveles de testosterona suben lo suficiente, inhiben la liberación de GnRH y LH (retroalimentación negativa), manteniendo el sistema en equilibrio. El uso externo de testosterona o esteroides anabolizantes interrumpe este eje y puede suprimir la producción endógena de forma prolongada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre testosterona total, libre y biodisponible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La testosterona total incluye toda la que circula en sangre, pero la mayor parte va unida a proteínas transportadoras: un 60-70% a SHBG (globulina fijadora de hormonas sexuales) y un 20-30% a albúmina. Solo el 1-3% restante circula libre y puede actuar directamente en los tejidos. La testosterona biodisponible suma la libre más la unida a albúmina (de unión débil, fácilmente liberable). En análisis clínicos, una testosterona total normal con SHBG alta puede enmascarar una deficiencia funcional; por eso en algunos contextos es más informativo medir la testosterona libre.',
      },
    },
  ],
};
