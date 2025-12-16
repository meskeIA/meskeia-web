'use client';

import { useState, useEffect } from 'react';
import styles from './ListaEquipaje.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TipoViaje = 'playa' | 'montana' | 'ciudad' | 'negocios' | 'aventura';
type Clima = 'calido' | 'templado' | 'frio';
type Duracion = 'corto' | 'medio' | 'largo';

interface ItemEquipaje {
  id: string;
  nombre: string;
  categoria: string;
  checked: boolean;
}

const ITEMS_BASE: Record<string, string[]> = {
  'Documentos': [
    'DNI / Pasaporte',
    'Tarjeta sanitaria',
    'Billetes / Reservas',
    'Carnet de conducir',
    'Tarjetas de crédito',
    'Seguro de viaje',
  ],
  'Tecnología': [
    'Móvil y cargador',
    'Cargador portátil',
    'Auriculares',
    'Adaptador de enchufe',
    'Cámara de fotos',
  ],
  'Higiene': [
    'Cepillo y pasta de dientes',
    'Desodorante',
    'Champú y gel',
    'Peine / Cepillo',
    'Crema hidratante',
    'Protector solar',
  ],
  'Básicos': [
    'Ropa interior',
    'Calcetines',
    'Pijama',
    'Zapatillas cómodas',
  ],
  'Salud': [
    'Medicamentos habituales',
    'Botiquín básico',
    'Tiritas',
  ],
};

const ITEMS_POR_TIPO: Record<TipoViaje, Record<string, string[]>> = {
  playa: {
    'Playa': [
      'Bañador',
      'Toalla de playa',
      'Chanclas',
      'Gafas de sol',
      'Sombrero / Gorra',
      'Crema solar alta protección',
      'After sun',
      'Bolsa impermeable',
    ],
    'Ropa': [
      'Camisetas ligeras',
      'Pantalones cortos',
      'Vestido / Ropa fresca',
      'Sandalias',
    ],
  },
  montana: {
    'Montaña': [
      'Botas de trekking',
      'Mochila de día',
      'Bastones de senderismo',
      'Cantimplora',
      'Brújula / GPS',
      'Linterna frontal',
      'Navaja multiusos',
      'Mapa de la zona',
    ],
    'Ropa': [
      'Pantalones de trekking',
      'Camisetas técnicas',
      'Forro polar',
      'Chubasquero',
      'Gorra',
    ],
  },
  ciudad: {
    'Ciudad': [
      'Guía de viaje',
      'Calzado cómodo para caminar',
      'Mochila pequeña',
      'Paraguas plegable',
    ],
    'Ropa': [
      'Ropa casual',
      'Chaqueta ligera',
      'Zapatillas cómodas',
      'Ropa para salir',
    ],
  },
  negocios: {
    'Negocios': [
      'Traje / Ropa formal',
      'Corbata',
      'Zapatos de vestir',
      'Maletín / Bolsa portadocumentos',
      'Portátil y cargador',
      'Tarjetas de visita',
      'Bloc de notas',
    ],
    'Ropa': [
      'Camisas',
      'Pantalones de vestir',
      'Ropa casual para tiempo libre',
    ],
  },
  aventura: {
    'Aventura': [
      'Mochila grande',
      'Saco de dormir',
      'Esterilla',
      'Tienda de campaña',
      'Linterna',
      'Kit de supervivencia',
      'Cuerda',
      'Mechero / Cerillas',
    ],
    'Ropa': [
      'Ropa técnica',
      'Ropa de secado rápido',
      'Capas térmicas',
      'Calzado resistente',
    ],
  },
};

const ITEMS_POR_CLIMA: Record<Clima, string[]> = {
  calido: [
    'Protector solar SPF alto',
    'Gafas de sol',
    'Ropa ligera y transpirable',
    'Sombrero',
    'Abanico',
  ],
  templado: [
    'Chaqueta ligera',
    'Jersey fino',
    'Paraguas',
  ],
  frio: [
    'Abrigo',
    'Bufanda',
    'Guantes',
    'Gorro de lana',
    'Ropa térmica',
    'Calcetines gruesos',
  ],
};

export default function ListaEquipajePage() {
  const [tipoViaje, setTipoViaje] = useState<TipoViaje>('ciudad');
  const [clima, setClima] = useState<Clima>('templado');
  const [duracion, setDuracion] = useState<Duracion>('corto');
  const [items, setItems] = useState<ItemEquipaje[]>([]);
  const [listaGenerada, setListaGenerada] = useState(false);

  const generarLista = () => {
    const nuevosItems: ItemEquipaje[] = [];
    let idCounter = 0;

    // Añadir items base
    Object.entries(ITEMS_BASE).forEach(([categoria, itemsList]) => {
      itemsList.forEach(nombre => {
        nuevosItems.push({
          id: `item-${idCounter++}`,
          nombre,
          categoria,
          checked: false,
        });
      });
    });

    // Añadir items por tipo de viaje
    const itemsTipo = ITEMS_POR_TIPO[tipoViaje];
    Object.entries(itemsTipo).forEach(([categoria, itemsList]) => {
      itemsList.forEach(nombre => {
        if (!nuevosItems.some(item => item.nombre === nombre)) {
          nuevosItems.push({
            id: `item-${idCounter++}`,
            nombre,
            categoria,
            checked: false,
          });
        }
      });
    });

    // Añadir items por clima
    ITEMS_POR_CLIMA[clima].forEach(nombre => {
      if (!nuevosItems.some(item => item.nombre === nombre)) {
        nuevosItems.push({
          id: `item-${idCounter++}`,
          nombre,
          categoria: 'Clima',
          checked: false,
        });
      }
    });

    // Añadir items extra según duración
    if (duracion === 'medio' || duracion === 'largo') {
      const extrasMedia = ['Libro / E-reader', 'Bolsa de lavandería'];
      extrasMedia.forEach(nombre => {
        nuevosItems.push({
          id: `item-${idCounter++}`,
          nombre,
          categoria: 'Extras',
          checked: false,
        });
      });
    }

    if (duracion === 'largo') {
      const extrasLarga = ['Detergente de viaje', 'Costurero pequeño', 'Candado para maleta'];
      extrasLarga.forEach(nombre => {
        nuevosItems.push({
          id: `item-${idCounter++}`,
          nombre,
          categoria: 'Extras',
          checked: false,
        });
      });
    }

    setItems(nuevosItems);
    setListaGenerada(true);
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const marcarTodos = (checked: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, checked })));
  };

  const itemsCompletados = items.filter(item => item.checked).length;
  const porcentajeCompletado = items.length > 0 ? Math.round((itemsCompletados / items.length) * 100) : 0;

  // Agrupar items por categoría
  const itemsPorCategoria = items.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<string, ItemEquipaje[]>);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Lista de Equipaje Inteligente</h1>
        <p className={styles.subtitle}>
          Genera un checklist personalizado para no olvidar nada
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.panelTitle}>Configura tu viaje</h2>

          <div className={styles.inputGroup}>
            <label>Tipo de viaje</label>
            <select
              value={tipoViaje}
              onChange={(e) => setTipoViaje(e.target.value as TipoViaje)}
              className={styles.select}
            >
              <option value="playa">🏖️ Playa</option>
              <option value="montana">🏔️ Montaña</option>
              <option value="ciudad">🏙️ Ciudad / Turismo</option>
              <option value="negocios">💼 Negocios</option>
              <option value="aventura">🎒 Aventura / Camping</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Clima del destino</label>
            <select
              value={clima}
              onChange={(e) => setClima(e.target.value as Clima)}
              className={styles.select}
            >
              <option value="calido">☀️ Cálido (25°C+)</option>
              <option value="templado">🌤️ Templado (15-25°C)</option>
              <option value="frio">❄️ Frío (menos de 15°C)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Duración del viaje</label>
            <select
              value={duracion}
              onChange={(e) => setDuracion(e.target.value as Duracion)}
              className={styles.select}
            >
              <option value="corto">📅 Corto (1-3 días)</option>
              <option value="medio">📆 Medio (4-7 días)</option>
              <option value="largo">🗓️ Largo (más de 7 días)</option>
            </select>
          </div>

          <button onClick={generarLista} className={styles.btnGenerar}>
            Generar Lista
          </button>
        </div>

        {/* Panel de lista */}
        <div className={styles.listaPanel}>
          {listaGenerada ? (
            <>
              {/* Barra de progreso */}
              <div className={styles.progreso}>
                <div className={styles.progresoInfo}>
                  <span>{itemsCompletados} de {items.length} items</span>
                  <span>{porcentajeCompletado}%</span>
                </div>
                <div className={styles.progresoBar}>
                  <div
                    className={styles.progresoFill}
                    style={{ width: `${porcentajeCompletado}%` }}
                  />
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className={styles.acciones}>
                <button
                  onClick={() => marcarTodos(true)}
                  className={styles.btnAccion}
                >
                  ✓ Marcar todo
                </button>
                <button
                  onClick={() => marcarTodos(false)}
                  className={styles.btnAccion}
                >
                  ✗ Desmarcar todo
                </button>
              </div>

              {/* Lista de items por categoría */}
              <div className={styles.categorias}>
                {Object.entries(itemsPorCategoria).map(([categoria, itemsList]) => (
                  <div key={categoria} className={styles.categoriaBloque}>
                    <h3 className={styles.categoriaTitulo}>{categoria}</h3>
                    <ul className={styles.itemsLista}>
                      {itemsList.map(item => (
                        <li
                          key={item.id}
                          className={`${styles.item} ${item.checked ? styles.itemChecked : ''}`}
                          onClick={() => toggleItem(item.id)}
                        >
                          <span className={styles.checkbox}>
                            {item.checked ? '✓' : ''}
                          </span>
                          <span className={styles.itemNombre}>{item.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🧳</span>
              <p>Configura tu viaje y genera tu lista personalizada</p>
            </div>
          )}
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('lista-equipaje')} />

      <Footer appName="lista-equipaje" />
    </div>
  );
}
