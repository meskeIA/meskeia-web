'use client';

import { useState, useEffect } from 'react';
import styles from './InformacionTiempo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// API Key de OpenWeatherMap (límite gratuito: 1000 calls/día)
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  dt: number;
  timezone: number;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt: string;
}

interface ForecastData {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
  };
}

// Ciudades populares para acceso rápido
const CIUDADES_POPULARES = [
  { nombre: 'Madrid', pais: 'ES' },
  { nombre: 'Barcelona', pais: 'ES' },
  { nombre: 'Valencia', pais: 'ES' },
  { nombre: 'Sevilla', pais: 'ES' },
  { nombre: 'Bilbao', pais: 'ES' },
  { nombre: 'Londres', pais: 'GB' },
  { nombre: 'París', pais: 'FR' },
  { nombre: 'Nueva York', pais: 'US' },
];

// Mapeo de iconos de OpenWeatherMap a emojis
const getWeatherEmoji = (iconCode: string): string => {
  const emojiMap: { [key: string]: string } = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return emojiMap[iconCode] || '🌡️';
};

// Obtener dirección del viento
const getWindDirection = (deg: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

// Formatear hora
const formatTime = (timestamp: number, timezone: number): string => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

// Formatear fecha
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

export default function InformacionTiempoPage() {
  const [ciudad, setCiudad] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState<string[]>([]);

  // Cargar historial al inicio
  useEffect(() => {
    const saved = localStorage.getItem('weather-history');
    if (saved) {
      try {
        setHistorial(JSON.parse(saved));
      } catch {
        // Ignorar errores de parsing
      }
    }

    // Intentar obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          buscarPorCoordenadas(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Si no hay permiso, buscar Madrid por defecto
          buscarCiudad('Madrid');
        }
      );
    } else {
      buscarCiudad('Madrid');
    }
  }, []);

  // Guardar historial
  const guardarHistorial = (nombreCiudad: string) => {
    const nuevoHistorial = [nombreCiudad, ...historial.filter(c => c !== nombreCiudad)].slice(0, 5);
    setHistorial(nuevoHistorial);
    localStorage.setItem('weather-history', JSON.stringify(nuevoHistorial));
  };

  // Buscar tiempo por ciudad
  const buscarCiudad = async (nombreCiudad: string) => {
    if (!nombreCiudad.trim()) return;
    if (!OPENWEATHER_API_KEY) {
      setError('API key no configurada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Obtener tiempo actual
      const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(nombreCiudad)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
      const weatherRes = await fetch(weatherUrl);

      if (!weatherRes.ok) {
        if (weatherRes.status === 404) {
          throw new Error('Ciudad no encontrada');
        }
        throw new Error('Error al obtener datos del tiempo');
      }

      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      // Obtener pronóstico
      const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(nombreCiudad)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
      const forecastRes = await fetch(forecastUrl);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData);
      }

      guardarHistorial(weatherData.name);
      setCiudad('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar el tiempo');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // Buscar por coordenadas
  const buscarPorCoordenadas = async (lat: number, lon: number) => {
    if (!OPENWEATHER_API_KEY) {
      setError('API key no configurada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error('Error al obtener ubicación');
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
      const forecastRes = await fetch(forecastUrl);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData);
      }

      guardarHistorial(weatherData.name);

    } catch (err) {
      setError('Error al obtener el tiempo de tu ubicación');
    } finally {
      setLoading(false);
    }
  };

  // Obtener pronóstico diario (agrupar por día)
  const getPronosticoDiario = (): { fecha: string; tempMin: number; tempMax: number; icon: string; desc: string }[] => {
    if (!forecast) return [];

    const dias: { [key: string]: ForecastItem[] } = {};

    forecast.list.forEach(item => {
      const fecha = item.dt_txt.split(' ')[0];
      if (!dias[fecha]) dias[fecha] = [];
      dias[fecha].push(item);
    });

    return Object.entries(dias).slice(0, 5).map(([fecha, items]) => {
      const temps = items.map(i => i.main.temp);
      const midday = items.find(i => i.dt_txt.includes('12:00')) || items[0];

      return {
        fecha: formatDate(items[0].dt),
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        icon: midday.weather[0].icon,
        desc: midday.weather[0].description,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buscarCiudad(ciudad);
  };

  const pronosticoDiario = getPronosticoDiario();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Información del Tiempo</h1>
        <p className={styles.subtitle}>
          Consulta el tiempo actual y pronóstico para cualquier ciudad
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Buscador */}
        <div className={styles.searchPanel}>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Buscar ciudad..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn} disabled={loading}>
              {loading ? '...' : '🔍'}
            </button>
          </form>

          {/* Ciudades populares */}
          <div className={styles.ciudadesRapidas}>
            {CIUDADES_POPULARES.map((c) => (
              <button
                key={c.nombre}
                onClick={() => buscarCiudad(c.nombre)}
                className={styles.ciudadBtn}
                disabled={loading}
              >
                {c.nombre}
              </button>
            ))}
          </div>

          {/* Historial */}
          {historial.length > 0 && (
            <div className={styles.historialSection}>
              <span className={styles.historialLabel}>Recientes:</span>
              {historial.map((c) => (
                <button
                  key={c}
                  onClick={() => buscarCiudad(c)}
                  className={styles.historialBtn}
                  disabled={loading}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Botón ubicación */}
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => buscarPorCoordenadas(pos.coords.latitude, pos.coords.longitude),
                  () => setError('No se pudo obtener tu ubicación')
                );
              }
            }}
            className={styles.ubicacionBtn}
            disabled={loading}
          >
            📍 Usar mi ubicación
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorPanel}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className={styles.loadingPanel}>
            <div className={styles.spinner}></div>
            <span>Cargando...</span>
          </div>
        )}

        {/* Resultado del tiempo actual */}
        {weather && !loading && (
          <>
            <div className={styles.weatherPanel}>
              <div className={styles.weatherMain}>
                <div className={styles.weatherLocation}>
                  <h2>{weather.name}, {weather.sys.country}</h2>
                  <p className={styles.weatherDesc}>
                    {weather.weather[0].description}
                  </p>
                </div>

                <div className={styles.weatherTemp}>
                  <span className={styles.weatherEmoji}>
                    {getWeatherEmoji(weather.weather[0].icon)}
                  </span>
                  <span className={styles.tempValue}>
                    {Math.round(weather.main.temp)}°C
                  </span>
                </div>

                <div className={styles.weatherFeels}>
                  Sensación térmica: {Math.round(weather.main.feels_like)}°C
                </div>

                <div className={styles.tempRange}>
                  <span>🔺 {Math.round(weather.main.temp_max)}°</span>
                  <span>🔻 {Math.round(weather.main.temp_min)}°</span>
                </div>
              </div>

              <div className={styles.weatherDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>💧</span>
                  <span className={styles.detailLabel}>Humedad</span>
                  <span className={styles.detailValue}>{weather.main.humidity}%</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>💨</span>
                  <span className={styles.detailLabel}>Viento</span>
                  <span className={styles.detailValue}>
                    {Math.round(weather.wind.speed * 3.6)} km/h {getWindDirection(weather.wind.deg)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🌡️</span>
                  <span className={styles.detailLabel}>Presión</span>
                  <span className={styles.detailValue}>{weather.main.pressure} hPa</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>👁️</span>
                  <span className={styles.detailLabel}>Visibilidad</span>
                  <span className={styles.detailValue}>{(weather.visibility / 1000).toFixed(1)} km</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>☁️</span>
                  <span className={styles.detailLabel}>Nubes</span>
                  <span className={styles.detailValue}>{weather.clouds.all}%</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🌅</span>
                  <span className={styles.detailLabel}>Amanecer</span>
                  <span className={styles.detailValue}>
                    {formatTime(weather.sys.sunrise, weather.timezone)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🌇</span>
                  <span className={styles.detailLabel}>Atardecer</span>
                  <span className={styles.detailValue}>
                    {formatTime(weather.sys.sunset, weather.timezone)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pronóstico 5 días */}
            {pronosticoDiario.length > 0 && (
              <div className={styles.forecastPanel}>
                <h3 className={styles.forecastTitle}>Pronóstico 5 días</h3>
                <div className={styles.forecastGrid}>
                  {pronosticoDiario.map((dia, index) => (
                    <div key={index} className={styles.forecastDay}>
                      <span className={styles.forecastDate}>{dia.fecha}</span>
                      <span className={styles.forecastEmoji}>
                        {getWeatherEmoji(dia.icon)}
                      </span>
                      <span className={styles.forecastTemp}>
                        {dia.tempMax}° / {dia.tempMin}°
                      </span>
                      <span className={styles.forecastDesc}>{dia.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel informativo */}
      <div className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🌍</span>
            <div>
              <strong>Cobertura mundial</strong>
              <p>Datos de cualquier ciudad del mundo con OpenWeatherMap</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔄</span>
            <div>
              <strong>Datos actualizados</strong>
              <p>Información meteorológica actualizada cada 10 minutos</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📱</span>
            <div>
              <strong>Geolocalización</strong>
              <p>Detecta automáticamente tu ubicación actual</p>
            </div>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('informacion-tiempo')} />

      <Footer appName="informacion-tiempo" />
    </div>
  );
}
