import { jsonLd } from './metadata';

export { metadata } from './metadata';

const script = JSON.stringify(jsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: script }}
      />
      {children}
    </>
  );
}
