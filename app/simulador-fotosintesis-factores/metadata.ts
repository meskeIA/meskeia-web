import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Fotosíntesis: Factores Limitantes - Ley de Blackman | meskeIA',
  description:
    'Simula la fotosíntesis y descubre qué factor limita la tasa: luz, CO₂ o temperatura. Basado en la Ley de Blackman y funciones Michaelis-Menten. Ideal para Bachillerato y EBAU.',
  keywords:
    'fotosíntesis, factores limitantes, ley de Blackman, luz, CO2, temperatura, cloroplasto, EBAU, Bachillerato, biología, tasa fotosíntesis, Michaelis-Menten, simulador biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Fotosíntesis: Factores Limitantes | meskeIA',
    description:
      'Explora cómo la luz, el CO₂ y la temperatura determinan la tasa de fotosíntesis según la Ley de Blackman. Visualiza qué factor es el limitante en tiempo real.',
    url: 'https://meskeia.com/simulador-fotosintesis-factores',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Fotosíntesis: Factores Limitantes | meskeIA',
    description:
      'Descubre qué limita la fotosíntesis: luz, CO₂ o temperatura. Simulador interactivo basado en la Ley de Blackman para Bachillerato y EBAU.',
  },
  other: {
    'application-name': 'Simulador Fotosíntesis Factores meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Fotosíntesis: Factores Limitantes',
  description:
    'Simulador interactivo que modela la tasa de fotosíntesis según los tres factores limitantes principales: intensidad lumínica, concentración de CO₂ y temperatura. Basado en la Ley de Blackman y funciones de saturación Michaelis-Menten. Ideal para estudiantes de Biología de Bachillerato y preparación de EBAU.',
  url: 'https://meskeia.com/simulador-fotosintesis-factores/',
  category: 'EducationalApplication',
  keywords: [
    'fotosíntesis',
    'factores limitantes',
    'ley de Blackman',
    'luz',
    'CO2',
    'temperatura',
    'Bachillerato',
    'EBAU',
    'biología',
  ],
  features: [
    'Modelo matemático con funciones Michaelis-Menten para cada factor',
    'Identificación automática del factor limitante en tiempo real',
    'Animación de producción de O₂ proporcional a la tasa de fotosíntesis',
    'Visualización de barras de progreso por factor con resaltado del limitante',
    'Bloque educativo completo con tabla comparativa, FAQ y guía de experimentos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
