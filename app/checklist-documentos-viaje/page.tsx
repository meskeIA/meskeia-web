'use client';

import { useState, useMemo } from 'react';
import styles from './ChecklistDocumentosViaje.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TipoViaje = 'espana' | 'europa' | 'internacional';

interface ItemBase {
  id: string;
  nombre: string;
  nota?: string;
  viajes: TipoViaje[]; // vacío = aplica a todos
}

interface ItemChecklist extends ItemBase {
  checked: boolean;
}

interface CategoriaConfig {
  titulo: string;
  icono: string;
  items: ItemBase[];
}

const CATEGORIAS: CategoriaConfig[] = [
  {
    titulo: 'Identidad y documentación oficial',
    icono: '🪪',
    items: [
      { id: 'dni', nombre: 'DNI en vigor', viajes: [] },
      { id: 'pasaporte', nombre: 'Pasaporte en vigor (mín. 6 meses de validez)', nota: 'Necesario fuera de la UE', viajes: ['europa', 'internacional'] },
      { id: 'fotocopia-docs', nombre: 'Fotocopia de documentos guardada aparte del original', viajes: [] },
      { id: 'foto-pasaporte', nombre: 'Foto tamaño pasaporte (2 copias)', nota: 'Para trámites de emergencia', viajes: ['internacional'] },
      { id: 'carnet-conducir', nombre: 'Carnet de conducir internacional', nota: 'Si vas a conducir en el destino', viajes: ['internacional'] },
      { id: 'carnet-conducir-eu', nombre: 'Carnet de conducir (válido en UE)', viajes: ['europa'] },
    ],
  },
  {
    titulo: 'Visados y autorizaciones de entrada',
    icono: '📋',
    items: [
      { id: 'visado', nombre: 'Visado del país de destino impreso o descargado', nota: 'Consulta el consulado del país', viajes: ['internacional'] },
      { id: 'etias', nombre: 'ETIAS o autorización equivalente', nota: 'Para entrada a algunos países fuera de UE', viajes: ['internacional'] },
      { id: 'autorizacion-entrada', nombre: 'Autorización electrónica de viaje (ETA, ESTA, etc.)', viajes: ['internacional'] },
    ],
  },
  {
    titulo: 'Sanidad y seguros',
    icono: '🏥',
    items: [
      { id: 'tse', nombre: 'Tarjeta Sanitaria Europea (TSE)', nota: 'Cubre asistencia médica básica en la UE', viajes: ['europa'] },
      { id: 'seguro-viaje', nombre: 'Seguro de viaje con cobertura médica contratado', viajes: ['europa', 'internacional'] },
      { id: 'poliza-seguro', nombre: 'Póliza del seguro impresa o en el móvil', viajes: ['europa', 'internacional'] },
      { id: 'telefono-asistencia', nombre: 'Número de asistencia en viaje 24h guardado', viajes: [] },
      { id: 'cobertura-repatriacion', nombre: 'Cobertura de repatriación confirmada', viajes: ['internacional'] },
    ],
  },
  {
    titulo: 'Transporte',
    icono: '✈️',
    items: [
      { id: 'billete', nombre: 'Billetes de avión / tren / autobús impresos o descargados offline', viajes: [] },
      { id: 'tarjeta-embarque', nombre: 'Tarjeta de embarque descargada', viajes: ['europa', 'internacional'] },
      { id: 'reserva-coche', nombre: 'Confirmación de coche de alquiler', viajes: [] },
      { id: 'transfer', nombre: 'Transfer o traslado al aeropuerto reservado', viajes: ['europa', 'internacional'] },
      { id: 'transporte-local', nombre: 'Bono de transporte local o abono descargado', viajes: [] },
    ],
  },
  {
    titulo: 'Alojamiento',
    icono: '🏨',
    items: [
      { id: 'confirmacion-hotel', nombre: 'Confirmación de hotel / apartamento impresa', viajes: [] },
      { id: 'direccion-offline', nombre: 'Dirección del alojamiento guardada sin internet', viajes: [] },
      { id: 'telefono-hotel', nombre: 'Teléfono del alojamiento guardado', viajes: [] },
      { id: 'horario-checkin', nombre: 'Horario de check-in / check-out verificado', viajes: [] },
    ],
  },
  {
    titulo: 'Salud y medicamentos',
    icono: '💊',
    items: [
      { id: 'medicamentos', nombre: 'Medicamentos habituales en cantidad suficiente', viajes: [] },
      { id: 'receta', nombre: 'Receta médica o informe en inglés (enfermedades crónicas)', viajes: ['europa', 'internacional'] },
      { id: 'vacunas', nombre: 'Vacunas requeridas o recomendadas para el destino', viajes: ['internacional'] },
      { id: 'certificado-vacunas', nombre: 'Certificado de vacunación (cartilla amarilla)', viajes: ['internacional'] },
      { id: 'botiquin', nombre: 'Botiquín básico (tiritas, analgésicos, antidiarreico)', viajes: [] },
      { id: 'repelente', nombre: 'Repelente de mosquitos y protector solar', nota: 'Si el destino lo requiere', viajes: ['internacional'] },
    ],
  },
  {
    titulo: 'Dinero y finanzas',
    icono: '💳',
    items: [
      { id: 'efectivo', nombre: 'Efectivo en moneda local del destino', viajes: [] },
      { id: 'tarjeta-credito', nombre: 'Tarjeta de crédito / débito internacional', viajes: [] },
      { id: 'tarjeta-emergencia', nombre: 'Tarjeta de emergencia (cuenta diferente)', viajes: [] },
      { id: 'bloqueo-tarjetas', nombre: 'Número de bloqueo de tarjetas guardado', viajes: [] },
      { id: 'divisa', nombre: 'Cambio de divisa realizado antes de salir', viajes: ['internacional'] },
      { id: 'aviso-banco', nombre: 'Banco avisado del viaje (para evitar bloqueo de tarjeta)', viajes: ['europa', 'internacional'] },
    ],
  },
  {
    titulo: 'Contactos de emergencia',
    icono: '📞',
    items: [
      { id: 'contacto-familiar', nombre: 'Contacto de emergencia familiar guardado y notificado', viajes: [] },
      { id: 'embajada', nombre: 'Número de la embajada o consulado español en el destino', viajes: ['europa', 'internacional'] },
      { id: 'asistencia-carretera', nombre: 'Número de asistencia en carretera', viajes: [] },
      { id: 'policia-local', nombre: 'Número de policía local del destino', viajes: ['europa', 'internacional'] },
    ],
  },
];

const TIPO_CONFIG: Record<TipoViaje, { label: string; desc: string; icono: string }> = {
  espana: { label: 'España', desc: 'Viaje nacional', icono: '🇪🇸' },
  europa: { label: 'Europa', desc: 'Dentro de la UE', icono: '🇪🇺' },
  internacional: { label: 'Internacional', desc: 'Fuera de Europa', icono: '🌍' },
};

export default function ChecklistDocumentosViajePage() {
  const [tipoViaje, setTipoViaje] = useState<TipoViaje>('europa');
  const [itemsChecked, setItemsChecked] = useState<Record<string, boolean>>({});

  // Items filtrados por tipo de viaje
  const categoriasFiltradas = useMemo(() =>
    CATEGORIAS.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.viajes.length === 0 || item.viajes.includes(tipoViaje)
      ),
    })).filter(cat => cat.items.length > 0),
    [tipoViaje]
  );

  const todosLosItems = useMemo(() =>
    categoriasFiltradas.flatMap(cat => cat.items),
    [categoriasFiltradas]
  );

  const totalItems = todosLosItems.length;
  const itemsCompletados = todosLosItems.filter(item => itemsChecked[item.id]).length;
  const porcentaje = totalItems > 0 ? Math.round((itemsCompletados / totalItems) * 100) : 0;
  const todoCompleto = itemsCompletados === totalItems && totalItems > 0;

  const toggleItem = (id: string) => {
    setItemsChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const marcarTodos = (valor: boolean) => {
    const nuevos: Record<string, boolean> = {};
    todosLosItems.forEach(item => { nuevos[item.id] = valor; });
    setItemsChecked(prev => ({ ...prev, ...nuevos }));
  };

  const cambiarTipo = (tipo: TipoViaje) => {
    setTipoViaje(tipo);
    setItemsChecked({});
  };

  const descargarChecklist = () => {
    const lineas: string[] = [
      `CHECKLIST DE DOCUMENTOS DE VIAJE`,
      `Tipo: ${TIPO_CONFIG[tipoViaje].label} — ${TIPO_CONFIG[tipoViaje].desc}`,
      `Progreso: ${itemsCompletados}/${totalItems} (${porcentaje}%)`,
      `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
      '',
    ];

    categoriasFiltradas.forEach(cat => {
      lineas.push(`\n${cat.icono} ${cat.titulo.toUpperCase()}`);
      lineas.push('─'.repeat(40));
      cat.items.forEach(item => {
        const estado = itemsChecked[item.id] ? '[✓]' : '[ ]';
        lineas.push(`${estado} ${item.nombre}`);
        if (item.nota) lineas.push(`     → ${item.nota}`);
      });
    });

    lineas.push('\n\nGenerado con meskeIA — meskeia.com');

    const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-documentos-viaje-${tipoViaje}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📋 Documentos de Viaje</h1>
        <p className={styles.subtitle}>Checklist personalizada para no olvidar nada antes de salir</p>
      </header>

      <LegalNotice />

      {/* Selector de tipo de viaje */}
      <div className={styles.tipoBar}>
        {(Object.entries(TIPO_CONFIG) as [TipoViaje, typeof TIPO_CONFIG[TipoViaje]][]).map(([tipo, cfg]) => (
          <button
            key={tipo}
            onClick={() => cambiarTipo(tipo)}
            className={`${styles.tipoBtn} ${tipoViaje === tipo ? styles.active : ''}`}
            aria-pressed={tipoViaje === tipo}
          >
            <span className={styles.tipoIcon}>{cfg.icono}</span>
            <span className={styles.tipoLabel}>{cfg.label}</span>
            <span className={styles.tipoDesc}>{cfg.desc}</span>
          </button>
        ))}
      </div>

      {/* Barra de progreso */}
      <div className={`${styles.progresoWrapper} ${todoCompleto ? styles.progresoCompleto : ''}`}>
        <div className={styles.progresoHeader}>
          <span className={styles.progresoTexto}>
            {todoCompleto ? '✅ ¡Todo listo para el viaje!' : `${itemsCompletados} de ${totalItems} documentos verificados`}
          </span>
          <span className={styles.progresoPorcentaje}>{porcentaje}%</span>
        </div>
        <div className={styles.progresoBar}>
          <div className={styles.progresoFill} style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className={styles.acciones}>
        <button onClick={() => marcarTodos(true)} className={styles.btnAccion}>
          ✓ Marcar todo
        </button>
        <button onClick={() => marcarTodos(false)} className={styles.btnAccion}>
          ✗ Desmarcar todo
        </button>
        <button onClick={descargarChecklist} className={styles.btnDescargar}>
          ⬇️ Descargar lista
        </button>
      </div>

      {/* Mensaje completo */}
      {todoCompleto && (
        <div className={styles.mensajeCompleto} role="alert">
          <h2>🎒 ¡Todo en orden!</h2>
          <p>Tienes todos los documentos preparados para tu viaje a {TIPO_CONFIG[tipoViaje].label}. ¡Buen viaje!</p>
        </div>
      )}

      {/* Checklist por categorías */}
      <div className={styles.checklist}>
        {categoriasFiltradas.map(cat => {
          const completadosCat = cat.items.filter(item => itemsChecked[item.id]).length;
          return (
            <div key={cat.titulo} className={styles.categoriaBloque}>
              <div className={styles.categoriaHeader}>
                <span className={styles.categoriaIcon} aria-hidden="true">{cat.icono}</span>
                <h2 className={styles.categoriaTitulo}>{cat.titulo}</h2>
                <span className={styles.categoriaProgreso}>{completadosCat}/{cat.items.length}</span>
              </div>
              <ul className={styles.itemsLista}>
                {cat.items.map(item => (
                  <li
                    key={item.id}
                    className={`${styles.item} ${itemsChecked[item.id] ? styles.itemChecked : ''}`}
                    onClick={() => toggleItem(item.id)}
                    role="checkbox"
                    aria-checked={!!itemsChecked[item.id]}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? toggleItem(item.id) : undefined}
                  >
                    <span className={styles.checkbox} aria-hidden="true">
                      {itemsChecked[item.id] ? '✓' : ''}
                    </span>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemNombre}>{item.nombre}</span>
                      {item.nota && <p className={styles.itemNota}>{item.nota}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Guía completa de documentos para viajar"
        subtitle="Todo lo que necesitas saber sobre documentación, visados, seguros y preparación documental para viajes desde España"
        icon="📋"
      >
        {/* 1. Tabla Comparativa */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Documentos necesarios por tipo de destino</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>España 🇪🇸</th>
                  <th>Schengen 🇪🇺</th>
                  <th>UK 🇬🇧</th>
                  <th>EEUU/Canadá 🌎</th>
                  <th>País con visado 🌍</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DNI en vigor</td>
                  <td className={styles.cellSi}>✓</td>
                  <td className={styles.cellSi}>✓</td>
                  <td className={styles.cellNo}>✗ (desde 2021)</td>
                  <td className={styles.cellNo}>✗</td>
                  <td className={styles.cellNo}>✗</td>
                </tr>
                <tr>
                  <td>Pasaporte (mín. 6 meses validez tras retorno)</td>
                  <td className={styles.cellNo}>No necesario</td>
                  <td className={styles.cellOpcional}>Opcional</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                </tr>
                <tr>
                  <td>Visado</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>No (ciudadano UE)</td>
                  <td className={styles.cellNo}>No (estancia {'<'}6 meses)</td>
                  <td className={styles.cellOpcional}>ESTA 21 $ / eTA 7 CAD</td>
                  <td className={styles.cellSi}>✓ Consultar embajada</td>
                </tr>
                <tr>
                  <td>Seguro de viaje</td>
                  <td className={styles.cellNo}>Recomendado</td>
                  <td className={styles.cellOpcional}>Recomendado</td>
                  <td className={styles.cellSi}>Muy recomendado</td>
                  <td className={styles.cellSi}>Imprescindible</td>
                  <td className={styles.cellSi}>✓ Obligatorio Schengen</td>
                </tr>
                <tr>
                  <td>TSE (Tarjeta Sanitaria Europea)</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellSi}>✓ Gratuita</td>
                  <td className={styles.cellNo}>No válida desde Brexit</td>
                  <td className={styles.cellNo}>No válida</td>
                  <td className={styles.cellNo}>No válida</td>
                </tr>
                <tr>
                  <td>Documentos para menores</td>
                  <td className={styles.cellOpcional}>DNI propio</td>
                  <td className={styles.cellSi}>DNI o pasaporte propio</td>
                  <td className={styles.cellSi}>Pasaporte propio</td>
                  <td className={styles.cellSi}>Pasaporte + autorización</td>
                  <td className={styles.cellSi}>Pasaporte + autorización notarial</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de Uso */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Perfiles de viajero: qué necesita cada uno</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <strong>Viajero frecuente de negocios a Europa</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: vuelos mensuales a Alemania, Francia o Italia.</p>
              <ul>
                <li>DNI vigente suficiente para toda la zona Schengen</li>
                <li>TSE en el móvil (app del Ministerio de Sanidad)</li>
                <li>Seguro de viaje anual multidestino (más económico)</li>
                <li>Pasaporte recomendado por si hay escalas fuera de UE</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Activa las notificaciones de caducidad del DNI; en viajes de negocios no hay tiempo para renovar con urgencia.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧‍👦</span>
                <strong>Familia con niños al extranjero</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: vacaciones en verano a EEUU con 2 hijos menores.</p>
              <ul>
                <li>Pasaporte propio para cada menor (incluso bebés)</li>
                <li>ESTA para cada miembro de la familia (21 $ por persona)</li>
                <li>Autorización notarial si viaja con un solo progenitor</li>
                <li>Seguro con cobertura pediátrica y repatriación</li>
                <li>Certificados de vacunación actualizados</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: El pasaporte de menores dura solo 5 años (frente a 10 de adultos). Revisa la caducidad con 6 meses de antelación.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎒</span>
                <strong>Joven que viaja a EEUU por primera vez</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: viaje de mochilero de 3 semanas por la Costa Este.</p>
              <ul>
                <li>Pasaporte con mínimo 6 meses de validez tras la fecha de retorno</li>
                <li>ESTA aprobada antes de volar (tramitar con 72h de antelación mínimo, cuesta 21 $)</li>
                <li>Seguro médico internacional con cobertura de al menos 30.000 $ (EEUU es caro)</li>
                <li>Fotocopia del pasaporte y ESTA en papel y en la nube</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Si tienes antecedentes penales o has visitado Cuba, Irán, Corea del Norte o Siria desde 2011, el ESTA puede denegarse; en ese caso necesitarás visado B-2.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧓</span>
                <strong>Mayor de 65 años viajando fuera de la UE</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: crucero por el Mediterráneo con escala en Marruecos y Turquía.</p>
              <ul>
                <li>Pasaporte en vigor (revisarlo con 9 meses de antelación)</li>
                <li>Informe médico en inglés para condiciones crónicas</li>
                <li>Lista de medicamentos habituales con nombre genérico internacional</li>
                <li>Seguro con cobertura de enfermedades preexistentes (cláusula específica)</li>
                <li>Registro en el consulado español del país de destino</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Registrarse en el Registro de Viajeros del MAEC (maec.es) permite que la embajada española te localice en caso de emergencia o catástrofe.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Preguntas frecuentes</h4>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Puedo viajar a Europa con el DNI o necesito pasaporte?</dt>
              <dd>
                Con el DNI español en vigor puedes viajar a todos los países del espacio Schengen (27 países de la UE más Noruega, Islandia, Suiza y Liechtenstein) sin necesidad de pasaporte. Sin embargo, si tienes escala en un país fuera del área Schengen, el aeropuerto puede exigirte pasaporte para transitar. El pasaporte es siempre más seguro como documento de viaje.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuándo se considera que el pasaporte está caducado para viajar?</dt>
              <dd>
                Muchos países exigen que el pasaporte tenga al menos 6 meses de validez contados desde la fecha de <strong>retorno</strong>, no desde la salida. Por ejemplo, si vuelves el 15 de agosto, tu pasaporte debe caducar después del 15 de febrero del año siguiente. Algunos destinos europeos solo exigen validez hasta la fecha de regreso, pero es mejor contar con el margen de 6 meses para cualquier destino.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es la Tarjeta Sanitaria Europea (TSE) y dónde tiene cobertura?</dt>
              <dd>
                La TSE es una tarjeta gratuita que puedes solicitar a través de la app del Ministerio de Sanidad o en tu comunidad autónoma. Cubre la asistencia médica pública básica en los 27 países de la UE más Noruega, Islandia, Liechtenstein y Suiza, en las mismas condiciones que los ciudadanos del país visitado. <strong>No cubre</strong> el regreso en ambulancia, ni atención en clínicas privadas, ni tratamientos programados. Desde el Brexit en enero de 2021, no es válida en el Reino Unido.
                <span className={styles.faqTip}>Consejo: La TSE no sustituye a un seguro de viaje. Úsala como complemento.</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Necesito visado para viajar a EEUU siendo español?</dt>
              <dd>
                No necesitas visado convencional, pero sí debes tramitar la <strong>ESTA</strong> (Electronic System for Travel Authorization) antes de volar. La ESTA cuesta <strong>21 USD</strong>, se tramita en línea en la web oficial (esta.cbp.dhs.gov) y suele aprobarse en minutos, aunque conviene hacerla con al menos 72 horas de antelación. Es válida 2 años para múltiples entradas de hasta 90 días. Para Canadá, la autorización equivalente es el <strong>eTA</strong> (7 CAD).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo tramitar el pasaporte con urgencia?</dt>
              <dd>
                Puedes solicitar cita urgente en cualquier Comisaría de Policía Nacional con servicio de expedición de pasaportes. En casos de emergencia acreditada (vuelo en menos de 48-72 horas), muchas comisarías atienden sin cita previa. Necesitarás DNI en vigor, fotografía reciente en fondo blanco (32x26 mm) y el pago de la tasa (30 €). El pasaporte urgente se tramita en el mismo día o en 24 horas.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué documentación necesita un menor que viaja sin ambos progenitores?</dt>
              <dd>
                Si el menor viaja solo con uno de los progenitores o con terceros (abuelos, tíos, etc.), es muy recomendable llevar una <strong>autorización notarial</strong> firmada por el progenitor ausente, con apostilla si se viaja fuera de la UE. Algunos países (México, Costa Rica, Brasil) la exigen expresamente en aduana. También se recomienda llevar el libro de familia o certificado de nacimiento. Si los padres tienen la guardia exclusiva, sentencia judicial incluida.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué seguro de viaje es obligatorio para obtener un visado Schengen?</dt>
              <dd>
                Para obtener el visado Schengen (requisito para ciudadanos de países que lo necesitan), el seguro de viaje debe tener una cobertura médica mínima de <strong>30.000 €</strong>, incluir repatriación y ser válido en todos los países del espacio Schengen durante toda la estancia. El seguro debe presentarse junto con la solicitud de visado. Los ciudadanos españoles no necesitan visado Schengen, pero sí se les recomienda llevar seguro de viaje equivalente.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué documentos conviene llevar en papel y cuáles en digital?</dt>
              <dd>
                <strong>Siempre en papel:</strong> pasaporte/DNI original, tarjeta de embarque, póliza del seguro, reserva del hotel, datos del visado. <strong>También en digital (descargados offline):</strong> fotocopia del pasaporte, confirmación del seguro con número de asistencia, billete de vuelo de retorno, ESTA o visado. <strong>En la nube (acceso de emergencia):</strong> escaneados del pasaporte, seguro, ESTA y contactos de embajada. La clave es tener dos copias siempre: una física y una digital accesible sin internet.
              </dd>
            </div>
          </dl>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Preparación documental: de 3 meses al día de salida</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>3 meses antes: Verifica la validez de todos los documentos</strong>
                <p>Comprueba la fecha de caducidad del pasaporte y el DNI. Recuerda la regla de los 6 meses: el pasaporte debe ser válido hasta 6 meses después de tu fecha de retorno. Si caduca antes, solicita renovación ya; los plazos en temporada alta pueden superar las 4-6 semanas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>2 meses antes: Tramita visados y autorizaciones electrónicas</strong>
                <p>Consulta si tu destino requiere visado en el portal del MAEC (exteriores.gob.es). Tramita la ESTA para EEUU (21 $), el eTA para Canadá (7 CAD) u otras autorizaciones. Los visados convencionales pueden tardar 4-8 semanas. Solicita la TSE si viajas por Europa y aún no la tienes.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>6 semanas antes: Contrata el seguro de viaje</strong>
                <p>Elige un seguro con cobertura médica mínima de 30.000 € para Europa y 100.000 € para EEUU. Verifica que incluya repatriación, asistencia 24h y cobertura de equipaje. Guarda el número de asistencia en el móvil. Si tienes condiciones médicas preexistentes, asegúrate de que estén cubiertas explícitamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>2 semanas antes: Prepara copias y documentos de emergencia</strong>
                <p>Escanea todos los documentos (pasaporte, seguro, visado, billetes) y guárdalos en un correo electrónico o servicio en la nube. Haz fotocopias físicas para guardar separadas de los originales. Escribe en papel los contactos clave: embajada española, asistencia del seguro, número de bloqueo de tarjetas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>1 semana antes: Avisos y preparativos finales</strong>
                <p>Avisa a tu banco del viaje para evitar bloqueos de tarjeta. Cambia divisas o asegúrate de que tu tarjeta no cobre comisiones por uso en el extranjero. Registra el viaje en el portal del MAEC si viajas a zonas de riesgo. Descarga los billetes, tarjetas de embarque y documentos en el móvil para acceso offline.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>La noche anterior: Revisión final del checklist</strong>
                <p>Usa esta herramienta para repasar todos los documentos según el tipo de viaje. Coloca los documentos más importantes (pasaporte, tarjeta de embarque, seguro) en la parte accesible del equipaje de mano. Nunca metas el pasaporte en la maleta facturada.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>En el aeropuerto: Verificación antes de embarcar</strong>
                <p>Llega con tiempo suficiente (2h para vuelos nacionales/europeos, 3h para intercontinentales). Ten a mano el pasaporte y la tarjeta de embarque desde que entras al aeropuerto. En algunos vuelos de bajo coste comprueban el billete ya en la cola de facturación. Si tu destino requiere formulario de entrada (como EEUU), cumplimenta el I-94 o el formulario digital antes de llegar.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Mejores Prácticas */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>6 mejores prácticas para viajeros experimentados</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📄</span>
              <div>
                <strong>Fotocopias siempre separadas de los originales</strong>
                <p>Guarda una fotocopia de todos tus documentos en casa (en poder de un familiar) y otra en el equipaje separada de los originales. Si pierdes el pasaporte, la fotocopia agiliza enormemente el trámite en el consulado.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>☁️</span>
              <div>
                <strong>Copias digitales en la nube accesibles sin contraseña</strong>
                <p>Envíate por correo electrónico los escaneados de pasaporte, seguro, ESTA y reservas. También puedes usar Google Drive o iCloud. Lo importante es que puedas acceder desde cualquier dispositivo aunque pierdas el móvil.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏛️</span>
              <div>
                <strong>Regístrate en el consulado para viajes de más de 2 semanas</strong>
                <p>El Registro de Viajeros del Ministerio de Asuntos Exteriores (maec.es) es gratuito y permite que la embajada española te localice en caso de emergencia, catástrofe natural o conflicto armado. Especialmente importante en destinos de riesgo medio o alto.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📞</span>
              <div>
                <strong>Guarda los contactos de la embajada española</strong>
                <p>El teléfono de asistencia a españoles en el extranjero del MAEC es el <strong>+34 913 94 21 00</strong> (disponible 24h). También puedes consultar el directorio de embajadas en exteriores.gob.es antes de salir y guardar el número específico del país de destino.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💳</span>
              <div>
                <strong>Diversifica los métodos de pago</strong>
                <p>Lleva siempre al menos dos tarjetas de dos bancos diferentes, más algo de efectivo en moneda local. El número de bloqueo de tarjetas (en el reverso o en la app del banco) debe estar guardado por separado del wallet. Tarjetas como Revolut o Wise no cobran comisiones en el extranjero.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <div>
                <strong>Crea alertas de caducidad en el calendario</strong>
                <p>Añade una alerta recurrente anual en tu calendario para revisar las fechas de caducidad del pasaporte, DNI y TSE. El pasaporte se renueva cada 10 años (adultos) o 5 años (menores de 30). El DNI, cada 10 años para adultos. La TSE tiene su propia caducidad indicada en la tarjeta.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Warning Box */}
        <section className={styles.eduSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 errores que te impiden embarcar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Pasaporte con menos de 6 meses de validez tras la fecha de retorno.</strong> Las aerolíneas y los agentes de inmigración de muchos países (EEUU, Tailandia, Japón, Emiratos...) pueden impedirte embarcar o entrar al país aunque tu vuelo sea dentro del plazo legal. Verifica siempre la fecha de retorno, no la de salida.
              </li>
              <li>
                <strong>DNI caducado en un destino europeo que lo acepta.</strong> Algunos países del área Schengen aceptan DNI españoles con hasta 5 años de antigüedad (período transitorio para ciertos países), pero la inmensa mayoría exigen el DNI en vigor. Un DNI caducado puede suponer la denegación de embarque desde el propio aeropuerto español.
              </li>
              <li>
                <strong>Olvidar la TSE antes de un viaje por Europa.</strong> Si necesitas atención médica en Europa sin TSE, pagarás como turista privado (consulta de médico de cabecera en Alemania: 30-60 €, urgencias hospitalarias: cientos de euros). La TSE se tramita gratis en minutos por la app del Ministerio de Sanidad.
              </li>
              <li>
                <strong>Menor que viaja sin autorización notarial.</strong> En muchos países latinoamericanos (México, Costa Rica, Brasil, Colombia) es obligatorio presentar autorización notarial del progenitor ausente. Sin ella, el menor puede ser retenido en aduana e impedirle la entrada. La autorización debe estar apostillada si viaja fuera de la UE.
              </li>
              <li>
                <strong>Seguro de viaje sin cobertura médica suficiente para el visado Schengen.</strong> Si tramitas visado Schengen, el seguro debe cubrir mínimo 30.000 € y ser válido en todo el espacio Schengen. Un seguro insuficiente puede suponer la denegación del visado directamente. Para EEUU, donde un día de hospitalización puede superar los 3.000 $, se recomienda cobertura de al menos 100.000 €.
              </li>
              <li>
                <strong>No tramitar la ESTA con suficiente antelación antes de volar a EEUU.</strong> Aunque la ESTA suele aprobarse en minutos, puede retrasarse o denegarse. Tramitarla el mismo día del vuelo es un riesgo innecesario. Hazla con mínimo 72 horas de antelación. Si se deniega, necesitarás solicitar un visado B-2 en el consulado americano, proceso que tarda semanas.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('checklist-documentos-viaje')} />
      <ShareCard appName="checklist-documentos-viaje" />
      <Footer appName="checklist-documentos-viaje" />
    </div>
  );
}
