import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Máquinas Simples - Palanca, Polea, Plano Inclinado y más | meskeIA',
  description: 'Descubre las 6 máquinas simples con simulaciones interactivas: palanca, polea, plano inclinado, rueda y eje, cuña y tornillo. Ventaja mecánica visualizada.',
  keywords: 'máquinas simples, palanca, polea, plano inclinado, rueda y eje, cuña, tornillo, ventaja mecánica, Arquímedes, física, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Máquinas Simples - Palanca, Polea, Plano Inclinado y más',
    description: 'Cómo levantar 100 kg con solo 10 kg de fuerza: las 6 máquinas simples explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-maquinas-simples/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Máquinas Simples - Explicador Visual',
    description: 'De Arquímedes a las grúas modernas: ventaja mecánica con simulaciones interactivas.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Máquinas Simples meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Máquinas Simples - Palanca, Polea, Plano Inclinado y más',
  description: 'Explicador visual interactivo sobre las 6 máquinas simples: palanca, polea, plano inclinado, rueda y eje, cuña y tornillo. Ventaja mecánica con sliders, ejemplos cotidianos y datos históricos.',
  url: 'https://meskeia.com/visualizador-maquinas-simples/',
  category: 'EducationalApplication',
  features: [
    'Las 6 máquinas simples con SVG y descripción detallada',
    'Simulación interactiva de ventaja mecánica para palanca y plano inclinado',
    'Ejemplos cotidianos: tijeras, grúa, rampa, volante, hacha, sacacorchos',
    'Historia: Arquímedes, pirámides de Egipto, Leonardo da Vinci',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 6 máquinas simples?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las seis máquinas simples clásicas son: palanca (una barra que gira sobre un punto de apoyo), polea (rueda con cuerda que cambia la dirección o la magnitud de la fuerza), plano inclinado (superficie en ángulo que reduce la fuerza necesaria a cambio de mayor distancia), rueda y eje (cilindro pequeño unido a uno mayor para multiplicar el par), cuña (plano inclinado doble para separar materiales) y tornillo (plano inclinado enrollado en espiral). Todas reducen el esfuerzo necesario para realizar un trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la ventaja mecánica de una máquina simple?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ventaja mecánica (VM) es la razón entre la fuerza que ejerce la máquina sobre la carga y la fuerza que aplica el usuario. Una VM de 5 significa que la máquina multiplica la fuerza por 5, permitiendo mover 500 N con solo 100 N de esfuerzo. Sin embargo, esta ganancia de fuerza se paga con mayor distancia recorrida: el trabajo total (fuerza × distancia) siempre se conserva (sin rozamiento).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usan las máquinas simples en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las máquinas simples están en todas partes: las tijeras son dos palancas de clase 1; una rampa de accesibilidad es un plano inclinado; el volante de un coche es una rueda y eje; un hacha es una cuña; un sacacorchos es un tornillo; y las poleas múltiples permiten a las grúas levantar cientos de toneladas. Comprender estos principios es la base para entender cualquier máquina compleja, desde una bicicleta hasta un motor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo clasificó Arquímedes las máquinas simples?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Arquímedes de Siracusa (287-212 a.C.) es considerado el primer investigador sistemático de las máquinas simples. Describió la palanca, la polea y el tornillo sin fin, y enunció el principio de la palanca: "La fuerza está a la carga como la distancia de la carga al fulcro está a la distancia de la fuerza al fulcro". Su famosa frase "dadme un punto de apoyo y moveré el mundo" ilustra el poder de la ventaja mecánica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de palancas existen según la posición del fulcro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las palancas se clasifican en tres tipos según la posición relativa del punto de apoyo (fulcro), la fuerza y la carga. En la palanca de clase 1 el fulcro está entre la fuerza y la carga (ejemplo: balancín, tijeras). En la de clase 2 la carga está entre el fulcro y la fuerza (ejemplo: carretilla, cascanueces). En la de clase 3 la fuerza se aplica entre el fulcro y la carga (ejemplo: pinzas, antebrazo humano), y aunque no multiplica la fuerza, sí amplifica el desplazamiento.',
      },
    },
  ],
};
