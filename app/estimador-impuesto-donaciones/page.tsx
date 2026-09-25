'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorDonaciones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, LegalNotice, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatDate, formatNumber, formatPercentage, parseISODateLocal, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_DONACIONES_META,
  BONIFICACIONES_CCAA_ID,
  INTERES_DEMORA_TRIBUTARIO_2025,
  PLAZO_AUTOLIQUIDACION_DONACIONES,
  ACUMULACION_DONACIONES_ANIOS,
  ACUMULACION_DONACIONES_A_SUCESION_ANIOS,
  type BonificacionCCAA_ID,
  type BonificacionGrupoID,
} from '@/data/fiscal';
import { ESCALA_RECARGO_EXTEMPORANEO } from '@/lib/calculadoras/recargoPresentacionTardia';
/*
  25/09/2026 — la app ya no repite la aritmética: usa el MISMO motor que el MCP de Delegum y el
  GPT. Las dos copias compartían el defecto del hallazgo 1862 (restar a una donación las
  reducciones mortis causa del art. 20.2.a LISD); lo que aparece en dos sitios va al motor.
*/
import {
  calcularDonacion,
  type GrupoParentesco,
  type NivelDiscapacidad,
  type IndicePatrimonio,
  type ResultadoDonaciones,
} from '@/lib/calculadoras/donaciones';

// ─── Parentesco ───────────────────────────────────────────────────────────────

/**
 * 'III-afinidad' solo existe en el formulario: yernos, nueras, suegros e hijastros son Grupo
 * III por el art. 20.2.a LISD («ascendientes y descendientes por afinidad»), y antes solo
 * cabían en «otro pariente», que es el Grupo IV (hallazgo 1871). Al motor le llega como 'III'.
 */
type OpcionParentesco = GrupoParentesco | 'III-afinidad';

const OPCIONES_PARENTESCO: ReadonlyArray<{ valor: OpcionParentesco; etiqueta: string }> = [
  { valor: 'I-conyuge', etiqueta: 'Cónyuge (Grupo II)' },
  { valor: 'I-descendiente', etiqueta: 'Hijo/a u otro descendiente menor de 21 años (Grupo I)' },
  { valor: 'II', etiqueta: 'Hijo/a u otro descendiente de 21 años o más (Grupo II)' },
  { valor: 'II-ascendiente', etiqueta: 'Padre, madre, abuelo/a (Grupo II)' },
  { valor: 'III', etiqueta: 'Hermano/a, tío/a, sobrino/a (Grupo III)' },
  { valor: 'III-afinidad', etiqueta: 'Yerno, nuera, suegro/a, hijastro/a — por afinidad (Grupo III)' },
  { valor: 'IV', etiqueta: 'Primo/a, pariente más lejano o sin parentesco (Grupo IV)' },
];

function grupoDelMotor(opcion: OpcionParentesco): GrupoParentesco {
  return opcion === 'III-afinidad' ? 'III' : opcion;
}

type TipoBien = 'inmueble' | 'otros';

// ─── Presentación ─────────────────────────────────────────────────────────────

/** 0,95 → «95 %»; 0,999 → «99,9 %» (espacio duro). */
function pctFraccion(fraccion: number): string {
  const valor = Math.round(fraccion * 1000) / 10;
  return formatPercentage(valor / 100, Number.isInteger(valor) ? 0 : 1);
}

function euros0(n: number): string {
  return `${formatNumber(n, 0)} €`;
}

/** Resumen de la bonificación de un grupo, sacado del módulo de datos (no escrito a mano). */
function describirBonificacion(b: BonificacionGrupoID | undefined): string {
  if (!b) return 'Sin bonificación';
  if (b.escalonado?.length) {
    return b.escalonado
      .map((t) => {
        if (t.desde === undefined && t.hasta !== undefined) return `${pctFraccion(t.porcentaje)} por debajo de ${euros0(t.hasta)}`;
        if (t.desde !== undefined && t.hasta !== undefined) return `${pctFraccion(t.porcentaje)} de ${euros0(t.desde)} a ${euros0(t.hasta)}`;
        return `${pctFraccion(t.porcentaje)} desde ${euros0(t.desde ?? 0)}`;
      })
      .join('; ');
  }
  if (b.exencion !== undefined) {
    return `Exención si la base no supera ${euros0(b.exencion)}; por encima, ${pctFraccion(b.porcentaje ?? 0)}`;
  }
  if (b.porcentaje && b.porcentaje > 0) return pctFraccion(b.porcentaje);
  return 'Sin bonificación';
}

function describirComunidad(clave: string, c: BonificacionCCAA_ID): { gruposIyII: string; grupoIII: string } {
  if (clave === 'cataluna') {
    return { gruposIyII: 'Tarifa propia (ver abajo)', grupoIII: 'Tarifa general propia' };
  }
  let gruposIyII = describirBonificacion(c.bonificaciones['II']);
  if (c.requiereEscritura) gruposIyII += ' · exige escritura pública';
  if (c.regimen === 'foral') gruposIyII += ' · régimen foral: estimación muy aproximada';
  return { gruposIyII, grupoIII: describirBonificacion(c.bonificaciones['III']) };
}

const FILAS_COMUNIDADES = Object.entries(BONIFICACIONES_CCAA_ID)
  .sort(([, a], [, b]) => a.nombre.localeCompare(b.nombre, 'es'))
  .map(([clave, c]) => ({ clave, nombre: c.nombre, ...describirComunidad(clave, c) }));

// Ejemplos del bloque educativo: los calcula el MISMO motor, para que el texto no pueda
// volver a contradecir a la calculadora (hallazgo 1868).
const EJ_MADRID_50K = calcularDonacion({ valorDonacion: 50000, ccaa: 'madrid', grupo: 'II' });
const EJ_PISO_CLM = calcularDonacion({ valorDonacion: 150000, ccaa: 'castilla-mancha', grupo: 'II', escrituraPublica: true });
const EJ_SOBRINO_CLM = calcularDonacion({ valorDonacion: 80000, ccaa: 'castilla-mancha', grupo: 'III' });
const EJ_HIJO_100K_MADRID = calcularDonacion({ valorDonacion: 100000, ccaa: 'madrid', grupo: 'II' });
const EJ_HIJO_100K_CLM_SIN_ESCRITURA = calcularDonacion({
  valorDonacion: 100000, ccaa: 'castilla-mancha', grupo: 'II', escrituraPublica: false,
});

const FECHA_VERIFICADO = formatDate(parseISODateLocal(FISCAL_DONACIONES_META.verificado));
const R = ESCALA_RECARGO_EXTEMPORANEO;
const PLAZO = `${PLAZO_AUTOLIQUIDACION_DONACIONES.diasHabiles} días hábiles`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorImpuestoDonacionesPage() {
  const [tipoBien, setTipoBien] = useState<TipoBien>('otros');
  const [ccaa, setCcaa] = useState('');
  const [valorDonacion, setValorDonacion] = useState('');
  const [cargas, setCargas] = useState('');
  const [escrituraPublica, setEscrituraPublica] = useState(true);
  const [parentesco, setParentesco] = useState<OpcionParentesco | ''>('');
  const [patrimonioIdx, setPatrimonioIdx] = useState('1');
  const [discapacidad, setDiscapacidad] = useState<NivelDiscapacidad>('0');

  const ccaaInfo = useMemo(() => (ccaa ? BONIFICACIONES_CCAA_ID[ccaa] : null), [ccaa]);

  /*
    Validación de los importes. Hasta el 25/09/2026 unas cargas NEGATIVAS se restaban con su
    signo y AUMENTABAN la base, y unas ilegibles se convertían en 0 en silencio (hallazgo 1879,
    la forma de los 740 y 742 de la hermana de sucesiones). Ahora las dos se nombran y el panel
    no da ninguna cifra mientras sigan así.
  */
  const entrada = useMemo(() => {
    const errores: string[] = [];
    const valor = valorDonacion.trim() === '' ? null : parseSpanishNumber(valorDonacion);
    if (valor !== null && !Number.isFinite(valor)) {
      errores.push('El valor del bien donado no es un número válido. Escríbelo como 60000 o 60.000,50.');
    } else if (valor !== null && valor < 0) {
      errores.push('El valor del bien donado no puede ser negativo.');
    }
    const cargasNum = cargas.trim() === '' ? 0 : parseSpanishNumber(cargas);
    if (!Number.isFinite(cargasNum)) {
      errores.push('Las cargas no son un número válido. Escríbelas como 12000 o 12.000,50, o deja el campo vacío si no hay.');
    } else if (cargasNum < 0) {
      errores.push('Las cargas no pueden ser negativas: son deudas que asume quien recibe y se restan del valor del bien.');
    }
    return { valor, cargasNum, errores };
  }, [valorDonacion, cargas]);

  const resultado = useMemo((): ResultadoDonaciones | null => {
    if (entrada.errores.length > 0 || !ccaa || !parentesco) return null;
    if (entrada.valor === null || entrada.valor <= 0) return null;
    try {
      return calcularDonacion({
        valorDonacion: entrada.valor,
        ccaa,
        grupo: grupoDelMotor(parentesco),
        cargas: entrada.cargasNum,
        escrituraPublica,
        discapacidad,
        patrimonioIdx: Number(patrimonioIdx) as IndicePatrimonio,
      });
    } catch {
      return null;
    }
  }, [entrada, ccaa, parentesco, escrituraPublica, discapacidad, patrimonioIdx]);

  const etiquetaCcaa = tipoBien === 'inmueble'
    ? 'Comunidad donde está situado el inmueble *'
    : 'Comunidad de residencia habitual de quien recibe *';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎁</span> Estimador del Impuesto de Donaciones</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el ISD al recibir una donación en las 17 comunidades autónomas
        </p>
        <p className={styles.metaVerificado}>
          Datos verificados: {FECHA_VERIFICADO} — Fuente:{' '}
          <a href={FISCAL_DONACIONES_META.urlOficial} target="_blank" rel="noopener noreferrer" className={styles.linkFuente}>
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
        normativa={`Impuesto de Donaciones — ${FISCAL_DONACIONES_META.vigencia}`}
        fuente={FISCAL_DONACIONES_META.fuente}
        verificado={FISCAL_DONACIONES_META.verificado}
        urlOficial={FISCAL_DONACIONES_META.urlOficial}
      />

      {/* Disclaimer SIEMPRE VISIBLE */}
      <div className={styles.disclaimerCritico}>
        <h2 className={styles.disclaimerTitulo}><span aria-hidden="true">⚠️</span> Aviso Legal Imprescindible</h2>
        <p>
          Esta herramienta es <strong>exclusivamente orientativa</strong>. Los resultados son estimaciones
          y <strong>no tienen validez fiscal ni jurídica</strong>.
        </p>
        <ul>
          <li>El impuesto lo paga quien <strong>recibe</strong> la donación (donatario), no quien la hace</li>
          <li>
            CCAA competente: si se dona un <strong>inmueble</strong>, la comunidad donde está situado
            (art. 32.2.b Ley 22/2009); en el resto de bienes (dinero, acciones, vehículos…), la de
            residencia habitual del donatario, que es donde más días ha pasado en los 5 años anteriores
            (arts. 32.2.c y 28 Ley 22/2009)
          </li>
          <li>
            Las donaciones del mismo donante al mismo donatario en los {ACUMULACION_DONACIONES_ANIOS} años
            anteriores se acumulan y elevan la cuota (art. 30.1 LISD): esta estimación no las incluye
          </li>
          <li>
            No aplica las reducciones propias que algunas comunidades regulan para donaciones (por ejemplo,
            de dinero para comprar la vivienda habitual), ni las de empresa familiar o explotaciones agrarias
          </li>
          <li>Castilla-La Mancha: sus bonificaciones en donaciones exigen escritura pública (art. 18.3 Ley 8/2013)</li>
          <li>
            <strong>
              Plazo general: {PLAZO} desde el día siguiente a la donación ({PLAZO_AUTOLIQUIDACION_DONACIONES.norma}),
              salvo que la comunidad fije otro (Modelo 651). Consulta siempre con asesor fiscal.
            </strong>
          </li>
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
            <h2 className={styles.seccionTitulo}><span aria-hidden="true">🏛️</span> Comunidad Autónoma competente</h2>

            <fieldset className={styles.fieldset}>
              <legend className={styles.label}>¿Qué se dona?</legend>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" name="tipo-bien" value="otros" checked={tipoBien === 'otros'}
                    onChange={() => setTipoBien('otros')} />
                  Dinero u otros bienes
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="tipo-bien" value="inmueble" checked={tipoBien === 'inmueble'}
                    onChange={() => setTipoBien('inmueble')} />
                  Un inmueble (piso, casa, local, finca…)
                </label>
              </div>
            </fieldset>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="ccaa-donacion">{etiquetaCcaa}</label>
              <select id="ccaa-donacion" className={styles.select} value={ccaa} onChange={(e) => setCcaa(e.target.value)}
                aria-describedby="ccaa-donacion-ayuda">
                <option value="">— Selecciona comunidad —</option>
                <optgroup label="Régimen común (15 comunidades)">
                  <option value="andalucia">Andalucía</option>
                  <option value="aragon">Aragón</option>
                  <option value="asturias">Asturias</option>
                  <option value="canarias">Canarias</option>
                  <option value="cantabria">Cantabria</option>
                  <option value="castilla-leon">Castilla y León</option>
                  <option value="castilla-mancha">Castilla-La Mancha</option>
                  <option value="cataluna">Cataluña</option>
                  <option value="valencia">Comunitat Valenciana</option>
                  <option value="madrid">Comunidad de Madrid</option>
                  <option value="extremadura">Extremadura</option>
                  <option value="galicia">Galicia</option>
                  <option value="baleares">Islas Baleares</option>
                  <option value="rioja">La Rioja</option>
                  <option value="murcia">Región de Murcia</option>
                </optgroup>
                <optgroup label="Régimen foral">
                  <option value="pais-vasco">País Vasco</option>
                  <option value="navarra">Navarra</option>
                </optgroup>
              </select>
              <span id="ccaa-donacion-ayuda" className={styles.helper}>
                {tipoBien === 'inmueble'
                  ? 'Un inmueble tributa en la comunidad donde está, viva donde viva quien lo recibe (art. 32.2.b Ley 22/2009).'
                  : 'La de más días en los 5 años anteriores a la donación (art. 28 Ley 22/2009), no la del donante ni la de la notaría.'}
              </span>
            </div>

            {ccaaInfo?.regimen === 'foral' && (
              <div className={styles.alertaForal}>
                <strong><span aria-hidden="true">⚠️</span> Régimen Foral — Estimación Muy Aproximada</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}

            {ccaa === 'castilla-mancha' && (
              <div className={styles.alertaEscritura}>
                <strong><span aria-hidden="true">📜</span> Castilla-La Mancha</strong>
                <p>
                  Sus bonificaciones en donaciones exigen escritura pública en la que conste el origen de
                  los bienes (art. 18.3 Ley 8/2013). Sin ella, se tributa sin bonificación.
                </p>
              </div>
            )}

            {ccaaInfo && ccaaInfo.regimen !== 'foral' && (
              <div className={styles.infoCcaa}>
                <strong><span aria-hidden="true">ℹ️</span> {ccaaInfo.nombre}</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}
          </div>

          {/* Donación */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}><span aria-hidden="true">💰</span> Bien Donado</h2>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="valor-donacion">Valor del bien donado *</label>
              <div className={styles.inputConUnidad}>
                <input id="valor-donacion" type="text" className={styles.input} value={valorDonacion}
                  onChange={(e) => setValorDonacion(e.target.value)}
                  placeholder="0,00" inputMode="decimal" aria-describedby="valor-donacion-ayuda" />
                <span className={styles.unidad}>€</span>
              </div>
              <span id="valor-donacion-ayuda" className={styles.helper}>
                Dinero, acciones, vehículo… Un inmueble se valora por su valor de referencia del Catastro,
                o por el declarado si es mayor (art. 9.3 LISD).
              </span>
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="cargas-donacion">Cargas o deudas que asume el donatario</label>
              <div className={styles.inputConUnidad}>
                <input id="cargas-donacion" type="text" className={styles.input} value={cargas}
                  onChange={(e) => setCargas(e.target.value)}
                  placeholder="0,00" inputMode="decimal" aria-describedby="cargas-donacion-ayuda"
                  aria-invalid={entrada.errores.some((e) => e.startsWith('Las cargas'))} />
                <span className={styles.unidad}>€</span>
              </div>
              <span id="cargas-donacion-ayuda" className={styles.helper}>Ej: hipoteca que asume quien recibe el inmueble</span>
            </div>

            <fieldset className={`${styles.campo} ${styles.fieldset}`} aria-describedby="escritura-ayuda">
              <legend className={styles.label}>¿Se formalizará en escritura pública?</legend>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" name="escritura" value="si" checked={escrituraPublica} onChange={() => setEscrituraPublica(true)} />
                  Sí
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="escritura" value="no" checked={!escrituraPublica} onChange={() => setEscrituraPublica(false)} />
                  No
                </label>
              </div>
              <span id="escritura-ayuda" className={styles.helper}>
                Obligatoria para inmuebles (art. 633 del Código Civil). Necesaria en Cataluña (tarifa reducida)
                y en Castilla-La Mancha (bonificaciones)
              </span>
            </fieldset>
          </div>

          {/* Datos del donatario */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}><span aria-hidden="true">👤</span> Datos de Quien Recibe</h2>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="parentesco-donacion">Parentesco con el donante *</label>
              <select id="parentesco-donacion" className={styles.select} value={parentesco}
                onChange={(e) => setParentesco(e.target.value as OpcionParentesco)}
                aria-describedby="parentesco-donacion-ayuda">
                <option value="">— Selecciona —</option>
                {OPCIONES_PARENTESCO.map((o) => (
                  <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                ))}
              </select>
              <span id="parentesco-donacion-ayuda" className={styles.helper}>
                Los adoptados cuentan como descendientes. La pareja de hecho se equipara al cónyuge solo
                donde la ley de la comunidad lo prevé, y con sus requisitos.
              </span>
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="patrimonio-donacion">Patrimonio preexistente del donatario</label>
              <select id="patrimonio-donacion" className={styles.select} value={patrimonioIdx}
                onChange={(e) => setPatrimonioIdx(e.target.value)}>
                <option value="1">Hasta 402.678,11 €</option>
                <option value="2">De 402.678,11 € a 2.007.380,43 €</option>
                <option value="3">De 2.007.380,43 € a 4.020.770,98 €</option>
                <option value="4">Más de 4.020.770,98 €</option>
              </select>
            </div>

            <fieldset className={`${styles.campo} ${styles.fieldset}`}>
              <legend className={styles.label}>Discapacidad reconocida de quien recibe</legend>
              <div className={styles.radioGroup}>
                {([['0', 'No'], ['33', 'Del 33 % al 64 %'], ['65', '65 % o más']] as const).map(([v, l]) => (
                  <label key={v} className={styles.radioLabel}>
                    <input type="radio" name="discapacidad" value={v} checked={discapacidad === v}
                      onChange={() => setDiscapacidad(v)} />
                    {l}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* ── Panel de resultados ──────────────────────────────────── */}
        <div className={styles.resultsPanel}>
          {entrada.errores.length > 0 ? (
            <div className={styles.placeholder} role="alert">
              <p><span aria-hidden="true">⚠️</span> No se puede estimar el impuesto con estos datos:</p>
              <ul className={styles.listaErrores}>
                {entrada.errores.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          ) : !resultado ? (
            <div className={styles.placeholder}>
              <p><span aria-hidden="true">📝</span> Selecciona la comunidad y el parentesco, e introduce el valor de la donación para ver la estimación</p>
            </div>
          ) : (
            <>
              {resultado.esForal && (
                <div className={styles.alertaForal}>
                  <strong><span aria-hidden="true">⚠️</span> Régimen Foral — Estimación muy aproximada</strong>
                  <p>Consulta obligatoria con asesor fiscal del territorio foral.</p>
                </div>
              )}

              {/* Resultado destacado */}
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Impuesto estimado en {resultado.ccaaNombre}</span>
                <span className={styles.resultadoValor}>{formatCurrency(resultado.cuotaFinal)}</span>
                {resultado.porcentajeBonificacion > 0 && (
                  <span className={styles.resultadoNota}>
                    Bonificación autonómica: {formatPercentage(resultado.porcentajeBonificacion / 100, 1)}
                  </span>
                )}
                <span className={styles.resultadoTipoEfectivo}>
                  Tipo efectivo sobre donación: {formatPercentage(resultado.tipoEfectivo / 100, 2)}
                </span>
              </div>

              {/* Tarifa aplicada */}
              <div className={styles.infoTarifa}>
                <span><span aria-hidden="true">📊</span> Tarifa: {resultado.tarifaAplicada}</span>
              </div>

              {/* Desglose */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Base</h3>
                <div className={styles.linea}><span>Valor del bien donado</span><span>{formatCurrency(resultado.baseImponible)}</span></div>
                {resultado.cargas > 0 && (
                  <div className={styles.linea}><span className={styles.lineaBonif}>– Cargas deducibles</span><span className={styles.lineaBonif}>{formatCurrency(resultado.cargas)}</span></div>
                )}
                <div className={`${styles.linea} ${styles.lineaTotal}`}>
                  <span>Base imponible = base liquidable</span><span>{formatCurrency(resultado.baseLiquidable)}</span>
                </div>
                <p className={styles.notaDesglose}>
                  En una donación no se restan las reducciones estatales por parentesco ni por discapacidad,
                  que son de las herencias (art. 20.5 LISD).
                </p>
              </div>

              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Liquidación</h3>
                <div className={styles.linea}><span>Cuota íntegra</span><span>{formatCurrency(resultado.cuotaIntegra)}</span></div>
                <div className={styles.linea}><span>× Coeficiente multiplicador</span><span>×{formatNumber(resultado.coeficienteMultiplicador, 4)}</span></div>
                <div className={styles.linea}><span>Cuota tributaria</span><span>{formatCurrency(resultado.cuotaTributaria)}</span></div>
                {resultado.bonificaciones.map((b) => (
                  <div key={b.concepto} className={styles.linea}>
                    <span className={styles.lineaBonif}>– {b.concepto}</span>
                    <span className={styles.lineaBonif}>{formatCurrency(b.importe)}</span>
                  </div>
                ))}
                {resultado.bonificaciones.length === 0 && (
                  <div className={styles.linea}><span>{resultado.detalleBonificacion}</span><span>{formatCurrency(0)}</span></div>
                )}
                <div className={`${styles.linea} ${styles.lineaTotal} ${styles.lineaFinal}`}>
                  <span>CUOTA A INGRESAR (estimada)</span>
                  <span>{formatCurrency(resultado.cuotaFinal)}</span>
                </div>
              </div>

              {discapacidad !== '0' && !ccaaInfo?.bonificacionDiscapacidad && (
                <p className={styles.notaDesglose}>
                  Esta estimación no aplica beneficios por discapacidad en {resultado.ccaaNombre}: las
                  reducciones estatales por discapacidad son solo de las herencias, y las que la comunidad
                  pueda regular para donaciones no están incluidas. La cuota real puede ser menor.
                </p>
              )}
              {tipoBien === 'inmueble' && !escrituraPublica && (
                <p className={styles.notaDesglose}>
                  La donación de un inmueble exige escritura pública para ser válida (art. 633 del Código Civil).
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender el Impuesto de Donaciones?"
        subtitle="Guía completa con bonificaciones por comunidad autónoma"
      >
        <section className={styles.guideSection}>
          <h2>El Impuesto de Donaciones en España</h2>
          <p>
            El Impuesto de Donaciones forma parte del Impuesto sobre Sucesiones y Donaciones (ISD).
            Grava las adquisiciones a título gratuito entre personas vivas. Está cedido a las CCAA,
            que aplican bonificaciones muy dispares.
          </p>

          <h3>Bonificación de cada comunidad</h3>
          <p>
            Porcentaje de la cuota que bonifica cada comunidad en donaciones, según los datos que usa
            esta calculadora. Los Grupos I y II son descendientes, cónyuge y ascendientes; el Grupo III,
            hermanos, tíos, sobrinos y parientes por afinidad.
          </p>
          <div className={styles.tablaCcaa}>
            <table>
              <thead>
                <tr><th scope="col">Comunidad</th><th scope="col">Grupos I y II</th><th scope="col">Grupo III</th></tr>
              </thead>
              <tbody>
                {FILAS_COMUNIDADES.map((f) => (
                  <tr key={f.clave}><td>{f.nombre}</td><td>{f.gruposIyII}</td><td>{f.grupoIII}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Cataluña: tarifa especial</h3>
          <p>
            Cataluña distingue dos tarifas. Si el donatario pertenece al Grupo I o II y la donación
            se formaliza en escritura pública, aplica una tarifa reducida del 5&nbsp;% al 9&nbsp;%.
            En caso contrario, la tarifa general va del 7&nbsp;% al 32&nbsp;%.
          </p>

          <h3>Preguntas frecuentes</h3>
          <details className={styles.faq}>
            <summary>¿Quién paga el impuesto?</summary>
            <p>
              El donatario (quien recibe), no el donante. Si se dona un inmueble, se declara en la comunidad
              donde está situado; si se dona dinero u otros bienes, en la de residencia habitual del donatario.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>¿Es necesaria escritura pública?</summary>
            <p>Obligatoria para inmuebles. Para dinero no lo es legalmente, pero en Castilla-La Mancha se necesita para las bonificaciones, y en Cataluña para acceder a la tarifa reducida.</p>
          </details>
          <details className={styles.faq}>
            <summary>¿Cuál es el plazo para declarar?</summary>
            <p>
              El general es de {PLAZO} desde el día siguiente a la donación ({PLAZO_AUTOLIQUIDACION_DONACIONES.norma}),
              salvo que la comunidad fije otro. Modelo 651, ante la administración tributaria de la comunidad competente.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>¿Puedo cambiar de CCAA para pagar menos?</summary>
            <p>
              En dinero y bienes que no son inmuebles, el impuesto corresponde a la comunidad de residencia
              habitual del donatario; en un inmueble, a la comunidad donde está, y la residencia no cuenta.
              Cambiar de residencia únicamente para tributar menos puede considerarse fraude fiscal.
            </p>
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
                  <td>{PLAZO} (salvo plazo propio de la comunidad)</td>
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
                  <td><strong>Reducciones estatales por parentesco</strong></td>
                  <td>No (art. 20.5 LISD); solo las que regule la comunidad</td>
                  <td>Sí (art. 20.2.a LISD), o las de la comunidad</td>
                  <td>No aplica</td>
                </tr>
                <tr>
                  <td><strong>Bonificaciones autonómicas</strong></td>
                  <td>Dependen de la comunidad (ver la tabla de arriba)</td>
                  <td>Dependen de la comunidad, y pueden ser distintas de las de donaciones</td>
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
          <p>Las cifras de estos casos las calcula la misma calculadora de arriba.</p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💶</span>
                <strong>Padre dona 50.000 € en efectivo a su hijo de 30 años, que vive en Madrid</strong>
              </div>
              <p className={styles.escenarioExample}>
                Base imponible: {formatCurrency(EJ_MADRID_50K.baseLiquidable)} (en una donación no hay
                reducción estatal por parentesco). Cuota íntegra (tarifa estatal):{' '}
                {formatCurrency(EJ_MADRID_50K.cuotaIntegra)}. Coeficiente del Grupo II:{' '}
                {formatNumber(EJ_MADRID_50K.coeficienteMultiplicador, 4)}. Bonificación de la Comunidad de Madrid
                del {formatPercentage(EJ_MADRID_50K.porcentajeBonificacion / 100, 0)}:{' '}
                {formatCurrency(EJ_MADRID_50K.bonificacionCcaa)}.
                <strong> Cuota final: {formatCurrency(EJ_MADRID_50K.cuotaFinal)}.</strong>
              </p>
              <p className={styles.escenarioTip}>
                Aunque la cuota sea pequeña, hay que presentar la autoliquidación. Conviene hacer la entrega
                por transferencia y documentarla, para poder acreditar el origen de los fondos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Madre que vive en Madrid dona a su hija un piso de 150.000 € situado en Toledo</strong>
              </div>
              <p className={styles.escenarioExample}>
                El piso está en Castilla-La Mancha, así que tributa allí, viva donde viva la hija
                (art. 32.2.b Ley 22/2009). Base imponible: {formatCurrency(EJ_PISO_CLM.baseLiquidable)}.
                Cuota íntegra: {formatCurrency(EJ_PISO_CLM.cuotaIntegra)}. Con una base de 120.000 € o
                más, la bonificación de Castilla-La Mancha para el Grupo II es del{' '}
                {formatPercentage(EJ_PISO_CLM.porcentajeBonificacion / 100, 0)} (art. 17 bis.1 Ley 8/2013):{' '}
                {formatCurrency(EJ_PISO_CLM.bonificacionCcaa)}.
                <strong> Cuota final: {formatCurrency(EJ_PISO_CLM.cuotaFinal)}.</strong> Además, la hija
                pagará la plusvalía municipal del inmueble urbano (IIVTNU).
              </p>
              <p className={styles.escenarioTip}>
                La bonificación exige escritura pública y conservar el piso cinco años (art. 18.3 Ley 8/2013).
                Si en vez del piso la madre donara dinero, mandaría la residencia de la hija (art. 32.2.c).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <strong>Padres donan su negocio familiar a un hijo</strong>
              </div>
              {/*
                25/09/2026 — la empresa familiar queda FUERA de esta estimación por criterio: la
                reducción depende de valorar la empresa y de requisitos que solo comprueba un
                asesor. Este escenario daba una cuota de «≈ 750 €» con la reducción aplicada,
                una cifra de algo que la calculadora no hace. Se deja el caso, sin cifra.
              */}
              <p className={styles.escenarioExample}>
                <strong>Esta herramienta no calcula este caso.</strong> La donación de una
                empresa individual, un negocio profesional o participaciones en una empresa
                familiar tiene reducciones propias, estatales (art. 20.6 LISD) y autonómicas,
                que pueden cambiar la cuota por completo. Aplicarlas exige valorar la empresa y
                comprobar requisitos sobre la actividad, la participación del donante y la
                permanencia posterior del negocio.
              </p>
              <p className={styles.escenarioTip}>
                Si lo que se dona es una empresa, la cifra de la calculadora no sirve como
                referencia: la valoración y la comprobación de requisitos corresponden a un
                asesor fiscal con la documentación del negocio.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌾</span>
                <strong>Tío dona finca rústica de 80.000 € a sobrino (Grupo III)</strong>
              </div>
              <p className={styles.escenarioExample}>
                La finca está en Castilla-La Mancha. Base imponible: {formatCurrency(EJ_SOBRINO_CLM.baseLiquidable)}.
                Cuota íntegra (tarifa estatal): {formatCurrency(EJ_SOBRINO_CLM.cuotaIntegra)}. Coeficiente
                multiplicador del Grupo III (patrimonio hasta 402.678,11 €):{' '}
                {formatNumber(EJ_SOBRINO_CLM.coeficienteMultiplicador, 4)}. Cuota tributaria:{' '}
                {formatCurrency(EJ_SOBRINO_CLM.cuotaTributaria)}. Castilla-La Mancha no bonifica al Grupo III.
                <strong> Cuota final: ≈ {formatNumber(EJ_SOBRINO_CLM.cuotaFinal, 0)} €</strong>{' '}
                ({formatPercentage(EJ_SOBRINO_CLM.tipoEfectivo / 100, 2)} de tipo efectivo).
              </p>
              <p className={styles.escenarioTip}>
                En el Grupo III, la tarifa progresiva se multiplica por un coeficiente de 1,5882 o más, así
                que el tipo efectivo crece con el importe. Pocas comunidades bonifican a este grupo: la tabla
                de arriba muestra cuáles.
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
                  Hay que declararlo siempre, aunque la cuota pueda ser pequeña. Cuánto se paga depende de
                  la bonificación de la comunidad donde reside quien recibe el dinero (la tabla de arriba
                  recoge la de cada una). En Cataluña, los Grupos I y II con escritura pública tributan con
                  una tarifa reducida que empieza en el 5&nbsp;%. La obligación de declarar (Modelo 651)
                  existe siempre, incluso si la cuota resultante es cero.
                </p>
                <p className={styles.faqTip}>Plazo general: {PLAZO} desde el día siguiente a la donación.</p>
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
                  los fondos ante Hacienda. (2) En Castilla-La Mancha, las bonificaciones están
                  condicionadas a la escritura pública (art. 18.3 Ley 8/2013). (3) Para inmuebles, sí es
                  obligatoria (art. 633 Código Civil) y además necesaria para inscribir en el
                  Registro de la Propiedad. (4) En Cataluña, la tarifa reducida (del 5&nbsp;% al 9&nbsp;%)
                  para los Grupos I y II requiere escritura.
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Puedo hacer donaciones a mis hijos cada año sin tributar?</summary>
                <p>
                  Las donaciones del mismo donante al mismo donatario hechas dentro de un plazo de
                  <strong> {ACUMULACION_DONACIONES_ANIOS} años</strong> se consideran una sola transmisión
                  (art. 30.1 LISD). Si donas 50.000 € este año y otros 50.000 € el que viene, la segunda
                  donación tributa al tipo medio que corresponde a la suma de las dos (100.000 €), aplicado
                  a sus 50.000 €. No existe un mínimo exento anual en el ISD estatal. Y si el donante
                  fallece en los {ACUMULACION_DONACIONES_A_SUCESION_ANIOS} años siguientes a una donación,
                  esta se acumula a la herencia (art. 30.2 LISD). Con una bonificación alta la acumulación
                  pesa poco; con una baja o sin bonificación, puede subir bastante la cuota.
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Cómo tributa la donación de la vivienda habitual?</summary>
                <p>
                  El donatario paga el ISD en la comunidad donde está la vivienda, sobre su valor de
                  referencia del Catastro (o el declarado, si es mayor: art. 9.3 LISD). Además, el donatario
                  asume el pago de la
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
                  fuera de plazo <strong>voluntariamente</strong>: recargo del{' '}
                  {R.porcentajeBase}&nbsp;% más otro{' '}
                  {R.porcentajePorMes}&nbsp;% por cada mes completo de retraso, y{' '}
                  {R.porcentajeMas12Meses}&nbsp;% más intereses de demora una vez
                  transcurridos {R.mesesEscalaProporcional} meses
                  ({R.baseNormativa}).
                  Si hay requerimiento previo de Hacienda, se aplica una <strong>sanción del 50&nbsp;% al 150&nbsp;%</strong>{' '}
                  de la cuota no ingresada, más intereses de demora (actualmente{' '}
                  {formatNumber(INTERES_DEMORA_TRIBUTARIO_2025.tipo, 4)}&nbsp;% anual).
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Puedo cambiarme de CCAA para pagar menos impuesto?</summary>
                <p>
                  Solo cuenta en el dinero y los bienes que no son inmuebles: ahí la comunidad competente es
                  la de residencia habitual del donatario, la de más días en los 5 años anteriores
                  (art. 28 Ley 22/2009). Un inmueble tributa siempre donde está, y cambiar de residencia no
                  lo altera. Un traslado de residencia <em>real y efectivo</em> puede ser legítimo. Sin embargo,
                  un cambio de empadronamiento ficticio o sin residencia efectiva puede ser detectado por Hacienda
                  (mediante análisis de consumo eléctrico, matrículas de vehículos, escolarización
                  de hijos, etc.) y tipificarse como <strong>fraude fiscal</strong>, con sanciones
                  que incluyen multa del 50&nbsp;% al 150&nbsp;% más intereses, e incluso responsabilidad penal
                  si la cuota defraudada supera los 120.000 €.
                </p>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details className={styles.faq}>
                <summary>¿Cuánto tiempo tengo para declarar una donación?</summary>
                <p>
                  El plazo general es de <strong>{PLAZO}</strong>, a contar desde el día siguiente a la
                  donación ({PLAZO_AUTOLIQUIDACION_DONACIONES.norma}); algunas comunidades fijan un plazo
                  propio. Se presenta el <strong>Modelo 651</strong> ante la administración tributaria de la
                  comunidad competente. No existe prórroga automática (a diferencia de sucesiones, que
                  permite 6 meses prorrogables). Si la donación es de un inmueble urbano, la plusvalía
                  municipal (IIVTNU) se declara ante el Ayuntamiento donde está, también en 30 días hábiles
                  (art. 110.2.a del texto refundido de la Ley reguladora de las Haciendas Locales).
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
                  Para <strong>dinero o bienes muebles</strong>:
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
                  Si se dona un <strong>inmueble</strong>, la comunidad donde está situado (art. 32.2.b
                  Ley 22/2009). En el <strong>resto de bienes</strong>, la de residencia habitual del
                  donatario: aquella en la que haya pasado más días de los 5 años anteriores a la donación
                  (arts. 32.2.c y 28.1.1.º.b). Nunca la del donante ni la de la notaría. Si en un mismo
                  documento se donan bienes que tributan en comunidades distintas, cada una aplica a su parte
                  el tipo medio que correspondería al total (art. 32.3).
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Determinar el grupo de parentesco</strong>
                <p>
                  Grupo I: descendientes y adoptados menores de 21 años.
                  Grupo II: descendientes y adoptados de 21 años o más, cónyuge, ascendientes y adoptantes.
                  Grupo III: hermanos, tíos y sobrinos, y ascendientes y descendientes por afinidad
                  (suegros, yernos, nueras, hijastros).
                  Grupo IV: primos, parientes más lejanos y extraños (art. 20.2.a LISD).
                  En las donaciones no se aplican las reducciones estatales por parentesco ni por
                  discapacidad, que son de las herencias; solo las que regule cada comunidad.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcular la base y aplicar la tarifa estatal</strong>
                <p>
                  Base imponible = valor del bien donado − cargas deducibles (art. 9.1.b LISD).
                  Base liquidable = base imponible, salvo reducciones propias de la comunidad (art. 20.5).
                  La tarifa estatal (16 tramos, del 7,65&nbsp;% al 34&nbsp;%) se aplica sobre la base liquidable
                  para obtener la cuota íntegra, que se multiplica por el coeficiente según el patrimonio
                  preexistente (art. 22.2): de 1,0000 a 1,2000 en los Grupos I y II, de 1,5882 a 1,9059 en
                  el Grupo III y de 2,0000 a 2,4000 en el Grupo IV.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Aplicar bonificaciones autonómicas</strong>
                <p>
                  Sobre la cuota tributaria (cuota íntegra × coeficiente), cada comunidad aplica sus
                  propias bonificaciones, muy distintas entre sí: la tabla del principio de esta guía
                  recoge la de cada una, y la calculadora la aplica al seleccionar la comunidad.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Autoliquidar en plazo — Modelo 651</strong>
                <p>
                  Presentar el <strong>Modelo 651</strong> ante la administración tributaria de la comunidad
                  competente, dentro del plazo general de <strong>{PLAZO}</strong> desde el día siguiente a la
                  donación, salvo que la comunidad fije otro. Si hay inmueble urbano, presentar también la
                  plusvalía municipal (IIVTNU) ante el Ayuntamiento, en 30 días hábiles. Conservar toda la
                  documentación (escritura, justificante bancario, acuse de recibo de la autoliquidación)
                  por prescripción de 4 años.
                </p>
              </div>
            </li>

          </ol>
        </section>

        {/* ── 5. Mejores Prácticas ─────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>6 buenas prácticas al planificar y declarar una donación</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Fraccionar entre varios años</strong>
              <p>
                La tarifa del ISD es progresiva: fraccionar una donación grande en varias más pequeñas
                reduce la progresividad solo si entre ellas pasan más de {ACUMULACION_DONACIONES_ANIOS} años,
                porque las del mismo donante al mismo donatario dentro de ese plazo se acumulan (art. 30.1 LISD).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <strong>Verificar la CCAA competente antes de donar</strong>
              <p>
                La diferencia entre comunidades puede suponer miles de euros. Con 100.000 € de un padre a
                un hijo, la tarifa estatal da una cuota de {formatCurrency(EJ_HIJO_100K_MADRID.cuotaTributaria)};
                con la bonificación del {formatPercentage(EJ_HIJO_100K_MADRID.porcentajeBonificacion / 100, 0)} de
                la Comunidad de Madrid quedan {formatCurrency(EJ_HIJO_100K_MADRID.cuotaFinal)}, y en
                Castilla-La Mancha sin escritura pública, que pierde la bonificación, la cuota entera:{' '}
                {formatCurrency(EJ_HIJO_100K_CLM_SIN_ESCRITURA.cuotaFinal)}.
                Solo procede planificar un cambio de residencia si responde a un proyecto vital real y duradero; el traslado meramente fiscal es perseguido como fraude.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📜</span>
              <strong>Elevar a escritura pública aunque no sea obligatorio</strong>
              <p>
                Para donaciones de dinero superiores a 10.000 €, la escritura pública facilita
                la justificación ante Hacienda, activa las bonificaciones en Castilla-La Mancha,
                habilita la tarifa reducida en Cataluña (Grupos I y II), y es un respaldo
                indispensable en caso de inspección fiscal.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Tener en cuenta la acumulación de donaciones en {ACUMULACION_DONACIONES_ANIOS} años</strong>
              <p>
                Si en los {ACUMULACION_DONACIONES_ANIOS} años anteriores has recibido otras donaciones del mismo
                donante, se consideran una sola transmisión para calcular el tipo (art. 30.1 LISD). Esto
                puede elevar significativamente la cuota de la donación actual. Declara siempre las
                donaciones anteriores del mismo donante en la autoliquidación del Modelo 651.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏢</span>
              <strong>Si se dona una empresa, consultar antes con un asesor fiscal</strong>
              <p>
                La donación de una empresa o de participaciones en un negocio familiar tiene
                reducciones especiales que esta herramienta no calcula. Dependen de cómo se valore
                la empresa y de requisitos que solo se pueden comprobar con su documentación, y
                se pierden si no se cumplen: conviene revisarlos con un asesor fiscal antes de
                formalizar la donación.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏦</span>
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
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores frecuentes que pueden costarte caro</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                {/*
                  25/09/2026 (hallazgo 1866): aquí seguía la escala de recargos DEROGADA en 2021
                  («del 5 % hasta 3 meses al 20 %») y un interés de demora escrito a mano. Ahora se
                  compone, como la FAQ, desde ESCALA_RECARGO_EXTEMPORANEO y data/fiscal.
                */}
                <strong>No declarar en plazo.</strong> Si se presenta tarde pero sin requerimiento de
                Hacienda, el recargo es del {R.porcentajeBase}&nbsp;% más un {R.porcentajePorMes}&nbsp;% por cada
                mes completo de retraso, y del {R.porcentajeMas12Meses}&nbsp;% más intereses de demora
                ({formatNumber(INTERES_DEMORA_TRIBUTARIO_2025.tipo, 4)}&nbsp;% anual) pasados{' '}
                {R.mesesEscalaProporcional} meses ({R.baseNormativa}). Si hay requerimiento previo, la
                sanción mínima es el 50&nbsp;% de la cuota no ingresada.
              </li>
              <li>
                <strong>Confundir la CCAA competente.</strong> Un inmueble se declara en la comunidad donde
                está; el resto de bienes, en la de residencia del <em>donatario</em>. Nunca en la del donante
                ni donde se firme la escritura. Presentar en la comunidad incorrecta puede generar un
                requerimiento y recargo.
              </li>
              <li>
                <strong>Ignorar la acumulación de donaciones en {ACUMULACION_DONACIONES_ANIOS} años.</strong> Las
                donaciones recibidas del mismo donante en los {ACUMULACION_DONACIONES_ANIOS} años anteriores
                elevan el tipo que se aplica a la actual (art. 30.1 LISD). No declararlas en el Modelo 651 es
                una infracción tributaria.
              </li>
              <li>
                <strong>Donar inmuebles sin escritura pública.</strong> Sin escritura, la donación de un
                inmueble no es válida (art. 633 CC) y el donatario no puede inscribirlo en el Registro de la
                Propiedad, lo que impide hipotecarlo o venderlo con normalidad. Además, en Cataluña se pierde
                la tarifa reducida y en Castilla-La Mancha, las bonificaciones.
              </li>
              <li>
                <strong>Olvidar el Impuesto Municipal de Plusvalía (IIVTNU).</strong> Si se dona
                un inmueble urbano, el donatario también debe declarar la plusvalía municipal ante
                el Ayuntamiento donde radica el bien, en 30 días hábiles. El incumplimiento
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
