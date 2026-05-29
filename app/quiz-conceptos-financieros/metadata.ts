import { Metadata } from 'next';

const title = 'Quiz de Conceptos Financieros — ¿Cuánto sabes de dinero? | meskeIA';
const description = 'Test educativo de 15 preguntas sobre conceptos financieros básicos: ahorro, interés, inflación, inversión, deuda y presupuesto. Aprende mientras juegas.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'quiz financiero, test educacion financiera, conceptos financieros basicos, aprender finanzas, inflacion que es, interes compuesto explicado, presupuesto basico',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz de Conceptos Financieros | meskeIA',
    description,
    url: 'https://meskeia.com/quiz-conceptos-financieros/',
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
    title: 'Quiz de Conceptos Financieros | meskeIA',
    description: '¿Cuánto sabes de dinero? Test de 15 preguntas con explicaciones',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Quiz de Conceptos Financieros',
  description,
  url: 'https://meskeia.com/quiz-conceptos-financieros/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué conceptos financieros básicos debería conocer cualquier persona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los conceptos esenciales para gestionar bien el dinero son: interés simple e interés compuesto, inflación y poder adquisitivo, diferencia entre ahorro e inversión, tipos de deuda (buena vs costosa) y cómo elaborar un presupuesto personal. Con estos seis pilares se pueden tomar decisiones financieras más informadas sin necesidad de ser experto en economía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el interés compuesto y por qué se llama "la octava maravilla del mundo"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés compuesto consiste en que los intereses generados se reinvierten y a su vez generan nuevos intereses. Con el tiempo, el crecimiento se acelera de forma exponencial. Por ejemplo, 1.000 € al 7% anual durante 30 años se convierten en más de 7.600 € sin aportaciones adicionales. La clave es el tiempo: cuanto antes se empieza, mayor es el efecto multiplicador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre ahorro e inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorro consiste en guardar dinero en un lugar seguro (cuenta bancaria, depósito) con bajo riesgo y baja rentabilidad. La inversión implica poner ese dinero a trabajar en activos (acciones, fondos, inmuebles) con mayor potencial de rentabilidad pero también mayor riesgo. La inflación erosiona el ahorro a largo plazo, por lo que invertir es necesario para mantener el poder adquisitivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este quiz de educación financiera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz está diseñado para cualquier persona que quiera comprobar o reforzar sus conocimientos sobre dinero, sin importar su nivel previo. Es ideal para estudiantes de secundaria o universidad, personas que se incorporan al mercado laboral o cualquiera que sienta que nunca le explicaron bien cómo funciona el dinero. Las 15 preguntas incluyen explicación de la respuesta correcta al terminar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la inflación al dinero que tengo ahorrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inflación reduce el poder adquisitivo del dinero: si la inflación anual es del 3% y tu ahorro no genera rentabilidad, en términos reales pierdes un 3% de capacidad de compra cada año. Tras 10 años de inflación al 3%, 10.000 € valen en términos reales lo equivalente a unos 7.440 € actuales. Por eso los expertos recomiendan que el dinero a largo plazo esté invertido en activos que superen la inflación.',
      },
    },
  ],
};
