'use client';

import { useState, useEffect } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './ListaCompras.module.css';

// Tipos
type CategoryKey = 'frutas' | 'lacteos' | 'carnes' | 'panaderia' | 'conservas' | 'congelados' | 'limpieza' | 'higiene' | 'bebidas' | 'otros';

interface Category {
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  quantity: string;
  category: CategoryKey;
  checked: boolean;
}

const categories: Record<CategoryKey, Category> = {
  frutas: { name: 'Frutas y Verduras', icon: '🍎' },
  lacteos: { name: 'Lácteos', icon: '🥛' },
  carnes: { name: 'Carnes y Pescados', icon: '🥩' },
  panaderia: { name: 'Panadería', icon: '🍞' },
  conservas: { name: 'Conservas', icon: '🥫' },
  congelados: { name: 'Congelados', icon: '🧊' },
  limpieza: { name: 'Limpieza', icon: '🧴' },
  higiene: { name: 'Higiene', icon: '💊' },
  bebidas: { name: 'Bebidas', icon: '🍷' },
  otros: { name: 'Otros', icon: '🍪' }
};

export default function ListaComprasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState<string>('');
  const [productQuantity, setProductQuantity] = useState<string>('');
  const [productCategory, setProductCategory] = useState<CategoryKey>('frutas');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<CategoryKey>>(new Set());
  const [isClient, setIsClient] = useState(false);

  // Cargar productos desde localStorage al montar
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('meskeIA_shopping_list');
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        console.error('Error al cargar productos', e);
      }
    }
  }, []);

  // Guardar productos en localStorage cada vez que cambien
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('meskeIA_shopping_list', JSON.stringify(products));
    }
  }, [products, isClient]);

  // Añadir producto
  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim() || !productQuantity.trim()) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName.trim(),
      quantity: productQuantity.trim(),
      category: productCategory,
      checked: false
    };

    setProducts([...products, newProduct]);
    setProductName('');
    setProductQuantity('');
    setProductCategory('frutas');
  };

  // Marcar producto como comprado
  const toggleProduct = (id: string) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, checked: !p.checked } : p
    ));
  };

  // Eliminar producto
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Toggle categoría colapsada
  const toggleCategory = (category: CategoryKey) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Limpiar todo
  const clearAll = () => {
    if (confirm('¿Estás seguro de que quieres eliminar toda la lista?')) {
      setProducts([]);
    }
  };

  // Copiar lista al portapapeles
  const exportList = () => {
    let text = '🛒 LISTA DE COMPRAS\n\n';

    Object.keys(categories).forEach(catKey => {
      const category = catKey as CategoryKey;
      const categoryProducts = products.filter(p => p.category === category && !p.checked);

      if (categoryProducts.length > 0) {
        text += `${categories[category].icon} ${categories[category].name.toUpperCase()}\n`;
        categoryProducts.forEach(p => {
          text += `  ☐ ${p.name} - ${p.quantity}\n`;
        });
        text += '\n';
      }
    });

    // Productos comprados
    const checkedProducts = products.filter(p => p.checked);
    if (checkedProducts.length > 0) {
      text += '✓ COMPRADOS\n';
      checkedProducts.forEach(p => {
        text += `  ✓ ${p.name}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    alert('✓ Lista copiada al portapapeles');
  };

  // Imprimir lista
  const printList = () => {
    window.print();
  };

  // Calcular estadísticas
  const totalProducts = products.length;
  const checkedProducts = products.filter(p => p.checked).length;
  const pendingProducts = totalProducts - checkedProducts;

  // Agrupar productos por categoría
  const productsByCategory: Record<CategoryKey, Product[]> = {} as Record<CategoryKey, Product[]>;
  Object.keys(categories).forEach(key => {
    const category = key as CategoryKey;
    productsByCategory[category] = products.filter(p => p.category === category);
  });

  return (
    <>
      <MeskeiaLogo />
      <AnalyticsTracker appName="lista-compras" />

      <div className={styles.container}>
        <h1>🛒 Lista de Compras Inteligente</h1>
        <p className={styles.subtitle}>Organiza tu lista por categorías del supermercado</p>

        {/* Estadísticas */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalProducts}</div>
            <div className={styles.statLabel}>Productos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{checkedProducts}</div>
            <div className={styles.statLabel}>Comprados</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{pendingProducts}</div>
            <div className={styles.statLabel}>Pendientes</div>
          </div>
        </div>

        {/* Formulario para añadir producto */}
        <div className={styles.card}>
          <form className={styles.addProductForm} onSubmit={addProduct}>
            <div className={styles.formGroup}>
              <label htmlFor="productName">Producto:</label>
              <input
                type="text"
                id="productName"
                placeholder="Ej: Manzanas"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productQuantity">Cantidad:</label>
              <input
                type="text"
                id="productQuantity"
                placeholder="Ej: 2 kg"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productCategory">Categoría:</label>
              <select
                id="productCategory"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value as CategoryKey)}
                required
              >
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <button type="submit" className={styles.btnAdd}>+ Añadir</button>
            </div>
          </form>
        </div>

        {/* Botones de acción */}
        {products.length > 0 && (
          <div className={styles.actionButtons}>
            <button type="button" className={styles.btnSecondary} onClick={exportList}>📋 Copiar Lista</button>
            <button type="button" className={styles.btnSecondary} onClick={printList}>🖨️ Imprimir</button>
            <button type="button" className={`${styles.btnSecondary} ${styles.btnDanger}`} onClick={clearAll}>🗑️ Limpiar Todo</button>
          </div>
        )}

        {/* Lista de productos por categorías */}
        {products.length > 0 ? (
          <div id="productList">
            {Object.entries(categories).map(([catKey, catData]) => {
              const category = catKey as CategoryKey;
              const categoryProducts = productsByCategory[category];

              if (categoryProducts.length === 0) return null;

              const isCollapsed = collapsedCategories.has(category);

              return (
                <div key={category} className={styles.categorySection}>
                  <div
                    className={styles.categoryHeader}
                    onClick={() => toggleCategory(category)}
                  >
                    <div className={styles.categoryTitle}>
                      <span>{catData.icon}</span>
                      <span>{catData.name}</span>
                    </div>
                    <div className={styles.categoryCount}>{categoryProducts.length}</div>
                  </div>

                  {!isCollapsed && (
                    <div className={styles.categoryItems}>
                      {categoryProducts.map(product => (
                        <div
                          key={product.id}
                          className={`${styles.productItem} ${product.checked ? styles.checked : ''}`}
                        >
                          <input
                            type="checkbox"
                            className={styles.productCheckbox}
                            checked={product.checked}
                            onChange={() => toggleProduct(product.id)}
                          />
                          <div className={styles.productInfo}>
                            <div className={styles.productName}>{product.name}</div>
                            <div className={styles.productQuantity}>{product.quantity}</div>
                          </div>
                          <button
                            type="button"
                            className={styles.productDelete}
                            onClick={() => deleteProduct(product.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🛒</div>
            <div className={styles.emptyStateText}>Tu lista está vacía</div>
            <p>Añade productos para comenzar tu lista de compras</p>
          </div>
        )}
      </div>

      {/* Secciones educativas - Siempre visibles */}
      <div className={styles.eduSection}>
        <h2>¿Cómo funciona esta lista de compras?</h2>
        <p>Organiza tu lista del supermercado por categorías para una compra más eficiente. Añade productos con cantidades y márcalos cuando los compres.</p>
        <ul>
          <li><strong>Organización automática</strong>: Los productos se agrupan por secciones del supermercado (frutas, lácteos, carnes, etc.)</li>
          <li><strong>Almacenamiento local</strong>: Tu lista se guarda automáticamente en tu navegador, funciona sin conexión</li>
          <li><strong>Control de compra</strong>: Marca productos como comprados y lleva el progreso de tu lista</li>
          <li><strong>Exportación fácil</strong>: Copia tu lista al portapapeles para compartirla por WhatsApp o imprime directamente</li>
          <li><strong>Gestión simple</strong>: Elimina productos individuales o limpia toda la lista cuando termines</li>
        </ul>
      </div>

      <div className={styles.eduSection}>
        <h2>Casos de uso prácticos</h2>
        <ul>
          <li><strong>Compra semanal</strong>: Planifica tu lista del supermercado antes de salir de casa, organizada por pasillos</li>
          <li><strong>Lista compartida</strong>: Copia tu lista y envíala por WhatsApp a tu pareja o familiar</li>
          <li><strong>Evita olvidos</strong>: Añade productos según se acaben en casa, tendrás todo siempre anotado</li>
          <li><strong>Ahorra tiempo</strong>: Sigue el orden del supermercado sin dar vueltas innecesarias</li>
          <li><strong>Control de presupuesto</strong>: Ve cuántos productos te faltan por comprar en tiempo real</li>
        </ul>
      </div>

      <Footer />
    </>
  );
}
