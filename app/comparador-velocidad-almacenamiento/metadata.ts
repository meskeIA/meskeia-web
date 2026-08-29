import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Velocidad de Almacenamiento - HDD vs SSD vs USB vs NVMe - meskeIA',
  description: 'Calcula en tiempo real cuánto tarda en transferirse tu archivo en HDD, SSD SATA, NVMe Gen 4, USB 2.0, USB 3.2, USB4, UFS 4.0 y tarjeta SD. Compara la velocidad del disco duro (disco rígido) frente al SSD con slider de tamaño y presets de foto, vídeo, película 4K y más.',
  keywords: 'velocidad almacenamiento comparar, HDD vs SSD tiempo transferencia, NVMe velocidad, USB 3.0 vs 3.2 velocidad, cuánto tarda copiar archivo, velocidad disco duro SSD comparativa, velocidad disco rígido vs SSD, tiempo transferencia 4K',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Velocidad de Almacenamiento - meskeIA',
    description: '¿Cuánto tarda en copiarse una película 4K en USB 2.0 vs NVMe Gen 4? Calculadora interactiva con barras comparativas en tiempo real.',
    url: 'https://meskeia.com/comparador-velocidad-almacenamiento/',
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
    title: 'Comparador Velocidad de Almacenamiento - meskeIA',
    description: 'HDD vs SSD vs NVMe vs USB: calcula el tiempo de transferencia de cualquier archivo con un slider.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Comparador Velocidad Almacenamiento - meskeIA',
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Comparador de Velocidad de Almacenamiento',
  description: 'Calculadora interactiva que muestra cuánto tarda en transferirse un archivo en 10 tecnologías de almacenamiento: HDD (disco duro o disco rígido), SSD SATA, NVMe Gen 3 y 4, USB 2.0, USB 3.0, USB 3.2 Gen 2, USB4/Thunderbolt, UFS 4.0 y Tarjeta SD. Slider de tamaño logarítmico con presets de foto, vídeo, juego y backup.',
  url: 'https://meskeia.com/comparador-velocidad-almacenamiento/',
  category: 'EducationalApplication',
  features: [
    'Comparativa de 10 tecnologías de almacenamiento con velocidades reales',
    'Slider logarítmico de 1 MB a 1 TB para cualquier tamaño de archivo',
    'Presets rápidos: foto, canción, vídeo HD, película 4K, juego AAA, backup',
    'Barras comparativas en escala logarítmica, ordenadas de más rápido a más lento',
    'Tiempo formateado en ms, segundos, minutos u horas según corresponda',
    'Modo lectura y escritura con velocidades diferenciadas',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/comparador-velocidad-almacenamiento/',
  mainEntity: [
    {
      question: '¿Cuánto tarda en copiar una película de 25 GB en USB 2.0 vs NVMe Gen 4?',
      answer: 'En USB 2.0 (35 MB/s reales), una película de 25 GB tarda unos 12 minutos. En un SSD NVMe Gen 4 (7.000 MB/s), la misma operación tarda apenas 3-4 segundos. La diferencia es de 200 veces, lo que ilustra por qué el NVMe domina como almacenamiento principal en PCs y consolas.',
    },
    {
      question: '¿Por qué el USB 3.0 es mucho más lento que su velocidad teórica de 5 Gbps?',
      answer: 'El USB 3.0 tiene 5 Gbps teóricos (625 MB/s), pero en la práctica rara vez supera 380-400 MB/s por varios motivos: overhead del protocolo USB (~20%), latencias del controlador, limitaciones del almacenamiento flash interno del pendrive y la calidad del cable. Los pendrives USB 3.0 económicos pueden limitarse a 100-150 MB/s por su memoria flash de bajo coste.',
    },
    {
      question: '¿Qué diferencia hay entre NVMe Gen 3 y Gen 4?',
      answer: 'NVMe Gen 4 (PCIe 4.0) dobla el ancho de banda de Gen 3: de ~3.500 MB/s a ~7.000 MB/s en lectura. En la práctica cotidiana la diferencia es perceptible en copias de archivos grandes o compilación de proyectos, pero para navegación web o edición de documentos ambas generaciones son prácticamente iguales. Gen 4 es el estándar desde 2021 (AMD Ryzen 5000, Intel 12ª gen, PS5).',
    },
    {
      question: '¿Qué es UFS y por qué los móviles de gama alta son tan rápidos?',
      answer: 'UFS (Universal Flash Storage) es el estándar de almacenamiento interno de los smartphones de gama alta. UFS 4.0, presente en flagships desde 2023, alcanza 4.200 MB/s de lectura, superando incluso a muchos SSD NVMe Gen 3 para PC. Usa un protocolo de comandos paralelos (HS-G4, 2 lanes) que elimina los cuellos de botella de los estándares anteriores como eMMC.',
    },
    {
      question: '¿Cuánto tiempo se tarda en hacer una copia de seguridad de 500 GB en cada soporte?',
      answer: 'Con 500 GB de datos: HDD mecánico (~120 MB/s) tarda unos 70 minutos; USB 3.0 (~380 MB/s) unos 22 minutos; SSD NVMe Gen 4 (~7.000 MB/s) unos 71 segundos; USB 2.0 (~35 MB/s) casi 4 horas. Para backups frecuentes de gran volumen, la diferencia entre un HDD externo USB 3.0 y un NVMe interno es de más de 3 veces.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);
