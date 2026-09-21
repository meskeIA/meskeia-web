'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styles from './CalculadoraSuscripciones.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Suscripcion {
  id: string;
  nombre: string;
  precio: number;
  ciclo: 'mensual' | 'anual' | 'semanal';
  categoria: string;
  activa: boolean;
  fechaInicio?: string;
}

// Categorías predefinidas con iconos
const categorias = [
  { id: 'streaming', nombre: 'Streaming', icon: '📺' },
  { id: 'musica', nombre: 'Música', icon: '🎵' },
  { id: 'gaming', nombre: 'Gaming', icon: '🎮' },
  { id: 'productividad', nombre: 'Productividad', icon: '💼' },
  { id: 'fitness', nombre: 'Fitness', icon: '💪' },
  { id: 'noticias', nombre: 'Noticias/Medios', icon: '📰' },
  { id: 'almacenamiento', nombre: 'Almacenamiento', icon: '☁️' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
];

// Suscripciones populares para sugerir
const suscripcionesPopulares = [
  { nombre: 'Netflix', precio: 12.99, categoria: 'streaming' },
  { nombre: 'Spotify', precio: 10.99, categoria: 'musica' },
  { nombre: 'HBO Max', precio: 8.99, categoria: 'streaming' },
  { nombre: 'Amazon Prime', precio: 4.99, categoria: 'streaming' },
  { nombre: 'Disney+', precio: 8.99, categoria: 'streaming' },
  { nombre: 'YouTube Premium', precio: 11.99, categoria: 'streaming' },
  { nombre: 'Apple Music', precio: 10.99, categoria: 'musica' },
  { nombre: 'Xbox Game Pass', precio: 12.99, categoria: 'gaming' },
  { nombre: 'PlayStation Plus', precio: 8.99, categoria: 'gaming' },
  { nombre: 'Gimnasio', precio: 30, categoria: 'fitness' },
  { nombre: 'iCloud', precio: 2.99, categoria: 'almacenamiento' },
  { nombre: 'Google One', precio: 1.99, categoria: 'almacenamiento' },
  { nombre: 'Microsoft 365', precio: 7, categoria: 'productividad' },
  { nombre: 'ChatGPT Plus', precio: 20, categoria: 'productividad' },
  { nombre: 'Notion', precio: 8, categoria: 'productividad' },
];

const STORAGE_KEY = 'meskeia_suscripciones';

/**
 * Las tres conversiones del cálculo, juntas y con su origen a la vista.
 *
 * ⚠️ 2026-09-21 (hallazgos 1077 y 1078 del Inspector): estaban dispersas y no cuadraban
 *    entre sí — la semana se mensualizaba con 4,33 (año de 51,96 semanas) y el importe
 *    diario se sacaba dividiendo entre 30 (año de 360 días), de modo que el diario × 365
 *    no devolvía el anual que la propia app mostraba, con un 1,4 % de desvío.
 */
const MESES_ANO = 12;
/** 365,25 días: incluye el bisiesto, que en 20 años son cinco días de suscripción */
const DIAS_ANO = 365.25;
/** 52,18 semanas al año repartidas en 12 meses (no 4,33) */
const SEMANAS_MES = (DIAS_ANO / 7) / MESES_ANO;

export default function CalculadoraSuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');

  /**
   * El formulario de alta es un MODAL, y hasta el 21/09/2026 no era un diálogo (hallazgo
   * 1080): un div sin role ni aria-modal, que no se llevaba el foco al abrirse ni lo
   * devolvía al cerrarse, no atrapaba la tabulación —se podía tabular a la página de
   * detrás, que seguía siendo operable— y no se cerraba con Escape. El único cierre era
   * un clic en el overlay, un div sin rol ni equivalente de teclado. Con lector de
   * pantalla o solo con teclado era un callejón sin salida.
   */
  const modalRef = useRef<HTMLDivElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);
  const [ciclo, setCiclo] = useState<'mensual' | 'anual' | 'semanal'>('mensual');
  const [categoria, setCategoria] = useState('streaming');

  // Cargar del localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSuscripciones(JSON.parse(saved));
      } catch {
        // Ignorar errores de parse
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suscripciones));
  }, [suscripciones]);

  /**
   * Cierra el modal y deja el formulario como estaba.
   *
   * Es un `useCallback` sin dependencias —los setters de estado son estables— para poder
   * citarla en las dependencias del efecto del diálogo sin silenciar la regla de hooks:
   * silenciar la regla aquí sería tapar el aviso en vez de cumplirlo.
   */
  const limpiarFormulario = useCallback(() => {
    setErrorFormulario('');
    setNombre('');
    setPrecio('');
    setCiclo('mensual');
    setCategoria('streaming');
    setMostrarFormulario(false);
    setEditandoId(null);
  }, []);

  // Diálogo modal: foco al abrir, Escape para cerrar, tabulación atrapada y foco devuelto.
  useEffect(() => {
    if (!mostrarFormulario) return;

    focoPrevio.current = document.activeElement as HTMLElement | null;
    const primero = modalRef.current?.querySelector<HTMLElement>('input, select, button');
    primero?.focus();

    const alPulsarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        limpiarFormulario();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusables = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'input, select, textarea, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;
      const inicio = focusables[0];
      const fin = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === inicio) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && document.activeElement === fin) {
        e.preventDefault();
        inicio.focus();
      }
    };

    document.addEventListener('keydown', alPulsarTecla);
    return () => {
      document.removeEventListener('keydown', alPulsarTecla);
      focoPrevio.current?.focus();
    };
  }, [mostrarFormulario, limpiarFormulario]);

  // Calcular totales
  const totales = useMemo(() => {
    // ⚠️ 2026-09-21 (hallazgos 1077 y 1078): la semana se mensualizaba con 4,33, de modo
    //    que el año efectivo salían 51,96 semanas y no 52 —siempre a la baja, justo en una
    //    app cuyo argumento es que el total anual sorprende—, y el importe diario se
    //    obtenía dividiendo entre 30, lo que implicaba un año de 360 días: multiplicar por
    //    365 el diario que la app mostraba no devolvía su propio anual.
    //    Ahora las tres cifras salen del MISMO año de 365,25 días.

    const activas = suscripciones.filter(s => s.activa);

    const mensualizar = (s: Suscripcion): number => {
      if (s.ciclo === 'anual') return s.precio / MESES_ANO;
      if (s.ciclo === 'semanal') return s.precio * SEMANAS_MES;
      return s.precio;
    };

    let mensual = 0;
    activas.forEach(s => { mensual += mensualizar(s); });

    const anual = mensual * MESES_ANO;
    const diario = anual / DIAS_ANO;

    // Por categoría
    const porCategoria: Record<string, number> = {};
    activas.forEach(s => {
      porCategoria[s.categoria] = (porCategoria[s.categoria] || 0) + mensualizar(s);
    });

    return { mensual, anual, diario, porCategoria, totalActivas: activas.length };
  }, [suscripciones]);

  // Añadir suscripción
  const agregarSuscripcion = () => {
    setErrorFormulario('');
    if (!nombre.trim()) {
      setErrorFormulario('Pon un nombre a la suscripción.');
      return;
    }

    // ⚠️ 2026-09-21 (hallazgos 1074-1076): el precio se parseaba con
    //    parseFloat sobre un replace de la coma, que sustituye solo la PRIMERA y deja
    //    el punto de millar español haciendo de decimal. La app pide formato español en el
    //    propio placeholder («0,00»), así que «1.234,56» se guardaba como 1,23 €: tres
    //    órdenes de magnitud por debajo, en silencio y con formato de salida impecable.
    //    Y el único filtro era `!precio`, de modo que «abc» entraba como NaN y se
    //    propagaba a las tres tarjetas, al desglose y a la anchura de las barras; un
    //    precio negativo, también.
    const precioNumero = parseSpanishNumber(precio);
    if (Number.isNaN(precioNumero)) {
      setErrorFormulario('El precio tiene que ser un número. Escríbelo en formato español, como 12,99 o 1.234,56.');
      return;
    }
    if (precioNumero < 0) {
      setErrorFormulario('El precio no puede ser negativo.');
      return;
    }

    const nueva: Suscripcion = {
      id: editandoId || Date.now().toString(),
      nombre: nombre.trim(),
      precio: precioNumero,
      ciclo,
      categoria,
      activa: true,
      fechaInicio: new Date().toISOString().split('T')[0],
    };

    if (editandoId) {
      setSuscripciones(prev => prev.map(s => s.id === editandoId ? nueva : s));
      setEditandoId(null);
    } else {
      setSuscripciones(prev => [...prev, nueva]);
    }

    limpiarFormulario();
  };

  // Editar suscripción
  const editarSuscripcion = (s: Suscripcion) => {
    setNombre(s.nombre);
    // `toString()` producía formato US («12.99») en un campo cuyo placeholder es «0,00»
    // y en una app que en todo lo demás escribe en español (hallazgo 1079).
    setPrecio(formatNumber(s.precio, 2));
    setCiclo(s.ciclo);
    setCategoria(s.categoria);
    setEditandoId(s.id);
    setMostrarFormulario(true);
  };

  // Toggle activa
  const toggleActiva = (id: string) => {
    setSuscripciones(prev =>
      prev.map(s => s.id === id ? { ...s, activa: !s.activa } : s)
    );
  };

  // Eliminar suscripción
  const eliminarSuscripcion = (id: string) => {
    setSuscripciones(prev => prev.filter(s => s.id !== id));
  };

  // Añadir popular
  const agregarPopular = (pop: typeof suscripcionesPopulares[0]) => {
    const existe = suscripciones.find(s =>
      s.nombre.toLowerCase() === pop.nombre.toLowerCase()
    );
    if (existe) return;

    const nueva: Suscripcion = {
      id: Date.now().toString(),
      nombre: pop.nombre,
      precio: pop.precio,
      ciclo: 'mensual',
      categoria: pop.categoria,
      activa: true,
      fechaInicio: new Date().toISOString().split('T')[0],
    };
    setSuscripciones(prev => [...prev, nueva]);
  };

  // Obtener icono de categoría
  const getIcono = (catId: string) => {
    return categorias.find(c => c.id === catId)?.icon || '📦';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Suscripciones</h1>
        <p className={styles.subtitle}>
          Controla tus gastos recurrentes y descubre cuánto pagas realmente
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        collapsible={false}
        context="calculadora-suscripciones"
      />

      <div className={styles.mainContent}>
        {/* Resumen de gastos */}
        <section className={styles.resumenPanel}>
          <div className={styles.resumenGrid} role="status" aria-live="polite" aria-atomic="true">
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Gasto mensual</span>
              <span className={styles.resumenValor}>{formatCurrency(totales.mensual)}</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Gasto anual</span>
              <span className={styles.resumenValor}>{formatCurrency(totales.anual)}</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Por día</span>
              <span className={styles.resumenValor}>{formatCurrency(totales.diario)}</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Suscripciones activas</span>
              <span className={styles.resumenValor}>{totales.totalActivas}</span>
            </div>
          </div>
        </section>

        {/* Desglose por categoría */}
        {Object.keys(totales.porCategoria).length > 0 && (
          <section className={styles.categoriasPanel}>
            <h2 className={styles.sectionTitle}>Gasto por categoría</h2>
            <div className={styles.categoriasGrid}>
              {Object.entries(totales.porCategoria)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, monto]) => (
                  <div key={cat} className={styles.categoriaItem}>
                    <span className={styles.categoriaIcono} aria-hidden="true">{getIcono(cat)}</span>
                    <span className={styles.categoriaNombre}>
                      {categorias.find(c => c.id === cat)?.nombre || cat}
                    </span>
                    <span className={styles.categoriaMonto}>{formatCurrency(monto)}/mes</span>
                    <div
                      className={styles.categoriaBarra}
                      style={{ width: `${(monto / totales.mensual) * 100}%` }}
                    />
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Lista de suscripciones */}
        <section className={styles.listaPanel}>
          <div className={styles.listaHeader}>
            <h2 className={styles.sectionTitle}>Mis suscripciones</h2>
            <button
              type="button"
              className={styles.btnAgregar}
              onClick={() => setMostrarFormulario(true)}
            >
              + Añadir
            </button>
          </div>

          {suscripciones.length === 0 ? (
            <p className={styles.sinSuscripciones}>
              No tienes suscripciones registradas. Añade una o elige de las populares.
            </p>
          ) : (
            <div className={styles.suscripcionesLista}>
              {suscripciones.map(s => (
                <div
                  key={s.id}
                  className={`${styles.suscripcionItem} ${!s.activa ? styles.inactiva : ''}`}
                >
                  <div className={styles.suscripcionInfo}>
                    <span className={styles.suscripcionIcono} aria-hidden="true">{getIcono(s.categoria)}</span>
                    <div className={styles.suscripcionTexto}>
                      <span className={styles.suscripcionNombre}>{s.nombre}</span>
                      <span className={styles.suscripcionCiclo}>
                        {s.ciclo === 'mensual' && 'Mensual'}
                        {s.ciclo === 'anual' && 'Anual'}
                        {s.ciclo === 'semanal' && 'Semanal'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.suscripcionPrecio}>
                    {formatCurrency(s.precio)}
                    <span className={styles.precioCiclo}>
                      /{s.ciclo === 'mensual' ? 'mes' : s.ciclo === 'anual' ? 'año' : 'sem'}
                    </span>
                  </div>
                  <div className={styles.suscripcionAcciones}>
                    <button
                      type="button"
                      className={`${styles.btnToggle} ${s.activa ? styles.activo : ''}`}
                      onClick={() => toggleActiva(s.id)}
                      aria-pressed={s.activa}
                      aria-label={s.activa ? `Pausar ${s.nombre}` : `Activar ${s.nombre}`}
                    >
                      {s.activa ? '✓' : '○'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnEditar}
                      onClick={() => editarSuscripcion(s)}
                      aria-label={`Editar ${s.nombre}`}
                    >
                      <span aria-hidden="true">✏️</span>
                    </button>
                    <button
                      type="button"
                      className={styles.btnEliminar}
                      onClick={() => eliminarSuscripcion(s.id)}
                      aria-label={`Eliminar ${s.nombre}`}
                    >
                      <span aria-hidden="true">🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Suscripciones populares */}
        <section className={styles.popularesPanel}>
          <h2 className={styles.sectionTitle}>Añadir suscripción popular</h2>
          <div className={styles.popularesGrid}>
            {suscripcionesPopulares.map(pop => {
              const yaExiste = suscripciones.some(
                s => s.nombre.toLowerCase() === pop.nombre.toLowerCase()
              );
              return (
                <button
                  key={pop.nombre}
                  type="button"
                  className={`${styles.popularBtn} ${yaExiste ? styles.yaExiste : ''}`}
                  onClick={() => agregarPopular(pop)}
                  disabled={yaExiste}
                >
                  <span className={styles.popularIcono} aria-hidden="true">{getIcono(pop.categoria)}</span>
                  <span className={styles.popularNombre}>{pop.nombre}</span>
                  <span className={styles.popularPrecio}>{formatCurrency(pop.precio)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Modal de formulario */}
        {mostrarFormulario && (
          <div className={styles.modalOverlay} onClick={limpiarFormulario} aria-hidden="true" />
        )}
        {mostrarFormulario && (
          <div className={styles.modalCapa}>
            <div
              ref={modalRef}
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-titulo"
              onClick={e => e.stopPropagation()}
            >
              <h3 className={styles.modalTitulo} id="modal-titulo">
                {editandoId ? 'Editar suscripción' : 'Nueva suscripción'}
              </h3>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Netflix, Spotify..."
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="precio">Precio</label>
                  <input
                    id="precio"
                    type="text"
                    inputMode="decimal"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    placeholder="0,00"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ciclo">Ciclo</label>
                  <select
                    id="ciclo"
                    value={ciclo}
                    onChange={e => setCiclo(e.target.value as typeof ciclo)}
                    className={styles.select}
                  >
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="categoria">Categoría</label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  className={styles.select}
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {errorFormulario && (
                <p className={styles.avisoFormulario} role="alert" aria-live="assertive">
                  <span aria-hidden="true">⚠️</span> {errorFormulario}
                </p>
              )}

              <div className={styles.modalAcciones}>
                <button
                  type="button"
                  className={styles.btnCancelar}
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.btnGuardar}
                  onClick={agregarSuscripcion}
                  disabled={!nombre.trim() || !precio}
                >
                  {editandoId ? 'Guardar' : 'Añadir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EducationalSection
        title="La Economía de las Suscripciones"
        subtitle="Entiende cómo funcionan los modelos de suscripción, por qué tendemos a olvidarlas y cómo recuperar el control"
        icon="💳"
      >
        {/* Sección 1: Tabla Comparativa */}
        <section>
          <h3>Comparativa de Modelos de Suscripción</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Coste típico</th>
                  <th>Cancelación</th>
                  <th>Mejor para</th>
                  <th>Trampa principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Mensual</strong></td>
                  <td>8-15 €/mes</td>
                  <td>Inmediata</td>
                  <td>Uso temporal</td>
                  <td>Pequeño coste parece insignificante</td>
                </tr>
                <tr>
                  <td><strong>Anual</strong></td>
                  <td>50-120 €/año</td>
                  <td>Pierdes lo restante</td>
                  <td>Uso habitual</td>
                  <td>Cargo único elevado puede sorprender</td>
                </tr>
                <tr>
                  <td><strong>Freemium</strong></td>
                  <td>0 € base</td>
                  <td>Sin coste</td>
                  <td>Probar el servicio</td>
                  <td>Límites frustrantes empujan a pago</td>
                </tr>
                <tr>
                  <td><strong>Lifetime</strong></td>
                  <td>50-300 € único</td>
                  <td>No aplica</td>
                  <td>Herramientas profesionales</td>
                  <td>Empresa puede cerrar o cambiar</td>
                </tr>
                <tr>
                  <td><strong>Familia/Grupo</strong></td>
                  <td>13-20 €/mes</td>
                  <td>Depende</td>
                  <td>Varios usuarios</td>
                  <td>Difícil dividir el coste</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso */}
        <section>
          <h3>Casos de Uso por Perfil</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}><span aria-hidden="true">🎓</span></span>
                <strong>Estudiante universitario</strong>
              </div>
              <p className={styles.escenarioExample}>
                Pablo, 21 años: Netflix (12,99 €) + Spotify (10,99 €) + iCloud 50GB (0,99 €) + ChatGPT Plus (20 €) = <strong>44,97 €/mes → 539,64 €/año</strong>
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Activa los planes universitarios: Spotify Student cuesta 5,99 €, Apple Music Student 5,99 €. Comparte Netflix con tu familia.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}><span aria-hidden="true">💼</span></span>
                <strong>Adulto trabajador</strong>
              </div>
              <p className={styles.escenarioExample}>
                Marta, 34 años: descubrió que pagaba <strong>12 suscripciones = 187 €/mes</strong>. El 30% eran servicios que apenas usaba — dinero invisible que se acumula mes a mes.
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Auditoría trimestral obligatoria. Si no lo has abierto en 30 días, cancela sin dudas.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}><span aria-hidden="true">👨‍👩‍👧‍👦</span></span>
                <strong>Familia con hijos</strong>
              </div>
              <p className={styles.escenarioExample}>
                La familia García pagaba plataformas por separado: Netflix (15,99 €) + Disney+ (11,99 €) + Amazon Prime (8,99 €). Con planes familiares: <strong>potencial ahorro de 25 €/mes</strong>.
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Centraliza el entretenimiento en planes familia. Un adulto gestiona, todos se benefician.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}><span aria-hidden="true">🖥️</span></span>
                <strong>Freelance/Autónomo</strong>
              </div>
              <p className={styles.escenarioExample}>
                Carlos usa Adobe CC (54,99 €) + Notion (16 €) + Figma (15 €) + Slack (7,25 €) + G-Suite (12 €) = <strong>105 €/mes deducibles en IRPF</strong>.
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Las suscripciones profesionales son deducibles como autónomo. Guarda las facturas, pero revisa igualmente cuáles realmente usas.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section>
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuánto debería gastar en suscripciones como máximo?</h4>
              <p>No hay una cifra oficial ni un porcentaje que valga para todo el mundo: depende de qué parte de tu ocio pasa por ahí, de si alguna suscripción sustituye a un gasto mayor y de cuánto margen te deja el resto del presupuesto. Un límite que tú te fijes y revises cada pocos meses funciona mejor que un porcentaje heredado. Lo que sí conviene mirar es el reparto por categorías de aquí arriba: si una sola se lleva la mitad del total, suele ser la primera candidata a revisar.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Si superas el 10% de tus ingresos en suscripciones, es señal clara de que necesitas revisar y cortar.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo descubro todas mis suscripciones activas?</h4>
              <p>Revisa los extractos bancarios de los últimos <strong>3 meses</strong> (cuenta corriente y tarjeta por separado). Busca cargos recurrentes. También revisa el email buscando &quot;recibo&quot;, &quot;factura&quot;, &quot;renovación automática&quot;.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Los cargos se disfrazan: &quot;AMZN*PRIME&quot; = Amazon Prime, &quot;NFLX&quot; = Netflix, &quot;SPTFY&quot; = Spotify.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es mejor pagar anual o mensual?</h4>
              <p>El ahorro anual suele ser del <strong>15-30%</strong>, pero pierdes flexibilidad. Paga anual solo si llevas más de 3 meses usándolo regularmente y tienes certeza de que continuarás.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Nunca pagues anual una suscripción nueva. Confirma durante 3 meses que realmente la usas.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo merece la pena el plan familiar?</h4>
              <p>Cuando lo usan <strong>3+ personas</strong> y el coste individual baja mínimo un 30%. Netflix Estándar (18 €) vs 3 cuentas individuales (38,97 €): ahorro de 20,97 €/mes.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Compara siempre el coste por persona antes de contratar el plan familiar.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Las pruebas gratuitas son una trampa?</h4>
              <p>Olvidar cancelar una prueba gratuita es tan común que tiene nombre propio en la literatura de consumo: los «patrones oscuros» de cancelación. La Comisión Europea y las autoridades de consumo llevan años persiguiéndolos precisamente porque funcionan. Circulan porcentajes muy redondos sobre cuánta gente lo olvida, pero sin estudio detrás que los sostenga: lo útil no es la cifra, sino apuntar la fecha de fin de prueba el mismo día que te das de alta.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> En el momento que te apuntas a la prueba, pon YA un recordatorio para cancelar 2 días antes de que termine.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo cancelo una suscripción difícil de cancelar?</h4>
              <p>Si el proceso normal es opaco: busca en Google &quot;[nombre] cancelar suscripción España&quot;. En España, el art. 62.3 del texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios (RDL 1/2007) reconoce el derecho a poner fin al contrato <strong>en la misma forma en que se celebró</strong>, sin sanción ni cargas desproporcionadas: si te contrataste con dos clics, no pueden exigirte una carta certificada.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Guarda siempre la confirmación de cancelación. Si el cargo aparece igualmente, tienes prueba para disputarlo con tu banco.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si cancelo un plan anual a mitad?</h4>
              <p>La mayoría no devuelven el dinero restante. Algunos lo convierten en crédito hasta que vence. Apple App Store y Google Play tienen políticas de reembolso más flexibles los primeros días.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Cancela siempre 1-2 días antes de la fecha de renovación, no el mismo día. Los sistemas pueden facturar con antelación.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Vale la pena usar apps de gestión de suscripciones?</h4>
              <p>Hay servicios que detectan las suscripciones leyendo los cargos de tu banco. Son útiles cuando tienes muchas, pero requieren <strong>acceso a tus datos bancarios</strong>, y el sector se mueve deprisa: dos de los más citados hace unos años ya no existen con aquel nombre —Truebill pasó a llamarse Rocket Money en 2022 y Mint cerró en marzo de 2024—, así que comprueba qué sigue operativo antes de dar acceso a nada. Esta calculadora no necesita ese acceso.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Una hoja de cálculo o esta calculadora con revisión trimestral es suficiente para la mayoría de personas sin ceder datos bancarios.</p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section>
          <h3>Cómo hacer tu auditoría completa de suscripciones</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Recopila todos los movimientos bancarios</strong>
                <p>Descarga los extractos de los últimos 3 meses de todas tus cuentas y tarjetas. Los cargos recurrentes aparecen aproximadamente el mismo día cada mes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Identifica todos los cargos recurrentes</strong>
                <p>Crea una lista con nombre del servicio, importe y día de cargo. Muchos se disfrazan con nombres de empresa distintos al nombre del servicio.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Introdúcelos en esta calculadora</strong>
                <p>Registra cada suscripción con su categoría y ciclo. El total anual suele sorprender, y esa es justamente la razón de sumarlo: doce cargos pequeños no se parecen a un recibo grande aunque cuesten lo mismo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Evalúa el valor real de cada una</strong>
                <p>Para cada suscripción: ¿La he usado en los últimos 30 días? ¿Podría vivir sin ella? ¿Existe alternativa gratuita o más barata?</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Cancela las que no aporten valor</strong>
                <p>Empieza por las que no has usado en 30 días. No esperes «quizás la uso». Las suscripciones inactivas son dinero tirado.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Optimiza las que mantienes</strong>
                <p>¿Plan anual o mensual? ¿Individual o familiar? ¿El básico cubre tus necesidades o estás pagando premium innecesariamente?</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Establece una revisión trimestral</strong>
                <p>Pon un recordatorio en el calendario cada 3 meses. Los precios suben silenciosamente (Netflix subió 3 veces en 4 años) y tus necesidades cambian.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section>
          <h3>6 Mejores Prácticas para Gestionar Suscripciones</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}><span aria-hidden="true">💳</span></span>
              <strong>Una tarjeta exclusiva</strong>
              <p>Usa una tarjeta virtual o específica solo para suscripciones. Así ves todos los cargos de un vistazo sin mezclarlos con otros gastos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}><span aria-hidden="true">📅</span></span>
              <strong>Recordatorio de renovación</strong>
              <p>Al contratar cualquier suscripción anual, pon inmediatamente un recordatorio 7 días antes de la renovación para decidir si la continúas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}><span aria-hidden="true">🔄</span></span>
              <strong>Rotación estacional</strong>
              <p>No tienes que tener todo activo siempre. Suscríbete a Netflix en invierno, cancela en verano. Alterna plataformas según el contenido disponible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}><span aria-hidden="true">🎓</span></span>
              <strong>Aprovecha descuentos</strong>
              <p>Spotify Student (5,99 €), Apple Music Student (5,99 €), Adobe descuento educación (60%). Y revisiones en Black Friday para contratos anuales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}><span aria-hidden="true">👨‍👩‍👧</span></span>
              <strong>Comparte legalmente</strong>
              <p>Amazon Prime, Apple One y Spotify Duo facilitan el uso compartido en el mismo hogar. Comprueba siempre que el servicio lo permite explícitamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}><span aria-hidden="true">📊</span></span>
              <strong>Un techo tuyo</strong>
              <p>Fija un límite mensual y revísalo cada pocos meses. Cuál sea es cosa tuya: lo que hace trabajo es tenerlo escrito y comparar el total de arriba con él, no el número concreto.</p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}><span aria-hidden="true">⚠️</span></span>
            <strong>6 errores que hacen que gastes de más en suscripciones</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>No cancelar las pruebas gratuitas</strong> — El cargo llega cuando ya te has olvidado de que la contrataste. Apunta la fecha de fin de prueba en el calendario el mismo día del alta.</li>
            <li><strong>Subestimar el coste acumulado</strong> — &quot;Son solo 10 €&quot; × 10 suscripciones = 1.200 €/año. El pago fraccionado hace invisible el total real.</li>
            <li><strong>Pagar anual sin estar seguro</strong> — Contratar un plan anual de algo recién descubierto es arriesgado. Prueba 3 meses en mensual primero.</li>
            <li><strong>Ignorar las subidas de precio</strong> — Netflix, Spotify y otros suben precios silenciosamente. Sin revisión periódica, pagas más sin darte cuenta.</li>
            <li><strong>Tener duplicidades</strong> — ¿Netflix Y HBO Y Disney+ activos simultáneamente? Evalúa qué catálogos consumes realmente. La mayoría solo usa 1-2 activamente.</li>
            <li><strong>No usar lo que pagas</strong> — Una suscripción que pagas pero no abres es 100% desperdicio. Si no lo has usado en 30 días, cancela sin excusas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-suscripciones')} />

      <ShareCard appName="calculadora-suscripciones" />
      <Footer appName="calculadora-suscripciones" />
    </div>
  );
}
