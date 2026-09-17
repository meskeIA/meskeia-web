export { metadata } from './metadata';

// Sin este layout, la página (client component) heredaba la metadata del layout padre
// y declaraba el canonical de la portada de Delegum: Google la dejaba fuera del índice
// como «página alternativa con etiqueta canónica adecuada» (aviso de GSC del 16/09/2026).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
