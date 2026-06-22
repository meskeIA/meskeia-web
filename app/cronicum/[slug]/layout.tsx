import { getHistoria } from '@/data/historias/index';
import { getPuerta, getPuertaDeCronologia } from '@/data/cronicum/puertas';

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * JSON-LD por página bajo /cronicum/[slug]:
 *  - puerta      → CollectionPage
 *  - cronología  → WebApplication (+ FAQPage si la cronología tiene FAQ)
 *
 * Se renderiza como texto del <script> (React 19), sin el atributo de innerHTML.
 */
export default async function Layout({ children, params }: Props) {
  const { slug } = await params;
  const url = `https://cronicum.com/${slug}/`;

  const puerta = getPuerta(slug);
  if (puerta) {
    const collectionJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${puerta.titulo} — Cronicum`,
      description: puerta.descripcion,
      url,
      isPartOf: { '@type': 'WebSite', name: 'Cronicum', url: 'https://cronicum.com/' },
    };
    return (
      <>
        <script type="application/ld+json">{JSON.stringify(collectionJsonLd)}</script>
        {children}
      </>
    );
  }

  const data = getHistoria(slug);
  if (!data) return <>{children}</>;

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: data.titulo,
    description: data.descripcionSEO,
    url,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: 'es',
    isAccessibleForFree: true,
  };

  const faq = data.educativo?.faq;
  const faqJsonLd = faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.pregunta,
          acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
        })),
      }
    : null;

  // Migas de pan estructuradas: Cronicum / [Puerta] / [Cronología].
  const puertaDe = getPuertaDeCronologia(slug);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Cronicum', item: 'https://cronicum.com/' },
      ...(puertaDe
        ? [{ '@type': 'ListItem', position: 2, name: puertaDe.titulo, item: `https://cronicum.com/${puertaDe.slug}/` }]
        : []),
      { '@type': 'ListItem', position: puertaDe ? 3 : 2, name: data.titulo, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(webAppJsonLd)}</script>
      {faqJsonLd && (
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      )}
      <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      {children}
    </>
  );
}
