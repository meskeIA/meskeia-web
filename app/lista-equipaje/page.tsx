'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import styles from './ListaEquipaje.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
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

interface EstadoGuardado {
  items: ItemEquipaje[];
  tipoViaje: TipoViaje;
  clima: Clima;
  duracion: Duracion;
}

const STORAGE_KEY = 'meskeia-equipaje';

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

  // Inputs para añadir items/categorías
  const [inputCategoria, setInputCategoria] = useState<Record<string, string>>({});
  const [nuevaCategoriaInput, setNuevaCategoriaInput] = useState('');
  const [nuevaCategoriaItemInput, setNuevaCategoriaItemInput] = useState('');

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as EstadoGuardado;
        setItems(data.items ?? []);
        setTipoViaje(data.tipoViaje ?? 'ciudad');
        setClima(data.clima ?? 'templado');
        setDuracion(data.duracion ?? 'corto');
        setListaGenerada(true);
      }
    } catch {
      // datos corruptos, ignorar
    }
  }, []);

  // Guardar en localStorage cuando cambia la lista
  useEffect(() => {
    if (!listaGenerada) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, tipoViaje, clima, duracion }));
  }, [items, tipoViaje, clima, duracion, listaGenerada]);

  const generarLista = () => {
    const nuevosItems: ItemEquipaje[] = [];
    let idCounter = 0;

    Object.entries(ITEMS_BASE).forEach(([categoria, itemsList]) => {
      itemsList.forEach(nombre => {
        nuevosItems.push({ id: `item-${idCounter++}`, nombre, categoria, checked: false });
      });
    });

    const itemsTipo = ITEMS_POR_TIPO[tipoViaje];
    Object.entries(itemsTipo).forEach(([categoria, itemsList]) => {
      itemsList.forEach(nombre => {
        if (!nuevosItems.some(item => item.nombre === nombre)) {
          nuevosItems.push({ id: `item-${idCounter++}`, nombre, categoria, checked: false });
        }
      });
    });

    ITEMS_POR_CLIMA[clima].forEach(nombre => {
      if (!nuevosItems.some(item => item.nombre === nombre)) {
        nuevosItems.push({ id: `item-${idCounter++}`, nombre, categoria: 'Clima', checked: false });
      }
    });

    if (duracion === 'medio' || duracion === 'largo') {
      ['Libro / E-reader', 'Bolsa de lavandería'].forEach(nombre => {
        nuevosItems.push({ id: `item-${idCounter++}`, nombre, categoria: 'Extras', checked: false });
      });
    }

    if (duracion === 'largo') {
      ['Detergente de viaje', 'Costurero pequeño', 'Candado para maleta'].forEach(nombre => {
        nuevosItems.push({ id: `item-${idCounter++}`, nombre, categoria: 'Extras', checked: false });
      });
    }

    setItems(nuevosItems);
    setListaGenerada(true);
    setInputCategoria({});
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const eliminarItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const añadirItemACategoria = (categoria: string) => {
    const texto = (inputCategoria[categoria] ?? '').trim();
    if (!texto) return;
    setItems(prev => [...prev, {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nombre: texto,
      categoria,
      checked: false,
    }]);
    setInputCategoria(prev => ({ ...prev, [categoria]: '' }));
  };

  const onKeyAddItem = (e: KeyboardEvent<HTMLInputElement>, categoria: string) => {
    if (e.key === 'Enter') añadirItemACategoria(categoria);
  };

  const añadirCategoria = () => {
    const nombre = nuevaCategoriaInput.trim();
    const primerItem = nuevaCategoriaItemInput.trim();
    if (!nombre || !primerItem) return;
    if (itemsPorCategoria[nombre]) return; // ya existe
    setItems(prev => [...prev, {
      id: `custom-cat-${Date.now()}`,
      nombre: primerItem,
      categoria: nombre,
      checked: false,
    }]);
    setNuevaCategoriaInput('');
    setNuevaCategoriaItemInput('');
  };

  const onKeyNuevaCategoria = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') añadirCategoria();
  };

  const marcarTodos = (checked: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, checked })));
  };

  const resetearLista = () => {
    setItems([]);
    setListaGenerada(false);
    setInputCategoria({});
    setNuevaCategoriaInput('');
    setNuevaCategoriaItemInput('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const itemsCompletados = items.filter(item => item.checked).length;
  const porcentajeCompletado = items.length > 0 ? Math.round((itemsCompletados / items.length) * 100) : 0;

  const itemsPorCategoria = items.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
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

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="lista-equipaje-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.panelTitle}>Configura tu viaje</h2>

          <div className={styles.inputGroup}>
            <label htmlFor="tipo-viaje">Tipo de viaje</label>
            <select
              id="tipo-viaje"
              title="Tipo de viaje"
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
            <label htmlFor="clima">Clima del destino</label>
            <select
              id="clima"
              title="Clima del destino"
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
            <label htmlFor="duracion">Duración del viaje</label>
            <select
              id="duracion"
              title="Duración del viaje"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value as Duracion)}
              className={styles.select}
            >
              <option value="corto">📅 Corto (1-3 días)</option>
              <option value="medio">📆 Medio (4-7 días)</option>
              <option value="largo">🗓️ Largo (más de 7 días)</option>
            </select>
          </div>

          <button type="button" onClick={generarLista} className={styles.btnGenerar}>
            {listaGenerada ? '🔄 Regenerar lista' : '✨ Generar lista'}
          </button>
          {listaGenerada && (
            <p className={styles.avisoRegenerar}>
              Regenerar reemplazará los items actuales y perderás las personalizaciones.
            </p>
          )}
        </div>

        {/* Panel de lista */}
        <div className={styles.listaPanel}>
          {listaGenerada ? (
            <>
              {/* Barra de progreso */}
              <div className={styles.progreso}>
                <div className={styles.progresoInfo}>
                  <span>{itemsCompletados} de {items.length} items empaquetados</span>
                  <span>{porcentajeCompletado}%</span>
                </div>
                <div className={styles.progresoBar}>
                  <div
                    className={styles.progresoFill}
                    style={{ '--fill-width': `${porcentajeCompletado}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className={styles.acciones}>
                <button type="button" onClick={() => marcarTodos(true)} className={styles.btnAccion}>
                  ✓ Marcar todo
                </button>
                <button type="button" onClick={() => marcarTodos(false)} className={styles.btnAccion}>
                  ✗ Desmarcar todo
                </button>
                <button type="button" onClick={resetearLista} className={styles.btnReset}>
                  🗑 Vaciar lista
                </button>
              </div>

              {/* Lista por categoría */}
              <div className={styles.categorias}>
                {Object.entries(itemsPorCategoria).map(([categoria, itemsList]) => (
                  <div key={categoria} className={styles.categoriaBloque}>
                    <h3 className={styles.categoriaTitulo}>{categoria}</h3>
                    <ul className={styles.itemsLista}>
                      {itemsList.map(item => (
                        <li
                          key={item.id}
                          className={`${styles.item} ${item.checked ? styles.itemChecked : ''}`}
                        >
                          <span
                            className={styles.checkbox}
                            onClick={() => toggleItem(item.id)}
                            role="checkbox"
                            aria-checked={item.checked}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? toggleItem(item.id) : undefined}
                          >
                            {item.checked ? '✓' : ''}
                          </span>
                          <span
                            className={styles.itemNombre}
                            onClick={() => toggleItem(item.id)}
                          >
                            {item.nombre}
                          </span>
                          <button
                            className={styles.itemBorrar}
                            onClick={() => eliminarItem(item.id)}
                            aria-label={`Eliminar ${item.nombre}`}
                            title="Eliminar item"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Añadir item a esta categoría */}
                    <div className={styles.addItemRow}>
                      <input
                        type="text"
                        placeholder={`Añadir a ${categoria}...`}
                        value={inputCategoria[categoria] ?? ''}
                        onChange={(e) => setInputCategoria(prev => ({ ...prev, [categoria]: e.target.value }))}
                        onKeyDown={(e) => onKeyAddItem(e, categoria)}
                        className={styles.inputAdd}
                        aria-label={`Añadir item a ${categoria}`}
                      />
                      <button
                        onClick={() => añadirItemACategoria(categoria)}
                        className={styles.btnAdd}
                        aria-label={`Añadir a ${categoria}`}
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                ))}

                {/* Nueva categoría personalizada */}
                <div className={styles.nuevaCategoriaSection}>
                  <p className={styles.nuevaCategoriaTitulo}>＋ Nueva categoría personalizada</p>
                  <div className={styles.nuevaCategoriaForm}>
                    <input
                      type="text"
                      placeholder="Nombre de categoría"
                      value={nuevaCategoriaInput}
                      onChange={(e) => setNuevaCategoriaInput(e.target.value)}
                      onKeyDown={onKeyNuevaCategoria}
                      className={styles.inputAdd}
                      aria-label="Nombre de la nueva categoría"
                    />
                    <input
                      type="text"
                      placeholder="Primer item"
                      value={nuevaCategoriaItemInput}
                      onChange={(e) => setNuevaCategoriaItemInput(e.target.value)}
                      onKeyDown={onKeyNuevaCategoria}
                      className={styles.inputAdd}
                      aria-label="Primer item de la nueva categoría"
                    />
                    <button
                      onClick={añadirCategoria}
                      className={styles.btnAdd}
                      disabled={!nuevaCategoriaInput.trim() || !nuevaCategoriaItemInput.trim()}
                    >
                      Crear
                    </button>
                  </div>
                </div>
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

      <EducationalSection
        title="Guía completa de equipaje de viaje"
        subtitle="Reglas de equipaje de mano por aerolínea, cómo empacar de forma inteligente y los errores más comunes que retrasan en el aeropuerto"
      >
        <h3 className={styles.eduTitle}>Reglas de equipaje de mano por aerolínea</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aerolínea</th>
                <th>Dimensiones máximas</th>
                <th>Peso máximo</th>
                <th>Nota importante</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vueling</td>
                <td>55 × 40 × 20 cm</td>
                <td>10 kg</td>
                <td>Incluido en billete básico</td>
              </tr>
              <tr>
                <td>Ryanair</td>
                <td>40 × 20 × 25 cm (gratis) / 55 × 40 × 20 cm (de pago)</td>
                <td>10 kg (con pago)</td>
                <td>Solo 1 bolso pequeño gratis</td>
              </tr>
              <tr>
                <td>Iberia</td>
                <td>56 × 45 × 25 cm</td>
                <td>10 kg</td>
                <td>Más bolso pequeño bajo asiento</td>
              </tr>
              <tr>
                <td>EasyJet</td>
                <td>56 × 45 × 25 cm</td>
                <td>Sin límite de peso</td>
                <td>Incluido en todos los billetes</td>
              </tr>
              <tr>
                <td>Wizz Air</td>
                <td>40 × 30 × 20 cm</td>
                <td>10 kg</td>
                <td>Maleta en cabina solo con WIZZ Go+</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className={styles.eduTitle}>Casos de uso por tipo de viaje</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>💼</span>
              <strong>Viaje de negocios de 2-3 días</strong>
            </div>
            <p className={styles.escenarioDesc}>
              Selecciona tipo &quot;Negocios&quot; y duración &quot;Corto&quot;. La lista incluirá traje, portátil, tarjetas y lo esencial. Con maleta de mano cabina y un poco de organización, evitarás facturar.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏖️</span>
              <strong>Escapada de fin de semana a playa</strong>
            </div>
            <p className={styles.escenarioDesc}>
              Configura tipo &quot;Playa&quot;, clima &quot;Cálido&quot; y duración &quot;Corto&quot;. La herramienta generará una lista completa sin olvidar protector solar, bañador ni adaptador de enchufe.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎒</span>
              <strong>Mochilero por Europa</strong>
            </div>
            <p className={styles.escenarioDesc}>
              Usa tipo &quot;Ciudad&quot; o &quot;Aventura&quot; con duración &quot;Largo&quot;. Añade categorías personalizadas para cada país que visites, con las cosas específicas que necesites en cada destino.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
              <strong>Viaje familiar con niños</strong>
            </div>
            <p className={styles.escenarioDesc}>
              Crea una lista base para adultos y añade una categoría personalizada &quot;Niños&quot; con pañales, juguetes, snacks y medicamentos. La lista se guarda automáticamente para tu próximo viaje.
            </p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué líquidos puedo llevar en el avión?</strong>
            <p>En vuelos dentro de la UE y desde aeropuertos europeos, los líquidos deben ir en envases de máximo 100 ml cada uno, dentro de una bolsa de plástico transparente y resellable de máximo 1 litro. Cada pasajero puede llevar una sola bolsa.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo evitar que me facturen el equipaje de mano?</strong>
            <p>Verifica las dimensiones exactas de la aerolínea antes de volar. Usa una maleta de cabina de talla estándar (55 × 40 × 20 cm para la mayoría). Lleva ropa comprimida con bolsas de vacío y aprovecha el espacio de los zapatos para guardar objetos pequeños.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo llevar medicamentos en el avión?</strong>
            <p>Sí. Los medicamentos con prescripción médica se permiten en cantidades razonables para el viaje, incluso líquidos por encima de 100 ml si tienes la receta médica. Conviene llevar la documentación del médico o farmacéutico, especialmente en vuelos internacionales.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué documentos debo llevar siempre en la mochila de mano?</strong>
            <p>Nunca factures: DNI o pasaporte, tarjeta de embarque, tarjetas de crédito, dinero en efectivo, seguro de viaje, medicamentos esenciales y dispositivos electrónicos de valor. Si la maleta se pierde, estos objetos son irreemplazables a corto plazo.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Se guarda mi lista automáticamente?</strong>
            <p>Sí. La lista se guarda en el almacenamiento local de tu navegador. La próxima vez que abras la aplicación en el mismo dispositivo, la lista aparecerá con el estado que dejaste. Los datos nunca salen de tu dispositivo.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo añadir items específicos que no están en la lista?</strong>
            <p>Usa el campo de texto debajo de cada categoría para añadir items personalizados, o crea una categoría completamente nueva con el formulario de la parte inferior. Todos los items personalizados también se guardan automáticamente.</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>Cómo usar la lista de equipaje</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Configura tu viaje</strong>
              <p>Selecciona el tipo de viaje (playa, montaña, negocios...), el clima del destino y la duración. Estos tres factores determinan la lista base generada.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Genera la lista personalizada</strong>
              <p>Pulsa &quot;Generar lista&quot; para crear un checklist adaptado a tu viaje. Incluye elementos básicos (documentos, higiene, tecnología) más los específicos del tipo de viaje y clima seleccionados.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Personaliza con tus propios items</strong>
              <p>Añade items adicionales dentro de cada categoría existente o crea categorías completamente nuevas para necesidades específicas (medicamentos, artículos de bebé, material deportivo...).</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Empaca y marca cada item</strong>
              <p>A medida que vayas empacando, haz clic en cada item para marcarlo como completado. La barra de progreso te indica cuánto te falta para terminar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Revisa antes de salir</strong>
              <p>Antes de cerrar la maleta, repasa la lista una última vez. Los items sin marcar destacan visualmente para que no se te escape nada importante.</p>
            </div>
          </div>
        </div>

        <h3 className={styles.eduTitle}>Trucos para empacar de forma inteligente</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🌀</span>
            <strong>Enrolla la ropa</strong>
            <p>Enrollar camisetas y pantalones en lugar de doblarlos ocupa hasta un 30% menos de espacio y reduce las arrugas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🫙</span>
            <strong>Bolsas de compresión</strong>
            <p>Ideal para ropa de abrigo o de cama. Una bolsa de compresión puede reducir el volumen a la mitad sin aumentar el peso.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>👟</span>
            <strong>Aprovecha el interior</strong>
            <p>Mete calcetines y objetos pequeños dentro de los zapatos para aprovechar el espacio muerto y proteger la forma del calzado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⚖️</span>
            <strong>Lo pesado abajo</strong>
            <p>Coloca los objetos más pesados (zapatos, portátil, libros) cerca de las ruedas para que la maleta sea más estable al desplazarla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔢</span>
            <strong>La regla del 3</strong>
            <p>Solo lleva ropa que puedas combinar al menos 3 veces. Un pantalón neutro + 3 camisetas = 9 combinaciones distintas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📸</span>
            <strong>Fotografía la lista</strong>
            <p>Antes de cerrar la maleta, haz una foto de la lista completa. Si en el destino dudas sobre si llevaste algo, tienes la referencia.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores que pueden hacerte perder el vuelo o el equipaje</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>No verificar las restricciones de líquidos</strong> — Los controles de seguridad confiscan líquidos que superen los 100 ml aunque estén en un envase más grande. Transfiere siempre a envases pequeños.</li>
            <li><strong>No revisar las reglas específicas de tu aerolínea</strong> — Las dimensiones y el peso varían significativamente entre aerolíneas. Una maleta válida para Vueling puede cobrarse como equipaje extra en Ryanair.</li>
            <li><strong>Baterías de litio en el facturado</strong> — Las baterías externas y de portátiles deben viajar siempre en el equipaje de mano, nunca en bodega. Pueden ser confiscadas o causar problemas en el control.</li>
            <li><strong>Medicamentos sin documentación</strong> — En vuelos internacionales, algunos países requieren receta médica para ciertos medicamentos. Lleva siempre la prescripción y el prospecto original.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('lista-equipaje')} />
      <ShareCard appName="lista-equipaje" />
      <Footer appName="lista-equipaje" />
    </div>
  );
}
