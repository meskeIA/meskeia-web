'use client';

import { useState, useEffect } from 'react';
import styles from './ListaCompras.module.css';
import { MeskeiaLogo, Footer } from '@/components';

// ==================== TIPOS ====================

interface ItemCompra {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  categoria: string;
  completado: boolean;
}

interface ListaGuardada {
  id: string;
  nombre: string;
  fecha: string;
  items: ItemCompra[];
}

// ==================== DATOS ====================

const categoriasSupermercado = [
  { id: 'frutas', nombre: 'Frutas y Verduras', emoji: '🥬' },
  { id: 'carnes', nombre: 'Carnes y Pescados', emoji: '🥩' },
  { id: 'lacteos', nombre: 'Lácteos y Huevos', emoji: '🥛' },
  { id: 'panaderia', nombre: 'Panadería', emoji: '🥖' },
  { id: 'despensa', nombre: 'Despensa', emoji: '🥫' },
  { id: 'congelados', nombre: 'Congelados', emoji: '🧊' },
  { id: 'bebidas', nombre: 'Bebidas', emoji: '🥤' },
  { id: 'limpieza', nombre: 'Limpieza', emoji: '🧹' },
  { id: 'higiene', nombre: 'Higiene Personal', emoji: '🧴' },
  { id: 'otros', nombre: 'Otros', emoji: '📦' },
];

const unidadesComunes = ['unidad', 'kg', 'g', 'L', 'ml', 'pack', 'docena', 'bolsa', 'lata', 'bote'];

// Productos sugeridos con su categoría
const productosSugeridos: Record<string, string> = {
  // Frutas y Verduras
  'manzanas': 'frutas', 'naranjas': 'frutas', 'plátanos': 'frutas', 'tomates': 'frutas',
  'lechugas': 'frutas', 'zanahorias': 'frutas', 'cebollas': 'frutas', 'patatas': 'frutas',
  'pimientos': 'frutas', 'pepinos': 'frutas', 'ajos': 'frutas', 'limones': 'frutas',
  'aguacates': 'frutas', 'fresas': 'frutas', 'uvas': 'frutas', 'calabacín': 'frutas',
  // Carnes y Pescados
  'pollo': 'carnes', 'ternera': 'carnes', 'cerdo': 'carnes', 'salmón': 'carnes',
  'merluza': 'carnes', 'atún': 'carnes', 'gambas': 'carnes', 'jamón': 'carnes',
  'chorizo': 'carnes', 'bacon': 'carnes', 'salchichas': 'carnes', 'pavo': 'carnes',
  // Lácteos y Huevos
  'leche': 'lacteos', 'huevos': 'lacteos', 'yogur': 'lacteos', 'queso': 'lacteos',
  'mantequilla': 'lacteos', 'nata': 'lacteos', 'requesón': 'lacteos', 'cuajada': 'lacteos',
  // Panadería
  'pan': 'panaderia', 'baguette': 'panaderia', 'croissants': 'panaderia', 'magdalenas': 'panaderia',
  'tostadas': 'panaderia', 'pan de molde': 'panaderia', 'bollería': 'panaderia',
  // Despensa
  'arroz': 'despensa', 'pasta': 'despensa', 'aceite': 'despensa', 'sal': 'despensa',
  'azúcar': 'despensa', 'harina': 'despensa', 'legumbres': 'despensa', 'garbanzos': 'despensa',
  'lentejas': 'despensa', 'tomate frito': 'despensa', 'conservas': 'despensa', 'café': 'despensa',
  'té': 'despensa', 'cereales': 'despensa', 'galletas': 'despensa', 'chocolate': 'despensa',
  // Congelados
  'helado': 'congelados', 'pizza congelada': 'congelados', 'verduras congeladas': 'congelados',
  'pescado congelado': 'congelados', 'patatas congeladas': 'congelados',
  // Bebidas
  'agua': 'bebidas', 'zumo': 'bebidas', 'refrescos': 'bebidas', 'cerveza': 'bebidas',
  'vino': 'bebidas', 'leche': 'bebidas',
  // Limpieza
  'detergente': 'limpieza', 'suavizante': 'limpieza', 'lejía': 'limpieza', 'lavavajillas': 'limpieza',
  'papel higiénico': 'limpieza', 'servilletas': 'limpieza', 'bolsas basura': 'limpieza',
  'fregona': 'limpieza', 'estropajo': 'limpieza',
  // Higiene
  'champú': 'higiene', 'gel': 'higiene', 'jabón': 'higiene', 'desodorante': 'higiene',
  'pasta de dientes': 'higiene', 'cepillo dientes': 'higiene', 'crema': 'higiene',
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function ListaComprasPage() {
  // Estado principal
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [listasGuardadas, setListasGuardadas] = useState<ListaGuardada[]>([]);

  // Estado del formulario
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCantidad, setNuevaCantidad] = useState('1');
  const [nuevaUnidad, setNuevaUnidad] = useState('unidad');
  const [nuevaCategoria, setNuevaCategoria] = useState('auto');

  // Estado de filtros
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [mostrarCompletados, setMostrarCompletados] = useState(true);

  // Estado de gestión
  const [nombreLista, setNombreLista] = useState('Mi Lista');
  const [modoEdicion, setModoEdicion] = useState(false);

  // Cargar datos de localStorage al montar
  useEffect(() => {
    const listasStorage = localStorage.getItem('meskeia_listas_compras');
    if (listasStorage) {
      setListasGuardadas(JSON.parse(listasStorage));
    }

    const listaActualStorage = localStorage.getItem('meskeia_lista_actual');
    if (listaActualStorage) {
      const data = JSON.parse(listaActualStorage);
      setItems(data.items || []);
      setNombreLista(data.nombre || 'Mi Lista');
    }
  }, []);

  // Guardar lista actual en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('meskeia_lista_actual', JSON.stringify({
      nombre: nombreLista,
      items: items,
    }));
  }, [items, nombreLista]);

  // ==================== FUNCIONES ====================

  const detectarCategoria = (nombre: string): string => {
    const nombreLower = nombre.toLowerCase();
    for (const [producto, categoria] of Object.entries(productosSugeridos)) {
      if (nombreLower.includes(producto) || producto.includes(nombreLower)) {
        return categoria;
      }
    }
    return 'otros';
  };

  const agregarItem = () => {
    if (!nuevoNombre.trim()) return;

    const categoriaDetectada = nuevaCategoria === 'auto'
      ? detectarCategoria(nuevoNombre)
      : nuevaCategoria;

    const nuevoItem: ItemCompra = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      cantidad: parseFloat(nuevaCantidad) || 1,
      unidad: nuevaUnidad,
      categoria: categoriaDetectada,
      completado: false,
    };

    setItems([...items, nuevoItem]);
    setNuevoNombre('');
    setNuevaCantidad('1');
    setNuevaCategoria('auto');
  };

  const toggleCompletado = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completado: !item.completado } : item
    ));
  };

  const eliminarItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const limpiarCompletados = () => {
    setItems(items.filter(item => !item.completado));
  };

  const limpiarTodo = () => {
    if (confirm('¿Seguro que quieres vaciar toda la lista?')) {
      setItems([]);
    }
  };

  const guardarLista = () => {
    const nuevaLista: ListaGuardada = {
      id: Date.now().toString(),
      nombre: nombreLista,
      fecha: new Date().toLocaleDateString('es-ES'),
      items: items,
    };

    const nuevasListas = [...listasGuardadas, nuevaLista];
    setListasGuardadas(nuevasListas);
    localStorage.setItem('meskeia_listas_compras', JSON.stringify(nuevasListas));
  };

  const cargarLista = (lista: ListaGuardada) => {
    setItems(lista.items);
    setNombreLista(lista.nombre);
  };

  const eliminarListaGuardada = (id: string) => {
    const nuevasListas = listasGuardadas.filter(l => l.id !== id);
    setListasGuardadas(nuevasListas);
    localStorage.setItem('meskeia_listas_compras', JSON.stringify(nuevasListas));
  };

  const compartirLista = async () => {
    const textoLista = items
      .filter(item => !item.completado)
      .map(item => `${item.completado ? '✓' : '○'} ${item.cantidad} ${item.unidad} - ${item.nombre}`)
      .join('\n');

    const textoCompleto = `🛒 ${nombreLista}\n\n${textoLista}\n\n📱 Creado con meskeIA`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: nombreLista,
          text: textoCompleto,
        });
      } catch {
        copiarAlPortapapeles(textoCompleto);
      }
    } else {
      copiarAlPortapapeles(textoCompleto);
    }
  };

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
    alert('Lista copiada al portapapeles');
  };

  // Filtrar y agrupar items
  const itemsFiltrados = items.filter(item => {
    if (filtroCategoria !== 'todas' && item.categoria !== filtroCategoria) return false;
    if (!mostrarCompletados && item.completado) return false;
    return true;
  });

  const itemsAgrupados = categoriasSupermercado
    .map(cat => ({
      ...cat,
      items: itemsFiltrados.filter(item => item.categoria === cat.id),
    }))
    .filter(cat => cat.items.length > 0);

  const totalItems = items.length;
  const itemsCompletados = items.filter(i => i.completado).length;
  const progreso = totalItems > 0 ? Math.round((itemsCompletados / totalItems) * 100) : 0;

  // ==================== RENDER ====================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Lista de Compras</h1>
        <p className={styles.subtitle}>
          Organiza tu compra por categorías del supermercado
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Panel superior: Nombre y progreso */}
        <section className={styles.headerPanel}>
          <div className={styles.nombreLista}>
            {modoEdicion ? (
              <input
                type="text"
                value={nombreLista}
                onChange={(e) => setNombreLista(e.target.value)}
                onBlur={() => setModoEdicion(false)}
                onKeyDown={(e) => e.key === 'Enter' && setModoEdicion(false)}
                className={styles.inputNombreLista}
                autoFocus
              />
            ) : (
              <h2 onClick={() => setModoEdicion(true)} className={styles.tituloLista}>
                {nombreLista} <span className={styles.editIcon}>✏️</span>
              </h2>
            )}
          </div>

          {totalItems > 0 && (
            <div className={styles.progresoContainer}>
              <div className={styles.progresoBar}>
                <div
                  className={styles.progresoFill}
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <span className={styles.progresoTexto}>
                {itemsCompletados} de {totalItems} ({progreso}%)
              </span>
            </div>
          )}
        </section>

        {/* Formulario para añadir items */}
        <section className={styles.addPanel}>
          <div className={styles.addForm}>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarItem()}
                placeholder="Añadir producto..."
                className={styles.inputProducto}
              />
              <input
                type="number"
                value={nuevaCantidad}
                onChange={(e) => setNuevaCantidad(e.target.value)}
                min="0.1"
                step="0.1"
                className={styles.inputCantidad}
              />
              <select
                value={nuevaUnidad}
                onChange={(e) => setNuevaUnidad(e.target.value)}
                className={styles.selectUnidad}
              >
                {unidadesComunes.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <select
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className={styles.selectCategoria}
              >
                <option value="auto">Auto-detectar</option>
                {categoriasSupermercado.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.nombre}</option>
                ))}
              </select>
            </div>
            <button onClick={agregarItem} className={styles.btnAgregar}>
              + Añadir
            </button>
          </div>
        </section>

        {/* Filtros */}
        <section className={styles.filtrosPanel}>
          <div className={styles.filtrosCategorias}>
            <button
              className={`${styles.filtroBtn} ${filtroCategoria === 'todas' ? styles.activo : ''}`}
              onClick={() => setFiltroCategoria('todas')}
            >
              Todas
            </button>
            {categoriasSupermercado.map(cat => (
              <button
                key={cat.id}
                className={`${styles.filtroBtn} ${filtroCategoria === cat.id ? styles.activo : ''}`}
                onClick={() => setFiltroCategoria(cat.id)}
              >
                {cat.emoji}
              </button>
            ))}
          </div>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={mostrarCompletados}
              onChange={(e) => setMostrarCompletados(e.target.checked)}
            />
            Mostrar completados
          </label>
        </section>

        {/* Lista de items agrupados por categoría */}
        <section className={styles.listaPanel}>
          {itemsAgrupados.length === 0 ? (
            <div className={styles.listaVacia}>
              <span className={styles.iconVacio}>🛒</span>
              <p>Tu lista está vacía</p>
              <p className={styles.hint}>Añade productos usando el formulario de arriba</p>
            </div>
          ) : (
            itemsAgrupados.map(grupo => (
              <div key={grupo.id} className={styles.categoriaGrupo}>
                <h3 className={styles.categoriaHeader}>
                  <span className={styles.categoriaEmoji}>{grupo.emoji}</span>
                  {grupo.nombre}
                  <span className={styles.categoriaCount}>({grupo.items.length})</span>
                </h3>
                <ul className={styles.itemsLista}>
                  {grupo.items.map(item => (
                    <li
                      key={item.id}
                      className={`${styles.itemRow} ${item.completado ? styles.completado : ''}`}
                    >
                      <button
                        className={styles.checkBtn}
                        onClick={() => toggleCompletado(item.id)}
                      >
                        {item.completado ? '✓' : '○'}
                      </button>
                      <span className={styles.itemCantidad}>
                        {item.cantidad} {item.unidad}
                      </span>
                      <span className={styles.itemNombre}>{item.nombre}</span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => eliminarItem(item.id)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>

        {/* Acciones de la lista */}
        {items.length > 0 && (
          <section className={styles.accionesPanel}>
            <button onClick={compartirLista} className={styles.btnAccion}>
              📤 Compartir
            </button>
            <button onClick={guardarLista} className={styles.btnAccion}>
              💾 Guardar
            </button>
            <button onClick={limpiarCompletados} className={styles.btnAccionSecundario}>
              🗑️ Limpiar completados
            </button>
            <button onClick={limpiarTodo} className={styles.btnAccionDanger}>
              ❌ Vaciar lista
            </button>
          </section>
        )}

        {/* Listas guardadas */}
        {listasGuardadas.length > 0 && (
          <section className={styles.listasGuardadasPanel}>
            <h3 className={styles.seccionTitulo}>Listas guardadas</h3>
            <div className={styles.listasGrid}>
              {listasGuardadas.map(lista => (
                <div key={lista.id} className={styles.listaCard}>
                  <div className={styles.listaCardHeader}>
                    <span className={styles.listaNombre}>{lista.nombre}</span>
                    <span className={styles.listaFecha}>{lista.fecha}</span>
                  </div>
                  <p className={styles.listaResumen}>
                    {lista.items.length} productos
                  </p>
                  <div className={styles.listaCardAcciones}>
                    <button
                      onClick={() => cargarLista(lista)}
                      className={styles.btnCargar}
                    >
                      Cargar
                    </button>
                    <button
                      onClick={() => eliminarListaGuardada(lista.id)}
                      className={styles.btnEliminar}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer appName="lista-compras" />
    </div>
  );
}
