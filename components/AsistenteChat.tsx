'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { applicationsDatabase } from '@/data/applications';
import { implementedAppsUrls } from '@/data/implemented-apps';
import styles from './AsistenteChat.module.css';

// Solo apps implementadas, instancia compartida
const appsImplementadas = applicationsDatabase.filter((app) =>
  implementedAppsUrls.includes(app.url)
);

const fuseAsistente = new Fuse(appsImplementadas, {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'keywords', weight: 0.2 },
    { name: 'suites', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
});

export default function AsistenteChat() {
  const [consulta, setConsulta] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const resultados = useMemo(() => {
    if (consulta.trim().length < 2) return [];
    return fuseAsistente.search(consulta.trim()).slice(0, 5);
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
          placeholder="Describe lo que necesitas..."
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
          {resultados.map(({ item }) => (
            <a key={item.url} href={item.url} className={styles.appCard}>
              <span className={styles.appCardIcon}>{item.icon}</span>
              <div className={styles.appCardBody}>
                <div className={styles.appCardName}>{item.name}</div>
                <div className={styles.appCardDesc}>{item.description}</div>
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
