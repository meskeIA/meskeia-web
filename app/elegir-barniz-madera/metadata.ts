import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Qué Barniz o Pintura Elegir para Madera - meskeIA',
  description:
    'Orientador para madera: dinos qué vas a tratar (puerta, mueble, valla, suelo, encimera o melamina), el acabado y el estado, y te decimos si usar barniz, lasur, aceite o esmalte, con la preparación paso a paso.',
  keywords:
    'que barniz elegir, barniz o lasur, pintar madera, barnizar puerta, esmalte al agua madera, aceite para madera, pintar mueble de melamina, lijar madera, barniz exterior, barniz para suelo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Qué Barniz o Pintura Elegir para Madera',
    description:
      'Barniz, lasur, aceite o esmalte según la madera y su uso. Incluye la preparación y el lijado, el número de capas y la herramienta.',
    url: 'https://meskeia.com/elegir-barniz-madera',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qué Barniz o Pintura Elegir para Madera',
    description:
      'Elige entre barniz, lasur, aceite o esmalte y prepara bien la madera antes de aplicarlo.',
  },
  other: {
    'application-name': 'Orientador de Madera meskeIA',
  },
};

// Schema.org JSON-LD (WebApplication)
export const jsonLd = generateWebAppSchema({
  name: 'Qué Barniz o Pintura Elegir para Madera',
  description:
    'Orientador que recomienda el producto adecuado para madera (barniz, lasur, aceite o esmalte al agua), la preparación y el lijado, el número de capas y la herramienta, según el elemento (puerta, mueble, valla, suelo, encimera o melamina), el acabado y el estado.',
  url: 'https://meskeia.com/elegir-barniz-madera/',
  category: 'UtilityApplication',
  features: [
    'Recomienda barniz, lasur, aceite o esmalte según el uso de la madera',
    'Distingue interior, intemperie, suelo, contacto con alimentos y melamina',
    'Elección entre acabado natural (ver la veta) o color opaco',
    'Preparación y lijado por granos explicado paso a paso',
    'Número de capas y herramienta adecuada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

// FAQPage JSON-LD
export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/elegir-barniz-madera/',
  mainEntity: [
    {
      question: '¿Barniz, lasur o aceite para la madera?',
      answer:
        'El barniz crea una película protectora y brillante, ideal para muebles y carpintería interior. El lasur es de poro abierto y se usa en madera exterior a la intemperie porque no se cuartea y se renueva con facilidad. El aceite da un aspecto natural mate, penetra en la madera y es la mejor opción para superficies que tocan alimentos.',
    },
    {
      question: '¿Qué producto uso para madera exterior como una valla o una pérgola?',
      answer:
        'Un lasur con filtro UV. Al ser de poro abierto penetra en la madera, la deja transpirar y no se descascarilla: para mantenerlo basta con dar una mano de repaso cada 2-4 años sin lijar a fondo. El barniz filmógeno, en cambio, acaba cuarteándose y saltando con el sol y la lluvia.',
    },
    {
      question: '¿Cómo se prepara la madera antes de barnizar?',
      answer:
        'Se lija en la dirección de la veta subiendo de grano: empieza con grano 120-150 para igualar y termina con 180-220 para dejarla fina. Quita todo el polvo antes de aplicar. En maderas de poro abierto (roble, fresno) usa tapaporos si quieres un acabado liso, y entre manos lija muy suave con grano 240-320.',
    },
    {
      question: '¿Se puede pintar un mueble de melamina?',
      answer:
        'Sí, pero la melamina no es madera: es una superficie no porosa. La clave es aplicar primero una imprimación de agarre multisuperficie y, encima, esmalte al agua. Sin esa imprimación de agarre, cualquier esmalte se despega con el uso. Desengrasa y lija ligeramente antes para dar mordiente.',
    },
    {
      question: '¿Esmalte al agua o sintético para una puerta?',
      answer:
        'Hoy se recomienda el esmalte al agua (acrílico): tiene poco olor, seca rápido y no amarillea con el tiempo. El esmalte sintético (con disolvente) da un acabado muy duro pero amarillea, sobre todo en blanco, y huele mucho más. Para interior, el al agua es la opción más práctica.',
    },
    {
      question: '¿Qué barniz aguanta en un suelo o parquet?',
      answer:
        'Un barniz de poliuretano específico para suelos, que resiste la abrasión del pisado; se dan 2-3 manos con un lijado suave entre ellas. Otra opción es el aceite-cera de alta resistencia, que da un aspecto natural mate y permite reparar zonas concretas sin lijar todo el suelo.',
    },
  ],
});
