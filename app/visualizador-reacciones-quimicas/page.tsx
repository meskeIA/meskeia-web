'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ReaccionesQuimicas.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'queEs' | 'tipos' | 'balanceo' | 'diaDia';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'queEs', titulo: '¿Qué es?', icono: '⚗️', subtitulo: 'Reactivos → Productos' },
  { id: 'tipos', titulo: 'Tipos', icono: '🔬', subtitulo: '5 tipos fundamentales' },
  { id: 'balanceo', titulo: 'Balanceo', icono: '⚖️', subtitulo: 'Ecuaciones equilibradas' },
  { id: 'diaDia', titulo: 'Día a día', icono: '🏠', subtitulo: 'Química cotidiana' },
];

// ─────────────────────────────────────────────
// Colores de átomos (convención CPK)
// ─────────────────────────────────────────────

const COLORES_ATOMO: Record<string, { bg: string; texto: string; nombre: string }> = {
  H: { bg: '#FFFFFF', texto: '#333333', nombre: 'Hidrógeno' },
  O: { bg: '#E53935', texto: '#FFFFFF', nombre: 'Oxígeno' },
  C: { bg: '#616161', texto: '#FFFFFF', nombre: 'Carbono' },
  N: { bg: '#1565C0', texto: '#FFFFFF', nombre: 'Nitrógeno' },
  Fe: { bg: '#795548', texto: '#FFFFFF', nombre: 'Hierro' },
  Na: { bg: '#FF9800', texto: '#FFFFFF', nombre: 'Sodio' },
  Cl: { bg: '#4CAF50', texto: '#FFFFFF', nombre: 'Cloro' },
  S: { bg: '#FDD835', texto: '#333333', nombre: 'Azufre' },
};

// ─────────────────────────────────────────────
// Sección 1: ¿Qué es una Reacción Química?
// ─────────────────────────────────────────────

interface EjemploReaccion {
  titulo: string;
  reactivos: string;
  productos: string;
  atomosReactivos: string[];
  atomosProductos: string[];
  descripcion: string;
}

const EJEMPLO_BASICO: EjemploReaccion = {
  titulo: 'Formación de agua',
  reactivos: '2H₂ + O₂',
  productos: '2H₂O',
  atomosReactivos: ['H', 'H', 'H', 'H', 'O', 'O'],
  atomosProductos: ['H', 'H', 'O', 'H', 'H', 'O'],
  descripcion: '4 átomos de hidrógeno + 2 de oxígeno se reorganizan en 2 moléculas de agua',
};

interface CambioComparacion {
  tipo: string;
  icono: string;
  ejemplo: string;
  descripcion: string;
  esQuimico: boolean;
}

const CAMBIOS: CambioComparacion[] = [
  { tipo: 'Cambio físico', icono: '🧊', ejemplo: 'Hielo → Agua', descripcion: 'Las moléculas siguen siendo H₂O. Solo cambia cómo se organizan.', esQuimico: false },
  { tipo: 'Cambio químico', icono: '🔥', ejemplo: 'Hierro → Óxido', descripcion: 'El hierro se combina con oxígeno creando Fe₂O₃. Sustancia completamente nueva.', esQuimico: true },
];

// ─────────────────────────────────────────────
// Sección 2: Tipos de Reacciones
// ─────────────────────────────────────────────

interface TipoReaccion {
  id: string;
  nombre: string;
  esquema: string;
  descripcion: string;
  ejemplo: string;
  ecuacion: string;
  detalle: string;
  color: string;
  colorDark: string;
  atomosAntes: string[];
  atomosDespues: string[];
}

const TIPOS_REACCION: TipoReaccion[] = [
  {
    id: 'sintesis', nombre: 'Síntesis', esquema: 'A + B → AB',
    descripcion: 'Dos o más sustancias se combinan para formar una sola',
    ejemplo: 'Formación de óxido de hierro (herrumbre)',
    ecuacion: '4Fe + 3O₂ → 2Fe₂O₃',
    detalle: 'La herrumbre que ves en un clavo viejo es hierro que se ha combinado con el oxígeno del aire. Es un proceso lento pero imparable.',
    color: '#2E86AB', colorDark: '#5BA3C4',
    atomosAntes: ['Fe', 'Fe', 'O', 'O'],
    atomosDespues: ['Fe', 'O', 'Fe', 'O'],
  },
  {
    id: 'descomposicion', nombre: 'Descomposición', esquema: 'AB → A + B',
    descripcion: 'Un compuesto se rompe en sustancias más simples',
    ejemplo: 'Descomposición del agua por electricidad',
    ecuacion: '2H₂O → 2H₂ + O₂',
    detalle: 'Con electricidad puedes separar el agua en hidrógeno y oxígeno. Es el proceso inverso a la formación de agua.',
    color: '#E53935', colorDark: '#EF5350',
    atomosAntes: ['H', 'O', 'H', 'O'],
    atomosDespues: ['H', 'H', 'O', 'O'],
  },
  {
    id: 'sustSimple', nombre: 'Sustitución simple', esquema: 'A + BC → AC + B',
    descripcion: 'Un elemento reemplaza a otro dentro de un compuesto',
    ejemplo: 'Zinc desplaza al hidrógeno del ácido',
    ecuacion: 'Zn + 2HCl → ZnCl₂ + H₂',
    detalle: 'El zinc es más reactivo que el hidrógeno, así que lo "expulsa" del ácido clorhídrico y ocupa su lugar.',
    color: '#FF9800', colorDark: '#FFB74D',
    atomosAntes: ['Fe', 'Na', 'Cl'],
    atomosDespues: ['Fe', 'Cl', 'Na'],
  },
  {
    id: 'sustDoble', nombre: 'Doble sustitución', esquema: 'AB + CD → AD + CB',
    descripcion: 'Dos compuestos intercambian componentes entre sí',
    ejemplo: 'Vinagre + bicarbonato de sodio',
    ecuacion: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂',
    detalle: 'La efervescencia que ves al mezclar vinagre con bicarbonato es CO₂ liberándose. Un intercambio que produce gas, agua y una sal.',
    color: '#4CAF50', colorDark: '#81C784',
    atomosAntes: ['Na', 'H', 'C', 'O'],
    atomosDespues: ['Na', 'O', 'C', 'H'],
  },
  {
    id: 'combustion', nombre: 'Combustión', esquema: 'CₓHᵧ + O₂ → CO₂ + H₂O',
    descripcion: 'Un compuesto orgánico reacciona con oxígeno liberando energía',
    ejemplo: 'Quemar gas natural (metano) en la cocina',
    ecuacion: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    detalle: 'Cada vez que enciendes el fuego de la cocina, el metano se combina con el O₂ del aire. Se libera energía como calor y luz.',
    color: '#F44336', colorDark: '#EF5350',
    atomosAntes: ['C', 'H', 'H', 'O', 'O'],
    atomosDespues: ['C', 'O', 'O', 'H', 'O'],
  },
];

// ─────────────────────────────────────────────
// Sección 3: Balanceo de Ecuaciones
// ─────────────────────────────────────────────

interface EcuacionBalanceo {
  id: string;
  nombre: string;
  dificultad: string;
  reactivos: { formula: string; elementos: Record<string, number> }[];
  productos: { formula: string; elementos: Record<string, number> }[];
  coeficientesCorrectos: number[];
  pista: string;
}

const ECUACIONES_BALANCEO: EcuacionBalanceo[] = [
  {
    id: 'facil', nombre: 'Formación de agua', dificultad: 'Fácil',
    reactivos: [
      { formula: 'H₂', elementos: { H: 2 } },
      { formula: 'O₂', elementos: { O: 2 } },
    ],
    productos: [
      { formula: 'H₂O', elementos: { H: 2, O: 1 } },
    ],
    coeficientesCorrectos: [2, 1, 2],
    pista: 'Empieza igualando los oxígenos y luego ajusta los hidrógenos',
  },
  {
    id: 'medio', nombre: 'Óxido de hierro', dificultad: 'Medio',
    reactivos: [
      { formula: 'Fe', elementos: { Fe: 1 } },
      { formula: 'O₂', elementos: { O: 2 } },
    ],
    productos: [
      { formula: 'Fe₂O₃', elementos: { Fe: 2, O: 3 } },
    ],
    coeficientesCorrectos: [4, 3, 2],
    pista: 'Necesitas un número par de oxígenos en reactivos y múltiplo de 3 en productos',
  },
  {
    id: 'dificil', nombre: 'Combustión del propano', dificultad: 'Difícil',
    reactivos: [
      { formula: 'C₃H₈', elementos: { C: 3, H: 8 } },
      { formula: 'O₂', elementos: { O: 2 } },
    ],
    productos: [
      { formula: 'CO₂', elementos: { C: 1, O: 2 } },
      { formula: 'H₂O', elementos: { H: 2, O: 1 } },
    ],
    coeficientesCorrectos: [1, 5, 3, 4],
    pista: 'Balancea primero C, luego H, y por último O',
  },
];

function contarAtomos(
  compuestos: { elementos: Record<string, number> }[],
  coeficientes: number[]
): Record<string, number> {
  const conteo: Record<string, number> = {};
  compuestos.forEach((comp, i) => {
    const coef = coeficientes[i] || 1;
    Object.entries(comp.elementos).forEach(([elem, cant]) => {
      conteo[elem] = (conteo[elem] || 0) + cant * coef;
    });
  });
  return conteo;
}

// ─────────────────────────────────────────────
// Sección 4: Reacciones del Día a Día
// ─────────────────────────────────────────────

interface ReaccionCotidiana {
  icono: string;
  titulo: string;
  tipo: string;
  descripcion: string;
  detalle: string;
  reaccion: string;
}

const REACCIONES_COTIDIANAS: ReaccionCotidiana[] = [
  {
    icono: '🍳', titulo: 'Cocinar un huevo', tipo: 'Desnaturalización',
    descripcion: 'Las proteínas de la clara cambian su estructura 3D irreversiblemente',
    detalle: 'A partir de 60 °C, las cadenas de proteínas se despliegan y se enredan entre sí formando una red sólida y blanca. No puedes "descocinar" un huevo.',
    reaccion: 'Proteína (líquida) → Proteína (sólida)',
  },
  {
    icono: '🚗', titulo: 'Motor de combustión', tipo: 'Combustión',
    descripcion: 'La gasolina se quema con el oxígeno del aire liberando energía',
    detalle: 'En cada cilindro ocurren hasta 3.000 explosiones por minuto. La gasolina (octano) + O₂ → CO₂ + H₂O + energía cinética.',
    reaccion: '2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O',
  },
  {
    icono: '🧪', titulo: 'Vinagre + bicarbonato', tipo: 'Ácido-base',
    descripcion: 'La efervescencia clásica: se libera CO₂ como gas',
    detalle: 'El ácido acético (vinagre) reacciona con el bicarbonato sódico produciendo acetato de sodio, agua y dióxido de carbono. El gas CO₂ es lo que ves como burbujas.',
    reaccion: 'NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + CH₃COONa',
  },
  {
    icono: '🍌', titulo: 'Plátano que se oscurece', tipo: 'Oxidación enzimática',
    descripcion: 'Las enzimas al contactar con el aire producen melanina',
    detalle: 'La enzima polifenol oxidasa convierte los fenoles de la fruta en melanina parda al exponerse al oxígeno. El zumo de limón (ácido) la inhibe.',
    reaccion: 'Fenoles + O₂ → Melanina (parda)',
  },
  {
    icono: '🔋', titulo: 'Batería del móvil', tipo: 'Redox (electroquímica)',
    descripcion: 'Iones de litio viajan entre electrodos generando corriente',
    detalle: 'Al descargar, los iones Li⁺ migran del ánodo (grafito) al cátodo (óxido de cobalto). Al cargar, el proceso se invierte. Cada ciclo degrada un poco los electrodos.',
    reaccion: 'LiCoO₂ + C₆ ⇌ Li₁₋ₓCoO₂ + LiₓC₆',
  },
  {
    icono: '🧽', titulo: 'Lejía limpiando', tipo: 'Oxidación',
    descripcion: 'El hipoclorito destruye moléculas orgánicas (bacterias, manchas)',
    detalle: 'La lejía (NaClO) libera oxígeno activo que rompe los enlaces de las moléculas orgánicas. Por eso blanquea y desinfecta a la vez.',
    reaccion: 'NaClO → NaCl + [O] (oxígeno activo)',
  },
];

// ─────────────────────────────────────────────
// Componente Átomo
// ─────────────────────────────────────────────

function Atomo({ simbolo, tamaño = 'normal' }: { simbolo: string; tamaño?: 'normal' | 'grande' }) {
  const color = COLORES_ATOMO[simbolo] || { bg: '#9E9E9E', texto: '#FFFFFF', nombre: simbolo };
  return (
    <span
      className={`${styles.atomo} ${tamaño === 'grande' ? styles.atomoGrande : ''}`}
      style={{ background: color.bg, color: color.texto, border: `2px solid ${color.bg === '#FFFFFF' ? '#BDBDBD' : color.bg}` }}
      title={color.nombre}
      aria-label={color.nombre}
    >
      {simbolo}
    </span>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorReaccionesQuimicasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('queEs');
  const [tipoSeleccionado, setTipoSeleccionado] = useState(0);
  const [ecuacionActiva, setEcuacionActiva] = useState(0);
  const [coeficientes, setCoeficientes] = useState<number[][]>([
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1, 1],
  ]);
  const [cotidianaActiva, setCotidianaActiva] = useState<number | null>(null);
  const [cambioActivo, setCambioActivo] = useState<number | null>(null);
  const [mostrarPista, setMostrarPista] = useState(false);

  // ─── Balanceo: helpers ───

  const ecuacion = ECUACIONES_BALANCEO[ecuacionActiva];
  const coefs = coeficientes[ecuacionActiva];
  const totalCompuestos = ecuacion.reactivos.length + ecuacion.productos.length;

  const ajustarCoef = (idx: number, delta: number) => {
    const nuevos = [...coeficientes];
    const fila = [...nuevos[ecuacionActiva]];
    fila[idx] = Math.max(1, Math.min(10, (fila[idx] || 1) + delta));
    nuevos[ecuacionActiva] = fila;
    setCoeficientes(nuevos);
    setMostrarPista(false);
  };

  const coefsReactivos = coefs.slice(0, ecuacion.reactivos.length);
  const coefsProductos = coefs.slice(ecuacion.reactivos.length, totalCompuestos);
  const atomosIzq = contarAtomos(ecuacion.reactivos, coefsReactivos);
  const atomosDer = contarAtomos(ecuacion.productos, coefsProductos);
  const todosElementos = [...new Set([...Object.keys(atomosIzq), ...Object.keys(atomosDer)])];
  const balanceada = todosElementos.every((e) => (atomosIzq[e] || 0) === (atomosDer[e] || 0));

  const resetearEcuacion = () => {
    const nuevos = [...coeficientes];
    nuevos[ecuacionActiva] = ecuacion.reactivos.concat(ecuacion.productos).map(() => 1);
    setCoeficientes(nuevos);
    setMostrarPista(false);
  };

  // ─── Renderizado por sección ───

  const renderQueEs = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>¿Qué es una reacción química?</h2>
        <p className={styles.seccionSubtitulo}>Cuando los átomos cambian de pareja</p>
      </div>

      {/* Ejemplo visual: 2H₂ + O₂ → 2H₂O */}
      <div className={styles.ecuacionVisual}>
        <div className={styles.ecuacionLado}>
          <p className={styles.ecuacionLabel}>Reactivos</p>
          <div className={styles.atomosGrupo}>
            {EJEMPLO_BASICO.atomosReactivos.map((a, i) => (
              <Atomo key={`r-${i}`} simbolo={a} />
            ))}
          </div>
          <p className={styles.formulaTexto}>{EJEMPLO_BASICO.reactivos}</p>
        </div>
        <div className={styles.flechaReaccion} aria-hidden="true">→</div>
        <div className={styles.ecuacionLado}>
          <p className={styles.ecuacionLabel}>Productos</p>
          <div className={styles.atomosGrupo}>
            {EJEMPLO_BASICO.atomosProductos.map((a, i) => (
              <Atomo key={`p-${i}`} simbolo={a} />
            ))}
          </div>
          <p className={styles.formulaTexto}>{EJEMPLO_BASICO.productos}</p>
        </div>
      </div>

      <p className={styles.descripcionEjemplo}>{EJEMPLO_BASICO.descripcion}</p>

      {/* Leyenda de colores */}
      <div className={styles.leyendaAtomos}>
        <p className={styles.leyendaTitulo}>Colores de los átomos</p>
        <div className={styles.leyendaGrid}>
          {['H', 'O', 'C', 'N', 'Fe'].map((s) => (
            <div key={s} className={styles.leyendaItem}>
              <Atomo simbolo={s} />
              <span className={styles.leyendaNombre}>{COLORES_ATOMO[s].nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cambio físico vs químico */}
      <h3 className={styles.subtituloSeccion}>Cambio físico vs cambio químico</h3>
      <div className={styles.comparacionGrid}>
        {CAMBIOS.map((c, i) => (
          <button
            key={c.tipo}
            className={`${styles.comparacionCard} ${cambioActivo === i ? styles.comparacionActiva : ''} ${c.esQuimico ? styles.comparacionQuimico : styles.comparacionFisico}`}
            onClick={() => setCambioActivo(cambioActivo === i ? null : i)}
            aria-expanded={cambioActivo === i}
          >
            <span className={styles.comparacionIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.comparacionTipo}>{c.tipo}</span>
            <span className={styles.comparacionEjemplo}>{c.ejemplo}</span>
            {cambioActivo === i && (
              <p className={styles.comparacionDetalle}>{c.descripcion}</p>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insightBox}>
        <span aria-hidden="true">💡</span>
        <p>Los átomos no se crean ni destruyen, solo cambian de pareja. En toda reacción química, la cantidad total de cada elemento se conserva.</p>
      </div>
    </div>
  );

  const renderTipos = () => {
    const tipo = TIPOS_REACCION[tipoSeleccionado];
    return (
      <div className={styles.seccionContent}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>5 tipos de reacciones</h2>
          <p className={styles.seccionSubtitulo}>Pulsa cada tipo para ver la animación</p>
        </div>

        <div className={styles.tiposSelector}>
          {TIPOS_REACCION.map((t, i) => (
            <button
              key={t.id}
              className={`${styles.tipoBtn} ${tipoSeleccionado === i ? styles.tipoBtnActivo : ''}`}
              style={tipoSeleccionado === i ? { borderColor: t.color, background: t.color, color: '#fff' } : {}}
              onClick={() => setTipoSeleccionado(i)}
              aria-pressed={tipoSeleccionado === i}
            >
              <span className={styles.tipoBtnNombre}>{t.nombre}</span>
              <span className={styles.tipoBtnEsquema}>{t.esquema}</span>
            </button>
          ))}
        </div>

        <div className={styles.tipoDetalle} style={{ borderColor: tipo.color }}>
          <h3 className={styles.tipoDetalleNombre} style={{ color: tipo.color }}>
            {tipo.nombre}: {tipo.esquema}
          </h3>
          <p className={styles.tipoDetalleDesc}>{tipo.descripcion}</p>

          <div className={styles.ecuacionVisual}>
            <div className={styles.ecuacionLado}>
              <p className={styles.ecuacionLabel}>Antes</p>
              <div className={styles.atomosGrupo}>
                {tipo.atomosAntes.map((a, i) => (
                  <Atomo key={`a-${i}`} simbolo={a} />
                ))}
              </div>
            </div>
            <div className={styles.flechaReaccion} style={{ color: tipo.color }} aria-hidden="true">→</div>
            <div className={styles.ecuacionLado}>
              <p className={styles.ecuacionLabel}>Después</p>
              <div className={styles.atomosGrupo}>
                {tipo.atomosDespues.map((a, i) => (
                  <Atomo key={`d-${i}`} simbolo={a} />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tipoEjemplo}>
            <p className={styles.tipoEjemploTitulo}>{tipo.ejemplo}</p>
            <p className={styles.tipoEcuacion}>{tipo.ecuacion}</p>
            <p className={styles.tipoEjemploDetalle}>{tipo.detalle}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceo = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Balancea la ecuación</h2>
        <p className={styles.seccionSubtitulo}>Ajusta los coeficientes hasta que cuadren</p>
      </div>

      <div className={styles.ecuacionSelector}>
        {ECUACIONES_BALANCEO.map((eq, i) => (
          <button
            key={eq.id}
            className={`${styles.eqBtn} ${ecuacionActiva === i ? styles.eqBtnActivo : ''}`}
            onClick={() => { setEcuacionActiva(i); setMostrarPista(false); }}
            aria-pressed={ecuacionActiva === i}
          >
            <span className={styles.eqBtnDif}>{eq.dificultad}</span>
            <span className={styles.eqBtnNombre}>{eq.nombre}</span>
          </button>
        ))}
      </div>

      {/* Ecuación con controles +/- */}
      <div className={styles.balanceoEcuacion}>
        {ecuacion.reactivos.map((comp, i) => (
          <div key={`r-${i}`} className={styles.balanceoTermino}>
            {i > 0 && <span className={styles.balanceoOperador}>+</span>}
            <div className={styles.coefControl}>
              <button
                className={styles.coefBtn}
                onClick={() => ajustarCoef(i, -1)}
                aria-label={`Reducir coeficiente de ${comp.formula}`}
              >−</button>
              <span className={styles.coefValor}>{coefs[i] || 1}</span>
              <button
                className={styles.coefBtn}
                onClick={() => ajustarCoef(i, 1)}
                aria-label={`Aumentar coeficiente de ${comp.formula}`}
              >+</button>
            </div>
            <span className={styles.balanceoFormula}>{comp.formula}</span>
          </div>
        ))}

        <span className={styles.balanceoFlecha} aria-hidden="true">→</span>

        {ecuacion.productos.map((comp, i) => {
          const idx = ecuacion.reactivos.length + i;
          return (
            <div key={`p-${i}`} className={styles.balanceoTermino}>
              {i > 0 && <span className={styles.balanceoOperador}>+</span>}
              <div className={styles.coefControl}>
                <button
                  className={styles.coefBtn}
                  onClick={() => ajustarCoef(idx, -1)}
                  aria-label={`Reducir coeficiente de ${comp.formula}`}
                >−</button>
                <span className={styles.coefValor}>{coefs[idx] || 1}</span>
                <button
                  className={styles.coefBtn}
                  onClick={() => ajustarCoef(idx, 1)}
                  aria-label={`Aumentar coeficiente de ${comp.formula}`}
                >+</button>
              </div>
              <span className={styles.balanceoFormula}>{comp.formula}</span>
            </div>
          );
        })}
      </div>

      {/* Conteo atómico */}
      <div className={styles.conteoContainer}>
        <h3 className={styles.conteoTitulo}>Conteo de átomos</h3>
        <div className={styles.conteoGrid}>
          <div className={styles.conteoColumna}>
            <span className={styles.conteoLabel}>Reactivos</span>
          </div>
          <div className={styles.conteoColumna}>
            <span className={styles.conteoLabel}>Elemento</span>
          </div>
          <div className={styles.conteoColumna}>
            <span className={styles.conteoLabel}>Productos</span>
          </div>
        </div>
        {todosElementos.map((elem) => {
          const izq = atomosIzq[elem] || 0;
          const der = atomosDer[elem] || 0;
          const iguales = izq === der;
          return (
            <div key={elem} className={styles.conteoGrid}>
              <div className={`${styles.conteoNumero} ${iguales ? styles.conteoBien : styles.conteoMal}`}>
                {formatNumber(izq, 0)}
              </div>
              <div className={styles.conteoElemento}>
                <Atomo simbolo={elem} />
              </div>
              <div className={`${styles.conteoNumero} ${iguales ? styles.conteoBien : styles.conteoMal}`}>
                {formatNumber(der, 0)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado del balance */}
      <div className={`${styles.estadoBalance} ${balanceada ? styles.balanceOk : styles.balanceNo}`} role="alert" aria-live="polite">
        {balanceada ? '✅ ¡Ecuación balanceada! Los átomos cuadran a ambos lados.' : '❌ Aún no cuadra. Sigue ajustando los coeficientes.'}
      </div>

      {/* Botones de ayuda */}
      <div className={styles.balanceoAcciones}>
        <button className={styles.btnSecundario} onClick={resetearEcuacion}>
          Reiniciar
        </button>
        <button className={styles.btnSecundario} onClick={() => setMostrarPista(true)}>
          Pista
        </button>
      </div>

      {mostrarPista && (
        <div className={styles.pistaBox}>
          <span aria-hidden="true">💡</span> {ecuacion.pista}
        </div>
      )}
    </div>
  );

  const renderDiaDia = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Reacciones en tu día a día</h2>
        <p className={styles.seccionSubtitulo}>La química está en todas partes</p>
      </div>

      <div className={styles.cotidianaGrid}>
        {REACCIONES_COTIDIANAS.map((r, i) => (
          <button
            key={r.titulo}
            className={`${styles.cotidianaCard} ${cotidianaActiva === i ? styles.cotidianaActiva : ''}`}
            onClick={() => setCotidianaActiva(cotidianaActiva === i ? null : i)}
            aria-expanded={cotidianaActiva === i}
          >
            <span className={styles.cotidianaIcono} aria-hidden="true">{r.icono}</span>
            <span className={styles.cotidianaTitulo}>{r.titulo}</span>
            <span className={styles.cotidianaTipo}>{r.tipo}</span>
            <p className={styles.cotidianaDesc}>{r.descripcion}</p>
            {cotidianaActiva === i && (
              <div className={styles.cotidianaDetalle}>
                <p>{r.detalle}</p>
                <p className={styles.cotidianaReaccion}>{r.reaccion}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insightBox}>
        <span aria-hidden="true">🧬</span>
        <p>Tu cuerpo realiza unas {formatNumber(37000000000000, 0)} de reacciones por segundo. Cada célula es una fábrica química en miniatura.</p>
      </div>
    </div>
  );

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'queEs': return renderQueEs();
      case 'tipos': return renderTipos();
      case 'balanceo': return renderBalanceo();
      case 'diaDia': return renderDiaDia();
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
          <h1 className={styles.title}>⚗️ Reacciones Químicas</h1>
          <p className={styles.subtitle}>Cuando los átomos cambian de pareja</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Contenido activo */}
        {renderSeccion()}

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 La química que mueve el mundo"
          subtitle="Conceptos clave sobre reacciones químicas"
        >
          <section className={styles.guideSection}>
            <h2>Conservación de la masa: la ley de Lavoisier</h2>
            <p>
              En 1789, Antoine Lavoisier demostró que en toda reacción química la masa total se conserva.
              No se crea ni se destruye materia, solo se transforma. Esto significa que si pesas
              todos los reactivos antes de la reacción y todos los productos después, el resultado es idéntico.
            </p>

            <div className={styles.warningBox}>
              <strong>Dato clave</strong>: Si parece que "desaparece" masa (como al quemar madera),
              es porque parte de los productos son gases (CO₂, H₂O en forma de vapor) que se dispersan en el aire.
            </div>

            <h2>Energía en las reacciones</h2>
            <p>
              Las reacciones <strong>exotérmicas</strong> liberan energía (calor, luz). Ejemplo: la combustión.
              Las reacciones <strong>endotérmicas</strong> absorben energía del entorno. Ejemplo: la fotosíntesis,
              donde las plantas usan energía solar para convertir CO₂ y H₂O en glucosa y oxígeno.
            </p>

            <h2>Velocidad de reacción</h2>
            <p>
              Factores que aceleran una reacción: temperatura (más energía cinética), concentración
              (más choques entre moléculas), superficie de contacto (más área expuesta) y catalizadores
              (sustancias que facilitan la reacción sin consumirse). Las enzimas son catalizadores biológicos.
            </p>

            <h2>¿Por qué importa balancear ecuaciones?</h2>
            <p>
              Balancear una ecuación no es un capricho matemático: refleja una ley fundamental de la naturaleza.
              Si la ecuación no está balanceada, estarías diciendo que se crean o destruyen átomos,
              lo cual viola la conservación de la masa. En la industria, un balanceo incorrecto
              significa calcular mal las cantidades de reactivos, desperdiciando materiales o generando
              productos peligrosos inesperados.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-reacciones-quimicas')} />
        <ShareCard appName="visualizador-reacciones-quimicas" />
        <Footer appName="visualizador-reacciones-quimicas" />
      </div>
    </>
  );
}
