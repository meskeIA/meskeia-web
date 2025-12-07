'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './GuiaTramitacionHerencias.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';
import Link from 'next/link';

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
  { id: 'escrituras', texto: 'Escrituras de propiedad de inmuebles', categoria: 'inmuebles', condicion: (r) => r.inmuebles === 'si', ayuda: 'Documentos de propiedad de cada inmueble', donde: 'Documentación del fallecido o solicitar nota simple en Registro de la Propiedad' },
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
  },
  {
    numero: 2,
    titulo: 'Ministerio de Justicia',
    tiempo: 'Esperar 15 días hábiles',
    icono: '🏛️',
    descripcion: 'Certificados de últimas voluntades y seguros',
    detalle: 'Hay que esperar 15 días hábiles desde el fallecimiento para solicitarlos. Se tramitan online.',
  },
  {
    numero: 3,
    titulo: 'Notaría',
    tiempo: 'Semanas 3-4',
    icono: '⚖️',
    descripcion: 'Testamento o declaración de herederos',
    detalle: 'Si hay testamento: obtener copia autorizada. Si no hay: tramitar acta de declaración de herederos abintestato.',
  },
  {
    numero: 4,
    titulo: 'Bancos',
    tiempo: 'Semanas 3-4',
    icono: '🏦',
    descripcion: 'Certificados de saldo y bloqueo de cuentas',
    detalle: 'Obtener certificado de saldos a fecha de fallecimiento. Las cuentas quedan bloqueadas hasta la adjudicación.',
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
      { texto: 'Calculadora Sucesiones Nacional', url: '/calculadora-sucesiones-nacional/' },
      { texto: 'Calculadora Sucesiones Cataluña', url: '/calculadora-sucesiones-cataluna/' },
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
  },
  {
    numero: 7,
    titulo: 'Notaría (escritura)',
    tiempo: 'Tras pagar impuestos',
    icono: '📝',
    descripcion: 'Escritura de aceptación y adjudicación',
    detalle: 'Documento donde los herederos aceptan formalmente la herencia y se reparten los bienes.',
  },
  {
    numero: 8,
    titulo: 'Registro de la Propiedad',
    tiempo: 'Tras escritura',
    icono: '🏠',
    descripcion: 'Inscripción de inmuebles',
    detalle: 'Registrar el cambio de titularidad de los inmuebles heredados. Sin plazo fijo pero recomendable hacerlo cuanto antes.',
  },
  {
    numero: 9,
    titulo: 'DGT / Tráfico',
    tiempo: 'Tras escritura',
    icono: '🚗',
    descripcion: 'Cambio de titularidad de vehículos',
    detalle: 'Cambiar la titularidad de los vehículos heredados. Necesaria la escritura de adjudicación.',
  },
];

// ===== ARANCELES NOTARIALES (tabla orientativa) =====
const ARANCELES_NOTARIO = [
  { hasta: 6010, coste: '~90€' },
  { hasta: 30050, coste: '90€ + 0,45% del exceso' },
  { hasta: 60101, coste: 'anterior + 0,15% del exceso' },
  { hasta: 150253, coste: 'anterior + 0,10% del exceso' },
  { hasta: 601012, coste: 'anterior + 0,05% del exceso' },
  { hasta: Infinity, coste: 'anterior + 0,03% del exceso' },
];

const ARANCELES_REGISTRO = [
  { hasta: 6010, coste: '~24€' },
  { hasta: 30050, coste: '24€ + 0,175% del exceso' },
  { hasta: 60101, coste: 'anterior + 0,125% del exceso' },
  { hasta: 150253, coste: 'anterior + 0,075% del exceso' },
  { hasta: 601012, coste: 'anterior + 0,030% del exceso' },
  { hasta: Infinity, coste: 'anterior + 0,020% del exceso' },
];

// ===== COMPONENTE PRINCIPAL =====
export default function GuiaTramitacionHerenciasPage() {
  // Estados del cuestionario
  const [respuestas, setRespuestas] = useState<Respuestas>({
    testamento: '',
    inmuebles: '',
    cuentas: '',
    vehiculos: '',
    deudas: '',
    herederos: '',
    menores: '',
  });

  // Estado del checklist (items marcados)
  const [itemsMarcados, setItemsMarcados] = useState<Set<string>>(new Set());

  // Estado de paso actual del timeline
  const [pasoActual, setPasoActual] = useState(1);

  // Cargar estado guardado
  useEffect(() => {
    const savedRespuestas = localStorage.getItem('guia-herencias-respuestas');
    const savedItems = localStorage.getItem('guia-herencias-items');
    const savedPaso = localStorage.getItem('guia-herencias-paso');

    if (savedRespuestas) {
      try {
        setRespuestas(JSON.parse(savedRespuestas));
      } catch (e) {
        console.error('Error al cargar respuestas:', e);
      }
    }

    if (savedItems) {
      try {
        setItemsMarcados(new Set(JSON.parse(savedItems)));
      } catch (e) {
        console.error('Error al cargar items:', e);
      }
    }

    if (savedPaso) {
      setPasoActual(parseInt(savedPaso) || 1);
    }
  }, []);

  // Guardar estado
  useEffect(() => {
    localStorage.setItem('guia-herencias-respuestas', JSON.stringify(respuestas));
  }, [respuestas]);

  useEffect(() => {
    localStorage.setItem('guia-herencias-items', JSON.stringify([...itemsMarcados]));
  }, [itemsMarcados]);

  useEffect(() => {
    localStorage.setItem('guia-herencias-paso', pasoActual.toString());
  }, [pasoActual]);

  // Verificar si el cuestionario está completo
  const cuestionarioCompleto = useMemo(() => {
    return respuestas.testamento !== '' &&
           respuestas.inmuebles !== '' &&
           respuestas.cuentas !== '' &&
           respuestas.vehiculos !== '' &&
           respuestas.herederos !== '';
  }, [respuestas]);

  // Filtrar items del checklist según respuestas
  const itemsChecklistFiltrados = useMemo(() => {
    return CHECKLIST_ITEMS.filter(item => item.condicion(respuestas));
  }, [respuestas]);

  // Agrupar items por categoría
  const itemsPorCategoria = useMemo(() => {
    const grupos: Record<string, ItemChecklist[]> = {};
    itemsChecklistFiltrados.forEach(item => {
      if (!grupos[item.categoria]) {
        grupos[item.categoria] = [];
      }
      grupos[item.categoria].push(item);
    });
    return grupos;
  }, [itemsChecklistFiltrados]);

  // Calcular progreso del checklist
  const progresoChecklist = useMemo(() => {
    if (itemsChecklistFiltrados.length === 0) return 0;
    return Math.round((itemsMarcados.size / itemsChecklistFiltrados.length) * 100);
  }, [itemsMarcados, itemsChecklistFiltrados]);

  // Manejar cambio de respuesta
  const handleRespuesta = (campo: keyof Respuestas, valor: string) => {
    setRespuestas(prev => ({ ...prev, [campo]: valor }));
  };

  // Manejar marcar/desmarcar item
  const toggleItem = (id: string) => {
    setItemsMarcados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  };

  // Resetear todo
  const resetearTodo = () => {
    if (confirm('¿Estás seguro de que quieres empezar de nuevo? Se borrarán todos los datos guardados.')) {
      setRespuestas({
        testamento: '',
        inmuebles: '',
        cuentas: '',
        vehiculos: '',
        deudas: '',
        herederos: '',
        menores: '',
      });
      setItemsMarcados(new Set());
      setPasoActual(1);
      localStorage.removeItem('guia-herencias-respuestas');
      localStorage.removeItem('guia-herencias-items');
      localStorage.removeItem('guia-herencias-paso');
    }
  };

  // Nombres de categorías
  const nombreCategoria = (cat: string): string => {
    const nombres: Record<string, string> = {
      'basicos': '📋 Documentos Básicos (siempre necesarios)',
      'testamento': '📜 Documentos del Testamento',
      'sin-testamento': '⚖️ Sin Testamento (declaración de herederos)',
      'inmuebles': '🏠 Documentos de Inmuebles',
      'cuentas': '🏦 Documentos Bancarios',
      'vehiculos': '🚗 Documentos de Vehículos',
      'menores': '👶 Documentos para Menores',
    };
    return nombres[cat] || cat;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📋 Guía de Tramitación de Herencias</h1>
        <p className={styles.subtitle}>
          Asistente paso a paso para gestionar una herencia en España
        </p>
      </header>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta guía proporciona <strong>orientación general</strong> sobre el proceso de tramitación
          de herencias en España. <strong>NO constituye asesoramiento legal, fiscal ni notarial</strong>.
        </p>
        <ul>
          <li>Cada caso tiene particularidades que requieren valoración profesional</li>
          <li>La normativa varía entre Comunidades Autónomas</li>
          <li>Los plazos y requisitos pueden cambiar por modificaciones legislativas</li>
        </ul>
        <p className={styles.disclaimerRecomendacion}>
          <strong>RECOMENDACIÓN:</strong> Consulte siempre con un notario, abogado especializado
          en sucesiones o gestor administrativo para su caso concreto.
        </p>
      </div>

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
          {/* Pregunta 1: Testamento */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Existe testamento?</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${respuestas.testamento === 'si' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('testamento', 'si')}
              >
                Sí
              </button>
              <button
                className={`${styles.opcion} ${respuestas.testamento === 'no' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('testamento', 'no')}
              >
                No
              </button>
              <button
                className={`${styles.opcion} ${respuestas.testamento === 'nose' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('testamento', 'nose')}
              >
                No lo sé
              </button>
            </div>
            {respuestas.testamento === 'nose' && (
              <p className={styles.ayudaPregunta}>
                💡 El certificado de últimas voluntades te indicará si existe testamento y dónde está.
              </p>
            )}
          </div>

          {/* Pregunta 2: Inmuebles */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay inmuebles (pisos, casas, locales, terrenos)?</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${respuestas.inmuebles === 'si' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('inmuebles', 'si')}
              >
                Sí
              </button>
              <button
                className={`${styles.opcion} ${respuestas.inmuebles === 'no' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('inmuebles', 'no')}
              >
                No
              </button>
            </div>
          </div>

          {/* Pregunta 3: Cuentas */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay cuentas bancarias o inversiones?</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${respuestas.cuentas === 'si' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('cuentas', 'si')}
              >
                Sí
              </button>
              <button
                className={`${styles.opcion} ${respuestas.cuentas === 'no' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('cuentas', 'no')}
              >
                No
              </button>
            </div>
          </div>

          {/* Pregunta 4: Vehículos */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay vehículos (coches, motos, embarcaciones)?</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${respuestas.vehiculos === 'si' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('vehiculos', 'si')}
              >
                Sí
              </button>
              <button
                className={`${styles.opcion} ${respuestas.vehiculos === 'no' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('vehiculos', 'no')}
              >
                No
              </button>
            </div>
          </div>

          {/* Pregunta 5: Deudas */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay deudas conocidas (hipotecas, préstamos)?</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${respuestas.deudas === 'si' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('deudas', 'si')}
              >
                Sí
              </button>
              <button
                className={`${styles.opcion} ${respuestas.deudas === 'no' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('deudas', 'no')}
              >
                No
              </button>
            </div>
            {respuestas.deudas === 'si' && (
              <p className={styles.ayudaPregunta}>
                ⚠️ Si las deudas superan el valor de los bienes, considere la aceptación a beneficio de inventario o la renuncia.
              </p>
            )}
          </div>

          {/* Pregunta 6: Herederos */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Cuántos herederos hay?</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${respuestas.herederos === '1' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('herederos', '1')}
              >
                1 heredero
              </button>
              <button
                className={`${styles.opcion} ${respuestas.herederos === '2-3' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('herederos', '2-3')}
              >
                2-3 herederos
              </button>
              <button
                className={`${styles.opcion} ${respuestas.herederos === '4+' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('herederos', '4+')}
              >
                4 o más
              </button>
            </div>
          </div>

          {/* Pregunta 7: Menores */}
          <div className={styles.pregunta}>
            <label className={styles.preguntaLabel}>¿Hay herederos menores de edad o incapacitados?</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${respuestas.menores === 'si' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('menores', 'si')}
              >
                Sí
              </button>
              <button
                className={`${styles.opcion} ${respuestas.menores === 'no' ? styles.opcionActiva : ''}`}
                onClick={() => handleRespuesta('menores', 'no')}
              >
                No
              </button>
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

          {/* Barra de progreso */}
          <div className={styles.progresoContainer}>
            <div className={styles.progresoInfo}>
              <span>Progreso: {itemsMarcados.size} de {itemsChecklistFiltrados.length} documentos</span>
              <span className={styles.progresoPorcentaje}>{progresoChecklist}%</span>
            </div>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoChecklist}%` }}
              />
            </div>
          </div>

          {/* Checklist agrupado */}
          <div className={styles.checklistContainer}>
            {Object.entries(itemsPorCategoria).map(([categoria, items]) => (
              <div key={categoria} className={styles.categoriaChecklist}>
                <h3 className={styles.categoriaTitulo}>{nombreCategoria(categoria)}</h3>
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
                        />
                        <span className={styles.itemTexto}>{item.texto}</span>
                      </label>
                      {item.ayuda && (
                        <p className={styles.itemAyuda}>💡 {item.ayuda}</p>
                      )}
                      {item.donde && (
                        <p className={styles.itemDonde}>📍 <strong>Dónde obtenerlo:</strong> {item.donde}</p>
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
                    {paso.enlaces && (
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
              {index < PASOS_TIMELINE.length - 1 && (
                <div className={styles.lineaConexion} />
              )}
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
          <div className={`${styles.plazoCard} ${styles.plazoCritico}`}>
            <div className={styles.plazoIcono}>🔴</div>
            <h4>Impuesto de Sucesiones</h4>
            <p className={styles.plazoPeriodo}>6 MESES desde fallecimiento</p>
            <ul>
              <li>Prórroga: 6 meses más (solicitar antes del 5º mes)</li>
              <li>Retraso sin prórroga: recargo 5%-20% + intereses</li>
            </ul>
          </div>

          <div className={`${styles.plazoCard} ${styles.plazoCritico}`}>
            <div className={styles.plazoIcono}>🔴</div>
            <h4>Plusvalía Municipal</h4>
            <p className={styles.plazoPeriodo}>6 MESES desde fallecimiento</p>
            <ul>
              <li>Solo si hay inmuebles urbanos</li>
              <li>Sin posibilidad de prórroga</li>
            </ul>
          </div>

          <div className={`${styles.plazoCard} ${styles.plazoMedio}`}>
            <div className={styles.plazoIcono}>🟡</div>
            <h4>Seguros de Vida</h4>
            <p className={styles.plazoPeriodo}>5 AÑOS para reclamar</p>
            <ul>
              <li>Plazo de prescripción largo</li>
              <li>Consultar certificado de seguros</li>
            </ul>
          </div>

          <div className={`${styles.plazoCard} ${styles.plazoFlexible}`}>
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
          Estimación de costes basada en aranceles oficiales. Los importes finales pueden variar.
        </p>

        <div className={styles.costesGrid}>
          {/* Costes fijos */}
          <div className={styles.costeCard}>
            <h4>📋 Certificados (costes fijos)</h4>
            <table className={styles.tablaCoste}>
              <tbody>
                <tr>
                  <td>Certificado de defunción</td>
                  <td>~4€</td>
                </tr>
                <tr>
                  <td>Certificado de últimas voluntades</td>
                  <td>~4€</td>
                </tr>
                <tr>
                  <td>Certificado de seguros</td>
                  <td>~4€</td>
                </tr>
                <tr>
                  <td>Nota simple Registro Propiedad</td>
                  <td>~10€</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notaría */}
          <div className={styles.costeCard}>
            <h4>⚖️ Notaría (aranceles orientativos)</h4>
            <p className={styles.costeNota}>Según valor total de la herencia:</p>
            <table className={styles.tablaCoste}>
              <thead>
                <tr>
                  <th>Valor herencia</th>
                  <th>Coste aproximado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hasta 6.010€</td>
                  <td>~90€</td>
                </tr>
                <tr>
                  <td>30.000€</td>
                  <td>~200€</td>
                </tr>
                <tr>
                  <td>100.000€</td>
                  <td>~350€</td>
                </tr>
                <tr>
                  <td>200.000€</td>
                  <td>~450€</td>
                </tr>
                <tr>
                  <td>500.000€</td>
                  <td>~700€</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.costeAviso}>
              * Incluye escritura de aceptación y adjudicación.
              Sin testamento, añadir ~200-300€ por acta de herederos.
            </p>
          </div>

          {/* Registro */}
          <div className={styles.costeCard}>
            <h4>🏠 Registro de la Propiedad (si hay inmuebles)</h4>
            <p className={styles.costeNota}>Según valor de los inmuebles:</p>
            <table className={styles.tablaCoste}>
              <thead>
                <tr>
                  <th>Valor inmuebles</th>
                  <th>Coste aproximado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hasta 6.010€</td>
                  <td>~24€</td>
                </tr>
                <tr>
                  <td>50.000€</td>
                  <td>~100€</td>
                </tr>
                <tr>
                  <td>100.000€</td>
                  <td>~170€</td>
                </tr>
                <tr>
                  <td>200.000€</td>
                  <td>~250€</td>
                </tr>
                <tr>
                  <td>500.000€</td>
                  <td>~400€</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Impuestos */}
          <div className={styles.costeCard}>
            <h4>💰 Impuestos (usar calculadoras)</h4>
            <p className={styles.costeNota}>
              El importe del Impuesto de Sucesiones varía enormemente según la Comunidad Autónoma
              y el grado de parentesco.
            </p>
            <div className={styles.enlacesCalculadoras}>
              <Link href="/calculadora-sucesiones-nacional/" className={styles.enlaceCalculadora}>
                📊 Calculadora Sucesiones Nacional (14 CCAA)
              </Link>
              <Link href="/calculadora-sucesiones-cataluna/" className={styles.enlaceCalculadora}>
                📊 Calculadora Sucesiones Cataluña
              </Link>
            </div>
            <p className={styles.costeAviso}>
              * La Plusvalía Municipal depende del ayuntamiento y la antigüedad del inmueble.
            </p>
          </div>
        </div>
      </section>

      {/* Botón resetear */}
      <div className={styles.accionesContainer}>
        <button onClick={resetearTodo} className={styles.btnResetear}>
          🔄 Empezar de Nuevo
        </button>
        <p className={styles.ayudaResetear}>
          Esto borrará todas tus respuestas y el progreso del checklist
        </p>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre herencias?"
        subtitle="Conceptos clave, preguntas frecuentes y situaciones especiales"
      >
        <section className={styles.guideSection}>
          <h2>Guía Completa sobre Herencias en España</h2>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>📜 ¿Qué es el testamento?</h4>
              <p>
                Documento donde una persona expresa su voluntad sobre el reparto de sus bienes
                tras su fallecimiento. Puede ser abierto (ante notario), cerrado o ológrafo
                (escrito a mano).
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>⚖️ Herencia sin testamento (abintestato)</h4>
              <p>
                Si no hay testamento, la ley determina quiénes heredan según el orden:
                1º descendientes, 2º ascendientes, 3º cónyuge, 4º colaterales (hermanos, sobrinos),
                5º el Estado.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>👥 ¿Qué es la legítima?</h4>
              <p>
                Parte de la herencia que la ley reserva a los "herederos forzosos" (hijos,
                descendientes, ascendientes, cónyuge). En derecho común es 2/3 de la herencia
                para los hijos.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>💒 Usufructo del cónyuge viudo</h4>
              <p>
                El cónyuge viudo tiene derecho al usufructo (uso y disfrute) de parte de la
                herencia: 1/3 si hay hijos, 1/2 si heredan ascendientes, o 2/3 si no hay
                descendientes ni ascendientes.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>💸 ¿Se heredan las deudas?</h4>
              <p>
                Sí, al aceptar una herencia se asumen también las deudas. Por eso existe la
                "aceptación a beneficio de inventario": solo se pagan deudas hasta donde
                alcancen los bienes heredados.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>❌ Renuncia a la herencia</h4>
              <p>
                Se puede renunciar a una herencia (por ejemplo, si hay más deudas que bienes).
                La renuncia es irrevocable y debe hacerse ante notario. Si renuncias, tu parte
                pasa a los demás herederos.
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Cuánto tarda tramitar una herencia?</summary>
              <p>
                Depende de la complejidad, pero típicamente entre <strong>3 y 6 meses</strong>.
                Si hay conflictos entre herederos o bienes en el extranjero, puede alargarse
                considerablemente.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Necesito abogado para tramitar una herencia?</summary>
              <p>
                No es obligatorio legalmente, pero es <strong>muy recomendable</strong> en herencias
                complejas (varios herederos, inmuebles, empresa familiar, conflictos). Un abogado
                o gestor puede agilizar mucho el proceso.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo acceder a las cuentas del fallecido?</summary>
              <p>
                No directamente. Las cuentas quedan <strong>bloqueadas</strong> hasta que se presente
                la escritura de adjudicación de herencia y el justificante del pago del Impuesto
                de Sucesiones.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué pasa si un heredero no quiere firmar?</summary>
              <p>
                Si un heredero se niega a participar en la partición, los demás pueden acudir a un
                <strong>contador-partidor judicial</strong> para realizar el reparto. Es un proceso
                más largo y costoso.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo vender un inmueble heredado antes de inscribirlo?</summary>
              <p>
                Técnicamente sí, pero el comprador no podrá inscribirlo a su nombre hasta que tú
                lo hayas inscrito primero. La mayoría de compradores exigirán que esté
                <strong>previamente inscrito</strong>.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué diferencia hay entre heredero y legatario?</summary>
              <p>
                El <strong>heredero</strong> recibe una parte proporcional del patrimonio (incluyendo deudas).
                El <strong>legatario</strong> recibe un bien concreto especificado en el testamento,
                sin responsabilidad sobre las deudas.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="guia-tramitacion-herencias" />
    </div>
  );
}
