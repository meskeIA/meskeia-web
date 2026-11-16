import type { Metadata } from 'next';
import Link from 'next/link';

import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import SugerenciaRuta from '@/components/SugerenciaRuta';

import styles from './not-found.module.css';

/**
 * Página 404 propia (semilla S0278, 16/11/2026). Hasta entonces no había `app/not-found.tsx` y
 * quien caía en una URL inexistente veía la página de error vacía de Next, sin marca ni salida.
 * Medido ese día: 118 URLs con impresiones en Google daban 404, con unos 30 clics en 90 días.
 * El dominio repetido y los acentos los redirige `proxy.ts`; aquí llegan las erratas, y
 * `SugerenciaRuta` propone la app con el nombre más parecido.
 *
 * Es estática a propósito: la ruta se lee en el navegador. Leerla aquí con `headers()` la haría
 * dinámica, y cada 404 de un bot costaría una invocación en Vercel.
 *
 * El `Footer` va sin `appName`: no registra nada. La visita la registra `SugerenciaRuta` como
 * `pag:404`, con la ruta y la sugerencia.
 */

export const metadata: Metadata = {
  title: 'Página no encontrada | meskeIA',
  description: 'La dirección que has abierto no corresponde a ninguna página de meskeIA.',
};

export default function NotFound() {
  return (
    <>
      <MeskeiaLogo />

      <main className={styles.contenedor}>
        <div className={styles.icono} aria-hidden="true">
          🔎
        </div>
        <h1 className={styles.titulo}>Esta página no existe</h1>
        <p className={styles.texto}>
          Puede que la dirección tenga una errata o que el enlace por el que has llegado esté mal
          escrito.
        </p>

        <SugerenciaRuta />

        <Link href="/" className={styles.botonInicio}>
          Ver todas las aplicaciones
        </Link>
      </main>

      <Footer />
    </>
  );
}
