import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Financiación Empresarial | ¿Cómo Financiar tu Negocio? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de financiación se adapta mejor a tu negocio: autofinanciación, préstamo bancario, inversores o business angels, crowdfunding o subvenciones públicas.',
  keywords: [
    'cómo financiar mi negocio',
    'préstamo bancario o inversores',
    'business angels España',
    'crowdfunding empresarial',
    'subvenciones pymes España',
    'autofinanciación negocio',
    'financiación startup España',
    'capital riesgo pyme',
    'ICO préstamos pymes',
    'cómo conseguir financiación empresa',
  ],
  openGraph: {
    title: 'Selector de Financiación Empresarial — ¿Cómo Financiar tu Negocio?',
    description:
      'Descubre qué tipo de financiación se adapta mejor a tu negocio en 10 preguntas.',
    url: 'https://meskeia.com/selector-financiacion-empresa/',
    siteName: 'meskeIA',
    locale: 'es_ES',
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
  name: "Selector de Financiación Empresarial",
  description: "Test de 10 preguntas para saber qué tipo de financiación se adapta mejor a tu negocio: autofinanciación, préstamo bancario, inversores o business angels, crowdfunding o subvenciones públicas.",
  url: "https://meskeia.com/selector-financiacion-empresa/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales formas de financiar un negocio o startup?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las fuentes más habituales son: autofinanciación (reinversión de beneficios propios o ahorros del fundador), préstamos bancarios o líneas ICO, inversores privados o business angels (que aportan capital a cambio de participación), crowdfunding de inversión o recompensa, y subvenciones públicas de organismos como ENISA, CDTI o los programas europeos. La elección depende del tamaño del proyecto, la fase en que se encuentra el negocio, la velocidad de crecimiento buscada y el grado de dilución que el fundador está dispuesto a asumir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un business angel y en qué se diferencia de un fondo de capital riesgo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un business angel es una persona física —habitualmente un empresario o directivo con experiencia— que invierte su propio dinero en startups en fases tempranas (pre-seed o seed) a cambio de participación accionarial, aportando además su red de contactos y conocimiento del sector. Un fondo de capital riesgo (Venture Capital) gestiona dinero de terceros inversores y suele entrar en rondas más grandes (Series A en adelante), con procesos de due diligence más formales y objetivos de rentabilidad más exigentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué subvenciones públicas existen para financiar una empresa en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales opciones públicas en España son: préstamos participativos de ENISA (hasta 1,5 M€ para pymes innovadoras, sin garantías reales), ayudas del CDTI para proyectos de I+D+i, líneas de avales del ICO para facilitar el acceso al crédito bancario, programas Horizon Europe para proyectos con componente de investigación, y convocatorias autonómicas y municipales. Las subvenciones a fondo perdido son escasas y muy competidas; la mayoría son préstamos en condiciones ventajosas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene financiarse con un préstamo bancario en lugar de buscar inversores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El préstamo bancario es adecuado cuando el negocio ya genera ingresos estables, puede demostrar capacidad de repago y no quiere ceder participación a terceros. Es la opción preferida para negocios con activos tangibles (inmuebles, maquinaria) que sirven de garantía. Buscar inversores tiene sentido cuando el proyecto necesita capital para crecer rápido, el mercado potencial es grande y el emprendedor valora el aporte estratégico del inversor además del dinero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el crowdfunding de inversión y para qué tipo de proyectos es adecuado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El crowdfunding de inversión (equity crowdfunding) permite que múltiples pequeños inversores aporten capital a cambio de participación en el capital de la empresa, a través de plataformas reguladas por la CNMV. Es adecuado para proyectos con tracción demostrable y una comunidad o base de clientes que quiera implicarse. El ticket medio por inversor es bajo (200-5.000 €), pero la gestión de muchos socios minoritarios puede complicar rondas posteriores. El crowdfunding de recompensa (Kickstarter, Verkami) no implica cesión de capital y funciona mejor para productos creativos o físicos.',
      },
    },
  ],
};
