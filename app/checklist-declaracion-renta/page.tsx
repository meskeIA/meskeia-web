'use client';

import { useState, useMemo } from 'react';
import styles from './ChecklistDeclaracionRenta.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatDate } from '@/lib';

// ──────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────
type Perfil = 'asalariado' | 'autonomo' | 'pensionista' | 'inversor' | 'arrendador';

interface ItemBase {
  id: string;
  nombre: string;
  nota?: string;
  perfiles: Perfil[]; // vacío = aplica a todos los perfiles
  obligatorio?: boolean; // true = imprescindible, false = si aplica
}

interface CategoriaConfig {
  titulo: string;
  icono: string;
  perfilesRelevantes: Perfil[]; // vacío = relevante siempre
  items: ItemBase[];
}

// ──────────────────────────────────────────
// FECHAS CLAVE
// ──────────────────────────────────────────
const FECHAS_CLAVE = [
  { fecha: '8 abr', evento: 'Apertura Renta Web (presentación online)', icono: '💻' },
  { fecha: '6 may', evento: 'Inicio cita telefónica con Agencia Tributaria', icono: '📞' },
  { fecha: '1 jun', evento: 'Inicio presentación presencial en oficinas', icono: '🏢' },
  { fecha: '25 jun', evento: 'Último día para domiciliar devoluciones', icono: '🏦' },
  { fecha: '30 jun', evento: 'Fin del plazo — cierre de la campaña', icono: '🔔' },
];

// ──────────────────────────────────────────
// PERFILES
// ──────────────────────────────────────────
const PERFILES_CONFIG: Record<Perfil, { label: string; icono: string; desc: string }> = {
  asalariado: { label: 'Asalariado', icono: '👔', desc: 'Empleado por cuenta ajena' },
  autonomo: { label: 'Autónomo', icono: '🧾', desc: 'Actividad económica propia' },
  pensionista: { label: 'Pensionista', icono: '🏦', desc: 'Pensión o prestación SS' },
  inversor: { label: 'Inversor', icono: '📈', desc: 'Acciones, fondos, intereses' },
  arrendador: { label: 'Propietario', icono: '🏠', desc: 'Alquila un inmueble' },
};

// ──────────────────────────────────────────
// CHECKLIST
// ──────────────────────────────────────────
const CATEGORIAS: CategoriaConfig[] = [
  {
    titulo: 'Datos personales y acceso',
    icono: '🪪',
    perfilesRelevantes: [],
    items: [
      { id: 'dni', nombre: 'DNI/NIF en vigor', nota: 'Necesario para identificarte en Renta Web', perfiles: [], obligatorio: true },
      { id: 'iban', nombre: 'Número de cuenta IBAN para devolución o domiciliación', nota: 'Del banco donde quieres recibir la devolución o cargar el pago', perfiles: [], obligatorio: true },
      { id: 'borrador', nombre: 'Borrador descargado desde Renta Web (sede.agenciatributaria.gob.es)', nota: 'Disponible desde el 8 de abril con los datos que la AEAT tiene de ti', perfiles: [], obligatorio: true },
      { id: 'cl-pin', nombre: 'Acceso a Renta Web (Cl@ve PIN, certificado digital o DNI electrónico)', nota: 'Si no tienes Cl@ve, actívala antes del 8 de abril', perfiles: [], obligatorio: true },
      { id: 'empadronamiento', nombre: 'Certificado de empadronamiento si cambió de domicilio en 2025', nota: 'Solo si te mudaste durante el año', perfiles: [] },
      { id: 'hijos-datos', nombre: 'NIF de hijos a cargo menores de 25 años', nota: 'Para aplicar el mínimo por descendientes', perfiles: [] },
      { id: 'conyuge-nif', nombre: 'NIF del cónyuge si presentas declaración conjunta', nota: 'También necesitarás su autorización', perfiles: [] },
      { id: 'discapacidad', nombre: 'Certificado de discapacidad (propia o de familiar a cargo)', nota: 'Para aplicar el mínimo por discapacidad', perfiles: [] },
    ],
  },
  {
    titulo: 'Rendimientos del trabajo',
    icono: '💼',
    perfilesRelevantes: ['asalariado'],
    items: [
      { id: 'cert-retencion', nombre: 'Certificado de retenciones e ingresos del trabajo (empresa principal)', nota: 'Tu empresa está obligada a entregártelo antes de que abra la campaña', perfiles: ['asalariado'], obligatorio: true },
      { id: 'cert-retencion-2', nombre: 'Certificado de retenciones de otros empleadores (si tuviste varios en 2025)', nota: 'Necesario si cambiaste de empresa o tuviste varios empleos simultáneos', perfiles: ['asalariado'] },
      { id: 'sepe-cert', nombre: 'Certificado del SEPE si cobraste prestación por desempleo', nota: 'Descargable desde la sede electrónica del SEPE', perfiles: ['asalariado'] },
      { id: 'finiquito', nombre: 'Carta de despido o finiquito si recibiste indemnización', nota: 'La parte exenta de IRPF depende del tipo de extinción del contrato', perfiles: ['asalariado'] },
      { id: 'horas-extra', nombre: 'Justificante de horas extras o complementos si no aparecen en el certificado', perfiles: ['asalariado'] },
      { id: 'dietas-cert', nombre: 'Justificante de dietas exentas si la empresa te abonó dietas', nota: 'Solo la parte que supere los límites legales tributa', perfiles: ['asalariado'] },
    ],
  },
  {
    titulo: 'Actividad económica (autónomo)',
    icono: '🧾',
    perfilesRelevantes: ['autonomo'],
    items: [
      { id: 'libros-ingresos', nombre: 'Libro de registro de ingresos (facturas emitidas 2025)', nota: 'Obligatorio para actividades en estimación directa', perfiles: ['autonomo'], obligatorio: true },
      { id: 'libros-gastos', nombre: 'Libro de registro de gastos (facturas recibidas 2025)', nota: 'Guarda las facturas originales, no solo el libro', perfiles: ['autonomo'], obligatorio: true },
      { id: 'pagos-fraccionados', nombre: 'Justificantes de pagos fraccionados (Modelo 130 de cada trimestre)', nota: 'Disponibles en tu área de sede.agenciatributaria.gob.es', perfiles: ['autonomo'], obligatorio: true },
      { id: 'retenciones-soportadas', nombre: 'Resumen de retenciones soportadas en facturas emitidas', nota: 'Las facturas con IRPF del 7% o 15% generan retenciones a tu favor', perfiles: ['autonomo'] },
      { id: 'cuota-ss', nombre: 'Certificado de cotizaciones pagadas a la Seguridad Social (cuota autónomos)', nota: 'Descargable desde importass.seg-social.es', perfiles: ['autonomo'], obligatorio: true },
      { id: 'amortizaciones', nombre: 'Fichas de amortización de activos fijos (equipos, vehículos, local)', nota: 'Si tienes bienes de inversión en tu actividad', perfiles: ['autonomo'] },
      { id: 'gastos-local', nombre: 'Justificante del alquiler del local u oficina si es gasto de la actividad', perfiles: ['autonomo'] },
    ],
  },
  {
    titulo: 'Pensiones y prestaciones (pensionista)',
    icono: '🏛️',
    perfilesRelevantes: ['pensionista'],
    items: [
      { id: 'cert-pension', nombre: 'Certificado de pensión del INSS o mutualidad (cuantía y retención 2025)', nota: 'Descargable desde tu área personal en seg-social.es', perfiles: ['pensionista'], obligatorio: true },
      { id: 'cert-viudedad', nombre: 'Certificado de pensión de viudedad u orfandad si aplica', perfiles: ['pensionista'] },
      { id: 'plan-pensiones-cobrado', nombre: 'Certificado de rescate del plan de pensiones si lo cobraste en 2025', nota: 'Tributa como rendimiento del trabajo, no como ganancia patrimonial', perfiles: ['pensionista'] },
      { id: 'mutualidades', nombre: 'Certificado de mutualidad de funcionarios (MUFACE, MUGEJU, ISFAS) si aplica', perfiles: ['pensionista'] },
    ],
  },
  {
    titulo: 'Inversiones y productos financieros',
    icono: '📈',
    perfilesRelevantes: ['inversor'],
    items: [
      { id: 'cert-banco', nombre: 'Certificado fiscal del banco con ganancias/pérdidas patrimoniales', nota: 'Incluye acciones, ETFs, obligaciones vendidas en 2025', perfiles: ['inversor'], obligatorio: true },
      { id: 'cert-dividendos', nombre: 'Certificados de dividendos y retenciones practicadas', nota: 'Los bancos los emiten en enero-febrero del año siguiente', perfiles: ['inversor'], obligatorio: true },
      { id: 'cert-fondos', nombre: 'Certificados de fondos de inversión (reembolsos o traspasos a cuenta corriente)', nota: 'Los traspasos entre fondos están exentos; los reembolsos tributan', perfiles: ['inversor'] },
      { id: 'cert-intereses', nombre: 'Certificados de cuentas de ahorro, depósitos o letras del Tesoro con intereses', perfiles: ['inversor'] },
      { id: 'perdidas-compensar', nombre: 'Declaraciones de años anteriores si tienes pérdidas pendientes de compensar', nota: 'Las pérdidas patrimoniales se compensan en los 4 años siguientes', perfiles: ['inversor'] },
      { id: 'criptos', nombre: 'Registros de operaciones con criptomonedas si compraste/vendiste en 2025', nota: 'Desde 2023 se incluyen en la declaración como ganancias patrimoniales', perfiles: ['inversor'] },
    ],
  },
  {
    titulo: 'Inmuebles y rendimientos del alquiler',
    icono: '🏠',
    perfilesRelevantes: ['arrendador'],
    items: [
      { id: 'ref-catastral', nombre: 'Referencia catastral de todos los inmuebles (propios y en alquiler)', nota: 'Aparece en el recibo del IBI', perfiles: ['arrendador'], obligatorio: true },
      { id: 'contrato-alquiler', nombre: 'Contrato de arrendamiento y NIF del inquilino', nota: 'Necesario para justificar los ingresos y gastos deducibles', perfiles: ['arrendador'], obligatorio: true },
      { id: 'recibos-alquiler', nombre: 'Recibos o extractos bancarios de los cobros de alquiler en 2025', perfiles: ['arrendador'], obligatorio: true },
      { id: 'facturas-reparacion', nombre: 'Facturas de reparaciones y mantenimiento del inmueble alquilado', nota: 'Son deducibles: fontanería, electricidad, pintura, comunidad, etc.', perfiles: ['arrendador'] },
      { id: 'ibi-cert', nombre: 'Recibo del IBI del inmueble alquilado', nota: 'El IBI es gasto deducible del alquiler', perfiles: ['arrendador'] },
      { id: 'seguro-hogar-alq', nombre: 'Prima del seguro del hogar del inmueble alquilado', nota: 'Deducible íntegramente si el inmueble estuvo alquilado todo el año', perfiles: ['arrendador'] },
      { id: 'escritura-venta', nombre: 'Escritura de compraventa si vendiste o compraste inmueble en 2025', nota: 'La ganancia/pérdida patrimonial tributa en la base del ahorro', perfiles: ['arrendador'] },
      { id: 'hipoteca-inmueble', nombre: 'Certificado de intereses del préstamo hipotecario del inmueble alquilado', nota: 'Los intereses son gasto deducible del alquiler (no confundir con deducción vivienda habitual)', perfiles: ['arrendador'] },
    ],
  },
  {
    titulo: 'Deducciones y reducciones',
    icono: '🎁',
    perfilesRelevantes: [],
    items: [
      { id: 'plan-pensiones', nombre: 'Certificado de aportaciones al plan de pensiones privado en 2025', nota: 'Máximo deducible: 1.500 € (individual) + 8.500 € (empresa)', perfiles: [] },
      { id: 'donaciones', nombre: 'Justificantes de donaciones a ONGs, iglesia o partidos políticos', nota: 'Donaciones a ONGs: deducción del 80% (primeros 150 €) y 35% el resto', perfiles: [] },
      { id: 'sindicatos', nombre: 'Justificante de cuotas a sindicatos o colegios profesionales', nota: 'Son deducibles en el apartado de gastos de trabajo', perfiles: ['asalariado', 'autonomo'] },
      { id: 'alquiler-habitual', nombre: 'Recibos de alquiler pagados y NIF del arrendador (vivienda habitual)', nota: 'Solo si tienes derecho a deducción autonómica o contrato anterior a 2015', perfiles: ['asalariado', 'autonomo', 'pensionista'] },
      { id: 'hipoteca-habitual', nombre: 'Certificado hipotecario anual si tienes derecho a deducción por hipoteca anterior a 2013', nota: 'Este derecho transitorio se extinguió para nuevas hipotecas desde 2013', perfiles: [] },
      { id: 'eficiencia-energetica', nombre: 'Certificado energético pre y post reforma + facturas si hiciste mejoras energéticas', nota: 'Deducciones del 20%, 40% o 60% según el nivel de mejora conseguido', perfiles: [] },
      { id: 'guarderia', nombre: 'Recibos de guardería o centros de primer ciclo de infantil', nota: 'Deducción por maternidad ampliada: hasta 1.000 € adicionales', perfiles: [] },
      { id: 'ce-autonomo', nombre: 'Aportaciones a mutualidades de previsión social alternativas a la SS', nota: 'Solo autónomos colegiados que cotizan a mutualidad propia', perfiles: ['autonomo'] },
    ],
  },
];

// ──────────────────────────────────────────
// COMPONENTE
// ──────────────────────────────────────────
export default function ChecklistDeclaracionRentaPage() {
  const [perfilesSeleccionados, setPerfilesSeleccionados] = useState<Set<Perfil>>(new Set(['asalariado']));
  const [itemsChecked, setItemsChecked] = useState<Record<string, boolean>>({});

  const togglePerfil = (perfil: Perfil) => {
    setPerfilesSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(perfil)) {
        if (nuevo.size > 1) nuevo.delete(perfil); // mínimo 1 perfil
      } else {
        nuevo.add(perfil);
      }
      return nuevo;
    });
  };

  // Filtra categorías e items según los perfiles seleccionados
  const categoriasFiltradas = useMemo(() => {
    return CATEGORIAS.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.perfiles.length === 0 ||
        item.perfiles.some(p => perfilesSeleccionados.has(p))
      ),
    })).filter(cat => cat.items.length > 0);
  }, [perfilesSeleccionados]);

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

  const descargarChecklist = () => {
    const perfilesTxt = Array.from(perfilesSeleccionados).map(p => PERFILES_CONFIG[p].label).join(', ');
    const lineas: string[] = [
      'CHECKLIST DECLARACIÓN DE LA RENTA 2026 (ejercicio 2025)',
      `Perfil: ${perfilesTxt}`,
      `Progreso: ${itemsCompletados}/${totalItems} (${porcentaje}%)`,
      `Generado el: ${formatDate(new Date())}`,
      '',
      'FECHAS CLAVE:',
      '  8 de abril    → Apertura presentación online (Renta Web)',
      '  6 de mayo     → Inicio cita telefónica AEAT',
      '  1 de junio    → Inicio presentación presencial',
      ' 25 de junio    → Último día para domiciliar devoluciones',
      ' 30 de junio    → Fin del plazo (cierre de campaña)',
      '',
    ];

    categoriasFiltradas.forEach(cat => {
      lineas.push(`\n${cat.icono} ${cat.titulo.toUpperCase()}`);
      lineas.push('─'.repeat(50));
      cat.items.forEach(item => {
        const estado = itemsChecked[item.id] ? '[✓]' : '[ ]';
        const tag = item.obligatorio ? ' *' : '';
        lineas.push(`${estado}${tag} ${item.nombre}`);
        if (item.nota) lineas.push(`       → ${item.nota}`);
      });
    });

    lineas.push('\n* = documento imprescindible');
    lineas.push('\nGenerado con meskeIA — meskeia.com');

    const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'checklist-renta-2026.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📋</span> Checklist Declaración de la Renta 2026</h1>
        <p className={styles.subtitle}>Documentos organizados por perfil para la campaña del ejercicio 2025</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
      />

      {/* Fechas clave */}
      <div className={styles.fechasWrapper}>
        <h2 className={styles.fechasTitulo}><span aria-hidden="true">📅</span> Fechas clave campaña 2026</h2>
        <div className={styles.fechasGrid}>
          {FECHAS_CLAVE.map(f => (
            <div key={f.fecha} className={styles.fechaItem}>
              <span className={styles.fechaIcono} aria-hidden="true">{f.icono}</span>
              <span className={styles.fechaFecha}>{f.fecha}</span>
              <span className={styles.fechaEvento}>{f.evento}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selector de perfil */}
      <div className={styles.perfilWrapper}>
        <h2 className={styles.perfilTitulo}>¿Cuál es tu situación en 2025?</h2>
        <p className={styles.perfilDesc}>Puedes seleccionar varios perfiles si aplica</p>
        <div className={styles.perfilGrid}>
          {(Object.entries(PERFILES_CONFIG) as [Perfil, typeof PERFILES_CONFIG[Perfil]][]).map(([perfil, cfg]) => (
            <button
              key={perfil}
              type="button"
              onClick={() => togglePerfil(perfil)}
              className={`${styles.perfilBtn} ${perfilesSeleccionados.has(perfil) ? styles.active : ''}`}
              aria-pressed={perfilesSeleccionados.has(perfil)}
            >
              <span className={styles.perfilIcono} aria-hidden="true">{cfg.icono}</span>
              <span className={styles.perfilLabel}>{cfg.label}</span>
              <span className={styles.perfilBtnDesc}>{cfg.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progreso */}
      <div className={`${styles.progresoWrapper} ${todoCompleto ? styles.progresoCompleto : ''}`}>
        <div className={styles.progresoHeader}>
          <span className={styles.progresoTexto}>
            {todoCompleto
              ? <><span aria-hidden="true">✅</span> ¡Tienes todo preparado para hacer la renta!</>
              : `${itemsCompletados} de ${totalItems} documentos verificados`}
          </span>
          <span className={styles.progresoPorcentaje}>{porcentaje}%</span>
        </div>
        <div className={styles.progresoBar} role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.progresoFill} style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className={styles.acciones}>
        <button type="button" onClick={() => marcarTodos(true)} className={styles.btnAccion}>
          <span aria-hidden="true">✓</span> Marcar todo
        </button>
        <button type="button" onClick={() => marcarTodos(false)} className={styles.btnAccion}>
          <span aria-hidden="true">✗</span> Desmarcar todo
        </button>
        <button type="button" onClick={descargarChecklist} className={styles.btnDescargar}>
          <span aria-hidden="true">⬇️</span> Descargar lista
        </button>
      </div>

      {/* Mensaje completado */}
      {todoCompleto && (
        <div className={styles.mensajeCompleto} role="alert" aria-live="polite">
          <h2><span aria-hidden="true">🎉</span> ¡Todo en orden!</h2>
          <p>Tienes todos los documentos preparados. Ya puedes acceder a Renta Web desde el 8 de abril para presentar tu declaración.</p>
          <a
            href="https://sede.agenciatributaria.gob.es"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnAeat}
          >
            Ir a la sede de la AEAT →
          </a>
        </div>
      )}

      {/* Checklist por categorías */}
      <div className={styles.checklist}>
        {categoriasFiltradas.map(cat => {
          const completadosCat = cat.items.filter(item => itemsChecked[item.id]).length;
          const todosCat = cat.items.length;
          return (
            <div key={cat.titulo} className={styles.categoriaBloque}>
              <div className={styles.categoriaHeader}>
                <span className={styles.categoriaIcon} aria-hidden="true">{cat.icono}</span>
                <h2 className={styles.categoriaTitulo}>{cat.titulo}</h2>
                <span className={styles.categoriaProgreso}>{completadosCat}/{todosCat}</span>
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
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleItem(item.id);
                      }
                    }}
                  >
                    <span className={styles.checkbox} aria-hidden="true">
                      {itemsChecked[item.id] ? '✓' : ''}
                    </span>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemNombre}>
                        {item.nombre}
                        {item.obligatorio && <span className={styles.badgeObligatorio}>Imprescindible</span>}
                      </span>
                      {item.nota && <p className={styles.itemNota}>{item.nota}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Aviso legal — SIEMPRE VISIBLE */}
      <div className={styles.avisoLegal} role="note">
        <strong><span aria-hidden="true">⚠️</span> Aviso importante</strong>
        <p>
          Esta herramienta es una guía orientativa de carácter general para la campaña de la Renta 2026 (ejercicio 2025) en España.
          No sustituye el asesoramiento de un profesional tributario. La normativa fiscal puede variar según la comunidad autónoma,
          la situación personal o los cambios legislativos posteriores a su publicación.
          Ante dudas, consulta la sede electrónica de la AEAT o a un asesor fiscal homologado.
        </p>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Guía completa de la declaración de la renta"
        subtitle="Todo lo que necesitas saber para hacer la renta 2026 sin errores"
        icon="📋"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Documentos principales por perfil</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>👔 Asalariado</th>
                  <th>🧾 Autónomo</th>
                  <th>🏦 Pensionista</th>
                  <th>📈 Inversor</th>
                  <th>🏠 Arrendador</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Borrador AEAT + acceso Cl@ve</td>
                  <td className={styles.cellSi}>✓</td>
                  <td className={styles.cellSi}>✓</td>
                  <td className={styles.cellSi}>✓</td>
                  <td className={styles.cellSi}>✓</td>
                  <td className={styles.cellSi}>✓</td>
                </tr>
                <tr>
                  <td>Certificado retenciones (empresa)</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                </tr>
                <tr>
                  <td>Libros ingresos/gastos + Modelos 130</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                </tr>
                <tr>
                  <td>Certificado pensión INSS/mutualidad</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                </tr>
                <tr>
                  <td>Certificado fiscal del banco/bróker</td>
                  <td className={styles.cellOpcional}>Si tiene ahorros</td>
                  <td className={styles.cellOpcional}>Si tiene ahorros</td>
                  <td className={styles.cellOpcional}>Si tiene ahorros</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                  <td className={styles.cellOpcional}>Si tiene fondos</td>
                </tr>
                <tr>
                  <td>Contrato alquiler + facturas inmueble</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellNo}>—</td>
                  <td className={styles.cellSi}>✓ Obligatorio</td>
                </tr>
                <tr>
                  <td>Certificado plan de pensiones privado</td>
                  <td className={styles.cellOpcional}>Si aportó</td>
                  <td className={styles.cellOpcional}>Si aportó</td>
                  <td className={styles.cellOpcional}>Si aportó</td>
                  <td className={styles.cellOpcional}>Si aportó</td>
                  <td className={styles.cellOpcional}>Si aportó</td>
                </tr>
                <tr>
                  <td>Justificantes de donaciones</td>
                  <td className={styles.cellOpcional}>Si donó</td>
                  <td className={styles.cellOpcional}>Si donó</td>
                  <td className={styles.cellOpcional}>Si donó</td>
                  <td className={styles.cellOpcional}>Si donó</td>
                  <td className={styles.cellOpcional}>Si donó</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Situaciones frecuentes y qué debes tener en cuenta</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👔</span>
                <strong>Asalariado con un solo pagador</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: trabajador en una empresa todo el año con nómina regular.</p>
              <ul>
                <li>La AEAT tiene todos tus datos en el borrador (retenciones, ingresos, bienes inmuebles).</li>
                <li>Solo necesitas revisar el borrador y confirmar si los datos son correctos.</li>
                <li>Añade manualmente deducciones que la AEAT no conoce: plan de pensiones, donaciones, etc.</li>
                <li>Si tienes hipoteca anterior a 2013, verifica que aparezca la deducción.</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Si el borrador sale a pagar pero sin declaración conjunta sale mejor, compáralo antes de confirmar.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧾</span>
                <strong>Autónomo en estimación directa simplificada</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: freelance o profesional liberal con actividad todo el año.</p>
              <ul>
                <li>El borrador estará muy incompleto: la AEAT no tiene tus libros de gastos.</li>
                <li>Es imprescindible que tú mismo declares ingresos, gastos deducibles y pagos a cuenta (Mod. 130).</li>
                <li>La cuota de autónomos (SS) es gasto deducible íntegro de la actividad.</li>
                <li>No olvides los gastos de suministros del hogar si trabajas desde casa (30% de la parte afecta).</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Usa el certificado de la Sede de la SS para verificar las cotizaciones del año, ya que a veces hay regularizaciones retroactivas.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Propietario que alquila un piso</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: tiene un piso heredado alquilado a una familia.</p>
              <ul>
                <li>Debe declarar los ingresos íntegros del alquiler (no solo el neto).</li>
                <li>Los gastos deducibles más comunes: IBI, comunidad, seguro, amortización, intereses hipoteca, reparaciones.</li>
                <li>Si es vivienda habitual para el inquilino, aplica la reducción del 60% sobre el rendimiento neto.</li>
                <li>Los períodos en que el inmueble estuvo vacío tributan como imputación de rentas (1,1% del valor catastral).</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Guarda TODAS las facturas de reparaciones. El IBI puede ser el gasto olvidado más frecuente que la gente no deduce.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
                <strong>Inversor con acciones y fondos</strong>
              </div>
              <p className={styles.escenarioExample}>Ejemplo: tiene cartera en acciones españolas y un fondo indexado.</p>
              <ul>
                <li>Pide el certificado fiscal a tu banco o bróker en enero-febrero: recoge todas las operaciones del año.</li>
                <li>Las pérdidas de acciones compensan ganancias de otros años (hasta 4 ejercicios anteriores).</li>
                <li>Los traspasos entre fondos están exentos si no hay reembolso a cuenta corriente.</li>
                <li>Las criptomonedas tributan como ganancias/pérdidas patrimoniales desde 2023.</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Si vendiste acciones con pérdidas en diciembre, espera más de 2 meses para recomprar las mismas — la norma antilavado de pérdidas anularía la deducción.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Preguntas frecuentes</h4>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Estoy obligado a hacer la declaración de la renta?</dt>
              <dd>
                No siempre. Están <strong>exentos de declarar</strong> los trabajadores con un único pagador cuyos ingresos no superen los <strong>22.000 € brutos anuales</strong> (o 15.000 € si tienen dos o más pagadores y el segundo supera 1.500 €). Los autónomos con actividad económica siempre están obligados, independientemente de sus ingresos. Si tienes dudas, la propia herramienta Renta Web te indica si estás obligado al acceder con tus datos.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué pasa si no presento la declaración estando obligado?</dt>
              <dd>
                Si la declaración sale a pagar y no la presentas, la AEAT puede imponerte una sanción de entre el <strong>50% y el 150%</strong> de la cuota, más recargos e intereses de demora. Si sale a devolver y no la presentas, simplemente pierdes la devolución. En todo caso, Hacienda tiene 4 años para reclamar (plazo de prescripción).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo confirmar el borrador sin revisarlo?</dt>
              <dd>
                Técnicamente sí, pero <strong>no es recomendable</strong>. La AEAT solo incluye en el borrador los datos que conoce (salarios, retenciones, inmuebles por catastro). No incluye deducciones por plan de pensiones, donaciones, gastos de autónomos, mejoras de eficiencia energética o deducciones autonómicas. Confirmar el borrador sin revisarlo puede suponer pagar más de lo necesario.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Sale mejor la declaración individual o conjunta?</dt>
              <dd>
                Depende de la diferencia de ingresos entre los cónyuges. En general, la <strong>declaración conjunta es más ventajosa</strong> cuando uno de los cónyuges no tiene ingresos o son muy bajos, ya que se aplica una reducción adicional de 3.400 € (o 2.150 € en otros casos). Si ambos trabajan con sueldos similares, suele salir mejor por separado. Renta Web permite simular ambas opciones.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el borrador y cuándo estará disponible?</dt>
              <dd>
                El borrador es el proyecto de declaración que la AEAT elabora con los datos que ya tiene de ti (nóminas, pensiones, compras de inmuebles, ventas de fondos, etc.). Estará disponible desde el <strong>8 de abril de 2026</strong> en Renta Web, accediendo con Cl@ve PIN, DNI electrónico o certificado digital. Solo es un punto de partida: debes revisarlo y completarlo con tus propios datos.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo funciona la deducción por donaciones a ONGs?</dt>
              <dd>
                Las donaciones a entidades acogidas a la Ley 49/2002 (Cruz Roja, UNICEF, Cáritas, etc.) tienen una deducción del <strong>80% para los primeros 150 €</strong> y del <strong>35%</strong> para el resto (40% si llevas más de 3 años donando a la misma entidad). El límite es el 10% de la base liquidable. Para los donativos a la Iglesia Católica, la deducción es del 25%.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo aplazar el pago si la declaración sale a pagar?</dt>
              <dd>
                Sí. Al presentar la declaración, puedes domiciliar el pago en dos plazos: el <strong>60%</strong> al presentar la declaración y el <strong>40%</strong> restante el 5 de noviembre de 2026, sin recargos ni intereses. También puedes solicitar un aplazamiento ordinario con intereses si necesitas más tiempo, aunque Hacienda no siempre lo concede automáticamente.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo tributan las indemnizaciones por despido?</dt>
              <dd>
                La indemnización mínima legal por despido improcedente está <strong>exenta de IRPF</strong> hasta los límites legales (45 días por año trabajado con máximo 42 mensualidades, para contratos anteriores a 2012; o 33 días con máximo 24 mensualidades para los posteriores). La parte que supere esos límites tributa íntegramente como rendimiento del trabajo. El finiquito (salario pendiente, vacaciones no disfrutadas) siempre tributa.
              </dd>
            </div>
          </dl>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Cómo presentar la renta paso a paso</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Antes del 8 de abril: Reúne todos los documentos</strong>
                <p>Usa esta checklist para verificar que tienes todos los justificantes necesarios según tu perfil. Solicita a tu empresa el certificado de retenciones (obligados a entregártelo antes del inicio de campaña), descarga los certificados de la SS, banco y SEPE desde sus sedes electrónicas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>8 de abril: Accede a Renta Web y descarga el borrador</strong>
                <p>Entra en <strong>sede.agenciatributaria.gob.es</strong> con tu Cl@ve PIN, DNI electrónico o certificado digital. Descarga el borrador y revísalo página a página. Comprueba que tus datos personales, domicilio y cuenta bancaria son correctos.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Completa los datos que faltan en el borrador</strong>
                <p>La AEAT no siempre incluye: aportaciones a planes de pensiones, donaciones, deducciones autonómicas, gastos de autónomos, mejoras energéticas o rendimientos del alquiler. Añade manualmente toda la información que no aparezca o que sea incorrecta.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Simula la declaración individual vs conjunta (si tienes cónyuge)</strong>
                <p>Renta Web tiene un simulador integrado que calcula automáticamente cuál modalidad es más beneficiosa. Compara siempre antes de confirmar, especialmente si uno de los dos tiene bajos ingresos o no trabaja.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Presenta la declaración antes del 30 de junio</strong>
                <p>Si sale a devolver, preséntala cuanto antes (la AEAT tiene hasta 6 meses para abonártela). Si sale a pagar, puedes domiciliar el pago el 25 de junio (60% ahora + 40% el 5 de noviembre). Guarda el justificante de presentación (número de referencia PDF).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Guarda todos los justificantes 4 años</strong>
                <p>Hacienda puede inspeccionarte hasta 4 años después de la presentación. Conserva en papel o digital todos los documentos que usaste: certificados, facturas de deducciones, contratos. Un justificante perdido puede convertir una deducción correcta en una sanción.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Tips */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>6 cosas que la gente olvida declarar o deducir</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎁</span>
              <div>
                <strong>Donaciones a ONGs</strong>
                <p>Las donaciones a entidades acogidas a la Ley 49/2002 tienen una deducción del 80 % en los primeros 150 € y del 35 % en el resto. Si donaste a ONGs en 2025, consérvalos justificantes: la deducción se aplica automáticamente si la entidad ha informado a la AEAT, pero conviene revisar el borrador.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📑</span>
              <div>
                <strong>Cuotas de sindicatos y colegios profesionales</strong>
                <p>Las cuotas anuales pagadas a sindicatos (CCOO, UGT…) y colegios profesionales de afiliación obligatoria son gasto deducible del trabajo. Muchos asalariados las olvidan porque no aparecen en el borrador.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏗️</span>
              <div>
                <strong>Deducción por mejoras de eficiencia energética</strong>
                <p>Si hiciste obras en tu vivienda habitual para mejorar la eficiencia energética (caldera, aislamientos, ventanas…), puedes deducir entre el 20% y el 60% de la inversión, según el nivel de mejora. Necesitas el certificado energético pre y post obra.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏠</span>
              <div>
                <strong>IBI y comunidad del inmueble alquilado</strong>
                <p>El IBI y las cuotas de comunidad del piso en alquiler son gastos deducibles del rendimiento. Muchos propietarios los olvidan porque los paga el propietario pero afectan directamente al rendimiento neto tributable.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📉</span>
              <div>
                <strong>Pérdidas de años anteriores para compensar</strong>
                <p>Si en años anteriores tuviste pérdidas en fondos o acciones que no pudiste compensar totalmente, pueden usarse para reducir las ganancias de este año (hasta 4 ejercicios). La AEAT lo incluye en el borrador, pero revísalo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👶</span>
              <div>
                <strong>Deducciones por guardería y maternidad</strong>
                <p>Las madres trabajadoras con hijos menores de 3 años tienen derecho a la deducción por maternidad (hasta 1.200 € al año) y hasta 1.000 € adicionales por gastos de guardería. Se solicita en Renta Web pero no siempre aparece en el borrador.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Warning box */}
        <section className={styles.eduSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores frecuentes que pueden costar dinero o una sanción</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confirmar el borrador sin revisarlo.</strong> El borrador es solo un punto de partida. Si no añades tus deducciones y gastos, pagarás más de lo que corresponde — o perderás una devolución a la que tienes derecho.
              </li>
              <li>
                <strong>No declarar las rentas del alquiler.</strong> La AEAT cruza información del catastro, los depósitos de fianza autonómicos y las declaraciones de los inquilinos. La regularización posterior incluye cuota, intereses de demora y, en su caso, sanciones.
              </li>
              <li>
                <strong>Olvidar declarar las cuentas en el extranjero (Modelo 720).</strong> Si en algún momento del año tuviste activos en el extranjero superiores a 50.000 €, estás obligado a presentar el Modelo 720. Las sanciones son de hasta el 150% del valor no declarado. (NOTA: las sanciones del régimen del Modelo 720 fueron declaradas contrarias al Derecho de la UE por la STJUE de 27/01/2022 y modificadas por la Ley 5/2022; consulta el régimen vigente en la AEAT.)
              </li>
              <li>
                <strong>Deducir gastos del alquiler que no son deducibles.</strong> Solo son deducibles los gastos vinculados directamente al inmueble alquilado. Los gastos de reformas de mejora (no reparación) no son deducibles directamente — se amortizan. Las multas de la comunidad de propietarios tampoco lo son.
              </li>
              <li>
                <strong>Presentar fuera de plazo la declaración que sale a devolver.</strong> Si presentas la declaración después del 30 de junio, Hacienda aplica un recargo del 1% mensual sobre la cuota, aunque salga a devolver. Y si sale a pagar, el recargo puede llegar al 20% más intereses.
              </li>
              <li>
                <strong>No guardar los justificantes durante 4 años.</strong> Si la AEAT te inspecciona y no puedes justificar las deducciones aplicadas, las anulará y añadirá sanción, aunque tuvieras razón. Guarda todo: contratos, facturas, certificados y recibos en papel o escaneados.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('checklist-declaracion-renta')} />
      <ShareCard appName="checklist-declaracion-renta" />
      <Footer appName="checklist-declaracion-renta" />
    </div>
  );
}
