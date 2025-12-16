'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraDonacionesCataluna.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, parseSpanishNumber } from '@/lib';

// ===== TIPOS =====
interface TramoTarifa {
  hasta: number;
  cuota: number;
  resto: number;
  tipo: number;
}

interface DetalleReduccion {
  tipo: string;
  base: number;
  importe: number;
  detalle: string;
}

interface Resultado {
  baseImponible: number;
  donacionesAcumuladas: number;
  baseAcumulada: number;
  reducciones: DetalleReduccion[];
  totalReducciones: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  cuotaTributaria: number;
  tarifaAplicada: string;
  detalleCalculo: string[];
}

// ===== CONSTANTES FISCALES CATALUÑA 2025 =====

// Tarifa general (cuando NO se aplica tarifa reducida)
const TARIFA_GENERAL: TramoTarifa[] = [
  { hasta: 50000, cuota: 0, resto: 50000, tipo: 7 },
  { hasta: 150000, cuota: 3500, resto: 100000, tipo: 11 },
  { hasta: 400000, cuota: 14500, resto: 250000, tipo: 17 },
  { hasta: 800000, cuota: 57000, resto: 400000, tipo: 24 },
  { hasta: Infinity, cuota: 153000, resto: Infinity, tipo: 32 },
];

// Tarifa reducida (grupos I y II con escritura pública)
const TARIFA_REDUCIDA: TramoTarifa[] = [
  { hasta: 200000, cuota: 0, resto: 200000, tipo: 5 },
  { hasta: 600000, cuota: 10000, resto: 400000, tipo: 7 },
  { hasta: Infinity, cuota: 38000, resto: Infinity, tipo: 9 },
];

// Coeficientes multiplicadores por patrimonio preexistente
const COEFICIENTES: Record<string, number[]> = {
  'I': [1.0000, 1.1000, 1.1500, 1.2000],
  'II': [1.0000, 1.1000, 1.1500, 1.2000],
  'III': [1.5882, 1.6676, 1.7471, 1.9059],
  'IV': [2.0000, 2.1000, 2.2000, 2.4000],
};

// Límites reducción primera vivienda
const LIMITES_PRIMERA_VIVIENDA = {
  menor36: 60000,      // Menores de 36 años
  mayor36: 30000,      // 36 años o más
  discapacidad65: 120000, // Discapacidad ≥65%
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
export default function CalculadoraDonacionesCatalunaPage() {
  // Estados del formulario
  const [importePrimeraVivienda, setImportePrimeraVivienda] = useState('');
  const [dineroPrimeraVivienda, setDineroPrimeraVivienda] = useState('');
  const [dineroReformas, setDineroReformas] = useState('');
  const [segundaVivienda, setSegundaVivienda] = useState('');
  const [dineroPagarImpuesto, setDineroPagarImpuesto] = useState('');
  const [otrosBienes, setOtrosBienes] = useState('');
  const [donacionesAnteriores, setDonacionesAnteriores] = useState('');

  const [escrituraPublica, setEscrituraPublica] = useState(true);
  const [grupoParentesco, setGrupoParentesco] = useState('');
  const [edadDonatario, setEdadDonatario] = useState('');
  const [ingresosDonatario, setIngresosDonatario] = useState('');
  const [patrimonioPreexistente, setPatrimonioPreexistente] = useState('1');
  const [discapacidad, setDiscapacidad] = useState('0');

  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Calcular total donación
  const totalDonacion = useMemo(() => {
    const valores = [
      importePrimeraVivienda,
      dineroPrimeraVivienda,
      dineroReformas,
      segundaVivienda,
      dineroPagarImpuesto,
      otrosBienes
    ];
    return valores.reduce((sum, val) => {
      const num = parseSpanishNumber(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [importePrimeraVivienda, dineroPrimeraVivienda, dineroReformas, segundaVivienda, dineroPagarImpuesto, otrosBienes]);

  // Obtener grupo base (I, II, III o IV)
  const getGrupoBase = (grupo: string): string => {
    if (grupo.startsWith('I-') || grupo === 'I') return 'I';
    if (grupo.startsWith('II-') || grupo === 'II') return 'II';
    if (grupo === 'III') return 'III';
    return 'IV';
  };

  // Calcular tarifa
  const calcularTarifa = (base: number, tarifa: TramoTarifa[]): number => {
    if (base <= 0) return 0;

    let baseRestante = base;
    let cuotaAcumulada = 0;

    for (const tramo of tarifa) {
      if (baseRestante <= 0) break;

      const baseEnTramo = Math.min(baseRestante, tramo.resto);

      if (base <= tramo.hasta || tramo.hasta === Infinity) {
        cuotaAcumulada = tramo.cuota + (baseEnTramo * tramo.tipo / 100);
        break;
      }

      baseRestante -= tramo.resto;
    }

    return cuotaAcumulada;
  };

  // Calcular reducciones
  const calcularReducciones = (): DetalleReduccion[] => {
    const reducciones: DetalleReduccion[] = [];
    const edad = parseSpanishNumber(edadDonatario) || 0;
    const ingresos = parseSpanishNumber(ingresosDonatario) || 0;
    const disc = parseInt(discapacidad) || 0;
    const grupoBase = getGrupoBase(grupoParentesco);

    // Total primera vivienda
    const totalPrimeraVivienda =
      (parseSpanishNumber(importePrimeraVivienda) || 0) +
      (parseSpanishNumber(dineroPrimeraVivienda) || 0) +
      (parseSpanishNumber(dineroReformas) || 0);

    // Reducción primera vivienda (95%)
    if (totalPrimeraVivienda > 0 && escrituraPublica) {
      // Verificar requisitos
      const cumpleEdad = edad <= 36 || disc >= 65;
      const cumpleIngresos = ingresos <= 36000;
      const cumpleParentesco = grupoBase === 'I' || grupoBase === 'II';

      if (cumpleEdad && cumpleIngresos && cumpleParentesco) {
        let limiteReduccion = LIMITES_PRIMERA_VIVIENDA.menor36;

        if (disc >= 65) {
          limiteReduccion = LIMITES_PRIMERA_VIVIENDA.discapacidad65;
        } else if (edad > 36) {
          limiteReduccion = LIMITES_PRIMERA_VIVIENDA.mayor36;
        }

        const reduccion95 = totalPrimeraVivienda * 0.95;
        const reduccionFinal = Math.min(reduccion95, limiteReduccion);

        reducciones.push({
          tipo: 'Primera vivienda habitual',
          base: totalPrimeraVivienda,
          importe: reduccionFinal,
          detalle: `95% sobre ${formatCurrency(totalPrimeraVivienda)}, límite ${formatCurrency(limiteReduccion)}`,
        });
      }
    }

    // Reducción por discapacidad (independiente de primera vivienda)
    if (disc >= 33 && disc < 65) {
      reducciones.push({
        tipo: 'Discapacidad 33%-64%',
        base: totalDonacion,
        importe: 245000,
        detalle: 'Reducción fija por discapacidad',
      });
    } else if (disc >= 65) {
      reducciones.push({
        tipo: 'Discapacidad ≥65%',
        base: totalDonacion,
        importe: 570000,
        detalle: 'Reducción fija por discapacidad',
      });
    }

    return reducciones;
  };

  // Función principal de cálculo
  const calcular = () => {
    if (!grupoParentesco || totalDonacion <= 0) {
      alert('Por favor, introduce el importe de la donación y selecciona el grupo de parentesco.');
      return;
    }

    const detalleCalculo: string[] = [];
    const grupoBase = getGrupoBase(grupoParentesco);

    // 1. Base imponible
    const baseImponible = totalDonacion;
    detalleCalculo.push(`Base imponible: ${formatCurrency(baseImponible)}`);

    // 2. Donaciones anteriores (últimos 3 años)
    const donacionesPrevias = parseSpanishNumber(donacionesAnteriores) || 0;
    const baseAcumulada = baseImponible + donacionesPrevias;
    if (donacionesPrevias > 0) {
      detalleCalculo.push(`Donaciones anteriores (3 años): ${formatCurrency(donacionesPrevias)}`);
      detalleCalculo.push(`Base acumulada: ${formatCurrency(baseAcumulada)}`);
    }

    // 3. Reducciones
    const reducciones = calcularReducciones();
    const totalReducciones = reducciones.reduce((sum, r) => sum + r.importe, 0);
    detalleCalculo.push(`Total reducciones: ${formatCurrency(totalReducciones)}`);

    // 4. Base liquidable
    const baseLiquidable = Math.max(0, baseAcumulada - totalReducciones);
    detalleCalculo.push(`Base liquidable: ${formatCurrency(baseLiquidable)}`);

    // 5. Determinar tarifa a aplicar
    const aplicaTarifaReducida = escrituraPublica && (grupoBase === 'I' || grupoBase === 'II');
    const tarifa = aplicaTarifaReducida ? TARIFA_REDUCIDA : TARIFA_GENERAL;
    const tarifaAplicada = aplicaTarifaReducida ? 'Tarifa reducida (5%-9%)' : 'Tarifa general (7%-32%)';
    detalleCalculo.push(`Tarifa aplicada: ${tarifaAplicada}`);

    // 6. Cuota íntegra
    let cuotaIntegra = calcularTarifa(baseLiquidable, tarifa);

    // Si hay donaciones anteriores, restar la cuota correspondiente
    if (donacionesPrevias > 0) {
      const cuotaDonacionesPrevias = calcularTarifa(donacionesPrevias, tarifa);
      cuotaIntegra = cuotaIntegra - cuotaDonacionesPrevias;
    }
    detalleCalculo.push(`Cuota íntegra: ${formatCurrency(cuotaIntegra)}`);

    // 7. Coeficiente multiplicador
    const indicePatrimonio = parseInt(patrimonioPreexistente) - 1;
    const coeficiente = COEFICIENTES[grupoBase][indicePatrimonio];
    detalleCalculo.push(`Coeficiente multiplicador (Grupo ${grupoBase}): ${coeficiente.toFixed(4)}`);

    // 8. Cuota tributaria
    const cuotaTributaria = cuotaIntegra * coeficiente;
    detalleCalculo.push(`Cuota tributaria: ${formatCurrency(cuotaTributaria)}`);

    setResultado({
      baseImponible,
      donacionesAcumuladas: donacionesPrevias,
      baseAcumulada,
      reducciones,
      totalReducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficienteMultiplicador: coeficiente,
      cuotaTributaria,
      tarifaAplicada,
      detalleCalculo,
    });
  };

  // Limpiar formulario
  const limpiar = () => {
    setImportePrimeraVivienda('');
    setDineroPrimeraVivienda('');
    setDineroReformas('');
    setSegundaVivienda('');
    setDineroPagarImpuesto('');
    setOtrosBienes('');
    setDonacionesAnteriores('');
    setEscrituraPublica(true);
    setGrupoParentesco('');
    setEdadDonatario('');
    setIngresosDonatario('');
    setPatrimonioPreexistente('1');
    setDiscapacidad('0');
    setResultado(null);
  };

  // Verificar requisitos primera vivienda
  const verificarRequisitos = useMemo(() => {
    const totalPV = (parseSpanishNumber(importePrimeraVivienda) || 0) + (parseSpanishNumber(dineroPrimeraVivienda) || 0) + (parseSpanishNumber(dineroReformas) || 0);
    if (totalPV <= 0) return null;

    const edad = parseSpanishNumber(edadDonatario) || 0;
    const ingresos = parseSpanishNumber(ingresosDonatario) || 0;
    const disc = parseInt(discapacidad) || 0;
    const grupoBase = getGrupoBase(grupoParentesco);

    return {
      escritura: escrituraPublica,
      edad: edad <= 36 || disc >= 65,
      ingresos: ingresos <= 36000,
      parentesco: grupoBase === 'I' || grupoBase === 'II',
    };
  }, [importePrimeraVivienda, dineroPrimeraVivienda, dineroReformas, edadDonatario, ingresosDonatario, discapacidad, grupoParentesco, escrituraPublica]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏠 Calculadora Donaciones Cataluña 2025</h1>
        <p className={styles.subtitle}>
          Calcula el Impuesto de Donaciones con las reducciones y tarifa reducida de la normativa catalana
        </p>
      </header>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta calculadora es una <strong>herramienta orientativa</strong>. Los resultados son estimaciones
          basadas en la normativa vigente del Impuesto sobre Donaciones en Cataluña, pero <strong>NO sustituyen
          el asesoramiento fiscal profesional</strong>.
        </p>
        <ul>
          <li><strong>Casos especiales no incluidos:</strong> empresas familiares, explotaciones agrarias, bienes patrimonio cultural</li>
          <li>Consulte con un asesor fiscal antes de tomar decisiones</li>
          <li>Verifique los requisitos con la Agència Tributària de Catalunya</li>
        </ul>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de Inputs */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>📝 Datos de la Donación</h2>

          {/* Desglose donación */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>🏠 Primera Vivienda Habitual</h3>
            <p className={styles.seccionNota}>Reducción del 95% con límites según edad</p>

            <InputCampo
              label="Vivienda (inmueble)"
              value={importePrimeraVivienda}
              onChange={setImportePrimeraVivienda}
              icon="🏡"
              helperText="Valor del inmueble donado"
            />
            <InputCampo
              label="Dinero para compra vivienda"
              value={dineroPrimeraVivienda}
              onChange={setDineroPrimeraVivienda}
              icon="💵"
              helperText="Escritura en 1 mes, compra en 3 meses"
            />
            <InputCampo
              label="Dinero para reformas/mobiliario"
              value={dineroReformas}
              onChange={setDineroReformas}
              icon="🔧"
            />
          </div>

          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>📦 Otros Bienes</h3>
            <p className={styles.seccionNota}>Sin reducción especial por primera vivienda</p>

            <InputCampo
              label="Segunda vivienda / Otros inmuebles"
              value={segundaVivienda}
              onChange={setSegundaVivienda}
              icon="🏢"
            />
            <InputCampo
              label="Dinero para pagar el impuesto"
              value={dineroPagarImpuesto}
              onChange={setDineroPagarImpuesto}
              icon="📋"
            />
            <InputCampo
              label="Otros bienes o dinero"
              value={otrosBienes}
              onChange={setOtrosBienes}
              icon="💰"
            />
          </div>

          {/* Total donación */}
          <div className={styles.totalDonacion}>
            <span>TOTAL DONACIÓN</span>
            <span>{formatCurrency(totalDonacion)}</span>
          </div>

          {/* Escritura pública */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>📜 Formalización</h3>

            <div className={styles.inputGroup}>
              <label className={styles.label}>¿Se formalizará en escritura pública?</label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="escrituraSi"
                    name="escritura"
                    checked={escrituraPublica}
                    onChange={() => setEscrituraPublica(true)}
                  />
                  <label htmlFor="escrituraSi">Sí (recomendado)</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="escrituraNo"
                    name="escritura"
                    checked={!escrituraPublica}
                    onChange={() => setEscrituraPublica(false)}
                  />
                  <label htmlFor="escrituraNo">No</label>
                </div>
              </div>
              <span className={styles.helperText}>
                Necesaria para reducciones y tarifa reducida (grupos I y II)
              </span>
            </div>
          </div>

          {/* Parentesco */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>👥 Relación Donante-Donatario</h3>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Grupo de parentesco</label>
              <select
                className={styles.select}
                value={grupoParentesco}
                onChange={(e) => setGrupoParentesco(e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="I-descendiente">Grupo I - Descendientes menores de 21 años</option>
                <option value="II-hijo">Grupo II - Hijos de 21 años o más</option>
                <option value="II-conyuge">Grupo II - Cónyuge o pareja estable</option>
                <option value="II-ascendiente">Grupo II - Padres o ascendientes</option>
                <option value="III">Grupo III - Hermanos, tíos, sobrinos</option>
                <option value="IV">Grupo IV - Primos, otros, extraños</option>
              </select>
            </div>
          </div>

          {/* Datos donatario */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>👤 Datos del Donatario</h3>

            <InputCampo
              label="Edad del donatario"
              value={edadDonatario}
              onChange={setEdadDonatario}
              placeholder="Ej: 32"
              helperText="Máx. 36 años para reducción primera vivienda (salvo discapacidad ≥65%)"
            />

            <InputCampo
              label="Base imponible IRPF (€)"
              value={ingresosDonatario}
              onChange={setIngresosDonatario}
              placeholder="Ej: 25000"
              helperText="Máx. 36.000€ para reducción primera vivienda"
            />

            <div className={styles.inputGroup}>
              <label className={styles.label}>Patrimonio preexistente</label>
              <select
                className={styles.select}
                value={patrimonioPreexistente}
                onChange={(e) => setPatrimonioPreexistente(e.target.value)}
              >
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
                  <input type="radio" id="disc0" name="discapacidad" value="0" checked={discapacidad === '0'} onChange={() => setDiscapacidad('0')} />
                  <label htmlFor="disc0">No</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc33" name="discapacidad" value="33" checked={discapacidad === '33'} onChange={() => setDiscapacidad('33')} />
                  <label htmlFor="disc33">33%-64%</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc65" name="discapacidad" value="65" checked={discapacidad === '65'} onChange={() => setDiscapacidad('65')} />
                  <label htmlFor="disc65">≥65%</label>
                </div>
              </div>
            </div>
          </div>

          {/* Donaciones anteriores */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>📅 Donaciones Anteriores</h3>
            <InputCampo
              label="Total donaciones últimos 3 años"
              value={donacionesAnteriores}
              onChange={setDonacionesAnteriores}
              placeholder="0,00"
              helperText="Del mismo donante al mismo donatario"
            />
          </div>

          {/* Verificación requisitos primera vivienda */}
          {verificarRequisitos && (
            <div className={styles.requisitosCheck}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Requisitos reducción primera vivienda:</h4>
              <div className={styles.requisitoItem}>
                <span className={verificarRequisitos.escritura ? styles.requisitoOk : styles.requisitoNo}>
                  {verificarRequisitos.escritura ? '✓' : '✗'}
                </span>
                Escritura pública
              </div>
              <div className={styles.requisitoItem}>
                <span className={verificarRequisitos.edad ? styles.requisitoOk : styles.requisitoNo}>
                  {verificarRequisitos.edad ? '✓' : '✗'}
                </span>
                Edad ≤36 años (o discapacidad ≥65%)
              </div>
              <div className={styles.requisitoItem}>
                <span className={verificarRequisitos.ingresos ? styles.requisitoOk : styles.requisitoNo}>
                  {verificarRequisitos.ingresos ? '✓' : '✗'}
                </span>
                Ingresos ≤36.000€
              </div>
              <div className={styles.requisitoItem}>
                <span className={verificarRequisitos.parentesco ? styles.requisitoOk : styles.requisitoNo}>
                  {verificarRequisitos.parentesco ? '✓' : '✗'}
                </span>
                Grupo I o II (familiares directos)
              </div>
            </div>
          )}

          <button onClick={calcular} className={styles.btnPrimary}>
            Calcular Impuesto
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar Formulario
          </button>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>📊 Resultado del Cálculo</h2>

          {!resultado ? (
            <div className={styles.infoBox}>
              <h4>Introduce los datos de la donación</h4>
              <p>Completa el formulario y pulsa &quot;Calcular Impuesto&quot; para ver el resultado.</p>
            </div>
          ) : (
            <>
              {/* Resultado destacado */}
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Impuesto a Pagar</span>
                <span className={styles.resultadoValor}>{formatCurrency(resultado.cuotaTributaria)}</span>
                <span className={styles.resultadoNota}>{resultado.tarifaAplicada}</span>
              </div>

              {/* Desglose base imponible */}
              <div className={styles.desglose}>
                <h4 className={styles.desgloseTitle}>Base Imponible</h4>
                <div className={styles.lineaDesglose}>
                  <span>Total donación</span>
                  <span>{formatCurrency(resultado.baseImponible)}</span>
                </div>
                {resultado.donacionesAcumuladas > 0 && (
                  <div className={styles.lineaDesglose}>
                    <span>+ Donaciones anteriores (3 años)</span>
                    <span>{formatCurrency(resultado.donacionesAcumuladas)}</span>
                  </div>
                )}
                <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                  <span>Base acumulada</span>
                  <span>{formatCurrency(resultado.baseAcumulada)}</span>
                </div>
              </div>

              {/* Reducciones */}
              {resultado.reducciones.length > 0 && (
                <div className={styles.desglose}>
                  <h4 className={styles.desgloseTitle}>Reducciones Aplicadas</h4>
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

              {/* Cálculo cuota */}
              <div className={styles.desglose}>
                <h4 className={styles.desgloseTitle}>Liquidación del Impuesto</h4>
                <div className={styles.lineaDesglose}>
                  <span>Cuota íntegra</span>
                  <span>{formatCurrency(resultado.cuotaIntegra)}</span>
                </div>
                <div className={styles.lineaDesglose}>
                  <span>Coeficiente multiplicador</span>
                  <span>×{resultado.coeficienteMultiplicador.toFixed(4)}</span>
                </div>
                <div className={styles.lineaSeparador} />
                <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                  <span>CUOTA TRIBUTARIA</span>
                  <span>{formatCurrency(resultado.cuotaTributaria)}</span>
                </div>
              </div>

              {/* Info adicional */}
              <div className={styles.infoBox}>
                <h4>ℹ️ Información</h4>
                <ul>
                  <li>El plazo de presentación es de <strong>1 mes</strong> desde la donación</li>
                  <li>Si hay vivienda, mantenerla <strong>5 años</strong> como habitual</li>
                  <li>Modelo a presentar: <strong>651</strong> ante la Agència Tributària de Catalunya</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Donaciones en Cataluña?"
        subtitle="Guía completa sobre reducciones, tarifas y requisitos del Impuesto de Donaciones"
      >
        <section className={styles.guideSection}>
          <h2>Guía del Impuesto de Donaciones en Cataluña</h2>
          <p className={styles.introParagraph}>
            El Impuesto de Donaciones en Cataluña cuenta con beneficios fiscales significativos,
            especialmente para familiares directos y adquisición de primera vivienda habitual.
          </p>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>🏠 Reducción Primera Vivienda</h4>
              <ul>
                <li><strong>95% de reducción</strong> sobre el valor</li>
                <li>Menores 36 años: límite 60.000€</li>
                <li>36 años o más: límite 30.000€</li>
                <li>Discapacidad ≥65%: límite 120.000€</li>
                <li>Requisito: ingresos ≤36.000€/año</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>📊 Tarifa Reducida</h4>
              <ul>
                <li>Solo grupos I y II con escritura pública</li>
                <li>Hasta 200.000€: 5%</li>
                <li>200.000€ - 600.000€: 7%</li>
                <li>Más de 600.000€: 9%</li>
                <li>Vs. tarifa general: 7%-32%</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>👥 Grupos de Parentesco</h4>
              <ul>
                <li><strong>Grupo I:</strong> Descendientes &lt;21 años</li>
                <li><strong>Grupo II:</strong> Cónyuge, hijos ≥21, padres</li>
                <li><strong>Grupo III:</strong> Hermanos, tíos, sobrinos</li>
                <li><strong>Grupo IV:</strong> Primos, extraños</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>♿ Reducciones Discapacidad</h4>
              <ul>
                <li>33%-64%: reducción 245.000€</li>
                <li>≥65%: reducción 570.000€</li>
                <li>Compatibles con otras reducciones</li>
                <li>Sin límite de edad para primera vivienda</li>
              </ul>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Es obligatoria la escritura pública?</summary>
              <p>
                No es legalmente obligatoria para dinero, pero sí es <strong>necesaria</strong> para aplicar
                la tarifa reducida (5%-9%) en lugar de la general (7%-32%), y para las reducciones por
                primera vivienda. Para inmuebles siempre es obligatoria.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuánto tiempo debo mantener la vivienda?</summary>
              <p>
                Para conservar las reducciones aplicadas, debe mantener la vivienda como <strong>residencia
                habitual durante 5 años</strong>. Si vende antes, deberá devolver el beneficio fiscal obtenido.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Se acumulan las donaciones?</summary>
              <p>
                Sí, las donaciones del <strong>mismo donante al mismo donatario</strong> en los últimos
                3 años se acumulan para determinar el tipo impositivo aplicable.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuál es el plazo para pagar?</summary>
              <p>
                El plazo es de <strong>1 mes</strong> desde la fecha de la donación. Se presenta el
                modelo 651 ante la Agència Tributària de Catalunya.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-donaciones-cataluna')}
        title="Herramientas fiscales"
        icon="⚖️"
      />

      <Footer appName="calculadora-donaciones-cataluna" />
    </div>
  );
}
