import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Oxitocina - La Hormona del Vínculo Social | meskeIA',
  description: 'Descubre cómo funciona la oxitocina: cuándo se libera, su papel en los vínculos sociales, la confianza, el parto y la lactancia. Comparativa con vasopresina y datos de neurociencia social.',
  keywords: ['oxitocina', 'hormona del amor', 'hormona vinculo social', 'oxitocina confianza', 'oxitocina parto', 'oxitocina lactancia', 'vasopresina', 'neurociencia social', 'hormonas sociales'],
  openGraph: {
    title: 'Oxitocina - La Hormona del Vínculo | meskeIA',
    description: 'Cómo la oxitocina crea vínculos, genera confianza y conecta a las personas.',
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
  name: "Oxitocina - La Hormona del Vínculo Social",
  description: "Descubre cómo funciona la oxitocina: cuándo se libera, su papel en los vínculos sociales, la confianza, el parto y la lactancia. Comparativa con vasopresina y datos de neurociencia social.",
  url: "https://meskeia.com/visualizador-oxitocina/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la oxitocina y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La oxitocina es una hormona y neuropéptido producido en el hipotálamo y liberado por la hipófisis posterior. Actúa como mediador de los vínculos sociales, la confianza y el apego entre personas. También tiene funciones fisiológicas esenciales en el parto (estimula las contracciones uterinas) y la lactancia (desencadena la eyección de leche).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se libera oxitocina en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La oxitocina se libera en situaciones de contacto social positivo: abrazos, caricias, relaciones sexuales, contacto piel con piel entre madre e hijo recién nacido y momentos de confianza mutua. También se activa al escuchar música emocionalmente significativa o al participar en actividades cooperativas con otras personas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre oxitocina y vasopresina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oxitocina y vasopresina son neuropéptidos estructuralmente similares (difieren en solo 2 aminoácidos) pero con funciones distintas. La oxitocina favorece los vínculos y la conducta prosocial, mientras que la vasopresina regula el equilibrio hídrico, la presión arterial y está más asociada a conductas de territorialidad y pareja en algunas especies. Ambas interactúan en circuitos cerebrales relacionados con el comportamiento social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es cierto que la oxitocina se llama "la hormona del amor"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este apelativo popular captura parte de su función, pero es una simplificación. La oxitocina facilita la confianza y el apego, pero también puede intensificar la desconfianza hacia personas consideradas ajenas al grupo propio (efecto "endogrupo vs exogrupo"). Los efectos dependen del contexto social y de otros sistemas hormonales y neurotransmisores presentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel tiene la oxitocina en el parto y la lactancia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Durante el parto, la oxitocina provoca contracciones del músculo uterino y actúa en bucle positivo: las contracciones estimulan más liberación de oxitocina, lo que acelera el trabajo de parto. En la lactancia, la succión del bebé desencadena su liberación desde la hipófisis, provocando la contracción de células mioepiteliales en la glándula mamaria y la eyección de leche. La oxitocina sintética (Pitocin) se usa médicamente para inducir el parto.',
      },
    },
  ],
};
