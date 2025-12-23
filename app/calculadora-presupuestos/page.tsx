'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CalculadoraPresupuestos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, EducationalSection } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface DatosFreelance {
  nombre: string;
  nif: string;
  email: string;
  telefono: string;
  direccion: string;
  web: string;
}

interface DatosCliente {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
}

interface LineaPresupuesto {
  id: string;
  tipo: 'servicio' | 'hora' | 'material';
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
  descuento: string;
}

interface ConfigPresupuesto {
  numero: string;
  fecha: string;
  validezDias: string;
  incluirIva: boolean;
  tipoIva: string;
  incluirIrpf: boolean;
  tipoIrpf: string;
  condicionesPago: string;
  notas: string;
}

const STORAGE_KEY = 'meskeia-calculadora-presupuestos';

const condicionesPagoOpciones = [
  'Pago al contado',
  '50% anticipo, 50% entrega',
  '30% anticipo, 70% entrega',
  'Pago a 15 días',
  'Pago a 30 días',
  'Pago a 60 días',
  'Por fases del proyecto',
];

export default function CalculadoraPresupuestosPage() {
  // Estado del freelance
  const [datosFreelance, setDatosFreelance] = useState<DatosFreelance>({
    nombre: '',
    nif: '',
    email: '',
    telefono: '',
    direccion: '',
    web: '',
  });

  // Estado del cliente
  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  // Líneas del presupuesto
  const [lineas, setLineas] = useState<LineaPresupuesto[]>([
    {
      id: crypto.randomUUID(),
      tipo: 'servicio',
      descripcion: '',
      cantidad: '1',
      precioUnitario: '',
      descuento: '0',
    },
  ]);

  // Configuración
  const [config, setConfig] = useState<ConfigPresupuesto>({
    numero: `PRES-${new Date().getFullYear()}-001`,
    fecha: new Date().toISOString().split('T')[0],
    validezDias: '30',
    incluirIva: true,
    tipoIva: '21',
    incluirIrpf: false,
    tipoIrpf: '15',
    condicionesPago: 'Pago al contado',
    notas: '',
  });

  // Título del proyecto
  const [tituloProyecto, setTituloProyecto] = useState('');

  // Ref para la vista previa
  const previewRef = useRef<HTMLDivElement>(null);

  // Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.datosFreelance) setDatosFreelance(data.datosFreelance);
        if (data.datosCliente) setDatosCliente(data.datosCliente);
        if (data.lineas) setLineas(data.lineas);
        if (data.config) setConfig(data.config);
        if (data.tituloProyecto) setTituloProyecto(data.tituloProyecto);
      } catch (e) {
        console.error('Error cargando datos:', e);
      }
    }
  }, []);

  // Guardar datos
  useEffect(() => {
    const data = { datosFreelance, datosCliente, lineas, config, tituloProyecto };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [datosFreelance, datosCliente, lineas, config, tituloProyecto]);

  // Funciones de líneas
  const agregarLinea = (tipo: 'servicio' | 'hora' | 'material') => {
    setLineas([
      ...lineas,
      {
        id: crypto.randomUUID(),
        tipo,
        descripcion: '',
        cantidad: tipo === 'hora' ? '1' : '1',
        precioUnitario: '',
        descuento: '0',
      },
    ]);
  };

  const eliminarLinea = (id: string) => {
    if (lineas.length > 1) {
      setLineas(lineas.filter((l) => l.id !== id));
    }
  };

  const actualizarLinea = (id: string, campo: keyof LineaPresupuesto, valor: string) => {
    setLineas(lineas.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)));
  };

  // Cálculos
  const calcularSubtotalLinea = (linea: LineaPresupuesto): number => {
    const cantidad = parseSpanishNumber(linea.cantidad) || 0;
    const precio = parseSpanishNumber(linea.precioUnitario) || 0;
    const descuento = parseSpanishNumber(linea.descuento) || 0;
    const subtotal = cantidad * precio;
    return subtotal - (subtotal * descuento) / 100;
  };

  const subtotal = lineas.reduce((acc, linea) => acc + calcularSubtotalLinea(linea), 0);
  const ivaAmount = config.incluirIva ? (subtotal * parseFloat(config.tipoIva)) / 100 : 0;
  const irpfAmount = config.incluirIrpf ? (subtotal * parseFloat(config.tipoIrpf)) / 100 : 0;
  const total = subtotal + ivaAmount - irpfAmount;

  // Fecha de validez
  const fechaValidez = () => {
    const fecha = new Date(config.fecha);
    fecha.setDate(fecha.getDate() + parseInt(config.validezDias));
    return fecha.toLocaleDateString('es-ES');
  };

  // Exportar a PDF
  const exportarPDF = async () => {
    if (!previewRef.current) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 10,
        filename: `${config.numero}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };

      html2pdf().set(opt).from(previewRef.current).save();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  // Nuevo presupuesto
  const nuevoPresupuesto = () => {
    if (confirm('¿Crear nuevo presupuesto? Se perderán los datos actuales del cliente y líneas.')) {
      setDatosCliente({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        direccion: '',
      });
      setLineas([
        {
          id: crypto.randomUUID(),
          tipo: 'servicio',
          descripcion: '',
          cantidad: '1',
          precioUnitario: '',
          descuento: '0',
        },
      ]);
      setTituloProyecto('');
      // Incrementar número
      const match = config.numero.match(/(\d+)$/);
      if (match) {
        const newNum = (parseInt(match[1]) + 1).toString().padStart(3, '0');
        setConfig({ ...config, numero: config.numero.replace(/\d+$/, newNum) });
      }
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return '🛠️ Servicio';
      case 'hora':
        return '⏱️ Horas';
      case 'material':
        return '📦 Material';
      default:
        return tipo;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📋</span>
        <h1 className={styles.title}>Calculadora de Presupuestos</h1>
        <p className={styles.subtitle}>
          Crea presupuestos profesionales para tus clientes. Servicios, horas, materiales y descuentos.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de edición */}
        <div className={styles.editorPanel}>
          {/* Datos del Freelance */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>👤 Tus Datos (Freelance)</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Nombre / Razón Social</label>
                <input
                  type="text"
                  value={datosFreelance.nombre}
                  onChange={(e) => setDatosFreelance({ ...datosFreelance, nombre: e.target.value })}
                  placeholder="Tu nombre o empresa"
                />
              </div>
              <div className={styles.formGroup}>
                <label>NIF/CIF</label>
                <input
                  type="text"
                  value={datosFreelance.nif}
                  onChange={(e) => setDatosFreelance({ ...datosFreelance, nif: e.target.value })}
                  placeholder="12345678A"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={datosFreelance.email}
                  onChange={(e) => setDatosFreelance({ ...datosFreelance, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={datosFreelance.telefono}
                  onChange={(e) => setDatosFreelance({ ...datosFreelance, telefono: e.target.value })}
                  placeholder="600 123 456"
                />
              </div>
              <div className={styles.formGroupFull}>
                <label>Dirección</label>
                <input
                  type="text"
                  value={datosFreelance.direccion}
                  onChange={(e) => setDatosFreelance({ ...datosFreelance, direccion: e.target.value })}
                  placeholder="Calle, número, CP, ciudad"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Web (opcional)</label>
                <input
                  type="text"
                  value={datosFreelance.web}
                  onChange={(e) => setDatosFreelance({ ...datosFreelance, web: e.target.value })}
                  placeholder="www.tudominio.com"
                />
              </div>
            </div>
          </section>

          {/* Datos del Cliente */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🏢 Datos del Cliente</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Nombre de contacto</label>
                <input
                  type="text"
                  value={datosCliente.nombre}
                  onChange={(e) => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Empresa</label>
                <input
                  type="text"
                  value={datosCliente.empresa}
                  onChange={(e) => setDatosCliente({ ...datosCliente, empresa: e.target.value })}
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={datosCliente.email}
                  onChange={(e) => setDatosCliente({ ...datosCliente, email: e.target.value })}
                  placeholder="cliente@empresa.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={datosCliente.telefono}
                  onChange={(e) => setDatosCliente({ ...datosCliente, telefono: e.target.value })}
                  placeholder="900 123 456"
                />
              </div>
              <div className={styles.formGroupFull}>
                <label>Dirección (opcional)</label>
                <input
                  type="text"
                  value={datosCliente.direccion}
                  onChange={(e) => setDatosCliente({ ...datosCliente, direccion: e.target.value })}
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </section>

          {/* Configuración del presupuesto */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>⚙️ Configuración</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Nº Presupuesto</label>
                <input
                  type="text"
                  value={config.numero}
                  onChange={(e) => setConfig({ ...config, numero: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Fecha</label>
                <input
                  type="date"
                  value={config.fecha}
                  onChange={(e) => setConfig({ ...config, fecha: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Validez (días)</label>
                <input
                  type="number"
                  value={config.validezDias}
                  onChange={(e) => setConfig({ ...config, validezDias: e.target.value })}
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Condiciones de pago</label>
                <select
                  value={config.condicionesPago}
                  onChange={(e) => setConfig({ ...config, condicionesPago: e.target.value })}
                >
                  {condicionesPagoOpciones.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.taxOptions}>
              <div className={styles.taxOption}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.incluirIva}
                    onChange={(e) => setConfig({ ...config, incluirIva: e.target.checked })}
                  />
                  Incluir IVA
                </label>
                {config.incluirIva && (
                  <select
                    value={config.tipoIva}
                    onChange={(e) => setConfig({ ...config, tipoIva: e.target.value })}
                    className={styles.taxSelect}
                  >
                    <option value="21">21%</option>
                    <option value="10">10%</option>
                    <option value="4">4%</option>
                  </select>
                )}
              </div>

              <div className={styles.taxOption}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.incluirIrpf}
                    onChange={(e) => setConfig({ ...config, incluirIrpf: e.target.checked })}
                  />
                  Retención IRPF
                </label>
                {config.incluirIrpf && (
                  <select
                    value={config.tipoIrpf}
                    onChange={(e) => setConfig({ ...config, tipoIrpf: e.target.value })}
                    className={styles.taxSelect}
                  >
                    <option value="15">15%</option>
                    <option value="7">7%</option>
                  </select>
                )}
              </div>
            </div>
          </section>

          {/* Título del proyecto */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📝 Proyecto</h2>
            <div className={styles.formGroupFull}>
              <label>Título del proyecto / servicio</label>
              <input
                type="text"
                value={tituloProyecto}
                onChange={(e) => setTituloProyecto(e.target.value)}
                placeholder="Ej: Diseño y desarrollo de página web corporativa"
                className={styles.inputLarge}
              />
            </div>
          </section>

          {/* Líneas del presupuesto */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📊 Conceptos</h2>

            <div className={styles.addButtons}>
              <button onClick={() => agregarLinea('servicio')} className={styles.addBtn}>
                + Servicio
              </button>
              <button onClick={() => agregarLinea('hora')} className={styles.addBtn}>
                + Horas
              </button>
              <button onClick={() => agregarLinea('material')} className={styles.addBtn}>
                + Material
              </button>
            </div>

            <div className={styles.lineasContainer}>
              {lineas.map((linea, index) => (
                <div key={linea.id} className={styles.lineaItem}>
                  <div className={styles.lineaHeader}>
                    <span className={styles.lineaNumber}>{index + 1}</span>
                    <span className={styles.lineaTipo}>{getTipoLabel(linea.tipo)}</span>
                    {lineas.length > 1 && (
                      <button
                        onClick={() => eliminarLinea(linea.id)}
                        className={styles.deleteBtn}
                        title="Eliminar línea"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className={styles.lineaContent}>
                    <div className={styles.lineaDescripcion}>
                      <input
                        type="text"
                        value={linea.descripcion}
                        onChange={(e) => actualizarLinea(linea.id, 'descripcion', e.target.value)}
                        placeholder={
                          linea.tipo === 'servicio'
                            ? 'Descripción del servicio'
                            : linea.tipo === 'hora'
                            ? 'Tipo de trabajo (ej: desarrollo, consultoría)'
                            : 'Material o producto'
                        }
                      />
                    </div>
                    <div className={styles.lineaNumeros}>
                      <div className={styles.lineaField}>
                        <label>{linea.tipo === 'hora' ? 'Horas' : 'Cantidad'}</label>
                        <input
                          type="text"
                          value={linea.cantidad}
                          onChange={(e) => actualizarLinea(linea.id, 'cantidad', e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div className={styles.lineaField}>
                        <label>{linea.tipo === 'hora' ? '€/hora' : 'Precio €'}</label>
                        <input
                          type="text"
                          value={linea.precioUnitario}
                          onChange={(e) => actualizarLinea(linea.id, 'precioUnitario', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className={styles.lineaField}>
                        <label>Dto. %</label>
                        <input
                          type="text"
                          value={linea.descuento}
                          onChange={(e) => actualizarLinea(linea.id, 'descuento', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className={styles.lineaSubtotal}>
                        <label>Subtotal</label>
                        <span>{formatCurrency(calcularSubtotalLinea(linea))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notas */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📌 Notas adicionales</h2>
            <textarea
              value={config.notas}
              onChange={(e) => setConfig({ ...config, notas: e.target.value })}
              placeholder="Observaciones, términos especiales, exclusiones..."
              rows={3}
              className={styles.notasTextarea}
            />
          </section>

          {/* Totales */}
          <section className={styles.totalesSection}>
            <div className={styles.totalesGrid}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {config.incluirIva && (
                <div className={styles.totalRow}>
                  <span>IVA ({config.tipoIva}%)</span>
                  <span>{formatCurrency(ivaAmount)}</span>
                </div>
              )}
              {config.incluirIrpf && (
                <div className={styles.totalRow}>
                  <span>IRPF (-{config.tipoIrpf}%)</span>
                  <span>-{formatCurrency(irpfAmount)}</span>
                </div>
              )}
              <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </section>

          {/* Acciones */}
          <div className={styles.actions}>
            <button onClick={exportarPDF} className={styles.btnPrimary}>
              📄 Descargar PDF
            </button>
            <button onClick={nuevoPresupuesto} className={styles.btnSecondary}>
              ✨ Nuevo Presupuesto
            </button>
          </div>
        </div>

        {/* Vista previa */}
        <div className={styles.previewPanel}>
          <h2 className={styles.previewTitle}>Vista Previa</h2>
          <div className={styles.previewContainer}>
            <div ref={previewRef} className={styles.presupuestoDoc}>
              {/* Cabecera */}
              <div className={styles.docHeader}>
                <div className={styles.docHeaderLeft}>
                  <h1 className={styles.docTitulo}>PRESUPUESTO</h1>
                  <p className={styles.docNumero}>{config.numero}</p>
                </div>
                <div className={styles.docHeaderRight}>
                  <p><strong>Fecha:</strong> {new Date(config.fecha).toLocaleDateString('es-ES')}</p>
                  <p><strong>Válido hasta:</strong> {fechaValidez()}</p>
                </div>
              </div>

              {/* Datos freelance y cliente */}
              <div className={styles.docPartes}>
                <div className={styles.docParte}>
                  <h3>De:</h3>
                  <p><strong>{datosFreelance.nombre || 'Tu nombre'}</strong></p>
                  {datosFreelance.nif && <p>NIF: {datosFreelance.nif}</p>}
                  {datosFreelance.direccion && <p>{datosFreelance.direccion}</p>}
                  {datosFreelance.email && <p>{datosFreelance.email}</p>}
                  {datosFreelance.telefono && <p>{datosFreelance.telefono}</p>}
                  {datosFreelance.web && <p>{datosFreelance.web}</p>}
                </div>
                <div className={styles.docParte}>
                  <h3>Para:</h3>
                  <p><strong>{datosCliente.empresa || datosCliente.nombre || 'Cliente'}</strong></p>
                  {datosCliente.nombre && datosCliente.empresa && <p>Att: {datosCliente.nombre}</p>}
                  {datosCliente.direccion && <p>{datosCliente.direccion}</p>}
                  {datosCliente.email && <p>{datosCliente.email}</p>}
                  {datosCliente.telefono && <p>{datosCliente.telefono}</p>}
                </div>
              </div>

              {/* Título del proyecto */}
              {tituloProyecto && (
                <div className={styles.docProyecto}>
                  <h3>Proyecto:</h3>
                  <p>{tituloProyecto}</p>
                </div>
              )}

              {/* Tabla de conceptos */}
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Dto.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((linea) => (
                    <tr key={linea.id}>
                      <td>{linea.descripcion || '-'}</td>
                      <td>{linea.cantidad || 0}</td>
                      <td>{formatCurrency(parseSpanishNumber(linea.precioUnitario) || 0)}</td>
                      <td>{linea.descuento || 0}%</td>
                      <td>{formatCurrency(calcularSubtotalLinea(linea))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totales */}
              <div className={styles.docTotales}>
                <div className={styles.docTotalRow}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {config.incluirIva && (
                  <div className={styles.docTotalRow}>
                    <span>IVA ({config.tipoIva}%)</span>
                    <span>{formatCurrency(ivaAmount)}</span>
                  </div>
                )}
                {config.incluirIrpf && (
                  <div className={styles.docTotalRow}>
                    <span>Retención IRPF ({config.tipoIrpf}%)</span>
                    <span>-{formatCurrency(irpfAmount)}</span>
                  </div>
                )}
                <div className={`${styles.docTotalRow} ${styles.docTotalFinal}`}>
                  <span>TOTAL</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Condiciones */}
              <div className={styles.docCondiciones}>
                <h4>Condiciones:</h4>
                <ul>
                  <li><strong>Forma de pago:</strong> {config.condicionesPago}</li>
                  <li><strong>Validez:</strong> Este presupuesto es válido durante {config.validezDias} días desde su fecha de emisión.</li>
                  {config.notas && <li><strong>Notas:</strong> {config.notas}</li>}
                </ul>
              </div>

              {/* Footer del documento */}
              <div className={styles.docFooter}>
                <p>Presupuesto generado con meskeIA.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flujo freelance */}
      <section className={styles.flujoSection}>
        <h2>🔄 Flujo Completo Freelance</h2>
        <div className={styles.flujoSteps}>
          <div className={`${styles.flujoStep} ${styles.flujoStepActive}`}>
            <span className={styles.flujoIcon}>📋</span>
            <span className={styles.flujoLabel}>1. Presupuesto</span>
            <span className={styles.flujoDesc}>Estás aquí</span>
          </div>
          <div className={styles.flujoArrow}>→</div>
          <div className={styles.flujoStep}>
            <span className={styles.flujoIcon}>⏱️</span>
            <span className={styles.flujoLabel}>2. Time Tracker</span>
            <a href="/time-tracker/" className={styles.flujoLink}>Registra horas</a>
          </div>
          <div className={styles.flujoArrow}>→</div>
          <div className={styles.flujoStep}>
            <span className={styles.flujoIcon}>🧾</span>
            <span className={styles.flujoLabel}>3. Factura</span>
            <a href="/generador-facturas/" className={styles.flujoLink}>Genera factura</a>
          </div>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Cómo hacer un buen presupuesto?"
        subtitle="Consejos para presentar propuestas profesionales que cierren ventas"
        icon="📚"
      >
        <div className={styles.guideContent}>
          <section className={styles.guideSection}>
            <h3>🎯 Elementos de un Presupuesto Profesional</h3>
            <div className={styles.guideGrid}>
              <div className={styles.guideCard}>
                <h4>Datos claros</h4>
                <p>Incluye siempre tus datos fiscales completos y los del cliente. Genera confianza y profesionalidad.</p>
              </div>
              <div className={styles.guideCard}>
                <h4>Desglose detallado</h4>
                <p>Separa servicios, horas y materiales. El cliente debe entender exactamente qué está pagando.</p>
              </div>
              <div className={styles.guideCard}>
                <h4>Fecha de validez</h4>
                <p>Limita la validez del presupuesto (15-30 días). Crea urgencia y protege ante cambios de costes.</p>
              </div>
              <div className={styles.guideCard}>
                <h4>Condiciones de pago</h4>
                <p>Especifica claramente cuándo y cómo se realizarán los pagos. Anticipo recomendado para proyectos grandes.</p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h3>💡 Consejos para Cerrar Ventas</h3>
            <ul className={styles.tipsList}>
              <li><strong>Personaliza:</strong> Usa el nombre del cliente y referencia su proyecto específico.</li>
              <li><strong>Valor, no precio:</strong> Explica los beneficios que obtendrá el cliente, no solo lo que harás.</li>
              <li><strong>Opciones:</strong> Ofrece 2-3 paquetes con diferentes niveles de servicio.</li>
              <li><strong>Seguimiento:</strong> Haz seguimiento a los 3-5 días si no has recibido respuesta.</li>
              <li><strong>Anticipo:</strong> Solicita un 30-50% de anticipo para empezar. Es una práctica estándar.</li>
            </ul>
          </section>

          <section className={styles.guideSection}>
            <h3>📊 Tipos de Conceptos</h3>
            <div className={styles.tiposGrid}>
              <div className={styles.tipoCard}>
                <span className={styles.tipoIcon}>🛠️</span>
                <h4>Servicios</h4>
                <p>Tareas con precio fijo: diseño de logo, desarrollo web, consultoría estratégica.</p>
              </div>
              <div className={styles.tipoCard}>
                <span className={styles.tipoIcon}>⏱️</span>
                <h4>Horas</h4>
                <p>Trabajo facturado por hora: programación, asesoría, formación, mantenimiento.</p>
              </div>
              <div className={styles.tipoCard}>
                <span className={styles.tipoIcon}>📦</span>
                <h4>Materiales</h4>
                <p>Productos o licencias: hosting, dominios, plugins, fotografías de stock.</p>
              </div>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-presupuestos')} />
      <Footer appName="calculadora-presupuestos" />
    </div>
  );
}
