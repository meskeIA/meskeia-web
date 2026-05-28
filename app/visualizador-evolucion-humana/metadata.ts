import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Evolución Humana - De Lucy a Homo Sapiens | meskeIA',
  description: 'Visualiza el linaje humano: Australopithecus, Homo habilis, erectus, Neandertales y sapiens. Timeline interactivo, migraciones Out of Africa y la revolución cognitiva.',
  keywords: ['evolucion humana', 'homo sapiens', 'australopithecus', 'neandertales', 'homo erectus', 'out of africa', 'revolucion cognitiva', 'prehistoria', 'antropologia', 'paleoantropologia'],
  openGraph: {
    title: 'Evolución Humana | meskeIA',
    description: 'De Lucy a Homo sapiens: timeline, migraciones y revolución cognitiva',
    url: 'https://meskeia.com/visualizador-evolucion-humana/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Evolución Humana - De los Primeros Homínidos al Homo Sapiens",
  description: "Visualiza el linaje humano: Australopithecus, Homo habilis, erectus, Neandertales y sapiens. Timeline interactivo, migraciones Out of Africa y la revolución cognitiva.",
  url: "https://meskeia.com/visualizador-evolucion-humana/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo apareció el Homo sapiens y cómo se diferencia de otros homínidos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Homo sapiens surgió en África hace aproximadamente 300.000 años (yacimientos de Jebel Irhoud, Marruecos). Se distingue de otros homínidos por su cráneo globular, frente alta, cara plana y mentón prominente. A diferencia del Homo erectus o el Neandertal, desarrolló un pensamiento simbólico complejo que permitió el arte, el lenguaje articulado y la acumulación de conocimiento cultural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la migración "Out of Africa" y cuándo ocurrió?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La teoría "Out of Africa" describe la expansión del Homo sapiens desde África hacia el resto del mundo, con oleadas principales hace unos 70.000-60.000 años. Los análisis genéticos indican que todos los seres humanos no africanos actuales descienden de este grupo fundador. Existe también una salida anterior (hace ~130.000 años) con evidencias en el Levante mediterráneo, aunque con menor impacto demográfico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los Neandertales y el Homo sapiens se cruzaron?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La secuenciación del genoma neandertal (proyecto liderado por Svante Pääbo, Premio Nobel 2022) demostró que las personas de ascendencia no africana llevan entre un 1 % y un 4 % de ADN neandertal, resultado de cruces ocurridos hace unos 50.000-60.000 años en Oriente Próximo. También existen trazas de ADN de los Denisovanos, otro grupo arcaico, especialmente en poblaciones del Pacífico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué fue la revolución cognitiva y qué cambió en los humanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La revolución cognitiva es el período comprendido entre 70.000 y 30.000 años atrás en el que el Homo sapiens desarrolló capacidades cognitivas sin precedentes: lenguaje complejo, pensamiento abstracto, arte (pinturas rupestres, figurillas), música y ritos funerarios. Algunos investigadores la atribuyen a una mutación genética que modificó las conexiones neuronales; otros la explican por presiones ambientales y acumulación cultural gradual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas especies del género Homo existieron y cuáles sobrevivieron?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se han identificado al menos 8-10 especies en el género Homo: H. habilis, H. rudolfensis, H. ergaster, H. erectus, H. heidelbergensis, H. neanderthalensis, H. floresiensis, H. luzonensis y H. sapiens, entre otras. Todas se extinguieron excepto el Homo sapiens. Las causas de extinción de las demás varían: cambio climático, competencia con sapiens, reducción de habitat y, en algunos casos, posible interacción directa con nuestra especie.',
      },
    },
  ],
};
