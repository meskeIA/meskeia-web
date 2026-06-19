import { Metadata } from 'next';
import Link from 'next/link';
import { FISCAL_INMUEBLES_META } from '@/data/fiscal';
import { formatDate } from '@/lib';
import styles from './DatosFiscales.module.css';

export const metadata: Metadata = {
  title: 'Datos fiscales verificados de España | Delegum',
  description:
    'Tipos, tramos y coeficientes fiscales de España verificados, con fuente oficial y fecha de actualización. Listos para consultar o citar.',
  alternates: { canonical: 'https://delegum.com/datos-fiscales/' },
};

// Fichas de datos disponibles (crece a medida que se publican)
const FICHAS = [
  {
    icon: '🏠',
    titulo: 'Tipos de ITP por comunidad autónoma',
    desc: 'Impuesto de Transmisiones Patrimoniales en la compra de vivienda usada, con tipos generales y reducidos por CCAA.',
    href: '/datos-fiscales/itp-ccaa',
    verificado: FISCAL_INMUEBLES_META.verificado,
  },
];

export default function DatosFiscalesIndex() {
  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Delegum · Datos fiscales</p>
        <h1 className={styles.title}>Datos fiscales verificados de España</h1>
        <p className={styles.subtitle}>
          Tipos, tramos y coeficientes con <strong>fuente oficial y fecha de verificación</strong>.
          Pensados para consultar de un vistazo o citar como referencia.
        </p>
      </header>

      <section className={styles.fichasGrid}>
        {FICHAS.map((f) => {
          let fecha = f.verificado;
          try {
            fecha = formatDate(new Date(f.verificado));
          } catch {
            /* se mantiene el valor ISO si la fecha no es válida */
          }
          return (
            <Link key={f.href} href={f.href} className={styles.fichaCard}>
              <span className={styles.fichaIcon} aria-hidden="true">{f.icon}</span>
              <h2 className={styles.fichaTitulo}>{f.titulo}</h2>
              <p className={styles.fichaDesc}>{f.desc}</p>
              <span className={styles.fichaMeta}>Verificado el {fecha}</span>
            </Link>
          );
        })}
      </section>

      <p className={styles.foot}>
        Estamos ampliando esta sección con más datos (IRPF, IVA, SMI, intereses…). Cada ficha se
        genera desde la misma fuente que usan las calculadoras de meskeIA, por lo que se mantiene
        siempre actualizada.
      </p>
    </main>
  );
}
