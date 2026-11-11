import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { rangoDe, RANGO_TOTAL } from './catalogo';

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
  features: [
    'Lista de 23 adaptaciones del hogar en 6 estancias: baño, dormitorio, cocina, accesos, escaleras y seguridad',
    'Coste orientativo mínimo y máximo de cada adaptación',
    'Suma en tiempo real del coste total del plan',
    'Prioridad de cada adaptación: prioritaria, recomendada u opcional',
    'Recuento de adaptaciones prioritarias y de las que pueden tener ayudas públicas',
    'Detalle de las adaptaciones elegidas con su coste',
  ],
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
        text: `El coste varía mucho según las intervenciones. Las adaptaciones básicas del baño (barras de apoyo, asiento de ducha y suelo antideslizante) suman ${rangoDe(['barras_apoyo', 'silla_ducha', 'suelo_bano'])}. Una ducha accesible sin barreras cuesta ${rangoDe(['ducha_accesible'])}. Una silla salvaescaleras, ${rangoDe(['silla_salvaescaleras'])}, y una plataforma elevadora, ${rangoDe(['plataforma_elevadora'])}. Las 23 adaptaciones de la lista juntas suman ${RANGO_TOTAL}. Son rangos orientativos: el precio real depende de la zona, las calidades y la mano de obra.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay ayudas públicas para adaptar el hogar de una persona mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El Plan Estatal de Vivienda 2026-2030 subvenciona obras de accesibilidad en edificios y viviendas sin exigir discapacidad ni dependencia (con ellas, o si reside una persona mayor, la ayuda puede ser mayor); lo convocan las comunidades autónomas. Las personas con grado de dependencia reconocido pueden pedir además las ayudas autonómicas para adaptaciones del hogar de la Ley de Dependencia, que son subvenciones. Muchos ayuntamientos tienen programas propios, y algunas comunidades dan deducciones en el IRPF por obras de accesibilidad.',
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
        text: `La silla salvaescaleras se instala sobre la escalera existente y la persona se sienta en ella para desplazarse entre plantas; es más económica (${rangoDe(['silla_salvaescaleras'])}) y no requiere obra. La plataforma elevadora (o elevador vertical) funciona como un pequeño ascensor interior y permite trasladar también sillas de ruedas; tiene mayor coste (${rangoDe(['plataforma_elevadora'])}) y puede precisar obra civil. La elección depende del nivel de movilidad de la persona y del tipo de escalera.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Se necesita licencia de obras para adaptar el hogar de un mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las obras menores de accesibilidad (barras, antideslizantes, cambio de bañera a ducha) generalmente requieren solo comunicación previa al ayuntamiento. Las intervenciones estructurales o la instalación de ascensores interiores pueden requerir licencia de obras. En comunidades de propietarios, cualquier modificación de elementos comunes (portal, escalera) necesita aprobación de la comunidad, aunque la Ley de Propiedad Horizontal facilita estas obras de accesibilidad.',
      },
    },
  ],
};
