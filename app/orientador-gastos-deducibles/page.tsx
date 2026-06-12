'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorGastosDeducibles.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Base de datos de gastos deducibles
const gastosDB = {
  '100': {
    titulo: 'Gastos 100% Deducibles',
    descripcion: 'Gastos exclusivamente relacionados con tu actividad profesional',
    color: 'success',
    items: [
      { id: 'cuota_autonomos', nombre: 'Cuota de autónomos (Seguridad Social)', ejemplo: 300 },
      { id: 'alquiler_local', nombre: 'Alquiler de local u oficina', ejemplo: 500 },
      { id: 'coworking', nombre: 'Coworking o espacio de trabajo compartido', ejemplo: 200 },
      { id: 'asesoria', nombre: 'Asesoría fiscal y contable', ejemplo: 100 },
      { id: 'software', nombre: 'Software y licencias profesionales', ejemplo: 50 },
      { id: 'ordenador', nombre: 'Equipos informáticos y electrónica', ejemplo: 0 },
      { id: 'material_oficina', nombre: 'Material de oficina y papelería', ejemplo: 30 },
      { id: 'formacion', nombre: 'Cursos y formación relacionada', ejemplo: 50 },
      { id: 'publicidad', nombre: 'Publicidad y marketing (Ads, redes)', ejemplo: 100 },
      { id: 'web_hosting', nombre: 'Hosting web y dominio', ejemplo: 15 },
      { id: 'seguros_profesional', nombre: 'Seguro responsabilidad civil', ejemplo: 30 },
      { id: 'colegio_profesional', nombre: 'Cuotas colegios profesionales', ejemplo: 0 },
      { id: 'colaboradores', nombre: 'Honorarios a colaboradores externos', ejemplo: 0 },
      { id: 'transporte_trabajo', nombre: 'Desplazamientos profesionales justificados', ejemplo: 50 },
    ]
  },
  '50': {
    titulo: 'Gastos 50% Deducibles',
    descripcion: 'Gastos con uso mixto personal/profesional habitual',
    color: 'warning',
    items: [
      { id: 'movil', nombre: 'Teléfono móvil (línea mixta)', ejemplo: 40 },
      { id: 'internet_casa', nombre: 'Internet en casa (si teletrabajas)', ejemplo: 50 },
      { id: 'comidas_cliente', nombre: 'Comidas con clientes (justificadas)', ejemplo: 50 },
      { id: 'vehiculo_mixto', nombre: 'Mantenimiento vehículo (con km profesionales)', ejemplo: 0 },
      { id: 'gasolina_mixta', nombre: 'Gasolina vehículo mixto (con registro)', ejemplo: 0 },
    ]
  },
  '30': {
    titulo: 'Gastos con Afectación (30%)',
    descripcion: 'Gastos de vivienda habitual si trabajas desde casa',
    color: 'info',
    items: [
      { id: 'luz_casa', nombre: 'Luz (vivienda habitual)', ejemplo: 80 },
      { id: 'agua_casa', nombre: 'Agua (vivienda habitual)', ejemplo: 30 },
      { id: 'gas_casa', nombre: 'Gas/Calefacción (vivienda habitual)', ejemplo: 50 },
      { id: 'comunidad', nombre: 'Gastos de comunidad', ejemplo: 60 },
      { id: 'ibi', nombre: 'IBI (Impuesto Bienes Inmuebles)', ejemplo: 0 },
      { id: 'seguro_hogar', nombre: 'Seguro del hogar', ejemplo: 30 },
    ]
  }
};

type PorcentajeKey = '100' | '50' | '30';

interface GastoSeleccionado {
  id: string;
  importe: string;
  porcentaje: number;
  nombre: string;
}

export default function OrientadorGastosDeduciblesPage() {
  // Configuración fiscal
  const [ingresos, setIngresos] = useState('30000');
  const [tipoIRPF, setTipoIRPF] = useState('30');
  const [tipoIVA, setTipoIVA] = useState('21');

  // Gastos seleccionados por categoría
  const [gastosSeleccionados, setGastosSeleccionados] = useState<Record<string, GastoSeleccionado>>({});

  // Categorías expandidas
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<PorcentajeKey, boolean>>({
    '100': true,
    '50': false,
    '30': false
  });

  const toggleCategoria = (porcentaje: PorcentajeKey) => {
    setCategoriasExpandidas(prev => ({
      ...prev,
      [porcentaje]: !prev[porcentaje]
    }));
  };

  const toggleGasto = (id: string, porcentaje: number, nombre: string) => {
    setGastosSeleccionados(prev => {
      if (prev[id]) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [id]: { id, importe: '0', porcentaje, nombre }
      };
    });
  };

  const actualizarImporte = (id: string, importe: string) => {
    setGastosSeleccionados(prev => ({
      ...prev,
      [id]: { ...prev[id], importe }
    }));
  };

  // Cálculos
  const calculos = useMemo(() => {
    const ingresosAnuales = parseSpanishNumber(ingresos) || 0;
    const irpf = (parseSpanishNumber(tipoIRPF) || 30) / 100;
    const iva = (parseSpanishNumber(tipoIVA) || 21) / 100;

    let totalGastos = 0;
    let totalDeducibleIRPF = 0;
    let totalIVARecuperable = 0;
    const gastosDetalle: Array<{
      nombre: string;
      importeAnual: number;
      porcentaje: number;
      deducibleIRPF: number;
      ivaRecuperable: number;
      ahorroTotal: number;
    }> = [];

    Object.values(gastosSeleccionados).forEach(gasto => {
      const importeMensual = parseSpanishNumber(gasto.importe) || 0;
      const importeAnual = importeMensual * 12;
      const porcentajeDeduccion = gasto.porcentaje / 100;

      const baseDeducible = importeAnual * porcentajeDeduccion;
      const ivaDelGasto = importeAnual * (iva / (1 + iva)); // IVA incluido en el gasto
      const ivaRecuperable = ivaDelGasto * porcentajeDeduccion;

      totalGastos += importeAnual;
      totalDeducibleIRPF += baseDeducible;
      totalIVARecuperable += ivaRecuperable;

      if (importeAnual > 0) {
        gastosDetalle.push({
          nombre: gasto.nombre,
          importeAnual,
          porcentaje: gasto.porcentaje,
          deducibleIRPF: baseDeducible,
          ivaRecuperable,
          ahorroTotal: (baseDeducible * irpf) + ivaRecuperable
        });
      }
    });

    const ahorroIRPF = totalDeducibleIRPF * irpf;
    const ahorroTotal = ahorroIRPF + totalIVARecuperable;
    const baseImponible = ingresosAnuales - totalDeducibleIRPF;

    const irpfSinDeducciones = ingresosAnuales * irpf;
    const irpfConDeducciones = baseImponible * irpf;
    const porcentajeAhorro = ingresosAnuales > 0 ? (ahorroTotal / ingresosAnuales) * 100 : 0;

    return {
      totalGastos,
      totalDeducibleIRPF,
      totalIVARecuperable,
      ahorroIRPF,
      ahorroTotal,
      baseImponible,
      irpfSinDeducciones,
      irpfConDeducciones,
      porcentajeAhorro,
      gastosDetalle,
      numGastosSeleccionados: Object.keys(gastosSeleccionados).filter(k => parseSpanishNumber(gastosSeleccionados[k].importe) > 0).length
    };
  }, [gastosSeleccionados, ingresos, tipoIRPF, tipoIVA]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>💰 Orientador de Gastos Deducibles</h1>
        <p className={styles.subtitle}>
          Descubre qué gastos puedes deducir legalmente como autónomo y calcula su impacto en IRPF e IVA. Un autónomo con 30.000€ de ingresos suele declarar entre 2.000€ y 4.000€ en gastos deducibles reales según su actividad.
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial" severity="critical" />

      {/* Banner informativo */}
      <div className={styles.infoBanner}>
        <h3>¿Por qué es importante conocer los gastos deducibles?</h3>
        <p>
          <strong>Cada euro que deduces correctamente reduce tu base imponible</strong> y te permite recuperar IVA soportado.
          Un autónomo con 30.000€ de ingresos suele declarar entre <strong>2.000€ y 4.000€</strong> en gastos deducibles reales según su actividad.
        </p>
      </div>

      <div className={styles.mainContent}>
        {/* Configuración fiscal */}
        <section className={styles.configSection}>
          <h2 className={styles.sectionTitle}>Configuración Fiscal</h2>
          <div className={styles.configGrid}>
            <NumberInput
              value={ingresos}
              onChange={setIngresos}
              label="Ingresos anuales estimados"
              placeholder="30000"
              suffix="€/año"
              helperText="Facturación anual antes de gastos"
            />
            <div className={styles.selectGroup}>
              <label className={styles.selectLabel}>Tramo IRPF</label>
              <select
                className={styles.select}
                value={tipoIRPF}
                onChange={(e) => setTipoIRPF(e.target.value)}
              >
                <option value="19">19% (hasta 12.450€)</option>
                <option value="24">24% (12.450€ - 20.200€)</option>
                <option value="30">30% (20.200€ - 35.200€)</option>
                <option value="37">37% (35.200€ - 60.000€)</option>
                <option value="45">45% (más de 60.000€)</option>
              </select>
            </div>
            <div className={styles.selectGroup}>
              <label className={styles.selectLabel}>Tipo IVA de tu actividad</label>
              <select
                className={styles.select}
                value={tipoIVA}
                onChange={(e) => setTipoIVA(e.target.value)}
              >
                <option value="21">21% (General)</option>
                <option value="10">10% (Reducido)</option>
                <option value="4">4% (Superreducido)</option>
                <option value="0">0% (Exento)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Categorías de gastos */}
        <section className={styles.gastosSection}>
          <h2 className={styles.sectionTitle}>Selecciona tus Gastos Deducibles</h2>
          <p className={styles.sectionDesc}>
            Marca los gastos que tienes y añade el importe <strong>mensual</strong>. El cálculo se hará anual automáticamente.
          </p>

          {(Object.keys(gastosDB) as PorcentajeKey[]).map((porcentaje) => {
            const categoria = gastosDB[porcentaje];
            const isExpanded = categoriasExpandidas[porcentaje];

            return (
              <div key={porcentaje} className={styles.categoriaCard}>
                <button
                  type="button"
                  className={`${styles.categoriaHeader} ${styles[`header${porcentaje}`]}`}
                  onClick={() => toggleCategoria(porcentaje)}
                >
                  <div className={styles.categoriaInfo}>
                    <span className={`${styles.badge} ${styles[`badge${porcentaje}`]}`}>
                      {porcentaje}% deducible
                    </span>
                    <h3>{categoria.titulo}</h3>
                    <p>{categoria.descripcion}</p>
                  </div>
                  <span className={`${styles.arrow} ${isExpanded ? styles.arrowUp : ''}`}>
                    ▼
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.gastosLista}>
                    {categoria.items.map((item) => {
                      const isSelected = !!gastosSeleccionados[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`${styles.gastoItem} ${isSelected ? styles.gastoItemSelected : ''}`}
                        >
                          <label className={styles.gastoLabel}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleGasto(item.id, parseInt(porcentaje), item.nombre)}
                              className={styles.checkbox}
                            />
                            <span className={styles.gastoNombre}>{item.nombre}</span>
                          </label>
                          {isSelected && (
                            <div className={styles.gastoImporteWrapper}>
                              <input
                                type="text"
                                className={styles.gastoImporte}
                                value={gastosSeleccionados[item.id]?.importe || ''}
                                onChange={(e) => actualizarImporte(item.id, e.target.value)}
                                placeholder={String(item.ejemplo)}
                              />
                              <span className={styles.gastoSuffix}>€/mes</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Resultados */}
        <section className={styles.resultsSection}>
          <h2 className={styles.sectionTitle}>Tu Ahorro Fiscal Estimado</h2>

          <div className={styles.resultsGrid}>
            <ResultCard
              title="Ahorro Total Anual"
              value={formatNumber(calculos.ahorroTotal, 2)}
              unit="€"
              variant="highlight"
              icon="💰"
              description="IRPF + IVA recuperado"
            />
            <ResultCard
              title="Ahorro en IRPF"
              value={formatNumber(calculos.ahorroIRPF, 2)}
              unit="€"
              variant="success"
              icon="📉"
              description="Reducción base imponible"
            />
            <ResultCard
              title="IVA Recuperable"
              value={formatNumber(calculos.totalIVARecuperable, 2)}
              unit="€"
              variant="info"
              icon="🔄"
              description="IVA soportado deducible"
            />
            <ResultCard
              title="Base Imponible"
              value={formatNumber(calculos.baseImponible, 0)}
              unit="€"
              variant="default"
              icon="📊"
              description="Ingresos - Gastos deducibles"
            />
          </div>

          {/* Comparativa */}
          <div className={styles.comparativa}>
            <h3>Comparativa con/sin deducciones</h3>
            <div className={styles.comparativaGrid}>
              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>IRPF sin deducciones</span>
                <span className={styles.comparativaValor}>{formatCurrency(calculos.irpfSinDeducciones)}</span>
              </div>
              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>IRPF con deducciones</span>
                <span className={`${styles.comparativaValor} ${styles.valorPositivo}`}>
                  {formatCurrency(calculos.irpfConDeducciones)}
                </span>
              </div>
              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>% ahorro sobre ingresos</span>
                <span className={`${styles.comparativaValor} ${styles.valorDestacado}`}>
                  {formatNumber(calculos.porcentajeAhorro, 1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Desglose detallado */}
          {calculos.gastosDetalle.length > 0 && (
            <div className={styles.desglose}>
              <h3>Desglose por gasto</h3>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Gasto</th>
                      <th>Anual</th>
                      <th>% Ded.</th>
                      <th>Ahorro IRPF</th>
                      <th>IVA Recup.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculos.gastosDetalle.map((gasto, idx) => (
                      <tr key={idx}>
                        <td>{gasto.nombre}</td>
                        <td>{formatCurrency(gasto.importeAnual)}</td>
                        <td>{gasto.porcentaje}%</td>
                        <td>{formatCurrency(gasto.deducibleIRPF * (parseSpanishNumber(tipoIRPF) / 100))}</td>
                        <td>{formatCurrency(gasto.ivaRecuperable)}</td>
                        <td className={styles.tdDestacado}>{formatCurrency(gasto.ahorroTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>TOTAL</strong></td>
                      <td><strong>{formatCurrency(calculos.totalGastos)}</strong></td>
                      <td>-</td>
                      <td><strong>{formatCurrency(calculos.ahorroIRPF)}</strong></td>
                      <td><strong>{formatCurrency(calculos.totalIVARecuperable)}</strong></td>
                      <td className={styles.tdDestacado}><strong>{formatCurrency(calculos.ahorroTotal)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Disclaimer SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Herramienta de Orientación — No es asesoramiento profesional</h3>
        <p>
          Este orientador es <strong>únicamente orientativo y educativo</strong>. Los cálculos se basan en la normativa general
          del IRPF e IVA para autónomos en régimen de estimación directa y <strong>NO sustituyen el asesoramiento profesional</strong>.
          Datos orientativos para 2026. Verifica la normativa vigente en la{' '}
          <a href="https://sede.agenciatributaria.gob.es" target="_blank" rel="noopener noreferrer">
            Sede Electrónica de la AEAT
          </a>.
        </p>
        <div className={styles.disclaimerList}>
          <p><strong>Casos NO incluidos:</strong></p>
          <ul>
            <li>Régimen de módulos (estimación objetiva)</li>
            <li>Recargo de equivalencia</li>
            <li>Actividades con IVA exento</li>
            <li>Gastos con límites máximos específicos</li>
            <li>Sociedades mercantiles (SL, SA)</li>
          </ul>
        </div>
        <p className={styles.disclaimerFooter}>
          <strong>Recomendación:</strong> Consulta SIEMPRE con un asesor fiscal profesional antes de aplicar deducciones.
          Conserva todas las facturas y justificantes durante al menos 4 años.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre gastos deducibles?"
        subtitle="Conceptos clave, errores comunes y estrategias de optimización fiscal"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué significa que un gasto sea deducible?</h2>
          <p className={styles.introParagraph}>
            Deducir un gasto significa <strong>restarlo de tus ingresos antes de calcular impuestos</strong>.
            Si facturas 30.000€ y tienes 10.000€ en gastos deducibles, solo pagas IRPF sobre 20.000€.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📌 ¿Por qué hay diferentes porcentajes?</h4>
              <p>
                <strong>100%:</strong> Gastos exclusivos de tu actividad (oficina, software, asesoría).<br />
                <strong>50%:</strong> Gastos mixtos personal/profesional (móvil, internet casa).<br />
                <strong>30%:</strong> Gastos de vivienda si trabajas desde casa (luz, agua, comunidad).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Cómo funciona la recuperación del IVA?</h4>
              <p>
                El IVA que pagas en tus compras profesionales (IVA soportado) lo recuperas
                restándolo del IVA que cobras a tus clientes (IVA repercutido) en la declaración trimestral.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Qué pasa si deduzco algo incorrecto?</h4>
              <p>
                Hacienda puede revisar hasta 4 años atrás. Si no puedes justificar un gasto: devuelves el ahorro,
                más intereses (4-5%), más sanción (50-150%). Mejor consultar ante la duda.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Puedo deducir el coche?</h4>
              <p>
                Solo si está 100% afecto a la actividad (vehículo comercial, taxi, VTC).
                Un turismo de uso mixto personal/profesional NO es deducible, aunque puedes deducir desplazamientos concretos.
              </p>
            </div>
          </div>

          <h3>Gastos habituales que algunos autónomos no contabilizan correctamente — revisa si los tuyos están reflejados con factura completa</h3>
          <ul className={styles.tipsList}>
            <li><strong>Cuota de autónomos:</strong> 100% deducible, muchos lo olvidan</li>
            <li><strong>Formación profesional:</strong> Cursos, libros técnicos, certificaciones</li>
            <li><strong>Seguro de responsabilidad civil:</strong> Obligatorio en muchos sectores</li>
            <li><strong>Colegios profesionales:</strong> Cuotas anuales 100% deducibles</li>
            <li><strong>Material de oficina:</strong> Desde papel hasta sillas ergonómicas</li>
            <li><strong>Banco:</strong> Comisiones de la cuenta profesional</li>
          </ul>
        </section>

        {/* Sección 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Tabla comparativa de deducibilidad</h2>
          <p className={styles.introParagraph}>
            No todos los gastos se deducen igual. Esta tabla resume los cuatro niveles de deducibilidad,
            con ejemplos reales, documentación requerida y el riesgo de inspección asociado.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Ejemplos</th>
                  <th>Justificación</th>
                  <th>Documentación</th>
                  <th>Riesgo inspección</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong className={styles.badge100Label}>100% deducible</strong></td>
                  <td>Cuota de autónomos, alquiler de local, software profesional, asesoría fiscal, seguro de RC</td>
                  <td>Gasto exclusivo de la actividad, sin uso personal posible</td>
                  <td>Factura completa con NIF, desglose de IVA y concepto claro</td>
                  <td className={styles.riesgoLow}>Bajo — si tienes factura correcta</td>
                </tr>
                <tr>
                  <td><strong className={styles.badge50Label}>50% deducible</strong></td>
                  <td>Teléfono móvil, internet doméstico, comidas con clientes, mantenimiento de vehículo mixto</td>
                  <td>Uso compartido personal/profesional reconocido por Hacienda</td>
                  <td>Factura + registro de uso (log de llamadas profesionales, agenda de reuniones)</td>
                  <td className={styles.riesgoMed}>Medio — requiere justificación adicional</td>
                </tr>
                <tr>
                  <td><strong className={styles.badge30Label}>30% deducible (vivienda)</strong></td>
                  <td>Luz, agua, gas, comunidad de vecinos, IBI, seguro del hogar</td>
                  <td>Afectación parcial según porcentaje de superficie destinada a la actividad</td>
                  <td>Modelo 036 con domicilio fiscal + facturas de suministros + escritura o contrato</td>
                  <td className={styles.riesgoMed}>Medio-alto — Hacienda requiere notificación previa</td>
                </tr>
                <tr>
                  <td><strong className={styles.badgeNoLabel}>No deducible</strong></td>
                  <td>Ropa de calle, supermercado, vacaciones facturadas como viaje de empresa, multas, sanciones</td>
                  <td>Sin relación directa con la actividad o prohibidos expresamente</td>
                  <td>Ninguna — no procede la deducción</td>
                  <td className={styles.riesgoHigh}>Alto — puede derivar en sanción del 50-150%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales por perfil profesional</h2>
          <p className={styles.introParagraph}>
            Dependiendo de tu actividad, el ahorro fiscal puede variar enormemente.
            Estos cuatro perfiles ilustran situaciones concretas con estimaciones orientativas.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎨</span>
                <h4>Diseñador freelance con oficina en casa</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Gastos principales:</strong></p>
                <ul>
                  <li>30% de suministros del hogar (luz, agua, gas) → ~540 €/año</li>
                  <li>100% suscripción Adobe Creative Cloud → ~660 €/año</li>
                  <li>50% teléfono móvil → ~240 €/año</li>
                  <li>100% hosting + dominio → ~180 €/año</li>
                  <li>100% cursos de diseño → ~400 €/año</li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                Ahorro fiscal estimado: <strong>~720 €/año</strong> con IRPF al 30%
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <h4>Consultor con desplazamientos frecuentes</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Gastos principales:</strong></p>
                <ul>
                  <li>Kilometraje profesional: 0,26 €/km × 8.000 km → 2.080 €/año</li>
                  <li>Dietas justificadas: 26,67 €/día × 60 días → 1.600 €/año</li>
                  <li>Hoteles y transporte → 1.200 €/año</li>
                  <li>100% asesoría + coworking → 2.400 €/año</li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                Ahorro fiscal estimado: <strong>~3.300 €/año</strong> con IRPF al 37%
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📷</span>
                <h4>Fotógrafo con equipo especializado</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Gastos principales:</strong></p>
                <ul>
                  <li>Cámara + objetivos (uso exclusivo): amortización 3-5 años → 800 €/año</li>
                  <li>Software de edición (Lightroom, Photoshop) → 360 €/año</li>
                  <li>Almacenamiento en la nube profesional → 120 €/año</li>
                  <li>Transporte a sesiones → 600 €/año</li>
                  <li>Material fotográfico fungible → 300 €/año</li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                El equipo de uso exclusivo se amortiza 100%: <strong>base imponible reducida significativamente</strong>
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h4>Programadora con clientes internacionales</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Gastos principales:</strong></p>
                <ul>
                  <li>100% suscripciones software (GitHub Pro, IDEs, herramientas CI/CD) → 720 €/año</li>
                  <li>100% formación técnica (Udemy, certificaciones AWS) → 600 €/año</li>
                  <li>100% cuota colegio profesional → 120 €/año</li>
                  <li>100% libros técnicos → 200 €/año</li>
                  <li>50% internet doméstico (fibra 1 Gbps) → 300 €/año</li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                Optimización completa: <strong>todos los gastos de formación y herramientas al 100%</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre gastos deducibles</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuánto puedo deducir del alquiler de mi piso si trabajo desde casa?</dt>
              <dd>
                El alquiler NO se puede deducir directamente si es tu vivienda habitual. Solo puedes deducir los
                <strong> suministros (luz, agua, gas, comunidad)</strong> al 30%. Para deducir el alquiler proporcional,
                necesitarías un local separado o que el contrato de arrendamiento incluya una cláusula de uso mixto
                y haberlo comunicado en el modelo 036.
              </dd>
              <div className={styles.faqTip}>Regla: suministros sí (30%), alquiler de vivienda habitual no.</div>
            </div>

            <div className={styles.faqItem}>
              <dt>¿La cuota de autónomos es deducible en IRPF e IVA?</dt>
              <dd>
                Sí, la cuota de la Seguridad Social (RETA) es <strong>100% deducible en IRPF</strong> como gasto de
                la actividad económica. Sin embargo, <strong>no tiene IVA</strong>, así que no se puede recuperar
                IVA de ella. Es uno de los gastos más importantes y que más autónomos olvidan incluir.
              </dd>
              <div className={styles.faqTip}>Importe medio: ~206-607 €/mes según tramo (2026). Ahorro IRPF al 30%: ~740-2.190 €/año.</div>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo deducir el coche si lo uso también para uso personal?</dt>
              <dd>
                En España, un <strong>turismo de uso mixto no es deducible</strong> salvo contadas excepciones (agentes
                comerciales, representantes, VTC, taxi). Sin embargo, sí puedes deducir los desplazamientos profesionales
                concretos al 0,26 €/km (con registro de destino, motivo y km), y los gastos de aparcamiento y peajes
                con factura en esas salidas.
              </dd>
              <div className={styles.faqTip}>Vehículos 100% deducibles: furgonetas, camiones, tractores, motos de reparto y vehículos de prueba.</div>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Los gastos de formación y cursos son 100% deducibles?</dt>
              <dd>
                Sí, siempre que la formación esté <strong>relacionada directamente con tu actividad profesional</strong>.
                Un curso de marketing para un consultor: 100% deducible. Un máster en cocina para un programador: no.
                Incluye cursos online, presenciales, libros técnicos, suscripciones a plataformas formativas
                (Udemy, Coursera, LinkedIn Learning) y certificaciones profesionales.
              </dd>
              <div className={styles.faqTip}>Guarda el programa del curso y la factura. Si el nombre del curso es genérico, añota la relación con tu actividad.</div>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo deducir la suscripción a Netflix si veo series para mi trabajo creativo?</dt>
              <dd>
                <strong>No</strong>. Hacienda no acepta servicios de ocio personal como gasto profesional, incluso si
                argumentas que los necesitas para inspiración creativa. El criterio es la <em>necesidad objetiva</em>
                del gasto para la actividad, no el uso subjetivo que hagas de él. Las suscripciones de streaming,
                videojuegos o aplicaciones de entretenimiento no son deducibles.
              </dd>
              <div className={styles.faqTip}>Sí son deducibles: Adobe Stock, Shutterstock, bancos de música para vídeos, fuentes tipográficas, plugins profesionales.</div>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuántos años guardo las facturas para Hacienda?</dt>
              <dd>
                El plazo general de prescripción tributaria es de <strong>4 años</strong>, contados desde el día
                siguiente al plazo de presentación de la declaración. Sin embargo, si has generado pérdidas que
                compensas en ejercicios posteriores, debes guardar la documentación durante <strong>hasta 10 años</strong>.
                La recomendación práctica es conservar todo durante al menos 5 años, en formato digital y físico.
              </dd>
              <div className={styles.faqTip}>Digitaliza siempre con apps de escaneo (CamScanner, Adobe Scan). El papel puede desvanecerse en papel térmico.</div>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si Hacienda audita mis gastos y no los acepta?</dt>
              <dd>
                Si la inspección rechaza un gasto deducido, las consecuencias son acumulativas:
                <strong> devuelves la cuota de IRPF ahorrda</strong> + <strong>intereses de demora</strong> (actualmente
                al 4,0625%) + <strong>sanción</strong> del 50% al 150% de la cuota no ingresada según la gravedad.
                Por eso es fundamental tener justificación documental antes de deducir, no después.
              </dd>
              <div className={styles.faqTip}>Ante la duda: consulta con tu asesor antes de incluir el gasto, no después de recibirla carta de Hacienda.</div>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Las comisiones de Stripe o PayPal son gasto deducible?</dt>
              <dd>
                Sí, las comisiones de pasarelas de pago son <strong>100% deducibles</strong> como gasto bancario/financiero
                de la actividad. Stripe y PayPal emiten informes anuales de comisiones que puedes usar como justificante.
                También son deducibles las comisiones de transferencias internacionales, los gastos de la cuenta bancaria
                profesional y los intereses de préstamos para la actividad.
              </dd>
              <div className={styles.faqTip}>Descarga el informe anual de Stripe/PayPal en enero. Es válido como justificante contable.</div>
            </div>
          </dl>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso para gestionar tus gastos deducibles</h2>
          <p className={styles.introParagraph}>
            La clave para maximizar tus deducciones sin problemas con Hacienda no es solo saber qué deducir,
            sino cómo organizar el proceso desde el primer día.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Abre una cuenta bancaria exclusiva para tu actividad</h4>
                <p>
                  Separar los cobros y pagos profesionales de los personales es el paso más importante.
                  Facilita la contabilidad, evita mezclar gastos y da mucho más credibilidad ante una inspección.
                  La comisión de mantenimiento de esa cuenta es también 100% deducible.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Clasifica cada gasto en el momento (100% / 50% / 30%)</h4>
                <p>
                  No lo dejes para el final del trimestre. Cuando recibes una factura, anota inmediatamente
                  el porcentaje de deducción aplicable y el motivo. Una hoja de cálculo o una app de gestión
                  de gastos simplifica enormemente esta tarea y evita olvidos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Digitaliza las facturas y guárdalas mínimo 4+1 años</h4>
                <p>
                  Usa una app de escaneo (CamScanner, Adobe Scan, o la cámara del móvil con buena iluminación)
                  y organiza por año y trimestre. El papel térmico (recibos de TPV) se desvanece: digitaliza
                  siempre antes de archivar. Guarda también los correos electrónicos con facturas adjuntas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Registra el uso profesional de gastos mixtos</h4>
                <p>
                  Para el móvil: descarga el detalle de llamadas y marca las profesionales. Para el vehículo:
                  lleva un diario de desplazamientos (fecha, destino, km, motivo). Para internet: si trabajas
                  desde casa, documenta tu horario laboral habitual. Estos registros son la mejor defensa ante
                  una inspección.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Presenta el modelo 303 trimestralmente con el IVA soportado correcto</h4>
                <p>
                  Cada trimestre, suma el IVA de tus facturas de gasto (IVA soportado) según el porcentaje
                  de deducción aplicable: al 50% solo puedes deducir el 50% del IVA. Ese importe se resta
                  del IVA repercutido en tus facturas a clientes. Si el resultado es negativo, Hacienda te
                  lo devuelve (o compensa en el siguiente trimestre).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h4>En la Renta anual, verifica los gastos en el modelo 130 y en el 100</h4>
                <p>
                  Los pagos a cuenta del IRPF (modelo 130 trimestral) ya incluyen la deducción de gastos.
                  Al hacer la declaración de la Renta anual (modelo 100), comprueba que todos los gastos
                  declarados trimestralmente están correctamente reflejados en el apartado de rendimientos
                  de actividades económicas. Tu asesor puede revisar si hay gastos adicionales que puedes
                  incluir antes del 30 de junio.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para optimizar tus deducciones</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <div>
                <h4>Factura siempre a nombre de tu actividad</h4>
                <p>
                  Las facturas deben incluir tu nombre y NIF de autónomo. Si eres persona física autónoma,
                  las facturas a tu nombre personal son igualmente válidas — no necesitas ser empresa para
                  tener facturas deducibles. Lo importante es que aparezca tu NIF y el concepto profesional.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <div>
                <h4>El seguro de RC del autónomo es 100% deducible</h4>
                <p>
                  El seguro de responsabilidad civil profesional es obligatorio en muchos sectores (arquitectura,
                  ingeniería, asesoría, salud) y 100% deducible en todos. Su coste anual varía entre 150 y 800 €
                  según actividad, y normalmente compensa ampliamente el riesgo que cubre.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍽️</span>
              <div>
                <h4>Gastos de representación: justifica siempre la relación comercial</h4>
                <p>
                  Las comidas de negocios son deducibles, pero Hacienda exige prueba de la relación comercial:
                  nombre del cliente o proveedor, empresa, motivo de la reunión y fecha. Guarda el ticket junto
                  con una nota o captura del correo que convocó la reunión. Sin justificación, es un gasto de riesgo alto.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💻</span>
              <div>
                <h4>Amortiza el equipo en 3-5 años, no todo en un año</h4>
                <p>
                  Los bienes de inversión (ordenador, cámara, equipo de sonido) deben amortizarse según las tablas
                  oficiales de la AEAT: equipos informáticos entre 3 y 5 años, muebles entre 10 y 20 años.
                  Solo puedes deducir todo en un año si aplicas la libertad de amortización para empresas de
                  reducida dimensión (facturación inferior a 10 M€).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <h4>El asesor fiscal se paga solo</h4>
                <p>
                  Los honorarios de tu asesor o gestor son 100% deducibles como gasto profesional. Más allá de la
                  deducción, un buen asesor identifica gastos que tú pasarías por alto, evita errores con sanción
                  y te ahorra tiempo. En la mayoría de casos, el coste del asesor es menor que el ahorro que genera.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <div>
                <h4>Guarda justificantes aunque el importe sea pequeño</h4>
                <p>
                  Una inspección de Hacienda revisa todas las facturas del ejercicio, no solo las grandes.
                  Un gasto de 5 € sin justificante puede invalidar toda la categoría. Dedica 5 minutos al día
                  a archivar recibos: es la inversión con mejor retorno para un autónomo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box — Errores comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores que pueden costarte una sanción de Hacienda</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Deducir gastos personales como profesionales.</strong> Ropa de calle, compras del supermercado,
                entradas de cine o viajes de vacaciones con factura de empresa son los errores más frecuentes y los
                que Hacienda detecta con mayor facilidad en inspecciones.
              </li>
              <li>
                <strong>No tener factura completa — un ticket no es factura.</strong> Una factura válida debe incluir:
                número correlativo, fecha, nombre y NIF del emisor, nombre y NIF del receptor, concepto detallado,
                base imponible, tipo de IVA aplicado e importe total. Un ticket de TPV no cumple estos requisitos.
              </li>
              <li>
                <strong>Deducir el 100% del coche de turismo de uso mixto.</strong> La normativa española solo permite
                la deducción total de vehículos 100% afectos a la actividad. Un turismo que usas también para ir al
                supermercado no es deducible, aunque el 80% del uso sea profesional.
              </li>
              <li>
                <strong>Deducir dietas sin justificación de la relación comercial.</strong> Las dietas son deducibles
                con un límite de 26,67 €/día en España (48,08 € en el extranjero), pero solo si puedes probar la
                relación profesional: nombre de la persona reunida, empresa, destino y motivo del desplazamiento.
              </li>
              <li>
                <strong>Olvidar que en gastos mixtos al 50% solo recuperas el 50% del IVA.</strong> Si deduces un
                gasto al 50%, solo puedes deducir el 50% de su IVA en el modelo 303. Muchos autónomos deducen
                el 100% del IVA y solo el 50% del gasto en IRPF, lo que genera inconsistencias que Hacienda detecta.
              </li>
              <li>
                <strong>No comunicar a Hacienda el uso profesional del domicilio.</strong> Para deducir los suministros
                del hogar al 30%, debes haber declarado tu domicilio como lugar de ejercicio de la actividad en el
                modelo 036 o 037. Sin esa comunicación previa, Hacienda puede rechazar todas las deducciones de
                suministros aunque tengas las facturas.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-gastos-deducibles')} />
      <ShareCard appName="orientador-gastos-deducibles" />
      <Footer appName="orientador-gastos-deducibles" />
    </div>
  );
}
