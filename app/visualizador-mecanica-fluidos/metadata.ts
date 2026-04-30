import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mecánica de Fluidos: Reynolds, Magnus, Bernoulli y Mach — meskeIA',
  description: 'Visualizador interactivo de mecánica de fluidos. Número de Reynolds (laminar vs turbulento), efecto Magnus (curva de la pelota), el mito de Bernoulli en la aviación y los números de Mach y cavitación. Con animaciones SVG en tiempo real.',
  keywords: [
    'número de Reynolds laminar turbulento',
    'efecto Magnus pelota curva fútbol',
    'principio Bernoulli avión mito',
    'Kutta-Joukowski sustentación',
    'número de Mach velocidad sonido',
    'cavitación burbujas presión',
    'mecánica de fluidos física',
    'flujo laminar turbulento visualizador',
    'aerodinámica ala avión',
    'física fluidos interactiva',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Mecánica de Fluidos: Reynolds, Magnus, Bernoulli y Mach — meskeIA',
    description: 'Visualiza en tiempo real el número de Reynolds, el efecto Magnus en deportes, por qué el avión NO vuela solo por Bernoulli, y los fenómenos de Mach y cavitación. Animaciones SVG interactivas.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-mecanica-fluidos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mecánica de Fluidos: Reynolds, Magnus y el mito de Bernoulli',
    description: 'Por qué la pelota curva, por qué el avión vuela de verdad, y qué es el número de Reynolds. Visualizador interactivo.',
  },
  other: { 'application-name': 'Mecánica de Fluidos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mecánica de Fluidos: Reynolds, Magnus, Bernoulli y Mach',
  description: 'Visualizador interactivo de los grandes fenómenos de la mecánica de fluidos: número de Reynolds con animación laminar/turbulenta, efecto Magnus con cálculo de fuerza y trayectoria curva, el mito de Bernoulli en la aviación explicado con Kutta-Joukowski, y los números de Mach y cavitación.',
  url: 'https://meskeia.com/visualizador-mecanica-fluidos/',
  category: 'EducationalApplication',
  features: [
    'Número de Reynolds: fórmula Re = ρvL/μ con sliders de velocidad, longitud y viscosidad',
    'Animación SVG flujo laminar (azul, paralelo) vs turbulento (rojo, caótico)',
    'Zona de transición [2300-4000] con color naranja y texto dinámico',
    'Presets de fluidos: agua en tubería, miel, sangre en arteria',
    'Efecto Magnus: slider de rotación ω y velocidad v con trayectoria curva calculada',
    'Fuerza Magnus F = ρ·ω×v·r²·π con líneas de flujo y presión alta/baja',
    'Ejemplos deportivos: fútbol, tenis (topspin), béisbol (curveball)',
    'Bernoulli y el avión: perfil alar NACA simplificado con líneas de flujo',
    'Toggle Mito vs Realidad: Bernoulli solo vs Kutta-Joukowski completo',
    'Slider de ángulo de ataque 0°-20° con impacto en sustentación',
    'Número de Mach: M = v/c con regímenes subsónico, transónico, supersónico e hipersónico',
    'SVG de ondas de choque en régimen supersónico',
    'Cavitación: presión local vs presión de vapor con animación de burbujas',
    'Gratuito, sin registro, completamente en español',
  ],
});
