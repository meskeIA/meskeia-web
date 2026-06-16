'use client';
// @disclaimer: exempt
import { useState, useCallback } from 'react';
import styles from './EnzimasCuerpoHumano.module.css';
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

type Seccion = 'que-son' | 'enzimas' | 'factores' | 'cofactores';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'que-son', titulo: '¿Qué son?', icono: '🔬', subtitulo: 'Catalizadores biológicos' },
  { id: 'enzimas', titulo: 'Enzimas del cuerpo', icono: '🧬', subtitulo: 'Digestivas, metabólicas, hepáticas' },
  { id: 'factores', titulo: 'Factores', icono: '🌡️', subtitulo: 'pH, temperatura, inhibidores' },
  { id: 'cofactores', titulo: 'Cofactores y datos', icono: '💊', subtitulo: 'Vitaminas, minerales y curiosidades' },
];

// ─────────────────────────────────────────────
// Datos: las 6 clases de enzimas
// ─────────────────────────────────────────────

interface ClaseEnzima {
  nombre: string;
  reaccion: string;
  ejemplo: string;
  icono: string;
}

const CLASES_ENZIMAS: ClaseEnzima[] = [
  { nombre: 'Oxidorreductasas', reaccion: 'Transferencia de electrones (redox)', ejemplo: 'Alcohol deshidrogenasa', icono: '⚡' },
  { nombre: 'Transferasas', reaccion: 'Transfieren grupos funcionales', ejemplo: 'Hexoquinasa (grupo fosfato)', icono: '🔄' },
  { nombre: 'Hidrolasas', reaccion: 'Rompen enlaces con agua', ejemplo: 'Lipasa, amilasa, pepsina', icono: '💧' },
  { nombre: 'Liasas', reaccion: 'Rompen enlaces sin agua ni redox', ejemplo: 'Piruvato descarboxilasa', icono: '✂️' },
  { nombre: 'Isomerasas', reaccion: 'Reorganizan la estructura', ejemplo: 'Triosa fosfato isomerasa', icono: '🔀' },
  { nombre: 'Ligasas', reaccion: 'Unen moléculas usando ATP', ejemplo: 'ADN ligasa', icono: '🔗' },
];

// ─────────────────────────────────────────────
// Datos: enzimas del cuerpo
// ─────────────────────────────────────────────

interface EnzimaInfo {
  nombre: string;
  icono: string;
  categoria: 'digestiva' | 'metabolica' | 'hepatica';
  dondeActua: string;
  sustrato: string;
  producto: string;
  phOptimo: string;
  datoCurioso: string;
}

const ENZIMAS: EnzimaInfo[] = [
  // Digestivas
  { nombre: 'Amilasa salival', icono: '👅', categoria: 'digestiva', dondeActua: 'Boca (glándulas salivales)', sustrato: 'Almidón', producto: 'Maltosa', phOptimo: '6,8 – 7,0', datoCurioso: 'Por eso el pan masticado mucho tiempo sabe dulce: la amilasa convierte almidón en azúcar.' },
  { nombre: 'Amilasa pancreática', icono: '🫗', categoria: 'digestiva', dondeActua: 'Intestino delgado (secretada por páncreas)', sustrato: 'Almidón y glucógeno', producto: 'Maltosa y dextrinas', phOptimo: '7,0 – 7,5', datoCurioso: 'Continúa el trabajo que empezó la amilasa salival. Es mucho más potente y digiere el 90% del almidón total.' },
  { nombre: 'Pepsina', icono: '🫁', categoria: 'digestiva', dondeActua: 'Estómago', sustrato: 'Proteínas', producto: 'Péptidos cortos', phOptimo: '1,5 – 2,5', datoCurioso: 'Se secreta como pepsinógeno inactivo. El ácido clorhídrico la activa para que no digiera el propio estómago.' },
  { nombre: 'Tripsina', icono: '🔪', categoria: 'digestiva', dondeActua: 'Intestino delgado', sustrato: 'Proteínas', producto: 'Aminoácidos', phOptimo: '7,5 – 8,5', datoCurioso: 'Viene del páncreas como tripsinógeno. Trabaja en equipo con la quimotripsina.' },
  { nombre: 'Lipasa pancreática', icono: '🧈', categoria: 'digestiva', dondeActua: 'Intestino delgado', sustrato: 'Triglicéridos (grasas)', producto: 'Ácidos grasos + glicerol', phOptimo: '7,0 – 8,0', datoCurioso: 'La bilis emulsiona las grasas para que la lipasa pueda actuar: sin bilis, las grasas no se digieren.' },
  { nombre: 'Lactasa', icono: '🥛', categoria: 'digestiva', dondeActua: 'Intestino delgado (microvellosidades)', sustrato: 'Lactosa', producto: 'Glucosa + galactosa', phOptimo: '6,0 – 7,0', datoCurioso: 'El 65% de la población adulta mundial tiene déficit de lactasa → intolerancia a la lactosa.' },
  // Metabólicas
  { nombre: 'ATP sintasa', icono: '🔋', categoria: 'metabolica', dondeActua: 'Mitocondria (membrana interna)', sustrato: 'ADP + fosfato', producto: 'ATP (energía)', phOptimo: '~7,4', datoCurioso: 'Funciona como un motor rotatorio a escala nanométrica. Produce el 95% del ATP del cuerpo.' },
  { nombre: 'Hexoquinasa', icono: '🍬', categoria: 'metabolica', dondeActua: 'Citoplasma de todas las células', sustrato: 'Glucosa', producto: 'Glucosa-6-fosfato', phOptimo: '~7,4', datoCurioso: 'Es el primer paso de la glucólisis: "atrapa" la glucosa dentro de la célula fosforilándola.' },
  { nombre: 'Catalasa', icono: '💨', categoria: 'metabolica', dondeActua: 'Peroxisomas (hígado, riñones)', sustrato: 'Peróxido de hidrógeno (H₂O₂)', producto: 'Agua + oxígeno', phOptimo: '~7,0', datoCurioso: 'La enzima más rápida conocida: descompone 40 millones de moléculas de H₂O₂ por segundo.' },
  { nombre: 'ADN polimerasa', icono: '🧬', categoria: 'metabolica', dondeActua: 'Núcleo celular', sustrato: 'Nucleótidos', producto: 'Cadena de ADN copiada', phOptimo: '~7,5', datoCurioso: 'Copia 1.000 nucleótidos/segundo con tasa de error de solo 1 por cada 10⁹ bases (autocorrección).' },
  { nombre: 'ARN polimerasa', icono: '📜', categoria: 'metabolica', dondeActua: 'Núcleo celular', sustrato: 'ADN (molde)', producto: 'ARN mensajero', phOptimo: '~7,8', datoCurioso: 'Lee el ADN y lo "transcribe" a ARN: es el primer paso para fabricar una proteína.' },
  // Hepáticas
  { nombre: 'Citocromo P450', icono: '🏭', categoria: 'hepatica', dondeActua: 'Hígado (retículo endoplásmico)', sustrato: 'Fármacos, toxinas, hormonas', producto: 'Metabolitos solubles en agua', phOptimo: '~7,4', datoCurioso: 'No es una sola enzima: es una familia de 57 enzimas. Metaboliza el 75% de los fármacos que tomas.' },
  { nombre: 'Alcohol deshidrogenasa', icono: '🍺', categoria: 'hepatica', dondeActua: 'Hígado', sustrato: 'Etanol (alcohol)', producto: 'Acetaldehído → ácido acético', phOptimo: '~7,0', datoCurioso: 'Las mujeres tienen menos cantidad → el alcohol les afecta más. En asiáticos, una variante causa "rubor".' },
  { nombre: 'Transaminasas (ALT/AST)', icono: '🩸', categoria: 'hepatica', dondeActua: 'Hígado', sustrato: 'Aminoácidos', producto: 'Aminoácidos + cetoácidos', phOptimo: '~7,4', datoCurioso: 'Cuando el hígado se daña, se liberan a la sangre: por eso las miden en los análisis como marcador hepático.' },
];

const CATEGORIAS_ENZIMAS: { id: EnzimaInfo['categoria']; titulo: string; icono: string }[] = [
  { id: 'digestiva', titulo: 'Digestivas', icono: '🍽️' },
  { id: 'metabolica', titulo: 'Metabólicas', icono: '⚡' },
  { id: 'hepatica', titulo: 'Hepáticas', icono: '🫀' },
];

// ─────────────────────────────────────────────
// Datos: cofactores y coenzimas
// ─────────────────────────────────────────────

interface Cofactor {
  nombre: string;
  tipo: 'ion' | 'coenzima';
  origen: string;
  funcion: string;
  enzimasRelacionadas: string;
  icono: string;
}

const COFACTORES: Cofactor[] = [
  { nombre: 'Zinc (Zn²⁺)', tipo: 'ion', origen: 'Carne, mariscos, legumbres', funcion: 'Estabiliza estructura enzimática', enzimasRelacionadas: 'ADN polimerasa, alcohol deshidrogenasa', icono: '⚙️' },
  { nombre: 'Hierro (Fe²⁺/Fe³⁺)', tipo: 'ion', origen: 'Carne roja, espinacas, legumbres', funcion: 'Transporte de electrones', enzimasRelacionadas: 'Catalasa, citocromo P450', icono: '🔩' },
  { nombre: 'Magnesio (Mg²⁺)', tipo: 'ion', origen: 'Frutos secos, chocolate negro', funcion: 'Cofactor de 300+ enzimas', enzimasRelacionadas: 'Hexoquinasa, ADN polimerasa', icono: '🧲' },
  { nombre: 'NAD⁺ (de vitamina B3)', tipo: 'coenzima', origen: 'Pollo, atún, cacahuetes', funcion: 'Transporta electrones (redox)', enzimasRelacionadas: 'Alcohol deshidrogenasa, ciclo de Krebs', icono: '🔋' },
  { nombre: 'FAD (de vitamina B2)', tipo: 'coenzima', origen: 'Huevos, almendras, leche', funcion: 'Transporta electrones (cadena respiratoria)', enzimasRelacionadas: 'Succinato deshidrogenasa', icono: '⚡' },
  { nombre: 'Coenzima A (de vitamina B5)', tipo: 'coenzima', origen: 'Huevos, aguacate, brócoli', funcion: 'Transporta grupos acilo', enzimasRelacionadas: 'Piruvato deshidrogenasa, β-oxidación', icono: '🔗' },
];

interface DatoEnzimatico {
  titulo: string;
  dato: string;
  icono: string;
}

const DATOS_FASCINANTES: DatoEnzimatico[] = [
  { titulo: 'Total de enzimas', dato: 'El cuerpo humano tiene unas 75.000 enzimas diferentes, cada una especializada.', icono: '🔢' },
  { titulo: 'La más rápida', dato: 'La catalasa descompone 40 millones de moléculas de H₂O₂ tóxico por segundo.', icono: '⚡' },
  { titulo: 'Telomerasa y envejecimiento', dato: 'La telomerasa decide cuántas veces se puede dividir una célula. Su pérdida → envejecimiento.', icono: '⏳' },
  { titulo: 'Intolerancia a lactosa', dato: 'El 65% de la población adulta mundial pierde lactasa → no puede digerir la lactosa de la leche.', icono: '🥛' },
  { titulo: 'Fenilcetonuria (PKU)', dato: 'Déficit de fenilalanina hidroxilasa. Sin dieta especial desde bebé, causa daño cerebral irreversible.', icono: '🧪' },
  { titulo: 'Enfermedad de Gaucher', dato: 'Déficit de glucocerebrosidasa: los lípidos se acumulan en bazo e hígado. Tratable con enzimas recombinantes.', icono: '🏥' },
  { titulo: 'Enfermedad de Fabry', dato: 'Déficit de alfa-galactosidasa A. Los lípidos se acumulan en vasos sanguíneos, riñones y corazón.', icono: '❤️' },
];

// ─────────────────────────────────────────────
// Utilidades de cálculo para gráficos
// ─────────────────────────────────────────────

/** Campana de actividad enzimática vs temperatura */
function actividadTemperatura(temp: number, optimo: number): number {
  if (temp > optimo + 8) {
    // Desnaturalización: cae rápidamente
    const dist = temp - (optimo + 8);
    return Math.max(0, 100 * Math.exp(-0.3 * dist) * Math.exp(-((8) ** 2) / (2 * 64)));
  }
  const sigma = 8;
  return 100 * Math.exp(-((temp - optimo) ** 2) / (2 * sigma * sigma));
}

/** Campana de actividad enzimática vs pH */
function actividadPH(pH: number, optimo: number, sigma: number): number {
  return 100 * Math.exp(-((pH - optimo) ** 2) / (2 * sigma * sigma));
}

/** Cinética Michaelis-Menten simplificada */
function michaelisMenten(s: number, vmax: number, km: number): number {
  return (vmax * s) / (km + s);
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function EnzimasCuerpoHumanoPage() {
  const [seccion, setSeccion] = useState<Seccion>('que-son');
  const [enzimaExpandida, setEnzimaExpandida] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<EnzimaInfo['categoria'] | 'todas'>('todas');
  const [temperatura, setTemperatura] = useState(37);
  const [sustrato, setSustrato] = useState(50);
  const [cofactorExpandido, setCofactorExpandido] = useState<string | null>(null);

  const toggleEnzima = useCallback((nombre: string) => {
    setEnzimaExpandida(prev => prev === nombre ? null : nombre);
  }, []);

  const toggleCofactor = useCallback((nombre: string) => {
    setCofactorExpandido(prev => prev === nombre ? null : nombre);
  }, []);

  const enzimasFiltradas = categoriaFiltro === 'todas'
    ? ENZIMAS
    : ENZIMAS.filter(e => e.categoria === categoriaFiltro);

  // ─── Puntos para gráficos ───
  const puntosTemperatura = Array.from({ length: 51 }, (_, i) => {
    const t = i;
    return { x: t, y: actividadTemperatura(t, 37) };
  });

  const puntosPH_pepsina = Array.from({ length: 141 }, (_, i) => {
    const pH = i / 10;
    return { x: pH, y: actividadPH(pH, 2, 0.8) };
  });
  const puntosPH_amilasa = Array.from({ length: 141 }, (_, i) => {
    const pH = i / 10;
    return { x: pH, y: actividadPH(pH, 7, 1.2) };
  });
  const puntosPH_tripsina = Array.from({ length: 141 }, (_, i) => {
    const pH = i / 10;
    return { x: pH, y: actividadPH(pH, 8, 1.0) };
  });

  const vmaxVal = michaelisMenten(sustrato, 100, 25);

  // ─── Renderizado de secciones ───

  function renderQueSon() {
    return (
      <div className={styles.seccionContent}>
        <div className={styles.contexto}>
          Las enzimas son <strong>catalizadores biológicos</strong>: aceleran reacciones químicas hasta millones de veces sin consumirse en el proceso. Sin ellas, las reacciones tomarían años en vez de milisegundos.
        </div>

        {/* SVG modelo llave-cerradura */}
        <h3 className={styles.subSeccionTitulo}>🔑 Modelo llave-cerradura</h3>
        <div className={styles.svgZona}>
          <svg viewBox="0 0 600 180" className={styles.svgDiagrama} role="img" aria-label="Diagrama del modelo llave-cerradura: el sustrato encaja en el sitio activo de la enzima como una llave en su cerradura">
            {/* Enzima (cerradura) */}
            <ellipse cx="100" cy="100" rx="65" ry="50" fill="#2E86AB" opacity="0.85" />
            <path d="M85 75 L85 95 L115 95 L115 75" fill="#FAFAFA" stroke="#1A1A1A" strokeWidth="2" />
            <text x="100" y="140" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="600">Enzima</text>
            <text x="100" y="68" textAnchor="middle" fontSize="10" fill="#FAFAFA">Sitio activo</text>

            {/* Flecha */}
            <text x="185" y="105" textAnchor="middle" fontSize="20" fill="currentColor">→</text>

            {/* Sustrato (llave) */}
            <rect x="210" y="70" width="30" height="25" rx="3" fill="#48A9A6" />
            <text x="225" y="115" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="600">Sustrato</text>

            {/* Flecha */}
            <text x="275" y="105" textAnchor="middle" fontSize="20" fill="currentColor">→</text>

            {/* Complejo enzima-sustrato */}
            <ellipse cx="370" cy="100" rx="65" ry="50" fill="#2E86AB" opacity="0.85" />
            <rect x="355" y="75" width="30" height="20" rx="3" fill="#48A9A6" />
            <text x="370" y="140" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="600">Complejo E-S</text>

            {/* Flecha */}
            <text x="455" y="105" textAnchor="middle" fontSize="20" fill="currentColor">→</text>

            {/* Productos */}
            <ellipse cx="540" cy="100" rx="50" ry="40" fill="#2E86AB" opacity="0.85" />
            <rect x="510" y="55" width="15" height="12" rx="2" fill="#e67e22" />
            <rect x="535" y="55" width="15" height="12" rx="2" fill="#27ae60" />
            <text x="540" y="140" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="600">Productos</text>
            <text x="540" y="155" textAnchor="middle" fontSize="10" fill="currentColor">(enzima se recicla)</text>
          </svg>
        </div>

        <div className={styles.modeloExplicacion}>
          <div className={styles.modeloCard}>
            <span className={styles.modeloIcono} aria-hidden="true">🔐</span>
            <h4>Llave-cerradura</h4>
            <p>El sustrato tiene una forma exacta que encaja en el sitio activo de la enzima, como una llave en su cerradura. Propuesto por Emil Fischer (1894).</p>
          </div>
          <div className={styles.modeloCard}>
            <span className={styles.modeloIcono} aria-hidden="true">🤝</span>
            <h4>Ajuste inducido</h4>
            <p>La enzima es flexible: se adapta ligeramente al sustrato para lograr un encaje perfecto. Modelo más realista propuesto por Daniel Koshland (1958).</p>
          </div>
        </div>

        {/* Nomenclatura */}
        <h3 className={styles.subSeccionTitulo}>📛 Nomenclatura enzimática</h3>
        <div className={styles.contexto}>
          Las enzimas se nombran con el sufijo <strong>-asa</strong> añadido al sustrato o reacción: lip<strong>asa</strong> (descompone lípidos), amil<strong>asa</strong> (descompone almidón), prote<strong>asa</strong> (descompone proteínas).
        </div>

        {/* Las 6 clases */}
        <h3 className={styles.subSeccionTitulo}>📊 Las 6 clases principales</h3>
        <div className={styles.clasesGrid}>
          {CLASES_ENZIMAS.map(c => (
            <div key={c.nombre} className={styles.claseCard}>
              <div className={styles.claseHeader}>
                <span aria-hidden="true">{c.icono}</span>
                <strong>{c.nombre}</strong>
              </div>
              <p className={styles.claseReaccion}>{c.reaccion}</p>
              <p className={styles.claseEjemplo}>Ej: {c.ejemplo}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderEnzimas() {
    return (
      <div className={styles.seccionContent}>
        <div className={styles.contexto}>
          Cada enzima actúa en un lugar específico, con un sustrato concreto y un pH óptimo. Pulsa para ver los detalles de cada una.
        </div>

        {/* Filtro de categorías */}
        <div className={styles.filtrosEnzimas}>
          <button
            type="button"
            className={`${styles.filtroBtn} ${categoriaFiltro === 'todas' ? styles.filtroActivo : ''}`}
            onClick={() => setCategoriaFiltro('todas')}
            aria-pressed={categoriaFiltro === 'todas'}
          >
            Todas ({ENZIMAS.length})
          </button>
          {CATEGORIAS_ENZIMAS.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.filtroBtn} ${categoriaFiltro === cat.id ? styles.filtroActivo : ''}`}
              onClick={() => setCategoriaFiltro(cat.id)}
              aria-pressed={categoriaFiltro === cat.id}
            >
              <span aria-hidden="true">{cat.icono}</span> {cat.titulo} ({ENZIMAS.filter(e => e.categoria === cat.id).length})
            </button>
          ))}
        </div>

        {/* Grid de enzimas */}
        <div className={styles.enzimasGrid}>
          {enzimasFiltradas.map(enzima => {
            const expandida = enzimaExpandida === enzima.nombre;
            return (
              <button
                key={enzima.nombre}
                type="button"
                className={`${styles.enzimaCard} ${expandida ? styles.enzimaActiva : ''}`}
                onClick={() => toggleEnzima(enzima.nombre)}
                aria-expanded={expandida}
              >
                <div className={styles.enzimaHeaderRow}>
                  <span className={styles.enzimaIcono} aria-hidden="true">{enzima.icono}</span>
                  <span className={styles.enzimaNombre}>{enzima.nombre}</span>
                  <span className={styles.enzimaCategoriaBadge}>
                    {CATEGORIAS_ENZIMAS.find(c => c.id === enzima.categoria)?.titulo}
                  </span>
                </div>
                {expandida && (
                  <div className={styles.enzimaDetalle}>
                    <div className={styles.enzimaFila}>
                      <span className={styles.enzimaLabel}><span aria-hidden="true">📍</span> Dónde actúa:</span>
                      <span>{enzima.dondeActua}</span>
                    </div>
                    <div className={styles.enzimaFila}>
                      <span className={styles.enzimaLabel}><span aria-hidden="true">🔹</span> Sustrato:</span>
                      <span>{enzima.sustrato}</span>
                    </div>
                    <div className={styles.enzimaFila}>
                      <span className={styles.enzimaLabel}><span aria-hidden="true">🔸</span> Producto:</span>
                      <span>{enzima.producto}</span>
                    </div>
                    <div className={styles.enzimaFila}>
                      <span className={styles.enzimaLabel}><span aria-hidden="true">⚗️</span> pH óptimo:</span>
                      <span>{enzima.phOptimo}</span>
                    </div>
                    <div className={styles.enzimaDatoCurioso}>
                      <span aria-hidden="true">💡</span> {enzima.datoCurioso}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderFactores() {
    return (
      <div className={styles.seccionContent}>
        {/* Temperatura */}
        <h3 className={styles.subSeccionTitulo}>🌡️ Efecto de la temperatura</h3>
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label htmlFor="temp-slider">Temperatura: <strong>{temperatura}°C</strong></label>
            {temperatura > 42 && <span className={styles.warningBox} role="alert">⚠️ ¡Desnaturalización! La enzima pierde su forma</span>}
            {temperatura < 20 && <span className={styles.infoTag}>❄️ Reacciones muy lentas</span>}
            {temperatura >= 35 && temperatura <= 39 && <span className={styles.optimoTag}>✅ Rango óptimo humano</span>}
          </div>
          <input
            id="temp-slider"
            type="range"
            min={0}
            max={50}
            value={temperatura}
            onChange={e => setTemperatura(Number(e.target.value))}
            className={styles.sliderTemp}
          />
          <div className={styles.sliderLabels}>
            <span>0°C</span><span>10°C</span><span>20°C</span><span>37°C</span><span>42°C</span><span>50°C</span>
          </div>

          {/* Mini gráfico de campana */}
          <div className={styles.graficoZona}>
            <svg viewBox="0 0 510 140" className={styles.graficoSvg} role="img" aria-label={`Gráfico de actividad enzimática vs temperatura. Actividad actual: ${formatNumber(actividadTemperatura(temperatura, 37), 0)}%`}>
              {/* Ejes */}
              <line x1="40" y1="10" x2="40" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <line x1="40" y1="120" x2="500" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <text x="5" y="20" fontSize="8" fill="currentColor">100%</text>
              <text x="5" y="70" fontSize="8" fill="currentColor">50%</text>
              <text x="5" y="120" fontSize="8" fill="currentColor">0%</text>
              <text x="250" y="138" fontSize="8" fill="currentColor" textAnchor="middle">Temperatura (°C)</text>

              {/* Curva */}
              <polyline
                fill="none"
                stroke="#2E86AB"
                strokeWidth="2"
                points={puntosTemperatura.map(p => `${40 + p.x * 9},${120 - p.y * 1.1}`).join(' ')}
              />

              {/* Marcador actual */}
              <circle
                cx={40 + temperatura * 9}
                cy={120 - actividadTemperatura(temperatura, 37) * 1.1}
                r="5"
                fill="#e74c3c"
              />
              <text
                x={40 + temperatura * 9}
                y={120 - actividadTemperatura(temperatura, 37) * 1.1 - 10}
                textAnchor="middle"
                fontSize="9"
                fill="#e74c3c"
                fontWeight="700"
              >
                {formatNumber(actividadTemperatura(temperatura, 37), 0)}%
              </text>

              {/* Zona de desnaturalización */}
              <rect x={40 + 42 * 9} y="10" width={8 * 9} height="110" fill="#e74c3c" opacity="0.08" />
              <text x={40 + 46 * 9} y="25" fontSize="7" fill="#e74c3c" textAnchor="middle">Desnaturalización</text>
            </svg>
          </div>

          <div className={styles.contexto}>
            <strong>¿Por qué la fiebre de 40°C es peligrosa?</strong> A esa temperatura, las enzimas empiezan a desnaturalizarse: pierden su forma tridimensional y dejan de funcionar. El cuerpo usa la fiebre como defensa (mata patógenos), pero por encima de 42°C las propias enzimas se destruyen.
          </div>
        </div>

        {/* pH */}
        <h3 className={styles.subSeccionTitulo}>⚗️ Efecto del pH</h3>
        <div className={styles.graficoZona}>
          <svg viewBox="0 0 510 160" className={styles.graficoSvg} role="img" aria-label="Gráfico de actividad enzimática vs pH para pepsina (pH 2), amilasa (pH 7) y tripsina (pH 8)">
            {/* Ejes */}
            <line x1="40" y1="10" x2="40" y2="130" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1="40" y1="130" x2="500" y2="130" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <text x="5" y="20" fontSize="8" fill="currentColor">100%</text>
            <text x="5" y="130" fontSize="8" fill="currentColor">0%</text>
            <text x="250" y="150" fontSize="8" fill="currentColor" textAnchor="middle">pH</text>
            {/* Ticks pH */}
            {[0, 2, 4, 6, 7, 8, 10, 12, 14].map(ph => (
              <text key={ph} x={40 + (ph / 14) * 460} y="143" fontSize="7" fill="currentColor" textAnchor="middle">{ph}</text>
            ))}

            {/* Curva pepsina */}
            <polyline
              fill="none"
              stroke="#e74c3c"
              strokeWidth="2"
              points={puntosPH_pepsina.map(p => `${40 + (p.x / 14) * 460},${130 - p.y * 1.2}`).join(' ')}
            />
            <text x={40 + (2 / 14) * 460} y="15" fontSize="8" fill="#e74c3c" textAnchor="middle" fontWeight="600">Pepsina (pH 2)</text>

            {/* Curva amilasa */}
            <polyline
              fill="none"
              stroke="#27ae60"
              strokeWidth="2"
              points={puntosPH_amilasa.map(p => `${40 + (p.x / 14) * 460},${130 - p.y * 1.2}`).join(' ')}
            />
            <text x={40 + (7 / 14) * 460} y="15" fontSize="8" fill="#27ae60" textAnchor="middle" fontWeight="600">Amilasa (pH 7)</text>

            {/* Curva tripsina */}
            <polyline
              fill="none"
              stroke="#2E86AB"
              strokeWidth="2"
              points={puntosPH_tripsina.map(p => `${40 + (p.x / 14) * 460},${130 - p.y * 1.2}`).join(' ')}
            />
            <text x={40 + (8 / 14) * 460} y="25" fontSize="8" fill="#2E86AB" textAnchor="middle" fontWeight="600">Tripsina (pH 8)</text>
          </svg>
        </div>
        <div className={styles.contexto}>
          Cada enzima tiene un pH óptimo diferente según dónde actúa. La <strong>pepsina</strong> necesita el ambiente ácido del estómago (pH 2), la <strong>amilasa</strong> trabaja en la boca (pH 7 neutro) y la <strong>tripsina</strong> prefiere el intestino delgado (pH 8 básico).
        </div>

        {/* Concentración de sustrato */}
        <h3 className={styles.subSeccionTitulo}>📈 Concentración de sustrato (Michaelis-Menten)</h3>
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label htmlFor="sustrato-slider">Concentración de sustrato: <strong>{sustrato}%</strong></label>
            <span className={styles.infoTag}>Velocidad: {formatNumber(vmaxVal, 1)}% de Vmax</span>
          </div>
          <input
            id="sustrato-slider"
            type="range"
            min={0}
            max={200}
            value={sustrato}
            onChange={e => setSustrato(Number(e.target.value))}
            className={styles.sliderSustrato}
          />

          <div className={styles.graficoZona}>
            <svg viewBox="0 0 510 140" className={styles.graficoSvg} role="img" aria-label={`Cinética de Michaelis-Menten. Velocidad actual: ${formatNumber(vmaxVal, 1)}% de Vmax`}>
              <line x1="40" y1="10" x2="40" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <line x1="40" y1="120" x2="500" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <text x="5" y="20" fontSize="8" fill="currentColor">Vmax</text>
              <text x="250" y="138" fontSize="8" fill="currentColor" textAnchor="middle">[Sustrato]</text>

              {/* Línea Vmax */}
              <line x1="40" y1="20" x2="500" y2="20" stroke="#e74c3c" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
              <text x="505" y="23" fontSize="7" fill="#e74c3c">Vmax</text>

              {/* Línea Km */}
              <line x1={40 + (25 / 200) * 460} y1="120" x2={40 + (25 / 200) * 460} y2="70" stroke="#999" strokeWidth="1" strokeDasharray="3" opacity="0.4" />
              <text x={40 + (25 / 200) * 460} y="134" fontSize="7" fill="currentColor" textAnchor="middle">Km</text>

              {/* Curva */}
              <polyline
                fill="none"
                stroke="#48A9A6"
                strokeWidth="2.5"
                points={Array.from({ length: 201 }, (_, i) => {
                  const v = michaelisMenten(i, 100, 25);
                  return `${40 + (i / 200) * 460},${120 - v}`;
                }).join(' ')}
              />

              {/* Marcador actual */}
              <circle
                cx={40 + (sustrato / 200) * 460}
                cy={120 - vmaxVal}
                r="5"
                fill="#e74c3c"
              />
            </svg>
          </div>

          <div className={styles.contexto}>
            A medida que aumenta la concentración de sustrato, la velocidad sube... pero llega un punto de <strong>saturación</strong> (Vmax): todas las enzimas están ocupadas. La <strong>Km</strong> es la concentración de sustrato que da la mitad de Vmax — mide la afinidad enzima-sustrato.
          </div>
        </div>

        {/* Inhibidores */}
        <h3 className={styles.subSeccionTitulo}>🚫 Inhibidores enzimáticos</h3>
        <div className={styles.modeloExplicacion}>
          <div className={styles.modeloCard}>
            <span className={styles.modeloIcono} aria-hidden="true">🎯</span>
            <h4>Competitivo</h4>
            <p>El inhibidor se mete en el sitio activo (compite con el sustrato). Se supera con más sustrato.</p>
            <p className={styles.claseEjemplo}>Ej: Aspirina inhibe COX → bloquea la producción de prostaglandinas (dolor/inflamación).</p>
          </div>
          <div className={styles.modeloCard}>
            <span className={styles.modeloIcono} aria-hidden="true">🔄</span>
            <h4>No competitivo</h4>
            <p>El inhibidor se une a otro sitio y cambia la forma de la enzima. No se supera con más sustrato.</p>
            <p className={styles.claseEjemplo}>Ej: Antibióticos inhiben enzimas bacterianas sin afectar las humanas (diana selectiva).</p>
          </div>
        </div>
      </div>
    );
  }

  function renderCofactores() {
    return (
      <div className={styles.seccionContent}>
        <div className={styles.contexto}>
          Muchas enzimas necesitan un &quot;ayudante&quot; para funcionar: los <strong>cofactores</strong> (iones metálicos) y las <strong>coenzimas</strong> (derivadas de vitaminas). Sin ellos, la enzima no puede catalizar. Por eso las vitaminas y minerales son esenciales.
        </div>

        {/* Grid de cofactores */}
        <div className={styles.cofactoresGrid}>
          {COFACTORES.map(cf => {
            const expandido = cofactorExpandido === cf.nombre;
            return (
              <button
                key={cf.nombre}
                type="button"
                className={`${styles.cofactorCard} ${expandido ? styles.cofactorActivo : ''} ${cf.tipo === 'ion' ? styles.cofactorIon : styles.cofactorCoenzima}`}
                onClick={() => toggleCofactor(cf.nombre)}
                aria-expanded={expandido}
              >
                <div className={styles.cofactorHeaderRow}>
                  <span aria-hidden="true">{cf.icono}</span>
                  <span className={styles.cofactorNombre}>{cf.nombre}</span>
                  <span className={styles.cofactorTipoBadge}>{cf.tipo === 'ion' ? 'Ion metálico' : 'Coenzima'}</span>
                </div>
                {expandido && (
                  <div className={styles.cofactorDetalle}>
                    <div className={styles.enzimaFila}>
                      <span className={styles.enzimaLabel}><span aria-hidden="true">🍽️</span> Fuente:</span>
                      <span>{cf.origen}</span>
                    </div>
                    <div className={styles.enzimaFila}>
                      <span className={styles.enzimaLabel}><span aria-hidden="true">⚙️</span> Función:</span>
                      <span>{cf.funcion}</span>
                    </div>
                    <div className={styles.enzimaFila}>
                      <span className={styles.enzimaLabel}><span aria-hidden="true">🧬</span> Enzimas:</span>
                      <span>{cf.enzimasRelacionadas}</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Datos fascinantes */}
        <h3 className={styles.subSeccionTitulo}>🧠 Datos fascinantes y enfermedades enzimáticas</h3>
        <div className={styles.datosGrid}>
          {DATOS_FASCINANTES.map(d => (
            <div key={d.titulo} className={styles.datoCard}>
              <div className={styles.datoHeader}>
                <span aria-hidden="true">{d.icono}</span>
                <strong>{d.titulo}</strong>
              </div>
              <p className={styles.datoTexto}>{d.dato}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const seccionActual = SECCIONES.find(s => s.id === seccion);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🧪 Las Enzimas del Cuerpo Humano</h1>
          <p className={styles.subtitle}>Catalizadores de la vida: aceleran tus reacciones millones de veces</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-current={seccion === s.id ? 'true' : undefined}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección */}
        {seccionActual && (
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>{seccionActual.icono} {seccionActual.titulo}</h2>
            <p className={styles.seccionSubtitulo}>{seccionActual.subtitulo}</p>
          </div>
        )}

        {/* Contenido de sección */}
        {seccion === 'que-son' && renderQueSon()}
        {seccion === 'enzimas' && renderEnzimas()}
        {seccion === 'factores' && renderFactores()}
        {seccion === 'cofactores' && renderCofactores()}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 ¿Quieres profundizar?"
          subtitle="Conceptos clave sobre enzimología"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué pasaría sin enzimas?</h2>
            <p>
              Sin enzimas, una reacción que tarda milisegundos tardaría <strong>años o incluso siglos</strong>.
              Por ejemplo, la descomposición de una sola molécula de peróxido de hidrógeno sin catalasa
              tardaría semanas. Con catalasa, ocurre 40 millones de veces por segundo.
            </p>
            <h2>Enzimas y medicina</h2>
            <p>
              Muchos fármacos son <strong>inhibidores enzimáticos</strong>: la aspirina inhibe COX (dolor),
              los inhibidores de la ECA controlan la hipertensión, los antirretrovirales inhiben la proteasa
              del VIH. Entender las enzimas es clave para desarrollar medicamentos.
            </p>
            <h2>Enzimas en la industria</h2>
            <p>
              Las enzimas se usan en detergentes (proteasas y lipasas eliminan manchas), en la producción
              de queso (renina/quimosina), en la fabricación de cerveza (amilasas) y en diagnóstico médico
              (enzimas como marcadores en análisis de sangre).
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-enzimas-cuerpo-humano')} />
        <ShareCard appName="visualizador-enzimas-cuerpo-humano" />
        <Footer appName="visualizador-enzimas-cuerpo-humano" />
    </div>
  );
}
