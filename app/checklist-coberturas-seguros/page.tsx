'use client';

import { useState } from 'react';
import styles from './ChecklistCoberturasSeguro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type PerfilType = 'joven-soltero' | 'pareja-sin-hijos' | 'familia-hijos' | 'autonomo' | 'jubilado' | 'propietario-alquila';

interface Cobertura {
  nombre: string;
  tipo: 'obligatorio' | 'muy-recomendable' | 'recomendable' | 'opcional';
  descripcion: string;
  porQue: string;
}

interface Perfil {
  id: PerfilType;
  nombre: string;
  icon: string;
  descripcion: string;
  coberturas: Cobertura[];
}

const perfiles: Perfil[] = [
  {
    id: 'joven-soltero',
    nombre: 'Joven Soltero/a',
    icon: '🧑',
    descripcion: 'Sin cargas familiares, posiblemente en alquiler o viviendo con familia',
    coberturas: [
      { nombre: 'Seguro de Coche (si tienes vehículo)', tipo: 'obligatorio', descripcion: 'Responsabilidad civil obligatoria por ley', porQue: 'Es ilegal circular sin seguro. Multas de 601€ a 3.005€.' },
      { nombre: 'Seguro de Moto (si tienes)', tipo: 'obligatorio', descripcion: 'RC obligatoria también para motos', porQue: 'Mismo requisito legal que los coches.' },
      { nombre: 'Seguro de Salud', tipo: 'recomendable', descripcion: 'Acceso rápido a especialistas sin esperas', porQue: 'A esta edad eres sano, pero las primas son muy bajas. Buen momento para contratar.' },
      { nombre: 'Seguro de Viaje', tipo: 'recomendable', descripcion: 'Cobertura médica y cancelaciones en viajes', porQue: 'Si viajas al extranjero, la sanidad puede ser carísima (ej: EEUU).' },
      { nombre: 'Seguro de Responsabilidad Civil', tipo: 'opcional', descripcion: 'Daños que puedas causar a terceros', porQue: 'Barato y te cubre si causas daños accidentalmente (bici, mascota, etc.).' },
      { nombre: 'Seguro de Vida', tipo: 'opcional', descripcion: 'Solo si tienes deudas o alguien depende de ti', porQue: 'Sin cargas familiares ni deudas, no es prioritario.' },
    ],
  },
  {
    id: 'pareja-sin-hijos',
    nombre: 'Pareja sin Hijos',
    icon: '👫',
    descripcion: 'Convivencia en pareja, posiblemente con hipoteca o alquiler compartido',
    coberturas: [
      { nombre: 'Seguro de Coche', tipo: 'obligatorio', descripcion: 'RC obligatoria si tenéis vehículo', porQue: 'Requisito legal para circular.' },
      { nombre: 'Seguro de Hogar', tipo: 'muy-recomendable', descripcion: 'Multirriesgo si sois propietarios, contenido si alquiler', porQue: 'Protege vuestra inversión y pertenencias. Obligatorio con hipoteca.' },
      { nombre: 'Seguro de Vida', tipo: 'recomendable', descripcion: 'Especialmente si tenéis hipoteca compartida', porQue: 'Si uno fallece, el otro podría no poder pagar la hipoteca solo.' },
      { nombre: 'Seguro de Salud', tipo: 'recomendable', descripcion: 'Póliza de pareja con descuento', porQue: 'Acceso rápido a médicos. Las pólizas de pareja tienen descuentos.' },
      { nombre: 'Seguro de Decesos', tipo: 'opcional', descripcion: 'Cubre gastos funerarios', porQue: 'Evita que la pareja tenga que afrontar gastos inesperados.' },
      { nombre: 'Seguro de Mascotas', tipo: 'opcional', descripcion: 'RC obligatoria para perros PPP', porQue: 'Si tenéis mascota, cubre veterinario y RC (obligatorio en razas peligrosas).' },
    ],
  },
  {
    id: 'familia-hijos',
    nombre: 'Familia con Hijos',
    icon: '👨‍👩‍👧‍👦',
    descripcion: 'Padres con hijos dependientes, vivienda en propiedad o alquiler',
    coberturas: [
      { nombre: 'Seguro de Coche', tipo: 'obligatorio', descripcion: 'RC obligatoria', porQue: 'Requisito legal. Con familia, considera Todo Riesgo para mayor protección.' },
      { nombre: 'Seguro de Hogar Multirriesgo', tipo: 'muy-recomendable', descripcion: 'Continente + contenido + RC familiar', porQue: 'La RC familiar cubre daños que causen los niños. Muy importante.' },
      { nombre: 'Seguro de Vida', tipo: 'muy-recomendable', descripcion: 'Capital para proteger a la familia', porQue: 'Si el sustentador principal fallece, la familia necesita mantener su nivel de vida.' },
      { nombre: 'Seguro de Salud Familiar', tipo: 'muy-recomendable', descripcion: 'Póliza que incluya a los hijos', porQue: 'Pediatra sin esperas, urgencias, hospitalización. Los niños enferman frecuentemente.' },
      { nombre: 'Seguro Escolar', tipo: 'recomendable', descripcion: 'Accidentes en el colegio', porQue: 'Cubre accidentes escolares. Muchos colegios lo exigen.' },
      { nombre: 'Seguro Dental Familiar', tipo: 'recomendable', descripcion: 'Revisiones, empastes, ortodoncia', porQue: 'La ortodoncia infantil es cara. El seguro ayuda mucho.' },
      { nombre: 'Seguro de Decesos', tipo: 'opcional', descripcion: 'Gestión y gastos funerarios', porQue: 'Evita que la familia tenga que gestionar trámites en un momento difícil.' },
    ],
  },
  {
    id: 'autonomo',
    nombre: 'Autónomo / Freelance',
    icon: '💼',
    descripcion: 'Trabajador por cuenta propia con ingresos variables',
    coberturas: [
      { nombre: 'Seguro de Responsabilidad Civil Profesional', tipo: 'muy-recomendable', descripcion: 'Errores profesionales que causen daños a clientes', porQue: 'Una demanda de un cliente puede arruinarte. Obligatorio en algunas profesiones.' },
      { nombre: 'Seguro de Salud', tipo: 'muy-recomendable', descripcion: 'No tienes baja laboral como un empleado', porQue: 'Si enfermas, no cobras. Acceso rápido a médicos para volver a trabajar pronto.' },
      { nombre: 'Seguro de Incapacidad Temporal', tipo: 'muy-recomendable', descripcion: 'Renta si no puedes trabajar temporalmente', porQue: 'La baja de autónomo es muy baja. Este seguro complementa tus ingresos.' },
      { nombre: 'Seguro de Vida', tipo: 'recomendable', descripcion: 'Si tienes familia o deudas del negocio', porQue: 'Protege a tu familia si tu negocio depende de ti.' },
      { nombre: 'Seguro de Coche (si usas para trabajo)', tipo: 'obligatorio', descripcion: 'RC obligatoria + uso profesional', porQue: 'Si usas el coche para trabajar, asegúrate de que la póliza lo cubra.' },
      { nombre: 'Seguro de Equipo Informático', tipo: 'recomendable', descripcion: 'Portátil, cámara, herramientas de trabajo', porQue: 'Si tu ordenador se rompe o te lo roban, afecta a tu negocio.' },
      { nombre: 'Seguro de Cyber-riesgos', tipo: 'opcional', descripcion: 'Ataques informáticos, pérdida de datos', porQue: 'Si manejas datos de clientes, una brecha puede costarte mucho.' },
    ],
  },
  {
    id: 'jubilado',
    nombre: 'Jubilado/a',
    icon: '👴',
    descripcion: 'Retirado/a con pensión, posiblemente vivienda en propiedad',
    coberturas: [
      { nombre: 'Seguro de Salud', tipo: 'muy-recomendable', descripcion: 'Acceso rápido a especialistas y pruebas', porQue: 'A partir de cierta edad, los problemas de salud aumentan. Evita esperas.' },
      { nombre: 'Seguro de Hogar', tipo: 'muy-recomendable', descripcion: 'Multirriesgo con asistencia 24h', porQue: 'La asistencia (fontanero, electricista) es muy útil. Incluye RC por caídas en casa.' },
      { nombre: 'Seguro de Decesos', tipo: 'recomendable', descripcion: 'Gestiona trámites y gastos', porQue: 'Evita que la familia tenga que gestionar todo. Gastos cubiertos.' },
      { nombre: 'Seguro de Dependencia', tipo: 'recomendable', descripcion: 'Renta si necesitas ayuda para actividades diarias', porQue: 'Si llegas a necesitar cuidados, este seguro paga una renta mensual.' },
      { nombre: 'Seguro de Vida', tipo: 'opcional', descripcion: 'Solo si quieres dejar herencia extra', porQue: 'A esta edad las primas son muy altas. Valora si compensa.' },
      { nombre: 'Seguro de Coche', tipo: 'obligatorio', descripcion: 'Si sigues conduciendo', porQue: 'Requisito legal. Las primas suben a partir de 70-75 años.' },
      { nombre: 'Seguro de Viaje', tipo: 'recomendable', descripcion: 'Para viajes del Imserso u otros', porQue: 'Cobertura médica en el extranjero. Importante por posibles problemas de salud.' },
    ],
  },
  {
    id: 'propietario-alquila',
    nombre: 'Propietario que Alquila',
    icon: '🏘️',
    descripcion: 'Tiene vivienda/s en alquiler como inversión',
    coberturas: [
      { nombre: 'Seguro de Impago de Alquiler', tipo: 'muy-recomendable', descripcion: 'Garantiza el cobro de rentas', porQue: 'Cubre 6-12 meses de impago + abogados para desahucio. Imprescindible.' },
      { nombre: 'Seguro de Hogar (Continente)', tipo: 'muy-recomendable', descripcion: 'Estructura del inmueble', porQue: 'Como propietario, eres responsable de la estructura. El inquilino asegura contenido.' },
      { nombre: 'Seguro de Responsabilidad Civil', tipo: 'muy-recomendable', descripcion: 'Daños a terceros por el inmueble', porQue: 'Si se cae una teja y daña algo, tú respondes como propietario.' },
      { nombre: 'Seguro de Defensa Jurídica', tipo: 'recomendable', descripcion: 'Abogados para conflictos con inquilinos', porQue: 'Puede incluirse en el de impago o contratarse aparte.' },
      { nombre: 'Seguro de Vandalismo', tipo: 'recomendable', descripcion: 'Daños intencionados del inquilino', porQue: 'Algunos inquilinos dejan el piso destrozado. Este seguro lo cubre.' },
      { nombre: 'Seguro de Comunidad', tipo: 'opcional', descripcion: 'Lo paga la comunidad de propietarios', porQue: 'Verifica que la comunidad tiene seguro. Si no, proponlo.' },
    ],
  },
];

const tipoColores: Record<string, { bg: string; text: string; label: string }> = {
  'obligatorio': { bg: '#fee2e2', text: '#dc2626', label: 'Obligatorio' },
  'muy-recomendable': { bg: '#fef3c7', text: '#d97706', label: 'Muy recomendable' },
  'recomendable': { bg: '#dbeafe', text: '#2563eb', label: 'Recomendable' },
  'opcional': { bg: '#f3f4f6', text: '#6b7280', label: 'Opcional' },
};

export default function ChecklistCoberturasSeguroPage() {
  const [perfilActivo, setPerfilActivo] = useState<PerfilType>('familia-hijos');
  const [coberturasSeleccionadas, setCoberturasSeleccionadas] = useState<Set<string>>(new Set());

  const perfilData = perfiles.find(p => p.id === perfilActivo)!;

  const toggleCobertura = (nombre: string) => {
    const nuevas = new Set(coberturasSeleccionadas);
    if (nuevas.has(nombre)) {
      nuevas.delete(nombre);
    } else {
      nuevas.add(nombre);
    }
    setCoberturasSeleccionadas(nuevas);
  };

  const cambiarPerfil = (id: PerfilType) => {
    setPerfilActivo(id);
    setCoberturasSeleccionadas(new Set());
  };

  const obligatorias = perfilData.coberturas.filter(c => c.tipo === 'obligatorio');
  const muyRecomendables = perfilData.coberturas.filter(c => c.tipo === 'muy-recomendable');
  const recomendables = perfilData.coberturas.filter(c => c.tipo === 'recomendable');
  const opcionales = perfilData.coberturas.filter(c => c.tipo === 'opcional');

  const totalCoberturas = perfilData.coberturas.length;
  const seleccionadas = coberturasSeleccionadas.size;
  const progreso = Math.round((seleccionadas / totalCoberturas) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>✅</span>
        <h1 className={styles.title}>Checklist de Coberturas de Seguros</h1>
        <p className={styles.subtitle}>
          Descubre qué seguros necesitas según tu perfil personal y familiar
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Selector de perfil */}
      <div className={styles.perfilSelector}>
        <h2 className={styles.selectorTitle}>Selecciona tu perfil</h2>
        <div className={styles.perfilGrid}>
          {perfiles.map((perfil) => (
            <button
              key={perfil.id}
              className={`${styles.perfilBtn} ${perfilActivo === perfil.id ? styles.perfilBtnActive : ''}`}
              onClick={() => cambiarPerfil(perfil.id)}
            >
              <span className={styles.perfilIcon}>{perfil.icon}</span>
              <span className={styles.perfilNombre}>{perfil.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info del perfil activo */}
      <div className={styles.perfilInfo}>
        <div className={styles.perfilHeader}>
          <span className={styles.perfilIconLarge}>{perfilData.icon}</span>
          <div>
            <h2 className={styles.perfilTitulo}>{perfilData.nombre}</h2>
            <p className={styles.perfilDesc}>{perfilData.descripcion}</p>
          </div>
        </div>
        <div className={styles.progresoBox}>
          <div className={styles.progresoLabel}>
            <span>Tu checklist</span>
            <span>{seleccionadas}/{totalCoberturas}</span>
          </div>
          <div className={styles.progresoBar}>
            <div className={styles.progresoFill} style={{ width: `${progreso}%` }} />
          </div>
        </div>
      </div>

      {/* Checklist por categorías */}
      <div className={styles.checklistContainer}>
        {obligatorias.length > 0 && (
          <div className={styles.categoriaSection}>
            <h3 className={styles.categoriaTitulo}>
              <span className={styles.categoriaIcon} style={{ background: tipoColores['obligatorio'].bg, color: tipoColores['obligatorio'].text }}>⚠️</span>
              Obligatorios por Ley
            </h3>
            <div className={styles.coberturasList}>
              {obligatorias.map((cob) => (
                <CoberturaItem
                  key={cob.nombre}
                  cobertura={cob}
                  seleccionada={coberturasSeleccionadas.has(cob.nombre)}
                  onToggle={() => toggleCobertura(cob.nombre)}
                />
              ))}
            </div>
          </div>
        )}

        {muyRecomendables.length > 0 && (
          <div className={styles.categoriaSection}>
            <h3 className={styles.categoriaTitulo}>
              <span className={styles.categoriaIcon} style={{ background: tipoColores['muy-recomendable'].bg, color: tipoColores['muy-recomendable'].text }}>⭐</span>
              Muy Recomendables
            </h3>
            <div className={styles.coberturasList}>
              {muyRecomendables.map((cob) => (
                <CoberturaItem
                  key={cob.nombre}
                  cobertura={cob}
                  seleccionada={coberturasSeleccionadas.has(cob.nombre)}
                  onToggle={() => toggleCobertura(cob.nombre)}
                />
              ))}
            </div>
          </div>
        )}

        {recomendables.length > 0 && (
          <div className={styles.categoriaSection}>
            <h3 className={styles.categoriaTitulo}>
              <span className={styles.categoriaIcon} style={{ background: tipoColores['recomendable'].bg, color: tipoColores['recomendable'].text }}>👍</span>
              Recomendables
            </h3>
            <div className={styles.coberturasList}>
              {recomendables.map((cob) => (
                <CoberturaItem
                  key={cob.nombre}
                  cobertura={cob}
                  seleccionada={coberturasSeleccionadas.has(cob.nombre)}
                  onToggle={() => toggleCobertura(cob.nombre)}
                />
              ))}
            </div>
          </div>
        )}

        {opcionales.length > 0 && (
          <div className={styles.categoriaSection}>
            <h3 className={styles.categoriaTitulo}>
              <span className={styles.categoriaIcon} style={{ background: tipoColores['opcional'].bg, color: tipoColores['opcional'].text }}>💭</span>
              Opcionales
            </h3>
            <div className={styles.coberturasList}>
              {opcionales.map((cob) => (
                <CoberturaItem
                  key={cob.nombre}
                  cobertura={cob}
                  seleccionada={coberturasSeleccionadas.has(cob.nombre)}
                  onToggle={() => toggleCobertura(cob.nombre)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className={styles.leyenda}>
        <h3>Leyenda</h3>
        <div className={styles.leyendaGrid}>
          {Object.entries(tipoColores).map(([tipo, colores]) => (
            <div key={tipo} className={styles.leyendaItem}>
              <span className={styles.leyendaBadge} style={{ background: colores.bg, color: colores.text }}>
                {colores.label}
              </span>
              <span className={styles.leyendaDesc}>
                {tipo === 'obligatorio' && 'Exigido por ley'}
                {tipo === 'muy-recomendable' && 'Altamente aconsejable'}
                {tipo === 'recomendable' && 'Buena idea tenerlo'}
                {tipo === 'opcional' && 'Según tu situación'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="financial"
        severity="medium"
        context="checklist-coberturas-seguros"
        collapsible={true}
      />

      

      <RelatedApps apps={getRelatedApps('checklist-coberturas-seguros')} />
      <ShareCard appName="checklist-coberturas-seguros" />
      <Footer appName="checklist-coberturas-seguros" />
    </div>
  );
}

// Componente para cada cobertura
function CoberturaItem({
  cobertura,
  seleccionada,
  onToggle
}: {
  cobertura: Cobertura;
  seleccionada: boolean;
  onToggle: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const colores = tipoColores[cobertura.tipo];

  return (
    <div className={`${styles.coberturaCard} ${seleccionada ? styles.coberturaCardSeleccionada : ''}`}>
      <div className={styles.coberturaHeader}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={seleccionada}
            onChange={onToggle}
            className={styles.checkbox}
          />
          <span className={styles.checkboxCustom}>
            {seleccionada && '✓'}
          </span>
          <span className={styles.coberturaNombre}>{cobertura.nombre}</span>
        </label>
        <div className={styles.coberturaRight}>
          <span
            className={styles.coberturaBadge}
            style={{ background: colores.bg, color: colores.text }}
          >
            {colores.label}
          </span>
          <button
            className={styles.expandBtn}
            onClick={() => setExpandido(!expandido)}
            aria-label={expandido ? 'Ocultar detalles' : 'Ver detalles'}
          >
            {expandido ? '−' : '+'}
          </button>
        </div>
      </div>

      <p className={styles.coberturaDesc}>{cobertura.descripcion}</p>

      {expandido && (
        <div className={styles.coberturaPorQue}>
          <strong>¿Por qué?</strong> {cobertura.porQue}
        </div>
      )}
    </div>
  );
}
