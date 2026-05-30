import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-crispr-cas9';
const TITLE = 'CRISPR-Cas9: Edición Génica Paso a Paso - meskeIA';
const DESCRIPTION =
  'Visualiza el mecanismo completo de CRISPR-Cas9: ARN guía, búsqueda del PAM, corte de doble hebra, reparación por NHEJ o HDR, aplicaciones terapéuticas y el debate bioético.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Mecanismo CRISPR-Cas9 paso a paso con animación SVG',
      'Comparativa NHEJ vs HDR con tabla interactiva',
      'Aplicaciones terapéuticas aprobadas y en ensayos clínicos',
      'Debate bioético estructurado: caso He Jiankui y líneas rojas',
    ],
    category: 'EducationalApplication',
  });
}

export const jsonLd = generateWebAppSchema({
  name: "CRISPR-Cas9: Mecanismo, Edición Genómica y Bioética",
  description: "Visualizador interactivo de CRISPR-Cas9. Mecanismo completo en 6 pasos con SVG animado (guía ARN, endonucleasa Cas9, corte DSB), comparativa NHEJ vs HDR con tabla de aplicaciones, 6 enfermedades terap",
  url: "https://meskeia.com/visualizador-crispr-cas9/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es CRISPR-Cas9 y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CRISPR-Cas9 es un sistema de edición génica de precisión basado en un mecanismo inmunitario natural de las bacterias. Una secuencia de ARN guía (gRNA) dirige a la proteína nucleasa Cas9 hasta una región específica del ADN complementaria a esa guía. Cas9 corta las dos hebras del ADN (corte de doble hebra, DSB) en ese punto exacto, permitiendo eliminar, corregir o insertar secuencias génicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre NHEJ y HDR en la reparación del ADN tras CRISPR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tras el corte del ADN, la célula puede repararlo por dos vías. NHEJ (unión de extremos no homólogos) es rápida pero propensa a errores: introduce pequeñas inserciones o deleciones (indels) que suelen inactivar el gen, útil para "apagar" genes. HDR (reparación dirigida por homología) usa una plantilla de ADN suministrada para insertar una secuencia precisa, con mucha mayor exactitud pero menor eficiencia y solo activa en células en división.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué enfermedades se está usando CRISPR en ensayos clínicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aplicaciones terapéuticas más avanzadas incluyen anemia falciforme y beta-talasemia (Casgevy, aprobado en 2023 en EE.UU. y Europa), distrofia muscular de Duchenne, ciertas leucemias y linfomas mediante células CAR-T editadas, y amiloidosis transtiretina. También hay investigación activa en VIH, cegueras hereditarias y enfermedades cardiovasculares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales riesgos éticos de CRISPR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El debate bioético gira en torno a tres ejes: los efectos fuera de diana (off-target) que pueden dañar genes no deseados, la edición de la línea germinal (embriones) cuyos cambios son heredables —prohibida en la mayoría de países tras el caso He Jiankui en 2018—, y el riesgo de eugenesia si se aplica a rasgos no terapéuticos. La mayoría de la comunidad científica apoya la edición somática terapéutica con supervisión regulatoria estricta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia CRISPR-Cas9 de las técnicas de edición génica anteriores como ZFN o TALEN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las nucleasas de dedos de zinc (ZFN) y TALEN reconocen el ADN mediante proteínas diseñadas a medida, lo que las hace costosas, lentas de producir y difíciles de usar en paralelo. CRISPR-Cas9 utiliza un ARN guía fácil de sintetizar y reprogramar en días, es mucho más barato, eficiente y permite editar varios genes simultáneamente (multiplexing). Esta accesibilidad ha democratizado la biología molecular desde 2012.',
      },
    },
  ],
};
