'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GeneradorFacturas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, DisclaimerCard, LegalNotice, EducationalSection, ShareCard } from '@/components';
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
  // `fecha` arranca vacía y se rellena al montar (más abajo). Con `new Date()` aquí, el HTML
  // estático salía con la fecha del build y el cliente ponía la del día: no coincidían, React
  // descartaba el árbol al hidratar (error #418) y, entre build y visita, el campo de fecha de
  // la factura llegaba a anunciar un día que no era.
  const [config, setConfig] = useState<ConfiguracionFactura>({
    serie: 'A',
    numero: 1,
    fecha: '',
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
    // La fecha de hoy, ya en el navegador (ver el estado inicial de config)
    setConfig(prev => (prev.fecha ? prev : { ...prev, fecha: new Date().toISOString().split('T')[0] }));

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

      <LegalNotice lastUpdated="2026-02-02" />

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="generador-facturas"
      />

      

      <div className={styles.mainContent}>
        {/* Panel izquierdo: Formulario */}
        <div className={styles.formPanel}>
          {/* Datos del emisor */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span aria-hidden="true">👤</span> Tus datos (Emisor)
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">🏢</span> Datos del cliente</h2>
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">⚙️</span> Configuración</h2>
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
                    <option value={7}>7% (Nuevos autónomos — 1er y 2º año)</option>
                    <option value={15}>15% (General — actividades profesionales)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Líneas de factura */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📝</span> Conceptos</h2>
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
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📌</span> Notas (opcional)</h2>
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
                <span aria-hidden="true">👁️</span> Vista previa
              </button>
              <button
                type="button"
                onClick={generarPDF}
                disabled={!esValida}
                className={styles.btnGenerar}
              >
                <span aria-hidden="true">📄</span> Generar PDF
              </button>
              <button
                type="button"
                onClick={nuevaFactura}
                className={styles.btnNueva}
              >
                <span aria-hidden="true">🔄</span> Nueva factura
              </button>
            </div>
          </div>

          {/* Historial */}
          <div className={styles.historialCard}>
            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className={styles.historialToggle}
              aria-pressed={mostrarHistorial}
            >
              <span aria-hidden="true">📋</span> Historial ({historial.length})
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
                <span aria-hidden="true">🖨️</span> Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <EducationalSection
        title="Guía completa de facturación para autónomos y empresas"
        subtitle="Tipos de factura, obligaciones legales, casos de uso y errores que evitar"
      >
        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2><span aria-hidden="true">📋</span> Tipos de factura en España: cuándo y cómo usar cada una</h2>
          <p className={styles.eduIntro}>
            Elegir el tipo de factura incorrecto puede costarte sanciones de 150–6.000 €. Esta tabla te ayuda a identificar qué configuración necesitas según tu situación real.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de factura</th>
                  <th>IVA aplicable</th>
                  <th>Retención IRPF</th>
                  <th>Cuándo usarla</th>
                  <th>Ejemplo práctico</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Estándar (con IVA)</strong></td>
                  <td>21% / 10% / 4%</td>
                  <td>❌ No aplica</td>
                  <td>Autónomo o empresa → cliente español</td>
                  <td>Venta de productos, servicios técnicos, consultoría a particulares</td>
                  <td>Mayoría de autónomos y SLs</td>
                </tr>
                <tr>
                  <td><strong>Con IVA + retención IRPF</strong></td>
                  <td>21%</td>
                  <td>✅ 15% (7% nuevos)</td>
                  <td>Autónomo profesional → empresa/autónomo español</td>
                  <td>Diseñador web, consultor, abogado que factura a empresa</td>
                  <td>Autónomos con actividad profesional</td>
                </tr>
                <tr>
                  <td><strong>Exenta de IVA</strong></td>
                  <td>0% (exenta)</td>
                  <td>Depende actividad</td>
                  <td>Actividades exentas por Ley del IVA (art. 20 LIVA)</td>
                  <td>Formación reglada, servicios sanitarios, actividades financieras</td>
                  <td>Educadores, médicos, aseguradoras</td>
                </tr>
                <tr>
                  <td><strong>Intracomunitaria (UE)</strong></td>
                  <td>0% inversión sujeto pasivo</td>
                  <td>❌ No aplica</td>
                  <td>B2B entre países de la UE (cliente con VAT number)</td>
                  <td>Servicios de software a empresa alemana con DE123456789</td>
                  <td>Freelances y empresas con clientes europeos</td>
                </tr>
                <tr>
                  <td><strong>Exportación (fuera UE)</strong></td>
                  <td>0% (exportación)</td>
                  <td>❌ No aplica</td>
                  <td>Cliente en país no perteneciente a la UE</td>
                  <td>SaaS vendido a empresa de EE.UU. o cliente en Japón</td>
                  <td>Empresas con clientes globales</td>
                </tr>
                <tr>
                  <td><strong>Factura rectificativa</strong></td>
                  <td>La del original</td>
                  <td>La del original</td>
                  <td>Corrección de errores en factura ya emitida</td>
                  <td>Error en el importe, datos del cliente o IVA aplicado</td>
                  <td>Cualquier emisor que deba corregir</td>
                </tr>
                <tr>
                  <td><strong>Factura simplificada (ticket)</strong></td>
                  <td>21% / 10% / 4%</td>
                  <td>❌ No aplica</td>
                  <td>Venta directa al público (B2C) en comercio minorista</td>
                  <td>Tienda física, restaurante, bar con TPV</td>
                  <td>Comercios minoristas al público</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.eduEscenarios}>
          <h2><span aria-hidden="true">💼</span> Situaciones reales: cómo facturar según tu perfil</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍💻</span>
                <h3>Freelance de servicios digitales</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Desarrollador web autónomo. Factura 2.500 € a empresa española.</p>
                <code>Base: 2.500 € | IVA 21%: +525 € | IRPF 15%: -375 € | TOTAL: 2.650 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Clave:</strong> El cliente ingresa 2.650 € y retiene 375 € que ingresa a Hacienda en tu nombre. Tú los recuperas (o no) en la declaración anual de IRPF.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h3>Sociedad Limitada (SL)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> SL de marketing factura 8.000 € a otra empresa.</p>
                <code>Base: 8.000 € | IVA 21%: +1.680 € | IRPF: N/A | TOTAL: 9.680 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Clave:</strong> Las sociedades no tienen retención IRPF. El IVA cobrado lo declaras en modelo 303 trimestral y lo compensas con el IVA soportado de tus gastos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
                <h3>Servicio a empresa europea</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Consultora española factura 3.000 € a empresa francesa (VAT: FR12345).</p>
                <code>Base: 3.000 € | IVA: 0% (inversión sujeto pasivo) | TOTAL: 3.000 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Clave:</strong> Incluye en notas: &quot;Operación exenta IVA — art. 69 y 70 LIVA. Inversión del sujeto pasivo.&quot; Declara en modelo 349 (operaciones intracomunitarias).</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
                <h3>Formador o educador autónomo</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Profesor que da cursos de formación continua a una empresa.</p>
                <code>Base: 1.200 € | IVA: 0% (exento art. 20 LIVA) | TOTAL: 1.200 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Clave:</strong> La formación para el empleo y la enseñanza reglada están exentas de IVA. Consulta con tu gestor si tu actividad específica cumple los requisitos del artículo 20.1.9 LIVA.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🆕</span>
                <h3>Nuevo autónomo (primer año)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Diseñadora dada de alta hace 6 meses. Factura 1.500 € a empresa.</p>
                <code>Base: 1.500 € | IVA 21%: +315 € | IRPF 7%: -105 € | TOTAL: 1.710 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Clave:</strong> El tipo reducido del 7% aplica el año de alta y los dos siguientes. Comunícaselo al cliente y haz constar en la factura: &quot;IRPF reducido 7% — nuevo autónomo (art. 95.1 RIRPF)&quot;.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                <h3>Tienda online o e-commerce</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Tienda online vende producto físico a cliente particular por 89,99 €.</p>
                <code>Base: 74,37 € | IVA 21%: 15,62 € | TOTAL: 89,99 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Clave:</strong> Los clientes particulares no retienen IRPF. Para UE puedes emitir factura simplificada (ticket) salvo que el cliente la solicite completa. En ventas digitales B2C UE, aplica IVA del país del comprador si superas 10.000 € anuales.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre facturación</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cuándo debo aplicar retención IRPF y cuándo no?</h4>
              <p>
                La retención IRPF la aplicas cuando eres autónomo con actividad profesional (o artística/deportiva) y facturas a una <strong>empresa o autónomo español obligado a retener</strong>. Si tu cliente es un particular, nunca aplica retención. Si tu cliente es una empresa extranjera, tampoco. Las sociedades limitadas (SL, SA) tampoco retienen en sus facturas, solo los autónomos en actividades profesionales.
              </p>
              <p className={styles.faqTip}>💡 <strong>Regla práctica:</strong> Si tu cliente tiene CIF (empresa) y eres autónomo con actividad profesional = aplica retención. Si tiene DNI (particular) o es empresa extranjera = sin retención.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué pasa si me olvido de incluir datos obligatorios en la factura?</h4>
              <p>
                Una factura incompleta puede ser rechazada por el cliente para deducir el IVA, y Hacienda puede imponer sanciones entre <strong>150 € y 600 €</strong> por cada factura incorrecta (art. 201 LGT). Los datos obligatorios son: número correlativo, fecha, datos del emisor y receptor (nombre + NIF/CIF + domicilio), descripción del servicio, base imponible, tipo de IVA, cuota de IVA y total. Si el receptor es persona jurídica, también su domicilio.
              </p>
              <p className={styles.faqTip}>💡 <strong>Tip:</strong> El generador de meskeIA incluye automáticamente todos los campos obligatorios según la normativa española (RD 1619/2012).</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cómo corrijo un error en una factura ya emitida?</h4>
              <p>
                <strong>Nunca modifiques una factura ya entregada.</strong> Hacerlo es falsificación de documento mercantil. La solución correcta es emitir una <strong>factura rectificativa</strong> que: haga referencia al número y fecha de la factura original, indique el motivo de la rectificación, y corrija los datos erróneos. La factura rectificativa lleva su propio número correlativo en la serie de rectificativas (ej: R-001, R-002...).
              </p>
              <p className={styles.faqTip}>💡 <strong>Tip:</strong> Puedes emitir facturas rectificativas tanto para corregir errores como para emitir abonos (cuando devuelves dinero al cliente).</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué es la numeración correlativa y por qué es tan importante?</h4>
              <p>
                La numeración correlativa significa que las facturas deben emitirse en orden secuencial sin saltos ni repeticiones (2024-001, 2024-002, 2024-003...). <strong>Hacienda considera un salto en la numeración como indicio de facturas ocultas.</strong> Puedes usar prefijos anuales (2025-001) o reiniciar la numeración cada ejercicio fiscal. Si detectas un salto, consúltalo con tu asesor antes de la próxima declaración.
              </p>
              <p className={styles.faqTip}>💡 <strong>Tip:</strong> Puedes tener series distintas para distintos tipos de facturas (ej: serie A para nacionales, serie E para exportación, serie R para rectificativas).</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cuánto tiempo debo conservar las facturas?</h4>
              <p>
                Mínimo <strong>4 años</strong> según la Ley General Tributaria (prescripción tributaria). Sin embargo, el Código de Comercio exige <strong>6 años</strong> para documentos contables. La recomendación práctica es guardar todo durante <strong>6 años</strong>. Si tienes pérdidas que compensar en ejercicios futuros, conserva la documentación hasta que se hayan compensado completamente.
              </p>
              <p className={styles.faqTip}>💡 <strong>Tip:</strong> Desde el 1 de julio de 2025, la obligación de factura electrónica (Ley Crea y Crece) se está implementando gradualmente. Prepárate para adoptar software certificado.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Puedo incluir mi cuenta bancaria en la factura para cobrar por transferencia?</h4>
              <p>
                Sí, es práctica habitual y recomendable incluir el IBAN en la factura para facilitar el pago. No es dato obligatorio según el reglamento de facturación, pero sí muy práctico. Asegúrate de indicar también el plazo de pago acordado. La Ley de Morosidad (Ley 3/2004) establece un plazo máximo de 30 días para empresas y 60 días para Administraciones Públicas.
              </p>
              <p className={styles.faqTip}>💡 <strong>Tip:</strong> Si el cliente tarda en pagar, puedes añadir intereses de demora (el tipo legal del dinero + 8 puntos para operaciones comerciales B2B).</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué diferencia hay entre factura ordinaria y factura simplificada?</h4>
              <p>
                La <strong>factura simplificada (ticket)</strong> puede emitirse cuando el destinatario es un particular o el importe es inferior a 400 € IVA incluido. No es necesario indicar los datos del receptor. Los comercios con autorización especial pueden usar tickets hasta 3.000 €. La factura <strong>ordinaria completa</strong> es obligatoria cuando el destinatario es una empresa o cuando supera los umbrales anteriores.
              </p>
              <p className={styles.faqTip}>💡 <strong>Regla:</strong> Si el cliente va a deducirse el IVA, necesita sí o sí una factura ordinaria completa con sus datos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué es la factura electrónica y cuándo es obligatoria?</h4>
              <p>
                La factura electrónica es una factura emitida y recibida en formato digital estructurado (XML, Facturae) con garantías de autenticidad e integridad. Ya es <strong>obligatoria para facturar a la Administración Pública</strong> desde 2015. Para el sector privado, la Ley &quot;Crea y Crece&quot; (Ley 18/2022) la hará obligatoria para empresas con facturación &gt;8M€ en 2025 y para el resto (incluidos autónomos) en 2026.
              </p>
              <p className={styles.faqTip}>💡 <strong>Anticípate:</strong> Adopta un software de facturación compatible con Facturae antes de que sea obligatorio para evitar prisas y costes de adaptación de última hora.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2><span aria-hidden="true">📋</span> Cómo emitir una factura correcta paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Asigna un número correlativo único</h4>
                <p>Usa el formato AAAA-NNN (ej: 2025-001). Asegúrate de que no hay saltos en la secuencia. Si tienes distintos tipos de facturas, crea series separadas: serie N para nacionales, E para exportación, R para rectificativas. El número nunca puede repetirse ni omitirse.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Comprueba los datos del emisor (tú)</h4>
                <p>Nombre o razón social completo, NIF/CIF válido, domicilio fiscal, y opcionalmente teléfono y email. Si eres autónomo persona física, tu nombre completo tal como aparece en el IAE. Si es SL/SA, la denominación social exacta del Registro Mercantil.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Verifica los datos del cliente (receptor)</h4>
                <p>Solicita siempre el NIF/CIF antes de emitir. Para empresas europeas, verifica el VAT number en el registro VIES (ec.europa.eu/vies). Un VAT incorrecto puede anular la exención de IVA y obligarte a regularizar con intereses. Para clientes extranjeros fuera de UE, el pasaporte o número de identificación nacional.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Describe el servicio/producto con precisión</h4>
                <p>La descripción debe ser suficientemente detallada para identificar qué se factura. Evita descripciones genéricas como &quot;servicios varios&quot;. Incluye: qué has hecho, para qué proyecto o periodo, y cualquier acuerdo específico. Una descripción clara evita reclamaciones y facilita la deducción del IVA por el cliente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Aplica el IVA y la retención correctos</h4>
                <p>Aplica el tipo de IVA correcto según la naturaleza del servicio (21% general, 10% bienes de primera necesidad, 4% libros/medicamentos, 0% intracomunitario/exportación). Si corresponde retención IRPF, aplica 15% (o 7% si llevas menos de 3 años de alta como autónomo profesional). Calcula siempre: Base imponible → +IVA → -Retención = Total a cobrar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Indica la fecha de emisión y vencimiento</h4>
                <p>La fecha de emisión es la fecha real en que la emites. Si has entregado el servicio en un mes diferente, considera indicar también la &quot;fecha del devengo&quot;. El plazo de pago estándar en B2B es 30 días (60 para grandes empresas). Indicarlo reduce los retrasos: &quot;Vencimiento: 30 días fecha factura&quot;.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Guarda y envía correctamente</h4>
                <p>Guarda una copia en PDF en una carpeta organizada por año y mes. Envíala por email con asunto claro (&quot;Factura 2025-042 — [Tu empresa]&quot;). Conserva el justificante del envío. Registra en tu libro de facturas emitidas (requerido para el modelo 303 de IVA). Si el cliente pide formato electrónico estructurado, usa Facturae (XML).</p>
              </div>
            </div>
          </div>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.eduTips}>
          <h2><span aria-hidden="true">✅</span> Buenas prácticas de facturación profesional</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>Emite facturas el mismo día del servicio</h4>
              <p>La factura debe emitirse el día del devengo (cuando se realiza el servicio) o como máximo el último día del mes natural siguiente. Emitirla el mismo día acelera el cobro.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <h4>Nunca rompas la correlación numérica</h4>
              <p>Si cancelas una factura antes de enviarla, emite igualmente una factura con importe 0 o una rectificativa. Un salto en la numeración es motivo de inspección en Hacienda.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <h4>Organiza en carpetas por año y mes</h4>
              <p>Estructura: /Facturas/2025/01-Enero, /Facturas/2025/02-Febrero... Guarda tanto las emitidas como las recibidas. Facilita enormemente la preparación del trimestre.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Verifica el NIF antes de emitir, no después</h4>
              <p>Un NIF incorrecto invalida la factura y puede impedir que el cliente deduzca el IVA. Usa la herramienta de validación NIF de meskeIA antes de crear cada factura nueva.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💶</span>
              <h4>Usa IBAN y plazo de pago explícito</h4>
              <p>Indicar el IBAN y &quot;Pago en 30 días&quot; reduce el tiempo medio de cobro en 7-10 días. Los clientes con flujo de caja ajustado pagan primero las facturas con fecha límite clara.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h4>Reconcilia con el libro de facturas mensualmente</h4>
              <p>Al cerrar cada mes, cruza las facturas emitidas con los cobros recibidos. Detectar impagos en menos de 30 días duplica la probabilidad de cobro. Pasados 90 días, el riesgo de impago se dispara.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores de facturación que generan sanciones o pérdida de derechos</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Saltarse números en la secuencia:</strong> Hacienda lo interpreta como ocultación de ingresos. Sanción mínima 300 € y puede derivar en inspección completa.</li>
            <li><strong>❌ Modificar una factura ya entregada:</strong> Es falsificación de documento mercantil (delito penal). La corrección correcta es siempre mediante factura rectificativa.</li>
            <li><strong>❌ Aplicar IRPF del 7% fuera de plazo:</strong> El tipo reducido solo es válido durante el año de alta y los dos siguientes. Pasado ese plazo, usar 7% es error y Hacienda regularizará con intereses.</li>
            <li><strong>❌ Facturar a empresa UE sin verificar VAT number:</strong> Si el VAT del cliente es incorrecto o ficticio, la exención de IVA es inválida. Deberás regularizar el IVA más intereses de demora.</li>
            <li><strong>❌ No declarar facturas en el trimestre correcto:</strong> La factura debe declararse en el trimestre en que se emite (criterio de devengo), no cuando se cobra. Declarar en trimestre incorrecto = sanción por extemporaneidad.</li>
            <li><strong>❌ Omitir datos obligatorios:</strong> Una factura sin NIF del cliente, sin descripción suficiente o sin fecha es una factura inválida. El cliente no puede deducir el IVA y tú puedes ser sancionado entre 150 y 600 € por factura.</li>
            <li><strong>❌ No conservar facturas el tiempo mínimo:</strong> Destruir facturas antes de 4 años (tributario) o 6 años (mercantil) impide defenderte en una inspección y puede considerarse obstrucción.</li>
            <li><strong>❌ Usar facturas sin numeración propia como SL:</strong> Las sociedades mercantiles deben llevar libros contables oficiales. Usar hojas sueltas sin registro contable formal puede invalidar la contabilidad completa.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-facturas')} />

      <ShareCard appName="generador-facturas" />
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
