import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Coche/Carro/Auto Nuevo o Usado — ¿Qué te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene más un coche, carro o auto nuevo, seminuevo (1-3 años) o de segunda mano. Análisis según presupuesto, uso, garantías y etiqueta DGT.',
  keywords: [
    'coche nuevo o usado',
    'carro nuevo o usado',
    'auto nuevo o usado',
    'comprar coche nuevo o segunda mano',
    'comprar auto nuevo o usado',
    'seminuevo o nuevo',
    'cuándo comprar coche usado',
    'ventajas coche nuevo',
    'coche de segunda mano fiable',
    'comprar carro 2025',
    'etiqueta DGT coche usado',
    'financiar coche nuevo o usado',
  ],
  openGraph: {
    title: '¿Coche/carro/auto nuevo, seminuevo o segunda mano? Test en 10 preguntas | meskeIA',
    description:
      'Descubre qué tipo de coche, carro o auto te conviene comprar según presupuesto, km esperados, importancia de la garantía y etiqueta medioambiental.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-coche-nuevo-usado/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Nuevo, seminuevo o segunda mano? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir entre coche, carro o auto nuevo, seminuevo o de segunda mano según tu perfil.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-coche-nuevo-usado/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Coche Nuevo o Usado',
        description:
          'Test orientativo para saber si conviene comprar un coche, carro o auto nuevo, seminuevo o de segunda mano según presupuesto, uso y prioridades.',
        url: 'https://meskeia.com/selector-coche-nuevo-usado/',
        features: [
          'Test de 10 preguntas sobre perfil y prioridades',
          '3 recomendaciones: nuevo, seminuevo, segunda mano',
          'Análisis de etiqueta DGT y ZBE',
          'Consideración de garantías y fiabilidad',
          'Orientación sobre coste total de propiedad',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Coche Nuevo o Usado",
  description: "Test de 10 preguntas para saber si te conviene más un coche, carro o auto nuevo, seminuevo (1-3 años) o de segunda mano. Análisis según presupuesto, uso, garantías y etiqueta DGT.",
  url: "https://meskeia.com/selector-coche-nuevo-usado/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo compensa comprar un coche nuevo en lugar de uno de segunda mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un coche nuevo compensa principalmente si vas a realizar muchos kilómetros anuales (más de 20.000 km), si necesitas la garantía del fabricante sin incertidumbres sobre el historial del vehículo, o si quieres acceder a las últimas tecnologías de seguridad y conectividad. También es ventajoso si vas a financiarlo a largo plazo, ya que los tipos de interés suelen ser mejores en vehículos nuevos. El mayor inconveniente es la depreciación: un coche nuevo pierde entre el 15% y el 25% de su valor en el primer año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventajas tiene un coche seminuevo frente a uno nuevo o de segunda mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un seminuevo (1-3 años de antigüedad) ofrece el punto medio ideal: ya ha sufrido la mayor depreciación inicial, suele conservar garantía oficial o del vendedor, y su precio puede ser un 20-35% inferior al del mismo modelo nuevo. Además, los modelos recientes incluyen tecnologías de seguridad activa (frenada de emergencia, asistente de carril) que no estaban disponibles hace años. Es la opción más recomendable para quien busca equilibrio entre coste, fiabilidad y equipamiento moderno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la etiqueta DGT y por qué importa al comprar un coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La etiqueta medioambiental de la DGT clasifica los vehículos en cinco categorías (cero emisiones, ECO, C, B y sin etiqueta) según sus emisiones de CO₂ y contaminantes. Los vehículos sin etiqueta (matriculados antes de 2000 en gasolina o 2006 en diésel) tienen restringida o prohibida la circulación en Zonas de Bajas Emisiones (ZBE) de grandes ciudades como Madrid, Barcelona o Valencia. Antes de comprar un coche de segunda mano, conviene verificar qué etiqueta le corresponde y si podrás circular sin restricciones en tu ciudad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hay que revisar al comprar un coche de segunda mano para evitar problemas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los puntos clave son: historial de mantenimiento (libro de revisiones sellado), informe de cargas del Registro de Bienes Muebles (para verificar que no tiene deudas pendientes), informe de la DGT con el kilometraje real y ITV vigente. En la inspección física conviene revisar el estado de neumáticos, frenos, niveles de fluidos y buscar señales de óxido o reparaciones de chapa. Si es posible, realizar una revisión prepurchase con un mecánico independiente puede evitar sorpresas costosas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo influye el tipo de uso (ciudad, carretera, mixto) en la elección entre gasolina, diésel o híbrido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para uso predominantemente urbano (menos de 15.000 km anuales, trayectos cortos), los motores híbridos y de gasolina ofrecen mejor rendimiento que el diésel, que necesita rodajes largos para funcionar eficientemente. El diésel sigue siendo rentable para conductores que hacen más de 25.000-30.000 km anuales con tramos de carretera, donde su menor consumo amortiza el mayor precio inicial. Los híbridos enchufables y eléctricos resultan más ventajosos cuanto mayor sea el acceso a carga doméstica nocturna y menores los trayectos habituales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo coche, carro y auto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, son la misma cosa: "coche" se dice en España, "carro" en Colombia, México, Centroamérica y el Caribe, y "auto" en Argentina, Chile y Uruguay. El análisis de comprar nuevo, seminuevo o de segunda mano según presupuesto, kilómetros y garantía es válido sea cual sea el nombre que uses para el vehículo.',
      },
    },
  ],
};
