import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de salmuera (brining): sal y agua | meskeIA',
  description:
    'Calcula la sal y el agua para tu salmuera según la concentración (ligera, media o intensa) y los litros, con tiempos orientativos por pieza. Para carnes y pescados más jugosos. Gratis y en español.',
  keywords:
    'calculadora salmuera, brining sal agua, cuanta sal para salmuera, salmuera pollo pavo, salmuera porcentaje, salmuera tiempo, marinar en salmuera carne',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de salmuera (brining)', description: 'Sal y agua para tu salmuera según la concentración, con tiempos por pieza.', url: 'https://meskeia.com/calculadora-salmuera', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Calculadora de salmuera', description: 'Sal y agua para tu salmuera, con tiempos por pieza.' },
  other: { 'application-name': 'Calculadora de salmuera meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-salmuera/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de salmuera (brining)',
  description:
    'Calcula los gramos de sal (y de azúcar opcional) y el agua para preparar una salmuera según la concentración deseada —ligera, media o intensa— y los litros de agua, con tiempos orientativos de salmuera según el tipo de pieza.',
  url: 'https://meskeia.com/calculadora-salmuera/',
  features: [
    'Sal y agua según la concentración de salmuera',
    'Azúcar opcional para equilibrar',
    'Concentraciones ligera, media e intensa',
    'Tiempos orientativos por pieza',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es una salmuera y para qué sirve?', acceptedAnswer: { '@type': 'Answer', text: 'Una salmuera es agua con sal disuelta (y a veces azúcar y especias) en la que se sumerge carne o pescado antes de cocinarlo. La sal ayuda a que la pieza retenga humedad y se sazone por dentro, de modo que queda más jugosa y sabrosa, sobre todo en cortes magros como la pechuga de pollo o el lomo de cerdo.' } },
    { '@type': 'Question', name: '¿Cuánta sal lleva una salmuera?', acceptedAnswer: { '@type': 'Answer', text: 'Se mide como porcentaje de sal sobre el peso del agua. Una salmuera ligera lleva un 4% (40 g de sal por litro), una media un 6% y una intensa un 8%. A mayor concentración, más rápido actúa pero más hay que vigilar el tiempo para no salar en exceso. La herramienta calcula la sal exacta para los litros que uses.' } },
    { '@type': 'Question', name: '¿Cuánto tiempo se deja en salmuera?', acceptedAnswer: { '@type': 'Answer', text: 'Depende del grosor de la pieza: unos lomos de pescado bastan con 15-30 minutos, unas pechugas con 30 minutos a 1 hora, y un pavo entero necesita de 12 a 24 horas. Pasarse de tiempo puede dejar la carne demasiado salada o con textura curada, así que conviene respetar los rangos.' } },
    { '@type': 'Question', name: '¿Hay que aclarar la carne después de la salmuera?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, conviene escurrir y secar bien la pieza tras sacarla de la salmuera (y aclararla por fuera si la salmuera era intensa), para retirar el exceso de sal de la superficie y para que dore mejor al cocinarla. Una pieza húmeda por fuera cuesta más de dorar.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre salmuera húmeda y seca?', acceptedAnswer: { '@type': 'Answer', text: 'La salmuera húmeda sumerge la pieza en agua con sal; la seca consiste en frotar la pieza con sal (y dejarla reposar en la nevera). La húmeda aporta más jugosidad por el agua absorbida; la seca concentra más el sabor y deja la piel más crujiente. Esta calculadora es para la salmuera húmeda.' } },
  ],
};
