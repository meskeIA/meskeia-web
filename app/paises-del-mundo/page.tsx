'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './PaisesDelMundo.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
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
          Explora los 196 países del mundo con sus capitales, banderas, monedas e información clave
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="educational"
        severity="medium"
        collapsible={true}
        context="paises-del-mundo-disclaimer"
      />

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
                <h2 className={styles.cardTitle}>{selectedCountry.name} <span className={styles.cardCode}>({selectedCountry.code.toUpperCase()})</span></h2>
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
                  <span className={styles.gridName}>{country.name} <span className={styles.gridCode}>({country.code.toUpperCase()})</span></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <EducationalSection
        title="Geografía Mundial: Datos y Curiosidades"
        subtitle="Récords mundiales, datos comparativos por continente y curiosidades geopolíticas de los 196 países"
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
            <li><strong>Reconocimiento parcial</strong>: de los 196 países de esta base de datos, 193 son miembros de pleno derecho de la ONU; Vaticano y Palestina tienen estatus de observador permanente, y Taiwán cuenta con reconocimiento formal de solo 12 países. Existen además Kosovo y otros territorios con estatus disputado no incluidos aquí.</li>
            <li><strong>El país con más países vecinos</strong>: Rusia y China comparten fronteras con 14 países distintos cada uno.</li>
            <li><strong>Países que no existen en mapas tradicionales</strong>: Sudán del Sur (independiente en 2011) es el país más joven reconocido por la ONU.</li>
            <li><strong>Monedas compartidas</strong>: El euro lo usan 20 países de la UE. El dólar estadounidense es moneda oficial en 11 países además de EE.UU.</li>
          </ul>
        </section>

        <section>
          <h4>Los 5 continentes en cifras</h4>
          <ul>
            <li><strong>🌍 África</strong>: 54 países, 1.400 millones de habitantes, el continente con mayor crecimiento demográfico. Nigeria será el 3.er país más poblado del mundo en 2050.</li>
            <li><strong>🌏 Asia</strong>: 48 países, 4.700 millones de habitantes (60% de la humanidad). Incluye las dos civilizaciones más antiguas continuas (China e India) y el país con la economía que más rápido creció en el siglo XXI.</li>
            <li><strong>🌎 América</strong>: 35 países, 1.000 millones de habitantes. Brasil es el 5.º país más grande del mundo y tiene el mayor número de hablantes de portugués.</li>
            <li><strong>🌍 Europa</strong>: 45 países en apenas 10,5 millones km². Alta densidad media (~73 hab/km²). Tiene la mayor integración supranacional del mundo (UE).</li>
            <li><strong>🌏 Oceanía</strong>: 14 países. Australia ocupa el 92% del área continental. Muchos estados son pequeñas islas del Pacífico con soberanía sobre grandes zonas económicas exclusivas (ZEE).</li>
          </ul>
        </section>

        <section>
          <h4>Cómo se cuentan los países</h4>
          <p>La cifra de «196 países» de esta base de datos tiene matices:</p>
          <ul>
            <li><strong>193 miembros de pleno derecho</strong> de la ONU + 2 estados observadores permanentes (Ciudad del Vaticano y Palestina) + Taiwán = 196.</li>
            <li><strong>Territorios no autónomos</strong>: Existen ~17 territorios bajo administración de otros países que la ONU considera pendientes de descolonización (Gibraltar, Nueva Caledonia, Sahara Occidental...).</li>
            <li><strong>Reconocimiento parcial</strong>: Taiwán es reconocido formalmente por solo 12 países, aunque mantiene relaciones comerciales con casi todos. Kosovo, reconocido por 100+ países pero no por España, China o Rusia, no está incluido en esta base de datos.</li>
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
              <summary className={styles.eduFaqQuestion}>¿Por qué hay exactamente 196 países y no otra cifra?</summary>
              <p className={styles.eduFaqAnswer}>Los <strong>193 miembros de pleno derecho de la ONU</strong> más los 2 estados observadores permanentes (Ciudad del Vaticano y Palestina) suman 195; esta base de datos añade además Taiwán, totalizando 196. El número cambia históricamente: en 1945 había 51 miembros fundadores. Cada descolonización o independencia reconocida añade un nuevo estado. El último en unirse a la ONU fue Sudán del Sur (2011).</p>
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

        {/* ── SECCIÓN 1: Tabla Comparativa Continentes (patrón v2.0) ── */}
        <section>
          <h3>📊 Los 5 Continentes: Ficha Comparativa Completa</h3>
          <p>Comparativa detallada de los cinco continentes habitados, con récords, países destacados y datos de curiosidad:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Continente</th>
                  <th>N.º países</th>
                  <th>Superficie total</th>
                  <th>Población (2024)</th>
                  <th>País más grande</th>
                  <th>País más pequeño</th>
                  <th>Dato curioso</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🌍 Europa</strong></td>
                  <td>44</td>
                  <td>10,5 M km²</td>
                  <td>745 millones</td>
                  <td>Rusia (17,1 M km²)</td>
                  <td>Vaticano (0,44 km²)</td>
                  <td>La UE agrupa 27 países con moneda y fronteras comunes</td>
                </tr>
                <tr>
                  <td><strong>🌏 Asia</strong></td>
                  <td>49</td>
                  <td>44,6 M km²</td>
                  <td>4.750 millones</td>
                  <td>Rusia (parte asiática)</td>
                  <td>Maldivas (298 km²)</td>
                  <td>El 60 % de la humanidad vive aquí; alberga 7 de las 10 ciudades más pobladas</td>
                </tr>
                <tr>
                  <td><strong>🌎 América</strong></td>
                  <td>35</td>
                  <td>42,5 M km²</td>
                  <td>1.040 millones</td>
                  <td>Canadá (10 M km²)</td>
                  <td>San Cristóbal y Nieves (261 km²)</td>
                  <td>El español es el idioma más hablado en todo el continente</td>
                </tr>
                <tr>
                  <td><strong>🌍 África</strong></td>
                  <td>54</td>
                  <td>30,4 M km²</td>
                  <td>1.460 millones</td>
                  <td>Argelia (2,4 M km²)</td>
                  <td>Seychelles (455 km²)</td>
                  <td>Tiene el mayor número de países del mundo; Nigeria superará a EE.UU. en población antes de 2050</td>
                </tr>
                <tr>
                  <td><strong>🌏 Oceanía</strong></td>
                  <td>14</td>
                  <td>8,5 M km²</td>
                  <td>46 millones</td>
                  <td>Australia (7,7 M km²)</td>
                  <td>Nauru (21 km²)</td>
                  <td>Australia ocupa el 92 % del área continental; Nauru es el estado insular más pequeño del mundo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso — 4 perfiles (patrón v2.0) ── */}
        <section>
          <h3>🎯 ¿Quién Usa el Buscador de Países del Mundo?</h3>
          <p>Cuatro perfiles que sacan el máximo partido a esta herramienta:</p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h4>Estudiante — Preparando examen de geografía</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Examen de geografía mundial en 2 semanas. Necesita repasar las 196 capitales, identificar banderas y conocer datos básicos por continente.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo usarlo:</strong> Filtra por continente, haz clic en cada país para ver capital, prefijo y moneda. Repasa en grupos de 10 países hasta cubrir el mapa completo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>✈️</span>
                <h4>Viajero — Investigando destinos antes del viaje</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Planea un viaje por el Sudeste Asiático. Necesita saber la moneda local, el prefijo telefónico, la zona horaria y el dominio de internet de cada país.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo usarlo:</strong> Busca cada país en el buscador y consulta en segundos prefijo (+66 Tailandia), moneda (Baht, ฿), zona horaria (UTC+7) y dominio .th para SIMs locales.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📰</span>
                <h4>Periodista — Contextualizando noticias internacionales</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Redacta una noticia sobre un conflicto en un país del que recibe pocas búsquedas. Necesita datos básicos para contextualizar a sus lectores.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo usarlo:</strong> Busca el país, obtén superficie, población, capital y continente en segundos. Usa el enlace «Ver en mapa» para capturar la ubicación geográfica exacta.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏆</span>
                <h4>Concursante de trivial — Mejorar cultura general</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Participa en un concurso de cultura general y suele fallar preguntas de geografía: capitales poco conocidas, banderas similares y datos de países pequeños.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cómo usarlo:</strong> Practica con los países menos conocidos (Surinam, Bután, Yibuti, Vanuatu). Memoriza sus capitales y banderas. Los países con nombres confusos son los más frecuentes en trivial.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ — 8 preguntas (patrón v2.0) ── */}
        <section>
          <h3>❓ Preguntas Frecuentes: Récords y Curiosidades Mundiales</h3>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>¿Cuántos países hay exactamente en el mundo?</summary>
              <p>Esta base de datos incluye <strong>196 países y territorios</strong>: 193 miembros de pleno derecho de la ONU, los 2 estados observadores permanentes (Ciudad del Vaticano y Palestina) y Taiwán. La cifra varía según la fuente: los organismos internacionales suelen citar 193 (solo miembros ONU) o 195 (+ Vaticano y Palestina); algunos atlas añaden también Taiwán o Kosovo según el criterio de reconocimiento aplicado. Sudán del Sur (2011) es el estado reconocido más recientemente por la ONU.</p>
              <p className={styles.faqTip}>Dato extra: en 1945, la ONU se fundó con solo 51 estados miembros.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuál es el país más grande del mundo?</summary>
              <p><strong>Rusia</strong>, con 17,1 millones de km² — el 11 % de la superficie terrestre del planeta. Es tan grande que abarca 11 zonas horarias distintas. El segundo más grande es Canadá (10 M km²) y el tercero EE.UU. (9,8 M km²). Si Rusia fuera un continente, sería el más grande después de Asia.</p>
              <p className={styles.faqTip}>Dato extra: el lago Baikal, en Siberia (Rusia), contiene el 20 % del agua dulce superficial del planeta.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuál es el país más pequeño del mundo?</summary>
              <p><strong>Ciudad del Vaticano</strong>, con apenas 0,44 km² dentro de Roma. Es tan pequeño que cabe 11 veces en el Parque del Retiro de Madrid. El segundo más pequeño es Mónaco (2,02 km²) y el tercero San Marino (61 km²). El Vaticano tiene su propio estado, gobierno, banco, correos y radiodifusora.</p>
              <p className={styles.faqTip}>Dato extra: el Vaticano es el único estado del mundo donde el latín es idioma oficial de trabajo.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué países tienen más idiomas oficiales?</summary>
              <p><strong>Bolivia lidera con 37 idiomas co-oficiales</strong> (español + 36 lenguas indígenas). Zimbabwe tiene 16, Sudáfrica 11 (incluido el zulú y el xhosa), India 22 y Suiza 4 (alemán, francés, italiano y romanche). España no tiene idiomas co-oficiales a nivel nacional, aunque el catalán, euskera y gallego tienen estatus oficial en sus respectivas comunidades.</p>
              <p className={styles.faqTip}>Dato extra: Papua Nueva Guinea tiene más de 800 lenguas habladas, aunque no todas son oficiales.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuál es la ciudad más poblada del mundo?</summary>
              <p><strong>Tokio (Japón)</strong> es la aglomeración urbana más grande, con ~37 millones de habitantes en su área metropolitana. Le siguen Delhi (India, ~33 M), Shanghái (China, ~29 M) y Dhaka (Bangladés, ~22 M). Por ciudad administrativa estricta, Chongqing (China) puede superar esas cifras según cómo se delimiten sus fronteras municipales.</p>
              <p className={styles.faqTip}>Dato extra: Lagos (Nigeria) podría superar a Tokio como ciudad más poblada antes de 2100 si se mantienen las tasas de crecimiento actuales.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué países no pertenecen a la ONU?</summary>
              <p>Solo <strong>2 estados soberanos reconocidos no son miembros de pleno derecho de la ONU</strong>: Ciudad del Vaticano y Palestina (ambos son estados observadores). Taiwán fue expulsado en 1971 cuando la República Popular China ocupó su asiento. Kosovo, reconocido por más de 100 países, no es miembro por el veto de Rusia y China en el Consejo de Seguridad.</p>
              <p className={styles.faqTip}>Dato extra: las Islas Cook y Niue son estados soberanos que tampoco son miembros de la ONU, aunque participan en agencias especializadas.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuál es el país más visitado turísticamente?</summary>
              <p><strong>Francia</strong> ha encabezado el ranking de turismo internacional durante décadas, con ~90 millones de visitantes en 2023. Le siguen España (~85 M), EE.UU. (~77 M) y Turquía (~57 M). España es el segundo destino mundial pero el primero en ingresos por turista. El Mediterráneo concentra 6 de los 10 países más visitados del mundo.</p>
              <p className={styles.faqTip}>Dato extra: Tailandia (~28 M visitantes) es el país más visitado de Asia y una de las economías más dependientes del turismo del mundo.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué países tienen 2 o más capitales?</summary>
              <p>Varios países dividen sus funciones de capital entre ciudades: <strong>Sudáfrica tiene 3</strong> (Pretoria ejecutiva, Ciudad del Cabo legislativa, Bloemfontein judicial). Bolivia tiene 2 (Sucre constitucional, La Paz gubernamental). Países Bajos: Ámsterdam es la capital constitucional pero La Haya es la sede del gobierno y el parlamento. En Malasia, Kuala Lumpur es la capital oficial pero Putrajaya alberga el gobierno federal desde 1999.</p>
              <p className={styles.faqTip}>Dato extra: Nauru es el único país del mundo que no tiene una capital oficial designada; Yaren actúa como capital de facto.</p>
            </details>
          </div>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso — 7 pasos (patrón v2.0) ── */}
        <section>
          <h3>📋 Método para Aprender la Geografía Mundial en 4-8 Semanas</h3>
          <p>Sigue este método sistemático por continente para memorizar los 196 países y sus capitales de forma duradera:</p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Semana 1 — Europa (44 países): empieza por lo más familiar</strong>
                <p>Europa es el continente con más reconocimiento previo para los hispanohablantes. Divide en 4 grupos: Europa occidental (8), Europa del norte (5), Europa del este (10), Balcanes y mediterráneo (21). Memoriza primero los países del G-7 europeo (Alemania, Francia, Italia, España, Países Bajos, Bélgica, Suecia) y luego expande.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Semana 2 — América (35 países): del norte al sur por la costa</strong>
                <p>Sigue el eje norte-sur: EE.UU. y Canadá → México → Centroamérica (7 países) → Caribe (13 estados insulares) → América del Sur (12 países). Los países caribeños son los más difíciles: aprende sus capitales agrupándolos por isla grande (Cuba-Haití-República Dominicana en La Española, por ejemplo).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Semana 3 — África (54 países): el continente más complejo</strong>
                <p>Divide en 5 regiones: Norte (5), Oeste (16), Centro (8), Este (13), Sur (13). El norte es el más conocido (Marruecos, Egipto, Libia, Argelia, Túnez). Empieza por ahí y avanza hacia el sur. Usa el río Congo, el lago Victoria y la cordillera del Rift como referencia geográfica para ubicar los países del centro y este.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Semana 4-5 — Asia (49 países): el continente más diverso</strong>
                <p>Divide en regiones: Oriente Medio (16), Asia Central (5 «-istanes»), Asia del Sur (8), Asia del Sudeste (11), Asia del Este (6). Los 5 «-istanes» de Asia Central (Kazajistán, Uzbekistán, Turkmenistán, Kirguistán, Tayikistán) son los más confundidos: aprende que todos tienen «Astana/Nur-Sultan, Tashkent, Ashgabat, Bishkek, Dushanbe» como capitales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Semana 6 — Oceanía (14 países): islas del Pacífico</strong>
                <p>Australia y Nueva Zelanda son los más conocidos. Para los 12 estados insulares del Pacífico (Fiyi, Tonga, Samoa, Vanuatu, Kiribati...), agrúpalos por proximidad geográfica: Melanesia (sur), Micronesia (norte ecuatorial) y Polinesia (este). Las capitales más difíciles: Funafuti (Tuvalu), Yaren (Nauru), Tarawa (Kiribati).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Semana 7 — Repaso con mapas mudos</strong>
                <p>Imprime o usa en línea mapas mudos de cada continente y escribe los nombres de los países sin ayuda. Identifica los errores: esos son los países en los que debes insistir. Repite el ejercicio hasta alcanzar un 90 % de aciertos por continente. Los mapas mudos son el sistema de repaso más eficaz demostrado por la psicología del aprendizaje (práctica de recuperación activa).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Semana 8 — Consolidación: relaciona cada país con un evento actual</strong>
                <p>Lee una noticia internacional y localiza en el mapa cada país mencionado. Conectar geografía con actualidad convierte el conocimiento abstracto en comprensión contextual duradera. A partir de aquí, la lectura habitual de prensa internacional mantiene y refuerza el mapa mental de forma natural.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas — 6 tips (patrón v2.0) ── */}
        <section>
          <h3>💡 6 Técnicas para Memorizar Países y Capitales</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏠</span>
              <h4>Empieza por tu continente</h4>
              <p>El aprendizaje parte de lo conocido. Si eres de España, dominas Europa antes que África o Asia. Ese éxito inicial genera motivación para continuar. Reserva los continentes más complejos (África, Asia) para cuando tengas el método consolidado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🗺️</span>
              <h4>Aprende los países por sus fronteras comunes</h4>
              <p>Los países se memorizan mejor en grupo que de forma aislada. Si sabes que Uganda limita con Kenia, Tanzania, Ruanda, RDC y Sudán del Sur, ubicas automáticamente a 5 países con un solo esfuerzo. Estudia siempre los países limítrofes juntos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏛️</span>
              <h4>Asocia capitales con características únicas</h4>
              <p>Nairobi (Kenia) = «La ciudad safari de África». Reikiavik (Islandia) = «La capital más septentrional del mundo». Canberra (Australia) = «No es ni Sídney ni Melbourne, es la capital de compromiso». Las historias y anécdotas fijan los datos mejor que la repetición pura.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✏️</span>
              <h4>Usa mapas mudos para práctica activa</h4>
              <p>Escribir activa la memoria mucho más que leer o escuchar. Imprime mapas mudos por continente e intenta completarlos sin mirar. Este sistema, llamado «práctica de recuperación activa», es el método de estudio con más evidencia científica para la retención a largo plazo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📰</span>
              <h4>Relaciona países con eventos históricos recientes</h4>
              <p>Sudán del Sur (independencia 2011), Kosovo (independencia 2008), Timor-Leste (independencia 2002). Los países más jóvenes tienen historias de independencia recientes que los hacen fácilmente memorables. Conectar geografía con historia convierte datos en narrativas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎮</span>
              <h4>Practica con apps y juegos de geografía</h4>
              <p>La gamificación acelera el aprendizaje. Juegos como GeoGuessr o quizzes de capitales en línea consolidan la memoria de forma lúdica. Dedica 10 minutos diarios a estos juegos durante 30 días: el efecto acumulado supera sesiones intensivas esporádicas.</p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box — confusiones frecuentes (patrón v2.0) ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 Confusiones Geográficas Muy Frecuentes</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Austria ≠ Australia</strong>: Austria (Österreich) es un país sin litoral en el centro de Europa (capital: Viena). Australia es un continente-país en Oceanía (capital: Canberra). El error es tan común en inglés que existe el término «Kangaroo Office» para cuando correos de uno llegan al otro por confusión.</li>
              <li><strong>República Checa ≠ Eslovaquia</strong>: Fueron un único país (Checoslovaquia) hasta 1993, cuando se separaron pacíficamente. República Checa (capital: Praga) está al oeste; Eslovaquia (capital: Bratislava) al este. Ambas son miembros de la UE pero Eslovaquia usa el euro y República Checa, la corona checa.</li>
              <li><strong>Nicaragua ≠ Honduras</strong>: Dos países vecinos de Centroamérica con nombre y geografía que se confunden fácilmente. Nicaragua (capital: Managua) es el mayor de Centroamérica. Honduras (capital: Tegucigalpa) limita al norte con Guatemala y Belice. Un truco: Tegucigalpa es una de las capitales más difíciles de pronunciar del mundo, lo que la hace memorable.</li>
              <li><strong>La capital no siempre es la ciudad más grande</strong>: En Australia, la capital es Canberra (no Sídney, no Melbourne). En EE.UU., Washington D.C. (no Nueva York). En Brasil, Brasilia (no São Paulo ni Río de Janeiro). En Sudáfrica hay tres capitales distintas según la función. Las capitales «diseñadas» suelen ser más pequeñas que las ciudades históricamente dominantes.</li>
              <li><strong>Irlanda ≠ Irlanda del Norte</strong>: Irlanda (Éire) es un estado independiente y miembro de la UE (capital: Dublín). Irlanda del Norte es una de las cuatro naciones constituyentes del Reino Unido (capital administrativa: Belfast). Son vecinas en la misma isla pero pertenecen a países diferentes.</li>
              <li><strong>Guinea, Guinea-Bisáu, Guinea Ecuatorial y Papua Nueva Guinea</strong>: Cuatro países distintos en diferentes partes del mundo. Guinea y Guinea-Bisáu están en África Occidental. Guinea Ecuatorial está en África Central (a pesar de su nombre, no toca el ecuador). Papua Nueva Guinea está en Oceanía, a miles de kilómetros. El nombre «Guinea» viene de la palabra bereber para designar el territorio «de los hombres negros» y fue adoptado de forma independiente en distintas regiones.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('paises-del-mundo')} />
      <ShareCard appName="paises-del-mundo" />
      <Footer appName="paises-del-mundo" />
    </div>
  );
}
