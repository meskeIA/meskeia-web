import { getNovedades } from './novedades';
import { formatDate } from '@/lib';
import styles from './Ficha.module.css';

/**
 * Bloque "Últimas novedades" al pie del DataReference de cada ficha.
 * Muestra los cambios normativos recientes de esa ficha (changelog), o no
 * renderiza nada si la ficha aún no tiene novedades registradas.
 *
 * Componente propio de Delegum: NO se mete dentro del DataReference compartido
 * con la suite fiscal de meskeIA.
 */
export default function NovedadesFicha({ slug }: { slug: string }) {
  const novedades = getNovedades(slug);
  if (novedades.length === 0) return null;

  return (
    <section className={styles.novedades} aria-label="Últimas novedades de esta ficha">
      <p className={styles.novedadesTitulo}>
        <span aria-hidden="true">🔔</span> Últimas novedades
      </p>
      <ul className={styles.novedadesList}>
        {novedades.map((n) => {
          let fecha = n.fecha;
          try {
            fecha = formatDate(new Date(n.fecha));
          } catch {
            /* se mantiene el valor ISO si la fecha no es válida */
          }
          return (
            <li key={`${n.fecha}-${n.texto.slice(0, 16)}`} className={styles.novedadItem}>
              <time dateTime={n.fecha} className={styles.novedadFecha}>{fecha}</time>
              <span className={styles.novedadTexto}>{n.texto}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
