import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Luxómetro Online - Mide la Intensidad de Luz con tu Móvil o Celular | meskeIA',
  description: 'Mide la intensidad de luz en lux con tu móvil o celular usando el sensor del dispositivo. Ideal para fotógrafos: incluye recomendaciones de ISO, apertura y velocidad según la iluminación.',
  keywords: 'luxometro, luxometro celular, fotometro, medir luz, intensidad luminosa, lux, luxometro movil, fotografia, exposicion, iso, apertura, velocidad obturacion, iluminacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Luxómetro Online - Mide la Intensidad de Luz con tu Móvil o Celular',
    description: 'Mide la luz ambiente con tu móvil o celular. Recomendaciones fotográficas incluidas.',
    url: 'https://meskeia.com/luxometro/',
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
    title: 'Luxómetro Online - meskeIA',
    description: 'Mide la intensidad de luz con tu móvil o celular y obtén recomendaciones para fotografía.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Luxómetro meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Luxómetro / Fotómetro",
  description: "Mide la intensidad de luz en lux con tu dispositivo. Ideal para fotógrafos: incluye recomendaciones de ISO, apertura y velocidad según la iluminación.",
  url: "https://meskeia.com/luxometro/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un luxómetro y para qué sirve?',
      acceptedAnswer: { '@type': 'Answer', text: 'Un luxómetro es un instrumento que mide la iluminancia, es decir, la cantidad de luz que incide sobre una superficie, expresada en lux (lx). Se usa para evaluar si la iluminación de un espacio es adecuada para actividades como fotografía, lectura, trabajo de oficina o plantas de interior. En interiores se recomiendan entre 300 y 500 lux para trabajar cómodamente; en exteriores con sol directo se pueden superar los 100.000 lux.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un luxómetro online?',
      acceptedAnswer: { '@type': 'Answer', text: 'El luxómetro online utiliza el sensor de luz del propio dispositivo (cámara o sensor de luz ambiente) para estimar la iluminancia. El navegador accede a la cámara y analiza el brillo medio de los fotogramas para convertirlo en una estimación en lux. La precisión es orientativa y puede variar según el dispositivo, pero resulta suficiente para detectar cambios significativos de iluminación.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué valores de lux son normales en diferentes situaciones?',
      acceptedAnswer: { '@type': 'Answer', text: 'Los valores orientativos más habituales son: habitación poco iluminada 50-100 lux, oficina estándar 300-500 lux, estudio fotográfico 1.000-5.000 lux, día nublado en exterior 1.000-10.000 lux y sol directo más de 50.000-100.000 lux. Conocer el nivel de luz ayuda a ajustar la configuración de la cámara y a garantizar condiciones adecuadas de trabajo o estudio.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usan los lux para ajustar los parámetros de una cámara fotográfica?',
      acceptedAnswer: { '@type': 'Answer', text: 'Conociendo los lux ambientales puedes estimar la exposición adecuada. Con poca luz (menos de 200 lux) conviene subir el ISO (800-3200), abrir el diafragma (f/1,8-f/2,8) y reducir la velocidad de obturación. Con luz abundante (más de 10.000 lux) se puede usar ISO 100, diafragma cerrado (f/8-f/11) y velocidades rápidas (1/500-1/2000 s). La relación entre lux y EV (valor de exposición) permite calcular la configuración óptima.' },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable un luxómetro de móvil o celular frente a uno profesional?',
      acceptedAnswer: { '@type': 'Answer', text: 'Un luxómetro de móvil o celular ofrece mediciones orientativas, no de laboratorio. Los sensores de los smartphones no están calibrados para medición científica precisa, por lo que el margen de error puede ser del 20-40% respecto a un luxómetro profesional calibrado. Para usos cotidianos (fotografía amateur, revisión de iluminación de oficina o plantas) la precisión es más que suficiente; para mediciones normativas o industriales es preferible usar un fotómetro certificado.' },
    },
  ],
};
