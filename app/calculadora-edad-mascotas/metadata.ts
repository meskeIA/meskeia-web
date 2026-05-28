import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Edad de Mascotas - Perros y Gatos en Años Humanos | meskeIA',
  description: 'Calcula la edad de tu perro o gato en años humanos según su tamaño y raza. Fórmula científica actualizada, más precisa que la regla de los 7 años. Gratis.',
  keywords: 'calculadora edad perro, edad gato años humanos, años perro, conversión edad mascota, cuántos años tiene mi perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Edad de Mascotas - meskeIA',
    description: 'Calcula la edad de tu perro o gato en años humanos',
    url: 'https://meskeia.com/calculadora-edad-mascotas/',
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
    title: 'Calculadora de Edad de Mascotas - meskeIA',
    description: 'Calcula la edad de tu perro o gato en años humanos',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Edad Mascotas",
  description: "Calcula la edad de tu perro o gato en años humanos según su tamaño y raza. Fórmula científica actualizada, más precisa que la regla de los 7 años. Gratis.",
  url: "https://meskeia.com/calculadora-edad-mascotas/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos años humanos equivalen a 1 año de perro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la talla y la edad del animal. Según investigaciones publicadas en Cell Systems (2020) basadas en cambios epigenéticos del ADN, un perro de 1 año equivale aproximadamente a 31 años humanos, y uno de 2 años a unos 42. A partir de los 3 años, cada año canino suma entre 4 y 7 años humanos según el tamaño: los perros grandes envejecen más rápido que los pequeños.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es correcta la regla de multiplicar por 7 la edad del perro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla de los 7 años es una simplificación imprecisa. Los perros maduran muy rápido en sus primeros años (un perro de 1 año ya es sexualmente adulto) y luego su envejecimiento varía según el tamaño. Las fórmulas más recientes tienen en cuenta la raza y el peso del animal para dar una equivalencia más fiel a su estado biológico real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los gatos envejecen igual que los perros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Los gatos tienen una curva de envejecimiento propia: los 2 primeros años equivalen a unos 24 años humanos, y a partir de ahí cada año felino suma aproximadamente 4 años humanos. La mayoría de los gatos domésticos viven entre 12 y 18 años, lo que equivaldría a entre 64 y 88 años humanos según esta escala.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué edad se considera viejo un perro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se considera que un perro entra en la etapa senior a partir de los 7 años en razas grandes y gigantes, y a partir de los 8-10 años en razas pequeñas y medianas. En esta etapa suelen necesitar revisiones veterinarias más frecuentes, ajuste de dieta y menor intensidad en el ejercicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve saber la edad equivalente en humanos de mi mascota?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer la edad equivalente ayuda a entender mejor las necesidades de tu mascota en cada etapa de su vida: alimentación, nivel de actividad, frecuencia de visitas veterinarias y señales de envejecimiento a las que prestar atención. También facilita la comunicación con el veterinario al hablar de enfermedades asociadas a la edad.',
      },
    },
  ],
};
