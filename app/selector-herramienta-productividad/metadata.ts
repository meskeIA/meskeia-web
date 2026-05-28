import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Método de Productividad — ¿GTD, Pomodoro, Kanban o Timeboxing? | meskeIA',
  description: 'Test de 10 preguntas para saber qué método de productividad se adapta mejor a tu forma de trabajar: GTD, Pomodoro, Kanban, Timeboxing o Inbox Zero. Análisis según tipo de trabajo, distracciones y objetivos.',
  keywords: ['qué método productividad elegir', 'GTD o Pomodoro', 'Kanban personal', 'timeboxing vs GTD', 'cómo ser más productivo', 'método trabajo productivo', 'gestión del tiempo España', 'técnica Pomodoro productividad', 'sistema personal de productividad', 'inbox zero vs GTD'],
  openGraph: {
    title: '¿GTD, Pomodoro o Kanban? Test de productividad | meskeIA',
    description: 'Descubre qué método de productividad se adapta mejor a tu tipo de trabajo y estilo personal.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-herramienta-productividad/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué método de productividad te conviene? | meskeIA',
    description: 'Test de 10 preguntas para elegir entre GTD, Pomodoro, Kanban, Timeboxing o Inbox Zero.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-herramienta-productividad/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Método de Productividad',
      description: 'Test orientativo para saber qué método de productividad (GTD, Pomodoro, Kanban, Timeboxing o Inbox Zero) se adapta mejor al tipo de trabajo y estilo personal.',
      url: 'https://meskeia.com/selector-herramienta-productividad/',
      features: [
        'Test de 10 preguntas sobre estilo de trabajo',
        '5 métodos: GTD, Pomodoro, Kanban, Timeboxing, Inbox Zero',
        'Análisis de distracciones, tipo de tareas y contexto',
        'Guía de implementación básica por método',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Método de Productividad",
  description: "Test de 10 preguntas para saber qué método de productividad se adapta mejor a tu forma de trabajar: GTD, Pomodoro, Kanban, Timeboxing o Inbox Zero. Análisis según tipo de trabajo, distracciones y obje",
  url: "https://meskeia.com/selector-herramienta-productividad/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué método de productividad es mejor, GTD o Pomodoro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un método universalmente mejor: depende de tu tipo de trabajo y estilo personal. GTD (Getting Things Done) de David Allen es ideal si manejas muchas tareas dispersas y necesitas un sistema de captura y organización. Pomodoro funciona mejor para personas que necesitan estructura temporal y luchan contra las distracciones. Lo más efectivo es probar ambos durante una semana y evaluar cuál se sostiene sin esfuerzo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el método Kanban y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kanban es un sistema visual de gestión de tareas basado en columnas (típicamente "Por hacer", "En curso", "Hecho"). Fue desarrollado por Toyota para producción industrial y adaptado al trabajo del conocimiento. Es especialmente útil para equipos o personas con flujo de trabajo continuo y variable. A diferencia de Pomodoro, no impone intervalos de tiempo, sino que limita el trabajo en curso para evitar la multitarea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué método de productividad se adapta a mí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores clave son: el tipo de tareas que realizas (creativas, operativas, reactivas), cuántas interrupciones recibes al día, si trabajas solo o en equipo y si tus objetivos son a corto o largo plazo. Un test orientativo de 10 preguntas sobre estas dimensiones puede señalarte el método más alineado con tu perfil antes de invertir tiempo en aprenderlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es Timeboxing y en qué se diferencia del Pomodoro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Timeboxing es una técnica que asigna un bloque de tiempo fijo a cada tarea específica en la agenda. A diferencia del Pomodoro, los bloques no tienen una duración estándar (25 min) sino que se adaptan a la tarea. Es más flexible y orientado a planificación diaria/semanal. Figuras como Elon Musk y Bill Gates son conocidos usuarios de timeboxing para gestionar agendas muy fragmentadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos métodos de productividad principales existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cinco métodos más consolidados con evidencia de uso amplio son GTD (Getting Things Done), Pomodoro, Kanban, Timeboxing e Inbox Zero. Existen decenas de variantes y enfoques adicionales (Deep Work, Eat the Frog, Ivy Lee…), pero estos cinco cubren la mayor parte de los perfiles de trabajo. La mayoría de sistemas más complejos son combinaciones o adaptaciones de estos fundamentos.',
      },
    },
  ],
};
