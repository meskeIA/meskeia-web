'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './ChecklistDeclaracionRenta.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard, DataReference } from '@/components';
import { formatDate, formatNumber } from '@/lib';
import { FISCAL_IRPF_META } from '@/data/fiscal/irpf';
import { LIMITES_PLAN_PENSIONES_2025 } from '@/data/fiscal/pensiones';
import { DEDUCCION_MATERNIDAD_IRPF } from '@/data/fiscal/maternidad';
import { ESCALA_RECARGO_EXTEMPORANEO, MODELO_720, SANCION_PRESENTACION_TARDIA_SIN_PERJUICIO } from '@/data/fiscal/recargos-sanciones';
import { PREGUNTAS_FRECUENTES } from './metadata';

/** «1.200 €» · «24 %» con el espacio duro del formato español (CLAUDE.md global §2). */
const eur = (n: number): string => `${formatNumber(n, 0)} €`;
const pct = (n: number): string => `${formatNumber(n, 0)} %`;

// ──────────────────────────────────────────
// CAMPAÑA (Orden HAC/277/2026, BOE-A-2026-7041, leída el 14/11/2026)
//   art. 7.1: presentación del 8 de abril al 30 de junio de 2026, cualquiera que sea el resultado
//   art. 12.3: domiciliación del PAGO (único o primer plazo) hasta el 25 de junio de 2026
//   art. 11.5: segundo plazo del 40 % hasta el 5 de noviembre de 2026
// Las fechas llevan año: sin él, pasada la campaña, la app las presentaba como futuras (4625).
// ──────────────────────────────────────────
const FIN_PLAZO_ISO = '2026-06-30';
const FIN_PLAZO_TEXTO = '30/06/2026';

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
  { fecha: '8 abr 2026', evento: 'Apertura Renta Web (presentación online)', icono: '💻' },
  { fecha: '6 may 2026', evento: 'Inicio cita telefónica con Agencia Tributaria', icono: '📞' },
  { fecha: '1 jun 2026', evento: 'Inicio presentación presencial en oficinas', icono: '🏢' },
  { fecha: '25 jun 2026', evento: 'Último día para domiciliar el pago (único o primer plazo)', icono: '🏦' },
  { fecha: '30 jun 2026', evento: 'Fin del plazo — cierre de la campaña', icono: '🔔' },
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
      { id: 'retenciones-soportadas', nombre: 'Resumen de retenciones soportadas en facturas emitidas', nota: 'Las facturas con IRPF del 7 % o 15 % generan retenciones a tu favor', perfiles: ['autonomo'] },
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
      { id: 'plan-pensiones', nombre: 'Certificado de aportaciones al plan de pensiones privado en 2025', nota: `Máximo deducible: ${eur(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)} (individual) + ${eur(LIMITES_PLAN_PENSIONES_2025.limiteEmpresaAnual)} (empresa)`, perfiles: [] },
      // Ley 49/2002, art. 19 (RDL 6/2023, desde 2024) y DA 9.ª.3, leídos en el BOE el 14/11/2026 (4621).
      { id: 'donaciones', nombre: 'Justificantes de donaciones a ONGs, iglesia o partidos políticos', nota: 'Donativos a ONGs y a la Iglesia Católica (Ley 49/2002): deducción del 80 % sobre los primeros 250 € y del 40 % sobre el resto (45 % si donas a la misma entidad por tercer año seguido sin bajar el importe)', perfiles: [] },
      { id: 'sindicatos', nombre: 'Justificante de cuotas a sindicatos o colegios profesionales', nota: 'Son deducibles en el apartado de gastos de trabajo', perfiles: ['asalariado', 'autonomo'] },
      { id: 'alquiler-habitual', nombre: 'Recibos de alquiler pagados y NIF del arrendador (vivienda habitual)', nota: 'Solo si tienes derecho a deducción autonómica o contrato anterior a 2015', perfiles: ['asalariado', 'autonomo', 'pensionista'] },
      { id: 'hipoteca-habitual', nombre: 'Certificado hipotecario anual si tienes derecho a deducción por hipoteca anterior a 2013', nota: 'Este derecho transitorio se extinguió para nuevas hipotecas desde 2013', perfiles: [] },
      { id: 'eficiencia-energetica', nombre: 'Certificado energético pre y post reforma + facturas si hiciste mejoras energéticas', nota: 'Deducciones del 20 %, 40 % o 60 % según el nivel de mejora conseguido', perfiles: [] },
      { id: 'guarderia', nombre: 'Recibos de guardería o centros de primer ciclo de infantil', nota: `Deducción por maternidad ampliada: hasta ${eur(DEDUCCION_MATERNIDAD_IRPF.incrementoGuarderia.importeMaximoAnual)} adicionales`, perfiles: [] },
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
  // Se decide al montar, no en el render: el HTML prerenderizado llevaría la fecha del build.
  const [campanaCerrada, setCampanaCerrada] = useState(false);

  useEffect(() => {
    const hoy = new Date();
    const hoyIso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    setCampanaCerrada(hoyIso > FIN_PLAZO_ISO);
  }, []);

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
      `Progreso: ${itemsCompletados}/${totalItems} (${pct(porcentaje)})`,
      `Generado el: ${formatDate(new Date())}`,
      '',
      'FECHAS CLAVE (campaña 2026):',
      ...FECHAS_CLAVE.map(f => `  ${f.fecha.padEnd(12)} → ${f.evento}`),
      ...(campanaCerrada ? [`  El plazo voluntario terminó el ${FIN_PLAZO_TEXTO}.`] : []),
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
      <DataReference
        normativa="IRPF, campaña 2026 (ejercicio 2025)"
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
      />

      {/* Fechas clave */}
      <div className={styles.fechasWrapper}>
        <h2 className={styles.fechasTitulo}><span aria-hidden="true">📅</span> Fechas clave campaña 2026 (Renta 2025)</h2>
        {/* Pasado el 30/06/2026 la campaña está cerrada y se dice (hallazgo 4625). */}
        {campanaCerrada && (
          <p className={styles.avisoCampana} role="note">
            El plazo voluntario de la Renta 2025 terminó el {FIN_PLAZO_TEXTO} (Orden HAC/277/2026, art. 7.1). Si estabas obligado a declarar y no lo hiciste, aún puedes presentarla en Renta Web: será fuera de plazo, con las consecuencias que explica la guía.
          </p>
        )}
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
              ? <span key="completo"><span aria-hidden="true">✅</span> ¡Tienes todo preparado para hacer la renta!</span>
              : <span key="progreso">{`${itemsCompletados} de ${totalItems} documentos verificados`}</span>}
          </span>
          <span className={styles.progresoPorcentaje}>{pct(porcentaje)}</span>
        </div>
        <div className={styles.progresoBar} role="progressbar" aria-label="Documentos verificados" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
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
          <p>Tienes todos los documentos preparados para presentar la declaración en Renta Web. El plazo voluntario de la Renta 2025 fue del 8 de abril al {FIN_PLAZO_TEXTO}.</p>
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
                {/* El checkbox va DENTRO del <li>: con role="checkbox" en el propio <li>, la lista
                    perdía sus elementos y el lector no decía «lista de 6» (hallazgo 4631). */}
                {cat.items.map(item => (
                  <li key={item.id} className={styles.itemFila}>
                    <div
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
                  <th><span aria-hidden="true">👔</span> Asalariado</th>
                  <th><span aria-hidden="true">🧾</span> Autónomo</th>
                  <th><span aria-hidden="true">🏦</span> Pensionista</th>
                  <th><span aria-hidden="true">📈</span> Inversor</th>
                  <th><span aria-hidden="true">🏠</span> Arrendador</th>
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
                <li>No olvides los gastos de suministros del hogar si trabajas desde casa (30&nbsp;% de la parte afecta).</li>
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
                {/* Art. 23.2 LIRPF (BOE consolidado leído el 14/11/2026): el porcentaje depende de la
                    fecha del contrato, la zona, la renta pactada y la edad del inquilino, y la
                    escala ha cambiado más de una vez; un «60 %» sin condiciones era falso (4624). */}
                <li>Si es vivienda habitual para el inquilino, el rendimiento neto positivo puede tener una reducción (art. 23.2 de la Ley del IRPF) cuyo porcentaje depende de la fecha del contrato, de la zona, de la renta pactada y de la edad del inquilino: compruébalo con los datos de tu contrato en Renta Web.</li>
                <li>Los períodos en que el inmueble estuvo vacío tributan como imputación de rentas (1,1&nbsp;% del valor catastral).</li>
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
          {/* Sale de PREGUNTAS_FRECUENTES, la misma constante que alimenta el FAQPage (4627). */}
          <dl className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map(f => (
              <div key={f.question} className={styles.faqItem}>
                <dt>{f.question}</dt>
                <dd>{f.answer}</dd>
              </div>
            ))}
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
                <p>Si sale a devolver, preséntala cuanto antes (la AEAT tiene hasta 6 meses para abonártela). Si sale a pagar, puedes domiciliar el pago del 8 de abril al 25 de junio (60&nbsp;% al presentar + 40&nbsp;% hasta el 5 de noviembre). Guarda el justificante de presentación (número de referencia PDF).</p>
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
                <p>Las donaciones a entidades acogidas a la Ley 49/2002 tienen una deducción del 80&nbsp;% en los primeros 250&nbsp;€ y del 40&nbsp;% en el resto (45&nbsp;% si repites con la misma entidad). Si donaste a ONGs en 2025, consérvalos justificantes: la deducción se aplica automáticamente si la entidad ha informado a la AEAT, pero conviene revisar el borrador.</p>
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
                <p>Si hiciste obras en tu vivienda habitual para mejorar la eficiencia energética (caldera, aislamientos, ventanas…), puedes deducir entre el 20&nbsp;% y el 60&nbsp;% de la inversión, según el nivel de mejora. Necesitas el certificado energético pre y post obra.</p>
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
                {/* Art. 81 LIRPF (DEDUCCION_MATERNIDAD_IRPF.situacionesConDerecho): también con
                    prestación o subsidio de desempleo al nacer el menor (4629). */}
                <p>Las madres con hijos menores de 3 años que trabajan (de alta en la Seguridad Social o mutualidad) o que cobraban prestación o subsidio de desempleo al nacer el hijo tienen derecho a la deducción por maternidad (hasta {eur(DEDUCCION_MATERNIDAD_IRPF.importeAnualPorHijo)} al año) y hasta {eur(DEDUCCION_MATERNIDAD_IRPF.incrementoGuarderia.importeMaximoAnual)} adicionales por gastos de guardería. Se solicita en Renta Web pero no siempre aparece en el borrador.</p>
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
                <strong>Olvidar declarar las cuentas en el extranjero (Modelo 720).</strong> Si en algún momento del año tuviste activos en el extranjero superiores a {eur(MODELO_720.umbralPorBloque)}, estás obligado a presentar el Modelo 720. Desde la Ley 5/2022, tras la sentencia del TJUE de 27/01/2022, ya no tiene un régimen sancionador propio: su incumplimiento se sanciona por el régimen general de la Ley General Tributaria.
              </li>
              <li>
                <strong>Deducir gastos del alquiler que no son deducibles.</strong> Solo son deducibles los gastos vinculados directamente al inmueble alquilado. Los gastos de reformas de mejora (no reparación) no son deducibles directamente — se amortizan. Las multas de la comunidad de propietarios tampoco lo son.
              </li>
              <li>
                {/* LGT arts. 27.2 y 198 (ESCALA_RECARGO_EXTEMPORANEO, leídos en el BOE el 14/11/2026): el 20 % era la
                    escala anterior a la Ley 11/2021, y a devolver no hay cuota que recargar (4623). */}
                <strong>Presentar fuera de plazo la declaración que sale a devolver.</strong> Si la presentas después del 30 de junio sin requerimiento, no hay recargo, porque no hay cuota que recargar, pero la AEAT puede imponer una multa fija de {eur(SANCION_PRESENTACION_TARDIA_SIN_PERJUICIO.multaSinRequerimiento)}. Si sale a pagar, el recargo es del {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase)} más otro {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes)} por cada mes completo de retraso, y del {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses)} pasados {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses, más intereses de demora desde entonces.
              </li>
              <li>
                <strong>No guardar los justificantes durante 4 años.</strong> Si la AEAT te inspecciona y no puedes justificar las deducciones aplicadas, las anulará y añadirá sanción, aunque tuvieras razón. Guarda todo: contratos, facturas, certificados y recibos en papel o escaneados.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="checklist-declaracion-renta" />
      <Footer appName="checklist-declaracion-renta" />
    </div>
  );
}
