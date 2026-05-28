import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Dependencia Tecnológica - ¿Podrías trabajar sin IA? | meskeIA',
  description: 'Evalúa tu autonomía real frente a la tecnología y tu capacidad de adaptarte cuando las herramientas cambian. Test de 10 preguntas sobre dependencia digital e independencia profesional. Gratuito y sin registro.',
  keywords: 'dependencia tecnológica, autonomía digital, trabajar sin IA, independencia profesional, habilidades sin tecnología, resiliencia digital, adaptabilidad tecnológica, deskilling',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Dependencia Tecnológica | meskeIA',
    description: '¿Podrías hacer tu trabajo si mañana no tuvieras IA? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/test-dependencia-tecnologica/',
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
    title: 'Test de Dependencia Tecnológica | meskeIA',
    description: '¿Cuánto depende tu trabajo de la tecnología? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Dependencia Tecnológica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Dependencia Tecnológica',
  description: 'Herramienta interactiva de reflexión sobre dependencia digital. 10 preguntas para evaluar tu autonomía profesional real y tu capacidad de adaptarte cuando las herramientas cambian o fallan.',
  url: 'https://meskeia.com/test-dependencia-tecnologica/',
  features: [
    'Test de 10 preguntas sobre tu relación con la tecnología',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa autonomía real y adaptabilidad tecnológica',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para reducir dependencia sin perder productividad',
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
      name: '¿Qué es la dependencia tecnológica en el trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dependencia tecnológica profesional ocurre cuando la capacidad de hacer un trabajo disminuye significativamente si una herramienta deja de estar disponible. No es malo usar tecnología de forma intensiva, sino no saber trabajar sin ella. El riesgo real aparece cuando las herramientas fallan, cambian de modelo de negocio, quedan fuera de presupuesto o son sustituidas por alternativas incompatibles con los flujos que has construido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber si soy demasiado dependiente de la IA para trabajar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunos indicadores son: no poder completar una tarea sin la herramienta aunque tengas los conocimientos base, no recordar cómo hacías algo antes de adoptarla, o sentir bloqueo real cuando hay una interrupción del servicio. Este test evalúa dos dimensiones: qué tan autónomo eres si la tecnología falla, y qué tan bien te adaptas cuando cambia o desaparece una herramienta concreta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este test de dependencia tecnológica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para profesionales que usan activamente IA, software especializado o plataformas digitales en su trabajo: freelances, gestores de proyectos, analistas, diseñadores, programadores o cualquier perfil de conocimiento. Es especialmente útil si has incorporado herramientas de IA en los últimos dos años y quieres saber cuánto de tu capacidad profesional depende ahora de que esas herramientas sigan funcionando.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Reducir la dependencia tecnológica significa usar menos herramientas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No necesariamente. La autonomía tecnológica no significa renunciar a la productividad que dan las herramientas; significa mantener las habilidades de respaldo que te permiten funcionar si algo cambia. La estrategia es seguir usando lo que te hace más eficiente, pero también practicar periódicamente las habilidades base, diversificar herramientas cuando sea posible y documentar procesos clave sin depender de una plataforma específica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre dependencia tecnológica y uso intensivo de tecnología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El uso intensivo es eficiencia; la dependencia es vulnerabilidad. Usar la IA para redactar borradores más rápido es uso intensivo. No poder estructurar un argumento sin que la IA lo haga por ti es dependencia. La diferencia está en si las habilidades propias se mantienen o si se han atrofiado por delegación sistemática. Este test ayuda a identificar en qué tareas concretas hay riesgo de atrofia.',
      },
    },
  ],
};
