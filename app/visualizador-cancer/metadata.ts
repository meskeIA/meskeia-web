import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia — meskeIA',
  description: 'Visualizador de la biología molecular del cáncer. Oncogenes vs genes supresores (RAS, TP53, RB1), los 6 Hallmarks de Hanahan & Weinberg, mecanismo PD-1/PD-L1 de inmunoterapia. Sin síntomas ni estadísticas.',
  keywords: ['cáncer biología molecular', 'oncogenes genes supresores tumorales', 'RAS TP53 RB1 mutaciones cáncer', 'hallmarks cáncer Hanahan Weinberg', 'inmunoterapia PD-1 PD-L1 mecanismo', 'angiogénesis VEGF tumor', 'telomerasa cáncer Hayflick', 'apoptosis Bcl-2 evasión cáncer'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia — meskeIA',
    description: 'Cómo las mutaciones en oncogenes y genes supresores llevan a la división descontrolada. Los 6 hallmarks y la inmunoterapia.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-cancer/',
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
    title: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia',
    description: 'Oncogenes, genes supresores, los 6 hallmarks y la inmunoterapia PD-1/PD-L1. Biología molecular pura.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cáncer Biología Molecular meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia',
  description: 'Visualizador interactivo de la biología molecular del cáncer: ciclo celular, oncogenes vs genes supresores (RAS, TP53, RB1), los 6 hallmarks de Hanahan & Weinberg y el mecanismo molecular de la inmunoterapia PD-1/PD-L1.',
  url: 'https://meskeia.com/visualizador-cancer/',
  category: 'EducationalApplication',
  features: [
    'Ciclo celular y checkpoints explicados visualmente',
    'Oncogenes vs genes supresores: RAS, MYC, HER2, TP53, RB1, BRCA',
    'Los 6 hallmarks del cáncer (Hanahan & Weinberg 2000)',
    'Mecanismo PD-1/PD-L1 de inmunoterapia con SVG interactivo',
    'Tipos de cáncer por origen celular (sin estadísticas)',
    'Enfoque exclusivo en biología molecular, sin síntomas ni estadios',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un oncogén y un gen supresor de tumores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un oncogén es la versión mutada de un proto-oncogén: cuando se activa de forma anómala (ganancia de función), impulsa la división celular sin control. Ejemplos son RAS (activo en ~30% de todos los cánceres) o MYC. Un gen supresor de tumores, en cambio, frena normalmente la proliferación o promueve la apoptosis; su pérdida de función contribuye al cáncer. Los más conocidos son TP53 (el "guardián del genoma", mutado en >50% de los tumores) y RB1, que regula el paso del ciclo celular por el checkpoint G1/S.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los hallmarks del cáncer según Hanahan y Weinberg?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En su artículo de 2000, Hanahan y Weinberg describieron 6 capacidades adquiridas por las células tumorales: (1) autosuficiencia en señales de crecimiento, (2) insensibilidad a señales inhibidoras del crecimiento, (3) evasión de la apoptosis, (4) potencial replicativo ilimitado (telomerasa), (5) angiogénesis sostenida (VEGF) y (6) invasión tisular y metástasis. En 2011 ampliaron el modelo con dos capacidades más: reprogramación del metabolismo energético y evasión del sistema inmunitario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la inmunoterapia con inhibidores de PD-1/PD-L1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PD-L1 es una proteína que muchas células tumorales expresan en su superficie para "engañar" a los linfocitos T citotóxicos: al unirse al receptor PD-1 del linfocito, provocan su inactivación y el tumor evade la respuesta inmunitaria. Los inhibidores de checkpoint (como pembrolizumab o nivolumab) bloquean esta unión con anticuerpos monoclonales, restaurando la capacidad del sistema inmunitario para reconocer y destruir las células cancerosas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué estudiantes o profesionales es útil este visualizador de biología del cáncer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado a estudiantes de Biología, Medicina, Farmacia, Biotecnología y Bioquímica que estudian oncología molecular. También resulta útil para investigadores de otras disciplinas que quieran revisar los fundamentos moleculares del cáncer, y para docentes que busquen recursos visuales para explicar el ciclo celular, los checkpoints o el mecanismo de la inmunoterapia. El contenido es exclusivamente molecular: no incluye estadísticas, síntomas ni información clínica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel tiene el ciclo celular en el desarrollo del cáncer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo celular regula cuándo y con qué frecuencia se divide una célula, con puntos de control (checkpoints) en G1/S, G2/M e intraM. En condiciones normales, proteínas como p53 detectan daño en el ADN y detienen el ciclo o inducen apoptosis. En el cáncer, mutaciones en oncogenes o genes supresores desactivan estos frenos: por ejemplo, la pérdida de función de RB1 desbloquea el paso G1→S, y la pérdida de TP53 impide la apoptosis ante el daño genético, permitiendo que células con mutaciones sigan dividiéndose.',
      },
    },
  ],
};
