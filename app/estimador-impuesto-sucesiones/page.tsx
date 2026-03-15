'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorSucesiones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, LegalNotice } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_SUCESIONES_META,
  TARIFA_ESTATAL_IS,
  TARIFA_CATALUNA_IS,
  COEFICIENTES_IS,
  COEFICIENTES_CATALUNA_IS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_IS,
  REDUCCION_EDAD_MENOR_21_MAX_IS,
  REDUCCION_SEGURO_VIDA_MAX_IS,
  REDUCCION_VIVIENDA_PORC_IS,
  REDUCCION_VIVIENDA_MAX_IS,
  REDUCCION_DISCAPACIDAD_33_IS,
  REDUCCION_DISCAPACIDAD_65_IS,
  PORC_AJUAR_DOMESTICO_IS,
  BONIFICACIONES_CCAA_IS,
  TramoTarifaIS,
  BonificacionGrupoIS,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type GrupoParentesco = 'I-conyuge' | 'I-descendiente' | 'II' | 'II-ascendiente' | 'III' | 'IV';
type TipoAdquisicion = 'plena' | 'usufructo' | 'nuda';
type NivelDiscapacidad = '0' | '33' | '65';

interface DetalleReduccion {
  concepto: string;
  importe: number;
}

interface ResultadoSucesiones {
  // Masa hereditaria
  totalActivos: number;
  totalDeudas: number;
  masaHereditaria: number;
  ajuarDomestico: number;
  baseImponible: number;
  // Adquisición
  porcentajeAdquisicion: number;
  baseAjustada: number;
  // Reducciones
  reducciones: DetalleReduccion[];
  totalReducciones: number;
  baseLiquidable: number;
  // Liquidación
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  cuotaTributaria: number;
  // Bonificación
  bonificacionCcaa: number;
  porcentajeBonificacion: number;
  detalleBonificacion: string;
  cuotaFinal: number;
  // Meta
  tipoEfectivo: number;
  ccaaNombre: string;
  esForal: boolean;
}

// ─── Funciones de cálculo ─────────────────────────────────────────────────────

function calcularTarifa(base: number, tarifa: TramoTarifaIS[]): number {
  if (base <= 0) return 0;
  let prevHasta = 0;
  for (const tramo of tarifa) {
    if (base <= tramo.hasta) {
      return tramo.cuota + (base - prevHasta) * (tramo.tipo / 100);
    }
    prevHasta = tramo.hasta;
  }
  return 0;
}

function getGrupoBase(grupo: string): string {
  if (grupo === 'I-conyuge' || grupo === 'I-descendiente') return 'I';
  if (grupo === 'II' || grupo === 'II-ascendiente') return 'II';
  if (grupo === 'III') return 'III';
  return 'IV';
}

function aplicarBonificacion(
  cuotaTributaria: number,
  baseLiquidable: number,
  grupo: string,
  ccaa: string
): { bonificacion: number; porcentaje: number; detalle: string } {

  const config = BONIFICACIONES_CCAA_IS[ccaa];
  if (!config) return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

  const bGrupo: BonificacionGrupoIS | undefined = config.bonificaciones[grupo];
  if (!bGrupo) return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación para este grupo' };

  // Asturias: reducción en base (no bonificación), ya aplicada antes
  if (bGrupo.reduccionBase !== undefined) {
    return { bonificacion: 0, porcentaje: 0, detalle: 'Reducción aplicada en base liquidable' };
  }

  // Exención total por importe
  if (bGrupo.exencion !== undefined && baseLiquidable < bGrupo.exencion) {
    return {
      bonificacion: cuotaTributaria,
      porcentaje: 100,
      detalle: `Exención total (base < ${formatCurrency(bGrupo.exencion)})`,
    };
  }

  // Bonificación escalonada (Castilla-La Mancha, Cantabria)
  if (bGrupo.escalonado && bGrupo.escalonado.length > 0) {
    let tramoSeleccionado = bGrupo.escalonado[bGrupo.escalonado.length - 1];
    for (const t of bGrupo.escalonado) {
      if (t.hasta !== undefined && baseLiquidable <= t.hasta) {
        tramoSeleccionado = t;
        break;
      }
    }
    const bonif = cuotaTributaria * tramoSeleccionado.porcentaje;
    return {
      bonificacion: bonif,
      porcentaje: tramoSeleccionado.porcentaje * 100,
      detalle: `Bonificación ${(tramoSeleccionado.porcentaje * 100).toFixed(0)}% (${config.nombre})`,
    };
  }

  // Bonificación con tope (La Rioja)
  if (bGrupo.tope !== undefined && bGrupo.porcentajeMayor !== undefined && baseLiquidable > bGrupo.tope) {
    const bonif = cuotaTributaria * bGrupo.porcentajeMayor;
    return {
      bonificacion: bonif,
      porcentaje: bGrupo.porcentajeMayor * 100,
      detalle: `Bonificación ${(bGrupo.porcentajeMayor * 100).toFixed(0)}% (base supera ${formatCurrency(bGrupo.tope)})`,
    };
  }

  // Bonificación con límite de base (Aragón)
  if (bGrupo.limite !== null && bGrupo.limite !== undefined && baseLiquidable > bGrupo.limite) {
    return {
      bonificacion: 0,
      porcentaje: 0,
      detalle: `Sin bonificación (base supera el límite de ${formatCurrency(bGrupo.limite)})`,
    };
  }

  // Bonificación fija
  if (bGrupo.porcentaje !== undefined && bGrupo.porcentaje > 0) {
    const bonif = cuotaTributaria * bGrupo.porcentaje;
    return {
      bonificacion: bonif,
      porcentaje: bGrupo.porcentaje * 100,
      detalle: `Bonificación ${(bGrupo.porcentaje * 100).toFixed(1)}% (${config.nombre})`,
    };
  }

  return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación autonómica' };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorImpuestoSucesionesPage() {
  // Bienes del fallecido
  const [saldosCuentas, setSaldosCuentas] = useState('');
  const [accionesFondos, setAccionesFondos] = useState('');
  const [viviendaHabitual, setViviendaHabitual] = useState('');
  const [otrosInmuebles, setOtrosInmuebles] = useState('');
  const [vehiculos, setVehiculos] = useState('');
  const [segurosVida, setSegurosVida] = useState('');
  const [otrosBienes, setOtrosBienes] = useState('');

  // Deudas
  const [hipotecas, setHipotecas] = useState('');
  const [otrosPrestamos, setOtrosPrestamos] = useState('');
  const [gastosSepelio, setGastosSepelio] = useState('');

  // Datos del heredero
  const [ccaa, setCcaa] = useState('');
  const [grupo, setGrupo] = useState<GrupoParentesco | ''>('');
  const [edad, setEdad] = useState('35');
  const [discapacidad, setDiscapacidad] = useState<NivelDiscapacidad>('0');
  const [patrimonioIdx, setPatrimonioIdx] = useState('1');

  // Tipo de adquisición
  const [tipoAdquisicion, setTipoAdquisicion] = useState<TipoAdquisicion>('plena');
  const [edadUsufructuario, setEdadUsufructuario] = useState('70');
  const [porcentajeHerencia, setPorcentajeHerencia] = useState('100');

  const ccaaInfo = useMemo(() => (ccaa ? BONIFICACIONES_CCAA_IS[ccaa] : null), [ccaa]);

  const resultado = useMemo((): ResultadoSucesiones | null => {
    if (!ccaa || !grupo) return null;

    // Bienes
    const v_cuentas = parseSpanishNumber(saldosCuentas) || 0;
    const v_acciones = parseSpanishNumber(accionesFondos) || 0;
    const v_vivienda = parseSpanishNumber(viviendaHabitual) || 0;
    const v_otrosInm = parseSpanishNumber(otrosInmuebles) || 0;
    const v_vehiculos = parseSpanishNumber(vehiculos) || 0;
    const v_seguros = parseSpanishNumber(segurosVida) || 0;
    const v_otros = parseSpanishNumber(otrosBienes) || 0;

    const totalActivos = v_cuentas + v_acciones + v_vivienda + v_otrosInm + v_vehiculos + v_seguros + v_otros;
    if (totalActivos <= 0) return null;

    // Deudas
    const d_hipotecas = parseSpanishNumber(hipotecas) || 0;
    const d_prestamos = parseSpanishNumber(otrosPrestamos) || 0;
    const d_sepelio = parseSpanishNumber(gastosSepelio) || 0;
    const totalDeudas = d_hipotecas + d_prestamos + d_sepelio;

    // Masa hereditaria
    const masaHereditaria = Math.max(0, totalActivos - totalDeudas);
    const ajuarDomestico = masaHereditaria * PORC_AJUAR_DOMESTICO_IS;
    const baseImponibleTotal = masaHereditaria + ajuarDomestico;

    // Porcentaje que recibe este heredero
    const porcHerencia = Math.min(100, Math.max(0, parseFloat(porcentajeHerencia) || 100)) / 100;
    let baseAjustada = baseImponibleTotal * porcHerencia;

    // Tipo de adquisición (usufructo / nuda)
    let porcentajeAdquisicion = 1;
    if (tipoAdquisicion === 'usufructo') {
      const edadUsuf = parseInt(edadUsufructuario) || 70;
      porcentajeAdquisicion = Math.max(0.10, (89 - edadUsuf) / 100);
      baseAjustada = baseImponibleTotal * porcHerencia * porcentajeAdquisicion;
    } else if (tipoAdquisicion === 'nuda') {
      const edadUsuf = parseInt(edadUsufructuario) || 70;
      const porcUsuf = Math.max(0.10, (89 - edadUsuf) / 100);
      porcentajeAdquisicion = 1 - porcUsuf;
      baseAjustada = baseImponibleTotal * porcHerencia * porcentajeAdquisicion;
    }

    const esCataluna = ccaa === 'cataluna';
    const esForal = ccaaInfo?.regimen === 'foral';

    // Reducciones
    const reducciones: DetalleReduccion[] = [];

    // 1. Reducción por parentesco
    const reduccionesParentesco = esCataluna
      ? REDUCCIONES_PARENTESCO_CATALUNA_IS
      : REDUCCIONES_PARENTESCO_IS;
    const reduccionParentesco = reduccionesParentesco[grupo] || 0;
    if (reduccionParentesco > 0) {
      reducciones.push({ concepto: 'Por parentesco', importe: reduccionParentesco });
    }

    // 2. Reducción por edad (solo grupo I descendiente, para menores de 21)
    const edadNum = parseInt(edad) || 35;
    if (grupo === 'I-descendiente' && edadNum < 21) {
      const reduccionEdad = Math.min(
        reduccionParentesco + REDUCCION_EDAD_MENOR_21_IS * (21 - edadNum),
        reduccionParentesco + REDUCCION_EDAD_MENOR_21_MAX_IS
      ) - reduccionParentesco;
      if (reduccionEdad > 0) {
        reducciones.push({ concepto: `Por edad (${21 - edadNum} años < 21)`, importe: reduccionEdad });
      }
    }

    // 3. Reducción por seguro de vida (solo para cónyuge, descendientes, ascendientes)
    const gruposConSeguro = ['I-conyuge', 'I-descendiente', 'II', 'II-ascendiente'];
    if (gruposConSeguro.includes(grupo) && v_seguros > 0) {
      const reduccionSeguro = Math.min(v_seguros, REDUCCION_SEGURO_VIDA_MAX_IS);
      reducciones.push({ concepto: 'Seguro de vida', importe: reduccionSeguro });
    }

    // 4. Reducción vivienda habitual (solo si hay vivienda y es grupo apto)
    const gruposVivienda = ['I-conyuge', 'I-descendiente', 'II', 'II-ascendiente', 'III'];
    if (gruposVivienda.includes(grupo) && v_vivienda > 0 && !esCataluna) {
      const baseViviendaHeredero = v_vivienda * porcHerencia;
      const reduccionVivienda = Math.min(
        baseViviendaHeredero * REDUCCION_VIVIENDA_PORC_IS,
        REDUCCION_VIVIENDA_MAX_IS
      );
      if (reduccionVivienda > 0) {
        reducciones.push({ concepto: 'Vivienda habitual (95%)', importe: reduccionVivienda });
      }
    }

    // 5. Reducción por discapacidad
    if (discapacidad === '33') {
      reducciones.push({ concepto: 'Discapacidad 33%–64%', importe: REDUCCION_DISCAPACIDAD_33_IS });
    } else if (discapacidad === '65') {
      reducciones.push({ concepto: 'Discapacidad ≥65%', importe: REDUCCION_DISCAPACIDAD_65_IS });
    }

    // 6. Reducción adicional Asturias
    if (ccaa === 'asturias') {
      const reducAdicionalAsturias = BONIFICACIONES_CCAA_IS['asturias'].bonificaciones[grupo]?.reduccionBase ?? 0;
      if (reducAdicionalAsturias > 0) {
        reducciones.push({ concepto: 'Reducción adicional Asturias', importe: reducAdicionalAsturias });
      }
    }

    const totalReducciones = reducciones.reduce((s, r) => s + r.importe, 0);
    const baseLiquidable = Math.max(0, baseAjustada - totalReducciones);

    // Tarifa
    const tarifa = esCataluna ? TARIFA_CATALUNA_IS : TARIFA_ESTATAL_IS;
    const cuotaIntegra = calcularTarifa(baseLiquidable, tarifa);

    // Coeficiente multiplicador
    const grupoBase = getGrupoBase(grupo);
    const coeficientes = esCataluna ? COEFICIENTES_CATALUNA_IS : COEFICIENTES_IS;
    const idxPatrimonio = Math.min(3, Math.max(0, parseInt(patrimonioIdx) - 1));
    const coeficienteMultiplicador = coeficientes[grupoBase]?.[idxPatrimonio] ?? 1;

    const cuotaTributaria = cuotaIntegra * coeficienteMultiplicador;

    // Bonificación CCAA
    const { bonificacion, porcentaje, detalle } = aplicarBonificacion(
      cuotaTributaria, baseLiquidable, grupo, ccaa
    );

    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);
    const tipoEfectivo = baseImponibleTotal > 0 ? (cuotaFinal / baseAjustada) * 100 : 0;

    return {
      totalActivos,
      totalDeudas,
      masaHereditaria,
      ajuarDomestico,
      baseImponible: baseImponibleTotal,
      porcentajeAdquisicion,
      baseAjustada,
      reducciones,
      totalReducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficienteMultiplicador,
      cuotaTributaria,
      bonificacionCcaa: bonificacion,
      porcentajeBonificacion: porcentaje,
      detalleBonificacion: detalle,
      cuotaFinal,
      tipoEfectivo,
      ccaaNombre: ccaaInfo?.nombre ?? '',
      esForal,
    };
  }, [
    ccaa, grupo, edad, discapacidad, patrimonioIdx, tipoAdquisicion, edadUsufructuario, porcentajeHerencia,
    saldosCuentas, accionesFondos, viviendaHabitual, otrosInmuebles, vehiculos, segurosVida, otrosBienes,
    hipotecas, otrosPrestamos, gastosSepelio, ccaaInfo,
  ]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚖️ Estimador del Impuesto de Sucesiones</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el ISD en las 17 comunidades autónomas antes de hablar con tu asesor fiscal
        </p>
        <p className={styles.metaVerificado}>
          Datos verificados: {FISCAL_SUCESIONES_META.verificado} — Fuente:{' '}
          <a href={FISCAL_SUCESIONES_META.urlOficial} target="_blank" rel="noopener noreferrer" className={styles.linkFuente}>
            Agencia Tributaria
          </a>
        </p>
      </header>

      <LegalNotice />

      {/* Disclaimer SIEMPRE VISIBLE */}
      <div className={styles.disclaimerCritico}>
        <h2 className={styles.disclaimerTitulo}>⚠️ Aviso Legal Imprescindible</h2>
        <p>
          Esta herramienta es <strong>exclusivamente orientativa</strong>. Los resultados son estimaciones
          basadas en tarifas generales y <strong>no tienen validez fiscal</strong>.
        </p>
        <ul>
          <li>El ISD contempla decenas de supuestos especiales no incluidos aquí</li>
          <li>Empresas familiares, explotaciones agrarias y otros bienes tienen reducciones especiales</li>
          <li>Las bonificaciones autonómicas pueden tener requisitos formales adicionales</li>
          <li>El ajuar doméstico (3%) puede impugnarse con prueba en contrario</li>
          <li><strong>Consulta siempre con un gestor o asesor fiscal antes de autoliquidar</strong></li>
        </ul>
        <p className={styles.disclaimerPlazo}>
          📅 Plazo de autoliquidación: <strong>6 meses</strong> desde el fallecimiento (prorrogable 6 meses más)
        </p>
        <p className={styles.disclaimerResponsabilidad}>
          meskeIA no se responsabiliza de decisiones basadas en estas herramientas.
        </p>
      </div>

      <div className={styles.mainContent}>
        {/* ── Panel de inputs ─────────────────────────────────────── */}
        <div className={styles.inputsPanel}>

          {/* Sección 1: CCAA y datos del heredero */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>👤 Datos del Heredero</h2>

            <div className={styles.campo}>
              <label className={styles.label}>Comunidad autónoma de residencia del heredero *</label>
              <select className={styles.select} value={ccaa} onChange={(e) => setCcaa(e.target.value)}>
                <option value="">— Selecciona tu CCAA —</option>
                <optgroup label="Régimen Común (14 CCAA)">
                  <option value="madrid">Comunidad de Madrid</option>
                  <option value="andalucia">Andalucía</option>
                  <option value="galicia">Galicia</option>
                  <option value="valencia">Comunitat Valenciana</option>
                  <option value="castilla-leon">Castilla y León</option>
                  <option value="castilla-mancha">Castilla-La Mancha</option>
                  <option value="aragon">Aragón</option>
                  <option value="canarias">Canarias</option>
                  <option value="baleares">Islas Baleares</option>
                  <option value="extremadura">Extremadura</option>
                  <option value="murcia">Región de Murcia</option>
                  <option value="asturias">Asturias</option>
                  <option value="cantabria">Cantabria</option>
                  <option value="rioja">La Rioja</option>
                </optgroup>
                <optgroup label="Régimen Foral">
                  <option value="cataluna">Cataluña ⚠️</option>
                  <option value="pais-vasco">País Vasco ⚠️</option>
                  <option value="navarra">Navarra ⚠️</option>
                </optgroup>
              </select>
            </div>

            {ccaaInfo?.regimen === 'foral' && ccaa !== 'cataluna' && (
              <div className={styles.alertaForal}>
                <strong>⚠️ Régimen Foral</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}

            {ccaaInfo && (
              <div className={styles.infoCcaa}>
                <strong>ℹ️ {ccaaInfo.nombre}</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}

            <div className={styles.campo}>
              <label className={styles.label}>Parentesco con el fallecido *</label>
              <select className={styles.select} value={grupo} onChange={(e) => setGrupo(e.target.value as GrupoParentesco)}>
                <option value="">— Selecciona —</option>
                <option value="I-conyuge">Cónyuge / pareja de hecho</option>
                <option value="I-descendiente">Descendiente menor de 21 años</option>
                <option value="II">Descendiente de 21 años o más</option>
                <option value="II-ascendiente">Ascendiente (padre, madre, abuelo/a)</option>
                <option value="III">Hermano/a, tío/a, sobrino/a (2º–3º grado)</option>
                <option value="IV">Primo/a, otro pariente o sin parentesco (4º grado+)</option>
              </select>
            </div>

            {(grupo === 'I-descendiente') && (
              <div className={styles.campo}>
                <label className={styles.label}>Edad del heredero (años)</label>
                <input type="number" className={styles.input} value={edad}
                  onChange={(e) => setEdad(e.target.value)} min="0" max="100" />
                <span className={styles.helper}>Relevante si es menor de 21 años</span>
              </div>
            )}

            <div className={styles.campo}>
              <label className={styles.label}>Discapacidad reconocida</label>
              <div className={styles.radioGroup}>
                {[['0','No'], ['33','33%–64%'], ['65','≥65%']].map(([v, l]) => (
                  <label key={v} className={styles.radioLabel}>
                    <input type="radio" value={v} checked={discapacidad === v}
                      onChange={() => setDiscapacidad(v as NivelDiscapacidad)} />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Patrimonio preexistente del heredero</label>
              <select className={styles.select} value={patrimonioIdx} onChange={(e) => setPatrimonioIdx(e.target.value)}>
                <option value="1">Menos de 402.678 €</option>
                <option value="2">402.678 € – 2.007.380 €</option>
                <option value="3">2.007.380 € – 4.020.770 €</option>
                <option value="4">Más de 4.020.770 €</option>
              </select>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Porcentaje de la herencia que recibes</label>
              <div className={styles.inputConUnidad}>
                <input type="number" className={styles.input} value={porcentajeHerencia}
                  onChange={(e) => setPorcentajeHerencia(e.target.value)} min="1" max="100" />
                <span className={styles.unidad}>%</span>
              </div>
              <span className={styles.helper}>100% si eres el único heredero</span>
            </div>
          </div>

          {/* Sección 2: Tipo de adquisición */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>📋 Tipo de Adquisición</h2>
            <div className={styles.radioGroup}>
              {([['plena','Plena propiedad'], ['usufructo','Usufructo'], ['nuda','Nuda propiedad']] as [TipoAdquisicion, string][]).map(([v, l]) => (
                <label key={v} className={styles.radioLabel}>
                  <input type="radio" value={v} checked={tipoAdquisicion === v}
                    onChange={() => setTipoAdquisicion(v)} />
                  {l}
                </label>
              ))}
            </div>
            {(tipoAdquisicion === 'usufructo' || tipoAdquisicion === 'nuda') && (
              <div className={styles.campo}>
                <label className={styles.label}>Edad del usufructuario</label>
                <input type="number" className={styles.input} value={edadUsufructuario}
                  onChange={(e) => setEdadUsufructuario(e.target.value)} min="10" max="89" />
                <span className={styles.helper}>Fórmula: valor usufructo = (89 – edad) / 100, mín. 10%</span>
              </div>
            )}
          </div>

          {/* Sección 3: Bienes */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>🏦 Bienes del Fallecido</h2>
            <p className={styles.seccionNota}>Introduce el valor total de todos los bienes</p>

            {[
              ['Saldos en cuentas bancarias', saldosCuentas, setSaldosCuentas, '💳'],
              ['Acciones, fondos y productos financieros', accionesFondos, setAccionesFondos, '📊'],
              ['Vivienda habitual', viviendaHabitual, setViviendaHabitual, '🏠'],
              ['Otros inmuebles', otrosInmuebles, setOtrosInmuebles, '🏢'],
              ['Vehículos', vehiculos, setVehiculos, '🚗'],
              ['Seguros de vida', segurosVida, setSegurosVida, '📋'],
              ['Otros bienes', otrosBienes, setOtrosBienes, '📦'],
            ].map(([label, value, setter, icon]) => (
              <div key={label as string} className={styles.campo}>
                <label className={styles.label}>{icon as string} {label as string}</label>
                <div className={styles.inputConUnidad}>
                  <input type="text" className={styles.input} value={value as string}
                    onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                    placeholder="0,00" inputMode="decimal" />
                  <span className={styles.unidad}>€</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sección 4: Deudas */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>💸 Deudas y Cargas</h2>
            {[
              ['Hipotecas y préstamos hipotecarios', hipotecas, setHipotecas],
              ['Otros préstamos y deudas', otrosPrestamos, setOtrosPrestamos],
              ['Gastos de sepelio', gastosSepelio, setGastosSepelio],
            ].map(([label, value, setter]) => (
              <div key={label as string} className={styles.campo}>
                <label className={styles.label}>{label as string}</label>
                <div className={styles.inputConUnidad}>
                  <input type="text" className={styles.input} value={value as string}
                    onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                    placeholder="0,00" inputMode="decimal" />
                  <span className={styles.unidad}>€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel de resultados ──────────────────────────────────── */}
        <div className={styles.resultsPanel}>
          {!resultado ? (
            <div className={styles.placeholder}>
              <p>📝 Selecciona tu CCAA y parentesco, e introduce los bienes para ver la estimación</p>
            </div>
          ) : (
            <>
              {resultado.esForal && ccaa !== 'cataluna' && (
                <div className={styles.alertaForal}>
                  <strong>⚠️ Estimación muy aproximada — Régimen Foral</strong>
                  <p>Esta estimación usa la tarifa estatal como aproximación. El régimen foral real puede diferir significativamente. Consulta obligatoria.</p>
                </div>
              )}

              {/* Resultado destacado */}
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Impuesto estimado en {resultado.ccaaNombre}</span>
                <span className={styles.resultadoValor}>{formatCurrency(resultado.cuotaFinal)}</span>
                {resultado.porcentajeBonificacion > 0 && (
                  <span className={styles.resultadoNota}>
                    Bonificación autonómica: {formatNumber(resultado.porcentajeBonificacion, 1)}%
                  </span>
                )}
                <span className={styles.resultadoTipoEfectivo}>
                  Tipo efectivo: {formatNumber(resultado.tipoEfectivo, 2)}%
                </span>
              </div>

              {/* Masa hereditaria */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Masa Hereditaria</h3>
                <div className={styles.linea}><span>Total activos</span><span>{formatCurrency(resultado.totalActivos)}</span></div>
                {resultado.totalDeudas > 0 && <div className={styles.linea}><span>– Deudas y cargas</span><span>{formatCurrency(resultado.totalDeudas)}</span></div>}
                <div className={styles.linea}><span>Masa hereditaria neta</span><span>{formatCurrency(resultado.masaHereditaria)}</span></div>
                <div className={styles.linea}><span>+ Ajuar doméstico (3%)</span><span>{formatCurrency(resultado.ajuarDomestico)}</span></div>
                <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base imponible total</span><span>{formatCurrency(resultado.baseImponible)}</span></div>
              </div>

              {/* Ajuste por adquisición */}
              {(tipoAdquisicion !== 'plena' || parseFloat(porcentajeHerencia) !== 100) && (
                <div className={styles.desglose}>
                  <h3 className={styles.desgloseTitle}>Adquisición del Heredero</h3>
                  <div className={styles.linea}><span>Porcentaje de herencia</span><span>{porcentajeHerencia}%</span></div>
                  {tipoAdquisicion !== 'plena' && (
                    <div className={styles.linea}>
                      <span>Tipo adquisición ({tipoAdquisicion})</span>
                      <span>{formatNumber(resultado.porcentajeAdquisicion * 100, 1)}%</span>
                    </div>
                  )}
                  <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base ajustada</span><span>{formatCurrency(resultado.baseAjustada)}</span></div>
                </div>
              )}

              {/* Reducciones */}
              {resultado.reducciones.length > 0 && (
                <div className={styles.desglose}>
                  <h3 className={styles.desgloseTitle}>Reducciones</h3>
                  {resultado.reducciones.map((r, i) => (
                    <div key={i} className={styles.linea}>
                      <span className={styles.lineaBonif}>– {r.concepto}</span>
                      <span className={styles.lineaBonif}>{formatCurrency(r.importe)}</span>
                    </div>
                  ))}
                  <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base liquidable</span><span>{formatCurrency(resultado.baseLiquidable)}</span></div>
                </div>
              )}

              {/* Liquidación */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Liquidación</h3>
                <div className={styles.linea}><span>Cuota íntegra</span><span>{formatCurrency(resultado.cuotaIntegra)}</span></div>
                <div className={styles.linea}><span>× Coeficiente multiplicador</span><span>×{resultado.coeficienteMultiplicador.toFixed(4)}</span></div>
                <div className={styles.linea}><span>Cuota tributaria</span><span>{formatCurrency(resultado.cuotaTributaria)}</span></div>
                {resultado.bonificacionCcaa > 0 && (
                  <div className={styles.linea}>
                    <span className={styles.lineaBonif}>– {resultado.detalleBonificacion}</span>
                    <span className={styles.lineaBonif}>{formatCurrency(resultado.bonificacionCcaa)}</span>
                  </div>
                )}
                <div className={`${styles.linea} ${styles.lineaTotal} ${styles.lineaFinal}`}>
                  <span>CUOTA A INGRESAR (estimada)</span>
                  <span>{formatCurrency(resultado.cuotaFinal)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender el Impuesto de Sucesiones?"
        subtitle="Guía completa: cómo funciona, plazos y diferencias entre CCAA"
      >
        <section className={styles.guideSection}>
          <h2>El Impuesto de Sucesiones en España</h2>
          <p>
            El Impuesto de Sucesiones y Donaciones (ISD) grava la adquisición de bienes y derechos
            por herencia, legado o donación. Está cedido a las comunidades autónomas, lo que genera
            grandes diferencias entre territorios.
          </p>

          <h3>Pasos del cálculo</h3>
          <ol>
            <li><strong>Masa hereditaria neta:</strong> Total activos – deudas y cargas</li>
            <li><strong>Ajuar doméstico:</strong> Se añade automáticamente un 3% (salvo prueba en contrario)</li>
            <li><strong>Base imponible:</strong> Masa + ajuar, proporcional al porcentaje heredado</li>
            <li><strong>Reducciones:</strong> Por parentesco, edad, discapacidad, vivienda habitual, seguro de vida</li>
            <li><strong>Base liquidable:</strong> Base imponible – reducciones</li>
            <li><strong>Cuota íntegra:</strong> Aplicando la tarifa correspondiente a la base liquidable</li>
            <li><strong>Coeficiente multiplicador:</strong> Según grupo y patrimonio preexistente</li>
            <li><strong>Bonificación autonómica:</strong> Las CCAA pueden reducir la cuota hasta el 99,9%</li>
          </ol>

          <h3>Diferencias entre CCAA</h3>
          <p>
            Madrid y Canarias tienen bonificaciones del 99% y 99,9% respectivamente para los grupos
            de parentesco más cercanos, haciendo el impuesto prácticamente cero. Asturias, en cambio,
            no tiene bonificación en cuota (solo una reducción adicional en base), siendo la más
            costosa del régimen común.
          </p>

          <h3>Grupos de parentesco</h3>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>Grupo I</h4>
              <p>Descendientes menores de 21 años y cónyuge</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo II</h4>
              <p>Descendientes de 21 años o más y ascendientes</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo III</h4>
              <p>Colaterales 2º y 3º grado: hermanos, tíos, sobrinos</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo IV</h4>
              <p>Colaterales 4º grado, parientes más lejanos y extraños</p>
            </div>
          </div>

          <h3>Regímenes forales: Cataluña, País Vasco y Navarra</h3>
          <p>
            Estos territorios tienen normativa propia. Cataluña aplica una tarifa entre el 7% y el 32%,
            con reducciones distintas. País Vasco (tres Haciendas Forales diferentes) y Navarra tienen
            sistemas muy favorables para familiares directos, con reducciones cercanas al 100%.
          </p>

          <h3>Plazos importantes</h3>
          <div className={styles.plazosGrid}>
            <div className={styles.plazoCard}>
              <span className={styles.plazoNum}>6 meses</span>
              <span>Para autoliquidar desde el fallecimiento</span>
            </div>
            <div className={styles.plazoCard}>
              <span className={styles.plazoNum}>+6 meses</span>
              <span>Prórroga solicitando antes de los primeros 5 meses</span>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-impuesto-sucesiones')} />
      <ShareCard appName="estimador-impuesto-sucesiones" />
      <Footer appName="estimador-impuesto-sucesiones" />
    </div>
  );
}
