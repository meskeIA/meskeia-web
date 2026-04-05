'use client';

import { useState } from 'react';
import styles from './VisualizadorAguaVirtual.module.css';
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
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'desayuno' | 'armario' | 'plato' | 'huella';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'desayuno', titulo: 'Tu desayuno', icono: '\u2615', subtitulo: 'El agua invisible en tu primera comida del dia' },
  { id: 'armario', titulo: 'Tu armario', icono: '\uD83D\uDC55', subtitulo: 'Miles de litros colgados en perchas' },
  { id: 'plato', titulo: 'Tu plato', icono: '\uD83C\uDF7D\uFE0F', subtitulo: 'La huella hidrica de lo que comes' },
  { id: 'huella', titulo: 'La huella invisible', icono: '\uD83C\uDF0D', subtitulo: 'Estres hidrico global y que puedes hacer' },
];

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

interface ProductoAgua {
  nombre: string;
  icono: string;
  litros: number;
  detalle: string;
}

const DESAYUNO: ProductoAgua[] = [
  { nombre: 'Cafe (1 taza)', icono: '\u2615', litros: 140, detalle: 'Cultivar, procesar y transportar los granos de cafe requiere riego intensivo en paises tropicales.' },
  { nombre: 'Tostada (2 rebanadas)', icono: '\uD83C\uDF5E', litros: 40, detalle: 'El trigo necesita agua de lluvia y riego. Dos rebanadas equivalen a unos 40 litros.' },
  { nombre: 'Zumo de naranja (1 vaso)', icono: '\uD83C\uDF4A', litros: 170, detalle: 'Un vaso de 200 ml necesita unas 3 naranjas. Cada naranja consume unos 50 litros.' },
  { nombre: 'Huevo (1 unidad)', icono: '\uD83E\uDD5A', litros: 196, detalle: 'Alimentar a la gallina durante su vida productiva consume la mayor parte del agua.' },
];

const ARMARIO: ProductoAgua[] = [
  { nombre: 'Camiseta de algodon', icono: '\uD83D\uDC55', litros: 2700, detalle: 'El algodon es uno de los cultivos mas sedientos del planeta. Una camiseta = 2.700 litros.' },
  { nombre: 'Vaqueros (jeans)', icono: '\uD83D\uDC56', litros: 10000, detalle: 'Cultivar el algodon, tenir la tela y lavarla. Un solo par de vaqueros = 10.000 litros.' },
  { nombre: 'Zapatos de cuero', icono: '\uD83D\uDC5E', litros: 8000, detalle: 'Criar al animal, curtir la piel, fabricar el calzado. 8.000 litros por par.' },
];

interface AlimentoAgua {
  nombre: string;
  icono: string;
  litrosPorKg: number;
  color: string;
}

const ALIMENTOS: AlimentoAgua[] = [
  { nombre: 'Ternera', icono: '\uD83E\uDD69', litrosPorKg: 15400, color: '#c0392b' },
  { nombre: 'Cerdo', icono: '\uD83E\uDD53', litrosPorKg: 5988, color: '#e74c3c' },
  { nombre: 'Pollo', icono: '\uD83C\uDF57', litrosPorKg: 4300, color: '#e67e22' },
  { nombre: 'Arroz', icono: '\uD83C\uDF5A', litrosPorKg: 2500, color: '#f39c12' },
  { nombre: 'Pasta', icono: '\uD83C\uDF5D', litrosPorKg: 1849, color: '#d4ac0d' },
  { nombre: 'Patatas', icono: '\uD83E\uDD54', litrosPorKg: 287, color: '#27ae60' },
  { nombre: 'Tomates', icono: '\uD83C\uDF45', litrosPorKg: 214, color: '#2ecc71' },
];

interface PaisHuella {
  pais: string;
  bandera: string;
  litrosDia: number;
  descripcion: string;
}

const PAISES: PaisHuella[] = [
  { pais: 'Estados Unidos', bandera: '\uD83C\uDDFA\uD83C\uDDF8', litrosDia: 7800, descripcion: 'Alto consumo de carne, ropa rapida y productos importados.' },
  { pais: 'Europa (media)', bandera: '\uD83C\uDDEA\uD83C\uDDFA', litrosDia: 5000, descripcion: 'Dieta variada, industria textil importada, menor consumo de carne.' },
  { pais: 'India', bandera: '\uD83C\uDDEE\uD83C\uDDF3', litrosDia: 2900, descripcion: 'Dieta predominantemente vegetariana, menor consumo de bienes importados.' },
];

// ─────────────────────────────────────────────
// Seccion 1: Tu desayuno
// ─────────────────────────────────────────────

function SeccionDesayuno() {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const totalDesayuno = DESAYUNO.reduce((sum, p) => sum + p.litros, 0);
  const maxLitros = Math.max(...DESAYUNO.map(p => p.litros));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un desayuno tipico consume <strong>{formatNumber(totalDesayuno, 0)} litros de agua</strong> que nunca ves. No es el agua del grifo — es el agua que se uso para cultivar, procesar y transportar cada producto.</p>
      </div>

      <div className={styles.productosGrid}>
        {DESAYUNO.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.productoCard} ${seleccionado === i ? styles.productoActivo : ''}`}
            onClick={() => setSeleccionado(seleccionado === i ? null : i)}
            aria-pressed={seleccionado === i}
          >
            <span className={styles.productoIcono} aria-hidden="true">{p.icono}</span>
            <span className={styles.productoNombre}>{p.nombre}</span>
            <div className={styles.barraContainer}>
              <div
                className={styles.barraAgua}
                style={{ width: `${(p.litros / maxLitros) * 100}%` }}
              />
            </div>
            <span className={styles.productoLitros}>{formatNumber(p.litros, 0)} L</span>
          </button>
        ))}
      </div>

      {seleccionado !== null && (
        <div className={styles.detalleCard} role="alert" aria-live="polite">
          <span className={styles.detalleIcono} aria-hidden="true">{DESAYUNO[seleccionado].icono}</span>
          <div>
            <strong>{DESAYUNO[seleccionado].nombre}</strong>
            <p>{DESAYUNO[seleccionado].detalle}</p>
          </div>
        </div>
      )}

      <div className={styles.totalCard}>
        <span className={styles.totalIcono} aria-hidden="true">{'\uD83D\uDCA7'}</span>
        <div>
          <span className={styles.totalLabel}>Total de tu desayuno</span>
          <span className={styles.totalValor}>{formatNumber(totalDesayuno, 0)} litros</span>
        </div>
        <span className={styles.totalComparacion}>= {formatNumber(totalDesayuno / 150, 1)} baneras llenas</span>
      </div>

      <div className={styles.insight}>
        <p>
          Antes de salir de casa por la manana, ya has &quot;consumido&quot; <strong>{formatNumber(totalDesayuno, 0)} litros de agua</strong> sin abrir el grifo. Es el agua invisible que recorre la cadena de produccion global.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 2: Tu armario
// ─────────────────────────────────────────────

function SeccionArmario() {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const maxLitros = Math.max(...ARMARIO.map(p => p.litros));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu ropa esconde <strong>miles de litros de agua</strong>. La industria textil es la segunda mas contaminante del mundo despues del petroleo.</p>
      </div>

      <div className={styles.ropaLista}>
        {ARMARIO.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.ropaItem} ${seleccionado === i ? styles.ropaActivo : ''}`}
            onClick={() => setSeleccionado(seleccionado === i ? null : i)}
            aria-pressed={seleccionado === i}
          >
            <div className={styles.ropaInfo}>
              <span className={styles.ropaIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.ropaNombre}>{p.nombre}</span>
              <span className={styles.ropaLitros}>{formatNumber(p.litros, 0)} L</span>
            </div>
            <div className={styles.barraContainer}>
              <div
                className={styles.barraAgua}
                style={{ width: `${(p.litros / maxLitros) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {seleccionado !== null && (
        <div className={styles.detalleCard} role="alert" aria-live="polite">
          <span className={styles.detalleIcono} aria-hidden="true">{ARMARIO[seleccionado].icono}</span>
          <div>
            <strong>{ARMARIO[seleccionado].nombre}</strong>
            <p>{ARMARIO[seleccionado].detalle}</p>
          </div>
        </div>
      )}

      <div className={styles.comparacionCard}>
        <h4 className={styles.comparacionTitulo}>Para ponerlo en perspectiva</h4>
        <div className={styles.comparacionGrid}>
          <div className={styles.comparacionItem}>
            <span className={styles.comparacionIcono} aria-hidden="true">{'\uD83D\uDC55'}</span>
            <span className={styles.comparacionTexto}>1 camiseta</span>
            <span className={styles.comparacionValor}>{formatNumber(2700, 0)} L</span>
          </div>
          <div className={styles.comparacionVs} aria-hidden="true">=</div>
          <div className={styles.comparacionItem}>
            <span className={styles.comparacionIcono} aria-hidden="true">{'\uD83D\uDEB0'}</span>
            <span className={styles.comparacionTexto}>Beber agua 2,5 anos</span>
            <span className={styles.comparacionValor}>3 L/dia</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Un armario medio contiene entre <strong>50.000 y 100.000 litros de agua virtual</strong>. La moda rapida multiplica esta cifra: comprar una camiseta barata cada semana supone 140.000 litros al ano solo en ropa.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 3: Tu plato
// ─────────────────────────────────────────────

function SeccionPlato() {
  const [ordenAsc, setOrdenAsc] = useState(false);
  const maxLitros = Math.max(...ALIMENTOS.map(a => a.litrosPorKg));

  const alimentosOrdenados = [...ALIMENTOS].sort((a, b) =>
    ordenAsc ? a.litrosPorKg - b.litrosPorKg : b.litrosPorKg - a.litrosPorKg
  );

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>No todos los alimentos gastan la misma agua. La diferencia entre un kilo de ternera y un kilo de tomates es <strong>abismal</strong>.</p>
      </div>

      <div className={styles.ordenControl}>
        <button
          type="button"
          className={styles.ordenBtn}
          onClick={() => setOrdenAsc(!ordenAsc)}
          aria-label={`Ordenar de ${ordenAsc ? 'mayor a menor' : 'menor a mayor'}`}
        >
          {ordenAsc ? '\u2B06\uFE0F De menor a mayor' : '\u2B07\uFE0F De mayor a menor'}
        </button>
      </div>

      <div className={styles.alimentosLista}>
        {alimentosOrdenados.map((a, i) => (
          <div key={i} className={styles.alimentoItem}>
            <div className={styles.alimentoInfo}>
              <span className={styles.alimentoIcono} aria-hidden="true">{a.icono}</span>
              <span className={styles.alimentoNombre}>{a.nombre}</span>
              <span className={styles.alimentoLitros}>{formatNumber(a.litrosPorKg, 0)} L/kg</span>
            </div>
            <div className={styles.barraContainer}>
              <div
                className={styles.barraAlimento}
                style={{
                  width: `${(a.litrosPorKg / maxLitros) * 100}%`,
                  backgroundColor: a.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.comparacionCard}>
        <h4 className={styles.comparacionTitulo}>La cuenta es clara</h4>
        <div className={styles.comparacionGrid}>
          <div className={styles.comparacionItem}>
            <span className={styles.comparacionIcono} aria-hidden="true">{'\uD83E\uDD69'}</span>
            <span className={styles.comparacionTexto}>1 kg de ternera</span>
            <span className={styles.comparacionValor}>{formatNumber(15400, 0)} L</span>
          </div>
          <div className={styles.comparacionVs} aria-hidden="true">=</div>
          <div className={styles.comparacionItem}>
            <span className={styles.comparacionIcono} aria-hidden="true">{'\uD83C\uDF45'}</span>
            <span className={styles.comparacionTexto}>{formatNumber(Math.round(15400 / 214), 0)} kg de tomates</span>
            <span className={styles.comparacionValor}>{formatNumber(214, 0)} L/kg</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          No se trata de dejar de comer carne, sino de entender el coste real. <strong>Reducir el consumo de carne roja un dia a la semana</strong> ahorra unos {formatNumber(2200, 0)} litros de agua virtual por persona. Multiplicado por millones de personas, el impacto es enorme.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 4: La huella invisible
// ─────────────────────────────────────────────

function SeccionHuella() {
  const [paisIdx, setPaisIdx] = useState(1); // Europa por defecto
  const paisActual = PAISES[paisIdx];
  const maxLitros = Math.max(...PAISES.map(p => p.litrosDia));

  const consejos = [
    { icono: '\uD83E\uDD69', texto: 'Reduce carne roja 1-2 dias/semana', ahorro: '2.000-4.000 L/semana' },
    { icono: '\uD83D\uDC55', texto: 'Compra menos ropa y de mejor calidad', ahorro: '10.000+ L/prenda evitada' },
    { icono: '\uD83E\uDD54', texto: 'Prioriza alimentos locales y de temporada', ahorro: 'Menos transporte y riego' },
    { icono: '\u267B\uFE0F', texto: 'Reutiliza y repara antes de comprar nuevo', ahorro: 'Variable, siempre positivo' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El <strong>66% de la poblacion mundial</strong> vive en zonas con estres hidrico al menos un mes al ano. El agua que &quot;gastas&quot; comprando productos afecta a rios y acuiferos de otros paises.</p>
      </div>

      {/* Slider de pais */}
      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Si todos vivieran como en...</label>
          <span className={styles.sliderValor}>{paisActual.bandera} {paisActual.pais}</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={PAISES.length - 1}
          value={paisIdx}
          onChange={(e) => setPaisIdx(parseInt(e.target.value))}
          aria-label={`Estilo de vida: ${paisActual.pais}`}
        />
        <div className={styles.sliderExtremos}>
          <span>{PAISES[0].bandera} {PAISES[0].pais}</span>
          <span>{PAISES[PAISES.length - 1].bandera} {PAISES[PAISES.length - 1].pais}</span>
        </div>
      </div>

      {/* Barra comparativa por pais */}
      <div className={styles.paisesComparacion}>
        {PAISES.map((p, i) => (
          <div key={i} className={`${styles.paisItem} ${i === paisIdx ? styles.paisActivo : ''}`}>
            <div className={styles.paisInfo}>
              <span>{p.bandera}</span>
              <span className={styles.paisNombre}>{p.pais}</span>
              <span className={styles.paisLitros}>{formatNumber(p.litrosDia, 0)} L/dia</span>
            </div>
            <div className={styles.barraContainer}>
              <div
                className={styles.barraAgua}
                style={{ width: `${(p.litrosDia / maxLitros) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.paisDetalle} role="alert" aria-live="polite">
        <span className={styles.paisDetalleFlag}>{paisActual.bandera}</span>
        <div>
          <strong>{formatNumber(paisActual.litrosDia, 0)} litros/dia por persona</strong>
          <p>{paisActual.descripcion}</p>
          <p className={styles.paisAnual}>= <strong>{formatNumber(paisActual.litrosDia * 365, 0)} litros/ano</strong> = {formatNumber((paisActual.litrosDia * 365) / 1000, 0)} metros cubicos</p>
        </div>
      </div>

      {/* Consejos */}
      <h3 className={styles.seccionSubtituloH3}>Que puedes hacer tu</h3>
      <div className={styles.consejosGrid}>
        {consejos.map((c, i) => (
          <div key={i} className={styles.consejoCard}>
            <span className={styles.consejoIcono} aria-hidden="true">{c.icono}</span>
            <div>
              <span className={styles.consejoTexto}>{c.texto}</span>
              <span className={styles.consejoAhorro}>{c.ahorro}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El agua virtual es un concepto creado por el geografo <strong>John Anthony Allan</strong> (Premio Estocolmo del Agua, 2008). No se trata de culpa individual, sino de <strong>entender el sistema</strong>: los paises importadores de agua virtual (Europa, Oriente Medio) dependen del agua de paises exportadores (Sudamerica, Asia). Es una cadena global invisible.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAguaVirtualPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('desayuno');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'desayuno': return <SeccionDesayuno />;
      case 'armario': return <SeccionArmario />;
      case 'plato': return <SeccionPlato />;
      case 'huella': return <SeccionHuella />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cuanta Agua Gastas sin Saberlo</h1>
          <p className={styles.subtitle}>La huella hidrica invisible de tu vida cotidiana</p>
        </header>

        <LegalNotice />

        {/* Navegacion */}
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

        {/* Cabecera seccion */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">{'\uD83D\uDD17'}</span> Mas explicadores → <a href="/visualizador-dinero-y-tiempo/">El Dinero y el Tiempo</a> · <a href="/visualizador-sueldo-neto/">Tu Sueldo al Desnudo</a> · <a href="/visualizador-co2-diario/">Tu CO2 Diario</a>
        </div>

        <EducationalSection
          title="El agua que no se ve"
          subtitle="Conceptos clave sobre el agua virtual y la huella hidrica"
          defaultOpen={false}
        >
          <h3>Que es el agua virtual</h3>
          <p>
            El concepto de &quot;agua virtual&quot; fue acunado por el profesor John Anthony Allan en 1993.
            Se refiere al volumen total de agua dulce utilizada para producir un bien o servicio,
            considerando toda la cadena de produccion. Incluye agua azul (rios, acuiferos),
            agua verde (lluvia) y agua gris (necesaria para diluir contaminantes).
          </p>

          <h3>Por que importa</h3>
          <p>
            Mientras que el consumo directo de agua (ducha, grifo, WC) supone unos 130 litros/dia
            en Espana, la huella hidrica total por persona supera los 5.000 litros/dia cuando
            incluimos los productos que consumimos. El 92% del agua que &quot;usamos&quot; es invisible.
          </p>

          <h3>El comercio invisible de agua</h3>
          <p>
            Espana importa agua virtual a traves de productos como carne de Sudamerica, algodon
            de Asia o soja de Brasil. Al mismo tiempo, exporta agua virtual en frutas, hortalizas
            y aceite de oliva. Este comercio tiene implicaciones enormes para paises con estres
            hidrico que exportan sus recursos sin contabilizarlos.
          </p>

          <h3>Datos de referencia</h3>
          <p>
            Los datos de huella hidrica utilizados en este explicador provienen de la Water
            Footprint Network y estudios del profesor Arjen Hoekstra (Universidad de Twente).
            Son promedios globales — la cifra real varia segun el pais de origen, el metodo
            de cultivo y las condiciones climaticas.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador utiliza datos promedio globales con fines educativos.
            La huella hidrica real de cada producto varia segun el pais de produccion, el clima,
            el tipo de riego y la cadena logistica. Fuentes: Water Footprint Network, FAO, UNESCO-IHE.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-agua-virtual')} />
        <ShareCard appName="visualizador-agua-virtual" />
        <Footer appName="visualizador-agua-virtual" />
      </div>
    </>
  );
}
