'use client';

import { useState, useMemo } from 'react';
import styles from './ChecklistDocumentosViaje.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TipoViaje = 'espana' | 'europa' | 'internacional';

interface ItemBase {
  id: string;
  nombre: string;
  nota?: string;
  viajes: TipoViaje[]; // vacío = aplica a todos
}

interface ItemChecklist extends ItemBase {
  checked: boolean;
}

interface CategoriaConfig {
  titulo: string;
  icono: string;
  items: ItemBase[];
}

const CATEGORIAS: CategoriaConfig[] = [
  {
    titulo: 'Identidad y documentación oficial',
    icono: '🪪',
    items: [
      { id: 'dni', nombre: 'DNI en vigor', viajes: [] },
      { id: 'pasaporte', nombre: 'Pasaporte en vigor (mín. 6 meses de validez)', nota: 'Necesario fuera de la UE', viajes: ['europa', 'internacional'] },
      { id: 'fotocopia-docs', nombre: 'Fotocopia de documentos guardada aparte del original', viajes: [] },
      { id: 'foto-pasaporte', nombre: 'Foto tamaño pasaporte (2 copias)', nota: 'Para trámites de emergencia', viajes: ['internacional'] },
      { id: 'carnet-conducir', nombre: 'Carnet de conducir internacional', nota: 'Si vas a conducir en el destino', viajes: ['internacional'] },
      { id: 'carnet-conducir-eu', nombre: 'Carnet de conducir (válido en UE)', viajes: ['europa'] },
    ],
  },
  {
    titulo: 'Visados y autorizaciones de entrada',
    icono: '📋',
    items: [
      { id: 'visado', nombre: 'Visado del país de destino impreso o descargado', nota: 'Consulta el consulado del país', viajes: ['internacional'] },
      { id: 'etias', nombre: 'ETIAS o autorización equivalente', nota: 'Para entrada a algunos países fuera de UE', viajes: ['internacional'] },
      { id: 'autorizacion-entrada', nombre: 'Autorización electrónica de viaje (ETA, ESTA, etc.)', viajes: ['internacional'] },
    ],
  },
  {
    titulo: 'Sanidad y seguros',
    icono: '🏥',
    items: [
      { id: 'tse', nombre: 'Tarjeta Sanitaria Europea (TSE)', nota: 'Cubre asistencia médica básica en la UE', viajes: ['europa'] },
      { id: 'seguro-viaje', nombre: 'Seguro de viaje con cobertura médica contratado', viajes: ['europa', 'internacional'] },
      { id: 'poliza-seguro', nombre: 'Póliza del seguro impresa o en el móvil', viajes: ['europa', 'internacional'] },
      { id: 'telefono-asistencia', nombre: 'Número de asistencia en viaje 24h guardado', viajes: [] },
      { id: 'cobertura-repatriacion', nombre: 'Cobertura de repatriación confirmada', viajes: ['internacional'] },
    ],
  },
  {
    titulo: 'Transporte',
    icono: '✈️',
    items: [
      { id: 'billete', nombre: 'Billetes de avión / tren / autobús impresos o descargados offline', viajes: [] },
      { id: 'tarjeta-embarque', nombre: 'Tarjeta de embarque descargada', viajes: ['europa', 'internacional'] },
      { id: 'reserva-coche', nombre: 'Confirmación de coche de alquiler', viajes: [] },
      { id: 'transfer', nombre: 'Transfer o traslado al aeropuerto reservado', viajes: ['europa', 'internacional'] },
      { id: 'transporte-local', nombre: 'Bono de transporte local o abono descargado', viajes: [] },
    ],
  },
  {
    titulo: 'Alojamiento',
    icono: '🏨',
    items: [
      { id: 'confirmacion-hotel', nombre: 'Confirmación de hotel / apartamento impresa', viajes: [] },
      { id: 'direccion-offline', nombre: 'Dirección del alojamiento guardada sin internet', viajes: [] },
      { id: 'telefono-hotel', nombre: 'Teléfono del alojamiento guardado', viajes: [] },
      { id: 'horario-checkin', nombre: 'Horario de check-in / check-out verificado', viajes: [] },
    ],
  },
  {
    titulo: 'Salud y medicamentos',
    icono: '💊',
    items: [
      { id: 'medicamentos', nombre: 'Medicamentos habituales en cantidad suficiente', viajes: [] },
      { id: 'receta', nombre: 'Receta médica o informe en inglés (enfermedades crónicas)', viajes: ['europa', 'internacional'] },
      { id: 'vacunas', nombre: 'Vacunas requeridas o recomendadas para el destino', viajes: ['internacional'] },
      { id: 'certificado-vacunas', nombre: 'Certificado de vacunación (cartilla amarilla)', viajes: ['internacional'] },
      { id: 'botiquin', nombre: 'Botiquín básico (tiritas, analgésicos, antidiarreico)', viajes: [] },
      { id: 'repelente', nombre: 'Repelente de mosquitos y protector solar', nota: 'Si el destino lo requiere', viajes: ['internacional'] },
    ],
  },
  {
    titulo: 'Dinero y finanzas',
    icono: '💳',
    items: [
      { id: 'efectivo', nombre: 'Efectivo en moneda local del destino', viajes: [] },
      { id: 'tarjeta-credito', nombre: 'Tarjeta de crédito / débito internacional', viajes: [] },
      { id: 'tarjeta-emergencia', nombre: 'Tarjeta de emergencia (cuenta diferente)', viajes: [] },
      { id: 'bloqueo-tarjetas', nombre: 'Número de bloqueo de tarjetas guardado', viajes: [] },
      { id: 'divisa', nombre: 'Cambio de divisa realizado antes de salir', viajes: ['internacional'] },
      { id: 'aviso-banco', nombre: 'Banco avisado del viaje (para evitar bloqueo de tarjeta)', viajes: ['europa', 'internacional'] },
    ],
  },
  {
    titulo: 'Contactos de emergencia',
    icono: '📞',
    items: [
      { id: 'contacto-familiar', nombre: 'Contacto de emergencia familiar guardado y notificado', viajes: [] },
      { id: 'embajada', nombre: 'Número de la embajada o consulado español en el destino', viajes: ['europa', 'internacional'] },
      { id: 'asistencia-carretera', nombre: 'Número de asistencia en carretera', viajes: [] },
      { id: 'policia-local', nombre: 'Número de policía local del destino', viajes: ['europa', 'internacional'] },
    ],
  },
];

const TIPO_CONFIG: Record<TipoViaje, { label: string; desc: string; icono: string }> = {
  espana: { label: 'España', desc: 'Viaje nacional', icono: '🇪🇸' },
  europa: { label: 'Europa', desc: 'Dentro de la UE', icono: '🇪🇺' },
  internacional: { label: 'Internacional', desc: 'Fuera de Europa', icono: '🌍' },
};

export default function ChecklistDocumentosViajePage() {
  const [tipoViaje, setTipoViaje] = useState<TipoViaje>('europa');
  const [itemsChecked, setItemsChecked] = useState<Record<string, boolean>>({});

  // Items filtrados por tipo de viaje
  const categoriasFiltradas = useMemo(() =>
    CATEGORIAS.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.viajes.length === 0 || item.viajes.includes(tipoViaje)
      ),
    })).filter(cat => cat.items.length > 0),
    [tipoViaje]
  );

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

  const cambiarTipo = (tipo: TipoViaje) => {
    setTipoViaje(tipo);
    setItemsChecked({});
  };

  const descargarChecklist = () => {
    const lineas: string[] = [
      `CHECKLIST DE DOCUMENTOS DE VIAJE`,
      `Tipo: ${TIPO_CONFIG[tipoViaje].label} — ${TIPO_CONFIG[tipoViaje].desc}`,
      `Progreso: ${itemsCompletados}/${totalItems} (${porcentaje}%)`,
      `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
      '',
    ];

    categoriasFiltradas.forEach(cat => {
      lineas.push(`\n${cat.icono} ${cat.titulo.toUpperCase()}`);
      lineas.push('─'.repeat(40));
      cat.items.forEach(item => {
        const estado = itemsChecked[item.id] ? '[✓]' : '[ ]';
        lineas.push(`${estado} ${item.nombre}`);
        if (item.nota) lineas.push(`     → ${item.nota}`);
      });
    });

    lineas.push('\n\nGenerado con meskeIA — meskeia.com');

    const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-documentos-viaje-${tipoViaje}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📋 Documentos de Viaje</h1>
        <p className={styles.subtitle}>Checklist personalizada para no olvidar nada antes de salir</p>
      </header>

      <LegalNotice />

      {/* Selector de tipo de viaje */}
      <div className={styles.tipoBar}>
        {(Object.entries(TIPO_CONFIG) as [TipoViaje, typeof TIPO_CONFIG[TipoViaje]][]).map(([tipo, cfg]) => (
          <button
            key={tipo}
            onClick={() => cambiarTipo(tipo)}
            className={`${styles.tipoBtn} ${tipoViaje === tipo ? styles.active : ''}`}
            aria-pressed={tipoViaje === tipo}
          >
            <span className={styles.tipoIcon}>{cfg.icono}</span>
            <span className={styles.tipoLabel}>{cfg.label}</span>
            <span className={styles.tipoDesc}>{cfg.desc}</span>
          </button>
        ))}
      </div>

      {/* Barra de progreso */}
      <div className={`${styles.progresoWrapper} ${todoCompleto ? styles.progresoCompleto : ''}`}>
        <div className={styles.progresoHeader}>
          <span className={styles.progresoTexto}>
            {todoCompleto ? '✅ ¡Todo listo para el viaje!' : `${itemsCompletados} de ${totalItems} documentos verificados`}
          </span>
          <span className={styles.progresoPorcentaje}>{porcentaje}%</span>
        </div>
        <div className={styles.progresoBar}>
          <div className={styles.progresoFill} style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className={styles.acciones}>
        <button onClick={() => marcarTodos(true)} className={styles.btnAccion}>
          ✓ Marcar todo
        </button>
        <button onClick={() => marcarTodos(false)} className={styles.btnAccion}>
          ✗ Desmarcar todo
        </button>
        <button onClick={descargarChecklist} className={styles.btnDescargar}>
          ⬇️ Descargar lista
        </button>
      </div>

      {/* Mensaje completo */}
      {todoCompleto && (
        <div className={styles.mensajeCompleto} role="alert">
          <h2>🎒 ¡Todo en orden!</h2>
          <p>Tienes todos los documentos preparados para tu viaje a {TIPO_CONFIG[tipoViaje].label}. ¡Buen viaje!</p>
        </div>
      )}

      {/* Checklist por categorías */}
      <div className={styles.checklist}>
        {categoriasFiltradas.map(cat => {
          const completadosCat = cat.items.filter(item => itemsChecked[item.id]).length;
          return (
            <div key={cat.titulo} className={styles.categoriaBloque}>
              <div className={styles.categoriaHeader}>
                <span className={styles.categoriaIcon} aria-hidden="true">{cat.icono}</span>
                <h2 className={styles.categoriaTitulo}>{cat.titulo}</h2>
                <span className={styles.categoriaProgreso}>{completadosCat}/{cat.items.length}</span>
              </div>
              <ul className={styles.itemsLista}>
                {cat.items.map(item => (
                  <li
                    key={item.id}
                    className={`${styles.item} ${itemsChecked[item.id] ? styles.itemChecked : ''}`}
                    onClick={() => toggleItem(item.id)}
                    role="checkbox"
                    aria-checked={!!itemsChecked[item.id]}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? toggleItem(item.id) : undefined}
                  >
                    <span className={styles.checkbox} aria-hidden="true">
                      {itemsChecked[item.id] ? '✓' : ''}
                    </span>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemNombre}>{item.nombre}</span>
                      {item.nota && <p className={styles.itemNota}>{item.nota}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <RelatedApps apps={getRelatedApps('checklist-documentos-viaje')} />
      <Footer appName="checklist-documentos-viaje" />
    </div>
  );
}
