import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Grado de Discapacidad — ¿Vale la Pena Solicitarlo? | meskeIA',
  description: 'Descubre si tu situación funcional podría justificar solicitar el reconocimiento del grado de discapacidad en España. Test orientativo basado en el RD 888/2022. Gratuito y sin registro.',
  keywords: 'grado discapacidad, solicitar discapacidad España, certificado discapacidad, reconocimiento discapacidad, baremo discapacidad, 33% discapacidad, pensión no contributiva, tarjeta estacionamiento discapacidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Grado de Discapacidad | meskeIA',
    description: 'Test orientativo para saber si vale la pena solicitar el reconocimiento de discapacidad en España. Basado en criterios funcionales del RD 888/2022.',
    url: 'https://meskeia.com/orientador-discapacidad/',
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
    title: 'Orientador Grado de Discapacidad | meskeIA',
    description: '¿Vale la pena solicitar el reconocimiento de discapacidad? Test orientativo gratuito basado en criterios del RD 888/2022.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Grado de Discapacidad",
  description: "Descubre si tu situación funcional podría justificar solicitar el reconocimiento del grado de discapacidad en España. Test orientativo basado en el RD 888/2022. Gratuito y sin registro.",
  url: "https://meskeia.com/orientador-discapacidad/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el reconocimiento del grado de discapacidad en España y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reconocimiento del grado de discapacidad es una certificación oficial emitida por las comunidades autónomas que acredita que una persona tiene una limitación funcional igual o superior al 33%. Da acceso a beneficios fiscales (deducciones en IRPF, bonificaciones en IBI), cuotas de reserva en empleo público y privado, ayudas económicas como la pensión no contributiva, tarjeta de aparcamiento y otros recursos del Sistema para la Autonomía y Atención a la Dependencia (SAAD).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos para solicitar el certificado de discapacidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puede solicitarlo cualquier persona residente en España que tenga una limitación funcional permanente, ya sea física, sensorial, intelectual o psíquica. El baremo se aplica según el Real Decreto 888/2022, que evalúa el grado de funcionamiento en distintas actividades de la vida diaria. No existe un diagnóstico médico concreto que garantice el reconocimiento: lo que se valora es el impacto funcional real de la condición, no el nombre de la enfermedad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el grado de discapacidad y el grado de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El grado de discapacidad (mínimo 33%) mide la limitación funcional permanente y da acceso a beneficios fiscales, empleo y bonificaciones. El grado de dependencia (Grados I, II y III de la Ley 39/2006) valora la necesidad de apoyo de terceras personas para las actividades básicas de la vida diaria y da acceso a prestaciones del SAAD como teleasistencia, ayuda a domicilio o plazas en centros. Una persona puede tener ambos reconocimientos a la vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este orientador y qué resultado ofrece?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para personas con condiciones crónicas, limitaciones físicas, sensoriales o psíquicas que se preguntan si su situación podría justificar iniciar el trámite de reconocimiento. El test evalúa criterios funcionales basados en el RD 888/2022 y ofrece una orientación sobre si la solicitud parece viable, junto con información sobre los pasos administrativos a seguir. No sustituye la valoración oficial del equipo de valoración y orientación (EVO).',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué porcentaje de discapacidad se tienen deducciones en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con un grado igual o superior al 33% se aplica el mínimo por discapacidad en el IRPF: 3.000 € anuales para el contribuyente, o 9.000 € si el grado es igual o superior al 65%. Si además se necesita ayuda de terceras personas o se tiene movilidad reducida, el mínimo adicional es de 3.000 €. Estos importes se deducen de la base imponible, reduciendo la cuota a pagar o aumentando la devolución.',
      },
    },
  ],
};
