'use client';

import { useState, useEffect } from 'react';
import styles from './PlanificadorMascota.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import EducationalSection from '@/components/EducationalSection';

// Tipos
type TabType = 'perfil' | 'checklist' | 'compras' | 'vacunas';
type TipoMascota = 'perro' | 'gato';
type EtapaType = 'llegada' | 'primeros_meses' | 'juvenil' | 'adulto';
type CategoriaCompra = 'alimentacion' | 'higiene' | 'descanso' | 'paseo' | 'juguetes' | 'salud' | 'identificacion';
type TamanoPerro = 'pequeno' | 'mediano' | 'grande' | 'gigante';

interface PerfilMascota {
  nombre: string;
  tipo: TipoMascota;
  raza: string;
  fechaNacimiento: string;
  fechaLlegada: string;
  peso: string;
  tamano: TamanoPerro;
  esterilizado: boolean;
  chip: boolean;
}

interface ChecklistItem {
  id: string;
  texto: string;
  etapa: EtapaType;
  tipoMascota: TipoMascota | 'ambos';
  completado: boolean;
}

interface CompraItem {
  id: string;
  nombre: string;
  categoria: CategoriaCompra;
  tipoMascota: TipoMascota | 'ambos';
  prioridad: 'esencial' | 'recomendado' | 'opcional';
  comprado: boolean;
}

interface Vacuna {
  nombre: string;
  edad: string;
  descripcion: string;
  tipoMascota: TipoMascota | 'ambos';
  obligatoria: boolean;
}

// Datos del checklist
const checklistInicial: Omit<ChecklistItem, 'completado'>[] = [
  // Etapa: Llegada (primeras 2 semanas)
  { id: 'c1', texto: 'Primera visita al veterinario (revisión general)', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c2', texto: 'Desparasitación interna (si no está hecha)', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c3', texto: 'Preparar zona de descanso tranquila', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c4', texto: 'Establecer horarios de comida fijos', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c5', texto: 'Dejar que explore la casa gradualmente', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c6', texto: 'Asegurar ventanas y balcones', etapa: 'llegada', tipoMascota: 'gato' },
  { id: 'c7', texto: 'Retirar plantas tóxicas del alcance', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c8', texto: 'Esconder cables eléctricos', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c9', texto: 'Establecer zona de hacer sus necesidades', etapa: 'llegada', tipoMascota: 'ambos' },
  { id: 'c10', texto: 'Primera noche: paciencia con lloros/maullidos', etapa: 'llegada', tipoMascota: 'ambos' },

  // Etapa: Primeros meses (2-4 meses)
  { id: 'c11', texto: 'Completar calendario de vacunación inicial', etapa: 'primeros_meses', tipoMascota: 'ambos' },
  { id: 'c12', texto: 'Desparasitación externa (pipeta/collar)', etapa: 'primeros_meses', tipoMascota: 'ambos' },
  { id: 'c13', texto: 'Comenzar socialización con personas', etapa: 'primeros_meses', tipoMascota: 'ambos' },
  { id: 'c14', texto: 'Socialización con otros animales (con precaución)', etapa: 'primeros_meses', tipoMascota: 'perro' },
  { id: 'c15', texto: 'Enseñar a acudir cuando se le llama', etapa: 'primeros_meses', tipoMascota: 'perro' },
  { id: 'c16', texto: 'Habituar al transportín', etapa: 'primeros_meses', tipoMascota: 'ambos' },
  { id: 'c17', texto: 'Acostumbrar a cepillado y manipulación', etapa: 'primeros_meses', tipoMascota: 'ambos' },
  { id: 'c18', texto: 'Primeros paseos cortos (tras vacunas)', etapa: 'primeros_meses', tipoMascota: 'perro' },
  { id: 'c19', texto: 'Instalar rascador y enseñar a usarlo', etapa: 'primeros_meses', tipoMascota: 'gato' },
  { id: 'c20', texto: 'Colocar microchip identificativo', etapa: 'primeros_meses', tipoMascota: 'ambos' },

  // Etapa: Juvenil (4-12 meses)
  { id: 'c21', texto: 'Consultar con veterinario sobre esterilización', etapa: 'juvenil', tipoMascota: 'ambos' },
  { id: 'c22', texto: 'Transición gradual a alimentación de adulto', etapa: 'juvenil', tipoMascota: 'ambos' },
  { id: 'c23', texto: 'Reforzar educación básica (sentarse, quieto)', etapa: 'juvenil', tipoMascota: 'perro' },
  { id: 'c24', texto: 'Aumentar duración de paseos', etapa: 'juvenil', tipoMascota: 'perro' },
  { id: 'c25', texto: 'Primera limpieza dental profesional si es necesario', etapa: 'juvenil', tipoMascota: 'ambos' },
  { id: 'c26', texto: 'Enseñar a quedarse solo gradualmente', etapa: 'juvenil', tipoMascota: 'ambos' },
  { id: 'c27', texto: 'Revisión veterinaria de control (6 meses)', etapa: 'juvenil', tipoMascota: 'ambos' },
  { id: 'c28', texto: 'Corregir comportamientos no deseados', etapa: 'juvenil', tipoMascota: 'ambos' },
  { id: 'c29', texto: 'Acostumbrar a viajes en coche', etapa: 'juvenil', tipoMascota: 'ambos' },
  { id: 'c30', texto: 'Valorar seguro de mascotas', etapa: 'juvenil', tipoMascota: 'ambos' },

  // Etapa: Adulto (rutina anual)
  { id: 'c31', texto: 'Revisión veterinaria anual completa', etapa: 'adulto', tipoMascota: 'ambos' },
  { id: 'c32', texto: 'Vacuna antirrábica anual (obligatoria)', etapa: 'adulto', tipoMascota: 'perro' },
  { id: 'c33', texto: 'Refuerzo vacunas según calendario', etapa: 'adulto', tipoMascota: 'ambos' },
  { id: 'c34', texto: 'Desparasitación interna trimestral', etapa: 'adulto', tipoMascota: 'ambos' },
  { id: 'c35', texto: 'Desparasitación externa mensual/trimestral', etapa: 'adulto', tipoMascota: 'ambos' },
  { id: 'c36', texto: 'Renovar licencia municipal (según localidad)', etapa: 'adulto', tipoMascota: 'perro' },
  { id: 'c37', texto: 'Control de peso y ajuste de alimentación', etapa: 'adulto', tipoMascota: 'ambos' },
  { id: 'c38', texto: 'Revisión dental anual', etapa: 'adulto', tipoMascota: 'ambos' },
  { id: 'c39', texto: 'Actualizar datos del microchip si hay cambios', etapa: 'adulto', tipoMascota: 'ambos' },
  { id: 'c40', texto: 'Analítica de sangre anual (a partir de 7 años)', etapa: 'adulto', tipoMascota: 'ambos' },
];

// Datos de la lista de compras
const comprasInicial: Omit<CompraItem, 'comprado'>[] = [
  // Alimentación
  { id: 'p1', nombre: 'Pienso de calidad para cachorros', categoria: 'alimentacion', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p2', nombre: 'Comedero (acero inox o cerámica)', categoria: 'alimentacion', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p3', nombre: 'Bebedero (mejor fuente para gatos)', categoria: 'alimentacion', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p4', nombre: 'Snacks/premios para entrenamiento', categoria: 'alimentacion', tipoMascota: 'ambos', prioridad: 'recomendado' },
  { id: 'p5', nombre: 'Comida húmeda (latas/sobres)', categoria: 'alimentacion', tipoMascota: 'ambos', prioridad: 'recomendado' },
  { id: 'p6', nombre: 'Contenedor hermético para pienso', categoria: 'alimentacion', tipoMascota: 'ambos', prioridad: 'opcional' },
  { id: 'p7', nombre: 'Comedero antivoracidad', categoria: 'alimentacion', tipoMascota: 'perro', prioridad: 'opcional' },
  { id: 'p8', nombre: 'Hierba gatera (para digestión)', categoria: 'alimentacion', tipoMascota: 'gato', prioridad: 'recomendado' },

  // Higiene
  { id: 'p9', nombre: 'Empapadores/pañales educativos', categoria: 'higiene', tipoMascota: 'perro', prioridad: 'esencial' },
  { id: 'p10', nombre: 'Arenero (cerrado o abierto)', categoria: 'higiene', tipoMascota: 'gato', prioridad: 'esencial' },
  { id: 'p11', nombre: 'Arena para gatos', categoria: 'higiene', tipoMascota: 'gato', prioridad: 'esencial' },
  { id: 'p12', nombre: 'Pala recogearena', categoria: 'higiene', tipoMascota: 'gato', prioridad: 'esencial' },
  { id: 'p13', nombre: 'Champú específico para cachorros', categoria: 'higiene', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p14', nombre: 'Cepillo/peine según tipo de pelo', categoria: 'higiene', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p15', nombre: 'Cortaúñas para mascotas', categoria: 'higiene', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p16', nombre: 'Toallitas húmedas para mascotas', categoria: 'higiene', tipoMascota: 'ambos', prioridad: 'recomendado' },
  { id: 'p17', nombre: 'Limpiador de oídos', categoria: 'higiene', tipoMascota: 'ambos', prioridad: 'recomendado' },
  { id: 'p18', nombre: 'Cepillo de dientes y pasta dental', categoria: 'higiene', tipoMascota: 'ambos', prioridad: 'recomendado' },
  { id: 'p19', nombre: 'Bolsas recogecacas biodegradables', categoria: 'higiene', tipoMascota: 'perro', prioridad: 'esencial' },

  // Descanso
  { id: 'p20', nombre: 'Cama/colchoneta cómoda', categoria: 'descanso', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p21', nombre: 'Manta suave', categoria: 'descanso', tipoMascota: 'ambos', prioridad: 'recomendado' },
  { id: 'p22', nombre: 'Transportín/jaula', categoria: 'descanso', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p23', nombre: 'Caseta/cueva para gatos', categoria: 'descanso', tipoMascota: 'gato', prioridad: 'recomendado' },
  { id: 'p24', nombre: 'Parque/corralito (cachorros)', categoria: 'descanso', tipoMascota: 'perro', prioridad: 'opcional' },

  // Paseo (principalmente perros)
  { id: 'p25', nombre: 'Collar ajustable', categoria: 'paseo', tipoMascota: 'perro', prioridad: 'esencial' },
  { id: 'p26', nombre: 'Arnés anti-tirones', categoria: 'paseo', tipoMascota: 'perro', prioridad: 'esencial' },
  { id: 'p27', nombre: 'Correa (fija, no extensible al principio)', categoria: 'paseo', tipoMascota: 'perro', prioridad: 'esencial' },
  { id: 'p28', nombre: 'Placa identificativa con teléfono', categoria: 'paseo', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p29', nombre: 'Luz LED para paseos nocturnos', categoria: 'paseo', tipoMascota: 'perro', prioridad: 'recomendado' },
  { id: 'p30', nombre: 'Bebedero portátil', categoria: 'paseo', tipoMascota: 'perro', prioridad: 'recomendado' },
  { id: 'p31', nombre: 'Arnés y correa para gato (opcional)', categoria: 'paseo', tipoMascota: 'gato', prioridad: 'opcional' },

  // Juguetes
  { id: 'p32', nombre: 'Mordedores (alivio dentición)', categoria: 'juguetes', tipoMascota: 'perro', prioridad: 'esencial' },
  { id: 'p33', nombre: 'Pelota resistente', categoria: 'juguetes', tipoMascota: 'perro', prioridad: 'esencial' },
  { id: 'p34', nombre: 'Cuerda para tirar', categoria: 'juguetes', tipoMascota: 'perro', prioridad: 'recomendado' },
  { id: 'p35', nombre: 'Juguete Kong o similar (rellenable)', categoria: 'juguetes', tipoMascota: 'perro', prioridad: 'recomendado' },
  { id: 'p36', nombre: 'Rascador vertical', categoria: 'juguetes', tipoMascota: 'gato', prioridad: 'esencial' },
  { id: 'p37', nombre: 'Caña con plumas/juguete', categoria: 'juguetes', tipoMascota: 'gato', prioridad: 'esencial' },
  { id: 'p38', nombre: 'Ratones de juguete', categoria: 'juguetes', tipoMascota: 'gato', prioridad: 'recomendado' },
  { id: 'p39', nombre: 'Túnel/circuito para gatos', categoria: 'juguetes', tipoMascota: 'gato', prioridad: 'opcional' },
  { id: 'p40', nombre: 'Árbol rascador multinivel', categoria: 'juguetes', tipoMascota: 'gato', prioridad: 'recomendado' },

  // Salud
  { id: 'p41', nombre: 'Botiquín básico (gasas, suero, pinzas)', categoria: 'salud', tipoMascota: 'ambos', prioridad: 'recomendado' },
  { id: 'p42', nombre: 'Pipeta antiparasitaria', categoria: 'salud', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p43', nombre: 'Collar antiparasitario', categoria: 'salud', tipoMascota: 'ambos', prioridad: 'opcional' },
  { id: 'p44', nombre: 'Pasta de malta (bolas de pelo)', categoria: 'salud', tipoMascota: 'gato', prioridad: 'recomendado' },

  // Identificación
  { id: 'p45', nombre: 'Microchip (veterinario)', categoria: 'identificacion', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p46', nombre: 'Cartilla sanitaria', categoria: 'identificacion', tipoMascota: 'ambos', prioridad: 'esencial' },
  { id: 'p47', nombre: 'Seguro de responsabilidad civil', categoria: 'identificacion', tipoMascota: 'perro', prioridad: 'esencial' },
  { id: 'p48', nombre: 'Licencia municipal (según raza/localidad)', categoria: 'identificacion', tipoMascota: 'perro', prioridad: 'recomendado' },
];

// Calendario de vacunación
const calendarioVacunas: Vacuna[] = [
  // Vacunas perros
  { nombre: 'Parvovirosis + Moquillo', edad: '6-8 semanas', descripcion: 'Primera dosis de vacuna polivalente', tipoMascota: 'perro', obligatoria: true },
  { nombre: 'Polivalente (refuerzo)', edad: '10-12 semanas', descripcion: 'Segunda dosis: parvovirus, moquillo, hepatitis, leptospirosis', tipoMascota: 'perro', obligatoria: true },
  { nombre: 'Polivalente (3ª dosis)', edad: '14-16 semanas', descripcion: 'Tercera dosis para completar inmunidad', tipoMascota: 'perro', obligatoria: true },
  { nombre: 'Rabia', edad: '4-6 meses', descripcion: 'Obligatoria en la mayoría de CCAA de España', tipoMascota: 'perro', obligatoria: true },
  { nombre: 'Tos de las perreras', edad: '4+ meses', descripcion: 'Recomendada si va a guarderías/residencias', tipoMascota: 'perro', obligatoria: false },
  { nombre: 'Leishmaniosis', edad: '6+ meses', descripcion: 'Muy recomendada en zonas endémicas (centro/sur España)', tipoMascota: 'perro', obligatoria: false },
  { nombre: 'Refuerzo polivalente anual', edad: 'Cada año', descripcion: 'Mantiene la inmunidad activa', tipoMascota: 'perro', obligatoria: true },
  { nombre: 'Rabia (refuerzo)', edad: 'Cada 1-3 años', descripcion: 'Según legislación de cada comunidad', tipoMascota: 'perro', obligatoria: true },

  // Vacunas gatos
  { nombre: 'Trivalente felina', edad: '8-9 semanas', descripcion: 'Panleucopenia, rinotraqueitis, calicivirus', tipoMascota: 'gato', obligatoria: true },
  { nombre: 'Trivalente (refuerzo)', edad: '12 semanas', descripcion: 'Segunda dosis para completar inmunidad', tipoMascota: 'gato', obligatoria: true },
  { nombre: 'Trivalente (3ª dosis)', edad: '16 semanas', descripcion: 'Tercera dosis opcional según veterinario', tipoMascota: 'gato', obligatoria: false },
  { nombre: 'Leucemia felina (FeLV)', edad: '9+ semanas', descripcion: 'Muy recomendada para gatos que salen al exterior', tipoMascota: 'gato', obligatoria: false },
  { nombre: 'Rabia', edad: '4+ meses', descripcion: 'Obligatoria solo en algunas CCAA y para viajar', tipoMascota: 'gato', obligatoria: false },
  { nombre: 'Refuerzo trivalente anual', edad: 'Cada año', descripcion: 'Mantiene protección frente a virus comunes', tipoMascota: 'gato', obligatoria: true },
];

const nombresEtapa: Record<EtapaType, string> = {
  llegada: 'Llegada',
  primeros_meses: 'Primeros meses',
  juvenil: 'Juvenil (4-12m)',
  adulto: 'Rutina anual',
};

const emojisEtapa: Record<EtapaType, string> = {
  llegada: '🏠',
  primeros_meses: '🐾',
  juvenil: '🎓',
  adulto: '📅',
};

const nombresCategoriaCompra: Record<CategoriaCompra, string> = {
  alimentacion: '🍖 Alimentación',
  higiene: '🧴 Higiene',
  descanso: '🛏️ Descanso',
  paseo: '🦮 Paseo',
  juguetes: '🎾 Juguetes',
  salud: '💊 Salud',
  identificacion: '🏷️ Identificación',
};

const perfilInicial: PerfilMascota = {
  nombre: '',
  tipo: 'perro',
  raza: '',
  fechaNacimiento: '',
  fechaLlegada: '',
  peso: '',
  tamano: 'mediano',
  esterilizado: false,
  chip: false,
};

export default function PlanificadorMascotaPage() {
  const [tabActiva, setTabActiva] = useState<TabType>('perfil');

  // Estado Perfil
  const [perfil, setPerfil] = useState<PerfilMascota>(perfilInicial);

  // Estado Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filtroEtapa, setFiltroEtapa] = useState<EtapaType | 'todos'>('todos');

  // Estado Compras
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaCompra | 'todos'>('todos');
  const [mostrarSoloSinComprar, setMostrarSoloSinComprar] = useState(false);

  // Cargar datos de localStorage
  useEffect(() => {
    const savedPerfil = localStorage.getItem('meskeia-mascota-perfil');
    const savedChecklist = localStorage.getItem('meskeia-mascota-checklist');
    const savedCompras = localStorage.getItem('meskeia-mascota-compras');

    if (savedPerfil) {
      setPerfil(JSON.parse(savedPerfil));
    }

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
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (perfil.nombre || perfil.raza || perfil.fechaNacimiento) {
      localStorage.setItem('meskeia-mascota-perfil', JSON.stringify(perfil));
    }
  }, [perfil]);

  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem('meskeia-mascota-checklist', JSON.stringify(checklist));
    }
  }, [checklist]);

  useEffect(() => {
    if (compras.length > 0) {
      localStorage.setItem('meskeia-mascota-compras', JSON.stringify(compras));
    }
  }, [compras]);

  // Funciones Perfil
  const calcularEdad = (): string => {
    if (!perfil.fechaNacimiento) return '';
    const nacimiento = new Date(perfil.fechaNacimiento);
    const hoy = new Date();
    const diffMs = hoy.getTime() - nacimiento.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return 'Fecha futura';
    if (diffDias < 30) return `${diffDias} días`;
    if (diffDias < 365) {
      const meses = Math.floor(diffDias / 30);
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    const anos = Math.floor(diffDias / 365);
    const mesesRestantes = Math.floor((diffDias % 365) / 30);
    if (mesesRestantes === 0) return `${anos} ${anos === 1 ? 'año' : 'años'}`;
    return `${anos} ${anos === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
  };

  const calcularDiasEnCasa = (): string => {
    if (!perfil.fechaLlegada) return '';
    const llegada = new Date(perfil.fechaLlegada);
    const hoy = new Date();
    const diffDias = Math.floor((hoy.getTime() - llegada.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return 'Próximamente';
    if (diffDias === 0) return '¡Hoy!';
    if (diffDias === 1) return '1 día';
    return `${diffDias} días`;
  };

  // Funciones Checklist
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, completado: !item.completado } : item
    ));
  };

  const getChecklistFiltrado = () => {
    let filtered = checklist.filter(item =>
      item.tipoMascota === 'ambos' || item.tipoMascota === perfil.tipo
    );
    if (filtroEtapa !== 'todos') {
      filtered = filtered.filter(item => item.etapa === filtroEtapa);
    }
    return filtered;
  };

  const getProgresoChecklist = () => {
    const relevantes = checklist.filter(item =>
      item.tipoMascota === 'ambos' || item.tipoMascota === perfil.tipo
    );
    const total = relevantes.length;
    const completados = relevantes.filter(item => item.completado).length;
    return { total, completados, porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0 };
  };

  // Funciones Compras
  const toggleCompraItem = (id: string) => {
    setCompras(prev => prev.map(item =>
      item.id === id ? { ...item, comprado: !item.comprado } : item
    ));
  };

  const getComprasFiltradas = () => {
    let filtered = compras.filter(item =>
      item.tipoMascota === 'ambos' || item.tipoMascota === perfil.tipo
    );
    if (filtroCategoria !== 'todos') {
      filtered = filtered.filter(item => item.categoria === filtroCategoria);
    }
    if (mostrarSoloSinComprar) {
      filtered = filtered.filter(item => !item.comprado);
    }
    return filtered;
  };

  const getProgresoCompras = () => {
    const relevantes = compras.filter(item =>
      item.tipoMascota === 'ambos' || item.tipoMascota === perfil.tipo
    );
    const total = relevantes.length;
    const comprados = relevantes.filter(item => item.comprado).length;
    return { total, comprados, porcentaje: total > 0 ? Math.round((comprados / total) * 100) : 0 };
  };

  const getPrioridadClass = (prioridad: string) => {
    switch (prioridad) {
      case 'esencial': return styles.esencial;
      case 'recomendado': return styles.recomendado;
      case 'opcional': return styles.opcional;
      default: return '';
    }
  };

  // Funciones Vacunas
  const getVacunasFiltradas = () => {
    return calendarioVacunas.filter(v =>
      v.tipoMascota === 'ambos' || v.tipoMascota === perfil.tipo
    );
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

  const resetPerfil = () => {
    if (confirm('¿Borrar el perfil de tu mascota?')) {
      setPerfil(perfilInicial);
      localStorage.removeItem('meskeia-mascota-perfil');
    }
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🐾 Planificador de Mascota</h1>
        <p className={styles.subtitle}>
          Organiza la llegada de tu cachorro o gatito: checklist, compras y vacunas
        </p>
      </header>

      {/* Navegación de Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tabActiva === 'perfil' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('perfil')}
        >
          {perfil.tipo === 'gato' ? '🐱' : '🐕'} Perfil
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

      {/* Tab: Perfil */}
      {tabActiva === 'perfil' && (
        <div className={styles.mainContent}>
          <div className={styles.inputPanel}>
            <h2 className={styles.panelTitle}>📋 Datos de tu mascota</h2>

            {/* Selector tipo mascota */}
            <div className={styles.mascotaSelector}>
              <button
                className={`${styles.mascotaBtn} ${perfil.tipo === 'perro' ? styles.active : ''}`}
                onClick={() => setPerfil(prev => ({ ...prev, tipo: 'perro' }))}
              >
                🐕 Perro
              </button>
              <button
                className={`${styles.mascotaBtn} ${perfil.tipo === 'gato' ? styles.active : ''}`}
                onClick={() => setPerfil(prev => ({ ...prev, tipo: 'gato' }))}
              >
                🐱 Gato
              </button>
            </div>

            <div className={styles.inputGroup}>
              <label>Nombre</label>
              <input
                type="text"
                value={perfil.nombre}
                onChange={(e) => setPerfil(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder={perfil.tipo === 'perro' ? 'Ej: Max, Luna...' : 'Ej: Michi, Nala...'}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Raza (opcional)</label>
              <input
                type="text"
                value={perfil.raza}
                onChange={(e) => setPerfil(prev => ({ ...prev, raza: e.target.value }))}
                placeholder={perfil.tipo === 'perro' ? 'Ej: Labrador, Mestizo...' : 'Ej: Europeo común, Siamés...'}
                className={styles.input}
              />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Fecha de nacimiento</label>
                <input
                  type="date"
                  value={perfil.fechaNacimiento}
                  onChange={(e) => setPerfil(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                  max={hoy}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Fecha de llegada a casa</label>
                <input
                  type="date"
                  value={perfil.fechaLlegada}
                  onChange={(e) => setPerfil(prev => ({ ...prev, fechaLlegada: e.target.value }))}
                  className={styles.input}
                />
              </div>
            </div>

            {perfil.tipo === 'perro' && (
              <div className={styles.inputGroup}>
                <label>Tamaño esperado de adulto</label>
                <div className={styles.tamanoGrid}>
                  {(['pequeno', 'mediano', 'grande', 'gigante'] as TamanoPerro[]).map(tam => (
                    <button
                      key={tam}
                      className={`${styles.tamanoBtn} ${perfil.tamano === tam ? styles.active : ''}`}
                      onClick={() => setPerfil(prev => ({ ...prev, tamano: tam }))}
                    >
                      <span className={styles.tamanoNombre}>
                        {tam === 'pequeno' ? 'Pequeño' : tam === 'mediano' ? 'Mediano' : tam === 'grande' ? 'Grande' : 'Gigante'}
                      </span>
                      <span className={styles.tamanoPeso}>
                        {tam === 'pequeno' ? '<10kg' : tam === 'mediano' ? '10-25kg' : tam === 'grande' ? '25-45kg' : '>45kg'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Peso actual (kg)</label>
                <input
                  type="text"
                  value={perfil.peso}
                  onChange={(e) => setPerfil(prev => ({ ...prev, peso: e.target.value }))}
                  placeholder="Ej: 4,5"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={perfil.chip}
                  onChange={(e) => setPerfil(prev => ({ ...prev, chip: e.target.checked }))}
                />
                Tiene microchip
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={perfil.esterilizado}
                  onChange={(e) => setPerfil(prev => ({ ...prev, esterilizado: e.target.checked }))}
                />
                Está esterilizado/a
              </label>
            </div>

            <button onClick={resetPerfil} className={styles.btnSecondary}>
              🗑️ Borrar perfil
            </button>
          </div>

          <div className={styles.resultsPanel}>
            {perfil.nombre ? (
              <>
                <div className={styles.perfilCard}>
                  <div className={styles.perfilAvatar}>
                    {perfil.tipo === 'perro' ? '🐕' : '🐱'}
                  </div>
                  <h3 className={styles.perfilNombre}>{perfil.nombre}</h3>
                  {perfil.raza && <p className={styles.perfilRaza}>{perfil.raza}</p>}
                </div>

                <div className={styles.perfilStats}>
                  {calcularEdad() && (
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>🎂</span>
                      <div>
                        <span className={styles.statLabel}>Edad</span>
                        <span className={styles.statValue}>{calcularEdad()}</span>
                      </div>
                    </div>
                  )}
                  {calcularDiasEnCasa() && (
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>🏠</span>
                      <div>
                        <span className={styles.statLabel}>En casa</span>
                        <span className={styles.statValue}>{calcularDiasEnCasa()}</span>
                      </div>
                    </div>
                  )}
                  {perfil.peso && (
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>⚖️</span>
                      <div>
                        <span className={styles.statLabel}>Peso</span>
                        <span className={styles.statValue}>{perfil.peso} kg</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.perfilBadges}>
                  {perfil.chip && <span className={styles.badge}>✓ Microchip</span>}
                  {perfil.esterilizado && <span className={styles.badge}>✓ Esterilizado</span>}
                  {perfil.tipo === 'perro' && (
                    <span className={styles.badge}>
                      {perfil.tamano === 'pequeno' ? '🐕 Pequeño' :
                       perfil.tamano === 'mediano' ? '🐕 Mediano' :
                       perfil.tamano === 'grande' ? '🐕 Grande' : '🐕 Gigante'}
                    </span>
                  )}
                </div>

                <div className={styles.resumenProgreso}>
                  <h4>📊 Tu progreso</h4>
                  <div className={styles.progresoItem}>
                    <span>Checklist</span>
                    <div className={styles.progresoBarMini}>
                      <div className={styles.progresoFillMini} style={{ width: `${getProgresoChecklist().porcentaje}%` }} />
                    </div>
                    <span>{getProgresoChecklist().porcentaje}%</span>
                  </div>
                  <div className={styles.progresoItem}>
                    <span>Compras</span>
                    <div className={styles.progresoBarMini}>
                      <div className={styles.progresoFillMini} style={{ width: `${getProgresoCompras().porcentaje}%` }} />
                    </div>
                    <span>{getProgresoCompras().porcentaje}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.placeholderIcon}>🐾</span>
                <p>Introduce los datos de tu mascota</p>
                <p className={styles.placeholderHint}>El checklist y las compras se filtrarán según el tipo de mascota</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Checklist */}
      {tabActiva === 'checklist' && (
        <div className={styles.checklistContainer}>
          <div className={styles.checklistHeader}>
            <h2 className={styles.panelTitle}>
              ✅ Checklist {perfil.tipo === 'gato' ? 'del Gatito' : 'del Cachorro'}
            </h2>
            <div className={styles.progresoCompacto}>
              <span>{getProgresoChecklist().completados} de {getProgresoChecklist().total}</span>
              <div className={styles.progresoBarMini}>
                <div className={styles.progresoFillMini} style={{ width: `${getProgresoChecklist().porcentaje}%` }} />
              </div>
              <span className={styles.porcentaje}>{getProgresoChecklist().porcentaje}%</span>
            </div>
          </div>

          <div className={styles.filtros}>
            <button
              className={`${styles.filtroBtn} ${filtroEtapa === 'todos' ? styles.activo : ''}`}
              onClick={() => setFiltroEtapa('todos')}
            >
              Todas
            </button>
            {(['llegada', 'primeros_meses', 'juvenil', 'adulto'] as EtapaType[]).map(etapa => (
              <button
                key={etapa}
                className={`${styles.filtroBtn} ${filtroEtapa === etapa ? styles.activo : ''}`}
                onClick={() => setFiltroEtapa(etapa)}
              >
                {emojisEtapa[etapa]} {nombresEtapa[etapa]}
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
                <span className={styles.etapaBadge}>
                  {emojisEtapa[item.etapa]} {nombresEtapa[item.etapa]}
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
            <h2 className={styles.panelTitle}>
              🛒 Lista de Compras {perfil.tipo === 'gato' ? 'para Gato' : 'para Perro'}
            </h2>
            <div className={styles.progresoCompacto}>
              <span>{getProgresoCompras().comprados} de {getProgresoCompras().total}</span>
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
          <h2 className={styles.panelTitle}>
            💉 Calendario de Vacunación {perfil.tipo === 'gato' ? 'Felina' : 'Canina'} (España)
          </h2>

          <div className={styles.vacunasInfo}>
            <p>
              Calendario orientativo de vacunación para {perfil.tipo === 'gato' ? 'gatos' : 'perros'} en España.
              Tu veterinario adaptará el calendario según las necesidades específicas de tu mascota.
            </p>
          </div>

          <div className={styles.vacunasList}>
            {getVacunasFiltradas().map((vacuna, index) => (
              <div key={index} className={`${styles.vacunaItem} ${vacuna.obligatoria ? styles.vacunaObligatoria : ''}`}>
                <div className={styles.vacunaEdad}>{vacuna.edad}</div>
                <div className={styles.vacunaInfo}>
                  <div className={styles.vacunaNombre}>
                    <strong>{vacuna.nombre}</strong>
                    {vacuna.obligatoria && <span className={styles.badgeObligatoria}>Obligatoria</span>}
                  </div>
                  <span>{vacuna.descripcion}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.vacunasNota}>
            <h4>📝 Notas importantes:</h4>
            <ul>
              <li>La vacuna antirrábica es obligatoria para perros en la mayoría de comunidades autónomas</li>
              <li>Consulta con tu veterinario las vacunas opcionales según el estilo de vida de tu mascota</li>
              <li>Mantén siempre actualizada la cartilla de vacunación</li>
              <li>Desparasita internamente cada 3 meses y externamente según el producto usado</li>
              {perfil.tipo === 'perro' && (
                <li>En zonas de leishmaniosis (centro y sur de España), la vacuna es muy recomendable</li>
              )}
            </ul>
          </div>

          <div className={styles.enlaceRelacionado}>
            <p>🐾 <strong>¿Quieres saber la edad de tu mascota en años humanos?</strong>{' '}
              <a href="/calculadora-edad-mascotas/">Calculadora de Edad de Mascotas</a>
            </p>
          </div>
        </div>
      )}

      {/* DISCLAIMER - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta herramienta proporciona información <strong>orientativa y educativa</strong> basada en
          recomendaciones generales para el cuidado de mascotas en España.
        </p>
        <p>
          <strong>No sustituye el consejo de un veterinario profesional.</strong> Cada animal es único
          y puede tener necesidades específicas. Consulta siempre con tu veterinario para un plan de
          cuidados personalizado.
        </p>
      </div>

      {/* Contenido Educativo Colapsable */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre el cuidado de tu mascota?"
        subtitle="Consejos, errores comunes a evitar y preguntas frecuentes"
      >
        <section className={styles.guideSection}>
          <h2>🏠 Preparar la Llegada de tu Mascota</h2>

          <div className={styles.consejosGrid}>
            <div className={styles.consejoCard}>
              <h4>🐕 Si es un Cachorro</h4>
              <ul>
                <li>Prepara una zona segura y tranquila para sus primeros días</li>
                <li>Retira objetos pequeños que pueda tragar</li>
                <li>Esconde cables eléctricos y productos tóxicos</li>
                <li>Ten empapadores listos para los primeros accidentes</li>
                <li>Establece desde el primer día dónde dormirá</li>
              </ul>
            </div>

            <div className={styles.consejoCard}>
              <h4>🐱 Si es un Gatito</h4>
              <ul>
                <li>Prepara una habitación pequeña para los primeros días</li>
                <li>Coloca el arenero lejos de la comida y agua</li>
                <li>Asegura ventanas y balcones con redes</li>
                <li>Instala un rascador desde el primer día</li>
                <li>Proporciona escondites en altura</li>
              </ul>
            </div>

            <div className={styles.consejoCard}>
              <h4>🍖 Alimentación</h4>
              <ul>
                <li>Mantén el mismo pienso que comía antes (cambios graduales)</li>
                <li>Cachorros: 3-4 comidas al día hasta los 4 meses</li>
                <li>De 4-12 meses: 2-3 comidas al día</li>
                <li>Agua fresca siempre disponible</li>
                <li>Evita dar comida humana (especialmente tóxicos)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>❌ Errores Comunes a Evitar</h2>

          <div className={styles.erroresGrid}>
            <div className={styles.errorCard}>
              <strong>❌ Bañarle demasiado pronto</strong>
              <p>Espera al menos 1-2 semanas tras la llegada y asegúrate de que tenga las vacunas al día. Los cachorros no regulan bien la temperatura.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Sacarlo a la calle sin vacunas</strong>
              <p>No lo expongas a otros perros ni a zonas de paseo hasta completar el calendario de vacunación inicial (16 semanas aprox.).</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Castigar los accidentes</strong>
              <p>Nunca le riñas por hacer sus necesidades donde no debe. Limpia con productos enzimáticos y refuerza positivamente cuando lo haga bien.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Sobrealimentar</strong>
              <p>Sigue las indicaciones del pienso según peso y edad. La obesidad causa problemas graves de salud.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ No socializar a tiempo</strong>
              <p>El período de socialización (3-12 semanas) es crucial. Expón gradualmente a diferentes personas, sonidos y situaciones.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Humanizar en exceso</strong>
              <p>Trátalo como lo que es: un animal con necesidades específicas. Evita la ropa innecesaria y el exceso de mimos que generen dependencia.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Ignorar señales de enfermedad</strong>
              <p>Vómitos repetidos, diarrea, apatía, falta de apetito... Ante la duda, consulta al veterinario. En cachorros todo es más urgente.</p>
            </div>
            <div className={styles.errorCard}>
              <strong>❌ Usar collares extensibles al principio</strong>
              <p>Para enseñar a pasear, usa correa fija corta. Los extensibles no permiten control y enseñan a tirar.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>🚫 Alimentos Tóxicos para Mascotas</h2>

          <div className={styles.toxicosGrid}>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>🍫</span>
              <strong>Chocolate</strong>
              <p>Contiene teobromina, tóxico especialmente para perros</p>
            </div>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>🧅</span>
              <strong>Cebolla y ajo</strong>
              <p>Dañan los glóbulos rojos, causando anemia</p>
            </div>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>🍇</span>
              <strong>Uvas y pasas</strong>
              <p>Pueden causar insuficiencia renal aguda</p>
            </div>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>🥑</span>
              <strong>Aguacate</strong>
              <p>La persina es tóxica para perros y gatos</p>
            </div>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>☕</span>
              <strong>Cafeína</strong>
              <p>Café, té, bebidas energéticas... Muy peligrosos</p>
            </div>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>🦴</span>
              <strong>Huesos cocidos</strong>
              <p>Se astillan y pueden perforar el intestino</p>
            </div>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>🍬</span>
              <strong>Xilitol</strong>
              <p>Edulcorante presente en chicles, muy tóxico</p>
            </div>
            <div className={styles.toxicoCard}>
              <span className={styles.toxicoEmoji}>🥛</span>
              <strong>Lácteos</strong>
              <p>Muchos son intolerantes a la lactosa</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes</h2>

          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿A qué edad puedo adoptar un cachorro/gatito?</summary>
              <p>Lo ideal es a partir de las 8 semanas, cuando ya han sido destetados correctamente y han
              aprendido habilidades sociales básicas de su madre y hermanos. Nunca antes de las 6 semanas.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuándo debo esterilizar a mi mascota?</summary>
              <p>En perros, generalmente entre 6-12 meses según tamaño y raza. En gatos, a partir de los 4-6 meses.
              Consulta con tu veterinario para el momento óptimo según tu caso.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Es obligatorio el microchip?</summary>
              <p>Sí, en España es obligatorio para perros en todas las comunidades autónomas. Para gatos es
              obligatorio en algunas comunidades y muy recomendable en todas.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cada cuánto debo desparasitar?</summary>
              <p>Desparasitación interna (pastillas): cada 3 meses en adultos, mensual en cachorros hasta los 6 meses.
              Desparasitación externa (pipetas/collares): mensual o según duración del producto.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo sacar a mi cachorro antes de completar las vacunas?</summary>
              <p>No es recomendable exponerlo a zonas de paso de otros perros. Puedes sacarlo en brazos para
              socialización, pero no lo dejes en el suelo ni en contacto con perros desconocidos hasta las 16 semanas.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuánto ejercicio necesita mi perro?</summary>
              <p>Depende de la raza y edad. Los cachorros necesitan paseos cortos y frecuentes (5 min por mes de edad, 2-3 veces al día).
              Adultos: desde 30 min hasta 2+ horas según la raza.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Los gatos necesitan salir de casa?</summary>
              <p>No es necesario. Un gato de interior bien estimulado (juegos, rascadores, ventanas) puede vivir perfectamente
              feliz y suele tener mayor esperanza de vida que uno de exterior.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Necesito seguro para mi mascota?</summary>
              <p>En perros, el seguro de responsabilidad civil es obligatorio para razas PPP y muy recomendable para todos.
              El seguro de salud es opcional pero puede ahorrar mucho en imprevistos veterinarios.</p>
            </details>
          </div>
        </section>
      </EducationalSection>

      {/* Apps relacionadas */}
      <div className={styles.appsRelacionadas}>
        <h3>🐾 Más herramientas para tu mascota</h3>
        <div className={styles.appsGrid}>
          <a href="/calculadora-alimentacion-mascotas/" className={styles.appCard}>
            <span className={styles.appIcon}>🍖</span>
            <span className={styles.appName}>Calculadora de Alimentación</span>
            <span className={styles.appDesc}>Cuánto debe comer tu mascota</span>
          </a>
          <a href="/calculadora-medicamentos-mascotas/" className={styles.appCard}>
            <span className={styles.appIcon}>💊</span>
            <span className={styles.appName}>Calculadora de Medicamentos</span>
            <span className={styles.appDesc}>Dosis de antiparasitarios</span>
          </a>
          <a href="/calculadora-tamano-adulto-perro/" className={styles.appCard}>
            <span className={styles.appIcon}>📏</span>
            <span className={styles.appName}>Tamaño Adulto Cachorro</span>
            <span className={styles.appDesc}>Predice cuánto pesará de adulto</span>
          </a>
          <a href="/calculadora-edad-mascotas/" className={styles.appCard}>
            <span className={styles.appIcon}>🎂</span>
            <span className={styles.appName}>Calculadora de Edad</span>
            <span className={styles.appDesc}>Edad en años humanos</span>
          </a>
        </div>
      </div>

      <Footer appName="planificador-mascota" />
    </div>
  );
}
