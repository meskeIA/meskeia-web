'use client';

import { useState, useEffect } from 'react';
import styles from './AsistenteAltaAutonomo.module.css';
import { MeskeiaLogo, Footer, NumberInput, RelatedApps, EducationalSection } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type TipoActividad = 'profesional' | 'empresarial' | 'artistica';
type SituacionLaboral = 'nueva_alta' | 'pluriactividad' | 'colaborador_familiar';

interface DatosAutonomo {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  telefono: string;
  email: string;
  tipoActividad: TipoActividad;
  descripcionActividad: string;
  epigrafeIAE: string;
  fechaAltaPrevista: string;
  situacionLaboral: SituacionLaboral;
  tieneLocal: boolean;
  tieneEmpleados: boolean;
  baseElegida: 'minima' | 'media' | 'maxima' | 'personalizada';
  basePersonalizada: string;
}

interface ChecklistItem {
  id: string;
  fase: number;
  texto: string;
  descripcion: string;
  completado: boolean;
  obligatorio: boolean;
  condicion?: 'tieneLocal' | 'tieneEmpleados' | 'actividadRegulada';
  enlaceUtil?: { texto: string; url: string };
}

// Bases de cotización 2024/2025 (tramos por rendimientos)
const BASES_COTIZACION = {
  minima: { base: 950.98, descripcion: 'Base mínima (rendimientos bajos)' },
  media: { base: 1200, descripcion: 'Base intermedia' },
  maxima: { base: 4720.50, descripcion: 'Base máxima' },
};

// Cuota autónomo 2024 (tipo general: 31.30%)
const TIPO_COTIZACION = 0.3130;

// Tarifa plana 2024
const TARIFA_PLANA = {
  importe: 80,
  duracion: 12, // meses
  ampliacion: { importe: 80, duracion: 12, condicion: 'rendimientos < SMI' },
};

// Checklist por fases
const CHECKLIST_ITEMS: Omit<ChecklistItem, 'completado'>[] = [
  // FASE 1: Preparación
  {
    id: 'decidir-actividad',
    fase: 1,
    texto: 'Decidir actividad y buscar epígrafe IAE',
    descripcion: 'Busca en la lista de epígrafes IAE el que mejor describe tu actividad. Es importante elegir bien porque determina obligaciones fiscales.',
    obligatorio: true,
    enlaceUtil: { texto: 'Buscador epígrafes IAE', url: 'https://www.agenciatributaria.es/AEAT.internet/Inicio/Ayuda/Modelos__Procedimientos_y_Servicios/Ayuda_Modelo_036_702/Informacion/Consulta_de_los_Epigrafes_IAE/Consulta_de_los_Epigrafes_IAE.shtml' },
  },
  {
    id: 'certificado-digital',
    fase: 1,
    texto: 'Obtener certificado digital o Cl@ve',
    descripcion: 'Necesario para trámites online con Hacienda y Seguridad Social. Puedes usar certificado FNMT (gratuito) o Cl@ve PIN.',
    obligatorio: true,
    enlaceUtil: { texto: 'Obtener certificado FNMT', url: 'https://www.sede.fnmt.gob.es/certificados/persona-fisica' },
  },
  {
    id: 'cuenta-bancaria',
    fase: 1,
    texto: 'Abrir cuenta bancaria para la actividad (recomendado)',
    descripcion: 'No es obligatorio pero muy recomendable separar finanzas personales de las del negocio. Facilita la contabilidad.',
    obligatorio: false,
  },
  {
    id: 'presupuesto-inicial',
    fase: 1,
    texto: 'Calcular presupuesto inicial y gastos fijos',
    descripcion: 'Estima cuánto necesitas para empezar: cuota autónomo, gestoría, herramientas, seguros, etc.',
    obligatorio: false,
  },
  // FASE 2: Alta en Hacienda
  {
    id: 'modelo-036-037',
    fase: 2,
    texto: 'Presentar Modelo 036 o 037 (Alta censal)',
    descripcion: 'Declaración censal en Hacienda. El 037 es simplificado para la mayoría de autónomos. Indica actividad, epígrafe, régimen IVA, etc.',
    obligatorio: true,
    enlaceUtil: { texto: 'Modelo 037 online', url: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G322.shtml' },
  },
  {
    id: 'elegir-regimen-iva',
    fase: 2,
    texto: 'Elegir régimen de IVA',
    descripcion: 'General (trimestral), Simplificado (módulos) o Recargo equivalencia (comercio minorista). La mayoría usa el General.',
    obligatorio: true,
  },
  {
    id: 'elegir-irpf',
    fase: 2,
    texto: 'Elegir método estimación IRPF',
    descripcion: 'Estimación Directa Simplificada (la más común), Directa Normal (para facturación alta) o Módulos (actividades concretas).',
    obligatorio: true,
  },
  // FASE 3: Alta en Seguridad Social
  {
    id: 'alta-reta',
    fase: 3,
    texto: 'Alta en RETA (Régimen Especial Trabajadores Autónomos)',
    descripcion: 'Obligatorio en los 60 días siguientes al alta en Hacienda. Se hace en la Sede Electrónica de la Seguridad Social.',
    obligatorio: true,
    enlaceUtil: { texto: 'Alta RETA online', url: 'https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/CiijilAutonomos' },
  },
  {
    id: 'elegir-base-cotizacion',
    fase: 3,
    texto: 'Elegir base de cotización',
    descripcion: 'Desde 2023 se cotiza por tramos según rendimientos previstos. Puedes cambiarla hasta 6 veces al año.',
    obligatorio: true,
  },
  {
    id: 'elegir-mutua',
    fase: 3,
    texto: 'Elegir mutua colaboradora',
    descripcion: 'Gestiona prestaciones por IT, accidente, cese de actividad. Puedes elegir cualquiera de las autorizadas.',
    obligatorio: true,
    enlaceUtil: { texto: 'Listado de mutuas', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotijiyRecworkers/10721/10724/1648' },
  },
  {
    id: 'tarifa-plana',
    fase: 3,
    texto: 'Solicitar tarifa plana (si aplica)',
    descripcion: '80€/mes durante 12 meses si es tu primera alta o no has sido autónomo en los últimos 2 años. Ampliable otros 12 meses.',
    obligatorio: false,
  },
  // FASE 4: Licencias y permisos
  {
    id: 'licencia-apertura',
    fase: 4,
    texto: 'Licencia de apertura/actividad (si tienes local)',
    descripcion: 'Tramitar en el Ayuntamiento. Puede ser declaración responsable o licencia según actividad y tamaño.',
    obligatorio: false,
    condicion: 'tieneLocal',
  },
  {
    id: 'licencia-obras',
    fase: 4,
    texto: 'Licencia de obras (si reformas el local)',
    descripcion: 'Necesaria si haces reformas. Puede ser comunicación previa o licencia según el tipo de obra.',
    obligatorio: false,
    condicion: 'tieneLocal',
  },
  {
    id: 'registro-sanitario',
    fase: 4,
    texto: 'Registro sanitario (actividades alimentarias)',
    descripcion: 'Obligatorio para actividades relacionadas con alimentación. Se tramita en Sanidad de tu CCAA.',
    obligatorio: false,
    condicion: 'actividadRegulada',
  },
  {
    id: 'seguro-rc',
    fase: 4,
    texto: 'Contratar seguro de responsabilidad civil',
    descripcion: 'Obligatorio para algunas profesiones (sanitarios, abogados, arquitectos...). Muy recomendable para todos.',
    obligatorio: false,
  },
  {
    id: 'proteccion-datos',
    fase: 4,
    texto: 'Cumplir con protección de datos (RGPD/LOPDGDD)',
    descripcion: 'Si tratas datos personales de clientes, debes cumplir la normativa. Incluye registro de actividades y política de privacidad.',
    obligatorio: true,
  },
  // FASE 5: Operatividad
  {
    id: 'alta-empleados',
    fase: 5,
    texto: 'Alta en Seguridad Social como empleador (si contratas)',
    descripcion: 'Solicitar Código Cuenta Cotización antes de contratar al primer empleado.',
    obligatorio: false,
    condicion: 'tieneEmpleados',
  },
  {
    id: 'software-facturacion',
    fase: 5,
    texto: 'Elegir software de facturación',
    descripcion: 'Obligatorio emitir facturas. Desde 2025 será obligatorio usar software homologado (Verifactu).',
    obligatorio: true,
  },
  {
    id: 'contabilidad',
    fase: 5,
    texto: 'Organizar sistema de contabilidad',
    descripcion: 'Libro de ingresos, libro de gastos, libro de bienes de inversión. Puedes llevarlo tú o contratar gestoría.',
    obligatorio: true,
  },
  {
    id: 'contratar-gestoria',
    fase: 5,
    texto: 'Valorar contratar gestoría (recomendado)',
    descripcion: 'Te ayuda con impuestos trimestrales, declaraciones anuales y te mantiene al día de cambios normativos.',
    obligatorio: false,
  },
];

const FASES = [
  { numero: 1, nombre: 'Preparación', icono: '📋', descripcion: 'Antes de empezar los trámites' },
  { numero: 2, nombre: 'Alta en Hacienda', icono: '🏛️', descripcion: 'Declaración censal (036/037)' },
  { numero: 3, nombre: 'Seguridad Social', icono: '🛡️', descripcion: 'Alta en RETA' },
  { numero: 4, nombre: 'Licencias', icono: '📄', descripcion: 'Permisos según actividad' },
  { numero: 5, nombre: 'Operatividad', icono: '🚀', descripcion: 'Puesta en marcha' },
];

// Epígrafes IAE comunes
const EPIGRAFES_COMUNES = [
  { codigo: '841', descripcion: 'Servicios jurídicos (abogados)' },
  { codigo: '842', descripcion: 'Servicios financieros y contables' },
  { codigo: '843', descripcion: 'Servicios técnicos (arquitectos, ingenieros)' },
  { codigo: '844', descripcion: 'Servicios de publicidad, RRPP, marketing' },
  { codigo: '849.5', descripcion: 'Servicios de traducción' },
  { codigo: '849.7', descripcion: 'Servicios de diseño gráfico' },
  { codigo: '861', descripcion: 'Pintores, escultores, ceramistas' },
  { codigo: '899', descripcion: 'Otros profesionales (consultores, formadores)' },
  { codigo: '651', descripcion: 'Comercio menor textil y confección' },
  { codigo: '659', descripcion: 'Comercio menor (otros productos)' },
  { codigo: '673', descripcion: 'Servicios de restauración (bares, cafeterías)' },
  { codigo: '721.1', descripcion: 'Transporte de viajeros (taxi, VTC)' },
  { codigo: '722', descripcion: 'Transporte de mercancías' },
  { codigo: '831', descripcion: 'Médicos especialistas' },
  { codigo: '836', descripcion: 'Fisioterapeutas, masajistas' },
  { codigo: '855', descripcion: 'Agentes comerciales' },
  { codigo: '933.9', descripcion: 'Profesores, enseñanza' },
  { codigo: '763', descripcion: 'Programadores, informáticos' },
  { codigo: '769.9', descripcion: 'Otros servicios informáticos' },
];

const STORAGE_KEY = 'meskeia-alta-autonomo';

export default function AsistenteAltaAutonomoPage() {
  // Estado principal
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    CHECKLIST_ITEMS.map(item => ({ ...item, completado: false }))
  );
  const [datos, setDatos] = useState<DatosAutonomo>({
    nombre: '',
    dni: '',
    fechaNacimiento: '',
    direccion: '',
    localidad: '',
    provincia: '',
    codigoPostal: '',
    telefono: '',
    email: '',
    tipoActividad: 'profesional',
    descripcionActividad: '',
    epigrafeIAE: '',
    fechaAltaPrevista: '',
    situacionLaboral: 'nueva_alta',
    tieneLocal: false,
    tieneEmpleados: false,
    baseElegida: 'minima',
    basePersonalizada: '',
  });
  const [pestanaActiva, setPestanaActiva] = useState<'checklist' | 'datos' | 'costes'>('checklist');
  const [faseExpandida, setFaseExpandida] = useState<number | null>(1);
  const [mostrarEpigrafes, setMostrarEpigrafes] = useState(false);

  // Cargar datos guardados
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
        }
      }
    } catch {
      // Mantener valores por defecto
    }
  }, []);

  // Guardar cambios
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ checklist, datos }));
    }
  }, [checklist, datos]);

  // Handlers
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completado: !item.completado } : item
      )
    );
  };

  const actualizarDato = <K extends keyof DatosAutonomo>(campo: K, valor: DatosAutonomo[K]) => {
    setDatos(prev => ({ ...prev, [campo]: valor }));
  };

  const seleccionarEpigrafe = (codigo: string, descripcion: string) => {
    actualizarDato('epigrafeIAE', codigo);
    actualizarDato('descripcionActividad', descripcion);
    setMostrarEpigrafes(false);
  };

  const reiniciarTodo = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.removeItem(STORAGE_KEY);
      setChecklist(CHECKLIST_ITEMS.map(item => ({ ...item, completado: false })));
      setDatos({
        nombre: '',
        dni: '',
        fechaNacimiento: '',
        direccion: '',
        localidad: '',
        provincia: '',
        codigoPostal: '',
        telefono: '',
        email: '',
        tipoActividad: 'profesional',
        descripcionActividad: '',
        epigrafeIAE: '',
        fechaAltaPrevista: '',
        situacionLaboral: 'nueva_alta',
        tieneLocal: false,
        tieneEmpleados: false,
        baseElegida: 'minima',
        basePersonalizada: '',
      });
    }
  };

  // Filtrar checklist según condiciones
  const getChecklistFiltrado = () => {
    return checklist.filter(item => {
      if (!item.condicion) return true;
      if (item.condicion === 'tieneLocal') return datos.tieneLocal;
      if (item.condicion === 'tieneEmpleados') return datos.tieneEmpleados;
      return true;
    });
  };

  // Cálculos
  const calcularProgreso = () => {
    const filtrado = getChecklistFiltrado();
    const obligatorios = filtrado.filter(item => item.obligatorio);
    const completados = obligatorios.filter(item => item.completado);
    return obligatorios.length > 0 ? Math.round((completados.length / obligatorios.length) * 100) : 0;
  };

  const calcularProgresoFase = (fase: number) => {
    const itemsFase = getChecklistFiltrado().filter(item => item.fase === fase);
    const completados = itemsFase.filter(item => item.completado);
    return itemsFase.length > 0 ? Math.round((completados.length / itemsFase.length) * 100) : 0;
  };

  const calcularCuotaAutonomo = () => {
    let base: number;
    if (datos.baseElegida === 'personalizada') {
      base = parseSpanishNumber(datos.basePersonalizada) || BASES_COTIZACION.minima.base;
    } else {
      base = BASES_COTIZACION[datos.baseElegida].base;
    }

    const cuotaNormal = base * TIPO_COTIZACION;
    const puedesTarifaPlana = datos.situacionLaboral === 'nueva_alta';

    return {
      base,
      cuotaNormal,
      tarifaPlana: puedesTarifaPlana ? TARIFA_PLANA.importe : null,
      ahorroPrimerAno: puedesTarifaPlana ? (cuotaNormal - TARIFA_PLANA.importe) * 12 : 0,
    };
  };

  const calcularCostesEstimados = () => {
    const cuota = calcularCuotaAutonomo();
    const cuotaMensual = cuota.tarifaPlana || cuota.cuotaNormal;

    // Costes anuales estimados
    const gestoriaMensual = { min: 50, max: 150 };
    const seguroRC = { min: 150, max: 500 };

    return {
      cuotaMensual,
      cuotaAnual: cuotaMensual * 12,
      gestoriaMensualMin: gestoriaMensual.min,
      gestoriaMensualMax: gestoriaMensual.max,
      gestoriaAnualMin: gestoriaMensual.min * 12,
      gestoriaAnualMax: gestoriaMensual.max * 12,
      seguroRCMin: seguroRC.min,
      seguroRCMax: seguroRC.max,
      totalAnualMin: (cuotaMensual * 12) + (gestoriaMensual.min * 12) + seguroRC.min,
      totalAnualMax: (cuotaMensual * 12) + (gestoriaMensual.max * 12) + seguroRC.max,
    };
  };

  const cuotaInfo = calcularCuotaAutonomo();
  const costes = calcularCostesEstimados();
  const progreso = calcularProgreso();
  const checklistFiltrado = getChecklistFiltrado();
  const obligatoriosFiltrados = checklistFiltrado.filter(i => i.obligatorio);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>💼</span>
        <h1 className={styles.title}>Asistente Alta Autónomo</h1>
        <p className={styles.subtitle}>
          Guía completa para darte de alta como trabajador autónomo en España.
          Checklist interactivo con todos los trámites y calculadora de cuota.
        </p>
      </header>

      {/* Info rápida */}
      <section className={styles.infoRapida}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>💰</span>
          <div className={styles.infoTexto}>
            <span className={styles.infoValor}>{formatCurrency(TARIFA_PLANA.importe)}/mes</span>
            <span className={styles.infoLabel}>Tarifa plana (12 meses)</span>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>📅</span>
          <div className={styles.infoTexto}>
            <span className={styles.infoValor}>60 días</span>
            <span className={styles.infoLabel}>Plazo alta RETA tras Hacienda</span>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>📝</span>
          <div className={styles.infoTexto}>
            <span className={styles.infoValor}>2 trámites</span>
            <span className={styles.infoLabel}>Hacienda + Seg. Social</span>
          </div>
        </div>
      </section>

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
          {checklistFiltrado.filter(i => i.obligatorio && i.completado).length} de {obligatoriosFiltrados.length} pasos obligatorios completados
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
          <span>📝</span> Mis Datos
        </button>
        <button
          className={`${styles.pestana} ${pestanaActiva === 'costes' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('costes')}
        >
          <span>💰</span> Cuota y Costes
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div className={styles.contenidoPestana}>
        {/* CHECKLIST */}
        {pestanaActiva === 'checklist' && (
          <div className={styles.checklistContainer}>
            {/* Opciones que afectan al checklist */}
            <div className={styles.opcionesChecklist}>
              <label className={styles.opcionCheck}>
                <input
                  type="checkbox"
                  checked={datos.tieneLocal}
                  onChange={e => actualizarDato('tieneLocal', e.target.checked)}
                />
                <span>Tengo o tendré local/oficina</span>
              </label>
              <label className={styles.opcionCheck}>
                <input
                  type="checkbox"
                  checked={datos.tieneEmpleados}
                  onChange={e => actualizarDato('tieneEmpleados', e.target.checked)}
                />
                <span>Voy a contratar empleados</span>
              </label>
            </div>

            {FASES.map(fase => {
              const itemsFase = checklistFiltrado.filter(item => item.fase === fase.numero);
              if (itemsFase.length === 0) return null;

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
              <span className={styles.obligatorio}>*</span> Pasos obligatorios para todos los autónomos
            </p>
          </div>
        )}

        {/* DATOS */}
        {pestanaActiva === 'datos' && (
          <div className={styles.datosContainer}>
            {/* Datos personales */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>👤</span> Datos Personales
              </h3>
              <div className={styles.datosGrid}>
                <div className={styles.inputGroup}>
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    value={datos.nombre}
                    onChange={e => actualizarDato('nombre', e.target.value)}
                    placeholder="Nombre y apellidos"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>DNI/NIE</label>
                  <input
                    type="text"
                    value={datos.dni}
                    onChange={e => actualizarDato('dni', e.target.value)}
                    placeholder="12345678A"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={datos.fechaNacimiento}
                    onChange={e => actualizarDato('fechaNacimiento', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={datos.telefono}
                    onChange={e => actualizarDato('telefono', e.target.value)}
                    placeholder="600 123 456"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={datos.email}
                    onChange={e => actualizarDato('email', e.target.value)}
                    placeholder="tu@email.com"
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Domicilio */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>📍</span> Domicilio Fiscal
              </h3>
              <div className={styles.datosGrid}>
                <div className={styles.inputGroupFull}>
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={datos.direccion}
                    onChange={e => actualizarDato('direccion', e.target.value)}
                    placeholder="Calle, número, piso..."
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Localidad</label>
                  <input
                    type="text"
                    value={datos.localidad}
                    onChange={e => actualizarDato('localidad', e.target.value)}
                    placeholder="Madrid"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Provincia</label>
                  <input
                    type="text"
                    value={datos.provincia}
                    onChange={e => actualizarDato('provincia', e.target.value)}
                    placeholder="Madrid"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Código Postal</label>
                  <input
                    type="text"
                    value={datos.codigoPostal}
                    onChange={e => actualizarDato('codigoPostal', e.target.value)}
                    placeholder="28001"
                    className={styles.input}
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* Actividad */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>💼</span> Actividad Económica
              </h3>
              <div className={styles.datosGrid}>
                <div className={styles.inputGroupFull}>
                  <label>Tipo de actividad</label>
                  <div className={styles.tipoActividadOpciones}>
                    {[
                      { valor: 'profesional', etiqueta: 'Profesional', desc: 'Servicios que requieren titulación' },
                      { valor: 'empresarial', etiqueta: 'Empresarial', desc: 'Comercio, hostelería, transporte...' },
                      { valor: 'artistica', etiqueta: 'Artística', desc: 'Creación artística' },
                    ].map(opcion => (
                      <label key={opcion.valor} className={styles.tipoActividadOpcion}>
                        <input
                          type="radio"
                          name="tipoActividad"
                          value={opcion.valor}
                          checked={datos.tipoActividad === opcion.valor}
                          onChange={e => actualizarDato('tipoActividad', e.target.value as TipoActividad)}
                        />
                        <div>
                          <span className={styles.tipoActividadEtiqueta}>{opcion.etiqueta}</span>
                          <span className={styles.tipoActividadDesc}>{opcion.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Epígrafe IAE</label>
                  <div className={styles.epigrafeContainer}>
                    <input
                      type="text"
                      value={datos.epigrafeIAE}
                      onChange={e => actualizarDato('epigrafeIAE', e.target.value)}
                      placeholder="Ej: 763"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarEpigrafes(!mostrarEpigrafes)}
                      className={styles.btnBuscarEpigrafe}
                    >
                      {mostrarEpigrafes ? '✕' : '🔍'}
                    </button>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Descripción actividad</label>
                  <input
                    type="text"
                    value={datos.descripcionActividad}
                    onChange={e => actualizarDato('descripcionActividad', e.target.value)}
                    placeholder="Ej: Programación informática"
                    className={styles.input}
                  />
                </div>

                {mostrarEpigrafes && (
                  <div className={styles.listaEpigrafes}>
                    <p className={styles.listaEpigrafesInfo}>Epígrafes comunes (pulsa para seleccionar):</p>
                    {EPIGRAFES_COMUNES.map(ep => (
                      <button
                        key={ep.codigo}
                        className={styles.epigrafeItem}
                        onClick={() => seleccionarEpigrafe(ep.codigo, ep.descripcion)}
                      >
                        <span className={styles.epigrafeCodigo}>{ep.codigo}</span>
                        <span className={styles.epigrafeDesc}>{ep.descripcion}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label>Fecha prevista de alta</label>
                  <input
                    type="date"
                    value={datos.fechaAltaPrevista}
                    onChange={e => actualizarDato('fechaAltaPrevista', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Situación laboral */}
            <div className={styles.datosSeccion}>
              <h3 className={styles.datosSeccionTitulo}>
                <span>📋</span> Situación Laboral
              </h3>
              <div className={styles.situacionOpciones}>
                {[
                  { valor: 'nueva_alta', etiqueta: 'Primera alta como autónomo', desc: 'Nunca he sido autónomo o hace más de 2 años' },
                  { valor: 'pluriactividad', etiqueta: 'Pluriactividad', desc: 'También trabajo por cuenta ajena' },
                  { valor: 'colaborador_familiar', etiqueta: 'Colaborador familiar', desc: 'Trabajo en negocio de familiar' },
                ].map(opcion => (
                  <label key={opcion.valor} className={styles.situacionOpcion}>
                    <input
                      type="radio"
                      name="situacionLaboral"
                      value={opcion.valor}
                      checked={datos.situacionLaboral === opcion.valor}
                      onChange={e => actualizarDato('situacionLaboral', e.target.value as SituacionLaboral)}
                    />
                    <div>
                      <span className={styles.situacionEtiqueta}>{opcion.etiqueta}</span>
                      <span className={styles.situacionDesc}>{opcion.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {datos.situacionLaboral === 'nueva_alta' && (
                <div className={styles.infoTarifaPlana}>
                  ✅ <strong>¡Puedes solicitar la tarifa plana!</strong> 80€/mes durante 12 meses.
                </div>
              )}

              {datos.situacionLaboral === 'pluriactividad' && (
                <div className={styles.infoPluriactividad}>
                  ℹ️ En pluriactividad puedes tener bonificaciones en la cuota según tu cotización por cuenta ajena.
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className={styles.datosAcciones}>
              <button onClick={reiniciarTodo} className={styles.btnSecundario}>
                🗑️ Reiniciar todo
              </button>
            </div>
          </div>
        )}

        {/* CUOTA Y COSTES */}
        {pestanaActiva === 'costes' && (
          <div className={styles.costesContainer}>
            {/* Calculadora de cuota */}
            <div className={styles.calculadoraCuota}>
              <h3 className={styles.costesSeccionTitulo}>
                <span>🧮</span> Calculadora de Cuota Autónomo
              </h3>

              <div className={styles.basesCotizacion}>
                <p className={styles.basesInfo}>
                  Desde 2023 la cuota se calcula según tus rendimientos netos previstos.
                  Elige una base de cotización:
                </p>

                <div className={styles.basesOpciones}>
                  {(Object.entries(BASES_COTIZACION) as [keyof typeof BASES_COTIZACION, typeof BASES_COTIZACION.minima][]).map(([key, info]) => (
                    <label key={key} className={`${styles.baseOpcion} ${datos.baseElegida === key ? styles.baseOpcionActiva : ''}`}>
                      <input
                        type="radio"
                        name="baseElegida"
                        value={key}
                        checked={datos.baseElegida === key}
                        onChange={() => actualizarDato('baseElegida', key)}
                      />
                      <div className={styles.baseOpcionInfo}>
                        <span className={styles.baseOpcionValor}>{formatCurrency(info.base)}</span>
                        <span className={styles.baseOpcionDesc}>{info.descripcion}</span>
                      </div>
                    </label>
                  ))}
                  <label className={`${styles.baseOpcion} ${datos.baseElegida === 'personalizada' ? styles.baseOpcionActiva : ''}`}>
                    <input
                      type="radio"
                      name="baseElegida"
                      value="personalizada"
                      checked={datos.baseElegida === 'personalizada'}
                      onChange={() => actualizarDato('baseElegida', 'personalizada')}
                    />
                    <div className={styles.baseOpcionInfo}>
                      <span className={styles.baseOpcionValor}>Personalizada</span>
                      {datos.baseElegida === 'personalizada' && (
                        <NumberInput
                          value={datos.basePersonalizada}
                          onChange={val => actualizarDato('basePersonalizada', val)}
                          placeholder="Ej: 1100"
                          min={BASES_COTIZACION.minima.base}
                          max={BASES_COTIZACION.maxima.base}
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Resultado cuota */}
              <div className={styles.resultadoCuota}>
                <div className={styles.cuotaItem}>
                  <span>Base de cotización elegida</span>
                  <strong>{formatCurrency(cuotaInfo.base)}</strong>
                </div>
                <div className={styles.cuotaItem}>
                  <span>Tipo de cotización</span>
                  <strong>{formatNumber(TIPO_COTIZACION * 100, 2)}%</strong>
                </div>
                <div className={styles.cuotaSeparador} />
                <div className={`${styles.cuotaItem} ${styles.cuotaNormal}`}>
                  <span>Cuota mensual normal</span>
                  <strong>{formatCurrency(cuotaInfo.cuotaNormal)}</strong>
                </div>

                {cuotaInfo.tarifaPlana && (
                  <>
                    <div className={`${styles.cuotaItem} ${styles.cuotaTarifaPlana}`}>
                      <span>🎉 Con tarifa plana (12 meses)</span>
                      <strong>{formatCurrency(cuotaInfo.tarifaPlana)}/mes</strong>
                    </div>
                    <div className={styles.cuotaAhorro}>
                      Ahorro primer año: <strong>{formatCurrency(cuotaInfo.ahorroPrimerAno)}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Costes anuales estimados */}
            <div className={styles.costesAnuales}>
              <h3 className={styles.costesSeccionTitulo}>
                <span>📊</span> Costes Anuales Estimados
              </h3>

              <div className={styles.costesDesglose}>
                <div className={styles.costeItem}>
                  <div className={styles.costeNombre}>
                    <span>🛡️</span> Cuota autónomo (anual)
                  </div>
                  <div className={styles.costeValor}>{formatCurrency(costes.cuotaAnual)}</div>
                </div>

                <div className={styles.costeItem}>
                  <div className={styles.costeNombre}>
                    <span>👔</span> Gestoría (opcional)
                  </div>
                  <div className={styles.costeValor}>
                    {formatCurrency(costes.gestoriaAnualMin)} - {formatCurrency(costes.gestoriaAnualMax)}
                  </div>
                </div>

                <div className={styles.costeItem}>
                  <div className={styles.costeNombre}>
                    <span>🔒</span> Seguro Resp. Civil (recomendado)
                  </div>
                  <div className={styles.costeValor}>
                    {formatCurrency(costes.seguroRCMin)} - {formatCurrency(costes.seguroRCMax)}
                  </div>
                </div>

                <div className={styles.costeSeparador} />

                <div className={`${styles.costeItem} ${styles.costeTotalFinal}`}>
                  <div className={styles.costeNombre}>
                    <strong>Total anual estimado</strong>
                  </div>
                  <div className={styles.costeValor}>
                    <strong>{formatCurrency(costes.totalAnualMin)} - {formatCurrency(costes.totalAnualMax)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparativa autónomo vs SL */}
            <div className={styles.comparativa}>
              <h3 className={styles.costesSeccionTitulo}>
                <span>⚖️</span> ¿Autónomo o Sociedad Limitada?
              </h3>

              <div className={styles.comparativaTabla}>
                <table>
                  <thead>
                    <tr>
                      <th>Aspecto</th>
                      <th>Autónomo</th>
                      <th>SL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Capital inicial</td>
                      <td className={styles.ventaja}>0 €</td>
                      <td>Mínimo 3.000 €</td>
                    </tr>
                    <tr>
                      <td>Responsabilidad</td>
                      <td className={styles.desventaja}>Ilimitada (patrimonio personal)</td>
                      <td className={styles.ventaja}>Limitada al capital</td>
                    </tr>
                    <tr>
                      <td>Fiscalidad</td>
                      <td>IRPF (hasta 47%)</td>
                      <td className={styles.ventaja}>IS (25% fijo)</td>
                    </tr>
                    <tr>
                      <td>Cuota Seg. Social</td>
                      <td>Desde 80€/mes (tarifa plana)</td>
                      <td>~300€/mes (administrador)</td>
                    </tr>
                    <tr>
                      <td>Trámites</td>
                      <td className={styles.ventaja}>Sencillos</td>
                      <td>Más complejos</td>
                    </tr>
                    <tr>
                      <td>Contabilidad</td>
                      <td className={styles.ventaja}>Simplificada</td>
                      <td>Completa obligatoria</td>
                    </tr>
                    <tr>
                      <td>Imagen</td>
                      <td>Persona física</td>
                      <td className={styles.ventaja}>Más profesional</td>
                    </tr>
                    <tr>
                      <td>Ideal para</td>
                      <td>Inicio, bajo riesgo, facturación baja</td>
                      <td>Facturación alta, varios socios, riesgo</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.recomendacion}>
                <strong>💡 Recomendación general:</strong> Empieza como autónomo si facturas menos de 40.000-50.000€/año.
                Cuando superes esa cifra o necesites limitar responsabilidad, valora constituir una SL.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta herramienta proporciona información orientativa sobre el proceso de alta como autónomo en España.
          <strong> No constituye asesoramiento legal ni fiscal</strong>. Los requisitos y cuotas pueden variar
          según tu situación personal y cambios normativos.
        </p>
        <p>
          <strong>Recomendamos consultar con un profesional</strong> (gestoría o asesor fiscal) antes de darte de alta
          para optimizar tu situación fiscal y cumplir correctamente con todas las obligaciones.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres saber más sobre ser autónomo?"
        subtitle="Conceptos clave, obligaciones fiscales y consejos prácticos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Obligaciones fiscales del autónomo</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📅 Trimestrales</h4>
              <ul>
                <li><strong>Modelo 303</strong>: Declaración IVA</li>
                <li><strong>Modelo 130</strong>: Pago fraccionado IRPF (estimación directa)</li>
                <li><strong>Modelo 111</strong>: Retenciones (si tienes empleados)</li>
                <li><strong>Modelo 115</strong>: Retenciones alquiler (si alquilas local)</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>📆 Anuales</h4>
              <ul>
                <li><strong>Modelo 390</strong>: Resumen anual IVA</li>
                <li><strong>Modelo 100</strong>: Declaración de la Renta</li>
                <li><strong>Modelo 347</strong>: Operaciones con terceros (+3.005,06€)</li>
                <li><strong>Modelo 349</strong>: Operaciones intracomunitarias</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>¿Puedo ser autónomo y trabajar por cuenta ajena a la vez?</summary>
              <p>
                Sí, se llama <strong>pluriactividad</strong>. Cotizas en ambos regímenes y puedes tener
                bonificaciones en la cuota de autónomo. Si la suma de bases supera el tope máximo,
                puedes solicitar devolución del exceso.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué pasa si facturo poco o nada un mes?</summary>
              <p>
                La cuota de autónomo es fija, factures o no. Por eso es importante calcular bien
                si te compensa darte de alta. Desde 2023 puedes ajustar tu base según rendimientos reales.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo darme de baja y volver a tener tarifa plana?</summary>
              <p>
                Para volver a acceder a la tarifa plana debes no haber sido autónomo en los <strong>2 años anteriores</strong>
                (3 años si ya la disfrutaste antes). Las altas y bajas frecuentes pueden ser revisadas por Hacienda.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Necesito darme de alta para facturar esporádicamente?</summary>
              <p>
                Depende. Si es actividad puntual y no habitual, podrías emitir factura sin alta (declarando en IRPF).
                Pero si hay habitualidad o superas el SMI, el alta es obligatoria. Consulta con un asesor.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('asistente-alta-autonomo')} />
      <Footer appName="asistente-alta-autonomo" />
    </div>
  );
}
