import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Deducción IRPF por Obras Energéticas — 20%, 40%, 60% | meskeIA',
  description: 'Oriéntate sobre las 3 deducciones IRPF por obras de mejora energética en vivienda: 20% (demanda), 40% (consumo) y 60% (edificio). Plazos, requisitos y bases máximas actualizados a 2026.',
  keywords: 'deducción IRPF obras energéticas, mejora eficiencia energética vivienda, deducción 20 40 60 obras, rehabilitación energética IRPF, certificado energético deducción, DA 50 LIRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Deducción IRPF por obras energéticas — 20%, 40% y 60%',
    description: '3 deducciones por mejora energética en vivienda. Requisitos, plazos y base máxima deducible.',
    url: 'https://meskeia.com/orientador-deduccion-obras-energeticas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deducción IRPF obras energéticas — España 2026',
    description: '20%, 40% y 60% de deducción por mejora energética. Requisitos y plazos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Deducción Obras Energéticas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Deducción IRPF por Obras Energéticas',
  description: 'Herramienta de orientación sobre las 3 deducciones en IRPF por obras de mejora de eficiencia energética en viviendas (DA 50.ª LIRPF): 20% por reducir demanda de calefacción/refrigeración, 40% por reducir consumo de energía primaria, y 60% por rehabilitación energética de edificio completo. Plazos, requisitos, certificados y bases máximas actualizados a 2026.',
  url: 'https://meskeia.com/orientador-deduccion-obras-energeticas/',
  features: [
    'Orientación sobre las 3 deducciones (20%, 40%, 60%)',
    'Requisitos, plazos y bases máximas deducibles',
    'Estimación del ahorro fiscal por modalidad',
    'Normativa actualizada: DA 50.ª LIRPF + RDL 2/2026',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué deducciones IRPF existen por obras de mejora energética en vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen tres deducciones recogidas en la Disposición Adicional 50.ª de la Ley del IRPF: el 20% por obras que reduzcan la demanda de calefacción y refrigeración (base máxima 5.000 €/año), el 40% por obras que reduzcan el consumo de energía primaria no renovable al menos un 30% (base máxima 7.500 €/año), y el 60% por rehabilitación energética de edificios completos (base máxima 5.000 €/año por propietario, acumulable hasta 15.000 € en varios ejercicios). Los plazos y requisitos han sido prorrogados por el RDL 2/2026.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué certificado energético se necesita para aplicar la deducción del 20% o del 40%?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para la deducción del 20% se requiere un certificado de eficiencia energética emitido por técnico competente antes y después de las obras, que acredite una reducción de al menos el 7% en la demanda de calefacción y refrigeración. Para la deducción del 40% el certificado posterior debe reflejar una mejora de al menos el 30% en el indicador de consumo de energía primaria no renovable, o que la vivienda alcance la clase energética A o B.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la deducción del 40% y la del 60% por obras energéticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deducción del 40% se aplica sobre obras en la propia vivienda habitual y exige reducir el consumo de energía primaria no renovable en un 30% como mínimo. La deducción del 60% está pensada para obras de rehabilitación energética que afectan al edificio completo (comunidades de propietarios); el propietario puede deducir el 60% de las cantidades pagadas con una base máxima de 5.000 €/año, y acumular hasta 15.000 € a lo largo de hasta cuatro ejercicios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pueden combinar las deducciones del 20%, 40% y 60% en el mismo año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Las tres deducciones son incompatibles entre sí para las mismas obras en el mismo ejercicio fiscal. Si una obra puede calificar para varias modalidades, el contribuyente debe elegir la más favorable. Sí es posible aplicar una deducción por obras en la vivienda y otra distinta por obras en el edificio en el mismo año, siempre que sean actuaciones independientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hasta cuándo se pueden realizar las obras para beneficiarse de estas deducciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Real Decreto-Ley 2/2026 prorrogó el régimen transitorio de deducciones por obras de mejora energética. Las obras deben haberse realizado y pagado dentro de los plazos establecidos por la normativa vigente en cada ejercicio; consultar la redacción actualizada de la DA 50.ª LIRPF o el texto del RDL 2/2026 para confirmar la fecha límite exacta aplicable a cada modalidad.',
      },
    },
  ],
};
