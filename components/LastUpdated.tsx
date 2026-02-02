'use client';

import { useState } from 'react';
import styles from './LastUpdated.module.css';

interface ChangelogEntry {
  date: string; // Formato: YYYY-MM-DD
  changes: string[];
}

interface LastUpdatedProps {
  lastUpdate: string; // Fecha en formato legible (ej: "2 de febrero de 2026")
  changelog?: ChangelogEntry[]; // Opcional: historial de cambios
  showChangelog?: boolean; // Mostrar botón de changelog
}

export default function LastUpdated({
  lastUpdate,
  changelog = [],
  showChangelog = false,
}: LastUpdatedProps) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
  };

  return (
    <div className={styles.lastUpdatedContainer}>
      <div className={styles.lastUpdatedInfo}>
        <span className={styles.icon} aria-hidden="true">🔄</span>
        <span className={styles.text}>
          <strong>Última actualización:</strong> {lastUpdate}
        </span>
        {showChangelog && changelog.length > 0 && (
          <button
            type="button"
            className={styles.changelogButton}
            onClick={() => setIsChangelogOpen(!isChangelogOpen)}
            aria-expanded={isChangelogOpen}
            aria-label={isChangelogOpen ? 'Ocultar historial de cambios' : 'Ver historial de cambios'}
          >
            {isChangelogOpen ? '▼' : '▶'} Ver historial
          </button>
        )}
      </div>

      {isChangelogOpen && changelog.length > 0 && (
        <div className={styles.changelogList}>
          <h4 className={styles.changelogTitle}>Historial de actualizaciones</h4>
          {changelog.map((entry, index) => (
            <div key={index} className={styles.changelogEntry}>
              <div className={styles.changelogDate}>{formatDate(entry.date)}</div>
              <ul className={styles.changelogChanges}>
                {entry.changes.map((change, idx) => (
                  <li key={idx}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
