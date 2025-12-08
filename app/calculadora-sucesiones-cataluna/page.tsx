'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './CalculadoraSucesionesCataluna.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import Link from 'next/link';

// ===== TIPOS =====
interface TramoTarifa {
  hasta: number;
  cuota: number;
  resto: number;
  tipo: number;
}

interface DetalleReduccion {
  tipo: string;
  importe: number;
}

interface Resultado {
  valorNetoHeredado: number;
  ajuarDomestico: number;
  baseImponible: number;
  porcentajeAdquisicion: number;
  baseAjustada: number;
  reducciones: DetalleReduccion[];
  totalReducciones: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  cuotaTributaria: number;
  bonificacion: number;
  tipoBonificacion: string;
  cuotaFinal: number;
}

// ===== CONSTANTES FISCALES CATALUÑA 2025 =====

const TARIFA_SUCESIONES: TramoTarifa[] = [
  { hasta: 50000, cuota: 0, resto: 50000, tipo: 7 },
  { hasta: 150000, cuota: 3500, resto: 100000, tipo: 11 },
  { hasta: 400000, cuota: 14500, resto: 250000, tipo: 17 },
  { hasta: 800000, cuota: 57000, resto: 400000, tipo: 24 },
  { hasta: Infinity, cuota: 153000, resto: Infinity, tipo: 32 },
];

const COEFICIENTES: Record<string, number[]> = {
  'I': [1.0000, 1.0000, 1.0000, 1.0000],
  'II': [1.0000, 1.0000, 1.0000, 1.0000],
  'III': [1.5882, 1.5882, 1.5882, 1.5882],
  'IV': [2.0000, 2.0000, 2.0000, 2.0000],
};

// Reducciones personales por parentesco
const REDUCCIONES_PARENTESCO: Record<string, number> = {
  'I-conyuge': 100000,
  'I-descendiente': 100000,
  'II': 50000,
  'II-ascendiente': 50000,
  'III': 8000,
  'IV': 0,
};

// ===== COMPONENTE INPUT =====
interface InputCampoProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: string;
  helperText?: string;
  readOnly?: boolean;
}

function InputCampo({ label, value, onChange, placeholder = '0,00', icon, helperText, readOnly }: InputCampoProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {icon && <span className={styles.labelIcon}>{icon}</span>}
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.input} ${readOnly ? styles.inputReadonly : ''}`}
        inputMode="decimal"
        readOnly={readOnly}
      />
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function CalculadoraSucesionesCatalunaPage() {
  // Estados - Activos
  const [saldosCuentas, setSaldosCuentas] = useState('');
  const [accionesFondos, setAccionesFondos] = useState('');
  const [segurosVida, setSegurosVida] = useState('');
  const [viviendaHabitual, setViviendaHabitual] = useState('');
  const [otrosInmuebles, setOtrosInmuebles] = useState('');
  const [otrosBienes, setOtrosBienes] = useState('');

  // Estados - Pasivos
  const [hipotecaVivienda, setHipotecaVivienda] = useState('');
  const [hipotecaOtros, setHipotecaOtros] = useState('');
  const [otrasDeudas, setOtrasDeudas] = useState('');

  // Estados - Tipo adquisición
  const [tipoAdquisicion, setTipoAdquisicion] = useState<'completa' | 'usufructo' | 'nuda'>('completa');
  const [edadUsufructuario, setEdadUsufructuario] = useState('');

  // Estados - Heredero
  const [grupoParentesco, setGrupoParentesco] = useState('');
  const [edadHeredero, setEdadHeredero] = useState('');
  const [patrimonioPreexistente, setPatrimonioPreexistente] = useState('1');
  const [discapacidad, setDiscapacidad] = useState('0');

  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Calcular totales automáticamente
  const totales = useMemo(() => {
    const totalActivos =
      (parseSpanishNumber(saldosCuentas) || 0) +
      (parseSpanishNumber(accionesFondos) || 0) +
      (parseSpanishNumber(segurosVida) || 0) +
      (parseSpanishNumber(viviendaHabitual) || 0) +
      (parseSpanishNumber(otrosInmuebles) || 0) +
      (parseSpanishNumber(otrosBienes) || 0);

    const totalPasivos =
      (parseSpanishNumber(hipotecaVivienda) || 0) +
      (parseSpanishNumber(hipotecaOtros) || 0) +
      (parseSpanishNumber(otrasDeudas) || 0);

    const valorNeto = Math.max(0, totalActivos - totalPasivos);
    const ajuar = valorNeto * 0.03;

    return { totalActivos, totalPasivos, valorNeto, ajuar };
  }, [saldosCuentas, accionesFondos, segurosVida, viviendaHabitual, otrosInmuebles, otrosBienes, hipotecaVivienda, hipotecaOtros, otrasDeudas]);

  // Obtener grupo base
  const getGrupoBase = (grupo: string): string => {
    if (grupo.startsWith('I-') || grupo === 'I') return 'I';
    if (grupo.startsWith('II-') || grupo === 'II') return 'II';
    if (grupo === 'III') return 'III';
    return 'IV';
  };

  // Calcular porcentaje usufructo
  const calcularPorcentajeUsufructo = (edad: number): number => {
    return Math.max(10, 89 - edad) / 100;
  };

  // Calcular tarifa
  const calcularTarifa = (base: number): number => {
    if (base <= 0) return 0;

    for (const tramo of TARIFA_SUCESIONES) {
      if (base <= tramo.hasta) {
        const baseEnTramo = base - (tramo.hasta - tramo.resto);
        return tramo.cuota + (baseEnTramo * tramo.tipo / 100);
      }
    }

    const ultimoTramo = TARIFA_SUCESIONES[TARIFA_SUCESIONES.length - 1];
    const baseExceso = base - (ultimoTramo.hasta - ultimoTramo.resto);
    return ultimoTramo.cuota + (baseExceso * ultimoTramo.tipo / 100);
  };

  // Calcular reducciones
  const calcularReducciones = (): DetalleReduccion[] => {
    const reducciones: DetalleReduccion[] = [];
    const grupoBase = getGrupoBase(grupoParentesco);
    const edad = parseSpanishNumber(edadHeredero) || 0;
    const disc = parseInt(discapacidad) || 0;
    const valorVivienda = parseSpanishNumber(viviendaHabitual) || 0;
    const hipVivienda = parseSpanishNumber(hipotecaVivienda) || 0;

    // 1. Reducción personal por parentesco
    const reduccionParentesco = REDUCCIONES_PARENTESCO[grupoParentesco] || 0;
    if (reduccionParentesco > 0) {
      reducciones.push({
        tipo: `Reducción personal (Grupo ${grupoBase})`,
        importe: reduccionParentesco,
      });
    }

    // 2. Reducción adicional por edad (menores de 21 años, Grupo I)
    if (grupoParentesco === 'I-descendiente' && edad < 21) {
      const reduccionEdad = 12000 * (21 - edad);
      reducciones.push({
        tipo: `Reducción por edad (${21 - edad} años hasta 21)`,
        importe: reduccionEdad,
      });
    }

    // 3. Reducción por discapacidad
    if (disc >= 33 && disc < 65) {
      reducciones.push({
        tipo: 'Reducción discapacidad 33%-64%',
        importe: 275000,
      });
    } else if (disc >= 65) {
      reducciones.push({
        tipo: 'Reducción discapacidad ≥65%',
        importe: 650000,
      });
    }

    // 4. Reducción vivienda habitual (95%, máx 500.000€)
    if (valorVivienda > 0) {
      const puedeAplicar = grupoBase === 'I' || grupoBase === 'II';
      if (puedeAplicar) {
        const valorNetoVivienda = Math.max(0, valorVivienda - hipVivienda);
        const reduccionVivienda = Math.min(valorNetoVivienda * 0.95, 500000);
        if (reduccionVivienda > 0) {
          reducciones.push({
            tipo: 'Vivienda habitual (95%, máx 500.000€)',
            importe: reduccionVivienda,
          });
        }
      }
    }

    return reducciones;
  };

  // Calcular bonificación
  const calcularBonificacion = (cuotaTributaria: number, baseLiquidable: number): { bonificacion: number; tipo: string } => {
    const grupoBase = getGrupoBase(grupoParentesco);

    // Bonificación 99% para cónyuge
    if (grupoParentesco === 'I-conyuge') {
      return {
        bonificacion: cuotaTributaria * 0.99,
        tipo: 'Bonificación cónyuge 99%',
      };
    }

    // Bonificación escalonada para Grupo II
    if (grupoBase === 'II') {
      let porcentaje = 0;

      if (baseLiquidable <= 100000) {
        porcentaje = 0.60;
      } else if (baseLiquidable <= 200000) {
        porcentaje = 0.60 - ((baseLiquidable - 100000) / 100000 * 0.10);
      } else if (baseLiquidable <= 300000) {
        porcentaje = 0.50 - ((baseLiquidable - 200000) / 100000 * 0.10);
      } else if (baseLiquidable <= 500000) {
        porcentaje = 0.40 - ((baseLiquidable - 300000) / 200000 * 0.15);
      } else if (baseLiquidable <= 750000) {
        porcentaje = 0.25 - ((baseLiquidable - 500000) / 250000 * 0.05);
      } else {
        porcentaje = 0.20;
      }

      return {
        bonificacion: cuotaTributaria * porcentaje,
        tipo: `Bonificación Grupo II (${(porcentaje * 100).toFixed(0)}%)`,
      };
    }

    // Bonificación escalonada para Grupo I descendientes
    if (grupoParentesco === 'I-descendiente') {
      let porcentaje = 0;

      if (baseLiquidable <= 100000) {
        porcentaje = 0.99;
      } else if (baseLiquidable <= 200000) {
        porcentaje = 0.97;
      } else if (baseLiquidable <= 300000) {
        porcentaje = 0.95;
      } else if (baseLiquidable <= 500000) {
        porcentaje = 0.90;
      } else if (baseLiquidable <= 750000) {
        porcentaje = 0.80;
      } else {
        porcentaje = 0.60;
      }

      return {
        bonificacion: cuotaTributaria * porcentaje,
        tipo: `Bonificación descendientes (${(porcentaje * 100).toFixed(0)}%)`,
      };
    }

    return { bonificacion: 0, tipo: '' };
  };

  // Función principal de cálculo
  const calcular = () => {
    if (!grupoParentesco || totales.valorNeto <= 0) {
      alert('Por favor, introduce los bienes heredados y selecciona el grupo de parentesco.');
      return;
    }

    const grupoBase = getGrupoBase(grupoParentesco);

    // 1. Base imponible
    const baseImponible = totales.valorNeto + totales.ajuar;

    // 2. Ajustar por tipo de adquisición
    let porcentajeAdquisicion = 1;
    if (tipoAdquisicion !== 'completa') {
      const edadUsuf = parseSpanishNumber(edadUsufructuario) || 0;
      const porcentajeUsufructo = calcularPorcentajeUsufructo(edadUsuf);

      if (tipoAdquisicion === 'usufructo') {
        porcentajeAdquisicion = porcentajeUsufructo;
      } else {
        porcentajeAdquisicion = 1 - porcentajeUsufructo;
      }
    }

    const baseAjustada = baseImponible * porcentajeAdquisicion;

    // 3. Reducciones
    const reducciones = calcularReducciones();
    const totalReducciones = reducciones.reduce((sum, r) => sum + r.importe, 0);

    // 4. Base liquidable
    const baseLiquidable = Math.max(0, baseAjustada - totalReducciones);

    // 5. Cuota íntegra
    const cuotaIntegra = calcularTarifa(baseLiquidable);

    // 6. Coeficiente multiplicador
    const indicePatrimonio = parseInt(patrimonioPreexistente) - 1;
    const coeficiente = COEFICIENTES[grupoBase][indicePatrimonio];

    // 7. Cuota tributaria
    const cuotaTributaria = cuotaIntegra * coeficiente;

    // 8. Bonificación
    const { bonificacion, tipo: tipoBonificacion } = calcularBonificacion(cuotaTributaria, baseLiquidable);

    // 9. Cuota final
    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);

    setResultado({
      valorNetoHeredado: totales.valorNeto,
      ajuarDomestico: totales.ajuar,
      baseImponible,
      porcentajeAdquisicion,
      baseAjustada,
      reducciones,
      totalReducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficienteMultiplicador: coeficiente,
      cuotaTributaria,
      bonificacion,
      tipoBonificacion,
      cuotaFinal,
    });
  };

  // Limpiar
  const limpiar = () => {
    setSaldosCuentas('');
    setAccionesFondos('');
    setSegurosVida('');
    setViviendaHabitual('');
    setOtrosInmuebles('');
    setOtrosBienes('');
    setHipotecaVivienda('');
    setHipotecaOtros('');
    setOtrasDeudas('');
    setTipoAdquisicion('completa');
    setEdadUsufructuario('');
    setGrupoParentesco('');
    setEdadHeredero('');
    setPatrimonioPreexistente('1');
    setDiscapacidad('0');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚖️ Calculadora Sucesiones Cataluña 2025</h1>
        <p className={styles.subtitle}>
          Calcula el Impuesto de Sucesiones (herencias) con las reducciones y bonificaciones de la normativa catalana
        </p>
      </header>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta calculadora es una <strong>herramienta orientativa</strong>. Los resultados son estimaciones
          basadas en la normativa vigente, pero <strong>NO sustituyen el asesoramiento profesional</strong>.
        </p>
        <ul>
          <li>Casos especiales no incluidos: empresas familiares, explotaciones agrarias, patrimonio cultural</li>
          <li>Consulte con un asesor fiscal especializado</li>
          <li>Plazo de presentación: 6 meses desde el fallecimiento</li>
        </ul>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de Inputs */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>📝 Datos de la Herencia</h2>

          {/* Activos */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>💰 Activos del Causante</h3>
            <InputCampo label="Saldos en cuentas bancarias" value={saldosCuentas} onChange={setSaldosCuentas} icon="🏦" />
            <InputCampo label="Acciones, fondos, valores" value={accionesFondos} onChange={setAccionesFondos} icon="📈" />
            <InputCampo label="Seguros de vida" value={segurosVida} onChange={setSegurosVida} icon="🛡️" />
            <InputCampo label="Vivienda habitual" value={viviendaHabitual} onChange={setViviendaHabitual} icon="🏠" helperText="Reducción 95% para familiares directos" />
            <InputCampo label="Otros inmuebles" value={otrosInmuebles} onChange={setOtrosInmuebles} icon="🏢" />
            <InputCampo label="Otros bienes (vehículos, joyas...)" value={otrosBienes} onChange={setOtrosBienes} icon="💎" />
          </div>

          {/* Pasivos */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>📋 Deudas y Cargas</h3>
            <InputCampo label="Hipoteca vivienda habitual" value={hipotecaVivienda} onChange={setHipotecaVivienda} icon="🏦" />
            <InputCampo label="Hipoteca otros inmuebles" value={hipotecaOtros} onChange={setHipotecaOtros} icon="📋" />
            <InputCampo label="Otras deudas" value={otrasDeudas} onChange={setOtrasDeudas} icon="💳" />
          </div>

          {/* Totales */}
          <div className={styles.totalBox}>
            <span>VALOR NETO HEREDADO</span>
            <span>{formatCurrency(totales.valorNeto)}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
            + Ajuar doméstico (3%): {formatCurrency(totales.ajuar)}
          </div>

          {/* Tipo adquisición */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>📜 Tipo de Adquisición</h3>
            <div className={styles.inputGroup}>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input type="radio" id="completa" checked={tipoAdquisicion === 'completa'} onChange={() => setTipoAdquisicion('completa')} />
                  <label htmlFor="completa">Plena propiedad</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="usufructo" checked={tipoAdquisicion === 'usufructo'} onChange={() => setTipoAdquisicion('usufructo')} />
                  <label htmlFor="usufructo">Solo usufructo</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="nuda" checked={tipoAdquisicion === 'nuda'} onChange={() => setTipoAdquisicion('nuda')} />
                  <label htmlFor="nuda">Nuda propiedad</label>
                </div>
              </div>
            </div>

            {tipoAdquisicion !== 'completa' && (
              <InputCampo
                label="Edad del usufructuario"
                value={edadUsufructuario}
                onChange={setEdadUsufructuario}
                placeholder="Ej: 75"
                helperText="Para calcular el porcentaje del usufructo (89 - edad)"
              />
            )}
          </div>

          {/* Datos heredero */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>👤 Datos del Heredero</h3>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Parentesco con el causante</label>
              <select className={styles.select} value={grupoParentesco} onChange={(e) => setGrupoParentesco(e.target.value)}>
                <option value="">Seleccione...</option>
                <option value="I-conyuge">Cónyuge o pareja estable</option>
                <option value="I-descendiente">Descendiente menor de 21 años</option>
                <option value="II">Descendiente de 21 años o más</option>
                <option value="II-ascendiente">Ascendiente (padre, madre, abuelo)</option>
                <option value="III">Hermano, tío, sobrino (2º-3º grado)</option>
                <option value="IV">Primos, otros o sin parentesco</option>
              </select>
            </div>

            {(grupoParentesco === 'I-descendiente') && (
              <InputCampo label="Edad del heredero" value={edadHeredero} onChange={setEdadHeredero} placeholder="Ej: 18" helperText="Reducción adicional si menor de 21" />
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Patrimonio preexistente del heredero</label>
              <select className={styles.select} value={patrimonioPreexistente} onChange={(e) => setPatrimonioPreexistente(e.target.value)}>
                <option value="1">Hasta 500.000 €</option>
                <option value="2">500.000 € - 2.000.000 €</option>
                <option value="3">2.000.000 € - 4.000.000 €</option>
                <option value="4">Más de 4.000.000 €</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Discapacidad reconocida</label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc0" checked={discapacidad === '0'} onChange={() => setDiscapacidad('0')} />
                  <label htmlFor="disc0">No</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc33" checked={discapacidad === '33'} onChange={() => setDiscapacidad('33')} />
                  <label htmlFor="disc33">33%-64%</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc65" checked={discapacidad === '65'} onChange={() => setDiscapacidad('65')} />
                  <label htmlFor="disc65">≥65%</label>
                </div>
              </div>
            </div>
          </div>

          <button onClick={calcular} className={styles.btnPrimary}>Calcular Impuesto</button>
          <button onClick={limpiar} className={styles.btnSecondary}>Limpiar Formulario</button>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>📊 Resultado del Cálculo</h2>

          {!resultado ? (
            <div className={styles.infoBox}>
              <h4>Introduce los datos de la herencia</h4>
              <p>Completa el formulario para calcular el impuesto de sucesiones.</p>
            </div>
          ) : (
            <>
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Impuesto a Pagar</span>
                <span className={styles.resultadoValor}>{formatCurrency(resultado.cuotaFinal)}</span>
                {resultado.tipoBonificacion && (
                  <span className={styles.resultadoNota}>{resultado.tipoBonificacion}</span>
                )}
              </div>

              <div className={styles.desglose}>
                <h4 className={styles.desgloseTitle}>Base Imponible</h4>
                <div className={styles.lineaDesglose}>
                  <span>Valor neto heredado</span>
                  <span>{formatCurrency(resultado.valorNetoHeredado)}</span>
                </div>
                <div className={styles.lineaDesglose}>
                  <span>+ Ajuar doméstico (3%)</span>
                  <span>{formatCurrency(resultado.ajuarDomestico)}</span>
                </div>
                {resultado.porcentajeAdquisicion < 1 && (
                  <div className={styles.lineaDesglose}>
                    <span>× Porcentaje adquisición</span>
                    <span>{(resultado.porcentajeAdquisicion * 100).toFixed(0)}%</span>
                  </div>
                )}
                <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                  <span>Base imponible</span>
                  <span>{formatCurrency(resultado.baseAjustada)}</span>
                </div>
              </div>

              {resultado.reducciones.length > 0 && (
                <div className={styles.desglose}>
                  <h4 className={styles.desgloseTitle}>Reducciones</h4>
                  {resultado.reducciones.map((red, idx) => (
                    <div key={idx} className={styles.lineaDesglose}>
                      <span className={styles.lineaReduccion}>- {red.tipo}</span>
                      <span className={styles.lineaReduccion}>{formatCurrency(red.importe)}</span>
                    </div>
                  ))}
                  <div className={styles.lineaSeparador} />
                  <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                    <span>Base liquidable</span>
                    <span>{formatCurrency(resultado.baseLiquidable)}</span>
                  </div>
                </div>
              )}

              <div className={styles.desglose}>
                <h4 className={styles.desgloseTitle}>Liquidación</h4>
                <div className={styles.lineaDesglose}>
                  <span>Cuota íntegra</span>
                  <span>{formatCurrency(resultado.cuotaIntegra)}</span>
                </div>
                <div className={styles.lineaDesglose}>
                  <span>Coeficiente multiplicador</span>
                  <span>×{resultado.coeficienteMultiplicador.toFixed(4)}</span>
                </div>
                <div className={styles.lineaDesglose}>
                  <span>Cuota tributaria</span>
                  <span>{formatCurrency(resultado.cuotaTributaria)}</span>
                </div>
                {resultado.bonificacion > 0 && (
                  <div className={styles.lineaDesglose}>
                    <span className={styles.lineaReduccion}>- {resultado.tipoBonificacion}</span>
                    <span className={styles.lineaReduccion}>{formatCurrency(resultado.bonificacion)}</span>
                  </div>
                )}
                <div className={styles.lineaSeparador} />
                <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                  <span>CUOTA A PAGAR</span>
                  <span>{formatCurrency(resultado.cuotaFinal)}</span>
                </div>
              </div>

              <div className={styles.infoBox}>
                <h4>ℹ️ Información</h4>
                <ul>
                  <li>Plazo de presentación: <strong>6 meses</strong> desde el fallecimiento</li>
                  <li>Modelo: <strong>660</strong> (inventario) + <strong>650</strong> (autoliquidación)</li>
                  <li>Si hereda vivienda habitual, mantenerla <strong>5 años</strong></li>
                </ul>
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

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Herencias en Cataluña?"
        subtitle="Guía completa sobre reducciones, bonificaciones y plazos"
      >
        <section className={styles.guideSection}>
          <h2>Guía del Impuesto de Sucesiones en Cataluña</h2>
          <p className={styles.introParagraph}>
            El Impuesto de Sucesiones en Cataluña cuenta con importantes beneficios fiscales
            para familiares directos, especialmente cónyuges y descendientes.
          </p>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>🏠 Reducción Vivienda Habitual</h4>
              <ul>
                <li><strong>95% de reducción</strong> del valor</li>
                <li>Límite: 500.000€ por heredero</li>
                <li>Solo grupos I y II (familiares directos)</li>
                <li>Mantener 5 años como vivienda</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>👥 Bonificaciones por Parentesco</h4>
              <ul>
                <li><strong>Cónyuge:</strong> 99% bonificación</li>
                <li><strong>Descendientes:</strong> 60%-99% según base</li>
                <li><strong>Grupo II:</strong> 20%-60% según base</li>
                <li>Grupos III y IV: sin bonificación</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>♿ Reducciones Discapacidad</h4>
              <ul>
                <li>33%-64%: reducción 275.000€</li>
                <li>≥65%: reducción 650.000€</li>
                <li>Acumulables con otras reducciones</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>📅 Plazos y Modelos</h4>
              <ul>
                <li>Plazo: <strong>6 meses</strong> desde fallecimiento</li>
                <li>Prórroga: otros 6 meses (solicitar antes)</li>
                <li>Modelos: 660 + 650</li>
                <li>Presentar en Agència Tributària Catalunya</li>
              </ul>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Qué es el ajuar doméstico?</summary>
              <p>
                El ajuar doméstico se presume legalmente como el <strong>3% del valor de la herencia</strong>.
                Incluye enseres, muebles y objetos personales del fallecido. Se suma a la base imponible
                aunque no esté inventariado expresamente.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué pasa si heredo solo el usufructo?</summary>
              <p>
                Si heredas el usufructo (uso y disfrute) pero no la propiedad, pagas impuesto solo por
                el <strong>valor del usufructo</strong>, que se calcula como 89 - edad del usufructuario.
                Por ejemplo, con 70 años: 89-70 = 19% del valor total.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo solicitar prórroga?</summary>
              <p>
                Sí, puedes solicitar una prórroga de <strong>6 meses adicionales</strong>, pero debes
                pedirla <strong>antes de que termine el plazo inicial</strong>. La prórroga conlleva
                intereses de demora.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué pasa si vendo la vivienda antes de 5 años?</summary>
              <p>
                Si vendes la vivienda habitual heredada antes de 5 años, deberás devolver la reducción
                aplicada más los intereses de demora. La excepción es si reinviertes en otra vivienda
                habitual o si hay circunstancias excepcionales justificadas.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-sucesiones-cataluna" />
    </div>
  );
}
