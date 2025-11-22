'use client';

import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';
import { Application, applicationsDatabase } from '@/data/applications';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<Application>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Configurar Fuse.js
  const fuse = useRef(
    new Fuse(applicationsDatabase, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'keywords', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    })
  );

  // Atajo de teclado Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K o Cmd+K para abrir búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }

      // ESC para cerrar
      if (e.key === 'Escape') {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        closeSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  };

  const performSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const searchResults = fuse.current.search(searchQuery.trim());
    setResults(searchResults.slice(0, 5)); // Máximo 5 resultados
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;

      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = results[selectedIndex].item.url;
        }
        break;
    }
  };

  return (
    <>
      {/* Botón de búsqueda (solo visible cuando está cerrado) */}
      {!isOpen && (
        <button className={styles.searchToggle} onClick={openSearch}>
          <span className={styles.searchIcon}>🔍</span>
          <span className={styles.searchHint}>Buscar</span>
          <kbd className={styles.searchKbd}>Ctrl+K</kbd>
        </button>
      )}

      {/* Contenedor de búsqueda */}
      {isOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <div className={styles.searchHeader}>
              <span className={styles.searchIconLarge}>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Buscar aplicaciones..."
                value={query}
                onChange={(e) => performSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className={styles.searchClose} onClick={closeSearch}>
                ✕
              </button>
            </div>

            {/* Resultados */}
            {query.length >= 2 && (
              <div className={styles.searchResults}>
                {results.length === 0 ? (
                  <div className={styles.noResults}>
                    <div className={styles.noResultsIcon}>🔍</div>
                    <p>No se encontraron aplicaciones</p>
                    <p className={styles.noResultsHint}>
                      Intenta con otras palabras clave
                    </p>
                  </div>
                ) : (
                  results.map((result, index) => (
                    <a
                      key={index}
                      href={result.item.url}
                      className={`${styles.resultItem} ${
                        index === selectedIndex ? styles.selected : ''
                      }`}
                      onClick={closeSearch}
                    >
                      <div className={styles.resultIcon}>{result.item.icon}</div>
                      <div className={styles.resultContent}>
                        <div className={styles.resultTitle}>
                          {result.item.name}
                        </div>
                        <div className={styles.resultDescription}>
                          {result.item.description}
                        </div>
                        <div className={styles.resultCategory}>
                          {result.item.category}
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            )}

            {/* Footer con hints */}
            <div className={styles.searchFooter}>
              <div className={styles.searchHints}>
                <span>
                  <kbd>↑</kbd>
                  <kbd>↓</kbd> navegar
                </span>
                <span>
                  <kbd>Enter</kbd> seleccionar
                </span>
                <span>
                  <kbd>Esc</kbd> cerrar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
