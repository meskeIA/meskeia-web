'use client';

import { useState, useEffect } from 'react';
import styles from './PlanificadorEmbarazo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type TabType = 'calculadora' | 'checklist' | 'compras' | 'vacunas';
type TrimestreType = 'primero' | 'segundo' | 'tercero' | 'postparto';
type CategoriaCompra = 'alimentacion' | 'higiene' | 'ropa' | 'sueno' | 'paseo' | 'salud' | 'hospital';

interface ChecklistItem {
  id: string;
  texto: string;
  trimestre: TrimestreType;
  completado: boolean;
}

interface CompraItem {
  id: string;
  nombre: string;
  categoria: CategoriaCompra;
  prioridad: 'esencial' | 'recomendado' | 'opcional';
  comprado: boolean;
}

interface Vacuna {
  nombre: string;
  edad: string;
  descripcion: string;
}

// Datos del checklist
const checklistInicial: Omit<ChecklistItem, 'completado'>[] = [
  // Primer trimestre (semanas 1-12)
  { id: 'c1', texto: 'Confirmar el embarazo con test y análisis de sangre', trimestre: 'primero' },
  { id: 'c2', texto: 'Primera visita al ginecólogo/matrona', trimestre: 'primero' },
  { id: 'c3', texto: 'Iniciar suplementos de ácido fólico', trimestre: 'primero' },
  { id: 'c4', texto: 'Análisis de sangre y orina completos', trimestre: 'primero' },
  { id: 'c5', texto: 'Ecografía de las 12 semanas (cribado)', trimestre: 'primero' },
  { id: 'c6', texto: 'Informar en el trabajo (si procede)', trimestre: 'primero' },
  { id: 'c7', texto: 'Dejar hábitos nocivos (tabaco, alcohol)', trimestre: 'primero' },
  { id: 'c8', texto: 'Revisar medicamentos con el médico', trimestre: 'primero' },
  { id: 'c9', texto: 'Empezar a cuidar la alimentación', trimestre: 'primero' },
  { id: 'c10', texto: 'Solicitar cita para la ecografía morfológica', trimestre: 'primero' },

  // Segundo trimestre (semanas 13-26)
  { id: 'c11', texto: 'Ecografía morfológica (semana 20)', trimestre: 'segundo' },
  { id: 'c12', texto: 'Test de O\'Sullivan (diabetes gestacional)', trimestre: 'segundo' },
  { id: 'c13', texto: 'Empezar clases de preparación al parto', trimestre: 'segundo' },
  { id: 'c14', texto: 'Elegir nombre del bebé', trimestre: 'segundo' },
  { id: 'c15', texto: 'Preparar la habitación del bebé', trimestre: 'segundo' },
  { id: 'c16', texto: 'Comprar primeras prendas de ropa', trimestre: 'segundo' },
  { id: 'c17', texto: 'Investigar sobre lactancia materna', trimestre: 'segundo' },
  { id: 'c18', texto: 'Vacuna de la tosferina (semana 28-32)', trimestre: 'segundo' },
  { id: 'c19', texto: 'Empezar a usar crema antiestrías', trimestre: 'segundo' },
  { id: 'c20', texto: 'Revisar el seguro médico y prestaciones', trimestre: 'segundo' },

  // Tercer trimestre (semanas 27-40)
  { id: 'c21', texto: 'Visitas de control cada 2-4 semanas', trimestre: 'tercero' },
  { id: 'c22', texto: 'Ecografía del tercer trimestre', trimestre: 'tercero' },
  { id: 'c23', texto: 'Cultivo vagino-rectal (estreptococo)', trimestre: 'tercero' },
  { id: 'c24', texto: 'Preparar bolsa del hospital', trimestre: 'tercero' },
  { id: 'c25', texto: 'Instalar silla de coche para bebé', trimestre: 'tercero' },
  { id: 'c26', texto: 'Montar la cuna y el cambiador', trimestre: 'tercero' },
  { id: 'c27', texto: 'Lavar y organizar ropa del bebé', trimestre: 'tercero' },
  { id: 'c28', texto: 'Tener a mano números de urgencias', trimestre: 'tercero' },
  { id: 'c29', texto: 'Plan de parto (si se desea elaborar)', trimestre: 'tercero' },
  { id: 'c30', texto: 'Organizar ayuda para los primeros días', trimestre: 'tercero' },
  { id: 'c31', texto: 'Conocer señales de inicio de parto', trimestre: 'tercero' },
  { id: 'c32', texto: 'Preregistro en el hospital', trimestre: 'tercero' },

  // Postparto
  { id: 'c33', texto: 'Registro civil del bebé (primeros días)', trimestre: 'postparto' },
  { id: 'c34', texto: 'Solicitar Libro de Familia', trimestre: 'postparto' },
  { id: 'c35', texto: 'Inscribir en la Seguridad Social', trimestre: 'postparto' },
  { id: 'c36', texto: 'Solicitar tarjeta sanitaria del bebé', trimestre: 'postparto' },
  { id: 'c37', texto: 'Solicitar prestación por maternidad/paternidad', trimestre: 'postparto' },
  { id: 'c38', texto: 'Primera revisión pediátrica', trimestre: 'postparto' },
  { id: 'c39', texto: 'Prueba del talón (metabolopatías)', trimestre: 'postparto' },
  { id: 'c40', texto: 'Revisión postparto de la madre (6 semanas)', trimestre: 'postparto' },
];

// Datos de la lista de compras
const comprasInicial: Omit<CompraItem, 'comprado'>[] = [
  // Alimentación
  { id: 'p1', nombre: 'Biberones (si no lactancia exclusiva)', categoria: 'alimentacion', prioridad: 'recomendado' },
  { id: 'p2', nombre: 'Esterilizador de biberones', categoria: 'alimentacion', prioridad: 'recomendado' },
  { id: 'p3', nombre: 'Calienta biberones', categoria: 'alimentacion', prioridad: 'opcional' },
  { id: 'p4', nombre: 'Leche de fórmula (reserva)', categoria: 'alimentacion', prioridad: 'recomendado' },
  { id: 'p5', nombre: 'Extractor de leche', categoria: 'alimentacion', prioridad: 'recomendado' },
  { id: 'p6', nombre: 'Discos de lactancia', categoria: 'alimentacion', prioridad: 'esencial' },
  { id: 'p7', nombre: 'Cojín de lactancia', categoria: 'alimentacion', prioridad: 'recomendado' },

  // Higiene
  { id: 'p8', nombre: 'Pañales recién nacido (talla 1)', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p9', nombre: 'Toallitas húmedas para bebé', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p10', nombre: 'Crema para el culito (pasta al agua)', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p11', nombre: 'Bañera para bebé', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p12', nombre: 'Gel/champú bebé', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p13', nombre: 'Toallas con capucha', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p14', nombre: 'Esponja natural bebé', categoria: 'higiene', prioridad: 'recomendado' },
  { id: 'p15', nombre: 'Tijeras o cortaúñas bebé', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p16', nombre: 'Cepillo suave para cabeza', categoria: 'higiene', prioridad: 'recomendado' },
  { id: 'p17', nombre: 'Aspirador nasal', categoria: 'higiene', prioridad: 'esencial' },
  { id: 'p18', nombre: 'Suero fisiológico', categoria: 'higiene', prioridad: 'esencial' },

  // Ropa
  { id: 'p19', nombre: 'Bodies manga corta (6-8 uds)', categoria: 'ropa', prioridad: 'esencial' },
  { id: 'p20', nombre: 'Bodies manga larga (6-8 uds)', categoria: 'ropa', prioridad: 'esencial' },
  { id: 'p21', nombre: 'Pijamas enterizos (4-6 uds)', categoria: 'ropa', prioridad: 'esencial' },
  { id: 'p22', nombre: 'Gorros de algodón (2-3 uds)', categoria: 'ropa', prioridad: 'esencial' },
  { id: 'p23', nombre: 'Calcetines/patucos (4-6 pares)', categoria: 'ropa', prioridad: 'esencial' },
  { id: 'p24', nombre: 'Manoplas antiarañazos', categoria: 'ropa', prioridad: 'recomendado' },
  { id: 'p25', nombre: 'Baberos (pack)', categoria: 'ropa', prioridad: 'esencial' },
  { id: 'p26', nombre: 'Muselinas/gasas (pack)', categoria: 'ropa', prioridad: 'esencial' },
  { id: 'p27', nombre: 'Arrullo o manta fina', categoria: 'ropa', prioridad: 'esencial' },

  // Sueño
  { id: 'p28', nombre: 'Cuna o minicuna', categoria: 'sueno', prioridad: 'esencial' },
  { id: 'p29', nombre: 'Colchón firme para cuna', categoria: 'sueno', prioridad: 'esencial' },
  { id: 'p30', nombre: 'Sábanas bajeras (2-3 uds)', categoria: 'sueno', prioridad: 'esencial' },
  { id: 'p31', nombre: 'Protector de colchón impermeable', categoria: 'sueno', prioridad: 'esencial' },
  { id: 'p32', nombre: 'Saco de dormir bebé', categoria: 'sueno', prioridad: 'recomendado' },
  { id: 'p33', nombre: 'Luz nocturna tenue', categoria: 'sueno', prioridad: 'recomendado' },
  { id: 'p34', nombre: 'Vigilabebés', categoria: 'sueno', prioridad: 'recomendado' },

  // Paseo
  { id: 'p35', nombre: 'Carrito/cochecito de bebé', categoria: 'paseo', prioridad: 'esencial' },
  { id: 'p36', nombre: 'Silla de coche grupo 0/0+', categoria: 'paseo', prioridad: 'esencial' },
  { id: 'p37', nombre: 'Bolsa de paseo/pañalera', categoria: 'paseo', prioridad: 'esencial' },
  { id: 'p38', nombre: 'Mochila portabebés ergonómica', categoria: 'paseo', prioridad: 'recomendado' },
  { id: 'p39', nombre: 'Parasol/sombrilla para carrito', categoria: 'paseo', prioridad: 'recomendado' },
  { id: 'p40', nombre: 'Plástico de lluvia para carrito', categoria: 'paseo', prioridad: 'recomendado' },

  // Salud
  { id: 'p41', nombre: 'Termómetro digital', categoria: 'salud', prioridad: 'esencial' },
  { id: 'p42', nombre: 'Chupetes (si se usan, 2-3 uds)', categoria: 'salud', prioridad: 'opcional' },
  { id: 'p43', nombre: 'Mordedores', categoria: 'salud', prioridad: 'recomendado' },

  // Hospital
  { id: 'p44', nombre: 'Camisones lactancia (mamá)', categoria: 'hospital', prioridad: 'esencial' },
  { id: 'p45', nombre: 'Braguitas desechables postparto', categoria: 'hospital', prioridad: 'esencial' },
  { id: 'p46', nombre: 'Compresas postparto', categoria: 'hospital', prioridad: 'esencial' },
  { id: 'p47', nombre: 'Sujetador de lactancia', categoria: 'hospital', prioridad: 'esencial' },
  { id: 'p48', nombre: 'Primera mudita del bebé', categoria: 'hospital', prioridad: 'esencial' },
  { id: 'p49', nombre: 'Documentación (DNI, tarjeta SS, cartilla)', categoria: 'hospital', prioridad: 'esencial' },
];

// Calendario de vacunación España 2024
const calendarioVacunas: Vacuna[] = [
  { nombre: 'Hepatitis B', edad: 'Recién nacido', descripcion: '1ª dosis en las primeras 24 horas' },
  { nombre: 'Hepatitis B + DTPa + VPI + Hib', edad: '2 meses', descripcion: 'Vacuna hexavalente (6 en 1)' },
  { nombre: 'Neumococo (VNC13)', edad: '2 meses', descripcion: 'Protege contra neumonía y meningitis' },
  { nombre: 'Rotavirus', edad: '2 meses', descripcion: '1ª dosis oral (opcional según CCAA)' },
  { nombre: 'Meningococo B', edad: '2 meses', descripcion: '1ª dosis (financiada)' },
  { nombre: 'Hexavalente', edad: '4 meses', descripcion: '2ª dosis (DTPa + VPI + Hib + HB)' },
  { nombre: 'Neumococo', edad: '4 meses', descripcion: '2ª dosis' },
  { nombre: 'Rotavirus', edad: '4 meses', descripcion: '2ª dosis oral' },
  { nombre: 'Meningococo B', edad: '4 meses', descripcion: '2ª dosis' },
  { nombre: 'Hexavalente', edad: '11 meses', descripcion: '3ª dosis' },
  { nombre: 'Neumococo', edad: '11 meses', descripcion: '3ª dosis (refuerzo)' },
  { nombre: 'Meningococo B', edad: '12 meses', descripcion: '3ª dosis (refuerzo)' },
  { nombre: 'Triple vírica (SRP)', edad: '12 meses', descripcion: 'Sarampión, Rubéola, Paperas' },
  { nombre: 'Meningococo ACWY', edad: '12 meses', descripcion: '1ª dosis' },
  { nombre: 'Varicela', edad: '15 meses', descripcion: '1ª dosis' },
  { nombre: 'Triple vírica', edad: '3-4 años', descripcion: '2ª dosis (refuerzo)' },
  { nombre: 'Varicela', edad: '3-4 años', descripcion: '2ª dosis' },
  { nombre: 'DTPa-VPI', edad: '6 años', descripcion: 'Refuerzo' },
  { nombre: 'Meningococo ACWY', edad: '12 años', descripcion: 'Refuerzo' },
  { nombre: 'VPH', edad: '12 años', descripcion: 'Virus del papiloma humano (niños y niñas)' },
  { nombre: 'Td', edad: '14 años', descripcion: 'Tétanos y difteria (refuerzo)' },
];

const nombresTrimestre: Record<TrimestreType, string> = {
  primero: '1er Trimestre',
  segundo: '2º Trimestre',
  tercero: '3er Trimestre',
  postparto: 'Postparto',
};

const emojisTrimestre: Record<TrimestreType, string> = {
  primero: '🌱',
  segundo: '🌸',
  tercero: '🍼',
  postparto: '👶',
};

const nombresCategoriaCompra: Record<CategoriaCompra, string> = {
  alimentacion: '🍼 Alimentación',
  higiene: '🧴 Higiene',
  ropa: '👶 Ropa',
  sueno: '🛏️ Sueño',
  paseo: '🚼 Paseo',
  salud: '🏥 Salud',
  hospital: '🏨 Hospital',
};

export default function CalculadoraFechaPartoPage() {
  const [tabActiva, setTabActiva] = useState<TabType>('calculadora');

  // Estado Calculadora
  const [fechaUltimaRegla, setFechaUltimaRegla] = useState('');
  const [resultado, setResultado] = useState<{
    fechaParto: Date;
    semanasActuales: number;
    diasRestantes: number;
    trimestre: number;
    fechaConcepcion: Date;
  } | null>(null);

  // Estado Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filtroTrimestre, setFiltroTrimestre] = useState<TrimestreType | 'todos'>('todos');

  // Estado Compras
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaCompra | 'todos'>('todos');
  const [mostrarSoloSinComprar, setMostrarSoloSinComprar] = useState(false);

  // Cargar datos de localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem('meskeia-embarazo-checklist');
    const savedCompras = localStorage.getItem('meskeia-embarazo-compras');
    const savedFecha = localStorage.getItem('meskeia-embarazo-fur');

    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    } else {
      setChecklist(checklistInicial.map(item => ({ ...item, completado: false })));
    }

    if (savedCompras) {
      setCompras(JSON.parse(savedCompras));
    } else {
      setCompras(comprasInicial.map(item => ({ ...item, comprado: false })));
    }

    if (savedFecha) {
      setFechaUltimaRegla(savedFecha);
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem('meskeia-embarazo-checklist', JSON.stringify(checklist));
    }
  }, [checklist]);

  useEffect(() => {
    if (compras.length > 0) {
      localStorage.setItem('meskeia-embarazo-compras', JSON.stringify(compras));
    }
  }, [compras]);

  useEffect(() => {
    if (fechaUltimaRegla) {
      localStorage.setItem('meskeia-embarazo-fur', fechaUltimaRegla);
    }
  }, [fechaUltimaRegla]);

  // Funciones Calculadora
  const calcular = () => {
    if (!fechaUltimaRegla) return;

    const fur = new Date(fechaUltimaRegla);
    const hoy = new Date();

    const fechaParto = new Date(fur);
    fechaParto.setDate(fechaParto.getDate() + 280);

    const fechaConcepcion = new Date(fur);
    fechaConcepcion.setDate(fechaConcepcion.getDate() + 14);

    const diasTranscurridos = Math.floor((hoy.getTime() - fur.getTime()) / (1000 * 60 * 60 * 24));
    const semanasActuales = Math.floor(diasTranscurridos / 7);
    const diasRestantes = Math.floor((fechaParto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    let trimestre = 1;
    if (semanasActuales >= 13 && semanasActuales < 27) {
      trimestre = 2;
    } else if (semanasActuales >= 27) {
      trimestre = 3;
    }

    setResultado({
      fechaParto,
      semanasActuales: Math.max(0, semanasActuales),
      diasRestantes: Math.max(0, diasRestantes),
      trimestre,
      fechaConcepcion,
    });
  };

  const formatearFecha = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const limpiar = () => {
    setFechaUltimaRegla('');
    setResultado(null);
    localStorage.removeItem('meskeia-embarazo-fur');
  };

  // Funciones Checklist
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, completado: !item.completado } : item
    ));
  };

  const getChecklistFiltrado = () => {
    if (filtroTrimestre === 'todos') return checklist;
    return checklist.filter(item => item.trimestre === filtroTrimestre);
  };

  const getProgresoChecklist = () => {
    const total = checklist.length;
    const completados = checklist.filter(item => item.completado).length;
    return { total, completados, porcentaje: Math.round((completados / total) * 100) };
  };

  // Funciones Compras
  const toggleCompraItem = (id: string) => {
    setCompras(prev => prev.map(item =>
      item.id === id ? { ...item, comprado: !item.comprado } : item
    ));
  };

  const getComprasFiltradas = () => {
    let filtered = compras;
    if (filtroCategoria !== 'todos') {
      filtered = filtered.filter(item => item.categoria === filtroCategoria);
    }
    if (mostrarSoloSinComprar) {
      filtered = filtered.filter(item => !item.comprado);
    }
    return filtered;
  };

  const getProgresoCompras = () => {
    const total = compras.length;
    const comprados = compras.filter(item => item.comprado).length;
    return { total, comprados, porcentaje: Math.round((comprados / total) * 100) };
  };

  const getPrioridadClass = (prioridad: string) => {
    switch (prioridad) {
      case 'esencial': return styles.esencial;
      case 'recomendado': return styles.recomendado;
      case 'opcional': return styles.opcional;
      default: return '';
    }
  };

  // Funciones Reset
  const resetChecklist = () => {
    if (confirm('¿Reiniciar todo el checklist? Se perderá el progreso.')) {
      setChecklist(checklistInicial.map(item => ({ ...item, completado: false })));
    }
  };

  const resetCompras = () => {
    if (confirm('¿Reiniciar la lista de compras? Se perderá el progreso.')) {
      setCompras(comprasInicial.map(item => ({ ...item, comprado: false })));
    }
  };

  // Fecha límites para input
  const hoy = new Date().toISOString().split('T')[0];
  const fechaMinima = new Date();
  fechaMinima.setDate(fechaMinima.getDate() - 294);
  const fechaMinimaStr = fechaMinima.toISOString().split('T')[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🤰 Planificador de Embarazo y Bebé</h1>
        <p className={styles.subtitle}>
          Calcula tu fecha de parto, organiza tus tareas y prepara todo para la llegada del bebé
        </p>
      </header>

      {/* Navegación de Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tabActiva === 'calculadora' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('calculadora')}
        >
          📅 Calculadora
        </button>
        <button
          className={`${styles.tab} ${tabActiva === 'checklist' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('checklist')}
        >
          ✅ Checklist
        </button>
        <button
          className={`${styles.tab} ${tabActiva === 'compras' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('compras')}
        >
          🛒 Compras
        </button>
        <button
          className={`${styles.tab} ${tabActiva === 'vacunas' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('vacunas')}
        >
          💉 Vacunas
        </button>
      </div>

      {/* Tab: Calculadora */}
      {tabActiva === 'calculadora' && (
        <div className={styles.mainContent}>
          <div className={styles.inputPanel}>
            <h2 className={styles.panelTitle}>📅 Datos del embarazo</h2>

            <div className={styles.inputGroup}>
              <label>Fecha de última regla (FUR)</label>
              <input
                type="date"
                value={fechaUltimaRegla}
                onChange={(e) => setFechaUltimaRegla(e.target.value)}
                min={fechaMinimaStr}
                max={hoy}
                className={styles.input}
              />
              <span className={styles.hint}>
                Primer día de tu última menstruación
              </span>
            </div>

            <div className={styles.botones}>
              <button onClick={calcular} className={styles.btnPrimary}>
                Calcular
              </button>
              <button onClick={limpiar} className={styles.btnSecondary}>
                Limpiar
              </button>
            </div>

            <div className={styles.infoCalculo}>
              <h4>ℹ️ ¿Cómo se calcula?</h4>
              <p>
                La fecha probable de parto se calcula sumando <strong>280 días</strong> (40 semanas)
                a la fecha de tu última regla, según la regla de Naegele.
              </p>
            </div>
          </div>

          <div className={styles.resultsPanel}>
            {resultado ? (
              <>
                <div className={styles.resultadoPrincipal}>
                  <span className={styles.resultadoIcon}>👶</span>
                  <div className={styles.resultadoFecha}>
                    {formatearFecha(resultado.fechaParto)}
                  </div>
                  <div className={styles.resultadoLabel}>
                    Fecha Probable de Parto (FPP)
                  </div>
                </div>

                <div className={styles.progresoEmbarazo}>
                  <div className={styles.progresoInfo}>
                    <span>Semana {resultado.semanasActuales} de 40</span>
                    <span>{Math.round((resultado.semanasActuales / 40) * 100)}%</span>
                  </div>
                  <div className={styles.progresoBar}>
                    <div
                      className={styles.progresoFill}
                      style={{ width: `${Math.min((resultado.semanasActuales / 40) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className={styles.detalles}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Trimestre actual</span>
                    <span className={styles.detalleValor}>
                      {resultado.trimestre}º trimestre
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Semanas de gestación</span>
                    <span className={styles.detalleValor}>
                      {resultado.semanasActuales} semanas
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Días restantes</span>
                    <span className={styles.detalleValor}>
                      {resultado.diasRestantes} días
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Fecha estimada de concepción</span>
                    <span className={styles.detalleValor}>
                      {resultado.fechaConcepcion.toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                <div className={styles.trimestres}>
                  <div className={`${styles.trimestreCard} ${resultado.trimestre === 1 ? styles.activo : ''}`}>
                    <strong>1er Trimestre</strong>
                    <span>Semanas 1-12</span>
                  </div>
                  <div className={`${styles.trimestreCard} ${resultado.trimestre === 2 ? styles.activo : ''}`}>
                    <strong>2º Trimestre</strong>
                    <span>Semanas 13-26</span>
                  </div>
                  <div className={`${styles.trimestreCard} ${resultado.trimestre === 3 ? styles.activo : ''}`}>
                    <strong>3er Trimestre</strong>
                    <span>Semanas 27-40</span>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.placeholderIcon}>🤰</span>
                <p>Introduce la fecha de tu última regla para calcular</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Checklist */}
      {tabActiva === 'checklist' && (
        <div className={styles.checklistContainer}>
          <div className={styles.checklistHeader}>
            <h2 className={styles.panelTitle}>✅ Checklist del Embarazo</h2>
            <div className={styles.progresoCompacto}>
              <span>{getProgresoChecklist().completados} de {getProgresoChecklist().total} completados</span>
              <div className={styles.progresoBarMini}>
                <div className={styles.progresoFillMini} style={{ width: `${getProgresoChecklist().porcentaje}%` }} />
              </div>
              <span className={styles.porcentaje}>{getProgresoChecklist().porcentaje}%</span>
            </div>
          </div>

          <div className={styles.filtros}>
            <button
              className={`${styles.filtroBtn} ${filtroTrimestre === 'todos' ? styles.activo : ''}`}
              onClick={() => setFiltroTrimestre('todos')}
            >
              Todos
            </button>
            {(['primero', 'segundo', 'tercero', 'postparto'] as TrimestreType[]).map(trimestre => (
              <button
                key={trimestre}
                className={`${styles.filtroBtn} ${filtroTrimestre === trimestre ? styles.activo : ''}`}
                onClick={() => setFiltroTrimestre(trimestre)}
              >
                {emojisTrimestre[trimestre]} {nombresTrimestre[trimestre]}
              </button>
            ))}
          </div>

          <div className={styles.checklistList}>
            {getChecklistFiltrado().map(item => (
              <div
                key={item.id}
                className={`${styles.checklistItem} ${item.completado ? styles.completado : ''}`}
                onClick={() => toggleChecklistItem(item.id)}
              >
                <div className={styles.checkbox}>
                  {item.completado ? '✓' : ''}
                </div>
                <span className={styles.checklistTexto}>{item.texto}</span>
                <span className={styles.trimestreBadge}>
                  {emojisTrimestre[item.trimestre]} {nombresTrimestre[item.trimestre]}
                </span>
              </div>
            ))}
          </div>

          <button onClick={resetChecklist} className={styles.btnSecondary}>
            🔄 Reiniciar Checklist
          </button>
        </div>
      )}

      {/* Tab: Compras */}
      {tabActiva === 'compras' && (
        <div className={styles.comprasContainer}>
          <div className={styles.comprasHeader}>
            <h2 className={styles.panelTitle}>🛒 Lista de Compras del Bebé</h2>
            <div className={styles.progresoCompacto}>
              <span>{getProgresoCompras().comprados} de {getProgresoCompras().total} comprados</span>
              <div className={styles.progresoBarMini}>
                <div className={styles.progresoFillMini} style={{ width: `${getProgresoCompras().porcentaje}%` }} />
              </div>
              <span className={styles.porcentaje}>{getProgresoCompras().porcentaje}%</span>
            </div>
          </div>

          <div className={styles.filtrosCompras}>
            <div className={styles.filtrosCategoria}>
              <button
                className={`${styles.filtroBtn} ${filtroCategoria === 'todos' ? styles.activo : ''}`}
                onClick={() => setFiltroCategoria('todos')}
              >
                Todas
              </button>
              {(Object.keys(nombresCategoriaCompra) as CategoriaCompra[]).map(cat => (
                <button
                  key={cat}
                  className={`${styles.filtroBtn} ${filtroCategoria === cat ? styles.activo : ''}`}
                  onClick={() => setFiltroCategoria(cat)}
                >
                  {nombresCategoriaCompra[cat]}
                </button>
              ))}
            </div>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={mostrarSoloSinComprar}
                onChange={(e) => setMostrarSoloSinComprar(e.target.checked)}
              />
              Solo pendientes
            </label>
          </div>

          <div className={styles.leyendaPrioridad}>
            <span className={styles.esencial}>● Esencial</span>
            <span className={styles.recomendado}>● Recomendado</span>
            <span className={styles.opcional}>● Opcional</span>
          </div>

          <div className={styles.comprasList}>
            {getComprasFiltradas().map(item => (
              <div
                key={item.id}
                className={`${styles.compraItem} ${item.comprado ? styles.comprado : ''}`}
                onClick={() => toggleCompraItem(item.id)}
              >
                <div className={styles.checkbox}>
                  {item.comprado ? '✓' : ''}
                </div>
                <span className={styles.compraNombre}>{item.nombre}</span>
                <span className={`${styles.prioridadBadge} ${getPrioridadClass(item.prioridad)}`}>
                  {item.prioridad}
                </span>
              </div>
            ))}
          </div>

          <button onClick={resetCompras} className={styles.btnSecondary}>
            🔄 Reiniciar Lista
          </button>
        </div>
      )}

      {/* Tab: Vacunas */}
      {tabActiva === 'vacunas' && (
        <div className={styles.vacunasContainer}>
          <h2 className={styles.panelTitle}>💉 Calendario de Vacunación Infantil (España 2024)</h2>

          <div className={styles.vacunasInfo}>
            <p>Este es el calendario de vacunación oficial del Sistema Nacional de Salud.
            Las fechas exactas pueden variar según tu Comunidad Autónoma.</p>
          </div>

          <div className={styles.vacunasList}>
            {calendarioVacunas.map((vacuna, index) => (
              <div key={index} className={styles.vacunaItem}>
                <div className={styles.vacunaEdad}>{vacuna.edad}</div>
                <div className={styles.vacunaInfo}>
                  <strong>{vacuna.nombre}</strong>
                  <span>{vacuna.descripcion}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.vacunasNota}>
            <h4>📝 Notas importantes:</h4>
            <ul>
              <li>Consulta con tu pediatra el calendario específico de tu comunidad</li>
              <li>Algunas vacunas como el Rotavirus pueden variar según CCAA</li>
              <li>Lleva siempre la cartilla de vacunación del bebé a las consultas</li>
              <li>Si se retrasa alguna dosis, consulta con tu pediatra cómo recuperarla</li>
            </ul>
          </div>

          {/* Enlace a Calculadora de Percentiles */}
          <div className={styles.enlaceRelacionado}>
            <p>📊 <strong>¿Tu bebé ya nació?</strong> Sigue su crecimiento con la{' '}
              <a href="/calculadora-percentiles/">Calculadora de Percentiles Infantiles</a>
              {' '}(peso y talla según tablas OMS)
            </p>
          </div>
        </div>
      )}

      {/* DISCLAIMER - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Médico Importante</h3>
        <p>
          Esta herramienta proporciona información <strong>orientativa y educativa</strong>.
          La fecha probable de parto es solo una estimación; solo el 5% de los bebés nacen en su fecha calculada.
        </p>
        <p>
          <strong>Esta herramienta NO sustituye el seguimiento médico profesional.</strong> Consulta siempre con
          tu ginecólogo/a, matrona o pediatra para un control adecuado del embarazo y del bebé.
        </p>
      </div>

      {/* Contenido Educativo Colapsable */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre el embarazo y los cuidados del bebé?"
        subtitle="Descubre consejos, errores comunes a evitar y listas completas para prepararte"
      >
        <section className={styles.guideSection}>
          <h2>🌟 Consejos para un Embarazo Saludable</h2>

          <div className={styles.consejosGrid}>
            <div className={styles.consejoCard}>
              <h4>🥗 Alimentación</h4>
              <ul>
                <li>Evita carnes crudas, embutidos no cocidos y pescados crudos</li>
                <li>Lava bien frutas y verduras</li>
                <li>Limita la cafeína (máx. 200mg/día)</li>
                <li>Evita quesos no pasteurizados</li>
                <li>Bebe abundante agua (2L diarios)</li>
              </ul>
            </div>

            <div className={styles.consejoCard}>
              <h4>🏃‍♀️ Actividad Física</h4>
              <ul>
                <li>Caminar 30 minutos diarios es ideal</li>
                <li>Natación y yoga prenatal son excelentes</li>
                <li>Evita deportes de impacto o contacto</li>
                <li>Haz ejercicios de suelo pélvico (Kegel)</li>
                <li>Descansa cuando lo necesites</li>
              </ul>
            </div>

            <div className={styles.consejoCard}>
              <h4>😴 Descanso</h4>
              <ul>
                <li>Duerme 8-9 horas si es posible</li>
                <li>Usa almohada entre las piernas al dormir de lado</li>
                <li>El lado izquierdo es la posición ideal</li>
                <li>Evita pantallas antes de dormir</li>
                <li>Las siestas cortas pueden ayudar</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>❌ Errores Comunes a Evitar</h2>

          <div className={styles.erroresGrid}>
            <div className={styles.errorCard}>
              <strong>❌ Automedicarse</strong>
              <p>Consulta SIEMPRE con tu médico antes de tomar cualquier medicamento, incluso los de venta libre.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Saltarse citas prenatales</strong>
              <p>Las revisiones son cruciales para detectar problemas a tiempo y garantizar el bienestar del bebé.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Comer por dos</strong>
              <p>Solo necesitas 300 calorías extra al día en el 2º y 3er trimestre. Calidad sobre cantidad.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Pintar la habitación del bebé</strong>
              <p>Evita exponerte a pinturas y disolventes. Si hay que pintar, que lo haga otra persona con ventilación.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Ignorar síntomas de alerta</strong>
              <p>Sangrado, dolor intenso, fiebre alta, disminución de movimientos fetales: acude a urgencias.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Usar tacones muy altos</strong>
              <p>El centro de gravedad cambia. Usa calzado cómodo para evitar caídas y dolores de espalda.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Olvidar la hidratación</strong>
              <p>La deshidratación puede causar contracciones. Bebe agua regularmente durante el día.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Estrés excesivo</strong>
              <p>El estrés crónico afecta al bebé. Practica técnicas de relajación y pide ayuda si la necesitas.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>🧳 Bolsa del Hospital - Lista Completa</h2>

          <div className={styles.bolsaGrid}>
            <div className={styles.bolsaCard}>
              <h4>👩 Para la Mamá</h4>
              <ul>
                <li>DNI y tarjeta sanitaria</li>
                <li>Cartilla del embarazo</li>
                <li>2-3 camisones abiertos delante</li>
                <li>Bata cómoda</li>
                <li>Zapatillas de andar por casa</li>
                <li>Chanclas para la ducha</li>
                <li>Braguitas desechables (pack)</li>
                <li>Compresas postparto</li>
                <li>Sujetadores de lactancia (2-3)</li>
                <li>Discos de lactancia</li>
                <li>Neceser: cepillo, pasta, gel, champú</li>
                <li>Cargador de móvil</li>
                <li>Ropa cómoda para el alta</li>
              </ul>
            </div>

            <div className={styles.bolsaCard}>
              <h4>👶 Para el Bebé</h4>
              <ul>
                <li>4-5 bodies (talla 0 o primera puesta)</li>
                <li>2-3 pijamas enterizos</li>
                <li>2 gorros de algodón</li>
                <li>2 pares de calcetines/patucos</li>
                <li>Manoplas antiarañazos</li>
                <li>Arrullo o manta fina</li>
                <li>Pañales talla 1</li>
                <li>Toallitas (pack pequeño)</li>
                <li>Conjunto para la salida</li>
                <li>Silla de coche grupo 0</li>
              </ul>
            </div>

            <div className={styles.bolsaCard}>
              <h4>👨 Para el Acompañante</h4>
              <ul>
                <li>Muda de ropa</li>
                <li>Artículos de aseo básicos</li>
                <li>Cargador de móvil</li>
                <li>Snacks y bebidas</li>
                <li>Algo para leer/entretenerse</li>
                <li>Dinero/tarjeta para cafetería</li>
                <li>Cámara o móvil con batería</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>📝 Trámites Tras el Nacimiento</h2>

          <div className={styles.tramitesTimeline}>
            <div className={styles.tramiteItem}>
              <div className={styles.tramiteDia}>24-72h</div>
              <div className={styles.tramiteContenido}>
                <strong>En el Hospital</strong>
                <p>Prueba del talón, prueba de audición, primera vacuna (Hepatitis B)</p>
              </div>
            </div>
            <div className={styles.tramiteItem}>
              <div className={styles.tramiteDia}>0-3 días</div>
              <div className={styles.tramiteContenido}>
                <strong>Registro Civil</strong>
                <p>Inscripción del nacimiento (muchos hospitales lo gestionan)</p>
              </div>
            </div>
            <div className={styles.tramiteItem}>
              <div className={styles.tramiteDia}>1ª semana</div>
              <div className={styles.tramiteContenido}>
                <strong>Seguridad Social</strong>
                <p>Alta del bebé como beneficiario y solicitud de tarjeta sanitaria</p>
              </div>
            </div>
            <div className={styles.tramiteItem}>
              <div className={styles.tramiteDia}>15 días</div>
              <div className={styles.tramiteContenido}>
                <strong>INSS</strong>
                <p>Solicitar prestación por nacimiento y cuidado de menor</p>
              </div>
            </div>
            <div className={styles.tramiteItem}>
              <div className={styles.tramiteDia}>1 mes</div>
              <div className={styles.tramiteContenido}>
                <strong>Ayuntamiento/CCAA</strong>
                <p>Empadronamiento del bebé y solicitar ayudas autonómicas si las hay</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes</h2>

          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Cuánto dura realmente el embarazo?</summary>
              <p>El embarazo dura aproximadamente 40 semanas (280 días) desde el primer día de la última regla.
              Sin embargo, un parto es considerado a término entre la semana 37 y 42.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué es la regla de Naegele?</summary>
              <p>Es el método más usado para calcular la FPP: se suma 1 año, se restan 3 meses y se suman 7 días
              a la fecha de la última regla. Es equivalente a sumar 280 días.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Por qué solo el 5% de bebés nacen en la fecha calculada?</summary>
              <p>Porque la fecha es una estimación estadística. Cada embarazo es único y depende de muchos factores:
              ovulación real, implantación, genética, etc. Lo normal es nacer ±2 semanas de la FPP.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuándo debo ir a urgencias?</summary>
              <p>Si presentas: sangrado vaginal abundante, rotura de aguas, contracciones regulares antes de la semana 37,
              disminución notable de movimientos fetales, dolor abdominal intenso, fiebre alta, o cualquier síntoma que te preocupe.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuántas ecografías se hacen en un embarazo normal?</summary>
              <p>Mínimo 3: una en el primer trimestre (semana 11-14), otra morfológica en el segundo (semana 18-22),
              y otra en el tercero (semana 32-36). Tu médico puede solicitar más si es necesario.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué incluye la baja por maternidad/paternidad en España?</summary>
              <p>Desde 2021, ambos progenitores tienen derecho a 16 semanas de permiso intransferible.
              Las 6 primeras son obligatorias tras el parto. El resto pueden disfrutarse hasta que el bebé cumpla 12 meses.</p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-embarazo')} />

      <Footer appName="planificador-embarazo" />
    </div>
  );
}
