import ConRelacionadas from '@/components/ConRelacionadas';

// Las relacionadas se resuelven en el servidor: al cliente solo llegan sus 4 tarjetas
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ConRelacionadas slug="guia-montar-negocio">{children}</ConRelacionadas>;
}
