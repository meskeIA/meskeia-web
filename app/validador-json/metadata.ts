import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Validador JSON y XML - Formatea y Minifica Código | meskeIA',
  description: 'Valida, formatea y minifica código JSON y XML al instante. Detecta errores de sintaxis, muestra línea del error y genera código limpio.',
  keywords: 'validador json, validador xml, formatear json, minificar json, json validator, xml validator, prettify, beautify',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Validador JSON y XML',
    description: 'Valida, formatea y minifica código JSON y XML al instante con detección de errores.',
    url: 'https://meskeia.com/validador-json/',
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
    title: 'Validador JSON y XML',
    description: 'Valida y formatea código JSON/XML online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Validador JSON",
  description: "Valida, formatea y minifica código JSON y XML al instante. Detecta errores de sintaxis, muestra línea del error y genera código limpio.",
  url: "https://meskeia.com/validador-json/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es JSON y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JSON (JavaScript Object Notation) es un formato de texto ligero para intercambiar datos entre sistemas. Se usa como estándar en APIs REST, archivos de configuración, bases de datos NoSQL y respuestas de servicios web. Su sintaxis basada en pares clave-valor y arrays lo hace legible tanto por humanos como por máquinas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué falla mi JSON y cómo encuentro el error?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los errores más frecuentes en JSON son: comas finales tras el último elemento de un objeto o array, uso de comillas simples en lugar de dobles, claves sin entrecomillar y valores undefined o comentarios (no permitidos en JSON estándar). Un validador online detecta el error e indica la línea exacta donde se encuentra, lo que ahorra tiempo frente a la inspección manual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre formatear (prettify) y minificar (minify) un JSON?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Formatear añade saltos de línea e indentación para hacer el JSON legible por personas; útil durante el desarrollo y la depuración. Minificar elimina todos los espacios en blanco y saltos de línea para reducir el tamaño del archivo; recomendable en producción para acelerar las transferencias por red y reducir el consumo de ancho de banda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo validar XML además de JSON con este validador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El validador acepta tanto JSON como XML. Detecta errores de sintaxis XML como etiquetas no cerradas, atributos mal formados o caracteres especiales sin escapar. El XML formateado se presenta con indentación jerárquica que facilita revisar estructuras de datos complejas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro pegar datos sensibles en un validador online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El validador procesa el JSON y XML completamente en el navegador, sin enviar los datos a ningún servidor. Todo el análisis y formateo ocurre de forma local en tu dispositivo, por lo que es seguro trabajar con datos de prueba o configuraciones internas siempre que no estés en una red comprometida.',
      },
    },
  ],
};
