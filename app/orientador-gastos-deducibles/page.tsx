'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorGastosDeducibles.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
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
          Descubre qué gastos puedes deducir como autónomo y oriéntate sobre tu ahorro fiscal potencial en IRPF e IVA
        </p>
      </header>

      <DisclaimerCard variant="financial" severity="medium" />

      {/* Banner informativo */}
      <div className={styles.infoBanner}>
        <h3>¿Por qué es importante conocer los gastos deducibles?</h3>
        <p>
          <strong>Cada euro que deduces correctamente reduce tu base imponible</strong> y te permite recuperar IVA soportado.
          Un autónomo con 30.000€ de ingresos puede ahorrar entre <strong>2.000€ - 4.000€ anuales</strong> optimizando sus deducciones.
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
          Datos orientativos para 2025. Verifica la normativa vigente en la{' '}
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

          <h3>Gastos que los autónomos suelen olvidar</h3>
          <ul className={styles.tipsList}>
            <li><strong>Cuota de autónomos:</strong> 100% deducible, muchos lo olvidan</li>
            <li><strong>Formación profesional:</strong> Cursos, libros técnicos, certificaciones</li>
            <li><strong>Seguro de responsabilidad civil:</strong> Obligatorio en muchos sectores</li>
            <li><strong>Colegios profesionales:</strong> Cuotas anuales 100% deducibles</li>
            <li><strong>Material de oficina:</strong> Desde papel hasta sillas ergonómicas</li>
            <li><strong>Banco:</strong> Comisiones de la cuenta profesional</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-gastos-deducibles')} />
      <ShareCard appName="orientador-gastos-deducibles" />
      <Footer appName="orientador-gastos-deducibles" />
    </div>
  );
}
