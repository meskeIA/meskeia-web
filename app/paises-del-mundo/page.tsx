'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './PaisesDelMundo.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  countries,
  Country,
  getContinents,
  searchCountries,
  formatPopulation,
  formatArea
} from '@/data/countries';

// Importar estilos de flag-icons
import 'flag-icons/css/flag-icons.min.css';

// Componente Flag que usa flag-icons
interface FlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function Flag({ code, size = 'md', className = '' }: FlagProps) {
  const sizeClasses = {
    sm: styles.flagSm,
    md: styles.flagMd,
    lg: styles.flagLg,
    xl: styles.flagXl,
  };

  return (
    <span
      className={`fi fi-${code} ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`Bandera de ${code.toUpperCase()}`}
    />
  );
}

export default function PaisesDelMundoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('Todos');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const continents = useMemo(() => ['Todos', ...getContinents()], []);

  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery, selectedContinent);
  }, [searchQuery, selectedContinent]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSearchQuery(country.name);
    setIsDropdownOpen(false);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    if (selectedCountry && e.target.value !== selectedCountry.name) {
      setSelectedCountry(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCountry(null);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🌍</span>
        <h1 className={styles.title}>Países del Mundo</h1>
        <p className={styles.subtitle}>
          Explora los 195 países del mundo con sus capitales, banderas, monedas e información clave
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de búsqueda */}
        <div className={styles.searchPanel}>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Buscar país o capital..."
                className={styles.searchInput}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={styles.clearButton}
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown de resultados */}
            {isDropdownOpen && filteredCountries.length > 0 && !selectedCountry && (
              <div ref={dropdownRef} className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  {filteredCountries.length} {filteredCountries.length === 1 ? 'país encontrado' : 'países encontrados'}
                </div>
                <ul className={styles.dropdownList}>
                  {filteredCountries.map((country) => (
                    <li
                      key={country.name}
                      onClick={() => handleSelectCountry(country)}
                      className={styles.dropdownItem}
                    >
                      <Flag code={country.code} size="md" className={styles.dropdownFlag} />
                      <div className={styles.dropdownInfo}>
                        <span className={styles.dropdownName}>{country.name}</span>
                        <span className={styles.dropdownCapital}>{country.capital}</span>
                      </div>
                      <span className={styles.dropdownContinent}>{country.continent}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Filtro por continente */}
          <div className={styles.filterContainer}>
            <label className={styles.filterLabel}>Filtrar por continente:</label>
            <div className={styles.filterButtons}>
              {continents.map((continent) => (
                <button
                  key={continent}
                  onClick={() => {
                    setSelectedContinent(continent);
                    setSelectedCountry(null);
                    setSearchQuery('');
                  }}
                  className={`${styles.filterButton} ${selectedContinent === continent ? styles.filterButtonActive : ''}`}
                >
                  {continent}
                </button>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{countries.length}</span>
              <span className={styles.statLabel}>Países</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{getContinents().length}</span>
              <span className={styles.statLabel}>Continentes</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{filteredCountries.length}</span>
              <span className={styles.statLabel}>Mostrando</span>
            </div>
          </div>
        </div>

        {/* Card del país seleccionado */}
        {selectedCountry ? (
          <div className={styles.countryCard}>
            <div className={styles.cardHeader}>
              <Flag code={selectedCountry.code} size="xl" className={styles.cardFlag} />
              <div className={styles.cardTitleGroup}>
                <h2 className={styles.cardTitle}>{selectedCountry.name}</h2>
                <span className={styles.cardContinent}>{selectedCountry.continent}</span>
              </div>
            </div>

            <div className={styles.cardGrid}>
              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>🏛️</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Capital</span>
                  <span className={styles.cardValue}>{selectedCountry.capital}</span>
                </div>
              </div>

              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>👥</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Población</span>
                  <span className={styles.cardValue}>{formatPopulation(selectedCountry.population)}</span>
                </div>
              </div>

              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>📐</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Superficie</span>
                  <span className={styles.cardValue}>{formatArea(selectedCountry.area)}</span>
                </div>
              </div>

              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>💰</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Moneda</span>
                  <span className={styles.cardValue}>{selectedCountry.currency} ({selectedCountry.currencySymbol})</span>
                </div>
              </div>

              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>🗣️</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Idioma oficial</span>
                  <span className={styles.cardValue}>{selectedCountry.language}</span>
                </div>
              </div>

              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>📞</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Prefijo telefónico</span>
                  <span className={styles.cardValue}>{selectedCountry.phoneCode}</span>
                </div>
              </div>

              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>🕐</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Huso horario</span>
                  <span className={styles.cardValue}>{selectedCountry.timezone}</span>
                </div>
              </div>

              <div className={styles.cardItem}>
                <span className={styles.cardIcon}>🌐</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>Dominio internet</span>
                  <span className={styles.cardValue}>{selectedCountry.tld}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <a
                href={`https://www.google.com/maps/place/${encodeURIComponent(selectedCountry.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapButton}
              >
                🗺️ Ver en mapa
              </a>
              <button
                onClick={clearSearch}
                className={styles.backButton}
              >
                ← Buscar otro país
              </button>
            </div>
          </div>
        ) : (
          /* Vista de lista cuando no hay país seleccionado */
          <div className={styles.countriesGrid}>
            <h3 className={styles.gridTitle}>
              {selectedContinent === 'Todos'
                ? 'Todos los países'
                : `Países de ${selectedContinent}`}
            </h3>
            <div className={styles.gridList}>
              {filteredCountries.map((country) => (
                <button
                  key={country.name}
                  onClick={() => handleSelectCountry(country)}
                  className={styles.gridItem}
                >
                  <Flag code={country.code} size="md" className={styles.gridFlag} />
                  <span className={styles.gridName}>{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <RelatedApps apps={getRelatedApps('paises-del-mundo')} />
      <Footer appName="paises-del-mundo" />
    </div>
  );
}
