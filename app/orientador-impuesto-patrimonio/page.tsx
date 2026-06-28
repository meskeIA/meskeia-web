'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './OrientadorImpuestoPatrimonio.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  RegionBadge,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  BONIFICACIONES_CCAA_PATRIMONIO,
  getMinimoExentoPatrimonio,
  EXENCION_VIVIENDA_HABITUAL,
  UMBRAL_OBLIGACION_DECLARAR,
  calcularCuotaPatrimonioCCAA,
  ITSGF_UMBRAL,
  FISCAL_PATRIMONIO_META,
} from '@/data/fiscal';

// ─── Utilidades ────────────────────────────────────────────────────────────────

const p = (s: string): number => parseSpanishNumber(s) || 0;

function valorInmueble(catastral: number, comprobado: number, precio: number, gastos: number): number {
  return Math.max(catastral, comprobado, precio + gastos);
}

// ─── Subcomponente: campos de un inmueble (mayor de tres valores) ───────────────

interface InmuebleCamposProps {
  catastral: string; setCatastral: (v: string) => void;
  comprobado: string; setComprobado: (v: string) => void;
  precio: string; setPrecio: (v: string) => void;
  gastos: string; setGastos: (v: string) => void;
}

function InmuebleCampos({
  catastral, setCatastral, comprobado, setComprobado, precio, setPrecio, gastos, setGastos,
}: InmuebleCamposProps) {
  const valorAdquisicion = p(precio) + p(gastos);
  const valor = valorInmueble(p(catastral), p(comprobado), p(precio), p(gastos));
  const gana =
    valor === 0 ? '' :
    valor === p(catastral) ? 'el valor catastral' :
    valor === p(comprobado) ? 'el valor comprobado' :
    'el valor de adquisición';

  return (
    <div className={styles.inmuebleCampos}>
      <NumberInput value={catastral} onChange={setCatastral} label="Valor catastral" placeholder="0" min={0}
        helperText="El que figura en el recibo del IBI" />
      <NumberInput value={comprobado} onChange={setComprobado} label="Valor comprobado por la Administración (si lo hubo)" placeholder="0" min={0}
        helperText="Solo si Hacienda comprobó un valor a efectos de otro impuesto" />
      <div className={styles.adquisicionBox}>
        <span className={styles.adquisicionTitulo}>Valor de adquisición</span>
        <NumberInput value={precio} onChange={setPrecio} label="Precio de compra" placeholder="0" min={0} />
        <NumberInput value={gastos} onChange={setGastos} label="+ Gastos e impuestos (ITP/IVA, notaría, registro...)" placeholder="0" min={0}
          helperText="Importante: el valor de adquisición incluye estos gastos, no solo el precio" />
        {valorAdquisicion > 0 && (
          <div className={styles.adquisicionTotal}>= Valor de adquisición: <strong>{formatCurrency(valorAdquisicion)}</strong></div>
        )}
      </div>
      {valor > 0 && (
        <div className={styles.inmuebleResultado}>
          Valor a efectos de Patrimonio: <strong>{formatCurrency(valor)}</strong>
          <span className={styles.inmuebleGana}>(se aplica {gana}, el mayor de los tres)</span>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────────

export default function OrientadorImpuestoPatrimonioPage() {
  const [ccaaId, setCcaaId] = useState('');

  // Vivienda habitual
  const [vhCatastral, setVhCatastral] = useState('');
  const [vhComprobado, setVhComprobado] = useState('');
  const [vhPrecio, setVhPrecio] = useState('');
  const [vhGastos, setVhGastos] = useState('');

  // Otros inmuebles
  const [inmCatastral, setInmCatastral] = useState('');
  const [inmComprobado, setInmComprobado] = useState('');
  const [inmPrecio, setInmPrecio] = useState('');
  const [inmGastos, setInmGastos] = useState('');

  // Productos financieros
  const [ctaSaldo31, setCtaSaldo31] = useState('');
  const [ctaMedia4T, setCtaMedia4T] = useState('');
  const [accionesMedia4T, setAccionesMedia4T] = useState('');
  const [fondos31, setFondos31] = useState('');
  const [segurosRescate, setSegurosRescate] = useState('');

  // Otros bienes y deudas
  const [otrosBienes, setOtrosBienes] = useState('');
  const [deudas, setDeudas] = useState('');

  // ── Valoraciones ──
  const vhValor = valorInmueble(p(vhCatastral), p(vhComprobado), p(vhPrecio), p(vhGastos));
  const vhComputable = Math.max(0, vhValor - EXENCION_VIVIENDA_HABITUAL);
  const inmValor = valorInmueble(p(inmCatastral), p(inmComprobado), p(inmPrecio), p(inmGastos));
  const cuentas = Math.max(p(ctaSaldo31), p(ctaMedia4T));
  const acciones = p(accionesMedia4T);
  const fondos = p(fondos31);
  const seguros = p(segurosRescate);
  const otros = p(otrosBienes);
  const deudasVal = p(deudas);

  // Bruto (para el umbral de 2 M): incluye la vivienda habitual completa, sin restar deudas
  const patrimonioBruto = vhValor + inmValor + cuentas + acciones + fondos + seguros + otros;
  // Base imponible: vivienda habitual solo en la parte no exenta, menos deudas
  const baseImponible = Math.max(0, vhComputable + inmValor + cuentas + acciones + fondos + seguros + otros - deudasVal);
  const patrimonioNeto = patrimonioBruto - deudasVal;

  const ccaa = BONIFICACIONES_CCAA_PATRIMONIO.find((c) => c.id === ccaaId);
  const minimoExento = ccaaId ? getMinimoExentoPatrimonio(ccaaId) : 0;
  const baseLiquidable = ccaaId ? Math.max(0, baseImponible - minimoExento) : 0;
  // Cuota por CCAA: null si no se ha seleccionado CCAA o es foral
  const resultadoCuota = (ccaaId && !ccaa?.foral && baseLiquidable > 0)
    ? calcularCuotaPatrimonioCCAA(ccaaId, baseLiquidable)
    : null;

  const hayDatos = patrimonioBruto > 0;

  // ── Veredicto de obligación ──
  type TipoVeredicto = 'pendiente' | 'sin-datos' | 'obligado-2m' | 'obligado-base' | 'no-obligado';
  let veredicto: TipoVeredicto = 'pendiente';
  if (!ccaaId) veredicto = 'pendiente';
  else if (!hayDatos) veredicto = 'sin-datos';
  else if (patrimonioBruto > UMBRAL_OBLIGACION_DECLARAR) veredicto = 'obligado-2m';
  else if (baseImponible > minimoExento) veredicto = 'obligado-base';
  else veredicto = 'no-obligado';

  const aplicaItsgf = patrimonioNeto >= ITSGF_UMBRAL;

  const filas: { etiqueta: string; valor: number; signo?: string; destacado?: boolean }[] = [
    { etiqueta: 'Vivienda habitual (valor total)', valor: vhValor },
    { etiqueta: `− Exención vivienda habitual (hasta ${formatNumber(EXENCION_VIVIENDA_HABITUAL, 0)} €)`, valor: -Math.min(vhValor, EXENCION_VIVIENDA_HABITUAL), signo: '−' },
    { etiqueta: 'Otros inmuebles', valor: inmValor },
    { etiqueta: 'Cuentas y depósitos', valor: cuentas },
    { etiqueta: 'Acciones cotizadas y ETF', valor: acciones },
    { etiqueta: 'Fondos de inversión', valor: fondos },
    { etiqueta: 'Seguros de vida (valor de rescate)', valor: seguros },
    { etiqueta: 'Otros bienes (vehículos, joyas, efectivo...)', valor: otros },
    { etiqueta: '− Deudas deducibles', valor: -deudasVal, signo: '−' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🏛️</span> Orientador del Impuesto sobre el Patrimonio
        </h1>
        <p className={styles.subtitle}>
          Valora cada bien con los criterios del Impuesto sobre el Patrimonio y descubre si estás obligado a declarar.
          Para patrimonios sin participaciones en empresas propias o no cotizadas.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical" collapsible={false} />
      <DataReference
        normativa={`Impuesto sobre el Patrimonio ${FISCAL_PATRIMONIO_META.vigencia}`}
        fuente={FISCAL_PATRIMONIO_META.fuente}
        verificado={FISCAL_PATRIMONIO_META.verificado}
        urlOficial={FISCAL_PATRIMONIO_META.urlOficial}
        nota="Los criterios de valoración son estatales (iguales en toda España). El mínimo exento y las bonificaciones varían por comunidad."
      />

      {/* ── Comunidad (obligatorio) ── */}
      <section className={`${styles.card} ${!ccaaId ? styles.cardDestacado : ''}`} aria-label="Comunidad autónoma">
        <h2 className={styles.cardTitulo}>1. ¿En qué comunidad resides?</h2>
        <p className={styles.cardNota}>
          Obligatorio: el mínimo exento depende de tu comunidad. El general es de {formatNumber(700000, 0)} €, pero
          algunas lo reducen (Cataluña, Valencia y Extremadura a 500.000 €; Aragón a 400.000 €).
        </p>
        <select
          className={styles.select}
          value={ccaaId}
          onChange={(e) => setCcaaId(e.target.value)}
          aria-label="Selecciona tu comunidad autónoma"
        >
          <option value="">— Selecciona tu comunidad autónoma —</option>
          {BONIFICACIONES_CCAA_PATRIMONIO.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        {ccaa && (
          <div className={styles.ccaaInfo}>
            Mínimo exento aplicable: <strong>{formatCurrency(minimoExento)}</strong>
            {ccaa.foral && (
              <span className={styles.foralAviso}>
                {' '}⚠️ Régimen foral: esta herramienta usa la normativa estatal. Consulta tu Hacienda foral para el cálculo exacto.
              </span>
            )}
          </div>
        )}
      </section>

      {/* ── Inmuebles ── */}
      <section className={styles.card} aria-label="Inmuebles">
        <h2 className={styles.cardTitulo}>2. Inmuebles</h2>
        <p className={styles.cardNota}>
          Cada inmueble se valora por <strong>el mayor</strong> de: valor catastral, valor comprobado por la
          Administración o valor de adquisición. <strong>No es el valor de referencia ni el catastral que ves en tu
          IRPF.</strong>
        </p>

        <h3 className={styles.subBloque}>Vivienda habitual <span className={styles.subBloqueNota}>(exenta hasta {formatNumber(EXENCION_VIVIENDA_HABITUAL, 0)} €)</span></h3>
        <InmuebleCampos
          catastral={vhCatastral} setCatastral={setVhCatastral}
          comprobado={vhComprobado} setComprobado={setVhComprobado}
          precio={vhPrecio} setPrecio={setVhPrecio}
          gastos={vhGastos} setGastos={setVhGastos}
        />
        {vhValor > 0 && (
          <div className={styles.exencionNota}>
            Tras la exención de {formatNumber(EXENCION_VIVIENDA_HABITUAL, 0)} €, computa en tu patrimonio:{' '}
            <strong>{formatCurrency(vhComputable)}</strong>
          </div>
        )}

        <h3 className={styles.subBloque}>Otros inmuebles <span className={styles.subBloqueNota}>(segunda vivienda, locales, garajes...)</span></h3>
        <InmuebleCampos
          catastral={inmCatastral} setCatastral={setInmCatastral}
          comprobado={inmComprobado} setComprobado={setInmComprobado}
          precio={inmPrecio} setPrecio={setInmPrecio}
          gastos={inmGastos} setGastos={setInmGastos}
        />
        <p className={styles.cardNotaPequena}>
          ¿Tienes varios? Calcula el valor de cada uno por separado (el mayor de sus tres valores) y súmalos aquí.
        </p>
      </section>

      {/* ── Productos financieros ── */}
      <section className={styles.card} aria-label="Cuentas y productos financieros">
        <h2 className={styles.cardTitulo}>3. Cuentas y productos financieros</h2>

        <h3 className={styles.subBloque}>Cuentas bancarias y depósitos</h3>
        <p className={styles.cardNota}>Se declara <strong>el mayor</strong> de los dos valores siguientes:</p>
        <div className={styles.dosCampos}>
          <NumberInput value={ctaSaldo31} onChange={setCtaSaldo31} label="Saldo a 31 de diciembre" placeholder="0" min={0} />
          <NumberInput value={ctaMedia4T} onChange={setCtaMedia4T} label="Saldo medio del último trimestre" placeholder="0" min={0}
            helperText="Media de los saldos del 4.º trimestre del año" />
        </div>
        {(p(ctaSaldo31) > 0 || p(ctaMedia4T) > 0) && (
          <div className={styles.exencionNota}>Se computa: <strong>{formatCurrency(cuentas)}</strong> (el mayor de ambos)</div>
        )}

        <h3 className={styles.subBloque}>Acciones cotizadas y ETF</h3>
        <NumberInput value={accionesMedia4T} onChange={setAccionesMedia4T} label="Valor por cotización media del 4.º trimestre" placeholder="0" min={0}
          helperText="No es el valor a 31/12: es la cotización media del último trimestre (lista publicada por la AEAT)" />

        <h3 className={styles.subBloque}>Fondos de inversión</h3>
        <NumberInput value={fondos31} onChange={setFondos31} label="Valor liquidativo a 31 de diciembre" placeholder="0" min={0} />

        <h3 className={styles.subBloque}>Seguros de vida</h3>
        <NumberInput value={segurosRescate} onChange={setSegurosRescate} label="Valor de rescate a 31 de diciembre" placeholder="0" min={0} />

        <div className={styles.exentoNota}>
          <span aria-hidden="true">✅</span> Los <strong>planes de pensiones</strong> están exentos: no se incluyen en el Impuesto sobre el Patrimonio.
        </div>
      </section>

      {/* ── Otros bienes y deudas ── */}
      <section className={styles.card} aria-label="Otros bienes y deudas">
        <h2 className={styles.cardTitulo}>4. Otros bienes y deudas</h2>
        <NumberInput value={otrosBienes} onChange={setOtrosBienes} label="Otros bienes (vehículos, joyas, arte, embarcaciones, efectivo...)" placeholder="0" min={0}
          helperText="Por su valor de mercado" />
        <NumberInput value={deudas} onChange={setDeudas} label="Deudas deducibles (préstamos, hipotecas...)" placeholder="0" min={0}
          helperText="No es deducible la parte de la hipoteca vinculada a la vivienda habitual exenta" />
      </section>

      {/* ── Resultado ── */}
      <section className={`${styles.resultado} ${styles[`veredicto_${veredicto}`]}`} aria-label="Resultado">
        {veredicto === 'pendiente' && (
          <p className={styles.resultadoPendiente}>
            <span aria-hidden="true">👆</span> Selecciona tu comunidad autónoma e introduce tus bienes para ver si estás obligado a declarar.
          </p>
        )}
        {veredicto === 'sin-datos' && (
          <p className={styles.resultadoPendiente}>
            Introduce el valor de tus bienes para obtener el resultado.
          </p>
        )}

        {(veredicto === 'obligado-2m' || veredicto === 'obligado-base' || veredicto === 'no-obligado') && (
          <>
            <div className={styles.veredictoHeader}>
              <span className={styles.veredictoIcon} aria-hidden="true">
                {veredicto === 'no-obligado' ? '✅' : '📋'}
              </span>
              <h2 className={styles.veredictoTitulo}>
                {veredicto === 'obligado-2m' && 'Estás obligado a declarar'}
                {veredicto === 'obligado-base' && 'Probablemente debas declarar'}
                {veredicto === 'no-obligado' && 'En principio, no estás obligado a declarar'}
              </h2>
            </div>

            <p className={styles.veredictoMensaje}>
              {veredicto === 'obligado-2m' && (
                <>Tus bienes y derechos brutos suman <strong>{formatCurrency(patrimonioBruto)}</strong>, por encima de los{' '}
                {formatNumber(UMBRAL_OBLIGACION_DECLARAR, 0)} €. Estás obligado a declarar <strong>aunque no pagues cuota</strong>,
                con independencia de tu comunidad.</>
              )}
              {veredicto === 'obligado-base' && (
                <>Tu base imponible (<strong>{formatCurrency(baseImponible)}</strong>) supera el mínimo exento de {ccaa?.nombre}{' '}
                (<strong>{formatCurrency(minimoExento)}</strong>). En principio debes declarar.
                {ccaa?.bonificacion === 'total' && ' Tu comunidad bonifica la cuota cerca del 100 %, así que probablemente no pagues, pero verifica si debes presentar la declaración igualmente.'}
                {ccaa?.bonificacion === 'parcial' && ' Tu comunidad aplica una bonificación parcial sobre la cuota.'}
                </>
              )}
              {veredicto === 'no-obligado' && (
                <>Tu base imponible (<strong>{formatCurrency(baseImponible)}</strong>) no supera el mínimo exento de {ccaa?.nombre}{' '}
                (<strong>{formatCurrency(minimoExento)}</strong>) y tus bienes brutos no llegan a {formatNumber(UMBRAL_OBLIGACION_DECLARAR, 0)} €.
                En principio no tienes obligación de declarar.</>
              )}
            </p>

            {ccaa?.foral && (
              <p className={styles.veredictoForal}>
                <span aria-hidden="true">⚠️</span> Resides en territorio foral ({ccaa.nombre}): la normativa de Patrimonio es propia.
                Este resultado es orientativo según las reglas estatales; confírmalo con tu Hacienda foral.
              </p>
            )}

            {/* Desglose del patrimonio */}
            <div className={styles.desglose}>
              <h3 className={styles.desgloseTitulo}>Tu patrimonio a efectos del impuesto</h3>
              {filas.filter(f => f.valor !== 0).map((f, i) => (
                <div key={i} className={styles.desgloseFila}>
                  <span>{f.etiqueta}</span>
                  <span className={styles.desgloseValor}>{formatCurrency(f.valor)}</span>
                </div>
              ))}
              <div className={`${styles.desgloseFila} ${styles.desgloseTotal}`}>
                <span>Base imponible (patrimonio neto computable)</span>
                <span className={styles.desgloseValor}>{formatCurrency(baseImponible)}</span>
              </div>
              <div className={styles.desgloseFila}>
                <span>− Mínimo exento ({ccaa?.nombre})</span>
                <span className={styles.desgloseValor}>−{formatCurrency(minimoExento)}</span>
              </div>
              <div className={`${styles.desgloseFila} ${styles.desgloseTotal}`}>
                <span>Base liquidable</span>
                <span className={styles.desgloseValor}>{formatCurrency(baseLiquidable)}</span>
              </div>
            </div>

            {/* Cuota orientativa por CCAA */}
            {resultadoCuota && (
              <div className={styles.cuotaBox}>
                <p className={styles.cuotaTitulo}>Cuota orientativa — {ccaa?.nombre}</p>
                <div className={styles.cuotaFilas}>
                  <div className={styles.cuotaFila}>
                    <span>Cuota bruta (tarifa {resultadoCuota.escalaUsada})</span>
                    <strong>{formatCurrency(resultadoCuota.cuotaBruta)}</strong>
                  </div>
                  {resultadoCuota.porcentajeBonificacion > 0 && (
                    <div className={styles.cuotaFila}>
                      <span>− Bonificación {ccaa?.nombre} ({resultadoCuota.porcentajeBonificacion} %)</span>
                      <strong>
                        −{formatCurrency(resultadoCuota.cuotaBruta * resultadoCuota.porcentajeBonificacion / 100)}
                      </strong>
                    </div>
                  )}
                  <div className={`${styles.cuotaFila} ${styles.cuotaFilaNeta}`}>
                    <span>Cuota neta orientativa</span>
                    <strong className={styles.cuotaValor}>{formatCurrency(resultadoCuota.cuotaNeta)}</strong>
                  </div>
                </div>
                <p className={styles.cuotaAviso}>
                  <span aria-hidden="true">⚠️</span>{' '}
                  {resultadoCuota.itsgfInteraccion
                    ? `La bonificación de ${ccaa?.nombre ?? ''} es variable — interactúa con el Impuesto Temporal de Solidaridad de las Grandes Fortunas (ITSGF). La cuota real puede diferir de esta orientación. `
                    : resultadoCuota.porcentajeBonificacion === 100
                    ? `${ccaa?.nombre ?? ''} aplica bonificación del 100% — la cuota es orientativa (sin ITSGF). `
                    : ''
                  }
                  {resultadoCuota.porcentajeBonificacion < 100 && (
                    <>
                      Revisa el{' '}
                      <Link href="/orientador-limite-conjunto-patrimonio/" className={styles.enlaceInline}>
                        límite conjunto IRPF-Patrimonio
                      </Link>
                      {', que puede reducir adicionalmente la cuota. '}
                    </>
                  )}
                  Cifra orientativa — consulta con un asesor fiscal para el cálculo exacto.
                </p>
              </div>
            )}

            {aplicaItsgf && (
              <p className={styles.itsgfAviso}>
                <span aria-hidden="true">ℹ️</span> Tu patrimonio neto supera los {formatNumber(ITSGF_UMBRAL, 0)} €: además del
                Impuesto sobre el Patrimonio, podría aplicarte el <strong>Impuesto Temporal de Solidaridad de las Grandes
                Fortunas (ITSGF)</strong>, estatal. Consúltalo con un asesor.
              </p>
            )}
          </>
        )}
      </section>

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="Guía del Impuesto sobre el Patrimonio"
        subtitle="Cómo se valora cada bien y quién está obligado a declarar"
      >
        {/* Tabla comparativa de criterios */}
        <section className={styles.guideSection}>
          <h2>Criterios de valoración por tipo de bien</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Bien</th>
                  <th>Cómo se valora</th>
                  <th>Matiz a recordar</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Cuentas y depósitos</strong></td><td>El mayor de: saldo a 31/12 o saldo medio del 4.º trimestre</td><td>No basta el saldo de fin de año</td></tr>
                <tr><td><strong>Acciones cotizadas y ETF</strong></td><td>Cotización media del 4.º trimestre</td><td>Distinto de los fondos (no es el valor a 31/12)</td></tr>
                <tr><td><strong>Fondos de inversión</strong></td><td>Valor liquidativo a 31/12</td><td>—</td></tr>
                <tr><td><strong>Inmuebles</strong></td><td>El mayor de: catastral, comprobado o de adquisición</td><td>No es el valor de referencia; el de adquisición incluye gastos</td></tr>
                <tr><td><strong>Seguros de vida</strong></td><td>Valor de rescate a 31/12</td><td>—</td></tr>
                <tr><td><strong>Vehículos, joyas, arte</strong></td><td>Valor de mercado</td><td>Para vehículos, tablas de precios medios oficiales</td></tr>
                <tr><td><strong>Vivienda habitual</strong></td><td>Como inmueble, pero exenta hasta 300.000 €</td><td>Solo computa el exceso sobre 300.000 €</td></tr>
                <tr><td><strong>Planes de pensiones</strong></td><td>Exentos: no se declaran</td><td>Confusión frecuente con los fondos de inversión</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>¿A quién le sirve este orientador?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
              <h3>Jubilado con piso y ahorros</h3>
              <p>Vivienda en propiedad, algo de ahorro y fondos. Quiere saber si, sumado todo, llega a tener que declarar.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
              <h3>Pequeño inversor</h3>
              <p>Cartera de acciones, ETF y fondos. Necesita aplicar la cotización media del trimestre y el valor liquidativo correctos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏘️</span>
              <h3>Propietario de varios inmuebles</h3>
              <p>Vivienda habitual más una segunda residencia o un local. Debe valorar cada uno por el mayor de sus tres valores.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📍</span>
              <h3>Residente donde el mínimo baja</h3>
              <p>En Cataluña, Valencia, Extremadura o Aragón el mínimo exento es menor de 700.000 €: el umbral para declarar cambia.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cómo se valora un inmueble, y por qué no coincide con mi IRPF?</dt>
              <dd>
                Por el <strong>mayor</strong> de tres valores: catastral, comprobado por la Administración o de adquisición. En el IRPF
                Hacienda te precarga el valor catastral, pero en Patrimonio puede ganar el de adquisición. Y ese valor de adquisición
                <strong> incluye los gastos e impuestos</strong> de la compra (ITP o IVA, notaría, registro), no solo el precio de escritura.
                <span className={styles.faqTip}>No se usa el valor de referencia: ese es de ITP y de Sucesiones.</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué saldo de mis cuentas tengo que declarar?</dt>
              <dd>
                El <strong>mayor</strong> entre el saldo a 31 de diciembre y el saldo medio del último trimestre. Así se evita "vaciar" la
                cuenta a fin de año para pagar menos. La excepción: si retiraste dinero en el trimestre para comprar otro bien que ya declaras,
                ese importe no se cuenta dos veces.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuándo estoy obligado a declarar el patrimonio?</dt>
              <dd>
                En dos casos: si la <strong>cuota sale a ingresar</strong>, o si el <strong>valor bruto</strong> de tus bienes y derechos
                supera <strong>2.000.000 €</strong> (en ese caso, aunque no pagues nada). El mínimo exento general es de 700.000 €, pero
                Cataluña, Valencia y Extremadura lo bajan a 500.000 € y Aragón a 400.000 €.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿La vivienda habitual paga Patrimonio?</dt>
              <dd>
                Está <strong>exenta hasta 300.000 €</strong> por contribuyente; solo tributa el exceso. Si la vivienda es de ambos cónyuges,
                cada uno aplica su exención sobre su mitad. La parte de la hipoteca vinculada al importe exento tampoco resta como deuda.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Los planes de pensiones cuentan en el patrimonio?</dt>
              <dd>
                No. Los derechos consolidados en planes de pensiones están <strong>exentos</strong> y no se declaran. Es una de las confusiones
                más habituales: a diferencia de los fondos de inversión, los planes de pensiones no computan.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>Mi comunidad bonifica el 100 %, ¿entonces no hago nada?</dt>
              <dd>
                Cuidado. Aunque no pagues cuota por la bonificación, <strong>sigues obligado a declarar si tus bienes brutos superan
                2.000.000 €</strong>. Y si tu patrimonio supera 3.000.000 €, puede aplicarte el Impuesto Temporal de Solidaridad de las Grandes
                Fortunas (estatal), pensado precisamente para esas comunidades.
              </dd>
            </div>
          </dl>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo calcular tu patrimonio a efectos del impuesto</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Valora cada bien con su criterio propio</strong>
                <p>Cuentas (mayor de 31/12 vs media 4T), acciones cotizadas (media 4T), fondos (liquidativo 31/12), inmuebles (mayor de tres valores).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Aplica las exenciones</strong>
                <p>Resta los 300.000 € de la vivienda habitual y excluye por completo los planes de pensiones.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Resta las deudas deducibles</strong>
                <p>Préstamos e hipotecas, salvo la parte vinculada a bienes exentos. Así obtienes tu base imponible (patrimonio neto).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Comprueba la obligación de declarar</strong>
                <p>¿Bienes brutos por encima de 2.000.000 €? Declaras siempre. ¿Base por encima del mínimo exento de tu comunidad? También.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Resta el mínimo exento y calcula</strong>
                <p>Base imponible − mínimo exento = base liquidable, sobre la que se aplica la escala (estatal o autonómica).</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗓️</span>
              <p><strong>Apunta los saldos medios del 4.º trimestre</strong> de tus cuentas, no solo el de 31/12: muchas veces es el que se acaba declarando.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <p><strong>Reconstruye el valor de adquisición de tus inmuebles</strong> con la escritura más los gastos e impuestos: suele ser mayor que el catastral.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📍</span>
              <p><strong>Confirma el mínimo exento de tu comunidad.</strong> Por debajo de 700.000 € de patrimonio podrías tener que declarar igualmente en Cataluña, Valencia, Extremadura o Aragón.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <p><strong>Aunque tu CCAA bonifique el 100 %,</strong> revisa si superas los 2.000.000 € brutos: la obligación de declarar se mantiene.</p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes con el Impuesto sobre el Patrimonio</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Usar el valor catastral del IRPF para los inmuebles:</strong> en Patrimonio es el mayor de tres valores, y el de adquisición (con gastos) suele ganar.</li>
              <li><strong>Declarar solo el saldo a 31/12 de las cuentas:</strong> si el saldo medio del trimestre es mayor, es ese el que cuenta.</li>
              <li><strong>Creer que con bonificación del 100 % no hay que hacer nada:</strong> si los bienes brutos superan 2.000.000 €, hay obligación de declarar igualmente.</li>
              <li><strong>Pensar que con menos de 700.000 € nunca se declara:</strong> en Cataluña, Valencia, Extremadura (500.000 €) y Aragón (400.000 €) el umbral es menor.</li>
              <li><strong>Incluir los planes de pensiones:</strong> están exentos y no se declaran (sí los fondos de inversión).</li>
              <li><strong>Olvidar la exención de los 300.000 € de la vivienda habitual</strong> o restar la hipoteca asociada a la parte exenta.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-impuesto-patrimonio')} />
      <ShareCard appName="orientador-impuesto-patrimonio" />
      <Footer appName="orientador-impuesto-patrimonio" />
    </div>
  );
}
