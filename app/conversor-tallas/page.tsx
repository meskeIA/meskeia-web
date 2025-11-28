'use client';

import { useState } from 'react';
import styles from './ConversorTallas.module.css';
import { Footer, ResultCard, MeskeiaLogo, EducationalSection } from '@/components';

// Tipos
type TabType = 'hombre' | 'mujer' | 'calzado' | 'complementos';
type SistemaType = 'ES' | 'US' | 'UK';
type HombreTipoType = 'camisas-casual' | 'camisas-formal' | 'pantalones' | 'chaquetas';
type MujerTipoType = 'blusas' | 'pantalones' | 'vestidos';
type CalzadoTipoType = 'hombre' | 'mujer' | 'nino';
type ComplementoTipoType = 'anillos' | 'gorros' | 'guantes';

interface ResultadoTalla {
  es: string;
  us: string;
  uk: string;
  medida?: string;
}

export default function ConversorTallasPage() {
  // Estado para tabs
  const [activeTab, setActiveTab] = useState<TabType>('hombre');

  // Estados para Hombre
  const [hombreTipo, setHombreTipo] = useState<HombreTipoType>('camisas-casual');
  const [hombreSistema, setHombreSistema] = useState<SistemaType>('ES');
  const [hombreInput, setHombreInput] = useState('');
  const [hombreResult, setHombreResult] = useState<ResultadoTalla | null>(null);

  // Estados para Mujer
  const [mujerTipo, setMujerTipo] = useState<MujerTipoType>('blusas');
  const [mujerSistema, setMujerSistema] = useState<SistemaType>('ES');
  const [mujerInput, setMujerInput] = useState('');
  const [mujerResult, setMujerResult] = useState<ResultadoTalla | null>(null);

  // Estados para Calzado
  const [calzadoTipo, setCalzadoTipo] = useState<CalzadoTipoType>('hombre');
  const [calzadoSistema, setCalzadoSistema] = useState<SistemaType>('ES');
  const [calzadoInput, setCalzadoInput] = useState('');
  const [calzadoResult, setCalzadoResult] = useState<ResultadoTalla | null>(null);

  // Estados para Complementos
  const [complementoTipo, setComplementoTipo] = useState<ComplementoTipoType>('anillos');
  const [complementoSistema, setComplementoSistema] = useState<SistemaType>('ES');
  const [complementoInput, setComplementoInput] = useState('');
  const [complementoResult, setComplementoResult] = useState<ResultadoTalla | null>(null);


  // Conversiones para Ropa de Hombre
  const convertHombreTalla = () => {
    const input = hombreInput.trim().toUpperCase();
    if (!input) {
      setHombreResult(null);
      return;
    }

    let esSize: string = '-';
    let usSize: string = '-';
    let ukSize: string = '-';

    if (hombreTipo === 'camisas-casual') {
      const sizeMap: Record<string, { ES: string; US: string; UK: string }> = {
        XS: { ES: 'XS', US: 'XS', UK: '32' },
        S: { ES: 'S', US: 'S', UK: '34' },
        M: { ES: 'M', US: 'M', UK: '36' },
        L: { ES: 'L', US: 'L', UK: '38' },
        XL: { ES: 'XL', US: 'XL', UK: '40' },
        XXL: { ES: 'XXL', US: 'XXL', UK: '42' },
        XXXL: { ES: 'XXXL', US: 'XXXL', UK: '44' },
      };

      if (hombreSistema === 'UK') {
        const ukToSize: Record<string, string> = {
          '32': 'XS',
          '34': 'S',
          '36': 'M',
          '38': 'L',
          '40': 'XL',
          '42': 'XXL',
          '44': 'XXXL',
        };
        const sizeKey = ukToSize[input] || input;
        if (sizeMap[sizeKey]) {
          const result = sizeMap[sizeKey];
          esSize = result.ES;
          usSize = result.US;
          ukSize = result.UK;
        }
      } else {
        if (sizeMap[input]) {
          const result = sizeMap[input];
          esSize = result.ES;
          usSize = result.US;
          ukSize = result.UK;
        }
      }
    } else if (hombreTipo === 'camisas-formal') {
      const inputNum = parseFloat(input);
      if (!isNaN(inputNum)) {
        if (hombreSistema === 'ES') {
          esSize = Math.round(inputNum).toString();
          usSize = Math.round(inputNum * 0.394).toString();
          ukSize = Math.round(inputNum * 0.394).toString();
        } else {
          esSize = Math.round(inputNum * 2.54).toString();
          usSize = Math.round(inputNum).toString();
          ukSize = Math.round(inputNum).toString();
        }
      }
    } else if (hombreTipo === 'pantalones') {
      const inputNum = parseFloat(input);
      if (!isNaN(inputNum)) {
        if (hombreSistema === 'ES') {
          esSize = Math.round(inputNum).toString();
          usSize = Math.round((inputNum - 16) * 0.75).toString();
          ukSize = Math.round((inputNum - 16) * 0.75).toString();
        } else {
          esSize = Math.round(inputNum / 0.75 + 16).toString();
          usSize = Math.round(inputNum).toString();
          ukSize = Math.round(inputNum).toString();
        }
      }
    } else if (hombreTipo === 'chaquetas') {
      const inputNum = parseFloat(input);
      if (!isNaN(inputNum)) {
        if (hombreSistema === 'ES') {
          esSize = Math.round(inputNum).toString();
          usSize = Math.round(inputNum - 10).toString();
          ukSize = Math.round(inputNum - 10).toString();
        } else {
          esSize = Math.round(inputNum + 10).toString();
          usSize = Math.round(inputNum).toString();
          ukSize = Math.round(inputNum).toString();
        }
      }
    }

    setHombreResult({ es: esSize, us: usSize, uk: ukSize });
  };

  // Conversiones para Ropa de Mujer
  const convertMujerTalla = () => {
    const input = mujerInput.trim().toUpperCase();
    if (!input) {
      setMujerResult(null);
      return;
    }

    let esSize: string = '-';
    let usSize: string = '-';
    let ukSize: string = '-';

    if (mujerTipo === 'blusas') {
      const sizeMap: Record<string, { ES: string; US: string; UK: string }> = {
        XS: { ES: 'XS', US: '0-2', UK: '6' },
        S: { ES: 'S', US: '4-6', UK: '8' },
        M: { ES: 'M', US: '8-10', UK: '10' },
        L: { ES: 'L', US: '12-14', UK: '12' },
        XL: { ES: 'XL', US: '16-18', UK: '14' },
        XXL: { ES: 'XXL', US: '20-22', UK: '16' },
      };

      if (sizeMap[input]) {
        const result = sizeMap[input];
        esSize = result.ES;
        usSize = result.US;
        ukSize = result.UK;
      }
    } else {
      const inputNum = parseFloat(input);
      if (!isNaN(inputNum)) {
        if (mujerSistema === 'ES') {
          esSize = Math.round(inputNum).toString();
          usSize = Math.max(0, Math.round((inputNum - 34) / 2)).toString();
          ukSize = Math.round(inputNum - 28).toString();
        } else if (mujerSistema === 'US') {
          esSize = Math.round(inputNum * 2 + 34).toString();
          usSize = Math.round(inputNum).toString();
          ukSize = Math.round(inputNum * 2 + 6).toString();
        } else {
          esSize = Math.round(inputNum + 28).toString();
          usSize = Math.max(0, Math.round((inputNum - 6) / 2)).toString();
          ukSize = Math.round(inputNum).toString();
        }
      }
    }

    setMujerResult({ es: esSize, us: usSize, uk: ukSize });
  };

  // Conversiones para Calzado
  const convertCalzadoTalla = () => {
    const input = calzadoInput.trim();
    if (!input) {
      setCalzadoResult(null);
      return;
    }

    const inputNum = parseFloat(input);
    if (isNaN(inputNum)) {
      setCalzadoResult(null);
      return;
    }

    let esSize: string = '-';
    let usSize: string = '-';
    let ukSize: string = '-';
    let cmSize: string = '-';

    if (calzadoTipo === 'hombre') {
      if (calzadoSistema === 'ES') {
        esSize = inputNum.toString();
        usSize = (inputNum - 33).toFixed(1);
        ukSize = (inputNum - 33.5).toFixed(1);
        cmSize = (inputNum * 0.67 + 2).toFixed(1);
      } else if (calzadoSistema === 'US') {
        esSize = (inputNum + 33).toFixed(0);
        usSize = inputNum.toString();
        ukSize = (inputNum - 0.5).toFixed(1);
        cmSize = (inputNum * 0.8 + 22).toFixed(1);
      } else {
        esSize = (inputNum + 33.5).toFixed(0);
        usSize = (inputNum + 0.5).toFixed(1);
        ukSize = inputNum.toString();
        cmSize = (inputNum * 0.8 + 22.5).toFixed(1);
      }
    } else if (calzadoTipo === 'mujer') {
      if (calzadoSistema === 'ES') {
        esSize = inputNum.toString();
        usSize = (inputNum - 30.5).toFixed(1);
        ukSize = (inputNum - 32.5).toFixed(1);
        cmSize = (inputNum * 0.67 + 0.5).toFixed(1);
      } else if (calzadoSistema === 'US') {
        esSize = (inputNum + 30.5).toFixed(0);
        usSize = inputNum.toString();
        ukSize = (inputNum - 2).toFixed(1);
        cmSize = (inputNum * 0.8 + 20).toFixed(1);
      } else {
        esSize = (inputNum + 32.5).toFixed(0);
        usSize = (inputNum + 2).toFixed(1);
        ukSize = inputNum.toString();
        cmSize = (inputNum * 0.8 + 22).toFixed(1);
      }
    } else {
      // Niño
      if (calzadoSistema === 'ES') {
        esSize = inputNum.toString();
        usSize = (inputNum - 17).toFixed(1);
        ukSize = (inputNum - 18).toFixed(1);
        cmSize = (inputNum * 0.67 - 1).toFixed(1);
      } else if (calzadoSistema === 'US') {
        esSize = (inputNum + 17).toFixed(0);
        usSize = inputNum.toString();
        ukSize = (inputNum - 1).toFixed(1);
        cmSize = (inputNum * 0.8 + 4).toFixed(1);
      } else {
        esSize = (inputNum + 18).toFixed(0);
        usSize = (inputNum + 1).toFixed(1);
        ukSize = inputNum.toString();
        cmSize = (inputNum * 0.8 + 5).toFixed(1);
      }
    }

    setCalzadoResult({ es: esSize, us: usSize, uk: ukSize, medida: `${cmSize} cm` });
  };

  // Conversiones para Complementos
  const convertComplementoTalla = () => {
    const input = complementoInput.trim().toUpperCase();
    if (!input) {
      setComplementoResult(null);
      return;
    }

    let esSize: string = '-';
    let usSize: string = '-';
    let ukSize: string = '-';
    let medida: string = '-';

    if (complementoTipo === 'anillos') {
      const inputNum = parseFloat(input);
      if (!isNaN(inputNum)) {
        if (complementoSistema === 'ES') {
          esSize = inputNum.toString();
          usSize = ((inputNum - 10) / 2).toFixed(1);
          const ukLetters = ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
          ukSize = ukLetters[Math.round(inputNum - 10)] || '-';
          medida = (inputNum * 0.8 + 7.7).toFixed(1) + ' mm';
        } else if (complementoSistema === 'US') {
          esSize = Math.round(inputNum * 2 + 10).toString();
          usSize = inputNum.toString();
          const ukLetters = ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
          ukSize = ukLetters[Math.round(inputNum * 2)] || '-';
          medida = (inputNum * 1.6 + 15.7).toFixed(1) + ' mm';
        }
      }
    } else if (complementoTipo === 'gorros') {
      const sizeMap: Record<string, { ES: string; US: string; UK: string; cm: string }> = {
        S: { ES: 'S', US: 'S', UK: 'S', cm: '54-56' },
        M: { ES: 'M', US: 'M', UK: 'M', cm: '56-58' },
        L: { ES: 'L', US: 'L', UK: 'L', cm: '58-60' },
        XL: { ES: 'XL', US: 'XL', UK: 'XL', cm: '60-62' },
      };

      if (sizeMap[input]) {
        const result = sizeMap[input];
        esSize = result.ES;
        usSize = result.US;
        ukSize = result.UK;
        medida = result.cm + ' cm';
      }
    } else if (complementoTipo === 'guantes') {
      const inputNum = parseFloat(input);
      if (!isNaN(inputNum)) {
        esSize = inputNum.toString();
        if (inputNum <= 6.5) {
          usSize = 'XS';
          ukSize = 'XS';
        } else if (inputNum <= 7.5) {
          usSize = 'S';
          ukSize = 'S';
        } else if (inputNum <= 8.5) {
          usSize = 'M';
          ukSize = 'M';
        } else if (inputNum <= 9.5) {
          usSize = 'L';
          ukSize = 'L';
        } else {
          usSize = 'XL';
          ukSize = 'XL';
        }
        medida = (inputNum * 2.5 + 2.5).toFixed(0) + ' cm';
      } else {
        const letterMap: Record<string, { ES: string; US: string; UK: string; cm: string }> = {
          XS: { ES: '6', US: 'XS', UK: 'XS', cm: '15' },
          S: { ES: '7', US: 'S', UK: 'S', cm: '17' },
          M: { ES: '8', US: 'M', UK: 'M', cm: '19' },
          L: { ES: '9', US: 'L', UK: 'L', cm: '21' },
          XL: { ES: '10', US: 'XL', UK: 'XL', cm: '23' },
        };

        if (letterMap[input]) {
          const result = letterMap[input];
          esSize = result.ES;
          usSize = result.US;
          ukSize = result.UK;
          medida = result.cm + ' cm';
        }
      }
    }

    setComplementoResult({ es: esSize, us: usSize, uk: ukSize, medida });
  };

  // Cambiar de tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Obtener placeholder según tipo de prenda hombre
  const getHombrePlaceholder = () => {
    switch (hombreTipo) {
      case 'camisas-casual':
        return 'Ej: S, M, L, XL...';
      case 'camisas-formal':
        return 'Ej: 39, 40, 41 (cm)';
      case 'pantalones':
        return 'Ej: 42, 44, 46...';
      case 'chaquetas':
        return 'Ej: 48, 50, 52...';
      default:
        return 'Tu talla';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Tallas Internacional</h1>
        <p className={styles.subtitle}>Encuentra tu talla perfecta para compras online internacionales</p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'hombre' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('hombre')}
        >
          Hombre
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'mujer' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('mujer')}
        >
          Mujer
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'calzado' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('calzado')}
        >
          Calzado
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'complementos' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('complementos')}
        >
          Complementos
        </button>
      </div>

      {/* Tab Content: Hombre */}
      {activeTab === 'hombre' && (
        <div className={styles.tabContent}>
          <div className={styles.converterSection}>
            <div className={styles.inputSection}>
              <h3 className={styles.sectionTitle}>Ropa de Hombre</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de prenda</label>
                <select
                  className={styles.select}
                  value={hombreTipo}
                  onChange={(e) => {
                    setHombreTipo(e.target.value as HombreTipoType);
                    setHombreInput('');
                    setHombreResult(null);
                  }}
                >
                  <option value="camisas-casual">Camisas Casuales (S, M, L...)</option>
                  <option value="camisas-formal">Camisas Formales (Talla cuello)</option>
                  <option value="pantalones">Pantalones</option>
                  <option value="chaquetas">Chaquetas/Trajes</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu sistema de tallas</label>
                <select
                  className={styles.select}
                  value={hombreSistema}
                  onChange={(e) => setHombreSistema(e.target.value as SistemaType)}
                >
                  <option value="ES">España/Europa (ES/EU)</option>
                  <option value="US">Estados Unidos (US)</option>
                  <option value="UK">Reino Unido (UK)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu talla</label>
                <input
                  type="text"
                  className={styles.input}
                  value={hombreInput}
                  onChange={(e) => setHombreInput(e.target.value)}
                  placeholder={getHombrePlaceholder()}
                />
              </div>

              <button className={styles.btnPrimary} onClick={convertHombreTalla}>
                Convertir Talla
              </button>
            </div>

            <div className={styles.resultsSection}>
              <h3 className={styles.sectionTitle}>Equivalencias</h3>

              {hombreResult ? (
                <div className={styles.resultsGrid}>
                  <ResultCard title="España/Europa" value={hombreResult.es} variant="highlight" icon="🇪🇸" />
                  <ResultCard title="Estados Unidos" value={hombreResult.us} variant="info" icon="🇺🇸" />
                  <ResultCard title="Reino Unido" value={hombreResult.uk} variant="default" icon="🇬🇧" />
                </div>
              ) : (
                <p className={styles.noResults}>Introduce tu talla para ver las equivalencias</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Mujer */}
      {activeTab === 'mujer' && (
        <div className={styles.tabContent}>
          <div className={styles.converterSection}>
            <div className={styles.inputSection}>
              <h3 className={styles.sectionTitle}>Ropa de Mujer</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de prenda</label>
                <select
                  className={styles.select}
                  value={mujerTipo}
                  onChange={(e) => {
                    setMujerTipo(e.target.value as MujerTipoType);
                    setMujerInput('');
                    setMujerResult(null);
                  }}
                >
                  <option value="blusas">Blusas/Camisas</option>
                  <option value="pantalones">Pantalones</option>
                  <option value="vestidos">Vestidos</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu sistema de tallas</label>
                <select
                  className={styles.select}
                  value={mujerSistema}
                  onChange={(e) => setMujerSistema(e.target.value as SistemaType)}
                >
                  <option value="ES">España/Europa (ES/EU)</option>
                  <option value="US">Estados Unidos (US)</option>
                  <option value="UK">Reino Unido (UK)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu talla</label>
                <input
                  type="text"
                  className={styles.input}
                  value={mujerInput}
                  onChange={(e) => setMujerInput(e.target.value)}
                  placeholder={mujerTipo === 'blusas' ? 'Ej: S, M, L...' : 'Ej: 38, 40, 42...'}
                />
              </div>

              <button className={styles.btnPrimary} onClick={convertMujerTalla}>
                Convertir Talla
              </button>
            </div>

            <div className={styles.resultsSection}>
              <h3 className={styles.sectionTitle}>Equivalencias</h3>

              {mujerResult ? (
                <div className={styles.resultsGrid}>
                  <ResultCard title="España/Europa" value={mujerResult.es} variant="highlight" icon="🇪🇸" />
                  <ResultCard title="Estados Unidos" value={mujerResult.us} variant="info" icon="🇺🇸" />
                  <ResultCard title="Reino Unido" value={mujerResult.uk} variant="default" icon="🇬🇧" />
                </div>
              ) : (
                <p className={styles.noResults}>Introduce tu talla para ver las equivalencias</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Calzado */}
      {activeTab === 'calzado' && (
        <div className={styles.tabContent}>
          <div className={styles.converterSection}>
            <div className={styles.inputSection}>
              <h3 className={styles.sectionTitle}>Calzado</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de calzado</label>
                <select
                  className={styles.select}
                  value={calzadoTipo}
                  onChange={(e) => {
                    setCalzadoTipo(e.target.value as CalzadoTipoType);
                    setCalzadoInput('');
                    setCalzadoResult(null);
                  }}
                >
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="nino">Niño</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu sistema de tallas</label>
                <select
                  className={styles.select}
                  value={calzadoSistema}
                  onChange={(e) => setCalzadoSistema(e.target.value as SistemaType)}
                >
                  <option value="ES">España/Europa (ES/EU)</option>
                  <option value="US">Estados Unidos (US)</option>
                  <option value="UK">Reino Unido (UK)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu talla</label>
                <input
                  type="text"
                  className={styles.input}
                  value={calzadoInput}
                  onChange={(e) => setCalzadoInput(e.target.value)}
                  placeholder="Ej: 42, 9.5, 8..."
                />
              </div>

              <button className={styles.btnPrimary} onClick={convertCalzadoTalla}>
                Convertir Talla
              </button>
            </div>

            <div className={styles.resultsSection}>
              <h3 className={styles.sectionTitle}>Equivalencias</h3>

              {calzadoResult ? (
                <div className={styles.resultsGrid}>
                  <ResultCard title="España/Europa" value={calzadoResult.es} variant="highlight" icon="🇪🇸" />
                  <ResultCard title="Estados Unidos" value={calzadoResult.us} variant="info" icon="🇺🇸" />
                  <ResultCard title="Reino Unido" value={calzadoResult.uk} variant="default" icon="🇬🇧" />
                  <ResultCard
                    title="Longitud (cm)"
                    value={calzadoResult.medida || '-'}
                    variant="success"
                    icon="📏"
                  />
                </div>
              ) : (
                <p className={styles.noResults}>Introduce tu talla para ver las equivalencias</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Complementos */}
      {activeTab === 'complementos' && (
        <div className={styles.tabContent}>
          <div className={styles.converterSection}>
            <div className={styles.inputSection}>
              <h3 className={styles.sectionTitle}>Complementos</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de complemento</label>
                <select
                  className={styles.select}
                  value={complementoTipo}
                  onChange={(e) => {
                    setComplementoTipo(e.target.value as ComplementoTipoType);
                    setComplementoInput('');
                    setComplementoResult(null);
                  }}
                >
                  <option value="anillos">Anillos</option>
                  <option value="gorros">Gorros</option>
                  <option value="guantes">Guantes</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu sistema de tallas</label>
                <select
                  className={styles.select}
                  value={complementoSistema}
                  onChange={(e) => setComplementoSistema(e.target.value as SistemaType)}
                >
                  <option value="ES">España/Europa (ES/EU)</option>
                  <option value="US">Estados Unidos (US)</option>
                  <option value="UK">Reino Unido (UK)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tu talla</label>
                <input
                  type="text"
                  className={styles.input}
                  value={complementoInput}
                  onChange={(e) => setComplementoInput(e.target.value)}
                  placeholder={
                    complementoTipo === 'anillos' ? 'Ej: 14, 16, 18...' : 'Ej: S, M, L...'
                  }
                />
              </div>

              <button className={styles.btnPrimary} onClick={convertComplementoTalla}>
                Convertir Talla
              </button>
            </div>

            <div className={styles.resultsSection}>
              <h3 className={styles.sectionTitle}>Equivalencias</h3>

              {complementoResult ? (
                <div className={styles.resultsGrid}>
                  <ResultCard title="España/Europa" value={complementoResult.es} variant="highlight" icon="🇪🇸" />
                  <ResultCard title="Estados Unidos" value={complementoResult.us} variant="info" icon="🇺🇸" />
                  <ResultCard title="Reino Unido" value={complementoResult.uk} variant="default" icon="🇬🇧" />
                  <ResultCard
                    title="Medida"
                    value={complementoResult.medida || '-'}
                    variant="success"
                    icon="📏"
                  />
                </div>
              ) : (
                <p className={styles.noResults}>Introduce tu talla para ver las equivalencias</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h4>Informacion Importante sobre Equivalencias de Tallas</h4>
        <p>
          <strong>Las equivalencias mostradas son aproximadas</strong> y pueden variar significativamente
          entre fabricantes, marcas y paises. Cada empresa puede tener sus propios estandares de tallaje.
        </p>
        <p style={{ marginTop: '12px' }}>
          <strong>Recomendaciones para compras online:</strong>
        </p>
        <ul>
          <li>
            Consulta siempre la <strong>guia de tallas especifica</strong> del fabricante
          </li>
          <li>
            Lee las <strong>resenas de otros compradores</strong> sobre el tallaje del producto
          </li>
          <li>Para calzado, mide tu pie en centimetros y comparalo con las medidas del fabricante</li>
          <li>
            En caso de duda, elige la <strong>talla mayor</strong> - es mas facil ajustar que estirar
          </li>
          <li>Ropa asiatica suele tallar mas pequeno - considera subir 1-2 tallas</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          meskeIA no se hace responsable de problemas de tallas en compras realizadas basandose
          unicamente en estas equivalencias.
        </p>
      </div>

      <EducationalSection
        title="¿Quieres aprender más sobre Tallas Internacionales?"
        subtitle="Descubre consejos para compras online, cómo medir correctamente y respuestas a las preguntas más frecuentes"
      >
        <section className={styles.guideSection}>
          <h2>Sistemas de Tallas Principales</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🇪🇸 España/Europa (ES/EU)</h4>
              <p>
                <strong>Sistema métrico</strong> basado en centímetros. Usado en toda la Unión
                Europea. Para ropa usa medidas directas del cuerpo, para calzado longitud en
                centímetros (Paris Point).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🇺🇸 Estados Unidos (US)</h4>
              <p>
                <strong>Sistema imperial</strong> basado en pulgadas. Usa letras (XS, S, M, L, XL) y
                números. Las tallas americanas suelen ser más grandes que las europeas para la misma
                medida corporal.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🇬🇧 Reino Unido (UK)</h4>
              <p>
                <strong>Sistema mixto</strong> que combina elementos imperiales y propios. Similar al
                americano pero con diferencias significativas en calzado y ropa formal.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🌏 Otros Sistemas</h4>
              <p>
                <strong>Francia (FR):</strong> Similar al EU pero con pequeñas diferencias.{' '}
                <strong>Italia (IT):</strong> Propio sistema numérico.{' '}
                <strong>Asia:</strong> Generalmente más pequeño que occidentales.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Por qué una talla M americana no es igual a una M europea?</summary>
              <p>
                Cada país desarrolló sus estándares basándose en las características físicas promedio
                de su población. Las tallas americanas suelen ser más amplias que las europeas.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué hago si estoy entre dos tallas?</summary>
              <p>
                Para ropa ajustada elige la mayor, para oversize la menor. Para calzado, elige la
                mayor si tienes pies anchos. Siempre consulta las medidas en centímetros.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Las tallas de hombre y mujer se convierten igual?</summary>
              <p>
                No, tienen sistemas diferentes. En calzado, las tallas de mujer son típicamente 1.5-2
                números menores que las de hombre para el mismo pie.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cómo afecta el material a la talla?</summary>
              <p>
                Materiales elásticos permiten más flexibilidad. Materiales rígidos (denim, cuero)
                requieren tallas más precisas. Tejidos que encogen pueden requerir una talla mayor.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="conversor-tallas" />
    </div>
  );
}
