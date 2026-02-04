'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from './CalculadoraIVA.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
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
        <h2>Tipos de IVA en España (2025)</h2>
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
        collapsible={true}
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

      {/* ========== SECCIÓN 2: TABLA COMPARATIVA ========== */}
      <section className={styles.comparativaSection}>
        <h2>📊 Comparativa de tipos de IVA en España</h2>
        <p className={styles.comparativaSubtitle}>
          Descubre qué tipo de IVA aplica a cada producto o servicio según la normativa española
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de IVA</th>
                <th>Porcentaje</th>
                <th>Ejemplos de productos/servicios</th>
                <th>Cuándo aplicarlo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>General</strong></td>
                <td><strong>21%</strong></td>
                <td>Electrónica, ropa, muebles, combustible, automóviles, servicios profesionales, reformas</td>
                <td>Por defecto, si no aplica tipo reducido o superreducido</td>
              </tr>
              <tr>
                <td><strong>Reducido</strong></td>
                <td><strong>10%</strong></td>
                <td>Alimentación general, transporte de viajeros, hostelería, espectáculos culturales, vivienda nueva</td>
                <td>Bienes de primera necesidad no básicos y servicios esenciales</td>
              </tr>
              <tr>
                <td><strong>Superreducido</strong></td>
                <td><strong>4%</strong></td>
                <td>Pan, leche, huevos, frutas, verduras, cereales, quesos, libros, periódicos, medicamentos, prótesis</td>
                <td>Productos básicos de alimentación, cultura y salud</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========== SECCIÓN 3: CASOS DE USO ========== */}
      <section className={styles.escenariosSection}>
        <h2>💼 Casos de uso reales del IVA</h2>
        <p className={styles.escenariosSubtitle}>
          Situaciones prácticas donde necesitas calcular IVA correctamente
        </p>

        <div className={styles.escenariosGrid}>
          {/* Caso 1: Freelance facturando */}
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍💻</span>
              <h3>Freelance facturando servicios</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Ejemplo:</p>
              <code>
                {'Servicio de diseño: 1.000 €\n'}
                {'IVA (21%): +210 €\n'}
                {'Total factura: 1.210 €'}
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Tip:</strong> Los autónomos deben repercutir el IVA (21% general) en sus facturas y declararlo trimestralmente en el modelo 303. El cliente puede deducirlo si es empresa.
            </p>
          </div>

          {/* Caso 2: E-commerce */}
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🛒</span>
              <h3>Tienda online (B2C)</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Ejemplo:</p>
              <code>
                {'Producto electrónica: 500 € + IVA\n'}
                {'IVA (21%): +105 €\n'}
                {'Total a cobrar: 605 €'}
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Tip:</strong> En e-commerce B2C dentro de España, siempre incluye el IVA en el precio mostrado. Para ventas intracomunitarias (UE), el IVA depende del volumen de ventas y el país de destino.
            </p>
          </div>

          {/* Caso 3: Importación */}
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📦</span>
              <h3>Importación desde fuera de la UE</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Ejemplo:</p>
              <code>
                {'Producto + Aduanas: 800 €\n'}
                {'IVA importación (21%): +168 €\n'}
                {'Total a pagar: 968 €'}
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Tip:</strong> Al importar de fuera de la UE, pagas IVA de importación en la aduana española (21% general). Este IVA es deducible si eres autónomo o empresa. Si importas desde China/USA, ten en cuenta también aranceles.
            </p>
          </div>

          {/* Caso 4: Intracomunitario */}
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🇪🇺</span>
              <h3>Operación intracomunitaria (B2B)</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Ejemplo:</p>
              <code>
                {'Venta a empresa Francia: 2.000 €\n'}
                {'IVA: 0% (inversión del sujeto pasivo)\n'}
                {'Total factura: 2.000 €'}
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Tip:</strong> Ventas B2B dentro de la UE (con NIF-IVA válido del cliente) van sin IVA español. El comprador aplica el IVA de su país. Debes declararlo en el modelo 349 (operaciones intracomunitarias).
            </p>
          </div>

          {/* Caso 5: Recargo de equivalencia */}
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏪</span>
              <h3>Comercio minorista (recargo equivalencia)</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Ejemplo:</p>
              <code>
                {'Base: 100 €\n'}
                {'IVA (21%) + Rec. Eq. (5,2%): +26,20 €\n'}
                {'Total: 126,20 €'}
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Tip:</strong> Los comerciantes minoristas en recargo de equivalencia no liquidan IVA trimestralmente, sino que sus proveedores les cargan IVA + recargo. No emiten facturas con IVA desglosado (salvo que el cliente lo solicite).
            </p>
          </div>
        </div>
      </section>

      {/* ========== SECCIÓN 4: FAQ ========== */}
      <section className={styles.faqSection}>
        <h2>❓ Preguntas frecuentes sobre el IVA en España</h2>

        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuándo debo aplicar el 21%, 10% o 4% de IVA?</h4>
            <p>
              El <strong>21% (general)</strong> aplica por defecto a todos los productos y servicios que no estén expresamente en los tipos reducidos.
              El <strong>10% (reducido)</strong> aplica a alimentos no básicos, transporte, hostelería, vivienda nueva y cultura.
              El <strong>4% (superreducido)</strong> se reserva para productos básicos: pan, leche, frutas, verduras, libros, periódicos y medicamentos de uso humano.
            </p>
            <div className={styles.faqTip}>
              <strong>Consulta la Ley del IVA</strong> (Ley 37/1992) o el listado oficial de Hacienda para casos específicos. Si tienes dudas, consulta con un asesor fiscal.
            </div>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué es el modelo 303 y cuándo debo presentarlo?</h4>
            <p>
              El <strong>modelo 303</strong> es la autoliquidación trimestral del IVA que deben presentar todos los autónomos y empresas en régimen general de IVA.
              Se presenta en los primeros 20 días naturales de abril, julio, octubre y enero (correspondiente al trimestre anterior).
              Declaras el IVA repercutido (cobrado a clientes) menos el IVA soportado (pagado a proveedores), y pagas o recibes la diferencia.
            </p>
            <p>
              <strong>Ejemplo:</strong> Has facturado 10.000 € + 2.100 € IVA (repercutido). Has pagado 3.000 € + 630 € IVA (soportado). Resultado: debes pagar 2.100 - 630 = 1.470 € a Hacienda.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Puedo deducir el IVA que pago como autónomo?</h4>
            <p>
              <strong>Sí</strong>, si estás en régimen general de IVA, puedes deducir el IVA que pagas en compras y gastos relacionados con tu actividad (IVA soportado).
              Este IVA se resta del IVA que cobras a tus clientes (IVA repercutido) en el modelo 303. Si el IVA soportado es mayor, Hacienda te devuelve la diferencia.
            </p>
            <p>
              <strong>Importante:</strong> Solo es deducible el IVA de gastos relacionados con la actividad empresarial/profesional. Gastos personales NO son deducibles.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué pasa si me olvido de declarar el IVA?</h4>
            <p>
              Si no presentas el modelo 303 en plazo, Hacienda aplica <strong>recargos automáticos</strong>: 1% si te retrasas hasta 3 meses, 15% de 3 a 12 meses, y 20% si superas 12 meses.
              Además, pueden aplicarse <strong>sanciones adicionales</strong> de hasta el 150% de la cuota no ingresada si Hacienda considera que fue ocultación deliberada.
            </p>
            <div className={styles.faqTip}>
              Si te das cuenta del error, presenta una <strong>declaración complementaria</strong> cuanto antes para minimizar recargos e intereses.
            </div>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Cómo afecta el IVA a las ventas internacionales?</h4>
            <p>
              <strong>Ventas a empresas UE (B2B):</strong> Sin IVA español (inversión del sujeto pasivo). Debes validar el NIF-IVA del cliente y declararlo en el modelo 349.
              <strong>Ventas a particulares UE (B2C):</strong> Aplica el IVA español hasta cierto umbral de ventas (10.000 €/año). Por encima, aplicas el IVA del país de destino.
              <strong>Ventas fuera de la UE:</strong> Sin IVA (exportación). Debes conservar documentación aduanera que acredite la salida de la mercancía.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué es el régimen de recargo de equivalencia?</h4>
            <p>
              Es un régimen especial para <strong>comerciantes minoristas</strong> (no fabricantes ni mayoristas). En este régimen:
            </p>
            <p>
              • NO liquidan IVA trimestralmente (no presentan modelo 303)<br />
              • Sus proveedores les cargan IVA + recargo de equivalencia (5,2% adicional en tipo general)<br />
              • NO pueden deducir el IVA soportado<br />
              • NO emiten facturas con IVA desglosado (salvo que el cliente lo solicite expresamente)
            </p>
            <p>
              Es <strong>obligatorio</strong> para personas físicas con actividades comerciales minoristas, salvo excepciones (vehículos, joyería, productos de más de 3.005,06 €, etc.).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Debo cobrar IVA si facturo a empresas extranjeras?</h4>
            <p>
              Depende del país y si es B2B o B2C:
            </p>
            <p>
              <strong>Empresas de la UE (B2B):</strong> NO cobres IVA español. Aplica inversión del sujeto pasivo. Valida su NIF-IVA en VIES y anota "Inversión del sujeto pasivo - Art. 196 Directiva 2006/112/CE" en la factura.
              <strong>Empresas fuera de la UE:</strong> Generalmente sin IVA (exportación de servicios). Consulta las reglas de localización del IVA para cada tipo de servicio.
              <strong>Particulares (B2C):</strong> Reglas complejas según país y tipo de servicio. Consulta con asesor fiscal.
            </p>
          </div>
        </div>
      </section>

      {/* ========== SECCIÓN 5: GUÍA PASO A PASO ========== */}
      <section className={styles.guideSection}>
        <h2>📋 Guía paso a paso: Cómo calcular y declarar el IVA correctamente</h2>

        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Identifica el tipo de IVA que aplica</h4>
              <p>
                Determina si tu producto o servicio es <strong>21% (general)</strong>, <strong>10% (reducido)</strong> o <strong>4% (superreducido)</strong>.
                Consulta la tabla comparativa arriba o la Ley del IVA. Si tienes dudas, aplica el 21% por defecto y consulta con un asesor fiscal antes de emitir la factura.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Emite la factura con el IVA desglosado</h4>
              <p>
                Toda factura debe incluir: <strong>base imponible</strong> (precio sin IVA), <strong>tipo de IVA aplicado</strong> (%), <strong>cuota de IVA</strong> (€) y <strong>total con IVA</strong>.
                Ejemplo: Base 100 €, IVA 21% = 21 €, Total 121 €. Si la venta es intracomunitaria B2B, indica "Inversión del sujeto pasivo" y no cargues IVA.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Registra todas tus facturas emitidas y recibidas</h4>
              <p>
                Utiliza un <strong>software de contabilidad</strong> (Holded, Contasimple, Sage, etc.) o una <strong>hoja de cálculo</strong> para llevar el control del IVA repercutido (ventas) y IVA soportado (compras).
                Conserva todas las facturas originales (físicas o electrónicas) durante <strong>al menos 4 años</strong> (obligación legal).
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Calcula la liquidación trimestral del IVA</h4>
              <p>
                Al final del trimestre (31 de marzo, 30 de junio, 30 de septiembre, 31 de diciembre), suma todo el <strong>IVA repercutido</strong> (cobrado a clientes) y resta el <strong>IVA soportado</strong> (pagado a proveedores).
                Si el resultado es positivo, debes pagar a Hacienda. Si es negativo, puedes compensarlo en el siguiente trimestre o solicitar la devolución.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Presenta el modelo 303 dentro de plazo</h4>
              <p>
                Accede a la <strong>Sede Electrónica de la AEAT</strong> con certificado digital o Cl@ve PIN. Rellena el modelo 303 con los datos del trimestre (IVA repercutido, IVA soportado, resultado a ingresar o a compensar).
                Plazos: <strong>1-20 de abril, julio, octubre y enero</strong>. Si el día 20 es festivo, se traslada al siguiente hábil. Paga con domiciliación bancaria, tarjeta o NRC.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h4>Presenta el modelo 390 (resumen anual)</h4>
              <p>
                Al acabar el año, presenta el <strong>modelo 390</strong> (resumen anual de IVA) antes del <strong>30 de enero</strong> del año siguiente.
                Es un resumen informativo de los 4 trimestres del año. No se paga nada, pero es obligatorio. Si tienes operaciones intracomunitarias, presenta también el <strong>modelo 349</strong> (mensual o trimestral según volumen).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECCIÓN 6: MEJORES PRÁCTICAS ========== */}
      <section className={styles.tipsSection}>
        <h2>✅ Mejores prácticas para gestionar el IVA como autónomo o empresa</h2>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📁</span>
            <h4>Archiva todas las facturas digitalmente</h4>
            <p>
              Guarda copias digitales de facturas emitidas y recibidas en carpetas organizadas por año y trimestre. Usa nombres descriptivos (ej: 2025-T1-Facturas-Emitidas.zip). Conserva durante 4 años mínimo.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💻</span>
            <h4>Usa software de facturación y contabilidad</h4>
            <p>
              Herramientas como Holded, Contasimple o Sage automatizan el cálculo del IVA, generan el modelo 303 y sincronizan con tu banco. Ahorra tiempo y reduce errores humanos.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📅</span>
            <h4>Configura recordatorios de plazos fiscales</h4>
            <p>
              Añade alertas en tu calendario para el 15 de abril, julio, octubre y enero (5 días antes del plazo). Presentar fuera de plazo genera recargos automáticos del 1-20%.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>✅</span>
            <h4>Valida NIFs-IVA en operaciones intracomunitarias</h4>
            <p>
              Antes de emitir una factura B2B sin IVA a la UE, verifica el NIF-IVA del cliente en el sistema VIES (web de la Comisión Europea). Si no es válido, debes cobrar IVA español.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💶</span>
            <h4>Separa el IVA cobrado en una cuenta aparte</h4>
            <p>
              Método recomendado: cuando cobres una factura, transfiere el 21% del total a una cuenta de ahorro. Así tendrás el dinero disponible cuando llegue la liquidación trimestral.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📞</span>
            <h4>Consulta con un asesor fiscal ante dudas</h4>
            <p>
              El IVA tiene muchas excepciones y reglas específicas. Si no estás seguro del tipo de IVA a aplicar o cómo declarar una operación, consulta con un gestor o asesor fiscal. Vale la pena.
            </p>
          </div>
        </div>
      </section>

      {/* ========== SECCIÓN 7: WARNING BOX ========== */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <h3>Errores fiscales comunes que generan sanciones de la AEAT</h3>
        </div>

        <ul className={styles.warningList}>
          <li>
            <strong>Aplicar el tipo de IVA incorrecto</strong> (ej: 10% cuando corresponde 21%): Si Hacienda detecta que has aplicado un tipo reducido cuando no correspondía, te requerirá la diferencia más intereses de demora y posible sanción del 50-150% de la cuota no ingresada.
          </li>
          <li>
            <strong>No presentar el modelo 303 en plazo</strong>: Recargos automáticos del 1% (hasta 3 meses), 15% (3-12 meses) o 20% (más de 12 meses) sobre la cuota a ingresar. Si el resultado era a devolver, sanción de 100-200 €.
          </li>
          <li>
            <strong>No conservar las facturas justificativas</strong>: Si en una inspección de Hacienda no puedes justificar el IVA soportado deducido, te anularán esas deducciones y pagarás la diferencia más intereses y sanción del 50%.
          </li>
          <li>
            <strong>Deducir IVA de gastos no relacionados con la actividad</strong>: Gastos personales (comida familiar, ropa, viajes no justificados) NO son deducibles. Si Hacienda lo detecta, anula la deducción y sanciona del 50-150%.
          </li>
          <li>
            <strong>No validar el NIF-IVA en operaciones intracomunitarias</strong>: Si facturas a una empresa UE sin IVA pero su NIF-IVA no era válido, deberías haber cobrado IVA español. Hacienda te exigirá la cuota no repercutida más sanción.
          </li>
          <li>
            <strong>No declarar operaciones intracomunitarias en el modelo 349</strong>: Si tienes ventas o compras intracomunitarias B2B y no las declaras en el modelo 349, Hacienda puede sancionarte con 300-6.000 € por trimestre no presentado.
          </li>
          <li>
            <strong>Presentar declaraciones con datos incorrectos deliberadamente</strong>: Si Hacienda considera que has ocultado ventas o inflado gastos de forma intencionada, la sanción puede llegar al 150% de la cuota defraudada, más la apertura de un expediente penal si supera 120.000 €.
          </li>
          <li>
            <strong>No emitir factura en operaciones superiores a 3.000 €</strong>: Es obligatorio emitir factura para cualquier operación B2B y para B2C si supera 3.000 €. No hacerlo puede generar sanción de 150 € por factura no emitida (mínimo) o del 1-2% del importe no facturado.
          </li>
        </ul>
      </div>

      <RelatedApps apps={getRelatedApps('calculadora-iva')} />

      <Footer appName="calculadora-iva" />
    </div>
  );
}
