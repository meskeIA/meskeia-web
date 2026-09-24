'use client';

import { useState, useEffect } from 'react';
import styles from './AsistenteAltaAutonomo.module.css';
import { MeskeiaLogo, LegalNotice, Footer, NumberInput, RelatedApps, EducationalSection, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  TIPO_COTIZACION_RETA, TARIFA_PLANA_2025, BASES_RETA_2025, TRAMOS_RETA_2025, FISCAL_AUTONOMOS_META,
  TIPOS_IS_2025, TRAMOS_IS_MICROPYMES_2026, AUTONOMO_SOCIETARIO_2025, SMI_2026,
  CNAE_IAE_RUTA_CATALOGO, FISCAL_CNAE_IAE_META,
} from '@/data/fiscal';
import type { TramoCotizacion } from '@/data/fiscal';

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
  /**
   * Primera alta en el RETA (o sin alta en los dos años anteriores). Solo se pregunta en
   * pluriactividad: el art. 38 ter LETA no excluye a quien además trabaja por cuenta ajena.
   * Opcional porque los datos guardados antes del 24/09/2026 no lo traen.
   */
  primeraAltaPluriactividad?: boolean;
  /** Rendimientos netos mensuales previstos (texto tal cual lo escribe el usuario). */
  rendimientosNetos?: string;
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

// Bases de cotización 2026 (tramos por rendimientos reales — RDL 13/2022).
// Sin rendimientos, la «mínima» es la del tramo 1 (TRAMOS_RETA_2025[0]), que solo vale para
// rendimientos de hasta 670 €/mes; con rendimientos, cada base se acota a la horquilla de su
// tramo (calcularCuotaAutonomo).
const TRAMO_1 = TRAMOS_RETA_2025[0];
const BASES_COTIZACION = {
  minima: { base: BASES_RETA_2025.minima, descripcion: 'Base mínima de tu tramo', sinTramo: 'Base mínima (tramo 1)' },
  media: { base: 1200, descripcion: 'Base intermedia', sinTramo: 'Base intermedia' },
  maxima: { base: BASES_RETA_2025.maxima, descripcion: 'Base máxima de tu tramo', sinTramo: 'Base máxima' },
};

/**
 * Tramo de la tabla de 2026 que corresponde a unos rendimientos netos mensuales.
 * Los límites son «hasta X €» (tramo 1: ≤ 670; tramo 2: > 670 y ≤ 900…), así que manda
 * el primer tramo cuyo rendimientoMax no se supera.
 */
function tramoPorRendimientos(rendimientos: number): TramoCotizacion {
  const encontrado = TRAMOS_RETA_2025.find(t => t.rendimientoMax === null || rendimientos <= t.rendimientoMax);
  return encontrado ?? TRAMOS_RETA_2025[TRAMOS_RETA_2025.length - 1];
}

const acotar = (valor: number, min: number, max: number) => Math.min(Math.max(valor, min), max);

// Formato de las cifras normativas en la prosa: «80 €», «17.094 €», «515 €»
const euros = (valor: number) => `${formatNumber(valor, 0)} €`;

// Tipo cotización autónomo 2026 (31,50% — RDL 16/2025)
const TIPO_COTIZACION = TIPO_COTIZACION_RETA;

// Tarifa plana 2026 (art. 38 ter Ley 20/2007): 12 meses, prorrogables otros 12 si los
// rendimientos netos anuales no llegan al SMI
const TARIFA_PLANA = {
  importe: TARIFA_PLANA_2025.cuota,
  duracion: TARIFA_PLANA_2025.duracion,
  ampliacion: { importe: TARIFA_PLANA_2025.cuota, duracion: TARIFA_PLANA_2025.duracion, condicion: 'rendimientos < SMI' },
};
const TARIFA_PLANA_TXT = euros(TARIFA_PLANA.importe);
// Cuota mínima del tramo 1 y ahorro de la tarifa plana frente a ella, para los ejemplos
const CUOTA_MINIMA_TRAMO_1 = TRAMO_1.baseMinima * TIPO_COTIZACION_RETA;
const AHORRO_TARIFA_PLANA_TRAMO_1 = (CUOTA_MINIMA_TRAMO_1 - TARIFA_PLANA.importe) * TARIFA_PLANA.duracion;

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
    descripcion: 'Antes de empezar la actividad: se solicita como máximo con 60 días naturales de antelación a su inicio (art. 32.3 RD 84/1996), después del alta en Hacienda. Se hace en la Sede Electrónica de la Seguridad Social.',
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
    descripcion: `${TARIFA_PLANA_TXT}/mes durante ${TARIFA_PLANA.duracion} meses si es tu primera alta o no has sido autónomo en los últimos 2 años (3 si ya la disfrutaste). Prorrogable otros ${TARIFA_PLANA.ampliacion.duracion} meses si tus rendimientos netos siguen por debajo del SMI. Se pide al darte de alta.`,
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

// Epígrafes IAE frecuentes en un alta de autónomo: aquí solo se elige QUÉ códigos ofrecer.
// El literal de cada uno NO se escribe a mano: sale del catálogo oficial de las Tarifas del
// IAE (RDL 1175/1990) que publica data/fiscal/cnae-iae.ts, porque la app lo copia a la
// descripción de la actividad y quien lo pasa al 036/037 declararía otra cosa (hallazgo 1370:
// 6 de 19 etiquetas escritas a mano no eran las de la Tarifa). El mismo número puede ser una
// actividad distinta en cada sección (841 es «Servicios jurídicos» en la 1.ª y «Naturópatas…»
// en la 2.ª), por eso cada referencia lleva su sección.
type SeccionIaeRef = '1ª' | '2ª' | '3ª';
const EPIGRAFES_COMUNES: { seccion: SeccionIaeRef; codigo: string }[] = [
  { seccion: '2ª', codigo: '731' },   // abogacía
  { seccion: '2ª', codigo: '741' },   // economistas
  { seccion: '1ª', codigo: '842' },   // servicios financieros y contables
  { seccion: '1ª', codigo: '843.1' }, // ingeniería
  { seccion: '1ª', codigo: '843.2' }, // arquitectura
  { seccion: '2ª', codigo: '751' },   // publicidad y RRPP (profesional)
  { seccion: '2ª', codigo: '774' },   // traducción
  { seccion: '2ª', codigo: '763' },   // programación
  { seccion: '2ª', codigo: '776' },   // psicología
  { seccion: '2ª', codigo: '832' },   // medicina especializada
  { seccion: '2ª', codigo: '836' },   // fisioterapia
  { seccion: '2ª', codigo: '826' },   // enseñanza
  { seccion: '2ª', codigo: '511' },   // agentes comerciales
  { seccion: '2ª', codigo: '861' },   // artes plásticas
  { seccion: '2ª', codigo: '899' },   // otros profesionales
  { seccion: '1ª', codigo: '651.2' }, // comercio de ropa
  { seccion: '1ª', codigo: '659.9' }, // otro comercio al por menor
  { seccion: '1ª', codigo: '673.2' }, // cafés y bares
  { seccion: '1ª', codigo: '721.2' }, // taxi
  { seccion: '1ª', codigo: '722' },   // transporte de mercancías
];

interface EpigrafeCatalogo { seccion: string; codigo: string; tipo: string; titulo: string }
interface EpigrafeResuelto { seccion: SeccionIaeRef; codigo: string; titulo: string }

/** El catálogo trae algún epígrafe en minúscula inicial («otros cafés y bares»). */
const conMayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

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
  const [epigrafes, setEpigrafes] = useState<EpigrafeResuelto[] | null>(null);
  const [errorEpigrafes, setErrorEpigrafes] = useState(false);
  // Sección del epígrafe elegido en la lista (1.ª empresarial, 2.ª profesional…), solo informativa
  const [seccionElegida, setSeccionElegida] = useState<SeccionIaeRef | null>(null);

  // El catálogo IAE (~315 KB) solo se descarga la primera vez que se abre la lista
  useEffect(() => {
    if (!mostrarEpigrafes || epigrafes !== null) return;
    let cancelado = false;
    fetch(CNAE_IAE_RUTA_CATALOGO)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ iae: EpigrafeCatalogo[] }>;
      })
      .then(catalogo => {
        if (cancelado) return;
        const resueltos: EpigrafeResuelto[] = [];
        for (const ref of EPIGRAFES_COMUNES) {
          const entrada = catalogo.iae.find(e => e.seccion === ref.seccion && e.codigo === ref.codigo);
          if (entrada) resueltos.push({ ...ref, titulo: conMayuscula(entrada.titulo) });
        }
        setEpigrafes(resueltos);
        setErrorEpigrafes(false);
      })
      .catch(() => {
        if (!cancelado) setErrorEpigrafes(true);
      });
    return () => { cancelado = true; };
  }, [mostrarEpigrafes, epigrafes]);

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

  const seleccionarEpigrafe = (ep: EpigrafeResuelto) => {
    actualizarDato('epigrafeIAE', ep.codigo);
    actualizarDato('descripcionActividad', ep.titulo);
    setSeccionElegida(ep.seccion);
    setMostrarEpigrafes(false);
  };

  const reiniciarTodo = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.removeItem(STORAGE_KEY);
      setSeccionElegida(null);
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

  // Rendimientos netos mensuales → tramo de la tabla de 2026. Vacío o no numérico: sin tramo.
  const rendimientosNum = parseSpanishNumber(datos.rendimientosNetos ?? '');
  const tramo: TramoCotizacion | null = Number.isFinite(rendimientosNum)
    ? tramoPorRendimientos(rendimientosNum)
    : null;
  // Horquilla de bases que se puede elegir: la del tramo, o la general si no hay rendimientos
  const baseMin = tramo ? tramo.baseMinima : BASES_RETA_2025.minima;
  const baseMax = tramo ? tramo.baseMaxima : BASES_RETA_2025.maxima;
  const baseDeOpcion = (clave: keyof typeof BASES_COTIZACION) =>
    clave === 'minima' ? baseMin : clave === 'maxima' ? baseMax : acotar(BASES_COTIZACION.media.base, baseMin, baseMax);

  const calcularCuotaAutonomo = () => {
    let base: number;
    if (datos.baseElegida === 'personalizada') {
      // Se acota también con el foco puesto: una base fuera de la horquilla no existe, y sin
      // acotar la app publicaba cuotas negativas hasta el blur (hallazgo 1375)
      const escrita = parseSpanishNumber(datos.basePersonalizada);
      base = Number.isFinite(escrita) ? acotar(escrita, baseMin, baseMax) : baseMin;
    } else {
      base = baseDeOpcion(datos.baseElegida);
    }

    const cuotaNormal = base * TIPO_COTIZACION;
    // Art. 38 ter Ley 20/2007: la tarifa plana es para quien causa alta inicial (o sin alta en
    // los 2 años anteriores), también en pluriactividad (hallazgo 1371)
    const puedesTarifaPlana = datos.situacionLaboral === 'nueva_alta'
      || (datos.situacionLaboral === 'pluriactividad' && datos.primeraAltaPluriactividad !== false);

    return {
      base,
      cuotaNormal,
      tarifaPlana: puedesTarifaPlana ? TARIFA_PLANA.importe : null,
      ahorroPrimerAno: puedesTarifaPlana ? (cuotaNormal - TARIFA_PLANA.importe) * TARIFA_PLANA.duracion : 0,
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
        <span className={styles.heroIcon} aria-hidden="true">💼</span>
        <h1 className={styles.title}>Asistente Alta Autónomo</h1>
        <p className={styles.subtitle}>
          Guía completa para darte de alta como trabajador autónomo en España.
          Checklist interactivo con todos los trámites y calculadora de cuota.
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

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
          <span className={styles.infoIcon} aria-hidden="true">💰</span>
          <div className={styles.infoTexto}>
            <span className={styles.infoValor}>{formatCurrency(TARIFA_PLANA.importe)}/mes</span>
            <span className={styles.infoLabel}>Tarifa plana ({TARIFA_PLANA.duracion} meses)</span>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden="true">📅</span>
          <div className={styles.infoTexto}>
            <span className={styles.infoValor}>Antes de empezar</span>
            <span className={styles.infoLabel}>Alta RETA: hasta 60 días antes del inicio</span>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden="true">📝</span>
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
          type="button"
          aria-pressed={pestanaActiva === 'checklist'}
          className={`${styles.pestana} ${pestanaActiva === 'checklist' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('checklist')}
        >
          <span aria-hidden="true">✅</span> Checklist
        </button>
        <button
          type="button"
          aria-pressed={pestanaActiva === 'datos'}
          className={`${styles.pestana} ${pestanaActiva === 'datos' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('datos')}
        >
          <span aria-hidden="true">📝</span> Mis Datos
        </button>
        <button
          type="button"
          aria-pressed={pestanaActiva === 'costes'}
          className={`${styles.pestana} ${pestanaActiva === 'costes' ? styles.pestanaActiva : ''}`}
          onClick={() => setPestanaActiva('costes')}
        >
          <span aria-hidden="true">💰</span> Cuota y Costes
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
                    type="button"
                    aria-expanded={expandida}
                    className={`${styles.faseHeader} ${expandida ? styles.faseHeaderExpandida : ''}`}
                    onClick={() => setFaseExpandida(expandida ? null : fase.numero)}
                  >
                    <div className={styles.faseInfo}>
                      <span className={styles.faseIcono} aria-hidden="true">{fase.icono}</span>
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
                      <span className={styles.faseExpandir} aria-hidden="true">{expandida ? '▼' : '▶'}</span>
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
                              <span aria-hidden="true">🔗</span> {item.enlaceUtil.texto}
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
                <span aria-hidden="true">👤</span> Datos Personales
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
                <span aria-hidden="true">📍</span> Domicilio Fiscal
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
                <span aria-hidden="true">💼</span> Actividad Económica
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
                      onChange={e => { actualizarDato('epigrafeIAE', e.target.value); setSeccionElegida(null); }}
                      placeholder="Ej: 763"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarEpigrafes(!mostrarEpigrafes)}
                      className={styles.btnBuscarEpigrafe}
                      aria-label={mostrarEpigrafes ? 'Cerrar la lista de epígrafes' : 'Ver epígrafes IAE frecuentes'}
                      aria-expanded={mostrarEpigrafes}
                    >
                      {mostrarEpigrafes ? '✕' : '🔍'}
                    </button>
                  </div>
                  {seccionElegida && (
                    <span className={styles.epigrafeSeccion}>
                      Sección {seccionElegida} de las Tarifas del IAE
                    </span>
                  )}
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
                    <p className={styles.listaEpigrafesInfo}>
                      Epígrafes frecuentes con su literal oficial ({FISCAL_CNAE_IAE_META.iae.fuente}).
                      Pulsa para seleccionar; si ninguno encaja, busca el tuyo en el{' '}
                      <a href="/conversor-cnae-iae/">buscador de CNAE e IAE</a>.
                    </p>
                    {errorEpigrafes && (
                      <p className={styles.listaEpigrafesInfo} role="alert">
                        No se ha podido cargar el catálogo oficial de epígrafes. Vuelve a abrir la lista o usa el buscador.
                      </p>
                    )}
                    {!errorEpigrafes && epigrafes === null && (
                      <p className={styles.listaEpigrafesInfo} aria-live="polite">Cargando el catálogo oficial…</p>
                    )}
                    {epigrafes?.map(ep => (
                      <button
                        type="button"
                        key={`${ep.seccion}-${ep.codigo}`}
                        className={styles.epigrafeItem}
                        data-seccion={ep.seccion}
                        onClick={() => seleccionarEpigrafe(ep)}
                      >
                        <span className={styles.epigrafeCodigo}>{ep.codigo}</span>
                        <span className={styles.epigrafeDesc}>
                          {ep.titulo} <span className={styles.epigrafeSeccion}>· sección {ep.seccion}</span>
                        </span>
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
                <span aria-hidden="true">📋</span> Situación Laboral
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

              {datos.situacionLaboral === 'pluriactividad' && (
                <label className={styles.opcionCheck}>
                  <input
                    type="checkbox"
                    checked={datos.primeraAltaPluriactividad !== false}
                    onChange={e => actualizarDato('primeraAltaPluriactividad', e.target.checked)}
                  />
                  <span>Es mi primera alta como autónomo (o no he estado de alta en los 2 últimos años; 3 si ya disfruté la tarifa plana)</span>
                </label>
              )}

              {cuotaInfo.tarifaPlana !== null && (
                <div className={styles.infoTarifaPlana}>
                  <span aria-hidden="true">✅</span> <strong>¡Puedes solicitar la tarifa plana!</strong> {TARIFA_PLANA_TXT}/mes durante {TARIFA_PLANA.duracion} meses
                  {datos.situacionLaboral === 'pluriactividad' && ', también en pluriactividad (art. 38 ter de la Ley 20/2007)'}.
                </div>
              )}

              {datos.situacionLaboral === 'pluriactividad' && (
                <div className={styles.infoPluriactividad}>
                  <span aria-hidden="true">ℹ️</span> En pluriactividad no hay una reducción propia de la cuota (la del 50 % desapareció en 2023), pero si lo que cotizas por contingencias comunes en los dos regímenes supera el umbral que fija cada año la Ley de Presupuestos, la Seguridad Social te devuelve el 50 % del exceso (art. 313 LGSS).
                </div>
              )}

              {datos.situacionLaboral === 'colaborador_familiar' && (
                <div className={styles.infoPluriactividad}>
                  <span aria-hidden="true">ℹ️</span> Como familiar colaborador no tienes la tarifa plana (art. 38 ter.11 de la Ley 20/2007), pero sí una bonificación de la cuota por contingencias comunes de la base mínima del tramo 1: del 50 % durante 18 meses y del 25 % los 6 siguientes, si no has estado de alta en el RETA en los 5 años anteriores (art. 35). Esta herramienta no la descuenta de la cuota que calcula.
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className={styles.datosAcciones}>
              <button type="button" onClick={reiniciarTodo} className={styles.btnSecundario}>
                <span aria-hidden="true">🗑️</span> Reiniciar todo
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
                <span aria-hidden="true">🧮</span> Calculadora de Cuota Autónomo
              </h3>

              <div className={styles.basesCotizacion}>
                <p className={styles.basesInfo}>
                  Desde 2023 la cuota se calcula según tus rendimientos netos previstos: te sitúan en
                  uno de los {TRAMOS_RETA_2025.length} tramos de la tabla de 2026, y dentro de su horquilla eliges la base.
                </p>

                <NumberInput
                  label="Rendimientos netos mensuales previstos"
                  value={datos.rendimientosNetos ?? ''}
                  onChange={val => actualizarDato('rendimientosNetos', val)}
                  placeholder="Ej: 1.600"
                  min={0}
                  suffix="€/mes"
                  helperText="Ingresos de la actividad menos gastos deducibles, en media mensual."
                />

                <p className={styles.basesInfo} aria-live="polite">
                  {tramo ? (
                    <>
                      <strong>Tramo {tramo.id}</strong>
                      {tramo.rendimientoMax === null
                        ? ` (rendimientos de más de ${formatCurrency(tramo.rendimientoMin)}/mes)`
                        : ` (rendimientos de ${tramo.id === 1 ? 'hasta' : `más de ${formatCurrency(tramo.rendimientoMin)} y hasta`} ${formatCurrency(tramo.rendimientoMax)}/mes)`}
                      : base entre {formatCurrency(tramo.baseMinima)} y {formatCurrency(tramo.baseMaxima)}.
                    </>
                  ) : (
                    <>
                      Sin rendimientos, la base mínima es la del tramo 1 ({formatCurrency(TRAMO_1.baseMinima)}), que
                      solo corresponde a rendimientos de hasta {formatCurrency(TRAMO_1.rendimientoMax ?? 0)}/mes. Con
                      más rendimientos la base mínima sube: indícalos arriba.
                    </>
                  )}
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
                        <span className={styles.baseOpcionValor}>{formatCurrency(baseDeOpcion(key))}</span>
                        <span className={styles.baseOpcionDesc}>{tramo ? info.descripcion : info.sinTramo}</span>
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
                          min={baseMin}
                          max={baseMax}
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
                      <span><span aria-hidden="true">🎉</span> Con tarifa plana ({TARIFA_PLANA.duracion} meses)</span>
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
                <span aria-hidden="true">📊</span> Costes Anuales Estimados
              </h3>

              <div className={styles.costesDesglose}>
                <div className={styles.costeItem}>
                  <div className={styles.costeNombre}>
                    <span aria-hidden="true">🛡️</span> Cuota autónomo (anual)
                  </div>
                  <div className={styles.costeValor}>{formatCurrency(costes.cuotaAnual)}</div>
                </div>

                <div className={styles.costeItem}>
                  <div className={styles.costeNombre}>
                    <span aria-hidden="true">👔</span> Gestoría (opcional)
                  </div>
                  <div className={styles.costeValor}>
                    {formatCurrency(costes.gestoriaAnualMin)} - {formatCurrency(costes.gestoriaAnualMax)}
                  </div>
                </div>

                <div className={styles.costeItem}>
                  <div className={styles.costeNombre}>
                    <span aria-hidden="true">🔒</span> Seguro Resp. Civil (recomendado)
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
                <span aria-hidden="true">⚖️</span> ¿Autónomo o Sociedad Limitada?
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
                      <td>Desde 1 € (art. 4 Ley de Sociedades de Capital); por debajo de 3.000 €, reserva legal reforzada</td>
                    </tr>
                    <tr>
                      <td>Responsabilidad</td>
                      <td className={styles.desventaja}>Ilimitada (patrimonio personal)</td>
                      <td className={styles.ventaja}>Limitada al capital</td>
                    </tr>
                    <tr>
                      <td>Fiscalidad</td>
                      <td>IRPF progresivo (19-47%, efectivo bajo en ingresos pequeños-medios)</td>
                      <td>
                        Impuesto sobre Sociedades: {TIPOS_IS_2025.general} % general;
                        con cifra de negocio inferior a 1 millón de euros, {TRAMOS_IS_MICROPYMES_2026[0].tipo} % hasta{' '}
                        {euros(TRAMOS_IS_MICROPYMES_2026[0].hasta)} de base y {TRAMOS_IS_MICROPYMES_2026[1].tipo} % en el resto (2026);
                        {' '}{TIPOS_IS_2025.nuevaCreacion} % los dos primeros ejercicios con beneficio si es de nueva creación
                      </td>
                    </tr>
                    <tr>
                      <td>Cuota Seg. Social</td>
                      <td>Desde {TARIFA_PLANA_TXT}/mes (tarifa plana)</td>
                      <td>~{euros(AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual)}/mes (base mínima del autónomo societario)</td>
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
                <strong><span aria-hidden="true">💡</span> Recomendación general:</strong> Empieza como autónomo si facturas menos de 40.000-50.000€/año.
                Cuando superes esa cifra o necesites limitar responsabilidad, valora constituir una SL.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3><span aria-hidden="true">⚠️</span> Herramienta de Orientación — No es asesoramiento profesional</h3>
        <p>
          Esta herramienta proporciona información <strong>orientativa y educativa</strong> sobre el proceso de alta como autónomo en España.
          <strong> No constituye asesoramiento legal ni fiscal</strong>. Los requisitos, cuotas y procedimientos pueden variar
          según tu situación personal y cambios normativos. Datos orientativos para 2026, verificados en base al{' '}
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
              <h4><span aria-hidden="true">📅</span> Trimestrales</h4>
              <ul>
                <li><strong>Modelo 303</strong>: Declaración IVA</li>
                <li><strong>Modelo 130</strong>: Pago fraccionado IRPF (estimación directa)</li>
                <li><strong>Modelo 111</strong>: Retenciones (si tienes empleados)</li>
                <li><strong>Modelo 115</strong>: Retenciones alquiler (si alquilas local)</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📆</span> Anuales</h4>
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
                  <td>Desde ~{euros(CUOTA_MINIMA_TRAMO_1)}/mes (rendimientos bajos)</td>
                  <td>~{euros(AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual)}/mes (base mínima RETA admin., obligatoria)</td>
                  <td>Sin reducción propia; reintegro del 50 % del exceso de cotización (art. 313 LGSS)</td>
                </tr>
                <tr>
                  <td>Tarifa plana {TARIFA_PLANA_TXT}</td>
                  <td><span aria-hidden="true">✅</span> Sí (primeras altas o sin alta en 2 años)</td>
                  <td><span aria-hidden="true">✅</span> Sí, en las mismas condiciones (art. 38 ter.9 Ley 20/2007)</td>
                  <td><span aria-hidden="true">✅</span> Sí si es primera alta como autónomo</td>
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
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍💻</span>
                <h4>Joven de 30 años que deja su trabajo para negocio digital</h4>
              </div>
              <p className={styles.escenarioExample}>
                Pedro trabajaba por cuenta ajena y decide montar una agencia de marketing digital.
                Se da de alta el <strong>1 de marzo</strong>, solicita la tarifa plana de <strong>{TARIFA_PLANA_TXT}/mes</strong> durante
                {TARIFA_PLANA.duracion} meses (y {TARIFA_PLANA.ampliacion.duracion} meses más si sus rendimientos netos siguen por debajo del SMI). Presenta el <strong>modelo 037</strong> en
                Hacienda antes que el alta en SS, y las dos antes de empezar. Elige el epígrafe IAE <em>751 de la sección 2.ª — Profesionales de la Publicidad, relaciones públicas y similares</em>.
                Declara el domicilio fiscal en su vivienda habitual y emite facturas con IVA 21 %.
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Al no tener empleados ni local arrendado, el modelo 037 es suficiente. Si sus rendimientos no pasan de {euros(TRAMO_1.rendimientoMax ?? 0)}/mes, ahorra ~{euros(AHORRO_TARIFA_PLANA_TRAMO_1)} en cuotas SS durante el primer año (cuota mínima del tramo 1 ~{euros(CUOTA_MINIMA_TRAMO_1)}/mes − tarifa plana {TARIFA_PLANA_TXT}/mes, ×{TARIFA_PLANA.duracion}); con más rendimientos, más.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚖️</span>
                <h4>Profesional liberal (abogado, psicólogo) con consultas privadas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Laura trabaja en una empresa a jornada parcial y también atiende clientes privados.
                Su situación es de <strong>pluriactividad</strong>: cotiza en el Régimen General por su
                empleo y en el RETA por las consultas. Si es su primera alta como autónoma, tiene la <strong>tarifa plana también en
                pluriactividad</strong>; la bonificación del 50 % que existía para este caso desapareció en 2023. Tributa en IRPF por ambas fuentes de renta
                y presenta el 130 trimestralmente por los rendimientos de actividad.
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Si lo que cotiza por contingencias comunes en los dos regímenes supera el umbral que fija cada año la Ley de Presupuestos, la Seguridad Social le devuelve el 50 % del exceso (art. 313 LGSS).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
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
                <span aria-hidden="true">💡</span> La capitalización permite invertir hasta el 100 % si se crea una sociedad o se contrata a otra persona.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
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
                <span aria-hidden="true">💡</span> Los ciudadanos de la UE no necesitan autorización de trabajo adicional; con el NIE es suficiente.
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
                suponen el <strong>Salario Mínimo Interprofesional (SMI)</strong> en cómputo anual ({euros(SMI_2026.anual)} en 2026).
                Por debajo de ese umbral puede discutirse, pero Hacienda puede igualmente exigir el alta si detecta
                facturación recurrente. Ante la duda, consúltalo con un asesor.
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Puedo darme de alta y baja varias veces en el año?</summary>
              <p>
                Sí, pero con consecuencias. Una baja en el RETA mientras disfrutas de la tarifa plana{' '}
                <strong>la extingue</strong> (art. 38 ter.4 de la Ley 20/2007), y para volver a pedirla necesitas
                3 años sin alta. Además, altas
                y bajas frecuentes pueden llamar la atención de Hacienda, que podría iniciar un procedimiento para
                verificar que realmente cesó la actividad en cada baja. Guarda siempre documentación que acredite
                el cese (cierre de contratos, fin de facturación, etc.).
              </p>
            </details>
            <details className={styles.faqItemPro}>
              <summary>¿Qué es la tarifa plana y cuáles son sus condiciones exactas?</summary>
              <p>
                La <strong>tarifa plana</strong> es una cuota reducida del RETA de <strong>{TARIFA_PLANA_TXT}/mes
                durante los primeros {TARIFA_PLANA.duracion} meses</strong> (prorrogables otros {TARIFA_PLANA.ampliacion.duracion} si los rendimientos netos siguen por debajo
                del SMI, {euros(SMI_2026.anual)} anuales en 2026). Condiciones (art. 38 ter de la Ley 20/2007): (1) alta inicial o no haber estado
                de alta en el RETA en los <strong>2 años anteriores</strong> (3 años si ya disfrutaste la tarifa plana antes);
                (2) solicitarla <strong>en el mismo momento del alta</strong>. Alcanza también a los socios de sociedades
                de capital encuadrados en el RETA y a quien está en pluriactividad.
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
                al presentar el modelo 036 o 037. Las personas físicas están <strong>exentas de pago</strong> sea cual sea su
                cifra de negocios (el límite de 1.000.000 € es para las sociedades; art. 82.1.c del TRLRHL). El epígrafe IAE que elijas
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
                  (PAE). Se solicita <strong>antes de iniciar la actividad</strong>, como máximo con{' '}
                  <strong>60 días naturales de antelación</strong> (art. 32.3 del RD 84/1996), y surte efectos desde
                  la fecha de inicio que indiques. Aquí es donde solicitas la tarifa plana si te corresponde.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Alta en el IAE (Impuesto Actividades Económicas)</strong>
                <p>
                  Incluida automáticamente en el modelo 036/037. Como persona física estás <strong>exento de pago</strong> sea cual sea
                  tu facturación (art. 82.1.c del TRLRHL). Elige bien el epígrafe: determina el tipo de IVA
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
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <div>
                <strong>Darte de alta el día 1 del mes</strong>
                <p>La cuota RETA se paga por mes completo. Darte de alta el día 2 supone pagar el mes entero sin haber cotizado el primer día. Planifica la fecha de alta siempre a principio de mes.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Solicitar la tarifa plana el día del alta</strong>
                <p>La tarifa plana de {TARIFA_PLANA_TXT}/mes solo puede solicitarse en el momento del alta en el RETA. No se puede pedir retroactivamente. Si te olvidas, pierdes los {TARIFA_PLANA.duracion} meses de cuota reducida.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <div>
                <strong>Elegir bien el epígrafe IAE</strong>
                <p>El epígrafe determina el tipo de IVA que aplicas (21 %, 10 %, exento) y las deducciones disponibles. Un epígrafe incorrecto puede obligarte a corregir facturas emitidas y generar regularizaciones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏦</span>
              <div>
                <strong>Abrir cuenta bancaria separada desde el primer día</strong>
                <p>Aunque no es obligatorio, separar las finanzas personales de las profesionales simplifica enormemente la contabilidad y evita problemas en una eventual inspección de Hacienda.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📎</span>
              <div>
                <strong>Guardar el justificante de alta</strong>
                <p>Conserva el resguardo del modelo 036/037 y el certificado de alta en SS. Son la prueba oficial de cuándo iniciaste la actividad; necesarios para deducciones, subvenciones y posibles inspecciones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
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
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
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
                supone pagar al menos {euros(AHORRO_TARIFA_PLANA_TRAMO_1)} más en el primer año.
              </li>
              <li>
                <strong>Darse de alta en la SS después de empezar:</strong> el alta en el RETA se pide antes del
                inicio de la actividad (como máximo 60 días naturales antes, art. 32.3 del RD 84/1996). Un alta
                tardía hace que se reclamen las cuotas atrasadas con recargo e intereses.
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
