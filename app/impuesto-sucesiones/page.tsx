'use client';

import { useState, useEffect } from 'react';
import styles from './ImpuestoSucesiones.module.css';
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

interface DatosFormulario {
  // Activos
  saldosCuentas: number;
  accionesFondos: number;
  segurosVida: number;
  viviendaHabitual: number;
  otrosInmuebles: number;
  otrosBienes: number;
  // Pasivos
  hipotecaVivienda: number;
  hipotecaOtros: number;
  otrasDeudas: number;
  // Tipo adquisición
  tipoAdquisicion: 'completa' | 'usufructo' | 'nuda';
  edadUsufructuario: number;
  // Heredero
  grupoParentesco: string;
  edadHeredero: number;
  patrimonioPreexistente: string;
  discapacidad: number;
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
  tipoBonificacion: string;
}

interface Resultado {
  baseImponible: number;
  reducciones: Reducciones;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficiente: number;
  cuotaTributaria: number;
  bonificacion: number;
  tipoBonificacion: string;
  cuotaFinal: number;
  valorNetoHeredado: number;
  ajuarDomestico: number;
}

// Constantes
const TARIFAS: { general: TramoTarifa[] } = {
  general: [
    { hasta: 100000, cuota: 0, resto: 100000, tipo: 7 },
    { hasta: 200000, cuota: 7000, resto: 100000, tipo: 11 },
    { hasta: 400000, cuota: 18000, resto: 200000, tipo: 17 },
    { hasta: 800000, cuota: 52000, resto: 400000, tipo: 24 },
    { hasta: Infinity, cuota: 148000, resto: Infinity, tipo: 32 },
  ],
};

const COEFICIENTES: Record<string, number[]> = {
  I: [1.0, 1.0, 1.0, 1.0],
  II: [1.0, 1.0, 1.0, 1.0],
  III: [1.5882, 1.5882, 1.5882, 1.5882],
  IV: [2.0, 2.0, 2.0, 2.0],
};

export default function ImpuestoSucesiones() {
  const [formData, setFormData] = useState<DatosFormulario>({
    saldosCuentas: 0,
    accionesFondos: 0,
    segurosVida: 0,
    viviendaHabitual: 0,
    otrosInmuebles: 0,
    otrosBienes: 0,
    hipotecaVivienda: 0,
    hipotecaOtros: 0,
    otrasDeudas: 0,
    tipoAdquisicion: 'completa',
    edadUsufructuario: 0,
    grupoParentesco: '',
    edadHeredero: 0,
    patrimonioPreexistente: '1',
    discapacidad: 0,
  });

  const [valorNetoHeredado, setValorNetoHeredado] = useState(0);
  const [ajuarDomestico, setAjuarDomestico] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [showEducationalContent, setShowEducationalContent] = useState(false);

  // Calcular totales automáticamente
  useEffect(() => {
    const totalActivos =
      formData.saldosCuentas +
      formData.accionesFondos +
      formData.segurosVida +
      formData.viviendaHabitual +
      formData.otrosInmuebles +
      formData.otrosBienes;

    const totalPasivos =
      formData.hipotecaVivienda + formData.hipotecaOtros + formData.otrasDeudas;

    const valorNeto = Math.max(0, totalActivos - totalPasivos);
    const ajuar = valorNeto * 0.03;

    setValorNetoHeredado(valorNeto);
    setAjuarDomestico(ajuar);
  }, [
    formData.saldosCuentas,
    formData.accionesFondos,
    formData.segurosVida,
    formData.viviendaHabitual,
    formData.otrosInmuebles,
    formData.otrosBienes,
    formData.hipotecaVivienda,
    formData.hipotecaOtros,
    formData.otrasDeudas,
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
      const cuotaTramo = (baseTramo * tramo.tipo) / 100;
      cuotaTotal = tramo.cuota + cuotaTramo;

      baseRestante -= tramo.resto;

      if (baseRestante <= 0) {
        break;
      }
    }

    return cuotaTotal;
  };

  const obtenerCoeficiente = (grupo: string, patrimonio: string): number => {
    let grupoBase = grupo;
    if (grupo.startsWith('I-')) grupoBase = 'I';
    if (grupo.startsWith('II-')) grupoBase = 'II';

    const indicePatrimonio = parseInt(patrimonio) - 1;
    return COEFICIENTES[grupoBase][indicePatrimonio];
  };

  const calcularValorUsufructo = (edad: number): number => {
    const porcentaje = Math.max(10, 89 - edad);
    return porcentaje / 100;
  };

  const aplicarReducciones = (baseImponible: number, datos: DatosFormulario): Reducciones => {
    let reducciones = 0;
    const detallesReducciones: DetalleReduccion[] = [];

    // Reducción personal por parentesco
    if (datos.grupoParentesco === 'I-conyuge' || datos.grupoParentesco === 'I-descendiente') {
      reducciones += 100000;
      detallesReducciones.push({
        tipo: 'Reducción Grupo I',
        importe: 100000,
      });
    } else if (datos.grupoParentesco === 'II' || datos.grupoParentesco === 'II-ascendiente') {
      reducciones += 50000;
      detallesReducciones.push({
        tipo: 'Reducción Grupo II',
        importe: 50000,
      });
    }

    // Reducción adicional por edad (menores de 21 años, Grupo I)
    if (datos.grupoParentesco === 'I-descendiente' && datos.edadHeredero < 21) {
      const reduccionEdad = 12000 * (21 - datos.edadHeredero);
      reducciones += reduccionEdad;
      detallesReducciones.push({
        tipo: `Reducción por edad (${21 - datos.edadHeredero} años)`,
        importe: reduccionEdad,
      });
    }

    // Reducción por discapacidad
    if (datos.discapacidad === 33) {
      reducciones += 275000;
      detallesReducciones.push({
        tipo: 'Reducción discapacidad 33-64%',
        importe: 275000,
      });
    } else if (datos.discapacidad === 65) {
      reducciones += 650000;
      detallesReducciones.push({
        tipo: 'Reducción discapacidad ≥65%',
        importe: 650000,
      });
    }

    // Reducción vivienda habitual (automática si hay valor y cumple parentesco)
    if (datos.viviendaHabitual > 0) {
      const puedeAplicar =
        datos.grupoParentesco === 'I-conyuge' ||
        datos.grupoParentesco === 'I-descendiente' ||
        datos.grupoParentesco === 'II' ||
        datos.grupoParentesco === 'II-ascendiente';

      if (puedeAplicar) {
        const valorNetoVivienda = Math.max(0, datos.viviendaHabitual - datos.hipotecaVivienda);
        const reduccionVivienda = Math.min(valorNetoVivienda * 0.95, 500000);
        reducciones += reduccionVivienda;
        detallesReducciones.push({
          tipo: 'Vivienda habitual (95%)',
          importe: reduccionVivienda,
        });
      }
    }

    return { total: reducciones, detalles: detallesReducciones };
  };

  const aplicarBonificaciones = (
    cuotaTributaria: number,
    datos: DatosFormulario,
    baseLiquidable: number
  ): ResultadoBonificacion => {
    let bonificacion = 0;
    let tipoBonificacion = '';

    // Bonificación del 99% para cónyuge
    if (datos.grupoParentesco === 'I-conyuge') {
      bonificacion = cuotaTributaria * 0.99;
      tipoBonificacion = 'Bonificación cónyuge 99%';
    }
    // Bonificación para Grupo II (descendientes y ascendientes)
    else if (datos.grupoParentesco === 'II' || datos.grupoParentesco === 'II-ascendiente') {
      let porcentaje = 0;

      if (baseLiquidable <= 100000) {
        porcentaje = 0.6;
      } else if (baseLiquidable <= 200000) {
        porcentaje = 0.6 - ((baseLiquidable - 100000) / 100000) * 0.1;
      } else if (baseLiquidable <= 300000) {
        porcentaje = 0.5 - ((baseLiquidable - 200000) / 100000) * 0.1;
      } else if (baseLiquidable <= 500000) {
        porcentaje = 0.4 - ((baseLiquidable - 300000) / 200000) * 0.15;
      } else if (baseLiquidable <= 750000) {
        porcentaje = 0.25 - ((baseLiquidable - 500000) / 250000) * 0.05;
      } else {
        porcentaje = 0.2;
      }

      bonificacion = cuotaTributaria * porcentaje;
      tipoBonificacion = `Bonificación Grupo II (${(porcentaje * 100).toFixed(0)}%)`;
    }
    // Bonificación para Grupo I descendientes
    else if (datos.grupoParentesco === 'I-descendiente') {
      // Bonificación 95% si base ≤100K, 99% si >100K
      const porcentaje = baseLiquidable <= 100000 ? 0.95 : 0.99;
      bonificacion = cuotaTributaria * porcentaje;
      tipoBonificacion = `Bonificación Grupo I (${(porcentaje * 100).toFixed(0)}%)`;
    }

    return { bonificacion, tipoBonificacion };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calcular base imponible
    let baseImponible = valorNetoHeredado + ajuarDomestico;

    // Ajustar por tipo de adquisición
    if (formData.tipoAdquisicion === 'usufructo') {
      const porcentajeUsufructo = calcularValorUsufructo(formData.edadUsufructuario);
      baseImponible = baseImponible * porcentajeUsufructo;
    } else if (formData.tipoAdquisicion === 'nuda') {
      const porcentajeUsufructo = calcularValorUsufructo(formData.edadUsufructuario);
      baseImponible = baseImponible * (1 - porcentajeUsufructo);
    }

    // Aplicar reducciones
    const reducciones = aplicarReducciones(baseImponible, formData);
    const baseLiquidable = Math.max(0, baseImponible - reducciones.total);

    // Calcular cuota íntegra
    const cuotaIntegra = calcularTarifa(baseLiquidable);

    // Aplicar coeficiente multiplicador
    const coeficiente = obtenerCoeficiente(formData.grupoParentesco, formData.patrimonioPreexistente);
    const cuotaTributaria = cuotaIntegra * coeficiente;

    // Aplicar bonificaciones
    const { bonificacion, tipoBonificacion } = aplicarBonificaciones(
      cuotaTributaria,
      formData,
      baseLiquidable
    );
    const cuotaFinal = cuotaTributaria - bonificacion;

    setResultado({
      baseImponible,
      reducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficiente,
      cuotaTributaria,
      bonificacion,
      tipoBonificacion,
      cuotaFinal,
      valorNetoHeredado,
      ajuarDomestico,
    });

    // Scroll suave hasta resultados
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleReset = () => {
    setFormData({
      saldosCuentas: 0,
      accionesFondos: 0,
      segurosVida: 0,
      viviendaHabitual: 0,
      otrosInmuebles: 0,
      otrosBienes: 0,
      hipotecaVivienda: 0,
      hipotecaOtros: 0,
      otrasDeudas: 0,
      tipoAdquisicion: 'completa',
      edadUsufructuario: 0,
      grupoParentesco: '',
      edadHeredero: 0,
      patrimonioPreexistente: '1',
      discapacidad: 0,
    });
    setResultado(null);
  };

  return (
    <>
      <AnalyticsTracker appName="impuesto-sucesiones" />
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
          <h1>Calculadora Impuesto de Sucesiones</h1>
          <p>Cataluña 2025 - Herramienta Informativa</p>
        </div>

        <div className={styles.disclaimerBox}>
          <div className={styles.disclaimerTitle}>⚠️ IMPORTANTE - AVISO LEGAL</div>
          <div className={styles.disclaimerContent}>
            <strong>Esta calculadora es únicamente una herramienta informativa y orientativa.</strong>
            <br />
            <br />
            Los resultados obtenidos son estimaciones basadas en la normativa vigente del Impuesto
            sobre Sucesiones y Donaciones en Cataluña, pero{' '}
            <strong>NO sustituyen el asesoramiento profesional</strong>.
            <br />
            <br />
            Cada situación fiscal es única y puede estar sujeta a particularidades no contempladas
            en esta herramienta.
            <br />
            <br />
            <strong>Recomendamos encarecidamente:</strong>
            <ul style={{ margin: '10px 0 0 20px' }}>
              <li>
                Consultar con un <strong>Asesor Fiscal profesional</strong> antes de tomar
                decisiones
              </li>
              <li>
                Verificar los requisitos específicos de cada reducción con la{' '}
                <strong>Agència Tributària de Catalunya</strong>
              </li>
              <li>
                Confirmar que cumple todos los requisitos legales para las reducciones aplicables
              </li>
            </ul>
            <br />
            meskeIA no se responsabiliza de las decisiones tomadas basándose en estos cálculos. El
            uso de esta herramienta implica la aceptación de estas condiciones.
          </div>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            {/* Sección 1: Bienes y Deudas */}
            <div className={styles.formSection}>
              <h3>Bienes y Deudas de la Herencia</h3>

              <div className={styles.infoBox}>
                <strong>📌 Nota importante:</strong> Los Planes de Pensiones del fallecido NO se
                incluyen aquí. Los beneficiarios los reciben directamente y tributan por IRPF como
                rendimiento del trabajo, no por el Impuesto de Sucesiones.
              </div>

              {/* Activos */}
              <div className={styles.formSubsection}>
                <h4>ACTIVOS - Bienes que recibe</h4>

                <div className={styles.formGroup}>
                  <label htmlFor="saldosCuentas">
                    Saldos en cuentas bancarias (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Suma total de todas las cuentas corrientes, de ahorro y depósitos del
                        fallecido
                      </span>
                    </span>
                  </label>
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
                  <label htmlFor="accionesFondos">
                    Acciones, fondos de inversión y otros valores (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Valor de mercado de acciones, participaciones en fondos, bonos y otros
                        valores mobiliarios
                      </span>
                    </span>
                  </label>
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
                  <label htmlFor="segurosVida">
                    Seguros de vida a favor del heredero (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Importe total de seguros de vida donde usted es beneficiario
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="segurosVida"
                    min="0"
                    step="0.01"
                    value={formData.segurosVida || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, segurosVida: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="viviendaHabitual">
                    Vivienda habitual del causante (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Valor de mercado de la vivienda donde residía habitualmente el fallecido. Se
                        aplicará reducción del 95% (máx. 500.000€) si cumple requisitos
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="viviendaHabitual"
                    min="0"
                    step="0.01"
                    value={formData.viviendaHabitual || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        viviendaHabitual: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="otrosInmuebles">
                    Otros inmuebles (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Segundas residencias, locales, terrenos, plazas de garaje, etc.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="otrosInmuebles"
                    min="0"
                    step="0.01"
                    value={formData.otrosInmuebles || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, otrosInmuebles: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="otrosBienes">
                    Otros bienes (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Vehículos, joyas, obras de arte, muebles de valor, etc.
                      </span>
                    </span>
                  </label>
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
              </div>

              {/* Pasivos */}
              <div className={styles.formSubsection}>
                <h4>PASIVOS - Deudas que se descuentan</h4>

                <div className={styles.formGroup}>
                  <label htmlFor="hipotecaVivienda">
                    Hipoteca sobre la vivienda habitual (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Importe pendiente de pago de la hipoteca sobre la vivienda habitual
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="hipotecaVivienda"
                    min="0"
                    step="0.01"
                    value={formData.hipotecaVivienda || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hipotecaVivienda: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="hipotecaOtros">
                    Hipotecas sobre otros inmuebles (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Importe pendiente de hipotecas sobre segundas residencias u otros inmuebles
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="hipotecaOtros"
                    min="0"
                    step="0.01"
                    value={formData.hipotecaOtros || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, hipotecaOtros: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="otrasDeudas">
                    Otras deudas del causante (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Préstamos personales, tarjetas de crédito, deudas con proveedores, etc.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="otrasDeudas"
                    min="0"
                    step="0.01"
                    value={formData.otrasDeudas || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, otrasDeudas: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              {/* Totales */}
              <div className={styles.formSubsection}>
                <h4>RESUMEN</h4>

                <div className={styles.formGroup}>
                  <label htmlFor="valorNetoHeredado">
                    Valor neto heredado (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Total activos menos total pasivos. Se calcula automáticamente.
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    id="valorNetoHeredado"
                    value={formatearMoneda(valorNetoHeredado)}
                    readOnly
                    className={styles.totalField}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="ajuarDomestico">
                    Ajuar doméstico - 3% (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Por ley se presume que el ajuar doméstico vale el 3% del caudal hereditario
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    id="ajuarDomestico"
                    value={formatearMoneda(ajuarDomestico)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Tipo de Adquisición */}
            <div className={styles.formSection}>
              <h3>Tipo de Adquisición</h3>

              <div className={styles.formGroup}>
                <label>
                  ¿Qué tipo de herencia recibe?
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      El usufructo es el derecho a usar y disfrutar. La nuda propiedad es la
                      propiedad sin el derecho de uso.
                    </span>
                  </span>
                </label>
                <div className={styles.radioGroup}>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="herenciaCompleta"
                      name="tipoAdquisicion"
                      value="completa"
                      checked={formData.tipoAdquisicion === 'completa'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoAdquisicion: e.target.value as 'completa' | 'usufructo' | 'nuda',
                        })
                      }
                    />
                    <label htmlFor="herenciaCompleta">Herencia completa</label>
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
                          tipoAdquisicion: e.target.value as 'completa' | 'usufructo' | 'nuda',
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
                          tipoAdquisicion: e.target.value as 'completa' | 'usufructo' | 'nuda',
                        })
                      }
                    />
                    <label htmlFor="nudaPropiedad">Solo nuda propiedad</label>
                  </div>
                </div>
              </div>

              {(formData.tipoAdquisicion === 'usufructo' || formData.tipoAdquisicion === 'nuda') && (
                <div className={styles.formGroup}>
                  <label htmlFor="edadUsufructuario">
                    Edad del usufructuario
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Necesaria para calcular el valor del usufructo según la fórmula: 89 - edad
                        (mínimo 10%)
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="edadUsufructuario"
                    min="0"
                    max="100"
                    value={formData.edadUsufructuario || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        edadUsufructuario: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              )}
            </div>

            {/* Sección 3: Datos del Heredero */}
            <div className={styles.formSection}>
              <h3>Datos del Heredero</h3>

              <div className={styles.formGroup}>
                <label htmlFor="grupoParentesco">
                  Parentesco con el fallecido
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      El grado de parentesco determina las reducciones y bonificaciones aplicables
                    </span>
                  </span>
                </label>
                <select
                  id="grupoParentesco"
                  value={formData.grupoParentesco}
                  onChange={(e) => setFormData({ ...formData, grupoParentesco: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="I-conyuge">Grupo I - Cónyuge</option>
                  <option value="I-descendiente">Grupo I - Descendiente menor de 21 años</option>
                  <option value="II">Grupo II - Descendiente de 21 o más años</option>
                  <option value="II-ascendiente">Grupo II - Ascendiente</option>
                  <option value="III">Grupo III - Colateral 2º y 3º grado (hermanos, sobrinos)</option>
                  <option value="IV">Grupo IV - Colateral 4º grado o sin parentesco</option>
                </select>
              </div>

              {formData.grupoParentesco && (
                <div className={styles.formGroup}>
                  <label htmlFor="edadHeredero">
                    Edad del heredero
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Para menores de 21 años del Grupo I hay reducciones adicionales
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="edadHeredero"
                    min="0"
                    max={formData.grupoParentesco === 'I-descendiente' ? 20 : 120}
                    value={formData.edadHeredero || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, edadHeredero: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="patrimonioPreexistente">
                  Patrimonio preexistente del heredero
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      Su patrimonio actual antes de recibir la herencia. Afecta al coeficiente
                      multiplicador
                    </span>
                  </span>
                </label>
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
                <label>
                  ¿Tiene algún grado de discapacidad reconocido?
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      Las personas con discapacidad tienen reducciones especiales importantes
                    </span>
                  </span>
                </label>
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

            {/* Sección 4: Información Adicional */}
            <div className={styles.formSection}>
              <h3>Información Adicional</h3>

              <div className={styles.successBox}>
                <strong>📋 Reducciones que se aplicarán automáticamente si corresponden:</strong>
                <br />
                <br />
                • <strong>Vivienda habitual:</strong> Si ha indicado valor en &quot;Vivienda habitual del
                causante&quot; y es cónyuge, descendiente o ascendiente, se aplicará reducción del 95%
                (máx. 500.000€)
                <br />
                • <strong>Reducción personal:</strong> Según su grupo de parentesco
                <br />
                • <strong>Reducción por edad:</strong> Para menores de 21 años del Grupo I
                <br />
                • <strong>Reducción por discapacidad:</strong> Si ha indicado grado de discapacidad
                <br />• <strong>Bonificaciones:</strong> 99% para cónyuge, variable para Grupo II
              </div>

              <div className={styles.warningBox}>
                <strong>⚠️ Casos especiales no incluidos:</strong>
                <br />
                <br />
                • Empresas familiares o negocios profesionales
                <br />
                • Explotaciones agrarias
                <br />
                • Bienes del patrimonio cultural
                <br />• Fideicomisos o legados específicos
                <br />
                <br />
                Para estos casos, consulte con un asesor fiscal especializado.
              </div>
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
              <h3>Resultado del Cálculo</h3>

              <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>
                Composición de la base imponible:
              </h4>

              <div className={styles.resultContent}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Valor neto heredado:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.valorNetoHeredado)}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Ajuar doméstico (3%):</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.ajuarDomestico)}
                  </span>
                </div>

                {formData.tipoAdquisicion !== 'completa' && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>
                      Porcentaje aplicado ({formData.tipoAdquisicion}):
                    </span>
                    <span className={styles.resultValue}>
                      {(
                        (formData.tipoAdquisicion === 'usufructo'
                          ? calcularValorUsufructo(formData.edadUsufructuario)
                          : 1 - calcularValorUsufructo(formData.edadUsufructuario)) * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                )}

                <div
                  className={styles.resultItem}
                  style={{
                    borderTop: '2px solid var(--border)',
                    paddingTop: '10px',
                    marginTop: '10px',
                  }}
                >
                  <span className={styles.resultLabel}>
                    <strong>Base imponible total:</strong>
                  </span>
                  <span className={styles.resultValue}>
                    <strong>{formatearMoneda(resultado.baseImponible)}</strong>
                  </span>
                </div>
              </div>

              <h4 style={{ color: 'var(--primary)', margin: '20px 0 15px 0' }}>
                Reducciones aplicadas:
              </h4>

              <div className={styles.resultContent}>
                {resultado.reducciones.detalles.length > 0 ? (
                  resultado.reducciones.detalles.map((red, idx) => (
                    <div key={idx} className={styles.resultItem}>
                      <span className={styles.resultLabel}>{red.tipo}:</span>
                      <span className={styles.resultValue}>- {formatearMoneda(red.importe)}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.infoBox}>No se aplican reducciones</div>
                )}
              </div>

              <h4 style={{ color: 'var(--primary)', margin: '20px 0 15px 0' }}>
                Liquidación del impuesto:
              </h4>

              <div className={styles.resultContent}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Base liquidable:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.baseLiquidable)}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cuota íntegra:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.cuotaIntegra)}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>
                    Coeficiente multiplicador (Grupo {formData.grupoParentesco.split('-')[0]}):
                  </span>
                  <span className={styles.resultValue}>x {resultado.coeficiente.toFixed(4)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cuota tributaria:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.cuotaTributaria)}
                  </span>
                </div>

                {resultado.bonificacion > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>{resultado.tipoBonificacion}:</span>
                    <span className={styles.resultValue}>
                      - {formatearMoneda(resultado.bonificacion)}
                    </span>
                  </div>
                )}

                <div
                  className={styles.resultItem}
                  style={{
                    borderTop: '2px solid var(--primary)',
                    paddingTop: '15px',
                    marginTop: '15px',
                  }}
                >
                  <span className={styles.resultLabel}>
                    <strong>TOTAL A PAGAR:</strong>
                  </span>
                  <span className={`${styles.resultValue} ${styles.resultTotal}`}>
                    {formatearMoneda(resultado.cuotaFinal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REGLA #7: Contenido Educativo Colapsable */}
      <div className={styles.educationalToggle}>
        <h3>💼 Guía del Impuesto de Sucesiones en Cataluña</h3>
        <p className={styles.educationalSubtitle}>
          Descubre cómo funciona el impuesto, qué reducciones puedes aplicar y cómo optimizar tu
          herencia
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
              <h2>🏠 Reducciones por Vivienda Habitual</h2>
              <p>
                La vivienda habitual del causante goza de una reducción del 95% de su valor, con un
                límite máximo de 500.000€. Esta reducción se aplica automáticamente para cónyuges,
                descendientes y ascendientes.
              </p>
              <ul>
                <li>
                  <strong>Requisito:</strong> Ser cónyuge, descendiente o ascendiente
                </li>
                <li>
                  <strong>Reducción:</strong> 95% del valor neto de la vivienda
                </li>
                <li>
                  <strong>Límite máximo:</strong> 500.000€ de reducción
                </li>
                <li>
                  <strong>Permanencia:</strong> Mantener la vivienda 5 años
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>👥 Grupos de Parentesco</h2>
              <p>
                El grado de parentesco determina las reducciones personales y bonificaciones
                aplicables. Cuanto más cercano sea el parentesco, mayores serán los beneficios
                fiscales.
              </p>
              <ul>
                <li>
                  <strong>Grupo I:</strong> Cónyuges y descendientes menores 21 años
                </li>
                <li>
                  <strong>Grupo II:</strong> Descendientes ≥21 años y ascendientes
                </li>
                <li>
                  <strong>Grupo III:</strong> Colaterales 2º y 3º grado (hermanos, sobrinos)
                </li>
                <li>
                  <strong>Grupo IV:</strong> Colaterales 4º grado y extraños
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>🏆 Bonificaciones Especiales</h2>
              <p>
                Cataluña aplica bonificaciones muy generosas que pueden reducir drásticamente el
                impuesto final. Los cónyuges disfrutan de una bonificación del 99%.
              </p>
              <ul>
                <li>
                  <strong>Cónyuges:</strong> Bonificación del 99%
                </li>
                <li>
                  <strong>Descendientes/Ascendientes:</strong> Entre 20% y 60%
                </li>
                <li>
                  <strong>Variable según:</strong> Importe heredado
                </li>
                <li>
                  <strong>Aplicación:</strong> Sobre cuota tributaria final
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>♿ Reducciones por Discapacidad</h2>
              <p>
                Las personas con discapacidad reconocida tienen derecho a reducciones especiales
                importantes que se suman a las reducciones generales por parentesco.
              </p>
              <ul>
                <li>
                  <strong>Grado 33%-64%:</strong> Reducción de 275.000€
                </li>
                <li>
                  <strong>Grado ≥65%:</strong> Reducción de 650.000€
                </li>
                <li>
                  <strong>Acumulable:</strong> Con otras reducciones
                </li>
                <li>
                  <strong>Certificación:</strong> Requiere reconocimiento oficial
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>❓ Preguntas Frecuentes</h2>

              <h3>¿Qué reducciones se aplican en el Impuesto de Sucesiones en Cataluña?</h3>
              <p>
                En Cataluña se aplican reducciones por parentesco (100.000€ Grupo I, 50.000€ Grupo
                II), reducción por vivienda habitual del 95% (máx. 500.000€), reducciones por edad
                para menores de 21 años (12.000€ por cada año hasta 21), y reducciones por
                discapacidad (275.000€ para 33-64%, 650.000€ para ≥65%). Nuestra calculadora aplica
                automáticamente todas las que correspondan.
              </p>

              <h3>¿Cuánto paga un cónyuge por el Impuesto de Sucesiones?</h3>
              <p>
                En Cataluña, los cónyuges disfrutan de una bonificación del 99% sobre la cuota
                tributaria final. Además, tienen una reducción personal de 100.000€ y pueden aplicar
                la reducción del 95% por vivienda habitual. En la práctica, esto significa que pagan
                muy poco o nada por el impuesto en la mayoría de casos.
              </p>

              <h3>¿Cómo funciona la reducción por vivienda habitual?</h3>
              <p>
                La reducción por vivienda habitual en Cataluña es del 95% del valor neto de la
                vivienda, con un máximo de 500.000€ de reducción. Se aplica automáticamente para
                cónyuges, descendientes y ascendientes. El heredero debe mantener la vivienda
                durante al menos 5 años tras la herencia.
              </p>

              <h3>¿Qué documentos necesito para la liquidación?</h3>
              <p>
                Para la liquidación del Impuesto de Sucesiones necesita: certificado de defunción,
                certificado de últimas voluntades, testamento o declaración de herederos, inventario
                valorado de bienes, justificantes de deudas, certificados bancarios, escrituras de
                inmuebles, y documentación que acredite las reducciones aplicables (discapacidad,
                parentesco, etc.).
              </p>

              <h3>¿Cuál es el plazo para presentar la liquidación?</h3>
              <p>
                El plazo general para presentar la liquidación del Impuesto de Sucesiones es de 6
                meses desde el fallecimiento. Este plazo puede prorrogarse por otros 6 meses
                solicitando la prórroga dentro de los primeros 5 meses. La presentación fuera de
                plazo conlleva recargos e intereses de demora.
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
