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
