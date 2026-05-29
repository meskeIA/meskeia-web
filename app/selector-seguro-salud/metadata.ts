import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Salud — ¿Me conviene el privado? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene contratar un seguro de salud privado en España, qué cobertura necesitas y en qué situaciones tiene más sentido.',
  keywords: [
    'seguro de salud privado',
    'me conviene seguro privado',
    'seguro médico privado España',
    'selector seguro salud',
    'sanidad pública o privada',
    'cobertura seguro médico',
    'precio seguro salud España',
    'seguro dental privado',
    'cuándo contratar seguro médico',
    'mutua privada España',
  ],
  openGraph: {
    title: '¿Te conviene un seguro de salud privado? Test gratuito | meskeIA',
    description:
      'Descubre si el seguro médico privado tiene sentido para tu situación, qué cobertura necesitas y cuánto te costaría aproximadamente.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-seguro-salud/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Seguro médico privado o sanidad pública? Test | meskeIA',
    description:
      'Test de 10 preguntas para saber si un seguro de salud privado te aporta valor real según tu situación.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-seguro-salud/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Seguro de Salud',
        description:
          'Test orientativo de 10 preguntas para saber si un seguro de salud privado tiene sentido según tu situación, uso médico habitual, CCAA de residencia y presupuesto. Incluye recomendación de cobertura y coste orientativo.',
        url: 'https://meskeia.com/selector-seguro-salud/',
        features: [
          'Test de 10 preguntas sobre uso médico y situación',
          'Recomendación: sanidad pública, seguro complementario o seguro completo',
          'Cobertura recomendada según perfil',
          'Rango de precio orientativo en España',
          'Cuándo compensa y cuándo no',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Seguro de Salud",
  description: "Test de 10 preguntas para saber si te conviene contratar un seguro de salud privado en España, qué cobertura necesitas y en qué situaciones tiene más sentido.",
  url: "https://meskeia.com/selector-seguro-salud/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo merece la pena contratar un seguro de salud privado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un seguro privado aporta más valor cuando las listas de espera en tu comunidad autónoma son largas para especialistas o pruebas diagnósticas, cuando tienes necesidades médicas frecuentes que la sanidad pública cubre con demora, o cuando valoras la libre elección de médico y la atención rápida. También es útil si viajas con frecuencia o trabajas por cuenta propia sin acceso a mutua de empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta un seguro de salud privado en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio varía según la edad, la cobertura y la aseguradora. Para una persona adulta joven (25-35 años) sin preexistencias, un seguro de salud básico con copago puede costar entre 40 y 80 € al mes. Los seguros sin copago o con cobertura dental y hospitalización completa pueden superar los 120-150 € al mes. A partir de los 50 años, las primas aumentan de forma significativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un seguro con copago y uno sin copago?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un seguro con copago pagas una cantidad fija por cada visita al médico (generalmente entre 2 y 15 € por consulta), lo que reduce la prima mensual. En un seguro sin copago no pagas nada en el momento de la visita, pero la prima mensual es más alta. El modelo con copago suele ser más económico si tus visitas son ocasionales; el sin copago compensa si acudes al médico con mucha frecuencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la sanidad privada complementaria y en qué se diferencia del seguro completo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sanidad privada complementaria cubre servicios que la sanidad pública tarda en ofrecer (ciertos especialistas, pruebas de imagen, fisioterapia) manteniendo la pública como red principal. Un seguro completo, en cambio, está pensado para sustituir o reducir al mínimo el uso de la sanidad pública. El complementario es más económico y es la opción más habitual entre quienes quieren mejorar la atención sin renunciar a la cobertura pública.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los seguros de salud cubren enfermedades preexistentes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la aseguradora y del tipo de enfermedad. Las preexistencias declaradas en el momento de contratar pueden quedar excluidas de la cobertura o conllevar una sobretasa en la prima. Algunas aseguradoras aplican períodos de carencia (3-12 meses) antes de cubrir determinadas prestaciones. Es obligatorio declarar las enfermedades conocidas al contratar; no hacerlo puede dar lugar a la nulidad del contrato.',
      },
    },
  ],
};
