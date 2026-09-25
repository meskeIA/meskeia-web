'use client';
// @disclaimer: exempt

import { useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './Ecosistema.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  flujoEnergia,
  formatEntero,
  formatPorcentaje,
  kgProductorPorKg,
  porcentajeDeLosProductores,
} from './motor';

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
  { id: 'ciclos', titulo: 'Ciclos biogeoquímicos', icono: '🔄', subtitulo: 'El carbono y el nitrógeno nunca se destruyen' },
  { id: 'piramide', titulo: 'Pirámide trófica', icono: '🔺', subtitulo: 'Los niveles de la vida: quién come a quién' },
  { id: 'regla10', titulo: 'Regla del 10 %', icono: '⚡', subtitulo: 'Por qué la energía disminuye tanto al subir de nivel' },
  { id: 'datos', titulo: 'Datos fascinantes', icono: '🌍', subtitulo: 'Naturaleza en números que sorprenden' },
];

// Colores de nivel. `color` es el tono de identidad (bordes y barras, sin texto encima);
// `colorTexto` es un token del módulo con variante clara y oscura, porque los tonos -600 de
// Tailwind como texto pequeño daban 2,6-3,9:1 (hallazgo 1738).
const TONOS = {
  productor: { color: '#16A34A', colorTexto: 'var(--eco-productor)' },
  primario: { color: '#CA8A04', colorTexto: 'var(--eco-primario)' },
  secundario: { color: '#EA580C', colorTexto: 'var(--eco-secundario)' },
  terciario: { color: '#DC2626', colorTexto: 'var(--eco-terciario)' },
};

// ─────────────────────────────────────────────
// Datos: Pirámide trófica
// ─────────────────────────────────────────────

interface NivelTrofico {
  nombre: string;
  icono: string;
  color: string;
  colorTexto: string;
  colorFondo: string;
  /** Ancho del escalón en escritorio y en móvil. Crecen de arriba abajo en los dos: con el
   *  10 % de antes el nivel superior medía 77 px y su texto se salía, y en móvil un
   *  `min-width: 80%` igualaba los tres de arriba (hallazgo 1737). */
  ancho: string;
  anchoMovil: string;
  /** Transferencias desde los productores: de aquí sale el % de energía (motor.ts). */
  transferencias: number;
  ejemplos: string[];
  biomasa: string;
  numEspecies: string;
  descripcion: string;
}

// Biomasa y especies: antes eran el ÷10 aplicado donde no aplica («~1.000 kg por hectárea»,
// «Miles» de especies de herbívoros; hallazgo 1736). Fuentes: Whittaker y Likens (1975),
// biomasa vegetal media por ecosistema; Kew, State of the World's Plants 2016 (~391.000
// plantas vasculares); casi la mitad del ~1 millón de insectos descritos son fitófagos;
// World Spider Catalog (más de 50.000 arañas descritas, todas depredadoras).
const NIVELES_TROFICOS: NivelTrofico[] = [
  {
    nombre: 'Consumidores terciarios',
    icono: '🦅',
    ...TONOS.terciario,
    colorFondo: 'rgba(220,38,38,0.1)',
    ancho: '40%',
    anchoMovil: '55%',
    transferencias: 3,
    ejemplos: ['Águilas', 'Lobos', 'Atún', 'Tiburones', 'Orcas'],
    biomasa: 'La más pequeña de la pirámide: pocos individuos grandes, repartidos en territorios amplios.',
    numEspecies: 'Pocas en comparación con los niveles de abajo (cientos, no cientos de miles).',
    descripcion: 'Depredadores de lo alto de la cadena: de adultos tienen pocos o ningún depredador natural. Regulan las poblaciones de los niveles inferiores.',
  },
  {
    nombre: 'Consumidores secundarios',
    icono: '🦊',
    ...TONOS.secundario,
    colorFondo: 'rgba(234,88,12,0.1)',
    ancho: '60%',
    anchoMovil: '70%',
    transferencias: 2,
    ejemplos: ['Zorros', 'Serpientes', 'Ranas', 'Búhos', 'Arañas'],
    biomasa: 'En casi todos los ecosistemas, menor que la de los herbívoros de los que se alimentan.',
    numEspecies: 'Decenas de miles como mínimo: solo las arañas, todas depredadoras, superan las 50.000 especies descritas.',
    descripcion: 'Carnívoros que se alimentan de herbívoros. Controlan las poblaciones de consumidores primarios.',
  },
  {
    nombre: 'Consumidores primarios',
    icono: '🐇',
    ...TONOS.primario,
    colorFondo: 'rgba(202,138,4,0.1)',
    ancho: '80%',
    anchoMovil: '85%',
    transferencias: 1,
    ejemplos: ['Conejos', 'Ciervos', 'Zooplancton', 'Saltamontes', 'Vacas'],
    biomasa: 'En tierra, muy inferior a la vegetal. En el mar puede superar a la del fitoplancton que comen: la pirámide de biomasa se invierte porque el fitoplancton se renueva en días.',
    numEspecies: 'Cientos de miles: casi la mitad del ~1 millón de insectos descritos come plantas, tantos como plantas vasculares hay.',
    descripcion: 'Herbívoros. Transforman la materia vegetal en tejido animal. Son la base de los carnívoros.',
  },
  {
    nombre: 'Productores',
    icono: '🌿',
    ...TONOS.productor,
    colorFondo: 'rgba(22,163,74,0.1)',
    ancho: '100%',
    anchoMovil: '100%',
    transferencias: 0,
    ejemplos: ['Plantas', 'Algas', 'Fitoplancton', 'Cianobacterias', 'Musgos'],
    biomasa: 'En tierra, la mayor de la pirámide: de unas 7 t por hectárea en matorral desértico a unas 450 t en selva tropical (Whittaker y Likens, 1975). En mar abierto, apenas unos kilos de fitoplancton por hectárea.',
    numEspecies: 'Unas 391.000 plantas vasculares conocidas (Kew, 2016), más algas y cianobacterias.',
    descripcion: 'Fotosíntesis: convierten la energía solar en materia orgánica. Son la base de toda la vida.',
  },
];

/** «≈ 0,1 % de la energía de los productores» · la base dice lo que captan del sol. */
function energiaDelNivel(nivel: NivelTrofico): string {
  if (nivel.transferencias === 0) return `${formatPorcentaje(100)} · captan en torno al ${formatPorcentaje(1)} de la luz solar`;
  return `≈ ${formatPorcentaje(porcentajeDeLosProductores(nivel.transferencias))} de la energía de los productores`;
}

// El atún está en el nivel superior de la pirámide (3 transferencias sobre el fitoplancton):
// con la media del 10 %, 10³ = 1.000 kg por kg (hallazgo 1735).
const NIVEL_ATUN = NIVELES_TROFICOS.find((n) => n.ejemplos.includes('Atún'));
const KG_FITO_POR_KG_ATUN = kgProductorPorKg(NIVEL_ATUN?.transferencias ?? 3);

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
// Datos: Regla del 10 %
// ─────────────────────────────────────────────

interface NivelEnergia {
  nivel: string;
  icono: string;
  color: string;
  colorTexto: string;
}

const NIVELES_FLUJO: NivelEnergia[] = [
  { nivel: 'Productores (plantas)', icono: '🌿', ...TONOS.productor },
  { nivel: 'Herbívoros (conejo)', icono: '🐇', ...TONOS.primario },
  { nivel: 'Carnívoros (zorro)', icono: '🦊', ...TONOS.secundario },
  { nivel: 'Superdepredador (águila)', icono: '🦅', ...TONOS.terciario },
];

const BASE_KCAL = 10000;
const FLUJO = flujoEnergia(BASE_KCAL, NIVELES_FLUJO.length);

interface DestinoPerdida {
  destino: string;
  porcentaje: number;
  icono: string;
  explicacion: string;
}

// Reparto ORIENTATIVO de la energía de un nivel: la vista lo presenta así, y el FAQPage ya no
// dice que «el 90 % restante se disipa como calor» (hallazgo 1734).
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
  /** Texto del centro del diagrama (token con variante oscura). */
  colorTexto: string;
  /** Fondo del botón activo, con texto blanco encima: ≥ 4,5:1 en los dos temas. */
  colorBoton: string;
  etapas: EtapaCiclo[];
  impactoHumano: string;
}

const CICLOS: CicloBio[] = [
  {
    id: 'carbono',
    nombre: 'Ciclo del Carbono',
    icono: '🌱',
    color: '#16A34A',
    colorTexto: 'var(--eco-productor)',
    colorBoton: '#166534',
    etapas: [
      { nombre: 'Fotosíntesis', icono: '☀️', descripcion: 'Las plantas absorben CO₂ y lo convierten en glucosa usando la luz solar.', detalle: '6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂' },
      { nombre: 'Respiración', icono: '🫁', descripcion: 'Todos los seres vivos queman glucosa y liberan CO₂ de vuelta a la atmósfera.', detalle: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energía' },
      { nombre: 'Descomposición', icono: '🍄', descripcion: 'Los descomponedores liberan CO₂ al descomponer materia orgánica muerta.', detalle: 'En tierra, en torno al 90 % de la producción vegetal no se la come ningún herbívoro: acaba como materia muerta que procesan hongos y bacterias (Gessner et al., 2010)' },
      { nombre: 'Combustibles fósiles', icono: '⛽', descripcion: 'El carbono almacenado durante millones de años se libera al quemar petróleo, carbón y gas.', detalle: 'La humanidad libera ~36.000 millones de toneladas de CO₂ al año' },
      { nombre: 'Océanos (sumidero)', icono: '🌊', descripcion: 'Los océanos absorben ~25 % del CO₂ emitido por los humanos, acidificándose.', detalle: 'El pH oceánico ha bajado 0,1 unidades desde la era preindustrial (un 30 % más ácido)' },
    ],
    impactoHumano: 'La quema de combustibles fósiles libera carbono que estuvo enterrado millones de años, acelerando el efecto invernadero y el cambio climático.',
  },
  {
    id: 'nitrogeno',
    nombre: 'Ciclo del Nitrógeno',
    icono: '🔵',
    color: '#2563EB',
    colorTexto: 'var(--eco-nitrogeno)',
    colorBoton: '#1D4ED8',
    etapas: [
      { nombre: 'Fijación', icono: '🦠', descripcion: 'Bacterias del suelo (Rhizobium) convierten el N₂ atmosférico en amoniaco (NH₃).', detalle: 'El 78 % del aire es N₂, pero los seres vivos no pueden usarlo directamente' },
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
  { icono: '🌿', titulo: 'Eficiencia solar', dato: 'Solo ~1 %', detalle: 'Los productores capturan en torno al 1 % (a menudo menos) de la energía solar que reciben. El resto se refleja o se convierte en calor.' },
  // Hallazgo 1741: el efecto sobre los ríos se afirmaba como hecho. Es una hipótesis debatida:
  // Marshall, Hobbs y Cooper (2013, Proc. R. Soc. B) y Hobbs et al. (2024, Ecological Monographs).
  { icono: '🐺', titulo: 'Lobos de Yellowstone', dato: '¿Cambiaron los ríos?', detalle: 'Tras reintroducir lobos en 1995 se describió una cascada trófica: menos uapitíes ramoneando, recuperación de sauces y álamos y, según la hipótesis que popularizó el vídeo «How Wolves Change Rivers», orillas más estables. Es un caso muy debatido: estudios de campo de 20 años (Marshall, Hobbs y Cooper, 2013; Hobbs et al., 2024) encuentran que los sauces apenas se recuperan donde los arroyos se encajaron tras desaparecer los castores, y que el efecto de los lobos es menor de lo que se contó.' },
  { icono: '🌊', titulo: 'Fitoplancton', dato: '50-80 % del O₂', detalle: 'Según la NOAA, entre el 50 % y el 80 % del oxígeno que se produce en la Tierra sale del océano, sobre todo del fitoplancton. Son organismos microscópicos, pero su impacto es planetario.' },
  { icono: '🍄', titulo: 'Sin descomponedores', dato: 'Tierra cubierta de muertos', detalle: 'Sin hongos y bacterias descomponedoras, la materia orgánica muerta se acumularía sin reciclarse. La Tierra estaría literalmente cubierta de cadáveres y hojarasca.' },
  // Antes: «15-20 % de la biomasa animal terrestre», una cifra antigua que el recuento de
  // Schultheiss et al. (2022, PNAS) deja muy por encima: ~12 Mt de carbono en total.
  { icono: '🐜', titulo: 'Hormigas', dato: '~20.000 billones', detalle: 'Se estima que hay unos 20.000 billones de hormigas (Schultheiss et al., 2022), con unos 12 millones de toneladas de carbono: más que todas las aves y los mamíferos salvajes juntos.' },
  { icono: '🌡️', titulo: 'Efecto invernadero natural', dato: '+33 °C', detalle: 'Sin el efecto invernadero natural (sin intervención humana), la temperatura media de la Tierra sería -18 °C en vez de 15 °C. El problema es el exceso de gases añadido por la actividad humana.' },
  // Hallazgo 1740: decía «miles de millones de veces». USGS: ~1.386 millones de km³ de agua y
  // ~577.000 km³ evaporados al año (502.800 del océano + 74.200 de tierra) → ~2.400 años por
  // vuelta; en ~4.000 millones de años, del orden de 1,5 millones de vueltas.
  { icono: '🔄', titulo: 'Tu agua es antigua', dato: 'Miles de millones de años', detalle: 'La Tierra tiene unos 1.386 millones de km³ de agua y cada año se evaporan unos 577.000: de media, una molécula tarda unos 2.400 años en dar la vuelta al ciclo hidrológico. Desde que hay océanos, eso da del orden de un millón y medio de vueltas. Las mismas moléculas estuvieron en glaciares, nubes y dinosaurios.' },
  // Hallazgo 1735: decía «10.000 kg», que exige cuatro transferencias (un quinto nivel).
  { icono: '🐟', titulo: 'El atún y el fitoplancton', dato: 'Miles de kg → 1 kg', detalle: `Con la media del 10 % por nivel, 1 kg de atún exige del orden de ${formatEntero(kgProductorPorKg(3))} a ${formatEntero(Math.round(kgProductorPorKg(3.4) / 100) * 100)} kg de fitoplancton: el atún rabil se alimenta en torno al nivel trófico 4,4 (FishBase), unas 3,4 transferencias por encima del fitoplancton (10 elevado a 3 = ${formatEntero(kgProductorPorKg(3))}; 10 elevado a 3,4 ≈ ${formatEntero(Math.round(kgProductorPorKg(3.4) / 100) * 100)}). Como la eficiencia real varía mucho, es un orden de magnitud, no una cifra exacta.` },
];

// ─────────────────────────────────────────────
// Sección 1: Pirámide Trófica
// ─────────────────────────────────────────────

function SeccionPiramide() {
  const [nivelActivo, setNivelActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La <strong>pirámide trófica</strong> muestra cómo se organiza la vida: los productores en la base sostienen a todos los demás niveles.
          Lo que siempre disminuye al subir es la <strong>energía</strong>. La biomasa y el número de individuos suelen disminuir, pero pueden
          invertirse: en el mar, el zooplancton puede pesar más que el fitoplancton que come, y un solo árbol alimenta a miles de insectos.
        </p>
      </div>

      {/* Pirámide visual */}
      <div className={styles.piramide}>
        {NIVELES_TROFICOS.map((nivel, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.piramideNivel} ${nivelActivo === i ? styles.piramideNivelActivo : ''}`}
            style={{
              '--ancho': nivel.ancho,
              '--ancho-movil': nivel.anchoMovil,
              background: nivelActivo === i ? nivel.colorFondo : undefined,
              borderColor: nivelActivo === i ? nivel.color : undefined,
            } as CSSProperties}
            onClick={() => setNivelActivo(nivelActivo === i ? null : i)}
            aria-expanded={nivelActivo === i}
            aria-label={`${nivel.nombre}: ${nivel.ejemplos.join(', ')}`}
          >
            <span className={styles.piramideIcono} aria-hidden="true">{nivel.icono}</span>
            <span className={styles.piramideNombre}>{nivel.nombre}</span>
            <span className={styles.piramideEnergia} style={{ color: nivel.colorTexto }}>{energiaDelNivel(nivel)}</span>
          </button>
        ))}
        {/* Flechas de energía */}
        <div className={styles.piramideFlechas} aria-hidden="true">
          <span className={styles.piramideFlechaTexto}>Energía ↑</span>
          <span className={styles.piramideFlechaSub}>Se pierde ~90&nbsp;% en cada nivel</span>
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
          Con la media del 10&nbsp;% por nivel, <strong>1 kg de atún</strong>, en lo alto de la pirámide, exige del orden de{' '}
          <strong>{formatEntero(KG_FITO_POR_KG_ATUN)} kg de fitoplancton</strong>: tres transferencias ({formatEntero(KG_FITO_POR_KG_ATUN)} → {formatEntero(kgProductorPorKg(2))} → {formatEntero(kgProductorPorKg(1))} → 1).
          Es un orden de magnitud, no una cifra exacta: la eficiencia real cambia mucho de un ecosistema a otro.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Regla del 10 %
// ─────────────────────────────────────────────

function SeccionRegla10() {
  const [destinoActivo, setDestinoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        {/* Hallazgo 1734: se enunciaba como ley exacta. Mismo arreglo que en
            simulador-ecosistema-trofico (hallazgo 1610). */}
        <p>
          La llamada <strong>regla del 10&nbsp;%</strong>, que se suele atribuir a Raymond Lindeman (1942), resume una media:
          de la energía de un nivel trófico, en promedio solo <strong>en torno al 10&nbsp;%</strong> llega a formar parte del siguiente.
          No es una ley exacta: Lindeman citó eficiencias desde el 0,1&nbsp;% hasta el 37,5&nbsp;%. Las cifras de abajo aplican esa media
          al pie de la letra para ver el orden de magnitud.
        </p>
      </div>

      {/* Barras decrecientes de energía */}
      <div className={styles.flujoEnergia}>
        <div className={styles.flujoSol}>
          <span aria-hidden="true">☀️</span>
          <span>Energía solar</span>
        </div>
        {NIVELES_FLUJO.map((nivel, i) => (
          <div key={i} className={styles.flujoNivel}>
            <div className={styles.flujoInfo}>
              <span aria-hidden="true">{nivel.icono}</span>
              <span className={styles.flujoNombre}>{nivel.nivel}</span>
              <span className={styles.flujoKcal} style={{ color: nivel.colorTexto }}>{formatEntero(FLUJO[i].kcal)} kcal</span>
            </div>
            <div className={styles.flujoTrack}>
              <div
                className={styles.flujoRelleno}
                style={{
                  width: `${(FLUJO[i].kcal / BASE_KCAL) * 100}%`,
                  background: nivel.color,
                }}
              />
            </div>
            {FLUJO[i].perdida > 0 && (
              <div className={styles.flujoPerdida}>
                <span className={styles.flujoFlechaPerdida} aria-hidden="true">↘</span>
                <span className={styles.flujoPerdidaTexto}>
                  {formatEntero(FLUJO[i].perdida)} kcal que no pasan: calor de la respiración, desechos y partes no consumidas
                </span>
              </div>
            )}
            {i < NIVELES_FLUJO.length - 1 && (
              <div className={styles.flujoConector} aria-hidden="true">
                <span>▼ de media, en torno al 10&nbsp;% pasa</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ¿Adónde va el resto? */}
      <div className={styles.destinoCard}>
        <h3 className={styles.destinoTitulo}>¿Adónde va la energía que no pasa?</h3>
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
              <span className={styles.destinoPct}>{formatPorcentaje(d.porcentaje)}</span>
              <span className={styles.destinoNombre}>{d.destino}</span>
              {destinoActivo === i && (
                <span className={styles.destinoExplicacion}>{d.explicacion}</span>
              )}
            </button>
          ))}
        </div>
        <p className={styles.destinoNota}>
          Reparto orientativo. Varía mucho entre organismos: en los animales de sangre caliente la respiración se lleva
          bastante más, y en muchos invertebrados, menos.
        </p>
      </div>

      {/* Implicación en la dieta: la regla aplicada al pie de la letra, sin hectáreas inventadas */}
      <div className={styles.implicacionCard}>
        <h3 className={styles.implicacionTitulo}>Implicación: un eslabón más en la dieta</h3>
        <div className={styles.implicacionGrid}>
          <div className={styles.implicacionCol}>
            <span className={styles.implicacionColTitulo}><span aria-hidden="true">🥬</span> Alimentos vegetales</span>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Transferencias</span>
              <span className={styles.implicacionValor}>1 (plantas → humano)</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Energía vegetal que llega</span>
              <span className={`${styles.implicacionValor} ${styles.valorProductor}`}>≈&nbsp;{formatPorcentaje(porcentajeDeLosProductores(1))}</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Plantas por cada 100 kcal que comes</span>
              <span className={styles.implicacionValor}>≈&nbsp;{formatEntero(100 * kgProductorPorKg(1))} kcal</span>
            </div>
          </div>
          <div className={styles.implicacionCol}>
            <span className={styles.implicacionColTitulo}><span aria-hidden="true">🥩</span> Alimentos animales</span>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Transferencias</span>
              <span className={styles.implicacionValor}>2 (plantas → animal → humano)</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Energía vegetal que llega</span>
              <span className={`${styles.implicacionValor} ${styles.valorTerciario}`}>≈&nbsp;{formatPorcentaje(porcentajeDeLosProductores(2))}</span>
            </div>
            <div className={styles.implicacionDato}>
              <span className={styles.implicacionLabel}>Plantas por cada 100 kcal que comes</span>
              <span className={styles.implicacionValor}>≈&nbsp;{formatEntero(100 * kgProductorPorKg(2))} kcal (10 veces más)</span>
            </div>
          </div>
        </div>
        <p className={styles.implicacionNota}>
          Es la media del 10&nbsp;% aplicada al pie de la letra, para ver el orden de magnitud. La conversión real depende
          mucho del animal y de cómo se cría, y los rumiantes aprovechan pastos que las personas no pueden comer: la superficie
          de cultivo necesaria no sale de multiplicar por 10.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          Como en cada paso se pierde <strong>de media en torno al 90&nbsp;%</strong>, la energía disponible cae muy deprisa al subir.
          Por eso hay mucha más energía en los productores que en los superdepredadores, y las cadenas tróficas rara vez pasan de cuatro o cinco eslabones.
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

  const ciclo = CICLOS.find(c => c.id === cicloActivo) ?? CICLOS[0];

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
            style={cicloActivo === c.id ? { borderColor: c.colorBoton, background: c.colorBoton } : {}}
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
          <div className={styles.cicloCentro} style={{ color: ciclo.colorTexto }}>
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

/** Organismo de la cadena o la red: el emoji no llega al lector (hallazgo 1742). */
function Organismo({ icono, nombre }: { icono: string; nombre: string }) {
  return (
    <span>
      <span aria-hidden="true">{icono}</span> {nombre}
    </span>
  );
}

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
              <Organismo icono="🌿" nombre="Planta" />
              <span aria-hidden="true">→</span>
              <Organismo icono="🐇" nombre="Conejo" />
              <span aria-hidden="true">→</span>
              <Organismo icono="🦊" nombre="Zorro" />
              <span aria-hidden="true">→</span>
              <Organismo icono="🦅" nombre="Águila" />
            </div>
            <p className={styles.redDesc}>Lineal, un solo camino. Útil para entender el concepto, pero irreal.</p>
          </div>
          <div className={`${styles.redCol} ${styles.redColReal}`}>
            <span className={styles.redColTitulo}>Red trófica (realista)</span>
            <div className={styles.redMalla}>
              <div className={styles.redFilaMalla}>
                <Organismo icono="🌿" nombre="Planta" />
                <Organismo icono="🌾" nombre="Semillas" />
                <Organismo icono="🫐" nombre="Frutos" />
              </div>
              <div className={styles.redFlechasMalla} aria-hidden="true">↙ ↓ ↘</div>
              <div className={styles.redFilaMalla}>
                <Organismo icono="🐇" nombre="Conejo" />
                <Organismo icono="🐁" nombre="Ratón" />
                <Organismo icono="🦗" nombre="Insectos" />
              </div>
              <div className={styles.redFlechasMalla} aria-hidden="true">↙ ↓ ↘</div>
              <div className={styles.redFilaMalla}>
                <Organismo icono="🦊" nombre="Zorro" />
                <Organismo icono="🐍" nombre="Serpiente" />
                <Organismo icono="🐸" nombre="Rana" />
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
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('ciclos');

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
          <h1 className={styles.title}>Ciclos del Carbono y del Nitrógeno</h1>
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
          {/* Hallazgo 1741: afirmaba como hecho que «los ríos literalmente cambiaron de curso». */}
          <p>
            Es un efecto dominó que se produce cuando la eliminación o reintroducción de un
            depredador altera los niveles de debajo. El ejemplo más citado es la reintroducción de
            lobos en Yellowstone (1995): se describió que redujo la presión de los uapitíes sobre sauces
            y álamos, y se llegó a proponer que estabilizó las orillas de los ríos. Es una hipótesis
            debatida: estudios de campo como los de Marshall, Hobbs y Cooper (2013) y Hobbs et al. (2024)
            encuentran un efecto mucho menor, limitado por el agua disponible y por la desaparición de
            los castores, y otros depredadores (pumas, osos) y la caza humana también cuentan. Casos
            menos discutidos son el de las nutrias marinas, los erizos y los bosques de kelp en el Pacífico.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son aproximaciones con fines educativos.
            La regla del 10&nbsp;% es una media con mucha dispersión (Lindeman, 1942); biomasa vegetal por
            ecosistema: Whittaker y Likens (1975); especies de plantas: Kew (2016); agua: USGS; hormigas:
            Schultheiss et al. (2022); nivel trófico del atún: FishBase. Los valores reales varían según
            el ecosistema concreto. Última revisión: 25/09/2026.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ecosistema')} />
        <ShareCard appName="visualizador-ecosistema" />
        <Footer appName="visualizador-ecosistema" />
    </div>
  );
}
