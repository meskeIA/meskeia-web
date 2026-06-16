'use client';

import { useState } from 'react';
import styles from './ChecklistCoberturasSeguro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
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
              type="button"
              className={`${styles.perfilBtn} ${perfilActivo === perfil.id ? styles.perfilBtnActive : ''}`}
              onClick={() => cambiarPerfil(perfil.id)}
              aria-pressed={perfilActivo === perfil.id}
            >
              <span className={styles.perfilIcon} aria-hidden="true">{perfil.icon}</span>
              <span className={styles.perfilNombre}>{perfil.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info del perfil activo */}
      <div className={styles.perfilInfo}>
        <div className={styles.perfilHeader}>
          <span className={styles.perfilIconLarge} aria-hidden="true">{perfilData.icon}</span>
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
              <span className={styles.categoriaIcon} style={{ background: tipoColores['obligatorio'].bg, color: tipoColores['obligatorio'].text }} aria-hidden="true">⚠️</span>
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
              <span className={styles.categoriaIcon} style={{ background: tipoColores['muy-recomendable'].bg, color: tipoColores['muy-recomendable'].text }} aria-hidden="true">⭐</span>
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
              <span className={styles.categoriaIcon} style={{ background: tipoColores['recomendable'].bg, color: tipoColores['recomendable'].text }} aria-hidden="true">👍</span>
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
              <span className={styles.categoriaIcon} style={{ background: tipoColores['opcional'].bg, color: tipoColores['opcional'].text }} aria-hidden="true">💭</span>
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
        severity="high"
        context="checklist-coberturas-seguros"
        collapsible={false}
      />

      <EducationalSection
        title="Guía completa de seguros en España"
        subtitle="Tipos de seguros, cómo compararlos y los errores más comunes al contratar"
      >
        {/* ====== SECCIÓN 1: TABLA COMPARATIVA ====== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Los 8 seguros principales: comparativa rápida</h2>
          <p className={styles.comparativaSubtitle}>
            Referencia orientativa de seguros en España. Los precios varían según edad, perfil y aseguradora.
          </p>
          <div className={styles.comparativaTableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de seguro</th>
                  <th>¿Obligatorio?</th>
                  <th>Precio anual orientativo</th>
                  <th>¿Para quién es prioritario?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Seguro de coche (RC)</td>
                  <td><span className={styles.badgeObl}>⚠️ Sí (RC)</span></td>
                  <td>300 – 800 €</td>
                  <td>Cualquier conductor</td>
                </tr>
                <tr>
                  <td>Seguro de hogar</td>
                  <td><span className={styles.badgeYes}>Con hipoteca</span></td>
                  <td>150 – 400 €</td>
                  <td>Propietarios e inquilinos</td>
                </tr>
                <tr>
                  <td>Seguro de vida</td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td>150 – 600 €</td>
                  <td>Padres con hijos, hipotecas</td>
                </tr>
                <tr>
                  <td>Seguro de salud</td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td>400 – 1.200 €</td>
                  <td>Todos (especialmente autónomos)</td>
                </tr>
                <tr>
                  <td>Seguro de decesos</td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td>50 – 150 €</td>
                  <td>Mayores de 50, familias</td>
                </tr>
                <tr>
                  <td>RC profesional</td>
                  <td><span className={styles.badgeYes}>En muchas profesiones</span></td>
                  <td>200 – 800 €</td>
                  <td>Autónomos, profesiones liberales</td>
                </tr>
                <tr>
                  <td>Seguro de dependencia</td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td>100 – 500 €</td>
                  <td>Mayores de 50 (mejor contratar joven)</td>
                </tr>
                <tr>
                  <td>Impago de alquiler</td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td>3 – 5% renta anual</td>
                  <td>Propietarios que alquilan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ====== SECCIÓN 2: CASOS DE USO ====== */}
        <section className={styles.casosSection}>
          <h2>💼 Situaciones reales: cuando el checklist marca la diferencia</h2>
          <div className={styles.casoGrid}>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>💼</span>
                <div>
                  <h3>María, 30 años — Freelance sin RC profesional</h3>
                  <span className={styles.casoTag}>Autónomo</span>
                </div>
              </div>
              <p>María diseña webs y nunca había contratado RC profesional. Un cliente le reclamó 8.000€ por un error en una entrega. Al revisar este checklist descubrió que le faltaba la cobertura más crítica para su perfil.</p>
              <p className={styles.casoResultado}><strong>Aprendizaje:</strong> La RC profesional cubre errores, negligencias y omisiones en el ejercicio de tu actividad. Para autónomos es la cobertura #1, por encima del seguro de salud.</p>
            </div>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🏠</span>
                <div>
                  <h3>Carlos, 45 años — Hogar sin RC familiar</h3>
                  <span className={styles.casoTag}>Familia con hijos</span>
                </div>
              </div>
              <p>Carlos tenía seguro de hogar básico. Su hijo de 10 años rompió accidentalmente el cristal de una terraza del vecino (2.400€). Descubrió que su póliza no incluía Responsabilidad Civil familiar.</p>
              <p className={styles.casoResultado}><strong>Aprendizaje:</strong> El multirriesgo de hogar con RC familiar cubre daños que causen tus hijos, tu mascota o cualquier miembro del hogar a terceros. Es la ampliación más recomendable para familias.</p>
            </div>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🏡</span>
                <div>
                  <h3>Ana, 35 años — Primera hipoteca</h3>
                  <span className={styles.casoTag}>Propietaria</span>
                </div>
              </div>
              <p>Al firmar la hipoteca, el banco le &quot;ofreció&quot; su seguro de hogar y de vida vinculados. Ana aceptó sin comparar. Dos años después revisó el mercado y descubrió que pagaba un 60% más de lo necesario.</p>
              <p className={styles.casoResultado}><strong>Aprendizaje:</strong> El banco no puede obligarte a contratar sus seguros (Ley 5/2019). Puedes contratar cualquier seguro equivalente y el banco debe aceptarlo. Compara siempre antes de firmar.</p>
            </div>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>👴</span>
                <div>
                  <h3>Pedro, 62 años — Planificando la jubilación</h3>
                  <span className={styles.casoTag}>Jubilado</span>
                </div>
              </div>
              <p>Pedro revisó sus seguros antes de jubilarse. Tenía un seguro de vida con capital alto (ya sin deudas ni hijos dependientes) pero no tenía seguro de dependencia. Reajustó: redujo el capital de vida y contrató dependencia.</p>
              <p className={styles.casoResultado}><strong>Aprendizaje:</strong> Las necesidades de cobertura cambian con la etapa de vida. Revisar el checklist cada 5 años (o tras un evento vital grande) evita pagar de más en coberturas innecesarias y quedarse sin las que más importan.</p>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN 3: FAQ ====== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas frecuentes sobre seguros</h2>
          <div className={styles.faqGrid}>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿El banco puede obligarme a contratar su seguro con la hipoteca?</h3>
              <p className={styles.faqAnswer}>No. La Ley 5/2019 (LCCI) prohíbe la venta vinculada obligatoria de seguros con hipotecas. El banco puede ofrecerte condiciones mejores (como reducir el diferencial del tipo de interés) si contratas con ellos, pero <strong>no puede negarte la hipoteca</strong> porque elijas otra aseguradora.</p>
              <p className={styles.faqAnswer}>Compara siempre el coste real: ahorro en diferencial vs sobrecoste del seguro bancario.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué diferencia hay entre seguro de vida y seguro de decesos?</h3>
              <p className={styles.faqAnswer}>Son dos seguros completamente distintos:</p>
              <ul className={styles.faqList}>
                <li><strong>Seguro de vida:</strong> Paga un capital a los beneficiarios si el asegurado fallece. Protege ingresos y deudas.</li>
                <li><strong>Seguro de decesos:</strong> Cubre los gastos del funeral, traslados, trámites. No es un capital, es un servicio.</li>
              </ul>
              <p className={styles.faqAnswer}>Pueden complementarse: el seguro de decesos cubre el entierro (3.000-8.000€) y el seguro de vida cubre el futuro económico de la familia.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Puedo tener dos seguros de salud y cobrar dos veces?</h3>
              <p className={styles.faqAnswer}>No. Los seguros de salud son de <strong>prestación de servicios</strong>, no de indemnización. Cada uno te da acceso a su red de médicos, pero no se acumulan para pagar lo mismo dos veces.</p>
              <p className={styles.faqAnswer}>Puede tener sentido tener dos si tienen redes distintas (por ejemplo, uno para trabajo y otro de empresa), pero en general es dinero duplicado innecesariamente.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿A qué edad conviene contratar el seguro de dependencia?</h3>
              <p className={styles.faqAnswer}>Cuanto antes, mejor: las primas son mucho más bajas si lo contratas joven (40-50 años) y ya estás protegido si se produce antes de lo esperado.</p>
              <p className={styles.faqAnswer}>A partir de los 65 años las primas se disparan o directamente hay exclusiones por edad o enfermedades preexistentes. El sistema público de dependencia (Ley 39/2006) puede tardar años en tramitarse.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿El seguro multirriesgo de hogar cubre lo que hay dentro (muebles, ropa)?</h3>
              <p className={styles.faqAnswer}>Depende de qué hayas asegurado:</p>
              <ul className={styles.faqList}>
                <li><strong>Continente:</strong> La estructura del edificio (paredes, suelo, instalaciones). Obligatorio para propietarios.</li>
                <li><strong>Contenido:</strong> Los muebles, electrodomésticos, ropa, electrónica. Recomendable para todos.</li>
                <li><strong>Multirriesgo completo:</strong> Continente + contenido + RC familiar. El más habitual y recomendable.</li>
              </ul>
              <p className={styles.faqAnswer}>Si estás de alquiler, el propietario asegura el continente; tú deberías asegurar el contenido.</p>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN 4: GUÍA PASO A PASO ====== */}
        <section className={styles.guiaSection}>
          <h2>📋 Cómo revisar y contratar seguros correctamente</h2>
          <div className={styles.guiaSteps}>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>1</span>
              <div>
                <h4>Usa el checklist según tu perfil actual</h4>
                <p>Selecciona el perfil que mejor te representa y marca las coberturas que ya tienes. El progreso te indica cuánta protección tienes actualmente.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>2</span>
              <div>
                <h4>Identifica los gaps (coberturas que faltan)</h4>
                <p>Las marcadas como <strong>Obligatorio</strong> o <strong>Muy recomendable</strong> que no tengas son tu prioridad. Las recomendables son el siguiente nivel.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>3</span>
              <div>
                <h4>Pide al menos 3 presupuestos</h4>
                <p>Usa comparadores online (Acierto, Rastreator, Rankia) y también contacta directamente con aseguradoras. Los precios pueden variar un 40-60% por el mismo producto.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>4</span>
              <div>
                <h4>Lee las exclusiones, no solo las coberturas</h4>
                <p>Lo importante no es qué cubre, sino qué <strong>no</strong> cubre. Las exclusiones están en letra pequeña pero son las que determinan si el seguro sirve en el momento del siniestro.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>5</span>
              <div>
                <h4>Verifica los límites de cobertura</h4>
                <p>Un seguro de hogar puede tener un límite de 60.000€ en contenido cuando tus bienes valen más. Asegúrate de que el capital asegurado refleja el valor real.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>6</span>
              <div>
                <h4>Revisa y compara cada año en la renovación</h4>
                <p>Las aseguradoras suben primas anualmente. Compara en cada renovación: la fidelidad no siempre es el mejor negocio. Muchas ofrecen mejor precio a clientes nuevos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ====== SECCIÓN 5: TIPS Y ERRORES ====== */}
        <section className={styles.tipsSection}>
          <h2>💡 Tips y errores que debes evitar</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <h4>✅ Agrupa seguros en una aseguradora</h4>
              <p>Tener hogar, vida y coche en la misma compañía puede dar descuentos de un 10-20% (multiproducto). Pregunta siempre por esta opción.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>✅ Revisa coberturas ante eventos vitales</h4>
              <p>Matrimonio, nacimiento de un hijo, hipoteca, jubilación: cada cambio vital puede requerir actualizar coberturas. Revisa el checklist en cada momento.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>✅ Actualiza beneficiarios del seguro de vida</h4>
              <p>Si tienes pareja nueva, hijos, o has vivido un divorcio, comprueba que los beneficiarios del seguro de vida están correctamente designados.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>❌ No canceles el seguro antiguo antes del nuevo</h4>
              <p>Espera a tener la póliza nueva activa antes de cancelar la antigua. Incluso un día sin cobertura puede ser muy costoso si ocurre un siniestro.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>❌ Infraasegurarse en el hogar</h4>
              <p>Si aseguras el contenido por 20.000€ pero tienes bienes por 50.000€, en un siniestro total solo cobras 20.000€ (o menos, por la regla de proporcionalidad).</p>
            </div>
            <div className={styles.tipCard}>
              <h4>❌ No declarar cambios de situación</h4>
              <p>Una reforma importante, un local en casa, una mascota nueva de raza peligrosa: no declarar cambios puede anular la cobertura en el momento del siniestro.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores graves al gestionar tus coberturas de seguros</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>No revisar las exclusiones de la póliza:</strong> Las exclusiones definen para qué no sirve el seguro. Contratar sin leerlas puede llevar a reclamaciones denegadas en el peor momento.</li>
            <li><strong>Infrasegurar el contenido del hogar:</strong> Si aseguras el contenido por 20.000 € pero tienes bienes por 50.000 €, en un siniestro total solo cobras la fracción proporcional. El seguro debe reflejar el valor real.</li>
            <li><strong>Cancelar el seguro antiguo antes de tener el nuevo activo:</strong> Un solo día sin cobertura puede ser muy costoso. Espera siempre a que la nueva póliza esté en vigor antes de cancelar la anterior.</li>
            <li><strong>No actualizar beneficiarios del seguro de vida:</strong> Tras un divorcio, nueva pareja o nacimiento de hijos, los beneficiarios pueden ser incorrectos. Si falleces, el dinero puede ir a quien ya no es tu voluntad.</li>
            <li><strong>Ignorar los períodos de carencia en seguros de salud:</strong> Muchos seguros de salud excluyen cirugías, maternidad o enfermedades preexistentes durante los primeros 6-12 meses. Contratar justo cuando lo necesitas puede ser demasiado tarde.</li>
            <li><strong>No comunicar cambios de situación a la aseguradora:</strong> Reformas importantes, uso del inmueble como oficina, nueva mascota de raza considerada peligrosa... No declarar cambios puede anular la cobertura en el siniestro.</li>
          </ul>
        </div>

      </EducationalSection>

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
            type="button"
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
