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
 * ⚠️ ESTE es el buscador que se ve en la portada: SearchBar delega en él cuando
 * `large` (SearchBar.tsx). Sus enlaces salían SIN marca de origen, así que sus
 * clics no se registraban en ninguna parte y `from=search` marcaba 0 en 90 días
 * — leído como "nadie usa el buscador" cuando en realidad era "nadie lo mide"
 * (corregido el 07/08/2026 con `from=home-search`).
 *
 * El origen se llama `home-search` y no `search` para separarlo del modal Ctrl+K
 * de SearchBar, que vive en el header de las páginas estáticas y es otra
 * superficie con otro volumen.
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

  const limpiar = () => {
    setConsulta('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.chat}>
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
