import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Puntos de humo de los aceites: cuál usar para freír | meskeIA',
  description:
    'Tabla del punto de humo de los aceites y grasas de cocina: aguacate, ghee, girasol, oliva, coco, sésamo y lino, con la temperatura que aguanta cada uno y para qué usarlo (crudo, plancha o fritura). Descubre con qué aceite freír. Gratis y en español.',
  keywords:
    'punto de humo aceite oliva, con que aceite freir, punto de humo aceite girasol, aceite de aguacate freir, ghee punto de humo, punto de humo aceites, aceite para freir mejor, temperatura humo aceite',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Puntos de humo de los aceites (cuál usar para freír)', description: 'La temperatura que aguanta cada aceite y grasa de cocina, del aliño en crudo a la fritura.', url: 'https://meskeia.com/puntos-humo-aceites', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Puntos de humo de los aceites', description: 'Qué aceite aguanta cada temperatura: del aliño en crudo a la fritura.' },
  other: { 'application-name': 'Puntos de humo de aceites meskeIA' },
  alternates: { canonical: 'https://meskeia.com/puntos-humo-aceites/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Puntos de humo de los aceites',
  description:
    'Tabla de consulta del punto de humo de los aceites y grasas de cocina, ordenados por temperatura, con el uso recomendado de cada uno (aliño en crudo, salteado y plancha, o fritura y wok) y una nota sobre cómo influye el refinado.',
  url: 'https://meskeia.com/puntos-humo-aceites/',
  category: 'EducationalApplication',
  features: [
    'Aceites y grasas ordenados por punto de humo',
    'Buscador por nombre de aceite',
    'Filtro por uso: crudo, calor medio y calor alto',
    'Temperatura aproximada de cada grasa en °C',
    'Distinción entre aceite refinado y sin refinar',
    'Buenas prácticas para freír sin degradar el aceite',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Se puede freír con aceite de oliva?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. El aceite de oliva suave o refinado tiene un punto de humo de unos 210 °C, perfecto para freír. El virgen extra (AOVE) ronda los 190 °C y aguanta plancha y fritura moderada, aunque a temperaturas altas pierde parte de sus matices. El mito de que no se puede freír con oliva es matizable: depende sobre todo del tipo y del refinado.' } },
    { '@type': 'Question', name: '¿Qué aceite tiene el punto de humo más alto?', acceptedAnswer: { '@type': 'Answer', text: 'El aceite de aguacate refinado es el más estable, con un punto de humo de unos 270 °C, seguido de la mantequilla clarificada o ghee (250 °C) y del girasol alto oleico, el cacahuete y el maíz (230 °C). Son las grasas ideales para fritura y wok, donde se alcanzan temperaturas muy altas.' } },
    { '@type': 'Question', name: '¿Qué es el punto de humo de un aceite?', acceptedAnswer: { '@type': 'Answer', text: 'Es la temperatura a la que la grasa empieza a humear y degradarse. Por encima de ese umbral el aceite cambia de sabor (se vuelve amargo), pierde propiedades y genera compuestos indeseables como la acroleína, ese humo azulado que irrita ojos y garganta. Es un valor orientativo que varía con el refinado, la calidad y la antigüedad del aceite.' } },
    { '@type': 'Question', name: '¿Por qué no se debe calentar el aceite de lino?', acceptedAnswer: { '@type': 'Answer', text: 'El aceite de lino o linaza tiene un punto de humo muy bajo, alrededor de 107 °C, y se degrada enseguida con el calor. Por eso se usa solo en frío, para aliñar, aprovechando su omega-3. Otros aceites delicados sin refinar, como el de nuez (160 °C) o el de sésamo tostado, tampoco se deben calentar.' } },
    { '@type': 'Question', name: '¿Cuántas veces se puede reutilizar el aceite de freír?', acceptedAnswer: { '@type': 'Answer', text: 'No conviene reutilizar el mismo aceite de fritura muchas veces, porque se oxida con cada uso y su punto de humo baja. Como referencia, se puede aprovechar unas pocas frituras si se cuela y se conserva bien, pero hay que desecharlo si humea antes de tiempo, huele a rancio o se ha vuelto muy oscuro. El aceite usado nunca debe ir por el fregadero: se lleva a un punto de reciclaje.' } },
  ],
};
