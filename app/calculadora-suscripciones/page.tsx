'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraSuscripciones.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatCurrency } from '@/lib';
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

export default function CalculadoraSuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
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
    if (suscripciones.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(suscripciones));
    }
  }, [suscripciones]);

  // Calcular totales
  const totales = useMemo(() => {
    const activas = suscripciones.filter(s => s.activa);

    let mensual = 0;
    activas.forEach(s => {
      if (s.ciclo === 'mensual') mensual += s.precio;
      else if (s.ciclo === 'anual') mensual += s.precio / 12;
      else if (s.ciclo === 'semanal') mensual += s.precio * 4.33;
    });

    const anual = mensual * 12;
    const diario = mensual / 30;

    // Por categoría
    const porCategoria: Record<string, number> = {};
    activas.forEach(s => {
      let mensualizado = s.precio;
      if (s.ciclo === 'anual') mensualizado = s.precio / 12;
      else if (s.ciclo === 'semanal') mensualizado = s.precio * 4.33;

      porCategoria[s.categoria] = (porCategoria[s.categoria] || 0) + mensualizado;
    });

    return { mensual, anual, diario, porCategoria, totalActivas: activas.length };
  }, [suscripciones]);

  // Añadir suscripción
  const agregarSuscripcion = () => {
    if (!nombre.trim() || !precio) return;

    const nueva: Suscripcion = {
      id: editandoId || Date.now().toString(),
      nombre: nombre.trim(),
      precio: parseFloat(precio.replace(',', '.')),
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

  // Limpiar formulario
  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setCiclo('mensual');
    setCategoria('streaming');
    setMostrarFormulario(false);
    setEditandoId(null);
  };

  // Editar suscripción
  const editarSuscripcion = (s: Suscripcion) => {
    setNombre(s.nombre);
    setPrecio(s.precio.toString());
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

      <div className={styles.mainContent}>
        {/* Resumen de gastos */}
        <section className={styles.resumenPanel}>
          <div className={styles.resumenGrid}>
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
                    <span className={styles.categoriaIcono}>{getIcono(cat)}</span>
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
                    <span className={styles.suscripcionIcono}>{getIcono(s.categoria)}</span>
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
                      title={s.activa ? 'Pausar' : 'Activar'}
                    >
                      {s.activa ? '✓' : '○'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnEditar}
                      onClick={() => editarSuscripcion(s)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className={styles.btnEliminar}
                      onClick={() => eliminarSuscripcion(s.id)}
                      title="Eliminar"
                    >
                      🗑️
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
                  <span className={styles.popularIcono}>{getIcono(pop.categoria)}</span>
                  <span className={styles.popularNombre}>{pop.nombre}</span>
                  <span className={styles.popularPrecio}>{formatCurrency(pop.precio)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Modal de formulario */}
        {mostrarFormulario && (
          <div className={styles.modalOverlay} onClick={limpiarFormulario}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h3 className={styles.modalTitulo}>
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
        <section>
          <h4>El fenómeno de la «subscription fatigue»</h4>
          <p>El modelo de negocio basado en suscripciones (SaaS, streaming, apps) creció un 437% entre 2012 y 2022. El usuario medio subestima su gasto en suscripciones en un <strong>40%</strong> según estudios de West Monroe Partners:</p>
          <ul>
            <li>Los usuarios creen gastar ~86 €/mes en suscripciones cuando la media real supera los 230 €.</li>
            <li>El 42% de los usuarios paga suscripciones que no han usado en el último mes.</li>
            <li>Los ciclos de facturación anuales hacen que el coste sea menos visible hasta que llega el cargo.</li>
          </ul>
        </section>

        <section>
          <h4>Trampas psicológicas de los modelos de suscripción</h4>
          <ul>
            <li><strong>Precio de prueba gratuita</strong>: El 60% de los usuarios que se apuntan a una prueba gratuita olvidan cancelarla antes del cargo automático.</li>
            <li><strong>Precio anual fraccionado</strong>: &quot;Solo 1,99 €/mes&quot; oculta que el compromiso es 23,88 €/año, más difícil de cancelar.</li>
            <li><strong>Fricción de cancelación</strong>: Diseños que requieren llamar por teléfono, confirmar 3 veces o esperar días. No es casual.</li>
            <li><strong>Precio ancla</strong>: Planes de 3 niveles donde el intermedio parece razonable junto al premium caro, aunque el básico cubría tus necesidades.</li>
            <li><strong>Sunk cost</strong>: &quot;Ya llevo 6 meses pagando, sería un desperdicio cancelar&quot;. El coste pasado no importa; lo que importa es el valor futuro.</li>
          </ul>
        </section>

        <section>
          <h4>Cómo hacer una auditoría de suscripciones</h4>
          <ul>
            <li><strong>Paso 1: Inventario completo</strong>: Revisa los extractos bancarios de los últimos 3 meses buscando cargos recurrentes. Muchos se disfrazan bajo nombres de empresa distintos al servicio.</li>
            <li><strong>Paso 2: Clasificar por valor</strong>: Para cada suscripción, pregúntate: ¿Lo he usado esta semana? ¿Lo usaré en los próximos 30 días? ¿Me aportaría valor una alternativa gratuita?</li>
            <li><strong>Paso 3: Consolidar</strong>: ¿Tienes Spotify y YouTube Premium? ¿Netflix y HBO y Disney+? Evalúa si realmente usas los catálogos de todos.</li>
            <li><strong>Paso 4: Ciclo de revisión</strong>: Establece un recordatorio trimestral. Las necesidades cambian y los precios suben silenciosamente.</li>
          </ul>
        </section>

        <section>
          <h4>El coste real: el valor del tiempo y el dinero</h4>
          <p>Una suscripción de 10 €/mes parece insignificante. Pero acumuladas:</p>
          <ul>
            <li>10 suscripciones de 10 €/mes = <strong>1.200 €/año</strong></li>
            <li>Si esos 100 €/mes se invirtiesen al 7% anual durante 10 años = <strong>~17.400 €</strong></li>
            <li>El coste de oportunidad de las suscripciones no usadas es real y compuesto</li>
          </ul>
          <p>No se trata de eliminar suscripciones útiles, sino de pagar solo por las que realmente aportan valor a tu vida.</p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-suscripciones')} />

      <ShareCard appName="calculadora-suscripciones" />
      <Footer appName="calculadora-suscripciones" />
    </div>
  );
}
