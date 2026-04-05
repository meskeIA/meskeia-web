import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de un Smartphone - Componentes, Minerales, Coste Real | meskeIA',
  description: 'Descubre qué hay dentro de un smartphone: procesador, batería, cámaras, los 30+ minerales de 15 países, el desglose real de costes y la obsolescencia. Explicador visual interactivo.',
  keywords: 'smartphone componentes, minerales smartphone, cobalto congo, litio chile, coste fabricación móvil, obsolescencia programada, basura electrónica, derecho a reparar, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de un Smartphone - Componentes, Minerales y Coste Real',
    description: 'Qué hay dentro de tu móvil, de dónde vienen sus materiales, cuánto cuesta realmente fabricarlo y qué pasa cuando lo tiras.',
    url: 'https://meskeia.com/visualizador-anatomia-smartphone',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anatomía de un Smartphone - Componentes, Minerales y Coste Real',
    description: 'Procesador, batería, 30+ minerales de 15 países, márgenes de beneficio y obsolescencia: todo lo que esconde tu móvil.',
  },
  other: { 'application-name': 'Anatomía Smartphone meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de un Smartphone',
  description: 'Explicador visual interactivo sobre la anatomía de un smartphone: componentes internos (pantalla, procesador, batería, cámaras, antenas), minerales y países de origen (litio, cobalto, tierras raras), desglose real de costes de fabricación y el problema de la obsolescencia y los residuos electrónicos.',
  url: 'https://meskeia.com/visualizador-anatomia-smartphone/',
  category: 'EducationalApplication',
  features: [
    'Componentes internos interactivos: pantalla, SoC, RAM, batería, cámaras, antenas',
    'Mapa de minerales: 30+ minerales de 15+ países con cadenas de suministro',
    'Desglose de costes de un móvil de 1.000 €: componentes, ensamblaje, I+D, marketing, margen',
    'Datos de obsolescencia: vida media, residuos electrónicos, tasas de reciclaje',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
