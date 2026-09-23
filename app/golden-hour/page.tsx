'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styles from './GoldenHour.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  eventosDelDia,
  posicionSol,
  proximoEvento,
  solSubiendo,
  leerFecha,
  fechaEnZona,
  diasEntre,
  desfaseZona,
  zonaValida,
  husoParaLugar,
  UMBRAL,
  type ClaveEvento,
  type FechaCivil,
  type OrigenHuso,
} from './motor';

// Resultado de búsqueda de ciudades
interface CitySearchResult {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  /** Código ISO del país (Nominatim, addressdetails), para deducir el huso horario. */
  pais?: string;
}

/**
 * De dónde sale el huso con el que se escriben las horas. La app lo dice siempre en pantalla
 * (hallazgo 1235: antes las horas salían en el huso del navegador sin avisar, y quien
 * planificaba un viaje leía las de su país como si fueran las del destino).
 */
type OrigenZona = 'dispositivo' | OrigenHuso | 'manual';

const NOMBRE_EVENTO: Record<ClaveEvento, string> = {
  amanecerAstronomico: 'Inicio del crepúsculo astronómico',
  amanecerNautico: 'Inicio del crepúsculo náutico',
  amanecerCivil: 'Hora azul (inicio)',
  orto: 'Amanecer',
  finDoradaManana: 'Fin hora dorada',
  mediodia: 'Mediodía solar',
  inicioDoradaTarde: 'Hora dorada (inicio)',
  ocaso: 'Atardecer',
  anochecerCivil: 'Fin hora azul',
  anochecerNautico: 'Fin crepúsculo náutico',
  anochecerAstronomico: 'Noche cerrada (fin del crepúsculo astronómico)',
};

/** Fecha de hoy en el huso del DISPOSITIVO (no en UTC: hallazgo 1238). */
function hoyLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Hora «HH:MM» de un instante en el huso indicado. */
function formatHora(ms: number | null, zona: string): string {
  if (ms === null) return '--:--';
  return new Date(ms).toLocaleTimeString('es-ES', { timeZone: zona, hour: '2-digit', minute: '2-digit' });
}

/** « (día siguiente)» o « (víspera)» si el instante no cae en la fecha elegida. */
function marcaDia(ms: number | null, zona: string, fecha: FechaCivil): string {
  if (ms === null) return '';
  const d = diasEntre(fecha, fechaEnZona(ms, zona));
  if (d > 0) return ' (día siguiente)';
  if (d < 0) return ' (víspera)';
  return '';
}

/** «UTC+2», «UTC−3», «UTC+5:30». */
function formatDesfase(minutos: number): string {
  if (minutos === 0) return 'UTC';
  const signo = minutos > 0 ? '+' : '−';
  const abs = Math.abs(minutos);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${signo}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

/** Duración en minutos → «15h 4min» (redondeando el total, para no dar «14h 60min»). */
function formatDuracion(minutos: number): string {
  const total = Math.round(minutos);
  return `${Math.floor(total / 60)}h ${total % 60}min`;
}

/** Coordenada con su hemisferio y sin signo: «34,6037°S». */
function formatCoordenada(valor: number, positivo: string, negativo: string): string {
  return `${formatNumber(Math.abs(valor), 4)}°${valor >= 0 ? positivo : negativo}`;
}

/** Punto cardinal (8 rumbos) de un azimut en grados. */
function rumbo(azimut: number): string {
  const RUMBOS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return RUMBOS[Math.round(azimut / 45) % 8];
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

// Buscar ciudades con Nominatim (nombre → coordenadas y país)
async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=es&featuretype=city&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'meskeIA Golden Hour App (https://meskeia.com)'
        }
      }
    );

    if (!response.ok) throw new Error('Error en búsqueda');

    const data: { display_name: string; lat: string; lon: string; address?: { country_code?: string } }[] =
      await response.json();

    return data
      .map((item) => {
        const parts = item.display_name.split(', ');
        const name = parts[0];
        // Simplificar display name: ciudad, región/estado, país
        const displayName = parts.length > 2
          ? `${parts[0]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`
          : item.display_name;

        return {
          name,
          displayName,
          // Coordenadas decimales con punto que escribe Nominatim, no texto del usuario.
          lat: Number(item.lat),
          lon: Number(item.lon),
          pais: item.address?.country_code,
        };
      })
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lon));
  } catch {
    return [];
  }
}

export default function GoldenHourPage() {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [date, setDate] = useState<string>(hoyLocal);
  const [locationName, setLocationName] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Huso horario en que se escriben las horas. Se lee del navegador al montar: en el HTML
  // prerenderizado no hay huso del visitante.
  const [zonaDispositivo, setZonaDispositivo] = useState<string>('');
  const [zona, setZona] = useState<string>('');
  const [origenZona, setOrigenZona] = useState<OrigenZona>('dispositivo');
  const [husosDisponibles, setHusosDisponibles] = useState<string[]>([]);

  // «Ahora», para el panel del estado actual. Se refresca cada minuto.
  const [ahora, setAhora] = useState<number | null>(null);

  // Estados para búsqueda de ciudades
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const propia = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    setZonaDispositivo(propia);
    setZona((z) => z || propia);
    let lista: string[] = [];
    try {
      lista = Intl.supportedValuesOf('timeZone');
    } catch {
      lista = [];
    }
    if (!lista.includes(propia)) lista = [propia, ...lista];
    setHusosDisponibles(lista);

    setAhora(Date.now());
    const intervalo = setInterval(() => setAhora(Date.now()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const fecha = useMemo(() => leerFecha(date), [date]);

  const eventos = useMemo(() => {
    if (lat === null || lon === null || !zona || !fecha) return null;
    return eventosDelDia(fecha, lat, lon, zona);
  }, [lat, lon, zona, fecha]);

  const posicion = useMemo(() => {
    if (lat === null || lon === null || ahora === null) return null;
    return posicionSol(ahora, lat, lon);
  }, [lat, lon, ahora]);

  const proximo = useMemo(() => {
    if (lat === null || lon === null || ahora === null || !zona) return null;
    return proximoEvento(ahora, lat, lon, zona);
  }, [lat, lon, ahora, zona]);

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
        // Donde estás, la hora de tu dispositivo es la del lugar.
        setZona(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
        setOrigenZona('dispositivo');

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

  // Seleccionar ciudad de los resultados: el huso sale de su país, no del navegador
  const selectCity = (city: CitySearchResult) => {
    const propia = zonaDispositivo || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const huso = husoParaLugar(city.pais, city.lat, city.lon, Date.now(), propia);
    setLat(city.lat);
    setLon(city.lon);
    setZona(huso.zona);
    setOrigenZona(huso.origen);
    setLocationName(city.displayName);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const cambiarZona = (nueva: string) => {
    if (!zonaValida(nueva)) return;
    setZona(nueva);
    setOrigenZona('manual');
  };

  // Período del día AHORA en el lugar, por la altura del sol y por si sube o baja
  const getCurrentPeriod = (): { name: string; icon: string; color: string } => {
    if (!posicion || lat === null || lon === null || ahora === null) {
      return { name: 'Selecciona una ubicación', icon: '📍', color: '#666666' };
    }
    const alt = posicion.altura;
    const manana = solSubiendo(ahora, lat, lon);

    if (alt < UMBRAL.astronomico) {
      return { name: 'Noche', icon: '🌙', color: '#1a1a2e' };
    } else if (alt < UMBRAL.nautico) {
      return { name: 'Crepúsculo astronómico', icon: '✨', color: '#2d2d44' };
    } else if (alt < UMBRAL.civil) {
      return { name: 'Crepúsculo náutico', icon: '🌌', color: '#3d3d5c' };
    } else if (alt < UMBRAL.horizonte) {
      return manana
        ? { name: 'Hora Azul (mañana)', icon: '🔵', color: '#1e3a5f' }
        : { name: 'Hora Azul (tarde)', icon: '🔵', color: '#1e3a5f' };
    } else if (alt < UMBRAL.horaDorada) {
      return manana
        ? { name: 'Hora Dorada (mañana)', icon: '🌅', color: '#ff8c00' }
        : { name: 'Hora Dorada (tarde)', icon: '🌇', color: '#ff6b35' };
    }
    return { name: 'Día', icon: '☀️', color: '#ffd700' };
  };

  const currentPeriod = getCurrentPeriod();
  const hayUbicacion = lat !== null && lon !== null;

  // Textos del huso horario, que acompañan a toda hora publicada
  const desfaseTexto = eventos ? formatDesfase(desfaseZona(eventos.mediodia, zona)) : '';
  const notaZona: Record<OrigenZona, string> = {
    dispositivo: 'Es el huso de tu dispositivo, que coincide con el del lugar donde estás.',
    pais: 'Es el huso del país del lugar elegido.',
    estimado:
      'Este país tiene varios husos horarios y hemos elegido el más cercano al lugar. Compruébalo y cámbialo si no es el suyo.',
    desconocido:
      'No sabemos el huso de este lugar, así que las horas salen en el de tu dispositivo. Si el lugar está en otro huso, elígelo aquí.',
    manual: 'Huso elegido por ti.',
  };
  const zonaDudosa = origenZona === 'estimado' || origenZona === 'desconocido';

  // Hora de un evento, con la marca de día si no cae en la fecha elegida
  const horaEvento = (ms: number | null): string =>
    fecha ? `${formatHora(ms, zona)}${marcaDia(ms, zona, fecha)}` : '--:--';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🌅</span>
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
            <span aria-hidden="true">📍</span> Ubicación
          </h2>

          <div className={styles.locationControls}>
            <button
              type="button"
              onClick={getCurrentLocation}
              className={styles.btnPrimary}
              disabled={isLocating}
            >
              <span aria-hidden="true">{isLocating ? '⏳' : '📍'}</span>{' '}
              {isLocating ? 'Localizando...' : 'Usar mi ubicación'}
            </button>

            <div className={styles.dateInput}>
              <label htmlFor="gh-fecha">Fecha:</label>
              <input
                id="gh-fecha"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          {locationError && (
            <div className={styles.errorMessage} role="alert">
              <span aria-hidden="true">⚠️</span> {locationError}
            </div>
          )}

          {/* Buscador de ciudades */}
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon} aria-hidden="true">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Buscar ciudad en cualquier parte del mundo..."
                aria-label="Buscar ciudad"
                className={styles.searchInput}
              />
              {isSearching && <span className={styles.searchSpinner} aria-hidden="true">⏳</span>}
            </div>

            {/* Resultados de búsqueda */}
            {showResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((city, index) => (
                  <button
                    type="button"
                    key={`${city.lat}-${city.lon}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Evitar que el input pierda el foco
                      selectCity(city);
                    }}
                    className={styles.searchResultItem}
                  >
                    <span className={styles.resultIcon} aria-hidden="true">📍</span>
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
              <span className={styles.locationLabel}>
                <span aria-hidden="true">📍</span> {locationName}
              </span>
              <span className={styles.coords}>
                {formatCoordenada(lat, 'N', 'S')}, {formatCoordenada(lon, 'E', 'O')}
              </span>
            </div>
          )}

          {/* Huso horario de las horas publicadas */}
          {hayUbicacion && zona && (
            <div className={`${styles.zonaPanel} ${zonaDudosa ? styles.zonaDudosa : ''}`}>
              <div className={styles.zonaControl}>
                <label htmlFor="gh-huso">Horas en el huso:</label>
                <select
                  id="gh-huso"
                  value={zona}
                  onChange={(e) => cambiarZona(e.target.value)}
                  className={styles.input}
                >
                  {(husosDisponibles.includes(zona) ? husosDisponibles : [zona, ...husosDisponibles]).map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
                {desfaseTexto && <span className={styles.zonaDesfase}>{desfaseTexto} ese día</span>}
              </div>
              <p className={styles.zonaNota}>
                {zonaDudosa && <span aria-hidden="true">⚠️ </span>}
                {notaZona[origenZona]}
              </p>
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
        {hayUbicacion && posicion && (
          <div
            className={styles.currentPanel}
            style={{ background: `linear-gradient(135deg, ${currentPeriod.color}dd, ${currentPeriod.color}99)` }}
          >
            <div className={styles.currentIcon} aria-hidden="true">{currentPeriod.icon}</div>
            <div className={styles.currentInfo}>
              <p className={styles.currentAhora}>Ahora mismo en el lugar</p>
              <h3 className={styles.currentName}>{currentPeriod.name}</h3>
              <p className={styles.sunPosition}>
                Sol a {formatNumber(posicion.altura, 1)}° de altitud · azimut {formatNumber(posicion.azimut, 0)}° ({rumbo(posicion.azimut)})
              </p>
              {proximo && ahora !== null && (
                <p className={styles.nextEvent}>
                  Próximo: <strong>{NOMBRE_EVENTO[proximo.clave]}</strong> a las {formatHora(proximo.instante, zona)}
                  {diasEntre(fechaEnZona(ahora, zona), fechaEnZona(proximo.instante, zona)) > 0 ? ' de mañana' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sin fecha no hay nada que calcular (hallazgo 1240: salía «Invalid Date») */}
        {hayUbicacion && !fecha && (
          <div className={styles.errorMessage} role="alert">
            <span aria-hidden="true">📅</span> Elige una fecha para ver los horarios de luz.
          </div>
        )}

        {/* Timeline visual */}
        {eventos && fecha && (
          <div className={styles.timelinePanel}>
            <h2 className={styles.sectionTitle}>
              <span aria-hidden="true">⏰</span> Horarios del día
            </h2>
            <p className={styles.zonaResumen}>
              Horas de {zona} ({desfaseTexto}).
            </p>

            {eventos.regimen === 'nochePolar' && (
              <p className={styles.regimenAviso}>
                <span aria-hidden="true">🌑</span> Noche polar: ese día el sol no sale. Su altura máxima, al mediodía solar, es de {formatNumber(eventos.alturaMaxima, 1)}°.
              </p>
            )}
            {eventos.regimen === 'solDeMedianoche' && (
              <p className={styles.regimenAviso}>
                <span aria-hidden="true">🌞</span> Sol de medianoche: ese día el sol no se pone. Su altura mínima es de {formatNumber(eventos.alturaMinima, 1)}°
                {eventos.alturaMinima < UMBRAL.horaDorada ? ', así que la noche entera es hora dorada.' : '.'}
              </p>
            )}

            <div className={styles.timeline}>
              {/* Hora azul mañana */}
              {eventos.amanecerCivil !== null && eventos.orto !== null && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)' }}>
                  <span className={styles.timeIcon} aria-hidden="true">🔵</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Azul</span>
                    <span className={styles.timeRange}>
                      {horaEvento(eventos.amanecerCivil)} - {horaEvento(eventos.orto)}
                    </span>
                    <span className={styles.colorTemp}><span aria-hidden="true">🌡️</span> 9.000K - 12.000K</span>
                  </div>
                </div>
              )}

              {/* Golden hour mañana (con sol de medianoche viene de la noche) */}
              {eventos.finDoradaManana !== null && (eventos.orto !== null || eventos.regimen === 'solDeMedianoche') && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #ff8c00, #ffb347)' }}>
                  <span className={styles.timeIcon} aria-hidden="true">🌅</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Dorada (mañana)</span>
                    <span className={styles.timeRange}>
                      {eventos.orto !== null ? horaEvento(eventos.orto) : 'Desde la noche'} - {horaEvento(eventos.finDoradaManana)}
                    </span>
                    <span className={styles.colorTemp}><span aria-hidden="true">🌡️</span> 3.000K - 4.000K</span>
                  </div>
                </div>
              )}

              {/* Amanecer */}
              {eventos.orto !== null && (
                <div className={styles.eventMarker}>
                  <span><span aria-hidden="true">☀️</span> Amanecer: {horaEvento(eventos.orto)}</span>
                </div>
              )}

              {/* Mediodía */}
              <div className={styles.eventMarker}>
                <span><span aria-hidden="true">🔆</span> Mediodía solar: {horaEvento(eventos.mediodia)}</span>
              </div>

              {/* Golden hour tarde (con sol de medianoche sigue toda la noche) */}
              {eventos.inicioDoradaTarde !== null && (eventos.ocaso !== null || eventos.regimen === 'solDeMedianoche') && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #ff6b35, #ff8c00)' }}>
                  <span className={styles.timeIcon} aria-hidden="true">🌇</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Dorada (tarde)</span>
                    <span className={styles.timeRange}>
                      {horaEvento(eventos.inicioDoradaTarde)} - {eventos.ocaso !== null ? horaEvento(eventos.ocaso) : 'toda la noche'}
                    </span>
                    <span className={styles.colorTemp}><span aria-hidden="true">🌡️</span> 2.500K - 3.500K</span>
                  </div>
                </div>
              )}

              {/* Atardecer */}
              {eventos.ocaso !== null && (
                <div className={styles.eventMarker}>
                  <span><span aria-hidden="true">🌅</span> Atardecer: {horaEvento(eventos.ocaso)}</span>
                </div>
              )}

              {/* Hora azul tarde */}
              {eventos.ocaso !== null && eventos.anochecerCivil !== null && (
                <div className={styles.timeBlock} style={{ background: 'linear-gradient(135deg, #2d5a87, #1e3a5f)' }}>
                  <span className={styles.timeIcon} aria-hidden="true">🔵</span>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeName}>Hora Azul</span>
                    <span className={styles.timeRange}>
                      {horaEvento(eventos.ocaso)} - {horaEvento(eventos.anochecerCivil)}
                    </span>
                    <span className={styles.colorTemp}><span aria-hidden="true">🌡️</span> 9.000K - 12.000K</span>
                  </div>
                </div>
              )}
            </div>

            {/* Duración del día */}
            <div className={styles.dayLength}>
              <span>
                <span aria-hidden="true">🌞</span> Duración del día: <strong>{formatDuracion(eventos.duracionDia)}</strong>
                {eventos.regimen === 'solDeMedianoche' && ' (sol de medianoche)'}
                {eventos.regimen === 'nochePolar' && ' (noche polar)'}
              </span>
            </div>
          </div>
        )}

        {/* Tabla completa de horarios */}
        {eventos && fecha && (
          <div className={styles.detailsPanel}>
            <h2 className={styles.sectionTitle}>
              <span aria-hidden="true">📊</span> Detalle completo
            </h2>

            <div className={styles.timesTable}>
              <div className={styles.tableSection}>
                <h4><span aria-hidden="true">🌅</span> Mañana</h4>
                {([
                  ['Crepúsculo astronómico', eventos.amanecerAstronomico, false],
                  ['Crepúsculo náutico', eventos.amanecerNautico, false],
                  ['Hora azul (inicio)', eventos.amanecerCivil, false],
                  ['Amanecer', eventos.orto, true],
                  ['Hora dorada (fin)', eventos.finDoradaManana, false],
                ] as const).map(([etiqueta, ms, destacado]) => (
                  <div key={etiqueta} className={`${styles.tableRow} ${destacado ? styles.highlight : ''}`}>
                    <span>
                      {destacado && <span aria-hidden="true">☀️ </span>}
                      {etiqueta}
                      {marcaDia(ms, zona, fecha) && <small className={styles.marcaDia}>{marcaDia(ms, zona, fecha)}</small>}
                    </span>
                    <span>{formatHora(ms, zona)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.tableSection}>
                <h4><span aria-hidden="true">🌇</span> Tarde</h4>
                {([
                  ['Mediodía solar', eventos.mediodia, false],
                  ['Hora dorada (inicio)', eventos.inicioDoradaTarde, false],
                  ['Atardecer', eventos.ocaso, true],
                  ['Hora azul (fin)', eventos.anochecerCivil, false],
                  ['Crepúsculo náutico', eventos.anochecerNautico, false],
                  ['Crepúsculo astronómico', eventos.anochecerAstronomico, false],
                ] as const).map(([etiqueta, ms, destacado]) => (
                  <div key={etiqueta} className={`${styles.tableRow} ${destacado ? styles.highlight : ''}`}>
                    <span>
                      {destacado && <span aria-hidden="true">🌅 </span>}
                      {etiqueta}
                      {marcaDia(ms, zona, fecha) && <small className={styles.marcaDia}>{marcaDia(ms, zona, fecha)}</small>}
                    </span>
                    <span>{formatHora(ms, zona)}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className={styles.zonaResumen}>
              «--:--» = el sol no cruza esa altura ese día. Horas de {zona} ({desfaseTexto}).
            </p>
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
              <h4><span aria-hidden="true">🌅</span> Características</h4>
              <ul>
                <li>Luz cálida y suave</li>
                <li>Sombras largas y difusas</li>
                <li>Bajo contraste</li>
                <li>Colores saturados</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📸</span> Ideal para</h4>
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
              <h4><span aria-hidden="true">🔵</span> Características</h4>
              <ul>
                <li>Cielo azul intenso</li>
                <li>Luz ambiente equilibrada</li>
                <li>Las luces artificiales brillan</li>
                <li>Ambiente misterioso</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📸</span> Ideal para</h4>
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
              <span className={styles.twilightIcon} aria-hidden="true">🌅</span>
              <div>
                <strong>Crepúsculo civil</strong> (sol entre 0° y -6°)
                <p>Suficiente luz para actividades al aire libre sin iluminación artificial.</p>
              </div>
            </div>
            <div className={styles.twilightRow}>
              <span className={styles.twilightIcon} aria-hidden="true">🌌</span>
              <div>
                <strong>Crepúsculo náutico</strong> (sol entre -6° y -12°)
                <p>El horizonte marino aún es visible. Estrellas brillantes aparecen.</p>
              </div>
            </div>
            <div className={styles.twilightRow}>
              <span className={styles.twilightIcon} aria-hidden="true">✨</span>
              <div>
                <strong>Crepúsculo astronómico</strong> (sol entre -12° y -18°)
                <p>Cielo casi completamente oscuro. Ideal para astrofotografía.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 1: TABLA COMPARATIVA ===== */}
        <section className={styles.eduComparativaSection}>
          <h3><span aria-hidden="true">🎨</span> Comparativa de Períodos de Luz</h3>
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
                  <td>25–45 min (más cerca de los polos)</td>
                  <td>Cálida, suave, sombras largas</td>
                  <td>Retratos, bodas, paisajes</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>Golden Hour tarde</td>
                  <td>2.000–3.500K</td>
                  <td>25–45 min (más cerca de los polos)</td>
                  <td>Dorada intensa, dramática</td>
                  <td>Arquitectura, atardeceres, moda</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>Blue Hour mañana</td>
                  <td>9.000–12.000K</td>
                  <td>20–35 min</td>
                  <td>Azul profundo, equilibrada</td>
                  <td>Urbana, monumentos, larga exp.</td>
                  <td>Alta (trípode necesario)</td>
                </tr>
                <tr>
                  <td>Blue Hour tarde</td>
                  <td>9.000–12.000K</td>
                  <td>20–35 min</td>
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
          <h3><span aria-hidden="true">📸</span> Casos de Uso por Tipo de Fotografía</h3>
          <p className={styles.eduEscenariosSubtitle}>Cómo aprovechar la Golden Hour según tu especialidad</p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon} aria-hidden="true">🏔️</span>
                <h4>Fotografía de Paisaje</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Madrid, 21 de junio: Golden Hour de tarde ≈ 21:07–21:48 (hora peninsular). Llega 30 min antes. Busca primer plano en sombra + horizonte iluminado.</p>
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
          <h3><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre Golden Hour</h3>
          <p className={styles.eduFaqSubtitle}>Todo lo que necesitas saber para planificar tus sesiones</p>
          <div className={styles.eduFaqList}>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuánto dura exactamente la Golden Hour?</h4>
              <p>Depende sobre todo de la latitud: cuanto más lejos del ecuador, más oblicua es la subida del sol y más dura. Tomando la hora dorada como el tramo entre la salida del sol y los 6° de altura, en Quito (ecuador) dura unos 27–30 minutos todo el año; en Madrid o Buenos Aires, entre 33 y 44 minutos; en Oslo, casi una hora en los equinoccios y más de dos en diciembre, y por encima del círculo polar puede durar toda la noche. La época del año influye menos: es algo más corta en los equinoccios y algo más larga en los solsticios. Esta calculadora te da los horarios exactos para cualquier lugar y fecha. <span aria-hidden="true">💡</span> Consejo: Planifica llegar 15 minutos antes del inicio.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuál es mejor: Golden Hour de mañana o de tarde?</h4>
              <p>Depende del objetivo. La Golden Hour de mañana tiene luz más fría (3.000–4.000K) y el ambiente suele estar más tranquilo, ideal para paisajes sin gente. La de tarde es más cálida (2.000–3.000K) y dramática, perfecta para retratos y arquitectura. Además, las nubes al atardecer tienden a coger más color que al amanecer. <span aria-hidden="true">💡</span> Consejo: Si fotografías personas, preferirás la tarde. Para naturaleza y paisajes solitarios, la mañana.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo varía la Golden Hour según la estación?</h4>
              <p>Lo que más cambia con la estación es el horario, no la duración. En Madrid, el 21 de diciembre el sol sale a las 8:34 y la hora dorada de la mañana dura unos 43 minutos; el 21 de junio sale a las 6:45 y dura unos 41. Casi dos horas de diferencia en el horario y apenas dos minutos en la duración. En latitudes extremas (por encima de 60°) sí cambia mucho: en verano puede durar varias horas o la noche entera. <span aria-hidden="true">💡</span> Consejo: Comprueba el horario de cada fecha; no reutilices el de otra estación.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Hace falta trípode en Golden Hour?</h4>
              <p>En Golden Hour (sol entre 0° y 6°) generalmente no es necesario trípode: hay luz suficiente para velocidades &gt;1/100s con ISO 400–800. Sin embargo, en Blue Hour (sol entre 0° y -6°) el trípode es imprescindible: necesitarás exposiciones de 1–10 segundos para capturar el cielo azul con luces artificiales equilibradas. <span aria-hidden="true">💡</span> Consejo: Lleva siempre el trípode aunque sea Golden Hour. Si el cielo se llena de nubes, la luz cae drásticamente.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo afecta la nubosidad a la Golden Hour?</h4>
              <p>Las nubes son aliadas en Golden Hour: pueden multiplicar los colores naranjas/rojos y crear cielos espectaculares. Las mejores fotos de Golden Hour suelen tener nubes dispersas (cirros o cúmulos). El cielo completamente despejado produce colores menos intensos. Las nubes densas bloquean la luz dorada pero crean luz difusa perfecta para retratos. <span aria-hidden="true">💡</span> Consejo: Sigue el parte meteorológico. Nubes dispersas + horizonte despejado = foto épica garantizada.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué ajustes de cámara usar en Golden Hour?</h4>
              <p>Puntos de partida: f/8 (paisajes), f/2.8 (retratos), ISO 100–400, velocidad según luz disponible. Balance de blancos: &quot;Soleado&quot; (5500K) mantiene los tonos cálidos; &quot;Auto&quot; puede enfriar la imagen. En Blue Hour: f/8, ISO 400–800, velocidad 1–10 segundos. <span aria-hidden="true">💡</span> Consejo: Desactiva el auto-ISO en Golden Hour. El ISO base más bajo de tu cámara da el máximo detalle en las sombras largas características de este período.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿La Golden Hour sirve para fotografía de interior?</h4>
              <p>Indirectamente sí. Si la habitación tiene ventanas orientadas al este (mañana) u oeste (tarde), la luz dorada entrará creando haces de luz dramáticos y sombras largas. Para maximizarlo: abre persianas justo en Golden Hour, usa la luz como backlight o sidelight. <span aria-hidden="true">💡</span> Consejo: Los fotógrafos de inmuebles suelen programar sus sesiones en Golden Hour precisamente por la calidad de la luz natural que entra por las ventanas.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo uso las coordenadas GPS para planificar?</h4>
              <p>Las coordenadas determinan con precisión la hora de salida/puesta del sol y la duración del crepúsculo. Una diferencia de 1° de longitud (desplazarse hacia el este o el oeste) adelanta o retrasa el amanecer unos 4 minutos. La latitud apenas lo mueve en los equinoccios y lo mueve mucho cerca de los solsticios. Esta herramienta calcula los horarios exactos con coordenadas precisas. Para planificación avanzada: usa Google Maps para identificar la dirección del amanecer/atardecer y elegir el encuadre antes de llegar. <span aria-hidden="true">💡</span> Consejo: El azimut solar (dirección del sol) es tan importante como la hora. El sol sale exactamente por el este solo en los equinoccios.</p>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 4: GUÍA PASO A PASO ===== */}
        <section className={styles.eduStepSection}>
          <h3><span aria-hidden="true">📋</span> Guía: Planifica tu Sesión de Golden Hour</h3>
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
                <p>Consulta los horarios para el día exacto. Como referencia, en España el 21 de junio el sol sale entre las 6:14 de Mahón y las 6:58 de Vigo (y a las 7:05–7:08, hora canaria, en Canarias); el 21 de diciembre llega a salir a las 9:00 en Galicia. Planifica con 2–3 semanas de antelación para confirmar disponibilidad del cliente.</p>
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
          <h3><span aria-hidden="true">✅</span> 6 Prácticas Esenciales del Fotógrafo</h3>
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
