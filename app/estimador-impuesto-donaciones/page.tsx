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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-impuesto-donaciones')} />
      <ShareCard appName="estimador-impuesto-donaciones" />
      <Footer appName="estimador-impuesto-donaciones" />
    </div>
  );
}
