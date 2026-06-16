'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CalculadoraPresupuestos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, EducationalSection, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
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

      html2pdf().set(opt as any).from(previewRef.current).save();
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
        <span className={styles.heroIcon} aria-hidden="true">📋</span>
        <h1 className={styles.title}>Calculadora de Presupuestos</h1>
        <p className={styles.subtitle}>
          Crea presupuestos profesionales para tus clientes. Servicios, horas, materiales y descuentos.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-presupuestos"
        collapsible={false}
      />

      <div className={styles.mainContent}>
        {/* Panel de edición */}
        <div className={styles.editorPanel}>
          {/* Datos del Freelance */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">👤</span> Tus Datos (Freelance)</h2>
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">🏢</span> Datos del Cliente</h2>
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">⚙️</span> Configuración</h2>
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📝</span> Proyecto</h2>
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Conceptos</h2>

            <div className={styles.addButtons}>
              <button type="button" onClick={() => agregarLinea('servicio')} className={styles.addBtn}>
                + Servicio
              </button>
              <button type="button" onClick={() => agregarLinea('hora')} className={styles.addBtn}>
                + Horas
              </button>
              <button type="button" onClick={() => agregarLinea('material')} className={styles.addBtn}>
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
                        type="button"
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📌</span> Notas adicionales</h2>
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
            <button type="button" onClick={exportarPDF} className={styles.btnPrimary}>
              <span aria-hidden="true">📄</span> Descargar PDF
            </button>
            <button type="button" onClick={nuevoPresupuesto} className={styles.btnSecondary}>
              <span aria-hidden="true">✨</span> Nuevo Presupuesto
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
        <h2><span aria-hidden="true">🔄</span> Flujo Completo Freelance</h2>
        <div className={styles.flujoSteps}>
          <div className={`${styles.flujoStep} ${styles.flujoStepActive}`}>
            <span className={styles.flujoIcon} aria-hidden="true">📋</span>
            <span className={styles.flujoLabel}>1. Presupuesto</span>
            <span className={styles.flujoDesc}>Estás aquí</span>
          </div>
          <div className={styles.flujoArrow}>→</div>
          <div className={styles.flujoStep}>
            <span className={styles.flujoIcon} aria-hidden="true">⏱️</span>
            <span className={styles.flujoLabel}>2. Time Tracker</span>
            <a href="/time-tracker/" className={styles.flujoLink}>Registra horas</a>
          </div>
          <div className={styles.flujoArrow}>→</div>
          <div className={styles.flujoStep}>
            <span className={styles.flujoIcon} aria-hidden="true">🧾</span>
            <span className={styles.flujoLabel}>3. Factura</span>
            <a href="/generador-facturas/" className={styles.flujoLink}>Genera factura</a>
          </div>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 Guía completa para crear presupuestos comerciales profesionales"
        subtitle="Aprende a estructurar, presentar y negociar presupuestos que cierren más ventas y protejan tu negocio"
        icon="📚"
      >
        <section className={styles.eduComparativa}>
          <h2><span aria-hidden="true">⚖️</span> Tipos de presupuesto: formatos y cuándo usar cada uno</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Formato</th>
                  <th>Ideal para</th>
                  <th>Ventaja</th>
                  <th>Riesgo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Precio cerrado</strong></td>
                  <td>Importe fijo total</td>
                  <td>Proyectos bien definidos</td>
                  <td>Seguridad para el cliente</td>
                  <td>Asumes el riesgo de desviaciones</td>
                </tr>
                <tr>
                  <td><strong>Por horas</strong></td>
                  <td>Tarifa/hora × estimación</td>
                  <td>Consultoría, soporte</td>
                  <td>Justo para ambas partes</td>
                  <td>Incertidumbre para el cliente</td>
                </tr>
                <tr>
                  <td><strong>Hitos/fases</strong></td>
                  <td>Presupuesto por fase</td>
                  <td>Proyectos largos o complejos</td>
                  <td>Flexibilidad y control</td>
                  <td>Más gestión administrativa</td>
                </tr>
                <tr>
                  <td><strong>Retainer mensual</strong></td>
                  <td>Cuota fija mensual</td>
                  <td>Servicios recurrentes</td>
                  <td>Ingresos predecibles</td>
                  <td>Definir bien el alcance incluido</td>
                </tr>
                <tr>
                  <td><strong>Success fee</strong></td>
                  <td>% sobre resultado obtenido</td>
                  <td>Marketing, ventas, M&amp;A</td>
                  <td>Alineación de incentivos</td>
                  <td>Cobro diferido, dependes del cliente</td>
                </tr>
                <tr>
                  <td><strong>Paquetes tiered</strong></td>
                  <td>Básico / Estándar / Premium</td>
                  <td>Servicios con variantes</td>
                  <td>El cliente elige; ancla al medio</td>
                  <td>Complejidad de definir cada tier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.eduEscenarios}>
          <h2><span aria-hidden="true">🎯</span> Casos reales de presupuestos por sector</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎨</span>
                <h3>Diseñador freelance — web corporativa</h3>
              </div>
              <p className={styles.escenarioExample}>Diseño web 5 páginas: 1.200 €. Desarrollo WordPress: 800 €. SEO básico: 300 €. Formación cliente: 150 €. <strong>Total: 2.450 € + IVA. Anticipo 40% al firmar.</strong></p>
              <p className={styles.escenarioTip}>💡 Desglosar en líneas separadas justifica el precio y reduce negociación por precio total.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h3>Agencia de desarrollo — app móvil</h3>
              </div>
              <p className={styles.escenarioExample}>Análisis y diseño UX: 3.500 €. Desarrollo iOS: 8.000 €. Desarrollo Android: 7.500 €. QA: 2.000 €. Producción: 500 €. <strong>Total: 21.500 € en 3 hitos (30/40/30%).</strong></p>
              <p className={styles.escenarioTip}>💡 Presupuestos grandes en hitos reducen el riesgo de impago y permiten ajustes tras cada fase.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📢</span>
                <h3>Consultor de marketing — retainer</h3>
              </div>
              <p className={styles.escenarioExample}>Gestión redes sociales (3 canales): 600 €/mes. Newsletter: 200 €/mes. Informe mensual: 150 €/mes. <strong>Total: 950 €/mes. Contrato mínimo 3 meses.</strong></p>
              <p className={styles.escenarioTip}>💡 Los retainers con mínimo de meses protegen frente a cancelaciones y facilitan la planificación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏗️</span>
                <h3>Instalador / reformas — precio cerrado</h3>
              </div>
              <p className={styles.escenarioExample}>Materiales: 1.850 €. Mano de obra (3 días × 2 operarios): 1.440 €. Gestión residuos: 120 €. <strong>Total: 3.410 € + IVA. Anticipo 50% antes de inicio.</strong></p>
              <p className={styles.escenarioTip}>💡 Especifica siempre qué materiales están incluidos y qué queda fuera del precio.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h3>Asesor fiscal — paquetes tiered</h3>
              </div>
              <p className={styles.escenarioExample}>Básico (IRPF simple): 120 €. Estándar (IRPF + actividad): 280 €. Premium (IRPF + sociedades + IVA trimestral): 850 €/año. <strong>El 70% elige el tier medio.</strong></p>
              <p className={styles.escenarioTip}>💡 La estrategia de 3 opciones hace que el tier medio parezca la opción &quot;sensata&quot;. Diséñalo intencionalmente.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📸</span>
                <h3>Fotógrafo — evento corporativo</h3>
              </div>
              <p className={styles.escenarioExample}>Sesión (6 horas): 900 €. Edición y retoque (80 fotos): 400 €. Álbum digital: 100 €. Derechos de uso: 200 €. <strong>Total: 1.600 € + IVA. 50% anticipo, 50% en entrega.</strong></p>
              <p className={styles.escenarioTip}>💡 Especifica siempre los derechos de uso. Sin cláusula, el cliente asume uso libre ilimitado.</p>
            </div>
          </div>
        </section>

        <section className={styles.eduFaq}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre presupuestos comerciales</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuánto anticipo debo pedir?</h4>
              <p>El estándar para servicios freelance y agencias es entre el 30% y el 50% antes de empezar. Para proyectos pequeños (&lt;500 €) puedes pedir el 100% por adelantado. Para proyectos grandes (&gt;5.000 €): 30% al firmar, 40% a mitad del proyecto, 30% en entrega. El anticipo es práctica profesional estándar que el cliente sano acepta sin problema.</p>
              <p className={styles.faqTip}>💡 <strong>Red flag:</strong> Un cliente que se niega a dar cualquier anticipo es un riesgo de impago. El anticipo alinea intereses.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Tengo que incluir el IVA en el presupuesto?</h4>
              <p>Para empresas y autónomos (B2B): presenta precio sin IVA, añade el IVA por separado (pueden deducirlo). Para particulares (B2C): precio siempre con IVA incluido (obligatorio legalmente). Si tienes retención de IRPF (15%), indícala también para evitar sorpresas al cliente.</p>
              <p className={styles.faqTip}>💡 Si eres profesional con retención, el cliente pagará el importe de la factura menos el 15% de IRPF que él ingresará en Hacienda.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué pasa si el cliente pide más trabajo del presupuestado?</h4>
              <p>Esto se llama &quot;scope creep&quot; y es el problema más común en proyectos freelance. Cuando el cliente pide algo extra, responde: &quot;Con mucho gusto, esto no estaba incluido en el presupuesto inicial. Te preparo un presupuesto adicional.&quot; Nunca hagas trabajo extra sin documentarlo y aprobarlo por escrito.</p>
              <p className={styles.faqTip}>💡 <strong>Cláusula recomendada:</strong> &quot;Cualquier trabajo adicional no especificado será presupuestado y aprobado por separado antes de su ejecución.&quot;</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuánto tiempo debe estar vigente un presupuesto?</h4>
              <p>Lo habitual es 15-30 días. Esto crea urgencia y te protege ante subidas de costes. Indica claramente la fecha de validez. Si el cliente acepta después del plazo, tienes derecho a revisar precios si han cambiado tus costes.</p>
              <p className={styles.faqTip}>💡 Para proyectos con materiales volátiles (construcción, electrónica), considera validez de 7-10 días o indica que precios de materiales están sujetos a confirmación en el momento del pedido.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Debo firmar contrato además del presupuesto?</h4>
              <p>Idealmente sí, especialmente para proyectos de más de 1.000 €. Un contrato añade: condiciones de cancelación, propiedad intelectual, garantías y plazos de corrección, penalizaciones por retrasos. Para proyectos pequeños, un presupuesto firmado con condiciones generales al dorso puede ser suficiente.</p>
              <p className={styles.faqTip}>💡 El presupuesto aceptado por email tiene valor legal, pero un contrato firmado es más robusto. Invertir 200-400 € en un contrato básico revisado por abogado protege proyectos recurrentes.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo negociar cuando el cliente dice que es muy caro?</h4>
              <p>Tres estrategias: (1) Reducir alcance: &quot;Podemos ajustar el precio si reducimos el proyecto a X, Y y Z&quot;. (2) Escalonar pagos: mantener el precio pero repartir en más plazos. (3) Justificar el valor: explicar qué problema resuelve. Nunca bajes el precio sin quitar algo del alcance.</p>
              <p className={styles.faqTip}>💡 <strong>Táctica de anclaje:</strong> Presenta primero la opción más cara. Cuando la rechace, la opción media (tu objetivo real) parecerá razonable por contraste.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo incluir gastos de gestión o materiales con margen?</h4>
              <p>Sí, es práctica habitual y legítima. Los gastos de gestión se facturan normalmente con un margen del 10-20%. Los materiales suelen llevar un margen del 15-30% según el sector. Indica en el presupuesto &quot;materiales según especificación&quot; sin detallar precios de coste.</p>
              <p className={styles.faqTip}>💡 En sectores regulados (farmacia, construcción con proyecto), los márgenes pueden estar más controlados. Consulta las normas de tu sector.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué hago si un cliente no paga el presupuesto aceptado?</h4>
              <p>Proceso: (1) Recordatorio amable a los 5 días. (2) Llamada telefónica a los 15 días. (3) Burofax con requerimiento a los 30 días (valor probatorio). (4) Reclamación en juzgado de lo mercantil (proceso monitorio) para deudas &gt;2.000 €. El presupuesto aceptado + facturas emitidas es documentación suficiente para reclamación judicial.</p>
              <p className={styles.faqTip}>💡 <strong>Prevención:</strong> El anticipo del 30-50% es tu mejor protección. Si el cliente no paga el final, al menos has cobrado la mayor parte del trabajo.</p>
            </div>
          </div>
        </section>

        <section className={styles.eduGuia}>
          <h2><span aria-hidden="true">📋</span> Cómo crear un presupuesto que cierre ventas</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Entiende el proyecto antes de presupuestar</h4>
                <p>Antes de enviar números, haz una reunión o llamada de descubrimiento. Pregunta: ¿cuál es el objetivo real? ¿qué han hecho antes? ¿cuál es el plazo? ¿cuál es su presupuesto aproximado? 30 minutos de llamada previa pueden ahorrar semanas de trabajo mal pagado.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Desglosa el proyecto en líneas de trabajo concretas</h4>
                <p>Evita una sola línea &quot;Proyecto X: 5.000 €&quot;. Desglosa en: análisis/estrategia, diseño, desarrollo, revisiones, entrega, formación. El desglose justifica el precio y facilita ajustes si el cliente quiere reducir.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Calcula tus costes reales y añade tu margen</h4>
                <p>Incluye: horas de trabajo a tu tarifa objetivo, subcontratas o colaboradores, licencias y herramientas, tiempo de gestión y comunicación (20-30% del proyecto), y un margen de contingencia del 10-15% para imprevistos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Define claramente el alcance y lo que NO está incluido</h4>
                <p>Tan importante como lo que sí incluye es lo que explícitamente no incluye. Ejemplo: &quot;Incluye hasta 2 rondas de revisión. Revisiones adicionales: 80 €/hora.&quot; Esto previene el scope creep y conflictos posteriores.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Establece condiciones de pago y plazos claros</h4>
                <p>Especifica: porcentaje y momento de cada pago (anticipo, hitos, entrega), método de pago aceptado, plazo de validez del presupuesto, plazo estimado de entrega. La claridad en condiciones transmite profesionalidad.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Presenta la propuesta de forma profesional</h4>
                <p>Usa esta herramienta para generar el PDF. Personaliza el título con el nombre del cliente y el proyecto. Añade una breve introducción que muestre que entiendes su situación. Un presupuesto bien presentado ya comunica la calidad de tu trabajo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Haz seguimiento activo</h4>
                <p>Si en 3-5 días hábiles no tienes respuesta, envía un email de seguimiento: &quot;¿Has tenido oportunidad de revisar la propuesta?&quot; El 40-60% de los presupuestos ganados requieren seguimiento. No es insistir; es cerrar la venta.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.eduTips}>
          <h2><span aria-hidden="true">✅</span> Mejores prácticas para presupuestos que se aceptan</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Personaliza siempre</h4>
              <p>Menciona el nombre del cliente, su empresa y el objetivo concreto. Un presupuesto genérico parece una plantilla; uno personalizado parece una propuesta real.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💶</span>
              <h4>Ancla con la opción más cara</h4>
              <p>Si ofreces paquetes, presenta primero el más caro. El precio del medio parecerá más razonable por contraste. El 60-70% de clientes elige la opción media.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📄</span>
              <h4>Una página o menos</h4>
              <p>Para proyectos hasta 5.000 €, el presupuesto debería caber en 1-2 páginas. Los presupuestos largos dan miedo y reducen la tasa de aceptación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <h4>Responde rápido</h4>
              <p>Enviar el presupuesto en las 24h siguientes a la reunión aumenta la tasa de aceptación. La rapidez transmite profesionalidad y aprovecha el interés en caliente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔔</span>
              <h4>Crea urgencia real</h4>
              <p>La fecha de validez no es un truco: si tienes agenda ocupada, el cliente que espera puede quedarse sin plaza. Comunícalo honestamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Habla de ROI, no de precio</h4>
              <p>Muestra el retorno: &quot;Con esta web, si consigues un cliente más al mes, el proyecto se amortiza en 2 meses.&quot; El precio se convierte en inversión.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores frecuentes en presupuestos que cuestan clientes y dinero</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ No definir el alcance por escrito:</strong> Sin alcance claro, el cliente asumirá que todo lo que se le ocurra está incluido. El scope creep es la causa número uno de proyectos no rentables para freelances y agencias.</li>
            <li><strong>❌ Presupuestar sin reunión previa:</strong> Un presupuesto sin entender el proyecto real acaba siendo demasiado caro o demasiado barato. 30 minutos de llamada previa pueden ahorrar semanas de trabajo mal pagado.</li>
            <li><strong>❌ No pedir anticipo en proyectos nuevos:</strong> Sin anticipo, el cliente no tiene skin in the game. Los proyectos sin anticipo tienen mayor tasa de cancelación, cambios de criterio y retrasos en respuestas.</li>
            <li><strong>❌ Hacer descuentos sin quitar alcance:</strong> Si bajas el precio sin reducir lo que entregas, creas un precedente: el cliente siempre intentará negociar. En su lugar: &quot;Puedo bajar el precio si eliminamos X parte del proyecto.&quot;</li>
            <li><strong>❌ No incluir revisiones en el presupuesto:</strong> Las revisiones son trabajo. Si no las limitas explícitamente (ej: &quot;hasta 2 rondas de revisión incluidas&quot;), el cliente puede pedir cambios indefinidamente.</li>
            <li><strong>❌ Olvidar el tiempo de gestión y comunicación:</strong> Las reuniones, emails, llamadas y gestión del proyecto pueden representar el 20-30% del tiempo total. Si no los incluyes en el presupuesto, estás regalando ese tiempo.</li>
            <li><strong>❌ No hacer seguimiento:</strong> El 40-60% de los presupuestos aceptados requieren al menos un seguimiento. No hacer seguimiento es dejar dinero sobre la mesa.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-presupuestos')} />
      <ShareCard appName="calculadora-presupuestos" />
      <Footer appName="calculadora-presupuestos" />
    </div>
  );
}
