import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de encurtidos: vinagre, agua, sal y azúcar | meskeIA',
  description:
    'Calcula el vinagre, el agua, la sal y el azúcar para tu líquido de encurtido según el estilo (agridulce, ácido o dulce) y el volumen. Para encurtidos rápidos de nevera. Gratis y en español.',
  keywords:
    'calculadora encurtidos, liquido encurtido vinagre agua sal, receta encurtido rapido, pepinillos caseros, encurtir cebolla zanahoria, proporcion vinagre encurtido, encurtido nevera',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de encurtidos', description: 'Vinagre, agua, sal y azúcar para tu líquido de encurtido según el estilo y el volumen.', url: 'https://meskeia.com/calculadora-encurtidos', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Calculadora de encurtidos', description: 'El líquido de encurtido perfecto según el estilo y el volumen.' },
  other: { 'application-name': 'Calculadora de encurtidos meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-encurtidos/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de encurtidos',
  description:
    'Calcula las cantidades de vinagre, agua, sal y azúcar para el líquido de un encurtido rápido de nevera, según el estilo elegido (agridulce clásico, ácido o dulce) y el volumen total que necesites.',
  url: 'https://meskeia.com/calculadora-encurtidos/',
  features: [
    'Vinagre, agua, sal y azúcar según el estilo',
    'Estilos agridulce, ácido y dulce',
    'Ajustado al volumen total que necesites',
    'Para encurtidos rápidos de nevera',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué proporción de vinagre y agua lleva un encurtido?', acceptedAnswer: { '@type': 'Answer', text: 'El equilibrio clásico agridulce es a partes iguales de vinagre y agua, con sal y algo de azúcar. Si lo quieres más punzante, sube a dos partes de vinagre por una de agua. El vinagre debe tener al menos un 5% de acidez para que el encurtido se conserve bien en la nevera.' } },
    { '@type': 'Question', name: '¿Cuánto tarda en hacerse un encurtido rápido?', acceptedAnswer: { '@type': 'Answer', text: 'Un encurtido rápido de nevera empieza a estar bueno en pocas horas, pero gana mucho a partir de las 24 horas y alcanza su mejor sabor en 2 o 3 días. Las verduras finas (cebolla en juliana, pepino en rodajas) toman el sabor mucho antes que las piezas gruesas.' } },
    { '@type': 'Question', name: '¿Cuánto dura un encurtido casero?', acceptedAnswer: { '@type': 'Answer', text: 'Un encurtido rápido de nevera, en un tarro limpio y con la verdura cubierta por el líquido, suele aguantar varias semanas refrigerado. No es una conserva esterilizada de larga duración: para eso se necesita un proceso de envasado y baño maría específico.' } },
    { '@type': 'Question', name: '¿Qué verduras se pueden encurtir?', acceptedAnswer: { '@type': 'Answer', text: 'Casi cualquiera con buena textura: pepino, cebolla, zanahoria, coliflor, rábano, pimiento, judía verde o remolacha. Quedan mejor las que mantienen algo de crujiente. Conviene cortarlas en tamaños parecidos para que tomen el sabor de forma uniforme.' } },
    { '@type': 'Question', name: '¿Hace falta hervir el líquido del encurtido?', acceptedAnswer: { '@type': 'Answer', text: 'Para un encurtido rápido, calentar el líquido hasta que se disuelvan la sal y el azúcar y verterlo caliente sobre la verdura ayuda a que tome sabor antes y a ablandarla un poco. Si prefieres la verdura más crujiente, puedes usar el líquido frío, aunque tardará algo más en encurtirse.' } },
  ],
};
