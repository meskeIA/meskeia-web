'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './OrientacionHerencias.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, DisclaimerCard } from '@/components';
import Link from 'next/link';
import { getRelatedApps } from '@/data/app-relations';

// ===== TIPOS =====
interface Respuestas {
  testamento: 'si' | 'no' | 'nose' | '';
  inmuebles: 'si' | 'no' | '';
  cuentas: 'si' | 'no' | '';
  vehiculos: 'si' | 'no' | '';
  deudas: 'si' | 'no' | '';
  herederos: '1' | '2-3' | '4+' | '';
  menores: 'si' | 'no' | '';
}

interface ItemChecklist {
  id: string;
  texto: string;
  categoria: string;
  condicion: (r: Respuestas) => boolean;
  ayuda?: string;
  donde?: string;
}

// ===== DEFINICIÓN DEL CHECKLIST =====
const CHECKLIST_ITEMS: ItemChecklist[] = [
  // Documentos básicos (siempre)
  { id: 'cert-defuncion', texto: 'Certificado de defunción', categoria: 'basicos', condicion: () => true, ayuda: 'Documento oficial que acredita el fallecimiento', donde: 'Registro Civil o sede electrónica del Ministerio de Justicia' },
  { id: 'cert-voluntades', texto: 'Certificado de últimas voluntades', categoria: 'basicos', condicion: () => true, ayuda: 'Indica si existe testamento y ante qué notario', donde: 'Ministerio de Justicia (esperar 15 días hábiles tras fallecimiento)' },
  { id: 'cert-seguros', texto: 'Certificado de contratos de seguro de cobertura de fallecimiento', categoria: 'basicos', condicion: () => true, ayuda: 'Indica si hay seguros de vida a favor de beneficiarios', donde: 'Ministerio de Justicia (mismo trámite que últimas voluntades)' },
  { id: 'dni-fallecido', texto: 'DNI del fallecido (original o copia)', categoria: 'basicos', condicion: () => true, ayuda: 'Necesario para todas las gestiones', donde: 'Documentación personal del fallecido' },
  { id: 'libro-familia', texto: 'Libro de familia', categoria: 'basicos', condicion: () => true, ayuda: 'Acredita parentesco entre herederos y fallecido', donde: 'Documentación personal del fallecido' },

  // Si hay testamento
  { id: 'copia-testamento', texto: 'Copia autorizada del testamento', categoria: 'testamento', condicion: (r) => r.testamento === 'si', ayuda: 'Copia oficial del testamento con validez legal', donde: 'Notaría donde se otorgó (indicado en certificado de últimas voluntades)' },

  // Si NO hay testamento
  { id: 'cert-nacimiento', texto: 'Certificado de nacimiento de herederos', categoria: 'sin-testamento', condicion: (r) => r.testamento === 'no', ayuda: 'Acredita la filiación de los herederos', donde: 'Registro Civil del lugar de nacimiento' },
  { id: 'cert-matrimonio', texto: 'Certificado de matrimonio (si hay cónyuge)', categoria: 'sin-testamento', condicion: (r) => r.testamento === 'no', ayuda: 'Acredita el vínculo matrimonial', donde: 'Registro Civil donde se celebró el matrimonio' },
  { id: 'acta-herederos', texto: 'Acta de declaración de herederos abintestato', categoria: 'sin-testamento', condicion: (r) => r.testamento === 'no', ayuda: 'Documento notarial que declara quiénes son los herederos legales', donde: 'Notaría (requiere dos testigos que conocieran al fallecido)' },

  // Si hay inmuebles
  { id: 'escrituras', texto: 'Escrituras de propiedad de inmuebles', categoria: 'inmuebles', condicion: (r) => r.inmuebles === 'si', ayuda: 'Documentos de propiedad de cada inmueble', donde: 'Documentación del fallecido o nota simple en Registro de la Propiedad' },
  { id: 'recibo-ibi', texto: 'Último recibo del IBI (referencia catastral)', categoria: 'inmuebles', condicion: (r) => r.inmuebles === 'si', ayuda: 'Contiene la referencia catastral necesaria', donde: 'Documentación del fallecido o Ayuntamiento' },
  { id: 'cert-comunidad', texto: 'Certificado de estar al corriente con la comunidad de propietarios', categoria: 'inmuebles', condicion: (r) => r.inmuebles === 'si', ayuda: 'Acredita que no hay deudas con la comunidad', donde: 'Administrador de la finca' },
  { id: 'nota-simple', texto: 'Nota simple del Registro de la Propiedad', categoria: 'inmuebles', condicion: (r) => r.inmuebles === 'si', ayuda: 'Confirma titularidad y cargas del inmueble', donde: 'Registro de la Propiedad (online o presencial)' },

  // Si hay cuentas bancarias
  { id: 'cert-saldo', texto: 'Certificado de saldo a fecha de fallecimiento', categoria: 'cuentas', condicion: (r) => r.cuentas === 'si', ayuda: 'Documento del banco con el saldo exacto a la fecha del fallecimiento', donde: 'Banco/entidad financiera (presentar certificado de defunción)' },
  { id: 'extractos', texto: 'Extractos de cuentas y tarjetas', categoria: 'cuentas', condicion: (r) => r.cuentas === 'si', ayuda: 'Movimientos recientes para valorar activos', donde: 'Banco/entidad financiera' },
  { id: 'titularidad-cuentas', texto: 'Certificado de titularidad de cuentas', categoria: 'cuentas', condicion: (r) => r.cuentas === 'si', ayuda: 'Lista de todas las cuentas a nombre del fallecido', donde: 'Banco/entidad financiera' },

  // Si hay vehículos
  { id: 'permiso-circulacion', texto: 'Permiso de circulación', categoria: 'vehiculos', condicion: (r) => r.vehiculos === 'si', ayuda: 'Documento de titularidad del vehículo', donde: 'Documentación del fallecido' },
  { id: 'ficha-tecnica', texto: 'Ficha técnica del vehículo', categoria: 'vehiculos', condicion: (r) => r.vehiculos === 'si', ayuda: 'Características técnicas del vehículo', donde: 'Documentación del fallecido' },
  { id: 'informe-dgt', texto: 'Informe de la DGT', categoria: 'vehiculos', condicion: (r) => r.vehiculos === 'si', ayuda: 'Confirma titularidad y estado del vehículo', donde: 'DGT (sede electrónica o presencial)' },

  // Si hay menores
  { id: 'autorizacion-judicial', texto: 'Autorización judicial para aceptar herencia (menores)', categoria: 'menores', condicion: (r) => r.menores === 'si', ayuda: 'Necesaria si hay herederos menores de edad', donde: 'Juzgado de Primera Instancia' },
];

// ===== PASOS DEL TIMELINE =====
const PASOS_TIMELINE = [
  {
    numero: 1,
    titulo: 'Registro Civil',
    tiempo: 'Semana 1',
    icono: '📋',
    descripcion: 'Obtener certificado de defunción',
    detalle: 'Es el primer documento necesario. Se puede obtener de forma inmediata en el Registro Civil o por sede electrónica.',
    critico: false,
    enlaces: [] as { texto: string; url: string }[],
  },
  {
    numero: 2,
    titulo: 'Ministerio de Justicia',
    tiempo: 'Esperar 15 días hábiles',
    icono: '🏛️',
    descripcion: 'Certificados de últimas voluntades y seguros',
    detalle: 'Hay que esperar 15 días hábiles desde el fallecimiento para solicitarlos. Se tramitan online.',
    critico: false,
    enlaces: [] as { texto: string; url: string }[],
  },
  {
    numero: 3,
    titulo: 'Notaría',
    tiempo: 'Semanas 3-4',
    icono: '⚖️',
    descripcion: 'Testamento o declaración de herederos',
    detalle: 'Si hay testamento: obtener copia autorizada. Si no hay: tramitar acta de declaración de herederos abintestato.',
    critico: false,
    enlaces: [] as { texto: string; url: string }[],
  },
  {
    numero: 4,
    titulo: 'Bancos',
    tiempo: 'Semanas 3-4',
    icono: '🏦',
    descripcion: 'Certificados de saldo y bloqueo de cuentas',
    detalle: 'Obtener certificado de saldos a fecha de fallecimiento. Las cuentas quedan bloqueadas hasta la adjudicación.',
    critico: false,
    enlaces: [] as { texto: string; url: string }[],
  },
  {
    numero: 5,
    titulo: 'Hacienda Autonómica',
    tiempo: 'Antes de 6 meses',
    icono: '💰',
    descripcion: 'Impuesto de Sucesiones',
    detalle: 'Liquidar el Impuesto de Sucesiones. Plazo: 6 meses desde fallecimiento (prorrogable 6 meses más).',
    critico: true,
    enlaces: [
      { texto: 'Estimador Impuesto de Sucesiones (17 CCAA)', url: '/estimador-impuesto-sucesiones/' },
    ],
  },
  {
    numero: 6,
    titulo: 'Ayuntamiento',
    tiempo: 'Antes de 6 meses',
    icono: '🏢',
    descripcion: 'Plusvalía Municipal (si hay inmuebles)',
    detalle: 'Impuesto sobre el Incremento de Valor de Terrenos de Naturaleza Urbana. Solo si hay inmuebles urbanos.',
    critico: true,
    enlaces: [] as { texto: string; url: string }[],
  },
  {
    numero: 7,
    titulo: 'Notaría (escritura)',
    tiempo: 'Tras pagar impuestos',
    icono: '📝',
    descripcion: 'Escritura de aceptación y adjudicación',
    detalle: 'Documento donde los herederos aceptan formalmente la herencia y se reparten los bienes.',
    critico: false,
    enlaces: [] as { texto: string; url: string }[],
  },
  {
    numero: 8,
    titulo: 'Registro de la Propiedad',
    tiempo: 'Tras escritura',
    icono: '🏠',
    descripcion: 'Inscripción de inmuebles',
    detalle: 'Registrar el cambio de titularidad de los inmuebles heredados. Sin plazo fijo pero recomendable cuanto antes.',
    critico: false,
    enlaces: [] as { texto: string; url: string }[],
  },
  {
    numero: 9,
    titulo: 'DGT / Tráfico',
    tiempo: 'Tras escritura',
    icono: '🚗',
    descripcion: 'Cambio de titularidad de vehículos',
    detalle: 'Cambiar la titularidad de los vehículos heredados. Necesaria la escritura de adjudicación.',
    critico: false,
    enlaces: [] as { texto: string; url: string }[],
  },
];

const NOMBRE_CATEGORIA: Record<string, string> = {
  basicos: '📋 Documentos Básicos (siempre necesarios)',
  testamento: '📜 Documentos del Testamento',
  'sin-testamento': '⚖️ Sin Testamento (declaración de herederos)',
  inmuebles: '🏠 Documentos de Inmuebles',
  cuentas: '🏦 Documentos Bancarios',
  vehiculos: '🚗 Documentos de Vehículos',
  menores: '👶 Documentos para Menores',
};

// ===== COMPONENTE PRINCIPAL =====
export default function OrientacionTramitacionHerenciasPage() {
  const [respuestas, setRespuestas] = useState<Respuestas>({
    testamento: '',
    inmuebles: '',
    cuentas: '',
    vehiculos: '',
    deudas: '',
    herederos: '',
    menores: '',
  });
  const [itemsMarcados, setItemsMarcados] = useState<Set<string>>(new Set());
  const [pasoActual, setPasoActual] = useState(1);

  // Cargar estado guardado
  useEffect(() => {
    try {
      const savedRespuestas = localStorage.getItem('orientacion-herencias-respuestas');
      const savedItems = localStorage.getItem('orientacion-herencias-items');
      const savedPaso = localStorage.getItem('orientacion-herencias-paso');
      if (savedRespuestas) setRespuestas(JSON.parse(savedRespuestas));
      if (savedItems) setItemsMarcados(new Set(JSON.parse(savedItems)));
      if (savedPaso) setPasoActual(parseInt(savedPaso) || 1);
    } catch {
      // Ignorar errores de localStorage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orientacion-herencias-respuestas', JSON.stringify(respuestas));
  }, [respuestas]);

  useEffect(() => {
    localStorage.setItem('orientacion-herencias-items', JSON.stringify([...itemsMarcados]));
  }, [itemsMarcados]);

  useEffect(() => {
    localStorage.setItem('orientacion-herencias-paso', pasoActual.toString());
  }, [pasoActual]);

  const cuestionarioCompleto = useMemo(() =>
    respuestas.testamento !== '' &&
    respuestas.inmuebles !== '' &&
    respuestas.cuentas !== '' &&
    respuestas.vehiculos !== '' &&
    respuestas.herederos !== ''
  , [respuestas]);

  const itemsChecklistFiltrados = useMemo(() =>
    CHECKLIST_ITEMS.filter(item => item.condicion(respuestas))
  , [respuestas]);

  const itemsPorCategoria = useMemo(() => {
    const grupos: Record<string, ItemChecklist[]> = {};
    itemsChecklistFiltrados.forEach(item => {
      if (!grupos[item.categoria]) grupos[item.categoria] = [];
      grupos[item.categoria].push(item);
    });
    return grupos;
  }, [itemsChecklistFiltrados]);

  const progresoChecklist = useMemo(() => {
    if (itemsChecklistFiltrados.length === 0) return 0;
    return Math.round((itemsMarcados.size / itemsChecklistFiltrados.length) * 100);
  }, [itemsMarcados, itemsChecklistFiltrados]);

  const handleRespuesta = (campo: keyof Respuestas, valor: string) => {
    setRespuestas(prev => ({ ...prev, [campo]: valor }));
  };

  const toggleItem = (id: string) => {
    setItemsMarcados(prev => {
      const nuevo = new Set(prev);
      nuevo.has(id) ? nuevo.delete(id) : nuevo.add(id);
      return nuevo;
    });
  };

  const resetearTodo = () => {
    if (!confirm('¿Seguro que quieres empezar de nuevo? Se borrarán todos los datos guardados.')) return;
    setRespuestas({ testamento: '', inmuebles: '', cuentas: '', vehiculos: '', deudas: '', herederos: '', menores: '' });
    setItemsMarcados(new Set());
    setPasoActual(1);
    localStorage.removeItem('orientacion-herencias-respuestas');
    localStorage.removeItem('orientacion-herencias-items');
    localStorage.removeItem('orientacion-herencias-paso');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📋 Orientación para Tramitar una Herencia</h1>
        <p className={styles.subtitle}>
          Asistente paso a paso para gestionar una herencia en España
        </p>
        <p className={styles.metaVerificado}>
          Información basada en normativa vigente 2025 ·{' '}
          <a
            href="https://www.mjusticia.gob.es/es/ciudadanos/tramites/sucesiones"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkFuente}
          >
            Fuente: Ministerio de Justicia
          </a>
        </p>
      </header>

      <LegalNotice />

      {/* Disclaimer — siempre visible */}
      <DisclaimerCard variant="general" severity="high" />

      {/* PASO 1: Cuestionario */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span className={styles.numeroPaso}>1</span>
          Cuestionario Inicial
        </h2>
        <p className={styles.seccionDescripcion}>
          Responde estas preguntas para generar tu checklist personalizado de documentos.
        </p>

        <div className={styles.cuestionario}>
          {/* Testamento */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Existe testamento?</label>
            <div className={styles.opciones}>
              {(['si', 'no', 'nose'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.opcion} ${respuestas.testamento === v ? styles.opcionActiva : ''}`}
                  onClick={() => handleRespuesta('testamento', v)}
                >
                  {v === 'si' ? 'Sí' : v === 'no' ? 'No' : 'No lo sé'}
                </button>
              ))}
            </div>
            {respuestas.testamento === 'nose' && (
              <p className={styles.ayudaPregunta}>
                💡 El certificado de últimas voluntades te indicará si existe testamento y dónde está.
              </p>
            )}
          </div>

          {/* Inmuebles */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay inmuebles (pisos, casas, locales, terrenos)?</label>
            <div className={styles.opciones}>
              {(['si', 'no'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.opcion} ${respuestas.inmuebles === v ? styles.opcionActiva : ''}`}
                  onClick={() => handleRespuesta('inmuebles', v)}
                >
                  {v === 'si' ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Cuentas */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay cuentas bancarias o inversiones?</label>
            <div className={styles.opciones}>
              {(['si', 'no'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.opcion} ${respuestas.cuentas === v ? styles.opcionActiva : ''}`}
                  onClick={() => handleRespuesta('cuentas', v)}
                >
                  {v === 'si' ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Vehículos */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay vehículos (coches, motos, embarcaciones)?</label>
            <div className={styles.opciones}>
              {(['si', 'no'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.opcion} ${respuestas.vehiculos === v ? styles.opcionActiva : ''}`}
                  onClick={() => handleRespuesta('vehiculos', v)}
                >
                  {v === 'si' ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Deudas */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay deudas conocidas (hipotecas, préstamos)?</label>
            <div className={styles.opciones}>
              {(['si', 'no'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.opcion} ${respuestas.deudas === v ? styles.opcionActiva : ''}`}
                  onClick={() => handleRespuesta('deudas', v)}
                >
                  {v === 'si' ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
            {respuestas.deudas === 'si' && (
              <p className={styles.ayudaPregunta}>
                ⚠️ Si las deudas superan el valor de los bienes, considera la aceptación a beneficio de inventario o la renuncia.
              </p>
            )}
          </div>

          {/* Herederos */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Cuántos herederos hay?</label>
            <div className={styles.opciones}>
              {(['1', '2-3', '4+'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.opcion} ${respuestas.herederos === v ? styles.opcionActiva : ''}`}
                  onClick={() => handleRespuesta('herederos', v)}
                >
                  {v === '1' ? '1 heredero' : v === '2-3' ? '2-3 herederos' : '4 o más'}
                </button>
              ))}
            </div>
          </div>

          {/* Menores */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay herederos menores de edad o incapacitados?</label>
            <div className={styles.opciones}>
              {(['si', 'no'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.opcion} ${respuestas.menores === v ? styles.opcionActiva : ''}`}
                  onClick={() => handleRespuesta('menores', v)}
                >
                  {v === 'si' ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
            {respuestas.menores === 'si' && (
              <p className={styles.ayudaPregunta}>
                ⚠️ Se necesitará autorización judicial para aceptar la herencia en nombre de menores.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* PASO 2: Checklist */}
      {cuestionarioCompleto && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>
            <span className={styles.numeroPaso}>2</span>
            Checklist de Documentos
          </h2>
          <p className={styles.seccionDescripcion}>
            Marca los documentos que ya tengas. Tu progreso se guarda automáticamente.
          </p>

          <div className={styles.progresoContainer}>
            <div className={styles.progresoInfo}>
              <span>Progreso: {itemsMarcados.size} de {itemsChecklistFiltrados.length} documentos</span>
              <span className={styles.progresoPorcentaje}>{progresoChecklist}%</span>
            </div>
            <div className={styles.progresoBar}>
              <div className={styles.progresoFill} style={{ width: `${progresoChecklist}%` }} />
            </div>
          </div>

          <div className={styles.checklistContainer}>
            {Object.entries(itemsPorCategoria).map(([categoria, items]) => (
              <div key={categoria} className={styles.categoriaChecklist}>
                <h3 className={styles.categoriaTitulo}>{NOMBRE_CATEGORIA[categoria] ?? categoria}</h3>
                <div className={styles.itemsCategoria}>
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`${styles.itemChecklist} ${itemsMarcados.has(item.id) ? styles.itemMarcado : ''}`}
                    >
                      <label className={styles.itemLabel}>
                        <input
                          type="checkbox"
                          checked={itemsMarcados.has(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className={styles.itemCheckbox}
                          aria-label={item.texto}
                        />
                        <span className={styles.itemTexto}>{item.texto}</span>
                      </label>
                      {item.ayuda && <p className={styles.itemAyuda}>💡 {item.ayuda}</p>}
                      {item.donde && (
                        <p className={styles.itemDonde}>
                          📍 <strong>Dónde obtenerlo:</strong> {item.donde}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PASO 3: Timeline */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span className={styles.numeroPaso}>3</span>
          Orden de Gestiones
        </h2>
        <p className={styles.seccionDescripcion}>
          Sigue estos pasos en orden. Haz clic en cada paso para ver más detalles.
        </p>

        <div className={styles.timeline}>
          {PASOS_TIMELINE.map((paso, index) => (
            <div
              key={paso.numero}
              className={`${styles.pasoTimeline} ${pasoActual === paso.numero ? styles.pasoActivo : ''} ${paso.critico ? styles.pasoCritico : ''}`}
              onClick={() => setPasoActual(paso.numero)}
            >
              <div className={styles.pasoIcono}>{paso.icono}</div>
              <div className={styles.pasoContenido}>
                <div className={styles.pasoHeader}>
                  <h4 className={styles.pasoTitulo}>{paso.titulo}</h4>
                  <span className={styles.pasoTiempo}>{paso.tiempo}</span>
                </div>
                <p className={styles.pasoDescripcion}>{paso.descripcion}</p>
                {pasoActual === paso.numero && (
                  <div className={styles.pasoDetalle}>
                    <p>{paso.detalle}</p>
                    {paso.enlaces.length > 0 && (
                      <div className={styles.pasoEnlaces}>
                        {paso.enlaces.map((enlace, i) => (
                          <Link key={i} href={enlace.url} className={styles.pasoEnlace}>
                            🔗 {enlace.texto}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {index < PASOS_TIMELINE.length - 1 && <div className={styles.lineaConexion} />}
            </div>
          ))}
        </div>
      </section>

      {/* PASO 4: Plazos Críticos */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span className={styles.numeroPaso}>4</span>
          Plazos Críticos
        </h2>

        <div className={styles.plazosGrid}>
          <div className={`${styles.plazoCard} ${styles.plazoCriticoCard}`}>
            <div className={styles.plazoIcono}>🔴</div>
            <h4>Impuesto de Sucesiones</h4>
            <p className={styles.plazoPeriodo}>6 MESES desde fallecimiento</p>
            <ul>
              <li>Prórroga: 6 meses más (solicitar antes del 5.º mes)</li>
              <li>Retraso sin prórroga: recargo 5%-20% + intereses</li>
            </ul>
          </div>

          <div className={`${styles.plazoCard} ${styles.plazoCriticoCard}`}>
            <div className={styles.plazoIcono}>🔴</div>
            <h4>Plusvalía Municipal</h4>
            <p className={styles.plazoPeriodo}>6 MESES desde fallecimiento</p>
            <ul>
              <li>Solo si hay inmuebles urbanos</li>
              <li>Sin posibilidad de prórroga</li>
            </ul>
          </div>

          <div className={`${styles.plazoCard} ${styles.plazoMedioCard}`}>
            <div className={styles.plazoIcono}>🟡</div>
            <h4>Seguros de Vida</h4>
            <p className={styles.plazoPeriodo}>5 AÑOS para reclamar</p>
            <ul>
              <li>Plazo de prescripción largo</li>
              <li>Consultar certificado de seguros</li>
            </ul>
          </div>

          <div className={`${styles.plazoCard} ${styles.plazoFlexibleCard}`}>
            <div className={styles.plazoIcono}>🟢</div>
            <h4>Registro de la Propiedad</h4>
            <p className={styles.plazoPeriodo}>Sin plazo fijo</p>
            <ul>
              <li>Recomendable tras pagar impuestos</li>
              <li>Necesario para vender o hipotecar</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PASO 5: Costes Orientativos */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          <span className={styles.numeroPaso}>5</span>
          Costes Orientativos
        </h2>
        <p className={styles.seccionDescripcion}>
          Estimación basada en aranceles oficiales. Los importes finales pueden variar.
        </p>

        <div className={styles.costesGrid}>
          <div className={styles.costeCard}>
            <h4>📋 Certificados (costes fijos)</h4>
            <table className={styles.tablaCoste}>
              <tbody>
                <tr><td>Certificado de defunción</td><td>~4 €</td></tr>
                <tr><td>Certificado de últimas voluntades</td><td>~4 €</td></tr>
                <tr><td>Certificado de seguros</td><td>~4 €</td></tr>
                <tr><td>Nota simple Registro Propiedad</td><td>~10 €</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.costeCard}>
            <h4>⚖️ Notaría (orientativo)</h4>
            <p className={styles.costeNota}>Según valor total de la herencia:</p>
            <table className={styles.tablaCoste}>
              <thead><tr><th>Valor herencia</th><th>Coste aprox.</th></tr></thead>
              <tbody>
                <tr><td>Hasta 6.010 €</td><td>~90 €</td></tr>
                <tr><td>30.000 €</td><td>~200 €</td></tr>
                <tr><td>100.000 €</td><td>~350 €</td></tr>
                <tr><td>200.000 €</td><td>~450 €</td></tr>
                <tr><td>500.000 €</td><td>~700 €</td></tr>
              </tbody>
            </table>
            <p className={styles.costeAviso}>Sin testamento: añadir ~200-300 € por acta de herederos.</p>
          </div>

          <div className={styles.costeCard}>
            <h4>🏠 Registro de la Propiedad</h4>
            <p className={styles.costeNota}>Según valor de los inmuebles:</p>
            <table className={styles.tablaCoste}>
              <thead><tr><th>Valor inmuebles</th><th>Coste aprox.</th></tr></thead>
              <tbody>
                <tr><td>Hasta 6.010 €</td><td>~24 €</td></tr>
                <tr><td>50.000 €</td><td>~100 €</td></tr>
                <tr><td>100.000 €</td><td>~170 €</td></tr>
                <tr><td>200.000 €</td><td>~250 €</td></tr>
                <tr><td>500.000 €</td><td>~400 €</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.costeCard}>
            <h4>💰 Impuestos (usar estimadores)</h4>
            <p className={styles.costeNota}>
              El Impuesto de Sucesiones varía enormemente según la Comunidad Autónoma y el grado de parentesco.
            </p>
            <div className={styles.enlacesCalculadoras}>
              <Link href="/estimador-impuesto-sucesiones/" className={styles.enlaceCalculadora}>
                📊 Estimador Impuesto de Sucesiones (17 CCAA)
              </Link>
              <Link href="/estimador-impuesto-donaciones/" className={styles.enlaceCalculadora}>
                🎁 Estimador Impuesto de Donaciones (17 CCAA)
              </Link>
            </div>
            <p className={styles.costeAviso}>
              La Plusvalía Municipal depende del ayuntamiento y la antigüedad del inmueble.
            </p>
          </div>
        </div>
      </section>

      {/* Botón resetear */}
      <div className={styles.accionesContainer}>
        <button onClick={resetearTodo} className={styles.btnResetear}>
          🔄 Empezar de Nuevo
        </button>
        <p className={styles.ayudaResetear}>Esto borrará todas tus respuestas y el progreso del checklist</p>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre herencias?"
        subtitle="Conceptos clave, preguntas frecuentes y situaciones especiales"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Clave sobre Herencias en España</h2>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>📜 ¿Qué es el testamento?</h4>
              <p>Documento donde una persona expresa su voluntad sobre el reparto de sus bienes tras su fallecimiento. Puede ser abierto (ante notario), cerrado u ológrafo (escrito a mano).</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>⚖️ Herencia sin testamento (abintestato)</h4>
              <p>Si no hay testamento, la ley determina quiénes heredan: 1.º descendientes, 2.º ascendientes, 3.º cónyuge, 4.º colaterales (hermanos, sobrinos), 5.º el Estado.</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>👥 ¿Qué es la legítima?</h4>
              <p>Parte de la herencia que la ley reserva a los herederos forzosos (hijos, ascendientes, cónyuge). En derecho común, 2/3 de la herencia para los hijos.</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>💒 Usufructo del cónyuge viudo</h4>
              <p>El cónyuge viudo tiene derecho al usufructo de parte de la herencia: 1/3 si hay hijos, 1/2 si heredan ascendientes, o 2/3 si no hay descendientes ni ascendientes.</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>💸 ¿Se heredan las deudas?</h4>
              <p>Sí. Al aceptar una herencia se asumen las deudas. Por eso existe la aceptación a beneficio de inventario: solo se pagan deudas hasta donde alcancen los bienes heredados.</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>❌ Renuncia a la herencia</h4>
              <p>Se puede renunciar si hay más deudas que bienes. La renuncia es irrevocable y debe hacerse ante notario. Si renuncias, tu parte pasa a los demás herederos.</p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            {[
              { p: '¿Cuánto tarda tramitar una herencia?', r: 'Depende de la complejidad, pero típicamente entre 3 y 6 meses. Si hay conflictos entre herederos o bienes en el extranjero, puede alargarse considerablemente.' },
              { p: '¿Necesito abogado para tramitar una herencia?', r: 'No es obligatorio, pero es muy recomendable en herencias complejas (varios herederos, inmuebles, empresa familiar, conflictos).' },
              { p: '¿Puedo acceder a las cuentas del fallecido?', r: 'No directamente. Las cuentas quedan bloqueadas hasta presentar la escritura de adjudicación y el justificante del pago del Impuesto de Sucesiones.' },
              { p: '¿Qué pasa si un heredero no quiere firmar?', r: 'Los demás pueden acudir a un contador-partidor judicial para realizar el reparto. Es un proceso más largo y costoso.' },
              { p: '¿Puedo vender un inmueble heredado antes de inscribirlo?', r: 'Técnicamente sí, pero el comprador no podrá inscribirlo a su nombre hasta que tú lo hayas inscrito primero. La mayoría exigirán inscripción previa.' },
              { p: '¿Qué diferencia hay entre heredero y legatario?', r: 'El heredero recibe una parte proporcional del patrimonio (incluyendo deudas). El legatario recibe un bien concreto especificado en el testamento, sin responsabilidad sobre las deudas.' },
            ].map(({ p, r }, i) => (
              <details key={i} className={styles.faqItem}>
                <summary>{p}</summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientacion-tramitacion-herencias')} />
      <Footer appName="orientacion-tramitacion-herencias" />
    </div>
  );
}
