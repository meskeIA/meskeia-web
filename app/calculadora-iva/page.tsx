'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from './CalculadoraIVA.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, RelatedApps, DisclaimerCard, DataReference, LegalNotice, EducationalSection, ShareCard, RegionBadge } from '@/components';
import { formatCurrency, formatNumber, formatTipoNominal, parseSpanishNumber } from '@/lib';
import {
  FISCAL_IVA_META,
  PORCENTAJES_IVA,
  RECARGO_EQUIVALENCIA,
  RECARGO_EQUIVALENCIA_TABACO,
  UMBRAL_OSS,
} from '@/data/fiscal/iva';
import { ESCALA_RECARGO_EXTEMPORANEO } from '@/data/fiscal/recargos-sanciones';
import { PREGUNTAS_FRECUENTES } from './metadata';

type OperationType = 'add' | 'remove';

/**
 * El resultado guarda el tipo y la operación con los que se calculó: el rótulo de la cuota y el
 * HTML exportable leen de aquí, no del selector (hallazgo 4633: tras pulsar «10 %» quedaba la
 * cuota del 21 % bajo el rótulo «Cuota IVA (10 %)»).
 */
interface IvaResult {
  baseImponible: number;
  cuotaIva: number;
  total: number;
  tipo: number;
  operacion: OperationType;
}

/** «21 %» con el espacio duro que pide el formato español. */
const pct = (n: number): string => `${formatTipoNominal(n)} %`;

const IVA_RATES = [
  { value: PORCENTAJES_IVA.general, nombre: 'General', description: 'Tipo general' },
  { value: PORCENTAJES_IVA.reducido, nombre: 'Reducido', description: 'Alimentación, transporte, hostelería' },
  { value: PORCENTAJES_IVA.superreducido, nombre: 'Superreducido', description: 'Pan, leche, libros, medicamentos' },
];

const RECARGOS_TEXTO = RECARGO_EQUIVALENCIA.map((r) => `+${pct(r.recargo)}`).join(' / ');

const E = ESCALA_RECARGO_EXTEMPORANEO;
const RECARGO_TARDIO_TEXTO = `si lo presentas tarde sin requerimiento, recargo del ${pct(E.porcentajeBase)} más otro ${pct(E.porcentajePorMes)} por cada mes completo de retraso; pasados ${E.mesesEscalaProporcional} meses, del ${pct(E.porcentajeMas12Meses)} más intereses de demora`;

/** Redondeo al entero limpiando antes el error de coma flotante (312,4999… de 3,25 / 1,04 → 313). */
function redondear(x: number): number {
  return Math.round(Number(x.toPrecision(12)));
}

/**
 * Desglose al céntimo, en céntimos enteros. Al quitar el IVA se redondea primero la base y la
 * cuota es la diferencia, para que base + cuota sumen el total (hallazgo 4634: 3,25 € al 4 %
 * daba 3,13 € + 0,13 €). Al añadirlo, la cuota se redondea y el total es la suma.
 */
function desglosar(valor: number, tipo: number, operacion: OperationType): IvaResult {
  if (operacion === 'add') {
    const base = redondear(valor * 100);
    const cuota = redondear((base * tipo) / 100);
    return { baseImponible: base / 100, cuotaIva: cuota / 100, total: (base + cuota) / 100, tipo, operacion };
  }
  const total = redondear(valor * 100);
  const base = redondear(total / (1 + tipo / 100));
  return { baseImponible: base / 100, cuotaIva: (total - base) / 100, total: total / 100, tipo, operacion };
}

const AVISO_IMPORTE = 'Escribe un importe mayor que 0 para calcular el IVA.';

export default function CalculadoraIvaPage() {
  const [cantidad, setCantidad] = useState('');
  const [tipoIva, setTipoIva] = useState<number>(PORCENTAJES_IVA.general);
  const [operacion, setOperacion] = useState<OperationType>('add');
  const [resultado, setResultado] = useState<IvaResult | null>(null);
  const [error, setError] = useState('');

  // Estados para HTML code
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  const recalcular = (texto: string, tipo: number, op: OperationType, avisar: boolean) => {
    const valor = parseSpanishNumber(texto);
    if (isNaN(valor) || valor <= 0) {
      setResultado(null);
      setError(avisar ? AVISO_IMPORTE : '');
      return;
    }
    setError('');
    setResultado(desglosar(valor, tipo, op));
  };

  const calcular = () => recalcular(cantidad, tipoIva, operacion, true);

  // Cambiar el tipo o la operación con un resultado a la vista lo recalcula: nunca se queda una
  // cifra de otro tipo bajo el rótulo nuevo (hallazgo 4633).
  const elegirTipo = (tipo: number) => {
    setTipoIva(tipo);
    if (resultado) recalcular(cantidad, tipo, operacion, false);
  };

  const elegirOperacion = (op: OperationType) => {
    setOperacion(op);
    if (resultado) recalcular(cantidad, tipoIva, op, false);
  };

  const cambiarCantidad = (texto: string) => {
    setCantidad(texto);
    if (error) setError('');
  };

  const limpiar = () => {
    setCantidad('');
    setResultado(null);
    setError('');
  };

  // Generar código HTML exportable
  const generarCodigoHTML = useCallback(() => {
    if (!resultado) {
      setHtmlCode('');
      return;
    }

    const tipoOperacion = resultado.operacion === 'add' ? 'Añadir' : 'Quitar';
    const rate = IVA_RATES.find(r => r.value === resultado.tipo);
    const tipoIvaTexto = rate ? `${rate.nombre} (${pct(rate.value)})` : pct(resultado.tipo);

    let codigo = '<!-- Cálculo de IVA generado con meskeIA -->\n\n';
    codigo += '<div class="calculadora-iva">\n';
    codigo += `  <h3>Resultado del cálculo (${tipoOperacion} IVA ${pct(resultado.tipo)})</h3>\n\n`;
    codigo += '  <table>\n';
    codigo += '    <thead>\n';
    codigo += '      <tr>\n';
    codigo += '        <th>Concepto</th>\n';
    codigo += '        <th>Importe</th>\n';
    codigo += '      </tr>\n';
    codigo += '    </thead>\n';
    codigo += '    <tbody>\n';
    codigo += '      <tr>\n';
    codigo += '        <td>Base imponible</td>\n';
    codigo += `        <td>${formatCurrency(resultado.baseImponible)}</td>\n`;
    codigo += '      </tr>\n';
    codigo += '      <tr>\n';
    codigo += `        <td>IVA (${tipoIvaTexto})</td>\n`;
    codigo += `        <td>${formatCurrency(resultado.cuotaIva)}</td>\n`;
    codigo += '      </tr>\n';
    codigo += '      <tr class="total">\n';
    codigo += '        <td><strong>Total con IVA</strong></td>\n';
    codigo += `        <td><strong>${formatCurrency(resultado.total)}</strong></td>\n`;
    codigo += '      </tr>\n';
    codigo += '    </tbody>\n';
    codigo += '  </table>\n\n';
    codigo += '  <!-- CSS sugerido -->\n';
    codigo += '  <style>\n';
    codigo += '    .calculadora-iva { max-width: 500px; margin: 20px 0; }\n';
    codigo += '    .calculadora-iva table { width: 100%; border-collapse: collapse; }\n';
    codigo += '    .calculadora-iva th, .calculadora-iva td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }\n';
    codigo += '    .calculadora-iva th { background: #2E86AB; color: white; }\n';
    codigo += '    .calculadora-iva tr.total { font-weight: bold; border-top: 2px solid #2E86AB; }\n';
    codigo += '  </style>\n';
    codigo += '</div>';

    setHtmlCode(codigo);
  }, [resultado]);

  // Auto-generar HTML cuando cambia el resultado
  useEffect(() => {
    generarCodigoHTML();
  }, [generarCodigoHTML]);

  // Copiar código al portapapeles
  const copiarCodigo = () => {
    navigator.clipboard.writeText(htmlCode);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de IVA</h1>
        <p className={styles.subtitle}>
          Calcula el IVA español al {pct(PORCENTAJES_IVA.general)}, {pct(PORCENTAJES_IVA.reducido)} o {pct(PORCENTAJES_IVA.superreducido)}. Añade o quita IVA al instante.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <div className={styles.operationToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${operacion === 'add' ? styles.active : ''}`}
              aria-pressed={operacion === 'add'}
              onClick={() => elegirOperacion('add')}
            >
              + Añadir IVA
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${operacion === 'remove' ? styles.active : ''}`}
              aria-pressed={operacion === 'remove'}
              onClick={() => elegirOperacion('remove')}
            >
              − Quitar IVA
            </button>
          </div>

          <NumberInput
            value={cantidad}
            onChange={cambiarCantidad}
            label={operacion === 'add' ? 'Base imponible (sin IVA)' : 'Precio con IVA incluido'}
            placeholder="100"
            helperText="Introduce el importe en euros"
            error={error || undefined}
            min={0}
            acotarAlSalir={false}
          />

          <div className={styles.ivaSelector}>
            <span id="tipo-iva-label" className={styles.label}>Tipo de IVA</span>
            <div role="group" aria-labelledby="tipo-iva-label" className={styles.ivaOptions}>
              {IVA_RATES.map((rate) => (
                <button
                  type="button"
                  key={rate.value}
                  className={`${styles.ivaBtn} ${tipoIva === rate.value ? styles.active : ''}`}
                  aria-pressed={tipoIva === rate.value}
                  onClick={() => elegirTipo(rate.value)}
                >
                  <span className={styles.ivaPercent}>{pct(rate.value)}</span>
                  <span className={styles.ivaDesc}>{rate.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              Calcular IVA
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Región viva montada desde la carga: al calcular, el lector anuncia el desglose (hallazgo 4641). */}
        <div className={styles.resultsPanel} role="status" aria-live="polite">
          {resultado ? (
            <>
              <ResultCard
                title="Base imponible"
                value={formatCurrency(resultado.baseImponible)}
                variant="default"
                icon="📋"
                description="Importe sin IVA"
              />
              <ResultCard
                title={`Cuota IVA (${pct(resultado.tipo)})`}
                value={formatCurrency(resultado.cuotaIva)}
                variant="info"
                icon="📊"
                description="Impuesto a pagar"
              />
              <ResultCard
                title="Total con IVA"
                value={formatCurrency(resultado.total)}
                variant="highlight"
                icon="💶"
                description="Precio final"
              />
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🧮</span>
              <p>Introduce un importe y pulsa &quot;Calcular IVA&quot;</p>
            </div>
          )}
        </div>
      </div>

      <section className={styles.infoSection}>
        <h2>Tipos de IVA en España (2026)</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>{pct(PORCENTAJES_IVA.general)} - General</h3>
            <p>Electrónica, ropa, servicios profesionales, combustible, automóviles...</p>
          </div>
          <div className={styles.infoCard}>
            <h3>{pct(PORCENTAJES_IVA.reducido)} - Reducido</h3>
            <p>Alimentación (excepto básicos), transporte, hostelería, espectáculos, vivienda nueva...</p>
          </div>
          <div className={styles.infoCard}>
            <h3>{pct(PORCENTAJES_IVA.superreducido)} - Superreducido</h3>
            <p>Pan, leche, huevos, frutas, verduras, aceite de oliva, libros, medicamentos, prótesis...</p>
          </div>
        </div>
        <p className={styles.infoNota}>
          Estos tipos rigen en la Península y Baleares. En Canarias se aplica el IGIC, y en Ceuta y Melilla el IPSI: allí no se aplica el IVA (art. 3 de la Ley 37/1992).
        </p>
      </section>

      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="calculadora-iva"
        collapsible={false}
      />
      <DataReference
        normativa="Tipos de IVA (Ley 37/1992)"
        fuente={FISCAL_IVA_META.fuente}
        verificado={FISCAL_IVA_META.verificado}
        urlOficial={FISCAL_IVA_META.urlOficial}
        nota={FISCAL_IVA_META.nota}
      />

      {/* ========== SECCIÓN 1: HTML CODE EXPORTABLE ========== */}
      {resultado && (
        <section className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2><span aria-hidden="true">📋</span> Código HTML para tu blog o web</h2>
              <p className={styles.htmlSubtitle}>
                Copia este código listo para pegar en artículos sobre IVA, contabilidad o guías para autónomos
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHtmlExpanded(!htmlExpanded)}
              className={styles.btnToggleCode}
              aria-label={htmlExpanded ? 'Ocultar código HTML' : 'Ver código HTML'}
            >
              {htmlExpanded ? '▲ Ocultar' : '▼ Ver código'}
            </button>
          </div>

          {htmlExpanded && htmlCode && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>{htmlCode}</pre>
              <button
                type="button"
                onClick={copiarCodigo}
                className={styles.btnCopyCode}
                aria-label="Copiar código HTML al portapapeles"
              >
                <span aria-hidden="true">📋</span> Copiar código
              </button>
            </div>
          )}
        </section>
      )}

      {/* ========== CONTENIDO EDUCATIVO COLAPSABLE (v2.0) ========== */}
      <EducationalSection
        title="¿Quieres dominar el IVA en España?"
        subtitle="Descubre tipos de IVA, casos de uso, declaraciones, mejores prácticas y errores comunes a evitar"
        icon="📚"
      >
        {/* Tabla Comparativa */}
        <section className={styles.eduComparativa}>
          <h2>Tipos de IVA en España y qué productos/servicios aplican</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de IVA</th>
                  <th>Porcentaje</th>
                  <th>Qué grava</th>
                  <th>Ejemplos concretos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tipo superreducido</strong></td>
                  <td>{pct(PORCENTAJES_IVA.superreducido)}</td>
                  <td>Bienes de primera necesidad</td>
                  <td>Pan, leche, frutas, verduras, aceite de oliva, libros, medicamentos, vivienda VPO</td>
                </tr>
                <tr>
                  <td><strong>Tipo reducido</strong></td>
                  <td>{pct(PORCENTAJES_IVA.reducido)}</td>
                  <td>Bienes básicos y servicios esenciales</td>
                  <td>Hostelería, transporte, entradas eventos, flores, obras en vivienda habitual</td>
                </tr>
                <tr>
                  <td><strong>Tipo general</strong></td>
                  <td>{pct(PORCENTAJES_IVA.general)}</td>
                  <td>Resto de bienes y servicios</td>
                  <td>Electrónica, ropa, servicios profesionales, vehículos, telecomunicaciones</td>
                </tr>
                <tr>
                  <td><strong>Exento de IVA</strong></td>
                  <td>Sin IVA</td>
                  <td>Actividades específicas exentas</td>
                  <td>Servicios médicos, seguros, educación reglada, alquiler de vivienda habitual</td>
                </tr>
                <tr>
                  <td><strong>Recargo equivalencia</strong></td>
                  <td>{RECARGOS_TEXTO} (tabaco: +{pct(RECARGO_EQUIVALENCIA_TABACO)})</td>
                  <td>Comerciantes minoristas personas físicas</td>
                  <td>Tiendas al por menor (autónomos en RE no gestionan IVA propio)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.eduEscenarios}>
          <h2>El IVA en diferentes situaciones de negocio</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <strong>Freelance con clientes en España</strong>
              </div>
              <p className={styles.escenarioExample}>Factura diseño web a empresa española: base 2.000 € + {pct(PORCENTAJES_IVA.general)} IVA = 2.420 €. Presenta el IVA cobrado (repercutido) menos el IVA pagado en compras (soportado) en el modelo 303 trimestral.</p>
              <span className={styles.escenarioTip}>IVA general {pct(PORCENTAJES_IVA.general)} + modelo 303</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
                <strong>Freelance con clientes en la UE</strong>
              </div>
              <p className={styles.escenarioExample}>Si el cliente UE tiene NIF intracomunitario, la factura va sin IVA (inversión del sujeto pasivo). Si es particular sin NIF, aplica el IVA del país de destino (OSS). Requiere registro previo.</p>
              <span className={styles.escenarioTip}>Factura sin IVA + NIF UE cliente</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏪</span>
                <strong>Restaurante o bar (hostelería)</strong>
              </div>
              {/* AEAT, Tipos IVA 2026, art. 91.Uno.2.2.º: «el suministro de comidas y bebidas para
                  consumir en el acto» al 10 %, también las alcohólicas (hallazgo 4637). El 21 % del
                  alcohol es el de su entrega como producto (art. 91.Uno.1.1.º). */}
              <p className={styles.escenarioExample}>Comida y bebida servidas para consumir en el acto, también las bebidas alcohólicas: {pct(PORCENTAJES_IVA.reducido)} (servicio de hostelería). Lo que se vende como producto para llevar va al tipo de cada producto: la comida al {pct(PORCENTAJES_IVA.reducido)} o al {pct(PORCENTAJES_IVA.superreducido)}, y las bebidas alcohólicas y los refrescos azucarados al {pct(PORCENTAJES_IVA.general)}. El ticket debe desglosar el IVA por tipo. El IVA soportado en compras (alimentos, suministros) lo pueden deducir.</p>
              <span className={styles.escenarioTip}>Hostelería: {pct(PORCENTAJES_IVA.reducido)}, también la bebida servida</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Alquiler de inmueble</strong>
              </div>
              <p className={styles.escenarioExample}>Alquiler vivienda habitual: exento de IVA. Alquiler de local comercial u oficina: sujeto a {pct(PORCENTAJES_IVA.general)} IVA. El arrendador deberá darse de alta como autónomo y presentar modelo 303.</p>
              <span className={styles.escenarioTip}>Vivienda exento / Local {pct(PORCENTAJES_IVA.general)} IVA</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                <strong>E-commerce con ventas a particulares UE</strong>
              </div>
              <p className={styles.escenarioExample}>Desde julio 2021, si superas {formatNumber(UMBRAL_OSS.importe, 0)} € en ventas a particulares de la UE, debes aplicar el IVA del país del comprador. El sistema OSS (One-Stop-Shop) simplifica la declaración desde España.</p>
              <span className={styles.escenarioTip}>OSS si ventas UE &gt; {formatNumber(UMBRAL_OSS.importe, 0)} €/año</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔨</span>
                <strong>Reforma o construcción en vivienda</strong>
              </div>
              <p className={styles.escenarioExample}>Obras de reforma en vivienda habitual: {pct(PORCENTAJES_IVA.reducido)} IVA si son obras de renovación/reparación. Obra nueva o primera entrega de edificios: {pct(PORCENTAJES_IVA.reducido)} (vivienda) o {pct(PORCENTAJES_IVA.superreducido)} (VPO). Importante distinguir el tipo de obra para no aplicar mal el {pct(PORCENTAJES_IVA.general)}.</p>
              <span className={styles.escenarioTip}>Reforma vivienda habitual: {pct(PORCENTAJES_IVA.reducido)}</span>
            </div>
          </div>
        </section>

        {/* FAQ — sale de PREGUNTAS_FRECUENTES, la misma constante que alimenta el FAQPage (hallazgo 4644). */}
        <section className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre el IVA</h2>
          <div className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <h4>{f.question}</h4>
                <p>{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.eduGuia}>
          <h2>Cómo gestionar correctamente el IVA como autónomo</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica el tipo de IVA de tu actividad</strong>
                <p>Consulta en la web de la AEAT o con un asesor qué tipo de IVA aplica a tus servicios o productos. La mayoría de servicios profesionales llevan {pct(PORCENTAJES_IVA.general)}, pero puede haber excepciones según el epígrafe IAE.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Emite facturas correctas con IVA desglosado</strong>
                <p>Toda factura debe incluir: base imponible, tipo de IVA aplicado (%), cuota de IVA y total. Si emites facturas sin IVA cuando deberías incluirlo, tendrás que ingresarlo de tu bolsillo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Guarda todas las facturas de gastos</strong>
                <p>Para deducir el IVA soportado necesitas factura completa (no ticket). El proveedor debe incluir sus datos fiscales y los tuyos, base imponible, tipo y cuota de IVA. Los tickets de caja NO son válidos para deducción de IVA.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Lleva un libro de facturas emitidas y recibidas</strong>
                <p>Es obligatorio. Puede ser en Excel o software contable. Anota fecha, número de factura, nombre/NIF del cliente o proveedor, base imponible, tipo de IVA y cuota. Hacienda puede pedirte los libros en cualquier inspección.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Reserva el IVA cobrado en una cuenta separada</strong>
                <p>El IVA que cobras a tus clientes NO es tuyo: lo debes ingresar a Hacienda cada trimestre. Una práctica recomendada es transferirlo a una cuenta separada para no gastar dinero que no es tuyo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Presenta el modelo 303 cada trimestre</strong>
                <p>Calcula la diferencia entre IVA repercutido (cobrado a clientes) e IVA soportado deducible (pagado a proveedores). Si la diferencia es positiva, pagas a Hacienda. Si es negativa, puedes compensar en el siguiente trimestre o solicitar devolución en el 4T.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Presenta el resumen anual (modelo 390) en enero</strong>
                <p>Es un resumen de todos los trimestres del año. No genera pago adicional, pero es obligatorio. Si trabajas con clientes de la UE, recuerda también el modelo 349 (declaración recapitulativa de operaciones intracomunitarias).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.eduTips}>
          <h2>Tips para no tener problemas con el IVA</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <strong>Digitaliza todas tus facturas</strong>
              <p>Usa apps como Holded, Quipu o Sage para registrar ingresos y gastos con IVA en tiempo real.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Pon alertas en el calendario</strong>
              <p>Los plazos de presentación del 303 son fijos cada trimestre. Saltártelos conlleva recargos automáticos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💰</span>
              <strong>Separa el IVA desde el primer día</strong>
              <p>Cuando cobres una factura, transfiere el {pct(PORCENTAJES_IVA.general)} (o el tipo aplicable) a una cuenta de reserva para Hacienda.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <strong>Exige siempre factura completa</strong>
              <p>Un ticket no sirve para deducir IVA. Pide siempre factura con tus datos cuando el gasto sea profesional.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <strong>Verifica NIF intracomunitario</strong>
              <p>Antes de emitir factura sin IVA a cliente UE, comprueba su NIF en el VIES (vies.ec.europa.eu).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👨‍💼</span>
              <strong>Contrata un asesor fiscal</strong>
              <p>Para operaciones complejas (UE, exenciones, inmuebles), un asesor puede ahorrarte más de lo que cuesta.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con el IVA que puedes evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Aplicar el tipo de IVA incorrecto ({pct(PORCENTAJES_IVA.general)} donde corresponde {pct(PORCENTAJES_IVA.reducido)} o viceversa)</li>
            <li>No incluir el IVA en las facturas o emitirlas sin los datos fiscales obligatorios</li>
            <li>Deducir el IVA de gastos personales o de facturas sin tus datos fiscales</li>
            {/* Art. 27.2 LGT (ESCALA_RECARGO_EXTEMPORANEO): parte del 1 %; el 5 % era el recargo
                ejecutivo del art. 28, que es presentar sin pagar (hallazgo 4638). */}
            <li>Olvidar presentar el modelo 303 en plazo ({RECARGO_TARDIO_TEXTO})</li>
            <li>No verificar el NIF intracomunitario del cliente UE antes de emitir factura sin IVA</li>
            <li>Gastar el IVA cobrado antes de ingresarlo a Hacienda (ese dinero nunca fue tuyo)</li>
            <li>No conservar facturas durante 4 años (plazo de prescripción de Hacienda para revisarlas)</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="calculadora-iva" />
      <Footer appName="calculadora-iva" />
    </div>
  );
}
