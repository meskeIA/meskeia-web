/**
 * Motor de `simulador-reacciones-quimicas`: las 20 reacciones y la estequiometría con que la
 * app pinta sus dos calculadoras.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la química está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]), y porque lo usan DOS lectores: la página
 * y los «Casos para clase» (`./casos.ts`). Si cada uno calculara por su cuenta, la app podría
 * suspender una respuesta que ella misma produce (skill /casos-aula-meskeia, «regla de oro»).
 * Se trasladó tal cual el 20/10/2026, sin cambiar ni una masa ni una fórmula.
 *
 * Funciones puras, sin React ni DOM. Nada lanza: una cantidad imposible da NaN, que se pinta,
 * en vez de una excepción que tumbaría el render. Validar la entrada es cosa de la página.
 */

export type TipoReaccion = 'síntesis' | 'descomposición' | 'desplazamiento-simple' | 'desplazamiento-doble' | 'combustión' | 'redox';
export type Energia = 'exotérmica' | 'endotérmica' | 'variable';
export type Unidad = 'gramos' | 'moles';

export interface SustanciaR {
  formula: string;
  nombre: string;
  coef: number;
  masa: number;
  esReactivo: boolean;
}

export interface Reaccion {
  id: string;
  nombre: string;
  tipo: TipoReaccion;
  energia: Energia;
  ecuacion: string;
  descripcion: string;
  aplicaciones: string;
  sustancias: SustanciaR[];
}

export const REACCIONES: Reaccion[] = [
  // Síntesis
  {
    id: 'sintesis-agua', nombre: 'Síntesis del agua', tipo: 'síntesis', energia: 'exotérmica',
    ecuacion: '2H₂ + O₂ → 2H₂O',
    descripcion: 'El hidrógeno y el oxígeno se combinan para formar agua, liberando energía. Reacción base de las pilas de combustible.',
    aplicaciones: 'Pilas de combustible de hidrógeno, propulsión de cohetes espaciales.',
    sustancias: [
      { formula: 'H₂', nombre: 'Hidrógeno', coef: 2, masa: 2.016, esReactivo: true },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 1, masa: 32.0, esReactivo: true },
      { formula: 'H₂O', nombre: 'Agua', coef: 2, masa: 18.015, esReactivo: false },
    ],
  },
  {
    id: 'haber', nombre: 'Síntesis de Haber (amoniaco)', tipo: 'síntesis', energia: 'exotérmica',
    ecuacion: 'N₂ + 3H₂ → 2NH₃',
    descripcion: 'El proceso industrial más importante del siglo XX. Fija nitrógeno atmosférico para producir amoniaco, base de todos los fertilizantes.',
    aplicaciones: 'Fabricación de fertilizantes nitrogenados, síntesis de explosivos, ácido nítrico.',
    sustancias: [
      { formula: 'N₂', nombre: 'Nitrógeno', coef: 1, masa: 28.014, esReactivo: true },
      { formula: 'H₂', nombre: 'Hidrógeno', coef: 3, masa: 2.016, esReactivo: true },
      { formula: 'NH₃', nombre: 'Amoniaco', coef: 2, masa: 17.031, esReactivo: false },
    ],
  },
  {
    id: 'nacl', nombre: 'Síntesis del cloruro de sodio', tipo: 'síntesis', energia: 'exotérmica',
    ecuacion: '2Na + Cl₂ → 2NaCl',
    descripcion: 'El sodio metálico reacciona vigorosamente con el cloro gaseoso para formar la sal de mesa. Reacción altamente exotérmica.',
    aplicaciones: 'Producción industrial de sal, conservación de alimentos, fabricación de PVC.',
    sustancias: [
      { formula: 'Na', nombre: 'Sodio', coef: 2, masa: 22.990, esReactivo: true },
      { formula: 'Cl₂', nombre: 'Cloro', coef: 1, masa: 70.906, esReactivo: true },
      { formula: 'NaCl', nombre: 'Cloruro de sodio', coef: 2, masa: 58.443, esReactivo: false },
    ],
  },
  {
    id: 'combustion-carbono', nombre: 'Combustión del carbono', tipo: 'combustión', energia: 'exotérmica',
    ecuacion: 'C + O₂ → CO₂',
    descripcion: 'El carbono reacciona con el oxígeno para producir dióxido de carbono. Reacción base de toda combustión de carbono elemental.',
    aplicaciones: 'Industria siderúrgica (alto horno), pilas de combustible de carbono.',
    sustancias: [
      { formula: 'C', nombre: 'Carbono', coef: 1, masa: 12.011, esReactivo: true },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 1, masa: 32.0, esReactivo: true },
      { formula: 'CO₂', nombre: 'Dióxido de carbono', coef: 1, masa: 44.010, esReactivo: false },
    ],
  },
  // Descomposición
  {
    id: 'electrolisis', nombre: 'Electrólisis del agua', tipo: 'descomposición', energia: 'endotérmica',
    ecuacion: '2H₂O → 2H₂ + O₂',
    descripcion: 'Mediante electricidad, el agua se descompone en hidrógeno y oxígeno gaseosos. Proceso clave para la producción de hidrógeno verde.',
    aplicaciones: 'Producción de hidrógeno renovable, generación de oxígeno en submarinos y estaciones espaciales.',
    sustancias: [
      { formula: 'H₂O', nombre: 'Agua', coef: 2, masa: 18.015, esReactivo: true },
      { formula: 'H₂', nombre: 'Hidrógeno', coef: 2, masa: 2.016, esReactivo: false },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 1, masa: 32.0, esReactivo: false },
    ],
  },
  {
    id: 'calcinacion', nombre: 'Calcinación de la caliza', tipo: 'descomposición', energia: 'endotérmica',
    ecuacion: 'CaCO₃ → CaO + CO₂',
    descripcion: 'Al calentar el carbonato de calcio (caliza) se descompone en óxido de calcio (cal viva) y CO₂. Proceso industrial fundamental.',
    aplicaciones: 'Fabricación de cemento, producción de cal para construcción y tratamiento de aguas.',
    sustancias: [
      { formula: 'CaCO₃', nombre: 'Carbonato de calcio', coef: 1, masa: 100.087, esReactivo: true },
      { formula: 'CaO', nombre: 'Óxido de calcio', coef: 1, masa: 56.077, esReactivo: false },
      { formula: 'CO₂', nombre: 'Dióxido de carbono', coef: 1, masa: 44.010, esReactivo: false },
    ],
  },
  {
    id: 'agua-oxigenada', nombre: 'Descomposición del agua oxigenada', tipo: 'descomposición', energia: 'exotérmica',
    ecuacion: '2H₂O₂ → 2H₂O + O₂',
    descripcion: 'El peróxido de hidrógeno se descompone espontáneamente en agua y oxígeno. La catalasa enzimática lo acelera en los organismos vivos.',
    aplicaciones: 'Antiséptico, blanqueador de tejidos, propulsante en cohetes de pequeño empuje.',
    sustancias: [
      { formula: 'H₂O₂', nombre: 'Agua oxigenada', coef: 2, masa: 34.015, esReactivo: true },
      { formula: 'H₂O', nombre: 'Agua', coef: 2, masa: 18.015, esReactivo: false },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 1, masa: 32.0, esReactivo: false },
    ],
  },
  // Desplazamiento simple
  {
    id: 'hierro-cobre', nombre: 'Hierro en sulfato de cobre', tipo: 'desplazamiento-simple', energia: 'exotérmica',
    ecuacion: 'Fe + CuSO₄ → FeSO₄ + Cu',
    descripcion: 'El hierro, más reactivo que el cobre, desplaza al cobre de su sal en solución. Se observa como el depósito rojo de cobre metálico sobre el hierro.',
    aplicaciones: 'Demostración de series de actividad química, recuperación de cobre en minería.',
    sustancias: [
      { formula: 'Fe', nombre: 'Hierro', coef: 1, masa: 55.845, esReactivo: true },
      { formula: 'CuSO₄', nombre: 'Sulfato de cobre', coef: 1, masa: 159.609, esReactivo: true },
      { formula: 'FeSO₄', nombre: 'Sulfato de hierro(II)', coef: 1, masa: 151.908, esReactivo: false },
      { formula: 'Cu', nombre: 'Cobre', coef: 1, masa: 63.546, esReactivo: false },
    ],
  },
  {
    id: 'zinc-hcl', nombre: 'Zinc en ácido clorhídrico', tipo: 'desplazamiento-simple', energia: 'exotérmica',
    ecuacion: 'Zn + 2HCl → ZnCl₂ + H₂',
    descripcion: 'El zinc desplaza al hidrógeno del ácido clorhídrico, produciendo burbujas de H₂ gaseoso visibles. Ejemplo clásico de serie de actividad.',
    aplicaciones: 'Generación de hidrógeno en laboratorio, pilas de zinc-carbono (pila Leclanché).',
    sustancias: [
      { formula: 'Zn', nombre: 'Zinc', coef: 1, masa: 65.38, esReactivo: true },
      { formula: 'HCl', nombre: 'Ácido clorhídrico', coef: 2, masa: 36.461, esReactivo: true },
      { formula: 'ZnCl₂', nombre: 'Cloruro de zinc', coef: 1, masa: 136.286, esReactivo: false },
      { formula: 'H₂', nombre: 'Hidrógeno', coef: 1, masa: 2.016, esReactivo: false },
    ],
  },
  {
    id: 'sodio-agua', nombre: 'Sodio en agua', tipo: 'desplazamiento-simple', energia: 'exotérmica',
    ecuacion: '2Na + 2H₂O → 2NaOH + H₂',
    descripcion: 'El sodio metálico reacciona violentamente con el agua. Ejemplo espectacular de metal alcalino altamente reactivo.',
    aplicaciones: 'Síntesis de hidróxido de sodio (sosa cáustica), industria del jabón.',
    sustancias: [
      { formula: 'Na', nombre: 'Sodio', coef: 2, masa: 22.990, esReactivo: true },
      { formula: 'H₂O', nombre: 'Agua', coef: 2, masa: 18.015, esReactivo: true },
      { formula: 'NaOH', nombre: 'Hidróxido de sodio', coef: 2, masa: 39.997, esReactivo: false },
      { formula: 'H₂', nombre: 'Hidrógeno', coef: 1, masa: 2.016, esReactivo: false },
    ],
  },
  // Desplazamiento doble
  {
    id: 'precipitacion-agcl', nombre: 'Precipitación del cloruro de plata', tipo: 'desplazamiento-doble', energia: 'variable',
    ecuacion: 'NaCl + AgNO₃ → AgCl↓ + NaNO₃',
    descripcion: 'El cloruro de plata precipita como sólido blanco insoluble. Reacción de identificación de cloruros en análisis cualitativo.',
    aplicaciones: 'Análisis cualitativo de cloruros, fotografía analógica (película de plata), tratamiento de agua.',
    sustancias: [
      { formula: 'NaCl', nombre: 'Cloruro de sodio', coef: 1, masa: 58.443, esReactivo: true },
      { formula: 'AgNO₃', nombre: 'Nitrato de plata', coef: 1, masa: 169.872, esReactivo: true },
      { formula: 'AgCl', nombre: 'Cloruro de plata', coef: 1, masa: 143.321, esReactivo: false },
      { formula: 'NaNO₃', nombre: 'Nitrato de sodio', coef: 1, masa: 84.994, esReactivo: false },
    ],
  },
  {
    id: 'neutralizacion-hcl-naoh', nombre: 'Neutralización: HCl + NaOH', tipo: 'desplazamiento-doble', energia: 'exotérmica',
    ecuacion: 'HCl + NaOH → NaCl + H₂O',
    descripcion: 'Un ácido fuerte reacciona con una base fuerte en proporción equimolar. El pH resultante es neutro (7).',
    aplicaciones: 'Tratamiento de efluentes ácidos/básicos, volumetría ácido-base en laboratorio.',
    sustancias: [
      { formula: 'HCl', nombre: 'Ácido clorhídrico', coef: 1, masa: 36.461, esReactivo: true },
      { formula: 'NaOH', nombre: 'Hidróxido de sodio', coef: 1, masa: 39.997, esReactivo: true },
      { formula: 'NaCl', nombre: 'Cloruro de sodio', coef: 1, masa: 58.443, esReactivo: false },
      { formula: 'H₂O', nombre: 'Agua', coef: 1, masa: 18.015, esReactivo: false },
    ],
  },
  {
    id: 'baso4', nombre: 'Precipitación del sulfato de bario', tipo: 'desplazamiento-doble', energia: 'variable',
    ecuacion: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl',
    descripcion: 'Forma sulfato de bario, un precipitado blanco insoluble. Utilizado en medicina como contraste radiológico gastrointestinal.',
    aplicaciones: 'Contraste en radiografías de aparato digestivo, pintura blanca de alta densidad, industria del papel.',
    sustancias: [
      { formula: 'BaCl₂', nombre: 'Cloruro de bario', coef: 1, masa: 208.23, esReactivo: true },
      { formula: 'Na₂SO₄', nombre: 'Sulfato de sodio', coef: 1, masa: 142.04, esReactivo: true },
      { formula: 'BaSO₄', nombre: 'Sulfato de bario', coef: 1, masa: 233.39, esReactivo: false },
      { formula: 'NaCl', nombre: 'Cloruro de sodio', coef: 2, masa: 58.443, esReactivo: false },
    ],
  },
  // Combustión
  {
    id: 'metano', nombre: 'Combustión del metano (gas natural)', tipo: 'combustión', energia: 'exotérmica',
    ecuacion: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    descripcion: 'El metano es el componente principal del gas natural. Su combustión completa produce CO₂ y vapor de agua.',
    aplicaciones: 'Calefacción doméstica, cogeneración eléctrica, cocinas de gas.',
    sustancias: [
      { formula: 'CH₄', nombre: 'Metano', coef: 1, masa: 16.043, esReactivo: true },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 2, masa: 32.0, esReactivo: true },
      { formula: 'CO₂', nombre: 'Dióxido de carbono', coef: 1, masa: 44.010, esReactivo: false },
      { formula: 'H₂O', nombre: 'Agua', coef: 2, masa: 18.015, esReactivo: false },
    ],
  },
  {
    id: 'propano', nombre: 'Combustión del propano (C₃H₈)', tipo: 'combustión', energia: 'exotérmica',
    ecuacion: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O',
    descripcion: 'El propano se usa en bombonas de gas. Su combustión completa libera más energía por mol que el metano.',
    aplicaciones: 'Bombonas de gas doméstico, camping, estufas industriales, automoción (GLP).',
    sustancias: [
      { formula: 'C₃H₈', nombre: 'Propano', coef: 1, masa: 44.096, esReactivo: true },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 5, masa: 32.0, esReactivo: true },
      { formula: 'CO₂', nombre: 'Dióxido de carbono', coef: 3, masa: 44.010, esReactivo: false },
      { formula: 'H₂O', nombre: 'Agua', coef: 4, masa: 18.015, esReactivo: false },
    ],
  },
  {
    id: 'glucosa', nombre: 'Combustión de la glucosa (respiración celular)', tipo: 'combustión', energia: 'exotérmica',
    ecuacion: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
    descripcion: 'La respiración celular aerobia. Las células queman glucosa con oxígeno para obtener ATP, CO₂ y agua.',
    aplicaciones: 'Base del metabolismo energético celular, industria alimentaria, fermentación.',
    sustancias: [
      { formula: 'C₆H₁₂O₆', nombre: 'Glucosa', coef: 1, masa: 180.156, esReactivo: true },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 6, masa: 32.0, esReactivo: true },
      { formula: 'CO₂', nombre: 'Dióxido de carbono', coef: 6, masa: 44.010, esReactivo: false },
      { formula: 'H₂O', nombre: 'Agua', coef: 6, masa: 18.015, esReactivo: false },
    ],
  },
  {
    id: 'etanol', nombre: 'Combustión del etanol', tipo: 'combustión', energia: 'exotérmica',
    ecuacion: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O',
    descripcion: 'El etanol (alcohol etílico) arde con llama azul. Es un biocombustible renovable obtenido por fermentación.',
    aplicaciones: 'Biocombustible E85/E10, alcohol de quemar, desinfectante.',
    sustancias: [
      { formula: 'C₂H₅OH', nombre: 'Etanol', coef: 1, masa: 46.068, esReactivo: true },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 3, masa: 32.0, esReactivo: true },
      { formula: 'CO₂', nombre: 'Dióxido de carbono', coef: 2, masa: 44.010, esReactivo: false },
      { formula: 'H₂O', nombre: 'Agua', coef: 3, masa: 18.015, esReactivo: false },
    ],
  },
  // Redox
  {
    id: 'oxido-hierro', nombre: 'Oxidación del hierro (herrumbre)', tipo: 'redox', energia: 'exotérmica',
    ecuacion: '4Fe + 3O₂ → 2Fe₂O₃',
    descripcion: 'El hierro se oxida lentamente con el oxígeno del aire formando óxido de hierro(III), la herrumbre. Proceso de corrosión lento.',
    aplicaciones: 'Comprensión de la corrosión, diseño de aceros inoxidables, pigmentos rojos (almagre).',
    sustancias: [
      { formula: 'Fe', nombre: 'Hierro', coef: 4, masa: 55.845, esReactivo: true },
      { formula: 'O₂', nombre: 'Oxígeno', coef: 3, masa: 32.0, esReactivo: true },
      { formula: 'Fe₂O₃', nombre: 'Óxido de hierro(III)', coef: 2, masa: 159.69, esReactivo: false },
    ],
  },
  {
    id: 'termita', nombre: 'Reacción termita (aluminio + óxido de hierro)', tipo: 'redox', energia: 'exotérmica',
    ecuacion: 'Fe₂O₃ + 2Al → Al₂O₃ + 2Fe',
    descripcion: 'El aluminio reduce el óxido de hierro a hierro metálico fundido a ~2500°C. Una de las reacciones más energéticas conocidas.',
    aplicaciones: 'Soldadura aluminotérmica de raíles ferroviarios, recubrimientos y materiales refractarios.',
    sustancias: [
      { formula: 'Fe₂O₃', nombre: 'Óxido de hierro(III)', coef: 1, masa: 159.69, esReactivo: true },
      { formula: 'Al', nombre: 'Aluminio', coef: 2, masa: 26.982, esReactivo: true },
      { formula: 'Al₂O₃', nombre: 'Óxido de aluminio', coef: 1, masa: 101.961, esReactivo: false },
      { formula: 'Fe', nombre: 'Hierro', coef: 2, masa: 55.845, esReactivo: false },
    ],
  },
  {
    id: 'acido-sulfo', nombre: 'Neutralización: H₂SO₄ + NaOH', tipo: 'desplazamiento-doble', energia: 'exotérmica',
    ecuacion: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
    descripcion: 'El ácido sulfúrico, un ácido dibásico, requiere el doble de base para su neutralización completa.',
    aplicaciones: 'Tratamiento de efluentes industriales, fabricación de jabones, análisis volumétrico.',
    sustancias: [
      { formula: 'H₂SO₄', nombre: 'Ácido sulfúrico', coef: 1, masa: 98.079, esReactivo: true },
      { formula: 'NaOH', nombre: 'Hidróxido de sodio', coef: 2, masa: 39.997, esReactivo: true },
      { formula: 'Na₂SO₄', nombre: 'Sulfato de sodio', coef: 1, masa: 142.042, esReactivo: false },
      { formula: 'H₂O', nombre: 'Agua', coef: 2, masa: 18.015, esReactivo: false },
    ],
  },
];

export function reaccionPorId(id: string): Reaccion | undefined {
  return REACCIONES.find(r => r.id === id);
}

export function reactivosDe(r: Reaccion): SustanciaR[] {
  return r.sustancias.filter(s => s.esReactivo);
}

export interface FilaResultado {
  formula: string;
  nombre: string;
  coef: number;
  moles: number;
  gramos: number;
  esReactivo: boolean;
  esBase: boolean;
  esLimite: boolean;
}

/**
 * Pestaña «Estequiometría»: dada la cantidad de UNA sustancia (la de índice `idxBase` en la
 * ecuación), las de todas las demás.
 *   moles_base = g ÷ M (o los moles dados) · moles_i = moles_base · (coef_i ÷ coef_base)
 */
export function calcularEstequiometria(r: Reaccion, idxBase: number, cantidad: number, unidad: Unidad): FilaResultado[] {
  const sustBase = r.sustancias[idxBase];
  if (!sustBase) return [];
  const molesBase = unidad === 'gramos' ? cantidad / sustBase.masa : cantidad;
  const coefBase = sustBase.coef;
  return r.sustancias.map((s, i) => {
    const moles = molesBase * (s.coef / coefBase);
    const gramos = moles * s.masa;
    return { formula: s.formula, nombre: s.nombre, coef: s.coef, moles, gramos, esReactivo: s.esReactivo, esBase: i === idxBase, esLimite: false };
  });
}

export interface ResultadoLimitante {
  filas: FilaResultado[];
  /** Índice del limitante entre los REACTIVOS; −1 si hay empate (proporción exacta). */
  limiteIdx: number;
  /** Por reactivo: su cociente n ÷ coef menos el del limitante (0 en el limitante). */
  excesos: number[];
}

/**
 * Pestaña «Reactivo Límite»: con la cantidad de cada reactivo (en el orden de la ecuación),
 * cuál se agota primero y qué se forma.
 *   cociente_i = moles_i ÷ coef_i · limita el menor · exceso_i = cociente_i − mín
 */
export function calcularLimitante(r: Reaccion, cantidades: readonly number[], unidad: Unidad): ResultadoLimitante {
  const reactivos = reactivosDe(r);
  const molesReact = reactivos.map((s, i) => unidad === 'gramos' ? cantidades[i] / s.masa : cantidades[i]);
  const coefUnits = reactivos.map((s, i) => molesReact[i] / s.coef);
  const limiteCoefUnit = Math.min(...coefUnits);
  // Empate: si todos los cocientes coinciden, no hay reactivo limitante — se consumen
  // íntegros y no sobra ninguno. El desempate de indexOf señalaba al primero de la lista
  // (hallazgo 118). Se compara con tolerancia porque los cocientes vienen de dividir.
  const hayEmpate = coefUnits.every(cu => Math.abs(cu - limiteCoefUnit) < 1e-9);
  const limiteIdx = hayEmpate ? -1 : coefUnits.indexOf(limiteCoefUnit);
  const excesos = coefUnits.map(cu => cu - limiteCoefUnit);
  const filas: FilaResultado[] = r.sustancias.map(s => {
    const moles = limiteCoefUnit * s.coef;
    const gramos = moles * s.masa;
    const reactIdx = reactivos.findIndex(rr => rr.formula === s.formula);
    // Ojo al doble −1: `findIndex` devuelve −1 para los PRODUCTOS, y `limiteIdx` vale −1
    // cuando no hay limitante (empate). Sin el guard, los productos salían marcados
    // «⚠️ LÍMITE» justo en el caso que se acababa de reparar.
    const esLimite = limiteIdx >= 0 && reactIdx === limiteIdx;
    return { formula: s.formula, nombre: s.nombre, coef: s.coef, moles, gramos, esReactivo: s.esReactivo, esBase: false, esLimite };
  });
  return { filas, limiteIdx, excesos };
}

/** Lo que sobra del reactivo `idxReactivo` (índice entre los reactivos) cuando se agota el limitante. */
export function sobrante(r: Reaccion, resultado: ResultadoLimitante, idxReactivo: number): { moles: number; gramos: number } {
  const s = reactivosDe(r)[idxReactivo];
  const ex = resultado.excesos[idxReactivo];
  if (!s || ex === undefined) return { moles: NaN, gramos: NaN };
  return { moles: ex * s.coef, gramos: ex * s.coef * s.masa };
}
