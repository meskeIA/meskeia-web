import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Regímenes Políticos: Tipología y Características Estructurales — meskeIA',
  description:
    'Matriz interactiva de los 6 tipos de régimen político, espectro de concentración del poder, evolución histórica agregada y mecanismos de transición. Tipología estructural de la ciencia política académica.',
  keywords: [
    'regímenes políticos tipología',
    'democracia liberal características',
    'autoritarismo totalitarismo diferencias',
    'separación de poderes regímenes',
    'transición democrática tipos',
    'monarquía constitucional república',
    'legitimidad política Weber',
    'ciencia política comparada',
    'filosofía política clásica Aristóteles',
    'sistemas de gobierno estructuras',
  ],
  openGraph: {
    title: 'Visualizador de Regímenes Políticos: Tipología y Características Estructurales — meskeIA',
    description:
      'Matriz interactiva de 6 tipos de régimen, espectro de poder y evolución histórica agregada. Enfoque puramente tipológico y estructural.',
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
  name: "Regímenes Políticos: Tipología y Características Estructurales",
  description: "Matriz interactiva de los 6 tipos de régimen político, espectro de concentración del poder, evolución histórica agregada y mecanismos de transición. Tipología estructural de la ciencia política académ",
  url: "https://meskeia.com/visualizador-regimenes-politicos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales tipos de regímenes políticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ciencia política comparada distingue habitualmente seis tipos estructurales: democracia liberal (elecciones competitivas, separación de poderes, derechos garantizados), democracia iliberal (elecciones formales sin garantías plenas), autoritarismo (poder concentrado sin pluralismo real), totalitarismo (control total de la vida pública y privada), monarquía constitucional (jefatura de Estado hereditaria con parlamento) y teocracia (la ley religiosa como fuente de legitimidad). Cada tipo se define por cómo se distribuye el poder, cómo se legitima y qué derechos reconoce.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el autoritarismo del totalitarismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El autoritarismo concentra el poder político e inhibe la oposición, pero generalmente tolera cierto pluralismo social, religioso o económico fuera de la esfera estrictamente política. El totalitarismo, en cambio, pretende controlar todos los aspectos de la vida —incluidos la cultura, la familia y el pensamiento— mediante una ideología movilizadora, un partido único omnipresente y aparatos de propaganda y represión sistemáticos. Los regímenes fascista alemán y estalinista soviético son los casos históricos más estudiados de totalitarismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se producen las transiciones de un régimen a otro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las transiciones de régimen suelen seguir alguno de estos mecanismos: ruptura (colapso súbito por crisis o revolución), reforma pactada (negociación entre élites del régimen y la oposición, como las transiciones en España en 1978 o en varios países latinoamericanos en los 80), imposición externa (por intervención militar o colonial) y erosión gradual (desgaste de instituciones democráticas en democracias iliberales). La teoría de la democratización identifica factores facilitadores como el desarrollo económico, la urbanización y la sociedad civil organizada, aunque ninguno es condición suficiente por sí solo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué distingue una república de una monarquía constitucional en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia fundamental es la forma de designar al jefe de Estado: en una república se elige (directa o indirectamente) y en una monarquía constitucional se hereda. En ambos casos el poder real puede residir en un parlamento y un gobierno elegido, por lo que muchas monarquías constitucionales modernas (España, Suecia, Países Bajos) son funcionalmente democracias parlamentarias. La distinción importa más en términos de legitimidad simbólica y mecanismos de sucesión que de ejercicio cotidiano del poder.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la legitimidad política según Weber?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Max Weber identificó tres tipos puros de legitimidad en su obra Economía y Sociedad (1922): la legitimidad tradicional (el poder se acepta porque siempre ha sido así, como en las monarquías hereditarias), la carismática (el poder emana de las cualidades extraordinarias percibidas en un líder) y la legal-racional (el poder se obedece porque emana de normas impersonales y procedimientos formales, como en las democracias constitucionales). En la práctica, los regímenes combinan varios tipos, aunque los modernos tienden a buscar legitimidad legal-racional como base principal.',
      },
    },
  ],
};
