'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo } from 'react';
import styles from './ConversorHorarios.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
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

      <LegalNotice />

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

      <EducationalSection
        title="Guía de Zonas Horarias y Trabajo Internacional"
        subtitle="Todo lo que necesitas para coordinar equipos globales y reuniones internacionales"
        icon="🌍"
      >
        {/* Sección 1: Tabla Comparativa */}
        <div className={styles.eduComparativaSection}>
          <h3>🌐 Referencia de Zonas Horarias Clave</h3>
          <p className={styles.eduComparativaSubtitle}>Las zonas más importantes para trabajo remoto e internacional</p>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTablaComparativa}>
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>UTC Invierno</th>
                  <th>UTC Verano</th>
                  <th>Horario verano</th>
                  <th>Países principales</th>
                  <th>Uso en trabajo remoto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CET/CEST</td>
                  <td>UTC+1</td>
                  <td>UTC+2</td>
                  <td>Mar→Oct</td>
                  <td>España, Francia, Alemania, Italia</td>
                  <td>Hub europeo principal</td>
                </tr>
                <tr>
                  <td>GMT/BST</td>
                  <td>UTC+0</td>
                  <td>UTC+1</td>
                  <td>Mar→Oct</td>
                  <td>Reino Unido, Irlanda, Portugal</td>
                  <td>Referencia internacional</td>
                </tr>
                <tr>
                  <td>EST/EDT</td>
                  <td>UTC-5</td>
                  <td>UTC-4</td>
                  <td>Mar→Nov</td>
                  <td>EE.UU. Este, Canadá Este</td>
                  <td>Mercados financieros NY</td>
                </tr>
                <tr>
                  <td>PST/PDT</td>
                  <td>UTC-8</td>
                  <td>UTC-7</td>
                  <td>Mar→Nov</td>
                  <td>California, Oregón, Washington</td>
                  <td>Big Tech (Silicon Valley)</td>
                </tr>
                <tr>
                  <td>IST</td>
                  <td>UTC+5:30</td>
                  <td>Sin cambio</td>
                  <td>No aplica</td>
                  <td>India (todo el país)</td>
                  <td>Outsourcing IT</td>
                </tr>
                <tr>
                  <td>JST/KST</td>
                  <td>UTC+9</td>
                  <td>Sin cambio</td>
                  <td>No aplica</td>
                  <td>Japón, Corea del Sur</td>
                  <td>Tecnología Asia-Pacífico</td>
                </tr>
                <tr>
                  <td>AEST/AEDT</td>
                  <td>UTC+10</td>
                  <td>UTC+11</td>
                  <td>Oct→Abr</td>
                  <td>Australia Este</td>
                  <td>Zona opuesta a Europa</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección 2: Casos de Uso Prácticos */}
        <div className={styles.eduEscenariosSection}>
          <h3>💼 Casos de Uso por Perfil Profesional</h3>
          <p className={styles.eduEscenariosSubtitle}>Cómo gestionar horarios según tu situación</p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🏢</span>
                <h4>Trabajador Remoto con Equipo Internacional</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Madrid CET+1 coordina con: Nueva York (EST, -6h en invierno, -5h en verano), Londres (GMT, -1h en invierno = misma hora). Ventana de solapamiento: 14:00-17:00 Madrid = 9:00-12:00 NY.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: Identificar la &lsquo;ventana de solapamiento&rsquo; entre zonas evita reuniones inconvenientes. Con España-NY la ventana útil es de solo 3h al día.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>💻</span>
                <h4>Freelance con Clientes Internacionales</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Freelance español con clientes en EE.UU. (PST): diferencia de 9h en invierno, 8h en verano. Mejor horario de reunión: 17:00-19:00 Madrid = 08:00-10:00 Los Ángeles. Usar esta herramienta para confirmar antes de proponer horario.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: Proponer horarios de reunión ya convertidos a la zona del cliente demuestra profesionalidad y evita confusiones de ±1h por horario de verano.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🌏</span>
                <h4>Empresa con Sedes en Múltiples Países</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Reunión global mensual: Madrid (CET+1), Nueva York (EST), Singapur (SGT+8), Sídney (AEST+10). El único horario viable para los 4: 08:00 Madrid = 02:00 NY = 15:00 Singapur = 17:00 Sídney. Rotar la penalización entre equipos.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: Cuando hay 3+ zonas con diferencias &gt;12h, ningún horario es perfecto para todos. Rotar quién &lsquo;sufre&rsquo; el horario incómodo es la práctica más equitativa.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>✈️</span>
                <h4>Viajero Internacional Frecuente</h4>
              </div>
              <p className={styles.eduEscenarioExample}>Vuelo Madrid → Tokio: +8h de diferencia. Si tu reunión habitual es los martes a las 10:00 Madrid, en Tokio son las 18:00 del mismo día en invierno. Con esta herramienta: introduce la hora en Madrid y selecciona Tokio para ver la hora local antes de aterrizar.</p>
              <p className={styles.eduEscenarioTip}>Por qué funciona: El jet lag cognitivo es real. Calcular los horarios de tus compromisos antes del viaje permite planificar si necesitas ajustar el horario de sueño en el destino.</p>
            </div>
          </div>
        </div>

        {/* Sección 3: FAQ Ampliado */}
        <div className={styles.eduFaqSection}>
          <h3>❓ Preguntas Frecuentes sobre Zonas Horarias</h3>
          <p className={styles.eduFaqSubtitle}>Todo lo que necesitas saber sobre el tiempo global</p>
          <div className={styles.eduFaqList}>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué es UTC y por qué es la referencia mundial?</h4>
              <p>UTC (Coordinated Universal Time) es el estándar de tiempo internacional desde 1972, basado en relojes atómicos. Reemplazó al GMT como referencia oficial aunque en la práctica son equivalentes (±0.9s). Todas las zonas horarias se expresan como UTC± horas. España peninsular es UTC+1 (invierno) o UTC+2 (verano). 💡 Consejo: Cuando coordines reuniones internacionales, siempre confirma en UTC para evitar confusiones. Escribe &ldquo;15:00 UTC&rdquo; en lugar de &ldquo;16:00 CET&rdquo;.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Por qué algunos países no tienen horario de verano?</h4>
              <p>El horario de verano (DST - Daylight Saving Time) se inventó en la Primera Guerra Mundial para ahorrar energía. Países como India, Japón, China, y la mayoría de África no lo usan. Esto crea situaciones donde la diferencia horaria con España cambia según la época del año: con India es siempre +4:30h (invierno) o +3:30h (verano, porque solo España cambia). 💡 Consejo: Si trabajas con India o Japón regularmente, recuerda que la diferencia con España cambia ±1h en los cambios de horario de verano, aunque ellos no cambien.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo funciona la línea de cambio de fecha?</h4>
              <p>La Línea Internacional de Cambio de Fecha es aproximadamente el meridiano 180° en el Pacífico. Al cruzarla hacia el oeste, el calendario avanza un día; hacia el este, retrocede. Países como Australia o Nueva Zelanda están &lsquo;mañana&rsquo; respecto a EE.UU. En la práctica: si en Madrid es lunes 15:00, en Auckland ya es martes 02:00 (en invierno europeo). 💡 Consejo: Para reuniones con Australia/NZ desde Europa, confirma siempre el día de la semana, no solo la hora. Una reunión del &ldquo;miércoles&rdquo; puede ser el martes en tu zona.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Por qué India tiene una zona horaria de media hora (UTC+5:30)?</h4>
              <p>Algunos países usan offsets de 30 o 45 minutos para ajustarse a su geografía solar. India (UTC+5:30), Sri Lanka (UTC+5:30), Irán (UTC+3:30), Nepal (UTC+5:45) e incluso Australia del Sur (UTC+9:30) usan half-offsets. Esto responde a decisiones políticas o geográficas (India prefirió un único huso para todo el país). 💡 Consejo: Cuando uses esta herramienta para convertir horarios con India, nota que los resultados muestran correctamente el offset de media hora. Herramientas menos precisas pueden aproximar a UTC+5 o UTC+6.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuándo es mejor programar reuniones internacionales Europa-América?</h4>
              <p>La ventana óptima entre Europa Central (CET) y Costa Este de EE.UU. (EST) es 15:00-17:00 CET = 09:00-11:00 EST. Con la Costa Oeste (PST) la ventana ideal es más estrecha: 17:00-19:00 CET = 08:00-10:00 PST. En verano europeo, la ventana se desplaza 1h (ya que solo Europa cambia). 💡 Consejo: Evita programar reuniones con EE.UU. por la mañana española (antes de 14:00). Para ellos serían las madrugadas. La tarde española es el punto dulce para ambas zonas.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo afecta el cambio de horario de verano a las reuniones ya programadas?</h4>
              <p>En España el cambio es el último domingo de marzo (avanzamos 1h) y octubre (atrasamos 1h). Si tienes una reunión semanal fija con EE.UU. o UK, la diferencia horaria cambia 1h durante esas semanas de transición porque los cambios no son simultáneos. Ejemplo: en EE.UU. el cambio de primavera ocurre el segundo domingo de marzo, unas dos semanas antes que en Europa, lo que crea un periodo de diferencia anómala de 5h en vez de 6h con NY hasta que Europa también cambia. 💡 Consejo: Durante las semanas de cambio de horario, confirma siempre la hora de las reuniones con colaboradores internacionales. Es la causa más frecuente de &ldquo;¿dónde estás?&rdquo; en llamadas de trabajo remoto.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Existe algún país a 0 horas UTC todo el año?</h4>
              <p>Ghana, Islandia y algunos países del África Occidental están en UTC+0 permanentemente (sin horario de verano). Reino Unido, Portugal e Irlanda están en UTC+0 en invierno y UTC+1 en verano (BST/WEST). Curiosidad: España geográficamente debería estar en UTC+0 (misma longitud que UK/Portugal) pero políticamente está en CET (UTC+1) desde la época franquista. 💡 Consejo: Cuando conviertas horarios con Portugal, recuerda que en invierno tienen 1h menos que España, pero en verano tienen la misma hora (ambos en UTC+1).</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo funciona la herramienta para fechas pasadas o futuras?</h4>
              <p>Esta herramienta tiene en cuenta el horario de verano histórico y futuro para la fecha introducida. Si introduces una fecha pasada, calcula si en esa fecha específica estaba activo el horario de verano. Para fechas futuras, aplica las reglas conocidas de cambio de horario (último domingo de marzo y octubre para Europa). 💡 Consejo: Para planificar eventos con mucha antelación (&gt;6 meses), verifica siempre que la fecha no coincida con un cambio de horario. Un evento programado para el último domingo de marzo puede tener una hora de desfase por el cambio.</p>
            </div>
          </div>
        </div>

        {/* Sección 4: Guía Paso a Paso */}
        <div className={styles.eduStepSection}>
          <h3>📋 Guía: Programa Reuniones Internacionales sin Errores</h3>
          <p className={styles.eduStepSubtitle}>6 pasos para coordinar equipos globales con eficacia</p>
          <div className={styles.eduStepGuide}>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>1</span>
              <div className={styles.eduStepContent}>
                <h4>Identifica todas las zonas horarias del equipo</h4>
                <p>Antes de proponer ningún horario, lista todas las ciudades o países de los participantes. Incluye si están en horario de invierno o verano en la fecha de la reunión. Una reunión con 4 participantes en 4 zonas distintas requiere revisar 4 conversiones diferentes.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>2</span>
              <div className={styles.eduStepContent}>
                <h4>Calcula la &lsquo;ventana de solapamiento&rsquo; laboral</h4>
                <p>Horario laboral estándar: 09:00-18:00 en cada zona. La ventana útil es el intervalo donde todos coinciden dentro de su horario laboral. Con España y California (PST), esa ventana es solo 17:00-18:00 CET en invierno. Si no hay ventana, alguien tendrá que ceder.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>3</span>
              <div className={styles.eduStepContent}>
                <h4>Usa la herramienta para confirmar la conversión exacta</h4>
                <p>Introduce la hora propuesta en la zona de quien convoca. Selecciona las zonas de todos los participantes. Verifica que la hora resultante es razonable para todos. Presta atención al día de la semana en zonas muy alejadas.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>4</span>
              <div className={styles.eduStepContent}>
                <h4>Propón el horario en formato universal</h4>
                <p>Al enviar la invitación o el mensaje, incluye siempre: la hora en tu zona + la hora en UTC + &ldquo;Confirma en tu zona con [URL de herramienta]&rdquo;. Ejemplo: &ldquo;Reunión miércoles 16:00 CET (15:00 UTC). Para tu zona: [enlace]&rdquo;. Los calendarios digitales (Google Calendar, Outlook) convierten automáticamente si el evento se crea correctamente.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>5</span>
              <div className={styles.eduStepContent}>
                <h4>Configura recordatorios con antelación doble</h4>
                <p>Las reuniones internacionales tienen mayor tasa de ausencia por confusiones horarias. Configura recordatorios 24h y 30 min antes. En la semana de cambio de horario (marzo/octubre), envía confirmación manual adicional.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>6</span>
              <div className={styles.eduStepContent}>
                <h4>Evalúa la equidad del horario rotando la incomodidad</h4>
                <p>Si hay reuniones recurrentes donde alguien siempre tiene el horario incómodo (muy temprano o muy tarde), rota el horario cada mes. Quien sufre el horario de las 07:00 este mes, tendrá el cómodo el siguiente. Esta práctica mejora la cohesión en equipos globales.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 5: Mejores Prácticas */}
        <div className={styles.eduTipsSection}>
          <h3>✅ 6 Prácticas para la Coordinación Global</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📅</span>
              <h4>Usa siempre UTC en comunicaciones escritas</h4>
              <p>Escribir la hora en UTC elimina ambigüedad total. &ldquo;15:00 UTC&rdquo; es inequívoco para cualquier persona en el mundo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🔄</span>
              <h4>Vigila las semanas de cambio horario</h4>
              <p>Las semanas de cambio de horario en marzo y octubre son las más problemáticas. Confirma siempre la hora con tus contactos esa semana.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📱</span>
              <h4>Configura tu móvil con zonas secundarias</h4>
              <p>Los móviles permiten mostrar 2-3 zonas horarias en el reloj. Añade las zonas de tus principales colaboradores para tenerlas siempre visibles.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🗓️</span>
              <h4>Crea eventos en el calendario con zona correcta</h4>
              <p>Google Calendar y Outlook convierten automáticamente si creas el evento con la zona horaria del organizador. Así todos ven la hora correcta en su zona.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🤝</span>
              <h4>Respeta los horarios laborales ajenos</h4>
              <p>Una reunión a las 08:00 en tu zona puede ser medianoche para alguien. Verifica siempre que el horario propuesto cae dentro del horario laboral del participante.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>⚡</span>
              <h4>Documenta los acuerdos en UTC</h4>
              <p>Actas, contratos y registros con horas deberían indicar UTC o la zona explícita. &ldquo;Firmado a las 15:00&rdquo; es ambiguo; &ldquo;15:00 CET&rdquo; o &ldquo;14:00 UTC&rdquo; no lo es.</p>
            </div>
          </div>
        </div>

        {/* Sección 6: Warning Box — Errores comunes */}
        <div className={styles.eduWarningBox}>
          <div className={styles.eduWarningHeader}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <h3>Errores que Generan Confusión Horaria Internacional</h3>
          </div>
          <ul className={styles.eduWarningList}>
            <li><strong>❌ Proponer reuniones sin especificar la zona horaria:</strong> &ldquo;Nos vemos el martes a las 10&rdquo; sin especificar zona horaria es la causa más común de ausencias en reuniones internacionales. Siempre añade: &ldquo;10:00 CET&rdquo;, &ldquo;10:00 UTC&rdquo; o &ldquo;10:00 hora de Madrid&rdquo;.</li>
            <li><strong>❌ Ignorar el cambio de horario de verano del otro país:</strong> EE.UU. cambia el horario 2-3 semanas después que Europa. Durante esas semanas la diferencia horaria es 1h menor de lo habitual. Muchas reuniones se pierden ese lunes de vuelta al trabajo.</li>
            <li><strong>❌ Asumir que India o China tienen el mismo horario todo el año:</strong> India (UTC+5:30) y China (UTC+8) no tienen horario de verano. Pero España sí. En verano, la diferencia España-India cambia de +4:30h (invierno) a +3:30h (verano). Verificar siempre.</li>
            <li><strong>❌ Confundir GMT y UTC en documentos formales:</strong> Son prácticamente equivalentes (diferencia &lt;1s), pero UTC es el estándar internacional oficial desde 1972. En contratos o documentos legales con partes de distintos países, usar siempre UTC.</li>
            <li><strong>❌ Olvidar la línea de cambio de fecha para Australia y Nueva Zelanda:</strong> En Madrid el martes a las 17:00 puede ser el miércoles a las 03:00 en Sídney. Una reunión &ldquo;el jueves&rdquo; puede interpretarse de forma diferente. Siempre confirmar el día además de la hora.</li>
            <li><strong>❌ Usar 12:00 PM/AM sin contexto:</strong> El formato de 12 horas genera confusión. &ldquo;12:00 PM&rdquo; es el mediodía y &ldquo;12:00 AM&rdquo; es la medianoche, pero mucha gente los confunde. Usa siempre formato 24h (13:00, 00:00) en comunicaciones internacionales.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-horarios')} />

      <ShareCard appName="conversor-horarios" />
      <Footer appName="conversor-horarios" />
    </div>
  );
}
