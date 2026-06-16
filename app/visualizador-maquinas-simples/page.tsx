'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './MaquinasSimples.module.css';
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
// Tipos
// ─────────────────────────────────────────────

type Seccion = 'maquinas' | 'ventaja' | 'vida-real' | 'historia';

interface MaquinaSimple {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  ejemplo: string;
  principio: string;
  formula: string;
  ejemploNumerico: string;
}

interface EjemploVidaReal {
  id: string;
  icono: string;
  nombre: string;
  maquina: string;
  descripcion: string;
  detalle: string;
}

interface DatoHistorico {
  icono: string;
  texto: string;
  valor?: string;
}

// ─────────────────────────────────────────────
// Datos: las 6 máquinas simples
// ─────────────────────────────────────────────

const MAQUINAS: MaquinaSimple[] = [
  {
    id: 'palanca',
    icono: '⚖️',
    nombre: 'Palanca',
    descripcion: 'Barra rígida que gira sobre un punto de apoyo (fulcro).',
    ejemplo: 'Un balancín, unas tijeras, un abrebotellas.',
    principio: 'Multiplica la fuerza a cambio de mayor distancia de recorrido. El momento de fuerza (fuerza x distancia al fulcro) debe ser igual a ambos lados para el equilibrio.',
    formula: 'VM = distancia esfuerzo / distancia carga',
    ejemploNumerico: 'Si el fulcro está a 1 m de la carga y a 5 m del esfuerzo, VM = 5. Con 20 kg de fuerza levantas 100 kg.',
  },
  {
    id: 'polea',
    icono: '🔄',
    nombre: 'Polea',
    descripcion: 'Rueda acanalada por la que pasa una cuerda para cambiar la dirección de la fuerza.',
    ejemplo: 'Una grúa, el mecanismo de una persiana, un ascensor.',
    principio: 'Una polea fija solo cambia la dirección de la fuerza. Una polea compuesta (varias poleas) multiplica la fuerza dividiendo el peso entre el número de cuerdas de soporte.',
    formula: 'VM = número de cuerdas que sostienen la carga',
    ejemploNumerico: 'Con 4 poleas (4 cuerdas de soporte), VM = 4. Tiras con 25 kg para levantar 100 kg, pero necesitas tirar 4 veces más cuerda.',
  },
  {
    id: 'plano-inclinado',
    icono: '📐',
    nombre: 'Plano inclinado',
    descripcion: 'Superficie plana inclinada que reduce la fuerza necesaria para elevar un objeto.',
    ejemplo: 'Una rampa para silla de ruedas, una carretera de montaña.',
    principio: 'Distribuye el esfuerzo de elevar un peso a lo largo de una distancia mayor. Cuanto más largo el plano (menor ángulo), menos fuerza se necesita.',
    formula: 'VM = longitud del plano / altura',
    ejemploNumerico: 'Una rampa de 5 m de largo para subir 1 m de altura: VM = 5. Empujas con 20 kg para subir 100 kg.',
  },
  {
    id: 'rueda-eje',
    icono: '☸️',
    nombre: 'Rueda y eje',
    descripcion: 'Una rueda grande unida a un eje más pequeño que gira solidariamente.',
    ejemplo: 'El volante de un coche, un destornillador, una manivela de pozo.',
    principio: 'La fuerza aplicada en el borde de la rueda (radio grande) produce una fuerza mayor en el eje (radio pequeño). A mayor diferencia de radios, mayor ventaja.',
    formula: 'VM = radio de la rueda / radio del eje',
    ejemploNumerico: 'Un volante de 20 cm de radio con un eje de 2 cm: VM = 10. Giras con 10 kg y el eje aplica 100 kg de fuerza.',
  },
  {
    id: 'cuna',
    icono: '🔺',
    nombre: 'Cuña',
    descripcion: 'Pieza con forma de prisma triangular que convierte fuerza de empuje en fuerza de separación.',
    ejemplo: 'Un hacha, un cuchillo, una cremallera, un clavo.',
    principio: 'Transforma una fuerza aplicada en una dirección en dos fuerzas perpendiculares que separan el material. Cuanto más delgada la cuña, mayor ventaja mecánica.',
    formula: 'VM = longitud de la cuña / grosor máximo',
    ejemploNumerico: 'Un hacha con cuña de 20 cm de largo y 4 cm de grosor: VM = 5. Un golpe de 20 kg produce 100 kg de fuerza de separación.',
  },
  {
    id: 'tornillo',
    icono: '🔩',
    nombre: 'Tornillo',
    descripcion: 'Un plano inclinado enrollado en espiral alrededor de un cilindro.',
    ejemplo: 'Un sacacorchos, un gato de coche, un grifo, una tapa de rosca.',
    principio: 'Cada vuelta completa avanza una distancia pequeña (paso de rosca). La fuerza de giro se multiplica enormemente al convertirse en fuerza lineal.',
    formula: 'VM = circunferencia de giro / paso de rosca',
    ejemploNumerico: 'Un tornillo con circunferencia de 6 cm y paso de 0,2 cm: VM = 30. Con 3,3 kg de fuerza de giro produces 100 kg de presión.',
  },
];

// ─────────────────────────────────────────────
// Datos: ejemplos en la vida real
// ─────────────────────────────────────────────

const EJEMPLOS_VIDA_REAL: EjemploVidaReal[] = [
  {
    id: 'tijeras',
    icono: '✂️',
    nombre: 'Tijeras',
    maquina: 'Palanca (clase 1)',
    descripcion: 'Dos palancas unidas por un fulcro central.',
    detalle: 'Las tijeras son dos palancas de primera clase cruzadas. El tornillo central es el fulcro. Cuanto más cerca del fulcro coloques el papel, más fuerza de corte aplicas. Las tijeras de podar tienen mangos largos para maximizar la ventaja mecánica.',
  },
  {
    id: 'grua',
    icono: '🏗️',
    nombre: 'Grúa torre',
    maquina: 'Polea compuesta',
    descripcion: 'Sistema de poleas que permite levantar toneladas.',
    detalle: 'Una grúa torre usa un sistema de poleas compuestas con 6-12 cuerdas de soporte. Esto le permite levantar cargas de hasta 20 toneladas con un motor relativamente pequeño. El cable se enrolla en un tambor y pasa por múltiples poleas, multiplicando la fuerza.',
  },
  {
    id: 'rampa',
    icono: '♿',
    nombre: 'Rampa accesible',
    maquina: 'Plano inclinado',
    descripcion: 'Reduce la fuerza necesaria para subir una silla de ruedas.',
    detalle: 'La normativa española exige una pendiente máxima del 8% (4,6°) para rampas accesibles. Una rampa de 12,5 m para subir 1 m tiene VM = 12,5. Esto reduce el esfuerzo de empujar una silla de ruedas de 80 kg a solo 6,4 kg de fuerza horizontal.',
  },
  {
    id: 'volante',
    icono: '🚗',
    nombre: 'Volante del coche',
    maquina: 'Rueda y eje',
    descripcion: 'Gira las ruedas con poco esfuerzo gracias a la diferencia de radios.',
    detalle: 'El volante tiene un radio mucho mayor que la columna de dirección. Con la dirección asistida moderna, el esfuerzo es mínimo, pero incluso sin asistencia, el volante multiplica tu fuerza. Los volantes de Fórmula 1 son pequeños porque los pilotos necesitan rapidez, no potencia.',
  },
  {
    id: 'hacha',
    icono: '🪓',
    nombre: 'Hacha',
    maquina: 'Cuña',
    descripcion: 'Convierte un golpe vertical en fuerza de separación lateral.',
    detalle: 'El filo del hacha es una cuña que transforma la energía del golpe en dos fuerzas laterales que separan la madera. Un hacha de leñador tiene un ángulo de 25-30° para madera blanda. Un hacha de talar tiene un ángulo más agudo (15-20°) para cortar fibras.',
  },
  {
    id: 'sacacorchos',
    icono: '🍷',
    nombre: 'Sacacorchos',
    maquina: 'Tornillo + palanca',
    descripcion: 'Combina un tornillo (espiral) con una palanca para extraer el corcho.',
    detalle: 'El sacacorchos de camarero combina tres máquinas simples: el tornillo helicoidal penetra el corcho, la palanca con fulcro en el borde de la botella extrae el corcho, y la cuña del filo inicial perfora la superficie. Es un ejemplo perfecto de máquina compuesta.',
  },
  {
    id: 'bicicleta',
    icono: '🚲',
    nombre: 'Bicicleta',
    maquina: 'Máquina compuesta',
    descripcion: 'Combina palanca (pedales), rueda y eje, y engranajes.',
    detalle: 'Los pedales actúan como palancas. El plato y el piñón son ruedas y ejes de diferente tamaño. Las marchas cambian la relación entre plato y piñón: marcha baja (plato pequeño, piñón grande) = más ventaja mecánica para subir cuestas; marcha alta = más velocidad en llano.',
  },
  {
    id: 'escalera-mecanica',
    icono: '🛗',
    nombre: 'Escalera mecánica',
    maquina: 'Plano inclinado + poleas',
    descripcion: 'Un plano inclinado motorizado con cadena de peldaños.',
    detalle: 'Combina el principio del plano inclinado (subir gradualmente en lugar de verticalmente) con un sistema de cadenas y poleas que mueve los escalones. El motor no necesita levantar a las personas verticalmente, solo empujarlas a lo largo de la pendiente.',
  },
];

// ─────────────────────────────────────────────
// Datos: historia y datos curiosos
// ─────────────────────────────────────────────

const DATOS_HISTORICOS: DatoHistorico[] = [
  { icono: '🏛️', texto: 'Arquímedes estudió la palanca en', valor: '~250 a.C.' },
  { icono: '🔺', texto: 'Pirámides de Guiza construidas hace', valor: '~4.500 años' },
  { icono: '🎨', texto: 'Leonardo da Vinci diseñó máquinas en el', valor: 'siglo XV' },
  { icono: '⚡', texto: 'Conservación de energía: se descubrió que no hay magia', valor: '1843 (Joule)' },
  { icono: '📐', texto: 'Las pirámides usaron rampas de hasta', valor: '1,6 km de largo' },
  { icono: '🔩', texto: 'Arquímedes también inventó el', valor: 'tornillo sin fin' },
];

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────

const TABS: { id: Seccion; icono: string; nombre: string }[] = [
  { id: 'maquinas', icono: '⚙️', nombre: 'Las 6 máquinas' },
  { id: 'ventaja', icono: '📊', nombre: 'Ventaja mecánica' },
  { id: 'vida-real', icono: '🏗️', nombre: 'En la vida real' },
  { id: 'historia', icono: '📜', nombre: 'Historia y datos' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMaquinasSimples() {
  const [seccion, setSeccion] = useState<Seccion>('maquinas');

  // Tab 1: máquina expandida
  const [maquinaExpandida, setMaquinaExpandida] = useState<string | null>(null);

  // Tab 2: sliders palanca
  const [distEsfuerzo, setDistEsfuerzo] = useState(5);
  const [distCarga, setDistCarga] = useState(1);
  const pesoCarga = 100; // kg fijo

  // Tab 2: sliders plano inclinado
  const [longPlano, setLongPlano] = useState(5);
  const [alturaPlano, setAlturaPlano] = useState(1);
  const pesoPlano = 100; // kg fijo

  // Tab 3: ejemplo expandido
  const [ejemploExpandido, setEjemploExpandido] = useState<string | null>(null);

  // Cálculos palanca
  const vmPalanca = distEsfuerzo / distCarga;
  const fuerzaPalanca = pesoCarga / vmPalanca;

  // Cálculos plano inclinado
  const vmPlano = longPlano / alturaPlano;
  const fuerzaPlano = pesoPlano / vmPlano;
  const anguloPlano = Math.atan(alturaPlano / longPlano) * (180 / Math.PI);

  const toggleMaquina = useCallback((id: string) => {
    setMaquinaExpandida(prev => prev === id ? null : id);
  }, []);

  const toggleEjemplo = useCallback((id: string) => {
    setEjemploExpandido(prev => prev === id ? null : id);
  }, []);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <p className={styles.heroTag} aria-hidden="true">Física &middot; Mecánica</p>
          <h1 className={styles.title}><span aria-hidden="true">⚙️</span> Máquinas Simples</h1>
          <p className={styles.subtitle}>
            Cómo levantar 100 kg con solo 10 kg de fuerza: de Arquímedes a las grúas modernas
          </p>
        </header>

        <LegalNotice />

        {/* Navegación por tabs */}
        <div className={styles.tabNav} role="tablist" aria-label="Secciones de máquinas simples">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={seccion === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`${styles.tabBtn} ${seccion === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setSeccion(tab.id)}
            >
              <span className={styles.tabIcono} aria-hidden="true">{tab.icono}</span>
              <span className={styles.tabNombre}>{tab.nombre}</span>
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* TAB 1: Las 6 máquinas simples           */}
        {/* ═══════════════════════════════════════ */}
        {seccion === 'maquinas' && (
          <div className={styles.seccion} id="panel-maquinas" role="tabpanel">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">⚙️</span> Las 6 máquinas simples
            </h2>
            <p className={styles.seccionEnunciado}>
              Toda máquina compleja se compone de combinaciones de estas seis máquinas básicas.
              Cada una multiplica la fuerza a cambio de mayor distancia de recorrido.
            </p>

            <div className={styles.maquinasGrid}>
              {MAQUINAS.map(maq => (
                <div key={maq.id}>
                  <button
                    type="button"
                    className={`${styles.maquinaCard} ${maquinaExpandida === maq.id ? styles.maquinaCardActiva : ''}`}
                    onClick={() => toggleMaquina(maq.id)}
                    aria-expanded={maquinaExpandida === maq.id}
                  >
                    <span className={styles.maquinaIcono} aria-hidden="true">{maq.icono}</span>
                    <span className={styles.maquinaNombre}>{maq.nombre}</span>
                    <span className={styles.maquinaDesc}>{maq.descripcion}</span>
                    <span className={styles.maquinaEjemplo}>Ej: {maq.ejemplo}</span>
                  </button>

                  {maquinaExpandida === maq.id && (
                    <div className={styles.maquinaDetalle}>
                      <h4 className={styles.detalleSubtitulo}>Principio físico</h4>
                      <p>{maq.principio}</p>
                      <h4 className={styles.detalleSubtitulo}>Fórmula</h4>
                      <p className={styles.detalleFormula}>{maq.formula}</p>
                      <h4 className={styles.detalleSubtitulo}>Ejemplo numérico</h4>
                      <p>{maq.ejemploNumerico}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Dato:</strong> Arquímedes dijo &laquo;Dadme un punto de apoyo y moveré el
                mundo&raquo;. Con una palanca suficientemente larga, teóricamente es posible, pero
                necesitarías un brazo de palanca de unos 10²² metros — más que la distancia a la
                estrella más cercana.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 2: Ventaja mecánica                 */}
        {/* ═══════════════════════════════════════ */}
        {seccion === 'ventaja' && (
          <div className={styles.seccion} id="panel-ventaja" role="tabpanel">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">📊</span> Ventaja mecánica interactiva
            </h2>
            <p className={styles.seccionEnunciado}>
              La ventaja mecánica (VM) indica cuántas veces se multiplica la fuerza.
              VM = distancia del esfuerzo / distancia de la carga. Mueve los sliders
              para ver cómo cambia.
            </p>

            {/* ── Palanca ── */}
            <h3 className={styles.subSeccionTitulo}>
              <span aria-hidden="true">⚖️</span> Palanca
            </h3>

            <div className={styles.slidersPanel}>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>
                  <span>Distancia esfuerzo al fulcro</span>
                  <span className={styles.sliderValue}>{formatNumber(distEsfuerzo, 1)} m</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={distEsfuerzo}
                  onChange={e => setDistEsfuerzo(Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Distancia del esfuerzo al fulcro: ${distEsfuerzo} metros`}
                />
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>
                  <span>Distancia carga al fulcro</span>
                  <span className={styles.sliderValue}>{formatNumber(distCarga, 1)} m</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={distCarga}
                  onChange={e => setDistCarga(Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Distancia de la carga al fulcro: ${distCarga} metros`}
                />
              </div>
            </div>

            {/* Diagrama SVG de palanca */}
            <div className={styles.svgWrapper}>
              <svg viewBox="0 0 400 160" className={styles.svgDiagrama} aria-label="Diagrama de palanca mostrando fulcro, carga y esfuerzo">
                {/* Barra de palanca */}
                <line x1="40" y1="80" x2="360" y2="80" stroke="var(--text-primary)" strokeWidth="4" strokeLinecap="round" />
                {/* Fulcro (triángulo) */}
                {(() => {
                  const fulcroX = 40 + (distCarga / (distCarga + distEsfuerzo)) * 320;
                  return (
                    <>
                      <polygon
                        points={`${fulcroX - 12},120 ${fulcroX + 12},120 ${fulcroX},82`}
                        fill="var(--primary)"
                      />
                      <text x={fulcroX} y="138" textAnchor="middle" fontSize="11" fill="var(--text-secondary)" fontWeight="600">Fulcro</text>
                      {/* Carga (izquierda) */}
                      <rect x="30" y="50" width="30" height="30" rx="4" fill="var(--secondary)" />
                      <text x="45" y="70" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">{pesoCarga}</text>
                      <text x="45" y="45" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">Carga</text>
                      {/* Flecha esfuerzo (derecha) */}
                      <line x1="350" y1="78" x2="350" y2="40" stroke="var(--primary)" strokeWidth="3" markerEnd="url(#arrowUp)" />
                      <text x="350" y="30" textAnchor="middle" fontSize="10" fill="var(--primary)" fontWeight="700">{formatNumber(fuerzaPalanca, 1)} kg</text>
                      {/* Distancias */}
                      <line x1="45" y1="100" x2={fulcroX} y2="100" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3" />
                      <text x={(45 + fulcroX) / 2} y="113" textAnchor="middle" fontSize="9" fill="var(--text-muted)">{formatNumber(distCarga, 1)} m</text>
                      <line x1={fulcroX} y1="100" x2="350" y2="100" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3" />
                      <text x={(fulcroX + 350) / 2} y="113" textAnchor="middle" fontSize="9" fill="var(--text-muted)">{formatNumber(distEsfuerzo, 1)} m</text>
                    </>
                  );
                })()}
                <defs>
                  <marker id="arrowUp" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto">
                    <path d="M0,8 L4,0 L8,8" fill="var(--primary)" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className={styles.resultadoVm}>
              <div className={styles.formulaGrande}>
                VM = {formatNumber(distEsfuerzo, 1)} / {formatNumber(distCarga, 1)} = <strong>{formatNumber(vmPalanca, 1)}</strong>
              </div>
              <p className={styles.resultadoTexto}>
                Con el fulcro aquí, aplicas <strong>{formatNumber(fuerzaPalanca, 1)} kg</strong> de fuerza
                para levantar <strong>{pesoCarga} kg</strong> de carga.
              </p>
            </div>

            {/* ── Plano inclinado ── */}
            <h3 className={styles.subSeccionTitulo} style={{ marginTop: '2rem' }}>
              <span aria-hidden="true">📐</span> Plano inclinado
            </h3>

            <div className={styles.slidersPanel}>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>
                  <span>Longitud del plano</span>
                  <span className={styles.sliderValue}>{formatNumber(longPlano, 1)} m</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  step={0.5}
                  value={longPlano}
                  onChange={e => setLongPlano(Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Longitud del plano: ${longPlano} metros`}
                />
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>
                  <span>Altura</span>
                  <span className={styles.sliderValue}>{formatNumber(alturaPlano, 1)} m</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={alturaPlano}
                  onChange={e => setAlturaPlano(Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Altura del plano: ${alturaPlano} metros`}
                />
              </div>
            </div>

            {/* Diagrama SVG plano inclinado */}
            <div className={styles.svgWrapper}>
              <svg viewBox="0 0 400 180" className={styles.svgDiagrama} aria-label="Diagrama de plano inclinado mostrando longitud, altura y ángulo">
                {/* Suelo */}
                <line x1="40" y1="150" x2="360" y2="150" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4" />
                {/* Plano inclinado */}
                {(() => {
                  const maxH = 120;
                  const hPx = Math.min((alturaPlano / 5) * maxH, maxH);
                  const topY = 150 - hPx;
                  return (
                    <>
                      {/* Triángulo del plano */}
                      <polygon
                        points={`60,150 340,150 340,${topY}`}
                        fill="rgba(46,134,171,0.1)"
                        stroke="var(--primary)"
                        strokeWidth="2"
                      />
                      {/* Objeto sobre el plano */}
                      <circle cx="160" cy={150 - (hPx * 0.3) - 12} r="14" fill="var(--secondary)" />
                      <text x="160" y={150 - (hPx * 0.3) - 8} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">📦</text>
                      {/* Flecha de fuerza */}
                      <line x1="175" y1={150 - (hPx * 0.3) - 16} x2="220" y2={150 - (hPx * 0.55) - 16} stroke="var(--primary)" strokeWidth="2.5" markerEnd="url(#arrowPlano)" />
                      <text x="210" y={150 - (hPx * 0.45) - 22} textAnchor="middle" fontSize="10" fill="var(--primary)" fontWeight="700">{formatNumber(fuerzaPlano, 1)} kg</text>
                      {/* Etiquetas */}
                      <text x="200" y="168" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">Longitud: {formatNumber(longPlano, 1)} m</text>
                      <text x="355" y={(topY + 150) / 2} textAnchor="start" fontSize="10" fill="var(--text-secondary)">↕ {formatNumber(alturaPlano, 1)} m</text>
                      {/* Ángulo */}
                      <text x="80" y="142" fontSize="10" fill="var(--primary)" fontWeight="600">{formatNumber(anguloPlano, 1)}°</text>
                    </>
                  );
                })()}
                <defs>
                  <marker id="arrowPlano" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8" fill="var(--primary)" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className={styles.resultadoVm}>
              <div className={styles.formulaGrande}>
                VM = {formatNumber(longPlano, 1)} / {formatNumber(alturaPlano, 1)} = <strong>{formatNumber(vmPlano, 1)}</strong>
              </div>
              <p className={styles.resultadoTexto}>
                Con este ángulo ({formatNumber(anguloPlano, 1)}°), empujas con <strong>{formatNumber(fuerzaPlano, 1)} kg</strong> para
                subir <strong>{pesoPlano} kg</strong> por la rampa.
              </p>
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Clave:</strong> La ventaja mecánica nunca crea energía de la nada. Si
                multiplicas la fuerza por 10, necesitas recorrer 10 veces más distancia.
                Trabajo = Fuerza &times; Distancia, y el trabajo total es siempre el mismo.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 3: En la vida real                  */}
        {/* ═══════════════════════════════════════ */}
        {seccion === 'vida-real' && (
          <div className={styles.seccion} id="panel-vida-real" role="tabpanel">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🏗️</span> Máquinas simples en la vida real
            </h2>
            <p className={styles.seccionEnunciado}>
              Cada objeto que usas a diario contiene máquinas simples. Las máquinas complejas
              (como una bicicleta o una grúa) son combinaciones de las 6 básicas.
            </p>

            <div className={styles.ejemplosGrid}>
              {EJEMPLOS_VIDA_REAL.map(ej => (
                <div key={ej.id}>
                  <button
                    type="button"
                    className={`${styles.ejemploCard} ${ejemploExpandido === ej.id ? styles.ejemploCardActivo : ''}`}
                    onClick={() => toggleEjemplo(ej.id)}
                    aria-expanded={ejemploExpandido === ej.id}
                  >
                    <span className={styles.ejemploIcono} aria-hidden="true">{ej.icono}</span>
                    <span className={styles.ejemploNombre}>{ej.nombre}</span>
                    <span className={styles.ejemploMaquina}>{ej.maquina}</span>
                    <span className={styles.ejemploDesc}>{ej.descripcion}</span>
                  </button>

                  {ejemploExpandido === ej.id && (
                    <div className={styles.ejemploDetalle}>
                      {ej.detalle}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Dato:</strong> Una bicicleta combina al menos 3 máquinas simples: los
                pedales son palancas, las ruedas son rueda y eje, y los cambios de marcha
                modifican la ventaja mecánica mediante engranajes de diferente tamaño (rueda y eje).
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 4: Historia y datos                 */}
        {/* ═══════════════════════════════════════ */}
        {seccion === 'historia' && (
          <div className={styles.seccion} id="panel-historia" role="tabpanel">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">📜</span> Historia y datos curiosos
            </h2>

            {/* Cita de Arquímedes */}
            <div className={styles.citaBloque}>
              <p className={styles.citaTexto}>
                &laquo;Dadme un punto de apoyo y moveré el mundo.&raquo;
              </p>
              <p className={styles.citaAutor}>— Arquímedes de Siracusa (~287-212 a.C.)</p>
            </div>

            {/* Grid de datos */}
            <div className={styles.datosGrid}>
              {DATOS_HISTORICOS.map((d, i) => (
                <div key={i} className={styles.datoCard}>
                  <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
                  <span className={styles.datoTexto}>
                    {d.texto}
                    {d.valor && (
                      <>
                        {' '}<span className={styles.datoValor}>{d.valor}</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline histórico */}
            <h3 className={styles.timelineLabel}>Evolución de las máquinas</h3>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineAnio}>~3000 a.C.</span>
                <span className={styles.timelineNombre}>Mesopotami</span>
                <span className={styles.timelineDesc}>Rueda, cuña y plano inclinado en construcción</span>
              </div>
              <span className={styles.timelineFlecha} aria-hidden="true">&rarr;</span>
              <div className={styles.timelineItem}>
                <span className={styles.timelineAnio}>~250 a.C.</span>
                <span className={styles.timelineNombre}>Arquímedes</span>
                <span className={styles.timelineDesc}>Formaliza la palanca y la polea compuesta</span>
              </div>
              <span className={styles.timelineFlecha} aria-hidden="true">&rarr;</span>
              <div className={styles.timelineItem}>
                <span className={styles.timelineAnio}>~1500</span>
                <span className={styles.timelineNombre}>Leonardo</span>
                <span className={styles.timelineDesc}>Diseños de máquinas compuestas, polipastos y engranajes</span>
              </div>
              <span className={styles.timelineFlecha} aria-hidden="true">&rarr;</span>
              <div className={styles.timelineItem}>
                <span className={styles.timelineAnio}>1843</span>
                <span className={styles.timelineNombre}>Joule</span>
                <span className={styles.timelineDesc}>Conservación de energía: la VM no crea energía</span>
              </div>
            </div>

            {/* Las pirámides */}
            <h3 className={styles.timelineLabel}>Las pirámides de Egipto</h3>
            <div className={styles.piramideBloque}>
              <p>
                Los constructores de las pirámides de Guiza (~2560 a.C.) usaron <strong>planos inclinados</strong> (rampas
                de tierra y piedra) y <strong>palancas</strong> de madera para mover bloques de hasta 2,5 toneladas a
                más de 140 metros de altura. Se estima que emplearon rampas de hasta 1,6 km de longitud para
                mantener una pendiente suave. También usaron <strong>rodillos</strong> (una forma primitiva de rueda)
                para reducir la fricción del transporte horizontal.
              </p>
              <p>
                Sin conocer las fórmulas, los egipcios aplicaban la ventaja mecánica intuitivamente: rampas más
                largas y suaves requerían menos trabajadores empujando.
              </p>
            </div>

            {/* Conservación de energía */}
            <h3 className={styles.timelineLabel}>La ley fundamental</h3>
            <div className={styles.leyBloque}>
              <p>
                <strong>Conservación de la energía:</strong> ninguna máquina simple crea energía.
                Solo la redistribuye. Si una palanca multiplica la fuerza por 10, tú recorres
                10 veces más distancia. El trabajo total (Fuerza &times; Distancia) es siempre el mismo.
              </p>
              <p>
                Una polea de 4 cuerdas reduce la fuerza a 1/4, pero tiras 4 metros de cuerda
                para levantar la carga 1 metro. No hay &laquo;magia&raquo;: hay <em>redistribución
                inteligente</em> del esfuerzo.
              </p>
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Dato:</strong> Leonardo da Vinci llenó miles de páginas con diseños de máquinas
                que combinaban las 6 simples de formas ingeniosas. Muchas de sus ideas (como el
                rodamiento de bolas y el helicóptero) tardaron siglos en materializarse.
              </p>
            </div>
          </div>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="Profundiza en las máquinas simples"
          subtitle="Mecánica, historia y aplicaciones avanzadas"
          defaultOpen={false}
        >
          <h3>Las tres clases de palanca</h3>
          <p>
            Las palancas se clasifican según la posición relativa del fulcro, la carga y el esfuerzo.
            <strong> Clase 1</strong> (fulcro en medio): balancín, tijeras, alicates. Es la más versátil
            y puede multiplicar la fuerza o la velocidad.
            <strong> Clase 2</strong> (carga en medio): carretilla, cascanueces, abrebotellas. Siempre
            multiplica la fuerza (VM &gt; 1).
            <strong> Clase 3</strong> (esfuerzo en medio): pinzas, caña de pescar, brazo humano.
            Siempre multiplica la velocidad y el recorrido (VM &lt; 1), pero a cambio de usar más fuerza.
          </p>

          <h3>Eficiencia real vs. teórica</h3>
          <p>
            La ventaja mecánica teórica asume cero fricción. En la práctica, la fricción reduce la
            eficiencia. Un tornillo tiene una VM teórica enorme (30-100), pero la fricción entre las
            roscas &ldquo;consume&rdquo; gran parte de la ventaja. Paradójicamente, esa fricción es
            útil: es lo que impide que el tornillo se afloje solo. Una polea real pierde un 5-15% de
            eficiencia por fricción en cada rueda.
          </p>

          <h3>Máquinas compuestas modernas</h3>
          <p>
            Un coche contiene docenas de máquinas simples: el volante (rueda y eje), los engranajes
            de la caja de cambios (rueda y eje), los pedales (palancas), los tornillos, las cuñas de
            las válvulas del motor, y los pistones que actúan como planos inclinados rotativos mediante
            el cigüeñal. Un motor de combustión interna convierte movimiento lineal en rotativo usando
            una biela-manivela, que es esencialmente una palanca giratoria.
          </p>

          <h3>El principio del trabajo</h3>
          <p>
            El principio fundamental que rige todas las máquinas simples es:
            Trabajo de entrada = Trabajo de salida (en un sistema ideal sin fricción).
            Trabajo = Fuerza &times; Distancia. Por tanto, si reduces la fuerza necesaria,
            aumentas la distancia que debes recorrer. No hay atajo: la energía total se conserva
            siempre. Este principio, formalizado por James Joule en 1843, es la primera ley de la
            termodinámica aplicada a la mecánica.
          </p>

          <div className={styles.warningBox}>
            <strong>Importante:</strong> La ventaja mecánica no crea energía de la nada, solo la
            redistribuye (Ley de conservación de la energía). Los valores numéricos mostrados son
            teóricos y no incluyen pérdidas por fricción, deformación o resistencia del aire. En la
            práctica, la fuerza real necesaria siempre es algo mayor que la teórica.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-maquinas-simples')} />
        <ShareCard appName="visualizador-maquinas-simples" />
        <Footer appName="visualizador-maquinas-simples" />
    </div>
  );
}
