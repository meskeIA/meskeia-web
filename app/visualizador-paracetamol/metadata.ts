import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Paracetamol: Cómo Funciona | meskeIA',
  description:
    'El analgésico más usado del mundo actúa en el cerebro, no en la inflamación. Visualiza el metabolismo hepático, el NAPQI, la sobredosis y por qué el alcohol lo hace más peligroso.',
  keywords: [
    'paracetamol como funciona',
    'paracetamol mecanismo',
    'paracetamol NAPQI',
    'paracetamol higado',
    'paracetamol sobredosis',
    'paracetamol alcohol',
    'paracetamol embarazo',
    'acetaminofen como funciona',
  ],
  openGraph: {
    title: 'Paracetamol: El Analgésico que Actúa en el Cerebro',
    description:
      'Seguro para el estómago, exigente con el hígado. El NAPQI y por qué el alcohol lo hace más peligroso.',
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
  name: "Paracetamol: Cómo Actúa en el Sistema Nervioso Central",
  description: "El analgésico más usado del mundo actúa en el cerebro, no en la inflamación. Visualiza el metabolismo hepático, el NAPQI, la sobredosis y por qué el alcohol lo hace más peligroso.",
  url: "https://meskeia.com/visualizador-paracetamol/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el paracetamol para quitar el dolor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El paracetamol actúa principalmente en el sistema nervioso central, modulando los umbrales de percepción del dolor y la termorregulación en el hipotálamo. A diferencia del ibuprofeno o la aspirina, no inhibe significativamente las ciclooxigenasas periféricas, por lo que no reduce la inflamación en tejidos. Su mecanismo exacto no está del todo dilucidado: se cree que potencia las vías serotoninérgicas descendentes y puede modular receptores cannabinoides endógenos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el paracetamol daña el hígado en sobredosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hígado metaboliza el paracetamol principalmente por glucuronidación y sulfatación. Una pequeña fracción (≈5-10 %) se convierte en NAPQI, un metabolito altamente reactivo y hepatotóxico. En condiciones normales, el glutatión hepático neutraliza el NAPQI rápidamente. En sobredosis, las vías principales se saturan, se genera mucho más NAPQI del que el glutatión puede neutralizar, y el metabolito ataca directamente las células hepáticas causando necrosis. El antídoto es la N-acetilcisteína, que repone el glutatión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué es más peligroso tomar paracetamol con alcohol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El consumo crónico de alcohol induce la enzima CYP2E1, que es precisamente la vía metabólica que genera el NAPQI tóxico. En personas que beben habitualmente, una dosis de paracetamol que sería segura para el resto de la población puede producir mucho más NAPQI de lo esperado, agotando el glutatión hepático disponible. Además, el alcohol y el paracetamol compiten por las mismas vías hepáticas, lo que puede alterar el metabolismo de ambos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro tomar paracetamol durante el embarazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El paracetamol ha sido históricamente el analgésico de elección en el embarazo por su perfil de seguridad superior al de los AINEs. Sin embargo, estudios observacionales recientes (2021-2023) sugieren una posible asociación entre la exposición prenatal prolongada y un mayor riesgo de TDAH y trastornos del neurodesarrollo en el niño. Las principales agencias reguladoras (EMA, FDA) recomiendan usarlo a la dosis mínima eficaz durante el menor tiempo posible y consultar con un profesional sanitario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre paracetamol y acetaminofén?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Paracetamol y acetaminofén son exactamente el mismo compuesto químico (N-acetil-p-aminofenol, APAP). El nombre "paracetamol" se usa en Europa, Australia y la mayoría de países hispanohablantes, mientras que "acetaminofén" es el nombre común en Estados Unidos, Canadá y algunos países de América Latina. La denominación internacional no oficial (DCI) es paracetamol. Ambos nombres se refieren a la misma molécula, con los mismos efectos, dosis y riesgos.',
      },
    },
  ],
};
