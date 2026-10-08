'use client';

/**
 * Panel «Mis recetas» y aviso de receta recuperada, para las calculadoras de pan (S0190).
 *
 * El estado vive en `useRecetasGuardadas` (lib/recetasGuardadas.ts); aquí solo se pinta. Se
 * importa por su ruta y NO desde el barrel `@/components`, que funde sus componentes en un
 * módulo: lo que entra ahí lo descargan todas las apps, y esto lo usan dos.
 */
import { useState, type FormEvent } from 'react';
import styles from './RecetasGuardadas.module.css';
import { formatDate, formatNumber } from '@/lib';
import {
  MAX_NOMBRE,
  MAX_RECETAS,
  type RecetaGuardada,
  type RecetasGuardadas,
  type ResultadoGuardar,
} from '@/lib/recetasGuardadas';

interface AvisoProps {
  /** «receta» o «fórmula»: la palabra con la que la app nombra lo que se guarda. */
  queEs: string;
  onEmpezarDeCero: () => void;
}

/** Se enseña al volver: si no, una receta distinta de la de ejemplo parecería un fallo. */
export function AvisoRecetaRecuperada({ queEs, onEmpezarDeCero }: AvisoProps) {
  return (
    <div className={styles.aviso} role="status">
      <p className={styles.avisoTexto}>
        <span aria-hidden="true">🔁</span> Hemos recuperado la {queEs} que dejaste la última vez.
        Se guarda solo en este dispositivo.
      </p>
      <button type="button" className={styles.btnSecundario} onClick={onEmpezarDeCero}>
        Empezar de cero
      </button>
    </div>
  );
}

interface PanelProps<T> {
  recetas: RecetasGuardadas<T>;
  /** «receta» o «fórmula». */
  queEs: string;
  /** Nombre que se usa si se guarda con el campo vacío, y que se ve como sugerencia. */
  nombreSugerido: string;
  /** Una línea con lo esencial de cada receta guardada, para reconocerla sin cargarla. */
  describir: (receta: RecetaGuardada<T>) => string;
}

const mensajeGuardar = (r: ResultadoGuardar, nombre: string, queEs: string): string => {
  switch (r) {
    case 'nueva':
      return `«${nombre}» guardada. La tendrás aquí cuando vuelvas.`;
    case 'actualizada':
      return `«${nombre}» actualizada con lo que ves ahora.`;
    case 'llena':
      return `Ya tienes ${formatNumber(MAX_RECETAS, 0)} guardadas, que es el máximo. Borra alguna para guardar esta ${queEs}, o guárdala con el nombre de una que ya tengas para sustituirla.`;
    case 'sin-almacen':
      return 'Tu navegador no deja guardar en este dispositivo (navegación privada o almacenamiento bloqueado).';
    case 'sin-nombre':
      return `Ponle un nombre a la ${queEs} para guardarla.`;
  }
};

export default function RecetasGuardadasPanel<T>({ recetas, queEs, nombreSugerido, describir }: PanelProps<T>) {
  const [nombre, setNombre] = useState('');
  const [anuncio, setAnuncio] = useState('');
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const { lista, disponible } = recetas;

  const alGuardar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elegido = nombre.trim() || nombreSugerido;
    const r = recetas.guardar(elegido);
    setAnuncio(mensajeGuardar(r, elegido.trim().replace(/\s+/g, ' '), queEs));
    if (r === 'nueva' || r === 'actualizada') setNombre('');
  };

  const alCargar = (id: string) => {
    const receta = recetas.cargar(id);
    if (receta) setAnuncio(`«${receta.nombre}» cargada.`);
  };

  const alBorrar = (id: string) => {
    const receta = lista.find((r) => r.id === id);
    recetas.borrar(id);
    setConfirmando(null);
    if (receta) setAnuncio(`«${receta.nombre}» borrada.`);
  };

  return (
    <section className={styles.panel} aria-labelledby="mis-recetas-titulo">
      <h2 id="mis-recetas-titulo" className={styles.titulo}>
        <span aria-hidden="true">📒</span> Mis {queEs}s
      </h2>
      <p className={styles.ayuda}>
        Guarda esta {queEs} con un nombre para volver a ella otro día sin teclearla. Se queda en
        este navegador: no hay cuenta ni servidor, y no sale de tu dispositivo.
      </p>

      {disponible ? (
        <form className={styles.formulario} onSubmit={alGuardar}>
          <label htmlFor="nombre-receta" className={styles.etiqueta}>
            Nombre de la {queEs}
          </label>
          <div className={styles.fila}>
            <input
              id="nombre-receta"
              type="text"
              className={styles.input}
              value={nombre}
              maxLength={MAX_NOMBRE}
              placeholder={nombreSugerido}
              autoComplete="off"
              onChange={(e) => setNombre(e.target.value)}
            />
            <button type="submit" className={styles.btnPrimario}>
              Guardar {queEs}
            </button>
          </div>
        </form>
      ) : (
        <p className={styles.sinAlmacen}>
          Tu navegador no deja guardar en este dispositivo (navegación privada o almacenamiento
          bloqueado), así que la {queEs} se pierde al cerrar la pestaña.
        </p>
      )}

      <p className={styles.anuncio} role="status" aria-live="polite">
        {anuncio}
      </p>

      {lista.length > 0 && (
        <>
          <p className={styles.contador}>
            {formatNumber(lista.length, 0)} de {formatNumber(MAX_RECETAS, 0)} guardadas
          </p>
          <ul className={styles.lista} aria-label={`${queEs}s guardadas`}>
            {lista.map((r) => (
              <li key={r.id} className={styles.item}>
                <div className={styles.itemTexto}>
                  <strong className={styles.itemNombre}>{r.nombre}</strong>
                  <span className={styles.itemDetalle}>
                    {describir(r)} · {formatDate(new Date(r.fecha))}
                  </span>
                </div>
                <div className={styles.itemAcciones}>
                  {confirmando === r.id ? (
                    <>
                      <button
                        type="button"
                        className={styles.btnPeligro}
                        onClick={() => alBorrar(r.id)}
                        aria-label={`Confirmar: borrar ${r.nombre}`}
                      >
                        Sí, borrar
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecundario}
                        onClick={() => setConfirmando(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.btnPrimario}
                        onClick={() => alCargar(r.id)}
                        aria-label={`Cargar ${r.nombre}`}
                      >
                        Cargar
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecundario}
                        onClick={() => setConfirmando(r.id)}
                        aria-label={`Borrar ${r.nombre}`}
                      >
                        Borrar
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
