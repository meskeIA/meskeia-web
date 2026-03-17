'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './AsistenteConstitucionSociedad.module.css';
import { MeskeiaLogo, Footer, NumberInput, RelatedApps, EducationalSection, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ===== TIPOS =====
type TipoSociedad = 'SL' | 'SLU' | 'SA';
type TabActiva = 'checklist' | 'datos' | 'costes';

interface Socio {
  id: string;
  nombre: string;
  porcentaje: string;
}

interface DatosSociedad {
  denominacion1: string;
  denominacion2: string;
  denominacion3: string;
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
  obligatorio: boolean;
  enlaceUtil?: { texto: string; url: string };
}

// ===== DATOS COMPARATIVOS =====
const COMPARATIVA: Record<TipoSociedad, {
  nombre: string; siglas: string; capitalMinimo: number;
  desembolsoInicial: string; divisionCapital: string;
  transmision: string; sociosMinimos: number;
  idealPara: string; complejidad: string;
}> = {
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

// ===== FASES DEL CHECKLIST =====
const FASES = [
  { numero: 1, nombre: 'Preparación', icono: '📋', descripcion: 'Antes de ir al notario' },
  { numero: 2, nombre: 'Constitución', icono: '✍️', descripcion: 'En la notaría' },
  { numero: 3, nombre: 'Post-constitución', icono: '🏛️', descripcion: 'Trámites administrativos' },
  { numero: 4, nombre: 'Operatividad', icono: '🚀', descripcion: 'Puesta en marcha' },
];

// ===== CHECKLIST (20 ítems) =====
const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Fase 1: Preparación
  { id: 'denominacion', fase: 1, texto: 'Elegir denominación social', descripcion: 'Nombre único de la sociedad. Prepara 3 opciones por orden de preferencia.', obligatorio: true },
  { id: 'cert-negativa', fase: 1, texto: 'Certificación Negativa de Denominación', descripcion: 'Certificado del Registro Mercantil Central confirmando que el nombre no existe. Válido 6 meses.', obligatorio: true, enlaceUtil: { texto: 'Registro Mercantil Central', url: 'https://www.rmc.es/' } },
  { id: 'estatutos', fase: 1, texto: 'Redactar estatutos sociales', descripcion: 'Regula el funcionamiento interno. Puedes usar modelo estándar o personalizado.', obligatorio: true },
  { id: 'capital-def', fase: 1, texto: 'Definir capital social y aportaciones', descripcion: 'Cantidad que cada socio aporta y porcentaje de participación resultante.', obligatorio: true },
  { id: 'cuenta-temp', fase: 1, texto: 'Abrir cuenta bancaria "Sociedad en constitución"', descripcion: 'Cuenta temporal para depositar el capital. Algunos bancos permiten hacerlo online.', obligatorio: true },
  { id: 'deposito', fase: 1, texto: 'Depositar capital social', descripcion: 'Ingresar el capital mínimo requerido según tipo de sociedad.', obligatorio: true },
  { id: 'cert-bancario', fase: 1, texto: 'Obtener certificado bancario del depósito', descripcion: 'Documento del banco acreditando el ingreso. Necesario para el notario.', obligatorio: true },
  // Fase 2: Constitución
  { id: 'cita-notario', fase: 2, texto: 'Reservar cita en notaría', descripcion: 'Contacta varias notarías para comparar honorarios. Lleva toda la documentación.', obligatorio: true },
  { id: 'docs-socios', fase: 2, texto: 'Preparar documentación de todos los socios', descripcion: 'DNI/NIE original y fotocopia de cada socio. Si hay persona jurídica: escritura de poderes.', obligatorio: true },
  { id: 'firma', fase: 2, texto: 'Firmar escritura de constitución ante notario', descripcion: 'Todos los socios deben asistir o tener representante con poder notarial.', obligatorio: true },
  { id: 'copia-autorizada', fase: 2, texto: 'Obtener copia autorizada de la escritura', descripcion: 'Copia oficial necesaria para los siguientes trámites. Pide varias copias simples.', obligatorio: true },
  // Fase 3: Post-constitución
  { id: 'cif-provisional', fase: 3, texto: 'Solicitar CIF provisional (Modelo 036)', descripcion: 'Identificación fiscal de la sociedad. Se solicita en Hacienda con la escritura.', obligatorio: true, enlaceUtil: { texto: 'Sede Electrónica AEAT', url: 'https://sede.agenciatributaria.gob.es/' } },
  { id: 'itpajd', fase: 3, texto: 'Liquidar ITPyAJD (presentación modelo)', descripcion: 'Desde 2010 está exento, pero hay que presentar el modelo 600 o similar según CCAA.', obligatorio: true },
  { id: 'registro-mercantil', fase: 3, texto: 'Inscribir en Registro Mercantil Provincial', descripcion: 'Inscripción obligatoria en el Registro de la provincia del domicilio social.', obligatorio: true },
  { id: 'cif-definitivo', fase: 3, texto: 'Obtener CIF definitivo', descripcion: 'Una vez inscrita, solicitar el CIF definitivo en Hacienda.', obligatorio: true },
  { id: 'libros', fase: 3, texto: 'Legalizar libros obligatorios', descripcion: 'Libro de actas, libro de socios/acciones. Se legalizan en el Registro Mercantil.', obligatorio: true },
  { id: 'iae', fase: 3, texto: 'Alta en IAE (si facturación prevista > 1 M€)', descripcion: 'Impuesto de Actividades Económicas. Exento si cifra de negocios < 1 millón €/año.', obligatorio: false },
  // Fase 4: Operatividad
  { id: 'alta-admin', fase: 4, texto: 'Alta del administrador en Seguridad Social', descripcion: 'Si el administrador es socio con >25% (SL) o >50% de capital, alta en RETA.', obligatorio: false },
  { id: 'apertura-centro', fase: 4, texto: 'Comunicar apertura de centro de trabajo', descripcion: 'Obligatorio si tienes local o empleados. Se presenta en la autoridad laboral.', obligatorio: false },
  { id: 'licencias', fase: 4, texto: 'Solicitar licencias y permisos específicos', descripcion: 'Según actividad: licencia de apertura, sanitaria, ambiental, etc.', obligatorio: false },
];

// ===== FUNCIÓN COSTES =====
function calcularCostes(capitalStr: string, numSocios: number, tipo: TipoSociedad) {
  const capital = parseSpanishNumber(capitalStr) || 0;

  // Notaría (escalado por capital + socios)
  let notaria = 150;
  if (capital <= 6000) notaria += 150;
  else if (capital <= 30000) notaria += 250;
  else if (capital <= 60000) notaria += 350;
  else notaria += 500;
  if (tipo === 'SA') notaria += 100;
  if (numSocios > 2) notaria += (numSocios - 2) * 30;

  // Registro Mercantil
  let registro = 100;
  if (capital <= 6000) registro += 50;
  else if (capital <= 30000) registro += 100;
  else if (capital <= 60000) registro += 150;
  else registro += 200;

  const certDenominacion = 20;
  const legalizacionLibros = 30;

  const totalSinGestoria = notaria + registro + certDenominacion + legalizacionLibros;

  return {
    notaria,
    registro,
    certDenominacion,
    legalizacionLibros,
    totalSinGestoria,
    totalConGestoriaMin: totalSinGestoria + 200,
    totalConGestoriaMax: totalSinGestoria + 500,
  };
}

const DATOS_INICIALES: DatosSociedad = {
  denominacion1: '',
  denominacion2: '',
  denominacion3: '',
  capitalSocial: '3.000',
  domicilio: '',
  localidad: '',
  provincia: '',
  codigoPostal: '',
  objetoSocial: '',
  tipoAdministracion: 'unico',
  socios: [{ id: '1', nombre: '', porcentaje: '100' }],
};

// ===== COMPONENTE PRINCIPAL =====
export default function AsistenteConstitucionSociedadPage() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoSociedad>('SL');
  const [tabActiva, setTabActiva] = useState<TabActiva>('checklist');
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [datos, setDatos] = useState<DatosSociedad>(DATOS_INICIALES);
  const [faseAbierta, setFaseAbierta] = useState<number | null>(1);

  // Persistencia localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('meskeia-constitucion-sociedad');
      if (saved) {
        const { tipo, items, datosForm } = JSON.parse(saved);
        if (tipo) setTipoSeleccionado(tipo);
        if (items) setMarcados(new Set(items));
        if (datosForm) setDatos(datosForm);
      }
    } catch { /* ignorar */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('meskeia-constitucion-sociedad', JSON.stringify({
        tipo: tipoSeleccionado,
        items: [...marcados],
        datosForm: datos,
      }));
    } catch { /* ignorar */ }
  }, [tipoSeleccionado, marcados, datos]);

  // Progreso general (solo obligatorios)
  const itemsObligatorios = useMemo(() => CHECKLIST_ITEMS.filter(i => i.obligatorio), []);
  const progresoTotal = useMemo(() => {
    const completados = itemsObligatorios.filter(i => marcados.has(i.id)).length;
    return Math.round((completados / itemsObligatorios.length) * 100);
  }, [marcados, itemsObligatorios]);

  const costes = useMemo(() =>
    calcularCostes(datos.capitalSocial, datos.socios.length, tipoSeleccionado)
  , [datos.capitalSocial, datos.socios.length, tipoSeleccionado]);

  const capitalNum = parseSpanishNumber(datos.capitalSocial) || 0;
  const capitalMinimo = COMPARATIVA[tipoSeleccionado].capitalMinimo;
  const capitalInsuficiente = capitalNum < capitalMinimo;

  const sumaPorcentajes = useMemo(() =>
    datos.socios.reduce((sum, s) => sum + (parseFloat(s.porcentaje) || 0), 0)
  , [datos.socios]);

  const toggleItem = (id: string) => {
    setMarcados(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const actualizarDato = (campo: keyof DatosSociedad, valor: string) => {
    setDatos(prev => ({ ...prev, [campo]: valor }));
  };

  const agregarSocio = () => {
    setDatos(prev => ({
      ...prev,
      socios: [...prev.socios, { id: Date.now().toString(), nombre: '', porcentaje: '0' }],
    }));
  };

  const eliminarSocio = (id: string) => {
    setDatos(prev => ({ ...prev, socios: prev.socios.filter(s => s.id !== id) }));
  };

  const actualizarSocio = (id: string, campo: keyof Socio, valor: string) => {
    setDatos(prev => ({
      ...prev,
      socios: prev.socios.map(s => s.id === id ? { ...s, [campo]: valor } : s),
    }));
  };

  const resetear = () => {
    if (!confirm('¿Reiniciar todos los datos y el checklist?')) return;
    setMarcados(new Set());
    setDatos(DATOS_INICIALES);
    setTipoSeleccionado('SL');
    localStorage.removeItem('meskeia-constitucion-sociedad');
  };

  const progresoFase = (fase: number) => {
    const items = CHECKLIST_ITEMS.filter(i => i.fase === fase);
    const completados = items.filter(i => marcados.has(i.id)).length;
    return { completados, total: items.length, porcentaje: Math.round((completados / items.length) * 100) };
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏢 Asistente Constitución de Sociedad</h1>
        <p className={styles.subtitle}>
          Guía completa para crear una SL, SLU o SA en España: trámites, costes y documentación
        </p>
        <p className={styles.metaVerificado}>
          Información actualizada 2025 ·{' '}
          <a href="https://www.ipyme.org/es-ES/Paginas/Tramitacion.aspx" target="_blank" rel="noopener noreferrer" className={styles.linkFuente}>
            Fuente: IPYME
          </a>
        </p>
      </header>

      <LegalNotice />
      <DisclaimerCard variant="financial" severity="medium" />

      {/* Selector tipo sociedad */}
      <section className={styles.selectorSection}>
        <h2 className={styles.sectionTitle}>¿Qué tipo de sociedad quieres constituir?</h2>
        <div className={styles.tipoGrid}>
          {(Object.entries(COMPARATIVA) as [TipoSociedad, typeof COMPARATIVA.SL][]).map(([tipo, info]) => (
            <button
              key={tipo}
              type="button"
              className={`${styles.tipoCard} ${tipoSeleccionado === tipo ? styles.tipoCardActivo : ''}`}
              onClick={() => setTipoSeleccionado(tipo)}
            >
              <span className={styles.tipoSiglas}>{info.siglas}</span>
              <span className={styles.tipoNombre}>{info.nombre}</span>
              <span className={styles.tipoCapital}>Capital mín.: {formatCurrency(info.capitalMinimo)}</span>
              <span className={styles.tipoIdeal}>{info.idealPara}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Barra progreso global */}
      <div className={styles.progresoGlobal}>
        <div className={styles.progresoGlobalInfo}>
          <span>Progreso: {itemsObligatorios.filter(i => marcados.has(i.id)).length} de {itemsObligatorios.length} trámites obligatorios</span>
          <span className={styles.progresoPct}>{progresoTotal}%</span>
        </div>
        <div className={styles.progresoBar}>
          <div className={styles.progresoFill} style={{ width: `${progresoTotal}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { id: 'checklist' as TabActiva, label: '✅ Checklist', desc: 'Trámites paso a paso' },
          { id: 'datos' as TabActiva, label: '📝 Datos Sociedad', desc: 'Formulario de constitución' },
          { id: 'costes' as TabActiva, label: '💰 Costes Estimados', desc: 'Qué vas a pagar' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActivo : ''}`}
            onClick={() => setTabActiva(tab.id)}
          >
            <span>{tab.label}</span>
            <span className={styles.tabDesc}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* TAB: CHECKLIST */}
      {tabActiva === 'checklist' && (
        <div className={styles.tabContent}>
          {FASES.map(fase => {
            const prog = progresoFase(fase.numero);
            const abierta = faseAbierta === fase.numero;
            return (
              <div key={fase.numero} className={styles.faseCard}>
                <button
                  type="button"
                  className={styles.faseHeader}
                  onClick={() => setFaseAbierta(abierta ? null : fase.numero)}
                  aria-expanded={abierta ? 'true' : 'false'}
                >
                  <div className={styles.faseHeaderLeft}>
                    <span className={styles.faseIcono}>{fase.icono}</span>
                    <div>
                      <span className={styles.faseNombre}>Fase {fase.numero}: {fase.nombre}</span>
                      <span className={styles.faseDescripcion}>{fase.descripcion}</span>
                    </div>
                  </div>
                  <div className={styles.faseHeaderRight}>
                    <span className={styles.faseProg}>{prog.completados}/{prog.total}</span>
                    <span className={styles.faseToggle}>{abierta ? '▲' : '▼'}</span>
                  </div>
                </button>
                <div className={styles.faseMiniBar}>
                  <div className={styles.faseMiniBarFill} style={{ width: `${prog.porcentaje}%` }} />
                </div>
                {abierta && (
                  <div className={styles.faseItems}>
                    {CHECKLIST_ITEMS.filter(i => i.fase === fase.numero).map(item => (
                      <div
                        key={item.id}
                        className={`${styles.checkItem} ${marcados.has(item.id) ? styles.checkItemDone : ''}`}
                      >
                        <label className={styles.checkLabel}>
                          <input
                            type="checkbox"
                            checked={marcados.has(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className={styles.checkbox}
                            aria-label={item.texto}
                          />
                          <div className={styles.checkTexto}>
                            <span className={styles.checkTitulo}>
                              {item.texto}
                              {!item.obligatorio && <span className={styles.optTag}>Opcional</span>}
                            </span>
                            <span className={styles.checkDesc}>{item.descripcion}</span>
                            {item.enlaceUtil && (
                              <a href={item.enlaceUtil.url} target="_blank" rel="noopener noreferrer" className={styles.checkEnlace}>
                                🔗 {item.enlaceUtil.texto}
                              </a>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: DATOS SOCIEDAD */}
      {tabActiva === 'datos' && (
        <div className={styles.tabContent}>
          {/* Denominación */}
          <div className={styles.formSeccion}>
            <h3 className={styles.formSeccionTitulo}>📛 Denominación Social</h3>
            <p className={styles.formSeccionDesc}>Prepara 3 opciones por si alguna ya está registrada.</p>
            {[
              { campo: 'denominacion1' as keyof DatosSociedad, label: '1.ª opción (preferida)', placeholder: 'Ej.: Innovatech Solutions' },
              { campo: 'denominacion2' as keyof DatosSociedad, label: '2.ª opción', placeholder: 'Ej.: Innovatech Digital' },
              { campo: 'denominacion3' as keyof DatosSociedad, label: '3.ª opción', placeholder: 'Ej.: Innovatech Group' },
            ].map(({ campo, label, placeholder }) => (
              <div key={campo} className={styles.campo}>
                <label className={styles.label}>{label}</label>
                <input
                  type="text"
                  value={datos[campo] as string}
                  onChange={e => actualizarDato(campo, e.target.value)}
                  placeholder={placeholder}
                  className={styles.input}
                />
              </div>
            ))}
            {datos.denominacion1 && (
              <div className={styles.previewDenom}>
                <strong>Vista previa:</strong> {datos.denominacion1}, {COMPARATIVA[tipoSeleccionado].siglas.split('/')[0].trim()}
              </div>
            )}
          </div>

          {/* Capital social */}
          <div className={styles.formSeccion}>
            <h3 className={styles.formSeccionTitulo}>💶 Capital Social</h3>
            <NumberInput
              value={datos.capitalSocial}
              onChange={v => actualizarDato('capitalSocial', v)}
              label="Capital social (€)"
              helperText={`Mínimo para ${COMPARATIVA[tipoSeleccionado].nombre}: ${formatCurrency(capitalMinimo)}`}
              min={capitalMinimo}
            />
            {capitalInsuficiente && (
              <p className={styles.alertaCapital}>
                ⚠️ El capital mínimo para {tipoSeleccionado} es {formatCurrency(capitalMinimo)}
              </p>
            )}
          </div>

          {/* Domicilio */}
          <div className={styles.formSeccion}>
            <h3 className={styles.formSeccionTitulo}>📍 Domicilio Social</h3>
            <div className={styles.campo}>
              <label className={styles.label}>Calle y número</label>
              <input type="text" value={datos.domicilio} onChange={e => actualizarDato('domicilio', e.target.value)} placeholder="Calle Mayor, 1" className={styles.input} />
            </div>
            <div className={styles.camposGrid}>
              <div className={styles.campo}>
                <label className={styles.label}>Localidad</label>
                <input type="text" value={datos.localidad} onChange={e => actualizarDato('localidad', e.target.value)} placeholder="Madrid" className={styles.input} />
              </div>
              <div className={styles.campo}>
                <label className={styles.label}>Provincia</label>
                <input type="text" value={datos.provincia} onChange={e => actualizarDato('provincia', e.target.value)} placeholder="Madrid" className={styles.input} />
              </div>
              <div className={styles.campo}>
                <label className={styles.label}>Código postal</label>
                <input type="text" value={datos.codigoPostal} onChange={e => actualizarDato('codigoPostal', e.target.value)} placeholder="28001" className={styles.input} maxLength={5} />
              </div>
            </div>
          </div>

          {/* Objeto social */}
          <div className={styles.formSeccion}>
            <h3 className={styles.formSeccionTitulo}>🎯 Objeto Social</h3>
            <p className={styles.formSeccionDesc}>Describe las actividades de la empresa. Redacción amplia para no limitar futuras actividades.</p>
            <div className={styles.campo}>
              <label className={styles.label}>Objeto social</label>
              <textarea
                value={datos.objetoSocial}
                onChange={e => actualizarDato('objetoSocial', e.target.value)}
                placeholder="La actividad de la sociedad comprenderá: desarrollo, consultoría y comercialización de software y soluciones tecnológicas..."
                className={styles.textarea}
                rows={4}
              />
            </div>
          </div>

          {/* Órgano de administración */}
          <div className={styles.formSeccion}>
            <h3 className={styles.formSeccionTitulo}>👔 Órgano de Administración</h3>
            <div className={styles.radioGroup}>
              {[
                { val: 'unico', label: 'Administrador único', desc: '1 persona, más sencillo' },
                { val: 'solidarios', label: 'Administradores solidarios', desc: 'Cada uno actúa de forma independiente' },
                { val: 'mancomunados', label: 'Administradores mancomunados', desc: 'Deben actuar conjuntamente' },
                { val: 'consejo', label: 'Consejo de administración', desc: '3+ miembros, más formalidad' },
              ].map(({ val, label, desc }) => (
                <label key={val} className={`${styles.radioCard} ${datos.tipoAdministracion === val ? styles.radioCardActivo : ''}`}>
                  <input
                    type="radio"
                    name="tipoAdmin"
                    value={val}
                    checked={datos.tipoAdministracion === val}
                    onChange={() => actualizarDato('tipoAdministracion', val)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>{label}</span>
                  <span className={styles.radioDesc}>{desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Socios fundadores */}
          <div className={styles.formSeccion}>
            <h3 className={styles.formSeccionTitulo}>👥 Socios Fundadores</h3>
            <p className={styles.formSeccionDesc}>
              Los porcentajes deben sumar 100%.{' '}
              {sumaPorcentajes !== 100 && <span className={styles.alertaPct}>Suma actual: {sumaPorcentajes.toFixed(1)}%</span>}
              {sumaPorcentajes === 100 && <span className={styles.okPct}>✅ Suma correcta</span>}
            </p>
            {datos.socios.map((socio, i) => (
              <div key={socio.id} className={styles.socioRow}>
                <span className={styles.socioNum}>{i + 1}</span>
                <input
                  type="text"
                  value={socio.nombre}
                  onChange={e => actualizarSocio(socio.id, 'nombre', e.target.value)}
                  placeholder="Nombre completo / Razón social"
                  className={styles.inputSocio}
                  aria-label={`Nombre socio ${i + 1}`}
                />
                <div className={styles.pctWrapper}>
                  <input
                    type="number"
                    value={socio.porcentaje}
                    onChange={e => actualizarSocio(socio.id, 'porcentaje', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className={styles.inputPct}
                    aria-label={`Porcentaje socio ${i + 1}`}
                  />
                  <span className={styles.pctLabel}>%</span>
                </div>
                {datos.socios.length > 1 && (
                  <button type="button" onClick={() => eliminarSocio(socio.id)} className={styles.btnEliminar} aria-label="Eliminar socio">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={agregarSocio} className={styles.btnAgregarSocio}>
              + Añadir socio
            </button>
          </div>

          <button type="button" onClick={resetear} className={styles.btnResetear}>
            🔄 Reiniciar todos los datos
          </button>
        </div>
      )}

      {/* TAB: COSTES */}
      {tabActiva === 'costes' && (
        <div className={styles.tabContent}>
          <div className={styles.costesCard}>
            <h3 className={styles.costesTitulo}>Estimación para {COMPARATIVA[tipoSeleccionado].nombre}</h3>
            <p className={styles.costesDesc}>
              Capital social: {datos.capitalSocial ? formatCurrency(capitalNum) : 'no definido'} ·
              {datos.socios.length} {datos.socios.length === 1 ? 'socio' : 'socios'}
            </p>

            <table className={styles.tablaCoste}>
              <tbody>
                <tr>
                  <td>Notaría (escritura de constitución)</td>
                  <td className={styles.costeValor}>{formatCurrency(costes.notaria)}</td>
                </tr>
                <tr>
                  <td>Registro Mercantil</td>
                  <td className={styles.costeValor}>{formatCurrency(costes.registro)}</td>
                </tr>
                <tr>
                  <td>Certificación negativa denominación</td>
                  <td className={styles.costeValor}>{formatCurrency(costes.certDenominacion)}</td>
                </tr>
                <tr>
                  <td>Legalización libros obligatorios</td>
                  <td className={styles.costeValor}>{formatCurrency(costes.legalizacionLibros)}</td>
                </tr>
                <tr className={styles.filaTotal}>
                  <td><strong>Total sin gestoría</strong></td>
                  <td className={styles.costeValorTotal}><strong>{formatCurrency(costes.totalSinGestoria)}</strong></td>
                </tr>
                <tr className={styles.filaGestoria}>
                  <td>Gestoría (opcional)</td>
                  <td className={styles.costeValor}>{formatCurrency(200)} – {formatCurrency(500)}</td>
                </tr>
                <tr className={styles.filaTotal}>
                  <td><strong>Total con gestoría</strong></td>
                  <td className={styles.costeValorTotal}>
                    <strong>{formatCurrency(costes.totalConGestoriaMin)} – {formatCurrency(costes.totalConGestoriaMax)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className={styles.costesResumen}>
              <div className={styles.costesResumenItem}>
                <span>Capital social (queda en la empresa)</span>
                <span>{capitalNum > 0 ? formatCurrency(capitalNum) : '—'}</span>
              </div>
              <div className={`${styles.costesResumenItem} ${styles.costesResumenTotal}`}>
                <span>Inversión total aproximada</span>
                <span>{capitalNum > 0 ? `${formatCurrency(capitalNum + costes.totalConGestoriaMin)} – ${formatCurrency(capitalNum + costes.totalConGestoriaMax)}` : '—'}</span>
              </div>
            </div>

            <div className={styles.costesNotas}>
              <p>✅ El <strong>ITPyAJD</strong> está exento desde 2010 (solo hay que presentar el modelo).</p>
              <p>✅ El capital social no es un gasto: queda disponible en la cuenta de la empresa.</p>
              <p>💡 La constitución electrónica (PAE/CIRCE) puede reducir plazos y algunos costes.</p>
              <p>💡 Algunos bancos ofrecen cuenta de constitución sin comisiones para startups.</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Por qué constituir una sociedad?"
        subtitle="Ventajas, diferencias y preguntas frecuentes"
      >
        <section className={styles.guideSection}>
          <h2>Ventajas de Constituir una Sociedad</h2>
          <div className={styles.ventajasGrid}>
            <div className={styles.ventajaCard}>
              <h4>🛡️ Responsabilidad limitada</h4>
              <p>Los socios solo responden con el capital aportado. Tu patrimonio personal queda protegido frente a deudas de la empresa.</p>
            </div>
            <div className={styles.ventajaCard}>
              <h4>💸 Ventaja fiscal (a partir de ciertos ingresos)</h4>
              <p>El Impuesto de Sociedades (IS) tiene tipo general del 25% (15% para nuevas empresas los 2 primeros años con base positiva). Puede ser más ventajoso que IRPF si facturas más de 40.000–50.000 €/año.</p>
            </div>
            <div className={styles.ventajaCard}>
              <h4>🤝 Imagen profesional</h4>
              <p>Muchos clientes y proveedores, especialmente empresas grandes, prefieren trabajar con sociedades. Facilita la contratación pública.</p>
            </div>
            <div className={styles.ventajaCard}>
              <h4>📈 Facilita la inversión</h4>
              <p>Permite incorporar socios inversores, emitir participaciones/acciones y acceder a financiación más estructurada (capital riesgo, rondas).</p>
            </div>
          </div>

          <h3>SL vs SA: ¿Cuándo elegir cada una?</h3>
          <div className={styles.comparativaTabla}>
            <table>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>SL / SLU</th>
                  <th>SA</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Capital mínimo</td><td>3.000 €</td><td>60.000 €</td></tr>
                <tr><td>División del capital</td><td>Participaciones</td><td>Acciones</td></tr>
                <tr><td>Transmisión</td><td>Restringida</td><td>Libre (salvo estatutos)</td></tr>
                <tr><td>Complejidad</td><td>Media</td><td>Alta</td></tr>
                <tr><td>Ideal para</td><td>Pymes, startups</td><td>Grandes empresas, cotización</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            {[
              { p: '¿Cuánto tarda constituir una SL?', r: 'Entre 1 y 3 semanas si todo va bien. Con PAE/CIRCE puede hacerse en 24-48 horas en algunos casos. El cuello de botella suele ser el Registro Mercantil (5-15 días hábiles).' },
              { p: '¿Puedo constituir una SL con 1 € de capital?', r: 'Desde 2023 existe la SL con capital inferior a 3.000 € (mínimo 1 €), pero con restricciones: debes destinar el 20% de beneficios a reservas hasta llegar a 3.000 €, y tienes responsabilidad personal mientras no alcances ese mínimo.' },
              { p: '¿Tiene que darse de alta el administrador en autónomos?', r: 'Depende. Si eres socio con >25% de participación en una SL (o >50% en SA) y trabajas para la empresa, debes darte de alta en RETA (autónomos). Si eres administrador sin sueldo y sin participación significativa, puede que no.' },
              { p: '¿Puedo poner mi domicilio particular como domicilio social?', r: 'Sí, es perfectamente legal. Muchas startups lo hacen al inicio. Recuerda que es información pública en el Registro Mercantil.' },
            ].map(({ p, r }, i) => (
              <details key={i} className={styles.faqItem}>
                <summary>{p}</summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 1: Tabla comparativa ampliada ── */}
        <section className={styles.guideSection}>
          <h2>Comparativa completa: SL, SL formación sucesiva, SLU y SA</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>SL estándar</th>
                  <th>SL formación sucesiva (1 €)</th>
                  <th>SLU (unipersonal)</th>
                  <th>SA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Capital mínimo</td>
                  <td>3.000 €</td>
                  <td>Desde 1 €</td>
                  <td>3.000 €</td>
                  <td>60.000 €</td>
                </tr>
                <tr>
                  <td>Número de socios</td>
                  <td>1 o más</td>
                  <td>1 o más</td>
                  <td>Solo 1</td>
                  <td>1 o más</td>
                </tr>
                <tr>
                  <td>Responsabilidad durante formación</td>
                  <td>Limitada al capital</td>
                  <td>Personal del administrador hasta alcanzar 3.000 €</td>
                  <td>Limitada al capital</td>
                  <td>Limitada al capital (25% desembolsado)</td>
                </tr>
                <tr>
                  <td>Distribución de beneficios</td>
                  <td>Libre entre socios</td>
                  <td>20% a reservas obligatorias hasta 3.000 €</td>
                  <td>Al único socio</td>
                  <td>Dividendos proporcionales a acciones</td>
                </tr>
                <tr>
                  <td>Cotización en bolsa</td>
                  <td>No</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Sí (si cumple requisitos)</td>
                </tr>
                <tr>
                  <td>Tiempo de constitución</td>
                  <td>1–3 semanas</td>
                  <td>1–3 semanas</td>
                  <td>1–3 semanas</td>
                  <td>2–4 semanas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Qué forma jurídica encaja con tu situación?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                <strong>Startup tecnológica de 2 socios</strong>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Forma recomendada:</strong> SL estándar con 3.000 € (reparto 50/50).
                Incluye en los estatutos un <em>derecho de tanteo</em> para que ningún socio pueda vender
                su participación a un tercero sin ofrecérsela antes al otro.
              </p>
              <p className={styles.escenarioTip}>
                Redacta también un pacto de socios privado que regule la salida, el vesting y las
                decisiones estratégicas — es el documento más importante que firmarás.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💡</span>
                <strong>Emprendedor solo con poco capital</strong>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Forma recomendada:</strong> SLU con capital 1 € (formación sucesiva).
                Puedes empezar con capital mínimo, pero el administrador responde personalmente
                mientras el patrimonio neto sea inferior a 3.000 €.
              </p>
              <p className={styles.escenarioTip}>
                Obligación especial: destinar el 20% de cada ejercicio con beneficios a reservas
                hasta llegar a los 3.000 €. Puedes no repartir dividendos hasta entonces.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
                <strong>Empresa familiar</strong>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Forma recomendada:</strong> SL con pacto de socios para evitar conflictos
                sucesorios. Define con claridad qué pasa cuando un socio fallece, se divorcia o quiere
                salir: ¿a qué precio? ¿con qué plazo?
              </p>
              <p className={styles.escenarioTip}>
                Considera incluir una cláusula de <em>tag-along</em> (los socios menores pueden
                vender en las mismas condiciones que el mayoritario) y <em>drag-along</em>
                (el mayoritario puede arrastrar a los demás en una venta).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
                <strong>Empresa que quiere escalar e incorporar inversores</strong>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Forma recomendada:</strong> SL convertible a SA. Empieza como SL (más
                ágil y barata), e incluye en los estatutos la posibilidad de ampliar capital
                mediante rondas de inversión y de transformarte en SA si llegas a necesitar
                cotizar en bolsa.
              </p>
              <p className={styles.escenarioTip}>
                Define desde el inicio las condiciones de <em>dilución preferente</em> y el
                <em>derecho de asistencia</em> para inversores. Algunos business angels lo exigen
                antes de firmar el term sheet.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ampliada ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes (ampliado)</h2>
          <ul className={styles.faqListPro}>
            {[
              {
                p: '¿Cuánto tiempo tarda realmente constituir una SL paso a paso?',
                r: 'El proceso completo dura entre 10 y 20 días hábiles en condiciones normales. El desglose es: 1-5 días para la certificación negativa del nombre; 1 día para la firma notarial; 5-15 días para la inscripción en el Registro Mercantil provincial. Con CIRCE/PAE telemático puede comprimirse a 24-48 horas en casos simples.',
              },
              {
                p: '¿Puedo constituir una SL de forma telemática sin ir al notario?',
                r: 'Sí, pero con matices. La plataforma CIRCE permite tramitar la constitución íntegramente online si usas estatutos tipo del Ministerio. Sin embargo, si necesitas estatutos personalizados o hay socios extranjeros sin certificado digital español, la comparecencia presencial ante notario sigue siendo necesaria.',
              },
              {
                p: '¿Qué son los estatutos sociales y qué deben incluir obligatoriamente?',
                r: 'Los estatutos son la "constitución interna" de la empresa. Por ley deben incluir: denominación social, objeto social, domicilio, capital social y participaciones, órgano de administración y sus facultades, y el sistema de toma de decisiones en la junta de socios. Todo lo demás (derechos especiales, restricciones de transmisión, etc.) es opcional pero muy recomendable.',
              },
              {
                p: '¿Cuándo es mejor optar por SLU frente a SL con socios?',
                r: 'La SLU es adecuada cuando eres el único propietario del negocio y no prevés incorporar socios en el corto plazo. Las ventajas son gestión más ágil y sin necesidad de convocar juntas formales. El inconveniente: toda la responsabilidad (y el capital) recae en ti, y debes inscribir la condición unipersonal en el Registro si la situación cambia.',
              },
              {
                p: '¿Qué es el pacto de socios y por qué es tan importante?',
                r: 'El pacto de socios es un contrato privado entre los socios (no inscrito en el Registro) que regula materias sensibles: reparto de beneficios, procedimiento de salida, penalizaciones por incumplimiento, vesting de participaciones, toma de decisiones estratégicas y resolución de conflictos. No es obligatorio, pero su ausencia es la causa número uno de conflictos societarios que acaban en disolución.',
              },
              {
                p: '¿Puedo ser administrador y cobrar si soy el único socio?',
                r: 'Sí. El administrador único puede percibir retribución si así lo establecen los estatutos o lo aprueba la junta. En la práctica, la forma más habitual es la "nómina de administrador" o el contrato mercantil. Si además trabajas para la empresa de forma habitual y eres socio con más del 25% del capital, debes darte de alta en el RETA (autónomos) independientemente de si cobras nómina.',
              },
              {
                p: '¿Qué pasa si la empresa no genera beneficios el primer año?',
                r: 'Nada especial desde el punto de vista societario: una sociedad puede tener pérdidas. Deberás presentar igualmente el Impuesto de Sociedades (IS) con base imponible negativa o cero, y depositar las Cuentas Anuales en el Registro Mercantil antes del 30 de julio del año siguiente. Las pérdidas pueden compensarse con beneficios futuros durante los 15 años siguientes.',
              },
              {
                p: '¿Cómo se cierra o disuelve una SL si no funciona?',
                r: 'El proceso de disolución y liquidación requiere: acuerdo de la junta de socios, nombramiento de liquidadores, pago de todas las deudas, distribución del remanente entre socios, escritura de extinción ante notario e inscripción en el Registro Mercantil. Si hay deudas pendientes, los socios no pueden repartir nada. El proceso completo puede durar entre 3 y 12 meses.',
              },
            ].map(({ p, r }, i) => (
              <li key={i} className={styles.faqItemPro}>
                <strong>{p}</strong>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía paso a paso ── */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: cómo constituir una SL en España</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Certificación negativa del nombre</strong>
                <span>Solicitar en el Registro Mercantil Central (RMC) que el nombre elegido no coincide con ninguna sociedad ya inscrita. Coste: <strong>13,52 €</strong>. Plazo: <strong>1–5 días hábiles</strong>. Válida 6 meses.</span>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Redacción de estatutos sociales</strong>
                <span>Puedes usar los <em>estatutos tipo</em> del Ministerio de Justicia — son gratuitos y válidos para la mayoría de pymes. Si necesitas cláusulas especiales (derechos de socios, restricciones de transmisión, etc.), el notario o un abogado mercantilista puede redactarlos a medida (~400–800 €).</span>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Apertura de cuenta bancaria y depósito del capital social</strong>
                <span>Abrir una cuenta a nombre de «[Nombre], S.L. en constitución» y depositar el capital: <strong>3.000 €</strong> (SL estándar / SLU) o <strong>desde 1 €</strong> (formación sucesiva) o <strong>15.000 € mínimo</strong> (SA, con 25% del total). El banco emite un certificado del depósito que debes llevar al notario.</span>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Escritura de constitución ante notario</strong>
                <span>Todos los socios firman la escritura en la notaría. Coste estimado: <strong>600–900 €</strong> (varía según capital y número de socios). Duración: <strong>1 día</strong>. Pide varias copias simples además de la copia autorizada.</span>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Autoliquidación ITP-AJD — operaciones societarias</strong>
                <span>Desde 2010 las constituciones de sociedades están <strong>exentas</strong> del ITP-AJD, pero es obligatorio presentar el modelo correspondiente (modelo 600 o el de cada CCAA) con cuota cero. Plazo: 30 días hábiles desde la escritura.</span>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Inscripción en el Registro Mercantil provincial</strong>
                <span>Presentar la escritura en el Registro de la provincia del domicilio social. Coste estimado: <strong>300–400 €</strong>. Plazo: <strong>5–15 días hábiles</strong>. La inscripción otorga personalidad jurídica plena a la sociedad.</span>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>NIF definitivo + alta en Hacienda + RETA (si procede)</strong>
                <span>Una vez inscrita, solicitar el NIF definitivo en la AEAT presentando la escritura y el modelo 036. Si el administrador es socio con &gt;25% y trabaja para la sociedad, debe darse de alta en el <strong>RETA</strong> (autónomos) en Seguridad Social. También debes darte de alta en el epígrafe del IAE correspondiente si la facturación prevista supera 1 M€.</span>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores prácticas ── */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas al constituir tu sociedad</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '📄', tip: 'Usa los estatutos tipo del Ministerio de Justicia si no tienes necesidades especiales. Son gratuitos, están actualizados y puedes ahorrarte ~400 € en honorarios de redacción.' },
              { icon: '🤝', tip: 'Redacta un pacto de socios privado para temas sensibles: reparto de beneficios, cláusulas de salida, bloqueo de decisiones críticas y procedimiento en caso de desacuerdo. No es público pero es vinculante entre socios.' },
              { icon: '💶', tip: 'El capital social de 3.000 € no queda bloqueado: puede utilizarse desde el primer día para cubrir gastos de la empresa (alquiler, herramientas, salarios). No es un depósito intocable.' },
              { icon: '⚡', tip: 'Usa la vía telemática CIRCE/PAE si necesitas velocidad. En casos simples (estatutos tipo, socios residentes en España con certificado digital) el proceso puede completarse en 24–48 horas.' },
              { icon: '🎯', tip: 'Redacta el objeto social de forma amplia. Un objeto demasiado restringido obliga a modificar los estatutos (notaría + Registro) si cambias o amplías tu actividad, con el coste y tiempo que eso implica.' },
              { icon: '™️', tip: 'Registra la marca en la OEPM antes de constituir la sociedad. El nombre puede estar disponible en el Registro Mercantil y sin embargo estar registrado como marca. Compruébalo en la base de datos TMview antes de invertir.' },
            ].map(({ icon, tip }, i) => (
              <div key={i} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{icon}</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning — errores comunes ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores comunes al constituir una sociedad</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Constituir con capital 1 € sin entender las obligaciones:</strong> debes
                destinar el 20% de los beneficios a reservas hasta llegar a 3.000 €, y el
                administrador responde personalmente con su patrimonio mientras el capital neto sea
                inferior a ese umbral.
              </li>
              <li>
                <strong>No firmar un pacto de socios desde el inicio:</strong> los conflictos entre
                socios son la causa número uno de cierre de pymes en España. Un pacto claro desde el
                día 1 previene litigios costosos y rupturas destructivas.
              </li>
              <li>
                <strong>Olvidar que el NIF provisional no sirve para todo:</strong> con el NIF
                provisional no puedes facturar a clientes internacionales ni operar con normalidad en
                la AEAT. Obtén el NIF definitivo en cuanto se inscriba la sociedad.
              </li>
              <li>
                <strong>No depositar las Cuentas Anuales a tiempo:</strong> deben depositarse en el
                Registro Mercantil antes del 30 de julio (6 meses después del cierre del ejercicio).
                El incumplimiento conlleva una sanción de entre 1.200 € y 60.000 €, además del
                cierre registral.
              </li>
              <li>
                <strong>Mezclar cuentas personales y de empresa desde el primer mes:</strong> invalida
                deducciones fiscales, complica la contabilidad y puede generar responsabilidad personal.
                Abre una cuenta corporativa desde el primer día.
              </li>
              <li>
                <strong>Nombrar administrador sin revisar el alta en RETA:</strong> si el administrador
                posee más del 25% de las participaciones y trabaja habitualmente para la sociedad, está
                obligado a darse de alta en el RETA. No hacerlo genera deudas con la Seguridad Social
                con recargo e intereses.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <ShareCard appName="asistente-constitucion-sociedad" />
      <RelatedApps apps={getRelatedApps('asistente-constitucion-sociedad')} />
      <Footer appName="asistente-constitucion-sociedad" />
    </div>
  );
}
