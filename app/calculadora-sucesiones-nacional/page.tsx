'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import styles from './CalculadoraSucesionesNacional.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import Link from 'next/link';

// ===== TIPOS =====
type GrupoParentesco = 'I-conyuge' | 'I-descendiente' | 'II' | 'II-ascendiente' | 'III' | 'IV';
type TipoAdquisicion = 'plena' | 'usufructo' | 'nuda';

interface BonificacionGrupo {
  porcentaje: number;
  limite?: number | null;
  exencion?: number;
  tope?: number;
  porcentajeMayor?: number;
  reduccionBase?: number;
  escalonado?: Array<{ hasta?: number; desde?: number; porcentaje: number }>;
}

interface BonificacionCCAA {
  nombre: string;
  bonificaciones: Record<string, BonificacionGrupo>;
  notas: string;
}

interface TramoTarifa {
  hasta: number;
  cuota: number;
  resto: number;
  tipo: number;
}

interface Reduccion {
  tipo: string;
  importe: number;
}

// ===== CONSTANTES FISCALES =====

// Tarifa estatal del Impuesto de Sucesiones
const TARIFA_GENERAL: TramoTarifa[] = [
  { hasta: 7993.46, cuota: 0, resto: 7993.46, tipo: 7.65 },
  { hasta: 31956.87, cuota: 611.50, resto: 23963.41, tipo: 8.50 },
  { hasta: 79881.18, cuota: 2648.88, resto: 47924.31, tipo: 9.35 },
  { hasta: 239389.13, cuota: 7127.47, resto: 159507.95, tipo: 10.20 },
  { hasta: 398777.54, cuota: 23409.28, resto: 159388.41, tipo: 15.30 },
  { hasta: 797555.08, cuota: 47798.51, resto: 398777.54, tipo: 21.25 },
  { hasta: Infinity, cuota: 132549.07, resto: Infinity, tipo: 25.50 },
];

// Coeficientes multiplicadores por grupo y patrimonio preexistente
const COEFICIENTES: Record<string, number[]> = {
  'I': [1.0000, 1.0500, 1.1000, 1.2000],
  'II': [1.0000, 1.0500, 1.1000, 1.2000],
  'III': [1.5882, 1.6676, 1.7471, 1.9059],
  'IV': [2.0000, 2.1000, 2.2000, 2.4000],
};

// Reducciones estatales por parentesco
const REDUCCIONES_PARENTESCO: Record<string, number> = {
  'I-conyuge': 15956.87,
  'I-descendiente': 15956.87,
  'II': 15956.87,
  'II-ascendiente': 15956.87,
  'III': 7993.46,
  'IV': 0,
};

// Constantes estatales
const REDUCCION_EDAD_MENOR_21 = 3990.72; // Por cada año menor de 21
const REDUCCION_SEGURO_VIDA_MAX = 9195.49;
const REDUCCION_VIVIENDA_MAX = 122606.47; // 95% con este límite
const REDUCCION_DISCAPACIDAD_33 = 47858.59;
const REDUCCION_DISCAPACIDAD_65 = 150253.03;

// Bonificaciones por Comunidad Autónoma (14 CCAA de régimen común)
const BONIFICACIONES_CCAA: Record<string, BonificacionCCAA> = {
  'madrid': {
    nombre: 'Comunidad de Madrid',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0.50, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II. Grupo III: 50%.',
  },
  'andalucia': {
    nombre: 'Andalucía',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, exencion: 1000000 },
      'I-descendiente': { porcentaje: 0.99, exencion: 1000000 },
      'II': { porcentaje: 0.99, exencion: 1000000 },
      'II-ascendiente': { porcentaje: 0.99, exencion: 1000000 },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Exención total si base liquidable < 1.000.000 €. Si supera, bonificación 99%.',
  },
  'galicia': {
    nombre: 'Galicia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, exencion: 1000000 },
      'I-descendiente': { porcentaje: 0.99, exencion: 1000000 },
      'II': { porcentaje: 0.99, exencion: 1000000 },
      'II-ascendiente': { porcentaje: 0.99, exencion: 1000000 },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Exención total si base liquidable < 1.000.000 €. Si supera, bonificación 99%.',
  },
  'murcia': {
    nombre: 'Región de Murcia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0.50, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II. Grupo III: 50%.',
  },
  'valencia': {
    nombre: 'Comunidad Valenciana',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  'extremadura': {
    nombre: 'Extremadura',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  'canarias': {
    nombre: 'Canarias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.999, limite: null },
      'I-descendiente': { porcentaje: 0.999, limite: null },
      'II': { porcentaje: 0.999, limite: null },
      'II-ascendiente': { porcentaje: 0.999, limite: null },
      'III': { porcentaje: 0.999, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99,9% para Grupos I, II y III. La más favorable de España.',
  },
  'castilla-leon': {
    nombre: 'Castilla y León',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  'rioja': {
    nombre: 'La Rioja',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'I-descendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'II': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'II-ascendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% hasta 500.000 €, 98% si supera ese importe.',
  },
  'castilla-mancha': {
    nombre: 'Castilla-La Mancha',
    bonificaciones: {
      'I-conyuge': {
        porcentaje: 0,
        escalonado: [
          { hasta: 175000, porcentaje: 1.00 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.90 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.80 },
        ],
      },
      'I-descendiente': {
        porcentaje: 0,
        escalonado: [
          { hasta: 175000, porcentaje: 1.00 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.90 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.80 },
        ],
      },
      'II': {
        porcentaje: 0,
        escalonado: [
          { hasta: 175000, porcentaje: 1.00 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.90 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.80 },
        ],
      },
      'II-ascendiente': {
        porcentaje: 0,
        escalonado: [
          { hasta: 175000, porcentaje: 1.00 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.90 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.80 },
        ],
      },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación escalonada: 100% hasta 175.000 €, decrece hasta 80% si supera 300.000 €.',
  },
  'cantabria': {
    nombre: 'Cantabria',
    bonificaciones: {
      'I-conyuge': {
        porcentaje: 0,
        escalonado: [
          { hasta: 100000, porcentaje: 1.00 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      'I-descendiente': {
        porcentaje: 0,
        escalonado: [
          { hasta: 100000, porcentaje: 1.00 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      'II': {
        porcentaje: 0,
        escalonado: [
          { hasta: 100000, porcentaje: 1.00 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      'II-ascendiente': {
        porcentaje: 0,
        escalonado: [
          { hasta: 100000, porcentaje: 1.00 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Exención total hasta 100.000 €, 99% bonificación si supera.',
  },
  'aragon': {
    nombre: 'Aragón',
    bonificaciones: {
      'I-conyuge': { porcentaje: 1.00, limite: 3000000 },
      'I-descendiente': { porcentaje: 1.00, limite: 3000000 },
      'II': { porcentaje: 1.00, limite: 3000000 },
      'II-ascendiente': { porcentaje: 1.00, limite: 3000000 },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 100% hasta 3.000.000 € para Grupos I y II.',
  },
  'baleares': {
    nombre: 'Islas Baleares',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.95, limite: null },
      'II-ascendiente': { porcentaje: 0.95, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% Grupo I, 95% Grupo II.',
  },
  'asturias': {
    nombre: 'Principado de Asturias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0, reduccionBase: 300000 },
      'I-descendiente': { porcentaje: 0, reduccionBase: 300000 },
      'II': { porcentaje: 0, reduccionBase: 300000 },
      'II-ascendiente': { porcentaje: 0, reduccionBase: 300000 },
      'III': { porcentaje: 0, reduccionBase: 50000 },
      'IV': { porcentaje: 0, reduccionBase: 0 },
    },
    notas: 'Sin bonificación. Solo reducción adicional en base (300.000 € Grupos I-II). La más cara de España.',
  },
};

// ===== COMPONENTE INPUT FUERA DEL COMPONENTE PRINCIPAL =====
interface InputCampoProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  icon?: string;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
}

function InputCampo({ id, label, value, onChange, placeholder, helperText, icon, type = 'text', min, max }: InputCampoProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id} className={styles.label}>
        {icon && <span className={styles.labelIcon}>{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        id={id}
        className={styles.input}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
      />
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function CalculadoraSucesionesNacionalPage() {
  // Estados del formulario - Bienes
  const [saldosCuentas, setSaldosCuentas] = useState('');
  const [accionesFondos, setAccionesFondos] = useState('');
  const [inmuebles, setInmuebles] = useState('');
  const [vehiculos, setVehiculos] = useState('');
  const [otrosBienes, setOtrosBienes] = useState('');
  const [seguroVida, setSeguroVida] = useState('');

  // Estados - Deudas
  const [hipotecas, setHipotecas] = useState('');
  const [prestamos, setPrestamos] = useState('');
  const [gastosEntierro, setGastosEntierro] = useState('');

  // Estados - Datos heredero
  const [comunidadAutonoma, setComunidadAutonoma] = useState('');
  const [grupoParentesco, setGrupoParentesco] = useState<GrupoParentesco | ''>('');
  const [edadHeredero, setEdadHeredero] = useState('25');
  const [patrimonioPreexistente, setPatrimonioPreexistente] = useState('1');
  const [discapacidad, setDiscapacidad] = useState<'0' | '33' | '65'>('0');

  // Estados - Vivienda habitual
  const [viviendaHabitual, setViviendaHabitual] = useState('');
  const [hipotecaVivienda, setHipotecaVivienda] = useState('');

  // Estados - Tipo adquisición
  const [tipoAdquisicion, setTipoAdquisicion] = useState<TipoAdquisicion>('plena');
  const [edadUsufructuario, setEdadUsufructuario] = useState('70');

  // Calcular totales en tiempo real
  const totalActivos = useMemo(() => {
    return (
      (parseSpanishNumber(saldosCuentas) || 0) +
      (parseSpanishNumber(accionesFondos) || 0) +
      (parseSpanishNumber(inmuebles) || 0) +
      (parseSpanishNumber(vehiculos) || 0) +
      (parseSpanishNumber(otrosBienes) || 0) +
      (parseSpanishNumber(seguroVida) || 0)
    );
  }, [saldosCuentas, accionesFondos, inmuebles, vehiculos, otrosBienes, seguroVida]);

  const totalDeudas = useMemo(() => {
    return (
      (parseSpanishNumber(hipotecas) || 0) +
      (parseSpanishNumber(prestamos) || 0) +
      (parseSpanishNumber(gastosEntierro) || 0)
    );
  }, [hipotecas, prestamos, gastosEntierro]);

  // Función para calcular usufructo/nuda propiedad
  const calcularValorUsufructo = (edad: number): number => {
    return Math.max(10, 89 - edad) / 100;
  };

  // Función para obtener coeficiente multiplicador
  const obtenerCoeficiente = (grupo: string, patrimonio: string): number => {
    let grupoBase = grupo;
    if (grupo === 'I-conyuge' || grupo === 'I-descendiente') {
      grupoBase = 'I';
    } else if (grupo === 'II-ascendiente') {
      grupoBase = 'II';
    }
    const indice = parseInt(patrimonio) - 1;
    return COEFICIENTES[grupoBase]?.[indice] ?? 1;
  };

  // Función para calcular tarifa
  const calcularTarifa = (base: number): number => {
    let baseRestante = base;

    for (const tramo of TARIFA_GENERAL) {
      if (baseRestante <= tramo.hasta) {
        const baseTramo = Math.min(baseRestante, tramo.resto);
        return tramo.cuota + (baseTramo * tramo.tipo / 100);
      }
    }

    // Si supera todos los tramos, usar el último
    const ultimoTramo = TARIFA_GENERAL[TARIFA_GENERAL.length - 1];
    return ultimoTramo.cuota + (baseRestante * ultimoTramo.tipo / 100);
  };

  // Función para aplicar bonificación autonómica
  const aplicarBonificacionCCAA = (
    cuotaTributaria: number,
    baseLiquidable: number,
    ccaa: string,
    grupo: string
  ): { bonificacion: number; porcentaje: number; detalle: string } => {
    const config = BONIFICACIONES_CCAA[ccaa];
    if (!config) return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

    const bonifGrupo = config.bonificaciones[grupo];
    if (!bonifGrupo) return { bonificacion: 0, porcentaje: 0, detalle: 'Grupo no aplica bonificación' };

    // Caso 1: Exención total por importe
    if (bonifGrupo.exencion && baseLiquidable < bonifGrupo.exencion) {
      return {
        bonificacion: cuotaTributaria,
        porcentaje: 100,
        detalle: `Exención total (base < ${formatCurrency(bonifGrupo.exencion)})`,
      };
    }

    // Caso 2: Bonificación escalonada (Castilla-La Mancha, Cantabria)
    if (bonifGrupo.escalonado && Array.isArray(bonifGrupo.escalonado)) {
      let tramo = null;
      for (const t of bonifGrupo.escalonado) {
        if (t.hasta && baseLiquidable <= t.hasta) {
          tramo = t;
          break;
        } else if (t.desde && baseLiquidable >= t.desde) {
          tramo = t;
        }
      }

      if (tramo) {
        const bonif = cuotaTributaria * tramo.porcentaje;
        return {
          bonificacion: bonif,
          porcentaje: tramo.porcentaje * 100,
          detalle: `Bonificación ${(tramo.porcentaje * 100).toFixed(0)}% (${config.nombre})`,
        };
      }
    }

    // Caso 3: Bonificación con tope (La Rioja)
    if (bonifGrupo.tope && baseLiquidable > bonifGrupo.tope && bonifGrupo.porcentajeMayor) {
      const bonif = cuotaTributaria * bonifGrupo.porcentajeMayor;
      return {
        bonificacion: bonif,
        porcentaje: bonifGrupo.porcentajeMayor * 100,
        detalle: `Bonificación ${(bonifGrupo.porcentajeMayor * 100).toFixed(0)}% (base > ${formatCurrency(bonifGrupo.tope)})`,
      };
    }

    // Caso 4: Bonificación con límite (Aragón)
    if (bonifGrupo.limite && baseLiquidable > bonifGrupo.limite) {
      return {
        bonificacion: 0,
        porcentaje: 0,
        detalle: `Sin bonificación (supera límite de ${formatCurrency(bonifGrupo.limite)})`,
      };
    }

    // Caso 5: Bonificación fija
    if (typeof bonifGrupo.porcentaje === 'number' && bonifGrupo.porcentaje > 0) {
      const bonif = cuotaTributaria * bonifGrupo.porcentaje;
      return {
        bonificacion: bonif,
        porcentaje: bonifGrupo.porcentaje * 100,
        detalle: `Bonificación ${(bonifGrupo.porcentaje * 100).toFixed(1)}% (${config.nombre})`,
      };
    }

    // Caso 6: Sin bonificación (Asturias)
    return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación autonómica' };
  };

  // Cálculo completo
  const resultado = useMemo(() => {
    if (!comunidadAutonoma || !grupoParentesco || totalActivos === 0) {
      return null;
    }

    const seguroVidaNum = parseSpanishNumber(seguroVida);
    const viviendaHabitualNum = parseSpanishNumber(viviendaHabitual);
    const hipotecaViviendaNum = parseSpanishNumber(hipotecaVivienda);
    const edadHerederoNum = parseInt(edadHeredero) || 25;
    const edadUsufructuarioNum = parseInt(edadUsufructuario) || 70;
    const discapacidadNum = parseInt(discapacidad);

    // Base imponible inicial
    let baseImponible = totalActivos - totalDeudas;

    // Ajustar por tipo de adquisición
    if (tipoAdquisicion === 'usufructo') {
      const porcentaje = calcularValorUsufructo(edadUsufructuarioNum);
      baseImponible = baseImponible * porcentaje;
    } else if (tipoAdquisicion === 'nuda') {
      const porcentaje = calcularValorUsufructo(edadUsufructuarioNum);
      baseImponible = baseImponible * (1 - porcentaje);
    }

    // Calcular reducciones
    const reducciones: Reduccion[] = [];
    let totalReducciones = 0;

    // Reducción por parentesco (estatal)
    const reduccionParentesco = REDUCCIONES_PARENTESCO[grupoParentesco] || 0;
    if (reduccionParentesco > 0) {
      reducciones.push({ tipo: `Reducción estatal parentesco`, importe: reduccionParentesco });
      totalReducciones += reduccionParentesco;
    }

    // Reducción por edad (menores de 21)
    if (grupoParentesco === 'I-descendiente' && edadHerederoNum < 21) {
      const reduccionEdad = REDUCCION_EDAD_MENOR_21 * (21 - edadHerederoNum);
      reducciones.push({ tipo: `Reducción por edad (${21 - edadHerederoNum} años hasta 21)`, importe: reduccionEdad });
      totalReducciones += reduccionEdad;
    }

    // Reducción por discapacidad
    if (discapacidadNum === 33) {
      reducciones.push({ tipo: 'Reducción discapacidad 33-64%', importe: REDUCCION_DISCAPACIDAD_33 });
      totalReducciones += REDUCCION_DISCAPACIDAD_33;
    } else if (discapacidadNum === 65) {
      reducciones.push({ tipo: 'Reducción discapacidad ≥65%', importe: REDUCCION_DISCAPACIDAD_65 });
      totalReducciones += REDUCCION_DISCAPACIDAD_65;
    }

    // Reducción seguro de vida
    if (seguroVidaNum > 0) {
      const puedeAplicar = ['I-conyuge', 'I-descendiente', 'II', 'II-ascendiente'].includes(grupoParentesco);
      if (puedeAplicar) {
        const reduccionSeguro = Math.min(seguroVidaNum, REDUCCION_SEGURO_VIDA_MAX);
        reducciones.push({ tipo: 'Seguro de vida (máx. 9.195,49 €)', importe: reduccionSeguro });
        totalReducciones += reduccionSeguro;
      }
    }

    // Reducción vivienda habitual
    if (viviendaHabitualNum > 0) {
      const puedeAplicar = ['I-conyuge', 'I-descendiente', 'II', 'II-ascendiente'].includes(grupoParentesco);
      if (puedeAplicar) {
        const valorNeto = Math.max(0, viviendaHabitualNum - hipotecaViviendaNum);
        const reduccionVivienda = Math.min(valorNeto * 0.95, REDUCCION_VIVIENDA_MAX);
        reducciones.push({ tipo: 'Vivienda habitual 95% (máx. 122.606,47 €)', importe: reduccionVivienda });
        totalReducciones += reduccionVivienda;
      }
    }

    // Reducción adicional de Asturias
    if (comunidadAutonoma === 'asturias') {
      const configAsturias = BONIFICACIONES_CCAA['asturias'].bonificaciones[grupoParentesco];
      if (configAsturias?.reduccionBase && configAsturias.reduccionBase > 0) {
        reducciones.push({ tipo: 'Reducción Asturias (adicional)', importe: configAsturias.reduccionBase });
        totalReducciones += configAsturias.reduccionBase;
      }
    }

    // Base liquidable
    const baseLiquidable = Math.max(0, baseImponible - totalReducciones);

    // Cuota íntegra
    const cuotaIntegra = calcularTarifa(baseLiquidable);

    // Coeficiente multiplicador
    const coeficiente = obtenerCoeficiente(grupoParentesco, patrimonioPreexistente);

    // Cuota tributaria
    const cuotaTributaria = cuotaIntegra * coeficiente;

    // Bonificación autonómica
    const bonificacionCCAA = aplicarBonificacionCCAA(cuotaTributaria, baseLiquidable, comunidadAutonoma, grupoParentesco);

    // Cuota final
    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacionCCAA.bonificacion);

    // Tipo efectivo
    const tipoEfectivo = baseImponible > 0 ? (cuotaFinal / baseImponible) * 100 : 0;

    return {
      baseImponible,
      reducciones,
      totalReducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficiente,
      cuotaTributaria,
      bonificacionCCAA,
      cuotaFinal,
      tipoEfectivo,
      nombreCCAA: BONIFICACIONES_CCAA[comunidadAutonoma]?.nombre || '',
    };
  }, [
    comunidadAutonoma, grupoParentesco, totalActivos, totalDeudas,
    seguroVida, viviendaHabitual, hipotecaVivienda, edadHeredero,
    patrimonioPreexistente, discapacidad, tipoAdquisicion, edadUsufructuario,
  ]);

  // Resetear formulario
  const resetForm = () => {
    setSaldosCuentas('');
    setAccionesFondos('');
    setInmuebles('');
    setVehiculos('');
    setOtrosBienes('');
    setSeguroVida('');
    setHipotecas('');
    setPrestamos('');
    setGastosEntierro('');
    setComunidadAutonoma('');
    setGrupoParentesco('');
    setEdadHeredero('25');
    setPatrimonioPreexistente('1');
    setDiscapacidad('0');
    setViviendaHabitual('');
    setHipotecaVivienda('');
    setTipoAdquisicion('plena');
    setEdadUsufructuario('70');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Calculadora Impuesto de Sucesiones</h1>
        <p className={styles.subtitle}>
          Régimen Común - España (14 Comunidades Autónomas) · 2025
        </p>
      </header>

      {/* Warning Box */}
      <div className={styles.warningBox}>
        <h4>⚠️ Ámbito de Aplicación</h4>
        <p>
          Esta calculadora aplica la normativa de <strong>régimen común</strong> para 14 comunidades autónomas.
          <strong> NO es válida para:</strong> Cataluña (régimen propio), País Vasco y Navarra (régimen foral).
        </p>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta calculadora proporciona <strong>estimaciones orientativas</strong> basadas en la normativa
          del Impuesto de Sucesiones y las bonificaciones autonómicas 2025.
        </p>
        <ul>
          <li>Los resultados NO constituyen asesoramiento fiscal profesional</li>
          <li>Consulta con un asesor fiscal antes de tomar decisiones</li>
          <li>Verifica los requisitos específicos con tu Comunidad Autónoma</li>
        </ul>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de inputs */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>📝 Datos de la Herencia</h2>

          {/* CCAA Info */}
          <div className={styles.ccaaInfo}>
            <h4>🏛️ Selecciona tu Comunidad Autónoma</h4>
            <p>Las bonificaciones varían significativamente entre comunidades. Desde casi 0% en Madrid hasta la tarifa completa en Asturias.</p>
          </div>

          {/* Comunidad Autónoma */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>🏛️ Comunidad Autónoma</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="ccaa" className={styles.label}>
                Comunidad donde residía el fallecido
              </label>
              <select
                id="ccaa"
                className={styles.select}
                value={comunidadAutonoma}
                onChange={(e) => setComunidadAutonoma(e.target.value)}
              >
                <option value="">-- Selecciona tu comunidad --</option>
                <optgroup label="✅ Bonificación 99% (pago casi nulo)">
                  <option value="madrid">Madrid</option>
                  <option value="andalucia">Andalucía</option>
                  <option value="galicia">Galicia</option>
                  <option value="murcia">Región de Murcia</option>
                  <option value="valencia">Comunidad Valenciana</option>
                  <option value="extremadura">Extremadura</option>
                  <option value="canarias">Canarias (99,9%)</option>
                  <option value="castilla-leon">Castilla y León</option>
                  <option value="rioja">La Rioja</option>
                  <option value="aragon">Aragón (100% hasta 3M€)</option>
                </optgroup>
                <optgroup label="⚠️ Bonificación escalonada">
                  <option value="castilla-mancha">Castilla-La Mancha</option>
                  <option value="cantabria">Cantabria</option>
                  <option value="baleares">Islas Baleares</option>
                </optgroup>
                <optgroup label="❌ Sin bonificación">
                  <option value="asturias">Asturias (⚠️ Más cara de España)</option>
                </optgroup>
              </select>
              {comunidadAutonoma && BONIFICACIONES_CCAA[comunidadAutonoma] && (
                <span className={styles.helperText}>
                  {BONIFICACIONES_CCAA[comunidadAutonoma].notas}
                </span>
              )}
            </div>
          </div>

          {/* Bienes y Activos */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>💰 Bienes y Activos</h3>

            <InputCampo
              id="saldos"
              label="Saldos en cuentas bancarias"
              value={saldosCuentas}
              onChange={setSaldosCuentas}
              placeholder="0"
              icon="🏦"
            />

            <InputCampo
              id="acciones"
              label="Acciones, fondos y valores"
              value={accionesFondos}
              onChange={setAccionesFondos}
              placeholder="0"
              helperText="Valor de mercado a fecha del fallecimiento"
              icon="📈"
            />

            <InputCampo
              id="inmuebles"
              label="Inmuebles (valor catastral o real)"
              value={inmuebles}
              onChange={setInmuebles}
              placeholder="0"
              helperText="Si es vivienda habitual, indícalo más abajo"
              icon="🏠"
            />

            <InputCampo
              id="vehiculos"
              label="Vehículos"
              value={vehiculos}
              onChange={setVehiculos}
              placeholder="0"
              icon="🚗"
            />

            <InputCampo
              id="otros"
              label="Otros bienes (joyas, arte, etc.)"
              value={otrosBienes}
              onChange={setOtrosBienes}
              placeholder="0"
              icon="💎"
            />

            <InputCampo
              id="seguro"
              label="Seguro de vida"
              value={seguroVida}
              onChange={setSeguroVida}
              placeholder="0"
              helperText="Reducción hasta 9.195,49 € para Grupos I y II"
              icon="🛡️"
            />

            <div className={styles.totalBox}>
              <span className={styles.totalLabel}>Total Activos:</span>
              <span className={styles.totalValue}>{formatCurrency(totalActivos)}</span>
            </div>
          </div>

          {/* Deudas */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>📉 Deudas y Cargas</h3>

            <InputCampo
              id="hipotecas"
              label="Hipotecas pendientes"
              value={hipotecas}
              onChange={setHipotecas}
              placeholder="0"
              icon="🏦"
            />

            <InputCampo
              id="prestamos"
              label="Préstamos y deudas"
              value={prestamos}
              onChange={setPrestamos}
              placeholder="0"
              icon="💳"
            />

            <InputCampo
              id="entierro"
              label="Gastos de entierro y funeral"
              value={gastosEntierro}
              onChange={setGastosEntierro}
              placeholder="0"
              icon="⚱️"
            />

            <div className={styles.totalBox}>
              <span className={styles.totalLabel}>Total Deudas:</span>
              <span className={styles.totalValue}>{formatCurrency(totalDeudas)}</span>
            </div>
          </div>

          {/* Datos del heredero */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>👤 Datos del Heredero</h3>

            <div className={styles.inputGroup}>
              <label htmlFor="parentesco" className={styles.label}>
                <span className={styles.labelIcon}>👨‍👩‍👧</span>
                Grado de parentesco
              </label>
              <select
                id="parentesco"
                className={styles.select}
                value={grupoParentesco}
                onChange={(e) => setGrupoParentesco(e.target.value as GrupoParentesco)}
              >
                <option value="">-- Selecciona --</option>
                <optgroup label="Grupo I">
                  <option value="I-conyuge">Cónyuge</option>
                  <option value="I-descendiente">Descendiente menor de 21 años</option>
                </optgroup>
                <optgroup label="Grupo II">
                  <option value="II">Descendiente de 21 años o más</option>
                  <option value="II-ascendiente">Ascendiente (padre, madre, abuelo)</option>
                </optgroup>
                <optgroup label="Grupo III">
                  <option value="III">Hermano, tío, sobrino (colaterales 2º-3º)</option>
                </optgroup>
                <optgroup label="Grupo IV">
                  <option value="IV">Primos o más lejanos (sin parentesco)</option>
                </optgroup>
              </select>
            </div>

            {grupoParentesco === 'I-descendiente' && (
              <InputCampo
                id="edadHeredero"
                label="Edad del heredero"
                value={edadHeredero}
                onChange={setEdadHeredero}
                placeholder="18"
                type="number"
                min={0}
                max={20}
                icon="🎂"
              />
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="patrimonio" className={styles.label}>
                <span className={styles.labelIcon}>💼</span>
                Patrimonio preexistente del heredero
              </label>
              <select
                id="patrimonio"
                className={styles.select}
                value={patrimonioPreexistente}
                onChange={(e) => setPatrimonioPreexistente(e.target.value)}
              >
                <option value="1">Menos de 402.678,11 €</option>
                <option value="2">De 402.678,11 € a 2.007.380,43 €</option>
                <option value="3">De 2.007.380,43 € a 4.020.770,98 €</option>
                <option value="4">Más de 4.020.770,98 €</option>
              </select>
              <span className={styles.helperText}>
                Afecta al coeficiente multiplicador del impuesto
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>♿</span>
                ¿Discapacidad reconocida?
              </label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="disc0"
                    name="discapacidad"
                    checked={discapacidad === '0'}
                    onChange={() => setDiscapacidad('0')}
                  />
                  <label htmlFor="disc0">No</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="disc33"
                    name="discapacidad"
                    checked={discapacidad === '33'}
                    onChange={() => setDiscapacidad('33')}
                  />
                  <label htmlFor="disc33">Sí, 33-64%</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="disc65"
                    name="discapacidad"
                    checked={discapacidad === '65'}
                    onChange={() => setDiscapacidad('65')}
                  />
                  <label htmlFor="disc65">Sí, ≥65%</label>
                </div>
              </div>
            </div>
          </div>

          {/* Vivienda habitual */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>🏠 Vivienda Habitual (Opcional)</h3>
            <p className={styles.seccionNota}>
              Reducción del 95% con límite de 122.606,47 € para Grupos I y II
            </p>

            <InputCampo
              id="vivienda"
              label="Valor de la vivienda habitual"
              value={viviendaHabitual}
              onChange={setViviendaHabitual}
              placeholder="0"
              icon="🏡"
            />

            <InputCampo
              id="hipotecaVivienda"
              label="Hipoteca pendiente de la vivienda"
              value={hipotecaVivienda}
              onChange={setHipotecaVivienda}
              placeholder="0"
              icon="🏦"
            />
          </div>

          {/* Tipo de adquisición */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>⚖️ Tipo de Adquisición</h3>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Tipo de derecho adquirido</label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="adqPlena"
                    name="tipoAdq"
                    checked={tipoAdquisicion === 'plena'}
                    onChange={() => setTipoAdquisicion('plena')}
                  />
                  <label htmlFor="adqPlena">Plena propiedad</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="adqUsuf"
                    name="tipoAdq"
                    checked={tipoAdquisicion === 'usufructo'}
                    onChange={() => setTipoAdquisicion('usufructo')}
                  />
                  <label htmlFor="adqUsuf">Solo usufructo</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="adqNuda"
                    name="tipoAdq"
                    checked={tipoAdquisicion === 'nuda'}
                    onChange={() => setTipoAdquisicion('nuda')}
                  />
                  <label htmlFor="adqNuda">Solo nuda propiedad</label>
                </div>
              </div>
            </div>

            {(tipoAdquisicion === 'usufructo' || tipoAdquisicion === 'nuda') && (
              <InputCampo
                id="edadUsuf"
                label="Edad del usufructuario"
                value={edadUsufructuario}
                onChange={setEdadUsufructuario}
                placeholder="70"
                type="number"
                min={0}
                max={120}
                helperText="Porcentaje: 89 - edad (mínimo 10%)"
                icon="👴"
              />
            )}
          </div>

          <button className={styles.btnSecondary} onClick={resetForm}>
            🔄 Limpiar Formulario
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>📊 Resultado del Cálculo</h2>

          {!resultado ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</p>
              <p>Introduce los datos de la herencia para calcular el impuesto.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Selecciona la comunidad autónoma, el parentesco y los activos.
              </p>
            </div>
          ) : (
            <>
              {/* Resultado destacado */}
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Impuesto de Sucesiones a Pagar</span>
                <span className={styles.resultadoValor}>{formatCurrency(resultado.cuotaFinal)}</span>
                <span className={styles.resultadoNota}>{resultado.nombreCCAA}</span>
              </div>

              {/* Detalles */}
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Total activos heredados:</span>
                <span className={styles.resultValue}>{formatCurrency(totalActivos)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Total deudas:</span>
                <span className={styles.resultValue}>-{formatCurrency(totalDeudas)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Base imponible:</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.baseImponible)}</span>
              </div>

              {/* Reducciones */}
              {resultado.reducciones.length > 0 && (
                <div className={styles.reduccionesBox}>
                  <h4>Reducciones aplicadas:</h4>
                  {resultado.reducciones.map((red, idx) => (
                    <div key={idx} className={styles.reduccionItem}>
                      <span>{red.tipo}</span>
                      <span>-{formatCurrency(red.importe)}</span>
                    </div>
                  ))}
                  <div className={styles.reduccionItem} style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <span><strong>Total reducciones:</strong></span>
                    <span><strong>-{formatCurrency(resultado.totalReducciones)}</strong></span>
                  </div>
                </div>
              )}

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Base liquidable:</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.baseLiquidable)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Cuota íntegra (tarifa estatal):</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.cuotaIntegra)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Coeficiente multiplicador:</span>
                <span className={styles.resultValue}>{resultado.coeficiente.toFixed(4)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Cuota tributaria:</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.cuotaTributaria)}</span>
              </div>

              {/* Bonificación autonómica */}
              {resultado.bonificacionCCAA.bonificacion > 0 ? (
                <div className={styles.bonificacionBox}>
                  <h4>✅ Bonificación {resultado.nombreCCAA}</h4>
                  <p>
                    {resultado.bonificacionCCAA.detalle}
                    <br />
                    <span className="valor">-{formatCurrency(resultado.bonificacionCCAA.bonificacion)}</span>
                  </p>
                </div>
              ) : (
                <div className={styles.sinBonificacionBox}>
                  <h4>⚠️ Sin bonificación autonómica</h4>
                  <p>{resultado.bonificacionCCAA.detalle}</p>
                </div>
              )}

              <div className={styles.resultItem} style={{ background: 'rgba(46,134,171,0.1)', marginTop: '1rem' }}>
                <span className={styles.resultLabel}>Tipo efectivo:</span>
                <span className={styles.resultValue}>{resultado.tipoEfectivo.toFixed(2)}%</span>
              </div>

              {/* Enlace a Guía de Herencias */}
              <div className={styles.guiaHerenciasBox}>
                <h4>📋 ¿Necesitas tramitar la herencia completa?</h4>
                <p>
                  Consulta nuestra guía paso a paso con checklist de documentos,
                  orden de gestiones, plazos críticos y costes de notaría.
                </p>
                <Link href="/guia-tramitacion-herencias/" className={styles.guiaHerenciasLink}>
                  Ver Guía de Tramitación de Herencias →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre el Impuesto de Sucesiones?"
        subtitle="Descubre cómo funciona, las diferencias entre CCAA y estrategias de planificación"
      >
        <section className={styles.guideSection}>
          <h2>🏛️ El Impuesto de Sucesiones en España</h2>
          <p className={styles.introParagraph}>
            El Impuesto de Sucesiones grava las adquisiciones de bienes y derechos por herencia.
            Aunque la tarifa es estatal, cada comunidad autónoma puede aplicar sus propias
            reducciones y bonificaciones, lo que genera enormes diferencias entre territorios.
          </p>

          <h3>📊 Grupos de Parentesco</h3>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>Grupo I - Descendientes menores de 21</h4>
              <ul>
                <li>Hijos, nietos menores de 21 años</li>
                <li>Reducción base: 15.956,87 €</li>
                <li>+3.990,72 € por cada año menor de 21</li>
                <li>Las mejores bonificaciones autonómicas</li>
              </ul>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo II - Cónyuge y familiares directos</h4>
              <ul>
                <li>Cónyuge, descendientes ≥21 años</li>
                <li>Ascendientes (padres, abuelos)</li>
                <li>Reducción base: 15.956,87 €</li>
                <li>Bonificaciones similares al Grupo I</li>
              </ul>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo III - Colaterales 2º-3º grado</h4>
              <ul>
                <li>Hermanos, tíos, sobrinos</li>
                <li>Reducción base: 7.993,46 €</li>
                <li>Coeficiente multiplicador mayor (1,59x)</li>
                <li>Bonificaciones muy limitadas</li>
              </ul>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo IV - Sin parentesco</h4>
              <ul>
                <li>Primos, parientes lejanos</li>
                <li>Personas sin parentesco</li>
                <li>Sin reducción por parentesco</li>
                <li>Coeficiente máximo (2x)</li>
              </ul>
            </div>
          </div>

          <h3>🗺️ Comparativa por Comunidades Autónomas</h3>
          <div className={styles.ccaaGrid}>
            <div className={`${styles.ccaaCard} ${styles.alta}`}>
              <h5>Canarias</h5>
              <p>99,9% bonificación. La más favorable de España.</p>
            </div>
            <div className={`${styles.ccaaCard} ${styles.alta}`}>
              <h5>Aragón</h5>
              <p>100% hasta 3M€ para Grupos I y II.</p>
            </div>
            <div className={`${styles.ccaaCard} ${styles.alta}`}>
              <h5>Madrid</h5>
              <p>99% bonificación para Grupos I y II.</p>
            </div>
            <div className={`${styles.ccaaCard} ${styles.alta}`}>
              <h5>Andalucía / Galicia</h5>
              <p>Exención total si base &lt; 1M€.</p>
            </div>
            <div className={`${styles.ccaaCard} ${styles.media}`}>
              <h5>Castilla-La Mancha</h5>
              <p>Escalonado: 100% hasta 175.000€.</p>
            </div>
            <div className={`${styles.ccaaCard} ${styles.media}`}>
              <h5>Baleares</h5>
              <p>99% Grupo I, 95% Grupo II.</p>
            </div>
            <div className={`${styles.ccaaCard} ${styles.baja}`}>
              <h5>Asturias</h5>
              <p>Sin bonificación. Solo reducciones en base.</p>
            </div>
          </div>

          <h3>❓ Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Qué CCAA aplica si el fallecido residía en otra?</summary>
              <p>
                Se aplica la normativa de la comunidad donde el fallecido tuvo su residencia
                habitual durante los últimos 5 años. Si residió en varias, se aplica donde
                residió más tiempo en ese período.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué es el coeficiente multiplicador?</summary>
              <p>
                Es un factor que incrementa la cuota según el patrimonio previo del heredero
                y el grado de parentesco. A mayor patrimonio y menor parentesco, mayor coeficiente
                (de 1,0 a 2,4).
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cómo funciona la reducción por vivienda habitual?</summary>
              <p>
                Se reduce el 95% del valor de la vivienda habitual del fallecido, con un límite
                de 122.606,47 €. Solo aplica a cónyuge, descendientes y ascendientes que mantengan
                la vivienda 10 años.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Se puede dividir la herencia para pagar menos?</summary>
              <p>
                La planificación sucesoria (donaciones en vida, testamento) puede optimizar
                fiscalmente, pero requiere asesoramiento profesional. Las donaciones tienen
                su propio impuesto y plazos de acumulación.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuál es el plazo para pagar?</summary>
              <p>
                6 meses desde el fallecimiento, prorrogables otros 6 meses si se solicita
                antes del quinto mes. El retraso genera recargos e intereses.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué pasa si heredo usufructo en lugar de propiedad?</summary>
              <p>
                El usufructo se valora según la edad del usufructuario (89 - edad, mínimo 10%).
                La nuda propiedad tributa por el resto. Cuando consolide la propiedad, puede
                haber otro pago.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-sucesiones-nacional')}
        title="Herramientas para herencias"
        icon="⚖️"
      />

      <Footer appName="calculadora-sucesiones-nacional" />
    </div>
  );
}
