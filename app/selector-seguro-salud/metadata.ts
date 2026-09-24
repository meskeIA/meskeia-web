import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { TEXTO_CARENCIAS, TEXTO_COPAGO, TEXTO_PRIMA_MEDIA } from './motor';

/** Las funciones reales de la app: alimentan la meta schema:WebApplication y el JSON-LD. */
const FUNCIONES = [
  'Test de 10 preguntas sobre uso médico, situación y presupuesto',
  'Orientación: sanidad pública, seguro complementario o seguro completo',
  'Detecta si ya tienes cobertura por tu empresa o por una mutualidad de funcionarios',
  'Con un presupuesto ajustado no recomienda el seguro completo y avisa de comprobar la prima',
  'Avisos de preexistencias, embarazo en curso y periodos de carencia',
  'Explica la puntuación con todo lo que suma y lo que resta',
  'Referencia de precio con fuente (UNESPA) en lugar de cifras sin origen',
  '100% en el navegador, sin registro ni instalación',
];

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
          'Test orientativo de 10 preguntas para saber si un seguro de salud privado tiene sentido según tu situación, uso médico habitual, espera para el especialista en tu zona y presupuesto. Incluye recomendación de cobertura y referencia de precio con fuente.',
        url: 'https://meskeia.com/selector-seguro-salud/',
        features: FUNCIONES,
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Seguro de Salud",
  description: "Test de 10 preguntas para saber si te conviene contratar un seguro de salud privado en España, qué cobertura necesitas y en qué situaciones tiene más sentido.",
  url: "https://meskeia.com/selector-seguro-salud/",
  category: 'FinanceApplication',
  features: FUNCIONES,
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
        text: 'Un seguro privado aporta más valor cuando las listas de espera en tu zona son largas para especialistas o pruebas diagnósticas, cuando tienes necesidades médicas frecuentes que la sanidad pública cubre con demora, o cuando valoras la libre elección de médico y la atención rápida. También puede compensar si trabajas por cuenta propia, porque una espera larga puede alargar una baja. Si ya tienes un seguro completo de empresa o una mutualidad de funcionarios, contratar otro rara vez tiene sentido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta un seguro de salud privado en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El precio de una póliza depende sobre todo de la edad, de la cobertura y de si tiene copago. Como referencia, ${TEXTO_PRIMA_MEDIA}. El copago abarata la prima; una póliza completa, sin copago y con hospitalización, queda por encima de una con copago. Para saber el tuyo, pide presupuesto con tus datos.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un seguro con copago y uno sin copago?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `En un seguro con copago pagas una cantidad por cada servicio médico, ${TEXTO_COPAGO}, lo que reduce la prima mensual. En un seguro sin copago no pagas nada en el momento de la visita, pero la prima mensual es más alta. El modelo con copago suele ser más económico si tus visitas son ocasionales; el sin copago compensa si acudes al médico con mucha frecuencia.`,
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
        text: `Antes de contratar, la aseguradora te presenta un cuestionario de salud, y tienes el deber de declarar en él todas las circunstancias que conozcas y que puedan influir en la valoración del riesgo (art. 10 de la Ley 50/1980 de Contrato de Seguro). La asistencia relacionada con enfermedades anteriores a la contratación suele quedar excluida de la cobertura (OCU) o encarecer la prima. Además, ${TEXTO_CARENCIAS}. Si en el cuestionario hubo reserva o inexactitud, la aseguradora puede rescindir el contrato en el plazo de un mes desde que lo conoce; si antes ocurre un siniestro, la prestación se reduce en proporción a la diferencia de prima, y si hubo dolo o culpa grave queda liberada del pago.`,
      },
    },
  ],
};
