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

        <section>
          <h3>📊 Los 5 Continentes: Comparativa Completa</h3>
          <p>Datos actualizados de los 5 grandes continentes habitados del planeta:</p>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Continente</th>
                  <th>Países</th>
                  <th>Población (2024)</th>
                  <th>Superficie</th>
                  <th>Densidad</th>
                  <th>País más poblado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🌍 África</strong></td>
                  <td>54</td>
                  <td>1.460 millones</td>
                  <td>30,4 M km²</td>
                  <td>~48 hab/km²</td>
                  <td>Nigeria (223 M)</td>
                </tr>
                <tr>
                  <td><strong>🌏 Asia</strong></td>
                  <td>49</td>
                  <td>4.750 millones</td>
                  <td>44,6 M km²</td>
                  <td>~107 hab/km²</td>
                  <td>India (1.428 M)</td>
                </tr>
                <tr>
                  <td><strong>🌎 América</strong></td>
                  <td>35</td>
                  <td>1.040 millones</td>
                  <td>42,5 M km²</td>
                  <td>~24 hab/km²</td>
                  <td>EE.UU. (340 M)</td>
                </tr>
                <tr>
                  <td><strong>🌍 Europa</strong></td>
                  <td>44</td>
                  <td>745 millones</td>
                  <td>10,5 M km²</td>
                  <td>~71 hab/km²</td>
                  <td>Rusia (144 M)</td>
                </tr>
                <tr>
                  <td><strong>🌏 Oceanía</strong></td>
                  <td>14</td>
                  <td>46 millones</td>
                  <td>8,5 M km²</td>
                  <td>~5 hab/km²</td>
                  <td>Australia (26 M)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 ¿Para Qué Necesitas Conocer los Países del Mundo?</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎓</span>
              <h4>Estudios de Geografía</h4>
              <p>Preparar exámenes, proyectos escolares y concursos de cultura general. Conocer capitales, banderas, idiomas y datos clave de cada país del mundo.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>✈️</span>
              <h4>Viajes Internacionales</h4>
              <p>Antes de viajar: prefijo telefónico, moneda local, zona horaria, idioma oficial, dominio de internet (.es, .fr...) y ubicación en el mapa para planificar tu ruta.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🌐</span>
              <h4>Geopolítica y Negocios</h4>
              <p>Identificar mercados emergentes, entender relaciones entre países vecinos, analizar bloques económicos (UE, ASEAN, Mercosur) y evaluar riesgos geopolíticos.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>📚</span>
              <h4>Educación Escolar</h4>
              <p>Herramienta ideal para docentes y estudiantes de primaria a bachillerato. Busca cualquier país y obtén sus datos básicos de forma rápida y fiable para trabajos y presentaciones.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre los Países del Mundo</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Por qué hay exactamente 195 países y no otra cifra?</summary>
              <p className={styles.eduFaqAnswer}>Los <strong>193 miembros de pleno derecho de la ONU</strong> más los 2 estados observadores permanentes (Ciudad del Vaticano y Palestina) suman 195. El número cambia históricamente: en 1945 había 51 miembros fundadores. Cada descolonización o independencia reconocida añade un nuevo estado. El último en unirse fue Sudán del Sur (2011).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué pasó cuando se disolvió la URSS?</summary>
              <p className={styles.eduFaqAnswer}>La disolución de la URSS en 1991 creó <strong>15 nuevos países independientes</strong>: Rusia, Ucrania, Bielorrusia, las 3 repúblicas bálticas (Estonia, Letonia, Lituania), las 5 repúblicas de Asia Central (Kazajistán, Uzbekistán, Turkmenistán, Kirguistán, Tayikistán) y las 3 del Cáucaso (Georgia, Armenia, Azerbaiyán), más Moldavia. Fue el mayor cambio político del mapa mundial del siglo XX.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué son los territorios de ultramar y por qué no son países?</summary>
              <p className={styles.eduFaqAnswer}>Son territorios bajo soberanía de otro Estado pero no integrados en él. Francia tiene 13 colectividades de ultramar (Guadalupe, Martinica, Guayana Francesa, Reunión, Polinesia Francesa...). El Reino Unido tiene 14 territorios (Gibraltar, Islas Malvinas, Bermudas...). No son países independientes porque no tienen soberanía plena ni son miembros de la ONU por derecho propio.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es el país más joven del mundo?</summary>
              <p className={styles.eduFaqAnswer}><strong>Sudán del Sur</strong>, independizado de Sudán el 9 de julio de 2011 tras un referéndum. Se convirtió en el 193.º miembro de la ONU semanas después. Antes de él, el más joven era Kosovo (2008), aunque Kosovo no es miembro de la ONU por el veto de Rusia y China en el Consejo de Seguridad.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es la diferencia entre país, nación y estado?</summary>
              <p className={styles.eduFaqAnswer}><strong>Estado</strong>: entidad política con territorio, población y gobierno reconocido internacionalmente (concepto jurídico). <strong>País</strong>: término geográfico y cotidiano, prácticamente sinónimo de estado. <strong>Nación</strong>: grupo humano con identidad cultural, histórica o lingüística común, que puede o no tener su propio estado. Los kurdos son una nación sin estado propio; España es un estado multinacional (catalanes, vascos, gallegos...).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es la Zona Económica Exclusiva (ZEE) y por qué importa?</summary>
              <p className={styles.eduFaqAnswer}>La ZEE es el área marina de <strong>200 millas náuticas</strong> (~370 km) desde la costa donde un país tiene derechos exclusivos sobre recursos naturales (pesca, petróleo, gas, minerales). Algunos pequeños estados insulares del Pacífico tienen ZEEs enormes: Kiribati (3,4 M km² de ZEE) con solo 800 km² de tierra. Francia tiene la segunda mayor ZEE del mundo gracias a sus territorios de ultramar.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Por qué algunos países tienen dos capitales?</summary>
              <p className={styles.eduFaqAnswer}>Varios países dividen funciones entre ciudades: <strong>Sudáfrica</strong> tiene 3 (Pretoria ejecutiva, Ciudad del Cabo legislativa, Bloemfontein judicial). <strong>Bolivia</strong> tiene 2 (Sucre constitucional, La Paz gubernamental). <strong>Países Bajos</strong> tiene La Haya como sede de gobierno y Ámsterdam como capital constitucional. Generalmente responde a acuerdos históricos, federalismo o compromisos políticos entre regiones.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es un estado fallido?</summary>
              <p className={styles.eduFaqAnswer}>Un <strong>estado fallido</strong> (o estado frágil) es aquel que ha perdido el control efectivo sobre su territorio o no puede proveer servicios básicos a su población. Indicadores: incapacidad de recaudar impuestos, pérdida del monopolio de la violencia, colapso institucional. El Fragile States Index (FSI) clasifica anualmente a los países. Somalia, Yemen y Sudán del Sur han encabezado esta lista en años recientes. El término es debatido académicamente por sus implicaciones políticas.</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Cómo Entender la Geopolítica de un País Desconocido</h3>
          <ol className={styles.eduStepsList}>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>1</span>
              <div>
                <strong>Ubica el país en su contexto regional</strong>
                <p>¿En qué continente está? ¿Qué países son sus vecinos? Las relaciones con los países fronterizos son clave: compartir fronteras con potencias regionales o con estados en conflicto define mucho del destino de un país.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>2</span>
              <div>
                <strong>Analiza su historia reciente (últimos 100 años)</strong>
                <p>¿Fue colonia? ¿De quién? ¿Cuándo se independizó? ¿Ha tenido guerras civiles o conflictos recientes? La historia explica fronteras artificiales, tensiones étnicas, idiomas oficiales y alianzas internacionales actuales.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>3</span>
              <div>
                <strong>Identifica sus recursos naturales clave</strong>
                <p>El petróleo (Golfo Pérsico, Venezuela), los minerales críticos (cobalto en RDC, litio en el «triángulo del litio» Bolivia-Argentina-Chile) o el agua (Nilo) explican muchos conflictos geopolíticos y alianzas económicas.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>4</span>
              <div>
                <strong>Examina su sistema político</strong>
                <p>¿República o monarquía? ¿Democracia, autocracia, teocracia? ¿Federal o unitario? El tipo de gobierno determina cómo se toman las decisiones, cómo se distribuye el poder territorialmente y qué alianzas internacionales son posibles.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>5</span>
              <div>
                <strong>Consulta índices internacionales clave</strong>
                <p>PIB per cápita (riqueza), IDH (desarrollo humano del PNUD), Índice de Percepción de Corrupción (Transparencia Internacional), Fragile States Index. Estos índices dan una visión multidimensional más precisa que cualquier dato aislado.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>6</span>
              <div>
                <strong>Entiende sus alianzas y organizaciones internacionales</strong>
                <p>¿Es miembro de la UE, OTAN, ASEAN, Mercosur, UA, Liga Árabe? ¿Tiene acuerdos de libre comercio? Las membresías explican políticas económicas, compromisos de defensa y posicionamiento diplomático en conflictos globales.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Claves para Estudiar Geografía Política</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🗺️</span>
              <h4>Usa mapas físicos y políticos</h4>
              <p>Los mapas físicos (relieve, ríos, costas) explican por qué las fronteras están donde están. Las cordilleras y los ríos son las fronteras naturales más antiguas del mundo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📰</span>
              <h4>Sigue noticias internacionales</h4>
              <p>La geografía cobra vida con la actualidad. El conflicto en Ucrania, las tensiones en el Mar de China o las elecciones en África son geografía política en tiempo real.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🔢</span>
              <h4>Aprende las capitales por regiones</h4>
              <p>Es más fácil memorizar capitales agrupando por región: los países del Golfo Pérsico, los bálticos, los andinos. Los patrones regionales facilitan la memorización.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🏳️</span>
              <h4>Las banderas cuentan historias</h4>
              <p>Los colores panafricanos (rojo-amarillo-verde), los símbolos islámicos (media luna), las cruces nórdicas o las estrellas del Pacífico revelan la historia e identidad de cada nación.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📊</span>
              <h4>Compara datos entre países similares</h4>
              <p>Comparar Portugal con España, Argentina con Brasil, o Corea del Norte con Corea del Sur es más revelador que estudiar un país aislado. El contraste ilumina factores clave.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌍</span>
              <h4>Distingue idiomas de lenguas francas</h4>
              <p>El inglés es lengua oficial en 67 países, el francés en 29, el árabe en 26, el español en 21. Un idioma «oficial» no siempre es el más hablado en casa por la población.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.eduWarningBox}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <div>
              <strong>Errores comunes al estudiar geografía política</strong>
              <ul>
                <li><strong>Confundir capital con ciudad más grande</strong>: La capital no siempre es la ciudad más poblada. En Australia, la capital es Canberra (no Sídney ni Melbourne). En EE.UU., Washington D.C. (no Nueva York). En Brasil, Brasilia (no São Paulo ni Río).</li>
                <li><strong>Creer que todos los países tienen fronteras definidas</strong>: Varios países tienen disputas territoriales activas: India-Pakistán (Cachemira), Israel-Palestina, China-India (Aksai Chin), Marruecos-España (Ceuta y Melilla). Las fronteras «oficiales» dependen de qué mapa uses.</li>
                <li><strong>Mezclar reconocimiento de iure con de facto</strong>: Kosovo es reconocido por más de 100 países pero no por la ONU. Taiwán funciona como estado independiente pero solo es reconocido formalmente por 12 países. El reconocimiento diplomático y la realidad práctica pueden ser muy diferentes.</li>
                <li><strong>Asumir que el idioma oficial es el más hablado</strong>: En Suiza hay 4 idiomas oficiales. En Bolivia, 37. En Paraguay, el guaraní lo habla más gente que el español pese a ser ambos co-oficiales. El multilingüismo es la norma global, no la excepción.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('paises-del-mundo')} />
      <ShareCard appName="paises-del-mundo" />
      <Footer appName="paises-del-mundo" />
    </div>
  );
}
