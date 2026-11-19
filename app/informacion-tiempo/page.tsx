'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo } from 'react';
import styles from './InformacionTiempo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber, formatPercentage } from '@/lib';
import {
  cieloDeIcono,
  repartirPronostico,
  type Cielo,
  type DiaPronostico,
  type FranjaPronostico,
  type TramoPronostico,
} from '@/lib/calculadoras/franjasTiempo';
import { IconoTiempo, IconoDato, IconoBuscar, IconoUbicacion, type TipoDato } from './IconosTiempo';

// API Key de OpenWeatherMap (límite gratuito: 1000 calls/día)
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'; // enlace-ok: base de la API; responde 401 sin clave

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
    // temp_min / temp_max de /weather NO son los del día (dispersión entre estaciones en ese
    // instante): la máxima y la mínima salen del pronóstico, en repartirPronostico
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

// Respuesta de /forecast: 40 tramos de 3 h. `city.timezone` es el desfase de la ciudad
// respecto a UTC, en segundos; `dt_txt` va en UTC y por eso no se usa para agrupar
interface ForecastData {
  list: TramoPronostico[];
  city: {
    name: string;
    country: string;
    timezone: number;
  };
}

// Fecha de un día local de la ciudad (no del navegador): se construye en UTC y se formatea en UTC
const fechaDelDia = (dia: DiaPronostico, opciones: Intl.DateTimeFormatOptions): string =>
  new Date(Date.UTC(dia.anio, dia.mes - 1, dia.dia, 12)).toLocaleDateString('es-ES', {
    ...opciones,
    timeZone: 'UTC',
  });

const rangoTemperatura = (f: FranjaPronostico): string =>
  f.tempMin === f.tempMax ? `${f.tempMax}°` : `${f.tempMin}° / ${f.tempMax}°`;

// Fondo de la tarjeta del tiempo actual según el cielo (contraste del blanco medido en los cuatro)
const CLASE_CIELO: Record<Cielo, string> = {
  despejado: styles.cieloDespejado,
  nubes: styles.cieloNubes,
  lluvia: styles.cieloLluvia,
  noche: styles.cieloNoche,
};

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

// Visibilidad en km: «10 km», «2,5 km» (antes «10.0 km», con toFixed)
const formatVisibilidad = (metros: number): string => {
  const km = metros / 1000;
  return `${formatNumber(km, Number.isInteger(km) ? 0 : 1)} km`;
};

/**
 * Franjas (mañana, tarde, noche) en columnas. La usan la tarjeta de hoy y el día desplegado
 * del pronóstico; en la tarjeta de hoy la descripción va solo para el lector de pantalla.
 */
function FilaFranjas({ franjas, enTarjeta }: { franjas: FranjaPronostico[]; enTarjeta: boolean }) {
  return (
    <div
      className={`${styles.franjas} ${enTarjeta ? styles.franjasTarjeta : ''}`}
      style={{ gridTemplateColumns: `repeat(${franjas.length}, minmax(0, 1fr))` }}
    >
      {franjas.map((f) => (
        <div key={f.clave} className={styles.franja}>
          <span className={styles.franjaNombre}>{f.nombre}</span>
          <span className={styles.franjaHoras}>{f.horas}</span>
          <IconoTiempo codigo={f.icon} className={styles.franjaIcono} />
          <span className={styles.franjaTemp}>{rangoTemperatura(f)}</span>
          <span className={enTarjeta ? 'sr-only' : styles.franjaDesc}>{f.desc}</span>
          <span className={styles.franjaDato}>
            <IconoDato tipo="gota" className={styles.franjaDatoIcono} />
            <span className="sr-only">Probabilidad de lluvia </span>
            {formatPercentage(f.probLluvia, 0)}
          </span>
          <span className={styles.franjaDato}>
            {f.precipitacionMm > 0 ? `${formatNumber(f.precipitacionMm, 1)} mm` : ''}
          </span>
          <span className={styles.franjaDato}>
            <IconoDato tipo="viento" className={styles.franjaDatoIcono} />
            <span className="sr-only">Viento máximo </span>
            {f.vientoMaxKmh} km/h
          </span>
        </div>
      ))}
    </div>
  );
}

export default function InformacionTiempoPage() {
  const [ciudad, setCiudad] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState<string[]>([]);
  const [diaAbierto, setDiaAbierto] = useState<string | null>(null);

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
        setDiaAbierto(null);
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
        setDiaAbierto(null);
      }

      guardarHistorial(weatherData.name);

    } catch (err) {
      setError('Error al obtener el tiempo de tu ubicación');
    } finally {
      setLoading(false);
    }
  };

  // Hoy (va en la tarjeta del tiempo actual) y los días siguientes completos, en la hora
  // local de la ciudad consultada
  const reparto = useMemo(
    () =>
      forecast && weather
        ? repartirPronostico(
            forecast.list,
            forecast.city.timezone ?? 0,
            weather.dt,
            weather.main.temp
          )
        : null,
    [forecast, weather]
  );
  const hoy = reparto?.hoy ?? null;
  const extremosHoy = reparto?.extremosHoy ?? null;
  const siguientes = reparto?.siguientes ?? [];

  // Escala común de las barras de temperatura del pronóstico
  const escalaMin = Math.min(...siguientes.map(d => d.tempMin));
  const escalaMax = Math.max(...siguientes.map(d => d.tempMax));
  const escalaRango = Math.max(escalaMax - escalaMin, 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buscarCiudad(ciudad);
  };

  const usarUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => buscarPorCoordenadas(pos.coords.latitude, pos.coords.longitude),
        () => setError('No se pudo obtener tu ubicación')
      );
    }
  };

  // Posición del sol entre el amanecer y el atardecer, en la hora de la observación
  const fraccionSol = weather
    ? (weather.dt - weather.sys.sunrise) / Math.max(weather.sys.sunset - weather.sys.sunrise, 1)
    : 0;
  const esDeDia = fraccionSol >= 0 && fraccionSol <= 1;

  const datosActuales: Array<{ tipo: TipoDato; etiqueta: string; valor: string }> = weather
    ? [
        { tipo: 'sensacion', etiqueta: 'Sensación térmica', valor: `${Math.round(weather.main.feels_like)}°` },
        { tipo: 'humedad', etiqueta: 'Humedad', valor: formatPercentage(weather.main.humidity / 100, 0) },
        {
          tipo: 'viento',
          etiqueta: 'Viento',
          valor: `${formatNumber(weather.wind.speed * 3.6, 0)} km/h ${getWindDirection(weather.wind.deg)}`,
        },
        { tipo: 'presion', etiqueta: 'Presión', valor: `${formatNumber(weather.main.pressure, 0)} hPa` },
        { tipo: 'visibilidad', etiqueta: 'Visibilidad', valor: formatVisibilidad(weather.visibility) },
        { tipo: 'nubes', etiqueta: 'Nubosidad', valor: formatPercentage(weather.clouds.all / 100, 0) },
      ]
    : [];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Información del Tiempo</h1>
        <p className={styles.subtitle}>
          Consulta el tiempo actual y pronóstico para cualquier ciudad
        </p>
      </header>

      <div className={styles.columna}>
        <LegalNotice />
      </div>

      <div className={styles.mainContent}>
        {/* Buscador */}
        <div className={styles.searchPanel}>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Buscar ciudad..."
              aria-label="Ciudad"
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn} disabled={loading} aria-label={loading ? 'Buscando' : 'Buscar'}>
              <IconoBuscar className={styles.btnIcono} />
            </button>
            <button
              type="button"
              onClick={usarUbicacion}
              className={styles.ubicacionBtn}
              disabled={loading}
              aria-label="Usar mi ubicación"
              title="Usar mi ubicación"
            >
              <IconoUbicacion className={styles.btnIcono} />
            </button>
          </form>

          {/* Recientes primero y luego las populares que no estén ya */}
          <div className={styles.ciudadesRapidas}>
            {historial.map((c) => (
              <button
                type="button"
                key={`r-${c}`}
                onClick={() => buscarCiudad(c)}
                className={`${styles.ciudadBtn} ${styles.ciudadReciente}`}
                disabled={loading}
                title="Reciente"
              >
                {c}
              </button>
            ))}
            {CIUDADES_POPULARES.filter((c) => !historial.includes(c.nombre)).map((c) => (
              <button
                type="button"
                key={c.nombre}
                onClick={() => buscarCiudad(c.nombre)}
                className={styles.ciudadBtn}
                disabled={loading}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorPanel} role="alert">
            <span><span aria-hidden="true">⚠️</span> {error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className={styles.loadingPanel} role="status">
            <div className={styles.spinner}></div>
            <span>Cargando...</span>
          </div>
        )}

        {/* Resultado del tiempo actual */}
        {weather && !loading && (
          <>
            <section
              className={`${styles.actual} ${CLASE_CIELO[cieloDeIcono(weather.weather[0].icon)]}`}
              data-cielo={cieloDeIcono(weather.weather[0].icon)}
              aria-labelledby="tiempo-ciudad"
            >
              <div className={styles.actualCabecera}>
                <h2 id="tiempo-ciudad" className={styles.actualCiudad}>
                  {weather.name}, {weather.sys.country}
                </h2>
                <span className={styles.actualHora}>
                  Datos de las {formatTime(weather.dt, weather.timezone)}
                </span>
              </div>

              <div className={styles.actualTemp}>
                <IconoTiempo codigo={weather.weather[0].icon} className={styles.actualIcono} />
                <span className={styles.actualGrados}>{Math.round(weather.main.temp)}°</span>
              </div>

              <p className={styles.actualResumen}>
                <span className={styles.primeraMayuscula}>{weather.weather[0].description}</span>
                <span>
                  {extremosHoy ? ` · máx. ${extremosHoy.max}° · mín. ${extremosHoy.min}°` : ''}
                </span>
              </p>

              {hoy && hoy.franjas.length > 0 && (
                <section className={styles.hoy} aria-labelledby="tiempo-hoy">
                  <h3 id="tiempo-hoy" className={styles.hoyTitulo}>Lo que queda de hoy</h3>
                  <FilaFranjas franjas={hoy.franjas} enTarjeta />
                </section>
              )}
            </section>

            <div className={styles.datos}>
              {datosActuales.map((d) => (
                <div key={d.tipo} className={styles.dato}>
                  <span className={styles.datoEtiqueta}>
                    <IconoDato tipo={d.tipo} className={styles.datoIcono} />
                    {d.etiqueta}
                  </span>
                  <span className={styles.datoValor}>{d.valor}</span>
                </div>
              ))}
            </div>

            <div className={styles.sol}>
              <div className={styles.solFila}>
                <span className={styles.datoEtiqueta}>Amanecer</span>
                <span className={styles.datoEtiqueta}>Atardecer</span>
              </div>
              <div className={styles.solPista} aria-hidden="true">
                <span
                  className={`${styles.solPunto} ${esDeDia ? '' : styles.solPuntoNoche}`}
                  style={{ left: `${Math.min(Math.max(fraccionSol, 0), 1) * 100}%` }}
                />
              </div>
              <div className={styles.solFila}>
                <span className={styles.solHora}>{formatTime(weather.sys.sunrise, weather.timezone)}</span>
                <span className={styles.solHora}>{formatTime(weather.sys.sunset, weather.timezone)}</span>
              </div>
            </div>

            {/* Próximos días */}
            {siguientes.length > 0 && (
              <section className={styles.pronostico} aria-labelledby="tiempo-proximos">
                <h3 id="tiempo-proximos" className={styles.pronosticoTitulo}>Próximos días</h3>
                <p className={styles.pronosticoNota}>
                  Toca un día para verlo por franjas. Horas locales de {forecast?.city.name}.
                </p>
                <ul className={styles.dias} aria-labelledby="tiempo-proximos">
                  {siguientes.map((dia) => {
                    const abierto = dia.clave === diaAbierto;
                    const idPanel = `franjas-${dia.clave}`;
                    const fechaLarga = fechaDelDia(dia, { weekday: 'long', day: 'numeric', month: 'long' });
                    const lluvia = Math.max(...dia.franjas.map(f => f.probLluvia));
                    return (
                      <li key={dia.clave} className={styles.diaItem}>
                        <button
                          type="button"
                          className={`${styles.dia} ${abierto ? styles.diaAbierto : ''}`}
                          aria-expanded={abierto}
                          aria-controls={abierto ? idPanel : undefined}
                          onClick={() => setDiaAbierto(abierto ? null : dia.clave)}
                        >
                          <span className={styles.diaFecha}>
                            {fechaDelDia(dia, { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className={styles.diaCielo}>
                            <IconoTiempo codigo={dia.icon} className={styles.diaIcono} />
                            <span className="sr-only">{dia.desc}</span>
                          </span>
                          <span className={styles.diaLluvia}>
                            {lluvia >= 0.1 ? formatPercentage(lluvia, 0) : ''}
                          </span>
                          <span className={styles.diaMin}>
                            <span className="sr-only">mínima </span>{dia.tempMin}°
                          </span>
                          <span className={styles.diaBarra} aria-hidden="true">
                            <span
                              className={styles.diaBarraRango}
                              style={{
                                left: `${((dia.tempMin - escalaMin) / escalaRango) * 100}%`,
                                width: `${Math.max(((dia.tempMax - dia.tempMin) / escalaRango) * 100, 4)}%`,
                              }}
                            />
                          </span>
                          <span className={styles.diaMax}>
                            <span className="sr-only">máxima </span>{dia.tempMax}°
                          </span>
                          <span className={styles.diaChevron} aria-hidden="true">
                            {abierto ? '▴' : '▾'}
                          </span>
                        </button>
                        {abierto && (
                          <section id={idPanel} className={styles.diaPanel} aria-label={`Franjas del ${fechaLarga}`}>
                            <FilaFranjas franjas={dia.franjas} enTarjeta={false} />
                          </section>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      {/* Panel informativo */}
      <div className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <ul className={styles.infoLista}>
          <li>
            <strong>Cobertura mundial.</strong> Datos de cualquier ciudad del mundo con OpenWeatherMap.
          </li>
          <li>
            <strong>Datos actualizados.</strong> OpenWeatherMap actualiza sus datos cada ~10 minutos;
            vuelve a buscar para ver la información más reciente.
          </li>
          <li>
            <strong>Lo que queda de hoy.</strong> El pronóstico gratuito no incluye las horas ya pasadas:
            la máxima y la mínima de hoy son las de lo que queda, noche incluida.
          </li>
        </ul>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres entender mejor el tiempo y la meteorología?"
        subtitle="Aprende a interpretar el pronóstico, los fenómenos meteorológicos y cómo sacarle el máximo partido a la información del tiempo"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Fenómenos meteorológicos en España: guía práctica</h2>
          <p>
            Cada fenómeno tiene condiciones típicas, riesgos específicos y consejos distintos.
            Esta tabla te ayuda a prepararte para cualquier situación atmosférica.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Fenómeno</th>
                  <th>Temp. típica España</th>
                  <th>Humedad relativa</th>
                  <th>Visibilidad</th>
                  <th>Riesgo conducción</th>
                  <th>Vestimenta</th>
                  <th>Actividades recomendadas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span aria-hidden="true">☀️</span> Sol despejado</td>
                  <td>20 – 40 °C</td>
                  <td>20 – 50 %</td>
                  <td>&gt; 10 km</td>
                  <td>Bajo (deslumbramiento posible)</td>
                  <td>Ropa ligera, protector solar</td>
                  <td>Senderismo, playa, deportes al aire libre</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🌧️</span> Lluvia moderada</td>
                  <td>8 – 18 °C</td>
                  <td>75 – 90 %</td>
                  <td>2 – 8 km</td>
                  <td>Medio (firme mojado)</td>
                  <td>Impermeable, calzado antideslizante</td>
                  <td>Museos, cine, actividades interiores</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">❄️</span> Nieve</td>
                  <td>-5 – 2 °C</td>
                  <td>70 – 95 %</td>
                  <td>0,5 – 5 km</td>
                  <td>Alto (cadenas obligatorias en montaña)</td>
                  <td>Abrigo de abrigo, guantes, botas impermeables</td>
                  <td>Esquí, excursiones con equipamiento adecuado</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">⛈️</span> Tormenta eléctrica</td>
                  <td>15 – 30 °C</td>
                  <td>60 – 95 %</td>
                  <td>0,5 – 5 km</td>
                  <td>Alto (lluvia intensa, granizo)</td>
                  <td>Impermeable, evitar paraguas metálico</td>
                  <td>Permanecer en interior, alejarse de árboles</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🌫️</span> Niebla</td>
                  <td>0 – 15 °C</td>
                  <td>90 – 100 %</td>
                  <td>&lt; 1 km</td>
                  <td>Muy alto (luces antiniebla obligatorias)</td>
                  <td>Ropa de abrigo, ropa de color vivo</td>
                  <td>Actividades sedentarias, evitar montaña</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🌨️</span> Granizo</td>
                  <td>2 – 20 °C</td>
                  <td>60 – 90 %</td>
                  <td>1 – 5 km</td>
                  <td>Alto (daños en vehículos, firme resbaladizo)</td>
                  <td>Chubasquero, casco si en bicicleta</td>
                  <td>Buscar refugio inmediato, proteger vehículos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Para quién es útil consultar el tiempo?</h2>
          <p>
            La información meteorológica es clave para la toma de decisiones en muy distintos
            perfiles. Aquí te mostramos cuatro casos de uso habituales.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌾</span>
                <h4>Agricultor y ganadero</h4>
              </div>
              <p className={styles.escenarioExample}>
                La previsión de lluvias a 5-7 días determina cuándo regar, tratar con
                fitosanitarios o recoger la cosecha. Una tormenta inesperada puede arruinar
                una vendimia si no se consulta el pronóstico con antelación.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa las alertas de precipitación y viento de AEMET para planificar
                las tareas de campo con margen suficiente.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
                <h4>Viajero</h4>
              </div>
              <p className={styles.escenarioExample}>
                Conocer el tiempo del destino permite elegir el equipaje correcto: ¿bañador
                o abrigo? ¿sandalias o botas de lluvia? Un destino aparentemente soleado
                puede tener lluvias vespertinas frecuentes en verano.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: consulta el clima histórico del mes de viaje, no solo la previsión
                a 5 días. Combina ambos para una mejor planificación.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚵</span>
                <h4>Deportista outdoor</h4>
              </div>
              <p className={styles.escenarioExample}>
                Para senderismo, ciclismo o surf, la temperatura, el viento y la probabilidad
                de lluvia son datos críticos. Una racha de viento de 60 km/h hace inviable
                una salida en bicicleta de montaña o en kayak.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: revisa la previsión horaria, no solo la diaria. El tiempo puede
                cambiar radicalmente en pocas horas, especialmente en zonas costeras y de montaña.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎉</span>
                <h4>Organizador de eventos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Bodas, conciertos y festivales al aire libre dependen del tiempo. Una
                probabilidad de lluvia superior al 50 % el día del evento obliga a tener
                un plan B: carpa, cambio de fecha o seguro de cancelación por meteorología.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: contrata un seguro meteorológico para eventos con más de 100
                asistentes. En España, Agroseguro cubre este tipo de riesgos.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre meteorología y pronósticos</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Con cuántos días de antelación es fiable la previsión?</summary>
                <p>
                  Los modelos meteorológicos modernos son fiables hasta 5-7 días en zonas
                  con orografía sencilla. A partir del día 7 la incertidumbre crece de forma
                  exponencial. Las previsiones a 10-14 días solo deben tomarse como tendencias
                  generales, no como pronóstico preciso.
                </p>
                <p className={styles.faqTip}>
                  Dato: AEMET actualiza sus modelos cada 6 horas con nuevos datos de
                  radiosondeos, satélites y boyas oceánicas.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué significa la probabilidad de lluvia del 40 %?</summary>
                <p>
                  Significa que en el 40 % de las simulaciones realizadas por los modelos
                  meteorológicos, se produciría precipitación en esa zona y período. No indica
                  que vaya a llover el 40 % del tiempo, sino que hay un 40 % de probabilidad
                  de que llueva en algún momento del período previsto.
                </p>
                <p className={styles.faqTip}>
                  Consejo: por encima del 60 % es prudente llevar paraguas. Por encima
                  del 80 %, planifica actividades de interior.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo se mide la temperatura oficial?</summary>
                <p>
                  La temperatura oficial se mide en una garita meteorológica estándar (OMM),
                  a 1,5 metros del suelo, en sombra y con ventilación. Por eso puede diferir
                  de lo que marca un termómetro en tu terraza o al sol. Los récords de
                  temperatura se registran siempre bajo estas condiciones controladas.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué diferencia hay entre tiempo y clima?</summary>
                <p>
                  El <strong>tiempo</strong> es el estado de la atmósfera en un momento y lugar
                  concretos (hoy llueve en Madrid). El <strong>clima</strong> es el patrón
                  estadístico del tiempo a lo largo de al menos 30 años (en Madrid los veranos
                  son secos y calurosos). El tiempo cambia a diario; el clima es una tendencia
                  estacional y geográfica.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué es el índice UV y cuándo es peligroso?</summary>
                <p>
                  El índice UV mide la intensidad de la radiación ultravioleta del sol en una
                  escala del 0 al 11+. A partir de 3 es recomendable usar protector solar.
                  Por encima de 6 es necesario usar SPF 30+ y ropa protectora. Por encima
                  de 8 se recomienda evitar la exposición directa entre las 12 y las 16 h.
                  En España, en verano, el índice puede superar el 10 en zonas del sur.
                </p>
                <p className={styles.faqTip}>
                  Riesgo: 0-2 bajo, 3-5 moderado, 6-7 alto, 8-10 muy alto, 11+ extremo.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Por qué cambia tanto el pronóstico en montaña?</summary>
                <p>
                  La orografía crea microclimas muy localizados. Una ladera sur puede estar
                  soleada mientras la norte está en niebla. Los cambios de altitud de 500 m
                  pueden suponer diferencias de 3-4 °C y una probabilidad de lluvia muy
                  distinta. Los modelos globales tienen una resolución de 10-25 km, insuficiente
                  para capturar estos matices. En montaña siempre consulta el boletín específico
                  de altura de AEMET.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué es la sensación térmica?</summary>
                <p>
                  La sensación térmica es la temperatura que percibe el cuerpo humano,
                  combinando temperatura real, viento y humedad. Con frío y viento, la
                  sensación baja respecto a la temperatura real (factor viento-frío). Con
                  calor y alta humedad, la sensación sube porque el cuerpo no puede
                  refrigerarse eficazmente mediante la sudoración.
                </p>
                <p className={styles.faqTip}>
                  Ejemplo: 20 °C con viento de 40 km/h puede sentirse como 14 °C.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo funciona AEMET?</summary>
                <p>
                  AEMET (Agencia Estatal de Meteorología) es el organismo oficial español
                  encargado de la vigilancia, predicción y climatología atmosférica. Según
                  datos publicados en aemet.es, utiliza modelos numéricos de predicción y
                  una amplia red de estaciones automáticas, radares, radiosondeos y
                  satélites. Sus predicciones y avisos son la referencia oficial para
                  Protección Civil y usuarios profesionales.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo consultar e interpretar el pronóstico en 7 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Consulta la previsión horaria</strong>
                <p>
                  La previsión diaria solo muestra máximas y mínimas. La horaria te dice
                  exactamente a qué hora llueve, qué temperatura habrá por la tarde y cuándo
                  arrecia el viento. Es la más útil para planificar actividades concretas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Revisa la probabilidad de precipitación</strong>
                <p>
                  No te fijes solo en el icono de nubes o sol. Un 30 % de probabilidad puede
                  ignorarse; un 70 % requiere planificación. Combina este dato con la cantidad
                  prevista de lluvia (mm/h) para evaluar si será un chaparrón breve o lluvia
                  persistente.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Verifica el viento y las rachas máximas</strong>
                <p>
                  La velocidad media del viento puede ser moderada, pero las rachas máximas
                  son las que crean peligro. Una racha de 80 km/h puede volcar una sombrilla,
                  hacer caer ramas o complicar la conducción. Fíjate en el apartado de
                  &quot;racha máxima&quot; en los servicios meteorológicos detallados.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Comprueba el índice UV si hay sol</strong>
                <p>
                  En primavera y verano, especialmente en el sur de España, el índice UV
                  puede alcanzar niveles extremos (10+). Consulta el índice UV previsto y
                  aplica protección solar adecuada antes de salir, no cuando ya estés expuesto.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Revisa las alertas activas de AEMET</strong>
                <p>
                  AEMET emite avisos de fenómenos adversos en cuatro niveles: verde (sin
                  riesgo), amarillo (riesgo bajo), naranja (riesgo importante) y rojo (riesgo
                  extremo). Los avisos naranja y rojo requieren tomar medidas preventivas
                  concretas. Consúltalos en aemet.es o en la app de Protección Civil.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Ajusta tus actividades al pronóstico</strong>
                <p>
                  Con los datos en mano, decide: ¿puedo hacer la excursión prevista? ¿Necesito
                  cambiar de hora o de lugar? ¿Debo avisar al grupo? Anticípate al menos
                  24-48 horas cuando la actividad involucre a otras personas o tenga costes
                  de cancelación.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Confirma el día anterior con la previsión actualizada</strong>
                <p>
                  Aunque hayas consultado el tiempo días antes, los modelos mejoran su
                  precisión con datos más recientes. Siempre revisa la previsión la tarde-noche
                  anterior a tu actividad para confirmar o ajustar planes de última hora.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>6 mejores prácticas para usar la información meteorológica</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <h4>Consulta fuentes oficiales (AEMET)</h4>
              <p>
                Las apps comerciales pueden simplificar o interpretar datos de forma
                incorrecta. Ante situaciones de riesgo, usa siempre la fuente oficial:
                aemet.es o la app oficial de AEMET, que ofrece los datos brutos sin
                intermediarios.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚨</span>
              <h4>Revisa las alertas de Protección Civil</h4>
              <p>
                El sistema ES-Alert envía mensajes de emergencia al móvil en caso de alerta
                extrema. Activa las notificaciones y consulta la web de tu comunidad autónoma
                para avisos de nivel naranja o rojo que puedan afectar tu zona.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>Más de 3 días: usa rangos, no valores exactos</h4>
              <p>
                Las previsiones a más de 72 horas son probabilísticas. En lugar de &quot;el
                jueves llovará&quot;, interpreta &quot;hay entre un 60 y 80 % de probabilidad de
                precipitación el jueves&quot;. Los rangos de temperatura también amplían su
                margen con el tiempo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⛰️</span>
              <h4>En montaña, multiplica la precaución</h4>
              <p>
                La montaña crea su propio clima. Consulta el boletín específico de alta
                montaña de AEMET (disponible para los Pirineos, Sierra Nevada y otras cadenas)
                y revisa los partes de los refugios si vas a hacer travesías de más de un día.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📍</span>
              <h4>Verifica la previsión local vs. regional</h4>
              <p>
                La previsión por municipio puede diferir significativamente de la provincial.
                Una ciudad costera puede tener 10 °C más que el interior a solo 30 km. Busca
                siempre el punto de previsión más cercano a tu ubicación real.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📲</span>
              <h4>Descarga apps offline para zonas sin cobertura</h4>
              <p>
                En zonas de montaña, rurales o costeras remotas, la cobertura móvil puede
                fallar. Descarga los datos meteorológicos antes de salir y usa apps que
                permitan consultarlos sin conexión. Algunas como Windy o Meteored permiten
                guardar previsiones locales.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores habituales al consultar el tiempo</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Fiarse de previsiones a 10 o más días.</strong> A ese horizonte
                temporal, los modelos meteorológicos tienen una incertidumbre tan alta que
                las previsiones son básicamente tendencias climáticas, no pronósticos fiables.
                Úsalas solo como referencia muy general.
              </li>
              <li>
                <strong>Ignorar las alertas naranja y roja.</strong> Muchos accidentes
                relacionados con el tiempo ocurren porque las personas subestiman los avisos
                de nivel naranja (&quot;no será para tanto&quot;). Si hay alerta naranja o roja en tu
                zona, cambia o cancela tus planes sin dudar.
              </li>
              <li>
                <strong>No revisar la previsión actualizada el día anterior.</strong> El
                tiempo puede cambiar significativamente respecto a lo previsto hace 3 días.
                Una revisión la tarde anterior puede evitar sorpresas desagradables, especialmente
                para actividades outdoor o viajes en coche de larga distancia.
              </li>
              <li>
                <strong>Confundir la lluvia local con la regional.</strong> Que &quot;llueva en
                Madrid&quot; no significa que llueva en toda la provincia. La previsión por
                municipio o punto concreto es mucho más precisa que la de la capital
                autonómica o provincial.
              </li>
              <li>
                <strong>Ignorar las rachas de viento en actividades outdoor.</strong> El
                viento medio puede ser suave pero las rachas máximas son las que crean
                peligro real. Consulta siempre el dato de racha máxima si practicas ciclismo,
                navegación, parapente, senderismo en cresta o cualquier actividad expuesta.
              </li>
              <li>
                <strong>No consultar los avisos específicos de montaña.</strong> En zonas
                de alta montaña existen boletines específicos de AEMET (nevada, vendaval,
                aludes) que no aparecen en los resúmenes generales. Ignorarlos puede tener
                consecuencias muy graves en travesías de varios días.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="informacion-tiempo" />
      <Footer appName="informacion-tiempo" />
    </div>
  );
}
