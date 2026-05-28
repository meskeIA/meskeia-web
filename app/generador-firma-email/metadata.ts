import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Firmas de Email - HTML para Gmail y Outlook | meskeIA',
  description: 'Crea firmas de email profesionales en HTML. Compatible con Gmail, Outlook, Apple Mail. Múltiples plantillas, redes sociales y vista previa en tiempo real.',
  keywords: 'firma email, generador firma, html, gmail, outlook, profesional, plantilla, redes sociales, email signature',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Firmas de Email Profesionales',
    description: 'Crea firmas HTML para Gmail, Outlook y más',
    url: 'https://meskeia.com/generador-firma-email/',
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
    title: 'Generador de Firmas de Email',
    description: 'Firmas profesionales en HTML para cualquier cliente de correo',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Firmas Email",
  description: "Crea firmas de email profesionales en HTML. Compatible con Gmail, Outlook, Apple Mail. Múltiples plantillas, redes sociales y vista previa en tiempo real.",
  url: "https://meskeia.com/generador-firma-email/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo añado una firma HTML en Gmail?',
      acceptedAnswer: { '@type': 'Answer', text: 'En Gmail, ve a Configuración → Ver toda la configuración → General → Firma. Crea una nueva firma y pega el HTML generado directamente. Gmail respeta el formato HTML básico (colores, fuentes, imágenes con URL pública) aunque puede simplificar algunos estilos avanzados.' },
    },
    {
      '@type': 'Question',
      name: '¿Es compatible con Outlook y Apple Mail?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí. Las plantillas están diseñadas para funcionar con Gmail, Outlook (versión web y escritorio), Apple Mail y otros clientes de correo habituales. Outlook tiene algunas limitaciones con CSS avanzado, por lo que las plantillas usan atributos HTML inline para máxima compatibilidad.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué información debería incluir en una firma de email profesional?',
      acceptedAnswer: { '@type': 'Answer', text: 'Una firma profesional efectiva incluye nombre completo, cargo, empresa, teléfono de contacto y enlace a LinkedIn o web. Opcionalmente, un logotipo o foto. Es recomendable mantenerla concisa: entre 4 y 6 líneas de texto más los iconos de redes sociales.' },
    },
    {
      '@type': 'Question',
      name: '¿Puedo añadir mi foto o el logo de mi empresa?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí, introduciendo la URL pública de la imagen (alojada en tu web, Google Drive con enlace público o un servicio de hosting de imágenes). Es importante que la imagen esté disponible en internet, ya que los clientes de correo cargan las imágenes desde la URL original.' },
    },
    {
      '@type': 'Question',
      name: '¿La firma generada se guarda en algún servidor?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. El generador funciona completamente en el navegador: los datos introducidos (nombre, cargo, teléfono, etc.) no se envían a ningún servidor ni se almacenan. La privacidad de tus datos personales y profesionales está garantizada.' },
    },
  ],
};
