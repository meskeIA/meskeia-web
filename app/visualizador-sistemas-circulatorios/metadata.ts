import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sistemas Circulatorios - Del Corazón de 2 al de 4 Cámaras | meskeIA',
  description: 'Evolución del sistema circulatorio en el reino animal: de organismos sin sistema hasta el doble circuito de mamíferos. Corazones de 2, 3 y 4 cámaras, sangre fría vs caliente. Explicador visual.',
  keywords: 'sistema circulatorio, evolución corazón, sangre fría, sangre caliente, ectotermia, endotermia, corazón cámaras, circulación abierta, circulación cerrada, biología animal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sistemas Circulatorios - Del Corazón de 2 al de 4 Cámaras',
    description: 'Evolución del sistema circulatorio animal: circulación abierta, cerrada, corazones y termorregulación explicados visualmente.',
    url: 'https://meskeia.com/visualizador-sistemas-circulatorios/',
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
    title: 'Sistemas Circulatorios - Explicador Visual',
    description: 'Del corazón de 2 cámaras al de 4: evolución circulatoria, sangre fría vs caliente y datos fascinantes.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistemas Circulatorios meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sistemas Circulatorios - Del Corazón de 2 al de 4 Cámaras',
  description: 'Explicador visual interactivo sobre la evolución del sistema circulatorio en el reino animal: desde organismos sin sistema hasta el doble circuito de mamíferos, corazones de 2 a 4 cámaras, ectotermia vs endotermia y datos fascinantes del mundo animal.',
  url: 'https://meskeia.com/visualizador-sistemas-circulatorios/',
  category: 'EducationalApplication',
  features: [
    'Evolución de 4 tipos de sistema circulatorio con diagramas animados',
    'Comparativa de corazones de 2, 3 y 4 cámaras con flujo de sangre',
    'Sangre fría vs sangre caliente: relación con el sistema circulatorio',
    'Datos fascinantes: ballena azul, colibrí, pulpo, jirafa y más',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre circulación abierta y cerrada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la circulación abierta, la sangre (hemolinfa) se vierte directamente en cavidades del cuerpo bañando los órganos, como ocurre en insectos y moluscos. En la circulación cerrada, la sangre viaja siempre dentro de vasos sanguíneos, lo que permite mayor presión y velocidad de distribución de oxígeno; es el sistema de vertebrados y lombrices de tierra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los mamíferos tienen un corazón de 4 cámaras y los peces solo de 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los peces poseen un corazón con 1 aurícula y 1 ventrículo que bombea sangre hacia las branquias y luego al cuerpo en un único circuito. Los mamíferos y las aves evolucionaron hacia 4 cámaras (2 aurículas + 2 ventrículos) para separar completamente la sangre oxigenada de la desoxigenada, lo que permite mantener una temperatura corporal constante (endotermia) con mayor eficiencia metabólica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la sangre fría y la sangre caliente en biología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los animales de sangre fría (ectotérmicos), como reptiles y anfibios, dependen del calor externo para regular su temperatura corporal. Los de sangre caliente (endotérmicos), como mamíferos y aves, generan su propio calor metabólicamente. Esta diferencia está ligada al tipo de sistema circulatorio: el doble circuito completo de 4 cámaras favorece la endotermia al asegurar que siempre llegue sangre muy oxigenada a los tejidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo late el corazón de un colibrí comparado con el humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El corazón de un colibrí puede latir entre 1.000 y 1.200 veces por minuto durante el vuelo, frente a los 60-100 latidos por minuto de una persona en reposo. Esta frecuencia cardíaca extrema es necesaria para abastecer de oxígeno los músculos alares que baten hasta 80 veces por segundo. En reposo, el colibrí puede entrar en torpor y bajar su frecuencia a menos de 50 latidos por minuto para ahorrar energía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los pulpos y calamares tienen corazón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los cefalópodos como el pulpo tienen tres corazones: uno sistémico que bombea sangre azul (basada en hemocianina con cobre, no hemoglobina con hierro) al cuerpo, y dos corazones branquiales que impulsan la sangre a través de cada branquia. Su sistema circulatorio es cerrado, lo que les confiere una eficiencia notable para moluscos y contribuye a su avanzada capacidad cognitiva.',
      },
    },
  ],
};
