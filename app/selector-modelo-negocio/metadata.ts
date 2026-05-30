import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Modelo de Negocio — ¿Tienda física, e-commerce o servicios? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué modelo de negocio se adapta mejor a tu perfil emprendedor: tienda física, e-commerce, servicios/consultoría, SaaS/producto digital o marketplace. Análisis sin marcas.',
  keywords: [
    'qué modelo de negocio elegir',
    'tienda física o e-commerce',
    'emprender en España',
    'negocio online o presencial',
    'SaaS o consultoría',
    'marketplace o tienda propia',
    'modelo de negocio escalable',
    'startup o negocio tradicional',
    'cómo emprender con poco capital',
    'qué negocio montar España',
  ],
  openGraph: {
    title: '¿Tienda física, e-commerce o servicios? Test de modelo de negocio | meskeIA',
    description:
      'Descubre qué modelo de negocio se adapta mejor a tus habilidades, capital y objetivos con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-modelo-negocio/',
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
    title: '¿Qué modelo de negocio te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir entre tienda física, e-commerce, servicios, SaaS o marketplace.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-modelo-negocio/' },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Modelo de Negocio',
        description:
          'Test orientativo para saber qué modelo de negocio (tienda física, e-commerce, servicios, SaaS/digital o marketplace) se adapta mejor al perfil emprendedor.',
        url: 'https://meskeia.com/selector-modelo-negocio/',
        features: [
          'Test de 10 preguntas sobre perfil emprendedor',
          '5 modelos: tienda física, e-commerce, servicios, SaaS, marketplace',
          'Análisis de capital, habilidades y escalabilidad',
          'Orientación sobre tiempo para primera venta',
          '100% en el navegador, gratuito, en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Modelo de Negocio",
  description: "Test de 10 preguntas para saber qué modelo de negocio se adapta mejor a tu perfil emprendedor: tienda física, e-commerce, servicios/consultoría, SaaS/producto digital o marketplace. Análisis sin marca",
  url: "https://meskeia.com/selector-modelo-negocio/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre e-commerce y marketplace?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un e-commerce propio (tienda online) tú controlas la marca, los precios y la relación con el cliente, pero debes generar tráfico desde cero. Un marketplace (como Amazon o Etsy) ya tiene audiencia y tráfico, pero cobras comisiones por venta (entre el 8 % y el 20 % según plataforma) y tienes menos control sobre la experiencia del comprador y los datos de cliente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué modelo de negocio es más fácil de empezar con poco capital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los servicios y la consultoría son los modelos con menor barrera de entrada: no requieren stock, logística ni desarrollo técnico. Con una web básica y una propuesta de valor clara puedes empezar a facturar en semanas. El e-commerce tiene costes de plataforma y marketing, y la tienda física implica alquiler, reformas y personal desde el primer día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un SaaS y para quién tiene sentido como modelo de negocio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SaaS (Software as a Service) es un producto digital que se vende por suscripción mensual o anual: el usuario paga por acceder al software, no por comprarlo. Tiene muy buena escalabilidad porque el mismo producto puede usarlo un número ilimitado de clientes sin coste marginal. Requiere habilidades técnicas para desarrollarlo o capital para contratar desarrollo, y suele tardar más tiempo en generar los primeros ingresos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber si mi idea de negocio es mejor como tienda física o online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tienda física tiene ventaja cuando el producto requiere experiencia sensorial (ropa, gastronomía, peluquería), cuando la clientela objetivo es local o cuando el servicio posventa necesita presencia. El e-commerce gana cuando el producto se puede describir bien con fotos y texto, el público es geográficamente disperso o los márgenes permiten absorber los costes de envío y devoluciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas preguntas tiene el test y qué resultado da?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 10 preguntas sobre tu perfil emprendedor: habilidades, capital disponible, tolerancia al riesgo, objetivos de escalabilidad y tipo de producto o servicio que quieres ofrecer. Al finalizar indica cuál de los cinco modelos (tienda física, e-commerce, servicios/consultoría, SaaS o marketplace) se adapta mejor a tu situación, con una explicación de los puntos fuertes y débiles para tu caso.',
      },
    },
  ],
};
