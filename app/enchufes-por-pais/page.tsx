'use client';

import { useState } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { jsonLd } from './metadata';
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
 * Tipos A-M según IEC
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsTracker appName="enchufes-por-pais" />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🔌 Enchufes por País</h1>
        <p>¿Qué adaptador necesitas? Voltaje y tipos de enchufe en todo el mundo</p>
      </header>

      <LegalNotice />

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
            antes de que existieran estándares internacionales. Hoy existen 15 tipos de enchufe (A-M según IEC),
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
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('enchufes-por-pais')} />
        <ShareCard appName="enchufes-por-pais" />
      <Footer appName="enchufes-por-pais" />
      </main>
    </div>
  );
}
