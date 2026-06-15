'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './IndiceGlucemico.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────
type TabId = 'conceptos' | 'alimentos' | 'fibra' | 'curva';
type CategoriaId = 'frutas' | 'cereales' | 'lacteos' | 'legumbres' | 'verduras' | 'snacks';

interface Alimento {
  nombre: string;
  ig: number;
  chPor100g: number;
  porcionG: number;
  categoria: CategoriaId;
  dato: string;
}

interface ConceptoCard {
  id: string;
  titulo: string;
  icono: string;
  color: string;
  formula: string;
  definicion: string;
  ejemplo: string;
  utilidad: string;
}

// ─── Datos ───────────────────────────────────────────

// Carga glucémica = (IG × gramos CH en porción) / 100
function calcularCG(ig: number, chPor100g: number, porcionG: number): number {
  const chEnPorcion = (chPor100g * porcionG) / 100;
  return Math.round((ig * chEnPorcion) / 100);
}

function nivelIG(ig: number): { label: string; color: string } {
  if (ig < 55) return { label: 'Bajo', color: '#16A34A' };
  if (ig < 70) return { label: 'Moderado', color: '#D97706' };
  return { label: 'Alto', color: '#DC2626' };
}

function nivelCG(cg: number): { label: string; color: string } {
  if (cg < 10) return { label: 'Baja', color: '#16A34A' };
  if (cg < 20) return { label: 'Media', color: '#D97706' };
  return { label: 'Alta', color: '#DC2626' };
}

const ALIMENTOS: Alimento[] = [
  // Frutas
  { nombre: 'Sandía', ig: 76, chPor100g: 6, porcionG: 200, categoria: 'frutas', dato: 'La paradoja clásica: IG alto pero muy poca cantidad de CH por porción real.' },
  { nombre: 'Mango', ig: 56, chPor100g: 15, porcionG: 150, categoria: 'frutas', dato: 'IG moderado y CG moderada; rico en vitamina C y fibra.' },
  { nombre: 'Manzana', ig: 36, chPor100g: 14, porcionG: 150, categoria: 'frutas', dato: 'IG bajo gracias a la pectina (fibra soluble) que ralentiza la absorción.' },
  { nombre: 'Plátano maduro', ig: 62, chPor100g: 23, porcionG: 100, categoria: 'frutas', dato: 'Más maduro = más IG. El plátano verde tiene almidón resistente y menor IG.' },
  { nombre: 'Fresas', ig: 40, chPor100g: 8, porcionG: 150, categoria: 'frutas', dato: 'IG bajo y CG muy baja; antioxidantes sin impacto glucémico significativo.' },
  { nombre: 'Dátiles', ig: 55, chPor100g: 75, porcionG: 30, categoria: 'frutas', dato: 'Poca porción = CG razonable. Alimento muy concentrado en azúcares naturales.' },
  // Cereales
  { nombre: 'Pan blanco', ig: 75, chPor100g: 50, porcionG: 40, categoria: 'cereales', dato: 'IG alto y CG alta en una ración real. Referencia habitual de IG elevado.' },
  { nombre: 'Pan integral', ig: 51, chPor100g: 41, porcionG: 40, categoria: 'cereales', dato: 'La fibra reduce el IG respecto al pan blanco, aunque la diferencia es menor de lo que se suele creer.' },
  { nombre: 'Arroz blanco cocido', ig: 72, chPor100g: 28, porcionG: 150, categoria: 'cereales', dato: 'IG alto. Refrigerado y recalentado, parte del almidón se vuelve resistente y baja el IG.' },
  { nombre: 'Arroz integral', ig: 50, chPor100g: 23, porcionG: 150, categoria: 'cereales', dato: 'La fibra del salvado ralentiza la digestión; IG moderado-bajo.' },
  { nombre: 'Avena (copos)', ig: 55, chPor100g: 60, porcionG: 40, categoria: 'cereales', dato: 'El beta-glucano (fibra soluble) de la avena es uno de los moduladores de IG más estudiados.' },
  { nombre: 'Pasta al dente', ig: 45, chPor100g: 25, porcionG: 200, categoria: 'cereales', dato: 'Cocción al dente = almidón más compacto = menor IG. La misma pasta muy cocida sube a ~65.' },
  // Lácteos
  { nombre: 'Leche entera', ig: 30, chPor100g: 5, porcionG: 250, categoria: 'lacteos', dato: 'IG bajo, pero tiene respuesta insulínica mayor de la esperada (índice insulínico elevado).' },
  { nombre: 'Yogur natural', ig: 35, chPor100g: 6, porcionG: 125, categoria: 'lacteos', dato: 'Las bacterias lácticas fermentan parte de la lactosa, reduciendo el IG.' },
  { nombre: 'Yogur con azúcar', ig: 52, chPor100g: 14, porcionG: 125, categoria: 'lacteos', dato: 'El azúcar añadido sube tanto el IG como la CG respecto al yogur natural.' },
  // Legumbres
  { nombre: 'Lentejas cocidas', ig: 32, chPor100g: 20, porcionG: 150, categoria: 'legumbres', dato: 'Una de las mejores opciones: proteína + fibra que frena la absorción de glucosa.' },
  { nombre: 'Garbanzos cocidos', ig: 28, chPor100g: 27, porcionG: 150, categoria: 'legumbres', dato: 'IG muy bajo. La combinación de almidón resistente y proteína es ideal.' },
  { nombre: 'Judías blancas', ig: 31, chPor100g: 23, porcionG: 150, categoria: 'legumbres', dato: 'Las legumbres en general tienen los IG más bajos entre los alimentos ricos en CH.' },
  // Verduras
  { nombre: 'Zanahoria cocida', ig: 70, chPor100g: 5, porcionG: 80, categoria: 'verduras', dato: 'Otro ejemplo de "paradoja": IG alto pero CG muy baja por la poca cantidad de CH real.' },
  { nombre: 'Zanahoria cruda', ig: 35, chPor100g: 9, porcionG: 80, categoria: 'verduras', dato: 'La cocción rompe la estructura celular y sube el IG. Cruda es mucho más favorable.' },
  { nombre: 'Patata hervida', ig: 78, chPor100g: 17, porcionG: 150, categoria: 'verduras', dato: 'IG alto. Fría (ensalada de patata), el almidón se vuelve resistente y el IG baja a ~56.' },
  { nombre: 'Boniato', ig: 54, chPor100g: 20, porcionG: 150, categoria: 'verduras', dato: 'Menor IG que la patata gracias a su mayor contenido en fibra y diferente estructura del almidón.' },
  { nombre: 'Brócoli', ig: 15, chPor100g: 4, porcionG: 150, categoria: 'verduras', dato: 'Prácticamente no tiene impacto glucémico. El IG de las verduras no almidonadas es irrelevante.' },
  // Snacks
  { nombre: 'Chocolate negro 85%', ig: 25, chPor100g: 14, porcionG: 30, categoria: 'snacks', dato: 'El cacao tiene flavonoides que mejoran la sensibilidad a la insulina. IG y CG bajos.' },
  { nombre: 'Galletas de mantequilla', ig: 65, chPor100g: 65, porcionG: 30, categoria: 'snacks', dato: 'IG moderado-alto y CG moderada. Fácil de subestimar porque la porción parece pequeña.' },
  { nombre: 'Glucosa pura', ig: 100, chPor100g: 100, porcionG: 50, categoria: 'snacks', dato: 'La referencia. IG = 100 por definición. Todos los demás alimentos se miden contra esta.' },
];

const CATEGORIAS: { id: CategoriaId; label: string; icono: string }[] = [
  { id: 'frutas', label: 'Frutas', icono: '🍎' },
  { id: 'cereales', label: 'Cereales', icono: '🌾' },
  { id: 'lacteos', label: 'Lácteos', icono: '🥛' },
  { id: 'legumbres', label: 'Legumbres', icono: '🫘' },
  { id: 'verduras', label: 'Verduras', icono: '🥦' },
  { id: 'snacks', label: 'Snacks', icono: '🍫' },
];

const CONCEPTOS: ConceptoCard[] = [
  {
    id: 'ig',
    titulo: 'Índice Glucémico (IG)',
    icono: '⚡',
    color: '#2E86AB',
    formula: 'IG = (Área bajo la curva del alimento / Área bajo la curva de glucosa pura) × 100',
    definicion: 'Mide la velocidad con la que los carbohidratos de un alimento elevan la glucosa en sangre, comparándolo con glucosa pura (referencia = 100). Se mide con porciones que aportan exactamente 50 g de carbohidratos disponibles.',
    ejemplo: 'Sandía: IG = 76 (alto). Significa que eleva la glucemia rápido, pero solo si ingieres 50 g de carbohidratos de sandía… lo que equivale a unos 800 g de sandía.',
    utilidad: 'Útil para comparar la velocidad de digestión de alimentos, pero no refleja el impacto real de las porciones que se comen habitualmente.',
  },
  {
    id: 'cg',
    titulo: 'Carga Glucémica (CG)',
    icono: '📊',
    color: '#48A9A6',
    formula: 'CG = (IG × gramos de CH en la porción real) / 100',
    definicion: 'Combina la velocidad (IG) con la cantidad real de carbohidratos en una porción habitual. Refleja mucho mejor el impacto glucémico de lo que realmente se come.',
    ejemplo: 'Sandía en porción de 200 g: contiene solo 12 g de CH. CG = (76 × 12) / 100 = 9 (baja). A pesar del IG alto, el impacto glucémico real es bajo.',
    utilidad: 'Más útil en la práctica diaria que el IG solo. Permite evaluar el impacto real de lo que se come, no de una cantidad artificial de 50 g de CH.',
  },
  {
    id: 'ii',
    titulo: 'Índice Insulínico (II)',
    icono: '💉',
    color: '#7FB3D3',
    formula: 'II = (Área bajo la curva de insulina del alimento / Área bajo la curva de insulina del pan blanco) × 100',
    definicion: 'Mide la respuesta de la insulina en sangre, no solo la de la glucosa. Algunos alimentos (especialmente lácteos y proteínas) provocan más insulina de lo que su IG sugiere.',
    ejemplo: 'La leche tiene IG = 30 (bajo) pero II ≈ 90 (muy alto). El suero de leche (whey) es uno de los mayores secretagogos de insulina conocidos, superando incluso al pan blanco.',
    utilidad: 'Relevante para investigación y manejo de la diabetes, pero menos práctico que IG y CG para el público general. Aún no existe una base de datos universal de II para todos los alimentos.',
  },
];

// Curva glucosa simulada (datos en puntos de tiempo: 0, 15, 30, 45, 60, 90, 120 min)
const CURVAS: Record<string, { label: string; color: string; valores: number[] }> = {
  'ig-alto': {
    label: 'IG alto (pan blanco, 75g CH)',
    color: '#DC2626',
    valores: [90, 135, 168, 155, 130, 105, 92],
  },
  'ig-bajo': {
    label: 'IG bajo (lentejas, 75g CH)',
    color: '#16A34A',
    valores: [90, 100, 115, 118, 112, 100, 93],
  },
  'cg-baja': {
    label: 'CG baja (sandía, porción real)',
    color: '#2E86AB',
    valores: [90, 97, 104, 102, 98, 93, 91],
  },
};

const TIEMPOS = [0, 15, 30, 45, 60, 90, 120];

// ─── Componente principal ─────────────────────────────
export default function IndiceGlucemicoPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('conceptos');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId>('frutas');
  const [conceptoActivo, setConceptoActivo] = useState<string>('ig');
  const [curvasVisibles, setCurvasVisibles] = useState<Set<string>>(new Set(['ig-alto', 'ig-bajo', 'cg-baja']));

  const tabs: { id: TabId; label: string; icono: string }[] = [
    { id: 'conceptos', label: 'IG, CG e II', icono: '📚' },
    { id: 'alimentos', label: 'Tabla de alimentos', icono: '🥗' },
    { id: 'fibra', label: 'La fibra como modulador', icono: '🌿' },
    { id: 'curva', label: 'Curva de glucosa', icono: '📈' },
  ];

  const alimentosCategoria = ALIMENTOS.filter(a => a.categoria === categoriaActiva);
  const conceptoActualData = CONCEPTOS.find(c => c.id === conceptoActivo) ?? CONCEPTOS[0];

  function toggleCurva(id: string) {
    setCurvasVisibles(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Calcular máximo para escala de la curva
  const maxValor = Math.max(
    ...Object.entries(CURVAS)
      .filter(([id]) => curvasVisibles.has(id))
      .flatMap(([, c]) => c.valores),
    100
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>📊</div>
        <h1>Índice Glucémico y Carga Glucémica</h1>
        <p>Por qué la sandía puede tener IG alto pero impacto real bajo: la diferencia que cambia cómo interpretas los alimentos</p>
      </header>

      <LegalNotice />

      {/* Navegación tabs */}
      <nav className={styles.tabs} aria-label="Secciones del visualizador">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-pressed={tabActiva === tab.id}
          >
            <span aria-hidden="true">{tab.icono}</span> {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB: Conceptos */}
      {tabActiva === 'conceptos' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Tres conceptos, tres respuestas distintas</h2>
          <p className={styles.seccionSubtitulo}>
            Selecciona cada concepto para entender qué mide, cómo se calcula y cuándo es útil
          </p>

          <div className={styles.conceptoTabs}>
            {CONCEPTOS.map(c => (
              <button
                key={c.id}
                className={`${styles.conceptoTab} ${conceptoActivo === c.id ? styles.conceptoTabActivo : ''}`}
                style={conceptoActivo === c.id ? { borderColor: c.color, color: c.color } : {}}
                onClick={() => setConceptoActivo(c.id)}
                aria-pressed={conceptoActivo === c.id}
              >
                <span aria-hidden="true">{c.icono}</span> {c.titulo}
              </button>
            ))}
          </div>

          <div className={styles.conceptoDetalle} style={{ borderLeftColor: conceptoActualData.color }}>
            <div className={styles.conceptoHeader}>
              <span className={styles.conceptoIconoGrande} aria-hidden="true">{conceptoActualData.icono}</span>
              <h3 className={styles.conceptoTitulo} style={{ color: conceptoActualData.color }}>
                {conceptoActualData.titulo}
              </h3>
            </div>

            <div className={styles.formulaBox} style={{ borderColor: conceptoActualData.color }}>
              <span className={styles.formulaLabel}>Fórmula</span>
              <p className={styles.formula}>{conceptoActualData.formula}</p>
            </div>

            <div className={styles.conceptoBloque}>
              <h4 className={styles.conceptoBloqueTitle}>¿Qué mide?</h4>
              <p className={styles.conceptoBloqueText}>{conceptoActualData.definicion}</p>
            </div>

            <div className={styles.conceptoBloque}>
              <h4 className={styles.conceptoBloqueTitle}>Ejemplo real</h4>
              <p className={styles.conceptoBloqueText}>{conceptoActualData.ejemplo}</p>
            </div>

            <div className={styles.conceptoBloque}>
              <h4 className={styles.conceptoBloqueTitle}>¿Cuándo es útil?</h4>
              <p className={styles.conceptoBloqueText}>{conceptoActualData.utilidad}</p>
            </div>
          </div>

          <div className={styles.paradojasGrid}>
            <div className={styles.paradojaCard}>
              <h3>🍉 La paradoja de la sandía</h3>
              <p>
                La sandía tiene un <strong>IG de 76</strong> (alto), lo que asusta a muchas personas que intentan
                controlar su glucemia. Sin embargo, una porción real de 200 g de sandía contiene solo
                <strong> 12 g de carbohidratos</strong> (la mayor parte es agua).
                La <strong>carga glucémica es 9</strong> (baja). El impacto real sobre la glucosa es mínimo.
              </p>
            </div>
            <div className={styles.paradojaCard}>
              <h3>🥕 La paradoja de la zanahoria</h3>
              <p>
                La zanahoria <em>cocida</em> tiene un IG de ~70 (alto). La zanahoria <em>cruda</em>, un IG de ~35 (bajo).
                El mismo vegetal con diferente IG según el método de preparación: la cocción rompe las paredes celulares
                y facilita la digestión del almidón. Ambas tienen CG muy baja en porciones reales.
              </p>
            </div>
            <div className={styles.paradojaCard}>
              <h3>🍝 La paradoja de la pasta</h3>
              <p>
                La pasta <em>al dente</em> tiene un IG de ~45 (bajo). La misma pasta <em>muy cocida</em>, un IG de ~65 (moderado-alto).
                El almidón gelatinizado por cocción excesiva se digiere mucho más rápido. Cocinar al dente
                no es solo una cuestión de textura: tiene impacto fisiológico real.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB: Tabla de alimentos */}
      {tabActiva === 'alimentos' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>IG y Carga Glucémica por alimento</h2>
          <p className={styles.seccionSubtitulo}>
            Valores orientativos. El IG varía según madurez, cocción y variedad del alimento.
          </p>

          <div className={styles.categoriasTabs} role="group" aria-label="Filtrar por categoría">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoriaTab} ${categoriaActiva === cat.id ? styles.categoriaTabActiva : ''}`}
                onClick={() => setCategoriaActiva(cat.id)}
                aria-pressed={categoriaActiva === cat.id}
              >
                <span aria-hidden="true">{cat.icono}</span> {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.tablaWrapper} role="region" aria-label="Tabla de alimentos">
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Alimento</th>
                  <th scope="col">IG</th>
                  <th scope="col">Nivel IG</th>
                  <th scope="col">Porción</th>
                  <th scope="col">CG</th>
                  <th scope="col">Nivel CG</th>
                </tr>
              </thead>
              <tbody>
                {alimentosCategoria.map(alimento => {
                  const cg = calcularCG(alimento.ig, alimento.chPor100g, alimento.porcionG);
                  const nivelIg = nivelIG(alimento.ig);
                  const nivelCg = nivelCG(cg);
                  return (
                    <tr key={alimento.nombre} className={styles.filaTabla}>
                      <td className={styles.celdaNombre}>
                        <span className={styles.nombreAlimento}>{alimento.nombre}</span>
                        <span className={styles.datoAlimento}>{alimento.dato}</span>
                      </td>
                      <td className={styles.celdaNumero}>{alimento.ig}</td>
                      <td>
                        <span
                          className={styles.nivelBadge}
                          style={{ backgroundColor: nivelIg.color + '20', color: nivelIg.color }}
                        >
                          {nivelIg.label}
                        </span>
                      </td>
                      <td className={styles.celdaNumero}>{alimento.porcionG} g</td>
                      <td className={styles.celdaNumero}>{cg}</td>
                      <td>
                        <span
                          className={styles.nivelBadge}
                          style={{ backgroundColor: nivelCg.color + '20', color: nivelCg.color }}
                        >
                          {nivelCg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.tablaLeyenda}>
            <span><strong>IG bajo</strong>: &lt; 55 · <strong>Moderado</strong>: 55-69 · <strong>Alto</strong>: ≥ 70</span>
            <span><strong>CG baja</strong>: &lt; 10 · <strong>Media</strong>: 10-19 · <strong>Alta</strong>: ≥ 20</span>
          </div>
        </section>
      )}

      {/* TAB: Fibra */}
      {tabActiva === 'fibra' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>La fibra: el modulador del índice glucémico</h2>

          <div className={styles.fibraIntro}>
            <p>
              La fibra dietética no se digiere ni se absorbe como glucosa. Su efecto sobre el IG varía
              enormemente según el <strong>tipo de fibra</strong>: no toda la fibra tiene el mismo impacto
              en la glucemia.
            </p>
          </div>

          <div className={styles.fibraGrid}>
            <div className={styles.fibraCard} style={{ borderTopColor: '#2E86AB' }}>
              <h3 style={{ color: '#2E86AB' }}>💧 Fibra soluble (viscosa)</h3>
              <p><strong>Dónde se encuentra:</strong> Avena (beta-glucano), legumbres, manzana, cebada, psyllium.</p>
              <p><strong>Mecanismo:</strong> En contacto con el agua forma un gel viscoso en el intestino que:
              </p>
              <ul>
                <li>Atrapa las moléculas de glucosa y ralentiza su absorción</li>
                <li>Retarda el vaciamiento gástrico (más tiempo → digestión más lenta)</li>
                <li>Reduce la actividad de las enzimas digestivas (amilasas)</li>
              </ul>
              <p><strong>Efecto en IG:</strong> Reducción significativa y demostrada. 3 g de beta-glucano de avena pueden reducir el pico de glucosa un 20-30%.</p>
            </div>

            <div className={styles.fibraCard} style={{ borderTopColor: '#48A9A6' }}>
              <h3 style={{ color: '#48A9A6' }}>🌾 Fibra insoluble</h3>
              <p><strong>Dónde se encuentra:</strong> Salvado de trigo, piel de frutas y verduras, frutos secos.</p>
              <p><strong>Mecanismo:</strong> No forma gel. Su efecto sobre el IG es mucho menor que la fibra soluble. Principalmente:</p>
              <ul>
                <li>Aumenta el volumen del bolo alimenticio</li>
                <li>Acelera el tránsito intestinal</li>
                <li>Efecto mecánico sobre la digestión, no químico</li>
              </ul>
              <p><strong>Efecto en IG:</strong> Moderado o no significativo. La reducción de IG en pan integral vs pan blanco es menor de lo que popularmente se cree.</p>
            </div>

            <div className={styles.fibraCard} style={{ borderTopColor: '#8B5E3C' }}>
              <h3 style={{ color: '#8B5E3C' }}>🧊 Almidón resistente: el caso especial</h3>
              <p><strong>Qué es:</strong> Un tipo de almidón que no se digiere en el intestino delgado (actúa como fibra). Se forma cuando los alimentos almidonados se cocinan y luego se enfrían.</p>
              <p><strong>Ejemplos y reducción de IG:</strong></p>
              <ul>
                <li>Patata cocida caliente: IG ~78 → enfriada: IG ~56</li>
                <li>Arroz recalentado: IG ~10-15 puntos menor que recién cocido</li>
                <li>Pasta de ensalada fría: IG ~5-10 puntos menor</li>
                <li>Plátano verde: alto en almidón resistente → IG ~30</li>
              </ul>
              <p><strong>Implicación práctica:</strong> Preparar arroz o pasta el día anterior puede reducir su impacto glucémico sin cambiar el sabor significativamente.</p>
            </div>

            <div className={styles.fibraCard} style={{ borderTopColor: '#5B4FC4' }}>
              <h3 style={{ color: '#5B4FC4' }}>🍱 El orden de los alimentos importa</h3>
              <p>Estudios recientes sugieren que el <strong>orden en que se ingieren los alimentos</strong> en una comida afecta la respuesta glucémica:</p>
              <ul>
                <li>Comer verdura y proteína <em>antes</em> que los carbohidratos reduce el pico de glucosa</li>
                <li>La fibra y la grasa al inicio de la comida ralentizan el vaciamiento gástrico</li>
                <li>Este efecto es independiente del contenido total de la comida</li>
              </ul>
              <p>Invertir el orden (carbohidratos primero) puede aumentar el pico glucémico un 20-40% en el mismo menú.</p>
            </div>
          </div>
        </section>
      )}

      {/* TAB: Curva de glucosa */}
      {tabActiva === 'curva' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Curva de glucosa post-comida</h2>
          <p className={styles.seccionSubtitulo}>
            Simulación orientativa de cómo diferentes tipos de carbohidratos afectan a la glucemia
            (valores de referencia en mg/dL, partiendo de glucemia basal de 90)
          </p>

          <div className={styles.curvaLeyenda}>
            {Object.entries(CURVAS).map(([id, curva]) => (
              <button
                key={id}
                className={`${styles.curvaLeyendaItem} ${curvasVisibles.has(id) ? styles.curvaLeyendaActiva : styles.curvaLeyendaInactiva}`}
                onClick={() => toggleCurva(id)}
                aria-pressed={curvasVisibles.has(id)}
              >
                <span
                  className={styles.curvaColorDot}
                  style={{ backgroundColor: curvasVisibles.has(id) ? curva.color : '#ccc' }}
                  aria-hidden="true"
                />
                {curva.label}
              </button>
            ))}
          </div>

          {/* Gráfico SVG simplificado */}
          <div className={styles.graficaWrapper} role="img" aria-label="Gráfico de curvas de glucosa">
            <svg viewBox="0 0 700 280" className={styles.grafica} preserveAspectRatio="xMidYMid meet">
              {/* Fondo */}
              <rect x="60" y="10" width="620" height="220" fill="none" stroke="#e5e7eb" strokeWidth="1" rx="4" />

              {/* Líneas de referencia horizontales */}
              {[90, 100, 120, 140, 160].map(val => {
                const yPos = 230 - ((val - 80) / (maxValor - 80 + 20)) * 220;
                return (
                  <g key={val}>
                    <line x1="60" y1={yPos} x2="680" y2={yPos} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="55" y={yPos + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">{val}</text>
                  </g>
                );
              })}

              {/* Eje X - tiempos */}
              {TIEMPOS.map((t, i) => {
                const xPos = 60 + (i / (TIEMPOS.length - 1)) * 620;
                return (
                  <g key={t}>
                    <line x1={xPos} y1="230" x2={xPos} y2="235" stroke="#9CA3AF" strokeWidth="1" />
                    <text x={xPos} y="248" textAnchor="middle" fontSize="11" fill="#9CA3AF">{t}min</text>
                  </g>
                );
              })}

              {/* Curvas */}
              {Object.entries(CURVAS).map(([id, curva]) => {
                if (!curvasVisibles.has(id)) return null;
                const puntos = curva.valores.map((val, i) => {
                  const x = 60 + (i / (TIEMPOS.length - 1)) * 620;
                  const y = 230 - ((val - 80) / (maxValor - 80 + 20)) * 220;
                  return `${x},${y}`;
                });
                return (
                  <polyline
                    key={id}
                    points={puntos.join(' ')}
                    fill="none"
                    stroke={curva.color}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                );
              })}

              {/* Puntos */}
              {Object.entries(CURVAS).map(([id, curva]) => {
                if (!curvasVisibles.has(id)) return null;
                return curva.valores.map((val, i) => {
                  const x = 60 + (i / (TIEMPOS.length - 1)) * 620;
                  const y = 230 - ((val - 80) / (maxValor - 80 + 20)) * 220;
                  return <circle key={`${id}-${i}`} cx={x} cy={y} r="4" fill={curva.color} />;
                });
              })}

              {/* Etiqueta eje Y */}
              <text
                x="15"
                y="130"
                textAnchor="middle"
                fontSize="11"
                fill="#6B7280"
                transform="rotate(-90, 15, 130)"
              >
                Glucosa (mg/dL)
              </text>
            </svg>
          </div>

          <div className={styles.curvaNota}>
            <strong>ℹ️ Nota metodológica:</strong> Esta simulación es orientativa y educativa.
            Los valores reales varían según el individuo, el contexto de la comida, la actividad física
            previa y otros factores. El punto de partida (glucemia basal) difiere entre personas.
          </div>

          <div className={styles.curvaInsights}>
            <div className={styles.insightCard}>
              <h3>📈 Pico glucémico</h3>
              <p>Los carbohidratos de IG alto producen un pico pronunciado (130-170 mg/dL) a los 30-45 minutos. Los de IG bajo generan una elevación moderada y sostenida que se normaliza más gradualmente.</p>
            </div>
            <div className={styles.insightCard}>
              <h3>📉 El valle post-pico</h3>
              <p>Tras un pico glucémico alto, la insulina puede causar una bajada brusca que puede alcanzar niveles por debajo de la glucemia basal. Esto genera sensación de hambre y fatiga más rápidamente.</p>
            </div>
            <div className={styles.insightCard}>
              <h3>💡 La CG baja en práctica</h3>
              <p>La sandía (CG baja) genera un impacto glucémico similar al de los alimentos de IG bajo, a pesar de su IG alto. La cantidad de carbohidratos en una porción real es el factor clave.</p>
            </div>
          </div>
        </section>
      )}

      <EducationalSection
        title="📚 Guía completa de índice glucémico y nutrición"
        subtitle="Más allá del IG: contexto, limitaciones y aplicaciones reales"
      >
        <h3>Las limitaciones del índice glucémico</h3>
        <p>
          El IG tiene limitaciones importantes que a menudo se olvidan en la divulgación nutricional.
          Se mide en personas en ayunas, con un alimento a la vez, en una cantidad que aporta exactamente
          50 g de carbohidratos. En la vida real, comemos mezclas de alimentos con grasa, proteína y fibra
          que modifican enormemente la respuesta glucémica. El IG de un alimento aislado no predice bien
          el IG de una comida completa.
        </p>

        <h3>El IG y la diabetes</h3>
        <p>
          En personas con diabetes tipo 2, la gestión de la carga glucémica total de la dieta tiene
          evidencia razonable para el control de la hemoglobina glicosilada (HbA1c). Sin embargo,
          las guías clínicas actuales no se centran únicamente en el IG, sino en el patrón dietético
          global, la calidad de los carbohidratos y el equilibrio calórico total.
        </p>

        <h3>¿Por qué los lácteos tienen índice insulínico alto?</h3>
        <p>
          La leche y los derivados lácteos tienen IG bajo pero provocan una respuesta insulínica
          desproporcionada. El mecanismo más aceptado es que las proteínas del suero (beta-lactoglobulina,
          alfa-lactoalbúmina) son potentes secretagogos de insulina directos, independientemente de la
          glucosa. Este es uno de los ejemplos más claros de por qué el IG solo no es suficiente para
          predecir la respuesta insulínica.
        </p>

        <h3>Vinagre, limón y canela: ¿mitos o realidad?</h3>
        <p>
          Algunos alimentos y condimentos se han estudiado por su efecto modulador del IG. El vinagre
          (ácido acético) tiene evidencia razonable: reduce el vaciamiento gástrico y puede bajar el
          pico glucémico de una comida un 15-30%. La canela tiene estudios contradictorios. El limón
          tiene evidencia débil. Ninguno es un &ldquo;tratamiento&rdquo; pero son moduladores reales,
          aunque modestos.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-indice-glucemico')} />
      <ShareCard appName="visualizador-indice-glucemico" />
      <Footer appName="visualizador-indice-glucemico" />
    </div>
  );
}
