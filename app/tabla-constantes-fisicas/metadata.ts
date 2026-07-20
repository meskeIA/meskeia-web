import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Constantes Físicas — Valores CODATA con Significado | meskeIA',
  description:
    'Tabla de constantes físicas fundamentales con buscador: velocidad de la luz, constante de Planck, número de Avogadro, Boltzmann, G, estructura fina y masas de las partículas. Valores CODATA 2022 con su significado, la fórmula donde aparecen y si son exactas o medidas.',
  keywords:
    'constantes físicas, tabla de constantes, CODATA 2022, velocidad de la luz, constante de Planck, número de Avogadro, constante de Boltzmann, constante de gravitación, constante de estructura fina, masa del electrón, masa del protón, radio de Bohr, constante de Rydberg, magnetón de Bohr, constante de los gases, unidades SI',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-constantes-fisicas/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Constantes Físicas Fundamentales con Buscador | meskeIA',
    description:
      'Escribe «avogadro», «planck» o «velocidad de la luz» y obtén el valor CODATA, qué significa la constante, en qué fórmula aparece y si es exacta por definición o medida con incertidumbre.',
    url: 'https://meskeia.com/tabla-constantes-fisicas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Constantes Físicas Fundamentales con Buscador | meskeIA',
    description:
      'Constantes físicas con valores CODATA 2022, su significado en una frase, la fórmula donde aparecen y la distinción entre exactas por definición y medidas.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Constantes Físicas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Constantes Físicas Fundamentales',
  description:
    'Tabla de consulta con las constantes físicas fundamentales según el ajuste CODATA 2022: universales, electromagnéticas, atómicas y nucleares, fisicoquímicas, magnitudes de Planck y valores adoptados por convenio. Cada constante incluye su valor en unidades SI y prácticas, qué significa físicamente, la fórmula donde aparece, una comparación tangible y la marca de si es exacta por definición desde la revisión del SI de 2019 o medida experimentalmente con incertidumbre.',
  url: 'https://meskeia.com/tabla-constantes-fisicas/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por nombre, símbolo y sinónimos, tolerante a acentos',
    'Más de 50 constantes organizadas en 6 categorías filtrables',
    'Distinción visual entre constantes exactas por definición y medidas con incertidumbre',
    'Incertidumbre relativa indicada en cada constante medida',
    'Significado físico en una frase y fórmula concreta donde aparece cada constante',
    'Equivalencias en unidades prácticas (eV, MeV/c², ångström, litros por mol)',
    'Valores del ajuste CODATA 2022 publicado por el NIST',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
  keywords: [
    'constantes físicas',
    'CODATA 2022',
    'constante de Planck',
    'número de Avogadro',
    'sistema internacional de unidades',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué constantes físicas son exactas y cuáles se miden?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde la revisión del Sistema Internacional que entró en vigor en 2019, siete constantes tienen un valor fijado por definición y no llevan incertidumbre: la frecuencia del cesio (9.192.631.770 Hz), la velocidad de la luz (299.792.458 m/s), la constante de Planck (6,62607015×10⁻³⁴ J·s), la carga elemental (1,602176634×10⁻¹⁹ C), la constante de Boltzmann (1,380649×10⁻²³ J/K), el número de Avogadro (6,02214076×10²³ mol⁻¹) y la eficacia luminosa K_cd (683 lm/W). Todo lo demás, incluidas la constante de gravitación G y las masas de las partículas, se determina experimentalmente y sí tiene incertidumbre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el valor exacto de la velocidad de la luz en el vacío?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'c = 299.792.458 metros por segundo, exactamente y sin margen de error. No es una coincidencia de números redondos: desde 1983 el metro se define como la distancia que recorre la luz en 1/299.792.458 de segundo, así que medir c con más precisión ya no cambia el número, sino que afina la propia definición del metro. La cifra suele redondearse a 3×10⁸ m/s en cálculos aproximados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la constante de gravitación G se conoce con tan poca precisión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'G vale 6,67430×10⁻¹¹ m³·kg⁻¹·s⁻² con una incertidumbre relativa de 2,2×10⁻⁵, es decir unas cinco cifras significativas fiables. Es con diferencia la peor conocida de las constantes fundamentales porque la gravedad es extraordinariamente débil: hay que medir la atracción entre masas de laboratorio, una fuerza minúscula que cualquier vibración, corriente de aire o gradiente térmico perturba. Distintos experimentos de alta calidad siguen dando resultados que no acaban de coincidir entre sí.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que la constante de estructura fina valga aproximadamente 1/137?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La constante de estructura fina α ≈ 7,2973525643×10⁻³, o 1/137,035999177, mide la intensidad de la interacción electromagnética y es un número puro: sale igual en cualquier sistema de unidades. De ella dependen el tamaño de los átomos, la energía de los enlaces químicos y la separación fina de las líneas espectrales. Se conoce con una incertidumbre relativa del orden de 10⁻¹⁰, lo que la convierte en una de las pruebas más severas de la electrodinámica cuántica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto vale un electronvoltio en julios y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un electronvoltio equivale exactamente a 1,602176634×10⁻¹⁹ julios, porque es la energía que gana un electrón al atravesar una diferencia de potencial de un voltio y coincide numéricamente con la carga elemental. Se usa en física atómica, nuclear y de partículas porque los julios son una unidad absurdamente grande a esa escala: un enlace químico ronda unos pocos eV, y la masa en reposo del electrón equivale a 0,51099895 MeV/c².',
      },
    },
  ],
};
