import { Metadata } from 'next';

const URL_CANONICA = 'https://cronicum.com/';

/**
 * Imagen de tarjeta social de Cronicum (1200×630), compartida por la home, las
 * puertas y las cronologías (`[slug]/page.tsx` la importa de aquí).
 *
 * El host es `cronicum.com` **a propósito**. Hasta el 29/08/2026 apuntaba a
 * `https://meskeia.com/cronicum/og-image.png` con el comentario «servida como
 * estático directo (sin el host-rewrite del proxy)»: cierto respecto al proxy,
 * pero FALSO respecto a `next.config.ts`, cuyo 308 canónico `/cronicum/:path+`
 * → `cronicum.com/:path+/` también se traga la imagen. El salto terminaba en
 * `cronicum.com/og-image.png`, que es `public/og-image.png` — la de meskeIA
 * (53 KB) — así que la og de Cronicum (74 KB) NO se sirvió nunca. Bajo
 * cronicum.com el proxy hace passthrough de todo lo que lleva extensión, de
 * modo que esta URL resuelve directa a `public/cronicum/og-image.png`, sin
 * redirección y con la imagen de marca correcta.
 */
export const OG_IMAGE = 'https://cronicum.com/cronicum/og-image.png';

export const metadata: Metadata = {
  title: 'Cronicum — Historia interactiva de la humanidad | meskeIA',
  description:
    'Cronicum reúne cronologías interactivas de la historia universal: civilizaciones y países del mundo, y la historia de la ciencia, la tecnología, el arte, la economía y la vida cotidiana. Navegable, sin registro y sin coste.',
  keywords:
    'cronicum, historia interactiva, cronología, civilizaciones, historia universal, línea del tiempo, historia de la ciencia, historia del arte, América precolombina, grandes acontecimientos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cronicum — Historia interactiva de la humanidad',
    description:
      'Cronologías interactivas de la historia universal: civilizaciones, países y la historia de las grandes ideas e inventos.',
    url: URL_CANONICA,
    siteName: 'Cronicum',
    locale: 'es_ES',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Cronicum — el portal de historia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cronicum — Historia interactiva de la humanidad',
    description:
      'Cronologías interactivas de la historia universal. Navegable, sin registro, sin coste.',
    images: [OG_IMAGE],
  },
  other: {
    'application-name': 'Cronicum',
  },
  alternates: {
    canonical: URL_CANONICA,
  },
  icons: {
    icon: [
      { url: '/cronicum/favicon.svg', type: 'image/svg+xml' },
      { url: '/cronicum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/cronicum/app-icon-180.png',
  },
};

// JSON-LD a nivel de sitio: Organización Cronicum (editor meskeIA).
// Se inyecta en el layout compartido, por lo que aplica a toda la subweb /cronicum.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cronicum',
  url: URL_CANONICA,
  description:
    'Plataforma de historia interactiva: cronologías navegables de civilizaciones, países y la historia de la ciencia, el arte, la economía y la vida cotidiana. Parte de meskeIA.',
  logo: 'https://cronicum.com/cronicum/app-icon-512.png',
  parentOrganization: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com/',
  },
};
