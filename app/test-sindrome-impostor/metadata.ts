import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Síndrome del Impostor - ¿Subestimas tu competencia real? | meskeIA',
  description: 'Descubre si el síndrome del impostor está afectando tu carrera. Test de 10 preguntas basado en la Escala de Clance adaptada. Evalúa autoexigencia y reconocimiento de logros. Gratuito y sin registro.',
  keywords: 'síndrome del impostor, test impostor, escala Clance, autoexigencia, inseguridad profesional, competencia profesional, logros, autoestima laboral, impostor syndrome, subestimar capacidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Síndrome del Impostor | meskeIA',
    description: '¿Subestimas tu competencia real? Test interactivo basado en la Escala de Clance.',
    url: 'https://meskeia.com/test-sindrome-impostor',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Síndrome del Impostor | meskeIA',
    description: '¿Sientes que no mereces tus logros? Descúbrelo con este test gratuito.',
  },
  other: {
    'application-name': 'Test de Síndrome del Impostor meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Síndrome del Impostor',
  description: 'Herramienta interactiva de reflexión para evaluar si el síndrome del impostor está afectando tu carrera profesional. Basado en la Escala de Clance adaptada. 10 preguntas, resultado visual con perfil y acciones concretas.',
  url: 'https://meskeia.com/test-sindrome-impostor/',
  features: [
    'Test de 10 preguntas sobre autoexigencia y reconocimiento',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en la Escala de Clance (Impostor Phenomenon)',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
