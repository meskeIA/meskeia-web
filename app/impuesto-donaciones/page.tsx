'use client';

import { useState } from 'react';
import styles from './ImpuestoDonaciones.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { metadata, jsonLd, faqJsonLd, breadcrumbJsonLd } from './metadata';

// Interfaces
interface TarifaTramo {
  hasta: number;
  cuota: number;
  resto: number;
  tipo: number;
}

interface DatosFormulario {
  importePrimeraVivienda: number;
  dineroPrimeraVivienda: number;
  dineroReformas: number;
  segundaVivienda: number;
  dineroPagarImpuesto: number;
  otrosBienes: number;
  totalDonacion: number;
  escritura: boolean;
  grupoParentesco: string;
  edad: number;
  ingresos: number;
  patrimonioPreexistente: string;
  discapacidad: number;
}

interface DetalleReduccion {
  tipo: string;
  base: number;
  importe: number;
  detalle: string;
}

interface Reducciones {
  total: number;
  detalles: DetalleReduccion[];
}

interface DonacionAnterior {
  id: number;
  fecha: string;
  importe: number;
}

interface Resultado {
  datos: DatosFormulario;
  baseImponible: number;
  donacionesAcumuladas: number;
  reducciones: Reducciones;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficiente: number;
  cuotaTributaria: number;
  tarifaAplicada: string;
  grupoParentesco: string;
}

// Constantes - Tarifas y Coeficientes Cataluña 2025
const TARIFAS: { general: TarifaTramo[]; reducida: TarifaTramo[] } = {
  general: [
    { hasta: 50000, cuota: 0, resto: 50000, tipo: 7 },
    { hasta: 150000, cuota: 3500, resto: 400000, tipo: 11 },
    { hasta: 550000, cuota: 14500, resto: 800000, tipo: 17 },
    { hasta: 1350000, cuota: 57000, resto: Infinity, tipo: 24 },
    { hasta: Infinity, cuota: 153000, resto: Infinity, tipo: 32 },
  ],
  reducida: [
    // Para grupos I y II con escritura pública
    { hasta: 200000, cuota: 0, resto: 200000, tipo: 5 },
    { hasta: 800000, cuota: 10000, resto: 600000, tipo: 7 },
    { hasta: Infinity, cuota: 38000, resto: Infinity, tipo: 9 },
  ],
};

const COEFICIENTES: Record<string, number[]> = {
  I: [1.0, 1.1, 1.15, 1.2],
  II: [1.0, 1.1, 1.15, 1.2],
  III: [1.5882, 1.5882, 1.5882, 1.5882],
  IV: [2.0, 2.0, 2.0, 2.0],
};

export default function ImpuestoDonacionesPage() {
  // Estados
  const [formData, setFormData] = useState<Partial<DatosFormulario>>({
    importePrimeraVivienda: 0,
    dineroPrimeraVivienda: 0,
    dineroReformas: 0,
    segundaVivienda: 0,
    dineroPagarImpuesto: 0,
    otrosBienes: 0,
    escritura: true,
    grupoParentesco: '',
    edad: 0,
    ingresos: 0,
    patrimonioPreexistente: '1',
    discapacidad: 0,
  });

  const [donacionesAnteriores, setDonacionesAnteriores] = useState<DonacionAnterior[]>([]);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [showEducationalContent, setShowEducationalContent] = useState(false);

  // Calcular total de donación automáticamente
  const totalDonacion =
    (formData.importePrimeraVivienda || 0) +
    (formData.dineroPrimeraVivienda || 0) +
    (formData.dineroReformas || 0) +
    (formData.segundaVivienda || 0) +
    (formData.dineroPagarImpuesto || 0) +
    (formData.otrosBienes || 0);

  // Funciones auxiliares
  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  const calcularTarifa = (base: number, tarifa: TarifaTramo[]): number => {
    let cuotaTotal = 0;
    let baseRestante = base;

    for (const tramo of tarifa) {
      if (baseRestante <= 0) break;

      const baseTramo = Math.min(baseRestante, tramo.resto);
      const cuotaTramo = (baseTramo * tramo.tipo) / 100;
      cuotaTotal += tramo.cuota + cuotaTramo;

      baseRestante -= tramo.resto;

      if (baseRestante <= 0) {
        cuotaTotal = tramo.cuota + (baseTramo * tramo.tipo) / 100;
        break;
      }
    }

    return cuotaTotal;
  };

  const obtenerCoeficiente = (grupo: string, patrimonio: string): number => {
    const grupoBase = grupo.startsWith('II') ? 'II' : grupo;
    const indicePatrimonio = parseInt(patrimonio) - 1;
    return COEFICIENTES[grupoBase][indicePatrimonio];
  };

  const calcularDonacionesAcumuladas = (): number => {
    let total = 0;
    const hoy = new Date();
    const tresAnosAtras = new Date(hoy.getFullYear() - 3, hoy.getMonth(), hoy.getDate());

    for (const donacion of donacionesAnteriores) {
      const fechaDonacion = new Date(donacion.fecha);
      if (fechaDonacion >= tresAnosAtras && fechaDonacion <= hoy) {
        total += donacion.importe;
      }
    }

    return total;
  };

  const aplicarReducciones = (datos: DatosFormulario): Reducciones => {
    let reducciones = 0;
    const detallesReducciones: DetalleReduccion[] = [];

    // Reducción primera vivienda
    const totalPrimeraVivienda =
      datos.importePrimeraVivienda + datos.dineroPrimeraVivienda + datos.dineroReformas;

    if (
      totalPrimeraVivienda > 0 &&
      datos.edad <= 36 &&
      datos.ingresos <= 36000 &&
      datos.escritura
    ) {
      const limiteReduccion = datos.discapacidad >= 65 ? 120000 : 60000;
      const reduccion = Math.min(totalPrimeraVivienda * 0.95, limiteReduccion);
      reducciones += reduccion;
      detallesReducciones.push({
        tipo: 'Primera vivienda',
        base: totalPrimeraVivienda,
        importe: reduccion,
        detalle: `95% sobre ${formatearMoneda(totalPrimeraVivienda)}, límite ${formatearMoneda(limiteReduccion)}`,
      });
    } else if (
      totalPrimeraVivienda > 0 &&
      datos.discapacidad >= 65 &&
      datos.ingresos <= 36000 &&
      datos.escritura
    ) {
      // Excepción para discapacidad >= 65%
      const limiteReduccion = 120000;
      const reduccion = Math.min(totalPrimeraVivienda * 0.95, limiteReduccion);
      reducciones += reduccion;
      detallesReducciones.push({
        tipo: 'Primera vivienda (discapacidad ≥65%)',
        base: totalPrimeraVivienda,
        importe: reduccion,
        detalle: `95% sobre ${formatearMoneda(totalPrimeraVivienda)}, límite ${formatearMoneda(limiteReduccion)}`,
      });
    }

    return { total: reducciones, detalles: detallesReducciones };
  };

  const verificarRequisitos = (): { html: string; cumple: boolean } => {
    const edad = formData.edad || 0;
    const ingresos = formData.ingresos || 0;
    const discapacidad = formData.discapacidad || 0;
    const escritura = formData.escritura;

    const primeraVivienda = formData.importePrimeraVivienda || 0;
    const dineroPrimeraVivienda = formData.dineroPrimeraVivienda || 0;
    const dineroReformas = formData.dineroReformas || 0;

    if (primeraVivienda === 0 && dineroPrimeraVivienda === 0 && dineroReformas === 0) {
      return { html: '', cumple: false };
    }

    const totalPrimeraVivienda = primeraVivienda + dineroPrimeraVivienda + dineroReformas;
    const limiteReduccion = discapacidad >= 65 ? 120000 : 60000;

    let cumpleRequisitos = true;
    const requisitosNo: string[] = [];

    if (!escritura) {
      cumpleRequisitos = false;
      requisitosNo.push('Debe formalizarse en escritura pública');
    }

    if (edad > 36 && discapacidad < 65) {
      cumpleRequisitos = false;
      requisitosNo.push('Edad máxima 36 años (sin discapacidad ≥65%)');
    }

    if (ingresos > 36000) {
      cumpleRequisitos = false;
      requisitosNo.push('Ingresos máximos 36.000€');
    }

    return { html: '', cumple: cumpleRequisitos };
  };

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;

    if (type === 'radio') {
      const { name } = e.target as HTMLInputElement;
      const radioValue = (e.target as HTMLInputElement).value;

      if (name === 'escritura') {
        setFormData((prev) => ({ ...prev, escritura: radioValue === 'si' }));
      } else if (name === 'discapacidad') {
        setFormData((prev) => ({ ...prev, discapacidad: parseInt(radioValue) }));
      }
    } else if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      setFormData((prev) => ({ ...prev, [id]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const agregarDonacionAnterior = () => {
    const nuevoId = donacionesAnteriores.length + 1;
    setDonacionesAnteriores([
      ...donacionesAnteriores,
      { id: nuevoId, fecha: '', importe: 0 },
    ]);
  };

  const eliminarDonacionAnterior = (id: number) => {
    setDonacionesAnteriores(donacionesAnteriores.filter((d) => d.id !== id));
  };

  const actualizarDonacionAnterior = (
    id: number,
    campo: 'fecha' | 'importe',
    valor: string | number
  ) => {
    setDonacionesAnteriores(
      donacionesAnteriores.map((d) =>
        d.id === id ? { ...d, [campo]: valor } : d
      )
    );
  };

  const resetForm = () => {
    setFormData({
      importePrimeraVivienda: 0,
      dineroPrimeraVivienda: 0,
      dineroReformas: 0,
      segundaVivienda: 0,
      dineroPagarImpuesto: 0,
      otrosBienes: 0,
      escritura: true,
      grupoParentesco: '',
      edad: 0,
      ingresos: 0,
      patrimonioPreexistente: '1',
      discapacidad: 0,
    });
    setDonacionesAnteriores([]);
    setResultado(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const datos: DatosFormulario = {
      importePrimeraVivienda: formData.importePrimeraVivienda || 0,
      dineroPrimeraVivienda: formData.dineroPrimeraVivienda || 0,
      dineroReformas: formData.dineroReformas || 0,
      segundaVivienda: formData.segundaVivienda || 0,
      dineroPagarImpuesto: formData.dineroPagarImpuesto || 0,
      otrosBienes: formData.otrosBienes || 0,
      escritura: formData.escritura || false,
      grupoParentesco: formData.grupoParentesco || '',
      edad: formData.edad || 0,
      ingresos: formData.ingresos || 0,
      patrimonioPreexistente: formData.patrimonioPreexistente || '1',
      discapacidad: formData.discapacidad || 0,
      totalDonacion,
    };

    if (totalDonacion === 0) {
      alert('Por favor, introduzca al menos un importe de donación');
      return;
    }

    // Calcular base imponible
    let baseImponible = totalDonacion;
    const donacionesAcumuladas = calcularDonacionesAcumuladas();

    // Aplicar reducciones
    const reducciones = aplicarReducciones(datos);
    const baseLiquidable = Math.max(0, baseImponible - reducciones.total);
    const baseLiquidableAcumulada = baseLiquidable + donacionesAcumuladas;

    // Determinar tarifa aplicable
    const usarTarifaReducida =
      datos.escritura &&
      (datos.grupoParentesco === 'I' || datos.grupoParentesco.startsWith('II'));
    const tarifa = usarTarifaReducida ? TARIFAS.reducida : TARIFAS.general;

    // Calcular cuota íntegra
    let cuotaIntegra: number;
    if (donacionesAcumuladas > 0) {
      // Calcular tipo medio con acumulación
      const cuotaTotal = calcularTarifa(baseLiquidableAcumulada, tarifa);
      const tipoMedio = (cuotaTotal / baseLiquidableAcumulada) * 100;
      cuotaIntegra = (baseLiquidable * tipoMedio) / 100;
    } else {
      cuotaIntegra = calcularTarifa(baseLiquidable, tarifa);
    }

    // Aplicar coeficiente multiplicador
    const coeficiente = obtenerCoeficiente(
      datos.grupoParentesco,
      datos.patrimonioPreexistente
    );
    const cuotaTributaria = cuotaIntegra * coeficiente;

    setResultado({
      datos,
      baseImponible,
      donacionesAcumuladas,
      reducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficiente,
      cuotaTributaria,
      tarifaAplicada: usarTarifaReducida ? 'Reducida' : 'General',
      grupoParentesco: datos.grupoParentesco,
    });
  };

  const requisitos = verificarRequisitos();

  return (
    <>
      <AnalyticsTracker appName="impuesto-donaciones" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <MeskeiaLogo />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Calculadora Impuesto de Donaciones</h1>
          <p>Cataluña 2025 - Herramienta Informativa</p>
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimerBox}>
          <div className={styles.disclaimerTitle}>⚠️ IMPORTANTE - AVISO LEGAL</div>
          <div className={styles.disclaimerContent}>
            <strong>Esta calculadora es únicamente una herramienta informativa y orientativa.</strong>
            <br />
            <br />
            Los resultados obtenidos son estimaciones basadas en la normativa vigente del Impuesto
            sobre Sucesiones y Donaciones en Cataluña, pero <strong>NO sustituyen el asesoramiento
            profesional</strong>. Cada situación fiscal es única y puede estar sujeta a
            particularidades no contempladas en esta herramienta.
            <br />
            <br />
            <strong>⚠️ Casos especiales no incluidos:</strong>
            <ul style={{ margin: '10px 0 10px 20px', color: '#856404' }}>
              <li>
                <strong>Empresas familiares o negocios profesionales</strong>
              </li>
              <li>Explotaciones agrarias</li>
              <li>Bienes del patrimonio cultural</li>
              <li>Participaciones societarias complejas</li>
            </ul>
            Para estos casos, <strong>consulte con un asesor fiscal especializado</strong>.
            <br />
            <br />
            <strong>Recomendamos encarecidamente:</strong>
            <ul style={{ margin: '10px 0 0 20px' }}>
              <li>
                Consultar con un <strong>Asesor Fiscal profesional</strong> antes de tomar
                decisiones
              </li>
              <li>
                Verificar los requisitos específicos de cada reducción con la{' '}
                <strong>Agència Tributària de Catalunya</strong>
              </li>
              <li>Confirmar que cumple todos los requisitos legales para las reducciones aplicables</li>
            </ul>
            <br />
            meskeIA no se responsabiliza de las decisiones tomadas basándose en estos cálculos. El
            uso de esta herramienta implica la aceptación de estas condiciones.
          </div>
        </div>

        <div className={styles.content}>
          <form id="donacionForm" onSubmit={handleSubmit}>
            {/* Sección 1: Desglose de la Donación */}
            <div className={styles.formSection}>
              <h3>Desglose de la Donación</h3>

              <div className={styles.infoBox}>
                <strong>Importante:</strong> Desglose los diferentes conceptos de la donación para un
                cálculo más preciso del impuesto
              </div>

              <div className={styles.donationTypesGrid}>
                <div className={styles.donationTypeRow}>
                  <div>
                    <div className={styles.donationTypeLabel}>
                      Primera vivienda habitual
                      <span className={styles.tooltip}>
                        ℹ
                        <span className={styles.tooltiptext}>
                          Vivienda que constituirá la primera residencia habitual del donatario. Tiene
                          reducción del 95% con límites
                        </span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="importePrimeraVivienda"
                      min="0"
                      step="0.01"
                      placeholder="0.00 €"
                      value={formData.importePrimeraVivienda || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.donationTypeRow}>
                  <div>
                    <div className={styles.donationTypeLabel}>
                      Dinero para adquisición primera vivienda
                      <span className={styles.smallText}>(escritura en 1 mes, compra en 3 meses)</span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="dineroPrimeraVivienda"
                      min="0"
                      step="0.01"
                      placeholder="0.00 €"
                      value={formData.dineroPrimeraVivienda || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.donationTypeRow}>
                  <div>
                    <div className={styles.donationTypeLabel}>
                      Dinero para reformas/mobiliario primera vivienda
                      <span className={styles.tooltip}>
                        ℹ
                        <span className={styles.tooltiptext}>
                          Se incluye en el límite de reducción de primera vivienda si se formaliza
                          correctamente
                        </span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="dineroReformas"
                      min="0"
                      step="0.01"
                      placeholder="0.00 €"
                      value={formData.dineroReformas || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.donationTypeRow}>
                  <div>
                    <div className={styles.donationTypeLabel}>
                      Segunda vivienda o inmuebles
                      <span className={styles.smallText}>(sin reducción especial)</span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="segundaVivienda"
                      min="0"
                      step="0.01"
                      placeholder="0.00 €"
                      value={formData.segundaVivienda || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.donationTypeRow}>
                  <div>
                    <div className={styles.donationTypeLabel}>Dinero para pagar el impuesto</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="dineroPagarImpuesto"
                      min="0"
                      step="0.01"
                      placeholder="0.00 €"
                      value={formData.dineroPagarImpuesto || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.donationTypeRow}>
                  <div>
                    <div className={styles.donationTypeLabel}>
                      Otros bienes o dinero efectivo
                      <span className={styles.smallText}>(sin reducción especial)</span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      id="otrosBienes"
                      min="0"
                      step="0.01"
                      placeholder="0.00 €"
                      value={formData.otrosBienes || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div
                  className={styles.donationTypeRow}
                  style={{
                    borderTop: '2px solid var(--primary)',
                    paddingTop: '15px',
                    marginTop: '15px',
                  }}
                >
                  <div>
                    <div
                      className={styles.donationTypeLabel}
                      style={{ fontSize: '16px', color: 'var(--primary)' }}
                    >
                      <strong>TOTAL DONACIÓN</strong>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formatearMoneda(totalDonacion)}
                      readOnly
                      disabled
                      style={{ fontWeight: 'bold', color: 'var(--primary)' }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                <label>
                  ¿Se formalizará en escritura pública?
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      Obligatorio para reducciones. Para grupos I y II permite aplicar tarifa reducida
                    </span>
                  </span>
                </label>
                <div className={styles.radioGroup}>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="escrituraSi"
                      name="escritura"
                      value="si"
                      checked={formData.escritura === true}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="escrituraSi">Sí</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="escrituraNo"
                      name="escritura"
                      value="no"
                      checked={formData.escritura === false}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="escrituraNo">No</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Relación entre Donante y Donatario */}
            <div className={styles.formSection}>
              <h3>Relación entre Donante y Donatario</h3>

              <div className={styles.formGroup}>
                <label htmlFor="grupoParentesco">
                  Grupo de parentesco
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      El grado de parentesco determina las reducciones y coeficientes aplicables
                    </span>
                  </span>
                </label>
                <select
                  id="grupoParentesco"
                  required
                  value={formData.grupoParentesco}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="I">Grupo I - Descendientes menores de 21 años</option>
                  <option value="II-hijo">Grupo II - Hijos de 21 años o más</option>
                  <option value="II-conyuge">Grupo II - Cónyuge o pareja estable</option>
                  <option value="II-ascendiente">Grupo II - Padres o ascendientes</option>
                  <option value="III">Grupo III - Hermanos, tíos, sobrinos</option>
                  <option value="IV">Grupo IV - Primos, extraños</option>
                </select>
              </div>

              <div className={styles.infoBox}>
                <strong>Grupos de parentesco:</strong>
                <br />• <strong>Grupo I:</strong> Hijos y descendientes menores de 21 años
                <br />• <strong>Grupo II:</strong> Hijos de 21+, cónyuge, pareja estable, padres
                <br />• <strong>Grupo III:</strong> Hermanos, tíos, sobrinos (2º y 3er grado)
                <br />• <strong>Grupo IV:</strong> Primos (4º grado) y extraños
              </div>
            </div>

            {/* Sección 3: Datos del Donatario */}
            <div className={styles.formSection}>
              <h3>Datos del Donatario (quien recibe)</h3>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="edadDonatario">
                    Edad del donatario
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Máximo 36 años para reducción primera vivienda (salvo discapacidad ≥65%)
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="edad"
                    min="0"
                    max="120"
                    required
                    value={formData.edad || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="ingresos">
                    Base imponible IRPF del donatario (€)
                    <span className={styles.tooltip}>
                      ℹ
                      <span className={styles.tooltiptext}>
                        Suma de base general + base del ahorro - mínimos. Máximo 36.000€ para reducción
                        primera vivienda
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="ingresos"
                    min="0"
                    step="0.01"
                    placeholder="Ingresos anuales"
                    value={formData.ingresos || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {(formData.ingresos || 0) > 36000 &&
                ((formData.importePrimeraVivienda || 0) > 0 ||
                  (formData.dineroPrimeraVivienda || 0) > 0 ||
                  (formData.dineroReformas || 0) > 0) && (
                  <div className={styles.warningBox}>
                    <strong>⚠️ Atención:</strong> Los ingresos superan los 36.000€ anuales. No se
                    podrá aplicar la reducción por primera vivienda.
                  </div>
                )}

              <div className={styles.formGroup}>
                <label htmlFor="patrimonioPreexistente">
                  Patrimonio preexistente del donatario (€)
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      Valor total del patrimonio del donatario antes de la donación
                    </span>
                  </span>
                </label>
                <select
                  id="patrimonioPreexistente"
                  required
                  value={formData.patrimonioPreexistente}
                  onChange={handleInputChange}
                >
                  <option value="1">Hasta 500.000 €</option>
                  <option value="2">De 500.000,01 € a 2.000.000 €</option>
                  <option value="3">De 2.000.000,01 € a 4.000.000 €</option>
                  <option value="4">Más de 4.000.000 €</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>
                  ¿Tiene algún grado de discapacidad?
                  <span className={styles.tooltip}>
                    ℹ
                    <span className={styles.tooltiptext}>
                      Las personas con discapacidad tienen reducciones especiales y mayores límites
                    </span>
                  </span>
                </label>
                <div className={styles.radioGroup}>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="discapacidadNo"
                      name="discapacidad"
                      value="0"
                      checked={formData.discapacidad === 0}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="discapacidadNo">No</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="discapacidad33"
                      name="discapacidad"
                      value="33"
                      checked={formData.discapacidad === 33}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="discapacidad33">33% - 64%</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="discapacidad65"
                      name="discapacidad"
                      value="65"
                      checked={formData.discapacidad === 65}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="discapacidad65">65% o más</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 4: Donaciones Anteriores */}
            <div className={styles.formSection}>
              <h3>Donaciones Anteriores (últimos 3 años)</h3>

              <div className={styles.infoBox}>
                Las donaciones del mismo donante en los últimos 3 años se acumulan para calcular el
                tipo impositivo
              </div>

              <div className={styles.donacionesAnteriores}>
                {donacionesAnteriores.map((donacion) => (
                  <div key={donacion.id} className={styles.donacionAnterior}>
                    <div style={{ flex: 1 }}>
                      <label>Fecha</label>
                      <input
                        type="date"
                        value={donacion.fecha}
                        onChange={(e) =>
                          actualizarDonacionAnterior(donacion.id, 'fecha', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Importe (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={donacion.importe || ''}
                        onChange={(e) =>
                          actualizarDonacionAnterior(
                            donacion.id,
                            'importe',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.btnRemove}
                      onClick={() => eliminarDonacionAnterior(donacion.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.btnAdd} onClick={agregarDonacionAnterior}>
                + Añadir donación anterior
              </button>
            </div>

            {/* Sección 5: Verificación de Requisitos */}
            {((formData.importePrimeraVivienda || 0) > 0 ||
              (formData.dineroPrimeraVivienda || 0) > 0 ||
              (formData.dineroReformas || 0) > 0) && (
              <div className={styles.formSection}>
                <h3>Verificación de Requisitos para Reducciones</h3>

                {requisitos.cumple ? (
                  <div className={styles.successBox}>
                    <strong>✓ Primera vivienda:</strong> Cumple requisitos. Reducción 95% sobre{' '}
                    {formatearMoneda(
                      (formData.importePrimeraVivienda || 0) +
                        (formData.dineroPrimeraVivienda || 0) +
                        (formData.dineroReformas || 0)
                    )}
                    , máximo{' '}
                    {formatearMoneda((formData.discapacidad || 0) >= 65 ? 120000 : 60000)}
                  </div>
                ) : (
                  <div className={styles.errorBox}>
                    <strong>✗ Primera vivienda:</strong> NO cumple requisitos:
                    <br />
                    {!formData.escritura && '• Debe formalizarse en escritura pública'}
                    <br />
                    {(formData.edad || 0) > 36 &&
                      (formData.discapacidad || 0) < 65 &&
                      '• Edad máxima 36 años (sin discapacidad ≥65%)'}
                    <br />
                    {(formData.ingresos || 0) > 36000 && '• Ingresos máximos 36.000€'}
                  </div>
                )}
              </div>
            )}

            {/* Botones */}
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.btnReset} onClick={resetForm}>
                Limpiar
              </button>
              <button type="submit" className={styles.btnCalculate}>
                Calcular Impuesto
              </button>
            </div>
          </form>

          {/* Resultados */}
          {resultado && (
            <div className={styles.results}>
              <h3>Resultado del Cálculo</h3>
              <div className={styles.resultContent}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>
                  Desglose de la donación:
                </h4>

                {resultado.datos.importePrimeraVivienda > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Primera vivienda habitual:</span>
                    <span className={styles.resultValue}>
                      {formatearMoneda(resultado.datos.importePrimeraVivienda)}
                    </span>
                  </div>
                )}
                {resultado.datos.dineroPrimeraVivienda > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Dinero para primera vivienda:</span>
                    <span className={styles.resultValue}>
                      {formatearMoneda(resultado.datos.dineroPrimeraVivienda)}
                    </span>
                  </div>
                )}
                {resultado.datos.dineroReformas > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Dinero para reformas/mobiliario:</span>
                    <span className={styles.resultValue}>
                      {formatearMoneda(resultado.datos.dineroReformas)}
                    </span>
                  </div>
                )}
                {resultado.datos.segundaVivienda > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Segunda vivienda o inmuebles:</span>
                    <span className={styles.resultValue}>
                      {formatearMoneda(resultado.datos.segundaVivienda)}
                    </span>
                  </div>
                )}
                {resultado.datos.dineroPagarImpuesto > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Dinero para pagar el impuesto:</span>
                    <span className={styles.resultValue}>
                      {formatearMoneda(resultado.datos.dineroPagarImpuesto)}
                    </span>
                  </div>
                )}
                {resultado.datos.otrosBienes > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Otros bienes o dinero:</span>
                    <span className={styles.resultValue}>
                      {formatearMoneda(resultado.datos.otrosBienes)}
                    </span>
                  </div>
                )}

                <div className={styles.divider}></div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>
                    <strong>Base imponible:</strong>
                  </span>
                  <span className={styles.resultValue}>
                    <strong>{formatearMoneda(resultado.baseImponible)}</strong>
                  </span>
                </div>

                {resultado.donacionesAcumuladas > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Donaciones acumuladas (3 años):</span>
                    <span className={styles.resultValue}>
                      {formatearMoneda(resultado.donacionesAcumuladas)}
                    </span>
                  </div>
                )}

                {resultado.reducciones.detalles.length > 0 && (
                  <>
                    <h4
                      style={{
                        color: 'var(--primary)',
                        marginTop: '20px',
                        marginBottom: '15px',
                      }}
                    >
                      Reducciones aplicadas:
                    </h4>
                    {resultado.reducciones.detalles.map((reduccion, index) => (
                      <div key={index} className={styles.resultItem}>
                        <span className={styles.resultLabel}>{reduccion.tipo}:</span>
                        <span className={styles.resultValue}>
                          -{formatearMoneda(reduccion.importe)}
                        </span>
                      </div>
                    ))}
                    <div className={styles.resultItemSmall}>
                      <span className={styles.resultLabel} style={{ fontSize: '0.9rem' }}>
                        {resultado.reducciones.detalles[0].detalle}
                      </span>
                    </div>
                  </>
                )}

                <div className={styles.divider}></div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>
                    <strong>Base liquidable:</strong>
                  </span>
                  <span className={styles.resultValue}>
                    <strong>{formatearMoneda(resultado.baseLiquidable)}</strong>
                  </span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Tarifa aplicada:</span>
                  <span className={styles.resultValue}>{resultado.tarifaAplicada}</span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cuota íntegra:</span>
                  <span className={styles.resultValue}>{formatearMoneda(resultado.cuotaIntegra)}</span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Coeficiente multiplicador:</span>
                  <span className={styles.resultValue}>{resultado.coeficiente.toFixed(4)}</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.resultHighlight}>
                  <span className={styles.resultLabel}>
                    <strong>CUOTA TRIBUTARIA A PAGAR:</strong>
                  </span>
                  <span className={styles.resultValueFinal}>
                    <strong>{formatearMoneda(resultado.cuotaTributaria)}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REGLA #7 - Contenido Educativo Colapsable */}
      <div className={styles.educationalToggle}>
        <h3>🏠 Guía del Impuesto de Donaciones en Cataluña</h3>
        <p className={styles.educationalSubtitle}>
          Descubre todo sobre el Impuesto de Donaciones: requisitos, reducciones y casos prácticos
        </p>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => setShowEducationalContent(!showEducationalContent)}
        >
          {showEducationalContent ? '▼ Ocultar contenido educativo' : '▶ Mostrar contenido educativo'}
        </button>

        {showEducationalContent && (
          <div className={styles.educationalContent}>
            <div className={styles.eduSection}>
              <h2>📋 ¿Qué es el Impuesto de Donaciones?</h2>
              <p>
                El Impuesto sobre Donaciones grava la adquisición de bienes y derechos por donación o
                cualquier otro negocio jurídico a título gratuito e intervivos. En Cataluña, la
                normativa específica establece reducciones y bonificaciones propias para facilitar
                estas transmisiones, especialmente cuando se trata de la primera vivienda habitual.
              </p>

              <h2>🏠 Primera Vivienda Habitual</h2>
              <p>
                <strong>Reducción del 95%</strong> sobre el valor de la donación, con límites según la
                edad del donatario:
              </p>
              <ul>
                <li>
                  <strong>Menores de 36 años:</strong> Hasta 60.000€ de reducción
                </li>
                <li>
                  <strong>Personas con discapacidad ≥65%:</strong> Hasta 120.000€ de reducción (sin
                  límite de edad)
                </li>
              </ul>

              <h3>Requisitos obligatorios:</h3>
              <ul>
                <li>Formalización en escritura pública</li>
                <li>Base imponible del IRPF del donatario ≤ 36.000€</li>
                <li>Debe ser la primera vivienda habitual</li>
                <li>Mantenimiento como residencia habitual durante 5 años</li>
              </ul>

              <h2>👥 Grupos de Parentesco</h2>
              <p>
                <strong>Grupo I:</strong> Hijos y descendientes menores de 21 años
                <br />
                <strong>Grupo II:</strong> Hijos de 21 años o más, cónyuge, pareja estable, padres
                <br />
                <strong>Grupo III:</strong> Hermanos, tíos, sobrinos (2º y 3er grado)
                <br />
                <strong>Grupo IV:</strong> Primos (4º grado) y extraños
              </p>
              <p>
                Los grupos I y II pueden beneficiarse de la <strong>tarifa reducida</strong> (5%-9%)
                si se formaliza en escritura pública.
              </p>

              <h2>💼 Tarifas Aplicables</h2>

              <h3>Tarifa General (sin escritura o grupos III y IV):</h3>
              <ul>
                <li>Hasta 50.000€: 7%</li>
                <li>50.000€ - 150.000€: 11%</li>
                <li>150.000€ - 550.000€: 17%</li>
                <li>550.000€ - 1.350.000€: 24%</li>
                <li>Más de 1.350.000€: 32%</li>
              </ul>

              <h3>Tarifa Reducida (grupos I y II con escritura):</h3>
              <ul>
                <li>Hasta 200.000€: 5%</li>
                <li>200.000€ - 800.000€: 7%</li>
                <li>Más de 800.000€: 9%</li>
              </ul>

              <h2>📊 Coeficientes Multiplicadores</h2>
              <p>
                Se aplican sobre la cuota íntegra según el patrimonio preexistente del donatario:
              </p>
              <ul>
                <li>
                  <strong>Grupos I y II:</strong> 1.0 - 1.2 (según patrimonio)
                </li>
                <li>
                  <strong>Grupo III:</strong> 1.5882 (fijo)
                </li>
                <li>
                  <strong>Grupo IV:</strong> 2.0 (fijo)
                </li>
              </ul>

              <h2>⏱️ Plazos de Presentación</h2>
              <p>
                El impuesto debe presentarse en un plazo de <strong>30 días hábiles</strong> desde la
                fecha de la donación. Si se formaliza en escritura pública, el plazo comienza desde la
                fecha de la escritura.
              </p>

              <h2>⚠️ Casos Especiales No Incluidos</h2>
              <p>
                Esta calculadora <strong>NO contempla</strong> reducciones por:
              </p>
              <ul>
                <li>
                  <strong>Empresas familiares o negocios profesionales</strong> (reducción del 95%)
                </li>
                <li>Explotaciones agrarias</li>
                <li>Bienes del patrimonio histórico o cultural</li>
                <li>Participaciones societarias complejas</li>
              </ul>
              <p>
                Para estos casos, <strong>consulte con un asesor fiscal especializado</strong>.
              </p>

              <h2>📞 Más Información</h2>
              <p>
                Para consultas específicas o situaciones complejas, contacte con:
              </p>
              <ul>
                <li>
                  <strong>Agència Tributària de Catalunya:</strong>{' '}
                  <a
                    href="https://atc.gencat.cat"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary)' }}
                  >
                    atc.gencat.cat
                  </a>
                </li>
                <li>
                  <strong>Teléfono de atención:</strong> 901 25 25 25
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
