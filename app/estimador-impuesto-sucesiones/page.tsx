'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorSucesiones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, LegalNotice, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
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

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
      />

      <DataReference
        normativa={FISCAL_SUCESIONES_META.fuente}
        fuente={FISCAL_SUCESIONES_META.fuente}
        verificado={FISCAL_SUCESIONES_META.verificado}
        urlOficial={FISCAL_SUCESIONES_META.urlOficial}
      />

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
            de parentesco más cercanos, haciendo el impuesto prácticamente cero. Asturias mantiene
            una bonificación menor (con reducción adicional en base), por lo que resulta la CCAA
            con mayor recaudación efectiva del régimen común para herencias entre familiares directos.
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

        {/* ── Sección 1: Tabla comparativa de grupos ────────────────── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de los 4 grupos de parentesco</h2>
          <p>
            El grupo de parentesco es el factor que más condiciona la carga fiscal. La diferencia entre
            un hijo y un sobrino puede suponer pagar el 0% o más del 30% de la herencia.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Reducción estatal base</th>
                  <th>Coeficiente multiplicador*</th>
                  <th>Bonificación autonómica típica</th>
                  <th>Situación típica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Grupo I</strong><br /><small>Descendiente &lt;21 a. / cónyuge</small></td>
                  <td>15.956,87 € + 3.990,72 € por año &lt;21 (máx. 47.858,59 €)</td>
                  <td>1,0000 (patrimonio &lt;402.678 €)</td>
                  <td>99%–100% en Madrid, Canarias, Galicia, Andalucía</td>
                  <td>Hijo menor de 21 años hereda la vivienda familiar</td>
                </tr>
                <tr>
                  <td><strong>Grupo II</strong><br /><small>Descendiente ≥21 a. / ascendiente</small></td>
                  <td>15.956,87 €</td>
                  <td>1,0000 (patrimonio &lt;402.678 €)</td>
                  <td>99%–100% en Madrid, Canarias; 0% en Asturias</td>
                  <td>Hijo adulto o padre hereda bienes del fallecido</td>
                </tr>
                <tr>
                  <td><strong>Grupo III</strong><br /><small>Hermanos, tíos, sobrinos</small></td>
                  <td>7.993,46 €</td>
                  <td>1,5882 (patrimonio &lt;402.678 €)</td>
                  <td>Escasa o nula en la mayoría de CCAA</td>
                  <td>Sobrino hereda de tía sin hijos</td>
                </tr>
                <tr>
                  <td><strong>Grupo IV</strong><br /><small>Primos, parientes lejanos, extraños</small></td>
                  <td>0 €</td>
                  <td>2,0000 (patrimonio &lt;402.678 €)</td>
                  <td>Generalmente sin bonificación</td>
                  <td>Amigo o pareja no registrada hereda bienes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.helper}>* Coeficientes para el régimen estatal (tarifa de 2025). Cataluña tiene coeficientes propios.</p>
        </section>

        {/* ── Sección 2: Casos de uso ───────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales: 4 perfiles</h2>
          <p>
            Estos escenarios ilustran cómo varía el impuesto según la CCAA, el parentesco y el tipo
            de bien heredado. Los importes son aproximados y orientativos.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <div>
                  <strong>Hijo adulto hereda piso</strong>
                  <small>Madrid — Grupo II — 200.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Base imponible: 200.000 € (piso) + 6.000 € (ajuar 3%) = <strong>206.000 €</strong>.
                  Reducción por parentesco: 15.956,87 €. Reducción vivienda habitual (95%):
                  mín(190.000 × 0,95; 122.606 €) = <strong>122.606 €</strong>.
                  Base liquidable: 67.437 €. Cuota íntegra (tarifa estatal): ~6.100 €.
                  Bonificación Madrid (99%): –6.039 €.
                </p>
                <p><strong>Cuota final estimada: ~61 €</strong></p>
              </div>
              <div className={styles.escenarioTip}>
                Madrid tiene bonificación del 99% para Grupos I y II. Un hijo paga prácticamente cero.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💳</span>
                <div>
                  <strong>Sobrino hereda cuenta bancaria</strong>
                  <small>Asturias — Grupo III — 80.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Base imponible: 80.000 € + 2.400 € (ajuar) = <strong>82.400 €</strong>.
                  Reducción por parentesco (Grupo III): 7.993,46 €. Base liquidable: 74.407 €.
                  Cuota íntegra: ~10.860 €. Coeficiente multiplicador (Grupo III): × 1,5882 → <strong>17.237 €</strong>.
                  Asturias no tiene bonificación en cuota para Grupo III.
                </p>
                <p><strong>Cuota final estimada: ~17.200 €</strong> (21,5% del valor heredado)</p>
              </div>
              <div className={styles.escenarioTip}>
                Asturias es la CCAA del régimen común con menor bonificación para colaterales (Grupo III).
                Un sobrino sin reducción autonómica adicional tributa aprox. al 20% sobre lo heredado, frente al 0%–1% de CCAA como Madrid o Canarias.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <div>
                  <strong>Viuda hereda empresa familiar</strong>
                  <small>Cataluña — Grupo I-cónyuge — 500.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Cataluña aplica tarifa propia (7%–32%) y coeficientes propios.
                  La empresa familiar puede tener reducción del 95% si cumple requisitos
                  (art. 20.2.c Ley 29/1987 y normativa catalana). Sin esa reducción:
                  base liquidable aprox. 484.043 €. Cuota catalana: ~67.000 €.
                  Coeficiente cónyuge catalán: 1,0000.
                </p>
                <p><strong>Con reducción empresa familiar: cuota puede reducirse a ~3.350 €</strong></p>
              </div>
              <div className={styles.escenarioTip}>
                La reducción por empresa familiar (95%) requiere que el causante ejerciera
                funciones de dirección y que la familia mantenga los bienes 10 años.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👶</span>
                <div>
                  <strong>Hijo menor con discapacidad</strong>
                  <small>País Vasco — Grupo I — 300.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  País Vasco tiene normativa foral propia (Álava, Bizkaia, Gipuzkoa con pequeñas
                  diferencias). Para descendientes directos con discapacidad ≥33%, la reducción
                  adicional es de 55.000 €–65.000 € según territorio. La bonificación para
                  familiares directos es del 95%–100% en la mayoría de supuestos.
                </p>
                <p><strong>Cuota efectiva generalmente cercana a 0 €</strong></p>
              </div>
              <div className={styles.escenarioTip}>
                País Vasco, Navarra y Cataluña tienen sus propias reducciones por discapacidad,
                a menudo más generosas que la estatal (47.858,59 € al 65%).
              </div>
            </div>
          </div>
        </section>

        {/* ── Sección 3: FAQ ────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Impuesto de Sucesiones</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Tengo que pagar si heredo en Madrid o Canarias?</dt>
              <dd>
                En la práctica, casi nunca. Madrid aplica una bonificación del 99% para los Grupos I y II
                (cónyuge, descendientes, ascendientes). Canarias aplica el 99,9% para los mismos grupos.
                La cuota resultante es de céntimos. Sin embargo, <strong>sí estás obligado a autoliquidar
                aunque la cuota sea cero</strong>, presentando el modelo 650 en el plazo de 6 meses.
                <div className={styles.faqTip}>Presentar aunque la cuota sea 0 evita sanciones por extemporaneidad.</div>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si el inmueble vale más que el valor catastral?</dt>
              <dd>
                Para el ISD, los inmuebles se declaran por el <strong>valor de referencia del Catastro</strong>
                (desde 2022, conforme a la Ley 11/2021). Si ese valor no existe o el contribuyente lo
                impugna, se usa el valor de mercado. Si declaras por debajo del valor de referencia,
                Hacienda puede iniciar una comprobación de valores y girar una liquidación complementaria
                con intereses de demora (actualmente al 4,0625% anual).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo aplazar el pago si no tengo liquidez?</dt>
              <dd>
                Sí. El art. 65 LGT permite solicitar aplazamiento o fraccionamiento. Para el ISD
                existe además la posibilidad de aplazamiento especial cuando en la herencia hay bienes
                inmuebles y el heredero no tiene liquidez suficiente. El aplazamiento ordinario
                conlleva intereses de demora. En algunos casos, la CCAA puede aceptar el pago
                mediante adjudicación de bienes (dación en pago).
                <div className={styles.faqTip}>Solicitar el aplazamiento ANTES de que venza el plazo. Si presentas fuera de plazo, pagas recargo además.</div>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué es el coeficiente multiplicador?</dt>
              <dd>
                Es un factor que incrementa la cuota íntegra según el grupo de parentesco y el
                patrimonio preexistente del heredero. Un hijo con menos de 402.678 € de patrimonio
                usa el coeficiente 1,0000 (sin incremento). Un sobrino (Grupo III) con el mismo
                patrimonio usa 1,5882, por lo que paga un 58,82% más que la cuota íntegra base.
                Con patrimonio preexistente superior a 4.020.770 €, el coeficiente llega a 2,4 en
                el Grupo IV.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo afecta la discapacidad a las reducciones?</dt>
              <dd>
                La normativa estatal establece dos tramos: discapacidad entre el 33% y el 64%
                da derecho a una reducción adicional de <strong>47.858,59 €</strong>; discapacidad
                del 65% o superior da derecho a <strong>150.253,03 €</strong>. Estas reducciones
                se suman a las de parentesco. Algunas CCAA (Andalucía, Valencia, Cataluña) amplían
                estos importes. El grado de discapacidad debe estar reconocido oficialmente antes
                del devengo del impuesto.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si presento fuera de plazo?</dt>
              <dd>
                Si presentas antes de que Hacienda te requiera, se aplica el recargo por extemporaneidad
                espontánea: <strong>5% si tardas hasta 3 meses</strong>, 10% hasta 6 meses, 15% hasta
                12 meses, y 20% a partir de 12 meses. Además se exigen intereses de demora a partir
                del mes 12. Si Hacienda actúa primero (liquidación de oficio), se aplican sanciones
                que pueden llegar al 150% de la deuda.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo deducir las deudas del causante?</dt>
              <dd>
                Sí. Las deudas acreditadas del fallecido (hipotecas, préstamos, facturas pendientes)
                minoran la masa hereditaria. También son deducibles los <strong>gastos de última
                enfermedad</strong> y los gastos de sepelio (entierro y funeral) en cuantía razonable.
                No son deducibles las deudas contraídas con herederos, ni las garantizadas con cláusula
                de reserva de dominio.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre reducción y bonificación?</dt>
              <dd>
                Son mecanismos distintos que actúan en fases diferentes del cálculo:
                <ul>
                  <li><strong>Reducción</strong>: Resta de la base imponible antes de aplicar la tarifa.
                  Ejemplo: reducción por parentesco de 15.956,87 € en Grupo II.</li>
                  <li><strong>Bonificación</strong>: Porcentaje que se aplica sobre la cuota tributaria
                  ya calculada. Ejemplo: Madrid bonifica el 99% de la cuota para Grupo II.</li>
                </ul>
                Una reducción de 15.956 € ahorra entre ~1.200 € y ~3.700 € dependiendo del tramo.
                Una bonificación del 99% sobre una cuota de 10.000 € ahorra 9.900 €.
                <div className={styles.faqTip}>Las bonificaciones autonómicas son en general mucho más potentes que las reducciones estatales.</div>
              </dd>
            </div>
          </dl>
        </section>

        {/* ── Sección 4: Guía paso a paso ──────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: del fallecimiento al pago del impuesto</h2>
          <p>
            Desde el fallecimiento hasta la inscripción de los bienes, el proceso tiene 7 etapas
            claramente definidas. El plazo para liquidar el impuesto es de <strong>6 meses</strong>,
            pero la tramitación completa puede llevar 1–2 años.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Obtener el certificado de defunción</strong>
                <p>
                  Se solicita en el Registro Civil del municipio donde ocurrió el fallecimiento.
                  Plazo recomendado: dentro de las 24 horas. Es gratuito. Necesario para todos
                  los trámites posteriores.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Solicitar el certificado de últimas voluntades</strong>
                <p>
                  Acredita si el fallecido otorgó testamento y ante qué notario. Se solicita al
                  Ministerio de Justicia (presencialmente o por correo) con el certificado de
                  defunción. <strong>Plazo mínimo: 15 días hábiles</strong> desde el fallecimiento.
                  Coste: 3,78 €.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Obtener el testamento o iniciar declaración de herederos</strong>
                <p>
                  Si hay testamento: la notaría que lo otorgó entrega copia autorizada.
                  Si no hay testamento (abintestato): se inicia ante notaría el acta de declaración
                  de herederos, que puede tardar 2–4 meses. Sin este documento no se puede
                  inventariar ni adjudicar la herencia.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcular la masa hereditaria neta</strong>
                <p>
                  Inventariar todos los bienes (cuentas, inmuebles, vehículos, fondos, seguros) y
                  restar las deudas acreditadas. El ajuar doméstico se presume en el 3% salvo
                  prueba en contrario. Obtener certificados de saldos bancarios a la fecha de
                  fallecimiento y tasaciones de inmuebles si es necesario.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Aplicar reducciones y calcular la cuota</strong>
                <p>
                  Aplicar las reducciones según parentesco, edad, discapacidad y tipo de bien.
                  Aplicar la tarifa correspondiente (estatal o autonómica) sobre la base liquidable.
                  Multiplicar por el coeficiente según grupo y patrimonio. Aplicar la bonificación
                  autonómica si corresponde.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Autoliquidar con el modelo 650 en la CCAA competente</strong>
                <p>
                  La CCAA competente es donde residía el causante (fallecido) de forma habitual
                  durante los 5 años anteriores al fallecimiento. Plazo: <strong>6 meses</strong>
                  desde el fallecimiento. Se puede solicitar prórroga de 6 meses adicionales
                  antes de que expiren los primeros 5 meses. El modelo 650 se presenta online
                  en el portal tributario de la CCAA correspondiente.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Inscribir bienes y adjudicar la herencia</strong>
                <p>
                  Una vez pagado el impuesto (o acreditado que la cuota es cero), se firma la
                  escritura de aceptación y adjudicación de herencia ante notario. Los inmuebles
                  se inscriben en el Registro de la Propiedad presentando la escritura junto con
                  el justificante de pago del ISD. Plazo registral: 15 días hábiles habitual.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── Sección 5: Mejores prácticas ─────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>6 buenas prácticas para liquidar correctamente el impuesto y aplicar los beneficios fiscales previstos por la norma</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <div>
                <strong>Solicita la prórroga antes del mes 5</strong>
                <p>
                  Si no tienes tiempo de tramitar la herencia en 6 meses, solicita la prórroga
                  antes de que expiren los primeros 5 meses. La prórroga es de 6 meses adicionales
                  y no genera intereses ni recargo si se solicita en plazo.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <div>
                <strong>Valora la aceptación a beneficio de inventario</strong>
                <p>
                  Si el causante podría tener deudas desconocidas, acepta la herencia a beneficio
                  de inventario. Así solo respondes con los bienes heredados, no con tu patrimonio
                  personal. El plazo para optar es de 30 días hábiles desde que conoces la herencia.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏷️</span>
              <div>
                <strong>Verifica el método de valoración del inmueble</strong>
                <p>
                  Desde 2022, los inmuebles se declaran por el valor de referencia catastral.
                  Si es mayor que el valor de mercado, puedes impugnarlo ante la Dirección General
                  del Catastro aportando tasación pericial. Una reducción del 10% en la valoración
                  de un piso de 300.000 € puede ahorrar 1.000–4.000 € en ISD.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🪑</span>
              <div>
                <strong>Declara el ajuar doméstico correctamente</strong>
                <p>
                  Hacienda presume el 3% del valor de la masa hereditaria neta como ajuar doméstico.
                  Si los muebles, ropa y enseres valen menos, puedes impugnar esta presunción
                  aportando inventario valorado. En una herencia de 400.000 €, el ajuar presunto
                  es de 12.000 €, lo que supone ~600–2.000 € adicionales de impuesto.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏠</span>
              <div>
                <strong>Aplica la reducción por vivienda habitual</strong>
                <p>
                  Si heredas la vivienda habitual del causante, aplica la reducción del 95%
                  sobre su valor (con el límite estatal de 122.606,47 € por heredero). Cónyuge,
                  descendientes y ascendientes pueden aplicarla. Solo en Cataluña aplica un régimen
                  distinto. Requisito: mantener la vivienda 10 años (o 3 en algunas CCAA).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📤</span>
              <div>
                <strong>Liquida aunque la cuota sea cero</strong>
                <p>
                  En CCAA con bonificación del 99%–100% (Madrid, Canarias, Galicia), la cuota
                  resultante es prácticamente cero pero la obligación de presentar el modelo 650
                  subsiste. No presentar conlleva sanción por infracción formal de entre 200 € y
                  400 € y puede complicar la inscripción de los bienes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sección 6: Warning box — errores comunes ─────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h2>6 errores que pueden costarte caro</h2>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No declarar en plazo.</strong> El recargo por extemporaneidad espontánea
                va del 5% (hasta 3 meses de retraso) al 20% (más de 12 meses), más intereses de
                demora desde el mes 12. Una cuota de 10.000 € presentada con 8 meses de retraso
                generará un recargo de 1.500 € adicionales.
              </li>
              <li>
                <strong>Confundir la CCAA competente.</strong> El impuesto se presenta en la CCAA
                donde residía habitualmente el causante durante los últimos 5 años, <em>no</em> donde
                está el heredero ni donde están los bienes. Presentar en la CCAA incorrecta no
                interrumpe el plazo: Hacienda puede exigirte el impuesto en la CCAA correcta con
                los recargos correspondientes.
              </li>
              <li>
                <strong>No solicitar prórroga en tiempo.</strong> La prórroga de 6 meses solo puede
                pedirse antes de que expiren los primeros 5 meses. Si esperas al mes 6, ya no es
                posible: el plazo ha vencido y cualquier presentación fuera de plazo genera recargo.
              </li>
              <li>
                <strong>Ignorar el ajuar doméstico.</strong> Hacienda presume automáticamente el
                3% del valor neto como ajuar. Si lo omites en tu declaración, la oficina gestora
                puede practicar una liquidación paralela incluyendo ese 3% más intereses de demora.
              </li>
              <li>
                <strong>Aceptar la herencia sin inventario cuando hay deudas.</strong> Si el causante
                tenía deudas desconocidas (tarjetas, avales, impuestos pendientes), aceptar la
                herencia pura y simplemente hace que respondas con todo tu patrimonio. La aceptación
                a beneficio de inventario limita tu responsabilidad a los bienes heredados.
              </li>
              <li>
                <strong>Olvidar los seguros de vida.</strong> Los seguros de vida contratados por
                el causante con beneficiarios nominados no forman parte de la herencia civil, pero
                <em>sí tributan por ISD</em> por su normativa específica. El beneficiario debe
                declararlos en el modelo 650 dentro del mismo plazo de 6 meses, con independencia
                de la herencia. La reducción estatal máxima es de 9.195,49 € para cónyuge,
                descendientes y ascendientes.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-impuesto-sucesiones')} />
      <ShareCard appName="estimador-impuesto-sucesiones" />
      <Footer appName="estimador-impuesto-sucesiones" />
    </div>
  );
}
