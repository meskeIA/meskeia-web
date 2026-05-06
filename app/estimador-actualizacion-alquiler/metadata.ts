import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador Actualización Alquiler 2026 — IRAV e IPC | meskeIA',
  description: 'Estima cuánto puede subir tu alquiler en 2026. Aplica el índice correcto: IRAV (contratos desde mayo 2023) o IPC interanual (contratos anteriores). Ley de Vivienda actualizada.',
  keywords: 'estimador alquiler 2026, IRAV alquiler, subida alquiler 2026, actualización renta alquiler, IPC alquiler, cuanto puede subir el alquiler, ley vivienda 2023 alquiler, indice actualizacion alquiler',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Actualización Alquiler 2026 — IRAV e IPC | meskeIA',
    description: 'Estima la subida máxima permitida de tu alquiler según la Ley de Vivienda. IRAV para contratos nuevos, IPC para los anteriores.',
    url: 'https://meskeia.com/estimador-actualizacion-alquiler/',
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
    title: 'Estimador Actualización Alquiler 2026 | meskeIA',
    description: '¿Cuánto puede subir tu alquiler? Estima con IRAV o IPC según tu tipo de contrato.',
    images: ['https://meskeia.com/og-image.png']
  },
};
