'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Ecosistema.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'piramide' | 'regla10' | 'ciclos' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'piramide', titulo: 'Pirámide trófica', icono: '🔺', subtitulo: 'Los niveles de la vida: quién come a quién' },
  { id: 'regla10', titulo: 'Regla del 10%', icono: '⚡', subtitulo: 'Por qué se pierde el 90% de la energía' },
  { id: 'ciclos', titulo: 'Ciclos biogeoquímicos', icono: '🔄', subtitulo: 'El carbono y el nitrógeno nunca se destruyen' },
  { id: 'datos', titulo: 'Datos fascinantes', icono: '🌍', subtitulo: 'Naturaleza en números que sorprenden' },
];

// ─────────────────────────────────────────────
// Datos: Pirámide trófica
// ─────────────────────────────────────────────

interface NivelTrofico {
  nombre: string;
  icono: string;
  color: string;
  colorFondo: string;
  anchoPct: number;
  ejemplos: string[];
  biomasa: string;
  numEspecies: string;
  descripcion: string;
  energia: string;
}

const NIVELES_TROFICOS: NivelTrofico[] = [
  {
    nombre: 'Consumidores terciarios',
    icono: '🦅',
    color: '#DC2626',
    colorFondo: 'rgba(220,38,38,0.1)',
    anchoPct: 10,
    ejemplos: ['Águilas', 'Lobos', 'Tiburones', 'Orcas', 'Leones'],
    biomasa: '~1 kg por hectárea',
    numEspecies: 'Muy pocas (decenas)',
    descripcion: 'Superdepredadores. No tienen depredadores naturales. Regulan las poblaciones de niveles inferiores.',
    energia: '0,1% de la energía original',
  },
  {
    nombre: 'Consumidores secundarios',
    icono: '🦊',
    color: '#EA580C',
    colorFondo: 'rgba(234,88,12,0.1)',
    anchoPct: 25,
    ejemplos: ['Zorros', 'Serpientes', 'Ranas', 'Búhos', 'Atún'],
    biomasa: '~10 kg por hectárea',
    numEspecies: 'Centenares',
    descripcion: 'Carnívoros que se alimentan de herbívoros. Controlan las poblaciones de consumidores primarios.',
    energia: '1% de la energía original',
  },
  {
    nombre: 'Consumidores primarios',
    icono: '🐇',
    color: '#CA8A04',
    colorFondo: 'rgba(202,138,4,0.1)',
    anchoPct: 50,
    ejemplos: ['Conejos', 'Ciervos', 'Zooplancton', 'Saltamontes', 'Vacas'],
    biomasa: '~100 kg por hectárea',
    numEspecies: 'Miles',
    descripcion: 'Herbívoros. Transforman la materia vegetal en proteína animal. Son la base de los carnívoros.',
    energia: '10% de la energía original',
  },
  {
    nombre: 'Productores',
    icono: '🌿',
    color: '#16A34A',
    colorFondo: 'rgba(22,163,74,0.1)',
    anchoPct: 100,
    ejemplos: ['Plantas', 'Algas', 'Fitoplancton', 'Cianobacterias', 'Musgos'],
    biomasa: '~1.000 kg por hectárea',
    numEspecies: 'Cientos de miles',
    descripcion: 'Fotosíntesis: convierten la energía solar en materia orgánica. Son la base de toda la vida.',
    energia: '100% — capturan ~1% de la energía solar',
  },
];

interface Descomponedor {
  nombre: string;
  icono: string;
  funcion: string;
}

const DESCOMPONEDORES: Descomponedor[] = [
  { nombre: 'Hongos', icono: '🍄', funcion: 'Descomponen madera, hojarasca y materia orgánica compleja' },
  { nombre: 'Bacterias', icono: '🦠', funcion: 'Descomponen restos orgánicos y reciclan nutrientes al suelo' },
  { nombre: 'Lombrices', icono: '🪱', funcion: 'Fragmentan materia orgánica y airean el suelo' },
];

// ─────────────────────────────────────────────
// Datos: Regla del 10%
// ─────────────────────────────────────────────

interface NivelEnergia {
  nivel: string;
  icono: string;
  kcal: number;
  color: string;
  perdida: string;
}

const FLUJO_ENERGIA: NivelEnergia[] = [
  { nivel: 'Productores (plantas)', icono: '🌿', kcal: 10000, color: '#16A34A', perdida: '' },
  { nivel: 'Herbívoros (conejo)', icono: '🐇', kcal: 1000, color: '#CA8A04', perdida: '9.000 kcal perdidas como calor, respiración y desechos' },
  { nivel: 'Carnívoros (zorro)', icono: '🦊', kcal: 100, color: '#EA580C', perdida: '900 kcal perdidas como calor, respiración y desechos' },
  { nivel: 'Superdepredador (águila)', icono: '🦅', kcal: 10, color: '#DC2626', perdida: '90 kcal perdidas como calor, respiración y desechos' },
];

interface DestinoPerdida {
  destino: string;
  porcentaje: number;
  icono: string;
  explicacion: string;
}

const DESTINO_ENERGIA: DestinoPerdida[] = [
  { destino: 'Respiración celular (calor)', porcentaje: 60, icono: '🌡️', explicacion: 'Los organismos queman energía para moverse, crecer y mantener la temperatura corporal' },
  { destino: 'Desechos y excreciones', porcentaje: 20, icono: '💩', explicacion: 'Heces, orina y otros productos metabólicos que no se asimilan' },
  { destino: 'Partes no consumidas', porcentaje: 10, icono: '🦴', explicacion: 'Huesos, pelo, plumas, raíces y partes que el depredador no come' },
  { destino: 'Pasa al siguiente nivel', porcentaje: 10, icono: '⬆️', explicacion: 'Solo esta fracción queda disponible para el siguiente consumidor' },
];

// ─────────────────────────────────────────────
// Datos: Ciclos biogeoquímicos
// ─────────────────────────────────────────────

type CicloId = 'carbono' | 'nitrogeno';

interface EtapaCiclo {
  nombre: string;
  icono: string;
  descripcion: string;
  detalle: string;
}

interface CicloBio {
  id: CicloId;
  nombre: string;
  icono: string;
  color: string;
  etapas: EtapaCiclo[];
  impactoHumano: string;
}

const CICLOS: CicloBio[] = [
  {
    id: 'carbono',
    nombre: 'Ciclo del Carbono',
    icono: '🌱',
    color: '#16A34A',
    etapas: [
      { nombre: 'Fotosíntesis', icono: '☀️', descripcion: 'Las plantas absorben CO₂ y lo convierten en glucosa usando la luz solar.', detalle: '6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂' },
      { nombre: 'Respiración', icono: '🫁', descripcion: 'Todos los seres vivos queman glucosa y liberan CO₂ de vuelta a la atmósfera.', detalle: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energía' },
      { nombre: 'Descomposición', icono: '🍄', descripcion: 'Los descomponedores liberan CO₂ al descomponer materia orgánica muerta.', detalle: 'Hongos y bacterias procesan ~90% de la materia muerta en bosques' },
      { nombre: 'Combustibles fósiles', icono: '⛽', descripcion: 'El carbono almacenado durante millones de años se libera al quemar petróleo, carbón y gas.', detalle: 'La humanidad libera ~36.000 millones de toneladas de CO₂ al año' },
      { nombre: 'Océanos (sumidero)', icono: '🌊', descripcion: 'Los océanos absorben ~25% del CO₂ emitido por los humanos, acidificándose.', detalle: 'El pH oceánico ha bajado 0,1 unidades desde la era preindustrial (un 30% más ácido)' },
    ],
    impactoHumano: 'La quema de combustibles fósiles libera carbono que estuvo enterrado millones de años, acelerando el efecto invernadero y el cambio climático.',
  },
  {
    id: 'nitrogeno',
    nombre: 'Ciclo del Nitrógeno',
    icono: '🔵',
    color: '#2563EB',
    etapas: [
      { nombre: 'Fijación', icono: '🦠', descripcion: 'Bacterias del suelo (Rhizobium) convierten el N₂ atmosférico en amoniaco (NH₃).', detalle: 'El 78% del aire es N₂, pero los seres vivos no pueden usarlo directamente' },
      { nombre: 'Nitrificación', icono: '⚗️', descripcion: 'Otras bacterias transforman el NH₃ en nitritos (NO₂⁻) y luego en nitratos (NO₃⁻).', detalle: 'Los nitratos son la forma que las plantas pueden absorber por las raíces' },
      { nombre: 'Asimilación', icono: '🌱', descripcion: 'Las plantas absorben NO₃⁻ y lo usan para fabricar aminoácidos y proteínas.', detalle: 'El nitrógeno es esencial para el ADN, proteínas y clorofila' },
      { nombre: 'Consumo y descomposición', icono: '🐇', descripcion: 'Los animales obtienen nitrógeno al comer plantas. Al morir, los descomponedores lo devuelven al suelo.', detalle: 'Las heces y la orina son ricas en compuestos nitrogenados (urea, ácido úrico)' },
      { nombre: 'Desnitrificación', icono: '💨', descripcion: 'Bacterias anaerobias convierten los nitratos de vuelta a N₂ gaseoso, cerrando el ciclo.', detalle: 'Sin este paso, el nitrógeno se acumularía en el suelo y empobrecería la atmósfera' },
    ],
    impactoHumano: 'Los fertilizantes artificiales (proceso Haber-Bosch) añaden nitrógeno reactivo al medio, causando eutrofización de ríos y lagos, zonas muertas costeras y contaminación del agua potable.',
  },
];

// ─────────────────────────────────────────────
// Datos: Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  dato: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '🌿', titulo: 'Eficiencia solar', dato: 'Solo ~1%', detalle: 'Los productores capturan apenas el 1% de la energía solar que reciben. El resto se refleja o se convierte en calor.' },
  { icono: '🐺', titulo: 'Lobos de Yellowstone', dato: 'Cambiaron ríos', detalle: 'Reintroducir lobos en 1995 redujo la población de ciervos, la vegetación se recuperó, las raíces estabilizaron las orillas y los ríos cambiaron de curso. Es el ejemplo más famoso de cascada trófica.' },
  { icono: '🌊', titulo: 'Fitoplancton', dato: '50-80% del O₂', detalle: 'El fitoplancton marino produce entre el 50% y el 80% del oxígeno que respiras. Son organismos microscópicos, pero su impacto es planetario.' },
  { icono: '🍄', titulo: 'Sin descomponedores', dato: 'Tierra cubierta de muertos', detalle: 'Sin hongos y bacterias descomponedoras, la materia orgánica muerta se acumularía sin reciclarse. La Tierra estaría literalmente cubierta de cadáveres y hojarasca.' },
  { icono: '🐜', titulo: 'Hormigas', dato: '15-20% biomasa animal', detalle: 'Las hormigas representan entre el 15% y el 20% de la biomasa animal terrestre. Hay aproximadamente 20.000 billones de hormigas en el planeta.' },
  { icono: '🌡️', titulo: 'Efecto invernadero natural', dato: '+33 °C', detalle: 'Sin el efecto invernadero natural (sin intervención humana), la temperatura media de la Tierra sería -18 °C en vez de 15 °C. El problema es el exceso de gases añadido por la actividad humana.' },
  { icono: '🔄', titulo: 'Tu agua es antigua', dato: 'Miles de millones de años', detalle: 'El agua de tu cuerpo ha pasado por el ciclo hidrológico miles de millones de veces. Las mismas moléculas estuvieron en dinosaurios, volcanes y glaciares.' },
  { icono: '🐟', titulo: 'El atún y el fitoplancton', dato: '10.000 → 1 kg', detalle: 'Se necesitan aproximadamente 10.000 kg de fitoplancton para producir 1 kg de atún, porque la energía se pierde en cada nivel trófico.' },
];

// ─────────────────────────────────────────────
// Sección 1: Pirámide Trófica
// ─────────────────────────────────────────────

function SeccionPiramide() {
  const [nivelActivo, setNivelActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La <strong>pirámide trófica</strong> muestra cómo se organiza la vida: los productores en la base sostienen a todos los demás niveles. Cada nivel tiene menos biomasa y menos energía.</p>
      </div>

      {/* Pirámide visual */}
      <div className={styles.piramide}>
        {NIVELES_TROFICOS.map((nivel, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.piramideNivel} ${nivelActivo === i ? styles.piramideNivelActivo : ''}`}
            style={{
              width: `${nivel.anchoPct}%`,
              background: nivelActivo === i ? nivel.colorFondo : undefined,
              borderColor: nivelActivo === i ? nivel.color : undefined,
            }}
            onClick={() => setNivelActivo(nivelActivo === i ? null : i)}
            aria-expanded={nivelActivo === i}
            aria-label={`${nivel.nombre}: ${nivel.ejemplos.join(', ')}`}
          >
            <span className={styles.piramideIcono} aria-hidden="true">{nivel.icono}</span>
            <span className={styles.piramideNombre}>{nivel.nombre}</span>
            <span className={styles.piramideEnergia} style={{ color: nivel.color }}>{nivel.energia}</span>
          </button>
        ))}
        {/* Flechas de energía */}
        <div className={styles.piramideFlechas} aria-hidden="true">
          <span className={styles.piramideFlechaTexto}>Energía ↑</span>
          <span className={styles.piramideFlechaSub}>Se pierde 90% en cada nivel</span>
        </div>
      </div>

      {/* Detalle nivel expandido */}
      {nivelActivo !== null && (
        <div className={styles.nivelDetalle} style={{ borderColor: NIVELES_TROFICOS[nivelActivo].color }}>
          <div className={styles.nivelDetalleHeader}>
            <span aria-hidden="true" className={styles.nivelDetalleIcono}>{NIVELES_TROFICOS[nivelActivo].icono}</span>
            <h3 className={styles.nivelDetalleTitulo}>{NIVELES_TROFICOS[nivelActivo].nombre}</h3>
          </div>
          <p className={styles.nivelDetalleDesc}>{NIVELES_TROFICOS[nivelActivo].descripcion}</p>
          <div className={styles.nivelDetalleGrid}>
            <div className={styles.nivelDato}>
              <span className={styles.nivelDatoLabel}>Ejemplos</span>
              <span className={styles.nivelDatoValor}>{NIVELES_TROFICOS[nivelActivo].ejemplos.join(', ')}</span>
            </div>
            <div className={styles.nivelDato}>
              <span className={styles.nivelDatoLabel}>Biomasa</span>
              <span className={styles.nivelDatoValor}>{NIVELES_TROFICOS[nivelActivo].biomasa}</span>
            </div>
            <div className={styles.nivelDato}>
              <span className={styles.nivelDatoLabel}>N.º de especies</span>
              <span className={styles.nivelDatoValor}>{NIVELES_TROFICOS[nivelActivo].numEspecies}</span>
            </div>
          </div>
        </div>
      )}

      {nivelActivo === null && (
        <p className={styles.instruccion}>Pulsa en cualquier nivel de la pirámide para ver los detalles</p>
      )}

      {/* Descomponedores */}
      <div className={styles.descomponedoresCard}>
        <h3 className={styles.descomponedoresTitulo}>
          <span aria-hidden="true">🍄</span> Descomponedores — Los recicladores invisibles
        </h3>
        <p className={styles.descomponedoresDesc}>
          No forman parte de la pirámide, pero sin ellos no funcionaría. Reciclan la materia orgánica muerta y devuelven nutrientes al suelo.
        </p>
        <div className={styles.descomponedoresGrid}>
          {DESCOMPONEDORES.map((d, i) => (
            <div key={i} className={styles.descomponedorItem}>
              <span className={styles.descomponedorIcono} aria-hidden="true">{d.icono}</span>
              <span className={styles.descomponedorNombre}>{d.nombre}</span>
              <span className={styles.descomponedorFuncion}>{d.funcion}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Se necesitan aproximadamente <strong>{formatNumber(10000, 0)} kg de fitoplancton</strong> para producir <strong>1 kg de atún</strong>.
          Cada nivel trófico sostiene al siguiente, pero con enormes pérdidas de energía.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Regla del 10%
// ─────────────────────────────────────────────

function SeccionRegla10() {
  const [destinoActivo, setDestinoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En cada nivel trófico, solo el <strong>10% de la energía</strong> pasa al siguiente. El 90% restante se pierde como calor, desechos y partes no consumidas.</p>
      </div>

      {/* Barras decrecientes de energía */}
      <div className={styles.flujoEnergia}>
        <div className={styles.flujoSol}>
          <span aria-hidden="true">☀️</span>
          <span>Energía solar</span>
        </div>
        {FLUJO_ENERGIA.map((nivel, i) => (
          <div key={i} className={styles.flujoNivel}>
            <div className={styles.flujoInfo}>
              <span aria-hidden="true">{nivel.icono}</span>
              <span className={styles.flujoNombre}>{nivel.nivel}</span>
              <span className={styles.flujoKcal} style={{ color: nivel.color }}>{formatNumber(nivel.kcal, 0)} kcal</span>
            </div>
            <div className={styles.flujoTrack}>
              <div
                className={styles.flujoRelleno}
                style={{
                  width: `${(nivel.kcal / 10000) * 100}%`,
                  background: nivel.color,
                }}
              />
            </div>
            {nivel.perdida && (
              <div className={styles.flujoPerdida}>
                <span className={styles.flujoFlechaPerdida} aria-hidden="true">↘</span>
                <span className={styles.flujoPerdidaTexto}>{nivel.perdida}</span>
              </div>
            )}
            {i < FLUJO_ENERGIA.length - 1 && (
              <div className={styles.flujoConector} aria-hidden="true">
                <span>▼ solo 10% pasa</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ¿Dónde va el 90%? */}
      <div className={styles.destinoCard}>
        <h3 className={styles.destinoTitulo}>¿Dónde va el 90% que se pierde?</h3>
        <div className={styles.destinoGrid}>
          {DESTINO_ENERGIA.map((d, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.destinoItem} ${destinoActivo === i ? styles.destinoItemActivo : ''}`}
              onClick={() => setDestinoActivo(destinoActivo === i ? null : i)}
              aria-expanded={destinoActivo === i}
            >
              <span className={styles.destinoIcono} aria-hidden="true">{d.icono}</span>
              <span className={styles.destinoPct}>{d.porcentaje}%</span>
              <span className={styles.destinoNombre}>{d.destino}</span>
              {destinoActivo === i && (
                <span className={styles.destinoExplicacion}>{d.explicacion}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Implicación vegetariana */}
      <div className={styles.implicacionCard}>
        <h3 className={styles.implicacionTitulo}>Implicación: eficiencia de la dieta</h3>
        <div className={styles.implicacionGrid}>
          <div className={styles.implicacionCol}>
            <span className={styles.implicacionColTitulo}><span aria-hidden="true">🥬</span> Dieta vegetariana</span>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Niveles tróficos</span>
              <span className={styles.implicacionValor}>1 (plantas → humano)</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Eficiencia</span>
              <span className={styles.implicacionValor} style={{ color: '#16A34A' }}>10%</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Terreno para 1 persona</span>
              <span className={styles.implicacionValor}>~0,2 ha</span>
            </div>
          </div>
          <div className={styles.implicacionCol}>
            <span className={styles.implicacionColTitulo}><span aria-hidden="true">🥩</span> Dieta carnívora</span>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Niveles tróficos</span>
              <span className={styles.implicacionValor}>2 (plantas → animal → humano)</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Eficiencia</span>
              <span className={styles.implicacionValor} style={{ color: '#DC2626' }}>1%</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Terreno para 1 persona</span>
              <span className={styles.implicacionValor}>~2 ha (10x más)</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Por cada nivel que subes en la pirámide, <strong>pierdes el 90% de la energía</strong>.
          Esto explica por qué hay muchas más plantas que herbívoros, y muchos más herbívoros que depredadores.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Ciclos Biogeoquímicos
// ─────────────────────────────────────────────

function SeccionCiclos() {
  const [cicloActivo, setCicloActivo] = useState<CicloId>('carbono');
  const [etapaActiva, setEtapaActiva] = useState<number | null>(null);

  const ciclo = CICLOS.find(c => c.id === cicloActivo)!;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La materia <strong>no se crea ni se destruye</strong>: los átomos se reciclan continuamente entre la atmósfera, los seres vivos y el suelo. Estos son los ciclos biogeoquímicos.</p>
      </div>

      {/* Toggle carbono/nitrógeno */}
      <div className={styles.cicloToggle}>
        {CICLOS.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.cicloToggleBtn} ${cicloActivo === c.id ? styles.cicloToggleActivo : ''}`}
            onClick={() => { setCicloActivo(c.id); setEtapaActiva(null); }}
            aria-pressed={cicloActivo === c.id}
            style={cicloActivo === c.id ? { borderColor: c.color, background: c.color } : {}}
          >
            <span aria-hidden="true">{c.icono}</span> {c.nombre}
          </button>
        ))}
      </div>

      {/* Diagrama circular del ciclo */}
      <div className={styles.cicloContainer}>
        <div className={styles.cicloDiagrama}>
          {ciclo.etapas.map((etapa, i) => {
            const total = ciclo.etapas.length;
            const angulo = (i / total) * 360 - 90;
            const radianes = (angulo * Math.PI) / 180;
            const radio = 42;
            const x = 50 + radio * Math.cos(radianes);
            const y = 50 + radio * Math.sin(radianes);

            return (
              <button
                key={i}
                type="button"
                className={`${styles.cicloEtapa} ${etapaActiva === i ? styles.cicloEtapaActiva : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  borderColor: etapaActiva === i ? ciclo.color : undefined,
                }}
                onClick={() => setEtapaActiva(etapaActiva === i ? null : i)}
                aria-expanded={etapaActiva === i}
                aria-label={`${etapa.nombre}: ${etapa.descripcion}`}
              >
                <span className={styles.cicloEtapaIcono} aria-hidden="true">{etapa.icono}</span>
                <span className={styles.cicloEtapaNombre}>{etapa.nombre}</span>
              </button>
            );
          })}
          {/* Centro del diagrama */}
          <div className={styles.cicloCentro} style={{ color: ciclo.color }}>
            <span className={styles.cicloCentroIcono} aria-hidden="true">{ciclo.icono}</span>
            <span className={styles.cicloCentroNombre}>{ciclo.nombre}</span>
          </div>
          {/* Flechas circulares animadas */}
          <svg className={styles.cicloFlechasSvg} viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={ciclo.color}
              strokeWidth="0.5"
              strokeDasharray="4 3"
              opacity="0.3"
              className={styles.cicloCirculoAnimado}
            />
          </svg>
        </div>
      </div>

      {/* Detalle etapa expandida */}
      {etapaActiva !== null && (
        <div className={styles.cicloDetalle} style={{ borderColor: ciclo.color }}>
          <div className={styles.cicloDetalleHeader}>
            <span aria-hidden="true" className={styles.cicloDetalleIcono}>{ciclo.etapas[etapaActiva].icono}</span>
            <h3 className={styles.cicloDetalleTitulo}>{ciclo.etapas[etapaActiva].nombre}</h3>
          </div>
          <p className={styles.cicloDetalleDesc}>{ciclo.etapas[etapaActiva].descripcion}</p>
          <div className={styles.cicloDetalleFormula}>
            {ciclo.etapas[etapaActiva].detalle}
          </div>
        </div>
      )}

      {etapaActiva === null && (
        <p className={styles.instruccion}>Pulsa en cualquier etapa del ciclo para ver los detalles</p>
      )}

      {/* Impacto humano */}
      <div className={styles.impactoCard} style={{ borderLeftColor: ciclo.color }}>
        <h3 className={styles.impactoTitulo}>
          <span aria-hidden="true">⚠️</span> Impacto humano
        </h3>
        <p className={styles.impactoDesc}>{ciclo.impactoHumano}</p>
      </div>

      <div className={styles.insight}>
        <p>
          Los átomos de carbono de tu cuerpo estuvieron en <strong>dinosaurios, volcanes y estrellas</strong>.
          La materia no se destruye, solo cambia de forma y de lugar.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  const [datoActivo, setDatoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La naturaleza en números que <strong>sorprenden</strong>. Datos reales sobre ecología que probablemente no conocías.</p>
      </div>

      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.datoCard} ${datoActivo === i ? styles.datoCardActivo : ''}`}
            onClick={() => setDatoActivo(datoActivo === i ? null : i)}
            aria-expanded={datoActivo === i}
          >
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.datoCifra}>{d.dato}</span>
            <span className={styles.datoTitulo}>{d.titulo}</span>
            {datoActivo === i && (
              <span className={styles.datoDetalle}>{d.detalle}</span>
            )}
          </button>
        ))}
      </div>

      {/* Cadena vs Red trófica */}
      <div className={styles.redCard}>
        <h3 className={styles.redTitulo}>Cadena trófica vs Red trófica</h3>
        <div className={styles.redComparativa}>
          <div className={styles.redCol}>
            <span className={styles.redColTitulo}>Cadena trófica (simplificado)</span>
            <div className={styles.redCadena}>
              <span>🌿 Planta</span>
              <span aria-hidden="true">→</span>
              <span>🐇 Conejo</span>
              <span aria-hidden="true">→</span>
              <span>🦊 Zorro</span>
              <span aria-hidden="true">→</span>
              <span>🦅 Águila</span>
            </div>
            <p className={styles.redDesc}>Lineal, un solo camino. Útil para entender el concepto, pero irreal.</p>
          </div>
          <div className={`${styles.redCol} ${styles.redColReal}`}>
            <span className={styles.redColTitulo}>Red trófica (realista)</span>
            <div className={styles.redMalla}>
              <div className={styles.redFilaMalla}>
                <span>🌿 Planta</span>
                <span>🌾 Semillas</span>
                <span>🫐 Frutos</span>
              </div>
              <div className={styles.redFlechasMalla} aria-hidden="true">↙ ↓ ↘</div>
              <div className={styles.redFilaMalla}>
                <span>🐇 Conejo</span>
                <span>🐁 Ratón</span>
                <span>🦗 Insectos</span>
              </div>
              <div className={styles.redFlechasMalla} aria-hidden="true">↙ ↓ ↘</div>
              <div className={styles.redFilaMalla}>
                <span>🦊 Zorro</span>
                <span>🐍 Serpiente</span>
                <span>🐸 Rana</span>
              </div>
            </div>
            <p className={styles.redDesc}>Interconectada. Un animal come varias cosas y es comido por varios. Más estable.</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Las redes tróficas son más realistas que las cadenas lineales. Cuantas más conexiones tiene un ecosistema,
          <strong> más resiliente es</strong>: si desaparece una especie, otras pueden ocupar su lugar.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEcosistemaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('piramide');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'piramide': return <SeccionPiramide />;
      case 'regla10': return <SeccionRegla10 />;
      case 'ciclos': return <SeccionCiclos />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Ecosistemas</h1>
          <p className={styles.subtitle}>El flujo de energía que sostiene la vida: pirámide trófica, ciclos biogeoquímicos y datos fascinantes</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre ecología y ecosistemas"
          subtitle="Conceptos clave sobre el funcionamiento de la naturaleza"
          defaultOpen={false}
        >
          <h3>¿Qué es un ecosistema?</h3>
          <p>
            Un ecosistema es el conjunto formado por los seres vivos (biocenosis) y el medio físico
            donde habitan (biotopo), junto con todas las interacciones entre ellos. Incluye desde
            un charco hasta la selva amazónica. La energía fluye y la materia se recicla.
          </p>

          <h3>¿Qué diferencia hay entre cadena y red trófica?</h3>
          <p>
            Una cadena trófica es una secuencia lineal simplificada (planta → conejo → zorro).
            Una red trófica es el conjunto real de todas las relaciones alimentarias de un ecosistema,
            donde cada especie puede comer y ser comida por varias. Las redes son más estables porque
            la desaparición de una especie no rompe todo el sistema.
          </p>

          <h3>¿Por qué importa la biodiversidad?</h3>
          <p>
            Cuantas más especies hay en un ecosistema, más conexiones tiene la red trófica y más
            resistente es ante perturbaciones. La pérdida de biodiversidad debilita la capacidad
            del ecosistema para autorregularse, filtrar agua, polinizar cultivos y capturar carbono.
          </p>

          <h3>¿Qué es una cascada trófica?</h3>
          <p>
            Es un efecto dominó que se produce cuando la eliminación o reintroducción de un
            superdepredador altera toda la cadena. El caso más conocido: reintroducir lobos en
            Yellowstone (1995) redujo los ciervos, la vegetación se recuperó, las raíces estabilizaron
            las orillas y los ríos literalmente cambiaron de curso.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son aproximaciones con fines educativos,
            basados en fuentes de ecología general (Campbell Biology, IPCC, FAO, National Geographic).
            Los valores de biomasa y eficiencia varían según el ecosistema concreto. Última revisión: 2025.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ecosistema')} />
        <ShareCard appName="visualizador-ecosistema" />
        <Footer appName="visualizador-ecosistema" />
    </div>
  );
}
