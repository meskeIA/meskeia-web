import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Contador Manual Online - Tally Counter Digital Gratis | meskeIA',
  description: 'Contador manual digital gratuito desde el móvil (celular) o el ordenador. Cuenta personas, objetos, repeticiones de ejercicio o cualquier cosa con un clic. Múltiples contadores, sonido y vibración.',
  keywords: 'contador manual, tally counter, contador digital, contador de personas, contador de clicks, contador online, contador gratis, clicker counter, contador para celular, contador para móvil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Contador Manual Online - Tally Counter Digital',
    description: 'Contador manual digital gratuito. Cuenta personas, objetos, repeticiones o cualquier cosa.',
    url: 'https://meskeia.com/contador-manual/',
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
    title: 'Contador Manual Online - Tally Counter Digital',
    description: 'Contador manual digital gratuito. Cuenta personas, objetos, repeticiones o cualquier cosa.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Contador Manual (Tally Counter)",
  description: "Contador manual digital gratuito desde el móvil (celular) o el ordenador. Cuenta personas, objetos, repeticiones de ejercicio o cualquier cosa con un clic. Múltiples contadores, sonido y vibración.",
  url: "https://meskeia.com/contador-manual/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué se usa un contador manual digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un contador manual digital (o tally counter) sirve para contar cualquier cosa con un simple clic: personas que entran a un local, repeticiones de ejercicio en el gimnasio, asistentes a un evento, vueltas en una piscina, inventario de artículos o marcadores en partidas de juegos. Sustituye al contador mecánico de bolsillo y funciona sin instalar nada desde el móvil o celular y el ordenador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar varios contadores a la vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la herramienta permite gestionar múltiples contadores simultáneos, cada uno con su nombre y valor independiente. Esto es útil, por ejemplo, para contar entradas y salidas de un aforo al mismo tiempo, o para llevar el marcador de varios equipos en paralelo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El contador guarda mis datos si cierro el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los contadores se guardan localmente en el almacenamiento del navegador (localStorage), por lo que persisten si cierras y vuelves a abrir la pestaña en el mismo dispositivo. No se sincronizan entre dispositivos ni se envían a ningún servidor, por lo que tus recuentos son completamente privados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja tiene frente a un contador mecánico físico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El contador digital no requiere llevar un objeto físico encima, no se rompe ni se agota, permite múltiples contadores simultáneos, se puede reiniciar o ajustar al valor que quieras en cualquier momento y, en móviles, puede emitir vibración como confirmación táctil para no tener que mirar la pantalla al contar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Funciona en el móvil o celular para contar personas en aforos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la herramienta está optimizada para móviles y celulares con botones grandes fáciles de pulsar con el pulgar. Es habitual usarla en la puerta de establecimientos, eventos o clases para controlar el aforo en tiempo real. La confirmación por vibración permite contar sin mirar la pantalla y mantener la vista en las personas que pasan.',
      },
    },
  ],
};
