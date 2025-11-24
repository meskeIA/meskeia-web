'use client';

import { useState, useEffect } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './CalculadoraCocina.module.css';

// Tipos para las bases de datos
type CookingMethod = 'horno' | 'plancha' | 'hervido' | 'vapor';
type FoodCategory = 'carnes' | 'aves' | 'pescados' | 'pasta' | 'arroz' | 'verduras';
type IngredientCategory = 'huevos' | 'lacteos' | 'harinas' | 'endulzantes' | 'grasas';

interface CookingData {
  temp?: number | string;
  time: number;
  unit: string;
  ratio?: string;
  note?: string;
}

interface Substitute {
  substitute: string;
  ratio: string;
  notes: string;
}

export default function CalculadoraCocinaPage() {
  // Estados para tabs
  const [activeTab, setActiveTab] = useState<'conversor' | 'escalador' | 'tiempos' | 'sustitutos'>('conversor');

  // Estados para conversor de unidades
  const [conversionType, setConversionType] = useState<'volume' | 'weight' | 'temperature' | 'length'>('volume');
  const [fromValue, setFromValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [toValue, setToValue] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<string>('');

  // Estados para escalador de recetas
  const [originalServings, setOriginalServings] = useState<string>('');
  const [newServings, setNewServings] = useState<string>('');
  const [ingredients, setIngredients] = useState<string>('');
  const [scaledIngredients, setScaledIngredients] = useState<string>('');
  const [scaleWarning, setScaleWarning] = useState<string>('');

  // Estados para tiempos de cocción
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('carnes');
  const [foodType, setFoodType] = useState<string>('');
  const [cookingMethod, setCookingMethod] = useState<CookingMethod>('horno');
  const [foodWeight, setFoodWeight] = useState<string>('');
  const [cookingTimeValue, setCookingTimeValue] = useState<string>('');
  const [cookingTips, setCookingTips] = useState<string>('');

  // Estados para sustitutos
  const [ingredientCategory, setIngredientCategory] = useState<IngredientCategory>('huevos');
  const [originalIngredient, setOriginalIngredient] = useState<string>('');
  const [substituteList, setSubstituteList] = useState<string>('');

  // Definición de unidades por tipo
  const unitsData = {
    volume: [
      { value: 'ml', label: 'Mililitros (ml)' },
      { value: 'litros', label: 'Litros (L)' },
      { value: 'tazas', label: 'Tazas' },
      { value: 'cucharadas', label: 'Cucharadas' },
      { value: 'cucharaditas', label: 'Cucharaditas' }
    ],
    weight: [
      { value: 'gramos', label: 'Gramos (g)' },
      { value: 'kg', label: 'Kilogramos (kg)' },
      { value: 'onzas', label: 'Onzas (oz)' },
      { value: 'libras', label: 'Libras (lb)' }
    ],
    temperature: [
      { value: 'celsius', label: 'Celsius (°C)' },
      { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
      { value: 'gas_mark', label: 'Gas Mark' }
    ],
    length: [
      { value: 'cm', label: 'Centímetros (cm)' },
      { value: 'pulgadas', label: 'Pulgadas (in)' }
    ]
  };

  // Base de datos de tiempos de cocción
  const cookingDatabase: Record<FoodCategory, Record<string, Partial<Record<CookingMethod, CookingData>>>> = {
    carnes: {
      'ternera_filete': {
        horno: { temp: 180, time: 20, unit: 'min/500g', note: 'Para término medio' },
        plancha: { temp: 'Alta', time: 8, unit: 'min total' }
      },
      'cerdo_lomo': {
        horno: { temp: 170, time: 30, unit: 'min/500g' },
        plancha: { temp: 'Media', time: 6, unit: 'min/lado' }
      },
      'cordero_pierna': {
        horno: { temp: 180, time: 25, unit: 'min/500g' }
      },
      'hamburguesa': {
        plancha: { temp: 'Alta', time: 4, unit: 'min/lado' },
        horno: { temp: 200, time: 15, unit: 'min total' }
      }
    },
    aves: {
      'pollo_entero': {
        horno: { temp: 180, time: 20, unit: 'min/500g', note: 'Verificar jugos claros' }
      },
      'pechuga_pollo': {
        plancha: { temp: 'Media', time: 6, unit: 'min/lado' },
        horno: { temp: 180, time: 20, unit: 'min total' }
      },
      'muslo_pollo': {
        horno: { temp: 200, time: 25, unit: 'min/500g' }
      },
      'pavo_entero': {
        horno: { temp: 165, time: 15, unit: 'min/500g' }
      }
    },
    pescados: {
      'salmon': {
        horno: { temp: 180, time: 12, unit: 'min/filete' },
        plancha: { temp: 'Media', time: 4, unit: 'min/lado' }
      },
      'merluza': {
        horno: { temp: 180, time: 15, unit: 'min total' },
        vapor: { time: 8, unit: 'min total' }
      },
      'atun': {
        plancha: { temp: 'Alta', time: 2, unit: 'min/lado', note: 'Sellado, interior rosado' }
      },
      'gambas': {
        plancha: { temp: 'Alta', time: 2, unit: 'min/lado' },
        hervido: { time: 3, unit: 'min total' }
      }
    },
    pasta: {
      'espaguetis': { hervido: { time: 10, unit: 'min' } },
      'macarrones': { hervido: { time: 12, unit: 'min' } },
      'penne': { hervido: { time: 11, unit: 'min' } },
      'lasana': { horno: { temp: 180, time: 30, unit: 'min' } },
      'raviolis': { hervido: { time: 5, unit: 'min' } }
    },
    arroz: {
      'arroz_blanco': { hervido: { time: 18, ratio: '1:2 arroz:agua', unit: 'min' } },
      'arroz_integral': { hervido: { time: 40, ratio: '1:2.5 arroz:agua', unit: 'min' } },
      'arroz_basmati': { hervido: { time: 15, ratio: '1:1.5 arroz:agua', unit: 'min' } },
      'arroz_bomba': { hervido: { time: 18, ratio: '1:3 arroz:agua', unit: 'min' } }
    },
    verduras: {
      'patatas': {
        horno: { temp: 200, time: 45, unit: 'min' },
        hervido: { time: 20, unit: 'min' }
      },
      'zanahorias': {
        hervido: { time: 15, unit: 'min' },
        vapor: { time: 12, unit: 'min' }
      },
      'brocoli': {
        vapor: { time: 7, unit: 'min' },
        hervido: { time: 5, unit: 'min' }
      },
      'esparragos': {
        plancha: { temp: 'Media', time: 5, unit: 'min' },
        vapor: { time: 6, unit: 'min' }
      },
      'calabacin': {
        plancha: { temp: 'Media', time: 4, unit: 'min/lado' },
        horno: { temp: 200, time: 20, unit: 'min' }
      }
    }
  };

  // Base de datos de sustitutos
  const substitutesDatabase: Record<IngredientCategory, Record<string, Substitute[]>> = {
    huevos: {
      '1 huevo': [
        { substitute: '1 plátano maduro machacado', ratio: '1:1', notes: 'Ideal para repostería, añade dulzor' },
        { substitute: '3 cucharadas de aquafaba', ratio: '1:1', notes: 'Líquido de garbanzos, perfecto para merengues' },
        { substitute: '1 cucharada de semillas de lino + 3 cucharadas de agua', ratio: '1:1', notes: 'Dejar reposar 5 minutos' },
        { substitute: '1/4 taza de puré de manzana', ratio: '1:1', notes: 'Reduce grasa, añade humedad' }
      ]
    },
    lacteos: {
      'leche de vaca (1 taza)': [
        { substitute: 'Leche de almendras', ratio: '1:1', notes: 'Sabor neutro, baja en calorías' },
        { substitute: 'Leche de soja', ratio: '1:1', notes: 'Alta en proteínas' },
        { substitute: 'Leche de avena', ratio: '1:1', notes: 'Cremosa, ideal para café' },
        { substitute: 'Leche de coco', ratio: '1:1', notes: 'Sabor tropical, muy cremosa' }
      ],
      'mantequilla (100g)': [
        { substitute: 'Aceite de oliva (80ml)', ratio: '100g:80ml', notes: 'Reduce cantidad en 20%' },
        { substitute: 'Aceite de coco (90ml)', ratio: '100g:90ml', notes: 'Textura similar, sabor suave' },
        { substitute: 'Puré de aguacate (100g)', ratio: '1:1', notes: 'Grasas saludables, color verdoso' },
        { substitute: 'Margarina vegana (100g)', ratio: '1:1', notes: 'Sustituto directo' }
      ],
      'yogur (1 taza)': [
        { substitute: 'Yogur de coco', ratio: '1:1', notes: 'Cremoso, sin lactosa' },
        { substitute: 'Yogur de soja', ratio: '1:1', notes: 'Alto en proteínas' },
        { substitute: 'Crema agria (3/4 taza)', ratio: '1:0.75', notes: 'Más ácido' }
      ]
    },
    harinas: {
      'harina de trigo (1 taza)': [
        { substitute: 'Harina de arroz (1 taza)', ratio: '1:1', notes: 'Sin gluten, textura ligera' },
        { substitute: 'Harina de almendra (1 taza)', ratio: '1:1', notes: 'Baja en carbohidratos, rica en proteínas' },
        { substitute: 'Harina de avena (1 taza + 2 cucharadas)', ratio: '1:1+', notes: 'Sin gluten, añade fibra' },
        { substitute: 'Mezcla sin gluten (1 taza)', ratio: '1:1', notes: 'Sustituto comercial directo' }
      ]
    },
    endulzantes: {
      'azúcar blanco (1 taza)': [
        { substitute: 'Miel (3/4 taza)', ratio: '1:0.75', notes: 'Reduce líquidos en 1/4 taza' },
        { substitute: 'Sirope de arce (3/4 taza)', ratio: '1:0.75', notes: 'Reduce líquidos en 3 cucharadas' },
        { substitute: 'Stevia (1 cucharadita)', ratio: '1 taza:1 cdta', notes: '200 veces más dulce' },
        { substitute: 'Azúcar de coco (1 taza)', ratio: '1:1', notes: 'Índice glucémico bajo' },
        { substitute: 'Dátiles machacados (1 taza)', ratio: '1:1', notes: 'Añade humedad y fibra' }
      ]
    },
    grasas: {
      'aceite vegetal (1 taza)': [
        { substitute: 'Aceite de oliva (1 taza)', ratio: '1:1', notes: 'Sabor más fuerte' },
        { substitute: 'Aceite de coco (1 taza)', ratio: '1:1', notes: 'Solidifica en frío' },
        { substitute: 'Puré de manzana (1 taza)', ratio: '1:1', notes: 'Reduce grasas, añade humedad' },
        { substitute: 'Yogur griego (1 taza)', ratio: '1:1', notes: 'Textura densa, reduce calorías' }
      ]
    }
  };

  // Funciones de conversión
  const convertVolume = (value: number, from: string, to: string): number => {
    const toMl: Record<string, number> = {
      ml: 1,
      litros: 1000,
      tazas: 240,
      cucharadas: 15,
      cucharaditas: 5
    };
    return (value * toMl[from]) / toMl[to];
  };

  const convertWeight = (value: number, from: string, to: string): number => {
    const toGrams: Record<string, number> = {
      gramos: 1,
      kg: 1000,
      onzas: 28.35,
      libras: 453.592
    };
    return (value * toGrams[from]) / toGrams[to];
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius = 0;
    if (from === 'celsius') {
      celsius = value;
    } else if (from === 'fahrenheit') {
      celsius = (value - 32) * 5 / 9;
    } else if (from === 'gas_mark') {
      celsius = (value * 14) + 121;
    }

    if (to === 'celsius') {
      return celsius;
    } else if (to === 'fahrenheit') {
      return (celsius * 9 / 5) + 32;
    } else if (to === 'gas_mark') {
      return (celsius - 121) / 14;
    }
    return 0;
  };

  const convertLength = (value: number, from: string, to: string): number => {
    const toCm: Record<string, number> = {
      cm: 1,
      pulgadas: 2.54
    };
    return (value * toCm[from]) / toCm[to];
  };

  // Inicializar unidades por defecto
  useEffect(() => {
    const units = unitsData[conversionType];
    if (units.length > 0) {
      setFromUnit(units[0].value);
      setToUnit(units[1]?.value || units[0].value);
    }
  }, [conversionType]);

  // Conversión automática
  useEffect(() => {
    if (!fromValue || !fromUnit || !toUnit) {
      setToValue('');
      setConversionResult('');
      return;
    }

    const value = parseFloat(fromValue);
    if (isNaN(value)) return;

    let result = 0;
    if (conversionType === 'volume') {
      result = convertVolume(value, fromUnit, toUnit);
    } else if (conversionType === 'weight') {
      result = convertWeight(value, fromUnit, toUnit);
    } else if (conversionType === 'temperature') {
      result = convertTemperature(value, fromUnit, toUnit);
    } else if (conversionType === 'length') {
      result = convertLength(value, fromUnit, toUnit);
    }

    setToValue(result.toLocaleString('es-ES', { maximumFractionDigits: 2 }));
    setConversionResult(`${value.toLocaleString('es-ES')} ${fromUnit} = ${result.toLocaleString('es-ES', { maximumFractionDigits: 2 })} ${toUnit}`);
  }, [fromValue, fromUnit, toUnit, conversionType]);

  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue.replace(/\./g, '').replace(',', '.'));
  };

  // Escalador de recetas
  const scaleRecipe = () => {
    const origServings = parseFloat(originalServings);
    const newServ = parseFloat(newServings);

    if (!origServings || !newServ || !ingredients) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const scaleFactor = newServ / origServings;
    const lines = ingredients.split('\n').filter(line => line.trim());

    let scaledHTML = '';
    const warnings: string[] = [];

    lines.forEach(line => {
      const parts = line.trim().match(/^([\d.,]+)\s*(\w+)\s+(.+)$/);

      if (parts) {
        const originalAmount = parseFloat(parts[1].replace(',', '.'));
        const unit = parts[2];
        const ingredient = parts[3];
        const newAmount = originalAmount * scaleFactor;

        // Alertas especiales
        if (ingredient.toLowerCase().includes('levadura') && scaleFactor > 2) {
          warnings.push('⚠️ Levadura: No duplicar proporcionalmente. Ajustar al gusto.');
        }
        if (ingredient.toLowerCase().includes('sal') && scaleFactor > 2) {
          warnings.push('⚠️ Sal: Aumentar con cuidado. Probar antes de añadir más.');
        }
        if (ingredient.toLowerCase().includes('huevo') && !Number.isInteger(newAmount)) {
          warnings.push(`⚠️ ${ingredient}: ${newAmount.toFixed(1)} huevos → Redondear a ${Math.round(newAmount)} o ajustar líquidos`);
        }

        scaledHTML += `
          <div class="${styles.ingredientItem}">
            <span class="${styles.ingredientOriginal}">${originalAmount.toLocaleString('es-ES')} ${unit} ${ingredient}</span>
            <span class="${styles.ingredientNew}">${newAmount.toLocaleString('es-ES', { maximumFractionDigits: 1 })} ${unit} ${ingredient}</span>
          </div>
        `;
      } else {
        scaledHTML += `<div class="${styles.ingredientItem}"><span>${line}</span></div>`;
      }
    });

    setScaledIngredients(scaledHTML);
    setScaleWarning(warnings.join('<br>'));
  };

  // Tiempos de cocción
  const calculateCookingTime = () => {
    const weight = parseFloat(foodWeight);

    if (!foodType || isNaN(weight)) {
      return;
    }

    const data = cookingDatabase[foodCategory]?.[foodType]?.[cookingMethod];

    if (!data) {
      setCookingTimeValue('Método no disponible para este alimento');
      setCookingTips('');
      return;
    }

    let timeText = '';

    if (data.unit.includes('/')) {
      const baseWeight = parseInt(data.unit.split('/')[1].replace('g', ''));
      const calculatedTime = (weight / baseWeight) * data.time;
      timeText = `${Math.round(calculatedTime)} minutos`;
    } else {
      timeText = `${data.time} ${data.unit}`;
    }

    setCookingTimeValue(timeText);

    let tipsHTML = '';
    if (data.temp) {
      tipsHTML += `<div class="${styles.alertSuccess}">🌡️ Temperatura: ${data.temp}${typeof data.temp === 'number' ? '°C' : ''}</div>`;
    }
    if (data.ratio) {
      tipsHTML += `<div class="${styles.alertSuccess}">💧 Proporción: ${data.ratio}</div>`;
    }
    if (data.note) {
      tipsHTML += `<div class="${styles.alertWarning}">💡 Consejo: ${data.note}</div>`;
    }

    setCookingTips(tipsHTML);
  };

  // Sustitutos de ingredientes
  const showSubstitutes = () => {
    if (!originalIngredient) return;

    const substitutes = substitutesDatabase[ingredientCategory]?.[originalIngredient];
    if (!substitutes) return;

    let html = '';

    substitutes.forEach((sub, index) => {
      html += `
        <div class="${styles.substituteItem}">
          <div class="${styles.substituteHeader}">
            <span class="${styles.tag}">${index + 1}</span>
            <strong class="${styles.substituteName}">${sub.substitute}</strong>
          </div>
          <div class="${styles.substituteInfo}">📊 Proporción: ${sub.ratio}</div>
          <div class="${styles.substituteNotes}">💡 ${sub.notes}</div>
        </div>
      `;
    });

    setSubstituteList(html);
  };

  // Actualizar foodType cuando cambie la categoría
  useEffect(() => {
    const foods = Object.keys(cookingDatabase[foodCategory] || {});
    if (foods.length > 0) {
      setFoodType(foods[0]);
    }
  }, [foodCategory]);

  // Actualizar originalIngredient cuando cambie la categoría
  useEffect(() => {
    const ingrs = Object.keys(substitutesDatabase[ingredientCategory] || {});
    if (ingrs.length > 0) {
      setOriginalIngredient(ingrs[0]);
    }
  }, [ingredientCategory]);

  return (
    <>
      <AnalyticsTracker appName="calculadora-cocina" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Calculadora de Cocina",
            "description": "Calculadora de cocina completa con conversor de unidades, escalador de recetas, tiempos de cocción y sustitutos de ingredientes",
            "url": "https://meskeia.com/beta/calculadora-cocina",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "author": {
              "@type": "Organization",
              "name": "meskeIA",
              "url": "https://meskeia.com"
            }
          })
        }}
      />

      <MeskeiaLogo />

      <div className={styles.container}>
        <h1>🍳 Calculadora de Cocina</h1>
        <p className={styles.subtitle}>Conversor de unidades, escalador de recetas y tiempos de cocción</p>

        {/* Pestañas de navegación */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'conversor' ? styles.active : ''}`}
            onClick={() => setActiveTab('conversor')}
          >
            📏 Conversor
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'escalador' ? styles.active : ''}`}
            onClick={() => setActiveTab('escalador')}
          >
            📊 Escalador
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'tiempos' ? styles.active : ''}`}
            onClick={() => setActiveTab('tiempos')}
          >
            ⏱️ Tiempos
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'sustitutos' ? styles.active : ''}`}
            onClick={() => setActiveTab('sustitutos')}
          >
            🔄 Sustitutos
          </button>
        </div>

        {/* TAB 1: Conversor de Unidades */}
        {activeTab === 'conversor' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <h2>📏 Conversor de Unidades</h2>

              <div className={styles.formGroup}>
                <label htmlFor="conversionType">Tipo de conversión:</label>
                <select
                  id="conversionType"
                  value={conversionType}
                  onChange={(e) => setConversionType(e.target.value as any)}
                >
                  <option value="volume">Volumen (ml, litros, tazas)</option>
                  <option value="weight">Peso (gramos, kg, onzas)</option>
                  <option value="temperature">Temperatura (°C, °F, Gas Mark)</option>
                  <option value="length">Longitud (cm, pulgadas)</option>
                </select>
              </div>

              <div className={styles.converterGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="fromValue">Cantidad:</label>
                  <input
                    type="number"
                    id="fromValue"
                    placeholder="Ingresa cantidad"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                  />
                  <label htmlFor="fromUnit" className={styles.srOnly}>Unidad origen</label>
                  <select
                    id="fromUnit"
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                  >
                    {unitsData[conversionType].map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>

                <button type="button" className={styles.swapButton} onClick={swapUnits} title="Intercambiar unidades">
                  ⇄
                </button>

                <div className={styles.formGroup}>
                  <label htmlFor="toValue">Resultado:</label>
                  <input
                    type="text"
                    id="toValue"
                    readOnly
                    value={toValue}
                  />
                  <label htmlFor="toUnit" className={styles.srOnly}>Unidad destino</label>
                  <select
                    id="toUnit"
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                  >
                    {unitsData[conversionType].map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {conversionResult && (
                <div className={`${styles.result} ${styles.show}`}>
                  <strong>Resultado:</strong>
                  <div className={styles.resultValue}>{conversionResult}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Escalador de Recetas */}
        {activeTab === 'escalador' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <h2>📊 Escalador de Recetas</h2>

              <div className={styles.twoColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="originalServings">Comensales originales:</label>
                  <input
                    type="number"
                    id="originalServings"
                    placeholder="Ej: 4"
                    min="1"
                    value={originalServings}
                    onChange={(e) => setOriginalServings(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newServings">Comensales nuevos:</label>
                  <input
                    type="number"
                    id="newServings"
                    placeholder="Ej: 8"
                    min="1"
                    value={newServings}
                    onChange={(e) => setNewServings(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ingredients">Lista de ingredientes (formato: cantidad unidad ingrediente):</label>
                <textarea
                  id="ingredients"
                  placeholder="Ejemplo:&#10;200 g harina&#10;100 ml leche&#10;2 unidades huevos&#10;50 g azúcar"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
              </div>

              <button type="button" className={styles.btnPrimary} onClick={scaleRecipe}>
                Escalar Receta
              </button>

              {scaleWarning && (
                <div
                  className={`${styles.alert} ${styles.alertWarning}`}
                  dangerouslySetInnerHTML={{ __html: scaleWarning }}
                />
              )}

              {scaledIngredients && (
                <div className={`${styles.result} ${styles.show}`}>
                  <h3>Ingredientes ajustados:</h3>
                  <div
                    className={styles.ingredientList}
                    dangerouslySetInnerHTML={{ __html: scaledIngredients }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Tiempos de Cocción */}
        {activeTab === 'tiempos' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <h2>⏱️ Calculadora de Tiempos de Cocción</h2>

              <div className={styles.formGroup}>
                <label htmlFor="foodCategory">Categoría:</label>
                <select
                  id="foodCategory"
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                >
                  <option value="carnes">Carnes</option>
                  <option value="aves">Aves</option>
                  <option value="pescados">Pescados y Mariscos</option>
                  <option value="pasta">Pasta</option>
                  <option value="arroz">Arroz</option>
                  <option value="verduras">Verduras</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="foodType">Tipo de alimento:</label>
                <select
                  id="foodType"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                >
                  {Object.keys(cookingDatabase[foodCategory] || {}).map(food => {
                    const displayName = food.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return <option key={food} value={food}>{displayName}</option>;
                  })}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cookingMethod">Método de cocción:</label>
                <select
                  id="cookingMethod"
                  value={cookingMethod}
                  onChange={(e) => setCookingMethod(e.target.value as CookingMethod)}
                >
                  <option value="horno">Horno</option>
                  <option value="plancha">Plancha/Sartén</option>
                  <option value="hervido">Hervido</option>
                  <option value="vapor">Vapor</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="foodWeight">Peso del alimento (gramos):</label>
                <input
                  type="number"
                  id="foodWeight"
                  placeholder="Ej: 500"
                  min="1"
                  value={foodWeight}
                  onChange={(e) => setFoodWeight(e.target.value)}
                />
              </div>

              <button type="button" className={styles.btnPrimary} onClick={calculateCookingTime}>
                Calcular Tiempo
              </button>

              {cookingTimeValue && (
                <div className={`${styles.result} ${styles.show}`}>
                  <strong>Tiempo de cocción:</strong>
                  <div className={styles.resultValue}>{cookingTimeValue}</div>
                  {cookingTips && (
                    <div dangerouslySetInnerHTML={{ __html: cookingTips }} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Sustitutos de Ingredientes */}
        {activeTab === 'sustitutos' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <h2>🔄 Sustitutos de Ingredientes</h2>

              <div className={styles.formGroup}>
                <label htmlFor="ingredientCategory">Categoría:</label>
                <select
                  id="ingredientCategory"
                  value={ingredientCategory}
                  onChange={(e) => setIngredientCategory(e.target.value as IngredientCategory)}
                >
                  <option value="huevos">Huevos</option>
                  <option value="lacteos">Lácteos</option>
                  <option value="harinas">Harinas</option>
                  <option value="endulzantes">Endulzantes</option>
                  <option value="grasas">Grasas y Aceites</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="originalIngredient">Ingrediente a sustituir:</label>
                <select
                  id="originalIngredient"
                  value={originalIngredient}
                  onChange={(e) => setOriginalIngredient(e.target.value)}
                >
                  {Object.keys(substitutesDatabase[ingredientCategory] || {}).map(ingr => (
                    <option key={ingr} value={ingr}>{ingr}</option>
                  ))}
                </select>
              </div>

              <button type="button" className={styles.btnPrimary} onClick={showSubstitutes}>
                Ver Sustitutos
              </button>

              {substituteList && (
                <div className={`${styles.result} ${styles.show}`}>
                  <h3>Opciones de sustitución:</h3>
                  <div dangerouslySetInnerHTML={{ __html: substituteList }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Secciones educativas - Siempre visibles */}
      <div className={styles.eduSection}>
        <h2>¿Cómo funciona esta calculadora de cocina?</h2>
        <p>Convierte unidades de medida culinarias, ajusta cantidades de recetas y calcula proporciones de ingredientes. Esencial para adaptar recetas y evitar errores de medición.</p>
        <ul>
          <li><strong>Conversión de unidades</strong>: Gramos ↔ mililitros, tazas ↔ gramos, cucharadas ↔ ml (según ingrediente)</li>
          <li><strong>Escalado de recetas</strong>: Multiplica o divide todos los ingredientes para ajustar porciones</li>
          <li><strong>Densidades por ingrediente</strong>: Conversiones precisas según densidad (harina ≠ azúcar ≠ agua)</li>
          <li><strong>Temperaturas</strong>: Convierte °C ↔ °F para hornos con diferentes sistemas</li>
          <li><strong>Equivalencias comunes</strong>: Biblioteca de medidas estándar (1 taza de harina = 120g, etc.)</li>
        </ul>
      </div>

      <div className={styles.eduSection}>
        <h2>Casos de uso prácticos</h2>
        <ul>
          <li><strong>Adaptar porciones</strong>: Receta para 4 personas, necesitas 8. Multiplica 250g harina × 2 = 500g automáticamente</li>
          <li><strong>Sin báscula</strong>: ¿Cuántas cucharadas son 50g de azúcar? Calcula equivalencia sin pesar</li>
          <li><strong>Recetas anglosajonas</strong>: Convierte "1 cup" a gramos o ml según ingrediente (leche vs harina vs arroz)</li>
          <li><strong>Hornear con precisión</strong>: Tu horno marca °F, la receta indica 180°C. Convierte a 356°F</li>
          <li><strong>Dietas específicas</strong>: Reduce sal 50% en receta manteniendo proporciones de otros ingredientes</li>
        </ul>
      </div>

      <Footer />
    </>
  );
}
