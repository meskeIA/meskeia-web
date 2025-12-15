'use client';

import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';
import { Application, applicationsDatabase, moments } from '@/data/applications';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  large?: boolean;
}

export default function SearchBar({ large = false }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<Application>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchInputLargeRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inlineContainerRef = useRef<HTMLDivElement>(null);

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
      // Ctrl+K o Cmd+K para enfocar búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (large) {
          searchInputLargeRef.current?.focus();
        } else {
          openSearch();
        }
      }

      // ESC para cerrar
      if (e.key === 'Escape') {
        if (large) {
          setShowDropdown(false);
          setQuery('');
          setResults([]);
          searchInputLargeRef.current?.blur();
        } else {
          closeSearch();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [large]);

  // Cerrar dropdown inline al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Para modo modal
      if (
        !large &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        closeSearch();
      }
      // Para modo inline
      if (
        large &&
        inlineContainerRef.current &&
        !inlineContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (isOpen || showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, showDropdown, large]);

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
      if (large) setShowDropdown(false);
      return;
    }

    const searchResults = fuse.current.search(searchQuery.trim());
    setResults(searchResults.slice(0, 6)); // Máximo 6 resultados
    setSelectedIndex(-1);
    if (large) setShowDropdown(true);
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

  const handleResultClick = () => {
    if (large) {
      setShowDropdown(false);
      setQuery('');
      setResults([]);
    } else {
      closeSearch();
    }
  };

  // Renderizar resultados (compartido entre modal e inline)
  const renderResults = () => (
    <>
      {results.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <p>No se encontraron aplicaciones</p>
          <p className={styles.noResultsHint}>
            Intenta con otras palabras clave
          </p>
        </div>
      ) : (
        results.map((result, index) => {
          const appMoments = result.item.contexts?.map(contextId =>
            moments.find(m => m.id === contextId)
          ).filter(Boolean) || [];

          return (
            <a
              key={index}
              href={result.item.url}
              className={`${styles.resultItem} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={handleResultClick}
            >
              <div className={styles.resultIcon}>{result.item.icon}</div>
              <div className={styles.resultContent}>
                <div className={styles.resultTitle}>
                  {result.item.name}
                </div>
                <div className={styles.resultDescription}>
                  {result.item.description}
                </div>
                <div className={styles.resultMeta}>
                  <span className={styles.resultCategory}>
                    {result.item.category}
                  </span>
                  {appMoments.length > 0 && (
                    <span className={styles.resultMoments}>
                      {appMoments.map(m => m?.icon).join(' ')}
                    </span>
                  )}
                </div>
              </div>
            </a>
          );
        })
      )}
    </>
  );

  return (
    <>
      {/* ===== VERSIÓN GRANDE (INLINE) ===== */}
      {large && (
        <div className={styles.inlineSearchWrapper} ref={inlineContainerRef}>
          <div className={`${styles.searchLarge} ${showDropdown ? styles.searchLargeActive : ''}`}>
            <span className={styles.searchLargeIcon}>🔍</span>
            <input
              ref={searchInputLargeRef}
              type="text"
              className={styles.searchLargeInput}
              placeholder="Buscar aplicaciones..."
              value={query}
              onChange={(e) => performSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
            />
            {query.length > 0 ? (
              <button
                className={styles.searchLargeClear}
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setShowDropdown(false);
                  searchInputLargeRef.current?.focus();
                }}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            ) : (
              <kbd className={styles.searchLargeKbd}>Ctrl+K</kbd>
            )}
          </div>

          {/* Dropdown de resultados inline */}
          {showDropdown && query.length >= 2 && (
            <div className={styles.inlineDropdown}>
              <div className={styles.inlineResults}>
                {renderResults()}
              </div>
              <div className={styles.inlineFooter}>
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
          )}
        </div>
      )}

      {/* ===== VERSIÓN PEQUEÑA (MODAL) ===== */}
      {!large && !isOpen && (
        <button type="button" className={styles.searchToggle} onClick={openSearch}>
          <span className={styles.searchIcon}>🔍</span>
          <span className={styles.searchHint}>Buscar</span>
          <kbd className={styles.searchKbd}>Ctrl+K</kbd>
        </button>
      )}

      {/* Modal de búsqueda (solo para versión pequeña) */}
      {!large && isOpen && (
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
              <button type="button" className={styles.searchClose} onClick={closeSearch}>
                ✕
              </button>
            </div>

            {/* Resultados */}
            {query.length >= 2 && (
              <div className={styles.searchResults}>
                {renderResults()}
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
