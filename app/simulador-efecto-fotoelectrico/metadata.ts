import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Efecto Fotoeléctrico: Frecuencia Umbral y Energía Cinética | meskeIA',
  description: 'Simula el efecto fotoeléctrico con la ecuación de Einstein: elige la longitud de onda, la intensidad y el metal, y calcula la energía del fotón, la frecuencia umbral, la energía cinética máxima, la velocidad de los electrones y el potencial de frenado.',
  keywords: 'efecto fotoeléctrico, efecto fotoelectrico, frecuencia umbral, función de trabajo, trabajo de extracción, potencial de frenado, Einstein, simulador, energía del fotón, longitud de onda umbral, física cuántica, secundaria, preparatoria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-efecto-fotoelectrico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Efecto Fotoeléctrico | meskeIA',
    description: 'Cambia el color de la luz, su intensidad y el metal, y mira cuándo salen electrones y con qué energía: E_c = h·f − φ.',
    url: 'https://meskeia.com/simulador-efecto-fotoelectrico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Efecto Fotoeléctrico | meskeIA',
    description: 'Frecuencia umbral, energía cinética máxima y potencial de frenado con la ecuación de Einstein',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Efecto Fotoeléctrico — Frecuencia Umbral y Energía Cinética',
  description: 'Simulador interactivo del efecto fotoeléctrico. Ajusta la longitud de onda de la luz (100-800 nm), su intensidad y el metal iluminado, y obtén con la ecuación de Einstein la energía del fotón, la frecuencia y la longitud de onda umbral, la energía cinética máxima de los electrones, su velocidad y el potencial de frenado.',
  url: 'https://meskeia.com/simulador-efecto-fotoelectrico/',
  category: 'EducationalApplication',
  features: [
    'Deslizador de longitud de onda de 100 a 800 nm con el color de la luz y su región del espectro',
    'Ocho metales con su función de trabajo (Serway y Jewett, tabla 40.1) y opción de introducir otra',
    'Energía del fotón en eV y en J, frecuencia, frecuencia umbral y longitud de onda umbral',
    'Energía cinética máxima, velocidad máxima de los electrones y potencial de frenado',
    'Animación de la placa con electrones cuyo número sigue a la intensidad y cuya velocidad sigue a la energía',
    'Gráfica de la energía cinética frente a la frecuencia: recta de pendiente h que corta el eje en f₀',
    'Constantes CODATA 2018',
  ],
  keywords: ['efecto fotoeléctrico', 'frecuencia umbral', 'función de trabajo', 'potencial de frenado', 'Einstein', 'física cuántica', 'simulador'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el efecto fotoeléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la emisión de electrones por un metal cuando lo ilumina luz de frecuencia suficientemente alta. Einstein lo explicó en 1905 suponiendo que la luz llega en paquetes (fotones) de energía E = h·f: cada fotón cede toda su energía a un electrón, que gasta una parte, la función de trabajo φ, en salir del metal y se queda el resto como energía cinética: E_c,máx = h·f − φ.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la frecuencia umbral y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la frecuencia mínima f₀ = φ/h por debajo de la cual el metal no emite ningún electrón. Para el sodio, con φ = 2,46 eV, vale unos 5,95·10¹⁴ Hz, que corresponde a una longitud de onda umbral λ₀ = h·c/φ ≈ 504 nm (luz verde). Para el cobre, con φ = 4,70 eV, la longitud de onda umbral baja a unos 264 nm, en el ultravioleta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué aumentar la intensidad de la luz no aumenta la energía de los electrones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la intensidad solo cambia cuántos fotones llegan por segundo, no la energía de cada uno, que depende únicamente de la frecuencia. Más intensidad significa más electrones arrancados y más corriente, pero todos con la misma energía cinética máxima. Si la frecuencia está por debajo del umbral, no sale ningún electrón aunque la luz sea muy intensa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el potencial de frenado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la tensión V₀ que hay que aplicar en contra para detener hasta los electrones más rápidos y anular la corriente: e·V₀ = E_c,máx. Por eso, expresado en voltios, coincide numéricamente con la energía cinética máxima en electronvoltios. Por ejemplo, sodio iluminado con luz de 400 nm da E_c,máx ≈ 0,64 eV y V₀ ≈ 0,64 V.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se pasa de longitud de onda a energía del fotón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con E = h·c/λ. Usando h·c ≈ 1.239,84 eV·nm basta dividir: un fotón de 400 nm tiene 1.239,84 / 400 ≈ 3,10 eV, y uno de 200 nm el doble, unos 6,20 eV. Si se trabaja en julios hay que pasar antes los nanómetros a metros (1 nm = 10⁻⁹ m) y usar h = 6,626·10⁻³⁴ J·s y c ≈ 3·10⁸ m/s; 1 eV equivale a 1,602·10⁻¹⁹ J.',
      },
    },
  ],
};
