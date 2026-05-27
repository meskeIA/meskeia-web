import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Medicamentos para Perros y Gatos | meskeIA',
  description: 'Calcula la dosis de antiparasitarios y medicamentos comunes para tu mascota según su peso. Incluye frecuencia de desparasitación y recordatorios.',
  keywords: 'dosis medicamento perro, antiparasitario perro, desparasitar gato, pipeta perro, collar antiparasitario, dosis por peso mascota',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Medicamentos para Perros y Gatos',
    description: 'Calcula dosis de antiparasitarios y medicamentos según el peso de tu mascota',
    url: 'https://meskeia.com/orientador-medicamentos-mascotas/',
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
    title: 'Orientador Medicamentos para Mascotas',
    description: 'Dosificación segura de antiparasitarios y medicamentos veterinarios',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Medicamentos para Perros y Gatos',
  description: 'Calcula la dosis orientativa de antiparasitarios y medicamentos comunes para tu mascota según su peso. Incluye frecuencia de desparasitación y recordatorios.',
  url: 'https://meskeia.com/orientador-medicamentos-mascotas/',
  category: 'UtilityApplication',
  features: [
    'Dosificación orientativa por peso de perros y gatos',
    'Antiparasitarios internos y externos: pipetas, comprimidos, collares',
    'Frecuencia recomendada de desparasitación',
    'Solo orientativo — consultar siempre al veterinario',
    'Gratuito, en español, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia se debe desparasitar a un perro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pauta estándar para perros adultos es desparasitación interna (antiparasitario oral) cada 3 meses y desparasitación externa (pipeta, collar o spray) mensual o cada 3 meses según el producto. Los cachorros requieren una pauta más intensiva: cada 2 semanas hasta los 2 meses, luego mensual hasta los 6 meses. El veterinario puede ajustar la frecuencia según el estilo de vida y el riesgo de exposición.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la dosis de antiparasitario para perro por peso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dosis de la mayoría de antiparasitarios orales se calcula en mg por kg de peso corporal. Por ejemplo, el fenbendazol se administra a 25-50 mg/kg y el praziquantel a 5-10 mg/kg. Los productos comerciales (comprimidos, pipetas) están dosificados por rangos de peso (ej: "para perros de 10 a 20 kg"). Es importante ajustar siempre a la franja correcta y consultar al veterinario ante cualquier duda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la desparasitación interna y externa en mascotas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La desparasitación interna elimina parásitos intestinales (lombrices, tenias, giardia) mediante antiparasitarios orales (comprimidos, pasta, pipeta oral). La desparasitación externa protege contra pulgas, garrapatas, ácaros y mosquitos mediante productos de aplicación tópica (pipeta, collar, spray) o comprimidos sistémicos (como fluralaner o sarolaner). Ambas son necesarias y complementarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué antiparasitario es más seguro para gatos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los gatos son muy sensibles a ciertos antiparasitarios: la permetrina (presente en algunos productos para perros) es tóxica para ellos y puede ser mortal. Los productos específicos para gatos con selamectina, imidacloprid, fipronil o sarolaner felino son seguros si se usan en las dosis correctas. Nunca aplicar en un gato un producto etiquetado solo para perros. Consultar siempre al veterinario antes de usar un nuevo producto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo empezar a desparasitar a un cachorro o gatito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La desparasitación interna de cachorros debe comenzar a las 2 semanas de vida y repetirse cada 2 semanas hasta los 2 meses, luego mensual hasta los 6 meses. La desparasitación externa puede iniciarse desde las 8 semanas (según el producto). Los gatitos siguen una pauta similar. Es fundamental desparasitar también a la madre gestante o lactante según protocolo veterinario para cortar el ciclo de transmisión.',
      },
    },
  ],
};
