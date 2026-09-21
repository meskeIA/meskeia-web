'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaValencias.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import DataReference from '@/components/DataReference';
import { getRelatedApps } from '@/data/app-relations';
import { ELEMENTOS, IONES, type CategoriaId, type Elemento } from './datos';
import {
  CASOS,
  TOTAL_CASOS,
  NOTA_CONVENIO,
  comprobarRespuesta,
  generarPreguntaAleatoria,
} from './casos';
import { formatNumber } from '@/lib';

// ═══════════════════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════════════════

const CATEGORIAS: { id: CategoriaId; etiqueta: string; corta: string; color: string }[] = [
  { id: 'hidrogeno', etiqueta: 'Hidrógeno', corta: 'Hidrógeno', color: '#7FB3D3' },
  { id: 'alcalinos', etiqueta: 'Metales alcalinos (grupo 1)', corta: 'Alcalinos', color: '#E8A0A0' },
  { id: 'alcalinoterreos', etiqueta: 'Metales alcalinotérreos (grupo 2)', corta: 'Alcalinotérreos', color: '#EFC084' },
  { id: 'transicion', etiqueta: 'Metales de transición', corta: 'Transición', color: '#8FC1DE' },
  { id: 'terreos', etiqueta: 'Térreos o boroideos (grupo 13)', corta: 'Térreos', color: '#A8D5BA' },
  { id: 'carbonoideos', etiqueta: 'Carbonoideos (grupo 14)', corta: 'Carbonoideos', color: '#9FD3C7' },
  { id: 'nitrogenoideos', etiqueta: 'Nitrogenoideos (grupo 15)', corta: 'Nitrogenoideos', color: '#B8B0DC' },
  { id: 'anfigenos', etiqueta: 'Anfígenos o calcógenos (grupo 16)', corta: 'Anfígenos', color: '#D5A6BD' },
  { id: 'halogenos', etiqueta: 'Halógenos (grupo 17)', corta: 'Halógenos', color: '#EBD98B' },
  { id: 'gases-nobles', etiqueta: 'Gases nobles (grupo 18)', corta: 'Gases nobles', color: '#AEC9E3' },
];


// ═══════════════════════════════════════════════════════════════════════
// UTILIDADES DE NOMENCLATURA
// ═══════════════════════════════════════════════════════════════════════

/** Prefijos multiplicadores de la nomenclatura sistemática */
const PREFIJOS = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
/** Forma contraída de los prefijos delante de «óxido» */
const PREFIJOS_OXIDO = ['', 'mon', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
const ROMANOS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Raíz del elemento cuando actúa como parte negativa del compuesto binario */
const RAIZ_ANION: Record<string, string> = {
  O: 'óxido', F: 'fluoruro', Cl: 'cloruro', Br: 'bromuro', I: 'yoduro',
  S: 'sulfuro', Se: 'seleniuro', Te: 'telururo', N: 'nitruro', P: 'fosfuro',
  As: 'arseniuro', Sb: 'antimoniuro', C: 'carburo', Si: 'siliciuro',
  B: 'boruro', H: 'hidruro',
};

/** Nombres comunes o vulgares aceptados para algunos binarios muy conocidos */
const NOMBRES_COMUNES: Record<string, string> = {
  H2O: 'agua',
  NH3: 'amoniaco',
  CH4: 'metano',
  PH3: 'fosfano (antes fosfina)',
  SiH4: 'silano',
  BH3: 'borano',
  AsH3: 'arsano (antes arsina)',
  HCl: 'ácido clorhídrico (en disolución acuosa)',
  HF: 'ácido fluorhídrico (en disolución acuosa)',
  HBr: 'ácido bromhídrico (en disolución acuosa)',
  HI: 'ácido yodhídrico (en disolución acuosa)',
  H2S: 'ácido sulfhídrico (en disolución acuosa)',
  H2O2: 'agua oxigenada',
  Fe2O3: 'herrumbre',
  SiO2: 'cuarzo o sílice',
};

/** Elementos que, combinados con hidrógeno, se escriben delante de él */
const NO_METALES_HIDRURO = ['B', 'C', 'Si', 'N', 'P', 'As', 'Sb'];

/**
 * No metales con nomenclatura tradicional: su óxido es un ANHÍDRIDO, no un óxido, y de ahí
 * salen los oxácidos («anhídrido sulfúrico» SO₃ → «ácido sulfúrico» H₂SO₄). Son los mismos 13
 * elementos cuyas fichas llevan raíz tradicional sin ser metales.
 */
const NO_METALES_TRADICIONALES = ['B', 'C', 'Si', 'N', 'P', 'As', 'Sb', 'S', 'Se', 'Te', 'Cl', 'Br', 'I'];

/**
 * Pares «elemento + estado» cuyo anhídrido no da un oxácido que exista.
 *
 * ⚠️ 2026-09-21 (hallazgo 1066 del Inspector): el ejemplo tradicional se generaba con una
 *    plantilla fija «anhídrido X y ácido X», que acierta en 12 de los 13 no metales y falla
 *    en el carbono con +2: el anhídrido carbonoso es el CO, pero el ácido carbonoso (H₂CO₂)
 *    que la plantilla deriva no es una sustancia. El CO es un óxido neutro: no reacciona con
 *    agua para dar un ácido, que es justo lo que define a un anhídrido.
 */
const SIN_OXACIDO: Record<string, true> = {
  'C2': true,
};

/** Grupo 18. Apenas forman compuestos, y los conocidos son casi todos con flúor y oxígeno. */
const GASES_NOBLES = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'];

/** Máximo común divisor (para simplificar los subíndices) */
function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

/** Quita acentos y pasa a minúsculas, para un buscador tolerante */
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Formatea un número de oxidación con su signo (usando el signo menos tipográfico) */
function formatearEstado(valor: number): string {
  if (valor > 0) return `+${valor}`;
  if (valor < 0) return `−${Math.abs(valor)}`;
  return '0';
}

/** Convierte un número en subíndices Unicode (1 → '', 2 → '₂') */
function subindice(n: number): string {
  if (n <= 1) return '';
  const digitos = '₀₁₂₃₄₅₆₇₈₉';
  return String(n).split('').map((d) => digitos[Number(d)]).join('');
}

interface CompuestoResultado {
  partes: { simbolo: string; sub: number }[];
  formulaTexto: string;
  sistematica: string;
  stock: string;
  tradicional: string;
  comun?: string;
  advertencia?: string;
}

/** Aplica el intercambio de valencias y genera fórmula + tres nombres */
function formularBinario(
  positivo: Elemento,
  estadoPos: number,
  negativo: Elemento,
  estadoNeg: number,
): CompuestoResultado | null {
  if (positivo.simbolo === negativo.simbolo) return null;
  if (estadoPos <= 0 || estadoNeg >= 0) return null;

  const cargaNeg = Math.abs(estadoNeg);
  const divisor = mcd(estadoPos, cargaNeg);
  const subPosBase = cargaNeg / divisor;
  const subNegBase = estadoPos / divisor;
  // El mercurio(I) forma el ion diatómico Hg₂²⁺: siempre aparece en pares
  const factorDiatomico =
    positivo.simbolo === 'Hg' && estadoPos === 1 && subPosBase % 2 === 1 ? 2 : 1;
  const subPos = subPosBase * factorDiatomico;
  const subNeg = subNegBase * factorDiatomico;

  // Orden de escritura: primero el elemento electropositivo, salvo la excepción
  // clásica de los hidruros de los grupos 13, 14 y 15 (BH₃, CH₄, NH₃, PH₃).
  const excepcionHidruro =
    positivo.simbolo === 'H' && NO_METALES_HIDRURO.includes(negativo.simbolo);

  const partes = excepcionHidruro
    ? [{ simbolo: negativo.simbolo, sub: subNeg }, { simbolo: positivo.simbolo, sub: subPos }]
    : [{ simbolo: positivo.simbolo, sub: subPos }, { simbolo: negativo.simbolo, sub: subNeg }];

  const formulaTexto = partes.map((p) => p.simbolo + subindice(p.sub)).join('');
  const clave = partes.map((p) => p.simbolo + (p.sub > 1 ? p.sub : '')).join('');

  const raiz = RAIZ_ANION[negativo.simbolo] ?? 'compuesto';
  const estadosPositivos = positivo.estados.filter((e) => e.valor > 0);
  const necesitaRomano = estadosPositivos.length > 1;

  // ── Nomenclatura sistemática ──────────────────────────────────────
  // El prefijo «mono-» se omite salvo que ayude a distinguir compuestos
  // del mismo par de elementos (CO frente a CO₂, FeO frente a Fe₂O₃).
  const usarMono = subNeg === 1 && necesitaRomano;
  const idxNeg = subNeg > 1 ? subNeg : usarMono ? 1 : 0;
  const parteAnion =
    negativo.simbolo === 'O'
      ? `${PREFIJOS_OXIDO[idxNeg] ?? ''}óxido`
      : `${PREFIJOS[idxNeg] ?? ''}${raiz}`;
  const parteCation = `${subPos > 1 ? PREFIJOS[subPos] ?? '' : ''}${positivo.nombre.toLowerCase()}`;
  const sistematica = excepcionHidruro
    ? `${PREFIJOS[subPos] ?? ''}hidruro de ${negativo.nombre.toLowerCase()}`
    : `${parteAnion} de ${parteCation}`;

  // ── Nomenclatura de Stock ─────────────────────────────────────────
  const romano = ROMANOS[estadoPos] ?? String(estadoPos);
  const stock = excepcionHidruro
    ? `hidruro de ${negativo.nombre.toLowerCase()}`
    : `${raiz} de ${positivo.nombre.toLowerCase()}${necesitaRomano ? `(${romano})` : ''}`;

  /*
    ── Nomenclatura tradicional, y por qué el óxido de un no metal es un ANHÍDRIDO ──

    La tradicional reserva «óxido X-oso/-ico» para los metales y llama «anhídrido X-oso/-ico»
    al óxido de un no metal, porque es el que da un ácido al reaccionar con agua. La app decía
    «óxido» en los dos casos y la palabra «anhídrido» no aparecía ni una sola vez en la página
    (hallazgo 928).

    En el nitrógeno eso no era una forma anticuada sino una COLISIÓN: «óxido nítrico» es el
    nombre consolidado del monóxido de nitrógeno, NO, y «óxido nitroso» el del N₂O, el gas de
    la risa. Un estudiante que formulara «óxido nítrico» con esta página escribía N₂O₅.
  */
  const adjetivo = positivo.tradicional?.[estadoPos];
  const esAnhidrido = negativo.simbolo === 'O' && NO_METALES_TRADICIONALES.includes(positivo.simbolo);
  const raizTradicional = esAnhidrido ? 'anhídrido' : raiz;
  const tradicional = excepcionHidruro
    ? `hidruro de ${negativo.nombre.toLowerCase()}`
    : adjetivo
      ? `${raizTradicional} ${adjetivo}`
      : `${raiz} de ${positivo.nombre.toLowerCase()}`;

  let advertencia: string | undefined;
  /*
    El formulador solo comprobaba los signos y el máximo común divisor, así que devolvía
    Kr₃N₂, XeCl₈ o AuN con la misma cara con la que devuelve Fe₂O₃ (hallazgo 929). Con los
    gases nobles la regla sí es enunciable y la propia FAQ de esta página la enuncia —«solo
    con flúor y oxígeno: XeF₂, XeF₄, XeO₃, XeO₄»—, así que aquí se avisa. Para el resto no hay
    tabla posible de lo que existe.

    ⚠️ 2026-09-21 (hallazgo 1064): este comentario afirmaba que «de eso avisa la nota al pie
    del formulador», y comprobado en navegador la nota al pie hablaba solo de peróxidos,
    compuestos ternarios y sales de oxoácidos: el control compensatorio que esta decisión
    daba por existente NO estaba en la página, de modo que Au₃N o Ag₄C salían con la misma
    cara que Fe₂O₃. Ahora la nota dice expresamente que esto formula y no predice.
  */
  if (GASES_NOBLES.includes(positivo.simbolo) && !['F', 'O'].includes(negativo.simbolo)) {
    advertencia =
      `Los gases nobles apenas forman compuestos, y los que se conocen son casi siempre con flúor y oxígeno (XeF₂, XeF₄, XeO₃, XeO₄, KrF₂). ${formulaTexto} cumple la regla del intercambio de valencias, pero no es un compuesto conocido.`;
  } else if (positivo.simbolo === 'Hg' && estadoPos === 1) {
    advertencia =
      'El mercurio(I) existe como ion diatómico Hg₂²⁺: la fórmula real se escribe con Hg₂ (por ejemplo, Hg₂Cl₂).';
  } else if (excepcionHidruro) {
    advertencia =
      'Convención de escritura: en los hidruros de los grupos 13, 14 y 15 el no metal se escribe delante del hidrógeno (BH₃, CH₄, NH₃, PH₃) y el compuesto se nombra como hidruro de ese no metal, aunque el número de oxidación negativo lo tenga él.';
  }

  return {
    partes,
    formulaTexto,
    sistematica,
    stock,
    tradicional,
    comun: NOMBRES_COMUNES[clave],
    advertencia,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function TablaValenciasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<CategoriaId | 'todas'>('todas');
  const [expandido, setExpandido] = useState<string | null>(null);

  const [simboloPos, setSimboloPos] = useState('Fe');
  const [estadoPos, setEstadoPos] = useState(3);
  const [simboloNeg, setSimboloNeg] = useState('O');
  const [estadoNeg, setEstadoNeg] = useState(-2);

  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático en el buscador: es una app de consulta rápida
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const elementosFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return ELEMENTOS.filter((el) => {
      if (categoria !== 'todas' && el.categoria !== categoria) return false;
      if (!q) return true;
      if (normalizar(el.simbolo) === q) return true;
      if (normalizar(el.simbolo).startsWith(q)) return true;
      if (normalizar(el.nombre).includes(q)) return true;
      if (el.sinonimos.some((s) => normalizar(s).includes(q))) return true;
      if (el.estados.some((e) => normalizar(e.ejemplo).includes(q))) return true;
      return false;
    });
  }, [busqueda, categoria]);

  const elementosPositivos = useMemo(
    () => ELEMENTOS.filter((el) => el.estados.some((e) => e.valor > 0)),
    [],
  );
  const elementosNegativos = useMemo(
    () => ELEMENTOS.filter((el) => el.estados.some((e) => e.valor < 0)),
    [],
  );

  const elPos = ELEMENTOS.find((e) => e.simbolo === simboloPos) ?? elementosPositivos[0];
  const elNeg = ELEMENTOS.find((e) => e.simbolo === simboloNeg) ?? elementosNegativos[0];

  const opcionesPos = elPos.estados.filter((e) => e.valor > 0);
  // El oxígeno con −1 (peróxidos) se excluye: el grupo O₂²⁻ es una unidad y sus
  // subíndices no se simplifican, así que no sigue la regla del intercambio.
  const opcionesNeg = elNeg.estados.filter(
    (e) => e.valor < 0 && !(elNeg.simbolo === 'O' && e.valor === -1),
  );

  const compuesto = formularBinario(elPos, estadoPos, elNeg, estadoNeg);

  const cambiarElementoPos = (simbolo: string) => {
    const nuevo = ELEMENTOS.find((e) => e.simbolo === simbolo);
    if (!nuevo) return;
    const positivos = nuevo.estados.filter((e) => e.valor > 0);
    const preferido = positivos.find((e) => e.masComun) ?? positivos[0];
    setSimboloPos(simbolo);
    setEstadoPos(preferido ? preferido.valor : 1);
  };

  const cambiarElementoNeg = (simbolo: string) => {
    const nuevo = ELEMENTOS.find((e) => e.simbolo === simbolo);
    if (!nuevo) return;
    const negativos = nuevo.estados.filter((e) => e.valor < 0);
    const preferido = negativos.find((e) => e.masComun) ?? negativos[0];
    setSimboloNeg(simbolo);
    setEstadoNeg(preferido ? preferido.valor : -1);
  };

  // ── Ficha de búsqueda de aula ──────────────────────────────────────
  // Las 12 preguntas son FIJAS y numeradas para que un profesor pueda asignarlas por su
  // número («resuelve la 3, la 7 y la 11»). La pestaña de práctica genera otra distinta a
  // partir de una semilla, y la semilla se escribe en pantalla para poder dictarla igual.
  const [pestanaAula, setPestanaAula] = useState<'preguntas' | 'practica'>('preguntas');
  const [casoActivo, setCasoActivo] = useState(1);
  const [respuestaAula, setRespuestaAula] = useState('');
  const [veredictoAula, setVeredictoAula] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [pistaAbierta, setPistaAbierta] = useState(false);
  const [pasosAbiertos, setPasosAbiertos] = useState(false);

  // Semilla inicial fija: con Math.random() aquí, el servidor y el navegador pintarían
  // preguntas distintas y la hidratación de React no cuadraría.
  const [semillaPractica, setSemillaPractica] = useState(1);
  const [respuestaPractica, setRespuestaPractica] = useState('');
  const [veredictoPractica, setVeredictoPractica] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [pasosPracticaAbiertos, setPasosPracticaAbiertos] = useState(false);

  const caso = CASOS.find((c) => c.id === casoActivo) ?? CASOS[0];
  const preguntaPractica = useMemo(() => generarPreguntaAleatoria(semillaPractica), [semillaPractica]);

  const elegirCaso = (id: number) => {
    setCasoActivo(id);
    setRespuestaAula('');
    setVeredictoAula(null);
    setPistaAbierta(false);
    setPasosAbiertos(false);
  };

  const comprobarCaso = () => setVeredictoAula(comprobarRespuesta(respuestaAula, caso));

  const comprobarPractica = () =>
    setVeredictoPractica(comprobarRespuesta(respuestaPractica, preguntaPractica));

  const otraPregunta = () => {
    setSemillaPractica(Math.floor(Math.random() * 99999) + 1);
    setRespuestaPractica('');
    setVeredictoPractica(null);
    setPasosPracticaAbiertos(false);
  };

  const etiquetaCategoria = (id: CategoriaId): string =>
    CATEGORIAS.find((c) => c.id === id)?.etiqueta ?? '';

  const colorCategoria = (id: CategoriaId): string =>
    CATEGORIAS.find((c) => c.id === id)?.color ?? '#7FB3D3';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ═══════════ HERO ═══════════ */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚗️</span> Tabla de Valencias y Números de Oxidación
        </h1>
        <p className={styles.subtitle}>
          Busca un elemento y consulta al instante con qué números de oxidación actúa,
          con ejemplos de compuestos reales, iones poliatómicos, las tres nomenclaturas y un
          formulador de compuestos binarios.
        </p>
      </header>

      <LegalNotice />

      {/*
        Trazabilidad de los datos (hallazgo 931). Las 51 fichas, sus estados de oxidación, los
        ejemplos y los 20 iones poliatómicos se presentaban sin fuente, sin edición de
        referencia y sin fecha: el único rastro era un comentario del código que el visitante
        no ve. Los datos estaban BIEN —se comprobaron elemento a elemento—, pero sin declarar
        contra qué no hay forma de contrastar las decisiones legítimas pero opinables, como
        omitir el Fe(VI) o dar el +3 del bromo por poco frecuente. En material de apoyo de un
        portal educativo, saber de dónde sale un dato es parte de lo que se enseña.
      */}
      <DataReference
        normativa="Estados de oxidación y nomenclatura"
        fuente="IUPAC, Nomenclature of Inorganic Chemistry (Red Book, 2005) · CRC Handbook of Chemistry and Physics"
        verificado="2026-09-18"
        urlOficial="https://iupac.org/what-we-do/books/redbook/"
        nota="Los estados que se listan son los que estas fuentes recogen como habituales; los marcados «poco frecuente» existen pero rara vez se piden en secundaria. La nomenclatura tradicional no es IUPAC: se mantiene porque sigue viva en el aula y en la industria, y aquí aparece siempre junto a la sistemática y a la de Stock."
      />

      {/* ═══════════ ACLARACIÓN VALENCIA vs Nº OXIDACIÓN ═══════════ */}
      <div className={styles.aclaracionBox}>
        <h2>
          <span aria-hidden="true">🔎</span> Valencia y número de oxidación no son lo mismo
        </h2>
        <p>
          La <strong>valencia</strong> es la capacidad de combinación de un átomo —cuántos enlaces
          forma— y se escribe <strong>sin signo</strong>. El <strong>número de oxidación</strong> es
          una convención contable: la carga que tendría ese átomo si todos sus enlaces fueran
          iónicos, y siempre lleva <strong>signo</strong>. En el agua (H₂O) el oxígeno tiene valencia 2
          y número de oxidación −2; en el agua oxigenada (H₂O₂) sigue teniendo valencia 2, pero su
          número de oxidación pasa a −1.
        </p>
        <p className={styles.aclaracionNota}>
          Casi todo el mundo dice «tabla de valencias» cuando en realidad busca los números de
          oxidación. Es lo que encontrarás aquí, con la valencia indicada aparte en cada elemento.
        </p>
      </div>

      {/* ═══════════ BUSCADOR + FILTROS ═══════════ */}
      <section className={styles.buscadorPanel} aria-label="Buscador de elementos">
        <div className={styles.buscadorCampo}>
          <label htmlFor="buscador-elemento" className={styles.buscadorLabel}>
            Busca un elemento por símbolo, nombre o nombre tradicional
          </label>
          <input
            id="buscador-elemento"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="hierro, Fe, ferroso, manganeso, cloro…"
            autoComplete="off"
            inputMode="search"
          />
        </div>

        <div className={styles.filtrosBotones} role="group" aria-label="Filtrar por familia">
          <button
            type="button"
            className={`${styles.btnFiltro} ${categoria === 'todas' ? styles.btnFiltroActivo : ''}`}
            aria-pressed={categoria === 'todas'}
            onClick={() => setCategoria('todas')}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.btnFiltro} ${categoria === cat.id ? styles.btnFiltroActivo : ''}`}
              aria-pressed={categoria === cat.id}
              onClick={() => setCategoria(cat.id)}
            >
              {cat.corta}
            </button>
          ))}
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          {elementosFiltrados.length === ELEMENTOS.length
            ? `${ELEMENTOS.length} elementos en la tabla`
            : `${elementosFiltrados.length} de ${ELEMENTOS.length} elementos`}
        </p>

        {/*
          Alcance declarado (21/09/2026). Hasta hoy el título de la página prometía «todos los
          elementos» y la tabla trae 51 de los 118: los que se formulan en el aula. Nadie ve el
          hueco hasta que busca un elemento que no está, y entonces no sabe si se ha equivocado
          al escribir o si la tabla no lo tiene. Decirlo antes cuesta una línea.
        */}
        <p className={styles.alcance}>
          Están los {ELEMENTOS.length} elementos que se formulan en secundaria y bachillerato: los
          grupos principales y los metales de transición de uso corriente. No incluye lantánidos,
          actínidos ni transuránicos, y de los grupos principales faltan los cinco radiactivos
          que no se formulan en el aula: polonio, astato, radón, francio y radio.
        </p>

        <div className={styles.leyendaChips}>
          <span className={`${styles.chip} ${styles.chipComun}`}>+3</span>
          <span className={styles.leyendaTexto}>estado más frecuente del elemento</span>
          <span className={`${styles.chip} ${styles.chipRaro}`}>+3</span>
          <span className={styles.leyendaTexto}>estado poco frecuente</span>
        </div>
      </section>

      {/* ═══════════ TABLA DE ELEMENTOS ═══════════ */}
      <section className={styles.elementosLista} aria-label="Elementos y sus números de oxidación">
        {elementosFiltrados.length === 0 && (
          <p className={styles.sinResultados}>
            No hay ningún elemento que coincida con «{busqueda}». Prueba con el símbolo (Fe), el
            nombre (hierro) o el nombre tradicional (férrico). Si buscas un lantánido, un actínido,
            un metal de transición poco habitual (titanio, wolframio, molibdeno…) o uno de los
            cinco radiactivos de los grupos principales (polonio, astato, radón, francio, radio),
            no está en esta tabla: recoge los {ELEMENTOS.length} elementos que se formulan en el aula.
          </p>
        )}

        {elementosFiltrados.map((el) => {
          const abierto = expandido === el.simbolo;
          return (
            <article key={el.simbolo} className={styles.elementoFila}>
              <button
                type="button"
                className={styles.elementoCabecera}
                aria-expanded={abierto}
                onClick={() => setExpandido(abierto ? null : el.simbolo)}
              >
                <span
                  className={styles.simboloBox}
                  style={{ background: colorCategoria(el.categoria) }}
                >
                  <span className={styles.simboloZ}>{el.z}</span>
                  <span className={styles.simboloTexto}>{el.simbolo}</span>
                </span>

                <span className={styles.elementoIdent}>
                  <span className={styles.elementoNombre}>{el.nombre}</span>
                  <span className={styles.elementoMeta}>
                    {etiquetaCategoria(el.categoria)} · Valencia {el.valencias}
                  </span>
                </span>

                <span className={styles.chipsEstados}>
                  {el.estados.map((est) => (
                    <span
                      key={est.valor}
                      className={`${styles.chip} ${est.frecuente ? styles.chipHabitual : styles.chipRaro} ${est.masComun ? styles.chipComun : ''}`}
                      title={
                        est.masComun
                          ? 'Estado más frecuente'
                          : est.frecuente
                            ? 'Estado habitual'
                            : 'Estado poco frecuente'
                      }
                    >
                      {formatearEstado(est.valor)}
                    </span>
                  ))}
                </span>

                <span className={styles.flecha} aria-hidden="true">
                  {abierto ? '▲' : '▼'}
                </span>
              </button>

              {abierto && (
                <div className={styles.elementoDetalle}>
                  {el.nota && <p className={styles.detalleNota}>{el.nota}</p>}

                  <h3 className={styles.detalleTitulo}>Estados de oxidación con ejemplos reales</h3>
                  <ul className={styles.detalleEstados}>
                    {el.estados.map((est) => (
                      <li key={est.valor} className={styles.detalleEstado}>
                        <span
                          className={`${styles.chip} ${est.frecuente ? styles.chipHabitual : styles.chipRaro} ${est.masComun ? styles.chipComun : ''}`}
                        >
                          {formatearEstado(est.valor)}
                        </span>
                        <span className={styles.detalleEjemplo}>
                          <strong>{est.ejemplo}</strong> — {est.nombreEjemplo}
                          {est.masComun && <em className={styles.detalleBadge}> el más frecuente</em>}
                          {!est.frecuente && <em className={styles.detalleBadgeRaro}> poco frecuente</em>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {el.tradicional && Object.keys(el.tradicional).length > 0 && (
                    <>
                      <h3 className={styles.detalleTitulo}>Nombre tradicional según el estado</h3>
                      {/*
                        Los ejemplos se eligen según el elemento SEA O NO metal (hallazgo 930).
                        La plantilla fija «óxido X y cloruro X» funciona con los metales —óxido
                        férrico, cloruro férrico— y produce disparates con los no metales: la
                        ficha del cloro llegaba a ofrecer «cloruro hipocloroso», un cloruro de sí
                        mismo. Afectaba a las 13 fichas de no metal con nomenclatura tradicional.
                        Un no metal forma anhídridos y, con agua, oxácidos: esos son sus ejemplos.

                        ⚠️ 2026-09-21 (hallazgo 1064 del Inspector): sustituir una plantilla fija
                        por otra acertaba en 12 de los 13, y fallaba en el carbono con +2: el
                        anhídrido carbonoso sí es el CO en tradicional, pero el ácido carbonoso
                        (H₂CO₂) que la plantilla deriva no es una sustancia que exista. De ahí
                        SIN_OXACIDO: donde el anhídrido no da ácido, se ofrece solo el anhídrido.
                      */}
                      <ul className={styles.detalleTradicional}>
                        {Object.entries(el.tradicional).map(([valor, adjetivo]) => (
                          <li key={valor}>
                            <span className={styles.chipMini}>{formatearEstado(Number(valor))}</span>
                            <span>
                              <strong>{adjetivo}</strong> — por ejemplo,{' '}
                              {!NO_METALES_TRADICIONALES.includes(el.simbolo)
                                ? `óxido ${adjetivo} y cloruro ${adjetivo}`
                                : SIN_OXACIDO[`${el.simbolo}${valor}`]
                                  ? `anhídrido ${adjetivo} (el ácido correspondiente no existe)`
                                  : `anhídrido ${adjetivo} y ácido ${adjetivo}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <p className={styles.detalleGrupo}>
                    {el.grupo} · Número atómico {el.z} · Valencia {el.valencias}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* ═══════════ FORMULADOR DE COMPUESTOS BINARIOS ═══════════ */}
      <section className={styles.formuladorPanel} aria-label="Formulador de compuestos binarios">
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">🧪</span> Formulador de compuestos binarios
        </h2>
        <p className={styles.seccionSubtitulo}>
          Elige los dos elementos y sus números de oxidación. La herramienta intercambia las
          valencias, simplifica los subíndices y devuelve la fórmula con sus tres nombres.
        </p>

        <div className={styles.formuladorGrid}>
          <div className={styles.formuladorCampo}>
            <label htmlFor="elemento-positivo">Elemento con número de oxidación positivo</label>
            <select
              id="elemento-positivo"
              className={styles.select}
              value={simboloPos}
              onChange={(e) => cambiarElementoPos(e.target.value)}
            >
              {elementosPositivos.map((el) => (
                <option key={el.simbolo} value={el.simbolo}>
                  {el.simbolo} — {el.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formuladorCampo}>
            <label htmlFor="estado-positivo">Su número de oxidación</label>
            <select
              id="estado-positivo"
              className={styles.select}
              value={estadoPos}
              onChange={(e) => setEstadoPos(Number(e.target.value))}
            >
              {opcionesPos.map((est) => (
                <option key={est.valor} value={est.valor}>
                  {formatearEstado(est.valor)}
                  {est.masComun ? ' (el más frecuente)' : est.frecuente ? '' : ' (poco frecuente)'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formuladorCampo}>
            <label htmlFor="elemento-negativo">Elemento con número de oxidación negativo</label>
            <select
              id="elemento-negativo"
              className={styles.select}
              value={simboloNeg}
              onChange={(e) => cambiarElementoNeg(e.target.value)}
            >
              {elementosNegativos.map((el) => (
                <option key={el.simbolo} value={el.simbolo}>
                  {el.simbolo} — {el.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formuladorCampo}>
            <label htmlFor="estado-negativo">Su número de oxidación</label>
            <select
              id="estado-negativo"
              className={styles.select}
              value={estadoNeg}
              onChange={(e) => setEstadoNeg(Number(e.target.value))}
            >
              {opcionesNeg.map((est) => (
                <option key={est.valor} value={est.valor}>
                  {formatearEstado(est.valor)}
                  {est.masComun ? ' (el más frecuente)' : est.frecuente ? '' : ' (poco frecuente)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {compuesto ? (
          <div className={styles.resultadoFormula} role="status" aria-live="polite">
            <p className={styles.formulaGrande}>
              {compuesto.partes.map((p, i) => (
                <span key={`${p.simbolo}-${i}`}>
                  {p.simbolo}
                  {p.sub > 1 && <sub>{p.sub}</sub>}
                </span>
              ))}
            </p>

            <dl className={styles.nombresLista}>
              <div className={styles.nombreItem}>
                <dt>Nomenclatura sistemática</dt>
                <dd>{compuesto.sistematica}</dd>
              </div>
              <div className={styles.nombreItem}>
                <dt>Nomenclatura de Stock</dt>
                <dd>{compuesto.stock}</dd>
              </div>
              <div className={styles.nombreItem}>
                <dt>Nomenclatura tradicional</dt>
                <dd>{compuesto.tradicional}</dd>
              </div>
              {compuesto.comun && (
                <div className={styles.nombreItem}>
                  <dt>Nombre común</dt>
                  <dd>{compuesto.comun}</dd>
                </div>
              )}
            </dl>

            <p className={styles.explicacionCruce}>
              Se cruzan los valores absolutos ({formatearEstado(estadoPos)} y{' '}
              {formatearEstado(estadoNeg)}) y se simplifican los subíndices dividiendo por su máximo
              común divisor.
            </p>

            {compuesto.advertencia && (
              <p className={styles.avisoFormula}>
                <span aria-hidden="true">⚠️</span> {compuesto.advertencia}
              </p>
            )}
          </div>
        ) : (
          <p className={styles.sinResultados}>
            Elige dos elementos distintos, uno con estado positivo y otro con estado negativo.
          </p>
        )}

        <p className={styles.notaFormulador}>
          <span aria-hidden="true">ℹ️</span> <strong>Esto formula, no predice.</strong> El
          intercambio de valencias dice cómo SE ESCRIBIRÍA un compuesto de esos dos elementos,
          no si ese compuesto existe: con algunas combinaciones devuelve una fórmula
          impecable de una sustancia que nadie ha preparado. Cuando la regla es enunciable
          —los gases nobles, el mercurio(I)— lo avisa; fuera de esos casos, comprueba el
          compuesto antes de darlo por bueno.
        </p>
        <p className={styles.notaFormulador}>
          <span aria-hidden="true">ℹ️</span> Los peróxidos (H₂O₂, Na₂O₂) no aparecen aquí: el grupo
          O₂²⁻ es una unidad y sus subíndices no se simplifican, así que no siguen la regla del
          intercambio. Tampoco se incluyen los compuestos ternarios ni las sales de oxoácidos.
        </p>
      </section>

      {/* ═══════════ LAS TRES NOMENCLATURAS ═══════════ */}
      <section className={styles.nomenclaturaPanel} aria-label="Las tres nomenclaturas de la IUPAC">
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">🏷️</span> Las tres nomenclaturas, sobre los mismos ejemplos
        </h2>
        <p className={styles.seccionSubtitulo}>
          Aquí es donde se pierde casi todo el mundo: el mismo compuesto tiene tres nombres válidos
          según el sistema que uses. Compara columna a columna.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Fórmula</th>
                <th scope="col">Estado de oxidación</th>
                <th scope="col">Sistemática (prefijos)</th>
                <th scope="col">Stock (números romanos)</th>
                <th scope="col">Tradicional (-oso / -ico)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>CO</strong></td>
                <td>C: +2</td>
                <td>monóxido de carbono</td>
                <td>óxido de carbono(II)</td>
                <td>anhídrido carbonoso</td>
              </tr>
              <tr>
                <td><strong>CO₂</strong></td>
                <td>C: +4</td>
                <td>dióxido de carbono</td>
                <td>óxido de carbono(IV)</td>
                <td>anhídrido carbónico</td>
              </tr>
              <tr>
                <td><strong>FeO</strong></td>
                <td>Fe: +2</td>
                <td>monóxido de hierro</td>
                <td>óxido de hierro(II)</td>
                <td>óxido ferroso</td>
              </tr>
              <tr>
                <td><strong>Fe₂O₃</strong></td>
                <td>Fe: +3</td>
                <td>trióxido de dihierro</td>
                <td>óxido de hierro(III)</td>
                <td>óxido férrico</td>
              </tr>
              <tr>
                <td><strong>SO₂</strong></td>
                <td>S: +4</td>
                <td>dióxido de azufre</td>
                <td>óxido de azufre(IV)</td>
                <td>anhídrido sulfuroso</td>
              </tr>
              <tr>
                <td><strong>SO₃</strong></td>
                <td>S: +6</td>
                <td>trióxido de azufre</td>
                <td>óxido de azufre(VI)</td>
                <td>anhídrido sulfúrico</td>
              </tr>
              <tr>
                <td><strong>Cl₂O</strong></td>
                <td>Cl: +1</td>
                <td>monóxido de dicloro</td>
                <td>óxido de cloro(I)</td>
                <td>anhídrido hipocloroso</td>
              </tr>
              <tr>
                <td><strong>Cl₂O₇</strong></td>
                <td>Cl: +7</td>
                <td>heptaóxido de dicloro</td>
                <td>óxido de cloro(VII)</td>
                <td>anhídrido perclórico</td>
              </tr>
              <tr>
                <td><strong>CuCl</strong></td>
                <td>Cu: +1</td>
                <td>monocloruro de cobre</td>
                <td>cloruro de cobre(I)</td>
                <td>cloruro cuproso</td>
              </tr>
              <tr>
                <td><strong>CuCl₂</strong></td>
                <td>Cu: +2</td>
                <td>dicloruro de cobre</td>
                <td>cloruro de cobre(II)</td>
                <td>cloruro cúprico</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.sufijosGrid}>
          <div className={styles.sufijoCard}>
            <h3>Con 1 estado de oxidación</h3>
            <p>
              Solo el sufijo <strong>-ico</strong> (o directamente «de + nombre»): óxido sódico u
              óxido de sodio. En Stock no se escribe número romano, porque no hay ambigüedad.
            </p>
          </div>
          <div className={styles.sufijoCard}>
            <h3>Con 2 estados</h3>
            <p>
              <strong>-oso</strong> para el menor y <strong>-ico</strong> para el mayor:
              ferroso (+2) / férrico (+3), cuproso (+1) / cúprico (+2), plumboso (+2) / plúmbico (+4).
            </p>
          </div>
          <div className={styles.sufijoCard}>
            <h3>Con 3 estados</h3>
            <p>
              <strong>hipo—oso</strong>, <strong>-oso</strong> e <strong>-ico</strong> de menor a
              mayor. Se usa, por ejemplo, en algunos oxoácidos del grupo 16.
            </p>
          </div>
          <div className={styles.sufijoCard}>
            <h3>Con 4 estados</h3>
            <p>
              <strong>hipo—oso</strong>, <strong>-oso</strong>, <strong>-ico</strong> y{' '}
              <strong>per—ico</strong>. Caso típico de los halógenos: hipocloroso (+1), cloroso (+3),
              clórico (+5), perclórico (+7).
            </p>
          </div>
        </div>

        <div className={styles.prefijosBox}>
          <h3>Prefijos multiplicadores de la nomenclatura sistemática</h3>
          <p className={styles.prefijosLista}>
            1 mono- · 2 di- · 3 tri- · 4 tetra- · 5 penta- · 6 hexa- · 7 hepta- · 8 octa- ·
            9 nona- · 10 deca-
          </p>
          <p>
            El prefijo <strong>mono-</strong> se omite casi siempre; se conserva cuando hace falta
            distinguir dos compuestos del mismo par de elementos, como en monóxido de carbono (CO)
            frente a dióxido de carbono (CO₂).
          </p>
        </div>
      </section>

      {/* ═══════════ IONES POLIATÓMICOS ═══════════ */}
      <section className={styles.ionesPanel} aria-label="Iones poliatómicos frecuentes">
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">⚛️</span> Iones poliatómicos frecuentes
        </h2>
        <p className={styles.seccionSubtitulo}>
          Grupos de átomos que se comportan como una unidad con carga propia. Conviene sabérselos de
          memoria: aparecen en casi todas las sales de los ejercicios.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Ion</th>
                <th scope="col">Fórmula</th>
                <th scope="col">Carga</th>
                <th scope="col">Átomo central</th>
                <th scope="col">Dónde aparece</th>
              </tr>
            </thead>
            <tbody>
              {IONES.map((ion) => (
                <tr key={ion.formula}>
                  <td><strong>{ion.nombre}</strong></td>
                  <td>{ion.formula}</td>
                  <td>{ion.carga}</td>
                  <td>{ion.central}</td>
                  <td>{ion.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════ FICHA DE BÚSQUEDA DE AULA ═══════════ */}
      {/*
        Tarea asignable (21/09/2026). No es un cuestionario de resolver: las 12 preguntas se
        contestan LOCALIZANDO el dato en esta misma página, que es lo que un profesor quiere
        que el alumno aprenda a hacer con una tabla de consulta. Son fijas y numeradas para
        que la consigna «resuelve la 3, la 7 y la 11» signifique lo mismo para toda la clase.
        La respuesta de cada una la lee `casos.ts` de los MISMOS datos que pinta la tabla.
      */}
      <section id="casos-aula" className={styles.aulaPanel} aria-label="Ficha de búsqueda para el aula">
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">🎒</span> Ficha de búsqueda para clase
        </h2>
        <p className={styles.seccionSubtitulo}>
          {TOTAL_CASOS} preguntas numeradas que no se resuelven calculando, sino buscando el dato
          en esta misma página. Son siempre las mismas para todo el mundo, así que valen como
          tarea: «entra y resuelve la 3, la 7 y la 11».
        </p>
        <p className={styles.aulaConvenio}>
          <span aria-hidden="true">📏</span> {NOTA_CONVENIO}
        </p>

        <div className={styles.aulaTabs} role="tablist" aria-label="Modo de la ficha">
          <button
            type="button"
            role="tab"
            id="aula-tab-preguntas"
            aria-selected={pestanaAula === 'preguntas'}
            aria-controls="aula-panel-preguntas"
            className={`${styles.aulaTab} ${pestanaAula === 'preguntas' ? styles.aulaTabActiva : ''}`}
            onClick={() => setPestanaAula('preguntas')}
          >
            Las {TOTAL_CASOS} preguntas
          </button>
          <button
            type="button"
            role="tab"
            id="aula-tab-practica"
            aria-selected={pestanaAula === 'practica'}
            aria-controls="aula-panel-practica"
            className={`${styles.aulaTab} ${pestanaAula === 'practica' ? styles.aulaTabActiva : ''}`}
            onClick={() => setPestanaAula('practica')}
          >
            Práctica al azar
          </button>
        </div>

        {pestanaAula === 'preguntas' && (
          <div id="aula-panel-preguntas" role="tabpanel" aria-labelledby="aula-tab-preguntas">
            <div className={styles.aulaSelector} role="group" aria-label="Elegir pregunta">
              {CASOS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.aulaNumero} ${casoActivo === c.id ? styles.aulaNumeroActivo : ''}`}
                  aria-pressed={casoActivo === c.id}
                  aria-label={`Pregunta ${c.id}: ${c.titulo}`}
                  onClick={() => elegirCaso(c.id)}
                >
                  {c.id}
                </button>
              ))}
            </div>

            <div className={styles.aulaCaso}>
              <p className={styles.aulaCasoCabecera}>
                <span className={styles.aulaCasoNumero}>Pregunta {caso.id}</span>
                <span className={styles.aulaEtiquetaTipo}>
                  {caso.categoria === 'localizar'
                    ? 'localizar un dato'
                    : caso.categoria === 'comparar'
                      ? 'comparar dos fichas'
                      : 'caso aplicado'}
                </span>
              </p>
              <h3 className={styles.aulaCasoTitulo}>{caso.titulo}</h3>
              <p className={styles.aulaEnunciado}>{caso.enunciado}</p>

              <div className={styles.aulaCampo}>
                <label htmlFor="aula-respuesta" className={styles.aulaLabel}>
                  {caso.etiquetaRespuesta}
                </label>
                <input
                  id="aula-respuesta"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  className={styles.aulaInput}
                  value={respuestaAula}
                  placeholder="Escribe lo que encuentres en la tabla"
                  onChange={(e) => setRespuestaAula(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') comprobarCaso();
                  }}
                />
              </div>

              <div className={styles.aulaAcciones}>
                <button type="button" className={styles.btnComprobar} onClick={comprobarCaso}>
                  Comprobar
                </button>
                <button
                  type="button"
                  className={styles.btnAulaSecundario}
                  aria-expanded={pistaAbierta}
                  aria-controls="aula-pista"
                  onClick={() => setPistaAbierta(!pistaAbierta)}
                >
                  {pistaAbierta ? 'Ocultar la pista' : 'Ver la pista'}
                </button>
                <button
                  type="button"
                  className={styles.btnAulaSecundario}
                  aria-expanded={pasosAbiertos}
                  aria-controls="aula-pasos"
                  onClick={() => setPasosAbiertos(!pasosAbiertos)}
                >
                  {pasosAbiertos ? 'Ocultar dónde mirar' : 'Dónde mirar'}
                </button>
              </div>

              {veredictoAula && (
                <p
                  className={`${styles.aulaVeredicto} ${veredictoAula.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
                  role="alert"
                  aria-live="polite"
                >
                  {veredictoAula.motivo}
                </p>
              )}

              {pistaAbierta && (
                <p id="aula-pista" className={styles.aulaPista}>
                  {caso.pista}
                </p>
              )}

              {pasosAbiertos && (
                <div id="aula-pasos" className={styles.aulaPasos}>
                  <h4 className={styles.aulaPasosTitulo}>El recorrido por la tabla</h4>
                  <ol className={styles.aulaPasosLista}>
                    {caso.pasos.map((paso, i) => (
                      <li key={i}>{paso}</li>
                    ))}
                  </ol>
                  <p className={styles.aulaDato}>
                    <strong>{caso.etiquetaRespuesta}:</strong> {caso.respuesta}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {pestanaAula === 'practica' && (
          <div id="aula-panel-practica" role="tabpanel" aria-labelledby="aula-tab-practica">
            <div className={styles.aulaCaso}>
              <p className={styles.aulaCasoCabecera}>
                <span className={styles.aulaCasoNumero}>Pregunta de práctica</span>
                <span className={styles.aulaSemilla}>
                  semilla {formatNumber(preguntaPractica.semilla, 0)}
                </span>
              </p>
              <p className={styles.aulaEnunciado}>{preguntaPractica.enunciado}</p>

              <div className={styles.aulaCampo}>
                <label htmlFor="aula-respuesta-practica" className={styles.aulaLabel}>
                  {preguntaPractica.etiquetaRespuesta}
                </label>
                <input
                  id="aula-respuesta-practica"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  className={styles.aulaInput}
                  value={respuestaPractica}
                  placeholder="Escribe lo que encuentres en la tabla"
                  onChange={(e) => setRespuestaPractica(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') comprobarPractica();
                  }}
                />
              </div>

              <div className={styles.aulaAcciones}>
                <button type="button" className={styles.btnComprobar} onClick={comprobarPractica}>
                  Comprobar
                </button>
                <button type="button" className={styles.btnAulaSecundario} onClick={otraPregunta}>
                  Otra pregunta
                </button>
                <button
                  type="button"
                  className={styles.btnAulaSecundario}
                  aria-expanded={pasosPracticaAbiertos}
                  aria-controls="aula-pasos-practica"
                  onClick={() => setPasosPracticaAbiertos(!pasosPracticaAbiertos)}
                >
                  {pasosPracticaAbiertos ? 'Ocultar dónde mirar' : 'Dónde mirar'}
                </button>
              </div>

              {veredictoPractica && (
                <p
                  className={`${styles.aulaVeredicto} ${veredictoPractica.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
                  role="alert"
                  aria-live="polite"
                >
                  {veredictoPractica.motivo}
                </p>
              )}

              {pasosPracticaAbiertos && (
                <div id="aula-pasos-practica" className={styles.aulaPasos}>
                  <h4 className={styles.aulaPasosTitulo}>El recorrido por la tabla</h4>
                  <ol className={styles.aulaPasosLista}>
                    {preguntaPractica.pasos.map((paso, i) => (
                      <li key={i}>{paso}</li>
                    ))}
                  </ol>
                  <p className={styles.aulaDato}>
                    <strong>{preguntaPractica.etiquetaRespuesta}:</strong> {preguntaPractica.respuesta}
                  </p>
                </div>
              )}
            </div>

            <p className={styles.aulaNota}>
              Cada semilla da siempre la misma pregunta: si la dictas en voz alta, toda la clase
              trabaja sobre la misma. Los datos salen de esta tabla, no de una lista aparte.
            </p>
          </div>
        )}
      </section>

      {/* ═══════════ CONTENIDO EDUCATIVO v2.0 ═══════════ */}
      <EducationalSection
        icon="📚"
        title="Entender las valencias, no memorizarlas"
        subtitle="De dónde salen los números de oxidación, cómo se deducen dentro de un compuesto y por qué la nomenclatura tradicional sigue viva"
      >
        {/* Introducción */}
        <section className={styles.introSection}>
          <h2>¿Por qué cada elemento tiene esos estados y no otros?</h2>
          <p>
            Los números de oxidación de los elementos representativos no son arbitrarios: salen de
            los <strong>electrones de valencia</strong>, los de la última capa. Un átomo tiende a
            quedarse con ocho electrones en esa capa (regla del octeto), la configuración de gas
            noble, porque es especialmente estable.
          </p>
          <p>
            Por eso el sodio, con un electrón de valencia, lo cede y queda en +1; el magnesio cede
            dos y queda en +2; el aluminio cede tres y queda en +3. Y por el otro extremo: al
            oxígeno le faltan dos electrones para el octeto, así que los capta y queda en −2; a los
            halógenos les falta uno, y quedan en −1. El número del grupo predice el estado con
            asombrosa fiabilidad: grupo 1 → +1, grupo 2 → +2, grupo 16 → −2, grupo 17 → −1.
          </p>
          <p>
            Los no metales de los grupos 14 a 17 tienen además estados <em>positivos</em> cuando se
            combinan con un elemento aún más electronegativo, casi siempre el oxígeno. El azufre
            capta electrones frente al hidrógeno (H₂S, −2) pero los cede frente al oxígeno
            (SO₃, +6). No es contradicción: el número de oxidación siempre se asigna comparando
            electronegatividades dentro de ese compuesto concreto.
          </p>

          <h2>¿Por qué los metales de transición tienen varios?</h2>
          <p>
            En los elementos del bloque d los orbitales <strong>3d y 4s tienen energías muy
            parecidas</strong>. Ceder uno, dos o cinco electrones cuesta cantidades de energía
            similares, así que el mismo metal puede formar iones distintos según con quién se
            combine y en qué condiciones. Por eso el manganeso recorre +2, +3, +4, +6 y +7, y el
            cromo +2, +3 y +6.
          </p>
          <p>
            Hay dos excepciones útiles de recordar dentro del bloque d: el <strong>zinc</strong> y el{' '}
            <strong>cadmio</strong> actúan solo con +2, porque su subcapa d está completa y no
            participa; y la <strong>plata</strong>, en la práctica escolar, solo con +1.
          </p>

          <h2>¿Por qué la nomenclatura tradicional sigue viva?</h2>
          <p>
            La IUPAC recomienda las nomenclaturas sistemática y de Stock, y desaconseja la
            tradicional desde hace décadas. Sin embargo, «ácido sulfúrico», «ácido nítrico»,
            «permanganato» o «sulfato ferroso» siguen escritos en etiquetas de reactivos, prospectos,
            legislación, catálogos industriales y libros. Cambiar un vocabulario que lleva dos siglos
            en circulación cuesta mucho más que publicar una recomendación.
          </p>
          <p>
            La consecuencia práctica es que necesitas <strong>leer</strong> las tres nomenclaturas
            aunque solo <strong>escribas</strong> en dos. Si en un examen te piden formular «sulfato
            férrico» y no sabes que «férrico» significa Fe(+3), el ejercicio se cae entero por un
            problema de vocabulario, no de química.
          </p>
        </section>

        {/* 1. Tabla comparativa */}
        <section className={styles.comparativaSection}>
          <h2>Comparativa: cuándo usar cada nomenclatura</h2>
          <p className={styles.comparativaSubtitle}>
            Las tres son correctas para leer; solo dos se recomiendan para escribir.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Criterio</th>
                  <th scope="col">Sistemática</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Tradicional</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cómo indica el estado</strong></td>
                  <td>Con prefijos que cuentan átomos (di-, tri-, tetra-)</td>
                  <td>Con número romano entre paréntesis</td>
                  <td>Con prefijos y sufijos (hipo-, -oso, -ico, per-)</td>
                </tr>
                <tr>
                  <td><strong>Recomendación IUPAC</strong></td>
                  <td><span aria-hidden="true">✅</span> Recomendada</td>
                  <td><span aria-hidden="true">✅</span> Recomendada</td>
                  <td><span aria-hidden="true">⚠️</span> Desaconsejada, pero tolerada</td>
                </tr>
                <tr>
                  <td><strong>Ventaja</strong></td>
                  <td>No hace falta saber el estado: basta contar átomos</td>
                  <td>Nombre corto y sin ambigüedad</td>
                  <td>Muy compacta y arraigada en el habla técnica</td>
                </tr>
                <tr>
                  <td><strong>Inconveniente</strong></td>
                  <td>Nombres largos (heptaóxido de dicloro)</td>
                  <td>Exige conocer el estado del elemento</td>
                  <td>Hay que memorizar raíces irregulares (ferroso, plúmbico)</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo con Fe₂O₃</strong></td>
                  <td>trióxido de dihierro</td>
                  <td>óxido de hierro(III)</td>
                  <td>óxido férrico</td>
                </tr>
                <tr>
                  <td><strong>Dónde la verás</strong></td>
                  <td>Libros de texto y exámenes actuales</td>
                  <td>Artículos científicos y fichas de seguridad</td>
                  <td>Etiquetas de reactivos, prospectos y normativa antigua</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Escenarios */}
        <section className={styles.escenariosSection}>
          <h2>Cuatro situaciones donde esta tabla resuelve el atasco</h2>
          <p className={styles.escenariosSubtitle}>
            Perfiles reales de quien llega buscando «tabla de valencias».
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📝</span>
                <h3>Secundaria (ESO): formular óxidos y sales binarias</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Te piden formular «óxido de aluminio». Buscas Al: actúa solo con +3. El oxígeno, −2.
                Cruzas: Al₂O₃. Un solo estado significa que no puede haber trampa.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Atajo:</strong> los elementos con un único estado (Na, Ca, Al, Zn, Ag, F) son
                los que conviene aprender primero; con ellos ya formulas media hoja de ejercicios.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚖️</span>
                <h3>Bachillerato o preparatoria: ajustar una redox</h3>
              </div>
              <p className={styles.escenarioDesc}>
                En la reacción del permanganato con Fe²⁺ necesitas los estados antes y después: el
                Mn pasa de +7 (MnO₄⁻) a +2 (Mn²⁺), y el hierro de +2 a +3. Sin esos números no hay
                semirreacciones ni electrones que igualar.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Truco:</strong> escribe siempre el estado encima de cada símbolo antes de
                plantear las semirreacciones. Ahorra la mitad de los errores.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h3>Examen de admisión universitaria</h3>
              </div>
              <p className={styles.escenarioDesc}>
                La formulación suele valer entre medio punto y un punto entero, y se resuelve en dos
                minutos si te sabes las valencias. Es la parte del examen con mejor relación entre
                nota y tiempo de estudio.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Prioriza:</strong> los 20 elementos más frecuentes y los 10 iones
                poliatómicos más repetidos cubren la práctica totalidad de lo que cae.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
                <h3>Laboratorio: leer la etiqueta de un reactivo</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Un frasco dice «sulfato ferroso heptahidratado». Necesitas saber que ferroso es
                Fe(+2) para escribir FeSO₄·7H₂O y calcular la masa molar de la disolución que vas a
                preparar.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Ojo:</strong> muchas etiquetas comerciales siguen usando nomenclatura
                tradicional aunque el prospecto técnico use Stock.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Valencia y número de oxidación son sinónimos?</p>
              <p className={styles.faqAnswer}>
                No. La valencia cuenta enlaces y no lleva signo; el número de oxidación es una
                convención contable y sí lo lleva. En el etano (C₂H₆) cada carbono tiene valencia 4,
                pero su número de oxidación es −3. Coinciden en muchos compuestos sencillos, y de ahí
                viene la confusión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿El oxígeno siempre vale −2?</p>
              <p className={styles.faqAnswer}>
                Casi siempre, pero no. Vale −1 en los peróxidos (H₂O₂, Na₂O₂), −½ en los superóxidos
                (KO₂) y positivo únicamente frente al flúor, el único elemento más electronegativo
                que él: en OF₂ el oxígeno actúa con +2.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Y el hidrógeno?</p>
              <p className={styles.faqAnswer}>
                Vale +1 frente a los no metales (H₂O, HCl, NH₃) y −1 en los hidruros metálicos
                (NaH, CaH₂, LiAlH₄), donde el metal es menos electronegativo que él. Si en un
                compuesto ves hidrógeno junto a un metal alcalino o alcalinotérreo, el hidrógeno es
                negativo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Cuáles son los elementos más «tramposos»?</p>
              <p className={styles.faqAnswer}>
                El manganeso (+2, +3, +4, +6, +7) y el cromo (+2, +3, +6) por número de estados; el
                nitrógeno porque recorre de −3 a +5; y el plomo y el estaño porque su estado más
                estable es el contrario en cada uno (+2 en el plomo, +4 en el estaño).
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿El flúor puede ser positivo alguna vez?</p>
              <p className={styles.faqAnswer}>
                No. Es el elemento más electronegativo de toda la tabla, así que en cualquier
                compuesto siempre atrae los electrones y su número de oxidación es −1. Es la única
                regla de esta lista que no tiene excepciones.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Los gases nobles tienen valencia?</p>
              <p className={styles.faqAnswer}>
                Su estado normal es 0 porque ya tienen la capa completa. El helio, el neón y el argón
                no forman compuestos estables. El kriptón y sobre todo el xenón sí, pero solo con
                flúor y oxígeno: XeF₂, XeF₄, XeO₃, XeO₄.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Por qué el subíndice a veces se simplifica?</p>
              <p className={styles.faqAnswer}>
                Porque una fórmula empírica indica la proporción más simple. Al cruzar Ca(+2) con
                O(−2) sale Ca₂O₂, que se simplifica dividiendo por 2 y queda CaO. Excepción notable:
                los peróxidos (H₂O₂, Na₂O₂) no se simplifican, porque el ion peróxido O₂²⁻ es una
                unidad real.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Merece la pena memorizar la tabla entera?</p>
              <p className={styles.faqAnswer}>
                No. Los elementos representativos se deducen del grupo, así que solo hay que
                memorizar de verdad los metales de transición frecuentes (Fe, Cu, Mn, Cr, Co, Ni,
                Pb, Sn, Hg, Au) y los iones poliatómicos. Son unas 25 entradas, no cien.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guiaSection}>
          <h2>Cómo deducir el número de oxidación dentro de un compuesto</h2>
          <p className={styles.guiaSubtitle}>
            Siete pasos que funcionan siempre, con el ejemplo del dicromato de potasio (K₂Cr₂O₇).
          </p>
          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Un elemento libre vale 0</h3>
                <p>
                  Da igual cómo esté agrupado: Fe, O₂, Cl₂, P₄ y S₈ tienen todos número de oxidación
                  0. Si tu compuesto es un elemento puro, ya has terminado.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Coloca los elementos con estado fijo</h3>
                <p>
                  Grupo 1 → +1, grupo 2 → +2, aluminio → +3, flúor → −1. En K₂Cr₂O₇ el potasio es
                  +1 sin discusión posible.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Aplica la regla del oxígeno</h3>
                <p>
                  −2 salvo peróxidos (−1), superóxidos (−½) y compuestos con flúor (positivo). En
                  K₂Cr₂O₇ no hay enlaces O—O de peróxido, así que cada oxígeno vale −2.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Aplica la regla del hidrógeno</h3>
                <p>
                  +1 salvo en hidruros metálicos, donde vale −1. En este ejemplo no hay hidrógeno,
                  pero es el segundo anclaje más útil después del oxígeno.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Escribe la ecuación de suma</h3>
                <p>
                  La suma de todos los números de oxidación multiplicados por sus subíndices es 0 en
                  un compuesto neutro, o igual a la carga en un ion. Aquí:
                  2(+1) + 2·x + 7(−2) = 0.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Despeja la incógnita</h3>
                <p>
                  2 + 2x − 14 = 0 → 2x = 12 → x = +6. El cromo actúa con +6 en el dicromato, que es
                  precisamente por lo que es un oxidante tan fuerte.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Comprueba que el resultado es posible</h3>
                <p>
                  Vuelve a la tabla: ¿está +6 entre los estados del cromo? Sí. Si te sale un valor
                  que el elemento no tiene (por ejemplo Fe con +5), hay un error aritmético o has
                  copiado mal la fórmula.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.tipsSection}>
          <h2>Seis hábitos que aceleran la formulación</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🧭</div>
              <h3>Aprende por grupos, no por elementos</h3>
              <p>
                Memorizar «grupo 17 → −1 y +1, +3, +5, +7» cubre cloro, bromo y yodo de una vez. Son
                tres elementos por el precio de uno.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🎯</div>
              <h3>Empieza por el estado más frecuente</h3>
              <p>
                Si dudas, el estado marcado como más frecuente acierta en la mayoría de ejercicios:
                Fe(+3), Cu(+2), Mn(+2), Pb(+2), Sn(+4), N(+5).
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">✍️</div>
              <h3>Anota el estado encima del símbolo</h3>
              <p>
                Antes de nombrar o ajustar nada, escribe el número sobre cada elemento de la
                fórmula. Es medio segundo que evita la mitad de los fallos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🔁</div>
              <h3>Verifica siempre en los dos sentidos</h3>
              <p>
                Formula a partir del nombre y, después, vuelve a nombrar la fórmula que has escrito.
                Si no regresas al punto de partida, algo falla.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🧱</div>
              <h3>Trata los iones poliatómicos como bloques</h3>
              <p>
                El sulfato SO₄²⁻ funciona como una pieza única de carga −2. No lo desmontes: cruza
                su carga igual que harías con un elemento.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">📖</div>
              <h3>Lee las tres nomenclaturas, escribe en dos</h3>
              <p>
                Practica escribiendo en sistemática y Stock, pero entrena la lectura de la
                tradicional: la vas a encontrar en etiquetas y enunciados antiguos.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Warning box */}
        <div className={styles.warningBox}>
          <h2>
            <span aria-hidden="true">⚠️</span> Errores que cuestan puntos en el examen
          </h2>
          <ul className={styles.warningList}>
            <li>
              <strong>Dar al flúor un estado positivo:</strong> es el elemento más electronegativo
              de la tabla y siempre actúa con −1. Si tu ecuación te obliga a ponerle +1, el error
              está en otra parte de la fórmula.
            </li>
            <li>
              <strong>Poner el oxígeno a −2 en un peróxido:</strong> en H₂O₂ y Na₂O₂ cada oxígeno
              vale −1. Si aplicas −2 te saldrá un hidrógeno con +2, que no existe.
            </li>
            <li>
              <strong>Simplificar los subíndices de un peróxido:</strong> H₂O₂ no se reduce a HO. El
              ion peróxido O₂²⁻ es una unidad real y la fórmula debe reflejarlo.
            </li>
            <li>
              <strong>Confundir -oso con «el que actúa poco»:</strong> el sufijo -oso indica el
              estado <em>menor</em> de ese elemento, no el menos frecuente. El hierro ferroso (+2)
              es muy común.
            </li>
            <li>
              <strong>Olvidar el número romano en Stock cuando hace falta:</strong> «óxido de
              hierro» es ambiguo (FeO o Fe₂O₃). Escribe siempre el estado cuando el elemento tenga
              más de uno positivo.
            </li>
            <li>
              <strong>Escribir HgCl para el mercurio(I):</strong> en ese estado el mercurio existe
              como ion diatómico Hg₂²⁺, así que la fórmula correcta es Hg₂Cl₂.
            </li>
            <li>
              <strong>Aplicar la valencia con signo:</strong> la valencia no lo lleva. Decir
              «valencia −2 del oxígeno» mezcla los dos conceptos y suele restar en las preguntas
              teóricas.
            </li>
            <li>
              <strong>Inventar estados poco comunes:</strong> Fe(+6) o Cu(+3) existen en el
              laboratorio, pero no en un ejercicio de secundaria o bachillerato. Si te salen,
              revisa el planteamiento antes que la tabla.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-valencias')} />

      <ShareCard appName="tabla-valencias" />

      <Footer appName="tabla-valencias" />
    </div>
  );
}
