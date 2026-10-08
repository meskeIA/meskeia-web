import ConRelacionadas from '@/components/ConRelacionadas';

export { metadata } from './metadata';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <><ConRelacionadas slug="guia-primer-empleo">{children}</ConRelacionadas></>;
}
