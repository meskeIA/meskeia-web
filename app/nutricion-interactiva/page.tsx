'use client';

import { useState, useEffect } from 'react';
import styles from './NutricionInteractiva.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import CuadroAceptacion from './components/CuadroAceptacion';
import {
  organos,
  alimentos,
  nutrientes,
  getAlimentoPorId,
  getOrganoPorId,
  getAlimentosBeneficiososParaOrgano,
  getAlimentosPerjudicialesParaOrgano,
  getNutrientePorId,
} from './data';
import type { Organo, Alimento } from './data';

type Pestaña = 'organo' | 'alimento';

export default function NutricionInteractivaPage() {
  // Estado del cuadro de aceptación
  const [aceptado, setAceptado] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estado de la aplicación
  const [pestañaActiva, setPestañaActiva] = useState<Pestaña>('organo');
  const [organoSeleccionado, setOrganoSeleccionado] = useState<string>('');
  const [alimentoBusqueda, setAlimentoBusqueda] = useState<string>('');
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<Alimento | null>(null);

  // Verificar si ya aceptó previamente
  useEffect(() => {
    const previoAceptado = localStorage.getItem('nutricion-aceptado');
    if (previoAceptado === 'true') {
      setAceptado(true);
    }
    setLoading(false);
  }, []);

  // Filtrar alimentos por búsqueda
  const alimentosFiltrados = alimentos.filter((alimento) =>
    alimento.nombre.toLowerCase().includes(alimentoBusqueda.toLowerCase())
  );

  // Manejar selección de alimento
  const handleSeleccionarAlimento = (alimento: Alimento) => {
    setAlimentoSeleccionado(alimento);
    setAlimentoBusqueda('');
  };

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  // Si no ha aceptado, mostrar cuadro de aceptación
  if (!aceptado) {
    return <CuadroAceptacion onAceptar={() => setAceptado(true)} />;
  }

  // APLICACIÓN PRINCIPAL
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🥗</span>
        <h1 className={styles.title}>Nutrición Interactiva</h1>
        <p className={styles.subtitle}>
          Descubre qué alimentos benefician a tus órganos, cómo se potencian entre sí
          y cuáles inhiben la absorción de nutrientes
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-16" />

      {/* Pestañas de navegación */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${pestañaActiva === 'organo' ? styles.tabActive : ''}`}
          onClick={() => setPestañaActiva('organo')}
          aria-label="Búsqueda por órgano"
        >
          🫀 Buscar por Órgano
        </button>
        <button
          className={`${styles.tab} ${pestañaActiva === 'alimento' ? styles.tabActive : ''}`}
          onClick={() => setPestañaActiva('alimento')}
          aria-label="Búsqueda por alimento"
        >
          🍎 Buscar por Alimento
        </button>
      </div>

      {/* Contenido según pestaña activa */}
      <div className={styles.mainContent}>
        {pestañaActiva === 'organo' && (
          <div className={styles.busquedaOrgano}>
            <h2 className={styles.sectionTitle}>
              Selecciona un órgano para ver qué alimentos lo benefician
            </h2>

            <div className={styles.organoGrid}>
              {organos.map((organo) => (
                <button
                  key={organo.id}
                  className={`${styles.organoCard} ${
                    organoSeleccionado === organo.id ? styles.organoCardActive : ''
                  }`}
                  onClick={() => setOrganoSeleccionado(organo.id)}
                  aria-label={`Seleccionar ${organo.nombre}`}
                >
                  <span className={styles.organoEmoji}>{organo.emoji}</span>
                  <span className={styles.organoNombre}>{organo.nombre}</span>
                </button>
              ))}
            </div>

            {/* Resultados de búsqueda por órgano */}
            {organoSeleccionado && (
              <div className={styles.resultados}>
                <h3 className={styles.resultadoTitle}>
                  Alimentos para {getOrganoPorId(organoSeleccionado)?.nombre}
                </h3>

                <div className={styles.alimentosLista}>
                  <h4 className={styles.listaTitle}>✅ Beneficiosos</h4>
                  {getAlimentosBeneficiososParaOrgano(organoSeleccionado).map((alimento) => {
                    const impacto = alimento.organos.beneficiosos.find(
                      (i) => i.organoId === organoSeleccionado
                    );
                    return (
                      <div key={alimento.id} className={styles.alimentoItem}>
                        <div className={styles.alimentoHeader}>
                          <span className={styles.alimentoEmoji}>{alimento.emoji}</span>
                          <strong>{alimento.nombre}</strong>
                          <span className={`${styles.nivel} ${styles[`nivel${impacto?.nivel}`]}`}>
                            {impacto?.nivel}
                          </span>
                        </div>
                        <p className={styles.alimentoDescripcion}>{impacto?.beneficio}</p>
                        <span className={styles.fuente}>{impacto?.fuente}</span>
                      </div>
                    );
                  })}

                  {getAlimentosBeneficiososParaOrgano(organoSeleccionado).length === 0 && (
                    <p className={styles.noResultados}>
                      No hay alimentos registrados para este órgano aún
                    </p>
                  )}

                  {getAlimentosPerjudicialesParaOrgano(organoSeleccionado).length > 0 && (
                    <>
                      <h4 className={`${styles.listaTitle} ${styles.listaTitleWarning}`}>
                        ⚠️ Precauciones
                      </h4>
                      {getAlimentosPerjudicialesParaOrgano(organoSeleccionado).map(
                        (alimento) => {
                          const precaucion = alimento.organos.perjudiciales?.find(
                            (p) => p.organoId === organoSeleccionado
                          );
                          return (
                            <div
                              key={alimento.id}
                              className={`${styles.alimentoItem} ${styles.alimentoWarning}`}
                            >
                              <div className={styles.alimentoHeader}>
                                <span className={styles.alimentoEmoji}>{alimento.emoji}</span>
                                <strong>{alimento.nombre}</strong>
                              </div>
                              <p className={styles.alimentoDescripcion}>
                                {precaucion?.advertencia}
                              </p>
                              {precaucion?.condicion && (
                                <p className={styles.condicion}>
                                  <strong>Condición:</strong> {precaucion.condicion}
                                </p>
                              )}
                              <span className={styles.fuente}>{precaucion?.fuente}</span>
                            </div>
                          );
                        }
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {pestañaActiva === 'alimento' && (
          <div className={styles.busquedaAlimento}>
            <h2 className={styles.sectionTitle}>
              Busca un alimento para ver sus beneficios y sinergias
            </h2>

            <div className={styles.buscador}>
              <input
                type="text"
                placeholder="Escribe el nombre del alimento..."
                value={alimentoBusqueda}
                onChange={(e) => setAlimentoBusqueda(e.target.value)}
                className={styles.input}
                aria-label="Buscar alimento"
              />

              {alimentoBusqueda && (
                <div className={styles.sugerencias}>
                  {alimentosFiltrados.map((alimento) => (
                    <button
                      key={alimento.id}
                      className={styles.sugerenciaItem}
                      onClick={() => handleSeleccionarAlimento(alimento)}
                      aria-label={`Seleccionar ${alimento.nombre}`}
                    >
                      <span className={styles.sugerenciaEmoji}>{alimento.emoji}</span>
                      <span>{alimento.nombre}</span>
                    </button>
                  ))}

                  {alimentosFiltrados.length === 0 && (
                    <p className={styles.noResultados}>No se encontraron resultados</p>
                  )}
                </div>
              )}
            </div>

            {/* Detalle del alimento seleccionado */}
            {alimentoSeleccionado && (
              <div className={styles.detalleAlimento}>
                <div className={styles.detalleHeader}>
                  <span className={styles.detalleEmoji}>
                    {alimentoSeleccionado.emoji}
                  </span>
                  <h3 className={styles.detalleTitle}>{alimentoSeleccionado.nombre}</h3>
                  {alimentoSeleccionado.descripcion && (
                    <p className={styles.detalleDescripcion}>
                      {alimentoSeleccionado.descripcion}
                    </p>
                  )}
                </div>

                {/* Beneficios por órgano */}
                <div className={styles.detalleSection}>
                  <h4 className={styles.detalleSectionTitle}>🫀 Beneficios por Órgano</h4>
                  <div className={styles.organosList}>
                    {alimentoSeleccionado.organos.beneficiosos.map((impacto) => {
                      const organo = getOrganoPorId(impacto.organoId);
                      return (
                        <div key={impacto.organoId} className={styles.organoDetalle}>
                          <div className={styles.organoDetalleHeader}>
                            <span>{organo?.emoji}</span>
                            <strong>{organo?.nombre}</strong>
                            <span
                              className={`${styles.nivel} ${styles[`nivel${impacto.nivel}`]}`}
                            >
                              {impacto.nivel}
                            </span>
                          </div>
                          <p>{impacto.beneficio}</p>
                          <span className={styles.fuente}>{impacto.fuente}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrientes */}
                <div className={styles.detalleSection}>
                  <h4 className={styles.detalleSectionTitle}>🧬 Nutrientes Principales</h4>
                  <div className={styles.nutrientesList}>
                    {alimentoSeleccionado.nutrientes.map((nutrienteDetalle) => {
                      const nutriente = getNutrientePorId(nutrienteDetalle.nutrienteId);
                      return (
                        <div key={nutrienteDetalle.nutrienteId} className={styles.nutrienteItem}>
                          {nutriente?.emoji && (
                            <span className={styles.nutrienteEmoji}>{nutriente.emoji}</span>
                          )}
                          <div className={styles.nutrienteInfo}>
                            <strong>{nutriente?.nombre}</strong>
                            {nutrienteDetalle.cantidad && (
                              <span className={styles.cantidad}>
                                {nutrienteDetalle.cantidad}
                              </span>
                            )}
                            <span
                              className={`${styles.nivel} ${styles[`nivel${nutrienteDetalle.nivel}`]}`}
                            >
                              {nutrienteDetalle.nivel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sinergias */}
                {alimentoSeleccionado.sinergias.length > 0 && (
                  <div className={styles.detalleSection}>
                    <h4 className={styles.detalleSectionTitle}>
                      ✨ Combinaciones que Potencian
                    </h4>
                    <div className={styles.sinergiasList}>
                      {alimentoSeleccionado.sinergias.map((sinergia, index) => {
                        const alimentoSinergia = getAlimentoPorId(sinergia.conAlimentoId);
                        return (
                          <div key={index} className={styles.sinergiaItem}>
                            <div className={styles.sinergiaHeader}>
                              <span>{alimentoSeleccionado.emoji}</span>
                              <span className={styles.sinergiaPlus}>+</span>
                              <span>{alimentoSinergia?.emoji}</span>
                              <strong>{alimentoSinergia?.nombre}</strong>
                            </div>
                            <p>{sinergia.razon}</p>
                            <span className={styles.fuente}>{sinergia.fuente}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Antagonismos */}
                {alimentoSeleccionado.antagonismos.length > 0 && (
                  <div className={styles.detalleSection}>
                    <h4 className={`${styles.detalleSectionTitle} ${styles.detalleSectionWarning}`}>
                      ⚠️ Combinaciones que Inhiben
                    </h4>
                    <div className={styles.antagonismosList}>
                      {alimentoSeleccionado.antagonismos.map((antagonismo, index) => {
                        const alimentoAntagonismo = getAlimentoPorId(
                          antagonismo.conAlimentoId
                        );
                        return (
                          <div
                            key={index}
                            className={`${styles.antagonismoItem} ${styles.alimentoWarning}`}
                          >
                            <div className={styles.antagonismoHeader}>
                              <span>{alimentoSeleccionado.emoji}</span>
                              <span className={styles.antagonismoX}>⚡</span>
                              <span>{alimentoAntagonismo?.emoji}</span>
                              <strong>{alimentoAntagonismo?.nombre}</strong>
                            </div>
                            <p>{antagonismo.razon}</p>
                            <span className={styles.fuente}>{antagonismo.fuente}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer médico */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        context="nutricion-interactiva"
        collapsible={true}
      />

      {/* Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('nutricion-interactiva')} />

      <Footer appName="nutricion-interactiva" />
    </div>
  );
}
