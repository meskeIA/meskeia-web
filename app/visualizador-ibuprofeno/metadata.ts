import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ibuprofeno: Cómo Funciona | meskeIA',
  description: 'El ibuprofeno inhibe reversiblemente COX-1 y COX-2 bloqueando prostaglandinas inflamatorias. Visualiza por qué es mejor para la inflamación y sus riesgos en estómago, riñón y corazón.',
  keywords: ['ibuprofeno como funciona', 'ibuprofeno mecanismo', 'ibuprofeno COX', 'ibuprofeno estomago', 'ibuprofeno riñon', 'ibuprofeno inflamacion', 'ibuprofeno embarazo', 'ibuprofeno vs paracetamol'],
  openGraph: {
    title: 'Ibuprofeno: El Antiinflamatorio que Bloquea las COX',
    description: 'Por qué es mejor para la inflamación y qué paga en estómago, riñón y corazón.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Ibuprofeno: Inhibidor COX con Efecto Antiinflamatorio",
  description: "El ibuprofeno inhibe reversiblemente COX-1 y COX-2 bloqueando prostaglandinas inflamatorias. Visualiza por qué es mejor para la inflamación y sus riesgos en estómago, riñón y corazón.",
  url: "https://meskeia.com/visualizador-ibuprofeno/",
  category: 'EducationalApplication',
  features: [],
});
