'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from './CalculadoraIVA.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, RelatedApps, DisclaimerCard, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type OperationType = 'add' | 'remove';

interface IvaResult {
  baseImponible: number;
  cuotaIva: number;
  total: number;
}

const IVA_RATES = [
  { value: 21, label: 'General (21%)', description: 'Tipo general' },
  { value: 10, label: 'Reducido (10%)', description: 'Alimentación, transporte, hostelería' },
  { value: 4, label: 'Superreducido (4%)', description: 'Pan, leche, libros, medicamentos' },
];

export default function CalculadoraIvaPage() {
  const [cantidad, setCantidad] = useState('');
  const [tipoIva, setTipoIva] = useState(21);
  const [operacion, setOperacion] = useState<OperationType>('add');
  const [resultado, setResultado] = useState<IvaResult | null>(null);

  // Estados para HTML code
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  const calcular = () => {
    const valor = parseSpanishNumber(cantidad);
    if (isNaN(valor) || valor <= 0) {
      setResultado(null);
      return;
    }

    let baseImponible: number;
    let cuotaIva: number;
    let total: number;

    if (operacion === 'add') {
      // Añadir IVA: el valor es la base imponible
      baseImponible = valor;
      cuotaIva = valor * (tipoIva / 100);
      total = baseImponible + cuotaIva;
    } else {
      // Quitar IVA: el valor es el total con IVA
      total = valor;
      baseImponible = valor / (1 + tipoIva / 100);
      cuotaIva = total - baseImponible;
    }

    setResultado({ baseImponible, cuotaIva, total });
  };

  const limpiar = () => {
    setCantidad('');
    setResultado(null);
  };

  // Generar código HTML exportable
  const generarCodigoHTML = useCallback(() => {
    if (!resultado) {
      setHtmlCode('');
      return;
    }

    const tipoOperacion = operacion === 'add' ? 'Añadir' : 'Quitar';
    const tipoIvaTexto = IVA_RATES.find(r => r.value === tipoIva)?.label || `${tipoIva}%`;

    let codigo = '<!-- Cálculo de IVA generado con meskeIA -->\n\n';
    codigo += '<div class="calculadora-iva">\n';
    codigo += `  <h3>Resultado del cálculo (${tipoOperacion} IVA ${tipoIva}%)</h3>\n\n`;
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
  }, [resultado, operacion, tipoIva]);

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
          Calcula el IVA español al 21%, 10% o 4%. Añade o quita IVA al instante.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <div className={styles.operationToggle}>
            <button
              className={`${styles.toggleBtn} ${operacion === 'add' ? styles.active : ''}`}
              onClick={() => setOperacion('add')}
            >
              + Añadir IVA
            </button>
            <button
              className={`${styles.toggleBtn} ${operacion === 'remove' ? styles.active : ''}`}
              onClick={() => setOperacion('remove')}
            >
              − Quitar IVA
            </button>
          </div>

          <NumberInput
            value={cantidad}
            onChange={setCantidad}
            label={operacion === 'add' ? 'Base imponible (sin IVA)' : 'Precio con IVA incluido'}
            placeholder="100"
            helperText="Introduce el importe en euros"
            min={0}
          />

          <div className={styles.ivaSelector}>
            <label className={styles.label}>Tipo de IVA</label>
            <div className={styles.ivaOptions}>
              {IVA_RATES.map((rate) => (
                <button
                  key={rate.value}
                  className={`${styles.ivaBtn} ${tipoIva === rate.value ? styles.active : ''}`}
                  onClick={() => setTipoIva(rate.value)}
                >
                  <span className={styles.ivaPercent}>{rate.value}%</span>
                  <span className={styles.ivaDesc}>{rate.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular IVA
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
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
                title={`Cuota IVA (${tipoIva}%)`}
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
              <span className={styles.placeholderIcon}>🧮</span>
              <p>Introduce un importe y pulsa &quot;Calcular IVA&quot;</p>
            </div>
          )}
        </div>
      </div>

      <section className={styles.infoSection}>
        <h2>Tipos de IVA en España (2026)</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>21% - General</h3>
            <p>Electrónica, ropa, servicios profesionales, combustible, automóviles...</p>
          </div>
          <div className={styles.infoCard}>
            <h3>10% - Reducido</h3>
            <p>Alimentación (excepto básicos), transporte, hostelería, espectáculos, vivienda nueva...</p>
          </div>
          <div className={styles.infoCard}>
            <h3>4% - Superreducido</h3>
            <p>Pan, leche, huevos, frutas, verduras, libros, medicamentos, prótesis...</p>
          </div>
        </div>
      </section>

      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="calculadora-iva"
        collapsible={false}
      />

      {/* ========== SECCIÓN 1: HTML CODE EXPORTABLE ========== */}
      {resultado && (
        <section className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2>📋 Código HTML para tu blog o web</h2>
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
                📋 Copiar código
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
                  <td>4%</td>
                  <td>Bienes de primera necesidad</td>
                  <td>Pan, leche, frutas, verduras, libros, medicamentos, vivienda VPO</td>
                </tr>
                <tr>
                  <td><strong>Tipo reducido</strong></td>
                  <td>10%</td>
                  <td>Bienes básicos y servicios esenciales</td>
                  <td>Hostelería, transporte, entradas eventos, flores, obras en vivienda habitual</td>
                </tr>
                <tr>
                  <td><strong>Tipo general</strong></td>
                  <td>21%</td>
                  <td>Resto de bienes y servicios</td>
                  <td>Electrónica, ropa, servicios profesionales, vehículos, telecomunicaciones</td>
                </tr>
                <tr>
                  <td><strong>Exento de IVA</strong></td>
                  <td>0%</td>
                  <td>Actividades específicas exentas</td>
                  <td>Servicios médicos, seguros, educación reglada, alquiler de vivienda habitual</td>
                </tr>
                <tr>
                  <td><strong>Recargo equivalencia</strong></td>
                  <td>+0,5% / +1,4% / +5,2%</td>
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
                <span className={styles.escenarioIcon}>💻</span>
                <strong>Freelance con clientes en España</strong>
              </div>
              <p className={styles.escenarioExample}>Factura diseño web a empresa española: base 2.000 € + 21% IVA = 2.420 €. Presenta el IVA cobrado (repercutido) menos el IVA pagado en compras (soportado) en el modelo 303 trimestral.</p>
              <span className={styles.escenarioTip}>IVA general 21% + modelo 303</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌍</span>
                <strong>Freelance con clientes en la UE</strong>
              </div>
              <p className={styles.escenarioExample}>Si el cliente UE tiene NIF intracomunitario, la factura va sin IVA (inversión del sujeto pasivo). Si es particular sin NIF, aplica el IVA del país de destino (OSS). Requiere registro previo.</p>
              <span className={styles.escenarioTip}>Factura 0% IVA + NIF UE cliente</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏪</span>
                <strong>Restaurante o bar (hostelería)</strong>
              </div>
              <p className={styles.escenarioExample}>Comida en local: 10% IVA. Bebidas alcohólicas: 21% IVA. Comida para llevar: 10%. El ticket debe desglosar IVA por tipo. El IVA soportado en compras (alimentos, suministros) lo pueden deducir.</p>
              <span className={styles.escenarioTip}>Hostelería: 10% + 21% en alcohol</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <strong>Alquiler de inmueble</strong>
              </div>
              <p className={styles.escenarioExample}>Alquiler vivienda habitual: exento de IVA. Alquiler de local comercial u oficina: sujeto a 21% IVA. El arrendador deberá darse de alta como autónomo y presentar modelo 303.</p>
              <span className={styles.escenarioTip}>Vivienda exento / Local 21% IVA</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛒</span>
                <strong>E-commerce con ventas a particulares UE</strong>
              </div>
              <p className={styles.escenarioExample}>Desde julio 2021, si superas 10.000 € en ventas a particulares de la UE, debes aplicar el IVA del país del comprador. El sistema OSS (One-Stop-Shop) simplifica la declaración desde España.</p>
              <span className={styles.escenarioTip}>OSS si ventas UE &gt; 10.000 €/año</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔨</span>
                <strong>Reforma o construcción en vivienda</strong>
              </div>
              <p className={styles.escenarioExample}>Obras de reforma en vivienda habitual: 10% IVA si son obras de renovación/reparación. Obra nueva o primera entrega de edificios: 10% (vivienda) o 4% (VPO). Importante distinguir el tipo de obra para no aplicar mal el 21%.</p>
              <span className={styles.escenarioTip}>Reforma vivienda habitual: 10%</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre el IVA</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Tengo que cobrar IVA si soy autónomo?</h4>
              <p>Depende de tu actividad. La mayoría de autónomos deben cobrar IVA (21%, 10% o 4% según el servicio). Hay actividades exentas: médicos, profesores, seguros, arrendamiento de vivienda. Si estás exento, no cobras ni deduces IVA.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre IVA repercutido y soportado?</h4>
              <p>IVA repercutido: el que cobras tú a tus clientes en tus facturas (lo debes ingresar a Hacienda). IVA soportado: el que pagas tú a tus proveedores en tus compras (lo puedes deducir). En el modelo 303 pagas la diferencia: repercutido - soportado.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo se presenta el modelo 303?</h4>
              <p>Trimestralmente: 1T (1-20 abril), 2T (1-20 julio), 3T (1-20 octubre), 4T (1-30 enero del año siguiente). También hay una declaración resumen anual con el modelo 390 (hasta 30 de enero). Grandes empresas presentan mensualmente.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el recargo de equivalencia y a quién afecta?</h4>
              <p>Es un régimen especial para comerciantes minoristas personas físicas que venden a consumidores finales (no a empresas). No gestionan el IVA ellos mismos: su proveedor les repercute el IVA normal más el recargo. A cambio no presentan modelo 303.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo deducir el IVA de cualquier gasto?</h4>
              <p>Solo el IVA de gastos afectos a tu actividad económica. No puedes deducir el IVA de gastos personales, de vehículos que no sean 100% profesionales (la norma general es 50% deducible), ni de facturas sin tus datos o con datos incorrectos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si no cobro IVA cuando debería?</h4>
              <p>Hacienda puede considerar que el IVA estaba incluido en el precio y reclamarte la parte proporcional. Tendrás que ingresarlo de tu bolsillo. Además, puede imponerte recargos e intereses. Siempre es mejor facturar correctamente desde el inicio.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo funciona el IVA en facturas a clientes fuera de España?</h4>
              <p>Clientes en la UE con NIF intracomunitario (empresa o autónomo): factura sin IVA, el cliente lo autorepercute. Clientes particulares UE sin NIF: IVA del país destino (sistema OSS). Clientes fuera de la UE: factura exenta de IVA (exportación).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El IVA afecta al IRPF?</h4>
              <p className={styles.faqTip}>No directamente. El IVA es un impuesto de gestión: cobras el de tus clientes y pagas el de tus proveedores; la diferencia va a Hacienda. No es un ingreso ni un gasto propio. El IRPF se calcula sobre la base imponible (sin IVA). Sin embargo, el IVA no deducible (gastos personales) sí es gasto deducible en IRPF.</p>
            </div>
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
                <p>Consulta en la web de la AEAT o con un asesor qué tipo de IVA aplica a tus servicios o productos. La mayoría de servicios profesionales llevan 21%, pero puede haber excepciones según el epígrafe IAE.</p>
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
              <span className={styles.tipIcon}>🗂️</span>
              <strong>Digitaliza todas tus facturas</strong>
              <p>Usa apps como Holded, Quipu o Sage para registrar ingresos y gastos con IVA en tiempo real.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Pon alertas en el calendario</strong>
              <p>Los plazos de presentación del 303 son fijos cada trimestre. Saltártelos conlleva recargos automáticos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💰</span>
              <strong>Separa el IVA desde el primer día</strong>
              <p>Cuando cobres una factura, transfiere el 21% (o el tipo aplicable) a una cuenta de reserva para Hacienda.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧾</span>
              <strong>Exige siempre factura completa</strong>
              <p>Un ticket no sirve para deducir IVA. Pide siempre factura con tus datos cuando el gasto sea profesional.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🤝</span>
              <strong>Verifica NIF intracomunitario</strong>
              <p>Antes de emitir factura sin IVA a cliente UE, comprueba su NIF en el VIES (vies.ec.europa.eu).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>👨‍💼</span>
              <strong>Contrata un asesor fiscal</strong>
              <p>Para operaciones complejas (UE, exenciones, inmuebles), un asesor puede ahorrarte más de lo que cuesta.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes con el IVA que puedes evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Aplicar el tipo de IVA incorrecto (21% donde corresponde 10% o viceversa)</li>
            <li>No incluir el IVA en las facturas o emitirlas sin los datos fiscales obligatorios</li>
            <li>Deducir el IVA de gastos personales o de facturas sin tus datos fiscales</li>
            <li>Olvidar presentar el modelo 303 en plazo (recargo mínimo del 5% si pagas fuera de plazo)</li>
            <li>No verificar el NIF intracomunitario del cliente UE antes de emitir factura sin IVA</li>
            <li>Gastar el IVA cobrado antes de ingresarlo a Hacienda (ese dinero nunca fue tuyo)</li>
            <li>No conservar facturas durante 4 años (plazo de prescripción de Hacienda para revisarlas)</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-iva')} />

      <ShareCard appName="calculadora-iva" />
      <Footer appName="calculadora-iva" />
    </div>
  );
}
