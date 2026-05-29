import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Puntos del Azúcar — Fases y Temperaturas de Cocción del Almíbar | meskeIA',
  description: 'Descubre en qué fase se encuentra tu almíbar según la temperatura: almíbar ligero, bola blanda, caramelo y más. Tabla de referencia con prueba del agua fría.',
  keywords: 'puntos del azúcar, fases del azúcar, temperatura almíbar, caramelo cocción, termómetro cocina, prueba agua fría',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Puntos del Azúcar | meskeIA',
    description: 'Introduce la temperatura y descubre la fase del azúcar: almíbar, bola blanda, caramelo… Con tabla de las 9 fases y prueba del agua fría.',
    url: 'https://meskeia.com/calculadora-puntos-azucar',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Puntos del Azúcar | meskeIA',
    description: 'Introduce la temperatura y descubre la fase del azúcar: almíbar, bola blanda, caramelo… Con tabla de las 9 fases.',
  },
  other: {
    'application-name': 'Calculadora Puntos del Azúcar meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Puntos del Azúcar',
  description: 'Herramienta para identificar la fase de cocción del azúcar según la temperatura en grados Celsius. Incluye tabla completa de las 9 fases, prueba del agua fría y usos gastronómicos.',
  url: 'https://meskeia.com/calculadora-puntos-azucar/',
  category: 'EducationalApplication',
  features: [
    'Identificación de fase del azúcar por temperatura (100–200°C)',
    'Conversión automática a grados Fahrenheit',
    'Descripción de usos típicos por fase (fondant, toffee, piruletas…)',
    'Prueba del vaso de agua fría para cada fase',
    'Tabla de referencia completa con las 9 fases del azúcar',
    'Navegación de contexto: fase anterior y siguiente',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas fases o puntos tiene el azúcar al cocinarse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El azúcar pasa por 9 fases principales a medida que aumenta su temperatura: almíbar ligero (100–103 °C), almíbar espeso (103–110 °C), hebra fina (110–112 °C), hebra gruesa (112–116 °C), bola blanda (116–121 °C), bola firme (121–130 °C), bola dura (130–150 °C), caramelo rubio (150–165 °C) y caramelo oscuro (165–180 °C). Cada fase tiene usos distintos en pastelería y repostería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé en qué punto está el azúcar sin termómetro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prueba del vaso de agua fría es el método tradicional: se vierte una pequeña cantidad de almíbar en agua helada y se observa su comportamiento. Si forma una bola blanda que se aplasta con los dedos, está en el punto de bola blanda (116–121 °C); si se convierte en hilos rígidos, está en caramelo. Aunque es un método menos preciso que el termómetro, es muy útil cuando no se dispone de uno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué recetas necesito el punto de bola blanda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El punto de bola blanda (116–121 °C) es el adecuado para preparar fondant, merengue italiano, fudge y nougat blando. Es uno de los puntos más usados en pastelería profesional porque da una textura suave y trabajable a rellenos y coberturas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura se hace el caramelo líquido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El caramelo líquido para flanes y salsas se obtiene entre 150 °C y 165 °C (caramelo rubio). Por encima de 165 °C el caramelo se oscurece y adquiere un sabor más amargo. Una vez retirado del fuego, continúa subiendo de temperatura por el calor residual, por lo que conviene apartar la sartén unos grados antes del punto objetivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la temperatura del almíbar es diferente a la del agua hirviendo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agua pura hierve a 100 °C, pero cuando se disuelve azúcar en ella, el punto de ebullición sube (elevación ebulloscópica). Cuanta más concentración de azúcar, mayor temperatura de ebullición. Por eso el almíbar hierve por encima de 100 °C, y la temperatura sigue aumentando a medida que el agua se evapora y aumenta la concentración de azúcar.',
      },
    },
  ],
};
