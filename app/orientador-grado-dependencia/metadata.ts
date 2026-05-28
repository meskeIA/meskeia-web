import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Grado de Dependencia - Baremo BVD España | meskeIA',
  description: 'Cuestionario orientativo para estimar el grado de dependencia (I, II o III) según el Baremo de Valoración de la Dependencia español. Guía para solicitar la valoración oficial y acceder a prestaciones.',
  keywords: 'grado dependencia, baremo dependencia BVD, SAAD dependencia, valoracion dependencia España, grado I II III dependencia, solicitar dependencia, LAPAD dependencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Grado de Dependencia | meskeIA',
    description: 'Cuestionario orientativo BVD para estimar el grado de dependencia y cómo solicitar la valoración oficial.',
    url: 'https://meskeia.com/orientador-grado-dependencia/',
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
    title: 'Orientador Grado de Dependencia | meskeIA',
    description: 'Estima el grado de dependencia según el baremo BVD y conoce los pasos para solicitarlo',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Grado Dependencia meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Grado de Dependencia",
  description: "Cuestionario orientativo para estimar el grado de dependencia (I, II o III) según el Baremo de Valoración de la Dependencia español. Guía para solicitar la valoración oficial y acceder a prestaciones.",
  url: "https://meskeia.com/orientador-grado-dependencia/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el grado de dependencia y cuántos niveles existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El grado de dependencia es la clasificación oficial del Sistema para la Autonomía y Atención a la Dependencia (SAAD) que determina el nivel de apoyo que necesita una persona. Existen tres grados: Grado I (dependencia moderada), Grado II (dependencia severa) y Grado III (gran dependencia). El grado condiciona las prestaciones y servicios a los que puede acceder la persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se valora el grado de dependencia en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La valoración oficial la realiza un profesional de los servicios sociales de la comunidad autónoma mediante el Baremo de Valoración de la Dependencia (BVD). El evaluador observa la capacidad de la persona para realizar actividades básicas de la vida diaria (ABVD) como el aseo, la alimentación o la movilidad, y aplica el baremo para calcular la puntuación final. El resultado determina el grado reconocido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se solicita la valoración de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La solicitud se presenta ante los servicios sociales de la comunidad autónoma donde reside la persona, en persona o telemáticamente según cada CCAA. Es necesario aportar DNI, informe médico actualizado y, en algunos casos, informes sociales. El plazo máximo de resolución es de seis meses desde la presentación de la solicitud.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un cuestionario orientativo de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cuestionario orientativo ayuda a las familias a tener una primera estimación del grado probable antes de iniciar el proceso oficial. Permite preparar la documentación, anticipar las prestaciones a las que se podría acceder y decidir el momento adecuado para presentar la solicitud. No sustituye en ningún caso la valoración oficial realizada por los servicios sociales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre dependencia Grado II y Grado III?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Grado II (dependencia severa) implica que la persona necesita apoyo para realizar varias actividades básicas al menos dos veces al día, pero no requiere presencia continua. El Grado III (gran dependencia) supone que la persona ha perdido autonomía total o casi total en las funciones básicas y necesita apoyo indispensable y continuo a lo largo de toda la jornada. El Grado III da acceso a un mayor abanico de prestaciones económicas y servicios.',
      },
    },
  ],
};
