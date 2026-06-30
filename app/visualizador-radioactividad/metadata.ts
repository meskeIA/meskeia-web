import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Radioactividad: Desintegración, Vida Media y Datación — meskeIA',
  description: 'Visualiza los tipos de radiación α/β/γ, la ley de desintegración exponencial, datación por carbono-14 y efectos biológicos de la radiación ionizante.',
  keywords: [
    'radioactividad física nuclear',
    'desintegración radiactiva ley exponencial',
    'vida media isótopo radiactivo',
    'radiación alfa beta gamma neutrones',
    'datación carbono 14 arqueología',
    'dosis radiación sievert gray',
    'penetración radiación materiales',
    'radiación ionizante efectos biológicos',
    'desintegración nuclear visualizador',
    'física nuclear bachillerato',
    'física nuclear preparatoria',
    'radioactividad secundaria',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Radioactividad: Desintegración, Vida Media y Datación — meskeIA',
    description: 'Explora la ley de desintegración exponencial, tipos de radiación α/β/γ, datación por C-14 y efectos biológicos de la radiación. Visualizador interactivo con gráficas SVG.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-radioactividad/',
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
    title: 'Radioactividad: Tipos de Radiación y Vida Media',
    description: 'Visualizador interactivo de física nuclear: desintegración exponencial, datación C-14, dosis de radiación y efectos biológicos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Visualizador Radioactividad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Radioactividad: Desintegración, Vida Media y Datación',
  description: 'Visualizador interactivo de física nuclear. Explora los tipos de radiación α/β/γ y neutrones, la ley de desintegración exponencial N(t) = N₀·e^(-λt), datación radiométrica por carbono-14 y efectos biológicos de la radiación ionizante con unidades Gray y Sievert.',
  url: 'https://meskeia.com/visualizador-radioactividad/',
  category: 'EducationalApplication',
  features: [
    'Tabla comparativa interactiva de radiación α, β⁻, β⁺, γ y neutrones con propiedades y ejemplos',
    'SVG de penetración de radiación a través de papel, aluminio, plomo y hormigón',
    'Calculadora de desintegración exponencial N(t) = N₀·e^(-λt) con slider de tiempo',
    'Gráfica SVG de la curva de desintegración con marcas en t½, 2t½ y 3t½',
    'Presets de isótopos reales: C-14, I-131, Tc-99m, Ra-226, U-238',
    'Calculadora de datación por carbono-14 con ejemplos arqueológicos famosos',
    'Límite del método C-14 y calibración con dendrocronología',
    'Tabla de dosis de radiación natural y comparativa con actividades humanas',
    'Efectos biológicos por nivel de dosis (mSv/Sv) con umbrales',
    'Gratuito, sin registro, disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la radiación alfa, beta y gamma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La radiación alfa (α) consiste en núcleos de helio (2 protones + 2 neutrones) con gran masa y carga positiva; tiene poco poder de penetración y se detiene con una hoja de papel, aunque es muy dañina si se inhala. La radiación beta (β) son electrones (β⁻) o positrones (β⁺) de alta velocidad; penetra más y se detiene con unos milímetros de aluminio. La radiación gamma (γ) es radiación electromagnética de alta energía, sin masa ni carga; es la más penetrante y requiere plomo u hormigón para atenuarla significativamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la vida media de un isótopo radiactivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La vida media (t½) es el tiempo necesario para que la mitad de los núcleos radiactivos de una muestra se desintegren. Varía enormemente según el isótopo: el tecnecio-99m tiene una vida media de 6 horas (útil en medicina nuclear), el carbono-14 de 5.730 años (base de la datación arqueológica) y el uranio-238 de 4.500 millones de años. La cantidad restante en cualquier instante sigue la ley exponencial N(t) = N₀ · e^(−λt), donde λ = ln2/t½.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la datación por carbono-14?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los organismos vivos incorporan carbono continuamente a través de la alimentación, manteniendo una proporción constante de C-14 (radiactivo) respecto al C-12 (estable). Al morir, dejan de incorporar carbono y el C-14 se desintegra a su ritmo. Midiendo la proporción actual de C-14 y comparándola con la inicial, se puede calcular hace cuánto murió el organismo. El método es fiable hasta unos 50.000 años; más allá la cantidad de C-14 es demasiado pequeña para medirse con precisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el sievert y cómo se mide la dosis de radiación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El gray (Gy) mide la energía absorbida por kilogramo de tejido (1 Gy = 1 J/kg). El sievert (Sv) es la unidad de dosis efectiva y pondera el gray por el tipo de radiación y el tejido afectado, reflejando mejor el daño biológico real. La dosis natural anual media es de unos 2,4 mSv. Valores superiores a 1 Sv en poco tiempo causan síndrome de radiación aguda; dosis de 4-5 Sv sin tratamiento son letales en el 50 % de los casos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de radioactividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de Bachillerato (Física de 2.º), preparatoria o educación media secundaria, así como primeros cursos universitarios de Física, Química o Medicina que necesiten entender la desintegración nuclear, los tipos de radiación y sus aplicaciones prácticas. También sirve a cualquier persona que quiera comprender conceptos de física nuclear que aparecen en noticias sobre energía nuclear, medicina nuclear o gestión de residuos radiactivos. Funciona en el navegador sin instalación.',
      },
    },
  ],
};
