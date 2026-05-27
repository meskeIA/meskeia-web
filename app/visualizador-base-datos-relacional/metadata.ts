import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Base de Datos Relacional: Tablas, JOIN e Índices | meskeIA',
  description:
    'Cómo funciona una base de datos relacional: tablas y claves primarias/foráneas, los 4 tipos de JOIN visualizados, índices que aceleran 1000x las consultas, transacciones ACID y cuándo elegir SQL vs NoSQL.',
  keywords: [
    'base de datos relacional',
    'SQL JOIN cómo funciona',
    'índices base de datos',
    'transacciones ACID',
    'SQL vs NoSQL cuándo usar',
    'clave primaria foránea',
    'normalización base de datos',
    'PostgreSQL MySQL concepto',
  ],
  openGraph: {
    title: 'Base de Datos Relacional: Tablas, JOIN e Índices | meskeIA',
    description:
      'Por qué un índice convierte una búsqueda de segundos en milisegundos — y cuándo NoSQL es mejor opción.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Base de Datos Relacional: Tablas, JOIN e Índices",
  description: "Cómo funciona una base de datos relacional: tablas y claves primarias/foráneas, los 4 tipos de JOIN visualizados, índices que aceleran 1000x las consultas, transacciones ACID y cuándo elegir SQL vs No",
  url: "https://meskeia.com/visualizador-base-datos-relacional/",
  category: 'EducationalApplication',
  features: [],
});
