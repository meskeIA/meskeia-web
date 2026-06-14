'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorReaccionesQuimicas.module.css';

type Tab = 'catalogo' | 'estequiometria' | 'limitante';
type TipoReaccion = 'síntesis' | 'descomposición' | 'desplazamiento-simple' | 'desplazamiento-doble' | 'combustión' | 'redox';
type Energia = 'exotérmica' | 'endotérmica' | 'variable';
type Unidad = 'gramos' | 'moles';

interface SustanciaR {
  formula: string;
  nombre: string;
  coef: number;
  masa: number;
  esReactivo: boolean;
}

interface Reaccion {
  id: string;
  nombre: string;
  tipo: TipoReaccion;
  energia: Energia;
  ecuacion: string;
  descripcion: string;
  aplicaciones: string;
  sustancias: SustanciaR[];
}

const REACCIONES: Reaccion[] = [
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
    id: 'combustion-carbono', nombre: 'Combustión del carbono', tipo: 'síntesis', energia: 'exotérmica',
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
    id: 'propano', nombre: 'Combustión del propano (gas butano/propano)', tipo: 'combustión', energia: 'exotérmica',
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

const TIPOS_INFO: Record<TipoReaccion, { icono: string; patron: string; descripcion: string }> = {
  'síntesis': { icono: '🔗', patron: 'A + B → AB', descripcion: 'Dos o más sustancias se combinan para formar una sola más compleja.' },
  'descomposición': { icono: '🔀', patron: 'AB → A + B', descripcion: 'Una sustancia se divide en dos o más sustancias más simples.' },
  'desplazamiento-simple': { icono: '🔄', patron: 'A + BC → AC + B', descripcion: 'Un elemento desplaza a otro elemento de un compuesto.' },
  'desplazamiento-doble': { icono: '⇄', patron: 'AB + CD → AD + CB', descripcion: 'Los cationes de dos compuestos iónicos intercambian sus aniones.' },
  'combustión': { icono: '🔥', patron: 'CₓHᵧ + O₂ → CO₂ + H₂O', descripcion: 'Un combustible reacciona con oxígeno liberando energía calórica.' },
  'redox': { icono: '⚡', patron: 'Oxidante + Reductor → ...', descripcion: 'Transferencia de electrones: un reactivo se oxida y otro se reduce.' },
};

const BADGE_TIPO: Record<TipoReaccion, string> = {
  'síntesis': styles.badgeSintesis,
  'descomposición': styles.badgeDescomposicion,
  'desplazamiento-simple': styles.badgeDesplSimple,
  'desplazamiento-doble': styles.badgeDesplDoble,
  'combustión': styles.badgeCombustion,
  'redox': styles.badgeRedox,
};

const LABEL_TIPO: Record<TipoReaccion, string> = {
  'síntesis': 'Síntesis',
  'descomposición': 'Descomposición',
  'desplazamiento-simple': 'Despl. Simple',
  'desplazamiento-doble': 'Despl. Doble',
  'combustión': 'Combustión',
  'redox': 'Redox / Á-B',
};

interface FilaResultado {
  formula: string;
  nombre: string;
  coef: number;
  moles: number;
  gramos: number;
  esReactivo: boolean;
  esBase: boolean;
  esLimite: boolean;
}

export default function SimuladorReaccionesQuimicas() {
  const [tab, setTab] = useState<Tab>('catalogo');

  // Catálogo
  const [filtro, setFiltro] = useState<TipoReaccion | 'todas'>('todas');
  const [expandida, setExpandida] = useState<string | null>(null);

  // Estequiometría
  const [stoicId, setStoicId] = useState(REACCIONES[0].id);
  const [stoicSustIdx, setStoicSustIdx] = useState(0);
  const [stoicCant, setStoicCant] = useState('');
  const [stoicUnidad, setStoicUnidad] = useState<Unidad>('gramos');
  const [stoicResultado, setStoicResultado] = useState<FilaResultado[] | null>(null);
  const [stoicError, setStoicError] = useState('');

  // Reactivo limitante
  const [limId, setLimId] = useState(REACCIONES[0].id);
  const [limUnidad, setLimUnidad] = useState<Unidad>('gramos');
  const [limCants, setLimCants] = useState<Record<number, string>>({});
  const [limResultado, setLimResultado] = useState<{ filas: FilaResultado[]; limiteIdx: number; excesos: number[] } | null>(null);
  const [limError, setLimError] = useState('');

  const stoicReaccion = REACCIONES.find(r => r.id === stoicId) ?? REACCIONES[0];
  const limReaccion = REACCIONES.find(r => r.id === limId) ?? REACCIONES[0];

  function calcStoic() {
    setStoicError('');
    setStoicResultado(null);
    const cant = parseFloat(stoicCant.replace(',', '.'));
    if (isNaN(cant) || cant <= 0) { setStoicError('Introduce una cantidad positiva.'); return; }
    const sustBase = stoicReaccion.sustancias[stoicSustIdx];
    const molesBase = stoicUnidad === 'gramos' ? cant / sustBase.masa : cant;
    const coefBase = sustBase.coef;
    const filas: FilaResultado[] = stoicReaccion.sustancias.map((s, i) => {
      const moles = molesBase * (s.coef / coefBase);
      const gramos = moles * s.masa;
      return { formula: s.formula, nombre: s.nombre, coef: s.coef, moles, gramos, esReactivo: s.esReactivo, esBase: i === stoicSustIdx, esLimite: false };
    });
    setStoicResultado(filas);
  }

  function calcLimite() {
    setLimError('');
    setLimResultado(null);
    const reactivos = limReaccion.sustancias.filter(s => s.esReactivo);
    const cants = reactivos.map((_, i) => {
      const val = parseFloat((limCants[i] ?? '').replace(',', '.'));
      return val;
    });
    if (cants.some(v => isNaN(v) || v <= 0)) { setLimError('Introduce cantidades positivas para todos los reactivos.'); return; }
    const molesReact = reactivos.map((s, i) => limUnidad === 'gramos' ? cants[i] / s.masa : cants[i]);
    const coefUnits = reactivos.map((s, i) => molesReact[i] / s.coef);
    const limiteCoefUnit = Math.min(...coefUnits);
    const limiteIdx = coefUnits.indexOf(limiteCoefUnit);
    const excesos = coefUnits.map((cu, i) => i === limiteIdx ? 0 : (cu - limiteCoefUnit));
    const filas: FilaResultado[] = limReaccion.sustancias.map((s, si) => {
      const moles = limiteCoefUnit * s.coef;
      const gramos = moles * s.masa;
      const reactIdx = reactivos.findIndex(r => r.formula === s.formula);
      const esLimite = reactIdx === limiteIdx;
      return { formula: s.formula, nombre: s.nombre, coef: s.coef, moles, gramos, esReactivo: s.esReactivo, esBase: false, esLimite };
    });
    setLimResultado({ filas, limiteIdx, excesos });
  }

  const reaccionesFiltradas = filtro === 'todas' ? REACCIONES : REACCIONES.filter(r => r.tipo === filtro);
  const TODOS_TIPOS = Object.keys(TIPOS_INFO) as TipoReaccion[];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Reacciones Químicas</h1>
        <p>Estequiometría y reactivo limitante — 20 reacciones reales con cálculos numéricos</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabBar} aria-label="Secciones del simulador" role="tablist">
          {(['catalogo', 'estequiometria', 'limitante'] as Tab[]).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              <span aria-hidden="true">{t === 'catalogo' ? '📋' : t === 'estequiometria' ? '⚖️' : '🎯'}</span>{' '}
              {t === 'catalogo' ? 'Catálogo' : t === 'estequiometria' ? 'Estequiometría' : 'Reactivo Límite'}
            </button>
          ))}
        </nav>

        {/* TAB 1 — CATÁLOGO */}
        {tab === 'catalogo' && (
          <div>
            <div className={styles.filtros}>
              <button className={`${styles.filtroBtn} ${filtro === 'todas' ? styles.filtroActivo : ''}`} onClick={() => setFiltro('todas')} aria-pressed={filtro === 'todas'}>
                Todas ({REACCIONES.length})
              </button>
              {TODOS_TIPOS.map(t => (
                <button
                  key={t}
                  className={`${styles.filtroBtn} ${filtro === t ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltro(t)}
                  aria-pressed={filtro === t}
                >
                  <span aria-hidden="true">{TIPOS_INFO[t].icono}</span>{' '}{LABEL_TIPO[t]} ({REACCIONES.filter(r => r.tipo === t).length})
                </button>
              ))}
            </div>

            <div className={styles.reaccionesGrid}>
              {reaccionesFiltradas.map(r => (
                <div key={r.id} className={styles.reaccionCard}>
                  <div
                    className={styles.reaccionHeader}
                    onClick={() => setExpandida(expandida === r.id ? null : r.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expandida === r.id}
                    onKeyDown={e => e.key === 'Enter' && setExpandida(expandida === r.id ? null : r.id)}
                  >
                    <div className={styles.reaccionHeaderLeft}>
                      <p className={styles.reaccionNombre}>
                        {r.nombre}
                        <span className={`${styles.energiaBadge} ${r.energia === 'exotérmica' ? styles.exotermica : r.energia === 'endotérmica' ? styles.endotermica : styles.variable}`}>
                          {r.energia === 'exotérmica' ? '🔥 Exotérmica' : r.energia === 'endotérmica' ? '❄️ Endotérmica' : '〜 Variable'}
                        </span>
                      </p>
                      <p className={styles.ecuacion}>{r.ecuacion}</p>
                      <span className={`${styles.tipoBadge} ${BADGE_TIPO[r.tipo]}`}>{LABEL_TIPO[r.tipo]}</span>
                    </div>
                    <span className={styles.chevron}>{expandida === r.id ? '▲' : '▼'}</span>
                  </div>
                  {expandida === r.id && (
                    <div className={styles.reaccionDetalle}>
                      <p>{r.descripcion}</p>
                      <p className={styles.aplicaciones}>💡 Aplicaciones: {r.aplicaciones}</p>
                      <table className={styles.resultTable} style={{ marginTop: '0.75rem' }}>
                        <thead>
                          <tr>
                            <th>Sustancia</th>
                            <th>Fórmula</th>
                            <th>Coef.</th>
                            <th>Masa molar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.sustancias.map((s, i) => (
                            <tr key={i}>
                              <td>{s.nombre} <span className={s.esReactivo ? styles.tagR : styles.tagP}>{s.esReactivo ? 'R' : 'P'}</span></td>
                              <td style={{ fontFamily: 'monospace' }}>{s.formula}</td>
                              <td>{s.coef}</td>
                              <td>{formatNumber(s.masa, 3)} g/mol</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2 — ESTEQUIOMETRÍA */}
        {tab === 'estequiometria' && (
          <div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Calculadora Estequiométrica</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Selecciona una reacción y la sustancia conocida. Introduce su cantidad en gramos o moles y obtén las cantidades de todas las demás.
              </p>

              <div className={styles.selectGroup}>
                <label htmlFor="stoicReaccion">Reacción</label>
                <select id="stoicReaccion" value={stoicId} onChange={e => { setStoicId(e.target.value); setStoicSustIdx(0); setStoicResultado(null); setStoicError(''); }}>
                  {REACCIONES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>

              <div className={styles.ecuacionDisplay}>{stoicReaccion.ecuacion}</div>

              <div className={styles.selectGroup}>
                <label htmlFor="stoicSustancia">Sustancia conocida</label>
                <select id="stoicSustancia" value={stoicSustIdx} onChange={e => { setStoicSustIdx(Number(e.target.value)); setStoicResultado(null); }}>
                  {stoicReaccion.sustancias.map((s, i) => (
                    <option key={i} value={i}>{s.formula} — {s.nombre} ({s.esReactivo ? 'reactivo' : 'producto'})</option>
                  ))}
                </select>
              </div>

              <div className={styles.unidadToggle}>
                <button className={`${styles.unidadBtn} ${stoicUnidad === 'gramos' ? styles.unidadBtnActivo : ''}`} onClick={() => setStoicUnidad('gramos')} aria-pressed={stoicUnidad === 'gramos'}>Gramos</button>
                <button className={`${styles.unidadBtn} ${stoicUnidad === 'moles' ? styles.unidadBtnActivo : ''}`} onClick={() => setStoicUnidad('moles')} aria-pressed={stoicUnidad === 'moles'}>Moles</button>
              </div>

              <div className={styles.selectGroup} style={{ maxWidth: '240px' }}>
                <label>Cantidad de {stoicReaccion.sustancias[stoicSustIdx].formula} ({stoicUnidad === 'gramos' ? 'g' : 'mol'})</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={stoicCant}
                  onChange={e => setStoicCant(e.target.value)}
                  placeholder={stoicUnidad === 'gramos' ? 'gramos' : 'moles'}
                />
              </div>

              {stoicError && <p role="alert" className={styles.errorMsg}>{stoicError}</p>}
              <button className={styles.calcBtn} onClick={calcStoic}>Calcular</button>

              {stoicResultado && (
                <div role="status" aria-live="polite">
                <table className={styles.resultTable}>
                  <thead>
                    <tr>
                      <th>Sustancia</th>
                      <th>Coef.</th>
                      <th>Moles</th>
                      <th>Gramos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stoicResultado.map((f, i) => (
                      <tr key={i} className={f.esBase ? styles.rowBase : ''}>
                        <td>
                          {f.formula} — {f.nombre}{' '}
                          <span className={f.esReactivo ? styles.tagR : styles.tagP}>{f.esReactivo ? 'R' : 'P'}</span>
                        </td>
                        <td>{f.coef}</td>
                        <td>{formatNumber(f.moles, 4)} mol</td>
                        <td>{formatNumber(f.gramos, 3)} g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 — REACTIVO LIMITANTE */}
        {tab === 'limitante' && (
          <div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Reactivo Limitante</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Introduce la cantidad disponible de <strong>cada reactivo</strong>. El simulador encontrará cuál agota primero y calculará el rendimiento teórico de los productos.
              </p>

              <div className={styles.selectGroup}>
                <label htmlFor="limReaccion">Reacción</label>
                <select id="limReaccion" value={limId} onChange={e => { setLimId(e.target.value); setLimCants({}); setLimResultado(null); setLimError(''); }}>
                  {REACCIONES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>

              <div className={styles.ecuacionDisplay}>{limReaccion.ecuacion}</div>

              <div className={styles.unidadToggle}>
                <button className={`${styles.unidadBtn} ${limUnidad === 'gramos' ? styles.unidadBtnActivo : ''}`} onClick={() => setLimUnidad('gramos')} aria-pressed={limUnidad === 'gramos'}>Gramos</button>
                <button className={`${styles.unidadBtn} ${limUnidad === 'moles' ? styles.unidadBtnActivo : ''}`} onClick={() => setLimUnidad('moles')} aria-pressed={limUnidad === 'moles'}>Moles</button>
              </div>

              <div className={styles.reactivosGrid}>
                {limReaccion.sustancias.filter(s => s.esReactivo).map((s, i) => (
                  <div key={i} className={styles.reactivoInput}>
                    <span className={styles.reactivoFormula} aria-hidden="true">{s.formula}</span>
                    <span className={styles.reactivoNombre}>{s.nombre}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      aria-label={`Cantidad de ${s.formula} (${s.nombre}) en ${limUnidad}`}
                      placeholder={limUnidad === 'gramos' ? 'gramos' : 'moles'}
                      value={limCants[i] ?? ''}
                      onChange={e => setLimCants(prev => ({ ...prev, [i]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {limError && <p role="alert" className={styles.errorMsg}>{limError}</p>}
              <button className={styles.calcBtn} onClick={calcLimite}>Calcular reactivo limitante</button>

              {limResultado && (
                <div role="status" aria-live="polite">
                <table className={styles.resultTable}>
                    <thead>
                      <tr>
                        <th>Sustancia</th>
                        <th>Coef.</th>
                        <th>Moles teóricos</th>
                        <th>Gramos teóricos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {limResultado.filas.map((f, i) => (
                        <tr key={i}>
                          <td>
                            {f.formula} — {f.nombre}{' '}
                            <span className={f.esReactivo ? styles.tagR : styles.tagP}>{f.esReactivo ? 'R' : 'P'}</span>
                            {f.esLimite && <span className={styles.tagLimite}> ⚠️ LÍMITE</span>}
                          </td>
                          <td>{f.coef}</td>
                          <td>{formatNumber(f.moles, 4)} mol</td>
                          <td>{formatNumber(f.gramos, 3)} g</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className={styles.resumenLimite}>
                    <h4>⚠️ Reactivo limitante: {limReaccion.sustancias.filter(s => s.esReactivo)[limResultado.limiteIdx].formula}</h4>
                    {limResultado.excesos.map((ex, i) => {
                      if (ex === 0) return null;
                      const s = limReaccion.sustancias.filter(r => r.esReactivo)[i];
                      const excGramos = ex * s.coef * s.masa;
                      return (
                        <div key={i} className={styles.resumenRow}>
                          <span className={styles.resumenLabel}>{s.formula} sobrante (exceso)</span>
                          <span className={styles.resumenVal}>{formatNumber(ex * s.coef, 4)} mol — {formatNumber(excGramos, 3)} g</span>
                        </div>
                      );
                    })}
                    <div className={styles.resumenRow}>
                      <span className={styles.resumenLabel}>Productos obtenidos (rendimiento 100%)</span>
                      <span className={styles.resumenVal}>
                        {limResultado.filas.filter(f => !f.esReactivo).map(f => `${formatNumber(f.gramos, 2)} g ${f.formula}`).join(' + ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <EducationalSection
          title="Guía de Estequiometría y Reacciones Químicas"
          subtitle="Conceptos clave, cálculos y aplicaciones reales de la química cuantitativa"
        >
          {/* Tabla comparativa */}
          <h3>Tipos de Reacción Química</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Patrón</th>
                  <th>Ejemplo real</th>
                  <th>Energía</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Síntesis</strong></td>
                  <td>A + B → AB</td>
                  <td>N₂ + 3H₂ → 2NH₃ (Haber)</td>
                  <td>Generalmente exotérmica</td>
                </tr>
                <tr>
                  <td><strong>Descomposición</strong></td>
                  <td>AB → A + B</td>
                  <td>CaCO₃ → CaO + CO₂</td>
                  <td>Generalmente endotérmica</td>
                </tr>
                <tr>
                  <td><strong>Despl. Simple</strong></td>
                  <td>A + BC → AC + B</td>
                  <td>Zn + 2HCl → ZnCl₂ + H₂</td>
                  <td>Variable</td>
                </tr>
                <tr>
                  <td><strong>Despl. Doble</strong></td>
                  <td>AB + CD → AD + CB</td>
                  <td>HCl + NaOH → NaCl + H₂O</td>
                  <td>Variable</td>
                </tr>
                <tr>
                  <td><strong>Combustión</strong></td>
                  <td>CₓHᵧ + O₂ → CO₂ + H₂O</td>
                  <td>CH₄ + 2O₂ → CO₂ + 2H₂O</td>
                  <td>Siempre exotérmica</td>
                </tr>
                <tr>
                  <td><strong>Redox</strong></td>
                  <td>Ox + Red → ...</td>
                  <td>4Fe + 3O₂ → 2Fe₂O₃</td>
                  <td>Variable</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Casos de uso */}
          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de Bachillerato</h4>
              <p>Verifica resultados de ejercicios de estequiometría: dado que tienes 10 g de zinc y exceso de HCl, ¿cuánto H₂ se obtiene? La tab de estequiometría responde en segundos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Laboratorio de química</h4>
              <p>Antes de un experimento, calcula cuántos gramos de cada reactivo necesitas. Con reactivo limitante, maximiza el aprovechamiento del reactivo más caro.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Industria química</h4>
              <p>En la producción de amoniaco (Haber), optimizar la relación N₂/H₂ es crítico. El cálculo de reactivo limitante determina el coste y rendimiento industrial.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Docente de química</h4>
              <p>Genera ejemplos numéricos personalizados para clase. Modifica cantidades y muestra al alumnado cómo el reactivo limitante cambia según las proporciones iniciales.</p>
            </div>
          </div>

          {/* FAQ */}
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué es la masa molar y cómo se usa en estequiometría?</strong>
              <p>La masa molar es la masa en gramos de un mol de sustancia (6,022×10²³ partículas). Permite convertir entre gramos (lo que pesas) y moles (lo que reacciona). Gramos ÷ masa molar = moles.</p>
              <p className={styles.faqTip}>Ejemplo: 18 g de H₂O = 18 g ÷ 18 g/mol = 1 mol de agua = 6,022×10²³ moléculas.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo se identifica el reactivo limitante?</strong>
              <p>Divide los moles disponibles de cada reactivo entre su coeficiente estequiométrico. El reactivo con el cociente menor es el limitante: es el que se acaba primero y determina la cantidad máxima de producto.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el rendimiento teórico vs el rendimiento real?</strong>
              <p>El rendimiento teórico es la cantidad máxima de producto si la reacción fuera 100% eficiente. En la práctica, el rendimiento real es menor por reacciones secundarias, pérdidas físicas o equilibrios incompletos. % rendimiento = (real/teórico) × 100.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué las ecuaciones deben estar balanceadas?</strong>
              <p>Por la ley de conservación de la masa: los átomos no se crean ni se destruyen. La ecuación balanceada garantiza que el número de átomos de cada elemento es igual en reactivos y productos.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre exotérmica y endotérmica?</strong>
              <p>En una reacción exotérmica la energía se libera (la mezcla se calienta). En una endotérmica se absorbe energía del entorno (la mezcla se enfría). La variación de entalpía ΔH es negativa (exo) o positiva (endo).</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el mol y por qué se usa en química?</strong>
              <p>El mol es la unidad de cantidad de materia del SI: 6,022×10²³ entidades (Número de Avogadro). Se usa porque los átomos son demasiado pequeños para contarlos. Los coeficientes de una ecuación son relaciones entre moles, no entre gramos.</p>
            </div>
          </div>

          {/* Guía paso a paso */}
          <h3>Cómo Resolver un Problema de Estequiometría — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Escribe y balancea la ecuación química</strong>
                <p>Identifica reactivos y productos. Ajusta los coeficientes para que el número de átomos de cada elemento sea igual en ambos lados.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Convierte la cantidad conocida a moles</strong>
                <p>Si tienes gramos: moles = gramos ÷ masa molar. Si tienes volumen de gas (condiciones normales): moles = litros ÷ 22,4 L/mol.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica la relación estequiométrica</strong>
                <p>Usa los coeficientes de la ecuación balanceada como factores de conversión. Si necesitas calcular B a partir de A: moles_B = moles_A × (coef_B / coef_A).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Convierte el resultado a la unidad deseada</strong>
                <p>Si necesitas gramos: gramos = moles × masa molar. Si tienes varios productos, calcula cada uno independientemente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con la ley de conservación de la masa</strong>
                <p>La suma de los gramos de reactivos debe igualar la suma de los gramos de productos. Si no cuadra, hay un error en el balanceo o en el cálculo.</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <h3>Mejores Prácticas en Cálculos Estequiométricos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>El mol siempre en el centro</strong>
                <p>Todo cálculo estequiométrico pasa por moles. Gramos → moles → relación → moles → gramos. No saltes este paso.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Balancea antes de calcular</strong>
                <p>Los coeficientes de una ecuación no balanceada dan resultados completamente erróneos. Verifica siempre el balance primero.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <strong>Identifica el limitante con dos reactivos</strong>
                <p>Cuando tengas cantidades de dos o más reactivos, siempre comprueba cuál limita. El exceso del otro no participa en la reacción.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Cuida las unidades en cada paso</strong>
                <p>Escribe las unidades en cada operación. Si no se cancelan correctamente, hay un error en el procedimiento.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔬</span>
              <div>
                <strong>Rendimiento real casi nunca es 100%</strong>
                <p>En laboratorio, asume un rendimiento del 70-90% para estimaciones. Factores: pureza de reactivos, equilibrio, pérdidas físicas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <div>
                <strong>Las proporciones son de moles, no de gramos</strong>
                <p>CH₄ + 2O₂ → ... no significa «1 g de metano con 2 g de O₂». Significa «1 mol de CH₄ con 2 mol de O₂».</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Frecuentes en Estequiometría
            </div>
            <ul className={styles.warningList}>
              <li>Usar una ecuación no balanceada: los coeficientes incorrectos invalidan todos los cálculos.</li>
              <li>Confundir gramos con moles: 1 mol de CO₂ (44 g) no es lo mismo que 1 g de CO₂.</li>
              <li>Ignorar el reactivo limitante: calcular el rendimiento sin comprobar quién se agota primero da resultados imposibles.</li>
              <li>Usar la masa atómica en lugar de la molar para compuestos (H₂O tiene masa molar 18, no 1+8=9).</li>
              <li>Olvidar los coeficientes al calcular masas molares de iones o fórmulas complejas (ej: 2NaCl → sumar 2 × 58,44).</li>
              <li>Asumir rendimiento del 100% en experimentos reales sin verificar pureza de reactivos ni condiciones.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-reacciones-quimicas')} />
        <ShareCard appName="simulador-reacciones-quimicas" />
      </main>

      <Footer appName="simulador-reacciones-quimicas" />
    </div>
  );
}
