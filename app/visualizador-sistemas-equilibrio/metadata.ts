import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo el Cuerpo Mantiene el Equilibrio | meskeIA',
  description: 'Descubre los tres sistemas que permiten al cuerpo mantenerse en equilibrio: el sistema vestibular, la visión y la propiocepción. Visualizador educativo interactivo.',
  keywords: [
    'sistema vestibular',
    'equilibrio corporal',
    'propiocepción',
    'mareo cervicogénico',
    'oído interno equilibrio',
    'sistemas equilibrio humano',
    'fisiología equilibrio',
    'biology',
    'salud mayor',
  ],
  openGraph: {
    title: 'Cómo el Cuerpo Mantiene el Equilibrio | meskeIA',
    description: 'Visualizador educativo de los tres sistemas del equilibrio: vestibular, visual y propioceptivo.',
    url: 'https://meskeia.com/visualizador-sistemas-equilibrio/',
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
  alternates: {
    canonical: 'https://meskeia.com/visualizador-sistemas-equilibrio/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cómo el Cuerpo Mantiene el Equilibrio",
  description: "Descubre los tres sistemas que permiten al cuerpo mantenerse en equilibrio: el sistema vestibular, la visión y la propiocepción. Visualizador educativo interactivo.",
  url: "https://meskeia.com/visualizador-sistemas-equilibrio/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tres sistemas controlan el equilibrio en el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El equilibrio corporal depende de tres sistemas que trabajan de forma coordinada: el sistema vestibular (oído interno), la visión y la propiocepción (receptores musculares y articulares). El cerebro integra la información de los tres de manera continua; cuando uno falla o envía señales contradictorias, aparece mareo o inestabilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el sistema vestibular y cómo detecta el movimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema vestibular está en el oído interno y se compone de los canales semicirculares (que detectan rotación) y los órganos otolíticos, utrículo y sáculo (que detectan aceleración lineal y gravedad). Pequeños cristales de carbonato cálcico llamados otolitos estimulan células ciliadas que envían señales eléctricas al cerebro sobre la posición y el movimiento de la cabeza.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la propiocepción y por qué es importante para no caerse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La propiocepción es la capacidad del cuerpo de percibir su propia posición en el espacio sin necesidad de mirar. Receptores en músculos (husos musculares), tendones (órganos de Golgi) y articulaciones envían información constante sobre el tono muscular y el ángulo articular. Gracias a ella podemos caminar sin mirar los pies o mantener el equilibrio con los ojos cerrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el mareo cervicogénico produce pérdida de equilibrio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mareo cervicogénico ocurre cuando los receptores propioceptivos del cuello (especialmente de las vértebras C1-C3) envían información errónea al cerebro sobre la posición de la cabeza. Esto crea un conflicto con las señales vestibulares y visuales, generando sensación de inestabilidad o mareo. Es frecuente tras contracturas cervicales, whiplash o artrosis cervical.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre cuando los tres sistemas del equilibrio envían señales contradictorias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando el cerebro recibe información contradictoria entre los sistemas vestibular, visual y propioceptivo, se produce lo que se conoce como conflicto sensorial. La respuesta habitual es el mareo o la sensación de movimiento ilusorio (vértigo). El mareo por movimiento en vehículos es el ejemplo más común: los ojos ven algo estático pero el vestíbulo detecta aceleración, y la contradicción activa la náusea.',
      },
    },
  ],
};
