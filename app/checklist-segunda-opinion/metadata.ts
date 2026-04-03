import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist de Segunda Opinión - ¿Has buscado razones para NO hacerlo? | meskeIA',
  description: 'Antes de decidir: ¿has buscado activamente razones para NO hacerlo? Test de 10 preguntas sobre certeza y cuestionamiento basado en el principio de red team. Gratuito y sin registro.',
  keywords: 'segunda opinión, red team, abogado del diablo, cuestionar decisiones, certeza, pensamiento crítico, contraargumentos, decisiones mejores, sesgo confirmación, adversario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist de Segunda Opinión | meskeIA',
    description: '¿Has buscado razones para NO hacerlo? Test basado en el principio de red team.',
    url: 'https://meskeia.com/checklist-segunda-opinion',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist de Segunda Opinión | meskeIA',
    description: '¿Cuestionas tus propias decisiones antes de actuar? Descúbrelo gratis.',
  },
  other: {
    'application-name': 'Checklist de Segunda Opinión meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist de Segunda Opinión',
  description: 'Herramienta interactiva de reflexión para evaluar si cuestionas suficientemente tus decisiones antes de actuar. Basado en el principio de red team y abogado del diablo.',
  url: 'https://meskeia.com/checklist-segunda-opinion/',
  features: [
    'Test de 10 preguntas sobre certeza y cuestionamiento',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el principio de red team (adversario)',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
