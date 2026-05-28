import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adaptación del Hogar para Mayores - Checklist y costes | meskeIA',
  description: 'Checklist interactivo de adaptaciones del hogar para mayores y personas con movilidad reducida. Costes orientativos, ítems con ayudas públicas y prioridades por estancia.',
  keywords: 'adaptacion hogar mayores, accesibilidad vivienda, barras apoyo bano, silla salvaescaleras, rampa acceso, ducha accesible, ayudas adaptacion hogar imserso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Adaptación del Hogar para Mayores | meskeIA',
    description: 'Checklist de adaptaciones del hogar: costes estimados, prioridades y ayudas públicas disponibles.',
    url: 'https://meskeia.com/adaptacion-hogar/',
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
    title: 'Adaptación del Hogar para Mayores | meskeIA',
    description: 'Checklist interactivo: adaptaciones accesibles, costes y ayudas públicas',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Adaptación del Hogar meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Adaptación del Hogar",
  description: "Checklist interactivo de adaptaciones del hogar para mayores y personas con movilidad reducida. Costes orientativos, ítems con ayudas públicas y prioridades por estancia.",
  url: "https://meskeia.com/adaptacion-hogar/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta adaptar una casa para una persona mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste varía mucho según las intervenciones. Las adaptaciones básicas del baño (barras de apoyo, asiento de ducha, antideslizante) rondan 200–600 €. Una ducha a ras de suelo cuesta entre 1.000 y 3.000 €. Una silla salvaescaleras puede oscilar entre 2.000 y 6.000 €, y una plataforma elevadora entre 5.000 y 15.000 €. La suma total de una adaptación integral del hogar puede superar los 20.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay ayudas públicas para adaptar el hogar de una persona mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El IMSERSO y las comunidades autónomas ofrecen subvenciones para adaptaciones de accesibilidad. También existen ayudas de los ayuntamientos a través del Plan Estatal de Vivienda y deducciones en el IRPF por obras de mejora de accesibilidad. Las personas con grado de dependencia reconocido pueden acceder a prestaciones del SAAD para financiar parcialmente estas adaptaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué adaptaciones del hogar son prioritarias para prevenir caídas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las caídas ocurren con más frecuencia en el baño y en las escaleras. Las adaptaciones más urgentes son: instalar barras de apoyo junto al inodoro y en la ducha/bañera, colocar suelo antideslizante, sustituir la bañera por ducha accesible y mejorar la iluminación en pasillos y escaleras. Retirar alfombras sueltas y cables en el suelo también reduce significativamente el riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una silla salvaescaleras y una plataforma elevadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La silla salvaescaleras se instala sobre la escalera existente y la persona se sienta en ella para desplazarse entre plantas; es más económica (2.000–6.000 €) y no requiere obra. La plataforma elevadora (o elevador vertical) funciona como un pequeño ascensor interior y permite trasladar también sillas de ruedas; tiene mayor coste (5.000–15.000 €) y puede precisar obra civil. La elección depende del nivel de movilidad de la persona y del tipo de escalera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se necesita licencia de obras para adaptar el hogar de un mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las obras menores de accesibilidad (barras, antideslizantes, cambia de bañera a ducha) generalmente requieren solo comunicación previa al ayuntamiento. Las intervenciones estructurales o la instalación de ascensores interiores pueden requerir licencia de obras. En comunidades de propietarios, cualquier modificación de elementos comunes (portal, escalera) necesita aprobación de la comunidad, aunque la Ley de Propiedad Horizontal facilita estas obras de accesibilidad.',
      },
    },
  ],
};
