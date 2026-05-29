import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Dependencia de Clientes - ¿Tu negocio depende de pocos clientes? | meskeIA',
  description: 'Descubre si tu negocio tiene una dependencia peligrosa de pocos clientes. Test de 10 preguntas sobre concentración de riesgo y diversificación. Diagnóstico visual con perfil y acciones. Gratuito.',
  keywords: 'dependencia clientes, concentración riesgo, diversificación clientes, cartera clientes, cliente principal, riesgo negocio, freelance clientes, autónomo dependencia, gestión cartera, riesgo concentración',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Dependencia de Clientes | meskeIA',
    description: '¿Tu negocio depende demasiado de pocos clientes? Test interactivo de concentración de riesgo.',
    url: 'https://meskeia.com/mapa-dependencia-clientes/',
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
    title: 'Mapa de Dependencia de Clientes | meskeIA',
    description: '¿Tu negocio depende de pocos clientes? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Mapa de Dependencia de Clientes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Dependencia de Clientes',
  description: 'Herramienta interactiva de reflexión para evaluar si tu negocio o actividad profesional depende demasiado de pocos clientes. Análisis de concentración de riesgo y capacidad de diversificación.',
  url: 'https://meskeia.com/mapa-dependencia-clientes/',
  features: [
    'Test de 10 preguntas sobre tu cartera de clientes',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en análisis de concentración de riesgo empresarial',
    'Acciones concretas según tu resultado',
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
      name: '¿Cuándo se considera que un negocio tiene demasiada dependencia de un solo cliente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una regla práctica habitual en gestión empresarial es que ningún cliente debería representar más del 20-25% de la facturación total. Cuando un solo cliente supera ese umbral, cualquier cambio en su situación (reducción de presupuesto, cambio de proveedor, cierre) puede comprometer seriamente la viabilidad del negocio. En el ámbito del trabajo autónomo o freelance, la dependencia de un único cliente se asemeja a una relación laboral encubierta, con implicaciones legales y de estabilidad de ingresos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo reducir la dependencia de mis principales clientes sin perder facturación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diversificación de cartera de clientes es un proceso gradual. Estrategias habituales incluyen dedicar un porcentaje fijo del tiempo a prospección de nuevos clientes (aunque el negocio vaya bien), desarrollar servicios o productos de menor importe accesibles a más perfiles, y explorar sectores o geografías distintos a los habituales. El objetivo no es reducir el volumen de un cliente principal, sino crecer en otros de forma que su peso relativo disminuya.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil analizar la dependencia de clientes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente relevante para profesionales autónomos, freelancers, pequeñas agencias, consultoras y pymes cuyos ingresos dependen de una cartera limitada de clientes. También resulta útil para emprendedores en fase temprana que han captado a sus primeros clientes pero aún no han diversificado. Analizar la concentración de clientes es un ejercicio de gestión del riesgo que conviene revisar al menos una vez al año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué riesgos concretos genera depender de pocos clientes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales riesgos son la inestabilidad de ingresos ante la pérdida de un cliente, la presión a aceptar condiciones desfavorables (precios bajos, plazos de pago largos, cambios de alcance) para no perder esa relación, y la dificultad para invertir en crecimiento propio por falta de liquidez predecible. En contratos con un único cliente de gran tamaño, también puede surgir el riesgo de dependencia operativa: adaptar herramientas, procesos y equipo a ese cliente concreto, lo que dificulta captar nuevos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el índice de concentración HHI y cómo se aplica a una cartera de clientes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Índice Herfindahl-Hirschman (HHI) es una medida de concentración de mercado utilizada en economía y regulación antimonopolio. Aplicado a una cartera de clientes, se calcula sumando el cuadrado del porcentaje de facturación de cada cliente. Un valor cercano a 10.000 indica máxima concentración (un único cliente); valores por debajo de 1.500 se consideran generalmente una cartera diversificada. Es un indicador más preciso que simplemente observar el porcentaje del cliente principal.',
      },
    },
  ],
};
