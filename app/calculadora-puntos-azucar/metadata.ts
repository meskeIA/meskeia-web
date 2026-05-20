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
