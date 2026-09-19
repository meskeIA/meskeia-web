'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import MiniSearch from 'minisearch';
import { Application, applicationsDatabase } from '@/data/applications';
import { implementedAppsUrls } from '@/data/implemented-apps';
import { withFrom } from '@/lib/trackingFrom';
import styles from './AsistenteChat.module.css';

type AppDoc = Application & { id: string };
type AppResult = { id: string; score: number; name: string; description: string; icon: string; url: string };

const appsImplementadas = applicationsDatabase.filter((app) =>
  implementedAppsUrls.includes(app.url)
);

const indiceAsistente = new MiniSearch<AppDoc>({
  idField: 'id',
  fields: ['name', 'description', 'keywords', 'suites'],
  storeFields: ['name', 'description', 'icon', 'url'],
  extractField: (document, fieldName) => {
    const val = (document as unknown as Record<string, unknown>)[fieldName];
    if (Array.isArray(val)) return val.join(' ');
    return String(val ?? '');
  },
  searchOptions: {
    boost: { name: 3, keywords: 2, description: 1.5 },
    fuzzy: 0.2,
    prefix: true,
  },
});
indiceAsistente.addAll(appsImplementadas.map(app => ({ ...app, id: app.url })));

/**
 * ⚠️ ESTE es el buscador de la portada, y desde el 19/09/2026 el único del sitio
 * junto al del propio catálogo (/apps/). Sus enlaces salían SIN marca de origen, así
 * que sus clics no se registraban en ninguna parte y `from=search` marcaba 0 en 90
 * días — leído como "nadie usa el buscador" cuando en realidad era "nadie lo mide"
 * (corregido el 07/08/2026 con `from=home-search`).
 *
 * El origen conserva el nombre `home-search` aunque ya no haya un `search` del que
 * separarlo: renombrarlo partiría la serie histórica en dos.
 *
 * ⚠️ `storeFields` NO incluye `suites`, y no es casualidad: `extractField` aplana
 * los arrays con `join(' ')` y MiniSearch usa ESE MISMO extractor también para los
 * campos almacenados, así que un `suites` guardado vuelve como cadena, no como
 * array. El modal Ctrl+K de `SearchBar` sí lo guardaba y pintaba sus iconos con
 * `result.suites.map(...)`: reventaba la página entera con
 * `TypeError: suites.map is not a function` cada vez que alguien buscaba algo.
 * Estuvo así desde el 26/04/2026 (f2465ae8, migración Fuse.js -> MiniSearch) hasta
 * que se retiró el buscador el 19/09/2026. Si algún día se añade un campo de array
 * a `storeFields`, hay que leerlo como cadena o darle su propio extractor.
 */
export default function AsistenteChat() {
  const [consulta, setConsulta] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const resultados = useMemo((): AppResult[] => {
    if (consulta.trim().length < 2) return [];
    return indiceAsistente.search(consulta.trim()).slice(0, 5) as unknown as AppResult[];
  }, [consulta]);

  // Mensaje para el aria-live: silencio mientras la consulta es demasiado corta
  const mensajeAria = useMemo(() => {
    if (consulta.trim().length < 2) return '';
    if (resultados.length === 0) return 'No se encontraron aplicaciones';
    return `${resultados.length} ${resultados.length === 1 ? 'aplicación encontrada' : 'aplicaciones encontradas'}`;
  }, [consulta, resultados]);

  const limpiar = () => {
    setConsulta('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.chat}>
      {/* Anuncia el número de resultados a lectores de pantalla */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {mensajeAria}
      </div>

      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Buscar aplicaciones..."
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          aria-label="Describe lo que necesitas"
        />
        {consulta && (
          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={limpiar}
            aria-label="Borrar búsqueda"
            title="Borrar"
          >
            ✕
          </button>
        )}
      </div>

      {resultados.length > 0 && (
        <div className={styles.appCards}>
          {resultados.map((result) => (
            <a key={result.url} href={withFrom(result.url, 'home-search')} className={styles.appCard}>
              <span className={styles.appCardIcon}>{result.icon}</span>
              <div className={styles.appCardBody}>
                <div className={styles.appCardName}>{result.name}</div>
                <div className={styles.appCardDesc}>{result.description}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      {consulta.trim().length >= 2 && resultados.length === 0 && (
        <p className={styles.sinResultados}>
          No hemos encontrado apps relacionadas. Prueba con otras palabras.
        </p>
      )}
    </div>
  );
}
