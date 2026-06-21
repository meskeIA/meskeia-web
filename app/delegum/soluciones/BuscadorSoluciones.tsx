'use client';

import { useMemo, useState } from 'react';
import styles from './Soluciones.module.css';

export interface ItemBuscador {
  name: string;
  icon: string;
  href: string;
  /** Texto normalizado (nombre + descripción + keywords) sobre el que se busca. */
  hay: string;
}

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Buscador acotado al universo Delegum (~84 herramientas de Soluciones).
 * Filtro por substring de todos los tokens; no necesita índice externo a esta
 * escala. El que sabe qué quiere busca; el que no, baja a las puertas.
 */
export default function BuscadorSoluciones({ items }: { items: ItemBuscador[] }) {
  const [q, setQ] = useState('');

  const resultados = useMemo(() => {
    const query = normalize(q.trim());
    if (query.length < 2) return [];
    const tokens = query.split(/\s+/);
    return items.filter((it) => tokens.every((t) => it.hay.includes(t))).slice(0, 6);
  }, [q, items]);

  const hayQuery = q.trim().length >= 2;

  return (
    <div className={styles.buscador}>
      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Busca una herramienta: hipoteca, IRPF, autónomo, herencia…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Buscar una herramienta en Delegum"
        autoComplete="off"
      />
      {hayQuery && (
        <ul className={styles.resultados} aria-live="polite">
          {resultados.length === 0 ? (
            <li className={styles.resultadoVacio}>
              No encontramos esa herramienta. Prueba con otra palabra o entra por tu situación.
            </li>
          ) : (
            resultados.map((it) => (
              <li key={it.href}>
                <a href={it.href} className={styles.resultadoItem}>
                  <span className={styles.resultadoIcon} aria-hidden="true">{it.icon}</span>
                  <span>{it.name}</span>
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
