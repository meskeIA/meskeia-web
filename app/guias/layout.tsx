import { Metadata } from 'next';
import { generateGuidesIndexMetadata } from '@/lib/metadata';
import { getTotalGuidesCount } from '@/data/guides';

// Metadata SEO optimizada para página de guías
export const metadata: Metadata = generateGuidesIndexMetadata(getTotalGuidesCount());

export default function GuiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
