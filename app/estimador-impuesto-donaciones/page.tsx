'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorDonaciones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, LegalNotice } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_DONACIONES_META,
  TARIFA_ESTATAL_ID,
  TARIFA_CATALUNA_ID_GENERAL,
  TARIFA_CATALUNA_ID_REDUCIDA,
  COEFICIENTES_ID,
  COEFICIENTES_CATALUNA_ID,
  REDUCCIONES_PARENTESCO_ID,
  REDUCCION_DISCAPACIDAD_33_ID,
  REDUCCION_DISCAPACIDAD_65_ID,
  BONIFICACIONES_CCAA_ID,
  TramoTarifaID,
  BonificacionGrupoID,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type GrupoParentesco = 'I-conyuge' | 'I-descendiente' | 'II' | 'II-ascendiente' | 'III' | 'IV';
type NivelDiscapacidad = '0' | '33' | '65';

interface ResultadoDonaciones {
  baseImponible: number;
  cargas: number;
  baseLiquidable: number;
  reduccionParentesco: number;
  reduccionDiscapacidad: number;
  baseNetaReducida: number;
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  cuotaTributaria: number;
  bonificacionCcaa: number;
  porcentajeBonificacion: number;
  detalleBonificacion: string;
  cuotaFinal: number;
  tipoEfectivo: number;
  ccaaNombre: string;
  esForal: boolean;
  tarifaAplicada: string;
}

// ─── Funciones de cálculo ─────────────────────────────────────────────────────

function calcularTarifa(base: number, tarifa: TramoTarifaID[]): number {
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
  ccaa: string,
  escrituraPublica: boolean
): { bonificacion: number; porcentaje: number; detalle: string } {
  const config = BONIFICACIONES_CCAA_ID[ccaa];
  if (!config) return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

  const bGrupo: BonificacionGrupoID | undefined = config.bonificaciones[grupo];
  if (!bGrupo) return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación para este grupo' };

  // Castilla-La Mancha requiere escritura pública
  if (config.requiereEscritura && !escrituraPublica) {
    return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación: requiere escritura pública' };
  }

  // Exención total por importe (Andalucía)
  if (bGrupo.exencion !== undefined && baseLiquidable <= bGrupo.exencion) {
    return {
      bonificacion: cuotaTributaria,
      porcentaje: 100,
      detalle: `Exención total (base ≤ ${formatCurrency(bGrupo.exencion)})`,
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

export default function EstimadorImpuestoDonacionesPage() {
  const [ccaa, setCcaa] = useState('');
  const [valorDonacion, setValorDonacion] = useState('');
  const [cargas, setCargas] = useState('');
  const [escrituraPublica, setEscrituraPublica] = useState(true);
  const [grupo, setGrupo] = useState<GrupoParentesco | ''>('');
  const [patrimonioIdx, setPatrimonioIdx] = useState('1');
  const [discapacidad, setDiscapacidad] = useState<NivelDiscapacidad>('0');

  const ccaaInfo = useMemo(() => (ccaa ? BONIFICACIONES_CCAA_ID[ccaa] : null), [ccaa]);

  const resultado = useMemo((): ResultadoDonaciones | null => {
    if (!ccaa || !grupo) return null;
    const valor = parseSpanishNumber(valorDonacion) || 0;
    if (valor <= 0) return null;

    const cargasNum = parseSpanishNumber(cargas) || 0;
    const esCataluna = ccaa === 'cataluna';
    const esForal = ccaaInfo?.regimen === 'foral';
    const grupoBase = getGrupoBase(grupo);

    // 1. Base imponible
    const baseImponible = valor;

    // 2. Cargas deducibles
    const baseLiquidable = Math.max(0, baseImponible - cargasNum);

    // 3. Reducción por parentesco
    const reduccionParentesco = !esCataluna ? (REDUCCIONES_PARENTESCO_ID[grupo] || 0) : 0;

    // 4. Reducción por discapacidad
    let reduccionDiscapacidad = 0;
    if (discapacidad === '33') reduccionDiscapacidad = REDUCCION_DISCAPACIDAD_33_ID;
    else if (discapacidad === '65') reduccionDiscapacidad = REDUCCION_DISCAPACIDAD_65_ID;

    // 5. Base neta reducida
    const baseNetaReducida = Math.max(0, baseLiquidable - reduccionParentesco - reduccionDiscapacidad);

    // 6. Tarifa
    let tarifa: TramoTarifaID[];
    let tarifaAplicada = 'Tarifa estatal régimen común';

    if (esCataluna) {
      const esGrupoReducido = grupoBase === 'I' || grupoBase === 'II';
      if (esGrupoReducido && escrituraPublica) {
        tarifa = TARIFA_CATALUNA_ID_REDUCIDA;
        tarifaAplicada = 'Tarifa reducida Cataluña (5%–9%, escritura pública Gr I/II)';
      } else {
        tarifa = TARIFA_CATALUNA_ID_GENERAL;
        tarifaAplicada = 'Tarifa general Cataluña (7%–32%)';
      }
    } else {
      tarifa = TARIFA_ESTATAL_ID;
    }

    const cuotaIntegra = calcularTarifa(baseNetaReducida, tarifa);

    // 7. Coeficiente multiplicador
    const coefs = esCataluna ? COEFICIENTES_CATALUNA_ID : COEFICIENTES_ID;
    const idxPatrimonio = Math.min(3, Math.max(0, parseInt(patrimonioIdx) - 1));
    const coeficienteMultiplicador = coefs[grupoBase]?.[idxPatrimonio] ?? 1;

    const cuotaTributaria = cuotaIntegra * coeficienteMultiplicador;

    // 8. Bonificación CCAA
    const { bonificacion, porcentaje, detalle } = aplicarBonificacion(
      cuotaTributaria, baseLiquidable, grupo, ccaa, escrituraPublica
    );

    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);
    const tipoEfectivo = valor > 0 ? (cuotaFinal / valor) * 100 : 0;

    return {
      baseImponible,
      cargas: cargasNum,
      baseLiquidable,
      reduccionParentesco,
      reduccionDiscapacidad,
      baseNetaReducida,
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
      tarifaAplicada,
    };
  }, [ccaa, grupo, valorDonacion, cargas, escrituraPublica, patrimonioIdx, discapacidad, ccaaInfo]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎁 Estimador del Impuesto de Donaciones</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el ISD al recibir una donación en las 17 comunidades autónomas
        </p>
        <p className={styles.metaVerificado}>
          Datos verificados: {FISCAL_DONACIONES_META.verificado} — Fuente:{' '}
          <a href={FISCAL_DONACIONES_META.urlOficial} target="_blank" rel="noopener noreferrer" className={styles.linkFuente}>
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
          y <strong>no tienen validez fiscal ni jurídica</strong>.
        </p>
        <ul>
          <li>El impuesto lo paga quien <strong>recibe</strong> la donación (donatario), no quien la hace</li>
          <li>CCAA competente: donde reside habitualmente el donatario los últimos 5 años</li>
          <li>Empresa familiar, explotaciones agrarias y otros bienes tienen reducciones especiales</li>
          <li>Castilla-La Mancha: la bonificación requiere escritura pública</li>
          <li><strong>Plazo: 1 mes desde la donación (Modelo 651). Consulta siempre con asesor fiscal.</strong></li>
        </ul>
        <p className={styles.disclaimerResponsabilidad}>
          meskeIA no se responsabiliza de decisiones basadas en estas herramientas.
        </p>
      </div>

      <div className={styles.mainContent}>
        {/* ── Panel de inputs ─────────────────────────────────────── */}
        <div className={styles.inputsPanel}>

          {/* CCAA */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>🏛️ Comunidad Autónoma del Donatario</h2>
            <div className={styles.campo}>
              <label className={styles.label}>Residencia habitual de quien recibe la donación *</label>
              <select className={styles.select} value={ccaa} onChange={(e) => setCcaa(e.target.value)}>
                <option value="">— Selecciona CCAA —</option>
                <optgroup label="Régimen Común (14 CCAA)">
                  <option value="madrid">Comunidad de Madrid</option>
                  <option value="andalucia">Andalucía</option>
                  <option value="galicia">Galicia</option>
                  <option value="valencia">Comunitat Valenciana</option>
                  <option value="castilla-leon">Castilla y León</option>
                  <option value="castilla-mancha">Castilla-La Mancha ⚠️</option>
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
                <strong>⚠️ Régimen Foral — Estimación Muy Aproximada</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}

            {ccaa === 'castilla-mancha' && (
              <div className={styles.alertaEscritura}>
                <strong>📜 Castilla-La Mancha</strong>
                <p>La bonificación del 95% requiere escritura pública. Sin ella, se tributa a la tarifa completa.</p>
              </div>
            )}

            {ccaaInfo && (
              <div className={styles.infoCcaa}>
                <strong>ℹ️ {ccaaInfo.nombre}</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}
          </div>

          {/* Donación */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>💰 Bien Donado</h2>

            <div className={styles.campo}>
              <label className={styles.label}>Valor real del bien donado *</label>
              <div className={styles.inputConUnidad}>
                <input type="text" className={styles.input} value={valorDonacion}
                  onChange={(e) => setValorDonacion(e.target.value)}
                  placeholder="0,00" inputMode="decimal" />
                <span className={styles.unidad}>€</span>
              </div>
              <span className={styles.helper}>Dinero, inmueble (valor catastral/mercado), acciones, vehículo, etc.</span>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Cargas o deudas que asume el donatario</label>
              <div className={styles.inputConUnidad}>
                <input type="text" className={styles.input} value={cargas}
                  onChange={(e) => setCargas(e.target.value)}
                  placeholder="0,00" inputMode="decimal" />
                <span className={styles.unidad}>€</span>
              </div>
              <span className={styles.helper}>Ej: hipoteca que asume quien recibe el inmueble</span>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>¿Se formalizará en escritura pública?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" checked={escrituraPublica} onChange={() => setEscrituraPublica(true)} />
                  Sí
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" checked={!escrituraPublica} onChange={() => setEscrituraPublica(false)} />
                  No
                </label>
              </div>
              <span className={styles.helper}>Obligatoria para inmuebles. Necesaria en Cataluña (tarifa reducida) y Castilla-La Mancha (bonificación)</span>
            </div>
          </div>

          {/* Datos del donatario */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>👤 Datos de Quien Recibe</h2>

            <div className={styles.campo}>
              <label className={styles.label}>Parentesco con el donante *</label>
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

            <div className={styles.campo}>
              <label className={styles.label}>Patrimonio preexistente del donatario</label>
              <select className={styles.select} value={patrimonioIdx} onChange={(e) => setPatrimonioIdx(e.target.value)}>
                <option value="1">Menos de 402.678 €</option>
                <option value="2">402.678 € – 2.007.380 €</option>
                <option value="3">2.007.380 € – 4.020.770 €</option>
                <option value="4">Más de 4.020.770 €</option>
              </select>
            </div>

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
          </div>
        </div>

        {/* ── Panel de resultados ──────────────────────────────────── */}
        <div className={styles.resultsPanel}>
          {!resultado ? (
            <div className={styles.placeholder}>
              <p>📝 Selecciona tu CCAA y parentesco, e introduce el valor de la donación para ver la estimación</p>
            </div>
          ) : (
            <>
              {resultado.esForal && ccaa !== 'cataluna' && (
                <div className={styles.alertaForal}>
                  <strong>⚠️ Régimen Foral — Estimación muy aproximada</strong>
                  <p>Consulta obligatoria con asesor fiscal del territorio foral.</p>
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
                  Tipo efectivo sobre donación: {formatNumber(resultado.tipoEfectivo, 2)}%
                </span>
              </div>

              {/* Tarifa aplicada */}
              <div className={styles.infoTarifa}>
                <span>📊 Tarifa: {resultado.tarifaAplicada}</span>
              </div>

              {/* Desglose */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Base Imponible</h3>
                <div className={styles.linea}><span>Valor donación</span><span>{formatCurrency(resultado.baseImponible)}</span></div>
                {resultado.cargas > 0 && (
                  <div className={styles.linea}><span className={styles.lineaBonif}>– Cargas deducibles</span><span className={styles.lineaBonif}>{formatCurrency(resultado.cargas)}</span></div>
                )}
                <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base liquidable</span><span>{formatCurrency(resultado.baseLiquidable)}</span></div>
              </div>

              {(resultado.reduccionParentesco > 0 || resultado.reduccionDiscapacidad > 0) && (
                <div className={styles.desglose}>
                  <h3 className={styles.desgloseTitle}>Reducciones</h3>
                  {resultado.reduccionParentesco > 0 && (
                    <div className={styles.linea}><span className={styles.lineaBonif}>– Por parentesco</span><span className={styles.lineaBonif}>{formatCurrency(resultado.reduccionParentesco)}</span></div>
                  )}
                  {resultado.reduccionDiscapacidad > 0 && (
                    <div className={styles.linea}><span className={styles.lineaBonif}>– Por discapacidad</span><span className={styles.lineaBonif}>{formatCurrency(resultado.reduccionDiscapacidad)}</span></div>
                  )}
                  <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base neta reducida</span><span>{formatCurrency(resultado.baseNetaReducida)}</span></div>
                </div>
              )}

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
        title="📚 ¿Quieres entender el Impuesto de Donaciones?"
        subtitle="Guía completa con bonificaciones por comunidad autónoma"
      >
        <section className={styles.guideSection}>
          <h2>El Impuesto de Donaciones en España</h2>
          <p>
            El Impuesto de Donaciones forma parte del Impuesto sobre Sucesiones y Donaciones (ISD).
            Grava las adquisiciones a título gratuito entre personas vivas. Está cedido a las CCAA,
            que aplican bonificaciones muy dispares.
          </p>

          <h3>Diferencias entre CCAA para Grupos I y II</h3>
          <div className={styles.tablaCcaa}>
            <table>
              <thead>
                <tr><th>Comunidad</th><th>Bonificación</th><th>Nota</th></tr>
              </thead>
              <tbody>
                <tr><td>Canarias</td><td><strong>99,9%</strong></td><td>Práctica exención</td></tr>
                <tr><td>Madrid, Andalucía, Galicia...</td><td><strong>99%</strong></td><td>Régimen común más favorables</td></tr>
                <tr><td>La Rioja</td><td><strong>99%</strong></td><td>También Grupo III</td></tr>
                <tr><td>Castilla-La Mancha</td><td><strong>95%</strong></td><td>Requiere escritura</td></tr>
                <tr><td>Baleares</td><td><strong>93%</strong></td><td>Grupos I y II</td></tr>
                <tr><td>Valencia</td><td><strong>75%</strong></td><td>Más baja del régimen común</td></tr>
                <tr><td>Aragón</td><td><strong>65%</strong></td><td>Menor que en sucesiones</td></tr>
                <tr><td>Asturias</td><td><strong>99%</strong></td><td>A diferencia de sucesiones</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Cataluña: tarifa especial</h3>
          <p>
            Cataluña distingue dos tarifas. Si el donatario pertenece al Grupo I o II y la donación
            se formaliza en escritura pública, aplica una tarifa reducida del 5% al 9%.
            En caso contrario, la tarifa general es del 7% al 32%.
          </p>

          <h3>Preguntas frecuentes</h3>
          <details className={styles.faq}>
            <summary>¿Quién paga el impuesto?</summary>
            <p>El donatario (quien recibe), no el donante. El impuesto se declara en la CCAA donde reside el donatario.</p>
          </details>
          <details className={styles.faq}>
            <summary>¿Es necesaria escritura pública?</summary>
            <p>Obligatoria para inmuebles. Para dinero no lo es legalmente, pero en Castilla-La Mancha se necesita para la bonificación, y en Cataluña para acceder a la tarifa reducida.</p>
          </details>
          <details className={styles.faq}>
            <summary>¿Cuál es el plazo para declarar?</summary>
            <p>1 mes desde la donación. Modelo 651. Se presenta ante la Agencia Tributaria de la CCAA del donatario.</p>
          </details>
          <details className={styles.faq}>
            <summary>¿Puedo cambiar de CCAA para pagar menos?</summary>
            <p>El impuesto corresponde a la CCAA de residencia habitual del donatario. Cambiar de residencia únicamente para tributar menos puede considerarse fraude fiscal.</p>
          </details>
        </section>

        {/* ── 1. Tabla Comparativa ──────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Donación vs Herencia vs Compraventa: diferencias clave</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Donación</th>
                  <th>Herencia</th>
                  <th>Compraventa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>¿Quién paga?</strong></td>
                  <td>El donatario (quien recibe)</td>
                  <td>El heredero (quien recibe)</td>
                  <td>El comprador (ITP) o el vendedor (IRPF ganancia)</td>
                </tr>
                <tr>
                  <td><strong>Impuesto aplicable</strong></td>
                  <td>ISD — Impuesto de Donaciones</td>
                  <td>ISD — Impuesto de Sucesiones</td>
                  <td>ITP (2ª mano) o IVA + AJD (obra nueva)</td>
                </tr>
                <tr>
                  <td><strong>Plazo de declaración</strong></td>
                  <td>1 mes desde la donación</td>
                  <td>6 meses desde el fallecimiento (prorrogable 6 meses más)</td>
                  <td>30 días hábiles desde la firma</td>
                </tr>
                <tr>
                  <td><strong>¿Requiere escritura?</strong></td>
                  <td>Obligatoria para inmuebles; recomendada para dinero</td>
                  <td>Obligatoria (escritura de aceptación de herencia)</td>
                  <td>Obligatoria (escritura pública + inscripción Registro)</td>
                </tr>
                <tr>
                  <td><strong>Bonificación típica Grupo I/II</strong></td>
                  <td>99% en Madrid, Andalucía, Galicia, Asturias, Canarias</td>
                  <td>99%–100% en las mismas CCAA</td>
                  <td>No aplica (no hay relación de parentesco en ITP)</td>
                </tr>
                <tr>
                  <td><strong>Plusvalía municipal (IIVTNU)</strong></td>
                  <td>Sí, si se dona un inmueble urbano (paga el donatario)</td>
                  <td>Sí, si hay inmueble urbano (paga el heredero)</td>
                  <td>Sí (paga el vendedor salvo pacto en contrario)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. Casos de Uso ──────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales: 4 perfiles con números concretos</h2>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💶</span>
                <strong>Padre dona 50.000 € en efectivo a su hijo en Madrid</strong>
              </div>
              <p className={styles.escenarioExample}>
                Base imponible: 50.000 €. Reducción Grupo II: 15.956,87 €. Base neta: 34.043,13 €.
                Cuota íntegra (tarifa estatal): ≈ 5.765 €. Bonificación Madrid 99%: 5.707 €.
                <strong> Cuota final: ≈ 58 €.</strong>
              </p>
              <p className={styles.escenarioTip}>
                En Madrid la carga fiscal es casi nula para descendientes. Conviene elevar a escritura
                privada para dejar constancia documental del origen de los fondos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <strong>Abuelo dona piso de 150.000 € a su nieto en Asturias</strong>
              </div>
              <p className={styles.escenarioExample}>
                Base imponible: 150.000 €. Reducción Grupo II (nieto): 15.956,87 €. Base neta: 134.043 €.
                Cuota íntegra: ≈ 28.600 €. Bonificación Asturias 99% (Grupo II): 28.314 €.
                <strong> Cuota final: ≈ 286 €.</strong> Además, el nieto pagará la plusvalía municipal
                del inmueble urbano (IIVTNU).
              </p>
              <p className={styles.escenarioTip}>
                Asturias aplica bonificación del 99% también en donaciones (a diferencia de sucesiones
                donde la bonificación es menor). Es una de las CCAA más favorables para donar inmuebles.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <strong>Padres donan negocio familiar a hijo en Cataluña</strong>
              </div>
              <p className={styles.escenarioExample}>
                Valor empresa: 300.000 €. Si aplica la reducción del 95% por empresa familiar
                (art. 20.6 LISD), base neta: 15.000 €. Tarifa reducida Cataluña (Grupo II,
                escritura pública): 5%–9%. Cuota estimada sobre 15.000 €: ≈ 750 €.
                <strong> Sin la reducción del 95%, la cuota superaría los 35.000 €.</strong>
              </p>
              <p className={styles.escenarioTip}>
                La reducción del 95% para empresa familiar requiere cumplir requisitos estrictos:
                actividad económica real, participación mínima del 5% (15% en grupo familiar),
                y que el donante ejerza funciones de dirección con retribución superior al 50%
                de sus rendimientos del trabajo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌾</span>
                <strong>Tío dona finca rústica de 80.000 € a sobrino (Grupo III)</strong>
              </div>
              <p className={styles.escenarioExample}>
                Base imponible: 80.000 €. Reducción Grupo III: 7.993,46 €. Base neta: 72.006,54 €.
                Cuota íntegra (tarifa estatal): ≈ 13.920 €. Coeficiente multiplicador Grupo III
                (patrimonio {'<'} 402.678 €): 1,5882. Cuota tributaria: ≈ 22.108 €.
                Sin bonificación autonómica en la mayoría de CCAA para Grupo III.
                <strong> Cuota final: ≈ 22.108 €</strong> (27,6% de tipo efectivo).
              </p>
              <p className={styles.escenarioTip}>
                El Grupo III es el más penalizado. La tarifa progresiva más el coeficiente multiplicador
                pueden elevar el tipo efectivo al 25%–30%. La Rioja es la excepción: aplica bonificación
                del 99% también para el Grupo III.
              </p>
            </div>

          </div>
        </section>

        {/* ── 3. FAQ extendida ─────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>8 preguntas frecuentes con respuestas detalladas</h2>
          <ul className={styles.faqList}>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Tengo que pagar si mi padre me dona dinero en efectivo?</summary>
                <p>
                  Sí, aunque la carga puede ser mínima. Si resides en Madrid, Andalucía, Galicia,
                  Asturias o Canarias y eres descendiente (Grupo I o II), la bonificación autonómica
                  es del 99%–99,9%, lo que deja una cuota residual de unos pocos euros o cero.
                  En Cataluña, la tarifa general mínima es del 7%. La obligación de declarar
                  (Modelo 651) existe siempre, incluso si la cuota resultante es cero.
                </p>
                <p className={styles.faqTip}>Plazo: 1 mes desde la recepción del dinero.</p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Quién declara: el donante o el donatario?</summary>
                <p>
                  El <strong>donatario</strong> (quien recibe) es el sujeto pasivo del impuesto
                  y quien debe declarar y pagar. El donante no tiene obligación tributaria en el
                  ISD, aunque sí puede tener que declarar una ganancia patrimonial en el IRPF si
                  dona un bien que haya revalorizado (por la diferencia entre el valor de adquisición
                  y el valor de donación). Para dinero en efectivo, el donante no tiene implicaciones
                  en IRPF.
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Es necesaria la escritura pública para donar dinero?</summary>
                <p>
                  Legalmente no es obligatoria para donaciones de dinero o bienes muebles. Sin embargo,
                  es muy recomendable por varias razones: (1) Facilita la acreditación del origen de
                  los fondos ante Hacienda. (2) En Castilla-La Mancha, la bonificación del 95% está
                  condicionada a la existencia de escritura pública. (3) Para inmuebles, sí es
                  obligatoria (art. 633 Código Civil) y además necesaria para inscribir en el
                  Registro de la Propiedad. (4) En Cataluña, la tarifa reducida (5%–9%) para
                  Grupos I y II requiere escritura.
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Puedo hacer donaciones a mis hijos cada año sin tributar?</summary>
                <p>
                  Las donaciones del mismo donante al mismo donatario se acumulan durante los
                  <strong> 4 años anteriores</strong> (art. 30 LISD). Esto significa que si donas
                  50.000 € este año y el año que viene otros 50.000 €, la segunda donación se
                  calcula sobre una base acumulada de 100.000 €, aplicando la tarifa progresiva
                  desde ese importe. No existe un mínimo exento anual en el ISD estatal.
                  En CCAA con bonificación del 99% la acumulación tiene impacto mínimo, pero
                  en CCAA sin bonificaciones (Extremadura, Murcia, Valencia) puede multiplicar
                  la carga fiscal.
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Cómo tributa la donación de la vivienda habitual?</summary>
                <p>
                  El donatario paga el ISD calculado sobre el valor real del inmueble (puede
                  diferir del catastral). Además, el donatario asume el pago de la
                  <strong> plusvalía municipal (IIVTNU)</strong>, que grava el incremento del valor
                  del terreno urbano desde la última transmisión. El donante deberá declarar en su
                  IRPF la ganancia patrimonial generada (diferencia entre valor de adquisición y
                  valor de donación), salvo que sea su vivienda habitual y tenga más de 65 años
                  (exención por reinversión no aplica aquí, pero sí la exención por mayor de 65 años
                  en vivienda habitual).
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Qué pasa si no declaro la donación?</summary>
                <p>
                  Hacienda puede descubrir la donación en controles rutinarios (movimientos bancarios,
                  cambios en el Registro de la Propiedad, declaraciones de IRPF). Si se presenta
                  fuera de plazo <strong>voluntariamente</strong>: recargo del 5% (hasta 3 meses),
                  10% (3–6 meses), 15% (6–12 meses) o 20% (más de 12 meses).
                  Si hay requerimiento previo de Hacienda, se aplica una <strong>sanción del 50%–150%</strong>
                  de la cuota no ingresada, más intereses de demora (actualmente 4,0625% anual).
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Puedo cambiarme de CCAA para pagar menos impuesto?</summary>
                <p>
                  La CCAA competente es donde el donatario ha residido habitualmente durante los
                  últimos 5 años. Un traslado de residencia <em>real y efectivo</em> al menos 5 años
                  antes de recibir la donación puede ser legítimo. Sin embargo, un cambio de
                  empadronamiento ficticio o sin residencia efectiva puede ser detectado por Hacienda
                  (mediante análisis de consumo eléctrico, matrículas de vehículos, escolarización
                  de hijos, etc.) y tipificarse como <strong>fraude fiscal</strong>, con sanciones
                  que incluyen multa del 50%–150% más intereses, e incluso responsabilidad penal
                  si la cuota defraudada supera los 120.000 €.
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Cuánto tiempo tengo para declarar una donación?</summary>
                <p>
                  El plazo es de <strong>1 mes natural</strong> desde la fecha en que se produce
                  la donación (art. 67.1 RISD). Se presenta el <strong>Modelo 651</strong> ante
                  la Agencia Tributaria de la CCAA del donatario. No existe prórroga automática
                  (a diferencia de sucesiones, que permite 6 meses prorrogables). Si la donación
                  es de un inmueble, el plazo también aplica para la plusvalía municipal (IIVTNU),
                  aunque este último se presenta ante el Ayuntamiento donde radica el inmueble.
                </p>
              </details>
            </li>

          </ul>
        </section>

        {/* ── 4. Guía Paso a Paso ──────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: cómo declarar una donación</h2>
          <ol className={styles.stepGuide}>

            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Formalizar la donación</strong>
                <p>
                  Para <strong>inmuebles</strong>: obligatoria escritura pública ante notario (art. 633 CC).
                  El notario retiene la liquidación provisional. Para <strong>dinero o bienes muebles</strong>:
                  no es legalmente obligatorio, pero se recomienda documento privado con fecha cierta
                  (o escritura) para acreditar el origen. Coste aproximado de escritura notarial para
                  donación de dinero: 150 €–300 € según importe.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Identificar la CCAA competente</strong>
                <p>
                  Siempre es la <strong>CCAA de residencia habitual del donatario</strong> durante
                  los 5 años anteriores a la donación (no la del donante, ni donde se firme la
                  escritura). Si el donatario ha residido en varias CCAA, aplica aquella en la
                  que haya pasado más tiempo en esos 5 años.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Determinar el grupo de parentesco y las reducciones</strong>
                <p>
                  Grupo I: cónyuge y descendientes menores de 21 años.
                  Grupo II: descendientes de 21+ años y ascendientes.
                  Grupo III: hermanos, tíos, sobrinos.
                  Grupo IV: primos y extraños.
                  Aplicar reducciones estatales por parentesco (15.956,87 € en Grupo I/II)
                  y por discapacidad (48.000 € al 33%–64%; 150.000 € al 65%+).
                  En Cataluña no aplican las reducciones estatales por parentesco.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcular la base imponible y aplicar la tarifa estatal</strong>
                <p>
                  Base imponible = valor real del bien donado − cargas deducibles.
                  Base liquidable = base imponible − reducciones.
                  La tarifa estatal (17 tramos del 7,65% al 34%) se aplica sobre la base liquidable
                  para obtener la cuota íntegra, que se multiplica por el coeficiente según
                  patrimonio preexistente (1,0000–2,4000 para Grupo I; hasta 2,4000 para Grupo III/IV).
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Aplicar bonificaciones autonómicas</strong>
                <p>
                  Sobre la cuota tributaria (cuota íntegra × coeficiente), cada CCAA aplica sus
                  propias bonificaciones. Las más favorables: Canarias 99,9%, Madrid/Andalucía/
                  Galicia/Asturias 99%, Castilla-La Mancha 95% (con escritura), Baleares 93%.
                  Las menos favorables: Valencia 75%, Aragón 65%, Extremadura/Murcia 0%.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Autoliquidar en el plazo de 1 mes — Modelo 651</strong>
                <p>
                  Presentar el <strong>Modelo 651</strong> ante la Agencia Tributaria de la CCAA
                  del donatario, dentro del plazo de <strong>1 mes natural</strong> desde la donación.
                  Si hay inmueble, también presentar la plusvalía municipal (IIVTNU) ante el
                  Ayuntamiento en el mismo plazo. Conservar toda la documentación (escritura,
                  justificante bancario, acuse de recibo de la autoliquidación) por prescripción
                  de 4 años.
                </p>
              </div>
            </li>

          </ol>
        </section>

        {/* ── 5. Mejores Prácticas ─────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>6 estrategias para optimizar la carga fiscal de una donación</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Fraccionar entre varios años</strong>
              <p>
                La tarifa del ISD es progresiva: fraccionar una donación grande en varias más pequeñas
                en distintos ejercicios reduce la progresividad. Ojo: la acumulación opera en un
                período de 4 años para donaciones del mismo donante al mismo donatario, por lo que
                el fraccionamiento debe extenderse a periodos de más de 4 años para ser efectivo.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏛️</span>
              <strong>Verificar la CCAA del donatario antes de donar</strong>
              <p>
                La diferencia entre CCAA puede suponer miles de euros. Una donación de 100.000 €
                a un hijo puede costar ≈ 100 € en Madrid (99% bonificación) y más de
                8.000 € en Valencia (75% bonificación) o 17.000 € en Extremadura (0% bonificación).
                Planificar con 5+ años de antelación si se contempla un cambio de residencia real.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📜</span>
              <strong>Elevar a escritura pública aunque no sea obligatorio</strong>
              <p>
                Para donaciones de dinero superiores a 10.000 €, la escritura pública facilita
                la justificación ante Hacienda, activa la bonificación en Castilla-La Mancha,
                habilita la tarifa reducida en Cataluña (Grupos I y II), y es un respaldo
                indispensable en caso de inspección fiscal.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Tener en cuenta la acumulación de donaciones en 4 años</strong>
              <p>
                Si en los últimos 4 años has recibido otras donaciones del mismo donante, todas
                se suman para calcular la tarifa progresiva. Esto puede elevar significativamente
                la cuota de la donación actual. Declara siempre las donaciones anteriores del
                mismo donante en la autoliquidación del Modelo 651.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏢</span>
              <strong>Explorar la reducción del 95% en empresa familiar</strong>
              <p>
                El art. 20.6 LISD permite una reducción del 95% en donaciones de participaciones
                en empresa o negocio familiar si se cumplen los requisitos: actividad económica real,
                participación mínima del 5% individual o 15% familiar, funciones de dirección del
                donante con retribución superior al 50% de sus rendimientos del trabajo, y
                mantenimiento del donatario durante 10 años.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <strong>Conservar el justificante bancario del origen de los fondos</strong>
              <p>
                Hacienda puede requerir la acreditación del origen de los fondos donados para
                descartar blanqueo de capitales o simulación. El extracto bancario que muestre
                la transferencia del donante al donatario, junto con la escritura de donación o
                el documento privado, es la documentación mínima recomendada. Consérvala durante
                al menos 6 años (prescripción penal, si aplicase).
              </p>
            </div>

          </div>
        </section>

        {/* ── 6. Warning Box ───────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 errores frecuentes que pueden costarte caro</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No declarar en el plazo de 1 mes.</strong> El recargo va del 5% (hasta
                3 meses de retraso) al 20% (más de 12 meses), más intereses de demora al 4,0625%
                anual. Si hay requerimiento previo de Hacienda, la sanción mínima es el 50% de la
                cuota no ingresada.
              </li>
              <li>
                <strong>Confundir la CCAA competente.</strong> El impuesto se declara ante la CCAA
                de residencia del <em>donatario</em>, no del donante ni donde se firme la escritura.
                Presentar en la CCAA incorrecta puede generar un requerimiento y recargo.
              </li>
              <li>
                <strong>Ignorar la acumulación de donaciones en 4 años.</strong> Las donaciones
                recibidas del mismo donante en los 4 años anteriores elevan la base sobre la que
                se aplica la tarifa progresiva. No declararlas en el Modelo 651 es una infracción
                tributaria.
              </li>
              <li>
                <strong>Donar inmuebles sin escritura pública.</strong> Sin escritura, el donatario
                no puede inscribir el inmueble en el Registro de la Propiedad, lo que impide
                hipotecarlo o venderlo con normalidad. Además, en Cataluña pierde la tarifa reducida
                y en Castilla-La Mancha pierde la bonificación del 95%.
              </li>
              <li>
                <strong>Olvidar el Impuesto Municipal de Plusvalía (IIVTNU).</strong> Si se dona
                un inmueble urbano, el donatario también debe liquidar la plusvalía municipal ante
                el Ayuntamiento donde radica el bien, en el mismo plazo de 1 mes. El incumplimiento
                genera recargos e intereses adicionales.
              </li>
              <li>
                <strong>Tratar la donación como un &quot;regalo&quot; sin implicaciones fiscales.</strong>
                El donatario está obligado a declarar toda donación de valor económico, sea dinero,
                inmueble, vehículo, acciones o cualquier otro bien. La AEAT cruza datos bancarios,
                notariales y catastrales de forma sistemática.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-impuesto-donaciones')} />
      <ShareCard appName="estimador-impuesto-donaciones" />
      <Footer appName="estimador-impuesto-donaciones" />
    </div>
  );
}
