'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './OrientacionHerencias.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
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
      <DisclaimerCard variant="financial" severity="critical" />

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

        {/* ===== SECCIÓN 1: TABLA COMPARATIVA ===== */}
        <section className={styles.guideSection}>
          <h2>Herencia con Testamento vs Sin Testamento (Abintestato)</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Con testamento</th>
                  <th>Sin testamento (abintestato)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Proceso</strong></td>
                  <td>Obtener copia autorizada del testamento en la notaría indicada por el certificado de últimas voluntades</td>
                  <td>Tramitar acta notarial de declaración de herederos (requiere 2 testigos y documentación de parentesco)</td>
                </tr>
                <tr>
                  <td><strong>Duración</strong></td>
                  <td>3 – 4 meses en casos estándar</td>
                  <td>4 – 6 meses; hasta 12 si hay desacuerdos</td>
                </tr>
                <tr>
                  <td><strong>Coste adicional</strong></td>
                  <td>~15 – 30 € por copia autorizada del testamento</td>
                  <td>~200 – 400 € por el acta notarial de herederos abintestato</td>
                </tr>
                <tr>
                  <td><strong>Quién hereda</strong></td>
                  <td>Las personas y en la proporción que el testador designó (respetando legítimas)</td>
                  <td>El orden legal: hijos y descendientes → ascendientes → cónyuge → colaterales → Estado</td>
                </tr>
                <tr>
                  <td><strong>Complejidad</strong></td>
                  <td>Baja – Media. La voluntad del fallecido está documentada</td>
                  <td>Media – Alta. Hay que demostrar el parentesco de todos los herederos</td>
                </tr>
                <tr>
                  <td><strong>Riesgo de conflicto</strong></td>
                  <td>Bajo si el testamento es claro y reciente; medio si hay varios legatarios</td>
                  <td>Alto si los herederos no se ponen de acuerdo en el reparto del piso u otros bienes indivisibles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== SECCIÓN 2: CASOS DE USO ===== */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso Frecuentes</h2>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧‍👦</span>
                <h4>Familia con testamento claro, 2 hijos, sin deudas</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Fallece el padre, deja testamento que divide la herencia a partes iguales entre sus dos hijos. El patrimonio incluye un piso y dos cuentas bancarias. No hay deudas pendientes.
              </p>
              <p><strong>Proceso:</strong> Estándar. Certificados → copia del testamento → inventario → escritura de adjudicación → pago IS (modelo 650) → inscripción en Registro.</p>
              <p className={styles.escenarioTip}>
                ⏱ Duración estimada: <strong>3 – 4 meses</strong> si ambos herederos colaboran. Coste notarial orientativo para un piso de 200.000 €: ~450 € escritura + ~250 € Registro.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👥</span>
                <h4>Herencia sin testamento, 3 hermanos y un piso</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Fallece una persona soltera sin hijos, sin testamento. Tres hermanos son los únicos herederos legales. El único bien es un piso valorado en 150.000 €.
              </p>
              <p><strong>Proceso:</strong> Abintestato notarial. Certificados → acta de declaración de herederos (dos testigos) → inventario → escritura de adjudicación (proindiviso o venta acordada) → IS → Registro.</p>
              <p className={styles.escenarioTip}>
                ⏱ Duración estimada: <strong>4 – 6 meses</strong>. Coste extra: ~250 – 400 € por el acta notarial de herederos. Si no se ponen de acuerdo en el destino del piso, puede alargarse mucho más.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚠️</span>
                <h4>Herencia con deudas desconocidas</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Fallece un autónomo. Los herederos sospechan que puede haber deudas con la Agencia Tributaria o con proveedores, pero no conocen el importe exacto.
              </p>
              <p><strong>Proceso:</strong> Aceptación a beneficio de inventario. Permite aceptar la herencia respondiendo solo con los bienes heredados, nunca con el patrimonio personal. Se tramita ante notario o ante el juzgado.</p>
              <p className={styles.escenarioTip}>
                ⏱ Duración estimada: <strong>6 – 12 meses</strong> (el inventario notarial puede llevar tiempo). Coste adicional: honorarios notariales por el acta de inventario, variables según bienes.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>✈️</span>
                <h4>Heredero que vive en el extranjero</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Uno de los tres hijos herederos reside en Alemania. No puede viajar a España para firmar las escrituras. Los demás quieren agilizar el proceso.
              </p>
              <p><strong>Proceso:</strong> El heredero en el extranjero puede otorgar un poder notarial en su país (apostillado y traducido) para que otra persona firme en su nombre en España, o firmar mediante poder consular en el consulado español más próximo.</p>
              <p className={styles.escenarioTip}>
                ⏱ Tiempo adicional: <strong>4 – 8 semanas</strong> para apostilla + traducción jurada. Coste orientativo: 100 – 300 € según país y volumen de documentos.
              </p>
            </div>

          </div>
        </section>

        {/* ===== SECCIÓN 3: FAQ AMPLIADA ===== */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes Detalladas</h2>
          <div className={styles.faqList}>

            <details className={styles.faqItem}>
              <summary>¿Qué pasa si un heredero no quiere tramitar la herencia?</summary>
              <p>Si uno de los herederos se niega a participar o a firmar, los demás pueden solicitar al juzgado el nombramiento de un <strong>contador-partidor dativo</strong>. Este profesional realiza la partición de forma judicial, aunque el proceso puede tardar entre 1 y 3 años adicionales y generar costes judiciales significativos. Antes de llegar a ese extremo, es recomendable intentar la mediación.</p>
              <p className={styles.faqTip}>💡 Si el heredero simplemente no aparece, puede tramitarse la herencia comunicando su paradero desconocido al notario.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo usar el dinero de la cuenta del fallecido para pagar gastos?</summary>
              <p>No. Las cuentas bancarias quedan <strong>bloqueadas automáticamente</strong> cuando el banco tiene constancia del fallecimiento. Retirar fondos antes de la adjudicación formal puede constituir un delito de apropiación indebida, incluso para el cónyuge superviviente en las cuentas privativas. La excepción: algunos bancos permiten sacar hasta 3.000 – 6.000 € para gastos de sepelio acreditados con factura.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuánto cuesta tramitar una herencia con notario?</summary>
              <p>Los honorarios notariales están regulados por arancel oficial y dependen del valor total del caudal hereditario:</p>
              <ul>
                <li>Herencia de 30.000 €: ~200 € de escritura</li>
                <li>Herencia de 100.000 €: ~350 €</li>
                <li>Herencia de 300.000 €: ~550 €</li>
                <li>Herencia de 500.000 €: ~700 €</li>
              </ul>
              <p>A esto se suma el acta de herederos abintestato si no hay testamento (~250 – 400 €), las copias adicionales y los gastos de Registro de la Propiedad. El total para una herencia media con un piso suele situarse entre 800 y 2.500 €, sin contar impuestos.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Tengo plazo para aceptar o renunciar a la herencia?</summary>
              <p>En principio no existe un plazo legal para aceptar. Sin embargo, cualquier acreedor puede pedir al juzgado que se te fije un plazo de <strong>30 días</strong> para pronunciarte (interpelatio in iure). Si no lo haces en ese plazo, se entiende que aceptas. Además, si pagas alguna deuda del fallecido o retiras dinero de su cuenta antes de pronunciarte, se considera aceptación tácita. La renuncia es irrevocable y debe hacerse ante notario.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué es la declaración de herederos abintestato?</summary>
              <p>Es el procedimiento notarial que determina oficialmente quiénes tienen derecho a heredar cuando no hay testamento o cuando el testamento no cubre todos los bienes. Se tramita ante cualquier notario. Requiere: certificado de defunción, certificado de últimas voluntades, DNI del fallecido, certificados de nacimiento y matrimonio de los herederos, y dos testigos (mayores de edad) que conocieran al fallecido. El plazo de tramitación es de <strong>20 días hábiles</strong> aproximadamente.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cómo tributa la herencia si hay un seguro de vida?</summary>
              <p>Los seguros de vida <strong>no forman parte de la herencia</strong> sino que se perciben directamente por el beneficiario designado en la póliza. Sin embargo, sí tributan en el Impuesto de Sucesiones como si fueran parte de ella (base imponible del beneficiario). La reducción aplicable varía por CCAA: en muchas se aplica una reducción de hasta 9.195 € si el beneficiario es cónyuge, ascendiente o descendiente. La cantidad tributa en el plazo habitual de 6 meses.</p>
              <p className={styles.faqTip}>💡 Es fundamental solicitar el certificado de contratos de seguro de cobertura de fallecimiento en el Ministerio de Justicia para detectar todas las pólizas.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo vender la parte de la herencia antes de adjudicarla?</summary>
              <p>Sí, existe la figura del <strong>contrato de cesión de derechos hereditarios</strong> (art. 1.000 CC). Puedes vender tu cuota abstracta de la herencia a un tercero (incluso a un extraño, aunque los coherederos tienen derecho de retracto en 30 días). Sin embargo, el comprador solo adquiere lo que tú recibirías; no puede exigir bienes concretos hasta que se adjudique la herencia. Es una figura usada habitualmente cuando un heredero necesita liquidez urgente.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué pasa con las deudas si renuncio a la herencia?</summary>
              <p>Si renuncias, las deudas del fallecido <strong>no te afectan</strong>: tu parte pasa a los demás herederos por derecho de acrecer, o a tus propios hijos si los hay (derecho de representación). La renuncia es total, no puedes renunciar a las deudas y quedarte los bienes. Debe formalizarse ante notario y es irrevocable. Si posteriormente se descubren bienes que no conocías, no podrás reclamarlos al haber renunciado.</p>
            </details>

          </div>
        </section>

        {/* ===== SECCIÓN 4: GUÍA PASO A PASO ===== */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Proceso Completo de Tramitación</h2>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Certificado de defunción</h4>
                <p><strong>Dónde:</strong> Registro Civil del municipio donde ocurrió el fallecimiento (presencial o sede electrónica del Ministerio de Justicia). <strong>Plazo:</strong> Se puede obtener a partir del mismo día del fallecimiento o al día siguiente. <strong>Coste:</strong> ~4 €. Es imprescindible para todos los trámites posteriores; pide al menos 4 copias originales.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Certificado de últimas voluntades (y de seguros)</h4>
                <p><strong>Dónde:</strong> Ministerio de Justicia (sede electrónica o correo certificado). <strong>Plazo mínimo:</strong> 15 días hábiles desde el fallecimiento. <strong>Coste:</strong> ~4 € por cada certificado. Solicita también en el mismo trámite el Certificado de Contratos de Seguro de cobertura de fallecimiento. Ambos indican si existe testamento y ante qué notario se otorgó.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Obtener el testamento o iniciar declaración abintestato</h4>
                <p><strong>Con testamento:</strong> Ve a la notaría indicada en el certificado de últimas voluntades y solicita una copia autorizada (~15 – 30 €). <strong>Sin testamento:</strong> Acude a cualquier notaría con los certificados de defunción y voluntades, el DNI del fallecido, los certificados de nacimiento/matrimonio de los herederos y dos testigos. El acta de declaración de herederos tarda ~20 días hábiles y cuesta ~250 – 400 €.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Inventario y valoración de bienes y deudas</h4>
                <p>Reúne la documentación de todos los bienes (escrituras, notas simples, certificados de saldo bancario a fecha de fallecimiento, fichas técnicas de vehículos, carteras de inversión) y de todas las deudas (hipotecas, préstamos, deudas con Hacienda, cuotas pendientes de comunidad). Necesitas valorar los inmuebles: el valor de referencia catastral es el mínimo para Hacienda, aunque puedes utilizar tasación oficial si es inferior al precio de mercado.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Escritura de aceptación y adjudicación ante notario</h4>
                <p>Con todo el inventario listo, los herederos firman ante notario la escritura donde aceptan la herencia y se adjudican los bienes concretos. <strong>Coste:</strong> Entre ~200 € (herencia pequeña) y ~700 € (herencia de 500.000 €), según arancel. Todos los herederos deben firmar o estar representados por poder notarial.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Liquidar el Impuesto de Sucesiones — modelo 650</h4>
                <p><strong>Plazo:</strong> 6 meses desde el fallecimiento. <strong>Prórroga:</strong> 6 meses adicionales sin recargo si se solicita antes de que transcurra el mes 5. <strong>Dónde:</strong> Hacienda autonómica de la Comunidad Autónoma donde residía habitualmente el fallecido. <strong>Coste:</strong> Variable según CCAA, grado de parentesco y base imponible; en Castilla y León o Madrid puede ser casi 0 para hijos; en otras CCAA puede ser significativo. Usa el estimador de meskeIA para calcularlo.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Inscribir bienes en registros (Catastro, Registro de la Propiedad, DGT)</h4>
                <p><strong>Registro de la Propiedad:</strong> Presentar la escritura de adjudicación y el justificante del pago del IS. Sin inscripción no podrás vender ni hipotecar el inmueble. Coste según valor del inmueble: ~100 – 400 €. <strong>Catastro:</strong> Comunicar el cambio de titularidad en el plazo de 2 meses desde la adjudicación (gratuito). <strong>DGT:</strong> Cambiar la titularidad de los vehículos heredados presentando la escritura y el justificante del IS; coste ~17 – 55 € según tasa del permiso de circulación.</p>
              </div>
            </div>

          </div>
        </section>

        {/* ===== SECCIÓN 5: MEJORES PRÁCTICAS ===== */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas para Tramitar la Herencia</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <h4>Solicita la prórroga del IS antes del mes 5</h4>
              <p>Si no puedes liquidar el Impuesto de Sucesiones en 6 meses (por inventario incompleto, desacuerdos entre herederos o trámites pendientes), presenta la solicitud de prórroga antes de que se cumplan 5 meses desde el fallecimiento. Obtienes 6 meses adicionales sin recargo ni intereses de demora. Pasado el mes 5, la prórroga ya no es posible.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📁</span>
              <h4>Reúne toda la documentación antes de ir al notario</h4>
              <p>Los honorarios notariales se cobran también por el tiempo de gestión. Llegar a la notaría con toda la documentación organizada (escrituras, saldos bancarios certificados, recibos del IBI, nota simple del Registro) puede reducir el número de visitas necesarias y, con ello, los honorarios totales. Pide al notario de antemano la lista completa de documentos necesarios.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <h4>Valora el beneficio de inventario cuando hay deudas desconocidas</h4>
              <p>Si el fallecido tenía actividad empresarial, era autónomo o había avalado préstamos de terceros, es posible que existan deudas que no conoces. La aceptación a beneficio de inventario te protege: solo responderás con los bienes heredados, nunca con tu patrimonio personal. Tiene un coste adicional (acta notarial de inventario) pero puede evitar sorpresas muy costosas.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <h4>Comunica el fallecimiento al banco inmediatamente</h4>
              <p>Informa al banco en cuanto tengas el certificado de defunción. Esto bloquea las cuentas oficialmente y evita que se produzcan cargos indebidos (recibos domiciliados, tarjetas activas) o, peor, que alguien con acceso retire fondos. Solicita al banco el certificado de saldos a fecha de fallecimiento y la lista completa de productos financieros a nombre del fallecido.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏢</span>
              <h4>Si hay empresa familiar, consulta la reducción del 95%</h4>
              <p>La mayoría de CCAA aplican una reducción del 95% en la base imponible del IS cuando la herencia incluye participaciones en una empresa familiar o negocio profesional, siempre que se cumplan requisitos de mantenimiento (normalmente 5 o 10 años). Esta reducción puede suponer un ahorro fiscal muy significativo. Consulta con un asesor fiscal antes de firmar la escritura.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧾</span>
              <h4>Guarda todos los justificantes de gastos de la herencia</h4>
              <p>Los gastos deducibles en el Impuesto de Sucesiones incluyen: gastos de entierro y funeral (con límite según CCAA), honorarios del notario, tasas del Registro de la Propiedad y, en algunas CCAA, honorarios de abogado y procurador. Guarda todas las facturas originales. Estos gastos reducen la base imponible y, por tanto, el impuesto a pagar.</p>
            </div>

          </div>
        </section>

        {/* ===== SECCIÓN 6: WARNING BOX ===== */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Más Comunes que Debes Evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Retirar dinero de la cuenta del fallecido antes de la adjudicación.</strong>{' '}
                Aunque seas el único heredero o estés autorizado en la cuenta, extraer fondos antes de presentar la escritura de adjudicación y el justificante del IS puede constituir apropiación indebida. El banco bloqueará la cuenta al tener constancia del fallecimiento.
              </li>
              <li>
                <strong>No pedir prórroga del IS antes del mes 5.</strong>{' '}
                La prórroga de 6 meses adicionales sin recargo solo puede solicitarse mientras aún no ha vencido el plazo original. Si esperas al mes 6 o dejas que venza, ya no podrás pedirla y se aplicarán recargos del 5 % al 20 % más intereses de demora.
              </li>
              <li>
                <strong>Aceptar la herencia sin comprobar las deudas.</strong>{' '}
                Al aceptar pura y simplemente, respondes de las deudas del fallecido también con tu patrimonio personal, no solo con lo heredado. Antes de aceptar, solicita un certificado de deudas tributarias en la AEAT y consulta el historial crediticio del fallecido.
              </li>
              <li>
                <strong>Ignorar el Impuesto Municipal de Plusvalía en inmuebles urbanos.</strong>{' '}
                El IIVTNU tiene el mismo plazo que el IS (6 meses) pero se liquida en el Ayuntamiento donde esté ubicado el inmueble. A diferencia del IS, no admite prórroga. Si hay varios inmuebles en distintos municipios, deberás liquidarlo en cada Ayuntamiento correspondiente.
              </li>
              <li>
                <strong>Firmar documentos sin leerlos o basándose en acuerdos verbales.</strong>{' '}
                Los acuerdos verbales entre herederos sobre el reparto no son jurídicamente vinculantes. Solo tiene validez lo que quede recogido en la escritura notarial. Lee detenidamente antes de firmar; una vez firmada la escritura de adjudicación, modificarla requiere el consentimiento de todos los herederos y genera nuevos gastos.
              </li>
              <li>
                <strong>No inscribir el inmueble heredado en el Registro de la Propiedad.</strong>{' '}
                Sin inscripción, el inmueble figura a nombre del fallecido en el Registro. No podrás venderlo, hipotecarlo ni arrendarlo con garantías jurídicas. Además, la falta de inscripción no impide que un tercero de buena fe pueda adquirir derechos sobre el bien si el fallecido tenía deudas. Inscribe siempre tras pagar los impuestos.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <ShareCard appName="orientacion-tramitacion-herencias" />
      <RelatedApps apps={getRelatedApps('orientacion-tramitacion-herencias')} />
      <Footer appName="orientacion-tramitacion-herencias" />
    </div>
  );
}
