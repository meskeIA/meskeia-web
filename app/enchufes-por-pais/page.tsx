'use client';

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { jsonLd } from './metadata';
import styles from './EnchufesPais.module.css';
import { getRelatedApps } from '@/data/app-relations';

interface DatosPais {
  pais: string;
  bandera: string;
  continente: string;
  tipos: string[];       // Tipos de enchufe: A, B, C, D…
  voltaje: string;       // Ej: "220-240 V"
  frecuencia: string;    // Ej: "50 Hz"
  notaAdaptador?: string;
}

/**
 * Base de datos de enchufes por país
 * Fuente: IEC 60083, World Standards, Wikipedia
 * Tipos A-M según IEC
 */
const BASE_PAISES: DatosPais[] = [
  // EUROPA
  { pais: 'España', bandera: '🇪🇸', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Uso propio de referencia. Los enchufes tipo C y F son estándar en casi toda Europa continental.' },
  { pais: 'Francia', bandera: '🇫🇷', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Necesitas adaptador para enchufes UK o americanos.' },
  { pais: 'Alemania', bandera: '🇩🇪', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con la mayoría de enchufes europeos.' },
  { pais: 'Italia', bandera: '🇮🇹', continente: 'Europa', tipos: ['C', 'F', 'L'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo L (tres clavijas en línea) es exclusivo de Italia. Lleva adaptador si tu equipo tiene tipo C estándar.' },
  { pais: 'Portugal', bandera: '🇵🇹', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con los enchufes españoles. Sin adaptador necesario.' },
  { pais: 'Reino Unido', bandera: '🇬🇧', continente: 'Europa', tipos: ['G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo G (tres clavijas rectangulares) es exclusivo de UK. Necesitas adaptador desde Europa continental.' },
  { pais: 'Irlanda', bandera: '🇮🇪', continente: 'Europa', tipos: ['G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Necesitas adaptador tipo G si vienes desde España.' },
  { pais: 'Suiza', bandera: '🇨🇭', continente: 'Europa', tipos: ['C', 'J'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo J (tres clavijas) es exclusivo de Suiza. El tipo C funciona en muchas tomas.' },
  { pais: 'Austria', bandera: '🇦🇹', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Bélgica', bandera: '🇧🇪', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Similar a Francia. Adaptador necesario para UK y EE.UU.' },
  { pais: 'Países Bajos', bandera: '🇳🇱', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Dinamarca', bandera: '🇩🇰', continente: 'Europa', tipos: ['C', 'F', 'K'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo K (dos clavijas redondas + toma de tierra lateral) es el estándar danés, pero el tipo F también funciona.' },
  { pais: 'Noruega', bandera: '🇳🇴', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Suecia', bandera: '🇸🇪', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Finlandia', bandera: '🇫🇮', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Polonia', bandera: '🇵🇱', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'República Checa', bandera: '🇨🇿', continente: 'Europa', tipos: ['C', 'E'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Hungría', bandera: '🇭🇺', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Rumanía', bandera: '🇷🇴', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Grecia', bandera: '🇬🇷', continente: 'Europa', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Turquía', bandera: '🇹🇷', continente: 'Europa/Asia', tipos: ['C', 'F'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Rusia', bandera: '🇷🇺', continente: 'Europa/Asia', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '50 Hz' },

  // AMÉRICAS
  { pais: 'Estados Unidos', bandera: '🇺🇸', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz', notaAdaptador: 'Voltaje diferente (120V vs 230V). Muchos cargadores modernos son universales (100-240V), comprueba la etiqueta del dispositivo.' },
  { pais: 'Canadá', bandera: '🇨🇦', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz', notaAdaptador: 'Igual que EE.UU. Comprueba si tu cargador soporta 100-240V.' },
  { pais: 'México', bandera: '🇲🇽', continente: 'América', tipos: ['A', 'B'], voltaje: '127 V', frecuencia: '60 Hz', notaAdaptador: 'Voltaje intermedio (127V). Verifica que tus dispositivos sean universales.' },
  { pais: 'Argentina', bandera: '🇦🇷', continente: 'América', tipos: ['C', 'I'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo I (tres clavijas en Y) es el estándar argentino. Muchos hoteles tienen adaptadores disponibles.' },
  { pais: 'Brasil', bandera: '🇧🇷', continente: 'América', tipos: ['C', 'N'], voltaje: '127-220 V', frecuencia: '60 Hz', notaAdaptador: 'Voltaje variable según ciudad. El tipo N (NBR 14136) es el estándar desde 2010, pero aún hay tipo C y A.' },
  { pais: 'Colombia', bandera: '🇨🇴', continente: 'América', tipos: ['A', 'B'], voltaje: '110 V', frecuencia: '60 Hz', notaAdaptador: 'Igual formato que EE.UU. pero voltaje 110V. Verifica compatibilidad de tus dispositivos.' },
  { pais: 'Chile', bandera: '🇨🇱', continente: 'América', tipos: ['C', 'L'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo L (italiano). Lleva adaptador universal.' },
  { pais: 'Perú', bandera: '🇵🇪', continente: 'América', tipos: ['A', 'B', 'C'], voltaje: '220 V', frecuencia: '60 Hz' },
  { pais: 'Ecuador', bandera: '🇪🇨', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz' },
  { pais: 'Cuba', bandera: '🇨🇺', continente: 'América', tipos: ['A', 'B', 'C', 'L'], voltaje: '110-220 V', frecuencia: '60 Hz', notaAdaptador: 'Mezcla de estándares. Adaptador universal muy recomendable.' },
  { pais: 'República Dominicana', bandera: '🇩🇴', continente: 'América', tipos: ['A', 'B'], voltaje: '120 V', frecuencia: '60 Hz' },

  // ASIA
  { pais: 'Japón', bandera: '🇯🇵', continente: 'Asia', tipos: ['A', 'B'], voltaje: '100 V', frecuencia: '50-60 Hz', notaAdaptador: 'Voltaje único en el mundo (100V). La mayoría de dispositivos europeos soporta 100-240V, pero verifica siempre.' },
  { pais: 'China', bandera: '🇨🇳', continente: 'Asia', tipos: ['A', 'C', 'I'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Variedad de tomas. El adaptador universal es muy recomendable.' },
  { pais: 'India', bandera: '🇮🇳', continente: 'Asia', tipos: ['C', 'D', 'M'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo D (tres clavijas circulares grandes) es exclusivo de India. Lleva adaptador. La calidad eléctrica puede variar.' },
  { pais: 'Tailandia', bandera: '🇹🇭', continente: 'Asia', tipos: ['A', 'B', 'C'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Aceptan tipos mixtos. El adaptador tipo C español suele funcionar.' },
  { pais: 'Indonesia', bandera: '🇮🇩', continente: 'Asia', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '50 Hz' },
  { pais: 'Vietnam', bandera: '🇻🇳', continente: 'Asia', tipos: ['A', 'C', 'G'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Mezcla de estándares en hoteles. Adaptador universal muy útil.' },
  { pais: 'Malasia', bandera: '🇲🇾', continente: 'Asia', tipos: ['G'], voltaje: '240 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Necesitas adaptador tipo G desde España.' },
  { pais: 'Singapur', bandera: '🇸🇬', continente: 'Asia', tipos: ['G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Adaptador tipo G necesario.' },
  { pais: 'Corea del Sur', bandera: '🇰🇷', continente: 'Asia', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '60 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C/F.' },
  { pais: 'Hong Kong', bandera: '🇭🇰', continente: 'Asia', tipos: ['G'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Adaptador tipo G necesario.' },
  { pais: 'Filipinas', bandera: '🇵🇭', continente: 'Asia', tipos: ['A', 'B', 'C'], voltaje: '220 V', frecuencia: '60 Hz' },
  { pais: 'Sri Lanka', bandera: '🇱🇰', continente: 'Asia', tipos: ['D', 'G', 'M'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G (UK). Adaptador universal recomendable.' },
  { pais: 'Nepal', bandera: '🇳🇵', continente: 'Asia', tipos: ['C', 'D', 'M'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Israel', bandera: '🇮🇱', continente: 'Asia', tipos: ['C', 'H', 'M'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo H (triángulo de tres clavijas) es exclusivo de Israel. El tipo C funciona en muchas tomas.' },
  { pais: 'Emiratos Árabes Unidos', bandera: '🇦🇪', continente: 'Asia', tipos: ['C', 'G'], voltaje: '220-240 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G (UK). Muchos hoteles tienen adaptadores disponibles.' },
  { pais: 'Arabia Saudí', bandera: '🇸🇦', continente: 'Asia', tipos: ['A', 'B', 'C', 'G'], voltaje: '127-220 V', frecuencia: '60 Hz', notaAdaptador: 'Gran variedad. Adaptador universal muy recomendable.' },
  { pais: 'Jordania', bandera: '🇯🇴', continente: 'Asia', tipos: ['B', 'C', 'D', 'F', 'G', 'J'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Gran variedad de tomas. Adaptador universal imprescindible.' },
  { pais: 'Marruecos', bandera: '🇲🇦', continente: 'África', tipos: ['C', 'E'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C. Sin problemas desde España.' },

  // ÁFRICA
  { pais: 'Sudáfrica', bandera: '🇿🇦', continente: 'África', tipos: ['C', 'M', 'N'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo M (tres clavijas grandes) es exclusivo de Sudáfrica. Necesitas adaptador.' },
  { pais: 'Egipto', bandera: '🇪🇬', continente: 'África', tipos: ['C', 'F'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Compatible con enchufes europeos tipo C/F.' },
  { pais: 'Kenia', bandera: '🇰🇪', continente: 'África', tipos: ['G'], voltaje: '240 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Reino Unido. Adaptador tipo G necesario.' },
  { pais: 'Tanzania', bandera: '🇹🇿', continente: 'África', tipos: ['D', 'G'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Principalmente tipo G. Adaptador necesario.' },
  { pais: 'Ghana', bandera: '🇬🇭', continente: 'África', tipos: ['D', 'G'], voltaje: '230 V', frecuencia: '50 Hz' },
  { pais: 'Nigeria', bandera: '🇳🇬', continente: 'África', tipos: ['D', 'G'], voltaje: '240 V', frecuencia: '50 Hz' },
  { pais: 'Etiopía', bandera: '🇪🇹', continente: 'África', tipos: ['C', 'E', 'F', 'L'], voltaje: '220 V', frecuencia: '50 Hz', notaAdaptador: 'Variedad de tomas. El tipo C suele funcionar.' },
  { pais: 'Madagascar', bandera: '🇲🇬', continente: 'África', tipos: ['C', 'E'], voltaje: '220 V', frecuencia: '50 Hz' },

  // OCEANÍA
  { pais: 'Australia', bandera: '🇦🇺', continente: 'Oceanía', tipos: ['I'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'El tipo I (tres clavijas en Y inclinadas) es exclusivo de Australia/NZ. Adaptador específico necesario.' },
  { pais: 'Nueva Zelanda', bandera: '🇳🇿', continente: 'Oceanía', tipos: ['I'], voltaje: '230 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Australia. Adaptador tipo I necesario.' },
  { pais: 'Fiyi', bandera: '🇫🇯', continente: 'Oceanía', tipos: ['I'], voltaje: '240 V', frecuencia: '50 Hz', notaAdaptador: 'Igual que Australia. Adaptador tipo I necesario.' },
];

const TIPOS_ENCHUFE: Record<string, string> = {
  A: 'Tipo A — Dos clavijas planas paralelas (EE.UU., Japón)',
  B: 'Tipo B — Dos clavijas planas + tierra redonda (EE.UU., Japón)',
  C: 'Tipo C — Dos clavijas redondas delgadas (Europa continental)',
  D: 'Tipo D — Tres clavijas circulares grandes en triángulo (India)',
  E: 'Tipo E — Dos clavijas redondas + agujero tierra (Francia, Bélgica)',
  F: 'Tipo F — Dos clavijas redondas con tierra lateral (Schuko, Alemania)',
  G: 'Tipo G — Tres clavijas rectangulares (Reino Unido, Irlanda)',
  H: 'Tipo H — Tres clavijas en triángulo (Israel)',
  I: 'Tipo I — Tres clavijas en Y inclinadas (Australia, Argentina)',
  J: 'Tipo J — Tres clavijas redondas (Suiza)',
  K: 'Tipo K — Dos clavijas + tierra lateral (Dinamarca)',
  L: 'Tipo L — Tres clavijas en línea (Italia, Chile)',
  M: 'Tipo M — Tres clavijas circulares grandes (Sudáfrica)',
  N: 'Tipo N — Tres clavijas redondas estándar IEC (Brasil)',
};

export default function EnchufesPais() {
  const [busqueda, setBusqueda] = useState<string>('');

  const paisesFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return BASE_PAISES;
    return BASE_PAISES.filter(p =>
      p.pais.toLowerCase().includes(termino) ||
      p.continente.toLowerCase().includes(termino) ||
      p.tipos.some(t => t.toLowerCase().includes(termino))
    );
  }, [busqueda]);

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
        {/* Referencia de tipos */}
        <section className={styles.referenciaTypes}>
          <h2>Tipos de enchufe (IEC)</h2>
          <div className={styles.gridTipos}>
            {Object.entries(TIPOS_ENCHUFE).map(([tipo, descripcion]) => (
              <div key={tipo} className={styles.itemTipo}>
                <span className={styles.itemTipoLetra}>Tipo {tipo}</span>
                <br />
                <span>{descripcion.split(' — ')[1]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Buscador */}
        <div className={styles.buscador}>
          <span className={styles.iconoBusqueda} aria-hidden="true">🔍</span>
          <input
            type="search"
            className={styles.inputBusqueda}
            placeholder="Buscar por país, continente o tipo de enchufe…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            aria-label="Buscar país"
          />
        </div>

        <p className={styles.contador} aria-live="polite">
          {paisesFiltrados.length} {paisesFiltrados.length === 1 ? 'país' : 'países'} encontrados
        </p>

        {/* Lista de países */}
        {paisesFiltrados.length === 0 ? (
          <div className={styles.sinResultados}>
            No se encontraron países con ese término. Prueba con otro nombre.
          </div>
        ) : (
          paisesFiltrados.map(pais => (
            <article key={pais.pais} className={styles.tarjetaPais}>
              <div className={styles.cabeceraPais}>
                <span className={styles.bandera} aria-hidden="true">{pais.bandera}</span>
                <div className={styles.infoPais}>
                  <h2 className={styles.nombrePais}>{pais.pais}</h2>
                  <span className={styles.continentePais}>{pais.continente}</span>
                </div>
              </div>

              {/* Tipos de enchufe */}
              <div className={styles.tiposEnchufe} aria-label={`Tipos de enchufe en ${pais.pais}`}>
                {pais.tipos.map(tipo => (
                  <span key={tipo} className={styles.chipTipo} title={TIPOS_ENCHUFE[tipo]}>
                    Tipo {tipo}
                  </span>
                ))}
              </div>

              {/* Datos eléctricos */}
              <div className={styles.datosElectricos}>
                <div className={styles.dato}>
                  <span className={styles.datoValor}>{pais.voltaje}</span>
                  <span className={styles.datoLabel}>Voltaje</span>
                </div>
                <div className={styles.dato}>
                  <span className={styles.datoValor}>{pais.frecuencia}</span>
                  <span className={styles.datoLabel}>Frecuencia</span>
                </div>
                <div className={styles.dato}>
                  <span className={styles.datoValor}>{pais.tipos.join(' / ')}</span>
                  <span className={styles.datoLabel}>Tipos</span>
                </div>
              </div>

              {/* Nota de adaptador */}
              {pais.notaAdaptador && (
                <p className={styles.notaAdaptador}>
                  💡 {pais.notaAdaptador}
                </p>
              )}
            </article>
          ))
        )}

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
            <li><strong>Tipo G</strong> para Reino Unido, Irlanda, India, Pakistán, Hong Kong, Malasia, Singapur</li>
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
        <Footer appName="enchufes-por-pais" />
      </main>
    </div>
  );
}
