'use client';

import { useState, useEffect } from 'react';
import styles from './AsistenteAltaAutonomo.module.css';
import { MeskeiaLogo, Footer, NumberInput, RelatedApps, EducationalSection, ShareCard, DisclaimerCard,
  DataReference,
} from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { TIPO_COTIZACION_RETA, TARIFA_PLANA_2025, BASES_RETA_2025, FISCAL_AUTONOMOS_META } from '@/data/fiscal/autonomos';

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

// Bases de cotización 2026 (tramos por rendimientos reales — RDL 13/2022)
const BASES_COTIZACION = {
  minima: { base: BASES_RETA_2025.minima, descripcion: 'Base mínima (rendimientos bajos)' },
  media: { base: 1200, descripcion: 'Base intermedia' },
  maxima: { base: BASES_RETA_2025.maxima, descripcion: 'Base máxima' },
};

// Tipo cotización autónomo 2026 (31,50% — RDL 16/2025)
const TIPO_COTIZACION = TIPO_COTIZACION_RETA;

// Tarifa plana 2026
const TARIFA_PLANA = {
  importe: TARIFA_PLANA_2025.cuota,
  duracion: TARIFA_PLANA_2025.duracion,
  ampliacion: { importe: TARIFA_PLANA_2025.cuota, duracion: TARIFA_PLANA_2025.duracion, condicion: 'rendimientos < SMI' },
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

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={FISCAL_AUTONOMOS_META.fuente}
        fuente={FISCAL_AUTONOMOS_META.fuente}
        verificado={FISCAL_AUTONOMOS_META.verificado}
        urlOficial={FISCAL_AUTONOMOS_META.urlOficial}
      />

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
                          label="Base de cotización personalizada"
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
        <h3>⚠️ Herramienta de Orientación — No es asesoramiento profesional</h3>
        <p>
          Esta herramienta proporciona información <strong>orientativa y educativa</strong> sobre el proceso de alta como autónomo en España.
          <strong> No constituye asesoramiento legal ni fiscal</strong>. Los requisitos, cuotas y procedimientos pueden variar
          según tu situación personal y cambios normativos. Datos orientativos para 2025, verificados en base al{' '}
          <a href="https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817" target="_blank" rel="noopener noreferrer">
            sistema RETA de la Seguridad Social
          </a>.
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

        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de regímenes: ¿cuál te corresponde?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Autónomo régimen común</th>
                  <th>Autónomo societario</th>
                  <th>Pluriactividad (asalariado + autónomo)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cuota mínima mensual</td>
                  <td>Desde 200 €/mes (rendimientos bajos)</td>
                  <td>Desde 310 €/mes (base mínima RETA admin.)</td>
                  <td>Posible reducción del 50 % el 1.º año</td>
                </tr>
                <tr>
                  <td>Tarifa plana 80 €</td>
                  <td>✅ Sí (primeras altas o sin alta en 2 años)</td>
                  <td>❌ No disponible</td>
                  <td>✅ Sí si es primera alta como autónomo</td>
                </tr>
                <tr>
                  <td>Obligaciones fiscales</td>
                  <td>IRPF (mod. 130) + IVA (mod. 303)</td>
                  <td>Impuesto Sociedades (mod. 200) + nómina administrador</td>
                  <td>IRPF (mod. 130) + IVA (mod. 303) + IRPF cuenta ajena</td>
                </tr>
                <tr>
                  <td>Cotización SS</td>
                  <td>RETA según rendimientos netos reales</td>
                  <td>RETA como administrador (base obligatoria)</td>
                  <td>RETA + Régimen General; devolución exceso si supera tope</td>
                </tr>
                <tr>
                  <td>Complejidad administrativa</td>
                  <td>Baja-media</td>
                  <td>Alta (contabilidad mercantil, depósito cuentas)</td>
                  <td>Media (dos regímenes a gestionar)</td>
                </tr>
                <tr>
                  <td>Cuándo aplica</td>
                  <td>Actividad habitual por cuenta propia, persona física</td>
                  <td>Socio o administrador con &gt;25 % del capital social</td>
                  <td>Contrato laboral activo + actividad propia simultánea</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso: 4 perfiles reales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍💻</span>
                <h4>Joven de 30 años que deja su trabajo para negocio digital</h4>
              </div>
              <p className={styles.escenarioExample}>
                Pedro trabajaba por cuenta ajena y decide montar una agencia de marketing digital.
                Se da de alta el <strong>1 de marzo</strong>, solicita la tarifa plana de <strong>80 €/mes</strong> durante
                12 meses (y 12 meses más si su comunidad tiene extensión). Presenta el <strong>modelo 037</strong> en
                Hacienda el mismo día del alta en SS. Elige el epígrafe IAE <em>763 — Publicidad y RRPP</em>.
                Declara el domicilio fiscal en su vivienda habitual y emite facturas con IVA 21 %.
              </p>
              <p className={styles.escenarioTip}>
                💡 Al no tener empleados ni local arrendado, el modelo 037 es suficiente. Ahorra ~1.800 € en cuotas SS durante el primer año.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
                <h4>Profesional liberal (abogado, psicólogo) con consultas privadas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Laura trabaja en una empresa a jornada parcial y también atiende clientes privados.
                Su situación es de <strong>pluriactividad</strong>: cotiza en el Régimen General por su
                empleo y en el RETA por las consultas. Puede acogerse a una <strong>bonificación del 50 %
                en la cuota RETA durante el primer año</strong>. Tributa en IRPF por ambas fuentes de renta
                y presenta el 130 trimestralmente por los rendimientos de actividad.
              </p>
              <p className={styles.escenarioTip}>
                💡 Si la suma de bases de cotización supera el tope máximo anual, puede solicitar devolución del exceso a la SS.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h4>Persona en desempleo que crea su propia empresa</h4>
              </div>
              <p className={styles.escenarioExample}>
                Carlos cobra el paro y quiere emprender. Tiene dos opciones: <strong>compatibilizar</strong> el
                desempleo con el alta como autónomo (cobrando el 100 % de la prestación y pagando la cuota) o
                <strong> capitalizar</strong> el paro de golpe para financiar el negocio (al menos el 60 % de la
                prestación pendiente). Debe comunicar el alta al SEPE <strong>antes de iniciar la actividad</strong>.
                La tarifa plana es compatible con ambas modalidades.
              </p>
              <p className={styles.escenarioTip}>
                💡 La capitalización permite invertir hasta el 100 % si se crea una sociedad o se contrata a otra persona.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌍</span>
                <h4>Extranjero residente en España que quiere ser autónomo</h4>
              </div>
              <p className={styles.escenarioExample}>
                Ahmed tiene residencia legal en España y quiere trabajar por cuenta propia. Necesita:
                <strong> NIE</strong> (Número de Identificación de Extranjero) como identificador fiscal,
                <strong> NIF</strong> asignado por Hacienda al darse de alta, <strong>cuenta bancaria española</strong>
                (para domiciliar la cuota SS y recibir pagos), y en caso de no ser UE,
                <strong> autorización de trabajo por cuenta propia</strong> del Ministerio de Interior.
                El resto del proceso es idéntico al de cualquier ciudadano español.
              </p>
              <p className={styles.escenarioTip}>
                💡 Los ciudadanos de la UE no necesitan autorización de trabajo adicional; con el NIE es suficiente.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ adicionales (8 preguntas nuevas) ── */}
        <section className={styles.guideSection}>
          <h2>Más preguntas frecuentes</h2>
          <div className={styles.faqListPro}>
            <details className={styles.faqItemPro}>
              <summary>¿Cuándo es obligatorio darse de alta como autónomo?</summary>
              <p>
                El alta es obligatoria cuando existe <strong>habitualidad</strong> en la actividad económica.
                La jurisprudencia del Tribunal Supremo indica que se presume habitualidad cuando los ingresos
                suponen el <strong>Salario Mínimo Interprofesional (SMI)</strong> en cómputo anual (~15.876 € en 2025).
                Por debajo de ese umbral puede discutirse, pero Hacienda puede igualmente exigir el alta si detecta
                facturación recurrente. Ante la duda, consúltalo con un asesor.
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Puedo darme de alta y baja varias veces en el año?</summary>
              <p>
                Sí, pero con consecuencias. Desde 2023 se puede causar baja hasta <strong>3 veces al año</strong> en el
                RETA sin perder la tarifa plana (si el período entre alta y baja es suficiente). Sin embargo, altas
                y bajas frecuentes pueden llamar la atención de Hacienda, que podría iniciar un procedimiento para
                verificar que realmente cesó la actividad en cada baja. Guarda siempre documentación que acredite
                el cese (cierre de contratos, fin de facturación, etc.).
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Qué es la tarifa plana y cuáles son sus condiciones exactas?</summary>
              <p>
                La <strong>tarifa plana</strong> es una bonificación de la cuota RETA que la reduce a <strong>80 €/mes
                durante los primeros 12 meses</strong> (prorrogables otros 12 si los rendimientos netos siguen por debajo
                del SMI). Condiciones: (1) ser persona física (no societario); (2) no haber estado dado de alta en el
                RETA en los <strong>2 años anteriores</strong> (3 años si ya disfrutaste la tarifa plana antes);
                (3) solicitarla <strong>en el mismo momento del alta</strong>; (4) no tener deudas con SS ni Hacienda.
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿El alta tiene efectos desde el día que la solicito o desde el primero del mes?</summary>
              <p>
                Los efectos del alta en el RETA son desde el <strong>día en que se realiza la actividad</strong>,
                pero la cuota se paga por mes completo. Si te das de alta el día 15, pagas la cuota completa del mes.
                Por eso, conviene darse de alta <strong>el día 1 del mes</strong> para no pagar días sin actividad.
                El alta en Hacienda (modelo 036/037) debe presentarse <strong>antes del inicio de la actividad</strong>.
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Tengo que darme de alta en el IAE? ¿Cuánto cuesta?</summary>
              <p>
                El alta en el <strong>IAE (Impuesto de Actividades Económicas)</strong> se realiza automáticamente
                al presentar el modelo 036 o 037. Todos los autónomos están <strong>exentos de pago</strong> mientras
                su cifra de negocios no supere <strong>1.000.000 € anuales</strong>. El epígrafe IAE que elijas
                determina el tipo de IVA aplicable y las deducciones disponibles; es importante elegirlo correctamente
                desde el inicio, ya que cambiarlo requiere presentar una modificación censal.
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Qué diferencia hay entre el modelo 036 y el 037?</summary>
              <p>
                El <strong>modelo 037</strong> es la versión simplificada y solo está disponible para personas
                físicas que cumplan todos estos requisitos: residencia fiscal en España, sin empleados, sin local
                arrendado, sin actividades con IVA especial (recargo de equivalencia, régimen simplificado) y sin
                operaciones intracomunitarias. El <strong>modelo 036</strong> es la versión completa, obligatoria
                para el resto de casos y para sociedades. Si tienes dudas, el 036 siempre es válido; el 037 es
                solo una simplificación.
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Puedo usar mi domicilio como sede de la actividad?</summary>
              <p>
                Sí, es perfectamente legal y muy habitual. Basta con declararlo como domicilio fiscal y lugar de
                ejercicio de la actividad en el 036/037. Ventajas: puedes deducir parcialmente los gastos de
                suministros del hogar (luz, internet, teléfono) e incluso parte del alquiler, en proporción al
                porcentaje del inmueble dedicado a la actividad. Exige llevar un registro riguroso para justificar
                la deducción ante una posible inspección.
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Cuándo debo tener cuenta bancaria separada para la actividad?</summary>
              <p>
                No existe <strong>obligación legal</strong> de tener una cuenta bancaria separada para autónomos
                persona física (sí para sociedades). Sin embargo, Hacienda y los tribunales recomiendan encarecidamente
                separar las finanzas personales de las profesionales. Una cuenta separada simplifica enormemente la
                contabilidad, facilita la deducción de gastos y es fundamental en caso de inspección para demostrar
                que los movimientos bancarios corresponden a la actividad económica.
              </p>
            </details>
          </div>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Proceso de alta paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Alta en Hacienda — modelo 037 o 036</strong>
                <p>
                  Presenta el <strong>modelo 037</strong> si eres persona física sin empleados, sin local arrendado
                  y sin IVA especial. En cualquier otro caso, usa el <strong>modelo 036</strong>. Debe presentarse
                  <strong> antes de iniciar la actividad</strong>, idealmente el mismo día del alta en SS.
                  Puedes hacerlo online con certificado digital en la Sede Electrónica de la AEAT.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Alta en el RETA — Seguridad Social</strong>
                <p>
                  Trámite en la <strong>Sede Electrónica de la SS</strong> o en un Punto de Atención al Emprendedor
                  (PAE). Dispones de <strong>60 días naturales</strong> desde el inicio de la actividad para darte
                  de alta, aunque las cotizaciones se devengan desde el día 1. Aquí es donde solicitas la tarifa
                  plana si te corresponde.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Alta en el IAE (Impuesto Actividades Económicas)</strong>
                <p>
                  Incluida automáticamente en el modelo 036/037. Estás <strong>exento de pago</strong> si tu
                  facturación anual es inferior a 1.000.000 €. Elige bien el epígrafe: determina el tipo de IVA
                  que aplicas y las deducciones permitidas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Apertura de cuenta bancaria profesional</strong>
                <p>
                  No es obligatoria legalmente, pero <strong>muy recomendable</strong>. Separar las finanzas
                  personales de las profesionales simplifica la contabilidad, facilita deducciones ante Hacienda
                  y te protege en una posible inspección.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Registro de libros contables</strong>
                <p>
                  En estimación directa (normal o simplificada) estás obligado a llevar el
                  <strong> libro registro de facturas emitidas</strong> y el de <strong>facturas recibidas</strong>.
                  También el libro de bienes de inversión si adquieres activos. Puedes usar software de facturación
                  o una hoja de cálculo, siempre que esté actualizado y disponible ante requerimiento.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Contratar seguros obligatorios según sector</strong>
                <p>
                  Algunos sectores exigen <strong>seguro de Responsabilidad Civil</strong> (arquitectos, abogados,
                  sanitarios) o de accidentes para empleados (si los hay). Aunque no sea obligatorio en tu sector,
                  el seguro de RC es altamente recomendable para cubrir daños a terceros derivados de tu actividad.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Primera declaración trimestral</strong>
                <p>
                  En el trimestre correspondiente al inicio de la actividad presenta el <strong>modelo 303 (IVA)</strong>
                  y el <strong>modelo 130 (pago fraccionado IRPF)</strong>. Los plazos son: 1.º trimestre en abril,
                  2.º en julio, 3.º en octubre, 4.º en enero del año siguiente (20 días naturales tras el fin del
                  trimestre).
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>6 consejos para empezar con buen pie</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <div>
                <strong>Darte de alta el día 1 del mes</strong>
                <p>La cuota RETA se paga por mes completo. Darte de alta el día 2 supone pagar el mes entero sin haber cotizado el primer día. Planifica la fecha de alta siempre a principio de mes.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <div>
                <strong>Solicitar la tarifa plana el día del alta</strong>
                <p>La tarifa plana de 80 €/mes solo puede solicitarse en el momento del alta en el RETA. No se puede pedir retroactivamente. Si te olvidas, pierdes los 12 meses de bonificación.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <div>
                <strong>Elegir bien el epígrafe IAE</strong>
                <p>El epígrafe determina el tipo de IVA que aplicas (21 %, 10 %, exento) y las deducciones disponibles. Un epígrafe incorrecto puede obligarte a corregir facturas emitidas y generar regularizaciones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <div>
                <strong>Abrir cuenta bancaria separada desde el primer día</strong>
                <p>Aunque no es obligatorio, separar las finanzas personales de las profesionales simplifica enormemente la contabilidad y evita problemas en una eventual inspección de Hacienda.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📎</span>
              <div>
                <strong>Guardar el justificante de alta</strong>
                <p>Conserva el resguardo del modelo 036/037 y el certificado de alta en SS. Son la prueba oficial de cuándo iniciaste la actividad; necesarios para deducciones, subvenciones y posibles inspecciones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🗺️</span>
              <div>
                <strong>Informarte de las bonificaciones autonómicas</strong>
                <p>Algunas Comunidades Autónomas ofrecen hasta 6 meses adicionales de cuota cero o subvenciones directas al emprendimiento. Consulta la web de tu comunidad o un PAE antes de iniciar el alta.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box — Errores comunes ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>6 errores frecuentes que debes evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Empezar a facturar antes del alta:</strong> Hacienda puede detectar facturas emitidas
                antes de la fecha de alta censal y reclamar cuotas no ingresadas más sanciones económicas.
              </li>
              <li>
                <strong>No darse de baja cuando cesas la actividad:</strong> La SS sigue cobrando la cuota
                mensual mientras estés dado de alta, independientemente de si facturas o no. La baja debe
                tramitarse dentro del mes en que se cesa la actividad.
              </li>
              <li>
                <strong>Elegir mal el epígrafe IAE:</strong> Un epígrafe incorrecto puede obligarte a aplicar
                IVA cuando estabas exento (o viceversa), generando regularizaciones y posibles sanciones. Consulta
                con un asesor antes de elegirlo.
              </li>
              <li>
                <strong>Olvidar el alta en Hacienda antes del alta en SS:</strong> El alta en Hacienda (036/037)
                debe preceder al alta en RETA. Si el orden es inverso, Hacienda puede denegar deducciones del
                período anterior y cuestionar el inicio real de la actividad.
              </li>
              <li>
                <strong>No solicitar la tarifa plana en el momento del alta:</strong> Es el error más costoso.
                La tarifa plana solo puede obtenerse al tramitar el alta en el RETA. Perder esta bonificación
                supone pagar más de 1.500 € adicionales en el primer año.
              </li>
              <li>
                <strong>Ignorar el plazo de 60 días para el alta en SS:</strong> Aunque legalmente tienes 60 días
                naturales desde el inicio de la actividad, las cotizaciones se devengan desde el día 1. Un alta
                tardía genera recargo del 20 % más intereses de demora sobre las cuotas atrasadas.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('asistente-alta-autonomo')} />
      <ShareCard appName="asistente-alta-autonomo" />
      <Footer appName="asistente-alta-autonomo" />
    </div>
  );
}
