'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './ConversorHorarios.module.css';
import { MeskeiaLogo, Footer, RelatedApps} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Importar estilos de flag-icons
import 'flag-icons/css/flag-icons.min.css';

// ==================== TIPOS ====================

interface ZonaHoraria {
  id: string;
  nombre: string;
  zona: string;
  pais: string;
  code: string; // Código ISO 3166-1 alpha-2 para flag-icons
  acronimo?: string; // Acrónimo común (CET, EST, etc.)
}

// Componente Flag que usa flag-icons
interface FlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Flag({ code, size = 'md', className = '' }: FlagProps) {
  const sizeClasses = {
    sm: styles.flagSm,
    md: styles.flagMd,
    lg: styles.flagLg,
  };

  return (
    <span
      className={`fi fi-${code} ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`Bandera de ${code.toUpperCase()}`}
    />
  );
}

// ==================== DATOS ====================

const zonasHorarias: ZonaHoraria[] = [
  // Europa
  { id: 'madrid', nombre: 'Madrid', zona: 'Europe/Madrid', pais: 'España', code: 'es', acronimo: 'CET/CEST' },
  { id: 'londres', nombre: 'Londres', zona: 'Europe/London', pais: 'Reino Unido', code: 'gb', acronimo: 'GMT/BST' },
  { id: 'paris', nombre: 'París', zona: 'Europe/Paris', pais: 'Francia', code: 'fr', acronimo: 'CET/CEST' },
  { id: 'berlin', nombre: 'Berlín', zona: 'Europe/Berlin', pais: 'Alemania', code: 'de', acronimo: 'CET/CEST' },
  { id: 'roma', nombre: 'Roma', zona: 'Europe/Rome', pais: 'Italia', code: 'it', acronimo: 'CET/CEST' },
  { id: 'amsterdam', nombre: 'Ámsterdam', zona: 'Europe/Amsterdam', pais: 'Países Bajos', code: 'nl', acronimo: 'CET/CEST' },
  { id: 'moscu', nombre: 'Moscú', zona: 'Europe/Moscow', pais: 'Rusia', code: 'ru', acronimo: 'MSK' },
  { id: 'estambul', nombre: 'Estambul', zona: 'Europe/Istanbul', pais: 'Turquía', code: 'tr', acronimo: 'TRT' },
  // América
  { id: 'nueva_york', nombre: 'Nueva York', zona: 'America/New_York', pais: 'EE.UU.', code: 'us', acronimo: 'EST/EDT' },
  { id: 'los_angeles', nombre: 'Los Ángeles', zona: 'America/Los_Angeles', pais: 'EE.UU.', code: 'us', acronimo: 'PST/PDT' },
  { id: 'chicago', nombre: 'Chicago', zona: 'America/Chicago', pais: 'EE.UU.', code: 'us', acronimo: 'CST/CDT' },
  { id: 'mexico', nombre: 'Ciudad de México', zona: 'America/Mexico_City', pais: 'México', code: 'mx', acronimo: 'CST' },
  { id: 'bogota', nombre: 'Bogotá', zona: 'America/Bogota', pais: 'Colombia', code: 'co', acronimo: 'COT' },
  { id: 'lima', nombre: 'Lima', zona: 'America/Lima', pais: 'Perú', code: 'pe', acronimo: 'PET' },
  { id: 'buenos_aires', nombre: 'Buenos Aires', zona: 'America/Argentina/Buenos_Aires', pais: 'Argentina', code: 'ar', acronimo: 'ART' },
  { id: 'santiago', nombre: 'Santiago', zona: 'America/Santiago', pais: 'Chile', code: 'cl', acronimo: 'CLT/CLST' },
  { id: 'sao_paulo', nombre: 'São Paulo', zona: 'America/Sao_Paulo', pais: 'Brasil', code: 'br', acronimo: 'BRT' },
  // Asia
  { id: 'tokio', nombre: 'Tokio', zona: 'Asia/Tokyo', pais: 'Japón', code: 'jp', acronimo: 'JST' },
  { id: 'pekin', nombre: 'Pekín', zona: 'Asia/Shanghai', pais: 'China', code: 'cn', acronimo: 'CST (China)' },
  { id: 'hong_kong', nombre: 'Hong Kong', zona: 'Asia/Hong_Kong', pais: 'Hong Kong', code: 'hk', acronimo: 'HKT' },
  { id: 'singapur', nombre: 'Singapur', zona: 'Asia/Singapore', pais: 'Singapur', code: 'sg', acronimo: 'SGT' },
  { id: 'seul', nombre: 'Seúl', zona: 'Asia/Seoul', pais: 'Corea del Sur', code: 'kr', acronimo: 'KST' },
  { id: 'dubai', nombre: 'Dubái', zona: 'Asia/Dubai', pais: 'EAU', code: 'ae', acronimo: 'GST' },
  { id: 'mumbai', nombre: 'Bombay', zona: 'Asia/Kolkata', pais: 'India', code: 'in', acronimo: 'IST' },
  { id: 'bangkok', nombre: 'Bangkok', zona: 'Asia/Bangkok', pais: 'Tailandia', code: 'th', acronimo: 'ICT' },
  // Oceanía
  { id: 'sydney', nombre: 'Sídney', zona: 'Australia/Sydney', pais: 'Australia', code: 'au', acronimo: 'AEST/AEDT' },
  { id: 'auckland', nombre: 'Auckland', zona: 'Pacific/Auckland', pais: 'Nueva Zelanda', code: 'nz', acronimo: 'NZST/NZDT' },
  // África
  { id: 'cairo', nombre: 'El Cairo', zona: 'Africa/Cairo', pais: 'Egipto', code: 'eg', acronimo: 'EET' },
  { id: 'johannesburgo', nombre: 'Johannesburgo', zona: 'Africa/Johannesburg', pais: 'Sudáfrica', code: 'za', acronimo: 'SAST' },
];

// Datos para la sección de referencia de acrónimos
const acronimosReferencia = [
  { acronimo: 'GMT', nombre: 'Greenwich Mean Time', utc: 'UTC+0', ciudades: 'Londres (invierno)' },
  { acronimo: 'CET', nombre: 'Central European Time', utc: 'UTC+1', ciudades: 'Madrid, París, Berlín, Roma (invierno)' },
  { acronimo: 'CEST', nombre: 'Central European Summer Time', utc: 'UTC+2', ciudades: 'Madrid, París, Berlín, Roma (verano)' },
  { acronimo: 'BST', nombre: 'British Summer Time', utc: 'UTC+1', ciudades: 'Londres (verano)' },
  { acronimo: 'EET', nombre: 'Eastern European Time', utc: 'UTC+2', ciudades: 'El Cairo, Atenas' },
  { acronimo: 'MSK', nombre: 'Moscow Standard Time', utc: 'UTC+3', ciudades: 'Moscú' },
  { acronimo: 'EST', nombre: 'Eastern Standard Time', utc: 'UTC-5', ciudades: 'Nueva York, Miami (invierno)' },
  { acronimo: 'EDT', nombre: 'Eastern Daylight Time', utc: 'UTC-4', ciudades: 'Nueva York, Miami (verano)' },
  { acronimo: 'CST', nombre: 'Central Standard Time', utc: 'UTC-6', ciudades: 'Chicago, México (invierno)' },
  { acronimo: 'CDT', nombre: 'Central Daylight Time', utc: 'UTC-5', ciudades: 'Chicago (verano)' },
  { acronimo: 'PST', nombre: 'Pacific Standard Time', utc: 'UTC-8', ciudades: 'Los Ángeles, San Francisco (invierno)' },
  { acronimo: 'PDT', nombre: 'Pacific Daylight Time', utc: 'UTC-7', ciudades: 'Los Ángeles, San Francisco (verano)' },
  { acronimo: 'JST', nombre: 'Japan Standard Time', utc: 'UTC+9', ciudades: 'Tokio, Osaka' },
  { acronimo: 'KST', nombre: 'Korea Standard Time', utc: 'UTC+9', ciudades: 'Seúl' },
  { acronimo: 'CST (China)', nombre: 'China Standard Time', utc: 'UTC+8', ciudades: 'Pekín, Shanghái' },
  { acronimo: 'IST', nombre: 'India Standard Time', utc: 'UTC+5:30', ciudades: 'Mumbai, Nueva Delhi' },
  { acronimo: 'SGT', nombre: 'Singapore Time', utc: 'UTC+8', ciudades: 'Singapur' },
  { acronimo: 'AEST', nombre: 'Australian Eastern Standard Time', utc: 'UTC+10', ciudades: 'Sídney, Melbourne (invierno)' },
  { acronimo: 'AEDT', nombre: 'Australian Eastern Daylight Time', utc: 'UTC+11', ciudades: 'Sídney, Melbourne (verano)' },
];

// ==================== FUNCIONES AUXILIARES ====================

// Obtener el offset UTC de una zona horaria para una fecha específica
const obtenerOffsetUTC = (zonaIANA: string, fecha: Date): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zonaIANA,
      timeZoneName: 'shortOffset',
    });
    const partes = formatter.formatToParts(fecha);
    const offsetParte = partes.find(p => p.type === 'timeZoneName');
    if (offsetParte) {
      // Convertir "GMT+1" a "UTC+1"
      return offsetParte.value.replace('GMT', 'UTC');
    }
    return '';
  } catch {
    return '';
  }
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function ConversorHorariosPage() {
  // Estado
  const [zonaOrigen, setZonaOrigen] = useState('madrid');
  const [horaOrigen, setHoraOrigen] = useState('');
  const [fechaOrigen, setFechaOrigen] = useState('');
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>(['nueva_york', 'tokio', 'londres']);
  const [horaActual, setHoraActual] = useState(new Date());
  const [mostrarAcronimos, setMostrarAcronimos] = useState(false);

  // Actualizar hora actual cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Inicializar fecha y hora actual
  useEffect(() => {
    const ahora = new Date();
    setHoraOrigen(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setFechaOrigen(ahora.toISOString().split('T')[0]);
  }, []);

  // Obtener hora en una zona horaria específica
  const obtenerHoraEnZona = (zona: string, fecha: Date): string => {
    try {
      return fecha.toLocaleTimeString('es-ES', {
        timeZone: zona,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return '--:--:--';
    }
  };

  // Obtener fecha en una zona horaria específica
  const obtenerFechaEnZona = (zona: string, fecha: Date): string => {
    try {
      return fecha.toLocaleDateString('es-ES', {
        timeZone: zona,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '--';
    }
  };

  // Convertir hora de origen a otras zonas
  const horasConvertidas = useMemo(() => {
    if (!horaOrigen || !fechaOrigen) return [];

    const zonaOrigenData = zonasHorarias.find(z => z.id === zonaOrigen);
    if (!zonaOrigenData) return [];

    // Crear fecha con la hora de origen
    const [horas, minutos] = horaOrigen.split(':').map(Number);
    const fechaBase = new Date(fechaOrigen);
    fechaBase.setHours(horas, minutos, 0, 0);

    // Obtener offset de la zona origen
    const formatoOrigen = new Intl.DateTimeFormat('en-US', {
      timeZone: zonaOrigenData.zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Crear fecha UTC equivalente
    const partes = formatoOrigen.formatToParts(fechaBase);
    const getValue = (type: string) => partes.find(p => p.type === type)?.value || '0';

    const fechaEnOrigen = new Date(
      `${getValue('year')}-${getValue('month')}-${getValue('day')}T${getValue('hour')}:${getValue('minute')}:${getValue('second')}`
    );

    // Calcular diferencia y crear fecha UTC
    const diffMs = fechaBase.getTime() - fechaEnOrigen.getTime();
    const fechaUTC = new Date(fechaBase.getTime() + diffMs);

    return zonasSeleccionadas.map(zonaId => {
      const zona = zonasHorarias.find(z => z.id === zonaId);
      if (!zona) return null;

      const horaConvertida = obtenerHoraEnZona(zona.zona, fechaUTC);
      const fechaConvertida = obtenerFechaEnZona(zona.zona, fechaUTC);
      const offsetUTC = obtenerOffsetUTC(zona.zona, fechaUTC);

      return {
        ...zona,
        hora: horaConvertida,
        fecha: fechaConvertida,
        offsetUTC,
      };
    }).filter(Boolean);
  }, [zonaOrigen, horaOrigen, fechaOrigen, zonasSeleccionadas]);

  // Toggle zona seleccionada
  const toggleZona = (zonaId: string) => {
    if (zonasSeleccionadas.includes(zonaId)) {
      setZonasSeleccionadas(zonasSeleccionadas.filter(z => z !== zonaId));
    } else if (zonasSeleccionadas.length < 6) {
      setZonasSeleccionadas([...zonasSeleccionadas, zonaId]);
    }
  };

  // Usar hora actual
  const usarHoraActual = () => {
    const ahora = new Date();
    setHoraOrigen(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setFechaOrigen(ahora.toISOString().split('T')[0]);
  };

  // Zona origen datos
  const zonaOrigenData = zonasHorarias.find(z => z.id === zonaOrigen);
  const offsetOrigenActual = zonaOrigenData ? obtenerOffsetUTC(zonaOrigenData.zona, horaActual) : '';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Horarios</h1>
        <p className={styles.subtitle}>
          Convierte horarios entre zonas horarias del mundo
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de origen */}
        <section className={styles.origenPanel}>
          <h2 className={styles.sectionTitle}>Hora de origen</h2>
          <div className={styles.origenForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="ciudad-origen">Ciudad</label>
                <select
                  id="ciudad-origen"
                  title="Seleccionar ciudad de origen"
                  value={zonaOrigen}
                  onChange={(e) => setZonaOrigen(e.target.value)}
                  className={styles.select}
                >
                  {zonasHorarias.map(zona => (
                    <option key={zona.id} value={zona.id}>
                      {zona.nombre} ({zona.pais})
                    </option>
                  ))}
                </select>
                {offsetOrigenActual && (
                  <span className={styles.offsetLabel}>{offsetOrigenActual} · {zonaOrigenData?.acronimo}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="hora-origen">Hora</label>
                <input
                  id="hora-origen"
                  title="Seleccionar hora"
                  type="time"
                  value={horaOrigen}
                  onChange={(e) => setHoraOrigen(e.target.value)}
                  className={styles.inputTime}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="fecha-origen">Fecha</label>
                <input
                  id="fecha-origen"
                  title="Seleccionar fecha"
                  type="date"
                  value={fechaOrigen}
                  onChange={(e) => setFechaOrigen(e.target.value)}
                  className={styles.inputDate}
                />
              </div>
            </div>
            <button type="button" onClick={usarHoraActual} className={styles.btnActual}>
              🕐 Usar hora actual
            </button>
          </div>
        </section>

        {/* Resultados */}
        <section className={styles.resultadosPanel}>
          <h2 className={styles.sectionTitle}>
            Hora en otras ciudades
            <span className={styles.contador}>({zonasSeleccionadas.length}/6 seleccionadas)</span>
          </h2>

          {horasConvertidas.length > 0 ? (
            <div className={styles.resultadosGrid}>
              {horasConvertidas.map((resultado) => resultado && (
                <div key={resultado.id} className={styles.resultadoCard}>
                  <div className={styles.resultadoHeader}>
                    <Flag code={resultado.code} size="lg" className={styles.resultadoFlag} />
                    <div className={styles.resultadoInfo}>
                      <span className={styles.resultadoCiudad}>{resultado.nombre}</span>
                      <span className={styles.resultadoPais}>{resultado.pais}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleZona(resultado.id)}
                      className={styles.btnRemover}
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.resultadoHora}>{resultado.hora}</div>
                  <div className={styles.resultadoMeta}>
                    <span className={styles.resultadoFecha}>{resultado.fecha}</span>
                    <span className={styles.resultadoOffset}>{resultado.offsetUTC}</span>
                  </div>
                  {resultado.acronimo && (
                    <div className={styles.resultadoAcronimo}>{resultado.acronimo}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.sinResultados}>Selecciona ciudades para ver los horarios</p>
          )}
        </section>

        {/* Selector de zonas */}
        <section className={styles.selectorPanel}>
          <h2 className={styles.sectionTitle}>Añadir ciudades</h2>
          <div className={styles.zonasGrid}>
            {zonasHorarias
              .filter(z => z.id !== zonaOrigen && !zonasSeleccionadas.includes(z.id))
              .map(zona => (
                <button
                  type="button"
                  key={zona.id}
                  onClick={() => toggleZona(zona.id)}
                  className={styles.zonaBtn}
                  disabled={zonasSeleccionadas.length >= 6}
                  title={`${zona.acronimo || ''} - ${obtenerOffsetUTC(zona.zona, horaActual)}`}
                >
                  <Flag code={zona.code} size="sm" /> {zona.nombre}
                  <span className={styles.zonaBtnOffset}>{obtenerOffsetUTC(zona.zona, horaActual)}</span>
                </button>
              ))}
          </div>
        </section>

        {/* Reloj mundial actual */}
        <section className={styles.relojPanel}>
          <h2 className={styles.sectionTitle}>Hora actual en el mundo</h2>
          <div className={styles.relojGrid}>
            {[
              zonasHorarias.find(z => z.id === 'madrid'),
              zonasHorarias.find(z => z.id === 'londres'),
              zonasHorarias.find(z => z.id === 'nueva_york'),
              zonasHorarias.find(z => z.id === 'tokio'),
            ].filter(Boolean).map(zona => zona && (
              <div key={zona.id} className={styles.relojItem}>
                <span className={styles.relojCiudad}><Flag code={zona.code} size="sm" /> {zona.nombre}</span>
                <span className={styles.relojHora}>{obtenerHoraEnZona(zona.zona, horaActual)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🌍</span>
            <div>
              <strong>+25 ciudades</strong>
              <p>Principales zonas horarias del mundo</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⏰</span>
            <div>
              <strong>Tiempo real</strong>
              <p>Reloj mundial actualizado cada segundo</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📅</span>
            <div>
              <strong>Cualquier fecha</strong>
              <p>Convierte horarios de fechas pasadas o futuras</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de referencia de acrónimos */}
      <section className={styles.acronimosPanel}>
        <button
          type="button"
          className={styles.acronimosToggle}
          onClick={() => setMostrarAcronimos(!mostrarAcronimos)}
          aria-expanded={mostrarAcronimos}
        >
          <span>📖 Guía de zonas horarias (GMT, CET, EST, PST...)</span>
          <span className={`${styles.toggleIcon} ${mostrarAcronimos ? styles.toggleIconOpen : ''}`}>
            ▼
          </span>
        </button>

        {mostrarAcronimos && (
          <div className={styles.acronimosContent}>
            <p className={styles.acronimosIntro}>
              Referencia rápida de los acrónimos más utilizados en reuniones internacionales.
              El offset UTC puede variar según el horario de verano/invierno.
            </p>
            <div className={styles.acronimosTable}>
              <div className={styles.acronimosHeader}>
                <span>Acrónimo</span>
                <span>Nombre completo</span>
                <span>UTC</span>
                <span>Ciudades</span>
              </div>
              {acronimosReferencia.map((item) => (
                <div key={item.acronimo} className={styles.acronimosRow}>
                  <span className={styles.acronimoCode}>{item.acronimo}</span>
                  <span className={styles.acronimoNombre}>{item.nombre}</span>
                  <span className={styles.acronimoUtc}>{item.utc}</span>
                  <span className={styles.acronimoCiudades}>{item.ciudades}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <RelatedApps apps={getRelatedApps('conversor-horarios')} />

      <Footer appName="conversor-horarios" />
    </div>
  );
}
