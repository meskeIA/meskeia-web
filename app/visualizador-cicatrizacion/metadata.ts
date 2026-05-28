import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador de la Cicatrización | Las 4 Fases de Reparación de Heridas | meskeIA',
  description: 'Explora las 4 fases de cicatrización: hemostasia (coágulo), inflamación (neutrófilos/macrófagos), proliferación (colágeno/angiogénesis) y remodelado (hasta 2 años). Tipos de heridas y factores.',
  keywords: ['cicatrizacion', 'hemostasia', 'inflamacion', 'proliferacion', 'remodelado', 'herida', 'colageno', 'fibroblastos', 'queloides'],
  openGraph: {
    title: 'Visualizador de la Cicatrización | meskeIA',
    description: 'Las 4 fases de reparación de heridas: hemostasia, inflamación, proliferación y remodelado. Células, mediadores y factores explicados visualmente.',
    url: 'https://meskeia.com/visualizador-cicatrizacion/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de la Cicatrización',
  description: 'Las 4 fases de reparación de heridas: hemostasia, inflamación, proliferación y remodelado.',
  url: 'https://meskeia.com/visualizador-cicatrizacion/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 4 fases de la cicatrización de heridas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cicatrización se divide en cuatro fases secuenciales: hemostasia (0-24 horas), donde se forma el coágulo para detener el sangrado; inflamación (1-4 días), con llegada de neutrófilos y macrófagos que limpian la herida; proliferación (4-21 días), donde fibroblastos depositan colágeno y se forma tejido de granulación; y remodelado (3 semanas a 2 años), en el que el colágeno se reorganiza y la cicatriz madura y se contrae.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los queloides y por qué se forman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los queloides son cicatrices que crecen más allá de los límites originales de la herida debido a una proliferación excesiva de fibroblastos y depósito descontrolado de colágeno durante la fase de remodelado. A diferencia de las cicatrices hipertróficas, que quedan dentro del contorno de la lesión, los queloides invaden la piel sana circundante. Son más frecuentes en personas con piel oscura y en zonas de alta tensión como el esternón, los hombros y los lóbulos de las orejas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores pueden retrasar o dificultar la cicatrización?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales factores que dificultan la cicatrización son: diabetes (altera la respuesta inflamatoria y la circulación), desnutrición (deficiencia de vitamina C, zinc o proteínas limita la síntesis de colágeno), infección bacteriana (prolonga la inflamación y destruye tejido nuevo), uso de corticoides (inhiben la proliferación celular) y edad avanzada (todos los procesos se ralentizan). La hipoxia tisular por mala perfusión es también un factor crítico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel tienen los macrófagos en la curación de una herida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los macrófagos son células clave en la transición entre las fases inflamatoria y proliferativa. Llegan a la herida tras los neutrófilos y tienen dos roles principales: fagocitar bacterias y restos celulares para limpiar el lecho de la herida, y secretar factores de crecimiento (como TGF-β, VEGF y PDGF) que reclutan fibroblastos, estimulan la angiogénesis y coordinan la formación de nuevo tejido. Sin macrófagos funcionales, la cicatrización se detiene en la fase inflamatoria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en cicatrizar una herida por segunda intención?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cicatrización por segunda intención ocurre cuando los bordes de la herida no se aproximan (heridas abiertas, úlceras, quemaduras) y el tejido debe rellenarse desde el fondo. Este proceso es considerablemente más lento que la cicatrización por primera intención (bordes suturados): puede tardar semanas o meses dependiendo del tamaño, la localización y el estado general del paciente. La cicatriz resultante suele ser más prominente y retraída.',
      },
    },
  ],
};
