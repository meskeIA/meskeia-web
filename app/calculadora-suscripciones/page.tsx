'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraSuscripciones.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { formatCurrency } from '@/lib';

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

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>💾</span>
            <div>
              <strong>Guardado local</strong>
              <p>Tus datos se guardan en tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <strong>Análisis por categoría</strong>
              <p>Ve dónde se va tu dinero</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⏸️</span>
            <div>
              <strong>Pausa suscripciones</strong>
              <p>Sin eliminarlas del registro</p>
            </div>
          </div>
        </div>
      </section>

      <Footer appName="calculadora-suscripciones" />
    </div>
  );
}
