import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Unidades RF - dBm, Watts, VSWR, Longitud de Onda | meskeIA',
  description: 'Conversor especializado para radiofrecuencia: dBm↔Watts, dBµV, VSWR↔Return Loss, frecuencia↔longitud de onda. Herramienta para ingenieros RF y radioaficionados.',
  keywords: 'conversor rf, dbm a watts, watts a dbm, vswr, return loss, longitud de onda, frecuencia, dbmv, dbuv, radiofrecuencia, telecomunicaciones, antenas, radioaficionado',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Unidades RF - dBm, Watts, VSWR | meskeIA',
    description: 'Conversor especializado para radiofrecuencia: dBm↔Watts, VSWR↔Return Loss, frecuencia↔longitud de onda.',
    url: 'https://meskeia.com/conversor-unidades-rf/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de Unidades RF | meskeIA',
    description: 'Herramienta especializada para conversiones de radiofrecuencia.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Unidades RF",
  description: "Conversor especializado para radiofrecuencia: dBm↔Watts, dBµV, VSWR↔Return Loss, frecuencia↔longitud de onda. Herramienta para ingenieros RF y radioaficionados.",
  url: "https://meskeia.com/conversor-unidades-rf/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se convierte dBm a Watts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula es P(W) = 10^(dBm/10) / 1000. Por ejemplo, 0 dBm equivale a 1 mW (0,001 W), 30 dBm equivale a 1 W y 43 dBm a unos 20 W. La conversión inversa es dBm = 10 × log10(P_mW). Esta herramienta realiza el cálculo automáticamente en ambas direcciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el VSWR y cómo se relaciona con el Return Loss?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El VSWR (Voltage Standing Wave Ratio) mide la impedancia entre una línea de transmisión y su carga; un valor de 1:1 es perfecto. El Return Loss expresa en decibelios cuánta potencia se refleja: RL = −20 × log10((VSWR−1)/(VSWR+1)). Un VSWR de 1,5:1 equivale aproximadamente a 14 dB de Return Loss, lo que significa que solo el 4% de la potencia se refleja.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve convertir frecuencia a longitud de onda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En radiofrecuencia, la longitud de onda (λ) determina las dimensiones físicas de antenas, cavidades resonantes y líneas de transmisión. La fórmula es λ = c / f, donde c ≈ 3×10⁸ m/s. Por ejemplo, a 144 MHz (banda 2 m de radioaficionados) la longitud de onda es aproximadamente 2,08 m, y un dipolo básico mide λ/2 ≈ 1,04 m.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre dBm, dBW y dBµV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Todos son decibelios con referencia diferente. dBm toma como referencia 1 mW (muy usado en RF y telecomunicaciones), dBW toma 1 W (habitual en sistemas de alta potencia; 30 dBW = 30 dBm + 30 = 60 dBm), y dBµV toma 1 microvoltio sobre 50 Ω (estándar en medición de receptores y EMC). La conversión entre ellos depende de la impedancia del sistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A quién va dirigido este conversor de unidades RF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado para ingenieros de telecomunicaciones, técnicos de RF, radioaficionados (HAM radio) y estudiantes de electrónica que trabajan habitualmente con medidas de potencia, impedancia y longitud de onda. No requiere instalar software: funciona directamente en el navegador, lo que lo hace útil tanto en laboratorio como en campo.',
      },
    },
  ],
};
