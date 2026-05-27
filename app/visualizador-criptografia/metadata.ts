import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Criptografía | AES, RSA, Firma Digital y HTTPS | meskeIA',
  description: 'Cómo funciona la criptografía: cifrado simétrico (AES), asimétrico (RSA, curvas elípticas), funciones hash (SHA-256), firma digital y el handshake TLS/HTTPS explicado visualmente.',
  keywords: ['criptografia', 'AES', 'RSA', 'SHA-256', 'firma digital', 'HTTPS', 'TLS', 'cifrado simetrico', 'clave publica', 'certificado digital'],
  openGraph: {
    title: 'Visualizador de Criptografía | meskeIA',
    description: 'AES, RSA, SHA-256, firma digital y TLS: cómo funciona la criptografía que protege tus datos cada día.',
    url: 'https://meskeia.com/visualizador-criptografia/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Criptografía - AES, RSA, ECDSA, SHA-256 y TLS",
  description: "Cómo funciona la criptografía: cifrado simétrico (AES), asimétrico (RSA, curvas elípticas), funciones hash (SHA-256), firma digital y el handshake TLS/HTTPS explicado visualmente.",
  url: "https://meskeia.com/visualizador-criptografia/",
  category: 'EducationalApplication',
  features: [],
});
