import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Gas Ideal y Ciclos Termodinámicos | meskeIA',
  description:
    'Simula la ley del gas ideal PV=nRT, los procesos termodinámicos (isotermo, isobárico, adiabático) y los ciclos de Carnot, Otto, Diesel y Stirling. Diagramas PV interactivos.',
  keywords:
    'gas ideal, PV=nRT, ciclos termodinámicos, Carnot, Otto, Diesel, Stirling, diagrama PV, termodinámica, física bachillerato, eficiencia ciclo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gas-ideal/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Gas Ideal y Ciclos Termodinámicos | meskeIA',
    description:
      'Ley de gases, procesos termodinámicos y ciclos de Carnot, Otto, Diesel y Stirling con diagramas PV interactivos',
    url: 'https://meskeia.com/simulador-gas-ideal/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Gas Ideal y Termodinámica | meskeIA',
    description: 'Aprende termodinámica con diagramas PV interactivos',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Gas Ideal y Ciclos Termodinámicos',
  description:
    'Simulador interactivo del gas ideal y la termodinámica. Calcula PV=nRT, simula procesos (isotermo, isobárico, isocórico, adiabático) y compara los ciclos de Carnot, Otto, Diesel y Stirling con sus diagramas PV.',
  url: 'https://meskeia.com/simulador-gas-ideal/',
  category: 'EducationalApplication',
  features: [
    'Ley de gas ideal PV=nRT con cálculo de cualquier variable',
    'Visualización de moléculas con velocidad proporcional a T',
    'Procesos: isotermo, isobárico, isocórico, adiabático',
    'Diagramas PV interactivos con curvas reales',
    'Ciclos de Carnot, Otto, Diesel y Stirling',
    'Cálculo de eficiencia, trabajo y calor intercambiado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['gas ideal', 'termodinámica', 'PV=nRT', 'Carnot', 'física bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la ley del gas ideal PV=nRT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley del gas ideal PV=nRT relaciona la presión (P), el volumen (V), el número de moles (n), la constante de los gases (R = 8,314 J/mol·K) y la temperatura absoluta (T en kelvin). Describe el comportamiento de un gas hipotético cuyos átomos no interactúan entre sí ni tienen volumen propio. Es una buena aproximación para gases reales a presiones bajas y temperaturas altas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un proceso isotermo, isobárico e isocórico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un proceso isotermo la temperatura permanece constante (PV = cte); en un proceso isobárico es la presión la que no varía (V/T = cte); y en un proceso isocórico (o isovolumérico) el volumen no cambia (P/T = cte). El proceso adiabático es aquel en que no hay intercambio de calor con el exterior, lo que implica una relación más compleja entre P, V y T que depende del índice adiabático del gas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la eficiencia del ciclo de Carnot y por qué es el máximo teórico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La eficiencia del ciclo de Carnot es η = 1 − T_fría/T_caliente, donde las temperaturas se expresan en kelvin. Representa el límite máximo de eficiencia que puede alcanzar cualquier máquina térmica que opere entre dos focos a esas temperaturas, sin importar el combustible o el diseño. Ninguna máquina real puede superar este límite porque involucraría violar el segundo principio de la termodinámica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el ciclo Otto del ciclo Diesel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo Otto (motor de gasolina) añade calor a volumen constante (combustión rápida y explosiva), mientras que el ciclo Diesel añade calor a presión constante (combustión gradual con inyección de combustible). El Diesel tiene mayor eficiencia teórica a igual relación de compresión, pero opera a relaciones de compresión más altas, lo que lo hace más eficiente en la práctica para vehículos pesados y transporte de larga distancia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo deja de ser válida la aproximación del gas ideal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley del gas ideal falla cuando las moléculas están muy próximas entre sí: a presiones muy altas o temperaturas muy bajas, las fuerzas intermoleculares y el volumen propio de las moléculas dejan de ser despreciables. En esas condiciones se utilizan ecuaciones de estado más precisas, como la ecuación de Van der Waals. Para la mayoría de los gases a condiciones normales de laboratorio (temperatura ambiente y presión atmosférica), el modelo ideal es suficientemente preciso.',
      },
    },
  ],
};
