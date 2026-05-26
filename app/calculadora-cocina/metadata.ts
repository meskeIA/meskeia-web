import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Cocina Online - Convertir Tazas a Gramos, Escalar Recetas',
  description: 'Convierte unidades de cocina (tazas, gramos, ml, onzas), escala recetas según comensales, consulta tiempos de cocción y encuentra sustitutos de ingredientes. Gratis.',
  keywords: 'calculadora cocina, conversor unidades cocina, tazas a gramos, escalador recetas, tiempos coccion, sustitutos ingredientes, medidas cocina, recetas, conversion, temperatura horno',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-cocina/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cocina Online - Tazas a Gramos, Escalar Recetas',
    description: 'Convierte tazas a gramos, ml, onzas. Escala recetas según comensales. Tiempos de cocción y sustitutos de ingredientes.',
    url: 'https://meskeia.com/calculadora-cocina/',
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
    title: 'Calculadora de Cocina Online',
    description: 'Tazas a gramos, escalar recetas, tiempos de cocción y sustitutos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Cocina meskeIA',
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Calculadora de Cocina',
  description: 'Calculadora de cocina online con conversor de unidades (tazas, gramos, ml, onzas), escalador de recetas, tabla de tiempos de cocción y buscador de sustitutos de ingredientes.',
  url: 'https://meskeia.com/calculadora-cocina/',
  category: 'UtilityApplication',
  features: [
    'Conversor de unidades de cocina (volumen, peso, temperatura)',
    'Escalador de recetas según número de comensales',
    'Tabla de tiempos de cocción por alimento y método',
    'Buscador de sustitutos de ingredientes',
    'Conversor de temperaturas de horno (°C, °F, gas)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['calculadora cocina', 'conversor unidades', 'escalador recetas', 'tiempos cocción', 'sustitutos ingredientes'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/calculadora-cocina/',
  mainEntity: [
    {
      question: '¿Cuántos gramos es 1 cup de harina?',
      answer: 'Entre 120 y 130 g, dependiendo de si la harina está tamizada o compactada. La variación puede llegar a 20 g, por eso siempre es mejor usar báscula en repostería. Referencia: 1 cup tamizada = 120 g; 1 cup compactada = 130–140 g.',
    },
    {
      question: '¿Cuál es la diferencia entre la taza americana y la española?',
      answer: 'La taza americana (cup) tiene exactamente 240 ml. La taza española habitual de desayuno oscila entre 150 y 200 ml. No son equivalentes. Para recetas anglosajonas, usa siempre 240 ml o mide con vaso medidor.',
    },
    {
      question: '¿Cómo convierto °F a °C en el horno?',
      answer: 'Aplica la fórmula: °C = (°F − 32) × 5/9. Así, 350°F = 177°C (≈ 180°C práctico). Las referencias más usadas: 325°F = 163°C, 375°F = 190°C, 400°F = 204°C. Truco rápido: divide °F entre 2 y resta 15.',
    },
    {
      question: '¿1 cucharada son siempre 15 ml?',
      answer: 'En el sistema culinario internacional (tablespoon / tbsp), sí: 1 cucharada = 15 ml = 3 cucharaditas. Sin embargo, en Australia la cucharada estándar es 20 ml. Si la receta es australiana, ten en cuenta esa diferencia.',
    },
    {
      question: '¿Cómo multiplico una receta para 8 personas si es para 4?',
      answer: 'Usa el escalador: introduce 4 en "porciones originales" y 8 en "porciones deseadas" (factor 2×). Todos los ingredientes se duplican. Excepciones: la levadura puede reducirse un 20-25% al escalar, y la sal conviene ajustar al gusto. Regla general: factor = porciones deseadas ÷ porciones originales.',
    },
    {
      question: '¿El aceite pesa lo mismo que el agua?',
      answer: 'No. El agua tiene densidad 1 g/ml, por lo que 100 ml = 100 g. El aceite tiene densidad 0,92 g/ml, así que 100 ml de aceite = 92 g. Si una receta pide 100 g de aceite, necesitas aproximadamente 109 ml. Densidades: agua 1,0 | leche 1,03 | aceite 0,92 | miel 1,42.',
    },
    {
      question: '¿Cómo medir ingredientes secos sin báscula?',
      answer: 'Usa medidas de referencia: 1 vaso estándar (200 ml) ≈ 110 g harina / 180 g azúcar / 180 g arroz. Una cuchara sopera ≈ 10 g harina / 15 g azúcar / 14 g aceite. Para máxima precisión, llena y rasas el recipiente sin compactar, con el dorso de un cuchillo.',
    },
    {
      question: '¿Temperatura de horneado con ventilador vs. horno convencional?',
      answer: 'El horno con ventilador (convección forzada) cocina un 15–20% más rápido. Reduce la temperatura indicada en la receta entre 15°C y 20°C, o reduce el tiempo en un 10–15%. Si la receta dice 180°C sin ventilador, usa 160–165°C con ventilador.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);
