'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GeneradorFacturas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { formatCurrency, formatDate } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface DatosEmisor {
  nombre: string;
  nif: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  telefono: string;
  email: string;
}

interface DatosCliente {
  nombre: string;
  nif: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
}

// Tipos para validación
type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'warning';

interface ValidationState {
  status: ValidationStatus;
  message: string;
  suggestion?: string;
  details?: Record<string, string>;
}

interface ValidationStates {
  emisorNif: ValidationState;
  emisorEmail: ValidationState;
  emisorTelefono: ValidationState;
  clienteNif: ValidationState;
}

const initialValidationState: ValidationState = {
  status: 'idle',
  message: '',
};

// Funciones de validación con las APIs internas
async function validarNIF(documento: string): Promise<ValidationState> {
  if (!documento.trim()) {
    return { status: 'idle', message: '' };
  }

  try {
    const response = await fetch('/api/validaciones/nif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento }),
    });

    const data = await response.json();

    if (data.valido) {
      const tipoEntidad = data.detalles?.tipo_entidad;
      return {
        status: 'valid',
        message: tipoEntidad ? `${data.tipo} válido - ${tipoEntidad}` : data.mensaje,
        details: { tipo: data.tipo, formateado: data.documento_formateado },
      };
    } else {
      return {
        status: 'invalid',
        message: data.mensaje,
        details: data.detalles,
      };
    }
  } catch {
    return { status: 'idle', message: 'Error al validar' };
  }
}

async function validarEmail(email: string): Promise<ValidationState> {
  if (!email.trim()) {
    return { status: 'idle', message: '' };
  }

  try {
    const response = await fetch('/api/validaciones/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!data.formato_valido) {
      return {
        status: 'invalid',
        message: data.advertencias?.[0] || 'Formato de email inválido',
      };
    }

    if (data.sugerencia) {
      return {
        status: 'warning',
        message: `¿Quisiste decir ${data.sugerencia}?`,
        suggestion: data.sugerencia,
      };
    }

    if (data.es_desechable) {
      return {
        status: 'warning',
        message: 'Este parece ser un email temporal',
      };
    }

    if (data.advertencias?.length > 0) {
      return {
        status: 'warning',
        message: data.advertencias[0],
      };
    }

    return {
      status: 'valid',
      message: 'Email válido',
    };
  } catch {
    return { status: 'idle', message: 'Error al validar' };
  }
}

async function validarTelefono(telefono: string): Promise<ValidationState> {
  if (!telefono.trim()) {
    return { status: 'idle', message: '' };
  }

  try {
    const response = await fetch('/api/validaciones/telefono', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono }),
    });

    const data = await response.json();

    if (data.valido) {
      const info = data.tipo === 'movil' ? 'Móvil' :
                   data.tipo === 'fijo' ? `Fijo${data.provincia ? ` (${data.provincia})` : ''}` :
                   data.tipo;
      return {
        status: 'valid',
        message: `${info} válido`,
        details: { formateado: data.formato_nacional },
      };
    } else {
      return {
        status: 'invalid',
        message: data.mensaje,
      };
    }
  } catch {
    return { status: 'idle', message: 'Error al validar' };
  }
}

interface LineaFactura {
  id: string;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  tipoIva: number;
}

interface ConfiguracionFactura {
  serie: string;
  numero: number;
  fecha: string;
  aplicarIrpf: boolean;
  porcentajeIrpf: number;
  notas: string;
  formaPago: string;
}

interface FacturaGuardada {
  id: string;
  numero: string;
  fecha: string;
  cliente: string;
  total: number;
}

const STORAGE_KEY_EMISOR = 'meskeia_factura_emisor';
const STORAGE_KEY_CONFIG = 'meskeia_factura_config';
const STORAGE_KEY_HISTORIAL = 'meskeia_factura_historial';

const TIPOS_IVA = [
  { valor: 21, label: '21% (General)' },
  { valor: 10, label: '10% (Reducido)' },
  { valor: 4, label: '4% (Superreducido)' },
  { valor: 0, label: '0% (Exento)' },
];

const FORMAS_PAGO = [
  'Transferencia bancaria',
  'Domiciliación bancaria',
  'Efectivo',
  'Tarjeta de crédito',
  'PayPal',
  'Bizum',
  'Otro',
];

export default function GeneradorFacturasPage() {
  // Estado del emisor
  const [emisor, setEmisor] = useState<DatosEmisor>({
    nombre: '',
    nif: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: '',
  });

  // Estado del cliente
  const [cliente, setCliente] = useState<DatosCliente>({
    nombre: '',
    nif: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
  });

  // Líneas de factura
  const [lineas, setLineas] = useState<LineaFactura[]>([
    { id: '1', concepto: '', cantidad: 1, precioUnitario: 0, tipoIva: 21 },
  ]);

  // Configuración
  const [config, setConfig] = useState<ConfiguracionFactura>({
    serie: 'A',
    numero: 1,
    fecha: new Date().toISOString().split('T')[0],
    aplicarIrpf: false,
    porcentajeIrpf: 15,
    notas: '',
    formaPago: 'Transferencia bancaria',
  });

  // Historial
  const [historial, setHistorial] = useState<FacturaGuardada[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Vista previa
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Estados de validación
  const [validations, setValidations] = useState<ValidationStates>({
    emisorNif: initialValidationState,
    emisorEmail: initialValidationState,
    emisorTelefono: initialValidationState,
    clienteNif: initialValidationState,
  });

  // Debounce refs para evitar llamadas excesivas
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Función para validar con debounce
  const validateWithDebounce = useCallback((
    field: keyof ValidationStates,
    value: string,
    validatorFn: (value: string) => Promise<ValidationState>
  ) => {
    // Limpiar timer anterior
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }

    // Si está vacío, resetear
    if (!value.trim()) {
      setValidations(prev => ({
        ...prev,
        [field]: initialValidationState,
      }));
      return;
    }

    // Marcar como validando
    setValidations(prev => ({
      ...prev,
      [field]: { status: 'validating', message: 'Validando...' },
    }));

    // Esperar 500ms antes de validar
    debounceTimers.current[field] = setTimeout(async () => {
      const result = await validatorFn(value);
      setValidations(prev => ({
        ...prev,
        [field]: result,
      }));
    }, 500);
  }, []);

  // Handlers de validación onBlur
  const handleEmisorNifBlur = useCallback(() => {
    validateWithDebounce('emisorNif', emisor.nif, validarNIF);
  }, [emisor.nif, validateWithDebounce]);

  const handleEmisorEmailBlur = useCallback(() => {
    validateWithDebounce('emisorEmail', emisor.email, validarEmail);
  }, [emisor.email, validateWithDebounce]);

  const handleEmisorTelefonoBlur = useCallback(() => {
    validateWithDebounce('emisorTelefono', emisor.telefono, validarTelefono);
  }, [emisor.telefono, validateWithDebounce]);

  const handleClienteNifBlur = useCallback(() => {
    validateWithDebounce('clienteNif', cliente.nif, validarNIF);
  }, [cliente.nif, validateWithDebounce]);

  // Aplicar sugerencia de email
  const aplicarSugerenciaEmail = useCallback(() => {
    if (validations.emisorEmail.suggestion) {
      setEmisor(prev => ({ ...prev, email: validations.emisorEmail.suggestion! }));
      setValidations(prev => ({
        ...prev,
        emisorEmail: { status: 'valid', message: 'Email corregido' },
      }));
    }
  }, [validations.emisorEmail.suggestion]);

  // Componente para renderizar icono de validación
  const ValidationIcon = ({ status }: { status: ValidationStatus }) => {
    if (status === 'idle') return null;
    if (status === 'validating') return <span className={`${styles.validationIcon} ${styles.loading}`}>⟳</span>;
    if (status === 'valid') return <span className={`${styles.validationIcon} ${styles.valid}`}>✓</span>;
    if (status === 'invalid') return <span className={`${styles.validationIcon} ${styles.invalid}`}>✗</span>;
    if (status === 'warning') return <span className={`${styles.validationIcon} ${styles.invalid}`}>⚠</span>;
    return null;
  };

  // Componente para mensaje de validación
  const ValidationMessage = ({ validation, onSuggestionClick }: {
    validation: ValidationState;
    onSuggestionClick?: () => void;
  }) => {
    if (validation.status === 'idle' || validation.status === 'validating') return null;

    const className = validation.status === 'valid' ? styles.success :
                      validation.status === 'invalid' ? styles.error :
                      styles.warning;

    return (
      <div className={`${styles.validationMessage} ${className}`}>
        {validation.message}
        {validation.suggestion && onSuggestionClick && (
          <>
            {' '}
            <button type="button" onClick={onSuggestionClick} className={styles.suggestionLink}>
              Aplicar
            </button>
          </>
        )}
      </div>
    );
  };

  // Cargar datos guardados
  useEffect(() => {
    const savedEmisor = localStorage.getItem(STORAGE_KEY_EMISOR);
    if (savedEmisor) {
      try {
        setEmisor(JSON.parse(savedEmisor));
      } catch { /* ignorar */ }
    }

    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({
          ...prev,
          serie: parsed.serie || 'A',
          numero: parsed.numero || 1,
          aplicarIrpf: parsed.aplicarIrpf || false,
          porcentajeIrpf: parsed.porcentajeIrpf || 15,
          formaPago: parsed.formaPago || 'Transferencia bancaria',
        }));
      } catch { /* ignorar */ }
    }

    const savedHistorial = localStorage.getItem(STORAGE_KEY_HISTORIAL);
    if (savedHistorial) {
      try {
        setHistorial(JSON.parse(savedHistorial));
      } catch { /* ignorar */ }
    }
  }, []);

  // Guardar emisor cuando cambia
  useEffect(() => {
    if (emisor.nombre || emisor.nif) {
      localStorage.setItem(STORAGE_KEY_EMISOR, JSON.stringify(emisor));
    }
  }, [emisor]);

  // Guardar config cuando cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
      serie: config.serie,
      numero: config.numero,
      aplicarIrpf: config.aplicarIrpf,
      porcentajeIrpf: config.porcentajeIrpf,
      formaPago: config.formaPago,
    }));
  }, [config]);

  // Cálculos
  const calculos = (() => {
    let baseImponible = 0;
    const desglosesIva: Record<number, { base: number; cuota: number }> = {};

    lineas.forEach(linea => {
      const subtotal = linea.cantidad * linea.precioUnitario;
      baseImponible += subtotal;

      if (!desglosesIva[linea.tipoIva]) {
        desglosesIva[linea.tipoIva] = { base: 0, cuota: 0 };
      }
      desglosesIva[linea.tipoIva].base += subtotal;
      desglosesIva[linea.tipoIva].cuota += subtotal * (linea.tipoIva / 100);
    });

    const totalIva = Object.values(desglosesIva).reduce((sum, d) => sum + d.cuota, 0);
    const retencionIrpf = config.aplicarIrpf ? baseImponible * (config.porcentajeIrpf / 100) : 0;
    const total = baseImponible + totalIva - retencionIrpf;

    return { baseImponible, desglosesIva, totalIva, retencionIrpf, total };
  })();

  // Funciones de líneas
  const agregarLinea = () => {
    setLineas([...lineas, {
      id: Date.now().toString(),
      concepto: '',
      cantidad: 1,
      precioUnitario: 0,
      tipoIva: 21,
    }]);
  };

  const eliminarLinea = (id: string) => {
    if (lineas.length > 1) {
      setLineas(lineas.filter(l => l.id !== id));
    }
  };

  const actualizarLinea = (id: string, campo: keyof LineaFactura, valor: string | number) => {
    setLineas(lineas.map(l =>
      l.id === id ? { ...l, [campo]: valor } : l
    ));
  };

  // Número de factura formateado
  const numeroFactura = `${config.serie}-${config.numero.toString().padStart(4, '0')}`;

  // Validación básica
  const camposBasicosValidos = emisor.nombre && emisor.nif && cliente.nombre &&
    lineas.some(l => l.concepto && l.precioUnitario > 0);

  // Verificar que no hay errores de validación en campos obligatorios
  const hayErroresValidacion =
    validations.emisorNif.status === 'invalid' ||
    (cliente.nif && validations.clienteNif.status === 'invalid');

  // Validación completa
  const esValida = camposBasicosValidos && !hayErroresValidacion;

  // Guardar en historial y avanzar número
  const guardarFactura = () => {
    const nueva: FacturaGuardada = {
      id: Date.now().toString(),
      numero: numeroFactura,
      fecha: config.fecha,
      cliente: cliente.nombre,
      total: calculos.total,
    };

    const nuevoHistorial = [nueva, ...historial].slice(0, 50); // Máximo 50
    setHistorial(nuevoHistorial);
    localStorage.setItem(STORAGE_KEY_HISTORIAL, JSON.stringify(nuevoHistorial));

    // Avanzar número
    setConfig(prev => ({ ...prev, numero: prev.numero + 1 }));
  };

  // Generar PDF
  const generarPDF = async () => {
    if (!esValida) {
      alert('Por favor, completa los datos obligatorios: emisor (nombre y NIF), cliente (nombre) y al menos una línea con concepto y precio.');
      return;
    }

    guardarFactura();
    setMostrarPreview(true);

    // Esperar a que se renderice y usar window.print()
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Nueva factura
  const nuevaFactura = () => {
    setCliente({
      nombre: '',
      nif: '',
      direccion: '',
      codigoPostal: '',
      ciudad: '',
      provincia: '',
    });
    setLineas([{ id: '1', concepto: '', cantidad: 1, precioUnitario: 0, tipoIva: 21 }]);
    setConfig(prev => ({
      ...prev,
      fecha: new Date().toISOString().split('T')[0],
      notas: '',
    }));
    setMostrarPreview(false);
    // Resetear validaciones del cliente (las del emisor se mantienen)
    setValidations(prev => ({
      ...prev,
      clienteNif: initialValidationState,
    }));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Facturas</h1>
        <p className={styles.subtitle}>Crea facturas profesionales y expórtalas a PDF</p>
      </header>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <strong>⚠️ Aviso importante:</strong> Esta herramienta genera facturas para uso orientativo y personal.
        A partir de 2026, los autónomos en España deberán usar software homologado con el sistema Verifactu.
        Consulta con tu asesor fiscal para cumplir con la normativa vigente.
      </div>

      <div className={styles.mainContent}>
        {/* Panel izquierdo: Formulario */}
        <div className={styles.formPanel}>
          {/* Datos del emisor */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              👤 Tus datos (Emisor)
              <span className={styles.sectionHint}>Se guardan automáticamente</span>
            </h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="emisorNombre">Nombre / Razón social *</label>
                <input
                  id="emisorNombre"
                  type="text"
                  value={emisor.nombre}
                  onChange={e => setEmisor({ ...emisor, nombre: e.target.value })}
                  placeholder="Tu nombre o empresa"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="emisorNif">NIF / CIF *</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="emisorNif"
                    type="text"
                    value={emisor.nif}
                    onChange={e => setEmisor({ ...emisor, nif: e.target.value.toUpperCase() })}
                    onBlur={handleEmisorNifBlur}
                    placeholder="12345678A"
                    className={`${styles.input} ${styles.inputWithValidation} ${
                      validations.emisorNif.status === 'valid' ? styles.valid :
                      validations.emisorNif.status === 'invalid' ? styles.invalid : ''
                    }`}
                  />
                  <ValidationIcon status={validations.emisorNif.status} />
                </div>
                <ValidationMessage validation={validations.emisorNif} />
              </div>
              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <label htmlFor="emisorDireccion">Dirección</label>
                <input
                  id="emisorDireccion"
                  type="text"
                  value={emisor.direccion}
                  onChange={e => setEmisor({ ...emisor, direccion: e.target.value })}
                  placeholder="Calle, número, piso..."
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="emisorCP">Código Postal</label>
                <input
                  id="emisorCP"
                  type="text"
                  value={emisor.codigoPostal}
                  onChange={e => setEmisor({ ...emisor, codigoPostal: e.target.value })}
                  placeholder="08001"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="emisorCiudad">Ciudad</label>
                <input
                  id="emisorCiudad"
                  type="text"
                  value={emisor.ciudad}
                  onChange={e => setEmisor({ ...emisor, ciudad: e.target.value })}
                  placeholder="Barcelona"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="emisorTelefono">Teléfono</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="emisorTelefono"
                    type="tel"
                    value={emisor.telefono}
                    onChange={e => setEmisor({ ...emisor, telefono: e.target.value })}
                    onBlur={handleEmisorTelefonoBlur}
                    placeholder="600 123 456"
                    className={`${styles.input} ${styles.inputWithValidation} ${
                      validations.emisorTelefono.status === 'valid' ? styles.valid :
                      validations.emisorTelefono.status === 'invalid' ? styles.invalid : ''
                    }`}
                  />
                  <ValidationIcon status={validations.emisorTelefono.status} />
                </div>
                <ValidationMessage validation={validations.emisorTelefono} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="emisorEmail">Email</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="emisorEmail"
                    type="email"
                    value={emisor.email}
                    onChange={e => setEmisor({ ...emisor, email: e.target.value })}
                    onBlur={handleEmisorEmailBlur}
                    placeholder="tu@email.com"
                    className={`${styles.input} ${styles.inputWithValidation} ${
                      validations.emisorEmail.status === 'valid' ? styles.valid :
                      validations.emisorEmail.status === 'invalid' ? styles.invalid :
                      validations.emisorEmail.status === 'warning' ? styles.invalid : ''
                    }`}
                  />
                  <ValidationIcon status={validations.emisorEmail.status} />
                </div>
                <ValidationMessage
                  validation={validations.emisorEmail}
                  onSuggestionClick={validations.emisorEmail.suggestion ? aplicarSugerenciaEmail : undefined}
                />
              </div>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🏢 Datos del cliente</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="clienteNombre">Nombre / Razón social *</label>
                <input
                  id="clienteNombre"
                  type="text"
                  value={cliente.nombre}
                  onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                  placeholder="Nombre del cliente"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="clienteNif">NIF / CIF</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="clienteNif"
                    type="text"
                    value={cliente.nif}
                    onChange={e => setCliente({ ...cliente, nif: e.target.value.toUpperCase() })}
                    onBlur={handleClienteNifBlur}
                    placeholder="B12345678"
                    className={`${styles.input} ${styles.inputWithValidation} ${
                      validations.clienteNif.status === 'valid' ? styles.valid :
                      validations.clienteNif.status === 'invalid' ? styles.invalid : ''
                    }`}
                  />
                  <ValidationIcon status={validations.clienteNif.status} />
                </div>
                <ValidationMessage validation={validations.clienteNif} />
              </div>
              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <label htmlFor="clienteDireccion">Dirección</label>
                <input
                  id="clienteDireccion"
                  type="text"
                  value={cliente.direccion}
                  onChange={e => setCliente({ ...cliente, direccion: e.target.value })}
                  placeholder="Calle, número..."
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="clienteCP">Código Postal</label>
                <input
                  id="clienteCP"
                  type="text"
                  value={cliente.codigoPostal}
                  onChange={e => setCliente({ ...cliente, codigoPostal: e.target.value })}
                  placeholder="28001"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="clienteCiudad">Ciudad</label>
                <input
                  id="clienteCiudad"
                  type="text"
                  value={cliente.ciudad}
                  onChange={e => setCliente({ ...cliente, ciudad: e.target.value })}
                  placeholder="Madrid"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Configuración factura */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>⚙️ Configuración</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="configSerie">Serie</label>
                <input
                  id="configSerie"
                  type="text"
                  value={config.serie}
                  onChange={e => setConfig({ ...config, serie: e.target.value.toUpperCase() })}
                  maxLength={3}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="configNumero">Número</label>
                <input
                  id="configNumero"
                  type="number"
                  value={config.numero}
                  onChange={e => setConfig({ ...config, numero: parseInt(e.target.value) || 1 })}
                  min={1}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="configFecha">Fecha</label>
                <input
                  id="configFecha"
                  type="date"
                  value={config.fecha}
                  onChange={e => setConfig({ ...config, fecha: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="configFormaPago">Forma de pago</label>
                <select
                  id="configFormaPago"
                  value={config.formaPago}
                  onChange={e => setConfig({ ...config, formaPago: e.target.value })}
                  className={styles.select}
                >
                  {FORMAS_PAGO.map(fp => (
                    <option key={fp} value={fp}>{fp}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup + ' ' + styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={config.aplicarIrpf}
                    onChange={e => setConfig({ ...config, aplicarIrpf: e.target.checked })}
                  />
                  Aplicar retención IRPF
                </label>
              </div>
              {config.aplicarIrpf && (
                <div className={styles.formGroup}>
                  <label htmlFor="configIrpf">% IRPF</label>
                  <select
                    id="configIrpf"
                    value={config.porcentajeIrpf}
                    onChange={e => setConfig({ ...config, porcentajeIrpf: parseInt(e.target.value) })}
                    className={styles.select}
                  >
                    <option value={7}>7% (Nuevos autónomos)</option>
                    <option value={15}>15% (General)</option>
                    <option value={19}>19% (Profesionales)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Líneas de factura */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📝 Conceptos</h2>
            <div className={styles.lineasContainer}>
              {lineas.map((linea, index) => (
                <div key={linea.id} className={styles.lineaItem}>
                  <div className={styles.lineaNumero}>{index + 1}</div>
                  <div className={styles.lineaFields}>
                    <div className={styles.formGroup + ' ' + styles.conceptoField}>
                      <label htmlFor={`concepto-${linea.id}`}>Concepto *</label>
                      <input
                        id={`concepto-${linea.id}`}
                        type="text"
                        value={linea.concepto}
                        onChange={e => actualizarLinea(linea.id, 'concepto', e.target.value)}
                        placeholder="Descripción del servicio o producto"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup + ' ' + styles.cantidadField}>
                      <label htmlFor={`cantidad-${linea.id}`}>Cantidad</label>
                      <input
                        id={`cantidad-${linea.id}`}
                        type="number"
                        value={linea.cantidad}
                        onChange={e => actualizarLinea(linea.id, 'cantidad', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup + ' ' + styles.precioField}>
                      <label htmlFor={`precio-${linea.id}`}>Precio unit. (€) *</label>
                      <input
                        id={`precio-${linea.id}`}
                        type="number"
                        value={linea.precioUnitario || ''}
                        onChange={e => actualizarLinea(linea.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        placeholder="0,00"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup + ' ' + styles.ivaField}>
                      <label htmlFor={`iva-${linea.id}`}>IVA</label>
                      <select
                        id={`iva-${linea.id}`}
                        value={linea.tipoIva}
                        onChange={e => actualizarLinea(linea.id, 'tipoIva', parseInt(e.target.value))}
                        className={styles.select}
                      >
                        {TIPOS_IVA.map(tipo => (
                          <option key={tipo.valor} value={tipo.valor}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.lineaSubtotal}>
                      {formatCurrency(linea.cantidad * linea.precioUnitario)}
                    </div>
                    {lineas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarLinea(linea.id)}
                        className={styles.btnEliminarLinea}
                        title="Eliminar línea"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={agregarLinea} className={styles.btnAgregarLinea}>
                + Añadir línea
              </button>
            </div>
          </div>

          {/* Notas */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📌 Notas (opcional)</h2>
            <textarea
              value={config.notas}
              onChange={e => setConfig({ ...config, notas: e.target.value })}
              placeholder="Observaciones, datos bancarios, condiciones de pago..."
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>

        {/* Panel derecho: Resumen y acciones */}
        <div className={styles.summaryPanel}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Factura {numeroFactura}</h3>
            <p className={styles.summaryFecha}>{formatDate(new Date(config.fecha))}</p>

            <div className={styles.summaryTotales}>
              <div className={styles.summaryRow}>
                <span>Base imponible</span>
                <span>{formatCurrency(calculos.baseImponible)}</span>
              </div>

              {Object.entries(calculos.desglosesIva)
                .filter(([, datos]) => datos.cuota > 0)
                .map(([tipo, datos]) => (
                  <div key={tipo} className={styles.summaryRow}>
                    <span>IVA {tipo}%</span>
                    <span>{formatCurrency(datos.cuota)}</span>
                  </div>
                ))}

              {config.aplicarIrpf && calculos.retencionIrpf > 0 && (
                <div className={styles.summaryRow + ' ' + styles.retencion}>
                  <span>Retención IRPF -{config.porcentajeIrpf}%</span>
                  <span>-{formatCurrency(calculos.retencionIrpf)}</span>
                </div>
              )}

              <div className={styles.summaryTotal}>
                <span>TOTAL</span>
                <span>{formatCurrency(calculos.total)}</span>
              </div>
            </div>

            <div className={styles.summaryActions}>
              <button
                type="button"
                onClick={() => setMostrarPreview(true)}
                className={styles.btnPreview}
              >
                👁️ Vista previa
              </button>
              <button
                type="button"
                onClick={generarPDF}
                disabled={!esValida}
                className={styles.btnGenerar}
              >
                📄 Generar PDF
              </button>
              <button
                type="button"
                onClick={nuevaFactura}
                className={styles.btnNueva}
              >
                🔄 Nueva factura
              </button>
            </div>
          </div>

          {/* Historial */}
          <div className={styles.historialCard}>
            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className={styles.historialToggle}
            >
              📋 Historial ({historial.length})
              <span className={mostrarHistorial ? styles.arrowUp : styles.arrowDown}>▼</span>
            </button>

            {mostrarHistorial && historial.length > 0 && (
              <div className={styles.historialLista}>
                {historial.slice(0, 10).map(f => (
                  <div key={f.id} className={styles.historialItem}>
                    <div className={styles.historialInfo}>
                      <span className={styles.historialNumero}>{f.numero}</span>
                      <span className={styles.historialCliente}>{f.cliente}</span>
                    </div>
                    <div className={styles.historialMeta}>
                      <span>{formatDate(new Date(f.fecha))}</span>
                      <span className={styles.historialTotal}>{formatCurrency(f.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mostrarHistorial && historial.length === 0 && (
              <p className={styles.historialVacio}>No hay facturas en el historial</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Vista Previa */}
      {mostrarPreview && (
        <div className={styles.modalOverlay} onClick={() => setMostrarPreview(false)}>
          <div className={styles.modalPreview} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMostrarPreview(false)}
              className={styles.btnCerrarPreview}
            >
              ×
            </button>

            <div ref={previewRef} className={styles.facturaPreview} id="factura-print">
              {/* Cabecera */}
              <div className={styles.previewHeader}>
                <div className={styles.previewEmisor}>
                  <h2>{emisor.nombre || 'Tu Empresa'}</h2>
                  <p>{emisor.nif}</p>
                  {emisor.direccion && <p>{emisor.direccion}</p>}
                  {(emisor.codigoPostal || emisor.ciudad) && (
                    <p>{emisor.codigoPostal} {emisor.ciudad}</p>
                  )}
                  {emisor.telefono && <p>Tel: {emisor.telefono}</p>}
                  {emisor.email && <p>{emisor.email}</p>}
                </div>
                <div className={styles.previewNumero}>
                  <h1>FACTURA</h1>
                  <p className={styles.previewNumeroValor}>{numeroFactura}</p>
                  <p>Fecha: {formatDate(new Date(config.fecha))}</p>
                </div>
              </div>

              {/* Cliente */}
              <div className={styles.previewCliente}>
                <h3>Facturar a:</h3>
                <p><strong>{cliente.nombre || 'Cliente'}</strong></p>
                {cliente.nif && <p>NIF: {cliente.nif}</p>}
                {cliente.direccion && <p>{cliente.direccion}</p>}
                {(cliente.codigoPostal || cliente.ciudad) && (
                  <p>{cliente.codigoPostal} {cliente.ciudad}</p>
                )}
              </div>

              {/* Tabla de conceptos */}
              <table className={styles.previewTabla}>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>IVA</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.filter(l => l.concepto).map(linea => (
                    <tr key={linea.id}>
                      <td>{linea.concepto}</td>
                      <td>{linea.cantidad}</td>
                      <td>{formatCurrency(linea.precioUnitario)}</td>
                      <td>{linea.tipoIva}%</td>
                      <td>{formatCurrency(linea.cantidad * linea.precioUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totales */}
              <div className={styles.previewTotales}>
                <div className={styles.previewTotalRow}>
                  <span>Base imponible:</span>
                  <span>{formatCurrency(calculos.baseImponible)}</span>
                </div>
                {Object.entries(calculos.desglosesIva)
                  .filter(([, datos]) => datos.cuota > 0)
                  .map(([tipo, datos]) => (
                    <div key={tipo} className={styles.previewTotalRow}>
                      <span>IVA {tipo}% (sobre {formatCurrency(datos.base)}):</span>
                      <span>{formatCurrency(datos.cuota)}</span>
                    </div>
                  ))}
                {config.aplicarIrpf && calculos.retencionIrpf > 0 && (
                  <div className={styles.previewTotalRow}>
                    <span>Retención IRPF -{config.porcentajeIrpf}%:</span>
                    <span>-{formatCurrency(calculos.retencionIrpf)}</span>
                  </div>
                )}
                <div className={styles.previewTotalFinal}>
                  <span>TOTAL:</span>
                  <span>{formatCurrency(calculos.total)}</span>
                </div>
              </div>

              {/* Pie */}
              <div className={styles.previewPie}>
                <p><strong>Forma de pago:</strong> {config.formaPago}</p>
                {config.notas && (
                  <div className={styles.previewNotas}>
                    <p><strong>Observaciones:</strong></p>
                    <p>{config.notas}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.previewActions}>
              <button type="button" onClick={() => window.print()} className={styles.btnImprimir}>
                🖨️ Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <h3>💡 ¿Cómo funciona?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>1️⃣</span>
            <div>
              <strong>Rellena tus datos</strong>
              <p>Se guardan automáticamente para futuras facturas</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>2️⃣</span>
            <div>
              <strong>Añade los conceptos</strong>
              <p>El IVA y los totales se calculan automáticamente</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>3️⃣</span>
            <div>
              <strong>Genera el PDF</strong>
              <p>Usa el diálogo de impresión para guardar como PDF</p>
            </div>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('generador-facturas')} />

      <Footer appName="generador-facturas" />

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #factura-print,
          #factura-print * {
            visibility: visible;
          }
          #factura-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
