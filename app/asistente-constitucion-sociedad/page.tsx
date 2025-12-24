'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './AsistenteConstitucion.module.css';
import { MeskeiaLogo, Footer, NumberInput, RelatedApps, EducationalSection } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type TipoSociedad = 'SL' | 'SLU' | 'SA';

interface Socio {
  id: string;
  nombre: string;
  dni: string;
  porcentaje: string;
}

interface DatosSociedad {
  denominacion1: string;
  denominacion2: string;
  denominacion3: string;
  tipo: TipoSociedad;
  capitalSocial: string;
  domicilio: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  objetoSocial: string;
  tipoAdministracion: 'unico' | 'solidarios' | 'mancomunados' | 'consejo';
  socios: Socio[];
}

interface ChecklistItem {
  id: string;
  fase: number;
  texto: string;
  descripcion: string;
  completado: boolean;
  obligatorio: boolean;
  enlaceUtil?: { texto: string; url: string };
}

// Datos comparativos
const COMPARATIVA_SOCIEDADES = {
  SL: {
    nombre: 'Sociedad Limitada',
    siglas: 'S.L. / S.R.L.',
    capitalMinimo: 3000,
    desembolsoInicial: '100%',
    divisionCapital: 'Participaciones',
    transmision: 'Restringida (derecho preferente socios)',
    sociosMinimos: 1,
    idealPara: 'Pymes, negocios familiares, startups',
    complejidad: 'Media',
  },
  SLU: {
    nombre: 'Sociedad Limitada Unipersonal',
    siglas: 'S.L.U.',
    capitalMinimo: 3000,
    desembolsoInicial: '100%',
    divisionCapital: 'Participaciones',
    transmision: 'Restringida',
    sociosMinimos: 1,
    idealPara: 'Autónomos que quieren limitar responsabilidad',
    complejidad: 'Media',
  },
  SA: {
    nombre: 'Sociedad Anónima',
    siglas: 'S.A.',
    capitalMinimo: 60000,
    desembolsoInicial: '25% mínimo (resto en 5 años)',
    divisionCapital: 'Acciones',
    transmision: 'Libre (salvo restricciones estatutarias)',
    sociosMinimos: 1,
    idealPara: 'Grandes empresas, cotización en bolsa',
    complejidad: 'Alta',
  },
};

// Checklist por fases
const CHECKLIST_ITEMS: Omit<ChecklistItem, 'completado'>[] = [
  // FASE 1: Preparación
  {
    id: 'denominacion',
    fase: 1,
    texto: 'Elegir denominación social',
    descripcion: 'Nombre único de la sociedad. Prepara 3 opciones por orden de preferencia.',
    obligatorio: true,
  },
  {
    id: 'certificacion-negativa',
    fase: 1,
    texto: 'Solicitar Certificación Negativa de Denominación',
    descripcion: 'Certificado del Registro Mercantil Central confirmando que el nombre no existe. Válido 6 meses.',
    obligatorio: true,
    enlaceUtil: { texto: 'Registro Mercantil Central', url: 'https://www.rmc.es/' },
  },
  {
    id: 'estatutos',
    fase: 1,
    texto: 'Redactar estatutos sociales',
    descripcion: 'Documento que regula el funcionamiento interno de la sociedad. Puedes usar modelo estándar o personalizado.',
    obligatorio: true,
  },
  {
    id: 'capital-social',
    fase: 1,
    texto: 'Definir capital social y aportaciones',
    descripcion: 'Cantidad que cada socio aporta y porcentaje de participación resultante.',
    obligatorio: true,
  },
  {
    id: 'cuenta-bancaria',
    fase: 1,
    texto: 'Abrir cuenta bancaria "Sociedad en constitución"',
    descripcion: 'Cuenta temporal donde depositar el capital. Algunos bancos lo hacen online.',
    obligatorio: true,
  },
  {
    id: 'deposito-capital',
    fase: 1,
    texto: 'Depositar capital social',
    descripcion: 'Ingresar el capital mínimo requerido según tipo de sociedad.',
    obligatorio: true,
  },
  {
    id: 'certificado-bancario',
    fase: 1,
    texto: 'Obtener certificado bancario del depósito',
    descripcion: 'Documento del banco acreditando el ingreso. Necesario para el notario.',
    obligatorio: true,
  },
  // FASE 2: Constitución
  {
    id: 'cita-notario',
    fase: 2,
    texto: 'Reservar cita en notaría',
    descripcion: 'Contacta varias notarías para comparar honorarios. Lleva toda la documentación.',
    obligatorio: true,
  },
  {
    id: 'documentacion-socios',
    fase: 2,
    texto: 'Preparar documentación de todos los socios',
    descripcion: 'DNI/NIE original y fotocopia de cada socio. Si hay persona jurídica: escritura de poderes.',
    obligatorio: true,
  },
  {
    id: 'firma-escritura',
    fase: 2,
    texto: 'Firmar escritura de constitución ante notario',
    descripcion: 'Todos los socios deben asistir o tener representante con poder notarial.',
    obligatorio: true,
  },
  {
    id: 'copia-autorizada',
    fase: 2,
    texto: 'Obtener copia autorizada de la escritura',
    descripcion: 'Copia oficial necesaria para los siguientes trámites. Pide varias copias simples.',
    obligatorio: true,
  },
  // FASE 3: Post-constitución
  {
    id: 'cif-provisional',
    fase: 3,
    texto: 'Solicitar CIF provisional (Modelo 036)',
    descripcion: 'Identificación fiscal de la sociedad. Se solicita en Hacienda con la escritura.',
    obligatorio: true,
    enlaceUtil: { texto: 'Sede Electrónica AEAT', url: 'https://sede.agenciatributaria.gob.es/' },
  },
  {
    id: 'itpajd',
    fase: 3,
    texto: 'Liquidar ITPyAJD (Impuesto Transmisiones)',
    descripcion: 'Desde 2010 está exento, pero hay que presentar el modelo (600 o similar según CCAA).',
    obligatorio: true,
  },
  {
    id: 'registro-mercantil',
    fase: 3,
    texto: 'Inscribir en Registro Mercantil Provincial',
    descripcion: 'Inscripción obligatoria en el Registro de la provincia del domicilio social.',
    obligatorio: true,
  },
  {
    id: 'cif-definitivo',
    fase: 3,
    texto: 'Obtener CIF definitivo',
    descripcion: 'Una vez inscrita, solicitar el CIF definitivo en Hacienda.',
    obligatorio: true,
  },
  {
    id: 'libros-obligatorios',
    fase: 3,
    texto: 'Legalizar libros obligatorios',
    descripcion: 'Libro de actas, libro de socios/acciones. Se legalizan en el Registro Mercantil.',
    obligatorio: true,
  },
  {
    id: 'alta-iae',
    fase: 3,
    texto: 'Alta en IAE (si facturación > 1M€)',
    descripcion: 'Impuesto de Actividades Económicas. Exento si cifra de negocios < 1 millón €/año.',
    obligatorio: false,
  },
  // FASE 4: Operatividad
  {
    id: 'alta-administrador',
    fase: 4,
    texto: 'Alta del administrador en Seguridad Social',
    descripcion: 'Si el administrador es socio con >25% (SL) o >50% de capital, alta en RETA.',
    obligatorio: false,
  },
  {
    id: 'apertura-centro',
    fase: 4,
    texto: 'Comunicar apertura de centro de trabajo',
    descripcion: 'Obligatorio si tienes local o empleados. Se presenta en la autoridad laboral.',
    obligatorio: false,
  },
  {
    id: 'alta-empleados',
    fase: 4,
    texto: 'Alta en Seguridad Social (si hay empleados)',
    descripcion: 'Inscripción de la empresa y alta de trabajadores.',
    obligatorio: false,
  },
  {
    id: 'licencias-permisos',
    fase: 4,
    texto: 'Solicitar licencias y permisos específicos',
    descripcion: 'Según actividad: licencia de apertura, sanitaria, ambiental, etc.',
    obligatorio: false,
  },
];

const FASES = [
  { numero: 1, nombre: 'Preparación', icono: '📋', descripcion: 'Antes de ir al notario' },
  { numero: 2, nombre: 'Constitución', icono: '✍️', descripcion: 'En la notaría' },
  { numero: 3, nombre: 'Post-constitución', icono: '🏛️', descripcion: 'Trámites administrativos' },
  { numero: 4, nombre: 'Operatividad', icono: '🚀', descripcion: 'Puesta en marcha' },
];

// Almacenamiento local
const STORAGE_KEY = 'meskeia-constitucion-sociedad';

export default function AsistenteConstitucionSociedadPage() {
  // Estado principal
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoSociedad>('SL');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    CHECKLIST_ITEMS.map(item => ({ ...item, completado: false }))
  );
  const [datos, setDatos] = useState<DatosSociedad>({
    denominacion1: '',
    denominacion2: '',
    denominacion3: '',
    tipo: 'SL',
    capitalSocial: '3000',
    domicilio: '',
    localidad: '',
    provincia: '',
    codigoPostal: '',
    objetoSocial: '',
    tipoAdministracion: 'unico',
    socios: [{ id: '1', nombre: '', dni: '', porcentaje: '100' }],
  });
  const [pestanaActiva, setPestanaActiva] = useState<'checklist' | 'datos' | 'costes'>('checklist');
  const [faseExpandida, setFaseExpandida] = useState<number | null>(1);

  // Ref para exportar
  const resumenRef = useRef<HTMLDivElement>(null);

  // Cargar datos guardados de localStorage
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const datosGuardados = JSON.parse(guardado);
        if (datosGuardados.checklist && datosGuardados.checklist.length > 0) {
          setChecklist(datosGuardados.checklist);
        }
        if (datosGuardados.datos) {
          setDatos(datosGuardados.datos);
          setTipoSeleccionado(datosGuardados.datos.tipo || 'SL');
        }
      }
    } catch {
      // Si hay error, mantener valores por defecto
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ checklist, datos }));
    }
  }, [checklist, datos]);

  // Actualizar tipo en datos cuando cambia selección
  useEffect(() => {
    setDatos(prev => ({ ...prev, tipo: tipoSeleccionado }));

    // Ajustar capital mínimo si está por debajo
    const capitalActual = parseSpanishNumber(datos.capitalSocial);
    const capitalMinimo = COMPARATIVA_SOCIEDADES[tipoSeleccionado].capitalMinimo;
    if (capitalActual < capitalMinimo) {
      setDatos(prev => ({ ...prev, capitalSocial: capitalMinimo.toString() }));
    }

    // Si es SLU, forzar un solo socio
    if (tipoSeleccionado === 'SLU' && datos.socios.length > 1) {
      setDatos(prev => ({
        ...prev,
        socios: [{ ...prev.socios[0], porcentaje: '100' }],
      }));
    }
  }, [tipoSeleccionado]);

  // Handlers
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completado: !item.completado } : item
      )
    );
  };

  const actualizarDato = (campo: keyof DatosSociedad, valor: string) => {
    setDatos(prev => ({ ...prev, [campo]: valor }));
  };

  const agregarSocio = () => {
    if (tipoSeleccionado === 'SLU') return;
    const nuevoId = (datos.socios.length + 1).toString();
    setDatos(prev => ({
      ...prev,
      socios: [...prev.socios, { id: nuevoId, nombre: '', dni: '', porcentaje: '0' }],
    }));
  };

  const eliminarSocio = (id: string) => {
    if (datos.socios.length <= 1) return;
    setDatos(prev => ({
      ...prev,
      socios: prev.socios.filter(s => s.id !== id),
    }));
  };

  const actualizarSocio = (id: string, campo: keyof Socio, valor: string) => {
    setDatos(prev => ({
      ...prev,
      socios: prev.socios.map(s =>
        s.id === id ? { ...s, [campo]: valor } : s
      ),
    }));
  };

  const reiniciarTodo = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.removeItem(STORAGE_KEY);
      const itemsIniciales = CHECKLIST_ITEMS.map(item => ({
        ...item,
        completado: false,
      }));
      setChecklist(itemsIniciales);
      setDatos({
        denominacion1: '',
        denominacion2: '',
        denominacion3: '',
        tipo: 'SL',
        capitalSocial: '3000',
        domicilio: '',
        localidad: '',
        provincia: '',
        codigoPostal: '',
        objetoSocial: '',
        tipoAdministracion: 'unico',
        socios: [{ id: '1', nombre: '', dni: '', porcentaje: '100' }],
      });
      setTipoSeleccionado('SL');
    }
  };

  // Cálculos
  const calcularProgreso = () => {
    const obligatorios = checklist.filter(item => item.obligatorio);
    const completados = obligatorios.filter(item => item.completado);
    return Math.round((completados.length / obligatorios.length) * 100);
  };

  const calcularProgresoFase = (fase: number) => {
    const itemsFase = checklist.filter(item => item.fase === fase);
    const completados = itemsFase.filter(item => item.completado);
    return itemsFase.length > 0 ? Math.round((completados.length / itemsFase.length) * 100) : 0;
  };

  const calcularCostesEstimados = () => {
    const capital = parseSpanishNumber(datos.capitalSocial);
    const numSocios = datos.socios.length;
    const esSA = tipoSeleccionado === 'SA';

    // Notaría: base + variable según capital
    let notaria = 150;
    if (capital <= 6000) notaria += 150;
    else if (capital <= 30000) notaria += 250;
    else if (capital <= 60000) notaria += 350;
    else notaria += 500;
    if (esSA) notaria += 100;
    if (numSocios > 2) notaria += (numSocios - 2) * 30;

    // Registro Mercantil: base + variable
    let registroMercantil = 100;
    if (capital <= 6000) registroMercantil += 50;
    else if (capital <= 30000) registroMercantil += 100;
    else if (capital <= 60000) registroMercantil += 150;
    else registroMercantil += 200;

    // Certificación negativa denominación
    const certificacionDenominacion = 20;

    // Legalización libros
    const legalizacionLibros = 30;

    // Gestoría (opcional)
    const gestoriaMin = 200;
    const gestoriaMax = 500;

    const totalSinGestoria = notaria + registroMercantil + certificacionDenominacion + legalizacionLibros;

    return {
      notaria,
      registroMercantil,
      certificacionDenominacion,
      legalizacionLibros,
      gestoriaMin,
      gestoriaMax,
      totalSinGestoria,
      totalConGestoriaMin: totalSinGestoria + gestoriaMin,
      totalConGestoriaMax: totalSinGestoria + gestoriaMax,
    };
  };

  const costes = calcularCostesEstimados();
  const progreso = calcularProgreso();
  const capitalMinimo = COMPARATIVA_SOCIEDADES[tipoSeleccionado].capitalMinimo;
  const capitalActual = parseSpanishNumber(datos.capitalSocial);
  const capitalValido = capitalActual >= capitalMinimo;

  // Calcular suma de porcentajes
  const sumaPorcentajes = datos.socios.reduce((sum, s) => sum + parseSpanishNumber(s.porcentaje), 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🏢</span>
        <h1 className={styles.title}>Asistente de Constitución de Sociedad</h1>
        <p className={styles.subtitle}>
          Guía paso a paso para constituir tu Sociedad Limitada (SL/SLU) o Anónima (SA) en España.
          Checklist interactivo, formulario de datos y calculadora de costes.
        </p>
      </header>

      {/* Selector de tipo */}
      <section className={styles.selectorSection}>
        <h2 className={styles.sectionTitle}>
          <span>📊</span> Tipo de Sociedad
        </h2>
        <div className={styles.tipoCards}>
          {(Object.keys(COMPARATIVA_SOCIEDADES) as TipoSociedad[]).map(tipo => {
            const info = COMPARATIVA_SOCIEDADES[tipo];
            const seleccionado = tipoSeleccionado === tipo;
            return (
              <button
                key={tipo}
                className={`${styles.tipoCard} ${seleccionado ? styles.tipoCardActivo : ''}`}
                onClick={() => setTipoSeleccionado(tipo)}
              >
                <div className={styles.tipoHeader}>
                  <span className={styles.tipoSiglas}>{info.siglas}</span>
                  {seleccionado && <span className={styles.tipoCheck}>✓</span>}
                </div>
                <div className={styles.tipoNombre}>{info.nombre}</div>
                <div className={styles.tipoCapital}>
                  Capital mínimo: {formatCurrency(info.capitalMinimo)}
                </div>
                <div className={styles.tipoIdeal}>{info.idealPara}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tabla comparativa colapsable */}
      <details className={styles.comparativaDetails}>
        <summary className={styles.comparativaSummary}>
          <span>📋</span> Ver tabla comparativa completa
        </summary>
        <div className={styles.comparativaTabla}>
          <table>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>SL</th>
                <th>SLU</th>
                <th>SA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Capital mínimo</td>
                <td>{formatCurrency(3000)}</td>
                <td>{formatCurrency(3000)}</td>
                <td>{formatCurrency(60000)}</td>
              </tr>
              <tr>
                <td>Desembolso inicial</td>
                <td>100%</td>
                <td>100%</td>
                <td>25% mínimo</td>
              </tr>
              <tr>
                <td>División capital</td>
                <td>Participaciones</td>
                <td>Participaciones</td>
                <td>Acciones</td>
              </tr>
              <tr>
                <td>Transmisión</td>
                <td>Restringida</td>
                <td>Restringida</td>
                <td>Libre</td>
              </tr>
              <tr>
                <td>Socios mínimos</td>
                <td>1 (pasa a SLU)</td>
                <td>1 (único)</td>
                <td>1</td>
              </tr>
              <tr>
                <td>Complejidad</td>
                <td>Media</td>
                <td>Media</td>
                <td>Alta</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>

      {/* Barra de progreso global */}
      <div className={styles.progresoGlobal}>
        <div className={styles.progresoHeader}>
          <span className={styles.progresoTitulo}>Progreso general</span>
          <span className={styles.progresoValor}>{progreso}%</span>
        </div>
        <div className={styles.progresoBarraContainer}>
          <div
            className={styles.progresoBarra}
            style={{ width: `${progreso}%` }}
          />
        </div>
        <div className={styles.progresoInfo}>
          {checklist.filter(i => i.obligatorio && i.completado).length} de {checklist.filter(i => i.obligatorio).length} pasos obligatorios completados
        </div>
      </div>

      {/* Pestañas */}
      <div className={styles.pestanas}>
        <button
          className={`${styles.pestana} ${pestanaActiva === 'checklist' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('checklist')}
        >
          <span>✅</span> Checklist
        </button>
        <button
          className={`${styles.pestana} ${pestanaActiva === 'datos' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('datos')}
        >
          <span>📝</span> Datos Sociedad
        </button>
        <button
          className={`${styles.pestana} ${pestanaActiva === 'costes' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('costes')}
        >
          <span>💰</span> Costes Estimados
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div className={styles.contenidoPestana}>
        {/* CHECKLIST */}
        {pestanaActiva === 'checklist' && (
          <div className={styles.checklistContainer}>
            {FASES.map(fase => {
              const itemsFase = checklist.filter(item => item.fase === fase.numero);
              const progresoFase = calcularProgresoFase(fase.numero);
              const expandida = faseExpandida === fase.numero;

              return (
                <div key={fase.numero} className={styles.faseBloque}>
                  <button
                    className={`${styles.faseHeader} ${expandida ? styles.faseHeaderExpandida : ''}`}
                    onClick={() => setFaseExpandida(expandida ? null : fase.numero)}
                  >
                    <div className={styles.faseInfo}>
                      <span className={styles.faseIcono}>{fase.icono}</span>
                      <div className={styles.faseTitulos}>
                        <span className={styles.faseNombre}>Fase {fase.numero}: {fase.nombre}</span>
                        <span className={styles.faseDescripcion}>{fase.descripcion}</span>
                      </div>
                    </div>
                    <div className={styles.faseProgreso}>
                      <div className={styles.faseProgresoMini}>
                        <div
                          className={styles.faseProgresoMiniRelleno}
                          style={{ width: `${progresoFase}%` }}
                        />
                      </div>
                      <span className={styles.faseProgresoTexto}>{progresoFase}%</span>
                      <span className={styles.faseExpandir}>{expandida ? '▼' : '▶'}</span>
                    </div>
                  </button>

                  {expandida && (
                    <div className={styles.faseContenido}>
                      {itemsFase.map(item => (
                        <div
                          key={item.id}
                          className={`${styles.checklistItem} ${item.completado ? styles.checklistItemCompletado : ''}`}
                        >
                          <label className={styles.checklistLabel}>
                            <input
                              type="checkbox"
                              checked={item.completado}
                              onChange={() => toggleChecklistItem(item.id)}
                              className={styles.checklistCheckbox}
                            />
                            <span className={styles.checklistTexto}>
                              {item.texto}
                              {item.obligatorio && <span className={styles.obligatorio}>*</span>}
                            </span>
                          </label>
                          <p className={styles.checklistDescripcion}>{item.descripcion}</p>
                          {item.enlaceUtil && (
                            <a
                              href={item.enlaceUtil.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.enlaceUtil}
                            >
                              🔗 {item.enlaceUtil.texto}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <p className={styles.notaObligatorio}>
              <span className={styles.obligatorio}>*</span> Pasos obligatorios para todas las sociedades
            </p>
          </div>
        )}

        {/* DATOS DE LA SOCIEDAD */}
        {pestanaActiva === 'datos' && (
          <div className={styles.datosContainer} ref={resumenRef}>
            {/* Denominación */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>🏷️</span> Denominación Social
              </h3>
              <p className={styles.datosSeccionInfo}>
                Introduce 3 opciones por orden de preferencia. El Registro Mercantil Central
                asignará la primera disponible.
              </p>
              <div className={styles.datosGrid}>
                <div className={styles.inputGroup}>
                  <label>1ª Opción (preferida)</label>
                  <input
                    type="text"
                    value={datos.denominacion1}
                    onChange={e => actualizarDato('denominacion1', e.target.value)}
                    placeholder="Ej: Innovaciones Tecnológicas"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>2ª Opción</label>
                  <input
                    type="text"
                    value={datos.denominacion2}
                    onChange={e => actualizarDato('denominacion2', e.target.value)}
                    placeholder="Ej: Tech Innovations"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>3ª Opción</label>
                  <input
                    type="text"
                    value={datos.denominacion3}
                    onChange={e => actualizarDato('denominacion3', e.target.value)}
                    placeholder="Ej: InnoTech Solutions"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.denominacionPreview}>
                <strong>Vista previa:</strong> {datos.denominacion1 || '[Nombre]'}, {COMPARATIVA_SOCIEDADES[tipoSeleccionado].siglas}
              </div>
            </div>

            {/* Capital Social */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>💶</span> Capital Social
              </h3>
              <div className={styles.capitalGrid}>
                <NumberInput
                  value={datos.capitalSocial}
                  onChange={val => actualizarDato('capitalSocial', val)}
                  label="Capital social (€)"
                  placeholder={capitalMinimo.toString()}
                  min={capitalMinimo}
                  helperText={`Mínimo para ${tipoSeleccionado}: ${formatCurrency(capitalMinimo)}`}
                />
                {!capitalValido && (
                  <div className={styles.alertaCapital}>
                    ⚠️ El capital debe ser al menos {formatCurrency(capitalMinimo)} para una {tipoSeleccionado}
                  </div>
                )}
                {tipoSeleccionado === 'SA' && (
                  <div className={styles.infoCapitalSA}>
                    ℹ️ En SA solo es obligatorio desembolsar el 25% inicialmente ({formatCurrency(capitalActual * 0.25)}).
                    El resto debe aportarse en un plazo máximo de 5 años.
                  </div>
                )}
              </div>
            </div>

            {/* Domicilio Social */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>📍</span> Domicilio Social
              </h3>
              <div className={styles.datosGrid}>
                <div className={styles.inputGroupFull}>
                  <label>Dirección completa</label>
                  <input
                    type="text"
                    value={datos.domicilio}
                    onChange={e => actualizarDato('domicilio', e.target.value)}
                    placeholder="Ej: Calle Mayor, 15, 2º B"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Localidad</label>
                  <input
                    type="text"
                    value={datos.localidad}
                    onChange={e => actualizarDato('localidad', e.target.value)}
                    placeholder="Ej: Madrid"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Provincia</label>
                  <input
                    type="text"
                    value={datos.provincia}
                    onChange={e => actualizarDato('provincia', e.target.value)}
                    placeholder="Ej: Madrid"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Código Postal</label>
                  <input
                    type="text"
                    value={datos.codigoPostal}
                    onChange={e => actualizarDato('codigoPostal', e.target.value)}
                    placeholder="Ej: 28001"
                    className={styles.input}
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* Objeto Social */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>📄</span> Objeto Social
              </h3>
              <p className={styles.datosSeccionInfo}>
                Describe las actividades que realizará la empresa. Sé amplio para no tener que modificar estatutos en el futuro.
              </p>
              <textarea
                value={datos.objetoSocial}
                onChange={e => actualizarDato('objetoSocial', e.target.value)}
                placeholder="Ej: El desarrollo, comercialización y mantenimiento de aplicaciones informáticas y software. La prestación de servicios de consultoría tecnológica. El comercio al por menor y al por mayor de productos tecnológicos. Y cualesquiera otras actividades relacionadas, complementarias o accesorias de las anteriores."
                className={styles.textarea}
                rows={5}
              />
            </div>

            {/* Administración */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>👔</span> Órgano de Administración
              </h3>
              <div className={styles.adminOpciones}>
                {[
                  { valor: 'unico', etiqueta: 'Administrador único', descripcion: 'Una sola persona con plenos poderes' },
                  { valor: 'solidarios', etiqueta: 'Administradores solidarios', descripcion: 'Varios, cada uno puede actuar individualmente' },
                  { valor: 'mancomunados', etiqueta: 'Administradores mancomunados', descripcion: 'Varios, deben actuar conjuntamente' },
                  { valor: 'consejo', etiqueta: 'Consejo de Administración', descripcion: 'Órgano colegiado (mín. 3 miembros)' },
                ].map(opcion => (
                  <label key={opcion.valor} className={styles.adminOpcion}>
                    <input
                      type="radio"
                      name="tipoAdmin"
                      value={opcion.valor}
                      checked={datos.tipoAdministracion === opcion.valor}
                      onChange={e => actualizarDato('tipoAdministracion', e.target.value)}
                    />
                    <div className={styles.adminOpcionTexto}>
                      <span className={styles.adminOpcionEtiqueta}>{opcion.etiqueta}</span>
                      <span className={styles.adminOpcionDesc}>{opcion.descripcion}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Socios */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>👥</span> Socios Fundadores
              </h3>
              {tipoSeleccionado === 'SLU' && (
                <div className={styles.infoSLU}>
                  ℹ️ La SLU tiene un único socio. Si quieres añadir más socios, selecciona SL.
                </div>
              )}

              <div className={styles.sociosList}>
                {datos.socios.map((socio, index) => (
                  <div key={socio.id} className={styles.socioCard}>
                    <div className={styles.socioHeader}>
                      <span className={styles.socioNumero}>Socio {index + 1}</span>
                      {datos.socios.length > 1 && (
                        <button
                          onClick={() => eliminarSocio(socio.id)}
                          className={styles.btnEliminarSocio}
                          title="Eliminar socio"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className={styles.socioGrid}>
                      <div className={styles.inputGroup}>
                        <label>Nombre completo</label>
                        <input
                          type="text"
                          value={socio.nombre}
                          onChange={e => actualizarSocio(socio.id, 'nombre', e.target.value)}
                          placeholder="Nombre y apellidos"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>DNI/NIE</label>
                        <input
                          type="text"
                          value={socio.dni}
                          onChange={e => actualizarSocio(socio.id, 'dni', e.target.value)}
                          placeholder="12345678A"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Participación (%)</label>
                        <input
                          type="text"
                          value={socio.porcentaje}
                          onChange={e => actualizarSocio(socio.id, 'porcentaje', e.target.value)}
                          placeholder="50"
                          className={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tipoSeleccionado !== 'SLU' && (
                <button onClick={agregarSocio} className={styles.btnAgregarSocio}>
                  + Añadir socio
                </button>
              )}

              {/* Resumen participaciones */}
              <div className={`${styles.resumenParticipaciones} ${Math.abs(sumaPorcentajes - 100) < 0.01 ? styles.participacionesOk : styles.participacionesError}`}>
                <span>Total participaciones: {sumaPorcentajes.toFixed(2)}%</span>
                {Math.abs(sumaPorcentajes - 100) >= 0.01 && (
                  <span className={styles.participacionesAviso}>
                    ⚠️ La suma debe ser exactamente 100%
                  </span>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className={styles.datosAcciones}>
              <button onClick={reiniciarTodo} className={styles.btnSecundario}>
                🗑️ Reiniciar todo
              </button>
            </div>
          </div>
        )}

        {/* COSTES ESTIMADOS */}
        {pestanaActiva === 'costes' && (
          <div className={styles.costesContainer}>
            <div className={styles.costesInfo}>
              <p>
                Los costes varían según el capital social, número de socios y complejidad de los estatutos.
                Estos son valores orientativos para {COMPARATIVA_SOCIEDADES[tipoSeleccionado].nombre} con capital de {formatCurrency(capitalActual)}.
              </p>
            </div>

            <div className={styles.costesDesglose}>
              <div className={styles.costeItem}>
                <div className={styles.costeNombre}>
                  <span>✍️</span> Notaría (escritura constitución)
                </div>
                <div className={styles.costeValor}>{formatCurrency(costes.notaria)}</div>
              </div>

              <div className={styles.costeItem}>
                <div className={styles.costeNombre}>
                  <span>🏛️</span> Registro Mercantil Provincial
                </div>
                <div className={styles.costeValor}>{formatCurrency(costes.registroMercantil)}</div>
              </div>

              <div className={styles.costeItem}>
                <div className={styles.costeNombre}>
                  <span>📜</span> Certificación Negativa Denominación
                </div>
                <div className={styles.costeValor}>{formatCurrency(costes.certificacionDenominacion)}</div>
              </div>

              <div className={styles.costeItem}>
                <div className={styles.costeNombre}>
                  <span>📚</span> Legalización libros obligatorios
                </div>
                <div className={styles.costeValor}>{formatCurrency(costes.legalizacionLibros)}</div>
              </div>

              <div className={styles.costeSeparador} />

              <div className={`${styles.costeItem} ${styles.costeTotal}`}>
                <div className={styles.costeNombre}>
                  <strong>Total sin gestoría</strong>
                </div>
                <div className={styles.costeValor}>
                  <strong>{formatCurrency(costes.totalSinGestoria)}</strong>
                </div>
              </div>

              <div className={styles.costeItem}>
                <div className={styles.costeNombre}>
                  <span>👔</span> Gestoría (opcional)
                </div>
                <div className={styles.costeValor}>
                  {formatCurrency(costes.gestoriaMin)} - {formatCurrency(costes.gestoriaMax)}
                </div>
              </div>

              <div className={`${styles.costeItem} ${styles.costeTotalFinal}`}>
                <div className={styles.costeNombre}>
                  <strong>Total con gestoría</strong>
                </div>
                <div className={styles.costeValor}>
                  <strong>{formatCurrency(costes.totalConGestoriaMin)} - {formatCurrency(costes.totalConGestoriaMax)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.costesNotas}>
              <h4>📌 Notas importantes:</h4>
              <ul>
                <li>El <strong>Impuesto de Transmisiones (ITPyAJD)</strong> está exento desde 2010, pero hay que presentar el modelo.</li>
                <li>El <strong>capital social</strong> no es un coste, es dinero que queda en la empresa.</li>
                <li>Algunos <strong>PAE (Punto de Atención al Emprendedor)</strong> ofrecen constitución exprés con costes reducidos.</li>
                <li>La <strong>constitución telemática</strong> puede reducir plazos y costes de notaría.</li>
              </ul>
            </div>

            {/* Resumen capital + costes */}
            <div className={styles.resumenInversion}>
              <h4>💰 Inversión inicial total</h4>
              <div className={styles.inversionGrid}>
                <div className={styles.inversionItem}>
                  <span>Capital social</span>
                  <strong>{formatCurrency(capitalActual)}</strong>
                </div>
                <div className={styles.inversionItem}>
                  <span>Costes constitución (aprox.)</span>
                  <strong>{formatCurrency(costes.totalConGestoriaMin)} - {formatCurrency(costes.totalConGestoriaMax)}</strong>
                </div>
                <div className={`${styles.inversionItem} ${styles.inversionTotal}`}>
                  <span>Total a disponer</span>
                  <strong>
                    {formatCurrency(capitalActual + costes.totalConGestoriaMin)} - {formatCurrency(capitalActual + costes.totalConGestoriaMax)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta herramienta proporciona información orientativa sobre el proceso de constitución de sociedades en España.
          <strong> No constituye asesoramiento legal ni fiscal</strong>. Los costes y requisitos pueden variar según
          la comunidad autónoma, notaría elegida y circunstancias específicas.
        </p>
        <p>
          <strong>Recomendamos consultar con un profesional</strong> (abogado, asesor fiscal o gestoría) antes de iniciar
          el proceso de constitución para adaptar los estatutos y trámites a tu situación particular.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres saber más sobre constituir una empresa?"
        subtitle="Conceptos clave, diferencias entre tipos de sociedades y consejos prácticos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Por qué constituir una sociedad?</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🛡️ Responsabilidad limitada</h4>
              <p>
                En una SL o SA, los socios solo responden hasta el capital aportado.
                Tu patrimonio personal queda protegido ante deudas de la empresa.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💼 Imagen profesional</h4>
              <p>
                Una sociedad mercantil transmite mayor seriedad y facilita
                trabajar con grandes clientes y administraciones públicas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📈 Ventajas fiscales</h4>
              <p>
                El Impuesto de Sociedades (25%) puede ser más favorable que el IRPF
                para rentas altas. Además, permite más deducciones.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🤝 Facilita la inversión</h4>
              <p>
                Es más fácil incorporar socios, inversores o vender participaciones
                que en una actividad como autónomo.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>¿SL o SA? Cuál elegir</h2>
          <p>
            La <strong>Sociedad Limitada (SL)</strong> es la opción más común para pymes y emprendedores por su
            flexibilidad y menores requisitos. La <strong>Sociedad Anónima (SA)</strong> está pensada para
            grandes empresas, cotización en bolsa o sectores regulados (banca, seguros).
          </p>
          <p>
            Si eres <strong>socio único</strong>, puedes constituir una <strong>SLU (Sociedad Limitada Unipersonal)</strong>,
            que tiene los mismos beneficios que una SL pero con la obligación de hacer constar la unipersonalidad
            en documentación y Registro Mercantil.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>¿Cuánto tiempo tarda constituir una sociedad?</summary>
              <p>
                Por vía tradicional, entre 2-4 semanas. Existe la opción de <strong>constitución telemática exprés</strong>
                (CIRCE) que puede reducirlo a 48-72 horas si usas estatutos tipo y capital ≤ 3.100€.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo constituir una SL con 1€ de capital?</summary>
              <p>
                Existe la figura de <strong>Sociedad Limitada de Formación Sucesiva</strong> que permite empezar
                con menos de 3.000€, pero tiene limitaciones (no distribuir dividendos, destinar 20% beneficios
                a reservas, responsabilidad solidaria de socios hasta 3.000€).
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿El administrador debe darse de alta como autónomo?</summary>
              <p>
                Depende. Si el administrador es socio con participación ≥25% (o ≥33% si no trabaja activamente),
                debe darse de alta en RETA. Si es asalariado sin participación significativa, cotiza en Régimen General.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo usar mi casa como domicilio social?</summary>
              <p>
                Sí, es legal y muy común en pequeñas empresas. Sin embargo, considera que el domicilio social
                es público (aparece en el Registro Mercantil) y puede tener implicaciones fiscales locales.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('asistente-constitucion-sociedad')} />
      <Footer appName="asistente-constitucion-sociedad" />
    </div>
  );
}
