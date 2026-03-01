'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './PaisesDelMundo.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
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

      <LegalNotice />

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

      <EducationalSection
        title="Geografía Mundial: Datos y Curiosidades"
        subtitle="Récords mundiales, datos comparativos por continente y curiosidades geopolíticas de los 195 países"
        icon="🌍"
      >
        <section>
          <h4>Los récords geográficos del mundo</h4>
          <ul>
            <li><strong>🏆 País más grande</strong>: Rusia (17,1 millones km²) — equivale a casi dos veces EE.UU. o 34 veces España.</li>
            <li><strong>🔬 País más pequeño</strong>: Ciudad del Vaticano (0,44 km²) — cabe 11 veces en el Parque del Retiro de Madrid.</li>
            <li><strong>👥 Más poblado</strong>: India (1.428 millones, superó a China en 2023).</li>
            <li><strong>🏜️ Menos poblado (continente)</strong>: Nauru en Oceanía (unos 10.000 habitantes) es el estado independiente menos poblado.</li>
            <li><strong>🏔️ País más alto</strong>: Lesotho — su punto más bajo está a 1.400 m sobre el nivel del mar, completamente rodeado por Sudáfrica.</li>
            <li><strong>📐 Mayor densidad de población</strong>: Mónaco (~26.000 hab/km²), seguido de Singapur y Bahréin.</li>
            <li><strong>🌊 Mayor número de islas</strong>: Suecia (221.800 islas), seguida de Noruega y Finlandia.</li>
          </ul>
        </section>

        <section>
          <h4>Curiosidades geopolíticas</h4>
          <ul>
            <li><strong>Países sin litoral (landlocked)</strong>: 44 países no tienen acceso directo al mar. Bolivia y Paraguay son los únicos en América del Sur. Kazajistán es el país interior más grande del mundo.</li>
            <li><strong>Países dentro de otros países</strong>: San Marino y Ciudad del Vaticano están rodeados completamente por Italia. Lesotho está dentro de Sudáfrica. Se llaman «enclaves».</li>
            <li><strong>Micronaciones reconocidas</strong>: Los 195 países son los reconocidos por la ONU. Existen además Taiwán, Kosovo y otros territorios con estatus disputado.</li>
            <li><strong>El país con más países vecinos</strong>: Rusia y China comparten fronteras con 14 países distintos cada uno.</li>
            <li><strong>Países que no existen en mapas tradicionales</strong>: Sudán del Sur (independiente en 2011) es el país más joven reconocido por la ONU.</li>
            <li><strong>Monedas compartidas</strong>: El euro lo usan 20 países de la UE. El dólar estadounidense es moneda oficial en 11 países además de EE.UU.</li>
          </ul>
        </section>

        <section>
          <h4>Los 5 continentes en cifras</h4>
          <ul>
            <li><strong>🌍 África</strong>: 54 países, 1.400 millones de habitantes, el continente con mayor crecimiento demográfico. Nigeria será el 3.er país más poblado del mundo en 2050.</li>
            <li><strong>🌏 Asia</strong>: 49 países, 4.700 millones de habitantes (60% de la humanidad). Incluye las dos civilizaciones más antiguas continuas (China e India) y el país con la economía que más rápido creció en el siglo XXI.</li>
            <li><strong>🌎 América</strong>: 35 países, 1.000 millones de habitantes. Brasil es el 5.º país más grande del mundo y tiene el mayor número de hablantes de portugués.</li>
            <li><strong>🌍 Europa</strong>: 44 países en apenas 10,5 millones km². Alta densidad media (~73 hab/km²). Tiene la mayor integración supranacional del mundo (UE).</li>
            <li><strong>🌏 Oceanía</strong>: 14 países. Australia ocupa el 92% del área continental. Muchos estados son pequeñas islas del Pacífico con soberanía sobre grandes zonas económicas exclusivas (ZEE).</li>
          </ul>
        </section>

        <section>
          <h4>Cómo se cuentan los países</h4>
          <p>La cifra de «195 países» tiene matices:</p>
          <ul>
            <li><strong>193 miembros de pleno derecho</strong> de la ONU + 2 estados observadores permanentes (Ciudad del Vaticano y Palestina) = 195.</li>
            <li><strong>Territorios no autónomos</strong>: Existen ~17 territorios bajo administración de otros países que la ONU considera pendientes de descolonización (Gibraltar, Nueva Caledonia, Sahara Occidental...).</li>
            <li><strong>Reconocimiento parcial</strong>: Kosovo es reconocido por 100+ países pero no por España, China o Rusia. Taiwán es reconocido formalmente por solo 12 países, aunque mantiene relaciones comerciales con casi todos.</li>
            <li><strong>Pasaportes más poderosos (2025)</strong>: Los de Singapur, Japón y Francia permiten entrar sin visa a más de 190 destinos. El más restrictivo, Afganistán, da acceso libre a menos de 30.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('paises-del-mundo')} />
      <ShareCard appName="paises-del-mundo" />
      <Footer appName="paises-del-mundo" />
    </div>
  );
}
