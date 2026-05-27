import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Hashes Online - MD5, SHA-256, SHA-512 | meskeIA',
  description: 'Genera hashes MD5, SHA-256 y SHA-512 de textos y archivos. Verifica integridad de datos, compara checksums y aprende sobre funciones hash criptográficas.',
  keywords: 'hash, md5, sha256, sha512, sha-256, sha-512, checksum, integridad, verificar archivo, hash online, criptografia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Hashes Online - MD5, SHA-256, SHA-512 | meskeIA',
    description: 'Genera hashes MD5, SHA-256 y SHA-512 para verificar integridad de datos.',
    url: 'https://meskeia.com/generador-hashes/',
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
    title: 'Generador de Hashes - MD5, SHA-256, SHA-512',
    description: 'Genera y verifica hashes criptográficos de textos y archivos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Hashes",
  description: "Genera hashes MD5, SHA-256 y SHA-512 de textos y archivos. Verifica integridad de datos, compara checksums y aprende sobre funciones hash criptográficas.",
  url: "https://meskeia.com/generador-hashes/",
  category: 'UtilityApplication',
  features: [],
});
