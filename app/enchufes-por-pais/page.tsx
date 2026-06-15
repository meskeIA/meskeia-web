'use client';

import { useState } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './EnchufesPais.module.css';
import { getRelatedApps } from '@/data/app-relations';

interface DatosPais {
  pais: string;
  bandera: string;
  continente: string;
  tipos: string[];
  voltaje: string;
  frecuencia: string;
  notaAdaptador?: string;
}

/**
 * Base de datos de enchufes por país
 * Fuente: IEC 60083, World Standards, Wikipedia
 * Tipos A-N según IEC
 */
const BASE_PAISES: DatosPais[] = [
  // EUROPA
  { pais: 'España', bandera: '🇪🇸', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Referencia de origen. Los enchufes tipo C y F son estándar en casi toda Europa continental.' },
  { pais: 'Francia', bandera: '🇫🇷', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Necesitas adaptador para enchufes UK o americanos.' },
  { pais: 'Alemania', bandera: '🇩🇪', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con la mayoría de enchufes europeos. Sin adaptador necesario desde España.' },
  { pais: 'Italia', bandera: '🇮🇹', continente: 'Europa', tipos: ['C', 'F', 'L'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo L (tres clavijas en línea) es exclusivo de Italia. Lleva adaptador por si acaso.' },
  { pais: 'Portugal', bandera: '🇵🇹', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con los enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Reino Unido', bandera: '🇬🇧', continente: 'Europa', tipos: ['G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo G (tres clavijas rectangulares) es exclusivo de UK. Necesitas adaptador desde Europa continental.' },
  { pais: 'Irlanda', bandera: '🇮🇪', continente: 'Europa', tipos: ['G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Necesitas adaptador tipo G si vienes desde España.' },
  { pais: 'Suiza', bandera: '🇨🇭', continente: 'Europa', tipos: ['C', 'J'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo J (tres clavijas) es exclusivo de Suiza. El tipo C funciona en muchas tomas.' },
  { pais: 'Austria', bandera: '🇦🇹', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Bélgica', bandera: '🇧🇪', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Similar a Francia. Adaptador necesario para UK y EE.UU.' },
  { pais: 'Países Bajos', bandera: '🇳🇱', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Dinamarca', bandera: '🇩🇰', continente: 'Europa', tipos: ['C', 'F', 'K'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo K (clavijas con tierra lateral) es el estándar danés, pero el tipo F también funciona.' },
  { pais: 'Noruega', bandera: '🇳🇴', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Suecia', bandera: '🇸🇪', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Finlandia', bandera: '🇫🇮', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Polonia', bandera: '🇵🇱', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con tipo C español. Sin adaptador necesario.' },
  { pais: 'República Checa', bandera: '🇨🇿', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con tipo C español. Sin adaptador necesario.' },
  { pais: 'Hungría', bandera: '🇭🇺', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Rumanía', bandera: '🇷🇴', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Grecia', bandera: '🇬🇷', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Turquía', bandera: '🇹🇷', continente: 'Europa/Asia', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C/F.' },
  { pais: 'Rusia', bandera: '🇷🇺', continente: 'Europa/Asia', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C/F.' },

  // AMÉRICAS
  { pais: 'Estados Unidos', bandera: '🇺🇸', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz', notaAdaptador: 'Voltaje diferente (120V vs 230V). Muchos cargadores modernos son universales (100-240V): comprueba la etiqueta del dispositivo.' },
  { pais: 'Canadá', bandera: '🇨🇦', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz', notaAdaptador: 'Igual que EE.UU. Comprueba si tu cargador soporta 100-240V.' },
  { pais: 'México', bandera: '🇲🇽', continente: 'América', tipos: ['A', 'B'], voltaje: '127 V', frecuencia: '60 Hz', notaAdaptador: 'Voltaje intermedio (127V). Verifica que tus dispositivos sean universales.' },
  { pais: 'Argentina', bandera: '🇦🇷', continente: 'América', tipos: ['C', 'I'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo I (tres clavijas en Y) es el estándar argentino. Muchos hoteles tienen adaptadores disponibles.' },
  { pais: 'Brasil', bandera: '🇧🇷', continente: 'América', tipos: ['C', 'N'], voltaje: '127-220 V', frecuencia: '60 Hz', notaAdaptador: 'Voltaje variable según ciudad. El tipo N (NBR 14136) es el estándar desde 2010, pero aún hay tipo C y A.' },
  { pais: 'Colombia', bandera: '🇨🇴', continente: 'América', tipos: ['A', 'B'], voltaje: '110 V', frecuencia: '60 Hz', notaAdaptador: 'Igual formato que EE.UU. pero voltaje 110V. Verifica compatibilidad de tus dispositivos.' },
  { pais: 'Chile', bandera: '🇨🇱', continente: 'América', tipos: ['C', 'L'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo L (italiano). Lleva adaptador universal.' },
  { pais: 'Perú', bandera: '🇵🇪', continente: 'América', tipos: ['A', 'B', 'C'], voltaje: '220 V', frecuencia: '60 Hz', notaAdaptador: 'Mezcla de tipos. El adaptador universal es muy recomendable.' },
  { pais: 'Ecuador', bandera: '🇪🇨', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz', notaAdaptador: 'Igual que EE.UU. Adaptador tipo A/B necesario.' },
  { pais: 'Cuba', bandera: '🇨🇺', continente: 'América', tipos: ['A', 'B', 'C', 'L'], voltaje: '110-220 V', frecuencia: '60 Hz', notaAdaptador: 'Mezcla de estándares. Adaptador universal muy recomendable.' },
  { pais: 'República Dominicana', bandera: '🇩🇴', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz', notaAdaptador: 'Igual que EE.UU. Adaptador tipo A/B necesario.' },

  // ASIA
  { pais: 'Japón', bandera: '🇯🇵', continente: 'Asia', tipos: ['A', 'B'], voltaje: '100 V', frecuencia: '50-60 Hz', notaAdaptador: 'Voltaje único en el mundo (100V). La mayoría de dispositivos europeos soporta 100-240V, pero verifica siempre la etiqueta.' },
  { pais: 'China', bandera: '🇨🇳', continente: 'Asia', tipos: ['A', 'C', 'I'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Variedad de tomas. El adaptador universal es muy recomendable.' },
  { pais: 'India', bandera: '🇮🇳', continente: 'Asia', tipos: ['C', 'D', 'M'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo D (tres clavijas circulares grandes) es exclusivo de India. Lleva adaptador. La calidad eléctrica puede variar.' },
  { pais: 'Tailandia', bandera: '🇹🇭', continente: 'Asia', tipos: ['A', 'B', 'C'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Aceptan tipos mixtos. El adaptador tipo C español suele funcionar.' },
  { pais: 'Indonesia', bandera: '🇮🇩', continente: 'Asia', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C/F.' },
  { pais: 'Vietnam', bandera: '🇻🇳', continente: 'Asia', tipos: ['A', 'C', 'G'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Mezcla de estándares en hoteles. Adaptador universal muy útil.' },
  { pais: 'Malasia', bandera: '🇲🇾', continente: 'Asia', tipos: ['G'], voltaje: '240 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Necesitas adaptador tipo G desde España.' },
  { pais: 'Singapur', bandera: '🇸🇬', continente: 'Asia', tipos: ['G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Adaptador tipo G necesario.' },
  { pais: 'Corea del Sur', bandera: '🇰🇷', continente: 'Asia', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '60 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C/F.' },
  { pais: 'Hong Kong', bandera: '🇭🇰', continente: 'Asia', tipos: ['G'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Adaptador tipo G necesario.' },
  { pais: 'Filipinas', bandera: '🇵🇭', continente: 'Asia', tipos: ['A', 'B', 'C'], voltaje: '220 V', frecuencia: '60 Hz', notaAdaptador: 'Variedad de tomas. Adaptador universal recomendable.' },
  { pais: 'Sri Lanka', bandera: '🇱🇰', continente: 'Asia', tipos: ['D', 'G', 'M'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G (UK). Adaptador universal recomendable.' },
  { pais: 'Nepal', bandera: '🇳🇵', continente: 'Asia', tipos: ['C', 'D', 'M'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Variedad de tomas. Adaptador universal recomendable.' },
  { pais: 'Israel', bandera: '🇮🇱', continente: 'Asia', tipos: ['C', 'H', 'M'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo H (triángulo de tres clavijas) es exclusivo de Israel. El tipo C funciona en muchas tomas.' },
  { pais: 'Emiratos Árabes Unidos', bandera: '🇦🇪', continente: 'Asia', tipos: ['C', 'G'], voltaje: '220-240 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G (UK). Muchos hoteles tienen adaptadores disponibles.' },
  { pais: 'Arabia Saudí', bandera: '🇸🇦', continente: 'Asia', tipos: ['A', 'B', 'C', 'G'], voltaje: '127-220 V', frecuencia: '60 Hz', notaAdaptador: 'Gran variedad de enchufes y voltajes. Adaptador universal muy recomendable.' },
  { pais: 'Jordania', bandera: '🇯🇴', continente: 'Asia', tipos: ['B', 'C', 'D', 'F', 'G', 'J'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Gran variedad de tomas. Adaptador universal imprescindible.' },

  // AFRICA
  { pais: 'Marruecos', bandera: '🇲🇦', continente: 'África', tipos: ['C', 'E'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C. Sin problemas desde España.' },
  { pais: 'Sudáfrica', bandera: '🇿🇦', continente: 'África', tipos: ['C', 'M', 'N'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo M (tres clavijas grandes) es exclusivo de Sudáfrica. Necesitas adaptador.' },
  { pais: 'Egipto', bandera: '🇪🇬', continente: 'África', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C/F.' },
  { pais: 'Kenia', bandera: '🇰🇪', continente: 'África', tipos: ['G'], voltaje: '240 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Adaptador tipo G necesario.' },
  { pais: 'Tanzania', bandera: '🇹🇿', continente: 'África', tipos: ['D', 'G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G. Adaptador necesario.' },
  { pais: 'Ghana', bandera: '🇬🇭', continente: 'África', tipos: ['D', 'G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G. Adaptador necesario.' },
  { pais: 'Nigeria', bandera: '🇳🇬', continente: 'África', tipos: ['D', 'G'], voltaje: '240 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G. Adaptador necesario.' },
  { pais: 'Etiopía', bandera: '🇪🇹', continente: 'África', tipos: ['C', 'E', 'F', 'L'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Variedad de tomas. El tipo C suele funcionar.' },
  { pais: 'Madagascar', bandera: '🇲🇬', continente: 'África', tipos: ['C', 'E'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con tipo C español.' },

  // OCEANÍA
  { pais: 'Australia', bandera: '🇦🇺', continente: 'Oceanía', tipos: ['I'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo I (tres clavijas en Y inclinadas) es exclusivo de Australia/NZ. Adaptador específico necesario.' },
  { pais: 'Nueva Zelanda', bandera: '🇳🇿', continente: 'Oceanía', tipos: ['I'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Australia. Adaptador tipo I necesario.' },
  { pais: 'Fiyi', bandera: '🇫🇯', continente: 'Oceanía', tipos: ['I'], voltaje: '240 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Australia. Adaptador tipo I necesario.' },
];

const TIPOS_ENCHUFE: Record<string, string> = {
  A: 'Dos clavijas planas paralelas — EE.UU., Japón, México',
  B: 'Dos clavijas planas + tierra redonda — EE.UU., Japón',
  C: 'Dos clavijas redondas delgadas — Europa continental',
  D: 'Tres clavijas circulares en triángulo — India',
  E: 'Dos clavijas redondas + agujero tierra — Francia, Bélgica',
  F: 'Dos clavijas redondas con tierra lateral (Schuko) — Alemania',
  G: 'Tres clavijas rectangulares — Reino Unido, Irlanda',
  H: 'Tres clavijas en triángulo — Israel',
  I: 'Tres clavijas en Y inclinadas — Australia, Argentina',
  J: 'Tres clavijas redondas — Suiza',
  K: 'Dos clavijas + tierra lateral — Dinamarca',
  L: 'Tres clavijas en línea — Italia, Chile',
  M: 'Tres clavijas circulares grandes — Sudáfrica',
  N: 'Tres clavijas redondas IEC — Brasil',
};

// Agrupamos países por continente para el <optgroup>
const CONTINENTES = Array.from(new Set(BASE_PAISES.map(p => p.continente))).sort();

export default function EnchufesPais() {
  const [paisSeleccionado, setPaisSeleccionado] = useState<string>('');

  const datos = BASE_PAISES.find(p => p.pais === paisSeleccionado) ?? null;

  return (
    <div className={styles.container}>
      <AnalyticsTracker appName="enchufes-por-pais" />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🔌 Enchufes por País</h1>
        <p>¿Qué adaptador necesitas? Voltaje y tipos de enchufe en todo el mundo</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="enchufes-por-pais-disclaimer"
      />

      <main className={styles.main}>
        {/* Selector de país */}
        <section className={styles.selectorCard}>
          <label htmlFor="selector-pais" className={styles.selectorLabel}>
            Selecciona tu destino
          </label>
          <div className={styles.selectorWrapper}>
            <select
              id="selector-pais"
              className={styles.selectPais}
              value={paisSeleccionado}
              onChange={e => setPaisSeleccionado(e.target.value)}
              aria-label="País de destino"
            >
              <option value="">— Elige un país —</option>
              {CONTINENTES.map(continente => (
                <optgroup key={continente} label={continente}>
                  {BASE_PAISES
                    .filter(p => p.continente === continente)
                    .map(p => (
                      <option key={p.pais} value={p.pais}>
                        {p.bandera} {p.pais}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Ficha del país seleccionado */}
          {datos ? (
            <div className={styles.fichaPais} aria-live="polite">
              <div className={styles.fichaEncabezado}>
                <span className={styles.fichaBandera} aria-hidden="true">{datos.bandera}</span>
                <div>
                  <h2 className={styles.fichaNombre}>{datos.pais}</h2>
                  <span className={styles.fichaContinente}>{datos.continente}</span>
                </div>
              </div>

              {/* Datos eléctricos */}
              <div className={styles.datosElectricos}>
                <div className={styles.dato}>
                  <span className={styles.datoValor}>{datos.voltaje}</span>
                  <span className={styles.datoLabel}>Voltaje</span>
                </div>
                <div className={styles.dato}>
                  <span className={styles.datoValor}>{datos.frecuencia}</span>
                  <span className={styles.datoLabel}>Frecuencia</span>
                </div>
                <div className={styles.dato}>
                  <span className={styles.datoValor}>{datos.tipos.join(' / ')}</span>
                  <span className={styles.datoLabel}>Tipos</span>
                </div>
              </div>

              {/* Chips de tipos */}
              <div className={styles.tiposEnchufe} aria-label={`Tipos de enchufe en ${datos.pais}`}>
                {datos.tipos.map(tipo => (
                  <div key={tipo} className={styles.chipTipo}>
                    <span className={styles.chipLetra}>Tipo {tipo}</span>
                    <span className={styles.chipDesc}>{TIPOS_ENCHUFE[tipo]}</span>
                  </div>
                ))}
              </div>

              {/* Nota del adaptador */}
              {datos.notaAdaptador && (
                <div className={styles.notaAdaptador} role="note">
                  <span aria-hidden="true">💡</span>
                  <span>{datos.notaAdaptador}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.placeholder} aria-live="polite">
              <span aria-hidden="true">🌍</span>
              <p>Selecciona un país para ver qué enchufe y adaptador necesitas</p>
            </div>
          )}
        </section>

        {/* Referencia compacta de tipos */}
        <details className={styles.referenciaTypes}>
          <summary className={styles.referenciaSummary}>
            Ver guía de todos los tipos de enchufe (A–N)
          </summary>
          <div className={styles.gridTipos}>
            {Object.entries(TIPOS_ENCHUFE).map(([tipo, descripcion]) => (
              <div key={tipo} className={styles.itemTipo}>
                <span className={styles.itemTipoLetra}>Tipo {tipo}</span>
                <span className={styles.itemTipoDesc}>{descripcion}</span>
              </div>
            ))}
          </div>
        </details>

        <EducationalSection title="Guía completa de enchufes y adaptadores para viajeros" subtitle="Voltaje, frecuencia y qué adaptador llevar a cada país del mundo">
          <h3>¿Por qué hay tantos tipos de enchufe en el mundo?</h3>
          <p>
            Los sistemas eléctricos se desarrollaron de forma independiente en cada país durante el siglo XX,
            antes de que existieran estándares internacionales. Hoy existen 14 tipos de enchufe (A-N según IEC),
            aunque los más comunes son los tipos A/B (Norteamérica y Japón), C/E/F (Europa continental) y G (Reino Unido).
          </p>

          <h3>Voltaje y frecuencia: ¿importa?</h3>
          <p>
            El voltaje varía entre <strong>100V y 240V</strong> según el país, y la frecuencia entre <strong>50 Hz y 60 Hz</strong>.
            La mayoría de cargadores modernos (móviles, portátiles) son <em>universales</em> (100-240V, 50-60Hz),
            pero los electrodomésticos como secadores, rizadores y afeitadoras pueden no serlo.
            Comprueba siempre la etiqueta del dispositivo antes de conectarlo.
          </p>

          <h3>¿Qué adaptador llevar?</h3>
          <ul>
            <li><strong>Adaptador universal:</strong> cubre la mayoría de países. Ideal para viajeros frecuentes</li>
            <li><strong>Adaptador específico:</strong> si solo viajas a un país o región concreta</li>
            <li><strong>Regleta con USB:</strong> permite cargar múltiples dispositivos con un solo adaptador</li>
          </ul>

          <h3>Los 5 adaptadores más útiles para viajeros españoles</h3>
          <ol>
            <li><strong>Tipo G</strong> para Reino Unido, Irlanda, India, Hong Kong, Malasia, Singapur</li>
            <li><strong>Tipo A/B</strong> para Estados Unidos, Canadá, México, Japón</li>
            <li><strong>Tipo I</strong> para Australia, Nueva Zelanda, Argentina</li>
            <li><strong>Tipo L</strong> para Italia y Chile</li>
            <li><strong>Adaptador universal</strong> para cualquier otro destino</li>
          </ol>

          <h3>Consejo práctico</h3>
          <p>
            Si viajas frecuentemente, invierte en un <strong>adaptador universal de calidad</strong> con
            puertos USB incorporados. Son compactos, cubren 150+ países y permiten cargar varios dispositivos
            simultáneamente. Presupuesto: entre 10€ y 30€.
          </p>

          {/* ── SECCIÓN 1: Tabla comparativa ── */}
          <h3>Comparativa de tipos de enchufe más comunes</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Países principales</th>
                  <th>Voltaje</th>
                  <th>Frecuencia</th>
                  <th>Forma</th>
                  <th>¿Adaptador desde España?</th>
                  <th>Compatibilidad con dispositivos europeos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tipo A</strong></td>
                  <td>EE.UU., Canadá, México, Japón</td>
                  <td>100-127 V</td>
                  <td>60 Hz</td>
                  <td>2 clavijas planas paralelas</td>
                  <td>Sí, obligatorio</td>
                  <td>Solo si el dispositivo es 100-240V</td>
                </tr>
                <tr>
                  <td><strong>Tipo B</strong></td>
                  <td>EE.UU., Canadá, México</td>
                  <td>120 V</td>
                  <td>60 Hz</td>
                  <td>2 planas + 1 redonda (tierra)</td>
                  <td>Sí, obligatorio</td>
                  <td>Solo si el dispositivo es 100-240V</td>
                </tr>
                <tr>
                  <td><strong>Tipo C</strong></td>
                  <td>Europa continental, Sudamérica, Asia</td>
                  <td>220-240 V</td>
                  <td>50 Hz</td>
                  <td>2 clavijas redondas delgadas</td>
                  <td>No (es el español)</td>
                  <td>Alta — formato nativo europeo</td>
                </tr>
                <tr>
                  <td><strong>Tipo E/F</strong></td>
                  <td>Alemania, Francia, España, Países Bajos</td>
                  <td>220-240 V</td>
                  <td>50 Hz</td>
                  <td>2 redondas + tierra (Schuko)</td>
                  <td>No (compatible con C/F español)</td>
                  <td>Muy alta — estándar europeo</td>
                </tr>
                <tr>
                  <td><strong>Tipo G</strong></td>
                  <td>Reino Unido, Irlanda, Malasia, Singapur</td>
                  <td>220-240 V</td>
                  <td>50 Hz</td>
                  <td>3 clavijas rectangulares</td>
                  <td>Sí, necesario</td>
                  <td>Alta — mismo voltaje, diferente forma</td>
                </tr>
                <tr>
                  <td><strong>Tipo I</strong></td>
                  <td>Australia, Nueva Zelanda, Argentina</td>
                  <td>220-240 V</td>
                  <td>50 Hz</td>
                  <td>3 clavijas en Y inclinadas</td>
                  <td>Sí, necesario</td>
                  <td>Alta — mismo voltaje, diferente forma</td>
                </tr>
                <tr>
                  <td><strong>Tipo L</strong></td>
                  <td>Italia, Chile</td>
                  <td>220-240 V</td>
                  <td>50 Hz</td>
                  <td>3 clavijas en línea horizontal</td>
                  <td>Sí, recomendable</td>
                  <td>Alta — mismo voltaje, diferente forma</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── SECCIÓN 2: Casos de uso ── */}
          <h3>Casos de uso frecuentes para viajeros españoles</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <strong>Mochilero en Sudeste Asiático</strong>
              </div>
              <p className={styles.escenarioExample}>
                Tailandia, Vietnam, Indonesia, Singapur y Malasia usan hasta 4 tipos de enchufe distintos en la misma región.
              </p>
              <p className={styles.escenarioTip}>
                💡 Un adaptador universal es imprescindible. Evita comprar uno por país.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Viajero de negocios a EE.UU./Canadá</strong>
              </div>
              <p className={styles.escenarioExample}>
                El enchufe europeo Tipo C no encaja en las tomas americanas Tipo A/B. Además, el voltaje baja de 230V a 120V.
              </p>
              <p className={styles.escenarioTip}>
                💡 Comprueba que tu portátil y cargadores son 100-240V. Si es así, solo necesitas adaptador de forma.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧‍👦</span>
                <strong>Familia en viaje largo</strong>
              </div>
              <p className={styles.escenarioExample}>
                Móviles, tablets, cámaras, portátiles... cargar todo simultáneamente requiere varias tomas o regletas.
              </p>
              <p className={styles.escenarioTip}>
                💡 Lleva una regleta española + un solo adaptador al destino. Más económico y práctico que varios adaptadores.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <strong>Nómada digital</strong>
              </div>
              <p className={styles.escenarioExample}>
                Portátil, monitor portátil, hub USB-C, micrófono... el nómada digital necesita múltiples tomas en cualquier país.
              </p>
              <p className={styles.escenarioTip}>
                💡 Adaptador universal con puertos USB-C integrados + regleta pequeña. Ideal para cualquier destino de trabajo.
              </p>
            </div>
          </div>

          {/* ── SECCIÓN 3: FAQ ── */}
          <h3>Preguntas frecuentes sobre enchufes y voltaje</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre adaptador y transformador de voltaje?</strong>
              <p>El <em>adaptador</em> solo cambia la forma del enchufe — no transforma el voltaje. El <em>transformador</em> convierte el voltaje (p. ej., de 230V a 110V). Si tu dispositivo ya es universal (100-240V), solo necesitas adaptador.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Los cargadores de móvil funcionan en todo el mundo?</strong>
              <p>En su mayoría sí. La etiqueta del cargador suele poner &quot;Input: 100-240V, 50-60Hz&quot;. Si lo pone, solo necesitas un adaptador de forma. Si pone solo &quot;230V&quot;, no lo uses en países de 110-120V sin transformador.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué ocurre si conecto un aparato de 220V a una toma de 110V?</strong>
              <p>El aparato recibirá la mitad del voltaje necesario. En la mayoría de casos simplemente no funcionará bien (motor lento, calefactor sin potencia). Puede dañarse con el tiempo si se usa así habitualmente.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Un adaptador universal sirve para absolutamente todos los países?</strong>
              <p>Cubre la inmensa mayoría (más de 150 países), pero algunos tipos muy específicos como el Tipo J suizo o el Tipo H israelí pueden tener limitaciones. Lee las especificaciones del adaptador antes de comprar.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué EE.UU. usa 110V y Europa 220V?</strong>
              <p>Son dos estándares históricos que se desarrollaron por separado. Edison promovió 110V en EE.UU. en los años 1880. Europa adoptó 220-240V más tarde porque permite transmitir más potencia con menos pérdidas en cables más largos.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el &quot;grounding&quot; o toma de tierra?</strong>
              <p>Es una conexión de seguridad eléctrica que dirige la corriente a tierra en caso de cortocircuito, protegiendo al usuario. Los enchufes Tipo B (EE.UU.), F (Schuko europeo) y G (UK) incluyen toma de tierra. El Tipo A y C no la tienen.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Necesito adaptador viajando dentro de Europa?</strong>
              <p>Generalmente no, si viajas por Europa continental (España, Francia, Alemania, Italia, Portugal...). La excepción notable es <strong>Reino Unido e Irlanda</strong> (Tipo G) y <strong>Suiza</strong> (Tipo J nativo). Siempre comprueba el país de destino.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puedo usar mi secador de pelo en el extranjero?</strong>
              <p>Depende. La mayoría de secadores domésticos españoles son solo 220-240V. Si viajas a un país con 110-120V (EE.UU., Canadá, Japón), necesitarás un transformador de voltaje — y los de alta potencia (1500-2000W) son voluminosos y pesados. Lo más práctico es comprar un secador de viaje universal.</p>
              <p className={styles.faqTip}>Tip: los hoteles de categoría media-alta suelen tener secador en la habitación.</p>
            </div>
          </div>

          {/* ── SECCIÓN 4: Guía paso a paso ── */}
          <h3>Cómo preparar los enchufes antes de tu viaje (7 pasos)</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica todos tus destinos</strong>
                <p>Si haces escala o visitas varios países, cada uno puede tener un tipo de enchufe diferente. Anótalos todos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Consulta el tipo de enchufe de cada país</strong>
                <p>Usa esta herramienta o la base de datos IEC. Anota los tipos A-N que necesitarás.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Revisa la etiqueta de cada dispositivo que llevarás</strong>
                <p>Busca el texto &quot;Input:&quot; en la parte trasera o inferior. Apunta el rango de voltaje admitido.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Si pone &quot;100-240V&quot;: solo necesitas adaptador de forma</strong>
                <p>El dispositivo es universal. Un simple adaptador de clavijas es suficiente — no necesitas transformador.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Si pone solo &quot;220-240V&quot;: necesitas transformador de voltaje</strong>
                <p>No conectes ese dispositivo directamente en países de 110V. Usa un transformador de potencia adecuada o déjalo en casa.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Compra el adaptador adecuado (o uno universal)</strong>
                <p>Si son varios países con tipos distintos, un adaptador universal es más económico que comprar uno por tipo. Presupuesto: 10-30€ en tiendas de viaje o Amazon.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Considera llevar una regleta española + un adaptador</strong>
                <p>Una regleta con varios enchufes españoles + un solo adaptador al destino permite cargar múltiples dispositivos simultáneamente sin comprar varios adaptadores.</p>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 5: Mejores prácticas ── */}
          <h3>Mejores prácticas para gestionar enchufes en viajes</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔌</span>
              <strong>Adaptador universal con USB-C</strong>
              <p>Elige uno con puertos USB-A y USB-C integrados. Cargarás móvil y tablet sin ocupar las tomas del adaptador.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
              <strong>Comprueba &quot;Input: 100-240V&quot;</strong>
              <p>Antes de hacer la maleta, revisa la etiqueta trasera de cada dispositivo. Es la única forma de saber si necesitas transformador.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
              <strong>Secadores y planchas: cuidado en 110V</strong>
              <p>Estos aparatos de alta potencia rara vez son universales. Sin transformador en un país de 110V, pueden dañarse o ser peligrosos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👨‍👩‍👧</span>
              <strong>Un adaptador por familia, no por persona</strong>
              <p>Combínalo con una regleta española. Ahorra dinero, espacio y peso en el equipaje.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <strong>Prioriza cargadores con base plana</strong>
              <p>Los adaptadores universales encajan mejor con cargadores de base plana (tipo bloque). Los de perfil ancho pueden no caber o bloquear la toma vecina.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Prepáralo 2 semanas antes</strong>
              <p>Comprar el adaptador con tiempo evita pagar 3-4 veces más en tiendas de aeropuerto o en destino. Pide online con antelación.</p>
            </div>
          </div>

          {/* ── SECCIÓN 6: Warning Box ── */}
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚡</span>
              <strong>Errores frecuentes que pueden dañar tus dispositivos</strong>
            </div>
            <ul className={styles.warningList}>
              <li>Conectar aparatos de 220V a una toma de 110V sin transformador — puede causar daño inmediato o acortar la vida útil del dispositivo.</li>
              <li>Comprar el adaptador en el aeropuerto — el precio puede ser 3 veces mayor que en tiendas online o de electrónica.</li>
              <li>Confundir adaptador con transformador de voltaje — el adaptador solo cambia la forma del enchufe, no convierte el voltaje.</li>
              <li>Asumir que toda Europa usa el mismo enchufe — <strong>Reino Unido usa Tipo G</strong>, incompatible con el Tipo C/F español sin adaptador.</li>
              <li>Olvidar verificar el voltaje del secador de pelo — casi ningún secador doméstico es universal. Puede quemarse o ser peligroso en países de 110V.</li>
              <li>No comprobar que el adaptador aguanta la potencia del dispositivo — los adaptadores baratos pueden no soportar aparatos de alta potencia (secadores, hervidores, planchas). Verifica el vataje máximo del adaptador.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('enchufes-por-pais')} />
        <ShareCard appName="enchufes-por-pais" />
      <Footer appName="enchufes-por-pais" />
      </main>
    </div>
  );
}
