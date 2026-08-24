'use client';
// @disclaimer: exempt

import { useState, useEffect } from 'react';
import styles from './ListaCompras.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatDate } from '@/lib';

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
  'vino': 'bebidas',
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
      fecha: formatDate(new Date()),
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

      <LegalNotice />

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
                {nombreLista} <span className={styles.editIcon} aria-hidden="true">✏️</span>
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
            <button type="button" onClick={agregarItem} className={styles.btnAgregar}>
              + Añadir
            </button>
          </div>
        </section>

        {/* Filtros */}
        <section className={styles.filtrosPanel}>
          <div className={styles.filtrosCategorias}>
            <button
              type="button"
              className={`${styles.filtroBtn} ${filtroCategoria === 'todas' ? styles.activo : ''}`}
              onClick={() => setFiltroCategoria('todas')}
              aria-pressed={filtroCategoria === 'todas'}
            >
              Todas
            </button>
            {categoriasSupermercado.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.filtroBtn} ${filtroCategoria === cat.id ? styles.activo : ''}`}
                onClick={() => setFiltroCategoria(cat.id)}
                aria-pressed={filtroCategoria === cat.id}
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
                        type="button"
                        className={styles.checkBtn}
                        onClick={() => toggleCompletado(item.id)}
                        aria-pressed={item.completado}
                      >
                        {item.completado ? '✓' : '○'}
                      </button>
                      <span className={styles.itemCantidad}>
                        {item.cantidad} {item.unidad}
                      </span>
                      <span className={styles.itemNombre}>{item.nombre}</span>
                      <button
                        type="button"
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
            <button type="button" onClick={compartirLista} className={styles.btnAccion}>
              <span aria-hidden="true">📤</span> Compartir
            </button>
            <button type="button" onClick={guardarLista} className={styles.btnAccion}>
              <span aria-hidden="true">💾</span> Guardar
            </button>
            <button type="button" onClick={limpiarCompletados} className={styles.btnAccionSecundario}>
              <span aria-hidden="true">🗑️</span> Limpiar completados
            </button>
            <button type="button" onClick={limpiarTodo} className={styles.btnAccionDanger}>
              <span aria-hidden="true">❌</span> Vaciar lista
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
                      type="button"
                      onClick={() => cargarLista(lista)}
                      className={styles.btnCargar}
                    >
                      Cargar
                    </button>
                    <button
                      type="button"
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

      <EducationalSection title="Guía completa para una compra eficiente" subtitle="Planifica, ahorra y organiza tus compras con estrategias probadas">

        {/* 1. TABLA COMPARATIVA */}
        <section>
          <h3>Métodos de organización: ¿cuál funciona mejor?</h3>
          <p>Las familias con lista planificada ahorran un 23% frente a la compra improvisada (estudio Nielsen 2024). Elige el método que mejor se adapte a tu rutina:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Ventajas</th>
                  <th>Desventajas</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Por categorías del super</strong></td>
                  <td>Evita volver atrás, ahorra ~15 min por visita</td>
                  <td>Requiere planificación previa</td>
                  <td>Compra semanal familiar</td>
                </tr>
                <tr>
                  <td><strong>Por receta/menú semanal</strong></td>
                  <td>Compras exactamente lo que necesitas, 0 desperdicio</td>
                  <td>Necesitas planificar menús antes</td>
                  <td>Batch cooking, dietas especiales</td>
                </tr>
                <tr>
                  <td><strong>Por persona/preferencia</strong></td>
                  <td>Cada miembro gestiona sus productos</td>
                  <td>Puede generar duplicados o conflictos</td>
                  <td>Pisos compartidos, familias numerosas</td>
                </tr>
                <tr>
                  <td><strong>Lista digital (app)</strong></td>
                  <td>Sincronización en tiempo real, acceso desde cualquier sitio</td>
                  <td>Requiere batería/conexión</td>
                  <td>Parejas y familias coordinadas</td>
                </tr>
                <tr>
                  <td><strong>Lista en papel</strong></td>
                  <td>Sin distracciones, sin tecnología, tachar es satisfactorio</td>
                  <td>No se puede compartir ni editar desde casa</td>
                  <td>Personas mayores, compradores solitarios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section>
          <h3>Casos de uso reales: 4 perfiles de comprador</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧‍👦</span>
                <strong>Familia con niños — compra semanal</strong>
              </div>
              <p className={styles.escenarioExample}>
                Compra los sábados para toda la semana. Agrupa por categoría para recorrer el super en circuito lineal. Prepara la lista el viernes revisando el menú de la semana siguiente.
              </p>
              <p className={styles.escenarioTip}>
                Resultado: reduce el ticket medio un 18% y tarda 35 min menos en el super al evitar el zigzag entre pasillos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧑‍💼</span>
                <strong>Persona sola — compra cada 2-3 días</strong>
              </div>
              <p className={styles.escenarioExample}>
                Compras más frecuentes pero de menor volumen. Prioriza frescos: fruta, verdura y proteína. Mantiene una lista base permanente para productos de despensa que repone cuando quedan a la mitad.
              </p>
              <p className={styles.escenarioTip}>
                Resultado: menos desperdicio alimentario (el 40% de la comida de personas solas se tira) y mayor variedad en la dieta.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌿</span>
                <strong>Dieta especial (celíaco, vegano)</strong>
              </div>
              <p className={styles.escenarioExample}>
                Crea categorías personalizadas: &quot;Sin gluten&quot;, &quot;Proteína vegetal&quot;, &quot;Sustitutos lácteos&quot;. Marca los supermercados donde cada producto está disponible para optimizar el recorrido.
              </p>
              <p className={styles.escenarioTip}>
                Resultado: evita la revisión de etiquetas en el pasillo y reduce el tiempo en tienda un 25% al saber exactamente qué marca y en qué estantería está cada producto.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🍳</span>
                <strong>Batch cooking dominical</strong>
              </div>
              <p className={styles.escenarioExample}>
                Planifica 5 recetas el viernes, genera la lista consolidada (sin duplicados) y compra el sábado. Organiza por tipo de preparación: proteínas, carbohidratos, verduras, aliños.
              </p>
              <p className={styles.escenarioTip}>
                Resultado: ahorra entre 6 y 8 horas semanales de cocina diaria y reduce el gasto en comida un 30% frente a comprar cada día o pedir a domicilio.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre la compra inteligente</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Cómo evito olvidar productos?</strong>
              <p>Revisa el frigorífico, congelador y despensa antes de hacer la lista, en ese orden. Apunta el producto cuando lo termines o quede por la mitad, no cuando ya se acabe. Una pizarra magnética en la cocina o una nota compartida en el móvil reduce los olvidos un 80%.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Mejor organizar por categorías o por receta?</strong>
              <p>Por <strong>receta</strong> si cocinas platos muy concretos o haces batch cooking (asegura que no falta ningún ingrediente). Por <strong>categorías</strong> si tu menú es flexible y priorizas la eficiencia en el super (recorres los pasillos en orden, sin volver atrás).</p>
              <p className={styles.faqTip}>Solución híbrida: planifica por recetas en casa, pero reordena la lista por categorías antes de ir al supermercado.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo reducir el gasto un 20-30%?</strong>
              <p>Cuatro acciones concretas: (1) lleva lista y no te salgas de ella, (2) comprueba el precio por kg/L, no el precio del envase, (3) compra productos de temporada (hasta un 50% más baratos), (4) compara la marca de distribuidor con la de fabricante —la diferencia media es del 35% con calidad equivalente certificada por la OCU.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué productos conviene comprar en grandes cantidades?</strong>
              <p>Productos no perecederos con alta rotación: papel de cocina, detergente, conservas, legumbres secas, pasta, arroz y aceite. Regla práctica: compra en cantidad solo si tienes espacio para almacenarlo y si lo usarás antes de que caduque. Nunca stockes frescos ni productos que solo compras "por si acaso".</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo gestiono las caducidades?</strong>
              <p>Aplica el principio FIFO (First In, First Out): coloca los nuevos productos detrás de los que ya tienes. Revisa el frigorífico cada domingo y apunta en la lista lo que está a punto de caducar para usarlo esa semana. Las apps de gestión de despensa como Pantry pueden automatizar esto.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuándo es mejor comprar frescos vs congelados?</strong>
              <p>Compra <strong>frescos</strong> cuando estén en temporada y los vayas a consumir en 2-3 días. Opta por <strong>congelados</strong> para verduras fuera de temporada (retienen hasta el 90% de nutrientes si se congelan en origen), pescado que no consumas inmediatamente y carne para planificaciones a largo plazo.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo hacer batch cooking con una lista eficiente?</strong>
              <p>Elige 5 recetas con ingredientes compartidos (por ejemplo, todas con pollo o con garbanzos). Consolida todos los ingredientes en una única lista, sumando cantidades del mismo producto. Añade una columna de "cantidad necesaria" vs "cantidad a comprar" para aprovechar lo que ya tienes en casa.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Apps vs lista en papel?</strong>
              <p><strong>Apps</strong>: ideales si compras con tu pareja o familia (lista compartida en tiempo real), si cambias de supermercado o si quieres historial de listas anteriores. <strong>Papel</strong>: mejor si te distraes con el móvil, si vas solo al super o si la tecnología te genera fricción. Lo más importante es que uses el método que realmente vayas a seguir.</p>
            </li>
          </ul>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section>
          <h3>Planificación semanal en 7 pasos</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Revisa el inventario (5 min)</strong>
                <p>Antes de escribir nada, abre el frigorífico, el congelador y la despensa. Apunta lo que está acabando. Este paso evita comprar duplicados y es la principal fuente de ahorro.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Planifica los menús de la semana (10 min)</strong>
                <p>Define qué vas a comer cada día, incluyendo desayunos, comidas, cenas y tentempiés. No hace falta ser exhaustivo: un esquema básico de comidas y cenas basta. Esto determina exactamente qué necesitas comprar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Genera la lista de ingredientes (5 min)</strong>
                <p>A partir del menú, anota todos los ingredientes que necesitas. Compara con tu inventario y elimina lo que ya tienes. Suma cantidades si un ingrediente aparece en varias recetas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Añade productos de mantenimiento</strong>
                <p>Añade los artículos de limpieza, higiene y despensa básica que se hayan agotado o estén a punto de hacerlo. Son compras rutinarias que no deben depender de que te acuerdes en el momento.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Organiza por categorías del supermercado</strong>
                <p>Agrupa los productos según las secciones del super que frecuentas: frescos, carnes, lácteos, panadería, conservas, bebidas, droguería. Sigue el circuito habitual del supermercado para no retroceder.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Compra en el horario adecuado</strong>
                <p>Evita las horas punta (sábado por la mañana, viernes por la tarde). Los mejores momentos son entre semana por la mañana o en hora de comida. Los supermercados tienen menos gente, los lineales están repuestos y el tiempo en caja se reduce a la mitad.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Taca y guarda la lista</strong>
                <p>Marca cada producto al cogerlo, no al llegar a casa. Si guardas las listas, en 4 semanas tendrás un patrón claro de consumo que te permitirá optimizar aún más las siguientes compras.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section>
          <h3>6 trucos para ahorrar tiempo y dinero en el supermercado</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <strong>Compra una vez a la semana</strong>
              <p>Cada visita al supermercado no planificada cuesta de media 22 € en compras impulsivas (dato Kantar 2024). Concentrar la compra en una o dos visitas semanales es la palanca de ahorro más potente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Compara el precio por kilo o litro</strong>
              <p>El precio del envase engaña. El precio por unidad de medida (kg, L) siempre está indicado en la etiqueta del lineal. El envase grande es más barato por kilo en el 80% de los casos, pero solo si lo vas a consumir antes de que caduque.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌱</span>
              <strong>Prioriza productos de temporada</strong>
              <p>Las frutas y verduras de temporada cuestan entre un 30% y un 50% menos que las de fuera de temporada. Además tienen mejor sabor y mayor valor nutricional al recorrer menos kilómetros.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏷️</span>
              <strong>Marca blanca sin miedo</strong>
              <p>El 75% de los productos de marca de distribuidor están fabricados por las mismas empresas que las marcas líderes, según la OCU. La diferencia media de precio es del 35%. Prueba la marca blanca en conservas, lácteos y pasta primero.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🚫</span>
              <strong>Ignora los productos a la altura de los ojos</strong>
              <p>Los supermercados colocan los productos más caros a la altura de la vista. Los equivalentes más baratos suelen estar en los estantes inferiores o superiores. Mira siempre toda la estantería antes de elegir.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧊</span>
              <strong>Congela el excedente inmediatamente</strong>
              <p>Si compras en oferta o en formato grande, congela la cantidad que no vayas a consumir en 2 días. Pan, carne, pescado y muchas verduras blanqueadas aguantan entre 3 y 6 meses en el congelador sin perder calidad.</p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 errores que te hacen gastar más sin darte cuenta</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Ir sin lista:</strong> aumenta el gasto entre un 20% y un 40% por compras impulsivas. Sin lista, el supermercado toma las decisiones por ti.</li>
              <li><strong>Ir con hambre:</strong> los estudios demuestran que comprar con hambre dispara el gasto un 64% y aumenta la compra de ultraprocesados. Come algo antes de ir.</li>
              <li><strong>No revisar el armario antes:</strong> comprar lo que ya tienes es el segundo mayor generador de desperdicio alimentario en el hogar, después de no planificar el menú.</li>
              <li><strong>Comprar por impulso en ofertas:</strong> el 3x2 solo ahorra dinero si realmente necesitas 3 unidades y las vas a consumir. Si no, es un gasto disfrazado de ahorro.</li>
              <li><strong>Ignorar la sección de "próxima caducidad":</strong> los productos con caducidad inminente tienen descuentos del 30-50%. Si los vas a consumir ese día o al siguiente, son una oportunidad real de ahorro.</li>
              <li><strong>Comprar snacks y precocinados sin planificar:</strong> son los productos con mayor margen para el distribuidor. Calculados por ración, cuestan entre 3 y 8 veces más que su equivalente cocinado en casa. Inclúyelos en la lista con cantidad máxima semanal.</li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('lista-compras')} />

      <ShareCard appName="lista-compras" />
      <Footer appName="lista-compras" />
    </div>
  );
}
