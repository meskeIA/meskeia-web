import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Nombres para Empresa - Ideas Creativas | meskeIA',
  description: 'Genera nombres creativos para tu empresa, startup o marca. Por sector, estilo y longitud. Verifica disponibilidad de dominio .com y .es al instante.',
  keywords: 'nombres empresa, generador nombres, nombre startup, branding, marca, dominio disponible, nombre negocio, ideas nombres',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Nombres para Empresa | meskeIA',
    description: 'Encuentra el nombre perfecto para tu empresa. Genera ideas creativas y verifica dominios al instante.',
    url: 'https://meskeia.com/generador-nombres-empresa/',
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
    title: 'Generador de Nombres para Empresa | meskeIA',
    description: 'Herramienta gratuita para generar nombres creativos de empresa y verificar dominios.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Nombres",
  description: "Genera nombres creativos para tu empresa, startup o marca. Por sector, estilo y longitud. Verifica disponibilidad de dominio .com y .es al instante.",
  url: "https://meskeia.com/generador-nombres-empresa/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo elegir un buen nombre para una empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un buen nombre de empresa debe ser corto (1-2 palabras), fácil de pronunciar y recordar. Conviene verificar que el dominio .com o .es esté disponible y que no exista una marca registrada similar. Los nombres con significado relacionado con el sector o con raíces latinas suelen funcionar bien en mercados hispanohablantes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué estilos de nombre puedo generar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta permite generar nombres por estilo: descriptivo (refleja lo que hace la empresa), abstracto (inventado o evocador), portmanteau (fusión de palabras), acrónimo y con sufijos tecnológicos como -ly, -io o -hub. Cada estilo tiene ventajas distintas según el tipo de negocio y el público objetivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si el dominio de mi nombre está libre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta genera un enlace directo a la consulta del dominio en registradores como Namecheap o GoDaddy para cada nombre sugerido. Así puedes verificar la disponibilidad de .com y .es en segundos sin salir de la página.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo generar nombres para cualquier sector de negocio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Puedes filtrar por sector (tecnología, salud, alimentación, moda, servicios profesionales, etc.) y por longitud preferida del nombre. El generador adapta el vocabulario, los prefijos y los sufijos al sector seleccionado para ofrecer sugerencias más relevantes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito registrar el nombre de empresa antes de usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, para operar legalmente como sociedad (SL, SA) debes registrar la denominación social en el Registro Mercantil Central. Además, si quieres protegerla como marca, debes registrarla en la Oficina Española de Patentes y Marcas (OEPM). Verificar la disponibilidad en ambos registros antes de invertir en branding es fundamental.',
      },
    },
  ],
};
