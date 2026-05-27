import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Dopamina - El Sistema de Recompensa del Cerebro | meskeIA',
  description: 'Cómo funciona la dopamina: el circuito de recompensa mesolímbico, el ciclo deseo-anticipación-recompensa, su papel en redes sociales y adicciones, y cómo modular el sistema de forma natural.',
  keywords: ['dopamina', 'sistema de recompensa', 'dopamina adiccion', 'dopamina redes sociales', 'circuito mesolimbico', 'neurotransmisor dopamina', 'dopamina motivacion', 'parkinson dopamina', 'dopamina habitos'],
  openGraph: {
    title: 'Dopamina - El Sistema de Recompensa | meskeIA',
    description: 'Cómo la dopamina controla la motivación, el placer y la conducta.',
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
  name: "Dopamina - El Sistema de Recompensa del Cerebro",
  description: "Cómo funciona la dopamina: el circuito de recompensa mesolímbico, el ciclo deseo-anticipación-recompensa, su papel en redes sociales y adicciones, y cómo modular el sistema de forma natural.",
  url: "https://meskeia.com/visualizador-dopamina/",
  category: 'EducationalApplication',
  features: [],
});
