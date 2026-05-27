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
