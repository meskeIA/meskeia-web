import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de almíbar: azúcar y agua según el uso | meskeIA',
  description:
    'Calcula los gramos de azúcar y agua para tu almíbar según el uso: ligero para emborrachar bizcochos, medio para sorbetes o denso para cócteles. Obtén el °Brix. Gratis y en español.',
  keywords:
    'calculadora almibar, almibar azucar agua proporcion, almibar emborrachar bizcocho, sirope para cocteles, almibar sorbete, grados brix almibar, ratio azucar agua almibar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de almíbar',
    description: 'Azúcar y agua para tu almíbar según el uso, con el °Brix resultante.',
    url: 'https://meskeia.com/calculadora-almibar',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: { card: 'summary_large_image', title: 'Calculadora de almíbar', description: 'Azúcar y agua para tu almíbar según el uso.' },
  other: { 'application-name': 'Calculadora de almíbar meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-almibar/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de almíbar',
  description:
    'Calcula los gramos de azúcar y de agua para preparar almíbar según su uso (ligero para emborrachar bizcochos, medio para sorbetes y macerar, denso para cócteles y conservar) y muestra el °Brix, que indica la concentración de azúcar.',
  url: 'https://meskeia.com/calculadora-almibar/',
  features: [
    'Azúcar y agua según el uso del almíbar',
    'Cálculo del °Brix (concentración de azúcar)',
    'Proporciones para emborrachar, sorbetes y cócteles',
    'Cantidad ajustable a lo que necesites',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué proporción de azúcar y agua lleva el almíbar?', acceptedAnswer: { '@type': 'Answer', text: 'Depende del uso. Un almíbar ligero para emborrachar bizcochos lleva más agua que azúcar (1:2); uno medio para sorbetes y macerar va a partes iguales (1:1); y uno denso para cócteles o conservar fruta lleva el doble de azúcar que de agua (2:1). La calculadora te da los gramos exactos para la cantidad que quieras.' } },
    { '@type': 'Question', name: '¿Qué es el °Brix de un almíbar?', acceptedAnswer: { '@type': 'Answer', text: 'El °Brix es el porcentaje de azúcar sobre el peso total del almíbar. Un almíbar al 50% de azúcar tiene 50 °Brix. Cuanto mayor es el °Brix, más denso y dulce es el almíbar y mejor conserva. Es una forma estándar de medir su concentración.' } },
    { '@type': 'Question', name: '¿Cómo se hace un almíbar?', acceptedAnswer: { '@type': 'Answer', text: 'Se calienta el agua con el azúcar removiendo hasta que el azúcar se disuelva por completo y el líquido quede transparente. No hace falta que hierva mucho rato para un almíbar de uso general; si lo cueces más, se concentra y sube el °Brix. Déjalo enfriar antes de usarlo para calar bizcochos.' } },
    { '@type': 'Question', name: '¿Para qué se usa el almíbar en repostería?', acceptedAnswer: { '@type': 'Answer', text: 'Sirve para emborrachar y dar jugosidad a bizcochos y babás, para hacer sorbetes y helados, para macerar y conservar fruta, y como sirope (gomme) en coctelería. Según el uso conviene una densidad u otra, que es justo lo que ajusta esta herramienta.' } },
    { '@type': 'Question', name: '¿En qué se diferencia del caramelo?', acceptedAnswer: { '@type': 'Answer', text: 'El almíbar es azúcar disuelto en agua a baja temperatura, transparente y líquido. Si sigues cociéndolo y subes la temperatura, el azúcar pasa por los puntos de hebra, bola y, finalmente, caramelo. Esos puntos por temperatura se calculan en la herramienta de puntos del azúcar.' } },
  ],
};
