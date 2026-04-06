'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './GoldenHour.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Constantes astronómicas
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Tipos de eventos solares
interface SunTimes {
  astronomicalDawn: Date | null;
  astronomicalDusk: Date | null;
  nauticalDawn: Date | null;
  nauticalDusk: Date | null;
  civilDawn: Date | null;
  civilDusk: Date | null;
  sunrise: Date | null;
  sunset: Date | null;
  goldenHourMorningEnd: Date | null;
  goldenHourEveningStart: Date | null;
  solarNoon: Date | null;
  dayLength: number;
}

// Resultado de búsqueda de ciudad
interface CitySearchResult {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
}

// Calcular día juliano
function getJulianDate(date: Date): number {
  const time = date.getTime();
  return (time / 86400000) + 2440587.5;
}

// Calcular posición del sol
function getSunPosition(date: Date, lat: number, lon: number): { altitude: number; azimuth: number } {
  const jd = getJulianDate(date);
  const n = jd - 2451545.0;

  const L = (280.46 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const lambda = L + 1.915 * Math.sin(g * DEG_TO_RAD) + 0.02 * Math.sin(2 * g * DEG_TO_RAD);
  const epsilon = 23.439 - 0.0000004 * n;

  const sinLambda = Math.sin(lambda * DEG_TO_RAD);
  const cosLambda = Math.cos(lambda * DEG_TO_RAD);
  const sinEpsilon = Math.sin(epsilon * DEG_TO_RAD);
  const cosEpsilon = Math.cos(epsilon * DEG_TO_RAD);

  const ra = Math.atan2(cosEpsilon * sinLambda, cosLambda) * RAD_TO_DEG;
  const dec = Math.asin(sinEpsilon * sinLambda) * RAD_TO_DEG;

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lst = (100.46 + 0.985647 * n + lon + 15 * utcHours) % 360;

  const ha = lst - ra;

  const sinLat = Math.sin(lat * DEG_TO_RAD);
  const cosLat = Math.cos(lat * DEG_TO_RAD);
  const sinDec = Math.sin(dec * DEG_TO_RAD);
  const cosDec = Math.cos(dec * DEG_TO_RAD);
  const cosHa = Math.cos(ha * DEG_TO_RAD);

  const altitude = Math.asin(sinLat * sinDec + cosLat * cosDec * cosHa) * RAD_TO_DEG;
  const azimuth = Math.atan2(
    Math.sin(ha * DEG_TO_RAD),
    cosHa * sinLat - Math.tan(dec * DEG_TO_RAD) * cosLat
  ) * RAD_TO_DEG + 180;

  return { altitude, azimuth: azimuth % 360 };
}

// Calcular hora para un ángulo solar específico
function getTimeForSunAngle(date: Date, lat: number, lon: number, angle: number, rising: boolean): Date | null {
  const jd = getJulianDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
  const n = jd - 2451545.0;

  const L = (280.46 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const lambda = L + 1.915 * Math.sin(g * DEG_TO_RAD) + 0.02 * Math.sin(2 * g * DEG_TO_RAD);
  const epsilon = 23.439 - 0.0000004 * n;

  const sinLambda = Math.sin(lambda * DEG_TO_RAD);
  const cosEpsilon = Math.cos(epsilon * DEG_TO_RAD);
  const sinEpsilon = Math.sin(epsilon * DEG_TO_RAD);

  const dec = Math.asin(sinEpsilon * sinLambda) * RAD_TO_DEG;

  const cosHa = (Math.sin(angle * DEG_TO_RAD) - Math.sin(lat * DEG_TO_RAD) * Math.sin(dec * DEG_TO_RAD)) /
                (Math.cos(lat * DEG_TO_RAD) * Math.cos(dec * DEG_TO_RAD));

  if (cosHa < -1 || cosHa > 1) {
    return null;
  }

  let ha = Math.acos(cosHa) * RAD_TO_DEG;
  if (rising) ha = -ha;

  const ra = Math.atan2(cosEpsilon * sinLambda, Math.cos(lambda * DEG_TO_RAD)) * RAD_TO_DEG;
  const lst = ra + ha;
  const utcHours = ((lst - 100.46 - 0.985647 * n - lon) / 15 + 24) % 24;

  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setUTCHours(Math.floor(utcHours), Math.round((utcHours % 1) * 60), 0, 0);

  return result;
}

// Calcular todos los tiempos solares
function calculateSunTimes(date: Date, lat: number, lon: number): SunTimes {
  const sunrise = getTimeForSunAngle(date, lat, lon, -0.833, true);
  const sunset = getTimeForSunAngle(date, lat, lon, -0.833, false);

  const civilDawn = getTimeForSunAngle(date, lat, lon, -6, true);
  const civilDusk = getTimeForSunAngle(date, lat, lon, -6, false);

  const nauticalDawn = getTimeForSunAngle(date, lat, lon, -12, true);
  const nauticalDusk = getTimeForSunAngle(date, lat, lon, -12, false);

  const astronomicalDawn = getTimeForSunAngle(date, lat, lon, -18, true);
  const astronomicalDusk = getTimeForSunAngle(date, lat, lon, -18, false);

  const goldenHourMorningEnd = getTimeForSunAngle(date, lat, lon, 6, true);
  const goldenHourEveningStart = getTimeForSunAngle(date, lat, lon, 6, false);

  let solarNoon: Date | null = null;
  if (sunrise && sunset) {
    solarNoon = new Date((sunrise.getTime() + sunset.getTime()) / 2);
  }

  let dayLength = 0;
  if (sunrise && sunset) {
    dayLength = (sunset.getTime() - sunrise.getTime()) / 60000;
  }

  return {
    astronomicalDawn,
    astronomicalDusk,
    nauticalDawn,
    nauticalDusk,
    civilDawn,
    civilDusk,
    sunrise,
    sunset,
    goldenHourMorningEnd,
    goldenHourEveningStart,
    solarNoon,
    dayLength,
  };
}

// Formatear hora
function formatTime(date: Date | null): string {
  if (!date) return '--:--';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Formatear duración
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}min`;
}

// Geocodificación inversa con Nominatim (coordenadas → nombre)
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`,
      {
        headers: {
          'User-Agent': 'meskeIA Golden Hour App (https://meskeia.com)'
        }
      }
    );

    if (!response.ok) throw new Error('Error en geocodificación');

    const data = await response.json();

    // Construir nombre legible
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.municipality || address.county || '';
    const state = address.state || '';
    const country = address.country || '';

    if (city && country) {
      return state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
    } else if (country) {
      return state ? `${state}, ${country}` : country;
    }

    return data.display_name?.split(',').slice(0, 3).join(',') || 'Ubicación desconocida';
  } catch {
    return 'Ubicación detectada';
  }
}

// Buscar ciudades con Nominatim (nombre → coordenadas)
async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=es&featuretype=city`,
      {
        headers: {
          'User-Agent': 'meskeIA Golden Hour App (https://meskeia.com)'
        }
      }
    );

    if (!response.ok) throw new Error('Error en búsqueda');

    const data = await response.json();

    return data.map((item: { display_name: string; lat: string; lon: string }) => {
      const parts = item.display_name.split(', ');
      const name = parts[0];
      // Simplificar display name: ciudad, región/estado, país
      const displayName = parts.length > 2
        ? `${parts[0]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`
        : item.display_name;

      return {
        name,
        displayName,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      };
    });
  } catch {
    return [];
  }
}

export default function GoldenHourPage() {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [locationName, setLocationName] = useState<string>('');
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [currentSunPosition, setCurrentSunPosition] = useState<{ altitude: number; azimuth: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Estados para búsqueda de ciudades
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Calcular tiempos solares cuando cambian los parámetros
  useEffect(() => {
    if (lat !== null && lon !== null) {
      const selectedDate = new Date(date);
      const times = calculateSunTimes(selectedDate, lat, lon);
      setSunTimes(times);
    }
  }, [lat, lon, date]);

  // Actualizar posición del sol actual
  useEffect(() => {
    if (lat === null || lon === null) return;

    const updateSunPosition = () => {
      const now = new Date();
      const position = getSunPosition(now, lat, lon);
      setCurrentSunPosition(position);
    };

    updateSunPosition();
    const interval = setInterval(updateSunPosition, 60000);

    return () => clearInterval(interval);
  }, [lat, lon]);

  // Cerrar resultados al hacer clic fuera (usando click en lugar de mousedown)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    // Usar setTimeout para que el click del botón se procese primero
    const handler = (event: MouseEvent) => {
      setTimeout(() => handleClickOutside(event), 0);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Obtener ubicación actual con geocodificación inversa
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;

        setLat(newLat);
        setLon(newLon);

        // Obtener nombre de la ubicación
        const name = await reverseGeocode(newLat, newLon);
        setLocationName(name);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Permiso de ubicación denegado');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Ubicación no disponible');
            break;
          case error.TIMEOUT:
            setLocationError('Tiempo de espera agotado');
            break;
          default:
            setLocationError('Error al obtener ubicación');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Manejar búsqueda de ciudades con debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(true);

    // Cancelar búsqueda anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    // Debounce de 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCities(value);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  // Seleccionar ciudad de los resultados
  const selectCity = (city: CitySearchResult) => {
    setLat(city.lat);
    setLon(city.lon);
    setLocationName(city.displayName);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Determinar período actual del día
  const getCurrentPeriod = (): { name: string; icon: string; color: string } => {
    if (!sunTimes || !currentSunPosition) {
      return { name: 'Selecciona una ubicación', icon: '📍', color: '#666' };
    }

    const now = new Date();
    const alt = currentSunPosition.altitude;

    if (alt < -18) {
      return { name: 'Noche', icon: '🌙', color: '#1a1a2e' };
    } else if (alt < -12) {
      return { name: 'Crepúsculo astronómico', icon: '✨', color: '#2d2d44' };
    } else if (alt < -6) {
      return { name: 'Crepúsculo náutico', icon: '🌌', color: '#3d3d5c' };
    } else if (alt < 0) {
      if (sunTimes.sunrise && now < sunTimes.sunrise) {
        return { name: 'Hora Azul (mañana)', icon: '🔵', color: '#1e3a5f' };
      } else {
        return { name: 'Hora Azul (tarde)', icon: '🔵', color: '#1e3a5f' };
      }
    } else if (alt < 6) {
      if (sunTimes.solarNoon && now < sunTimes.solarNoon) {
        return { name: 'Hora Dorada (mañana)', icon: '🌅', color: '#ff8c00' };
      } else {
        return { name: 'Hora Dorada (tarde)', icon: '🌇', color: '#ff6b35' };
      }
    } else {
      return { name: 'Día', icon: '☀️', color: '#ffd700' };
    }
  };

  const currentPeriod = getCurrentPeriod();

  // Calcular próximo evento
  const getNextEvent = (): { name: string; time: Date | null } => {
    if (!sunTimes) return { name: '', time: null };

    const now = new Date();
    const events = [
      { name: 'Crepúsculo astronómico', time: sunTimes.astronomicalDawn },
      { name: 'Crepúsculo náutico', time: sunTimes.nauticalDawn },
      { name: 'Hora azul (inicio)', time: sunTimes.civilDawn },
      { name: 'Amanecer', time: sunTimes.sunrise },
      { name: 'Fin hora dorada', time: sunTimes.goldenHourMorningEnd },
      { name: 'Mediodía solar', time: sunTimes.solarNoon },
      { name: 'Hora dorada (inicio)', time: sunTimes.goldenHourEveningStart },
      { name: 'Atardecer', time: sunTimes.sunset },
      { name: 'Fin hora azul', time: sunTimes.civilDusk },
      { name: 'Fin crepúsculo náutico', time: sunTimes.nauticalDusk },
      { name: 'Noche', time: sunTimes.astronomicalDusk },
    ].filter(e => e.time !== null);

    for (const event of events) {
      if (event.time && event.time > now) {
        return event;
      }
    }

    return { name: 'Mañana', time: null };
  };

  const nextEvent = getNextEvent();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🌅</span>
        <h1 className={styles.title}>Golden Hour</h1>
        <p className={styles.subtitle}>
          Calcula las horas de luz dorada y hora azul para fotografía. Planifica tus sesiones con la mejor luz natural.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Panel de ubicación */}
        <div className={styles.locationPanel}>
          <h2 className={styles.sectionTitle}>
            <span>📍</span> Ubicación
          </h2>

          <div className={styles.locationControls}>
            <button
              onClick={getCurrentLocation}
              className={styles.btnPrimary}
              disabled={isLocating}
            >
              {isLocating ? '⏳ Localizando...' : '📍 Usar mi ubicación'}
            </button>

            <div className={styles.dateInput}>
              <label>Fecha:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          {locationError && (
            <div className={styles.errorMessage}>⚠️ {locationError}</div>
          )}

          {/* Buscador de ciudades */}
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Buscar ciudad en cualquier parte del mundo..."
                className={styles.searchInput}
              />
              {isSearching && <span className={styles.searchSpinner}>⏳</span>}
            </div>

            {/* Resultados de búsqueda */}
            {showResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((city, index) => (
                  <button
                    key={`${city.lat}-${city.lon}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Evitar que el input pierda el foco
                      selectCity(city);
                    }}
                    className={styles.searchResultItem}
                  >
                    <span className={styles.resultIcon}>📍</span>
                    <span className={styles.resultName}>{city.displayName}</span>
                  </button>
                ))}
              </div>
            )}

            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className={styles.searchResults}>
                <div className={styles.noResults}>No se encontraron resultados</div>
              </div>
            )}
          </div>

          {/* Ubicación actual seleccionada */}
          {locationName && lat !== null && lon !== null && (
            <div className={styles.currentLocation}>
              <span className={styles.locationLabel}>📍 {locationName}</span>
              <span className={styles.coords}>
                {lat.toFixed(4)}°{lat >= 0 ? 'N' : 'S'}, {Math.abs(lon).toFixed(4)}°{lon >= 0 ? 'E' : 'O'}
              </span>
            </div>
          )}

          {/* Mensaje si no hay ubicación */}
          {!locationName && (
            <div className={styles.noLocationMessage}>
              <p>Usa tu ubicación actual o busca una ciudad para ver los horarios de luz.</p>
            </div>
          )}
        </div>

        {/* Estado actual - solo si hay ubicación */}
        {lat !== null && lon !== null && (
          <div
            className={styles.currentPanel}
            style={{ background: `linear-gradient(135deg, ${currentPeriod.color}dd, ${currentPeriod.color}99)` }}
          >
            <div className={styles.currentIcon}>{currentPeriod.icon}</div>
            <div className={styles.currentInfo}>
              <h3 className={styles.currentName}>{currentPeriod.name}</h3>
              {currentSunPosition && (
                <p className={styles.sunPosition}>
                  Sol a {currentSunPosition.altitude.toFixed(1)}° de altitud
                </p>
              )}
              {nextEvent.time && (
                <p className={styles.nextEvent}>
                  Próximo: <strong>{nextEvent.name}</strong> a las {formatTime(nextEvent.time)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timeline visual */}
        {sunTimes && lat !== null && (
          <div className={styles.timelinePanel}>
            <h2 className={styles.sectionTitle}>
              <span>⏰</span> Horarios del día
            </h2>

            <div className={styles.timeline}>
              {/* Hora azul mañana */}
              {sunTimes.civilDawn && sunTimes.sunrise && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)' }}>
                  <span className={styles.timeIcon}>🔵</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Azul</span>
                    <span className={styles.timeRange}>
                      {formatTime(sunTimes.civilDawn)} - {formatTime(sunTimes.sunrise)}
                    </span>
                    <span className={styles.colorTemp}>🌡️ 9.000K - 12.000K</span>
                  </div>
                </div>
              )}

              {/* Golden hour mañana */}
              {sunTimes.sunrise && sunTimes.goldenHourMorningEnd && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #ff8c00, #ffb347)' }}>
                  <span className={styles.timeIcon}>🌅</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Dorada (mañana)</span>
                    <span className={styles.timeRange}>
                      {formatTime(sunTimes.sunrise)} - {formatTime(sunTimes.goldenHourMorningEnd)}
                    </span>
                    <span className={styles.colorTemp}>🌡️ 3.000K - 4.000K</span>
                  </div>
                </div>
              )}

              {/* Amanecer */}
              {sunTimes.sunrise && (
                <div className={styles.eventMarker}>
                  <span>☀️ Amanecer: {formatTime(sunTimes.sunrise)}</span>
                </div>
              )}

              {/* Mediodía */}
              {sunTimes.solarNoon && (
                <div className={styles.eventMarker}>
                  <span>🔆 Mediodía solar: {formatTime(sunTimes.solarNoon)}</span>
                </div>
              )}

              {/* Golden hour tarde */}
              {sunTimes.goldenHourEveningStart && sunTimes.sunset && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #ff6b35, #ff8c00)' }}>
                  <span className={styles.timeIcon}>🌇</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Dorada (tarde)</span>
                    <span className={styles.timeRange}>
                      {formatTime(sunTimes.goldenHourEveningStart)} - {formatTime(sunTimes.sunset)}
                    </span>
                    <span className={styles.colorTemp}>🌡️ 2.500K - 3.500K</span>
                  </div>
                </div>
              )}

              {/* Atardecer */}
              {sunTimes.sunset && (
                <div className={styles.eventMarker}>
                  <span>🌅 Atardecer: {formatTime(sunTimes.sunset)}</span>
                </div>
              )}

              {/* Hora azul tarde */}
              {sunTimes.sunset && sunTimes.civilDusk && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #2d5a87, #1e3a5f)' }}>
                  <span className={styles.timeIcon}>🔵</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Azul</span>
                    <span className={styles.timeRange}>
                      {formatTime(sunTimes.sunset)} - {formatTime(sunTimes.civilDusk)}
                    </span>
                    <span className={styles.colorTemp}>🌡️ 9.000K - 12.000K</span>
                  </div>
                </div>
              )}
            </div>

            {/* Duración del día */}
            <div className={styles.dayLength}>
              <span>🌞 Duración del día: <strong>{formatDuration(sunTimes.dayLength)}</strong></span>
            </div>
          </div>
        )}

        {/* Tabla completa de horarios */}
        {sunTimes && lat !== null && (
          <div className={styles.detailsPanel}>
            <h2 className={styles.sectionTitle}>
              <span>📊</span> Detalle completo
            </h2>

            <div className={styles.timesTable}>
              <div className={styles.tableSection}>
                <h4>🌅 Mañana</h4>
                <div className={styles.tableRow}>
                  <span>Crepúsculo astronómico</span>
                  <span>{formatTime(sunTimes.astronomicalDawn)}</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Crepúsculo náutico</span>
                  <span>{formatTime(sunTimes.nauticalDawn)}</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Hora azul (inicio)</span>
                  <span>{formatTime(sunTimes.civilDawn)}</span>
                </div>
                <div className={`${styles.tableRow} ${styles.highlight}`}>
                  <span>☀️ Amanecer</span>
                  <span>{formatTime(sunTimes.sunrise)}</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Hora dorada (fin)</span>
                  <span>{formatTime(sunTimes.goldenHourMorningEnd)}</span>
                </div>
              </div>

              <div className={styles.tableSection}>
                <h4>🌇 Tarde</h4>
                <div className={styles.tableRow}>
                  <span>Mediodía solar</span>
                  <span>{formatTime(sunTimes.solarNoon)}</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Hora dorada (inicio)</span>
                  <span>{formatTime(sunTimes.goldenHourEveningStart)}</span>
                </div>
                <div className={`${styles.tableRow} ${styles.highlight}`}>
                  <span>🌅 Atardecer</span>
                  <span>{formatTime(sunTimes.sunset)}</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Hora azul (fin)</span>
                  <span>{formatTime(sunTimes.civilDusk)}</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Crepúsculo náutico</span>
                  <span>{formatTime(sunTimes.nauticalDusk)}</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Crepúsculo astronómico</span>
                  <span>{formatTime(sunTimes.astronomicalDusk)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Qué es la Golden Hour y Blue Hour?"
        subtitle="Aprende sobre los mejores momentos para fotografía"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>La Hora Dorada (Golden Hour)</h2>
          <p className={styles.introParagraph}>
            La <strong>hora dorada</strong> es el período justo después del amanecer y antes del atardecer,
            cuando el sol está bajo en el horizonte (entre 0° y 6° de altitud). La luz tiene un tono
            cálido y dorado, las sombras son largas y suaves, ideal para retratos y paisajes.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🌅 Características</h4>
              <ul>
                <li>Luz cálida y suave</li>
                <li>Sombras largas y difusas</li>
                <li>Bajo contraste</li>
                <li>Colores saturados</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>📸 Ideal para</h4>
              <ul>
                <li>Retratos al aire libre</li>
                <li>Fotografía de paisaje</li>
                <li>Arquitectura</li>
                <li>Bodas y prebodas</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>La Hora Azul (Blue Hour)</h2>
          <p className={styles.introParagraph}>
            La <strong>hora azul</strong> ocurre cuando el sol está entre 0° y -6° bajo el horizonte.
            El cielo adquiere un tono azul profundo mientras aún hay luz residual. Es perfecta para
            fotografía urbana y arquitectónica.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔵 Características</h4>
              <ul>
                <li>Cielo azul intenso</li>
                <li>Luz ambiente equilibrada</li>
                <li>Las luces artificiales brillan</li>
                <li>Ambiente misterioso</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>📸 Ideal para</h4>
              <ul>
                <li>Fotografía urbana/nocturna</li>
                <li>Skylines de ciudades</li>
                <li>Monumentos iluminados</li>
                <li>Larga exposición</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Los Crepúsculos</h2>
          <div className={styles.twilightTable}>
            <div className={styles.twilightRow}>
              <span className={styles.twilightIcon}>🌅</span>
              <div>
                <strong>Crepúsculo civil</strong> (sol entre 0° y -6°)
                <p>Suficiente luz para actividades al aire libre sin iluminación artificial.</p>
              </div>
            </div>
            <div className={styles.twilightRow}>
              <span className={styles.twilightIcon}>🌌</span>
              <div>
                <strong>Crepúsculo náutico</strong> (sol entre -6° y -12°)
                <p>El horizonte marino aún es visible. Estrellas brillantes aparecen.</p>
              </div>
            </div>
            <div className={styles.twilightRow}>
              <span className={styles.twilightIcon}>✨</span>
              <div>
                <strong>Crepúsculo astronómico</strong> (sol entre -12° y -18°)
                <p>Cielo casi completamente oscuro. Ideal para astrofotografía.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 1: TABLA COMPARATIVA ===== */}
        <section className={styles.eduComparativaSection}>
          <h3>🎨 Comparativa de Períodos de Luz</h3>
          <p className={styles.eduComparativaSubtitle}>Elige el mejor momento según el tipo de fotografía que buscas</p>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTablaComparativa}>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Temperatura Color</th>
                  <th>Duración típica</th>
                  <th>Calidad luz</th>
                  <th>Ideal para</th>
                  <th>Dificultad técnica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Golden Hour mañana</td>
                  <td>2.500–4.000K</td>
                  <td>20–45 min</td>
                  <td>Cálida, suave, sombras largas</td>
                  <td>Retratos, bodas, paisajes</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>Golden Hour tarde</td>
                  <td>2.000–3.500K</td>
                  <td>20–45 min</td>
                  <td>Dorada intensa, dramática</td>
                  <td>Arquitectura, atardeceres, moda</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>Blue Hour mañana</td>
                  <td>9.000–12.000K</td>
                  <td>20–30 min</td>
                  <td>Azul profundo, equilibrada</td>
                  <td>Urbana, monumentos, larga exp.</td>
                  <td>Alta (trípode necesario)</td>
                </tr>
                <tr>
                  <td>Blue Hour tarde</td>
                  <td>9.000–12.000K</td>
                  <td>20–30 min</td>
                  <td>Azul intenso + luces artificiales</td>
                  <td>Skylines, puentes, edificios iluminados</td>
                  <td>Alta (trípode necesario)</td>
                </tr>
                <tr>
                  <td>Mediodía solar</td>
                  <td>5.500–6.500K</td>
                  <td>Variable</td>
                  <td>Dura, contrastes fuertes</td>
                  <td>Producto, moda indoor, arquitectura</td>
                  <td>Baja (sin sombras largas)</td>
                </tr>
                <tr>
                  <td>Crepúsculo astronómico</td>
                  <td>3.000–8.000K+</td>
                  <td>30–60 min</td>
                  <td>Colores cielo espectaculares</td>
                  <td>Astrofotografía, Vía Láctea</td>
                  <td>Muy alta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== SECCIÓN 2: CASOS DE USO PRÁCTICOS ===== */}
        <section className={styles.eduEscenariosSection}>
          <h3>📸 Casos de Uso por Tipo de Fotografía</h3>
          <p className={styles.eduEscenariosSubtitle}>Cómo aprovechar la Golden Hour según tu especialidad</p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">🏔️</span>
                <h4>Fotografía de Paisaje</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Madrid, verano: Golden Hour tarde = 20:15–21:00. Llega 30 min antes. Busca primer plano en sombra + horizonte iluminado.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: La luz rasante crea texturas en montañas, campos y playas que son imposibles a mediodía.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">👰</span>
                <h4>Bodas y Retratos al Aire Libre</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Sesión preboda a las 19:30 en octubre. Luz suave de Golden Hour elimina necesidad de difusores. ISO bajo, piel perfecta.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: La temperatura de color 2.500–3.500K realza tonos de piel de forma natural, sin filtros.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">🏙️</span>
                <h4>Fotografía Urbana y Arquitectura</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Blue Hour en ciudad: 20 min después del atardecer. Trípode + ISO 400 + f/8 + 4s. Las ventanas iluminadas equilibran el cielo azul.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: La Blue Hour equaliza la exposición entre luces artificiales y el cielo, eliminando el negro puro.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">🌌</span>
                <h4>Astrofotografía y Vía Láctea</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Esperar hasta crepúsculo astronómico (sol a -18°). Mínimo 30 min tras puesta. ISO 3200, f/2.8, 20–25s. Sin luna llena.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: El crepúsculo astronómico garantiza cielo suficientemente oscuro para capturar la Vía Láctea sin contaminación lumínica solar.</p>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 3: FAQ AMPLIADO ===== */}
        <section className={styles.eduFaqSection}>
          <h3>❓ Preguntas Frecuentes sobre Golden Hour</h3>
          <p className={styles.eduFaqSubtitle}>Todo lo que necesitas saber para planificar tus sesiones</p>
          <div className={styles.eduFaqList}>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuánto dura exactamente la Golden Hour?</h4>
              <p>La Golden Hour dura entre 20 y 60 minutos dependiendo de la latitud y la época del año. En invierno, en latitudes altas como Madrid (40°N), puede durar apenas 15–20 minutos. En verano en zonas ecuatoriales puede extenderse a 45–60 minutos. La clave: cuanto más baja la latitud y más cercano al solsticio de verano, más larga es. Esta calculadora te da los horarios exactos para cualquier lugar y fecha. 💡 Consejo: Planifica llegar 15 minutos antes del inicio.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuál es mejor: Golden Hour de mañana o de tarde?</h4>
              <p>Depende del objetivo. La Golden Hour de mañana tiene luz más fría (3.000–4.000K) y el ambiente suele estar más tranquilo, ideal para paisajes sin gente. La de tarde es más cálida (2.000–3.000K) y dramática, perfecta para retratos y arquitectura. Además, las nubes al atardecer tienden a coger más color que al amanecer. 💡 Consejo: Si fotografías personas, preferirás la tarde. Para naturaleza y paisajes solitarios, la mañana.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo varía la Golden Hour según la estación?</h4>
              <p>En Madrid en diciembre, la Golden Hour dura ~20 min y el sol sale a las 8:30. En junio, la Golden Hour dura ~40 min y el sol sale a las 6:45. La diferencia es de hasta 2 horas en el horario y el doble de duración. En latitudes extremas (&gt;60°N), en verano puede durar varias horas o incluso todo el día. 💡 Consejo: En invierno llega antes. El sol cae rápido y el tiempo dorado es muy corto.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Hace falta trípode en Golden Hour?</h4>
              <p>En Golden Hour (sol entre 0° y 6°) generalmente no es necesario trípode: hay luz suficiente para velocidades &gt;1/100s con ISO 400–800. Sin embargo, en Blue Hour (sol entre 0° y -6°) el trípode es imprescindible: necesitarás exposiciones de 1–10 segundos para capturar el cielo azul con luces artificiales equilibradas. 💡 Consejo: Lleva siempre el trípode aunque sea Golden Hour. Si el cielo se llena de nubes, la luz cae drásticamente.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo afecta la nubosidad a la Golden Hour?</h4>
              <p>Las nubes son aliadas en Golden Hour: pueden multiplicar los colores naranjas/rojos y crear cielos espectaculares. Las mejores fotos de Golden Hour suelen tener nubes dispersas (cirros o cúmulos). El cielo completamente despejado produce colores menos intensos. Las nubes densas bloquean la luz dorada pero crean luz difusa perfecta para retratos. 💡 Consejo: Sigue el parte meteorológico. Nubes dispersas + horizonte despejado = foto épica garantizada.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué ajustes de cámara usar en Golden Hour?</h4>
              <p>Puntos de partida: f/8 (paisajes), f/2.8 (retratos), ISO 100–400, velocidad según luz disponible. Balance de blancos: &quot;Soleado&quot; (5500K) mantiene los tonos cálidos; &quot;Auto&quot; puede enfriar la imagen. En Blue Hour: f/8, ISO 400–800, velocidad 1–10 segundos. 💡 Consejo: Desactiva el auto-ISO en Golden Hour. El ISO base más bajo de tu cámara da el máximo detalle en las sombras largas características de este período.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿La Golden Hour sirve para fotografía de interior?</h4>
              <p>Indirectamente sí. Si la habitación tiene ventanas orientadas al este (mañana) u oeste (tarde), la luz dorada entrará creando haces de luz dramáticos y sombras largas. Para maximizarlo: abre persianas justo en Golden Hour, usa la luz como backlight o sidelight. 💡 Consejo: Los fotógrafos de inmuebles suelen programar sus sesiones en Golden Hour precisamente por la calidad de la luz natural que entra por las ventanas.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo uso las coordenadas GPS para planificar?</h4>
              <p>Las coordenadas determinan con precisión la hora de salida/puesta del sol y la duración del crepúsculo. Una diferencia de 1° de latitud cambia la hora de amanecer en ~4 minutos. Esta herramienta calcula los horarios exactos con coordenadas precisas. Para planificación avanzada: usa Google Maps para identificar la dirección del amanecer/atardecer y elegir el encuadre antes de llegar. 💡 Consejo: El azimut solar (dirección del sol) es tan importante como la hora. El sol sale exactamente por el este solo en los equinoccios.</p>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 4: GUÍA PASO A PASO ===== */}
        <section className={styles.eduStepSection}>
          <h3>📋 Guía: Planifica tu Sesión de Golden Hour</h3>
          <p className={styles.eduStepSubtitle}>7 pasos para no desperdiciar ni un minuto de luz dorada</p>
          <div className={styles.eduStepGuide}>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber} aria-hidden="true">1</div>
              <div className={styles.eduStepContent}>
                <h4>Introduce la ubicación exacta</h4>
                <p>Usa GPS o busca la ciudad en el buscador. Para mayor precisión en exteriores, activa &apos;Usar mi ubicación&apos;. La diferencia entre el centro de Madrid y la Sierra a 60 km puede ser de 3–5 minutos en el amanecer.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber} aria-hidden="true">2</div>
              <div className={styles.eduStepContent}>
                <h4>Selecciona la fecha de la sesión</h4>
                <p>Consulta los horarios para el día exacto. Recuerda: en España peninsular el amanecer varía desde las 6:30 (junio, Canarias) hasta las 9:00 (diciembre, Galicia). Planifica con 2–3 semanas de antelación para confirmar disponibilidad del cliente.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber} aria-hidden="true">3</div>
              <div className={styles.eduStepContent}>
                <h4>Elige el período que necesitas</h4>
                <p>Golden Hour mañana para paisajes tranquilos y luz fría. Golden Hour tarde para retratos cálidos y atardeceres dramáticos. Blue Hour para fotografía urbana y arquitectónica con luces artificiales.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber} aria-hidden="true">4</div>
              <div className={styles.eduStepContent}>
                <h4>Planifica el desplazamiento y acceso</h4>
                <p>Llega 30 minutos antes del inicio del período. La Golden Hour dura entre 20–45 minutos y no espera. Para localizaciones remotas (montaña, costa), planifica 1 hora extra por imprevistos. Comprueba el horario de apertura si es un recinto cerrado.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber} aria-hidden="true">5</div>
              <div className={styles.eduStepContent}>
                <h4>Prepara el equipo con antelación</h4>
                <p>Carga baterías la noche anterior (el frío las descarga más rápido). Formatea tarjetas de memoria. En Blue Hour: trípode, disparador remoto o temporizador. Lleva linternas si el acceso es en oscuridad.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber} aria-hidden="true">6</div>
              <div className={styles.eduStepContent}>
                <h4>Ajusta la cámara antes de llegar</h4>
                <p>Configura el perfil de color para la luz cálida: balance de blancos &apos;Soleado&apos; (5500K) o &apos;Nublado&apos; (6500K) para intensificar los tonos dorados. Desactiva el auto-ISO. Prepara la horquilla de exposición si planeas hacer HDR.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <div className={styles.eduStepNumber} aria-hidden="true">7</div>
              <div className={styles.eduStepContent}>
                <h4>Trabaja rápido y adapta en tiempo real</h4>
                <p>Los primeros 10 minutos son los más dramáticos. Captura primero el encuadre principal. Luego experimenta. El período de transición entre Golden Hour y Blue Hour (minutos después del atardecer) es frecuentemente el momento más mágico e ignorado.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 5: MEJORES PRÁCTICAS ===== */}
        <section className={styles.eduTipsSection}>
          <h3>✅ 6 Prácticas Esenciales del Fotógrafo</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">⏰</span>
              <h4>El timing lo es todo</h4>
              <p>Configura alarmas para 30 min antes del inicio. Una vez comienza la Golden Hour, no hay tiempo para preparar equipo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">🧭</span>
              <h4>Conoce la dirección solar</h4>
              <p>El sol no sale siempre por el mismo punto. En verano sale más al norte, en invierno más al sur. Usa brújula o Google Maps para anticipar el encuadre.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">☁️</span>
              <h4>Las nubes son tus aliadas</h4>
              <p>Nubes dispersas en el horizonte + cielo abierto sobre ti = puesta de sol espectacular. Los cielos completamente despejados suelen ser menos fotogénicos.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">🔍</span>
              <h4>Explora en días normales</h4>
              <p>Visita las localizaciones en horario normal antes de la sesión. Identificar obstáculos, accesos y encuadres sin presión de tiempo es fundamental.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">📱</span>
              <h4>Sincroniza herramientas digitales</h4>
              <p>Combina esta calculadora con apps como PhotoPills o The Photographer&apos;s Ephemeris para visualizar la trayectoria solar sobre el mapa.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon} aria-hidden="true">🌧️</span>
              <h4>Plan B siempre listo</h4>
              <p>Guarda una localización alternativa cubierta (galerías, pasos porticados) para días de lluvia. El día después de la lluvia suele dar luz excepcional.</p>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 6: WARNING BOX — ERRORES COMUNES ===== */}
        <div className={styles.eduWarningBox} role="alert">
          <div className={styles.eduWarningHeader}>
            <span className={styles.eduWarningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores que Arruinan Sesiones de Golden Hour</h3>
          </div>
          <ul className={styles.eduWarningList}>
            <li><strong>Llegar en el momento exacto del amanecer/atardecer:</strong> La Golden Hour empieza con la salida del sol, no antes. Si llegas en ese momento, te pierdes los primeros y más dramáticos minutos. Llega 30 minutos antes.</li>
            <li><strong>Ignorar la Blue Hour por enfocarse solo en Golden:</strong> Los 20 minutos después del atardecer (Blue Hour) suelen dar las imágenes más equilibradas y únicas del día, especialmente en entornos urbanos. No te vayas en cuanto el sol toque el horizonte.</li>
            <li><strong>Fotografiar directamente hacia el sol sin control:</strong> Mirar o enfocar directo al sol puede dañar el sensor y quemar píxeles. Usa el sol como fuente de contraluz lateral (45–90°) para obtener flares controlados y siluetas dramáticas.</li>
            <li><strong>No revisar el pronóstico meteorológico:</strong> Nubes densas tapando el horizonte bloquean por completo la Golden Hour. Comprueba el parte las 24h anteriores. AccuWeather y Meteociel ofrecen predicciones de nubosidad por horas.</li>
            <li><strong>Confiar solo en la hora de atardecer estándar:</strong> La hora de atardecer del móvil (calendario del SO) puede diferir hasta 10 minutos de la hora solar real en tu ubicación exacta. Usa siempre las coordenadas GPS precisas de la herramienta.</li>
            <li><strong>Olvidar el horario de verano al planificar con antelación:</strong> Si planificas sesiones con semanas de antelación y hay cambio horario (último domingo de marzo o octubre en España), los horarios de amanecer/atardecer cambian 1 hora. Introduce la fecha exacta en la calculadora.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('golden-hour')} />

      <ShareCard appName="golden-hour" />
      <Footer appName="golden-hour" />
    </div>
  );
}
