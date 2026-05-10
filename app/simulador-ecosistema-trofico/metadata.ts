import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Ecosistema: Cadena Trófica | meskeIA',
  description: 'Simula el impacto de perturbaciones en un ecosistema. Observa cómo una sequía, una plaga o la caza excesiva desencadena cascadas tróficas en pradera, bosque, océano y sabana.',
  keywords: 'cadena trófica, niveles tróficos, regla del 10%, ecosistema, depredadores, herbívoros, productores, cascada trófica, especie clave, EBAU, Bachillerato, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Ecosistema: Cadena Trófica',
    description: 'Simula el impacto de perturbaciones en un ecosistema y observa cómo la energía fluye a través de los niveles tróficos con la regla del 10%.',
    url: 'https://meskeia.com/simulador-ecosistema-trofico',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Ecosistema: Cadena Trófica',
    description: 'Simula sequías, plagas y caza excesiva en ecosistemas reales. Observa las cascadas tróficas en acción.',
  },
  other: {
    'application-name': 'Simulador Cadena Trófica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Ecosistema: Cadena Trófica',
  description: 'Herramienta educativa interactiva que simula el impacto de perturbaciones ambientales en ecosistemas reales. Visualiza la pirámide trófica, la regla del 10% y las cascadas tróficas en pradera, bosque, océano y sabana.',
  url: 'https://meskeia.com/simulador-ecosistema-trofico/',
  category: 'EducationalApplication',
  keywords: [
    'cadena trófica',
    'niveles tróficos',
    'regla del 10%',
    'ecosistema',
    'cascada trófica',
    'especie clave',
    'EBAU biología',
    'Bachillerato',
  ],
  features: [
    '4 ecosistemas simulados: pradera, bosque templado, océano y sabana',
    '5 tipos de perturbaciones: sequía, caza excesiva, plaga, contaminación y equilibrio',
    'Pirámide trófica visual con 4 niveles y flujo de energía',
    'Barras animadas de población antes y después del evento',
    'Explicación dinámica de la cascada trófica generada',
    'Bloque educativo completo sobre cadenas tróficas y regla del 10%',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});
