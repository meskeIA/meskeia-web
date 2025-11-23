'use client';

import { useState, useEffect } from 'react';
import styles from './ImpuestoSucesionesNacional.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { metadata, jsonLd, faqJsonLd, breadcrumbJsonLd } from './metadata';

// Interfaces
interface TramoTarifa {
  hasta: number;
  cuota: number;
  resto: number;
  tipo: number;
}

interface BonificacionGrupo {
  porcentaje?: number;
  limite?: number | null;
  exencion?: number;
  reduccionBase?: number;
  tope?: number;
  porcentajeMayor?: number;
  escalonado?: Array<{ hasta?: number; desde?: number; porcentaje: number }>;
}

interface ConfigBonificacion {
  nombre: string;
  bonificaciones: Record<string, BonificacionGrupo>;
}

interface DatosFormulario {
  comunidadAutonoma: string;
  saldosCuentas: number;
  accionesFondos: number;
  inmuebles: number;
  vehiculos: number;
  otrosBienes: number;
  seguroVida: number;
  hipotecas: number;
  prestamos: number;
  gastosEntierro: number;
  grupoParentesco: string;
  edadHeredero: number;
  patrimonioPreexistente: string;
  discapacidad: number;
  viviendaHabitual: number;
  hipotecaVivienda: number;
  tipoAdquisicion: 'plena' | 'usufructo' | 'nuda';
  edadUsufructuario: number;
}

interface DetalleReduccion {
  tipo: string;
  importe: number;
}

interface Reducciones {
  total: number;
  detalles: DetalleReduccion[];
}

interface ResultadoBonificacion {
  bonificacion: number;
  porcentaje: number;
  detalle: string;
}

interface Resultado {
  totalActivos: number;
  totalDeudas: number;
  baseImponible: number;
  reducciones: Reducciones;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficiente: number;
  cuotaTributaria: number;
  bonificacionCCAA: ResultadoBonificacion;
  cuotaFinal: number;
}

// Constantes - BONIFICACIONES por CCAA
const BONIFICACIONES_CCAA: Record<string, ConfigBonificacion> = {
  madrid: {
    nombre: 'Comunidad de Madrid',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0.5, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  andalucia: {
    nombre: 'Andalucía',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, exencion: 1000000 },
      'I-descendiente': { porcentaje: 0.99, exencion: 1000000 },
      II: { porcentaje: 0.99, exencion: 1000000 },
      'II-ascendiente': { porcentaje: 0.99, exencion: 1000000 },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  galicia: {
    nombre: 'Galicia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, exencion: 1000000 },
      'I-descendiente': { porcentaje: 0.99, exencion: 1000000 },
      II: { porcentaje: 0.99, exencion: 1000000 },
      'II-ascendiente': { porcentaje: 0.99, exencion: 1000000 },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  murcia: {
    nombre: 'Región de Murcia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0.5, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  valencia: {
    nombre: 'Comunidad Valenciana',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  extremadura: {
    nombre: 'Extremadura',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  canarias: {
    nombre: 'Canarias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.999, limite: null },
      'I-descendiente': { porcentaje: 0.999, limite: null },
      II: { porcentaje: 0.999, limite: null },
      'II-ascendiente': { porcentaje: 0.999, limite: null },
      III: { porcentaje: 0.999, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  'castilla-leon': {
    nombre: 'Castilla y León',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  rioja: {
    nombre: 'La Rioja',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'I-descendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      II: { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'II-ascendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  'castilla-mancha': {
    nombre: 'Castilla-La Mancha',
    bonificaciones: {
      'I-conyuge': {
        escalonado: [
          { hasta: 175000, porcentaje: 1.0 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.9 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.8 },
        ],
      },
      'I-descendiente': {
        escalonado: [
          { hasta: 175000, porcentaje: 1.0 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.9 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.8 },
        ],
      },
      II: {
        escalonado: [
          { hasta: 175000, porcentaje: 1.0 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.9 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.8 },
        ],
      },
      'II-ascendiente': {
        escalonado: [
          { hasta: 175000, porcentaje: 1.0 },
          { hasta: 225000, porcentaje: 0.95 },
          { hasta: 275000, porcentaje: 0.9 },
          { hasta: 300000, porcentaje: 0.85 },
          { desde: 300000, porcentaje: 0.8 },
        ],
      },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  cantabria: {
    nombre: 'Cantabria',
    bonificaciones: {
      'I-conyuge': {
        escalonado: [
          { hasta: 100000, porcentaje: 1.0 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      'I-descendiente': {
        escalonado: [
          { hasta: 100000, porcentaje: 1.0 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      II: {
        escalonado: [
          { hasta: 100000, porcentaje: 1.0 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      'II-ascendiente': {
        escalonado: [
          { hasta: 100000, porcentaje: 1.0 },
          { desde: 100000, porcentaje: 0.99 },
        ],
      },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  aragon: {
    nombre: 'Aragón',
    bonificaciones: {
      'I-conyuge': { porcentaje: 1.0, limite: 3000000 },
      'I-descendiente': { porcentaje: 1.0, limite: 3000000 },
      II: { porcentaje: 1.0, limite: 3000000 },
      'II-ascendiente': { porcentaje: 1.0, limite: 3000000 },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  baleares: {
    nombre: 'Islas Baleares',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.95, limite: null },
      'II-ascendiente': { porcentaje: 0.95, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
  },
  asturias: {
    nombre: 'Principado de Asturias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0, reduccionBase: 300000 },
      'I-descendiente': { porcentaje: 0, reduccionBase: 300000 },
      II: { porcentaje: 0, reduccionBase: 300000 },
      'II-ascendiente': { porcentaje: 0, reduccionBase: 300000 },
      III: { porcentaje: 0, reduccionBase: 50000 },
      IV: { porcentaje: 0, reduccionBase: 0 },
    },
  },
};

// Reducciones estatales
const REDUCCIONES_PARENTESCO: Record<string, number> = {
  'I-conyuge': 15956.87,
  'I-descendiente': 15956.87,
  II: 15956.87,
  'II-ascendiente': 15956.87,
  III: 7993.46,
  IV: 0,
};

const REDUCCION_EDAD_MENOR_21 = 3990.72;
const REDUCCION_SEGURO_VIDA_MAX = 9195.49;
const REDUCCION_VIVIENDA_MAX = 122606.47;

const REDUCCIONES_DISCAPACIDAD: Record<number, number> = {
  33: 47858.59,
  65: 150253.03,
};

// Tarifa estatal
const TARIFAS: { general: TramoTarifa[] } = {
  general: [
    { hasta: 7993.46, cuota: 0, resto: 7993.46, tipo: 7.65 },
    { hasta: 31956.87, cuota: 611.5, resto: 23963.41, tipo: 8.5 },
    { hasta: 79881.18, cuota: 2648.88, resto: 47924.31, tipo: 9.35 },
    { hasta: 239389.13, cuota: 7127.47, resto: 159507.95, tipo: 10.2 },
    { hasta: 398777.54, cuota: 23409.28, resto: 159388.41, tipo: 15.3 },
    { hasta: 797555.08, cuota: 47798.51, resto: 398777.54, tipo: 21.25 },
    { hasta: Infinity, cuota: 132549.07, resto: Infinity, tipo: 25.5 },
  ],
};

// Coeficientes multiplicadores
const COEFICIENTES: Record<string, number[]> = {
  I: [1.0, 1.05, 1.1, 1.2],
  II: [1.0, 1.05, 1.1, 1.2],
  III: [1.5882, 1.6676, 1.7471, 1.9059],
  IV: [2.0, 2.1, 2.2, 2.4],
};

export default function ImpuestoSucesionesNacional() {
  const [formData, setFormData] = useState<DatosFormulario>({
    comunidadAutonoma: '',
    saldosCuentas: 0,
    accionesFondos: 0,
    inmuebles: 0,
    vehiculos: 0,
    otrosBienes: 0,
    seguroVida: 0,
    hipotecas: 0,
    prestamos: 0,
    gastosEntierro: 0,
    grupoParentesco: '',
    edadHeredero: 25,
    patrimonioPreexistente: '1',
    discapacidad: 0,
    viviendaHabitual: 0,
    hipotecaVivienda: 0,
    tipoAdquisicion: 'plena',
    edadUsufructuario: 70,
  });

  const [totalActivos, setTotalActivos] = useState(0);
  const [totalDeudas, setTotalDeudas] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [showEducationalContent, setShowEducationalContent] = useState(false);

  // Calcular totales automáticamente
  useEffect(() => {
    const activos =
      formData.saldosCuentas +
      formData.accionesFondos +
      formData.inmuebles +
      formData.vehiculos +
      formData.otrosBienes +
      formData.seguroVida;

    const deudas = formData.hipotecas + formData.prestamos + formData.gastosEntierro;

    setTotalActivos(activos);
    setTotalDeudas(deudas);
  }, [
    formData.saldosCuentas,
    formData.accionesFondos,
    formData.inmuebles,
    formData.vehiculos,
    formData.otrosBienes,
    formData.seguroVida,
    formData.hipotecas,
    formData.prestamos,
    formData.gastosEntierro,
  ]);

  const formatearMoneda = (cantidad: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(cantidad);
  };

  const calcularTarifa = (base: number): number => {
    let cuotaTotal = 0;
    let baseRestante = base;

    for (const tramo of TARIFAS.general) {
      if (baseRestante <= 0) break;

      const baseTramo = Math.min(baseRestante, tramo.resto);
      cuotaTotal += tramo.cuota + (baseTramo * tramo.tipo) / 100;
      baseRestante -= tramo.resto;
    }

    return cuotaTotal;
  };

  const obtenerCoeficiente = (grupoParentesco: string, patrimonioPreexistente: string): number => {
    let grupoBase = grupoParentesco;
    if (grupoParentesco === 'I-conyuge' || grupoParentesco === 'I-descendiente') {
      grupoBase = 'I';
    } else if (grupoParentesco === 'II-ascendiente') {
      grupoBase = 'II';
    }

    const indicePatrimonio = parseInt(patrimonioPreexistente) - 1;
    return COEFICIENTES[grupoBase][indicePatrimonio];
  };

  const calcularValorUsufructo = (edad: number): number => {
    const porcentaje = Math.max(10, 89 - edad);
    return porcentaje / 100;
  };

  const aplicarReducciones = (baseImponible: number, datos: DatosFormulario): Reducciones => {
    let reducciones = 0;
    const detallesReducciones: DetalleReduccion[] = [];

    // Reducción personal por parentesco (estatal)
    const reduccionParentesco = REDUCCIONES_PARENTESCO[datos.grupoParentesco] || 0;
    if (reduccionParentesco > 0) {
      reducciones += reduccionParentesco;
      detallesReducciones.push({
        tipo: `Reducción estatal parentesco (${datos.grupoParentesco})`,
        importe: reduccionParentesco,
      });
    }

    // Reducción adicional por edad (menores de 21 años)
    if (datos.grupoParentesco === 'I-descendiente' && datos.edadHeredero < 21) {
      const reduccionEdad = REDUCCION_EDAD_MENOR_21 * (21 - datos.edadHeredero);
      reducciones += reduccionEdad;
      detallesReducciones.push({
        tipo: `Reducción por edad (${21 - datos.edadHeredero} años hasta 21)`,
        importe: reduccionEdad,
      });
    }

    // Reducción por discapacidad (estatal)
    if (datos.discapacidad === 33) {
      reducciones += REDUCCIONES_DISCAPACIDAD[33];
      detallesReducciones.push({
        tipo: 'Reducción discapacidad 33-64% (estatal)',
        importe: REDUCCIONES_DISCAPACIDAD[33],
      });
    } else if (datos.discapacidad === 65) {
      reducciones += REDUCCIONES_DISCAPACIDAD[65];
      detallesReducciones.push({
        tipo: 'Reducción discapacidad ≥65% (estatal)',
        importe: REDUCCIONES_DISCAPACIDAD[65],
      });
    }

    // Reducción seguro de vida (estatal)
    if (datos.seguroVida > 0) {
      const puedeAplicar =
        datos.grupoParentesco === 'I-conyuge' ||
        datos.grupoParentesco === 'I-descendiente' ||
        datos.grupoParentesco === 'II' ||
        datos.grupoParentesco === 'II-ascendiente';

      if (puedeAplicar) {
        const reduccionSeguro = Math.min(datos.seguroVida, REDUCCION_SEGURO_VIDA_MAX);
        reducciones += reduccionSeguro;
        detallesReducciones.push({
          tipo: 'Seguro de vida (máx. 9.195,49 € estatal)',
          importe: reduccionSeguro,
        });
      }
    }

    // Reducción vivienda habitual (estatal)
    if (datos.viviendaHabitual > 0) {
      const puedeAplicar =
        datos.grupoParentesco === 'I-conyuge' ||
        datos.grupoParentesco === 'I-descendiente' ||
        datos.grupoParentesco === 'II' ||
        datos.grupoParentesco === 'II-ascendiente';

      if (puedeAplicar) {
        const valorNetoVivienda = Math.max(0, datos.viviendaHabitual - datos.hipotecaVivienda);
        const reduccionVivienda = Math.min(valorNetoVivienda * 0.95, REDUCCION_VIVIENDA_MAX);
        reducciones += reduccionVivienda;
        detallesReducciones.push({
          tipo: 'Vivienda habitual 95% (máx. 122.606,47 € estatal)',
          importe: reduccionVivienda,
        });
      }
    }

    // Reducción adicional de Asturias en base imponible
    if (datos.comunidadAutonoma === 'asturias') {
      const configCCAA = BONIFICACIONES_CCAA['asturias'].bonificaciones[datos.grupoParentesco];
      if (configCCAA && configCCAA.reduccionBase && configCCAA.reduccionBase > 0) {
        reducciones += configCCAA.reduccionBase;
        detallesReducciones.push({
          tipo: `Reducción Asturias base imponible (${datos.grupoParentesco})`,
          importe: configCCAA.reduccionBase,
        });
      }
    }

    return { total: reducciones, detalles: detallesReducciones };
  };

  const aplicarBonificacionCCAA = (
    cuotaTributaria: number,
    baseLiquidable: number,
    ccaa: string,
    grupoParentesco: string
  ): ResultadoBonificacion => {
    const config = BONIFICACIONES_CCAA[ccaa];
    if (!config)
      return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

    const bonifGrupo = config.bonificaciones[grupoParentesco];
    if (!bonifGrupo)
      return { bonificacion: 0, porcentaje: 0, detalle: 'Grupo no aplica bonificación' };

    // Caso 1: Exención total por importe
    if (bonifGrupo.exencion && baseLiquidable < bonifGrupo.exencion) {
      return {
        bonificacion: cuotaTributaria,
        porcentaje: 100,
        detalle: `Exención total (base < ${formatearMoneda(bonifGrupo.exencion)})`,
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
    if (
      bonifGrupo.tope &&
      baseLiquidable > bonifGrupo.tope &&
      bonifGrupo.porcentajeMayor
    ) {
      const bonif = cuotaTributaria * bonifGrupo.porcentajeMayor;
      return {
        bonificacion: bonif,
        porcentaje: bonifGrupo.porcentajeMayor * 100,
        detalle: `Bonificación ${(bonifGrupo.porcentajeMayor * 100).toFixed(0)}% (base > ${formatearMoneda(bonifGrupo.tope)})`,
      };
    }

    // Caso 4: Bonificación fija
    if (typeof bonifGrupo.porcentaje === 'number' && bonifGrupo.porcentaje > 0) {
      const bonif = cuotaTributaria * bonifGrupo.porcentaje;
      return {
        bonificacion: bonif,
        porcentaje: bonifGrupo.porcentaje * 100,
        detalle: `Bonificación ${(bonifGrupo.porcentaje * 100).toFixed(1)}% (${config.nombre})`,
      };
    }

    // Caso 5: Sin bonificación (Asturias para mayoría de casos)
    return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación autonómica' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.comunidadAutonoma) {
      alert('Por favor, selecciona una Comunidad Autónoma');
      return;
    }

    if (totalActivos === 0) {
      alert('Por favor, introduce al menos un activo de la herencia');
      return;
    }

    // Base imponible
    let baseImponible = totalActivos - totalDeudas;

    // Ajustar por tipo de adquisición
    if (formData.tipoAdquisicion === 'usufructo') {
      const porcentajeUsufructo = calcularValorUsufructo(formData.edadUsufructuario);
      baseImponible = baseImponible * porcentajeUsufructo;
    } else if (formData.tipoAdquisicion === 'nuda') {
      const porcentajeUsufructo = calcularValorUsufructo(formData.edadUsufructuario);
      baseImponible = baseImponible * (1 - porcentajeUsufructo);
    }

    // Aplicar reducciones (estatales + Asturias en base)
    const reducciones = aplicarReducciones(baseImponible, formData);
    const baseLiquidable = Math.max(0, baseImponible - reducciones.total);

    // Calcular cuota íntegra
    const cuotaIntegra = calcularTarifa(baseLiquidable);

    // Aplicar coeficiente multiplicador
    const coeficiente = obtenerCoeficiente(formData.grupoParentesco, formData.patrimonioPreexistente);
    const cuotaTributaria = cuotaIntegra * coeficiente;

    // Aplicar bonificación autonómica
    const bonificacionCCAA = aplicarBonificacionCCAA(
      cuotaTributaria,
      baseLiquidable,
      formData.comunidadAutonoma,
      formData.grupoParentesco
    );
    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacionCCAA.bonificacion);

    setResultado({
      totalActivos,
      totalDeudas,
      baseImponible,
      reducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficiente,
      cuotaTributaria,
      bonificacionCCAA,
      cuotaFinal,
    });

    // Scroll suave hasta resultados
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleReset = () => {
    setFormData({
      comunidadAutonoma: '',
      saldosCuentas: 0,
      accionesFondos: 0,
      inmuebles: 0,
      vehiculos: 0,
      otrosBienes: 0,
      seguroVida: 0,
      hipotecas: 0,
      prestamos: 0,
      gastosEntierro: 0,
      grupoParentesco: '',
      edadHeredero: 25,
      patrimonioPreexistente: '1',
      discapacidad: 0,
      viviendaHabitual: 0,
      hipotecaVivienda: 0,
      tipoAdquisicion: 'plena',
      edadUsufructuario: 70,
    });
    setResultado(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <AnalyticsTracker appName="impuesto-sucesiones-nacional" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <MeskeiaLogo />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Calculadora Impuesto de Sucesiones - Régimen Común</h1>
          <p>España 2025 - 14 Comunidades Autónomas</p>
        </div>

        <div className={styles.disclaimerBox}>
          <h3>⚠️ IMPORTANTE - AVISO LEGAL</h3>
          <p>
            <strong>Esta calculadora es únicamente una herramienta informativa y orientativa.</strong>
          </p>
          <p>
            Los resultados obtenidos son estimaciones basadas en la normativa vigente del Impuesto
            sobre Sucesiones en España, pero <strong>NO sustituyen el asesoramiento profesional</strong>.
          </p>
          <p>
            <strong>Recomendamos encarecidamente:</strong>
          </p>
          <ul>
            <li>Consultar con un <strong>Asesor Fiscal profesional</strong> antes de tomar decisiones</li>
            <li>Verificar los requisitos específicos de cada bonificación con la agencia tributaria autonómica</li>
            <li>Confirmar que cumple todos los requisitos legales</li>
          </ul>
          <p>
            meskeIA no se responsabiliza de las decisiones tomadas basándose en estos cálculos.
          </p>
        </div>

        <div className={styles.warningBox}>
          <strong>📍 Comunidades Autónomas con régimen común incluidas:</strong>
          <br />
          Madrid, Andalucía, Galicia, Murcia, Valencia, Extremadura, Canarias, Castilla y León,
          La Rioja, Castilla-La Mancha, Cantabria, Aragón, Baleares, Asturias.
          <br />
          <br />
          <strong>❌ NO aplica para:</strong> Cataluña, País Vasco y Navarra (tienen régimen foral
          propio).
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            {/* Selector de CCAA */}
            <div className={styles.formSection}>
              <h2>Comunidad Autónoma</h2>
              <div className={styles.formGroup}>
                <label htmlFor="comunidadAutonoma">
                  Selecciona tu Comunidad Autónoma
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      Cada comunidad tiene bonificaciones diferentes que se aplicarán automáticamente
                    </span>
                  </span>
                </label>
                <select
                  id="comunidadAutonoma"
                  value={formData.comunidadAutonoma}
                  onChange={(e) =>
                    setFormData({ ...formData, comunidadAutonoma: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="madrid">Madrid</option>
                  <option value="andalucia">Andalucía</option>
                  <option value="galicia">Galicia</option>
                  <option value="murcia">Región de Murcia</option>
                  <option value="valencia">Comunidad Valenciana</option>
                  <option value="extremadura">Extremadura</option>
                  <option value="canarias">Canarias</option>
                  <option value="castilla-leon">Castilla y León</option>
                  <option value="rioja">La Rioja</option>
                  <option value="castilla-mancha">Castilla-La Mancha</option>
                  <option value="cantabria">Cantabria</option>
                  <option value="aragon">Aragón</option>
                  <option value="baleares">Islas Baleares</option>
                  <option value="asturias">Principado de Asturias</option>
                </select>
              </div>
            </div>

            {/* Activos */}
            <div className={styles.formSection}>
              <h2>Activos de la Herencia</h2>

              <div className={styles.formGroup}>
                <label htmlFor="saldosCuentas">Saldos en cuentas bancarias (€)</label>
                <input
                  type="number"
                  id="saldosCuentas"
                  min="0"
                  step="0.01"
                  value={formData.saldosCuentas || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, saldosCuentas: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="accionesFondos">Acciones, fondos de inversión (€)</label>
                <input
                  type="number"
                  id="accionesFondos"
                  min="0"
                  step="0.01"
                  value={formData.accionesFondos || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, accionesFondos: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="inmuebles">Inmuebles (€)</label>
                <input
                  type="number"
                  id="inmuebles"
                  min="0"
                  step="0.01"
                  value={formData.inmuebles || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, inmuebles: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="vehiculos">Vehículos (€)</label>
                <input
                  type="number"
                  id="vehiculos"
                  min="0"
                  step="0.01"
                  value={formData.vehiculos || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, vehiculos: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="otrosBienes">Otros bienes (€)</label>
                <input
                  type="number"
                  id="otrosBienes"
                  min="0"
                  step="0.01"
                  value={formData.otrosBienes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, otrosBienes: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="seguroVida">Seguros de vida (€)</label>
                <input
                  type="number"
                  id="seguroVida"
                  min="0"
                  step="0.01"
                  value={formData.seguroVida || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, seguroVida: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.totalField}>
                <strong>Total activos:</strong> {formatearMoneda(totalActivos)}
              </div>
            </div>

            {/* Deudas */}
            <div className={styles.formSection}>
              <h2>Deudas y Gastos Deducibles</h2>

              <div className={styles.formGroup}>
                <label htmlFor="hipotecas">Hipotecas pendientes (€)</label>
                <input
                  type="number"
                  id="hipotecas"
                  min="0"
                  step="0.01"
                  value={formData.hipotecas || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, hipotecas: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="prestamos">Préstamos y otras deudas (€)</label>
                <input
                  type="number"
                  id="prestamos"
                  min="0"
                  step="0.01"
                  value={formData.prestamos || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, prestamos: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="gastosEntierro">Gastos de entierro y última enfermedad (€)</label>
                <input
                  type="number"
                  id="gastosEntierro"
                  min="0"
                  step="0.01"
                  value={formData.gastosEntierro || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, gastosEntierro: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.totalField}>
                <strong>Total deudas:</strong> {formatearMoneda(totalDeudas)}
              </div>
            </div>

            {/* Heredero */}
            <div className={styles.formSection}>
              <h2>Datos del Heredero</h2>

              <div className={styles.formGroup}>
                <label htmlFor="grupoParentesco">Parentesco con el fallecido</label>
                <select
                  id="grupoParentesco"
                  value={formData.grupoParentesco}
                  onChange={(e) => setFormData({ ...formData, grupoParentesco: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="I-conyuge">Grupo I - Cónyuge</option>
                  <option value="I-descendiente">Grupo I - Descendiente menor de 21 años</option>
                  <option value="II">Grupo II - Descendiente ≥21 años</option>
                  <option value="II-ascendiente">Grupo II - Ascendiente</option>
                  <option value="III">Grupo III - Hermano, tío, sobrino</option>
                  <option value="IV">Grupo IV - Otros</option>
                </select>
              </div>

              {formData.grupoParentesco === 'I-descendiente' && (
                <div className={styles.formGroup}>
                  <label htmlFor="edadHeredero">Edad del heredero</label>
                  <input
                    type="number"
                    id="edadHeredero"
                    min="0"
                    max="20"
                    value={formData.edadHeredero || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, edadHeredero: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="patrimonioPreexistente">Patrimonio preexistente del heredero</label>
                <select
                  id="patrimonioPreexistente"
                  value={formData.patrimonioPreexistente}
                  onChange={(e) =>
                    setFormData({ ...formData, patrimonioPreexistente: e.target.value })
                  }
                  required
                >
                  <option value="1">Hasta 500.000€</option>
                  <option value="2">De 500.000€ a 2.000.000€</option>
                  <option value="3">De 2.000.000€ a 4.000.000€</option>
                  <option value="4">Más de 4.000.000€</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>¿Tiene discapacidad reconocida?</label>
                <div className={styles.radioGroup}>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="discapacidadNo"
                      name="discapacidad"
                      value="0"
                      checked={formData.discapacidad === 0}
                      onChange={(e) =>
                        setFormData({ ...formData, discapacidad: parseInt(e.target.value) })
                      }
                    />
                    <label htmlFor="discapacidadNo">No</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="discapacidad33"
                      name="discapacidad"
                      value="33"
                      checked={formData.discapacidad === 33}
                      onChange={(e) =>
                        setFormData({ ...formData, discapacidad: parseInt(e.target.value) })
                      }
                    />
                    <label htmlFor="discapacidad33">33% - 64%</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="discapacidad65"
                      name="discapacidad"
                      value="65"
                      checked={formData.discapacidad === 65}
                      onChange={(e) =>
                        setFormData({ ...formData, discapacidad: parseInt(e.target.value) })
                      }
                    />
                    <label htmlFor="discapacidad65">65% o más</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Vivienda Habitual */}
            <div className={styles.formSection}>
              <h2>Vivienda Habitual (Opcional)</h2>

              <div className={styles.infoBox}>
                Reducción estatal: 95% del valor hasta máx. 122.606,47 € (requisito: mantener 5 años)
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="viviendaHabitual">Valor vivienda habitual (€)</label>
                <input
                  type="number"
                  id="viviendaHabitual"
                  min="0"
                  step="0.01"
                  value={formData.viviendaHabitual || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, viviendaHabitual: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="hipotecaVivienda">Hipoteca vivienda habitual (€)</label>
                <input
                  type="number"
                  id="hipotecaVivienda"
                  min="0"
                  step="0.01"
                  value={formData.hipotecaVivienda || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, hipotecaVivienda: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Tipo Adquisición */}
            <div className={styles.formSection}>
              <h2>Tipo de Adquisición</h2>

              <div className={styles.formGroup}>
                <label>¿Qué tipo de herencia recibe?</label>
                <div className={styles.radioGroup}>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="herenciaPlena"
                      name="tipoAdquisicion"
                      value="plena"
                      checked={formData.tipoAdquisicion === 'plena'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoAdquisicion: e.target.value as 'plena' | 'usufructo' | 'nuda',
                        })
                      }
                    />
                    <label htmlFor="herenciaPlena">Plena propiedad</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="soloUsufructo"
                      name="tipoAdquisicion"
                      value="usufructo"
                      checked={formData.tipoAdquisicion === 'usufructo'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoAdquisicion: e.target.value as 'plena' | 'usufructo' | 'nuda',
                        })
                      }
                    />
                    <label htmlFor="soloUsufructo">Solo usufructo</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="nudaPropiedad"
                      name="tipoAdquisicion"
                      value="nuda"
                      checked={formData.tipoAdquisicion === 'nuda'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoAdquisicion: e.target.value as 'plena' | 'usufructo' | 'nuda',
                        })
                      }
                    />
                    <label htmlFor="nudaPropiedad">Solo nuda propiedad</label>
                  </div>
                </div>
              </div>

              {(formData.tipoAdquisicion === 'usufructo' || formData.tipoAdquisicion === 'nuda') && (
                <div className={styles.formGroup}>
                  <label htmlFor="edadUsufructuario">Edad del usufructuario</label>
                  <input
                    type="number"
                    id="edadUsufructuario"
                    min="0"
                    max="100"
                    value={formData.edadUsufructuario || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        edadUsufructuario: parseInt(e.target.value) || 70,
                      })
                    }
                    required
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.btnReset} onClick={handleReset}>
                Limpiar formulario
              </button>
              <button type="submit" className={styles.btnCalculate}>
                Calcular Impuesto
              </button>
            </div>
          </form>

          {/* Resultados */}
          {resultado && (
            <div id="results" className={styles.results}>
              <div className={styles.resultSummary}>
                <h3>Impuesto de Sucesiones a Pagar</h3>
                <div className={styles.resultAmount}>{formatearMoneda(resultado.cuotaFinal)}</div>
                <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>
                  Comunidad Autónoma: {BONIFICACIONES_CCAA[formData.comunidadAutonoma].nombre}
                </p>
              </div>

              <div className={styles.resultDetails}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Total activos heredados:</span>
                  <span className={styles.resultValue}>{formatearMoneda(resultado.totalActivos)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Total deudas:</span>
                  <span className={styles.resultValue}>-{formatearMoneda(resultado.totalDeudas)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Base imponible:</span>
                  <span className={styles.resultValue}>{formatearMoneda(resultado.baseImponible)}</span>
                </div>

                {resultado.reducciones.detalles.length > 0 && (
                  <div
                    style={{
                      padding: '1rem',
                      background: 'var(--focus)',
                      borderRadius: '8px',
                      marginTop: '1rem',
                    }}
                  >
                    <strong style={{ color: 'var(--primary)' }}>Reducciones aplicadas:</strong>
                    {resultado.reducciones.detalles.map((red, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '0.5rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{red.tipo}</span>
                        <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                          -{formatearMoneda(red.importe)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Base liquidable:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.baseLiquidable)}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cuota íntegra (tarifa estatal):</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.cuotaIntegra)}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Coeficiente multiplicador:</span>
                  <span className={styles.resultValue}>{resultado.coeficiente.toFixed(4)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cuota tributaria:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.cuotaTributaria)}
                  </span>
                </div>

                {resultado.bonificacionCCAA.bonificacion > 0 ? (
                  <div
                    style={{
                      padding: '1rem',
                      background: '#E8F5E9',
                      borderRadius: '8px',
                      marginTop: '1rem',
                      border: '2px solid #4CAF50',
                    }}
                  >
                    <strong style={{ color: '#2E7D32' }}>
                      ✅ Bonificación {BONIFICACIONES_CCAA[formData.comunidadAutonoma].nombre}:
                    </strong>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.5rem',
                      }}
                    >
                      <span style={{ color: '#2E7D32' }}>
                        {resultado.bonificacionCCAA.detalle}
                      </span>
                      <span style={{ color: '#2E7D32', fontWeight: 700, fontSize: '1.1rem' }}>
                        -{formatearMoneda(resultado.bonificacionCCAA.bonificacion)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1rem',
                      background: '#FFF3CD',
                      borderRadius: '8px',
                      marginTop: '1rem',
                      border: '2px solid #FFC107',
                    }}
                  >
                    <strong style={{ color: '#856404' }}>⚠️ Sin bonificación autonómica</strong>
                    <div style={{ color: '#856404', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      {resultado.bonificacionCCAA.detalle}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REGLA #7: Contenido Educativo Colapsable */}
      <div className={styles.educationalToggle}>
        <h3>💼 Guía del Impuesto de Sucesiones Régimen Común España</h3>
        <p className={styles.educationalSubtitle}>
          Descubre las bonificaciones autonómicas, reducciones estatales y cómo optimizar tu herencia
        </p>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => setShowEducationalContent(!showEducationalContent)}
        >
          {showEducationalContent
            ? '▼ Ocultar contenido educativo'
            : '▶ Mostrar contenido educativo'}
        </button>

        {showEducationalContent && (
          <div className={styles.educationalContent}>
            <div className={styles.eduSection}>
              <h2>🗺️ Bonificaciones por Comunidad Autónoma</h2>
              <p>
                Cada comunidad autónoma aplica bonificaciones diferentes sobre la cuota tributaria.
                Aquí el resumen de las más importantes:
              </p>
              <ul>
                <li>
                  <strong>Madrid, Murcia:</strong> 99% Grupos I/II, 50% Grupo III
                </li>
                <li>
                  <strong>Andalucía, Galicia:</strong> 99% Grupos I/II hasta 1.000.000€
                </li>
                <li>
                  <strong>Valencia, Extremadura, Castilla y León:</strong> 99% Grupos I/II
                </li>
                <li>
                  <strong>Canarias:</strong> 99,9% Grupos I/II/III (máxima bonificación)
                </li>
                <li>
                  <strong>Aragón:</strong> 100% hasta 3.000.000€ Grupos I/II
                </li>
                <li>
                  <strong>Asturias:</strong> Reducción de 300.000€ en base imponible (no bonificación)
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>📊 Reducciones Estatales</h2>
              <p>
                Las reducciones estatales se aplican automáticamente antes de calcular el impuesto:
              </p>
              <ul>
                <li>
                  <strong>Por parentesco:</strong> 15.956,87€ (Grupos I y II), 7.993,46€ (Grupo III)
                </li>
                <li>
                  <strong>Por edad:</strong> 3.990,72€ adicionales por cada año hasta 21 (descendientes)
                </li>
                <li>
                  <strong>Por discapacidad:</strong> 47.858,59€ (33-64%), 150.253,03€ (≥65%)
                </li>
                <li>
                  <strong>Vivienda habitual:</strong> 95% del valor (máx. 122.606,47€)
                </li>
                <li>
                  <strong>Seguro de vida:</strong> Máximo 9.195,49€
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>💰 Tarifa Estatal Progresiva</h2>
              <p>La tarifa estatal se aplica sobre la base liquidable:</p>
              <ul>
                <li>7,65% hasta 7.993,46€</li>
                <li>8,50% de 7.993,46€ a 31.956,87€</li>
                <li>9,35% de 31.956,87€ a 79.881,18€</li>
                <li>10,20% de 79.881,18€ a 239.389,13€</li>
                <li>15,30% de 239.389,13€ a 398.777,54€</li>
                <li>21,25% de 398.777,54€ a 797.555,08€</li>
                <li>25,50% más de 797.555,08€</li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>❓ Preguntas Frecuentes</h2>

              <h3>¿Qué comunidades autónomas usan el régimen común de sucesiones?</h3>
              <p>
                14 comunidades autónomas: Madrid, Andalucía, Galicia, Región de Murcia, Comunidad
                Valenciana, Extremadura, Canarias, Castilla y León, La Rioja, Castilla-La Mancha,
                Cantabria, Aragón, Islas Baleares y Principado de Asturias. NO aplica para Cataluña,
                País Vasco y Navarra (régimen foral propio).
              </p>

              <h3>¿Cuáles son las reducciones estatales por parentesco en sucesiones?</h3>
              <p>
                Grupo I (cónyuge, descendientes &lt;21): 15.956,87 €. Grupo II (descendientes ≥21,
                ascendientes): 15.956,87 €. Grupo III (hermanos, tíos, sobrinos): 7.993,46 €. Grupo
                IV (colaterales ≥4º grado, extraños): 0 €. Además, descendientes menores de 21 años
                tienen reducción adicional de 3.990,72 € por cada año que le falte para cumplir 21.
              </p>

              <h3>¿Qué bonificaciones autonómicas existen en sucesiones?</h3>
              <p>
                Madrid: 99% Grupos I/II, 50% Grupo III. Andalucía, Galicia: 99% Grupos I/II hasta
                1M€. Valencia, Castilla y León, Extremadura: 99% Grupos I/II. Canarias: 99,9% Grupos
                I/II/III. Aragón: 100% hasta 3M€. Asturias: reducción 300K€ en base imponible.
              </p>

              <h3>¿Cuál es la tarifa estatal del Impuesto de Sucesiones?</h3>
              <p>
                Tarifa progresiva estatal: 7,65% (0-7.993,46 €), 8,50% (7.993,46-31.956,87 €), 9,35%
                (31.956,87-79.881,18 €), 10,20% (79.881,18-239.389,13 €), 15,30%
                (239.389,13-398.777,54 €), 21,25% (398.777,54-797.555,08 €), 25,50% (más de
                797.555,08 €).
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
