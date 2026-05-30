import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diabetes: Mecanismo Biológico de Insulina y Glucagón — meskeIA',
  description: 'Visualizador del mecanismo biológico de la diabetes. Páncreas, insulina y glucagón, mecanismo de resistencia a la insulina, tipos 1/2/gestacional y HbA1c. Biología molecular pura, sin diagnóstico.',
  keywords: [
    'diabetes mecanismo biológico',
    'insulina glucagón páncreas',
    'resistencia insulina tipo 2',
    'autoinmune tipo 1 células beta',
    'HbA1c hemoglobina glicosilada',
    'islas Langerhans glucosa',
    'diabetes gestacional lactógeno placentario',
    'glucotoxicidad AGEs estrés oxidativo',
  ],
  openGraph: {
    title: 'Diabetes: Mecanismo Biológico de Insulina y Glucagón — meskeIA',
    description: 'Cómo funciona el páncreas y qué mecanismos moleculares alteran la regulación de la glucosa.',
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
  name: "Diabetes: Mecanismo Biológico de Insulina y Glucagón",
  description: "Visualizador del mecanismo biológico de la diabetes. Páncreas, insulina y glucagón, mecanismo de resistencia a la insulina, tipos 1/2/gestacional y HbA1c. Biología molecular pura, sin diagnóstico.",
  url: "https://meskeia.com/visualizador-diabetes-mecanismo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo regula el páncreas los niveles de glucosa en sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El páncreas regula la glucemia mediante dos hormonas opuestas producidas en las islas de Langerhans. Las células beta secretan insulina cuando la glucosa supera ~100 mg/dL: la insulina activa los receptores celulares para que absorban glucosa y estimula al hígado a almacenarla como glucógeno. Las células alfa secretan glucagón cuando la glucemia baja: el glucagón moviliza el glucógeno hepático y activa la gluconeogénesis para elevar la glucosa. Este eje insulina-glucagón mantiene la glucemia en 70-100 mg/dL en ayunas en personas sin diabetes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre diabetes tipo 1 y tipo 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la diabetes tipo 1, el sistema inmunitario destruye las células beta del páncreas mediante un proceso autoinmune, eliminando casi por completo la producción de insulina. Requiere insulina exógena desde el diagnóstico. En la diabetes tipo 2, las células del organismo desarrollan resistencia al efecto de la insulina, lo que obliga al páncreas a producir cada vez más hasta agotarse progresivamente. Se asocia principalmente a factores metabólicos y se gestiona inicialmente con cambios de hábitos y fármacos orales. La diabetes gestacional se asemeja en mecanismo a la tipo 2 y surge por las hormonas placentarias que antagonizan la insulina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la resistencia a la insulina y cómo se desarrolla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La resistencia a la insulina es la reducción de la respuesta celular a esta hormona, de modo que se necesita más insulina para el mismo efecto metabólico. Se desarrolla progresivamente cuando la exposición crónica a glucosa e insulina elevadas desensibiliza los receptores GLUT4 en músculo, hígado y tejido adiposo. El exceso de ácidos grasos libres, la inflamación de bajo grado y la disfunción mitocondrial agravan el proceso. Con el tiempo, el páncreas no puede compensar la demanda y la glucemia post-prandial se eleva de forma sostenida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide la hemoglobina glicosilada (HbA1c) y por qué es mejor que la glucemia puntual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La HbA1c refleja el porcentaje de hemoglobina que ha reaccionado irreversiblemente con la glucosa durante los últimos 2-3 meses (la vida media del eritrocito). Un valor de 5,7% equivale aproximadamente a una glucemia media de 117 mg/dL; por encima de 6,5% se diagnostica diabetes. A diferencia de la glucemia en ayunas o post-prandial, la HbA1c no fluctúa con las comidas ni el estrés del día, lo que la convierte en el indicador más fiable del control glucémico sostenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los productos finales de glicación avanzada (AGEs) y qué daños causan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los AGEs (Advanced Glycation End-products) son compuestos formados cuando proteínas o lípidos reaccionan con glucosa en exceso sin intervención enzimática. Se acumulan en vasos sanguíneos, nervios, riñones y retina cuando la glucemia está cronicamente elevada. Endurecen las arterias (arteriosclerosis), alteran la función glomerular y dañan la mielina nerviosa, explicando las complicaciones clásicas de la diabetes: nefropatía, retinopatía, neuropatía y enfermedad cardiovascular. Son irreversibles una vez formados, lo que subraya la importancia del control preventivo.',
      },
    },
  ],
};
