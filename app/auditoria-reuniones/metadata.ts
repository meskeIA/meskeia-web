import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Reuniones - ¿Cuántas podrían ser un email? | meskeIA',
  description: 'Evalúa si tus reuniones aportan valor o te roban tiempo. Test interactivo de 10 preguntas sobre eficiencia y cultura de reuniones. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'auditoría reuniones, reuniones productivas, reunionitis, eficiencia reuniones, gestión del tiempo, podría ser un email, cultura reuniones, productividad laboral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Reuniones | meskeIA',
    description: '¿Cuántas de tus reuniones podrían ser un email? Test interactivo con diagnóstico visual y acciones concretas.',
    url: 'https://meskeia.com/auditoria-reuniones',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auditoría de Reuniones | meskeIA',
    description: '¿Tus reuniones aportan valor o te roban tiempo? Descúbrelo con este test gratuito.',
  },
  other: {
    'application-name': 'Auditoría de Reuniones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Reuniones',
  description: 'Herramienta interactiva de reflexión para evaluar la eficiencia y la cultura de reuniones en tu organización. 10 preguntas, diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/auditoria-reuniones/',
  features: [
    'Test de 10 preguntas sobre tus reuniones de trabajo',
    'Diagnóstico visual con mapa bidimensional',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tus reuniones',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
